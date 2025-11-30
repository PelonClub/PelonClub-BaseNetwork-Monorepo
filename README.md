# Pelon.club

Monorepo for Baeza.eth (King Of The Pelones) - The Revolutionary Token-Gated Educational Platform & Student Social Network. Unlock exclusive access to premium educational resources, connect with elite students and educators globally, and participate in the first decentralized learning ecosystem that monetizes knowledge while building community. Early adopters gain privileged access to cutting-edge content, networking opportunities, and governance rights. Join the Web3 education revolution - where learning meets blockchain innovation.

## Links & Social Media

- **Website**: [pelon.club](https://pelon.club)
- **Twitter**: [@PelonClub](https://x.com/PelonClub)
- **Telegram**: [t.me/PelonClub](https://t.me/PelonClub)
- **Email**: carlos@pelon.club

## Documentation

- **Tokenomics (English)**: [docs/en/tokenomics-en.md](docs/en/tokenomics-en.md)
- **Tokenomics (Español)**: [docs/es/tokenomics-es.md](docs/es/tokenomics-es.md)

## Deployed Contracts

### Base Mainnet

- **PelonClubToken**: [`0x591e967fb0496beB4BDa117959e6D70D7Ad49a1C`](https://basescan.org/address/0x591e967fb0496beB4BDa117959e6D70D7Ad49a1C)
- **Chain ID**: 8453
- **Network**: Base Mainnet

### Base Testnet (Sepolia)

- **PelonClubToken**: [`0x734AE77B7dE9B5cc3Ce9d3D20B92c769d8588f15`](https://sepolia.basescan.org/address/0x734AE77B7dE9B5cc3Ce9d3D20B92c769d8588f15)
- **Chain ID**: 84532
- **Network**: Base Sepolia Testnet

## Project Structure

### [hardhat2](hardhat2/)

Contains the smart contracts for the project. Hardhat is installed here (version 2.27.1) along with development tools such as:

- **ethers** (v6.15.0) - Library for interacting with the blockchain
- **typechain** - TypeScript type generation from contracts
- **@nomicfoundation/hardhat-ignition** - Contract deployment system
- **@nomicfoundation/hardhat-verify** - Plugin for verifying contracts on block explorers
- **hardhat-gas-reporter** - Gas consumption reports
- **solidity-coverage** - Code coverage for contracts

### [dapp](dapp/)

Contains the frontend application. RainbowKit is installed here (version 2.2.9) for wallet integration, along with:

- **Next.js** (v15.3.3) - React framework for production
- **React** (v19.1.0) - UI library
- **wagmi** (v2.17.4) - React hooks for Ethereum
- **viem** (v2.40.3) - TypeScript client for Ethereum
- **@tanstack/react-query** (v5.55.3) - Server state management and caching
- **Tailwind CSS** (v4.1.17) - Utility-first CSS framework with neobrutalism design system

#### Styling

The dapp uses **Tailwind CSS v4** with a custom neobrutalism design system and indigo dark theme. Key styling files:

- **`src/styles/globals.css`** - Main stylesheet with `@theme` configuration for Tailwind v4
- **`tailwind.config.js`** - Minimal config (only `content` and `darkMode`)
- **`postcss.config.js`** - PostCSS configuration with `@tailwindcss/postcss`

The theme is defined in CSS using `@theme` (Tailwind v4 approach), not in the config file. All custom colors, shadows, and utilities are defined in `globals.css`.

See [`.cursor/rules/dapp.mdc`](.cursor/rules/dapp.mdc) for complete design system documentation.

