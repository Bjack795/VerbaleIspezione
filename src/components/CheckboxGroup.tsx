import React from 'react'

interface CheckboxOption {
  id: string;
  label: string;
}

interface CheckboxGroupProps {
  title: string;
  options: CheckboxOption[];
  values: Record<string, boolean>;
  onChange: (field: string) => void;
  colors: {
    on_surface: string;
    outline: string;
    primary: string;
  };
}

const CheckboxGroup: React.FC<CheckboxGroupProps> = ({
  title,
  options,
  values,
  onChange,
  colors
}) => {
  return (
    <div className="mt-12">
      <h3 className="text-lg font-medium text-gray-900 mb-4" style={{ color: colors.on_surface }}>
        {title}
      </h3>
      <div className="space-y-3">
        {options.map(option => (
          <label key={option.id} className="flex items-center" style={{ color: colors.on_surface }}>
            <input
              type="checkbox"
              checked={values[option.id]}
              onChange={() => onChange(option.id)}
              className="rounded border-gray-300 text-red-600 focus:ring-red-500"
              style={{
                borderColor: colors.outline,
                color: colors.primary
              }}
            />
            <span className="ml-2">{option.label}</span>
          </label>
        ))}
      </div>
    </div>
  )
}

export default CheckboxGroup 