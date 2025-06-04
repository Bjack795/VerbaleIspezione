@echo off
echo Building Tauri app (super leggera!)...
echo Questo creerà un'app di circa 5-10MB invece di 193MB
npm run tauri:build
echo.
echo Build Tauri completata!
echo Controlla la cartella src-tauri\target\release per l'installer
pause 