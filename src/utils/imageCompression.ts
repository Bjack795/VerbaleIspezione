/**
 * Utility per comprimere immagini a 150 DPI per l'uso nei PDF
 */

import { defaultImageCompressionConfig, type ImageCompressionConfig } from '../config/imageCompression';

interface ImageCompressionOptions {
  targetDPI?: number;
  quality?: number;
  maxWidth?: number;
  maxHeight?: number;
}

/**
 * Comprime un'immagine a 250 DPI e restituisce una versione ottimizzata
 */
export const compressImageTo250DPI = async (
  imageSrc: string,
  options: ImageCompressionOptions = {}
  ): Promise<string> => {
  const {
    targetDPI = 250,
    quality = 0.8,
    maxWidth = 1200,
    maxHeight = 900
  } = options;

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      try {
        // Crea un canvas per la compressione
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('Impossibile creare il context del canvas'));
          return;
        }

        const { width: originalWidth, height: originalHeight } = img;
        
        console.log(`Immagine originale: ${originalWidth}x${originalHeight}px`);
        
        // Calcola le dimensioni target per 250 DPI mantenendo proporzioni
        const aspectRatio = originalWidth / originalHeight;
        let targetWidth, targetHeight;
        
        // Scala per adattarsi ai limiti massimi mantenendo le proporzioni
        const scaleByWidth = maxWidth / originalWidth;
        const scaleByHeight = maxHeight / originalHeight;
        const scale = Math.min(scaleByWidth, scaleByHeight, 1); // Non ingrandire mai
        
        targetWidth = Math.round(originalWidth * scale);
        targetHeight = Math.round(originalHeight * scale);
        
        // Assicurati che le dimensioni siano almeno minime e rispettino i vincoli
        targetWidth = Math.max(Math.min(targetWidth, maxWidth), 100); // Min 100px
        targetHeight = Math.max(Math.min(targetHeight, maxHeight), 75);  // Min 75px
        
        // Ricalcola per mantenere proporzioni se necessario
        if (targetWidth / targetHeight !== aspectRatio) {
          if (targetWidth / aspectRatio <= maxHeight) {
            targetHeight = Math.round(targetWidth / aspectRatio);
          } else {
            targetWidth = Math.round(targetHeight * aspectRatio);
          }
        }
        
        console.log(`Immagine ottimizzata per ${targetDPI} DPI: ${targetWidth}x${targetHeight}px`);
        
        // Imposta le dimensioni del canvas (simile a PIL resize)
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        
        // Configura il context per qualità alta (simile a LANCZOS in PIL)
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        
        // Disegna l'immagine ridimensionata (resize + optimize come in PIL)
        ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
        
        // Usa PNG per immagini molto piccole (checkbox), JPEG per altre
        const format = (targetWidth <= 12 && targetHeight <= 12) ? 'image/png' : 'image/jpeg';
        const compressedDataUrl = format === 'image/png' 
          ? canvas.toDataURL('image/png')
          : canvas.toDataURL('image/jpeg', quality);
        
        console.log(`Formato usato: ${format}`);
        
        // Log della riduzione dimensione
        const originalSize = imageSrc.length;
        const compressedSize = compressedDataUrl.length;
        const reduction = ((originalSize - compressedSize) / originalSize * 100).toFixed(1);
        console.log(`Riduzione dimensione: ${reduction}% (da ${originalSize} a ${compressedSize} caratteri)`);
        
        resolve(compressedDataUrl);
      } catch (error) {
        reject(error);
      }
    };
    
    img.onerror = () => {
      reject(new Error(`Impossibile caricare l'immagine: ${imageSrc}`));
    };
    
    // Carica l'immagine
    img.src = imageSrc;
  });
};

/**
 * Comprime più immagini in parallelo
 */
export const compressMultipleImages = async (
  imageSources: { key: string; src: string; options?: ImageCompressionOptions }[]
): Promise<Record<string, string>> => {
  const compressionPromises = imageSources.map(async ({ key, src, options }) => {
    try {
      const compressedSrc = await compressImageTo250DPI(src, options);
      return { key, compressedSrc };
    } catch (error) {
      console.warn(`Errore nella compressione dell'immagine ${key}:`, error);
      // In caso di errore, usa l'immagine originale
      return { key, compressedSrc: src };
    }
  });
  
  const results = await Promise.all(compressionPromises);
  
  const compressedImages: Record<string, string> = {};
  results.forEach(({ key, compressedSrc }) => {
    compressedImages[key] = compressedSrc;
  });
  
  return compressedImages;
};

/**
 * Comprime un File immagine del report a 250 DPI
 */
export const compressReportImage = async (
  imageFile: File,
  config: ImageCompressionConfig = defaultImageCompressionConfig
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = async (e) => {
      try {
        const imageSrc = e.target?.result as string;
        const compressedDataUrl = await compressImageTo250DPI(imageSrc, {
          targetDPI: config.targetDPI,
          maxWidth: config.reportImageDimensions.width,
          maxHeight: config.reportImageDimensions.height,
          quality: config.reportImageDimensions.quality
        });
        
        resolve(compressedDataUrl);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => {
      reject(new Error(`Errore nella lettura del file: ${imageFile.name}`));
    };
    
    reader.readAsDataURL(imageFile);
  });
};

/**
 * Comprime tutte le immagini del report dell'utente
 */
export const compressAllReportImages = async (
  imageFiles: File[],
  config: ImageCompressionConfig = defaultImageCompressionConfig
): Promise<string[]> => {
  console.log(`Inizio compressione di ${imageFiles.length} immagini del report a ${config.targetDPI} DPI...`);
  
  const compressionPromises = imageFiles.map(async (file, index) => {
    try {
      console.log(`Compressione immagine ${index + 1}/${imageFiles.length}: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`);
      const compressed = await compressReportImage(file, config);
      console.log(`Immagine ${index + 1} compressa con successo`);
      return compressed;
    } catch (error) {
      console.error(`Errore nella compressione dell'immagine ${file.name}:`, error);
      // Fallback: usa l'immagine originale
      return URL.createObjectURL(file);
    }
  });
  
  const results = await Promise.all(compressionPromises);
  console.log(`Compressione completata per ${results.length} immagini del report`);
  
  return results;
};

/**
 * Precarica e comprimi le immagini necessarie per il PDF (logo e checkbox)
 */
export const preloadAndCompressPDFImages = async (
  config: ImageCompressionConfig = defaultImageCompressionConfig
): Promise<Record<string, string>> => {
  const baseUrl = import.meta.env.BASE_URL;
  
  const imagesToCompress = [
    {
      key: 'logo',
      src: `${baseUrl}logo.png`,
      options: {
        targetDPI: config.targetDPI,
        maxWidth: config.logoMaxDimensions.width,
        maxHeight: config.logoMaxDimensions.height,
        quality: config.logoMaxDimensions.quality
      }
    },
    {
      key: 'checkbox_checked',
      src: `${baseUrl}images/checkbox_checked.png`,
      options: {
        targetDPI: config.targetDPI,
        maxWidth: config.checkboxMaxDimensions.width,
        maxHeight: config.checkboxMaxDimensions.height,
        quality: config.checkboxMaxDimensions.quality
      }
    },
    {
      key: 'checkbox_unchecked',
      src: `${baseUrl}images/checkbox_unchecked.png`,
      options: {
        targetDPI: config.targetDPI,
        maxWidth: config.checkboxMaxDimensions.width,
        maxHeight: config.checkboxMaxDimensions.height,
        quality: config.checkboxMaxDimensions.quality
      }
    }
  ];
  
  console.log(`Compressione logo e checkbox a ${config.targetDPI} DPI`);
  return await compressMultipleImages(imagesToCompress);
}; 