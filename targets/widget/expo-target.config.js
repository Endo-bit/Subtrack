/**
 * Widget extension target, generated into the Xcode project at prebuild time by
 * @bacons/apple-targets. Nothing here needs macOS — the Swift in this folder is only compiled
 * on the CI runner during `eas build`.
 *
 * The App Group must match `WIDGET_APP_GROUP` in utils/widget.ts and the `ios.entitlements`
 * entry in app.json, and must exist in the Apple Developer portal before a build can be signed.
 *
 * @type {import('@bacons/apple-targets/app.plugin').Config}
 */
module.exports = {
  type: 'widget',
  name: 'SubTrackWidget',
  icon: '../../assets/images/icon.png',
  // iOS 16 rather than 17 so the widget still installs on older devices; the one iOS 17-only
  // API used (containerBackground) is behind an availability check in index.swift.
  deploymentTarget: '16.0',
  entitlements: {
    'com.apple.security.application-groups': ['group.com.cutedogstoryai.subtrack'],
  },
};
