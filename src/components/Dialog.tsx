import React from 'react';
import { X } from 'lucide-react';
import { Button } from './Button';

interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Dialog: React.FC<DialogProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md'
}) => {
  if (!isOpen) return null;

  const getWidth = () => {
    switch (size) {
      case 'sm': return '400px';
      case 'lg': return '800px';
      case 'xl': return '1100px';
      case 'md':
      default:
        return '600px';
    }
  };

  const overlayStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    padding: '20px'
  };

  const contentStyle: React.CSSProperties = {
    backgroundColor: 'var(--bg-primary)',
    borderRadius: 'var(--radius-lg)',
    border: '1px solid var(--border-color)',
    boxShadow: 'var(--shadow-lg)',
    width: '100%',
    maxWidth: getWidth(),
    display: 'flex',
    flexDirection: 'column',
    maxHeight: '90vh',
    animation: 'modalSlideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards'
  };

  const headerStyle: React.CSSProperties = {
    padding: '16px 20px',
    borderBottom: '1px solid var(--border-color)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  };

  const bodyStyle: React.CSSProperties = {
    padding: '20px',
    overflowY: 'auto',
    flex: 1
  };

  const footerStyle: React.CSSProperties = {
    padding: '14px 20px',
    borderTop: '1px solid var(--border-color)',
    backgroundColor: 'var(--bg-secondary)',
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    borderRadius: '0 0 var(--radius-lg) var(--radius-lg)'
  };

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={contentStyle} onClick={(e) => e.stopPropagation()}>
        <div style={headerStyle}>
          <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
            {title}
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose} style={{ padding: '6px' }}>
            <X size={16} />
          </Button>
        </div>
        
        <div style={bodyStyle}>
          {children}
        </div>

        {footer && (
          <div style={footerStyle}>
            {footer}
          </div>
        )}
      </div>
      <style>{`
        @keyframes modalSlideIn {
          from {
            opacity: 0;
            transform: scale(0.96) translateY(8px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
      `}</style>
    </div>
  );
};
