import type { GetStaticProps } from 'next';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Image from 'next/image';
import { routing } from '@/i18n/routing';
import { cn } from '@/lib/utils';
import Metadata from '@/components/SEO/Metadata';
import { getCanonicalUrl } from '@/lib/seo';

export default function Home() {
  const t = useTranslations();
  const router = useRouter();
  const locale = (router.query.locale as string) || router.locale || 'es';

  const getLocalizedHref = (href: string) => {
    if (href === '/') {
      return `/${locale}`;
    }
    return `/${locale}${href}`;
  };

  const bentoCards = [
    {
      href: '/token-sale',
      title: t('home.bento.tokenSale.title'),
      description: t('home.bento.tokenSale.description'),
      emoji: '🚀',
      imagePath: '/img/token-sale.png',
      gradient: 'from-indigo-700 to-indigo-900',
      colSpan: 'col-span-1 md:col-span-2',
      rowSpan: 'row-span-1 md:row-span-2',
    },
    {
      href: '/leaderboard',
      title: t('home.bento.leaderboard.title'),
      description: t('home.bento.leaderboard.description'),
      emoji: '🏆',
      gradient: 'from-indigo-600 to-indigo-800',
      colSpan: 'col-span-1',
      rowSpan: 'row-span-1',
    },
    {
      href: '/tokenomics',
      title: t('home.bento.tokenomics.title'),
      description: t('home.bento.tokenomics.description'),
      emoji: '💎',
      gradient: 'from-indigo-500 to-indigo-700',
      colSpan: 'col-span-1',
      rowSpan: 'row-span-1',
    },
  ];

  const canonicalUrl = getCanonicalUrl('/', locale);

  return (
    <>
      <Metadata
        title={t('meta.title')}
        description={t('meta.description')}
        keywords={t('meta.keywords')}
        author={t('meta.author')}
        ogImage={t('meta.ogImage')}
        canonicalUrl={canonicalUrl}
        locale={locale}
        twitterHandle={t('meta.twitterHandle')}
      />

      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-12 sm:py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-fr">
            {bentoCards.map((card) => (
              <Link
                key={card.href}
                href={getLocalizedHref(card.href)}
                className={cn(
                  'group',
                  'relative',
                  'bg-background-secondary',
                  'border-neobrutal',
                  'shadow-neobrutal-md',
                  'rounded-none',
                  'overflow-hidden',
                  'transition-none',
                  'hover:bg-background-secondary/90',
                  'active:shadow-none',
                  'active:translate-x-[6px]',
                  'active:translate-y-[6px]',
                  'focus:outline-none',
                  'focus:ring-2',
                  'focus:ring-ring',
                  'focus:ring-offset-2',
                  'focus:ring-offset-background',
                  card.colSpan,
                  card.rowSpan
                )}
              >
                {card.imagePath ? (
                  <Image
                    src={card.imagePath}
                    alt={card.title}
                    fill
                    className="object-cover rounded-none"
                  />
                ) : (
                  <div
                    className={cn(
                      'absolute inset-0',
                      'bg-gradient-to-br',
                      card.gradient,
                      'opacity-20',
                      'group-hover:opacity-30',
                      'transition-opacity'
                    )}
                  />
                )}
                <div className="relative h-full p-6 sm:p-8 flex flex-col justify-between z-10">
                  <div>
                    {!card.imagePath && (
                      <div className="mb-4">
                        <div className="text-4xl sm:text-5xl md:text-6xl">
                          {card.emoji}
                        </div>
                      </div>
                    )}
                    {card.imagePath ? (
                      <div className="relative -mx-6 sm:-mx-8 -mt-6 sm:-mt-8 px-6 sm:px-8 pt-6 sm:pt-8 pb-4 bg-background-secondary/95">
                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-3">
                          {card.title}
                        </h2>
                        <p className="text-base sm:text-lg text-muted-foreground">
                          {card.description}
                        </p>
                      </div>
                    ) : (
                      <>
                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-3">
                          {card.title}
                        </h2>
                        <p className="text-base sm:text-lg text-muted-foreground">
                          {card.description}
                        </p>
                      </>
                    )}
                  </div>
                  <div className="mt-6">
                    <span className="text-foreground font-bold text-sm sm:text-base inline-flex items-center gap-2">
                      {t('home.bento.cta')}
                      <span className="group-hover:translate-x-1 transition-transform">
                        →
                      </span>
                    </span>
                  </div>
                </div>
              </Link>
            ))}
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

