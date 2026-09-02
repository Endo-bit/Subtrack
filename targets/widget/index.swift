import SwiftUI
import WidgetKit

// MARK: - Shared contract with the app

/// Must match `WIDGET_APP_GROUP` in utils/widget.ts.
private let appGroupIdentifier = "group.com.cutedogstoryai.subtrack"
/// Must match `payloadKey` in modules/subtrack-widget/ios/SubtrackWidgetModule.swift.
private let payloadKey = "subtrack.widget.payload"

/// Mirrors `WidgetPayload` in utils/widget.ts. Every money value arrives pre-formatted: the
/// widget process can't see the user's currency preference or the app's FX rates, so the app
/// does all formatting and this side only lays text out.
private struct UpcomingCharge: Decodable, Identifiable {
  let name: String
  let initials: String
  let color: String
  let dateLabel: String
  let amount: String

  var id: String { "\(name)-\(dateLabel)" }
}

private struct WidgetPayload: Decodable {
  let monthLabel: String
  let monthTotal: String
  let upcoming: [UpcomingCharge]

  /// Shown before the app has ever written a payload, and in the widget gallery preview.
  static let placeholder = WidgetPayload(
    monthLabel: "—",
    monthTotal: "—",
    upcoming: []
  )

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
  /// Parses the `#RRGGBB` strings the app stores on each service. Falls back to the brand
  /// accent for anything unparseable rather than rendering an invisible swatch.
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

private struct ServiceBadge: View {
  let initials: String
  let color: String

  var body: some View {
    RoundedRectangle(cornerRadius: 8, style: .continuous)
      .fill(Color(hexString: color))
      .frame(width: 26, height: 26)
      .overlay(
        Text(initials.prefix(2))
          .font(.system(size: 11, weight: .bold))
          .foregroundColor(.white)
      )
  }
}

private struct ChargeRow: View {
  let charge: UpcomingCharge

  var body: some View {
    HStack(spacing: 8) {
      ServiceBadge(initials: charge.initials, color: charge.color)
      VStack(alignment: .leading, spacing: 1) {
        Text(charge.name)
          .font(.system(size: 12, weight: .semibold))
          .foregroundColor(Palette.primaryText)
          .lineLimit(1)
        Text(charge.dateLabel)
          .font(.system(size: 10, weight: .medium))
          .foregroundColor(Palette.secondaryText)
      }
      Spacer(minLength: 4)
      Text(charge.amount)
        .font(.system(size: 12, weight: .bold))
        .foregroundColor(Palette.primaryText)
        .lineLimit(1)
    }
  }
}

private struct MonthTotal: View {
  let payload: WidgetPayload
  let compact: Bool

  var body: some View {
    VStack(alignment: .leading, spacing: 2) {
      Text(payload.monthLabel.uppercased())
        .font(.system(size: 9, weight: .semibold))
        .tracking(0.6)
        .foregroundColor(Palette.secondaryText)
      Text(payload.monthTotal)
        .font(.system(size: compact ? 24 : 28, weight: .bold, design: .rounded))
        .minimumScaleFactor(0.6)
        .lineLimit(1)
        .foregroundColor(Palette.primaryText)
    }
  }
}

private struct SubTrackWidgetView: View {
  @Environment(\.widgetFamily) private var family
  let payload: WidgetPayload

  /// Small only has room for the very next charge; medium fits the full top three.
  private var visibleCharges: [UpcomingCharge] {
    family == .systemSmall ? Array(payload.upcoming.prefix(1)) : payload.upcoming
  }

  var body: some View {
    VStack(alignment: .leading, spacing: family == .systemSmall ? 8 : 10) {
      MonthTotal(payload: payload, compact: family == .systemSmall)

      if visibleCharges.isEmpty {
        Spacer(minLength: 0)
        Text("No upcoming charges")
          .font(.system(size: 11, weight: .medium))
          .foregroundColor(Palette.secondaryText)
      } else {
        Rectangle()
          .fill(Color.white.opacity(0.12))
          .frame(height: 0.5)
        VStack(spacing: 8) {
          ForEach(visibleCharges) { ChargeRow(charge: $0) }
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
}

private struct Provider: TimelineProvider {
  func placeholder(in context: Context) -> Entry {
    Entry(date: Date(), payload: .placeholder)
  }

  func getSnapshot(in context: Context, completion: @escaping (Entry) -> Void) {
    completion(Entry(date: Date(), payload: WidgetPayload.load()))
  }

  func getTimeline(in context: Context, completion: @escaping (Timeline<Entry>) -> Void) {
    let now = Date()
    // The app reloads timelines itself whenever subscriptions change, so this refresh only has
    // to cover dates rolling over while the app is never opened. Next midnight is enough.
    let nextMidnight = Calendar.current.nextDate(
      after: now,
      matching: DateComponents(hour: 0, minute: 5),
      matchingPolicy: .nextTime
    ) ?? now.addingTimeInterval(3600)

    completion(
      Timeline(
        entries: [Entry(date: now, payload: WidgetPayload.load())],
        policy: .after(nextMidnight)
      )
    )
  }
}

struct SubTrackWidget: Widget {
  var body: some WidgetConfiguration {
    StaticConfiguration(kind: "SubTrackWidget", provider: Provider()) { entry in
      SubTrackWidgetView(payload: entry.payload)
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
