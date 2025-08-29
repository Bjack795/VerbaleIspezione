import { useState, useCallback } from 'react'

export type HeaderType = 'redesco' | 'maestrale'

interface HeaderConfig {
  type: HeaderType
  logoPath: string
  companyName: string
}

const headerConfigs: Record<HeaderType, HeaderConfig> = {
  redesco: {
    type: 'redesco',
    logoPath: 'logo.png',
    companyName: 'Redesco Progetti srl'
  },
  maestrale: {
    type: 'maestrale',
    logoPath: 'logo_mae.png',
    companyName: 'Maestrale Srl'
  }
}

export const useHeaderSelection = () => {
  const [headerType, setHeaderType] = useState<HeaderType>('redesco')

  const changeHeader = useCallback((newHeaderType: HeaderType) => {
    setHeaderType(newHeaderType)
  }, [])

  const getCurrentHeader = useCallback(() => {
    return headerConfigs[headerType]
  }, [headerType])

  return {
    headerType,
    changeHeader,
    getCurrentHeader,
    availableHeaders: Object.values(headerConfigs)
  }
} 