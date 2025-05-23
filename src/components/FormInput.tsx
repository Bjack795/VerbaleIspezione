import React from 'react'

interface FormInputProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  error?: string;
  type?: 'text' | 'date';
  multiline?: boolean;
  rows?: number;
  colors: {
    on_surface: string;
    outline: string;
    error: string;
    surface: string;
  };
  styling: {
    border_width: number;
    corner_radius: number;
    field_padding_y: number;
    field_padding_x: number;
    margin: number;
  };
}

const FormInput: React.FC<FormInputProps> = ({
  label,
  name,
  value,
  onChange,
  error,
  type = 'text',
  multiline = false,
  rows = 1,
  colors,
  styling
}) => {
  const inputStyle = {
    borderColor: error ? colors.error : colors.outline,
    borderWidth: styling.border_width,
    borderRadius: styling.corner_radius,
    padding: `${styling.field_padding_y}px ${styling.field_padding_x}px`,
    backgroundColor: colors.surface,
    color: colors.on_surface,
    outline: 'none',
    transition: 'all 0.2s',
    marginLeft: styling.margin,
    marginBottom: styling.margin
  }

  return (
    <div className="">
      <label className="block text-sm font-medium mb-4" style={{ color: colors.on_surface }}>
        {label}
      </label>
      {multiline ? (
        <textarea
          name={name}
          value={value}
          onChange={onChange}
          rows={rows}
          className="mt-1 ml-3 block w-full rounded-md shadow-sm focus:border-red-500 focus:ring-red-500"
          style={inputStyle}
        />
      ) : (
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          className="mt-1 ml-3 block w-full rounded-md shadow-sm focus:border-red-500 focus:ring-red-500"
          style={inputStyle}
        />
      )}
      {error && (
        <p className="text-sm mt-1" style={{ color: colors.error }}>
          {error}
        </p>
      )}
    </div>
  )
}

export default FormInput 