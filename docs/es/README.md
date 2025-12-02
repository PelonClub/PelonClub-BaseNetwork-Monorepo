# Documentación en Español - Pelon Club

Bienvenido a la documentación en español de **Pelon Club**, la primera plataforma educativa descentralizada que monetiza el conocimiento mientras construye una comunidad global de estudiantes y educadores de élite.

## 📚 Contenido

Este directorio contiene toda la documentación del proyecto traducida al español:

### Documentos Disponibles

- **[Tokenomics](tokenomics-es.md)** - Documentación completa sobre la asignación tokenómica del Pelon Club Token (PELON), incluyendo distribución, estructura y estrategia de sostenibilidad.

- **[Guía de Curva Sigmoid](guia-curva-sigmoid.md)** - Guía de usuario completa que explica cómo funciona la curva de vinculación sigmoid para la venta de tokens PELON. Incluye explicación de los tiers de precio, ejemplos prácticos, comparaciones entre compradores tempranos y tardíos, instrucciones paso a paso para comprar, y estrategias para maximizar la adquisición de tokens.

- **[TokenSale Contract](token-sale-contract.md)** - Análisis técnico exhaustivo del contrato inteligente de venta de tokens. Incluye análisis arquitectónico, seguridad, mecanismos de control, flujos de transacciones, funciones administrativas y de consulta, eventos, consideraciones técnicas y diagramas Mermaid.

- **[PelonStakingVault Contract](pelon-staking-vault.md)** - Análisis técnico exhaustivo del contrato inteligente de vault de staking. Incluye cumplimiento del estándar ERC4626, implementación del sistema de timelock fijo de 1 día, mecanismo de tarifas de retiro fijo del 3% con distribución 50/50, mecanismo de retención en vault que aumenta el valor por share, rastreo simple por usuario con timestamp, consideraciones de seguridad y optimizaciones de gas, y diagramas Mermaid de flujos y transiciones de estado.

- **[Guía de Usuario del Vault de Staking](guia-usuario-vault-staking.md)** - Guía de usuario completa para inversionistas que explica cómo usar el PelonStakingVault. Incluye introducción a vaults ERC4626, explicación detallada de la mecánica del vault y cálculo de shares, guía completa del sistema de timelock fijo de 1 día, explicación del sistema de tarifas de retiro con distribución 50/50 (fija 3%), beneficios de la retención en vault que aumentan el valor por share, operaciones paso a paso del usuario (depósitos, retiros, canjes), casos de uso prácticos con ejemplos del mundo real y cálculos, preguntas frecuentes, consideraciones técnicas (costos de gas, mejores prácticas, seguridad), y diagramas Mermaid de flujos de depósito y procesos de retiro.

- **[Security Slither Analysis](security-slither.md)** - Análisis técnico exhaustivo del análisis de seguridad estático realizado con Slither. Incluye metodología del análisis, problemas identificados y corregidos, impacto de las correcciones en seguridad, gas y precisión, y recomendaciones futuras para mantener la seguridad del código.

- **[Análisis de Seguridad PelonStakingVault](analisis-seguridad-pelon-staking-vault.md)** - Análisis técnico exhaustivo incluyendo análisis de seguridad, características de seguridad, mejores prácticas, y mecanismos implementados. Incluye análisis completo de arquitectura de seguridad, características de seguridad y mecanismos (protección reentrancy, timelock simple, distribución de tarifas), mejores prácticas y convenciones (uso de OpenZeppelin, cumplimiento ERC4626, optimización de gas), mecanismos simples pero efectivos (timelock fijo, tarifa fija, distribución 50/50), diagramas Mermaid (arquitectura, flujos, validaciones de seguridad), métricas y análisis de seguridad, y guías y recomendaciones para auditores, desarrolladores y usuarios.

- **[TokenSale Testing](token-sale-testing.md)** - Documentación exhaustiva sobre la suite de tests del contrato TokenSale. Incluye estrategia de testing, estructura de tests, cobertura completa (82 tests comprehensivos), casos límite cubiertos, guía de ejecución, métricas y estadísticas de testing.

**Testing PelonStakingVault**: El contrato PelonStakingVault es una implementación minimalista con análisis de seguridad comprehensivo. El análisis detallado de seguridad está incluido en la documentación de [Análisis de Seguridad PelonStakingVault](analisis-seguridad-pelon-staking-vault.md).

- **[Fuzzing con Echidna](fuzzing-echidna.md)** - Guía completa de fuzzing con Echidna para el contrato TokenSale. Incluye introducción a fuzzing, instalación y configuración, 15 propiedades invariantes testeadas, guía de ejecución, interpretación de resultados, debugging y mejores prácticas.

### Contratos Desplegados

#### Base Mainnet

Información sobre los contratos desplegados en Base Mainnet:

- **TokenSale**: [`0x42F94856e32bc8817dDe6CD1D8c0e8dF0b740Ba8`](https://basescan.org/address/0x42F94856e32bc8817dDe6CD1D8c0e8dF0b740Ba8)
- **PelonClubToken**: [`0x591e967fb0496beB4BDa117959e6D70D7Ad49a1C`](https://basescan.org/address/0x591e967fb0496beB4BDa117959e6D70D7Ad49a1C)
- **PelonStakingVault**: [`0x2239E40A03DCC1AB9C12F02f44cad7cb2E966452`](https://basescan.org/address/0x2239E40A03DCC1AB9C12F02f44cad7cb2E966452)
- **USDC**: [`0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`](https://basescan.org/address/0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913)
- **Chain ID**: 8453
- **Network**: Base Mainnet

#### Base Testnet (Sepolia)

Información sobre los contratos desplegados en Base Sepolia Testnet:

- **TokenSale**: [`0xdF556BD113FFC32CC85E098520BfC615438Ca16B`](https://sepolia.basescan.org/address/0xdF556BD113FFC32CC85E098520BfC615438Ca16B)
- **PelonClubToken**: [`0x734AE77B7dE9B5cc3Ce9d3D20B92c769d8588f15`](https://sepolia.basescan.org/address/0x734AE77B7dE9B5cc3Ce9d3D20B92c769d8588f15)
- **PelonStakingVault**: [`0x0c874C04783e0838E92f42D52bD8A2a9eCE56b40`](https://sepolia.basescan.org/address/0x0c874C04783e0838E92f42D52bD8A2a9eCE56b40)
- **USDC Mock Token**: [`0x145Ef9F6a4324A181537Dfb7074F6E4B3E19Ec70`](https://sepolia.basescan.org/address/0x145Ef9F6a4324A181537Dfb7074F6E4B3E19Ec70)
- **Chain ID**: 84532
- **Network**: Base Sepolia Testnet

## 🎯 Sobre Pelon Club

Pelon Club es un proyecto de Carlos Baeza (King Of The Pelones) que combina:

- **Recursos educativos token-gated** - Contenido educativo de alta calidad protegido por tokens
- **Monetización del conocimiento** - Sistema para que educadores monetizen su expertise
- **Red social para estudiantes** - Comunidad global de aprendizaje colaborativo
- **Gobernanza descentralizada** - Sistema DAO para toma de decisiones comunitaria

## 🔗 Enlaces Útiles

- **Plataforma:** [pelon.club](https://pelon.club)
- **Twitter:** [@PelonClub](https://x.com/PelonClub)
- **Telegram:** [t.me/PelonClub](https://t.me/PelonClub)
- **Contacto:** carlos@pelon.club

## 📝 Contribuir

Si encuentras errores en la traducción o quieres mejorar la documentación, por favor contacta al equipo a través de los canales oficiales.

---

**Nota:** Esta documentación está sujeta a actualizaciones. Para la información más reciente, consulta siempre la versión más actualizada de los documentos.

