/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { LMSProvider, useLMS } from './context/LMSContext';
import { LoginView } from './components/LoginView';
import { BannerSlider } from './components/BannerSlider';
import { TeacherView } from './components/TeacherView';
import { StudentView } from './components/StudentView';
import { ParentView } from './components/ParentView';
import { Home, LogOut, Sparkles, Smile, RefreshCw, Layers } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

function DashboardContainer() {
  const { currentUser, setCurrentUser, availableUsers } = useLMS();
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);

  // Avatar Emojis Bank
  const AVATAR_BANK = ['👦', '👧', '👶', '🦄', '🦁', '🦖', '🐼', '🦊', '🐨', '👩‍🏫', '👨', '👩', '👨‍💼', '👩‍💻'];

  const handleAvatarSelect = (emoji: string) => {
    setCurrentUser({
      ...currentUser,
      avatar: emoji
    });
    setShowAvatarPicker(false);
  };

  const renderRoleDashboard = () => {
    switch (currentUser.role) {
      case 'teacher':
        return <TeacherView />;
      case 'student':
        return <StudentView />;
      case 'parent':
        return <ParentView />;
      default:
        return <div className="text-center font-bold">Chưa chọn vai trò tương thích.</div>;
    }
  };

  const getRoleBadge = () => {
    switch (currentUser.role) {
      case 'teacher':
        return 'Thầy Cô Giáo 🏫';
      case 'student':
        return 'Học Sinh Lớp 3 👦';
      case 'parent':
        return 'Phụ Huynh Học Sinh 🏡';
    }
  };

  const getRoleBg = () => {
    switch (currentUser.role) {
      case 'teacher':
        return 'bg-amber-500';
      case 'student':
        return 'bg-sky-500';
      case 'parent':
        return 'bg-emerald-500';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans pb-12">
      
      {/* Real-time Sandbox Switcher Bar (Highly Interactive for Demo purposes!) */}
      <div className="bg-slate-900 text-slate-300 py-2 px-4 text-[11px] font-bold flex flex-wrap items-center justify-between gap-2 border-b border-slate-800">
        <div className="flex items-center space-x-1.5">
          <Layers className="h-3.5 w-3.5 text-sky-400 animate-pulse" />
          <span className="uppercase text-sky-400 font-extrabold tracking-wider">Hộp Thử Nghiệm 3 Vai Trò:</span>
          <span className="text-slate-400 font-normal">Nhấp chuyển đổi nhanh tài khoản để kiểm tra đồng bộ thời gian thực:</span>
        </div>
        
        {/* Quick select buttons */}
        <div className="flex flex-wrap gap-1.5">
          {availableUsers.map((user) => (
            <button
              key={user.id}
              onClick={() => setCurrentUser(user)}
              className={`px-2.5 py-1 rounded font-sans cursor-pointer text-[10px] transition-all flex items-center space-x-1 ${
                currentUser.id === user.id
                  ? 'bg-sky-500 text-white shadow-sm font-extrabold'
                  : 'bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white'
              }`}
            >
              <span>{user.avatar}</span>
              <span className="max-w-[100px] truncate">{user.name.split(' (')[0]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Primary Application Header */}
      <header className="bg-white border-b border-slate-100 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Brand Logo / Home trigger */}
          <button
            onClick={() => setCurrentUser(availableUsers[0])} // resets back to default (Teacher)
            className="flex items-center space-x-2.5 cursor-pointer text-left focus:outline-none"
          >
            <div className="p-2 bg-gradient-to-tr from-sky-400 to-indigo-500 rounded-xl text-white shadow-md shadow-sky-500/10">
              <Home className="h-5 w-5 fill-white" />
            </div>
            <div>
              <h1 className="text-sm font-black text-slate-800 tracking-tight flex items-center gap-1">
                <span>LMS Tiểu Học 3 Tài Khoản</span>
                <span className="text-xs font-bold text-sky-500 font-mono">v1.2</span>
              </h1>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Lớp Học Vui Vẻ</p>
            </div>
          </button>

          {/* Right Header Navigation */}
          <div className="flex items-center space-x-4">
            
            {/* User details and avatar trigger */}
            <div className="relative">
              <button
                onClick={() => setShowAvatarPicker(!showAvatarPicker)}
                className="flex items-center space-x-2.5 hover:bg-slate-50 p-1.5 rounded-xl transition cursor-pointer text-left border border-transparent hover:border-slate-100"
              >
                <span className="text-2xl p-1 bg-slate-100 rounded-lg shadow-inner">{currentUser.avatar}</span>
                <div className="hidden sm:block">
                  <h4 className="text-xs font-black text-slate-800 leading-tight">{currentUser.name}</h4>
                  <span className={`inline-block text-[9px] font-bold text-white px-2 py-0.5 rounded-full mt-0.5 ${getRoleBg()}`}>
                    {getRoleBadge()}
                  </span>
                </div>
              </button>

              {/* Popup Emoji Picker */}
              <AnimatePresence>
                {showAvatarPicker && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-2 bg-white rounded-2xl border border-slate-150 p-4 shadow-xl z-50 w-64 space-y-3"
                  >
                    <span className="block text-xs font-bold text-slate-500 uppercase text-center border-b border-slate-100 pb-1.5">Chọn Ảnh Đại Diện Mới 👇</span>
                    <div className="grid grid-cols-5 gap-2">
                      {AVATAR_BANK.map((emoji, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleAvatarSelect(emoji)}
                          className="text-2xl p-1 hover:bg-sky-50 rounded-lg transition"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Logout/Role select */}
            <button
              onClick={() => setCurrentUser(null as any)}
              className="p-2 border border-slate-200 hover:bg-rose-50 text-slate-500 hover:text-rose-500 rounded-xl transition cursor-pointer"
              title="Đăng xuất tài khoản"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>

        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 space-y-6 flex-grow">
        
        {/* Banner with slides & peaceful audio */}
        <BannerSlider />

        {/* Dynamic Role Dashboard render */}
        {renderRoleDashboard()}

        {/* Real-time Ticker Activity Log */}
        <div className="bg-slate-100 border border-slate-200/50 rounded-2xl px-4 py-3 text-[10px] font-bold text-slate-500 flex items-center space-x-2 overflow-hidden">
          <span className="shrink-0 text-emerald-600 bg-white border border-emerald-200 px-2 py-0.5 rounded uppercase flex items-center gap-1">
            <RefreshCw className="h-3 w-3 animate-spin" />
            <span>Đồng bộ thực</span>
          </span>
          <div className="flex-1 overflow-hidden relative h-4 w-full">
            <div className="absolute inset-0 flex items-center animate-marquee whitespace-nowrap space-x-8 font-mono">
              <span>★ [HỆ THỐNG] - Kết nối trạng thái mạng: Hoàn hảo. Đồng bộ thời gian thực 3 bên Giáo viên – Học sinh – Phụ huynh đang hoạt động tích cực.</span>
              <span>★ [ĐIỂM DANH] - Ngày {new Date().toLocaleDateString()} của học sinh vắng học đã tự động cập nhật đến thiết bị phụ huynh.</span>
              <span>★ [THI ĐUA] - Quy đổi điểm thưởng tự động: 50 Sao = 1 Cờ | 5 Cờ = 1 Thẻ Vàng danh giá.</span>
              <span>★ [LIÊN LẠC] - Mọi ý kiến phản hồi và trao đổi ý kiến đều được thông báo tức thì đến thầy cô chủ nhiệm.</span>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}

export default function App() {
  const [hasStarted, setHasStarted] = useState(true);

  return (
    <LMSProvider>
      <LMSConsumerWrapper />
    </LMSProvider>
  );
}

// Subwrapper to consume context safely
function LMSConsumerWrapper() {
  const { currentUser } = useLMS();

  if (!currentUser) {
    return <LoginView />;
  }

  return <DashboardContainer />;
}
