import { useEffect, useRef } from 'react';
import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { useAccount } from 'wagmi';
import { parseUnits, formatUnits } from 'viem';
import { PELON_STAKING_VAULT_ABI, PELON_STAKING_VAULT_ADDRESS } from '@/contracts/pelonStakingVault';

const PELON_DECIMALS = 18;

interface UseVaultMintOptions {
  onMintSuccess?: (receipt: any) => void;
  onMintError?: (error: Error) => void;
}

export function useVaultMint(
  sharesAmount: number,
  options?: UseVaultMintOptions
) {
  const { address } = useAccount();
  const sharesAmountBigInt = sharesAmount > 0 ? parseUnits(sharesAmount.toFixed(PELON_DECIMALS), PELON_DECIMALS) : 0n;

  const { data: previewAssets, isLoading: isLoadingPreviewAssets } = useReadContract({
    address: PELON_STAKING_VAULT_ADDRESS,
    abi: PELON_STAKING_VAULT_ABI,
    functionName: 'previewMint',
    args: sharesAmountBigInt > 0n ? [sharesAmountBigInt] : undefined,
    query: {
      enabled: sharesAmountBigInt > 0n,
    },
  });

  const {
    writeContract: mint,
    data: mintHash,
    isPending: isMinting,
    error: mintError,
  } = useWriteContract();

  const { isLoading: isWaitingMint, isSuccess: isMintSuccess, data: receipt, error: receiptError } = useWaitForTransactionReceipt({
    hash: mintHash,
  });

  const hasCalledSuccessRef = useRef(false);
  const hasCalledErrorRef = useRef(false);

  useEffect(() => {
    if (isMintSuccess && receipt && !hasCalledSuccessRef.current) {
      hasCalledSuccessRef.current = true;
      options?.onMintSuccess?.(receipt);
    }
    if (!mintHash) {
      hasCalledSuccessRef.current = false;
      hasCalledErrorRef.current = false;
    }
  }, [isMintSuccess, receipt, mintHash, options]);

  useEffect(() => {
    if (receiptError && !hasCalledErrorRef.current && mintHash) {
      hasCalledErrorRef.current = true;
      const errorObj = receiptError instanceof Error ? receiptError : new Error(String(receiptError));
      options?.onMintError?.(errorObj);
    }
    if (!mintHash) {
      hasCalledErrorRef.current = false;
    }
  }, [receiptError, mintHash, options]);

  const assetsNeeded = previewAssets ? parseFloat(formatUnits(previewAssets, PELON_DECIMALS)) : 0;

  const mintShares = async () => {
    if (!address || sharesAmountBigInt === 0n) return;

    try {
      await mint({
        address: PELON_STAKING_VAULT_ADDRESS,
        abi: PELON_STAKING_VAULT_ABI,
        functionName: 'mint',
        args: [sharesAmountBigInt, address],
      });
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error(String(error));
      options?.onMintError?.(errorObj);
    }
  };

  return {
    assetsNeeded,
    mintShares,
    isMinting: isMinting || isWaitingMint,
    isMintSuccess,
    mintError,
    isLoading: isLoadingPreviewAssets,
  };
}

