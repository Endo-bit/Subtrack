import { File, Paths } from 'expo-file-system';
import * as DocumentPicker from 'expo-document-picker';
import * as Sharing from 'expo-sharing';
import { Strings } from '@/i18n/strings';
import { Subscription } from '@/types/subscription';
import { CurrencyCode } from '@/utils/currency';
import { monthly } from '@/utils/subscription';

function csvEscape(value: string): string {
  return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

export function subscriptionsToCsv(subscriptions: Subscription[], currency: CurrencyCode, t: Strings): string {
  const headers = [
    t.name,
    t.category,
    t.cycle,
    t.price,
    t.currency,
    t.csvMonthlyEquivalent,
    t.csvStarted,
    t.csvNextBilling,
    t.diagnosisCancelled,
  ];
  const rows = subscriptions.map((s) => [
    s.name,
    s.category,
    s.billingCycle,
    s.defaultPrice.toFixed(2),
    currency,
    monthly(s).toFixed(2),
    s.startedAt.slice(0, 10),
    s.nextBillingDate.slice(0, 10),
    s.isCancelled ? t.diagnosisYes : t.diagnosisNo,
  ]);
  return [headers, ...rows].map((row) => row.map((v) => csvEscape(String(v))).join(',')).join('\n');
}

async function shareTextFile(filename: string, contents: string, mimeType: string): Promise<void> {
  const file = new File(Paths.cache, filename);
  if (file.exists) file.delete();
  file.create();
  file.write(contents);
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(file.uri, { mimeType });
  }
}

export async function exportCsvFile(subscriptions: Subscription[], currency: CurrencyCode, t: Strings): Promise<void> {
  const csv = subscriptionsToCsv(subscriptions, currency, t);
  await shareTextFile(`subtrack-export-${Date.now()}.csv`, csv, 'text/csv');
}

export async function exportBackupFile(state: unknown): Promise<void> {
  await shareTextFile(`subtrack-backup-${Date.now()}.json`, JSON.stringify(state, null, 2), 'application/json');
}

/** Returns the picked file's raw text, or null if the user cancelled. */
export async function pickBackupFile(): Promise<string | null> {
  const result = await DocumentPicker.getDocumentAsync({
    type: 'application/json',
    copyToCacheDirectory: true,
  });
  if (result.canceled || !result.assets?.[0]) return null;
  const file = new File(result.assets[0].uri);
  return await file.text();
}
