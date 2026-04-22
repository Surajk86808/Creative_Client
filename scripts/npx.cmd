@echo off
setlocal
set "ROOT=%~dp0.."
set "NODE_HOME=%ROOT%\tools\node\current"
set "NPX_CLI=%NODE_HOME%\node_modules\npm\bin\npx-cli.js"

if not exist "%NODE_HOME%\node.exe" (
  echo [npx] Portable Node not found at "%NODE_HOME%".
  echo [npx] Run: scripts\setup-node.cmd
  exit /b 1
)

if not exist "%NPX_CLI%" (
  echo [npx] npx CLI not found at "%NPX_CLI%".
  echo [npx] Your Node bundle may be incomplete. Re-run: scripts\setup-node.cmd
  exit /b 1
)

"%NODE_HOME%\node.exe" "%NPX_CLI%" %*
