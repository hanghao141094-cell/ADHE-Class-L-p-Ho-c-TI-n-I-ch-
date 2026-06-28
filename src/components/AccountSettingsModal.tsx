/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useLMS } from '../context/LMSContext';
import { motion } from 'motion/react';
import { 
  X, Lock, ShieldCheck, Trash2, KeyRound, Fingerprint, Smile, RefreshCw
} from 'lucide-react';
import { audioSynth } from './AudioSynthesizer';
import { SavedAccount } from '../types';

interface AccountSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AccountSettingsModal: React.FC<AccountSettingsModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, setCurrentUser, students, updateStudent, settings, updateSettings } = useLMS();
  
  // States
  const [activeTab, setActiveTab] = useState<'password' | 'security' | 'data'>('password');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pinCode, setPinCode] = useState('');
  
  // Load saved configurations
  const [savedAccounts, setSavedAccounts] = useState<SavedAccount[]>([]);
  const [currentSavedAcc, setCurrentSavedAcc] = useState<SavedAccount | null>(null);

  useEffect(() => {
    if (isOpen) {
      const saved = localStorage.getItem('lms_saved_accounts');
      if (saved) {
        const list: SavedAccount[] = JSON.parse(saved);
        setSavedAccounts(list);
        const match = list.find(a => a.username.toLowerCase() === currentUser.name.toLowerCase() && a.role === currentUser.role);
        if (match) {
          setCurrentSavedAcc(match);
          setPinCode(match.pinCode || '');
        }
      }
    }
  }, [isOpen, currentUser]);

  if (!isOpen) return null;

  const updateSavedAccountInStorage = (updates: Partial<SavedAccount>) => {
    const list = [...savedAccounts];
    const idx = list.findIndex(a => a.username.toLowerCase() === currentUser.name.toLowerCase() && a.role === currentUser.role);
    if (idx > -1) {
      const updated = { ...list[idx], ...updates };
      list[idx] = updated;
      setCurrentSavedAcc(updated);
    } else {
      // If it doesn't exist, create it
      const newAcc: SavedAccount = {
        username: currentUser.name,
        role: currentUser.role,
        passwordEncrypted: '',
        rememberMe: true,
        autoLogin: false,
        lastLoginTime: new Date().toISOString(),
        avatar: currentUser.avatar,
        studentId: currentUser.studentId,
        ...updates
      };
      list.push(newAcc);
      setCurrentSavedAcc(newAcc);
    }
    setSavedAccounts(list);
    localStorage.setItem('lms_saved_accounts', JSON.stringify(list));
  };

  const handlePasswordChangeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    audioSynth.playBubblePop();

    if (!newPassword.trim()) {
      alert('Vui lòng nhập mật khẩu mới!');
      return;
    }
    if (newPassword !== confirmPassword) {
      alert('Mật khẩu xác nhận không trùng khớp!');
      return;
    }

    // Persist password based on role
    if (currentUser.role === 'teacher') {
      updateSettings({
        ...settings,
        defaultPassword: newPassword
      });
      alert('Đã cập nhật mật khẩu mặc định của Giáo viên & Lớp học thành công!');
    } else if (currentUser.role === 'student' && currentUser.studentId) {
      updateStudent(currentUser.studentId, {
        password: newPassword
      });
      alert('Đã cập nhật mật khẩu cá nhân học sinh thành công!');
    } else if (currentUser.role === 'parent' && currentUser.studentId) {
      updateStudent(currentUser.studentId, {
        parentPassword: newPassword
      });
      alert('Đã cập nhật mật khẩu cá nhân phụ huynh thành công!');
    }

    // Update in saved account password encrypted if stored
    const enc = btoa(newPassword.split('').map(c => String.fromCharCode(c.charCodeAt(0) + 7)).join(''));
    updateSavedAccountInStorage({ passwordEncrypted: enc });

    setNewPassword('');
    setConfirmPassword('');
  };

  const handleTogglePIN = () => {
    audioSynth.playBubblePop();
    if (currentSavedAcc?.pinEnabled) {
      updateSavedAccountInStorage({ pinEnabled: false, pinCode: '' });
      setPinCode('');
      alert('Đã tắt bảo mật mã PIN thành công!');
    } else {
      if (pinCode.length !== 4 || isNaN(Number(pinCode))) {
        alert('Vui lòng điền mã PIN gồm 4 chữ số hợp lệ trước khi bật!');
        return;
      }
      updateSavedAccountInStorage({ pinEnabled: true, pinCode });
      alert('Đã kích hoạt bảo mật mã PIN 4 số thành công!');
    }
  };

  const handleToggleFingerprint = () => {
    audioSynth.playBubblePop();
    const currentStatus = !!currentSavedAcc?.fingerprintEnabled;
    updateSavedAccountInStorage({ fingerprintEnabled: !currentStatus });
    alert(!currentStatus ? 'Đã kích hoạt bảo mật Vân tay thành công!' : 'Đã tắt bảo mật Vân tay.');
  };

  const handleToggleFaceId = () => {
    audioSynth.playBubblePop();
    const currentStatus = !!currentSavedAcc?.faceIdEnabled;
    updateSavedAccountInStorage({ faceIdEnabled: !currentStatus });
    alert(!currentStatus ? 'Đã kích hoạt nhận diện khuôn mặt thành công!' : 'Đã tắt nhận diện khuôn mặt.');
  };

  const handleClearLoginHistory = () => {
    if (confirm('Bạn có chắc chắn muốn xóa tất cả lịch sử đăng nhập trên trình duyệt này?')) {
      localStorage.removeItem('lms_login_history');
      audioSynth.playBubblePop();
      alert('Đã xóa sạch lịch sử đăng nhập thành công!');
    }
  };

  const handleClearSavedAccounts = () => {
    if (confirm('Bạn có chắc chắn muốn xóa tất cả tài khoản đã lưu? Bạn sẽ phải nhập lại mật khẩu khi đăng nhập lần tới.')) {
      localStorage.removeItem('lms_saved_accounts');
      setSavedAccounts([]);
      setCurrentSavedAcc(null);
      audioSynth.playBubblePop();
      alert('Đã xóa sạch tài khoản đã lưu!');
    }
  };

  const handleToggleRememberPassword = () => {
    audioSynth.playBubblePop();
    const currentRemember = currentSavedAcc ? currentSavedAcc.rememberMe : true;
    updateSavedAccountInStorage({ rememberMe: !currentRemember, autoLogin: !currentRemember ? currentSavedAcc?.autoLogin : false });
    alert(!currentRemember ? 'Đã bật ghi nhớ mật khẩu.' : 'Đã tắt ghi nhớ mật khẩu.');
  };

  const handleLogoutAllDevices = () => {
    if (confirm('Đăng xuất khỏi tất cả các thiết bị sẽ xóa mọi cài đặt tự động đăng nhập. Bạn có chắc chắn muốn tiếp tục?')) {
      audioSynth.playBubblePop();
      localStorage.removeItem('lms_saved_accounts');
      sessionStorage.setItem('lms_just_logged_out', 'true');
      setCurrentUser(null as any);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn font-sans text-left">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-3xl border-4 border-indigo-200 max-w-lg w-full shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header modal */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-indigo-50/30">
          <div className="flex items-center space-x-2.5">
            <span className="p-2 bg-indigo-500 text-white rounded-xl text-lg">⚙️</span>
            <div>
              <h2 className="text-sm font-black text-slate-800 uppercase tracking-tight">Cài đặt tài khoản của bạn</h2>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{currentUser.name} ({currentUser.role === 'teacher' ? 'Giáo viên' : currentUser.role === 'student' ? 'Học sinh' : 'Phụ huynh'})</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation tabs */}
        <div className="flex border-b border-slate-100 bg-slate-50 text-xs">
          <button
            onClick={() => { audioSynth.playBubblePop(); setActiveTab('password'); }}
            className={`flex-1 py-3 font-black text-center border-b-2 transition ${
              activeTab === 'password' ? 'border-indigo-500 text-indigo-600 bg-white' : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            🔑 Đổi mật khẩu
          </button>
          {currentUser.role !== 'teacher' && (
            <button
              onClick={() => { audioSynth.playBubblePop(); setActiveTab('security'); }}
              className={`flex-1 py-3 font-black text-center border-b-2 transition ${
                activeTab === 'security' ? 'border-indigo-500 text-indigo-600 bg-white' : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              🛡️ Bảo mật PIN / Vân tay
            </button>
          )}
          <button
            onClick={() => { audioSynth.playBubblePop(); setActiveTab('data'); }}
            className={`flex-1 py-3 font-black text-center border-b-2 transition ${
              activeTab === 'data' ? 'border-indigo-500 text-indigo-600 bg-white' : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            ⚙️ Quản lý dữ liệu
          </button>
        </div>

        {/* Content area */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          
          {/* TAB 1: CHANGE PASSWORD */}
          {activeTab === 'password' && (
            <form onSubmit={handlePasswordChangeSubmit} className="space-y-4">
              <span className="block text-[11px] font-black text-slate-400 uppercase tracking-wider">Cập nhật mật khẩu bảo vệ tài khoản</span>
              
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Mật khẩu mới *</label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-slate-400"><KeyRound className="h-4 w-4" /></span>
                  <input
                    type="password"
                    required
                    placeholder="Nhập mật khẩu mới..."
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    className="w-full text-xs p-2.5 pl-10 rounded-xl border-2 border-slate-100 focus:border-indigo-400 focus:outline-none bg-slate-50/50 font-black text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Xác nhận mật khẩu mới *</label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-slate-400"><Lock className="h-4 w-4" /></span>
                  <input
                    type="password"
                    required
                    placeholder="Nhập lại mật khẩu mới..."
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    className="w-full text-xs p-2.5 pl-10 rounded-xl border-2 border-slate-100 focus:border-indigo-400 focus:outline-none bg-slate-50/50 font-black text-slate-800"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-indigo-500 hover:bg-indigo-600 text-white font-black text-xs uppercase tracking-wider rounded-xl transition shadow-md"
              >
                Cập Nhật Mật Khẩu ✅
              </button>
            </form>
          )}

          {/* TAB 2: BIOMETRICS & PIN CODE */}
          {activeTab === 'security' && currentUser.role !== 'teacher' && (
            <div className="space-y-4">
              <span className="block text-[11px] font-black text-slate-400 uppercase tracking-wider">Cấu hình bảo mật đăng nhập nhanh</span>
              
              {/* PIN code setup and toggle */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-150 space-y-3.5 text-xs font-bold text-slate-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="p-1.5 bg-indigo-100 text-indigo-700 rounded-lg">🔢</span>
                    <div>
                      <span className="block font-black text-slate-800">Khóa Mã PIN 4 Số</span>
                      <span className="text-[10px] text-slate-400 block font-semibold">Tự bảo vệ tài khoản bằng mật mã 4 số tiện lợi</span>
                    </div>
                  </div>
                  <button
                    onClick={handleTogglePIN}
                    className={`px-3 py-1.5 rounded-xl font-black text-[10px] uppercase transition ${
                      currentSavedAcc?.pinEnabled
                        ? 'bg-rose-500 text-white hover:bg-rose-600'
                        : 'bg-indigo-600 text-white hover:bg-indigo-700'
                    }`}
                  >
                    {currentSavedAcc?.pinEnabled ? 'Tắt Khóa' : 'Kích Hoạt'}
                  </button>
                </div>

                {!currentSavedAcc?.pinEnabled && (
                  <div className="pt-2 border-t border-slate-200 flex items-center space-x-2">
                    <input
                      type="text"
                      maxLength={4}
                      placeholder="Nhập 4 số PIN mới..."
                      value={pinCode}
                      onChange={e => setPinCode(e.target.value.replace(/\D/g, '').slice(0, 4))}
                      className="w-1/2 p-2 rounded-xl border border-slate-200 text-xs text-center font-mono font-black"
                    />
                    <span className="text-[10px] text-slate-400 font-semibold leading-tight">Nhập 4 số rồi bấm "Kích Hoạt" để cài đặt mã PIN bảo vệ.</span>
                  </div>
                )}
                
                {currentSavedAcc?.pinEnabled && (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-2.5 text-[11px] text-emerald-800 font-semibold flex items-center gap-2">
                    <span>✅ Mã PIN của bạn đã được thiết lập là:</span>
                    <span className="font-mono font-black bg-white px-2 py-0.5 border border-emerald-300 rounded text-emerald-950">{currentSavedAcc.pinCode}</span>
                  </div>
                )}
              </div>

              {/* Fingerprint biometrics toggle */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-150 flex items-center justify-between text-xs font-bold text-slate-700">
                <div className="flex items-center space-x-2">
                  <span className="p-1.5 bg-sky-100 text-sky-700 rounded-lg"><Fingerprint className="h-5 w-5" /></span>
                  <div>
                    <span className="block font-black text-slate-800">Xác Thực Vân Tay (Biometrics)</span>
                    <span className="text-[10px] text-slate-400 block font-semibold">Chạm nhẹ cảm biến để đăng nhập cực nhanh</span>
                  </div>
                </div>
                <button
                  onClick={handleToggleFingerprint}
                  className={`px-3 py-1.5 rounded-xl font-black text-[10px] uppercase transition ${
                    currentSavedAcc?.fingerprintEnabled
                      ? 'bg-rose-500 text-white hover:bg-rose-600'
                      : 'bg-indigo-100 text-indigo-800 hover:bg-indigo-200'
                  }`}
                >
                  {currentSavedAcc?.fingerprintEnabled ? 'Tắt Vân Tay' : 'Bật Vân Tay'}
                </button>
              </div>

              {/* Face ID biometrics toggle */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-150 flex items-center justify-between text-xs font-bold text-slate-700">
                <div className="flex items-center space-x-2">
                  <span className="p-1.5 bg-emerald-100 text-emerald-700 rounded-lg"><Smile className="h-5 w-5" /></span>
                  <div>
                    <span className="block font-black text-slate-800">Nhận Diện Khuôn Mặt (Face ID)</span>
                    <span className="text-[10px] text-slate-400 block font-semibold">Quét gương mặt rạng rỡ để vào lớp học</span>
                  </div>
                </div>
                <button
                  onClick={handleToggleFaceId}
                  className={`px-3 py-1.5 rounded-xl font-black text-[10px] uppercase transition ${
                    currentSavedAcc?.faceIdEnabled
                      ? 'bg-rose-500 text-white hover:bg-rose-600'
                      : 'bg-indigo-100 text-indigo-800 hover:bg-indigo-200'
                  }`}
                >
                  {currentSavedAcc?.faceIdEnabled ? 'Tắt FaceID' : 'Bật FaceID'}
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: DATA SETTINGS */}
          {activeTab === 'data' && (
            <div className="space-y-3.5">
              <span className="block text-[11px] font-black text-slate-400 uppercase tracking-wider">Quản lý dọn dẹp bộ nhớ lưu trữ</span>
              
              {/* Remember password status toggle */}
              <button
                onClick={handleToggleRememberPassword}
                className="w-full text-left p-3.5 rounded-2xl border border-slate-150 hover:border-slate-200 bg-slate-50 hover:bg-slate-100/50 transition flex items-center justify-between text-xs"
              >
                <div>
                  <span className="block font-black text-slate-800">Trạng thái ghi nhớ mật khẩu</span>
                  <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">Tắt ghi nhớ tài khoản để xóa mật khẩu khỏi form lần sau</span>
                </div>
                <span className={`px-2.5 py-1.5 text-[9px] font-black rounded-full uppercase tracking-wide ${
                  currentSavedAcc?.rememberMe ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                }`}>
                  {currentSavedAcc?.rememberMe ? 'Đang Bật' : 'Đang Tắt'}
                </span>
              </button>

              {/* Clear login history */}
              <button
                onClick={handleClearLoginHistory}
                className="w-full text-left p-3.5 rounded-2xl border border-slate-150 hover:border-slate-200 bg-slate-50 hover:bg-slate-100/50 transition flex items-center justify-between text-xs"
              >
                <div>
                  <span className="block font-black text-slate-800 text-rose-700">Xóa Lịch Sử Đăng Nhập</span>
                  <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">Làm sạch bảng danh sách thời gian, thiết bị truy cập trước đây</span>
                </div>
                <Trash2 className="h-4.5 w-4.5 text-rose-500" />
              </button>

              {/* Clear saved accounts */}
              <button
                onClick={handleClearSavedAccounts}
                className="w-full text-left p-3.5 rounded-2xl border border-slate-150 hover:border-slate-200 bg-slate-50 hover:bg-slate-100/50 transition flex items-center justify-between text-xs"
              >
                <div>
                  <span className="block font-black text-slate-800 text-rose-700">Xóa Các Tài Khoản Đã Lưu</span>
                  <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">Xóa danh sách tài khoản "Đăng nhập gần đây" ở chân màn hình</span>
                </div>
                <Trash2 className="h-4.5 w-4.5 text-rose-500" />
              </button>

              {/* Logout all devices */}
              <button
                onClick={handleLogoutAllDevices}
                className="w-full text-left p-3.5 rounded-2xl border border-slate-150 hover:border-slate-200 bg-slate-50 hover:bg-slate-100/50 transition flex items-center justify-between text-xs"
              >
                <div>
                  <span className="block font-black text-slate-800 text-rose-700">Đăng xuất tất cả thiết bị</span>
                  <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">Reset trạng thái tự động đăng nhập trên mọi thiết bị và thoát ra ngoài</span>
                </div>
                <span className="p-1 bg-rose-100 text-rose-700 rounded-lg text-xs">🚪</span>
              </button>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase rounded-xl transition shadow-md"
          >
            Lưu & Hoàn Thành
          </button>
        </div>
      </motion.div>
    </div>
  );
};
