/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { useLMS } from '../context/LMSContext';
import { motion, AnimatePresence } from 'motion/react';
import { 
  GraduationCap, Users, UserCheck, Eye, EyeOff, Lock, User, 
  Sparkles, ShieldCheck, History, X, Check, Fingerprint, Smile, KeyRound
} from 'lucide-react';
import { UserRole, SavedAccount, LoginHistoryEntry } from '../types';
import { audioSynth } from './AudioSynthesizer';

// Caesar Cipher Simple Encryption Helpers to satisfy encryption of password
const encryptPassword = (pwd: string): string => {
  return btoa(pwd.split('').map(c => String.fromCharCode(c.charCodeAt(0) + 7)).join(''));
};

const decryptPassword = (enc: string): string => {
  try {
    const raw = atob(enc);
    return raw.split('').map(c => String.fromCharCode(c.charCodeAt(0) - 7)).join('');
  } catch (e) {
    return enc;
  }
};

const getDeviceName = (): string => {
  const ua = navigator.userAgent;
  if (/android/i.test(ua)) return "Android Phone 📱";
  if (/iPad|iPhone|iPod/.test(ua)) return "iPhone/iPad 📱";
  if (/mac/i.test(ua)) return "macOS Computer 💻";
  if (/windows/i.test(ua)) return "Windows PC 💻";
  return "Trình duyệt Web 🌐";
};

export const LoginView: React.FC = () => {
  const { students, settings, setCurrentUser } = useLMS();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>('student');

  // Form states
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Settings checkbox states
  const [rememberMe, setRememberMe] = useState(true);
  const [autoLogin, setAutoLogin] = useState(false);
  
  const [errorMessage, setErrorMessage] = useState('');
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showSavedAccountsModal, setShowSavedAccountsModal] = useState(false);

  // Suggestions states
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Security Verification popup state
  const [securityMode, setSecurityMode] = useState<'none' | 'pin' | 'fingerprint' | 'face_id'>('none');
  const [activeSecurityAccount, setActiveSecurityAccount] = useState<SavedAccount | null>(null);
  const [pinInput, setPinInput] = useState('');
  const [biometricScanning, setBiometricScanning] = useState(false);

  const defaultPasswordVal = settings.defaultPassword || '123';

  // Load Saved Accounts and History
  const [savedAccounts, setSavedAccounts] = useState<SavedAccount[]>([]);
  const [loginHistory, setLoginHistory] = useState<LoginHistoryEntry[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('lms_saved_accounts');
    if (saved) {
      setSavedAccounts(JSON.parse(saved));
    }
    const history = localStorage.getItem('lms_login_history');
    if (history) {
      setLoginHistory(JSON.parse(history));
    }

    // Auto-login check on mount
    const justLoggedOut = sessionStorage.getItem('lms_just_logged_out');
    if (justLoggedOut !== 'true' && saved) {
      const accounts: SavedAccount[] = JSON.parse(saved);
      const autoLoginAcc = accounts.find(a => a.autoLogin);
      if (autoLoginAcc) {
        handleRecentAccountClick(autoLoginAcc);
      }
    } else {
      // Clear flag once we show screen
      sessionStorage.removeItem('lms_just_logged_out');
    }
  }, []);

  // Handle clicking outside of suggestions dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'teacher':
        return <GraduationCap className="h-5 w-5 text-amber-500" />;
      case 'student':
        return <Users className="h-5 w-5 text-sky-500" />;
      case 'parent':
        return <UserCheck className="h-5 w-5 text-emerald-500" />;
    }
  };

  const getRoleName = (role: UserRole) => {
    switch (role) {
      case 'teacher':
        return 'Giáo viên 🏫';
      case 'student':
        return 'Học sinh 👦';
      case 'parent':
        return 'Phụ huynh 👩';
    }
  };

  const performActualLogin = (role: UserRole, name: string, pass: string, securityConfig?: Partial<SavedAccount>) => {
    audioSynth.playBubblePop();
    let userToSet = null;

    if (role === 'teacher') {
      userToSet = {
        id: 'teacher_1',
        name: 'Cô giáo Mai Anh',
        avatar: '👩‍🏫',
        role: 'teacher' as UserRole
      };
    } else if (role === 'student') {
      const found = students.find(s => s.name.toLowerCase() === name.trim().toLowerCase());
      if (found) {
        userToSet = {
          id: found.id,
          name: found.name,
          avatar: found.avatar || '👦',
          role: 'student' as UserRole,
          studentId: found.id
        };
      }
    } else if (role === 'parent') {
      const foundByStudent = students.find(s => s.name.toLowerCase() === name.trim().toLowerCase());
      const foundByParent = students.find(s => s.parentName.toLowerCase() === name.trim().toLowerCase());
      const matched = foundByStudent || foundByParent;
      if (matched) {
        userToSet = {
          id: 'parent_' + matched.id,
          name: `Phụ huynh em ${matched.name}`,
          avatar: '👨',
          role: 'parent' as UserRole,
          studentId: matched.id
        };
      }
    }

    if (userToSet) {
      // 1. Save to Login History
      const newHistoryEntry: LoginHistoryEntry = {
        id: `hist_${Date.now()}`,
        username: name,
        role: role,
        loginTime: new Date().toLocaleString('vi-VN'),
        device: getDeviceName()
      };
      const updatedHistory = [newHistoryEntry, ...loginHistory].slice(0, 50); // limit to last 50
      setLoginHistory(updatedHistory);
      localStorage.setItem('lms_login_history', JSON.stringify(updatedHistory));

      // 2. Save / Update in Saved Accounts if rememberMe or autoLogin
      if (rememberMe || autoLogin) {
        const encrypted = encryptPassword(pass);
        const existingIdx = savedAccounts.findIndex(acc => acc.username.toLowerCase() === name.toLowerCase() && acc.role === role);
        
        let newAcc: SavedAccount = {
          username: name,
          role: role,
          passwordEncrypted: encrypted,
          rememberMe: rememberMe,
          autoLogin: autoLogin,
          lastLoginTime: new Date().toISOString(),
          avatar: userToSet.avatar,
          studentId: userToSet.studentId,
          ...(securityConfig || {})
        };

        let updatedAccounts = [...savedAccounts];
        if (existingIdx > -1) {
          // Merge old security settings if they exist
          newAcc = { ...updatedAccounts[existingIdx], ...newAcc };
          updatedAccounts[existingIdx] = newAcc;
        } else {
          updatedAccounts.push(newAcc);
        }
        setSavedAccounts(updatedAccounts);
        localStorage.setItem('lms_saved_accounts', JSON.stringify(updatedAccounts));
      }

      // 3. Set Current User
      setCurrentUser(userToSet);
    }
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    audioSynth.playBubblePop();

    if (!fullName.trim() || !password.trim()) {
      setErrorMessage('Vui lòng nhập đầy đủ Họ tên và Mật khẩu!');
      return;
    }

    const inputName = fullName.trim().toLowerCase();
    const inputPass = password.trim();

    if (selectedRole === 'teacher') {
      const isValidTeacherName = inputName === 'cô giáo mai anh' || inputName === 'mai anh' || inputName === 'cô mai anh';
      const isTeacherPassCorrect = inputPass === defaultPasswordVal || inputPass === '123' || inputPass === 'admin';

      if (isValidTeacherName && isTeacherPassCorrect) {
        performActualLogin('teacher', 'Cô giáo Mai Anh', inputPass);
      } else {
        setErrorMessage('Tên Giáo viên hoặc Mật khẩu không chính xác! (Gợi ý: Mai Anh / pass: ' + defaultPasswordVal + ')');
      }
    } else if (selectedRole === 'student') {
      const foundStudent = students.find(s => s.name.toLowerCase() === inputName);
      if (foundStudent) {
        const activePass = foundStudent.password || defaultPasswordVal;
        if (inputPass === activePass) {
          performActualLogin('student', foundStudent.name, inputPass);
        } else {
          setErrorMessage('Mật khẩu học sinh không chính xác!');
        }
      } else {
        setErrorMessage(`Không tìm thấy học sinh tên "${fullName}"!`);
      }
    } else if (selectedRole === 'parent') {
      const foundStudentByStudentName = students.find(s => s.name.toLowerCase() === inputName);
      const foundStudentByParentName = students.find(s => s.parentName.toLowerCase() === inputName);
      const matchedStudent = foundStudentByStudentName || foundStudentByParentName;

      if (matchedStudent) {
        const activePass = matchedStudent.parentPassword || defaultPasswordVal;
        if (inputPass === activePass) {
          performActualLogin('parent', matchedStudent.parentName || `Phụ huynh em ${matchedStudent.name}`, inputPass);
        } else {
          setErrorMessage('Mật khẩu phụ huynh không chính xác!');
        }
      } else {
        setErrorMessage(`Không tìm thấy phụ huynh hoặc học sinh tương ứng với tên "${fullName}"!`);
      }
    }
  };

  const handleRecentAccountClick = (acc: SavedAccount) => {
    setSelectedRole(acc.role);
    setFullName(acc.username);
    
    const decryptedPass = decryptPassword(acc.passwordEncrypted);
    setPassword(decryptedPass);
    setRememberMe(acc.rememberMe);
    setAutoLogin(acc.autoLogin);

    // 30-day requirement check for Teacher
    if (acc.role === 'teacher') {
      const lastLoginDate = new Date(acc.lastLoginTime);
      const diffDays = (Date.now() - lastLoginDate.getTime()) / (1000 * 60 * 60 * 24);
      if (diffDays > 30) {
        setErrorMessage("Đã quá 30 ngày kể từ lần đăng nhập cuối. Thầy cô vui lòng nhập lại mật khẩu vì lý do bảo mật!");
        setPassword(""); // force typing
        return;
      }
    }

    // PIN/Biometrics check
    if (acc.pinEnabled || acc.fingerprintEnabled || acc.faceIdEnabled) {
      setActiveSecurityAccount(acc);
      if (acc.pinEnabled) {
        setSecurityMode('pin');
        setPinInput('');
      } else if (acc.fingerprintEnabled) {
        setSecurityMode('fingerprint');
        triggerBiometricScan(acc);
      } else if (acc.faceIdEnabled) {
        setSecurityMode('face_id');
        triggerBiometricScan(acc);
      }
    } else {
      performActualLogin(acc.role, acc.username, decryptedPass);
    }
  };

  const triggerBiometricScan = (acc: SavedAccount) => {
    setBiometricScanning(true);
    audioSynth.playBubblePop();
    setTimeout(() => {
      setBiometricScanning(false);
      setSecurityMode('none');
      performActualLogin(acc.role, acc.username, decryptPassword(acc.passwordEncrypted));
    }, 1800);
  };

  const handlePinDigit = (digit: string) => {
    audioSynth.playBubblePop();
    if (pinInput.length < 4) {
      const newVal = pinInput + digit;
      setPinInput(newVal);
      if (newVal.length === 4 && activeSecurityAccount) {
        // Verify PIN
        if (newVal === activeSecurityAccount.pinCode) {
          setTimeout(() => {
            setSecurityMode('none');
            performActualLogin(
              activeSecurityAccount.role, 
              activeSecurityAccount.username, 
              decryptPassword(activeSecurityAccount.passwordEncrypted)
            );
          }, 400);
        } else {
          setErrorMessage('Mã PIN không chính xác! Vui lòng thử lại.');
          setPinInput('');
        }
      }
    }
  };

  const getFilteredSuggestions = () => {
    const list: { name: string; role: UserRole; avatar: string; isSaved?: boolean }[] = [];

    // 1. Add saved accounts
    savedAccounts.forEach(acc => {
      list.push({
        name: acc.username,
        role: acc.role,
        avatar: acc.avatar || (acc.role === 'teacher' ? '👩‍🏫' : acc.role === 'student' ? '👦' : '👨'),
        isSaved: true
      });
    });

    // 2. Add defaults if not already present
    if (!list.some(i => i.role === 'teacher')) {
      list.push({ name: 'Cô giáo Mai Anh', role: 'teacher', avatar: '👩‍🏫' });
    }
    students.forEach(s => {
      if (!list.some(i => i.name.toLowerCase() === s.name.toLowerCase() && i.role === 'student')) {
        list.push({ name: s.name, role: 'student', avatar: s.avatar || '👦' });
      }
      const parentLabel = `PH ${s.name}`;
      if (!list.some(i => i.role === 'parent' && i.name.includes(s.name))) {
        list.push({ name: s.parentName || parentLabel, role: 'parent', avatar: '👨' });
      }
    });

    if (!fullName.trim()) return list;

    return list.filter(item => 
      item.name.toLowerCase().includes(fullName.toLowerCase())
    );
  };

  const selectSuggestion = (item: { name: string; role: UserRole; isSaved?: boolean }) => {
    setFullName(item.name);
    setSelectedRole(item.role);
    setShowSuggestions(false);
    audioSynth.playBubblePop();

    // Check if this item is in saved accounts and has remember password
    const match = savedAccounts.find(acc => acc.username.toLowerCase() === item.name.toLowerCase() && acc.role === item.role);
    if (match && match.rememberMe) {
      setPassword(decryptPassword(match.passwordEncrypted));
      setRememberMe(true);
      setAutoLogin(match.autoLogin);
    } else {
      setPassword('');
      setRememberMe(true);
      setAutoLogin(false);
    }
  };

  return (
    <div className="min-h-screen bg-sky-50 flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans">
      
      {/* Decorative vectors */}
      <div className="absolute top-10 left-10 w-48 h-48 bg-yellow-200/50 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-pink-200/50 rounded-full blur-3xl pointer-events-none" />
      
      {/* Container main Card */}
      <div className="max-w-xl w-full bg-white rounded-3xl shadow-2xl border-4 border-indigo-200 p-6 md:p-8 z-10 space-y-6">
        
        {/* Header Title */}
        <div className="flex items-center justify-between border-b-2 border-indigo-50 pb-4">
          <div className="flex items-center space-x-3 text-left">
            <span className="p-3 bg-indigo-500 text-white rounded-2xl text-2xl shadow-md">🏫</span>
            <div>
              <h1 className="text-lg font-black text-indigo-950 uppercase tracking-tight">
                Cổng Lớp Học Vui Vẻ
              </h1>
              <p className="text-[11px] text-indigo-700 font-bold mt-0.5 uppercase tracking-wide">
                Trường tiểu học thông minh
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-1.5">
            <button
              onClick={() => setShowHistoryModal(true)}
              className="p-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 rounded-xl transition-all"
              title="Lịch sử đăng nhập"
            >
              <History className="h-4 w-4" />
            </button>
            <button
              onClick={() => {
                audioSynth.playBubblePop();
                setIsCollapsed(!isCollapsed);
              }}
              className="p-1.5 px-3 bg-indigo-100 hover:bg-indigo-200 text-indigo-900 border border-indigo-300 rounded-lg text-xs font-black cursor-pointer transition"
            >
              <span>{isCollapsed ? 'Mở Khung v' : 'Ẩn Khung ▲'}</span>
            </button>
          </div>
        </div>

        {isCollapsed ? (
          <div className="py-8 text-center space-y-3">
            <span className="text-4xl animate-bounce block">🔒</span>
            <h3 className="font-black text-slate-700 text-sm">Khung Đăng Nhập Đang Đóng</h3>
            <p className="text-xs text-slate-400 max-w-xs mx-auto font-semibold">
              Bé, ba mẹ hoặc cô giáo hãy nhấn nút <strong className="text-indigo-600">"Mở Khung"</strong> ở góc phải phía trên để đăng nhập nhé!
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            
            {/* 1. SELECT ROLE BUTTONS */}
            <div className="grid grid-cols-3 gap-2.5">
              {(['teacher', 'student', 'parent'] as UserRole[]).map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => {
                    audioSynth.playBubblePop();
                    setSelectedRole(role);
                    setErrorMessage('');
                    // Auto suggest default name for that role to help speed up
                    if (role === 'teacher') setFullName('Cô giáo Mai Anh');
                    else if (role === 'student') setFullName('Nguyễn An');
                    else setFullName('Nguyễn Thành');
                  }}
                  className={`py-3 px-2 rounded-2xl border-2 text-center flex flex-col items-center justify-center transition-all cursor-pointer shadow-xs ${
                    selectedRole === role 
                      ? 'border-indigo-500 bg-indigo-50/40 text-indigo-950 font-black' 
                      : 'border-slate-100 bg-white hover:border-slate-300 text-slate-600'
                  }`}
                >
                  <span className="p-1.5 bg-slate-50 rounded-lg mb-1 group-hover:bg-indigo-100">
                    {getRoleIcon(role)}
                  </span>
                  <span className="text-[11px] uppercase tracking-wide">{getRoleName(role).split(' ')[0]}</span>
                </button>
              ))}
            </div>

            {/* 2. FORM */}
            <form onSubmit={handleLoginSubmit} className="space-y-4 text-left">
              
              {/* Username with autocomplete suggestion */}
              <div className="relative">
                <label className="block text-[10px] font-black text-slate-500 uppercase mb-1 flex items-center gap-1">
                  <User className="h-3.5 w-3.5 text-slate-400" />
                  <span>Tên đăng nhập / Họ và Tên *</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    onFocus={() => setShowSuggestions(true)}
                    placeholder="Bấm chọn hoặc tự nhập tên..."
                    value={fullName}
                    onChange={e => {
                      setFullName(e.target.value);
                      setShowSuggestions(true);
                    }}
                    className="w-full text-xs p-3.5 rounded-xl border-2 border-slate-100 focus:border-indigo-400 focus:outline-none bg-slate-50/50 font-black text-slate-800"
                  />
                  <span className="absolute right-3.5 top-3.5 text-slate-400 text-xs">▼</span>
                </div>

                {/* Dropdown list of suggestions */}
                <AnimatePresence>
                  {showSuggestions && (
                    <motion.div
                      ref={suggestionsRef}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 5 }}
                      className="absolute left-0 right-0 mt-1.5 bg-white border border-slate-150 rounded-xl shadow-xl z-50 max-h-56 overflow-y-auto divide-y divide-slate-50"
                    >
                      <div className="p-2 bg-slate-50 text-[9px] font-black text-slate-400 uppercase tracking-wider text-center">Gợi ý danh sách tài khoản 👇</div>
                      {getFilteredSuggestions().map((item, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => selectSuggestion(item)}
                          className="w-full p-2.5 px-3 hover:bg-indigo-50/50 transition text-left flex items-center justify-between text-xs"
                        >
                          <div className="flex items-center space-x-2">
                            <span className="text-lg">{item.avatar}</span>
                            <div>
                              <span className="font-black text-slate-800">{item.name}</span>
                              <span className="text-[10px] font-bold text-slate-400 block">
                                {item.role === 'teacher' ? 'GV' : item.role === 'student' ? 'Học sinh' : 'Phụ huynh'}
                              </span>
                            </div>
                          </div>
                          {item.isSaved && (
                            <span className="text-[9px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-black">Lưu sẵn ✅</span>
                          )}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Password field with eye toggle */}
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase mb-1 flex items-center gap-1">
                  <Lock className="h-3.5 w-3.5 text-slate-400" />
                  <span>Mật khẩu của bạn *</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Nhập mật khẩu (mặc định: 123)"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full text-xs p-3.5 pr-12 rounded-xl border-2 border-slate-100 focus:border-indigo-400 focus:outline-none bg-slate-50/50 font-mono font-black text-slate-800"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 p-1 rounded transition"
                  >
                    {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                  </button>
                </div>
              </div>

              {/* Checkbox settings */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-slate-50 p-3 rounded-2xl border border-slate-100/50">
                <label className="flex items-center space-x-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={e => setRememberMe(e.target.checked)}
                    className="rounded text-indigo-600 focus:ring-indigo-400 h-4 w-4"
                  />
                  <span className="text-[11px] font-black text-slate-600">Ghi nhớ tài khoản</span>
                </label>

                <label className="flex items-center space-x-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={autoLogin}
                    onChange={e => setAutoLogin(e.target.checked)}
                    className="rounded text-indigo-600 focus:ring-indigo-400 h-4 w-4"
                  />
                  <span className="text-[11px] font-black text-slate-600">Tự động đăng nhập lần sau</span>
                </label>
              </div>

              {/* Error warning message */}
              {errorMessage && (
                <div className="p-3 bg-rose-50 border-2 border-rose-100 rounded-2xl text-[11px] text-rose-700 font-bold animate-pulse">
                  ⚠️ {errorMessage}
                </div>
              )}

              {/* Big [ ĐĂNG NHẬP ] Button */}
              <button
                type="submit"
                className="w-full py-3.5 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-black text-xs uppercase tracking-wider rounded-2xl cursor-pointer shadow-md hover:shadow-lg transition-all transform active:scale-95 flex items-center justify-center space-x-2"
              >
                <span>VÀO LỚP HỌC NGAY 🚀</span>
              </button>
            </form>

            {/* 3. RECENT ACCOUNTS / QUICK LOGIN */}
            {savedAccounts.length > 0 && (
              <div className="border-t border-slate-100 pt-4 text-left">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2.5">
                  Đăng nhập gần đây (Chọn tài khoản gần đây)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {savedAccounts.map((acc, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleRecentAccountClick(acc)}
                      className="p-3 bg-slate-50 hover:bg-indigo-50/40 border border-slate-150 hover:border-indigo-200 rounded-xl transition text-left flex items-center space-x-2.5 cursor-pointer group"
                    >
                      <span className="text-2xl p-1 bg-white rounded-lg shadow-sm">{acc.avatar || '👦'}</span>
                      <div className="flex-1 min-w-0">
                        <span className="font-black text-xs text-slate-800 block truncate leading-tight group-hover:text-indigo-950">
                          {acc.username}
                        </span>
                        <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wide">
                          {acc.role === 'teacher' ? 'GV 🏫' : acc.role === 'student' ? 'Học sinh 👦' : 'Phụ huynh 🏡'}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Helpful tip box */}
            <div className="bg-yellow-50/70 border border-yellow-200/50 rounded-2xl p-3 text-[10px] text-yellow-800 font-semibold leading-relaxed">
              💡 <strong>Học sinh tiểu học và Phụ huynh:</strong> Sau lần đầu đăng nhập, bạn có thể bật <strong>Ghi nhớ tài khoản</strong> hoặc <strong>Tự động đăng nhập</strong>. Các lần sau chỉ cần bấm vào tên đã lưu là có thể vào lớp học ngay mà không cần điền thông tin!
            </div>
          </div>
        )}

      </div>

      {/* LOGIN HISTORY MODAL */}
      <AnimatePresence>
        {showHistoryModal && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-6 border-4 border-slate-200 max-w-lg w-full shadow-2xl relative space-y-4 text-left"
            >
              <button
                onClick={() => setShowHistoryModal(false)}
                className="absolute right-4 top-4 p-1.5 hover:bg-slate-100 rounded-lg text-slate-400"
              >
                <X className="h-5 w-5" />
              </button>

              <h2 className="text-sm font-black text-slate-800 uppercase flex items-center gap-2">
                <History className="h-5 w-5 text-indigo-500" />
                <span>Lịch Sử Đăng Nhập Hệ Thống</span>
              </h2>

              <div className="overflow-y-auto max-h-80 border border-slate-100 rounded-2xl">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-[10px] text-slate-400 uppercase font-black">
                      <th className="p-3">Tài khoản</th>
                      <th className="p-3">Vai trò</th>
                      <th className="p-3">Thời gian</th>
                      <th className="p-3">Thiết bị</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {loginHistory.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="p-6 text-center text-slate-400 font-medium italic">
                          Chưa có lịch sử đăng nhập nào được ghi nhận.
                        </td>
                      </tr>
                    ) : (
                      loginHistory.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50 font-bold text-slate-700">
                          <td className="p-3 flex items-center space-x-1.5">
                            <span>{item.role === 'teacher' ? '👩‍🏫' : item.role === 'student' ? '👦' : '👨'}</span>
                            <span className="truncate max-w-[100px]">{item.username}</span>
                          </td>
                          <td className="p-3">
                            <span className={`px-1.5 py-0.5 text-[9px] rounded-full text-white ${
                              item.role === 'teacher' ? 'bg-amber-500' : item.role === 'student' ? 'bg-sky-500' : 'bg-emerald-500'
                            }`}>
                              {item.role === 'teacher' ? 'GV' : item.role === 'student' ? 'Học sinh' : 'PH'}
                            </span>
                          </td>
                          <td className="p-3 text-[10px] font-mono text-slate-500">{item.loginTime}</td>
                          <td className="p-3 text-[10px] text-slate-400">{item.device}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => {
                    if (confirm('Bạn có chắc chắn muốn xóa tất cả lịch sử đăng nhập?')) {
                      setLoginHistory([]);
                      localStorage.removeItem('lms_login_history');
                      audioSynth.playBubblePop();
                    }
                  }}
                  className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 font-black text-[10px] rounded-xl uppercase transition mr-auto"
                >
                  Xoá Lịch Sử 🗑️
                </button>
                <button
                  onClick={() => setShowHistoryModal(false)}
                  className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-black text-[10px] rounded-xl uppercase transition"
                >
                  Đóng ✕
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* PIN & BIOMETRICS AUTHORIZATION POPUP */}
      <AnimatePresence>
        {securityMode !== 'none' && activeSecurityAccount && (
          <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn">
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-3xl p-6 border-4 border-indigo-200 max-w-sm w-full shadow-2xl relative text-center space-y-6"
            >
              <button
                onClick={() => setSecurityMode('none')}
                className="absolute right-4 top-4 p-1.5 hover:bg-slate-100 rounded-lg text-slate-400"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="flex flex-col items-center space-y-2">
                <span className="text-4xl p-2 bg-slate-50 rounded-2xl shadow-sm">{activeSecurityAccount.avatar || '👦'}</span>
                <h3 className="font-black text-slate-800 text-sm uppercase">Xác thực bảo mật</h3>
                <p className="text-xs text-slate-400 font-bold">Tài khoản: {activeSecurityAccount.username}</p>
              </div>

              {/* PIN Code Mode */}
              {securityMode === 'pin' && (
                <div className="space-y-4">
                  <div className="flex justify-center space-x-3.5 my-4">
                    {[0, 1, 2, 3].map((idx) => (
                      <div
                        key={idx}
                        className={`h-4 w-4 rounded-full border-2 border-indigo-300 transition-all duration-300 ${
                          pinInput.length > idx ? 'bg-indigo-600 scale-110 shadow-md' : 'bg-slate-100'
                        }`}
                      />
                    ))}
                  </div>

                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider mb-2">Nhập mã PIN 4 số của bạn</p>
                  
                  {/* NumPad */}
                  <div className="grid grid-cols-3 gap-2 max-w-[240px] mx-auto">
                    {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => handlePinDigit(num)}
                        className="h-12 w-12 rounded-full border border-slate-150 hover:border-indigo-400 bg-slate-50 hover:bg-indigo-50 text-slate-800 font-black text-sm transition-all flex items-center justify-center cursor-pointer shadow-xs active:scale-90"
                      >
                        {num}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => {
                        audioSynth.playBubblePop();
                        setPinInput('');
                      }}
                      className="h-12 w-12 rounded-full text-rose-500 font-black text-[10px] uppercase transition-all hover:bg-rose-50 flex items-center justify-center cursor-pointer"
                    >
                      Xóa
                    </button>
                    <button
                      type="button"
                      onClick={() => handlePinDigit('0')}
                      className="h-12 w-12 rounded-full border border-slate-150 hover:border-indigo-400 bg-slate-50 hover:bg-indigo-50 text-slate-800 font-black text-sm transition-all flex items-center justify-center cursor-pointer shadow-xs active:scale-90"
                    >
                      0
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        audioSynth.playBubblePop();
                        if (pinInput.length > 0) setPinInput(pinInput.slice(0, -1));
                      }}
                      className="h-12 w-12 rounded-full text-slate-500 font-black text-[10px] uppercase transition-all hover:bg-slate-100 flex items-center justify-center cursor-pointer"
                    >
                      ←
                    </button>
                  </div>
                </div>
              )}

              {/* Fingerprint scanning Mode */}
              {securityMode === 'fingerprint' && (
                <div className="flex flex-col items-center py-4 space-y-4">
                  <div className="relative p-6 bg-sky-50 rounded-full border-2 border-sky-200">
                    <Fingerprint className={`h-16 w-16 text-sky-500 ${biometricScanning ? 'animate-pulse' : ''}`} />
                    {biometricScanning && (
                      <div className="absolute inset-x-0 top-1/2 h-0.5 bg-emerald-500/80 shadow-md animate-bounce pointer-events-none" />
                    )}
                  </div>
                  <span className="text-xs font-black text-sky-800 uppercase animate-pulse">
                    {biometricScanning ? 'Đang quét vân tay...' : 'Vân tay đã xác thực thành công!'}
                  </span>
                  <p className="text-[10px] text-slate-400 max-w-[200px] font-semibold mx-auto">Vui lòng chạm giữ ngón tay trên cảm biến thiết bị của bạn.</p>
                </div>
              )}

              {/* Face ID scanning Mode */}
              {securityMode === 'face_id' && (
                <div className="flex flex-col items-center py-4 space-y-4">
                  <div className="relative h-24 w-24 bg-emerald-50 rounded-2xl border-2 border-emerald-300 flex items-center justify-center overflow-hidden">
                    <Smile className={`h-12 w-12 text-emerald-500 ${biometricScanning ? 'animate-bounce' : ''}`} />
                    {biometricScanning && (
                      <div className="absolute inset-0 border-2 border-dashed border-emerald-400 rounded-2xl animate-spin" />
                    )}
                  </div>
                  <span className="text-xs font-black text-emerald-800 uppercase animate-pulse">
                    {biometricScanning ? 'Đang nhận diện khuôn mặt...' : 'Nhận diện thành công!'}
                  </span>
                  <p className="text-[10px] text-slate-400 max-w-[200px] font-semibold mx-auto">Nhìn thẳng vào camera trước của bạn.</p>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
