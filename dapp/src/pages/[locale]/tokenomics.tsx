import type { GetStaticProps } from 'next';
import Head from 'next/head';
import { useTranslations } from 'next-intl';
import { routing } from '@/i18n/routing';
import TokenomicsStats from '@/components/Tokenomics/TokenomicsStats';
import { TokenomicsPieChart, TokenomicsBarChart } from '@/components/Tokenomics/TokenomicsCharts';
import TokenomicsTable from '@/components/Tokenomics/TokenomicsTable';
import { cn } from '@/lib/utils';

export default function Tokenomics() {
  const t = useTranslations();

  return (
    <>
      <Head>
        <title>{t('tokenomics.meta.title')}</title>
        <meta content={t('tokenomics.meta.description')} name="description" />
        <link href="/favicon.ico" rel="icon" />
      </Head>

      <main className="min-h-screen bg-background">
        <div className="w-full bg-background-secondary border-b-[4px] border-solid border-black py-12 sm:py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-8">
              <h1
                className={cn(
                  'text-4xl sm:text-5xl md:text-6xl',
                  'font-bold',
                  'text-foreground',
                  'mb-4',
                  'drop-shadow-[4px_4px_0px_rgba(0,0,0,1)]'
                )}
              >
                💎 {t('tokenomics.title')}
              </h1>
              <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
                {t('tokenomics.subtitle')}
              </p>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8 sm:py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="lg:order-1">
              <TokenomicsStats />
            </div>
            
            <div className="lg:order-2">
              <TokenomicsPieChart />
            </div>
          </div>

          <div className="mb-8">
            <TokenomicsBarChart />
          </div>

          <div className="mb-8">
            <TokenomicsTable />
          </div>

          <div
            className={cn(
              'bg-background-secondary',
              'border-neobrutal',
              'shadow-neobrutal',
              'p-6 sm:p-8',
              'rounded-none',
              'mt-12'
            )}
          >
            <h3 className="text-xl font-bold text-foreground mb-4">
              {t('tokenomics.info.title')}
            </h3>
            <div className="space-y-3 text-muted-foreground">
              <p>{t('tokenomics.info.description1')}</p>
              <p>{t('tokenomics.info.description2')}</p>
              <p>{t('tokenomics.info.description3')}</p>
            </div>
          </div>
        </div>
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

