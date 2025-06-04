import React, { useState, useRef } from 'react'
import FormInput from '../components/FormInput'
import CheckboxGroup from '../components/CheckboxGroup'
import FormLayout from '../components/FormLayout'
import Tabs from '../components/Tabs'
import PDFDownloadButton from '../components/PDFDownloadButton'
import ImageManager from '../components/ImageManager'
import { FormInputs, ImageData } from '../types/form'
import { colors, styling } from '../constants/theme'

const tabs = [
  { id: 'dati', label: 'Dati' },
  { id: 'immagini', label: 'Immagini' }
]

const tipoIspezioneOptions = [
  { id: 'visivo', label: 'Visivo' },
  { id: 'rilievo', label: 'Rilievo/Verifica misure' },
  { id: 'test', label: 'Test/Collaudo' },
  { id: 'altro', label: 'Altro' }
]

const esitoOptions = [
  { id: 'conforme', label: 'Conforme/Positivo' },
  { id: 'nonConforme', label: 'Non conforme' },
  { id: 'osservazione', label: 'Osservazione' }
]

const dlOptions = [
  { id: 'DLG', label: 'D.L. Generale' },
  { id: 'DLS', label: 'D.L. Strutture' },
  { id: 'DL_FACCIATE', label: 'D.L. Facciate' },
  { id: 'DL_ELETTRICI', label: 'D.L. Imp. Elettrici/Speciali' },
  { id: 'DL_MECCANICI', label: 'D.L. Imp. Meccanici' }
]

const getTodayDate = (): string => {
  const today = new Date();
  const year = today.getFullYear();
  const month = (today.getMonth() + 1).toString().padStart(2, '0');
  const day = today.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const FormPage: React.FC = () => {
  const [formData, setFormData] = useState<FormInputs>({
    dataIspezione: getTodayDate(),
    dataVerbale: getTodayDate(),
    numero: '001',
    nomeProgetto: 'XXXXX - Progetto di esempio',
    lavorazioneVerificata: '-',
    verificaMateriale: '-',
    riferimentoProgetto: '-',
    ubicazione: '-',
    schedaControllo: '-',
    oggettoSopralluogo: '-',
    ispettore:'Nome Cognome',
    images: [],
    tipoIspezione: {
      visivo: true,
      rilievo: false,
      test: false,
      altro: false,
    },
    esito: {
      conforme: true,
      nonConforme: false,
      osservazione: false,
    },
    dl: {
      DLG: false,
      DLS: true,
      DL_FACCIATE: false,
      DL_ELETTRICI: false,
      DL_MECCANICI: false,
    },
  })

  const [errors, setErrors] = useState<Partial<Record<keyof FormInputs, string>>>({})
  const [activeTab, setActiveTab] = useState('dati')
  const richTextRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Stato per tracciare le formattazioni attive
  const [activeFormats, setActiveFormats] = useState({
    bold: false,
    italic: false,
    underline: false
  })

  // Stato per debug PWA mobile
  const [debugLogs, setDebugLogs] = useState<string[]>([])
  const [showDebugPanel, setShowDebugPanel] = useState(false)

  // Funzione di logging per debug mobile
  const addDebugLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    const logMessage = `[${timestamp}] ${message}`
    console.log(logMessage)
    setDebugLogs(prev => [...prev.slice(-20), logMessage]) // Mantieni solo gli ultimi 20 log
  }

  // Funzione per convertire un File in base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  // Funzione per convertire base64 in File
  const base64ToFile = (base64: string, filename: string): File => {
    const arr = base64.split(',')
    const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg'
    const bstr = atob(arr[1])
    let n = bstr.length
    const u8arr = new Uint8Array(n)
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n)
    }
    return new File([u8arr], filename, { type: mime })
  }

  // Interfaccia per le immagini serializzabili
  interface SerializableImageData {
    id: string;
    fileData: string; // base64
    fileName: string;
    fileType: string;
    caption: string;
    rotation: number;
    timestamp: number;
  }

  // Funzione per preparare i dati da salvare (includendo le immagini)
  const prepareDataForSave = async () => {
    const { images, ...otherData } = formData
    
    addDebugLog(`PWA: Preparazione salvataggio - ${images.length} immagini da convertire`)
    addDebugLog(`PWA: User agent - ${navigator.userAgent}`)
    addDebugLog(`PWA: Is PWA - ${window.matchMedia('(display-mode: standalone)').matches}`)
    
    // Converti le immagini in formato serializzabile
    const serializableImages: SerializableImageData[] = []
    
    for (let i = 0; i < images.length; i++) {
      const image = images[i]
      try {
        addDebugLog(`PWA: Conversione immagine ${i + 1}/${images.length}: ${image.file.name} (${image.file.size} bytes)`)
        const base64Data = await fileToBase64(image.file)
        const base64Size = base64Data.length
        addDebugLog(`PWA: Immagine ${i + 1} convertita - Base64 size: ${base64Size} bytes`)
        
        serializableImages.push({
          id: image.id,
          fileData: base64Data,
          fileName: image.file.name,
          fileType: image.file.type,
          caption: image.caption,
          rotation: image.rotation,
          timestamp: image.timestamp
        })
        addDebugLog(`PWA: Immagine ${i + 1} aggiunta all'array`)
      } catch (error) {
        addDebugLog(`PWA: ERRORE conversione immagine ${i + 1}: ${error}`)
        // Continua con le altre immagini anche se una fallisce
      }
    }
    
    const totalDataSize = JSON.stringify({ ...otherData, images: serializableImages }).length
    addDebugLog(`PWA: Conversione completata - ${serializableImages.length}/${images.length} immagini - Dimensione totale: ${totalDataSize} bytes`)
    
    return {
      ...otherData,
      images: serializableImages
    }
  }

  // Funzioni per gestire IndexedDB
  const openDB = (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('VerbaleIspezioneBozze', 1)
      
      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result)
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result
        if (!db.objectStoreNames.contains('bozze')) {
          const store = db.createObjectStore('bozze', { keyPath: 'nomeProgetto' }) // Usa nomeProgetto come chiave
          store.createIndex('timestamp', 'timestamp', { unique: false })
        }
      }
    })
  }

  const saveDraftToCache = async (data: any): Promise<void> => {
    try {
      addDebugLog('PWA: Apertura database IndexedDB...')
      const db = await openDB()
      const transaction = db.transaction(['bozze'], 'readwrite')
      const store = transaction.objectStore('bozze')
      
      // Usa i primi 5 caratteri del nome progetto come identificatore
      const projectPrefix = (data.nomeProgetto || 'XXXXX').substring(0, 5).toUpperCase()
      
      const draftData = {
        nomeProgetto: projectPrefix, // Questa è ora la chiave primaria
        data: data,
        timestamp: Date.now(),
        nomeProgettoCompleto: data.nomeProgetto || 'Progetto senza nome',
        dataCreazione: new Date().toLocaleString('it-IT')
      }
      
      const dataSize = JSON.stringify(data).length
      addDebugLog(`PWA: Tentativo salvataggio - Progetto: ${projectPrefix}, Immagini: ${data.images ? data.images.length : 0}, Dimensione: ${dataSize} bytes`)
      
      // put() sovrascriverà automaticamente se esiste già una bozza con lo stesso nomeProgetto
      await store.put(draftData)
      addDebugLog('PWA: Bozza salvata/aggiornata in cache con successo!')
    } catch (error) {
      addDebugLog(`PWA: ERRORE nel salvataggio in cache: ${error}`)
      // Prova a salvare senza immagini se il salvataggio fallisce
      if (data.images && data.images.length > 0) {
        addDebugLog('PWA: Tentativo di salvataggio senza immagini...')
        try {
          const dataWithoutImages = { ...data, images: [] }
          const draftDataBackup = {
            nomeProgetto: (data.nomeProgetto || 'XXXXX').substring(0, 5).toUpperCase(),
            data: dataWithoutImages,
            timestamp: Date.now(),
            nomeProgettoCompleto: data.nomeProgetto || 'Progetto senza nome',
            dataCreazione: new Date().toLocaleString('it-IT')
          }
          
          const db = await openDB()
          const transaction = db.transaction(['bozze'], 'readwrite')
          const store = transaction.objectStore('bozze')
          await store.put(draftDataBackup)
          addDebugLog('PWA: Salvataggio senza immagini riuscito')
        } catch (backupError) {
          addDebugLog(`PWA: ERRORE anche nel salvataggio di backup: ${backupError}`)
        }
      }
    }
  }

  const loadDraftsFromCache = async (): Promise<any[]> => {
    try {
      const db = await openDB()
      const transaction = db.transaction(['bozze'], 'readonly')
      const store = transaction.objectStore('bozze')
      
      return new Promise((resolve, reject) => {
        const request = store.getAll()
        request.onsuccess = () => resolve(request.result)
        request.onerror = () => reject(request.error)
      })
    } catch (error) {
      console.error('Errore nel caricamento delle bozze:', error)
      return []
    }
  }

  const deleteDraftFromCache = async (nomeProgetto: string): Promise<void> => {
    try {
      const db = await openDB()
      const transaction = db.transaction(['bozze'], 'readwrite')
      const store = transaction.objectStore('bozze')
      
      await store.delete(nomeProgetto)
      console.log('Bozza eliminata dalla cache:', nomeProgetto)
    } catch (error) {
      console.error('Errore nell\'eliminazione della bozza:', error)
    }
  }

  // Funzione per esportare l'intera cache
  const exportCache = async () => {
    try {
      const drafts = await loadDraftsFromCache()
      const exportData = {
        version: '1.0',
        timestamp: Date.now(),
        dataEsportazione: new Date().toLocaleString('it-IT'),
        bozze: drafts
      }
      
      const jsonData = JSON.stringify(exportData, null, 2)
      const fileName = `VerbaliCache_${new Date().toISOString().split('T')[0]}.json`

      // Prova prima con File System Access API (desktop Chrome/Edge)
      if ('showSaveFilePicker' in window) {
        const fileHandle = await (window as any).showSaveFilePicker({
          suggestedName: fileName,
          types: [{
            description: 'Cache Verbali',
            accept: { 'application/json': ['.json'] }
          }]
        })
        const writable = await fileHandle.createWritable()
        await writable.write(jsonData)
        await writable.close()
        alert('Cache esportata con successo!')
      } else {
        // Fallback per PWA e altri browser
        const blob = new Blob([jsonData], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = fileName
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
        alert('Cache esportata con successo!')
      }
    } catch (error) {
      console.error('Errore nell\'esportazione:', error)
      alert('Errore durante l\'esportazione della cache')
    }
  }

  // Funzione per importare e sostituire la cache
  const importCache = async (data: any) => {
    try {
      if (!data.bozze || !Array.isArray(data.bozze)) {
        throw new Error('Formato file non valido')
      }

      const db = await openDB()
      const transaction = db.transaction(['bozze'], 'readwrite')
      const store = transaction.objectStore('bozze')
      
      // Pulisci la cache esistente
      await store.clear()
      
      // Importa tutte le bozze
      for (const draft of data.bozze) {
        await store.put(draft)
      }
      
      // Aggiorna la lista delle bozze
      const updatedDrafts = await loadDraftsFromCache()
      setCachedDrafts(updatedDrafts)
      
      alert(`Cache importata con successo! ${data.bozze.length} bozze caricate.`)
    } catch (error) {
      console.error('Errore nell\'importazione:', error)
      alert('Errore durante l\'importazione della cache. Verifica il formato del file.')
    }
  }

  // Stato per gestire le bozze in cache
  const [cachedDrafts, setCachedDrafts] = useState<any[]>([])
  const [showDraftsList, setShowDraftsList] = useState(false)

  // Carica le bozze dalla cache all'avvio
  React.useEffect(() => {
    loadDraftsFromCache().then(setCachedDrafts)
  }, [])

  // Funzione per salvare i dati come file .sav
  const saveDataToFile = async (automatic: boolean = false) => {
    const dataToSave = await prepareDataForSave()

    if (automatic) {
      // Salvataggio automatico in cache (quando si scarica PDF)
      await saveDraftToCache(dataToSave)
      // Aggiorna la lista delle bozze
      const updatedDrafts = await loadDraftsFromCache()
      setCachedDrafts(updatedDrafts)
    } else {
      // Esporta la cache corrente
      await exportCache()
    }
  }

  // Funzione per caricare una bozza dalla cache
  const loadDraftFromCache = async (nomeProgetto: string) => {
    try {
      const db = await openDB()
      const transaction = db.transaction(['bozze'], 'readonly')
      const store = transaction.objectStore('bozze')
      
      const request = store.get(nomeProgetto)
      request.onsuccess = async () => {
        const draft = request.result
        if (draft) {
          await restoreFormData(draft.data)
          setShowDraftsList(false)
          alert('Bozza caricata dalla cache!')
        }
      }
    } catch (error) {
      console.error('Errore nel caricamento della bozza:', error)
      alert('Errore durante il caricamento della bozza')
    }
  }

  // Funzione per ripristinare i dati del form (estratta per riuso)
  const restoreFormData = async (loadedData: any) => {
    // Riconverti le immagini da base64 a File
    const restoredImages: ImageData[] = []
    
    if (loadedData.images && Array.isArray(loadedData.images)) {
      for (const serializableImage of loadedData.images as SerializableImageData[]) {
        try {
          const file = base64ToFile(serializableImage.fileData, serializableImage.fileName)
          const preview = URL.createObjectURL(file)
          
          restoredImages.push({
            id: serializableImage.id,
            file: file,
            preview: preview,
            caption: serializableImage.caption,
            rotation: serializableImage.rotation,
            timestamp: serializableImage.timestamp
          })
        } catch (error) {
          console.error('Errore nel ripristino dell\'immagine:', error)
        }
      }
    }
    
    const newFormData: FormInputs = {
      ...loadedData,
      images: restoredImages
    }
    
    setFormData(newFormData)
    
    // Aggiorna l'editor rich text
    setTimeout(() => {
      const editor = richTextRef.current
      if (editor && newFormData.oggettoSopralluogo && newFormData.oggettoSopralluogo !== '-') {
        const htmlContent = newFormData.oggettoSopralluogo
          .replace(/<b>/g, '<strong>')
          .replace(/<\/b>/g, '</strong>')
          .replace(/<i>/g, '<em>')
          .replace(/<\/i>/g, '</em>')
          .replace(/<u>/g, '<span style="text-decoration: underline;">')
          .replace(/<\/u>/g, '</span>')
          .replace(/\n/g, '<br>')
        
        editor.innerHTML = htmlContent
      }
    }, 100)
  }

  // Funzione per caricare i dati da file di cache esportato
  const loadDataFromFile = async (file: File) => {
    try {
      const text = await file.text()
      const loadedData = JSON.parse(text)
      
      await importCache(loadedData)
    } catch (error) {
      console.error('Errore nel caricamento:', error)
      alert('Errore durante il caricamento del file cache. Assicurati che il file sia valido.')
    }
  }

  // Handler per il pulsante "Importa Cache"
  const handleImportDraft = async () => {
    try {
      // Prova prima con File System Access API (desktop Chrome/Edge)
      if ('showOpenFilePicker' in window) {
        const [fileHandle] = await (window as any).showOpenFilePicker({
          types: [{
            description: 'File cache verbali',
            accept: { 'application/json': ['.json'] }
          }],
          multiple: false
        })
        const file = await fileHandle.getFile()
        await loadDataFromFile(file)
      } else {
        // Fallback per PWA e altri browser
        if (fileInputRef.current) {
          fileInputRef.current.click()
        }
      }
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        console.error('Errore nell\'apertura del file:', error)
        alert('Errore durante l\'apertura del file')
      }
    }
  }

  // Handler per l'input file (fallback)
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      loadDataFromFile(file)
      // Reset dell'input per permettere di selezionare lo stesso file di nuovo
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof FormInputs, string>> = {}
    let isValid = true

    const requiredFields: (keyof FormInputs)[] = [
      'dataIspezione',
      'dataVerbale',
      'numero',
      'nomeProgetto',
      'lavorazioneVerificata',
      'verificaMateriale',
      'riferimentoProgetto',
      'ubicazione',
      'schedaControllo',
      'oggettoSopralluogo',
      'ispettore'
    ]

    requiredFields.forEach(field => {
      if (!formData[field]) {
        newErrors[field] = 'Campo obbligatorio'
        isValid = false
      }
    })

    setErrors(newErrors)
    return isValid
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      console.log('Form valido:', formData)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleCheckboxChange = (section: 'tipoIspezione' | 'esito' | 'dl', field: string) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...(section === 'dl' 
          ? Object.fromEntries(Object.keys(prev[section]).map(key => [key, false]))
          : prev[section]
        ),
        [field]: section === 'dl' ? true : !prev[section][field as keyof typeof prev[typeof section]]
      }
    }))
  }

  const handleImagesChange = (images: ImageData[]) => {
    setFormData(prev => ({
      ...prev,
      images
    }))
  }

  // Funzione per aggiornare formData dal contenuto dell'editor
  const updateFormDataFromEditor = () => {
    const editor = richTextRef.current
    if (!editor) return

    // Ottieni il contenuto HTML grezzo
    const htmlContent = editor.innerHTML
    
    console.log('Editor HTML content:', htmlContent)
    
    // Converte gli elementi HTML in tag semplici
    let cleanedContent = htmlContent
      .replace(/<strong[^>]*>/g, '<b>')
      .replace(/<\/strong>/g, '</b>')
      .replace(/<em[^>]*>/g, '<i>')
      .replace(/<\/em>/g, '</i>')
      .replace(/<span[^>]*style="[^"]*text-decoration:[^"]*underline[^"]*"[^>]*>/g, '<u>')
      .replace(/<span[^>]*style="[^"]*text-decoration-line:[^"]*underline[^"]*"[^>]*>/g, '<u>')
      .replace(/<\/span>/g, '</u>')
      .replace(/<div[^>]*>/g, '\n')
      .replace(/<\/div>/g, '')
      .replace(/<br\s*\/?>/g, '\n')
      .replace(/&nbsp;/g, ' ')
      .trim()

    // Rimuovi tag HTML rimanenti DOPO aver convertito quelli che ci interessano
    cleanedContent = cleanedContent.replace(/<(?!\/?[biu]>)[^>]*>/g, '')
    
    console.log('Cleaned content for PDF:', cleanedContent)

    setFormData(prev => ({
      ...prev,
      oggettoSopralluogo: cleanedContent
    }))
  }

  // Gestione del contenuto dell'editor - previene il loop di re-rendering
  const handleEditorInput = () => {
    // Aggiorna solo se necessario
    setTimeout(() => {
      updateFormDataFromEditor()
    }, 0)
  }

  // Funzione per controllare le formattazioni attive nella posizione del cursore
  const checkActiveFormats = () => {
    const editor = richTextRef.current
    if (!editor) return

    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0) return

    // Usa queryCommandState per verificare lo stato dei comandi
    const bold = document.queryCommandState('bold')
    const italic = document.queryCommandState('italic')
    const underline = document.queryCommandState('underline')

    setActiveFormats({
      bold,
      italic,
      underline
    })
  }

  // Gestione della selezione per aggiornare lo stato dei pulsanti
  const handleEditorSelection = () => {
    setTimeout(() => {
      checkActiveFormats()
    }, 0)
  }

  // Funzioni per i pulsanti di formattazione (aggiornate con controllo stato)
  const handleBold = () => {
    document.execCommand('bold', false)
    updateFormDataFromEditor()
    setTimeout(() => {
      checkActiveFormats()
    }, 0)
  }

  const handleItalic = () => {
    document.execCommand('italic', false)
    updateFormDataFromEditor()
    setTimeout(() => {
      checkActiveFormats()
    }, 0)
  }

  const handleUnderline = () => {
    document.execCommand('underline', false)
    updateFormDataFromEditor()
    setTimeout(() => {
      checkActiveFormats()
    }, 0)
  }

  // Inizializza il contenuto dell'editor quando il componente viene montato
  React.useEffect(() => {
    const editor = richTextRef.current
    if (!editor || !formData.oggettoSopralluogo || formData.oggettoSopralluogo === '-') return

    // Imposta il contenuto solo se l'editor è vuoto
    if (editor.innerHTML === '' || editor.innerHTML === '<br>' || editor.innerHTML === '<div><br></div>') {
      const htmlContent = formData.oggettoSopralluogo
        .replace(/<b>/g, '<strong>')
        .replace(/<\/b>/g, '</strong>')
        .replace(/<i>/g, '<em>')
        .replace(/<\/i>/g, '</em>')
        .replace(/<u>/g, '<span style="text-decoration: underline;">')
        .replace(/<\/u>/g, '</span>')
        .replace(/\n/g, '<br>')
      
      editor.innerHTML = htmlContent
    }
  }, [])

  return (
    <FormLayout colors={colors} styling={styling}>
      <h2 className="text-2xl font-bold mb-8 text-center" style={{ color: colors.primary }}>
        Verbale di Ispezione
      </h2>

      <Tabs
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        colors={colors}
      />

      {activeTab === 'dati' && (
        <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
            <FormInput
              label="Data Ispezione"
              name="dataIspezione"
              value={formData.dataIspezione}
              onChange={handleInputChange}
              error={errors.dataIspezione}
              type="date"
              colors={colors}
              styling={styling}
            />

            <FormInput
              label="Data Verbale"
              name="dataVerbale"
              value={formData.dataVerbale}
              onChange={handleInputChange}
              error={errors.dataVerbale}
              type="date"
              colors={colors}
              styling={styling}
            />

            <FormInput
              label="Numero"
              name="numero"
              value={formData.numero}
              onChange={handleInputChange}
              error={errors.numero}
              colors={colors}
              styling={styling}
            />

            <FormInput
              label="Nome Progetto"
              name="nomeProgetto"
              value={formData.nomeProgetto}
              onChange={handleInputChange}
              error={errors.nomeProgetto}
              colors={colors}
              styling={styling}
            />

            <FormInput
              label="Lavorazione Verificata"
              name="lavorazioneVerificata"
              value={formData.lavorazioneVerificata}
              onChange={handleInputChange}
              error={errors.lavorazioneVerificata}
              colors={colors}
              styling={styling}
            />

            <FormInput
              label="Verifica Materiale"
              name="verificaMateriale"
              value={formData.verificaMateriale}
              onChange={handleInputChange}
              error={errors.verificaMateriale}
              colors={colors}
              styling={styling}
            />

            <FormInput
              label="Riferimento Progetto"
              name="riferimentoProgetto"
              value={formData.riferimentoProgetto}
              onChange={handleInputChange}
              error={errors.riferimentoProgetto}
              colors={colors}
              styling={styling}
            />

            <FormInput
              label="Ubicazione"
              name="ubicazione"
              value={formData.ubicazione}
              onChange={handleInputChange}
              error={errors.ubicazione}
              colors={colors}
              styling={styling}
            />

            <FormInput
              label="Scheda Controllo"
              name="schedaControllo"
              value={formData.schedaControllo}
              onChange={handleInputChange}
              error={errors.schedaControllo}
              colors={colors}
              styling={styling}
            />
            <FormInput
              label="Ispettore"
              name="ispettore"
              value={formData.ispettore}
              onChange={handleInputChange}
              error={errors.ispettore}
              colors={colors}
              styling={styling}
            />
          </div>

          <div className="mt-8">
            {/* Pulsanti di formattazione */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2" style={{ color: colors.on_surface }}>
                Oggetto del Sopralluogo
              </label>
              <div className="flex space-x-2 mb-2">
                <button
                  type="button"
                  onClick={handleBold}
                  className="px-3 py-1 text-sm font-bold border rounded hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                  style={{ 
                    borderColor: colors.outline,
                    color: colors.on_surface,
                    backgroundColor: activeFormats.bold ? '#fbbf24' : colors.surface_variant
                  }}
                  title="Grassetto"
                >
                  B
                </button>
                <button
                  type="button"
                  onClick={handleItalic}
                  className="px-3 py-1 text-sm italic border rounded hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                  style={{ 
                    borderColor: colors.outline,
                    color: colors.on_surface,
                    backgroundColor: activeFormats.italic ? '#fbbf24' : colors.surface_variant
                  }}
                  title="Corsivo"
                >
                  I
                </button>
                <button
                  type="button"
                  onClick={handleUnderline}
                  className="px-3 py-1 text-sm underline border rounded hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                  style={{ 
                    borderColor: colors.outline,
                    color: colors.on_surface,
                    backgroundColor: activeFormats.underline ? '#fbbf24' : colors.surface_variant
                  }}
                  title="Sottolineato"
                >
                  U
                </button>
              </div>
            </div>
            
            {/* Rich Text Editor */}
            <div className="mb-4">
              <div
                ref={richTextRef}
                contentEditable
                onInput={handleEditorInput}
                onMouseUp={handleEditorSelection}
                onKeyUp={handleEditorSelection}
                onFocus={handleEditorSelection}
                className="mt-1 ml-3 block w-full rounded-md shadow-sm focus:border-red-500 focus:ring-red-500"
                style={{
                  borderColor: errors.oggettoSopralluogo ? colors.error : colors.outline,
                  borderWidth: styling.border_width,
                  borderStyle: 'solid',
                  borderRadius: styling.corner_radius,
                  padding: `${styling.field_padding_y}px ${styling.field_padding_x}px`,
                  backgroundColor: colors.surface,
                  color: colors.on_surface,
                  outline: 'none',
                  transition: 'all 0.2s',
                  marginLeft: styling.margin,
                  marginBottom: styling.margin,
                  minHeight: '120px',
                  lineHeight: '1.5',
                  direction: 'ltr',
                  textAlign: 'left'
                }}
                suppressContentEditableWarning={true}
              />
              {errors.oggettoSopralluogo && (
                <p className="text-sm mt-1" style={{ color: colors.error }}>
                  {errors.oggettoSopralluogo}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-8 gap-y-4 mt-8">
            <CheckboxGroup
              title="Tipo Ispezione"
              options={tipoIspezioneOptions}
              values={formData.tipoIspezione}
              onChange={(field) => handleCheckboxChange('tipoIspezione', field)}
              colors={colors}
            />

            <CheckboxGroup
              title="Esito"
              options={esitoOptions}
              values={formData.esito}
              onChange={(field) => handleCheckboxChange('esito', field)}
              colors={colors}
            />

            <CheckboxGroup
              title="D.L."
              options={dlOptions}
              values={formData.dl}
              onChange={(field) => handleCheckboxChange('dl', field)}
              colors={colors}
            />
          </div>

          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4 mt-16">
            <button
              type="submit"
              className="w-full sm:w-auto bg-red-700 text-white px-6 py-2 rounded-md hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              Genera Documento
            </button>
            
            <button
              type="button"
              onClick={() => saveDataToFile(false)}
              className="w-full sm:w-auto bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Esporta Cache
            </button>
            
            <button
              type="button"
              onClick={() => setShowDraftsList(!showDraftsList)}
              className="w-full sm:w-auto bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            >
              Bozze Salvate ({cachedDrafts.length})
            </button>
            
            <button
              type="button"
              onClick={handleImportDraft}
              className="w-full sm:w-auto bg-purple-600 text-white px-6 py-2 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
            >
              Importa Cache
            </button>
            
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="w-full sm:w-auto bg-gray-200 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              Cancella Campi
            </button>
            
            <button
              type="button"
              onClick={() => setShowDebugPanel(!showDebugPanel)}
              className="w-full sm:w-auto bg-yellow-600 text-white px-6 py-2 rounded-md hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2"
            >
              Debug PWA
            </button>
          </div>
          
          {/* Lista delle bozze salvate */}
          {showDraftsList && (
            <div className="mt-8 p-4 border border-gray-300 rounded-md bg-gray-50">
              <h3 className="text-lg font-semibold mb-4" style={{ color: colors.primary }}>
                Bozze Salvate in Cache
              </h3>
              {cachedDrafts.length === 0 ? (
                <p className="text-gray-500">Nessuna bozza salvata</p>
              ) : (
                <div className="space-y-2">
                  {cachedDrafts.map((draft) => (
                    <div
                      key={draft.nomeProgetto}
                      className="flex items-center justify-between p-3 bg-white border rounded-md"
                    >
                      <div className="flex-1">
                        <div className="font-medium">{draft.nomeProgettoCompleto}</div>
                        <div className="text-sm text-gray-500">
                          Salvato il: {draft.dataCreazione}
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => loadDraftFromCache(draft.nomeProgetto)}
                          className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                        >
                          Carica
                        </button>
                        <button
                          onClick={async () => {
                            await deleteDraftFromCache(draft.nomeProgetto)
                            const updatedDrafts = await loadDraftsFromCache()
                            setCachedDrafts(updatedDrafts)
                          }}
                          className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                        >
                          Elimina
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          
          {/* Pannello di debug PWA */}
          {showDebugPanel && (
            <div className="mt-8 p-4 border border-yellow-400 rounded-md bg-yellow-50">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-yellow-800">
                  Debug Log PWA
                </h3>
                <button
                  onClick={() => setDebugLogs([])}
                  className="px-3 py-1 text-sm bg-yellow-600 text-white rounded hover:bg-yellow-700"
                >
                  Pulisci Log
                </button>
              </div>
              
              <div className="bg-black text-green-400 p-3 rounded text-xs font-mono h-64 overflow-y-auto">
                {debugLogs.length === 0 ? (
                  <div className="text-gray-500">Nessun log ancora...</div>
                ) : (
                  debugLogs.map((log, index) => (
                    <div key={index} className="mb-1 break-words">
                      {log}
                    </div>
                  ))
                )}
              </div>
              
              <div className="mt-4 text-sm text-yellow-700">
                <div><strong>Info dispositivo:</strong></div>
                <div>User Agent: {navigator.userAgent.substring(0, 100)}...</div>
                <div>PWA Mode: {window.matchMedia('(display-mode: standalone)').matches ? 'Sì' : 'No'}</div>
                <div>IndexedDB: {typeof indexedDB !== 'undefined' ? 'Supportato' : 'Non supportato'}</div>
                <div>Storage Quota: {'storage' in navigator && 'estimate' in navigator.storage ? 'Disponibile' : 'Non disponibile'}</div>
              </div>
            </div>
          )}
          
          {/* Input file nascosto per il fallback */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileInputChange}
            style={{ display: 'none' }}
          />
        </form>
      )}

      {activeTab === 'immagini' && (
        <div className="space-y-6">
          <ImageManager
            images={formData.images}
            onImagesChange={handleImagesChange}
            colors={colors}
          />
        </div>
      )}
    
      {formData && activeTab === 'dati' && (
        <div className="text-center" style={{ marginTop: 40 }}>
          <PDFDownloadButton
            data={formData}
            onDownload={() => saveDataToFile(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          >
            Scarica PDF
          </PDFDownloadButton>
        </div>
      )}
    </FormLayout>
  )
}

export default FormPage 