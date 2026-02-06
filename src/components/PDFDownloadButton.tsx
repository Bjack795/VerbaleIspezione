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
 // Funzione per generare il nome del file PDF
const generateFileName = () => {
  // Prova a usare la data ispezione (attesa come YYYY-MM-DD)
  let datePrefix: string;
  const insp = data.dataIspezione;
  if (insp && /^\d{4}-\d{2}-\d{2}$/.test(insp)) {
    const [yyyy, mm, dd] = insp.split('-');
    datePrefix = `${yyyy.slice(-2)}${mm}${dd}`;
  } else {
    // Fallback: data odierna (yymmgg)
    const today = new Date();
    const yy = today.getFullYear().toString().slice(-2);
    const mm = (today.getMonth() + 1).toString().padStart(2, '0');
    const dd = today.getDate().toString().padStart(2, '0');
    datePrefix = `${yy}${mm}${dd}`;
  }
  
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
      
      // Rilevamento Tauri tramite import dinamico delle API ufficiali
      let isTauri = false;
      try {
        await import('@tauri-apps/api');
        isTauri = true;
      } catch {
        isTauri = false;
      }
      
      if (isTauri) {
        // Ambiente Tauri - usa API ufficiali (Tauri v2 plugins)
        console.log('🎯 Rilevato ambiente Tauri, usando dialog Salva con nome...');
        try {
          const [{ save }, fs] = await Promise.all([
            import('@tauri-apps/plugin-dialog'),
            import('@tauri-apps/plugin-fs')
          ]);

          const filePath = await save({
            defaultPath: fileName,
            filters: [{ name: 'PDF Files', extensions: ['pdf'] }]
          });

          if (filePath) {
            const arrayBuffer = await pdfBlob.arrayBuffer();
            await fs.writeFile(filePath, new Uint8Array(arrayBuffer));
            console.log('✅ PDF salvato con successo in:', filePath);
            alert('PDF salvato con successo!');
          } else {
            console.log('❌ Utente ha annullato il salvataggio');
            alert('Salvataggio annullato.');
          }
        } catch (tauriError) {
          console.error('❌ Errore Tauri nel salvataggio:', tauriError);
          console.log('🔄 Fallback al download web...');
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