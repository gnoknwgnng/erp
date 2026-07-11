import { useState, useEffect } from 'react';
import './assets/theme.css';
import { LandingPage } from './views/landing/LandingPage';
import { LoginPortal } from './views/auth/LoginPortal';
import { SuperAdminDashboard } from './views/superadmin/SuperAdminDashboard';
import { SchoolAdminDashboard } from './views/schooladmin/SchoolAdminDashboard';
import { TeacherDashboard } from './views/teacher/TeacherDashboard';
import { ParentDashboard } from './views/parent/ParentDashboard';
import { DashboardLayout } from './layouts/DashboardLayout';
import { CommandBar } from './components/CommandBar';
import type { AuthSession } from './db/dbEngine';

function App() {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [view, setView] = useState<'landing' | 'login' | 'dashboard'>('landing');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [theme, setTheme] = useState<'light' | 'dark'>('dark'); // Dark mode by default for premium Linear look
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [registeredAlert, setRegisteredAlert] = useState<string | null>(null);

  // Manage Dark/Light theme class on document body
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Handle Cmd+K global search keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  const handleLoginSuccess = (newSession: AuthSession) => {
    setSession(newSession);
    setView('dashboard');
    setActiveTab('dashboard');
  };

  const handleLogOut = () => {
    setSession(null);
    setView('landing');
    setActiveTab('dashboard');
  };

  const handleSchoolRegistered = (schoolName: string) => {
    setRegisteredAlert(schoolName);
    setView('login'); // Redirect to login page to sign in once approved
    setTimeout(() => {
      setRegisteredAlert(null);
    }, 6000);
  };

  const renderActiveDashboard = () => {
    if (!session) return null;

    switch (session.user.role) {
      case 'superadmin':
        return <SuperAdminDashboard activeTab={activeTab} />;
      case 'admin':
        return (
          <SchoolAdminDashboard 
            activeTab={activeTab} 
            school={session.school!} 
            user={session.user}
            onSchoolUpdate={(updatedSchool) => {
              setSession(prev => prev ? { ...prev, school: updatedSchool } : null);
            }}
          />
        );
      case 'teacher':
        return <TeacherDashboard activeTab={activeTab} school={session.school!} user={session.user} />;
      case 'parent':
      case 'student':
        return <ParentDashboard activeTab={activeTab} school={session.school!} user={session.user} />;
      default:
        return (
          <div style={{ padding: '24px', color: 'var(--error-color)' }}>
            Error: Unauthorized workspace role assignment.
          </div>
        );
    }
  };

  return (
    <div className="App">
      {/* Search overlay command menu */}
      <CommandBar
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onNavigate={(tab) => setActiveTab(tab)}
        toggleTheme={toggleTheme}
        logOut={handleLogOut}
        currentRole={session?.user.role || ''}
      />

      {/* RENDER VIEWS */}
      {view === 'landing' && (
        <LandingPage 
          onLoginClick={() => setView('login')} 
          onSchoolRegistered={handleSchoolRegistered}
          theme={theme}
          toggleTheme={toggleTheme}
        />
      )}

      {view === 'login' && (
        <div style={{ position: 'relative' }}>
          {registeredAlert && (
            <div style={{
              position: 'fixed',
              top: '20px',
              left: '50%',
              transform: 'translateX(-50%)',
              backgroundColor: 'var(--success-bg)',
              color: 'var(--success-color)',
              border: '1px solid var(--success-color)',
              padding: '12px 24px',
              borderRadius: '8px',
              fontSize: '13.5px',
              zIndex: 99999,
              boxShadow: 'var(--shadow-lg)',
              animation: 'fadeIn var(--transition-fast)'
            }}>
              🎉 <strong>{registeredAlert}</strong> registered successfully! <br />
              Log into Super Admin (superadmin/admin123) to approve your school tenant.
            </div>
          )}
          <LoginPortal 
            onLoginSuccess={handleLoginSuccess} 
            onBackToLanding={() => setView('landing')} 
          />
        </div>
      )}

      {view === 'dashboard' && session && (
        <DashboardLayout
          currentTab={activeTab}
          onNavigate={(tab) => setActiveTab(tab)}
          role={session.user.role}
          user={session.user}
          school={session.school}
          toggleTheme={toggleTheme}
          theme={theme}
          onLogOut={handleLogOut}
          onOpenSearch={() => setIsSearchOpen(true)}
        >
          {renderActiveDashboard()}
        </DashboardLayout>
      )}
    </div>
  );
}

export default App;
