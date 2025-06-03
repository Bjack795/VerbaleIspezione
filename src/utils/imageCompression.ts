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

        // Calcola le dimensioni ottimali basate su 150 DPI
        // DPI standard per web è 72, quindi fattore di ridimensionamento
        const scaleFactor = targetDPI / 72;
        
        let { width, height } = img;
        
        // Applica il ridimensionamento per DPI
        width = Math.floor(width / scaleFactor);
        height = Math.floor(height / scaleFactor);
        
        // Assicurati che non superi le dimensioni massime
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
        
        // Imposta le dimensioni del canvas
        canvas.width = width;
        canvas.height = height;
        
        // Configura il context per una migliore qualità
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        
        // Disegna l'immagine ridimensionata
        ctx.drawImage(img, 0, 0, width, height);
        
        // Converti in base64 con compressione
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        
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