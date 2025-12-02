'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Image from 'next/image';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { FaWallet } from 'react-icons/fa';
import { cn } from '@/lib/utils';
import LanguageSelector from './LanguageSelector';
import SocialIcons from './SocialIcons';

export default function Navigation() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const t = useTranslations();
  const router = useRouter();
  const pathname = router.pathname;
  const locale = router.query.locale as string || router.locale || 'es';

  const navSections = [
    { name: t('navigation.home'), href: '/' },
    { name: t('navigation.tokenSale'), href: '/token-sale' },
    { name: t('navigation.vault'), href: '/vault' },
    { name: t('navigation.tokenomics'), href: '/tokenomics' },
  ];

  const getLocalizedHref = (href: string) => {
    if (href === '/') {
      return `/${locale}`;
    }
    return `/${locale}${href}`;
  };

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/[locale]' || pathname === '/';
    }
    return pathname?.includes(href);
  };

  return (
    <nav className="w-full">
      <div className="w-full bg-background-secondary border-b-[3px] border-solid border-black">
        <div className="container mx-auto px-4 py-2">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <LanguageSelector />
              <SocialIcons />
            </div>

            <div className="flex items-center">
              <ConnectButton.Custom>
                {({
                  account,
                  chain,
                  openAccountModal,
                  openChainModal,
                  openConnectModal,
                  authenticationStatus,
                  mounted,
                }) => {
                  const ready = mounted && authenticationStatus !== 'loading';
                  const connected =
                    ready &&
                    account &&
                    chain &&
                    (!authenticationStatus ||
                      authenticationStatus === 'authenticated');

                  return (
                    <div
                      {...(!ready && {
                        'aria-hidden': true,
                        style: {
                          opacity: 0,
                          pointerEvents: 'none',
                          userSelect: 'none',
                        },
                      })}
                    >
                      {(() => {
                        if (!connected) {
                          return (
                            <button
                              onClick={openConnectModal}
                              type="button"
                              className="
                                bg-orange-500
                                text-white
                                border-neobrutal
                                shadow-neobrutal-sm
                                px-4
                                py-2
                                font-bold
                                text-sm
                                rounded-none
                                hover:bg-orange-600
                                hover:text-white
                                active:bg-orange-700
                                active:shadow-none
                                active:translate-x-[2px]
                                active:translate-y-[2px]
                                transition-none
                                flex
                                items-center
                                gap-2
                              "
                            >
                              <FaWallet className="w-4 h-4" />
                              {t('wallet.connect')}
                            </button>
                          );
                        }
                        if (chain.unsupported) {
                          return (
                            <button
                              onClick={openChainModal}
                              type="button"
                              className="
                                bg-background-secondary
                                text-foreground
                                border-neobrutal
                                shadow-neobrutal-sm
                                px-4
                                py-2
                                font-bold
                                text-sm
                                rounded-none
                                hover:bg-red-500
                                hover:text-white
                                active:bg-red-600
                                active:shadow-none
                                active:translate-x-[2px]
                                active:translate-y-[2px]
                                transition-none
                              "
                            >
                              {t('wallet.wrongNetwork')}
                            </button>
                          );
                        }
                        return (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={openChainModal}
                              type="button"
                              className="
                                bg-background-secondary
                                text-foreground
                                border-neobrutal
                                shadow-neobrutal-sm
                                px-3
                                py-2
                                font-bold
                                text-xs
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
                                gap-1
                              "
                            >
                              {chain.hasIcon && (
                                <div
                                  style={{
                                    background: chain.iconBackground,
                                    width: '12px',
                                    height: '12px',
                                    borderRadius: '999px',
                                    overflow: 'hidden',
                                  }}
                                >
                                  {chain.iconUrl && (
                                    <Image
                                      alt={chain.name ?? t('common.chainIcon')}
                                      src={chain.iconUrl}
                                      width={12}
                                      height={12}
                                      unoptimized
                                    />
                                  )}
                                </div>
                              )}
                              {chain.name}
                            </button>
                            <button
                              onClick={openAccountModal}
                              type="button"
                              className="
                                bg-background-secondary
                                text-foreground
                                border-neobrutal
                                shadow-neobrutal-sm
                                px-4
                                py-2
                                font-bold
                                text-sm
                                rounded-none
                                hover:bg-primary
                                hover:text-primary-foreground
                                active:bg-primary-active
                                active:shadow-none
                                active:translate-x-[2px]
                                active:translate-y-[2px]
                                transition-none
                              "
                            >
                              {account.displayName}
                              {account.displayBalance
                                ? ` (${account.displayBalance})`
                                : ''}
                            </button>
                          </div>
                        );
                      })()}
                    </div>
                  );
                }}
              </ConnectButton.Custom>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full bg-background border-b-[3px] border-solid border-black">
        <div className="container mx-auto px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <Link
              href={getLocalizedHref('/')}
              className="
                flex
                items-center
                gap-2
                text-2xl sm:text-3xl
                font-bold
                text-foreground
                hover:text-primary
                transition-colors
              "
            >
              <Image
                src="/img/icon.png"
                alt={t('common.pelonClubAlt')}
                width={32}
                height={32}
                className="rounded-none"
              />
              {t('common.appName')}
            </Link>

            <div className="hidden sm:flex items-center gap-2">
              {navSections.map((section) => (
                <Link
                  key={section.href}
                  href={getLocalizedHref(section.href)}
                  className={cn(
                    'px-4 py-2 font-bold text-sm sm:text-base rounded-none',
                    'border-neobrutal shadow-neobrutal-sm',
                    'hover:bg-primary hover:text-primary-foreground',
                    'active:bg-primary-active active:shadow-none',
                    'active:translate-x-[2px] active:translate-y-[2px]',
                    'transition-none',
                    isActive(section.href)
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-background-secondary text-foreground'
                  )}
                >
                  {section.name}
                </Link>
              ))}
            </div>

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="
                sm:hidden
                bg-background-secondary
                text-foreground
                border-neobrutal
                shadow-neobrutal-sm
                p-2
                rounded-none
                hover:bg-primary
                hover:text-primary-foreground
                active:bg-primary-active
                active:shadow-none
                active:translate-x-[2px]
                active:translate-y-[2px]
                transition-none
              "
              aria-label={t('common.toggleMenu')}
              aria-expanded={isMobileMenuOpen}
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isMobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>

          {isMobileMenuOpen && (
            <div className="sm:hidden mt-4 pb-4">
              <div className="flex flex-col gap-2">
                {navSections.map((section) => (
                  <Link
                    key={section.href}
                    href={getLocalizedHref(section.href)}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                      'px-4 py-3 font-bold text-base rounded-none',
                      'border-neobrutal shadow-neobrutal-sm',
                      'hover:bg-primary hover:text-primary-foreground',
                      'active:bg-primary-active active:shadow-none',
                      'active:translate-x-[2px] active:translate-y-[2px]',
                      'transition-none',
                      isActive(section.href)
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-background-secondary text-foreground'
                    )}
                  >
                    {section.name}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

