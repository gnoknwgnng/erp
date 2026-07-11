import React from 'react';

interface CardProps {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  extra?: React.ReactNode;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  hoverable?: boolean;
  style?: React.CSSProperties;
  className?: string;
}

export const Card: React.FC<CardProps> = ({
  title,
  subtitle,
  extra,
  children,
  footer,
  hoverable = false,
  style = {},
  className = ''
}) => {
  const cardStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    transition: 'all var(--transition-fast)',
    ...style
  };

  return (
    <div 
      className={`premium-card ${hoverable ? 'card-hover-effect' : ''} ${className}`}
      style={cardStyle}
    >
      {(title || subtitle || extra) && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: children ? '16px' : '0' }}>
          <div>
            {title && (
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
                {title}
              </h3>
            )}
            {subtitle && (
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                {subtitle}
              </p>
            )}
          </div>
          {extra && <div style={{ fontSize: '13px' }}>{extra}</div>}
        </div>
      )}

      {children && (
        <div style={{ flex: 1, fontSize: '14px', color: 'var(--text-primary)' }}>
          {children}
        </div>
      )}

      {footer && (
        <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid var(--border-color)', fontSize: '13px' }}>
          {footer}
        </div>
      )}
    </div>
  );
};
