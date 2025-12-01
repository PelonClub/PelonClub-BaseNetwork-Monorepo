import '../styles/globals.css';
import '@rainbow-me/rainbowkit/styles.css';
import type { AppProps } from 'next/app';
import { useEffect, useState } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import { useRouter } from 'next/router';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit';
import { Toaster } from 'react-hot-toast';

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
    <NextIntlClientProvider
      locale={locale}
      messages={messages}
      onError={(error) => {
        if (process.env.NODE_ENV === 'development') {
          console.warn('next-intl error:', error);
        }
      }}
      getMessageFallback={({ namespace, key, error }) => {
        const path = [namespace, key].filter((part) => part != null).join('.');
        return `[${path}]`;
      }}
    >
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
            <Toaster
              position="top-right"
              toastOptions={{
                className: '',
                style: {
                  background: '#1e293b',
                  color: '#f1f5f9',
                  border: '3px solid #000000',
                  borderRadius: '0px',
                  boxShadow: '4px 4px 0px 0px #000000',
                  fontSize: '14px',
                  fontWeight: '700',
                  padding: '16px',
                },
                success: {
                  iconTheme: {
                    primary: '#10b981',
                    secondary: '#ffffff',
                  },
                  style: {
                    borderColor: '#10b981',
                  },
                },
                error: {
                  iconTheme: {
                    primary: '#ef4444',
                    secondary: '#ffffff',
                  },
                  style: {
                    borderColor: '#ef4444',
                  },
                },
                duration: 4000,
              }}
            />
          </RainbowKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </NextIntlClientProvider>
  );
}

export default MyApp;
