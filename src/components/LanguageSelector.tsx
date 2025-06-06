import React from 'react'
import { Language } from '../hooks/useTranslation'

interface LanguageSelectorProps {
  currentLanguage: Language
  onLanguageChange: (language: Language) => void
  t: (key: string) => string
  colors: {
    surface: string
    on_surface: string
    primary: string
    outline_variant: string
  }
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  currentLanguage,
  onLanguageChange,
  t,
  colors
}) => {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium" style={{ color: colors.on_surface }}>
        {t('lingua')}:
      </span>
      <div className="flex border rounded-lg overflow-hidden" style={{ borderColor: colors.outline_variant }}>
        {/* Pulsante Italiano */}
        <button
          onClick={() => onLanguageChange('it')}
          className={`flex items-center gap-2 px-3 py-2 text-sm font-medium transition-colors duration-200 ${
            currentLanguage === 'it' 
              ? 'shadow-sm' 
              : 'hover:opacity-80'
          }`}
          style={{
            backgroundColor: currentLanguage === 'it' ? colors.primary : colors.surface,
            color: currentLanguage === 'it' ? '#ffffff' : colors.on_surface,
          }}
          title="Italiano"
        >
          <span className="text-lg">🇮🇹</span>
          <span>IT</span>
        </button>

        {/* Separatore */}
        <div 
          className="w-px" 
          style={{ backgroundColor: colors.outline_variant }}
        />

        {/* Pulsante Inglese */}
        <button
          onClick={() => onLanguageChange('en')}
          className={`flex items-center gap-2 px-3 py-2 text-sm font-medium transition-colors duration-200 ${
            currentLanguage === 'en' 
              ? 'shadow-sm' 
              : 'hover:opacity-80'
          }`}
          style={{
            backgroundColor: currentLanguage === 'en' ? colors.primary : colors.surface,
            color: currentLanguage === 'en' ? '#ffffff' : colors.on_surface,
          }}
          title="English"
        >
          <span className="text-lg">🇬🇧</span>
          <span>EN</span>
        </button>
      </div>
    </div>
  )
}

export default LanguageSelector 