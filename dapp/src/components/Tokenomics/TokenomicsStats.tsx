import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { TOTAL_SUPPLY, TOKENOMICS_DATA } from '@/data/tokenomics';

interface AnimatedNumberProps {
  value: number;
  decimals?: number;
  suffix?: string;
  className?: string;
}

function AnimatedNumber({ value, decimals = 0, suffix = '', className }: AnimatedNumberProps) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const duration = 1000; // 1 second
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

export default function TokenomicsStats() {
  const t = useTranslations('tokenomics.stats');

  const communityAllocation = TOKENOMICS_DATA.find(c => c.name === 'Community & Ecosystem');
  const liquidityAllocation = TOKENOMICS_DATA.find(c => c.name === 'Liquidity & Market Making');
  const teamAllocation = TOKENOMICS_DATA.find(c => c.name === 'Team & Founders');
  const marketingAllocation = TOKENOMICS_DATA.find(c => c.name === 'Marketing & Growth');
  const treasuryAllocation = TOKENOMICS_DATA.find(c => c.name === 'Treasury & Operations');
  const reserveAllocation = TOKENOMICS_DATA.find(c => c.name === 'Reserve Fund');

  const totalSupplyStat = {
    label: t('totalSupply'),
    value: TOTAL_SUPPLY,
    suffix: ' PELON',
    decimals: 0,
    className: 'text-primary',
  };

  const otherStats = [
    {
      label: t('teamAllocation'),
      value: teamAllocation?.percentage || 0,
      suffix: '%',
      decimals: 0,
      className: 'text-accent',
    },
    {
      label: t('communityAllocation'),
      value: communityAllocation?.percentage || 0,
      suffix: '%',
      decimals: 0,
      className: 'text-green-500',
    },
    {
      label: t('liquidityAllocation'),
      value: liquidityAllocation?.percentage || 0,
      suffix: '%',
      decimals: 0,
      className: 'text-yellow-500',
    },
    {
      label: t('marketingAllocation'),
      value: marketingAllocation?.percentage || 0,
      suffix: '%',
      decimals: 0,
      className: 'text-orange-500',
    },
    {
      label: t('treasuryAllocation'),
      value: treasuryAllocation?.percentage || 0,
      suffix: '%',
      decimals: 0,
      className: 'text-purple-500',
    },
    {
      label: t('reserveAllocation'),
      value: reserveAllocation?.percentage || 0,
      suffix: '%',
      decimals: 0,
      className: 'text-blue-500',
    },
  ];

  const StatCard = ({ stat, index, className = '' }: { stat: typeof totalSupplyStat; index: number; className?: string }) => (
    <div
      key={stat.label}
      className={cn(
        'bg-background-secondary',
        'border-neobrutal',
        'shadow-neobrutal-md',
        'p-6',
        'rounded-none',
        'transition-all',
        'hover:shadow-neobrutal-colored',
        'hover:translate-x-[-2px]',
        'hover:translate-y-[-2px]',
        className
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
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="lg:w-full">
        <StatCard stat={totalSupplyStat} index={0} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
        {otherStats.map((stat, index) => (
          <StatCard key={stat.label} stat={stat} index={index + 1} />
        ))}
      </div>
    </div>
  );
}

