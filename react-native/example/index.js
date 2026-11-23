import { AppRegistry, LogBox } from 'react-native';
import { ScruterCMP } from '@scruter/react-native-cmp';
import App from './src/App';
import { startAnalytics } from './src/analytics';
import { cmp } from './src/config';
import { wirePartners } from './src/partners';

// Scruter CMP first: the app's optional SDKs wait for its answer (README.md). The device check drives a debug build:
// no development overlay over the buttons it taps.
if (cmp.endpoint) {
  LogBox.ignoreAllLogs();
  // In Metro's log (the device check keeps it): the JavaScript thread is alive, every 10 s.
  let beat = 0;
  setInterval(() => console.log(`[example] alive ${(beat += 10)} s`), 10000);
}
ScruterCMP.debug = cmp.debug;
ScruterCMP.start({ appId: cmp.appId, endpoint: cmp.endpoint });
wirePartners();

// Scruter Analytics, when the example takes it too (setup.mjs --analytics): exempt from consent, it never waits.
startAnalytics();

AppRegistry.registerComponent('ScruterExample', () => App);
