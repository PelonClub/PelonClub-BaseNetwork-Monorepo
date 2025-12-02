import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';

import messagesEs from '../messages/es.json';
import messagesEn from '../messages/en.json';

const messagesMap = {
  es: messagesEs,
  en: messagesEn,
};

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  if (!locale || !routing.locales.includes(locale as any)) {
    locale = routing.defaultLocale;
  }

  const messages = (locale && messagesMap[locale as keyof typeof messagesMap]) 
    ? messagesMap[locale as keyof typeof messagesMap]
    : messagesMap[routing.defaultLocale];

  return {
    locale,
    messages,
    onError() {},
    getMessageFallback({ namespace, key, error }) {
      const path = [namespace, key].filter((part) => part != null).join('.');
      return `[${path}]`;
    },
  };
});

