#!/bin/bash

echo "[Pack] Start building..."

# Check dependencies
if [ ! -d "node_modules" ]; then
    echo "[Pack] Installing dependencies..."
    npm install
fi

# Run build
echo "[Pack] Building..."
npm run electron:build

if [ $? -ne 0 ]; then
    echo "[Pack] Build failed!"
    exit 1
fi

echo "[Pack] Build success! Output directory: release-builds"
