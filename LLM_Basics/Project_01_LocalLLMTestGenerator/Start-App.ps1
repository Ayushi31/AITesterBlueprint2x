# Run this script to start the Local LLM Test Generator Application.
# It automatically guarantees Node.js and NPM work regardless of your terminal cache!

$env:Path = [System.Environment]::GetEnvironmentVariable("Path", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path", "User")

Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "Starting Local LLM Test Generator Setup..." -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""

# Ensure we're in the right directory
$baseDir = "C:\Users\HP\AITesterBlueprint2x\Project_01_LocalLLMTestGenerator"
Set-Location -Path $baseDir

Write-Host "-> Installing Backend Dependencies..." -ForegroundColor Yellow
Set-Location -Path "$baseDir\backend"
& "C:\Program Files\nodejs\npm.cmd" install

Write-Host "-> Installing Frontend Dependencies..." -ForegroundColor Yellow
Set-Location -Path "$baseDir\frontend"
& "C:\Program Files\nodejs\npm.cmd" install

Write-Host "-> Starting Backend Server (Port 3001) in new window..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "`$env:Path = [System.Environment]::GetEnvironmentVariable('Path', 'Machine') + ';' + [System.Environment]::GetEnvironmentVariable('Path', 'User'); cd '$baseDir\backend'; & 'C:\Program Files\nodejs\npx.cmd' nodemon src/index.ts"

Write-Host "-> Starting Frontend Server (Port 5173) in new window..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "`$env:Path = [System.Environment]::GetEnvironmentVariable('Path', 'Machine') + ';' + [System.Environment]::GetEnvironmentVariable('Path', 'User'); cd '$baseDir\frontend'; & 'C:\Program Files\nodejs\npm.cmd' run dev"

Write-Host ""
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "SUCCESS! The application should open automatically in your browser shortly." -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
