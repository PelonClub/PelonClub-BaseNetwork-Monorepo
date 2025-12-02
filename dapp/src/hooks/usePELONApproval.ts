import { useEffect, useRef } from 'react';
import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { useAccount } from 'wagmi';
import { parseUnits, formatUnits, Address } from 'viem';
import { PELON_CLUB_TOKEN_ABI } from '@/contracts/pelonClubToken';
import { PELON_STAKING_VAULT_ADDRESS } from '@/contracts/pelonStakingVault';

const PELON_DECIMALS = 18;

interface UsePELONApprovalOptions {
  onApprovalSuccess?: (receipt: any) => void;
  onApprovalError?: (error: Error) => void;
}

export function usePELONApproval(
  pelonAmount: number,
  assetAddress?: Address,
  options?: UsePELONApprovalOptions
) {
  const { address } = useAccount();
  const pelonAmountBigInt = pelonAmount > 0 ? parseUnits(pelonAmount.toFixed(PELON_DECIMALS), PELON_DECIMALS) : 0n;

  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: assetAddress,
    abi: PELON_CLUB_TOKEN_ABI,
    functionName: 'allowance',
    args: address && assetAddress ? [address, PELON_STAKING_VAULT_ADDRESS] : undefined,
    query: {
      enabled: !!address && !!assetAddress,
    },
  });

  const { data: balance } = useReadContract({
    address: assetAddress,
    abi: PELON_CLUB_TOKEN_ABI,
    functionName: 'balanceOf',
    args: address && assetAddress ? [address] : undefined,
    query: {
      enabled: !!address && !!assetAddress,
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

  const needsApproval = allowance !== undefined && pelonAmountBigInt > 0n && allowance < pelonAmountBigInt;
  const hasEnoughBalance = balance !== undefined && pelonAmountBigInt > 0n && balance >= pelonAmountBigInt;

  const approvePELON = async () => {
    if (!address || !assetAddress) return;

    try {
      await approve({
        address: assetAddress,
        abi: PELON_CLUB_TOKEN_ABI,
        functionName: 'approve',
        args: [PELON_STAKING_VAULT_ADDRESS, pelonAmountBigInt],
      });
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error(String(error));
      options?.onApprovalError?.(errorObj);
    }
  };

  return {
    allowance: allowance ? parseFloat(formatUnits(allowance, PELON_DECIMALS)) : 0,
    balance: balance ? parseFloat(formatUnits(balance, PELON_DECIMALS)) : 0,
    needsApproval,
    hasEnoughBalance,
    approvePELON,
    isApproving: isApproving || isWaitingApproval,
    isApprovalSuccess,
    approveError,
    refetchAllowance,
  };
}

