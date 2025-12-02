import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { getBaseScanUrl } from '@/data/tokenomics';
import Link from 'next/link';

declare global {
  interface Window {
    ethereum?: any;
  }
}

interface TokenData {
  name: string;
  symbol: string;
  logo: string;
  mainnetAddress: string;
  testnetAddress: string;
  decimals: number;
}

const TOKENS: TokenData[] = [
  {
    name: '',
    symbol: 'PELON',
    logo: '/img/icon.png',
    mainnetAddress: '0x591e967fb0496beB4BDa117959e6D70D7Ad49a1C',
    testnetAddress: '0x734AE77B7dE9B5cc3Ce9d3D20B92c769d8588f15',
    decimals: 18,
  },
  {
    name: 'Pelon Vault: Caldero',
    symbol: 'CALDERO',
    logo: '/img/caldero.png',
    mainnetAddress: '0x2239E40A03DCC1AB9C12F02f44cad7cb2E966452',
    testnetAddress: '0x0c874C04783e0838E92f42D52bD8A2a9eCE56b40',
    decimals: 18,
  },
];

const BASE_MAINNET_CHAIN_ID = 8453;
const BASE_TESTNET_CHAIN_ID = 84532;

export default function TokenInfo() {
  const t = useTranslations('tokenomics.tokens');
  const [addingToken, setAddingToken] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  const pelonTokenName = t('pelonClubToken');
  
  const tokensWithTranslations = TOKENS.map(token => ({
    ...token,
    name: token.symbol === 'PELON' ? pelonTokenName : token.name,
  }));

  const handleAddToken = async (token: TokenData, isMainnetNetwork: boolean) => {
    if (typeof window === 'undefined' || !window.ethereum) {
      alert(t('walletNotFound'));
      return;
    }

    const tokenKey = `${token.symbol}-${isMainnetNetwork ? 'mainnet' : 'testnet'}`;
    setAddingToken(tokenKey);
    setSuccessMessage(null);

    try {
      const address = isMainnetNetwork ? token.mainnetAddress : token.testnetAddress;
      const imageUrl = `${window.location.origin}${token.logo}`;

      await window.ethereum.request({
        method: 'wallet_watchAsset',
        params: {
          type: 'ERC20',
          options: {
            address: address,
            symbol: token.symbol,
            decimals: token.decimals,
            image: imageUrl,
          },
        },
      });

      setSuccessMessage(tokenKey);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error: any) {
      if (error.code !== 4001) {
        alert(t('addTokenError'));
      }
    } finally {
      setAddingToken(null);
    }
  };

  return (
    <div
      className={cn(
        'bg-background-secondary',
        'border-neobrutal',
        'shadow-neobrutal-md',
        'p-6 sm:p-8',
        'rounded-none',
        'mb-8'
      )}
    >
      <h3
        className={cn(
          'text-2xl sm:text-3xl',
          'font-bold',
          'text-foreground',
          'mb-6',
          'flex items-center gap-3'
        )}
      >
        <span>🪙</span>
        <span>{t('title')}</span>
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {tokensWithTranslations.map((token) => {
          return (
            <div
              key={token.symbol}
              className={cn(
                'bg-background',
                'border-neobrutal',
                'shadow-neobrutal',
                'p-6',
                'rounded-none',
                'transition-all'
              )}
            >
              <div className="flex items-start gap-4 mb-6">
                <div className="relative w-16 h-16 flex-shrink-0">
                  <Image
                    src={token.logo}
                    alt={token.name}
                    fill
                    className="object-contain"
                    unoptimized
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xl font-bold text-foreground mb-1">
                    {token.name}
                  </h4>
                  <p className="text-muted-foreground font-medium text-sm">
                    {token.symbol}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="border-neobrutal border-[2px] p-4 rounded-none">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-bold text-foreground">
                      {t('mainnet')}
                    </p>
                    <span className="text-xs text-muted-foreground bg-primary/10 px-2 py-1 rounded-none">
                      Chain ID: {BASE_MAINNET_CHAIN_ID}
                    </span>
                  </div>
                  <div className="mb-3">
                    <p className="text-xs text-muted-foreground mb-1">
                      {t('contractAddress')}:
                    </p>
                    <Link
                      href={getBaseScanUrl(token.mainnetAddress, BASE_MAINNET_CHAIN_ID)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:text-primary-hover font-mono text-xs break-all underline"
                    >
                      {token.mainnetAddress}
                    </Link>
                  </div>
                  <button
                    onClick={() => handleAddToken(token, true)}
                    disabled={addingToken === `${token.symbol}-mainnet`}
                    className={cn(
                      'w-full',
                      'bg-primary',
                      'text-primary-foreground',
                      'border-neobrutal',
                      'shadow-neobrutal',
                      'px-4',
                      'py-2',
                      'font-bold',
                      'text-sm',
                      'rounded-none',
                      'hover:bg-primary-hover',
                      'active:bg-primary-active',
                      'active:shadow-none',
                      'active:translate-x-[4px]',
                      'active:translate-y-[4px]',
                      'transition-none',
                      'disabled:opacity-50',
                      'disabled:cursor-not-allowed',
                      'disabled:hover:bg-primary',
                      'disabled:active:translate-x-0',
                      'disabled:active:translate-y-0',
                      successMessage === `${token.symbol}-mainnet` && 'bg-green-500 hover:bg-green-600'
                    )}
                  >
                    {addingToken === `${token.symbol}-mainnet`
                      ? t('adding')
                      : successMessage === `${token.symbol}-mainnet`
                      ? t('added')
                      : t('addToWallet')}
                  </button>
                </div>

                <div className="border-neobrutal border-[2px] p-4 rounded-none">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-bold text-foreground">
                      {t('testnet')}
                    </p>
                    <span className="text-xs text-muted-foreground bg-accent/10 px-2 py-1 rounded-none">
                      Chain ID: {BASE_TESTNET_CHAIN_ID}
                    </span>
                  </div>
                  <div className="mb-3">
                    <p className="text-xs text-muted-foreground mb-1">
                      {t('contractAddress')}:
                    </p>
                    <Link
                      href={getBaseScanUrl(token.testnetAddress, BASE_TESTNET_CHAIN_ID)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:text-primary-hover font-mono text-xs break-all underline"
                    >
                      {token.testnetAddress}
                    </Link>
                  </div>
                  <button
                    onClick={() => handleAddToken(token, false)}
                    disabled={addingToken === `${token.symbol}-testnet`}
                    className={cn(
                      'w-full',
                      'bg-accent',
                      'text-accent-foreground',
                      'border-neobrutal',
                      'shadow-neobrutal',
                      'px-4',
                      'py-2',
                      'font-bold',
                      'text-sm',
                      'rounded-none',
                      'hover:bg-accent/90',
                      'active:bg-accent/80',
                      'active:shadow-none',
                      'active:translate-x-[4px]',
                      'active:translate-y-[4px]',
                      'transition-none',
                      'disabled:opacity-50',
                      'disabled:cursor-not-allowed',
                      'disabled:hover:bg-accent',
                      'disabled:active:translate-x-0',
                      'disabled:active:translate-y-0',
                      successMessage === `${token.symbol}-testnet` && 'bg-green-500 hover:bg-green-600'
                    )}
                  >
                    {addingToken === `${token.symbol}-testnet`
                      ? t('adding')
                      : successMessage === `${token.symbol}-testnet`
                      ? t('added')
                      : t('addToWallet')}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

