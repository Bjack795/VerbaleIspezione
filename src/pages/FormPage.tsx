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
    nomeProgetto: 'XXX - Progetto di esempio',
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

  // Stato per tracciare le formattazioni attive
  const [activeFormats, setActiveFormats] = useState({
    bold: false,
    italic: false,
    underline: false
  })

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

          <div className="mt-8" style={{ marginBottom: 10 }}>
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
              onClick={() => window.location.reload()}
              className="w-full sm:w-auto bg-gray-200 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2" rel="noreferrer"
            >
              Cancella Campi
            </button>
          </div>
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