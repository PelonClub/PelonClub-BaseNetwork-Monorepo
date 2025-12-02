import { routing } from '@/i18n/routing';
import type { GetStaticProps } from 'next';
import Head from 'next/head';
import messagesEs from '../messages/es.json';
import messagesEn from '../messages/en.json';

export default function Index() {
  const defaultLocale = routing.defaultLocale;
  const messages = defaultLocale === 'es' ? messagesEs : messagesEn;

  return (
    <>
      <Head>
        <title>{messages.meta.title}</title>
        <meta name="description" content={messages.meta.description} />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                const browserLang = navigator.language || navigator.userLanguage;
                const langCode = browserLang.split('-')[0].toLowerCase();
                const locales = ${JSON.stringify(routing.locales)};
                const defaultLocale = '${defaultLocale}';
                let locale = defaultLocale;
                if (locales.includes(langCode)) {
                  locale = langCode;
                }
                window.location.replace('/' + locale + '/');
              })();
            `,
          }}
        />
        <noscript>
          <meta httpEquiv="refresh" content={`0; url=/${defaultLocale}/`} />
        </noscript>
      </Head>
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-foreground font-bold text-lg">{messages.common.loading}</div>
      </div>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  return {
    props: {},
  };
};

