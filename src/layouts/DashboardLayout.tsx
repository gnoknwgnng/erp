import React, { useState } from 'react';
import { 
  Menu, Bell, Search, Sun, Moon, LogOut, LayoutDashboard, Monitor, 
  CreditCard, Settings, GraduationCap, Users, BookOpen, Clock, FileText, 
  Book, Truck, Home, Package, DollarSign, MessageSquare, Clipboard, 
  HelpCircle, UserCheck, ShieldAlert, Tag, Gift, ShoppingCart, Calendar
} from 'lucide-react';
import { Button } from '../components/Button';
import type { School, User } from '../db/initialData';

interface DashboardLayoutProps {
  currentTab: string;
  onNavigate: (tab: string) => void;
  role: string;
  user: User;
  school: School | null;
  toggleTheme: () => void;
  theme: 'light' | 'dark';
  onLogOut: () => void;
  children: React.ReactNode;
  onOpenSearch: () => void;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  currentTab,
  onNavigate,
  role,
  user,
  school,
  toggleTheme,
  theme,
  onLogOut,
  children,
  onOpenSearch
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);

  const notifications = [
    { id: '1', text: 'Springfield Academy registered for Pro Plan', time: '10m ago', unread: true },
    { id: '2', text: 'Skinner updated Grade 10 marksheet', time: '1h ago', unread: true },
    { id: '3', text: 'System backup completed successfully', time: '4h ago', unread: false }
  ];

  // Side Navigation items by role
  const getNavItems = () => {
    switch (role) {
      case 'superadmin':
        return [
          { id: 'dashboard', label: 'Platform Overview', icon: <LayoutDashboard size={18} /> },
          { id: 'schools', label: 'Schools Registry', icon: <Monitor size={18} /> },
          { id: 'plans', label: 'Subscription Plans', icon: <CreditCard size={18} /> },
          { id: 'coupons', label: 'Promo Coupons', icon: <Tag size={18} /> },
          { id: 'wishes', label: 'Broadcast Wishes', icon: <Gift size={18} /> },
          { id: 'orders', label: 'SaaS Orders', icon: <ShoppingCart size={18} /> },
          { id: 'support', label: 'Support Tickets', icon: <HelpCircle size={18} /> },
          { id: 'settings', label: 'Platform Settings', icon: <Settings size={18} /> },
          { id: 'logs', label: 'Global Audit Logs', icon: <ShieldAlert size={18} /> }
        ];
      case 'admin':
        return [
          { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
          { id: 'students', label: 'Students & Admissions', icon: <GraduationCap size={18} /> },
          { id: 'parents', label: 'Parents Directory', icon: <Users size={18} /> },
          { id: 'teachers', label: 'Teachers Hub', icon: <UserCheck size={18} /> },
          { id: 'academics', label: 'Academics & Classes', icon: <BookOpen size={18} /> },
          { id: 'attendance', label: 'Attendance Console', icon: <Clock size={18} /> },
          { id: 'holidays', label: 'School Holidays', icon: <Calendar size={18} /> },
          { id: 'events', label: 'School Events', icon: <Gift size={18} /> },
          { id: 'timetable', label: 'Timetable Planner', icon: <Clipboard size={18} /> },
          { id: 'fees', label: 'Fee Management', icon: <DollarSign size={18} /> },
          { id: 'exams', label: 'Examinations & Marks', icon: <FileText size={18} /> },
          { id: 'library', label: 'Library Catalog', icon: <Book size={18} /> },
          { id: 'transport', label: 'Transport & GPS', icon: <Truck size={18} /> },
          { id: 'hostel', label: 'Hostel & Mess', icon: <Home size={18} /> },
          { id: 'inventory', label: 'Inventory Assets', icon: <Package size={18} /> },
          { id: 'finance', label: 'Finance & Ledgers', icon: <DollarSign size={18} /> },
          { id: 'support', label: 'Help Desk', icon: <HelpCircle size={18} /> },
          { id: 'settings', label: 'School Settings', icon: <Settings size={18} /> }
        ];
      case 'teacher':
        return [
          { id: 'dashboard', label: 'Teacher Dashboard', icon: <LayoutDashboard size={18} /> },
          { id: 'attendance', label: 'Mark Attendance', icon: <Clock size={18} /> },
          { id: 'marks', label: 'Enter Exam Marks', icon: <FileText size={18} /> },
          { id: 'homework', label: 'Assign Homework', icon: <Clipboard size={18} /> },
          { id: 'timetable', label: 'My Timetable', icon: <BookOpen size={18} /> },
          { id: 'chat', label: 'Parent Messages', icon: <MessageSquare size={18} /> }
        ];
      case 'parent':
      case 'student':
        return [
          { id: 'dashboard', label: 'Student Dashboard', icon: <LayoutDashboard size={18} /> },
          { id: 'attendance', label: 'Attendance Calendar', icon: <Clock size={18} /> },
          { id: 'homework', label: 'Homework Submission', icon: <Clipboard size={18} /> },
          { id: 'timetable', label: 'Class Timetable', icon: <BookOpen size={18} /> },
          { id: 'results', label: 'Exam Results & Report', icon: <FileText size={18} /> },
          { id: 'fees', label: 'Pay Fee Invoices', icon: <DollarSign size={18} /> },
          { id: 'bustracking', label: 'GPS Bus Tracker', icon: <Truck size={18} /> },
          { id: 'certificates', label: 'Certificates & Documents', icon: <FileText size={18} /> }
        ];
      default:
        return [];
    }
  };

  const navItems = getNavItems();

  const getBreadcrumbs = () => {
    const parentNode = role === 'superadmin' ? 'Super Admin' : school ? school.name : 'ERP Cloud';
    const activeItem = navItems.find(item => item.id === currentTab);
    return `${parentNode} / ${activeItem ? activeItem.label : currentTab}`;
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-primary)' }}>
      {/* Sidebar Navigation */}
      <aside
        className={`dashboard-sidebar ${sidebarOpen ? 'open' : 'closed'}`}
        style={{
          width: sidebarOpen ? 'var(--sidebar-width)' : '0px',
          overflow: 'hidden',
          borderRight: sidebarOpen ? '1px solid var(--border-color)' : 'none',
          backgroundColor: 'var(--bg-secondary)',
          display: 'flex',
          flexDirection: 'column',
          transition: 'width var(--transition-normal)',
          zIndex: 1000,
          position: 'relative'
        }}
      >
        {/* Sidebar Header */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '12px' }}>
          {school?.logo ? (
            <img 
              src={school.logo} 
              alt="Logo" 
              style={{ width: '32px', height: '32px', borderRadius: '6px', objectFit: 'cover' }} 
            />
          ) : (
            <div style={{ width: '32px', height: '32px', borderRadius: '6px', backgroundColor: 'var(--primary-color)', color: '#ffffff', fontWeight: 700, fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)' }}>
              Ω
            </div>
          )}
          <div style={{ minWidth: '0' }}>
            <h2 style={{ fontSize: '14.5px', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: 'var(--font-display)' }}>
              {school ? school.name : 'ERP Super Admin'}
            </h2>
            <span style={{ fontSize: '10px', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em' }}>
              {role}
            </span>
          </div>
        </div>

        {/* Sidebar Links */}
        <nav style={{ flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: '4px', overflowY: 'auto' }}>
          {navItems.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`sidebar-link ${isActive ? 'active' : ''}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-sm)',
                  border: 'none',
                  backgroundColor: isActive ? 'var(--primary-glow)' : 'transparent',
                  color: isActive ? 'var(--primary-color)' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontSize: '13.5px',
                  fontWeight: isActive ? 500 : 400,
                  transition: 'all var(--transition-fast)'
                }}
              >
                <span style={{ color: isActive ? 'var(--primary-color)' : 'var(--text-tertiary)' }}>
                  {item.icon}
                </span>
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Sidebar User Footer */}
        <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'var(--bg-tertiary)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: '0' }}>
            {user.avatar ? (
              <img 
                src={user.avatar} 
                alt={user.name} 
                style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} 
              />
            ) : (
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--text-tertiary)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 650 }}>
                {user.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
              </div>
            )}
            <div style={{ minWidth: '0' }}>
              <p style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user.name}
              </p>
              <p style={{ fontSize: '11px', color: 'var(--text-tertiary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user.email}
              </p>
            </div>
          </div>
          <button 
            onClick={onLogOut} 
            title="Log Out"
            style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-tertiary)', padding: '6px', display: 'flex', borderRadius: 'var(--radius-sm)' }}
            onMouseOver={(e) => (e.currentTarget.style.color = 'var(--error-color)')}
            onMouseOut={(e) => (e.currentTarget.style.color = 'var(--text-tertiary)')}
          >
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      {sidebarOpen && (
        <div 
          className="sidebar-overlay" 
          onClick={() => setSidebarOpen(false)} 
          style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            backdropFilter: 'blur(2px)',
            zIndex: 9998
          }}
        />
      )}

      {/* Main Window */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: '0' }}>
        {/* Top Navbar */}
        <header
          className="glassmorphism"
          style={{
            height: '60px',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 24px',
            position: 'sticky',
            top: 0,
            zIndex: 99,
            backgroundColor: theme === 'light' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(5, 5, 8, 0.7)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)'
          }}
        >
          {/* Left: Menu toggle & Breadcrumbs */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              style={{ padding: '6px' }}
            >
              <Menu size={18} />
            </Button>
            <span className="breadcrumbs-text" style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)' }}>
              {getBreadcrumbs()}
            </span>
          </div>

          {/* Right: Search, Theme Toggle, Notifications */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Command Search button */}
            <button
              onClick={onOpenSearch}
              className="search-button"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 12px',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--bg-tertiary)',
                color: 'var(--text-tertiary)',
                fontSize: '12.5px',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)'
              }}
              onMouseOver={(e) => (e.currentTarget.style.borderColor = 'var(--border-hover)')}
              onMouseOut={(e) => (e.currentTarget.style.borderColor = 'var(--border-color)')}
            >
              <Search size={14} />
              <span className="search-text">Search modules...</span>
              <span className="search-shortcut" style={{ fontSize: '10px', backgroundColor: 'var(--border-color)', padding: '1px 5px', borderRadius: '3px', fontWeight: 600 }}>
                ⌘K
              </span>
            </button>

            {/* Theme switcher capsule slider */}
            <div 
              onClick={toggleTheme}
              title={theme === 'light' ? "Switch to Dark Mode" : "Switch to Light Mode"}
              style={{
                width: '46px',
                height: '24px',
                borderRadius: '12px',
                backgroundColor: 'var(--bg-tertiary)',
                border: '1px solid var(--border-color)',
                position: 'relative',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 5px',
                transition: 'all var(--transition-fast)'
              }}
            >
              <Sun size={10} style={{ color: theme === 'light' ? 'var(--warning-color)' : 'var(--text-tertiary)', zIndex: 2 }} />
              <Moon size={10} style={{ color: theme === 'dark' ? 'var(--primary-color)' : 'var(--text-tertiary)', zIndex: 2 }} />
              <div 
                style={{
                  position: 'absolute',
                  top: '1.5px',
                  left: theme === 'light' ? '2px' : '23px',
                  width: '19px',
                  height: '19px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--bg-secondary)',
                  boxShadow: 'var(--shadow-sm)',
                  border: '1px solid var(--border-color)',
                  transition: 'all var(--transition-fast)',
                  zIndex: 1
                }}
              />
            </div>

            {/* Notifications button */}
            <div style={{ position: 'relative' }}>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowNotifications(!showNotifications)}
                style={{ padding: '8px', position: 'relative' }}
              >
                <Bell size={16} />
                <span style={{ position: 'absolute', top: '4px', right: '4px', width: '7px', height: '7px', borderRadius: '50%', backgroundColor: 'var(--error-color)' }} />
              </Button>

              {/* Notification Box Popup */}
              {showNotifications && (
                <>
                  <div 
                    style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 998 }} 
                    onClick={() => setShowNotifications(false)} 
                  />
                  <div
                    style={{
                      position: 'absolute',
                      right: 0,
                      top: '38px',
                      width: '280px',
                      backgroundColor: 'var(--bg-secondary)',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-md)',
                      boxShadow: 'var(--shadow-lg)',
                      zIndex: 999,
                      overflow: 'hidden',
                      animation: 'fadeIn var(--transition-fast)'
                    }}
                  >
                    <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-color)', fontWeight: 600, fontSize: '13.5px' }}>
                      Recent Notifications
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      {notifications.map((notif) => (
                        <div
                          key={notif.id}
                          style={{
                            padding: '12px 16px',
                            borderBottom: '1px solid var(--border-color)',
                            fontSize: '12.5px',
                            backgroundColor: notif.unread ? 'var(--primary-glow)' : 'transparent',
                            color: 'var(--text-primary)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '4px'
                          }}
                        >
                          <span style={{ fontWeight: notif.unread ? 500 : 400 }}>{notif.text}</span>
                          <span style={{ fontSize: '10px', color: 'var(--text-tertiary)' }}>{notif.time}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Dashboard Content area */}
        <main style={{ flex: 1, padding: '28px', overflowY: 'auto', WebkitOverflowScrolling: 'touch' }} className="animate-fade-in">
          {children}
        </main>
      </div>
    </div>
  );
};
