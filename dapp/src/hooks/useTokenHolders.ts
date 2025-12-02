import { useQuery } from '@tanstack/react-query';
import { usePublicClient } from 'wagmi';
import { formatUnits, Address } from 'viem';
import { PELON_CLUB_TOKEN_ABI, PELON_CLUB_TOKEN_ADDRESS, TokenHolder } from '@/contracts/pelonClubToken';

async function fetchTokenHolders(publicClient: any): Promise<TokenHolder[]> {
  if (!publicClient) {
    throw new Error('Public client not available');
  }

  const currentBlock = await publicClient.getBlockNumber();
  
  const fromBlock = currentBlock > 50000n ? currentBlock - 50000n : 0n;
  
  const logs = await publicClient.getLogs({
    address: PELON_CLUB_TOKEN_ADDRESS,
    event: {
      type: 'event',
      name: 'Transfer',
      inputs: [
        { indexed: true, name: 'from', type: 'address' },
        { indexed: true, name: 'to', type: 'address' },
        { indexed: false, name: 'value', type: 'uint256' },
      ],
    },
    fromBlock,
    toBlock: 'latest',
  });

  const balances = new Map<Address, bigint>();
  const zeroAddress = '0x0000000000000000000000000000000000000000' as Address;
  const uniqueAddresses = new Set<Address>();

  for (const log of logs) {
    try {
      const from = log.args?.from as Address | undefined;
      const to = log.args?.to as Address | undefined;
      const value = log.args?.value as bigint | undefined;

      if (!from || !to || value === undefined) continue;

      if (from !== zeroAddress) uniqueAddresses.add(from);
      if (to !== zeroAddress) uniqueAddresses.add(to);

      if (from !== zeroAddress) {
        const currentBalance = balances.get(from) || 0n;
        balances.set(from, currentBalance - value);
      }

      if (to !== zeroAddress) {
        const currentBalance = balances.get(to) || 0n;
        balances.set(to, currentBalance + value);
      }
    } catch (error) {
      continue;
    }
  }

  const decimals = await publicClient.readContract({
    address: PELON_CLUB_TOKEN_ADDRESS,
    abi: PELON_CLUB_TOKEN_ABI,
    functionName: 'decimals',
  });

  const verifiedBalances = new Map<Address, bigint>();
  for (const address of uniqueAddresses) {
    try {
      const balance = await publicClient.readContract({
        address: PELON_CLUB_TOKEN_ADDRESS,
        abi: PELON_CLUB_TOKEN_ABI,
        functionName: 'balanceOf',
        args: [address],
      });
      if (balance > 0n) {
        verifiedBalances.set(address, balance);
      }
    } catch (error) {
    }
  }

  const totalSupply = await publicClient.readContract({
    address: PELON_CLUB_TOKEN_ADDRESS,
    abi: PELON_CLUB_TOKEN_ABI,
    functionName: 'totalSupply',
  });

  const holders: TokenHolder[] = [];
  
  for (const [address, balance] of verifiedBalances.entries()) {
    const balanceFormatted = formatUnits(balance, decimals);
    const percentage = Number((balance * 10000n) / totalSupply) / 100;
    
    holders.push({
      address,
      balance,
      balanceFormatted,
      percentage,
      rank: 0,
    });
  }

  holders.sort((a, b) => {
    if (a.balance > b.balance) return -1;
    if (a.balance < b.balance) return 1;
    return 0;
  });

  holders.forEach((holder, index) => {
    holder.rank = index + 1;
  });

  return holders.slice(0, 100);
}

export function useTokenHolders() {
  const publicClient = usePublicClient();

  return useQuery({
    queryKey: ['tokenHolders', PELON_CLUB_TOKEN_ADDRESS],
    queryFn: () => fetchTokenHolders(publicClient),
    enabled: !!publicClient,
    staleTime: 30000,
    refetchInterval: 60000,
  });
}

