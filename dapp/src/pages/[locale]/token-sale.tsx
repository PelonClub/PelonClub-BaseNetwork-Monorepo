import type { GetStaticProps } from 'next';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/router';
import { routing } from '@/i18n/routing';
import TokenSaleStats from '@/components/TokenSale/TokenSaleStats';
import TokenSalePurchase from '@/components/TokenSale/TokenSalePurchase';
import RecentPurchases from '@/components/TokenSale/RecentPurchases';
import { cn } from '@/lib/utils';
import Metadata from '@/components/SEO/Metadata';
import { getCanonicalUrl } from '@/lib/seo';

export default function TokenSale() {
  const t = useTranslations();
  const router = useRouter();
  const locale = (router.query.locale as string) || router.locale || 'es';
  const canonicalUrl = getCanonicalUrl('/token-sale', locale);

  return (
    <>
      <Metadata
        title={t('tokenSale.meta.title')}
        description={t('tokenSale.meta.description')}
        keywords={t('tokenSale.meta.keywords')}
        author={t('meta.author')}
        ogImage={t('meta.ogImage')}
        canonicalUrl={canonicalUrl}
        locale={locale}
        twitterHandle={t('meta.twitterHandle')}
      />

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
                🚀 {t('tokenSale.title')}
              </h1>
              <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
                {t('tokenSale.subtitle')}
              </p>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8 sm:py-12">
          <TokenSaleStats />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="lg:order-1">
              <TokenSalePurchase />
            </div>
            
            <div className="lg:order-2">
              <RecentPurchases />
            </div>
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
              {t('tokenSale.info.title')}
            </h3>
            <div className="space-y-4 text-muted-foreground">
              <div>
                <h4 className="text-foreground font-bold mb-2">{t('tokenSale.info.bondingCurve.title')}</h4>
                <p>{t('tokenSale.info.bondingCurve.description')}</p>
              </div>
              <div>
                <h4 className="text-foreground font-bold mb-2">{t('tokenSale.info.priceFluctuation.title')}</h4>
                <p>{t('tokenSale.info.priceFluctuation.description')}</p>
              </div>
              <div>
                <h4 className="text-foreground font-bold mb-2">{t('tokenSale.info.noFees.title')}</h4>
                <p>{t('tokenSale.info.noFees.description')}</p>
              </div>
              <div>
                <h4 className="text-foreground font-bold mb-2">{t('tokenSale.info.noOwnerFunctions.title')}</h4>
                <p>{t('tokenSale.info.noOwnerFunctions.description')}</p>
              </div>
              <div>
                <h4 className="text-foreground font-bold mb-2">{t('tokenSale.info.noMint.title')}</h4>
                <p>{t('tokenSale.info.noMint.description')}</p>
              </div>
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

