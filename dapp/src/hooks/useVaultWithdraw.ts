import { useEffect, useRef } from 'react';
import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { useAccount } from 'wagmi';
import { parseUnits, formatUnits } from 'viem';
import { PELON_STAKING_VAULT_ABI, PELON_STAKING_VAULT_ADDRESS } from '@/contracts/pelonStakingVault';

const PELON_DECIMALS = 18;

interface UseVaultWithdrawOptions {
  onWithdrawSuccess?: (receipt: any) => void;
  onWithdrawError?: (error: Error) => void;
  onRedeemSuccess?: (receipt: any) => void;
  onRedeemError?: (error: Error) => void;
}

interface FeeBreakdown {
  totalFee: number;
  feeToWallet: number;
  feeToVault: number;
}

export function useVaultWithdraw(
  assetsAmount: number,
  sharesAmount: number,
  withdrawFeeBps: number,
  options?: UseVaultWithdrawOptions
) {
  const { address } = useAccount();
  const assetsAmountBigInt = assetsAmount > 0 ? parseUnits(assetsAmount.toFixed(PELON_DECIMALS), PELON_DECIMALS) : 0n;
  const sharesAmountBigInt = sharesAmount > 0 ? parseUnits(sharesAmount.toFixed(PELON_DECIMALS), PELON_DECIMALS) : 0n;

  const { data: feeBps, isLoading: isLoadingFeeBps } = useReadContract({
    address: PELON_STAKING_VAULT_ADDRESS,
    abi: PELON_STAKING_VAULT_ABI,
    functionName: 'FEE_BPS',
  });

  const { data: bpsDenominator, isLoading: isLoadingBpsDenominator } = useReadContract({
    address: PELON_STAKING_VAULT_ADDRESS,
    abi: PELON_STAKING_VAULT_ABI,
    functionName: 'BPS_DENOMINATOR',
  });

  const { data: previewWithdrawShares, isLoading: isLoadingPreviewWithdraw } = useReadContract({
    address: PELON_STAKING_VAULT_ADDRESS,
    abi: PELON_STAKING_VAULT_ABI,
    functionName: 'previewWithdraw',
    args: assetsAmountBigInt > 0n ? [assetsAmountBigInt] : undefined,
    query: {
      enabled: assetsAmountBigInt > 0n,
    },
  });

  const { data: previewRedeemAssets, isLoading: isLoadingPreviewRedeem } = useReadContract({
    address: PELON_STAKING_VAULT_ADDRESS,
    abi: PELON_STAKING_VAULT_ABI,
    functionName: 'previewRedeem',
    args: sharesAmountBigInt > 0n ? [sharesAmountBigInt] : undefined,
    query: {
      enabled: sharesAmountBigInt > 0n,
    },
  });

  const {
    writeContract: withdraw,
    data: withdrawHash,
    isPending: isWithdrawing,
    error: withdrawError,
  } = useWriteContract();

  const {
    writeContract: redeem,
    data: redeemHash,
    isPending: isRedeeming,
    error: redeemError,
  } = useWriteContract();

  const { isLoading: isWaitingWithdraw, isSuccess: isWithdrawSuccess, data: withdrawReceipt, error: withdrawReceiptError } = useWaitForTransactionReceipt({
    hash: withdrawHash,
  });

  const { isLoading: isWaitingRedeem, isSuccess: isRedeemSuccess, data: redeemReceipt, error: redeemReceiptError } = useWaitForTransactionReceipt({
    hash: redeemHash,
  });

  const hasCalledWithdrawSuccessRef = useRef(false);
  const hasCalledWithdrawErrorRef = useRef(false);
  const hasCalledRedeemSuccessRef = useRef(false);
  const hasCalledRedeemErrorRef = useRef(false);

  useEffect(() => {
    if (isWithdrawSuccess && withdrawReceipt && !hasCalledWithdrawSuccessRef.current) {
      hasCalledWithdrawSuccessRef.current = true;
      options?.onWithdrawSuccess?.(withdrawReceipt);
    }
    if (!withdrawHash) {
      hasCalledWithdrawSuccessRef.current = false;
      hasCalledWithdrawErrorRef.current = false;
    }
  }, [isWithdrawSuccess, withdrawReceipt, withdrawHash, options]);

  useEffect(() => {
    if (withdrawReceiptError && !hasCalledWithdrawErrorRef.current && withdrawHash) {
      hasCalledWithdrawErrorRef.current = true;
      const errorObj = withdrawReceiptError instanceof Error ? withdrawReceiptError : new Error(String(withdrawReceiptError));
      options?.onWithdrawError?.(errorObj);
    }
    if (!withdrawHash) {
      hasCalledWithdrawErrorRef.current = false;
    }
  }, [withdrawReceiptError, withdrawHash, options]);

  useEffect(() => {
    if (isRedeemSuccess && redeemReceipt && !hasCalledRedeemSuccessRef.current) {
      hasCalledRedeemSuccessRef.current = true;
      options?.onRedeemSuccess?.(redeemReceipt);
    }
    if (!redeemHash) {
      hasCalledRedeemSuccessRef.current = false;
      hasCalledRedeemErrorRef.current = false;
    }
  }, [isRedeemSuccess, redeemReceipt, redeemHash, options]);

  useEffect(() => {
    if (redeemReceiptError && !hasCalledRedeemErrorRef.current && redeemHash) {
      hasCalledRedeemErrorRef.current = true;
      const errorObj = redeemReceiptError instanceof Error ? redeemReceiptError : new Error(String(redeemReceiptError));
      options?.onRedeemError?.(errorObj);
    }
    if (!redeemHash) {
      hasCalledRedeemErrorRef.current = false;
    }
  }, [redeemReceiptError, redeemHash, options]);

  const calculateFeeBreakdown = (assets: number): FeeBreakdown => {
    if (assets <= 0 || !feeBps || !bpsDenominator) {
      return {
        totalFee: 0,
        feeToWallet: 0,
        feeToVault: 0,
      };
    }

    const feeBpsNumber = Number(feeBps);
    const bpsDenominatorNumber = Number(bpsDenominator);
    const totalFee = (assets * feeBpsNumber) / bpsDenominatorNumber;
    const feeToWallet = totalFee * 0.5;
    const feeToVault = totalFee * 0.5;

    return {
      totalFee,
      feeToWallet,
      feeToVault,
    };
  };

  const withdrawSharesNeeded = previewWithdrawShares ? parseFloat(formatUnits(previewWithdrawShares, PELON_DECIMALS)) : 0;
  const redeemAssetsBeforeFee = previewRedeemAssets ? parseFloat(formatUnits(previewRedeemAssets, PELON_DECIMALS)) : 0;

  const withdrawFeeBreakdown = assetsAmount > 0 ? calculateFeeBreakdown(assetsAmount) : {
    totalFee: 0,
    feeToWallet: 0,
    feeToVault: 0,
  };
  const withdrawNetAssets = assetsAmount > 0 ? assetsAmount - withdrawFeeBreakdown.totalFee : 0;

  const redeemFeeBreakdown = redeemAssetsBeforeFee > 0 ? calculateFeeBreakdown(redeemAssetsBeforeFee) : {
    totalFee: 0,
    feeToWallet: 0,
    feeToVault: 0,
  };
  const redeemNetAssets = redeemAssetsBeforeFee > 0 ? redeemAssetsBeforeFee - redeemFeeBreakdown.totalFee : 0;

  const withdrawAssets = async () => {
    if (!address || assetsAmountBigInt === 0n) return;

    try {
      await withdraw({
        address: PELON_STAKING_VAULT_ADDRESS,
        abi: PELON_STAKING_VAULT_ABI,
        functionName: 'withdraw',
        args: [assetsAmountBigInt, address, address],
      });
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error(String(error));
      options?.onWithdrawError?.(errorObj);
    }
  };

  const redeemShares = async () => {
    if (!address || sharesAmountBigInt === 0n) return;

    try {
      await redeem({
        address: PELON_STAKING_VAULT_ADDRESS,
        abi: PELON_STAKING_VAULT_ABI,
        functionName: 'redeem',
        args: [sharesAmountBigInt, address, address],
      });
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error(String(error));
      options?.onRedeemError?.(errorObj);
    }
  };

  return {
    withdrawSharesNeeded,
    withdrawNetAssets,
    withdrawFeeBreakdown,
    redeemAssetsBeforeFee,
    redeemNetAssets,
    redeemFeeBreakdown,
    withdrawAssets,
    redeemShares,
    isWithdrawing: isWithdrawing || isWaitingWithdraw,
    isRedeeming: isRedeeming || isWaitingRedeem,
    isWithdrawSuccess,
    isRedeemSuccess,
    withdrawError,
    redeemError,
    isLoading:
      isLoadingPreviewWithdraw ||
      isLoadingPreviewRedeem ||
      isLoadingFeeBps ||
      isLoadingBpsDenominator,
  };
}

