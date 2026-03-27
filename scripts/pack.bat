@echo off
setlocal

echo [Pack] Starting build process...

echo [Pack] Cleaning up old builds...
if exist release-builds-v101 rmdir /s /q release-builds-v101

echo [Pack] Running electron:build...
call npm run electron:build

if %errorlevel% neq 0 (
    echo [Pack] Build failed!
    exit /b 1
)

echo [Pack] Build successful! Output in release-builds-v101
pause
endlocal
