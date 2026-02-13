# Script para iniciar Backend e Frontend simultaneamente

Write-Host "Iniciando Backend..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd D:\Code\teste\backend; pnpm start:dev"

Write-Host "Aguardando 3 segundos..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

Write-Host "Iniciando Frontend..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd D:\Code\teste\frontend; pnpm dev"

Write-Host "Servidores iniciados!" -ForegroundColor Cyan
Write-Host "Backend: http://localhost:3000" -ForegroundColor White
Write-Host "Frontend: http://localhost:5173" -ForegroundColor White
Write-Host "Swagger: http://localhost:3000/api/docs" -ForegroundColor White
