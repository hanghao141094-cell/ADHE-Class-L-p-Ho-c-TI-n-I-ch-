import React from 'react';
import { motion } from 'motion/react';
import {
  Plus,
  Save,
  Send,
  Volume2,
  Paperclip,
  Link as LinkIcon,
  ChevronDown,
  ChevronUp,
  Download,
  Upload
} from 'lucide-react';
import { Question, QuestionType, Assignment } from '../types';
import { audioSynth } from './AudioSynthesizer';

interface AssignmentFramesProps {
  asTitle: string;
  setAsTitle: (val: string) => void;
  asSubject: string;
  setAsSubject: (val: string) => void;
  asWeek: number;
  setAsWeek: (val: number) => void;
  asStars: number;
  setAsStars: (val: number) => void;
  asDesc: string;
  setAsDesc: (val: string) => void;
  isListening: boolean;
  startVoiceToText: () => void;
  criteriaExpanded: boolean;
  setCriteriaExpanded: (val: boolean) => void;
  shuffle: boolean;
  setShuffle: (val: boolean) => void;
  must100: boolean;
  setMust100: (val: boolean) => void;
  onlyOne: boolean;
  setOnlyOne: (val: boolean) => void;
  timeLimit: number;
  setTimeLimit: (val: number) => void;

  // New criteria settings
  oneTimeOnly?: boolean;
  setOneTimeOnly?: (val: boolean) => void;
  multipleTimes?: boolean;
  setMultipleTimes?: (val: boolean) => void;
  shuffleOnRetry?: boolean;
  setShuffleOnRetry?: (val: boolean) => void;
  autoGrade?: boolean;
  setAutoGrade?: (val: boolean) => void;
  autoStarPoints?: boolean;
  setAutoStarPoints?: (val: boolean) => void;
  saveDraftAllowed?: boolean;
  setSaveDraftAllowed?: (val: boolean) => void;
  showAnswersOnSubmit?: boolean;
  setShowAnswersOnSubmit?: (val: boolean) => void;

  limitTimeEnabled?: boolean;
  setLimitTimeEnabled?: (val: boolean) => void;
  limit24h?: boolean;
  setLimit24h?: (val: boolean) => void;
  limit3days?: boolean;
  setLimit3days?: (val: boolean) => void;
  autoLockOnExpiry?: boolean;
  setAutoLockOnExpiry?: (val: boolean) => void;
  notifyParentOnUncompleted?: boolean;
  setNotifyParentOnUncompleted?: (val: boolean) => void;
  earlyCompletionStar?: boolean;
  setEarlyCompletionStar?: (val: boolean) => void;
  lateSubmissionDeductStar?: boolean;
  setLateSubmissionDeductStar?: (val: boolean) => void;
  mustCompleteBeforeNew?: boolean;
  setMustCompleteBeforeNew?: (val: boolean) => void;

  allowedAttemptsCount?: '1' | '2' | '3' | 'unlimited';
  setAllowedAttemptsCount?: (val: '1' | '2' | '3' | 'unlimited') => void;

  startDate?: string;
  setStartDate?: (val: string) => void;
  startTime?: string;
  setStartTime?: (val: string) => void;
  endDate?: string;
  setEndDate?: (val: string) => void;
  endTime?: string;
  setEndTime?: (val: string) => void;

  rememberForReview?: boolean;
  setRememberForReview?: (val: boolean) => void;
  stillAllowedAfterExpiry?: boolean;
  setStillAllowedAfterExpiry?: (val: boolean) => void;
  
  essayQText: string;
  setEssayQText: (val: string) => void;
  isEssayListening: boolean;
  startEssayVoiceToText: () => void;
  essayQImages: string[];
  setEssayQImages: React.Dispatch<React.SetStateAction<string[]>>;
  handleEssayImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleRemoveEssayImage: (index: number) => void;
  handleSaveEssayQuestion: () => void;

  essayCriteria?: string;
  setEssayCriteria?: (val: string) => void;
  essayCriteriaImages?: string[];
  setEssayCriteriaImages?: React.Dispatch<React.SetStateAction<string[]>>;
  aiAutoGrade?: boolean;
  setAiAutoGrade?: (val: boolean) => void;
  aiReview?: boolean;
  setAiReview?: (val: boolean) => void;
  aiSuggestions?: boolean;
  setAiSuggestions?: (val: boolean) => void;
  aiImmediateResults?: boolean;
  setAiImmediateResults?: (val: boolean) => void;
  handleCriteriaImageUpload?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleRemoveCriteriaImage?: (idx: number) => void;
  
  questions: Question[];
  setQuestions: React.Dispatch<React.SetStateAction<Question[]>>;
  handleAddQuestion: () => void;
  downloadCSVTemplate: () => void;
  handleImportQuestionsFile: (e: React.ChangeEvent<HTMLInputElement>) => void;
  tempImportedQuestions: Question[];
  setTempImportedQuestions: (qs: Question[]) => void;
  
  qType: QuestionType;
  setQType: (val: QuestionType) => void;
  qText: string;
  setQText: (val: string) => void;
  qImages: string[];
  setQImages: React.Dispatch<React.SetStateAction<string[]>>;
  
  singleOptA: string;
  setSingleOptA: (val: string) => void;
  singleOptB: string;
  setSingleOptB: (val: string) => void;
  singleOptC: string;
  setSingleOptC: (val: string) => void;
  singleOptD: string;
  setSingleOptD: (val: string) => void;
  singleCorrect: string;
  setSingleCorrect: (val: string) => void;
  
  tfA: string;
  setTfA: (val: string) => void;
  tfB: string;
  setTfB: (val: string) => void;
  tfC: string;
  setTfC: (val: string) => void;
  tfD: string;
  setTfD: (val: string) => void;
  tfACorrect: boolean;
  setTfACorrect: (val: boolean) => void;
  tfBCorrect: boolean;
  setTfBCorrect: (val: boolean) => void;
  tfCCorrect: boolean;
  setTfCCorrect: (val: boolean) => void;
  tfDCorrect: boolean;
  setTfDCorrect: (val: boolean) => void;
  
  mLeft1: string;
  setMLeft1: (val: string) => void;
  mRight1: string;
  setMRight1: (val: string) => void;
  mLeft2: string;
  setMLeft2: (val: string) => void;
  mRight2: string;
  setMRight2: (val: string) => void;
  mLeft3: string;
  setMLeft3: (val: string) => void;
  mRight3: string;
  setMRight3: (val: string) => void;
  mLeft4: string;
  setMLeft4: (val: string) => void;
  mRight4: string;
  setMRight4: (val: string) => void;
  
  blankTextWithDots: string;
  setBlankTextWithDots: (val: string) => void;
  blankWordBank: string;
  setBlankWordBank: (val: string) => void;
  blankCorrectAnswers: string;
  setBlankCorrectAnswers: (val: string) => void;
  
  attachedFiles: { name: string; type: string; size?: string }[];
  setAttachedFiles: React.Dispatch<React.SetStateAction<{ name: string; type: string; size?: string }[]>>;
  linkTitle: string;
  setLinkTitle: (val: string) => void;
  linkUrl: string;
  setLinkUrl: (val: string) => void;
  addWebLink: () => void;
  linksList: { title: string; url: string }[];
  setLinksList: React.Dispatch<React.SetStateAction<{ title: string; url: string }[]>>;
  
  handleSaveAttachmentAndLinksAsQuestion: () => void;
  handleSaveAsDraftAssignment: () => void;
  handleCreateAssignment: (e: React.FormEvent) => void;
  SUBJECTS_LIST: string[];
  addAssignment: (assignment: Assignment) => void;
}

export const AssignmentFrames: React.FC<AssignmentFramesProps> = ({
  asTitle,
  setAsTitle,
  asSubject,
  setAsSubject,
  asWeek,
  setAsWeek,
  asStars,
  setAsStars,
  asDesc,
  setAsDesc,
  isListening,
  startVoiceToText,
  criteriaExpanded,
  setCriteriaExpanded,
  shuffle,
  setShuffle,
  must100,
  setMust100,
  onlyOne,
  setOnlyOne,
  timeLimit,
  setTimeLimit,

  // New criteria destructuring with defaults
  oneTimeOnly = false,
  setOneTimeOnly = (_val: boolean) => {},
  multipleTimes = true,
  setMultipleTimes = (_val: boolean) => {},
  shuffleOnRetry = false,
  setShuffleOnRetry = (_val: boolean) => {},
  autoGrade = true,
  setAutoGrade = (_val: boolean) => {},
  autoStarPoints = true,
  setAutoStarPoints = (_val: boolean) => {},
  saveDraftAllowed = true,
  setSaveDraftAllowed = (_val: boolean) => {},
  showAnswersOnSubmit = true,
  setShowAnswersOnSubmit = (_val: boolean) => {},

  limitTimeEnabled = false,
  setLimitTimeEnabled = (_val: boolean) => {},
  limit24h = false,
  setLimit24h = (_val: boolean) => {},
  limit3days = false,
  setLimit3days = (_val: boolean) => {},
  autoLockOnExpiry = false,
  setAutoLockOnExpiry = (_val: boolean) => {},
  notifyParentOnUncompleted = false,
  setNotifyParentOnUncompleted = (_val: boolean) => {},
  earlyCompletionStar = false,
  setEarlyCompletionStar = (_val: boolean) => {},
  lateSubmissionDeductStar = false,
  setLateSubmissionDeductStar = (_val: boolean) => {},
  mustCompleteBeforeNew = false,
  setMustCompleteBeforeNew = (_val: boolean) => {},

  allowedAttemptsCount = 'unlimited',
  setAllowedAttemptsCount = (_val: string) => {},

  startDate = '2026-06-26',
  setStartDate = (_val: string) => {},
  startTime = '19:00',
  setStartTime = (_val: string) => {},
  endDate = '2026-06-28',
  setEndDate = (_val: string) => {},
  endTime = '20:00',
  setEndTime = (_val: string) => {},

  rememberForReview = true,
  setRememberForReview = (_val: boolean) => {},
  stillAllowedAfterExpiry = true,
  setStillAllowedAfterExpiry = (_val: boolean) => {},
  
  essayQText,
  setEssayQText,
  isEssayListening,
  startEssayVoiceToText,
  essayQImages,
  setEssayQImages,
  handleEssayImageUpload,
  handleRemoveEssayImage,
  handleSaveEssayQuestion,

  essayCriteria = '',
  setEssayCriteria = (_val: string) => {},
  essayCriteriaImages = [],
  setEssayCriteriaImages = () => {},
  aiAutoGrade = true,
  setAiAutoGrade = (_val: boolean) => {},
  aiReview = true,
  setAiReview = (_val: boolean) => {},
  aiSuggestions = true,
  setAiSuggestions = (_val: boolean) => {},
  aiImmediateResults = true,
  setAiImmediateResults = (_val: boolean) => {},
  handleCriteriaImageUpload = () => {},
  handleRemoveCriteriaImage = (_idx: number) => {},
  
  questions,
  setQuestions,
  handleAddQuestion,
  downloadCSVTemplate,
  handleImportQuestionsFile,
  tempImportedQuestions,
  setTempImportedQuestions,
  
  qType,
  setQType,
  qText,
  setQText,
  qImages,
  setQImages,
  
  singleOptA,
  setSingleOptA,
  singleOptB,
  setSingleOptB,
  singleOptC,
  setSingleOptC,
  singleOptD,
  setSingleOptD,
  singleCorrect,
  setSingleCorrect,
  
  tfA,
  setTfA,
  tfB,
  setTfB,
  tfC,
  setTfC,
  tfD,
  setTfD,
  tfACorrect,
  setTfACorrect,
  tfBCorrect,
  setTfBCorrect,
  tfCCorrect,
  setTfCCorrect,
  tfDCorrect,
  setTfDCorrect,
  
  mLeft1,
  setMLeft1,
  mRight1,
  setMRight1,
  mLeft2,
  setMLeft2,
  mRight2,
  setMRight2,
  mLeft3,
  setMLeft3,
  mRight3,
  setMRight3,
  mLeft4,
  setMLeft4,
  mRight4,
  setMRight4,
  
  blankTextWithDots,
  setBlankTextWithDots,
  blankWordBank,
  setBlankWordBank,
  blankCorrectAnswers,
  setBlankCorrectAnswers,
  
  attachedFiles,
  setAttachedFiles,
  linkTitle,
  setLinkTitle,
  linkUrl,
  setLinkUrl,
  addWebLink,
  linksList,
  setLinksList,
  
  handleSaveAttachmentAndLinksAsQuestion,
  handleSaveAsDraftAssignment,
  handleCreateAssignment,
  SUBJECTS_LIST,
  addAssignment
}) => {
  return (
    <>
      {/* Unified Assignment Info Header */}
      <div className="col-span-1 lg:col-span-3 bg-white border-2 border-indigo-100 rounded-3xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-black text-indigo-950 flex items-center space-x-2">
            <span className="p-2 bg-indigo-50 rounded-xl text-lg">📝</span>
            <span>THÔNG TIN CHUNG NHIỆM VỤ HỌC TẬP (Áp dụng khi gửi bài)</span>
          </h3>
          <span className="text-[10px] bg-indigo-50 text-indigo-700 font-extrabold px-3 py-1 rounded-full border border-indigo-100">
            Dành Cho Giáo Viên 👩‍🏫
          </span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-slate-500 mb-1">Tên Nhiệm vụ học tập *</label>
            <input
              type="text"
              required
              placeholder="Ví dụ: Ôn tập phép nhân & Viết đoạn văn cuối tuần"
              value={asTitle}
              onChange={e => setAsTitle(e.target.value)}
              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-400 font-bold text-slate-700 bg-white"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">Môn Học (11 Môn)</label>
            <select
              value={asSubject}
              onChange={e => setAsSubject(e.target.value)}
              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-400 font-bold text-slate-700 bg-slate-50"
            >
              {SUBJECTS_LIST.map((subj, idx) => (
                <option key={idx} value={subj}>{subj}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">Tuần học</label>
            <select
              value={asWeek}
              onChange={e => setAsWeek(Number(e.target.value))}
              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-400 font-bold text-slate-700 bg-slate-50"
            >
              {Array.from({ length: 35 }, (_, i) => i + 1).map(wk => (
                <option key={wk} value={wk}>{`Tuần ${wk}`}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-3">
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-slate-500">Lời dặn dò gửi học sinh</label>
              <button
                type="button"
                onClick={startVoiceToText}
                className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                  isListening
                    ? 'bg-rose-500 text-white animate-pulse shadow-xs'
                    : 'bg-sky-50 hover:bg-sky-100 text-sky-600'
                }`}
              >
                <Volume2 className="h-3 w-3" />
                <span>{isListening ? 'Đang ghi âm...' : 'Giọng Nói 🎙️'}</span>
              </button>
            </div>
            <textarea
              rows={2}
              placeholder="Nhập dặn dò từ thầy cô hoặc bấm nút 'Giọng Nói'..."
              value={asDesc}
              onChange={e => setAsDesc(e.target.value)}
              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-400 font-medium"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">Sao Thưởng Hoàn Thành</label>
            <input
              type="number"
              required
              min={1}
              max={100}
              value={asStars}
              onChange={e => setAsStars(Number(e.target.value))}
              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-400 font-bold text-slate-700 bg-white"
            />
          </div>
        </div>

        {/* Criteria Settings (Collapsible) */}
        <div className="border-2 border-indigo-100 rounded-2xl p-4 bg-indigo-50/20 shadow-xs">
          <button
            type="button"
            onClick={() => setCriteriaExpanded(!criteriaExpanded)}
            className="w-full flex items-center justify-between text-xs font-black text-indigo-950 uppercase tracking-wider cursor-pointer"
          >
            <span className="flex items-center space-x-2">
              <span>⚙️</span>
              <span>Cài đặt Tiêu chí chấm điểm & Quy tắc nâng cao</span>
            </span>
            {criteriaExpanded ? <ChevronUp className="h-4 w-4 text-indigo-600" /> : <ChevronDown className="h-4 w-4 text-indigo-600" />}
          </button>
          
          {criteriaExpanded && (
            <div className="mt-4 pt-4 border-t border-indigo-100 space-y-6 text-xs text-slate-700">
              
              {/* Grid 2 Columns for spacious layout */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* COLUMN 1: STANDARD & ADVANCED SETTINGS */}
                <div className="space-y-4">
                  {/* Part 1: Cài đặt tiêu chuẩn */}
                  <div className="bg-white p-4 rounded-xl border border-indigo-50 shadow-xs space-y-2">
                    <h4 className="text-[11px] font-black text-indigo-900 uppercase border-b pb-1 mb-2 flex items-center gap-1">
                      <span>✓</span> 1. Cài đặt tiêu chuẩn
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-bold text-slate-600">
                      <label className="flex items-center space-x-2 cursor-pointer hover:text-slate-900">
                        <input 
                          type="checkbox" 
                          checked={oneTimeOnly} 
                          onChange={e => {
                            setOneTimeOnly(e.target.checked);
                            if (e.target.checked) {
                              setMultipleTimes(false);
                              setAllowedAttemptsCount('1');
                            }
                          }} 
                          className="h-4 w-4 rounded text-indigo-600 border-slate-300 accent-indigo-600 cursor-pointer" 
                        />
                        <span>Chỉ làm 1 lần</span>
                      </label>
                      <label className="flex items-center space-x-2 cursor-pointer hover:text-slate-900">
                        <input 
                          type="checkbox" 
                          checked={multipleTimes} 
                          onChange={e => {
                            setMultipleTimes(e.target.checked);
                            if (e.target.checked) {
                              setOneTimeOnly(false);
                              setAllowedAttemptsCount('unlimited');
                            }
                          }} 
                          className="h-4 w-4 rounded text-indigo-600 border-slate-300 accent-indigo-600 cursor-pointer" 
                        />
                        <span>Được làm nhiều lần</span>
                      </label>
                      <label className="flex items-center space-x-2 cursor-pointer hover:text-slate-900">
                        <input 
                          type="checkbox" 
                          checked={must100} 
                          onChange={e => setMust100(e.target.checked)} 
                          className="h-4 w-4 rounded text-indigo-600 border-slate-300 accent-indigo-600 cursor-pointer" 
                        />
                        <span>Đúng 100% mới nộp</span>
                      </label>
                      <label className="flex items-center space-x-2 cursor-pointer hover:text-slate-900">
                        <input 
                          type="checkbox" 
                          checked={shuffleOnRetry} 
                          onChange={e => setShuffleOnRetry(e.target.checked)} 
                          className="h-4 w-4 rounded text-indigo-600 border-slate-300 accent-indigo-600 cursor-pointer" 
                        />
                        <span>Xáo trộn câu hỏi khi làm lại</span>
                      </label>
                      <label className="flex items-center space-x-2 cursor-pointer hover:text-slate-900">
                        <input 
                          type="checkbox" 
                          checked={autoGrade} 
                          onChange={e => setAutoGrade(e.target.checked)} 
                          className="h-4 w-4 rounded text-indigo-600 border-slate-300 accent-indigo-600 cursor-pointer" 
                        />
                        <span>Tự động chấm điểm</span>
                      </label>
                      <label className="flex items-center space-x-2 cursor-pointer hover:text-slate-900">
                        <input 
                          type="checkbox" 
                          checked={autoStarPoints} 
                          onChange={e => setAutoStarPoints(e.target.checked)} 
                          className="h-4 w-4 rounded text-indigo-600 border-slate-300 accent-indigo-600 cursor-pointer" 
                        />
                        <span>Tự cộng điểm sao</span>
                      </label>
                      <label className="flex items-center space-x-2 cursor-pointer hover:text-slate-900">
                        <input 
                          type="checkbox" 
                          checked={saveDraftAllowed} 
                          onChange={e => setSaveDraftAllowed(e.target.checked)} 
                          className="h-4 w-4 rounded text-indigo-600 border-slate-300 accent-indigo-600 cursor-pointer" 
                        />
                        <span>Lưu nháp</span>
                      </label>
                      <label className="flex items-center space-x-2 cursor-pointer hover:text-slate-900">
                        <input 
                          type="checkbox" 
                          checked={showAnswersOnSubmit} 
                          onChange={e => setShowAnswersOnSubmit(e.target.checked)} 
                          className="h-4 w-4 rounded text-indigo-600 border-slate-300 accent-indigo-600 cursor-pointer" 
                        />
                        <span>Hiển thị đáp án sau nộp</span>
                      </label>
                    </div>
                  </div>

                  {/* Part 2: Quy tắc nâng cao */}
                  <div className="bg-white p-4 rounded-xl border border-indigo-50 shadow-xs space-y-2">
                    <h4 className="text-[11px] font-black text-indigo-900 uppercase border-b pb-1 mb-2 flex items-center gap-1">
                      <span>★</span> 2. Quy tắc nâng cao
                    </h4>
                    <div className="space-y-2 font-bold text-slate-600">
                      <div className="flex flex-wrap items-center gap-4">
                        <label className="flex items-center space-x-2 cursor-pointer hover:text-slate-900">
                          <input 
                            type="checkbox" 
                            checked={limitTimeEnabled} 
                            onChange={e => setLimitTimeEnabled(e.target.checked)} 
                            className="h-4 w-4 rounded text-indigo-600 border-slate-300 accent-indigo-600 cursor-pointer" 
                          />
                          <span>Giới hạn thời gian làm bài</span>
                        </label>
                        {limitTimeEnabled && (
                          <div className="flex items-center space-x-1">
                            <input
                              type="number"
                              min={1}
                              value={timeLimit}
                              onChange={e => setTimeLimit(Number(e.target.value))}
                              className="w-14 p-1 rounded border border-slate-200 text-center font-bold text-slate-700 bg-slate-50"
                            />
                            <span className="text-[10px] text-slate-500">Giờ</span>
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                        <label className="flex items-center space-x-2 cursor-pointer hover:text-slate-900">
                          <input 
                            type="checkbox" 
                            checked={limit24h} 
                            onChange={e => {
                              setLimit24h(e.target.checked);
                              if (e.target.checked) setLimit3days(false);
                            }} 
                            className="h-4 w-4 rounded text-indigo-600 border-slate-300 accent-indigo-600 cursor-pointer" 
                          />
                          <span>Chỉ được làm trong 24 giờ</span>
                        </label>
                        <label className="flex items-center space-x-2 cursor-pointer hover:text-slate-900">
                          <input 
                            type="checkbox" 
                            checked={limit3days} 
                            onChange={e => {
                              setLimit3days(e.target.checked);
                              if (e.target.checked) setLimit24h(false);
                            }} 
                            className="h-4 w-4 rounded text-indigo-600 border-slate-300 accent-indigo-600 cursor-pointer" 
                          />
                          <span>Chỉ được làm trong 3 ngày</span>
                        </label>
                        <label className="flex items-center space-x-2 cursor-pointer hover:text-slate-900">
                          <input 
                            type="checkbox" 
                            checked={autoLockOnExpiry} 
                            onChange={e => setAutoLockOnExpiry(e.target.checked)} 
                            className="h-4 w-4 rounded text-indigo-600 border-slate-300 accent-indigo-600 cursor-pointer" 
                          />
                          <span>Tự động khóa khi hết hạn</span>
                        </label>
                        <label className="flex items-center space-x-2 cursor-pointer hover:text-slate-900">
                          <input 
                            type="checkbox" 
                            checked={notifyParentOnUncompleted} 
                            onChange={e => setNotifyParentOnUncompleted(e.target.checked)} 
                            className="h-4 w-4 rounded text-indigo-600 border-slate-300 accent-indigo-600 cursor-pointer" 
                          />
                          <span>Báo PH khi chưa hoàn thành</span>
                        </label>
                        <label className="flex items-center space-x-2 cursor-pointer hover:text-slate-900">
                          <input 
                            type="checkbox" 
                            checked={earlyCompletionStar} 
                            onChange={e => setEarlyCompletionStar(e.target.checked)} 
                            className="h-4 w-4 rounded text-indigo-600 border-slate-300 accent-indigo-600 cursor-pointer" 
                          />
                          <span>Cộng sao hoàn thành sớm</span>
                        </label>
                        <label className="flex items-center space-x-2 cursor-pointer hover:text-slate-900">
                          <input 
                            type="checkbox" 
                            checked={lateSubmissionDeductStar} 
                            onChange={e => setLateSubmissionDeductStar(e.target.checked)} 
                            className="h-4 w-4 rounded text-indigo-600 border-slate-300 accent-indigo-600 cursor-pointer" 
                          />
                          <span>Trừ sao khi hoàn thành muộn</span>
                        </label>
                        <label className="flex items-center space-x-2 cursor-pointer hover:text-slate-900 col-span-1 sm:col-span-2">
                          <input 
                            type="checkbox" 
                            checked={mustCompleteBeforeNew} 
                            onChange={e => setMustCompleteBeforeNew(e.target.checked)} 
                            className="h-4 w-4 rounded text-indigo-600 border-slate-300 accent-indigo-600 cursor-pointer" 
                          />
                          <span>Bắt buộc làm xong bài này mới làm bài khác</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* COLUMN 2: ATTEMPTS COUNT, DATE & TIME, QUESTION BANK MEMORY */}
                <div className="space-y-4">
                  {/* Part 3: Số lần làm bài tối đa */}
                  <div className="bg-white p-4 rounded-xl border border-indigo-50 shadow-xs space-y-2">
                    <h4 className="text-[11px] font-black text-indigo-900 uppercase border-b pb-1 mb-2 flex items-center gap-1">
                      <span>🔢</span> 3. Số lần làm bài tối đa
                    </h4>
                    <div className="flex flex-wrap items-center gap-3 font-bold text-slate-600">
                      <label className="flex items-center space-x-1.5 cursor-pointer hover:text-indigo-950">
                        <input 
                          type="radio" 
                          name="allowedAttempts" 
                          value="1" 
                          checked={allowedAttemptsCount === '1'} 
                          onChange={() => {
                            setAllowedAttemptsCount('1');
                            setOneTimeOnly(true);
                            setMultipleTimes(false);
                          }} 
                          className="h-4 w-4 accent-indigo-600" 
                        />
                        <span>1 lần</span>
                      </label>
                      <label className="flex items-center space-x-1.5 cursor-pointer hover:text-indigo-950">
                        <input 
                          type="radio" 
                          name="allowedAttempts" 
                          value="2" 
                          checked={allowedAttemptsCount === '2'} 
                          onChange={() => {
                            setAllowedAttemptsCount('2');
                            setOneTimeOnly(false);
                            setMultipleTimes(true);
                          }} 
                          className="h-4 w-4 accent-indigo-600" 
                        />
                        <span>2 lần</span>
                      </label>
                      <label className="flex items-center space-x-1.5 cursor-pointer hover:text-indigo-950">
                        <input 
                          type="radio" 
                          name="allowedAttempts" 
                          value="3" 
                          checked={allowedAttemptsCount === '3'} 
                          onChange={() => {
                            setAllowedAttemptsCount('3');
                            setOneTimeOnly(false);
                            setMultipleTimes(true);
                          }} 
                          className="h-4 w-4 accent-indigo-600" 
                        />
                        <span>3 lần</span>
                      </label>
                      <label className="flex items-center space-x-1.5 cursor-pointer hover:text-indigo-950">
                        <input 
                          type="radio" 
                          name="allowedAttempts" 
                          value="unlimited" 
                          checked={allowedAttemptsCount === 'unlimited'} 
                          onChange={() => {
                            setAllowedAttemptsCount('unlimited');
                            setOneTimeOnly(false);
                            setMultipleTimes(true);
                          }} 
                          className="h-4 w-4 accent-indigo-600" 
                        />
                        <span>Không giới hạn</span>
                      </label>
                    </div>
                  </div>

                  {/* Part 4: Thời gian bắt đầu và kết thúc */}
                  <div className="bg-white p-4 rounded-xl border border-indigo-50 shadow-xs space-y-3">
                    <h4 className="text-[11px] font-black text-indigo-900 uppercase border-b pb-1 mb-1 flex items-center gap-1">
                      <span>📅</span> 4. Thời gian hiệu lực nhiệm vụ
                    </h4>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[9px] font-black text-slate-400 uppercase mb-0.5">Ngày Bắt Đầu</label>
                        <input 
                          type="date" 
                          value={startDate} 
                          onChange={e => setStartDate(e.target.value)} 
                          className="w-full text-xs p-2 rounded-lg border border-slate-200 font-bold text-slate-700 bg-slate-50" 
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-black text-slate-400 uppercase mb-0.5">Giờ Bắt Đầu</label>
                        <input 
                          type="time" 
                          value={startTime} 
                          onChange={e => setStartTime(e.target.value)} 
                          className="w-full text-xs p-2 rounded-lg border border-slate-200 font-bold text-slate-700 bg-slate-50" 
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-black text-slate-400 uppercase mb-0.5">Ngày Kết Thúc</label>
                        <input 
                          type="date" 
                          value={endDate} 
                          onChange={e => setEndDate(e.target.value)} 
                          className="w-full text-xs p-2 rounded-lg border border-slate-200 font-bold text-slate-700 bg-slate-50" 
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-black text-slate-400 uppercase mb-0.5">Giờ Kết Thúc</label>
                        <input 
                          type="time" 
                          value={endTime} 
                          onChange={e => setEndTime(e.target.value)} 
                          className="w-full text-xs p-2 rounded-lg border border-slate-200 font-bold text-slate-700 bg-slate-50" 
                        />
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100">
                      <label className="flex items-center space-x-2 cursor-pointer hover:text-slate-900 font-bold text-slate-600">
                        <input 
                          type="checkbox" 
                          checked={stillAllowedAfterExpiry} 
                          onChange={e => setStillAllowedAfterExpiry(e.target.checked)} 
                          className="h-4 w-4 rounded text-indigo-600 border-slate-300 accent-indigo-600 cursor-pointer" 
                        />
                        <div className="flex flex-col">
                          <span>Vẫn cho phép làm bài sau khi hết hạn</span>
                          <span className="text-[9px] text-rose-500 font-extrabold">(Học sinh nộp muộn sẽ bị thông báo đến phụ huynh)</span>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Part 5: XXI. NGÂN HÀNG CÂU HỎI ÔN TẬP */}
                  <div className="bg-amber-50/55 p-4 rounded-xl border border-amber-200 shadow-xs space-y-2">
                    <h4 className="text-[11px] font-black text-amber-950 uppercase border-b border-amber-200 pb-1 mb-2 flex items-center gap-1">
                      <span>💾</span> XXI. Ngân hàng câu hỏi ôn tập
                    </h4>
                    <label className="flex items-start space-x-2.5 cursor-pointer hover:text-slate-900 font-bold text-slate-700">
                      <input 
                        type="checkbox" 
                        checked={rememberForReview} 
                        onChange={e => setRememberForReview(e.target.checked)} 
                        className="h-4 w-4 mt-0.5 rounded text-amber-600 border-amber-300 accent-amber-500 cursor-pointer" 
                      />
                      <div className="flex flex-col">
                        <span>Ghi nhớ câu hỏi để ôn tập</span>
                        <p className="text-[9px] text-amber-800 font-medium leading-normal mt-0.5">
                          Tự động lưu câu hỏi, đáp án, và nội dung bài vào <strong>Ngân Hàng Ôn Tập</strong> phân loại theo môn học và tuần để ôn luyện sau này.
                        </p>
                      </div>
                    </label>
                  </div>

                </div>

              </div>

            </div>
          )}
        </div>
      </div>

      {/* Khung 1: Bài tập Tự luận */}
      <div className="bg-indigo-50/40 border-2 border-indigo-200 rounded-3xl p-5 shadow-xs space-y-4 relative overflow-hidden flex flex-col justify-between h-full">
        <div className="absolute top-0 right-0 text-3xl opacity-10 select-none pointer-events-none mt-1 mr-2">✍️</div>
        <div className="space-y-4">
          <h3 className="text-xs font-black text-indigo-900 flex items-center justify-between border-b pb-2">
            <span className="flex items-center space-x-1.5">
              <span className="p-1.5 bg-indigo-100 rounded-lg text-sm">✍️</span>
              <span>PHẦN 1: BÀI TẬP TỰ LUẬN</span>
            </span>
            <span className="text-[9px] bg-indigo-100 text-indigo-800 font-extrabold px-2 py-0.5 rounded-full border border-indigo-200">
              Nét chữ nết người
            </span>
          </h3>

          <div className="flex items-center justify-between">
            <label className="block text-[10px] font-black text-slate-500 uppercase">Nội dung câu hỏi tự luận *</label>
            <button
              type="button"
              onClick={startEssayVoiceToText}
              className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                isEssayListening
                  ? 'bg-rose-500 text-white animate-pulse shadow-xs'
                  : 'bg-indigo-100 hover:bg-indigo-200 text-indigo-700'
              }`}
              title="Bấm để nói/đọc nội dung câu hỏi"
            >
              <Volume2 className="h-3 w-3" />
              <span>{isEssayListening ? 'Đọc câu hỏi...' : 'Giọng Nói 🎙️'}</span>
            </button>
          </div>

          <textarea
            rows={4}
            placeholder="Ví dụ: Em hãy viết một đoạn văn ngắn từ 3-5 câu giới thiệu về gia đình em..."
            value={essayQText}
            onChange={e => setEssayQText(e.target.value)}
            className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-400 bg-white font-medium"
          />

          {/* Essay images */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-[10px] font-black text-slate-500 uppercase">Hình ảnh đề bài viết tay hoặc đề vẽ hình ({essayQImages.length})</label>
              <label className="flex items-center space-x-1 px-2.5 py-1 bg-sky-500 hover:bg-sky-600 text-white text-[9px] font-black uppercase rounded-lg transition-all cursor-pointer shadow-xs">
                <Plus className="h-2.5 w-2.5" />
                <span>Thêm ảnh 📷</span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={handleEssayImageUpload}
                />
              </label>
            </div>

            {essayQImages.length > 0 && (
              <div className="flex flex-wrap gap-2 p-2 bg-white rounded-xl border border-indigo-50 max-h-24 overflow-y-auto">
                {essayQImages.map((img, idx) => (
                  <div key={idx} className="relative h-14 w-14 rounded-lg overflow-hidden border border-slate-200 shadow-xs group shrink-0">
                    <img src={img} alt={`essay-q-img-${idx}`} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                    <button
                      type="button"
                      onClick={() => handleRemoveEssayImage(idx)}
                      className="absolute top-0.5 right-0.5 bg-rose-500 text-white hover:bg-rose-600 rounded-full h-4 w-4 flex items-center justify-center text-[8px] font-bold shadow-xs cursor-pointer focus:outline-none"
                      title="Xóa ảnh này"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* New Model Answer / Criteria region */}
          <div className="border-t border-slate-100 pt-4 space-y-3">
            <div>
              <label className="block text-[10px] font-black text-indigo-950 uppercase mb-1">🔑 Đáp án mẫu & Hướng dẫn chấm tự luận</label>
              <textarea
                rows={3}
                placeholder="Nhập đáp án mẫu, các từ khóa/tiêu chí chấm bắt buộc để AI so sánh chính xác..."
                value={essayCriteria}
                onChange={e => setEssayCriteria(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-400 bg-white font-medium"
              />
            </div>

            {/* Criteria images */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-[10px] font-black text-slate-500 uppercase">Hình ảnh sơ đồ, bài giải mẫu ({essayCriteriaImages.length})</label>
                <label className="flex items-center space-x-1 px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-white text-[9px] font-black uppercase rounded-lg transition-all cursor-pointer shadow-xs">
                  <Plus className="h-2.5 w-2.5" />
                  <span>Đính kèm ảnh giải 📷</span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={handleCriteriaImageUpload}
                  />
                </label>
              </div>

              {essayCriteriaImages.length > 0 && (
                <div className="flex flex-wrap gap-2 p-2 bg-white rounded-xl border border-amber-50 max-h-24 overflow-y-auto">
                  {essayCriteriaImages.map((img, idx) => (
                    <div key={idx} className="relative h-14 w-14 rounded-lg overflow-hidden border border-slate-200 shadow-xs group shrink-0">
                      <img src={img} alt={`criteria-img-${idx}`} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                      <button
                        type="button"
                        onClick={() => handleRemoveCriteriaImage(idx)}
                        className="absolute top-0.5 right-0.5 bg-rose-500 text-white hover:bg-rose-600 rounded-full h-4 w-4 flex items-center justify-center text-[8px] font-bold shadow-xs cursor-pointer focus:outline-none"
                        title="Xóa ảnh giải này"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* New AI settings panel */}
          <div className="bg-slate-50 border border-slate-200/65 rounded-2xl p-4 mt-2 space-y-2.5">
            <h5 className="text-[10px] font-black text-slate-700 flex items-center space-x-1 uppercase tracking-wide">
              <span>🤖 CHẾ ĐỘ CẤU HÌNH AI CHẤM BÀI TỰ ĐỘNG</span>
            </h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-bold text-slate-600">
              <label className="flex items-center space-x-2 bg-white p-2 rounded-xl border border-slate-100 hover:border-indigo-300 transition cursor-pointer">
                <input
                  type="checkbox"
                  checked={aiAutoGrade}
                  onChange={e => setAiAutoGrade(e.target.checked)}
                  className="h-4 w-4 text-indigo-600 accent-indigo-500 border-slate-300 rounded focus:ring-0 cursor-pointer"
                />
                <span>Chấm điểm tự động bằng AI</span>
              </label>

              <label className="flex items-center space-x-2 bg-white p-2 rounded-xl border border-slate-100 hover:border-indigo-300 transition cursor-pointer">
                <input
                  type="checkbox"
                  checked={aiReview}
                  onChange={e => setAiReview(e.target.checked)}
                  className="h-4 w-4 text-indigo-600 accent-indigo-500 border-slate-300 rounded focus:ring-0 cursor-pointer"
                />
                <span>AI nhận xét chi tiết ưu khuyết điểm</span>
              </label>

              <label className="flex items-center space-x-2 bg-white p-2 rounded-xl border border-slate-100 hover:border-indigo-300 transition cursor-pointer">
                <input
                  type="checkbox"
                  checked={aiSuggestions}
                  onChange={e => setAiSuggestions(e.target.checked)}
                  className="h-4 w-4 text-indigo-600 accent-indigo-500 border-slate-300 rounded focus:ring-0 cursor-pointer"
                />
                <span>AI gợi ý sửa lỗi sai từng chỗ</span>
              </label>

              <label className="flex items-center space-x-2 bg-white p-2 rounded-xl border border-slate-100 hover:border-indigo-300 transition cursor-pointer">
                <input
                  type="checkbox"
                  checked={aiImmediateResults}
                  onChange={e => setAiImmediateResults(e.target.checked)}
                  className="h-4 w-4 text-indigo-600 accent-indigo-500 border-slate-300 rounded focus:ring-0 cursor-pointer"
                />
                <span>AI trả kết quả ngay khi nộp</span>
              </label>
            </div>
          </div>
        </div>

        {/* Action Buttons for Essay */}
        <div className="space-y-2 pt-4 border-t border-indigo-100 mt-4">
          <button
            type="button"
            onClick={handleSaveEssayQuestion}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-[10px] uppercase rounded-xl transition shadow-xs flex items-center justify-center space-x-1.5 cursor-pointer"
          >
            <Save className="h-3.5 w-3.5" />
            <span>Lưu câu hỏi tự luận vào bộ bài 📥</span>
          </button>
          <button
            type="button"
            onClick={() => {
              if (!asTitle.trim()) {
                alert('Vui lòng nhập tên Nhiệm vụ học tập ở bảng Thông tin chung phía trên trước khi gửi!');
                return;
              }
              if (!essayQText.trim()) {
                alert('Vui lòng nhập câu hỏi tự luận trước khi phát lệnh gửi!');
                return;
              }
              audioSynth.playSuccess();
              const newQuestion: Question = {
                id: `q_essay_${Date.now()}`,
                type: 'essay',
                questionText: essayQText.trim(),
                essayImages: essayQImages
              };
              addAssignment({
                id: `as_${Date.now()}`,
                title: asTitle.trim(),
                description: asDesc.trim(),
                subject: asSubject,
                attachments: [],
                links: [],
                rewardStars: asStars,
                week: asWeek,
                criteria: {
                  shuffleQuestions: shuffle,
                  mustGet100: must100,
                  onlyOneAttempt: onlyOne,
                  timeLimitHours: timeLimit,
                  oneTimeOnly,
                  multipleTimes,
                  shuffleOnRetry,
                  autoGrade,
                  autoStarPoints,
                  saveDraftAllowed,
                  showAnswersOnSubmit,
                  limitTimeEnabled,
                  limit24h,
                  limit3days,
                  autoLockOnExpiry,
                  notifyParentOnUncompleted,
                  earlyCompletionStar,
                  lateSubmissionDeductStar,
                  mustCompleteBeforeNew,
                  allowedAttemptsCount,
                  startDate,
                  startTime,
                  endDate,
                  endTime,
                  rememberForReview,
                  stillAllowedAfterExpiry
                },
                questions: [newQuestion],
                isDraft: false,
                createdAt: new Date().toISOString()
              });
              setEssayQText('');
              setEssayQImages([]);
              alert(`🚀 Đã gửi bài tập Tự luận "${asTitle}" thành công cho học sinh!`);
            }}
            className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-[10px] uppercase rounded-xl transition shadow-sm flex items-center justify-center space-x-1.5 cursor-pointer"
          >
            <Send className="h-3.5 w-3.5 animate-pulse" />
            <span>Gửi nhanh bài tự luận này 🚀</span>
          </button>
        </div>
      </div>

      {/* Khung 2: Bài tập Trắc nghiệm */}
      <div className="bg-amber-50/40 border-2 border-amber-200 rounded-3xl p-5 shadow-xs space-y-4 relative overflow-hidden flex flex-col justify-between h-full">
        <div className="absolute top-0 right-0 text-3xl opacity-10 select-none pointer-events-none mt-1 mr-2">🎯</div>
        <div className="space-y-4">
          <h3 className="text-xs font-black text-amber-950 flex items-center justify-between border-b pb-2">
            <span className="flex items-center space-x-1.5">
              <span className="p-1.5 bg-amber-100 rounded-lg text-sm">🎯</span>
              <span>PHẦN 2: BÀI TẬP TRẮC NGHIỆM</span>
            </span>
            <span className="text-[9px] bg-amber-100 text-amber-800 font-extrabold px-2 py-0.5 rounded-full border border-amber-200">
              Trắc nghiệm sinh động
            </span>
          </h3>

          {/* Import/Download section */}
          <div className="bg-white border border-amber-200 p-3 rounded-2xl space-y-2">
            <div className="flex items-center justify-between text-[10px] font-black text-amber-800 uppercase">
              <span>📥 Nhập/Xuất câu hỏi nhanh</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[9px] font-black">
              <button
                type="button"
                onClick={downloadCSVTemplate}
                className="flex items-center justify-center space-x-1 py-1.5 px-1 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg transition cursor-pointer"
              >
                <Download className="h-2.5 w-2.5" />
                <span>Tải Excel Mẫu 📊</span>
              </button>
              <label className="flex items-center justify-center space-x-1 py-1.5 px-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg cursor-pointer transition">
                <Upload className="h-2.5 w-2.5 animate-bounce" />
                <span>Nạp File Đã Soạn 📤</span>
                <input
                  type="file"
                  accept=".csv,.json"
                  onChange={handleImportQuestionsFile}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Temp Imported Questions Panel */}
          {tempImportedQuestions.length > 0 && (
            <div className="bg-indigo-50 border border-indigo-200 p-2.5 rounded-2xl space-y-2">
              <div className="flex items-center justify-between text-[10px] font-black text-indigo-900">
                <span>ĐÃ ĐỌC {tempImportedQuestions.length} CÂU HỎI THÔ</span>
                <button type="button" onClick={() => setTempImportedQuestions([])} className="text-rose-500 font-bold hover:underline">Hủy</button>
              </div>
              <button
                type="button"
                onClick={() => {
                  setQuestions(prev => [...prev, ...tempImportedQuestions]);
                  setTempImportedQuestions([]);
                  alert(`Đã nhập thành công ${tempImportedQuestions.length} câu hỏi vào bộ câu hỏi! 🚀`);
                }}
                className="w-full py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-[9px] rounded-lg transition"
              >
                XÁC NHẬN LƯU VÀO BỘ BÀI 📥
              </button>
            </div>
          )}

          {/* Question Type Selector */}
          <div className="space-y-2">
            <label className="block text-[10px] font-black text-slate-500 uppercase">Loại câu hỏi trắc nghiệm *</label>
            <div className="flex flex-wrap gap-1 p-1 bg-white border border-slate-200 rounded-xl text-[9px] font-black justify-between">
              <button
                type="button"
                onClick={() => setQType('single_choice')}
                className={`flex-1 py-1 rounded transition whitespace-nowrap ${qType === 'single_choice' ? 'bg-amber-500 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
              >
                1 Đáp án
              </button>
              <button
                type="button"
                onClick={() => setQType('true_false')}
                className={`flex-1 py-1 rounded transition whitespace-nowrap ${qType === 'true_false' ? 'bg-amber-500 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
              >
                Đúng/Sai
              </button>
              <button
                type="button"
                onClick={() => setQType('matching')}
                className={`flex-1 py-1 rounded transition whitespace-nowrap ${qType === 'matching' ? 'bg-amber-500 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
              >
                Nối vế
              </button>
              <button
                type="button"
                onClick={() => setQType('fill_blank')}
                className={`flex-1 py-1 rounded transition whitespace-nowrap ${qType === 'fill_blank' ? 'bg-amber-500 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
              >
                Điền từ
              </button>
            </div>
          </div>

          {/* Question Text */}
          <div>
            <label className="block text-[10px] font-black text-slate-500 mb-1">Nội dung câu hỏi chính *</label>
            <input
              type="text"
              required
              placeholder="Ví dụ: Phép tính 6 x 8 bằng bao nhiêu?"
              value={qText}
              onChange={e => setQText(e.target.value)}
              className="w-full text-xs p-2.5 rounded-xl bg-white border border-slate-200 focus:outline-none focus:border-amber-400 font-medium text-slate-700"
            />
          </div>

          {/* Question Image Attachment block */}
          <div className="bg-amber-100/30 border border-amber-200/50 rounded-2xl p-2.5 space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-[9px] font-black text-amber-900 uppercase">Ảnh minh họa cho câu hỏi ({qImages.length})</label>
              <label className="flex items-center space-x-1 px-2 py-1 bg-amber-500 hover:bg-amber-600 text-white text-[9px] font-black uppercase rounded-lg cursor-pointer transition">
                <Plus className="h-2 w-2" />
                <span>Thêm ảnh</span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const files = e.target.files;
                    if (!files) return;
                    Array.from(files).forEach((file: any) => {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        if (typeof reader.result === 'string') {
                          setQImages(prev => [...prev, reader.result as string]);
                        }
                      };
                      reader.readAsDataURL(file);
                    });
                  }}
                />
              </label>
            </div>

            {qImages.length > 0 && (
              <div className="flex flex-wrap gap-1.5 p-1.5 bg-white rounded-xl border max-h-16 overflow-y-auto">
                {qImages.map((img, idx) => (
                  <div key={idx} className="relative h-10 w-10 rounded overflow-hidden border shrink-0">
                    <img src={img} alt={`q-img-${idx}`} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                    <button
                      type="button"
                      onClick={() => setQImages(prev => prev.filter((_, i) => i !== idx))}
                      className="absolute top-0 right-0 bg-rose-500 text-white rounded-full h-3 w-3 flex items-center justify-center text-[7px] font-bold"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Question Option Fields based on chosen Type */}
          {qType === 'single_choice' && (
            <div className="bg-white p-3 rounded-2xl border border-amber-100 space-y-2 text-xs">
              <span className="font-bold text-amber-800 text-[10px]">🎯 Đáp án tùy chọn:</span>
              <div className="grid grid-cols-2 gap-2">
                <input type="text" placeholder="A. Đáp án" value={singleOptA} onChange={e => setSingleOptA(e.target.value)} className="p-2 border border-slate-200 rounded text-xs bg-slate-50 font-medium" />
                <input type="text" placeholder="B. Đáp án" value={singleOptB} onChange={e => setSingleOptB(e.target.value)} className="p-2 border border-slate-200 rounded text-xs bg-slate-50 font-medium" />
                <input type="text" placeholder="C. Đáp án" value={singleOptC} onChange={e => setSingleOptC(e.target.value)} className="p-2 border border-slate-200 rounded text-xs bg-slate-50 font-medium" />
                <input type="text" placeholder="D. Đáp án" value={singleOptD} onChange={e => setSingleOptD(e.target.value)} className="p-2 border border-slate-200 rounded text-xs bg-slate-50 font-medium" />
              </div>
              <div className="flex items-center space-x-1.5 font-bold pt-1">
                <span className="text-[10px] text-slate-500 uppercase">Đáp án đúng nhất:</span>
                {['A', 'B', 'C', 'D'].map(l => (
                  <button
                    key={l}
                    type="button"
                    onClick={() => setSingleCorrect(l)}
                    className={`px-2 py-1 rounded font-bold border transition ${singleCorrect === l ? 'bg-amber-400 text-white border-amber-500 shadow-xs' : 'bg-slate-50 hover:bg-slate-100 text-slate-600'}`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>
          )}

          {qType === 'true_false' && (
            <div className="bg-white p-3 rounded-2xl border border-amber-100 space-y-1.5 text-xs">
              <span className="font-bold text-emerald-800 text-[10px]">⚖️ Điền nội dung vế và chọn Đúng:</span>
              <div className="space-y-1">
                <div className="flex items-center space-x-1.5 bg-slate-50 p-1 rounded border">
                  <span className="font-bold text-[10px]">A.</span>
                  <input type="text" placeholder="Phép toán vế A" value={tfA} onChange={e => setTfA(e.target.value)} className="flex-1 text-[11px] p-1 bg-white border border-slate-200 rounded focus:outline-none" />
                  <label className="flex items-center space-x-1 cursor-pointer font-bold"><input type="checkbox" checked={tfACorrect} onChange={e => setTfACorrect(e.target.checked)} className="accent-amber-500 h-3.5 w-3.5" /><span>Đúng</span></label>
                </div>
                <div className="flex items-center space-x-1.5 bg-slate-50 p-1 rounded border">
                  <span className="font-bold text-[10px]">B.</span>
                  <input type="text" placeholder="Phép toán vế B" value={tfB} onChange={e => setTfB(e.target.value)} className="flex-1 text-[11px] p-1 bg-white border border-slate-200 rounded focus:outline-none" />
                  <label className="flex items-center space-x-1 cursor-pointer font-bold"><input type="checkbox" checked={tfBCorrect} onChange={e => setTfBCorrect(e.target.checked)} className="accent-amber-500 h-3.5 w-3.5" /><span>Đúng</span></label>
                </div>
                <div className="flex items-center space-x-1.5 bg-slate-50 p-1 rounded border">
                  <span className="font-bold text-[10px]">C.</span>
                  <input type="text" placeholder="Phép toán vế C" value={tfC} onChange={e => setTfC(e.target.value)} className="flex-1 text-[11px] p-1 bg-white border border-slate-200 rounded focus:outline-none" />
                  <label className="flex items-center space-x-1 cursor-pointer font-bold"><input type="checkbox" checked={tfCCorrect} onChange={e => setTfCCorrect(e.target.checked)} className="accent-amber-500 h-3.5 w-3.5" /><span>Đúng</span></label>
                </div>
                <div className="flex items-center space-x-1.5 bg-slate-50 p-1 rounded border">
                  <span className="font-bold text-[10px]">D.</span>
                  <input type="text" placeholder="Phép toán vế D" value={tfD} onChange={e => setTfD(e.target.value)} className="flex-1 text-[11px] p-1 bg-white border border-slate-200 rounded focus:outline-none" />
                  <label className="flex items-center space-x-1 cursor-pointer font-bold"><input type="checkbox" checked={tfDCorrect} onChange={e => setTfDCorrect(e.target.checked)} className="accent-amber-500 h-3.5 w-3.5" /><span>Đúng</span></label>
                </div>
              </div>
            </div>
          )}

          {qType === 'matching' && (
            <div className="bg-white p-3 rounded-2xl border border-amber-100 space-y-1.5 text-xs">
              <span className="font-bold text-purple-800 text-[10px]">🔗 Ghép đôi 2 cột Trái và Phải tương ứng:</span>
              <div className="space-y-1">
                <div className="flex items-center space-x-1">
                  <input type="text" placeholder="Vế trái 1 (vd: 9 x 3)" value={mLeft1} onChange={e => setMLeft1(e.target.value)} className="flex-1 p-1 bg-slate-50 border border-slate-200 rounded text-[11px]" />
                  <span className="text-purple-500 font-bold">↔</span>
                  <input type="text" placeholder="Vế phải 1 (vd: 27)" value={mRight1} onChange={e => setMRight1(e.target.value)} className="flex-1 p-1 bg-slate-50 border border-slate-200 rounded text-[11px]" />
                </div>
                <div className="flex items-center space-x-1">
                  <input type="text" placeholder="Vế trái 2 (vd: 8 x 4)" value={mLeft2} onChange={e => setMLeft2(e.target.value)} className="flex-1 p-1 bg-slate-50 border border-slate-200 rounded text-[11px]" />
                  <span className="text-purple-500 font-bold">↔</span>
                  <input type="text" placeholder="Vế phải 2 (vd: 32)" value={mRight2} onChange={e => setMRight2(e.target.value)} className="flex-1 p-1 bg-slate-50 border border-slate-200 rounded text-[11px]" />
                </div>
                <div className="flex items-center space-x-1">
                  <input type="text" placeholder="Vế trái 3" value={mLeft3} onChange={e => setMLeft3(e.target.value)} className="flex-1 p-1 bg-slate-50 border border-slate-200 rounded text-[11px]" />
                  <span className="text-purple-500 font-bold">↔</span>
                  <input type="text" placeholder="Vế phải 3" value={mRight3} onChange={e => setMRight3(e.target.value)} className="flex-1 p-1 bg-slate-50 border border-slate-200 rounded text-[11px]" />
                </div>
                <div className="flex items-center space-x-1">
                  <input type="text" placeholder="Vế trái 4" value={mLeft4} onChange={e => setMLeft4(e.target.value)} className="flex-1 p-1 bg-slate-50 border border-slate-200 rounded text-[11px]" />
                  <span className="text-purple-500 font-bold">↔</span>
                  <input type="text" placeholder="Vế phải 4" value={mRight4} onChange={e => setMRight4(e.target.value)} className="flex-1 p-1 bg-slate-50 border border-slate-200 rounded text-[11px]" />
                </div>
              </div>
            </div>
          )}

          {qType === 'fill_blank' && (
            <div className="bg-white p-3 rounded-2xl border border-amber-100 space-y-1.5 text-xs">
              <span className="font-bold text-rose-800 text-[10px]">📝 Điền từ vào chỗ trống:</span>
              <input type="text" placeholder="Ví dụ: Bé đi học [đúng giờ] và học bài rất [chăm chỉ]." value={blankTextWithDots} onChange={e => setBlankTextWithDots(e.target.value)} className="w-full p-2 border border-slate-200 rounded text-[11px] font-semibold text-slate-700 bg-slate-50 focus:outline-none" />
              <div className="grid grid-cols-2 gap-1.5 text-[9px]">
                <div>
                  <span className="block text-slate-400 font-bold">NGÂN HÀNG TỪ (phẩy cách):</span>
                  <input type="text" placeholder="đúng giờ, lười biếng, chăm chỉ" value={blankWordBank} onChange={e => setBlankWordBank(e.target.value)} className="w-full p-1.5 bg-slate-50 border rounded font-semibold focus:outline-none" />
                </div>
                <div>
                  <span className="block text-slate-400 font-bold">ĐÁP ÁN ĐÚNG (phẩy cách):</span>
                  <input type="text" placeholder="đúng giờ, chăm chỉ" value={blankCorrectAnswers} onChange={e => setBlankCorrectAnswers(e.target.value)} className="w-full p-1.5 bg-slate-50 border rounded font-semibold focus:outline-none" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons for Quiz */}
        <div className="space-y-2 pt-4 border-t border-amber-100 mt-4">
          <button
            type="button"
            onClick={handleAddQuestion}
            className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-black text-[10px] uppercase rounded-xl transition shadow-xs flex items-center justify-center space-x-1.5 cursor-pointer"
          >
            <Save className="h-3.5 w-3.5" />
            <span>Lưu câu hỏi trắc nghiệm vào bộ bài 📥</span>
          </button>
          <button
            type="button"
            onClick={() => {
              if (!asTitle.trim()) {
                alert('Vui lòng nhập tên Nhiệm vụ học tập ở bảng Thông tin chung phía trên trước khi gửi!');
                return;
              }
              if (!qText.trim()) {
                alert('Vui lòng soạn nội dung câu hỏi trắc nghiệm trước khi phát lệnh gửi!');
                return;
              }
              audioSynth.playSuccess();
              let newQ: Question | null = null;
              const timestamp = Date.now();
              if (qType === 'single_choice') {
                newQ = {
                  id: `q_${timestamp}`,
                  type: 'single_choice',
                  questionText: qText.trim(),
                  options: [singleOptA.trim() || 'A', singleOptB.trim() || 'B', singleOptC.trim() || 'C', singleOptD.trim() || 'D'],
                  correctAnswer: singleCorrect,
                  essayImages: qImages.length > 0 ? qImages : undefined
                };
              } else if (qType === 'true_false') {
                newQ = {
                  id: `q_${timestamp}`,
                  type: 'true_false',
                  questionText: qText.trim(),
                  trueFalseOptions: [
                    { text: tfA.trim() || 'Phép tính A', correct: tfACorrect },
                    { text: tfB.trim() || 'Phép tính B', correct: tfBCorrect },
                    { text: tfC.trim() || 'Phép tính C', correct: tfCCorrect },
                    { text: tfD.trim() || 'Phép tính D', correct: tfDCorrect }
                  ],
                  essayImages: qImages.length > 0 ? qImages : undefined
                };
              } else if (qType === 'matching') {
                const lefts = [mLeft1, mLeft2, mLeft3, mLeft4].map(s => s.trim()).filter(Boolean);
                const rights = [mRight1, mRight2, mRight3, mRight4].map(s => s.trim()).filter(Boolean);
                const pairs: { [key: string]: string } = {};
                if (mLeft1 && mRight1) pairs[mLeft1.trim()] = mRight1.trim();
                if (mLeft2 && mRight2) pairs[mLeft2.trim()] = mRight2.trim();
                if (mLeft3 && mRight3) pairs[mLeft3.trim()] = mRight3.trim();
                if (mLeft4 && mRight4) pairs[mLeft4.trim()] = mRight4.trim();

                newQ = {
                  id: `q_${timestamp}`,
                  type: 'matching',
                  questionText: qText.trim(),
                  matchingLeft: lefts,
                  matchingRight: [...rights].sort(() => Math.random() - 0.5),
                  matchingPairs: pairs,
                  essayImages: qImages.length > 0 ? qImages : undefined
                };
              } else if (qType === 'fill_blank') {
                newQ = {
                  id: `q_${timestamp}`,
                  type: 'fill_blank',
                  questionText: qText.trim(),
                  blanksText: blankTextWithDots.trim(),
                  blankChoices: blankWordBank.split(',').map(s => s.trim()).filter(Boolean),
                  blankAnswers: blankCorrectAnswers.split(',').map(s => s.trim()).filter(Boolean),
                  essayImages: qImages.length > 0 ? qImages : undefined
                };
              }

              if (newQ) {
                addAssignment({
                  id: `as_${timestamp}`,
                  title: asTitle.trim(),
                  description: asDesc.trim(),
                  subject: asSubject,
                  attachments: [],
                  links: [],
                  rewardStars: asStars,
                  week: asWeek,
                  criteria: {
                    shuffleQuestions: shuffle,
                    mustGet100: must100,
                    onlyOneAttempt: onlyOne,
                    timeLimitHours: timeLimit,
                    oneTimeOnly,
                    multipleTimes,
                    shuffleOnRetry,
                    autoGrade,
                    autoStarPoints,
                    saveDraftAllowed,
                    showAnswersOnSubmit,
                    limitTimeEnabled,
                    limit24h,
                    limit3days,
                    autoLockOnExpiry,
                    notifyParentOnUncompleted,
                    earlyCompletionStar,
                    lateSubmissionDeductStar,
                    mustCompleteBeforeNew,
                    allowedAttemptsCount,
                    startDate,
                    startTime,
                    endDate,
                    endTime,
                    rememberForReview,
                    stillAllowedAfterExpiry
                  },
                  questions: [newQ],
                  isDraft: false,
                  createdAt: new Date().toISOString()
                });
                setQText('');
                setQImages([]);
                alert(`🚀 Đã gửi Bài tập Trắc nghiệm "${asTitle}" thành công cho học sinh!`);
              }
            }}
            className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-[10px] uppercase rounded-xl transition shadow-sm flex items-center justify-center space-x-1.5 cursor-pointer"
          >
            <Send className="h-3.5 w-3.5 animate-pulse" />
            <span>Gửi nhanh bài trắc nghiệm này 🚀</span>
          </button>
        </div>
      </div>

      {/* Khung 3: Bài tập Trải nghiệm */}
      <div className="bg-emerald-50/40 border-2 border-emerald-200 rounded-3xl p-5 shadow-xs space-y-4 relative overflow-hidden flex flex-col justify-between h-full">
        <div className="absolute top-0 right-0 text-3xl opacity-10 select-none pointer-events-none mt-1 mr-2">🎒</div>
        <div className="space-y-4">
          <h3 className="text-xs font-black text-emerald-950 flex items-center justify-between border-b pb-2">
            <span className="flex items-center space-x-1.5">
              <span className="p-1.5 bg-emerald-100 rounded-lg text-sm">🎒</span>
              <span>PHẦN 3: BÀI TẬP TRẢI NGHIỆM</span>
            </span>
            <span className="text-[9px] bg-emerald-100 text-emerald-800 font-extrabold px-2 py-0.5 rounded-full border border-emerald-200">
              Thực tế & học liệu bổ trợ
            </span>
          </h3>

          {/* File Upload zone with drag & drop capability */}
          <div className="space-y-1.5">
            <span className="block text-[10px] font-black text-slate-500 uppercase flex items-center space-x-1">
              <Paperclip className="h-3 w-3 text-emerald-600" />
              <span>Đính kèm từ máy tính (Word, Excel, PDF...)</span>
            </span>
            <label className="flex flex-col items-center justify-center w-full py-4 px-3 border border-dashed border-emerald-300 rounded-2xl cursor-pointer bg-white hover:bg-emerald-50/50 hover:border-emerald-500 transition text-center select-none shadow-inner">
              <span className="text-[11px] text-emerald-800 font-black">📁 CHỌN TỆP TỪ THIẾT BỊ 📁</span>
              <span className="text-[8px] text-slate-400 font-medium mt-1">Hỗ trợ Word (.docx), Excel (.xlsx), PDF, file ảnh...</span>
              <input
                type="file"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const sizeMB = (file.size / 1024 / 1024).toFixed(1);
                    const fileType = file.name.split('.').pop() || 'unknown';
                    setAttachedFiles(prev => [...prev, {
                      name: file.name,
                      type: fileType,
                      size: `${sizeMB} MB`
                    }]);
                    audioSynth.playBubblePop();
                  }
                }}
              />
            </label>
            
            {attachedFiles.length > 0 && (
              <div className="space-y-1 max-h-24 overflow-y-auto pt-1">
                {attachedFiles.map((f, i) => (
                  <div key={i} className="flex items-center justify-between text-[10px] bg-white px-2.5 py-1.5 border border-emerald-150 rounded-xl font-bold shadow-xs">
                    <span className="truncate max-w-[170px] text-emerald-900" title={f.name}>📄 {f.name}</span>
                    <div className="flex items-center space-x-2 shrink-0">
                      <span className="text-[8px] text-slate-400 font-mono">{f.size}</span>
                      <button
                        type="button"
                        onClick={() => {
                          audioSynth.playBubblePop();
                          setAttachedFiles(prev => prev.filter((_, idx) => idx !== i));
                        }}
                        className="text-rose-500 hover:text-rose-700 font-bold"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Supplementary Links */}
          <div className="space-y-1.5 pt-2 border-t border-emerald-100/50">
            <span className="block text-[10px] font-black text-slate-500 uppercase flex items-center space-x-1">
              <LinkIcon className="h-3 w-3 text-emerald-600" />
              <span>Đường link bổ trợ học tập (Video, Học liệu số...)</span>
            </span>
            
            <div className="space-y-1.5 bg-white p-2.5 rounded-2xl border border-emerald-100">
              <input
                type="text"
                placeholder="Tên liên kết (vd: Video hướng dẫn làm bài tập)"
                value={linkTitle}
                onChange={e => setLinkTitle(e.target.value)}
                className="w-full text-xs p-1.5 rounded bg-slate-50 border border-slate-200 focus:outline-none focus:border-emerald-400 font-medium text-slate-700"
              />
              <input
                type="text"
                placeholder="Địa chỉ URL liên kết (https://...)"
                value={linkUrl}
                onChange={e => setLinkUrl(e.target.value)}
                className="w-full text-xs p-1.5 rounded bg-slate-50 border border-slate-200 focus:outline-none focus:border-emerald-400 font-medium text-slate-700"
              />
              
              <div className="flex flex-wrap gap-1 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setLinkTitle('Kênh bài giảng Youtube 📺');
                    setLinkUrl('https://youtube.com');
                    audioSynth.playBubblePop();
                  }}
                  className="text-[8px] bg-rose-50 text-rose-600 px-1.5 py-0.5 rounded border border-rose-100 font-bold hover:bg-rose-100"
                >
                  + YouTube
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setLinkTitle('Học Liệu Số Việt Nam 🌐');
                    setLinkUrl('https://vietnamdoc.com');
                    audioSynth.playBubblePop();
                  }}
                  className="text-[8px] bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded border border-emerald-100 font-bold hover:bg-emerald-100"
                >
                  + Học Liệu
                </button>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (!linkTitle.trim() || !linkUrl.trim()) return;
                  addWebLink();
                }}
                className="w-full mt-1.5 py-1 text-[10px] bg-emerald-100 hover:bg-emerald-200 text-emerald-950 font-black rounded-lg transition"
              >
                + Thêm Đường Link Bổ Trợ
              </button>
            </div>

            {linksList.length > 0 && (
              <div className="space-y-1 max-h-24 overflow-y-auto pt-1">
                {linksList.map((l, i) => (
                  <div key={i} className="flex items-center justify-between text-[10px] bg-white px-2 py-1 border border-emerald-100 rounded-xl font-bold shadow-xs">
                    <span className="truncate max-w-[170px] text-sky-800">🔗 {l.title}</span>
                    <button
                      type="button"
                      onClick={() => {
                        audioSynth.playBubblePop();
                        setLinksList(prev => prev.filter((_, idx) => idx !== i));
                      }}
                      className="text-rose-500 font-bold"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons for Experiential Assignment */}
        <div className="space-y-2 pt-4 border-t border-emerald-100 mt-4">
          <button
            type="button"
            onClick={handleSaveAttachmentAndLinksAsQuestion}
            className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-black text-[10px] uppercase rounded-xl transition shadow-xs flex items-center justify-center space-x-1.5 cursor-pointer"
          >
            <Save className="h-3.5 w-3.5" />
            <span>Lưu tài liệu trải nghiệm vào bộ bài 📥</span>
          </button>
          <button
            type="button"
            onClick={() => {
              if (!asTitle.trim()) {
                alert('Vui lòng nhập tên Nhiệm vụ học tập ở bảng Thông tin chung phía trên trước khi gửi!');
                return;
              }
              if (attachedFiles.length === 0 && linksList.length === 0) {
                alert('Vui lòng đính kèm ít nhất 1 tệp hoặc 1 đường link bổ trợ trước khi phát lệnh gửi!');
                return;
              }
              audioSynth.playSuccess();
              
              const attachedNames = attachedFiles.map(f => f.name).join(', ');
              const linkNames = linksList.map(l => l.title).join(', ');
              let descriptionText = 'Học sinh hãy nghiên cứu tài liệu trải nghiệm thực tế';
              if (attachedNames) {
                descriptionText += ` [${attachedNames}]`;
              }
              if (linkNames) {
                descriptionText += ` và các liên kết bổ trợ [${linkNames}]`;
              }
              descriptionText += ' để hoàn thành tốt nhiệm vụ này nhé!';

              const placeholderQ: Question = {
                id: `q_experiential_${Date.now()}`,
                type: 'single_choice',
                questionText: descriptionText,
                options: ['Em đã đọc kỹ tài liệu và hoàn thành nhiệm vụ thực hành ✅', 'Con cần thầy cô hỗ trợ thêm 💬'],
                correctAnswer: 'A'
              };

              addAssignment({
                id: `as_${Date.now()}`,
                title: asTitle.trim(),
                description: asDesc.trim(),
                subject: asSubject,
                attachments: attachedFiles,
                links: linksList,
                rewardStars: asStars,
                week: asWeek,
                criteria: {
                  shuffleQuestions: shuffle,
                  mustGet100: must100,
                  onlyOneAttempt: onlyOne,
                  timeLimitHours: timeLimit,
                  oneTimeOnly,
                  multipleTimes,
                  shuffleOnRetry,
                  autoGrade,
                  autoStarPoints,
                  saveDraftAllowed,
                  showAnswersOnSubmit,
                  limitTimeEnabled,
                  limit24h,
                  limit3days,
                  autoLockOnExpiry,
                  notifyParentOnUncompleted,
                  earlyCompletionStar,
                  lateSubmissionDeductStar,
                  mustCompleteBeforeNew,
                  allowedAttemptsCount,
                  startDate,
                  startTime,
                  endDate,
                  endTime,
                  rememberForReview,
                  stillAllowedAfterExpiry
                },
                questions: [placeholderQ],
                isDraft: false,
                createdAt: new Date().toISOString()
              });
              setAttachedFiles([]);
              setLinksList([]);
              alert(`🚀 Đã gửi Bài tập Trải nghiệm "${asTitle}" kèm học liệu file & links thành công cho học sinh!`);
            }}
            className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-[10px] uppercase rounded-xl transition shadow-sm flex items-center justify-center space-x-1.5 cursor-pointer"
          >
            <Send className="h-3.5 w-3.5 animate-pulse" />
            <span>Gửi nhanh bài trải nghiệm này 🚀</span>
          </button>
        </div>
      </div>

      {/* Khung 4: Danh sách câu hỏi đã soạn */}
      <div className="col-span-1 lg:col-span-3 bg-slate-50 border-2 border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-3 gap-3">
          <h3 className="text-xs font-black text-slate-800 flex items-center space-x-2">
            <span className="p-2 bg-slate-100 rounded-xl text-sm">📋</span>
            <span>PHẦN 4: DANH SÁCH CÂU HỎI ĐÃ SOẠN ({questions.length})</span>
          </h3>
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => {
                if (questions.length === 0) return;
                audioSynth.playBubblePop();
                setQuestions([]);
                alert('Đã xóa sạch bộ câu hỏi đang soạn thảo.');
              }}
              className="text-[10px] text-rose-500 hover:text-rose-700 bg-white hover:bg-rose-50 px-3 py-1.5 rounded-xl border border-rose-150 font-extrabold transition-all duration-200 cursor-pointer"
            >
              Clear bộ câu hỏi ✕
            </button>
          </div>
        </div>

        {questions.length === 0 ? (
          <div className="text-center p-10 bg-white border-2 border-dashed border-slate-200 rounded-2xl italic space-y-2">
            <p className="text-3xl">📭</p>
            <p className="text-xs text-slate-400 font-bold">Chưa có câu hỏi nào trong bộ soạn thảo.</p>
            <p className="text-[10px] text-slate-400">Thầy cô hãy thêm câu hỏi từ Phần 1, Phần 2, hoặc Phần 3 ở trên nhé! 🧸</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[350px] overflow-y-auto pr-1">
            {questions.map((q, idx) => (
              <div key={q.id} className="p-4 bg-white border-2 border-slate-100 rounded-2xl flex items-start justify-between text-xs font-medium shadow-xs transition hover:scale-[1.01]">
                <div className="space-y-1.5">
                  <span className="font-extrabold text-[10px] text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-150 uppercase">
                    Câu {idx + 1}: {
                      q.type === 'essay' ? '✍️ Tự luận' :
                      q.type === 'single_choice' ? '🎯 Trắc nghiệm' :
                      q.type === 'true_false' ? '⚖️ Đúng/Sai' :
                      q.type === 'matching' ? '🔗 Nối vế' : '📝 Điền từ'
                    }
                  </span>
                  <p className="text-slate-800 font-extrabold leading-relaxed">{q.questionText}</p>
                  {q.type === 'fill_blank' && (
                    <p className="text-[10px] text-indigo-600 italic font-bold">"{q.blanksText}"</p>
                  )}
                  {(q.qImages?.length || 0) > 0 && (
                    <span className="inline-block text-[8px] bg-sky-50 text-sky-600 px-1.5 py-0.5 rounded font-black border border-sky-100 uppercase">📷 Có {q.qImages?.length} ảnh</span>
                  )}
                </div>
                <button
                  onClick={() => {
                    audioSynth.playBubblePop();
                    setQuestions(prev => prev.filter(item => item.id !== q.id));
                  }}
                  className="text-rose-500 hover:text-rose-700 font-bold bg-slate-50 hover:bg-rose-50 border border-slate-200 px-2.5 py-1 rounded-xl transition duration-200 shrink-0 ml-3"
                >
                  Xoá ✕
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Master send button at the bottom of Part 4 */}
        <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border">
          <div>
            <h4 className="font-black text-xs text-slate-800">PHÁT LỆNH GỬI BỘ BÀI TẬP CHÍNH THỨC 🚀</h4>
            <p className="text-[10px] text-slate-400 font-bold mt-0.5">Tập hợp toàn bộ {questions.length} câu đã soạn thành 1 bài tập hoàn chỉnh gửi cho học sinh.</p>
          </div>
          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleSaveAsDraftAssignment}
              className="flex-1 sm:flex-none px-4 py-2.5 bg-slate-100 hover:bg-slate-200 border text-slate-700 font-black text-xs rounded-xl transition cursor-pointer"
            >
              Lưu nháp 💾
            </button>
            <button
              type="button"
              onClick={handleCreateAssignment}
              className="flex-1 sm:flex-none px-6 py-2.5 bg-sky-500 hover:bg-sky-600 text-white font-black text-xs rounded-xl transition shadow-md shadow-sky-500/20 cursor-pointer flex items-center justify-center space-x-1.5"
            >
              <Send className="h-4 w-4" />
              <span>GỬI CHO CẢ LỚP ({questions.length} CÂU) 🚀</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
