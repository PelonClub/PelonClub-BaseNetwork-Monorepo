'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { cn, stringifyWithBigInt } from '@/lib/utils';
import { useVault } from '@/hooks/useVault';
import { useVaultDeposit } from '@/hooks/useVaultDeposit';
import { usePELONApproval } from '@/hooks/usePELONApproval';
import { useUserVaultData } from '@/hooks/useUserVaultData';
import { PELON_STAKING_VAULT_ADDRESS } from '@/contracts/pelonStakingVault';

export default function VaultDeposit() {
  const t = useTranslations('vault.deposit');
  const locale = useLocale();
  const { address, isConnected } = useAccount();
  const [inputValue, setInputValue] = useState('');
  const queryClient = useQueryClient();
  const lastDepositError = useRef<string | null>(null);
  const lastApproveError = useRef<string | null>(null);
  const refetchAllowanceRef = useRef<(() => void) | null>(null);

  const { assetAddress, isLoading: isLoadingVault } = useVault();
  const { pelonBalance, isLoading: isLoadingUser } = useUserVaultData(assetAddress);

  const numValue = parseFloat(inputValue) || 0;

  const handleApprovalSuccess = useCallback(() => {
    refetchAllowanceRef.current?.();
    toast.success(t('successApprovalMessage'));
  }, [t]);

  const handleApprovalError = useCallback((error: Error) => {
    const errorMessage = error.message || '';
    if (lastApproveError.current !== errorMessage) {
      lastApproveError.current = errorMessage;
      toast.error(t('errorApprovalFailed'));
    }
  }, [t]);

  const handleDepositSuccess = useCallback(() => {
    setInputValue('');
    
    setTimeout(() => {
      const vaultAddressLower = PELON_STAKING_VAULT_ADDRESS.toLowerCase();
      
      queryClient.invalidateQueries({
        predicate: (query) => {
          const queryKey = query.queryKey;
          const queryKeyString = stringifyWithBigInt(queryKey).toLowerCase();
          return queryKeyString.includes(vaultAddressLower);
        },
      });
      
      queryClient.refetchQueries({
        predicate: (query) => {
          const queryKey = query.queryKey;
          const queryKeyString = stringifyWithBigInt(queryKey).toLowerCase();
          return queryKeyString.includes(vaultAddressLower);
        },
      });
      
      refetchAllowanceRef.current?.();
    }, 1000);
    
    toast.success(t('successMessage'));
  }, [queryClient, t]);

  const handleDepositError = useCallback((error: Error) => {
    const errorMessage = error.message || '';
    let toastMessage = t('errorDepositFailed');
    
    if (errorMessage.includes('insufficient balance')) toastMessage = t('errorInsufficientBalance');
    else if (errorMessage.includes('allowance')) toastMessage = t('errorInsufficientAllowance');
    
    if (lastDepositError.current !== errorMessage) {
      lastDepositError.current = errorMessage;
      toast.error(toastMessage);
    }
  }, [t]);

  const {
    sharesToReceive,
    depositAssets,
    isDepositing,
    isDepositSuccess,
    depositError,
    isLoading: isLoadingDeposit,
  } = useVaultDeposit(numValue, {
    onDepositSuccess: handleDepositSuccess,
    onDepositError: handleDepositError,
  });

  const {
    needsApproval,
    hasEnoughBalance,
    approvePELON,
    isApproving,
    isApprovalSuccess,
    approveError,
    refetchAllowance,
  } = usePELONApproval(numValue, assetAddress, {
    onApprovalSuccess: handleApprovalSuccess,
    onApprovalError: handleApprovalError,
  });

  refetchAllowanceRef.current = refetchAllowance;

  useEffect(() => {
    if (depositError) {
      const errorMessage = depositError.message || '';
      if (lastDepositError.current !== errorMessage) {
        lastDepositError.current = errorMessage;
        handleDepositError(depositError);
      }
    } else if (lastDepositError.current) {
      lastDepositError.current = null;
    }
  }, [depositError, handleDepositError]);

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
    if (isDepositSuccess) {
      setInputValue('');
    }
  }, [isDepositSuccess]);

  const handleInputChange = (value: string) => {
    setInputValue(value);
  };

  const handleMaxClick = () => {
    if (pelonBalance > 0) {
      setInputValue(pelonBalance.toFixed(6));
    }
  };

  const isValid =
    numValue > 0 &&
    hasEnoughBalance &&
    !isLoadingDeposit &&
    !isLoadingVault &&
    !isLoadingUser;

  const handleApprove = async () => {
    await approvePELON();
  };

  const handleDeposit = async () => {
    if (!isValid || !isConnected) return;
    await depositAssets();
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
        <span>💰</span>
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
            <label className="text-foreground font-bold text-sm block mb-3">
              {t('amountInPELON')}
            </label>
            <div className="relative">
              <input
                type="number"
                value={inputValue}
                onChange={(e) => handleInputChange(e.target.value)}
                placeholder={t('enterPELON')}
                step="0.000001"
                min="0"
                className={cn(
                  'w-full',
                  'bg-background',
                  'border-neobrutal',
                  'shadow-neobrutal-sm',
                  'px-4',
                  'py-3',
                  'pr-16',
                  'text-foreground',
                  'font-medium',
                  'rounded-none',
                  'focus:outline-none',
                  'focus:ring-2',
                  'focus:ring-ring',
                  'text-lg'
                )}
              />
              {isConnected && pelonBalance > 0 && (
                <button
                  type="button"
                  onClick={handleMaxClick}
                  disabled={pelonBalance <= 0}
                  className={cn(
                    'absolute',
                    'right-1',
                    'top-1/2',
                    '-translate-y-1/2',
                    'bg-secondary',
                    'text-secondary-foreground',
                    'border-neobrutal',
                    'shadow-neobrutal-sm',
                    'px-3',
                    'py-1.5',
                    'font-bold',
                    'rounded-none',
                    'text-xs',
                    'whitespace-nowrap',
                    'cursor-pointer',
                    'hover:bg-secondary/90',
                    'active:bg-secondary/80',
                    'active:shadow-none',
                    'active:translate-x-[2px]',
                    'active:translate-y-[calc(-50%+2px)]',
                    'transition-none',
                    'disabled:opacity-50',
                    'disabled:cursor-not-allowed',
                    'disabled:hover:bg-secondary',
                    'disabled:active:translate-x-0',
                    'disabled:active:translate-y-[-50%]',
                    'disabled:active:shadow-neobrutal-sm'
                  )}
                >
                  MAX
                </button>
              )}
            </div>
            {isConnected && (
              <p className="text-xs text-muted-foreground mt-2">
                {t('balance')}: {pelonBalance.toLocaleString(locale === 'es' ? 'es-ES' : 'en-US', { maximumFractionDigits: 6 })} PELON
              </p>
            )}
          </div>

          {inputValue && sharesToReceive > 0 && (
            <div
              className={cn(
                'bg-background',
                'border-neobrutal',
                'p-4',
                'rounded-none'
              )}
            >
              <div className="flex justify-between items-center mb-2">
                <span className="text-muted-foreground text-sm">{t('youWillReceive')}</span>
                <span className="text-foreground font-bold text-lg">
                  {sharesToReceive.toLocaleString(locale === 'es' ? 'es-ES' : 'en-US', { maximumFractionDigits: 6 })}{' '}
                  CALDERO
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground text-sm">{t('youWillDeposit')}</span>
                <span className="text-foreground font-bold text-lg">
                  {numValue.toLocaleString(locale === 'es' ? 'es-ES' : 'en-US', { maximumFractionDigits: 6 })} PELON
                </span>
              </div>
            </div>
          )}

          {needsApproval && !isApprovalSuccess && (
            <button
              onClick={handleApprove}
              disabled={isApproving || numValue <= 0}
              className={cn(
                'w-full',
                'bg-accent',
                'text-accent-foreground',
                'border-neobrutal',
                'shadow-neobrutal',
                'px-6',
                'py-4',
                'font-bold',
                'rounded-none',
                'text-lg',
                'hover:bg-accent/90',
                'active:bg-accent/80',
                'active:shadow-none',
                'active:translate-x-[4px]',
                'active:translate-y-[4px]',
                'transition-none',
                'disabled:opacity-50',
                'disabled:cursor-not-allowed'
              )}
            >
              {isApproving ? t('approving') : t('approvePELON')}
            </button>
          )}

          {(!needsApproval || isApprovalSuccess) && (
            <button
              onClick={handleDeposit}
              disabled={!isValid || isDepositing || isLoadingDeposit || isLoadingVault || isLoadingUser}
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
              {isDepositing ? t('processing') : t('deposit')}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

