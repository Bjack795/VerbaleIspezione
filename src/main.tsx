import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { HashRouter } from 'react-router-dom'

// Funzione per rimuovere service worker in ambiente Tauri
const cleanupServiceWorkerForTauri = async () => {
  // Rileva se siamo in ambiente Tauri
  const isTauri = typeof window !== 'undefined' && (
    (window as any).__TAURI__ || 
    (window as any).__TAURI_IPC__ ||
    navigator.userAgent.includes('Tauri')
  );

  if (isTauri && 'serviceWorker' in navigator) {
    try {
      console.log('🧹 Tauri rilevato: rimozione service worker esistenti...');
      
      // Ottieni tutte le registrazioni di service worker
      const registrations = await navigator.serviceWorker.getRegistrations();
      
      // Unregister tutti i service worker trovati
      const unregisterPromises = registrations.map(async (registration) => {
        console.log('🗑️ Rimozione service worker:', registration.scope);
        return registration.unregister();
      });
      
      await Promise.all(unregisterPromises);
      
      if (registrations.length > 0) {
        console.log(`✅ Rimossi ${registrations.length} service worker in ambiente Tauri`);
        
        // Pulisci anche le cache se possibile
        if ('caches' in window) {
          const cacheNames = await caches.keys();
          await Promise.all(cacheNames.map(name => caches.delete(name)));
          console.log('🧽 Cache service worker pulite');
        }
      } else {
        console.log('✅ Nessun service worker da rimuovere');
      }
    } catch (error) {
      console.warn('⚠️ Errore nella rimozione service worker:', error);
    }
  }
};

// Esegui cleanup al caricamento
cleanupServiceWorkerForTauri();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </StrictMode>,
) 