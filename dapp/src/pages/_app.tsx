import '../styles/globals.css';
import '@rainbow-me/rainbowkit/styles.css';
import type { AppProps } from 'next/app';
import { useEffect, useState } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import { useRouter } from 'next/router';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit';

import { config } from '../wagmi';
import Navigation from '../components/Navigation';
import { routing } from '../i18n/routing';

const client = new QueryClient();

function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const [messages, setMessages] = useState(pageProps.messages || {});
  
  const locale = (router.query.locale as string) || 
                 router.locale || 
                 router.defaultLocale || 
                 routing.defaultLocale;

  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  useEffect(() => {
    if (!pageProps.messages && locale) {
      import(`../messages/${locale}.json`)
        .then((mod) => setMessages(mod.default))
        .catch(() => {
          import(`../messages/${routing.defaultLocale}.json`)
            .then((mod) => setMessages(mod.default));
        });
    } else if (pageProps.messages) {
      setMessages(pageProps.messages);
    }
  }, [locale, pageProps.messages]);

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <WagmiProvider config={config}>
        <QueryClientProvider client={client}>
          <RainbowKitProvider
            theme={darkTheme({
              accentColor: '#4338ca',
              accentColorForeground: '#ffffff',
              borderRadius: 'none',
            })}
          >
            <Navigation />
            <Component {...pageProps} />
          </RainbowKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </NextIntlClientProvider>
  );
}

export default MyApp;
