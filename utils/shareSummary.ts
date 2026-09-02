import { Subscription } from '@/types/subscription';
import { DiagnosisRecord } from '@/utils/diagnosis';
import { ConvertFn, dailyCost, monthly } from '@/utils/subscription';

/** Enough rows to feel substantial without spilling past a screenshot-friendly aspect ratio. */
export const MAX_SHARE_RESULT_ROWS = 5;

export type ShareSummaryData = {
  monthlyTotal: number;
  annualTotal: number;
  activeCount: number;
  dailyTotal: number;
  /** The most recent check-in run only, newest-first. */
  results: DiagnosisRecord[];
};

/**
 * Everything worth sharing, derived in one place so the on-screen preview and the captured
 * image can never disagree. `results` covers only the latest check-in run — a share is a
 * snapshot of "how did I just do", not the full history.
 */
export function buildShareSummary(
  subscriptions: Subscription[],
  diagnosisHistory: DiagnosisRecord[],
  convert?: ConvertFn,
): ShareSummaryData {
  const active = subscriptions.filter((s) => !s.isCancelled);
  const monthlyTotal = active.reduce((sum, s) => sum + monthly(s, convert), 0);

  const newest = diagnosisHistory[0];
  const results = newest
    ? diagnosisHistory
        .filter(
          (r) => new Date(r.createdAt).toDateString() === new Date(newest.createdAt).toDateString(),
        )
        .slice(0, MAX_SHARE_RESULT_ROWS)
    : [];

  return {
    monthlyTotal,
    annualTotal: monthlyTotal * 12,
    activeCount: active.length,
    dailyTotal: active.reduce((sum, s) => sum + dailyCost(s, convert), 0),
    results,
  };
}
