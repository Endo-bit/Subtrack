import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

/** Current Date, resynced whenever the screen regains focus — keeps month/year-boundary-sensitive calculations (like "this month" totals) from going stale while the app stays open across midnight. */
export function useFocusedNow(): Date {
  const [now, setNow] = useState(() => new Date());
  useFocusEffect(
    useCallback(() => {
      setNow(new Date());
    }, []),
  );
  return now;
}
