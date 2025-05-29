import { useState, useCallback } from 'react';
import { pdf } from '@react-pdf/renderer';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export const usePDFWithFooter = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generatePDFWithFooter = useCallback(async (reactPdfDocument: any) => {
    try {
      setIsLoading(true);
      setError(null);

      // 1. Genera il PDF base con @react-pdf/renderer (senza footer)
      const basePdfBlob = await pdf(reactPdfDocument).toBlob();
      const basePdfBytes = await basePdfBlob.arrayBuffer();

      // 2. Carica il PDF con PDF-lib
      const pdfDoc = await PDFDocument.load(basePdfBytes);
      const pages = pdfDoc.getPages();
      const totalPages = pages.length;

      // 3. Font per il footer
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

      // 4. Aggiungi footer a ogni pagina
      pages.forEach((page, index) => {
        const pageNumber = index + 1;
        const footerText = `Redesco Progetti srl - Scheda di Verifica | Pagina ${pageNumber} di ${totalPages}`;
        
        const { width } = page.getSize();
        
        // Linea superiore del footer
        page.drawLine({
          start: { x: 30, y: 40 },
          end: { x: width - 30, y: 40 },
          thickness: 1,
          color: rgb(0, 0, 0),
        });
        
        // Testo del footer
        page.drawText(footerText, {
          x: 30,
          y: 25,
          size: 8,
          font,
          color: rgb(0.4, 0.4, 0.4),
        });
      });

      // 5. Genera il PDF finale
      const finalPdfBytes = await pdfDoc.save();
      const finalBlob = new Blob([finalPdfBytes], { type: 'application/pdf' });

      setIsLoading(false);
      return finalBlob;

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore nella generazione del PDF');
      setIsLoading(false);
      throw err;
    }
  }, []);

  return {
    generatePDFWithFooter,
    isLoading,
    error,
  };
}; 