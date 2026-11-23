## 1.0.0

Scruter CMP for Flutter in a package of its own: `ScruterCMP`, the native consent sheet of Scruter CMP over the iOS
and Android modules, with the API it had in `scruter_flutter` 1.2.0 (`start`, `isGranted`, `whenReady`, `onChange`,
`choices`, `state`, `choice`, `consentId`, `showPreferences()`, `showIfNeeded()`, `consentModeSignals()`,
`requestTrackingIfGranted()`, `setLanguage`, `debug`, `debugReset()`, `forceShow`). Until 1.2.0 it shipped inside
`scruter_flutter`, behind `scruter: { cmp: true }` in the app's `pubspec.yaml`: take this package instead, and
`scruter_flutter` 1.3.0 or later beside it for Scruter Analytics. Guide: `README.md`.
