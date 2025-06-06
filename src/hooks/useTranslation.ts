import { useState, useCallback } from 'react'

export type Language = 'it' | 'en'

interface Translations {
  [key: string]: {
    it: string
    en: string
  }
}

// Dizionario delle traduzioni
const translations: Translations = {
  // Titoli principali
  'scheda_verifica': {
    it: 'SCHEDA DI VERIFICA',
    en: 'VERIFICATION FORM'
  },
  'posa_installazione': {
    it: 'Posa/Installazione/Lavoro',
    en: 'Installation/Work'
  },
  
  // Sezioni
  'progetto': {
    it: 'PROGETTO',
    en: 'PROJECT'
  },
  'metodo_verifica': {
    it: 'METODO DI VERIFICA',
    en: 'VERIFICATION METHOD'
  },
  'oggetto_sopralluogo': {
    it: 'OGGETTO DEL SOPRALLUOGO',
    en: 'INSPECTION SUBJECT'
  },
  'esito_controllo': {
    it: 'ESITO CONTROLLO',
    en: 'CONTROL RESULT'
  },
  
  // Campi form
  'data_ispezione': {
    it: 'Data ispezione',
    en: 'Inspection date'
  },
  'n_progressivo': {
    it: 'N. progressivo',
    en: 'Progressive number'
  },
  'lavorazione_verificata': {
    it: 'Lavorazione Verificata',
    en: 'Verified Work'
  },
  'verifica_materiale': {
    it: 'Verifica materiale previsto',
    en: 'Expected material verification'
  },
  'riferimento_progetto': {
    it: 'Riferimento Progetto costruttivo',
    en: 'Constructive project reference'
  },
  'ubicazione': {
    it: 'Ubicazione - Localizzazione',
    en: 'Location - Localization'
  },
  'scheda_controllo': {
    it: 'Scheda controllo lavorazione',
    en: 'Work control sheet'
  },
  
  // Metodi ispezione
  'visivo': {
    it: 'Visivo',
    en: 'Visual'
  },
  'rilievo_misure': {
    it: 'Rilievo/Verifica misure',
    en: 'Survey/Measurement verification'
  },
  'test_collaudo': {
    it: 'Test/Collaudo',
    en: 'Test/Commissioning'
  },
  'altro': {
    it: 'Altro',
    en: 'Other'
  },
  
  // Esiti
  'conforme_positivo': {
    it: 'Conforme/Positivo',
    en: 'Compliant/Positive'
  },
  'non_conforme': {
    it: 'Non conforme',
    en: 'Non-compliant'
  },
  'osservazione': {
    it: 'Osservazione',
    en: 'Observation'
  },
  
  // Note
  'nota_osservazione': {
    it: '* Tale osservazione è da considerarsi prescrittiva – da ottemperare',
    en: '* This observation is to be considered mandatory – to be complied with'
  },
  
  // Firme
  'data_verbale': {
    it: 'Data verbale',
    en: 'Report date'
  },
  'ispettore': {
    it: 'Ispettore',
    en: 'Inspector'
  },
  'per_conto_di': {
    it: 'Per conto di',
    en: 'On behalf of'
  },
  'firma': {
    it: 'Firma',
    en: 'Signature'
  },
  
  // Footer PDF
  'footer_pdf': {
    it: 'Redesco Progetti srl - Scheda di Verifica | Pagina',
    en: 'Redesco Progetti srl - Verification Form | Page'
  },
  'di': {
    it: 'di',
    en: 'of'
  },
  
  // DL Labels
  'dl_generale': {
    it: 'D.L. Generale',
    en: 'General D.L.'
  },
  'dl_strutture': {
    it: 'D.L. Strutture',
    en: 'Structures D.L.'
  },
  'dl_facciate': {
    it: 'D.L. Facciate',
    en: 'Facades D.L.'
  },
  'dl_elettrici': {
    it: 'D.L. Imp. Elettrici/Speciali',
    en: 'D.L. Electrical/Special Systems'
  },
  'dl_meccanici': {
    it: 'D.L. Imp. Meccanici',
    en: 'D.L. Mechanical Systems'
  },
  
  // Didascalie immagini
  'figura': {
    it: 'Figura',
    en: 'Figure'
  },
  
  // UI Form labels
  'verbale_ispezione': {
    it: 'Verbale di Ispezione',
    en: 'Inspection Report'
  },
  'lingua': {
    it: 'Lingua',
    en: 'Language'
  },
  'azienda': {
    it: 'Azienda',
    en: 'Company'
  },
  'numero': {
    it: 'Numero',
    en: 'Number'
  },
  'nome_progetto': {
    it: 'Nome Progetto',
    en: 'Project Name'
  },
  'lavorazione_verificata_label': {
    it: 'Lavorazione Verificata',
    en: 'Verified Work'
  },
  'verifica_materiale_label': {
    it: 'Verifica Materiale',
    en: 'Material Verification'
  },
  'riferimento_progetto_label': {
    it: 'Riferimento Progetto',
    en: 'Project Reference'
  },
  'ubicazione_label': {
    it: 'Ubicazione',
    en: 'Location'
  },
  'scheda_controllo_label': {
    it: 'Scheda Controllo',
    en: 'Control Sheet'
  },
  'ispettore_label': {
    it: 'Ispettore',
    en: 'Inspector'
  },
  'oggetto_sopralluogo_label': {
    it: 'Oggetto del Sopralluogo',
    en: 'Inspection Subject'
  },
  
  // Sezioni form
  'tipo_ispezione': {
    it: 'Tipo Ispezione',
    en: 'Inspection Type'
  },
  'esito': {
    it: 'Esito',
    en: 'Result'
  },
  'dl': {
    it: 'D.L.',
    en: 'D.L.'
  },
  
  // Tab
  'tab_dati': {
    it: 'Dati',
    en: 'Data'
  },
  'tab_immagini': {
    it: 'Immagini',
    en: 'Images'
  },
  
  // Pulsanti
  'genera_documento': {
    it: 'Genera Documento',
    en: 'Generate Document'
  },
  'esporta_cache': {
    it: 'Esporta Cache',
    en: 'Export Cache'
  },
  'bozze_salvate': {
    it: 'Bozze Salvate',
    en: 'Saved Drafts'
  },
  'importa_cache': {
    it: 'Importa Cache',
    en: 'Import Cache'
  },
  'cancella_campi': {
    it: 'Cancella Campi',
    en: 'Clear Fields'
  },
  'scarica_pdf': {
    it: 'Scarica PDF',
    en: 'Download PDF'
  },
  
  // Pulsanti formattazione
  'grassetto': {
    it: 'Grassetto',
    en: 'Bold'
  },
  'corsivo': {
    it: 'Corsivo',
    en: 'Italic'
  },
  'sottolineato': {
    it: 'Sottolineato',
    en: 'Underlined'
  },
  
  // Messaggi bozze
  'bozze_salvate_cache': {
    it: 'Bozze Salvate in Cache',
    en: 'Saved Drafts in Cache'
  },
  'nessuna_bozza': {
    it: 'Nessuna bozza salvata',
    en: 'No saved drafts'
  },
  'salvato_il': {
    it: 'Salvato il',
    en: 'Saved on'
  },
  'carica': {
    it: 'Carica',
    en: 'Load'
  },
  'elimina': {
    it: 'Elimina',
    en: 'Delete'
  },
  
  // Stati PDF
  'generazione_pdf': {
    it: 'Generazione PDF...',
    en: 'Generating PDF...'
  }
}

export const useTranslation = () => {
  const [language, setLanguage] = useState<Language>('it')

  const t = useCallback((key: string): string => {
    return translations[key]?.[language] || key
  }, [language])

  const changeLanguage = useCallback((newLanguage: Language) => {
    setLanguage(newLanguage)
  }, [])

  return {
    language,
    changeLanguage,
    t
  }
} 