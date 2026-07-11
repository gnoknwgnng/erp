import React, { useState, useEffect } from 'react';
import { Plus as PlusIcon, Send as SendIcon } from 'lucide-react';
import { Card } from '../../components/Card';
import { Table } from '../../components/Table';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Dialog } from '../../components/Dialog';
import { 
  getSchoolData, getExtendedStudents, markAttendance, 
  createHomework, getSchoolUsers, gradeHomework, enterMarks, addAuditLog 
} from '../../db/dbEngine';
import type { School, User } from '../../db/initialData';

interface TeacherDashboardProps {
  activeTab: string;
  school: School;
  user: User;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ activeTab, school, user }) => {
  const schoolId = school.id;

  // ERP States
  const [students, setStudents] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [exams, setExams] = useState<any[]>([]);
  const [allocations, setAllocations] = useState<any[]>([]);
  
  // Homework state
  const [homeworkList, setHomeworkList] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [activeHomework, setActiveHomework] = useState<any | null>(null);

  // Chat states
  const [parents, setParents] = useState<any[]>([]);
  const [selectedParent, setSelectedParent] = useState<any | null>(null);
  const [chatMessages, setChatMessages] = useState<string[]>([
    'Hello teacher, how is Lisa progressing in Algebra?',
    'She scored 98% in her midterm, she is doing excellent!'
  ]);
  const [newMessage, setNewMessage] = useState('');

  // Forms State
  const [selectedClass, setSelectedClass] = useState('');
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceRecords, setAttendanceRecords] = useState<Record<string, 'present' | 'absent'>>({});

  const [marksForm, setMarksForm] = useState<{ examId: string; subjectId: string; marks: Record<string, number> }>({
    examId: '', subjectId: '', marks: {}
  });

  const [homeworkForm, setHomeworkForm] = useState({
    title: '', description: '', classId: '', subjectId: '', dueDate: '', file: ''
  });

  // Modal control
  const [showCreateHw, setShowCreateHw] = useState(false);
  const [showGradeSub, setShowGradeSub] = useState(false);
  const [activeSubmission, setActiveSubmission] = useState<any | null>(null);
  const [gradeVal, setGradeVal] = useState('A+');
  const [feedbackVal, setFeedbackVal] = useState('Great work!');

  const loadTeacherData = () => {
    const stds = getExtendedStudents(schoolId);
    setStudents(stds);
    
    const clss = getSchoolData<any>('erp_classes', schoolId);
    setClasses(clss);
    if (clss.length > 0 && !selectedClass) {
      setSelectedClass(clss[0].id);
    }
    
    const subjs = getSchoolData<any>('erp_subjects', schoolId);
    setSubjects(subjs);
    
    const allocs = getSchoolData<any>('erp_allocations', schoolId);
    setAllocations(allocs);
    
    const exms = getSchoolData<any>('erp_exams', schoolId);
    setExams(exms);
    
    const hwList = getSchoolData<any>('erp_homework', schoolId);
    setHomeworkList(hwList);
    
    const subsList = getSchoolData<any>('erp_submissions', schoolId);
    setSubmissions(subsList);

    // Filter parent users
    const schoolUsers = getSchoolUsers(schoolId);
    setParents(schoolUsers.filter(u => u.role === 'parent'));

    // Populate initial attendance state
    const initialAtt: Record<string, 'present' | 'absent'> = {};
    stds.forEach(s => {
      initialAtt[s.id] = 'present';
    });
    setAttendanceRecords(initialAtt);

    // Initial marks form
    if (exms.length > 0 && subjs.length > 0) {
      const initialMarks: Record<string, number> = {};
      stds.forEach(s => { initialMarks[s.id] = 90; });
      setMarksForm({ examId: exms[0].id, subjectId: subjs[0].id, marks: initialMarks });
    }
  };

  useEffect(() => {
    loadTeacherData();
  }, [activeTab, schoolId]);

  // Handle Attendance Save
  const handleSaveAttendance = () => {
    const payload = Object.entries(attendanceRecords).map(([studentId, status]) => ({
      studentId,
      date: attendanceDate,
      status: status as any
    }));

    markAttendance(schoolId, payload);
    alert('Attendance records saved successfully!');
  };

  // Handle Create Homework
  const handleCreateHwSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createHomework(
      schoolId,
      homeworkForm.classId || (classes[0]?.id || ''),
      homeworkForm.subjectId || (subjects[0]?.id || ''),
      user.id,
      homeworkForm.title,
      homeworkForm.description,
      homeworkForm.dueDate,
      homeworkForm.file || 'worksheet.pdf'
    );
    setShowCreateHw(false);
    loadTeacherData();
  };

  // Handle Grade Submission
  const handleGradeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeSubmission) {
      gradeHomework(schoolId, activeSubmission.id, gradeVal, feedbackVal);
      setShowGradeSub(false);
      loadTeacherData();
    }
  };

  // Marks Entry
  const handleMarksSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const marksPayload = Object.entries(marksForm.marks).map(([studentId, score]) => ({
      examId: marksForm.examId,
      studentId,
      subjectId: marksForm.subjectId,
      marksObtained: score,
      totalMarks: 100,
      grade: score >= 90 ? 'A+' : score >= 80 ? 'A' : score >= 70 ? 'B' : 'C'
    }));

    enterMarks(schoolId, marksPayload);
    alert('Exam marks spreadsheet uploaded successfully!');
  };

  // Chat message submit
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      setChatMessages(prev => [...prev, `Teacher: ${newMessage.trim()}`]);
      addAuditLog(schoolId, user.id, user.name, `Sent chat message to parent: ${selectedParent.name}`);
      setNewMessage('');
    }
  };

  return (
    <div>
      {/* 1. TEACHER OVERVIEW PANEL */}
      {activeTab === 'dashboard' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
            <Card title="Assigned Classes" subtitle="Roster assignments">
              <div style={{ fontSize: '28px', fontWeight: 700, margin: '8px 0', fontFamily: 'var(--font-display)' }}>
                {classes.length}
              </div>
              <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
                Grade 10 - Section A & B
              </span>
            </Card>

            <Card title="Homework Reviews" subtitle="Submissions awaiting grades">
              <div style={{ fontSize: '28px', fontWeight: 700, margin: '8px 0', fontFamily: 'var(--font-display)' }}>
                {submissions.filter(s => s.status === 'pending').length}
              </div>
              <span style={{ fontSize: '11px', color: 'var(--warning-color)', fontWeight: 650 }}>
                Requires review comments
              </span>
            </Card>

            <Card title="Subject Portfolios" subtitle="Courses curriculum count">
              <div style={{ fontSize: '28px', fontWeight: 700, margin: '8px 0', fontFamily: 'var(--font-display)' }}>
                {subjects.length}
              </div>
              <span style={{ fontSize: '11px', color: 'var(--success-color)', fontWeight: 650 }}>
                Course syllabus: 45% complete
              </span>
            </Card>
          </div>

          <Card title="Today's Classroom Sessions" subtitle="Daily timetable schedule details.">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '12px' }}>
              {allocations.flatMap(a => a.timetable.map((slot: any) => ({ ...slot, subject: subjects.find(s => s.id === a.subjectId)?.name }))).map((slot, i) => (
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
        </div>
      )}

      {/* 2. ATTENDANCE WRAPPER */}
      {activeTab === 'attendance' && (
        <Card 
          title="Daily Attendance Console" 
          subtitle="Select classroom grade, toggle attendance checklists, and submit changes."
          extra={
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <Input type="date" value={attendanceDate} onChange={(e) => setAttendanceDate(e.target.value)} style={{ margin: 0, padding: '4px 8px', fontSize: '12px' }} />
              <Button size="sm" onClick={handleSaveAttendance}>Save Attendance</Button>
            </div>
          }
        >
          <div style={{ marginTop: '16px' }}>
            <Table
              data={students}
              columns={[
                { key: 'admissionNo', title: 'Student ID' },
                { key: 'name', title: 'Student Name' },
                { key: 'className', title: 'Class Room' },
                {
                  key: 'attendance',
                  title: 'Attendance Check',
                  render: (row) => (
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <Button
                        size="sm"
                        variant={attendanceRecords[row.id] === 'present' ? 'primary' : 'outline'}
                        onClick={() => setAttendanceRecords(prev => ({ ...prev, [row.id]: 'present' }))}
                        style={{ padding: '4px 8px', fontSize: '11px', backgroundColor: attendanceRecords[row.id] === 'present' ? 'var(--success-color)' : 'transparent', borderColor: attendanceRecords[row.id] === 'present' ? 'var(--success-color)' : 'var(--border-color)' }}
                      >
                        Present
                      </Button>
                      <Button
                        size="sm"
                        variant={attendanceRecords[row.id] === 'absent' ? 'danger' : 'outline'}
                        onClick={() => setAttendanceRecords(prev => ({ ...prev, [row.id]: 'absent' }))}
                        style={{ padding: '4px 8px', fontSize: '11px' }}
                      >
                        Absent
                      </Button>
                    </div>
                  )
                }
              ]}
            />
          </div>
        </Card>
      )}

      {/* 3. EXAM MARKS ENTRY */}
      {activeTab === 'marks' && (
        <Card title="Marks Spreadsheet Board" subtitle="Enter grade points for exams and compile report sheets.">
          <form onSubmit={handleMarksSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '12px' }}>
            <div style={{ display: 'flex', gap: '12px', maxWidth: '500px' }}>
              <Input label="Select Exam" select value={marksForm.examId} onChange={(e) => setMarksForm(prev => ({ ...prev, examId: e.target.value }))} options={exams.map(ex => ({ value: ex.id, label: ex.name }))} />
              <Input label="Subject Class" select value={marksForm.subjectId} onChange={(e) => setMarksForm(prev => ({ ...prev, subjectId: e.target.value }))} options={subjects.map(s => ({ value: s.id, label: s.name }))} />
            </div>

            <Table
              data={students}
              columns={[
                { key: 'admissionNo', title: 'Admission No' },
                { key: 'name', title: 'Student Name' },
                {
                  key: 'score',
                  title: 'Marks Obtained (Out of 100)',
                  render: (row) => (
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={marksForm.marks[row.id] || 0}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setMarksForm(prev => ({
                          ...prev,
                          marks: { ...prev.marks, [row.id]: val }
                        }));
                      }}
                      style={{
                        width: '80px',
                        padding: '6px',
                        borderRadius: '4px',
                        border: '1px solid var(--border-color)',
                        textAlign: 'center',
                        backgroundColor: 'var(--bg-secondary)',
                        color: 'var(--text-primary)'
                      }}
                    />
                  )
                }
              ]}
            />

            <Button type="submit" style={{ alignSelf: 'flex-start' }}>Save Marksheet Records</Button>
          </form>
        </Card>
      )}

      {/* 4. HOMEWORK ASSIGNMENTS */}
      {activeTab === 'homework' && (
        <div className="charts-grid" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px' }}>
          <Card 
            title="Assigned Homework Roster" 
            subtitle="View or post new classroom homework assignments."
            extra={
              <Button size="sm" onClick={() => {
                setHomeworkForm({ title: '', description: '', classId: classes[0]?.id || '', subjectId: subjects[0]?.id || '', dueDate: '', file: '' });
                setShowCreateHw(true);
              }}>
                <PlusIcon size={14} /> Create Homework
              </Button>
            }
          >
            <div style={{ marginTop: '12px' }}>
              <Table
                data={homeworkList}
                columns={[
                  { key: 'title', title: 'Topic Subject' },
                  {
                    key: 'subjectId',
                    title: 'Course',
                    render: (row) => subjects.find(s => s.id === row.subjectId)?.name || 'General'
                  },
                  { key: 'dueDate', title: 'Due Date' },
                  {
                    key: 'actions',
                    title: 'Action',
                    render: (row) => (
                      <Button size="sm" variant="outline" onClick={() => setActiveHomework(row)}>
                        View Submissions
                      </Button>
                    )
                  }
                ]}
              />
            </div>
          </Card>

          {/* Submissions checklist column */}
          <Card title="Student Submissions Check" subtitle={activeHomework ? `Assigned Topic: ${activeHomework.title}` : 'Choose a homework item to view submissions.'}>
            {activeHomework ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '12px' }}>
                {submissions.filter(sub => sub.homeworkId === activeHomework.id).map((sub) => {
                  const student = students.find(s => s.id === sub.studentId);
                  return (
                    <div key={sub.id} style={{ border: '1px solid var(--border-color)', borderRadius: '6px', padding: '12px', backgroundColor: 'var(--bg-secondary)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <strong>{student ? student.name : 'Unknown Student'}</strong>
                        <span style={{ 
                          fontSize: '11px', 
                          fontWeight: 600, 
                          color: sub.status === 'graded' ? 'var(--success-color)' : 'var(--warning-color)',
                          backgroundColor: sub.status === 'graded' ? 'var(--success-bg)' : 'var(--warning-bg)',
                          padding: '2px 6px',
                          borderRadius: '4px'
                        }}>
                          {sub.status === 'graded' ? `Graded: ${sub.grade}` : 'Awaiting Grade'}
                        </span>
                      </div>
                      <span style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>File: {sub.filePath}</span>
                      {sub.status === 'graded' && <p style={{ fontSize: '12px', color: 'var(--text-tertiary)', fontStyle: 'italic' }}>Feedback: {sub.feedback}</p>}
                      {sub.status === 'pending' && (
                        <Button size="sm" variant="outline" style={{ alignSelf: 'flex-start' }} onClick={() => {
                          setActiveSubmission(sub);
                          setGradeVal('A');
                          setFeedbackVal('Great work!');
                          setShowGradeSub(true);
                        }}>
                          Grade File
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : null}
          </Card>
        </div>
      )}

      {/* 5. MY TIMETABLE */}
      {activeTab === 'timetable' && (
        <Card title="Personal Roster Timetable" subtitle="Instructor's weekly classes and lab sections schedules.">
          <div style={{ marginTop: '16px' }}>
            <Table
              data={allocations}
              columns={[
                {
                  key: 'classId',
                  title: 'Grade Class',
                  render: (row) => classes.find(c => c.id === row.classId)?.className || 'Unknown'
                },
                {
                  key: 'subjectId',
                  title: 'Subject Code',
                  render: (row) => {
                    const s = subjects.find(x => x.id === row.subjectId);
                    return s ? `${s.name} (${s.code})` : 'Unknown';
                  }
                },
                {
                  key: 'timetable',
                  title: 'Assigned Schedule Slots',
                  render: (row) => row.timetable.map((t: any) => `${t.day}: ${t.time} (${t.room})`).join(' | ')
                }
              ]}
            />
          </div>
        </Card>
      )}

      {/* 6. CHAT PORTAL */}
      {activeTab === 'chat' && (
        <div className="charts-grid" style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: '24px', minHeight: '400px' }}>
          <div style={{ borderRight: '1px solid var(--border-color)', paddingRight: '12px', overflowY: 'auto' }}>
            <h3 style={{ fontSize: '13px', textTransform: 'uppercase', color: 'var(--text-tertiary)', marginBottom: '10px' }}>Linked Parents</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {parents.map(p => (
                <button
                  key={p.id}
                  onClick={() => {
                    setSelectedParent(p);
                    setChatMessages([
                      `Hello teacher, how is Lisa progressing in Algebra?`,
                      `She scored 98% in her midterm, she is doing excellent!`
                    ]);
                  }}
                  style={{
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-sm)',
                    border: 'none',
                    textAlign: 'left',
                    fontSize: '13px',
                    cursor: 'pointer',
                    backgroundColor: selectedParent?.id === p.id ? 'var(--primary-glow)' : 'transparent',
                    color: selectedParent?.id === p.id ? 'var(--primary-color)' : 'var(--text-primary)'
                  }}
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {selectedParent ? (
              <>
                <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', marginBottom: '12px' }}>
                  <h3 style={{ fontSize: '14.5px' }}>{selectedParent.name}</h3>
                  <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>Parent user session active</span>
                </div>
                <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', padding: '8px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '6px', marginBottom: '12px' }}>
                  {chatMessages.map((msg, i) => {
                    const isMe = msg.startsWith('Teacher:');
                    return (
                      <div key={i} style={{
                        padding: '8px 12px',
                        borderRadius: '8px',
                        maxWidth: '75%',
                        fontSize: '13px',
                        alignSelf: isMe ? 'flex-end' : 'flex-start',
                        backgroundColor: isMe ? 'var(--primary-color)' : 'var(--border-color)',
                        color: isMe ? '#ffffff' : 'var(--text-primary)'
                      }}>
                        {msg.replace(/^(Teacher:|Parent:)\s*/, '')}
                      </div>
                    );
                  })}
                </div>
                <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '8px' }}>
                  <Input 
                    placeholder="Type reply message..." 
                    value={newMessage} 
                    onChange={(e) => setNewMessage(e.target.value)} 
                    style={{ margin: 0 }} 
                  />
                  <Button type="submit"><SendIcon size={16} /></Button>
                </form>
              </>
            ) : (
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-tertiary)', fontSize: '13px' }}>
                Select a parent from the left menu to start messaging.
              </div>
            )}
          </div>
        </div>
      )}

      {/* CREATE HOMEWORK DIALOG */}
      <Dialog
        isOpen={showCreateHw}
        onClose={() => setShowCreateHw(false)}
        title="Create Classroom Homework"
      >
        <form onSubmit={handleCreateHwSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <Input label="Homework Title/Topic" required value={homeworkForm.title} onChange={(e) => setHomeworkForm(prev => ({ ...prev, title: e.target.value }))} placeholder="Algebra exercise 4" />
          <Input label="Instructions Description" textarea required value={homeworkForm.description} onChange={(e) => setHomeworkForm(prev => ({ ...prev, description: e.target.value }))} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <Input label="Class Grade" select value={homeworkForm.classId} onChange={(e) => setHomeworkForm(prev => ({ ...prev, classId: e.target.value }))} options={classes.map(c => ({ value: c.id, label: `${c.className}-${c.sectionName}` }))} />
            <Input label="Subject Class" select value={homeworkForm.subjectId} onChange={(e) => setHomeworkForm(prev => ({ ...prev, subjectId: e.target.value }))} options={subjects.map(s => ({ value: s.id, label: s.name }))} />
          </div>
          <Input label="Due Date" type="date" required value={homeworkForm.dueDate} onChange={(e) => setHomeworkForm(prev => ({ ...prev, dueDate: e.target.value }))} />
          
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '12px' }}>
            <Button type="button" variant="outline" onClick={() => setShowCreateHw(false)}>Cancel</Button>
            <Button type="submit">Assign Homework</Button>
          </div>
        </form>
      </Dialog>

      {/* GRADE SUBMISSION DIALOG */}
      <Dialog
        isOpen={showGradeSub}
        onClose={() => setShowGradeSub(false)}
        title="Grade Homework File"
      >
        <form onSubmit={handleGradeSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <Input label="Assign Grade Point" required value={gradeVal} onChange={(e) => setGradeVal(e.target.value)} placeholder="e.g. A+ or B" />
          <Input label="Grading Feedback / Comments" textarea required value={feedbackVal} onChange={(e) => setFeedbackVal(e.target.value)} />
          
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '12px' }}>
            <Button type="button" variant="outline" onClick={() => setShowGradeSub(false)}>Cancel</Button>
            <Button type="submit">Save Grade Comments</Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
};
