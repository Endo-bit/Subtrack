import SwiftUI
import UIKit
import WidgetKit

// MARK: - Shared contract with the app

/// Must match `WIDGET_APP_GROUP` in utils/widget.ts.
private let appGroupIdentifier = "group.com.cutedogstoryai.subtrack"
/// Must match `payloadKey` in modules/subtrack-widget/ios/SubtrackWidgetModule.swift.
private let payloadKey = "subtrack.widget.payload"

/// Mirrors `WidgetPayload` in utils/widget.ts. Every money value arrives pre-formatted: the
/// widget process can't see the user's currency setting or the app's FX rates, so the app does
/// all formatting and this side only lays text out.
private struct UpcomingCharge: Decodable, Identifiable {
  let name: String
  let initials: String
  let color: String
  let dateLabel: String
  let amount: String
  let logo: String?

  var id: String { "\(name)-\(dateLabel)" }
}

private struct WidgetPayload: Decodable {
  let totalLabel: String
  let monthTotal: String
  let upcoming: [UpcomingCharge]

  /// Shown before the app has ever written a payload, and in the widget gallery preview.
  static let placeholder = WidgetPayload(totalLabel: "—", monthTotal: "—", upcoming: [])

  static func load() -> WidgetPayload {
    guard
      let defaults = UserDefaults(suiteName: appGroupIdentifier),
      let json = defaults.string(forKey: payloadKey),
      let data = json.data(using: .utf8),
      let decoded = try? JSONDecoder().decode(WidgetPayload.self, from: data)
    else {
      return .placeholder
    }
    return decoded
  }
}

// MARK: - Styling

private enum Palette {
  static let accent = Color(red: 1.0, green: 0.36, blue: 0.21) // #FF5C35
  static let surface = Color(red: 0.09, green: 0.07, blue: 0.06) // #17120F
  static let primaryText = Color.white
  static let secondaryText = Color.white.opacity(0.55)
}

private extension Color {
  /// Parses the `#RRGGBB` strings the app stores on each service. Falls back to the brand accent
  /// for anything unparseable rather than rendering an invisible swatch.
  init(hexString: String) {
    let cleaned = hexString.hasPrefix("#") ? String(hexString.dropFirst()) : hexString
    guard cleaned.count == 6, let value = UInt64(cleaned, radix: 16) else {
      self = Palette.accent
      return
    }
    self.init(
      red: Double((value & 0xFF0000) >> 16) / 255,
      green: Double((value & 0x00FF00) >> 8) / 255,
      blue: Double(value & 0x0000FF) / 255
    )
  }
}

private extension View {
  /// iOS 17 requires widgets to declare their background through `containerBackground`; on 16
  /// the same colour has to be applied the ordinary way or the widget renders transparent.
  @ViewBuilder
  func widgetContainerBackground<Background: View>(_ background: Background) -> some View {
    if #available(iOSApplicationExtension 17.0, *) {
      containerBackground(for: .widget) { background }
    } else {
      self.background(background)
    }
  }
}

// MARK: - Views

/// The service's real icon where one could be fetched, otherwise the same coloured initials chip
/// the app falls back to (see components/ServiceLogo.tsx, which makes the identical choice).
private struct ServiceBadge: View {
  let charge: UpcomingCharge
  let icon: Data?
  let size: CGFloat

  var body: some View {
    Group {
      if let icon, let image = UIImage(data: icon) {
        Image(uiImage: image)
          .resizable()
          .aspectRatio(contentMode: .fill)
      } else {
        Color(hexString: charge.color)
          .overlay(
            Text(charge.initials.prefix(2))
              .font(.system(size: size * 0.42, weight: .bold))
              .foregroundColor(.white)
          )
      }
    }
    .frame(width: size, height: size)
    .clipShape(RoundedRectangle(cornerRadius: size * 0.3, style: .continuous))
  }
}

private struct ChargeRow: View {
  let charge: UpcomingCharge
  let icon: Data?
  let compact: Bool

  var body: some View {
    HStack(spacing: compact ? 6 : 8) {
      ServiceBadge(charge: charge, icon: icon, size: compact ? 20 : 26)
      VStack(alignment: .leading, spacing: 0) {
        Text(charge.name)
          .font(.system(size: compact ? 11 : 12, weight: .semibold))
          .foregroundColor(Palette.primaryText)
          .lineLimit(1)
        Text(charge.dateLabel)
          .font(.system(size: compact ? 9 : 10, weight: .medium))
          .foregroundColor(Palette.secondaryText)
          .lineLimit(1)
      }
      Spacer(minLength: 2)
      Text(charge.amount)
        .font(.system(size: compact ? 11 : 12, weight: .bold))
        .foregroundColor(Palette.primaryText)
        .lineLimit(1)
        .minimumScaleFactor(0.8)
    }
  }
}

private struct SubTrackWidgetView: View {
  @Environment(\.widgetFamily) private var family
  let payload: WidgetPayload
  let icons: [String: Data]

  private var compact: Bool { family == .systemSmall }

  var body: some View {
    VStack(alignment: .leading, spacing: compact ? 6 : 10) {
      VStack(alignment: .leading, spacing: 1) {
        Text(payload.totalLabel.uppercased())
          .font(.system(size: 9, weight: .semibold))
          .tracking(0.6)
          .foregroundColor(Palette.secondaryText)
          .lineLimit(1)
        Text(payload.monthTotal)
          .font(.system(size: compact ? 22 : 28, weight: .bold, design: .rounded))
          .minimumScaleFactor(0.6)
          .lineLimit(1)
          .foregroundColor(Palette.primaryText)
      }

      if payload.upcoming.isEmpty {
        Spacer(minLength: 0)
        Text("No upcoming charges")
          .font(.system(size: 11, weight: .medium))
          .foregroundColor(Palette.secondaryText)
      } else {
        Rectangle()
          .fill(Color.white.opacity(0.12))
          .frame(height: 0.5)
        // Every upcoming charge on both sizes — small used to show only the first, which hid
        // the very information the widget exists for.
        VStack(spacing: compact ? 5 : 8) {
          ForEach(payload.upcoming) { charge in
            ChargeRow(charge: charge, icon: icons[charge.id], compact: compact)
          }
        }
      }

      Spacer(minLength: 0)
    }
    .frame(maxWidth: .infinity, alignment: .leading)
    .widgetContainerBackground(Palette.surface)
  }
}

// MARK: - Timeline

private struct Entry: TimelineEntry {
  let date: Date
  let payload: WidgetPayload
  let icons: [String: Data]
}

private struct Provider: TimelineProvider {
  /// Icons are the app's own remote logos. Fetching them here rather than shipping them through
  /// the App Group keeps the app side unchanged and lets URLCache do the caching; a slow or
  /// failed request just leaves the initials chip in place.
  private static func loadIcons(for payload: WidgetPayload) -> [String: Data] {
    let wanted = payload.upcoming.compactMap { charge -> (String, URL)? in
      guard let raw = charge.logo, let url = URL(string: raw) else { return nil }
      return (charge.id, url)
    }
    guard !wanted.isEmpty else { return [:] }

    var result: [String: Data] = [:]
    let lock = NSLock()
    let group = DispatchGroup()
    let config = URLSessionConfiguration.default
    config.requestCachePolicy = .returnCacheDataElseLoad
    let session = URLSession(configuration: config)

    for (id, url) in wanted {
      group.enter()
      session.dataTask(with: url) { data, _, _ in
        defer { group.leave() }
        guard let data, UIImage(data: data) != nil else { return }
        lock.lock()
        result[id] = data
        lock.unlock()
      }.resume()
    }

    // A widget must never hang on the network; render without icons if this takes too long.
    _ = group.wait(timeout: .now() + 6)
    lock.lock()
    defer { lock.unlock() }
    return result
  }

  func placeholder(in context: Context) -> Entry {
    Entry(date: Date(), payload: .placeholder, icons: [:])
  }

  func getSnapshot(in context: Context, completion: @escaping (Entry) -> Void) {
    completion(Entry(date: Date(), payload: WidgetPayload.load(), icons: [:]))
  }

  func getTimeline(in context: Context, completion: @escaping (Timeline<Entry>) -> Void) {
    // loadIcons blocks on a DispatchGroup, so it must not run on the calling thread.
    DispatchQueue.global(qos: .userInitiated).async {
      let now = Date()
      let payload = WidgetPayload.load()
      let icons = Self.loadIcons(for: payload)

      // The app reloads timelines itself whenever subscriptions change, so this refresh only has
      // to cover dates rolling over while the app is never opened. Next midnight is enough.
      let nextMidnight = Calendar.current.nextDate(
        after: now,
        matching: DateComponents(hour: 0, minute: 5),
        matchingPolicy: .nextTime
      ) ?? now.addingTimeInterval(3600)

      completion(
        Timeline(
          entries: [Entry(date: now, payload: payload, icons: icons)],
          policy: .after(nextMidnight)
        )
      )
    }
  }
}

struct SubTrackWidget: Widget {
  var body: some WidgetConfiguration {
    StaticConfiguration(kind: "SubTrackWidget", provider: Provider()) { entry in
      SubTrackWidgetView(payload: entry.payload, icons: entry.icons)
    }
    .configurationDisplayName("SubTrack")
    .description("This month's spend and your next charges.")
    .supportedFamilies([.systemSmall, .systemMedium])
  }
}

@main
struct SubTrackWidgetBundle: WidgetBundle {
  var body: some Widget {
    SubTrackWidget()
  }
}
