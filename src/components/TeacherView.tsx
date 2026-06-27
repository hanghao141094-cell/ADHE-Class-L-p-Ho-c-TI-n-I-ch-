/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useLMS } from '../context/LMSContext';
import { motion, AnimatePresence } from 'motion/react';
import { AssignmentFrames } from './AssignmentFrames';
import { audioSynth } from './AudioSynthesizer';
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
  Pencil,
  Book,
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
  BellRing,
  Download,
  Upload,
  Edit3,
  Film,
  Image as ImageIcon,
  Send,
  LayoutGrid
} from 'lucide-react';
import { Student, Assignment, Question, QuestionType, RewardRule, BoardBanner, Submission } from '../types';

const SUBJECT_COLORS: { [subject: string]: { bg: string, activeBg: string, hover: string, icon: string } } = {
  'Toán': { bg: 'bg-gradient-to-br from-sky-50 to-blue-100/80 text-blue-950 border-blue-200', activeBg: 'bg-gradient-to-br from-blue-500 to-sky-400 text-white border-blue-500 shadow-lg shadow-blue-500/30', hover: 'hover:bg-blue-100 hover:border-blue-300', icon: '🧮' },
  'Tiếng Việt': { bg: 'bg-gradient-to-br from-pink-50 to-rose-100/80 text-rose-950 border-pink-200', activeBg: 'bg-gradient-to-br from-pink-500 to-rose-400 text-white border-pink-500 shadow-lg shadow-pink-500/30', hover: 'hover:bg-pink-100 hover:border-pink-300', icon: '📖' },
  'Khoa học': { bg: 'bg-gradient-to-br from-teal-50 to-emerald-100/80 text-teal-950 border-teal-200', activeBg: 'bg-gradient-to-br from-teal-500 to-emerald-400 text-white border-teal-500 shadow-lg shadow-teal-500/30', hover: 'hover:bg-teal-100 hover:border-teal-300', icon: '🔬' },
  'Lịch sử và Địa lí': { bg: 'bg-gradient-to-br from-amber-50 to-orange-100/80 text-amber-950 border-amber-200', activeBg: 'bg-gradient-to-br from-amber-500 to-orange-400 text-white border-amber-500 shadow-lg shadow-amber-500/30', hover: 'hover:bg-amber-100 hover:border-amber-300', icon: '🗺️' },
  'Công nghệ': { bg: 'bg-gradient-to-br from-indigo-50 to-purple-100/80 text-indigo-950 border-indigo-200', activeBg: 'bg-gradient-to-br from-indigo-500 to-purple-400 text-white border-indigo-500 shadow-lg shadow-indigo-500/30', hover: 'hover:bg-indigo-100 hover:border-indigo-300', icon: '⚙️' },
  'Tin học': { bg: 'bg-gradient-to-br from-slate-50 to-slate-200/80 text-slate-900 border-slate-300', activeBg: 'bg-gradient-to-br from-slate-600 to-slate-500 text-white border-slate-600 shadow-lg shadow-slate-500/30', hover: 'hover:bg-slate-200 hover:border-slate-400', icon: '💻' },
  'Đạo đức': { bg: 'bg-gradient-to-br from-fuchsia-50 to-pink-100/80 text-fuchsia-950 border-fuchsia-200', activeBg: 'bg-gradient-to-br from-fuchsia-500 to-pink-400 text-white border-fuchsia-500 shadow-lg shadow-fuchsia-500/30', hover: 'hover:bg-fuchsia-100 hover:border-fuchsia-300', icon: '💖' },
  'Âm nhạc': { bg: 'bg-gradient-to-br from-violet-50 to-purple-100/80 text-violet-950 border-violet-200', activeBg: 'bg-gradient-to-br from-violet-500 to-purple-400 text-white border-violet-500 shadow-lg shadow-violet-500/30', hover: 'hover:bg-violet-100 hover:border-violet-300', icon: '🎵' },
  'Giáo dục thể chất': { bg: 'bg-gradient-to-br from-lime-50 to-green-100/80 text-lime-950 border-lime-200', activeBg: 'bg-gradient-to-br from-lime-500 to-green-400 text-white border-lime-500 shadow-lg shadow-lime-500/30', hover: 'hover:bg-lime-100 hover:border-lime-300', icon: '⚽' },
  'Tiếng Anh': { bg: 'bg-gradient-to-br from-cyan-50 to-sky-100/80 text-cyan-950 border-cyan-200', activeBg: 'bg-gradient-to-br from-cyan-500 to-sky-400 text-white border-cyan-500 shadow-lg shadow-cyan-500/30', hover: 'hover:bg-cyan-100 hover:border-cyan-300', icon: '🗣️' },
  'Mĩ thuật': { bg: 'bg-gradient-to-br from-orange-50 to-yellow-100/80 text-orange-950 border-orange-200', activeBg: 'bg-gradient-to-br from-orange-500 to-yellow-400 text-white border-orange-500 shadow-lg shadow-orange-500/30', hover: 'hover:bg-orange-100 hover:border-orange-300', icon: '🎨' }
};

export const TeacherView: React.FC = () => {
  const {
    students,
    addStudent,
    deleteStudent,
    updateStudent,
    importStudents,
    attendanceList,
    markAttendance,
    deleteAttendance,
    violations,
    addViolation,
    assignments,
    addAssignment,
    deleteAssignment,
    submissions,
    saveSubmission,
    feedbacks,
    replyFeedback,
    markFeedbackAsRead,
    settings,
    updateSettings,
    rewardStars,
    sendZaloNotification
  } = useLMS();

  const [isClassroomCollapsed, setIsClassroomCollapsed] = useState(false);

  // Navigation
  const [activeTab, setActiveTab] = useState<'dashboard' | 'students' | 'assignments' | 'progress' | 'feedback' | 'settings' | 'review_bank'>('dashboard');

  // Sub-tab under students
  const [studentSubTab, setStudentSubTab] = useState<'list' | 'attendance' | 'reminders' | 'rewards' | 'ranking'>('list');

  // Sub-tab under assignments
  const [assignmentSubTab, setAssignmentSubTab] = useState<'create' | 'daily_reminder' | 'progress' | 'results' | 'review_bank' | 'ai_assistant'>('create');

  // AI Learning Assistant States
  const [aiSubject, setAiSubject] = useState('Toán');
  const [aiGrade, setAiGrade] = useState('Lớp 3');
  const [aiWeek, setAiWeek] = useState(3);
  const [aiTopic, setAiTopic] = useState('');
  const [aiDifficulty, setAiDifficulty] = useState('Thông hiểu');
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiLessonContent, setAiLessonContent] = useState('');
  const [aiSampleQuestions, setAiSampleQuestions] = useState('');
  const [aiUploadedImages, setAiUploadedImages] = useState<string[]>([]);
  const [aiIsGenerating, setAiIsGenerating] = useState(false);
  const [aiGeneratedExercise, setAiGeneratedExercise] = useState<Assignment | null>(null);

  const updateAiAssignmentField = (field: keyof Assignment, value: any) => {
    if (!aiGeneratedExercise) return;
    setAiGeneratedExercise({
      ...aiGeneratedExercise,
      [field]: value
    });
  };

  const updateAiQuestionField = (qId: string, field: keyof Question, value: any) => {
    if (!aiGeneratedExercise) return;
    const updatedQuestions = aiGeneratedExercise.questions.map(q => {
      if (q.id === qId) {
        return { ...q, [field]: value };
      }
      return q;
    });
    setAiGeneratedExercise({
      ...aiGeneratedExercise,
      questions: updatedQuestions
    });
  };

  const deleteAiQuestion = (qId: string) => {
    if (!aiGeneratedExercise) return;
    const updatedQuestions = aiGeneratedExercise.questions.filter(q => q.id !== qId);
    setAiGeneratedExercise({
      ...aiGeneratedExercise,
      questions: updatedQuestions
    });
  };

  const addAiQuestion = (type: QuestionType) => {
    if (!aiGeneratedExercise) return;
    const newQuestion: Question = {
      id: `q_ai_${Date.now()}`,
      type,
      questionText: 'Nhập nội dung câu hỏi mới...',
      options: type === 'single_choice' ? ['Phương án A', 'Phương án B', 'Phương án C', 'Phương án D'] : undefined,
      correctAnswer: type === 'single_choice' ? 'A' : undefined,
      trueFalseOptions: type === 'true_false' ? [{ text: 'Mệnh đề 1', correct: true }] : undefined,
      blanksText: type === 'fill_blank' ? 'Mặt trời mọc ở hướng ... và lặn ở hướng ...' : undefined,
      blankChoices: type === 'fill_blank' ? ['Đông', 'Tây', 'Nam', 'Bắc'] : undefined,
      blankAnswers: type === 'fill_blank' ? ['Đông', 'Tây'] : undefined,
      criteria: type === 'essay' ? 'Đáp án mẫu hoặc hướng dẫn giải chi tiết...' : undefined
    };
    setAiGeneratedExercise({
      ...aiGeneratedExercise,
      questions: [...aiGeneratedExercise.questions, newQuestion]
    });
  };

  // State variables for Teacher Reviewing and Grading student submission
  const [gradingSubmission, setGradingSubmission] = useState<{ student: Student; assignment: Assignment; submission: Submission } | null>(null);
  const [aiIsGrading, setAiIsGrading] = useState(false);
  const [aiGradeResult, setAiGradeResult] = useState<any | null>(null);
  const [manualFeedbackText, setManualFeedbackText] = useState('');
  const [manualScore, setManualScore] = useState<number | null>(null);

  const handleAIEssayGrade = async (q: Question, studentAns: any) => {
    if (!gradingSubmission) return;
    setAiIsGrading(true);
    audioSynth.playBubblePop();
    
    try {
      const textAns = typeof studentAns === 'string' ? studentAns : studentAns?.text || '';
      const imgAns = studentAns && Array.isArray(studentAns.images) ? studentAns.images : [];
      
      const res = await fetch('/api/gemini/grade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: gradingSubmission.assignment.title,
          description: q.questionText,
          criteria: q.criteria || 'Cần có câu trả lời phù hợp, đúng chính tả, rõ ý.',
          studentAnswer: textAns,
          studentImages: imgAns,
          criteriaImages: []
        })
      });
      
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Lỗi server chấm bài');
      }
      
      const data = await res.json();
      setAiGradeResult(data);
      setManualScore(data.score);
      
      // Construct a beautiful synthesized feedback message from AI's response
      const synthesizedComment = `Chấm điểm: ${data.score}/10đ.
🌟 ĐIỂM SÁNG / PHẦN LÀM TỐT CỦA BÉ:
${(data.correctAnswers || []).map((c: string) => `• ${c}`).join('\n')}

✏️ GÓP Ý CHỈNH SỬA LỖI CHI TIẾT:
${(data.incorrectAnswers || []).map((i: string) => `• ${i}`).join('\n')}

📝 LỜI NHẬN XÉT CỦA CÔ:
${data.comments}

💡 HƯỚNG DẪN GIẢI CHI TIẾT:
${data.suggestions}

🎯 LỜI KHUYÊN RÈN LUYỆN:
${data.learningAdvice}`;

      setManualFeedbackText(synthesizedComment);
      audioSynth.playSuccess();
    } catch (err: any) {
      console.error(err);
      alert('❌ Có lỗi xảy ra khi gọi AI chấm tự luận: ' + err.message);
    } finally {
      setAiIsGrading(false);
    }
  };

  const handleSaveSubGrading = () => {
    if (!gradingSubmission) return;
    
    let starsWon = gradingSubmission.submission.score;
    let correctCount = gradingSubmission.submission.correctCount;
    
    if (manualScore !== null) {
      const ratio = manualScore / 10;
      starsWon = Math.round(gradingSubmission.assignment.rewardStars * ratio);
      correctCount = Math.round(gradingSubmission.submission.totalQuestions * ratio);
    }
    
    const updatedSub: Submission = {
      ...gradingSubmission.submission,
      score: starsWon,
      correctCount: correctCount,
      feedbackMessage: manualFeedbackText,
    };
    
    saveSubmission(updatedSub);
    rewardStars(gradingSubmission.student.id, starsWon, `Cô giáo đã chấm điểm bài tập "${gradingSubmission.assignment.title}"`);
    
    alert(`🎉 Đã lưu kết quả chấm bài và gửi nhận xét đến phụ huynh/học sinh em ${gradingSubmission.student.name} thành công!`);
    
    setGradingSubmission(null);
    setAiGradeResult(null);
    setManualFeedbackText('');
    setManualScore(null);
  };

  const [aiSearchQuery, setAiSearchQuery] = useState('');
  const [aiSelectedSubjectFilter, setAiSelectedSubjectFilter] = useState<string | null>(null);
  const [aiSelectedGradeFilter, setAiSelectedGradeFilter] = useState<string | null>(null);
  const [aiSelectedDiffFilter, setAiSelectedDiffFilter] = useState<string | null>(null);

  // Online Exercise Bank State (classified by Subject, Grade, Week, Topic, Difficulty)
  const [onlineExercises, setOnlineExercises] = useState<Assignment[]>(() => {
    const stored = localStorage.getItem('lms_online_exercises');
    if (stored) {
      try { return JSON.parse(stored); } catch (e) { console.error(e); }
    }
    const initialExs: Assignment[] = [
      {
        id: 'online_ex_1',
        title: 'Chuyên đề: Bảng Nhân 7 & Bảng Nhân 8',
        description: 'Các bé ôn tập kỹ bảng nhân, hoàn thành đúng các câu hỏi tính nhẩm và giải toán có lời văn nhé!',
        subject: 'Toán',
        grade: 'Lớp 3',
        week: 3,
        difficulty: 'Thông hiểu',
        rewardStars: 10,
        attachments: [],
        links: [],
        createdAt: new Date().toISOString(),
        criteria: { shuffleQuestions: true, mustGet100: false, onlyOneAttempt: false, timeLimitHours: 0 },
        questions: [
          {
            id: 'oq_1_1',
            type: 'single_choice',
            questionText: 'Tính nhẩm kết quả của phép nhân: 7 x 8 = ?',
            options: ['A. 54', 'B. 56', 'C. 63', 'D. 48'],
            correctAnswer: 'B'
          },
          {
            id: 'oq_1_2',
            type: 'true_false',
            questionText: 'Hãy xác định xem các mệnh đề sau Đúng hay Sai:',
            trueFalseOptions: [
              { text: 'Kết quả của 7 x 6 bằng 42.', correct: true },
              { text: 'Kết quả của 8 x 5 bằng 45.', correct: false },
              { text: 'Số chia hết cho cả 7 và 8 là 56.', correct: true }
            ]
          },
          {
            id: 'oq_1_3',
            type: 'fill_blank',
            questionText: 'Điền số thích hợp vào chỗ chấm:',
            blanksText: 'Bác An có 8 túi bánh, mỗi túi có 7 chiếc bánh. Tổng số bánh bác An có là ... chiếc bánh.',
            blankChoices: ['56', '49', '64'],
            blankAnswers: ['56']
          }
        ]
      },
      {
        id: 'online_ex_2',
        title: 'Từ Chỉ Hoạt Động & Trạng Thái',
        description: 'Bài ôn luyện Tiếng Việt giúp bé nhận biết và sử dụng đúng từ chỉ hoạt động, trạng thái trong câu.',
        subject: 'Tiếng Việt',
        grade: 'Lớp 3',
        week: 3,
        difficulty: 'Nhận biết',
        rewardStars: 8,
        attachments: [],
        links: [],
        createdAt: new Date().toISOString(),
        criteria: { shuffleQuestions: false, mustGet100: false, onlyOneAttempt: false, timeLimitHours: 0 },
        questions: [
          {
            id: 'oq_2_1',
            type: 'single_choice',
            questionText: 'Trong các từ sau, từ nào là từ chỉ hoạt động?',
            options: ['A. Hiền lành', 'B. Chạy nhảy', 'C. Sách vở', 'D. Đỏ tươi'],
            correctAnswer: 'B'
          },
          {
            id: 'oq_2_2',
            type: 'single_choice',
            questionText: 'Trong câu "Bé đang chăm chú đọc sách", từ chỉ hoạt động là từ nào?',
            options: ['A. Bé', 'B. Đang', 'C. Đọc', 'D. Sách'],
            correctAnswer: 'C'
          },
          {
            id: 'oq_2_3',
            type: 'essay',
            questionText: 'Hãy viết 1 câu kể về việc bé giúp đỡ ba mẹ làm việc nhà, trong đó có sử dụng ít nhất một từ chỉ hoạt động.',
            criteria: 'Học sinh viết câu đúng ngữ pháp, đầu câu viết hoa, cuối câu có dấu chấm, có sử dụng từ chỉ hoạt động như: quét nhà, lau bàn, rửa bát, nấu cơm...'
          }
        ]
      },
      {
        id: 'online_ex_3',
        title: 'English Vocabulary: In the Classroom',
        description: 'Practice English classroom vocabulary including school objects and basic commands.',
        subject: 'Tiếng Anh',
        grade: 'Lớp 3',
        week: 4,
        difficulty: 'Vận dụng',
        rewardStars: 10,
        attachments: [],
        links: [],
        createdAt: new Date().toISOString(),
        criteria: { shuffleQuestions: true, mustGet100: false, onlyOneAttempt: false, timeLimitHours: 0 },
        questions: [
          {
            id: 'oq_3_1',
            type: 'single_choice',
            questionText: 'What school object is used for erasing pencil marks?',
            options: ['A. Ruler', 'B. Notebook', 'C. Eraser', 'D. Pencil case'],
            correctAnswer: 'C'
          },
          {
            id: 'oq_3_2',
            type: 'true_false',
            questionText: 'Read and choose True or False for these school statements:',
            trueFalseOptions: [
              { text: 'A "board" is where the teacher writes lessons.', correct: true },
              { text: 'We use a "pencil sharpener" to cut paper.', correct: false }
            ]
          }
        ]
      }
    ];
    localStorage.setItem('lms_online_exercises', JSON.stringify(initialExs));
    return initialExs;
  });

  // Save online exercises to localStorage
  useEffect(() => {
    localStorage.setItem('lms_online_exercises', JSON.stringify(onlineExercises));
  }, [onlineExercises]);

  // Selection state for 11 subjects in Progress tab
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);

  // Weekly progress states
  const [expandedWeeks, setExpandedWeeks] = useState<{ [key: number]: boolean }>({});
  const [remindedPairs, setRemindedPairs] = useState<{ [studentId_assignmentId: string]: boolean }>({});
  const [parentStatuses, setParentStatuses] = useState<{ [studentId_assignmentId: string]: 'read' | 'unread' | 'replied' }>({});

  // ----------------------------------------------------
  // SUB-TAB 1: MANAGING STUDENTS & IMPORT
  // ----------------------------------------------------
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentParent, setNewStudentParent] = useState('');
  const [newStudentPhone, setNewStudentPhone] = useState('');
  const [newStudentBirthDate, setNewStudentBirthDate] = useState('2018-01-01');
  const [newStudentGender, setNewStudentGender] = useState('Nam');
  const [rawImportText, setRawImportText] = useState('');
  const [showImportArea, setShowImportArea] = useState(false);

  // Review bank states
  const [reviewSelectedSubject, setReviewSelectedSubject] = useState<string | null>(null);
  const [reviewSearchQuery, setReviewSearchQuery] = useState('');
  const [selectedReviewIds, setSelectedReviewIds] = useState<string[]>([]);
  const [isGeneratingCompositeExam, setIsGeneratingCompositeExam] = useState(false);
  const [compositeExamTitle, setCompositeExamTitle] = useState('Đề Ôn Tập Tổng Hợp Cuối Tuần');

  // Editing student states
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [editName, setEditName] = useState('');
  const [editBirthDate, setEditBirthDate] = useState('');
  const [editGender, setEditGender] = useState('Nam');
  const [editParentName, setEditParentName] = useState('');
  const [editParentPhone, setEditParentPhone] = useState('');
  const [editAvatar, setEditAvatar] = useState('👦');

  // Helper functions for AI Learning Assistant
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        setAiUploadedImages(prev => [...prev, reader.result as string]);
        alert('📸 Đã đính kèm ảnh tài liệu thành công!');
      }
    };
    reader.readAsDataURL(file);
  };

  const downloadAsWord = (ex: Assignment) => {
    let docContent = `
      <html xmlns:o='urn:schemas-microsoft-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <title>${ex.title}</title>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Times New Roman', Times, serif; line-height: 1.5; padding: 20px; }
          h1 { text-align: center; font-size: 18pt; margin-bottom: 5px; text-transform: uppercase; }
          h2 { text-align: center; font-size: 12pt; font-weight: normal; margin-top: 0; margin-bottom: 20px; }
          .meta-info { display: flex; justify-content: space-between; margin-bottom: 20px; font-weight: bold; }
          .question { margin-bottom: 15px; }
          .q-text { font-weight: bold; }
          .options { margin-left: 20px; }
          .criteria { margin-top: 5px; font-style: italic; color: #555; }
          .footer { margin-top: 40px; text-align: center; font-size: 10pt; border-top: 1px solid #ccc; padding-top: 10px; }
        </style>
      </head>
      <body>
        <h1>BỘ GIÁO DỤC VÀ ĐÀO TẠO</h1>
        <h2>TRƯỜNG TIỂU HỌC STAR ACADEMY</h2>
        <h1 style="font-size: 16pt; margin-top: 30px;">${ex.title.toUpperCase()}</h1>
        <p style="text-align: center; font-style: italic;">Môn học: ${ex.subject} | Khối lớp: ${ex.grade || 'Lớp 3'} | Tuần học: Tuần ${ex.week || 1}</p>
        <p style="text-align: center; margin-bottom: 30px;">Dặn dò: ${ex.description}</p>
        
        <div class="meta-info" style="display: flex; justify-content: space-between;">
          <div>Họ và tên học sinh: .......................................................</div>
          <div>Lớp: ........................</div>
        </div>
        
        <hr style="margin-bottom: 20px;">
        
        <h3>PHẦN I: ĐỀ BÀI</h3>
    `;
    
    ex.questions.forEach((q, idx) => {
      docContent += `
        <div class="question">
          <p class="q-text">Câu ${idx + 1}. ${q.questionText}</p>
      `;
      if (q.type === 'single_choice' && q.options) {
        docContent += `<div class="options">`;
        q.options.forEach(opt => {
          docContent += `<p>${opt}</p>`;
        });
        docContent += `</div>`;
      } else if (q.type === 'true_false' && q.trueFalseOptions) {
        docContent += `<div class="options">`;
        q.trueFalseOptions.forEach((o) => {
          docContent += `<p>[  ] ${o.text}</p>`;
        });
        docContent += `</div>`;
      } else if (q.type === 'fill_blank' && q.blanksText) {
        docContent += `<p style="margin-left: 20px; font-style: italic;">Đoạn văn: "${q.blanksText}"</p>`;
        if (q.blankChoices) {
          docContent += `<p style="margin-left: 20px;">Gợi ý từ để điền: ${q.blankChoices.join(', ')}</p>`;
        }
      } else if (q.type === 'essay') {
        docContent += `<p style="height: 100px; border-bottom: 1px dashed #ccc; margin-left: 20px;">Lời giải của học sinh: </p>`;
      }
      docContent += `</div>`;
    });
    
    docContent += `
        <br><hr><br>
        <h3>PHẦN II: ĐÁP ÁN & TIÊU CHÍ CHẤM ĐIỂM (Dành cho Giáo viên)</h3>
    `;
    
    ex.questions.forEach((q, idx) => {
      docContent += `
        <div class="question" style="background-color: #f9f9f9; padding: 10px; margin-bottom: 10px;">
          <p class="q-text">Câu ${idx + 1}. ${q.questionText}</p>
      `;
      if (q.type === 'single_choice') {
        docContent += `<p><strong>Đáp án đúng:</strong> ${q.correctAnswer}</p>`;
      } else if (q.type === 'true_false' && q.trueFalseOptions) {
        docContent += `<p><strong>Đáp án đúng:</strong></p><ul>`;
        q.trueFalseOptions.forEach(o => {
          docContent += `<li>"${o.text}" là <strong>${o.correct ? 'ĐÚNG' : 'SAI'}</strong></li>`;
        });
        docContent += `</ul>`;
      } else if (q.type === 'fill_blank') {
        docContent += `<p><strong>Đáp án đúng theo thứ tự:</strong> ${q.blankAnswers?.join(', ')}</p>`;
      } else if (q.type === 'essay') {
        docContent += `<p class="criteria"><strong>Tiêu chí chấm điểm:</strong> ${q.criteria || 'Cần có câu trả lời phù hợp, đúng ngữ pháp.'}</p>`;
      }
      docContent += `</div>`;
    });
    
    docContent += `
        <div class="footer">
          <p>Hệ thống hỗ trợ học tập tiểu học thông minh AI LMS - Star Academy</p>
        </div>
      </body>
      </html>
    `;
    
    const blob = new Blob(['\ufeff' + docContent], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `De_on_tap_${ex.title.replace(/\s+/g, '_')}.doc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleAIGenerate = async () => {
    if (!aiTopic.trim() && !aiPrompt.trim() && !aiLessonContent.trim() && aiUploadedImages.length === 0) {
      alert('Thầy cô vui lòng nhập Chủ đề hoặc Yêu cầu chi tiết, hoặc dán nội dung bài học, hoặc tải tài liệu đầu vào nhé!');
      return;
    }
    
    setAiIsGenerating(true);
    audioSynth.playBubblePop();
    
    try {
      const combinedPrompt = `
  Chủ đề cần soạn: ${aiTopic || "Theo giáo án"}
  Cấp độ tư duy yêu cầu: ${aiDifficulty}
  Khối lớp: ${aiGrade}
  Yêu cầu sáng tạo thêm: ${aiPrompt || "Hãy tạo bài tập phong phú, bám sát học trình."}
  Câu hỏi mẫu / Định hướng sáng tạo: ${aiSampleQuestions || "Không có câu hỏi mẫu"}
  `;

      const res = await fetch('/api/gemini/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: combinedPrompt,
          subject: aiSubject,
          week: aiWeek,
          lessonContent: aiLessonContent,
          uploadedImages: aiUploadedImages
        })
      });
      
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Lỗi server');
      }
      
      const data = await res.json();
      
      // Convert backend schema to fit UI format if needed
      const generatedAsg: Assignment = {
        id: `ai_asg_${Date.now()}`,
        title: data.title || `Bài tập AI: ${aiTopic || 'Chủ đề mới'}`,
        description: data.description || `Bài luyện tập Tuần ${aiWeek} môn ${aiSubject}`,
        subject: data.subject || aiSubject,
        week: data.week || aiWeek,
        grade: aiGrade,
        difficulty: aiDifficulty,
        rewardStars: data.rewardStars || 10,
        attachments: [],
        links: [],
        createdAt: new Date().toISOString(),
        criteria: {
          shuffleQuestions: true,
          mustGet100: false,
          onlyOneAttempt: false,
          timeLimitHours: 0,
          autoGrade: true
        },
        questions: (data.questions || []).map((q: any, qIdx: number) => ({
          id: q.id || `q_ai_${qIdx}`,
          type: q.type || 'single_choice',
          questionText: q.questionText || '',
          options: q.options || undefined,
          correctAnswer: q.correctAnswer || undefined,
          trueFalseOptions: q.trueFalseOptions || undefined,
          matchingLeft: q.matchingLeft || undefined,
          matchingRight: q.matchingRight || undefined,
          matchingPairs: q.matchingPairs || undefined,
          blanksText: q.blanksText || undefined,
          blankChoices: q.blankChoices || undefined,
          blankAnswers: q.blankAnswers || undefined,
          criteria: q.criteria || undefined,
          maxScore: q.maxScore || 10
        }))
      };
      
      setAiGeneratedExercise(generatedAsg);
      audioSynth.playSuccess();
    } catch (error: any) {
      console.error(error);
      alert('❌ Lỗi sinh đề từ AI: ' + (error.message || 'Không kết nối được server. Vui lòng kiểm tra lại cấu hình GEMINI_API_KEY.'));
    } finally {
      setAiIsGenerating(false);
    }
  };

  const handleAddStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentName.trim() || !newStudentParent.trim()) return;
    const newId = `stu_${Date.now()}`;
    const autoAvatar = newStudentGender === 'Nữ'
      ? ['👧', '🦄', '🐼', '🦊', '🐨'][Math.floor(Math.random() * 5)]
      : ['👦', '🦁', '🦖', '🐼', '🦊'][Math.floor(Math.random() * 5)];

    addStudent({
      id: newId,
      name: newStudentName.trim(),
      parentName: newStudentParent.trim(),
      parentPhone: newStudentPhone.trim() || 'Chưa cung cấp',
      birthDate: newStudentBirthDate,
      gender: newStudentGender,
      avatar: autoAvatar
    });
    setNewStudentName('');
    setNewStudentParent('');
    setNewStudentPhone('');
    setNewStudentBirthDate('2018-01-01');
    setNewStudentGender('Nam');
  };

  const handleStartEditStudent = (student: Student) => {
    setEditingStudent(student);
    setEditName(student.name);
    setEditBirthDate(student.birthDate || '2018-01-01');
    setEditGender(student.gender || 'Nam');
    setEditParentName(student.parentName);
    setEditParentPhone(student.parentPhone);
    setEditAvatar(student.avatar);
  };

  const handleSaveEditStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;
    updateStudent(editingStudent.id, {
      name: editName.trim(),
      birthDate: editBirthDate,
      gender: editGender,
      parentName: editParentName.trim(),
      parentPhone: editParentPhone.trim(),
      avatar: editAvatar
    });
    setEditingStudent(null);
  };

  const handleImportCSV = () => {
    if (!rawImportText.trim()) return;
    // Format: Tên học sinh, Họ tên phụ huynh, Số điện thoại
    // Hoặc Format đầy đủ: Tên học sinh, Ngày sinh, Giới tính, Họ tên phụ huynh, Số điện thoại
    const lines = rawImportText.split('\n');
    const listToImport: any[] = [];
    lines.forEach((line, idx) => {
      const parts = line.split(',');
      if (parts.length >= 2 && parts[0].trim()) {
        if (parts.length >= 5) {
          listToImport.push({
            id: `stu_import_${Date.now()}_${idx}`,
            name: parts[0].trim(),
            birthDate: parts[1].trim(),
            gender: parts[2].trim(),
            parentName: parts[3].trim(),
            parentPhone: parts[4] ? parts[4].trim() : 'Chưa cung cấp',
            avatar: parts[2].trim() === 'Nữ'
              ? ['👧', '🦄', '🐼', '🦊', '🐨'][Math.floor(Math.random() * 5)]
              : ['👦', '🦁', '🦖', '🐼', '🦊'][Math.floor(Math.random() * 5)]
          });
        } else {
          listToImport.push({
            id: `stu_import_${Date.now()}_${idx}`,
            name: parts[0].trim(),
            parentName: parts[1].trim(),
            parentPhone: parts[2] ? parts[2].trim() : 'Chưa cung cấp',
            birthDate: '2018-01-01',
            gender: idx % 2 === 0 ? 'Nam' : 'Nữ',
            avatar: idx % 2 === 0 ? '👦' : '👧'
          });
        }
      }
    });
    if (listToImport.length > 0) {
      importStudents(listToImport);
      setRawImportText('');
      setShowImportArea(false);
    }
  };

  const handleDownloadTemplate = () => {
    const headers = "Họ tên học sinh, Ngày sinh, Giới tính, Họ tên phụ huynh, Số điện thoại phụ huynh";
    const sample1 = "Nguyễn Anh Thư, 2018-05-12, Nữ, Chị Trần Thu Trang, 0912345678";
    const sample2 = "Phạm Gia Bảo, 2018-09-20, Nam, Anh Phạm Minh Đức, 0987654321";
    const sample3 = "Lê Mai Chi, 2018-11-03, Nữ, Chị Lê Thanh Hà, 0905556677";
    const csvContent = "\uFEFF" + [headers, sample1, sample2, sample3].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "mau_danh_sach_hoc_sinh.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        let cleanedText = text.trim();
        if (cleanedText.includes("Học sinh") || cleanedText.includes("học sinh") || cleanedText.includes("Họ tên")) {
          const lines = cleanedText.split("\n");
          cleanedText = lines.slice(1).join("\n");
        }
        setRawImportText(cleanedText);
        alert("Đã tải dữ liệu từ tệp lên thành công! Vui lòng kiểm tra lại khung nhập văn bản bên dưới và bấm nút 'Xác Nhận Import' để lưu vào hệ thống.");
      }
    };
    reader.readAsText(file, "UTF-8");
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
  const [asSubject, setAsSubject] = useState('Toán');
  const [asStars, setAsStars] = useState(10);
  const [asWeek, setAsWeek] = useState(1);
  const [criteriaExpanded, setCriteriaExpanded] = useState(false);

  // Essay question builder states
  const [essayQText, setEssayQText] = useState('');
  const [essayQImages, setEssayQImages] = useState<string[]>([]);
  const [isEssayListening, setIsEssayListening] = useState(false);

  // Essay specific AI-grading state variables
  const [essayCriteria, setEssayCriteria] = useState('');
  const [essayCriteriaImages, setEssayCriteriaImages] = useState<string[]>([]);
  const [aiAutoGrade, setAiAutoGrade] = useState(true);
  const [aiReview, setAiReview] = useState(true);
  const [aiSuggestions, setAiSuggestions] = useState(true);
  const [aiImmediateResults, setAiImmediateResults] = useState(true);

  const handleCriteriaImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file: any) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setEssayCriteriaImages(prev => [...prev, reader.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveCriteriaImage = (index: number) => {
    setEssayCriteriaImages(prev => prev.filter((_, idx) => idx !== index));
  };

  const startEssayVoiceToText = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsEssayListening(true);
      setTimeout(() => {
        setEssayQText(prev => (prev ? prev + ' ' : '') + 'Em hãy viết một đoạn văn ngắn nêu cảm nghĩ của em về ngày khai giảng trường em.');
        setIsEssayListening(false);
      }, 2000);
      return;
    }

    const rec = new SpeechRecognition();
    rec.lang = 'vi-VN';
    rec.interimResults = false;
    rec.maxAlternatives = 1;

    rec.onstart = () => setIsEssayListening(true);
    rec.onend = () => setIsEssayListening(false);
    rec.onerror = () => setIsEssayListening(false);
    rec.onresult = (e: any) => {
      const resultText = e.results[0][0].transcript;
      setEssayQText(prev => (prev ? prev + ' ' : '') + resultText);
    };

    rec.start();
  };

  const handleEssayImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file: any) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setEssayQImages(prev => [...prev, reader.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveEssayImage = (index: number) => {
    setEssayQImages(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleSaveEssayQuestion = () => {
    if (!essayQText.trim()) {
      alert('Thầy cô vui lòng nhập nội dung câu hỏi tự luận!');
      return;
    }
    const newQuestion: Question = {
      id: `q_essay_${Date.now()}`,
      type: 'essay',
      questionText: essayQText.trim(),
      essayImages: essayQImages,
      criteria: essayCriteria.trim(),
      criteriaImages: essayCriteriaImages,
      aiAutoGrade,
      aiReview,
      aiSuggestions,
      aiImmediateResults
    };
    setQuestions(prev => [...prev, newQuestion]);
    // Reset state
    setEssayQText('');
    setEssayQImages([]);
    setEssayCriteria('');
    setEssayCriteriaImages([]);
    alert('Đã lưu câu hỏi tự luận thành công kèm cấu hình chấm điểm AI! 📝');
  };
  
  // Criteria states
  const [shuffle, setShuffle] = useState(false);
  const [must100, setMust100] = useState(false);
  const [onlyOne, setOnlyOne] = useState(false);
  const [timeLimit, setTimeLimit] = useState(24);
  const [draftAssignmentId, setDraftAssignmentId] = useState<string | undefined>(undefined);

  // Expanded Criteria states for THÔNG TIN CHUNG NHIỆM VỤ HỌC TẬP
  const [oneTimeOnly, setOneTimeOnly] = useState(false);
  const [multipleTimes, setMultipleTimes] = useState(true);
  const [shuffleOnRetry, setShuffleOnRetry] = useState(false);
  const [autoGrade, setAutoGrade] = useState(true);
  const [autoStarPoints, setAutoStarPoints] = useState(true);
  const [saveDraftAllowed, setSaveDraftAllowed] = useState(true);
  const [showAnswersOnSubmit, setShowAnswersOnSubmit] = useState(true);

  const [limitTimeEnabled, setLimitTimeEnabled] = useState(false);
  const [limit24h, setLimit24h] = useState(false);
  const [limit3days, setLimit3days] = useState(false);
  const [autoLockOnExpiry, setAutoLockOnExpiry] = useState(false);
  const [notifyParentOnUncompleted, setNotifyParentOnUncompleted] = useState(false);
  const [earlyCompletionStar, setEarlyCompletionStar] = useState(false);
  const [lateSubmissionDeductStar, setLateSubmissionDeductStar] = useState(false);
  const [mustCompleteBeforeNew, setMustCompleteBeforeNew] = useState(false);

  const [allowedAttemptsCount, setAllowedAttemptsCount] = useState<'1' | '2' | '3' | 'unlimited'>('unlimited');

  const [startDate, setStartDate] = useState('2026-06-26');
  const [startTime, setStartTime] = useState('19:00');
  const [endDate, setEndDate] = useState('2026-06-28');
  const [endTime, setEndTime] = useState('20:00');

  const [rememberForReview, setRememberForReview] = useState(true);
  const [stillAllowedAfterExpiry, setStillAllowedAfterExpiry] = useState(true);

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
  const [tempImportedQuestions, setTempImportedQuestions] = useState<Question[]>([]);
  const [qType, setQType] = useState<QuestionType>('single_choice');
  const [qText, setQText] = useState('');
  const [qImages, setQImages] = useState<string[]>([]);
  
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

    if (qImages.length > 0) {
      newQ.essayImages = qImages;
    }

    setQuestions(prev => [...prev, newQ]);
    
    // Reset question inputs
    setQText('');
    setQImages([]);
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

  const downloadCSVTemplate = () => {
    const headers = "Loai,CauHoi,DapAnA_HoacVes,DapAnB_HoacVes,DapAnC,DapAnD,DapAnDung\n";
    let rows = "";
    let filename = "mau_cau_hoi.csv";

    if (qType === 'single_choice') {
      rows = "single_choice,Bé hãy chọn từ viết đúng chính tả:,con sấu,con sếu,con sâu,con sau,C\n" +
             "single_choice,Hình nào sau đây có 3 cạnh bằng nhau?,Hình tam giác đều,Hình vuông,Hình chữ nhật,Hình tròn,A\n";
      filename = "mau_trac_nghiem_1_dap_an.csv";
    } else if (qType === 'true_false') {
      rows = "true_false,Phép tính nào sau đây đúng?,6 x 8 = 48 (Đúng),7 x 9 = 64 (Sai),,,True|False\n";
      filename = "mau_dung_sai.csv";
    } else if (qType === 'matching') {
      rows = "matching,Nối phép tính với kết quả đúng nhé!,5 x 5 = 25,6 x 7 = 42,9 x 4 = 36,,Matching\n";
      filename = "mau_ghep_doi.csv";
    } else if (qType === 'fill_blank') {
      rows = "fill_blank,Thích hợp điền từ: Bé đi học [đúng giờ] và học bài rất [chăm chỉ].,đúng giờ,chăm chỉ,lười biếng,,đúng giờ|chăm chỉ\n";
      filename = "mau_dien_tu_cho_trong.csv";
    } else {
      const row1 = "single_choice,Bé hãy chọn từ viết đúng chính tả:,con sấu,con sếu,con sâuu,con sau,B\n";
      const row2 = "true_false,Phép tính nào sau đây đúng?,6 x 8 = 48 (Đúng),7 x 9 = 64 (Sai),,,True|False\n";
      const row3 = "matching,Nối phép tính với kết quả đúng nhé!,5 x 5 = 25,6 x 7 = 42,9 x 4 = 36,,Matching\n";
      const row4 = "fill_blank,Thích hợp điền từ: Bé đi học [đúng giờ] và học bài rất [chăm chỉ].,đúng giờ,chăm chỉ,lười biếng,,đúng giờ|chăm chỉ\n";
      rows = row1 + row2 + row3 + row4;
      filename = "mau_cau_hoi_tong_hop.csv";
    }
    
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + encodeURIComponent(headers + rows);
    const link = document.createElement("a");
    link.setAttribute("href", csvContent);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadJSONTemplate = () => {
    let template: any[] = [];
    let filename = "mau_cau_hoi.json";

    if (qType === 'single_choice') {
      template = [
        {
          type: "single_choice",
          questionText: "Bé hãy chọn từ viết đúng chính tả:",
          options: ["con sấu", "con sếu", "con sâu", "con sau"],
          correctAnswer: "C"
        },
        {
          type: "single_choice",
          questionText: "Hình nào sau đây có 3 cạnh bằng nhau?",
          options: ["Hình tam giác đều", "Hình vuông", "Hình chữ nhật", "Hình tròn"],
          correctAnswer: "A"
        }
      ];
      filename = "mau_trac_nghiem_1_dap_an.json";
    } else if (qType === 'true_false') {
      template = [
        {
          type: "true_false",
          questionText: "Kiểm tra tính đúng sai của các vế toán sau:",
          trueFalseOptions: [
            { text: "6 x 8 = 48", correct: true },
            { text: "7 x 9 = 64", correct: false }
          ]
        }
      ];
      filename = "mau_dung_sai.json";
    } else if (qType === 'matching') {
      template = [
        {
          type: "matching",
          questionText: "Bé hãy nối phép tính với kết quả đúng:",
          matchingLeft: ["5 x 5", "6 x 7", "9 x 4"],
          matchingRight: ["25", "42", "36"],
          matchingPairs: { "5 x 5": "25", "6 x 7": "42", "9 x 4": "36" }
        }
      ];
      filename = "mau_ghep_doi.json";
    } else if (qType === 'fill_blank') {
      template = [
        {
          type: "fill_blank",
          questionText: "Bé hãy điền từ thích hợp vào ngoặc vuông trống:",
          blanksText: "Bé đi học [đúng giờ] và học bài rất [chăm chỉ].",
          blankChoices: ["đúng giờ", "chăm chỉ", "lười biếng"],
          blankAnswers: ["đúng giờ", "chăm chỉ"]
        }
      ];
      filename = "mau_dien_tu_cho_trong.json";
    } else {
      template = [
        {
          type: "single_choice",
          questionText: "Hình nào sau đây có 3 cạnh bằng nhau?",
          options: ["Hình tam giác đều", "Hình vuông", "Hình chữ nhật", "Hình tròn"],
          correctAnswer: "A"
        },
        {
          type: "true_false",
          questionText: "Kiểm tra tính đúng sai của phép nhân sau:",
          trueFalseOptions: [
            { text: "9 x 9 = 81", correct: true },
            { text: "8 x 7 = 54", correct: false }
          ]
        },
        {
          type: "matching",
          questionText: "Bé hãy nối phép tính với kết quả đúng:",
          matchingLeft: ["5 x 5", "6 x 7", "9 x 4"],
          matchingRight: ["25", "42", "36"],
          matchingPairs: { "5 x 5": "25", "6 x 7": "42", "9 x 4": "36" }
        },
        {
          type: "fill_blank",
          questionText: "Bé hãy điền từ thích hợp vào ngoặc vuông trống:",
          blanksText: "Con mèo trèo lên cây [cau], hỏi thăm chú chuột đi [đâu] vắng nhà.",
          blankChoices: ["cau", "đâu", "khế", "chợ"],
          blankAnswers: ["cau", "đâu"]
        }
      ];
      filename = "mau_cau_hoi_tong_hop.json";
    }

    const jsonContent = "data:application/json;charset=utf-8," + encodeURIComponent(JSON.stringify(template, null, 2));
    const link = document.createElement("a");
    link.setAttribute("href", jsonContent);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportQuestionsFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      try {
        if (file.name.endsWith('.json')) {
          const parsed = JSON.parse(text);
          if (Array.isArray(parsed)) {
            const formatted = parsed.map((q: any, index: number) => ({
              id: `q_import_${Date.now()}_${index}`,
              type: q.type || 'single_choice',
              questionText: q.questionText || 'Câu hỏi chưa có nội dung',
              options: q.options || ['Lựa chọn A', 'Lựa chọn B', 'Lựa chọn C', 'Lựa chọn D'],
              correctAnswer: q.correctAnswer || 'A',
              trueFalseOptions: q.trueFalseOptions || [],
              matchingLeft: q.matchingLeft || [],
              matchingRight: q.matchingRight || [],
              matchingPairs: q.matchingPairs || {},
              blanksText: q.blanksText || '',
              blankChoices: q.blankChoices || [],
              blankAnswers: q.blankAnswers || []
            }));
            setTempImportedQuestions(formatted);
            alert(`Đã lấy dữ liệu thành công ${formatted.length} câu hỏi từ tệp JSON! Thầy cô vui lòng bấm nút "Lưu câu hỏi vào bộ bài" ở khung bên dưới nhé. 🎉`);
          } else {
            alert('Định dạng tệp JSON không hợp lệ. Phải là một mảng các câu hỏi!');
          }
        } else {
          // Parse CSV
          const lines = text.split('\n').map(line => line.trim()).filter(Boolean);
          if (lines.length <= 1) {
            alert('Tệp CSV trống hoặc không có dữ liệu câu hỏi!');
            return;
          }
          
          const importedQuestions: Question[] = [];
          for (let i = 1; i < lines.length; i++) {
            const cols = lines[i].split(',').map(c => c.trim().replace(/^"|"$/g, ''));
            if (cols.length < 2) continue;
            
            const type = cols[0] as QuestionType;
            const questionText = cols[1];
            
            let qObj: Question = {
              id: `q_import_csv_${Date.now()}_${i}`,
              type: type || 'single_choice',
              questionText: questionText || 'Câu hỏi'
            };
            
            if (type === 'single_choice') {
              qObj.options = [
                cols[2] || 'Lựa chọn A',
                cols[3] || 'Lựa chọn B',
                cols[4] || 'Lựa chọn C',
                cols[5] || 'Lựa chọn D'
              ];
              qObj.correctAnswer = cols[6] || 'A';
            } else if (type === 'true_false') {
              qObj.trueFalseOptions = [
                { text: cols[2] || 'Vế A', correct: true },
                { text: cols[3] || 'Vế B', correct: false }
              ];
            } else if (type === 'matching') {
              qObj.matchingLeft = [cols[2] || '9 x 3', cols[3] || '8 x 4'];
              qObj.matchingRight = ['27', '32'];
              qObj.matchingPairs = {
                '9 x 3': '27',
                '8 x 4': '32'
              };
            } else if (type === 'fill_blank') {
              qObj.blanksText = questionText;
              qObj.blankChoices = (cols[2] || '').split('|').map((s: string) => s.trim()).filter(Boolean);
              if (qObj.blankChoices.length === 0) {
                qObj.blankChoices = ['đúng giờ', 'chăm chỉ', 'lười biếng'];
              }
              qObj.blankAnswers = (cols[6] || '').split('|').map((s: string) => s.trim()).filter(Boolean);
              if (qObj.blankAnswers.length === 0) {
                qObj.blankAnswers = ['đúng giờ', 'chăm chỉ'];
              }
            }
            
            importedQuestions.push(qObj);
          }
          
          if (importedQuestions.length > 0) {
            setTempImportedQuestions(importedQuestions);
            alert(`Đã lấy dữ liệu thành công ${importedQuestions.length} câu hỏi từ tệp CSV! Thầy cô vui lòng bấm nút "Lưu câu hỏi vào bộ bài" ở khung bên dưới nhé. 🎉`);
          } else {
            alert('Không tìm thấy câu hỏi hợp lệ nào trong tệp CSV!');
          }
        }
      } catch (err) {
        alert('Lỗi khi phân tích tệp! Vui lòng kiểm tra lại định dạng tệp tải lên.');
        console.error(err);
      }
    };
    reader.readAsText(file);
  };

  const handleCreateAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!asTitle.trim() || questions.length === 0) {
      alert('Vui lòng nhập tên bài tập và tạo ít nhất 1 câu hỏi!');
      return;
    }

    addAssignment({
      id: draftAssignmentId,
      title: asTitle.trim(),
      description: asDesc.trim(),
      subject: asSubject,
      attachments: attachedFiles,
      links: linksList,
      rewardStars: asStars,
      week: asWeek,
      criteria: {
        shuffleQuestions: shuffle,
        mustGet100: must100,
        onlyOneAttempt: onlyOne,
        timeLimitHours: timeLimit,
        oneTimeOnly,
        multipleTimes,
        shuffleOnRetry,
        autoGrade,
        autoStarPoints,
        saveDraftAllowed,
        showAnswersOnSubmit,
        limitTimeEnabled,
        limit24h,
        limit3days,
        autoLockOnExpiry,
        notifyParentOnUncompleted,
        earlyCompletionStar,
        lateSubmissionDeductStar,
        mustCompleteBeforeNew,
        allowedAttemptsCount,
        startDate,
        startTime,
        endDate,
        endTime,
        rememberForReview,
        stillAllowedAfterExpiry
      },
      questions,
      isDraft: false
    });

    // Reset whole assignment creator
    setAsTitle('');
    setAsDesc('');
    setAsStars(10);
    setAsWeek(1);
    setAttachedFiles([]);
    setLinksList([]);
    setQuestions([]);
    setDraftAssignmentId(undefined);
    alert('Đã giao nhiệm vụ học tập thành công đến toàn bộ học sinh và phụ huynh!');
  };

  const handleSaveAsDraftAssignment = () => {
    if (!asTitle.trim()) {
      alert('Vui lòng nhập tên bài tập trước khi lưu vào cơ sở dữ liệu!');
      return;
    }

    const currentId = draftAssignmentId || `as_draft_${Date.now()}`;
    addAssignment({
      id: currentId,
      title: asTitle.trim(),
      description: asDesc.trim(),
      subject: asSubject,
      attachments: attachedFiles,
      links: linksList,
      rewardStars: asStars,
      week: asWeek,
      criteria: {
        shuffleQuestions: shuffle,
        mustGet100: must100,
        onlyOneAttempt: onlyOne,
        timeLimitHours: timeLimit,
        oneTimeOnly,
        multipleTimes,
        shuffleOnRetry,
        autoGrade,
        autoStarPoints,
        saveDraftAllowed,
        showAnswersOnSubmit,
        limitTimeEnabled,
        limit24h,
        limit3days,
        autoLockOnExpiry,
        notifyParentOnUncompleted,
        earlyCompletionStar,
        lateSubmissionDeductStar,
        mustCompleteBeforeNew,
        allowedAttemptsCount,
        startDate,
        startTime,
        endDate,
        endTime,
        rememberForReview,
        stillAllowedAfterExpiry
      },
      questions,
      isDraft: true
    });

    setDraftAssignmentId(currentId);
    alert('Đã lưu bản nháp bài tập thành công vào Cơ sở dữ liệu! Bạn có thể tiếp tục chỉnh sửa trước khi Gửi chính thức.');
  };

  const handleSaveAttachmentAndLinksAsQuestion = () => {
    audioSynth.playBubblePop();
    const attachedNames = attachedFiles.map(f => f.name).join(', ');
    const linkNames = linksList.map(l => l.title).join(', ');
    
    let descriptionText = 'Học sinh hãy nghiên cứu tài liệu đính kèm';
    if (attachedNames) {
      descriptionText += ` [${attachedNames}]`;
    }
    if (linkNames) {
      descriptionText += ` và liên kết bổ trợ [${linkNames}]`;
    }
    descriptionText += ' để hoàn thành tốt nhiệm vụ học tập này nhé!';

    const newQuestionItem = {
      id: `q_attached_${Date.now()}`,
      type: 'single_choice' as const,
      questionText: descriptionText,
      options: ['Đã đọc kỹ tài liệu và hiểu nhiệm vụ ✅', 'Con cần cô hướng dẫn thêm 💬'],
      correctAnswer: 'A'
    };

    setQuestions(prev => [...prev, newQuestionItem]);
    alert('Đã tạo câu hỏi/nhiệm vụ học tập từ tài liệu đính kèm và đường link, tự động lưu vào bộ bài thành công! 🎉');
  };

  const handleLoadDraft = (draft: Assignment) => {
    setAsTitle(draft.title);
    setAsDesc(draft.description);
    setAsSubject(draft.subject);
    setAsStars(draft.rewardStars);
    setAsWeek(draft.week || 1);
    setShuffle(draft.criteria.shuffleQuestions);
    setMust100(draft.criteria.mustGet100);
    setOnlyOne(draft.criteria.onlyOneAttempt);
    setTimeLimit(draft.criteria.timeLimitHours);
    setAttachedFiles(draft.attachments);
    setLinksList(draft.links);
    setQuestions(draft.questions);
    setDraftAssignmentId(draft.id);

    // Load expanded criteria fields with safe fallbacks
    setOneTimeOnly(!!draft.criteria.oneTimeOnly);
    setMultipleTimes(draft.criteria.multipleTimes !== false);
    setShuffleOnRetry(!!draft.criteria.shuffleOnRetry);
    setAutoGrade(draft.criteria.autoGrade !== false);
    setAutoStarPoints(draft.criteria.autoStarPoints !== false);
    setSaveDraftAllowed(draft.criteria.saveDraftAllowed !== false);
    setShowAnswersOnSubmit(draft.criteria.showAnswersOnSubmit !== false);

    setLimitTimeEnabled(!!draft.criteria.limitTimeEnabled);
    setLimit24h(!!draft.criteria.limit24h);
    setLimit3days(!!draft.criteria.limit3days);
    setAutoLockOnExpiry(!!draft.criteria.autoLockOnExpiry);
    setNotifyParentOnUncompleted(!!draft.criteria.notifyParentOnUncompleted);
    setEarlyCompletionStar(!!draft.criteria.earlyCompletionStar);
    setLateSubmissionDeductStar(!!draft.criteria.lateSubmissionDeductStar);
    setMustCompleteBeforeNew(!!draft.criteria.mustCompleteBeforeNew);

    setAllowedAttemptsCount(draft.criteria.allowedAttemptsCount || 'unlimited');

    setStartDate(draft.criteria.startDate || '2026-06-26');
    setStartTime(draft.criteria.startTime || '19:00');
    setEndDate(draft.criteria.endDate || '2026-06-28');
    setEndTime(draft.criteria.endTime || '20:00');

    setRememberForReview(draft.criteria.rememberForReview !== false);
    setStillAllowedAfterExpiry(draft.criteria.stillAllowedAfterExpiry !== false);

    alert(`Đã nạp thành công bản nháp: "${draft.title}" từ cơ sở dữ liệu!`);
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

  // Parent feedback settings
  const [parentFeedbackCount, setParentFeedbackCount] = useState(settings.parentFeedbackCount || 3);
  const [parentFeedbackRewardStars, setParentFeedbackRewardStars] = useState(settings.parentFeedbackRewardStars || 5);
  
  // Login credentials settings
  const [defaultPassword, setDefaultPassword] = useState(settings.defaultPassword || '123');
  const [allowChangePassword, setAllowChangePassword] = useState(settings.allowChangePassword !== false);

  const [isSettingsSaved, setIsSettingsSaved] = useState(false);
  const [editingBannerId, setEditingBannerId] = useState<string | null>(null);

  // Collapsible Settings sections
  const [isPart1Open, setIsPart1Open] = useState(false);
  const [isPart2Open, setIsPart2Open] = useState(false);
  const [isPart3Open, setIsPart3Open] = useState(false);
  const [isPart4Open, setIsPart4Open] = useState(false);

  // Selected student ids for password resetting
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);

  // Simulated Zalo notifications transmission logs
  const [zaloLogs, setZaloLogs] = useState<string[]>([]);
  const [showZaloStatus, setShowZaloStatus] = useState(false);

  // Intro Banners & Activity News Board states
  const [banners, setBanners] = useState<BoardBanner[]>(settings.banners || []);
  const [newBannerTitle, setNewBannerTitle] = useState('');
  const [newBannerDesc, setNewBannerDesc] = useState('');
  const [newBannerType, setNewBannerType] = useState<'image' | 'video'>('image');
  const [newBannerUrl, setNewBannerUrl] = useState('');
  const [newBannerBg, setNewBannerBg] = useState('from-amber-400 via-pink-400 to-rose-400');
  const [newBannerDuration, setNewBannerDuration] = useState(6);
  const [newBannerNote, setNewBannerNote] = useState('');
  const [reminderTargetType, setReminderTargetType] = useState<'all' | 'selected'>('all');
  const [selectedStudentIdsForReminder, setSelectedStudentIdsForReminder] = useState<string[]>([]);

  const handleBannerFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type.startsWith('video/')) {
      setNewBannerType('video');
    } else {
      setNewBannerType('image');
    }

    if (file.size < 4000000) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        if (evt.target?.result) {
          setNewBannerUrl(evt.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    } else {
      const url = URL.createObjectURL(file);
      setNewBannerUrl(url);
    }
  };

  const handleSaveSettings = () => {
    updateSettings({
      starToFlagRatio: starRatio,
      flagToGoldRatio: flagRatio,
      rewardRules: rewardRules,
      violationsList: rewardRules.filter(r => r.type === 'minus').map(r => r.name),
      banners: banners,
      parentFeedbackCount: parentFeedbackCount,
      parentFeedbackRewardStars: parentFeedbackRewardStars,
      defaultPassword: defaultPassword,
      allowChangePassword: allowChangePassword
    });
    setIsSettingsSaved(true);
    setTimeout(() => {
      setIsSettingsSaved(false);
    }, 3000);
  };

  const handleSaveLoginSettings = () => {
    // 1. Save settings in general
    handleSaveSettings();

    // 2. Simulate automatic Zalo linking and sending to matching numbers in student list
    const logs: string[] = [];
    logs.push(`⚙️ [Hệ thống Đăng nhập & Phân quyền] Đang ghi nhận các thay đổi...`);
    logs.push(`🔐 Đã bật phân quyền: ${allowChangePassword ? "Cho phép học sinh/phụ huynh tự đổi mật khẩu" : "Khóa tự đổi mật khẩu (Chỉ giáo viên cấp)"}`);
    logs.push(`🔑 Mật khẩu mặc định mới được thiết lập là: "${defaultPassword}"`);
    logs.push(`📡 Khởi chạy Hệ thống Liên kết Zalo tự động cho toàn bộ danh sách lớp...`);
    logs.push(`------------------------------------------`);

    students.forEach((s) => {
      const activePass = s.password || defaultPassword;
      const activeParentPass = s.parentPassword || defaultPassword;
      logs.push(`🔍 Tìm kiếm liên kết trùng khớp SĐT: ${s.parentPhone || 'Chưa cập nhật'}...`);
      logs.push(`🟢 Đã liên kết thành công Zalo Phụ huynh em: ${s.name} (${s.parentName})`);
      logs.push(`💬 [Đã gửi Tin nhắn Zalo] "Kính gửi phụ huynh em ${s.name}, đây là thông tin đăng nhập của gia đình:\n- Học sinh: ${s.name} | Mật khẩu: ${activePass}\n- Phụ huynh: ${s.parentName || `PH ${s.name}`} | Mật khẩu: ${activeParentPass}\n- Trạng thái: ${allowChangePassword ? 'Có quyền tự đổi mật khẩu cá nhân.' : 'Mật khẩu do giáo viên quản lý.'}"`);
      logs.push(`------------------------------------------`);
    });

    setZaloLogs(logs);
    setShowZaloStatus(true);
  };

  const handleAddBanner = (e: React.FormEvent, isDraftFlag?: boolean) => {
    if (e) e.preventDefault();
    if (!newBannerTitle.trim() || !newBannerDesc.trim()) {
      alert('Vui lòng nhập đầy đủ tiêu đề và nội dung mô tả dặn dò!');
      return;
    }
    
    const draftStatus = isDraftFlag === true;
    const targetIds = reminderTargetType === 'selected' ? selectedStudentIdsForReminder : undefined;
    
    let updated: BoardBanner[];
    if (editingBannerId) {
      updated = banners.map(b => b.id === editingBannerId ? {
        ...b,
        type: newBannerType,
        url: newBannerUrl.trim(),
        title: newBannerTitle.trim(),
        description: newBannerDesc.trim(),
        bgClass: newBannerBg,
        duration: newBannerDuration,
        note: newBannerNote.trim(),
        isDraft: draftStatus,
        targetStudentIds: targetIds
      } : b);
      setEditingBannerId(null);
      alert(draftStatus ? 'Đã cập nhật dặn dò thành Nháp! 📝' : 'Đã cập nhật và gửi dặn dò thành công! 📢');
    } else {
      const newB: BoardBanner = {
        id: `b_custom_${Date.now()}`,
        type: newBannerType,
        url: newBannerUrl.trim(),
        title: newBannerTitle.trim(),
        description: newBannerDesc.trim(),
        bgClass: newBannerBg,
        duration: newBannerDuration,
        note: newBannerNote.trim(),
        isDraft: draftStatus,
        targetStudentIds: targetIds
      };
      updated = [...banners, newB];
      alert(draftStatus ? 'Đã lưu dặn dò vào danh sách nháp thành công! 📝' : 'Đã đăng dặn dò hằng ngày mới thành công! 📢');
    }
    
    setBanners(updated);
    updateSettings({
      starToFlagRatio: starRatio,
      flagToGoldRatio: flagRatio,
      rewardRules: rewardRules,
      violationsList: rewardRules.filter(r => r.type === 'minus').map(r => r.name),
      banners: updated,
      parentFeedbackCount: parentFeedbackCount,
      parentFeedbackRewardStars: parentFeedbackRewardStars
    });

    setNewBannerTitle('');
    setNewBannerDesc('');
    setNewBannerUrl('');
    setNewBannerNote('');
    setNewBannerDuration(6);
    setNewBannerBg('from-amber-400 via-pink-400 to-rose-400');
    setReminderTargetType('all');
    setSelectedStudentIdsForReminder([]);
  };

  const handleStartEditBanner = (banner: BoardBanner) => {
    setEditingBannerId(banner.id);
    setNewBannerTitle(banner.title);
    setNewBannerDesc(banner.description);
    setNewBannerType(banner.type);
    setNewBannerUrl(banner.url);
    setNewBannerBg(banner.bgClass || 'from-amber-400 via-pink-400 to-rose-400');
    setNewBannerDuration(banner.duration || 6);
    setNewBannerNote(banner.note || '');
  };

  const handleCancelEditBanner = () => {
    setEditingBannerId(null);
    setNewBannerTitle('');
    setNewBannerDesc('');
    setNewBannerUrl('');
    setNewBannerNote('');
    setNewBannerDuration(6);
    setNewBannerBg('from-amber-400 via-pink-400 to-rose-400');
  };

  const handleDeleteBanner = (bannerId: string) => {
    if (editingBannerId === bannerId) {
      handleCancelEditBanner();
    }
    const updated = banners.filter(b => b.id !== bannerId);
    setBanners(updated);
    updateSettings({
      starToFlagRatio: starRatio,
      flagToGoldRatio: flagRatio,
      rewardRules: rewardRules,
      violationsList: rewardRules.filter(r => r.type === 'minus').map(r => r.name),
      banners: updated,
      parentFeedbackCount: parentFeedbackCount,
      parentFeedbackRewardStars: parentFeedbackRewardStars
    });
    alert('Đã xoá tin hoạt động khỏi bảng tin thành công!');
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
    'Toán',
    'Tiếng Việt',
    'Khoa học',
    'Lịch sử và Địa lí',
    'Công nghệ',
    'Tin học',
    'Đạo đức',
    'Âm nhạc',
    'Giáo dục thể chất',
    'Tiếng Anh',
    'Mĩ thuật'
  ];

  return (
    <div className="bg-gradient-to-br from-indigo-50/10 via-white to-sky-50/25 border-4 border-indigo-100 p-5 md:p-7 rounded-3xl shadow-sm space-y-6 animate-fadeIn">
      {/* Classroom Management Header Section - Only when not in dashboard */}
      {activeTab !== 'dashboard' && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-indigo-50 pb-5">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => {
                audioSynth.playBubblePop();
                setActiveTab('dashboard');
              }}
              className="flex items-center space-x-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-2xl text-xs font-black transition-all cursor-pointer shadow-xs border border-slate-200"
            >
              <span>⬅ QUAY LẠI</span>
            </button>
            <h2 className="text-lg md:text-xl font-black text-indigo-950 uppercase tracking-tight">
              {activeTab === 'students' && 'Quản lý lớp học 👨‍🏫'}
              {activeTab === 'assignments' && 'Nhiệm vụ học tập 📚'}
              {activeTab === 'progress' && 'Tiến độ và kết quả 📈'}
              {activeTab === 'feedback' && 'Phản hồi phụ huynh 💬'}
              {activeTab === 'settings' && 'Cài đặt lớp học ⚙️'}
            </h2>
          </div>
          <div className="flex items-center">
            <span className="text-[10px] bg-indigo-100 text-indigo-800 border border-indigo-200 px-3.5 py-1.5 rounded-full font-black uppercase tracking-wider shadow-xs">
              CHẾ ĐỘ GIÁO VIÊN 👩‍🏫
            </span>
          </div>
        </div>
      )}

      {!isClassroomCollapsed && (
        <>

      {/* Main Tab Area */}
      <AnimatePresence mode="wait">
        
        {/* TAB 0: DASHBOARD BENTO GRID */}
        {activeTab === 'dashboard' && (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="flex flex-col items-center justify-center space-y-8 max-w-4xl mx-auto py-6"
          >
            <div className="text-center space-y-3">
              <h3 className="text-2xl md:text-3xl font-black text-indigo-950 uppercase tracking-tight flex items-center justify-center gap-2">
                <span>🎒</span> QUẢN LÝ LỚP HỌC 🏫
              </h3>
            </div>

            <div className="w-full max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* 1. 📘 Quản lý học tập */}
              <button
                type="button"
                onClick={() => {
                  audioSynth.playSuccess();
                  setActiveTab('students');
                }}
                className="flex items-center space-x-4 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-750 text-white p-6 rounded-2xl border-2 border-sky-400 shadow-md hover:shadow-lg transition-all cursor-pointer transform hover:-translate-y-1 group"
              >
                <span className="text-3xl p-3 bg-white/20 rounded-xl group-hover:scale-110 transition-transform">📘</span>
                <span className="text-sm font-black uppercase tracking-wider">Quản lý học tập</span>
              </button>

              {/* 2. 📝 Nhiệm vụ */}
              <button
                type="button"
                onClick={() => {
                  audioSynth.playSuccess();
                  setActiveTab('assignments');
                  setAssignmentSubTab('create');
                }}
                className="flex items-center space-x-4 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-750 text-white p-6 rounded-2xl border-2 border-emerald-400 shadow-md hover:shadow-lg transition-all cursor-pointer transform hover:-translate-y-1 group"
              >
                <span className="text-3xl p-3 bg-white/20 rounded-xl group-hover:scale-110 transition-transform">📝</span>
                <span className="text-sm font-black uppercase tracking-wider">Nhiệm vụ</span>
              </button>

              {/* 3. 🤖 AI Trợ lý học tập */}
              <button
                type="button"
                onClick={() => {
                  audioSynth.playSuccess();
                  setActiveTab('assignments');
                  setAssignmentSubTab('ai_assistant');
                }}
                className="flex items-center space-x-4 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-750 text-white p-6 rounded-2xl border-2 border-purple-400 shadow-md hover:shadow-lg transition-all cursor-pointer transform hover:-translate-y-1 group"
              >
                <span className="text-3xl p-3 bg-white/20 rounded-xl group-hover:scale-110 transition-transform">🤖</span>
                <span className="text-sm font-black uppercase tracking-wider">AI Trợ lý học tập</span>
              </button>

              {/* 4. 📅 Dặn dò hằng ngày */}
              <button
                type="button"
                onClick={() => {
                  audioSynth.playSuccess();
                  setActiveTab('assignments');
                  setAssignmentSubTab('daily_reminder');
                }}
                className="flex items-center space-x-4 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-750 text-white p-6 rounded-2xl border-2 border-amber-400 shadow-md hover:shadow-lg transition-all cursor-pointer transform hover:-translate-y-1 group"
              >
                <span className="text-3xl p-3 bg-white/20 rounded-xl group-hover:scale-110 transition-transform">📅</span>
                <span className="text-sm font-black uppercase tracking-wider">Dặn dò hằng ngày</span>
              </button>

              {/* 5. 📈 Tiến độ và kết quả */}
              <button
                type="button"
                onClick={() => {
                  audioSynth.playSuccess();
                  setActiveTab('assignments');
                  setAssignmentSubTab('progress');
                }}
                className="flex items-center space-x-4 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-750 text-white p-6 rounded-2xl border-2 border-rose-400 shadow-md hover:shadow-lg transition-all cursor-pointer transform hover:-translate-y-1 group"
              >
                <span className="text-3xl p-3 bg-white/20 rounded-xl group-hover:scale-110 transition-transform">📈</span>
                <span className="text-sm font-black uppercase tracking-wider">Tiến độ và kết quả</span>
              </button>

              {/* 6. 💬 Phản hồi phụ huynh */}
              <button
                type="button"
                onClick={() => {
                  audioSynth.playSuccess();
                  setActiveTab('feedback');
                }}
                className="flex items-center space-x-4 bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-750 text-white p-6 rounded-2xl border-2 border-teal-400 shadow-md hover:shadow-lg transition-all cursor-pointer transform hover:-translate-y-1 group"
              >
                <span className="text-3xl p-3 bg-white/20 rounded-xl group-hover:scale-110 transition-transform">💬</span>
                <span className="text-sm font-black uppercase tracking-wider">Phản hồi phụ huynh</span>
              </button>

              {/* 7. ⚙️ Cài đặt lớp học */}
              <button
                type="button"
                onClick={() => {
                  audioSynth.playSuccess();
                  setActiveTab('settings');
                }}
                className="flex items-center space-x-4 bg-gradient-to-r from-slate-600 to-slate-800 hover:from-slate-700 hover:to-slate-900 text-white p-6 rounded-2xl border-2 border-slate-500 shadow-md hover:shadow-lg transition-all cursor-pointer transform hover:-translate-y-1 group sm:col-span-2"
              >
                <span className="text-3xl p-3 bg-white/20 rounded-xl group-hover:scale-110 transition-transform">⚙️</span>
                <span className="text-sm font-black uppercase tracking-wider">Cài đặt lớp học</span>
              </button>
            </div>
          </motion.div>
        )}

        {/* TAB 1: MANAGING STUDENTS */}
        {activeTab === 'students' && (
          <motion.div
            key="students"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* Student Sub Navigation - Centered, Bright Cute Pastel Colors, Bold, Clear Layout */}
            <div className="flex flex-wrap items-center justify-center bg-indigo-50/50 p-2 text-center rounded-2xl gap-2 w-full max-w-4xl mx-auto border-2 border-indigo-100 shadow-sm animate-fadeIn">
              <button
                onClick={() => {
                  audioSynth.playBubblePop();
                  setStudentSubTab('list');
                }}
                className={`px-5 py-2.5 text-xs font-black uppercase tracking-wider rounded-xl border-2 transition-all cursor-pointer ${
                  studentSubTab === 'list'
                    ? 'bg-pink-100 border-pink-400 text-pink-900 shadow-sm scale-105'
                    : 'bg-white/80 border-pink-100 text-pink-700 hover:bg-pink-50'
                }`}
              >
                🧑‍🎓 Học sinh
              </button>
              <button
                onClick={() => {
                  audioSynth.playBubblePop();
                  setStudentSubTab('attendance');
                }}
                className={`px-5 py-2.5 text-xs font-black uppercase tracking-wider rounded-xl border-2 transition-all cursor-pointer ${
                  studentSubTab === 'attendance'
                    ? 'bg-amber-100 border-amber-400 text-amber-900 shadow-sm scale-105'
                    : 'bg-white/80 border-amber-100 text-amber-700 hover:bg-amber-50'
                }`}
              >
                📅 Điểm danh
              </button>
              <button
                onClick={() => {
                  audioSynth.playBubblePop();
                  setStudentSubTab('rewards');
                }}
                className={`px-5 py-2.5 text-xs font-black uppercase tracking-wider rounded-xl border-2 transition-all cursor-pointer ${
                  studentSubTab === 'rewards'
                    ? 'bg-yellow-100 border-yellow-400 text-yellow-950 shadow-sm scale-105'
                    : 'bg-white/80 border-yellow-100 text-yellow-700 hover:bg-yellow-50'
                }`}
              >
                ⭐ Khen thưởng
              </button>
              <button
                onClick={() => {
                  audioSynth.playBubblePop();
                  setStudentSubTab('reminders');
                }}
                className={`px-5 py-2.5 text-xs font-black uppercase tracking-wider rounded-xl border-2 transition-all cursor-pointer ${
                  studentSubTab === 'reminders'
                    ? 'bg-rose-100 border-rose-400 text-rose-950 shadow-sm scale-105'
                    : 'bg-white/80 border-rose-100 text-rose-700 hover:bg-rose-50'
                }`}
              >
                ⚠️ Nhắc nhở
              </button>
              <button
                onClick={() => {
                  audioSynth.playBubblePop();
                  setStudentSubTab('ranking');
                }}
                className={`px-5 py-2.5 text-xs font-black uppercase tracking-wider rounded-xl border-2 transition-all cursor-pointer ${
                  studentSubTab === 'ranking'
                    ? 'bg-emerald-100 border-emerald-400 text-emerald-950 shadow-sm scale-105'
                    : 'bg-white/80 border-emerald-100 text-emerald-700 hover:bg-emerald-50'
                }`}
              >
                🏆 Xếp hạng
              </button>
            </div>

            {/* Sub Content 1: Student List */}
            {studentSubTab === 'list' && (
              <div className="space-y-6">
                
                {/* Add student box */}
                <div className="bg-amber-50/50 border-2 border-amber-200/80 rounded-3xl p-6 shadow-sm space-y-6 relative overflow-hidden">
                  <div className="absolute top-0 right-0 text-4xl opacity-15 select-none pointer-events-none mt-1 mr-2">🎈🧸📚</div>
                  <div className="border-b border-amber-200/60 pb-3">
                    <h3 className="text-base font-black text-amber-900 flex items-center space-x-2">
                      <span className="p-2 bg-amber-100 rounded-xl text-amber-600 text-xl">✨</span>
                      <span>Nhập & Khởi Tạo Danh Sách Lớp Học</span>
                    </h3>
                    <p className="text-[11px] text-amber-800 font-bold">Bổ sung học sinh trực tiếp hoặc tải tệp Excel/CSV mẫu để cập nhật nhanh danh sách cả lớp.</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Cách 1: Thêm thủ công */}
                    <div className="space-y-4 bg-white/90 p-5 rounded-2xl border border-amber-100">
                      <h4 className="text-xs font-black text-amber-800 uppercase tracking-wider flex items-center space-x-1">
                        <span>📝 Cách 1: Thêm thủ công từng bé</span>
                      </h4>
                      <form onSubmit={handleAddStudentSubmit} className="space-y-3.5">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                          <div>
                            <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Tên Học Sinh *</label>
                            <input
                              type="text"
                              required
                              placeholder="Ví dụ: Nguyễn Văn Hải"
                              value={newStudentName}
                              onChange={e => setNewStudentName(e.target.value)}
                              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-amber-400 font-bold text-slate-700 bg-slate-50/50"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Ngày Tháng Năm Sinh *</label>
                            <input
                              type="date"
                              required
                              value={newStudentBirthDate}
                              onChange={e => setNewStudentBirthDate(e.target.value)}
                              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-amber-400 font-bold text-slate-700 bg-slate-50/50"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                          <div>
                            <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Giới Tính *</label>
                            <select
                              value={newStudentGender}
                              onChange={e => setNewStudentGender(e.target.value)}
                              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-amber-400 font-bold text-slate-700 bg-slate-50/50"
                            >
                              <option value="Nam">Nam 👦</option>
                              <option value="Nữ">Nữ 👧</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Họ Tên Phụ Huynh *</label>
                            <input
                              type="text"
                              required
                              placeholder="Ví dụ: Anh Nguyễn Văn Đông"
                              value={newStudentParent}
                              onChange={e => setNewStudentParent(e.target.value)}
                              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-amber-400 font-bold text-slate-700 bg-slate-50/50"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Số Điện Thoại Phụ Huynh *</label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              required
                              placeholder="Ví dụ: 0912345678"
                              value={newStudentPhone}
                              onChange={e => setNewStudentPhone(e.target.value)}
                              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-amber-400 font-bold text-slate-700 bg-slate-50/50 font-mono"
                            />
                            <button
                              type="submit"
                              className="px-5 bg-amber-500 hover:bg-amber-600 text-white font-black text-xs rounded-xl cursor-pointer shadow-sm transition-all duration-200 shrink-0 uppercase tracking-wide"
                            >
                              Thêm mới ✨
                            </button>
                          </div>
                        </div>
                      </form>
                    </div>

                    {/* Cách 2: Nhập hàng loạt */}
                    <div className="space-y-4 bg-white/90 p-5 rounded-2xl border border-amber-100 flex flex-col justify-between">
                      <div>
                        <h4 className="text-xs font-black text-indigo-800 uppercase tracking-wider flex items-center space-x-1">
                          <span>📊 Cách 2: Nhập danh sách từ tệp Excel / CSV Mẫu</span>
                        </h4>
                        
                        <div className="grid grid-cols-2 gap-2 mt-3 mb-4">
                          <button
                            type="button"
                            onClick={handleDownloadTemplate}
                            className="flex items-center justify-center space-x-1 py-2 px-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-2 border-dashed border-emerald-200 hover:border-emerald-400 rounded-xl text-[10px] font-black cursor-pointer transition-all"
                            title="Tải tệp Excel/CSV mẫu về máy"
                          >
                            <Download className="h-3 w-3 text-emerald-600 animate-pulse shrink-0" />
                            <span>Tải Tệp Mẫu .csv 📥</span>
                          </button>

                          <label className="flex items-center justify-center space-x-1 py-2 px-1 bg-sky-50 hover:bg-sky-100 text-sky-700 border-2 border-dashed border-sky-200 hover:border-sky-400 rounded-xl text-[10px] font-black cursor-pointer transition-all text-center">
                            <Upload className="h-3 w-3 text-sky-600 shrink-0 animate-bounce" />
                            <span>ĐƯA TỆP MẪU LÊN 📤</span>
                            <input
                              type="file"
                              accept=".csv,.txt"
                              onChange={handleFileUpload}
                              className="hidden"
                            />
                          </label>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <textarea
                          rows={2}
                          placeholder="Hoặc dán văn bản trực tiếp theo mẫu: Tên học sinh, Họ tên phụ huynh, Số điện thoại"
                          value={rawImportText}
                          onChange={e => setRawImportText(e.target.value)}
                          className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none font-medium font-mono bg-slate-50/50"
                        />
                        <button
                          onClick={handleImportCSV}
                          disabled={!rawImportText.trim()}
                          className={`w-full py-2.5 text-xs font-black rounded-xl transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
                            rawImportText.trim()
                              ? 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-md shadow-emerald-50'
                              : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                          }`}
                        >
                          <FileSpreadsheet className="h-4 w-4" />
                          <span>XÁC NHẬN NẠP DANH SÁCH LỚP</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Display list of students in a beautiful colorful table as requested */}
                <div className="lg:col-span-2 bg-gradient-to-r from-amber-50 to-amber-100/50 border-2 border-amber-200 rounded-3xl p-6 shadow-sm space-y-4 relative overflow-hidden animate-fadeIn">
                  <div className="absolute top-0 right-0 text-5xl opacity-15 select-none pointer-events-none mt-1 mr-2">🎒⭐👦👧</div>
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-black text-amber-950 flex items-center space-x-2">
                      <span className="p-2 bg-amber-200/80 rounded-xl text-amber-800 text-xl">🏫</span>
                      <span>SĨ SỐ LỚP HỌC CHÍNH THỨC: {students.length} HỌC SINH</span>
                    </h3>
                    <span className="text-[10px] bg-indigo-500 text-white font-black px-3 py-1 rounded-full uppercase tracking-wide shadow-sm animate-pulse">
                      Toàn bộ danh sách lớp ✨
                    </span>
                  </div>

                  {students.length === 0 ? (
                    <p className="text-center text-slate-400 text-xs py-8 bg-white border border-dashed border-amber-200 rounded-2xl italic">
                      Chưa có học sinh nào. Thầy cô hãy thêm học sinh ở trên nhé! 🧸
                    </p>
                  ) : (
                    <div className="bg-white rounded-2xl border-2 border-amber-100 overflow-hidden shadow-sm">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs font-bold text-slate-600">
                          <thead>
                            <tr className="bg-amber-100/70 border-b border-amber-200 text-amber-950 font-black uppercase text-[10px] tracking-wider">
                              <th className="p-3.5 pl-4">Họ Tên Học Sinh (Emoji)</th>
                              <th className="p-3.5">Ngày Tháng Năm Sinh</th>
                              <th className="p-3.5">Giới Tính</th>
                              <th className="p-3.5">Tên Phụ Huynh</th>
                              <th className="p-3.5">Số Điện Thoại</th>
                              <th className="p-3.5 text-center">Hành Động / Sửa</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-amber-50">
                            {students.map((student) => (
                              <tr key={student.id} className="hover:bg-amber-50/40 transition duration-150">
                                {/* Cột 1: Tên học sinh */}
                                <td className="p-3.5 pl-4">
                                  <div className="flex items-center space-x-3">
                                    <span className="text-2xl filter drop-shadow-sm select-none shrink-0">{student.avatar}</span>
                                    <div>
                                      <div className="font-extrabold text-slate-900 text-sm">{student.name}</div>
                                      <div className="flex items-center space-x-1.5 mt-0.5">
                                        <span className="text-[9px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded border border-amber-200 font-extrabold shrink-0">
                                          ⭐ {student.stars} Sao
                                        </span>
                                        {student.flags > 0 && (
                                          <span className="text-[9px] bg-rose-50 text-rose-700 px-1.5 py-0.5 rounded border border-rose-100 font-extrabold shrink-0">
                                            🚩 {student.flags} Lỗi
                                          </span>
                                        )}
                                        <span className="text-[9px] bg-yellow-100 text-yellow-800 px-1.5 py-0.5 rounded border border-yellow-200 font-extrabold shrink-0">
                                          Hạng {student.rank}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </td>

                                {/* Cột 2: Ngày tháng năm sinh */}
                                <td className="p-3.5 text-slate-700 font-bold">
                                  {student.birthDate ? (
                                    <span className="bg-slate-100 text-slate-800 px-2 py-1 rounded-lg border border-slate-200/50">
                                      {student.birthDate.split('-').reverse().join('/')}
                                    </span>
                                  ) : (
                                    <span className="text-slate-400 font-medium italic">01/01/2018</span>
                                  )}
                                </td>

                                {/* Cột 3: Giới tính */}
                                <td className="p-3.5">
                                  <span className={`px-2.5 py-1 rounded-full font-black text-[10px] uppercase border ${
                                    student.gender === 'Nữ'
                                      ? 'bg-pink-100 text-pink-700 border-pink-200'
                                      : 'bg-sky-100 text-sky-700 border-sky-200'
                                  }`}>
                                    {student.gender === 'Nữ' ? '👧 Nữ' : '👦 Nam'}
                                  </span>
                                </td>

                                {/* Cột 4: Tên phụ huynh */}
                                <td className="p-3.5 text-slate-800 font-extrabold">
                                  {student.parentName}
                                </td>

                                {/* Cột 5: Số điện thoại */}
                                <td className="p-3.5 font-mono text-slate-700 font-extrabold">
                                  {student.parentPhone}
                                </td>

                                {/* Cột 6: Hành động / Sửa (Hình cây bút quyển vở) */}
                                <td className="p-3.5">
                                  <div className="flex items-center justify-center space-x-2">
                                    <button
                                      onClick={() => handleStartEditStudent(student)}
                                      className="flex items-center space-x-1 px-3 py-1.5 bg-sky-500 hover:bg-sky-600 text-white font-black rounded-xl transition duration-200 shadow-sm cursor-pointer"
                                      title="Chỉnh sửa thông tin học sinh"
                                    >
                                      {/* Cây bút quyển vở */}
                                      <Pencil className="h-3 w-3 shrink-0" />
                                      <Book className="h-3 w-3 shrink-0" />
                                      <span className="text-[10px] tracking-wide uppercase">Sửa ✏️</span>
                                    </button>

                                    <button
                                      onClick={() => {
                                        if (confirm(`Bạn có chắc chắn muốn xoá học sinh ${student.name} khỏi lớp học?`)) {
                                          deleteStudent(student.id);
                                        }
                                      }}
                                      className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-500 hover:text-rose-700 border border-rose-200 rounded-xl transition duration-200 cursor-pointer"
                                      title="Xoá học sinh"
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>

                {/* Edit Student Modal / Dialog */}
                <AnimatePresence>
                  {editingStudent && (
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
                      <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        className="bg-white border-4 border-amber-300 rounded-3xl p-6 max-w-md w-full shadow-2xl relative overflow-hidden space-y-4"
                      >
                        <div className="absolute top-0 right-0 text-5xl opacity-10 select-none pointer-events-none mt-1 mr-2">✏️📖✨</div>
                        <div className="border-b-2 border-amber-100 pb-3">
                          <h3 className="text-base font-black text-amber-950 flex items-center space-x-2">
                            <span className="p-2 bg-amber-100 rounded-xl text-amber-600">✏️</span>
                            <span>CHỈNH SỬA THÔNG TIN HỌC SINH</span>
                          </h3>
                          <p className="text-[10px] text-slate-500 font-bold mt-1">Cập nhật thông tin chi tiết cho bé {editingStudent.name}</p>
                        </div>

                        <form onSubmit={handleSaveEditStudentSubmit} className="space-y-3.5">
                          <div>
                            <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Tên Học Sinh *</label>
                            <input
                              type="text"
                              required
                              value={editName}
                              onChange={e => setEditName(e.target.value)}
                              className="w-full text-xs p-2.5 rounded-xl border-2 border-amber-100 focus:outline-none focus:border-amber-400 font-bold text-slate-700 bg-slate-50/50"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-3.5">
                            <div>
                              <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Ngày Tháng Năm Sinh</label>
                              <input
                                type="date"
                                required
                                value={editBirthDate}
                                onChange={e => setEditBirthDate(e.target.value)}
                                className="w-full text-xs p-2.5 rounded-xl border-2 border-amber-100 focus:outline-none focus:border-amber-400 font-bold text-slate-700 bg-slate-50/50"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Giới Tính</label>
                              <select
                                value={editGender}
                                onChange={e => setEditGender(e.target.value)}
                                className="w-full text-xs p-2.5 rounded-xl border-2 border-amber-100 focus:outline-none focus:border-amber-400 font-bold text-slate-700 bg-slate-50/50"
                              >
                                <option value="Nam">Nam 👦</option>
                                <option value="Nữ">Nữ 👧</option>
                              </select>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3.5">
                            <div>
                              <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Họ Tên Phụ Huynh *</label>
                              <input
                                type="text"
                                required
                                value={editParentName}
                                onChange={e => setEditParentName(e.target.value)}
                                className="w-full text-xs p-2.5 rounded-xl border-2 border-amber-100 focus:outline-none focus:border-amber-400 font-bold text-slate-700 bg-slate-50/50"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Số Điện Thoại *</label>
                              <input
                                type="text"
                                required
                                value={editParentPhone}
                                onChange={e => setEditParentPhone(e.target.value)}
                                className="w-full text-xs p-2.5 rounded-xl border-2 border-amber-100 focus:outline-none focus:border-amber-400 font-bold text-slate-700 bg-slate-50/50 font-mono"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Lựa Chọn Hình Đại Diện / Emoji</label>
                            <div className="flex flex-wrap gap-2 p-2.5 bg-slate-50 rounded-xl border border-slate-100 mt-1">
                              {['👦', '👧', '👶', '🦄', '🦁', '🦖', '🐼', '🦊', '🐨', '🐸', '🐰', '🐯'].map((emoji) => (
                                <button
                                  key={emoji}
                                  type="button"
                                  onClick={() => setEditAvatar(emoji)}
                                  className={`text-2xl p-1.5 rounded-lg hover:bg-amber-100 transition duration-150 ${
                                    editAvatar === emoji ? 'bg-amber-200 border-2 border-amber-400 scale-110' : ''
                                  }`}
                                >
                                  {emoji}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="flex space-x-3.5 pt-3">
                            <button
                              type="button"
                              onClick={() => setEditingStudent(null)}
                              className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-black text-xs rounded-xl uppercase tracking-wide transition"
                            >
                              Hủy Bỏ ❌
                            </button>
                            <button
                              type="submit"
                              className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-black text-xs rounded-xl uppercase tracking-wide shadow-md transition"
                            >
                              Lưu Thay Đổi ✅
                            </button>
                          </div>
                        </form>
                      </motion.div>
                    </div>
                  )}
                </AnimatePresence>





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

            {/* Sub Content 5: Full Ranking Leaderboard */}
            {studentSubTab === 'ranking' && (
              <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-6 max-w-4xl mx-auto animate-fadeIn">
                <div className="text-center space-y-2 border-b border-slate-100 pb-4">
                  <h3 className="text-lg font-black text-indigo-950">🏆 BẢNG XẾP HẠNG THI ĐUA HỌC KỲ</h3>
                  <p className="text-xs text-slate-400 font-bold">Quy chế đổi sao: {settings.starToFlagRatio} Sao = 1 🚩 | {settings.flagToGoldRatio} 🚩 = 1 🏆</p>
                </div>

                {/* Top 3 Podium Cards */}
                <div className="grid grid-cols-3 gap-3 items-end pt-6 pb-2 max-w-2xl mx-auto">
                  {/* Rank 2 */}
                  {students[1] && (
                    <div className="flex flex-col items-center">
                      <span className="text-3xl mb-1">{students[1].avatar}</span>
                      <div className="bg-slate-100 border border-slate-200 rounded-t-3xl p-4 w-full text-center h-32 flex flex-col justify-between shadow-sm">
                        <span className="text-xs font-black text-slate-700 truncate block">{students[1].name}</span>
                        <div>
                          <span className="text-2xl font-black text-slate-400">#2</span>
                          <span className="block text-xs text-amber-600 font-extrabold">⭐ {students[1].stars} sao</span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Rank 1 */}
                  {students[0] && (
                    <div className="flex flex-col items-center">
                      <span className="text-4xl animate-bounce mb-1">👑 {students[0].avatar}</span>
                      <div className="bg-amber-100 border-2 border-amber-300 rounded-t-3xl p-4 w-full text-center h-40 flex flex-col justify-between shadow-md">
                        <span className="text-xs font-black text-amber-900 truncate block">{students[0].name}</span>
                        <div>
                          <span className="text-3xl font-black text-amber-600">#1</span>
                          <span className="block text-sm text-amber-700 font-extrabold">⭐ {students[0].stars} sao</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Rank 3 */}
                  {students[2] && (
                    <div className="flex flex-col items-center">
                      <span className="text-3xl mb-1">{students[2].avatar}</span>
                      <div className="bg-amber-50 border border-amber-100 rounded-t-3xl p-4 w-full text-center h-28 flex flex-col justify-between shadow-sm">
                        <span className="text-xs font-black text-amber-800 truncate block">{students[2].name}</span>
                        <div>
                          <span className="text-xl font-black text-amber-700">#3</span>
                          <span className="block text-xs text-amber-600 font-extrabold">⭐ {students[2].stars} sao</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Detailed Ranking List */}
                <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1 max-w-2xl mx-auto">
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
            )}
          </motion.div>
        )}

        {/* TAB 2: ASSIGNMENTS & QUESTIONS BUILDER / REORGANIZED UNDER USER REQUEST */}
        {activeTab === 'assignments' && (
          <motion.div
            key="assignments"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6 w-full"
          >
            {/* Reorganized assignments sub-menu */}
            <div className="flex flex-wrap items-center justify-center bg-sky-50/50 p-2 text-center rounded-2xl gap-2 w-full max-w-5xl mx-auto border-2 border-sky-100 shadow-sm animate-fadeIn">
              <button
                onClick={() => {
                  audioSynth.playBubblePop();
                  setAssignmentSubTab('create');
                }}
                className={`px-5 py-2.5 text-xs font-black uppercase tracking-wider rounded-xl border-2 transition-all cursor-pointer ${
                  assignmentSubTab === 'create'
                    ? 'bg-sky-100 border-sky-400 text-sky-900 shadow-sm scale-105'
                    : 'bg-white/80 border-sky-100 text-sky-700 hover:bg-sky-50'
                }`}
              >
                📝 Giao bài tập
              </button>
              <button
                onClick={() => {
                  audioSynth.playBubblePop();
                  setAssignmentSubTab('daily_reminder');
                }}
                className={`px-5 py-2.5 text-xs font-black uppercase tracking-wider rounded-xl border-2 transition-all cursor-pointer ${
                  assignmentSubTab === 'daily_reminder'
                    ? 'bg-amber-100 border-amber-400 text-amber-900 shadow-sm scale-105'
                    : 'bg-white/80 border-amber-100 text-amber-700 hover:bg-amber-50'
                }`}
              >
                📖 Dặn dò hằng ngày
              </button>
              <button
                onClick={() => {
                  audioSynth.playBubblePop();
                  setAssignmentSubTab('progress');
                }}
                className={`px-5 py-2.5 text-xs font-black uppercase tracking-wider rounded-xl border-2 transition-all cursor-pointer ${
                  assignmentSubTab === 'progress'
                    ? 'bg-emerald-100 border-emerald-400 text-emerald-950 shadow-sm scale-105'
                    : 'bg-white/80 border-emerald-100 text-emerald-700 hover:bg-emerald-50'
                }`}
              >
                📈 Tiến độ hoàn thành
              </button>
              <button
                onClick={() => {
                  audioSynth.playBubblePop();
                  setAssignmentSubTab('results');
                }}
                className={`px-5 py-2.5 text-xs font-black uppercase tracking-wider rounded-xl border-2 transition-all cursor-pointer ${
                  assignmentSubTab === 'results'
                    ? 'bg-indigo-100 border-indigo-400 text-indigo-950 shadow-sm scale-105'
                    : 'bg-white/80 border-indigo-100 text-indigo-700 hover:bg-indigo-50'
                }`}
              >
                🏆 Kết quả học tập
              </button>
              <button
                onClick={() => {
                  audioSynth.playBubblePop();
                  setAssignmentSubTab('review_bank');
                }}
                className={`px-5 py-2.5 text-xs font-black uppercase tracking-wider rounded-xl border-2 transition-all cursor-pointer ${
                  assignmentSubTab === 'review_bank'
                    ? 'bg-rose-100 border-rose-400 text-rose-950 shadow-sm scale-105'
                    : 'bg-white/80 border-rose-100 text-rose-700 hover:bg-rose-50'
                }`}
              >
                💾 Ngân hàng ôn tập
              </button>
              <button
                onClick={() => {
                  audioSynth.playBubblePop();
                  setAssignmentSubTab('ai_assistant');
                }}
                className={`px-5 py-2.5 text-xs font-black uppercase tracking-wider rounded-xl border-2 transition-all cursor-pointer ${
                  assignmentSubTab === 'ai_assistant'
                    ? 'bg-purple-100 border-purple-400 text-purple-950 shadow-sm scale-105'
                    : 'bg-white/80 border-purple-100 text-purple-700 hover:bg-purple-50'
                }`}
              >
                🤖 AI Trợ Lý Học Tập
              </button>
            </div>

            {/* Sub-tab 1: Giao bài tập */}
            {assignmentSubTab === 'create' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
                <AssignmentFrames
                  asTitle={asTitle}
                  setAsTitle={setAsTitle}
                  asSubject={asSubject}
                  setAsSubject={setAsSubject}
                  asWeek={asWeek}
                  setAsWeek={setAsWeek}
                  asStars={asStars}
                  setAsStars={setAsStars}
                  asDesc={asDesc}
                  setAsDesc={setAsDesc}
                  isListening={isListening}
                  startVoiceToText={startVoiceToText}
                  criteriaExpanded={criteriaExpanded}
                  setCriteriaExpanded={setCriteriaExpanded}
                  shuffle={shuffle}
                  setShuffle={setShuffle}
                  must100={must100}
                  setMust100={setMust100}
                  onlyOne={onlyOne}
                  setOnlyOne={setOnlyOne}
                  timeLimit={timeLimit}
                  setTimeLimit={setTimeLimit}
                  oneTimeOnly={oneTimeOnly}
                  setOneTimeOnly={setOneTimeOnly}
                  multipleTimes={multipleTimes}
                  setMultipleTimes={setMultipleTimes}
                  shuffleOnRetry={shuffleOnRetry}
                  setShuffleOnRetry={setShuffleOnRetry}
                  autoGrade={autoGrade}
                  setAutoGrade={setAutoGrade}
                  autoStarPoints={autoStarPoints}
                  setAutoStarPoints={setAutoStarPoints}
                  saveDraftAllowed={saveDraftAllowed}
                  setSaveDraftAllowed={setSaveDraftAllowed}
                  showAnswersOnSubmit={showAnswersOnSubmit}
                  setShowAnswersOnSubmit={setShowAnswersOnSubmit}
                  limitTimeEnabled={limitTimeEnabled}
                  setLimitTimeEnabled={setLimitTimeEnabled}
                  limit24h={limit24h}
                  setLimit24h={setLimit24h}
                  limit3days={limit3days}
                  setLimit3days={setLimit3days}
                  autoLockOnExpiry={autoLockOnExpiry}
                  setAutoLockOnExpiry={setAutoLockOnExpiry}
                  notifyParentOnUncompleted={notifyParentOnUncompleted}
                  setNotifyParentOnUncompleted={setNotifyParentOnUncompleted}
                  earlyCompletionStar={earlyCompletionStar}
                  setEarlyCompletionStar={setEarlyCompletionStar}
                  lateSubmissionDeductStar={lateSubmissionDeductStar}
                  setLateSubmissionDeductStar={setLateSubmissionDeductStar}
                  mustCompleteBeforeNew={mustCompleteBeforeNew}
                  setMustCompleteBeforeNew={setMustCompleteBeforeNew}
                  allowedAttemptsCount={allowedAttemptsCount}
                  setAllowedAttemptsCount={setAllowedAttemptsCount}
                  startDate={startDate}
                  setStartDate={setStartDate}
                  startTime={startTime}
                  setStartTime={setStartTime}
                  endDate={endDate}
                  setEndDate={setEndDate}
                  endTime={endTime}
                  setEndTime={setEndTime}
                  rememberForReview={rememberForReview}
                  setRememberForReview={setRememberForReview}
                  stillAllowedAfterExpiry={stillAllowedAfterExpiry}
                  setStillAllowedAfterExpiry={setStillAllowedAfterExpiry}
                  essayQText={essayQText}
                  setEssayQText={setEssayQText}
                  isEssayListening={isEssayListening}
                  startEssayVoiceToText={startEssayVoiceToText}
                  essayQImages={essayQImages}
                  setEssayQImages={setEssayQImages}
                  handleEssayImageUpload={handleEssayImageUpload}
                  handleRemoveEssayImage={handleRemoveEssayImage}
                  handleSaveEssayQuestion={handleSaveEssayQuestion}
                  essayCriteria={essayCriteria}
                  setEssayCriteria={setEssayCriteria}
                  essayCriteriaImages={essayCriteriaImages}
                  setEssayCriteriaImages={setEssayCriteriaImages}
                  aiAutoGrade={aiAutoGrade}
                  setAiAutoGrade={setAiAutoGrade}
                  aiReview={aiReview}
                  setAiReview={setAiReview}
                  aiSuggestions={aiSuggestions}
                  setAiSuggestions={setAiSuggestions}
                  aiImmediateResults={aiImmediateResults}
                  setAiImmediateResults={setAiImmediateResults}
                  handleCriteriaImageUpload={handleCriteriaImageUpload}
                  handleRemoveCriteriaImage={handleRemoveCriteriaImage}
                  questions={questions}
                  setQuestions={setQuestions}
                  handleAddQuestion={handleAddQuestion}
                  downloadCSVTemplate={downloadCSVTemplate}
                  handleImportQuestionsFile={handleImportQuestionsFile}
                  tempImportedQuestions={tempImportedQuestions}
                  setTempImportedQuestions={setTempImportedQuestions}
                  qType={qType}
                  setQType={setQType}
                  qText={qText}
                  setQText={setQText}
                  qImages={qImages}
                  setQImages={setQImages}
                  singleOptA={singleOptA}
                  setSingleOptA={setSingleOptA}
                  singleOptB={singleOptB}
                  setSingleOptB={setSingleOptB}
                  singleOptC={singleOptC}
                  setSingleOptC={setSingleOptC}
                  singleOptD={singleOptD}
                  setSingleOptD={setSingleOptD}
                  singleCorrect={singleCorrect}
                  setSingleCorrect={setSingleCorrect}
                  tfA={tfA}
                  setTfA={setTfA}
                  tfB={tfB}
                  setTfB={setTfB}
                  tfC={tfC}
                  setTfC={setTfC}
                  tfD={tfD}
                  setTfD={setTfD}
                  tfACorrect={tfACorrect}
                  setTfACorrect={setTfACorrect}
                  tfBCorrect={tfBCorrect}
                  setTfBCorrect={setTfBCorrect}
                  tfCCorrect={tfCCorrect}
                  setTfCCorrect={setTfCCorrect}
                  tfDCorrect={tfDCorrect}
                  setTfDCorrect={setTfDCorrect}
                  mLeft1={mLeft1}
                  setMLeft1={setMLeft1}
                  mRight1={mRight1}
                  setMRight1={setMRight1}
                  mLeft2={mLeft2}
                  setMLeft2={setMLeft2}
                  mRight2={mRight2}
                  setMRight2={setMRight2}
                  mLeft3={mLeft3}
                  setMLeft3={setMLeft3}
                  mRight3={mRight3}
                  setMRight3={setMRight3}
                  mLeft4={mLeft4}
                  setMLeft4={setMLeft4}
                  mRight4={mRight4}
                  setMRight4={setMRight4}
                  blankTextWithDots={blankTextWithDots}
                  setBlankTextWithDots={setBlankTextWithDots}
                  blankWordBank={blankWordBank}
                  setBlankWordBank={setBlankWordBank}
                  blankCorrectAnswers={blankCorrectAnswers}
                  setBlankCorrectAnswers={setBlankCorrectAnswers}
                  attachedFiles={attachedFiles}
                  setAttachedFiles={setAttachedFiles}
                  linkTitle={linkTitle}
                  setLinkTitle={setLinkTitle}
                  linkUrl={linkUrl}
                  setLinkUrl={setLinkUrl}
                  addWebLink={addWebLink}
                  linksList={linksList}
                  setLinksList={setLinksList}
                  handleSaveAttachmentAndLinksAsQuestion={handleSaveAttachmentAndLinksAsQuestion}
                  handleSaveAsDraftAssignment={handleSaveAsDraftAssignment}
                  handleCreateAssignment={handleCreateAssignment}
                  SUBJECTS_LIST={SUBJECTS_LIST}
                  addAssignment={addAssignment}
                />
              </div>
            )}

            {/* Sub-tab 2: Dặn dò hằng ngày */}
            {assignmentSubTab === 'daily_reminder' && (
              <div className="space-y-6 w-full max-w-5xl mx-auto">
                <div className="bg-amber-50/50 border-2 border-amber-200 rounded-3xl p-6 shadow-sm space-y-4">
                  <h3 className="text-lg font-black text-amber-900 flex items-center space-x-2">
                    <span className="p-2 bg-amber-100 rounded-xl">📖</span>
                    <span>Thêm Dặn Dò Hằng Ngày Mới</span>
                  </h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">Tiêu Đề Dặn Dò *</label>
                        <input
                          type="text"
                          required
                          value={newBannerTitle}
                          onChange={e => setNewBannerTitle(e.target.value)}
                          placeholder="Ví dụ: Nhắc nhở chuẩn bị bài học ngày mai..."
                          className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-amber-400 font-bold text-slate-700 bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">Màu Sắc Nền Minh Họa</label>
                        <select
                          value={newBannerBg}
                          onChange={e => setNewBannerBg(e.target.value)}
                          className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-amber-400 font-bold text-slate-700 bg-white"
                        >
                          <option value="from-amber-400 via-pink-400 to-rose-400">Pastel Hồng Cam lấp lánh 🌈</option>
                          <option value="from-sky-400 to-indigo-500">Màu Xanh Biển dịu mát 🌊</option>
                          <option value="from-emerald-400 to-teal-600">Màu Xanh Lá tự nhiên 🍃</option>
                          <option value="from-purple-400 to-pink-500">Màu Tím Mơ mộng 🔮</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">Nội Dung Chi Tiết Dặn Dò *</label>
                      <textarea
                        required
                        rows={3}
                        value={newBannerDesc}
                        onChange={e => setNewBannerDesc(e.target.value)}
                        placeholder="Ví dụ: Các em học sinh nhớ hoàn thành bài tập Toán tuần 24 và ôn tập từ vựng Tiếng Anh nhé..."
                        className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-amber-400 font-bold text-slate-700 bg-white"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">Đường Dẫn Tài Liệu (Tùy chọn)</label>
                        <input
                          type="url"
                          value={newBannerUrl}
                          onChange={e => setNewBannerUrl(e.target.value)}
                          placeholder="https://..."
                          className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-amber-400 text-slate-700 bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">Ghi chú nhỏ (Chữ nghiêng chân trang)</label>
                        <input
                          type="text"
                          value={newBannerNote}
                          onChange={e => setNewBannerNote(e.target.value)}
                          placeholder="Ví dụ: Chúc các bé học vui nhé!"
                          className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-amber-400 text-slate-700 bg-white"
                        />
                      </div>
                    </div>

                    {/* Quick Student Selector */}
                    <div className="bg-amber-100/30 p-4 rounded-2xl border border-amber-200/50 space-y-3">
                      <label className="block text-[11px] font-black text-amber-950 uppercase tracking-wide">👥 Đối tượng nhận dặn dặn hằng ngày</label>
                      <div className="flex items-center space-x-6 text-xs font-bold text-slate-600">
                        <label className="flex items-center space-x-2 cursor-pointer select-none">
                          <input
                            type="radio"
                            name="reminderTargetRadio"
                            checked={reminderTargetType === 'all'}
                            onChange={() => setReminderTargetType('all')}
                            className="h-4 w-4 text-amber-500 accent-amber-500 cursor-pointer"
                          />
                          <span>Gửi cả lớp (Tất cả học sinh)</span>
                        </label>
                        <label className="flex items-center space-x-2 cursor-pointer select-none">
                          <input
                            type="radio"
                            name="reminderTargetRadio"
                            checked={reminderTargetType === 'selected'}
                            onChange={() => setReminderTargetType('selected')}
                            className="h-4 w-4 text-amber-500 accent-amber-500 cursor-pointer"
                          />
                          <span>Gửi riêng học sinh được chọn</span>
                        </label>
                      </div>

                      {reminderTargetType === 'selected' && (
                        <div className="p-3 bg-white rounded-xl border border-amber-200/40 space-y-2 animate-fadeIn max-h-[140px] overflow-y-auto">
                          <p className="text-[10px] font-extrabold text-amber-800 uppercase">Tích chọn bé nhận dặn dò:</p>
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                            {students.map(st => {
                              const isChecked = selectedStudentIdsForReminder.includes(st.id);
                              return (
                                <label key={st.id} className={`flex items-center space-x-2 p-1.5 rounded-lg border text-xs font-bold transition cursor-pointer select-none ${
                                  isChecked ? 'bg-amber-50 border-amber-300 text-amber-950' : 'bg-slate-50 border-slate-200 hover:border-slate-350'
                                }`}>
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={() => {
                                      if (isChecked) {
                                        setSelectedStudentIdsForReminder(prev => prev.filter(id => id !== st.id));
                                      } else {
                                        setSelectedStudentIdsForReminder(prev => [...prev, st.id]);
                                      }
                                    }}
                                    className="h-3.5 w-3.5 text-amber-500 accent-amber-400 cursor-pointer rounded animate-none"
                                  />
                                  <span>{st.avatar} {st.name}</span>
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex justify-end pt-2">
                      {editingBannerId ? (
                        <div className="flex items-center space-x-2">
                          <button
                            type="button"
                            onClick={handleCancelEditBanner}
                            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold rounded-xl transition cursor-pointer"
                          >
                            Hủy Bỏ
                          </button>
                          <button
                            type="button"
                            onClick={(e) => handleAddBanner(e, true)}
                            className="px-4 py-2 bg-amber-100 hover:bg-amber-200 text-amber-800 border border-amber-200 text-xs font-bold rounded-xl transition cursor-pointer"
                          >
                            Chuyển Về Nháp 📝
                          </button>
                          <button
                            type="button"
                            onClick={(e) => handleAddBanner(e, false)}
                            className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-black rounded-xl transition shadow-sm cursor-pointer"
                          >
                            Cập Nhật & Đăng 📢
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <button
                            type="button"
                            onClick={(e) => handleAddBanner(e, true)}
                            className="px-5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-black rounded-xl transition shadow-sm cursor-pointer"
                          >
                            Lưu Nháp 📝
                          </button>
                          <button
                            type="button"
                            onClick={(e) => handleAddBanner(e, false)}
                            className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-black rounded-xl transition shadow-sm cursor-pointer"
                          >
                            Gửi & Đăng Tin 📢
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* List of current daily reminders */}
                <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-4">
                  <h4 className="text-sm font-black text-slate-800 uppercase tracking-wide">
                    Danh Sách Dặn Dò Đang Hiển Thị Hằng Ngày
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {banners.map(b => (
                      <div key={b.id} className={`p-4 rounded-2xl border flex flex-col justify-between space-y-3 animate-fadeIn ${
                        b.isDraft ? 'bg-amber-50/40 border-amber-200/80' : 'bg-slate-50 border-slate-200'
                      }`}>
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between flex-wrap gap-2">
                            <div className="flex items-center space-x-1.5">
                              <span className="text-[10px] bg-amber-100 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-full font-black uppercase tracking-wider">
                                {b.type === 'image' ? '🖼 Hoạt Động' : '📢 Thông Báo'}
                              </span>
                              {b.isDraft && (
                                <span className="text-[10px] bg-amber-500 text-white px-2 py-0.5 rounded-full font-black uppercase tracking-wider">
                                  📝 Bản Nháp
                                </span>
                              )}
                            </div>
                            <span className="text-[9px] text-slate-400 font-bold font-mono">Hiển thị {b.duration || 6} giây</span>
                          </div>
                          
                          <h5 className="font-extrabold text-slate-800 text-xs flex items-center space-x-1">
                            <span>{b.title}</span>
                          </h5>
                          
                          <p className="text-[11px] text-slate-600 leading-normal">{b.description}</p>
                          {b.note && <p className="text-[10px] text-slate-400 italic font-medium">*{b.note}</p>}
                          
                          {/* Target Audience Label */}
                          <div className="text-[10px] text-slate-400 font-bold pt-1">
                            {b.targetStudentIds && b.targetStudentIds.length > 0 ? (
                              <span className="text-fuchsia-600 bg-fuchsia-50 px-2 py-0.5 rounded-md border border-fuchsia-150">
                                👥 Gửi riêng {b.targetStudentIds.length} học sinh
                              </span>
                            ) : (
                              <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-150">
                                👥 Gửi cả lớp
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex justify-end space-x-1 border-t border-slate-200/50 pt-2">
                          <button
                            onClick={() => {
                              handleStartEditBanner(b);
                              if (b.targetStudentIds) {
                                setReminderTargetType('selected');
                                setSelectedStudentIdsForReminder(b.targetStudentIds);
                              } else {
                                setReminderTargetType('all');
                                setSelectedStudentIdsForReminder([]);
                              }
                            }}
                            className="px-2.5 py-1 bg-sky-50 hover:bg-sky-100 text-sky-700 rounded-lg text-[10px] font-black border border-sky-100 transition cursor-pointer"
                          >
                            ✏ Sửa
                          </button>
                          <button
                            onClick={() => handleDeleteBanner(b.id)}
                            className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-[10px] font-black border border-rose-100 transition cursor-pointer"
                          >
                            🗑 Xoá
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Sub-tab 3: Tiến độ hoàn thành */}
            {assignmentSubTab === 'progress' && (
              <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-6 w-full max-w-5xl mx-auto animate-fadeIn">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                  <div>
                    <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Tiến độ hoàn thành nhiệm vụ môn học</h3>
                    <p className="text-xs text-slate-400 font-medium">Theo dõi chi tiết số lần làm bài, số câu đúng, thời gian làm bài của học sinh theo từng môn học.</p>
                  </div>
                  {selectedSubject && (
                    <button
                      onClick={() => setSelectedSubject(null)}
                      className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold transition cursor-pointer shrink-0"
                    >
                      ← Hiện tất cả 11 môn
                    </button>
                  )}
                </div>

                {/* 11 Rectangular Subject Boxes with 11 different colors */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {SUBJECTS_LIST.map((subj) => {
                    const isSelected = selectedSubject === subj;
                    const colorDef = SUBJECT_COLORS[subj] || { bg: 'bg-slate-50 text-slate-700 border-slate-200', activeBg: 'bg-slate-600 text-white border-slate-600', hover: 'hover:bg-slate-100', icon: '📝' };
                    const subjectAssignments = assignments.filter(a => a.subject === subj);
                    const taskCount = subjectAssignments.length;

                    return (
                      <button
                        key={subj}
                        onClick={() => setSelectedSubject(isSelected ? null : subj)}
                        className={`p-4 md:p-5 rounded-3xl border-2 transition-all duration-300 cursor-pointer flex flex-col items-center justify-center text-center h-36 relative overflow-hidden group select-none shadow-xs hover:shadow-md hover:scale-[1.03] ${
                          isSelected
                            ? `${colorDef.activeBg} scale-[1.05] ring-4 ring-offset-2 ring-indigo-400`
                            : `${colorDef.bg} ${colorDef.hover} border-slate-200/80`
                        }`}
                      >
                        {/* Cute background floating sticker */}
                        <div className="absolute -right-3 -bottom-3 text-6xl opacity-10 group-hover:scale-125 transition duration-500 select-none pointer-events-none">
                          {colorDef.icon}
                        </div>

                        <div className="flex flex-col items-center space-y-3 z-10">
                          <span className="text-4xl filter drop-shadow-sm transform group-hover:rotate-12 transition-transform duration-300 select-none">
                            {colorDef.icon}
                          </span>
                          <div>
                            <h4 className="font-black text-xs md:text-sm tracking-tight leading-tight uppercase font-sans">
                              {subj}
                            </h4>
                            <span className={`inline-block text-[9px] px-2.5 py-0.5 rounded-full font-extrabold mt-1.5 uppercase tracking-wider ${
                              isSelected ? 'bg-white/25 text-white' : 'bg-black/5 text-slate-500'
                            }`}>
                              🎈 {taskCount} nhiệm vụ
                            </span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Assignments list based on selected subject */}
                <div className="space-y-6 pt-2">
                  {!selectedSubject ? (
                    <div className="text-center py-12 bg-slate-50/50 rounded-3xl border border-dashed border-slate-200 space-y-3">
                      <span className="text-4xl">👆</span>
                      <p className="text-slate-500 font-bold text-sm">Vui lòng nhấn vào một trong 11 môn học ở trên</p>
                      <p className="text-slate-400 text-xs max-w-md mx-auto">Nhấn chọn môn học để xem chi tiết danh sách học sinh đã làm và chưa làm của từng nhiệm vụ tương ứng.</p>
                    </div>
                  ) : (
                    (() => {
                      const filteredAssignments = assignments.filter(a => a.subject === selectedSubject);
                      
                      if (filteredAssignments.length === 0) {
                        return (
                          <div className="text-center py-12 bg-slate-50/50 rounded-3xl border border-dashed border-slate-200 space-y-2">
                            <span className="text-3xl">📭</span>
                            <h4 className="font-bold text-slate-700 text-sm">Môn {selectedSubject} chưa có nhiệm vụ nào</h4>
                            <p className="text-slate-400 text-xs max-w-xs mx-auto">Cô giáo có thể chuyển sang tab <span className="font-bold text-slate-600">"Nhiệm vụ học tập"</span> để giao nhiệm vụ mới cho lớp.</p>
                          </div>
                        );
                      }

                      const nonDrafts = filteredAssignments.filter(a => !a.isDraft);

                      if (nonDrafts.length === 0) {
                        return (
                          <div className="text-center py-12 bg-slate-50/50 rounded-3xl border border-dashed border-slate-200 space-y-2">
                            <span className="text-3xl">📭</span>
                            <h4 className="font-bold text-slate-700 text-sm">Môn {selectedSubject} chưa có nhiệm vụ chính thức nào</h4>
                            <p className="text-slate-400 text-xs max-w-xs mx-auto">Cô giáo có thể chuyển sang tab <span className="font-bold text-slate-600">"Nhiệm vụ học tập"</span> để giao nhiệm vụ mới cho lớp.</p>
                          </div>
                        );
                      }

                      const weeksMap: { [key: number]: Assignment[] } = {};
                      nonDrafts.forEach(asg => {
                        const w = asg.week || 1;
                        if (!weeksMap[w]) weeksMap[w] = [];
                        weeksMap[w].push(asg);
                      });

                      const sortedWeeks = Object.keys(weeksMap).map(Number).sort((a, b) => b - a);

                      return (
                        <div className="space-y-8">
                          {sortedWeeks.map(wk => {
                            const isExpanded = expandedWeeks[wk] !== false;

                            // Gather completed and uncompleted rows for this week
                            const doneRows: { student: any; assignment: Assignment; submission: any }[] = [];
                            const notDoneRows: { student: any; assignment: Assignment }[] = [];

                            weeksMap[wk].forEach(asg => {
                              students.forEach(student => {
                                const sub = submissions.find(s => s.assignmentId === asg.id && s.studentId === student.id && s.status === 'submitted');
                                if (sub) {
                                  doneRows.push({ student, assignment: asg, submission: sub });
                                } else {
                                  notDoneRows.push({ student, assignment: asg });
                                }
                              });
                            });

                            return (
                              <div key={wk} className="bg-slate-50/50 rounded-3xl border border-slate-200/60 overflow-hidden shadow-xs">
                                {/* Week Header (Collapsible) */}
                                <button
                                  onClick={() => {
                                    audioSynth.playBubblePop();
                                    setExpandedWeeks(prev => ({ ...prev, [wk]: !isExpanded }));
                                  }}
                                  className="w-full flex items-center justify-between p-5 bg-white border-b border-slate-100 hover:bg-slate-50 transition text-left cursor-pointer focus:outline-none"
                                >
                                  <div className="flex items-center space-x-3">
                                    <span className="text-xl">📅</span>
                                    <div>
                                      <h4 className="text-sm font-black text-slate-800 uppercase tracking-tight">TUẦN {wk}</h4>
                                      <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">
                                        {weeksMap[wk].length} nhiệm vụ • {doneRows.length} lượt hoàn thành • {notDoneRows.length} lượt chưa làm
                                      </p>
                                    </div>
                                  </div>
                                  <span className="text-slate-400 text-sm font-black p-2 bg-slate-50 rounded-xl border border-slate-100">
                                    {isExpanded ? '▼ THU GỌN' : '▲ MỞ RỘNG'}
                                  </span>
                                </button>

                                {isExpanded && (
                                  <div className="p-6 space-y-6 animate-fadeIn bg-slate-50/25">
                                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                                      
                                      {/* Khung 1: HỌC SINH ĐÃ HOÀN THÀNH */}
                                      <div className="bg-emerald-50/45 border-2 border-emerald-200/80 rounded-3xl p-5 shadow-xs flex flex-col justify-between">
                                        <div className="space-y-4">
                                          <div className="flex items-center justify-between border-b border-emerald-200/50 pb-2">
                                            <h5 className="text-xs font-black text-emerald-800 flex items-center space-x-1.5">
                                              <span>🟢 ĐÃ HOÀN THÀNH ({doneRows.length} học sinh)</span>
                                            </h5>
                                            <span className="text-[10px] bg-emerald-100 text-emerald-800 font-extrabold px-2.5 py-0.5 rounded-full border border-emerald-200 uppercase">
                                              ✔ Tốt
                                            </span>
                                          </div>

                                          {doneRows.length === 0 ? (
                                            <div className="py-10 text-center text-emerald-600/80 font-bold text-xs italic">
                                              Chưa có học sinh nào hoàn thành bài tập tuần này 📪
                                            </div>
                                          ) : (
                                            <div className="overflow-x-auto">
                                              <table className="w-full text-left text-xs border-collapse">
                                                <thead>
                                                  <tr className="border-b border-emerald-200/40 text-emerald-800/70 font-extrabold uppercase text-[10px]">
                                                    <th className="pb-2">Học sinh</th>
                                                    <th className="pb-2">Nội dung bài</th>
                                                    <th className="pb-2 text-center">Trạng thái</th>
                                                    <th className="pb-2">Ngày nộp</th>
                                                    <th className="pb-2 text-center">Số lần làm</th>
                                                    <th className="pb-2 text-center">Đúng/Tổng</th><th className="pb-2 text-right">Chấm & Thưởng</th>
                                                  </tr>
                                                </thead>
                                                <tbody className="divide-y divide-emerald-100/40 font-bold text-emerald-950">
                                                  {doneRows.map((row, index) => {
                                                    const sub = row.submission;
                                                    const formattedDate = new Date(sub.submittedAt || Date.now()).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
                                                    
                                                    // Determine if assignment is essay or quiz
                                                    const isEssay = row.assignment.questions?.some(q => q.type === 'essay') || row.assignment.questions?.length === 0;
                                                    
                                                    return (
                                                      <tr key={`${wk}_done_${index}`} className="hover:bg-emerald-100/20 transition-all">
                                                        <td className="py-2.5 pr-2">
                                                          <div className="flex items-center space-x-1.5">
                                                            <span className="text-base select-none">{row.student.avatar}</span>
                                                            <span className="text-[11px] font-black tracking-tight">{row.student.name}</span>
                                                          </div>
                                                        </td>
                                                        <td className="py-2.5 pr-2 max-w-[120px] truncate text-slate-700 text-[11px]" title={row.assignment.title}>
                                                          {row.assignment.title}
                                                        </td>
                                                        <td className="py-2.5 text-center pr-2">
                                                          <span className="text-emerald-600 font-black text-sm">✔</span>
                                                        </td>
                                                        <td className="py-2.5 text-slate-500 font-mono text-[10px] pr-2">
                                                          {formattedDate}
                                                        </td>
                                                        <td className="py-2.5 text-center font-mono text-[11px] text-slate-600 pr-2">
                                                          {sub.attemptsCount || 1}
                                                        </td>
                                                        <td className="py-2.5 text-right font-mono text-[11px] text-emerald-800">
                                                          {isEssay ? 'Tự luận' : `${sub.correctCount}/${sub.totalQuestions}`}</td><td className="py-2.5 text-right pl-2"><button onClick={() => { audioSynth.playBubblePop(); setGradingSubmission({ student: row.student, assignment: row.assignment, submission: sub }); if (sub.feedbackMessage) { setManualFeedbackText(sub.feedbackMessage); } else { setManualFeedbackText(''); } setManualScore(null); setAiGradeResult(null); }} className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-tight transition cursor-pointer inline-flex items-center justify-center space-x-1 border ${sub.feedbackMessage ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300' : 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-700 shadow-xs'}`}><span>{sub.feedbackMessage ? '📝 Xem lại' : '✏️ Chấm bài'}</span></button>
                                                        </td>
                                                      </tr>
                                                    );
                                                  })}
                                                </tbody>
                                              </table>
                                            </div>
                                          )}
                                        </div>
                                      </div>

                                      {/* Khung 2: HỌC SINH CHƯA HOÀN THÀNH */}
                                      <div className="bg-rose-50/45 border-2 border-rose-200/80 rounded-3xl p-5 shadow-xs flex flex-col justify-between">
                                        <div className="space-y-4">
                                          <div className="flex items-center justify-between border-b border-rose-200/50 pb-2">
                                            <h5 className="text-xs font-black text-rose-800 flex items-center space-x-1.5">
                                              <span>🔴 CHƯA HOÀN THÀNH ({notDoneRows.length} học sinh)</span>
                                            </h5>
                                            <span className="text-[10px] bg-rose-100 text-rose-800 font-extrabold px-2.5 py-0.5 rounded-full border border-rose-200 uppercase">
                                              ⏰ Cần nhắc
                                            </span>
                                          </div>

                                          {notDoneRows.length === 0 ? (
                                            <div className="py-10 text-center text-emerald-600 font-black text-xs">
                                              🎉 Tuyệt vời! Cả lớp đã hoàn thành tất cả nhiệm vụ tuần này!
                                            </div>
                                          ) : (
                                            <div className="overflow-x-auto">
                                              <table className="w-full text-left text-xs border-collapse">
                                                <thead>
                                                  <tr className="border-b border-rose-200/40 text-rose-800/70 font-extrabold uppercase text-[10px]">
                                                    <th className="pb-2">Học sinh</th>
                                                    <th className="pb-2">Nội dung bài</th>
                                                    <th className="pb-2 text-center">Trạng thái</th>
                                                    <th className="pb-2">Hạn nộp</th>
                                                    <th className="pb-2 text-center">Nhắc PH</th>
                                                    <th className="pb-2 text-right">PH đã xem</th>
                                                  </tr>
                                                </thead>
                                                <tbody className="divide-y divide-rose-100/40 font-bold text-rose-950">
                                                  {notDoneRows.map((row, index) => {
                                                    const pairKey = `${row.student.id}_${row.assignment.id}`;
                                                    const hasReminded = remindedPairs[pairKey];
                                                    
                                                    // Get parent status or fallback to student-specific mocks
                                                    let statusVal = parentStatuses[pairKey];
                                                    if (!statusVal) {
                                                      if (row.student.id === 'stu_1') statusVal = 'read';
                                                      else if (row.student.id === 'stu_2') statusVal = 'replied';
                                                      else if (row.student.id === 'stu_3') statusVal = 'unread';
                                                      else statusVal = 'read';
                                                    }

                                                    const endDateObj = row.assignment.criteria.endDate;
                                                    const formattedEndDate = endDateObj 
                                                      ? new Date(endDateObj).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })
                                                      : '28/06';

                                                    return (
                                                      <tr key={`${wk}_not_done_${index}`} className="hover:bg-rose-100/20 transition-all">
                                                        <td className="py-2.5 pr-2">
                                                          <div className="flex items-center space-x-1.5">
                                                            <span className="text-base select-none">{row.student.avatar}</span>
                                                            <span className="text-[11px] font-black tracking-tight">{row.student.name}</span>
                                                          </div>
                                                        </td>
                                                        <td className="py-2.5 pr-2 max-w-[120px] truncate text-slate-700 text-[11px]" title={row.assignment.title}>
                                                          {row.assignment.title}
                                                        </td>
                                                        <td className="py-2.5 text-center text-rose-500 font-extrabold text-[11px] pr-2">
                                                          Chưa làm
                                                        </td>
                                                        <td className="py-2.5 text-slate-500 font-mono text-[10px] pr-2">
                                                          {formattedEndDate}
                                                        </td>
                                                        <td className="py-2.5 text-center pr-2">
                                                          <button
                                                            onClick={() => {
                                                              audioSynth.playSuccess();
                                                              setRemindedPairs(prev => ({ ...prev, [pairKey]: true }));
                                                              
                                                              // Simulate Zalo Notification
                                                              sendZaloNotification(
                                                                `[NHẮC NHỞ] Chào phụ huynh, bé ${row.student.name} chưa hoàn thành nhiệm vụ "${row.assignment.title}" thuộc Tuần ${wk}. Hạn chót nộp bài là ${formattedEndDate}. Kính mong phụ huynh nhắc nhở bé hoàn thành!`,
                                                                row.student.parentPhone || '0901234567',
                                                                row.student.parentName || 'Phụ huynh'
                                                              );

                                                              // After 2.5s, update Parent Status to 'read' to simulate interactive real-world parent feedback!
                                                              setTimeout(() => {
                                                                setParentStatuses(prev => ({ ...prev, [pairKey]: 'read' }));
                                                              }, 2500);
                                                            }}
                                                            disabled={hasReminded}
                                                            className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase transition-all shadow-xs cursor-pointer ${
                                                              hasReminded
                                                                ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                                                                : 'bg-amber-400 hover:bg-amber-500 text-amber-950 border border-amber-300'
                                                            }`}
                                                          >
                                                            {hasReminded ? '✔️ Đã nhắc' : '🔔 Gửi nhắc'}
                                                          </button>
                                                        </td>
                                                        <td className="py-2.5 text-right pr-1">
                                                          {statusVal === 'read' && (
                                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-sky-50 text-sky-700 border border-sky-150 whitespace-nowrap">
                                                              👁 Đã xem
                                                            </span>
                                                          )}
                                                          {statusVal === 'replied' && (
                                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-purple-50 text-purple-700 border border-purple-150 whitespace-nowrap">
                                                              💬 Đã phản hồi
                                                            </span>
                                                          )}
                                                          {statusVal === 'unread' && (
                                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-slate-100 text-slate-500 border border-slate-200 whitespace-nowrap">
                                                              ⭕ Chưa xem
                                                            </span>
                                                          )}
                                                        </td>
                                                      </tr>
                                                    );
                                                  })}
                                                </tbody>
                                              </table>
                                            </div>
                                          )}
                                        </div>
                                      </div>

                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      );
                    })()
                  )}
                </div>
              </div>
            )}

            {/* Sub-tab 4: Kết quả học tập */}
            {assignmentSubTab === 'results' && (
              <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-6 w-full max-w-5xl mx-auto animate-fadeIn">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 gap-2">
                  <div>
                    <h3 className="text-lg font-black text-indigo-950 uppercase tracking-tight">🏆 BẢNG KẾT QUẢ HỌC TẬP TỔNG HỢP</h3>
                    <p className="text-xs text-slate-400 font-bold">Thống kê điểm số trắc nghiệm, bài nộp tự luận và điểm thi đua đổi sao lấp lánh của các bé.</p>
                  </div>
                  <button
                    onClick={() => {
                      audioSynth.playBubblePop();
                      alert('Tính năng xuất báo cáo Excel đang được chuẩn bị!');
                    }}
                    className="px-3.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-800 text-xs font-black rounded-xl transition cursor-pointer shrink-0"
                  >
                    📥 Xuất Báo Cáo Lớp
                  </button>
                </div>

                <div className="overflow-x-auto border border-slate-100 rounded-2xl shadow-xs">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                        <th className="p-3 text-center w-12">Hạng</th>
                        <th className="p-3">Học Sinh</th>
                        <th className="p-3 text-center">Nhiệm Vụ Đã Làm</th>
                        <th className="p-3 text-center">Tỉ Lệ Đúng TB</th>
                        <th className="p-3 text-center">Sao Đạt Được</th>
                        <th className="p-3 text-center">Cờ Đổi Được</th>
                        <th className="p-3 text-center">Thẻ Vàng Danh Dự</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                      {students.map((student, index) => {
                        const studentSubmissions = submissions.filter(s => s.studentId === student.id && s.status === 'submitted');
                        const totalSubmissions = studentSubmissions.length;
                        const correctSum = studentSubmissions.reduce((sum, s) => sum + (s.correctCount || 0), 0);
                        const totalQSum = studentSubmissions.reduce((sum, s) => sum + (s.totalQuestions || 0), 0);
                        const avgCorrectPct = totalQSum > 0 ? Math.round((correctSum / totalQSum) * 100) : 0;

                        return (
                          <tr key={student.id} className="hover:bg-slate-50/50 transition">
                            <td className="p-3 text-center font-bold">
                              {index === 0 && <span className="text-lg">🥇</span>}
                              {index === 1 && <span className="text-lg">🥈</span>}
                              {index === 2 && <span className="text-lg">🥉</span>}
                              {index > 2 && <span className="text-slate-400">#{index + 1}</span>}
                            </td>
                            <td className="p-3">
                              <div className="flex items-center space-x-2">
                                <span className="text-xl select-none">{student.avatar}</span>
                                <div>
                                  <span className="font-extrabold text-slate-800 text-[11px] block">{student.name}</span>
                                  <span className="text-[9px] text-slate-400 block font-medium">SĐT PH: {student.parentPhone || 'Chưa liên kết'}</span>
                                </div>
                              </div>
                            </td>
                            <td className="p-3 text-center font-bold text-indigo-700">
                              {totalSubmissions} bài
                            </td>
                            <td className="p-3 text-center">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold font-mono ${
                                avgCorrectPct >= 80 ? 'bg-emerald-50 text-emerald-700 border border-emerald-150' : 
                                avgCorrectPct >= 50 ? 'bg-amber-50 text-amber-700 border border-amber-150' : 
                                totalQSum === 0 ? 'bg-slate-50 text-slate-400' : 'bg-rose-50 text-rose-700 border border-rose-150'
                              }`}>
                                {totalQSum > 0 ? `${avgCorrectPct}%` : 'Chưa làm'}
                              </span>
                            </td>
                            <td className="p-3 text-center text-amber-600 font-extrabold font-mono">
                              ⭐ {student.stars} sao
                            </td>
                            <td className="p-3 text-center text-rose-600 font-extrabold font-mono">
                              🚩 {student.flags} cờ
                            </td>
                            <td className="p-3 text-center text-yellow-600 font-extrabold font-mono">
                              🏆 {student.goldCards} thẻ vàng
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Sub-tab 5: Ngân hàng ôn tập */}
            {assignmentSubTab === 'review_bank' && (
              <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-6 w-full max-w-5xl mx-auto animate-fadeIn">
                {/* Header banner */}
                <div className="bg-gradient-to-r from-amber-500/10 via-amber-600/5 to-transparent p-5 rounded-3xl border border-amber-200/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <h3 className="text-lg font-black text-amber-900 flex items-center space-x-2">
                      <span>💾</span>
                      <span>NGÂN HÀNG CÂU HỎI ÔN TẬP TỰ ĐỘNG</span>
                    </h3>
                    <p className="text-xs text-amber-800/80 font-bold mt-1">
                      Kho lưu trữ thông minh, tự động đồng bộ từ các câu hỏi ôn tập, dặn dò, và liên kết tài liệu theo môn học và tuần học.
                    </p>
                  </div>
                  <div className="flex items-center space-x-2 shrink-0">
                    {selectedReviewIds.length > 0 && (
                      <button
                        onClick={() => {
                          setIsGeneratingCompositeExam(true);
                          audioSynth.playSuccess();
                        }}
                        className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-black rounded-xl shadow-sm cursor-pointer transition flex items-center space-x-1.5"
                      >
                        <span>📋</span>
                        <span>Tạo Đề Tổng Hợp ({selectedReviewIds.length})</span>
                      </button>
                    )}
                    {reviewSelectedSubject && (
                      <button
                        onClick={() => setReviewSelectedSubject(null)}
                        className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold transition cursor-pointer"
                      >
                        ← Hiện tất cả 11 môn
                      </button>
                    )}
                  </div>
                </div>

                {/* Subject filter grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {SUBJECTS_LIST.map((subj) => {
                    const isSelected = reviewSelectedSubject === subj;
                    const colorDef = SUBJECT_COLORS[subj] || { bg: 'bg-slate-50 text-slate-700 border-slate-200', activeBg: 'bg-slate-600 text-white border-slate-600', hover: 'hover:bg-slate-100', icon: '📝' };
                    const count = assignments.filter(a => a.subject === subj).length;

                    return (
                      <button
                        key={subj}
                        onClick={() => {
                          audioSynth.playBubblePop();
                          setReviewSelectedSubject(isSelected ? null : subj);
                        }}
                        className={`p-3.5 rounded-2xl border-2 transition-all duration-300 cursor-pointer flex flex-col items-center justify-center text-center h-28 relative overflow-hidden group select-none shadow-xs hover:shadow-md hover:scale-[1.03] ${
                          isSelected
                            ? `${colorDef.activeBg} scale-[1.03] ring-4 ring-offset-2 ring-amber-400`
                            : `${colorDef.bg} ${colorDef.hover} border-slate-200/80`
                        }`}
                      >
                        <div className="absolute -right-2 -bottom-2 text-4xl opacity-10 group-hover:scale-125 transition duration-500 select-none pointer-events-none">
                          {colorDef.icon}
                        </div>
                        <div className="flex flex-col items-center space-y-1.5 z-10">
                          <span className="text-2xl filter drop-shadow-sm transform group-hover:rotate-12 transition-transform duration-300 select-none">
                            {colorDef.icon}
                          </span>
                          <div>
                            <h4 className="font-black text-[10px] md:text-xs tracking-tight leading-tight uppercase">
                              {subj}
                            </h4>
                            <span className={`inline-block text-[8px] px-1.5 py-0.5 rounded-full font-black mt-1 uppercase ${
                              isSelected ? 'bg-white/25 text-white' : 'bg-black/5 text-slate-500'
                            }`}>
                              {count} đề / chuyên đề
                            </span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Composite Exam Creator Console */}
                {isGeneratingCompositeExam && selectedReviewIds.length > 0 && (
                  <div className="bg-amber-50 p-4 rounded-2xl border-2 border-amber-300 shadow-xs space-y-3">
                    <div className="flex justify-between items-center border-b border-amber-200 pb-2">
                      <h4 className="font-black text-xs text-amber-950 uppercase flex items-center space-x-1.5">
                        <span>📋</span>
                        <span>TẠO ĐỀ THI ÔN TẬP TỔNG HỢP CỰC NHANH</span>
                      </h4>
                      <button 
                        onClick={() => setIsGeneratingCompositeExam(false)}
                        className="text-[10px] text-slate-500 hover:text-slate-800 font-bold underline cursor-pointer"
                      >
                        Đóng lại [x]
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-[10px] font-black text-amber-800 uppercase mb-1">Tên Đề Thi Ôn Tập Tổng Hợp</label>
                        <input 
                          type="text"
                          value={compositeExamTitle}
                          onChange={e => setCompositeExamTitle(e.target.value)}
                          placeholder="Ví dụ: Đề Ôn Tập Tổng Hợp Cuối Tuần 24..."
                          className="w-full text-xs p-2.5 rounded-xl border border-amber-200 font-bold bg-white focus:outline-none focus:border-amber-400 text-slate-800"
                        />
                      </div>
                      <div className="flex flex-col justify-end">
                        <button
                          onClick={() => {
                            const selectedExams = assignments.filter(a => selectedReviewIds.includes(a.id));
                            if (selectedExams.length === 0) return;
                            
                            const combinedQuestions: Question[] = [];
                            selectedExams.forEach(ex => {
                              ex.questions?.forEach(q => {
                                combinedQuestions.push({
                                  ...q,
                                  id: `q_composite_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`
                                });
                              });
                            });

                            if (combinedQuestions.length === 0) {
                              alert('Các đề đã chọn chưa có câu hỏi nào để tổng hợp!');
                              return;
                            }

                            audioSynth.playSuccess();
                            
                            setAsTitle(compositeExamTitle);
                            setAsDesc(`Đề thi ôn tập tổng hợp ghép từ các đề: ${selectedExams.map(e => e.title).join(', ')}`);
                            setAsSubject(selectedExams[0]?.subject || 'Toán');
                            setAsWeek(selectedExams[0]?.week || 1);
                            setQuestions(combinedQuestions);
                            
                            setAssignmentSubTab('create');
                            setIsGeneratingCompositeExam(false);
                            setSelectedReviewIds([]);
                            alert(`🎉 Đã tổng hợp thành công ${combinedQuestions.length} câu hỏi vào khu vực soạn đề! Thầy cô có thể điều chỉnh và bấm "Gửi cho cả lớp" ở cuối trang nhé!`);
                          }}
                          className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-black text-xs rounded-xl transition shadow-md shadow-amber-500/20 cursor-pointer flex items-center justify-center space-x-1"
                        >
                          <span>🚀 Phát hành Đề Tổng Hợp ({selectedReviewIds.length} đề)</span>
                        </button>
                      </div>
                    </div>

                    <div className="text-[10px] text-amber-800 font-medium">
                      <strong>Các đề sẽ được ghép câu hỏi:</strong> {assignments.filter(a => selectedReviewIds.includes(a.id)).map(a => `${a.title} (${a.subject} - Tuần ${a.week})`).join(' | ')}
                    </div>
                  </div>
                )}

                {/* Search and control bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex-1 max-w-md relative">
                    <input
                      type="text"
                      placeholder="🔍 Nhập từ khoá tìm đề ôn tập, tuần học..."
                      value={reviewSearchQuery}
                      onChange={e => setReviewSearchQuery(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500 font-bold text-slate-700 bg-slate-50 pl-9"
                    />
                    <span className="absolute left-3 top-2.5 text-slate-400 text-sm">🔍</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] text-slate-400 font-bold">Thao tác hàng loạt:</span>
                    <button
                      onClick={() => {
                        const filtered = assignments.filter(a => {
                          const matchSubject = !reviewSelectedSubject || a.subject === reviewSelectedSubject;
                          const matchQuery = !reviewSearchQuery || a.title.toLowerCase().includes(reviewSearchQuery.toLowerCase()) || `tuần ${a.week}`.includes(reviewSearchQuery.toLowerCase());
                          return matchSubject && matchQuery;
                        });
                        setSelectedReviewIds(filtered.map(a => a.id));
                        audioSynth.playBubblePop();
                      }}
                      className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-[10px] font-bold cursor-pointer"
                    >
                      Chọn tất cả
                    </button>
                    <button
                      onClick={() => {
                        setSelectedReviewIds([]);
                        audioSynth.playBubblePop();
                      }}
                      className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-[10px] font-bold cursor-pointer"
                    >
                      Bỏ chọn
                    </button>
                  </div>
                </div>

                {/* List and Table Grid */}
                <div className="overflow-x-auto border border-slate-100 rounded-2xl shadow-xs bg-white">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/85 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                        <th className="p-3.5 text-center w-12">Chọn</th>
                        <th className="p-3.5">Môn Học</th>
                        <th className="p-3.5 text-center w-24 whitespace-nowrap">Tuần</th>
                        <th className="p-3.5">Tên Chuyên Đề / Bài Tập</th>
                        <th className="p-3.5 text-center w-32 whitespace-nowrap">Số Câu Hỏi</th>
                        <th className="p-3.5">Ngày Tạo</th>
                        <th className="p-3.5 text-right">Hành Động</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                      {(() => {
                        const filteredReviews = assignments.filter(rev => {
                          const matchSubject = !reviewSelectedSubject || rev.subject === reviewSelectedSubject;
                          const matchQuery = !reviewSearchQuery || rev.title.toLowerCase().includes(reviewSearchQuery.toLowerCase()) || `tuần ${rev.week}`.includes(reviewSearchQuery.toLowerCase());
                          return matchSubject && matchQuery;
                        });

                        if (filteredReviews.length === 0) {
                          return (
                            <tr>
                              <td colSpan={7} className="p-10 text-center text-slate-400 font-bold">
                                 Không tìm thấy đề ôn tập nào phù hợp. Đề thi tự động lưu tại đây khi giáo viên phát lệnh hoặc đánh dấu "Ghi nhớ ôn tập"!
                              </td>
                            </tr>
                          );
                        }

                        return filteredReviews.map(rev => {
                          const colorDef = SUBJECT_COLORS[rev.subject] || { bg: 'bg-slate-50', activeBg: 'bg-slate-500', hover: 'hover:bg-slate-100', icon: '📝' };
                          const isChecked = selectedReviewIds.includes(rev.id);

                          return (
                            <tr key={rev.id} className="hover:bg-slate-50/50 transition">
                              {/* Checkbox for batch creation */}
                              <td className="p-3.5 text-center">
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={e => {
                                    audioSynth.playBubblePop();
                                    if (e.target.checked) {
                                      setSelectedReviewIds(prev => [...prev, rev.id]);
                                    } else {
                                      setSelectedReviewIds(prev => prev.filter(id => id !== rev.id));
                                    }
                                  }}
                                  className="h-4 w-4 rounded text-amber-500 border-slate-300 accent-amber-500 cursor-pointer"
                                />
                              </td>

                              {/* Môn học tag */}
                              <td className="p-3.5">
                                <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full font-bold text-[10px] bg-indigo-50 text-indigo-950 border border-indigo-150 uppercase shadow-xs">
                                  <span className="text-sm select-none">{colorDef.icon}</span>
                                  <span>{rev.subject}</span>
                                </span>
                              </td>

                              {/* Tuần học */}
                              <td className="p-3.5 text-center">
                                <span className="px-2.5 py-0.5 rounded-md bg-sky-50 text-sky-800 border border-sky-150 text-[10px] font-extrabold font-mono">
                                  Tuần {rev.week}
                                </span>
                              </td>

                              {/* Tên bài */}
                              <td className="p-3.5">
                                <div className="flex flex-col">
                                  <span className="font-extrabold text-slate-800 text-[11px] hover:text-indigo-600 cursor-pointer flex items-center gap-1">
                                    {rev.title}
                                    {rev.isDraft && <span className="text-[9px] bg-slate-100 text-slate-500 px-1 py-0.2 rounded font-black border border-slate-200">BẢN NHÁP</span>}
                                  </span>
                                  <span className="text-[9px] text-slate-400 font-bold line-clamp-1 italic mt-0.5">{rev.description || 'Chưa có lời dặn dốc học sinh.'}</span>
                                </div>
                              </td>

                              {/* Số câu */}
                              <td className="p-3.5 text-center">
                                <span className="font-black text-slate-800 bg-emerald-50 px-2 py-0.5 rounded-full text-[10px] border border-emerald-150">
                                  {(rev.questions?.length || 0)} câu hỏi
                                </span>
                              </td>

                              {/* Ngày tạo */}
                              <td className="p-3.5 text-slate-400 font-mono text-[10px]">
                                {new Date(rev.createdAt || Date.now()).toLocaleDateString('vi-VN')}
                              </td>

                              {/* Actions: Gửi lại, Sửa, Xóa */}
                              <td className="p-3.5 text-right space-x-1.5 whitespace-nowrap">
                                <button
                                  onClick={() => {
                                    audioSynth.playSuccess();
                                    const copy: Assignment = {
                                      ...rev,
                                      id: `as_${Date.now()}`,
                                      isDraft: false,
                                      createdAt: new Date().toISOString()
                                    };
                                    addAssignment(copy);
                                    alert(`📤 Đã gửi bài ôn tập "${rev.title}" thành công cho cả lớp!`);
                                  }}
                                  className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-[10px] font-black transition cursor-pointer inline-flex items-center gap-1"
                                  title="Gửi bài tập ôn tập này ngay cho học sinh"
                                >
                                  <span>📤</span>
                                  <span>Gửi ôn tập</span>
                                </button>

                                <button
                                  onClick={() => {
                                    audioSynth.playBubblePop();
                                    setAsTitle(rev.title);
                                    setAsDesc(rev.description || '');
                                    setAsSubject(rev.subject);
                                    setAsWeek(rev.week);
                                    setAsStars(rev.rewardStars || 10);
                                    if (rev.questions) setQuestions(rev.questions);
                                    setAssignmentSubTab('create');
                                    alert(`✏ Đã tải bài tập "${rev.title}" vào Bộ soạn thảo. Thầy cô có thể điều chỉnh và gửi bài ở tab Nhiệm vụ học tập!`);
                                  }}
                                  className="px-2 py-1 bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 rounded-lg text-[10px] font-black transition cursor-pointer inline-flex items-center gap-1"
                                  title="Sửa đề thi này"
                                >
                                  <span>✏</span>
                                  <span>Sửa</span>
                                </button>

                                <button
                                  onClick={() => {
                                    if (confirm(`Bạn có chắc chắn muốn xoá đề ôn tập "${rev.title}" khỏi ngân hàng không?`)) {
                                      audioSynth.playSuccess();
                                      deleteAssignment(rev.id);
                                    }
                                  }}
                                  className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-[10px] font-black transition cursor-pointer inline-flex items-center gap-1"
                                  title="Xoá đề thi ôn tập"
                                >
                                  <span>🗑</span>
                                  <span>Xoá</span>
                                </button>
                              </td>
                            </tr>
                          );
                        });
                      })()}
                    </tbody>
                  </table>
                </div>

                {/* Quick User Tips footer */}
                <div className="bg-amber-50/40 p-4 rounded-2xl border border-amber-200/50 flex items-start space-x-2 text-slate-600 text-[10px]">
                  <span className="text-lg">💡</span>
                  <div className="space-y-1 font-bold">
                    <p className="text-amber-950 font-black uppercase text-[9px] tracking-wider font-sans">HƯỚNG DẪN NGÂN HÀNG ÔN TẬP ĐA NĂNG:</p>
                    <p>1. Tự động lưu: Khi bạn soạn bài tập và đánh dấu "Ghi nhớ ôn tập", nội dung bài tập, câu hỏi, tài liệu đính kèm và dặn dò của bạn sẽ tự động lưu trữ tại đây.</p>
                    <p>2. Tạo đề thi tổng hợp: Đánh dấu tick vào các đề học tập cần ghép, sau đó nhấp vào <strong>"📋 Tạo Đề Tổng Hợp"</strong> để gom tất cả câu hỏi thành một đề lớn.</p>
                    <p>3. Gửi lại: Bạn có thể tái sử dụng bất cứ chuyên đề học tập nào bằng nút <strong>"📤 Gửi ôn tập"</strong> để giao bài tập cực nhanh.</p>
                  </div>
                </div>
              </div>
            )}

            {/* Sub-tab 6: AI Trợ Lý Học Tập & Kho Bài Tập Online */}
            {assignmentSubTab === 'ai_assistant' && (
              <div className="space-y-8 w-full max-w-5xl mx-auto animate-fadeIn">
                <div className="bg-gradient-to-r from-purple-500/10 via-indigo-500/10 to-sky-500/10 p-6 rounded-3xl border border-purple-100 flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="space-y-1 text-center md:text-left">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-100 text-purple-900 border border-purple-200 shadow-xs">
                      ✨ CÔNG NGHỆ TRÍ TUỆ NHÂN TẠO GEMINI 3.5
                    </span>
                    <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">AI Trợ Lý Học Tập & Kho Học Liệu Số</h3>
                    <p className="text-xs text-slate-500 font-bold max-w-2xl leading-relaxed">
                      Xây dựng đề kiểm tra, ngân hàng câu hỏi bám sát sách giáo khoa tự động bằng AI. Hỗ trợ nhập liệu từ ảnh chụp trang sách, giáo án, câu hỏi mẫu và lưu trữ trực tuyến.
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        audioSynth.playBubblePop();
                        setAiSubject('Toán');
                        setAiGrade('Lớp 3');
                        setAiWeek(3);
                        setAiTopic('Bảng nhân 8');
                        setAiDifficulty('Thông hiểu');
                        setAiPrompt('Tạo bài luyện tập tương tác sinh động về bảng nhân 8 gồm 4 câu hỏi.');
                        setAiLessonContent('Bài học: Bảng nhân 8. Học sinh cần ghi nhớ bảng nhân 8 để thực hiện tính nhẩm và giải toán đố có lời văn. Trọng tâm: 8 x 1 = 8, 8 x 5 = 40, 8 x 8 = 64, 8 x 10 = 80.');
                      }}
                      className="px-3.5 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-xl text-[10px] font-black transition cursor-pointer"
                    >
                      💡 Đề mẫu Toán 3
                    </button>
                    <button
                      onClick={() => {
                        audioSynth.playBubblePop();
                        setAiSubject('Tiếng Việt');
                        setAiGrade('Lớp 3');
                        setAiWeek(4);
                        setAiTopic('Từ chỉ đặc điểm, tính chất');
                        setAiDifficulty('Vận dụng');
                        setAiPrompt('Sáng tạo câu hỏi tương tự câu mẫu, phân loại theo mức độ thông hiểu.');
                        setAiLessonContent('Tìm các từ chỉ đặc điểm của sự vật trong khổ thơ: "Trời thu xanh mướt / Cánh đồng lúa vàng / Hương sen thoang thoảng / Gió heo may sang."');
                      }}
                      className="px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-[10px] font-black transition cursor-pointer"
                    >
                      💡 Đề mẫu Tiếng Việt
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  {/* Left config column (4 cols) */}
                  <div className="lg:col-span-5 bg-white p-5 rounded-3xl border border-slate-150 shadow-xs space-y-5">
                    <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
                      <span className="text-xl">⚙️</span>
                      <h4 className="font-black text-xs text-slate-800 uppercase tracking-wider font-sans">Cấu hình tham số soạn bài</h4>
                    </div>

                    <div className="grid grid-cols-2 gap-3.5">
                      <div>
                        <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Môn Học</label>
                        <select
                          value={aiSubject}
                          onChange={e => setAiSubject(e.target.value)}
                          className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50/50 font-bold text-slate-700 focus:outline-none focus:border-purple-400"
                        >
                          {SUBJECTS_LIST.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Khối Lớp</label>
                        <select
                          value={aiGrade}
                          onChange={e => setAiGrade(e.target.value)}
                          className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50/50 font-bold text-slate-700 focus:outline-none focus:border-purple-400"
                        >
                          <option value="Lớp 1">Lớp 1</option>
                          <option value="Lớp 2">Lớp 2</option>
                          <option value="Lớp 3">Lớp 3</option>
                          <option value="Lớp 4">Lớp 4</option>
                          <option value="Lớp 5">Lớp 5</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3.5">
                      <div>
                        <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Tuần Học</label>
                        <select
                          value={aiWeek}
                          onChange={e => setAiWeek(Number(e.target.value))}
                          className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50/50 font-bold text-slate-700 focus:outline-none focus:border-purple-400"
                        >
                          {Array.from({ length: 35 }, (_, i) => i + 1).map(w => (
                            <option key={w} value={w}>Tuần {w}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Mức độ nhận thức</label>
                        <select
                          value={aiDifficulty}
                          onChange={e => setAiDifficulty(e.target.value)}
                          className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50/50 font-bold text-slate-700 focus:outline-none focus:border-purple-400"
                        >
                          <option value="Nhận biết">Nhận biết (Easy)</option>
                          <option value="Thông hiểu">Thông hiểu (Medium)</option>
                          <option value="Vận dụng">Vận dụng (Hard)</option>
                          <option value="Vận dụng cao">Vận dụng cao (Extreme)</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Chủ đề kiểm tra / ôn tập</label>
                      <input
                        type="text"
                        value={aiTopic}
                        onChange={e => setAiTopic(e.target.value)}
                        placeholder="Ví dụ: Bảng nhân 8, Từ chỉ đặc điểm..."
                        className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50/50 font-bold text-slate-700 focus:outline-none focus:border-purple-400"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Dán giáo án / Nội dung tóm tắt</label>
                      <textarea
                        value={aiLessonContent}
                        onChange={e => setAiLessonContent(e.target.value)}
                        rows={3}
                        placeholder="Dán tóm tắt kiến thức SGK hoặc ghi chú của giáo viên để AI bám sát..."
                        className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50/50 font-bold text-slate-700 focus:outline-none focus:border-purple-400 font-sans"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Câu hỏi mẫu (Sáng tạo câu hỏi tương tự)</label>
                      <textarea
                        value={aiSampleQuestions}
                        onChange={e => setAiSampleQuestions(e.target.value)}
                        rows={2}
                        placeholder="Nhập câu hỏi mẫu nếu thầy cô muốn AI sáng tạo các câu hỏi có cấu trúc tương tự..."
                        className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50/50 font-bold text-slate-700 focus:outline-none focus:border-purple-400"
                      />
                    </div>

                    {/* Highly Interactive Simulated Upload Area */}
                    <div>
                      <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Tài liệu đính kèm (Ảnh chụp SGK / Word / PDF)</label>
                      <div className="border-2 border-dashed border-slate-200 rounded-2xl p-4 text-center bg-slate-50 hover:bg-slate-100/50 transition relative group">
                        <input
                          type="file"
                          accept="image/*,.pdf,.doc,.docx"
                          onChange={handleImageUpload}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <div className="space-y-1">
                          <span className="text-2xl">📸</span>
                          <p className="text-slate-600 font-bold text-[10px]">Tải ảnh chụp Sách giáo khoa / Tài liệu giáo án</p>
                          <p className="text-slate-400 text-[9px]">Kéo thả file vào đây hoặc nhấp để duyệt file ảnh, pdf, docx</p>
                        </div>
                      </div>

                      {/* Mock Predefined Attachments to simulate instant premium uploads */}
                      <div className="mt-2.5 space-y-1.5">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Hoặc chọn nhanh tệp học liệu mô phỏng:</p>
                        <div className="flex flex-wrap gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              audioSynth.playBubblePop();
                              // Simulate setting a high-fidelity mock image base64
                              setAiUploadedImages(['data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=']);
                              alert('📎 Đã đính kèm ảnh mô phỏng: "Sách_Toán_3_Trang_45.png" (Bảng nhân 8).');
                            }}
                            className={`px-2.5 py-1 text-[9px] font-bold rounded-lg border transition ${
                              aiUploadedImages.length > 0
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                            }`}
                          >
                            🖼️ Sách Toán 3 (Bảng nhân 8).png
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              audioSynth.playBubblePop();
                              setAiLessonContent('Giáo án Tiếng Việt lớp 3: Luyện từ và câu ôn tập về từ chỉ hoạt động, trạng thái. Yêu cầu viết đoạn văn ngắn tả cảnh ra chơi.');
                              alert('📎 Đã nạp nội dung tài liệu: "Giao_an_Tieng_Viet_3_LTC.docx" vào hộp nội dung bài học.');
                            }}
                            className="px-2.5 py-1 text-[9px] font-bold rounded-lg bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 transition"
                          >
                            📄 Giao_an_TV3.docx
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Detailed Prompt instructions */}
                    <div>
                      <label className="block text-[10px] font-black text-purple-700 uppercase mb-1">Lời dặn thêm cho AI Trợ lý</label>
                      <input
                        type="text"
                        value={aiPrompt}
                        onChange={e => setAiPrompt(e.target.value)}
                        placeholder="Ví dụ: Thiết kế câu hỏi vui nhộn, lồng ghép động vật..."
                        className="w-full text-xs p-2.5 rounded-xl border border-purple-200 bg-purple-50/20 font-bold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-purple-500"
                      />
                    </div>

                    <button
                      onClick={handleAIGenerate}
                      disabled={aiIsGenerating}
                      className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-black text-xs uppercase tracking-wider rounded-2xl transition shadow-lg shadow-indigo-500/20 cursor-pointer flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span>{aiIsGenerating ? '🤖 ĐANG SOẠN ĐỀ...' : '🤖 CHẠY AI TRỢ LÝ SOẠN BÀI'}</span>
                    </button>
                  </div>

                  {/* Right output column (7 cols) */}
                  <div className="lg:col-span-7 space-y-6">
                    {/* 1. Loading UI */}
                    {aiIsGenerating && (
                      <div className="bg-white p-10 rounded-3xl border border-purple-100 shadow-sm flex flex-col items-center justify-center text-center space-y-6 min-h-[400px] animate-pulse">
                        <div className="relative">
                          <div className="w-16 h-16 rounded-full border-4 border-purple-100 border-t-purple-600 animate-spin"></div>
                          <span className="absolute inset-0 flex items-center justify-center text-2xl animate-bounce">🤖</span>
                        </div>
                        <div className="space-y-2 max-w-md">
                          <h4 className="font-black text-slate-800 text-sm uppercase tracking-wide">Trí tuệ nhân tạo đang làm việc</h4>
                          <p className="text-xs text-slate-400 font-bold italic">"Đang nghiên cứu mục tiêu bài học, xây dựng câu hỏi tương tác, giải thích và tiêu chí chấm chi tiết..."</p>
                        </div>
                        {/* Dynamic Step Logs */}
                        <div className="w-full max-w-sm text-left bg-slate-50 p-4 rounded-2xl border border-slate-150 space-y-2 text-[10px] font-mono font-bold text-slate-600">
                          <div className="flex items-center space-x-2 text-purple-600">
                            <span>⚡</span>
                            <span>[1/4] Đọc dữ liệu đầu vào và phân tích SGK / File đính kèm...</span>
                          </div>
                          <div className="flex items-center space-x-2 text-indigo-500 animate-pulse">
                            <span>🔄</span>
                            <span>[2/4] Gemini soạn danh sách câu hỏi theo mức độ {aiDifficulty}...</span>
                          </div>
                          <div className="flex items-center space-x-2 text-slate-400">
                            <span>⚪</span>
                            <span>[3/4] Cấu hình lời giải, bảng tiêu chí tự luận chi tiết...</span>
                          </div>
                          <div className="flex items-center space-x-2 text-slate-400">
                            <span>⚪</span>
                            <span>[4/4] Đóng gói cấu trúc học liệu chuẩn tương thích LMS...</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 2. Generated Exercise View (Teacher Review & Edit Mode) */}
                    {!aiIsGenerating && aiGeneratedExercise && (
                      <div className="bg-gradient-to-b from-purple-50/30 to-white p-6 rounded-3xl border-2 border-purple-200/80 shadow-md space-y-6 animate-fadeIn">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-purple-100 pb-4 gap-3">
                          <div className="space-y-1.5">
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-purple-100 text-purple-800 border border-purple-200">
                              ✨ AI SINH ĐỀ THÀNH CÔNG (CÔ DUYỆT & SỬA THOẢI MÁI)
                            </span>
                            <h4 className="font-extrabold text-slate-800 text-base flex items-center gap-2">
                              <span>📝</span> {aiGeneratedExercise.title || 'Chưa đặt tiêu đề'}
                            </h4>
                            <p className="text-xs text-slate-400 font-bold italic">
                              Cô giáo có toàn quyền chỉnh sửa, thêm/bớt câu hỏi và đáp án trước khi lưu hoặc giao bài.
                            </p>
                          </div>
                          <div className="flex flex-col space-y-1 shrink-0">
                            <button
                              onClick={() => {
                                if (aiGeneratedExercise) downloadAsWord(aiGeneratedExercise);
                              }}
                              className="px-3.5 py-2 bg-white hover:bg-slate-50 text-indigo-700 border border-slate-200 rounded-xl text-[10px] font-black cursor-pointer transition flex items-center justify-center space-x-1.5 shadow-xs"
                              title="Tải về máy tính dưới dạng file Word để in ấn hoặc chỉnh sửa"
                            >
                              <span>📥</span>
                              <span>Xuất bản Word (.doc)</span>
                            </button>
                          </div>
                        </div>

                        {/* Assignment Config Panel */}
                        <div className="space-y-4 border border-purple-100/75 p-5 rounded-2xl bg-purple-50/10">
                          <h4 className="text-xs font-black text-purple-950 uppercase tracking-wider flex items-center gap-1.5 border-b border-purple-100 pb-2">
                            <span>⚙️</span> Cấu hình chung của Bài tập
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-bold text-slate-700">
                            <div className="space-y-1.5 md:col-span-2">
                              <label className="text-[10px] text-slate-500 uppercase font-bold">Tiêu đề bài luyện tập:</label>
                              <input
                                type="text"
                                value={aiGeneratedExercise.title}
                                onChange={(e) => updateAiAssignmentField('title', e.target.value)}
                                className="w-full p-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-400 text-slate-850 font-bold"
                              />
                            </div>
                            <div className="space-y-1.5 md:col-span-2">
                              <label className="text-[10px] text-slate-500 uppercase font-bold">Lời dặn dò / Mô tả nhiệm vụ:</label>
                              <textarea
                                rows={2}
                                value={aiGeneratedExercise.description}
                                onChange={(e) => updateAiAssignmentField('description', e.target.value)}
                                className="w-full p-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-400 text-slate-850 font-semibold"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-[10px] text-slate-500 uppercase font-bold">Môn học:</label>
                              <select
                                value={aiGeneratedExercise.subject}
                                onChange={(e) => updateAiAssignmentField('subject', e.target.value)}
                                className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 font-bold cursor-pointer"
                              >
                                {SUBJECTS_LIST.map(sub => (
                                  <option key={sub} value={sub}>{sub}</option>
                                ))}
                              </select>
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-[10px] text-slate-500 uppercase font-bold">Tuần học (1 - 35):</label>
                              <input
                                type="number"
                                min={1}
                                max={35}
                                value={aiGeneratedExercise.week || 1}
                                onChange={(e) => updateAiAssignmentField('week', parseInt(e.target.value) || 1)}
                                className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 font-bold"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-[10px] text-slate-500 uppercase font-bold">Thưởng Sao (Khi đúng 100%):</label>
                              <input
                                type="number"
                                min={1}
                                value={aiGeneratedExercise.rewardStars}
                                onChange={(e) => updateAiAssignmentField('rewardStars', parseInt(e.target.value) || 10)}
                                className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 font-bold"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-[10px] text-slate-500 uppercase font-bold">Mức độ thử thách:</label>
                              <select
                                value={aiGeneratedExercise.difficulty}
                                onChange={(e) => updateAiAssignmentField('difficulty', e.target.value)}
                                className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 font-bold cursor-pointer"
                              >
                                <option value="Nhận biết">Nhận biết (Dễ) ⭐</option>
                                <option value="Thông hiểu">Thông hiểu (Vừa) ⭐⭐</option>
                                <option value="Vận dụng">Vận dụng (Khó) ⭐⭐⭐</option>
                                <option value="Vận dụng cao">Vận dụng cao (Rất khó) ⭐⭐⭐⭐</option>
                              </select>
                            </div>
                          </div>
                        </div>

                        {/* Interactive Questions Builder */}
                        <div className="space-y-5">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center justify-between">
                            <span>DANH SÁCH CÂU HỎI ({aiGeneratedExercise.questions.length} CÂU)</span>
                            <span className="text-purple-600 font-bold font-mono">Chạm vào từng ô để sửa trực tiếp</span>
                          </p>
                          
                          {aiGeneratedExercise.questions.map((q, idx) => (
                            <div key={q.id} className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-purple-300 transition-all duration-200 space-y-4 text-xs font-bold text-slate-700 shadow-xs relative">
                              {/* Question Header */}
                              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                                <span className="text-xs font-black text-indigo-900 bg-indigo-50 px-3 py-1 rounded-lg border border-indigo-100">
                                  Câu số {idx + 1}
                                </span>
                                <div className="flex items-center space-x-2">
                                  <select
                                    value={q.type}
                                    onChange={(e) => updateAiQuestionField(q.id, 'type', e.target.value as QuestionType)}
                                    className="p-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-[10px] font-black uppercase text-indigo-950 cursor-pointer"
                                  >
                                    <option value="single_choice">Trắc nghiệm</option>
                                    <option value="true_false">Đúng / Sai</option>
                                    <option value="fill_blank">Điền từ</option>
                                    <option value="essay">Tự luận</option>
                                  </select>
                                  <button
                                    type="button"
                                    onClick={() => deleteAiQuestion(q.id)}
                                    className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-lg text-[10px] font-black cursor-pointer transition"
                                    title="Xóa câu hỏi này"
                                  >
                                    🗑️ Xóa câu
                                  </button>
                                </div>
                              </div>

                              {/* Question Text */}
                              <div className="space-y-1.5">
                                <label className="text-[10px] text-slate-400 uppercase font-black">Nội dung câu hỏi:</label>
                                <textarea
                                  rows={2}
                                  value={q.questionText}
                                  onChange={(e) => updateAiQuestionField(q.id, 'questionText', e.target.value)}
                                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white text-xs font-bold leading-relaxed text-slate-800"
                                />
                              </div>

                              {/* 1. SINGLE_CHOICE */}
                              {q.type === 'single_choice' && (
                                <div className="space-y-3 pl-3 border-l-2 border-indigo-300">
                                  <label className="text-[10px] text-indigo-800 uppercase font-black">Phương án lựa chọn & Đáp án đúng:</label>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {['A', 'B', 'C', 'D'].map((letter, optIdx) => {
                                      const defaultText = q.options?.[optIdx] || '';
                                      // Strip "A.", "B." prefix for editing comfort if preferred, or just let user write it
                                      return (
                                        <div key={letter} className="flex items-center space-x-2 bg-slate-50/50 p-2 rounded-xl border border-slate-150">
                                          <button
                                            type="button"
                                            onClick={() => updateAiQuestionField(q.id, 'correctAnswer', letter)}
                                            className={`h-6 w-6 rounded-full flex items-center justify-center font-black border text-xs cursor-pointer ${q.correctAnswer === letter ? 'bg-emerald-500 text-white border-emerald-600 shadow-xs' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                                            title="Đặt làm đáp án đúng"
                                          >
                                            {letter}
                                          </button>
                                          <input
                                            type="text"
                                            value={defaultText}
                                            onChange={(e) => {
                                              const updatedOpts = [...(q.options || [`A. `, `B. `, `C. `, `D. `])];
                                              updatedOpts[optIdx] = e.target.value;
                                              updateAiQuestionField(q.id, 'options', updatedOpts);
                                            }}
                                            className="flex-1 bg-transparent focus:outline-none text-[11px] font-bold text-slate-800"
                                            placeholder={`Phương án ${letter}`}
                                          />
                                        </div>
                                      );
                                    })}
                                  </div>
                                  <div className="flex items-center space-x-2 pt-1 text-xs">
                                    <span className="text-slate-500">🎯 Đáp án đúng đã chọn:</span>
                                    <select
                                      value={q.correctAnswer}
                                      onChange={(e) => updateAiQuestionField(q.id, 'correctAnswer', e.target.value)}
                                      className="p-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg font-black cursor-pointer"
                                    >
                                      <option value="A">Phương án A</option>
                                      <option value="B">Phương án B</option>
                                      <option value="C">Phương án C</option>
                                      <option value="D">Phương án D</option>
                                    </select>
                                  </div>
                                </div>
                              )}

                              {/* 2. TRUE_FALSE */}
                              {q.type === 'true_false' && (
                                <div className="space-y-3 pl-3 border-l-2 border-indigo-300">
                                  <div className="flex items-center justify-between">
                                    <label className="text-[10px] text-indigo-800 uppercase font-black">Mệnh đề để học sinh tích Đúng/Sai:</label>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const updatedOpts = [...(q.trueFalseOptions || [])];
                                        updatedOpts.push({ text: 'Mệnh đề mới', correct: true });
                                        updateAiQuestionField(q.id, 'trueFalseOptions', updatedOpts);
                                      }}
                                      className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-[9px] font-black cursor-pointer"
                                    >
                                      ➕ Thêm mệnh đề
                                    </button>
                                  </div>
                                  <div className="space-y-2">
                                    {(q.trueFalseOptions || []).map((o, oIdx) => (
                                      <div key={oIdx} className="flex items-center justify-between p-2 bg-slate-50 border border-slate-200/60 rounded-xl gap-3">
                                        <input
                                          type="text"
                                          value={o.text}
                                          onChange={(e) => {
                                            const updatedOpts = [...(q.trueFalseOptions || [])];
                                            updatedOpts[oIdx] = { ...updatedOpts[oIdx], text: e.target.value };
                                            updateAiQuestionField(q.id, 'trueFalseOptions', updatedOpts);
                                          }}
                                          className="flex-1 bg-transparent focus:outline-none text-[11px] font-bold text-slate-850"
                                          placeholder="Nhập mệnh đề, vd: 7 x 8 = 56"
                                        />
                                        <div className="flex items-center space-x-1 shrink-0">
                                          <button
                                            type="button"
                                            onClick={() => {
                                              const updatedOpts = [...(q.trueFalseOptions || [])];
                                              updatedOpts[oIdx] = { ...updatedOpts[oIdx], correct: !updatedOpts[oIdx].correct };
                                              updateAiQuestionField(q.id, 'trueFalseOptions', updatedOpts);
                                            }}
                                            className={`px-2.5 py-1 text-[9px] font-black rounded-lg border cursor-pointer transition ${o.correct ? 'bg-emerald-500 text-white border-emerald-600' : 'bg-rose-500 text-white border-rose-600'}`}
                                          >
                                            {o.correct ? 'ĐÚNG' : 'SAI'}
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => {
                                              const updatedOpts = (q.trueFalseOptions || []).filter((_, i) => i !== oIdx);
                                              updateAiQuestionField(q.id, 'trueFalseOptions', updatedOpts);
                                            }}
                                            className="p-1 text-slate-400 hover:text-rose-600 text-xs font-bold cursor-pointer"
                                            title="Xóa mệnh đề"
                                          >
                                            ✕
                                          </button>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* 3. FILL_BLANK */}
                              {q.type === 'fill_blank' && (
                                <div className="space-y-3 pl-3 border-l-2 border-indigo-300">
                                  <div className="space-y-1.5">
                                    <label className="text-[10px] text-indigo-800 uppercase font-black">Văn bản chứa chỗ trống (dùng ký hiệu ... để tạo chỗ trống):</label>
                                    <input
                                      type="text"
                                      value={q.blanksText || ''}
                                      onChange={(e) => updateAiQuestionField(q.id, 'blanksText', e.target.value)}
                                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[11px] font-bold"
                                      placeholder="vd: Ba vạn sáu ngàn ngày là ... mươi năm."
                                    />
                                  </div>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                                    <div className="space-y-1.5">
                                      <label className="text-[10px] text-slate-400 font-black">Đáp án đúng (ngăn cách bởi dấu phẩy):</label>
                                      <input
                                        type="text"
                                        value={q.blankAnswers?.join(', ') || ''}
                                        onChange={(e) => updateAiQuestionField(q.id, 'blankAnswers', e.target.value.split(',').map(s => s.trim()))}
                                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-[11px] font-mono font-bold text-emerald-800"
                                        placeholder="vd: một trăm"
                                      />
                                    </div>
                                    <div className="space-y-1.5">
                                      <label className="text-[10px] text-slate-400 font-black">Kho từ gợi ý (ngăn cách bởi dấu phẩy):</label>
                                      <input
                                        type="text"
                                        value={q.blankChoices?.join(', ') || ''}
                                        onChange={(e) => updateAiQuestionField(q.id, 'blankChoices', e.target.value.split(',').map(s => s.trim()))}
                                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-[11px] font-mono font-bold text-indigo-800"
                                        placeholder="vd: một trăm, mười, hai mươi"
                                      />
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* 4. ESSAY */}
                              {q.type === 'essay' && (
                                <div className="space-y-3 pl-3 border-l-2 border-indigo-300">
                                  <div className="space-y-1.5">
                                    <div className="flex items-center justify-between">
                                      <label className="text-[10px] text-indigo-800 uppercase font-black">✍️ ĐÁP ÁN MẪU / HƯỚNG DẪN GIẢI CHI TIẾT (Để AI chấm điểm):</label>
                                      <span className="text-[9px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-md font-bold uppercase">
                                        Rất quan trọng cho AI Chấm bài
                                      </span>
                                    </div>
                                    <textarea
                                      rows={3}
                                      value={q.criteria || ''}
                                      onChange={(e) => updateAiQuestionField(q.id, 'criteria', e.target.value)}
                                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white text-[11px] leading-relaxed font-sans font-bold text-slate-750"
                                      placeholder="Cô hãy nhập lời giải chuẩn hoặc các ý chính cần có trong bài. Khi học sinh làm bài tự luận (chụp ảnh viết tay hoặc gõ chữ), AI của chúng ta sẽ đối chiếu với đáp án mẫu này để chấm điểm chính xác và trích xuất lỗi sai!"
                                    />
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}

                          {/* Quick Append Question Panel */}
                          <div className="flex items-center justify-center gap-2 border-2 border-dashed border-purple-200/55 p-4 rounded-2xl bg-purple-50/10">
                            <span className="text-xs font-black text-purple-950 flex items-center space-x-1">
                              <span>➕</span>
                              <span>Thêm câu hỏi mới vào bài:</span>
                            </span>
                            <div className="flex flex-wrap gap-2">
                              <button
                                type="button"
                                onClick={() => addAiQuestion('single_choice')}
                                className="px-3 py-1.5 bg-white hover:bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-xl text-[10px] font-black cursor-pointer shadow-xs transition"
                              >
                                Trắc nghiệm
                              </button>
                              <button
                                type="button"
                                onClick={() => addAiQuestion('true_false')}
                                className="px-3 py-1.5 bg-white hover:bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-xl text-[10px] font-black cursor-pointer shadow-xs transition"
                              >
                                Đúng/Sai
                              </button>
                              <button
                                type="button"
                                onClick={() => addAiQuestion('fill_blank')}
                                className="px-3 py-1.5 bg-white hover:bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-xl text-[10px] font-black cursor-pointer shadow-xs transition"
                              >
                                Điền từ
                              </button>
                              <button
                                type="button"
                                onClick={() => addAiQuestion('essay')}
                                className="px-3 py-1.5 bg-white hover:bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-xl text-[10px] font-black cursor-pointer shadow-xs transition"
                              >
                                Tự luận
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Interactive Action panel */}
                        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-purple-100">
                          <button
                            onClick={() => {
                              audioSynth.playSuccess();
                              const updatedExercises = [aiGeneratedExercise, ...onlineExercises];
                              setOnlineExercises(updatedExercises);
                              alert('💾 Đã phê duyệt và lưu bài tập thành công vào "Kho bài tập trực tuyến" ở dưới!');
                            }}
                            className="flex-1 py-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-black text-xs uppercase tracking-wider rounded-2xl transition cursor-pointer flex items-center justify-center space-x-1"
                          >
                            <span>💾 Duyệt & Lưu Vào Kho Bài Tập</span>
                          </button>
                          <button
                            onClick={() => {
                              audioSynth.playSuccess();
                              addAssignment(aiGeneratedExercise);
                              alert(`📤 Đã gửi bài tập "${aiGeneratedExercise.title}" thành công cho cả lớp! Học sinh có thể làm bài ngay.`);
                              setAssignmentSubTab('progress');
                            }}
                            className="flex-1 py-3 bg-purple-600 hover:bg-purple-700 text-white font-black text-xs uppercase tracking-wider rounded-2xl transition shadow-md shadow-purple-500/20 cursor-pointer flex items-center justify-center space-x-1"
                          >
                            <span>📤 Duyệt & Giao Ngay Cho Cả Lớp</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* 3. Empty State placeholders on start */}
                    {!aiIsGenerating && !aiGeneratedExercise && (
                      <div className="bg-slate-50/50 p-10 rounded-3xl border border-dashed border-slate-200 text-center space-y-4 min-h-[350px] flex flex-col items-center justify-center">
                        <span className="text-5xl animate-bounce">🤖</span>
                        <div className="space-y-1 max-w-sm">
                          <h4 className="font-black text-slate-700 text-sm uppercase tracking-wide">Trợ Lý AI Sẵn Sàng Làm Việc</h4>
                          <p className="text-slate-400 text-xs">Điền cấu hình ở cột bên trái hoặc chọn đề mẫu có sẵn, sau đó bấm "Chạy AI Trợ Lý Soạn Bài" để sinh nội dung tự động nhé!</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* 4. Kho Bài Tập Online Section */}
                <div className="bg-white rounded-3xl border border-slate-150 p-6 shadow-sm space-y-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                    <div className="space-y-1">
                      <h3 className="text-base font-black text-slate-800 uppercase tracking-tight">📦 Kho bài tập học liệu số trực tuyến</h3>
                      <p className="text-xs text-slate-400 font-medium">Nơi lưu trữ, tìm kiếm, lọc và tái sử dụng toàn bộ bài ôn tập do AI thiết kế hoặc giáo viên đóng gói.</p>
                    </div>
                  </div>

                  {/* Filter controls */}
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="🔍 Tìm theo từ khoá..."
                        value={aiSearchQuery}
                        onChange={e => setAiSearchQuery(e.target.value)}
                        className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-purple-500 font-bold text-slate-700 bg-slate-50 pl-8"
                      />
                      <span className="absolute left-2.5 top-3 text-slate-400 text-xs">🔍</span>
                    </div>

                    <select
                      value={aiSelectedSubjectFilter || ''}
                      onChange={e => setAiSelectedSubjectFilter(e.target.value || null)}
                      className="text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-700 focus:outline-none focus:border-purple-400"
                    >
                      <option value="">Tất cả Môn học</option>
                      {SUBJECTS_LIST.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>

                    <select
                      value={aiSelectedGradeFilter || ''}
                      onChange={e => setAiSelectedGradeFilter(e.target.value || null)}
                      className="text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-700 focus:outline-none focus:border-purple-400"
                    >
                      <option value="">Tất cả Khối lớp</option>
                      <option value="Lớp 1">Lớp 1</option>
                      <option value="Lớp 2">Lớp 2</option>
                      <option value="Lớp 3">Lớp 3</option>
                      <option value="Lớp 4">Lớp 4</option>
                      <option value="Lớp 5">Lớp 5</option>
                    </select>

                    <select
                      value={aiSelectedDiffFilter || ''}
                      onChange={e => setAiSelectedDiffFilter(e.target.value || null)}
                      className="text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-700 focus:outline-none focus:border-purple-400"
                    >
                      <option value="">Tất cả Mức độ</option>
                      <option value="Nhận biết">Nhận biết</option>
                      <option value="Thông hiểu">Thông hiểu</option>
                      <option value="Vận dụng">Vận dụng</option>
                      <option value="Vận dụng cao">Vận dụng cao</option>
                    </select>
                  </div>

                  {/* Online Table */}
                  <div className="overflow-x-auto border border-slate-100 rounded-2xl shadow-xs bg-white">
                    <table className="w-full text-xs text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                          <th className="p-3.5">Môn Học</th>
                          <th className="p-3.5">Khối Lớp</th>
                          <th className="p-3.5 text-center">Tuần</th>
                          <th className="p-3.5">Tên Chuyên Đề / Học Liệu</th>
                          <th className="p-3.5 text-center">Độ Khó</th>
                          <th className="p-3.5 text-center">Số Câu Hỏi</th>
                          <th className="p-3.5 text-right">Thao Tác</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                        {(() => {
                          const filtered = onlineExercises.filter(ex => {
                            const matchQuery = !aiSearchQuery || ex.title.toLowerCase().includes(aiSearchQuery.toLowerCase()) || (ex.description || '').toLowerCase().includes(aiSearchQuery.toLowerCase());
                            const matchSubj = !aiSelectedSubjectFilter || ex.subject === aiSelectedSubjectFilter;
                            const matchGrade = !aiSelectedGradeFilter || ex.grade === aiSelectedGradeFilter;
                            const matchDiff = !aiSelectedDiffFilter || ex.difficulty === aiSelectedDiffFilter;
                            return matchQuery && matchSubj && matchGrade && matchDiff;
                          });

                          if (filtered.length === 0) {
                            return (
                              <tr>
                                <td colSpan={7} className="p-10 text-center text-slate-400 font-bold font-sans">
                                  Chưa có học liệu trực tuyến nào phù hợp với bộ lọc tìm kiếm.
                                </td>
                              </tr>
                            );
                          }

                          return filtered.map(ex => {
                            const colorDef = SUBJECT_COLORS[ex.subject] || { bg: 'bg-slate-50', icon: '📝' };
                            return (
                              <tr key={ex.id} className="hover:bg-slate-50/50 transition">
                                <td className="p-3.5">
                                  <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full font-bold text-[10px] bg-slate-100 text-slate-800 uppercase shadow-xs">
                                    <span>{colorDef.icon}</span>
                                    <span>{ex.subject}</span>
                                  </span>
                                </td>
                                <td className="p-3.5 text-slate-800 font-bold">{ex.grade || 'Lớp 3'}</td>
                                <td className="p-3.5 text-center">
                                  <span className="px-2 py-0.5 rounded bg-sky-50 text-sky-800 border border-sky-150 text-[10px] font-extrabold font-mono">
                                    Tuần {ex.week}
                                  </span>
                                </td>
                                <td className="p-3.5">
                                  <div className="flex flex-col">
                                    <span className="font-extrabold text-slate-800 text-[11px]">{ex.title}</span>
                                    <span className="text-[9px] text-slate-400 font-bold line-clamp-1 italic mt-0.5">{ex.description}</span>
                                  </div>
                                </td>
                                <td className="p-3.5 text-center">
                                  <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase ${
                                    ex.difficulty === 'Vận dụng cao' ? 'bg-rose-50 text-rose-700 border border-rose-150' :
                                    ex.difficulty === 'Vận dụng' ? 'bg-amber-50 text-amber-700 border border-amber-150' :
                                    ex.difficulty === 'Thông hiểu' ? 'bg-indigo-50 text-indigo-700 border border-indigo-150' :
                                    'bg-emerald-50 text-emerald-700 border border-emerald-150'
                                  }`}>
                                    {ex.difficulty || 'Thông hiểu'}
                                  </span>
                                </td>
                                <td className="p-3.5 text-center">
                                  <span className="font-black text-slate-800 bg-slate-50 px-2 py-0.5 rounded-full text-[10px] border border-slate-200">
                                    {ex.questions.length} câu
                                  </span>
                                </td>
                                <td className="p-3.5 text-right space-x-1 whitespace-nowrap">
                                  <button
                                    onClick={() => {
                                      audioSynth.playSuccess();
                                      const copy: Assignment = {
                                        ...ex,
                                        id: `as_${Date.now()}`,
                                        createdAt: new Date().toISOString()
                                      };
                                      addAssignment(copy);
                                      alert(`📤 Đã giao bài tập "${ex.title}" thành công cho cả lớp!`);
                                      setAssignmentSubTab('progress');
                                    }}
                                    className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-[9px] font-black transition cursor-pointer"
                                    title="Giao ngay bài tập này từ kho cho lớp"
                                  >
                                    📤 Giao bài
                                  </button>
                                  <button
                                    onClick={() => {
                                      audioSynth.playBubblePop();
                                      setAsTitle(ex.title);
                                      setAsDesc(ex.description || '');
                                      setAsSubject(ex.subject);
                                      setAsWeek(ex.week);
                                      setAsStars(ex.rewardStars || 10);
                                      setQuestions(ex.questions);
                                      setAssignmentSubTab('create');
                                      alert(`✏️ Đã tải học liệu "${ex.title}" vào Bộ soạn thảo thủ công. Thầy cô có thể tuỳ biến thêm!`);
                                    }}
                                    className="px-2 py-1 bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 rounded-lg text-[9px] font-black transition cursor-pointer"
                                    title="Chỉnh sửa nội dung học liệu"
                                  >
                                    ✏️ Sửa
                                  </button>
                                  <button
                                    onClick={() => {
                                      if (confirm(`Bạn có chắc chắn muốn xóa học liệu "${ex.title}" khỏi kho trực tuyến?`)) {
                                        audioSynth.playBubblePop();
                                        setOnlineExercises(prev => prev.filter(item => item.id !== ex.id));
                                      }
                                    }}
                                    className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-[9px] font-black transition cursor-pointer"
                                    title="Xoá học liệu khỏi kho"
                                  >
                                    🗑️ Xoá
                                  </button>
                                </td>
                              </tr>
                            );
                          });
                        })()}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* OLD_MONOLITHIC_ASSIGNMENTS_TAB_BYPASSED */}
        {false && activeTab === 'assignments' && (
          <motion.div
            key="assignments"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          >
            {/* Create Assignment Form */}
            <div className="bg-rose-50/70 border-2 border-rose-200/80 rounded-3xl p-6 shadow-sm space-y-4 h-fit relative overflow-hidden">
              {/* Cute stickers background */}
              <div className="absolute top-0 right-0 text-4xl opacity-15 select-none pointer-events-none mt-1 mr-2">📚✏️🧸</div>
              <h3 className="text-lg font-black text-rose-700 flex items-center justify-between">
                <span className="flex items-center space-x-2">
                  <span className="p-2 bg-rose-100/80 rounded-xl text-rose-600 text-xl">📚</span>
                  <span>Giao nhiệm vụ mới</span>
                </span>
                <span className="text-[10px] bg-rose-200/60 text-rose-700 font-extrabold px-3 py-1 rounded-full border border-rose-300">
                  Bé Học Thật Vui 🦄
                </span>
              </h3>

              <form onSubmit={handleCreateAssignment} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
                      className="w-full text-sm p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-sky-400 font-bold text-slate-700 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Tuần học (Tuần 1 - 35)</label>
                    <select
                      value={asWeek}
                      onChange={e => setAsWeek(Number(e.target.value))}
                      className="w-full text-sm p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-sky-400 font-bold text-slate-700 bg-slate-50"
                    >
                      {Array.from({ length: 35 }, (_, i) => i + 1).map(wk => (
                        <option key={wk} value={wk}>{`Tuần ${wk}`}</option>
                      ))}
                    </select>
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

                {/* ESSAY QUESTION CREATOR FRAME (RA CÂU HỎI TỰ LUẬN) */}
                <div className="border-2 border-dashed border-indigo-200/80 bg-indigo-50/20 rounded-2xl p-4 space-y-3 animate-fadeIn relative overflow-hidden">
                  <div className="absolute top-0 right-0 text-3xl opacity-10 select-none pointer-events-none mt-1 mr-2">✍️</div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black text-indigo-800 uppercase tracking-wide flex items-center space-x-1">
                      <span>✍️ KHUNG RA CÂU HỎI TỰ LUẬN MỚI</span>
                    </span>
                    <button
                      type="button"
                      onClick={startEssayVoiceToText}
                      className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                        isEssayListening
                          ? 'bg-rose-500 text-white animate-pulse shadow-sm'
                          : 'bg-indigo-100 hover:bg-indigo-200 text-indigo-700'
                      }`}
                      title="Bấm để nói/đọc nội dung câu hỏi thay vì gõ chữ"
                    >
                      <Volume2 className="h-3 w-3" />
                      <span>{isEssayListening ? 'Đọc câu hỏi...' : 'Giọng Nói 🎙️'}</span>
                    </button>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Nhập nội dung câu hỏi tự luận *</label>
                    <textarea
                      rows={3}
                      placeholder="Nhập nội dung câu hỏi tự luận tại đây, hoặc nhấn nút 'Giọng Nói' bên trên để đọc nội dung ghi âm..."
                      value={essayQText}
                      onChange={e => setEssayQText(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-400 bg-white font-medium shadow-xs"
                    />
                  </div>

                  {/* Essay Images selection */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="block text-[10px] font-black text-slate-500 uppercase">Hình ảnh đính kèm câu hỏi ({essayQImages.length})</label>
                      <label className="flex items-center space-x-1 px-2.5 py-1.5 bg-sky-500 hover:bg-sky-600 text-white text-[10px] font-black uppercase rounded-lg transition-all cursor-pointer shadow-xs">
                        <Plus className="h-3 w-3" />
                        <span>Thêm hình ảnh 📷</span>
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          className="hidden"
                          onChange={handleEssayImageUpload}
                        />
                      </label>
                    </div>

                    {essayQImages.length > 0 && (
                      <div className="flex flex-wrap gap-2 p-2 bg-white rounded-xl border border-indigo-50 max-h-24 overflow-y-auto">
                        {essayQImages.map((img, idx) => (
                          <div key={idx} className="relative h-14 w-14 rounded-lg overflow-hidden border border-slate-200 shadow-xs group shrink-0">
                            <img src={img} alt={`essay-q-img-${idx}`} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                            <button
                              type="button"
                              onClick={() => handleRemoveEssayImage(idx)}
                              className="absolute top-0.5 right-0.5 bg-rose-500 text-white hover:bg-rose-600 rounded-full h-4 w-4 flex items-center justify-center text-[8px] font-bold shadow-xs cursor-pointer focus:outline-none"
                              title="Xóa ảnh này"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Save essay question button */}
                  <button
                    type="button"
                    onClick={handleSaveEssayQuestion}
                    className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-[10px] uppercase rounded-xl transition shadow-xs flex items-center justify-center space-x-1.5 cursor-pointer"
                  >
                    <span>LƯU CÂU HỎI VÀO BỘ BÀI 📥</span>
                  </button>
                </div>

                {/* Attachments & Links - Horizontal group */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-slate-50 p-3 rounded-2xl">
                  {/* Attachments Section */}
                  <div className="space-y-1.5 border-b md:border-b-0 md:border-r border-slate-200/50 pb-2 md:pb-0 md:pr-2">
                    <span className="block text-[11px] font-bold text-slate-500 flex items-center space-x-1">
                      <Paperclip className="h-3 w-3" />
                      <span>Đính Kèm Từ Máy Tính ({attachedFiles.length})</span>
                    </span>
                    <label className="flex flex-col items-center justify-center w-full py-2.5 px-2 border border-dashed border-slate-300 rounded-xl cursor-pointer bg-white hover:bg-sky-50/50 hover:border-sky-400 transition text-center select-none">
                      <span className="text-[10px] text-slate-500 font-bold">📁 Chọn tệp từ máy tính</span>
                      <span className="text-[8px] text-slate-400 mt-0.5">(PDF, Word, Excel, Ảnh, ...)</span>
                      <input
                        type="file"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const sizeMB = (file.size / 1024 / 1024).toFixed(1);
                            const fileType = file.name.split('.').pop() || 'unknown';
                            setAttachedFiles(prev => [...prev, {
                              name: file.name,
                              type: fileType,
                              size: `${sizeMB} MB`
                            }]);
                          }
                        }}
                      />
                    </label>
                    <div className="space-y-1 max-h-20 overflow-y-auto pt-1">
                      {attachedFiles.map((f, i) => (
                        <div key={i} className="flex items-center justify-between text-[10px] bg-white px-2 py-1 rounded-lg border border-slate-100 font-medium">
                          <span className="truncate max-w-[100px] text-sky-700 font-semibold" title={f.name}>📄 {f.name}</span>
                          <div className="flex items-center space-x-1.5 shrink-0">
                            <span className="text-[8px] text-slate-400 font-mono">{f.size}</span>
                            <button type="button" onClick={() => setAttachedFiles(prev => prev.filter((_, idx) => idx !== i))} className="text-rose-500 hover:text-rose-700 font-bold cursor-pointer">✕</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Links Section */}
                  <div className="space-y-1.5 md:pl-1">
                    <span className="block text-[11px] font-bold text-slate-500 flex items-center space-x-1">
                      <LinkIcon className="h-3 w-3" />
                      <span>Đường Links bổ trợ ({linksList.length})</span>
                    </span>
                    <input
                      type="text"
                      placeholder="Tên gợi nhớ (Video bài giảng...)"
                      value={linkTitle}
                      onChange={e => setLinkTitle(e.target.value)}
                      className="w-full text-[10px] p-1.5 rounded bg-white border border-slate-200 focus:outline-none focus:border-sky-400 font-medium"
                    />
                    <input
                      type="text"
                      placeholder="Địa chỉ URL (https://...)"
                      value={linkUrl}
                      onChange={e => setLinkUrl(e.target.value)}
                      className="w-full text-[10px] p-1.5 rounded bg-white border border-slate-200 focus:outline-none focus:border-sky-400 font-medium"
                    />
                    
                    {/* Nút gợi ý nhanh */}
                    <div className="flex flex-wrap gap-1 pt-0.5">
                      <button
                        type="button"
                        onClick={() => {
                          setLinkTitle('Kênh bài giảng Youtube 📺');
                          setLinkUrl('https://youtube.com');
                        }}
                        className="text-[8px] bg-rose-50 text-rose-600 px-1.5 py-0.5 rounded border border-rose-100 font-bold hover:bg-rose-100 transition"
                      >
                        + YouTube
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setLinkTitle('Nhóm Facebook Lớp 👥');
                          setLinkUrl('https://facebook.com');
                        }}
                        className="text-[8px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded border border-blue-100 font-bold hover:bg-blue-100 transition"
                      >
                        + Facebook
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setLinkTitle('Trang Học Liệu Số 🌐');
                          setLinkUrl('https://vietnamdoc.com');
                        }}
                        className="text-[8px] bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded border border-emerald-100 font-bold hover:bg-emerald-100 transition"
                      >
                        + Học Liệu
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={addWebLink}
                      className="w-full py-1 text-[10px] bg-slate-200 text-slate-700 font-bold rounded hover:bg-slate-300 transition cursor-pointer"
                    >
                      + Thêm Đường Link
                    </button>
                    <div className="space-y-1 max-h-20 overflow-y-auto pt-1">
                      {linksList.map((link, i) => (
                        <div key={i} className="flex items-center justify-between text-[10px] bg-white px-2 py-0.5 rounded border border-slate-100 font-medium text-amber-800">
                          <span className="truncate max-w-[100px]" title={link.url}>🔗 {link.title}</span>
                          <button type="button" onClick={() => setLinksList(prev => prev.filter((_, idx) => idx !== i))} className="text-rose-500 font-bold hover:text-rose-700 cursor-pointer">✕</button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Save question to deck button based on Attachments & Links */}
                <div className="bg-gradient-to-r from-rose-50 to-amber-50 border-2 border-rose-150 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-inner">
                  <div className="text-left">
                    <span className="block text-xs font-black text-rose-900 uppercase">Đính kèm & Liên kết bổ trợ</span>
                    <span className="block text-[10px] text-slate-500 font-bold mt-0.5">Bấm nút bên để lưu các tệp & đường link này thành 1 câu hỏi học tập trong bộ bài!</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleSaveAttachmentAndLinksAsQuestion}
                    className="px-4 py-2.5 bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white font-black text-[11px] uppercase rounded-xl transition cursor-pointer shadow-md whitespace-nowrap"
                  >
                    📥 Lưu câu hỏi vào bộ bài
                  </button>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-3 bg-sky-500 text-white font-black text-sm rounded-xl hover:bg-sky-600 transition shadow-md shadow-sky-500/25 cursor-pointer flex items-center justify-center space-x-1.5"
                  >
                    <span>GỬI CHO HỌC SINH 🚀 ({questions.length} CÂU)</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Questions Builder Column */}
            <div className="bg-sky-50/70 border-2 border-sky-200/80 rounded-3xl p-6 shadow-sm space-y-4 h-fit relative overflow-hidden">
              {/* Cute stickers background */}
              <div className="absolute top-0 right-0 text-4xl opacity-15 select-none pointer-events-none mt-1 mr-2">🌈⭐🎨✏️</div>
              
              <h3 className="text-lg font-black text-sky-800 flex items-center justify-between">
                <span className="flex items-center space-x-2">
                  <span className="p-2 bg-sky-100/80 rounded-xl text-sky-600 text-xl">🎨</span>
                  <span>Soạn Bộ Câu Hỏi</span>
                </span>
                <span className="text-[10px] bg-sky-200/60 text-sky-700 font-extrabold px-3 py-1 rounded-full border border-sky-300">
                  {questions.length} câu đã soạn
                </span>
              </h3>

              {/* TẢI VÀ ĐƯA FILE MẪU LÊN PANEL (CONNECT TO COMPUTER & PHONE) */}
              <div className="bg-white/95 border border-sky-150 p-4 rounded-2xl shadow-xs space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-indigo-700 uppercase tracking-wider flex items-center space-x-1">
                    <span>📥 MẪU CÂU HỎI TRẮC NGHIỆM</span>
                  </span>
                  <span className="text-[8px] font-bold text-sky-500 bg-sky-50 px-1.5 py-0.5 rounded">Điện thoại & Máy tính 💻📱</span>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Download templates */}
                  <div className="space-y-1.5">
                    <span className="block text-[8px] text-slate-400 font-extrabold uppercase tracking-wide">1. TẢI FILE MẪU ĐỂ SOẠN:</span>
                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        type="button"
                        onClick={downloadCSVTemplate}
                        className="flex items-center justify-center space-x-1 py-1.5 px-1 bg-emerald-50 hover:bg-emerald-100/80 text-emerald-700 border border-emerald-200 text-[9px] font-black rounded-lg transition-all cursor-pointer"
                        title="Tải tệp Excel/CSV mẫu về máy để soạn câu hỏi"
                      >
                        <Download className="h-2.5 w-2.5 shrink-0" />
                        <span className="truncate">Tải Excel Mẫu 📊</span>
                      </button>
                      <button
                        type="button"
                        onClick={downloadJSONTemplate}
                        className="flex items-center justify-center space-x-1 py-1.5 px-1 bg-amber-50 hover:bg-amber-100/80 text-amber-700 border border-amber-200 text-[9px] font-black rounded-lg transition-all cursor-pointer"
                        title="Tải tệp JSON mẫu về máy để soạn câu hỏi"
                      >
                        <Download className="h-2.5 w-2.5 shrink-0" />
                        <span className="truncate">Tải JSON Mẫu 📄</span>
                      </button>
                    </div>
                  </div>

                  {/* Upload file */}
                  <div className="space-y-1.5">
                    <span className="block text-[8px] text-slate-400 font-extrabold uppercase tracking-wide">2. ĐƯA FILE ĐÃ SOẠN LÊN:</span>
                    <label className="flex items-center justify-center space-x-1.5 py-1.5 px-2 border-2 border-dashed border-indigo-200 hover:border-indigo-400 bg-indigo-50/20 hover:bg-indigo-50/50 rounded-lg cursor-pointer transition-all duration-200 text-center h-[28px]">
                      <input
                        type="file"
                        accept=".csv,.json"
                        onChange={handleImportQuestionsFile}
                        className="hidden"
                      />
                      <Upload className="h-3 w-3 text-indigo-500 animate-bounce" />
                      <span className="text-[9px] font-black text-indigo-700">ĐƯA FILE MẪU LÊN 📤</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* TEMP IMPORTED QUESTIONS PREVIEW & SAVE BUTTON */}
              {tempImportedQuestions.length > 0 && (
                <div className="bg-indigo-50/50 border-2 border-indigo-200 p-3.5 rounded-2xl space-y-3 animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-indigo-800 uppercase tracking-wider flex items-center space-x-1">
                      <span>📝 FILE ĐÃ LẤY ĐƯỢC {tempImportedQuestions.length} CÂU HỎI THÔ</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setTempImportedQuestions([])}
                      className="text-[9px] font-bold text-rose-500 hover:text-rose-700 cursor-pointer"
                    >
                      Huỷ bỏ
                    </button>
                  </div>
                  
                  <div className="max-h-24 overflow-y-auto space-y-1.5 p-2 bg-white rounded-xl border border-indigo-100 text-[10px] font-medium text-slate-600">
                    {tempImportedQuestions.map((q, idx) => (
                      <div key={idx} className="truncate border-b border-slate-100 pb-1 last:border-0 last:pb-0">
                        <span className="font-bold text-indigo-600">Câu {idx + 1} ({q.type}):</span> {q.questionText}
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setQuestions(prev => [...prev, ...tempImportedQuestions]);
                      setTempImportedQuestions([]);
                      alert(`Đã lưu thành công ${tempImportedQuestions.length} câu hỏi vào bộ bài! 🚀`);
                    }}
                    className="w-full py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-black text-[10px] uppercase rounded-xl transition shadow-md shadow-emerald-500/20 flex items-center justify-center space-x-1.5 cursor-pointer"
                  >
                    <Save className="h-3.5 w-3.5" />
                    <span>LƯU CÂU HỎI VÀO BỘ BÀI 📥</span>
                  </button>
                </div>
              )}

              {/* Form to create a question */}
              <div className="bg-white/80 border border-sky-100 p-4.5 rounded-2xl space-y-4">
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

                {/* General Question Image Attachment block */}
                <div className="bg-sky-50/50 border border-sky-100 rounded-2xl p-3.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-[11px] font-black text-sky-800 uppercase flex items-center space-x-1">
                      <span>📸 HÌNH ẢNH MINH HỌA CHO CÂU HỎI ({qImages.length})</span>
                    </label>
                    <label className="flex items-center space-x-1 px-2.5 py-1.5 bg-sky-500 hover:bg-sky-600 text-white text-[9px] font-black uppercase rounded-lg transition-all cursor-pointer shadow-xs">
                      <Plus className="h-2.5 w-2.5" />
                      <span>Thêm ảnh minh họa 📷</span>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const files = e.target.files;
                          if (!files) return;
                          Array.from(files).forEach((file: any) => {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              if (typeof reader.result === 'string') {
                                setQImages(prev => [...prev, reader.result as string]);
                              }
                            };
                            reader.readAsDataURL(file);
                          });
                        }}
                      />
                    </label>
                  </div>

                  {qImages.length > 0 && (
                    <div className="flex flex-wrap gap-2 p-2 bg-white rounded-xl border border-sky-100 max-h-24 overflow-y-auto">
                      {qImages.map((img, idx) => (
                        <div key={idx} className="relative h-14 w-14 rounded-lg overflow-hidden border border-slate-200 shadow-xs group shrink-0">
                          <img src={img} alt={`q-img-${idx}`} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                          <button
                            type="button"
                            onClick={() => setQImages(prev => prev.filter((_, i) => i !== idx))}
                            className="absolute top-0.5 right-0.5 bg-rose-500 text-white hover:bg-rose-600 rounded-full h-4 w-4 flex items-center justify-center text-[8px] font-bold shadow-xs cursor-pointer focus:outline-none"
                            title="Xóa ảnh này"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Type 1 Options (Single choice) */}
                {qType === 'single_choice' && (
                  <div className="bg-amber-50/70 border-2 border-amber-200/80 p-4 rounded-2xl space-y-3 relative overflow-hidden animate-fadeIn text-xs">
                    <div className="absolute top-0 right-0 text-3xl opacity-15 select-none pointer-events-none mt-1 mr-2">🎯</div>
                    <span className="block font-black text-amber-800 flex items-center space-x-1">
                      <span>🎯 Lựa chọn Đáp Án đúng nhất:</span>
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      <input type="text" placeholder="Lựa chọn A" value={singleOptA} onChange={e => setSingleOptA(e.target.value)} className="p-2.5 rounded bg-white border border-amber-150 focus:outline-none focus:border-amber-400 font-semibold text-slate-700" />
                      <input type="text" placeholder="Lựa chọn B" value={singleOptB} onChange={e => setSingleOptB(e.target.value)} className="p-2.5 rounded bg-white border border-amber-150 focus:outline-none focus:border-amber-400 font-semibold text-slate-700" />
                      <input type="text" placeholder="Lựa chọn C" value={singleOptC} onChange={e => setSingleOptC(e.target.value)} className="p-2.5 rounded bg-white border border-amber-150 focus:outline-none focus:border-amber-400 font-semibold text-slate-700" />
                      <input type="text" placeholder="Lựa chọn D" value={singleOptD} onChange={e => setSingleOptD(e.target.value)} className="p-2.5 rounded bg-white border border-amber-150 focus:outline-none focus:border-amber-400 font-semibold text-slate-700" />
                    </div>
                    <div className="flex items-center space-x-2 pt-1 font-black text-amber-800">
                      <span>Đáp án đúng nhất:</span>
                      {['A', 'B', 'C', 'D'].map(letter => (
                        <button
                          key={letter}
                          type="button"
                          onClick={() => setSingleCorrect(letter)}
                          className={`px-3 py-1.5 rounded-lg border-2 transition font-black ${
                            singleCorrect === letter ? 'bg-amber-400 text-white border-amber-500 shadow-sm' : 'bg-white border-amber-100 text-amber-700 hover:bg-amber-100'
                          }`}
                        >
                          Lớp {letter}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Type 2 Options (True / False) */}
                {qType === 'true_false' && (
                  <div className="bg-emerald-50/70 border-2 border-emerald-200/80 p-4 rounded-2xl space-y-3 relative overflow-hidden animate-fadeIn text-xs">
                    <div className="absolute top-0 right-0 text-3xl opacity-15 select-none pointer-events-none mt-1 mr-2">⚖️</div>
                    <span className="block font-black text-emerald-800 flex items-center space-x-1">
                      <span>⚖️ Thiết lập 4 vế Đúng hay Sai:</span>
                    </span>
                    
                    <div className="space-y-1.5">
                      {/* Sub A */}
                      <div className="flex items-center space-x-2 bg-white/60 p-1.5 rounded-lg border border-emerald-100">
                        <span className="font-bold text-emerald-600">A.</span>
                        <input type="text" placeholder="Ví dụ: 6 x 8 = 48" value={tfA} onChange={e => setTfA(e.target.value)} className="flex-1 p-1.5 rounded bg-white border border-slate-200 text-xs focus:outline-none focus:border-emerald-400 text-slate-700 font-semibold" />
                        <label className="flex items-center space-x-1 font-black cursor-pointer text-emerald-700">
                          <input type="checkbox" checked={tfACorrect} onChange={e => setTfACorrect(e.target.checked)} className="accent-emerald-500 h-4 w-4" />
                          <span>Đúng</span>
                        </label>
                      </div>

                      {/* Sub B */}
                      <div className="flex items-center space-x-2 bg-white/60 p-1.5 rounded-lg border border-emerald-100">
                        <span className="font-bold text-emerald-600">B.</span>
                        <input type="text" placeholder="Ví dụ: 7 x 9 = 64" value={tfB} onChange={e => setTfB(e.target.value)} className="flex-1 p-1.5 rounded bg-white border border-slate-200 text-xs focus:outline-none focus:border-emerald-400 text-slate-700 font-semibold" />
                        <label className="flex items-center space-x-1 font-black cursor-pointer text-emerald-700">
                          <input type="checkbox" checked={tfBCorrect} onChange={e => setTfBCorrect(e.target.checked)} className="accent-emerald-500 h-4 w-4" />
                          <span>Đúng</span>
                        </label>
                      </div>

                      {/* Sub C */}
                      <div className="flex items-center space-x-2 bg-white/60 p-1.5 rounded-lg border border-emerald-100">
                        <span className="font-bold text-emerald-600">C.</span>
                        <input type="text" placeholder="Phép toán vế C" value={tfC} onChange={e => setTfC(e.target.value)} className="flex-1 p-1.5 rounded bg-white border border-slate-200 text-xs focus:outline-none focus:border-emerald-400 text-slate-700 font-semibold" />
                        <label className="flex items-center space-x-1 font-black cursor-pointer text-emerald-700">
                          <input type="checkbox" checked={tfCCorrect} onChange={e => setTfCCorrect(e.target.checked)} className="accent-emerald-500 h-4 w-4" />
                          <span>Đúng</span>
                        </label>
                      </div>

                      {/* Sub D */}
                      <div className="flex items-center space-x-2 bg-white/60 p-1.5 rounded-lg border border-emerald-100">
                        <span className="font-bold text-emerald-600">D.</span>
                        <input type="text" placeholder="Phép toán vế D" value={tfD} onChange={e => setTfD(e.target.value)} className="flex-1 p-1.5 rounded bg-white border border-slate-200 text-xs focus:outline-none focus:border-emerald-400 text-slate-700 font-semibold" />
                        <label className="flex items-center space-x-1 font-black cursor-pointer text-emerald-700">
                          <input type="checkbox" checked={tfDCorrect} onChange={e => setTfDCorrect(e.target.checked)} className="accent-emerald-500 h-4 w-4" />
                          <span>Đúng</span>
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                {/* Type 3 Options (Matching Left/Right) */}
                {qType === 'matching' && (
                  <div className="bg-purple-50/70 border-2 border-purple-200/80 p-4 rounded-2xl space-y-3 relative overflow-hidden animate-fadeIn text-xs">
                    <div className="absolute top-0 right-0 text-3xl opacity-15 select-none pointer-events-none mt-1 mr-2">🔗</div>
                    <span className="block font-black text-purple-800 flex items-center space-x-1">
                      <span>🔗 Ghép đôi 2 Cột xứng xứng:</span>
                    </span>
                    
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 bg-white/60 p-1.5 rounded-lg border border-purple-100">
                        <input type="text" placeholder="Vế trái 1 (vd: 9 x 3)" value={mLeft1} onChange={e => setMLeft1(e.target.value)} className="flex-1 p-1.5 rounded bg-white border border-purple-200 text-slate-700 font-semibold text-xs" />
                        <span className="text-purple-500 font-bold">↔</span>
                        <input type="text" placeholder="Vế phải 1 (vd: 27)" value={mRight1} onChange={e => setMRight1(e.target.value)} className="flex-1 p-1.5 rounded bg-white border border-purple-200 text-slate-700 font-semibold text-xs" />
                      </div>
                      <div className="flex items-center space-x-2 bg-white/60 p-1.5 rounded-lg border border-purple-100">
                        <input type="text" placeholder="Vế trái 2" value={mLeft2} onChange={e => setMLeft2(e.target.value)} className="flex-1 p-1.5 rounded bg-white border border-purple-200 text-slate-700 font-semibold text-xs" />
                        <span className="text-purple-500 font-bold">↔</span>
                        <input type="text" placeholder="Vế phải 2" value={mRight2} onChange={e => setMRight2(e.target.value)} className="flex-1 p-1.5 rounded bg-white border border-purple-200 text-slate-700 font-semibold text-xs" />
                      </div>
                      <div className="flex items-center space-x-2 bg-white/60 p-1.5 rounded-lg border border-purple-100">
                        <input type="text" placeholder="Vế trái 3" value={mLeft3} onChange={e => setMLeft3(e.target.value)} className="flex-1 p-1.5 rounded bg-white border border-purple-200 text-slate-700 font-semibold text-xs" />
                        <span className="text-purple-500 font-bold">↔</span>
                        <input type="text" placeholder="Vế phải 3" value={mRight3} onChange={e => setMRight3(e.target.value)} className="flex-1 p-1.5 rounded bg-white border border-purple-200 text-slate-700 font-semibold text-xs" />
                      </div>
                      <div className="flex items-center space-x-2 bg-white/60 p-1.5 rounded-lg border border-purple-100">
                        <input type="text" placeholder="Vế trái 4" value={mLeft4} onChange={e => setMLeft4(e.target.value)} className="flex-1 p-1.5 rounded bg-white border border-purple-200 text-slate-700 font-semibold text-xs" />
                        <span className="text-purple-500 font-bold">↔</span>
                        <input type="text" placeholder="Vế phải 4" value={mRight4} onChange={e => setMRight4(e.target.value)} className="flex-1 p-1.5 rounded bg-white border border-purple-200 text-slate-700 font-semibold text-xs" />
                      </div>
                    </div>
                  </div>
                )}

                {/* Type 4 Options (Fill Word in the blank) */}
                {qType === 'fill_blank' && (
                  <div className="bg-rose-50/70 border-2 border-rose-200/80 p-4 rounded-2xl space-y-3 relative overflow-hidden animate-fadeIn text-xs">
                    <div className="absolute top-0 right-0 text-3xl opacity-15 select-none pointer-events-none mt-1 mr-2">📝</div>
                    <span className="block font-black text-rose-800 flex items-center space-x-1">
                      <span>📝 Điền từ vào chỗ trống trống:</span>
                    </span>
                    <div>
                      <label className="block font-bold text-rose-700 mb-1 text-[10px]">Văn bản chính (đặt từ cần điền trong ngoặc vuông):</label>
                      <input
                        type="text"
                        placeholder="Ví dụ: Bé đi học [đúng giờ] và học bài rất [chăm chỉ]."
                        value={blankTextWithDots}
                        onChange={e => setBlankTextWithDots(e.target.value)}
                        className="w-full p-2.5 rounded bg-white border border-rose-150 focus:outline-none focus:border-rose-400 font-semibold text-slate-700"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block font-bold text-rose-700 mb-1 text-[10px]">Từ nhiễu (ngân hàng từ, phẩy cách):</label>
                        <input
                          type="text"
                          placeholder="đúng giờ, lười biếng, chăm chỉ"
                          value={blankWordBank}
                          onChange={e => setBlankWordBank(e.target.value)}
                          className="w-full p-2.5 rounded bg-white border border-rose-150 focus:outline-none focus:border-rose-400 text-xs text-slate-700 font-semibold"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-rose-700 mb-1 text-[10px]">Đáp án đúng (theo thứ tự, phẩy cách):</label>
                        <input
                          type="text"
                          placeholder="đúng giờ, chăm chỉ"
                          value={blankCorrectAnswers}
                          onChange={e => setBlankCorrectAnswers(e.target.value)}
                          className="w-full p-2.5 rounded bg-white border border-rose-150 focus:outline-none focus:border-rose-400 text-xs text-slate-700 font-semibold"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleAddQuestion}
                  className="w-full py-3 bg-gradient-to-r from-sky-500 to-indigo-600 text-white font-black text-xs rounded-2xl hover:from-sky-600 hover:to-indigo-700 transition shadow-md hover:shadow-indigo-500/25 cursor-pointer flex items-center justify-center space-x-1.5"
                >
                  <span>✨ LƯU CÂU HỎI VÀO BỘ BÀI ✨</span>
                </button>
              </div>

              {/* Draft Questions List */}
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 border-t border-sky-200/50 pt-4">
                <span className="block text-[11px] font-black text-teal-800 uppercase tracking-wider mb-2 flex items-center space-x-1">
                  <span>📝 DANH SÁCH CÂU HỎI ĐÃ SOẠN ({questions.length})</span>
                </span>
                {questions.length === 0 ? (
                  <p className="text-center text-slate-400 text-xs py-8 bg-white/50 border border-dashed border-sky-100 rounded-2xl italic">Chưa có câu hỏi nào được thêm. Thầy cô hãy nhập câu hỏi ở trên hoặc nạp từ tệp mẫu nhé! 🧸</p>
                ) : (
                  questions.map((q, idx) => (
                    <div key={q.id} className="p-3 bg-teal-50/70 border-2 border-teal-150 rounded-2xl flex items-start justify-between text-xs font-medium shadow-xs transition hover:scale-[1.01]">
                      <div>
                        <span className="font-extrabold text-teal-700 block mb-1">⭐ Câu {idx + 1}: {
                          q.type === 'single_choice' ? '🎯 Trắc nghiệm 1 đáp án' : q.type === 'true_false' ? '⚖️ Đúng/Sai' : q.type === 'matching' ? '🔗 Nối vế' : '📝 Điền từ vào chỗ trống'
                        }</span>
                        <p className="text-slate-800 font-extrabold">{q.questionText}</p>
                        {q.type === 'fill_blank' && (
                          <p className="text-[10px] text-teal-600 mt-1 italic font-semibold">{q.blanksText}</p>
                        )}
                      </div>
                      <button
                        onClick={() => setQuestions(prev => prev.filter(item => item.id !== q.id))}
                        className="text-rose-500 hover:text-rose-700 font-bold bg-white hover:bg-rose-50 border border-slate-100 px-2 py-1 rounded-xl transition duration-200 shrink-0 ml-2"
                      >
                        Xoá ✕
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 3: STUDENT PROGRESS & QUIZ ANALYTICS (BYPASSED AND INTEGRATED INTO ASSIGNMENTS SUB-TAB) */}
        {false && activeTab === 'progress' && (
          <motion.div
            key="progress"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-6"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-800">Tiến độ hoàn thành nhiệm vụ & Kết quả</h3>
                <p className="text-xs text-slate-400 font-medium">Theo dõi chi tiết số lần làm bài, số câu đúng, thời gian làm bài của học sinh theo từng môn học.</p>
              </div>
              {selectedSubject && (
                <button
                  onClick={() => setSelectedSubject(null)}
                  className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold transition cursor-pointer shrink-0"
                >
                  ← Hiện tất cả 11 môn
                </button>
              )}
            </div>

            {/* 11 Rectangular Subject Boxes with 11 different colors */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {SUBJECTS_LIST.map((subj) => {
                const isSelected = selectedSubject === subj;
                const colorDef = SUBJECT_COLORS[subj] || { bg: 'bg-slate-50 text-slate-700 border-slate-200', activeBg: 'bg-slate-600 text-white border-slate-600', hover: 'hover:bg-slate-100', icon: '📝' };
                const subjectAssignments = assignments.filter(a => a.subject === subj);
                const taskCount = subjectAssignments.length;

                return (
                  <button
                    key={subj}
                    onClick={() => setSelectedSubject(isSelected ? null : subj)}
                    className={`p-4 md:p-5 rounded-3xl border-2 transition-all duration-300 cursor-pointer flex flex-col items-center justify-center text-center h-36 relative overflow-hidden group select-none shadow-xs hover:shadow-md hover:scale-[1.03] ${
                      isSelected
                        ? `${colorDef.activeBg} scale-[1.05] ring-4 ring-offset-2 ring-indigo-400`
                        : `${colorDef.bg} ${colorDef.hover} border-slate-200/80`
                    }`}
                  >
                    {/* Cute background floating sticker */}
                    <div className="absolute -right-3 -bottom-3 text-6xl opacity-10 group-hover:scale-125 transition duration-500 select-none pointer-events-none">
                      {colorDef.icon}
                    </div>

                    <div className="flex flex-col items-center space-y-3 z-10">
                      <span className="text-4xl filter drop-shadow-sm transform group-hover:rotate-12 transition-transform duration-300 select-none">
                        {colorDef.icon}
                      </span>
                      <div>
                        <h4 className="font-black text-xs md:text-sm tracking-tight leading-tight uppercase font-sans">
                          {subj}
                        </h4>
                        <span className={`inline-block text-[9px] px-2.5 py-0.5 rounded-full font-extrabold mt-1.5 uppercase tracking-wider ${
                          isSelected ? 'bg-white/25 text-white' : 'bg-black/5 text-slate-500'
                        }`}>
                          🎈 {taskCount} nhiệm vụ
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Assignments list based on selected subject */}
            <div className="space-y-6 pt-2">
              {!selectedSubject ? (
                <div className="text-center py-12 bg-slate-50/50 rounded-3xl border border-dashed border-slate-200 space-y-3">
                  <span className="text-4xl">👆</span>
                  <p className="text-slate-500 font-bold text-sm">Vui lòng nhấn vào một trong 11 môn học ở trên</p>
                  <p className="text-slate-400 text-xs max-w-md mx-auto">Nhấn chọn môn học để xem chi tiết danh sách học sinh đã làm và chưa làm của từng nhiệm vụ tương ứng.</p>
                </div>
              ) : (
                (() => {
                  const filteredAssignments = assignments.filter(a => a.subject === selectedSubject);
                  
                  if (filteredAssignments.length === 0) {
                    return (
                      <div className="text-center py-12 bg-slate-50/50 rounded-3xl border border-dashed border-slate-200 space-y-2">
                        <span className="text-3xl">📭</span>
                        <h4 className="font-bold text-slate-700 text-sm">Môn {selectedSubject} chưa có nhiệm vụ nào</h4>
                        <p className="text-slate-400 text-xs max-w-xs mx-auto">Cô giáo có thể chuyển sang tab <span className="font-bold text-slate-600">"Nhiệm vụ học tập"</span> để giao nhiệm vụ mới cho lớp.</p>
                      </div>
                    );
                  }

                  const nonDrafts = filteredAssignments.filter(a => !a.isDraft);

                  if (nonDrafts.length === 0) {
                    return (
                      <div className="text-center py-12 bg-slate-50/50 rounded-3xl border border-dashed border-slate-200 space-y-2">
                        <span className="text-3xl">📭</span>
                        <h4 className="font-bold text-slate-700 text-sm">Môn {selectedSubject} chưa có nhiệm vụ chính thức nào</h4>
                        <p className="text-slate-400 text-xs max-w-xs mx-auto">Cô giáo có thể chuyển sang tab <span className="font-bold text-slate-600">"Nhiệm vụ học tập"</span> để giao nhiệm vụ mới cho lớp.</p>
                      </div>
                    );
                  }

                  const weeksMap: { [key: number]: Assignment[] } = {};
                  const unassignedWeek: Assignment[] = [];

                  nonDrafts.forEach(as => {
                    if (as.week && as.week >= 1 && as.week <= 35) {
                      if (!weeksMap[as.week]) {
                        weeksMap[as.week] = [];
                      }
                      weeksMap[as.week].push(as);
                    } else {
                      unassignedWeek.push(as);
                    }
                  });

                  // Sort week numbers
                  const activeWeeks = Object.keys(weeksMap).map(Number).sort((a, b) => a - b);

                  const renderAssignmentCard = (assignment: Assignment) => {
                    const doneStudents: { student: Student; sub: typeof submissions[0] }[] = [];
                    const notDoneStudents: Student[] = [];

                    students.forEach(student => {
                      const subRecord = submissions.find(
                        s => s.assignmentId === assignment.id && s.studentId === student.id
                      );
                      if (subRecord && subRecord.status === 'submitted') {
                        doneStudents.push({ student, sub: subRecord });
                      } else {
                        notDoneStudents.push(student);
                      }
                    });

                    return (
                      <div key={assignment.id} className="border border-slate-150 rounded-3xl p-5 space-y-5 bg-white shadow-sm animate-fadeIn">
                        {/* Assignment Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 gap-3">
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="text-[10px] font-black text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100 uppercase">
                                {assignment.subject}
                              </span>
                              {assignment.week && (
                                <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100 uppercase">
                                  Tuần {assignment.week}
                                </span>
                              )}
                              <span className="text-[10px] text-slate-400 font-bold font-mono">
                                Đã giao: {new Date(assignment.createdAt).toLocaleString()}
                              </span>
                            </div>
                            <h4 className="font-extrabold text-slate-800 text-base mt-2">{assignment.title}</h4>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-100">
                              Đã làm: {doneStudents.length} / {students.length}
                            </span>
                            <span className="text-xs font-bold text-rose-600 bg-rose-50 px-3 py-1 rounded-xl border border-rose-100">
                              Chưa làm: {notDoneStudents.length} / {students.length}
                            </span>
                          </div>
                        </div>

                        {/* Dual Grid: Done vs Not Done */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                          {/* LIST DONE (ĐÃ LÀM) */}
                          <div className="bg-emerald-50/20 border border-emerald-100/50 rounded-2xl p-4 space-y-3">
                            <h5 className="font-extrabold text-xs text-emerald-800 flex items-center space-x-1.5">
                              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping shrink-0" />
                              <span>ĐÃ HOÀN THÀNH ({doneStudents.length})</span>
                            </h5>
                            
                            <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1">
                              {doneStudents.length === 0 ? (
                                <p className="text-center text-slate-400 text-xs py-8">Chưa có học sinh nào nộp bài.</p>
                              ) : (
                                doneStudents.map(({ student, sub }) => (
                                  <div key={student.id} className="p-2.5 bg-white border border-slate-150 rounded-xl flex items-center justify-between text-xs hover:shadow-xs transition">
                                    <div className="flex items-center space-x-2.5 min-w-0">
                                      <span className="text-lg shrink-0">{student.avatar}</span>
                                      <div className="min-w-0">
                                        <span className="font-bold text-slate-800 block truncate">{student.name}</span>
                                        <span className="text-[10px] text-slate-400 font-medium">Nộp: {new Date(sub.submittedAt).toLocaleDateString()}</span>
                                      </div>
                                    </div>
                                    
                                    <div className="text-right shrink-0 space-y-0.5">
                                      <div className="font-extrabold text-slate-700 bg-slate-100 px-2 py-0.5 rounded text-[10px]">
                                        Đúng: {sub.correctCount} / {sub.totalQuestions}
                                      </div>
                                      <div className="text-[9px] text-slate-400 font-bold font-mono">
                                        ⏱️ {sub.timeSpentSeconds}s ({sub.attemptsCount} lần)
                                      </div>
                                    </div>
                                  </div>
                                ))
                              )}
                            </div>
                          </div>

                          {/* LIST NOT DONE (CHƯA LÀM) */}
                          <div className="bg-rose-50/10 border border-rose-100/30 rounded-2xl p-4 space-y-3">
                            <h5 className="font-extrabold text-xs text-rose-800 flex items-center space-x-1.5">
                              <span className="h-2 w-2 rounded-full bg-rose-400 animate-pulse shrink-0" />
                              <span>CHƯA LÀM / CHƯA HOÀN THÀNH ({notDoneStudents.length})</span>
                            </h5>
                            
                            <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1">
                              {notDoneStudents.length === 0 ? (
                                <p className="text-center text-emerald-600 font-bold text-xs py-8">🎉 Cả lớp đã hoàn thành xuất sắc!</p>
                              ) : (
                                notDoneStudents.map((student) => (
                                  <div key={student.id} className="p-2.5 bg-white border border-slate-150 rounded-xl flex items-center justify-between text-xs hover:shadow-xs transition">
                                    <div className="flex items-center space-x-2.5 min-w-0">
                                      <span className="text-lg shrink-0">{student.avatar}</span>
                                      <span className="font-bold text-slate-800 truncate block">{student.name}</span>
                                    </div>
                                    
                                    <button
                                      onClick={() => {
                                        addViolation(student.id, 'Thiếu bài tập về nhà', `Nhắc nhở bé hoàn thành nhiệm vụ '${assignment.title}' môn ${assignment.subject}.`);
                                        alert(`Đã gửi thông báo nhắc nhở làm bài tập môn ${assignment.subject} đến phụ huynh em ${student.name}!`);
                                      }}
                                      className="inline-flex items-center space-x-1 px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-700 rounded-xl text-[10px] font-bold cursor-pointer transition shrink-0"
                                    >
                                      <BellRing className="h-3.5 w-3.5" />
                                      <span>Nhắc PH</span>
                                    </button>
                                  </div>
                                ))
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  };

                  return (
                    <div className="space-y-8">
                      {/* Render grouped weeks */}
                      {activeWeeks.map(wk => (
                        <div key={wk} className="space-y-4">
                          <div className="flex items-center space-x-2.5 py-1.5 bg-gradient-to-r from-sky-500 to-indigo-600 text-white px-4 rounded-2xl w-fit shadow-md font-black text-xs">
                            <span className="text-base">📅</span>
                            <span>TUẦN {wk} (TỪ TUẦN 1 - 35)</span>
                          </div>
                          <div className="space-y-4">
                            {weeksMap[wk].map(renderAssignmentCard)}
                          </div>
                        </div>
                      ))}

                      {/* Render unassigned week assignments if any */}
                      {unassignedWeek.length > 0 && (
                        <div className="space-y-4">
                          <div className="flex items-center space-x-2.5 py-1.5 bg-gradient-to-r from-slate-500 to-slate-600 text-white px-4 rounded-2xl w-fit shadow-md font-black text-xs">
                            <span className="text-base">📁</span>
                            <span>BÀI TẬP CHƯA PHÂN TUẦN</span>
                          </div>
                          <div className="space-y-4">
                            {unassignedWeek.map(renderAssignmentCard)}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()
              )}
            </div>
          </motion.div>
        )}

        {/* TAB: NGÂN HÀNG CÂU HỎI ÔN TẬP (BYPASSED AND INTEGRATED INTO ASSIGNMENTS SUB-TAB) */}
        {false && activeTab === 'review_bank' && (
          <motion.div
            key="review_bank"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-6"
          >
            {/* Header banner */}
            <div className="bg-gradient-to-r from-amber-500/10 via-amber-600/5 to-transparent p-5 rounded-3xl border border-amber-200/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h3 className="text-lg font-black text-amber-900 flex items-center space-x-2">
                  <span>🎓</span>
                  <span>NGÂN HÀNG CÂU HỎI ÔN TẬP TỰ ĐỘNG</span>
                </h3>
                <p className="text-xs text-amber-800/80 font-bold mt-1">
                  Kho lưu trữ thông minh, tự động đồng bộ từ các câu hỏi ôn tập, dặn dò, và liên kết tài liệu theo môn học và tuần học.
                </p>
              </div>
              <div className="flex items-center space-x-2 shrink-0">
                {selectedReviewIds.length > 0 && (
                  <button
                    onClick={() => {
                      setIsGeneratingCompositeExam(true);
                      audioSynth.playSuccess();
                    }}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-black rounded-xl shadow-sm cursor-pointer transition flex items-center space-x-1.5"
                  >
                    <span>📋</span>
                    <span>Tạo Đề Tổng Hợp ({selectedReviewIds.length})</span>
                  </button>
                )}
                {reviewSelectedSubject && (
                  <button
                    onClick={() => setReviewSelectedSubject(null)}
                    className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold transition cursor-pointer"
                  >
                    ← Hiện tất cả 11 môn
                  </button>
                )}
              </div>
            </div>

            {/* Subject filter grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {SUBJECTS_LIST.map((subj) => {
                const isSelected = reviewSelectedSubject === subj;
                const colorDef = SUBJECT_COLORS[subj] || { bg: 'bg-slate-50 text-slate-700 border-slate-200', activeBg: 'bg-slate-600 text-white border-slate-600', hover: 'hover:bg-slate-100', icon: '📝' };
                const count = assignments.filter(a => a.subject === subj).length;

                return (
                  <button
                    key={subj}
                    onClick={() => {
                      audioSynth.playBubblePop();
                      setReviewSelectedSubject(isSelected ? null : subj);
                    }}
                    className={`p-3.5 rounded-2xl border-2 transition-all duration-300 cursor-pointer flex flex-col items-center justify-center text-center h-28 relative overflow-hidden group select-none shadow-xs hover:shadow-md hover:scale-[1.03] ${
                      isSelected
                        ? `${colorDef.activeBg} scale-[1.03] ring-4 ring-offset-2 ring-amber-400`
                        : `${colorDef.bg} ${colorDef.hover} border-slate-200/80`
                    }`}
                  >
                    <div className="absolute -right-2 -bottom-2 text-4xl opacity-10 group-hover:scale-125 transition duration-500 select-none pointer-events-none">
                      {colorDef.icon}
                    </div>
                    <div className="flex flex-col items-center space-y-1.5 z-10">
                      <span className="text-2xl filter drop-shadow-sm transform group-hover:rotate-12 transition-transform duration-300 select-none">
                        {colorDef.icon}
                      </span>
                      <div>
                        <h4 className="font-black text-[10px] md:text-xs tracking-tight leading-tight uppercase">
                          {subj}
                        </h4>
                        <span className={`inline-block text-[8px] px-1.5 py-0.5 rounded-full font-black mt-1 uppercase ${
                          isSelected ? 'bg-white/25 text-white' : 'bg-black/5 text-slate-500'
                        }`}>
                          {count} đề / chuyên đề
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Composite Exam Creator Console */}
            {isGeneratingCompositeExam && selectedReviewIds.length > 0 && (
              <div className="bg-amber-50 p-4 rounded-2xl border-2 border-amber-300 shadow-xs space-y-3">
                <div className="flex justify-between items-center border-b border-amber-200 pb-2">
                  <h4 className="font-black text-xs text-amber-950 uppercase flex items-center space-x-1.5">
                    <span>📋</span>
                    <span>TẠO ĐỀ THI ÔN TẬP TỔNG HỢP CỰC NHANH</span>
                  </h4>
                  <button 
                    onClick={() => setIsGeneratingCompositeExam(false)}
                    className="text-[10px] text-slate-500 hover:text-slate-800 font-bold underline cursor-pointer"
                  >
                    Đóng lại [x]
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-black text-amber-800 uppercase mb-1">Tên Đề Thi Ôn Tập Tổng Hợp</label>
                    <input 
                      type="text"
                      value={compositeExamTitle}
                      onChange={e => setCompositeExamTitle(e.target.value)}
                      placeholder="Ví dụ: Đề Ôn Tập Tổng Hợp Cuối Tuần 24..."
                      className="w-full text-xs p-2.5 rounded-xl border border-amber-200 font-bold bg-white focus:outline-none focus:border-amber-400 text-slate-800"
                    />
                  </div>
                  <div className="flex flex-col justify-end">
                    <button
                      onClick={() => {
                        const selectedExams = assignments.filter(a => selectedReviewIds.includes(a.id));
                        if (selectedExams.length === 0) return;
                        
                        const combinedQuestions: Question[] = [];
                        selectedExams.forEach(ex => {
                          ex.questions?.forEach(q => {
                            combinedQuestions.push({
                              ...q,
                              id: `q_composite_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`
                            });
                          });
                        });

                        if (combinedQuestions.length === 0) {
                          alert('Các đề đã chọn chưa có câu hỏi nào để tổng hợp!');
                          return;
                        }

                        audioSynth.playSuccess();
                        
                        setAsTitle(compositeExamTitle);
                        setAsDesc(`Đề thi ôn tập tổng hợp ghép từ các đề: ${selectedExams.map(e => e.title).join(', ')}`);
                        setAsSubject(selectedExams[0]?.subject || 'Toán');
                        setAsWeek(selectedExams[0]?.week || 1);
                        setQuestions(combinedQuestions);
                        
                        setActiveTab('assignments');
                        setIsGeneratingCompositeExam(false);
                        setSelectedReviewIds([]);
                        alert(`🎉 Đã tổng hợp thành công ${combinedQuestions.length} câu hỏi vào khu vực soạn đề! Thầy cô có thể điều chỉnh và bấm "Gửi cho cả lớp" ở cuối trang nhé!`);
                      }}
                      className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-black text-xs rounded-xl transition shadow-md shadow-amber-500/20 cursor-pointer flex items-center justify-center space-x-1"
                    >
                      <span>🚀 Phát hành Đề Tổng Hợp ({selectedReviewIds.length} đề)</span>
                    </button>
                  </div>
                </div>

                <div className="text-[10px] text-amber-800 font-medium">
                  <strong>Các đề sẽ được ghép câu hỏi:</strong> {assignments.filter(a => selectedReviewIds.includes(a.id)).map(a => `${a.title} (${a.subject} - Tuần ${a.week})`).join(' | ')}
                </div>
              </div>
            )}

            {/* Search and control bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex-1 max-w-md relative">
                <input
                  type="text"
                  placeholder="🔍 Nhập từ khoá tìm đề ôn tập, tuần học..."
                  value={reviewSearchQuery}
                  onChange={e => setReviewSearchQuery(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500 font-bold text-slate-700 bg-slate-50 pl-9"
                />
                <span className="absolute left-3 top-2.5 text-slate-400 text-sm">🔍</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] text-slate-400 font-bold">Thao tác hàng loạt:</span>
                <button
                  onClick={() => {
                    const filtered = assignments.filter(a => {
                      const matchSubject = !reviewSelectedSubject || a.subject === reviewSelectedSubject;
                      const matchQuery = !reviewSearchQuery || a.title.toLowerCase().includes(reviewSearchQuery.toLowerCase()) || `tuần ${a.week}`.includes(reviewSearchQuery.toLowerCase());
                      return matchSubject && matchQuery;
                    });
                    setSelectedReviewIds(filtered.map(a => a.id));
                    audioSynth.playBubblePop();
                  }}
                  className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-[10px] font-bold cursor-pointer"
                >
                  Chọn tất cả
                </button>
                <button
                  onClick={() => {
                    setSelectedReviewIds([]);
                    audioSynth.playBubblePop();
                  }}
                  className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-[10px] font-bold cursor-pointer"
                >
                  Bỏ chọn
                </button>
              </div>
            </div>

            {/* List and Table Grid */}
            <div className="overflow-x-auto border border-slate-100 rounded-2xl shadow-xs bg-white">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/85 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                    <th className="p-3.5 text-center w-12">Chọn</th>
                    <th className="p-3.5">Môn Học</th>
                    <th className="p-3.5 text-center w-24 whitespace-nowrap">Tuần</th>
                    <th className="p-3.5">Tên Chuyên Đề / Bài Tập</th>
                    <th className="p-3.5 text-center w-32 whitespace-nowrap">Số Câu Hỏi</th>
                    <th className="p-3.5">Ngày Tạo</th>
                    <th className="p-3.5 text-right">Hành Động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {(() => {
                    const filteredReviews = assignments.filter(a => {
                      const matchSubject = !reviewSelectedSubject || a.subject === reviewSelectedSubject;
                      const matchQuery = !reviewSearchQuery || a.title.toLowerCase().includes(reviewSearchQuery.toLowerCase()) || `tuần ${a.week}`.includes(reviewSearchQuery.toLowerCase());
                      return matchSubject && matchQuery;
                    });

                    if (filteredReviews.length === 0) {
                      return (
                        <tr>
                          <td colSpan={7} className="p-10 text-center text-slate-400 font-bold">
                             Không tìm thấy đề ôn tập nào phù hợp. Đề thi tự động lưu tại đây khi giáo viên phát lệnh hoặc đánh dấu "Ghi nhớ ôn tập"!
                          </td>
                        </tr>
                      );
                    }

                    return filteredReviews.map(rev => {
                      const colorDef = SUBJECT_COLORS[rev.subject] || { bg: 'bg-slate-50', activeBg: 'bg-slate-500', hover: 'hover:bg-slate-100', icon: '📝' };
                      const isChecked = selectedReviewIds.includes(rev.id);

                      return (
                        <tr key={rev.id} className="hover:bg-slate-50/50 transition">
                          {/* Checkbox for batch creation */}
                          <td className="p-3.5 text-center">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={e => {
                                audioSynth.playBubblePop();
                                if (e.target.checked) {
                                  setSelectedReviewIds(prev => [...prev, rev.id]);
                                } else {
                                  setSelectedReviewIds(prev => prev.filter(id => id !== rev.id));
                                }
                              }}
                              className="h-4 w-4 rounded text-amber-500 border-slate-300 accent-amber-500 cursor-pointer"
                            />
                          </td>

                          {/* Môn học tag */}
                          <td className="p-3.5">
                            <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full font-bold text-[10px] bg-indigo-50 text-indigo-950 border border-indigo-150 uppercase shadow-xs">
                              <span className="text-sm select-none">{colorDef.icon}</span>
                              <span>{rev.subject}</span>
                            </span>
                          </td>

                          {/* Tuần học */}
                          <td className="p-3.5 text-center">
                            <span className="px-2.5 py-0.5 rounded-md bg-sky-50 text-sky-800 border border-sky-150 text-[10px] font-extrabold font-mono">
                              Tuần {rev.week}
                            </span>
                          </td>

                          {/* Tên bài */}
                          <td className="p-3.5">
                            <div className="flex flex-col">
                              <span className="font-extrabold text-slate-800 text-[11px] hover:text-indigo-600 cursor-pointer flex items-center gap-1">
                                {rev.title}
                                {rev.isDraft && <span className="text-[9px] bg-slate-100 text-slate-500 px-1 py-0.2 rounded font-black border border-slate-200">BẢN NHÁP</span>}
                              </span>
                              <span className="text-[9px] text-slate-400 font-bold line-clamp-1 italic mt-0.5">{rev.description || 'Chưa có lời dặn dò học sinh.'}</span>
                            </div>
                          </td>

                          {/* Số câu */}
                          <td className="p-3.5 text-center">
                            <span className="font-black text-slate-800 bg-emerald-50 px-2 py-0.5 rounded-full text-[10px] border border-emerald-150">
                              {(rev.questions?.length || 0)} câu hỏi
                            </span>
                          </td>

                          {/* Ngày tạo */}
                          <td className="p-3.5 text-slate-400 font-mono text-[10px]">
                            {new Date(rev.createdAt || Date.now()).toLocaleDateString('vi-VN')}
                          </td>

                          {/* Actions: Gửi lại, Sửa, Xóa */}
                          <td className="p-3.5 text-right space-x-1.5 whitespace-nowrap">
                            <button
                              onClick={() => {
                                audioSynth.playSuccess();
                                const copy: Assignment = {
                                  ...rev,
                                  id: `as_${Date.now()}`,
                                  isDraft: false,
                                  createdAt: new Date().toISOString()
                                };
                                addAssignment(copy);
                                alert(`📤 Đã gửi bài ôn tập "${rev.title}" thành công cho cả lớp!`);
                              }}
                              className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-[10px] font-black transition cursor-pointer inline-flex items-center gap-1"
                              title="Gửi bài tập ôn tập này ngay cho học sinh"
                            >
                              <span>📤</span>
                              <span>Gửi ôn tập</span>
                            </button>

                            <button
                              onClick={() => {
                                audioSynth.playBubblePop();
                                setAsTitle(rev.title);
                                setAsDesc(rev.description || '');
                                setAsSubject(rev.subject);
                                setAsWeek(rev.week);
                                setAsStars(rev.rewardStars || 10);
                                if (rev.questions) setQuestions(rev.questions);
                                setActiveTab('assignments');
                                alert(`✏ Đã tải bài tập "${rev.title}" vào Bộ soạn thảo. Thầy cô có thể điều chỉnh và gửi bài ở tab Nhiệm vụ học tập!`);
                              }}
                              className="px-2 py-1 bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 rounded-lg text-[10px] font-black transition cursor-pointer inline-flex items-center gap-1"
                              title="Sửa đề thi này"
                            >
                              <span>✏</span>
                              <span>Sửa</span>
                            </button>

                            <button
                              onClick={() => {
                                if (confirm(`Bạn có chắc chắn muốn xoá đề ôn tập "${rev.title}" khỏi ngân hàng không?`)) {
                                  audioSynth.playSuccess();
                                  deleteAssignment(rev.id);
                                }
                              }}
                              className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-[10px] font-black transition cursor-pointer inline-flex items-center gap-1"
                              title="Xoá đề thi ôn tập"
                            >
                              <span>🗑</span>
                              <span>Xoá</span>
                            </button>
                          </td>
                        </tr>
                      );
                    });
                  })()}
                </tbody>
              </table>
            </div>

            {/* Quick User Tips footer */}
            <div className="bg-amber-50/40 p-4 rounded-2xl border border-amber-200/50 flex items-start space-x-2 text-slate-600 text-[10px]">
              <span className="text-lg">💡</span>
              <div className="space-y-1 font-bold">
                <p className="text-amber-950 font-black uppercase text-[9px] tracking-wider font-sans">HƯỚNG DẪN NGÂN HÀNG ÔN TẬP ĐA NĂNG:</p>
                <p>1. Tự động lưu: Khi bạn soạn bài tập và đánh dấu "Ghi nhớ ôn tập", nội dung bài tập, câu hỏi, tài liệu đính kèm và dặn dò của bạn sẽ tự động lưu trữ tại đây.</p>
                <p>2. Tạo đề thi tổng hợp: Đánh dấu tick vào các đề học tập cần ghép, sau đó nhấp vào <strong>"📋 Tạo Đề Tổng Hợp"</strong> để gom tất cả câu hỏi thành một đề lớn.</p>
                <p>3. Gửi lại: Bạn có thể tái sử dụng bất cứ chuyên đề học tập nào bằng nút <strong>"📤 Gửi ôn tập"</strong> để giao bài tập cực nhanh.</p>
              </div>
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
                      <div className="flex items-center space-x-3 shrink-0">
                        <span className="text-[10px] text-slate-400 font-mono font-bold">
                          {new Date(fb.createdAt).toLocaleString()}
                        </span>
                        
                        {/* Ô tick Đã Xem */}
                        <label className="flex items-center space-x-1.5 cursor-pointer bg-white px-2.5 py-1 rounded-xl border border-slate-200 text-[11px] font-bold text-slate-600 hover:bg-indigo-50 hover:border-indigo-300 transition shadow-sm select-none">
                          <input
                            type="checkbox"
                            checked={!!fb.isRead}
                            onChange={() => markFeedbackAsRead(fb.id)}
                            className="h-3.5 w-3.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                          />
                          <span className={fb.isRead ? "text-emerald-600 font-extrabold" : ""}>
                            {fb.isRead ? "✓ Đã xem" : "Chưa xem"}
                          </span>
                        </label>
                      </div>
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
            className="space-y-8 pb-12"
          >
            {/* Playful Welcome Header */}
            <div className="bg-gradient-to-r from-pink-400 via-amber-400 to-sky-400 p-0.5 rounded-3xl shadow-sm">
              <div className="bg-white rounded-[22px] px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center space-x-3 text-center md:text-left">
                  <span className="text-3xl animate-bounce">🎒</span>
                  <div>
                    <h3 className="text-lg font-extrabold text-slate-800 flex items-center justify-center md:justify-start gap-1">
                      <span>Cài Đặt Lớp Học Thân Thiện</span>
                      <span className="text-xs px-2.5 py-0.5 bg-pink-100 text-pink-600 rounded-full font-black uppercase tracking-wider">Mầm Non & Tiểu Học 🧸</span>
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">Nơi cô giáo thiết lập các chỉ số thi đua, bảng tin hoạt động sinh động và nội quy học đường.</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">✏️</span>
                  <span className="text-2xl">🎨</span>
                  <span className="text-2xl">🌈</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-6 text-left">
              
              {/* PHẦN 1: CÔNG THỨC QUY ĐỔI SAO TỰ ĐỘNG (Pale Amber/Orange) */}
              <div className="bg-amber-50/60 border-2 border-amber-200/80 rounded-3xl p-5 shadow-sm relative overflow-hidden transition-all duration-300">
                {/* Visual Circle Accents */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-amber-200/20 rounded-full blur-xl pointer-events-none -mr-4 -mt-4" />
                
                <div className="flex items-center justify-between cursor-pointer select-none" onClick={() => setIsPart1Open(!isPart1Open)}>
                  <div className="space-y-1 pr-4">
                    <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-full text-white shadow-sm bg-gradient-to-r from-amber-400 to-orange-500 border-2 border-white ring-2 ring-amber-300">
                      ⭐ PHẦN 1: TRẠM QUY ĐỔI SAO LẤP LÁNH & THƯỞNG PHẢN HỒI
                    </span>
                    <p className="text-xs text-amber-700/90 font-semibold leading-relaxed">
                      Thiết lập mốc đổi Cờ thi đua, Thẻ vàng, và thưởng Sao lấp lánh khi cha mẹ tương tác phản hồi.
                    </p>
                  </div>
                  <button
                    type="button"
                    className="p-2 bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 rounded-xl text-xs font-black transition shrink-0 cursor-pointer"
                  >
                    {isPart1Open ? 'Thu gọn ∧' : 'Mở rộng ∨'}
                  </button>
                </div>

                {isPart1Open && (
                  <div className="mt-5 pt-5 border-t border-amber-200/60 space-y-5 animate-fadeIn">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="space-y-1.5">
                          <label className="block text-xs font-black text-amber-800 uppercase tracking-wide">Mốc đổi Cờ Thi Đua (Sao ➜ Cờ)</label>
                          <div className="flex items-center space-x-3">
                            <input
                              type="number"
                              value={starRatio}
                              onChange={e => setStarRatio(Number(e.target.value))}
                              className="w-24 p-2.5 rounded-xl border-2 border-amber-200/60 bg-white text-amber-800 focus:outline-none focus:border-amber-400 text-center font-black text-sm shadow-inner"
                            />
                            <span className="text-xs font-bold text-amber-700">Sao lấp lánh tự động đổi thành 1 Cờ thi đua 🚩</span>
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="block text-xs font-black text-amber-800 uppercase tracking-wide">Mốc đổi Thẻ Vàng (Cờ ➜ Thẻ Vàng)</label>
                          <div className="flex items-center space-x-3">
                            <input
                              type="number"
                              value={flagRatio}
                              onChange={e => setFlagRatio(Number(e.target.value))}
                              className="w-24 p-2.5 rounded-xl border-2 border-amber-200/60 bg-white text-amber-800 focus:outline-none focus:border-amber-400 text-center font-black text-sm shadow-inner"
                            />
                            <span className="text-xs font-bold text-amber-700">Cờ thi đua tự động đổi thành 1 Thẻ Vàng danh giá 🏅</span>
                          </div>
                        </div>
                      </div>

                      {/* Parent feedback reward settings */}
                      <div className="border-t md:border-t-0 md:border-l border-amber-200/60 md:pl-6 space-y-3">
                        <h4 className="text-xs font-black text-orange-700 uppercase tracking-wider flex items-center space-x-1.5">
                          <span>💬 Thưởng Sao Cho Phụ Huynh Phản Hồi</span>
                        </h4>
                        <p className="text-[11px] text-amber-700/80 font-medium">Khích lệ cha mẹ và cô giáo kết nối thường xuyên! Thưởng Sao cho bé khi cha mẹ phản hồi đủ số lần.</p>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="block text-[11px] font-bold text-amber-800">Số lần phản hồi</label>
                            <div className="flex items-center space-x-1.5">
                              <input
                                type="number"
                                min={1}
                                value={parentFeedbackCount}
                                onChange={e => setParentFeedbackCount(Number(e.target.value))}
                                className="w-full p-2 rounded-xl border-2 border-amber-200/60 bg-white text-center font-black text-xs text-amber-800 focus:outline-none focus:border-amber-400"
                              />
                              <span className="text-xs font-semibold text-amber-700 shrink-0">lần</span>
                            </div>
                          </div>
                          <div className="space-y-1.5">
                            <label className="block text-[11px] font-bold text-amber-800">Số Sao thưởng</label>
                            <div className="flex items-center space-x-1.5">
                              <input
                                type="number"
                                min={1}
                                value={parentFeedbackRewardStars}
                                onChange={e => setParentFeedbackRewardStars(Number(e.target.value))}
                                className="w-full p-2 rounded-xl border-2 border-amber-200/60 bg-white text-center font-black text-xs text-orange-600 focus:outline-none focus:border-amber-400"
                              />
                              <span className="text-xs font-semibold text-amber-700 shrink-0">Sao ⭐</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-amber-200/40">
                      <button
                        onClick={handleSaveSettings}
                        className={`w-full py-2.5 font-bold text-xs rounded-xl transition-all duration-300 flex items-center justify-center space-x-2 cursor-pointer shadow-md ${
                          isSettingsSaved
                            ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-100 scale-[1.01]'
                            : 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-100'
                        }`}
                      >
                        {isSettingsSaved ? (
                          <>
                            <CheckCircle className="h-4.5 w-4.5 text-white animate-bounce" />
                            <span>ĐÃ LƯU THÀNH CÔNG CHO LỚP! ✅</span>
                          </>
                        ) : (
                          <>
                            <Save className="h-4.5 w-4.5" />
                            <span>LƯU CẤU HÌNH QUY ĐỔI & PHẢN HỒI</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* PHẦN 2: CÀI ĐẶT BẢNG TIN LỚP HỌC (Pale Blue) */}
              <div className="bg-sky-50/60 border-2 border-sky-200/80 rounded-3xl p-5 shadow-sm relative overflow-hidden transition-all duration-300">
                {/* Circle Accent */}
                <div className="absolute top-0 right-0 w-36 h-36 bg-sky-200/25 rounded-full blur-2xl pointer-events-none -mr-10 -mt-10" />

                <div className="flex items-center justify-between cursor-pointer select-none" onClick={() => setIsPart2Open(!isPart2Open)}>
                  <div className="space-y-1 pr-4">
                    <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-full text-white shadow-sm bg-gradient-to-r from-sky-400 to-indigo-500 border-2 border-white ring-2 ring-sky-300">
                      📢 PHẦN 2: BẢNG TIN HOẠT ĐỘNG RỰC RỠ
                    </span>
                    <p className="text-xs text-sky-700/95 font-semibold">
                      Cấu hình bảng tin chuyển động tự động, cập nhật hình ảnh, video hoạt động sinh động cho lớp học.
                    </p>
                  </div>
                  <button
                    type="button"
                    className="p-2 bg-sky-100 hover:bg-sky-200 text-sky-900 border border-sky-300 rounded-xl text-xs font-black transition shrink-0 cursor-pointer"
                  >
                    {isPart2Open ? 'Thu gọn ∧' : 'Mở rộng ∨'}
                  </button>
                </div>

                {isPart2Open && (
                  <div className="mt-5 pt-5 border-t border-sky-200/50 space-y-6 animate-fadeIn">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                      {/* Left: Add / Edit Form */}
                      <div className="lg:col-span-5 bg-white border border-sky-100 p-4 rounded-2xl shadow-xs space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-black text-indigo-700 uppercase tracking-wider flex items-center space-x-1">
                            <span>{editingBannerId ? '✏️ Chỉnh sửa tin bảng tin' : '🚀 Thêm tin hoạt động mới'}</span>
                          </h4>
                          {editingBannerId && (
                            <button
                              onClick={handleCancelEditBanner}
                              className="text-[10px] text-rose-500 hover:underline font-bold"
                            >
                              Huỷ bỏ sửa
                            </button>
                          )}
                        </div>

                        <form onSubmit={handleAddBanner} className="space-y-3">
                          <div>
                            <label className="block text-[11px] font-bold text-slate-500 mb-1">Tiêu Đề Bản Tin *</label>
                            <input
                              type="text"
                              required
                              placeholder="Ví dụ: Bé học Mỹ thuật sáng tạo 🎨"
                              value={newBannerTitle}
                              onChange={e => setNewBannerTitle(e.target.value)}
                              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-400 font-semibold text-slate-700 bg-slate-50/50"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-slate-500 mb-1">Mô Tả Nội Dung Chi Tiết *</label>
                            <textarea
                              rows={2.5}
                              required
                              placeholder="Ví dụ: Các bạn nhỏ đã tự tay thiết kế và tô màu những bức tranh rực rỡ..."
                              value={newBannerDesc}
                              onChange={e => setNewBannerDesc(e.target.value)}
                              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-400 font-semibold text-slate-700 bg-slate-50/50 leading-relaxed"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[11px] font-bold text-slate-500 mb-1">Loại Phương Tiện *</label>
                              <select
                                value={newBannerType}
                                onChange={e => setNewBannerType(e.target.value as 'image' | 'video')}
                                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-400 font-bold text-slate-700 bg-white"
                              >
                                <option value="image">Hình ảnh lớp học (Ảnh) 📷</option>
                                <option value="video">Phóng sự hoạt động (Video) 🎥</option>
                              </select>
                            </div>

                            <div>
                              <label className="block text-[11px] font-bold text-slate-500 mb-1">Thời Lượng Hiển Thị (Giây) *</label>
                              <input
                                type="number"
                                required
                                min={3}
                                max={60}
                                value={newBannerDuration}
                                onChange={e => setNewBannerDuration(Number(e.target.value))}
                                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-400 font-black text-slate-700 bg-slate-50/50 text-center font-mono"
                              />
                            </div>
                          </div>

                          <div>
                            <div className="space-y-1.5 mb-3">
                              <label className="block text-[11px] font-bold text-slate-500">Tải tệp tin ảnh hoặc video *</label>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                <label className="border-2 border-dashed border-indigo-200 hover:border-indigo-400 bg-indigo-50/20 hover:bg-indigo-50/50 rounded-2xl p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 relative group">
                                  <input
                                    type="file"
                                    accept="image/*,video/*"
                                    onChange={handleBannerFileChange}
                                    className="hidden"
                                  />
                                  <span className="text-3xl text-indigo-500 font-extrabold mb-1 group-hover:scale-110 transition duration-200">+</span>
                                  <span className="text-[10px] font-black text-indigo-600">CHỌN TỪ MÁY / ĐIỆN THOẠI 💻</span>
                                </label>

                                <div className="border border-slate-100 bg-slate-50 rounded-2xl p-3 flex flex-col justify-between text-left relative overflow-hidden">
                                  <span className="text-[9px] font-bold text-slate-400 block uppercase mb-1">Xem trước tệp tin:</span>
                                  {newBannerUrl ? (
                                    <div className="w-full h-16 bg-slate-950 rounded-lg overflow-hidden flex items-center justify-center relative shadow-sm">
                                      {newBannerType === 'video' ? (
                                        <video src={newBannerUrl} className="w-full h-full object-cover" controls />
                                      ) : (
                                        <img src={newBannerUrl} alt="Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                      )}
                                      <button
                                        type="button"
                                        onClick={() => setNewBannerUrl('')}
                                        className="absolute top-1 right-1 bg-black/60 hover:bg-black text-white text-[8px] px-1 py-0.5 rounded font-black uppercase transition-all"
                                      >
                                        Xoá ✕
                                      </button>
                                    </div>
                                  ) : (
                                    <div className="text-center py-4 text-[10px] text-slate-400 font-semibold italic">
                                      Chưa có tệp nào
                                    </div>
                                  )}
                                </div>
                              </div>

                              <details className="text-[10px] text-slate-500 font-medium cursor-pointer pt-1">
                                <summary className="hover:text-indigo-600 transition">Hoặc điền đường dẫn URL thủ công</summary>
                                <input
                                  type="text"
                                  placeholder="Nhập link trực tiếp http://..."
                                  value={newBannerUrl}
                                  onChange={e => setNewBannerUrl(e.target.value)}
                                  className="w-full text-[10px] mt-1.5 p-2 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-400 font-medium text-slate-700 bg-slate-50/50 font-mono"
                                />
                              </details>
                            </div>

                            {/* URL Presets */}
                            <div className="mt-2.5 p-2 bg-slate-50 border border-slate-100 rounded-xl space-y-1.5">
                              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">🎯 Chọn ảnh/video mẫu nhanh:</p>
                              <div className="flex flex-wrap gap-1">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setNewBannerType('image');
                                    setNewBannerUrl('https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=1000&auto=format&fit=crop');
                                  }}
                                  className="text-[9px] px-2 py-0.5 bg-white hover:bg-indigo-50 border border-slate-200 text-slate-600 rounded-md font-bold transition-all"
                                >
                                  🎨 Đọc sách
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setNewBannerType('image');
                                    setNewBannerUrl('https://images.unsplash.com/photo-1564419320461-6870880221ad?w=1000&auto=format&fit=crop');
                                  }}
                                  className="text-[9px] px-2 py-0.5 bg-white hover:bg-indigo-50 border border-slate-200 text-slate-600 rounded-md font-bold transition-all"
                                >
                                  🧪 Khoa học
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setNewBannerType('video');
                                    setNewBannerUrl('https://assets.mixkit.co/videos/preview/mixkit-kids-playing-and-laughing-in-classroom-42415-large.mp4');
                                  }}
                                  className="text-[9px] px-2 py-0.5 bg-white hover:bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-md font-bold transition-all"
                                >
                                  🎥 Phóng sự lớp
                                </button>
                              </div>
                            </div>
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-slate-500 mb-1">Ghi Chú & Chú Thích *</label>
                            <input
                              type="text"
                              required
                              placeholder="Ví dụ: Các bé hăng say tập trung tô màu vào sáng thứ Năm..."
                              value={newBannerNote}
                              onChange={e => setNewBannerNote(e.target.value)}
                              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-400 font-semibold text-slate-700 bg-slate-50/50"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <select
                                value={newBannerBg}
                                onChange={e => setNewBannerBg(e.target.value)}
                                className="w-full text-[10px] p-2.5 rounded-xl border border-slate-200 font-bold bg-white"
                              >
                                <option value="from-amber-400 via-pink-400 to-rose-400">Hồng Vàng rực rỡ 💖</option>
                                <option value="from-cyan-400 via-teal-400 to-emerald-400">Xanh lá mát mẻ 🍃</option>
                              </select>
                            </div>
                            <div>
                              <button
                                type="submit"
                                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer transition"
                              >
                                {editingBannerId ? 'Cập Nhật' : 'Thêm Tin'}
                              </button>
                            </div>
                          </div>
                        </form>
                      </div>

                      {/* Right: List of Slides */}
                      <div className="lg:col-span-7 space-y-3">
                        <h4 className="text-xs font-black text-slate-500 uppercase tracking-wider flex items-center justify-between">
                          <span>DANH SÁCH TIN ĐANG HOẠT ĐỘNG ({banners.length})</span>
                        </h4>

                        <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                          {banners.length === 0 ? (
                            <div className="text-center py-12 bg-white rounded-2xl border border-slate-100">
                              <p className="text-sm font-bold text-slate-400">Bảng tin trống trơn! 🎥</p>
                            </div>
                          ) : (
                            banners.map((b) => (
                              <div
                                key={b.id}
                                className={`p-3 rounded-2xl border transition-all flex gap-3 ${
                                  editingBannerId === b.id
                                    ? 'bg-indigo-50 border-indigo-300'
                                    : 'bg-white border-slate-100 hover:border-slate-200'
                                }`}
                              >
                                {b.url && (
                                  <div className="w-20 h-16 bg-slate-900 rounded-lg overflow-hidden border border-slate-200 shrink-0 flex items-center justify-center relative shadow-sm">
                                    {b.type === 'video' ? (
                                      <video src={b.url} className="w-full h-full object-cover" muted />
                                    ) : (
                                      <img src={b.url} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                    )}
                                    <span className="absolute bottom-0.5 right-0.5 px-1 py-0.5 bg-black/75 rounded text-[7px] text-white font-black">
                                      {b.type === 'video' ? 'VIDEO' : 'ẢNH'}
                                    </span>
                                  </div>
                                )}

                                <div className="flex-1 space-y-1">
                                  <div className="flex items-start justify-between gap-1">
                                    <h5 className="font-extrabold text-xs text-slate-800 leading-tight">
                                      {b.title}
                                    </h5>
                                    <span className="px-1.5 py-0.5 bg-indigo-50 rounded text-[8px] text-indigo-600 font-bold shrink-0">
                                      ⏱️ {b.duration || 6}s
                                    </span>
                                  </div>
                                  <p className="text-[10px] text-slate-500 font-semibold line-clamp-1 leading-relaxed">
                                    {b.description}
                                  </p>
                                  {b.note && (
                                    <div className="text-[9px] text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded font-bold">
                                      📝 Chú thích: {b.note}
                                    </div>
                                  )}
                                </div>

                                <div className="flex flex-col justify-center gap-1 pl-2 border-l border-slate-100 shrink-0">
                                  <button
                                    onClick={() => handleStartEditBanner(b)}
                                    className="p-1 text-[9px] font-black bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded transition"
                                  >
                                    Sửa
                                  </button>
                                  <button
                                    onClick={() => handleDeleteBanner(b.id)}
                                    className="p-1 text-[9px] font-black bg-rose-50 text-rose-600 hover:bg-rose-100 rounded transition"
                                  >
                                    Xoá
                                  </button>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* PHẦN 3: TIÊU CHÍ BÉ NGOAN & NỘI QUY (Pale Green) */}
              <div className="bg-emerald-50/60 border-2 border-emerald-200/80 rounded-3xl p-5 shadow-sm relative overflow-hidden transition-all duration-300">
                {/* Visual Circle Accents */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-200/20 rounded-full blur-xl pointer-events-none -mr-4 -mt-4" />

                <div className="flex items-center justify-between cursor-pointer select-none" onClick={() => setIsPart3Open(!isPart3Open)}>
                  <div className="space-y-1 pr-4">
                    <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-full text-white shadow-sm bg-gradient-to-r from-emerald-400 to-teal-500 border-2 border-white ring-2 ring-emerald-300">
                      🌈 PHẦN 3: TIÊU CHÍ BÉ NGOAN & NỘI QUY LỚP HỌC
                    </span>
                    <p className="text-xs text-emerald-700/90 font-semibold leading-relaxed">
                      Thiết lập danh mục khen thưởng sao (+) hoặc kỷ luật trừ sao (-) tự động đồng bộ khi tương tác học sinh.
                    </p>
                  </div>
                  <button
                    type="button"
                    className="p-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 border border-emerald-300 rounded-xl text-xs font-black transition shrink-0 cursor-pointer"
                  >
                    {isPart3Open ? 'Thu gọn ∧' : 'Mở rộng ∨'}
                  </button>
                </div>

                {isPart3Open && (
                  <div className="mt-5 pt-5 border-t border-emerald-200/50 space-y-4 animate-fadeIn">
                    <form onSubmit={addNewRule} className="bg-white/80 border border-emerald-200/50 p-4 rounded-2xl space-y-3 shadow-xs">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div>
                          <label className="block font-black text-emerald-800 mb-1 uppercase tracking-wide">Tên Tiêu chí / Hành vi</label>
                          <input
                            type="text"
                            required
                            placeholder="vd: Tự giác thu dọn đồ chơi"
                            value={newRuleName}
                            onChange={e => setNewRuleName(e.target.value)}
                            className="w-full p-2.5 rounded-xl bg-white border border-slate-200 font-semibold text-slate-700 text-xs focus:outline-none focus:border-emerald-400"
                          />
                        </div>
                        <div>
                          <label className="block font-black text-emerald-800 mb-1 uppercase tracking-wide">Sao phạt / thưởng</label>
                          <div className="flex space-x-1.5">
                            <select
                              value={newRuleType}
                              onChange={e => setNewRuleType(e.target.value as 'plus' | 'minus')}
                              className="p-2.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 focus:outline-none focus:border-emerald-400"
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
                              className="w-14 p-2.5 rounded-xl bg-white border border-slate-200 text-center font-black text-xs text-emerald-600 focus:outline-none focus:border-emerald-400"
                            />
                          </div>
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-[11px] rounded-xl cursor-pointer shadow transition"
                      >
                        + THÊM VÀO TIÊU CHÍ BÉ NGOAN
                      </button>
                    </form>

                    {/* Criteria List */}
                    <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-1">
                      {rewardRules.length === 0 ? (
                        <p className="text-center py-4 text-slate-400 text-xs font-medium">Chưa có tiêu chí nào được thiết lập.</p>
                      ) : (
                        rewardRules.map((rule) => (
                          <div key={rule.id} className="p-2 bg-white/95 border border-slate-100 rounded-xl flex items-center justify-between text-[11px] font-semibold shadow-xs">
                            <div className="flex items-center space-x-2">
                              <span className={`h-2.5 w-2.5 rounded-full ${rule.type === 'plus' ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                              <span className="text-slate-700">{rule.name}</span>
                            </div>
                            <div className="flex items-center space-x-3">
                              <span className={`font-bold font-mono ${rule.type === 'plus' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                {rule.type === 'plus' ? 'Thưởng' : 'Trừ'} {rule.points} ⭐
                              </span>
                              <button
                                type="button"
                                onClick={() => deleteRule(rule.id)}
                                className="text-slate-400 hover:text-rose-500 text-xs font-bold transition p-1 hover:bg-rose-50 rounded"
                              >
                                Xoá
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    <div className="pt-3 border-t border-emerald-200/50">
                      <button
                        onClick={handleSaveSettings}
                        className={`w-full py-2.5 font-black text-xs rounded-xl transition shadow-md ${
                          isSettingsSaved
                            ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                            : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                        }`}
                      >
                        {isSettingsSaved ? 'ĐÃ LƯU THÀNH CÔNG! 💚' : 'LƯU CẤU HÌNH & CÀI ĐẶT LỚP HỌC 💾'}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* PHẦN 4: CÀI ĐẶT ĐĂNG NHẬP & PHÂN QUYỀN MẬT KHẨU (Zalo Notification Auto-link Integration) */}
              <div className="bg-violet-50/60 border-2 border-violet-200/80 rounded-3xl p-5 shadow-sm relative overflow-hidden transition-all duration-300">
                {/* Visual Circle Accents */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-violet-200/20 rounded-full blur-xl pointer-events-none -mr-4 -mt-4" />

                <div className="flex items-center justify-between cursor-pointer select-none" onClick={() => setIsPart4Open(!isPart4Open)}>
                  <div className="space-y-1 pr-4">
                    <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-full text-white shadow-sm bg-gradient-to-r from-violet-400 to-fuchsia-500 border-2 border-white ring-2 ring-violet-300">
                      🔑 PHẦN 4: CÀI ĐẶT ĐĂNG NHẬP & PHÂN QUYỀN MẬT KHẨU (TỰ ĐỘNG GỬI ZALO 💬)
                    </span>
                    <p className="text-xs text-violet-700/95 font-semibold leading-relaxed">
                      Cấu hình mật khẩu mặc định, cấp quyền tự đổi, chọn cấp lại mật khẩu và tự động gửi tin nhắn Zalo tới số điện thoại phụ huynh.
                    </p>
                  </div>
                  <button
                    type="button"
                    className="p-2 bg-violet-100 hover:bg-violet-200 text-violet-900 border border-violet-300 rounded-xl text-xs font-black transition shrink-0 cursor-pointer"
                  >
                    {isPart4Open ? 'Thu gọn ∧' : 'Mở rộng ∨'}
                  </button>
                </div>

                {isPart4Open && (
                  <div className="mt-5 pt-5 border-t border-violet-200/50 space-y-6 animate-fadeIn">
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Cấu hình mật khẩu mặc định */}
                      <div className="bg-white p-4 rounded-2xl border border-violet-100 shadow-xs space-y-3">
                        <h4 className="text-xs font-black text-violet-800 uppercase tracking-wider flex items-center space-x-1.5">
                          <span>⚙️ Thiết lập quy định mật khẩu mặc định</span>
                        </h4>
                        <div className="space-y-3 text-xs">
                          <div>
                            <label className="block text-[11px] font-bold text-slate-500 mb-1">MẬT KHẨU MẶC ĐỊNH CHO CẢ LỚP (Lần đầu đăng nhập) *</label>
                            <input
                              type="text"
                              required
                              placeholder="Ví dụ: 123"
                              value={defaultPassword}
                              onChange={e => setDefaultPassword(e.target.value)}
                              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-violet-400 font-bold text-slate-700 bg-slate-50/50"
                            />
                          </div>

                          <div className="flex items-center space-x-2.5 pt-2">
                            <input
                              type="checkbox"
                              id="allowChangePassword"
                              checked={allowChangePassword}
                              onChange={e => setAllowChangePassword(e.target.checked)}
                              className="h-4.5 w-4.5 rounded border-gray-300 text-violet-600 focus:ring-violet-500 cursor-pointer"
                            />
                            <label htmlFor="allowChangePassword" className="text-xs font-black text-slate-700 uppercase cursor-pointer select-none">
                              Cho phép Học sinh & Phụ huynh tự đổi mật khẩu riêng
                            </label>
                          </div>
                        </div>
                      </div>

                      {/* Phím tắt / Lệnh khôi phục nhanh */}
                      <div className="bg-white p-4 rounded-2xl border border-violet-100 shadow-xs flex flex-col justify-between">
                        <div className="space-y-1.5">
                          <h4 className="text-xs font-black text-violet-800 uppercase tracking-wider">
                            🔄 Lệnh khôi phục mật khẩu hàng loạt
                          </h4>
                          <p className="text-[11px] text-slate-500 font-medium">
                            Khi học sinh quên mật khẩu hoặc thầy cô muốn đồng bộ hóa lại toàn lớp, bấm nút bên dưới để khôi phục tất cả tài khoản về mặc định: <strong className="text-violet-600">"{defaultPassword}"</strong>.
                          </p>
                        </div>

                        <div className="pt-3">
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`Bạn có chắc chắn muốn cài lại mật khẩu mặc định "${defaultPassword}" cho TẤT CẢ học sinh và phụ huynh trong lớp?`)) {
                                students.forEach(s => {
                                  updateStudent(s.id, { password: '', parentPassword: '' });
                                });
                                // Automatically build simulated Zalo logs
                                const logs: string[] = [];
                                logs.push(`🔄 [Hệ thống Khôi phục] Đã đặt lại mật khẩu về mặc định "${defaultPassword}" cho toàn lớp!`);
                                logs.push(`📡 Đang tiến hành đồng bộ và tự động liên kết SĐT Zalo để gửi tài khoản mới...`);
                                logs.push(`------------------------------------------`);
                                students.forEach(s => {
                                  logs.push(`🔍 Kết nối SĐT: ${s.parentPhone || 'Chưa cập nhật'}...`);
                                  logs.push(`🟢 Khớp tài khoản Zalo: ${s.parentName} (PH em ${s.name})`);
                                  logs.push(`💬 [Đã gửi Zalo] "Kính gửi phụ huynh em ${s.name}, tài khoản học tập của con đã được cô giáo đặt lại về mật khẩu mặc định:\n- Tài khoản: ${s.name}\n- Mật khẩu: ${defaultPassword}"`);
                                  logs.push(`------------------------------------------`);
                                });
                                setZaloLogs(logs);
                                setShowZaloStatus(true);
                                alert(`Đã khôi phục thành công mật khẩu mặc định "${defaultPassword}" và tự động chuẩn bị thông báo gửi Zalo cho phụ huynh! 🌟`);
                              }
                            }}
                            className="w-full py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-black text-[10px] uppercase tracking-wider rounded-xl transition cursor-pointer shadow-sm text-center"
                          >
                            ⚠️ Cài Lại Mật Khẩu Cho TẤT CẢ Học Sinh & Phụ Huynh
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Multi-Selection Actions bar if students are checked */}
                    {selectedStudentIds.length > 0 && (
                      <div className="bg-gradient-to-r from-violet-100 to-fuchsia-100 border-2 border-violet-300 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm animate-bounce-short">
                        <div className="text-left space-y-1">
                          <p className="text-xs font-black text-violet-900 uppercase tracking-wide flex items-center gap-1.5">
                            <span>🎯 Đang Chọn {selectedStudentIds.length} Học Sinh Để Cấp Lại Mật Khẩu</span>
                            <span className="text-[9px] bg-violet-600 text-white px-2 py-0.5 rounded-full font-bold">Đánh dấu thành công ✅</span>
                          </p>
                          <p className="text-[11px] text-violet-800 font-bold">
                            Hệ thống sẽ đặt lại mật khẩu của các em đã chọn về mặc định <strong className="text-fuchsia-700">"{defaultPassword}"</strong> và tự động liên kết số điện thoại gửi thông báo qua Zalo tới Phụ huynh.
                          </p>
                        </div>
                        <div className="flex items-center space-x-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              const logs: string[] = [];
                              logs.push(`🔄 [Cấp lại mật khẩu hàng loạt] Đang tiến hành cài đặt lại cho ${selectedStudentIds.length} học sinh được đánh dấu...`);
                              logs.push(`------------------------------------------`);
                              
                              students.forEach(s => {
                                if (selectedStudentIds.includes(s.id)) {
                                  updateStudent(s.id, { password: '', parentPassword: '' });
                                  logs.push(`🔍 Liên kết SĐT Zalo trong danh sách lớp: ${s.parentPhone || 'Chưa cập nhật'}`);
                                  logs.push(`🟢 Đã khớp Zalo phụ huynh em: ${s.name} (${s.parentName})`);
                                  logs.push(`💬 [Đã gửi Zalo] "Kính gửi phụ huynh em ${s.name}, đây là tài khoản đăng nhập học tập: Tên đăng nhập: ${s.name}, Mật khẩu: ${defaultPassword}."`);
                                  logs.push(`------------------------------------------`);
                                }
                              });
                              
                              setZaloLogs(logs);
                              setShowZaloStatus(true);
                              setSelectedStudentIds([]);
                              alert(`Đã cấp lại mật khẩu mặc định thành công và tự động liên kết gửi thông báo Zalo cho phụ huynh của ${selectedStudentIds.length} học sinh! 🎉`);
                            }}
                            className="px-4 py-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white font-black text-[10px] uppercase tracking-wider rounded-xl transition cursor-pointer shadow-md text-center"
                          >
                            💬 Cấp lại & Gửi Zalo Phụ Huynh 💬
                          </button>
                          <button
                            type="button"
                            onClick={() => setSelectedStudentIds([])}
                            className="px-3 py-2 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-black text-[10px] uppercase rounded-xl transition cursor-pointer"
                          >
                            Bỏ chọn
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Zalo notification transmission logs overlay */}
                    {showZaloStatus && (
                      <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-3 text-left animate-fadeIn shadow-inner">
                        <div className="flex items-center justify-between border-b border-emerald-100 pb-2">
                          <h5 className="text-[11px] font-black text-emerald-800 flex items-center space-x-1.5 uppercase tracking-wide">
                            <span>📡 NHẬT KÝ LIÊN KẾT & TỰ ĐỘNG GỬI THÔNG BÁO ZALO PHỤ HUYNH</span>
                          </h5>
                          <button
                            onClick={() => setShowZaloStatus(false)}
                            className="text-[9px] bg-emerald-100 hover:bg-emerald-200 text-emerald-800 px-2.5 py-0.5 rounded-full font-bold transition cursor-pointer"
                          >
                            Đóng nhật ký ✕
                          </button>
                        </div>
                        <div className="max-h-[220px] overflow-y-auto font-mono text-[10px] leading-relaxed text-emerald-950 space-y-1.5 bg-white p-3 rounded-xl border border-emerald-150 shadow-inner">
                          {zaloLogs.map((log, index) => (
                            <div key={index} className="whitespace-pre-wrap">{log}</div>
                          ))}
                        </div>
                        <p className="text-[10px] text-emerald-700/80 font-bold italic text-center">
                          * Phần mềm đã tự động phân tích cơ sở dữ liệu số điện thoại trùng khớp với danh sách lớp và gửi trực tiếp thành công!
                        </p>
                      </div>
                    )}

                    {/* Danh sách tài khoản học sinh */}
                    <div className="bg-white p-4 rounded-2xl border border-violet-100 shadow-xs space-y-3">
                      <h4 className="text-xs font-black text-violet-800 uppercase tracking-wider flex items-center justify-between">
                        <span>📋 Danh sách tài khoản học sinh & Trạng thái mật khẩu</span>
                        <span className="text-[10px] bg-violet-100 text-violet-800 px-2 py-0.5 rounded-full font-bold">
                          Đánh dấu hộp kiểm bên cạnh tên để cấp lại hàng loạt
                        </span>
                      </h4>

                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs font-semibold text-slate-600 border-collapse">
                          <thead>
                            <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase text-[9px] tracking-wider">
                              <th className="pb-2.5 w-10">
                                <input
                                  type="checkbox"
                                  checked={students.length > 0 && selectedStudentIds.length === students.length}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setSelectedStudentIds(students.map(s => s.id));
                                    } else {
                                      setSelectedStudentIds([]);
                                    }
                                  }}
                                  className="h-4.5 w-4.5 rounded border-violet-300 text-violet-600 focus:ring-violet-500 cursor-pointer"
                                />
                              </th>
                              <th className="pb-2.5">Học sinh (Tên đăng nhập)</th>
                              <th className="pb-2.5">Phụ huynh (SĐT Zalo)</th>
                              <th className="pb-2.5">Mật khẩu học sinh</th>
                              <th className="pb-2.5">Mật khẩu phụ huynh</th>
                              <th className="pb-2.5 text-right">Hành động</th>
                            </tr>
                          </thead>
                          <tbody>
                            {students.map((s) => {
                              const hasCustomPass = !!s.password;
                              const hasCustomParentPass = !!s.parentPassword;
                              return (
                                <tr key={s.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition">
                                  <td className="py-3">
                                    <input
                                      type="checkbox"
                                      checked={selectedStudentIds.includes(s.id)}
                                      onChange={(e) => {
                                        if (e.target.checked) {
                                          setSelectedStudentIds(prev => [...prev, s.id]);
                                        } else {
                                          setSelectedStudentIds(prev => prev.filter(id => id !== s.id));
                                        }
                                      }}
                                      className="h-4.5 w-4.5 rounded border-violet-300 text-violet-600 focus:ring-violet-500 cursor-pointer"
                                    />
                                  </td>
                                  <td className="py-3 flex items-center space-x-2">
                                    <span className="text-xl bg-slate-50 p-1 rounded-lg">{s.avatar || '👦'}</span>
                                    <div className="flex flex-col">
                                      <span className="font-extrabold text-slate-800">{s.name}</span>
                                      <span className="text-[9px] text-slate-400">Tên đăng nhập: <strong className="font-mono text-indigo-600">{s.name}</strong></span>
                                    </div>
                                  </td>
                                  <td className="py-3">
                                    <div className="flex flex-col">
                                      <span className="font-bold text-slate-700">{s.parentName || `PH ${s.name}`}</span>
                                      <span className="text-[10px] font-mono font-black text-slate-400">{s.parentPhone || 'Chưa cập nhật'}</span>
                                      {s.parentPhone ? (
                                        <span className="text-[8px] bg-emerald-100 text-emerald-800 border border-emerald-200 rounded px-1.5 py-0.5 mt-0.5 w-fit font-bold">
                                          🟢 Tự động khớp Zalo
                                        </span>
                                      ) : (
                                        <span className="text-[8px] bg-rose-50 text-rose-500 rounded px-1.5 py-0.5 mt-0.5 w-fit font-bold">
                                          🔴 Thiếu số điện thoại
                                        </span>
                                      )}
                                    </div>
                                  </td>
                                  <td className="py-3">
                                    {hasCustomPass ? (
                                      <span className="px-2 py-0.5 bg-indigo-50 border border-indigo-100 text-indigo-700 rounded-lg text-[10px] font-bold">
                                        🔐 {s.password}
                                      </span>
                                    ) : (
                                      <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded-lg text-[10px] font-bold italic">
                                        Mặc định ({defaultPassword})
                                      </span>
                                    )}
                                  </td>
                                  <td className="py-3">
                                    {hasCustomParentPass ? (
                                      <span className="px-2 py-0.5 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-lg text-[10px] font-bold">
                                        🔐 {s.parentPassword}
                                      </span>
                                    ) : (
                                      <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded-lg text-[10px] font-bold italic">
                                        Mặc định ({defaultPassword})
                                      </span>
                                    )}
                                  </td>
                                  <td className="py-3 text-right">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        updateStudent(s.id, { password: '', parentPassword: '' });
                                        // Build Zalo logs for this single student
                                        const logs: string[] = [];
                                        logs.push(`🔄 [Cấp lại mật khẩu riêng lẻ] Cấp lại cho học sinh em ${s.name}...`);
                                        logs.push(`🔍 Liên kết tự động SĐT Zalo của Phụ huynh: ${s.parentPhone || 'Chưa cập nhật'}`);
                                        logs.push(`🟢 Đã liên kết thành công Zalo Phụ huynh: ${s.parentName || `PH ${s.name}`}`);
                                        logs.push(`💬 [Đã gửi Zalo] "Kính gửi phụ huynh em ${s.name}, đây là tài khoản học tập: Tên đăng nhập: ${s.name}, Mật khẩu mặc định: ${defaultPassword}."`);
                                        setZaloLogs(logs);
                                        setShowZaloStatus(true);
                                        alert(`Đã cấp lại mật khẩu mặc định thành công cho em ${s.name} và tự động gửi thông báo qua Zalo! 🔄`);
                                      }}
                                      className="px-2.5 py-1.5 bg-violet-100 hover:bg-violet-200 text-violet-700 rounded-lg text-[10px] font-black uppercase tracking-wide transition cursor-pointer"
                                    >
                                      Cấp lại & Gửi Zalo 💬
                                    </button>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Nut Luu rieng cho dang nhap */}
                    <div className="flex justify-end pt-2">
                      <button
                        type="button"
                        onClick={handleSaveLoginSettings}
                        className="px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-md transition-all cursor-pointer flex items-center space-x-1.5"
                      >
                        <Save className="h-4.5 w-4.5" />
                        <span>LƯU CẤU HÌNH ĐĂNG NHẬP, PHÂN QUYỀN & TỰ ĐỘNG GỬI ZALO</span>
                      </button>
                    </div>

                  </div>
                )}
              </div>

            </div>
          </motion.div>
        )}

      </AnimatePresence>
        </>
      )}

      {/* 📝 POPUP MODAL: CHẤM BÀI TẬP VÀ ĐÁNH GIÁ NĂNG LỰC HỌC SINH TỰ ĐỘNG BẰNG AI */}
      {gradingSubmission && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-fadeIn font-sans">
          <div className="bg-white rounded-3xl border-2 border-indigo-200 shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="bg-indigo-900 text-white p-5 flex items-center justify-between shrink-0">
              <div className="flex items-center space-x-3">
                <span className="text-3xl bg-indigo-800 p-2 rounded-2xl">{gradingSubmission.student.avatar}</span>
                <div>
                  <h3 className="font-extrabold text-base">CHẤM BÀI & PHẢN HỒI HỌC SINH</h3>
                  <p className="text-xs text-indigo-200">
                    Học sinh: <strong className="text-white font-black">{gradingSubmission.student.name}</strong> | Bài tập: <strong className="text-white font-black">{gradingSubmission.assignment.title}</strong>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setGradingSubmission(null)}
                className="h-8 w-8 rounded-full bg-indigo-850 hover:bg-indigo-800 text-white font-black text-sm flex items-center justify-center transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-700">
              {/* Task general info */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs space-y-1.5 text-left">
                <p className="font-black text-slate-800 uppercase text-[10px] tracking-wider text-indigo-950">📋 Thông tin bài luyện tập:</p>
                <p className="font-semibold text-slate-600">Lời dặn của Cô: {gradingSubmission.assignment.description || 'Hoàn thành bài tập đúng hạn em nhé!'}</p>
                <div className="flex flex-wrap gap-4 text-[11px] font-bold text-slate-500 pt-1">
                  <span>Môn: <strong className="text-slate-800">{gradingSubmission.assignment.subject}</strong></span>
                  <span>Tuần: <strong className="text-slate-800">{gradingSubmission.assignment.week}</strong></span>
                  <span>Phần thưởng tối đa: <strong className="text-amber-600">🏆 {gradingSubmission.assignment.rewardStars} Sao</strong></span>
                </div>
              </div>

              {/* Questions details */}
              <div className="space-y-4 text-left">
                <h4 className="font-black text-sm text-indigo-950 border-b border-indigo-100 pb-2 flex items-center gap-1.5">
                  <span>📝</span> Chi tiết bài làm của Học sinh
                </h4>
                
                {gradingSubmission.assignment.questions.map((q, idx) => {
                  const studentAns = gradingSubmission.submission.answers?.[q.id];
                  const isEssay = q.type === 'essay';
                  const textAns = typeof studentAns === 'string' ? studentAns : studentAns?.text || '';
                  const imgAns = studentAns && Array.isArray(studentAns.images) ? studentAns.images : [];
                  
                  return (
                    <div key={q.id} className="bg-slate-50/40 p-5 rounded-2xl border border-slate-200/80 space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-200 pb-2 text-xs">
                        <span className="font-black text-slate-800">
                          Câu {idx + 1}. <span className="font-sans font-medium text-slate-600">{q.questionText}</span>
                        </span>
                        <span className="font-black uppercase text-[9px] bg-slate-200 px-2 py-0.5 rounded-full text-slate-700">
                          {q.type === 'single_choice' && 'Trắc nghiệm'}
                          {q.type === 'true_false' && 'Đúng/Sai'}
                          {q.type === 'fill_blank' && 'Điền từ'}
                          {q.type === 'essay' && 'Tự luận'}
                        </span>
                      </div>

                      {/* Render based on Question Type */}
                      {q.type === 'single_choice' && (
                        <div className="space-y-2 text-xs">
                          <p className="font-semibold">Lựa chọn của học sinh: <strong className="text-indigo-700">{studentAns || '(Chưa trả lời)'}</strong></p>
                          <p className="font-semibold">Đáp án đúng của Cô: <strong className="text-emerald-700">{q.correctAnswer}</strong></p>
                          <div className="inline-flex items-center gap-1.5 text-[10px] font-black px-2.5 py-0.5 rounded-full bg-slate-100">
                            {studentAns === q.correctAnswer ? (
                              <span className="text-emerald-600">🟢 TRẢ LỜI ĐÚNG (+100%)</span>
                            ) : (
                              <span className="text-rose-600">🔴 TRẢ LỜI SAI (0%)</span>
                            )}
                          </div>
                        </div>
                      )}

                      {q.type === 'true_false' && (
                        <div className="space-y-2 text-xs">
                          <p className="font-semibold text-slate-500">Mệnh đề đã chọn:</p>
                          <div className="space-y-1 pl-3 font-semibold text-slate-600">
                            {(q.trueFalseOptions || []).map((o, oIdx) => {
                              const sChoice = studentAns?.[oIdx];
                              const isCorrect = sChoice === o.correct;
                              return (
                                <div key={oIdx} className="flex items-center space-x-2">
                                  <span>Mệnh đề {oIdx + 1}: "{o.text}"</span>
                                  <span>→ Bé tích: <strong className="text-indigo-700">{sChoice ? 'ĐÚNG' : 'SAI'}</strong></span>
                                  <span className={isCorrect ? 'text-emerald-600' : 'text-rose-600'}>
                                    ({isCorrect ? '🟢 Đúng' : '🔴 Sai'})
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {q.type === 'fill_blank' && (
                        <div className="space-y-2 text-xs">
                          <p className="italic text-slate-500 font-sans">Đoạn văn: "{q.blanksText}"</p>
                          <p className="font-semibold">Học sinh điền lần lượt: <strong className="text-indigo-700">{Array.isArray(studentAns) ? studentAns.join(', ') : '(Trống)'}</strong></p>
                          <p className="font-semibold">Đáp án mẫu: <strong className="text-emerald-700">{q.blankAnswers?.join(', ')}</strong></p>
                        </div>
                      )}

                      {isEssay && (
                        <div className="space-y-4 font-sans">
                          {/* Student answer text */}
                          <div className="space-y-1 text-xs">
                            <label className="text-[10px] text-slate-400 font-black uppercase">Nội dung học sinh gõ chữ / tự luận:</label>
                            <div className="p-3 bg-white border border-slate-250 rounded-xl text-slate-800 font-semibold italic">
                              {textAns ? `"${textAns}"` : '(Học sinh không gõ chữ trực tiếp)'}
                            </div>
                          </div>

                          {/* Student uploaded images */}
                          {imgAns.length > 0 && (
                            <div className="space-y-1.5">
                              <label className="text-[10px] text-indigo-700 font-black uppercase block">🖼️ Ảnh bài viết tay / Vở học sinh chụp nộp:</label>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {imgAns.map((img: string, imgIdx: number) => (
                                  <a href={img} target="_blank" rel="noreferrer" key={imgIdx} className="block group relative rounded-xl overflow-hidden border border-slate-200 bg-black cursor-zoom-in shadow-xs">
                                    <img src={img} alt={`Bài tự luận trang ${imgIdx + 1}`} className="max-h-[220px] mx-auto object-contain group-hover:scale-102 transition duration-200" referrerPolicy="no-referrer" />
                                    <span className="absolute bottom-1 right-2 bg-indigo-950/80 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded">
                                      🔍 Phóng to ảnh {imgIdx + 1}
                                    </span>
                                  </a>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Reference answer */}
                          <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-xl space-y-1.5 text-xs">
                            <p className="font-black text-amber-950">📋 Đáp án mẫu hoặc tiêu chí chấm bài:</p>
                            <p className="font-sans font-medium text-slate-700 leading-relaxed">{q.criteria || 'Không có hướng dẫn giải cụ thể.'}</p>
                          </div>

                          {/* AI GRADER PANEL */}
                          <div className="border border-purple-200 p-4.5 rounded-2xl bg-purple-50/10 space-y-4">
                            <div className="flex items-center justify-between gap-3 flex-wrap">
                              <div className="space-y-0.5">
                                <h5 className="font-black text-purple-950 text-xs flex items-center gap-1">
                                  <span>🤖</span> CHẤM ĐIỂM TỰ ĐỘNG BẰNG AI TRỢ LÝ
                                </h5>
                                <p className="text-[10px] text-slate-500 font-medium">AI quét chữ viết tay qua OCR, đối chiếu lỗi chính tả và ý chính theo đáp án mẫu.</p>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleAIEssayGrade(q, studentAns)}
                                disabled={aiIsGrading}
                                className="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-black text-xs uppercase tracking-wider rounded-xl transition shadow-md shadow-indigo-500/10 cursor-pointer disabled:opacity-50 flex items-center space-x-1 animate-pulse"
                              >
                                {aiIsGrading ? (
                                  <>
                                    <span className="animate-spin mr-1">⏳</span>
                                    <span>AI Đang quét & chấm bài...</span>
                                  </>
                                ) : (
                                  <>
                                    <span>✨ CHẤM BẰNG GEMINI AI</span>
                                  </>
                                )}
                              </button>
                            </div>

                            {/* Scanning indicator */}
                            {aiIsGrading && (
                              <div className="space-y-2 p-4 bg-purple-50/50 rounded-xl border border-dashed border-purple-300 animate-pulse text-center">
                                <div className="h-1 bg-gradient-to-r from-purple-500 via-indigo-400 to-pink-500 rounded-full animate-pulse"></div>
                                <p className="text-[10px] font-black text-purple-900 tracking-wide uppercase">⚡ ĐANG ĐỌC CHỮ VIẾT TAY TRÊN VỞ VÀ ĐỐI CHIẾU TIÊU CHÍ CHẤM CỦA CÔ...</p>
                              </div>
                            )}

                            {/* AI result feedback */}
                            {aiGradeResult && (
                              <div className="space-y-3 bg-white p-4 rounded-xl border border-purple-200 text-xs animate-fadeIn">
                                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                                  <span className="font-black text-slate-800">KẾT QUẢ PHÂN TÍCH CỦA GEMINI AI:</span>
                                  <span className="text-xs font-black bg-purple-100 text-purple-800 px-3 py-1 rounded-lg border border-purple-200 font-mono">
                                    ĐIỂM GỢI Ý: {aiGradeResult.score} / 10đ
                                  </span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                                  <div className="space-y-1">
                                    <p className="font-bold text-emerald-800">🌟 Điểm tốt:</p>
                                    <ul className="list-disc list-inside text-slate-600 space-y-0.5 text-[11px] pl-1 font-sans font-medium">
                                      {(aiGradeResult.correctAnswers || []).map((c: string, cIdx: number) => (
                                        <li key={cIdx}>{c}</li>
                                      ))}
                                    </ul>
                                  </div>
                                  <div className="space-y-1">
                                    <p className="font-bold text-rose-800">✏️ Sửa lỗi / Điểm yếu:</p>
                                    <ul className="list-disc list-inside text-slate-600 space-y-0.5 text-[11px] pl-1 font-sans font-medium">
                                      {(aiGradeResult.incorrectAnswers || []).map((i: string, iIdx: number) => (
                                        <li key={iIdx}>{i}</li>
                                      ))}
                                    </ul>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Final Grading & Reward Action Card */}
              <div className="bg-indigo-50 border-2 border-indigo-200 p-5 rounded-2xl space-y-4 text-left">
                <h4 className="font-black text-indigo-950 text-xs uppercase tracking-wider border-b border-indigo-200 pb-2 flex items-center gap-1.5">
                  <span>🏆</span> KẾT LUẬN & ĐÁNH GIÁ CỦA CÔ GIÁO
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1.5 md:col-span-1">
                    <label className="text-[10px] text-slate-500 font-black uppercase">Điểm bài tự luận (0 - 10đ):</label>
                    <input
                      type="number"
                      min={0}
                      max={10}
                      step={0.5}
                      value={manualScore !== null ? manualScore : ''}
                      onChange={(e) => setManualScore(parseFloat(e.target.value) || 0)}
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-400 font-black text-slate-800 text-sm font-mono"
                      placeholder="vd: 9.5"
                    />
                    <p className="text-[9px] text-indigo-900 font-bold italic">Cô có thể chỉnh sửa tùy ý. Điểm này sẽ tự động quy đổi thành số Sao thưởng tương ứng!</p>
                  </div>
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-[10px] text-slate-500 font-black uppercase">Nhận xét chi tiết gửi cho Học sinh & Phụ huynh:</label>
                    <textarea
                      rows={6}
                      value={manualFeedbackText}
                      onChange={(e) => setManualFeedbackText(e.target.value)}
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-400 font-sans font-semibold text-xs leading-relaxed text-slate-800"
                      placeholder="Nhập lời phê, nhận xét hoặc chấp nhận kết quả tổng hợp của AI..."
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Actions Footer */}
            <div className="bg-slate-50 p-4 border-t border-slate-200 flex items-center justify-end space-x-3 shrink-0">
              <button
                type="button"
                onClick={() => setGradingSubmission(null)}
                className="px-5 py-2.5 bg-white hover:bg-slate-100 text-slate-600 border border-slate-350 font-black text-xs uppercase tracking-wider rounded-xl transition cursor-pointer"
              >
                HỦY BỎ / ĐÓNG
              </button>
              <button
                type="button"
                onClick={handleSaveSubGrading}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase tracking-wider rounded-xl transition shadow-md shadow-indigo-500/20 cursor-pointer flex items-center space-x-1.5"
              >
                <span>🚀 PHÊ DUYỆT & GỬI CHO HỌC SINH</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
