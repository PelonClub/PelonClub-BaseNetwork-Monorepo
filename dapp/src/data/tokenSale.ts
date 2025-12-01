export interface RecentPurchase {
  address: string;
  tokens: number;
  usdc: number;
  timestamp: number;
}

export interface TokenSaleData {
  unitPrice: number;
  totalAvailable: number;
  tokensSold: number;
  totalRaised: number;
  uniqueParticipants: number;
  timeRemaining?: number;
  recentPurchases: RecentPurchase[];
}

export const TOKEN_SALE_DATA: TokenSaleData = {
  unitPrice: 0.001,
  totalAvailable: 100_000_000,
  tokensSold: 45_000_000,
  totalRaised: 45_000,
  uniqueParticipants: 1234,
  timeRemaining: 230400,
  recentPurchases: [
    {
      address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
      tokens: 50000,
      usdc: 50,
      timestamp: Date.now() - 120000,
    },
    {
      address: '0x8ba1f109551bD432803012645Hac136c22C9e',
      tokens: 100000,
      usdc: 100,
      timestamp: Date.now() - 300000,
    },
    {
      address: '0x1234567890123456789012345678901234567890',
      tokens: 25000,
      usdc: 25,
      timestamp: Date.now() - 600000,
    },
    {
      address: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
      tokens: 75000,
      usdc: 75,
      timestamp: Date.now() - 900000,
    },
    {
      address: '0x9876543210987654321098765432109876543210',
      tokens: 150000,
      usdc: 150,
      timestamp: Date.now() - 1200000,
    },
    {
      address: '0xfedcba0987654321fedcba0987654321fedcba09',
      tokens: 30000,
      usdc: 30,
      timestamp: Date.now() - 1800000,
    },
    {
      address: '0x1111111111111111111111111111111111111111',
      tokens: 200000,
      usdc: 200,
      timestamp: Date.now() - 2400000,
    },
    {
      address: '0x2222222222222222222222222222222222222222',
      tokens: 50000,
      usdc: 50,
      timestamp: Date.now() - 3600000,
    },
  ],
};

export const formatTimeRemaining = (seconds: number): string => {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m`;
  }
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
};

export const formatTimestamp = (timestamp: number): string => {
  const now = Date.now();
  const diff = now - timestamp;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  
  if (seconds < 60) {
    return `${seconds}s ago`;
  }
  if (minutes < 60) {
    return `${minutes}m ago`;
  }
  if (hours < 24) {
    return `${hours}h ago`;
  }
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

