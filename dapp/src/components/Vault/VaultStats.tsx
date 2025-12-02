'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useAccount } from 'wagmi';
import { cn } from '@/lib/utils';
import { useVault } from '@/hooks/useVault';
import { useUserVaultData } from '@/hooks/useUserVaultData';

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

export default function VaultStats() {
  const t = useTranslations('vault.stats');
  const { address, isConnected } = useAccount();
  const {
    totalAssets,
    totalSupply,
    exchangeRate,
    timelockDays,
    withdrawFeePercent,
    assetAddress,
    isLoading: isLoadingVault,
  } = useVault();
  const {
    shareBalance,
    pelonBalance,
    withdrawableAssets,
    isLoading: isLoadingUser,
  } = useUserVaultData(assetAddress);

  const isLoading = isLoadingVault || isLoadingUser;

  const generalStats = [
    {
      label: t('totalAssets'),
      value: totalAssets,
      suffix: ' PELON',
      decimals: 2,
      className: 'text-primary',
    },
    {
      label: t('totalSupply'),
      value: totalSupply,
      suffix: ' CALDERO',
      decimals: 2,
      className: 'text-accent',
    },
    {
      label: t('exchangeRate'),
      value: exchangeRate,
      suffix: ' asset/share',
      decimals: 4,
      className: 'text-green-500',
    },
  ];

  const combinedStats = {
    timelock: {
      label: t('timelockDuration'),
      value: timelockDays,
      suffix: ' days',
      decimals: 1,
      className: 'text-yellow-500',
    },
    fee: {
      label: t('withdrawalFee'),
      value: withdrawFeePercent,
      suffix: '%',
      decimals: 2,
      className: 'text-orange-500',
    },
  };

  const userStats = isConnected
    ? [
        {
          label: t('yourPelonBalance'),
          value: pelonBalance,
          suffix: ' PELON',
          decimals: 2,
          className: 'text-blue-500',
        },
        {
          label: t('yourShares'),
          value: shareBalance,
          suffix: ' CALDERO',
          decimals: 2,
          className: 'text-purple-500',
        },
        {
          label: t('withdrawable'),
          value: withdrawableAssets,
          suffix: ' PELON',
          decimals: 2,
          className: 'text-green-500',
        },
      ]
    : [];

  const StatCard = ({ stat, index }: { stat: typeof generalStats[0]; index: number }) => (
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
        {isLoading ? (
          <span className="text-muted-foreground">...</span>
        ) : (
          <AnimatedNumber
            value={stat.value}
            decimals={stat.decimals}
            suffix={stat.suffix}
          />
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4">
          <h2 className="text-2xl font-bold text-foreground">{t('vaultStats')}</h2>
          <div className="flex flex-row gap-4 sm:gap-6 items-center">
            <div className="text-right">
              <div className="text-muted-foreground text-xs sm:text-sm font-medium mb-1">
                {combinedStats.timelock.label}
              </div>
              <div className={cn('text-lg sm:text-xl font-bold', combinedStats.timelock.className)}>
                {isLoading ? (
                  <span className="text-muted-foreground">...</span>
                ) : (
                  <AnimatedNumber
                    value={combinedStats.timelock.value}
                    decimals={combinedStats.timelock.decimals}
                    suffix={combinedStats.timelock.suffix}
                  />
                )}
              </div>
            </div>
            <div className="text-right">
              <div className="text-muted-foreground text-xs sm:text-sm font-medium mb-1">
                {combinedStats.fee.label}
              </div>
              <div className={cn('text-lg sm:text-xl font-bold', combinedStats.fee.className)}>
                {isLoading ? (
                  <span className="text-muted-foreground">...</span>
                ) : (
                  <AnimatedNumber
                    value={combinedStats.fee.value}
                    decimals={combinedStats.fee.decimals}
                    suffix={combinedStats.fee.suffix}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {generalStats.map((stat, index) => (
            <StatCard key={stat.label} stat={stat} index={index} />
          ))}
        </div>
      </div>

      {isConnected && userStats.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-4">{t('yourStats')}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {userStats.map((stat, index) => (
              <StatCard key={stat.label} stat={stat} index={index + generalStats.length + 1} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

