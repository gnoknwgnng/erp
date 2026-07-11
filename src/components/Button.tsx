import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-150 focus:outline-none rounded-md select-none border cursor-pointer';

  const sizes = {
    sm: 'px-3 py-1.5 text-xs font-semibold',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-2.5 text-base font-semibold'
  };

  // Inline styling classes that match our custom theme.css variables
  const getStyles = () => {
    // Custom tailwind-like mapping but using standard style or clean variables
    let styleClass = `${baseStyles} ${sizes[size]}`;
    
    if (variant === 'primary') {
      styleClass += ' primary-btn';
    } else if (variant === 'secondary') {
      styleClass += ' secondary-btn';
    } else if (variant === 'outline') {
      styleClass += ' outline-btn';
    } else if (variant === 'danger') {
      styleClass += ' danger-btn';
    } else if (variant === 'ghost') {
      styleClass += ' ghost-btn';
    }
    
    return styleClass;
  };

  return (
    <button
      disabled={disabled || loading}
      className={`${getStyles()} ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '6px',
        borderRadius: 'var(--radius-sm)',
        fontWeight: 500,
        transition: 'all var(--transition-fast)',
        opacity: disabled || loading ? 0.6 : 1,
        pointerEvents: disabled || loading ? 'none' : 'auto',
        // Manual override styles to support the theme
        backgroundColor: variant === 'primary' ? 'var(--primary-color)' : variant === 'secondary' ? 'var(--bg-tertiary)' : 'transparent',
        color: variant === 'primary' ? '#ffffff' : variant === 'danger' ? 'var(--error-color)' : 'var(--text-primary)',
        borderColor: variant === 'outline' ? 'var(--border-color)' : variant === 'primary' ? 'var(--primary-color)' : variant === 'danger' ? 'var(--error-color)' : 'transparent',
        padding: size === 'sm' ? '6px 12px' : size === 'lg' ? '12px 20px' : '8px 16px',
        fontSize: size === 'sm' ? '12px' : size === 'lg' ? '16px' : '14px',
        borderStyle: 'solid',
        borderWidth: '1px'
      }}
      {...props}
    >
      {loading && (
        <svg
          style={{ animation: 'spin 1s linear infinite', width: '16px', height: '16px' }}
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            style={{ opacity: 0.25 }}
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            style={{ opacity: 0.75 }}
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {!loading && icon}
      {children}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        button:hover {
          filter: brightness(1.08);
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        }
        button:active {
          filter: brightness(0.95);
        }
      `}</style>
    </button>
  );
};
