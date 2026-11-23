# Example app

Scruter CMP in a React Native app: the native sheet at the first launch, a Privacy screen that shows the state, the
receipt and stand-ins for the third-party SDKs gated on the answer, and the settings entry. `android/` and `ios/` are
generated for the React Native version you choose, so that the same app runs on every version the package supports
(the CI runs 0.73 and the latest):

```sh
node setup.mjs                                  # the latest tested version, new architecture
node setup.mjs --rn 0.73.11 --arch old
cd ios && pod install && cd ..
npx react-native run-android                    # or run-ios
```

The Android module comes from your local Maven repository until it is on Maven Central:
`cd ../../android && ./gradlew :scruter-cmp:publishToMavenLocal`.

`setup.mjs --check` points the app at the local stub of the ingest that `../scripts/device-check.mjs` runs; the check
drives the app with [Maestro](https://maestro.dev) and validates every body against `../../protocol`.
`setup.mjs --analytics <scruter-mobile/react-native>` adds Scruter Analytics, as an app that takes both SDKs.
