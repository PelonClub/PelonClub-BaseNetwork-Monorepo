import type { GetStaticProps } from 'next';
import Head from 'next/head';
import { useTranslations } from 'next-intl';
import { routing } from '@/i18n/routing';

export default function Home() {
  const t = useTranslations();

  return (
    <>
      <Head>
        <title>{t('meta.title')}</title>
        <meta content={t('meta.description')} name="description" />
        <link href="/favicon.ico" rel="icon" />
      </Head>

      <main className="min-h-screen bg-background">
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const locale = (params?.locale as string) || routing.defaultLocale;

  return {
    props: {
      messages: (await import(`../../messages/${locale}.json`)).default,
    },
  };
};

export async function getStaticPaths() {
  return {
    paths: routing.locales.map((locale) => ({ params: { locale } })),
    fallback: false,
  };
}

