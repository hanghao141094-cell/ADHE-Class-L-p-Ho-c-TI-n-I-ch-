/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Beautifully redesigned Parent View matching Student Home Screen requests with collapsible blocks & tabs
 */

import React, { useState } from 'react';
import { useLMS } from '../context/LMSContext';
import { motion, AnimatePresence } from 'motion/react';
import {
  Trophy,
  Award,
  BookOpen,
  MessageSquare,
  AlertTriangle,
  ClipboardList,
  Mail,
  Save,
  CheckCircle,
  Clock,
  Send,
  User,
  ChevronDown,
  ChevronUp,
  Link as LinkIcon,
  ExternalLink,
  Download,
  BookMarked,
  RefreshCw,
  Eye,
  Star,
  Check
} from 'lucide-react';
import { Assignment, Submission } from '../types';
import { audioSynth } from './AudioSynthesizer';

export const ParentView: React.FC = () => {
  const {
    currentUser,
    students,
    attendanceList,
    violations,
    resolveViolation,
    assignments,
    submissions,
    feedbacks,
    addFeedback,
    updateStudent,
    settings,
    parentCheckedAssignments,
    markParentChecked
  } = useLMS();

  // Find linked student
  const childStudent = students.find(s => s.id === currentUser.studentId);

  // Collapsible state
  const [isLinksCollapsed, setIsLinksCollapsed] = useState(true);
  const [isZoneCollapsed, setIsZoneCollapsed] = useState(false);

  // Tab state within Zone: 'tasks' | 'progress' | 'settings'
  const [activeTab, setActiveTab] = useState<'tasks' | 'progress' | 'settings'>('tasks');

  // Tasks Sub Tab: 'incomplete' | 'completed'
  const [tasksSubTab, setTasksSubTab] = useState<'incomplete' | 'completed'>('incomplete');
  const [selectedWeek, setSelectedWeek] = useState<number | 'Tất cả'>('Tất cả');
  const [selectedSubject, setSelectedSubject] = useState<string>('Tất cả');

  // Password change states for parents
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [newParentPass, setNewParentPass] = useState('');
  const [confirmParentPass, setConfirmParentPass] = useState('');
  const [passSuccessMsg, setPassSuccessMsg] = useState('');
  const [passErrorMsg, setPassErrorMsg] = useState('');

  // Parent Feedback States
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const [feedbackDraft, setFeedbackDraft] = useState('');

  // Handle reminder verification (parent response)
  const [violationResponses, setViolationResponses] = useState<{ [id: string]: string }>({});

  // Review completed submission modal state
  const [reviewingSubmission, setReviewingSubmission] = useState<{ assignment: Assignment; submission: Submission } | null>(null);

  if (!childStudent) {
    return (
      <div className="bg-white rounded-3xl p-8 text-center border font-sans">
        <p className="text-slate-500 font-bold">Không tìm thấy thông tin bé liên kết với tài khoản phụ huynh.</p>
      </div>
    );
  }

  // Attendance stats for child
  const childAttendance = attendanceList.filter(a => a.studentId === childStudent.id);
  const absentDaysCount = childAttendance.filter(a => a.isAbsent).length;

  // Active violations that are unresolved
  const activeViolations = violations.filter(v => v.studentId === childStudent.id && !v.isResolved);
  const resolvedViolations = violations.filter(v => v.studentId === childStudent.id && v.isResolved);

  // Get list of weeks & subjects of existing assignments
  const weeks = Array.from(new Set(assignments.map(a => a.week || 1))).sort((a: number, b: number) => a - b);
  const subjects = ['Tất cả', ...Array.from(new Set(assignments.map(a => a.subject)))];

  // Incomplete list
  const incompleteAssignments = assignments.filter(as => {
    const sub = submissions.find(s => s.assignmentId === as.id && s.studentId === childStudent.id);
    return !sub || sub.status !== 'submitted';
  });

  // Completed list
  const completedAssignments = assignments.filter(as => {
    const sub = submissions.find(s => s.assignmentId === as.id && s.studentId === childStudent.id);
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

  // Send feedback to teacher
  const handleSendFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackMsg.trim()) return;
    audioSynth.playSuccess();
    addFeedback({
      parentId: currentUser.id,
      studentId: childStudent.id,
      message: feedbackMsg.trim(),
      isDraft: false
    });
    setFeedbackMsg('');
    alert('Đã gửi ý kiến phản hồi đến cô giáo chủ nhiệm lớp 3A thành công!');
  };

  // Save Feedback Draft
  const handleSaveDraftFeedback = () => {
    if (!feedbackMsg.trim()) return;
    audioSynth.playBubblePop();
    setFeedbackDraft(feedbackMsg.trim());
    alert('Đã lưu nháp ý kiến trao đổi thành công!');
  };

  // Apply draft back
  const handleApplyDraft = () => {
    if (!feedbackDraft) return;
    audioSynth.playBubblePop();
    setFeedbackMsg(feedbackDraft);
    setFeedbackDraft('');
  };

  // Resolve active violation
  const handleResolveViolation = (violationId: string) => {
    audioSynth.playSuccess();
    const response = violationResponses[violationId] || 'Gia đình đã nắm thông tin và sẽ phối hợp nhắc nhở con ạ.';
    resolveViolation(violationId, response);
    
    // Clear response text
    setViolationResponses(prev => {
      const copy = { ...prev };
      delete copy[violationId];
      return copy;
    });
    alert('Đã phản hồi ý kiến nhắc nhở của giáo viên thành công! Thông báo sẽ tự ẩn chuyển thành Đã giải quyết.');
  };

  // Mark parent verified and reminded student
  const handleConfirmAndRemind = (asId: string) => {
    audioSynth.playStarChime();
    markParentChecked(asId, childStudent.id);
    alert('✓ Đã xác nhận ba mẹ đã xem bài tập này và nhắc nhở bé tự giác làm bài tập về nhà!');
  };

  // Simulated image download for parent viewing
  const handleDownloadImage = (imgUrl: string) => {
    audioSynth.playBubblePop();
    alert('Đang tải hình ảnh bài học của con về máy tính/điện thoại... 📥');
  };

  return (
    <div className="space-y-6 font-sans bg-emerald-50/25 p-1 sm:p-4 rounded-3xl transition-all duration-300">
      
      {/* 1. TOP WELCOME PANEL FOR PARENT */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center space-x-4">
          <span className="text-4xl p-3 bg-emerald-50 rounded-2xl shadow-inner">🏡</span>
          <div>
            <h2 className="text-lg md:text-xl font-black text-slate-800 tracking-tight">
              Cổng Liên Lạc Phụ Huynh: {currentUser.name}
            </h2>
            <p className="text-xs text-slate-400 font-bold mt-1 uppercase tracking-wider">
              Phụ huynh em: <span className="text-emerald-600 font-black">{childStudent.name}</span> (Lớp 3A | GVCN: Cô Mai Anh)
            </p>
          </div>
        </div>

        {/* Display Child Achievements */}
        <div className="flex items-center space-x-3 text-xs font-extrabold text-slate-600 bg-slate-50 border border-slate-150 px-4 py-3 rounded-2xl">
          <span className="flex items-center gap-1">⭐ {childStudent.stars} Sao</span>
          <span className="h-3 w-[1px] bg-slate-300" />
          <span className="flex items-center gap-1">🚩 {childStudent.flags} Cờ</span>
          <span className="h-3 w-[1px] bg-slate-300" />
          <span className="flex items-center gap-1">🏆 {childStudent.goldCards} Thẻ</span>
          <span className="h-3 w-[1px] bg-slate-300" />
          <span className="text-amber-600 font-black">Hạng #{childStudent.rank} Lớp</span>
        </div>
      </div>

      {/* 2. KHUNG LIÊN KẾT ỨNG DỤNG & TRANG HỌC TẬP ĐIỆN TỬ (Collapsible, starts collapsed) */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <button
          onClick={() => {
            audioSynth.playBubblePop();
            setIsLinksCollapsed(!isLinksCollapsed);
          }}
          className="w-full p-4.5 bg-slate-50 flex items-center justify-between font-black text-slate-800 text-sm md:text-base cursor-pointer hover:bg-slate-100 transition"
        >
          <div className="flex items-center space-x-2.5">
            <span className="p-1.5 bg-blue-500 rounded-xl text-white text-xs">🌐</span>
            <span>LIÊN KẾT ỨNG DỤNG & TRANG HỌC TẬP ĐIỆN TỬ CHO BÉ</span>
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

      {/* 3. KHU NHIỆM VỤ ĐƯỢC GIAO (BẢNG QUẢN LÝ TÀI KHOẢN PHỤ HUYNH - Collapsible, starts open) */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <button
          onClick={() => {
            audioSynth.playBubblePop();
            setIsZoneCollapsed(!isZoneCollapsed);
          }}
          className="w-full p-4.5 bg-slate-50 flex items-center justify-between font-black text-slate-800 text-sm md:text-base cursor-pointer hover:bg-slate-100 transition"
        >
          <div className="flex items-center space-x-2.5">
            <span className="p-1.5 bg-teal-500 rounded-xl text-white text-xs">🎒</span>
            <span>KHU NHIỆM VỤ ĐƯỢC GIAO (Giám sát của phụ huynh)</span>
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
                📝 Giám sát bài tập về nhà
              </button>
              <button
                onClick={() => { audioSynth.playBubblePop(); setActiveTab('progress'); }}
                className={`py-2 px-4 text-xs font-black rounded-t-xl transition whitespace-nowrap cursor-pointer ${
                  activeTab === 'progress'
                    ? 'border-b-4 border-amber-500 text-amber-600 bg-amber-50/40'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                📊 Chuyên cần & Nhắc nhở
              </button>
              <button
                onClick={() => { audioSynth.playBubblePop(); setActiveTab('settings'); }}
                className={`py-2 px-4 text-xs font-black rounded-t-xl transition whitespace-nowrap cursor-pointer ${
                  activeTab === 'settings'
                    ? 'border-b-4 border-indigo-500 text-indigo-600 bg-indigo-50/40'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                ✉️ Liên hệ cô giáo & Đổi mật khẩu
              </button>
            </div>

            {/* TAB 1: GIÁM SÁT BÀI TẬP VỀ NHÀ */}
            {activeTab === 'tasks' && (
              <div className="space-y-6">
                
                {/* Subject & Week Filters */}
                <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-slate-100/50 p-4 rounded-2xl border border-slate-200/50">
                  {/* Select learning week */}
                  <div className="flex items-center space-x-2 w-full sm:w-auto">
                    <span className="text-[11px] font-black text-slate-500 whitespace-nowrap uppercase font-sans">Bài tập tuần:</span>
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
                    <span className="text-[11px] font-black text-slate-500 uppercase">Môn:</span>
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
                <div className="flex gap-2 font-sans">
                  <button
                    onClick={() => setTasksSubTab('incomplete')}
                    className={`flex-1 py-2 rounded-xl text-xs font-extrabold transition-all border flex items-center justify-center space-x-1 cursor-pointer ${
                      tasksSubTab === 'incomplete'
                        ? 'bg-rose-500 text-white border-rose-600 shadow-sm'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-150'
                    }`}
                  >
                    <span>🎒 Bé chưa làm ({currentIncomplete.length})</span>
                  </button>
                  <button
                    onClick={() => setTasksSubTab('completed')}
                    className={`flex-1 py-2 rounded-xl text-xs font-extrabold transition-all border flex items-center justify-center space-x-1 cursor-pointer ${
                      tasksSubTab === 'completed'
                        ? 'bg-emerald-500 text-white border-emerald-600 shadow-sm'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-150'
                    }`}
                  >
                    <span>✓ Bé đã hoàn thành ({currentCompleted.length})</span>
                  </button>
                </div>

                {/* Assignments render list */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* INCOMPLETE SECTION */}
                  {tasksSubTab === 'incomplete' && (
                    <div className="col-span-2 space-y-3.5 text-left">
                      {currentIncomplete.length === 0 ? (
                        <div className="text-center p-12 bg-white rounded-3xl border border-slate-100 text-slate-400 font-bold italic space-y-2">
                          <p className="text-3xl">🎉</p>
                          <p className="text-xs">Bé đã hoàn thành toàn bộ bài tập về nhà rồi! Ba mẹ khen ngợi bé tự giác nhé ạ!</p>
                        </div>
                      ) : (
                        currentIncomplete.map((as) => {
                          const hasParentChecked = parentCheckedAssignments?.[`${as.id}_${childStudent.id}`];
                          return (
                            <div key={as.id} className="p-5 bg-white border border-slate-100 rounded-3xl space-y-4 shadow-xs">
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
                                  ⭐ Trị giá: +{as.rewardStars} Sao
                                </span>
                              </div>

                              <div className="space-y-1.5">
                                <h4 className="font-extrabold text-slate-800 text-sm md:text-base">{as.title}</h4>
                                <p className="text-xs text-slate-500 font-medium leading-relaxed">{as.description}</p>
                              </div>

                              {/* Support parent preview of links & attachments */}
                              {(as.links && as.links.length > 0 || as.attachments && as.attachments.length > 0) && (
                                <div className="p-3 bg-slate-50 border border-slate-150/70 rounded-2xl space-y-2.5 text-xs">
                                  <span className="block text-[10px] font-black text-slate-500 uppercase tracking-wider">Xem tệp học liệu của con:</span>
                                  
                                  {as.attachments?.map((f, i) => (
                                    <div key={i} className="flex items-center justify-between text-xs bg-white p-2 rounded-xl border border-slate-200">
                                      <span className="truncate max-w-[250px] font-semibold text-slate-700">📄 {f.name}</span>
                                      <button
                                        type="button"
                                        onClick={() => handleDownloadImage(f.name)}
                                        className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded font-bold transition flex items-center gap-1 cursor-pointer border"
                                      >
                                        <Download className="h-3 w-3 text-sky-500" />
                                        <span>Tải về 📥</span>
                                      </button>
                                    </div>
                                  ))}

                                  {as.links?.map((link, i) => (
                                    <div key={i} className="flex items-center justify-between text-xs bg-white p-2 rounded-xl border border-slate-200">
                                      <span className="truncate max-w-[250px] font-semibold text-sky-700">🔗 Link: {link.title}</span>
                                      <a
                                        href={link.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-[10px] bg-amber-50 text-amber-700 font-bold px-2.5 py-1 rounded border border-amber-200 hover:bg-amber-100 flex items-center gap-1"
                                      >
                                        <span>Mở 📺</span>
                                      </a>
                                    </div>
                                  ))}
                                </div>
                              )}

                              {/* MARK VIEWED AND REMIND BUTTON FOR PARENTS */}
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100">
                                {hasParentChecked ? (
                                  <div className="p-2 bg-emerald-50 text-emerald-800 rounded-xl text-[11px] font-bold border border-emerald-200 flex items-center gap-1.5">
                                    <Check className="h-4 w-4 text-emerald-600" />
                                    <span>Ba mẹ đã xác nhận & nhắc bé học bài lúc: {new Date(hasParentChecked).toLocaleTimeString('vi-VN')}</span>
                                  </div>
                                ) : (
                                  <div className="text-[11px] text-rose-500 font-bold italic">
                                    * Con chưa làm bài này. Ba mẹ vui lòng nhắc nhở bé nhé!
                                  </div>
                                )}

                                {!hasParentChecked && (
                                  <button
                                    onClick={() => handleConfirmAndRemind(as.id)}
                                    className="px-4 py-2 bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-black text-xs rounded-xl hover:from-teal-600 hover:to-emerald-600 flex items-center justify-center space-x-1.5 shadow-sm cursor-pointer"
                                  >
                                    <CheckCircle className="h-4 w-4" />
                                    <span>Đã xem & Nhắc nhở bé học bài 🔔</span>
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}

                  {/* COMPLETED SECTION */}
                  {tasksSubTab === 'completed' && (
                    <div className="col-span-2 space-y-3.5 text-left">
                      {currentCompleted.length === 0 ? (
                        <div className="text-center p-12 bg-white rounded-3xl border border-slate-100 text-slate-400 font-bold italic">
                          Chưa có bài tập nào của con được nộp hoàn thành của học tuần đã chọn.
                        </div>
                      ) : (
                        currentCompleted.map((as) => {
                          const sub = submissions.find(s => s.assignmentId === as.id && s.studentId === childStudent.id);
                          if (!sub) return null;

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
                                  Đạt: {sub.score} / {as.rewardStars} Sao ⭐
                                </span>
                              </div>

                              <div className="space-y-1">
                                <h4 className="font-extrabold text-slate-800 text-sm md:text-base">{as.title}</h4>
                                <p className="text-[10px] text-slate-400 font-bold font-mono uppercase">
                                  Bé nộp bài lúc: {new Date(sub.submittedAt).toLocaleString('vi-VN')}
                                </p>
                              </div>

                              {/* Teacher feedback view if present */}
                              {sub.feedbackMessage && (
                                <div className="p-3 bg-teal-50 border border-teal-150 rounded-2xl text-xs space-y-1 text-slate-600">
                                  <span className="font-black text-teal-800 block">💬 Đánh giá nhận xét của Cô giáo:</span>
                                  <p className="italic font-bold">"{sub.feedbackMessage}"</p>
                                </div>
                              )}

                              <div className="flex justify-end pt-2 border-t border-slate-100">
                                <button
                                  onClick={() => setReviewingSubmission({ assignment: as, submission: sub })}
                                  className="px-4 py-2 bg-white hover:bg-slate-50 text-sky-700 font-black text-xs rounded-xl border border-slate-200 flex items-center gap-1 cursor-pointer transition shadow-xs"
                                >
                                  <BookMarked className="h-3.5 w-3.5 text-sky-500" />
                                  <span>Xem lại bài làm của con 👁️</span>
                                </button>
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

            {/* TAB 2: CHUYÊN CẦN & NHẮC NHỞ */}
            {activeTab === 'progress' && (
              <div className="space-y-6 animate-fadeIn text-left">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Attendance card */}
                  <div className="bg-white rounded-3xl p-5 border border-slate-150 space-y-4">
                    <h4 className="text-sm font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5 border-b pb-2">
                      <Clock className="h-4 w-4 text-emerald-500" />
                      <span>Theo dõi chuyên cần của con</span>
                    </h4>

                    <div className="space-y-3 text-xs">
                      <div className="p-3 bg-slate-50 rounded-2xl flex items-center justify-between font-bold">
                        <span>Số buổi nghỉ học:</span>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs ${
                          absentDaysCount > 0 ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
                        }`}>
                          {absentDaysCount} buổi nghỉ học
                        </span>
                      </div>

                      {childAttendance.length === 0 ? (
                        <p className="text-center text-slate-400 italic py-6 font-medium">Bé đi học đầy đủ hăng hái, không vắng buổi nào! 🌟</p>
                      ) : (
                        <div className="space-y-2">
                          <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider block">Chi tiết ngày nghỉ học:</span>
                          <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-1">
                            {childAttendance.map((att, idx) => (
                              <div key={idx} className="flex items-center justify-between bg-rose-50 border border-rose-100 text-rose-800 p-2 rounded-xl font-medium">
                                <span>Ngày vắng: {new Date(att.date).toLocaleDateString('vi-VN')}</span>
                                <span className="text-[11px] bg-white px-2 py-0.5 rounded border font-bold text-rose-700">{att.notes || 'Không phép'}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Violations reminders from teacher */}
                  <div className="bg-white rounded-3xl p-5 border border-slate-150 space-y-4">
                    <h4 className="text-sm font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5 border-b pb-2">
                      <AlertTriangle className="h-4 w-4 text-rose-500" />
                      <span>Ý kiến nhắc nhở của giáo viên ({activeViolations.length})</span>
                    </h4>

                    <div className="space-y-3.5 text-xs">
                      {activeViolations.length === 0 && resolvedViolations.length === 0 && (
                        <p className="text-center text-slate-400 italic py-6 font-medium">Lớp học hạnh phúc! Con không có nhắc nhở kỷ luật nào từ giáo viên.</p>
                      )}

                      {/* Active warnings */}
                      {activeViolations.map((v) => (
                        <div key={v.id} className="p-4 bg-rose-50/50 border border-rose-150 rounded-2xl space-y-3">
                          <div>
                            <span className="text-[10px] font-black text-rose-600 uppercase block">Nhắc nhở: {v.violationType}</span>
                            <p className="font-semibold text-slate-700 italic mt-0.5">"{v.message}"</p>
                          </div>

                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase block">Nhập phản hồi trao đổi của gia đình *</label>
                            <input
                              type="text"
                              placeholder="vd: Gia đình đã nắm thông tin và phối hợp kèm thêm con đọc bài ở nhà ạ..."
                              value={violationResponses[v.id] || ''}
                              onChange={e => setViolationResponses(prev => ({ ...prev, [v.id]: e.target.value }))}
                              className="w-full text-xs p-2 rounded-xl bg-white border border-slate-200 focus:outline-none focus:border-rose-400 font-medium"
                            />
                            <button
                              onClick={() => handleResolveViolation(v.id)}
                              className="w-full py-1.5 bg-rose-500 hover:bg-rose-600 text-white font-extrabold rounded-xl transition cursor-pointer text-xs"
                            >
                              Gửi Xác Nhận Đã Xem & Phối Hợp
                            </button>
                          </div>
                        </div>
                      ))}

                      {/* Resolved warnings logs */}
                      {resolvedViolations.length > 0 && (
                        <div className="space-y-2 pt-2 border-t">
                          <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider block">Lịch sử nhắc nhở đã phản hồi:</span>
                          <div className="space-y-2 max-h-[120px] overflow-y-auto pr-1">
                            {resolvedViolations.map((v) => (
                              <div key={v.id} className="p-3 bg-slate-50 border rounded-xl space-y-1.5 text-slate-500">
                                <div className="flex justify-between items-center text-[10px] font-bold">
                                  <span className="line-through">{v.violationType}</span>
                                  <span className="text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">Đã giải quyết ✓</span>
                                </div>
                                <p className="italic text-[11px]">GV nhắc: "{v.message}"</p>
                                <p className="text-[10px] text-indigo-700 font-semibold">Ba mẹ phản hồi: "{v.parentResponse}"</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                </div>

              </div>
            )}

            {/* TAB 3: LIÊN HỆ CÔ GIÁO & ĐỔI MẬT KHẨU */}
            {activeTab === 'settings' && (
              <div className="space-y-6 animate-fadeIn text-left">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Direct messaging feedback form */}
                  <div className="bg-white rounded-3xl p-5 border border-slate-150 space-y-4">
                    <h4 className="text-sm font-black text-slate-700 uppercase tracking-wider border-b pb-2 flex items-center gap-1.5">
                      <Mail className="h-4.5 w-4.5 text-indigo-500" />
                      <span>Ý kiến đóng góp & trao đổi với cô giáo</span>
                    </h4>

                    <form onSubmit={handleSendFeedback} className="space-y-3.5">
                      <textarea
                        required
                        rows={4}
                        placeholder="Nhập nội dung ba mẹ muốn đóng góp ý kiến hoặc báo cáo tình hình học tập rèn nét chữ của con ở nhà..."
                        value={feedbackMsg}
                        onChange={e => setFeedbackMsg(e.target.value)}
                        className="w-full text-xs p-3 rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-indigo-400 font-medium leading-relaxed text-slate-800 shadow-inner"
                      />

                      <div className="flex items-center justify-between gap-2 text-xs">
                        {feedbackDraft ? (
                          <button
                            type="button"
                            onClick={handleApplyDraft}
                            className="text-[10px] text-amber-600 font-bold bg-amber-50 px-2 py-1 rounded"
                          >
                            Dùng bản nháp đã lưu 📝
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={handleSaveDraftFeedback}
                            className="text-[10px] text-slate-400 hover:text-slate-600 font-bold"
                          >
                            Lưu nháp thư nháp
                          </button>
                        )}
                        
                        <button
                          type="submit"
                          className="px-5 py-2 bg-indigo-500 text-white font-black rounded-xl hover:bg-indigo-600 flex items-center space-x-1 cursor-pointer shadow-md shadow-indigo-500/20"
                        >
                          <Send className="h-3.5 w-3.5" />
                          <span>Gửi Phản Hồi</span>
                        </button>
                      </div>
                    </form>

                    {/* Feedback history */}
                    <div className="border-t pt-3 space-y-3 max-h-[160px] overflow-y-auto pr-1">
                      <span className="block text-[10px] text-slate-400 font-black uppercase">Nhật ký trao đổi:</span>
                      
                      {feedbacks.filter(fb => fb.parentId === currentUser.id).length === 0 ? (
                        <p className="text-center text-slate-400 italic py-4 text-xs">Chưa có ý kiến nào được gửi đi.</p>
                      ) : (
                        feedbacks
                          .filter(fb => fb.parentId === currentUser.id)
                          .map((fb) => (
                            <div key={fb.id} className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-1.5 text-xs text-slate-600">
                              <p className="font-semibold">"{fb.message}"</p>
                              
                              {fb.reply ? (
                                <div className="bg-emerald-50 border border-emerald-150 p-2.5 rounded-lg text-xs space-y-0.5 text-slate-600">
                                  <span className="font-black text-emerald-700 block text-[10px]">Cô Mai Anh phản hồi:</span>
                                  <p className="italic">"{fb.reply}"</p>
                                </div>
                              ) : (
                                <div className="flex justify-between items-center">
                                  <span className="text-[9px] font-black text-slate-400 uppercase bg-slate-100 px-1.5 py-0.5 rounded block">Chờ phản hồi...</span>
                                  {fb.isRead && <span className="text-[10px] text-emerald-600 font-bold">✓ GV đã xem</span>}
                                </div>
                              )}
                              <span className="block text-[9px] text-slate-400 text-right font-mono">{new Date(fb.createdAt).toLocaleDateString()}</span>
                            </div>
                          ))
                      )}
                    </div>
                  </div>

                  {/* Password section */}
                  <div className="bg-white rounded-3xl p-5 border border-slate-150 space-y-4">
                    <h4 className="text-sm font-black text-slate-700 uppercase tracking-wider border-b pb-2 flex items-center gap-1.5">
                      <User className="h-4.5 w-4.5 text-indigo-500" />
                      <span>🔑 Đổi mật khẩu đăng nhập phụ huynh</span>
                    </h4>

                    {settings.allowChangePassword ? (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between text-xs text-slate-500 font-bold">
                          <span>Mật khẩu phụ huynh hiện dùng:</span>
                          <span className="font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg font-bold">
                            {childStudent.parentPassword || settings.defaultPassword || '123'}
                          </span>
                        </div>
                        
                        <button
                          onClick={() => {
                            audioSynth.playBubblePop();
                            setShowPasswordChange(!showPasswordChange);
                            setPassErrorMsg('');
                            setPassSuccessMsg('');
                          }}
                          className="text-xs font-black text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-2 rounded-xl transition-all cursor-pointer block text-center w-full"
                        >
                          {showPasswordChange ? '✕ Đóng bảng đổi mật khẩu' : '✏️ Nhấn để thay đổi mật khẩu phụ huynh'}
                        </button>

                        {showPasswordChange && (
                          <form
                            onSubmit={(e) => {
                              e.preventDefault();
                              setPassErrorMsg('');
                              setPassSuccessMsg('');
                              if (!newParentPass.trim()) {
                                setPassErrorMsg('Vui lòng nhập mật khẩu mới!');
                                return;
                              }
                              if (newParentPass.trim().length < 3) {
                                setPassErrorMsg('Mật khẩu tối thiểu 3 ký tự!');
                                return;
                              }
                              if (newParentPass.trim() !== confirmParentPass.trim()) {
                                setPassErrorMsg('Mật khẩu gõ lại không trùng khớp!');
                                return;
                              }
                              updateStudent(childStudent.id, { parentPassword: newParentPass.trim() });
                              audioSynth.playSuccess();
                              setPassSuccessMsg('Đổi mật khẩu thành công! Mật khẩu mới là: ' + newParentPass.trim() + ' 🌟');
                              setNewParentPass('');
                              setConfirmParentPass('');
                            }}
                            className="p-4 bg-slate-50 border border-slate-150 rounded-2xl space-y-3 animate-fadeIn text-xs text-left"
                          >
                            <div>
                              <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Mật khẩu phụ huynh mới *</label>
                              <input
                                type="password"
                                required
                                placeholder="vd: phan456"
                                value={newParentPass}
                                onChange={e => setNewParentPass(e.target.value)}
                                className="w-full p-2 rounded-lg border border-slate-200 bg-white font-bold"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Xác nhận mật khẩu mới *</label>
                              <input
                                type="password"
                                required
                                placeholder="vd: phan456"
                                value={confirmParentPass}
                                onChange={e => setConfirmParentPass(e.target.value)}
                                className="w-full p-2 rounded-lg border border-slate-200 bg-white font-bold"
                              />
                            </div>

                            {passErrorMsg && <div className="text-xs text-rose-600 font-extrabold">⚠️ {passErrorMsg}</div>}
                            {passSuccessMsg && <div className="text-xs text-emerald-600 font-extrabold">✅ {passSuccessMsg}</div>}

                            <button
                              type="submit"
                              className="w-full py-2 bg-indigo-500 hover:bg-indigo-600 text-white font-black uppercase text-[10px] tracking-wider rounded-xl cursor-pointer shadow-sm transition"
                            >
                              Cập Nhật Mật Khẩu 💾
                            </button>
                          </form>
                        )}
                      </div>
                    ) : (
                      <p className="text-[11px] text-slate-400 font-bold italic leading-relaxed">
                        * Tính năng tự đổi mật khẩu đang bị khóa ở Cài đặt lớp học. Phụ huynh vui lòng liên hệ cô giáo nếu muốn đổi ạ.
                      </p>
                    )}
                  </div>

                </div>

              </div>
            )}

          </div>
        )}
      </div>

      {/* 4. REVIEW COMPLETED SUBMISSION MODAL */}
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
              className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-4 md:p-6 border-4 border-emerald-400 space-y-5 my-8 text-left font-sans"
            >
              <div className="flex items-center justify-between border-b pb-3 flex-wrap gap-2">
                <div>
                  <span className="text-[10px] font-extrabold text-emerald-600 uppercase tracking-wider block">Báo cáo kết quả bài tập của bé</span>
                  <h3 className="text-base md:text-lg font-black text-slate-800">{reviewingSubmission.assignment.title}</h3>
                </div>
                <button
                  onClick={() => setReviewingSubmission(null)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-bold text-slate-500 cursor-pointer"
                >
                  ✕ Đóng bảng
                </button>
              </div>

              {/* Status statistics */}
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 grid grid-cols-2 sm:grid-cols-3 gap-3 text-center">
                <div className="space-y-0.5">
                  <span className="text-[10px] text-slate-400 block font-bold uppercase">Điểm sao đạt</span>
                  <span className="text-lg font-black text-emerald-700">⭐ {reviewingSubmission.submission.score} Sao</span>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[10px] text-slate-400 block font-bold uppercase">Kết quả làm câu</span>
                  <span className="text-lg font-black text-slate-700">
                    🎯 {reviewingSubmission.submission.correctCount} / {reviewingSubmission.submission.totalQuestions} Đúng
                  </span>
                </div>
                <div className="space-y-0.5 col-span-2 sm:col-span-1">
                  <span className="text-[10px] text-slate-400 block font-bold uppercase">Số lần thử sức</span>
                  <span className="text-lg font-black text-indigo-700">Lần {reviewingSubmission.submission.attemptsCount || 1}</span>
                </div>
              </div>

              {/* Detail answer results */}
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
                    isCorrect = true; // Essay graded manually
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
                            <p>Bé đã chọn: <span className="font-mono font-black text-indigo-600 bg-white px-2 py-0.5 rounded border">{sAns || 'Không làm'}</span></p>
                            <p>Đáp án đúng: <span className="font-mono font-black text-emerald-600 bg-white px-2 py-0.5 rounded border">{q.correctAnswer}</span></p>
                          </div>
                        )}

                        {q.type === 'true_false' && (
                          <div className="space-y-1 bg-white p-2.5 rounded-xl border">
                            {q.trueFalseOptions?.map((opt, oIdx) => (
                              <div key={oIdx} className="flex justify-between border-b last:border-0 pb-1 pt-1">
                                <span>{opt.text}</span>
                                <span className="font-bold">
                                  Bé chọn: {sAns?.[opt.text] === true ? 'Đúng' : sAns?.[opt.text] === false ? 'Sai' : 'Chưa chọn'} 
                                  (Đáp án đúng: {opt.correct ? 'Đúng' : 'Sai'})
                                </span>
                              </div>
                            ))}
                          </div>
                        )}

                        {q.type === 'matching' && sAns && (
                          <div className="space-y-1.5 bg-white p-2.5 rounded-xl border">
                            <span className="block font-black text-slate-500 uppercase text-[9px]">Các cặp bé đã nối:</span>
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
                            <span className="block font-black text-slate-500 uppercase text-[9px] mb-1">Bé đã điền:</span>
                            {q.blankAnswers?.map((correct, i) => (
                              <p key={i}>Ô #{i + 1}: <span className="font-bold text-indigo-600">{sAns?.[i] || 'Chưa điền'}</span> (Đáp án: <span className="text-emerald-600">{correct}</span>)</p>
                            ))}
                          </div>
                        )}

                        {q.type === 'essay' && (
                          <div className="space-y-2.5">
                            <div className="bg-white p-3 rounded-xl border italic font-medium text-slate-700">
                              "{typeof sAns === 'string' ? sAns : sAns?.text || 'Không gõ chữ'}"
                            </div>

                            {/* Render uploaded images */}
                            {sAns && Array.isArray(sAns.images) && sAns.images.length > 0 && (
                              <div className="space-y-1">
                                <span className="block text-[9px] text-slate-400 font-bold uppercase">Ảnh chụp vở viết con đã gửi lên:</span>
                                <div className="flex flex-wrap gap-1.5">
                                  {sAns.images.map((img: string, iIndex: number) => (
                                    <div key={iIndex} className="relative group">
                                      <img
                                        src={img}
                                        alt="work-img"
                                        className="h-14 w-auto max-w-[120px] object-cover rounded-lg border bg-white p-0.5"
                                      />
                                      {/* Download button for parent to save children's writing */}
                                      <button
                                        type="button"
                                        onClick={() => handleDownloadImage(img)}
                                        className="absolute inset-0 bg-slate-900/50 flex items-center justify-center text-[8px] font-bold text-white rounded-lg opacity-0 group-hover:opacity-100 transition cursor-pointer"
                                      >
                                        Lưu ảnh 💾
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Teacher Comments */}
              {reviewingSubmission.submission.feedbackMessage && (
                <div className="p-4 bg-teal-50 border border-teal-100 rounded-2xl text-xs space-y-1.5">
                  <span className="font-black text-teal-800 block uppercase tracking-wider text-[10px]">💬 Đánh giá nhận xét của Cô giáo:</span>
                  <p className="italic font-bold text-slate-700">"{reviewingSubmission.submission.feedbackMessage}"</p>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};
