# Pelon.club

Monorepo for Baeza.eth (King Of The Pelones) - The Revolutionary Token-Gated Educational Platform & Student Social Network. Unlock exclusive access to premium educational resources, connect with elite students and educators globally, and participate in the first decentralized learning ecosystem that monetizes knowledge while building community. Early adopters gain privileged access to cutting-edge content, networking opportunities, and governance rights. Join the Web3 education revolution - where learning meets blockchain innovation.

## Links & Social Media

- **Website**: [pelon.club](https://pelon.club)
- **Twitter**: [@PelonClub](https://x.com/PelonClub)
- **Telegram**: [t.me/PelonClub](https://t.me/PelonClub)
- **Email**: carlos@pelon.club

## Documentation

For a comprehensive overview of all documentation, see the [Documentation Index](docs/README.md).

### Tokenomics

Documentación detallada sobre la asignación tokenómica del Pelon Club Token (PELON):

- **Tokenomics (English)**: [docs/en/tokenomics-en.md](docs/en/tokenomics-en.md) - Complete tokenomics documentation
- **Tokenomics (Español)**: [docs/es/tokenomics-es.md](docs/es/tokenomics-es.md) - Documentación completa de tokenomics

### Smart Contracts

Documentación técnica exhaustiva sobre los contratos inteligentes del proyecto:

- **TokenSale Contract (English)**: [docs/en/token-sale-contract.md](docs/en/token-sale-contract.md) - Complete technical analysis of the token sale contract
- **TokenSale Contract (Español)**: [docs/es/token-sale-contract.md](docs/es/token-sale-contract.md) - Análisis técnico completo del contrato de venta de tokens

La documentación del contrato TokenSale incluye:
- Análisis arquitectónico y herencia de contratos
- Análisis de seguridad y mecanismos de protección
- Flujos de transacciones y validaciones
- Funciones de administración y consulta
- Consideraciones técnicas y casos edge
- Diagramas Mermaid de arquitectura y flujos

### Security Analysis

Documentación técnica detallada sobre el análisis de seguridad estático realizado con Slither:

- **Slither Analysis (English)**: [docs/en/security-slither.md](docs/en/security-slither.md) - Comprehensive technical analysis of Slither findings and applied fixes
- **Slither Analysis (Español)**: [docs/es/security-slither.md](docs/es/security-slither.md) - Análisis técnico exhaustivo de los problemas encontrados por Slither y las correcciones aplicadas

La documentación de seguridad incluye:
- Metodología del análisis con Slither
- Problemas identificados y su análisis técnico detallado
- Correcciones implementadas y su impacto
- Mejoras en seguridad, gas y precisión
- Recomendaciones futuras para mantener la seguridad

### Testing

Documentación exhaustiva sobre la suite de tests del contrato TokenSale:

- **TokenSale Testing (English)**: [docs/en/token-sale-testing.md](docs/en/token-sale-testing.md) - Complete documentation about testing strategy, covered cases, and execution guide
- **TokenSale Testing (Español)**: [docs/es/token-sale-testing.md](docs/es/token-sale-testing.md) - Documentación completa sobre la estrategia de testing, casos cubiertos, y guía de ejecución

La documentación de testing incluye:
- Estrategia de testing y estructura de tests
- Cobertura completa de tests (82 tests comprehensivos)
- Casos límite y escenarios edge cubiertos
- Guía de ejecución de tests y reportes de cobertura
- Métricas y estadísticas de testing
- Referencias y recursos adicionales

### Fuzzing

Documentación técnica sobre pruebas de fuzzing basadas en propiedades con Echidna:

- **Fuzzing with Echidna (English)**: [docs/en/fuzzing-echidna.md](docs/en/fuzzing-echidna.md) - Complete guide to fuzzing with Echidna for the TokenSale contract
- **Fuzzing con Echidna (Español)**: [docs/es/fuzzing-echidna.md](docs/es/fuzzing-echidna.md) - Guía completa de fuzzing con Echidna para el contrato TokenSale

La documentación de fuzzing incluye:
- Introducción a fuzzing y Echidna
- Instalación y configuración
- 15 propiedades invariantes testeadas
- Guía de ejecución e interpretación de resultados
- Debugging y mejores prácticas
- Integración con Hardhat

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
- **[Fuzzing con Echidna (Español)](docs/es/fuzzing-echidna.md)**

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
- **[Documentación de Testing (Español)](docs/es/token-sale-testing.md)**

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

