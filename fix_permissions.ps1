# Fix Backend Permissions
# This script makes the Cloud Run service public so the frontend can access it.

Write-Host "Making 'server' service public..." -ForegroundColor Cyan
cmd /c "gcloud run services add-iam-policy-binding server --region asia-south1 --member=allUsers --role=roles/run.invoker --platform managed"

Write-Host "Making 'backend' service public (just in case)..." -ForegroundColor Cyan
cmd /c "gcloud run services add-iam-policy-binding backend --region asia-south1 --member=allUsers --role=roles/run.invoker --platform managed"

Write-Host "Permissions updated. Try refreshing your website." -ForegroundColor Green
