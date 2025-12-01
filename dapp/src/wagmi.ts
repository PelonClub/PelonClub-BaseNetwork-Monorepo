import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { base } from 'wagmi/chains';

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;

if (!projectId) {
  throw new Error(
    'NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID is required. Please set it in your .env.local file. Get your project ID from https://cloud.walletconnect.com/'
  );
}

const baseCustom = {
  ...base,
  rpcUrls: {
    default: {
      http: ['https://base-rpc.publicnode.com'],
    },
  },
};

export const config = getDefaultConfig({
  appName: 'Pelon Club',
  projectId,
  chains: [baseCustom],
  ssr: true,
});
