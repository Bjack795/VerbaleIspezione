# Verbale di Ispezione - Redesco Progetti

Applicazione per la creazione di verbali di ispezione in formato PDF. Disponibile sia come PWA (Progressive Web App) che come applicazione desktop.

## 🌐 PWA (GitHub Pages)

L'applicazione è disponibile online su GitHub Pages:
- **URL**: [https://tuousername.github.io/VerbaleIspezione/](https://tuousername.github.io/VerbaleIspezione/)
- Funziona offline una volta caricata
- Installabile come app sui dispositivi mobili e desktop

## 💻 App Desktop (Electron - 193MB)

### Sviluppo
```bash
# Avvia in modalità sviluppo
npm run electron:dev

# Oppure usa lo script batch
scripts/dev-electron.bat
```

### Build e Distribuzione
```bash
# Build per sviluppo (cartella)
npm run electron:pack

# Build distributabile (installer)
npm run electron:dist

# Oppure usa gli script batch
scripts/build-electron.bat
```

## 🚀 App Desktop Leggera (Tauri - 5-10MB)

### Sviluppo
```bash
# Avvia in modalità sviluppo
npm run tauri:dev

# Oppure usa lo script batch
scripts/dev-tauri.bat
```

### Build e Distribuzione
```bash
# Build distributabile (installer MSI/EXE)
npm run tauri:build

# Oppure usa lo script batch
scripts/build-tauri.bat
```

## 🔧 Comandi Disponibili

### PWA
```bash
npm run dev          # Server di sviluppo
npm run build        # Build per GitHub Pages
npm run preview      # Preview build locale
```

### Electron
```bash
npm run electron:dev    # Sviluppo Electron + Vite
npm run electron:pack   # Package senza installer
npm run electron:dist   # Crea installer Windows/Mac/Linux
```

### Tauri
```bash
npm run tauri:dev       # Sviluppo Tauri + Vite
npm run tauri:build     # Crea installer MSI/EXE leggero
```

## 📁 Struttura Output

- `dist/` - Build PWA per GitHub Pages
- `electron-dist/` - Installer e file Electron (193MB)
- `src-tauri/target/release/` - Installer Tauri (5-10MB)

## ⚙️ Configurazione

L'app usa una configurazione dual:
- **PWA**: Base path `/VerbaleIspezione/` per GitHub Pages
- **Electron**: Base path `./` per file locali

La variabile `VITE_ELECTRON=true` determina quale configurazione usare.

## 🚀 Deployment

### PWA su GitHub Pages
1. Esegui `npm run build` o `scripts/build-pwa.bat`
2. Fai commit e push del contenuto di `dist/`
3. L'app sarà disponibile su GitHub Pages

### Desktop App Electron (193MB)
1. Esegui `npm run electron:dist` o `scripts/build-electron.bat`
2. Trova l'installer in `electron-dist/`
3. Distribuisci l'installer agli utenti

### Desktop App Tauri (5-10MB) - CONSIGLIATO
1. Esegui `npm run tauri:build` o `scripts/build-tauri.bat`
2. Trova l'installer in `src-tauri/target/release/bundle/`
3. Distribuisci l'installer MSI/EXE agli utenti

## 🔄 Sviluppo

```bash
# Installa dipendenze
npm install

# Sviluppo PWA
npm run dev

# Sviluppo Electron
npm run electron:dev

# Sviluppo Tauri (leggero)
npm run tauri:dev
```

## Funzionalità

- Compilazione form per verbali di ispezione
- Generazione PDF
- Interfaccia responsive
- Supporto per immagini (in arrivo)

## Tecnologie utilizzate

- React
- TypeScript
- Vite
- Tailwind CSS
- @react-pdf/renderer
