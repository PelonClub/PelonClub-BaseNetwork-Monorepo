'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';
import { useVault } from '@/hooks/useVault';
import { usePELONApproval } from '@/hooks/usePELONApproval';

export default function VaultApprove() {
  const t = useTranslations('vault.approve');
  const locale = useLocale();
  const { address, isConnected } = useAccount();
  const [inputValue, setInputValue] = useState('1000000');
  const lastApproveError = useRef<string | null>(null);

  const { assetAddress } = useVault();

  const numValue = parseFloat(inputValue) || 0;

  const handleApprovalSuccess = useCallback(() => {
    toast.success(t('successMessage'));
  }, [t]);

  const handleApprovalError = useCallback((error: Error) => {
    const errorMessage = error.message || '';
    if (lastApproveError.current !== errorMessage) {
      lastApproveError.current = errorMessage;
      toast.error(t('errorApprovalFailed'));
    }
  }, [t]);

  const {
    allowance,
    needsApproval,
    approvePELON,
    isApproving,
    isApprovalSuccess,
    approveError,
    refetchAllowance,
  } = usePELONApproval(numValue, assetAddress, {
    onApprovalSuccess: handleApprovalSuccess,
    onApprovalError: handleApprovalError,
  });

  useEffect(() => {
    if (approveError) {
      const errorMessage = approveError.message || '';
      if (lastApproveError.current !== errorMessage) {
        lastApproveError.current = errorMessage;
        handleApprovalError(approveError);
      }
    } else if (lastApproveError.current) {
      lastApproveError.current = null;
    }
  }, [approveError, handleApprovalError]);

  useEffect(() => {
    if (isApprovalSuccess) {
      refetchAllowance();
    }
  }, [isApprovalSuccess, refetchAllowance]);

  const handleInputChange = (value: string) => {
    setInputValue(value);
  };

  const handleApprove = async () => {
    if (numValue <= 0 || !isConnected) return;
    await approvePELON();
  };

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
        <span>✅</span>
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

          <div>
            <label className="text-foreground font-bold text-sm block mb-3">
              {t('amountToApprove')}
            </label>
            <div className="relative">
              <input
                type="number"
                value={inputValue}
                onChange={(e) => handleInputChange(e.target.value)}
                placeholder={t('enterAmount')}
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
            <p className="text-xs text-muted-foreground mt-2">
              {t('currentAllowance')}: {allowance.toLocaleString(locale === 'es' ? 'es-ES' : 'en-US', { maximumFractionDigits: 6 })} PELON
            </p>
          </div>

          {!needsApproval && allowance > 0 && (
            <div
              className={cn(
                'bg-background',
                'border-neobrutal',
                'p-4',
                'rounded-none'
              )}
            >
              <p className="text-foreground font-bold text-sm">
                ✅ {t('alreadyApproved')}
              </p>
            </div>
          )}

          <button
            onClick={handleApprove}
            disabled={isApproving || numValue <= 0 || (!needsApproval && allowance >= numValue)}
            className={cn(
              'w-full',
              'bg-primary',
              'text-primary-foreground',
              'border-neobrutal',
              'shadow-neobrutal',
              'px-6',
              'py-4',
              'font-bold',
              'rounded-none',
              'text-lg',
              'hover:bg-primary-hover',
              'active:bg-primary-active',
              'active:shadow-none',
              'active:translate-x-[4px]',
              'active:translate-y-[4px]',
              'transition-none',
              'disabled:opacity-50',
              'disabled:cursor-not-allowed',
              'disabled:hover:bg-primary',
              'disabled:active:translate-x-0',
              'disabled:active:translate-y-0',
              'disabled:active:shadow-neobrutal'
            )}
          >
            {isApproving ? t('processing') : t('approve')}
          </button>
        </div>
      )}
    </div>
  );
}

