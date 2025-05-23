import React, { useState } from 'react'
import { PDFDownloadLink } from '@react-pdf/renderer'
import FormInput from './components/FormInput'
import CheckboxGroup from './components/CheckboxGroup'
import FormLayout from './components/FormLayout'
import Tabs from './components/Tabs'
import PDFDocument from './components/PDFDocument'
import { FormInputs } from './types/form'
import { colors, styling } from './constants/theme'

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
  { id: 'generale', label: 'D.L. Generale' },
  { id: 'strutture', label: 'D.L. Strutture' },
  { id: 'facciate', label: 'D.L. Facciate' },
  { id: 'elettrici', label: 'D.L. Imp. Elettrici/Speciali' },
  { id: 'meccanici', label: 'D.L. Imp. Meccanici' }
]

const getTodayDate = (): string => {
  const today = new Date();
  const year = today.getFullYear();
  const month = (today.getMonth() + 1).toString().padStart(2, '0');
  const day = today.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

function App() {
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
      generale: false,
      strutture: true,
      facciate: false,
      elettrici: false,
      meccanici: false,
    },
  })

  const [errors, setErrors] = useState<Partial<Record<keyof FormInputs, string>>>({})
  const [activeTab, setActiveTab] = useState('dati')

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
      'oggettoSopralluogo'
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
    setFormData((prev: FormInputs) => ({
      ...prev,
      [name]: value
    }))
  }

  const handleCheckboxChange = (section: 'tipoIspezione' | 'esito' | 'dl', field: string) => {
    setFormData((prev: FormInputs) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: !prev[section][field as keyof typeof prev[typeof section]]
      }
    }))
  }

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
          </div>

          <div className="mt-8">
            <FormInput
              label="Oggetto del Sopralluogo"
              name="oggettoSopralluogo"
              value={formData.oggettoSopralluogo}
              onChange={handleInputChange}
              error={errors.oggettoSopralluogo}
              multiline
              rows={6}
              colors={colors}
              styling={styling}
            />
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
        <div className="text-center py-8">
          <p style={{ color: colors.on_surface_variant }}>Gestione immagini in arrivo...</p>
        </div>
      )}

      {formData && activeTab === 'dati' && (
        <div className="mt-4 text-center">
          <PDFDownloadLink
            document={<PDFDocument data={formData} />}
            fileName="verbale-ispezione.pdf"
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          >
            {({ blob, url, loading, error }) =>
              loading ? 'Generazione PDF...' : 'Scarica PDF'
            }
          </PDFDownloadLink>
        </div>
      )}
    </FormLayout>
  )
}

export default App 