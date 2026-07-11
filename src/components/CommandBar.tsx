import React, { useState, useEffect, useRef } from 'react';
import { Search, Monitor, Moon, LogOut, Users, GraduationCap, Calendar, CreditCard } from 'lucide-react';

interface CommandItem {
  id: string;
  title: string;
  category: string;
  icon: React.ReactNode;
  action: () => void;
}

interface CommandBarProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: string) => void;
  toggleTheme: () => void;
  logOut: () => void;
  currentRole: string;
}

export const CommandBar: React.FC<CommandBarProps> = ({
  isOpen,
  onClose,
  onNavigate,
  toggleTheme,
  logOut,
  currentRole
}) => {
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setSearch('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Set up items based on role
  const getCommandItems = (): CommandItem[] => {
    const generalItems: CommandItem[] = [
      {
        id: 'theme',
        title: 'Toggle Dark / Light Mode',
        category: 'Preferences',
        icon: <Moon size={16} />,
        action: () => { toggleTheme(); onClose(); }
      },
      {
        id: 'logout',
        title: 'Sign Out / Lock Session',
        category: 'Account',
        icon: <LogOut size={16} />,
        action: () => { logOut(); onClose(); }
      }
    ];

    const adminItems: CommandItem[] = [
      {
        id: 'nav-students',
        title: 'Manage Students / Admissions',
        category: 'Navigation',
        icon: <GraduationCap size={16} />,
        action: () => { onNavigate('students'); onClose(); }
      },
      {
        id: 'nav-teachers',
        title: 'Manage Teachers',
        category: 'Navigation',
        icon: <Users size={16} />,
        action: () => { onNavigate('teachers'); onClose(); }
      },
      {
        id: 'nav-timetable',
        title: 'View Class Timetables',
        category: 'Navigation',
        icon: <Calendar size={16} />,
        action: () => { onNavigate('timetable'); onClose(); }
      },
      {
        id: 'nav-fees',
        title: 'Collect Fees / View Invoices',
        category: 'Navigation',
        icon: <CreditCard size={16} />,
        action: () => { onNavigate('fees'); onClose(); }
      }
    ];

    const superAdminItems: CommandItem[] = [
      {
        id: 'sa-schools',
        title: 'View Registered Schools',
        category: 'Navigation',
        icon: <Monitor size={16} />,
        action: () => { onNavigate('schools'); onClose(); }
      },
      {
        id: 'sa-plans',
        title: 'Manage Pricing Subscriptions',
        category: 'Navigation',
        icon: <CreditCard size={16} />,
        action: () => { onNavigate('plans'); onClose(); }
      }
    ];

    if (currentRole === 'superadmin') {
      return [...superAdminItems, ...generalItems];
    } else if (currentRole === 'admin') {
      return [...adminItems, ...generalItems];
    }
    
    return generalItems;
  };

  const commandItems = getCommandItems();

  const filteredItems = commandItems.filter(item =>
    item.title.toLowerCase().includes(search.toLowerCase()) ||
    item.category.toLowerCase().includes(search.toLowerCase())
  );

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % filteredItems.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % filteredItems.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredItems[selectedIndex]) {
          filteredItems[selectedIndex].action();
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredItems, selectedIndex]);

  if (!isOpen) return null;

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        backdropFilter: 'blur(3px)',
        zIndex: 99999,
        display: 'flex',
        justifyContent: 'center',
        paddingTop: '15vh',
        paddingLeft: '20px',
        paddingRight: '20px'
      }}
      onClick={onClose}
    >
      <div 
        style={{
          width: '100%',
          maxWidth: '560px',
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-lg)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '350px'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', padding: '12px 16px', borderBottom: '1px solid var(--border-color)' }}>
          <Search size={18} style={{ color: 'var(--text-tertiary)', marginRight: '10px' }} />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command or search..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setSelectedIndex(0);
            }}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'var(--text-primary)',
              fontSize: '14px',
              fontWeight: 400
            }}
          />
          <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', backgroundColor: 'var(--bg-tertiary)', padding: '2px 6px', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
            ESC
          </span>
        </div>

        <div style={{ overflowY: 'auto', flex: 1, padding: '8px' }}>
          {filteredItems.length === 0 ? (
            <div style={{ padding: '24px 16px', fontSize: '13px', color: 'var(--text-tertiary)', textAlign: 'center' }}>
              No results found for "{search}"
            </div>
          ) : (
            filteredItems.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              
              // Render category headers when category changes
              const showCategory = idx === 0 || filteredItems[idx - 1].category !== item.category;

              return (
                <div key={item.id}>
                  {showCategory && (
                    <div style={{ fontSize: '10px', fontWeight: 650, color: 'var(--text-tertiary)', padding: '8px 12px 4px 12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {item.category}
                    </div>
                  )}
                  
                  <div
                    onClick={item.action}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '10px 12px',
                      borderRadius: 'var(--radius-sm)',
                      cursor: 'pointer',
                      backgroundColor: isSelected ? 'var(--primary-glow)' : 'transparent',
                      color: isSelected ? 'var(--primary-color)' : 'var(--text-primary)',
                      transition: 'all var(--transition-fast)',
                      gap: '12px'
                    }}
                  >
                    <span style={{ color: isSelected ? 'var(--primary-color)' : 'var(--text-secondary)' }}>
                      {item.icon}
                    </span>
                    <span style={{ fontSize: '13.5px', fontWeight: isSelected ? 500 : 400 }}>
                      {item.title}
                    </span>
                    {isSelected && (
                      <span style={{ marginLeft: 'auto', fontSize: '11px', color: 'var(--primary-color)', opacity: 0.8 }}>
                        ↵ Enter
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
