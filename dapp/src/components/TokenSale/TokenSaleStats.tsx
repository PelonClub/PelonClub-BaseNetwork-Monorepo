'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { useTokenSale } from '@/hooks/useTokenSale';
import { useTokenSaleStats } from '@/hooks/useTokenSaleStats';

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
  const { currentPrice, totalSold, maxTotalSale, percentageSold, isLoading: isLoadingTokenSale } = useTokenSale();
  const { data: statsData, isLoading: isLoadingStats } = useTokenSaleStats();

  const isLoading = isLoadingTokenSale || isLoadingStats;

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
      decimals: 0,
      className: 'text-green-500',
    },
    {
      label: t('percentageSold'),
      value: percentageSold,
      suffix: '%',
      decimals: 1,
      className: 'text-yellow-500',
    },
    {
      label: t('totalRaised'),
      value: statsData?.totalRaised ?? 0,
      suffix: ' USDC',
      decimals: 0,
      className: 'text-orange-500',
    },
    {
      label: t('uniqueParticipants'),
      value: statsData?.uniqueParticipants ?? 0,
      suffix: '',
      decimals: 0,
      className: 'text-blue-500',
    },
  ];

  const StatCard = ({ stat, index }: { stat: typeof stats[0]; index: number }) => (
    <div
      key={stat.label}
      className={cn(
        'bg-background-secondary',
        'border-neobrutal',
        'shadow-neobrutal-md',
        'p-6',
        'rounded-none'
      )}
      style={{
        animationDelay: `${index * 100}ms`,
      }}
    >
      <div className="text-muted-foreground text-sm font-medium mb-2">{stat.label}</div>
      <div className={cn('text-3xl sm:text-4xl font-bold', stat.className)}>
        <AnimatedNumber
          value={stat.value}
          decimals={stat.decimals}
          suffix={stat.suffix}
        />
      </div>
      {stat.label === t('percentageSold') && (
        <div className="mt-4">
          <div className="w-full bg-background h-4 border-neobrutal border-2">
            <div
              className="h-full bg-primary transition-all duration-500"
              style={{ width: `${percentageSold}%` }}
            />
          </div>
        </div>
      )}
      {isLoading && (
        <div className="text-xs text-muted-foreground mt-2">Loading...</div>
      )}
    </div>
  );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
      {stats.map((stat, index) => (
        <StatCard key={stat.label} stat={stat} index={index} />
      ))}
    </div>
  );
}

