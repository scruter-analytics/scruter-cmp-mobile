#import "ScruterCMPModule.h"

#if __has_include(<ScruterReactNativeCMP/ScruterReactNativeCMP-Swift.h>)
#import <ScruterReactNativeCMP/ScruterReactNativeCMP-Swift.h>
#else
#import "ScruterReactNativeCMP-Swift.h"
#endif

/// Scruter CMP's JavaScript API, for both architectures, over the iOS module compiled in this pod. Void methods run in
/// order on the main queue (`start` needs it); the reads run synchronously on the JS thread and take the module's
/// snapshot under its lock.
@implementation ScruterCMPModule

RCT_EXPORT_MODULE(ScruterCMP)

+ (BOOL)requiresMainQueueSetup {
  return YES;
}

- (dispatch_queue_t)methodQueue {
  return dispatch_get_main_queue();
}

- (NSArray<NSString *> *)supportedEvents {
  return @[ @"ScruterCMPChange" ];
}

// Synchronous, on the JS thread: the listener is set at once, the module starts on the main thread, and the snapshot
// answers from the stored choice meanwhile.
RCT_EXPORT_SYNCHRONOUS_TYPED_METHOD(NSNumber *, start : (NSDictionary *)options) {
  __weak ScruterCMPModule *weakSelf = self;
  return @([ScruterCMPHost start:options
                         listener:^(NSDictionary *snapshot, BOOL newChoice) {
                           [weakSelf sendEventWithName:@"ScruterCMPChange" body:@{@"snapshot" : snapshot, @"newChoice" : @(newChoice)}];
                         }]);
}

RCT_EXPORT_SYNCHRONOUS_TYPED_METHOD(NSDictionary *, snapshot) {
  return ScruterCMPHost.snapshot;
}

RCT_EXPORT_METHOD(showPreferences) {
  [ScruterCMPHost showPreferences];
}

RCT_EXPORT_SYNCHRONOUS_TYPED_METHOD(NSNumber *, showIfNeeded) {
  return @([ScruterCMPHost showIfNeeded]);
}

RCT_EXPORT_METHOD(requestTrackingIfGranted : (RCTPromiseResolveBlock)resolve reject : (RCTPromiseRejectBlock)reject) {
  [ScruterCMPHost requestTrackingIfGranted:^(NSString *status) {
    resolve(status);
  }];
}

RCT_EXPORT_METHOD(setLanguage : (NSString *)language) {
  [ScruterCMPHost setLanguage:language];
}

RCT_EXPORT_METHOD(setDebug : (BOOL)on) {
  [ScruterCMPHost setDebug:on];
}

RCT_EXPORT_METHOD(setForceShow : (BOOL)on) {
  [ScruterCMPHost setForceShow:on];
}

RCT_EXPORT_METHOD(debugReset) {
  [ScruterCMPHost debugReset];
}

#ifdef SCRUTER_CMP_TURBO
- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:(const facebook::react::ObjCTurboModule::InitParams &)params {
  return std::make_shared<facebook::react::NativeScruterCMPSpecJSI>(params);
}
#endif

@end
