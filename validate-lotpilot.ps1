$ErrorActionPreference = "Stop"
$LogFile = "lotpilot-validation.log"
Set-Content -Path $LogFile -Value ""

function Run-Step {
    param(
        [string]$Name,
        [string]$Command
    )
    Add-Content -Path $LogFile -Value ""
    Add-Content -Path $LogFile -Value "==== $Name ===="
    Write-Host "==== $Name ===="
    Invoke-Expression "$Command *>&1" | Tee-Object -FilePath $LogFile -Append
}

Write-Host "Starting LotPilot validation"
Add-Content -Path $LogFile -Value "Starting LotPilot validation"

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "Node.js is not installed or not on PATH"
    Add-Content -Path $LogFile -Value "Node.js is not installed or not on PATH"
    exit 1
}

if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
    Write-Host "npm is not installed or not on PATH"
    Add-Content -Path $LogFile -Value "npm is not installed or not on PATH"
    exit 1
}

Run-Step "Node version" "node -v"
Run-Step "npm version" "npm -v"

if ((-not (Test-Path .env)) -and (Test-Path .env.example)) {
    Copy-Item .env.example .env
    Write-Host "Copied .env.example to .env. Please edit .env with real values, then rerun this script."
    Add-Content -Path $LogFile -Value "Copied .env.example to .env. Please edit .env with real values, then rerun this script."
    exit 1
}

Run-Step "Install dependencies" "npm ci"
Run-Step "Generate Prisma client" "npm run prisma:generate"

$npmScripts = npm run 2>&1 | Out-String
if ($npmScripts -match "prisma:migrate:deploy") {
    Run-Step "Run Prisma migrations" "npm run prisma:migrate:deploy"
} else {
    Run-Step "Run Prisma migrations" "npx prisma migrate deploy"
}

Run-Step "Typecheck" "npm run typecheck"
Run-Step "Tests" "npm test"
Run-Step "Build" "npm run build"

Write-Host "Validation completed successfully. Log saved to $LogFile"
Add-Content -Path $LogFile -Value ""
Add-Content -Path $LogFile -Value "Validation completed successfully. Log saved to $LogFile"
