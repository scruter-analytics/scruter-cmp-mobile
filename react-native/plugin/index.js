'use strict';
// The Expo config plugin of Scruter CMP: an Expo app needs no native edit (docs/CMP-MOBILE.md §3.16).
//
//   "plugins": ["@scruter/react-native-cmp"]
//   "plugins": [["@scruter/react-native-cmp", { "trackingDescription": "To show you ads about what you liked." }]]
//
// "trackingDescription" is Info.plist's NSUserTrackingUsageDescription, for an app that asks Apple's tracking prompt
// after the CMP (`ScruterCMP.requestTrackingIfGranted()`). The plugin also raises the platforms' minimums to the
// module's (iOS 15, Android 7). Works with development builds and EAS Build. Expo Go has no way to load a native module.
const { createRunOncePlugin, withGradleProperties, withInfoPlist, withPodfileProperties } = require('@expo/config-plugins');

const pkg = require('../package.json');

const MIN_IOS = '15.0';
const MIN_ANDROID = 24;

function atLeast(current, min) {
  const [a = 0, b = 0] = String(current).split('.').map(Number);
  const [c = 0, d = 0] = min.split('.').map(Number);
  return a > c || (a === c && b >= d);
}

/**
 * Raises a minimum platform, never lowers it. Without a value the template's default holds, which newer Expo SDKs set
 * above ours: only the SDKs before 52 start lower than the module's minimum.
 */
function raised(current, min, expoSdk) {
  if (current === undefined) return Number.parseInt(expoSdk ?? '99', 10) < 52 ? min : undefined;
  return atLeast(current, min) ? undefined : min;
}

/** Info.plist: the text of Apple's tracking prompt, when the app asks it (docs/CMP-MOBILE.md §3.9). */
function setTrackingDescription(plist, text) {
  if (text) plist.NSUserTrackingUsageDescription = text;
  return plist;
}

function withScruterCMP(config, props = {}) {
  const tracking = props.trackingDescription;
  if (tracking !== undefined && (typeof tracking !== 'string' || !tracking.trim())) {
    throw new Error('[ScruterCMP] "trackingDescription" is the text of Apple\'s tracking prompt: a sentence');
  }
  let out = config;
  if (tracking) {
    out = withInfoPlist(out, (c) => {
      c.modResults = setTrackingDescription(c.modResults, tracking.trim());
      return c;
    });
  }
  out = withGradleProperties(out, (c) => {
    const entry = c.modResults.find((p) => p.type === 'property' && p.key === 'android.minSdkVersion');
    const value = raised(entry?.value, String(MIN_ANDROID), config.sdkVersion);
    if (value && entry) entry.value = value;
    else if (value) c.modResults.push({ type: 'property', key: 'android.minSdkVersion', value });
    return c;
  });
  out = withPodfileProperties(out, (c) => {
    const value = raised(c.modResults['ios.deploymentTarget'], MIN_IOS, config.sdkVersion);
    if (value) c.modResults['ios.deploymentTarget'] = value;
    return c;
  });
  return out;
}

module.exports = createRunOncePlugin(withScruterCMP, pkg.name, pkg.version);
module.exports.raised = raised;
module.exports.setTrackingDescription = setTrackingDescription;
