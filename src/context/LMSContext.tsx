/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  Student,
  Attendance,
  Violation,
  Assignment,
  Submission,
  Feedback,
  SystemSettings,
  UserRole,
  RewardRule,
  ZaloNotification,
  Teacher,
  Parent
} from '../types';

interface LMSContextType {
  currentUser: User | null;
  setCurrentUser: React.Dispatch<React.SetStateAction<User | null>>;
  availableUsers: User[];
  students: Student[];
  setStudents: React.Dispatch<React.SetStateAction<Student[]>>;
  teachers: Teacher[];
  setTeachers: React.Dispatch<React.SetStateAction<Teacher[]>>;
  parents: Parent[];
  setParents: React.Dispatch<React.SetStateAction<Parent[]>>;
  attendanceList: Attendance[];
  violations: Violation[];
  assignments: Assignment[];
  submissions: Submission[];
  feedbacks: Feedback[];
  settings: SystemSettings;
  zaloNotifications: ZaloNotification[];
  sendZaloNotification: (recipientName: string, phoneNumber: string, message: string, type: 'password_change' | 'parent_reminder' | 'teacher_alert') => void;
  
  // Actions
  addStudent: (student: Omit<Student, 'stars' | 'flags' | 'goldCards' | 'rank'>) => void;
  deleteStudent: (id: string) => void;
  updateStudent: (id: string, updatedData: Partial<Student>) => void;
  importStudents: (list: Omit<Student, 'stars' | 'flags' | 'goldCards' | 'rank'>[]) => void;
  importAllData: (teachers: Teacher[], students: Student[], parents: Parent[]) => void;
  clearAllData: () => void;
  
  markAttendance: (studentId: string, date: string, isAbsent: boolean, notes?: string) => void;
  deleteAttendance: (studentId: string, date: string) => void;
  
  addViolation: (studentId: string, violationType: string, message: string) => void;
  resolveViolation: (violationId: string, parentResponse: string) => void;
  
  addAssignment: (assignment: Omit<Assignment, 'id' | 'createdAt'> & { id?: string; isDraft?: boolean }) => void;
  deleteAssignment: (id: string) => void;
  saveSubmission: (submission: Submission) => void;
  deleteSubmission: (studentId: string, assignmentId: string) => void;
  
  addFeedback: (feedback: Omit<Feedback, 'id' | 'createdAt' | 'parentName' | 'studentName'>) => void;
  replyFeedback: (feedbackId: string, reply: string) => void;
  markFeedbackAsRead: (feedbackId: string) => void;
  
  updateSettings: (newSettings: SystemSettings) => void;
  rewardStars: (studentId: string, starsCount: number, reason: string) => void;
  parentCheckedAssignments: { [key: string]: string };
  markParentChecked: (assignmentId: string, studentId: string) => void;
  
  // Helper to re-calculate ranks
  recalculateRanks: (studentList: Student[]) => Student[];
}

const LMSContext = createContext<LMSContextType | undefined>(undefined);

// Initial Users
const INITIAL_USERS: User[] = [];

// Initial Students
const INITIAL_STUDENTS: Student[] = [];

// Default Settings
const DEFAULT_SETTINGS: SystemSettings = {
  starToFlagRatio: 50,
  flagToGoldRatio: 5,
  rewardRules: [
    { id: 'r1', name: 'Phát biểu hăng hái', points: 5, type: 'plus' },
    { id: 'r2', name: 'Làm bài tập xuất sắc', points: 10, type: 'plus' },
    { id: 'r3', name: 'Giúp đỡ bạn bè', points: 15, type: 'plus' },
    { id: 'r4', name: 'Chữ viết sạch đẹp', points: 5, type: 'plus' },
    { id: 'r5', name: 'Đạt điểm tối đa bài tập', points: 20, type: 'plus' },
    { id: 'r6', name: 'Nói chuyện riêng trong lớp', points: 5, type: 'minus' },
    { id: 'r7', name: 'Thiếu bài tập về nhà', points: 10, type: 'minus' },
    { id: 'r8', name: 'Đi học muộn', points: 5, type: 'minus' },
  ],
  violationsList: [
    'Thiếu bài tập về nhà',
    'Nói chuyện riêng trong lớp',
    'Đi học muộn',
    'Không mặc đồng phục',
    'Quên mang đồ dùng học tập'
  ],
  banners: [
    {
      id: 'b1',
      type: 'image',
      url: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?w=1000&auto=format&fit=crop',
      title: 'Chào mừng bé đến với ADHE Class! 🎉',
      description: 'Học tập tiện ích, tương tác thông minh cùng thầy cô, bạn bè và gia đình.',
      bgClass: 'from-amber-400 via-pink-400 to-rose-400',
      duration: 6,
      note: 'Hình ảnh lớp học ngày đầu tiên nhập học đầy phấn khởi!'
    },
    {
      id: 'b2',
      type: 'image',
      url: 'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=1000&auto=format&fit=crop',
      title: 'Tích Sao Lấp Lánh - Đổi Thưởng To! ⭐',
      description: 'Mỗi bài phát biểu hăng hái, việc làm tốt giúp đỡ bạn bè hay bài tập hoàn thành xuất sắc sẽ mang lại cho bé những ngôi sao vinh danh rực rỡ từ cô chủ nhiệm.',
      bgClass: 'from-cyan-400 via-teal-400 to-emerald-400',
      duration: 8,
      note: 'Các bé hào hứng giơ tay phát biểu để giành lấy những ngôi sao đầu tiên.'
    },
    {
      id: 'b3',
      type: 'video',
      url: 'https://assets.mixkit.co/videos/preview/mixkit-kids-playing-and-laughing-in-classroom-42415-large.mp4',
      title: 'Video Giới Thiệu Hoạt Động Lớp Học 🎥',
      description: 'Các bé tham gia trò chơi tương tác đội nhóm sôi nổi trong tiết học Giáo dục Thể chất và Kỹ năng sống cuối tuần vừa qua.',
      bgClass: 'from-purple-500 via-indigo-400 to-blue-400',
      duration: 10,
      note: 'Khoảnh khắc đáng yêu của nhóm Mặt Trời khi hoàn thành thử thách xếp lego!'
    }
  ],
  parentFeedbackCount: 3,
  parentFeedbackRewardStars: 5,
  defaultPassword: '123',
  allowChangePassword: true
};

// Default Assignments (demonstrating all 4 question types across multiple subjects)
const DEFAULT_ASSIGNMENTS: Assignment[] = [];

const DEFAULT_ATTENDANCE: Attendance[] = [];

const DEFAULT_VIOLATIONS: Violation[] = [];

const DEFAULT_FEEDBACKS: Feedback[] = [];

const DEFAULT_SUBMISSIONS: Submission[] = [];

export const LMSProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load state helper
  const loadState = <T,>(key: string, defaultValue: T): T => {
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : defaultValue;
    } catch (e) {
      console.error(`Error loading state ${key}`, e);
      return defaultValue;
    }
  };

  // State definitions
  const [currentUser, setCurrentUser] = useState<User | null>(() => loadState('lms_current_user', null));
  const [teachers, setTeachers] = useState<Teacher[]>(() => loadState('lms_teachers', []));
  const [students, setStudents] = useState<Student[]>(() => {
    const raw = loadState<Student[]>('lms_students', INITIAL_STUDENTS);
    return recalculateRanks(raw);
  });
  const [parents, setParents] = useState<Parent[]>(() => loadState('lms_parents', []));
  const [attendanceList, setAttendanceList] = useState<Attendance[]>(() => loadState('lms_attendance', DEFAULT_ATTENDANCE));
  const [violations, setViolations] = useState<Violation[]>(() => loadState('lms_violations', DEFAULT_VIOLATIONS));
  const [assignments, setAssignments] = useState<Assignment[]>(() => loadState('lms_assignments', DEFAULT_ASSIGNMENTS));
  const [submissions, setSubmissions] = useState<Submission[]>(() => loadState('lms_submissions', DEFAULT_SUBMISSIONS));
  const [feedbacks, setFeedbacks] = useState<Feedback[]>(() => loadState('lms_feedbacks', DEFAULT_FEEDBACKS));
  const [settings, setSettings] = useState<SystemSettings>(() => loadState('lms_settings', DEFAULT_SETTINGS));
  const [zaloNotifications, setZaloNotifications] = useState<ZaloNotification[]>(() => loadState('lms_zalo_notifications', []));
  const [parentCheckedAssignments, setParentCheckedAssignments] = useState<{ [key: string]: string }>(() => loadState('lms_parent_checked', {}));

  // Helper to re-calculate ranks
  function recalculateRanks(studentList: Student[]): Student[] {
    const sorted = [...studentList].sort((a, b) => {
      // Sort by gold cards, then flags, then stars
      if (b.goldCards !== a.goldCards) return b.goldCards - a.goldCards;
      if (b.flags !== a.flags) return b.flags - a.flags;
      return b.stars - a.stars;
    });
    
    return studentList.map(s => {
      const idx = sorted.findIndex(item => item.id === s.id);
      return { ...s, rank: idx + 1 };
    });
  }

  // Auto-convert stars -> flags -> gold cards based on settings
  const checkConversions = (stars: number, existingFlags: number, existingGold: number) => {
    let currentStars = stars;
    let currentFlags = existingFlags;
    let currentGold = existingGold;

    const starToFlag = settings.starToFlagRatio;
    const flagToGold = settings.flagToGoldRatio;

    // Convert Stars to Flags
    if (currentStars >= starToFlag) {
      const newFlags = Math.floor(currentStars / starToFlag);
      currentFlags += newFlags;
      currentStars = currentStars % starToFlag;
    }

    // Convert Flags to Gold Cards
    if (currentFlags >= flagToGold) {
      const newGold = Math.floor(currentFlags / flagToGold);
      currentGold += newGold;
      currentFlags = currentFlags % flagToGold;
    }

    return { stars: currentStars, flags: currentFlags, goldCards: currentGold };
  };

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('lms_current_user', JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('lms_teachers', JSON.stringify(teachers));
  }, [teachers]);

  useEffect(() => {
    localStorage.setItem('lms_students', JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem('lms_parents', JSON.stringify(parents));
  }, [parents]);

  useEffect(() => {
    localStorage.setItem('lms_attendance', JSON.stringify(attendanceList));
  }, [attendanceList]);

  useEffect(() => {
    localStorage.setItem('lms_violations', JSON.stringify(violations));
  }, [violations]);

  useEffect(() => {
    localStorage.setItem('lms_assignments', JSON.stringify(assignments));
  }, [assignments]);

  useEffect(() => {
    localStorage.setItem('lms_submissions', JSON.stringify(submissions));
  }, [submissions]);

  useEffect(() => {
    localStorage.setItem('lms_feedbacks', JSON.stringify(feedbacks));
  }, [feedbacks]);

  useEffect(() => {
    localStorage.setItem('lms_settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('lms_zalo_notifications', JSON.stringify(zaloNotifications));
  }, [zaloNotifications]);

  useEffect(() => {
    localStorage.setItem('lms_parent_checked', JSON.stringify(parentCheckedAssignments));
  }, [parentCheckedAssignments]);

  // Real-time synchronization across browser tabs/windows
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (!e.newValue) return;
      const val = JSON.parse(e.newValue);
      switch (e.key) {
        case 'lms_current_user':
          setCurrentUser(val);
          break;
        case 'lms_teachers':
          setTeachers(val);
          break;
        case 'lms_students':
          setStudents(recalculateRanks(val));
          break;
        case 'lms_parents':
          setParents(val);
          break;
        case 'lms_attendance':
          setAttendanceList(val);
          break;
        case 'lms_violations':
          setViolations(val);
          break;
        case 'lms_assignments':
          setAssignments(val);
          break;
        case 'lms_submissions':
          setSubmissions(val);
          break;
        case 'lms_feedbacks':
          setFeedbacks(val);
          break;
        case 'lms_settings':
          setSettings(val);
          break;
        case 'lms_zalo_notifications':
          setZaloNotifications(val);
          break;
        case 'lms_parent_checked':
          setParentCheckedAssignments(val);
          break;
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Action: Import all data (teachers, students, parents)
  const importAllData = (newTeachers: Teacher[], newStudents: Student[], newParents: Parent[]) => {
    setTeachers(newTeachers);
    setStudents(recalculateRanks(newStudents));
    setParents(newParents);
  };

  // Action: Reset/clear entire classroom state
  const clearAllData = () => {
    setCurrentUser(null);
    setTeachers([]);
    setStudents([]);
    setParents([]);
    setAttendanceList([]);
    setViolations([]);
    setAssignments([]);
    setSubmissions([]);
    setFeedbacks([]);
    setZaloNotifications([]);
    setParentCheckedAssignments({});
    localStorage.removeItem('lms_current_user');
    localStorage.removeItem('lms_teachers');
    localStorage.removeItem('lms_students');
    localStorage.removeItem('lms_parents');
    localStorage.removeItem('lms_attendance');
    localStorage.removeItem('lms_violations');
    localStorage.removeItem('lms_assignments');
    localStorage.removeItem('lms_submissions');
    localStorage.removeItem('lms_feedbacks');
    localStorage.removeItem('lms_zalo_notifications');
    localStorage.removeItem('lms_parent_checked');
  };

  // Action: Add Student
  const addStudent = (studentData: Omit<Student, 'stars' | 'flags' | 'goldCards' | 'rank'>) => {
    setStudents(prev => {
      const exists = prev.some(s => s.id === studentData.id);
      if (exists) return prev;
      const newStudent: Student = {
        ...studentData,
        stars: 0,
        flags: 0,
        goldCards: 0
      };
      return recalculateRanks([...prev, newStudent]);
    });
  };

  // Action: Delete Student
  const deleteStudent = (id: string) => {
    setStudents(prev => {
      const filtered = prev.filter(s => s.id !== id);
      return recalculateRanks(filtered);
    });
  };

  // Action: Update Student
  const updateStudent = (id: string, updatedData: Partial<Student>) => {
    setStudents(prev => {
      const updated = prev.map(s => {
        if (s.id === id) {
          return { ...s, ...updatedData };
        }
        return s;
      });
      return recalculateRanks(updated);
    });
  };

  // Action: Import Students
  const importStudents = (list: Omit<Student, 'stars' | 'flags' | 'goldCards' | 'rank'>[]) => {
    setStudents(prev => {
      const merged = [...prev];
      list.forEach(item => {
        if (!merged.some(s => s.id === item.id)) {
          merged.push({
            ...item,
            stars: 0,
            flags: 0,
            goldCards: 0
          });
        }
      });
      return recalculateRanks(merged);
    });
  };

  // Action: Attendance
  const markAttendance = (studentId: string, date: string, isAbsent: boolean, notes?: string) => {
    setAttendanceList(prev => {
      const id = `${date}_${studentId}`;
      const existingIdx = prev.findIndex(a => a.id === id);
      if (existingIdx > -1) {
        const updated = [...prev];
        updated[existingIdx] = { ...updated[existingIdx], isAbsent, notes };
        return updated;
      } else {
        return [...prev, { id, date, studentId, isAbsent, notes }];
      }
    });
  };

  // Action: Delete Attendance Record
  const deleteAttendance = (studentId: string, date: string) => {
    setAttendanceList(prev => {
      const id = `${date}_${studentId}`;
      return prev.filter(a => a.id !== id);
    });
  };

  // Action: Add Violation/Reminder
  const addViolation = (studentId: string, violationType: string, message: string) => {
    const student = students.find(s => s.id === studentId);
    if (!student) return;

    const newViolation: Violation = {
      id: `v_${Date.now()}`,
      studentId,
      studentName: student.name,
      violationType,
      message,
      isResolved: false,
      createdAt: new Date().toISOString()
    };
    setViolations(prev => [newViolation, ...prev]);

    // Deduct stars if configured in rules
    const rulesMatch = settings.rewardRules.find(r => r.name === violationType && r.type === 'minus');
    if (rulesMatch) {
      rewardStars(studentId, -rulesMatch.points, `Vi phạm: ${violationType}`);
    }
  };

  // Action: Resolve Violation (Parent responds -> hides from list)
  const resolveViolation = (violationId: string, parentResponse: string) => {
    setViolations(prev =>
      prev.map(v => (v.id === violationId ? { ...v, isResolved: true, parentResponse } : v))
    );
  };

  // Action: Add / Update / Save Draft Assignment
  const addAssignment = (assignmentData: Omit<Assignment, 'id' | 'createdAt'> & { id?: string; isDraft?: boolean }) => {
    setAssignments(prev => {
      if (assignmentData.id) {
        const idx = prev.findIndex(a => a.id === assignmentData.id);
        if (idx > -1) {
          const updated = [...prev];
          updated[idx] = {
            ...updated[idx],
            ...assignmentData,
            createdAt: updated[idx].createdAt // Keep original created timestamp
          } as Assignment;
          return updated;
        }
      }
      const newAssignment: Assignment = {
        ...assignmentData,
        id: assignmentData.id || `as_${Date.now()}`,
        createdAt: new Date().toISOString()
      } as Assignment;
      return [newAssignment, ...prev];
    });
  };

  const deleteAssignment = (id: string) => {
    setAssignments(prev => prev.filter(a => a.id !== id));
  };

  // Action: Save Submission
  const saveSubmission = (sub: Submission) => {
    setSubmissions(prev => {
      const id = `${sub.studentId}_${sub.assignmentId}`;
      const updatedSub = { ...sub, id };
      const idx = prev.findIndex(item => item.id === id);
      if (idx > -1) {
        const copy = [...prev];
        copy[idx] = updatedSub;
        return copy;
      }
      return [...prev, updatedSub];
    });

    // Award reward stars if submitted successfully and hasn't been rewarded yet
    if (sub.status === 'submitted') {
      const assignment = assignments.find(a => a.id === sub.assignmentId);
      if (assignment) {
        // Calculate correct ratio for maximum star outcome
        const correctRatio = sub.totalQuestions > 0 ? sub.correctCount / sub.totalQuestions : 1;
        const reward = Math.round(assignment.rewardStars * correctRatio);
        
        // Reward student
        rewardStars(sub.studentId, reward, `Hoàn thành bài tập: ${assignment.title}`);
        
        // Extra bonus for perfect score
        if (sub.correctCount === sub.totalQuestions) {
          const perfectBonus = settings.rewardRules.find(r => r.id === 'r5');
          if (perfectBonus) {
            rewardStars(sub.studentId, perfectBonus.points, `Điểm tuyệt đối bài: ${assignment.title}`);
          }
        }
      }
    }
  };

  // Action: Delete/Reset Submission
  const deleteSubmission = (studentId: string, assignmentId: string) => {
    setSubmissions(prev => prev.filter(s => !(s.studentId === studentId && s.assignmentId === assignmentId)));
  };

  // Action: Add Feedback (Parent sends to Teacher)
  const addFeedback = (fbData: Omit<Feedback, 'id' | 'createdAt' | 'parentName' | 'studentName'>) => {
    const student = students.find(s => s.id === fbData.studentId);
    if (!student) return;

    const newFeedback: Feedback = {
      ...fbData,
      id: `fb_${Date.now()}`,
      parentName: student.parentName,
      studentName: student.name,
      createdAt: new Date().toISOString()
    };
    
    // Count how many feedbacks this parent has submitted for this student so far (including this new one)
    const count = feedbacks.filter(f => f.studentId === fbData.studentId).length + 1;
    const requiredCount = settings.parentFeedbackCount || 3;
    const rewardStarsAmt = settings.parentFeedbackRewardStars || 5;

    setFeedbacks(prev => [newFeedback, ...prev]);

    if (count % requiredCount === 0) {
      rewardStars(student.id, rewardStarsAmt, `Phụ huynh phản hồi tích cực đủ ${requiredCount} lần`);
      alert(`🎉 Tuyệt vời! Phụ huynh đã phản hồi tích cực đủ ${requiredCount} lần. Bé ${student.name} được cộng thưởng +${rewardStarsAmt} Sao ⭐ vào bảng xếp hạng thi đua!`);
    }
  };

  // Action: Reply Feedback (Teacher replies)
  const replyFeedback = (feedbackId: string, reply: string) => {
    setFeedbacks(prev =>
      prev.map(fb => (fb.id === feedbackId ? { ...fb, reply, isRead: true } : fb))
    );
  };

  // Action: Mark Feedback As Read
  const markFeedbackAsRead = (feedbackId: string) => {
    setFeedbacks(prev =>
      prev.map(fb => (fb.id === feedbackId ? { ...fb, isRead: true } : fb))
    );
  };

  // Action: Reward Stars
  const rewardStars = (studentId: string, starsCount: number, reason: string) => {
    setStudents(prev => {
      const updated = prev.map(s => {
        if (s.id === studentId) {
          // Keep stars inside logical bounds, or allow negative points but handle them gracefully
          let newStars = s.stars + starsCount;
          let newFlags = s.flags;
          let newGold = s.goldCards;

          if (newStars < 0) {
            newStars = 0;
          }

          // Trigger automated conversions (Stars -> Flags -> Gold Cards)
          const conversions = checkConversions(newStars, newFlags, newGold);
          return {
            ...s,
            stars: conversions.stars,
            flags: conversions.flags,
            goldCards: conversions.goldCards
          };
        }
        return s;
      });
      return recalculateRanks(updated);
    });
  };

  // Action: Update System Settings
  const updateSettings = (newSettings: SystemSettings) => {
    setSettings(newSettings);
  };

  // Action: Send Zalo Notification
  const sendZaloNotification = (recipientName: string, phoneNumber: string, message: string, type: 'password_change' | 'parent_reminder' | 'teacher_alert') => {
    const newNotif: ZaloNotification = {
      id: `zalo_${Date.now()}_${Math.round(Math.random() * 10000)}`,
      recipientName,
      phoneNumber,
      message,
      timestamp: new Date().toISOString(),
      type
    };
    setZaloNotifications(prev => [newNotif, ...prev]);
  };

  // Action: Mark Assignment as Checked and Reminded by Parent
  const markParentChecked = (assignmentId: string, studentId: string) => {
    const key = `${assignmentId}_${studentId}`;
    setParentCheckedAssignments(prev => ({
      ...prev,
      [key]: new Date().toISOString()
    }));
  };

  const dynamicAvailableUsers: User[] = [
    ...teachers.map(t => ({
      id: t.id,
      name: t.name,
      avatar: t.avatar || '👩‍🏫',
      role: 'teacher' as const
    })),
    ...students.filter(s => s.isActive !== false).map(s => ({
      id: s.id,
      name: s.name,
      avatar: s.avatar || '👦',
      role: 'student' as const,
      studentId: s.id
    })),
    ...parents.map(p => ({
      id: p.id,
      name: p.name,
      avatar: '👨',
      role: 'parent' as const,
      studentId: p.studentId
    }))
  ];

  return (
    <LMSContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        availableUsers: dynamicAvailableUsers,
        students,
        setStudents,
        teachers,
        setTeachers,
        parents,
        setParents,
        attendanceList,
        violations,
        assignments,
        submissions,
        feedbacks,
        settings,
        zaloNotifications,
        sendZaloNotification,
        parentCheckedAssignments,
        markParentChecked,
        addStudent,
        deleteStudent,
        updateStudent,
        importStudents,
        importAllData,
        clearAllData,
        markAttendance,
        deleteAttendance,
        addViolation,
        resolveViolation,
        addAssignment,
        deleteAssignment,
        saveSubmission,
        deleteSubmission,
        addFeedback,
        replyFeedback,
        markFeedbackAsRead,
        updateSettings,
        rewardStars,
        recalculateRanks
      }}
    >
      {children}
    </LMSContext.Provider>
  );
};

export const useLMS = () => {
  const context = useContext(LMSContext);
  if (!context) {
    throw new Error('useLMS must be used within an LMSProvider');
  }
  return context;
};
