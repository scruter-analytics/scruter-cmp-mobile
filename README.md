# Scruter CMP for mobile apps

The SDKs of [Scruter CMP](https://scruter.net/cmp) for apps: the consent banner you publish in Scruter CMP, drawn as a
native sheet (SwiftUI on iOS, the platform's views on Android), the visitor's choice kept in the app's own storage, a
proof of every decision in Scruter's registry, the re-ask rules of the web, Google Consent Mode, the IAB TCF v2.2
(CMP ID 528) and Apple's tracking prompt after the CMP. No IDFA, no GAID, no device identifier. MIT licence.

| Platform | Guide | Install |
|---|---|---|
| iOS 15+ | [ios/README.md](ios/README.md) | Swift Package Manager: `https://github.com/scruter-analytics/scruter-cmp-mobile`, product `ScruterCMP`; or CocoaPods: `pod 'ScruterCMP', :git => 'https://github.com/scruter-analytics/scruter-cmp-mobile.git', :tag => '1.0.0'` |
| Android 7+ (API 24) | [android/README.md](android/README.md) | Maven Central: `net.scruter.cmp:scruter-cmp` (and `net.scruter.cmp:scruter-cmp-compose` for Jetpack Compose) |
| React Native 0.73+ | [react-native/README.md](react-native/README.md) | npm: `@scruter/react-native-cmp` |
| Flutter 3.22+ | [flutter/README.md](flutter/README.md) | pub.dev: `scruter_cmp_flutter` |

Scruter CMP does not depend on [Scruter Analytics](https://github.com/scruter-analytics/scruter-mobile), nor Scruter
Analytics on it: an app takes one, the other or both, and the two build side by side (the CI builds an app with both).
Until 1.2.0, the CMP shipped inside the Analytics SDKs; the [changelog](CHANGELOG.md) says how to move.

The four SDKs share one version (`VERSION`), one protocol kit (`protocol/`: the schemas of the CMP's configuration and
beacons, golden bodies, the re-ask, Consent Mode and TCF vectors, the sheet's words in 33 languages) and one
[changelog](CHANGELOG.md). A tag `v<version>` publishes them (`.github/workflows/publish.yml`).
