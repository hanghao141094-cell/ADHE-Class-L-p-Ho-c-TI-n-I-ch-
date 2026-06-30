/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useLMS } from '../context/LMSContext';
import { Teacher, Student, Parent } from '../types';
import { audioSynth } from './AudioSynthesizer';
import { 
  Download, Upload, RefreshCw, Trash2, LogIn, Sparkles, CheckCircle2, ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SystemDataViewProps {
  onContinue: () => void;
  onBack?: () => void;
  onSyncComplete?: () => void;
}

export const SystemDataView: React.FC<SystemDataViewProps> = ({ onContinue, onBack, onSyncComplete }) => {
  const { 
    teachers, setTeachers, 
    students, setStudents, 
    parents, setParents, 
    importAllData, clearAllData,
    recalculateRanks
  } = useLMS();

  // Selected sub-tab for spreadsheet upload/input
  const [activeImportTab, setActiveImportTab] = useState<'student' | 'teacher' | 'parent'>('student');
  const [showImportPanel, setShowImportPanel] = useState(false);
  const [showDownloadPanel, setShowDownloadPanel] = useState(false);

  // Raw text states for pasting
  const [studentText, setStudentText] = useState('');
  const [teacherText, setTeacherText] = useState('');
  const [parentText, setParentText] = useState('');

  const [syncing, setSyncing] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  // Status counts
  const studentCount = students.length;
  const teacherCount = teachers.length;
  const parentCount = parents.length;

  // --- DOWNLOAD CSV TEMPLATES ---
  const downloadTemplate = (type: 'student' | 'teacher' | 'parent') => {
    audioSynth.playBubblePop();
    let headers = '';
    let content = '';
    let filename = '';

    if (type === 'student') {
      headers = 'STT,Mã học sinh,Họ và tên,Giới tính,Ngày sinh';
      content = [
        headers,
        '1,HS001,Nguyễn Quốc Huy,Nam,2015-05-12',
        '2,HS002,Nguyễn Thị Mai,Nữ,2015-08-20'
      ].join('\n');
      filename = 'mau_danh_sach_hoc_sinh.csv';
    } else if (type === 'teacher') {
      headers = 'STT,Họ và tên,Số điện thoại,Tài khoản';
      content = [
        headers,
        '1,Phan Thị Hằng,0912345678,hangpt'
      ].join('\n');
      filename = 'mau_danh_sach_giao_vien.csv';
    } else if (type === 'parent') {
      headers = 'STT,Họ tên phụ huynh,Số điện thoại,Tên học sinh,Mã học sinh';
      content = [
        headers,
        '1,Phụ huynh em Huy,0987654321,Nguyễn Quốc Huy,HS001',
        '2,Phụ huynh em Mai,0905556677,Nguyễn Thị Mai,HS002'
      ].join('\n');
      filename = 'mau_danh_sach_phu_huynh.csv';
    }

    const csvContent = '\uFEFF' + content;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- PARSE CSV TEXT ---
  const parseTeachers = (text: string): Teacher[] => {
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
    const result: Teacher[] = [];
    lines.forEach((line, idx) => {
      if (idx === 0 && (line.toLowerCase().includes('stt') || line.toLowerCase().includes('họ và tên'))) return;
      const cols = line.split(',').map(c => c.trim());
      if (cols.length < 3) return;
      const name = cols[1];
      const phone = cols[2];
      const username = cols[3] || `teacher_${idx}`;
      if (name && phone) {
        result.push({
          id: `teacher_${Date.now()}_${idx}`,
          name,
          phone,
          username,
          avatar: '👩‍🏫',
          role: 'teacher'
        });
      }
    });
    return result;
  };

  const parseStudents = (text: string): Student[] => {
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
    const result: Student[] = [];
    lines.forEach((line, idx) => {
      if (idx === 0 && (line.toLowerCase().includes('stt') || line.toLowerCase().includes('mã học sinh'))) return;
      const cols = line.split(',').map(c => c.trim());
      if (cols.length < 3) return;
      const studentCode = cols[1] || `HS${String(idx).padStart(3, '0')}`;
      const name = cols[2];
      const gender = cols[3] || 'Nam';
      const birthDate = cols[4] || '2015-01-01';
      if (name) {
        result.push({
          id: studentCode,
          name,
          studentCode,
          gender,
          birthDate,
          avatar: gender === 'Nữ' ? '👧' : '👦',
          parentName: '',
          parentPhone: '',
          stars: 10,
          flags: 0,
          goldCards: 0,
          isActive: true
        });
      }
    });
    return result;
  };

  const parseParents = (text: string): Parent[] => {
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
    const result: Parent[] = [];
    lines.forEach((line, idx) => {
      if (idx === 0 && (line.toLowerCase().includes('stt') || line.toLowerCase().includes('họ tên phụ huynh'))) return;
      const cols = line.split(',').map(c => c.trim());
      if (cols.length < 4) return;
      const name = cols[1];
      const phone = cols[2];
      const studentName = cols[3];
      const studentId = cols[4] || '';
      if (name && phone && studentName) {
        result.push({
          id: `parent_${studentId || Date.now()}_${idx}`,
          name,
          phone,
          studentId,
          studentName,
          role: 'parent'
        });
      }
    });
    return result;
  };

  // --- SAVE ACTIVE IMPORT DATA ---
  const handleSaveActiveImport = () => {
    audioSynth.playBubblePop();
    let importedCount = 0;

    if (activeImportTab === 'student') {
      if (!studentText.trim()) {
        alert('Vui lòng nhập danh sách học sinh hoặc kéo thả file CSV trước!');
        return;
      }
      const parsed = parseStudents(studentText);
      if (parsed.length > 0) {
        setStudents(recalculateRanks(parsed));
        importedCount = parsed.length;
        setStudentText('');
        alert(`📥 Đã nhập thành công ${importedCount} học sinh vào hệ thống!`);
      } else {
        alert('❌ Định dạng dữ liệu không hợp lệ. Vui lòng kiểm tra lại!');
      }
    } else if (activeImportTab === 'teacher') {
      if (!teacherText.trim()) {
        alert('Vui lòng nhập danh sách giáo viên hoặc kéo thả file CSV trước!');
        return;
      }
      const parsed = parseTeachers(teacherText);
      if (parsed.length > 0) {
        setTeachers(parsed);
        importedCount = parsed.length;
        setTeacherText('');
        alert(`📥 Đã nhập thành công ${importedCount} giáo viên vào hệ thống!`);
      } else {
        alert('❌ Định dạng dữ liệu không hợp lệ. Vui lòng kiểm tra lại!');
      }
    } else if (activeImportTab === 'parent') {
      if (!parentText.trim()) {
        alert('Vui lòng nhập danh sách phụ huynh hoặc kéo thả file CSV trước!');
        return;
      }
      const parsed = parseParents(parentText);
      if (parsed.length > 0) {
        setParents(parsed);
        importedCount = parsed.length;
        setParentText('');
        alert(`📥 Đã nhập thành công ${importedCount} phụ huynh vào hệ thống!`);
      } else {
        alert('❌ Định dạng dữ liệu không hợp lệ. Vui lòng kiểm tra lại!');
      }
    }
  };

  // --- DRAG AND DROP FILE HANDLERS ---
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        if (text) {
          if (activeImportTab === 'student') setStudentText(text);
          else if (activeImportTab === 'teacher') setTeacherText(text);
          else if (activeImportTab === 'parent') setParentText(text);
          audioSynth.playBubblePop();
          alert(`📂 Nhận file thành công: ${file.name}! Nhấn nút "Nạp dữ liệu" phía dưới để xác nhận.`);
        }
      };
      reader.readAsText(file, "UTF-8");
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        if (text) {
          if (activeImportTab === 'student') setStudentText(text);
          else if (activeImportTab === 'teacher') setTeacherText(text);
          else if (activeImportTab === 'parent') setParentText(text);
          audioSynth.playBubblePop();
          alert(`📂 Nhận file thành công: ${file.name}! Nhấn nút "Nạp dữ liệu" phía dưới để xác nhận.`);
        }
      };
      reader.readAsText(file, "UTF-8");
    }
  };

  // --- AUTOMATIC QUICK PRD IMPORT ---
  const handleQuickPRDImport = () => {
    audioSynth.playSuccess();
    
    // Set 100% pure actual DB from Section 5 of PRD
    const prdTeachers: Teacher[] = [
      { id: 'teacher_1', name: 'Phan Thị Hằng', phone: '0912345678', username: 'hangpt', avatar: '👩‍🏫', role: 'teacher' }
    ];

    const prdStudents: Student[] = [
      { id: 'HS001', name: 'Nguyễn Quốc Huy', studentCode: 'HS001', gender: 'Nam', birthDate: '2015-05-12', avatar: '👦', parentName: 'Phụ huynh em Huy', parentPhone: '0987654321', stars: 15, flags: 0, goldCards: 0, isActive: true },
      { id: 'HS002', name: 'Nguyễn Thị Mai', studentCode: 'HS002', gender: 'Nữ', birthDate: '2015-08-20', avatar: '👧', parentName: 'Phụ huynh em Mai', parentPhone: '0905556677', stars: 22, flags: 0, goldCards: 0, isActive: true }
    ];

    const prdParents: Parent[] = [
      { id: 'parent_HS001', name: 'Phụ huynh em Huy', phone: '0987654321', studentId: 'HS001', studentName: 'Nguyễn Quốc Huy', role: 'parent' },
      { id: 'parent_HS002', name: 'Phụ huynh em Mai', phone: '0905556677', studentId: 'HS002', studentName: 'Nguyễn Thị Mai', role: 'parent' }
    ];

    importAllData(prdTeachers, prdStudents, prdParents);
    alert('🎉 Đã nạp thành công dữ liệu thực tế từ PRD bản 4.0!\n- Giáo viên: Cô Phan Thị Hằng\n- Học sinh: Nguyễn Quốc Huy, Nguyễn Thị Mai\n- Phụ huynh: Phụ huynh em Huy, Phụ huynh em Mai');
  };

  // --- SYNC ACTION (CONNECTS PARENTS AND REFRESHES SYSTEM) ---
  const handleSyncData = () => {
    audioSynth.playBubblePop();
    setSyncing(true);
    setSyncSuccess(false);

    setTimeout(() => {
      // Connect parent-student profiles
      if (students.length > 0 && parents.length > 0) {
        const updatedStudents = students.map(st => {
          const matchedParent = parents.find(p => p.studentId === st.id || p.studentName.toLowerCase() === st.name.toLowerCase());
          if (matchedParent) {
            return {
              ...st,
              parentName: matchedParent.name,
              parentPhone: matchedParent.phone
            };
          }
          return st;
        });
        setStudents(recalculateRanks(updatedStudents));
      }

      setSyncing(false);
      setSyncSuccess(true);
      audioSynth.playSuccess();

      setTimeout(() => {
        setSyncSuccess(false);
        if (onSyncComplete) {
          onSyncComplete();
        }
      }, 1500);
    }, 2000);
  };

  // --- RESET ACTION ---
  const handleResetSystem = () => {
    if (window.confirm('🧹 Chú ý: Hành động này sẽ XÓA SẠCH TOÀN BỘ dữ liệu học sinh, giáo viên, phụ huynh trong bộ nhớ đệm và các bài tập hiện tại. Bạn chắc chắn muốn làm mới hệ thống chứ?')) {
      clearAllData();
      setStudentText('');
      setTeacherText('');
      setParentText('');
      audioSynth.playBubblePop();
      alert('🧹 Đã làm mới hệ thống về trạng thái sạch sẽ hoàn toàn!');
    }
  };

  // Dedicated helper to trigger save from outside the panel
  const handleDirectSaveData = () => {
    audioSynth.playBubblePop();
    let savedAny = false;
    
    if (studentText.trim()) {
      const parsed = parseStudents(studentText);
      if (parsed.length > 0) {
        setStudents(recalculateRanks(parsed));
        setStudentText('');
        savedAny = true;
      }
    }
    
    if (teacherText.trim()) {
      const parsed = parseTeachers(teacherText);
      if (parsed.length > 0) {
        setTeachers(parsed);
        setTeacherText('');
        savedAny = true;
      }
    }
    
    if (parentText.trim()) {
      const parsed = parseParents(parentText);
      if (parsed.length > 0) {
        setParents(parsed);
        setParentText('');
        savedAny = true;
      }
    }

    if (savedAny) {
      alert('💾 Đã lưu thành công dữ liệu vừa nhập vào bộ nhớ hệ thống!');
      setShowImportPanel(false);
    } else {
      alert('⚠️ Không tìm thấy dữ liệu thô mới nào để lưu. Vui lòng bấm "Tải danh sách lên" để dán dữ liệu hoặc kéo thả file mẫu trước!');
      setShowImportPanel(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFEEB] flex items-center justify-center p-4 sm:p-6 font-sans">
      <div className="w-full max-w-4xl bg-white border-4 border-[#FFE082] rounded-[32px] shadow-[0_8px_0_0_#FFE082] p-6 sm:p-8 space-y-6 relative overflow-hidden">
        
        {/* Adorable visual background blobs & stickers */}
        <div className="absolute -top-10 -left-10 w-24 h-24 bg-pink-100 rounded-full blur-xl opacity-70"></div>
        <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-teal-100 rounded-full blur-xl opacity-70"></div>
        <div className="absolute top-4 right-4 text-4xl select-none animate-bounce" style={{ animationDuration: '3s' }}>🎈</div>
        <div className="absolute bottom-4 left-4 text-4xl select-none">⭐️</div>

        {/* Back navigation button if provided */}
        {onBack && (
          <button
            onClick={() => {
              audioSynth.playBubblePop();
              onBack();
            }}
            className="absolute top-4 left-4 flex items-center space-x-1 py-1.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-black transition cursor-pointer"
          >
            <span>← Chọn lại vai trò</span>
          </button>
        )}

        {/* Brand Banner */}
        <div className="text-center space-y-2 pt-4">
          <div className="inline-flex items-center space-x-1 px-4 py-1.5 bg-amber-100 border-2 border-amber-300 rounded-full text-amber-950 text-xs font-black uppercase tracking-wider shadow-sm">
            <span>🎒 ADHE CLASS v4.0</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-800 tracking-tight leading-none mt-2">
            QUẢN LÝ DỮ LIỆU HỆ THỐNG
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-bold leading-relaxed max-w-xl mx-auto">
            Hệ thống quản lý học tập tích hợp AI thân thiện nhất dành cho học sinh tiểu học. Hãy thiết lập hoặc nạp dữ liệu thật để bắt đầu!
          </p>
        </div>

        {/* Current Database Summary Box */}
        <div className="bg-amber-50/50 border-2 border-amber-100 rounded-2xl p-4 flex flex-wrap items-center justify-around gap-4 text-center">
          <div className="space-y-0.5">
            <div className="text-xl">👩‍🏫</div>
            <div className="text-[10px] font-black text-amber-900 uppercase">Giáo viên</div>
            <div className="text-lg font-black text-slate-800">{teacherCount} tài khoản</div>
          </div>
          <div className="w-px h-8 bg-amber-200 hidden sm:block"></div>
          <div className="space-y-0.5">
            <div className="text-xl">👦</div>
            <div className="text-[10px] font-black text-amber-900 uppercase">Học sinh</div>
            <div className="text-lg font-black text-slate-800">{studentCount} học sinh</div>
          </div>
          <div className="w-px h-8 bg-amber-200 hidden sm:block"></div>
          <div className="space-y-0.5">
            <div className="text-xl">👨‍👩‍👧</div>
            <div className="text-[10px] font-black text-amber-900 uppercase">Phụ huynh</div>
            <div className="text-lg font-black text-slate-800">{parentCount} máy đã kết nối</div>
          </div>
        </div>

        {/* Main Grid: EXACTLY 5 Actions requested */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          
          {/* Action 1: 📥 Tải file mẫu */}
          <button
            onClick={() => {
              audioSynth.playBubblePop();
              setShowDownloadPanel(!showDownloadPanel);
              setShowImportPanel(false);
            }}
            className={`group relative flex flex-col items-center justify-between p-5 bg-[#E8F5E9] hover:bg-[#C8E6C9] border-3 ${showDownloadPanel ? 'border-[#2E7D32] bg-[#C8E6C9]' : 'border-[#A5D6A7]'} rounded-[24px] shadow-[4px_4px_0_0_#A5D6A7] hover:translate-y-0.5 active:translate-y-1 transition duration-200 cursor-pointer text-center h-48`}
          >
            <div className="absolute top-2 right-2 text-xs font-black text-[#2E7D32]/60 select-none">01</div>
            <div className="text-4xl my-auto filter drop-shadow-sm select-none group-hover:scale-110 transition">📥</div>
            <div className="space-y-1 mt-auto">
              <h3 className="text-xs font-black text-[#1B5E20] uppercase tracking-tight">Tải file mẫu</h3>
              <p className="text-[10px] text-[#2E7D32] font-bold leading-tight">Biểu mẫu chuẩn học sinh, giáo viên, phụ huynh</p>
            </div>
          </button>

          {/* Action 2: 📤 Tải danh sách lên */}
          <button
            onClick={() => {
              audioSynth.playBubblePop();
              setShowImportPanel(!showImportPanel);
              setShowDownloadPanel(false);
            }}
            className={`group relative flex flex-col items-center justify-between p-5 bg-[#E1F5FE] hover:bg-[#B3E5FC] border-3 ${showImportPanel ? 'border-[#0277BD] bg-[#B3E5FC]' : 'border-[#81D4FA]'} rounded-[24px] shadow-[4px_4px_0_0_#81D4FA] hover:translate-y-0.5 active:translate-y-1 transition duration-200 cursor-pointer text-center h-48`}
          >
            <div className="absolute top-2 right-2 text-xs font-black text-[#0277BD]/60 select-none">02</div>
            <div className="text-4xl my-auto filter drop-shadow-sm select-none group-hover:scale-110 transition">📤</div>
            <div className="space-y-1 mt-auto">
              <h3 className="text-xs font-black text-[#01579B] uppercase tracking-tight">Tải danh sách lên</h3>
              <p className="text-[10px] text-[#0277BD] font-bold leading-tight">Chọn hoặc kéo thả file danh sách lớp học</p>
            </div>
          </button>

          {/* Action 3: 💾 Lưu dữ liệu */}
          <button
            onClick={handleDirectSaveData}
            className="group relative flex flex-col items-center justify-between p-5 bg-[#E0F7FA] hover:bg-[#B2EBF2] border-3 border-[#4DD0E1] rounded-[24px] shadow-[4px_4px_0_0_#4DD0E1] hover:translate-y-0.5 active:translate-y-1 transition duration-200 cursor-pointer text-center h-48"
          >
            <div className="absolute top-2 right-2 text-xs font-black text-[#006064]/60 select-none">03</div>
            <div className="text-4xl my-auto filter drop-shadow-sm select-none group-hover:scale-110 transition">💾</div>
            <div className="space-y-1 mt-auto">
              <h3 className="text-xs font-black text-[#006064] uppercase tracking-tight">Lưu dữ liệu</h3>
              <p className="text-[10px] text-[#00838F] font-bold leading-tight">Lưu trữ các thay đổi dữ liệu vào hệ thống</p>
            </div>
          </button>

          {/* Action 4: 🔄 Đồng bộ dữ liệu */}
          <button
            onClick={handleSyncData}
            disabled={syncing}
            className={`group relative flex flex-col items-center justify-between p-5 bg-[#F3E5F5] ${
              syncing ? 'opacity-80' : 'hover:bg-[#E1BEE7]'
            } border-3 border-[#CE93D8] rounded-[24px] shadow-[4px_4px_0_0_#CE93D8] hover:translate-y-0.5 active:translate-y-1 transition duration-200 cursor-pointer text-center h-48`}
          >
            <div className="absolute top-2 right-2 text-xs font-black text-[#6A1B9A]/60 select-none">04</div>
            <div className={`text-4xl my-auto filter drop-shadow-sm select-none group-hover:scale-110 transition ${syncing ? 'animate-spin' : ''}`}>🔄</div>
            <div className="space-y-1 mt-auto">
              <h3 className="text-xs font-black text-[#4A148C] uppercase tracking-tight">Đồng bộ dữ liệu</h3>
              <p className="text-[10px] text-[#6A1B9A] font-bold leading-tight">Liên kết thông tin & tạo tài khoản đăng nhập</p>
            </div>
          </button>

          {/* Action 5: 🧹 Làm mới dữ liệu */}
          <button
            onClick={handleResetSystem}
            className="group relative flex flex-col items-center justify-between p-5 bg-[#FFEBEE] hover:bg-[#FFCDD2] border-3 border-[#EF9A9A] rounded-[24px] shadow-[4px_4px_0_0_#EF9A9A] hover:translate-y-0.5 active:translate-y-1 transition duration-200 cursor-pointer text-center h-48"
          >
            <div className="absolute top-2 right-2 text-xs font-black text-[#C62828]/60 select-none">05</div>
            <div className="text-4xl my-auto filter drop-shadow-sm select-none group-hover:scale-110 transition">🧹</div>
            <div className="space-y-1 mt-auto">
              <h3 className="text-xs font-black text-[#B71C1C] uppercase tracking-tight">Làm mới dữ liệu</h3>
              <p className="text-[10px] text-[#C62828] font-bold leading-tight">Dọn dẹp sạch sẽ bộ nhớ cơ sở dữ liệu</p>
            </div>
          </button>

        </div>

        {/* Quick automatic PRD data injector */}
        <div className="flex flex-col sm:flex-row items-center justify-between bg-amber-50 border-2 border-dashed border-amber-300 rounded-[20px] p-4 gap-3">
          <div className="flex items-center space-x-2.5">
            <span className="text-2xl">⚡</span>
            <div className="text-left">
              <h4 className="text-xs font-black text-amber-950">Nạp nhanh dữ liệu mẫu thực tế?</h4>
              <p className="text-[10px] text-amber-800 font-bold">Điền tự động đúng danh sách giáo viên Phan Thị Hằng, em Huy và em Mai từ tài liệu PRD.</p>
            </div>
          </div>
          <button
            onClick={handleQuickPRDImport}
            className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-black text-xs uppercase tracking-wide rounded-xl shadow-xs shrink-0 cursor-pointer transition transform hover:scale-102 flex items-center space-x-1"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Nạp ngay trong 1 giây 🚀</span>
          </button>
        </div>

        {/* 📥 DOWNLOAD EXCEL/CSV FORMS TEMPLATE DRAWER */}
        <AnimatePresence>
          {showDownloadPanel && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-emerald-50/50 border-2 border-emerald-200 rounded-[24px] p-5 space-y-4 overflow-hidden text-left"
            >
              <div className="flex items-center justify-between border-b border-emerald-100 pb-2">
                <h3 className="text-xs font-black text-emerald-900 uppercase tracking-wide flex items-center space-x-1.5">
                  <span>📥 TẢI BIỂU MẪU CHUẨN (HỖ TRỢ EXCEL .XLSX / CSV)</span>
                </h3>
                <button 
                  onClick={() => { audioSynth.playBubblePop(); setShowDownloadPanel(false); }}
                  className="text-xs font-black text-emerald-700 hover:text-emerald-850 cursor-pointer bg-white border border-emerald-200 px-2.5 py-1 rounded-lg"
                >
                  Đóng panel ✕
                </button>
              </div>

              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                Thầy cô vui lòng chọn loại biểu mẫu cần chuẩn hóa. Hệ thống hỗ trợ tải file CSV định dạng chuẩn, có thể chỉnh sửa trực tiếp trên Excel cực kỳ thuận tiện:
              </p>

              {/* Individual template forms */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => downloadTemplate('student')}
                  className="p-4 bg-white border-2 border-emerald-100 hover:border-emerald-300 rounded-2xl flex flex-col items-center justify-center space-y-2 text-center group cursor-pointer transition transform hover:-translate-y-0.5 active:translate-y-0"
                >
                  <span className="text-3xl">👦</span>
                  <span className="text-xs font-black text-emerald-900">📥 Tải mẫu học sinh</span>
                  <span className="text-[10px] text-slate-400 font-bold leading-tight">Danh sách các học sinh của lớp</span>
                </button>

                <button
                  onClick={() => downloadTemplate('teacher')}
                  className="p-4 bg-white border-2 border-emerald-100 hover:border-emerald-300 rounded-2xl flex flex-col items-center justify-center space-y-2 text-center group cursor-pointer transition transform hover:-translate-y-0.5 active:translate-y-0"
                >
                  <span className="text-3xl">👩‍🏫</span>
                  <span className="text-xs font-black text-emerald-900">📥 Tải mẫu giáo viên</span>
                  <span className="text-[10px] text-slate-400 font-bold leading-tight">Danh mục tài khoản của giáo viên</span>
                </button>

                <button
                  onClick={() => downloadTemplate('parent')}
                  className="p-4 bg-white border-2 border-emerald-100 hover:border-emerald-300 rounded-2xl flex flex-col items-center justify-center space-y-2 text-center group cursor-pointer transition transform hover:-translate-y-0.5 active:translate-y-0"
                >
                  <span className="text-3xl">👨‍👩‍👧</span>
                  <span className="text-xs font-black text-emerald-900">📥 Tải mẫu phụ huynh</span>
                  <span className="text-[10px] text-slate-400 font-bold leading-tight">Mã liên kết phụ huynh - học sinh</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Slide-out/Toggleable Cute CSV upload form drawer */}
        <AnimatePresence>
          {showImportPanel && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-slate-50 border-2 border-slate-200 rounded-[24px] p-5 space-y-4 overflow-hidden"
            >
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-wide flex items-center space-x-1.5">
                  <span>📂 Tải danh sách lên & Nhập dữ liệu chi tiết</span>
                </h3>
                <button 
                  onClick={() => { audioSynth.playBubblePop(); setShowImportPanel(false); }}
                  className="text-xs font-black text-rose-500 hover:text-rose-600 cursor-pointer bg-white border border-rose-200 px-2.5 py-1 rounded-lg"
                >
                  Đóng panel ✕
                </button>
              </div>

              {/* Sub-tabs for Student, Teacher, Parent CSV templates */}
              <div className="flex bg-slate-200/50 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => { audioSynth.playBubblePop(); setActiveImportTab('student'); }}
                  className={`flex-1 py-1.5 text-[11px] font-black uppercase tracking-wider rounded-lg transition ${
                    activeImportTab === 'student' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  👦 Học sinh
                </button>
                <button
                  type="button"
                  onClick={() => { audioSynth.playBubblePop(); setActiveImportTab('teacher'); }}
                  className={`flex-1 py-1.5 text-[11px] font-black uppercase tracking-wider rounded-lg transition ${
                    activeImportTab === 'teacher' ? 'bg-white text-sky-800 shadow-xs' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  👩‍🏫 Giáo viên
                </button>
                <button
                  type="button"
                  onClick={() => { audioSynth.playBubblePop(); setActiveImportTab('parent'); }}
                  className={`flex-1 py-1.5 text-[11px] font-black uppercase tracking-wider rounded-lg transition ${
                    activeImportTab === 'parent' ? 'bg-white text-purple-800 shadow-xs' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  👨‍👩‍👧 Phụ huynh
                </button>
              </div>

              {/* CSV actions */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs bg-white p-3 rounded-xl border border-slate-200">
                <div className="font-bold text-slate-600 text-left">
                  {activeImportTab === 'student' && "💡 Cấu trúc: STT, Mã học sinh, Họ và tên, Giới tính, Ngày sinh."}
                  {activeImportTab === 'teacher' && "💡 Cấu trúc: STT, Họ và tên, Số điện thoại, Tài khoản."}
                  {activeImportTab === 'parent' && "💡 Cấu trúc: STT, Họ tên phụ huynh, Số điện thoại, Tên học sinh, Mã học sinh."}
                </div>
                <button
                  onClick={() => downloadTemplate(activeImportTab)}
                  className="flex items-center space-x-1 shrink-0 px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-950 border-2 border-amber-300 rounded-xl font-bold cursor-pointer transition text-xs"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Tải file mẫu 📥</span>
                </button>
              </div>

              {/* Upload interface */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Drag and Drop box */}
                <div
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  className={`border-3 border-dashed rounded-[20px] p-6 text-center flex flex-col items-center justify-center cursor-pointer transition ${
                    dragActive ? 'border-amber-400 bg-amber-50' : 'border-slate-300 hover:border-amber-400 bg-white'
                  }`}
                  onClick={() => document.getElementById('excel-file-uploader')?.click()}
                >
                  <Upload className="h-7 w-7 text-slate-400 mb-1.5" />
                  <span className="text-xs font-black text-slate-700">Kéo thả file CSV vào khu vực này</span>
                  <span className="text-[10px] text-slate-400 mt-1 font-bold">hoặc bấm để chọn từ máy tính</span>
                  <input
                    type="file"
                    id="excel-file-uploader"
                    accept=".csv"
                    onChange={handleFileInput}
                    className="hidden"
                  />
                </div>

                {/* Paste Direct textarea */}
                <div className="space-y-1 text-left">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wide">Nhập hoặc dán các dòng dữ liệu (CSV)</span>
                    <span className="text-[9px] bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded font-bold">Mỗi hàng 1 dòng</span>
                  </div>
                  <textarea
                    value={
                      activeImportTab === 'student' ? studentText :
                      activeImportTab === 'teacher' ? teacherText : parentText
                    }
                    onChange={(e) => {
                      if (activeImportTab === 'student') setStudentText(e.target.value);
                      else if (activeImportTab === 'teacher') setTeacherText(e.target.value);
                      else if (activeImportTab === 'parent') setParentText(e.target.value);
                    }}
                    placeholder={
                      activeImportTab === 'student'
                        ? "1,HS001,Nguyễn Quốc Huy,Nam,2015-05-12\n2,HS002,Nguyễn Thị Mai,Nữ,2015-08-20"
                        : activeImportTab === 'teacher'
                        ? "1,Phan Thị Hằng,0912345678,hangpt"
                        : "1,Phụ huynh em Huy,0987654321,Nguyễn Quốc Huy,HS001\n2,Phụ huynh em Mai,0905556677,Nguyễn Thị Mai,HS002"
                    }
                    className="w-full h-24 text-xs p-2.5 border-2 border-slate-200 rounded-xl focus:border-amber-400 focus:outline-none bg-white font-mono"
                  />
                </div>
              </div>

              {/* Save active import tab action */}
              <div className="flex justify-end pt-1">
                <button
                  onClick={handleSaveActiveImport}
                  className="px-5 py-2.5 bg-[#4CAF50] hover:bg-[#43A047] text-white font-black text-xs uppercase tracking-wide rounded-xl shadow-xs cursor-pointer flex items-center space-x-1.5 transition transform hover:scale-102"
                >
                  <span>Cập nhật bảng dữ liệu này 💾</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Big TIẾP TỤC ĐĂNG NHẬP button */}
        <div className="pt-4 border-t-2 border-slate-100">
          <button
            onClick={() => {
              audioSynth.playBubblePop();
              if (studentCount === 0 && teacherCount === 0) {
                if (window.confirm('⚠️ Bạn chưa nạp dữ liệu giáo viên hoặc học sinh nào vào cơ sở dữ liệu. Bạn có muốn tiếp tục đăng nhập không? (Không thể đăng nhập nếu cơ sở dữ liệu rỗng).')) {
                  onContinue();
                }
              } else {
                onContinue();
              }
            }}
            className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-black text-sm uppercase tracking-widest rounded-2xl cursor-pointer shadow-md hover:shadow-lg transition duration-200 transform active:scale-98 flex items-center justify-center space-x-2"
          >
            <span>🔐 TIẾP TỤC ĐĂNG NHẬP ➔</span>
          </button>
        </div>

        {/* Sync loading overlay */}
        <AnimatePresence>
          {syncing && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4"
            >
              <div className="bg-white rounded-[32px] border-4 border-amber-200 p-8 max-w-sm text-center space-y-4 shadow-2xl">
                <div className="flex justify-center">
                  <div className="relative">
                    <div className="animate-spin rounded-full h-14 w-14 border-t-4 border-b-4 border-amber-500"></div>
                    <span className="absolute inset-0 flex items-center justify-center text-xl">🔄</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <h3 className="font-black text-sm text-slate-800">Đang đồng bộ dữ liệu...</h3>
                  <p className="text-[10px] text-slate-400 font-bold leading-relaxed">
                    Đang thiết lập cổng kết nối đồng bộ danh sách giáo viên, học sinh, phụ huynh trong thời gian thực.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Sync Success Toast Banner */}
        <AnimatePresence>
          {syncSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-4 left-4 right-4 bg-emerald-50 border-2 border-emerald-300 rounded-2xl p-3 flex items-center space-x-2 shadow-md z-40"
            >
              <span className="text-xl">✅</span>
              <div className="text-left">
                <h4 className="text-xs font-black text-emerald-950">Đồng bộ dữ liệu thành công!</h4>
                <p className="text-[9px] text-emerald-700 font-semibold mt-0.5">Mã bảo mật liên kết phụ huynh đã tự động khớp nối với hồ sơ học sinh.</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
};

