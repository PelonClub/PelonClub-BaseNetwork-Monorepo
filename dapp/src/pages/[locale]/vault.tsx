import type { GetStaticProps } from 'next';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { routing } from '@/i18n/routing';
import VaultStats from '@/components/Vault/VaultStats';
import VaultDepositMint from '@/components/Vault/VaultDepositMint';
import VaultWithdraw from '@/components/Vault/VaultWithdraw';
import DepositHistory from '@/components/Vault/DepositHistory';
import { cn } from '@/lib/utils';
import Metadata from '@/components/SEO/Metadata';
import { getCanonicalUrl } from '@/lib/seo';

export default function Vault() {
  const t = useTranslations();
  const router = useRouter();
  const locale = (router.query.locale as string) || router.locale || 'es';
  const canonicalUrl = getCanonicalUrl('/vault', locale);
  const [activeTab, setActiveTab] = useState('introduction');

  const tabs = [
    { id: 'introduction', label: t('vault.education.tabs.introduction') },
    { id: 'userGuide', label: t('vault.education.tabs.userGuide') },
    { id: 'useCases', label: t('vault.education.tabs.useCases') },
    { id: 'examples', label: t('vault.education.tabs.examples') },
    { id: 'security', label: t('vault.education.tabs.security') },
    { id: 'benefits', label: t('vault.education.tabs.benefits') },
    { id: 'fomo', label: t('vault.education.tabs.fomo') },
    { id: 'caldero', label: t('vault.education.tabs.caldero') },
  ];

  return (
    <>
      <Metadata
        title={t('vault.meta.title')}
        description={t('vault.meta.description')}
        keywords={t('vault.meta.keywords')}
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
                🏦 {t('vault.title')}
              </h1>
              <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
                {t('vault.subtitle')}
              </p>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8 sm:py-12">
          <div className="mb-8">
            <VaultStats />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div>
              <VaultDepositMint />
            </div>
            
            <div>
              <VaultWithdraw />
            </div>
          </div>

          <div className="mb-8">
            <DepositHistory />
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
              {t('vault.education.title')}
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
                    {t('vault.education.introduction.title')}
                  </h4>
                  <div className="space-y-3 text-muted-foreground">
                    <p>{t('vault.education.introduction.paragraph1')}</p>
                    <p>{t('vault.education.introduction.paragraph2')}</p>
                    <div>
                      <h5 className="text-foreground font-bold mb-2">{t('vault.education.introduction.concepts.title')}</h5>
                      <ul className="list-disc list-inside space-y-1 ml-2">
                        <li><strong className="text-foreground">{t('vault.education.introduction.concepts.assets')}</strong></li>
                        <li><strong className="text-foreground">{t('vault.education.introduction.concepts.shares')}</strong></li>
                        <li><strong className="text-foreground">{t('vault.education.introduction.concepts.exchangeRate')}</strong></li>
                        <li><strong className="text-foreground">{t('vault.education.introduction.concepts.timelock')}</strong></li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'userGuide' && (
                <div className="space-y-4">
                  <h4 className="text-xl font-bold text-foreground">
                    {t('vault.education.userGuide.title')}
                  </h4>
                  <div className="space-y-4 text-muted-foreground">
                    <div>
                      <h5 className="text-foreground font-bold mb-2">{t('vault.education.userGuide.deposits.title')}</h5>
                      <p>{t('vault.education.userGuide.deposits.description')}</p>
                    </div>
                    <div>
                      <h5 className="text-foreground font-bold mb-2">{t('vault.education.userGuide.withdrawals.title')}</h5>
                      <p>{t('vault.education.userGuide.withdrawals.description')}</p>
                    </div>
                    <div>
                      <h5 className="text-foreground font-bold mb-2">{t('vault.education.userGuide.timelock.title')}</h5>
                      <p>{t('vault.education.userGuide.timelock.description')}</p>
                    </div>
                    <div>
                      <h5 className="text-foreground font-bold mb-2">{t('vault.education.userGuide.fees.title')}</h5>
                      <p>{t('vault.education.userGuide.fees.description')}</p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'useCases' && (
                <div className="space-y-4">
                  <h4 className="text-xl font-bold text-foreground">
                    {t('vault.education.useCases.title')}
                  </h4>
                  <div className="space-y-4 text-muted-foreground">
                    <div>
                      <h5 className="text-foreground font-bold mb-2">{t('vault.education.useCases.shortTerm.title')}</h5>
                      <p>{t('vault.education.useCases.shortTerm.description')}</p>
                    </div>
                    <div>
                      <h5 className="text-foreground font-bold mb-2">{t('vault.education.useCases.ecosystem.title')}</h5>
                      <p>{t('vault.education.useCases.ecosystem.description')}</p>
                    </div>
                    <div>
                      <h5 className="text-foreground font-bold mb-2">{t('vault.education.useCases.accumulation.title')}</h5>
                      <p>{t('vault.education.useCases.accumulation.description')}</p>
                    </div>
                    <div>
                      <h5 className="text-foreground font-bold mb-2">{t('vault.education.useCases.strategies.title')}</h5>
                      <p>{t('vault.education.useCases.strategies.description')}</p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'examples' && (
                <div className="space-y-4">
                  <h4 className="text-xl font-bold text-foreground">
                    {t('vault.education.examples.title')}
                  </h4>
                  <div className="space-y-4 text-muted-foreground">
                    <div>
                      <h5 className="text-foreground font-bold mb-2">{t('vault.education.examples.initialDeposit.title')}</h5>
                      <p>{t('vault.education.examples.initialDeposit.description')}</p>
                    </div>
                    <div>
                      <h5 className="text-foreground font-bold mb-2">{t('vault.education.examples.withdrawal.title')}</h5>
                      <p>{t('vault.education.examples.withdrawal.description')}</p>
                    </div>
                    <div>
                      <h5 className="text-foreground font-bold mb-2">{t('vault.education.examples.shareValue.title')}</h5>
                      <p>{t('vault.education.examples.shareValue.description')}</p>
                    </div>
                    <div>
                      <h5 className="text-foreground font-bold mb-2">{t('vault.education.examples.yield.title')}</h5>
                      <p>{t('vault.education.examples.yield.description')}</p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'security' && (
                <div className="space-y-4">
                  <h4 className="text-xl font-bold text-foreground">
                    {t('vault.education.security.title')}
                  </h4>
                  <div className="space-y-4 text-muted-foreground">
                    <p>{t('vault.education.security.paragraph1')}</p>
                    <div>
                      <h5 className="text-foreground font-bold mb-2">{t('vault.education.security.audits.title')}</h5>
                      <p>{t('vault.education.security.audits.description')}</p>
                    </div>
                    <div>
                      <h5 className="text-foreground font-bold mb-2">{t('vault.education.security.mechanisms.title')}</h5>
                      <p>{t('vault.education.security.mechanisms.description')}</p>
                    </div>
                    <div>
                      <h5 className="text-foreground font-bold mb-2">{t('vault.education.security.openzeppelin.title')}</h5>
                      <p>{t('vault.education.security.openzeppelin.description')}</p>
                    </div>
                    <div>
                      <h5 className="text-foreground font-bold mb-2">{t('vault.education.security.immutable.title')}</h5>
                      <p>{t('vault.education.security.immutable.description')}</p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'benefits' && (
                <div className="space-y-4">
                  <h4 className="text-xl font-bold text-foreground">
                    {t('vault.education.benefits.title')}
                  </h4>
                  <div className="space-y-4 text-muted-foreground">
                    <div>
                      <h5 className="text-foreground font-bold mb-2">{t('vault.education.benefits.yield.title')}</h5>
                      <p>{t('vault.education.benefits.yield.description')}</p>
                    </div>
                    <div>
                      <h5 className="text-foreground font-bold mb-2">{t('vault.education.benefits.shareValue.title')}</h5>
                      <p>{t('vault.education.benefits.shareValue.description')}</p>
                    </div>
                    <div>
                      <h5 className="text-foreground font-bold mb-2">{t('vault.education.benefits.compound.title')}</h5>
                      <p>{t('vault.education.benefits.compound.description')}</p>
                    </div>
                    <div>
                      <h5 className="text-foreground font-bold mb-2">{t('vault.education.benefits.transparency.title')}</h5>
                      <p>{t('vault.education.benefits.transparency.description')}</p>
                    </div>
                    <div>
                      <h5 className="text-foreground font-bold mb-2">{t('vault.education.benefits.noAdmin.title')}</h5>
                      <p>{t('vault.education.benefits.noAdmin.description')}</p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'fomo' && (
                <div className="space-y-4">
                  <h4 className="text-xl font-bold text-foreground">
                    {t('vault.education.fomo.title')}
                  </h4>
                  <div className="space-y-4 text-muted-foreground">
                    <p className="text-lg font-semibold text-foreground">{t('vault.education.fomo.paragraph1')}</p>
                    <div>
                      <h5 className="text-foreground font-bold mb-2">{t('vault.education.fomo.early.title')}</h5>
                      <p>{t('vault.education.fomo.early.description')}</p>
                    </div>
                    <div>
                      <h5 className="text-foreground font-bold mb-2">{t('vault.education.fomo.shareIncrease.title')}</h5>
                      <p>{t('vault.education.fomo.shareIncrease.description')}</p>
                    </div>
                    <div>
                      <h5 className="text-foreground font-bold mb-2">{t('vault.education.fomo.audited.title')}</h5>
                      <p>{t('vault.education.fomo.audited.description')}</p>
                    </div>
                    <div>
                      <h5 className="text-foreground font-bold mb-2">{t('vault.education.fomo.baseNetwork.title')}</h5>
                      <p>{t('vault.education.fomo.baseNetwork.description')}</p>
                    </div>
                    <p className="text-lg font-semibold text-primary">{t('vault.education.fomo.paragraph2')}</p>
                  </div>
                </div>
              )}

              {activeTab === 'caldero' && (
                <div className="space-y-4">
                  <h4 className="text-xl font-bold text-foreground">
                    {t('vault.education.caldero.title')}
                  </h4>
                  <div className="space-y-4 text-muted-foreground">
                    <p>{t('vault.education.caldero.paragraph1')}</p>
                    <div>
                      <h5 className="text-foreground font-bold mb-2">{t('vault.education.caldero.power.title')}</h5>
                      <p>{t('vault.education.caldero.power.description')}</p>
                    </div>
                    <div>
                      <h5 className="text-foreground font-bold mb-2">{t('vault.education.caldero.secretPages.title')}</h5>
                      <p>{t('vault.education.caldero.secretPages.description')}</p>
                    </div>
                    <div>
                      <h5 className="text-foreground font-bold mb-2">{t('vault.education.caldero.exclusive.title')}</h5>
                      <p>{t('vault.education.caldero.exclusive.description')}</p>
                    </div>
                    <div>
                      <h5 className="text-foreground font-bold mb-2">{t('vault.education.caldero.future.title')}</h5>
                      <p>{t('vault.education.caldero.future.description')}</p>
                    </div>
                    <div>
                      <h5 className="text-foreground font-bold mb-2">{t('vault.education.caldero.strategy.title')}</h5>
                      <p>{t('vault.education.caldero.strategy.description')}</p>
                    </div>
                    <p className="text-lg font-semibold text-primary">{t('vault.education.caldero.paragraph2')}</p>
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

