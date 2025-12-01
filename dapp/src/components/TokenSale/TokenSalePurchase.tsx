'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { cn, stringifyWithBigInt } from '@/lib/utils';
import { useTokenSale } from '@/hooks/useTokenSale';
import { useTokenSalePurchase } from '@/hooks/useTokenSalePurchase';
import { useUSDCApproval } from '@/hooks/useUSDCApproval';
import { useTokenSaleStats } from '@/hooks/useTokenSaleStats';
import { TOKEN_SALE_ADDRESS } from '@/contracts/tokenSale';

export default function TokenSalePurchase() {
  const t = useTranslations('tokenSale.purchase');
  const { address, isConnected } = useAccount();
  const [inputValue, setInputValue] = useState('');
  const queryClient = useQueryClient();
  const lastBuyError = useRef<string | null>(null);
  const lastApproveError = useRef<string | null>(null);
  const refetchAllowanceRef = useRef<(() => void) | null>(null);

  const { currentPrice, remainingTokens, paused, isLoading: isLoadingTokenSale } = useTokenSale();
  const { refetch: refetchStats } = useTokenSaleStats();

  const numValue = parseFloat(inputValue) || 0;
  const usdcAmount = numValue;
  const tokensAmount = currentPrice > 0 ? numValue / currentPrice : 0;

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

  const handlePurchaseSuccess = useCallback(() => {
    setInputValue('');
    
    setTimeout(() => {
      const tokenSaleAddressLower = TOKEN_SALE_ADDRESS.toLowerCase();
      
      queryClient.invalidateQueries({
        predicate: (query) => {
          const queryKey = query.queryKey;
          const queryKeyString = stringifyWithBigInt(queryKey).toLowerCase();
          return queryKeyString.includes(tokenSaleAddressLower);
        },
      });
      
      queryClient.invalidateQueries({
        queryKey: ['tokenSaleStats', TOKEN_SALE_ADDRESS],
      });
      
      queryClient.refetchQueries({
        predicate: (query) => {
          const queryKey = query.queryKey;
          const queryKeyString = stringifyWithBigInt(queryKey).toLowerCase();
          return queryKeyString.includes(tokenSaleAddressLower);
        },
      });
      
      refetchStats();
      
      refetchAllowanceRef.current?.();
    }, 1000);
    
    toast.success(t('successMessage'));
  }, [queryClient, refetchStats, t]);

  const handlePurchaseError = useCallback((error: Error) => {
    const errorMessage = error.message || '';
    let toastMessage = t('errorPurchaseFailed');
    
    if (errorMessage.includes('Sale is paused')) toastMessage = t('errorSalePaused');
    else if (errorMessage.includes('exceed wallet limit')) toastMessage = t('errorWalletLimit');
    else if (errorMessage.includes('exceed total sale limit')) toastMessage = t('errorTotalSaleLimit');
    else if (errorMessage.includes('Insufficient tokens')) toastMessage = t('errorNotEnoughTokens');
    else if (errorMessage.includes('Insufficient')) toastMessage = t('errorInsufficientBalance');
    
    if (lastBuyError.current !== errorMessage) {
      lastBuyError.current = errorMessage;
      toast.error(toastMessage);
    }
  }, [t]);

  const {
    pelonAmount,
    canPurchase,
    purchaseReason,
    tokensPurchased,
    maxTokensPerWallet,
    purchaseTokens,
    isBuying,
    isBuySuccess,
    buyError,
    isLoading: isLoadingPurchase,
    isLoadingCanPurchase,
    canPurchaseResult,
  } = useTokenSalePurchase(usdcAmount, {
    onPurchaseSuccess: handlePurchaseSuccess,
    onPurchaseError: handlePurchaseError,
  });

  const {
    balance: usdcBalance,
    needsApproval,
    hasEnoughBalance,
    approveUSDC,
    isApproving,
    isApprovalSuccess,
    approveError,
    refetchAllowance,
  } = useUSDCApproval(usdcAmount, {
    onApprovalSuccess: handleApprovalSuccess,
    onApprovalError: handleApprovalError,
  });

  refetchAllowanceRef.current = refetchAllowance;

  useEffect(() => {
    if (buyError) {
      const errorMessage = buyError.message || '';
      if (lastBuyError.current !== errorMessage) {
        lastBuyError.current = errorMessage;
        handlePurchaseError(buyError);
      }
    } else if (lastBuyError.current) {
      lastBuyError.current = null;
    }
  }, [buyError, handlePurchaseError]);

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
    if (isBuySuccess) {
      setInputValue('');
    }
  }, [isBuySuccess]);

  const handleInputChange = (value: string) => {
    setInputValue(value);
  };

  const minPurchaseUSDC = 1;

  const getMaxUsdcAmount = (): number => {
    if (!isConnected || !usdcBalance || usdcBalance <= 0) return 0;
    
    let maxAmount = usdcBalance;
    
    if (currentPrice > 0 && !isLoadingTokenSale) {
      if (remainingTokens > 0) {
        const maxFromRemainingTokens = remainingTokens * currentPrice;
        maxAmount = Math.min(maxAmount, maxFromRemainingTokens);
      }
      
      if (maxTokensPerWallet > 0) {
        let maxFromWalletLimit: number;
        if (tokensPurchased > 0) {
          const remainingTokensForWallet = maxTokensPerWallet - tokensPurchased;
          if (remainingTokensForWallet > 0) {
            maxFromWalletLimit = remainingTokensForWallet * currentPrice;
            maxAmount = Math.min(maxAmount, maxFromWalletLimit);
          } else {
            return 0;
          }
        } else {
          maxFromWalletLimit = maxTokensPerWallet * currentPrice;
          maxAmount = Math.min(maxAmount, maxFromWalletLimit);
        }
      }
    }
    
    return Math.max(maxAmount, 0);
  };

  const handleMaxClick = () => {
    const maxAmount = getMaxUsdcAmount();
    if (maxAmount > 0) {
      setInputValue(maxAmount.toFixed(2));
    }
  };
  const isValid =
    usdcAmount >= minPurchaseUSDC &&
    usdcAmount > 0 &&
    canPurchase &&
    hasEnoughBalance &&
    !paused &&
    !isLoadingPurchase &&
    !isLoadingTokenSale;

  const handleApprove = async () => {
    await approveUSDC();
  };

  const handlePurchase = async () => {
    if (!isValid || !isConnected) return;
    await purchaseTokens();
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
              {t('amountInUSDC')}
            </label>
            <div className="relative">
              <input
                type="number"
                value={inputValue}
                onChange={(e) => handleInputChange(e.target.value)}
                placeholder={t('enterUSDC')}
                step="0.01"
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
              {isConnected && usdcBalance > 0 && (
                <button
                  type="button"
                  onClick={handleMaxClick}
                  disabled={getMaxUsdcAmount() <= 0}
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
                {t('balance')}: {usdcBalance.toLocaleString('en-US', { maximumFractionDigits: 2 })} USDC
              </p>
            )}
          </div>

          {(inputValue && (pelonAmount > 0 || tokensAmount > 0)) && (
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
                  {pelonAmount.toLocaleString('en-US', { maximumFractionDigits: 0 })}{' '}
                  PELON
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground text-sm">{t('youWillPay')}</span>
                <span className="text-foreground font-bold text-lg">
                  {usdcAmount.toLocaleString('en-US', { maximumFractionDigits: 2 })} USDC
                </span>
              </div>
              {currentPrice > 0 && (
                <div className="flex justify-between items-center mt-2 pt-2 border-t border-border">
                  <span className="text-muted-foreground text-xs">
                    {t('pricePerToken', { price: currentPrice.toFixed(6) })}
                  </span>
                </div>
              )}
            </div>
          )}

          {tokensPurchased > 0 && (
            <div className="text-xs text-muted-foreground">
              <p>
                {t('purchasedSoFar')}: {tokensPurchased.toLocaleString('en-US', { maximumFractionDigits: 0 })} PELON
              </p>
              {maxTokensPerWallet > 0 && (
                <p>
                  {t('maxPerWallet')}: {maxTokensPerWallet.toLocaleString('en-US', { maximumFractionDigits: 0 })} PELON
                </p>
              )}
            </div>
          )}

          {needsApproval && !isApprovalSuccess && (
            <button
              onClick={handleApprove}
              disabled={isApproving || usdcAmount <= 0}
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
              {isApproving ? t('approving') : t('approveUSDC')}
            </button>
          )}

          {(!needsApproval || isApprovalSuccess) && (
            <button
              onClick={handlePurchase}
              disabled={!isValid || isBuying || isLoadingPurchase || isLoadingTokenSale}
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
              {isBuying ? t('processing') : t('buyNow')}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
