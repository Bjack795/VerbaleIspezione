# Script di Debug DevTools - Versione Corretta
# Abilita temporaneamente i devtools e compila l'app

Write-Host "=== DEBUG DEVTOOLS CORRETTA ===" -ForegroundColor Green
Write-Host "Abilita temporaneamente i devtools..." -ForegroundColor Yellow

# Crea una cartella per i log se non esiste
$logDir = "debug-logs"
if (!(Test-Path $logDir)) {
    New-Item -ItemType Directory -Path $logDir
    Write-Host "Creata cartella $logDir" -ForegroundColor Green
}

# Backup della configurazione originale
Copy-Item "src-tauri\Cargo.toml" "src-tauri\Cargo.toml.backup"
Write-Host "Backup di Cargo.toml creato" -ForegroundColor Green

# Imposta le variabili di ambiente per il logging
$env:RUST_LOG = "debug"
$env:RUST_BACKTRACE = "full"
$env:TAURI_DEBUG = "1"

Write-Host "Variabili di ambiente impostate:" -ForegroundColor Cyan
Write-Host "  RUST_LOG: $env:RUST_LOG" -ForegroundColor White
Write-Host "  RUST_BACKTRACE: $env:RUST_BACKTRACE" -ForegroundColor White
Write-Host "  TAURI_DEBUG: $env:TAURI_DEBUG" -ForegroundColor White

$timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"

try {
    Write-Host "`nVerifica e abilita devtools..." -ForegroundColor Yellow
    
    # Leggi il Cargo.toml e verifica devtools
    $cargoContent = Get-Content "src-tauri\Cargo.toml" -Raw
    if ($cargoContent -match 'features = \["devtools"\]') {
        Write-Host "DevTools già abilitati" -ForegroundColor Green
    } else {
        Write-Host "Abilito DevTools..." -ForegroundColor Yellow
        $cargoContent = $cargoContent -replace 'features = \[\]', 'features = ["devtools"]'
        Set-Content "src-tauri\Cargo.toml" $cargoContent
        Write-Host "DevTools abilitati!" -ForegroundColor Green
    }
    
    Write-Host "`nCompilazione frontend..." -ForegroundColor Yellow
    npm run build 2>&1 | Tee-Object -FilePath "$logDir\frontend_fix_$timestamp.log"
    
    if ($LASTEXITCODE -ne 0) {
        throw "Errore compilazione frontend"
    }
    
    Write-Host "`nCompilazione Tauri con devtools..." -ForegroundColor Yellow
    npm run tauri build 2>&1 | Tee-Object -FilePath "$logDir\tauri_fix_$timestamp.log"
    
    if ($LASTEXITCODE -ne 0) {
        throw "Errore compilazione Tauri"
    }
    
    Write-Host "`nBuild completata!" -ForegroundColor Green
    
    # Cerca eseguibile
    $exePath = $null
    $paths = @("src-tauri\target\release", "src-tauri\target\debug")
    
    foreach ($path in $paths) {
        if (Test-Path $path) {
            $exes = Get-ChildItem -Path $path -Filter "*.exe" | Where-Object { 
                $_.Length -gt 1MB -and $_.Name -notlike "*deps*" 
            } | Sort-Object LastWriteTime -Descending
            
            if ($exes) {
                $exePath = $exes[0]
                break
            }
        }
    }
    
    if ($exePath) {
        Write-Host "`nEseguibile trovato: $($exePath.FullName)" -ForegroundColor Green
        Write-Host "Dimensione: $([math]::Round($exePath.Length / 1MB, 2)) MB" -ForegroundColor Cyan
        
        Write-Host "`n" + "="*60 -ForegroundColor Magenta
        Write-Host "DEVTOOLS ABILITATI!" -ForegroundColor Yellow
        Write-Host "="*60 -ForegroundColor Magenta
        
        Write-Host "`nQuando l'app si apre:" -ForegroundColor White
        Write-Host "1. Nota se si apre con 404" -ForegroundColor Yellow
        Write-Host "2. Premi F12 per DevTools" -ForegroundColor Cyan
        Write-Host "3. Console = errori JS" -ForegroundColor Cyan
        Write-Host "4. Network = richieste fallite" -ForegroundColor Cyan
        Write-Host "5. Se 404, premi F5 e osserva" -ForegroundColor Cyan
        
        Write-Host "`nCosa cercare:" -ForegroundColor Yellow
        Write-Host "- Errori rossi in Console" -ForegroundColor Red
        Write-Host "- 404/500 in Network" -ForegroundColor Red
        Write-Host "- Service Worker issues" -ForegroundColor Red
        
        Write-Host "`n" + "="*60 -ForegroundColor Magenta
        Write-Host "`nPronto? Premi INVIO..." -ForegroundColor Green
        Read-Host
        
        Write-Host "`nAvvio applicazione..." -ForegroundColor Yellow
        
        $process = Start-Process -FilePath $exePath.FullName -RedirectStandardOutput "$logDir\app_fix_out_$timestamp.log" -RedirectStandardError "$logDir\app_fix_err_$timestamp.log" -PassThru
        
        Write-Host "App avviata (PID: $($process.Id))" -ForegroundColor Green
        Write-Host "`nPREMI F12 PER DEVTOOLS!" -ForegroundColor Yellow
        Write-Host "Chiudi l'app quando hai finito" -ForegroundColor Gray
        
        $process.WaitForExit()
        
        Write-Host "`nApp chiusa. Controllo log..." -ForegroundColor Green
        
        if (Test-Path "$logDir\app_fix_err_$timestamp.log") {
            $errors = Get-Content "$logDir\app_fix_err_$timestamp.log" -Raw
            if ($errors -and $errors.Trim()) {
                Write-Host "`nErrori trovati:" -ForegroundColor Red
                Write-Host $errors -ForegroundColor Yellow
            } else {
                Write-Host "`nNessun errore nel log" -ForegroundColor Green
            }
        }
        
        Write-Host "`nLog salvati:" -ForegroundColor Yellow
        Write-Host "  Frontend: $logDir\frontend_fix_$timestamp.log" -ForegroundColor White
        Write-Host "  Tauri:    $logDir\tauri_fix_$timestamp.log" -ForegroundColor White
        Write-Host "  App Out:  $logDir\app_fix_out_$timestamp.log" -ForegroundColor White
        Write-Host "  App Err:  $logDir\app_fix_err_$timestamp.log" -ForegroundColor White
        
    } else {
        Write-Host "`nEseguibile non trovato!" -ForegroundColor Red
    }
    
} catch {
    Write-Host "`nErrore: $($_.Exception.Message)" -ForegroundColor Red
} finally {
    # Ripristina sempre il backup
    if (Test-Path "src-tauri\Cargo.toml.backup") {
        Copy-Item "src-tauri\Cargo.toml.backup" "src-tauri\Cargo.toml" -Force
        Remove-Item "src-tauri\Cargo.toml.backup"
        Write-Host "`nConfigurazione ripristinata" -ForegroundColor Green
    }
}

Write-Host "`n=== DEBUG COMPLETATO ===" -ForegroundColor Green 