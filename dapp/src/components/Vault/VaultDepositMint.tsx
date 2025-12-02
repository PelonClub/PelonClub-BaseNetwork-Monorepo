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
import { useVaultMint } from '@/hooks/useVaultMint';
import { usePELONApproval } from '@/hooks/usePELONApproval';
import { useUserVaultData } from '@/hooks/useUserVaultData';
import { PELON_STAKING_VAULT_ADDRESS } from '@/contracts/pelonStakingVault';

type DepositMode = 'deposit' | 'mint';

export default function VaultDepositMint() {
  const tDeposit = useTranslations('vault.deposit');
  const tMint = useTranslations('vault.mint');
  const locale = useLocale();
  const { address, isConnected } = useAccount();
  const [mode, setMode] = useState<DepositMode>('deposit');
  const [inputValue, setInputValue] = useState('');
  const queryClient = useQueryClient();
  const lastDepositError = useRef<string | null>(null);
  const lastMintError = useRef<string | null>(null);
  const lastApproveError = useRef<string | null>(null);
  const refetchAllowanceRef = useRef<(() => void) | null>(null);

  const { assetAddress, isLoading: isLoadingVault } = useVault();
  const { pelonBalance, isLoading: isLoadingUser } = useUserVaultData(assetAddress);

  const numValue = parseFloat(inputValue) || 0;
  const assetsAmount = mode === 'deposit' ? numValue : 0;
  const sharesAmount = mode === 'mint' ? numValue : 0;

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
      
      refetchAllowanceRef.current?.();
    }, 1000);
  }, [queryClient]);

  const handleApprovalSuccess = useCallback(() => {
    refetchAllowanceRef.current?.();
    const t = mode === 'deposit' ? tDeposit : tMint;
    toast.success(t('successApprovalMessage'));
  }, [mode, tDeposit, tMint]);

  const handleApprovalError = useCallback((error: Error) => {
    const errorMessage = error.message || '';
    const t = mode === 'deposit' ? tDeposit : tMint;
    if (lastApproveError.current !== errorMessage) {
      lastApproveError.current = errorMessage;
      toast.error(t('errorApprovalFailed'));
    }
  }, [mode, tDeposit, tMint]);

  const handleDepositSuccess = useCallback(() => {
    setInputValue('');
    invalidateQueries();
    toast.success(tDeposit('successMessage'));
  }, [tDeposit, invalidateQueries]);

  const handleDepositError = useCallback((error: Error) => {
    const errorMessage = error.message || '';
    let toastMessage = tDeposit('errorDepositFailed');
    
    if (errorMessage.includes('insufficient balance')) toastMessage = tDeposit('errorInsufficientBalance');
    else if (errorMessage.includes('allowance')) toastMessage = tDeposit('errorInsufficientAllowance');
    
    if (lastDepositError.current !== errorMessage) {
      lastDepositError.current = errorMessage;
      toast.error(toastMessage);
    }
  }, [tDeposit]);

  const handleMintSuccess = useCallback(() => {
    setInputValue('');
    invalidateQueries();
    toast.success(tMint('successMessage'));
  }, [tMint, invalidateQueries]);

  const handleMintError = useCallback((error: Error) => {
    const errorMessage = error.message || '';
    let toastMessage = tMint('errorMintFailed');
    
    if (errorMessage.includes('insufficient balance')) toastMessage = tMint('errorInsufficientBalance');
    else if (errorMessage.includes('allowance')) toastMessage = tMint('errorInsufficientAllowance');
    
    if (lastMintError.current !== errorMessage) {
      lastMintError.current = errorMessage;
      toast.error(toastMessage);
    }
  }, [tMint]);

  const {
    sharesToReceive,
    depositAssets,
    isDepositing,
    isDepositSuccess,
    depositError,
    isLoading: isLoadingDeposit,
  } = useVaultDeposit(assetsAmount, {
    onDepositSuccess: handleDepositSuccess,
    onDepositError: handleDepositError,
  });

  const {
    assetsNeeded,
    mintShares,
    isMinting,
    isMintSuccess,
    mintError,
    isLoading: isLoadingMint,
  } = useVaultMint(sharesAmount, {
    onMintSuccess: handleMintSuccess,
    onMintError: handleMintError,
  });

  const approvalAmount = mode === 'deposit' ? assetsAmount : assetsNeeded;

  const {
    needsApproval,
    hasEnoughBalance,
    approvePELON,
    isApproving,
    isApprovalSuccess,
    approveError,
    refetchAllowance,
  } = usePELONApproval(approvalAmount, assetAddress, {
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
    if (mintError) {
      const errorMessage = mintError.message || '';
      if (lastMintError.current !== errorMessage) {
        lastMintError.current = errorMessage;
        handleMintError(mintError);
      }
    } else if (lastMintError.current) {
      lastMintError.current = null;
    }
  }, [mintError, handleMintError]);

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
    if (isDepositSuccess || isMintSuccess) {
      setInputValue('');
    }
  }, [isDepositSuccess, isMintSuccess]);

  const handleInputChange = (value: string) => {
    setInputValue(value);
  };

  const handleMaxClick = () => {
    if (mode === 'deposit' && pelonBalance > 0) {
      setInputValue(pelonBalance.toFixed(6));
    }
  };

  const isValid =
    numValue > 0 &&
    hasEnoughBalance &&
    ((mode === 'deposit' && !isLoadingDeposit) || (mode === 'mint' && !isLoadingMint)) &&
    !isLoadingVault &&
    !isLoadingUser;

  const handleApprove = async () => {
    await approvePELON();
  };

  const handleDeposit = async () => {
    if (!isValid || !isConnected || mode !== 'deposit') return;
    await depositAssets();
  };

  const handleMint = async () => {
    if (!isValid || !isConnected || mode !== 'mint') return;
    await mintShares();
  };

  const t = mode === 'deposit' ? tDeposit : tMint;
  const isLoadingPreview = mode === 'deposit' ? isLoadingDeposit : isLoadingMint;
  const isProcessing = mode === 'deposit' ? isDepositing : isMinting;

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
        <span>{mode === 'deposit' ? '💰' : '🪙'}</span>
        <span>{mode === 'deposit' ? tDeposit('title') : tMint('title')}</span>
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
                setMode('deposit');
                setInputValue('');
              }}
              className={cn(
                'flex-1',
                'px-4',
                'py-3',
                'font-bold',
                'rounded-none',
                'border-neobrutal',
                mode === 'deposit'
                  ? 'bg-primary text-primary-foreground shadow-neobrutal'
                  : 'bg-background text-foreground shadow-neobrutal-sm'
              )}
            >
              {tDeposit('title')}
            </button>
            <button
              onClick={() => {
                setMode('mint');
                setInputValue('');
              }}
              className={cn(
                'flex-1',
                'px-4',
                'py-3',
                'font-bold',
                'rounded-none',
                'border-neobrutal',
                mode === 'mint'
                  ? 'bg-primary text-primary-foreground shadow-neobrutal'
                  : 'bg-background text-foreground shadow-neobrutal-sm'
              )}
            >
              {tMint('title')}
            </button>
          </div>

          <div>
            <label className="text-foreground font-bold text-sm block mb-3">
              {mode === 'deposit' ? tDeposit('amountInPELON') : tMint('amountInShares')}
            </label>
            <div className="relative">
              <input
                type="number"
                value={inputValue}
                onChange={(e) => handleInputChange(e.target.value)}
                placeholder={mode === 'deposit' ? tDeposit('enterPELON') : tMint('enterShares')}
                step="0.000001"
                min="0"
                className={cn(
                  'w-full',
                  'bg-background',
                  'border-neobrutal',
                  'shadow-neobrutal-sm',
                  'px-4',
                  'py-3',
                  mode === 'deposit' ? 'pr-16' : '',
                  'text-foreground',
                  'font-medium',
                  'rounded-none',
                  'focus:outline-none',
                  'focus:ring-2',
                  'focus:ring-ring',
                  'text-lg'
                )}
              />
              {mode === 'deposit' && pelonBalance > 0 && (
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
                    'disabled:cursor-not-allowed'
                  )}
                >
                  MAX
                </button>
              )}
            </div>
            {mode === 'deposit' && (
              <p className="text-xs text-muted-foreground mt-2">
                {tDeposit('balance')}: {pelonBalance.toLocaleString(locale === 'es' ? 'es-ES' : 'en-US', { maximumFractionDigits: 6 })} PELON
              </p>
            )}
            {mode === 'mint' && (
              <p className="text-xs text-muted-foreground mt-2">
                {tMint('description')}
              </p>
            )}
          </div>

          {inputValue && numValue > 0 && (
            <div
              className={cn(
                'bg-background',
                'border-neobrutal',
                'p-4',
                'rounded-none'
              )}
            >
              {mode === 'deposit' && sharesToReceive > 0 && (
                <>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-muted-foreground text-sm">{tDeposit('youWillReceive')}</span>
                    <span className="text-foreground font-bold text-lg">
                      {sharesToReceive.toLocaleString(locale === 'es' ? 'es-ES' : 'en-US', { maximumFractionDigits: 6 })} CALDERO
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground text-sm">{tDeposit('youWillDeposit')}</span>
                    <span className="text-foreground font-bold text-lg">
                      {numValue.toLocaleString(locale === 'es' ? 'es-ES' : 'en-US', { maximumFractionDigits: 6 })} PELON
                    </span>
                  </div>
                </>
              )}
              {mode === 'mint' && assetsNeeded > 0 && (
                <>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-muted-foreground text-sm">{tMint('youWillReceive')}</span>
                    <span className="text-foreground font-bold text-lg">
                      {numValue.toLocaleString(locale === 'es' ? 'es-ES' : 'en-US', { maximumFractionDigits: 6 })} CALDERO
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground text-sm">{tMint('youWillDeposit')}</span>
                    <span className="text-foreground font-bold text-lg">
                      {assetsNeeded.toLocaleString(locale === 'es' ? 'es-ES' : 'en-US', { maximumFractionDigits: 6 })} PELON
                    </span>
                  </div>
                </>
              )}
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
            mode === 'deposit' ? (
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
                {isDepositing ? tDeposit('processing') : tDeposit('deposit')}
              </button>
            ) : (
              <button
                onClick={handleMint}
                disabled={!isValid || isMinting || isLoadingMint || isLoadingVault || isLoadingUser}
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
                {isMinting ? tMint('processing') : tMint('mint')}
              </button>
            )
          )}
        </div>
      )}
    </div>
  );
}

