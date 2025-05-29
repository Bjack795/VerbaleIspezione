import React from 'react';
import { usePDFWithFooter } from '../hooks/usePDFWithFooter';
import PDFDocument from './PDFDocument';
import { FormInputs } from '../types/form';

interface PDFDownloadButtonProps {
  data: FormInputs;
  className?: string;
  children?: React.ReactNode;
}

const PDFDownloadButton: React.FC<PDFDownloadButtonProps> = ({ 
  data, 
  className = '', 
  children = 'Scarica PDF' 
}) => {
  const { generatePDFWithFooter, isLoading, error } = usePDFWithFooter();

  const handleDownload = async () => {
    try {
      const pdfBlob = await generatePDFWithFooter(<PDFDocument data={data} />);
      
      // Crea URL e scarica il file
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'verbale-ispezione.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
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
      {isLoading ? 'Generazione PDF...' : children}
    </button>
  );
};

export default PDFDownloadButton; 