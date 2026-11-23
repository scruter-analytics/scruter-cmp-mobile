package net.scruter.reactnative.cmp;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.module.model.ReactModuleInfo;
import com.facebook.react.module.model.ReactModuleInfoProvider;
import java.util.HashMap;
import java.util.Map;

/** Autolinked by React Native, for both architectures: the module {@code ScruterCMP}. */
public class ScruterCMPPackage extends PackageBase {
  @Nullable
  @Override
  public NativeModule getModule(@NonNull String name, @NonNull ReactApplicationContext context) {
    return ScruterCMPModule.NAME.equals(name) ? new ScruterCMPModule(context) : null;
  }

  @NonNull
  @Override
  public ReactModuleInfoProvider getReactModuleInfoProvider() {
    return () -> {
      Map<String, ReactModuleInfo> modules = new HashMap<>();
      modules.put(
          ScruterCMPModule.NAME,
          new ReactModuleInfo(ScruterCMPModule.NAME, "net.scruter.reactnative.cmp.ScruterCMPModule", false, false, false, true));
      return modules;
    };
  }
}
