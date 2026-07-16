/**
 * Design System: Apple × Revolut
 *
 * Apple DESIGN.md:
 *   ink #1d1d1f · parchment #f5f5f7 · canvas #ffffff
 *   SF Pro Display 600 with negative letter-spacing on display sizes
 *   Body at 17px/400, headings at 600 (not 700/800)
 *   Rounded: pill=9999 · cards=18px · inputs=11px
 *
 * Revolut DESIGN.md:
 *   canvas-dark #000000 (true black) · surface-elevated #16181a
 *   Aeonik Pro 500 → system-ui 500/600 substitute
 *   Display lineHeight 1.0 with large negative letter-spacing
 *   Rounded: full=9999 · cards=20px · inputs=12px
 *
 * Combined for SubTrack:
 *   Brand orange replaces Apple blue and Revolut cobalt
 *   Light mode: Apple clean canvas · Dark mode: Revolut true black
 */
export const theme = {
  // ── Backgrounds ────────────────────────────────────────────────────────────
  cream: '#F5F5F7',         // Apple canvas-parchment
  creamDark: '#000000',     // Revolut canvas-dark (true black, not near-black)

  // ── Cards / Surfaces ───────────────────────────────────────────────────────
  card: '#FFFFFF',          // Apple canvas
  cardDark: '#1C1C1E',      // Apple dark grouped surface (close to Revolut surface-elevated)

  // ── Brand accent (SubTrack orange) ─────────────────────────────────────────
  accent: '#FF5C35',
  accentSoft: '#FFF1ED',
  accentMuted: '#FFBFAC',

  // ── Text ───────────────────────────────────────────────────────────────────
  text: '#1D1D1F',          // Apple near-black ink
  textMuted: '#8D969E',     // Revolut stone (replaces Apple's #7a7a7a)
  textOnAccent: '#FFFFFF',

  // ── Borders / Separators ───────────────────────────────────────────────────
  border: '#E2E2E7',                    // Revolut hairline-light
  borderDark: 'rgba(255,255,255,0.12)', // Revolut hairline-dark

  // ── Status ─────────────────────────────────────────────────────────────────
  success: '#30D158',       // Apple system green

  // ── Shadow ─────────────────────────────────────────────────────────────────
  shadow: '#000000',
} as const;

/**
 * Typography scale (Apple × Revolut mobile adaptation)
 * React Native uses numeric px, lineHeight as number.
 */
export const type = {
  // Revolut display-xl adapted: 500 weight, tight leading, negative tracking
  heroBalance: { fontSize: 56, fontWeight: '600' as const, letterSpacing: -2.5, lineHeight: 58 },
  // Apple display-md: 600 weight, -0.374px tracking
  displayMd:   { fontSize: 34, fontWeight: '600' as const, letterSpacing: -0.5, lineHeight: 40 },
  // Apple tagline: 600 weight, slight positive tracking
  sectionHead: { fontSize: 22, fontWeight: '600' as const, letterSpacing: -0.3, lineHeight: 28 },
  // Apple body-strong: 600 weight
  labelStrong: { fontSize: 17, fontWeight: '600' as const, letterSpacing: -0.2, lineHeight: 22 },
  // Apple body: 400 weight, -0.374px tracking
  body:        { fontSize: 16, fontWeight: '400' as const, letterSpacing: -0.1, lineHeight: 22 },
  // Apple caption-strong
  captionBold: { fontSize: 13, fontWeight: '600' as const, letterSpacing: 0,    lineHeight: 18 },
  // Apple caption
  caption:     { fontSize: 13, fontWeight: '400' as const, letterSpacing: 0,    lineHeight: 18 },
  // Revolut button-md: Inter 600
  button:      { fontSize: 16, fontWeight: '700' as const, letterSpacing: 0.1,  lineHeight: 20 },
} as const;
