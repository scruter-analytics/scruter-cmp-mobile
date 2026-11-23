// Copies the iOS module into the package at pack time: the pod ScruterReactNativeCMP compiles it itself, because
// CocoaPods trunk turns read-only on 2026-12-02 and a trunk pod could never receive a fix. `ios/sdk/` is generated;
// `../ios/Sources` stays the only source.
import { cpSync, existsSync, mkdirSync, readdirSync, rmSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const sources = join(root, '../ios/Sources');
const target = join(root, 'ios/sdk');
if (!existsSync(join(sources, 'ScruterCMP'))) throw new Error(`no iOS module at ${sources}`);
rmSync(target, { recursive: true, force: true });
mkdirSync(target, { recursive: true });
cpSync(join(sources, 'ScruterCMP'), join(target, 'ScruterCMP'), { recursive: true });
// The pod compiles the module and this package's Swift into one Swift module, where a file name may appear once.
const swift = (dir) =>
  readdirSync(dir).flatMap((f) => {
    const path = join(dir, f);
    if (path === target) return [];
    return statSync(path).isDirectory() ? swift(path) : f.endsWith('.swift') ? [f] : [];
  });
const names = [...swift(join(target, 'ScruterCMP')), ...swift(join(root, 'ios'))];
const twice = names.filter((n, i) => names.indexOf(n) !== i);
if (twice.length) throw new Error(`Swift file names used twice in one module: ${[...new Set(twice)].join(', ')}`);
console.log('iOS module copied to ios/sdk');
