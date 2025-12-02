'use client';

import { useTranslations, useLocale } from 'next-intl';
import { cn } from '@/lib/utils';
import { formatTimestamp } from '@/data/tokenSale';
import { useRecentPurchases } from '@/hooks/useRecentPurchases';

export default function RecentPurchases() {
  const t = useTranslations('tokenSale.recentPurchases');
  const locale = useLocale();
  const { data: purchases, isLoading } = useRecentPurchases();

  const formatAddress = (address: string): string => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div
      className={cn(
        'bg-background-secondary',
        'border-neobrutal',
        'shadow-neobrutal-md',
        'p-6',
        'rounded-none',
        'overflow-x-auto'
      )}
    >
      <h3
        className={cn(
          'text-2xl sm:text-3xl',
          'font-bold',
          'text-foreground',
          'mb-6',
          'flex items-center gap-3'
        )}
      >
        <span>🔥</span>
        <span>{t('title')}</span>
      </h3>

      {isLoading ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">{t('loading')}</p>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {purchases && purchases.length > 0 ? (
              purchases.map((purchase, index) => (
                <div
                  key={`${purchase.address}-${purchase.timestamp}`}
                  className={cn(
                    'bg-background',
                    'border-neobrutal',
                    'shadow-neobrutal-sm',
                    'p-4',
                    'rounded-none',
                    'transition-all',
                    'hover:shadow-neobrutal',
                    'hover:translate-x-[-2px]',
                    'hover:translate-y-[-2px]'
                  )}
                  style={{
                    animationDelay: `${index * 50}ms`,
                  }}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          'w-10',
                          'h-10',
                          'bg-primary',
                          'border-neobrutal',
                          'rounded-none',
                          'flex',
                          'items-center',
                          'justify-center',
                          'font-bold',
                          'text-primary-foreground',
                          'text-sm',
                          'flex-shrink-0'
                        )}
                      >
                        {index + 1}
                      </div>
                      <div>
                        <div className="text-foreground font-bold text-sm">
                          {formatAddress(purchase.address)}
                        </div>
                        <div className="text-muted-foreground text-xs">
                          {formatTimestamp(purchase.timestamp)}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
                      <div className="text-right">
                        <div className="text-muted-foreground text-xs">{t('tokens')}</div>
                        <div className="text-foreground font-bold">
                          {purchase.tokens.toLocaleString(locale === 'es' ? 'es-ES' : 'en-US', { maximumFractionDigits: 0 })} PELON
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-muted-foreground text-xs">{t('paid')}</div>
                        <div className="text-green-500 font-bold">
                          {purchase.usdc.toLocaleString(locale === 'es' ? 'es-ES' : 'en-US', { maximumFractionDigits: 2 })} USDC
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">{t('noPurchases')}</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

