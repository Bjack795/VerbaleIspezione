import { useState, useCallback } from 'react';
import { pdf } from '@react-pdf/renderer';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { ImageData } from '../types/form';

// Funzione per convertire gradi in radianti
const degreesToRadians = (degrees: number) => (degrees * Math.PI) / 180;

// Funzione per caricare e processare un'immagine
const processImage = async (imageData: ImageData, pdfDoc: PDFDocument) => {
  try {
    // Converti il file in array buffer
    const arrayBuffer = await imageData.file.arrayBuffer();
    
    // Determina il tipo di immagine e caricala
    let image;
    if (imageData.file.type === 'image/jpeg' || imageData.file.type === 'image/jpg') {
      image = await pdfDoc.embedJpg(arrayBuffer);
    } else if (imageData.file.type === 'image/png') {
      image = await pdfDoc.embedPng(arrayBuffer);
    } else {
      // Per altri formati, prova PNG come fallback
      image = await pdfDoc.embedPng(arrayBuffer);
    }
    
    return image;
  } catch (error) {
    console.error('Errore nel processare l\'immagine:', error);
    return null;
  }
};

export const usePDFWithFooter = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generatePDFWithFooter = useCallback(async (reactPdfDocument: any, images: ImageData[] = []) => {
    try {
      setIsLoading(true);
      setError(null);

      // 1. Genera il PDF base con @react-pdf/renderer (senza footer)
      const basePdfBlob = await pdf(reactPdfDocument).toBlob();
      const basePdfBytes = await basePdfBlob.arrayBuffer();

      // 2. Carica il PDF con PDF-lib
      const pdfDoc = await PDFDocument.load(basePdfBytes);
      const pages = pdfDoc.getPages();
      const totalMainPages = pages.length;

      // 3. Font per il footer
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

      // 4. Aggiungi footer alle pagine esistenti
      pages.forEach((page, index) => {
        const pageNumber = index + 1;
        const totalPages = totalMainPages + Math.ceil(images.length / 2);
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

      // 5. Aggiungi pagine con immagini (2 per pagina)
      if (images.length > 0) {
        for (let i = 0; i < images.length; i += 2) {
          const imagePage = pdfDoc.addPage([595.28, 841.89]); // A4 in points
          const { width: pageWidth, height: pageHeight } = imagePage.getSize();
          
          // Calcola numero pagina per questa pagina immagini
          const currentPageNumber = totalMainPages + Math.floor(i / 2) + 1;
          const totalPages = totalMainPages + Math.ceil(images.length / 2);
          
          // Header
          imagePage.drawLine({
            start: { x: 30, y: pageHeight - 60 },
            end: { x: pageWidth - 30, y: pageHeight - 60 },
            thickness: 1,
            color: rgb(0, 0, 0),
          });
          
          imagePage.drawText('ALLEGATO FOTOGRAFICO', {
            x: 30,
            y: pageHeight - 45,
            size: 14,
            font,
            color: rgb(0, 0, 0),
          });
          
          // Prima immagine (in alto)
          if (images[i]) {
            await addImageToPage(imagePage, images[i], 'top', font, pdfDoc);
          }
          
          // Seconda immagine (in basso)
          if (images[i + 1]) {
            await addImageToPage(imagePage, images[i + 1], 'bottom', font, pdfDoc);
          }
          
          // Footer
          const footerText = `Redesco Progetti srl - Scheda di Verifica | Pagina ${currentPageNumber} di ${totalPages}`;
          
          imagePage.drawLine({
            start: { x: 30, y: 40 },
            end: { x: pageWidth - 30, y: 40 },
            thickness: 1,
            color: rgb(0, 0, 0),
          });
          
          imagePage.drawText(footerText, {
            x: 30,
            y: 25,
            size: 8,
            font,
            color: rgb(0.4, 0.4, 0.4),
          });
        }
      }

      // 6. Genera il PDF finale
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

// Funzione helper per aggiungere un'immagine alla pagina
const addImageToPage = async (
  page: any, 
  imageData: ImageData, 
  position: 'top' | 'bottom', 
  font: any,
  pdfDoc: PDFDocument
) => {
  try {
    const { width: pageWidth, height: pageHeight } = page.getSize();
    const image = await processImage(imageData, pdfDoc);
    
    if (!image) return;
    
    // Calcola posizione Y basata su top/bottom
    const imageAreaHeight = (pageHeight - 160) / 2; // Dividi lo spazio disponibile in 2
    const yPosition = position === 'top' 
      ? pageHeight - 100 - imageAreaHeight 
      : pageHeight - 100 - imageAreaHeight * 2 - 20;
    
    // Calcola dimensioni mantenendo aspect ratio
    const imageAspectRatio = image.width / image.height;
    const maxWidth = pageWidth - 120; // margini 60px per lato
    const maxHeight = imageAreaHeight - 60; // spazio per didascalia
    
    let finalWidth = maxWidth;
    let finalHeight = finalWidth / imageAspectRatio;
    
    if (finalHeight > maxHeight) {
      finalHeight = maxHeight;
      finalWidth = finalHeight * imageAspectRatio;
    }
    
    // Centra l'immagine
    const xPosition = (pageWidth - finalWidth) / 2;
    const imageYPosition = yPosition + 30; // spazio per didascalia sotto
    
    // Disegna l'immagine con rotazione se necessaria
    if (imageData.rotation !== 0) {
      page.pushOperators(
        page.PDFDocument.pushGraphicsState(),
        page.PDFDocument.translate(xPosition + finalWidth / 2, imageYPosition + finalHeight / 2),
        page.PDFDocument.rotate(degreesToRadians(imageData.rotation)),
        page.PDFDocument.translate(-finalWidth / 2, -finalHeight / 2)
      );
      
      page.drawImage(image, {
        x: 0,
        y: 0,
        width: finalWidth,
        height: finalHeight,
      });
      
      page.pushOperators(page.PDFDocument.popGraphicsState());
    } else {
      page.drawImage(image, {
        x: xPosition,
        y: imageYPosition,
        width: finalWidth,
        height: finalHeight,
      });
    }
    
    // Aggiungi didascalia se presente
    if (imageData.caption) {
      page.drawText(imageData.caption, {
        x: 60,
        y: yPosition + 5,
        size: 10,
        font,
        color: rgb(0.2, 0.2, 0.2),
        maxWidth: pageWidth - 120,
      });
    }
    
  } catch (error) {
    console.error('Errore nell\'aggiungere l\'immagine alla pagina:', error);
  }
}; 