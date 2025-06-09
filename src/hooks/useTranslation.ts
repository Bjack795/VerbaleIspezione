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
    en: 'INSPECTION REPORT'
  },
  'posa_installazione': {
    it: 'Posa/Installazione/Lavoro',
    en: 'Installation/Works'
  },
  
  // Sezioni
  'progetto': {
    it: 'PROGETTO',
    en: 'PROJECT'
  },
  'metodo_verifica': {
    it: 'METODO DI VERIFICA',
    en: 'CHECKING METHODS'
  },
  'oggetto_sopralluogo': {
    it: 'OGGETTO DEL SOPRALLUOGO',
    en: 'DESCRIPTION'
  },
  'esito_controllo': {
    it: 'ESITO CONTROLLO',
    en: 'CHECK RESULT'
  },
  
  // Campi form
  'data_ispezione': {
    it: 'Data ispezione',
    en: 'Inspection date'
  },
  'n_progressivo': {
    it: 'N. progressivo',
    en: 'Number'
  },
  'lavorazione_verificata': {
    it: 'Lavorazione Verificata',
    en: 'Inspected works'
  },
  'verifica_materiale': {
    it: 'Verifica materiale previsto',
    en: 'Material check'
  },
  'riferimento_progetto': {
    it: 'Riferimento Progetto costruttivo',
    en: 'Shop drawings reference'
  },
  'ubicazione': {
    it: 'Ubicazione - Localizzazione',
    en: 'Location'
  },
  'scheda_controllo': {
    it: 'Scheda controllo lavorazione',
    en: 'Checklist'
  },
  
  // Metodi ispezione
  'visivo': {
    it: 'Visivo',
    en: 'Visual'
  },
  'rilievo_misure': {
    it: 'Rilievo/Verifica misure',
    en: 'Survey/Measurements'
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
    en: 'Conformant/Positive'
  },
  'non_conforme': {
    it: 'Non conforme',
    en: 'Non-conformant'
  },
  'osservazione': {
    it: 'Osservazione',
    en: 'Observation'
  },
  
  // Note
  'nota_osservazione': {
    it: '* Tale osservazione è da considerarsi prescrittiva – da ottemperare',
    en: '* Please consider this observation as a prescription, it must be followed'
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
    en: 'Redesco Progetti srl - Inspection Report | Page'
  },
  'di': {
    it: 'di',
    en: 'of'
  },
  
  // DL Labels
  'DLG': {
    it: 'DLG',
    en: 'Gen. COW'
  },
  'DLS': {
    it: 'DLS',
    en: 'Struct. COW'
  },
  'Collaudatore': {
    it: 'Collaudatore',
    en: 'Static Tester'
  },
  'dl_facciate': {
    it: 'DL Facciate',
    en: 'Facades COW'
  },
  'dl_elettrici': {
    it: 'DLI Ele.',
    en: 'Elec. COW'
  },
  'dl_meccanici': {
    it: 'DLI Mec.',
    en: 'Mech. COW'
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
  'numero_commessa': {
    it: 'Numero Commessa',
    en: 'Order Number'
  },
  'nome_progetto': {
    it: 'Nome Progetto',
    en: 'Project Name'
  },
  'lavorazione_verificata_label': {
    it: 'Lavorazione Verificata',
    en: 'Inspected works'
  },
  'verifica_materiale_label': {
    it: 'Verifica Materiale',
    en: 'Material check'
  },
  'riferimento_progetto_label': {
    it: 'Riferimento Progetto',
    en: 'Shop drawings reference'
  },
  'ubicazione_label': {
    it: 'Ubicazione',
    en: 'Location'
  },
  'scheda_controllo_label': {
    it: 'Scheda Controllo',
    en: 'Checklist'
  },
  'ispettore_label': {
    it: 'Ispettore',
    en: 'Inspector'
  },
  'oggetto_sopralluogo_label': {
    it: 'Oggetto del Sopralluogo',
    en: 'Description'
  },
  
  // Sezioni form
  'tipo_ispezione': {
    it: 'Tipo Ispezione',
    en: 'Inspection type'
  },
  'esito': {
    it: 'Esito',
    en: 'Result'
  },
  'dl': {
    it: 'In qualità di',
    en: 'As'
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
  'scarica_bozza': {
    it: 'Scarica Bozza',
    en: 'Download Draft'
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