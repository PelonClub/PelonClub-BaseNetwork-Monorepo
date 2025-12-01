# Pelon Club Documentation

Welcome to the Pelon Club documentation. This folder contains relevant documentation about the project.

## Content

### Tokenomics

Detailed documentation about the tokenomic allocation of Pelon Club Token (PELON):

- **[Tokenomics (Español)](./es/tokenomics-es.md)** - Documentation in Spanish
- **[Tokenomics (English)](./en/tokenomics-en.md)** - Documentation in English

### Sigmoid Bonding Curve User Guide

User-friendly guide explaining how the sigmoid bonding curve works for the PELON token sale, including price tiers, examples, and buying strategies:

- **[Sigmoid Bonding Curve Guide (Español)](./es/guia-curva-sigmoid.md)** - Complete user guide in Spanish explaining the bonding curve, price tiers, and how to buy tokens
- **[Sigmoid Bonding Curve Guide (English)](./en/sigmoid-bonding-curve-guide.md)** - Complete user guide in English explaining the bonding curve, price tiers, and how to buy tokens

The bonding curve guide includes:
- Simple explanation of how bonding curves work
- Four price tiers with real-world examples
- Comparison tables showing early vs late buyer advantages
- Step-by-step buying instructions
- Frequently asked questions
- Strategies for maximizing token acquisition

### Smart Contracts

Comprehensive technical documentation about the project's smart contracts:

- **[TokenSale Contract (Español)](./es/token-sale-contract.md)** - Complete technical analysis of the token sale contract
- **[TokenSale Contract (English)](./en/token-sale-contract.md)** - Complete technical analysis of the token sale contract

The TokenSale contract documentation includes:
- Architectural analysis and contract inheritance
- Security analysis and protection mechanisms
- Transaction flows and validations
- Administration and query functions
- Technical considerations and edge cases
- Mermaid diagrams of architecture and flows

### Security Analysis

Detailed technical documentation about the static security analysis performed with Slither:

- **[Security Slither Analysis (Español)](./es/security-slither.md)** - Comprehensive technical analysis of issues found by Slither and applied fixes
- **[Security Slither Analysis (English)](./en/security-slither.md)** - Comprehensive technical analysis of Slither findings and applied fixes

The security documentation includes:
- Slither analysis methodology
- Identified issues and their detailed technical analysis
- Implemented fixes and their impact
- Improvements in security, gas, and precision
- Future recommendations to maintain security

### Testing

Comprehensive documentation about the TokenSale contract test suite:

- **[TokenSale Testing (Español)](./es/token-sale-testing.md)** - Complete documentation about testing strategy, covered cases, and execution guide
- **[TokenSale Testing (English)](./en/token-sale-testing.md)** - Complete documentation about testing strategy, covered cases, and execution guide

The testing documentation includes:
- Testing strategy and test structure
- Complete test coverage (82 comprehensive tests)
- Edge cases and covered scenarios
- Test execution guide and coverage reports
- Testing metrics and statistics
- References and additional resources

### Fuzzing

Technical documentation about property-based fuzzing tests with Echidna:

- **[Fuzzing con Echidna (Español)](./es/fuzzing-echidna.md)** - Complete guide to fuzzing with Echidna for the TokenSale contract
- **[Fuzzing with Echidna (English)](./en/fuzzing-echidna.md)** - Complete guide to fuzzing with Echidna for the TokenSale contract

The fuzzing documentation includes:
- Introduction to fuzzing and Echidna
- Installation and configuration
- 15 tested invariant properties
- Execution guide and result interpretation
- Debugging and best practices
- Hardhat integration

### Deployed Contracts

#### Base Mainnet

Information about contracts deployed on Base Mainnet:

- **TokenSale**: [`0x42F94856e32bc8817dDe6CD1D8c0e8dF0b740Ba8`](https://basescan.org/address/0x42F94856e32bc8817dDe6CD1D8c0e8dF0b740Ba8)
- **PelonClubToken**: [`0x591e967fb0496beB4BDa117959e6D70D7Ad49a1C`](https://basescan.org/address/0x591e967fb0496beB4BDa117959e6D70D7Ad49a1C)
- **USDC**: [`0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`](https://basescan.org/address/0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913)
- **Chain ID**: 8453
- **Network**: Base Mainnet

#### Base Testnet (Sepolia)

Information about contracts deployed on Base Sepolia Testnet:

- **TokenSale**: [`0xdF556BD113FFC32CC85E098520BfC615438Ca16B`](https://sepolia.basescan.org/address/0xdF556BD113FFC32CC85E098520BfC615438Ca16B)
- **PelonClubToken**: [`0x734AE77B7dE9B5cc3Ce9d3D20B92c769d8588f15`](https://sepolia.basescan.org/address/0x734AE77B7dE9B5cc3Ce9d3D20B92c769d8588f15)
- **USDC Mock Token**: [`0x145Ef9F6a4324A181537Dfb7074F6E4B3E19Ec70`](https://sepolia.basescan.org/address/0x145Ef9F6a4324A181537Dfb7074F6E4B3E19Ec70)
- **Chain ID**: 84532
- **Network**: Base Sepolia Testnet

## Structure

```
docs/
├── es/                          # Documentation in Spanish
│   ├── tokenomics-es.md
│   ├── guia-curva-sigmoid.md
│   ├── token-sale-contract.md
│   ├── security-slither.md
│   ├── token-sale-testing.md
│   ├── fuzzing-echidna.md
│   └── README.md
├── en/                          # Documentation in English
│   ├── tokenomics-en.md
│   ├── sigmoid-bonding-curve-guide.md
│   ├── token-sale-contract.md
│   ├── security-slither.md
│   ├── token-sale-testing.md
│   ├── fuzzing-echidna.md
│   └── README.md
└── README.md                    # This file
```

