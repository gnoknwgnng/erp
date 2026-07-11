import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, Trash2, Play, Pause, Plus, Edit, Send
} from 'lucide-react';
import { Card } from '../../components/Card';
import { Table } from '../../components/Table';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Dialog } from '../../components/Dialog';
import { LineChart, BarChart } from '../../components/Charts';
import { 
  getSchools, getPlans, getAuditLogs, getSupportTickets, 
  updateSchoolStatus, deleteSchool, resolveTicket, addAuditLog,
  getCoupons, createCoupon, toggleCouponStatus, deleteCoupon,
  getWishes, dispatchWish, getOrders, updateSubscriptionPlan
} from '../../db/dbEngine';
import type { School, SubscriptionPlan, AuditLog, SupportTicket, Coupon, Wish, Order } from '../../db/initialData';

interface SuperAdminDashboardProps {
  activeTab: string;
}

export const SuperAdminDashboard: React.FC<SuperAdminDashboardProps> = ({ activeTab }) => {
  const [schools, setSchools] = useState<School[]>([]);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  
  // Modals state
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Edit Plans Modal
  const [showEditPlan, setShowEditPlan] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [planForm, setPlanForm] = useState({
    name: '',
    priceMonthly: 0,
    priceYearly: 0,
    studentLimit: 0,
    storageLimit: 0,
    features: ''
  });

  // Coupons Modal
  const [showCreateCoupon, setShowCreateCoupon] = useState(false);
  const [couponForm, setCouponForm] = useState({
    code: '',
    discountType: 'percentage' as 'percentage' | 'flat',
    discountValue: 0,
    expiryDate: '',
    status: 'active' as 'active' | 'inactive'
  });

  // Wishes Form
  const [wishForm, setWishForm] = useState({
    title: '',
    message: '',
    category: 'announcement' as 'announcement' | 'festive' | 'maintenance'
  });

  // Platform setting states
  const [gatewayConfig, setGatewayConfig] = useState({
    stripeKey: 'pk_live_51M...',
    razorpayKey: 'rzp_live_8a...',
    emailSender: 'no-reply@omnischool.com',
    smsGateway: 'Twilio Gateway'
  });

  const loadData = () => {
    setSchools(getSchools());
    setPlans(getPlans());
    setAuditLogs(getAuditLogs(null));
    setTickets(getSupportTickets(null));
    setCoupons(getCoupons());
    setWishes(getWishes());
    setOrders(getOrders());
  };

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const handleStatusChange = (schoolId: string, status: 'active' | 'suspended') => {
    updateSchoolStatus(schoolId, status);
    loadData();
  };

  const handleApprove = (schoolId: string) => {
    updateSchoolStatus(schoolId, 'active');
    loadData();
  };

  const handleDeleteClick = (school: School) => {
    setSelectedSchool(school);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = () => {
    if (selectedSchool) {
      deleteSchool(selectedSchool.id);
      setShowDeleteConfirm(false);
      setSelectedSchool(null);
      loadData();
    }
  };

  const handleResolveTicket = (ticketId: string) => {
    resolveTicket(ticketId);
    loadData();
  };

  // Plan Edit Handlers
  const openEditPlan = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
    setPlanForm({
      name: plan.name,
      priceMonthly: plan.priceMonthly,
      priceYearly: plan.priceYearly,
      studentLimit: plan.studentLimit,
      storageLimit: plan.storageLimit,
      features: plan.features.join(', ')
    });
    setShowEditPlan(true);
  };

  const handleEditPlanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedPlan) {
      const updated = updateSubscriptionPlan(selectedPlan.id, {
        name: planForm.name,
        priceMonthly: Number(planForm.priceMonthly),
        priceYearly: Number(planForm.priceYearly),
        studentLimit: Number(planForm.studentLimit),
        storageLimit: Number(planForm.storageLimit),
        features: planForm.features.split(',').map(f => f.trim()).filter(Boolean)
      });
      setPlans(updated);
      setShowEditPlan(false);
      alert('Subscription plan updated successfully!');
    }
  };

  // Coupon Handlers
  const handleCreateCouponSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponForm.code.trim()) return alert('Coupon code is required');
    const updated = createCoupon({
      code: couponForm.code.toUpperCase().replace(/\s/g, ''),
      discountType: couponForm.discountType,
      discountValue: Number(couponForm.discountValue),
      expiryDate: couponForm.expiryDate || new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0],
      status: couponForm.status
    });
    setCoupons(updated);
    setShowCreateCoupon(false);
    setCouponForm({ code: '', discountType: 'percentage', discountValue: 0, expiryDate: '', status: 'active' });
    alert('Discount promo coupon created!');
  };

  const handleToggleCoupon = (couponId: string, currentStatus: 'active' | 'inactive') => {
    const nextStatus = currentStatus === 'active' ? 'inactive' : 'active';
    const updated = toggleCouponStatus(couponId, nextStatus);
    setCoupons(updated);
  };

  const handleDeleteCoupon = (couponId: string) => {
    if (confirm('Delete this discount coupon code?')) {
      const updated = deleteCoupon(couponId);
      setCoupons(updated);
    }
  };

  // Wishes / Announcements Handlers
  const handleDispatchWishSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!wishForm.title.trim() || !wishForm.message.trim()) return alert('Title and message are required');
    const updated = dispatchWish({
      title: wishForm.title,
      message: wishForm.message,
      category: wishForm.category
    });
    setWishes(updated);
    setWishForm({ title: '', message: '', category: 'announcement' });
    alert('Holiday wishes / announcements dispatched to all institutions successfully!');
  };

  // Calculations for KPI
  const activeSchools = schools.filter(s => s.status === 'active');
  const pendingSchools = schools.filter(s => s.status === 'pending');

  const totalRevenue = activeSchools.reduce((acc, curr) => {
    const plan = plans.find(p => p.id === curr.planId);
    return acc + (plan ? plan.priceMonthly : 0);
  }, 0);

  // Charts Mock Data
  const revenueGrowthData = [
    { label: 'Jan', value: 1200 },
    { label: 'Feb', value: 2100 },
    { label: 'Mar', value: 3400 },
    { label: 'Apr', value: 4500 },
    { label: 'May', value: 6200 },
    { label: 'Jun', value: 7800 },
    { label: 'Jul', value: totalRevenue }
  ];

  const schoolGrowthData = [
    { label: 'Q1 2026', value: 5 },
    { label: 'Q2 2026', value: 12 },
    { label: 'Q3 2026', value: schools.length }
  ];

  return (
    <div>
      {/* 1. PORTAL OVERVIEW TAB */}
      {activeTab === 'dashboard' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* KPI Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
            <Card title="Total Schools" subtitle="Registered tenants" style={{ borderLeft: '4px solid var(--primary-color)' }}>
              <div style={{ fontSize: '28px', fontWeight: 700, margin: '8px 0', fontFamily: 'var(--font-display)' }}>
                {schools.length}
              </div>
              <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
                {activeSchools.length} active · {pendingSchools.length} pending
              </span>
            </Card>

            <Card title="Monthly MRR" subtitle="Active subscription revenue" style={{ borderLeft: '4px solid var(--success-color)' }}>
              <div style={{ fontSize: '28px', fontWeight: 700, margin: '8px 0', fontFamily: 'var(--font-display)' }}>
                ${totalRevenue}
              </div>
              <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
                Average ${Math.round(totalRevenue / (activeSchools.length || 1))}/school
              </span>
            </Card>

            <Card title="Open Support" subtitle="Pending help desk issues" style={{ borderLeft: '4px solid var(--warning-color)' }}>
              <div style={{ fontSize: '28px', fontWeight: 700, margin: '8px 0', fontFamily: 'var(--font-display)' }}>
                {tickets.filter(t => t.status === 'open').length}
              </div>
              <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
                Response time: &lt; 2 hours
              </span>
            </Card>

            <Card title="Pending Approvals" subtitle="Awaiting tenant setup" style={{ borderLeft: '4px solid var(--accent-color)' }}>
              <div style={{ fontSize: '28px', fontWeight: 700, margin: '8px 0', fontFamily: 'var(--font-display)' }}>
                {pendingSchools.length}
              </div>
              <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
                Requires admin confirmation
              </span>
            </Card>
          </div>

          {/* Charts Row */}
          <div className="charts-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', flexWrap: 'wrap' }}>
            <Card title="MRR Revenue Growth" subtitle="Monthly recurring revenue curve (USD)">
              <div style={{ padding: '8px' }}>
                <LineChart data={revenueGrowthData} height={200} />
              </div>
            </Card>
            <Card title="Workspace Registrations" subtitle="Cumulative institutions signed-up">
              <div style={{ padding: '8px' }}>
                <BarChart data={schoolGrowthData} height={200} />
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* 2. SCHOOLS REGISTRY TAB */}
      {activeTab === 'schools' && (
        <Card title="Institution Registry" subtitle="Manage school access, licenses, and deployment pipelines.">
          <div style={{ marginTop: '16px' }}>
            <Table
              data={schools}
              columns={[
                {
                  key: 'school',
                  title: 'School Profile',
                  render: (row) => (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <img src={row.logo} alt="" style={{ width: '28px', height: '28px', borderRadius: '4px', objectFit: 'cover' }} />
                      <div>
                        <div style={{ fontWeight: 600 }}>{row.name}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{row.city}, {row.state}</div>
                      </div>
                    </div>
                  )
                },
                { key: 'principalName', title: 'Principal' },
                {
                  key: 'board',
                  title: 'Affiliation',
                  render: (row) => `${row.type} · ${row.board}`
                },
                {
                  key: 'planId',
                  title: 'Subscription',
                  render: (row) => {
                    const plan = plans.find(p => p.id === row.planId);
                    return plan ? plan.name : 'Unknown';
                  }
                },
                {
                  key: 'status',
                  title: 'Status',
                  render: (row) => {
                    const badgeClass = {
                      active: 'badge-success',
                      pending: 'badge-warning',
                      suspended: 'badge-error'
                    }[row.status] || 'badge-info';
                    return (
                      <span className={`badge ${badgeClass}`} style={{ textTransform: 'capitalize' }}>
                        {row.status}
                      </span>
                    );
                  }
                },
                {
                  key: 'actions',
                  title: 'Actions',
                  align: 'right',
                  render: (row) => (
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      {row.status === 'pending' ? (
                        <Button size="sm" onClick={() => handleApprove(row.id)}>
                          Approve Tenant
                        </Button>
                      ) : row.status === 'active' ? (
                        <Button size="sm" variant="secondary" onClick={() => handleStatusChange(row.id, 'suspended')}>
                          <Pause size={12} style={{ marginRight: '4px' }} /> Suspend
                        </Button>
                      ) : (
                        <Button size="sm" variant="outline" onClick={() => handleStatusChange(row.id, 'active')}>
                          <Play size={12} style={{ marginRight: '4px' }} /> Activate
                        </Button>
                      )}
                      <Button size="sm" variant="ghost" onClick={() => handleDeleteClick(row)}>
                        <Trash2 size={13} color="var(--error-color)" />
                      </Button>
                    </div>
                  )
                }
              ]}
            />
          </div>
        </Card>
      )}

      {/* 3. SUBSCRIPTION PLANS TAB */}
      {activeTab === 'plans' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
            {plans.map((plan) => (
              <Card 
                key={plan.id} 
                title={plan.name} 
                subtitle={`Monthly: $${plan.priceMonthly} | Yearly: $${plan.priceYearly}`}
                extra={
                  <Button size="sm" variant="ghost" style={{ cursor: 'pointer' }} onClick={() => openEditPlan(plan)}>
                    <Edit size={13} style={{ marginRight: '4px' }} /> Edit
                  </Button>
                }
              >
                <div style={{ marginTop: '12px' }}>
                  <p style={{ fontSize: '13px', margin: '4px 0' }}>
                    <strong>Student Quota:</strong> Up to {plan.studentLimit} users
                  </p>
                  <p style={{ fontSize: '13px', margin: '4px 0' }}>
                    <strong>Storage Quota:</strong> {plan.storageLimit} GB cloud space
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '12px' }}>
                    {plan.features.map((f, i) => (
                      <span key={i} style={{ fontSize: '11px', backgroundColor: 'var(--bg-tertiary)', padding: '2px 6px', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* 3b. PROMO COUPONS TAB */}
      {activeTab === 'coupons' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <Card 
            title="Discount Coupons Registry" 
            subtitle="Manage subscription promotional coupon codes."
            extra={
              <Button size="sm" style={{ cursor: 'pointer' }} onClick={() => setShowCreateCoupon(true)}>
                <Plus size={14} /> Create Coupon
              </Button>
            }
          >
            <div style={{ marginTop: '16px' }}>
              <Table
                data={coupons}
                columns={[
                  { key: 'code', title: 'Promo Code' },
                  {
                    key: 'discount',
                    title: 'Discount Value',
                    render: (row) => row.discountType === 'percentage' ? `${row.discountValue}% Off` : `$${row.discountValue} Flat`
                  },
                  { key: 'expiryDate', title: 'Expiry Date' },
                  {
                    key: 'status',
                    title: 'Status',
                    render: (row) => (
                      <span className={`badge ${row.status === 'active' ? 'badge-success' : 'badge-error'}`} style={{ textTransform: 'capitalize' }}>
                        {row.status}
                      </span>
                    )
                  },
                  {
                    key: 'actions',
                    title: 'Actions',
                    align: 'right',
                    render: (row) => (
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <Button size="sm" variant="outline" style={{ cursor: 'pointer' }} onClick={() => handleToggleCoupon(row.id, row.status)}>
                          {row.status === 'active' ? 'Deactivate' : 'Activate'}
                        </Button>
                        <Button size="sm" variant="ghost" style={{ cursor: 'pointer' }} onClick={() => handleDeleteCoupon(row.id)}>
                          <Trash2 size={13} color="var(--error-color)" />
                        </Button>
                      </div>
                    )
                  }
                ]}
              />
            </div>
          </Card>
        </div>
      )}

      {/* 3c. BROADCAST WISHES TAB */}
      {activeTab === 'wishes' && (
        <div className="charts-grid" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px' }}>
          <Card title="Compose Announcement Broadcast" subtitle="Send announcements and greetings to all registered school tenants.">
            <form onSubmit={handleDispatchWishSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '16px' }}>
              <div className="charts-grid" style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '12px' }}>
                <Input 
                  label="Broadcast Title" 
                  placeholder="e.g. Happy Holidays!"
                  value={wishForm.title}
                  onChange={(e) => setWishForm(prev => ({ ...prev, title: e.target.value }))}
                />
                <Input 
                  label="Broadcast Type" 
                  type="select"
                  value={wishForm.category}
                  onChange={(e) => setWishForm(prev => ({ ...prev, category: e.target.value as any }))}
                >
                  <option value="announcement">Announcement</option>
                  <option value="festive">Festive Wishes</option>
                  <option value="maintenance">Maintenance Alert</option>
                </Input>
              </div>
              <Input 
                label="Message Broadcast Body"
                type="textarea"
                rows={4}
                placeholder="Write your greeting or update details here..."
                value={wishForm.message}
                onChange={(e) => setWishForm(prev => ({ ...prev, message: e.target.value }))}
              />
              <Button type="submit" style={{ alignSelf: 'flex-start', cursor: 'pointer' }}>
                <Send size={13} style={{ marginRight: '6px' }} /> Dispatch Broadcast
              </Button>
            </form>
          </Card>

          <Card title="Dispatched Broadcasts History" subtitle="Archive logs of announcements sent to schools.">
            <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '420px', overflowY: 'auto' }}>
              {wishes.length === 0 ? (
                <p style={{ fontStyle: 'italic', color: 'var(--text-tertiary)', fontSize: '13px' }}>No broadcasts dispatched yet.</p>
              ) : (
                wishes.map((w) => (
                  <div key={w.id} style={{ padding: '14px', border: '1px solid var(--border-color)', borderRadius: '8px', backgroundColor: 'var(--bg-secondary)', backdropFilter: 'blur(10px)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <strong style={{ fontSize: '13.5px' }}>{w.title}</strong>
                      <span className={`badge ${w.category === 'festive' ? 'badge-success' : w.category === 'maintenance' ? 'badge-error' : 'badge-info'}`} style={{ textTransform: 'capitalize', fontSize: '10px', padding: '2px 6px' }}>
                        {w.category}
                      </span>
                    </div>
                    <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>{w.message}</p>
                    <span style={{ fontSize: '10px', color: 'var(--text-tertiary)', display: 'block', marginTop: '8px' }}>
                      Sent: {new Date(w.dispatchedAt).toLocaleString()}
                    </span>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      )}

      {/* 3d. SAAS ORDERS REGISTRY TAB */}
      {activeTab === 'orders' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Metrics Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
            <Card title="Gross Platform Sales" subtitle="Total paid subscription orders volume" className="stat-card-glow" style={{ borderLeft: '4px solid var(--success-color)' }}>
              <div style={{ fontSize: '28px', fontWeight: 700, margin: '8px 0', fontFamily: 'var(--font-display)' }}>
                ${orders.filter(o => o.status === 'paid').reduce((acc, curr) => acc + curr.amount, 0)}
              </div>
              <span style={{ fontSize: '11px', color: 'var(--success-color)', fontWeight: 650 }}>
                100% Stripe & Paypal processing
              </span>
            </Card>
            <Card title="Active Invoices" subtitle="Awaiting renewal processing" className="stat-card-glow" style={{ borderLeft: '4px solid var(--warning-color)' }}>
              <div style={{ fontSize: '28px', fontWeight: 700, margin: '8px 0', fontFamily: 'var(--font-display)' }}>
                {orders.filter(o => o.status === 'pending').length}
              </div>
              <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
                Auto-collection: twilio enabled
              </span>
            </Card>
          </div>

          <Card title="Purchase Orders Ledger" subtitle="List of billing checkout records generated by school subscriptions.">
            <div style={{ marginTop: '16px' }}>
              <Table
                data={orders}
                columns={[
                  { key: 'id', title: 'Order ID' },
                  { key: 'schoolName', title: 'School Name' },
                  { key: 'planName', title: 'Plan Selected' },
                  {
                    key: 'amount',
                    title: 'Transaction Value',
                    render: (row) => `$${row.amount} / ${row.billingCycle}`
                  },
                  { key: 'paymentMethod', title: 'Gateway Mode' },
                  {
                    key: 'status',
                    title: 'Payment Status',
                    render: (row) => (
                      <span className={`badge ${row.status === 'paid' ? 'badge-success' : row.status === 'pending' ? 'badge-warning' : 'badge-error'}`} style={{ textTransform: 'capitalize' }}>
                        {row.status}
                      </span>
                    )
                  },
                  {
                    key: 'createdAt',
                    title: 'Order Date',
                    render: (row) => new Date(row.createdAt).toLocaleDateString()
                  }
                ]}
              />
            </div>
          </Card>
        </div>
      )}

      {/* 4. SUPPORT TICKETS TAB */}
      {activeTab === 'support' && (
        <Card title="Help Desk Board" subtitle="Address support requests raised by tenant administrators.">
          <div style={{ marginTop: '16px' }}>
            <Table
              data={tickets}
              columns={[
                { key: 'schoolName', title: 'Institution' },
                { key: 'subject', title: 'Subject' },
                { key: 'description', title: 'Details', width: '250px' },
                {
                  key: 'createdAt',
                  title: 'Date Raised',
                  render: (row) => new Date(row.createdAt).toLocaleDateString()
                },
                {
                  key: 'status',
                  title: 'Ticket State',
                  render: (row) => (
                    <span style={{ 
                      padding: '3px 8px', 
                      borderRadius: '4px', 
                      fontSize: '11px', 
                      fontWeight: 600, 
                      color: row.status === 'open' ? 'var(--error-color)' : 'var(--success-color)',
                      backgroundColor: row.status === 'open' ? 'var(--error-bg)' : 'var(--success-bg)'
                    }}>
                      {row.status === 'open' ? 'Open' : 'Resolved'}
                    </span>
                  )
                },
                {
                  key: 'actions',
                  title: 'Actions',
                  align: 'right',
                  render: (row) => (
                    row.status === 'open' ? (
                      <Button size="sm" onClick={() => handleResolveTicket(row.id)}>
                        Mark Resolved
                      </Button>
                    ) : <span style={{ color: 'var(--text-tertiary)', fontSize: '12px' }}>N/A</span>
                  )
                }
              ]}
            />
          </div>
        </Card>
      )}

      {/* 5. PLATFORM SETTINGS TAB */}
      {activeTab === 'settings' && (
        <div className="charts-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          <Card title="Core Gateway Credentials" subtitle="Configure platform-wide integrations">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
              <Input 
                label="Stripe Live API Key" 
                type="password" 
                value={gatewayConfig.stripeKey} 
                onChange={(e) => setGatewayConfig(prev => ({ ...prev, stripeKey: e.target.value }))} 
              />
              <Input 
                label="Razorpay API Key" 
                type="password" 
                value={gatewayConfig.razorpayKey} 
                onChange={(e) => setGatewayConfig(prev => ({ ...prev, razorpayKey: e.target.value }))} 
              />
              <Button onClick={() => {
                addAuditLog(null, 'superadmin', 'Super Admin', 'Updated Stripe & Razorpay gateway configurations');
                alert('API Settings updated successfully!');
              }}>
                Save Gateway Configurations
              </Button>
            </div>
          </Card>

          <Card title="Email & SMS System" subtitle="Configure notifications engines">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
              <Input 
                label="SMTP Sender Email" 
                value={gatewayConfig.emailSender} 
                onChange={(e) => setGatewayConfig(prev => ({ ...prev, emailSender: e.target.value }))} 
              />
              <Input 
                label="SMS Provider" 
                value={gatewayConfig.smsGateway} 
                onChange={(e) => setGatewayConfig(prev => ({ ...prev, smsGateway: e.target.value }))} 
              />
              <Button onClick={() => {
                addAuditLog(null, 'superadmin', 'Super Admin', 'Updated global SMTP & Twilio SMS integrations');
                alert('Notification providers saved successfully!');
              }}>
                Save Mail/SMS Settings
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* 6. AUDIT LOGS TAB */}
      {activeTab === 'logs' && (
        <Card title="Global Platform Logs" subtitle="Security audit logs tracing superadmin and tenant actions.">
          <div style={{ marginTop: '16px' }}>
            <Table
              data={auditLogs}
              columns={[
                {
                  key: 'timestamp',
                  title: 'Timestamp',
                  render: (row) => new Date(row.timestamp).toLocaleString()
                },
                {
                  key: 'user',
                  title: 'Triggered By',
                  render: (row) => (
                    <div>
                      <div style={{ fontWeight: 500 }}>{row.userName}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>ID: {row.userId}</div>
                    </div>
                  )
                },
                { key: 'action', title: 'Operation Action' },
                { key: 'ipAddress', title: 'Network IP' }
              ]}
            />
          </div>
        </Card>
      )}

      {/* DELETE CONFIRM DIALOG */}
      <Dialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title="Confirm School Deletion"
        footer={
          <>
            <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>Cancel</Button>
            <Button variant="danger" onClick={handleConfirmDelete}>Permanently Delete Workspace</Button>
          </>
        }
      >
        <div style={{ textAlign: 'center', padding: '10px 0' }}>
          <AlertTriangle size={48} color="var(--error-color)" style={{ marginBottom: '16px' }} />
          <p style={{ fontWeight: 600, fontSize: '16px', marginBottom: '8px' }}>
            Are you sure you want to delete {selectedSchool?.name}?
          </p>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            This action is irreversible. All classrooms, teachers, grades, parents, and student records belonging to this school will be permanently erased from the platform.
          </p>
        </div>
      </Dialog>

      {/* EDIT SUBSCRIPTION PLAN DIALOG */}
      <Dialog
        isOpen={showEditPlan}
        onClose={() => setShowEditPlan(false)}
        title={`Edit Subscription: ${selectedPlan?.name}`}
        footer={
          <>
            <Button variant="outline" onClick={() => setShowEditPlan(false)}>Cancel</Button>
            <Button onClick={handleEditPlanSubmit}>Save Subscription Plan</Button>
          </>
        }
      >
        <form onSubmit={handleEditPlanSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <Input 
            label="Plan Display Name" 
            value={planForm.name} 
            onChange={(e) => setPlanForm(prev => ({ ...prev, name: e.target.value }))}
          />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <Input 
              label="Price (Monthly)" 
              type="number" 
              value={planForm.priceMonthly} 
              onChange={(e) => setPlanForm(prev => ({ ...prev, priceMonthly: Number(e.target.value) }))}
            />
            <Input 
              label="Price (Yearly)" 
              type="number" 
              value={planForm.priceYearly} 
              onChange={(e) => setPlanForm(prev => ({ ...prev, priceYearly: Number(e.target.value) }))}
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <Input 
              label="Max Student Quota" 
              type="number" 
              value={planForm.studentLimit} 
              onChange={(e) => setPlanForm(prev => ({ ...prev, studentLimit: Number(e.target.value) }))}
            />
            <Input 
              label="Max Storage Limit (GB)" 
              type="number" 
              value={planForm.storageLimit} 
              onChange={(e) => setPlanForm(prev => ({ ...prev, storageLimit: Number(e.target.value) }))}
            />
          </div>
          <Input 
            label="Features list (comma separated)" 
            type="textarea"
            rows={3}
            value={planForm.features} 
            onChange={(e) => setPlanForm(prev => ({ ...prev, features: e.target.value }))}
          />
        </form>
      </Dialog>

      {/* CREATE PROMO COUPON DIALOG */}
      <Dialog
        isOpen={showCreateCoupon}
        onClose={() => setShowCreateCoupon(false)}
        title="Create Subscription Promo Coupon"
        footer={
          <>
            <Button variant="outline" onClick={() => setShowCreateCoupon(false)}>Cancel</Button>
            <Button onClick={handleCreateCouponSubmit}>Activate Promo Coupon</Button>
          </>
        }
      >
        <form onSubmit={handleCreateCouponSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <Input 
            label="Coupon Code (alphanumeric)" 
            placeholder="e.g. HALFOFF"
            value={couponForm.code} 
            onChange={(e) => setCouponForm(prev => ({ ...prev, code: e.target.value }))}
          />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <Input 
              label="Discount Type" 
              type="select"
              value={couponForm.discountType} 
              onChange={(e) => setCouponForm(prev => ({ ...prev, discountType: e.target.value as any }))}
            >
              <option value="percentage">Percentage (%)</option>
              <option value="flat">Flat Value ($)</option>
            </Input>
            <Input 
              label="Discount Value" 
              type="number" 
              value={couponForm.discountValue} 
              onChange={(e) => setCouponForm(prev => ({ ...prev, discountValue: Number(e.target.value) }))}
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <Input 
              label="Expiration Date" 
              type="date" 
              value={couponForm.expiryDate} 
              onChange={(e) => setCouponForm(prev => ({ ...prev, expiryDate: e.target.value }))}
            />
            <Input 
              label="Coupon State" 
              type="select"
              value={couponForm.status} 
              onChange={(e) => setCouponForm(prev => ({ ...prev, status: e.target.value as any }))}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </Input>
          </div>
        </form>
      </Dialog>
    </div>
  );
};
