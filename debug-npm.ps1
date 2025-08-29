# Script di Debug usando solo NPM
# Versione più semplice che usa solo npm per tutto

Write-Host "=== DEBUG NPM TAURI ===" -ForegroundColor Green
Write-Host "Usa solo comandi npm per evitare problemi di PATH..." -ForegroundColor Yellow

# Crea una cartella per i log se non esiste
$logDir = "debug-logs"
if (!(Test-Path $logDir)) {
    New-Item -ItemType Directory -Path $logDir
    Write-Host "Creata cartella $logDir" -ForegroundColor Green
}

# Imposta le variabili di ambiente per il logging
$env:RUST_LOG = "debug"
$env:RUST_BACKTRACE = "full"
$env:TAURI_DEBUG = "1"

Write-Host "Variabili di ambiente impostate:" -ForegroundColor Cyan
Write-Host "  RUST_LOG: $env:RUST_LOG" -ForegroundColor White
Write-Host "  RUST_BACKTRACE: $env:RUST_BACKTRACE" -ForegroundColor White
Write-Host "  TAURI_DEBUG: $env:TAURI_DEBUG" -ForegroundColor White

$timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"

Write-Host "`nCOMPILAZIONE BUILD COMPLETA..." -ForegroundColor Yellow
Write-Host "Questo può richiedere alcuni minuti..." -ForegroundColor Gray

# Usa npm run tauri:build che dovrebbe funzionare
Write-Host "Compilazione con npm run tauri:build..." -ForegroundColor Gray
npm run tauri:build 2>&1 | Tee-Object -FilePath "$logDir\full_build_$timestamp.log"

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERRORE nella compilazione!" -ForegroundColor Red
    Write-Host "Controlla il file $logDir\full_build_$timestamp.log per i dettagli" -ForegroundColor Yellow
    
    # Prova una build di debug separata
    Write-Host "`nTentativo con build di debug separata..." -ForegroundColor Yellow
    Write-Host "Compilo prima il frontend..." -ForegroundColor Gray
    npm run build 2>&1 | Tee-Object -FilePath "$logDir\frontend_only_$timestamp.log"
    
    Write-Host "Ora compilo solo Tauri..." -ForegroundColor Gray
    npm run tauri build 2>&1 | Tee-Object -FilePath "$logDir\tauri_only_$timestamp.log"
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Anche la build separata è fallita!" -ForegroundColor Red
        exit 1
    }
}

Write-Host "`nBuild completata! Controllo dove si trova l'eseguibile..." -ForegroundColor Green

# Cerca l'eseguibile in tutte le possibili cartelle
$possiblePaths = @(
    "src-tauri\target\debug",
    "src-tauri\target\release", 
    "target\debug",
    "target\release"
)

$foundExe = $null
foreach ($path in $possiblePaths) {
    if (Test-Path $path) {
        Write-Host "Controllo $path..." -ForegroundColor Gray
        $exeFiles = Get-ChildItem -Path $path -Filter "*.exe" -ErrorAction SilentlyContinue | Where-Object { 
            $_.Name -notlike "*deps*" -and 
            $_.Name -notlike "*build*" -and 
            $_.Length -gt 1MB 
        } | Sort-Object LastWriteTime -Descending
        
        foreach ($exe in $exeFiles) {
            Write-Host "  Trovato: $($exe.Name) ($([math]::Round($exe.Length / 1MB, 2)) MB)" -ForegroundColor Cyan
            if (-not $foundExe) {
                $foundExe = $exe
            }
        }
    }
}

if ($foundExe) {
    Write-Host "`nUSO L'ESEGUIBILE: $($foundExe.FullName)" -ForegroundColor Green
    Write-Host "Dimensione: $([math]::Round($foundExe.Length / 1MB, 2)) MB" -ForegroundColor Cyan
    
    Write-Host "`nVERIFICA CARTELLA DIST..." -ForegroundColor Yellow
    if (Test-Path "dist\index.html") {
        Write-Host "✓ dist\index.html trovato" -ForegroundColor Green
        $indexContent = Get-Content "dist\index.html" -Raw
        Write-Host "  Dimensione index.html: $($indexContent.Length) caratteri" -ForegroundColor Gray
        
        # Controlla se ci sono riferimenti a path relativi
        if ($indexContent -match 'href="\.\/') {
            Write-Host "  ✓ Trovati path relativi (./) in index.html" -ForegroundColor Green
        } elseif ($indexContent -match 'href="\/') {
            Write-Host "  ⚠ Trovati path assoluti (/) in index.html - POSSIBILE PROBLEMA!" -ForegroundColor Yellow
        }
    } else {
        Write-Host "✗ dist\index.html NON trovato!" -ForegroundColor Red
    }
    
    if (Test-Path "dist\assets") {
        $assetFiles = Get-ChildItem "dist\assets" -File
        $assetCount = $assetFiles.Count
        $totalSize = ($assetFiles | Measure-Object -Property Length -Sum).Sum
                 Write-Host "✓ dist\assets trovata con $assetCount file ($([math]::Round($totalSize / 1MB, 2)) MB totali)" -ForegroundColor Green
        
        # Mostra i file principali
        $assetFiles | ForEach-Object {
            Write-Host "  - $($_.Name): $([math]::Round($_.Length / 1KB, 2)) KB" -ForegroundColor Gray
        }
    } else {
        Write-Host "✗ dist\assets NON trovata!" -ForegroundColor Red
    }
    
    Write-Host "`nAVVIO DELL'APPLICAZIONE CON LOGGING..." -ForegroundColor Yellow
    Write-Host "OSSERVA ATTENTAMENTE:" -ForegroundColor Red
    Write-Host "1. L'applicazione si apre con errore 404?" -ForegroundColor White
    Write-Host "2. Se clicchi F5 o ricarica, si carica correttamente?" -ForegroundColor White
    Write-Host "3. Controlla la barra degli indirizzi - cosa mostra?" -ForegroundColor White
    
    Write-Host "`nI log verranno salvati in:" -ForegroundColor Cyan
    Write-Host "  stdout: $logDir\app_stdout_$timestamp.log" -ForegroundColor White
    Write-Host "  stderr: $logDir\app_stderr_$timestamp.log" -ForegroundColor White
    Write-Host "`n--- AVVIO APPLICAZIONE ---" -ForegroundColor Magenta
    
    # Avvia l'applicazione con cattura dei log
    $process = Start-Process -FilePath $foundExe.FullName -RedirectStandardOutput "$logDir\app_stdout_$timestamp.log" -RedirectStandardError "$logDir\app_stderr_$timestamp.log" -PassThru
    
    Write-Host "Applicazione avviata (PID: $($process.Id))" -ForegroundColor Green
    Write-Host "`nMENTRE L'APP È APERTA:" -ForegroundColor Yellow
    Write-Host "1. Nota se si apre con 404" -ForegroundColor White
    Write-Host "2. Prova a premere F5 per ricaricare" -ForegroundColor White
    Write-Host "3. Chiudi l'app quando hai finito di testare" -ForegroundColor White
    Write-Host "4. Torna qui per vedere i log" -ForegroundColor White
    
    # Aspetta che il processo finisca
    Write-Host "`nAttendendo che l'applicazione venga chiusa..." -ForegroundColor Gray
    $process.WaitForExit()
    
    Write-Host "`nApplicazione chiusa. Controllo log..." -ForegroundColor Green
    
    # Controlla se ci sono errori nei log
    if (Test-Path "$logDir\app_stderr_$timestamp.log") {
        $stderrContent = Get-Content "$logDir\app_stderr_$timestamp.log" -Raw
        if ($stderrContent -and $stderrContent.Trim() -ne "") {
            Write-Host "`nERRORI TROVATI NEL LOG:" -ForegroundColor Red
            Write-Host $stderrContent -ForegroundColor Yellow
        } else {
            Write-Host "`nNessun errore nel stderr" -ForegroundColor Green
        }
    }
    
    Write-Host "`nLog completi disponibili in:" -ForegroundColor Yellow
    Write-Host "  Build completa: $logDir\full_build_$timestamp.log" -ForegroundColor White
    Write-Host "  App stdout:     $logDir\app_stdout_$timestamp.log" -ForegroundColor White
    Write-Host "  App stderr:     $logDir\app_stderr_$timestamp.log" -ForegroundColor White
    
} else {
    Write-Host "`nNON TROVATO NESSUN ESEGUIBILE!" -ForegroundColor Red
    Write-Host "La compilazione potrebbe essere fallita. Controlla i log di build." -ForegroundColor Yellow
    
    # Mostra cosa è stato compilato
    foreach ($path in $possiblePaths) {
        if (Test-Path $path) {
            Write-Host "`nContenuto di ${path}:" -ForegroundColor Gray
            Get-ChildItem -Path $path -ErrorAction SilentlyContinue | ForEach-Object {
                Write-Host "  $($_.Name)" -ForegroundColor Gray
            }
        }
    }
}

Write-Host "`n=== DEBUG COMPLETATO ===" -ForegroundColor Green 