import * as Seed from './initialData';

// DB Keys in LocalStorage
const KEYS = {
  PLANS: 'erp_plans',
  SCHOOLS: 'erp_schools',
  USERS: 'erp_users',
  STUDENTS: 'erp_students',
  PARENTS: 'erp_parents',
  TEACHERS: 'erp_teachers',
  CLASSES: 'erp_classes',
  SUBJECTS: 'erp_subjects',
  ALLOCATIONS: 'erp_allocations',
  ATTENDANCE: 'erp_attendance',
  EXAMS: 'erp_exams',
  MARKS: 'erp_marks',
  FEE_CATEGORIES: 'erp_fee_categories',
  FEE_PAYMENTS: 'erp_fee_payments',
  HOMEWORK: 'erp_homework',
  SUBMISSIONS: 'erp_submissions',
  ROUTES: 'erp_routes',
  HOSTELS: 'erp_hostels',
  BOOKS: 'erp_books',
  AUDIT_LOGS: 'erp_audit_logs',
  TICKETS: 'erp_tickets'
};

// Initialize DB with seed data if empty
export function initDatabase() {
  if (!localStorage.getItem(KEYS.PLANS)) {
    localStorage.setItem(KEYS.PLANS, JSON.stringify(Seed.SEED_PLANS));
    localStorage.setItem(KEYS.SCHOOLS, JSON.stringify(Seed.SEED_SCHOOLS));
    localStorage.setItem(KEYS.USERS, JSON.stringify(Seed.SEED_USERS));
    localStorage.setItem(KEYS.STUDENTS, JSON.stringify(Seed.SEED_STUDENTS));
    localStorage.setItem(KEYS.PARENTS, JSON.stringify(Seed.SEED_PARENTS));
    localStorage.setItem(KEYS.TEACHERS, JSON.stringify(Seed.SEED_TEACHERS));
    localStorage.setItem(KEYS.CLASSES, JSON.stringify(Seed.SEED_CLASSES));
    localStorage.setItem(KEYS.SUBJECTS, JSON.stringify(Seed.SEED_SUBJECTS));
    localStorage.setItem(KEYS.ALLOCATIONS, JSON.stringify(Seed.SEED_ALLOCATIONS));
    localStorage.setItem(KEYS.ATTENDANCE, JSON.stringify(Seed.SEED_ATTENDANCE));
    localStorage.setItem(KEYS.EXAMS, JSON.stringify(Seed.SEED_EXAMS));
    localStorage.setItem(KEYS.MARKS, JSON.stringify(Seed.SEED_MARKS));
    localStorage.setItem(KEYS.FEE_CATEGORIES, JSON.stringify(Seed.SEED_FEE_CATEGORIES));
    localStorage.setItem(KEYS.FEE_PAYMENTS, JSON.stringify(Seed.SEED_FEE_PAYMENTS));
    localStorage.setItem(KEYS.HOMEWORK, JSON.stringify(Seed.SEED_HOMEWORK));
    localStorage.setItem(KEYS.SUBMISSIONS, JSON.stringify(Seed.SEED_SUBMISSIONS));
    localStorage.setItem(KEYS.ROUTES, JSON.stringify(Seed.SEED_ROUTES));
    localStorage.setItem(KEYS.HOSTELS, JSON.stringify(Seed.SEED_HOSTELS));
    localStorage.setItem(KEYS.BOOKS, JSON.stringify(Seed.SEED_BOOKS));
    localStorage.setItem(KEYS.AUDIT_LOGS, JSON.stringify(Seed.SEED_AUDIT_LOGS));
    localStorage.setItem(KEYS.TICKETS, JSON.stringify(Seed.SEED_TICKETS));
  }
}

// Generic Storage Handlers
function getTable<T>(key: string): T[] {
  initDatabase();
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
}

function saveTable<T>(key: string, data: T[]): void {
  localStorage.setItem(key, JSON.stringify(data));
}

// Logger helper
export function addAuditLog(schoolId: string | null, userId: string, userName: string, action: string) {
  const logs = getTable<Seed.AuditLog>(KEYS.AUDIT_LOGS);
  const newLog: Seed.AuditLog = {
    id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    schoolId,
    userId,
    userName,
    action,
    timestamp: new Date().toISOString(),
    ipAddress: '127.0.0.1 (simulated)'
  };
  saveTable(KEYS.AUDIT_LOGS, [newLog, ...logs]);
}

// ================= AUTHENTICATION =================
export interface AuthSession {
  user: Seed.User;
  school: Seed.School | null;
}

export function authenticate(username: string, passwordHash: string, role: string): AuthSession | null {
  const users = getTable<Seed.User>(KEYS.USERS);
  const user = users.find(u => u.username.toLowerCase() === username.toLowerCase() && u.passwordHash === passwordHash && u.role === role);
  
  if (!user) return null;
  
  let school: Seed.School | null = null;
  if (user.schoolId) {
    const schools = getTable<Seed.School>(KEYS.SCHOOLS);
    school = schools.find(s => s.id === user.schoolId) || null;
    
    // Check if school is suspended
    if (school && school.status === 'suspended') {
      throw new Error('Your school institution has been suspended. Please contact the platform admin.');
    }
    if (school && school.status === 'pending') {
      throw new Error('Your school registration is pending approval from the Super Admin.');
    }
  }
  
  addAuditLog(user.schoolId, user.id, user.name, `User logged in as ${role}`);
  return { user, school };
}

// ================= SUPER ADMIN OPERATIONS =================
export function getSchools(): Seed.School[] {
  return getTable<Seed.School>(KEYS.SCHOOLS);
}

export function getPlans(): Seed.SubscriptionPlan[] {
  return getTable<Seed.SubscriptionPlan>(KEYS.PLANS);
}

export function registerSchool(schoolData: Omit<Seed.School, 'id' | 'status' | 'createdAt'>, adminUser: { username: string; name: string; email: string; passwordHash: string }) {
  const schools = getTable<Seed.School>(KEYS.SCHOOLS);
  const users = getTable<Seed.User>(KEYS.USERS);
  
  const schoolId = `school-${Date.now()}`;
  const newSchool: Seed.School = {
    ...schoolData,
    id: schoolId,
    status: 'pending', // Requires Super Admin approval
    createdAt: new Date().toISOString()
  };
  
  const newAdmin: Seed.User = {
    id: `user-${Date.now()}-adm`,
    schoolId: schoolId,
    username: adminUser.username,
    role: 'admin',
    name: adminUser.name,
    email: adminUser.email,
    passwordHash: adminUser.passwordHash,
    mfaEnabled: false,
    createdAt: new Date().toISOString()
  };
  
  saveTable(KEYS.SCHOOLS, [...schools, newSchool]);
  saveTable(KEYS.USERS, [...users, newAdmin]);
  
  addAuditLog(null, 'anonymous', adminUser.name, `Registered new school: ${schoolData.name} (Pending approval)`);
  return { school: newSchool, admin: newAdmin };
}

export function updateSchoolStatus(schoolId: string, status: 'pending' | 'active' | 'suspended') {
  const schools = getTable<Seed.School>(KEYS.SCHOOLS);
  const idx = schools.findIndex(s => s.id === schoolId);
  if (idx !== -1) {
    schools[idx].status = status;
    saveTable(KEYS.SCHOOLS, schools);
    
    // Auto-create workspace items for Springfield Academy or new schools when activated
    if (status === 'active') {
      seedWorkspaceForSchool(schoolId);
    }
    
    addAuditLog(null, 'superadmin', 'Super Admin', `Updated school status of ${schools[idx].name} to ${status}`);
    return schools[idx];
  }
  return null;
}

export function deleteSchool(schoolId: string) {
  const schools = getTable<Seed.School>(KEYS.SCHOOLS).filter(s => s.id !== schoolId);
  saveTable(KEYS.SCHOOLS, schools);
  
  // Wipe all records matching schoolId
  Object.entries(KEYS).forEach(([_, key]) => {
    if (key !== KEYS.SCHOOLS && key !== KEYS.PLANS && key !== KEYS.AUDIT_LOGS) {
      const records = getTable<any>(key).filter(r => r.schoolId !== schoolId);
      saveTable(key, records);
    }
  });
  
  addAuditLog(null, 'superadmin', 'Super Admin', `Deleted school tenant ${schoolId} and all associated data`);
}

function seedWorkspaceForSchool(schoolId: string) {
  // If school already has subjects, classes etc, don't re-seed
  const classes = getTable<Seed.ClassSection>(KEYS.CLASSES);
  if (classes.some(c => c.schoolId === schoolId)) return;
  
  // Create default subjects
  const subjects = getTable<Seed.Subject>(KEYS.SUBJECTS);
  const subjs = [
    { id: `subj-${schoolId}-math`, schoolId, name: 'Mathematics', code: 'MATH' },
    { id: `subj-${schoolId}-sci`, schoolId, name: 'General Science', code: 'SCI' },
    { id: `subj-${schoolId}-eng`, schoolId, name: 'English Language', code: 'ENG' }
  ];
  saveTable(KEYS.SUBJECTS, [...subjects, ...subjs]);
  
  // Create default Class Grade 10-A
  const teacherId = `teacher-${schoolId}-1`;
  const defaultClasses = [
    { id: `class-${schoolId}-1`, schoolId, className: 'Grade 10', sectionName: 'A', classTeacherId: teacherId }
  ];
  saveTable(KEYS.CLASSES, [...classes, ...defaultClasses]);
  
  // Create mock driver & transport route
  const routes = getTable<Seed.TransportRoute>(KEYS.ROUTES);
  const defaultRoute: Seed.TransportRoute = {
    id: `route-${schoolId}-1`,
    schoolId,
    routeName: 'Main Town Route 1',
    driverName: 'John Doe',
    driverPhone: '+1-555-0810',
    vehicleNo: 'BUS-TOWN-01',
    stops: [
      { name: 'City Center Stop', time: '08:00 AM', lat: 34.0522, lng: -118.2437 },
      { name: 'School Main Gate', time: '08:20 AM', lat: 34.0622, lng: -118.2537 }
    ],
    currentLat: 34.0522,
    currentLng: -118.2437
  };
  saveTable(KEYS.ROUTES, [...routes, defaultRoute]);
}

// ================= MULTI-TENANT SCHOOL OPERATIONS (Scoped by schoolId) =================

// Generic Getter by School ID
export function getSchoolData<T>(key: string, schoolId: string): T[] {
  const records = getTable<any>(key);
  return records.filter(r => r.schoolId === schoolId);
}

// Student Admission Wizard
export function admitStudent(
  schoolId: string, 
  studentDetails: Omit<Seed.Student, 'id' | 'schoolId' | 'userId' | 'status' | 'parentId'>,
  userDetails: { name: string; email: string; username: string; passwordHash: string },
  parentDetails: { name: string; email: string; username: string; occupation: string; income: string; address: string; phone: string }
) {
  const users = getTable<Seed.User>(KEYS.USERS);
  const students = getTable<Seed.Student>(KEYS.STUDENTS);
  const parents = getTable<Seed.Parent>(KEYS.PARENTS);
  
  // 1. Create Parent User (if username doesn't exist)
  let parentUser = users.find(u => u.username === parentDetails.username && u.role === 'parent');
  let parentId = '';
  
  if (!parentUser) {
    const parentUserId = `user-${Date.now()}-par`;
    parentUser = {
      id: parentUserId,
      schoolId,
      username: parentDetails.username,
      role: 'parent',
      name: parentDetails.name,
      email: parentDetails.email,
      phone: parentDetails.phone,
      passwordHash: 'parent123', // Default
      mfaEnabled: false,
      createdAt: new Date().toISOString()
    };
    users.push(parentUser);
    
    parentId = `parent-${Date.now()}`;
    const newParent: Seed.Parent = {
      id: parentId,
      schoolId,
      userId: parentUserId,
      occupation: parentDetails.occupation,
      income: parentDetails.income,
      address: parentDetails.address,
      emergencyContact: `${parentDetails.name} (${parentDetails.phone})`,
      childrenIds: []
    };
    parents.push(newParent);
  } else {
    const parentRecord = parents.find(p => p.userId === parentUser!.id);
    parentId = parentRecord ? parentRecord.id : `parent-${Date.now()}`;
  }
  
  // 2. Create Student User
  const studentUserId = `user-${Date.now()}-std`;
  const studentUser: Seed.User = {
    id: studentUserId,
    schoolId,
    username: userDetails.username,
    role: 'student',
    name: userDetails.name,
    email: userDetails.email,
    passwordHash: userDetails.passwordHash,
    mfaEnabled: false,
    createdAt: new Date().toISOString()
  };
  users.push(studentUser);
  
  // 3. Create Student record
  const studentId = `student-${Date.now()}`;
  const newStudent: Seed.Student = {
    ...studentDetails,
    id: studentId,
    schoolId,
    userId: studentUserId,
    parentId,
    status: 'active'
  };
  students.push(newStudent);
  
  // Update parent children list
  const parentRecordIdx = parents.findIndex(p => p.id === parentId);
  if (parentRecordIdx !== -1) {
    parents[parentRecordIdx].childrenIds.push(studentId);
  }
  
  saveTable(KEYS.USERS, users);
  saveTable(KEYS.STUDENTS, students);
  saveTable(KEYS.PARENTS, parents);
  
  addAuditLog(schoolId, 'admin', 'School Admin', `Admitted new student ${userDetails.name} (Adm: ${studentDetails.admissionNo})`);
  return newStudent;
}

// Teacher profiles
export function addTeacher(
  schoolId: string,
  teacherDetails: Omit<Seed.Teacher, 'id' | 'schoolId' | 'userId' | 'status'>,
  userDetails: { name: string; email: string; username: string; passwordHash: string; phone: string }
) {
  const users = getTable<Seed.User>(KEYS.USERS);
  const teachers = getTable<Seed.Teacher>(KEYS.TEACHERS);
  
  const teacherUserId = `user-${Date.now()}-tch`;
  const teacherUser: Seed.User = {
    id: teacherUserId,
    schoolId,
    username: userDetails.username,
    role: 'teacher',
    name: userDetails.name,
    email: userDetails.email,
    phone: userDetails.phone,
    passwordHash: userDetails.passwordHash,
    mfaEnabled: false,
    createdAt: new Date().toISOString()
  };
  users.push(teacherUser);
  
  const teacherId = `teacher-${Date.now()}`;
  const newTeacher: Seed.Teacher = {
    ...teacherDetails,
    id: teacherId,
    schoolId,
    userId: teacherUserId,
    status: 'active'
  };
  teachers.push(newTeacher);
  
  saveTable(KEYS.USERS, users);
  saveTable(KEYS.TEACHERS, teachers);
  
  addAuditLog(schoolId, 'admin', 'School Admin', `Added new teacher ${userDetails.name}`);
  return newTeacher;
}

// Attendance marker
export function markAttendance(schoolId: string, records: Omit<Seed.Attendance, 'id' | 'schoolId'>[]) {
  const attendance = getTable<Seed.Attendance>(KEYS.ATTENDANCE);
  
  const updatedRecords = records.map(r => {
    // Check if record for student and date already exists, update it, otherwise create new
    const existingIdx = attendance.findIndex(a => a.schoolId === schoolId && a.studentId === r.studentId && a.date === r.date);
    const newRecord = {
      id: existingIdx !== -1 ? attendance[existingIdx].id : `att-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      schoolId,
      ...r
    };
    
    if (existingIdx !== -1) {
      attendance[existingIdx] = newRecord;
    } else {
      attendance.push(newRecord);
    }
    return newRecord;
  });
  
  saveTable(KEYS.ATTENDANCE, attendance);
  addAuditLog(schoolId, 'teacher', 'Teacher', `Marked attendance for ${records.length} students on ${records[0]?.date}`);
  return updatedRecords;
}

// Fee Payments
export function collectFee(schoolId: string, studentId: string, categoryId: string, amount: number, method: string) {
  const payments = getTable<Seed.FeePayment>(KEYS.FEE_PAYMENTS);
  const idx = payments.findIndex(p => p.schoolId === schoolId && p.studentId === studentId && p.categoryId === categoryId);
  
  if (idx !== -1) {
    const category = getTable<Seed.FeeCategory>(KEYS.FEE_CATEGORIES).find(c => c.id === categoryId);
    const totalAmount = category ? category.amount : amount;
    const currentPaid = payments[idx].amountPaid + amount;
    
    payments[idx].amountPaid = currentPaid;
    payments[idx].paymentMethod = method;
    payments[idx].status = currentPaid >= totalAmount ? 'paid' : 'partial';
    payments[idx].date = new Date().toISOString().split('T')[0];
    payments[idx].transactionId = `TXN-${Date.now()}-COL`;
    
    saveTable(KEYS.FEE_PAYMENTS, payments);
    addAuditLog(schoolId, 'accountant', 'Finance Officer', `Collected fee ${amount} for student ${studentId} under category ${categoryId}`);
    return payments[idx];
  }
  return null;
}

// Exam marks Entry
export function enterMarks(schoolId: string, marks: Omit<Seed.ExamMark, 'id' | 'schoolId'>[]) {
  const allMarks = getTable<Seed.ExamMark>(KEYS.MARKS);
  
  marks.forEach(m => {
    const existingIdx = allMarks.findIndex(x => x.schoolId === schoolId && x.examId === m.examId && x.studentId === m.studentId && x.subjectId === m.subjectId);
    const record = {
      id: existingIdx !== -1 ? allMarks[existingIdx].id : `mark-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      schoolId,
      ...m
    };
    
    if (existingIdx !== -1) {
      allMarks[existingIdx] = record;
    } else {
      allMarks.push(record);
    }
  });
  
  saveTable(KEYS.MARKS, allMarks);
  addAuditLog(schoolId, 'teacher', 'Teacher', `Entered exam marks for exam ${marks[0]?.examId}`);
}

// Homework Submission
export function submitHomework(schoolId: string, homeworkId: string, studentId: string, fileName: string) {
  const submissions = getTable<Seed.HomeworkSubmission>(KEYS.SUBMISSIONS);
  const newSub: Seed.HomeworkSubmission = {
    id: `sub-${Date.now()}`,
    schoolId,
    homeworkId,
    studentId,
    submittedAt: new Date().toISOString(),
    filePath: fileName,
    status: 'pending'
  };
  
  saveTable(KEYS.SUBMISSIONS, [...submissions, newSub]);
  addAuditLog(schoolId, 'student', 'Student', `Submitted homework ${homeworkId}`);
  return newSub;
}

// Grade Homework submission
export function gradeHomework(schoolId: string, submissionId: string, grade: string, feedback: string) {
  const submissions = getTable<Seed.HomeworkSubmission>(KEYS.SUBMISSIONS);
  const idx = submissions.findIndex(s => s.id === submissionId && s.schoolId === schoolId);
  if (idx !== -1) {
    submissions[idx].grade = grade;
    submissions[idx].feedback = feedback;
    submissions[idx].status = 'graded';
    saveTable(KEYS.SUBMISSIONS, submissions);
    
    addAuditLog(schoolId, 'teacher', 'Teacher', `Graded homework submission ${submissionId}`);
    return submissions[idx];
  }
  return null;
}

// Support ticket creation
export function createSupportTicket(schoolId: string, schoolName: string, subject: string, description: string) {
  const tickets = getTable<Seed.SupportTicket>(KEYS.TICKETS);
  const newTicket: Seed.SupportTicket = {
    id: `ticket-${Date.now()}`,
    schoolId,
    schoolName,
    subject,
    description,
    status: 'open',
    createdAt: new Date().toISOString()
  };
  saveTable(KEYS.TICKETS, [...tickets, newTicket]);
  addAuditLog(schoolId, 'admin', 'School Admin', `Raised support ticket: ${subject}`);
  return newTicket;
}

// Support ticket resolution
export function resolveTicket(ticketId: string) {
  const tickets = getTable<Seed.SupportTicket>(KEYS.TICKETS);
  const idx = tickets.findIndex(t => t.id === ticketId);
  if (idx !== -1) {
    tickets[idx].status = 'resolved';
    saveTable(KEYS.TICKETS, tickets);
    addAuditLog(null, 'superadmin', 'Super Admin', `Resolved support ticket ${ticketId}`);
  }
}

// Create new Homework
export function createHomework(schoolId: string, classId: string, subjectId: string, teacherId: string, title: string, description: string, dueDate: string, fileName?: string) {
  const homework = getTable<Seed.Homework>(KEYS.HOMEWORK);
  const newHw: Seed.Homework = {
    id: `hw-${Date.now()}`,
    schoolId,
    classId,
    subjectId,
    teacherId,
    title,
    description,
    dueDate,
    createdAt: new Date().toISOString(),
    filePath: fileName
  };
  saveTable(KEYS.HOMEWORK, [...homework, newHw]);
  addAuditLog(schoolId, 'teacher', 'Teacher', `Created new homework: ${title}`);
  return newHw;
}

// Class promotion / Custom CRUD Helpers
export function promoteStudents(schoolId: string, classId: string, targetClassId: string) {
  const students = getTable<Seed.Student>(KEYS.STUDENTS);
  let promotedCount = 0;
  students.forEach(s => {
    if (s.schoolId === schoolId && s.classId === classId) {
      s.classId = targetClassId;
      promotedCount++;
    }
  });
  saveTable(KEYS.STUDENTS, students);
  addAuditLog(schoolId, 'admin', 'School Admin', `Promoted ${promotedCount} students from class ${classId} to ${targetClassId}`);
}

// Get user accounts linked to a role
export function getSchoolUsers(schoolId: string): Seed.User[] {
  const users = getTable<Seed.User>(KEYS.USERS);
  return users.filter(u => u.schoolId === schoolId);
}

// Get user entity details (combines User + Parent/Teacher/Student profiles)
export function getExtendedStudents(schoolId: string) {
  const students = getSchoolData<Seed.Student>(KEYS.STUDENTS, schoolId);
  const users = getTable<Seed.User>(KEYS.USERS);
  const classes = getSchoolData<Seed.ClassSection>(KEYS.CLASSES, schoolId);
  const parents = getSchoolData<Seed.Parent>(KEYS.PARENTS, schoolId);
  
  return students.map(s => {
    const user = users.find(u => u.id === s.userId);
    const cls = classes.find(c => c.id === s.classId);
    const parent = parents.find(p => p.id === s.parentId);
    const parentUser = parent ? users.find(u => u.id === parent.userId) : null;
    
    return {
      ...s,
      name: user ? user.name : 'Unknown Student',
      email: user ? user.email : '',
      username: user ? user.username : '',
      className: cls ? `${cls.className}-${cls.sectionName}` : 'Unassigned',
      parentName: parentUser ? parentUser.name : 'Unknown Parent',
      parentPhone: parentUser ? parentUser.phone : ''
    };
  });
}

export function getExtendedTeachers(schoolId: string) {
  const teachers = getSchoolData<Seed.Teacher>(KEYS.TEACHERS, schoolId);
  const users = getTable<Seed.User>(KEYS.USERS);
  const allocations = getSchoolData<Seed.SubjectAllocation>(KEYS.ALLOCATIONS, schoolId);
  const subjects = getSchoolData<Seed.Subject>(KEYS.SUBJECTS, schoolId);
  
  return teachers.map(t => {
    const user = users.find(u => u.id === t.userId);
    
    // Find assigned subjects
    const teacherAllocs = allocations.filter(a => a.teacherId === t.id);
    const assignedSubjects = teacherAllocs.map(a => {
      const sub = subjects.find(s => s.id === a.subjectId);
      return sub ? sub.name : 'Unknown';
    });
    
    return {
      ...t,
      name: user ? user.name : 'Unknown Teacher',
      email: user ? user.email : '',
      phone: user ? user.phone : '',
      username: user ? user.username : '',
      subjects: Array.from(new Set(assignedSubjects))
    };
  });
}

export function getExtendedParents(schoolId: string) {
  const parents = getSchoolData<Seed.Parent>(KEYS.PARENTS, schoolId);
  const users = getTable<Seed.User>(KEYS.USERS);
  const students = getSchoolData<Seed.Student>(KEYS.STUDENTS, schoolId);
  
  return parents.map(p => {
    const user = users.find(u => u.id === p.userId);
    
    // Get child names
    const childrenNames = p.childrenIds.map(cid => {
      const child = students.find(s => s.id === cid);
      const childUser = child ? users.find(u => u.id === child.userId) : null;
      return childUser ? childUser.name : 'Unknown';
    });
    
    return {
      ...p,
      name: user ? user.name : 'Unknown Parent',
      email: user ? user.email : '',
      phone: user ? user.phone : '',
      childrenNames
    };
  });
}

// Get global audit logs for super admin or scoped school logs
export function getAuditLogs(schoolId: string | null): Seed.AuditLog[] {
  const logs = getTable<Seed.AuditLog>(KEYS.AUDIT_LOGS);
  if (schoolId === null) return logs;
  return logs.filter(l => l.schoolId === schoolId);
}

// Get support tickets (Super Admin list or School scoped list)
export function getSupportTickets(schoolId: string | null): Seed.SupportTicket[] {
  const tickets = getTable<Seed.SupportTicket>(KEYS.TICKETS);
  if (schoolId === null) return tickets;
  return tickets.filter(t => t.schoolId === schoolId);
}

// Save dynamic general configurations
export function updateSchoolSettings(schoolId: string, schoolDetails: Partial<Seed.School>) {
  const schools = getTable<Seed.School>(KEYS.SCHOOLS);
  const idx = schools.findIndex(s => s.id === schoolId);
  if (idx !== -1) {
    schools[idx] = { ...schools[idx], ...schoolDetails };
    saveTable(KEYS.SCHOOLS, schools);
    addAuditLog(schoolId, 'admin', 'School Admin', `Updated school branding & settings`);
    return schools[idx];
  }
  return null;
}

// Helper to update GPS coordinates of the bus route in real-time
export function updateBusGPS(schoolId: string, routeId: string, lat: number, lng: number) {
  const routes = getTable<Seed.TransportRoute>(KEYS.ROUTES);
  const idx = routes.findIndex(r => r.id === routeId && r.schoolId === schoolId);
  if (idx !== -1) {
    routes[idx].currentLat = lat;
    routes[idx].currentLng = lng;
    saveTable(KEYS.ROUTES, routes);
  }
}
