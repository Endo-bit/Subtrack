import ExpoModulesCore
import WidgetKit

/// Bridges the app's current numbers into the App Group container that the widget extension
/// reads from. The widget runs in a separate process with no access to AsyncStorage, so the
/// shared `UserDefaults` suite is the handoff point.
public class SubtrackWidgetModule: Module {
  /// Must match `payloadKey` in targets/widget/index.swift.
  private static let payloadKey = "subtrack.widget.payload"

  public func definition() -> ModuleDefinition {
    Name("SubtrackWidget")

    Function("setData") { (appGroup: String, json: String) in
      // A nil suite means the App Group isn't in this build's entitlements. Nothing useful to
      // do at runtime — failing quietly keeps a misconfigured provisioning profile from
      // crashing the app on every state change.
      guard let defaults = UserDefaults(suiteName: appGroup) else { return }
      defaults.set(json, forKey: Self.payloadKey)

      if #available(iOS 14.0, *) {
        WidgetCenter.shared.reloadAllTimelines()
      }
    }

    // Diagnostic: reads back whatever is in the shared container. If this returns nil the app
    // itself cannot reach the App Group (entitlement or identifier wrong), which is a different
    // fault from the widget extension not being able to read a payload that is genuinely there.
    Function("getData") { (appGroup: String) -> String? in
      guard let defaults = UserDefaults(suiteName: appGroup) else { return nil }
      return defaults.string(forKey: Self.payloadKey)
    }
  }
}
