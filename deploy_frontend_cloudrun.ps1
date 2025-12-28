# Frontend Cloud Run Deployment Script
Write-Host "Deploying Frontend to Cloud Run..." -ForegroundColor Cyan

# 1. Submit Build
Write-Host "Building Container..." -ForegroundColor Yellow
cmd /c "gcloud builds submit --tag gcr.io/shreerang-saree-aed6f/frontend"

# 2. Deploy Service
Write-Host "Deploying Service..." -ForegroundColor Yellow
cmd /c "gcloud run deploy frontend --image gcr.io/shreerang-saree-aed6f/frontend --platform managed --region us-central1 --allow-unauthenticated --port 8080"

Write-Host "Done! Frontend is deploying to Cloud Run." -ForegroundColor Green
