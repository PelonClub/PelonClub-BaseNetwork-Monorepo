import { useReadContract } from 'wagmi';
import { useAccount } from 'wagmi';
import { formatUnits, Address } from 'viem';
import { PELON_STAKING_VAULT_ABI, PELON_STAKING_VAULT_ADDRESS } from '@/contracts/pelonStakingVault';
import { PELON_CLUB_TOKEN_ABI } from '@/contracts/pelonClubToken';

const PELON_DECIMALS = 18;

export interface UserDeposit {
  shares: bigint;
  timestamp: bigint;
  sharesFormatted: number;
  timestampNumber: number;
  unlockTime: number;
  isUnlocked: boolean;
}

export function useUserVaultData(assetAddress?: Address) {
  const { address } = useAccount();

  const { data: shareBalance, isLoading: isLoadingShareBalance } = useReadContract({
    address: PELON_STAKING_VAULT_ADDRESS,
    abi: PELON_STAKING_VAULT_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });

  const { data: pelonBalance, isLoading: isLoadingPelonBalance } = useReadContract({
    address: assetAddress,
    abi: PELON_CLUB_TOKEN_ABI,
    functionName: 'balanceOf',
    args: address && assetAddress ? [address] : undefined,
    query: {
      enabled: !!address && !!assetAddress,
    },
  });

  const { data: maxWithdrawableAssets, isLoading: isLoadingMaxWithdraw } = useReadContract({
    address: PELON_STAKING_VAULT_ADDRESS,
    abi: PELON_STAKING_VAULT_ABI,
    functionName: 'maxWithdraw',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });

  const { data: maxRedeemableShares, isLoading: isLoadingMaxRedeem } = useReadContract({
    address: PELON_STAKING_VAULT_ADDRESS,
    abi: PELON_STAKING_VAULT_ABI,
    functionName: 'maxRedeem',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });

  const { data: lastDepositTimestamp, isLoading: isLoadingLastDeposit } = useReadContract({
    address: PELON_STAKING_VAULT_ADDRESS,
    abi: PELON_STAKING_VAULT_ABI,
    functionName: 'lastDepositTimestamp',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });

  const { data: minTimelockDuration } = useReadContract({
    address: PELON_STAKING_VAULT_ADDRESS,
    abi: PELON_STAKING_VAULT_ABI,
    functionName: 'MIN_TIMELOCK_DURATION',
  });

  const isLoading =
    isLoadingShareBalance ||
    isLoadingPelonBalance ||
    isLoadingMaxWithdraw ||
    isLoadingMaxRedeem ||
    isLoadingLastDeposit;

  const shareBalanceFormatted = shareBalance ? parseFloat(formatUnits(shareBalance, PELON_DECIMALS)) : 0;
  const pelonBalanceFormatted = pelonBalance ? parseFloat(formatUnits(pelonBalance, PELON_DECIMALS)) : 0;
  const withdrawableAssetsFormatted = maxWithdrawableAssets ? parseFloat(formatUnits(maxWithdrawableAssets, PELON_DECIMALS)) : 0;
  const withdrawableSharesFormatted = maxRedeemableShares ? parseFloat(formatUnits(maxRedeemableShares, PELON_DECIMALS)) : 0;

  const timelockSeconds = minTimelockDuration ? Number(minTimelockDuration) : 0;
  const currentTime = Math.floor(Date.now() / 1000);
  const lastDepositTimestampNumber = lastDepositTimestamp ? Number(lastDepositTimestamp) : 0;
  const unlockTime = lastDepositTimestampNumber > 0 ? lastDepositTimestampNumber + timelockSeconds : 0;
  const isUnlocked = unlockTime > 0 ? currentTime >= unlockTime : true;

  const processedDeposits: UserDeposit[] = lastDepositTimestamp && lastDepositTimestamp > 0n && shareBalance !== undefined
    ? [{
        shares: shareBalance,
        timestamp: lastDepositTimestamp,
        sharesFormatted: shareBalanceFormatted,
        timestampNumber: lastDepositTimestampNumber,
        unlockTime,
        isUnlocked,
      }]
    : [];

  return {
    shareBalance: shareBalanceFormatted,
    pelonBalance: pelonBalanceFormatted,
    withdrawableAssets: withdrawableAssetsFormatted,
    withdrawableShares: withdrawableSharesFormatted,
    deposits: processedDeposits,
    isLoading,
  };
}

