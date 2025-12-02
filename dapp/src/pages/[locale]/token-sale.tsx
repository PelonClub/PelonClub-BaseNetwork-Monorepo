import type { GetStaticProps } from 'next';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { routing } from '@/i18n/routing';
import TokenSaleStats from '@/components/TokenSale/TokenSaleStats';
import TokenSalePurchase from '@/components/TokenSale/TokenSalePurchase';
import { cn } from '@/lib/utils';
import Metadata from '@/components/SEO/Metadata';
import { getCanonicalUrl } from '@/lib/seo';

export default function TokenSale() {
  const t = useTranslations();
  const router = useRouter();
  const locale = (router.query.locale as string) || router.locale || 'es';
  const canonicalUrl = getCanonicalUrl('/token-sale', locale);
  const [activeTab, setActiveTab] = useState('introduction');

  const tabs = [
    { id: 'introduction', label: t('tokenSale.education.tabs.introduction') },
    { id: 'sigmoidCurve', label: t('tokenSale.education.tabs.sigmoidCurve') },
    { id: 'priceTiers', label: t('tokenSale.education.tabs.priceTiers') },
    { id: 'userGuide', label: t('tokenSale.education.tabs.userGuide') },
    { id: 'useCases', label: t('tokenSale.education.tabs.useCases') },
    { id: 'examples', label: t('tokenSale.education.tabs.examples') },
    { id: 'security', label: t('tokenSale.education.tabs.security') },
    { id: 'benefits', label: t('tokenSale.education.tabs.benefits') },
    { id: 'fomo', label: t('tokenSale.education.tabs.fomo') },
  ];

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
        siteName={t('common.appName')}
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

          <div className="mb-8">
            <TokenSalePurchase />
          </div>

          <div
            className={cn(
              'bg-background-secondary',
              'border-neobrutal',
              'shadow-neobrutal-md',
              'p-6 sm:p-8',
              'rounded-none',
              'mt-12'
            )}
          >
            <h3 className="text-2xl sm:text-3xl font-bold text-foreground mb-6">
              {t('tokenSale.education.title')}
            </h3>

            <div className="grid grid-cols-1 lg:grid-cols-[250px_1fr] gap-6">
              <div className="lg:border-r-[3px] lg:border-solid lg:border-black lg:pr-6">
                <div className="flex flex-row lg:flex-col gap-2 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={cn(
                        'px-4 py-2 sm:px-6 sm:py-3',
                        'font-bold text-sm sm:text-base',
                        'rounded-none',
                        'border-neobrutal shadow-neobrutal-sm',
                        'transition-none',
                        'whitespace-nowrap',
                        'text-left',
                        'w-full lg:w-auto',
                        activeTab === tab.id
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-background text-foreground hover:bg-primary hover:text-primary-foreground',
                        'active:shadow-none',
                        'active:translate-x-[2px]',
                        'active:translate-y-[2px]'
                      )}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-6 min-w-0">
                {activeTab === 'introduction' && (
                  <div className="space-y-4">
                    <h4 className="text-xl font-bold text-foreground">
                      {t('tokenSale.education.introduction.title')}
                    </h4>
                    <div className="space-y-3 text-muted-foreground">
                      <p>{t('tokenSale.education.introduction.paragraph1')}</p>
                      <p>{t('tokenSale.education.introduction.paragraph2')}</p>
                      <div>
                        <h5 className="text-foreground font-bold mb-2">{t('tokenSale.education.introduction.concepts.title')}</h5>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                          <li><strong className="text-foreground">{t('tokenSale.education.introduction.concepts.initialPrice')}</strong></li>
                          <li><strong className="text-foreground">{t('tokenSale.education.introduction.concepts.maxPrice')}</strong></li>
                          <li><strong className="text-foreground">{t('tokenSale.education.introduction.concepts.tokensSold')}</strong></li>
                          <li><strong className="text-foreground">{t('tokenSale.education.introduction.concepts.timing')}</strong></li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'sigmoidCurve' && (
                  <div className="space-y-4">
                    <h4 className="text-xl font-bold text-foreground">
                      {t('tokenSale.education.sigmoidCurve.title')}
                    </h4>
                    <div className="space-y-3 text-muted-foreground">
                      <p>{t('tokenSale.education.sigmoidCurve.paragraph1')}</p>
                      <p>{t('tokenSale.education.sigmoidCurve.paragraph2')}</p>
                      <div>
                        <h5 className="text-foreground font-bold mb-2">{t('tokenSale.education.sigmoidCurve.howItWorks.title')}</h5>
                        <p>{t('tokenSale.education.sigmoidCurve.howItWorks.description')}</p>
                      </div>
                      <div>
                        <h5 className="text-foreground font-bold mb-2">{t('tokenSale.education.sigmoidCurve.priceOnlyUp.title')}</h5>
                        <p>{t('tokenSale.education.sigmoidCurve.priceOnlyUp.description')}</p>
                      </div>
                      <div>
                        <h5 className="text-foreground font-bold mb-2">{t('tokenSale.education.sigmoidCurve.transparency.title')}</h5>
                        <p>{t('tokenSale.education.sigmoidCurve.transparency.description')}</p>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'priceTiers' && (
                  <div className="space-y-4">
                    <h4 className="text-xl font-bold text-foreground">
                      {t('tokenSale.education.priceTiers.title')}
                    </h4>
                    <div className="space-y-4 text-muted-foreground">
                      <p>{t('tokenSale.education.priceTiers.paragraph1')}</p>
                      <div>
                        <h5 className="text-foreground font-bold mb-2">{t('tokenSale.education.priceTiers.tier1.title')}</h5>
                        <p className="mb-2">{t('tokenSale.education.priceTiers.tier1.description')}</p>
                        <p><strong className="text-foreground">{t('tokenSale.education.priceTiers.tier1.example')}</strong></p>
                      </div>
                      <div>
                        <h5 className="text-foreground font-bold mb-2">{t('tokenSale.education.priceTiers.tier2.title')}</h5>
                        <p className="mb-2">{t('tokenSale.education.priceTiers.tier2.description')}</p>
                        <p><strong className="text-foreground">{t('tokenSale.education.priceTiers.tier2.example')}</strong></p>
                      </div>
                      <div>
                        <h5 className="text-foreground font-bold mb-2">{t('tokenSale.education.priceTiers.tier3.title')}</h5>
                        <p className="mb-2">{t('tokenSale.education.priceTiers.tier3.description')}</p>
                        <p><strong className="text-foreground">{t('tokenSale.education.priceTiers.tier3.example')}</strong></p>
                      </div>
                      <div>
                        <h5 className="text-foreground font-bold mb-2">{t('tokenSale.education.priceTiers.tier4.title')}</h5>
                        <p className="mb-2">{t('tokenSale.education.priceTiers.tier4.description')}</p>
                        <p><strong className="text-foreground">{t('tokenSale.education.priceTiers.tier4.example')}</strong></p>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'userGuide' && (
                  <div className="space-y-4">
                    <h4 className="text-xl font-bold text-foreground">
                      {t('tokenSale.education.userGuide.title')}
                    </h4>
                    <div className="space-y-4 text-muted-foreground">
                      <div>
                        <h5 className="text-foreground font-bold mb-2">{t('tokenSale.education.userGuide.steps.title')}</h5>
                        <ol className="list-decimal list-inside space-y-1 ml-2">
                          <li>{t('tokenSale.education.userGuide.steps.step1')}</li>
                          <li>{t('tokenSale.education.userGuide.steps.step2')}</li>
                          <li>{t('tokenSale.education.userGuide.steps.step3')}</li>
                          <li>{t('tokenSale.education.userGuide.steps.step4')}</li>
                          <li>{t('tokenSale.education.userGuide.steps.step5')}</li>
                        </ol>
                      </div>
                      <div>
                        <h5 className="text-foreground font-bold mb-2">{t('tokenSale.education.userGuide.limits.title')}</h5>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                          <li>{t('tokenSale.education.userGuide.limits.maxPerWallet')}</li>
                          <li>{t('tokenSale.education.userGuide.limits.maxTotalSale')}</li>
                          <li>{t('tokenSale.education.userGuide.limits.paymentMethod')}</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'useCases' && (
                  <div className="space-y-4">
                    <h4 className="text-xl font-bold text-foreground">
                      {t('tokenSale.education.useCases.title')}
                    </h4>
                    <div className="space-y-4 text-muted-foreground">
                      <div>
                        <h5 className="text-foreground font-bold mb-2">{t('tokenSale.education.useCases.earlyPurchase.title')}</h5>
                        <p>{t('tokenSale.education.useCases.earlyPurchase.description')}</p>
                      </div>
                      <div>
                        <h5 className="text-foreground font-bold mb-2">{t('tokenSale.education.useCases.strategies.title')}</h5>
                        <p>{t('tokenSale.education.useCases.strategies.description')}</p>
                      </div>
                      <div>
                        <h5 className="text-foreground font-bold mb-2">{t('tokenSale.education.useCases.ecosystem.title')}</h5>
                        <p>{t('tokenSale.education.useCases.ecosystem.description')}</p>
                      </div>
                      <div>
                        <h5 className="text-foreground font-bold mb-2">{t('tokenSale.education.useCases.investment.title')}</h5>
                        <p>{t('tokenSale.education.useCases.investment.description')}</p>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'examples' && (
                  <div className="space-y-4">
                    <h4 className="text-xl font-bold text-foreground">
                      {t('tokenSale.education.examples.title')}
                    </h4>
                    <div className="space-y-4 text-muted-foreground">
                      <div>
                        <h5 className="text-foreground font-bold mb-2">{t('tokenSale.education.examples.comparison.title')}</h5>
                        <p>{t('tokenSale.education.examples.comparison.description')}</p>
                      </div>
                      <div>
                        <h5 className="text-foreground font-bold mb-2">{t('tokenSale.education.examples.scenario1.title')}</h5>
                        <p>{t('tokenSale.education.examples.scenario1.description')}</p>
                      </div>
                      <div>
                        <h5 className="text-foreground font-bold mb-2">{t('tokenSale.education.examples.scenario2.title')}</h5>
                        <p>{t('tokenSale.education.examples.scenario2.description')}</p>
                      </div>
                      <div>
                        <h5 className="text-foreground font-bold mb-2">{t('tokenSale.education.examples.roi.title')}</h5>
                        <p>{t('tokenSale.education.examples.roi.description')}</p>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'security' && (
                  <div className="space-y-4">
                    <h4 className="text-xl font-bold text-foreground">
                      {t('tokenSale.education.security.title')}
                    </h4>
                    <div className="space-y-4 text-muted-foreground">
                      <p>{t('tokenSale.education.security.paragraph1')}</p>
                      <div>
                        <h5 className="text-foreground font-bold mb-2">{t('tokenSale.education.security.audits.title')}</h5>
                        <p>{t('tokenSale.education.security.audits.description')}</p>
                      </div>
                      <div>
                        <h5 className="text-foreground font-bold mb-2">{t('tokenSale.education.security.mechanisms.title')}</h5>
                        <p>{t('tokenSale.education.security.mechanisms.description')}</p>
                      </div>
                      <div>
                        <h5 className="text-foreground font-bold mb-2">{t('tokenSale.education.security.testing.title')}</h5>
                        <p>{t('tokenSale.education.security.testing.description')}</p>
                      </div>
                      <div>
                        <h5 className="text-foreground font-bold mb-2">{t('tokenSale.education.security.openzeppelin.title')}</h5>
                        <p>{t('tokenSale.education.security.openzeppelin.description')}</p>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'benefits' && (
                  <div className="space-y-4">
                    <h4 className="text-xl font-bold text-foreground">
                      {t('tokenSale.education.benefits.title')}
                    </h4>
                    <div className="space-y-4 text-muted-foreground">
                      <div>
                        <h5 className="text-foreground font-bold mb-2">{t('tokenSale.education.benefits.noFees.title')}</h5>
                        <p>{t('tokenSale.education.benefits.noFees.description')}</p>
                      </div>
                      <div>
                        <h5 className="text-foreground font-bold mb-2">{t('tokenSale.education.benefits.noManipulation.title')}</h5>
                        <p>{t('tokenSale.education.benefits.noManipulation.description')}</p>
                      </div>
                      <div>
                        <h5 className="text-foreground font-bold mb-2">{t('tokenSale.education.benefits.transparency.title')}</h5>
                        <p>{t('tokenSale.education.benefits.transparency.description')}</p>
                      </div>
                      <div>
                        <h5 className="text-foreground font-bold mb-2">{t('tokenSale.education.benefits.fixedSupply.title')}</h5>
                        <p>{t('tokenSale.education.benefits.fixedSupply.description')}</p>
                      </div>
                      <div>
                        <h5 className="text-foreground font-bold mb-2">{t('tokenSale.education.benefits.noOwnerImpact.title')}</h5>
                        <p>{t('tokenSale.education.benefits.noOwnerImpact.description')}</p>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'fomo' && (
                  <div className="space-y-4">
                    <h4 className="text-xl font-bold text-foreground">
                      {t('tokenSale.education.fomo.title')}
                    </h4>
                    <div className="space-y-4 text-muted-foreground">
                      <p className="text-lg font-semibold text-foreground">{t('tokenSale.education.fomo.paragraph1')}</p>
                      <div>
                        <h5 className="text-foreground font-bold mb-2">{t('tokenSale.education.fomo.earlyBuyers.title')}</h5>
                        <p>{t('tokenSale.education.fomo.earlyBuyers.description')}</p>
                      </div>
                      <div>
                        <h5 className="text-foreground font-bold mb-2">{t('tokenSale.education.fomo.priceOnlyUp.title')}</h5>
                        <p>{t('tokenSale.education.fomo.priceOnlyUp.description')}</p>
                      </div>
                      <div>
                        <h5 className="text-foreground font-bold mb-2">{t('tokenSale.education.fomo.hardLimit.title')}</h5>
                        <p>{t('tokenSale.education.fomo.hardLimit.description')}</p>
                      </div>
                      <div>
                        <h5 className="text-foreground font-bold mb-2">{t('tokenSale.education.fomo.noGoingBack.title')}</h5>
                        <p>{t('tokenSale.education.fomo.noGoingBack.description')}</p>
                      </div>
                      <p className="text-lg font-semibold text-primary">{t('tokenSale.education.fomo.paragraph2')}</p>
                    </div>
                  </div>
                )}
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

