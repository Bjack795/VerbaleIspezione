import { app, BrowserWindow, Menu } from 'electron'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const isDev = process.env.NODE_ENV === 'development'

function createWindow() {
  // Crea la finestra del browser
  const mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      webSecurity: true
    },
    icon: path.join(__dirname, '../public/pwa-192x192.png'),
    title: 'Verbale di Ispezione - Redesco Progetti',
    show: false, // Non mostrare finché non è pronta
    titleBarStyle: 'default'
  })

  // Carica l'app
  if (isDev) {
    mainWindow.loadURL('http://localhost:3000')
    // Apri DevTools in sviluppo
    mainWindow.webContents.openDevTools()
  } else {
    // In produzione carica il file locale
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
  }

  // Mostra la finestra quando è pronta
  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
    
    // Focus sulla finestra
    if (isDev) {
      mainWindow.focus()
    }
  })

  // Gestisci il comportamento di chiusura
  mainWindow.on('closed', () => {
    // Dereferenzia l'oggetto window
    // solitamente si memorizzano le finestre in un array se l'app supporta finestre multiple
    // questo è il momento in cui si dovrebbe eliminare l'elemento corrispondente.
  })

  return mainWindow
}

// Questo metodo sarà chiamato quando Electron avrà finito l'inizializzazione
// e sarà pronto per creare le finestre del browser.
// Alcune API possono essere utilizzate solo dopo che questo evento si verifica.
app.whenReady().then(() => {
  createWindow()

  // Su macOS è comune ricreare una finestra nell'app quando l'icona del dock viene cliccata
  // e non ci sono altre finestre aperte.
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })

  // Rimuovi il menu di default (solo su Windows/Linux)
  if (process.platform !== 'darwin') {
    Menu.setApplicationMenu(null)
  }
})

// Esci quando tutte le finestre sono chiuse, eccetto su macOS.
// Su macOS è comune che le applicazioni e la loro barra dei menu 
// rimangano attive finché l'utente non esce esplicitamente con Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In questo file puoi includere il resto del codice specifico per il processo principale della tua app.
// Puoi anche metterlo in file separati e includerli qui. 