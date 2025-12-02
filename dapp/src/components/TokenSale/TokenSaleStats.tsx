'use client';

import { useEffect, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { cn } from '@/lib/utils';
import { useTokenSale } from '@/hooks/useTokenSale';

interface AnimatedNumberProps {
  value: number;
  decimals?: number;
  suffix?: string;
  className?: string;
}

function AnimatedNumber({ value, decimals = 0, suffix = '', className }: AnimatedNumberProps) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const duration = 1000;
    const steps = 30;
    const increment = value / steps;
    let current = 0;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      current = Math.min(increment * step, value);
      setDisplayValue(current);

      if (step >= steps) {
        clearInterval(timer);
        setDisplayValue(value);
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value]);

  const formatNumber = (num: number): string => {
    if (num >= 1_000_000_000_000) {
      return (num / 1_000_000_000_000).toFixed(decimals) + 'T';
    }
    if (num >= 1_000_000_000) {
      return (num / 1_000_000_000).toFixed(decimals) + 'B';
    }
    if (num >= 1_000_000) {
      return (num / 1_000_000).toFixed(decimals) + 'M';
    }
    if (num >= 1_000) {
      return (num / 1_000).toFixed(decimals) + 'K';
    }
    return num.toFixed(decimals);
  };

  return (
    <span className={className}>
      {formatNumber(displayValue)}
      {suffix}
    </span>
  );
}

export default function TokenSaleStats() {
  const t = useTranslations('tokenSale.stats');
  const locale = useLocale();
  const { currentPrice, totalSold, maxTotalSale, percentageSold, isLoading: isLoadingTokenSale } = useTokenSale();

  const isLoading = isLoadingTokenSale;

  const stats = [
    {
      label: t('unitPrice'),
      value: currentPrice,
      suffix: ' USDC',
      decimals: 6,
      className: 'text-primary',
    },
    {
      label: t('totalAvailable'),
      value: maxTotalSale,
      suffix: ' PELON',
      decimals: 0,
      className: 'text-accent',
    },
    {
      label: t('tokensSold'),
      value: totalSold,
      suffix: ' PELON',
      decimals: 2,
      className: 'text-green-500',
    },
    {
      label: t('percentageSold'),
      value: percentageSold,
      suffix: '%',
      decimals: 1,
      className: 'text-yellow-500',
      isPercentageCard: true,
    },
  ];

  const StatCard = ({ stat, index }: { stat: typeof stats[0] & { isPercentageCard?: boolean }; index: number }) => {
    const isPercentageCard = stat.isPercentageCard || false;
    
    return (
      <div
        key={stat.label}
        className={cn(
          'bg-background-secondary',
          'border-neobrutal',
          'shadow-neobrutal-md',
          'rounded-none',
          isPercentageCard ? 'p-6 sm:p-8 col-span-full' : 'p-6'
        )}
        style={{
          animationDelay: `${index * 100}ms`,
        }}
      >
        {isPercentageCard ? (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <div className="text-muted-foreground text-sm font-medium mb-2">{stat.label}</div>
                <div className={cn('text-4xl sm:text-5xl md:text-6xl font-bold', stat.className)}>
                  <AnimatedNumber
                    value={stat.value}
                    decimals={stat.decimals}
                    suffix={stat.suffix}
                  />
                </div>
              </div>
              <div className="text-right">
                <div className="text-muted-foreground text-sm font-medium mb-1">
                  {t('tokensSold')}
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-foreground">
                  {totalSold.toLocaleString(locale === 'es' ? 'es-ES' : 'en-US', { maximumFractionDigits: 0 })} / {maxTotalSale.toLocaleString(locale === 'es' ? 'es-ES' : 'en-US', { maximumFractionDigits: 0 })}
                </div>
              </div>
            </div>
            <div>
              <div className="w-full bg-background h-6 sm:h-8 border-neobrutal border-2">
                <div
                  className="h-full bg-primary transition-all duration-500 flex items-center justify-end pr-2"
                  style={{ width: `${percentageSold}%` }}
                >
                  {percentageSold > 10 && (
                    <span className="text-xs font-bold text-primary-foreground">
                      {percentageSold.toFixed(1)}%
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="text-muted-foreground text-sm font-medium mb-2">{stat.label}</div>
            <div className={cn('text-3xl sm:text-4xl font-bold', stat.className)}>
              <AnimatedNumber
                value={stat.value}
                decimals={stat.decimals}
                suffix={stat.suffix}
              />
            </div>
          </>
        )}
        {isLoading && (
          <div className="text-xs text-muted-foreground mt-2">Loading...</div>
        )}
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
      {stats.map((stat, index) => (
        <StatCard key={stat.label} stat={stat} index={index} />
      ))}
    </div>
  );
}

