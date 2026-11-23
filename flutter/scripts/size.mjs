#!/usr/bin/env node
// What Scruter CMP adds to the example's release build, and that an app takes Scruter Analytics and Scruter CMP side by
// side: builds the example three times, Scruter Analytics alone (scruter_flutter), both packages, Scruter CMP alone,
// and checks each build for each SDK's code. Scruter Analytics comes from a checkout of scruter-mobile's flutter/
// (1.3.0 or later, its ios/vendor synced): SCRUTER_ANALYTICS_FLUTTER=<dir>. Run scripts/sync-ios-sources.sh first for iOS.
//   node scripts/size.mjs android|ios
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const platform = process.argv[2];
const analyticsDir = process.env.SCRUTER_ANALYTICS_FLUTTER && resolve(process.env.SCRUTER_ANALYTICS_FLUTTER);
if (!analyticsDir || !existsSync(join(analyticsDir, 'pubspec.yaml'))) {
  console.error('SCRUTER_ANALYTICS_FLUTTER: a checkout of scruter-mobile/flutter');
  process.exit(2);
}
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const example = join(root, 'example');
const out = join(root, 'build');
mkdirSync(out, { recursive: true });
const run = (cmd, args, cwd = example) => execFileSync(cmd, args, { cwd, stdio: 'inherit' });

// What only each SDK's code holds: a path of its own protocol in the dex, a log line in the Swift binary (Swift keeps
// strings of 15 bytes or less inside the instructions).
const MARKERS =
  platform === 'android'
    ? { analytics: '/m/v1/batch', cmp: '/m/v1/cmp?a=' }
    : { analytics: 'event without a name: ignored', cmp: 'the CMP is off for this app (on: 0)' };
const VARIANTS = [
  { name: 'analytics', has: ['analytics'] },
  { name: 'both', has: ['analytics', 'cmp'] },
  { name: 'cmp', has: ['cmp'] },
];
const pubspec = join(example, 'pubspec.yaml');
const analytics = join(example, 'lib/analytics.dart');
const entry = join(example, 'lib/size_entry.dart');
const originalPubspec = readFileSync(pubspec, 'utf8');
const originalAnalytics = readFileSync(analytics, 'utf8');
const ANALYTICS_START = `import 'package:scruter_flutter/scruter_flutter.dart';

/// Scruter Analytics beside the CMP (scripts/size.mjs).
Future<void> startAnalytics() => Scruter.start(appId: 'ATMONA02');
`;
// One small app for the three builds, so that the difference is the SDKs' and nothing of the example's own screens:
// Scruter CMP's start and callbacks when the variant takes it, Scruter Analytics' start when it takes that.
const ENTRY = (cmp) => `import 'package:flutter/material.dart';
${cmp ? "import 'package:scruter_cmp_flutter/scruter_cmp_flutter.dart';\n" : ''}
import 'analytics.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
${cmp ? `  await ScruterCMP.start(appId: 'EXMPL02');
  ScruterCMP.whenReady((c) => debugPrint('\${c.isGranted(ScruterPurpose.analytics)} \${ScruterCMP.consentModeSignals()}'));
  ScruterCMP.onChange((c) => debugPrint(c.consentId));
` : ''}  await startAnalytics();
  runApp(const MaterialApp(home: Scaffold(body: Center(child: Text('Atelier Mona')))));
}
`;

function size(path) {
  const s = statSync(path);
  if (!s.isDirectory()) return s.size;
  return readdirSync(path).reduce((n, f) => n + size(join(path, f)), 0);
}

function files(path) {
  const s = statSync(path);
  if (!s.isDirectory()) return [path];
  return readdirSync(path).flatMap((f) => files(join(path, f)));
}

function android(target) {
  run('flutter', ['build', 'apk', '--release', '--target-platform', 'android-arm64', '--split-per-abi', '-t', target]);
  const apk = join(example, 'build/app/outputs/flutter-apk/app-arm64-v8a-release.apk');
  const dex = execFileSync('sh', ['-c', `unzip -p '${apk}' 'classes*.dex'`], { maxBuffer: 1 << 30 });
  return { bytes: statSync(apk).size, code: dex.length, blob: dex };
}

/** The plugins' frameworks (CocoaPods builds each pod as one), their binaries stripped as the App Store ships them. */
function ios(target) {
  // Flutter leaves the previous build's frameworks in Runner.app: a plugin the variant dropped would still be measured.
  rmSync(join(example, 'build/ios'), { recursive: true, force: true });
  run('flutter', ['build', 'ios', '--release', '--no-codesign', '-t', target]);
  const frameworks = join(example, 'build/ios/iphoneos/Runner.app/Frameworks');
  let bytes = 0;
  let code = 0;
  const blobs = [];
  for (const name of ['scruter_flutter', 'scruter_cmp_flutter']) {
    const framework = join(frameworks, `${name}.framework`);
    if (!existsSync(framework)) continue;
    blobs.push(...files(framework).map((f) => readFileSync(f)));
    const stripped = join(out, `${name}-stripped`);
    execFileSync('xcrun', ['strip', '-x', '-S', '-T', '-o', stripped, join(framework, name)]);
    code += statSync(stripped).size;
    bytes += size(framework) - statSync(join(framework, name)).size + statSync(stripped).size;
  }
  return { bytes, code, blob: Buffer.concat(blobs) };
}

const results = {};
const problems = [];
try {
  for (const v of VARIANTS) {
    let spec = originalPubspec;
    if (v.has.includes('analytics')) spec = spec.replace('dependencies:\n', `dependencies:\n  scruter_flutter:\n    path: ${analyticsDir}\n`);
    if (!v.has.includes('cmp')) spec = spec.replace(/\n {2}scruter_cmp_flutter:\n {4}path: \.\.\/\n/, '\n');
    writeFileSync(pubspec, spec);
    writeFileSync(analytics, v.has.includes('analytics') ? ANALYTICS_START : originalAnalytics);
    writeFileSync(entry, ENTRY(v.has.includes('cmp')));
    run('flutter', ['pub', 'get']);
    // Flutter runs pod install again only when its plugins change.
    if (platform === 'ios') run('pod', ['install'], join(example, 'ios'));
    const r = platform === 'android' ? android('lib/size_entry.dart') : ios('lib/size_entry.dart');
    results[v.name] = r;
    for (const [module, marker] of Object.entries(MARKERS)) {
      const has = r.blob.includes(Buffer.from(marker, 'latin1'));
      if (has !== v.has.includes(module)) problems.push(`${v.name}: the ${module} SDK is ${has ? 'carried' : 'missing'}`);
    }
  }
} finally {
  writeFileSync(pubspec, originalPubspec);
  writeFileSync(analytics, originalAnalytics);
  rmSync(entry, { force: true });
}
const kb = (n) => `${(n / 1024).toFixed(0)} KB`;
const lines = [
  `Flutter example, ${platform}, release${platform === 'android' ? ' (R8, arm64-v8a)' : ' (arm64, -Osize)'}:`,
  ...VARIANTS.map((v) => `  ${v.name.padEnd(9)} ${kb(results[v.name].bytes)}${platform === 'android' ? ` APK, ${kb(results[v.name].code)} of dex` : ' the plugins\' frameworks'}`),
  `  Scruter CMP adds ${kb(results.both.bytes - results.analytics.bytes)} to an app with Scruter Analytics` +
    (platform === 'android' ? ` (${kb(results.both.code - results.analytics.code)} of dex)` : ''),
];
console.log(lines.join('\n'));
writeFileSync(join(out, `size-${platform}.txt`), `${lines.join('\n')}\n`);
if (problems.length) {
  console.error(problems.join('\n'));
  process.exit(1);
}
