@echo off
cd /d "%~dp0"
echo Iniciando servidor local en el puerto 5500...
start cmd /k "python -m http.server 5500"
timeout /t 2 >nul
echo Abriendo VSCode...
code .
timeout /t 2 >nul
start "" "http://localhost:5500/index.html"
pause
