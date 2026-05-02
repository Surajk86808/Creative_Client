@echo off
setlocal
set "ROOT=%~dp0.."
cd /d "%ROOT%"

REM Use ExecutionPolicy Bypass so this works even when npm.ps1 is blocked.
powershell -NoProfile -ExecutionPolicy Bypass -File "%ROOT%\scripts\setup-node.ps1" %*
