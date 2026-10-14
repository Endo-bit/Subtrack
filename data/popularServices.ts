import { Language } from '@/types/subscription';

/**
 * The handful of services most people in each market actually pay for, offered as one-tap starts
 * on first launch and on the empty dashboard. Order is roughly by reach in that market. Ids must
 * exist in data/services.ts — anything missing is simply skipped by the grid.
 */
const GLOBAL = ['netflix', 'spotify', 'amazon-prime', 'youtube-premium', 'disney', 'apple-music', 'icloud', 'chatgpt'];

export const POPULAR_SERVICE_IDS: Record<Language, string[]> = {
  en: GLOBAL,
  de: ['netflix', 'spotify', 'amazon-prime', 'disney', 'youtube-premium', 'dazn-de', 'icloud', 'chatgpt'],
  fr: ['netflix', 'spotify', 'amazon-prime', 'canal-plus', 'disney', 'deezer', 'youtube-premium', 'chatgpt'],
  es: ['netflix', 'spotify', 'amazon-prime', 'disney', 'youtube-premium', 'hbo-max', 'icloud', 'chatgpt'],
  it: ['netflix', 'spotify', 'amazon-prime', 'disney', 'youtube-premium', 'icloud', 'chatgpt', 'xbox-gp'],
  pt: GLOBAL,
  nl: ['netflix', 'spotify', 'amazon-prime', 'disney', 'hbo-max', 'youtube-premium', 'icloud', 'chatgpt'],
  sv: ['netflix', 'spotify', 'hbo-max', 'disney', 'youtube-premium', 'icloud', 'chatgpt', 'amazon-prime'],
  da: ['netflix', 'spotify', 'hbo-max', 'disney', 'youtube-premium', 'icloud', 'chatgpt', 'amazon-prime'],
  nb: ['netflix', 'spotify', 'hbo-max', 'disney', 'youtube-premium', 'icloud', 'chatgpt', 'amazon-prime'],
  fi: ['netflix', 'spotify', 'hbo-max', 'disney', 'youtube-premium', 'icloud', 'chatgpt', 'amazon-prime'],
  pl: ['netflix', 'spotify', 'amazon-prime', 'hbo-max', 'disney', 'youtube-premium', 'chatgpt', 'icloud'],
  cs: ['netflix', 'spotify', 'hbo-max', 'disney', 'youtube-premium', 'amazon-prime', 'chatgpt', 'icloud'],
  tr: ['netflix', 'spotify', 'youtube-premium', 'disney', 'amazon-prime', 'icloud', 'chatgpt', 'ps-plus'],
  ru: ['youtube-premium', 'spotify', 'netflix', 'apple-music', 'icloud', 'chatgpt', 'ps-plus', 'xbox-gp'],
  uk: ['netflix', 'youtube-premium', 'spotify', 'apple-music', 'icloud', 'chatgpt', 'disney', 'ps-plus'],
  ja: ['netflix', 'amazon-prime', 'youtube-premium', 'spotify', 'disney', 'apple-music', 'icloud', 'chatgpt'],
  ko: ['netflix', 'youtube-premium', 'disney', 'spotify', 'apple-music', 'icloud', 'chatgpt', 'amazon-prime'],
  'zh-Hans': ['netflix', 'youtube-premium', 'spotify', 'apple-music', 'icloud', 'chatgpt', 'disney', 'apple-tv'],
  'zh-Hant': ['netflix', 'youtube-premium', 'spotify', 'disney', 'apple-music', 'icloud', 'chatgpt', 'apple-tv'],
};
