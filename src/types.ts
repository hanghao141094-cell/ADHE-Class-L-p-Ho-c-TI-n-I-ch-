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

export type QuestionType = 'single_choice' | 'true_false' | 'matching' | 'fill_blank';

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
}

export interface Assignment {
  id: string;
  title: string;
  description: string;
  subject: string;
  attachments: { name: string; type: string; size?: string }[];
  links: { title: string; url: string }[];
  rewardStars: number;
  criteria: {
    shuffleQuestions: boolean;
    mustGet100: boolean;
    onlyOneAttempt: boolean;
    timeLimitHours: number;
  };
  questions: Question[];
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
  answers: { [questionId: string]: any }; // student answers per question
  attemptsCount: number;
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
  createdAt: string;
}

export interface RewardRule {
  id: string;
  name: string;
  points: number;
  type: 'plus' | 'minus'; // plus for stars, minus for violations
}

export interface SystemSettings {
  starToFlagRatio: number; // 50 sao = 1 cờ
  flagToGoldRatio: number; // 10 cờ = 1 thẻ vàng
  rewardRules: RewardRule[];
  violationsList: string[];
}
