import React, { useState, useEffect, useRef } from 'react';
import { 
  FileText, Check, ShieldCheck
} from 'lucide-react';
import { Card } from '../../components/Card';
import { Table } from '../../components/Table';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Dialog } from '../../components/Dialog';
import { 
  getSchoolData, getSchoolUsers, submitHomework, collectFee, addAuditLog, updateBusGPS 
} from '../../db/dbEngine';
import type { School, User } from '../../db/initialData';

interface ParentDashboardProps {
  activeTab: string;
  school: School;
  user: User;
}

export const ParentDashboard: React.FC<ParentDashboardProps> = ({ activeTab, school, user }) => {
  const schoolId = school.id;

  // Multi-tenant ERP States
  const [children, setChildren] = useState<any[]>([]);
  const [activeChildIdx, setActiveChildIdx] = useState(0);

  // Student metrics
  const [attendance, setAttendance] = useState<any[]>([]);
  const [homework, setHomework] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [timetable, setTimetable] = useState<any[]>([]);
  const [marks, setMarks] = useState<any[]>([]);
  const [exams, setExams] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [fees, setFees] = useState<any[]>([]);
  const [feeCategories, setFeeCategories] = useState<any[]>([]);
  const [routes, setRoutes] = useState<any[]>([]);

  // Local UI states
  const [showCheckout, setShowCheckout] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null);
  const [cardDetails, setCardDetails] = useState({ number: '', expiry: '', cvc: '', name: '' });
  const [paymentLoading, setPaymentLoading] = useState(false);

  const [showHomeworkModal, setShowHomeworkModal] = useState(false);
  const [selectedHw, setSelectedHw] = useState<any | null>(null);
  const [hwFileName, setHwFileName] = useState('lisa_algebra_solved.pdf');

  const [showReportCard, setShowReportCard] = useState(false);
  const [showCertificate, setShowCertificate] = useState(false);
  const [activeCert, setActiveCert] = useState<{ type: string; title: string } | null>(null);

  // GPS bus animation refs
  const [busProgress, setBusProgress] = useState(0);
  const busIntervalRef = useRef<any>(null);

  const activeChild = children[activeChildIdx];

  const loadParentData = () => {
    const parentProfileList = getSchoolData<any>('erp_parents', schoolId);
    const parentRecord = parentProfileList.find(p => p.userId === user.id);
    
    if (parentRecord) {
      const studentProfiles = getSchoolData<any>('erp_students', schoolId);
      const schoolUsers = getSchoolUsers(schoolId);
      
      const linkedStudents = studentProfiles
        .filter(s => parentRecord.childrenIds.includes(s.id))
        .map(s => {
          const childUser = schoolUsers.find(u => u.id === s.userId);
          const cls = getSchoolData<any>('erp_classes', schoolId).find(c => c.id === s.classId);
          return {
            ...s,
            name: childUser ? childUser.name : 'Child Student',
            className: cls ? `${cls.className}-${cls.sectionName}` : 'Unassigned'
          };
        });
      
      setChildren(linkedStudents);
    }
  };

  const loadChildMetrics = () => {
    if (!activeChild) return;

    const childId = activeChild.id;

    // Load Attendance
    const attList = getSchoolData<any>('erp_attendance', schoolId).filter(a => a.studentId === childId);
    setAttendance(attList);

    // Load Homework
    const hwList = getSchoolData<any>('erp_homework', schoolId).filter(h => h.classId === activeChild.classId);
    setHomework(hwList);

    // Load Submissions
    const subList = getSchoolData<any>('erp_submissions', schoolId).filter(s => s.studentId === childId);
    setSubmissions(subList);

    // Load Timetable
    const allocs = getSchoolData<any>('erp_allocations', schoolId).filter(a => a.classId === activeChild.classId);
    setTimetable(allocs);

    const subjs = getSchoolData<any>('erp_subjects', schoolId);
    setSubjects(subjs);

    // Load Marks
    const mrksList = getSchoolData<any>('erp_marks', schoolId).filter(m => m.studentId === childId);
    setMarks(mrksList);

    const exms = getSchoolData<any>('erp_exams', schoolId);
    setExams(exms);

    // Load Fees Invoices
    const fInvoices = getSchoolData<any>('erp_fee_payments', schoolId).filter(f => f.studentId === childId);
    setFees(fInvoices);

    const fCategories = getSchoolData<any>('erp_fee_categories', schoolId);
    setFeeCategories(fCategories);

    // Load Transport
    const trans = getSchoolData<any>('erp_routes', schoolId);
    setRoutes(trans);
  };

  useEffect(() => {
    loadParentData();
  }, [schoolId]);

  useEffect(() => {
    loadChildMetrics();
  }, [children, activeChildIdx]);

  // GPS bus animation simulation
  useEffect(() => {
    if (activeTab === 'bustracking' && routes.length > 0) {
      // Start moving bus icon between coordinates
      const route = routes[0];
      const stops = route.stops;

      let index = 0;
      busIntervalRef.current = setInterval(() => {
        index = (index + 1) % stops.length;
        setBusProgress(index);
        
        // Update GPS globally
        updateBusGPS(schoolId, route.id, stops[index].lat, stops[index].lng);
      }, 3000);
    } else {
      if (busIntervalRef.current) clearInterval(busIntervalRef.current);
    }

    return () => {
      if (busIntervalRef.current) clearInterval(busIntervalRef.current);
    };
  }, [activeTab, routes]);

  // Homework submit handler
  const handleHwSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedHw && activeChild) {
      submitHomework(schoolId, selectedHw.id, activeChild.id, hwFileName);
      setShowHomeworkModal(false);
      loadChildMetrics();
    }
  };

  // Checkout Payment
  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPaymentLoading(true);

    setTimeout(() => {
      if (selectedInvoice && activeChild) {
        const cat = feeCategories.find(c => c.id === selectedInvoice.categoryId);
        collectFee(schoolId, activeChild.id, selectedInvoice.categoryId, cat ? cat.amount : 0, 'Online Stripe Gateway');
        setPaymentLoading(false);
        setShowCheckout(false);
        loadChildMetrics();
        alert('Stripe Gateway checkout payment successful! Receipt generated.');
      }
    }, 1500);
  };

  // GPA calculation
  const getGPA = () => {
    if (marks.length === 0) return 'N/A';
    const sum = marks.reduce((acc, m) => acc + m.marksObtained, 0);
    const avg = sum / marks.length;
    
    // Convert 100 scale to 4.0 scale
    const gpaVal = (avg / 100) * 4.0;
    return gpaVal.toFixed(2);
  };

  return (
    <div>
      {/* Child account switcher header */}
      {children.length > 1 && (
        <div style={{ display: 'flex', gap: '10px', marginBottom: '24px', backgroundColor: 'var(--bg-secondary)', padding: '8px 16px', borderRadius: '8px', border: '1px solid var(--border-color)', alignItems: 'center' }}>
          <span style={{ fontSize: '13px', fontWeight: 650, color: 'var(--text-secondary)' }}>Select Student:</span>
          {children.map((child, idx) => (
            <button
              key={child.id}
              onClick={() => setActiveChildIdx(idx)}
              style={{
                border: 'none',
                padding: '6px 12px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '12.5px',
                cursor: 'pointer',
                backgroundColor: activeChildIdx === idx ? 'var(--primary-color)' : 'transparent',
                color: activeChildIdx === idx ? '#ffffff' : 'var(--text-primary)',
                fontWeight: activeChildIdx === idx ? 600 : 400
              }}
            >
              {child.name} ({child.className})
            </button>
          ))}
        </div>
      )}

      {activeChild ? (
        <>
          {/* 1. OVERVIEW DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                <Card title="Attendance Average" subtitle="Present days percentage">
                  <div style={{ fontSize: '28px', fontWeight: 700, margin: '8px 0', fontFamily: 'var(--font-display)' }}>
                    {attendance.length > 0 ? `${Math.round((attendance.filter(a => a.status === 'present').length / attendance.length) * 100)}%` : '100%'}
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--success-color)', fontWeight: 650 }}>
                    Excellent classroom focus
                  </span>
                </Card>

                <Card title="Homework Todo" subtitle="Unsubmitted assignments">
                  <div style={{ fontSize: '28px', fontWeight: 700, margin: '8px 0', fontFamily: 'var(--font-display)' }}>
                    {homework.filter(h => !submissions.some(s => s.homeworkId === h.id)).length}
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--warning-color)', fontWeight: 650 }}>
                    Due this week
                  </span>
                </Card>

                <Card title="Cumulative Grade Point (GPA)" subtitle="Calculated from midterm exams">
                  <div style={{ fontSize: '28px', fontWeight: 700, margin: '8px 0', fontFamily: 'var(--font-display)' }}>
                    {getGPA()} / 4.0
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--success-color)', fontWeight: 650 }}>
                    Honors Grade standing
                  </span>
                </Card>
              </div>

              {/* Grid Column */}
              <div className="charts-grid" style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '24px', flexWrap: 'wrap' }}>
                <Card title="Today's Timetable Lecture Plan" subtitle="Class sections schedulers">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px' }}>
                    {timetable.flatMap(a => a.timetable.map((slot: any) => ({ ...slot, subject: subjects.find(s => s.id === a.subjectId)?.name }))).map((slot, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', border: '1px solid var(--border-color)', borderRadius: '6px', backgroundColor: 'var(--bg-secondary)' }}>
                        <div>
                          <strong>{slot.subject}</strong>
                          <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{slot.time}</div>
                        </div>
                        <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--primary-color)', alignSelf: 'center' }}>
                          {slot.room}
                        </span>
                      </div>
                    ))}
                  </div>
                </Card>

                <Card title="Pending Invoices" subtitle="Pay via Stripe Portal">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '12px' }}>
                    {fees.filter(f => f.status === 'unpaid').map((invoice) => {
                      const cat = feeCategories.find(c => c.id === invoice.categoryId);
                      return (
                        <div key={invoice.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', border: '1px solid var(--border-color)', borderRadius: '6px', backgroundColor: 'var(--bg-secondary)' }}>
                          <div>
                            <strong>{cat ? cat.name : 'Unknown Invoice'}</strong>
                            <div style={{ fontSize: '12px', color: 'var(--error-color)', fontWeight: 600 }}>${cat ? cat.amount : 0}</div>
                          </div>
                          <Button size="sm" onClick={() => {
                            setSelectedInvoice(invoice);
                            setCardDetails({ number: '', expiry: '', cvc: '', name: '' });
                            setShowCheckout(true);
                          }}>
                            Pay Invoice
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                </Card>
              </div>
            </div>
          )}

          {/* 2. ATTENDANCE WRAPPER */}
          {activeTab === 'attendance' && (
            <Card title="Attendance Audit Logs" subtitle="Attendance check dates logs.">
              <div style={{ marginTop: '16px' }}>
                <Table
                  data={attendance}
                  columns={[
                    { key: 'date', title: 'Session Date' },
                    {
                      key: 'status',
                      title: 'Status',
                      render: (row) => (
                        <span style={{ 
                          padding: '3px 8px', 
                          borderRadius: '4px', 
                          fontSize: '11px', 
                          fontWeight: 600, 
                          color: row.status === 'present' ? 'var(--success-color)' : row.status === 'late' ? 'var(--warning-color)' : 'var(--error-color)',
                          backgroundColor: row.status === 'present' ? 'var(--success-bg)' : row.status === 'late' ? 'var(--warning-bg)' : 'var(--error-bg)'
                        }}>
                          {row.status}
                        </span>
                      )
                    }
                  ]}
                />
              </div>
            </Card>
          )}

          {/* 3. HOMEWORK UPLOADER */}
          {activeTab === 'homework' && (
            <Card title="Homework Assignments Tracker" subtitle="Submit files and view teacher marks and comments.">
              <div style={{ marginTop: '16px' }}>
                <Table
                  data={homework}
                  columns={[
                    { key: 'title', title: 'Assignment Topic' },
                    {
                      key: 'subjectId',
                      title: 'Course',
                      render: (row) => subjects.find(s => s.id === row.subjectId)?.name || 'General'
                    },
                    { key: 'dueDate', title: 'Due Date' },
                    {
                      key: 'status',
                      title: 'Submission Status',
                      render: (row) => {
                        const sub = submissions.find(s => s.homeworkId === row.id);
                        if (!sub) return <span style={{ color: 'var(--error-color)', fontWeight: 650 }}>Not Submitted</span>;
                        return (
                          <span style={{ 
                            fontSize: '11px', 
                            fontWeight: 600, 
                            color: sub.status === 'graded' ? 'var(--success-color)' : 'var(--info-color)',
                            backgroundColor: sub.status === 'graded' ? 'var(--success-bg)' : 'var(--info-bg)',
                            padding: '3px 8px',
                            borderRadius: '4px'
                          }}>
                            {sub.status === 'graded' ? `Graded: ${sub.grade}` : 'Graded Pending'}
                          </span>
                        );
                      }
                    },
                    {
                      key: 'actions',
                      title: 'Actions',
                      align: 'right',
                      render: (row) => {
                        const sub = submissions.find(s => s.homeworkId === row.id);
                        return (
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                            {!sub ? (
                              <Button size="sm" onClick={() => {
                                setSelectedHw(row);
                                setHwFileName('solution_sheet.pdf');
                                setShowHomeworkModal(true);
                              }}>
                                Submit File
                              </Button>
                            ) : sub.status === 'graded' ? (
                              <Button size="sm" variant="outline" onClick={() => alert(`Comments: ${sub.feedback}`)}>
                                View Comments
                              </Button>
                            ) : <span style={{ color: 'var(--text-tertiary)', fontSize: '12px' }}>Awaiting Grading</span>}
                          </div>
                        );
                      }
                    }
                  ]}
                />
              </div>
            </Card>
          )}

          {/* 4. CLASS TIMETABLE */}
          {activeTab === 'timetable' && (
            <Card title="Lecture Timetable Grid" subtitle="Weekly school classroom session timings.">
              <div style={{ marginTop: '16px' }}>
                <Table
                  data={timetable}
                  columns={[
                    {
                      key: 'subjectId',
                      title: 'Subject Class',
                      render: (row) => subjects.find(s => s.id === row.subjectId)?.name || 'Unknown'
                    },
                    {
                      key: 'timetable',
                      title: 'Weekly Timings Schedule',
                      render: (row) => row.timetable.map((t: any) => `${t.day}: ${t.time} (${t.room})`).join(' | ')
                    }
                  ]}
                />
              </div>
            </Card>
          )}

          {/* 5. EXAM RESULTS */}
          {activeTab === 'results' && (
            <Card 
              title="Gradings Marks Transcript" 
              subtitle="Performance statistics compiled from unit tests and exams."
              extra={
                marks.length > 0 ? (
                  <Button size="sm" onClick={() => setShowReportCard(true)}>
                    <FileText size={14} /> Download Transcript Report
                  </Button>
                ) : null
              }
            >
              <div style={{ marginTop: '16px' }}>
                <Table
                  data={marks}
                  columns={[
                    {
                      key: 'examId',
                      title: 'Exam Term',
                      render: (row) => exams.find(e => e.id === row.examId)?.name || 'Unit Test'
                    },
                    {
                      key: 'subjectId',
                      title: 'Subject',
                      render: (row) => subjects.find(s => s.id === row.subjectId)?.name || 'Unknown'
                    },
                    {
                      key: 'marksObtained',
                      title: 'Marks Obtained / Total',
                      render: (row) => `${row.marksObtained} / ${row.totalMarks}`
                    },
                    { key: 'grade', title: 'Grade Score' },
                    { key: 'feedback', title: 'Teacher Remarks' }
                  ]}
                />
              </div>
            </Card>
          )}

          {/* 6. FEES PAYMENT */}
          {activeTab === 'fees' && (
            <Card title="Invoices Financial Directory" subtitle="Review school tuition receipts or clear due collections.">
              <div style={{ marginTop: '16px' }}>
                <Table
                  data={fees}
                  columns={[
                    { key: 'id', title: 'Receipt ID' },
                    {
                      key: 'categoryId',
                      title: 'Fee Category',
                      render: (row) => feeCategories.find(c => c.id === row.categoryId)?.name || 'Tuition'
                    },
                    {
                      key: 'amountPaid',
                      title: 'Invoiced Amount',
                      render: (row) => {
                        const cat = feeCategories.find(c => c.id === row.categoryId);
                        return `$${cat ? cat.amount : 0}`;
                      }
                    },
                    {
                      key: 'status',
                      title: 'Payment Status',
                      render: (row) => (
                        <span className={`badge ${row.status === 'paid' ? 'badge-success' : 'badge-error'}`}>
                          {row.status}
                        </span>
                      )
                    },
                    { key: 'paymentMethod', title: 'Checkout Mode' },
                    { key: 'date', title: 'Receipt Date' }
                  ]}
                />
              </div>
            </Card>
          )}

          {/* 7. GPS VEHICLE BUS TRACKING SIMULATOR */}
          {activeTab === 'bustracking' && (
            <Card 
              title="Live School Bus GPS Tracker" 
              subtitle="Map traces representing active bus progress with Stop notifications."
            >
              <div className="charts-grid" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px', marginTop: '16px' }}>
                {/* SVG Visual Map Tracker */}
                <div style={{
                  height: '350px',
                  backgroundColor: 'var(--bg-tertiary)',
                  borderRadius: '12px',
                  border: '1px solid var(--border-color)',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  {/* Grid background representing roads */}
                  <svg width="100%" height="100%">
                    <defs>
                      <pattern id="roadGrid" width="60" height="60" patternUnits="userSpaceOnUse">
                        <path d="M 60 0 L 0 0 0 60" fill="none" stroke="var(--border-color)" strokeWidth="1" />
                        {/* Asphalt roads */}
                        <rect x="0" y="25" width="60" height="10" fill="var(--bg-secondary)" opacity="0.3" />
                        <rect x="25" y="0" width="10" height="60" fill="var(--bg-secondary)" opacity="0.3" />
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#roadGrid)" />

                    {/* Animated bus route connector */}
                    {routes.length > 0 && (
                      <>
                        <path 
                          d="M 50 50 Q 150 120 200 250 T 400 300" 
                          fill="none" 
                          stroke="var(--primary-color)" 
                          strokeWidth="3" 
                          strokeDasharray="5 5" 
                        />
                        {/* Bus Stops */}
                        {routes[0].stops.map((stop: any, idx: number) => {
                          const stopX = 50 + idx * 110;
                          const stopY = 50 + idx * 80;
                          const isActive = idx === busProgress;

                          return (
                            <g key={idx}>
                              <circle 
                                cx={stopX} 
                                cy={stopY} 
                                r={isActive ? "8" : "6"} 
                                fill={isActive ? "var(--warning-color)" : "var(--primary-color)"} 
                              />
                              <text 
                                x={stopX + 12} 
                                y={stopY + 4} 
                                fill="var(--text-primary)" 
                                fontSize="11" 
                                fontWeight={isActive ? 600 : 400}
                              >
                                {stop.name} ({stop.time})
                              </text>
                            </g>
                          );
                        })}

                        {/* Moving School Bus Icon */}
                        <g transform={`translate(${50 + busProgress * 110}, ${50 + busProgress * 80})`}>
                          <rect x="-14" y="-8" width="28" height="16" fill="var(--warning-color)" rx="3" />
                          <rect x="4" y="-6" width="6" height="12" fill="#333" />
                          <circle cx="-8" cy="10" r="4" fill="#111" />
                          <circle cx="8" cy="10" r="4" fill="#111" />
                          {/* Bus text label */}
                          <text x="-10" y="-12" fill="var(--warning-color)" fontSize="9" fontWeight="800">BUS</text>
                        </g>
                      </>
                    )}
                  </svg>
                </div>

                {/* Tracker stops logger */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {routes.length > 0 ? (
                    <Card title={routes[0].routeName} subtitle={`Vehicle Code: ${routes[0].vehicleNo}`}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '12px' }}>
                        <div>
                          <strong style={{ fontSize: '13px' }}>Driver Details:</strong>
                          <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>{routes[0].driverName} ({routes[0].driverPhone})</p>
                        </div>
                        
                        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
                          <strong style={{ fontSize: '13px' }}>Route Progress Logs:</strong>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
                            {routes[0].stops.map((stop: any, idx: number) => {
                              const isPast = idx <= busProgress;
                              const isCurrent = idx === busProgress;

                              return (
                                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12.5px' }}>
                                  <div style={{ width: '16px', height: '16px', borderRadius: '50%', backgroundColor: isCurrent ? 'var(--warning-color)' : isPast ? 'var(--success-color)' : 'var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    {isPast && !isCurrent ? <Check size={10} color="#fff" /> : null}
                                  </div>
                                  <span style={{ fontWeight: isCurrent ? 600 : 400, color: isCurrent ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                                    {stop.name} - {stop.time}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </Card>
                  ) : (
                    <div style={{ textAlign: 'center', color: 'var(--text-tertiary)' }}>No active bus routes seeded.</div>
                  )}
                </div>
              </div>
            </Card>
          )}

          {/* 8. CERTIFICATES AND DOCUMENTS */}
          {activeTab === 'certificates' && (
            <Card title="Certificates Registry" subtitle="Download bonafide, conduct, or transfer certificates.">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '16px' }}>
                {[
                  { type: 'bonafide', title: 'Bonafide Certificate' },
                  { type: 'character', title: 'Conduct & Character Certificate' },
                  { type: 'transfer', title: 'Transfer Certificate (TC)' }
                ].map((cert) => (
                  <Card key={cert.type} title={cert.title} subtitle="QR Verified credentials">
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '14px' }}>
                      Official document generated with cryptography QR codes matching state board frameworks.
                    </p>
                    <Button size="sm" onClick={() => {
                      setActiveCert(cert);
                      setShowCertificate(true);
                    }}>
                      Generate & Print
                    </Button>
                  </Card>
                ))}
              </div>
            </Card>
          )}

          {/* STRIPE INVOICE CHECKOUT MODAL */}
          <Dialog
            isOpen={showCheckout}
            onClose={() => setShowCheckout(false)}
            title="Stripe Checkout Gateway"
          >
            {selectedInvoice && (
              <form onSubmit={handlePaymentSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ backgroundColor: 'var(--bg-tertiary)', padding: '16px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontSize: '12px', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>BILLING AMOUNT</span>
                    <h3 style={{ fontSize: '20px', color: 'var(--primary-color)' }}>
                      ${feeCategories.find(c => c.id === selectedInvoice.categoryId)?.amount || 0}
                    </h3>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                    <ShieldCheck size={16} color="var(--success-color)" /> Secure Stripe Checkout
                  </div>
                </div>

                <Input 
                  label="Cardholder Full Name" 
                  required 
                  value={cardDetails.name} 
                  onChange={(e) => setCardDetails(prev => ({ ...prev, name: e.target.value }))} 
                  placeholder="Homer Simpson" 
                />
                
                <Input 
                  label="Credit Card Number" 
                  required 
                  maxLength={19}
                  value={cardDetails.number} 
                  onChange={(e) => setCardDetails(prev => ({ ...prev, number: e.target.value.replace(/\s?/g, '').replace(/(\d{4})/g, '$1 ').trim() }))} 
                  placeholder="4242 4242 4242 4242" 
                />

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <Input 
                    label="Expiration Date" 
                    required 
                    maxLength={5}
                    value={cardDetails.expiry} 
                    onChange={(e) => setCardDetails(prev => ({ ...prev, expiry: e.target.value }))} 
                    placeholder="MM/YY" 
                  />
                  <Input 
                    label="Security CVC Code" 
                    required 
                    type="password"
                    maxLength={3}
                    value={cardDetails.cvc} 
                    onChange={(e) => setCardDetails(prev => ({ ...prev, cvc: e.target.value }))} 
                    placeholder="123" 
                  />
                </div>

                <Button type="submit" loading={paymentLoading} style={{ width: '100%', marginTop: '12px' }}>
                  Pay Invoice
                </Button>
              </form>
            )}
          </Dialog>

          {/* DYNAMIC REPORT CARD MODAL */}
          <Dialog
            isOpen={showReportCard}
            onClose={() => setShowReportCard(false)}
            title="Official Transcript Report"
            size="lg"
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ border: '2px solid var(--border-color)', borderRadius: '12px', padding: '24px', backgroundColor: 'var(--bg-secondary)', fontSize: '13px' }}>
                <div style={{ textAlign: 'center', borderBottom: '2px solid var(--border-color)', paddingBottom: '16px', marginBottom: '16px' }}>
                  <h2 style={{ fontSize: '20px', margin: 0 }}>{school.name}</h2>
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>ACADEMIC TRANSCRIPT · GRADE: {activeChild.className}</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '20px' }}>
                  <div><strong>Student Name:</strong> {activeChild.name}</div>
                  <div><strong>Admission ID:</strong> {activeChild.admissionNo}</div>
                  <div><strong>Roll Number:</strong> {activeChild.rollNo}</div>
                  <div><strong>Principal Name:</strong> {school.principalName}</div>
                </div>

                <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
                  <thead>
                    <tr style={{ backgroundColor: 'var(--bg-tertiary)', borderBottom: '1px solid var(--border-color)' }}>
                      <th style={{ padding: '8px', textAlign: 'left' }}>Subject</th>
                      <th style={{ padding: '8px', textAlign: 'center' }}>Marks Obtained</th>
                      <th style={{ padding: '8px', textAlign: 'center' }}>Total Max</th>
                      <th style={{ padding: '8px', textAlign: 'center' }}>Letter Grade</th>
                    </tr>
                  </thead>
                  <tbody>
                    {marks.map((m, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '8px' }}>{subjects.find(s => s.id === m.subjectId)?.name || 'General'}</td>
                        <td style={{ padding: '8px', textAlign: 'center' }}>{m.marksObtained}</td>
                        <td style={{ padding: '8px', textAlign: 'center' }}>{m.totalMarks}</td>
                        <td style={{ padding: '8px', textAlign: 'center', fontWeight: 600 }}>{m.grade}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '2px solid var(--border-color)', paddingTop: '12px', fontWeight: 700 }}>
                  <span>CUMULATIVE GPA SCORES:</span>
                  <span style={{ color: 'var(--primary-color)' }}>{getGPA()} / 4.0</span>
                </div>
              </div>
              
              <Button onClick={() => {
                addAuditLog(schoolId, user.id, user.name, `Downloaded transcript report card for ${activeChild.name}`);
                alert('Transcript PDF downloaded successfully!');
                setShowReportCard(false);
              }}>
                Print Transcript Record
              </Button>
            </div>
          </Dialog>

          {/* DYNAMIC CERTIFICATE PRINT DIALOG */}
          <Dialog
            isOpen={showCertificate}
            onClose={() => setShowCertificate(false)}
            title="Credential Generator"
            size="lg"
          >
            {activeCert && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ 
                  border: '10px double var(--primary-color)', 
                  borderRadius: '8px', 
                  padding: '40px', 
                  backgroundColor: 'var(--bg-secondary)', 
                  textAlign: 'center',
                  fontFamily: 'Georgia, serif'
                }}>
                  <h1 style={{ fontSize: '28px', color: 'var(--primary-color)', margin: '0 0 10px 0', fontFamily: 'Georgia, serif' }}>
                    {school.name}
                  </h1>
                  <span style={{ fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: '32px' }}>
                    Office of the Registrar
                  </span>
                  
                  <h2 style={{ fontSize: '22px', fontStyle: 'italic', fontWeight: 400, margin: '0 0 24px 0', fontFamily: 'Georgia, serif' }}>
                    {activeCert.title}
                  </h2>
                  
                  <p style={{ fontSize: '16px', lineHeight: 1.6, color: 'var(--text-primary)', margin: '0 auto 40px auto', maxWidth: '600px' }}>
                    This is to certify that <strong>{activeChild.name}</strong>, child of <strong>{user.name}</strong>, is a bonafide student of Springfield Academy, enrolled in class <strong>{activeChild.className}</strong> with Admission ID: <strong>{activeChild.admissionNo}</strong>.
                  </p>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '40px' }}>
                    <div style={{ textAlign: 'left', fontSize: '12px' }}>
                      <span style={{ display: 'block', borderTop: '1px solid var(--border-color)', paddingTop: '4px', width: '120px' }}>Date: {new Date().toLocaleDateString()}</span>
                    </div>
                    <div>
                      {/* Cryptographic QR code signature */}
                      <svg width="48" height="48" viewBox="0 0 40 40" fill="currentColor">
                        <path d="M0 0h12v12H0zm2 2v8h8V2zm16-2h12v12H18zm2 2v8h8V2zM0 18h12v12H0zm2 2v8h8V20zm24-2h6v6h-6zm0 8h6v6h-6zm-8-8h6v6h-6zm0 8h6v6h-6zm8-16h4v4h-4zm-8 24h4v4h-4z" />
                      </svg>
                      <span style={{ display: 'block', fontSize: '9px', color: 'var(--text-tertiary)', marginTop: '4px' }}>QR Secure Check</span>
                    </div>
                    <div style={{ textAlign: 'right', fontSize: '12px' }}>
                      <span style={{ display: 'block', borderTop: '1px solid var(--border-color)', paddingTop: '4px', width: '150px' }}>Principal: {school.principalName}</span>
                    </div>
                  </div>
                </div>

                <Button onClick={() => {
                  addAuditLog(schoolId, user.id, user.name, `Generated cryptographic ${activeCert.type} certificate`);
                  alert('Certificate doc printed successfully!');
                  setShowCertificate(false);
                }}>
                  Print Certificate
                </Button>
              </div>
            )}
          </Dialog>

          {/* SUBMIT HOMEWORK DIALOG */}
          <Dialog
            isOpen={showHomeworkModal}
            onClose={() => setShowHomeworkModal(false)}
            title="Upload Homework Submission"
          >
            {selectedHw && (
              <form onSubmit={handleHwSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ border: '1px solid var(--border-color)', padding: '12px', borderRadius: '6px', backgroundColor: 'var(--bg-tertiary)' }}>
                  <strong>Topic:</strong> {selectedHw.title}
                  <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginTop: '4px' }}>{selectedHw.description}</p>
                </div>
                <Input 
                  label="Submission Attachment Filename" 
                  required 
                  value={hwFileName} 
                  onChange={(e) => setHwFileName(e.target.value)} 
                />
                
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '12px' }}>
                  <Button type="button" variant="outline" onClick={() => setShowHomeworkModal(false)}>Cancel</Button>
                  <Button type="submit">Submit Solution</Button>
                </div>
              </form>
            )}
          </Dialog>
        </>
      ) : (
        <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-tertiary)' }}>
          Loading associated child profiles...
        </div>
      )}
    </div>
  );
};
