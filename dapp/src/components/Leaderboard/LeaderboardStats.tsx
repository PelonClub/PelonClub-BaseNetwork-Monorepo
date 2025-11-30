import { useReadContract } from 'wagmi';
import { formatUnits } from 'viem';
import { PELON_CLUB_TOKEN_ABI, PELON_CLUB_TOKEN_ADDRESS } from '@/contracts/pelonClubToken';
import { cn } from '@/lib/utils';
import { useTokenHolders } from '@/hooks/useTokenHolders';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { FaChartPie } from 'react-icons/fa';
import { useTranslations } from 'next-intl';

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

export default function LeaderboardStats() {
  const { data: totalSupply, isLoading: isLoadingSupply } = useReadContract({
    address: PELON_CLUB_TOKEN_ADDRESS,
    abi: PELON_CLUB_TOKEN_ABI,
    functionName: 'totalSupply',
  });

  const { data: decimals } = useReadContract({
    address: PELON_CLUB_TOKEN_ADDRESS,
    abi: PELON_CLUB_TOKEN_ABI,
    functionName: 'decimals',
  });

  const { data: holders, isLoading: isLoadingHolders } = useTokenHolders();
  const router = useRouter();
  const locale = router.query.locale as string || router.locale || 'es';
  const t = useTranslations();

  const totalSupplyFormatted =
    totalSupply && decimals ? parseFloat(formatUnits(totalSupply, decimals)) : 0;
  const holdersCount = holders?.length || 0;

  const stats = [
    {
      label: 'Total Supply',
      value: totalSupplyFormatted,
      suffix: ' PELON',
      decimals: 0,
      className: 'text-primary',
    },
    {
      label: 'Total Holders',
      value: holdersCount,
      suffix: '',
      decimals: 0,
      className: 'text-accent',
    },
  ];

  const tokenomicsHref = `/${locale}/tokenomics`;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
      {stats.map((stat, index) => (
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
            'hover:translate-y-[-2px]'
          )}
          style={{
            animationDelay: `${index * 100}ms`,
          }}
        >
          <div className="text-muted-foreground text-sm font-medium mb-2">{stat.label}</div>
          <div className={cn('text-3xl sm:text-4xl font-bold', stat.className)}>
            {isLoadingSupply || isLoadingHolders ? (
              <span className="animate-pulse">---</span>
            ) : (
              <AnimatedNumber
                value={stat.value}
                decimals={stat.decimals}
                suffix={stat.suffix}
              />
            )}
          </div>
        </div>
      ))}
      
      <Link
        href={tokenomicsHref}
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
          'cursor-pointer',
          'block',
          'group'
        )}
        style={{
          animationDelay: '200ms',
        }}
      >
        <div className="text-muted-foreground text-sm font-medium mb-2 flex items-center gap-2">
          <FaChartPie className="w-4 h-4" />
          <span>{t('navigation.tokenomics')}</span>
        </div>
        <div className="flex items-center gap-3 group-hover:text-yellow-400">
          <span className="text-3xl sm:text-4xl font-bold text-yellow-500">💎</span>
          <div className="flex flex-col">
            <span className="text-base sm:text-lg font-bold text-foreground">
              {t('tokenomics.title')}
            </span>
            <span className="text-xs sm:text-sm text-muted-foreground flex items-center gap-1 mt-1">
              <span>{t('leaderboard.viewTokenomics')}</span>
              <span className="text-yellow-500 ml-1">→</span>
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
}

