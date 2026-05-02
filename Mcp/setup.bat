@echo off
echo ================================
echo NexviaTech MCP Server Setup
echo ================================

:: Install dependencies
echo Installing Python dependencies...
pip install -r requirements.txt

:: Check if mcp installed
python -c "import mcp" 2>nul
if errorlevel 1 (
    echo ERROR: mcp package failed to install
    pause
    exit /b 1
)

echo.
echo ================================
echo Setup complete!
echo ================================
echo.
echo Next steps:
echo 1. Set your repo root in .env (NEXVIA_ROOT=P:\Creative-client-)
echo 2. Add the MCP server to Gemini CLI settings (see README.md)
echo 3. Start Gemini CLI and confirm the server connects
echo.
pause
