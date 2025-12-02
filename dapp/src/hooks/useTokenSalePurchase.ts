import { useEffect, useRef } from 'react';
import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { useAccount } from 'wagmi';
import { parseUnits, formatUnits } from 'viem';
import { TOKEN_SALE_ABI, TOKEN_SALE_ADDRESS } from '@/contracts/tokenSale';

const USDC_DECIMALS = 6;
const PELON_DECIMALS = 18;

interface UseTokenSalePurchaseOptions {
  onPurchaseSuccess?: (receipt: any) => void;
  onPurchaseError?: (error: Error) => void;
}

export function useTokenSalePurchase(
  usdcAmount: number,
  options?: UseTokenSalePurchaseOptions
) {
  const { address } = useAccount();
  const usdcAmountBigInt = usdcAmount > 0 ? parseUnits(usdcAmount.toFixed(USDC_DECIMALS), USDC_DECIMALS) : 0n;

  const { data: pelonAmount, isLoading: isLoadingPelonAmount } = useReadContract({
    address: TOKEN_SALE_ADDRESS,
    abi: TOKEN_SALE_ABI,
    functionName: 'getPelonAmount',
    args: usdcAmountBigInt > 0n ? [usdcAmountBigInt] : undefined,
    query: {
      enabled: usdcAmountBigInt > 0n,
    },
  });

  const { data: canPurchaseResult, isLoading: isLoadingCanPurchase } = useReadContract({
    address: TOKEN_SALE_ADDRESS,
    abi: TOKEN_SALE_ABI,
    functionName: 'canPurchase',
    args: address && usdcAmountBigInt > 0n ? [address, usdcAmountBigInt] : undefined,
    query: {
      enabled: !!address && usdcAmountBigInt > 0n,
    },
  });

  const { data: tokensPurchased } = useReadContract({
    address: TOKEN_SALE_ADDRESS,
    abi: TOKEN_SALE_ABI,
    functionName: 'tokensPurchased',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });

  const { data: maxTokensPerWallet } = useReadContract({
    address: TOKEN_SALE_ADDRESS,
    abi: TOKEN_SALE_ABI,
    functionName: 'maxTokensPerWallet',
  });

  const {
    writeContract: buyTokens,
    data: buyHash,
    isPending: isBuying,
    error: buyError,
  } = useWriteContract();

  const { isLoading: isWaitingBuy, isSuccess: isBuySuccess, data: receipt, error: receiptError } = useWaitForTransactionReceipt({
    hash: buyHash,
  });

  const hasCalledSuccessRef = useRef(false);
  const hasCalledErrorRef = useRef(false);

  useEffect(() => {
    if (isBuySuccess && receipt && !hasCalledSuccessRef.current) {
      hasCalledSuccessRef.current = true;
      options?.onPurchaseSuccess?.(receipt);
    }
    if (!buyHash) {
      hasCalledSuccessRef.current = false;
      hasCalledErrorRef.current = false;
    }
  }, [isBuySuccess, receipt, buyHash, options]);

  useEffect(() => {
    if (receiptError && !hasCalledErrorRef.current && buyHash) {
      hasCalledErrorRef.current = true;
      const errorObj = receiptError instanceof Error ? receiptError : new Error(String(receiptError));
      options?.onPurchaseError?.(errorObj);
    }
    if (!buyHash) {
      hasCalledErrorRef.current = false;
    }
  }, [receiptError, buyHash, options]);

  const canPurchase = canPurchaseResult?.[0] ?? false;
  const purchaseReason = canPurchaseResult?.[1] ?? '';

  const pelonAmountFormatted = pelonAmount ? parseFloat(formatUnits(pelonAmount, PELON_DECIMALS)) : 0;
  const tokensPurchasedFormatted = tokensPurchased ? parseFloat(formatUnits(tokensPurchased, PELON_DECIMALS)) : 0;
  const maxTokensPerWalletFormatted = maxTokensPerWallet ? parseFloat(formatUnits(maxTokensPerWallet, PELON_DECIMALS)) : 0;

  const purchaseTokens = async () => {
    if (!address || usdcAmountBigInt === 0n) return;

    try {
      await buyTokens({
        address: TOKEN_SALE_ADDRESS,
        abi: TOKEN_SALE_ABI,
        functionName: 'buyTokens',
        args: [usdcAmountBigInt],
      });
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error(String(error));
      options?.onPurchaseError?.(errorObj);
    }
  };

  return {
    pelonAmount: pelonAmountFormatted,
    canPurchase,
    purchaseReason,
    tokensPurchased: tokensPurchasedFormatted,
    maxTokensPerWallet: maxTokensPerWalletFormatted,
    purchaseTokens,
    isBuying: isBuying || isWaitingBuy,
    isBuySuccess,
    buyError,
    isLoading: isLoadingPelonAmount || isLoadingCanPurchase,
    isLoadingCanPurchase,
    canPurchaseResult,
  };
}

