import React, { useState, useEffect } from 'react';
import { 
  AlertCircle, Plus, FileText, 
  DollarSign, FileDown
} from 'lucide-react';
import { Card } from '../../components/Card';
import { Table } from '../../components/Table';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Dialog } from '../../components/Dialog';
import { LineChart } from '../../components/Charts';
import { 
  getSchoolData, getExtendedStudents, getExtendedTeachers, 
  getExtendedParents, admitStudent, addTeacher, collectFee, 
  enterMarks, updateSchoolSettings,
  getAuditLogs, addAuditLog, markAttendance
} from '../../db/dbEngine';
import type { School, User } from '../../db/initialData';

interface SchoolAdminDashboardProps {
  activeTab: string;
  school: School;
  user: User;
  onSchoolUpdate: (school: School) => void;
}

export const SchoolAdminDashboard: React.FC<SchoolAdminDashboardProps> = ({ 
  activeTab, 
  school, 
  user: _user,
  onSchoolUpdate
}) => {
  const schoolId = school.id;

  // Multi-tenant ERP database states
  const [students, setStudents] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [parents, setParents] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [allocations, setAllocations] = useState<any[]>([]);
  const [fees, setFees] = useState<any[]>([]);
  const [feeCategories, setFeeCategories] = useState<any[]>([]);
  const [exams, setExams] = useState<any[]>([]);
  const [books, setBooks] = useState<any[]>([]);
  const [routes, setRoutes] = useState<any[]>([]);
  const [hostels, setHostels] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);

  // Search Filter
  const [searchTerm, setSearchTerm] = useState('');

  // Modals state
  const [showAdmissionWizard, setShowAdmissionWizard] = useState(false);
  const [showAddTeacher, setShowAddTeacher] = useState(false);
  const [showCollectFee, setShowCollectFee] = useState(false);
  const [showMarksEntry, setShowMarksEntry] = useState(false);
  const [showTimetableConflict, setShowTimetableConflict] = useState(false);
  const [showIDCard, setShowIDCard] = useState(false);
  const [showPayslip, setShowPayslip] = useState(false);

  // Focus entity states
  const [activeStudent, setActiveStudent] = useState<any | null>(null);
  const [activeTeacher, setActiveTeacher] = useState<any | null>(null);

  // Forms State
  const [admissionForm, setAdmissionForm] = useState({
    name: '', email: '', username: '', password: 'student123',
    admissionNo: '', rollNo: '', dob: '2012-01-01', gender: 'Female',
    bloodGroup: 'B+', medicalDetails: 'None', emergencyContact: '',
    classId: '', sectionId: 'section-a',
    parentName: '', parentEmail: '', parentPhone: '', parentUsername: '',
    occupation: 'Self-Employed', income: '$50,000', address: ''
  });

  const [teacherForm, setTeacherForm] = useState({
    name: '', email: '', username: '', password: 'teacher123', phone: '',
    qualification: 'Bachelor of Science', experience: '3 years', salary: 3200
  });

  const [feeCollectForm, setFeeCollectForm] = useState({
    studentId: '', categoryId: '', amount: 0, method: 'Cash'
  });

  const [marksForm, setMarksForm] = useState<{ examId: string; subjectId: string; marks: Record<string, number> }>({
    examId: '', subjectId: '', marks: {}
  });

  const [brandingForm, setBrandingForm] = useState({
    principalName: school.principalName,
    email: school.email,
    phone: school.phone,
    address: school.address
  });

  const loadERPData = () => {
    setStudents(getExtendedStudents(schoolId));
    setTeachers(getExtendedTeachers(schoolId));
    setParents(getExtendedParents(schoolId));
    setClasses(getSchoolData('erp_classes', schoolId));
    setSubjects(getSchoolData('erp_subjects', schoolId));
    setAllocations(getSchoolData('erp_allocations', schoolId));
    setFees(getSchoolData('erp_fee_payments', schoolId));
    setFeeCategories(getSchoolData('erp_fee_categories', schoolId));
    setExams(getSchoolData('erp_exams', schoolId));
    setBooks(getSchoolData('erp_books', schoolId));
    setRoutes(getSchoolData('erp_routes', schoolId));
    setHostels(getSchoolData('erp_hostels', schoolId));
    setAuditLogs(getAuditLogs(schoolId));
  };

  useEffect(() => {
    loadERPData();
  }, [activeTab]);

  // Handle Admission Submission
  const handleAdmissionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const studentData = {
      admissionNo: admissionForm.admissionNo || `ADM-${Date.now().toString().slice(-4)}`,
      rollNo: admissionForm.rollNo,
      classId: admissionForm.classId || (classes[0]?.id || ''),
      sectionId: admissionForm.sectionId,
      dob: admissionForm.dob,
      gender: admissionForm.gender,
      bloodGroup: admissionForm.bloodGroup,
      medicalDetails: admissionForm.medicalDetails,
      emergencyContact: admissionForm.emergencyContact || `${admissionForm.parentName} (${admissionForm.parentPhone})`
    };

    const userData = {
      name: admissionForm.name,
      email: admissionForm.email,
      username: admissionForm.username || `std_${admissionForm.name.toLowerCase().replace(/\s/g, '')}`,
      passwordHash: admissionForm.password
    };

    const parentData = {
      name: admissionForm.parentName,
      email: admissionForm.parentEmail,
      phone: admissionForm.parentPhone,
      username: admissionForm.parentUsername || `par_${admissionForm.parentName.toLowerCase().replace(/\s/g, '')}`,
      occupation: admissionForm.occupation,
      income: admissionForm.income,
      address: admissionForm.address
    };

    admitStudent(schoolId, studentData, userData, parentData);
    setShowAdmissionWizard(false);
    loadERPData();
  };

  // Handle Add Teacher
  const handleTeacherSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const teacherData = {
      qualification: teacherForm.qualification,
      experience: teacherForm.experience,
      salary: Number(teacherForm.salary)
    };

    const userData = {
      name: teacherForm.name,
      email: teacherForm.email,
      username: teacherForm.username || `tch_${teacherForm.name.toLowerCase().replace(/\s/g, '')}`,
      passwordHash: teacherForm.password,
      phone: teacherForm.phone
    };

    addTeacher(schoolId, teacherData, userData);
    setShowAddTeacher(false);
    loadERPData();
  };

  // Handle Fee Collection
  const handleFeeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    collectFee(schoolId, feeCollectForm.studentId, feeCollectForm.categoryId, Number(feeCollectForm.amount), feeCollectForm.method);
    setShowCollectFee(false);
    loadERPData();
  };

  // Handle Marks Entry
  const handleMarksSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const marksPayload = Object.entries(marksForm.marks).map(([studentId, marksObtained]) => ({
      examId: marksForm.examId,
      studentId,
      subjectId: marksForm.subjectId,
      marksObtained,
      totalMarks: 100,
      grade: marksObtained >= 90 ? 'A+' : marksObtained >= 80 ? 'A' : marksObtained >= 70 ? 'B' : 'C'
    }));

    enterMarks(schoolId, marksPayload);
    setShowMarksEntry(false);
    loadERPData();
  };

  // Branding Settings Save
  const handleSettingsSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = updateSchoolSettings(schoolId, brandingForm);
    if (updated) {
      onSchoolUpdate(updated);
      alert('School settings saved successfully!');
    }
  };

  // Biometric check-in simulation
  const simulateBiometricSwipe = () => {
    const activeStudentList = students.filter(s => s.status === 'active');
    if (activeStudentList.length === 0) return;
    
    // Choose random student
    const randStd = activeStudentList[Math.floor(Math.random() * activeStudentList.length)];
    const today = new Date().toISOString().split('T')[0];
    
    const records = [{
      studentId: randStd.id,
      date: today,
      status: 'present' as any
    }];
    
    // Mark in DB
    markAttendance(schoolId, records);
    addAuditLog(schoolId, 'biometric-system', 'RFID Reader', `Logged attendance swipe for ${randStd.name}`);
    alert(`Biometric Check-In Successful!\nStudent: ${randStd.name}\nRFID: ${randStd.admissionNo}`);
    loadERPData();
  };

  // Timetable Conflict Test
  const checkTimetableConflicts = () => {
    // Basic simulator conflict demo
    setShowTimetableConflict(true);
  };

  const getFilteredData = (list: any[]) => {
    return list.filter(item => 
      (item.name && item.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.email && item.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.admissionNo && item.admissionNo.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  };

  return (
    <div>
      {/* 1. ERP OVERVIEW DASHBOARD */}
      {activeTab === 'dashboard' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Quick Actions Panel */}
          <div style={{
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)',
            padding: '16px 24px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            flexWrap: 'wrap'
          }}>
            <span style={{ fontWeight: 650, fontSize: '13px', color: 'var(--text-secondary)', textTransform: 'uppercase', marginRight: '8px' }}>
              Quick Actions:
            </span>
            <Button size="sm" onClick={() => {
              setAdmissionForm(prev => ({ ...prev, admissionNo: `ADM-${Date.now().toString().slice(-4)}` }));
              setShowAdmissionWizard(true);
            }}>
              <Plus size={14} /> Add Student
            </Button>
            <Button size="sm" variant="outline" onClick={() => setShowAddTeacher(true)}>
              <Plus size={14} /> Add Teacher
            </Button>
            <Button size="sm" variant="outline" onClick={() => {
              if (students.length > 0 && feeCategories.length > 0) {
                setFeeCollectForm({ studentId: students[0].id, categoryId: feeCategories[0].id, amount: feeCategories[0].amount, method: 'Cash' });
                setShowCollectFee(true);
              } else {
                alert('Add students and fee categories first.');
              }
            }}>
              <DollarSign size={14} /> Collect Fee
            </Button>
            <Button size="sm" variant="outline" onClick={() => {
              if (exams.length > 0 && students.length > 0 && subjects.length > 0) {
                const initialMarks: Record<string, number> = {};
                students.forEach(s => { initialMarks[s.id] = 85; });
                setMarksForm({ examId: exams[0].id, subjectId: subjects[0].id, marks: initialMarks });
                setShowMarksEntry(true);
              } else {
                alert('Ensure classes, exams, subjects, and students exist first.');
              }
            }}>
              <FileText size={14} /> Enter Exam Marks
            </Button>
            <Button size="sm" variant="ghost" onClick={simulateBiometricSwipe}>
              Simulate RFID Swipe
            </Button>
          </div>

          {/* Core Metrics Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
            <Card title="Total Students" subtitle="Active admissions" className="stat-card-glow">
              <div style={{ fontSize: '28px', fontWeight: 700, margin: '8px 0', fontFamily: 'var(--font-display)' }}>
                {students.length}
              </div>
              <span style={{ fontSize: '11px', color: 'var(--success-color)', fontWeight: 650 }}>
                100% Capacity allocation
              </span>
            </Card>

            <Card title="Faculty Teachers" subtitle="Classroom educators" className="stat-card-glow">
              <div style={{ fontSize: '28px', fontWeight: 700, margin: '8px 0', fontFamily: 'var(--font-display)' }}>
                {teachers.length}
              </div>
              <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
                1:10 Teacher ratio
              </span>
            </Card>

            <Card title="Parents Enrolled" subtitle="Linked families" className="stat-card-glow">
              <div style={{ fontSize: '28px', fontWeight: 700, margin: '8px 0', fontFamily: 'var(--font-display)' }}>
                {parents.length}
              </div>
              <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
                Notifications set: WhatsApp
              </span>
            </Card>

            <Card title="Fees Invoiced" subtitle="Total outstanding invoice values" className="stat-card-glow">
              <div style={{ fontSize: '28px', fontWeight: 700, margin: '8px 0', fontFamily: 'var(--font-display)' }}>
                ${fees.length > 0 ? fees.reduce((acc, f) => acc + (f.status === 'paid' ? 0 : 500), 0) : 0}
              </div>
              <span style={{ fontSize: '11px', color: 'var(--error-color)', fontWeight: 650 }}>
                Uncollected invoices
              </span>
            </Card>
          </div>

          {/* Graphs / Audit logs overview */}
          <div className="charts-grid" style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '24px', flexWrap: 'wrap' }}>
            <Card title="Attendance Performance" subtitle="Weekly school attendance averages (%)" className="stat-card-glow">
              <LineChart 
                data={[
                  { label: 'Mon', value: 98 },
                  { label: 'Tue', value: 97 },
                  { label: 'Wed', value: 95 },
                  { label: 'Thu', value: 98 },
                  { label: 'Fri', value: 94 }
                ]} 
                height={200}
                color="var(--success-color)"
              />
            </Card>

            <Card title="Recent Institution Audits" subtitle="Audit activity within this school tenant">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '200px', overflowY: 'auto', marginTop: '12px' }}>
                {auditLogs.slice(0, 4).map((log) => (
                  <div key={log.id} style={{ fontSize: '12px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <strong>{log.userName}</strong>
                      <span style={{ color: 'var(--text-tertiary)', fontSize: '10px' }}>
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <span style={{ color: 'var(--text-secondary)' }}>{log.action}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* 2. STUDENT DIRECTORY */}
      {activeTab === 'students' && (
        <Card 
          title="Student Registry & Admissions" 
          subtitle="View records, print student ID cards, or register new admissions."
          extra={
            <div style={{ display: 'flex', gap: '8px' }}>
              <Input 
                placeholder="Search students..." 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
                style={{ margin: 0, padding: '4px 8px', fontSize: '12px' }}
              />
              <Button size="sm" onClick={() => setShowAdmissionWizard(true)}>
                <Plus size={14} /> New Admission
              </Button>
            </div>
          }
        >
          <div style={{ marginTop: '16px' }}>
            <Table
              data={getFilteredData(students)}
              columns={[
                { key: 'admissionNo', title: 'Admission ID' },
                { key: 'name', title: 'Student Name' },
                { key: 'className', title: 'Grade Class' },
                { key: 'parentName', title: 'Parent' },
                { key: 'parentPhone', title: 'Contact' },
                {
                  key: 'actions',
                  title: 'Actions',
                  align: 'right',
                  render: (row) => (
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      <Button size="sm" variant="outline" onClick={() => {
                        setActiveStudent(row);
                        setShowIDCard(true);
                      }}>
                        Print Badge
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => {
                        setActiveStudent(row);
                        alert(`Promotions manager: Choose class to promote Lisa Simpson.`);
                      }}>
                        Promote Student
                      </Button>
                    </div>
                  )
                }
              ]}
            />
          </div>
        </Card>
      )}

      {/* 3. PARENTS DIRECTORY */}
      {activeTab === 'parents' && (
        <Card title="Parents Registry" subtitle="Linked guardian accounts and communication setups.">
          <div style={{ marginTop: '16px' }}>
            <Table
              data={parents}
              columns={[
                { key: 'name', title: 'Guardian Name' },
                { key: 'email', title: 'Email Address' },
                { key: 'phone', title: 'Phone' },
                { key: 'occupation', title: 'Occupation' },
                {
                  key: 'childrenNames',
                  title: 'Children Linked',
                  render: (row) => row.childrenNames.join(', ')
                }
              ]}
            />
          </div>
        </Card>
      )}

      {/* 4. TEACHERS HUB */}
      {activeTab === 'teachers' && (
        <Card 
          title="Faculty Roster" 
          subtitle="Manage qualifications, core subject allocations, and pay grades."
          extra={
            <Button size="sm" onClick={() => setShowAddTeacher(true)}>
              <Plus size={14} /> Add Teacher
            </Button>
          }
        >
          <div style={{ marginTop: '16px' }}>
            <Table
              data={teachers}
              columns={[
                { key: 'name', title: 'Teacher Name' },
                { key: 'email', title: 'Email' },
                { key: 'qualification', title: 'Credentials' },
                { key: 'experience', title: 'Tenure' },
                {
                  key: 'subjects',
                  title: 'Core Subjects',
                  render: (row) => row.subjects.join(', ') || 'General'
                },
                {
                  key: 'salary',
                  title: 'Salary Grade',
                  render: (row) => `$${row.salary}/mo`
                },
                {
                  key: 'actions',
                  title: 'Actions',
                  align: 'right',
                  render: (row) => (
                    <Button size="sm" variant="outline" onClick={() => {
                      setActiveTeacher(row);
                      setShowPayslip(true);
                    }}>
                      Generate Payslip
                    </Button>
                  )
                }
              ]}
            />
          </div>
        </Card>
      )}

      {/* 5. ACADEMICS */}
      {activeTab === 'academics' && (
        <div className="charts-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          <Card title="Classes and Sections" subtitle="Configure class roster scopes">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '12px' }}>
              {classes.map((c) => (
                <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', border: '1px solid var(--border-color)', borderRadius: '6px', backgroundColor: 'var(--bg-primary)' }}>
                  <div>
                    <strong>{c.className} - {c.sectionName}</strong>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Teacher ID: {c.classTeacherId}</div>
                  </div>
                  <Button size="sm" variant="ghost">Edit</Button>
                </div>
              ))}
            </div>
          </Card>

          <Card title="Academic Subjects" subtitle="Define curriculum course lists">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '12px' }}>
              {subjects.map((s) => (
                <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', border: '1px solid var(--border-color)', borderRadius: '6px', backgroundColor: 'var(--bg-primary)' }}>
                  <div>
                    <strong>{s.name}</strong>
                    <span style={{ marginLeft: '10px', fontSize: '11px', color: 'var(--text-tertiary)', border: '1px solid var(--border-color)', padding: '2px 4px', borderRadius: '4px' }}>
                      {s.code}
                    </span>
                  </div>
                  <Button size="sm" variant="ghost">Edit</Button>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* 6. FEES MANAGEMENT */}
      {activeTab === 'fees' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <Card title="Outstanding School Invoices" subtitle="Invoice collection registry">
            <div style={{ marginTop: '12px' }}>
              <Table
                data={fees}
                columns={[
                  { key: 'id', title: 'Invoice ID' },
                  {
                    key: 'categoryId',
                    title: 'Category',
                    render: (row) => {
                      const cat = feeCategories.find(c => c.id === row.categoryId);
                      return cat ? cat.name : 'Unknown';
                    }
                  },
                  {
                    key: 'amountPaid',
                    title: 'Invoiced / Paid',
                    render: (row) => {
                      const cat = feeCategories.find(c => c.id === row.categoryId);
                      const tot = cat ? cat.amount : 0;
                      return `$${tot} / $${row.amountPaid}`;
                    }
                  },
                  {
                    key: 'status',
                    title: 'Status',
                    render: (row) => (
                      <span className={`badge ${row.status === 'paid' ? 'badge-success' : 'badge-error'}`}>
                        {row.status}
                      </span>
                    )
                  },
                  { key: 'paymentMethod', title: 'Method' },
                  { key: 'date', title: 'Payment Date' }
                ]}
              />
            </div>
          </Card>
        </div>
      )}

      {/* 7. OTHER ERP SUB-TABS (Library, Transport, Hostel, HR/Payroll, Settings) */}
      {activeTab === 'library' && (
        <Card title="Library Books Catalog" subtitle="Track asset barcodes, issue queues, and categories.">
          <div style={{ marginTop: '16px' }}>
            <Table
              data={books}
              columns={[
                { key: 'barcode', title: 'Barcode ID' },
                { key: 'title', title: 'Book Title' },
                { key: 'author', title: 'Author' },
                { key: 'category', title: 'Subject Category' },
                {
                  key: 'status',
                  title: 'State',
                  render: (row) => (
                    <span style={{ padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600, color: row.status === 'available' ? 'var(--success-color)' : 'var(--warning-color)', backgroundColor: row.status === 'available' ? 'var(--success-bg)' : 'var(--warning-bg)' }}>
                      {row.status === 'available' ? 'Available' : 'Issued'}
                    </span>
                  )
                }
              ]}
            />
          </div>
        </Card>
      )}

      {activeTab === 'transport' && (
        <Card title="Transport Fleet & Routes" subtitle="Live tracking vehicle registers and stop coordinates.">
          <div style={{ marginTop: '16px' }}>
            <Table
              data={routes}
              columns={[
                { key: 'vehicleNo', title: 'Bus Number' },
                { key: 'routeName', title: 'Route Sector' },
                { key: 'driverName', title: 'Driver' },
                { key: 'driverPhone', title: 'Driver Contact' },
                {
                  key: 'stops',
                  title: 'Key Stops Count',
                  render: (row) => `${row.stops.length} stops`
                }
              ]}
            />
          </div>
        </Card>
      )}

      {activeTab === 'hostel' && (
        <Card title="Hostel Rooms Allocation" subtitle="Hostel blocks, beds capacities, and AC features.">
          <div style={{ marginTop: '16px' }}>
            <Table
              data={hostels}
              columns={[
                { key: 'buildingName', title: 'Dormitory Block' },
                { key: 'roomNo', title: 'Room No' },
                { key: 'type', title: 'AC / Non-AC' },
                {
                  key: 'beds',
                  title: 'Bed Allocation',
                  render: (row) => `${row.availableBeds} available / ${row.totalBeds} total`
                },
                {
                  key: 'fee',
                  title: 'Room Rent Fee',
                  render: (row) => `$${row.fee}/mo`
                }
              ]}
            />
          </div>
        </Card>
      )}

      {activeTab === 'timetable' && (
        <Card 
          title="Timetable & Conflict Engine" 
          subtitle="Auto conflict alerts checker"
          extra={
            <Button size="sm" onClick={checkTimetableConflicts}>
              Check Schedule Conflicts
            </Button>
          }
        >
          <div style={{ marginTop: '16px' }}>
            <Table
              data={allocations}
              columns={[
                {
                  key: 'classId',
                  title: 'Class',
                  render: (row) => {
                    const c = classes.find(x => x.id === row.classId);
                    return c ? `${c.className}-${c.sectionName}` : 'Unknown';
                  }
                },
                {
                  key: 'subjectId',
                  title: 'Subject',
                  render: (row) => {
                    const s = subjects.find(x => x.id === row.subjectId);
                    return s ? s.name : 'Unknown';
                  }
                },
                {
                  key: 'teacherId',
                  title: 'Instructor',
                  render: (row) => {
                    const t = teachers.find(x => x.id === row.teacherId);
                    return t ? t.name : 'Unknown';
                  }
                },
                {
                  key: 'timetable',
                  title: 'Schedule Slots',
                  render: (row) => row.timetable.map((slot: any) => `${slot.day}: ${slot.time} (${slot.room})`).join(' | ')
                }
              ]}
            />
          </div>
        </Card>
      )}

      {activeTab === 'settings' && (
        <Card title="Institution Profile Branding" subtitle="Configure principal name, contact data, and address parameters.">
          <form onSubmit={handleSettingsSave} style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px', maxWidth: '500px' }}>
            <Input 
              label="Principal Full Name" 
              value={brandingForm.principalName} 
              onChange={(e) => setBrandingForm(prev => ({ ...prev, principalName: e.target.value }))} 
            />
            <Input 
              label="School Contact Email" 
              value={brandingForm.email} 
              onChange={(e) => setBrandingForm(prev => ({ ...prev, email: e.target.value }))} 
            />
            <Input 
              label="School Phone" 
              value={brandingForm.phone} 
              onChange={(e) => setBrandingForm(prev => ({ ...prev, phone: e.target.value }))} 
            />
            <Input 
              label="School Address" 
              value={brandingForm.address} 
              onChange={(e) => setBrandingForm(prev => ({ ...prev, address: e.target.value }))} 
            />
            <Button type="submit">Save Settings Changes</Button>
          </form>
        </Card>
      )}

      {/* ADMISSION WIZARD DIALOG */}
      <Dialog
        isOpen={showAdmissionWizard}
        onClose={() => setShowAdmissionWizard(false)}
        title="Student Admission Wizard"
        size="lg"
      >
        <form onSubmit={handleAdmissionSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ fontSize: '14px', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px' }}>1. Student Profile Accounts</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <Input label="Student Name" required value={admissionForm.name} onChange={(e) => setAdmissionForm(prev => ({ ...prev, name: e.target.value }))} placeholder="e.g. Lisa Simpson" />
            <Input label="Email ID" type="email" required value={admissionForm.email} onChange={(e) => setAdmissionForm(prev => ({ ...prev, email: e.target.value }))} placeholder="lisa@springfield.edu" />
            <Input label="Login Username ID" required value={admissionForm.username} onChange={(e) => setAdmissionForm(prev => ({ ...prev, username: e.target.value }))} placeholder="e.g. lisasimpson" />
            <Input label="Roster Roll Number" required value={admissionForm.rollNo} onChange={(e) => setAdmissionForm(prev => ({ ...prev, rollNo: e.target.value }))} placeholder="e.g. 24" />
            <Input label="Grade Class Room" select value={admissionForm.classId} onChange={(e) => setAdmissionForm(prev => ({ ...prev, classId: e.target.value }))} options={classes.map(c => ({ value: c.id, label: `${c.className}-${c.sectionName}` }))} />
            <Input label="Date of Birth" type="date" value={admissionForm.dob} onChange={(e) => setAdmissionForm(prev => ({ ...prev, dob: e.target.value }))} />
          </div>

          <h3 style={{ fontSize: '14px', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px', marginTop: '12px' }}>2. Parent / Guardian Details</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <Input label="Parent Full Name" required value={admissionForm.parentName} onChange={(e) => setAdmissionForm(prev => ({ ...prev, parentName: e.target.value }))} placeholder="Homer Simpson" />
            <Input label="Parent Phone" required value={admissionForm.parentPhone} onChange={(e) => setAdmissionForm(prev => ({ ...prev, parentPhone: e.target.value }))} placeholder="+1-555-0133" />
            <Input label="Parent Username ID" required value={admissionForm.parentUsername} onChange={(e) => setAdmissionForm(prev => ({ ...prev, parentUsername: e.target.value }))} placeholder="e.g. homersimpson" />
            <Input label="Address Details" required value={admissionForm.address} onChange={(e) => setAdmissionForm(prev => ({ ...prev, address: e.target.value }))} placeholder="742 Evergreen Terrace" />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
            <Button type="button" variant="outline" onClick={() => setShowAdmissionWizard(false)}>Cancel</Button>
            <Button type="submit">Complete Admission</Button>
          </div>
        </form>
      </Dialog>

      {/* ADD TEACHER DIALOG */}
      <Dialog
        isOpen={showAddTeacher}
        onClose={() => setShowAddTeacher(false)}
        title="Add Faculty Teacher Profile"
      >
        <form onSubmit={handleTeacherSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <Input label="Teacher Full Name" required value={teacherForm.name} onChange={(e) => setTeacherForm(prev => ({ ...prev, name: e.target.value }))} placeholder="Elizabeth Hoover" />
          <Input label="Email ID" type="email" required value={teacherForm.email} onChange={(e) => setTeacherForm(prev => ({ ...prev, email: e.target.value }))} placeholder="hoover@springfield.edu" />
          <Input label="Contact Phone" required value={teacherForm.phone} onChange={(e) => setTeacherForm(prev => ({ ...prev, phone: e.target.value }))} placeholder="+1-555-0211" />
          <Input label="Qualifications" value={teacherForm.qualification} onChange={(e) => setTeacherForm(prev => ({ ...prev, qualification: e.target.value }))} placeholder="Master of Arts" />
          <Input label="Base Salary/mo ($)" type="number" value={teacherForm.salary} onChange={(e) => setTeacherForm(prev => ({ ...prev, salary: Number(e.target.value) }))} />
          
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '12px' }}>
            <Button type="button" variant="outline" onClick={() => setShowAddTeacher(false)}>Cancel</Button>
            <Button type="submit">Register Faculty</Button>
          </div>
        </form>
      </Dialog>

      {/* COLLECT FEE DIALOG */}
      <Dialog
        isOpen={showCollectFee}
        onClose={() => setShowCollectFee(false)}
        title="Collect Fee Invoice"
      >
        <form onSubmit={handleFeeSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <Input label="Select Student" select value={feeCollectForm.studentId} onChange={(e) => setFeeCollectForm(prev => ({ ...prev, studentId: e.target.value }))} options={students.map(s => ({ value: s.id, label: s.name }))} />
          <Input label="Fee Category" select value={feeCollectForm.categoryId} onChange={(e) => setFeeCollectForm(prev => ({ ...prev, categoryId: e.target.value }))} options={feeCategories.map(c => ({ value: c.id, label: `${c.name} ($${c.amount})` }))} />
          <Input label="Amount Collected ($)" type="number" value={feeCollectForm.amount} onChange={(e) => setFeeCollectForm(prev => ({ ...prev, amount: Number(e.target.value) }))} />
          <Input label="Payment Mode" select value={feeCollectForm.method} onChange={(e) => setFeeCollectForm(prev => ({ ...prev, method: e.target.value }))} options={[{ value: 'Cash', label: 'Cash Payment' }, { value: 'Card Swipe', label: 'POS Card Swipe' }, { value: 'Online NetBanking', label: 'Online NetBanking' }]} />
          
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '12px' }}>
            <Button type="button" variant="outline" onClick={() => setShowCollectFee(false)}>Cancel</Button>
            <Button type="submit">Process Payment</Button>
          </div>
        </form>
      </Dialog>

      {/* MARKS ENTRY DIALOG */}
      <Dialog
        isOpen={showMarksEntry}
        onClose={() => setShowMarksEntry(false)}
        title="Marks Spreadsheet Grid"
        size="lg"
      >
        <form onSubmit={handleMarksSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', gap: '12px' }}>
            <Input label="Select Exam" select value={marksForm.examId} onChange={(e) => setMarksForm(prev => ({ ...prev, examId: e.target.value }))} options={exams.map(ex => ({ value: ex.id, label: ex.name }))} />
            <Input label="Subject Class" select value={marksForm.subjectId} onChange={(e) => setMarksForm(prev => ({ ...prev, subjectId: e.target.value }))} options={subjects.map(s => ({ value: s.id, label: s.name }))} />
          </div>

          <h3 style={{ fontSize: '13px', fontWeight: 600, borderBottom: '1px solid var(--border-color)', paddingBottom: '6px' }}>
            Enter Student Marks (Max Marks: 100)
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {students.map(s => (
              <div key={s.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px', borderBottom: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '13.5px' }}>{s.name} ({s.admissionNo})</span>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={marksForm.marks[s.id] || 0}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setMarksForm(prev => ({
                      ...prev,
                      marks: { ...prev.marks, [s.id]: val }
                    }));
                  }}
                  style={{
                    width: '70px',
                    padding: '6px',
                    borderRadius: '4px',
                    border: '1px solid var(--border-color)',
                    textAlign: 'center',
                    backgroundColor: 'var(--bg-secondary)',
                    color: 'var(--text-primary)'
                  }}
                />
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
            <Button type="button" variant="outline" onClick={() => setShowMarksEntry(false)}>Cancel</Button>
            <Button type="submit">Submit Marksheet</Button>
          </div>
        </form>
      </Dialog>

      {/* TIMETABLE CONFLICT MODAL */}
      <Dialog
        isOpen={showTimetableConflict}
        onClose={() => setShowTimetableConflict(false)}
        title="Schedule Conflict Detection Audit"
      >
        <div style={{ textAlign: 'center', padding: '12px 0' }}>
          <AlertCircle size={48} color="var(--success-color)" style={{ marginBottom: '16px' }} />
          <h3 style={{ fontSize: '16px', marginBottom: '8px' }}>Conflict Audit Complete</h3>
          <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
            OmniSchool Timetable Scheduler audited all allocations. No overlapping class teacher assignments or double-room bookings found.
          </p>
          <div style={{ marginTop: '20px' }}>
            <Button onClick={() => setShowTimetableConflict(false)}>Close Audit</Button>
          </div>
        </div>
      </Dialog>

      {/* PRINT STUDENT ID BADGE MODAL */}
      <Dialog
        isOpen={showIDCard}
        onClose={() => setShowIDCard(false)}
        title="Student ID Card Generator"
      >
        {activeStudent && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '16px' }}>
            {/* SVG Visual Badge Card */}
            <div style={{
              width: '280px',
              height: '420px',
              backgroundColor: 'var(--bg-secondary)',
              border: '2px solid var(--primary-color)',
              borderRadius: '16px',
              boxShadow: 'var(--shadow-lg)',
              display: 'flex',
              flexDirection: 'column',
              padding: '16px',
              position: 'relative',
              backgroundImage: 'linear-gradient(135deg, var(--bg-secondary) 80%, var(--primary-glow) 100%)'
            }}>
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
                <img src={school.logo} alt="" style={{ width: '28px', height: '28px', borderRadius: '4px', objectFit: 'cover' }} />
                <div style={{ minWidth: '0' }}>
                  <h4 style={{ fontSize: '12px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textTransform: 'uppercase', letterSpacing: '0.02em' }}>{school.name}</h4>
                  <span style={{ fontSize: '9px', color: 'var(--text-secondary)' }}>Affiliation: {school.board}</span>
                </div>
              </div>

              {/* Student Pic */}
              <div style={{ alignSelf: 'center', marginTop: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ width: '100px', height: '100px', borderRadius: '50%', border: '3px solid var(--primary-color)', overflow: 'hidden', backgroundColor: 'var(--bg-tertiary)' }}>
                  <img src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <h3 style={{ fontSize: '16px', fontWeight: 700, marginTop: '12px', color: 'var(--text-primary)' }}>{activeStudent.name}</h3>
                <span style={{ fontSize: '12px', color: 'var(--primary-color)', fontWeight: 650 }}>{activeStudent.className}</span>
              </div>

              {/* Roster fields */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '24px', fontSize: '11px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                <div>
                  <span style={{ color: 'var(--text-tertiary)', textTransform: 'uppercase', display: 'block', fontSize: '8px' }}>ADMISSION NO</span>
                  <strong>{activeStudent.admissionNo}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-tertiary)', textTransform: 'uppercase', display: 'block', fontSize: '8px' }}>ROLL NUMBER</span>
                  <strong>{activeStudent.rollNo}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-tertiary)', textTransform: 'uppercase', display: 'block', fontSize: '8px' }}>GENDER</span>
                  <strong>{activeStudent.gender}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-tertiary)', textTransform: 'uppercase', display: 'block', fontSize: '8px' }}>BLOOD GROUP</span>
                  <strong>{activeStudent.bloodGroup}</strong>
                </div>
              </div>

              {/* QR Verification */}
              <div style={{ position: 'absolute', bottom: '16px', right: '16px' }}>
                {/* SVG Mock QR Code */}
                <svg width="40" height="40" viewBox="0 0 40 40" fill="currentColor" style={{ color: 'var(--text-primary)' }}>
                  <path d="M0 0h12v12H0zm2 2v8h8V2zm16-2h12v12H18zm2 2v8h8V2zM0 18h12v12H0zm2 2v8h8V20zm24-2h6v6h-6zm0 8h6v6h-6zm-8-8h6v6h-6zm0 8h6v6h-6zm8-16h4v4h-4zm-8 24h4v4h-4z" />
                </svg>
              </div>
            </div>
            
            <Button style={{ marginTop: '20px', width: '100%' }} onClick={() => {
              addAuditLog(schoolId, 'admin', 'School Admin', `Printed student ID card badge for ${activeStudent.name}`);
              alert('ID Card sent to printer queue!');
              setShowIDCard(false);
            }}>
              <FileDown size={16} /> Print Badge Document
            </Button>
          </div>
        )}
      </Dialog>

      {/* GENERATE TEACHER PAYSLIP MODAL */}
      <Dialog
        isOpen={showPayslip}
        onClose={() => setShowPayslip(false)}
        title="Faculty Payslip Generator"
      >
        {activeTeacher && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '8px' }}>
            <div style={{ border: '1px solid var(--border-color)', borderRadius: '8px', padding: '16px', fontSize: '13px', backgroundColor: 'var(--bg-secondary)', fontFamily: 'monospace' }}>
              <div style={{ textAlign: 'center', borderBottom: '2px solid var(--border-color)', paddingBottom: '10px', marginBottom: '12px' }}>
                <h3 style={{ margin: 0, fontSize: '15px' }}>{school.name}</h3>
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>SALARY SLIP FOR JUNE 2026</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginBottom: '16px' }}>
                <div><strong>Employee:</strong> {activeTeacher.name}</div>
                <div><strong>Role:</strong> Faculty Teacher</div>
                <div><strong>Username:</strong> {activeTeacher.username}</div>
                <div><strong>Qualification:</strong> {activeTeacher.qualification}</div>
              </div>
              <div style={{ borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)', padding: '8px 0', margin: '8px 0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span>Basic Salary:</span>
                  <span>${activeTeacher.salary.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span>DA Allowance (10%):</span>
                  <span>${(activeTeacher.salary * 0.1).toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', color: 'var(--error-color)' }}>
                  <span>Taxes/PF Deductions (5%):</span>
                  <span>-${(activeTeacher.salary * 0.05).toFixed(2)}</span>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '14px', marginTop: '10px' }}>
                <span>NET PAYABLE AMOUNT:</span>
                <span style={{ color: 'var(--success-color)' }}>${(activeTeacher.salary * 1.05).toFixed(2)}</span>
              </div>
            </div>
            <Button style={{ width: '100%' }} onClick={() => {
              addAuditLog(schoolId, 'admin', 'School Admin', `Generated salary payslip for teacher ${activeTeacher.name}`);
              alert('Payslip downloaded successfully!');
              setShowPayslip(false);
            }}>
              Download PDF Payslip
            </Button>
          </div>
        )}
      </Dialog>
    </div>
  );
};
