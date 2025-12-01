import { useEffect, useRef } from 'react';
import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { useAccount } from 'wagmi';
import { parseUnits, formatUnits } from 'viem';
import { USDC_ABI, USDC_ADDRESS } from '@/contracts/usdc';
import { TOKEN_SALE_ADDRESS } from '@/contracts/tokenSale';

const USDC_DECIMALS = 6;

interface UseUSDCApprovalOptions {
  onApprovalSuccess?: (receipt: any) => void;
  onApprovalError?: (error: Error) => void;
}

export function useUSDCApproval(
  usdcAmount: number,
  options?: UseUSDCApprovalOptions
) {
  const { address } = useAccount();
  const usdcAmountBigInt = usdcAmount > 0 ? parseUnits(usdcAmount.toFixed(USDC_DECIMALS), USDC_DECIMALS) : 0n;

  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: USDC_ADDRESS,
    abi: USDC_ABI,
    functionName: 'allowance',
    args: address ? [address, TOKEN_SALE_ADDRESS] : undefined,
    query: {
      enabled: !!address,
    },
  });

  const { data: balance } = useReadContract({
    address: USDC_ADDRESS,
    abi: USDC_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });

  const {
    writeContract: approve,
    data: approveHash,
    isPending: isApproving,
    error: approveError,
  } = useWriteContract();

  const { isLoading: isWaitingApproval, isSuccess: isApprovalSuccess, data: receipt, error: receiptError } = useWaitForTransactionReceipt({
    hash: approveHash,
  });

  const hasCalledSuccessRef = useRef(false);
  const hasCalledErrorRef = useRef(false);

  useEffect(() => {
    if (isApprovalSuccess && receipt && !hasCalledSuccessRef.current) {
      hasCalledSuccessRef.current = true;
      options?.onApprovalSuccess?.(receipt);
    }
    if (!approveHash) {
      hasCalledSuccessRef.current = false;
      hasCalledErrorRef.current = false;
    }
  }, [isApprovalSuccess, receipt, approveHash, options]);

  useEffect(() => {
    if (receiptError && !hasCalledErrorRef.current && approveHash) {
      hasCalledErrorRef.current = true;
      const errorObj = receiptError instanceof Error ? receiptError : new Error(String(receiptError));
      options?.onApprovalError?.(errorObj);
    }
    if (!approveHash) {
      hasCalledErrorRef.current = false;
    }
  }, [receiptError, approveHash, options]);

  const needsApproval = allowance !== undefined && usdcAmountBigInt > 0n && allowance < usdcAmountBigInt;
  const hasEnoughBalance = balance !== undefined && usdcAmountBigInt > 0n && balance >= usdcAmountBigInt;

  const approveUSDC = async () => {
    if (!address) return;

    try {
      await approve({
        address: USDC_ADDRESS,
        abi: USDC_ABI,
        functionName: 'approve',
        args: [TOKEN_SALE_ADDRESS, usdcAmountBigInt],
      });
    } catch (error) {
      console.error('Error approving USDC:', error);
      const errorObj = error instanceof Error ? error : new Error(String(error));
      options?.onApprovalError?.(errorObj);
    }
  };

  return {
    allowance: allowance ? parseFloat(formatUnits(allowance, USDC_DECIMALS)) : 0,
    balance: balance ? parseFloat(formatUnits(balance, USDC_DECIMALS)) : 0,
    needsApproval,
    hasEnoughBalance,
    approveUSDC,
    isApproving: isApproving || isWaitingApproval,
    isApprovalSuccess,
    approveError,
    refetchAllowance,
  };
}

