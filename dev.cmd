@echo off
set "PATH=%~dp0.bin\node-v22.14.0-win-x64;%~dp0.bin\pnpm_global;%PATH%"
echo [NERV///NET] Starting Evangelion SIEM Dashboard in development mode on http://localhost:3000 ...
pnpm dev
