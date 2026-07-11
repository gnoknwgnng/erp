import React, { useState } from 'react';
import { 
  Check, ArrowRight, CheckCircle, X, Sun, Moon
} from 'lucide-react';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Card } from '../../components/Card';
import { registerSchool, getPlans } from '../../db/dbEngine';

interface LandingPageProps {
  onLoginClick: () => void;
  onSchoolRegistered: (schoolName: string) => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onLoginClick, onSchoolRegistered, theme, toggleTheme }) => {
  const [showRegModal, setShowRegModal] = useState(false);
  const [regStep, setRegStep] = useState(1); // 1: Details, 2: Academic, 3: Verification
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');

  // Registration Form State
  const [formData, setFormData] = useState({
    schoolName: '',
    logo: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=100&auto=format&fit=crop&q=60',
    principalName: '',
    email: '',
    phone: '',
    address: '',
    country: 'United States',
    state: 'Oregon',
    city: 'Springfield',
    board: 'State' as any,
    type: 'High School' as any,
    studentCountRange: '100-500',
    planId: 'plan-pro',
    adminUsername: '',
    adminName: '',
    adminEmail: '',
    password: '',
    confirmPassword: ''
  });

  const [verificationCodes, setVerificationCodes] = useState({
    emailCode: '',
    phoneCode: ''
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const plans = getPlans();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
    if (formErrors[id]) {
      setFormErrors(prev => {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      });
    }
  };

  const validateStep1 = () => {
    const errors: Record<string, string> = {};
    if (!formData.schoolName) errors.schoolName = 'School Name is required';
    if (!formData.principalName) errors.principalName = 'Principal Name is required';
    if (!formData.email) errors.email = 'School Email is required';
    if (!formData.phone) errors.phone = 'Phone number is required';
    if (!formData.address) errors.address = 'Address is required';
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateStep2 = () => {
    const errors: Record<string, string> = {};
    if (!formData.adminUsername) errors.adminUsername = 'Admin username is required';
    if (!formData.adminName) errors.adminName = 'Admin Full Name is required';
    if (!formData.adminEmail) errors.adminEmail = 'Admin Email is required';
    if (!formData.password) errors.password = 'Password is required';
    if (formData.password !== formData.confirmPassword) errors.confirmPassword = 'Passwords do not match';
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const schoolDetails = {
        name: formData.schoolName,
        logo: formData.logo,
        principalName: formData.principalName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        country: formData.country,
        board: formData.board,
        type: formData.type,
        studentCountRange: formData.studentCountRange,
        planId: formData.planId
      };
      
      const adminDetails = {
        username: formData.adminUsername,
        name: formData.adminName,
        email: formData.adminEmail,
        passwordHash: formData.password
      };
      
      registerSchool(schoolDetails, adminDetails);
      
      setShowRegModal(false);
      onSchoolRegistered(formData.schoolName);
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div style={{ fontFamily: 'var(--font-sans)', color: 'var(--text-primary)', backgroundColor: 'var(--bg-primary)' }}>
      {/* Header Banner */}
      <header style={{
        height: '70px',
        borderBottom: '1px solid var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 5vw',
        position: 'sticky',
        top: 0,
        backgroundColor: theme === 'light' ? 'rgba(255,255,255,0.7)' : 'rgba(5,5,8,0.7)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        zIndex: 50
      }} className="glassmorphism">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: 'var(--primary-color)', color: '#ffffff', fontSize: '20px', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)' }}>
            Ω
          </div>
          <span style={{ fontSize: '18px', fontWeight: 700, fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}>
            OmniSchool <span style={{ color: 'var(--primary-color)', fontSize: '11px', verticalAlign: 'super', border: '1px solid var(--primary-color)', padding: '1px 4px', borderRadius: '4px', marginLeft: '4px' }}>SaaS</span>
          </span>
        </div>

        <nav className="landing-nav" style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <a href="#features" style={{ fontSize: '14px', textDecoration: 'none', color: 'var(--text-secondary)', fontWeight: 500 }}>Features</a>
          <a href="#pricing" style={{ fontSize: '14px', textDecoration: 'none', color: 'var(--text-secondary)', fontWeight: 500 }}>Pricing</a>
          <a href="#faq" style={{ fontSize: '14px', textDecoration: 'none', color: 'var(--text-secondary)', fontWeight: 500 }}>FAQ</a>
          
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

          <Button variant="outline" size="sm" onClick={onLoginClick}>Sign In</Button>
          <Button size="sm" onClick={() => { setShowRegModal(true); setRegStep(1); }}>Start Free Trial</Button>
        </nav>
      </header>

      {/* Hero Section */}
      <section style={{ padding: '90px 5vw', textAlign: 'center', background: 'radial-gradient(circle at top, var(--primary-glow) 0%, transparent 60%)' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <span style={{ display: 'inline-flex', padding: '6px 12px', borderRadius: '30px', backgroundColor: 'var(--primary-glow)', color: 'var(--primary-color)', fontSize: '12px', fontWeight: 600, marginBottom: '24px', border: '1px solid var(--border-color)' }}>
            ✨ Enterprise Multi-Tenant Platform
          </span>
          <h1 style={{ fontSize: '48px', fontWeight: 800, lineHeight: 1.15, fontFamily: 'var(--font-display)', marginBottom: '18px' }}>
            Complete Digital School <br />
            <span style={{ color: 'var(--primary-color)' }}>Management Platform</span>
          </h1>
          <p style={{ fontSize: '18px', color: 'var(--text-secondary)', marginBottom: '32px', lineHeight: 1.5 }}>
            Manage your entire school from one powerful cloud platform. Isolated tenant workspaces, parent portals, interactive timetables, GPS tracking, and automatic fee invoicing.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
            <Button size="lg" onClick={() => { setShowRegModal(true); setRegStep(1); }}>
              Start Free Trial <ArrowRight size={18} />
            </Button>
            <Button variant="outline" size="lg" onClick={() => alert('Demo scheduler coming soon!')}>
              Book Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Stats / Schools Section */}
      <section style={{ padding: '40px 5vw', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)', overflow: 'hidden' }}>
        <p style={{ textTransform: 'uppercase', fontSize: '11px', letterSpacing: '0.1em', color: 'var(--text-tertiary)', textAlign: 'center', fontWeight: 650, marginBottom: '24px' }}>
          Trusted by elite institutions worldwide
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '64px', opacity: 0.65, flexWrap: 'wrap' }}>
          <span style={{ fontWeight: 600, fontSize: '18px', fontFamily: 'var(--font-display)' }}>🏫 Springfield Academy</span>
          <span style={{ fontWeight: 600, fontSize: '18px', fontFamily: 'var(--font-display)' }}>🧙‍♂️ Hogwarts Witchcraft</span>
          <span style={{ fontWeight: 600, fontSize: '18px', fontFamily: 'var(--font-display)' }}>🎓 Metropolitan High</span>
          <span style={{ fontWeight: 600, fontSize: '18px', fontFamily: 'var(--font-display)' }}>🏛️ Cambridge International</span>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" style={{ padding: '80px 5vw' }}>
        <h2 style={{ fontSize: '28px', textAlign: 'center', marginBottom: '8px', fontFamily: 'var(--font-display)' }}>
          Powerful Modules for Modern Institutions
        </h2>
        <p style={{ color: 'var(--text-secondary)', textAlign: 'center', marginBottom: '48px' }}>
          A full-stack suite mapping the administration, grading, live classes, and bus fleets.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
          <Card 
            hoverable 
            title="School Administrator Console" 
            subtitle="Central administrative panel"
            style={{ padding: '24px' }}
          >
            <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: 1.4, marginTop: '8px' }}>
              Handle online admissions, ID card generation, promotions, fee categories, and staff salaries from a unified panel.
            </p>
          </Card>

          <Card 
            hoverable 
            title="Teacher Grading & Marks" 
            subtitle="Classroom tools for educators"
            style={{ padding: '24px' }}
          >
            <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: 1.4, marginTop: '8px' }}>
              Mark attendance, post homework files, upload curriculum files, compile unit-test marks, and chat with parents.
            </p>
          </Card>

          <Card 
            hoverable 
            title="Parent & Student Portal" 
            subtitle="Keep parents in the loop"
            style={{ padding: '24px' }}
          >
            <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: 1.4, marginTop: '8px' }}>
              View children's grades, pay fee invoices online, apply for student leaves, track the school bus live, and download certificates.
            </p>
          </Card>

          <Card 
            hoverable 
            title="Live GPS Fleet Tracking" 
            subtitle="Transport safety & routes"
            style={{ padding: '24px' }}
          >
            <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: 1.4, marginTop: '8px' }}>
              Monitor vehicle speeds, map stop sequences, and send arrival notifications to waiting parents dynamically.
            </p>
          </Card>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" style={{ padding: '80px 5vw', backgroundColor: 'var(--bg-secondary)', borderTop: '1px solid var(--border-color)' }}>
        <h2 style={{ fontSize: '28px', textAlign: 'center', marginBottom: '8px', fontFamily: 'var(--font-display)' }}>
          Flexible Plans for All Sizes
        </h2>
        <p style={{ color: 'var(--text-secondary)', textAlign: 'center', marginBottom: '24px' }}>
          Select the capacity that matches your current cohort. Cancel or upgrade anytime.
        </p>

        {/* Toggle */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', marginBottom: '40px' }}>
          <span style={{ fontSize: '13.5px', fontWeight: billingPeriod === 'monthly' ? 600 : 400 }}>Monthly</span>
          <button 
            onClick={() => setBillingPeriod(prev => prev === 'monthly' ? 'yearly' : 'monthly')}
            style={{
              width: '40px',
              height: '22px',
              borderRadius: '20px',
              backgroundColor: 'var(--primary-color)',
              border: 'none',
              cursor: 'pointer',
              position: 'relative',
              padding: '2px'
            }}
          >
            <div style={{
              width: '18px',
              height: '18px',
              borderRadius: '50%',
              backgroundColor: '#ffffff',
              position: 'absolute',
              top: '2px',
              left: billingPeriod === 'monthly' ? '2px' : '20px',
              transition: 'left var(--transition-fast)'
            }} />
          </button>
          <span style={{ fontSize: '13.5px', fontWeight: billingPeriod === 'yearly' ? 600 : 400 }}>
            Yearly <span style={{ color: 'var(--success-color)', fontSize: '11px', fontWeight: 600 }}>(Save 15%)</span>
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '28px', maxWidth: '1000px', margin: '0 auto' }}>
          {plans.map((plan) => {
            const price = billingPeriod === 'monthly' ? plan.priceMonthly : plan.priceYearly;
            const periodText = billingPeriod === 'monthly' ? '/mo' : '/yr';

            return (
              <Card
                key={plan.id}
                title={plan.name}
                style={{
                  border: plan.id === 'plan-pro' ? '2px solid var(--primary-color)' : '1px solid var(--border-color)',
                  backgroundColor: 'var(--bg-primary)'
                }}
                footer={
                  <Button 
                    variant={plan.id === 'plan-pro' ? 'primary' : 'outline'} 
                    style={{ width: '100%' }}
                    onClick={() => {
                      setFormData(prev => ({ ...prev, planId: plan.id }));
                      setShowRegModal(true);
                      setRegStep(1);
                    }}
                  >
                    Select Plan
                  </Button>
                }
              >
                <div style={{ margin: '16px 0' }}>
                  <span style={{ fontSize: '32px', fontWeight: 700, fontFamily: 'var(--font-display)' }}>
                    ${price}
                  </span>
                  <span style={{ color: 'var(--text-tertiary)', fontSize: '14px' }}>
                    {periodText}
                  </span>
                </div>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', padding: 0 }}>
                  <li style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Check size={14} color="var(--success-color)" /> Limit: {plan.studentLimit} students
                  </li>
                  <li style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Check size={14} color="var(--success-color)" /> Storage: {plan.storageLimit} GB space
                  </li>
                  {plan.features.map((feat, i) => (
                    <li key={i} style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Check size={14} color="var(--success-color)" /> {feat}
                    </li>
                  ))}
                </ul>
              </Card>
            );
          })}
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" style={{ padding: '80px 5vw', maxWidth: '800px', margin: '0 auto' }}>
        <h2 style={{ fontSize: '28px', textAlign: 'center', marginBottom: '32px', fontFamily: 'var(--font-display)' }}>
          Frequently Asked Questions
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <h4 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '6px' }}>How is student data isolated?</h4>
            <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)' }}>
              Each school gets its own schema workspace context. No school has permissions to access any database records referencing another school's ID.
            </p>
          </div>
          <div>
            <h4 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '6px' }}>Can we migrate our current student data?</h4>
            <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)' }}>
              Yes, the School Admin panel contains CSV and Excel template layouts allowing you to import student profiles, parents, and grades in seconds.
            </p>
          </div>
          <div>
            <h4 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '6px' }}>Does the parent portal have real payment processing?</h4>
            <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)' }}>
              Our payment module integrates Stripe and Razorpay checkout wrappers. Parents can pay their due tuition invoices instantly using standard card sheets.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--border-color)', padding: '40px 5vw', backgroundColor: 'var(--bg-secondary)', textAlign: 'center', fontSize: '13px', color: 'var(--text-secondary)' }}>
        <p>© 2026 OmniSchool SaaS Systems. Built for next-generation digital schooling. All rights reserved.</p>
        <p style={{ marginTop: '8px', fontSize: '11.5px', color: 'var(--text-tertiary)' }}>
          Made with ❤️ by <strong>sreevia ai</strong>
        </p>
      </footer>

      {/* SCHOOL REGISTRATION MODAL WIZARD */}
      {showRegModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: 'var(--bg-primary)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-color)',
            boxShadow: 'var(--shadow-lg)',
            width: '100%',
            maxWidth: '650px',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}>
            {/* Modal Header */}
            <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 600, fontFamily: 'var(--font-display)' }}>
                Register Your Institution
              </h2>
              <button 
                onClick={() => setShowRegModal(false)}
                style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-tertiary)' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Steps Indicator */}
            <div style={{ display: 'flex', padding: '12px 24px', backgroundColor: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)', justifyContent: 'space-around', fontSize: '12px' }}>
              <span style={{ fontWeight: regStep === 1 ? 700 : 400, color: regStep === 1 ? 'var(--primary-color)' : 'var(--text-secondary)' }}>1. Institution Details</span>
              <span style={{ fontWeight: regStep === 2 ? 700 : 400, color: regStep === 2 ? 'var(--primary-color)' : 'var(--text-secondary)' }}>2. Admin Settings</span>
              <span style={{ fontWeight: regStep === 3 ? 700 : 400, color: regStep === 3 ? 'var(--primary-color)' : 'var(--text-secondary)' }}>3. Verification Codes</span>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleRegisterSubmit} style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
              {regStep === 1 && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <Input 
                    label="School Name" 
                    id="schoolName" 
                    value={formData.schoolName} 
                    onChange={handleInputChange} 
                    error={formErrors.schoolName}
                    placeholder="e.g. Springfield Academy"
                  />
                  <Input 
                    label="Principal Name" 
                    id="principalName" 
                    value={formData.principalName} 
                    onChange={handleInputChange} 
                    error={formErrors.principalName}
                    placeholder="Seymour Skinner"
                  />
                  <Input 
                    label="School Email" 
                    id="email" 
                    type="email"
                    value={formData.email} 
                    onChange={handleInputChange} 
                    error={formErrors.email}
                    placeholder="info@springfield.edu"
                  />
                  <Input 
                    label="School Phone" 
                    id="phone" 
                    value={formData.phone} 
                    onChange={handleInputChange} 
                    error={formErrors.phone}
                    placeholder="+1-555-0100"
                  />
                  <div style={{ gridColumn: 'span 2' }}>
                    <Input 
                      label="School Address" 
                      id="address" 
                      value={formData.address} 
                      onChange={handleInputChange} 
                      error={formErrors.address}
                      placeholder="742 Evergreen Terrace"
                    />
                  </div>
                  <Input 
                    label="Board Affiliation" 
                    id="board" 
                    select 
                    value={formData.board}
                    onChange={handleInputChange}
                    options={[
                      { value: 'State', label: 'State Board' },
                      { value: 'CBSE', label: 'CBSE' },
                      { value: 'ICSE', label: 'ICSE' },
                      { value: 'IB', label: 'IB' },
                      { value: 'Cambridge', label: 'Cambridge' }
                    ]}
                  />
                  <Input 
                    label="Institution Type" 
                    id="type" 
                    select 
                    value={formData.type}
                    onChange={handleInputChange}
                    options={[
                      { value: 'Primary', label: 'Primary' },
                      { value: 'High School', label: 'High School' },
                      { value: 'College', label: 'College' },
                      { value: 'University', label: 'University' }
                    ]}
                  />
                  <Input 
                    label="Subscription Plan" 
                    id="planId" 
                    select 
                    value={formData.planId}
                    onChange={handleInputChange}
                    options={[
                      { value: 'plan-basic', label: 'Basic Plan ($99/mo)' },
                      { value: 'plan-pro', label: 'Professional Plan ($199/mo)' },
                      { value: 'plan-enterprise', label: 'Enterprise Plan ($399/mo)' }
                    ]}
                  />
                  <Input 
                    label="Student Count Estimate" 
                    id="studentCountRange" 
                    select 
                    value={formData.studentCountRange}
                    onChange={handleInputChange}
                    options={[
                      { value: '1-100', label: '1 - 100 students' },
                      { value: '100-500', label: '100 - 500 students' },
                      { value: '500-1000', label: '500 - 1000 students' },
                      { value: '1000+', label: '1000+ students' }
                    ]}
                  />
                </div>
              )}

              {regStep === 2 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <Input 
                    label="Admin Full Name" 
                    id="adminName" 
                    value={formData.adminName} 
                    onChange={handleInputChange} 
                    error={formErrors.adminName}
                    placeholder="Seymour Skinner"
                  />
                  <Input 
                    label="Admin Contact Email" 
                    id="adminEmail" 
                    type="email"
                    value={formData.adminEmail} 
                    onChange={handleInputChange} 
                    error={formErrors.adminEmail}
                    placeholder="skinner@springfield.edu"
                  />
                  <Input 
                    label="Admin Username (Login ID)" 
                    id="adminUsername" 
                    value={formData.adminUsername} 
                    onChange={handleInputChange} 
                    error={formErrors.adminUsername}
                    placeholder="sfadmin"
                  />
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <Input 
                      label="Password" 
                      id="password" 
                      type="password"
                      value={formData.password} 
                      onChange={handleInputChange} 
                      error={formErrors.password}
                    />
                    <Input 
                      label="Confirm Password" 
                      id="confirmPassword" 
                      type="password"
                      value={formData.confirmPassword} 
                      onChange={handleInputChange} 
                      error={formErrors.confirmPassword}
                    />
                  </div>
                </div>
              )}

              {regStep === 3 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'center' }}>
                  <CheckCircle size={48} color="var(--primary-color)" style={{ alignSelf: 'center', marginBottom: '8px' }} />
                  <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                    To finalize registration, enter the verification codes sent to your email and phone number.
                  </p>
                  
                  <div style={{ display: 'flex', gap: '16px', textAlign: 'left', marginTop: '12px' }}>
                    <Input 
                      label="Email Verification Code" 
                      value={verificationCodes.emailCode}
                      onChange={(e) => setVerificationCodes(prev => ({ ...prev, emailCode: e.target.value }))}
                      placeholder="e.g. 123456 (Simulated)"
                      helperText="Check your registered email address"
                    />
                    <Input 
                      label="Phone SMS OTP" 
                      value={verificationCodes.phoneCode}
                      onChange={(e) => setVerificationCodes(prev => ({ ...prev, phoneCode: e.target.value }))}
                      placeholder="e.g. 987654 (Simulated)"
                      helperText="Check your mobile phone"
                    />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={() => setVerificationCodes({ emailCode: '123456', phoneCode: '987654' })}
                    >
                      Prefill Mock Codes
                    </Button>
                  </div>
                </div>
              )}
            </form>

            {/* Modal Footer */}
            <div style={{ padding: '14px 24px', borderTop: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)', display: 'flex', justifyContent: 'space-between' }}>
              {regStep > 1 ? (
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setRegStep(prev => prev - 1)}
                >
                  Back
                </Button>
              ) : <div />}

              {regStep === 1 ? (
                <Button 
                  type="button" 
                  onClick={() => validateStep1() && setRegStep(2)}
                >
                  Continue
                </Button>
              ) : regStep === 2 ? (
                <Button 
                  type="button" 
                  onClick={() => validateStep2() && setRegStep(3)}
                >
                  Go to Verification
                </Button>
              ) : (
                <Button 
                  type="button" 
                  disabled={!verificationCodes.emailCode || !verificationCodes.phoneCode}
                  onClick={(e) => handleRegisterSubmit(e)}
                >
                  Verify & Create Workspace
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
