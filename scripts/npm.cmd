@echo off
setlocal
set "ROOT=%~dp0.."
set "NODE_HOME=%ROOT%\tools\node\current"
set "NPM_CLI=%NODE_HOME%\node_modules\npm\bin\npm-cli.js"

if not exist "%NODE_HOME%\node.exe" (
  echo [npm] Portable Node not found at "%NODE_HOME%".
  echo [npm] Run: scripts\setup-node.cmd
  exit /b 1
)

if not exist "%NPM_CLI%" (
  echo [npm] npm CLI not found at "%NPM_CLI%".
  echo [npm] Your Node bundle may be incomplete. Re-run: scripts\setup-node.cmd
  exit /b 1
)

"%NODE_HOME%\node.exe" "%NPM_CLI%" %*
