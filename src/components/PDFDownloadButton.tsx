import React from 'react';
import { usePDFWithFooter } from '../hooks/usePDFWithFooter';
import PDFDocument from './PDFDocument';
import { FormInputs } from '../types/form';
import { Language } from '../hooks/useTranslation';
import { HeaderType } from '../hooks/useHeaderSelection';

interface PDFDownloadButtonProps {
  data: FormInputs;
  className?: string;
  children?: React.ReactNode;
  onDownload?: () => void; // Callback chiamata dopo il download
  language?: Language;
  headerType?: HeaderType;
  t?: (key: string) => string;
}

const PDFDownloadButton: React.FC<PDFDownloadButtonProps> = ({ 
  data, 
  className = '', 
  children = 'Scarica PDF',
  onDownload,
  language = 'it',
  headerType = 'redesco',
  t
}) => {
  const { generatePDFWithFooter, isLoading, error } = usePDFWithFooter();

  // Funzione per generare il nome del file PDF
  const generateFileName = () => {
    // Formato data: yymmgg
    const today = new Date();
    const yy = today.getFullYear().toString().slice(-2);
    const mm = (today.getMonth() + 1).toString().padStart(2, '0');
    const dd = today.getDate().toString().padStart(2, '0');
    const datePrefix = `${yy}${mm}${dd}`;
    
    // Numero verbale
    const numeroVerbale = data.numero || '001';
    
    // Tipo documento basato sulla lingua
    const documentType = language === 'en' ? 'INSPECTION REPORT' : 'SCHEDA DI VERIFICA';
    
    // Trova il DL selezionato
    let dlType = 'DLG'; // default
    if (data.dl) {
      const selectedDL = Object.keys(data.dl).find(key => data.dl[key as keyof typeof data.dl]);
      if (selectedDL) {
        // Mappa i nomi interni ai nomi per il file
        const dlMap: { [key: string]: string } = {
          'DLG': 'ARC',
          'DLS': 'DLS', 
          'COLLAUDATORE': 'COLL',
          'DL_FACCIATE': 'FAC',
          'DL_ELETTRICI': 'ELE',
          'DL_MECCANICI': 'MEC'
        };
        dlType = dlMap[selectedDL] || selectedDL;
      }
    }
    
    // Formato finale: yymmgg_numeroVerbale_DOCUMENT TYPE_DL
    return `${datePrefix}_${numeroVerbale}_${documentType}_${dlType}.pdf`;
  };

  const handleDownload = async () => {
    try {
      const pdfBlob = await generatePDFWithFooter(<PDFDocument data={data} language={language} headerType={headerType} />, data.images, language, headerType);
      
      // Genera nome file dinamico
      const fileName = generateFileName();
      
      // Controlla se siamo in ambiente Tauri (rilevamento più preciso)
      const hasTauriObject = typeof window !== 'undefined' && !!(window as any).__TAURI__;
      const hasTauriIPC = typeof window !== 'undefined' && !!(window as any).__TAURI_IPC__;
      const hasTauriInvoke = typeof window !== 'undefined' && typeof (window as any).__TAURI_INVOKE__ === 'function';
      const hasTauriInternals = typeof window !== 'undefined' && !!(window as any).__TAURI_INTERNALS__;
      const isTauriUserAgent = typeof navigator !== 'undefined' && navigator.userAgent.includes('Tauri');
      
      // Controllo molto più rigoroso: le API devono essere effettivamente funzionanti
      let tauriAPIsAvailable = false;
      let tauriAPI: any = null;
      
      try {
        // Priorità: oggetto __TAURI__ con API complete
        if (hasTauriObject && 
            (window as any).__TAURI__.dialog && 
            (window as any).__TAURI__.fs &&
            typeof (window as any).__TAURI__.dialog.save === 'function' &&
            typeof (window as any).__TAURI__.fs.writeBinaryFile === 'function') {
          tauriAPI = (window as any).__TAURI__;
          tauriAPIsAvailable = true;
          console.log('✅ API Tauri trovate tramite __TAURI__');
        } 
        // Fallback: oggetto __TAURI_IPC__ con API complete
        else if (hasTauriIPC && 
                 (window as any).__TAURI_IPC__.dialog && 
                 (window as any).__TAURI_IPC__.fs &&
                 typeof (window as any).__TAURI_IPC__.dialog.save === 'function' &&
                 typeof (window as any).__TAURI_IPC__.fs.writeBinaryFile === 'function') {
          tauriAPI = (window as any).__TAURI_IPC__;
          tauriAPIsAvailable = true;
          console.log('✅ API Tauri trovate tramite __TAURI_IPC__');
        }
        // Ultimo tentativo: funzione invoke (potrebbe essere Tauri v2)
        else if (hasTauriInvoke) {
          // Test se l'invoke funziona davvero facendo una chiamata di test
          try {
            // Non facciamo chiamate reali qui, ma almeno verifichiamo che sia una funzione
            if (typeof (window as any).__TAURI_INVOKE__ === 'function') {
              tauriAPI = { invoke: (window as any).__TAURI_INVOKE__ };
              tauriAPIsAvailable = true;
              console.log('✅ API Tauri trovate tramite __TAURI_INVOKE__');
            }
          } catch (invokeError) {
            console.warn('❌ __TAURI_INVOKE__ non funzionale:', invokeError);
            tauriAPIsAvailable = false;
          }
        }
        
        if (!tauriAPIsAvailable) {
          console.log('❌ Nessuna API Tauri utilizzabile trovata');
        }
      } catch (e) {
        console.warn('❌ Errore nella verifica delle API Tauri:', e);
        tauriAPIsAvailable = false;
      }
      
      // Rilevamento finale: deve essere Tauri E avere API funzionanti
      const isTauri = tauriAPIsAvailable && (
        isTauriUserAgent || // User agent contiene "Tauri"
        (hasTauriObject && tauriAPI === (window as any).__TAURI__) || // API tramite __TAURI__
        (hasTauriIPC && tauriAPI === (window as any).__TAURI_IPC__) || // API tramite __TAURI_IPC__
        (hasTauriInvoke && tauriAPI && tauriAPI.invoke) // API tramite invoke
      );
      
      console.log('🔍 Debug rilevamento Tauri dettagliato:', {
        hasTauriObject,
        hasTauriIPC,
        hasTauriInvoke,
        hasTauriInternals,
        isTauriUserAgent,
        tauriAPIsAvailable,
        finalIsTauri: isTauri,
        userAgent: navigator.userAgent,
        windowTauri: typeof (window as any).__TAURI__,
        windowTauriIPC: typeof (window as any).__TAURI_IPC__,
        windowTauriInvoke: typeof (window as any).__TAURI_INVOKE__,
        fileSystemAPISupported: 'showSaveFilePicker' in window
      });
      
      if (isTauri) {
        // Ambiente Tauri - usa dialog "Salva con nome"
        console.log('🎯 Rilevato ambiente Tauri, usando dialog Salva con nome...');
        try {
          let filePath;
          
          // Usa le API verificate in precedenza
          if (tauriAPI.dialog && tauriAPI.fs) {
            // API complete disponibili
            console.log('📂 Mostrando dialog Salva con nome...');
            filePath = await tauriAPI.dialog.save({
              defaultPath: fileName,
              filters: [{
                name: 'PDF Files',
                extensions: ['pdf']
              }]
            });
            
            if (filePath) {
              console.log('💾 Percorso selezionato:', filePath);
              // Converti blob in Uint8Array per Tauri
              const arrayBuffer = await pdfBlob.arrayBuffer();
              const uint8Array = new Uint8Array(arrayBuffer);
              
              // Salva il file
              await tauriAPI.fs.writeBinaryFile(filePath, uint8Array);
              console.log('✅ PDF salvato con successo in:', filePath);
            } else {
              console.log('❌ Utente ha annullato il salvataggio');
            }
          } else if (tauriAPI.invoke) {
            // Usa invoke per Tauri v2
            console.log('📂 Usando invoke per dialog Salva con nome...');
            filePath = await tauriAPI.invoke('plugin:dialog|save', {
              defaultPath: fileName,
              filters: [{
                name: 'PDF Files',
                extensions: ['pdf']
              }]
            });
            
            if (filePath) {
              console.log('💾 Percorso selezionato:', filePath);
              const arrayBuffer = await pdfBlob.arrayBuffer();
              const uint8Array = new Uint8Array(arrayBuffer);
              
              await tauriAPI.invoke('plugin:fs|write_binary_file', {
                path: filePath,
                contents: Array.from(uint8Array)
              });
              console.log('✅ PDF salvato con successo in:', filePath);
            } else {
              console.log('❌ Utente ha annullato il salvataggio');
            }
          } else {
            throw new Error('Nessuna API Tauri funzionale disponibile');
          }
        } catch (tauriError) {
          console.error('❌ Errore Tauri nel salvataggio:', tauriError);
          console.log('🔄 Fallback al download web...');
          
          // Fallback immediato al download web
          const url = URL.createObjectURL(pdfBlob);
          const link = document.createElement('a');
          link.href = url;
          link.download = fileName;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
          console.log('✅ Download web completato come fallback');
        }
      } else {
        // Ambiente web - prova File System Access API per "Save As", altrimenti download automatico
        console.log('🌐 Ambiente web rilevato...');
        
        // Controlla se File System Access API è disponibile
        const hasFileSystemAPI = 'showSaveFilePicker' in window;
        
        if (hasFileSystemAPI) {
          try {
            console.log('💾 Usando File System Access API per "Save As"...');
            
            // Mostra dialog "Save As" nativo del browser
            const fileHandle = await (window as any).showSaveFilePicker({
              suggestedName: fileName,
              types: [{
                description: 'PDF Files',
                accept: {
                  'application/pdf': ['.pdf']
                }
              }]
            });
            
            // Crea stream scrivibile e salva il file
            const writableStream = await fileHandle.createWritable();
            await writableStream.write(pdfBlob);
            await writableStream.close();
            
            console.log('✅ PDF salvato con successo tramite File System API');
          } catch (fileSystemError: any) {
            if (fileSystemError.name === 'AbortError') {
              console.log('❌ Utente ha annullato il salvataggio');
            } else {
              console.warn('❌ Errore File System API, fallback al download automatico:', fileSystemError);
              
              // Fallback al download automatico
              const url = URL.createObjectURL(pdfBlob);
              const link = document.createElement('a');
              link.href = url;
              link.download = fileName;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              URL.revokeObjectURL(url);
              console.log('✅ Download automatico completato (fallback)');
            }
          }
        } else {
          // File System Access API non supportata - download automatico tradizionale
          console.log('⬇️ File System Access API non supportata, download automatico in Downloads...');
          const url = URL.createObjectURL(pdfBlob);
          const link = document.createElement('a');
          link.href = url;
          link.download = fileName;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
          console.log('✅ Download automatico completato');
        }
      }
      
      // Chiama la callback se fornita
      if (onDownload) {
        onDownload();
      }
    } catch (err) {
      console.error('❌ Errore generale nel download del PDF:', err);
    }
  };

  if (error) {
    return (
      <div className="text-red-600 text-sm mt-2">
        Errore: {error}
      </div>
    );
  }

  return (
    <button
      onClick={handleDownload}
      disabled={isLoading}
      className={`${className} ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {isLoading ? (t ? t('generazione_pdf') : 'Generazione PDF...') : children}
    </button>
  );
};

export default PDFDownloadButton; 