/**
 * Cheaper or free ways to get roughly the same thing, per catalogue service. The most-shared
 * money tips about subscriptions are exactly these ("your library card replaces three streaming
 * apps"), so the detail screen surfaces them next to the cancel link. Names are products, so
 * they need no translation; `kind` picks the localized label.
 */
export type AlternativeKind = 'free' | 'freeTier' | 'library' | 'family' | 'cheaper';

export type Alternative = { name: string; kind: AlternativeKind };

const LIBRARY_VIDEO: Alternative[] = [
  { name: 'Kanopy', kind: 'library' },
  { name: 'hoopla', kind: 'library' },
];

export const ALTERNATIVES: Record<string, Alternative[]> = {
  netflix: [{ name: 'Netflix Standard with ads', kind: 'cheaper' }, ...LIBRARY_VIDEO],
  disney: [{ name: 'Disney+ Standard with ads', kind: 'cheaper' }, ...LIBRARY_VIDEO],
  'hbo-max': [{ name: 'Max Basic with ads', kind: 'cheaper' }, ...LIBRARY_VIDEO],
  'apple-tv': [{ name: 'Apple One', kind: 'family' }, ...LIBRARY_VIDEO],
  'amazon-prime': [{ name: 'Prime Video only', kind: 'cheaper' }, ...LIBRARY_VIDEO],
  'youtube-premium': [{ name: 'YouTube Premium Family', kind: 'family' }, { name: 'YouTube Premium Lite', kind: 'cheaper' }],
  spotify: [{ name: 'Spotify Duo / Family', kind: 'family' }, { name: 'Spotify Free', kind: 'freeTier' }],
  'apple-music': [{ name: 'Apple Music Family', kind: 'family' }, { name: 'Apple One', kind: 'family' }],
  'deezer': [{ name: 'Deezer Free', kind: 'freeTier' }, { name: 'Deezer Family', kind: 'family' }],
  tidal: [{ name: 'Tidal Family', kind: 'family' }],
  audible: [{ name: 'Libby', kind: 'library' }, { name: 'BorrowBox', kind: 'library' }],
  'audible-de': [{ name: 'Onleihe', kind: 'library' }, { name: 'Libby', kind: 'library' }],
  chatgpt: [{ name: 'ChatGPT Free', kind: 'freeTier' }, { name: 'ChatGPT Go', kind: 'cheaper' }],
  claude: [{ name: 'Claude Free', kind: 'freeTier' }],
  gemini: [{ name: 'Gemini Free', kind: 'freeTier' }],
  perplexity: [{ name: 'Perplexity Free', kind: 'freeTier' }],
  'adobe-cc': [{ name: 'Affinity', kind: 'free' }, { name: 'Photopea', kind: 'free' }, { name: 'GIMP', kind: 'free' }],
  canva: [{ name: 'Canva Free', kind: 'freeTier' }],
  figma: [{ name: 'Figma Starter', kind: 'freeTier' }, { name: 'Penpot', kind: 'free' }],
  ms365: [{ name: 'LibreOffice', kind: 'free' }, { name: 'Google Docs', kind: 'free' }, { name: 'Microsoft 365 Family', kind: 'family' }],
  dropbox: [{ name: 'iCloud+', kind: 'cheaper' }, { name: 'Google One', kind: 'cheaper' }],
  icloud: [{ name: 'Apple One', kind: 'family' }],
  'google-one': [{ name: 'Google One Family sharing', kind: 'family' }],
  notion: [{ name: 'Notion Free', kind: 'freeTier' }, { name: 'Obsidian', kind: 'free' }],
  evernote: [{ name: 'Apple Notes', kind: 'free' }, { name: 'Obsidian', kind: 'free' }],
  todoist: [{ name: 'Todoist Free', kind: 'freeTier' }, { name: 'Apple Reminders', kind: 'free' }],
  '1password': [{ name: 'Apple Passwords', kind: 'free' }, { name: 'Bitwarden', kind: 'freeTier' }],
  nordvpn: [{ name: 'Proton VPN Free', kind: 'freeTier' }],
  expressvpn: [{ name: 'Proton VPN Free', kind: 'freeTier' }],
  surfshark: [{ name: 'Proton VPN Free', kind: 'freeTier' }],
  duolingo: [{ name: 'Duolingo Free', kind: 'freeTier' }, { name: 'Duolingo Family', kind: 'family' }],
  babbel: [{ name: 'Duolingo Free', kind: 'freeTier' }, { name: 'Mango Languages', kind: 'library' }],
  headspace: [{ name: 'Medito', kind: 'free' }, { name: 'Insight Timer', kind: 'freeTier' }],
  calm: [{ name: 'Medito', kind: 'free' }, { name: 'Insight Timer', kind: 'freeTier' }],
  'ps-plus': [{ name: 'PlayStation Plus Essential', kind: 'cheaper' }],
  'xbox-gp': [{ name: 'Game Pass Standard', kind: 'cheaper' }],
  'discord': [{ name: 'Nitro Basic', kind: 'cheaper' }],
  linkedin: [{ name: 'LinkedIn Free', kind: 'freeTier' }],
  zoom: [{ name: 'Google Meet', kind: 'free' }, { name: 'Jitsi Meet', kind: 'free' }],
  slack: [{ name: 'Slack Free', kind: 'freeTier' }],
  strava: [{ name: 'Strava Free', kind: 'freeTier' }],
  'github-copilot': [{ name: 'Copilot Free', kind: 'freeTier' }],
};
