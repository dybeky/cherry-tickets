import ru from './ru';
import en from './en';
import { Locale, LanguageCode } from '../types';

const locales: Record<LanguageCode, Locale> = {
  ru,
  en
};

export function getLocale(lang: LanguageCode | string): Locale {
  return locales[lang as LanguageCode] || locales.ru;
}

export { ru, en };
export default locales;
