@echo off
echo Adding Rust to PATH and starting Tauri...
set PATH=%PATH%;%USERPROFILE%\.cargo\bin
npm run tauri:dev 