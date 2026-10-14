import { LANGUAGES } from '../../types/subscription';
import { LANGUAGE_NAMES, localeForLanguage, strings } from '../strings';

const placeholders = (s: string) => (s.match(/\{\w+\}/g) ?? []).sort().join(',');

describe('translations', () => {
  const en = strings.en;

  test.each(LANGUAGES.filter((l) => l !== 'en'))('%s has every string, non-empty, with the same placeholders', (lang) => {
    const t = strings[lang];
    for (const key of Object.keys(en) as (keyof typeof en)[]) {
      expect(typeof t[key]).toBe('string');
      expect(t[key].trim()).not.toBe('');
      // A dropped or renamed {placeholder} renders literally in the UI.
      expect([key, placeholders(t[key])]).toEqual([key, placeholders(en[key])]);
    }
  });

  test('every language has a picker name and a locale', () => {
    for (const lang of LANGUAGES) {
      expect(LANGUAGE_NAMES[lang]).toBeTruthy();
      expect(() => new Intl.DateTimeFormat(localeForLanguage(lang))).not.toThrow();
    }
  });
});
