# PelonClubToken - Hardhat Project

Hardhat project for the **PelonClubToken** (PELON) smart contract, the native token that powers [pelon.club](https://pelon.club), the revolutionary token-gated educational platform and social network for students.

## Description

PelonClubToken is a complete ERC20 token that extends OpenZeppelin's standard contracts with multiple advanced features:

- **ERC20**: Standard functionality for transfers and approvals
- **ERC20Burnable**: Allows holders to burn their tokens
- **ERC1363**: Enables payable token transfers, allowing tokens to call functions on receiving contracts
- **ERC20Permit**: Supports gasless token approvals via EIP-2612 signatures
- **ERC20Votes**: Provides voting functionality for governance and decision-making within the pelon.club ecosystem

### Token Features

- **Total Supply**: 1,000,000,000,000 PELON tokens (1 trillion)
- **Symbol**: PELON
- **Name**: Pelon Club Token
- **No fees**: All transfers are fee-free
- **Decentralized**: The contract has NO owner functions or administrative controls. Once deployed, the contract is completely decentralized and immutable

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Account with ETH on Base Mainnet for deployment

## Installation

```shell
npm install
```

## Configuration

Create a `.env` file in the project root with the following variables:

```env
PRIVATE_KEY=your_private_key_here
ETHERSCAN_API_KEY=your_basescan_api_key
MNEMONIC=your_mnemonic_for_local_network (optional)
```

## Available Scripts

### Compile Contracts

```shell
npx hardhat compile
```

### Run Tests

```shell
npx hardhat test
```

### Run Tests with Gas Report

```shell
REPORT_GAS=true npx hardhat test
```

### Run Tests with Coverage

```shell
npx hardhat coverage
```

### Run Specific Tests

```shell
# Run only TokenSale contract tests
npx hardhat test test/TokenSale.test.ts

# Run tests matching a pattern
npx hardhat test --grep "Constructor"
npx hardhat test --grep "buyTokens"
```

## Testing

The project includes a comprehensive test suite for the `TokenSale` contract that covers all aspects of the contract, including edge cases, validations, administrative functions, and security scenarios.

### TokenSale Test Suite

The test suite includes **82 comprehensive tests** covering:

**Current Status**: ✅ **All tests passing (82/82)** - Last execution: December 2024

- **Constructor Tests** (11 tests): Validation of all constructor parameters
- **Successful Purchase Tests** (3 tests): Successful purchase scenarios
- **Validation Tests** (7 tests): All conditions that cause reverts
- **Edge Case Tests** (6 tests): Boundary conditions and unusual scenarios
- **Price Curve Tests** (6 tests): Verification of sigmoid price calculation
- **Administrative Function Tests** (13 tests): All onlyOwner functions
- **Pause/Unpause Tests** (6 tests): Emergency pause mechanism
- **Withdrawal Tests** (6 tests): Token withdrawal functionality
- **View Function Tests** (11 tests): All query functions
- **Security Tests** (3 tests): Protection against reentrancy and access control
- **Event Tests** (7 tests): Event emission verification
- **Integration Tests** (3 tests): Complex flows and complete scenarios

### Test Results

**Last successful execution**: December 2024

- ✅ **82/82 tests passing** (100% success rate)
- ⏱️ **Execution time**: ~24 seconds
- 📊 **Coverage**: >95% of contract code

**Breakdown by category**:
- Constructor: 11 tests ✅
- Successful purchases: 3 tests ✅
- Validations: 7 tests ✅
- Edge cases: 6 tests ✅
- Price curve: 6 tests ✅
- Administrative functions: 12 tests ✅
- Pause/Unpause: 6 tests ✅
- Token withdrawal: 6 tests ✅
- View functions: 11 tests ✅
- Security: 3 tests ✅
- Events: 7 tests ✅
- Integration: 3 tests ✅

### Testing Documentation

For detailed information about the testing strategy, covered cases, and how to run tests, see:

- **[Testing Documentation (English)](../docs/en/token-sale-testing.md)**

### Code Coverage

The project uses `solidity-coverage` to generate code coverage reports. Run:

```shell
npx hardhat coverage
```

This will generate a detailed report showing which lines of code are covered by tests.

### Hardhat Local Network

```shell
npx hardhat node
```

### Deployment

#### Base Mainnet

```shell
npx hardhat run scripts/deploy.js --network baseMainnet
```

#### Base Testnet (Sepolia)

```shell
npx hardhat run scripts/deploy.js --network baseTestnet
```

### Verify Contract on Basescan

```shell
npx hardhat verify --network baseMainnet <CONTRACT_ADDRESS> <RECIPIENT_ADDRESS>
```

### Fuzzing with Echidna

The project includes property-based fuzzing tests using **Echidna**, a smart contract fuzzing tool developed by Trail of Bits.

#### Requirements

- Docker installed and running
- Contracts compiled with Hardhat

#### Run Fuzzing

**Option 1: Main script (recommended)**

```shell
./echidna.sh
```

This script:
- Compiles contracts with Hardhat
- Runs Echidna with Docker
- Displays results in the terminal

**Option 2: CLI script**

```shell
./echidna-cli.sh
```

Similar to the main script, optimized for command-line execution.

**Option 3: Manual execution**

```shell
# Compile contracts
npx hardhat compile

# Run Echidna
docker run --rm \
    -v "$(pwd):/code" \
    -v "$(pwd)/node_modules:/code/node_modules:ro" \
    -w /code \
    ghcr.io/crytic/echidna/echidna:latest \
    echidna echidna/TokenSaleProperties.sol \
    --config echidna/echidna.yaml \
    --contract TokenSaleProperties
```

#### Tested Properties

The `TokenSaleProperties` contract includes **15 comprehensive properties** covering:

- **Price Properties**: Limits, monotonicity, consistent calculation, edge cases
- **Limit Properties**: totalSold, wallet limits, remaining tokens
- **Purchase Properties**: buyTokens fuzzing, consistency with view functions
- **Security Properties**: Overflow protection, pause mechanism
- **Administrative Properties**: Limit validation, parameter updates

#### Execution Results

**Last successful execution**: December 2024

**All properties passed successfully** ✅:

- ✅ `echidna_parameter_updates`: passing
- ✅ `echidna_wallet_limit`: passing
- ✅ `echidna_price_bounds`: passing
- ✅ `echidna_max_price_edge_case`: passing
- ✅ `echidna_price_monotonic`: passing
- ✅ `echidna_total_sold_limit`: passing
- ✅ `echidna_initial_price_edge_case`: passing
- ✅ `echidna_price_calculation`: passing
- ✅ `echidna_remaining_tokens`: passing

**Statistics**:
- Total calls: 50,124
- Unique instructions: 7,281
- Analyzed contracts: 4
- Corpus size: 7

**Conclusion**: No security violations found. All invariant properties hold under any randomly generated transaction sequence.

#### Structure

```
hardhat2/
├── echidna/
│   ├── echidna.yaml              # Echidna configuration
│   └── TokenSaleProperties.sol   # Contract with fuzzing properties
├── echidna.sh                    # Script to run Echidna
└── echidna-cli.sh                # CLI execution script
```

#### Documentation

For detailed information about fuzzing with Echidna, see:

- **[Fuzzing with Echidna (English)](../docs/en/fuzzing-echidna.md)**

### Security Analysis with Slither

The project includes the `hardhat-slither` plugin for static security analysis of contracts.

#### Run Slither Analysis

**Option 1: With web interface (UI)**

```shell
./slither.sh
```

Or manually:
```shell
source .venv/bin/activate
npx hardhat slither
```

This command:
- Analyzes all contracts in the `contracts/` directory
- Starts a web interface at `http://localhost:3000` to visualize results
- Identifies potential vulnerabilities, security issues, and optimization opportunities

**Option 2: Command line only (no UI)**

```shell
./slither-cli.sh
```

Or manually:
```shell
source .venv/bin/activate
slither . --compile-force-framework hardhat
```

This command:
- Analyzes all contracts and displays results directly in the terminal
- Does not start any web server
- Useful for CI/CD integration or when you prefer to see results in the terminal

#### Requirements

The `hardhat-slither` plugin is installed as a development dependency. Slither requires Python 3.8+ and is installed in a local virtual environment (`.venv`).

**Note**: If the virtual environment doesn't exist, create it and install Slither with:
```shell
python3 -m venv .venv
source .venv/bin/activate
pip install slither-analyzer
```

## Project Structure

```
hardhat2/
├── contracts/
│   ├── PelonClubToken.sol    # Main token contract
│   ├── TokenSale.sol         # Token sale contract
│   └── MockUSDC.sol          # USDC mock for testing
├── echidna/
│   ├── echidna.yaml          # Echidna configuration
│   └── TokenSaleProperties.sol # Contract with fuzzing properties
├── scripts/
│   └── deploy.js              # Deployment script
├── test/
│   └── TokenSale.test.ts      # Test suite for TokenSale
├── echidna.sh                 # Script to run Echidna
├── echidna-cli.sh             # CLI execution script for Echidna
├── hardhat.config.js          # Hardhat configuration
└── README.md                  # This file
```

## Configured Networks

- **Hardhat Local**: Chain ID 31337
- **Base Mainnet**: Chain ID 8453
- **Base Testnet (Sepolia)**: Chain ID 84532

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

## Contract Information

- **Author**: baeza.eth (King Of The Pelones)
- **Website**: https://pelon.club
- **Email**: carlos@pelon.club
- **Twitter**: https://x.com/PelonClub
- **Telegram**: https://t.me/PelonClub

## License

MIT
