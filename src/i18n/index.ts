import en from './locales/en.json';
import kn from './locales/kn.json';
import hi from './locales/hi.json';
import te from './locales/te.json';
import ta from './locales/ta.json';
import ml from './locales/ml.json';
import mr from './locales/mr.json';
import gu from './locales/gu.json';
import bn from './locales/bn.json';
import pa from './locales/pa.json';
import or_locale from './locales/or.json';
import as_locale from './locales/as.json';
import { SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE } from './languages';

export const dictionaries: Record<string, typeof en> = {
  en,
  kn: kn as unknown as typeof en,
  hi: hi as unknown as typeof en,
  te: te as unknown as typeof en,
  ta: ta as unknown as typeof en,
  ml: ml as unknown as typeof en,
  mr: mr as unknown as typeof en,
  gu: gu as unknown as typeof en,
  bn: bn as unknown as typeof en,
  pa: pa as unknown as typeof en,
  or: or_locale as unknown as typeof en,
  as: as_locale as unknown as typeof en,
};

export function getDictionary(lang: string) {
  return dictionaries[lang] || dictionaries[DEFAULT_LANGUAGE];
}

export function translate(dict: typeof en, pathStr: string, fallback?: string): string {
  if (!pathStr) return fallback || '';
  const keys = pathStr.split('.');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let current: any = dict;
  for (const k of keys) {
    if (current && typeof current === 'object' && k in current) {
      current = current[k];
    } else {
      // Fallback to English dictionary if missing in current locale
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let fallbackCurrent: any = dictionaries[DEFAULT_LANGUAGE];
      for (const fk of keys) {
        if (fallbackCurrent && typeof fallbackCurrent === 'object' && fk in fallbackCurrent) {
          fallbackCurrent = fallbackCurrent[fk];
        } else {
          return fallback || pathStr;
        }
      }
      return typeof fallbackCurrent === 'string' ? fallbackCurrent : fallback || pathStr;
    }
  }
  return typeof current === 'string' ? current : fallback || pathStr;
}

export { SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE };

