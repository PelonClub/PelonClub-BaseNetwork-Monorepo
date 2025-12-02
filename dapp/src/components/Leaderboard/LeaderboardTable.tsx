'use client';

import { useTranslations } from 'next-intl';
import { useTokenHolders } from '@/hooks/useTokenHolders';
import { TokenHolder } from '@/contracts/pelonClubToken';
import LeaderboardCard from './LeaderboardCard';
import { cn } from '@/lib/utils';

export default function LeaderboardTable() {
  const t = useTranslations('leaderboard');
  const { data: holders, isLoading, error } = useTokenHolders();

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(10)].map((_, i) => (
          <div
            key={i}
            className={cn(
              'w-full',
              'bg-background-secondary',
              'border-neobrutal',
              'shadow-neobrutal',
              'p-6',
              'rounded-none',
              'animate-pulse'
            )}
          >
            <div className="flex items-center gap-6">
              <div className="w-12 h-12 bg-muted rounded-none"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-muted w-32 rounded-none"></div>
                <div className="h-3 bg-muted w-24 rounded-none"></div>
              </div>
              <div className="h-6 bg-muted w-20 rounded-none"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={cn(
          'w-full',
          'bg-background-secondary',
          'border-neobrutal',
          'shadow-neobrutal',
          'p-8',
          'rounded-none',
          'text-center'
        )}
      >
        <p className="text-foreground font-bold text-lg mb-2">{t('errorLoading')}</p>
        <p className="text-muted-foreground text-sm">
          {error instanceof Error ? error.message : t('unknownError')}
        </p>
      </div>
    );
  }

  if (!holders || holders.length === 0) {
    return (
      <div
        className={cn(
          'w-full',
          'bg-background-secondary',
          'border-neobrutal',
          'shadow-neobrutal',
          'p-8',
          'rounded-none',
          'text-center'
        )}
      >
        <p className="text-foreground font-bold text-lg">{t('noHolders')}</p>
        <p className="text-muted-foreground text-sm mt-2">
          {t('noHoldersDescription')}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      {holders.map((holder, index) => (
        <div
          key={holder.address}
          className="animate-fade-in"
          style={{
            animationDelay: `${index * 50}ms`,
            animationFillMode: 'both',
          }}
        >
          <LeaderboardCard
            holder={holder}
            index={index}
            isTopThree={holder.rank <= 3}
          />
        </div>
      ))}
    </div>
  );
}

