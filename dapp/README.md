# Pelon Club dApp

Next.js dApp for Pelon Club, a token-gated educational resources platform and social network for students. Developed by Baeza.eth (King Of The Pelones).

## Table of Contents

- [Description](#description)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture Overview](#architecture-overview)
- [Installation & Setup](#installation--setup)
- [Configuration](#configuration)
- [Project Structure](#project-structure)
- [Development](#development)
- [Build & Static Export](#build--static-export)
- [Deployment](#deployment)
- [Design System](#design-system)
- [Smart Contracts](#smart-contracts)
- [Custom Hooks](#custom-hooks)
- [Internationalization](#internationalization)
- [Troubleshooting](#troubleshooting)
- [Resources & References](#resources--references)
- [License](#license)

## Description

Pelon Club is a decentralized application that enables knowledge monetization through token-gated educational resources and activities. The platform also functions as a social network for students, facilitating connections and collaborative learning.

The dApp is built with Next.js 15 and features a modern Web3 stack, supporting wallet connections, token purchases, staking vaults, and comprehensive tokenomics visualization.

## Features

### Core Features

- 🔗 **Wallet Connection**: Full integration with RainbowKit for Ethereum wallet connections
- 🎨 **Neobrutalism Design System**: Bold aesthetic with hard shadows, thick borders, and contrasting colors
- 🌍 **Internationalization**: Full support for Spanish (default) and English with next-intl
- 📊 **Leaderboard**: Ranking system and statistics for token holders
- 💎 **Tokenomics**: Comprehensive visualization of token economics
- 🚀 **Token Sale**: Interface for purchasing tokens via sigmoid bonding curve
- 🏦 **Staking Vault**: ERC4626-compliant vault for staking PELON tokens
- 📱 **Responsive Design**: Adaptive design for mobile, tablet, and desktop
- ⚡ **Static Export**: Optimized build for static hosting
- 🔍 **SEO Optimized**: Dynamic metadata and canonical URLs for all pages

### Pages

- **Home** (`/[locale]/index.tsx`) - Main page with bento cards navigation
- **Leaderboard** (`/[locale]/leaderboard.tsx`) - Rankings and statistics
- **Tokenomics** (`/[locale]/tokenomics.tsx`) - Token economics visualization
- **Token Sale** (`/[locale]/token-sale.tsx`) - Token purchase interface with bonding curve
- **Vault** (`/[locale]/vault.tsx`) - Staking vault interface for depositing and withdrawing tokens

## Tech Stack

### Framework & Core

- **Next.js 15** - React framework with SSR and static export
- **React 19** - UI library
- **TypeScript 5.5** - Static typing

### Blockchain & Web3

- **wagmi 2.17** - React hooks for Ethereum
- **RainbowKit 2.2** - UI components for wallet connections
- **viem 2.40** - TypeScript Ethereum client
- **Base Sepolia** - Ethereum L2 testnet (primary network)

### Styling & UI

- **Tailwind CSS 4.1** - Utility-first CSS framework
- **@tailwindcss/postcss 4.1** - PostCSS plugin for Tailwind v4
- **Neobrutalism Design System** - Bold aesthetic with Indigo Dark theme
- **react-icons 5.5** - Icon library
- **recharts 2.15** - Charts and visualizations

### Internationalization

- **next-intl 4.5** - Internationalization for Next.js
- **Languages**: Spanish (default), English

### Utilities

- **react-hot-toast 2.6** - Toast notifications
- **class-variance-authority** - Component variants
- **clsx & tailwind-merge** - CSS class utilities
- **@tanstack/react-query 5.55** - Data fetching and caching

## Architecture Overview

The application follows a modular architecture with clear separation of concerns:

- **Pages**: Next.js pages with locale-based routing
- **Components**: Reusable UI components organized by feature
- **Hooks**: Custom React hooks for blockchain interactions
- **Contracts**: Smart contract ABIs and address configurations
- **i18n**: Internationalization configuration and message files
- **Lib**: Utility functions and helpers
- **Styles**: Global styles and Tailwind configuration

The app uses static export for optimal performance and can be deployed to any static hosting service.

## Installation & Setup

### Prerequisites

- **Node.js 18+** (recommended: Node.js 20+)
- **npm** or **yarn**
- **WalletConnect Project ID** (get one at [cloud.walletconnect.com](https://cloud.walletconnect.com))

### Installation Steps

1. **Clone the repository**:
```bash
git clone <repository-url>
cd dapp
```

2. **Install dependencies**:
```bash
npm install
```

3. **Configure environment variables**:

Create a `.env.local` file in the project root:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your values:

```env
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id_here
NEXT_PUBLIC_PELON_TOKEN_ADDRESS=token_contract_address
NEXT_PUBLIC_USDC_ADDRESS=usdc_contract_address
NEXT_PUBLIC_TOKEN_SALE_ADDRESS=token_sale_contract_address
NEXT_PUBLIC_PELON_STAKING_VAULT_ADDRESS=vault_contract_address
```

4. **Start development server**:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` | WalletConnect project ID | ✅ Yes |
| `NEXT_PUBLIC_PELON_TOKEN_ADDRESS` | PELON token contract address | Optional |
| `NEXT_PUBLIC_USDC_ADDRESS` | USDC token contract address | Optional |
| `NEXT_PUBLIC_TOKEN_SALE_ADDRESS` | Token sale contract address | Optional |
| `NEXT_PUBLIC_PELON_STAKING_VAULT_ADDRESS` | Staking vault contract address | Optional |

### Network Configuration

The application is configured to use **Base Sepolia** testnet by default. The network configuration is defined in `src/wagmi.ts`:

- **Network**: Base Sepolia
- **RPC URL**: `https://sepolia.base.org`
- **Chain ID**: 84532

To change the network, modify the `chains` array in `src/wagmi.ts`.

### Available Scripts

```bash
# Development
npm run dev          # Start development server at http://localhost:3000

# Build
npm run build        # Build the application for production (static export)
                     # Automatically runs postbuild script to generate index.html

# Production
npm start            # Start production server (requires build first)
```

### Postbuild Script

The `postbuild` script (`scripts/generate-index.js`) automatically:

1. Generates a root `index.html` file that detects browser language and redirects to the appropriate locale
2. Copies `.htaccess` template (if exists) to the output directory for Apache server configuration

This ensures proper routing for static hosting environments.

## Project Structure

```
dapp/
├── src/
│   ├── components/              # Reusable components
│   │   ├── Leaderboard/         # Leaderboard components
│   │   │   ├── LeaderboardStats.tsx
│   │   │   └── LeaderboardTable.tsx
│   │   ├── SEO/                 # SEO and metadata components
│   │   │   └── Metadata.tsx
│   │   ├── Tokenomics/          # Tokenomics components
│   │   │   ├── TokenomicsStats.tsx
│   │   │   ├── TokenomicsCharts.tsx
│   │   │   ├── TokenomicsTable.tsx
│   │   │   └── TokenInfo.tsx
│   │   ├── TokenSale/           # Token sale components
│   │   │   ├── TokenSaleStats.tsx
│   │   │   └── TokenSalePurchase.tsx
│   │   ├── Vault/               # Staking vault components
│   │   │   ├── VaultStats.tsx
│   │   │   ├── VaultDeposit.tsx
│   │   │   ├── VaultDepositMint.tsx
│   │   │   ├── VaultMint.tsx
│   │   │   ├── VaultWithdraw.tsx
│   │   │   ├── VaultApprove.tsx
│   │   │   ├── VaultConverter.tsx
│   │   │   └── DepositHistory.tsx
│   │   ├── LanguageSelector.tsx # Language selector component
│   │   ├── Navigation.tsx      # Main navigation component
│   │   └── SocialIcons.tsx      # Social media icons
│   ├── contracts/               # Smart contract definitions
│   │   ├── pelonClubToken.ts    # PELON token ABI and address
│   │   ├── tokenSale.ts         # Token sale contract ABI and address
│   │   ├── pelonStakingVault.ts # Staking vault ABI and address
│   │   └── usdc.ts              # USDC token ABI and address
│   ├── data/                    # Static data and configurations
│   │   ├── tokenomics.ts        # Tokenomics data
│   │   └── tokenSale.ts         # Token sale data
│   ├── hooks/                   # Custom React hooks
│   │   ├── useTokenSale.ts      # Token sale interactions
│   │   ├── useTokenSaleStats.ts # Token sale statistics
│   │   ├── useTokenSalePurchase.ts # Token purchase logic
│   │   ├── useRecentPurchases.ts # Recent purchase history
│   │   ├── useTokenHolders.ts   # Token holder data
│   │   ├── useUSDCApproval.ts   # USDC token approval
│   │   ├── usePELONApproval.ts  # PELON token approval
│   │   ├── useVault.ts          # Vault interactions
│   │   ├── useUserVaultData.ts  # User vault data
│   │   ├── useVaultDeposit.ts   # Vault deposit logic
│   │   ├── useVaultMint.ts      # Vault mint logic
│   │   └── useVaultWithdraw.ts  # Vault withdraw logic
│   ├── i18n/                    # Internationalization configuration
│   │   ├── config.ts            # Locale configuration
│   │   ├── request.ts           # Request configuration for next-intl
│   │   └── routing.ts           # Routing configuration
│   ├── lib/                     # Utilities and helpers
│   │   ├── seo.ts               # SEO utility functions
│   │   └── utils.ts             # General utilities (cn, stringifyWithBigInt)
│   ├── messages/                # Translation files
│   │   ├── es.json              # Spanish translations
│   │   └── en.json              # English translations
│   ├── pages/                   # Next.js pages
│   │   ├── [locale]/            # Locale-based pages
│   │   │   ├── index.tsx        # Home page
│   │   │   ├── leaderboard.tsx  # Leaderboard page
│   │   │   ├── tokenomics.tsx   # Tokenomics page
│   │   │   ├── token-sale.tsx   # Token sale page
│   │   │   └── vault.tsx        # Vault page
│   │   ├── _app.tsx             # App component with providers
│   │   └── _document.tsx        # Document component
│   ├── styles/                  # Global styles
│   │   └── globals.css          # Tailwind CSS v4 and Neobrutalism theme
│   └── wagmi.ts                 # wagmi configuration
├── public/                      # Static assets
│   └── img/                     # Images
├── scripts/                     # Build scripts
│   └── generate-index.js        # Postbuild script for index.html generation
├── components.json              # shadcn/ui configuration
├── next.config.js               # Next.js configuration
├── postcss.config.js            # PostCSS configuration
├── tailwind.config.js           # Tailwind CSS configuration
├── tsconfig.json                # TypeScript configuration
├── package.json                 # Dependencies and scripts
└── .env.example                 # Environment variables template
```

## Development

### Routing Structure with i18n

The project uses `next-intl` for internationalization. Routes follow the pattern:

```
/[locale]/[page]
```

Examples:
- `/es` - Home in Spanish
- `/en` - Home in English
- `/es/leaderboard` - Leaderboard in Spanish
- `/en/tokenomics` - Tokenomics in English
- `/es/vault` - Vault in Spanish

The default locale is `es` (Spanish).

### Component Development

Components are organized by feature in the `src/components/` directory. Each feature has its own subdirectory with related components.

When creating new components:

1. Use TypeScript for type safety
2. Follow the Neobrutalism design system
3. Use Tailwind utility classes (no custom CSS classes)
4. Implement internationalization using `useTranslations()` from next-intl
5. Add proper TypeScript types for props

### Custom Hooks

Custom hooks are located in `src/hooks/` and provide reusable logic for:

- **Token Sale**: Purchase tokens, view stats, check approvals
- **Vault**: Deposit, mint, withdraw, view user data
- **Token Management**: Check balances, approvals, holders

All hooks use wagmi for blockchain interactions and React Query for data caching.

### Contract Interactions

Smart contract interactions are handled through:

1. **Contract Definitions** (`src/contracts/`): ABIs and addresses
2. **wagmi Hooks**: Use wagmi's built-in hooks for read/write operations
3. **Custom Hooks**: Wrap wagmi hooks with application-specific logic

Example contract interaction:

```typescript
import { useReadContract } from 'wagmi';
import { PELON_CLUB_TOKEN_ABI, PELON_CLUB_TOKEN_ADDRESS } from '@/contracts/pelonClubToken';

const { data: balance } = useReadContract({
  abi: PELON_CLUB_TOKEN_ABI,
  address: PELON_CLUB_TOKEN_ADDRESS,
  functionName: 'balanceOf',
  args: [address],
});
```

## Build & Static Export

The project is configured for static export (`output: 'export'` in `next.config.js`). This means:

1. The build generates static HTML files in the `out/` directory
2. No Node.js server is required to run the application
3. Can be deployed to any static hosting service (Vercel, Netlify, GitHub Pages, Cloudflare Pages, etc.)

### Build Process

1. **Run the build command**:
```bash
npm run build
```

2. **Postbuild script execution**:
   - Generates root `index.html` with language detection and redirect
   - Copies `.htaccess` template if available

3. **Output directory**:
   - All static files are generated in the `out/` directory
   - Ready for deployment to static hosting

### Static Export Configuration

The `next.config.js` includes:

- `output: 'export'` - Enables static export
- `images.unoptimized: true` - Required for static export
- `webpack` configuration for external dependencies

## Deployment

### Preparation for Production

1. **Set environment variables** in your hosting platform
2. **Build the application**:
```bash
npm run build
```

3. **Deploy the `out/` directory** to your static hosting service

### Environment Variables in Production

Configure the following environment variables in your hosting platform:

- `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` (required)
- `NEXT_PUBLIC_PELON_TOKEN_ADDRESS` (optional)
- `NEXT_PUBLIC_USDC_ADDRESS` (optional)
- `NEXT_PUBLIC_TOKEN_SALE_ADDRESS` (optional)
- `NEXT_PUBLIC_PELON_STAKING_VAULT_ADDRESS` (optional)

### Recommended Platforms

- **Vercel**: Automatic deployment from Git, native Next.js support
- **Netlify**: Automatic deployment, support for static sites
- **GitHub Pages**: Free hosting for static sites
- **Cloudflare Pages**: Fast and global hosting

### Apache Configuration

If deploying to Apache, the postbuild script copies a `.htaccess.template` file (if present) to the output directory. This file should contain:

- URL rewriting rules for locale routing
- Redirect rules for the root path

## Design System

The project uses a **Neobrutalism Design System** with an **Indigo Dark theme**. Key characteristics include:

### Neobrutalism Principles

- **Hard Shadows**: Defined, angular shadows (`4px 4px 0px` in black)
- **Thick Borders**: Solid 3px or 4px borders in black
- **Bold Colors**: Vibrant and contrasting color palette
- **No Rounded Corners**: Sharp edges (`border-radius: 0px`)
- **Bold Typography**: Font-weight 700 for titles and highlighted elements
- **High Contrast**: Extreme contrast for readability

### Color Palette (Indigo Dark Theme)

- **Background**: `#0f172a` (slate-900)
- **Background Secondary**: `#1e293b` (slate-800)
- **Foreground**: `#f1f5f9` (slate-100)
- **Foreground Muted**: `#cbd5e1` (slate-300)
- **Primary**: `#4338ca` (indigo-700)
- **Primary Hover**: `#4f46e5` (indigo-600)
- **Primary Active**: `#3730a3` (indigo-800)

### Neobrutalism Utilities

The project includes custom utility classes defined in `src/styles/globals.css`:

- `.shadow-neobrutal` - Standard shadow (4px 4px 0px)
- `.shadow-neobrutal-sm` - Small shadow (2px 2px 0px)
- `.shadow-neobrutal-md` - Medium shadow (6px 6px 0px)
- `.shadow-neobrutal-lg` - Large shadow (8px 8px 0px)
- `.border-neobrutal` - Standard border (3px solid black)
- `.border-neobrutal-thick` - Thick border (4px solid black)
- `.rounded-neobrutal` - No rounded corners (0px)

For complete design system documentation, see the workspace rules.

## Smart Contracts

The dApp interacts with the following smart contracts:

### PELON Token (`pelonClubToken.ts`)

- **Standard**: ERC20 with additional features (ERC1363, ERC20Votes)
- **Purpose**: Native token of the Pelon Club ecosystem
- **Address**: Configurable via `NEXT_PUBLIC_PELON_TOKEN_ADDRESS`

### USDC Token (`usdc.ts`)

- **Standard**: ERC20
- **Purpose**: Stablecoin used for token purchases
- **Address**: Configurable via `NEXT_PUBLIC_USDC_ADDRESS`

### Token Sale (`tokenSale.ts`)

- **Purpose**: Manages token sales via sigmoid bonding curve
- **Features**: 
  - Sigmoid bonding curve pricing
  - Maximum tokens per wallet
  - Maximum total sale amount
  - Pausable functionality
- **Address**: Configurable via `NEXT_PUBLIC_TOKEN_SALE_ADDRESS`

### Staking Vault (`pelonStakingVault.ts`)

- **Standard**: ERC4626 (Tokenized Vault Standard)
- **Purpose**: Allows users to stake PELON tokens and receive vault shares
- **Features**:
  - Deposit and mint functions
  - Withdraw and redeem functions
  - Fee mechanism (BPS-based)
  - Timelock functionality
- **Address**: Configurable via `NEXT_PUBLIC_PELON_STAKING_VAULT_ADDRESS`

All contract ABIs are defined in TypeScript files in `src/contracts/` using viem's type-safe ABI format.

## Custom Hooks

### Token Sale Hooks

- **`useTokenSale.ts`**: Main hook for token sale contract interactions
- **`useTokenSaleStats.ts`**: Fetches token sale statistics (total sold, current price, etc.)
- **`useTokenSalePurchase.ts`**: Handles token purchase transactions
- **`useRecentPurchases.ts`**: Fetches recent purchase history
- **`useTokenHolders.ts`**: Retrieves token holder data for leaderboard

### Approval Hooks

- **`useUSDCApproval.ts`**: Manages USDC token approval for token sale
- **`usePELONApproval.ts`**: Manages PELON token approval for vault operations

### Vault Hooks

- **`useVault.ts`**: Main hook for vault contract interactions
- **`useUserVaultData.ts`**: Fetches user-specific vault data (balance, shares, etc.)
- **`useVaultDeposit.ts`**: Handles vault deposit transactions
- **`useVaultMint.ts`**: Handles vault mint transactions
- **`useVaultWithdraw.ts`**: Handles vault withdraw transactions

All hooks use wagmi for blockchain interactions and React Query for caching and state management.

## Internationalization

The application supports multiple languages using `next-intl`:

### Supported Languages

- **Spanish (es)**: Default language
- **English (en)**: Secondary language

### Configuration

- **Locale Config**: `src/i18n/config.ts` - Defines available locales
- **Routing Config**: `src/i18n/routing.ts` - Defines routing behavior
- **Request Config**: `src/i18n/request.ts` - Configures next-intl server-side

### Translation Files

Translation files are located in `src/messages/`:

- `es.json` - Spanish translations
- `en.json` - English translations

### Usage in Components

```typescript
import { useTranslations } from 'next-intl';

function MyComponent() {
  const t = useTranslations();
  
  return <h1>{t('common.appName')}</h1>;
}
```

### SEO and i18n

The application includes SEO optimization with:

- Canonical URLs for each locale
- Alternate language links
- Locale-specific metadata
- Proper Open Graph tags

See `src/lib/seo.ts` for SEO utility functions.

## Troubleshooting

### Common Issues

#### Wallet Connection Issues

- **Problem**: Wallet not connecting
- **Solution**: 
  - Ensure `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` is set correctly
  - Check that you're on the correct network (Base Sepolia)
  - Clear browser cache and try again

#### Build Errors

- **Problem**: Build fails with webpack errors
- **Solution**:
  - Delete `node_modules` and `.next` directories
  - Run `npm install` again
  - Check that all environment variables are set

#### Static Export Issues

- **Problem**: Routes not working after static export
- **Solution**:
  - Ensure the postbuild script ran successfully
  - Check that `.htaccess` is configured correctly (for Apache)
  - Verify locale routing in `next.config.js`

#### TypeScript Errors

- **Problem**: Type errors in contract interactions
- **Solution**:
  - Ensure contract ABIs are up to date
  - Check that contract addresses are correctly typed
  - Verify viem version compatibility

### Getting Help

For issues and questions:

- Check the [Resources & References](#resources--references) section
- Review the workspace design system documentation
- Contact: carlos@pelon.club

## Resources & References

### Official Documentation

- [Next.js Documentation](https://nextjs.org/docs) - Next.js framework documentation
- [RainbowKit Documentation](https://rainbowkit.com) - RainbowKit wallet connection library
- [wagmi Documentation](https://wagmi.sh) - wagmi React hooks documentation
- [Tailwind CSS Documentation](https://tailwindcss.com/docs) - Tailwind CSS utility framework
- [next-intl Documentation](https://next-intl-docs.vercel.app/) - next-intl internationalization
- [viem Documentation](https://viem.sh) - viem TypeScript Ethereum client
- [React Query Documentation](https://tanstack.com/query/latest) - React Query data fetching

### Additional Resources

- [Base Blockchain](https://base.org) - Base L2 blockchain documentation
- [WalletConnect Cloud](https://cloud.walletconnect.com) - Get WalletConnect Project ID
- [Neobrutalism Design](https://www.neobrutalism.dev/) - Neobrutalism design reference
- [ERC4626 Standard](https://eips.ethereum.org/EIPS/eip-4626) - Tokenized Vault Standard

### Project Links

- **Website**: [pelon.club](https://pelon.club)
- **Twitter**: [@PelonClub](https://x.com/PelonClub)
- **Telegram**: [t.me/PelonClub](https://t.me/PelonClub)
- **Email**: carlos@pelon.club

## License

This project is private and proprietary to Baeza.eth (King Of The Pelones).

---

**Developed by**: Baeza.eth (King Of The Pelones)  
**Version**: 0.1.0
