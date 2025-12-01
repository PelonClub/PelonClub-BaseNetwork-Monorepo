# Pelon Club Documentation (English)

Welcome to the Pelon Club documentation in English. This folder contains relevant documentation about the project in English.

## Content

### Tokenomics

Detailed documentation about the tokenomics allocation of Pelon Club Token (PELON):

- **[Tokenomics (English)](./tokenomics-en.md)** - Complete tokenomics documentation

### Smart Contracts

Comprehensive technical documentation about the project's smart contracts:

- **[TokenSale Contract (English)](./token-sale-contract.md)** - Complete technical analysis of the token sale contract

The TokenSale contract documentation includes:
- Architectural analysis and contract inheritance
- Security analysis and protection mechanisms
- Transaction flows and validations
- Administrative and query functions
- Technical considerations and edge cases
- Mermaid diagrams of architecture and flows

### Security Analysis

Detailed technical documentation about the static security analysis performed with Slither:

- **[Security Slither Analysis (English)](./security-slither.md)** - Comprehensive technical analysis of Slither findings and applied fixes

The security documentation includes:
- Analysis methodology with Slither
- Identified issues and detailed technical analysis
- Implemented fixes and their impact
- Improvements in security, gas, and precision
- Future recommendations for maintaining security

### Testing

Comprehensive documentation about the TokenSale contract test suite:

- **[TokenSale Testing (English)](./token-sale-testing.md)** - Complete documentation about testing strategy, covered cases, and execution guide

The testing documentation includes:
- Testing strategy and test structure
- Complete test coverage (82 comprehensive tests)
- Edge cases and scenarios covered
- Test execution guide and coverage reports
- Metrics and testing statistics
- References and additional resources

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
docs/en/
├── tokenomics-en.md          # Tokenomics documentation in English
├── token-sale-contract.md     # TokenSale contract technical documentation
├── security-slither.md        # Slither security analysis documentation
├── token-sale-testing.md      # TokenSale testing documentation
├── fuzzing-echidna.md         # Echidna fuzzing documentation
└── README.md                  # This file
```

## About Pelon Club

Pelon Club is a token-gated educational platform that monetizes knowledge while building a global community of elite students and educators. The platform leverages Web3 technology to create a decentralized learning ecosystem powered by the PELON token.

For more information about the project structure and technical implementation, please refer to the [main project README](../../README.md).

