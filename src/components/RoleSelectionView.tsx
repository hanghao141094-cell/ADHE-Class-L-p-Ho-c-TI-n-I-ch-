/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { GraduationCap, Users, UserCheck } from 'lucide-react';
import { audioSynth } from './AudioSynthesizer';

interface RoleSelectionViewProps {
  onSelectRole: (role: 'teacher' | 'student' | 'parent') => void;
}

export const RoleSelectionView: React.FC<RoleSelectionViewProps> = ({ onSelectRole }) => {
  const handleSelect = (role: 'teacher' | 'student' | 'parent') => {
    audioSynth.playBubblePop();
    onSelectRole(role);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-indigo-50/30 to-amber-50/40 flex items-center justify-center p-4 sm:p-6 font-sans relative overflow-hidden">
      {/* Playful background vectors */}
      <div className="absolute top-12 left-12 w-32 h-32 bg-pink-100 rounded-full blur-2xl pointer-events-none opacity-60 animate-pulse" />
      <div className="absolute bottom-12 right-12 w-48 h-48 bg-yellow-100 rounded-full blur-3xl pointer-events-none opacity-60" />
      <div className="absolute top-1/4 right-8 text-4xl select-none animate-bounce" style={{ animationDuration: '4s' }}>🎈</div>
      <div className="absolute bottom-1/4 left-8 text-3xl select-none">⭐️</div>

      <div className="max-w-3xl w-full text-center space-y-8 z-10">
        
        {/* Brand Header */}
        <div className="space-y-3">
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 bg-indigo-50 border-2 border-indigo-200 rounded-full text-indigo-950 text-xs font-black uppercase tracking-wider shadow-xs">
            <span>✨ LỚP HỌC HẠNH PHÚC</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-slate-800 tracking-tight leading-none">
            CHÀO MỪNG ĐẾN VỚI <span className="text-indigo-600">ADHE CLASS</span>
          </h1>
          <p className="text-sm sm:text-base text-slate-500 font-bold max-w-lg mx-auto">
            Hệ thống học tập, rèn luyện thi đua tích sao và kết nối thông minh 3 bên Giáo viên – Học sinh – Phụ huynh.
          </p>
        </div>

        {/* Roles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1: Giáo viên */}
          <button
            onClick={() => handleSelect('teacher')}
            className="group relative flex flex-col items-center p-6 bg-white hover:bg-amber-50/50 border-4 border-amber-100 hover:border-amber-300 rounded-[32px] shadow-[0_8px_0_0_#FEF3C7] hover:shadow-[0_8px_0_0_#FDE047] transition-all duration-300 transform hover:-translate-y-1 cursor-pointer text-center space-y-4 h-full flex-1"
          >
            <div className="p-4 bg-amber-500 text-white rounded-2xl text-4xl shadow-md group-hover:scale-110 transition duration-300">
              👩‍🏫
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-black text-amber-950 uppercase tracking-tight flex items-center justify-center gap-1.5">
                <span>Giáo viên</span>
                <span>🏫</span>
              </h3>
              <p className="text-[11px] text-slate-500 font-bold leading-relaxed">
                Quản lý dữ liệu hệ thống, giao nhiệm vụ, tích sao đổi thưởng và liên kết thông tin.
              </p>
            </div>
          </button>

          {/* Card 2: Học sinh */}
          <button
            onClick={() => handleSelect('student')}
            className="group relative flex flex-col items-center p-6 bg-white hover:bg-sky-50/50 border-4 border-sky-100 hover:border-sky-300 rounded-[32px] shadow-[0_8px_0_0_#E0F2FE] hover:shadow-[0_8px_0_0_#7DD3FC] transition-all duration-300 transform hover:-translate-y-1 cursor-pointer text-center space-y-4 h-full flex-1"
          >
            <div className="p-4 bg-sky-500 text-white rounded-2xl text-4xl shadow-md group-hover:scale-110 transition duration-300">
              👦
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-black text-sky-950 uppercase tracking-tight flex items-center justify-center gap-1.5">
                <span>Học sinh</span>
                <span>⭐</span>
              </h3>
              <p className="text-[11px] text-slate-500 font-bold leading-relaxed">
                Đăng nhập nhanh luyện tập làm bài tương tác, rèn luyện kỹ năng và xem sao thi đua.
              </p>
            </div>
          </button>

          {/* Card 3: Phụ huynh */}
          <button
            onClick={() => handleSelect('parent')}
            className="group relative flex flex-col items-center p-6 bg-white hover:bg-emerald-50/50 border-4 border-emerald-100 hover:border-emerald-300 rounded-[32px] shadow-[0_8px_0_0_#D1FAE5] hover:shadow-[0_8px_0_0_#6EE7B7] transition-all duration-300 transform hover:-translate-y-1 cursor-pointer text-center space-y-4 h-full flex-1"
          >
            <div className="p-4 bg-emerald-500 text-white rounded-2xl text-4xl shadow-md group-hover:scale-110 transition duration-300">
              👨‍👩‍👧
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-black text-emerald-950 uppercase tracking-tight flex items-center justify-center gap-1.5">
                <span>Phụ huynh</span>
                <span>🏡</span>
              </h3>
              <p className="text-[11px] text-slate-500 font-bold leading-relaxed">
                Kết nối thông tin học tập, giám sát quá trình điểm danh, bài tập và trao đổi cô giáo.
              </p>
            </div>
          </button>

        </div>

        {/* Simple visual indicator line */}
        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest pt-4">
          ★ ADHE CLASS - LỚP HỌC THỜI ĐẠI MỚI ★
        </div>

      </div>
    </div>
  );
};
