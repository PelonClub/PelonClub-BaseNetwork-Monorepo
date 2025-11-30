import { useState, useEffect } from 'react';
import ReactCountryFlag from 'react-country-flag';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from 'next/router';
import { cn } from '@/lib/utils';
import { Locale } from '@/i18n/config';

interface LanguageSelectorProps {
  className?: string;
}

export default function LanguageSelector({ className }: LanguageSelectorProps) {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const t = useTranslations();
  const [currentLanguage, setCurrentLanguage] = useState<Locale>(locale);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setCurrentLanguage(locale as Locale);
  }, [locale]);

  const languages = [
    { code: 'es' as Locale, label: 'ES', countryCode: 'ES' },
    { code: 'en' as Locale, label: 'EN', countryCode: 'GB' },
  ];

  const handleLanguageChange = (lang: Locale) => {
    setCurrentLanguage(lang);
    setIsOpen(false);
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('preferred-locale', lang);
    }
    
    const pathWithoutLocale = router.asPath.replace(/^\/[^/]+/, '') || '/';
    const newPath = `/${lang}${pathWithoutLocale}`;
    
    router.push(newPath);
  };

  return (
    <div className={cn('relative', className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="
          bg-background-secondary
          text-foreground
          border-neobrutal
          shadow-neobrutal-sm
          px-3
          py-2
          font-bold
          rounded-none
          hover:bg-primary
          hover:text-primary-foreground
          active:bg-primary-active
          active:shadow-none
          active:translate-x-[2px]
          active:translate-y-[2px]
          transition-none
          flex
          items-center
          gap-2
        "
        aria-label={t('common.selectLanguage')}
        aria-expanded={isOpen}
      >
        {(() => {
          const currentLang = languages.find((lang) => lang.code === currentLanguage);
          return currentLang ? (
            <>
              <ReactCountryFlag
                countryCode={currentLang.countryCode}
                svg
                style={{
                  width: '1em',
                  height: '1em',
                }}
                title={currentLang.label}
              />
              <span className="text-sm sm:text-base">
                {currentLang.label}
              </span>
            </>
          ) : null;
        })()}
        <svg
          className={cn(
            'w-4 h-4 transition-transform',
            isOpen && 'rotate-180'
          )}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={3}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div
            className="
              absolute
              top-full
              left-0
              mt-2
              bg-background-secondary
              border-neobrutal
              shadow-neobrutal
              rounded-none
              z-20
              min-w-full
            "
          >
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                className={cn(
                  'w-full text-left px-3 py-2 font-bold text-sm sm:text-base rounded-none',
                  'hover:bg-primary hover:text-primary-foreground',
                  'active:bg-primary-active',
                  'flex items-center gap-2',
                  currentLanguage === lang.code
                    ? 'bg-primary text-primary-foreground'
                    : 'text-foreground'
                )}
              >
                <ReactCountryFlag
                  countryCode={lang.countryCode}
                  svg
                  style={{
                    width: '1em',
                    height: '1em',
                  }}
                  title={lang.label}
                />
                <span>{lang.label}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

