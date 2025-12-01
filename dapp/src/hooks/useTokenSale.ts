import { useReadContract } from 'wagmi';
import { formatUnits } from 'viem';
import { TOKEN_SALE_ABI, TOKEN_SALE_ADDRESS } from '@/contracts/tokenSale';

export function useTokenSale() {
  const { data: currentPrice, isLoading: isLoadingPrice } = useReadContract({
    address: TOKEN_SALE_ADDRESS,
    abi: TOKEN_SALE_ABI,
    functionName: 'getCurrentPrice',
  });

  const { data: totalSold, isLoading: isLoadingTotalSold } = useReadContract({
    address: TOKEN_SALE_ADDRESS,
    abi: TOKEN_SALE_ABI,
    functionName: 'totalSold',
  });

  const { data: maxTotalSale, isLoading: isLoadingMaxTotalSale } = useReadContract({
    address: TOKEN_SALE_ADDRESS,
    abi: TOKEN_SALE_ABI,
    functionName: 'maxTotalSale',
  });

  const { data: remainingTokens, isLoading: isLoadingRemaining } = useReadContract({
    address: TOKEN_SALE_ADDRESS,
    abi: TOKEN_SALE_ABI,
    functionName: 'getRemainingTokens',
  });

  const { data: paused, isLoading: isLoadingPaused } = useReadContract({
    address: TOKEN_SALE_ADDRESS,
    abi: TOKEN_SALE_ABI,
    functionName: 'paused',
  });

  const { data: initialPrice } = useReadContract({
    address: TOKEN_SALE_ADDRESS,
    abi: TOKEN_SALE_ABI,
    functionName: 'initialPrice',
  });

  const { data: maxPrice } = useReadContract({
    address: TOKEN_SALE_ADDRESS,
    abi: TOKEN_SALE_ABI,
    functionName: 'maxPrice',
  });

  const isLoading =
    isLoadingPrice ||
    isLoadingTotalSold ||
    isLoadingMaxTotalSale ||
    isLoadingRemaining ||
    isLoadingPaused;

  const currentPriceFormatted = currentPrice ? parseFloat(formatUnits(currentPrice, 18)) : 0;
  const totalSoldFormatted = totalSold ? parseFloat(formatUnits(totalSold, 18)) : 0;
  const maxTotalSaleFormatted = maxTotalSale ? parseFloat(formatUnits(maxTotalSale, 18)) : 0;
  const remainingTokensFormatted = remainingTokens ? parseFloat(formatUnits(remainingTokens, 18)) : 0;
  const initialPriceFormatted = initialPrice ? parseFloat(formatUnits(initialPrice, 18)) : 0;
  const maxPriceFormatted = maxPrice ? parseFloat(formatUnits(maxPrice, 18)) : 0;

  const percentageSold =
    maxTotalSaleFormatted > 0 ? (totalSoldFormatted / maxTotalSaleFormatted) * 100 : 0;

  return {
    currentPrice: currentPriceFormatted,
    totalSold: totalSoldFormatted,
    maxTotalSale: maxTotalSaleFormatted,
    remainingTokens: remainingTokensFormatted,
    paused: paused ?? false,
    initialPrice: initialPriceFormatted,
    maxPrice: maxPriceFormatted,
    percentageSold,
    isLoading,
  };
}

