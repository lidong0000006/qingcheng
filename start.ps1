# ============================================================
# 倾城之恋 - 一键启动脚本
# 同时启动前端 (Vite:3000) 和后端 (Express:3001)
# ============================================================

$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $projectRoot

Write-Host ""
Write-Host "  ✨ 倾城之恋 · 启动中..." -ForegroundColor Magenta
Write-Host "  ─────────────────────────────────" -ForegroundColor DarkGray
Write-Host "  前端地址: http://localhost:3000" -ForegroundColor Cyan
Write-Host "  后端地址: http://localhost:3001" -ForegroundColor Cyan
Write-Host "  ─────────────────────────────────" -ForegroundColor DarkGray
Write-Host ""

# 启动 后端 (Express)
Write-Host "  [1/2] 启动后端服务..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "Set-Location '$projectRoot'; `$host.UI.RawUI.WindowTitle = '倾城之恋 - 后端 :3001'; npm run start:backend"
) -WindowStyle Normal

# 稍等后端先初始化
Start-Sleep -Milliseconds 1500

# 启动 前端 (Vite)
Write-Host "  [2/2] 启动前端服务..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "Set-Location '$projectRoot'; `$host.UI.RawUI.WindowTitle = '倾城之恋 - 前端 :3000'; npm run dev"
) -WindowStyle Normal

Start-Sleep -Milliseconds 2000

Write-Host ""
Write-Host "  ✅ 两个服务已在独立窗口中启动！" -ForegroundColor Green
Write-Host "  👉 请在浏览器访问: http://localhost:3000" -ForegroundColor Cyan
Write-Host ""

# 自动打开浏览器
Start-Process "http://localhost:3000"
