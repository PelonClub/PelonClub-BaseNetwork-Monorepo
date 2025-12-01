# Pelon.club

![Banner](docs/images/banner4.png)

Monorepo for Baeza.eth (King Of The Pelones) - The Revolutionary Token-Gated Educational Platform & Student Social Network. Unlock exclusive access to premium educational resources, connect with elite students and educators globally, and participate in the first decentralized learning ecosystem that monetizes knowledge while building community. Early adopters gain privileged access to cutting-edge content, networking opportunities, and governance rights. Join the Web3 education revolution - where learning meets blockchain innovation.

## Links & Social Media

- **Website**: [pelon.club](https://pelon.club)
- **Twitter**: [@PelonClub](https://x.com/PelonClub)
- **Telegram**: [t.me/PelonClub](https://t.me/PelonClub)
- **Email**: carlos@pelon.club

## Documentation

For a comprehensive overview of all documentation, see the [Documentation Index](docs/README.md).

### Tokenomics

Detailed documentation about the tokenomics allocation of the Pelon Club Token (PELON):

- **Tokenomics (English)**: [docs/en/tokenomics-en.md](docs/en/tokenomics-en.md) - Complete tokenomics documentation
- **Tokenomics (Español)**: [docs/es/tokenomics-es.md](docs/es/tokenomics-es.md) - Complete tokenomics documentation (Spanish)

### Smart Contracts

Comprehensive technical documentation about the project's smart contracts:

- **TokenSale Contract (English)**: [docs/en/token-sale-contract.md](docs/en/token-sale-contract.md) - Complete technical analysis of the token sale contract
- **TokenSale Contract (Español)**: [docs/es/token-sale-contract.md](docs/es/token-sale-contract.md) - Complete technical analysis of the token sale contract (Spanish)

The TokenSale contract documentation includes:
- Architectural analysis and contract inheritance
- Security analysis and protection mechanisms
- Transaction flows and validations
- Administration and query functions
- Technical considerations and edge cases
- Mermaid diagrams of architecture and flows

### Security Analysis

Detailed technical documentation about the static security analysis performed with Slither:

- **Slither Analysis (English)**: [docs/en/security-slither.md](docs/en/security-slither.md) - Comprehensive technical analysis of Slither findings and applied fixes
- **Slither Analysis (Español)**: [docs/es/security-slither.md](docs/es/security-slither.md) - Comprehensive technical analysis of Slither findings and applied fixes (Spanish)

The security documentation includes:
- Slither analysis methodology
- Identified issues and their detailed technical analysis
- Implemented fixes and their impact
- Security, gas, and precision improvements
- Future recommendations for maintaining security

### Testing

Comprehensive documentation about the TokenSale contract test suite:

- **TokenSale Testing (English)**: [docs/en/token-sale-testing.md](docs/en/token-sale-testing.md) - Complete documentation about testing strategy, covered cases, and execution guide
- **TokenSale Testing (Español)**: [docs/es/token-sale-testing.md](docs/es/token-sale-testing.md) - Complete documentation about testing strategy, covered cases, and execution guide (Spanish)

The testing documentation includes:
- Testing strategy and test structure
- Complete test coverage (82 comprehensive tests)
- Edge cases and scenarios covered
- Test execution guide and coverage reports
- Testing metrics and statistics
- References and additional resources

### Fuzzing

Technical documentation about property-based fuzzing tests with Echidna:

- **Fuzzing with Echidna (English)**: [docs/en/fuzzing-echidna.md](docs/en/fuzzing-echidna.md) - Complete guide to fuzzing with Echidna for the TokenSale contract
- **Fuzzing with Echidna (Español)**: [docs/es/fuzzing-echidna.md](docs/es/fuzzing-echidna.md) - Complete guide to fuzzing with Echidna for the TokenSale contract (Spanish)

The fuzzing documentation includes:
- Introduction to fuzzing and Echidna
- Installation and configuration
- 15 invariant properties tested
- Execution guide and result interpretation
- Debugging and best practices
- Hardhat integration

## Deployed Contracts

### Base Mainnet

- **TokenSale**: [`0x42F94856e32bc8817dDe6CD1D8c0e8dF0b740Ba8`](https://basescan.org/address/0x42F94856e32bc8817dDe6CD1D8c0e8dF0b740Ba8)
- **PelonClubToken**: [`0x591e967fb0496beB4BDa117959e6D70D7Ad49a1C`](https://basescan.org/address/0x591e967fb0496beB4BDa117959e6D70D7Ad49a1C)
- **USDC**: [`0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`](https://basescan.org/address/0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913)
- **Chain ID**: 8453
- **Network**: Base Mainnet

### Base Testnet (Sepolia)

- **TokenSale**: [`0xdF556BD113FFC32CC85E098520BfC615438Ca16B`](https://sepolia.basescan.org/address/0xdF556BD113FFC32CC85E098520BfC615438Ca16B)
- **PelonClubToken**: [`0x734AE77B7dE9B5cc3Ce9d3D20B92c769d8588f15`](https://sepolia.basescan.org/address/0x734AE77B7dE9B5cc3Ce9d3D20B92c769d8588f15)
- **USDC Mock Token**: [`0x145Ef9F6a4324A181537Dfb7074F6E4B3E19Ec70`](https://sepolia.basescan.org/address/0x145Ef9F6a4324A181537Dfb7074F6E4B3E19Ec70)
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
- **hardhat-slither** - Static analysis tool for security vulnerability detection
- **Echidna** - Property-based fuzzing tool for smart contract testing

#### Security Analysis

Run Slither security analysis on contracts:

```shell
cd hardhat2
npx hardhat slither
```

This will analyze all contracts and provide a web interface at `http://localhost:3000` to view security findings.

#### Fuzzing with Echidna

Run property-based fuzzing tests with Echidna:

```shell
cd hardhat2
./echidna.sh
```

This will run comprehensive fuzzing tests on the `TokenSale` contract, testing 15 invariant properties including price bounds, limits, purchase functionality, security, and administrative functions.

For detailed documentation, see:
- **[Fuzzing with Echidna (English)](docs/en/fuzzing-echidna.md)**
- **[Fuzzing with Echidna (Español)](docs/es/fuzzing-echidna.md)**

#### Testing

The project includes comprehensive test suites for all smart contracts. The `TokenSale` contract has **82 comprehensive tests** covering all functionality, edge cases, validations, and security scenarios.

**Current Status**: ✅ **All tests passing (82/82)** - Last execution: December 2024

Run tests:

```shell
cd hardhat2
npx hardhat test
```

Run tests with coverage:

```shell
cd hardhat2
npx hardhat coverage
```

For detailed testing documentation, see:
- **[Testing Documentation (English)](docs/en/token-sale-testing.md)**
- **[Testing Documentation (Español)](docs/es/token-sale-testing.md)**

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

