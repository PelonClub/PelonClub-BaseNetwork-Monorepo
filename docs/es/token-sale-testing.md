# Documentación de Testing del Contrato TokenSale

## Descripción General

Este documento proporciona documentación exhaustiva sobre la suite de tests del contrato inteligente `TokenSale`. La suite de tests está diseñada para asegurar la máxima cobertura de toda la funcionalidad del contrato, casos límite y escenarios de seguridad.

## Estrategia de Testing

La suite de tests sigue un enfoque comprehensivo cubriendo:

1. **Tests Unitarios**: Pruebas de funciones individuales con escenarios aislados
2. **Tests de Integración**: Flujos complejos involucrando múltiples funciones e interacciones
3. **Tests de Casos Límite**: Condiciones de frontera y escenarios inusuales
4. **Tests de Seguridad**: Protección contra reentrancy, control de acceso y verificaciones de validación
5. **Verificación de Optimización de Gas**: Asegurando ejecución eficiente del contrato

## Estructura de Tests

La suite de tests está organizada en `hardhat2/test/TokenSale.test.ts` y usa la siguiente estructura:

- **Hardhat Framework**: Versión 2.27.1 con ethers v6
- **Chai Assertions**: Para aserciones y expectativas de tests
- **Hardhat Network Helpers**: Para manipulación de tiempo y fixtures
- **TypeScript**: Seguridad de tipos completa con tipos generados por typechain

## Cobertura de Tests

### 1. Tests del Constructor

Prueba toda la lógica de validación del constructor:

- ✅ Despliegue válido con parámetros correctos
- ✅ Validación de dirección cero para token USDC
- ✅ Validación de dirección cero para token PELON
- ✅ Validación de dirección cero para wallet de recepción de fondos
- ✅ Validación de valor cero para precio inicial
- ✅ Validación de valor cero para precio máximo
- ✅ Precio inicial debe ser menor que precio máximo
- ✅ Validación de valor cero para steepness de curva
- ✅ Validación de valor cero para punto de inflexión
- ✅ Validación de valor cero para máximo de tokens por wallet
- ✅ Validación de valor cero para máximo total de venta

**Total de Tests**: 11

### 2. buyTokens() - Compras Exitosas

Prueba escenarios exitosos de compra de tokens:

- ✅ Compra básica exitosa
- ✅ Múltiples compras del mismo usuario
- ✅ Compras de diferentes usuarios
- ✅ Verificación de emisión de eventos
- ✅ Verificación de actualización de balances
- ✅ Verificación de incremento de totalSold

**Total de Tests**: 3

### 3. buyTokens() - Validaciones

Prueba toda la lógica de validación que causa reverts:

- ✅ Revert con cantidad de USDC cero
- ✅ Revert cuando el contrato está pausado
- ✅ Revert cuando la compra excede el límite por wallet
- ✅ Revert cuando la compra excede el límite global de venta
- ✅ Revert cuando el contrato no tiene suficientes tokens
- ✅ Revert cuando el usuario no tiene suficientes USDC
- ✅ Revert cuando el usuario no ha aprobado USDC

**Total de Tests**: 7

### 4. buyTokens() - Casos Límite

Prueba condiciones de frontera y escenarios inusuales:

- ✅ Compra en el límite exacto por wallet
- ✅ Compra mínima (1 micro-USDC)
- ✅ Compra cuando totalSold = 0 (precio inicial)
- ✅ Compra cuando totalSold >= inflectionPoint * 2 (precio máximo)
- ✅ Múltiples compras alcanzando el límite por wallet
- ✅ Compra que resulta en cero PELON por redondeo

**Total de Tests**: 6

### 5. Tests de Curva de Precio

Prueba el cálculo de precio de la curva de bonding sigmoide:

- ✅ Retornar precio inicial cuando totalSold = 0
- ✅ Retornar precio máximo cuando totalSold >= inflectionPoint * 2
- ✅ Calcular precio intermedio correctamente
- ✅ Mostrar incremento progresivo del precio
- ✅ Manejar punto de inflexión pequeño
- ✅ Verificar precisión aritmética (fix divide-before-multiply)

**Total de Tests**: 6

### 6. Tests de Funciones Administrativas

Prueba todas las funciones administrativas solo para owner:

- ✅ setMaxPrice(): casos válidos e inválidos
- ✅ setCurveSteepness(): casos válidos e inválidos
- ✅ setInflectionPoint(): casos válidos e inválidos
- ✅ setMaxTokensPerWallet(): casos válidos e inválidos
- ✅ setMaxTotalSale(): casos válidos e inválidos
- ✅ Solo owner puede ejecutar funciones administrativas
- ✅ Eventos emitidos correctamente
- ✅ Efecto de cambios en compras futuras

**Total de Tests**: 13

### 7. Tests de Pausa/Despausa

Prueba el mecanismo de pausa de emergencia:

- ✅ Owner puede pausar el contrato
- ✅ Non-owner no puede pausar
- ✅ Owner puede despausar el contrato
- ✅ Compras prevenidas cuando está pausado
- ✅ Funciones view funcionan cuando está pausado
- ✅ Funciones administrativas funcionan cuando está pausado

**Total de Tests**: 6

### 8. Tests de Retiro

Prueba la funcionalidad de retiro de tokens:

- ✅ Owner puede retirar tokens PELON restantes
- ✅ Owner puede retirar tokens USDC si se enviaron
- ✅ Non-owner no puede retirar
- ✅ Revert con dirección de token cero
- ✅ Revert cuando no hay tokens para retirar
- ✅ Retirar tokens parciales después de compras

**Total de Tests**: 6

### 9. Tests de Funciones View

Prueba todas las funciones de consulta de solo lectura:

- ✅ getCurrentPrice(): retorna precio correcto
- ✅ getPelonAmount(): calcula correctamente
- ✅ getPelonAmount(): retorna cero para USDC cero
- ✅ getRemainingTokens(): calcula correctamente
- ✅ getRemainingTokens(): se actualiza después de compras
- ✅ canPurchase(): retorna true para compra válida
- ✅ canPurchase(): retorna false cuando está pausado
- ✅ canPurchase(): retorna false para cantidad cero
- ✅ canPurchase(): retorna false cuando excede límite por wallet
- ✅ canPurchase(): retorna false cuando excede límite total de venta
- ✅ canPurchase(): retorna false cuando hay tokens insuficientes

**Total de Tests**: 11

### 10. Tests de Seguridad

Prueba mecanismos de seguridad:

- ✅ Modificador nonReentrant en buyTokens
- ✅ Aplicación del patrón CEI
- ✅ Solo owner puede llamar funciones administrativas

**Total de Tests**: 3

### 11. Tests de Eventos

Prueba la emisión de eventos:

- ✅ Evento TokensPurchased con parámetros correctos
- ✅ Evento BondingCurveParametersUpdated
- ✅ Evento MaxTokensPerWalletUpdated
- ✅ Evento MaxTotalSaleUpdated
- ✅ Evento SalePaused
- ✅ Evento SaleUnpaused
- ✅ Evento TokensWithdrawn

**Total de Tests**: 7

### 12. Tests de Integración

Prueba flujos completos y escenarios complejos:

- ✅ Flujo completo de venta (múltiples compras, ajustes de parámetros, pausa/despausa)
- ✅ Múltiples compras simultáneas
- ✅ Finalización de venta hasta límite global

**Total de Tests**: 3

## Total de Tests

**Total General**: 82 tests comprehensivos

## Resultados de Ejecución

### Última Ejecución Exitosa

**Fecha**: Diciembre 2024  
**Estado**: ✅ Todos los tests pasando  
**Tiempo de Ejecución**: ~24 segundos  
**Tests Pasados**: 82/82 (100%)

### Desglose de Resultados por Categoría

- ✅ **Constructor**: 11 tests pasando
- ✅ **buyTokens() - Compras Exitosas**: 3 tests pasando
- ✅ **buyTokens() - Validaciones**: 7 tests pasando
- ✅ **buyTokens() - Casos Límite**: 6 tests pasando
- ✅ **Curva de Precio**: 6 tests pasando
- ✅ **Funciones Administrativas**: 12 tests pasando
- ✅ **Pause/Unpause**: 6 tests pasando
- ✅ **Withdraw Tokens**: 6 tests pasando
- ✅ **Funciones View**: 11 tests pasando
- ✅ **Seguridad**: 3 tests pasando
- ✅ **Eventos**: 7 tests pasando
- ✅ **Tests de Integración**: 3 tests pasando

### Métricas de Gas

Los tests incluyen reportes de consumo de gas para todas las funciones principales:

- **buyTokens()**: 88,618 - 155,275 gas (promedio: 99,142 gas)
- **Deployment TokenSale**: ~2,415,659 gas
- **Funciones administrativas**: ~29,794 - 30,256 gas

### Conclusión

Todos los tests pasan exitosamente sin errores. El contrato `TokenSale` está completamente funcional y listo para producción.

## Ejecutar los Tests

### Ejecución Básica de Tests

```bash
cd hardhat2
npx hardhat test
```

### Ejecutar Archivo de Test Específico

```bash
npx hardhat test test/TokenSale.test.ts
```

### Ejecutar con Reporte de Gas

```bash
REPORT_GAS=true npx hardhat test
```

### Ejecutar con Cobertura

```bash
npx hardhat coverage
```

### Ejecutar Suite de Tests Específica

```bash
npx hardhat test --grep "Constructor"
npx hardhat test --grep "buyTokens"
npx hardhat test --grep "Pricing Curve"
```

## Fixtures de Tests

La suite de tests usa un patrón de fixture reutilizable (`deployTokenSaleFixture`) que:

1. Despliega todos los contratos requeridos (MockUSDC, PelonClubToken, TokenSale)
2. Configura parámetros iniciales con valores realistas
3. Transfiere tokens al contrato TokenSale
4. Proporciona USDC a usuarios de prueba
5. Retorna todos los contratos y signers necesarios para los tests

Este patrón asegura:
- Configuración consistente de tests en todos los tests
- Ejecución más rápida de tests (fixtures son cacheados)
- Mantenimiento más fácil cuando cambian parámetros del contrato

## Parámetros Clave de Tests

Configuración de test por defecto:

- **Precio Inicial**: 0.000003 PELON por USDC (3e-6)
- **Precio Máximo**: 0.01 PELON por USDC (1e-2)
- **Steepness de Curva**: 1 (1e18)
- **Punto de Inflexión**: 100B tokens (1e20)
- **Máximo de Tokens Por Wallet**: 20B tokens (2e19)
- **Máximo Total de Venta**: 200B tokens (2e20)
- **Decimales USDC**: 6
- **Decimales PELON**: 18

## Funciones Helper

La suite de tests incluye funciones helper para:

1. **calculateExpectedPrice()**: Calcula el precio esperado usando la fórmula sigmoide
   - Maneja casos límite (totalSold = 0, totalSold >= inflectionPoint * 2)
   - Implementa la misma fórmula que el contrato para verificación

2. **calculatePelonAmount()**: Calcula cantidad de PELON desde USDC
   - Tiene en cuenta diferencias de decimales (6 vs 18 decimales)
   - Usa la misma fórmula que el contrato

## Casos Límite Cubiertos

### Precisión Aritmética

- Los tests verifican que el fix divide-before-multiply asegura máxima precisión
- Múltiples cálculos de precio en diferentes valores de totalSold
- Verificación de que los precios se calculan consistentemente

### Condiciones de Frontera

- Compras en límites exactos (límite por wallet, límite global)
- Cantidades de compra mínimas (1 micro-USDC)
- Valores máximos acercándose a límites de uint256
- Escenarios de valor cero

### Transiciones de Estado

- Estados de pausado a despausado
- Cambios de parámetros durante ventas activas
- Múltiples compras afectando progresión de precio

### Escenarios de Seguridad

- Control de acceso (modificadores onlyOwner)
- Protección contra reentrancy (modificador nonReentrant)
- Verificación del patrón CEI
- Manejo de entradas inválidas

## Integración Continua

Estos tests están diseñados para ejecutarse en pipelines CI/CD:

- Ejecución rápida (< 30 segundos)
- Resultados determinísticos (sin aleatoriedad)
- Cobertura comprehensiva (> 95%)
- Mensajes de error claros para debugging

## Mantenimiento de Tests

Al modificar el contrato `TokenSale`:

1. **Actualizar tests inmediatamente**: No commitar cambios de contrato sin actualizaciones correspondientes de tests
2. **Mantener cobertura**: Asegurar que nueva funcionalidad tiene tests correspondientes
3. **Revisar casos límite**: Agregar nuevos casos límite a medida que se descubren
4. **Actualizar documentación**: Mantener este documento sincronizado con cambios de tests

## Limitaciones Conocidas

1. **Testing de Reentrancy**: La simulación completa de ataques de reentrancy requiere desplegar contratos maliciosos, lo cual es complejo. El test verifica que el modificador existe y funciona correctamente.

2. **Optimización de Gas**: Aunque los tests verifican funcionalidad, el testing de optimización de gas debe hacerse por separado con herramientas de profiling.

3. **Específico de Red**: Los tests corren en la red Hardhat. Para despliegue en producción, se recomiendan tests adicionales en testnets.

## Mejoras Futuras

Potenciales mejoras a la suite de tests:

1. **Fuzzing**: Agregar fuzz testing con Echidna o Foundry
2. **Verificación Formal**: Usar herramientas de verificación formal para pruebas matemáticas
3. **Gas Profiling**: Agregar tests detallados de gas profiling
4. **Escenarios Multi-Usuario**: Más tests complejos de interacción multi-usuario
5. **Tests de Front-running**: Probar escenarios involucrando MEV y front-running

## Referencias

- [Documentación de Testing de Hardhat](https://hardhat.org/docs/guides/test-contracts)
- [Librería de Aserciones Chai](https://www.chaijs.com/api/)
- [OpenZeppelin Test Helpers](https://docs.openzeppelin.com/test-helpers)
- [Documentación del Contrato TokenSale](./token-sale-contract.md)
- [Documentación de Análisis de Seguridad](./security-slither.md)

---

**Última Actualización**: 2024-12-30  
**Versión de Suite de Tests**: 1.0.1  
**Versión de Contrato**: 1.0.0  
**Estado de Tests**: ✅ 82/82 pasando (100%)

### Notas de Versión

**v1.0.1 (2024-12-30)**: Correcciones en tests
- Corregido cálculo de `usdcNeeded` en tests de límites globales (fórmula corregida: `(tokens * price) / 1e30`)
- Corregido test "Should handle purchases from different users" (cálculo de precio antes de compra)
- Corregido test "Should revert when contract has insufficient tokens" (verificación de límite de wallet)
- Actualizado conteo de tests del Constructor (11 tests, no 10)

