import { useState, useCallback } from 'react';
import { pdf } from '@react-pdf/renderer';
import { PDFDocument, rgb, StandardFonts, degrees } from 'pdf-lib';
import { ImageData } from '../types/form';
import { compressAllReportImages } from '../utils/imageCompression';
import { ultraCompactImageConfig } from '../config/imageCompression';

// Funzione per convertire data URL in File
const dataURLToFile = async (dataURL: string, filename: string): Promise<File> => {
  const response = await fetch(dataURL);
  const blob = await response.blob();
  return new File([blob], filename, { type: blob.type });
};

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

      // 1. Comprimi le immagini del report a 150 DPI PRIMA di processarle
      let processedImages = images;
      if (images.length > 0) {
        console.log(`Compressione di ${images.length} immagini del report...`);
        const imageFiles = images.map(img => img.file);
        const compressedImageUrls = await compressAllReportImages(imageFiles, ultraCompactImageConfig);
        
        // Crea nuovi oggetti ImageData con le immagini compresse
        const filePromises = images.map(async (originalImage, index) => ({
          ...originalImage,
          // Crea un nuovo File virtuale dalla data URL compressa
          file: await dataURLToFile(compressedImageUrls[index], originalImage.file.name)
        }));
        
        processedImages = await Promise.all(filePromises);
        
        console.log(`Compressione completata: ${processedImages.length} immagini pronte per il PDF`);
      }

      // 2. Genera il PDF base con @react-pdf/renderer (senza footer)
      const basePdfBlob = await pdf(reactPdfDocument).toBlob();
      const basePdfBytes = await basePdfBlob.arrayBuffer();

      // 2. Carica il PDF con PDF-lib
      const pdfDoc = await PDFDocument.load(basePdfBytes);
      const pages = pdfDoc.getPages();
      const totalMainPages = pages.length;

      // 3. Font Arial per tutto il documento
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica); // Arial non è disponibile, uso Helvetica che è simile
      const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold); // Font bold per il company name

      // 4. Aggiungi footer alle pagine esistenti
      pages.forEach((page, index) => {
        const pageNumber = index + 1;
        const totalPages = totalMainPages + Math.ceil(processedImages.length / 2);
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
      if (processedImages.length > 0) {
        for (let i = 0; i < processedImages.length; i += 2) {
          const imagePage = pdfDoc.addPage([595.28, 841.89]); // A4 in points
          const { width: pageWidth, height: pageHeight } = imagePage.getSize();
          
          // Calcola numero pagina per questa pagina immagini
          const currentPageNumber = totalMainPages + Math.floor(i / 2) + 1;
          const totalPages = totalMainPages + Math.ceil(processedImages.length / 2);
          
          // HEADER UGUALE ALLE ALTRE PAGINE - con logo e company name
          // Carica il logo
          const logoBytes = await fetch(`${import.meta.env.BASE_URL}logo.png`).then(r => r.arrayBuffer());
          const logoImage = await pdfDoc.embedPng(logoBytes);
          
          // Calcola le dimensioni del logo mantenendo le proporzioni (come height: auto)
          const logoWidth = 40;
          const logoAspectRatio = logoImage.width / logoImage.height;
          const logoHeight = logoWidth / logoAspectRatio;
          
          // Header con padding equivalente (paddingTop: 15, paddingBottom: 7)
          // Replica esatta della struttura delle prime pagine
          const pageTopPadding = 30; // page padding
          const headerPaddingTop = 15; // header paddingTop
          
          // Calcola la posizione del logo come nelle prime pagine
          // Il logo deve essere posizionato dentro l'area dell'header
          const headerTopY = pageHeight - pageTopPadding; // Top dell'area header
          const logoStartY = headerTopY - headerPaddingTop; // Inizio area contenuto header
          const logoY = logoStartY - logoHeight; // Posizione finale logo
          
          // La linea è alla fine dell'header dopo marginBottom e paddingBottom
          const logoRowMarginBottom = 10;
          const headerPaddingBottom = 7;
          const headerLineY = logoY - logoRowMarginBottom - headerPaddingBottom;
          
          // Disegna il logo con dimensioni proporzionali
          imagePage.drawImage(logoImage, {
            x: 30,
            y: logoY,
            width: logoWidth,
            height: logoHeight,
          });
          
          // Testo company name con font weight bold e posizionamento corretto
          imagePage.drawText('Redesco Progetti srl', {
            x: 30 + logoWidth + 10, // 10 è il marginRight del logo
            y: logoY + logoHeight/2 - 2, // centrato verticalmente rispetto al logo
            size: 10,
            font: boldFont, // Uso font bold per replicare le prime pagine
            color: rgb(0, 0, 0),
          });
          
          // Linea sotto l'header esattamente come nelle altre pagine
          imagePage.drawLine({
            start: { x: 30, y: headerLineY },
            end: { x: pageWidth - 30, y: headerLineY },
            thickness: 1,
            color: rgb(0, 0, 0),
          });
          
          // Prima immagine (in alto) - margini ridotti
          if (processedImages[i]) {
            await addImageToPage(imagePage, processedImages[i], 'top', font, pdfDoc, i);
          }
          
          // Seconda immagine (in basso) - margini ridotti
          if (processedImages[i + 1]) {
            await addImageToPage(imagePage, processedImages[i + 1], 'bottom', font, pdfDoc, i + 1);
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

      // 6. Genera il PDF finale con opzioni di compatibilità
      const finalPdfBytes = await pdfDoc.save({
        useObjectStreams: false, // Migliore compatibilità con viewer vecchi
        addDefaultPage: false,   // Non aggiungere pagine vuote automaticamente
        objectsPerTick: 50,      // Evita problemi di memoria su documenti grandi
      });
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
    
    const rotationInDegrees = imageData.rotation || 0;
    
    // Dimensioni originali dell'immagine
    const originalWidth = image.width;
    const originalHeight = image.height;
    
    // STEP 1: Calcola le dimensioni che l'immagine occuperà DOPO la rotazione
    let boundingWidth, boundingHeight;
    
    if (rotationInDegrees === 90 || rotationInDegrees === 270) {
      // Per 90°/270°, larghezza e altezza si scambiano
      boundingWidth = originalHeight;
      boundingHeight = originalWidth;
    } else {
      // Per 0°/180°, rimangono uguali
      boundingWidth = originalWidth;
      boundingHeight = originalHeight;
    }
    
    // STEP 2: Ridimensiona - USA LO STESSO SPAZIO HEADER DELLE PRIME PAGINE
    // Spazio header esatto delle prime pagine: padding(30) + header(~75) = 105 punti
    // Spazio footer: 70 punti (come nelle prime pagine)
    const headerSpace = 105; // Esattamente come nelle prime pagine
    const footerSpace = 70;
    const imageAreaHeight = (pageHeight - headerSpace - footerSpace) / 2; 
    const maxWidth = pageWidth - 120; // margini 60px per lato  
    const maxHeight = imageAreaHeight - 40; // spazio per didascalia
    
    // Calcola il fattore di scala basato sul bounding box
    const scaleWidth = maxWidth / boundingWidth;
    const scaleHeight = maxHeight / boundingHeight;
    const scale = Math.min(scaleWidth, scaleHeight);
    
    // Dimensioni finali dell'immagine (prima della rotazione)
    const finalWidth = originalWidth * scale;
    const finalHeight = originalHeight * scale;
    
    // STEP 3: Calcola la posizione dell'area dell'immagine - STESSO SPAZIO DELLE PRIME PAGINE
    const yAreaTop = position === 'top' 
      ? pageHeight - headerSpace - imageAreaHeight  // Usa headerSpace delle prime pagine
      : pageHeight - headerSpace - imageAreaHeight * 2 - 5; // Spazio tra immagini ridotto a 5pt
    
    // Centro dell'area dove deve stare il bounding box
    const centerX = pageWidth / 2;
    const centerY = yAreaTop + (imageAreaHeight - 40) / 2 + 20; // centrata nell'area disponibile
    
    // STEP 4: Calcola la posizione dell'immagine considerando la rotazione
    let imageX, imageY;
    
    if (rotationInDegrees === 0) {
      imageX = centerX - finalWidth / 2;
      imageY = centerY - finalHeight / 2;
    } else if (rotationInDegrees === 90) {
      imageX = centerX + finalHeight / 2;
      imageY = centerY - finalWidth / 2;
    } else if (rotationInDegrees === 180) {
      imageX = centerX + finalWidth / 2;
      imageY = centerY + finalHeight / 2;
    } else if (rotationInDegrees === 270) {
      imageX = centerX - finalHeight / 2;
      imageY = centerY + finalWidth / 2;
    }
    
    // Disegna l'immagine
    page.drawImage(image, {
      x: imageX,
      y: imageY,
      width: finalWidth,
      height: finalHeight,
      rotate: degrees(rotationInDegrees)
    });
    
    // Genera didascalia automatica
    const figureNumber = imageIndex + 1;
    const captionText = imageData.caption 
      ? `Figura ${figureNumber} - ${imageData.caption}`
      : `Figura ${figureNumber}`;
    
    // DIDASCALIA CENTRATA
    const textWidth = font.widthOfTextAtSize(captionText, 10);
    const centeredX = (pageWidth - textWidth) / 2;
    
    // Aggiungi didascalia centrata sotto l'area dell'immagine
    page.drawText(captionText, {
      x: centeredX,
      y: yAreaTop + 5,
      size: 12,
      font,
      color: rgb(0.2, 0.2, 0.2),
    });
    
  } catch (error) {
    console.error('Errore nell\'aggiungere l\'immagine alla pagina:', error);
  }
}; 