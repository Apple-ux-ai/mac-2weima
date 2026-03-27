@echo off
chcp 65001 >nul
echo ================================
echo   启动 API 服务器
echo ================================
echo.

REM 检查是否已安装依赖
if not exist "node_modules" (
    echo [提示] 检测到依赖未安装，正在安装...
    call npm install
    echo.
)

echo [信息] 正在启动服务器...
echo [信息] 服务器将运行在: http://localhost:3000
echo [信息] 按 Ctrl+C 可停止服务器
echo.

node server.js

pause



















