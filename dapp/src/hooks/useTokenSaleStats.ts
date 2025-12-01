import { useQuery } from '@tanstack/react-query';
import { usePublicClient } from 'wagmi';
import { formatUnits, Address } from 'viem';
import { TOKEN_SALE_ABI, TOKEN_SALE_ADDRESS } from '@/contracts/tokenSale';

interface TokenSaleStats {
  totalRaised: number;
  uniqueParticipants: number;
}

async function fetchTokenSaleStats(publicClient: any): Promise<TokenSaleStats> {
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

  let totalRaised = 0;
  const uniqueBuyers = new Set<Address>();

  for (const log of logs) {
    try {
      const buyer = log.args?.buyer as Address | undefined;
      const usdcAmount = log.args?.usdcAmount as bigint | undefined;

      if (!buyer || usdcAmount === undefined) continue;

      totalRaised += parseFloat(formatUnits(usdcAmount, 6));
      uniqueBuyers.add(buyer);
    } catch (error) {
      console.warn('Error processing purchase log:', error);
      continue;
    }
  }

  return {
    totalRaised,
    uniqueParticipants: uniqueBuyers.size,
  };
}

export function useTokenSaleStats() {
  const publicClient = usePublicClient();

  return useQuery({
    queryKey: ['tokenSaleStats', TOKEN_SALE_ADDRESS],
    queryFn: () => fetchTokenSaleStats(publicClient),
    enabled: !!publicClient,
    staleTime: 30000,
    refetchInterval: 60000,
  });
}

