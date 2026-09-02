import { requireOptionalNativeModule } from 'expo';

type SubtrackWidgetNativeModule = {
  /** Writes `json` into the shared App Group and asks WidgetKit to reload every timeline. */
  setData(appGroup: string, json: string): void;
  /** Reads the shared container back. Null when the App Group itself is unreachable. */
  getData(appGroup: string): string | null;
};

/**
 * Optional on purpose: this module only exists in a native iOS build. In Expo Go, on Android,
 * and on web `requireOptionalNativeModule` returns null rather than throwing, so callers can
 * treat widget updates as best-effort.
 */
const SubtrackWidget = requireOptionalNativeModule<SubtrackWidgetNativeModule>('SubtrackWidget');

export function setWidgetPayload(appGroup: string, json: string): void {
  SubtrackWidget?.setData(appGroup, json);
}

export function readWidgetPayload(appGroup: string): string | null {
  return SubtrackWidget?.getData(appGroup) ?? null;
}

export const isWidgetBridgeAvailable = SubtrackWidget !== null;
