import React, { useState } from 'react';
import { ArrowLeft, KeySquare } from 'lucide-react';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Card } from '../../components/Card';
import { authenticate, resetDatabase, type AuthSession } from '../../db/dbEngine';

interface LoginPortalProps {
  onLoginSuccess: (session: AuthSession) => void;
  onBackToLanding: () => void;
}

export const LoginPortal: React.FC<LoginPortalProps> = ({ onLoginSuccess, onBackToLanding }) => {
  const [role, setRole] = useState<'superadmin' | 'admin' | 'teacher' | 'student' | 'parent'>('admin');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [mfaStep, setMfaStep] = useState(false);
  const [mfaCode, setMfaCode] = useState('');
  const [pendingSession, setPendingSession] = useState<AuthSession | null>(null);

  // Password reset state
  const [forgotStep, setForgotStep] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const session = authenticate(username, password, role);
      if (!session) {
        setError('Invalid username or password for this role.');
        return;
      }

      // Check MFA
      if (session.user.mfaEnabled) {
        setPendingSession(session);
        setMfaStep(true);
      } else {
        onLoginSuccess(session);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed.');
    }
  };

  const handleMfaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mfaCode === '123456' && pendingSession) {
      onLoginSuccess(pendingSession);
    } else {
      setError('Invalid MFA verification code. Try 123456');
    }
  };

  const handleResetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setResetSuccess(true);
    setTimeout(() => {
      setForgotStep(false);
      setResetSuccess(false);
    }, 2000);
  };

  // Quick Seed Credentials
  const prefillAccount = (selectedRole: typeof role, user: string, pass: string) => {
    setRole(selectedRole);
    setUsername(user);
    setPassword(pass);
    setError('');
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'var(--bg-primary)',
      padding: '24px',
      background: 'radial-gradient(circle at bottom, var(--primary-glow) 0%, transparent 50%)'
    }}>
      <div style={{ width: '100%', maxWidth: '440px' }}>
        {/* Back Link */}
        <button
          onClick={onBackToLanding}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            border: 'none',
            background: 'transparent',
            color: 'var(--text-secondary)',
            fontSize: '13.5px',
            cursor: 'pointer',
            marginBottom: '24px',
            transition: 'color var(--transition-fast)'
          }}
          onMouseOver={(e) => (e.currentTarget.style.color = 'var(--primary-color)')}
          onMouseOut={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
        >
          <ArrowLeft size={16} /> Back to Landing Page
        </button>

        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center', marginBottom: '24px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: 'var(--primary-color)', color: '#ffffff', fontSize: '20px', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)' }}>
            Ω
          </div>
          <span style={{ fontSize: '18px', fontWeight: 700, fontFamily: 'var(--font-display)' }}>OmniSchool</span>
        </div>

        {/* Main card */}
        <Card style={{ padding: '32px', backgroundColor: 'var(--bg-secondary)' }}>
          {forgotStep ? (
            /* FORGOT PASSWORD FORM */
            <form onSubmit={handleResetSubmit}>
              <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '8px', fontFamily: 'var(--font-display)' }}>
                Reset Password
              </h2>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
                Enter your email address and we'll send you instructions to reset your password.
              </p>

              {resetSuccess ? (
                <div style={{ backgroundColor: 'var(--success-bg)', color: 'var(--success-color)', padding: '12px', borderRadius: '6px', fontSize: '13px', marginBottom: '16px' }}>
                  ✓ Recovery code sent to your email. Check inbox.
                </div>
              ) : null}

              <Input
                label="Registered Email"
                type="email"
                required
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                placeholder="you@school.edu"
              />

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '16px' }}>
                <Button type="submit" style={{ width: '100%' }}>Send Verification Link</Button>
                <Button type="button" variant="ghost" onClick={() => setForgotStep(false)}>Back to Login</Button>
              </div>
            </form>
          ) : mfaStep ? (
            /* MFA/OTP CODE VERIFICATION */
            <form onSubmit={handleMfaSubmit}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
                <KeySquare size={40} color="var(--primary-color)" />
              </div>
              <h2 style={{ fontSize: '18px', fontWeight: 600, textAlign: 'center', marginBottom: '8px', fontFamily: 'var(--font-display)' }}>
                Security Code Required
              </h2>
              <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', textAlign: 'center', marginBottom: '20px' }}>
                Enter the 6-digit verification code sent to your authenticator app.
              </p>

              {error && (
                <div style={{ backgroundColor: 'var(--error-bg)', color: 'var(--error-color)', padding: '10px', borderRadius: '6px', fontSize: '12.5px', marginBottom: '16px' }}>
                  {error}
                </div>
              )}

              <Input
                label="Verification Code"
                maxLength={6}
                required
                value={mfaCode}
                onChange={(e) => setMfaCode(e.target.value)}
                placeholder="123456"
                style={{ textAlign: 'center', fontSize: '20px', letterSpacing: '8px', fontWeight: 700 }}
              />

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '16px' }}>
                <Button type="submit" style={{ width: '100%' }}>Verify & Login</Button>
                <Button type="button" variant="ghost" onClick={() => setMfaStep(false)}>Cancel</Button>
              </div>
            </form>
          ) : (
            /* STANDARD LOGIN FORM */
            <form onSubmit={handleLoginSubmit}>
              <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '6px', fontFamily: 'var(--font-display)' }}>
                Sign In
              </h2>
              <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
                Access your school's workspace and dashboard.
              </p>

              {error && (
                <div style={{ backgroundColor: 'var(--error-bg)', color: 'var(--error-color)', padding: '10px', borderRadius: '6px', fontSize: '12.5px', marginBottom: '16px' }}>
                  {error}
                </div>
              )}

              {/* Role Select tab grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(5, 1fr)',
                gap: '4px',
                padding: '4px',
                backgroundColor: 'var(--bg-tertiary)',
                borderRadius: '6px',
                marginBottom: '20px'
              }}>
                {(['superadmin', 'admin', 'teacher', 'student', 'parent'] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => { setRole(r); setError(''); }}
                    style={{
                      padding: '6px 2px',
                      fontSize: '10px',
                      fontWeight: role === r ? 600 : 400,
                      borderRadius: '4px',
                      border: 'none',
                      cursor: 'pointer',
                      backgroundColor: role === r ? 'var(--bg-primary)' : 'transparent',
                      color: role === r ? 'var(--primary-color)' : 'var(--text-secondary)',
                      boxShadow: role === r ? 'var(--shadow-sm)' : 'none',
                      transition: 'all var(--transition-fast)',
                      textTransform: 'capitalize'
                    }}
                  >
                    {r === 'superadmin' ? 'Super' : r}
                  </button>
                ))}
              </div>

              <Input
                label="Username / Email ID"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. sfadmin"
              />

              <Input
                label="Password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', marginTop: '-4px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    style={{ accentColor: 'var(--primary-color)' }}
                  />
                  Remember me
                </label>
                <button
                  type="button"
                  onClick={() => setForgotStep(true)}
                  style={{ border: 'none', background: 'transparent', color: 'var(--primary-color)', fontSize: '12.5px', cursor: 'pointer', fontWeight: 500 }}
                >
                  Forgot Password?
                </button>
              </div>

              <Button type="submit" style={{ width: '100%' }}>
                Log In
              </Button>
            </form>
          )}
        </Card>

        <p style={{ marginTop: '12px', fontSize: '11px', color: 'var(--text-tertiary)', textAlign: 'center' }}>
          Made with ❤️ by <strong>sreevia ai</strong>
        </p>

        {/* Quick prefill panel (Only visible when not in sub-steps) */}
        {!mfaStep && !forgotStep ? (
          <div style={{
            marginTop: '24px',
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)',
            padding: '16px'
          }}>
            <p style={{ fontSize: '12px', fontWeight: 650, textTransform: 'uppercase', color: 'var(--text-tertiary)', letterSpacing: '0.05em', marginBottom: '10px', textAlign: 'center' }}>
              ⚡ Quick Seed Accounts (Click to Autofill)
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <Button size="sm" variant="ghost" style={{ fontSize: '11px', padding: '6px' }} onClick={() => prefillAccount('superadmin', 'superadmin', 'admin123')}>
                Super Admin
              </Button>
              <Button size="sm" variant="ghost" style={{ fontSize: '11px', padding: '6px' }} onClick={() => prefillAccount('admin', 'sfadmin', 'admin123')}>
                School Admin (Springfield)
              </Button>
              <Button size="sm" variant="ghost" style={{ fontSize: '11px', padding: '6px' }} onClick={() => prefillAccount('teacher', 'sfteacher', 'teacher123')}>
                Teacher (Springfield)
              </Button>
              <Button size="sm" variant="ghost" style={{ fontSize: '11px', padding: '6px' }} onClick={() => prefillAccount('student', 'sfstudent', 'student123')}>
                Student (Springfield)
              </Button>
              <div style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <Button size="sm" variant="ghost" style={{ fontSize: '11px', padding: '6px', width: '100%' }} onClick={() => prefillAccount('parent', 'sfparent', 'parent123')}>
                  Parent (Springfield)
                </Button>
                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '8px', display: 'flex', justifyContent: 'center' }}>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    style={{ fontSize: '10.5px', padding: '4px 10px', color: 'var(--text-secondary)', cursor: 'pointer' }}
                    onClick={() => {
                      if (confirm('Are you sure you want to reset all data changes and re-load default school database seeds?')) {
                        resetDatabase();
                        alert('Database successfully re-seeded with demo records!');
                        window.location.reload();
                      }
                    }}
                  >
                    Reset & Re-Seed Demo Data
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};
