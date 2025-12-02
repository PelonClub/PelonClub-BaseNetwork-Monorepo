# Pelon Club Documentation (English)

Welcome to the Pelon Club documentation in English. This folder contains relevant documentation about the project in English.

## Content

### Tokenomics

Detailed documentation about the tokenomics allocation of Pelon Club Token (PELON):

- **[Tokenomics (English)](./tokenomics-en.md)** - Complete tokenomics documentation

### Sigmoid Bonding Curve User Guide

User-friendly guide explaining how the sigmoid bonding curve works for the PELON token sale:

- **[Sigmoid Bonding Curve Guide (English)](./sigmoid-bonding-curve-guide.md)** - Complete user guide explaining the bonding curve, price tiers, and how to buy tokens

The bonding curve guide includes:
- Simple explanation of how bonding curves work
- Four price tiers with real-world examples
- Comparison tables showing early vs late buyer advantages
- Step-by-step buying instructions
- Frequently asked questions
- Strategies for maximizing token acquisition

### Smart Contracts

Comprehensive technical documentation about the project's smart contracts:

- **[TokenSale Contract (English)](./token-sale-contract.md)** - Complete technical analysis of the token sale contract
- **[PelonStakingVault Contract (English)](./pelon-staking-vault.md)** - Complete technical analysis of the staking vault contract

The TokenSale contract documentation includes:
- Architectural analysis and contract inheritance
- Security analysis and protection mechanisms
- Transaction flows and validations
- Administrative and query functions
- Technical considerations and edge cases
- Mermaid diagrams of architecture and flows

The PelonStakingVault contract documentation includes:
- ERC4626 standard compliance and architecture
- Fixed 1-day timelock system
- Fixed 3% withdrawal fee mechanism with 50/50 distribution
- Vault retention mechanism that increases value per share for all holders
- Simple per-user timestamp tracking
- Security considerations and gas optimizations
- Mermaid diagrams of flows and state transitions

### Staking Vault User Guide

Comprehensive user guide for investors explaining how to use the PelonStakingVault:

- **[Staking Vault User Guide (English)](./staking-vault-user-guide.md)** - Complete user guide explaining how to stake PELON tokens, understand the FIFO timelock system, withdrawal fees, and practical use cases

The staking vault user guide includes:
- Introduction to ERC4626 vaults and core concepts
- Detailed explanation of vault mechanics and share calculation
- Comprehensive guide to the fixed 1-day timelock system
- Withdrawal fee system explanation with 50/50 distribution (fixed 3%)
- Vault retention benefits that increase value per share for all holders
- Step-by-step user operations (deposits, withdrawals, redemptions)
- Practical use cases with real-world examples and calculations
- Frequently asked questions
- Technical considerations (gas costs, best practices, security)
- Mermaid diagrams of deposit flows and withdrawal processes

### Security Analysis

Detailed technical documentation about the static security analysis performed with Slither:

- **[Security Slither Analysis (English)](./security-slither.md)** - Comprehensive technical analysis of Slither findings and applied fixes

The security documentation includes:
- Analysis methodology with Slither
- Identified issues and detailed technical analysis
- Implemented fixes and their impact
- Improvements in security, gas, and precision
- Future recommendations for maintaining security

### PelonStakingVault Security Analysis

Comprehensive security analysis and testing documentation for the PelonStakingVault contract:

- **[PelonStakingVault Security Analysis (English)](./pelon-staking-vault-security-analysis.md)** - Exhaustive technical analysis including Slither findings, comprehensive test coverage (75 tests), security features, best practices, and innovative mechanisms

The PelonStakingVault security analysis includes:
- Complete security analysis and findings
- Security features and mechanisms (reentrancy protection, simple timelock, fee distribution)
- Best practices and conventions (OpenZeppelin usage, ERC4626 compliance, gas optimization)
- Simple timelock and fee mechanisms
- Mermaid diagrams (architecture, flows, state transitions)
- Security metrics and analysis
- Guidelines and recommendations for auditors, developers, and users

### Testing

Comprehensive documentation about contract test suites:

- **[TokenSale Testing (English)](./token-sale-testing.md)** - Complete documentation about testing strategy, covered cases, and execution guide

The TokenSale testing documentation includes:
- Testing strategy and test structure
- Complete test coverage (82 comprehensive tests)
- Edge cases and scenarios covered
- Test execution guide and coverage reports
- Metrics and testing statistics
- References and additional resources

**PelonStakingVault Testing**: The PelonStakingVault contract is a minimal implementation with comprehensive security analysis. Detailed security analysis is included in the [PelonStakingVault Security Analysis](./pelon-staking-vault-security-analysis.md) documentation.

### Fuzzing

Technical documentation about property-based fuzzing tests with Echidna:

- **[Fuzzing with Echidna (English)](./fuzzing-echidna.md)** - Complete guide to fuzzing with Echidna for the TokenSale contract

The fuzzing documentation includes:
- Introduction to fuzzing and Echidna
- Installation and configuration
- 15 invariant properties tested
- Execution guide and result interpretation
- Debugging and best practices
- Integration with Hardhat

### Deployed Contracts

#### Base Mainnet

Information about contracts deployed on Base Mainnet:

- **TokenSale**: [`0x42F94856e32bc8817dDe6CD1D8c0e8dF0b740Ba8`](https://basescan.org/address/0x42F94856e32bc8817dDe6CD1D8c0e8dF0b740Ba8)
- **PelonClubToken**: [`0x591e967fb0496beB4BDa117959e6D70D7Ad49a1C`](https://basescan.org/address/0x591e967fb0496beB4BDa117959e6D70D7Ad49a1C)
- **PelonStakingVault**: [`0x2239E40A03DCC1AB9C12F02f44cad7cb2E966452`](https://basescan.org/address/0x2239E40A03DCC1AB9C12F02f44cad7cb2E966452)
- **USDC**: [`0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`](https://basescan.org/address/0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913)
- **Chain ID**: 8453
- **Network**: Base Mainnet

#### Base Testnet (Sepolia)

Information about contracts deployed on Base Sepolia Testnet:

- **TokenSale**: [`0xdF556BD113FFC32CC85E098520BfC615438Ca16B`](https://sepolia.basescan.org/address/0xdF556BD113FFC32CC85E098520BfC615438Ca16B)
- **PelonClubToken**: [`0x734AE77B7dE9B5cc3Ce9d3D20B92c769d8588f15`](https://sepolia.basescan.org/address/0x734AE77B7dE9B5cc3Ce9d3D20B92c769d8588f15)
- **PelonStakingVault**: [`0x0c874C04783e0838E92f42D52bD8A2a9eCE56b40`](https://sepolia.basescan.org/address/0x0c874C04783e0838E92f42D52bD8A2a9eCE56b40)
- **USDC Mock Token**: [`0x145Ef9F6a4324A181537Dfb7074F6E4B3E19Ec70`](https://sepolia.basescan.org/address/0x145Ef9F6a4324A181537Dfb7074F6E4B3E19Ec70)
- **Chain ID**: 84532
- **Network**: Base Sepolia Testnet

## Structure

```
docs/en/
├── tokenomics-en.md                    # Tokenomics documentation in English
├── sigmoid-bonding-curve-guide.md      # Sigmoid bonding curve user guide
├── token-sale-contract.md               # TokenSale contract technical documentation
├── pelon-staking-vault.md               # PelonStakingVault contract technical documentation
├── staking-vault-user-guide.md          # PelonStakingVault user guide for investors
├── security-slither.md                  # Slither security analysis documentation
├── pelon-staking-vault-security-analysis.md  # PelonStakingVault security analysis and testing
├── token-sale-testing.md                # TokenSale testing documentation
├── fuzzing-echidna.md                   # Echidna fuzzing documentation
└── README.md                             # This file
```

## About Pelon Club

Pelon Club is a token-gated educational platform that monetizes knowledge while building a global community of elite students and educators. The platform leverages Web3 technology to create a decentralized learning ecosystem powered by the PELON token.

For more information about the project structure and technical implementation, please refer to the [main project README](../../README.md).

