/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useLMS } from '../context/LMSContext';
import { motion, AnimatePresence } from 'motion/react';
import {
  Users,
  GraduationCap,
  ClipboardList,
  AlertTriangle,
  Award,
  BookOpen,
  CheckCircle,
  XCircle,
  Plus,
  Trash2,
  FileSpreadsheet,
  Link as LinkIcon,
  Paperclip,
  Clock,
  Settings as SettingsIcon,
  MessageSquare,
  Volume2,
  VolumeX,
  Volume1,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Save,
  BellRing
} from 'lucide-react';
import { Student, Assignment, Question, QuestionType, RewardRule } from '../types';

export const TeacherView: React.FC = () => {
  const {
    students,
    addStudent,
    deleteStudent,
    importStudents,
    attendanceList,
    markAttendance,
    deleteAttendance,
    violations,
    addViolation,
    assignments,
    addAssignment,
    submissions,
    feedbacks,
    replyFeedback,
    settings,
    updateSettings,
    rewardStars
  } = useLMS();

  // Navigation
  const [activeTab, setActiveTab] = useState<'students' | 'assignments' | 'progress' | 'feedback' | 'settings'>('students');

  // Sub-tab under students
  const [studentSubTab, setStudentSubTab] = useState<'list' | 'attendance' | 'reminders' | 'rewards'>('list');

  // ----------------------------------------------------
  // SUB-TAB 1: MANAGING STUDENTS & IMPORT
  // ----------------------------------------------------
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentParent, setNewStudentParent] = useState('');
  const [newStudentPhone, setNewStudentPhone] = useState('');
  const [rawImportText, setRawImportText] = useState('');
  const [showImportArea, setShowImportArea] = useState(false);

  const handleAddStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentName.trim() || !newStudentParent.trim()) return;
    const newId = `stu_${Date.now()}`;
    addStudent({
      id: newId,
      name: newStudentName.trim(),
      parentName: newStudentParent.trim(),
      parentPhone: newStudentPhone.trim() || 'Chưa cung cấp',
      avatar: ['👦', '👧', '👶', '🦄', '🦁', '🦖', '🐼'][Math.floor(Math.random() * 7)]
    });
    setNewStudentName('');
    setNewStudentParent('');
    setNewStudentPhone('');
  };

  const handleImportCSV = () => {
    if (!rawImportText.trim()) return;
    // Format: Tên học sinh, Tên phụ huynh, Số điện thoại
    const lines = rawImportText.split('\n');
    const listToImport: any[] = [];
    lines.forEach((line, idx) => {
      const parts = line.split(',');
      if (parts.length >= 2 && parts[0].trim()) {
        listToImport.push({
          id: `stu_import_${Date.now()}_${idx}`,
          name: parts[0].trim(),
          parentName: parts[1].trim(),
          parentPhone: parts[2] ? parts[2].trim() : 'Chưa cung cấp',
          avatar: ['👦', '👧', '👶', '🦄', '🦁', '🦖', '🐼'][Math.floor(Math.random() * 7)]
        });
      }
    });
    if (listToImport.length > 0) {
      importStudents(listToImport);
      setRawImportText('');
      setShowImportArea(false);
    }
  };

  // ----------------------------------------------------
  // SUB-TAB 2: ATTENDANCE
  // ----------------------------------------------------
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [attendanceNotes, setAttendanceNotes] = useState<{ [studentId: string]: string }>({});

  const handleAttendanceChange = (studentId: string, isAbsent: boolean) => {
    markAttendance(studentId, selectedDate, isAbsent, attendanceNotes[studentId] || '');
  };

  const handleAttendanceNotesChange = (studentId: string, value: string) => {
    setAttendanceNotes(prev => ({ ...prev, [studentId]: value }));
    const currentRecord = attendanceList.find(a => a.date === selectedDate && a.studentId === studentId);
    if (currentRecord) {
      markAttendance(studentId, selectedDate, currentRecord.isAbsent, value);
    }
  };

  const getAbsentDaysCount = (studentId: string) => {
    return attendanceList.filter(a => a.studentId === studentId && a.isAbsent).length;
  };

  // ----------------------------------------------------
  // SUB-TAB 3: VIOLATIONS & REMINDERS
  // ----------------------------------------------------
  const [reminderStudentId, setReminderStudentId] = useState('');
  const [reminderType, setReminderType] = useState('');
  const [reminderMessage, setReminderMessage] = useState('');

  const handleSendReminder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reminderStudentId || !reminderType || !reminderMessage.trim()) return;
    addViolation(reminderStudentId, reminderType, reminderMessage.trim());
    setReminderMessage('');
    alert('Đã gửi nhắc nhở và đồng bộ thành công sang phụ huynh!');
  };

  // ----------------------------------------------------
  // SUB-TAB 4: REWARDS & VINH DANH (STARS/FLAGS)
  // ----------------------------------------------------
  const [rewardStudentId, setRewardStudentId] = useState('');
  const [rewardPoints, setRewardPoints] = useState<number>(5);
  const [rewardReason, setRewardReason] = useState('');

  const handleApplyReward = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rewardStudentId || !rewardReason) return;
    rewardStars(rewardStudentId, rewardPoints, rewardReason);
    setRewardReason('');
    alert('Đã cộng sao thành công! Hệ thống tự động quy đổi nếu đạt mốc.');
  };

  // ----------------------------------------------------
  // ASSIGNMENTS CREATOR (TAB 2)
  // ----------------------------------------------------
  const [asTitle, setAsTitle] = useState('');
  const [asDesc, setAsDesc] = useState('');
  const [asSubject, setAsSubject] = useState('Toán học');
  const [asStars, setAsStars] = useState(10);
  const [criteriaExpanded, setCriteriaExpanded] = useState(false);
  
  // Criteria states
  const [shuffle, setShuffle] = useState(false);
  const [must100, setMust100] = useState(false);
  const [onlyOne, setOnlyOne] = useState(false);
  const [timeLimit, setTimeLimit] = useState(24);

  // Attachment states
  const [attachedFiles, setAttachedFiles] = useState<{ name: string; type: string; size?: string }[]>([]);
  const [fileUrlInput, setFileUrlInput] = useState('');
  const [fileNameInput, setFileNameInput] = useState('');

  // Video / Links states
  const [linksList, setLinksList] = useState<{ title: string; url: string }[]>([]);
  const [linkTitle, setLinkTitle] = useState('');
  const [linkUrl, setLinkUrl] = useState('');

  // Speech Recognition Speech-To-Text simulation or real Web Speech API
  const [isListening, setIsListening] = useState(false);

  const startVoiceToText = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      // Simulate speaking if Web Speech isn't supported or fails
      setIsListening(true);
      setTimeout(() => {
        setAsDesc(prev => (prev ? prev + ' ' : '') + 'Các em học sinh hãy ôn tập kĩ nội dung bài học mới hôm nay.');
        setIsListening(false);
      }, 2000);
      return;
    }

    const rec = new SpeechRecognition();
    rec.lang = 'vi-VN';
    rec.interimResults = false;
    rec.maxAlternatives = 1;

    rec.onstart = () => setIsListening(true);
    rec.onend = () => setIsListening(false);
    rec.onerror = () => setIsListening(false);
    rec.onresult = (e: any) => {
      const resultText = e.results[0][0].transcript;
      setAsDesc(prev => (prev ? prev + ' ' : '') + resultText);
    };

    rec.start();
  };

  // Question Creator
  const [questions, setQuestions] = useState<Question[]>([]);
  const [qType, setQType] = useState<QuestionType>('single_choice');
  const [qText, setQText] = useState('');
  
  // Choice states
  const [singleOptA, setSingleOptA] = useState('');
  const [singleOptB, setSingleOptB] = useState('');
  const [singleOptC, setSingleOptC] = useState('');
  const [singleOptD, setSingleOptD] = useState('');
  const [singleCorrect, setSingleCorrect] = useState('A');

  // True False states
  const [tfA, setTfA] = useState('');
  const [tfACorrect, setTfACorrect] = useState(true);
  const [tfB, setTfB] = useState('');
  const [tfBCorrect, setTfBCorrect] = useState(true);
  const [tfC, setTfC] = useState('');
  const [tfCCorrect, setTfCCorrect] = useState(true);
  const [tfD, setTfD] = useState('');
  const [tfDCorrect, setTfDCorrect] = useState(true);

  // Matching states
  const [mLeft1, setMLeft1] = useState('');
  const [mRight1, setMRight1] = useState('');
  const [mLeft2, setMLeft2] = useState('');
  const [mRight2, setMRight2] = useState('');
  const [mLeft3, setMLeft3] = useState('');
  const [mRight3, setMRight3] = useState('');
  const [mLeft4, setMLeft4] = useState('');
  const [mRight4, setMRight4] = useState('');

  // Fill word states
  const [blankTextWithDots, setBlankTextWithDots] = useState(''); // "Học sinh đi học ... và học bài ..."
  const [blankWordBank, setBlankWordBank] = useState(''); // comma separated choices "chăm chỉ, đúng giờ, lười biếng"
  const [blankCorrectAnswers, setBlankCorrectAnswers] = useState(''); // comma separated in order "đúng giờ, chăm chỉ"

  const handleAddQuestion = () => {
    if (!qText.trim()) return;

    let newQ: Question = {
      id: `q_${Date.now()}`,
      type: qType,
      questionText: qText.trim()
    };

    if (qType === 'single_choice') {
      newQ.options = [
        singleOptA.trim() || 'Lựa chọn A',
        singleOptB.trim() || 'Lựa chọn B',
        singleOptC.trim() || 'Lựa chọn C',
        singleOptD.trim() || 'Lựa chọn D'
      ];
      newQ.correctAnswer = singleCorrect;
    } else if (qType === 'true_false') {
      newQ.trueFalseOptions = [
        { text: tfA.trim() || 'Phép tính A', correct: tfACorrect },
        { text: tfB.trim() || 'Phép tính B', correct: tfBCorrect },
        { text: tfC.trim() || 'Phép tính C', correct: tfCCorrect },
        { text: tfD.trim() || 'Phép tính D', correct: tfDCorrect }
      ];
    } else if (qType === 'matching') {
      const lefts = [mLeft1, mLeft2, mLeft3, mLeft4].map(s => s.trim()).filter(Boolean);
      const rights = [mRight1, mRight2, mRight3, mRight4].map(s => s.trim()).filter(Boolean);
      
      const pairs: { [key: string]: string } = {};
      if (mLeft1 && mRight1) pairs[mLeft1.trim()] = mRight1.trim();
      if (mLeft2 && mRight2) pairs[mLeft2.trim()] = mRight2.trim();
      if (mLeft3 && mRight3) pairs[mLeft3.trim()] = mRight3.trim();
      if (mLeft4 && mRight4) pairs[mLeft4.trim()] = mRight4.trim();

      newQ.matchingLeft = lefts;
      newQ.matchingRight = [...rights].sort(() => Math.random() - 0.5); // shuffle right column for matching game
      newQ.matchingPairs = pairs;
    } else if (qType === 'fill_blank') {
      const choices = blankWordBank.split(',').map(s => s.trim()).filter(Boolean);
      const answers = blankCorrectAnswers.split(',').map(s => s.trim()).filter(Boolean);
      newQ.blanksText = blankTextWithDots.trim();
      newQ.blankChoices = choices;
      newQ.blankAnswers = answers;
    }

    setQuestions(prev => [...prev, newQ]);
    
    // Reset question inputs
    setQText('');
    setSingleOptA('');
    setSingleOptB('');
    setSingleOptC('');
    setSingleOptD('');
    setTfA('');
    setTfB('');
    setTfC('');
    setTfD('');
    setMLeft1(''); setMRight1('');
    setMLeft2(''); setMRight2('');
    setMLeft3(''); setMRight3('');
    setMLeft4(''); setMRight4('');
    setBlankTextWithDots('');
    setBlankWordBank('');
    setBlankCorrectAnswers('');
  };

  const handleCreateAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!asTitle.trim() || questions.length === 0) {
      alert('Vui lòng nhập tên bài tập và tạo ít nhất 1 câu hỏi!');
      return;
    }

    addAssignment({
      title: asTitle.trim(),
      description: asDesc.trim(),
      subject: asSubject,
      attachments: attachedFiles,
      links: linksList,
      rewardStars: asStars,
      criteria: {
        shuffleQuestions: shuffle,
        mustGet100: must100,
        onlyOneAttempt: onlyOne,
        timeLimitHours: timeLimit
      },
      questions
    });

    // Reset whole assignment creator
    setAsTitle('');
    setAsDesc('');
    setAsStars(10);
    setAttachedFiles([]);
    setLinksList([]);
    setQuestions([]);
    alert('Đã giao nhiệm vụ học tập thành công đến toàn bộ học sinh và phụ huynh!');
  };

  const addSimulatedAttachment = () => {
    if (!fileNameInput.trim()) return;
    setAttachedFiles(prev => [...prev, { name: fileNameInput.trim(), type: 'word', size: '1.4 MB' }]);
    setFileNameInput('');
  };

  const addWebLink = () => {
    if (!linkTitle.trim() || !linkUrl.trim()) return;
    setLinksList(prev => [...prev, { title: linkTitle.trim(), url: linkUrl.trim() }]);
    setLinkTitle('');
    setLinkUrl('');
  };

  // ----------------------------------------------------
  // SETTINGS (TAB 5)
  // ----------------------------------------------------
  const [starRatio, setStarRatio] = useState(settings.starToFlagRatio);
  const [flagRatio, setFlagRatio] = useState(settings.flagToGoldRatio);
  const [rewardRules, setRewardRules] = useState<RewardRule[]>(settings.rewardRules);
  const [newRuleName, setNewRuleName] = useState('');
  const [newRulePoints, setNewRulePoints] = useState(5);
  const [newRuleType, setNewRuleType] = useState<'plus' | 'minus'>('plus');

  const handleSaveSettings = () => {
    updateSettings({
      starToFlagRatio: starRatio,
      flagToGoldRatio: flagRatio,
      rewardRules: rewardRules,
      violationsList: rewardRules.filter(r => r.type === 'minus').map(r => r.name)
    });
    alert('Đã lưu cấu hình cài đặt thi đua thành công vào cơ sở dữ liệu!');
  };

  const deleteRule = (ruleId: string) => {
    setRewardRules(prev => prev.filter(r => r.id !== ruleId));
  };

  const addNewRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRuleName.trim()) return;
    const newRule: RewardRule = {
      id: `r_custom_${Date.now()}`,
      name: newRuleName.trim(),
      points: newRulePoints,
      type: newRuleType
    };
    setRewardRules(prev => [...prev, newRule]);
    setNewRuleName('');
  };

  // ----------------------------------------------------
  // FEEDBACKS (TAB 4)
  // ----------------------------------------------------
  const [feedbackReplyText, setFeedbackReplyText] = useState<{ [feedbackId: string]: string }>({});

  const handleSendReply = (feedbackId: string) => {
    const text = feedbackReplyText[feedbackId];
    if (!text || !text.trim()) return;
    replyFeedback(feedbackId, text.trim());
    setFeedbackReplyText(prev => ({ ...prev, [feedbackId]: '' }));
    alert('Đã phản hồi ý kiến phụ huynh thành công!');
  };

  // 11 Subjects List
  const SUBJECTS_LIST = [
    'Toán học', 'Tiếng Việt', 'Tiếng Anh', 'Tự nhiên và Xã hội', 'Khoa học',
    'Lịch sử và Địa lý', 'Đạo đức', 'Mỹ thuật', 'Âm nhạc', 'Thể chất', 'Công nghệ'
  ];

  return (
    <div className="space-y-6">
      
      {/* Tab bar header */}
      <div className="flex flex-wrap items-center bg-white/80 backdrop-blur-md p-2 rounded-2xl border border-slate-100 shadow-sm gap-2">
        <button
          onClick={() => setActiveTab('students')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
            activeTab === 'students'
              ? 'bg-amber-500 text-white shadow-md shadow-amber-500/25'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Users className="h-4.5 w-4.5" />
          <span>Quản Lý Học Sinh</span>
        </button>

        <button
          onClick={() => setActiveTab('assignments')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
            activeTab === 'assignments'
              ? 'bg-sky-500 text-white shadow-md shadow-sky-500/25'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <BookOpen className="h-4.5 w-4.5" />
          <span>Giao Bài Tập & Câu Hỏi</span>
        </button>

        <button
          onClick={() => setActiveTab('progress')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
            activeTab === 'progress'
              ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/25'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <ClipboardList className="h-4.5 w-4.5" />
          <span>Tiến Độ & Kết Quả</span>
        </button>

        <button
          onClick={() => setActiveTab('feedback')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
            activeTab === 'feedback'
              ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/25'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <MessageSquare className="h-4.5 w-4.5" />
          <span>Ý Kiến Phụ Huynh</span>
          {feedbacks.filter(f => !f.reply).length > 0 && (
            <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse ml-1" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
            activeTab === 'settings'
              ? 'bg-slate-600 text-white shadow-md shadow-slate-500/25'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <SettingsIcon className="h-4.5 w-4.5" />
          <span>Cấu Hình Thi Đua</span>
        </button>
      </div>

      {/* Main Tab Area */}
      <AnimatePresence mode="wait">
        
        {/* TAB 1: MANAGING STUDENTS */}
        {activeTab === 'students' && (
          <motion.div
            key="students"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* Student Sub Navigation */}
            <div className="flex flex-wrap items-center bg-slate-100 p-1.5 rounded-xl gap-1 w-fit border border-slate-200">
              <button
                onClick={() => setStudentSubTab('list')}
                className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                  studentSubTab === 'list' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Danh Sách Học Sinh
              </button>
              <button
                onClick={() => setStudentSubTab('attendance')}
                className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                  studentSubTab === 'attendance' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Điểm Danh Hàng Ngày
              </button>
              <button
                onClick={() => setStudentSubTab('reminders')}
                className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                  studentSubTab === 'reminders' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Nhắc Nhở Lỗi Vi Phạm
              </button>
              <button
                onClick={() => setStudentSubTab('rewards')}
                className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                  studentSubTab === 'rewards' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Cộng Sao / Vinh Danh
              </button>
            </div>

            {/* Sub Content 1: Student List */}
            {studentSubTab === 'list' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Add student box */}
                <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-4 h-fit">
                  <h3 className="text-lg font-bold text-slate-800 flex items-center space-x-2">
                    <span className="p-1.5 bg-amber-50 rounded-lg text-amber-500 font-extrabold">+</span>
                    <span>Thêm Học Sinh Mới</span>
                  </h3>
                  
                  <form onSubmit={handleAddStudentSubmit} className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">Tên Học Sinh *</label>
                      <input
                        type="text"
                        required
                        placeholder="Ví dụ: Nguyễn Văn Hải"
                        value={newStudentName}
                        onChange={e => setNewStudentName(e.target.value)}
                        className="w-full text-sm p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-amber-400 font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">Họ Tên Phụ Huynh *</label>
                      <input
                        type="text"
                        required
                        placeholder="Ví dụ: Anh Nguyễn Văn Đông"
                        value={newStudentParent}
                        onChange={e => setNewStudentParent(e.target.value)}
                        className="w-full text-sm p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-amber-400 font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">Số Điện Thoại Phụ Huynh</label>
                      <input
                        type="text"
                        placeholder="Ví dụ: 0912345678"
                        value={newStudentPhone}
                        onChange={e => setNewStudentPhone(e.target.value)}
                        className="w-full text-sm p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-amber-400 font-medium"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full mt-2 py-2.5 bg-amber-500 text-white font-bold text-sm rounded-xl hover:bg-amber-600 cursor-pointer shadow-sm transition"
                    >
                      Thêm Học Sinh
                    </button>
                  </form>

                  <div className="border-t border-slate-100 pt-4">
                    <button
                      onClick={() => setShowImportArea(!showImportArea)}
                      className="w-full flex items-center justify-center space-x-2 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-bold cursor-pointer"
                    >
                      <FileSpreadsheet className="h-4 w-4 text-emerald-500" />
                      <span>Nhập từ Excel / CSV</span>
                    </button>
                  </div>

                  {showImportArea && (
                    <div className="space-y-2 pt-2 animate-fadeIn">
                      <p className="text-[11px] text-slate-400 leading-normal">
                        Nhập mỗi dòng một học sinh theo cú pháp:<br />
                        <code className="bg-slate-50 px-1 py-0.5 rounded font-mono font-semibold">Tên học sinh, Họ tên phụ huynh, SĐT</code>
                      </p>
                      <textarea
                        rows={4}
                        placeholder="Nguyễn Gia Bảo, Anh Nguyễn Gia Bình, 0987654321&#10;Phan Thanh Thảo, Chị Lê Thảo, 0901234567"
                        value={rawImportText}
                        onChange={e => setRawImportText(e.target.value)}
                        className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none font-medium font-mono"
                      />
                      <button
                        onClick={handleImportCSV}
                        className="w-full py-1.5 bg-emerald-500 text-white text-xs font-bold rounded-lg hover:bg-emerald-600 transition"
                      >
                        Xác Nhận Import
                      </button>
                    </div>
                  )}
                </div>

                {/* Display list of students */}
                <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-4">
                  <h3 className="text-lg font-bold text-slate-800 flex items-center justify-between">
                    <span>Sĩ số lớp: {students.length} học sinh</span>
                    <span className="text-xs bg-slate-50 border border-slate-200 px-3 py-1 rounded-full text-slate-500 font-bold uppercase">Niên khoá 2026-2027</span>
                  </h3>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm font-medium text-slate-600">
                      <thead>
                        <tr className="border-b border-slate-100 text-xs font-bold text-slate-400 uppercase">
                          <th className="py-3 px-2">Học Sinh</th>
                          <th className="py-3 px-2">Phụ Huynh & SĐT</th>
                          <th className="py-3 px-2 text-center">Tích Luỹ</th>
                          <th className="py-3 px-2 text-center">Xếp Hạng</th>
                          <th className="py-3 px-2 text-right">Thao Tác</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {students.map((student) => (
                          <tr key={student.id} className="hover:bg-slate-50/50 transition">
                            <td className="py-3.5 px-2 flex items-center space-x-2.5">
                              <span className="text-2xl">{student.avatar}</span>
                              <div>
                                <h4 className="font-bold text-slate-800 text-sm">{student.name}</h4>
                                <p className="text-[11px] text-slate-400">ID: {student.id}</p>
                              </div>
                            </td>
                            <td className="py-3.5 px-2">
                              <p className="text-xs font-bold text-slate-700">{student.parentName}</p>
                              <p className="text-[11px] text-slate-400 font-mono">{student.parentPhone}</p>
                            </td>
                            <td className="py-3.5 px-2 text-center">
                              <div className="flex items-center justify-center space-x-1.5">
                                <span className="inline-flex items-center text-xs font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-100">
                                  ⭐ {student.stars}
                                </span>
                                {student.flags > 0 && (
                                  <span className="inline-flex items-center text-xs font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-100">
                                    🚩 {student.flags}
                                  </span>
                                )}
                                {student.goldCards > 0 && (
                                  <span className="inline-flex items-center text-xs font-bold text-yellow-600 bg-yellow-50 px-1.5 py-0.5 rounded border border-yellow-200">
                                    🏆 {student.goldCards}
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="py-3.5 px-2 text-center">
                              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                student.rank === 1
                                  ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                                  : student.rank === 2
                                  ? 'bg-slate-200 text-slate-800 border border-slate-300'
                                  : student.rank === 3
                                  ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                  : 'bg-slate-50 text-slate-500'
                              }`}>
                                Hạng {student.rank}
                              </span>
                            </td>
                            <td className="py-3.5 px-2 text-right">
                              <button
                                onClick={() => deleteStudent(student.id)}
                                className="p-1.5 hover:bg-rose-50 rounded-lg text-rose-500 hover:text-rose-600 transition"
                                title="Xoá học sinh"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            )}

            {/* Sub Content 2: Attendance */}
            {studentSubTab === 'attendance' && (
              <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-800">Điểm danh hàng ngày</h3>
                    <p className="text-xs text-slate-400 font-medium">Chọn ngày để thực hiện điểm danh. Mặc định tất cả học sinh đi học.</p>
                  </div>
                  <div>
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={e => setSelectedDate(e.target.value)}
                      className="text-sm p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-amber-400 font-bold text-slate-700 bg-slate-50"
                    />
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm font-medium text-slate-600">
                    <thead>
                      <tr className="border-b border-slate-100 text-xs font-bold text-slate-400 uppercase">
                        <th className="py-3 px-2">Học Sinh</th>
                        <th className="py-3 px-2 text-center">Trạng Thái Nghỉ</th>
                        <th className="py-3 px-2">Ghi Chú Phép / Lý Do</th>
                        <th className="py-3 px-2 text-center">Tổng Vắng Học kì</th>
                        <th className="py-3 px-2 text-right">Xoá Ghi Nhận</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {students.map((student) => {
                        const attendRecord = attendanceList.find(
                          a => a.date === selectedDate && a.studentId === student.id
                        );
                        const isAbsent = attendRecord ? attendRecord.isAbsent : false;

                        return (
                          <tr key={student.id} className={`hover:bg-slate-50/50 transition ${isAbsent ? 'bg-rose-50/30' : ''}`}>
                            <td className="py-3.5 px-2 flex items-center space-x-2.5">
                              <span className="text-2xl">{student.avatar}</span>
                              <div>
                                <h4 className={`font-bold text-sm ${isAbsent ? 'text-rose-600' : 'text-slate-800'}`}>
                                  {student.name}
                                </h4>
                                <p className="text-[11px] text-slate-400">PH: {student.parentName}</p>
                              </div>
                            </td>
                            <td className="py-3.5 px-2 text-center">
                              <input
                                type="checkbox"
                                checked={isAbsent}
                                onChange={e => handleAttendanceChange(student.id, e.target.checked)}
                                className="h-5 w-5 text-rose-500 rounded border-slate-300 focus:ring-rose-400 cursor-pointer accent-rose-500"
                              />
                            </td>
                            <td className="py-3.5 px-2">
                              <input
                                type="text"
                                placeholder="Có phép, sốt phát ban, về quê..."
                                value={attendanceNotes[student.id] || attendRecord?.notes || ''}
                                onChange={e => handleAttendanceNotesChange(student.id, e.target.value)}
                                className="text-xs p-2 rounded-lg border border-slate-200 w-full focus:outline-none focus:border-rose-400 font-medium bg-transparent"
                              />
                            </td>
                            <td className="py-3.5 px-2 text-center">
                              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                                getAbsentDaysCount(student.id) > 0
                                  ? 'bg-rose-100 text-rose-600'
                                  : 'bg-emerald-100 text-emerald-600'
                              }`}>
                                {getAbsentDaysCount(student.id)} buổi vắng
                              </span>
                            </td>
                            <td className="py-3.5 px-2 text-right">
                              {attendRecord && (
                                <button
                                  onClick={() => deleteAttendance(student.id, selectedDate)}
                                  className="text-slate-400 hover:text-rose-500 text-xs font-semibold p-1 hover:bg-slate-50 rounded"
                                >
                                  Khôi phục đi học
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Sub Content 3: Reminders/Violations */}
            {studentSubTab === 'reminders' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Send reminder Form */}
                <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-4 h-fit">
                  <h3 className="text-lg font-bold text-slate-800 flex items-center space-x-2">
                    <span className="p-1.5 bg-rose-50 rounded-lg text-rose-500"><AlertTriangle className="h-4 w-4" /></span>
                    <span>Báo Lỗi Vi Phạm Hàng Ngày</span>
                  </h3>

                  <form onSubmit={handleSendReminder} className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">Chọn Học Sinh *</label>
                      <select
                        required
                        value={reminderStudentId}
                        onChange={e => setReminderStudentId(e.target.value)}
                        className="w-full text-sm p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-rose-400 font-medium"
                      >
                        <option value="">-- Chọn học sinh --</option>
                        {students.map(s => (
                          <option key={s.id} value={s.id}>{s.name} (PH: {s.parentName})</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">Loại Lỗi Vi Phạm *</label>
                      <select
                        required
                        value={reminderType}
                        onChange={e => setReminderType(e.target.value)}
                        className="w-full text-sm p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-rose-400 font-medium"
                      >
                        <option value="">-- Chọn lỗi --</option>
                        {settings.violationsList.map((v, i) => (
                          <option key={i} value={v}>{v}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">Chi tiết lỗi / Lời dặn dò *</label>
                      <textarea
                        required
                        rows={3}
                        placeholder="Nêu rõ tình huống để phụ huynh nắm và uốn nắn con ở nhà."
                        value={reminderMessage}
                        onChange={e => setReminderMessage(e.target.value)}
                        className="w-full text-sm p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-rose-400 font-medium"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 bg-rose-500 text-white font-bold text-sm rounded-xl hover:bg-rose-600 transition cursor-pointer shadow-sm"
                    >
                      Gửi Nhắc Nhở Cho Phụ Huynh
                    </button>
                  </form>
                </div>

                {/* Display Reminder History */}
                <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-4">
                  <h3 className="text-lg font-bold text-slate-800">Nhật ký nhắc nhở & phản hồi</h3>
                  <p className="text-xs text-slate-400 font-medium">Khi phụ huynh bấm Đã Xem và Xác Nhận Phản Hồi, lỗi nhắc nhở sẽ tự động chuyển trạng thái hoàn thành.</p>

                  <div className="space-y-3">
                    {violations.length === 0 ? (
                      <p className="text-center text-slate-400 py-6 text-sm">Chưa có nhắc nhở vi phạm nào.</p>
                    ) : (
                      violations.map((v) => (
                        <div key={v.id} className={`p-4 rounded-2xl border ${v.isResolved ? 'bg-slate-50 border-slate-100' : 'bg-rose-50/20 border-rose-100'} space-y-2`}>
                          <div className="flex items-center justify-between">
                            <h4 className="font-bold text-slate-800 text-sm">
                              {v.studentName} <span className="font-normal text-xs text-slate-500">vi phạm</span> <span className="text-rose-600">{v.violationType}</span>
                            </h4>
                            <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                              v.isResolved ? 'bg-slate-200 text-slate-600' : 'bg-rose-100 text-rose-600 animate-pulse'
                            }`}>
                              {v.isResolved ? 'Đã phản hồi' : 'Đang chờ phụ huynh'}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 font-medium italic">{v.message}</p>
                          
                          {v.isResolved && v.parentResponse && (
                            <div className="bg-white p-2.5 rounded-xl border border-slate-100 text-[11px] text-slate-500 mt-2">
                              <span className="font-bold text-emerald-600">Phụ huynh phản hồi:</span> "{v.parentResponse}"
                            </div>
                          )}
                          <p className="text-[10px] text-slate-400 text-right">{new Date(v.createdAt).toLocaleDateString()}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>

              </div>
            )}

            {/* Sub Content 4: Rewards and Commendations */}
            {studentSubTab === 'rewards' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Reward stars form */}
                <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-4 h-fit">
                  <h3 className="text-lg font-bold text-slate-800 flex items-center space-x-2">
                    <span className="p-1.5 bg-yellow-50 rounded-lg text-yellow-500"><Award className="h-4.5 w-4.5" /></span>
                    <span>Tặng Sao Cho Bé Chăm Ngoan</span>
                  </h3>

                  <form onSubmit={handleApplyReward} className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">Chọn Học Sinh Tuyên Dương *</label>
                      <select
                        required
                        value={rewardStudentId}
                        onChange={e => setRewardStudentId(e.target.value)}
                        className="w-full text-sm p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-yellow-400 font-medium"
                      >
                        <option value="">-- Chọn học sinh --</option>
                        {students.map(s => (
                          <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">Số Sao Thưởng *</label>
                      <select
                        required
                        value={rewardPoints}
                        onChange={e => setRewardPoints(Number(e.target.value))}
                        className="w-full text-sm p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-yellow-400 font-medium"
                      >
                        <option value="5">+5 Sao lấp lánh</option>
                        <option value="10">+10 Sao lấp lánh (Rất tốt)</option>
                        <option value="15">+15 Sao lấp lánh (Xuất sắc)</option>
                        <option value="20">+20 Sao lấp lánh (Siêu cấp học tập)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">Lý do tuyên dương *</label>
                      <input
                        type="text"
                        required
                        placeholder="Ví dụ: Hăng hái xây dựng bài môn Toán"
                        value={rewardReason}
                        onChange={e => setRewardReason(e.target.value)}
                        className="w-full text-sm p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-yellow-400 font-medium"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 bg-yellow-500 text-white font-bold text-sm rounded-xl hover:bg-yellow-600 transition cursor-pointer shadow-sm"
                    >
                      Trao Thưởng Sao ⭐
                    </button>
                  </form>
                </div>

                {/* Leaderboard Podium and Full Rankings */}
                <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-6">
                  <h3 className="text-lg font-bold text-slate-800 flex items-center justify-between">
                    <span>Bảng vinh danh lớp mẫu</span>
                    <span className="text-xs text-amber-500 font-bold bg-amber-50 px-2.5 py-1 rounded-full border border-amber-100 flex items-center gap-1">
                      <Sparkles className="h-3.5 w-3.5 animate-pulse" />
                      <span>{settings.starToFlagRatio} Sao = 1 🚩 | {settings.flagToGoldRatio} 🚩 = 1 🏆</span>
                    </span>
                  </h3>

                  {/* Top 3 Podium Cards */}
                  <div className="grid grid-cols-3 gap-3 items-end pt-6 pb-2">
                    {/* Rank 2 */}
                    {students[1] && (
                      <div className="flex flex-col items-center">
                        <span className="text-2xl mb-1">{students[1].avatar}</span>
                        <div className="bg-slate-100 border border-slate-200 rounded-t-2xl p-3 w-full text-center h-28 flex flex-col justify-between shadow-sm">
                          <span className="text-xs font-bold text-slate-700 truncate block">{students[1].name}</span>
                          <div>
                            <span className="text-lg font-black text-slate-400">#2</span>
                            <span className="block text-[10px] text-amber-600 font-bold">⭐ {students[1].stars}</span>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Rank 1 */}
                    {students[0] && (
                      <div className="flex flex-col items-center">
                        <span className="text-3xl animate-bounce mb-1">👑 {students[0].avatar}</span>
                        <div className="bg-amber-100 border-2 border-amber-300 rounded-t-2xl p-3 w-full text-center h-36 flex flex-col justify-between shadow-md">
                          <span className="text-xs font-black text-amber-900 truncate block">{students[0].name}</span>
                          <div>
                            <span className="text-2xl font-black text-amber-600">#1</span>
                            <span className="block text-xs text-amber-700 font-extrabold">⭐ {students[0].stars}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Rank 3 */}
                    {students[2] && (
                      <div className="flex flex-col items-center">
                        <span className="text-2xl mb-1">{students[2].avatar}</span>
                        <div className="bg-amber-50 border border-amber-100 rounded-t-2xl p-3 w-full text-center h-24 flex flex-col justify-between shadow-sm">
                          <span className="text-xs font-bold text-amber-800 truncate block">{students[2].name}</span>
                          <div>
                            <span className="text-base font-black text-amber-700">#3</span>
                            <span className="block text-[10px] text-amber-600 font-bold">⭐ {students[2].stars}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Detailed Ranking List */}
                  <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                    {students.map((student, index) => (
                      <div key={student.id} className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between text-xs">
                        <div className="flex items-center space-x-3">
                          <span className="font-bold text-slate-400 w-4">#{index + 1}</span>
                          <span className="text-xl">{student.avatar}</span>
                          <div>
                            <h5 className="font-bold text-slate-800">{student.name}</h5>
                            <p className="text-[10px] text-slate-400">Danh hiệu học kì</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3 font-mono font-bold">
                          <span className="text-amber-600">⭐ {student.stars} sao</span>
                          <span className="text-rose-600">🚩 {student.flags} cờ</span>
                          <span className="text-yellow-600">🏆 {student.goldCards} thẻ vàng</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}
          </motion.div>
        )}

        {/* TAB 2: ASSIGNMENTS & QUESTIONS BUILDER */}
        {activeTab === 'assignments' && (
          <motion.div
            key="assignments"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          >
            {/* Create Assignment Form */}
            <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-4 h-fit">
              <h3 className="text-lg font-bold text-slate-800 flex items-center space-x-2">
                <span className="p-1.5 bg-sky-50 rounded-lg text-sky-500"><BookOpen className="h-4.5 w-4.5" /></span>
                <span>Tạo Nhiệm Vụ Học Tập Mới</span>
              </h3>

              <form onSubmit={handleCreateAssignment} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Môn Học (11 Môn)</label>
                    <select
                      value={asSubject}
                      onChange={e => setAsSubject(e.target.value)}
                      className="w-full text-sm p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-sky-400 font-bold text-slate-700 bg-slate-50"
                    >
                      {SUBJECTS_LIST.map((subj, idx) => (
                        <option key={idx} value={subj}>{subj}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Sao Thưởng Hoàn Thành</label>
                    <input
                      type="number"
                      required
                      min={1}
                      max={100}
                      value={asStars}
                      onChange={e => setAsStars(Number(e.target.value))}
                      className="w-full text-sm p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-sky-400 font-bold text-slate-700"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Tên Nhiệm Vụ Học Tập *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: Ôn tập bảng nhân 6 và nhân 7"
                    value={asTitle}
                    onChange={e => setAsTitle(e.target.value)}
                    className="w-full text-sm p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-sky-400 font-semibold text-slate-800"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-slate-500">Mô Tả Lời Dặn Dò Thầy Cô</label>
                    <button
                      type="button"
                      onClick={startVoiceToText}
                      className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                        isListening
                          ? 'bg-rose-500 text-white animate-pulse'
                          : 'bg-sky-50 hover:bg-sky-100 text-sky-600'
                      }`}
                    >
                      <Volume2 className="h-3 w-3" />
                      <span>{isListening ? 'Đang ghi âm...' : 'Giọng Nói 🎙️'}</span>
                    </button>
                  </div>
                  <textarea
                    rows={2}
                    placeholder="Nhập văn bản lời nhắn, hoặc bấm nút 'Giọng Nói' để ghi âm chuyển giọng nói thành văn bản tiếng Việt!"
                    value={asDesc}
                    onChange={e => setAsDesc(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-sky-400 font-medium"
                  />
                </div>

                {/* Criteria - Collapsible */}
                <div className="border border-slate-100 rounded-2xl p-3 bg-slate-50/50">
                  <button
                    type="button"
                    onClick={() => setCriteriaExpanded(!criteriaExpanded)}
                    className="w-full flex items-center justify-between text-xs font-bold text-slate-600 cursor-pointer"
                  >
                    <span>Cấu hình Tiêu chí chấm điểm</span>
                    {criteriaExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </button>
                  
                  {criteriaExpanded && (
                    <div className="space-y-2 mt-3 pt-3 border-t border-slate-100 text-xs text-slate-600 font-medium">
                      <label className="flex items-center space-x-2.5">
                        <input type="checkbox" checked={shuffle} onChange={e => setShuffle(e.target.checked)} className="h-4 w-4 accent-sky-500" />
                        <span>Xáo trộn thứ tự các câu hỏi</span>
                      </label>
                      <label className="flex items-center space-x-2.5">
                        <input type="checkbox" checked={must100} onChange={e => setMust100(e.target.checked)} className="h-4 w-4 accent-sky-500" />
                        <span>Chỉ cho phép nộp khi đúng 100% câu hỏi</span>
                      </label>
                      <label className="flex items-center space-x-2.5">
                        <input type="checkbox" checked={onlyOne} onChange={e => setOnlyOne(e.target.checked)} className="h-4 w-4 accent-sky-500" />
                        <span>Học sinh chỉ được làm bài 1 lần duy nhất</span>
                      </label>
                      <div className="flex items-center justify-between pt-1">
                        <span>Hạn hoàn thành trong (giờ):</span>
                        <input
                          type="number"
                          value={timeLimit}
                          onChange={e => setTimeLimit(Number(e.target.value))}
                          className="w-16 p-1 rounded border border-slate-200 text-center font-bold font-mono"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Attachments & Links - Horizontal group */}
                <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-2xl">
                  {/* Attachments Section */}
                  <div className="space-y-1.5 border-r border-slate-200/50 pr-2">
                    <span className="block text-[11px] font-bold text-slate-500">Tài liệu Đính kèm ({attachedFiles.length})</span>
                    <input
                      type="text"
                      placeholder="Tên file đính kèm..."
                      value={fileNameInput}
                      onChange={e => setFileNameInput(e.target.value)}
                      className="w-full text-[11px] p-1.5 rounded bg-white border border-slate-200"
                    />
                    <button
                      type="button"
                      onClick={addSimulatedAttachment}
                      className="w-full py-1 text-[10px] bg-slate-200 text-slate-700 font-bold rounded"
                    >
                      + Đính kèm file
                    </button>
                    <div className="space-y-1 max-h-16 overflow-y-auto pt-1">
                      {attachedFiles.map((f, i) => (
                        <div key={i} className="flex items-center justify-between text-[10px] bg-white px-2 py-0.5 rounded border border-slate-100 font-medium">
                          <span className="truncate max-w-[80px]">{f.name}</span>
                          <button type="button" onClick={() => setAttachedFiles(prev => prev.filter((_, idx) => idx !== i))} className="text-rose-500 font-bold">x</button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Links Section */}
                  <div className="space-y-1.5 pl-1">
                    <span className="block text-[11px] font-bold text-slate-500">Đường Links bổ trợ ({linksList.length})</span>
                    <input
                      type="text"
                      placeholder="Tên link..."
                      value={linkTitle}
                      onChange={e => setLinkTitle(e.target.value)}
                      className="w-full text-[11px] p-1.5 rounded bg-white border border-slate-200"
                    />
                    <input
                      type="text"
                      placeholder="URL..."
                      value={linkUrl}
                      onChange={e => setLinkUrl(e.target.value)}
                      className="w-full text-[11px] p-1.5 rounded bg-white border border-slate-200"
                    />
                    <button
                      type="button"
                      onClick={addWebLink}
                      className="w-full py-1 text-[10px] bg-slate-200 text-slate-700 font-bold rounded"
                    >
                      + Thêm Đường Link
                    </button>
                    <div className="space-y-1 max-h-16 overflow-y-auto pt-1">
                      {linksList.map((link, i) => (
                        <div key={i} className="flex items-center justify-between text-[10px] bg-white px-2 py-0.5 rounded border border-slate-100 font-medium">
                          <span className="truncate max-w-[80px]">{link.title}</span>
                          <button type="button" onClick={() => setLinksList(prev => prev.filter((_, idx) => idx !== i))} className="text-rose-500 font-bold">x</button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-3 bg-sky-500 text-white font-extrabold text-sm rounded-2xl hover:bg-sky-600 transition shadow-md shadow-sky-500/25 cursor-pointer"
                  >
                    GỬI NHIỆM VỤ ĐẾN HỌC SINH ({questions.length} CÂU HỎI)
                  </button>
                </div>
              </form>
            </div>

            {/* Questions Builder Column */}
            <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-4">
              <h3 className="text-lg font-bold text-slate-800 flex items-center justify-between">
                <span>Soạn Bộ Câu Hỏi ({questions.length})</span>
                <span className="text-xs bg-sky-50 text-sky-600 px-3 py-1 rounded-full font-bold">4 Kiểu Câu Hỏi Cao Cấp</span>
              </h3>

              {/* Form to create a question */}
              <div className="bg-slate-50 p-4 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase">Loại Câu Hỏi:</span>
                  <div className="flex bg-white p-1 rounded-lg border border-slate-200 text-[10px] font-bold">
                    <button
                      onClick={() => setQType('single_choice')}
                      className={`px-2.5 py-1 rounded-md transition ${qType === 'single_choice' ? 'bg-sky-500 text-white' : 'text-slate-600'}`}
                    >
                      Trắc nghiệm 1 đáp án
                    </button>
                    <button
                      onClick={() => setQType('true_false')}
                      className={`px-2.5 py-1 rounded-md transition ${qType === 'true_false' ? 'bg-sky-500 text-white' : 'text-slate-600'}`}
                    >
                      Đúng/Sai
                    </button>
                    <button
                      onClick={() => setQType('matching')}
                      className={`px-2.5 py-1 rounded-md transition ${qType === 'matching' ? 'bg-sky-500 text-white' : 'text-slate-600'}`}
                    >
                      Nối vế
                    </button>
                    <button
                      onClick={() => setQType('fill_blank')}
                      className={`px-2.5 py-1 rounded-md transition ${qType === 'fill_blank' ? 'bg-sky-500 text-white' : 'text-slate-600'}`}
                    >
                      Điền từ
                    </button>
                  </div>
                </div>

                {/* Question Text */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">Nội dung câu hỏi chính *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: Bé hãy điền từ vào câu sau... hoặc Kết quả phép tính..."
                    value={qText}
                    onChange={e => setQText(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl bg-white border border-slate-200 focus:outline-none focus:border-sky-400 font-medium"
                  />
                </div>

                {/* Type 1 Options (Single choice) */}
                {qType === 'single_choice' && (
                  <div className="space-y-2 animate-fadeIn text-xs">
                    <span className="block font-bold text-slate-500">Các đáp án lựa chọn:</span>
                    <div className="grid grid-cols-2 gap-2">
                      <input type="text" placeholder="Đáp án A" value={singleOptA} onChange={e => setSingleOptA(e.target.value)} className="p-2 rounded bg-white border border-slate-200" />
                      <input type="text" placeholder="Đáp án B" value={singleOptB} onChange={e => setSingleOptB(e.target.value)} className="p-2 rounded bg-white border border-slate-200" />
                      <input type="text" placeholder="Đáp án C" value={singleOptC} onChange={e => setSingleOptC(e.target.value)} className="p-2 rounded bg-white border border-slate-200" />
                      <input type="text" placeholder="Đáp án D" value={singleOptD} onChange={e => setSingleOptD(e.target.value)} className="p-2 rounded bg-white border border-slate-200" />
                    </div>
                    <div className="flex items-center space-x-2 pt-1 font-bold">
                      <span>Đáp án đúng:</span>
                      {['A', 'B', 'C', 'D'].map(letter => (
                        <button
                          key={letter}
                          type="button"
                          onClick={() => setSingleCorrect(letter)}
                          className={`px-3 py-1 rounded border transition ${
                            singleCorrect === letter ? 'bg-amber-400 text-white border-amber-500' : 'bg-white border-slate-200'
                          }`}
                        >
                          {letter}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Type 2 Options (True / False) */}
                {qType === 'true_false' && (
                  <div className="space-y-2 animate-fadeIn text-xs">
                    <span className="block font-bold text-slate-500">Danh sách các vế câu và lựa chọn Đúng/Sai tương ứng:</span>
                    
                    <div className="space-y-1.5">
                      {/* Sub A */}
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-slate-400">A.</span>
                        <input type="text" placeholder="Ví dụ: 6 x 8 = 48" value={tfA} onChange={e => setTfA(e.target.value)} className="flex-1 p-1.5 rounded bg-white border border-slate-200 text-xs" />
                        <label className="flex items-center space-x-1 font-bold cursor-pointer">
                          <input type="checkbox" checked={tfACorrect} onChange={e => setTfACorrect(e.target.checked)} className="accent-sky-500" />
                          <span>Đúng</span>
                        </label>
                      </div>

                      {/* Sub B */}
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-slate-400">B.</span>
                        <input type="text" placeholder="Ví dụ: 7 x 9 = 64" value={tfB} onChange={e => setTfB(e.target.value)} className="flex-1 p-1.5 rounded bg-white border border-slate-200 text-xs" />
                        <label className="flex items-center space-x-1 font-bold cursor-pointer">
                          <input type="checkbox" checked={tfBCorrect} onChange={e => setTfBCorrect(e.target.checked)} className="accent-sky-500" />
                          <span>Đúng</span>
                        </label>
                      </div>

                      {/* Sub C */}
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-slate-400">C.</span>
                        <input type="text" placeholder="Phép tính vế C" value={tfC} onChange={e => setTfC(e.target.value)} className="flex-1 p-1.5 rounded bg-white border border-slate-200 text-xs" />
                        <label className="flex items-center space-x-1 font-bold cursor-pointer">
                          <input type="checkbox" checked={tfCCorrect} onChange={e => setTfCCorrect(e.target.checked)} className="accent-sky-500" />
                          <span>Đúng</span>
                        </label>
                      </div>

                      {/* Sub D */}
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-slate-400">D.</span>
                        <input type="text" placeholder="Phép tính vế D" value={tfD} onChange={e => setTfD(e.target.value)} className="flex-1 p-1.5 rounded bg-white border border-slate-200 text-xs" />
                        <label className="flex items-center space-x-1 font-bold cursor-pointer">
                          <input type="checkbox" checked={tfDCorrect} onChange={e => setTfDCorrect(e.target.checked)} className="accent-sky-500" />
                          <span>Đúng</span>
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                {/* Type 3 Options (Matching Left/Right) */}
                {qType === 'matching' && (
                  <div className="space-y-2 animate-fadeIn text-xs">
                    <span className="block font-bold text-slate-500">Thiết lập các cặp nối Đúng khớp (Cột trái đi kèm Cột phải tương ứng):</span>
                    
                    <div className="space-y-1.5">
                      <div className="flex space-x-2">
                        <input type="text" placeholder="Cột trái 1 (vd: 9 x 3)" value={mLeft1} onChange={e => setMLeft1(e.target.value)} className="flex-1 p-1.5 rounded bg-white border border-slate-200" />
                        <span className="text-slate-400">⇔</span>
                        <input type="text" placeholder="Cột phải 1 (vd: 27)" value={mRight1} onChange={e => setMRight1(e.target.value)} className="flex-1 p-1.5 rounded bg-white border border-slate-200" />
                      </div>
                      <div className="flex space-x-2">
                        <input type="text" placeholder="Cột trái 2" value={mLeft2} onChange={e => setMLeft2(e.target.value)} className="flex-1 p-1.5 rounded bg-white border border-slate-200" />
                        <span className="text-slate-400">⇔</span>
                        <input type="text" placeholder="Cột phải 2" value={mRight2} onChange={e => setMRight2(e.target.value)} className="flex-1 p-1.5 rounded bg-white border border-slate-200" />
                      </div>
                      <div className="flex space-x-2">
                        <input type="text" placeholder="Cột trái 3" value={mLeft3} onChange={e => setMLeft3(e.target.value)} className="flex-1 p-1.5 rounded bg-white border border-slate-200" />
                        <span className="text-slate-400">⇔</span>
                        <input type="text" placeholder="Cột phải 3" value={mRight3} onChange={e => setMRight3(e.target.value)} className="flex-1 p-1.5 rounded bg-white border border-slate-200" />
                      </div>
                      <div className="flex space-x-2">
                        <input type="text" placeholder="Cột trái 4" value={mLeft4} onChange={e => setMLeft4(e.target.value)} className="flex-1 p-1.5 rounded bg-white border border-slate-200" />
                        <span className="text-slate-400">⇔</span>
                        <input type="text" placeholder="Cột phải 4" value={mRight4} onChange={e => setMRight4(e.target.value)} className="flex-1 p-1.5 rounded bg-white border border-slate-200" />
                      </div>
                    </div>
                  </div>
                )}

                {/* Type 4 Options (Fill Word in the blank) */}
                {qType === 'fill_blank' && (
                  <div className="space-y-2 animate-fadeIn text-xs">
                    <div>
                      <label className="block font-bold text-slate-500 mb-0.5">Văn bản có chứa dấu dải "..." *</label>
                      <input
                        type="text"
                        placeholder="Ví dụ: Bé đi học ... và học bài rất ..."
                        value={blankTextWithDots}
                        onChange={e => setBlankTextWithDots(e.target.value)}
                        className="w-full p-2 rounded bg-white border border-slate-200"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block font-bold text-slate-400 mb-0.5">Hộp ngân hàng từ (phẩy cách)</label>
                        <input
                          type="text"
                          placeholder="đúng giờ, lười biếng, chăm chỉ"
                          value={blankWordBank}
                          onChange={e => setBlankWordBank(e.target.value)}
                          className="w-full p-2 rounded bg-white border border-slate-200"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-400 mb-0.5">Đáp án đúng thứ tự (phẩy cách)</label>
                        <input
                          type="text"
                          placeholder="đúng giờ, chăm chỉ"
                          value={blankCorrectAnswers}
                          onChange={e => setBlankCorrectAnswers(e.target.value)}
                          className="w-full p-2 rounded bg-white border border-slate-200"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleAddQuestion}
                  className="w-full py-2 bg-slate-800 text-white font-bold text-xs rounded-xl hover:bg-slate-900 cursor-pointer"
                >
                  + LƯU CÂU HỎI VÀO BỘ BÀI
                </button>
              </div>

              {/* Draft Questions List */}
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 border-t border-slate-100 pt-3">
                {questions.length === 0 ? (
                  <p className="text-center text-slate-400 text-xs py-8">Chưa có câu hỏi nào được thêm. Hãy soạn câu hỏi ở trên!</p>
                ) : (
                  questions.map((q, idx) => (
                    <div key={q.id} className="p-3 bg-slate-50 border border-slate-150 rounded-xl flex items-start justify-between text-xs font-medium">
                      <div>
                        <span className="font-extrabold text-sky-600 block mb-0.5">Câu {idx + 1}: {
                          q.type === 'single_choice' ? 'Trắc nghiệm 1 đáp án' : q.type === 'true_false' ? 'Đúng/Sai' : q.type === 'matching' ? 'Nối vế' : 'Điền từ'
                        }</span>
                        <p className="text-slate-800 font-semibold">{q.questionText}</p>
                        {q.type === 'fill_blank' && (
                          <p className="text-[10px] text-slate-500 mt-1 italic">{q.blanksText}</p>
                        )}
                      </div>
                      <button
                        onClick={() => setQuestions(prev => prev.filter(item => item.id !== q.id))}
                        className="text-rose-500 hover:text-rose-600 p-1 hover:bg-white rounded"
                      >
                        Xoá
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 3: STUDENT PROGRESS & QUIZ ANALYTICS */}
        {activeTab === 'progress' && (
          <motion.div
            key="progress"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-6"
          >
            <div>
              <h3 className="text-lg font-bold text-slate-800">Tiến độ hoàn thành nhiệm vụ & Kết quả</h3>
              <p className="text-xs text-slate-400 font-medium">Theo dõi chi tiết số lần làm bài, số câu đúng, thời gian làm bài của học sinh. Nhắc nhở phụ huynh nếu học sinh chưa làm xong.</p>
            </div>

            <div className="space-y-6">
              {assignments.map((assignment) => {
                return (
                  <div key={assignment.id} className="border border-slate-150 rounded-2xl p-4 md:p-5 space-y-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-100 pb-3 gap-2">
                      <div>
                        <span className="text-xs font-bold text-sky-600 bg-sky-50 px-2 py-0.5 rounded border border-sky-100 uppercase">
                          {assignment.subject}
                        </span>
                        <h4 className="font-bold text-slate-800 text-base mt-1">{assignment.title}</h4>
                      </div>
                      <div className="text-xs text-slate-400 font-bold font-mono">
                        Đã giao lúc: {new Date(assignment.createdAt).toLocaleString()}
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs font-medium text-slate-600">
                        <thead>
                          <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase">
                            <th className="py-2 px-1">Học Sinh</th>
                            <th className="py-2 px-1 text-center">Trạng Thái</th>
                            <th className="py-2 px-1 text-center">Lần Làm</th>
                            <th className="py-2 px-1 text-center">Đúng / Tổng</th>
                            <th className="py-2 px-1 text-center">Thời Gian Làm</th>
                            <th className="py-2 px-1 text-center">Ngày Nộp Bài</th>
                            <th className="py-2 px-1 text-right">Hành Động</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                          {students.map((student) => {
                            const subRecord = submissions.find(
                              s => s.assignmentId === assignment.id && s.studentId === student.id
                            );
                            const isDone = subRecord && subRecord.status === 'submitted';

                            return (
                              <tr key={student.id} className="hover:bg-slate-50/50">
                                <td className="py-2.5 px-1 flex items-center space-x-2">
                                  <span>{student.avatar}</span>
                                  <span className="font-bold text-slate-800">{student.name}</span>
                                </td>
                                <td className="py-2.5 px-1 text-center">
                                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                    isDone
                                      ? 'bg-emerald-100 text-emerald-700'
                                      : 'bg-rose-100 text-rose-700 animate-pulse'
                                  }`}>
                                    {isDone ? 'Hoàn thành' : 'Chưa làm'}
                                  </span>
                                </td>
                                <td className="py-2.5 px-1 text-center font-bold">
                                  {isDone ? `${subRecord.attemptsCount} lần` : '-'}
                                </td>
                                <td className="py-2.5 px-1 text-center font-bold text-slate-700">
                                  {isDone ? `${subRecord.correctCount} / ${subRecord.totalQuestions}` : '-'}
                                </td>
                                <td className="py-2.5 px-1 text-center font-mono font-bold">
                                  {isDone ? `${subRecord.timeSpentSeconds} giây` : '-'}
                                </td>
                                <td className="py-2.5 px-1 text-center text-slate-400">
                                  {isDone ? new Date(subRecord.submittedAt).toLocaleDateString() : '-'}
                                </td>
                                <td className="py-2.5 px-1 text-right">
                                  {!isDone && (
                                    <button
                                      onClick={() => {
                                        addViolation(student.id, 'Thiếu bài tập về nhà', `Nhắc nhở bé hoàn thành nhiệm vụ '${assignment.title}' môn ${assignment.subject}.`);
                                        alert(`Đã gửi thông báo nhắc nhở làm bài tập đến phụ huynh em ${student.name}!`);
                                      }}
                                      className="inline-flex items-center space-x-1 px-2.5 py-1 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-700 rounded-lg text-[10px] font-bold cursor-pointer transition"
                                    >
                                      <BellRing className="h-3.5 w-3.5" />
                                      <span>Nhắc nhở PH</span>
                                    </button>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* TAB 4: PARENTAL FEEDBACKS */}
        {activeTab === 'feedback' && (
          <motion.div
            key="feedback"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-6"
          >
            <div>
              <h3 className="text-lg font-bold text-slate-800">Ý kiến & phản hồi từ Phụ huynh</h3>
              <p className="text-xs text-slate-400 font-medium">Giải đáp thắc mắc, phản hồi tình hình học tập hàng ngày của con cho cha mẹ học sinh biết.</p>
            </div>

            <div className="space-y-4">
              {feedbacks.length === 0 ? (
                <p className="text-center text-slate-400 py-10 text-sm">Chưa có ý kiến phản hồi nào từ phụ huynh.</p>
              ) : (
                feedbacks.map((fb) => (
                  <div key={fb.id} className="p-4 rounded-2xl border border-slate-150 bg-slate-50/50 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="p-2 bg-indigo-50 rounded-xl text-indigo-500 font-bold">PH</span>
                        <div>
                          <h4 className="font-bold text-slate-800 text-sm">{fb.parentName}</h4>
                          <p className="text-[10px] text-slate-400 font-semibold">Phụ huynh em: {fb.studentName}</p>
                        </div>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono font-bold">
                        {new Date(fb.createdAt).toLocaleString()}
                      </span>
                    </div>

                    <p className="text-xs text-slate-700 bg-white p-3 rounded-xl border border-slate-100 font-medium">
                      "{fb.message}"
                    </p>

                    {fb.reply ? (
                      <div className="bg-emerald-50/50 border border-emerald-100 p-3 rounded-xl space-y-1">
                        <span className="text-[10px] font-bold text-emerald-700 uppercase block">Thầy cô phản hồi:</span>
                        <p className="text-xs text-slate-600 font-medium">"{fb.reply}"</p>
                      </div>
                    ) : (
                      <div className="space-y-2 pt-1">
                        <textarea
                          rows={2}
                          placeholder="Nhập nội dung phản hồi cho phụ huynh..."
                          value={feedbackReplyText[fb.id] || ''}
                          onChange={e => setFeedbackReplyText(prev => ({ ...prev, [fb.id]: e.target.value }))}
                          className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-400 font-medium bg-white"
                        />
                        <button
                          onClick={() => handleSendReply(fb.id)}
                          className="px-4 py-2 bg-indigo-500 text-white font-bold text-xs rounded-lg hover:bg-indigo-600 transition"
                        >
                          Gửi Phản Hồi Cho Phụ Huynh
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}

        {/* TAB 5: SYSTEM SETTINGS & REWARD RULES */}
        {activeTab === 'settings' && (
          <motion.div
            key="settings"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          >
            {/* Auto calculations ratios */}
            <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-6 h-fit">
              <h3 className="text-lg font-bold text-slate-800 flex items-center space-x-2">
                <span className="p-1.5 bg-slate-100 rounded-lg text-slate-600"><SettingsIcon className="h-4.5 w-4.5" /></span>
                <span>Công Thức Quy Đổi Tự Động</span>
              </h3>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-500">Mốc đổi Cờ Thi Đua (Sao → Cờ)</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      value={starRatio}
                      onChange={e => setStarRatio(Number(e.target.value))}
                      className="w-24 p-2 rounded-xl border border-slate-200 focus:outline-none text-center font-bold"
                    />
                    <span className="text-xs font-bold text-slate-500">Sao lấp lánh tự động đổi thành 1 Cờ thi đua</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-500">Mốc đổi Thẻ Vàng (Cờ → Thẻ Vàng)</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      value={flagRatio}
                      onChange={e => setFlagRatio(Number(e.target.value))}
                      className="w-24 p-2 rounded-xl border border-slate-200 focus:outline-none text-center font-bold"
                    />
                    <span className="text-xs font-bold text-slate-500 font-sans">Cờ thi đua tự động đổi thành 1 Thẻ Vàng danh giá</span>
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    onClick={handleSaveSettings}
                    className="w-full py-2.5 bg-slate-800 text-white font-bold text-xs rounded-xl hover:bg-slate-900 transition flex items-center justify-center space-x-1.5 cursor-pointer"
                  >
                    <Save className="h-4 w-4" />
                    <span>Lưu Cấu Hình Mốc Đổi Thưởng</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Custom rules for reward and deduction */}
            <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-4">
              <h3 className="text-lg font-bold text-slate-800">Cấu hình Tiêu chí & Lỗi vi phạm</h3>
              
              <form onSubmit={addNewRule} className="bg-slate-50 p-3.5 rounded-2xl space-y-3">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="block font-bold text-slate-500 mb-1">Tên Tiêu chí / Hành vi</label>
                    <input
                      type="text"
                      required
                      placeholder="vd: Hát to rõ môn Âm nhạc"
                      value={newRuleName}
                      onChange={e => setNewRuleName(e.target.value)}
                      className="w-full p-2 rounded-lg bg-white border border-slate-200 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-500 mb-1">Hệ thống Sao phạt / thưởng</label>
                    <div className="flex space-x-1">
                      <select
                        value={newRuleType}
                        onChange={e => setNewRuleType(e.target.value as 'plus' | 'minus')}
                        className="p-2 rounded-lg bg-white border border-slate-200 text-xs font-bold"
                      >
                        <option value="plus">Thưởng Sao (+)</option>
                        <option value="minus">Phạt Sao (-)</option>
                      </select>
                      <input
                        type="number"
                        required
                        min={1}
                        value={newRulePoints}
                        onChange={e => setNewRulePoints(Number(e.target.value))}
                        className="w-12 p-2 rounded-lg bg-white border border-slate-200 text-center font-bold"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2 bg-slate-700 text-white font-bold text-[11px] rounded-lg hover:bg-slate-800 transition cursor-pointer"
                >
                  + THÊM VÀO DANH SÁCH TIÊU CHÍ
                </button>
              </form>

              <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                {rewardRules.map((rule) => (
                  <div key={rule.id} className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between text-xs font-medium">
                    <div className="flex items-center space-x-2">
                      <span className={`h-2 w-2 rounded-full ${rule.type === 'plus' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                      <span className="text-slate-700 font-bold">{rule.name}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className={`font-bold font-mono ${rule.type === 'plus' ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {rule.type === 'plus' ? '+' : '-'}{rule.points} Sao
                      </span>
                      <button
                        type="button"
                        onClick={() => deleteRule(rule.id)}
                        className="text-slate-400 hover:text-rose-500 text-xs"
                      >
                        Xoá
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

      </AnimatePresence>

    </div>
  );
};
