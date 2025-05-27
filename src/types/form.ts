export interface FormInputs {
  dataIspezione: string;
  dataVerbale: string;
  numero: string;
  nomeProgetto: string;
  lavorazioneVerificata: string;
  verificaMateriale: string;
  riferimentoProgetto: string;
  ubicazione: string;
  schedaControllo: string;
  oggettoSopralluogo: string;
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
    DL_FACCIATE: boolean;
    DL_ELETTRICI: boolean;
    DL_MECCANICI: boolean;
  };
} 