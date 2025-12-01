#!/bin/bash
# Script helper para ejecutar Slither sin UI (solo línea de comandos)

# Activar el entorno virtual
source .venv/bin/activate

# Ejecutar slither directamente sin la UI
slither . --compile-force-framework hardhat

