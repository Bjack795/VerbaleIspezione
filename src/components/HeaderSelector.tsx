import React from 'react'
import { HeaderType } from '../hooks/useHeaderSelection'

interface HeaderSelectorProps {
  currentHeader: HeaderType
  onHeaderChange: (header: HeaderType) => void
  t: (key: string) => string
  colors: {
    surface: string
    on_surface: string
    primary: string
    outline_variant: string
  }
}

const HeaderSelector: React.FC<HeaderSelectorProps> = ({
  currentHeader,
  onHeaderChange,
  t,
  colors
}) => {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium" style={{ color: colors.on_surface }}>
        {t('azienda')}:
      </span>
      <br/>
      <div className="flex border rounded-lg overflow-hidden" style={{ borderColor: colors.outline_variant }}>
        {/* Pulsante Redesco */}
        <button
          onClick={() => onHeaderChange('redesco')}
          className={`header-selector-btn flex items-center gap-2 px-3 py-2 text-sm font-medium transition-colors duration-200 ${
            currentHeader === 'redesco' 
              ? 'shadow-sm' 
              : 'hover:opacity-80'
          }`}
          style={{
            backgroundColor: currentHeader === 'redesco' ? colors.primary : colors.surface,
            color: currentHeader === 'redesco' ? '#ffffff' : colors.on_surface,
          }}
          title=""
        >
          <span>Redesco</span>
        </button>

        &nbsp;

        {/* Pulsante Maestrale */}
        <button
          onClick={() => onHeaderChange('maestrale')}
          className={`header-selector-btn flex items-center gap-2 px-3 py-2 text-sm font-medium transition-colors duration-200 ${
            currentHeader === 'maestrale' 
              ? 'shadow-sm' 
              : 'hover:opacity-80'
          }`}
          style={{
            backgroundColor: currentHeader === 'maestrale' ? colors.primary : colors.surface,
            color: currentHeader === 'maestrale' ? '#ffffff' : colors.on_surface,
          }}
          title="Maestrale Srl"
        >
          <span>Maestrale</span>
        </button>
      </div>
    </div>
  )
}

export default HeaderSelector 