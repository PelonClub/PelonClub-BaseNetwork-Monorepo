# Documentación de Pelon Club

Bienvenido a la documentación de Pelon Club. Esta carpeta contiene documentación relevante sobre el proyecto.

## Contenido

### Tokenomics

Documentación detallada sobre la asignación tokenómica del Pelon Club Token (PELON):

- **[Tokenomics (Español)](./es/tokenomics-es.md)** - Documentación en español
- **[Tokenomics (English)](./en/tokenomics-en.md)** - Documentation in English

### Contratos Inteligentes

Documentación técnica exhaustiva sobre los contratos inteligentes del proyecto:

- **[TokenSale Contract (Español)](./es/token-sale-contract.md)** - Análisis técnico completo del contrato de venta de tokens
- **[TokenSale Contract (English)](./en/token-sale-contract.md)** - Complete technical analysis of the token sale contract

La documentación del contrato TokenSale incluye:
- Análisis arquitectónico y herencia de contratos
- Análisis de seguridad y mecanismos de protección
- Flujos de transacciones y validaciones
- Funciones de administración y consulta
- Consideraciones técnicas y casos edge
- Diagramas Mermaid de arquitectura y flujos

### Análisis de Seguridad

Documentación técnica detallada sobre el análisis de seguridad estático realizado con Slither:

- **[Security Slither Analysis (Español)](./es/security-slither.md)** - Análisis técnico exhaustivo de los problemas encontrados por Slither y las correcciones aplicadas
- **[Security Slither Analysis (English)](./en/security-slither.md)** - Comprehensive technical analysis of Slither findings and applied fixes

La documentación de seguridad incluye:
- Metodología del análisis con Slither
- Problemas identificados y su análisis técnico detallado
- Correcciones implementadas y su impacto
- Mejoras en seguridad, gas y precisión
- Recomendaciones futuras para mantener la seguridad

### Testing

Documentación exhaustiva sobre la suite de tests del contrato TokenSale:

- **[TokenSale Testing (Español)](./es/token-sale-testing.md)** - Documentación completa sobre la estrategia de testing, casos cubiertos, y guía de ejecución
- **[TokenSale Testing (English)](./en/token-sale-testing.md)** - Complete documentation about testing strategy, covered cases, and execution guide

La documentación de testing incluye:
- Estrategia de testing y estructura de tests
- Cobertura completa de tests (82 tests comprehensivos)
- Casos límite y escenarios edge cubiertos
- Guía de ejecución de tests y reportes de cobertura
- Métricas y estadísticas de testing
- Referencias y recursos adicionales

### Fuzzing

Documentación técnica sobre pruebas de fuzzing basadas en propiedades con Echidna:

- **[Fuzzing con Echidna (Español)](./es/fuzzing-echidna.md)** - Guía completa de fuzzing con Echidna para el contrato TokenSale
- **[Fuzzing with Echidna (English)](./en/fuzzing-echidna.md)** - Complete guide to fuzzing with Echidna for the TokenSale contract

La documentación de fuzzing incluye:
- Introducción a fuzzing y Echidna
- Instalación y configuración
- 15 propiedades invariantes testeadas
- Guía de ejecución e interpretación de resultados
- Debugging y mejores prácticas
- Integración con Hardhat

### Contratos Desplegados

#### Base Mainnet

Información sobre los contratos desplegados en Base Mainnet:

- **TokenSale**: [`0x42F94856e32bc8817dDe6CD1D8c0e8dF0b740Ba8`](https://basescan.org/address/0x42F94856e32bc8817dDe6CD1D8c0e8dF0b740Ba8)
- **PelonClubToken**: [`0x591e967fb0496beB4BDa117959e6D70D7Ad49a1C`](https://basescan.org/address/0x591e967fb0496beB4BDa117959e6D70D7Ad49a1C)
- **USDC**: [`0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`](https://basescan.org/address/0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913)
- **Chain ID**: 8453
- **Network**: Base Mainnet

#### Base Testnet (Sepolia)

Información sobre los contratos desplegados en Base Sepolia Testnet:

- **TokenSale**: [`0xdF556BD113FFC32CC85E098520BfC615438Ca16B`](https://sepolia.basescan.org/address/0xdF556BD113FFC32CC85E098520BfC615438Ca16B)
- **PelonClubToken**: [`0x734AE77B7dE9B5cc3Ce9d3D20B92c769d8588f15`](https://sepolia.basescan.org/address/0x734AE77B7dE9B5cc3Ce9d3D20B92c769d8588f15)
- **USDC Mock Token**: [`0x145Ef9F6a4324A181537Dfb7074F6E4B3E19Ec70`](https://sepolia.basescan.org/address/0x145Ef9F6a4324A181537Dfb7074F6E4B3E19Ec70)
- **Chain ID**: 84532
- **Network**: Base Sepolia Testnet

## Estructura

```
docs/
├── es/                          # Documentación en español
│   ├── tokenomics-es.md
│   ├── token-sale-contract.md
│   ├── security-slither.md
│   ├── token-sale-testing.md
│   ├── fuzzing-echidna.md
│   └── README.md
├── en/                          # Documentation in English
│   ├── tokenomics-en.md
│   ├── token-sale-contract.md
│   ├── security-slither.md
│   ├── token-sale-testing.md
│   ├── fuzzing-echidna.md
│   └── README.md
└── README.md                    # Este archivo
```

