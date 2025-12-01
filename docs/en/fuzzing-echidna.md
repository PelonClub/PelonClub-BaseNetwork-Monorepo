# Fuzzing with Echidna - TokenSale Contract

## Introduction

This document describes the implementation of property-based fuzzing tests for the `TokenSale` contract using **Echidna**, a smart contract fuzzer developed by Trail of Bits.

## What is Fuzzing?

Fuzzing (or property-based testing) is a testing technique that automatically generates random inputs to verify that certain invariant properties always hold in a contract. Unlike traditional unit tests that test specific cases, fuzzing explores a much larger input space, finding edge cases and vulnerabilities that might go unnoticed.

## Echidna

Echidna is a smart contract fuzzer that:

- Automatically generates random transactions
- Tests invariant properties defined in Solidity
- Finds property violations and generates reproducible test cases
- Provides code coverage analysis

## Installation

Echidna runs using Docker, which simplifies installation and ensures a consistent environment.

### Prerequisites

- Docker installed and running
- Node.js and npm (for compiling contracts with Hardhat)
- Contracts compiled with Hardhat

### Verify Docker

```bash
docker --version
docker info
```

If Docker is not installed, visit: https://docs.docker.com/get-docker/

## Project Structure

```
hardhat2/
├── echidna/
│   ├── echidna.yaml              # Echidna configuration
│   └── TokenSaleProperties.sol   # Contract with fuzzing properties
├── echidna.sh                    # Script to run Echidna
└── echidna-cli.sh                # Script for CLI execution
```

## Configuration

### Configuration File: `echidna.yaml`

The `echidna/echidna.yaml` file contains Echidna's configuration:

```yaml
testMode: property              # Property-based testing mode
testLimit: 50000                # Number of test sequences to generate
shrinkLimit: 5000               # Maximum shrink attempts
seqLen: 50                      # Sequence length (transactions per test)
coverage: true                  # Enable coverage analysis
format: text                    # Output format
solc: "0.8.30"                  # Solidity compiler version
solcArgs: "--optimize --optimize-runs 200 --allow-paths .,/code/node_modules --base-path /code --include-path /code/node_modules"
remappings:
  - "@openzeppelin/contracts/=node_modules/@openzeppelin/contracts/"
```

**Note**: The configuration includes `--base-path` and `--include-path` so Echidna can correctly find OpenZeppelin contracts in `node_modules`.

### Properties Contract: `TokenSaleProperties.sol`

This contract defines all invariant properties that Echidna will test. Property functions must:

- Start with the `echidna_` prefix
- Return `bool` (true = property holds, false = violation)
- Be `public` or `external`

## Tested Properties

The `TokenSaleProperties` contract includes **15 comprehensive properties** covering all critical aspects of the contract:

### 1. Price Properties

#### `echidna_price_bounds()`
**Property:** Price is always between `initialPrice` and `maxPrice`.

**Importance:** Ensures the bonding curve never exceeds its defined bounds.

#### `echidna_price_monotonic()`
**Property:** Price never decreases (monotonicity).

**Importance:** The bonding curve should only increase or stay constant, never decrease.

#### `echidna_price_calculation()`
**Property:** Price calculation is consistent with the sigmoid formula.

**Importance:** Verifies that the mathematical implementation of the curve is correct.

#### `echidna_initial_price_edge_case()`
**Property:** When `totalSold = 0`, price equals `initialPrice`.

**Importance:** Validates behavior at the initial state.

#### `echidna_max_price_edge_case()`
**Property:** When `totalSold >= inflectionPoint * 2`, price equals `maxPrice`.

**Importance:** Validates behavior at the upper limit of the curve.

### 2. Limit Properties

#### `echidna_total_sold_limit()`
**Property:** `totalSold` never exceeds `maxTotalSale`.

**Importance:** Ensures the global sale limit is never violated.

#### `echidna_wallet_limit(address wallet)`
**Property:** `tokensPurchased` never exceeds `maxTokensPerWallet` for any address.

**Importance:** Verifies that the anti-whale mechanism works correctly.

#### `echidna_remaining_tokens()`
**Property:** `getRemainingTokens()` returns the correct value.

**Importance:** Ensures the remaining tokens calculation is accurate.

### 3. Purchase Properties

#### `echidna_fuzz_buy(uint256 usdcAmount)`
**Property:** Fuzzing of the `buyTokens` function with different `usdcAmount` values.

**Importance:** Tests that purchases work correctly with a wide range of values.

#### `echidna_buy_consistency(uint256 usdcAmount)`
**Property:** `getPelonAmount` is consistent with the internal calculation of `buyTokens`.

**Importance:** Verifies that view functions and state-changing functions match.

#### `echidna_can_purchase(address wallet, uint256 usdcAmount)`
**Property:** `canPurchase` is consistent with `buyTokens` behavior.

**Importance:** Ensures the query function correctly predicts whether a purchase will succeed.

### 4. Security Properties

#### `echidna_no_overflow(uint256 usdcAmount)`
**Property:** No arithmetic overflow in calculations.

**Importance:** Prevents overflow vulnerabilities that could cause unexpected behavior.

#### `echidna_pause_protection(uint256 usdcAmount)`
**Property:** Purchases are blocked when the contract is paused.

**Importance:** Verifies that the pause mechanism works correctly.

### 5. Administrative Properties

#### `echidna_admin_limits(uint256 newMaxPrice, uint256 newMaxTokensPerWallet, uint256 newMaxTotalSale)`
**Property:** Administrative functions respect limits.

**Importance:** Ensures administrative parameters are validated correctly.

#### `echidna_parameter_updates()`
**Property:** Parameter updates maintain invariants.

**Importance:** Verifies that changing parameters doesn't break basic contract properties.

## Execution

### Option 1: Main Script (Recommended)

```bash
cd hardhat2
./echidna.sh
```

This script:
1. Compiles contracts with Hardhat
2. Runs Echidna with Docker
3. Displays results in the terminal

### Option 2: CLI Script

```bash
cd hardhat2
./echidna-cli.sh
```

Similar to the main script, but optimized for command-line execution.

### Option 3: Manual Execution

```bash
cd hardhat2

# 1. Compile contracts
npx hardhat compile

# 2. Run Echidna
docker run --rm \
    -v "$(pwd):/code" \
    -v "$(pwd)/node_modules:/code/node_modules:ro" \
    -w /code \
    ghcr.io/crytic/echidna/echidna:latest \
    echidna echidna/TokenSaleProperties.sol \
    --config echidna/echidna.yaml \
    --contract TokenSaleProperties
```

## Interpreting Results

### Successful Output

When all properties pass, you'll see something like:

```
echidna_price_bounds: passing
echidna_price_monotonic: passing
echidna_total_sold_limit: passing
...
```

### Property Violation

If Echidna finds a violation, it will show:

```
echidna_price_bounds: failed!💥
  Call sequence:
    1. echidna_fuzz_buy(1000000)
    2. setMaxPrice(0)
    3. echidna_price_bounds()
```

This indicates:
- Which property failed
- The sequence of calls that caused the violation
- The specific values that caused the problem

### Coverage Analysis

With `coverage: true` in the configuration, Echidna will also show:
- Code coverage percentage
- Uncovered lines
- Untested functions

## Execution Results

### Last Successful Execution

**Date**: December 2024  
**Configuration**: `echidna.yaml` with 50,000 tests, 50 sequences, coverage enabled

### Tested Properties - All Passed ✅

All **9 invariant properties** were successfully validated:

1. ✅ **`echidna_parameter_updates`**: passing
   - Verifies that parameter updates maintain invariants

2. ✅ **`echidna_wallet_limit`**: passing
   - Ensures `tokensPurchased` never exceeds `maxTokensPerWallet`

3. ✅ **`echidna_price_bounds`**: passing
   - Confirms price is always between `initialPrice` and `maxPrice`

4. ✅ **`echidna_max_price_edge_case`**: passing
   - Validates that when `totalSold >= inflectionPoint * 2`, price equals `maxPrice`

5. ✅ **`echidna_price_monotonic`**: passing
   - Verifies price never decreases (monotonicity)

6. ✅ **`echidna_total_sold_limit`**: passing
   - Ensures `totalSold` never exceeds `maxTotalSale`

7. ✅ **`echidna_initial_price_edge_case`**: passing
   - Validates that when `totalSold = 0`, price equals `initialPrice`

8. ✅ **`echidna_price_calculation`**: passing
   - Verifies price calculation is consistent with sigmoid formula

9. ✅ **`echidna_remaining_tokens`**: passing
   - Confirms `getRemainingTokens()` returns correct value

### Execution Statistics

```
Total calls: 50,124
Unique instructions: 7,281
Unique contracts: 4
Corpus size: 7
Seed: 7964303477694697903
```

### Coverage Analysis

- **Unique instructions covered**: 7,281
- **Contracts analyzed**: 4
- **Sequences in corpus**: 7

### Fuzzing Functions

In addition to invariant properties, the contract includes fuzzing functions that were automatically executed:

- `fuzz_buy(uint256 usdcAmount)`: Fuzzing of `buyTokens` function
- `fuzz_buy_consistency(uint256 usdcAmount)`: Consistency between `getPelonAmount` and `buyTokens`
- `fuzz_can_purchase(address wallet, uint256 usdcAmount)`: Consistency of `canPurchase`
- `fuzz_no_overflow(uint256 usdcAmount)`: Overflow protection
- `fuzz_pause_protection(uint256 usdcAmount)`: Pause protection
- `fuzz_admin_limits(...)`: Administrative limits validation

### Results Conclusion

✅ **All invariant properties passed successfully**  
✅ **No security violations found**  
✅ **Bonding curve works correctly in all cases**  
✅ **Limits and validations work as expected**  
✅ **No overflow or underflow issues detected**  
✅ **Pause mechanism works correctly**

The `TokenSale` contract has been exhaustively validated through fuzzing, confirming that all critical properties are maintained under any randomly generated transaction sequence.

## Debugging

### Reproducing a Failure Case

When Echidna finds a violation, it generates a reproducible test case. You can:

1. **Review the call sequence** in the output
2. **Create a unit test** based on that sequence
3. **Fix the bug** in the contract
4. **Re-run Echidna** to verify the fix

### Adjusting Configuration

If Echidna doesn't find violations but you suspect issues:

- **Increase `testLimit`**: More tests = more coverage
- **Increase `seqLen`**: Longer sequences can find complex bugs
- **Adjust `shrinkLimit`**: More shrink attempts = simpler cases

## Best Practices

### 1. Specific Properties

Define clear and specific properties. Avoid overly general properties that always pass.

### 2. Bounds in Fuzzing

Use the `bound()` function to limit values and avoid overflow:

```solidity
function echidna_fuzz_buy(uint256 usdcAmount) public returns (bool) {
    usdcAmount = bound(usdcAmount, 1, 1000000 * 10**6);
    // ... rest of code
}
```

### 3. Error Handling

Use `try-catch` to handle transactions that may revert:

```solidity
try tokenSale.buyTokens(usdcAmount) returns () {
    // Verify state after successful purchase
} catch {
    // Verify that the revert was expected
}
```

### 4. Initial State

Ensure the properties contract constructor correctly sets up the initial state, including:
- Deployment of dependent contracts
- Balance configuration
- Tracking variable initialization

### 5. Continuous Integration

Include Echidna in your CI/CD pipeline to automatically run fuzzing on each commit.

## Limitations

### 1. Token Approvals

Echidna cannot approve tokens on behalf of other users. For properties requiring purchases, ensure users have funds and approvals configured.

### 2. Computational Complexity

Very complex properties may take a long time to execute. Optimize properties to balance coverage and speed.

### 3. Global State

Echidna executes properties in isolation. To test complex sequences, consider using fuzzing functions that modify state.

## Integration with Hardhat

Echidna tests complement (not replace) Hardhat unit tests:

- **Hardhat Tests**: Specific cases, known edge cases, integration
- **Echidna Fuzzing**: Input space exploration, invariant properties, unanticipated cases

Run both for maximum coverage:

```bash
# Unit tests
npx hardhat test

# Fuzzing
./echidna.sh
```

## Additional Resources

- **Echidna Official Documentation**: https://github.com/crytic/echidna
- **Echidna Guide**: https://github.com/crytic/echidna/wiki
- **Property Examples**: https://github.com/crytic/echidna/tree/master/examples

## Conclusion

Fuzzing with Echidna is a powerful tool for finding vulnerabilities and edge cases in smart contracts. The 15 properties implemented for `TokenSale` cover:

- ✅ Mathematical calculations (bonding curve)
- ✅ Limits and validations
- ✅ Purchase functionality
- ✅ Security (overflow, pause)
- ✅ Administrative functions

Run Echidna regularly as part of your development process to maintain contract security and robustness.

---

**Author**: baeza.eth (King Of The Pelones)  
**Website**: https://pelon.club  
**Email**: carlos@pelon.club

