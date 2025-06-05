# PowerShell script to restart the server
Write-Host "Stopping any running node processes..."
taskkill /f /im node.exe

Write-Host "Starting server again..."
cd ..
node server.js 