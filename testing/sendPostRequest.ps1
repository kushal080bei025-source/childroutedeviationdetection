# PowerShell Script to send POST requests to /livedata
# Usage: .\sendPostRequest.ps1

param(
    [double]$latitude = 40.7128,
    [double]$longitude = -74.006,
    [string]$transmitid = "device-001",
    [string]$deviceId = "device-123",
    [double]$temperature = 25.5,
    [double]$humidity = 65.0,
    [string]$serverUrl = "http://localhost:3000",
    [int]$count = 1,
    [int]$interval = 5
)

$endpoint = "$serverUrl/livedata"

Write-Host "========================================" -ForegroundColor Green
Write-Host "POST Request Sender for /livedata" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Server: $serverUrl" -ForegroundColor Cyan
Write-Host "Endpoint: $endpoint" -ForegroundColor Cyan
Write-Host "Sending: $count request(s)" -ForegroundColor Cyan
Write-Host ""

for ($i = 1; $i -le $count; $i++) {
    $body = @{
        latitude = $latitude
        longitude = $longitude
        transmitid = "$transmitid-$i"
        deviceId = $deviceId
        temperature = $temperature
        humidity = $humidity
        timestamp = [datetime]::UtcNow.ToString("o")
    } | ConvertTo-Json

    Write-Host "[$([datetime]::Now.ToString('HH:mm:ss'))] 📨 Sending request #$i..." -ForegroundColor Yellow

    try {
        $response = Invoke-RestMethod -Uri $endpoint `
            -Method Post `
            -ContentType "application/json" `
            -Body $body `
            -TimeoutSec 10

        if ($response.success) {
            Write-Host "  ✅ Success - Response: $($response.message)" -ForegroundColor Green
        } else {
            Write-Host "  ⚠️  Warning - Error: $($response.error)" -ForegroundColor Red
        }
    }
    catch {
        Write-Host "  ❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    }

    if ($i -lt $count) {
        Write-Host "  ⏳ Waiting $interval seconds before next request..." -ForegroundColor Gray
        Start-Sleep -Seconds $interval
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "✨ Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
