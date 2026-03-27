# API 服务器启动脚本
Write-Host "================================" -ForegroundColor Cyan
Write-Host "  启动 API 服务器" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# 检查是否已安装依赖
if (-not (Test-Path "node_modules")) {
    Write-Host "[提示] 检测到依赖未安装，正在安装..." -ForegroundColor Yellow
    npm install
    Write-Host ""
}

Write-Host "[信息] 正在启动服务器..." -ForegroundColor Green
Write-Host "[信息] 服务器将运行在: http://localhost:3000" -ForegroundColor Green
Write-Host "[信息] 按 Ctrl+C 可停止服务器" -ForegroundColor Yellow
Write-Host ""

node server.js



















