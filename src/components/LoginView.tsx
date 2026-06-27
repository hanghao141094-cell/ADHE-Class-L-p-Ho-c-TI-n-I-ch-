/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useLMS } from '../context/LMSContext';
import { motion } from 'motion/react';
import { GraduationCap, Users, UserCheck, ChevronRight, Sparkles } from 'lucide-react';
import { UserRole } from '../types';

export const LoginView: React.FC = () => {
  const { availableUsers, setCurrentUser } = useLMS();
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'teacher':
        return <GraduationCap className="h-10 w-10 text-amber-500" />;
      case 'student':
        return <Users className="h-10 w-10 text-sky-500" />;
      case 'parent':
        return <UserCheck className="h-10 w-10 text-emerald-500" />;
    }
  };

  const getRoleName = (role: UserRole) => {
    switch (role) {
      case 'teacher':
        return 'Thầy Cô Giáo 🏫';
      case 'student':
        return 'Học Sinh Lớp 1-5 👦👧';
      case 'parent':
        return 'Phụ Huynh Học Sinh 🏡';
    }
  };

  const getRoleDesc = (role: UserRole) => {
    switch (role) {
      case 'teacher':
        return 'Quản lý học sinh, giao bài tập, điểm danh và vinh danh bé';
      case 'student':
        return 'Xem bài tập, trả lời câu hỏi và tích luỹ sao đổi thưởng!';
      case 'parent':
        return 'Theo dõi tiến độ, xem kết quả học tập và trao đổi với giáo viên';
    }
  };

  const filteredUsers = selectedRole
    ? availableUsers.filter((u) => u.role === selectedRole)
    : [];

  return (
    <div className="min-h-screen bg-sky-50 flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Decorative cute circles */}
      <div className="absolute top-10 left-10 w-48 h-48 bg-yellow-200/50 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-pink-200/50 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-32 h-32 bg-sky-200/60 rounded-full blur-xl pointer-events-none" />

      <div className="max-w-4xl w-full bg-white rounded-3xl shadow-2xl border-4 border-sky-200 p-8 md:p-12 z-10 flex flex-col md:flex-row gap-8">
        
        {/* Left column: Welcome messages */}
        <div className="flex-1 flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 bg-sky-100 text-sky-700 font-bold text-xs py-1.5 px-4 rounded-full w-fit mb-6 shadow-sm border border-sky-200 uppercase">
              <Sparkles className="h-4 w-4 text-sky-500 animate-spin" />
              <span>Hệ Thống Học Tập Tiểu Học</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-800 tracking-tight leading-tight">
              Chào mừng bé và ba mẹ đến với <span className="text-sky-500">Lớp Học Vui Vẻ</span>! 🌟
            </h1>
            <p className="mt-4 text-slate-500 text-sm md:text-base leading-relaxed font-medium">
              Hệ thống kết nối trực tuyến hiện đại, trực quan giúp việc giao bài tập, điểm danh, thi đua sao đổi thưởng trở nên vô cùng thú vị và nhanh chóng.
            </p>
          </div>

          <div className="mt-8 pt-8 border-t border-slate-100 hidden md:block">
            <p className="text-xs text-slate-400 font-mono">
              ★ Thiết kế màu sắc tươi sáng dành cho lớp 1–5<br />
              ★ Đồng bộ thời gian thực giữa Giáo viên – Học sinh – Phụ huynh
            </p>
          </div>
        </div>

        {/* Right column: Form */}
        <div className="flex-1 space-y-6">
          {!selectedRole ? (
            <>
              <h2 className="text-xl font-bold text-slate-700 text-center md:text-left mb-4">
                Bạn là ai thế nhỉ? 👇
              </h2>
              
              <div className="space-y-4">
                {(['teacher', 'student', 'parent'] as UserRole[]).map((role) => (
                  <motion.button
                    key={role}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedRole(role)}
                    className="w-full text-left p-4 rounded-2xl border-2 border-slate-100 hover:border-sky-300 bg-white hover:bg-sky-50/50 flex items-center space-x-4 transition-all shadow-sm hover:shadow-md cursor-pointer"
                  >
                    <div className="p-3 bg-slate-50 rounded-xl">
                      {getRoleIcon(role)}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-slate-800 text-base">{getRoleName(role)}</h3>
                      <p className="text-xs text-slate-500 mt-0.5">{getRoleDesc(role)}</p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-slate-400" />
                  </motion.button>
                ))}
              </div>
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              <div className="flex items-center space-x-2 mb-4">
                <button
                  onClick={() => setSelectedRole(null)}
                  className="text-xs font-bold text-sky-500 hover:text-sky-600 bg-sky-50 hover:bg-sky-100 px-3 py-1.5 rounded-lg transition"
                >
                  ← Quay lại
                </button>
                <span className="text-sm font-bold text-slate-500">
                  Danh sách tài khoản ({getRoleName(selectedRole).split(' ')[0]})
                </span>
              </div>

              <h2 className="text-lg font-bold text-slate-700">
                Nhấp vào tài khoản để đăng nhập:
              </h2>

              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                {filteredUsers.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => setCurrentUser(user)}
                    className="w-full p-3.5 rounded-xl border border-slate-200 hover:border-sky-400 bg-white hover:bg-sky-50 flex items-center space-x-4 text-left transition cursor-pointer shadow-sm"
                  >
                    <span className="text-3xl p-1.5 bg-slate-50 rounded-lg">{user.avatar}</span>
                    <div className="flex-grow">
                      <h4 className="font-bold text-slate-800 text-sm">{user.name}</h4>
                      <p className="text-xs text-slate-400 font-medium">Vai trò: {selectedRole === 'teacher' ? 'Giáo viên Chủ nhiệm' : selectedRole === 'student' ? 'Học sinh' : 'Phụ huynh'}</p>
                    </div>
                    <span className="text-xs text-sky-500 font-bold bg-sky-50 px-2.5 py-1 rounded-full border border-sky-100">Chọn →</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </div>

      </div>
    </div>
  );
};
