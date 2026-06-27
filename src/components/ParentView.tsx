/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useLMS } from '../context/LMSContext';
import { motion } from 'motion/react';
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
  User
} from 'lucide-react';

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
    addFeedback
  } = useLMS();

  // Find linked student
  const childStudent = students.find(s => s.id === currentUser.studentId);

  // Parent Feedback States
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const [feedbackDraft, setFeedbackDraft] = useState('');

  // Handle reminder verification (parent response)
  const [violationResponses, setViolationResponses] = useState<{ [id: string]: string }>({});

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

  // Incomplete assignments for child
  const incompleteCount = assignments.filter(as => {
    const sub = submissions.find(s => s.assignmentId === as.id && s.studentId === childStudent.id);
    return !sub || sub.status !== 'submitted';
  }).length;

  // Send feedback
  const handleSendFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackMsg.trim()) return;
    addFeedback({
      parentId: currentUser.id,
      studentId: childStudent.id,
      message: feedbackMsg.trim(),
      isDraft: false
    });
    setFeedbackMsg('');
    alert('Đã gửi ý kiến phản hồi đến cô giáo chủ nhiệm thành công!');
  };

  // Save Feedback Draft
  const handleSaveDraftFeedback = () => {
    if (!feedbackMsg.trim()) return;
    setFeedbackDraft(feedbackMsg.trim());
    alert('Đã lưu nháp ý kiến thành công!');
  };

  // Apply draft back
  const handleApplyDraft = () => {
    if (!feedbackDraft) return;
    setFeedbackMsg(feedbackDraft);
    setFeedbackDraft('');
  };

  // Resolve active violation
  const handleResolveViolation = (violationId: string) => {
    const response = violationResponses[violationId] || 'Gia đình đã nắm thông tin và sẽ nhắc nhở con ạ.';
    resolveViolation(violationId, response);
    // Clear response box
    setViolationResponses(prev => {
      const copy = { ...prev };
      delete copy[violationId];
      return copy;
    });
    alert('Đã phản hồi ý kiến nhắc nhở thành công! Thông báo sẽ tự ẩn khỏi danh sách.');
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* Top Welcome Panel for parent */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center space-x-4">
          <span className="text-4xl p-3 bg-emerald-50 rounded-2xl">🏡</span>
          <div>
            <h2 className="text-lg md:text-xl font-bold text-slate-800">
              Cổng liên lạc: {currentUser.name}
            </h2>
            <p className="text-xs text-slate-400 font-bold mt-0.5">Phụ huynh em: <span className="text-emerald-600">{childStudent.name}</span> (Lớp 3A)</p>
          </div>
        </div>

        {/* Display Badges */}
        <div className="flex items-center space-x-3 text-xs font-bold text-slate-600 bg-slate-50 border border-slate-150 px-4 py-2.5 rounded-2xl">
          <span className="flex items-center gap-1">⭐ {childStudent.stars} Sao</span>
          <span className="h-3 w-[1px] bg-slate-300" />
          <span className="flex items-center gap-1">🚩 {childStudent.flags} Cờ</span>
          <span className="h-3 w-[1px] bg-slate-300" />
          <span className="flex items-center gap-1">🏆 {childStudent.goldCards} Thẻ vàng</span>
          <span className="h-3 w-[1px] bg-slate-300" />
          <span className="text-amber-600">Hạng {childStudent.rank} lớp</span>
        </div>
      </div>

      {/* Main Grid layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Column 1: Progress statistics and attendance */}
        <div className="space-y-6">
          {/* Child stats summary card */}
          <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-800 flex items-center space-x-2">
              <span className="p-1 bg-emerald-50 rounded text-emerald-500"><ClipboardList className="h-4 w-4" /></span>
              <span>Theo dõi tiến học tập</span>
            </h3>

            <div className="space-y-3 font-sans">
              <div className="p-3 bg-slate-50 rounded-xl flex items-center justify-between">
                <span className="text-xs text-slate-500 font-semibold">Bài tập chưa xong:</span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                  incompleteCount > 0 ? 'bg-rose-100 text-rose-600 animate-pulse' : 'bg-emerald-100 text-emerald-600'
                }`}>
                  {incompleteCount} nhiệm vụ
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl flex items-center justify-between">
                <span className="text-xs text-slate-500 font-semibold">Tổng số ngày nghỉ học:</span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                  absentDaysCount > 0 ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'
                }`}>
                  vắng {absentDaysCount} buổi
                </span>
              </div>

              {childAttendance.length > 0 && (
                <div className="border-t border-slate-100 pt-2.5">
                  <span className="block text-[10px] text-slate-400 font-bold uppercase mb-1.5">Lịch sử nghỉ học:</span>
                  <div className="space-y-1 max-h-24 overflow-y-auto pr-1">
                    {childAttendance.map((att, idx) => (
                      <div key={idx} className="flex items-center justify-between text-[11px] bg-rose-50/50 p-1.5 rounded border border-rose-100 text-rose-700 font-medium">
                        <span>Nghỉ ngày: {new Date(att.date).toLocaleDateString()}</span>
                        <span>{att.notes || 'Không phép'}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Core active reminders (Violations alerts) */}
          <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-800 flex items-center space-x-2">
              <span className="p-1 bg-rose-50 rounded text-rose-500"><AlertTriangle className="h-4 w-4" /></span>
              <span>Nhắc nhở chưa xem ({activeViolations.length})</span>
            </h3>

            <div className="space-y-3 font-sans">
              {activeViolations.length === 0 ? (
                <p className="text-center text-slate-400 text-xs py-6">Tuyệt vời! Bé không có nhắc nhở nào chưa phản hồi.</p>
              ) : (
                activeViolations.map((v) => (
                  <div key={v.id} className="p-3.5 bg-rose-50/30 border border-rose-100 rounded-2xl space-y-2">
                    <span className="text-[11px] font-bold text-rose-600 block uppercase">Vi phạm: {v.violationType}</span>
                    <p className="text-xs text-slate-600 italic leading-relaxed">"{v.message}"</p>
                    
                    <div className="space-y-1.5 pt-1">
                      <input
                        type="text"
                        placeholder="Nhập lời nhắn phản hồi của ba mẹ..."
                        value={violationResponses[v.id] || ''}
                        onChange={e => setViolationResponses(prev => ({ ...prev, [v.id]: e.target.value }))}
                        className="w-full text-xs p-2 rounded-lg bg-white border border-slate-200 focus:outline-none focus:border-rose-400"
                      />
                      <button
                        onClick={() => handleResolveViolation(v.id)}
                        className="w-full py-1.5 bg-rose-500 text-white text-xs font-bold rounded-lg hover:bg-rose-600 cursor-pointer"
                      >
                        Đã Xem & Gửi Phản Hồi
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Column 2: Incomplete vs completed assignment overview for child */}
        <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-800 flex items-center space-x-2">
            <span className="p-1 bg-sky-50 rounded text-sky-500"><BookOpen className="h-4 w-4" /></span>
            <span>Nhiệm vụ chưa làm</span>
          </h3>

          <div className="space-y-3">
            {assignments
              .filter(as => {
                const sub = submissions.find(s => s.assignmentId === as.id && s.studentId === childStudent.id);
                return !sub || sub.status !== 'submitted';
              })
              .map((as) => (
                <div key={as.id} className="p-3 bg-slate-50 border border-slate-100 rounded-2xl space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sky-600 uppercase text-[10px] bg-white px-2 py-0.5 rounded border border-sky-100">{as.subject}</span>
                    <span className="text-[10px] text-amber-600 font-bold">⭐ +{as.rewardStars} Sao</span>
                  </div>
                  <h4 className="font-bold text-slate-800">{as.title}</h4>
                  <p className="text-[10px] text-slate-400">Yêu cầu: {as.criteria.mustGet100 ? 'Đúng 100%' : 'Làm xong nộp bài'}</p>
                </div>
              ))}
            
            {incompleteCount === 0 && (
              <p className="text-center text-slate-400 text-xs py-8 font-medium">Bé đã hoàn tất toàn bộ bài tập về nhà xuất sắc! 🎉</p>
            )}
          </div>
        </div>

        {/* Column 3: Feedbacks, custom complaints and comments with reply */}
        <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-800 flex items-center space-x-2">
            <span className="p-1 bg-indigo-50 rounded text-indigo-500"><MessageSquare className="h-4 w-4" /></span>
            <span>Ý Kiến & Trao Đổi Với Cô Giáo</span>
          </h3>

          <form onSubmit={handleSendFeedback} className="space-y-3 font-sans">
            <div>
              <textarea
                required
                rows={3}
                placeholder="Nhập ý kiến thắc mắc, phản hồi về tình hình học tập hoặc rèn chữ của con ở nhà..."
                value={feedbackMsg}
                onChange={e => setFeedbackMsg(e.target.value)}
                className="w-full text-xs p-3 rounded-2xl border border-slate-200 focus:outline-none focus:border-indigo-400 font-medium"
              />
            </div>

            <div className="flex items-center justify-between gap-2">
              {feedbackDraft ? (
                <button
                  type="button"
                  onClick={handleApplyDraft}
                  className="text-[10px] text-amber-600 font-bold bg-amber-50 px-2 py-1 rounded"
                >
                  Dùng bản nháp 📝
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSaveDraftFeedback}
                  className="text-[10px] text-slate-400 hover:text-slate-600 font-bold"
                >
                  Lưu bản nháp
                </button>
              )}
              
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-500 text-white font-extrabold text-xs rounded-xl hover:bg-indigo-600 flex items-center space-x-1.5 cursor-pointer shadow-md shadow-indigo-500/10"
              >
                <Send className="h-3.5 w-3.5" />
                <span>Gửi Ý Kiến</span>
              </button>
            </div>
          </form>

          {/* Feedback logs */}
          <div className="border-t border-slate-100 pt-3 space-y-3 max-h-[250px] overflow-y-auto pr-1">
            <span className="block text-[10px] text-slate-400 font-bold uppercase">Nhật ký trao đổi:</span>
            {feedbacks
              .filter(fb => fb.parentId === currentUser.id)
              .map((fb) => (
                <div key={fb.id} className="p-3 bg-slate-50 border border-slate-100 rounded-2xl space-y-2 text-xs">
                  <p className="text-slate-600 font-semibold">"{fb.message}"</p>
                  
                  {fb.reply ? (
                    <div className="bg-emerald-50 border border-emerald-100 p-2 rounded-xl text-[11px] text-slate-500">
                      <span className="font-extrabold text-emerald-700 block mb-0.5">Cô Mai Anh phản hồi:</span>
                      "{fb.reply}"
                    </div>
                  ) : (
                    <span className="text-[9px] font-bold text-slate-400 uppercase bg-slate-100 px-2 py-0.5 rounded border border-slate-200 block w-fit">
                      Đang đợi cô trả lời...
                    </span>
                  )}
                  <span className="block text-[9px] text-slate-400 text-right font-mono">{new Date(fb.createdAt).toLocaleDateString()}</span>
                </div>
              ))}
          </div>
        </div>

      </div>
    </div>
  );
};
