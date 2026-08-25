export type DifficultyLevel = 'NHẬN BIẾT' | 'THÔNG HIỂU' | 'VẬN DỤNG' | 'VẬN DỤNG CAO';

export type QuestionType = 
  | 'MULTIPLE_CHOICE' 
  | 'TRUE_FALSE' 
  | 'NUMERICAL_INPUT' 
  | 'GRAPH_ANALYSIS' 
  | 'CASE_STUDY';

export type ErrorClassification = 
  | 'Sai kiến thức'
  | 'Sai công thức'
  | 'Sai mô hình hiện tượng'
  | 'Sai toán học'
  | 'Sai kỹ năng đọc đề'
  | 'Sai do cẩu thả'
  | 'Không làm được';

export type CompetencyGroup = 
  | 'Nhóm A' // < 7.0 (Cần bù nền)
  | 'Nhóm B' // 7.0 - 7.75 (Củng cố kỹ năng biến đổi)
  | 'Nhóm C' // 8.0 - 8.75 (Luyện tập bài vận dụng)
  | 'Nhóm D'; // >= 9.0 (Bồi dưỡng nâng cao)

export interface Question {
  id: string;
  chapterId: number;
  lessonId: number;
  topic: string;
  level: DifficultyLevel;
  type: QuestionType;
  prompt: string;
  options?: string[];
  correctAnswer: string | number | boolean;
  explanation: string;
  relatedKnowledge: string;
  commonErrorCategory: ErrorClassification;
  remedialHint: string;
  formulaLatex?: string;
  graphData?: any;
}

export interface LessonContentStep {
  stepNumber: string;
  title: string;
  subtitle?: string;
  content: string; // Markdown / text
  latexFormulas?: string[];
  interactiveComponent?: string; // e.g. 'SIMULATION_SPRING', 'GRAPH_VT', etc.
  question?: Question;
  observationPoints?: string[];
  notes?: string[];
}

export interface Lesson {
  id: number;
  chapterId: number;
  lessonNumber: number;
  title: string;
  shortDescription: string;
  scientificIcon: string;
  durationMinutes: number;
  status: 'Chưa học' | 'Đang học' | 'Hoàn thành';
  steps: LessonContentStep[];
  keyFormulas: {
    name: string;
    latex: string;
    description: string;
    units: string;
    conditions: string;
  }[];
}

export interface Chapter {
  id: number;
  title: string;
  romanNumeral: string;
  description: string;
  lessons: Lesson[];
  keyThemes: string[];
  totalQuestions: number;
}

export interface SimulationItem {
  id: string;
  title: string;
  chapterId: number;
  category: 'ĐỘNG HỌC' | 'ĐỘNG LỰC HỌC' | 'NĂNG LƯỢNG' | 'ĐỘNG LƯỢNG' | 'CHUYỂN ĐỘNG TRÒN' | 'BIẾN DẠNG & ÁP SUẤT' | 'CÂN BẰNG';
  description: string;
  controls: {
    name: string;
    label: string;
    min: number;
    max: number;
    step: number;
    defaultValue: number;
    unit: string;
  }[];
  outputs: {
    key: string;
    label: string;
    unit: string;
    latex?: string;
  }[];
}

export interface VirtualLabExperiment {
  id: string;
  lessonId: number;
  title: string;
  objective: string;
  tools: string[];
  setupGuide: string[];
  procedure: string[];
  variables: {
    name: string;
    symbol: string;
    unit: string;
    defaultValue: number;
    min: number;
    max: number;
    step: number;
  }[];
  defaultDataRows: Array<Record<string, number | string>>;
  analysisPrompts: string[];
  conclusionSummary: string;
}

export interface RealLifePhysicsItem {
  id: string;
  title: string;
  phenomenon: string;
  physicsExplanation: string;
  relatedKnowledge: string;
  challengeQuestion: string;
  challengeAnswer: string;
  category: string;
  tag: string;
}

export interface LearningResource {
  id: string;
  title: string;
  type: 'PDF' | 'INFOGRAPHIC' | 'VIDEO' | 'WORKSHEET' | 'SUMMARY_TABLE';
  chapterId: number;
  lessonId?: number;
  description: string;
  tags: string[];
  downloadUrl?: string;
}

export interface StudentProfile {
  fullName: string;
  gradeClass: string;
  enrolledAt: string;
  totalStudyTimeMinutes: number;
  completedLessons: number[];
  completedQuestions: Record<string, {
    chosenAnswer: string | number | boolean;
    isCorrect: boolean;
    timestamp: number;
    timeSpentSeconds: number;
    errorGroup?: ErrorClassification;
  }>;
  scores: {
    quizId: string;
    score: number;
    date: string;
  }[];
  earnedBadges: {
    id: string;
    title: string;
    icon: string;
    description: string;
    unlockedAt?: string;
  }[];
}

export interface Classroom {
  id: string;
  name: string;
  grade: string;
  studentsCount: number;
  averageScore: number;
  completionRate: number;
  students: {
    id: string;
    name: string;
    score: number;
    competencyGroup: CompetencyGroup;
    errorBreakdown: Record<ErrorClassification, number>;
    completedLessons: number;
    totalQuestionsDone: number;
  }[];
}

export interface AIContext {
  chapterTitle?: string;
  lessonTitle?: string;
  lessonNumber?: number;
  lessonId?: number;
  page?: number;
  section?: string;
  questionId?: string;
  questionTitle?: string;
  prompt?: string;
  options?: string[];
  userAnswer?: string;
  correctAnswer?: string;
  formulas?: string[];
  formula?: string;
  summary?: string;
  frameOfReference?: string;
  stepByStepSolution?: string[];
  finalAnswer?: string;
  pedagogicalNote?: string;
  targetCompetencyGroup?: string;
  errorWarning?: string;
  commonErrorCategory?: string;
  customPrompt?: string;
  targetMode?: 'GIẢI THÍCH' | 'GỢI Ý' | 'GIA SƯ SOCRATIC' | 'KIỂM TRA' | 'HƯỚNG DẪN CHI TIẾT' | 'CHẨN ĐOÁN LỖI SAI';
}
