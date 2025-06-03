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
  defaultQuality: 0.3, // Qualità molto bassa per file piccoli
  logoMaxDimensions: {
    width: 32,   // Dimensione molto piccola per ridurre drasticamente il file
    height: 32,  // Dimensione molto piccola per ridurre drasticamente il file
    quality: 0.4 // Qualità bassa per compressione massima
  },
  checkboxMaxDimensions: {
    width: 10,   // Dimensione minima per checkbox
    height: 10,  // Dimensione minima per checkbox
    quality: 0.3 // Qualità molto bassa per checkbox
  },
  reportImageDimensions: {
    width: 400,  // Larghezza massima per immagini del report (ridotta da 5MB originali)
    height: 300, // Altezza massima per immagini del report
    quality: 0.3 // Qualità bassa per compressione massima
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
  defaultQuality: 0.2, // Qualità minima
  logoMaxDimensions: {
    width: 24,   // Logo minuscolo
    height: 24,
    quality: 0.3
  },
  checkboxMaxDimensions: {
    width: 8,    // Checkbox microscopica
    height: 8,
    quality: 0.2
  },
  reportImageDimensions: {
    width: 300,  // Immagini del report piccole per file ultra-compatto
    height: 200,
    quality: 0.2 // Qualità minima
  },
  loadTimeout: 10000
};

/**
 * Configurazione per dimensioni file ridotte (pochi KB)
 */
export const compactImageConfig: ImageCompressionConfig = {
  ...defaultImageCompressionConfig,
  targetDPI: 100,
  defaultQuality: 0.2,
  logoMaxDimensions: {
    width: 28,
    height: 28,
    quality: 0.3
  },
  checkboxMaxDimensions: {
    width: 8,
    height: 8,
    quality: 0.2
  },
  reportImageDimensions: {
    width: 350,  // Immagini del report per configurazione compatta
    height: 250,
    quality: 0.25
  }
}; 