const { withXcodeProject } = require('@expo/config-plugins');

/**
 * Keeps every app-extension target's version in step with the parent app.
 *
 * Apple rejects an upload whose extension CFBundleVersion differs from the containing app's, but
 * Xcode only emits it as a warning during signing — so the archive succeeds, the .ipa uploads,
 * and the failure surfaces much later as a submission that never becomes a build:
 *
 *   The CFBundleVersion of an app extension ('1') must match that of its
 *   containing parent app ('1.0.11').
 *
 * @bacons/apple-targets points the widget's Info.plist at $(CURRENT_PROJECT_VERSION) and
 * $(MARKETING_VERSION) but hardcodes those build settings to 1 / 1.0, and exposes no config key
 * for them. This copies the app's values onto every target whose bundle identifier sits under the
 * app's own — which is exactly what an app extension is.
 *
 * Must run after "@bacons/apple-targets" in the plugins array, since it edits the targets that
 * plugin generates.
 */
const withAppExtensionVersions = (config) =>
  withXcodeProject(config, (cfg) => {
    const marketingVersion = cfg.version;
    const currentProjectVersion = cfg.ios && cfg.ios.buildNumber;
    const appBundleId = cfg.ios && cfg.ios.bundleIdentifier;

    if (!marketingVersion || !currentProjectVersion || !appBundleId) {
      // Nothing safe to copy — leave the project alone rather than write a wrong version.
      return cfg;
    }

    const sections = cfg.modResults.pbxXCBuildConfigurationSection();
    const patched = [];

    for (const key of Object.keys(sections)) {
      if (key.endsWith('_comment')) continue;
      const settings = sections[key] && sections[key].buildSettings;
      if (!settings || !settings.PRODUCT_BUNDLE_IDENTIFIER) continue;

      const bundleId = String(settings.PRODUCT_BUNDLE_IDENTIFIER).replace(/^"|"$/g, '');
      // The app itself must keep the values EAS already resolved for it; only its children move.
      if (bundleId === appBundleId || !bundleId.startsWith(appBundleId + '.')) continue;

      settings.MARKETING_VERSION = `"${marketingVersion}"`;
      settings.CURRENT_PROJECT_VERSION = `"${currentProjectVersion}"`;
      patched.push(bundleId);
    }

    if (patched.length) {
      console.log(
        `[withAppExtensionVersions] synced ${marketingVersion} (${currentProjectVersion}) onto: ` +
          Array.from(new Set(patched)).join(', '),
      );
    }
    return cfg;
  });

module.exports = withAppExtensionVersions;
