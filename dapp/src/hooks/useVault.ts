import { useReadContract } from 'wagmi';
import { formatUnits } from 'viem';
import { PELON_STAKING_VAULT_ABI, PELON_STAKING_VAULT_ADDRESS } from '@/contracts/pelonStakingVault';

const PELON_DECIMALS = 18;

export function useVault() {
  const { data: totalAssets, isLoading: isLoadingTotalAssets } = useReadContract({
    address: PELON_STAKING_VAULT_ADDRESS,
    abi: PELON_STAKING_VAULT_ABI,
    functionName: 'totalAssets',
  });

  const { data: totalSupply, isLoading: isLoadingTotalSupply } = useReadContract({
    address: PELON_STAKING_VAULT_ADDRESS,
    abi: PELON_STAKING_VAULT_ABI,
    functionName: 'totalSupply',
  });

  const { data: minTimelockDuration, isLoading: isLoadingTimelock } = useReadContract({
    address: PELON_STAKING_VAULT_ADDRESS,
    abi: PELON_STAKING_VAULT_ABI,
    functionName: 'MIN_TIMELOCK_DURATION',
  });

  const { data: feeBps, isLoading: isLoadingFeeBps } = useReadContract({
    address: PELON_STAKING_VAULT_ADDRESS,
    abi: PELON_STAKING_VAULT_ABI,
    functionName: 'FEE_BPS',
  });

  const { data: assetAddress, isLoading: isLoadingAsset } = useReadContract({
    address: PELON_STAKING_VAULT_ADDRESS,
    abi: PELON_STAKING_VAULT_ABI,
    functionName: 'asset',
  });

  const isLoading =
    isLoadingTotalAssets ||
    isLoadingTotalSupply ||
    isLoadingTimelock ||
    isLoadingFeeBps ||
    isLoadingAsset;

  const totalAssetsFormatted = totalAssets ? parseFloat(formatUnits(totalAssets, PELON_DECIMALS)) : 0;
  const totalSupplyFormatted = totalSupply ? parseFloat(formatUnits(totalSupply, PELON_DECIMALS)) : 0;
  const timelockDurationSeconds = minTimelockDuration ? Number(minTimelockDuration) : 0;
  const withdrawFeeBpsNumber = feeBps ? Number(feeBps) : 0;
  const withdrawFeePercent = withdrawFeeBpsNumber / 100;

  const exchangeRate =
    totalSupplyFormatted > 0 ? totalAssetsFormatted / totalSupplyFormatted : 0;

  const timelockDays = timelockDurationSeconds / (24 * 60 * 60);

  return {
    totalAssets: totalAssetsFormatted,
    totalSupply: totalSupplyFormatted,
    timelockDuration: timelockDurationSeconds,
    timelockDays,
    withdrawFeeBps: withdrawFeeBpsNumber,
    withdrawFeePercent,
    assetAddress,
    exchangeRate,
    isLoading,
  };
}

