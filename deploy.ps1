# deployment script for shreerang-saree
Write-Host "Starting Deployment..." -ForegroundColor Green

# 1. Backend
Write-Host "Deploying Backend..." -ForegroundColor Cyan
Set-Location server
cmd /c "gcloud builds submit --tag gcr.io/shreerang-saree-aed6f/server"
cmd /c "gcloud run deploy server --image gcr.io/shreerang-saree-aed6f/server --platform managed --region us-central1 --allow-unauthenticated"
Set-Location ..

# 2. Frontend
Write-Host "Deploying Frontend..." -ForegroundColor Cyan
cmd /c "npm run build"
cmd /c "firebase deploy --only hosting"

Write-Host "Deployment Script Finished." -ForegroundColor Green
