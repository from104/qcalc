package plugins.ScreenOrientation;

import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "ScreenOrientation")
public class ScreenOrientationPlugin extends Plugin {

  @PluginMethod()
  public void orientation(PluginCall call) {
    call.resolve();
  }

  @PluginMethod()
  public void lock(PluginCall call) {
    call.resolve();
  }

  @PluginMethod()
  public void unlock(PluginCall call) {
    call.resolve();
  }
}