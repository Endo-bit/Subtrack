import { Language } from '@/types/subscription';

/**
 * The handful of services most people in each market actually pay for, offered as one-tap starts
 * on first launch and on the empty dashboard. Order is roughly by reach in that market. Ids must
 * exist in data/services.ts — anything missing is simply skipped by the grid.
 */
export const POPULAR_SERVICE_IDS: Record<Language, string[]> = {
  en: ['netflix', 'spotify', 'amazon-prime', 'youtube-premium', 'disney', 'apple-music', 'icloud', 'chatgpt'],
  de: ['netflix', 'spotify', 'amazon-prime', 'disney', 'youtube-premium', 'dazn-de', 'icloud', 'chatgpt'],
  fr: ['netflix', 'spotify', 'amazon-prime', 'canal-plus', 'disney', 'deezer', 'youtube-premium', 'chatgpt'],
  es: ['netflix', 'spotify', 'amazon-prime', 'disney', 'youtube-premium', 'hbo-max', 'icloud', 'chatgpt'],
};
