/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
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
  BookMarked
} from 'lucide-react';
import { Assignment, Question, Submission } from '../types';
import { audioSynth } from './AudioSynthesizer';

export const StudentView: React.FC = () => {
  const {
    currentUser,
    students,
    assignments,
    submissions,
    saveSubmission
  } = useLMS();

  // Find active student profile
  const activeStudent = students.find(s => s.id === currentUser.studentId);

  // Tab state: 'incomplete' | 'completed'
  const [activeTab, setActiveTab] = useState<'incomplete' | 'completed'>('incomplete');
  
  // Subject Filter
  const [selectedSubject, setSelectedSubject] = useState<string>('Tất cả');

  // Active quiz state
  const [solvingAssignment, setSolvingAssignment] = useState<Assignment | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<{ [qId: string]: any }>({});
  const [quizStartTime, setQuizStartTime] = useState<number>(0);
  
  // Interactive matching state
  const [activeLeftMatch, setActiveLeftMatch] = useState<string | null>(null);

  // Success Celebration Screen modal state
  const [celebrationData, setCelebrationData] = useState<{
    starsWon: number;
    correctCount: number;
    total: number;
  } | null>(null);

  if (!activeStudent) {
    return (
      <div className="bg-white rounded-3xl p-8 text-center border">
        <p className="text-slate-500 font-bold">Không tìm thấy thông tin hồ sơ học sinh tương thích.</p>
      </div>
    );
  }

  // Get subjects of existing assignments
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

  // Filter lists by selected subject
  const displayedAssignments = (activeTab === 'incomplete' ? incompleteAssignments : completedAssignments)
    .filter(as => selectedSubject === 'Tất cả' || as.subject === selectedSubject);

  // Start solving
  const handleStartAssignment = (as: Assignment) => {
    // Load draft if exists
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

  // Handle single choice selection
  const handleSingleSelect = (qId: string, value: string) => {
    setQuizAnswers(prev => ({ ...prev, [qId]: value }));
  };

  // Handle True/False toggle
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

  // Handle Matching Left click
  const handleLeftMatchClick = (leftText: string) => {
    setActiveLeftMatch(leftText);
  };

  // Handle Matching Right click (combines the connection)
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

  // Undos match
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

  // Handle Fill word in blank click
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

  // Save Draft progress
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

  // Final submit validation & grading
  const handleSubmitAssignment = () => {
    if (!solvingAssignment) return;

    let correctCount = 0;
    const total = solvingAssignment.questions.length;

    solvingAssignment.questions.forEach(q => {
      const studentAns = quizAnswers[q.id];
      if (!studentAns) return;

      if (q.type === 'single_choice') {
        if (studentAns === q.correctAnswer) correctCount++;
      } else if (q.type === 'true_false') {
        // Must match all True/False conditions correctly
        let allCorrect = true;
        q.trueFalseOptions?.forEach(opt => {
          if (studentAns[opt.text] !== opt.correct) {
            allCorrect = false;
          }
        });
        if (allCorrect) correctCount++;
      } else if (q.type === 'matching') {
        let allMatched = true;
        q.matchingLeft?.forEach(left => {
          if (studentAns[left] !== q.matchingPairs?.[left]) {
            allMatched = false;
          }
        });
        if (allMatched) correctCount++;
      } else if (q.type === 'fill_blank') {
        let allCorrect = true;
        q.blankAnswers?.forEach((correctWord, idx) => {
          if (studentAns[idx] !== correctWord) {
            allCorrect = false;
          }
        });
        if (allCorrect) correctCount++;
      }
    });

    // Option: Must get 100% correct
    if (solvingAssignment.criteria.mustGet100 && correctCount < total) {
      audioSynth.playError();
      alert(`Bài tập yêu cầu hoàn thành đúng 100% mới được nộp! Bé hiện đúng ${correctCount}/${total} câu. Bé hãy kiểm tra kỹ lại bài nhé!`);
      return;
    }

    const duration = Math.round((Date.now() - quizStartTime) / 1000);
    const correctRatio = total > 0 ? correctCount / total : 1;
    const starsWon = Math.round(solvingAssignment.rewardStars * correctRatio);

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
      attemptsCount: attempts
    });

    // Trigger celebration
    setCelebrationData({
      starsWon,
      correctCount,
      total
    });

    audioSynth.playSuccess();
    setSolvingAssignment(null);
  };

  return (
    <div className="space-y-6">
      
      {/* Student welcome head cards */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center space-x-4">
          <span className="text-5xl p-3 bg-amber-50 rounded-2xl shadow-inner">{activeStudent.avatar}</span>
          <div>
            <h2 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight flex items-center gap-1.5">
              <span>Chào bé, {activeStudent.name}!</span>
              <Sparkles className="h-5 w-5 text-amber-500 animate-spin" />
            </h2>
            <p className="text-xs text-slate-400 font-bold mt-0.5">Lớp 3A | Thầy Cô: Mai Anh chủ nhiệm</p>
          </div>
        </div>

        {/* Display Badges Cup */}
        <div className="flex items-center space-x-4 bg-gradient-to-r from-amber-500 to-rose-400 p-4 rounded-2xl text-white shadow-md">
          <div className="flex flex-col items-center border-r border-white/20 pr-4">
            <span className="text-xs font-bold uppercase text-white/80">Sao Đã Tích</span>
            <span className="text-2xl font-black">⭐ {activeStudent.stars}</span>
          </div>
          <div className="flex flex-col items-center border-r border-white/20 px-4">
            <span className="text-xs font-bold uppercase text-white/80">Cờ Thi Đua</span>
            <span className="text-2xl font-black">🚩 {activeStudent.flags}</span>
          </div>
          <div className="flex flex-col items-center pl-2">
            <span className="text-xs font-bold uppercase text-white/80">Thẻ Vàng</span>
            <span className="text-2xl font-black">🏆 {activeStudent.goldCards}</span>
          </div>
        </div>
      </div>

      {/* Tabs list and Subjects filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between bg-white p-3 rounded-2xl border border-slate-100 shadow-sm gap-3">
        {/* Toggle complete vs incomplete */}
        <div className="flex bg-slate-100 p-1.5 rounded-xl text-xs font-bold gap-1 w-fit border border-slate-200">
          <button
            onClick={() => setActiveTab('incomplete')}
            className={`px-4 py-2 rounded-lg transition-all ${
              activeTab === 'incomplete' ? 'bg-sky-500 text-white shadow-md' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Nhiệm Vụ Chưa Làm ({incompleteAssignments.length})
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`px-4 py-2 rounded-lg transition-all ${
              activeTab === 'completed' ? 'bg-emerald-500 text-white shadow-md' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Đã Hoàn Thành ({completedAssignments.length})
          </button>
        </div>

        {/* Subject dropdown filter */}
        <div className="flex items-center space-x-2 text-xs font-bold text-slate-500">
          <span>Tìm Môn Học:</span>
          <select
            value={selectedSubject}
            onChange={e => setSelectedSubject(e.target.value)}
            className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 focus:outline-none focus:border-sky-400"
          >
            {subjects.map((subj, idx) => (
              <option key={idx} value={subj}>{subj}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid of assignments */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {displayedAssignments.length === 0 ? (
          <div className="col-span-2 bg-white rounded-3xl p-12 text-center border text-slate-400 font-bold space-y-2">
            <BookMarked className="h-10 w-10 mx-auto text-slate-300" />
            <p className="text-sm">Yê hô! Hiện không có nhiệm vụ học tập nào ở đây cả.</p>
          </div>
        ) : (
          displayedAssignments.map((as) => {
            const hasDraft = submissions.find(
              s => s.assignmentId === as.id && s.studentId === activeStudent.id && s.status === 'draft'
            );

            return (
              <motion.div
                key={as.id}
                whileHover={{ scale: 1.01 }}
                className="bg-white rounded-3xl border border-slate-150 p-6 shadow-sm flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-extrabold text-sky-600 bg-sky-50 px-3 py-1 rounded-full border border-sky-100 uppercase">
                      📚 {as.subject}
                    </span>
                    <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-100 flex items-center gap-1">
                      ⭐ +{as.rewardStars} Sao thưởng
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-800 text-base mb-1.5">{as.title}</h3>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed italic">
                    "{as.description || 'Thầy cô nhắn nhủ các em cố gắng hoàn thành xuất sắc thử thách này nhé!'}"
                  </p>

                  {/* Badges/Criteria list */}
                  <div className="flex flex-wrap gap-1.5 mt-3 text-[10px] font-bold">
                    {as.criteria.mustGet100 && (
                      <span className="bg-rose-50 text-rose-600 px-2 py-0.5 rounded border border-rose-100">Đúng 100% mới nộp</span>
                    )}
                    {as.criteria.onlyOneAttempt && (
                      <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200">Chỉ được làm 1 lần</span>
                    )}
                    <span className="bg-sky-50 text-sky-600 px-2 py-0.5 rounded border border-sky-100">Hạn: {as.criteria.timeLimitHours}h</span>
                  </div>
                </div>

                {/* Submissions stats if complete */}
                {activeTab === 'completed' && (
                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 space-y-1.5 text-xs text-slate-600 font-medium font-sans">
                    {submissions
                      .filter(s => s.assignmentId === as.id && s.studentId === activeStudent.id)
                      .map((sub, i) => (
                        <div key={i} className="flex flex-wrap items-center justify-between gap-1">
                          <span className="font-bold text-emerald-600 flex items-center gap-1">
                            <Check className="h-3.5 w-3.5" />
                            <span>Đúng {sub.correctCount} / {sub.totalQuestions} câu</span>
                          </span>
                          <span>Đã làm: {sub.attemptsCount} lần</span>
                          <span>{sub.timeSpentSeconds} giây</span>
                        </div>
                      ))}
                  </div>
                )}

                {activeTab === 'incomplete' && (
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                    {hasDraft ? (
                      <span className="text-[11px] text-amber-600 font-bold bg-amber-50 px-2.5 py-1 rounded-full border border-amber-100 animate-pulse">
                        📝 Đang làm nháp
                      </span>
                    ) : (
                      <span className="text-[11px] text-slate-400 font-bold font-mono">Chưa hoàn thành</span>
                    )}
                    
                    <button
                      onClick={() => handleStartAssignment(as)}
                      className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white font-extrabold text-xs rounded-xl flex items-center space-x-1 shadow-md shadow-sky-500/20 cursor-pointer"
                    >
                      <Play className="h-3 w-3 fill-white" />
                      <span>{hasDraft ? 'Làm tiếp bài' : 'Bắt đầu làm bài'}</span>
                    </button>
                  </div>
                )}
              </motion.div>
            );
          })
        )}
      </div>

      {/* QUIZ INTERACTIVE SOLVER MODAL */}
      <AnimatePresence>
        {solvingAssignment && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-3xl border-4 border-sky-300 shadow-2xl max-w-3xl w-full p-6 md:p-8 space-y-6"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <span className="text-xs font-extrabold text-sky-600 uppercase">Đang giải bài tập</span>
                  <h3 className="text-lg font-black text-slate-800">{solvingAssignment.title}</h3>
                </div>
                <div className="text-xs font-bold text-amber-500 flex items-center gap-1 bg-amber-50 px-3 py-1.5 rounded-full border border-amber-100">
                  <Award className="h-4 w-4" />
                  <span>Hoàn thành được: +{solvingAssignment.rewardStars} Sao</span>
                </div>
              </div>

              {/* Questions solver container */}
              <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2">
                {solvingAssignment.questions.map((q, idx) => {
                  const savedAns = quizAnswers[q.id];

                  return (
                    <div key={q.id} className="p-4 md:p-5 rounded-3xl border-2 border-slate-100 bg-slate-50/50 space-y-4">
                      {/* Question Header */}
                      <div className="flex items-center space-x-2">
                        <span className="h-6 w-6 rounded-full bg-sky-500 text-white text-xs font-bold flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <h4 className="font-extrabold text-slate-800 text-sm md:text-base">{q.questionText}</h4>
                      </div>

                      {/* 1. SINGLE CHOICE QUESTION UI */}
                      {q.type === 'single_choice' && q.options && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs font-bold">
                          {['A', 'B', 'C', 'D'].map((letter, optIdx) => {
                            const isSelected = savedAns === letter;
                            return (
                              <button
                                key={letter}
                                onClick={() => handleSingleSelect(q.id, letter)}
                                className={`p-3 rounded-2xl border text-left flex items-center space-x-2.5 cursor-pointer transition-all ${
                                  isSelected
                                    ? 'bg-amber-400 text-white border-amber-500 shadow-md'
                                    : 'bg-white border-slate-200 text-slate-700 hover:bg-sky-50/50'
                                }`}
                              >
                                <span className={`h-6 w-6 rounded-full flex items-center justify-center border text-xs ${
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
                        <div className="space-y-2.5 text-xs font-bold">
                          {q.trueFalseOptions.map((opt, optIdx) => {
                            const currentTFState = savedAns?.[opt.text];

                            return (
                              <div key={optIdx} className="p-3 bg-white rounded-2xl border border-slate-150 flex flex-col md:flex-row md:items-center justify-between gap-2">
                                <span className="text-slate-700 font-semibold">{opt.text}</span>
                                <div className="flex space-x-2 shrink-0">
                                  {/* Đúng Option */}
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

                                  {/* Sai Option */}
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
                        <div className="space-y-4 text-xs font-bold">
                          <p className="text-[11px] text-slate-400">Cách chơi: Bấm chọn một mục bên Trái, sau đó chọn tiếp một mục khớp ở bên Phải để nối!</p>
                          
                          <div className="grid grid-cols-2 gap-4">
                            {/* Left Column */}
                            <div className="space-y-2">
                              <span className="block text-[11px] text-slate-400 font-bold uppercase tracking-wider text-center">Cột Trái</span>
                              {q.matchingLeft.map((leftItem, idx) => {
                                const isSelected = activeLeftMatch === leftItem;
                                const hasMatched = savedAns && savedAns[leftItem];

                                return (
                                  <button
                                    key={idx}
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
                              {q.matchingRight.map((rightItem, idx) => {
                                // Find if this right item is already matched to some left item
                                const matchedLeft = savedAns
                                  ? Object.keys(savedAns).find(k => savedAns[k] === rightItem)
                                  : null;

                                return (
                                  <button
                                    key={idx}
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

                          {/* Matching connections list displayed below */}
                          {savedAns && Object.keys(savedAns).length > 0 && (
                            <div className="bg-white p-3 rounded-2xl border border-slate-150 space-y-1.5 text-[11px] text-slate-600 font-sans">
                              <span className="font-bold text-slate-500 block uppercase mb-1">Cặp từ bạn đã nối vế:</span>
                              <div className="flex flex-wrap gap-2">
                                {Object.keys(savedAns).map((leftKey) => (
                                  <div key={leftKey} className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full border border-emerald-200 flex items-center space-x-2">
                                    <span>{leftKey} ⇄ {savedAns[leftKey]}</span>
                                    <button
                                      onClick={() => handleUndoMatch(q.id, leftKey)}
                                      className="text-rose-500 hover:text-rose-700 font-extrabold focus:outline-none text-[10px] pl-1.5 border-l border-emerald-300"
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
                        <div className="space-y-4 text-xs font-bold">
                          <p className="text-[11px] text-slate-400">Cách chơi: Nhấp vào một ô trống (...) màu vàng, sau đó nhấp vào một từ ở bảng ngân hàng bên dưới để điền!</p>

                          {/* Render sentence dynamically substituting '...' with clickable blank buttons */}
                          <div className="bg-white p-4 rounded-2xl border border-slate-150 text-sm md:text-base text-slate-700 font-semibold leading-loose flex flex-wrap items-center gap-x-2 gap-y-1">
                            {q.blanksText?.split('...').map((segment, segIdx, arr) => {
                              const showBlank = segIdx < arr.length - 1;
                              const currentVal = savedAns?.[segIdx];

                              return (
                                <React.Fragment key={segIdx}>
                                  <span>{segment}</span>
                                  {showBlank && (
                                    <span className="inline-block relative">
                                      <select
                                        value={currentVal || ''}
                                        onChange={e => handleBlankWordSelect(q.id, segIdx, e.target.value)}
                                        className={`px-3 py-1 rounded-xl border-2 font-black font-sans text-xs min-w-[100px] text-center cursor-pointer transition focus:outline-none ${
                                          currentVal
                                            ? 'bg-yellow-100 text-yellow-800 border-yellow-300'
                                            : 'bg-amber-50 text-amber-600 border-dashed border-amber-300 animate-pulse'
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

                          {/* Word Bank visual feedback */}
                          <div className="space-y-1">
                            <span className="text-[11px] text-slate-400 block uppercase">Ngân hàng các từ vựng lựa chọn:</span>
                            <div className="flex flex-wrap gap-2 pt-1">
                              {q.blankChoices.map((choice, choiceIdx) => {
                                // Check if choice is already used in any blank
                                const isUsed = savedAns && Object.values(savedAns).includes(choice);

                                return (
                                  <span
                                    key={choiceIdx}
                                    className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition ${
                                      isUsed
                                        ? 'bg-slate-100 text-slate-300 border-slate-150 cursor-not-allowed line-through'
                                        : 'bg-sky-50 border-sky-150 text-sky-700'
                                    }`}
                                  >
                                    {choice}
                                  </span>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      )}

                    </div>
                  );
                })}
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                <button
                  onClick={() => setSolvingAssignment(null)}
                  className="px-5 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-500 font-bold text-xs rounded-xl cursor-pointer"
                >
                  Huỷ bỏ
                </button>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleSaveDraft}
                    className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center space-x-1 cursor-pointer"
                  >
                    <Save className="h-4 w-4" />
                    <span>Lưu Nháp 💾</span>
                  </button>
                  <button
                    onClick={handleSubmitAssignment}
                    className="px-6 py-2.5 bg-sky-500 hover:bg-sky-600 text-white font-black text-xs rounded-xl flex items-center space-x-1 shadow-md shadow-sky-500/25 cursor-pointer"
                  >
                    <Check className="h-4 w-4" />
                    <span>Nộp Bài Tập 🚀</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* QUIZ SCORE CELEBRATION SCREEN */}
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
              {/* Fun stars particles in background */}
              <div className="absolute top-4 left-4 text-2xl animate-spin text-yellow-400">⭐</div>
              <div className="absolute bottom-4 right-4 text-3xl animate-bounce text-amber-500">✨</div>

              <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto shadow-inner text-4xl animate-bounce">
                🎉
              </div>

              <div className="space-y-1">
                <h3 className="text-xl font-black text-slate-800">Cố lên bé yêu! Nộp bài thành công</h3>
                <p className="text-sm text-slate-500 font-medium leading-relaxed">
                  Bé đã rất xuất sắc hoàn thành xuất sắc thử thách học tập này!
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
                className="w-full py-2.5 bg-yellow-500 hover:bg-yellow-600 text-white font-extrabold text-sm rounded-xl cursor-pointer shadow-md shadow-yellow-500/25 transition"
              >
                Nhận Sao Ngay Hôi! 🥳
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};
