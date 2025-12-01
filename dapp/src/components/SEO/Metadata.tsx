import Head from 'next/head';
import {
  getCanonicalUrl,
  getAlternateLocales,
  getOgLocale,
  getAbsoluteImageUrl,
} from '@/lib/seo';

export interface MetadataProps {
  title: string;
  description: string;
  keywords?: string;
  author?: string;
  ogImage?: string;
  canonicalUrl: string;
  locale: string;
  alternateLocales?: Array<{ locale: string; url: string }>;
  twitterHandle?: string;
  robots?: string;
  siteName?: string;
}

const DEFAULT_SITE_NAME = 'Pelon Club';
const DEFAULT_TWITTER_HANDLE = '@PelonClub';
const DEFAULT_OG_IMAGE = '/img/icon.png';
const DEFAULT_ROBOTS = 'index, follow';
const DEFAULT_AUTHOR = 'Pelon Club';

export default function Metadata({
  title,
  description,
  keywords,
  author = DEFAULT_AUTHOR,
  ogImage = DEFAULT_OG_IMAGE,
  canonicalUrl,
  locale,
  alternateLocales,
  twitterHandle = DEFAULT_TWITTER_HANDLE,
  robots = DEFAULT_ROBOTS,
  siteName = DEFAULT_SITE_NAME,
}: MetadataProps) {
  const ogImageUrl = getAbsoluteImageUrl(ogImage);
  const ogLocale = getOgLocale(locale);
  
  let path = '/';
  if (canonicalUrl) {
    try {
      const url = new URL(canonicalUrl);
      const pathname = url.pathname;
      const localeMatch = pathname.match(/^\/(es|en)(\/.*)?$/);
      if (localeMatch) {
        path = localeMatch[2] || '/';
      } else {
        path = pathname || '/';
      }
    } catch {
      const match = canonicalUrl.match(/\/\/(?:[^\/]+)\/(?:es|en)(\/.*)?$/);
      if (match) {
        path = match[1] || '/';
      }
    }
  }
  
  const alternates = alternateLocales || getAlternateLocales(path);

  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      <meta name="author" content={author} />
      <meta name="robots" content={robots} />

      <link rel="canonical" href={canonicalUrl} />

      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImageUrl} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:locale" content={ogLocale} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImageUrl} />
      {twitterHandle && <meta name="twitter:site" content={twitterHandle} />}

      {alternates.map((alt) => (
        <link
          key={alt.locale}
          rel="alternate"
          hrefLang={alt.locale}
          href={alt.url}
        />
      ))}
      {alternates.length > 0 && (
        <link
          rel="alternate"
          hrefLang="x-default"
          href={alternates[0].url}
        />
      )}
    </Head>
  );
}

