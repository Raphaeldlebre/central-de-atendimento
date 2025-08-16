@echo off
setlocal

set "LOGFILE=deploy-check-log.txt"

echo ======================================== 
echo 🔎 Teste de Build + Deploy 
echo Salvando log em %LOGFILE%
echo ======================================== 
echo.

:: zera/cria o log
type nul > "%LOGFILE%"

echo 🏗️ Rodando build... >> "%LOGFILE%"
npm run build >> "%LOGFILE%" 2>&1

echo 🌍 Rodando deploy... >> "%LOGFILE%"
npm run deploy >> "%LOGFILE%" 2>&1

echo ======================================== >> "%LOGFILE%"
echo ✅ Teste concluido >> "%LOGFILE%"
echo ======================================== >> "%LOGFILE%"

:: Mostra log na tela
type "%LOGFILE%"

echo.
echo 📄 O log completo ficou salvo em %LOGFILE%
echo.
pause
