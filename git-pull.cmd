@echo off
cd /d "%~dp0"

REM Ne pas utiliser de proxy pour ce pull
set HTTP_PROXY=
set HTTPS_PROXY=
set http_proxy=
set https_proxy=

echo Pull depuis le depot...
git pull

if %errorlevel% neq 0 (
  echo.
  echo Erreur. Verifie ta connexion et que le proxy Git est desactive :
  echo   git config --global --unset http.proxy
  echo   git config --global --unset https.proxy
  pause
  exit /b 1
)
echo.
echo Termine.
pause
