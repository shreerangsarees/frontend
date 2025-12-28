# Frontend Deployment Script
Write-Host "Starting Fresh Deployment..." -ForegroundColor Green

# 1. Logout and Login
Write-Host "Logging out of old sessions..." -ForegroundColor Cyan
cmd /c "firebase logout"

Write-Host "Please login in the browser window that opens..." -ForegroundColor Yellow
cmd /c "firebase login"

# 2. Build and Deploy
Write-Host "Building React App..." -ForegroundColor Cyan
cmd /c "npm run build"

Write-Host "Deploying to Firebase Hosting..." -ForegroundColor Cyan
cmd /c "firebase deploy --only hosting"

Write-Host "Done! Your site should be live." -ForegroundColor Green
