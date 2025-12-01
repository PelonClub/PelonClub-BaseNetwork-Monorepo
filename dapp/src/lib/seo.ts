import { locales } from '@/i18n/config';

const BASE_URL = 'https://pelon.club';

export interface AlternateLocale {
  locale: string;
  url: string;
}

export function getCanonicalUrl(path: string, locale: string): string {
  const cleanPath = path === '/' ? '' : path;
  return `${BASE_URL}/${locale}${cleanPath}`;
}

export function getAlternateLocales(path: string): AlternateLocale[] {
  const cleanPath = path === '/' ? '' : path;
  return locales.map((locale) => ({
    locale,
    url: `${BASE_URL}/${locale}${cleanPath}`,
  }));
}

export function getOgLocale(locale: string): string {
  const localeMap: Record<string, string> = {
    es: 'es_ES',
    en: 'en_US',
  };
  return localeMap[locale] || locale;
}

export function getAbsoluteImageUrl(imagePath: string): string {
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  const cleanPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  return `${BASE_URL}${cleanPath}`;
}

