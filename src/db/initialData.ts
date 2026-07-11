export interface SubscriptionPlan {
  id: string;
  name: string;
  priceMonthly: number;
  priceYearly: number;
  studentLimit: number;
  storageLimit: number; // in GB
  features: string[];
}

export interface School {
  id: string;
  name: string;
  logo: string;
  principalName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  country: string;
  board: 'CBSE' | 'ICSE' | 'State' | 'IB' | 'Cambridge';
  type: 'Primary' | 'High School' | 'College' | 'University';
  studentCountRange: string;
  planId: string;
  status: 'pending' | 'active' | 'suspended';
  createdAt: string;
}

export interface User {
  id: string;
  schoolId: string | null; // null for Super Admin
  username: string;
  role: 'superadmin' | 'admin' | 'teacher' | 'student' | 'parent' | 'accountant' | 'librarian' | 'staff';
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  passwordHash: string; // Plain string for simulation
  mfaEnabled: boolean;
  createdAt: string;
}

export interface Student {
  id: string;
  schoolId: string;
  userId: string;
  admissionNo: string;
  rollNo: string;
  parentId: string;
  classId: string;
  sectionId: string;
  dob: string;
  gender: string;
  bloodGroup: string;
  medicalDetails: string;
  emergencyContact: string;
  status: 'active' | 'graduated' | 'transferred';
}

export interface Parent {
  id: string;
  schoolId: string;
  userId: string;
  occupation: string;
  income: string;
  address: string;
  emergencyContact: string;
  childrenIds: string[];
}

export interface Teacher {
  id: string;
  schoolId: string;
  userId: string;
  qualification: string;
  experience: string; // e.g. "5 years"
  salary: number;
  status: 'active' | 'onLeave';
}

export interface ClassSection {
  id: string;
  schoolId: string;
  className: string;
  sectionName: string;
  classTeacherId: string; // Teacher ID
}

export interface Subject {
  id: string;
  schoolId: string;
  name: string;
  code: string;
}

export interface SubjectAllocation {
  id: string;
  schoolId: string;
  classId: string;
  subjectId: string;
  teacherId: string;
  timetable: { day: string; time: string; room: string }[];
}

export interface Attendance {
  id: string;
  schoolId: string;
  studentId: string;
  date: string; // YYYY-MM-DD
  status: 'present' | 'absent' | 'late' | 'excused';
}

export interface Exam {
  id: string;
  schoolId: string;
  name: string;
  term: string; // e.g. "Term 1"
  startDate: string;
  endDate: string;
}

export interface ExamMark {
  id: string;
  schoolId: string;
  examId: string;
  studentId: string;
  subjectId: string;
  marksObtained: number;
  totalMarks: number;
  grade: string;
  feedback?: string;
}

export interface FeeCategory {
  id: string;
  schoolId: string;
  name: string;
  amount: number;
  dueDate: string;
}

export interface FeePayment {
  id: string;
  schoolId: string;
  studentId: string;
  categoryId: string;
  amountPaid: number;
  paymentMethod: string;
  status: 'paid' | 'partial' | 'unpaid';
  date: string;
  transactionId?: string;
}

export interface Homework {
  id: string;
  schoolId: string;
  classId: string;
  subjectId: string;
  teacherId: string;
  title: string;
  description: string;
  dueDate: string;
  createdAt: string;
  filePath?: string;
}

export interface HomeworkSubmission {
  id: string;
  schoolId: string;
  homeworkId: string;
  studentId: string;
  submittedAt: string;
  filePath: string;
  status: 'pending' | 'graded';
  grade?: string;
  feedback?: string;
}

export interface TransportRoute {
  id: string;
  schoolId: string;
  routeName: string;
  driverName: string;
  driverPhone: string;
  vehicleNo: string;
  stops: { name: string; time: string; lat: number; lng: number }[];
  currentLat: number;
  currentLng: number;
}

export interface Hostel {
  id: string;
  schoolId: string;
  buildingName: string;
  roomNo: string;
  type: 'AC' | 'Non-AC';
  totalBeds: number;
  availableBeds: number;
  fee: number;
}

export interface Book {
  id: string;
  schoolId: string;
  title: string;
  author: string;
  category: string;
  barcode: string;
  status: 'available' | 'issued';
}

export interface AuditLog {
  id: string;
  schoolId: string | null;
  userId: string;
  userName: string;
  action: string;
  timestamp: string;
  ipAddress: string;
}

export interface SupportTicket {
  id: string;
  schoolId: string;
  schoolName: string;
  subject: string;
  description: string;
  status: 'open' | 'resolved';
  createdAt: string;
}

// SEED DATA DECLARATIONS
export const SEED_PLANS: SubscriptionPlan[] = [
  {
    id: 'plan-basic',
    name: 'Basic',
    priceMonthly: 99,
    priceYearly: 990,
    studentLimit: 250,
    storageLimit: 10,
    features: ['Student Directory', 'Attendance tracking', 'Basic Fees module', 'Email Notifications', 'Light Mode']
  },
  {
    id: 'plan-pro',
    name: 'Professional',
    priceMonthly: 199,
    priceYearly: 1990,
    studentLimit: 1000,
    storageLimit: 50,
    features: ['Everything in Basic', 'LMS & Live Classes', 'QR & Biometric Integration', 'GPS Bus Tracking', 'Report Card Generator', 'Multi-Factor Auth', 'Light & Dark Mode']
  },
  {
    id: 'plan-enterprise',
    name: 'Enterprise',
    priceMonthly: 399,
    priceYearly: 3990,
    studentLimit: 5000,
    storageLimit: 200,
    features: ['Everything in Professional', 'Custom branding & domain', 'Unlimited classes', 'Dedicated support SLA', 'Advanced API access', 'Priority feature requests']
  }
];

export const SEED_SCHOOLS: School[] = [
  {
    id: 'school-springfield',
    name: 'Springfield Academy',
    logo: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=100&auto=format&fit=crop&q=60',
    principalName: 'Seymour Skinner',
    email: 'info@springfieldacademy.edu',
    phone: '+1-555-0199',
    address: '742 Evergreen Terrace',
    city: 'Springfield',
    state: 'Oregon',
    country: 'United States',
    board: 'State',
    type: 'High School',
    studentCountRange: '100-500',
    planId: 'plan-pro',
    status: 'active',
    createdAt: '2026-01-15T08:00:00Z'
  },
  {
    id: 'school-hogwarts',
    name: 'Hogwarts School of Witchcraft',
    logo: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=100&auto=format&fit=crop&q=60',
    principalName: 'Albus Dumbledore',
    email: 'office@hogwarts.ac.uk',
    phone: '+44-20-7946-0958',
    address: 'Hogwarts Castle',
    city: 'Highlands',
    state: 'Scotland',
    country: 'United Kingdom',
    board: 'Cambridge',
    type: 'University',
    studentCountRange: '500-1000',
    planId: 'plan-enterprise',
    status: 'active',
    createdAt: '2026-02-10T10:00:00Z'
  },
  {
    id: 'school-pending',
    name: 'Metropolitan High School',
    logo: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=100&auto=format&fit=crop&q=60',
    principalName: 'Sarah Jenkins',
    email: 'admin@metropolitan.edu',
    phone: '+1-555-0240',
    address: '100 Broadway Ave',
    city: 'New York',
    state: 'New York',
    country: 'United States',
    board: 'CBSE',
    type: 'High School',
    studentCountRange: '500-1000',
    planId: 'plan-basic',
    status: 'pending',
    createdAt: '2026-07-10T14:22:00Z'
  }
];

export const SEED_USERS: User[] = [
  // Super Admin
  {
    id: 'user-superadmin',
    schoolId: null,
    username: 'superadmin',
    role: 'superadmin',
    name: 'Antigravity Super Admin',
    email: 'superadmin@erp.com',
    passwordHash: 'admin123',
    mfaEnabled: true,
    createdAt: '2026-01-01T00:00:00Z'
  },
  // Springfield Academy Admin
  {
    id: 'user-sf-admin',
    schoolId: 'school-springfield',
    username: 'sfadmin',
    role: 'admin',
    name: 'Seymour Skinner',
    email: 'admin@springfield.edu',
    phone: '+1-555-0199',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    passwordHash: 'admin123',
    mfaEnabled: false,
    createdAt: '2026-01-15T08:30:00Z'
  },
  // Springfield Academy Teacher
  {
    id: 'user-sf-teacher',
    schoolId: 'school-springfield',
    username: 'sfteacher',
    role: 'teacher',
    name: 'Elizabeth Hoover',
    email: 'teacher@springfield.edu',
    phone: '+1-555-0211',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    passwordHash: 'teacher123',
    mfaEnabled: false,
    createdAt: '2026-01-16T09:00:00Z'
  },
  // Springfield Academy Parent
  {
    id: 'user-sf-parent',
    schoolId: 'school-springfield',
    username: 'sfparent',
    role: 'parent',
    name: 'Homer Simpson',
    email: 'parent@springfield.edu',
    phone: '+1-555-0133',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80',
    passwordHash: 'parent123',
    mfaEnabled: false,
    createdAt: '2026-01-17T11:00:00Z'
  },
  // Springfield Academy Student
  {
    id: 'user-sf-student',
    schoolId: 'school-springfield',
    username: 'sfstudent',
    role: 'student',
    name: 'Lisa Simpson',
    email: 'student@springfield.edu',
    phone: '+1-555-0133',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80',
    passwordHash: 'student123',
    mfaEnabled: false,
    createdAt: '2026-01-17T11:30:00Z'
  },
  // Hogwarts Admin
  {
    id: 'user-hw-admin',
    schoolId: 'school-hogwarts',
    username: 'hwadmin',
    role: 'admin',
    name: 'Minerva McGonagall',
    email: 'admin@hogwarts.edu',
    passwordHash: 'admin123',
    mfaEnabled: true,
    createdAt: '2026-02-10T10:30:00Z'
  }
];

export const SEED_STUDENTS: Student[] = [
  {
    id: 'student-lisa',
    schoolId: 'school-springfield',
    userId: 'user-sf-student',
    admissionNo: 'ADM-2026-0001',
    rollNo: '24',
    parentId: 'parent-homer',
    classId: 'class-10a',
    sectionId: 'section-a',
    dob: '2012-05-09',
    gender: 'Female',
    bloodGroup: 'A+',
    medicalDetails: 'None',
    emergencyContact: 'Homer Simpson (+1-555-0133)',
    status: 'active'
  }
];

export const SEED_PARENTS: Parent[] = [
  {
    id: 'parent-homer',
    schoolId: 'school-springfield',
    userId: 'user-sf-parent',
    occupation: 'Safety Inspector',
    income: '$45,000',
    address: '742 Evergreen Terrace, Springfield',
    emergencyContact: 'Marge Simpson (+1-555-0134)',
    childrenIds: ['student-lisa']
  }
];

export const SEED_TEACHERS: Teacher[] = [
  {
    id: 'teacher-hoover',
    schoolId: 'school-springfield',
    userId: 'user-sf-teacher',
    qualification: 'Master of Arts in Education',
    experience: '8 years',
    salary: 4200,
    status: 'active'
  }
];

export const SEED_CLASSES: ClassSection[] = [
  {
    id: 'class-10a',
    schoolId: 'school-springfield',
    className: 'Grade 10',
    sectionName: 'A',
    classTeacherId: 'teacher-hoover'
  },
  {
    id: 'class-10b',
    schoolId: 'school-springfield',
    className: 'Grade 10',
    sectionName: 'B',
    classTeacherId: 'teacher-hoover'
  }
];

export const SEED_SUBJECTS: Subject[] = [
  { id: 'subj-math', schoolId: 'school-springfield', name: 'Mathematics', code: 'MATH101' },
  { id: 'subj-sci', schoolId: 'school-springfield', name: 'Science', code: 'SCI102' },
  { id: 'subj-eng', schoolId: 'school-springfield', name: 'English Literature', code: 'ENG103' }
];

export const SEED_ALLOCATIONS: SubjectAllocation[] = [
  {
    id: 'alloc-1',
    schoolId: 'school-springfield',
    classId: 'class-10a',
    subjectId: 'subj-math',
    teacherId: 'teacher-hoover',
    timetable: [
      { day: 'Monday', time: '09:00 AM - 10:00 AM', room: 'Room 101' },
      { day: 'Wednesday', time: '09:00 AM - 10:00 AM', room: 'Room 101' },
      { day: 'Friday', time: '09:00 AM - 10:00 AM', room: 'Room 101' }
    ]
  },
  {
    id: 'alloc-2',
    schoolId: 'school-springfield',
    classId: 'class-10a',
    subjectId: 'subj-sci',
    teacherId: 'teacher-hoover',
    timetable: [
      { day: 'Tuesday', time: '10:15 AM - 11:15 AM', room: 'Science Lab A' },
      { day: 'Thursday', time: '10:15 AM - 11:15 AM', room: 'Science Lab A' }
    ]
  }
];

export const SEED_ATTENDANCE: Attendance[] = [
  { id: 'att-1', schoolId: 'school-springfield', studentId: 'student-lisa', date: '2026-07-06', status: 'present' },
  { id: 'att-2', schoolId: 'school-springfield', studentId: 'student-lisa', date: '2026-07-07', status: 'present' },
  { id: 'att-3', schoolId: 'school-springfield', studentId: 'student-lisa', date: '2026-07-08', status: 'present' },
  { id: 'att-4', schoolId: 'school-springfield', studentId: 'student-lisa', date: '2026-07-09', status: 'late' },
  { id: 'att-5', schoolId: 'school-springfield', studentId: 'student-lisa', date: '2026-07-10', status: 'present' }
];

export const SEED_EXAMS: Exam[] = [
  {
    id: 'exam-mid',
    schoolId: 'school-springfield',
    name: 'Mid-Term Examinations',
    term: 'Term 1',
    startDate: '2026-06-10',
    endDate: '2026-06-20'
  }
];

export const SEED_MARKS: ExamMark[] = [
  {
    id: 'mark-1',
    schoolId: 'school-springfield',
    examId: 'exam-mid',
    studentId: 'student-lisa',
    subjectId: 'subj-math',
    marksObtained: 98,
    totalMarks: 100,
    grade: 'A+',
    feedback: 'Excellent problem solving skills!'
  },
  {
    id: 'mark-2',
    schoolId: 'school-springfield',
    examId: 'exam-mid',
    studentId: 'student-lisa',
    subjectId: 'subj-sci',
    marksObtained: 95,
    totalMarks: 100,
    grade: 'A',
    feedback: 'Very thorough reports.'
  },
  {
    id: 'mark-3',
    schoolId: 'school-springfield',
    examId: 'exam-mid',
    studentId: 'student-lisa',
    subjectId: 'subj-eng',
    marksObtained: 92,
    totalMarks: 100,
    grade: 'A',
    feedback: 'Great essays, structure is fine.'
  }
];

export const SEED_FEE_CATEGORIES: FeeCategory[] = [
  { id: 'fee-tut', schoolId: 'school-springfield', name: 'Tuition Fee - Term 2', amount: 1500, dueDate: '2026-08-01' },
  { id: 'fee-trans', schoolId: 'school-springfield', name: 'Bus Transport - Q3', amount: 350, dueDate: '2026-07-15' },
  { id: 'fee-lib', schoolId: 'school-springfield', name: 'Library Deposit', amount: 50, dueDate: '2026-06-01' }
];

export const SEED_FEE_PAYMENTS: FeePayment[] = [
  {
    id: 'pay-1',
    schoolId: 'school-springfield',
    studentId: 'student-lisa',
    categoryId: 'fee-lib',
    amountPaid: 50,
    paymentMethod: 'Credit Card',
    status: 'paid',
    date: '2026-05-25',
    transactionId: 'TXN-98218-SF'
  },
  {
    id: 'pay-2',
    schoolId: 'school-springfield',
    studentId: 'student-lisa',
    categoryId: 'fee-trans',
    amountPaid: 0,
    paymentMethod: '-',
    status: 'unpaid',
    date: '-'
  },
  {
    id: 'pay-3',
    schoolId: 'school-springfield',
    studentId: 'student-lisa',
    categoryId: 'fee-tut',
    amountPaid: 0,
    paymentMethod: '-',
    status: 'unpaid',
    date: '-'
  }
];

export const SEED_HOMEWORK: Homework[] = [
  {
    id: 'hw-1',
    schoolId: 'school-springfield',
    classId: 'class-10a',
    subjectId: 'subj-math',
    teacherId: 'teacher-hoover',
    title: 'Algebraic Equations Exercise 4',
    description: 'Solve problems 1 to 15 on page 78. Show all working steps clearly.',
    dueDate: '2026-07-15',
    createdAt: '2026-07-10T15:00:00Z',
    filePath: 'algebra_ex4.pdf'
  }
];

export const SEED_SUBMISSIONS: HomeworkSubmission[] = [
  {
    id: 'sub-1',
    schoolId: 'school-springfield',
    homeworkId: 'hw-1',
    studentId: 'student-lisa',
    submittedAt: '2026-07-11T10:15:00Z',
    filePath: 'lisa_algebra_solved.pdf',
    status: 'pending'
  }
];

export const SEED_ROUTES: TransportRoute[] = [
  {
    id: 'route-sf-1',
    schoolId: 'school-springfield',
    routeName: 'Route A - North Sector',
    driverName: 'Otto Mann',
    driverPhone: '+1-555-0812',
    vehicleNo: 'BUS-SF-01',
    stops: [
      { name: '742 Evergreen Terrace', time: '07:30 AM', lat: 34.0522, lng: -118.2437 },
      { name: 'Shelbyville Rd Crossing', time: '07:45 AM', lat: 34.0622, lng: -118.2537 },
      { name: 'Springfield Library Stop', time: '08:00 AM', lat: 34.0722, lng: -118.2637 },
      { name: 'Springfield Academy', time: '08:15 AM', lat: 34.0822, lng: -118.2737 }
    ],
    // Lat & Lng of active simulator
    currentLat: 34.0522,
    currentLng: -118.2437
  }
];

export const SEED_HOSTELS: Hostel[] = [
  { id: 'hostel-1', schoolId: 'school-springfield', buildingName: 'North Dormitory', roomNo: '202', type: 'Non-AC', totalBeds: 4, availableBeds: 2, fee: 600 }
];

export const SEED_BOOKS: Book[] = [
  { id: 'book-1', schoolId: 'school-springfield', title: 'The Republic', author: 'Plato', category: 'Philosophy', barcode: '88102319', status: 'available' },
  { id: 'book-2', schoolId: 'school-springfield', title: 'Calculus Vol 1', author: 'Apostol', category: 'Mathematics', barcode: '99201991', status: 'issued' }
];

export const SEED_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'log-1',
    schoolId: null,
    userId: 'user-superadmin',
    userName: 'Antigravity Super Admin',
    action: 'Logged into platform dashboard',
    timestamp: '2026-07-11T14:30:00Z',
    ipAddress: '192.168.1.1'
  },
  {
    id: 'log-2',
    schoolId: 'school-springfield',
    userId: 'user-sf-admin',
    userName: 'Seymour Skinner',
    action: 'Generated student ID cards for Grade 10',
    timestamp: '2026-07-11T14:55:00Z',
    ipAddress: '192.168.1.4'
  }
];

export const SEED_TICKETS: SupportTicket[] = [
  {
    id: 'ticket-1',
    schoolId: 'school-springfield',
    schoolName: 'Springfield Academy',
    subject: 'MFA setup error on Principal account',
    description: 'When checking the checkbox, the OTP is not delivered to Skinner\'s phone.',
    status: 'open',
    createdAt: '2026-07-10T11:00:00Z'
  }
];

export interface Coupon {
  id: string;
  code: string;
  discountType: 'percentage' | 'flat';
  discountValue: number;
  expiryDate: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface Wish {
  id: string;
  title: string;
  message: string;
  category: 'festive' | 'maintenance' | 'announcement';
  dispatchedAt: string;
}

export interface Order {
  id: string;
  schoolId: string;
  schoolName: string;
  planId: string;
  planName: string;
  amount: number;
  billingCycle: 'monthly' | 'yearly';
  status: 'paid' | 'pending' | 'failed';
  paymentMethod: string;
  createdAt: string;
}

export const SEED_COUPONS: Coupon[] = [
  { id: 'coupon-1', code: 'WELCOME50', discountType: 'percentage', discountValue: 50, expiryDate: '2026-12-31', status: 'active', createdAt: '2026-01-01T00:00:00Z' },
  { id: 'coupon-2', code: 'SUMMER20', discountType: 'percentage', discountValue: 20, expiryDate: '2026-08-31', status: 'active', createdAt: '2026-06-01T00:00:00Z' },
  { id: 'coupon-3', code: 'FLAT100', discountType: 'flat', discountValue: 100, expiryDate: '2026-10-31', status: 'inactive', createdAt: '2026-03-01T00:00:00Z' }
];

export const SEED_WISHES: Wish[] = [
  { id: 'wish-1', title: 'Happy New Academic Term!', message: 'OmniSchool wishes all institutions, principals, faculty members, and students a highly productive and successful new term.', category: 'announcement', dispatchedAt: '2026-07-11T10:00:00Z' },
  { id: 'wish-2', title: 'System Security Patch v4.2', message: 'We have updated all tenant authentication systems. Active database keys are fully encrypted and MFA options are active.', category: 'maintenance', dispatchedAt: '2026-07-09T09:00:00Z' }
];

export const SEED_ORDERS: Order[] = [
  { id: 'ord-101', schoolId: 'school-springfield', schoolName: 'Springfield Academy', planId: 'plan-pro', planName: 'Professional Plan', amount: 199, billingCycle: 'monthly', status: 'paid', paymentMethod: 'Stripe Card', createdAt: '2026-07-01T12:00:00Z' },
  { id: 'ord-102', schoolId: 'school-hogwarts', schoolName: 'Hogwarts School', planId: 'plan-enterprise', planName: 'Enterprise Plan', amount: 399, billingCycle: 'monthly', status: 'paid', paymentMethod: 'Stripe Card', createdAt: '2026-07-05T08:30:00Z' },
  { id: 'ord-103', schoolId: 'school-springfield', schoolName: 'Springfield Academy', planId: 'plan-pro', planName: 'Professional Plan', amount: 199, billingCycle: 'monthly', status: 'paid', paymentMethod: 'Stripe Card', createdAt: '2026-06-01T12:00:00Z' }
];

export interface Holiday {
  id: string;
  schoolId: string;
  name: string;
  startDate: string;
  endDate: string;
  description: string;
}

export const SEED_HOLIDAYS: Holiday[] = [
  { id: 'hol-1', schoolId: 'school-springfield', name: 'Summer Vacation Break', startDate: '2026-06-15', endDate: '2026-07-31', description: 'Annual summer break for all classes and faculty staff.' },
  { id: 'hol-2', schoolId: 'school-springfield', name: 'Thanksgiving Recess', startDate: '2026-11-26', endDate: '2026-11-28', description: 'National Thanksgiving holiday weekend recess.' },
  { id: 'hol-3', schoolId: 'school-springfield', name: 'Christmas & Winter Holidays', startDate: '2026-12-20', endDate: '2027-01-03', description: 'Winter break and Christmas celebrations.' }
];

export interface SchoolEvent {
  id: string;
  schoolId: string;
  title: string;
  date: string;
  venue: string;
  description: string;
}

export const SEED_EVENTS: SchoolEvent[] = [
  { id: 'evt-1', schoolId: 'school-springfield', title: 'Annual Science Fair', date: '2026-07-20', venue: 'School Auditorium', description: 'Interactive project displays and physics lab models presentation.' },
  { id: 'evt-2', schoolId: 'school-springfield', title: 'Parent-Teacher Meeting (Term 1)', date: '2026-08-10', venue: 'Main Classrooms', description: 'Discussion on midterm exam cards and progress metrics.' },
  { id: 'evt-3', schoolId: 'school-springfield', title: 'Inter-School Soccer Tournament', date: '2026-09-05', venue: 'Sports Ground Arena', description: 'Regional championship series matches.' }
];
