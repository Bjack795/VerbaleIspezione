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
 * Comprime un'immagine a 150 DPI e restituisce una versione ottimizzata
 */
export const compressImageTo150DPI = async (
  imageSrc: string,
  options: ImageCompressionOptions = {}
): Promise<string> => {
  const {
    targetDPI = 150,
    quality = 0.8,
    maxWidth = 800,
    maxHeight = 600
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
        
        // Calcola le dimensioni target per 150 DPI (simile a PIL resize)
        const aspectRatio = originalWidth / originalHeight;
        let targetWidth, targetHeight;
        
        // Determina le dimensioni finali rispettando maxWidth/maxHeight
        if (originalWidth > originalHeight) {
          // Immagine orizzontale - scala in base alla larghezza
          targetWidth = Math.min(maxWidth, originalWidth);
          targetHeight = Math.round(targetWidth / aspectRatio);
          
          if (targetHeight > maxHeight) {
            targetHeight = maxHeight;
            targetWidth = Math.round(targetHeight * aspectRatio);
          }
        } else {
          // Immagine verticale o quadrata - scala in base all'altezza
          targetHeight = Math.min(maxHeight, originalHeight);
          targetWidth = Math.round(targetHeight * aspectRatio);
          
          if (targetWidth > maxWidth) {
            targetWidth = maxWidth;
            targetHeight = Math.round(targetWidth / aspectRatio);
          }
        }
        
        console.log(`Immagine ridimensionata per ${targetDPI} DPI: ${targetWidth}x${targetHeight}px`);
        
        // Imposta le dimensioni del canvas (simile a PIL resize)
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        
        // Configura il context per qualità alta (simile a LANCZOS in PIL)
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        
        // Disegna l'immagine ridimensionata (resize + optimize come in PIL)
        ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
        
        // Converti in base64 con compressione JPEG per ridurre la dimensione
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        
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
      const compressedSrc = await compressImageTo150DPI(src, options);
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
 * Precarica e comprimi le immagini necessarie per il PDF
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
  
  console.log(`Compressione immagini a ${config.targetDPI} DPI con qualità ${config.defaultQuality}`);
  return await compressMultipleImages(imagesToCompress);
}; 