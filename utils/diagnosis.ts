import { Subscription } from '@/types/subscription';

export type DiagnosisAnswers = {
  usage: 0 | 1 | 2 | 3;
  duplicate: boolean;
  worthPrice: 0 | 1 | 2;
  forgot: boolean;
  wouldMiss: 0 | 1 | 2;
};

const CANCEL_THRESHOLD = 45;

/** Score 0–100; lower suggests cancellation. */
export function diagnosisScore(answers: DiagnosisAnswers): number {
  let score = 0;
  score += answers.usage * 8;
  if (!answers.duplicate) score += 15;
  score += answers.worthPrice * 10;
  if (!answers.forgot) score += 12;
  score += answers.wouldMiss * 12;
  return Math.min(100, Math.max(0, score));
}

export function recommendsCancellation(score: number): boolean {
  return score < CANCEL_THRESHOLD;
}

export function diagnosisLabelKey(score: number): 'diagnosisResultKeep' | 'diagnosisResultReview' | 'diagnosisResultCancel' {
  if (score >= 70) return 'diagnosisResultKeep';
  if (score >= CANCEL_THRESHOLD) return 'diagnosisResultReview';
  return 'diagnosisResultCancel';
}

export function emptyAnswers(): DiagnosisAnswers {
  return {
    usage: 1,
    duplicate: false,
    worthPrice: 1,
    forgot: false,
    wouldMiss: 1,
  };
}

export type DiagnosisSession = {
  subscription: Subscription;
  answers: DiagnosisAnswers;
  score: number;
};

export function buildSession(sub: Subscription, answers: DiagnosisAnswers): DiagnosisSession {
  const score = diagnosisScore(answers);
  return { subscription: sub, answers, score };
}

/** A completed diagnosis, persisted so results can be revisited later. */
export type DiagnosisRecord = {
  subscriptionId: string;
  subscriptionName: string;
  score: number;
  answers: DiagnosisAnswers;
  createdAt: string;
};

export function toDiagnosisRecord(session: DiagnosisSession): DiagnosisRecord {
  return {
    subscriptionId: session.subscription.id,
    subscriptionName: session.subscription.name,
    score: session.score,
    answers: session.answers,
    createdAt: new Date().toISOString(),
  };
}
