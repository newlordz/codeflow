@echo off
setlocal enabledelayedexpansion
title CodeFlow Academy - Stop Servers
color 0C
cls

echo ====================================================================
echo                CODEFLOW ACADEMY - STOP SERVICES
echo ====================================================================
echo.
echo Stopping Backend port 3001 and Frontend port 5173...
echo.

set "STOPPED=0"

for /f "tokens=5" %%a in ('netstat -ano ^| findstr LISTENING ^| findstr :3001') do (
    echo Stopping Backend process on port 3001 [PID %%a]...
    taskkill /f /pid %%a >nul 2>&1
    set "STOPPED=1"
)

for /f "tokens=5" %%a in ('netstat -ano ^| findstr LISTENING ^| findstr :5173') do (
    echo Stopping Frontend process on port 5173 [PID %%a]...
    taskkill /f /pid %%a >nul 2>&1
    set "STOPPED=1"
)

echo.
if "!STOPPED!"=="1" (
    color 0A
    echo [OK] All CodeFlow Academy servers have been successfully stopped!
) else (
    echo [INFO] No active servers were found listening on ports 3001 or 5173.
)

echo.
pause
