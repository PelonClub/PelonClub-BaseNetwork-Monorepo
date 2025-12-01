import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  if (!locale || !routing.locales.includes(locale as any)) {
    locale = routing.defaultLocale;
  }

  let messages;
  try {
    messages = (await import(`../messages/${locale}.json`)).default;
  } catch (error) {
    console.warn(`Failed to load messages for locale ${locale}, falling back to ${routing.defaultLocale}`);
    messages = (await import(`../messages/${routing.defaultLocale}.json`)).default;
  }

  return {
    locale,
    messages,
    onError(error) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('next-intl error:', error);
      }
    },
    getMessageFallback({ namespace, key, error }) {
      const path = [namespace, key].filter((part) => part != null).join('.');
      return `[${path}]`;
    },
  };
});

