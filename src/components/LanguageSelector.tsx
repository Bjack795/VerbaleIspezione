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
    <div className="flex items-center gap-2" style={{ marginTop: '10px' }}>
      <span className="text-sm font-medium" style={{ color: colors.on_surface }}>
        {t('lingua')}:
      </span>
      <div className="flex border rounded-lg overflow-hidden" style={{ borderColor: colors.outline_variant }}>
        {/* Pulsante Italiano */}
        <button
          onClick={() => onLanguageChange('it')}
          className={`language-selector-btn flex items-center justify-center transition-colors duration-200 ${
            currentLanguage === 'it' 
              ? 'shadow-sm' 
              : 'hover:opacity-80'
          }`}
          style={{
            backgroundColor: currentLanguage === 'it' ? colors.primary : colors.surface,
            padding: '2px',
            width: '50px',
            height: '40px'
          }}
          title="Italiano"
        >
          <img 
            src={`${import.meta.env.BASE_URL}ita.png`}
            alt="Italiano"
            style={{ 
              width: '40px', 
              height: '32px', 
              objectFit: 'cover', 
              borderRadius: '1px' 
            }}
          />
        </button>

        &nbsp;
        &nbsp;

        {/* Pulsante Inglese */}
        <button
          onClick={() => onLanguageChange('en')}
          className={`language-selector-btn flex items-center justify-center transition-colors duration-200 ${
            currentLanguage === 'en' 
              ? 'shadow-sm' 
              : 'hover:opacity-80'
          }`}
          style={{
            backgroundColor: currentLanguage === 'en' ? colors.primary : colors.surface,
            padding: '2px',
            width: '50px',
            height: '40px'
          }}
          title="English"
        >
          <img 
            src={`${import.meta.env.BASE_URL}uk.png`}
            alt="English"
            style={{ 
              width: '40px', 
              height: '32px', 
              objectFit: 'cover', 
              borderRadius: '1px' 
            }}
          />
        </button>
      </div>
      <br />
    </div>
  )
}

export default LanguageSelector 