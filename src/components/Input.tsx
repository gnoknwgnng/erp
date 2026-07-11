import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  textarea?: boolean;
  rows?: number;
  select?: boolean;
  options?: { value: string; label: string }[];
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  textarea = false,
  select = false,
  options = [],
  rows = 3,
  className = '',
  id,
  type = 'text',
  ...props
}) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '13px',
    fontWeight: 500,
    marginBottom: '6px',
    color: 'var(--text-secondary)'
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '8px 12px',
    fontSize: '14px',
    borderRadius: 'var(--radius-sm)',
    border: `1px solid ${error ? 'var(--error-color)' : 'var(--border-color)'}`,
    backgroundColor: 'var(--bg-secondary)',
    color: 'var(--text-primary)',
    outline: 'none',
    transition: 'border-color var(--transition-fast), box-shadow var(--transition-fast)'
  };

  return (
    <div className={`form-group ${className}`} style={{ marginBottom: '16px', width: '100%' }}>
      {label && <label htmlFor={inputId} style={labelStyle}>{label}</label>}
      
      {textarea ? (
        <textarea
          id={inputId}
          rows={rows}
          style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }}
          {...(props as any)}
        />
      ) : select ? (
        <select
          id={inputId}
          style={{ ...inputStyle, appearance: 'none', backgroundImage: 'url("data:image/svg+xml;utf8,<svg fill=\'%236b7280\' height=\'24\' viewBox=\'0 0 24 24\' width=\'24\' xmlns=\'http://www.w3.org/2000/svg\'><path d=\'M7 10l5 5 5-5z\'/></svg>")', backgroundPosition: 'right 8px center', backgroundRepeat: 'no-repeat', paddingRight: '32px' }}
          {...(props as any)}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          id={inputId}
          type={type}
          style={inputStyle}
          {...props}
        />
      )}

      {error ? (
        <span style={{ display: 'block', marginTop: '4px', fontSize: '12px', color: 'var(--error-color)' }}>
          {error}
        </span>
      ) : helperText ? (
        <span style={{ display: 'block', marginTop: '4px', fontSize: '12px', color: 'var(--text-tertiary)' }}>
          {helperText}
        </span>
      ) : null}
      
      <style>{`
        input:focus, textarea:focus, select:focus {
          border-color: var(--primary-color) !important;
          box-shadow: 0 0 0 3px var(--primary-glow) !important;
        }
      `}</style>
    </div>
  );
};
