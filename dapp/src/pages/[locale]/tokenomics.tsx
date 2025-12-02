import type { GetStaticProps } from 'next';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { routing } from '@/i18n/routing';
import TokenomicsStats from '@/components/Tokenomics/TokenomicsStats';
import { TokenomicsPieChart, TokenomicsBarChart } from '@/components/Tokenomics/TokenomicsCharts';
import TokenomicsTable from '@/components/Tokenomics/TokenomicsTable';
import TokenInfo from '@/components/Tokenomics/TokenInfo';
import { cn } from '@/lib/utils';
import Metadata from '@/components/SEO/Metadata';
import { getCanonicalUrl } from '@/lib/seo';

export default function Tokenomics() {
  const t = useTranslations();
  const router = useRouter();
  const locale = (router.query.locale as string) || router.locale || 'es';
  const canonicalUrl = getCanonicalUrl('/tokenomics', locale);
  const [activeTab, setActiveTab] = useState('introduction');

  const tabs = [
    { id: 'introduction', label: t('tokenomics.education.tabs.introduction') },
    { id: 'distribution', label: t('tokenomics.education.tabs.distribution') },
    { id: 'publicSale', label: t('tokenomics.education.tabs.publicSale') },
    { id: 'community', label: t('tokenomics.education.tabs.community') },
    { id: 'liquidity', label: t('tokenomics.education.tabs.liquidity') },
    { id: 'strategy', label: t('tokenomics.education.tabs.strategy') },
    { id: 'verification', label: t('tokenomics.education.tabs.verification') },
  ];

  return (
    <>
      <Metadata
        title={t('tokenomics.meta.title')}
        description={t('tokenomics.meta.description')}
        keywords={t('tokenomics.meta.keywords')}
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
                💎 {t('tokenomics.title')}
              </h1>
              <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
                {t('tokenomics.subtitle')}
              </p>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8 sm:py-12">
          <div className="mb-8">
            <TokenInfo />
          </div>

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
              'shadow-neobrutal-md',
              'p-6 sm:p-8',
              'rounded-none',
              'mt-12'
            )}
          >
            <h3 className="text-2xl sm:text-3xl font-bold text-foreground mb-6">
              {t('tokenomics.education.title')}
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
                      {t('tokenomics.education.introduction.title')}
                    </h4>
                    <div className="space-y-3 text-muted-foreground">
                      <p>{t('tokenomics.education.introduction.paragraph1')}</p>
                      <p>{t('tokenomics.education.introduction.paragraph2')}</p>
                      <div>
                        <h5 className="text-foreground font-bold mb-2">{t('tokenomics.education.introduction.tokenSpecs.title')}</h5>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                          <li><strong className="text-foreground">{t('tokenomics.education.introduction.tokenSpecs.tokenName')}</strong></li>
                          <li><strong className="text-foreground">{t('tokenomics.education.introduction.tokenSpecs.symbol')}</strong></li>
                          <li><strong className="text-foreground">{t('tokenomics.education.introduction.tokenSpecs.totalSupply')}</strong></li>
                          <li><strong className="text-foreground">{t('tokenomics.education.introduction.tokenSpecs.network')}</strong></li>
                          <li><strong className="text-foreground">{t('tokenomics.education.introduction.tokenSpecs.standard')}</strong></li>
                        </ul>
                      </div>
                      <p>{t('tokenomics.education.introduction.overview')}</p>
                    </div>
                  </div>
                )}

                {activeTab === 'distribution' && (
                  <div className="space-y-4">
                    <h4 className="text-xl font-bold text-foreground">
                      {t('tokenomics.education.distribution.title')}
                    </h4>
                    <div className="space-y-3 text-muted-foreground">
                      <p>{t('tokenomics.education.distribution.paragraph1')}</p>
                      <div>
                        <h5 className="text-foreground font-bold mb-2">{t('tokenomics.education.distribution.categories.title')}</h5>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                          <li><strong className="text-foreground">{t('tokenomics.education.distribution.categories.publicSale')}</strong></li>
                          <li><strong className="text-foreground">{t('tokenomics.education.distribution.categories.community')}</strong></li>
                          <li><strong className="text-foreground">{t('tokenomics.education.distribution.categories.liquidity')}</strong></li>
                          <li><strong className="text-foreground">{t('tokenomics.education.distribution.categories.team')}</strong></li>
                          <li><strong className="text-foreground">{t('tokenomics.education.distribution.categories.marketing')}</strong></li>
                          <li><strong className="text-foreground">{t('tokenomics.education.distribution.categories.treasury')}</strong></li>
                          <li><strong className="text-foreground">{t('tokenomics.education.distribution.categories.reserve')}</strong></li>
                        </ul>
                      </div>
                      <p className="font-semibold text-foreground">{t('tokenomics.education.distribution.total')}</p>
                    </div>
                  </div>
                )}

                {activeTab === 'publicSale' && (
                  <div className="space-y-4">
                    <h4 className="text-xl font-bold text-foreground">
                      {t('tokenomics.education.publicSale.title')}
                    </h4>
                    <div className="space-y-4 text-muted-foreground">
                      <p>{t('tokenomics.education.publicSale.paragraph1')}</p>
                      <div>
                        <h5 className="text-foreground font-bold mb-2">{t('tokenomics.education.publicSale.features.title')}</h5>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                          <li><strong className="text-foreground">{t('tokenomics.education.publicSale.features.pricing')}</strong></li>
                          <li><strong className="text-foreground">{t('tokenomics.education.publicSale.features.initialPrice')}</strong></li>
                          <li><strong className="text-foreground">{t('tokenomics.education.publicSale.features.priceMechanism')}</strong></li>
                          <li><strong className="text-foreground">{t('tokenomics.education.publicSale.features.paymentMethod')}</strong></li>
                          <li><strong className="text-foreground">{t('tokenomics.education.publicSale.features.antiWhale')}</strong></li>
                          <li><strong className="text-foreground">{t('tokenomics.education.publicSale.features.totalLimit')}</strong></li>
                          <li><strong className="text-foreground">{t('tokenomics.education.publicSale.features.contract')}</strong></li>
                        </ul>
                      </div>
                      <div>
                        <h5 className="text-foreground font-bold mb-2">{t('tokenomics.education.publicSale.breakdown.title')}</h5>
                        <p>{t('tokenomics.education.publicSale.breakdown.description')}</p>
                      </div>
                      <div>
                        <p><strong className="text-foreground">{t('tokenomics.education.publicSale.note')}</strong></p>
                      </div>
                      <div>
                        <p><strong className="text-foreground">{t('tokenomics.education.publicSale.whyMatters')}</strong></p>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'community' && (
                  <div className="space-y-4">
                    <h4 className="text-xl font-bold text-foreground">
                      {t('tokenomics.education.community.title')}
                    </h4>
                    <div className="space-y-4 text-muted-foreground">
                      <p>{t('tokenomics.education.community.paragraph1')}</p>
                      <div>
                        <h5 className="text-foreground font-bold mb-2">{t('tokenomics.education.community.breakdown.title')}</h5>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                          <li>{t('tokenomics.education.community.breakdown.airdrops')}</li>
                          <li>{t('tokenomics.education.community.breakdown.participation')}</li>
                          <li>{t('tokenomics.education.community.breakdown.referrals')}</li>
                          <li>{t('tokenomics.education.community.breakdown.governance')}</li>
                        </ul>
                      </div>
                      <div>
                        <p><strong className="text-foreground">{t('tokenomics.education.community.note')}</strong></p>
                      </div>
                      <div>
                        <p><strong className="text-foreground">{t('tokenomics.education.community.whyMatters')}</strong></p>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'liquidity' && (
                  <div className="space-y-4">
                    <h4 className="text-xl font-bold text-foreground">
                      {t('tokenomics.education.liquidity.title')}
                    </h4>
                    <div className="space-y-4 text-muted-foreground">
                      <p>{t('tokenomics.education.liquidity.paragraph1')}</p>
                      <div>
                        <h5 className="text-foreground font-bold mb-2">{t('tokenomics.education.liquidity.breakdown.title')}</h5>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                          <li>{t('tokenomics.education.liquidity.breakdown.initial')}</li>
                          <li>{t('tokenomics.education.liquidity.breakdown.reserve')}</li>
                        </ul>
                      </div>
                      <div>
                        <p><strong className="text-foreground">{t('tokenomics.education.liquidity.whyMatters')}</strong></p>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'strategy' && (
                  <div className="space-y-4">
                    <h4 className="text-xl font-bold text-foreground">
                      {t('tokenomics.education.strategy.title')}
                    </h4>
                    <div className="space-y-4 text-muted-foreground">
                      <div>
                        <h5 className="text-foreground font-bold mb-2">{t('tokenomics.education.strategy.conservative.title')}</h5>
                        <p className="mb-2">{t('tokenomics.education.strategy.conservative.description')}</p>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                          <li>{t('tokenomics.education.strategy.conservative.publicAccess')}</li>
                          <li>{t('tokenomics.education.strategy.conservative.communityFocus')}</li>
                          <li>{t('tokenomics.education.strategy.conservative.marketStability')}</li>
                          <li>{t('tokenomics.education.strategy.conservative.longTerm')}</li>
                          <li>{t('tokenomics.education.strategy.conservative.growth')}</li>
                          <li>{t('tokenomics.education.strategy.conservative.security')}</li>
                        </ul>
                      </div>
                      <div>
                        <h5 className="text-foreground font-bold mb-2">{t('tokenomics.education.strategy.sustainability.title')}</h5>
                        <p className="mb-2">{t('tokenomics.education.strategy.sustainability.description')}</p>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                          <li>{t('tokenomics.education.strategy.sustainability.communityValue')}</li>
                          <li>{t('tokenomics.education.strategy.sustainability.marketHealth')}</li>
                          <li>{t('tokenomics.education.strategy.sustainability.thinking')}</li>
                          <li>{t('tokenomics.education.strategy.sustainability.balanced')}</li>
                        </ul>
                      </div>
                      <div>
                        <h5 className="text-foreground font-bold mb-2">{t('tokenomics.education.strategy.transparency.title')}</h5>
                        <p>{t('tokenomics.education.strategy.transparency.description')}</p>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'verification' && (
                  <div className="space-y-4">
                    <h4 className="text-xl font-bold text-foreground">
                      {t('tokenomics.education.verification.title')}
                    </h4>
                    <div className="space-y-4 text-muted-foreground">
                      <p>{t('tokenomics.education.verification.paragraph1')}</p>
                      <div>
                        <h5 className="text-foreground font-bold mb-2">{t('tokenomics.education.verification.publicSale.title')}</h5>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                          <li>{t('tokenomics.education.verification.publicSale.contract')}</li>
                          <li>{t('tokenomics.education.verification.publicSale.allocation')}</li>
                          <li>{t('tokenomics.education.verification.publicSale.pricing')}</li>
                          <li>{t('tokenomics.education.verification.publicSale.initialPrice')}</li>
                          <li>{t('tokenomics.education.verification.publicSale.paymentMethod')}</li>
                          <li>{t('tokenomics.education.verification.publicSale.usdcWallet')}</li>
                        </ul>
                      </div>
                      <div>
                        <h5 className="text-foreground font-bold mb-2">{t('tokenomics.education.verification.community.title')}</h5>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                          <li>{t('tokenomics.education.verification.community.address')}</li>
                          <li>{t('tokenomics.education.verification.community.allocation')}</li>
                        </ul>
                      </div>
                      <div>
                        <h5 className="text-foreground font-bold mb-2">{t('tokenomics.education.verification.liquidity.title')}</h5>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                          <li>{t('tokenomics.education.verification.liquidity.address')}</li>
                          <li>{t('tokenomics.education.verification.liquidity.allocation')}</li>
                        </ul>
                      </div>
                      <div>
                        <h5 className="text-foreground font-bold mb-2">{t('tokenomics.education.verification.team.title')}</h5>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                          <li>{t('tokenomics.education.verification.team.address')}</li>
                          <li>{t('tokenomics.education.verification.team.allocation')}</li>
                        </ul>
                      </div>
                      <div>
                        <h5 className="text-foreground font-bold mb-2">{t('tokenomics.education.verification.marketing.title')}</h5>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                          <li>{t('tokenomics.education.verification.marketing.address')}</li>
                          <li>{t('tokenomics.education.verification.marketing.allocation')}</li>
                        </ul>
                      </div>
                      <div>
                        <h5 className="text-foreground font-bold mb-2">{t('tokenomics.education.verification.treasury.title')}</h5>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                          <li>{t('tokenomics.education.verification.treasury.address')}</li>
                          <li>{t('tokenomics.education.verification.treasury.allocation')}</li>
                        </ul>
                      </div>
                      <div>
                        <h5 className="text-foreground font-bold mb-2">{t('tokenomics.education.verification.reserve.title')}</h5>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                          <li>{t('tokenomics.education.verification.reserve.address')}</li>
                          <li>{t('tokenomics.education.verification.reserve.allocation')}</li>
                        </ul>
                      </div>
                      <p><strong className="text-foreground">{t('tokenomics.education.verification.note')}</strong></p>
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

