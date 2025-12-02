import { getAddress } from 'viem';

export const WALLET_NAMES: Record<string, string> = {
  '0xeb7d78ed5f19592dfd5cf97443d961e85595daa5': 'Community & Ecosystem',
  '0xff9e0a72842751698a62050e94fad0ce8c0b368a': 'Liquidity & Market Making',
  '0xaeeaa55ed4f7df9e4c5688011ced1e2a1b696772': 'Team & Founders',
  '0xc08bf97eee16e73dfa022265118b513d10ae3f1c': 'Marketing & Growth',
  '0x4826b07de6d05783121a7f28147f82d3eeeb7e1b': 'Treasury & Operations',
  '0xfbeec866499b868b87c3730aa4f3a7921707f7b2': 'Reserve Fund',
  '0xe76117151dcd6d9cb4dcee496dca2f8513ca7d7f': 'USDC Funds Receipt Wallet',
  '0xdf556bd113ffc32cc85e098520bfc615438ca16b': 'TokenSale Contract (Testnet)',
  '0x42f94856e32bc8817dde6cd1d8c0e8df0b740ba8': 'TokenSale Contract (Mainnet)',
  '0x734ae77b7de9b5cc3ce9d3d20b92c769d8588f15': 'PelonClubToken (Testnet)',
  '0x591e967fb0496beb4bda117959e6d70d7ad49a1c': 'PelonClubToken (Mainnet)',
  '0x0c874c04783e0838e92f42d52bd8a2a9ece56b40': 'PelonStakingVault (Testnet)',
  '0x2239e40a03dcc1ab9c12f02f44cad7cb2e966452': 'PelonStakingVault (Mainnet)',
  '0x145ef9f6a4324a181537dfb7074f6e4b3e19ec70': 'USDC Mock Token (Testnet)',
  '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913': 'USDC (Mainnet)',
};

export function getWalletName(address: string): string | null {
  try {
    const normalizedAddress = getAddress(address).toLowerCase();
    return WALLET_NAMES[normalizedAddress] || null;
  } catch {
    const normalizedAddress = address.toLowerCase();
    return WALLET_NAMES[normalizedAddress] || null;
  }
}

