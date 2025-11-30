export interface TokenomicsCategory {
  name: string;
  percentage: number;
  tokens: number; // in billions
  walletAddress: string;
  subcategories: TokenomicsSubcategory[];
}

export interface TokenomicsSubcategory {
  name: string;
  percentage: number;
  tokens: number; // in billions
}

export const TOTAL_SUPPLY = 1_000_000_000_000; // 1 Trillion PELON

export const TOKENOMICS_DATA: TokenomicsCategory[] = [
  {
    name: 'Community & Ecosystem',
    percentage: 35,
    tokens: 350,
    walletAddress: '0xeB7D78ed5F19592dFD5cF97443d961e85595Daa5',
    subcategories: [
      { name: 'Initial Airdrops', percentage: 5, tokens: 50 },
      { name: 'Participation Incentives', percentage: 10, tokens: 100 },
      { name: 'Educational Rewards', percentage: 10, tokens: 100 },
      { name: 'Referral Program', percentage: 5, tokens: 50 },
      { name: 'DAO Governance', percentage: 5, tokens: 50 },
    ],
  },
  {
    name: 'Liquidity & Market Making',
    percentage: 25,
    tokens: 250,
    walletAddress: '0xFF9e0a72842751698A62050e94fad0CE8C0b368a',
    subcategories: [
      { name: 'Initial DEX Liquidity', percentage: 15, tokens: 150 },
      { name: 'Liquidity Reserve', percentage: 10, tokens: 100 },
    ],
  },
  {
    name: 'Team & Founders',
    percentage: 20,
    tokens: 200,
    walletAddress: '0xaEeaA55ED4f7df9E4C5688011cEd1E2A1b696772',
    subcategories: [
      { name: 'Founding Team', percentage: 15, tokens: 150 },
      { name: 'Advisors', percentage: 5, tokens: 50 },
    ],
  },
  {
    name: 'Marketing & Growth',
    percentage: 10,
    tokens: 100,
    walletAddress: '0xc08bF97eeE16e73DFA022265118B513D10Ae3F1C',
    subcategories: [
      { name: 'Marketing Campaigns', percentage: 6, tokens: 60 },
      { name: 'Partnerships', percentage: 2, tokens: 20 },
      { name: 'Influencers/KOLs', percentage: 2, tokens: 20 },
    ],
  },
  {
    name: 'Treasury & Operations',
    percentage: 5,
    tokens: 50,
    walletAddress: '0x4826b07de6d05783121A7f28147F82D3eEEb7E1b',
    subcategories: [
      { name: 'Operations', percentage: 3, tokens: 30 },
      { name: 'Emergency Fund', percentage: 2, tokens: 20 },
    ],
  },
  {
    name: 'Reserve Fund',
    percentage: 5,
    tokens: 50,
    walletAddress: '0xfBeec866499B868B87C3730AA4F3a7921707f7b2',
    subcategories: [
      { name: 'Strategic Reserve', percentage: 5, tokens: 50 },
    ],
  },
];

export const CHART_COLORS = [
  '#4338ca', // indigo-700 (primary)
  '#6366f1', // indigo-500 (accent)
  '#818cf8', // indigo-400
  '#a5b4fc', // indigo-300
  '#c7d2fe', // indigo-200
  '#e0e7ff', // indigo-100
];

export const getBaseScanUrl = (address: string, chainId: number = 8453) => {
  const baseUrl = chainId === 8453 
    ? 'https://basescan.org' 
    : 'https://sepolia.basescan.org';
  return `${baseUrl}/address/${address}`;
};

