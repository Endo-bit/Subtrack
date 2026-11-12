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
  /// Receipt paper and ink: the widget reads like the receipt the app prints (components/ReceiptCard.tsx).
  static let paper = Color(red: 1.0, green: 0.973, blue: 0.949) // #FFF8F2
  static let ink = Color(red: 0.165, green: 0.102, blue: 0.078) // #2A1A14
  static let faded = Color(red: 0.165, green: 0.102, blue: 0.078).opacity(0.55)
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

/// A dashed rule like the tear lines on a till receipt.
private struct DashedRule: View {
  var body: some View {
    GeometryReader { geo in
      Path { p in
        p.move(to: CGPoint(x: 0, y: 0.5))
        p.addLine(to: CGPoint(x: geo.size.width, y: 0.5))
      }
      .stroke(Palette.faded, style: StrokeStyle(lineWidth: 1, dash: [3, 3]))
    }
    .frame(height: 1)
  }
}

/// "Netflix ...... $19.99" with the charge date underneath, in the receipt's monospaced type.
private struct ChargeRow: View {
  let charge: UpcomingCharge
  let compact: Bool

  var body: some View {
    VStack(alignment: .leading, spacing: 0) {
      HStack(alignment: .firstTextBaseline, spacing: 4) {
        Text(charge.name)
          .font(.system(size: compact ? 11 : 12, weight: .semibold, design: .monospaced))
          .foregroundColor(Palette.ink)
          .lineLimit(1)
        Spacer(minLength: 4)
        Text(charge.amount)
          .font(.system(size: compact ? 11 : 12, weight: .bold, design: .monospaced))
          .foregroundColor(Palette.ink)
          .lineLimit(1)
          .minimumScaleFactor(0.75)
      }
      Text(charge.dateLabel)
        .font(.system(size: compact ? 9 : 10, weight: .regular, design: .monospaced))
        .foregroundColor(Palette.faded)
        .lineLimit(1)
    }
  }
}

private struct SubTrackWidgetView: View {
  @Environment(.widgetFamily) private var family
  let payload: WidgetPayload

  private var compact: Bool { family == .systemSmall }
  /// The small widget has room for three rows under the header and the total.
  private var rows: [UpcomingCharge] { Array(payload.upcoming.prefix(compact ? 3 : 4)) }

  var body: some View {
    VStack(alignment: .leading, spacing: compact ? 4 : 6) {
      HStack(alignment: .firstTextBaseline) {
        Text("SUBSLIP")
          .font(.system(size: 10, weight: .heavy, design: .monospaced))
          .tracking(2)
          .foregroundColor(Palette.ink)
        Spacer(minLength: 4)
        Text(payload.totalLabel.uppercased())
          .font(.system(size: 8, weight: .semibold, design: .monospaced))
          .foregroundColor(Palette.faded)
          .lineLimit(1)
          .minimumScaleFactor(0.7)
      }
      DashedRule()

      if rows.isEmpty {
        Spacer(minLength: 0)
        Text("No upcoming charges")
          .font(.system(size: 11, weight: .medium, design: .monospaced))
          .foregroundColor(Palette.faded)
      } else {
        VStack(spacing: compact ? 4 : 5) {
          ForEach(rows) { charge in
            ChargeRow(charge: charge, compact: compact)
          }
        }
      }

      Spacer(minLength: 0)
      DashedRule()
      HStack(alignment: .firstTextBaseline) {
        Text("TOTAL")
          .font(.system(size: compact ? 11 : 12, weight: .heavy, design: .monospaced))
          .foregroundColor(Palette.ink)
        Spacer(minLength: 4)
        Text(payload.monthTotal)
          .font(.system(size: compact ? 17 : 20, weight: .heavy, design: .monospaced))
          .foregroundColor(Palette.accent)
          .lineLimit(1)
          .minimumScaleFactor(0.6)
      }
    }
    .frame(maxWidth: .infinity, alignment: .leading)
    .widgetContainerBackground(Palette.paper)
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
    completion(Timeline(entries: [Entry(date: now, payload: WidgetPayload.load())], policy: .after(nextMidnight)))
  }
}

struct SubTrackWidget: Widget {
  var body: some WidgetConfiguration {
    StaticConfiguration(kind: "SubTrackWidget", provider: Provider()) { entry in
      SubTrackWidgetView(payload: entry.payload)
    }
    .configurationDisplayName("Subslip")
    .description("This month's spend and your next charges, as a receipt.")
    .supportedFamilies([.systemSmall, .systemMedium])
  }
}

@main
struct SubTrackWidgetBundle: WidgetBundle {
  var body: some Widget {
    SubTrackWidget()
  }
}
