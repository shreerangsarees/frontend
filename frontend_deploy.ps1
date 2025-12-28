# Frontend Deployment Script (Using npx)
Write-Host "Starting Fresh Deployment..." -ForegroundColor Green

# 1. Logout and Login
Write-Host "Logging out of old sessions..." -ForegroundColor Cyan
cmd /c "npx firebase-tools logout"

Write-Host "Please login in the browser window that opens..." -ForegroundColor Yellow
cmd /c "npx firebase-tools login"

# 2. Build and Deploy
Write-Host "Building React App..." -ForegroundColor Cyan
cmd /c "npm run build"

Write-Host "Deploying to Firebase Hosting..." -ForegroundColor Cyan
cmd /c "npx firebase-tools deploy --only hosting"

Write-Host "Done! Your site should be live." -ForegroundColor Green
