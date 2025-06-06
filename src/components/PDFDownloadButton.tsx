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
      
      // Crea URL e scarica il file
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      // Chiama la callback se fornita
      if (onDownload) {
        onDownload();
      }
    } catch (err) {
      console.error('Errore nel download del PDF:', err);
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