import { Address } from 'viem';
import { TokenHolder } from '@/contracts/pelonClubToken';
import { cn } from '@/lib/utils';
import { getWalletName } from '@/lib/walletNames';
import Badge from './Badge';

interface LeaderboardCardProps {
  holder: TokenHolder;
  index: number;
  isTopThree?: boolean;
}

export default function LeaderboardCard({
  holder,
  index,
  isTopThree = false,
}: LeaderboardCardProps) {
  const formatAddress = (address: Address) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatBalance = (balance: string) => {
    const num = parseFloat(balance);
    if (num >= 1_000_000_000_000) {
      return (num / 1_000_000_000_000).toFixed(2) + 'T';
    }
    if (num >= 1_000_000_000) {
      return (num / 1_000_000_000).toFixed(2) + 'B';
    }
    if (num >= 1_000_000) {
      return (num / 1_000_000).toFixed(2) + 'M';
    }
    if (num >= 1_000) {
      return (num / 1_000).toFixed(2) + 'K';
    }
    return num.toFixed(2);
  };

  const getExplorerUrl = (address: Address) => {
    return `https://sepolia.basescan.org/address/${address}`;
  };

  return (
    <div
      className={cn(
        'w-full',
        'bg-background-secondary',
        'border-neobrutal',
        isTopThree ? 'border-neobrutal-thick' : '',
        isTopThree ? 'shadow-neobrutal-lg' : 'shadow-neobrutal',
        'p-4 sm:p-6',
        'rounded-none',
        'transition-all',
        'hover:bg-background',
        'hover:translate-x-[-2px]',
        'hover:translate-y-[-2px]',
        isTopThree && 'hover:scale-[1.02]',
        'group'
      )}
      style={{
        animationDelay: `${index * 50}ms`,
      }}
    >
      <div className="flex items-center gap-4 sm:gap-6">
        <div className="flex-shrink-0">
          <Badge rank={holder.rank} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="flex items-center gap-2">
              <a
                href={getExplorerUrl(holder.address)}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  'font-bold',
                  'text-foreground',
                  'hover:text-primary',
                  'transition-colors',
                  'truncate',
                  'text-sm sm:text-base'
                )}
              >
                {(() => {
                  const walletName = getWalletName(holder.address);
                  if (walletName) {
                    return (
                      <>
                        <span>{walletName}</span>
                        <span className="text-muted-foreground font-normal ml-1">
                          ({formatAddress(holder.address)})
                        </span>
                      </>
                    );
                  }
                  return formatAddress(holder.address);
                })()}
              </a>
              <span className="text-muted-foreground text-xs">#{holder.rank}</span>
            </div>

            <div className="flex flex-col sm:items-end gap-1">
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    'font-bold',
                    'text-lg sm:text-xl',
                    isTopThree ? 'text-primary' : 'text-foreground'
                  )}
                >
                  {formatBalance(holder.balanceFormatted)}
                </span>
                <span className="text-muted-foreground text-sm font-medium">PELON</span>
              </div>
              <div className="text-xs text-muted-foreground">
                {holder.percentage.toFixed(2)}% del total
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

