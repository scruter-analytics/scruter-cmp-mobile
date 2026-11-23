# Scruter CMP for Flutter

The consent banner of [Scruter CMP](https://scruter.net/cmp) in your Flutter app, with a proof of every choice.
`scruter_cmp_flutter` is a thin layer over the native modules of [iOS](../ios/README.md) and
[Android](../android/README.md): the sheet is native (SwiftUI on iOS, the platform's views on Android), presented over your
app whatever its navigator (`Navigator`, go_router); the choice, the proofs and their queue live in the native modules.
Your Dart code reads the answer and starts your SDKs accordingly.

Flutter 3.22 and later, CocoaPods and Swift Package Manager. iOS 15, Android 7 (API 24). MIT. No IDFA, no GAID, no
device identifier: the only identifier is the random consent id the visitor gets as a receipt.

## Install

```sh
flutter pub add scruter_cmp_flutter
```

With CocoaPods, run `cd ios && pod install`; under Swift Package Manager, the plugin takes the package
`scruter-cmp-mobile`. Scruter Analytics is another package, [`scruter_flutter`](https://github.com/scruter-analytics/scruter-mobile):
an app that takes both adds both (Scruter Analytics 1.3.0 or later; until 1.2.0 the CMP shipped inside it, behind
`scruter: { cmp: true }` in the app's `pubspec.yaml`, a block that is no longer read: remove it, and an app that set
`analytics: false` removes `scruter_flutter`). Without the native module, `ScruterCMP.start` says so in the console and
grants nothing.

## Start

Your app's code is on its page in Scruter CMP, under Installation (`ATMONA02`). Start the CMP once, before `runApp`:

```dart
import 'package:scruter_cmp_flutter/scruter_cmp_flutter.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await ScruterCMP.start(appId: 'ATMONA02');
  ScruterCMP.whenReady(applyConsent);
  ScruterCMP.onChange(applyConsent);
  runApp(const AtelierMonaApp());
}
```

That is all it takes for the banner to show: at the first launch, the native sheet slides up over your app once its
first frame is drawn, and stays until the visitor chooses. Your app keeps working behind it, its optional SDKs off.

`start` returns once the native module has read the stored choice: `isGranted` answers from the next line. A hot restart
starts nothing again: the native module runs once per process, and the new isolate hears each change once.

## The settings entry first

An app has no floating button: **your app must offer a way to change or withdraw the choice**, as easily as it was
given. Add an entry such as « Gérer mes cookies », « Privacy choices » or « Confidentialité » to your settings:

```dart
TextButton(
  onPressed: () => ScruterCMP.showPreferences(),
  child: const Text('Privacy choices'),
)
```

The preferences list every purpose with its switch, show the visitor's consent id as a receipt, and withdraw in one
gesture. In a debug build, the native module warns when `showPreferences()` was never called in 10 launches after a
decision.

## Read the choice

Until a choice exists, every optional purpose is denied.

```dart
ScruterCMP.isGranted(ScruterPurpose.analytics); // synchronous; false until a choice exists
ScruterCMP.isGranted('crash_reports');          // your banner's own purposes, by key
ScruterCMP.state;                               // ScruterConsentState.ready, .needsDecision or .unavailable
ScruterCMP.choice;                              // ScruterChoice (consentId, decidedAt, granted, denied) or null
ScruterCMP.consentId;                           // the visitor's receipt, cns_…, or null

// Once a valid choice exists: now (a returning visitor), or after the decision.
final ready = ScruterCMP.whenReady(applyConsent);
// Every later change: the preferences, a withdrawal, the banner asking again.
final changes = ScruterCMP.onChange(applyConsent);
changes.cancel();
```

`ScruterCMP.choices` is a `Stream<ScruterChoice>`: the current choice, then every new one, for a `StreamBuilder`:

```dart
StreamBuilder<ScruterChoice>(
  stream: ScruterCMP.choices,
  builder: (context, snapshot) => AdSlot(personalised: snapshot.data?.isGranted('advertising') ?? false),
)
```

While the banner asks again (a new purpose, a revision, the period), `choice` is `null` and `isGranted` keeps the
answers of the purposes that did not change, until the new decision. The reads come from the snapshot the native module
sends at each change, without a round trip.

## Gate your SDKs

The CMP decides nothing for your SDKs: your code starts them according to the answer, in `applyConsent`. Turn each
SDK's automatic start off in its native configuration, as the [iOS](../ios/README.md#gate-your-sdks) and
[Android](../android/README.md) guides show, then:

```dart
import 'package:facebook_app_events/facebook_app_events.dart';
import 'package:firebase_analytics/firebase_analytics.dart';
import 'package:firebase_crashlytics/firebase_crashlytics.dart';
import 'package:scruter_cmp_flutter/scruter_cmp_flutter.dart';

Future<void> applyConsent(ScruterChoice choice) async {
  final analytics = choice.isGranted(ScruterPurpose.analytics);
  final ads = choice.isGranted(ScruterPurpose.advertising);

  await FirebaseAnalytics.instance.setAnalyticsCollectionEnabled(analytics);
  await FirebaseAnalytics.instance.setConsent(
    analyticsStorageConsentGranted: granted('analytics_storage'),
    adStorageConsentGranted: granted('ad_storage'),
    adUserDataConsentGranted: granted('ad_user_data'),
    adPersonalizationSignalsConsentGranted: granted('ad_personalization'),
  );
  await FirebaseCrashlytics.instance.setCrashlyticsCollectionEnabled(analytics);

  // Google Mobile Ads: without the IAB TCF, non-personalised ads unless advertising is granted
  // (AdRequest(nonPersonalizedAds: !ads) for each request).

  final meta = FacebookAppEvents();
  await meta.setAutoLogAppEventsEnabled(ads);
  await meta.setAdvertiserIdCollectionEnabled(ads);
}
```

The other SDKs of the console's installation page, with their Flutter packages:

| SDK | Purpose | When granted | On a refusal or a withdrawal |
|---|---|---|---|
| AppsFlyer (`appsflyer_sdk` 7) | advertising | `AppsFlyerSdk.instance.stop(false)`, then `start()` once its session is ready (`registerSessionReadyListener`) | `AppsFlyerSdk.instance.stop(true)` |
| Adjust (`adjust_sdk` 5) | advertising | `Adjust.initSdk(AdjustConfig(token, AdjustEnvironment.production))`, `Adjust.enable()` | `Adjust.disable()` |
| OneSignal (`onesignal_flutter` 5) | personalization | `OneSignal.consentRequired(true)` before `initialize`, then `OneSignal.consentGiven(true)` | `OneSignal.consentGiven(false)` |
| Sentry (`sentry_flutter`) | analytics | `SentryFlutter.init(…)` | `Sentry.close()` |
| Braze (`braze_plugin`) | personalization | `BrazePlugin().enableSDK()` | `BrazePlugin().disableSDK()` |
| Amplitude (`amplitude_flutter`) | analytics | `amplitude.setOptOut(false)` | `amplitude.setOptOut(true)` |
| Mixpanel (`mixpanel_flutter`, `optOutTrackingDefault: true`) | analytics | `mixpanel.optInTracking()` | `mixpanel.optOutTracking()` |

The purpose is the console's suggestion: use the key of your banner's purpose that covers the SDK. Scruter Analytics,
when your app uses it, is exempt and never gated.

## Google Consent Mode

`consentModeSignals()` gives the seven signals of the current choice with your banner's mapping (Scruter CMP ›
Bannière › Google Consent Mode): every signal denied until a choice exists but `security_storage`. For FlutterFire, as
above:

```dart
bool granted(String signal) => ScruterCMP.consentModeSignals()[signal] == ScruterConsentStatus.granted;
```

The proof records the signals sent as granted.

## App Tracking Transparency

The CMP comes first; Apple's tracking prompt only for a visitor who granted `advertising`:

```dart
ScruterCMP.whenReady((_) async {
  final status = await ScruterCMP.requestTrackingIfGranted();
  // ScruterTrackingStatus.authorized: your ad SDKs may read the IDFA.
});
```

It asks only when `advertising` is granted, Apple's status is `notDetermined` and no sheet is on screen; otherwise it
answers the current status without asking. The prompt's text is your `NSUserTrackingUsageDescription` in
`ios/Runner/Info.plist`; without it, nothing is asked. Android has no such prompt: `ScruterTrackingStatus.unsupported`.

## Showing the banner yourself

By default the sheet shows by itself. To show it after your onboarding (never after a paywall or a sign-in wall: the
banner comes first):

```dart
await ScruterCMP.start(appId: 'ATMONA02', presentation: ScruterPresentation.manual);
// … when the onboarding ends:
await ScruterCMP.showIfNeeded();
```

## Languages

The banner speaks the first of the device's preferred languages it was published in, else its default language. An
app with its own language setting overrides it with `ScruterCMP.setLanguage('de')` (`null` follows the device again).

## Debug

- `ScruterCMP.debug = true` logs the state and every decision: the native module's lines in Xcode's console or Logcat
  (tag `ScruterCMP`), this layer's with `debugPrint`.
- `ScruterCMP.debugReset()` forgets the choice in a debug build: the sheet shows again.
- `ScruterCMP.forceShow = true`, before `start`, shows the sheet at every opening (screenshots, end-to-end tests).
- A debug build (the simulator, a development-signed or debuggable app) marks its beacons as such: its proofs stay out
  of your registry, statistics and webhooks, and show for 24 hours in the installation check of Scruter CMP.

## Store declarations and privacy

What the modules store and send, the Apple privacy manifest (shipped in the pod and the Swift package) and the App Store
and Google Play answers are those of the native modules: [iOS](../ios/README.md#what-the-module-stores-and-sends),
[Android](../android/README.md). The Dart layer adds nothing: the beacons name it (`cv`: `flutter/1.0.0`).

## Size

Measured in CI on the example's release build (`scripts/size.mjs`, `.github/workflows/flutter.yml`, with Scruter
Analytics 1.3.0 beside it), the example built three times: Scruter Analytics alone, both packages, Scruter CMP alone;
each build carries only its packages' code (the CI looks for each SDK's own strings in it). Before the split (1.2.0, one
package), the CMP added 87 KB to the APK (142 KB of dex before compression) and 583 KB to the iOS plugin's framework;
the job's summary gives the figures of each run.

The Dart layer adds a few KB to the AOT snapshot; an app that never calls `ScruterCMP` loses it to tree shaking.

## Example app and tests

The example (`example/`) takes the CMP: its Privacy screen shows the state, the receipt, how many times `whenReady` and
`onChange` were heard, stand-ins for Firebase Analytics, Google Mobile Ads and an attribution SDK gated on the answer,
the settings entry and the debug reset. `flutter test` tests the Dart layer against a mocked channel; in CI
(`.github/workflows/flutter.yml`), the example runs under `flutter run` on an Android emulator and an iOS simulator
against the CMP's stub ingest (`scripts/device-check.mjs`, Maestro): first launch, decision, preferences, withdrawal, a
hot restart without a second listener or a second engine, a returning visitor, the debug reset, every beacon checked
against `protocol/schema`.
