@echo off
echo [Build] Cleaning up processes...
taskkill /F /IM electron.exe /T 2>nul
taskkill /F /IM "二维码生成器.exe" /T 2>nul
taskkill /F /IM "updater.exe" /T 2>nul

echo [Build] Removing old artifacts...
if exist release-builds rmdir /s /q release-builds
:: Wait a bit for file system to catch up
timeout /t 2 /nobreak >nul

echo [Build] Starting build...
call npm run electron:build
