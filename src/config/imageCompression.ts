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
  targetDPI: 150,
  defaultQuality: 0.75, // Qualità buona per 150 DPI
  logoMaxDimensions: {
    width: 32,   // Dimensione piccola per logo
    height: 32,  
    quality: 0.8 // Qualità decente per logo
  },
  checkboxMaxDimensions: {
    width: 10,   // Dimensione minima per checkbox
    height: 10,  
    quality: 0.7 // Qualità standard per checkbox
  },
  reportImageDimensions: {
    width: 800,  // Dimensioni corrette per 150 DPI (circa 13.5cm a 150 DPI)
    height: 600, // Altezza proporzionale (circa 10cm a 150 DPI)
    quality: 0.75 // Qualità buona per mantenere dettagli a 150 DPI
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
  targetDPI: 150,
  defaultQuality: 0.6, // Qualità accettabile anche in modalità compatta
  logoMaxDimensions: {
    width: 24,   // Logo minuscolo
    height: 24,
    quality: 0.7
  },
  checkboxMaxDimensions: {
    width: 8,    // Checkbox microscopica
    height: 8,
    quality: 0.6
  },
  reportImageDimensions: {
    width: 600,  // Dimensioni ridotte ma ancora adeguate per 150 DPI (circa 10cm)
    height: 450, // Mantiene proporzioni 4:3
    quality: 0.6 // Qualità sufficiente per 150 DPI
  },
  loadTimeout: 10000
};

/**
 * Configurazione per dimensioni file ridotte (pochi KB)
 */
export const compactImageConfig: ImageCompressionConfig = {
  ...defaultImageCompressionConfig,
  targetDPI: 150, // Mantiene 150 DPI anche in modalità compatta
  defaultQuality: 0.65,
  logoMaxDimensions: {
    width: 28,
    height: 28,
    quality: 0.75
  },
  checkboxMaxDimensions: {
    width: 8,
    height: 8,
    quality: 0.65
  },
  reportImageDimensions: {
    width: 700,  // Dimensioni intermedie per 150 DPI (circa 12cm)
    height: 525, // Mantiene proporzioni 4:3
    quality: 0.65 // Qualità intermedia per 150 DPI
  }
}; 