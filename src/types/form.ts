export interface ImageData {
  id: string;
  file: File;
  preview: string; // URL.createObjectURL per l'anteprima
  caption: string;
  rotation: number; // 0, 90, 180, 270 gradi
  timestamp: number;
}

export interface FormInputs {
  dataIspezione: string;
  dataVerbale: string;
  numero: string;
  numeroCommessa: string;
  nomeProgetto: string;
  lavorazioneVerificata: string;
  verificaMateriale: string;
  riferimentoProgetto: string;
  ubicazione: string;
  schedaControllo: string;
  oggettoSopralluogo: string;
  ispettore: string;
  images: ImageData[]; // Aggiungo array delle immagini
  tipoIspezione: {
    visivo: boolean;
    rilievo: boolean;
    test: boolean;
    altro: boolean;
  };
  esito: {
    conforme: boolean;
    nonConforme: boolean;
    osservazione: boolean;
  };
  dl: {
    DLG: boolean;
    DLS: boolean;
    COLLAUDATORE: boolean;
    DL_FACCIATE: boolean;
    DL_ELETTRICI: boolean;
    DL_MECCANICI: boolean;
  };
} 