@echo off
setlocal enabledelayedexpansion
title CodeFlow Academy - Startup Launcher
color 0B
cls

echo ====================================================================
echo                   CODEFLOW ACADEMY LAUNCHER
echo ====================================================================
echo.

REM Set and clean project root directory path
set "ROOT_DIR=%~dp0"
if "%ROOT_DIR:~-1%"=="\" set "ROOT_DIR=%ROOT_DIR:~0,-1%"
cd /d "%ROOT_DIR%"

REM 1. Check if Node.js is installed
where node >nul 2>&1
if %errorlevel% neq 0 (
    color 0C
    echo [ERROR] Node.js is NOT installed or not in your system PATH!
    echo.
    echo Please follow these simple steps:
    echo  1. Go to https://nodejs.org/
    echo  2. Download and install the recommended LTS version
    echo  3. Restart your computer, then double-click start.bat again.
    echo.
    pause
    exit /b 1
)

REM 2. Check if npm is installed
where npm >nul 2>&1
if %errorlevel% neq 0 (
    color 0C
    echo [ERROR] npm was not found. Please ensure Node.js is installed correctly.
    echo.
    pause
    exit /b 1
)

echo [OK] Node.js and npm detected.

REM 3. Check for .env file in server
if not exist "server\.env" (
    echo [INFO] Generating default server\.env configuration...
    (
        echo DATABASE_URL=postgresql://postgres:botsio212nyc@localhost:5432/codeflow
        echo JWT_SECRET=codeflow_jwt_secret_2024
        echo PORT=3001
        echo GEMINI_API_KEY=your_gemini_api_key_here
        echo GEMINI_MODEL=gemini-flash-latest
    ) > "server\.env"
    echo [OK] server\.env created.
)

REM 4. Check dependencies in root, server, and client
set "NEEDS_INSTALL=0"
if not exist "node_modules\" set "NEEDS_INSTALL=1"
if not exist "server\node_modules\" set "NEEDS_INSTALL=1"
if not exist "client\node_modules\" set "NEEDS_INSTALL=1"

if "!NEEDS_INSTALL!"=="1" (
    echo.
    echo ====================================================================
    echo [SETUP] First-time setup detected: Installing required packages...
    echo This may take 1 to 3 minutes depending on your internet connection.
    echo Please keep this window open.
    echo ====================================================================
    echo.
    
    if not exist "node_modules\" (
        echo [1/3] Installing root dependencies...
        call npm install
        if %errorlevel% neq 0 goto :install_error
    )
    
    if not exist "server\node_modules\" (
        echo.
        echo [2/3] Installing server dependencies...
        cd server
        call npm install
        cd "%ROOT_DIR%"
        if %errorlevel% neq 0 goto :install_error
    )
    
    if not exist "client\node_modules\" (
        echo.
        echo [3/3] Installing client dependencies...
        cd client
        call npm install
        cd "%ROOT_DIR%"
        if %errorlevel% neq 0 goto :install_error
    )
    
    echo.
    echo [OK] All dependencies successfully installed!
    echo.
)

REM 5. Free ports 3001 and 5173 if already in use to prevent conflict
for /f "tokens=5" %%a in ('netstat -ano ^| findstr LISTENING ^| findstr :3001') do (
    echo [NOTICE] Port 3001 was in use by PID %%a. Freeing port...
    taskkill /f /pid %%a >nul 2>&1
)
for /f "tokens=5" %%a in ('netstat -ano ^| findstr LISTENING ^| findstr :5173') do (
    echo [NOTICE] Port 5173 was in use by PID %%a. Freeing port...
    taskkill /f /pid %%a >nul 2>&1
)

REM 6. Launch Backend and Frontend in separate windows
echo.
echo ====================================================================
echo [STARTING] Launching CodeFlow Services...
echo ====================================================================
echo.

echo [1/2] Starting Backend Server on port 3001...
start "CodeFlow - Backend Server" cmd /k "title CodeFlow - Backend Server && cd /d "%ROOT_DIR%" && npm run dev:server"

echo [2/2] Starting Frontend Client on port 5173...
start "CodeFlow - Frontend Client" cmd /k "title CodeFlow - Frontend Client && cd /d "%ROOT_DIR%" && npm run dev:client"

REM 7. Wait briefly and open default web browser
echo.
echo Waiting for services to initialize...
ping 127.0.0.1 -n 6 >nul

echo Opening CodeFlow Academy in your browser (http://localhost:5173)...
start "" "http://localhost:5173"

REM 8. Display Status Dashboard
cls
color 0A
echo ====================================================================
echo                   CODEFLOW ACADEMY IS RUNNING!
echo ====================================================================
echo.
echo  * Frontend: http://localhost:5173
echo  * Backend:  http://localhost:3001
echo.
echo  ------------------------------------------------------------------
echo  Pre-configured Accounts:
echo   - Student: demo@codeflow.com  ^|  Password: password123
echo   - Admin:   admin@codeflow.com ^|  Password: password123
echo  ------------------------------------------------------------------
echo  Database Note:
echo   Backend connects to PostgreSQL at localhost:5432/codeflow.
echo   If the backend window closes or reports an error, ensure
echo   your local PostgreSQL service is running.
echo  ------------------------------------------------------------------
echo.
echo  Controls:
echo   [1] Open Frontend in Browser again (http://localhost:5173)
echo   [2] Open Backend Health check (http://localhost:3001/api/health)
echo   [3] Stop all servers and exit
echo.

:menu_loop
choice /c 123 /n /m "Select option [1, 2, or 3]: "
if errorlevel 3 goto :shutdown
if errorlevel 2 goto :open_health
if errorlevel 1 goto :open_frontend
goto :menu_loop

:open_frontend
start "" "http://localhost:5173"
echo Opened Frontend in your browser.
goto :menu_loop

:open_health
start "" "http://localhost:3001/api/health"
echo Opened Backend Health check in your browser.
goto :menu_loop

:shutdown
echo.
echo Stopping all CodeFlow services...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr LISTENING ^| findstr :3001') do (
    taskkill /f /pid %%a >nul 2>&1
)
for /f "tokens=5" %%a in ('netstat -ano ^| findstr LISTENING ^| findstr :5173') do (
    taskkill /f /pid %%a >nul 2>&1
)
echo All servers have been stopped. Goodbye!
ping 127.0.0.1 -n 3 >nul
exit /b 0

:install_error
color 0C
echo.
echo [ERROR] An error occurred while installing dependencies.
echo Please check your internet connection and try running again.
echo.
pause
exit /b 1
