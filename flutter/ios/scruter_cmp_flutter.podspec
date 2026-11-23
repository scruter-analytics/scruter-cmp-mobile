Pod::Spec.new do |s|
  s.name             = 'scruter_cmp_flutter'
  s.version          = '1.0.0'
  s.summary          = 'Scruter CMP for Flutter: the native consent sheet of Scruter CMP and the proof of every choice.'
  s.homepage         = 'https://scruter.net/cmp'
  s.license          = { :type => 'MIT', :file => '../LICENSE' }
  s.author           = { '1618 Technologies (Scruter)' => 'contact@scruter.net' }
  s.source           = { :path => '.' }

  # The iOS module's sources travel with the plugin: a podspec cannot name a git source, and the CocoaPods trunk turns
  # read-only on 2026-12-02. Swift Package Manager reads Package.swift instead.
  raise 'ios/vendor is missing: run scripts/sync-ios-sources.sh' unless Dir.exist?(File.join(__dir__, 'vendor', 'ScruterCMP'))
  s.source_files     = 'scruter_cmp_flutter/Sources/scruter_cmp_flutter/**/*.swift', 'vendor/ScruterCMP/**/*.swift'
  s.resource_bundles = { 'ScruterCMP_Privacy' => ['vendor/ScruterCMP/PrivacyInfo.xcprivacy'] }
  s.frameworks       = 'Foundation', 'UIKit', 'SwiftUI', 'SafariServices', 'AVFoundation', 'Network'

  s.dependency 'Flutter'
  s.platform         = :ios, '15.0'
  s.swift_version    = '5.9'
  s.pod_target_xcconfig = { 'DEFINES_MODULE' => 'YES', 'SWIFT_OPTIMIZATION_LEVEL' => '-Osize' }
end
