import { useState, useEffect } from 'react';
import { preloadAndCompressPDFImages } from '../utils/imageCompression';
import { defaultImageCompressionConfig, type ImageCompressionConfig } from '../config/imageCompression';

interface UseCompressedImagesReturn {
  compressedImages: Record<string, string>;
  isLoading: boolean;
  error: string | null;
}

/**
 * Hook personalizzato per gestire il caricamento e la compressione delle immagini
 * utilizzate nei PDF a 150 DPI
 */
export const useCompressedImages = (
  config: ImageCompressionConfig = defaultImageCompressionConfig
): UseCompressedImagesReturn => {
  const [compressedImages, setCompressedImages] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadAndCompressImages = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        console.log(`Inizio compressione immagini a ${config.targetDPI} DPI...`);
        const images = await preloadAndCompressPDFImages(config);
        console.log('Compressione immagini completata:', Object.keys(images));
        
        setCompressedImages(images);
      } catch (err) {
        const errorMessage = `Errore durante la compressione delle immagini: ${err}`;
        console.error(errorMessage);
        setError(errorMessage);
        
        // Fallback alle immagini originali in caso di errore
        const baseUrl = import.meta.env.BASE_URL;
        setCompressedImages({
          logo: `${baseUrl}logo.png`,
          checkbox_checked: `${baseUrl}images/checkbox_checked.png`,
          checkbox_unchecked: `${baseUrl}images/checkbox_unchecked.png`
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadAndCompressImages();
  }, [config]);

  return {
    compressedImages,
    isLoading,
    error
  };
}; 