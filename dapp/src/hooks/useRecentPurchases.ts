import { useQuery } from '@tanstack/react-query';
import { usePublicClient } from 'wagmi';
import { formatUnits, Address } from 'viem';
import { TOKEN_SALE_ABI, TOKEN_SALE_ADDRESS } from '@/contracts/tokenSale';
import { RecentPurchase } from '@/data/tokenSale';

async function fetchRecentPurchases(publicClient: any): Promise<RecentPurchase[]> {
  if (!publicClient) {
    throw new Error('Public client not available');
  }

  const currentBlock = await publicClient.getBlockNumber();
  const fromBlock = currentBlock > 50000n ? currentBlock - 50000n : 0n;

  const logs = await publicClient.getLogs({
    address: TOKEN_SALE_ADDRESS,
    event: {
      type: 'event',
      name: 'TokensPurchased',
      inputs: [
        { indexed: true, name: 'buyer', type: 'address' },
        { indexed: false, name: 'usdcAmount', type: 'uint256' },
        { indexed: false, name: 'pelonAmount', type: 'uint256' },
      ],
    },
    fromBlock,
    toBlock: 'latest',
  });

  const purchases: RecentPurchase[] = [];

  for (const log of logs) {
    try {
      const buyer = log.args?.buyer as Address | undefined;
      const usdcAmount = log.args?.usdcAmount as bigint | undefined;
      const pelonAmount = log.args?.pelonAmount as bigint | undefined;
      const blockNumber = log.blockNumber;

      if (!buyer || usdcAmount === undefined || pelonAmount === undefined) continue;

      const block = await publicClient.getBlock({ blockNumber });
      const timestamp = Number(block.timestamp) * 1000;

      purchases.push({
        address: buyer,
        tokens: parseFloat(formatUnits(pelonAmount, 18)),
        usdc: parseFloat(formatUnits(usdcAmount, 6)),
        timestamp,
      });
    } catch (error) {
      console.warn('Error processing purchase log:', error);
      continue;
    }
  }

  purchases.sort((a, b) => b.timestamp - a.timestamp);

  return purchases.slice(0, 5);
}

export function useRecentPurchases() {
  const publicClient = usePublicClient();

  return useQuery({
    queryKey: ['recentPurchases', TOKEN_SALE_ADDRESS],
    queryFn: () => fetchRecentPurchases(publicClient),
    enabled: !!publicClient,
    staleTime: 30000,
    refetchInterval: 60000,
  });
}

