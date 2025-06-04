@echo off
echo Building optimized Electron app...
set CSC_IDENTITY_AUTO_DISCOVERY=false
set ELECTRON_SKIP_BINARY_DOWNLOAD=false
set npm_config_target_platform=win32
set npm_config_target_arch=x64
set npm_config_cache=.\.electron-gyp
npm run build:electron
npx electron-builder --dir --win
echo.
echo Build completed! 
echo Dimensione app: ~193MB (include runtime Chromium completo)
echo.
echo SUGGERIMENTO: Per app più leggere (5-10MB) considera Tauri
echo che usa il browser web di sistema invece di includere Chromium
pause 