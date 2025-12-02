'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { cn, stringifyWithBigInt } from '@/lib/utils';
import { useVault } from '@/hooks/useVault';
import { useVaultWithdraw } from '@/hooks/useVaultWithdraw';
import { useUserVaultData } from '@/hooks/useUserVaultData';
import { PELON_STAKING_VAULT_ADDRESS } from '@/contracts/pelonStakingVault';

interface TimelockMessageProps {
  unlockTime: number;
}

function TimelockMessage({ unlockTime }: TimelockMessageProps) {
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [days, setDays] = useState<number>(0);
  const [hours, setHours] = useState<number>(0);
  const [minutes, setMinutes] = useState<number>(0);
  const [seconds, setSeconds] = useState<number>(0);

  useEffect(() => {
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
  }, [unlockTime]);

  if (timeRemaining <= 0) {
    return null;
  }

  return (
    <div
      className={cn(
        'bg-amber-500/20',
        'border-neobrutal',
        'shadow-neobrutal-sm',
        'p-4',
        'rounded-none',
        'space-y-2'
      )}
    >
      <div className="flex items-center gap-2">
        <span className="text-amber-500 font-bold text-lg">⏳</span>
        <span className="text-foreground font-bold">
          Timelock activo: Los fondos se desbloquearán en:
        </span>
      </div>
      <div className="flex gap-2 flex-wrap text-foreground font-bold">
        {days > 0 && <span>{days}d</span>}
        {hours > 0 && <span>{hours}h</span>}
        {minutes > 0 && <span>{minutes}m</span>}
        <span>{seconds}s</span>
      </div>
    </div>
  );
}

type WithdrawMode = 'withdraw' | 'redeem';

export default function VaultWithdraw() {
  const t = useTranslations('vault.withdraw');
  const locale = useLocale();
  const { address, isConnected } = useAccount();
  const [mode, setMode] = useState<WithdrawMode>('withdraw');
  const [inputValue, setInputValue] = useState('');
  const queryClient = useQueryClient();
  const lastWithdrawError = useRef<string | null>(null);
  const lastRedeemError = useRef<string | null>(null);

  const {
    withdrawFeeBps,
    assetAddress,
    isLoading: isLoadingVault,
  } = useVault();
  const {
    shareBalance,
    withdrawableAssets,
    withdrawableShares,
    deposits,
    isLoading: isLoadingUser,
  } = useUserVaultData(assetAddress);

  const numValue = parseFloat(inputValue) || 0;
  const assetsAmount = mode === 'withdraw' ? numValue : 0;
  const sharesAmount = mode === 'redeem' ? numValue : 0;

  const invalidateQueries = useCallback(() => {
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
    }, 1000);
  }, [queryClient]);

  const handleWithdrawSuccess = useCallback((receipt: any) => {
    setInputValue('');
    invalidateQueries();
    toast.success(t('successWithdrawMessage'));
  }, [t, invalidateQueries]);

  const handleWithdrawError = useCallback((error: Error) => {
    const errorMessage = error.message || '';
    let toastMessage = t('errorWithdrawFailed');
    
    if (errorMessage.includes('timelock')) toastMessage = t('errorTimelockNotExpired');
    else if (errorMessage.includes('Insufficient')) toastMessage = t('errorInsufficientWithdrawable');
    
    if (lastWithdrawError.current !== errorMessage) {
      lastWithdrawError.current = errorMessage;
      toast.error(toastMessage);
    }
  }, [t]);

  const handleRedeemSuccess = useCallback((receipt: any) => {
    setInputValue('');
    invalidateQueries();
    toast.success(t('successRedeemMessage'));
  }, [t, invalidateQueries]);

  const handleRedeemError = useCallback((error: Error) => {
    const errorMessage = error.message || '';
    let toastMessage = t('errorRedeemFailed');
    
    if (errorMessage.includes('timelock')) toastMessage = t('errorTimelockNotExpired');
    else if (errorMessage.includes('Insufficient')) toastMessage = t('errorInsufficientWithdrawable');
    
    if (lastRedeemError.current !== errorMessage) {
      lastRedeemError.current = errorMessage;
      toast.error(toastMessage);
    }
  }, [t]);

  const {
    withdrawNetAssets,
    withdrawFeeBreakdown,
    redeemNetAssets,
    redeemFeeBreakdown,
    redeemAssetsBeforeFee,
    withdrawAssets,
    redeemShares,
    isWithdrawing,
    isRedeeming,
    isWithdrawSuccess,
    isRedeemSuccess,
    withdrawError,
    redeemError,
    isLoading: isLoadingPreview,
  } = useVaultWithdraw(assetsAmount, sharesAmount, withdrawFeeBps, {
    onWithdrawSuccess: handleWithdrawSuccess,
    onWithdrawError: handleWithdrawError,
    onRedeemSuccess: handleRedeemSuccess,
    onRedeemError: handleRedeemError,
  });

  useEffect(() => {
    if (withdrawError) {
      const errorMessage = withdrawError.message || '';
      if (lastWithdrawError.current !== errorMessage) {
        lastWithdrawError.current = errorMessage;
        handleWithdrawError(withdrawError);
      }
    } else if (lastWithdrawError.current) {
      lastWithdrawError.current = null;
    }
  }, [withdrawError, handleWithdrawError]);

  useEffect(() => {
    if (redeemError) {
      const errorMessage = redeemError.message || '';
      if (lastRedeemError.current !== errorMessage) {
        lastRedeemError.current = errorMessage;
        handleRedeemError(redeemError);
      }
    } else if (lastRedeemError.current) {
      lastRedeemError.current = null;
    }
  }, [redeemError, handleRedeemError]);

  useEffect(() => {
    if (isWithdrawSuccess || isRedeemSuccess) {
      setInputValue('');
    }
  }, [isWithdrawSuccess, isRedeemSuccess]);

  const handleInputChange = (value: string) => {
    setInputValue(value);
  };

  const handleMaxClick = () => {
    if (mode === 'withdraw' && withdrawableAssets > 0) {
      setInputValue(withdrawableAssets.toFixed(6));
    } else if (mode === 'redeem' && withdrawableShares > 0) {
      setInputValue(withdrawableShares.toFixed(6));
    }
  };

  const maxAvailable = mode === 'withdraw' ? withdrawableAssets : withdrawableShares;
  
  const hasLockedDeposit = deposits.some((deposit) => !deposit.isUnlocked);
  const lockedDeposit = deposits.find((deposit) => !deposit.isUnlocked);
  const isTimelockUnlocked = !hasLockedDeposit;
  
  const isValid =
    numValue > 0 &&
    numValue <= maxAvailable &&
    isTimelockUnlocked &&
    !isLoadingPreview &&
    !isLoadingVault &&
    !isLoadingUser;

  const handleWithdraw = async () => {
    if (!isValid || !isConnected || mode !== 'withdraw') return;
    await withdrawAssets();
  };

  const handleRedeem = async () => {
    if (!isValid || !isConnected || mode !== 'redeem') return;
    await redeemShares();
  };

  const currentFeeBreakdown = mode === 'withdraw' ? withdrawFeeBreakdown : redeemFeeBreakdown;
  const netAmount = mode === 'withdraw' ? withdrawNetAssets : redeemNetAssets;
  const assetsBeforeFee = mode === 'withdraw' ? numValue : redeemAssetsBeforeFee;

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
        <span>💸</span>
        <span>{t('title')}</span>
      </h2>

      {!isConnected ? (
        <div className="space-y-4">
          <p className="text-muted-foreground">{t('connectWallet')}</p>
          <ConnectButton />
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex gap-2">
            <button
              onClick={() => {
                setMode('withdraw');
                setInputValue('');
              }}
              className={cn(
                'flex-1',
                'px-4',
                'py-3',
                'font-bold',
                'rounded-none',
                'border-neobrutal',
                mode === 'withdraw'
                  ? 'bg-primary text-primary-foreground shadow-neobrutal'
                  : 'bg-background text-foreground shadow-neobrutal-sm'
              )}
            >
              {t('withdrawAssets')}
            </button>
            <button
              onClick={() => {
                setMode('redeem');
                setInputValue('');
              }}
              className={cn(
                'flex-1',
                'px-4',
                'py-3',
                'font-bold',
                'rounded-none',
                'border-neobrutal',
                mode === 'redeem'
                  ? 'bg-primary text-primary-foreground shadow-neobrutal'
                  : 'bg-background text-foreground shadow-neobrutal-sm'
              )}
            >
              {t('redeemShares')}
            </button>
          </div>

          {hasLockedDeposit && lockedDeposit && (
            <TimelockMessage unlockTime={lockedDeposit.unlockTime} />
          )}

          <div>
            <label className="text-foreground font-bold text-sm block mb-3">
              {mode === 'withdraw' ? t('amountInPELON') : t('amountInShares')}
            </label>
            <div className="relative">
              <input
                type="number"
                value={inputValue}
                onChange={(e) => handleInputChange(e.target.value)}
                placeholder={mode === 'withdraw' ? t('enterPELON') : t('enterShares')}
                step="0.000001"
                min="0"
                max={maxAvailable}
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
              {maxAvailable > 0 && (
                <button
                  type="button"
                  onClick={handleMaxClick}
                  disabled={maxAvailable <= 0}
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
                    'disabled:cursor-not-allowed'
                  )}
                >
                  MAX
                </button>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {mode === 'withdraw' ? t('withdrawable') : t('withdrawableShares')}:{' '}
              {maxAvailable.toLocaleString(locale === 'es' ? 'es-ES' : 'en-US', { maximumFractionDigits: 6 })}{' '}
              {mode === 'withdraw' ? 'PELON' : 'CALDERO'}
            </p>
          </div>

          {inputValue && numValue > 0 && (
            <div
              className={cn(
                'bg-background',
                'border-neobrutal',
                'p-4',
                'rounded-none',
                'space-y-3'
              )}
            >
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground text-sm">{t('amountBeforeFee')}</span>
                <span className="text-foreground font-bold">
                  {assetsBeforeFee.toLocaleString(locale === 'es' ? 'es-ES' : 'en-US', { maximumFractionDigits: 6 })} PELON
                </span>
              </div>

              {currentFeeBreakdown.totalFee > 0 && (
                <div className="border-t border-border pt-3 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground text-xs">{t('totalFee')}</span>
                    <span className="text-foreground font-bold text-sm">
                      {currentFeeBreakdown.totalFee.toLocaleString(locale === 'es' ? 'es-ES' : 'en-US', { maximumFractionDigits: 6 })} PELON
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <div className="text-muted-foreground">{t('feeToWallet')}</div>
                      <div className="text-foreground font-medium">
                        {currentFeeBreakdown.feeToWallet.toLocaleString(locale === 'es' ? 'es-ES' : 'en-US', { maximumFractionDigits: 6 })}
                      </div>
                      <div className="text-muted-foreground">(50%)</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">{t('feeToVault')}</div>
                      <div className="text-foreground font-medium">
                        {currentFeeBreakdown.feeToVault.toLocaleString(locale === 'es' ? 'es-ES' : 'en-US', { maximumFractionDigits: 6 })}
                      </div>
                      <div className="text-muted-foreground">(50%)</div>
                    </div>
                  </div>
                </div>
              )}

              <div className="border-t border-border pt-3">
                <div className="flex justify-between items-center">
                  <span className="text-foreground font-bold">{t('youWillReceive')}</span>
                  <span className="text-foreground font-bold text-lg">
                    {netAmount.toLocaleString(locale === 'es' ? 'es-ES' : 'en-US', { maximumFractionDigits: 6 })} PELON
                  </span>
                </div>
              </div>
            </div>
          )}

          {mode === 'withdraw' ? (
            <button
              onClick={handleWithdraw}
              disabled={!isValid || isWithdrawing || isLoadingPreview || isLoadingVault || isLoadingUser}
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
              {isWithdrawing ? t('processing') : t('withdraw')}
            </button>
          ) : (
            <button
              onClick={handleRedeem}
              disabled={!isValid || isRedeeming || isLoadingPreview || isLoadingVault || isLoadingUser}
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
              {isRedeeming ? t('processing') : t('redeem')}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

