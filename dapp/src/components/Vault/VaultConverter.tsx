'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useReadContract } from 'wagmi';
import { parseUnits, formatUnits } from 'viem';
import { cn } from '@/lib/utils';
import { PELON_STAKING_VAULT_ABI, PELON_STAKING_VAULT_ADDRESS } from '@/contracts/pelonStakingVault';

const PELON_DECIMALS = 18;

export default function VaultConverter() {
  const t = useTranslations('vault.converter');
  const locale = useLocale();
  const { address, isConnected } = useAccount();
  const [inputValue, setInputValue] = useState('');
  const [convertType, setConvertType] = useState<'assets' | 'shares'>('assets');

  const numValue = parseFloat(inputValue) || 0;
  const assetsAmountBigInt = convertType === 'assets' && numValue > 0 ? parseUnits(numValue.toFixed(PELON_DECIMALS), PELON_DECIMALS) : 0n;
  const sharesAmountBigInt = convertType === 'shares' && numValue > 0 ? parseUnits(numValue.toFixed(PELON_DECIMALS), PELON_DECIMALS) : 0n;

  const { data: sharesResult, isLoading: isLoadingShares } = useReadContract({
    address: PELON_STAKING_VAULT_ADDRESS,
    abi: PELON_STAKING_VAULT_ABI,
    functionName: 'convertToShares',
    args: assetsAmountBigInt > 0n ? [assetsAmountBigInt] : undefined,
    query: {
      enabled: assetsAmountBigInt > 0n && convertType === 'assets',
    },
  });

  const { data: assetsResult, isLoading: isLoadingAssets } = useReadContract({
    address: PELON_STAKING_VAULT_ADDRESS,
    abi: PELON_STAKING_VAULT_ABI,
    functionName: 'convertToAssets',
    args: sharesAmountBigInt > 0n ? [sharesAmountBigInt] : undefined,
    query: {
      enabled: sharesAmountBigInt > 0n && convertType === 'shares',
    },
  });

  const sharesFormatted = sharesResult ? parseFloat(formatUnits(sharesResult, PELON_DECIMALS)) : 0;
  const assetsFormatted = assetsResult ? parseFloat(formatUnits(assetsResult, PELON_DECIMALS)) : 0;

  const handleInputChange = (value: string) => {
    setInputValue(value);
  };

  const handleConvertTypeChange = (type: 'assets' | 'shares') => {
    setConvertType(type);
    setInputValue('');
  };

  const isLoading = isLoadingShares || isLoadingAssets;
  const hasResult = (convertType === 'assets' && sharesFormatted > 0) || (convertType === 'shares' && assetsFormatted > 0);

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
        <span>🔄</span>
        <span>{t('title')}</span>
      </h2>

      {!isConnected ? (
        <div className="space-y-4">
          <p className="text-muted-foreground">{t('connectWallet')}</p>
          <ConnectButton />
        </div>
      ) : (
        <div className="space-y-6">
          <div>
            <p className="text-muted-foreground mb-4">
              {t('description')}
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => handleConvertTypeChange('assets')}
              className={cn(
                'flex-1',
                'px-4',
                'py-3',
                'font-bold',
                'rounded-none',
                'border-neobrutal',
                convertType === 'assets'
                  ? 'bg-primary text-primary-foreground shadow-neobrutal'
                  : 'bg-background text-foreground shadow-neobrutal-sm'
              )}
            >
              {t('assetsToShares')}
            </button>
            <button
              onClick={() => handleConvertTypeChange('shares')}
              className={cn(
                'flex-1',
                'px-4',
                'py-3',
                'font-bold',
                'rounded-none',
                'border-neobrutal',
                convertType === 'shares'
                  ? 'bg-primary text-primary-foreground shadow-neobrutal'
                  : 'bg-background text-foreground shadow-neobrutal-sm'
              )}
            >
              {t('sharesToAssets')}
            </button>
          </div>

          <div>
            <label className="text-foreground font-bold text-sm block mb-3">
              {convertType === 'assets' ? t('amountInPELON') : t('amountInShares')}
            </label>
            <input
              type="number"
              value={inputValue}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder={convertType === 'assets' ? t('enterPELON') : t('enterShares')}
              step="0.000001"
              min="0"
              className={cn(
                'w-full',
                'bg-background',
                'border-neobrutal',
                'shadow-neobrutal-sm',
                'px-4',
                'py-3',
                'text-foreground',
                'font-medium',
                'rounded-none',
                'focus:outline-none',
                'focus:ring-2',
                'focus:ring-ring',
                'text-lg'
              )}
            />
          </div>

          {hasResult && !isLoading && (
            <div
              className={cn(
                'bg-background',
                'border-neobrutal',
                'p-4',
                'rounded-none'
              )}
            >
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground text-sm">{t('result')}</span>
                <span className="text-foreground font-bold text-lg">
                  {convertType === 'assets' 
                    ? `${sharesFormatted.toLocaleString(locale === 'es' ? 'es-ES' : 'en-US', { maximumFractionDigits: 6 })} CALDERO`
                    : `${assetsFormatted.toLocaleString(locale === 'es' ? 'es-ES' : 'en-US', { maximumFractionDigits: 6 })} PELON`
                  }
                </span>
              </div>
            </div>
          )}

          {isLoading && numValue > 0 && (
            <div className="text-center text-muted-foreground">
              {t('calculating')}...
            </div>
          )}
        </div>
      )}
    </div>
  );
}

