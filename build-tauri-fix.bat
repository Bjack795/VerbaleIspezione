@echo off
echo Adding Rust to PATH and building Tauri...
set PATH=%PATH%;%USERPROFILE%\.cargo\bin
npm run tauri:build
echo.
echo Build completata! Installer in src-tauri\target\release\bundle\nsis\
pause 