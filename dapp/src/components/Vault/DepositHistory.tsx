'use client';

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useAccount } from 'wagmi';
import { cn } from '@/lib/utils';
import { useVault } from '@/hooks/useVault';
import { useUserVaultData, UserDeposit } from '@/hooks/useUserVaultData';

interface CountdownTimerProps {
  unlockTime: number;
  isUnlocked: boolean;
}

function CountdownTimer({ unlockTime, isUnlocked }: CountdownTimerProps) {
  const t = useTranslations('vault.history');
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [days, setDays] = useState<number>(0);
  const [hours, setHours] = useState<number>(0);
  const [minutes, setMinutes] = useState<number>(0);
  const [seconds, setSeconds] = useState<number>(0);

  useEffect(() => {
    if (isUnlocked) {
      setTimeRemaining(0);
      setDays(0);
      setHours(0);
      setMinutes(0);
      setSeconds(0);
      return;
    }

    const updateTimer = () => {
      const now = Math.floor(Date.now() / 1000);
      const remaining = Math.max(0, unlockTime - now);
      
      setTimeRemaining(remaining);
      setDays(Math.floor(remaining / (24 * 60 * 60)));
      setHours(Math.floor((remaining % (24 * 60 * 60)) / (60 * 60)));
      setMinutes(Math.floor((remaining % (60 * 60)) / 60));
      setSeconds(remaining % 60);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [unlockTime, isUnlocked]);

  if (isUnlocked) {
    return (
      <span className="text-green-500 font-bold">
        {t('unlocked')}
      </span>
    );
  }

  return (
    <div className="text-muted-foreground text-sm">
      <div className="font-bold text-foreground mb-1">{t('unlocksIn')}</div>
      <div className="flex gap-2 flex-wrap">
        {days > 0 && <span>{days}d</span>}
        {hours > 0 && <span>{hours}h</span>}
        {minutes > 0 && <span>{minutes}m</span>}
        <span>{seconds}s</span>
      </div>
    </div>
  );
}

function formatDate(timestamp: number, locale: string): string {
  return new Date(timestamp * 1000).toLocaleString(locale === 'es' ? 'es-ES' : 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function DepositHistory() {
  const t = useTranslations('vault.history');
  const locale = useLocale();
  const { isConnected } = useAccount();
  const { assetAddress } = useVault();
  const { deposits, isLoading } = useUserVaultData(assetAddress);

  if (!isConnected) {
    return (
      <div
        className={cn(
          'bg-background-secondary',
          'border-neobrutal',
          'shadow-neobrutal-md',
          'p-6 sm:p-8',
          'rounded-none'
        )}
      >
        <h2
          className={cn(
            'text-2xl sm:text-3xl',
            'font-bold',
            'text-foreground',
            'mb-6',
            'flex items-center gap-3'
          )}
        >
          <span>📜</span>
          <span>{t('title')}</span>
        </h2>
        <p className="text-muted-foreground">{t('connectWallet')}</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div
        className={cn(
          'bg-background-secondary',
          'border-neobrutal',
          'shadow-neobrutal-md',
          'p-6 sm:p-8',
          'rounded-none'
        )}
      >
        <h2
          className={cn(
            'text-2xl sm:text-3xl',
            'font-bold',
            'text-foreground',
            'mb-6',
            'flex items-center gap-3'
          )}
        >
          <span>📜</span>
          <span>{t('title')}</span>
        </h2>
        <p className="text-muted-foreground">{t('loading')}</p>
      </div>
    );
  }

  if (deposits.length === 0) {
    return (
      <div
        className={cn(
          'bg-background-secondary',
          'border-neobrutal',
          'shadow-neobrutal-md',
          'p-6 sm:p-8',
          'rounded-none'
        )}
      >
        <h2
          className={cn(
            'text-2xl sm:text-3xl',
            'font-bold',
            'text-foreground',
            'mb-6',
            'flex items-center gap-3'
          )}
        >
          <span>📜</span>
          <span>{t('title')}</span>
        </h2>
        <p className="text-muted-foreground">{t('noDeposits')}</p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'bg-background-secondary',
        'border-neobrutal',
        'shadow-neobrutal-md',
        'p-6 sm:p-8',
        'rounded-none'
      )}
    >
      <h2
        className={cn(
          'text-2xl sm:text-3xl',
          'font-bold',
          'text-foreground',
          'mb-6',
          'flex items-center gap-3'
        )}
      >
        <span>📜</span>
        <span>{t('title')}</span>
      </h2>

      <div className="space-y-4">
        {deposits.map((deposit: UserDeposit, index: number) => (
          <div
            key={index}
            className={cn(
              'bg-background',
              'border-neobrutal',
              'shadow-neobrutal-sm',
              'p-4 sm:p-6',
              'rounded-none'
            )}
          >
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-foreground font-bold text-lg">
                    {deposit.sharesFormatted.toLocaleString(locale === 'es' ? 'es-ES' : 'en-US', { maximumFractionDigits: 6 })} CALDERO
                  </span>
                  {deposit.isUnlocked ? (
                    <span className="text-xs bg-green-500 text-white px-2 py-1 font-bold border border-black">
                      {t('unlockedStatus')}
                    </span>
                  ) : (
                    <span className="text-xs bg-yellow-500 text-black px-2 py-1 font-bold border border-black">
                      {t('locked')}
                    </span>
                  )}
                </div>
                <div className="text-muted-foreground text-sm mb-2">
                  {t('depositedAt')}: {formatDate(deposit.timestampNumber, locale as string)}
                </div>
                <div className="text-muted-foreground text-sm">
                  {t('unlocksAt')}: {formatDate(deposit.unlockTime, locale as string)}
                </div>
              </div>
              <div className="sm:text-right">
                <CountdownTimer unlockTime={deposit.unlockTime} isUnlocked={deposit.isUnlocked} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

