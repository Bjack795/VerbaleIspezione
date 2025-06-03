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
  /** Dimensioni massime per le immagini del report */
  reportImageDimensions: {
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
  targetDPI: 250,
  defaultQuality: 0.85, // Qualità alta per 250 DPI
  logoMaxDimensions: {
    width: 50,   // Dimensione aumentata per 250 DPI
    height: 50,  
    quality: 0.9 // Qualità alta per logo a 250 DPI
  },
  checkboxMaxDimensions: {
    width: 16,   // Dimensione aumentata per 250 DPI
    height: 16,  
    quality: 0.8 // Qualità buona per checkbox a 250 DPI
  },
  reportImageDimensions: {
    width: 1200,  // Dimensioni corrette per 250 DPI (circa 12cm a 250 DPI)
    height: 900,  // Altezza proporzionale (circa 9cm a 250 DPI)
    quality: 1    // Qualità massima per mantenere dettagli a 250 DPI
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
 * Configurazione per dimensioni file ultra-ridotte (pochi KB)
 */
export const ultraCompactImageConfig: ImageCompressionConfig = {
  targetDPI: 250,
  defaultQuality: 0.75, // Qualità buona anche in modalità compatta per 250 DPI
  logoMaxDimensions: {
    width: 40,   // Logo ridotto ma adeguato per 250 DPI
    height: 40,
    quality: 0.85
  },
  checkboxMaxDimensions: {
    width: 12,   // Checkbox piccola ma leggibile a 250 DPI
    height: 12,
    quality: 0.75
  },
  reportImageDimensions: {
    width: 800,  // Dimensioni compatte ma adeguate per 250 DPI (circa 8cm)
    height: 600, // Mantiene proporzioni 4:3
    quality: 0.8 // Qualità buona per 250 DPI
  },
  loadTimeout: 10000
};

/**
 * Configurazione per dimensioni file ridotte (pochi KB)
 */
export const compactImageConfig: ImageCompressionConfig = {
  ...defaultImageCompressionConfig,
  targetDPI: 250, // 250 DPI anche in modalità compatta
  defaultQuality: 0.8,
  logoMaxDimensions: {
    width: 45,
    height: 45,
    quality: 0.85
  },
  checkboxMaxDimensions: {
    width: 14,
    height: 14,
    quality: 0.8
  },
  reportImageDimensions: {
    width: 1000, // Dimensioni intermedie per 250 DPI (circa 10cm)
    height: 750, // Mantiene proporzioni 4:3
    quality: 0.9 // Qualità alta per 250 DPI
  }
}; 