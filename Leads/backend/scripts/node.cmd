@echo off
setlocal
set "ROOT=%~dp0.."
set "NODE_HOME=%ROOT%\tools\node\current"

if not exist "%NODE_HOME%\node.exe" (
  echo [node] Portable Node not found at "%NODE_HOME%".
  echo [node] Run: scripts\setup-node.cmd
  exit /b 1
)

"%NODE_HOME%\node.exe" %*
