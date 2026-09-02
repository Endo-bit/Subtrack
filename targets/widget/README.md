# SubTrack Home Screen widget

A WidgetKit extension showing this month's spend and the next three charges. Everything here is
plain text — the Swift is only compiled on the macOS GitHub runner during `eas build`, so the
widget can be developed and shipped entirely from Windows.

## How the pieces fit

| File | Role |
| --- | --- |
| `targets/widget/index.swift` | The widget itself: timeline provider and SwiftUI views. |
| `targets/widget/expo-target.config.js` | Declares the extension target for `@bacons/apple-targets` to generate at prebuild. |
| `modules/subtrack-widget/ios/SubtrackWidgetModule.swift` | Native bridge: writes the payload into the shared App Group and reloads timelines. |
| `modules/subtrack-widget/index.ts` | JS side of that bridge; a no-op where the native module isn't linked. |
| `utils/widget.ts` | Builds the payload and is called from `SubTrackContext` whenever subscriptions or currency change. |
| `app.json` | Holds `ios.appleTeamId` and the App Group entitlement that EAS provisions from. |

The widget runs in its own process with no access to AsyncStorage, the user's currency setting,
or FX rates — so the app writes **pre-formatted strings** into the App Group and the widget only
lays them out. Three places must agree on the App Group identifier
`group.com.cutedogstoryai.subtrack`:

- `ios.entitlements` in `app.json`
- `entitlements` in `expo-target.config.js`
- `WIDGET_APP_GROUP` in `utils/widget.ts`

A mismatch fails silently: `UserDefaults(suiteName:)` returns nil and the widget shows its
placeholder forever.

## One-time setup before the first build

**You do not need to click through the Apple Developer portal.** EAS reads the entitlements out
of the app config (`expo config --type introspect`, which works on Windows without a prebuild),
then creates the App Group and links it to both bundle identifiers for you — see
`eas-cli/build/credentials/ios/appstore/capabilityList.js`, which maps
`com.apple.security.application-groups` to Apple's `AppGroup` model and creates any identifier
that doesn't exist yet.

The widget target is registered for EAS code signing automatically too: `@bacons/apple-targets`
injects `extra.eas.build.experimental.ios.appExtensions` into the config, so EAS provisions the
extension's profile alongside the app's. The two identifiers involved are:

| Target | Bundle identifier |
| --- | --- |
| App | `com.cutedogstoryai.subtrack` |
| Widget (`targetName: SubTrackWidget`) | `com.cutedogstoryai.subtrack.widget` |

The widget's bundle identifier comes from this **directory name** (`targets/widget`), not from the
`name` field — renaming the folder renames the identifier and orphans the provisioning profile.

So the whole setup is one interactive command, run once from any machine:

```
eas credentials -p ios
```

It has to be interactive because eas-cli deliberately **skips capability syncing under App Store
Connect API-token auth** ("the current Apple authentication session is not using Cookies") — it
needs a real Apple ID login with 2FA to create capability identifiers. That's also why this can't
be done from CI, and why the release workflow can stay non-interactive afterwards: once the App
Group and both profiles exist on EAS, later builds just reuse them.

All of this is already configured: the Apple Team ID `Z824MPGK2X` lives in `ios.appleTeamId` in
`app.json` (it is not secret — it appears in every provisioning profile and in the shipped app's
metadata), which is what `@bacons/apple-targets` reads to set `DEVELOPMENT_TEAM` on the extension
target. No environment variable and no GitHub secret are involved.

### What a successful run looks like

This has already been run once against team `Z824MPGK2X`, so the App Group and both provisioning
profiles exist. It only needs repeating if capabilities change or a profile expires.

`eas credentials -p ios` -> Build Credentials -> production -> "All: Set up all the required
credentials to build your project" walks both targets in turn:

```
Setting up credentials for target SubTrackEU (com.cutedogstoryai.subtrack)
[ok] Synced capabilities: Enabled: App Groups
[ok] Synced capability identifiers: Created: group.com.cutedogstoryai.subtrack | Linked: group.com.cutedogstoryai.subtrack

Setting up credentials for target SubTrackWidget (com.cutedogstoryai.subtrack.widget)
[ok] Synced capabilities: Enabled: App Groups
[ok] Synced capability identifiers: No updates
```

**`No updates` on the widget target is correct, not a gap.** eas-cli only *creates* capability
identifiers that don't already exist, and the App Group was created seconds earlier while
processing the app target. Reading `capabilityIdentifiers.js` in isolation suggests the widget's
bundle ID therefore never gets its `appGroups` relationship set — that inference is wrong.
Confirmed in the Developer portal after this run: `com.cutedogstoryai.subtrack.widget` does have
`group.com.cutedogstoryai.subtrack` ticked. No manual portal step is required.

Two prompts to expect along the way:

- **"Provisioning profile is no longer valid"** on the app target. Enabling App Groups changes the
  bundle ID's capabilities, and Apple invalidates existing profiles when entitlements change.
  Answer **yes** to reusing the original profile: eas-cli repairs and reissues it in place
  (`configureAndAssignProfileAsync`), falling back to a new profile if that fails. Answering no
  deletes the old profile and issues a fresh one instead.
- **"Reuse this distribution certificate?"** on the widget target — **yes**. Both targets share a
  single distribution certificate, as the CLI states up front, and Apple caps how many an account
  may hold at once.

## Changing the widget

Editing `index.swift` is enough — the target is regenerated on every prebuild. If you add a field
to the payload, update all three of `utils/widget.ts` (`WidgetPayload`), the matching struct in
`index.swift`, and `utils/__tests__/widget.test.ts`.
