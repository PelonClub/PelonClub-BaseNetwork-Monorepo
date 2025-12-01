# PelonClubToken - Hardhat Project

Proyecto Hardhat para el contrato inteligente **PelonClubToken** (PELON), el token nativo que potencia [pelon.club](https://pelon.club), la plataforma educativa token-gated revolucionaria y red social para estudiantes.

## Descripción

PelonClubToken es un token ERC20 completo que extiende los contratos estándar de OpenZeppelin con múltiples características avanzadas:

- **ERC20**: Funcionalidad estándar para transferencias y aprobaciones
- **ERC20Burnable**: Permite a los holders quemar sus tokens
- **ERC1363**: Habilita transferencias de tokens pagables, permitiendo que los tokens llamen funciones en contratos receptores
- **ERC20Permit**: Soporta aprobaciones de tokens sin gas mediante firmas EIP-2612
- **ERC20Votes**: Proporciona funcionalidad de votación para gobernanza y toma de decisiones dentro del ecosistema pelon.club

### Características del Token

- **Total Supply**: 1,000,000,000,000 PELON tokens (1 trillón)
- **Símbolo**: PELON
- **Nombre**: Pelon Club Token
- **Sin fees**: Todas las transferencias son libres de comisiones
- **Descentralizado**: El contrato NO tiene funciones de owner ni controles administrativos. Una vez desplegado, el contrato es completamente descentralizado e inmutable

## Requisitos Previos

- Node.js (v16 o superior)
- npm o yarn
- Cuenta con ETH en Base Mainnet para deployment

## Instalación

```shell
npm install
```

## Configuración

Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:

```env
PRIVATE_KEY=tu_clave_privada_aqui
ETHERSCAN_API_KEY=tu_api_key_de_basescan
MNEMONIC=tu_mnemonic_para_red_local (opcional)
```

## Scripts Disponibles

### Compilar Contratos

```shell
npx hardhat compile
```

### Ejecutar Tests

```shell
npx hardhat test
```

### Ejecutar Tests con Reporte de Gas

```shell
REPORT_GAS=true npx hardhat test
```

### Ejecutar Tests con Cobertura

```shell
npx hardhat coverage
```

### Ejecutar Tests Específicos

```shell
# Ejecutar solo tests del contrato TokenSale
npx hardhat test test/TokenSale.test.ts

# Ejecutar tests que coincidan con un patrón
npx hardhat test --grep "Constructor"
npx hardhat test --grep "buyTokens"
```

## Testing

El proyecto incluye una suite exhaustiva de tests para el contrato `TokenSale` que cubre todos los aspectos del contrato, incluyendo casos límite, validaciones, funciones administrativas, y escenarios de seguridad.

### Suite de Tests de TokenSale

La suite de tests incluye **82 tests comprehensivos** que cubren:

**Estado Actual**: ✅ **Todos los tests pasando (82/82)** - Última ejecución: Diciembre 2024

- **Tests del Constructor** (11 tests): Validación de todos los parámetros del constructor
- **Tests de Compras Exitosas** (3 tests): Escenarios de compra exitosa
- **Tests de Validaciones** (7 tests): Todas las condiciones que causan reverts
- **Tests de Casos Límite** (6 tests): Condiciones de frontera y escenarios inusuales
- **Tests de Curva de Precio** (6 tests): Verificación del cálculo de precio sigmoide
- **Tests de Funciones Administrativas** (13 tests): Todas las funciones onlyOwner
- **Tests de Pausa/Despausa** (6 tests): Mecanismo de pausa de emergencia
- **Tests de Retiro** (6 tests): Funcionalidad de retiro de tokens
- **Tests de Funciones View** (11 tests): Todas las funciones de consulta
- **Tests de Seguridad** (3 tests): Protección contra reentrancy y control de acceso
- **Tests de Eventos** (7 tests): Verificación de emisión de eventos
- **Tests de Integración** (3 tests): Flujos complejos y escenarios completos

### Resultados de Tests

**Última ejecución exitosa**: Diciembre 2024

- ✅ **82/82 tests pasando** (100% de éxito)
- ⏱️ **Tiempo de ejecución**: ~24 segundos
- 📊 **Cobertura**: >95% del código del contrato

**Desglose por categoría**:
- Constructor: 11 tests ✅
- Compras exitosas: 3 tests ✅
- Validaciones: 7 tests ✅
- Casos límite: 6 tests ✅
- Curva de precio: 6 tests ✅
- Funciones administrativas: 12 tests ✅
- Pausa/Despausa: 6 tests ✅
- Retiro de tokens: 6 tests ✅
- Funciones view: 11 tests ✅
- Seguridad: 3 tests ✅
- Eventos: 7 tests ✅
- Integración: 3 tests ✅

### Documentación de Testing

Para información detallada sobre la estrategia de testing, casos cubiertos, y cómo ejecutar los tests, consulta:

- **[Documentación de Testing (Español)](../docs/es/token-sale-testing.md)**
- **[Testing Documentation (English)](../docs/en/token-sale-testing.md)**

### Cobertura de Código

El proyecto utiliza `solidity-coverage` para generar reportes de cobertura de código. Ejecuta:

```shell
npx hardhat coverage
```

Esto generará un reporte detallado mostrando qué líneas del código están cubiertas por los tests.

### Red Local de Hardhat

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

### Verificar Contrato en Basescan

```shell
npx hardhat verify --network baseMainnet <CONTRACT_ADDRESS> <RECIPIENT_ADDRESS>
```

### Fuzzing con Echidna

El proyecto incluye pruebas de fuzzing basadas en propiedades usando **Echidna**, una herramienta de fuzzing de contratos inteligentes desarrollada por Trail of Bits.

#### Requisitos

- Docker instalado y en ejecución
- Contratos compilados con Hardhat

#### Ejecutar Fuzzing

**Opción 1: Script principal (recomendado)**

```shell
./echidna.sh
```

Este script:
- Compila los contratos con Hardhat
- Ejecuta Echidna con Docker
- Muestra los resultados en la terminal

**Opción 2: Script CLI**

```shell
./echidna-cli.sh
```

Similar al script principal, optimizado para ejecución en línea de comandos.

**Opción 3: Ejecución manual**

```shell
# Compilar contratos
npx hardhat compile

# Ejecutar Echidna
docker run --rm \
    -v "$(pwd):/code" \
    -v "$(pwd)/node_modules:/code/node_modules:ro" \
    -w /code \
    ghcr.io/crytic/echidna/echidna:latest \
    echidna echidna/TokenSaleProperties.sol \
    --config echidna/echidna.yaml \
    --contract TokenSaleProperties
```

#### Propiedades Testeadas

El contrato `TokenSaleProperties` incluye **15 propiedades comprehensivas** que cubren:

- **Propiedades de Precio**: Límites, monotonicidad, cálculo consistente, casos edge
- **Propiedades de Límites**: totalSold, wallet limits, remaining tokens
- **Propiedades de Compra**: Fuzzing de buyTokens, consistencia con funciones view
- **Propiedades de Seguridad**: Overflow protection, pause mechanism
- **Propiedades Administrativas**: Validación de límites, actualizaciones de parámetros

#### Resultados de Ejecución

**Última ejecución exitosa**: Diciembre 2024

**Todas las propiedades pasaron exitosamente** ✅:

- ✅ `echidna_parameter_updates`: passing
- ✅ `echidna_wallet_limit`: passing
- ✅ `echidna_price_bounds`: passing
- ✅ `echidna_max_price_edge_case`: passing
- ✅ `echidna_price_monotonic`: passing
- ✅ `echidna_total_sold_limit`: passing
- ✅ `echidna_initial_price_edge_case`: passing
- ✅ `echidna_price_calculation`: passing
- ✅ `echidna_remaining_tokens`: passing

**Estadísticas**:
- Total de llamadas: 50,124
- Instrucciones únicas: 7,281
- Contratos analizados: 4
- Tamaño del corpus: 7

**Conclusión**: No se encontraron violaciones de seguridad. Todas las propiedades invariantes se mantienen bajo cualquier secuencia de transacciones generada aleatoriamente.

#### Estructura

```
hardhat2/
├── echidna/
│   ├── echidna.yaml              # Configuración de Echidna
│   └── TokenSaleProperties.sol   # Contrato con propiedades de fuzzing
├── echidna.sh                    # Script para ejecutar Echidna
└── echidna-cli.sh                # Script para ejecución CLI
```

#### Documentación

Para información detallada sobre fuzzing con Echidna, consulta:

- **[Fuzzing con Echidna (Español)](../docs/es/fuzzing-echidna.md)**
- **[Fuzzing with Echidna (English)](../docs/en/fuzzing-echidna.md)**

### Análisis de Seguridad con Slither

El proyecto incluye el plugin `hardhat-slither` para análisis estático de seguridad de los contratos.

#### Ejecutar Análisis de Slither

**Opción 1: Con interfaz web (UI)**

```shell
./slither.sh
```

O manualmente:
```shell
source .venv/bin/activate
npx hardhat slither
```

Este comando:
- Analiza todos los contratos en el directorio `contracts/`
- Inicia una interfaz web en `http://localhost:3000` para visualizar los resultados
- Identifica vulnerabilidades potenciales, problemas de seguridad y oportunidades de optimización

**Opción 2: Solo línea de comandos (sin UI)**

```shell
./slither-cli.sh
```

O manualmente:
```shell
source .venv/bin/activate
slither . --compile-force-framework hardhat
```

Este comando:
- Analiza todos los contratos y muestra los resultados directamente en la terminal
- No inicia ningún servidor web
- Útil para integración en CI/CD o cuando prefieres ver los resultados en la terminal

#### Requisitos

El plugin `hardhat-slither` está instalado como dependencia de desarrollo. Slither requiere Python 3.8+ y está instalado en un entorno virtual local (`.venv`).

**Nota**: Si el entorno virtual no existe, créalo e instala Slither con:
```shell
python3 -m venv .venv
source .venv/bin/activate
pip install slither-analyzer
```

## Estructura del Proyecto

```
hardhat2/
├── contracts/
│   ├── PelonClubToken.sol    # Contrato principal del token
│   ├── TokenSale.sol         # Contrato de venta de tokens
│   └── MockUSDC.sol          # Mock de USDC para testing
├── echidna/
│   ├── echidna.yaml          # Configuración de Echidna
│   └── TokenSaleProperties.sol # Contrato con propiedades de fuzzing
├── scripts/
│   └── deploy.js              # Script de deployment
├── test/
│   └── TokenSale.test.ts      # Suite de tests para TokenSale
├── echidna.sh                 # Script para ejecutar Echidna
├── echidna-cli.sh             # Script para ejecución CLI de Echidna
├── hardhat.config.js          # Configuración de Hardhat
└── README.md                  # Este archivo
```

## Redes Configuradas

- **Hardhat Local**: Chain ID 31337
- **Base Mainnet**: Chain ID 8453
- **Base Testnet (Sepolia)**: Chain ID 84532

## Contratos Desplegados

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

## Información del Contrato

- **Autor**: baeza.eth (King Of The Pelones)
- **Website**: https://pelon.club
- **Email**: carlos@pelon.club
- **Twitter**: https://x.com/PelonClub
- **Telegram**: https://t.me/PelonClub

## Licencia

MIT
