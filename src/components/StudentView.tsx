/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Beautifully redesigned Student Home Screen matching Vietnamese classroom requests
 */

import React, { useState, useEffect } from 'react';
import { useLMS } from '../context/LMSContext';
import { motion, AnimatePresence } from 'motion/react';
import {
  Trophy,
  BookOpen,
  CheckCircle2,
  HelpCircle,
  Play,
  Save,
  Check,
  Undo2,
  Clock,
  Volume2,
  Sparkles,
  Award,
  BookMarked,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
  Camera,
  Link as LinkIcon,
  Download,
  RefreshCw,
  Palette,
  Smile,
  Heart,
  User,
  ExternalLink,
  MessageSquare,
  Send
} from 'lucide-react';
import { Assignment, Question, Submission } from '../types';
import { audioSynth } from './AudioSynthesizer';

export const StudentView: React.FC = () => {
  const {
    currentUser,
    students,
    assignments,
    submissions,
    saveSubmission,
    deleteSubmission,
    updateStudent,
    settings,
    parentCheckedAssignments
  } = useLMS();

  // Find active student profile
  const activeStudent = students.find(s => s.id === currentUser.studentId);

  // Collapsible state
  const [isLinksCollapsed, setIsLinksCollapsed] = useState(true);
  const [isZoneCollapsed, setIsZoneCollapsed] = useState(false);

  // Tab state within Zone: 'tasks' | 'rank' | 'settings'
  const [activeTab, setActiveTab] = useState<'tasks' | 'rank' | 'settings'>('tasks');
  
  // Tasks Tab specific states
  const [tasksSubTab, setTasksSubTab] = useState<'incomplete' | 'completed'>('incomplete');
  const [selectedWeek, setSelectedWeek] = useState<number | 'Tất cả'>('Tất cả');
  const [selectedSubject, setSelectedSubject] = useState<string>('Tất cả');

  // Custom visual theme color state for StudentView
  const [theme, setTheme] = useState<string>(() => localStorage.getItem(`student_theme_${activeStudent?.id}`) || 'sky');
  
  // Slogan/Motto state
  const [favoriteMotto, setFavoriteMotto] = useState<string>(() => localStorage.getItem(`student_motto_${activeStudent?.id}`) || 'Chăm ngoan học giỏi, ngày ngày tiến bộ! 🌟');

  // Password change states
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [newStudentPass, setNewStudentPass] = useState('');
  const [confirmStudentPass, setConfirmStudentPass] = useState('');
  const [passSuccessMsg, setPassSuccessMsg] = useState('');
  const [passErrorMsg, setPassErrorMsg] = useState('');

  // Active quiz solving states
  const [solvingAssignment, setSolvingAssignment] = useState<Assignment | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<{ [qId: string]: any }>({});
  const [quizStartTime, setQuizStartTime] = useState<number>(0);
  const [activeLeftMatch, setActiveLeftMatch] = useState<string | null>(null);

  // Review completed submission modal state
  const [reviewingSubmission, setReviewingSubmission] = useState<{ assignment: Assignment; submission: Submission } | null>(null);

  // Success Celebration Screen modal state
  const [celebrationData, setCelebrationData] = useState<{
    starsWon: number;
    correctCount: number;
    total: number;
  } | null>(null);

  // AI Grading loading states
  const [isAiGrading, setIsAiGrading] = useState(false);
  const [aiGradingMsg, setAiGradingMsg] = useState('');

  // AI Assistant Chatbot drawer states
  const [showAiChatTutor, setShowAiChatTutor] = useState(false);
  const [aiChatQuestionId, setAiChatQuestionId] = useState<string>('');
  const [aiChatHistory, setAiChatHistory] = useState<{ role: 'user' | 'model'; text: string }[]>([]);
  const [studentChatMessage, setStudentChatMessage] = useState('');
  const [isChatSending, setIsChatSending] = useState(false);

  if (!activeStudent) {
    return (
      <div className="bg-white rounded-3xl p-8 text-center border">
        <p className="text-slate-500 font-bold">Không tìm thấy thông tin hồ sơ học sinh tương thích.</p>
      </div>
    );
  }

  // Get list of weeks & subjects of existing assignments
  const weeks = Array.from(new Set(assignments.map(a => a.week || 1))).sort((a: number, b: number) => a - b);
  const subjects = ['Tất cả', ...Array.from(new Set(assignments.map(a => a.subject)))];

  // Incomplete list
  const incompleteAssignments = assignments.filter(as => {
    const sub = submissions.find(s => s.assignmentId === as.id && s.studentId === activeStudent.id);
    return !sub || sub.status !== 'submitted';
  });

  // Completed list
  const completedAssignments = assignments.filter(as => {
    const sub = submissions.find(s => s.assignmentId === as.id && s.studentId === activeStudent.id);
    return sub && sub.status === 'submitted';
  });

  // Filter lists by selected week & subject
  const getFilteredAssignments = (list: Assignment[]) => {
    return list.filter(as => {
      const matchWeek = selectedWeek === 'Tất cả' || as.week === selectedWeek;
      const matchSubject = selectedSubject === 'Tất cả' || as.subject === selectedSubject;
      return matchWeek && matchSubject;
    });
  };

  const currentIncomplete = getFilteredAssignments(incompleteAssignments);
  const currentCompleted = getFilteredAssignments(completedAssignments);

  // Start solving
  const handleStartAssignment = (as: Assignment) => {
    const draft = submissions.find(s => s.assignmentId === as.id && s.studentId === activeStudent.id);
    if (draft && draft.answers) {
      setQuizAnswers(draft.answers);
    } else {
      setQuizAnswers({});
    }
    setSolvingAssignment(as);
    setQuizStartTime(Date.now());
    audioSynth.playStarChime();
  };

  // Single choice answer selection
  const handleSingleSelect = (qId: string, value: string) => {
    setQuizAnswers(prev => ({ ...prev, [qId]: value }));
  };

  // True/False answer toggling
  const handleTrueFalseToggle = (qId: string, subText: string, correct: boolean) => {
    setQuizAnswers(prev => {
      const existing = prev[qId] || {};
      return {
        ...prev,
        [qId]: {
          ...existing,
          [subText]: correct
        }
      };
    });
  };

  // MatchingLeft option click
  const handleLeftMatchClick = (leftText: string) => {
    setActiveLeftMatch(leftText);
  };

  // MatchingRight option click
  const handleRightMatchClick = (qId: string, rightText: string) => {
    if (!activeLeftMatch) return;
    setQuizAnswers(prev => {
      const existing = prev[qId] || {};
      return {
        ...prev,
        [qId]: {
          ...existing,
          [activeLeftMatch]: rightText
        }
      };
    });
    setActiveLeftMatch(null);
  };

  // Undo Matching connection
  const handleUndoMatch = (qId: string, leftText: string) => {
    setQuizAnswers(prev => {
      const existing = { ...(prev[qId] || {}) };
      delete existing[leftText];
      return {
        ...prev,
        [qId]: existing
      };
    });
  };

  // Blank words filling
  const handleBlankWordSelect = (qId: string, blankIdx: number, word: string) => {
    setQuizAnswers(prev => {
      const existing = prev[qId] || {};
      return {
        ...prev,
        [qId]: {
          ...existing,
          [blankIdx]: word
        }
      };
    });
  };

  // Simulated image downloads with nice popup and direct tab
  const handleDownloadImage = (imgUrl: string) => {
    audioSynth.playBubblePop();
    alert('Hệ thống đang tải hình ảnh học liệu này về máy của em... 📥');
    const link = document.createElement('a');
    link.href = imgUrl;
    link.download = `Hoc_Lieu_Lop3A_${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Simulated Camera photo taking for essay answers
  const handleSimulateCamera = (qId: string) => {
    audioSynth.playStarChime();
    // Pre-configured list of cute drawing base64-like placeholder styles to mock capture
    const mockCameraImages = [
      'https://images.unsplash.com/photo-1516962215378-7fa2e137ae93?w=500&q=80',
      'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=500&q=80',
      'https://images.unsplash.com/photo-1453728013993-6d66e9c9123a?w=500&q=80'
    ];
    const chosenImage = mockCameraImages[Math.floor(Math.random() * mockCameraImages.length)];
    
    setQuizAnswers(prev => {
      const currentAnswer = prev[qId] || { text: '', images: [] };
      const updatedImages = Array.isArray(currentAnswer.images) ? [...currentAnswer.images] : [];
      updatedImages.push(chosenImage);

      return {
        ...prev,
        [qId]: {
          text: typeof currentAnswer === 'string' ? currentAnswer : currentAnswer.text || '',
          images: updatedImages
        }
      };
    });
    alert('📷 Đã chụp ảnh bài làm thành công từ Camera điện thoại/máy tính và đính kèm vào bài tập!');
  };

  // Handlers for adding images from files
  const handleUploadEssayImages = (qId: string, files: FileList | null) => {
    if (!files || files.length === 0) return;
    audioSynth.playBubblePop();
    const imagesArray: string[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          imagesArray.push(e.target.result as string);
          if (imagesArray.length === files.length) {
            setQuizAnswers(prev => {
              const currentAnswer = prev[qId] || { text: '', images: [] };
              const existingImages = Array.isArray(currentAnswer.images) ? [...currentAnswer.images] : [];
              return {
                ...prev,
                [qId]: {
                  text: typeof currentAnswer === 'string' ? currentAnswer : currentAnswer.text || '',
                  images: [...existingImages, ...imagesArray]
                }
              };
            });
            alert(`📥 Đã tải thành công ${files.length} ảnh bài làm của em lên hệ thống!`);
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Undo attached essay image
  const handleRemoveEssayImage = (qId: string, imgIdx: number) => {
    setQuizAnswers(prev => {
      const currentAns = prev[qId];
      if (!currentAns || !Array.isArray(currentAns.images)) return prev;
      const updatedImages = currentAns.images.filter((_: any, idx: number) => idx !== imgIdx);
      return {
        ...prev,
        [qId]: {
          ...currentAns,
          images: updatedImages
        }
      };
    });
  };

  // Handle Save Draft progress
  const handleSaveDraft = () => {
    if (!solvingAssignment) return;
    const duration = Math.round((Date.now() - quizStartTime) / 1000);
    
    saveSubmission({
      id: `${activeStudent.id}_${solvingAssignment.id}`,
      assignmentId: solvingAssignment.id,
      studentId: activeStudent.id,
      studentName: activeStudent.name,
      status: 'draft',
      score: 0,
      correctCount: 0,
      totalQuestions: solvingAssignment.questions.length,
      timeSpentSeconds: duration,
      submittedAt: new Date().toISOString(),
      answers: quizAnswers,
      attemptsCount: 1
    });

    alert('Đã lưu bản nháp thành công! Bé có thể làm tiếp bất cứ lúc nào.');
    setSolvingAssignment(null);
  };

  // Submit Assignment validation and grading
  const handleSubmitAssignment = async () => {
    if (!solvingAssignment) return;

    let correctCount = 0;
    const total = solvingAssignment.questions.length;
    let aiGradedFeedback: any = {};
    let isEssay = false;
    let essayQuestionsCount = 0;
    let totalScoreFromEssaySum = 0;

    const hasEssay = solvingAssignment.questions.some(q => q.type === 'essay');

    if (hasEssay) {
      setIsAiGrading(true);
      setAiGradingMsg('🤖 Cô trợ lý AI đang đọc câu trả lời và quét chữ viết tay (OCR) của con đó nha... Con chờ cô tí xíu nhé! ✨');
    }

    for (let q of solvingAssignment.questions) {
      const studentAns = quizAnswers[q.id];

      if (q.type === 'single_choice') {
        if (studentAns === q.correctAnswer) correctCount++;
      } else if (q.type === 'true_false') {
        let allCorrect = true;
        q.trueFalseOptions?.forEach(opt => {
          if (studentAns?.[opt.text] !== opt.correct) {
            allCorrect = false;
          }
        });
        if (studentAns && allCorrect) correctCount++;
      } else if (q.type === 'matching') {
        let allMatched = true;
        q.matchingLeft?.forEach(left => {
          if (studentAns?.[left] !== q.matchingPairs?.[left]) {
            allMatched = false;
          }
        });
        if (studentAns && allMatched) correctCount++;
      } else if (q.type === 'fill_blank') {
        let allCorrect = true;
        q.blankAnswers?.forEach((correctWord, idx) => {
          if (studentAns?.[idx] !== correctWord) {
            allCorrect = false;
          }
        });
        if (studentAns && allCorrect) correctCount++;
      } else if (q.type === 'essay') {
        isEssay = true;
        essayQuestionsCount++;
        const textAns = typeof studentAns === 'string' ? studentAns : studentAns?.text || '';
        const imgAns = studentAns && Array.isArray(studentAns.images) ? studentAns.images : [];
        
        if (textAns.trim().length > 0 || imgAns.length > 0) {
          correctCount++;
        }

        try {
          const res = await fetch('/api/gemini/grade', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              title: solvingAssignment.title,
              description: q.questionText,
              criteria: q.criteria || solvingAssignment.description || 'Chấm điểm ý văn, đúng chính tả tiếng Việt và độ sáng tạo.',
              studentAnswer: textAns,
              studentImages: imgAns,
              criteriaImages: q.criteriaImages || []
            })
          });

          if (!res.ok) throw new Error('API Grade Error');
          const data = await res.json();
          
          aiGradedFeedback[q.id] = {
            score: data.score || 8.5,
            maxScore: data.maxScore || 10,
            correctAnswers: data.correctAnswers || ['Ý văn diễn đạt trôi chảy, đúng đề tài', 'Trình bày sạch đẹp, rõ ràng'],
            incorrectAnswers: data.incorrectAnswers || [],
            comments: data.comments || 'Bài viết sáng tạo, chữ viết tay tương đối dễ đọc.',
            suggestions: data.suggestions || 'Con chú ý ngắt nghỉ câu đúng chỗ hơn nhé.',
            learningAdvice: data.learningAdvice || 'Đọc thêm nhiều truyện cổ tích để phát triển tư duy ngôn ngữ.',
            gradedAt: new Date().toISOString(),
            chatHistory: []
          };
          
          totalScoreFromEssaySum += (data.score || 8.5);
        } catch (error) {
          console.error("AI Grading failed, falling back to simulated grading:", error);
          const lengthFactor = textAns.trim().length;
          const fallbackScore = lengthFactor > 150 ? 9.0 : lengthFactor > 50 ? 8.0 : 7.0;
          aiGradedFeedback[q.id] = {
            score: fallbackScore,
            maxScore: 10,
            correctAnswers: ['Đã làm bài đầy đủ', 'Ý văn dễ hiểu'],
            incorrectAnswers: lengthFactor < 50 ? ['Bài viết hơi ngắn, con cần viết dài thêm nhé'] : [],
            comments: 'Cô khen con đã nộp bài đầy đủ và đúng hạn!',
            suggestions: 'Con nên luyện viết thêm 2-3 câu nữa để ý văn được đầy đủ hơn.',
            learningAdvice: 'Thường xuyên đọc sách tiếng Việt cùng bố mẹ nha.',
            gradedAt: new Date().toISOString(),
            chatHistory: []
          };
          totalScoreFromEssaySum += fallbackScore;
        }
      }
    }

    if (solvingAssignment.criteria.mustGet100 && correctCount < total) {
      setIsAiGrading(false);
      audioSynth.playError();
      alert(`Bài tập yêu cầu hoàn thành đúng 100% mới được nộp! Bé hiện đúng ${correctCount}/${total} câu. Bé hãy kiểm tra kỹ lại bài nhé!`);
      return;
    }

    const duration = Math.round((Date.now() - quizStartTime) / 1000);
    
    let starsWon = 0;
    if (isEssay && essayQuestionsCount > 0) {
      const averageEssayScoreTenScale = totalScoreFromEssaySum / essayQuestionsCount;
      starsWon = Math.round(solvingAssignment.rewardStars * (averageEssayScoreTenScale / 10));
    } else {
      const correctRatio = total > 0 ? correctCount / total : 1;
      starsWon = Math.round(solvingAssignment.rewardStars * correctRatio);
    }

    const prevSub = submissions.find(
      s => s.assignmentId === solvingAssignment.id && s.studentId === activeStudent.id
    );
    const attempts = prevSub ? prevSub.attemptsCount + 1 : 1;

    saveSubmission({
      id: `${activeStudent.id}_${solvingAssignment.id}`,
      assignmentId: solvingAssignment.id,
      studentId: activeStudent.id,
      studentName: activeStudent.name,
      status: 'submitted',
      score: starsWon,
      correctCount,
      totalQuestions: total,
      timeSpentSeconds: duration,
      submittedAt: new Date().toISOString(),
      answers: quizAnswers,
      attemptsCount: attempts,
      aiGradedFeedback
    });

    setCelebrationData({
      starsWon,
      correctCount,
      total
    });

    setIsAiGrading(false);
    audioSynth.playSuccess();
    setSolvingAssignment(null);
  };

  const handleSendChatMessage = async () => {
    if (!studentChatMessage.trim() || !reviewingSubmission || !aiChatQuestionId || isChatSending) return;

    const userMsg = studentChatMessage.trim();
    setStudentChatMessage('');
    audioSynth.playBubblePop();

    const newHistory = [...aiChatHistory, { role: 'user' as const, text: userMsg }];
    setAiChatHistory(newHistory);
    setIsChatSending(true);

    const q = reviewingSubmission.assignment.questions.find(x => x.id === aiChatQuestionId);
    const sub = reviewingSubmission.submission;
    const sAns = sub.answers?.[aiChatQuestionId];
    const textAns = typeof sAns === 'string' ? sAns : sAns?.text || '';
    const feedback = sub.aiGradedFeedback?.[aiChatQuestionId];

    try {
      const response = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assignmentTitle: reviewingSubmission.assignment.title,
          questionText: q?.questionText || '',
          studentAnswer: textAns,
          comments: feedback?.comments || '',
          chatHistory: aiChatHistory,
          userMessage: userMsg
        })
      });

      if (!response.ok) throw new Error('Chat API Error');
      const data = await response.json();
      
      const updatedHistory = [...newHistory, { role: 'model' as const, text: data.reply }];
      setAiChatHistory(updatedHistory);

      // Save updated chat history in submission context
      const updatedSubmission = {
        ...sub,
        aiGradedFeedback: {
          ...sub.aiGradedFeedback,
          [aiChatQuestionId]: {
            ...feedback,
            chatHistory: updatedHistory
          }
        }
      };
      saveSubmission(updatedSubmission);
      setReviewingSubmission({
        ...reviewingSubmission,
        submission: updatedSubmission
      });
    } catch (err) {
      console.error("AI Chat tutor failed, falling back to smart simulation:", err);
      let reply = 'Cô thấy con đang thắc mắc rất hay. ';
      if (userMsg.toLowerCase().includes('điểm') || userMsg.toLowerCase().includes('sao')) {
        reply += `Bài làm này con đạt được ${feedback?.score}/10 điểm. Đây là mức điểm rất khá rồi con nha. Lỗi nhỏ của con chủ ý là diễn giải còn ngắn gọn quá. Cô tin lần sau con viết dài hơn sẽ đạt điểm 10 tuyệt đối đó! 🌸`;
      } else if (userMsg.toLowerCase().includes('hay hơn') || userMsg.toLowerCase().includes('viết')) {
        reply += 'Để viết hay hơn, con nên đưa thêm một số tính từ gợi tả cảm xúc (ví dụ: rực rỡ, lung linh, ấm áp) và sử dụng biện pháp so sánh nhé con yêu! Có cần cô gợi ý câu mẫu nào không nè? 💕';
      } else if (userMsg.toLowerCase().includes('chính tả') || userMsg.toLowerCase().includes('sửa')) {
        reply += 'Con viết bài rất cẩn thận, chính tả của con hoàn toàn chính xác rồi! Con chỉ cần chú ý ngắt nghỉ bằng dấu phẩy và dấu chấm cho mạch lạc hơn thôi nha.';
      } else {
        reply += 'Con đã làm rất tốt thử thách môn học này rồi. Hãy tiếp tục ôn tập và làm thêm nhiều nhiệm vụ để đổi các thẻ vàng thi đua danh dự của lớp mình nhé! Con yêu cố lên! 🥰';
      }

      const updatedHistory = [...newHistory, { role: 'model' as const, text: reply }];
      setAiChatHistory(updatedHistory);

      const updatedSubmission = {
        ...sub,
        aiGradedFeedback: {
          ...sub.aiGradedFeedback,
          [aiChatQuestionId]: {
            ...feedback,
            chatHistory: updatedHistory
          }
        }
      };
      saveSubmission(updatedSubmission);
      setReviewingSubmission({
        ...reviewingSubmission,
        submission: updatedSubmission
      });
    } finally {
      setIsChatSending(false);
    }
  };

  // Re-attempting assignment
  const handleRedoAssignment = (as: Assignment) => {
    audioSynth.playStarChime();
    const confirmRedo = window.confirm(`Bé có chắc chắn muốn làm lại bài tập "${as.title}" không? Kết quả trước đó của bé sẽ được thay thế.`);
    if (confirmRedo) {
      deleteSubmission(activeStudent.id, as.id);
      alert('Đã thiết lập làm lại bài! Nhiệm vụ đã quay trở lại danh sách Nhiệm vụ chưa làm của bé. 🎒');
    }
  };

  // Setting profile update handlers
  const handleSaveTheme = (selectedTheme: string) => {
    setTheme(selectedTheme);
    localStorage.setItem(`student_theme_${activeStudent.id}`, selectedTheme);
    audioSynth.playBubblePop();
  };

  const handleSaveMotto = (txt: string) => {
    setFavoriteMotto(txt);
    localStorage.setItem(`student_motto_${activeStudent.id}`, txt);
  };

  const handleUpdateAvatar = (newAvatar: string) => {
    updateStudent(activeStudent.id, { avatar: newAvatar });
    audioSynth.playStarChime();
    alert(`Đã cập nhật ảnh đại diện của bé thành công! ${newAvatar}`);
  };

  const handleStudentPasswordChangeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPassErrorMsg('');
    setPassSuccessMsg('');

    if (!newStudentPass.trim()) {
      setPassErrorMsg('Em vui lòng nhập mật khẩu mới nhé!');
      return;
    }
    if (newStudentPass.trim().length < 3) {
      setPassErrorMsg('Mật khẩu tối thiểu 3 ký tự nha em.');
      return;
    }
    if (newStudentPass !== confirmStudentPass) {
      setPassErrorMsg('Hai ô mật khẩu chưa giống nhau, hãy kiểm tra lại!');
      return;
    }

    updateStudent(activeStudent.id, { password: newStudentPass.trim() });
    audioSynth.playSuccess();
    setPassSuccessMsg('Tuyệt vời! Đã đổi mật khẩu cá nhân thành công! 🔑');
    setNewStudentPass('');
    setConfirmStudentPass('');
  };

  // Map theme name to css classes
  const getThemeBgClass = () => {
    switch (theme) {
      case 'slate': return 'bg-slate-50 text-slate-800';
      case 'emerald': return 'bg-emerald-50/50 text-slate-800';
      case 'rose': return 'bg-rose-50/50 text-slate-800';
      case 'violet': return 'bg-indigo-50/50 text-slate-800';
      case 'amber': return 'bg-amber-50/50 text-slate-800';
      case 'cosmic': return 'bg-slate-950 text-slate-100 dark';
      default: return 'bg-sky-50/50 text-slate-800';
    }
  };

  return (
    <div className={`p-1 sm:p-4 rounded-3xl space-y-6 transition-all duration-300 ${getThemeBgClass()}`}>
      
      {/* 1. STUDENT WELCOME HEADER CARD */}
      <div className={`${theme === 'cosmic' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'} rounded-3xl p-6 border shadow-sm flex flex-col md:flex-row items-center justify-between gap-6`}>
        <div className="flex items-center space-x-4">
          <span className="text-5xl p-3 bg-amber-50/80 rounded-2xl shadow-inner border border-amber-100/30">{activeStudent.avatar}</span>
          <div>
            <h2 className="text-xl md:text-2xl font-black tracking-tight flex items-center gap-1.5">
              <span>Chào bé, {activeStudent.name}!</span>
              <Sparkles className="h-5 w-5 text-amber-500 animate-pulse" />
            </h2>
            <p className="text-xs text-slate-400 font-bold mt-1 uppercase tracking-wider">
              Lớp 3A | GV chủ nhiệm: {localStorage.getItem('lms_teacher_name') || 'Cô giáo Mai Anh'}
            </p>
            <p className="text-xs text-indigo-500 italic font-semibold mt-1">
              " {favoriteMotto} "
            </p>
          </div>
        </div>

        {/* Display Badges Cup */}
        <div className="flex items-center space-x-4 bg-gradient-to-r from-amber-500 via-orange-400 to-rose-400 p-4 rounded-2xl text-white shadow-md">
          <div className="flex flex-col items-center border-r border-white/20 pr-4 text-center">
            <span className="text-[9px] font-bold uppercase text-white/90">Sao Tích Luỹ</span>
            <span className="text-xl font-black">⭐ {activeStudent.stars}</span>
          </div>
          <div className="flex flex-col items-center border-r border-white/20 px-4 text-center">
            <span className="text-[9px] font-bold uppercase text-white/90">Cờ Thi Đua</span>
            <span className="text-xl font-black">🚩 {activeStudent.flags}</span>
          </div>
          <div className="flex flex-col items-center pl-2 text-center">
            <span className="text-[9px] font-bold uppercase text-white/90">Thẻ Vàng</span>
            <span className="text-xl font-black">🏆 {activeStudent.goldCards}</span>
          </div>
        </div>
      </div>

      {/* 2. KHUNG LIÊN KẾT ỨNG DỤNG & TRANG HỌC TẬP ĐIỆN TỬ (Collapsible, starts collapsed) */}
      <div className={`${theme === 'cosmic' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'} rounded-3xl border shadow-sm overflow-hidden`}>
        <button
          onClick={() => {
            audioSynth.playBubblePop();
            setIsLinksCollapsed(!isLinksCollapsed);
          }}
          className={`w-full p-4.5 flex items-center justify-between font-black text-sm md:text-base cursor-pointer transition ${
            theme === 'cosmic' ? 'bg-slate-800 text-slate-200' : 'bg-slate-50 text-slate-800'
          }`}
        >
          <div className="flex items-center space-x-2.5">
            <span className="p-1.5 bg-blue-500 rounded-xl text-white text-xs">🌐</span>
            <span>LIÊN KẾT ỨNG DỤNG & TRANG HỌC TẬP ĐIỆN TỬ</span>
          </div>
          <span className="text-xs text-sky-600 font-extrabold flex items-center gap-1 bg-sky-50 px-3 py-1 rounded-full border border-sky-100">
            {isLinksCollapsed ? 'Nhấp mở ra ∨' : 'Thu gọn lại ∧'}
          </span>
        </button>
        
        {!isLinksCollapsed && (
          <div className="p-5 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 border-t border-slate-100 animate-fadeIn">
            {/* VioEdu Link */}
            <a href="https://vioedu.vn" target="_blank" rel="noopener noreferrer" className="p-4 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-2xl text-center space-y-1.5 transition block hover:scale-[1.02]">
              <span className="text-2xl block">📐</span>
              <span className="text-xs font-black text-amber-800 block">VioEdu</span>
              <span className="text-[9px] text-amber-600 font-bold block">Trang học Toán trực quan</span>
            </a>

            {/* OLM Link */}
            <a href="https://olm.vn" target="_blank" rel="noopener noreferrer" className="p-4 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-2xl text-center space-y-1.5 transition block hover:scale-[1.02]">
              <span className="text-2xl block">📚</span>
              <span className="text-xs font-black text-sky-800 block">OLM.vn</span>
              <span className="text-[9px] text-sky-600 font-bold block">Ôn luyện đa môn học</span>
            </a>

            {/* VietnamDoc Link */}
            <a href="https://vietnamdoc.com" target="_blank" rel="noopener noreferrer" className="p-4 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-2xl text-center space-y-1.5 transition block hover:scale-[1.02]">
              <span className="text-2xl block">🌐</span>
              <span className="text-xs font-black text-emerald-800 block">Học Liệu Số</span>
              <span className="text-[9px] text-emerald-600 font-bold block">Thư viện bài giảng số</span>
            </a>

            {/* Youtube Kids Link */}
            <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="p-4 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-2xl text-center space-y-1.5 transition block hover:scale-[1.02]">
              <span className="text-2xl block">📺</span>
              <span className="text-xs font-black text-rose-800 block">Video Bài Giảng</span>
              <span className="text-[9px] text-rose-600 font-bold block">Kênh hoạt hình giáo dục</span>
            </a>

            {/* Class Discussion Padlet */}
            <a href="https://padlet.com" target="_blank" rel="noopener noreferrer" className="p-4 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-2xl text-center space-y-1.5 transition block hover:scale-[1.02]">
              <span className="text-2xl block">💬</span>
              <span className="text-xs font-black text-purple-800 block">Bảng Thảo Luận</span>
              <span className="text-[9px] text-purple-600 font-bold block">Padlet lớp học lớp 3A</span>
            </a>
          </div>
        )}
      </div>

      {/* 3. KHU NHIỆM VỤ ĐƯỢC GIAO (BẢNG QUẢN LÝ LỚP HỌC HỌC SINH - Collapsible, starts open) */}
      <div className={`${theme === 'cosmic' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'} rounded-3xl border shadow-sm overflow-hidden`}>
        <button
          onClick={() => {
            audioSynth.playBubblePop();
            setIsZoneCollapsed(!isZoneCollapsed);
          }}
          className={`w-full p-4.5 flex items-center justify-between font-black text-sm md:text-base cursor-pointer transition ${
            theme === 'cosmic' ? 'bg-slate-800 text-slate-200' : 'bg-slate-50 text-slate-800'
          }`}
        >
          <div className="flex items-center space-x-2.5">
            <span className="p-1.5 bg-teal-500 rounded-xl text-white text-xs">🎒</span>
            <span>KHU NHIỆM VỤ ĐƯỢC GIAO</span>
          </div>
          <span className="text-xs text-teal-600 font-extrabold flex items-center gap-1 bg-teal-50 px-3 py-1 rounded-full border border-teal-100">
            {isZoneCollapsed ? 'Nhấp mở ra ∨' : 'Thu gọn lại ∧'}
          </span>
        </button>

        {!isZoneCollapsed && (
          <div className="p-4 sm:p-6 space-y-6">
            
            {/* 3 tabs navigation */}
            <div className="flex border-b border-slate-200 gap-2 overflow-x-auto pb-1">
              <button
                onClick={() => { audioSynth.playBubblePop(); setActiveTab('tasks'); }}
                className={`py-2 px-4 text-xs font-black rounded-t-xl transition whitespace-nowrap cursor-pointer ${
                  activeTab === 'tasks'
                    ? 'border-b-4 border-teal-500 text-teal-600 bg-teal-50/40'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                📝 Nhiệm vụ học tập
              </button>
              <button
                onClick={() => { audioSynth.playBubblePop(); setActiveTab('rank'); }}
                className={`py-2 px-4 text-xs font-black rounded-t-xl transition whitespace-nowrap cursor-pointer ${
                  activeTab === 'rank'
                    ? 'border-b-4 border-amber-500 text-amber-600 bg-amber-50/40'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                ⭐ Xếp hạng & Tích luỹ
              </button>
              <button
                onClick={() => { audioSynth.playBubblePop(); setActiveTab('settings'); }}
                className={`py-2 px-4 text-xs font-black rounded-t-xl transition whitespace-nowrap cursor-pointer ${
                  activeTab === 'settings'
                    ? 'border-b-4 border-indigo-500 text-indigo-600 bg-indigo-50/40'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                ⚙️ Cài đặt tài khoản
              </button>
            </div>

            {/* TAB 1: NHIỆM VỤ HỌC TẬP */}
            {activeTab === 'tasks' && (
              <div className="space-y-6">
                
                {/* Subject & Week Filters */}
                <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-slate-100/50 p-4 rounded-2xl border border-slate-200/50">
                  {/* Select learning week */}
                  <div className="flex items-center space-x-2 w-full sm:w-auto">
                    <span className="text-[11px] font-black text-slate-500 whitespace-nowrap uppercase">Học tuần:</span>
                    <div className="flex flex-wrap gap-1">
                      <button
                        onClick={() => setSelectedWeek('Tất cả')}
                        className={`px-2.5 py-1 text-[10px] font-black rounded-lg border transition ${
                          selectedWeek === 'Tất cả'
                            ? 'bg-teal-500 border-teal-600 text-white shadow-sm'
                            : 'bg-white text-slate-600 hover:bg-slate-100 border-slate-200'
                        }`}
                      >
                        Tất cả
                      </button>
                      {weeks.map(w => (
                        <button
                          key={w}
                          onClick={() => setSelectedWeek(w)}
                          className={`px-2.5 py-1 text-[10px] font-black rounded-lg border transition ${
                            selectedWeek === w
                              ? 'bg-teal-500 border-teal-600 text-white shadow-sm'
                              : 'bg-white text-slate-600 hover:bg-slate-100 border-slate-200'
                          }`}
                        >
                          Tuần {w}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Select subject */}
                  <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
                    <span className="text-[11px] font-black text-slate-500 uppercase">Môn học:</span>
                    <select
                      value={selectedSubject}
                      onChange={e => setSelectedSubject(e.target.value)}
                      className="text-xs p-1.5 rounded-lg border border-slate-200 font-bold bg-white"
                    >
                      {subjects.map(sub => (
                        <option key={sub} value={sub}>{sub}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Sub tab navigation */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setTasksSubTab('incomplete')}
                    className={`flex-1 py-2 rounded-xl text-xs font-extrabold transition-all border flex items-center justify-center space-x-1 cursor-pointer ${
                      tasksSubTab === 'incomplete'
                        ? 'bg-rose-500 text-white border-rose-600 shadow-sm'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-150'
                    }`}
                  >
                    <span>🎒 Nhiệm vụ được giao ({currentIncomplete.length})</span>
                  </button>
                  <button
                    onClick={() => setTasksSubTab('completed')}
                    className={`flex-1 py-2 rounded-xl text-xs font-extrabold transition-all border flex items-center justify-center space-x-1 cursor-pointer ${
                      tasksSubTab === 'completed'
                        ? 'bg-emerald-500 text-white border-emerald-600 shadow-sm'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-150'
                    }`}
                  >
                    <span>✓ Đã hoàn thành ({currentCompleted.length})</span>
                  </button>
                </div>

                {/* Assignments List layout */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* INCOMPLETE SECTION */}
                  {tasksSubTab === 'incomplete' && (
                    <div className="col-span-2 space-y-3.5">
                      {currentIncomplete.length === 0 ? (
                        <div className="text-center p-12 bg-white rounded-3xl border border-slate-100 text-slate-400 font-bold italic space-y-2">
                          <p className="text-3xl">🎉</p>
                          <p className="text-xs">Tuyệt vời! Bé đã làm hết bài tập của tuần này rồi. Hãy nghỉ ngơi và vui chơi thôi nào!</p>
                        </div>
                      ) : (
                        currentIncomplete.map((as) => {
                          const hasParentChecked = parentCheckedAssignments?.[`${as.id}_${activeStudent.id}`];
                          return (
                            <div key={as.id} className="p-5 bg-white border border-slate-100 rounded-3xl space-y-4 shadow-xs hover:shadow-md transition">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                  <span className="font-extrabold text-[10px] text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded border border-teal-200 uppercase">
                                    {as.subject}
                                  </span>
                                  <span className="text-[9px] bg-slate-100 text-slate-500 font-bold px-2 py-0.5 rounded">
                                    Tuần {as.week}
                                  </span>
                                </div>
                                <span className="text-xs font-black text-amber-500 flex items-center gap-1">
                                  ⭐ +{as.rewardStars} Sao
                                </span>
                              </div>

                              <div className="space-y-1.5">
                                <h4 className="font-extrabold text-slate-800 text-sm md:text-base">{as.title}</h4>
                                <p className="text-xs text-slate-500 font-medium leading-relaxed">{as.description}</p>
                              </div>

                              {/* Render links / media preview of assignment so they are visible before opening */}
                              {(as.links && as.links.length > 0 || as.attachments && as.attachments.length > 0) && (
                                <div className="p-3 bg-slate-50 border border-slate-150/70 rounded-2xl space-y-2.5">
                                  <span className="block text-[10px] font-black text-slate-500 uppercase tracking-wider">Học liệu & Bài giảng đính kèm:</span>
                                  
                                  {/* Render attachments with download support */}
                                  {as.attachments?.map((f, i) => (
                                    <div key={i} className="flex items-center justify-between text-xs bg-white p-2 rounded-xl border border-slate-200">
                                      <span className="truncate max-w-[250px] font-semibold text-sky-700">📄 Tệp: {f.name} ({f.size || 'Mẫu'})</span>
                                      <button
                                        type="button"
                                        onClick={() => handleDownloadImage(f.name.endsWith('.png') || f.name.endsWith('.jpg') ? 'https://images.unsplash.com/photo-1516962215378-7fa2e137ae93?w=500&q=80' : 'https://vietnamdoc.com')}
                                        className="text-[10px] bg-sky-50 text-sky-600 font-black px-2.5 py-1 rounded border border-sky-200 hover:bg-sky-100 flex items-center gap-1 cursor-pointer"
                                      >
                                        <Download className="h-3 w-3" />
                                        <span>Tải về 📥</span>
                                      </button>
                                    </div>
                                  ))}

                                  {/* Render links with simulation preview */}
                                  {as.links?.map((link, i) => (
                                    <div key={i} className="flex items-center justify-between text-xs bg-white p-2 rounded-xl border border-slate-200">
                                      <span className="truncate max-w-[250px] font-semibold text-slate-700">🔗 Link: {link.title}</span>
                                      <a
                                        href={link.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-[10px] bg-amber-50 text-amber-700 font-black px-2.5 py-1 rounded border border-amber-200 hover:bg-amber-100 flex items-center gap-1 cursor-pointer"
                                      >
                                        <ExternalLink className="h-3 w-3" />
                                        <span>Xem bài giảng 📺</span>
                                      </a>
                                    </div>
                                  ))}
                                </div>
                              )}

                              {/* Parent checked status */}
                              {hasParentChecked && (
                                <div className="p-2 bg-emerald-50 text-emerald-800 rounded-xl text-[10px] font-bold border border-emerald-200 flex items-center gap-1.5 w-fit">
                                  <span>✓ Ba mẹ đã xem và nhắc con tự giác làm bài tập lúc:</span>
                                  <span className="font-mono text-emerald-700 bg-white px-1.5 py-0.5 rounded border">
                                    {new Date(hasParentChecked).toLocaleTimeString('vi-VN')}
                                  </span>
                                </div>
                              )}

                              <div className="flex justify-end pt-2 border-t border-slate-100">
                                <button
                                  onClick={() => handleStartAssignment(as)}
                                  className="px-5 py-2.5 bg-gradient-to-r from-sky-500 to-indigo-500 text-white font-black text-xs rounded-xl hover:from-sky-600 hover:to-indigo-600 flex items-center space-x-1 shadow-md shadow-sky-500/20 cursor-pointer"
                                >
                                  <Play className="h-3.5 w-3.5 shrink-0" />
                                  <span>BẮT ĐẦU LÀM BÀI ▶</span>
                                </button>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}

                  {/* COMPLETED SECTION */}
                  {tasksSubTab === 'completed' && (
                    <div className="col-span-2 space-y-3.5">
                      {currentCompleted.length === 0 ? (
                        <div className="text-center p-12 bg-white rounded-3xl border border-slate-100 text-slate-400 font-bold italic">
                          Chưa có bài tập nào được nộp hoàn thành của học tuần này.
                        </div>
                      ) : (
                        currentCompleted.map((as) => {
                          const sub = submissions.find(s => s.assignmentId === as.id && s.studentId === activeStudent.id);
                          if (!sub) return null;
                          const isAllowRedo = as.criteria.allowMultipleAttempts || !as.criteria.onlyOneAttempt;

                          return (
                            <div key={as.id} className="p-5 bg-emerald-50/20 border border-emerald-100 rounded-3xl space-y-4 shadow-xs">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-1.5">
                                  <span className="font-extrabold text-[10px] text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200 uppercase">
                                    {as.subject}
                                  </span>
                                  <span className="text-[9px] bg-slate-100 text-slate-500 font-bold px-2 py-0.5 rounded">
                                    Tuần {as.week}
                                  </span>
                                </div>
                                <span className="text-xs font-black text-emerald-600 flex items-center gap-1 bg-white border px-3 py-1 rounded-full border-emerald-200">
                                  ✓ Đạt {sub.score} / {as.rewardStars} Sao
                                </span>
                              </div>

                              <div className="space-y-1">
                                <h4 className="font-extrabold text-slate-800 text-sm md:text-base">{as.title}</h4>
                                <p className="text-[10px] text-slate-400 font-bold font-mono uppercase">
                                  Đã nộp bài: {new Date(sub.submittedAt).toLocaleString('vi-VN')} | Lần làm bài: Lần {sub.attemptsCount || 1}
                                </p>
                              </div>

                              {/* Teacher feedback view if present */}
                              {sub.feedbackMessage && (
                                <div className="p-3 bg-teal-50 border border-teal-150 rounded-2xl text-xs space-y-1 text-slate-600">
                                  <span className="font-black text-teal-800 block">💬 Nhận xét và chấm điểm của {localStorage.getItem('lms_teacher_name') || 'Cô giáo Mai Anh'}:</span>
                                  <p className="italic font-bold">"{sub.feedbackMessage}"</p>
                                </div>
                              )}

                              <div className="flex flex-wrap items-center justify-between gap-2.5 pt-3 border-t border-slate-100">
                                <button
                                  onClick={() => setReviewingSubmission({ assignment: as, submission: sub })}
                                  className="px-4 py-2 bg-sky-50 hover:bg-sky-100 text-sky-700 font-black text-xs rounded-xl border border-sky-200 flex items-center gap-1 cursor-pointer transition"
                                >
                                  <BookMarked className="h-3.5 w-3.5" />
                                  <span>Xem lại bài đã làm 👁️</span>
                                </button>

                                {isAllowRedo && (
                                  <button
                                    onClick={() => handleRedoAssignment(as)}
                                    className="px-4 py-2 bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-black text-xs rounded-xl shadow-sm hover:from-teal-600 hover:to-emerald-600 flex items-center gap-1 cursor-pointer transition"
                                  >
                                    <RefreshCw className="h-3.5 w-3.5" />
                                    <span>Làm lại bài tập 🔄</span>
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>

              </div>
            )}

            {/* TAB 2: XẾP HẠNG & TÍCH LUỸ */}
            {activeTab === 'rank' && (
              <div className="space-y-6 animate-fadeIn text-left">
                
                {/* Ranking Status Dashboard */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200/60 text-center space-y-2">
                    <span className="text-3xl block">🏆</span>
                    <span className="text-xs font-black text-slate-500 block uppercase">Thứ Hạng Học Lớp</span>
                    <span className="text-2xl font-black text-amber-700 block">Hạng #{activeStudent.rank || 4}</span>
                    <span className="text-[9px] text-amber-600 block">Toàn lớp 3A chủ nhiệm</span>
                  </div>

                  <div className="p-4 bg-rose-50 rounded-2xl border border-rose-200/60 text-center space-y-2">
                    <span className="text-3xl block">⭐</span>
                    <span className="text-xs font-black text-slate-500 block uppercase">Điểm Sao Tích</span>
                    <span className="text-2xl font-black text-rose-600 block">{activeStudent.stars} Sao</span>
                    <span className="text-[9px] text-rose-500 block">Sao đổi cờ: 50 sao = 1 cờ</span>
                  </div>

                  <div className="p-4 bg-sky-50 rounded-2xl border border-sky-200/60 text-center space-y-2">
                    <span className="text-3xl block">🚩</span>
                    <span className="text-xs font-black text-slate-500 block uppercase">Cờ Thi Đua</span>
                    <span className="text-2xl font-black text-sky-600 block">{activeStudent.flags} Cờ</span>
                    <span className="text-[9px] text-sky-500 block">Cờ đổi thẻ: 5 cờ = 1 thẻ vàng</span>
                  </div>

                  <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200/60 text-center space-y-2">
                    <span className="text-3xl block">🥇</span>
                    <span className="text-xs font-black text-slate-500 block uppercase">Thẻ Vàng Danh Dự</span>
                    <span className="text-2xl font-black text-emerald-700 block">{activeStudent.goldCards} Thẻ</span>
                    <span className="text-[9px] text-emerald-600 block">Thẻ vàng danh dự xuất sắc nhất</span>
                  </div>
                </div>

                {/* Star competition leaderboard */}
                <div className="bg-white rounded-3xl p-5 border border-slate-100 space-y-4">
                  <div className="flex items-center justify-between border-b pb-3">
                    <h4 className="text-sm font-black text-slate-800 flex items-center gap-1">
                      <Trophy className="h-4 w-4 text-yellow-500" />
                      <span>BẢNG XẾP HẠNG HỌC TẬP THI ĐUA LỚP 3A</span>
                    </h4>
                    <span className="text-[10px] text-slate-400 font-bold">Cập nhật thời gian thực</span>
                  </div>

                  <div className="space-y-2.5">
                    {[...students]
                      .filter(s => s.isActive !== false)
                      .sort((a, b) => {
                        if (b.goldCards !== a.goldCards) return b.goldCards - a.goldCards;
                        if (b.flags !== a.flags) return b.flags - a.flags;
                        return b.stars - a.stars;
                      })
                      .map((stu, i) => {
                        const isSelf = stu.id === activeStudent.id;
                        return (
                          <div
                            key={stu.id}
                            className={`p-3 rounded-2xl border flex items-center justify-between text-xs font-medium transition ${
                              isSelf
                                ? 'bg-indigo-50 border-indigo-200 ring-2 ring-indigo-500/20'
                                : 'bg-slate-50/70 border-slate-100 hover:bg-slate-50'
                            }`}
                          >
                            <div className="flex items-center space-x-3">
                              <span className={`h-6 w-6 rounded-full font-black text-[11px] flex items-center justify-center ${
                                i === 0 ? 'bg-yellow-400 text-white' : i === 1 ? 'bg-slate-300 text-slate-700' : i === 2 ? 'bg-amber-600 text-white' : 'bg-slate-200 text-slate-500'
                              }`}>
                                {i + 1}
                              </span>
                              <span className="text-xl">{stu.avatar}</span>
                              <div>
                                <span className="font-extrabold text-slate-800 block">
                                  {stu.name} {isSelf && '(Bé)'}
                                </span>
                                <span className="text-[10px] text-slate-400 block font-bold">
                                  ⭐ {stu.stars} Sao | 🚩 {stu.flags} Cờ | 🏆 {stu.goldCards} Thẻ
                                </span>
                              </div>
                            </div>

                            <div className="text-right">
                              {i === 0 && <span className="text-[10px] font-black text-yellow-600 uppercase bg-yellow-50 px-2 py-0.5 rounded border border-yellow-200">Trạng Nguyên 🌟</span>}
                              {i === 1 && <span className="text-[10px] font-black text-slate-600 uppercase bg-slate-100 px-2 py-0.5 rounded border border-slate-200">Bảng Nhãn 🥈</span>}
                              {i === 2 && <span className="text-[10px] font-black text-amber-700 uppercase bg-amber-50 px-2 py-0.5 rounded border border-amber-200">Thám Hoa 🥉</span>}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>

              </div>
            )}

            {/* TAB 3: CÀI ĐẶT TÀI KHOẢN */}
            {activeTab === 'settings' && (
              <div className="space-y-6 animate-fadeIn text-left font-sans">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Password & Theme Section */}
                  <div className="bg-white rounded-3xl p-5 border border-slate-150 space-y-5">
                    <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider border-b pb-2">🔑 ĐỔI MẬT KHẨU CÁ NHÂN</h4>
                    
                    {settings.allowChangePassword ? (
                      <form onSubmit={handleStudentPasswordChangeSubmit} className="space-y-3">
                        <div className="flex items-center justify-between text-xs text-slate-500 font-bold">
                          <span>Mật khẩu của em đang dùng:</span>
                          <span className="font-mono text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-lg font-bold">
                            {activeStudent.password || settings.defaultPassword || '123'}
                          </span>
                        </div>

                        <div>
                          <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Mật khẩu mới *</label>
                          <input
                            type="password"
                            required
                            placeholder="Nhập tối thiểu 3 kí tự..."
                            value={newStudentPass}
                            onChange={e => setNewStudentPass(e.target.value)}
                            className="w-full text-xs p-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-indigo-400 font-bold"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Gõ lại mật khẩu mới *</label>
                          <input
                            type="password"
                            required
                            placeholder="Xác thực lại giống ô trên..."
                            value={confirmStudentPass}
                            onChange={e => setConfirmStudentPass(e.target.value)}
                            className="w-full text-xs p-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-indigo-400 font-bold"
                          />
                        </div>

                        {passErrorMsg && <p className="text-[11px] font-bold text-rose-500">{passErrorMsg}</p>}
                        {passSuccessMsg && <p className="text-[11px] font-bold text-emerald-600">{passSuccessMsg}</p>}

                        <button
                          type="submit"
                          className="w-full py-2 bg-indigo-500 hover:bg-indigo-600 text-white font-extrabold text-xs rounded-xl transition cursor-pointer shadow-sm"
                        >
                          Lưu Mật Khẩu Mới
                        </button>
                      </form>
                    ) : (
                      <div className="p-3 bg-amber-50 rounded-2xl border border-amber-100 text-[11px] text-amber-700 leading-relaxed font-bold">
                        * Tính năng đổi mật khẩu cá nhân đang được Cô giáo tạm khóa. Nếu em muốn đổi, hãy nhờ Cô giáo mở tính năng này ở mục Cài đặt lớp học của GV nhé!
                      </div>
                    )}
                  </div>

                  {/* Profile customizations (Theme & Avatar & Motto) */}
                  <div className="bg-white rounded-3xl p-5 border border-slate-150 space-y-5">
                    <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider border-b pb-2">🎨 CÁ NHÂN HOÁ GIAO DIỆN</h4>
                    
                    {/* Theme selection */}
                    <div className="space-y-2">
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">1. Thay đổi màu nền:</span>
                      <div className="grid grid-cols-4 gap-2 text-xs font-bold">
                        {[
                          { id: 'sky', label: 'Bầu trời 🌤️', bg: 'bg-sky-400 text-white' },
                          { id: 'emerald', label: 'Rừng xanh 🌲', bg: 'bg-emerald-400 text-white' },
                          { id: 'rose', label: 'Hoa hồng 🌸', bg: 'bg-rose-400 text-white' },
                          { id: 'violet', label: 'Thạch anh 🔮', bg: 'bg-indigo-400 text-white' },
                          { id: 'amber', label: 'Hổ phách 🍯', bg: 'bg-amber-400 text-white' },
                          { id: 'slate', label: 'Đá đen ⛰️', bg: 'bg-slate-400 text-white' },
                          { id: 'cosmic', label: 'Vũ trụ 🌌', bg: 'bg-slate-900 text-slate-100 border' }
                        ].map(t => (
                          <button
                            key={t.id}
                            type="button"
                            onClick={() => handleSaveTheme(t.id)}
                            className={`p-1 px-1.5 rounded-xl border text-[10px] text-center transition hover:scale-102 cursor-pointer truncate ${t.bg} ${
                              theme === t.id ? 'ring-2 ring-indigo-500 scale-102 font-black' : 'opacity-85'
                            }`}
                          >
                            {t.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Change Avatar */}
                    <div className="space-y-2">
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">2. Chọn hình đại diện đáng yêu:</span>
                      <div className="flex flex-wrap gap-2 text-2xl p-2 bg-slate-50 rounded-2xl border border-slate-150">
                        {['👦', '👶', '👧', '🦄', '🐼', '🦁', '🦊', '🐯', '🦖', '🚀', '🌟', '🎨', '🐱', '🐶', '🦉'].map(av => (
                          <button
                            key={av}
                            type="button"
                            onClick={() => handleUpdateAvatar(av)}
                            className={`p-1.5 hover:bg-white rounded-xl transition cursor-pointer hover:scale-110 ${
                              activeStudent.avatar === av ? 'bg-white ring-2 ring-teal-500 scale-110' : ''
                            }`}
                          >
                            {av}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Favorite Motto */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">3. Châm ngôn học tập yêu thích:</label>
                      <input
                        type="text"
                        value={favoriteMotto}
                        onChange={(e) => handleSaveMotto(e.target.value)}
                        placeholder="Ví dụ: Chăm chỉ học tập, rèn chữ sạch đẹp..."
                        className="w-full text-xs p-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-indigo-400 font-bold"
                      />
                    </div>
                  </div>

                </div>

              </div>
            )}

          </div>
        )}
      </div>

      {/* 4. ACTIVE QUIZ SOLVER MODAL (TAKES OVER SCREEN IN A FLOATING MODAL) */}
      <AnimatePresence>
        {solvingAssignment && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 z-50 overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.93, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.93, y: 15 }}
              className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-4 md:p-6 border-4 border-sky-400 space-y-5 my-8 text-left relative"
            >
              {isAiGrading && (
                <div className="absolute inset-0 bg-white/95 backdrop-blur-md rounded-2xl flex flex-col items-center justify-center text-center p-6 z-50 space-y-4">
                  <div className="relative">
                    <div className="h-16 w-16 rounded-full border-4 border-t-indigo-500 border-indigo-100 animate-spin" />
                    <span className="absolute inset-0 flex items-center justify-center text-2xl">🤖</span>
                  </div>
                  <h4 className="text-sm font-black text-indigo-950 uppercase tracking-tight">Trợ Lý Cô Giáo AI Đang Chấm Bài</h4>
                  <p className="text-xs text-slate-500 font-bold max-w-sm leading-relaxed">
                    {aiGradingMsg}
                  </p>
                  <div className="flex space-x-1">
                    <span className="h-2 w-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:-0.3s]" />
                    <span className="h-2 w-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:-0.15s]" />
                    <span className="h-2 w-2 rounded-full bg-indigo-500 animate-bounce" />
                  </div>
                </div>
              )}
              <div className="flex items-center justify-between border-b pb-3 flex-wrap gap-2">
                <div>
                  <span className="text-[10px] font-extrabold text-sky-600 uppercase tracking-wider block">Bé đang chinh phục thử thách học tập</span>
                  <h3 className="text-base md:text-lg font-black text-slate-800">{solvingAssignment.title}</h3>
                </div>
                <div className="text-xs font-bold text-amber-500 flex items-center gap-1 bg-amber-50 px-3 py-1.5 rounded-full border border-amber-100">
                  <Award className="h-4 w-4 text-amber-500" />
                  <span>Hoàn thành: +{solvingAssignment.rewardStars} Sao ⭐</span>
                </div>
              </div>

              {/* General study resources of the assignments rendered directly inside solving panel */}
              {(solvingAssignment.attachments && solvingAssignment.attachments.length > 0 || solvingAssignment.links && solvingAssignment.links.length > 0) && (
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 text-xs">
                  <span className="font-bold text-slate-600 uppercase text-[9px] tracking-wide block">Nghiên cứu tài liệu hỗ trợ bên dưới trước khi trả lời:</span>
                  
                  {solvingAssignment.attachments?.map((f, i) => (
                    <div key={i} className="flex items-center justify-between bg-white p-2 rounded-xl border border-slate-150">
                      <span className="truncate max-w-[200px] font-semibold text-slate-700">📄 {f.name}</span>
                      <button
                        type="button"
                        onClick={() => handleDownloadImage('https://images.unsplash.com/photo-1516962215378-7fa2e137ae93?w=500&q=80')}
                        className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-1 rounded font-bold transition flex items-center gap-1 cursor-pointer"
                      >
                        <Download className="h-3 w-3" />
                        <span>Tải về 📥</span>
                      </button>
                    </div>
                  ))}

                  {solvingAssignment.links?.map((link, i) => (
                    <div key={i} className="flex items-center justify-between bg-white p-2 rounded-xl border border-slate-150">
                      <span className="truncate max-w-[200px] font-semibold text-sky-700">🔗 {link.title}</span>
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] bg-amber-50 text-amber-700 px-2.5 py-1 rounded border border-amber-200 font-bold transition flex items-center gap-1"
                      >
                        <span>Mở Link 📺</span>
                      </a>
                    </div>
                  ))}
                </div>
              )}

              {/* Questions solver container */}
              <div className="space-y-6 max-h-[420px] overflow-y-auto pr-2">
                {solvingAssignment.questions.map((q, idx) => {
                  const savedAns = quizAnswers[q.id];

                  return (
                    <div key={q.id} className="p-4 md:p-5 rounded-3xl border-2 border-slate-100 bg-slate-50/50 space-y-4">
                      {/* Question Header */}
                      <div className="flex items-center space-x-2">
                        <span className="h-6 w-6 rounded-full bg-sky-500 text-white text-xs font-bold flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <h4 className="font-extrabold text-slate-800 text-sm md:text-base leading-relaxed">{q.questionText}</h4>
                      </div>

                      {/* Question Illustrate Image (if any) with Save support */}
                      {q.essayImages && q.essayImages.length > 0 && (
                        <div className="space-y-2 pl-8">
                          <span className="text-[10px] font-bold text-slate-400 block uppercase">Hình ảnh minh hoạ của câu hỏi:</span>
                          <div className="flex flex-wrap gap-2.5">
                            {q.essayImages.map((img, i) => (
                              <div key={i} className="relative group rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-xs p-1">
                                <img
                                  src={img}
                                  alt={`illustrate-${i}`}
                                  className="h-28 w-auto max-w-[180px] object-cover rounded-xl"
                                  referrerPolicy="no-referrer"
                                />
                                <div className="absolute inset-0 bg-slate-900/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                                  <button
                                    type="button"
                                    onClick={() => handleDownloadImage(img)}
                                    className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-800 font-bold rounded-lg text-[9px] flex items-center gap-1 transition"
                                  >
                                    <Download className="h-3 w-3 text-sky-500" />
                                    <span>Tải ảnh 📥</span>
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* 1. SINGLE CHOICE QUESTION UI */}
                      {q.type === 'single_choice' && q.options && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs font-bold pl-8">
                          {['A', 'B', 'C', 'D'].map((letter, optIdx) => {
                            const isSelected = savedAns === letter;
                            return (
                              <button
                                key={letter}
                                onClick={() => handleSingleSelect(q.id, letter)}
                                className={`p-3 rounded-2xl border text-left flex items-center space-x-2.5 cursor-pointer transition-all ${
                                  isSelected
                                    ? 'bg-amber-400 text-white border-amber-500 shadow-md scale-[1.01]'
                                    : 'bg-white border-slate-200 text-slate-700 hover:bg-sky-50/50'
                                }`}
                              >
                                <span className={`h-6 w-6 rounded-full flex items-center justify-center border text-xs shrink-0 ${
                                  isSelected ? 'bg-white text-amber-600 border-white' : 'bg-slate-100 text-slate-500'
                                }`}>
                                  {letter}
                                </span>
                                <span className="flex-1 truncate">{q.options?.[optIdx]}</span>
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {/* 2. TRUE / FALSE QUESTION UI */}
                      {q.type === 'true_false' && q.trueFalseOptions && (
                        <div className="space-y-2.5 text-xs font-bold pl-8">
                          {q.trueFalseOptions.map((opt, optIdx) => {
                            const currentTFState = savedAns?.[opt.text];

                            return (
                              <div key={optIdx} className="p-3 bg-white rounded-2xl border border-slate-150 flex flex-col md:flex-row md:items-center justify-between gap-2">
                                <span className="text-slate-700 font-semibold">{opt.text}</span>
                                <div className="flex space-x-2 shrink-0">
                                  <button
                                    onClick={() => handleTrueFalseToggle(q.id, opt.text, true)}
                                    className={`px-3 py-1.5 rounded-xl border flex items-center space-x-1.5 cursor-pointer transition ${
                                      currentTFState === true
                                        ? 'bg-emerald-500 text-white border-emerald-600'
                                        : 'bg-slate-50 border-slate-200 text-slate-600'
                                    }`}
                                  >
                                    <span>Đúng</span>
                                    <span>🙂</span>
                                  </button>

                                  <button
                                    onClick={() => handleTrueFalseToggle(q.id, opt.text, false)}
                                    className={`px-3 py-1.5 rounded-xl border flex items-center space-x-1.5 cursor-pointer transition ${
                                      currentTFState === false
                                        ? 'bg-rose-500 text-white border-rose-600'
                                        : 'bg-slate-50 border-slate-200 text-slate-600'
                                    }`}
                                  >
                                    <span>Sai</span>
                                    <span>🙁</span>
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* 3. MATCHING QUESTION UI */}
                      {q.type === 'matching' && q.matchingLeft && q.matchingRight && (
                        <div className="space-y-4 text-xs font-bold pl-8">
                          <p className="text-[10px] text-slate-400 italic">Cách chơi: Nhấp vào 1 ô cột Trái, sau đó nhấp vào 1 ô cột Phải để nối!</p>
                          
                          <div className="grid grid-cols-2 gap-4">
                            {/* Left Column */}
                            <div className="space-y-2">
                              <span className="block text-[11px] text-slate-400 font-bold uppercase tracking-wider text-center">Cột Trái</span>
                              {q.matchingLeft.map((leftItem, leftIdx) => {
                                const isSelected = activeLeftMatch === leftItem;
                                const hasMatched = savedAns && savedAns[leftItem];

                                return (
                                  <button
                                    key={leftIdx}
                                    onClick={() => handleLeftMatchClick(leftItem)}
                                    className={`w-full p-2.5 rounded-xl border text-center font-bold transition-all ${
                                      isSelected
                                        ? 'bg-sky-500 text-white border-sky-600 scale-102 shadow-md'
                                        : hasMatched
                                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                                    }`}
                                  >
                                    {leftItem}
                                  </button>
                                );
                              })}
                            </div>

                            {/* Right Column */}
                            <div className="space-y-2">
                              <span className="block text-[11px] text-slate-400 font-bold uppercase tracking-wider text-center">Cột Phải</span>
                              {q.matchingRight.map((rightItem, rightIdx) => {
                                const matchedLeft = savedAns
                                  ? Object.keys(savedAns).find(k => savedAns[k] === rightItem)
                                  : null;

                                return (
                                  <button
                                    key={rightIdx}
                                    onClick={() => handleRightMatchClick(q.id, rightItem)}
                                    className={`w-full p-2.5 rounded-xl border text-center font-bold transition-all ${
                                      matchedLeft
                                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                        : activeLeftMatch
                                        ? 'bg-sky-50 text-sky-700 border-dashed border-sky-300 hover:bg-sky-100/50'
                                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                                    }`}
                                  >
                                    {rightItem}
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          {/* Connections Feedback */}
                          {savedAns && Object.keys(savedAns).length > 0 && (
                            <div className="bg-white p-3 rounded-2xl border border-slate-150 space-y-1.5 text-[10px] text-slate-600">
                              <span className="font-bold text-slate-500 block uppercase">Cặp từ bạn đã nối vế:</span>
                              <div className="flex flex-wrap gap-2">
                                {Object.keys(savedAns).map((leftKey) => (
                                  <div key={leftKey} className="bg-emerald-50 text-emerald-800 px-3 py-1 rounded-full border border-emerald-200 flex items-center space-x-2">
                                    <span>{leftKey} ⇄ {savedAns[leftKey]}</span>
                                    <button
                                      onClick={() => handleUndoMatch(q.id, leftKey)}
                                      className="text-rose-500 hover:text-rose-700 font-extrabold text-[9px] pl-1.5 border-l border-emerald-200"
                                    >
                                      Xoá
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* 4. FILL IN THE BLANK QUESTION UI */}
                      {q.type === 'fill_blank' && q.blankChoices && q.blankAnswers && (
                        <div className="space-y-4 text-xs font-bold pl-8">
                          <p className="text-[10px] text-slate-400 italic">Nhấp vào ô chọn màu vàng để lựa chọn từ điền thích hợp:</p>

                          <div className="bg-white p-4 rounded-2xl border border-slate-150 text-slate-700 leading-loose flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
                            {q.blanksText?.split('...').map((segment, segIdx, arr) => {
                              const showBlank = segIdx < arr.length - 1;
                              const currentVal = savedAns?.[segIdx];

                              return (
                                <React.Fragment key={segIdx}>
                                  <span>{segment}</span>
                                  {showBlank && (
                                    <span className="inline-block">
                                      <select
                                        value={currentVal || ''}
                                        onChange={e => handleBlankWordSelect(q.id, segIdx, e.target.value)}
                                        className={`px-2 py-0.5 rounded-lg border font-black text-xs text-center cursor-pointer transition focus:outline-none ${
                                          currentVal
                                            ? 'bg-yellow-100 text-yellow-800 border-yellow-300'
                                            : 'bg-amber-50 text-amber-600 border-dashed border-amber-300'
                                        }`}
                                      >
                                        <option value="">(?)</option>
                                        {q.blankChoices?.map((choice, cIdx) => (
                                          <option key={cIdx} value={choice}>{choice}</option>
                                        ))}
                                      </select>
                                    </span>
                                  )}
                                </React.Fragment>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* 5. ESSAY QUESTION UI (WITH PHOTO TAKING AND MULTIPLE UPLOAD CHANNELS) */}
                      {q.type === 'essay' && (
                        <div className="space-y-4 text-xs font-bold pl-8">
                          <div className="space-y-2">
                            <label className="block text-[11px] text-indigo-700 font-black uppercase tracking-wider">Viết bài làm tự luận của em *</label>
                            <textarea
                              rows={4}
                              placeholder="Nhập lời giải bài tự luận hoặc đoạn cảm nhận của em..."
                              value={typeof savedAns === 'string' ? savedAns : savedAns?.text || ''}
                              onChange={e => {
                                const currentAnswerObj = quizAnswers[q.id] || { text: '', images: [] };
                                setQuizAnswers(prev => ({
                                  ...prev,
                                  [q.id]: {
                                    text: e.target.value,
                                    images: Array.isArray(currentAnswerObj.images) ? currentAnswerObj.images : []
                                  }
                                }));
                              }}
                              className="w-full text-xs md:text-sm p-3.5 rounded-2xl bg-white border-2 border-indigo-100 focus:border-indigo-400 focus:outline-none font-medium leading-relaxed text-slate-800 shadow-inner"
                            />
                          </div>

                          {/* Captures & Uploads button bar */}
                          <div className="space-y-3 pt-1">
                            <span className="block text-[10px] text-slate-500 uppercase tracking-wider">Chụp hình bài làm của em (Rèn chữ viết trên vở):</span>
                            
                            <div className="flex flex-wrap gap-2.5 items-center">
                              {/* Capture button */}
                              <button
                                type="button"
                                onClick={() => handleSimulateCamera(q.id)}
                                className="flex items-center space-x-1.5 px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-black transition duration-200 cursor-pointer"
                              >
                                <Camera className="h-4 w-4 text-indigo-600 animate-pulse" />
                                <span>📷 Chụp ảnh bài làm (Vở viết)</span>
                              </button>

                              {/* Upload from file button */}
                              <label className="flex items-center space-x-1.5 px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-black cursor-pointer transition duration-200">
                                <ImageIcon className="h-4 w-4 text-indigo-600" />
                                <span>➕ Tải ảnh từ thư viện</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  multiple
                                  className="hidden"
                                  onChange={(e) => handleUploadEssayImages(q.id, e.target.files)}
                                />
                              </label>
                            </div>

                            {/* Render thumbnail previews of student's uploaded homework pictures */}
                            {savedAns && Array.isArray(savedAns.images) && savedAns.images.length > 0 && (
                              <div className="space-y-1.5 bg-slate-100/50 p-3 rounded-2xl border">
                                <span className="text-[9px] text-slate-500 block uppercase font-bold">Hình ảnh bài vở của em đã nạp ({savedAns.images.length}):</span>
                                <div className="flex flex-wrap gap-2">
                                  {savedAns.images.map((pic: string, picIdx: number) => (
                                    <div key={picIdx} className="relative rounded-xl overflow-hidden border border-slate-200 p-0.5 bg-white shadow-xs">
                                      <img
                                        src={pic}
                                        alt={`essay-work-${picIdx}`}
                                        className="h-14 w-auto max-w-[100px] object-cover rounded-lg"
                                      />
                                      <button
                                        type="button"
                                        onClick={() => handleRemoveEssayImage(q.id, picIdx)}
                                        className="absolute top-0.5 right-0.5 h-4.5 w-4.5 bg-rose-500 text-white rounded-full text-[9px] flex items-center justify-center hover:bg-rose-600 font-bold transition cursor-pointer"
                                        title="Xoá ảnh này"
                                      >
                                        ✕
                                      </button>
                                    </div>
                                  ))}
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

              {/* Action buttons */}
              <div className="flex items-center justify-between border-t border-slate-100 pt-4 flex-wrap gap-2">
                <button
                  onClick={() => {
                    audioSynth.playBubblePop();
                    setSolvingAssignment(null);
                  }}
                  className="px-5 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-500 font-extrabold text-xs rounded-xl cursor-pointer"
                >
                  Huỷ bỏ
                </button>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleSaveDraft}
                    className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs rounded-xl flex items-center space-x-1 cursor-pointer"
                  >
                    <Save className="h-4 w-4" />
                    <span>Lưu Nháp 💾</span>
                  </button>
                  <button
                    onClick={handleSubmitAssignment}
                    className="px-6 py-2.5 bg-teal-500 hover:bg-teal-600 text-white font-black text-xs rounded-xl flex items-center space-x-1 shadow-md shadow-teal-500/25 cursor-pointer"
                  >
                    <Check className="h-4 w-4" />
                    <span>Nộp Bài Cho Cô 🚀</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 5. REVIEW COMPLETED SUBMISSION MODAL */}
      <AnimatePresence>
        {reviewingSubmission && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 z-50 overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.93, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.93, y: 15 }}
              className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-4 md:p-6 border-4 border-emerald-400 space-y-5 my-8 text-left"
            >
              <div className="flex items-center justify-between border-b pb-3 flex-wrap gap-2">
                <div>
                  <span className="text-[10px] font-extrabold text-emerald-600 uppercase tracking-wider block">Bé xem lại kết quả bài làm học tập</span>
                  <h3 className="text-base md:text-lg font-black text-slate-800">{reviewingSubmission.assignment.title}</h3>
                </div>
                <button
                  onClick={() => setReviewingSubmission(null)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-bold text-slate-500 cursor-pointer"
                >
                  ✕ Đóng bảng
                </button>
              </div>

              {/* Status banner */}
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 grid grid-cols-2 sm:grid-cols-3 gap-3 text-center">
                <div className="space-y-0.5">
                  <span className="text-[10px] text-slate-400 block font-bold uppercase">Điểm sao nhận</span>
                  <span className="text-lg font-black text-emerald-700">⭐ {reviewingSubmission.submission.score} Sao</span>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[10px] text-slate-400 block font-bold uppercase">Số câu chính xác</span>
                  <span className="text-lg font-black text-slate-700">
                    🎯 {reviewingSubmission.submission.correctCount} / {reviewingSubmission.submission.totalQuestions} Câu
                  </span>
                </div>
                <div className="space-y-0.5 col-span-2 sm:col-span-1">
                  <span className="text-[10px] text-slate-400 block font-bold uppercase">Số lần thực hiện</span>
                  <span className="text-lg font-black text-indigo-700">Lần {reviewingSubmission.submission.attemptsCount || 1}</span>
                </div>
              </div>

              {/* List of submitted questions with correctness details */}
              <div className="space-y-5 max-h-[350px] overflow-y-auto pr-2">
                {reviewingSubmission.assignment.questions.map((q, idx) => {
                  const sAns = reviewingSubmission.submission.answers?.[q.id];
                  
                  // Calculate correctness
                  let isCorrect = false;
                  if (q.type === 'single_choice') {
                    isCorrect = sAns === q.correctAnswer;
                  } else if (q.type === 'true_false') {
                    let allC = true;
                    q.trueFalseOptions?.forEach(opt => {
                      if (sAns?.[opt.text] !== opt.correct) allC = false;
                    });
                    isCorrect = allC;
                  } else if (q.type === 'matching') {
                    let allM = true;
                    q.matchingLeft?.forEach(left => {
                      if (sAns?.[left] !== q.matchingPairs?.[left]) allM = false;
                    });
                    isCorrect = allM;
                  } else if (q.type === 'fill_blank') {
                    let allC = true;
                    q.blankAnswers?.forEach((ans, i) => {
                      if (sAns?.[i] !== ans) allC = false;
                    });
                    isCorrect = allC;
                  } else if (q.type === 'essay') {
                    isCorrect = true; // Essay is deemed correct or graded manually
                  }

                  return (
                    <div key={q.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-150 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start space-x-2.5">
                          <span className="h-6 w-6 rounded-full bg-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center shrink-0">
                            {idx + 1}
                          </span>
                          <h4 className="font-extrabold text-slate-800 text-xs md:text-sm">{q.questionText}</h4>
                        </div>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider shrink-0 ${
                          isCorrect ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-rose-100 text-rose-800 border border-rose-200'
                        }`}>
                          {q.type === 'essay' ? 'Tự Luận ✍️' : isCorrect ? 'Đúng ✓' : 'Sai ✕'}
                        </span>
                      </div>

                      {/* Submitted responses details */}
                      <div className="pl-8 text-xs font-semibold text-slate-600 space-y-2">
                        {q.type === 'single_choice' && (
                          <div className="space-y-1.5">
                            <p>Đáp án bé chọn: <span className="font-mono font-black text-indigo-600 bg-white px-2 py-0.5 rounded border">{sAns || 'Không làm'}</span></p>
                            <p>Đáp án đúng của câu: <span className="font-mono font-black text-emerald-600 bg-white px-2 py-0.5 rounded border">{q.correctAnswer}</span></p>
                          </div>
                        )}

                        {q.type === 'true_false' && (
                          <div className="space-y-1 bg-white p-2.5 rounded-xl border">
                            {q.trueFalseOptions?.map((opt, oIdx) => (
                              <div key={oIdx} className="flex justify-between border-b last:border-0 pb-1 pt-1">
                                <span>{opt.text}</span>
                                <span className="font-bold">
                                  Bé chọn: {sAns?.[opt.text] === true ? 'Đúng' : sAns?.[opt.text] === false ? 'Sai' : 'Chưa chọn'} 
                                  (Ý đúng: {opt.correct ? 'Đúng' : 'Sai'})
                                </span>
                              </div>
                            ))}
                          </div>
                        )}

                        {q.type === 'matching' && sAns && (
                          <div className="space-y-1.5 bg-white p-2.5 rounded-xl border">
                            <span className="block font-black text-slate-500 uppercase text-[9px]">Cột nối vế của bé:</span>
                            <div className="flex flex-wrap gap-1.5">
                              {Object.keys(sAns).map(lKey => (
                                <span key={lKey} className="bg-slate-50 px-2 py-1 rounded border block">
                                  {lKey} ⇄ {sAns[lKey]}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {q.type === 'fill_blank' && (
                          <div className="space-y-1 bg-white p-2.5 rounded-xl border">
                            <span className="block font-black text-slate-500 uppercase text-[9px] mb-1">Từ đã điền:</span>
                            {q.blankAnswers?.map((correct, i) => (
                              <p key={i}>Ô #{i + 1}: <span className="font-bold text-indigo-600">{sAns?.[i] || 'Chưa điền'}</span> (Đáp án đúng: <span className="text-emerald-600">{correct}</span>)</p>
                            ))}
                          </div>
                        )}

                        {q.type === 'essay' && (
                          <div className="space-y-2.5">
                            <div className="bg-white p-3 rounded-xl border italic font-medium text-slate-700">
                              "{typeof sAns === 'string' ? sAns : sAns?.text || 'Không có bài gõ chữ'}"
                            </div>

                            {/* Render uploaded images */}
                            {sAns && Array.isArray(sAns.images) && sAns.images.length > 0 && (
                              <div className="space-y-1">
                                <span className="block text-[9px] text-slate-400 font-bold uppercase">Ảnh vở viết bé đã tải lên:</span>
                                <div className="flex flex-wrap gap-1.5">
                                  {sAns.images.map((img: string, iIndex: number) => (
                                    <img
                                      key={iIndex}
                                      src={img}
                                      alt="work-img"
                                      className="h-14 w-auto max-w-[120px] object-cover rounded-lg border bg-white p-0.5"
                                    />
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Render AI Feedback if exists */}
                            {reviewingSubmission.submission.aiGradedFeedback?.[q.id] && (() => {
                              const feedback = reviewingSubmission.submission.aiGradedFeedback[q.id];
                              return (
                                <div className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-sky-50 to-indigo-50 border border-sky-100 space-y-4 shadow-2xs">
                                  <div className="flex justify-between items-center">
                                    <span className="text-[10px] font-black text-indigo-800 uppercase flex items-center space-x-1">
                                      <span>🤖 Nhận xét tự động từ Cô giáo AI</span>
                                    </span>
                                    <span className="text-xs font-extrabold text-indigo-700 bg-white border border-indigo-150 px-2.5 py-1 rounded-xl shadow-3xs">
                                      {feedback.score} / {feedback.maxScore} Điểm
                                    </span>
                                  </div>

                                  <div className="text-xs text-slate-700 leading-relaxed font-bold">
                                    <span className="block text-[9px] text-slate-400 font-black uppercase mb-0.5">Ý kiến nhận xét:</span>
                                    "{feedback.comments}"
                                  </div>

                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {feedback.correctAnswers && feedback.correctAnswers.length > 0 && (
                                      <div className="p-3 bg-white/70 rounded-xl border border-emerald-100 text-xs">
                                        <span className="block text-[9px] font-black text-emerald-700 uppercase mb-1">👍 Các điểm tốt của con:</span>
                                        <ul className="list-disc pl-4 space-y-0.5 text-slate-600 font-semibold">
                                          {feedback.correctAnswers.map((item: string, iIndex: number) => (
                                            <li key={iIndex}>{item}</li>
                                          ))}
                                        </ul>
                                      </div>
                                    )}

                                    {feedback.incorrectAnswers && feedback.incorrectAnswers.length > 0 && (
                                      <div className="p-3 bg-white/70 rounded-xl border border-rose-100 text-xs">
                                        <span className="block text-[9px] font-black text-rose-700 uppercase mb-1">✍️ Chỗ cần rèn thêm:</span>
                                        <ul className="list-disc pl-4 space-y-0.5 text-slate-600 font-semibold">
                                          {feedback.incorrectAnswers.map((item: string, iIndex: number) => (
                                            <li key={iIndex}>{item}</li>
                                          ))}
                                        </ul>
                                      </div>
                                    )}
                                  </div>

                                  {feedback.suggestions && (
                                    <div className="text-xs text-slate-700 leading-relaxed">
                                      <span className="block text-[9px] text-indigo-600 font-black uppercase mb-0.5">💡 Cô khuyên con sửa như thế này nhé:</span>
                                      <p className="font-bold">"{feedback.suggestions}"</p>
                                    </div>
                                  )}

                                  {/* Ask AI button */}
                                  <button
                                    onClick={() => {
                                      audioSynth.playStarChime();
                                      setAiChatQuestionId(q.id);
                                      setAiChatHistory(feedback.chatHistory || []);
                                      setShowAiChatTutor(true);
                                    }}
                                    className="w-full py-2 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-xs transition-all cursor-pointer flex items-center justify-center space-x-1.5"
                                  >
                                    <span>💬 Hỏi Cô Giáo Trợ Lý AI</span>
                                  </button>
                                </div>
                              );
                            })()}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Teacher Comment if exists */}
              {reviewingSubmission.submission.feedbackMessage && (
                <div className="p-4 bg-teal-50 border border-teal-100 rounded-2xl text-xs space-y-1.5">
                  <span className="font-black text-teal-800 block uppercase tracking-wider text-[10px]">💬 Đánh giá nhận xét của {localStorage.getItem('lms_teacher_name') || 'Cô giáo Mai Anh'}:</span>
                  <p className="italic font-bold text-slate-700">"{reviewingSubmission.submission.feedbackMessage}"</p>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 6. CELEBRATION STARS MODAL */}
      <AnimatePresence>
        {celebrationData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className="bg-white rounded-3xl border-4 border-yellow-300 shadow-2xl max-w-sm w-full p-8 text-center space-y-6 relative overflow-hidden"
            >
              <div className="absolute top-4 left-4 text-2xl animate-pulse text-yellow-400">⭐</div>
              <div className="absolute bottom-4 right-4 text-3xl animate-bounce text-amber-500">✨</div>

              <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto shadow-inner text-4xl animate-bounce">
                🎉
              </div>

              <div className="space-y-1">
                <h3 className="text-xl font-black text-slate-800">Hoàn Thành Thử Thách!</h3>
                <p className="text-xs text-slate-500 font-bold leading-relaxed">
                  Bé đã rất xuất sắc hoàn thành thử thách học tập này!
                </p>
              </div>

              <div className="p-4 bg-yellow-50 rounded-2xl border border-yellow-100 space-y-3 font-sans">
                <span className="block text-xs font-bold text-amber-700 uppercase tracking-wide">Phần thưởng thi đua</span>
                <div className="flex justify-center space-x-4">
                  <div className="flex flex-col items-center">
                    <span className="text-2xl font-black text-amber-600">+{celebrationData.starsWon}</span>
                    <span className="text-[10px] text-slate-400 font-bold">Sao lấp lánh ⭐</span>
                  </div>
                  <div className="h-8 w-[1px] bg-yellow-200" />
                  <div className="flex flex-col items-center">
                    <span className="text-2xl font-black text-slate-700">
                      {celebrationData.correctCount} / {celebrationData.total}
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold">Câu trả lời đúng</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setCelebrationData(null)}
                className="w-full py-2.5 bg-yellow-500 hover:bg-yellow-600 text-white font-extrabold text-xs rounded-xl cursor-pointer shadow-md shadow-yellow-500/25 transition"
              >
                Nhận Sao Ngay Thôi! 🥳
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 7. INTERACTIVE AI CHAT TUTOR MODAL */}
      <AnimatePresence>
        {showAiChatTutor && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-end z-50 p-0 sm:p-4"
          >
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="bg-white h-full sm:h-[95vh] w-full sm:max-w-md sm:rounded-3xl shadow-2xl flex flex-col relative overflow-hidden"
            >
              {/* Header */}
              <div className="p-4 bg-gradient-to-r from-sky-400 to-indigo-600 text-white flex justify-between items-center shrink-0">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl animate-bounce">👩‍🏫</span>
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-wider">Cô giáo Trợ lý AI</h3>
                    <p className="text-[10px] text-sky-100 font-bold">Giải đáp thắc mắc và hướng dẫn làm bài cho con</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    audioSynth.playBubblePop();
                    setShowAiChatTutor(false);
                  }}
                  className="p-1 hover:bg-white/10 rounded-full transition cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Chat bubbles container */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
                <div className="flex items-start space-x-2">
                  <span className="text-xl">👩‍🏫</span>
                  <div className="p-3 bg-white border border-slate-150 rounded-2xl text-xs font-bold text-slate-700 max-w-[80%] shadow-3xs leading-relaxed">
                    Chào bé yêu! Cô giáo AI đây. Cô rất vui được đồng hành cùng con. Con có thắc mắc gì về bài làm này cần cô giảng giải chi tiết hơn không nào? 💕
                  </div>
                </div>

                {aiChatHistory.map((chat, idx) => (
                  <div
                    key={idx}
                    className={`flex items-start space-x-2 ${
                      chat.role === 'user' ? 'justify-end space-x-reverse' : ''
                    }`}
                  >
                    {chat.role === 'model' && <span className="text-xl">👩‍🏫</span>}
                    <div
                      className={`p-3 rounded-2xl text-xs font-bold leading-relaxed max-w-[80%] shadow-3xs ${
                        chat.role === 'user'
                          ? 'bg-indigo-600 text-white'
                          : 'bg-white border border-slate-150 text-slate-700'
                      }`}
                    >
                      {chat.text}
                    </div>
                    {chat.role === 'user' && <span className="text-xl">👶</span>}
                  </div>
                ))}

                {isChatSending && (
                  <div className="flex items-start space-x-2">
                    <span className="text-xl">👩‍🏫</span>
                    <div className="p-3 bg-white border border-slate-150 rounded-2xl text-xs font-bold text-slate-400 flex items-center space-x-2 shadow-3xs">
                      <div className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:-0.3s]" />
                      <div className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:-0.15s]" />
                      <div className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce" />
                    </div>
                  </div>
                )}
              </div>

              {/* Predefined prompt chips */}
              <div className="p-3 bg-white border-t border-slate-100 flex flex-wrap gap-1.5 shrink-0">
                {[
                  'Cô ơi tại sao con bị trừ điểm?',
                  'Cô hướng dẫn con viết hay hơn nhé',
                  'Sửa lỗi chính tả giúp con ạ',
                  'Khen con một câu đi cô trợ lý ơi! 🥰'
                ].map((chip) => (
                  <button
                    key={chip}
                    onClick={() => {
                      if (isChatSending) return;
                      setStudentChatMessage(chip);
                    }}
                    className="px-2.5 py-1 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 border border-slate-200 hover:border-indigo-200 text-[10px] font-bold text-slate-500 rounded-lg transition cursor-pointer"
                  >
                    {chip}
                  </button>
                ))}
              </div>

              {/* Input section */}
              <div className="p-3 bg-white border-t border-slate-150 flex items-center gap-2 shrink-0">
                <input
                  type="text"
                  value={studentChatMessage}
                  onChange={(e) => setStudentChatMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSendChatMessage();
                  }}
                  disabled={isChatSending}
                  placeholder="Gõ tin nhắn hỏi cô giáo trợ lý..."
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400"
                />
                <button
                  onClick={handleSendChatMessage}
                  disabled={isChatSending || !studentChatMessage.trim()}
                  className="p-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-100 disabled:text-slate-400 text-white rounded-xl shadow-xs transition cursor-pointer flex items-center justify-center"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};
