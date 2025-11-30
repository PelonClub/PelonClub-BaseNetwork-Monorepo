import { getAddress } from 'viem';

export const WALLET_NAMES: Record<string, string> = {
  '0xeb7d78ed5f19592dfd5cf97443d961e85595daa5': 'Community & Ecosystem',
  '0xff9e0a72842751698a62050e94fad0ce8c0b368a': 'Liquidity & Market Making',
  '0xaeeaa55ed4f7df9e4c5688011ced1e2a1b696772': 'Team & Founders',
  '0xc08bf97eee16e73dfa022265118b513d10ae3f1c': 'Marketing & Growth',
  '0x4826b07de6d05783121a7f28147f82d3eeeb7e1b': 'Treasury & Operations',
  '0xfbeec866499b868b87c3730aa4f3a7921707f7b2': 'Reserve Fund',
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

