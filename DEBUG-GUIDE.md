# Guida al Debug - Verbale di Ispezione Tauri

## 🎉 Problema 404 risolto!

Il problema del 404 all'avvio era causato dal **Service Worker** che aveva cache non sincronizzata.

**Soluzione:** Unregister del Service Worker dai DevTools.

## 🛠️ Per debug futuri

### Abilitare DevTools in produzione:

1. **Modifica temporanea in `src-tauri/Cargo.toml`**:
   ```toml
   tauri = { version = "2.5.0", features = ["devtools"] }
   ```

2. **Ricompila**:
   ```bash
   npm run tauri:build
   ```

3. **Apri DevTools nell'app**: Premi F12

### Strumenti di debug disponibili:

- **`debug-npm.ps1`** - Script base per compilazione e logging
- **`debug-devtools-fix.ps1`** - Script con DevTools abilitati

### Problemi comuni Service Worker:

**Sintomo**: App si apre con 404, dopo ricarica funziona
**Causa**: Service Worker cache non sincronizzata
**Soluzione**: 
```javascript
// Nei DevTools Console:
navigator.serviceWorker.getRegistrations().then(registrations => {
  registrations.forEach(reg => reg.unregister());
});
```

### Configurazione PWA migliorata:

Il `vite.config.ts` ora ha:
- `registerType: 'prompt'` per desktop (chiede prima di aggiornare)
- `disable: true` in development (evita conflitti)

## 🔍 Diagnostica step-by-step:

1. **DevTools F12**
2. **Tab Console** - errori JavaScript
3. **Tab Network** - richieste fallite
4. **Tab Application** - Service Worker issues

Il Service Worker è utile per le PWA web ma può causare problemi nelle app desktop! 