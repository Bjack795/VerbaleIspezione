/**
 * Configurazione per la compressione delle immagini nei PDF
 */

export interface ImageCompressionConfig {
  /** DPI target per le immagini nel PDF */
  targetDPI: number;
  /** Qualità di compressione JPEG (0-1) */
  defaultQuality: number;
  /** Dimensioni massime per il logo aziendale */
  logoMaxDimensions: {
    width: number;
    height: number;
    quality: number;
  };
  /** Dimensioni massime per le checkbox */
  checkboxMaxDimensions: {
    width: number;
    height: number;
    quality: number;
  };
  /** Timeout per il caricamento delle immagini (ms) */
  loadTimeout: number;
}

/**
 * Configurazione predefinita per la compressione delle immagini a 150 DPI
 */
export const defaultImageCompressionConfig: ImageCompressionConfig = {
  targetDPI: 150,
  defaultQuality: 0.8,
  logoMaxDimensions: {
    width: 100,  // Dimensione massima per logo a 150 DPI
    height: 100, // Dimensione massima per logo a 150 DPI
    quality: 0.85 // Qualità buona per il logo
  },
  checkboxMaxDimensions: {
    width: 20,   // Dimensione massima per checkbox a 150 DPI
    height: 20,  // Dimensione massima per checkbox a 150 DPI
    quality: 0.75 // Qualità adeguata per checkbox
  },
  loadTimeout: 10000 // 10 secondi
};

/**
 * Configurazione per alta qualità (200 DPI)
 */
export const highQualityImageConfig: ImageCompressionConfig = {
  ...defaultImageCompressionConfig,
  targetDPI: 200,
  defaultQuality: 0.9,
  logoMaxDimensions: {
    ...defaultImageCompressionConfig.logoMaxDimensions,
    width: 160,
    height: 160,
    quality: 0.95
  },
  checkboxMaxDimensions: {
    ...defaultImageCompressionConfig.checkboxMaxDimensions,
    width: 32,
    height: 32,
    quality: 0.9
  }
};

/**
 * Configurazione per dimensioni file ridotte (100 DPI)
 */
export const compactImageConfig: ImageCompressionConfig = {
  ...defaultImageCompressionConfig,
  targetDPI: 100,
  defaultQuality: 0.7,
  logoMaxDimensions: {
    ...defaultImageCompressionConfig.logoMaxDimensions,
    width: 80,
    height: 80,
    quality: 0.8
  },
  checkboxMaxDimensions: {
    ...defaultImageCompressionConfig.checkboxMaxDimensions,
    width: 16,
    height: 16,
    quality: 0.7
  }
}; 