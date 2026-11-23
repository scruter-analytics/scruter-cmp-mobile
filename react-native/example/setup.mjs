#!/usr/bin/env node
// Generates the example's project for a React Native version: `android/`, `ios/`, the JavaScript toolchain, then wires
// Scruter CMP in as an app would (the packed npm package, autolinking, the app's Gradle and CocoaPods settings).
//   node setup.mjs [--rn 0.88.1] [--arch new|old] [--check] [--analytics <dir>]
// `--analytics <dir>` adds Scruter Analytics from a checkout of @scruter/react-native (scruter-mobile's react-native/,
// 1.3.0 or later), packed the same way: an app that takes both SDKs.
import { execFileSync } from 'node:child_process';
import { cpSync, existsSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const pkg = resolve(here, '..');
const argv = process.argv.slice(2);
const opt = (name, fallback) => {
  const i = argv.indexOf(`--${name}`);
  return i >= 0 ? argv[i + 1] : fallback;
};
const flag = (name) => argv.includes(`--${name}`);
const rn = opt('rn', '0.88.1');
const arch = opt('arch', 'new');
const check = flag('check');
const analytics = opt('analytics', null) && resolve(opt('analytics'));
const minor = Number(rn.split('.')[1]);
const CMP_APP_ID = 'EXMPL02';
const ANALYTICS_APP_ID = 'EXAMPLE1';

const run = (cmd, args, cwd = here) => execFileSync(cmd, args, { cwd, stdio: 'inherit' });
const edit = (file, change) => {
  const before = readFileSync(file, 'utf8');
  const after = change(before);
  if (after === before) throw new Error(`nothing changed in ${file}`);
  writeFileSync(file, after);
};
/** `npm pack` of a package directory into the example: its tarball's name. */
const pack = (dir) => {
  const before = new Set(readdirSync(here).filter((f) => f.endsWith('.tgz')));
  run('npm', ['ci', '--no-audit', '--no-fund'], dir);
  run('npm', ['pack', '--pack-destination', here], dir);
  return readdirSync(here).find((f) => f.endsWith('.tgz') && !before.has(f));
};

// 1. A fresh project of that version.
const work = mkdtempSync(join(tmpdir(), 'scruter-cmp-example-'));
run(
  'npx',
  ['--yes', '@react-native-community/cli@latest', 'init', 'ScruterExample', '--version', rn, '--package-name',
    'net.scruter.rnexample', '--skip-install', '--skip-git-init', '--install-pods', 'false'],
  work,
);
const fresh = join(work, 'ScruterExample');
for (const name of ['android', 'ios', 'vendor', 'node_modules', 'Gemfile.lock', 'react-native.config.js']) {
  rmSync(join(here, name), { recursive: true, force: true });
}
for (const f of readdirSync(here).filter((f) => f.endsWith('.tgz'))) rmSync(join(here, f));
for (const name of ['android', 'ios', 'Gemfile', 'babel.config.js', 'metro.config.js', 'tsconfig.json', 'package.json']) {
  if (existsSync(join(fresh, name))) cpSync(join(fresh, name), join(here, name), { recursive: true });
}
rmSync(work, { recursive: true, force: true });

// 2. The dependencies: the packages as npm would install them, and a navigation that fits that version.
const cmpTarball = pack(pkg);
const analyticsTarball = analytics ? pack(analytics) : null;
const navigation =
  minor >= 76
    ? {
        '@react-navigation/native': '7.5.1',
        '@react-navigation/native-stack': '7.21.0',
        'react-native-screens': minor >= 82 ? '4.30.1' : '4.16.0',
        'react-native-safe-area-context': minor >= 82 ? '5.11.1' : '5.6.2',
      }
    : {
        '@react-navigation/native': '6.1.18',
        '@react-navigation/native-stack': '6.11.0',
        'react-native-screens': '3.29.0',
        'react-native-safe-area-context': '4.8.2',
      };
edit(join(here, 'package.json'), (text) => {
  const p = JSON.parse(text);
  p.name = 'scruter-cmp-example';
  p.private = true;
  p.dependencies = {
    ...p.dependencies,
    ...navigation,
    '@scruter/react-native-cmp': `file:${cmpTarball}`,
    ...(analyticsTarball ? { '@scruter/react-native': `file:${analyticsTarball}` } : {}),
  };
  return `${JSON.stringify(p, null, 2)}\n`;
});
run('npm', ['install', '--no-audit', '--no-fund', '--legacy-peer-deps']);

// 3. The app's configuration.
writeFileSync(
  join(here, 'src/config.ts'),
  `/** Scruter CMP: the app's code, and the local stub of the ingest for the device check (setup.mjs --check). */
export const cmp: { appId: string; endpoint?: string; debug: boolean } = { appId: '${CMP_APP_ID}', debug: true${
    check ? ", endpoint: 'http://127.0.0.1:8765'" : ''
  } };
`,
);
writeFileSync(
  join(here, 'src/analytics.ts'),
  analytics
    ? `import { Scruter } from '@scruter/react-native';

/** Scruter Analytics beside the CMP (setup.mjs --analytics). */
export function startAnalytics() {
  Scruter.start({ appId: '${ANALYTICS_APP_ID}', debug: __DEV__ });
}
`
    : `/** Without Scruter Analytics (setup.mjs --analytics adds it). */
export function startAnalytics() {}
`,
);

// 4. Android, as the guide says, plus R8 on: what a release build ships.
const gradle = join(here, 'android/app/build.gradle');
edit(gradle, (t) => {
  const r8 = t.replace(/def enableProguardInReleaseBuilds = false/, 'def enableProguardInReleaseBuilds = true');
  return analytics
    ? r8.replace(/defaultConfig \{/, `defaultConfig {\n        manifestPlaceholders += [scruterAppId: "${ANALYTICS_APP_ID.toLowerCase()}"]`)
    : r8;
});
edit(join(here, 'android/build.gradle'), (t) =>
  t.replace(/minSdkVersion = \d+/, 'minSdkVersion = 24').concat('\nallprojects {\n    repositories {\n        mavenLocal()\n    }\n}\n'),
);
edit(join(here, 'android/gradle.properties'), (t) =>
  /newArchEnabled=/.test(t) ? t.replace(/newArchEnabled=\w+/, `newArchEnabled=${arch === 'new'}`).replace(/\s*$/, '\n# set by setup.mjs\n') : `${t}\nnewArchEnabled=${arch === 'new'}\n`,
);
if (check) {
  edit(join(here, 'android/app/src/main/AndroidManifest.xml'), (t) =>
    t.replace('android:usesCleartextTraffic="${usesCleartextTraffic}"', 'android:usesCleartextTraffic="true"').replace(/<application\n/, '<application\n      android:networkSecurityConfig="@xml/scruter_check"\n'),
  );
  const xml = join(here, 'android/app/src/main/res/xml');
  execFileSync('mkdir', ['-p', xml]);
  writeFileSync(join(xml, 'scruter_check.xml'), '<network-security-config><base-config cleartextTrafficPermitted="true" /></network-security-config>\n');
}

// 5. iOS, as the guide says: Apple's tracking prompt after the CMP (README.md, ATT) needs its text.
edit(join(here, 'ios/Podfile'), (t) => t.replace(/platform :ios, .*/, "platform :ios, '15.1'"));
const plist = join(here, 'ios/ScruterExample/Info.plist');
edit(plist, (t) =>
  t.replace('</dict>\n</plist>', '\t<key>NSUserTrackingUsageDescription</key>\n\t<string>To show you ads about the bowls you liked.</string>\n</dict>\n</plist>'),
);
if (analytics) {
  edit(plist, (t) =>
    t.replace(
      '</dict>\n</plist>',
      `\t<key>CFBundleURLTypes</key>\n\t<array><dict><key>CFBundleURLSchemes</key><array><string>scruter-${ANALYTICS_APP_ID.toLowerCase()}</string></array></dict></array>\n</dict>\n</plist>`,
    ),
  );
}
if (check) {
  edit(plist, (t) => t.replace(/<key>NSAppTransportSecurity<\/key>\s*<dict>/, '<key>NSAppTransportSecurity</key>\n\t<dict>\n\t\t<key>NSAllowsArbitraryLoads</key>\n\t\t<true/>'));
}
console.log(`\nReady: React Native ${rn}, ${arch} architecture${check ? ', device check' : ''}${analytics ? ', with Scruter Analytics' : ''}.`);
