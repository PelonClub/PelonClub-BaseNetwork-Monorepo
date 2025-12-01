#!/bin/bash

# Script to run Echidna fuzzing tests in CLI mode (no UI)
# This script compiles the contracts first, then runs Echidna

set -e

echo "🔍 Echidna Fuzzing (CLI Mode) - TokenSale Contract"
echo "==================================================="
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Error: Docker is not installed."
    echo "Please install Docker to run Echidna fuzzing tests."
    echo "Visit: https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if Docker is running
if ! docker info &> /dev/null; then
    echo "❌ Error: Docker is not running."
    echo "Please start Docker and try again."
    exit 1
fi

# Get the directory where the script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "📦 Compiling contracts with Hardhat..."
npx hardhat compile

if [ $? -ne 0 ]; then
    echo "❌ Error: Contract compilation failed."
    exit 1
fi

echo ""
echo "🐳 Running Echidna fuzzing tests (CLI mode)..."
echo ""

# Run Echidna with Docker in CLI mode
# Mount the current directory to /code in the container
# Mount node_modules to make OpenZeppelin dependencies available
# Use the echidna.yaml configuration file
# Create symlink for OpenZeppelin imports and pass remappings via crytic-args
docker run --rm \
    -v "$SCRIPT_DIR:/code" \
    -v "$SCRIPT_DIR/node_modules:/code/node_modules:ro" \
    -w /code \
    ghcr.io/crytic/echidna/echidna:latest \
    sh -c "mkdir -p /code/@openzeppelin && ln -sf /code/node_modules/@openzeppelin/contracts /code/@openzeppelin/contracts && echidna echidna/TokenSaleProperties.sol --config echidna/echidna.yaml --contract TokenSaleProperties --format text --crytic-args '--compile-force-framework Solidity --compile-remove-metadata' && rm -rf /code/@openzeppelin 2>/dev/null || (rm -rf /code/@openzeppelin 2>/dev/null; exit 1)"

echo ""
echo "✅ Echidna fuzzing completed!"

