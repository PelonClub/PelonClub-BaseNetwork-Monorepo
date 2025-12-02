import { useEffect, useRef } from 'react';
import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { useAccount } from 'wagmi';
import { parseUnits, formatUnits, Address } from 'viem';
import { PELON_STAKING_VAULT_ABI, PELON_STAKING_VAULT_ADDRESS } from '@/contracts/pelonStakingVault';

const PELON_DECIMALS = 18;

interface UseVaultDepositOptions {
  onDepositSuccess?: (receipt: any) => void;
  onDepositError?: (error: Error) => void;
}

export function useVaultDeposit(
  assetsAmount: number,
  options?: UseVaultDepositOptions
) {
  const { address } = useAccount();
  const assetsAmountBigInt = assetsAmount > 0 ? parseUnits(assetsAmount.toFixed(PELON_DECIMALS), PELON_DECIMALS) : 0n;

  const { data: previewShares, isLoading: isLoadingPreviewShares } = useReadContract({
    address: PELON_STAKING_VAULT_ADDRESS,
    abi: PELON_STAKING_VAULT_ABI,
    functionName: 'previewDeposit',
    args: assetsAmountBigInt > 0n ? [assetsAmountBigInt] : undefined,
    query: {
      enabled: assetsAmountBigInt > 0n,
    },
  });

  const {
    writeContract: deposit,
    data: depositHash,
    isPending: isDepositing,
    error: depositError,
  } = useWriteContract();

  const { isLoading: isWaitingDeposit, isSuccess: isDepositSuccess, data: receipt, error: receiptError } = useWaitForTransactionReceipt({
    hash: depositHash,
  });

  const hasCalledSuccessRef = useRef(false);
  const hasCalledErrorRef = useRef(false);

  useEffect(() => {
    if (isDepositSuccess && receipt && !hasCalledSuccessRef.current) {
      hasCalledSuccessRef.current = true;
      options?.onDepositSuccess?.(receipt);
    }
    if (!depositHash) {
      hasCalledSuccessRef.current = false;
      hasCalledErrorRef.current = false;
    }
  }, [isDepositSuccess, receipt, depositHash, options]);

  useEffect(() => {
    if (receiptError && !hasCalledErrorRef.current && depositHash) {
      hasCalledErrorRef.current = true;
      const errorObj = receiptError instanceof Error ? receiptError : new Error(String(receiptError));
      options?.onDepositError?.(errorObj);
    }
    if (!depositHash) {
      hasCalledErrorRef.current = false;
    }
  }, [receiptError, depositHash, options]);

  const sharesToReceive = previewShares ? parseFloat(formatUnits(previewShares, PELON_DECIMALS)) : 0;

  const depositAssets = async () => {
    if (!address || assetsAmountBigInt === 0n) return;

    try {
      await deposit({
        address: PELON_STAKING_VAULT_ADDRESS,
        abi: PELON_STAKING_VAULT_ABI,
        functionName: 'deposit',
        args: [assetsAmountBigInt, address],
      });
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error(String(error));
      options?.onDepositError?.(errorObj);
    }
  };

  return {
    sharesToReceive,
    depositAssets,
    isDepositing: isDepositing || isWaitingDeposit,
    isDepositSuccess,
    depositError,
    isLoading: isLoadingPreviewShares,
  };
}

