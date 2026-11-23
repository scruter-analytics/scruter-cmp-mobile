# Changelog

One version for Scruter CMP's four SDKs. The GitHub release of a version carries its section below.

## 1.0.0

Scruter CMP for apps in SDKs of its own, in this repository and with its own versions: the Swift package
`scruter-cmp-mobile` (product `ScruterCMP`) and the pod `ScruterCMP` from this repository, `net.scruter.cmp:scruter-cmp`
and `net.scruter.cmp:scruter-cmp-compose` on Maven Central, `@scruter/react-native-cmp` on npm and `scruter_cmp_flutter`
on pub.dev. Until 1.2.0 they shipped inside Scruter Analytics' SDKs
([scruter-mobile](https://github.com/scruter-analytics/scruter-mobile)): the Swift Package product and pod `ScruterCMP`
of that repository, `net.scruter:scruter-cmp` and `net.scruter:scruter-cmp-compose`, and the CMP in
`@scruter/react-native` and `scruter_flutter` behind a `scruter: { cmp: true }` key of the app. This version is what
those were at 1.2.0, under the new names: the native sheet on iOS (SwiftUI) and Android (the platform's views), the
choice in the app's storage, the proofs and their queue, the web's re-ask rules, Google Consent Mode, Apple's tracking
prompt after the CMP, the detected SDKs, the IAB TCF v2.2 (CMP ID 528) with Google's Additional Consent string, and the
React Native and Flutter APIs (`ScruterCMP.start`, `isGranted`, `whenReady`, `onChange`, `useConsentChoice()`, the Dart
`choices` stream…). The Kotlin and Swift APIs do not change: the packages are still `net.scruter.cmp…`, the module
`ScruterCMP`.

Moving from 1.2.0: on iOS, the package `scruter-cmp-mobile` from 1.0.0 (or the pod `ScruterCMP` from this repository) in
place of the product `ScruterCMP` of `scruter-mobile`; on Android, `net.scruter.cmp:scruter-cmp:1.0.0` in place of
`net.scruter:scruter-cmp:1.2.0`; in React Native and Flutter, `@scruter/react-native-cmp` or `scruter_cmp_flutter`,
without the `scruter` key, and Scruter Analytics' package at 1.3.0 or later when the app takes it too. The beacons name
these versions (`cv`: `ios/1.0.0`, `react_native/1.0.0`…).
