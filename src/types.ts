/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'teacher' | 'student' | 'parent';

export interface User {
  id: string;
  name: string;
  avatar: string;
  role: UserRole;
  studentId?: string; // For parents, links to their child. For students, links to their student profile.
}

export interface Student {
  id: string;
  name: string;
  avatar: string;
  parentName: string;
  parentPhone: string;
  stars: number;
  flags: number;
  goldCards: number;
  rank?: number;
  birthDate?: string;
  gender?: 'nam' | 'nữ' | string;
  password?: string;
  parentPassword?: string;
  studentCode?: string;
  isActive?: boolean;
  isTeacherClass?: boolean;
  isStudentSelect?: boolean;
}

export interface Attendance {
  id: string; // date_studentId
  date: string; // YYYY-MM-DD
  studentId: string;
  isAbsent: boolean;
  notes?: string;
}

export interface Violation {
  id: string;
  studentId: string;
  studentName: string;
  violationType: string;
  message: string;
  isResolved: boolean; // hides when parent responds
  parentResponse?: string;
  createdAt: string;
}

export type QuestionType = 'single_choice' | 'true_false' | 'matching' | 'fill_blank' | 'essay';

export interface Question {
  id: string;
  type: QuestionType;
  questionText: string;
  // For single_choice
  options?: string[]; // A, B, C, D
  correctAnswer?: string; // A, B, C, D
  // For true_false
  trueFalseOptions?: { text: string; correct: boolean }[]; // e.g., A, B, C, D with their T/F statuses
  // For matching
  matchingLeft?: string[];
  matchingRight?: string[];
  matchingPairs?: { [key: string]: string }; // left_text -> right_text mapping
  // For fill_blank
  blanksText?: string; // text with "..." markers
  blankChoices?: string[]; // list of words that can fit
  blankAnswers?: string[]; // list of correct words in order of "..."
  // For essay
  essayImages?: string[]; // base64 image strings
  criteria?: string; // Model answer / grading criteria text
  criteriaImages?: string[]; // Model answer / reference images (base64)
  aiAutoGrade?: boolean; // Auto-grade with AI
  aiReview?: boolean; // AI comments / feedback
  aiSuggestions?: boolean; // AI suggestions for error fixing
  aiImmediateResults?: boolean; // Return results immediately on submission
}

export interface Assignment {
  id: string;
  title: string;
  description: string;
  subject: string;
  attachments: { name: string; type: string; size?: string }[];
  links: { title: string; url: string }[];
  rewardStars: number;
  week?: number; // week 1 to 35
  grade?: string; // e.g. 'Lớp 3'
  difficulty?: string; // e.g. 'Thông hiểu'
  criteria: {
    shuffleQuestions: boolean;
    mustGet100: boolean;
    onlyOneAttempt: boolean;
    timeLimitHours: number;
    allowMultipleAttempts?: boolean;
    oneTimeOnly?: boolean;
    multipleTimes?: boolean;
    shuffleOnRetry?: boolean;
    autoGrade?: boolean;
    autoStarPoints?: boolean;
    saveDraftAllowed?: boolean;
    showAnswersOnSubmit?: boolean;
    limitTimeEnabled?: boolean;
    limit24h?: boolean;
    limit3days?: boolean;
    autoLockOnExpiry?: boolean;
    notifyParentOnUncompleted?: boolean;
    earlyCompletionStar?: boolean;
    lateSubmissionDeductStar?: boolean;
    mustCompleteBeforeNew?: boolean;
    allowedAttemptsCount?: '1' | '2' | '3' | 'unlimited';
    startDate?: string;
    startTime?: string;
    endDate?: string;
    endTime?: string;
    rememberForReview?: boolean;
    stillAllowedAfterExpiry?: boolean;
  };
  questions: Question[];
  isDraft?: boolean;
  createdAt: string;
}

export interface Submission {
  id: string; // studentId_assignmentId
  assignmentId: string;
  studentId: string;
  studentName: string;
  status: 'draft' | 'submitted';
  score: number; // calculated rating or star outcome
  correctCount: number;
  totalQuestions: number;
  timeSpentSeconds: number;
  submittedAt: string;
  answers: { [questionId: string]: any }; // student answers per question (e.g. { text: string, images: string[] })
  attemptsCount: number;
  aiGradedFeedback?: {
    [questionId: string]: {
      score: number;
      maxScore: number;
      correctAnswers: string[];
      incorrectAnswers: string[];
      comments: string;
      suggestions: string;
      learningAdvice: string;
      gradedAt: string;
      chatHistory?: { role: 'user' | 'model'; text: string }[];
    };
  };
  isParentSeen?: boolean;
  parentSeenAt?: string;
  isStudentSeen?: boolean;
  studentSeenAt?: string;
  feedbackMessage?: string;
}

export interface Feedback {
  id: string;
  parentId: string;
  parentName: string;
  studentId: string;
  studentName: string;
  message: string;
  isDraft: boolean;
  reply?: string;
  isRead?: boolean;
  createdAt: string;
}

export interface RewardRule {
  id: string;
  name: string;
  points: number;
  type: 'plus' | 'minus'; // plus for stars, minus for violations
}

export interface BoardBanner {
  id: string;
  type: 'image' | 'video';
  url: string;
  title: string;
  description: string;
  bgClass?: string;
  duration?: number; // duration in seconds
  note?: string; // custom note or caption about the image/video
  isDraft?: boolean;
  targetStudentIds?: string[];
}

export interface SystemSettings {
  starToFlagRatio: number; // 50 sao = 1 cờ
  flagToGoldRatio: number; // 10 cờ = 1 thẻ vàng
  rewardRules: RewardRule[];
  violationsList: string[];
  banners: BoardBanner[];
  parentFeedbackCount?: number; // e.g., parent responds 3 times
  parentFeedbackRewardStars?: number; // gets 5 stars
  defaultPassword?: string;
  allowChangePassword?: boolean;
}

export interface ZaloNotification {
  id: string;
  recipientName: string;
  phoneNumber: string;
  message: string;
  timestamp: string;
  type: 'password_change' | 'parent_reminder' | 'teacher_alert';
}

export interface SavedAccount {
  username: string;
  role: UserRole;
  passwordEncrypted: string;
  rememberMe: boolean;
  autoLogin: boolean;
  lastLoginTime: string;
  avatar?: string;
  studentId?: string;
  // Biometrics and security configurations
  pinEnabled?: boolean;
  pinCode?: string; // 4 digits
  fingerprintEnabled?: boolean;
  faceIdEnabled?: boolean;
}

export interface LoginHistoryEntry {
  id: string;
  username: string;
  role: UserRole;
  loginTime: string;
  device: string;
}
