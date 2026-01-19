# deployment script for shreerang-saree
Write-Host "Starting Deployment..." -ForegroundColor Green

# 1. Configuration
$InputProjectId = Read-Host "Enter Project ID (default: shreerang-saree-aed6f)"
$ProjectId = if ([string]::IsNullOrWhiteSpace($InputProjectId)) { "shreerang-saree-aed6f" } else { $InputProjectId }
$Region = "asia-south1"

Write-Host "Using Project ID: $ProjectId" -ForegroundColor Cyan
Write-Host "Using Region: $Region" -ForegroundColor Cyan

# 2. Backend
Write-Host "Deploying Backend..." -ForegroundColor Cyan
Set-Location server
cmd /c "gcloud builds submit --tag gcr.io/$ProjectId/server"
# Added --session-affinity=true for efficient Socket.io handling
cmd /c "gcloud run deploy server --image gcr.io/$ProjectId/server --platform managed --region $Region --allow-unauthenticated --session-affinity=true"
Set-Location ..

# 3. Frontend
Write-Host "Deploying Frontend..." -ForegroundColor Cyan
# Switch Firebase context to the selected project
cmd /c "firebase use $ProjectId"
cmd /c "npm run build"
cmd /c "firebase deploy --only hosting"

Write-Host "Deployment Script Finished." -ForegroundColor Green
