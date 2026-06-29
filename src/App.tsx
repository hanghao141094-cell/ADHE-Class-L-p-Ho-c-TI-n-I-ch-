/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { LMSProvider, useLMS } from './context/LMSContext';
import { LoginView } from './components/LoginView';
import { BannerSlider } from './components/BannerSlider';
import { EducationalLinks } from './components/EducationalLinks';
import { TeacherView } from './components/TeacherView';
import { StudentView } from './components/StudentView';
import { ParentView } from './components/ParentView';
import { AccountSettingsModal } from './components/AccountSettingsModal';
import { 
  Home, LogOut, Sparkles, Smile, RefreshCw, Layers, Settings, ChevronRight, BookOpen, GraduationCap 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { audioSynth } from './components/AudioSynthesizer';

function DashboardContainer() {
  const { currentUser, setCurrentUser, availableUsers } = useLMS();
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  
  // Navigation State for the 3 functional areas
  const [currentTab, setCurrentTab] = useState<'home' | 'links' | 'management'>('home');

  // Avatar Emojis Bank
  const AVATAR_BANK = ['👦', '👧', '👶', '🦄', '🦁', '🦖', '🐼', '🦊', '🐨', '👩‍🏫', '👨', '👩', '👨‍💼', '👩‍💻'];

  const handleAvatarSelect = (emoji: string) => {
    audioSynth.playBubblePop();
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

  const handleLogout = () => {
    audioSynth.playBubblePop();
    // Set flag in sessionStorage to prevent immediate auto-login loop
    sessionStorage.setItem('lms_just_logged_out', 'true');
    setCurrentUser(null as any);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans pb-12 text-slate-800">
      
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
              onClick={() => {
                audioSynth.playBubblePop();
                setCurrentUser(user);
              }}
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

      {/* Primary Application Header as requested */}
      <header className="bg-white border-b border-slate-100 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Brand Logo / Home Trigger */}
          <button
            onClick={() => {
              audioSynth.playBubblePop();
              setCurrentTab('home');
            }}
            className="flex items-center space-x-2.5 cursor-pointer text-left focus:outline-none group"
            title="Quay lại trang chủ chính"
          >
            <div className="p-2 bg-gradient-to-tr from-sky-400 to-indigo-500 rounded-xl text-white shadow-md shadow-sky-500/10 group-hover:scale-105 transition-transform">
              <Home className="h-5 w-5 fill-white" />
            </div>
            <div>
              <h1 className="text-sm font-black text-slate-800 tracking-tight flex items-center gap-1.5">
                <span>ADHE Class</span>
                <span className="text-[10px] bg-indigo-150 text-indigo-800 px-1.5 py-0.5 rounded font-black font-mono">Lớp học tiện ích</span>
              </h1>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">ADHE Class - LỚP HỌC TIỆN ÍCH</p>
            </div>
          </button>

          {/* Right Header Navigation */}
          <div className="flex items-center space-x-2.5 sm:space-x-4">
            
            {/* User name & status */}
            <div className="hidden md:flex flex-col items-end text-right">
              <h4 className="text-xs font-black text-slate-800 leading-tight flex items-center gap-1">
                <span>{currentUser.name}</span>
                <span className="animate-pulse h-2 w-2 rounded-full bg-emerald-500" />
              </h4>
              <span className={`inline-block text-[9px] font-extrabold text-white px-2 py-0.5 rounded-full mt-0.5 uppercase tracking-wider ${getRoleBg()}`}>
                {getRoleBadge()}
              </span>
            </div>

            {/* Avatar & picker */}
            <div className="relative">
              <button
                onClick={() => {
                  audioSynth.playBubblePop();
                  setShowAvatarPicker(!showAvatarPicker);
                }}
                className="flex items-center space-x-1.5 hover:bg-slate-50 p-1.5 rounded-xl transition cursor-pointer text-left border border-slate-100 hover:border-slate-200"
                title="Thay đổi ảnh đại diện"
              >
                <span className="text-2xl p-1 bg-slate-100 rounded-lg shadow-inner">{currentUser.avatar}</span>
                <span className="text-[10px] text-slate-400 font-black hidden sm:inline">Thay ảnh ▼</span>
              </button>

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
                          className="text-2xl p-1 hover:bg-sky-50 rounded-lg transition cursor-pointer"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Account settings button (⚙️) */}
            <button
              onClick={() => {
                audioSynth.playBubblePop();
                setShowSettingsModal(true);
              }}
              className="p-2 border border-slate-200 hover:bg-indigo-50 text-slate-500 hover:text-indigo-600 rounded-xl transition cursor-pointer"
              title="Cài đặt tài khoản bảo mật"
            >
              <Settings className="h-5 w-5" />
            </button>

            {/* Logout button */}
            <button
              onClick={handleLogout}
              className="p-2 border border-slate-200 hover:bg-rose-50 text-slate-500 hover:text-rose-500 rounded-xl transition cursor-pointer"
              title="Đăng xuất khỏi hệ thống"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>

        </div>
      </header>

      {/* Main Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 space-y-6 flex-grow w-full">
        
        {/* Navigation Breadcrumb when inside subpages */}
        {currentTab !== 'home' && (
          <div className="flex items-center space-x-2 text-xs font-bold text-indigo-700 bg-indigo-50/50 p-3 rounded-2xl border border-indigo-100">
            <button 
              onClick={() => {
                audioSynth.playBubblePop();
                setCurrentTab('home');
              }}
              className="hover:underline flex items-center gap-1 cursor-pointer"
            >
              🏠 Trang chủ chính
            </button>
            <span>➔</span>
            <span className="text-slate-600">
              {currentTab === 'links' ? '🌐 Liên kết học tập điện tử' : `🎒 Quản lý lớp học (${getRoleBadge()})`}
            </span>
            <button
              onClick={() => {
                audioSynth.playBubblePop();
                setCurrentTab('home');
              }}
              className="ml-auto bg-white hover:bg-indigo-100 text-indigo-800 border border-indigo-200 px-3 py-1 rounded-xl transition cursor-pointer"
            >
              ← Quay lại trang chủ
            </button>
          </div>
        )}

        <AnimatePresence mode="wait">
          
          {/* 1. STATE: HOME (BENTO GRID WITH DETAILED RULES) */}
          {currentTab === 'home' && (
            <motion.div
              key="home-bento"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-6"
            >
              {/* LEFT COLUMN: Notice Board (Bảng tin) + Educational Links closed card */}
              <div className="lg:col-span-5 flex flex-col gap-6">
                
                {/* ① BẢNG TIN LỚP HỌC (📢 🏫 ⭐, Blue light / Yellow pastel) - ALWAYS OPEN */}
                <div className="bg-gradient-to-br from-sky-50 to-amber-50 rounded-3xl p-5 border-4 border-sky-100 shadow-md flex flex-col space-y-4">
                  <div className="flex items-center justify-between border-b border-sky-200/50 pb-2.5">
                    <div className="flex items-center space-x-2 text-left">
                      <span className="p-1.5 bg-sky-500 text-white rounded-lg text-sm">📢</span>
                      <div>
                        <h3 className="font-black text-slate-800 text-xs uppercase tracking-wider">Bảng Tin Lớp Học</h3>
                        <p className="text-[10px] text-slate-400 font-black">Nội dung hiển thị trực tiếp từ giáo viên</p>
                      </div>
                    </div>
                    <span className="text-[9px] bg-sky-100 text-sky-800 px-2 py-0.5 rounded-full font-black uppercase tracking-wide">Đang hoạt động</span>
                  </div>

                  {/* Banner slider plays directly inside */}
                  <BannerSlider />
                </div>

                {/* ② LIÊN KẾT ỨNG DỤNG & TRANG HỌC TẬP ĐIỆN TỬ (🌐 💻 📚, Green / Orange Light pastel) - CLOSED */}
                <button
                  type="button"
                  onClick={() => {
                    audioSynth.playBubblePop();
                    setCurrentTab('links');
                  }}
                  className="bg-gradient-to-br from-emerald-50 via-teal-50 to-amber-50/50 hover:from-emerald-100 hover:to-teal-100 rounded-3xl p-6 border-4 border-emerald-100 hover:border-emerald-300 shadow-sm hover:shadow-md transition-all text-left flex items-start space-x-4 cursor-pointer transform hover:-translate-y-1 relative overflow-hidden group"
                >
                  <div className="absolute top-2 right-2 text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-extrabold tracking-wider uppercase">Nhấp để mở ➔</div>
                  <span className="p-4 bg-emerald-500 text-white rounded-2xl text-2xl shadow-md shadow-emerald-500/10 group-hover:scale-110 transition-transform">
                    🌐
                  </span>
                  <div className="flex-1 min-w-0 pr-4">
                    <h3 className="text-sm font-black text-emerald-950 uppercase tracking-tight flex items-center gap-1.5">
                      <span>LIÊN KẾT HỌC TẬP</span>
                      <span className="text-[10px] text-slate-400 font-bold lowercase">🌐 💻 📚</span>
                    </h3>
                    <p className="text-xs text-emerald-800 font-bold mt-1 leading-relaxed">
                      Kho học liệu điện tử chất lượng cao: OLM, Trạng Nguyên Tiếng Việt, Youtube Kids, sách giáo khoa điện tử...
                    </p>
                    <p className="text-[10px] text-slate-400 font-extrabold uppercase mt-2.5 flex items-center gap-1">
                      <span>• Nội dung học tập được giáo viên kiểm duyệt</span>
                    </p>
                  </div>
                </button>

              </div>

              {/* RIGHT COLUMN: QUẢN LÝ LỚP HỌC (🎒 ⭐ 🏅, Orange pastel / Pink light) - CLOSED, LARGER (50%) */}
              <div className="lg:col-span-7 flex">
                <button
                  type="button"
                  onClick={() => {
                    audioSynth.playBubblePop();
                    setCurrentTab('management');
                  }}
                  className="w-full bg-gradient-to-br from-amber-50 via-orange-50 to-pink-50/50 hover:from-amber-100 hover:via-orange-100 hover:to-pink-100 rounded-3xl p-8 border-4 border-amber-100 hover:border-amber-300 shadow-sm hover:shadow-lg transition-all text-left flex flex-col justify-between cursor-pointer transform hover:-translate-y-1 relative overflow-hidden group min-h-[350px] lg:min-h-0"
                >
                  <div className="absolute top-4 right-4 text-xs bg-amber-500 text-white px-3 py-1 rounded-full font-extrabold tracking-wider uppercase shadow-sm">Bấm để truy cập ngay ➔</div>
                  
                  {/* Icon and metadata */}
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <span className="p-4 bg-amber-500 text-white rounded-3xl text-3xl shadow-lg shadow-amber-500/20 group-hover:scale-110 transition-transform">
                        🎒
                      </span>
                      <div>
                        <h2 className="text-base font-black text-amber-950 uppercase tracking-tight">
                          QUẢN LÝ LỚP HỌC & NHIỆM VỤ
                        </h2>
                        <span className="text-xs font-bold text-slate-400 lowercase">🎒 ⭐ 🏅 Chi tiết góc lớp học vui vẻ</span>
                      </div>
                    </div>

                    <p className="text-xs text-amber-900 font-semibold leading-relaxed max-w-xl">
                      Cổng kết nối thông minh dành riêng cho <strong>{getRoleBadge()}</strong>. <br />
                      Xem danh sách bài tập tự luận, bài trắc nghiệm lấp lánh, hoạt động trải nghiệm thực tế, bảng xếp hạng nhận sao, lịch sử điểm danh hằng ngày và thông báo kết quả rèn luyện học tập tức thời.
                    </p>
                  </div>

                  {/* Preview features list styled like tags */}
                  <div className="space-y-3 pt-6 border-t border-amber-200/40">
                    <span className="block text-[10px] font-black text-amber-800 uppercase tracking-wider">Các tiện ích tích hợp bên trong:</span>
                    <div className="flex flex-wrap gap-2">
                      {['Quản lý học sinh 👦', 'Nhiệm vụ học tập 📝', 'Điểm danh hằng ngày 📅', 'Khen thưởng sao vàng 🏅', 'Kết quả học tập 📈', 'Cài đặt lớp học ⚙️'].map((tag, idx) => (
                        <span key={idx} className="px-3 py-1.5 bg-white/80 border border-amber-200/50 rounded-xl text-[11px] font-black text-amber-900 group-hover:bg-white transition-colors">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </button>
              </div>

            </motion.div>
          )}

          {/* 2. STATE: EDUCATIONAL LINKS PAGE */}
          {currentTab === 'links' && (
            <motion.div
              key="links-view"
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 15 }}
              className="bg-white rounded-3xl p-6 border-4 border-emerald-100 shadow-xl"
            >
              <EducationalLinks />
            </motion.div>
          )}

          {/* 3. STATE: ROLE-SPECIFIC MANAGEMENT DASHBOARD */}
          {currentTab === 'management' && (
            <motion.div
              key="management-view"
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
            >
              {renderRoleDashboard()}
            </motion.div>
          )}

        </AnimatePresence>

        {/* Real-time Ticker Activity Log */}
        <div className="bg-slate-100 border border-slate-200/50 rounded-2xl px-4 py-3 text-[10px] font-bold text-slate-500 flex items-center space-x-2 overflow-hidden mt-6">
          <span className="shrink-0 text-emerald-600 bg-white border border-emerald-200 px-2 py-0.5 rounded uppercase flex items-center gap-1">
            <RefreshCw className="h-3 w-3 animate-spin" />
            <span>Đồng bộ thực</span>
          </span>
          <div className="flex-1 overflow-hidden relative h-4 w-full text-left">
            <div className="absolute inset-0 flex items-center animate-marquee whitespace-nowrap space-x-8 font-mono">
              <span>★ [HỆ THỐNG] - Kết nối trạng thái mạng: Hoàn hảo. Đồng bộ thời gian thực 3 bên Giáo viên – Học sinh – Phụ huynh đang hoạt động tích cực.</span>
              <span>★ [ĐIỂM DANH] - Ngày {new Date().toLocaleDateString()} của học sinh vắng học đã tự động cập nhật đến thiết bị phụ huynh.</span>
              <span>★ [THI ĐUA] - Quy đổi điểm thưởng tự động: 50 Sao = 1 Cờ | 10 Cờ = 1 Thẻ Vàng danh giá.</span>
              <span>★ [LIÊN LẠC] - Mọi ý kiến phản hồi và trao đổi ý kiến đều được thông báo tức thì đến thầy cô chủ nhiệm.</span>
            </div>
          </div>
        </div>

      </main>

      {/* ACCOUNT SETTINGS MODAL */}
      <AnimatePresence>
        {showSettingsModal && (
          <AccountSettingsModal 
            isOpen={showSettingsModal} 
            onClose={() => setShowSettingsModal(false)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default function App() {
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
