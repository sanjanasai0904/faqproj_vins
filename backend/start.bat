@echo off
echo ========================================
echo   FAQ Chatbot Backend - Starting...
echo ========================================
echo.

REM Check if node_modules exists
if not exist "node_modules\" (
    echo Installing dependencies...
    call npm install
    echo.
)

REM Check if .env exists and has API key
findstr /C:"GEMINI_API_KEY=your_gemini_api_key_here" .env >nul
if %errorlevel% == 0 (
    echo.
    echo ========================================
    echo   WARNING: Gemini API Key Not Set!
    echo ========================================
    echo.
    echo Please update your .env file with a valid Gemini API key.
    echo Get your key from: https://makersuite.google.com/app/apikey
    echo.
    echo Then update this line in backend\.env:
    echo   GEMINI_API_KEY=your_actual_api_key_here
    echo.
    echo Press any key to continue anyway or Ctrl+C to exit...
    pause >nul
)

echo Starting backend server...
echo.
call npm run dev
