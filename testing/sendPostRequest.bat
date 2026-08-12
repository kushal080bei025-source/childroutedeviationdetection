@echo off
REM Batch script to send POST requests to /livedata
REM Usage: sendPostRequest.bat

echo ========================================
echo POST Request Sender for /livedata
echo ========================================
echo.

setlocal enabledelayedexpansion

REM Default values
set "latitude=40.7128"
set "longitude=-74.006"
set "transmitid=device-001"
set "deviceId=device-123"
set "temperature=25.5"
set "humidity=65.0"
set "serverUrl=http://localhost:3000"
set "count=1"
set "interval=5"

REM Parse command line arguments
if not "%1"=="" set "latitude=%1"
if not "%2"=="" set "longitude=%2"
if not "%3"=="" set "count=%3"

set "endpoint=%serverUrl%/livedata"

echo Server: %serverUrl%
echo Endpoint: %endpoint%
echo Latitude: %latitude%
echo Longitude: %longitude%
echo Transmit ID: %transmitid%
echo Device ID: %deviceId%
echo Sending: %count% request(s)
echo.

for /L %%i in (1,1,%count%) do (
    echo [!date! !time!] Sending request #%%i...
    
    REM Create JSON payload
    set "json={"latitude": %latitude%, "longitude": %longitude%, "transmitid": "%transmitid%-%%i", "deviceId": "%deviceId%", "temperature": %temperature%, "humidity": %humidity%}"
    
    REM Send POST request with curl
    curl -X POST %endpoint% ^
      -H "Content-Type: application/json" ^
      -d "!json!"
    
    if %%i LSS %count% (
        echo Waiting %interval% seconds...
        timeout /t %interval% /nobreak
    )
    echo.
)

echo ========================================
echo Complete!
echo ========================================
pause
