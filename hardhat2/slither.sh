#!/bin/bash
# Script helper para ejecutar Slither con el entorno virtual activado

# Activar el entorno virtual
source .venv/bin/activate

# Ejecutar hardhat slither
npx hardhat slither

