#!/bin/bash

rm -rf dist

echo "Building CommonJS version..."
npx tsc --project tsconfig.json --outDir dist/cjs --module CommonJS

echo "Building ESM version..."
npx tsc --project tsconfig.json --outDir dist/esm --module ES2020

echo "Building type declarations..."
npx tsc --emitDeclarationOnly --declaration --outDir dist/types

echo "Build completed successfully!" 