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
    generale: boolean;
    strutture: boolean;
    facciate: boolean;
    elettrici: boolean;
    meccanici: boolean;
  };
} 