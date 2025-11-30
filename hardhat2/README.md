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

## Estructura del Proyecto

```
hardhat2/
├── contracts/
│   └── PelonClubToken.sol    # Contrato principal del token
├── scripts/
│   └── deploy.js              # Script de deployment
├── test/                      # Tests del contrato
├── hardhat.config.js          # Configuración de Hardhat
└── README.md                  # Este archivo
```

## Redes Configuradas

- **Hardhat Local**: Chain ID 31337
- **Base Mainnet**: Chain ID 8453
- **Base Testnet (Sepolia)**: Chain ID 84532

## Información del Contrato

- **Autor**: baeza.eth (King Of The Pelones)
- **Website**: https://pelon.club
- **Email**: carlos@pelon.club
- **Twitter**: https://x.com/PelonClub
- **Telegram**: https://t.me/PelonClub

## Licencia

MIT
