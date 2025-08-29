import React from 'react'

interface FormLayoutProps {
  children: React.ReactNode;
  colors: {
    surface: string;
    shadow: string;
    background: string;
    outline_variant: string;
    on_surface: string;
  };
  styling: {
    corner_radius: number;
    elevation_medium: number;
  };
}

const FormLayout: React.FC<FormLayoutProps> = ({
  children,
  colors,
  styling
}) => {
  return (
    <div className="min-h-screen" style={{ backgroundColor: colors.background, overflow: 'hidden' }}>
      <div className="relative py-12 sm:py-16 sm:max-w-screen-xl mx-auto">
        <div className="relative px-8 py-12" style={{ 
          backgroundColor: colors.surface,
          borderRadius: styling.corner_radius,
          boxShadow: `0 ${styling.elevation_medium}px ${styling.elevation_medium}px ${colors.shadow}20`,
          padding: '30px',
          overflow: 'auto'
        }}>
          <div className="max-w-full mx-auto">
            <div className="divide-y" style={{ borderColor: colors.outline_variant }}>
              <div className="py-8 text-base leading-relaxed" style={{ color: colors.on_surface }}>
                {children}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FormLayout 