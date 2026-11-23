import 'package:flutter/material.dart';
import 'package:scruter_cmp_flutter/scruter_cmp_flutter.dart';

import 'analytics.dart';
import 'privacy.dart';

/// The local stub of the ingest for scripts/device-check.mjs; a real app leaves it out.
const _cmpEndpoint = String.fromEnvironment('SCRUTER_CMP_ENDPOINT');

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  // Scruter CMP first: the app's optional SDKs wait for its answer (README.md).
  ScruterCMP.debug = true;
  // Your app's code in Scruter CMP.
  await ScruterCMP.start(appId: 'EXMPL02', endpoint: _cmpEndpoint.isEmpty ? null : _cmpEndpoint);
  Partners.shared.wire();
  // Scruter Analytics, when the example takes it too (scripts/size.mjs): exempt from consent, it never waits.
  await startAnalytics();
  runApp(const ExampleApp());
}

class ExampleApp extends StatelessWidget {
  const ExampleApp({super.key});

  @override
  Widget build(BuildContext context) => MaterialApp(
        title: 'Atelier Mona',
        routes: {
          '/': (_) => const HomeScreen(),
          '/privacy': (_) => const PrivacyScreen(),
        },
      );
}

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) => Scaffold(
        appBar: AppBar(
          title: const Text('Atelier Mona'),
          actions: [
            TextButton(
              key: const ValueKey('privacy'),
              onPressed: () => Navigator.of(context).pushNamed('/privacy'),
              child: const Text('Privacy'),
            ),
          ],
        ),
        body: const Center(child: Text('Bowls, cups and plates, made by hand.')),
      );
}
