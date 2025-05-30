import { useState, useCallback } from 'react';
import { pdf } from '@react-pdf/renderer';
import { PDFDocument, rgb, StandardFonts, degrees } from 'pdf-lib';
import { ImageData } from '../types/form';

// Funzione per correggere l'orientamento dell'immagine basato su EXIF
const getImageWithCorrectOrientation = async (file: File): Promise<HTMLCanvasElement> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      
      // Per ora assumiamo orientamento corretto, in futuro si può aggiungere lettura EXIF
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      
      resolve(canvas);
    };
    img.src = URL.createObjectURL(file);
  });
};

// Funzione per convertire canvas in blob
const canvasToBlob = (canvas: HTMLCanvasElement): Promise<Blob> => {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(blob!);
    }, 'image/jpeg', 0.9);
  });
};

// Funzione per caricare e processare un'immagine
const processImage = async (imageData: ImageData, pdfDoc: PDFDocument) => {
  try {
    // Correggi orientamento se necessario
    const correctedCanvas = await getImageWithCorrectOrientation(imageData.file);
    const correctedBlob = await canvasToBlob(correctedCanvas);
    const arrayBuffer = await correctedBlob.arrayBuffer();
    
    // Carica l'immagine corretta in PDF-lib
    let image;
    try {
      image = await pdfDoc.embedJpg(arrayBuffer);
    } catch {
      // Se JPEG fallisce, prova PNG
      try {
        image = await pdfDoc.embedPng(arrayBuffer);
      } catch {
        // Fallback: usa il file originale
        const originalBuffer = await imageData.file.arrayBuffer();
        if (imageData.file.type === 'image/jpeg' || imageData.file.type === 'image/jpg') {
          image = await pdfDoc.embedJpg(originalBuffer);
        } else {
          image = await pdfDoc.embedPng(originalBuffer);
        }
      }
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
            await addImageToPage(imagePage, images[i], 'top', font, pdfDoc, i);
          }
          
          // Seconda immagine (in basso)
          if (images[i + 1]) {
            await addImageToPage(imagePage, images[i + 1], 'bottom', font, pdfDoc, i + 1);
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
  pdfDoc: PDFDocument,
  imageIndex: number
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
    
    // Ottieni dimensioni originali dell'immagine
    let imgWidth = image.width;
    let imgHeight = image.height;
    
    // Se l'immagine è ruotata di 90° o 270°, scambia le dimensioni per il calcolo dell'aspect ratio
    const needsDimensionSwap = imageData.rotation === 90 || imageData.rotation === 270;
    if (needsDimensionSwap) {
      [imgWidth, imgHeight] = [imgHeight, imgWidth];
    }
    
    // Calcola dimensioni mantenendo aspect ratio
    const imageAspectRatio = imgWidth / imgHeight;
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
    
    // Converti rotazione in radianti per PDF-lib
    const rotationInDegrees = imageData.rotation || 0;
    
    // Disegna l'immagine con rotazione applicata
    page.drawImage(image, {
      x: xPosition,
      y: imageYPosition,
      width: finalWidth,
      height: finalHeight,
      rotate: degrees(rotationInDegrees)
    });
    
    // Genera didascalia automatica
    const figureNumber = imageIndex + 1;
    const captionText = imageData.caption 
      ? `Figura ${figureNumber} - ${imageData.caption}`
      : `Figura ${figureNumber}`;
    
    // Aggiungi didascalia
    page.drawText(captionText, {
      x: 60,
      y: yPosition + 5,
      size: 10,
      font,
      color: rgb(0.2, 0.2, 0.2),
      maxWidth: pageWidth - 120,
    });
    
  } catch (error) {
    console.error('Errore nell\'aggiungere l\'immagine alla pagina:', error);
  }
}; 