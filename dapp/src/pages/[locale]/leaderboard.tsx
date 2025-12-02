import type { GetStaticProps } from 'next';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/router';
import { routing } from '@/i18n/routing';
import LeaderboardStats from '@/components/Leaderboard/LeaderboardStats';
import LeaderboardTable from '@/components/Leaderboard/LeaderboardTable';
import { cn } from '@/lib/utils';
import Metadata from '@/components/SEO/Metadata';
import { getCanonicalUrl } from '@/lib/seo';

export default function Leaderboard() {
  const t = useTranslations();
  const router = useRouter();
  const locale = (router.query.locale as string) || router.locale || 'es';
  const canonicalUrl = getCanonicalUrl('/leaderboard', locale);

  return (
    <>
      <Metadata
        title={t('leaderboard.meta.title')}
        description={t('leaderboard.meta.description')}
        keywords={t('leaderboard.meta.keywords')}
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
                🏆 {t('leaderboard.title')}
              </h1>
              <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
                {t('leaderboard.subtitle')}
              </p>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8 sm:py-12">
          <LeaderboardStats />

          <div className="mb-8">
            <h2
              className={cn(
                'text-2xl sm:text-3xl',
                'font-bold',
                'text-foreground',
                'mb-6',
                'flex items-center gap-3'
              )}
            >
              <span>📊</span>
              <span>{t('leaderboard.rankings')}</span>
            </h2>
            <LeaderboardTable />
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
              {t('leaderboard.info.title')}
            </h3>
            <div className="space-y-3 text-muted-foreground">
              <p>{t('leaderboard.info.description1')}</p>
              <p>{t('leaderboard.info.description2')}</p>
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

