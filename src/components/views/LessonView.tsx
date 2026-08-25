import React, { useState } from 'react';
import { 
  BookOpen, 
  Sparkles, 
  HelpCircle, 
  CheckCircle2, 
  ChevronLeft, 
  ChevronRight, 
  Activity,
  FileText,
  Clock,
  Bot,
  Compass,
  CheckSquare,
  Film
} from 'lucide-react';
import { Lesson, Chapter } from '../../types/physics';
import { MathFormula } from '../MathFormula';
import { KinematicsMotionSim } from '../simulations/KinematicsMotionSim';
import { NewtonSecondLawSim } from '../simulations/NewtonSecondLawSim';
import { ForceVectorsSim } from '../simulations/ForceVectorsSim';
import { EnergyConservationSim } from '../simulations/EnergyConservationSim';
import { CircularMotionSim } from '../simulations/CircularMotionSim';
import { MomentumCollisionSim } from '../simulations/MomentumCollisionSim';
import { VirtualPhysicsLab } from '../labs/VirtualPhysicsLab';
import { ProjectileMotionLab } from '../labs/ProjectileMotionLab';
import { Lesson1Detail } from '../lessons/Lesson1Detail';
import { LessonUniversalDetail } from '../lessons/LessonUniversalDetail';
import { LessonSgkSolutions } from '../lessons/LessonSgkSolutions';
import { VoicePhysicsTutor } from '../voice/VoicePhysicsTutor';
import { RealLifeView } from './RealLifeView';
import { LessonVideoLab } from '../lessons/LessonVideoLab';
import { ActiveTab } from '../layout/Navbar';
import { InlinePhysicsText } from '../ui/FormattedPhysicsText';
import { getChapterTheme } from '../ui/BorderBeam';

interface LessonViewProps {
  lesson: Lesson;
  chapter: Chapter;
  onToggleComplete: (lessonId: number) => void;
  isCompleted: boolean;
  onSelectLesson: (lessonId: number) => void;
  onNavigateTab?: (tab: ActiveTab) => void;
}

export const LessonView: React.FC<LessonViewProps> = ({
  lesson,
  chapter,
  onToggleComplete,
  isCompleted,
  onSelectLesson,
  onNavigateTab,
}) => {
  // 0: Nội dung bài học, 1: Hỏi Đáp & Lời Giải SGK, 2: Mô Phỏng 60 FPS, 3: Video Mô Phỏng, 4: Luyện Tập, 5: Gia Sư Socratic AI, 6: Ứng Dụng Thực Tế
  const [activeSubTab, setActiveSubTab] = useState<number>(0);
  const [showAnswerExplanation, setShowAnswerExplanation] = useState<boolean>(false);

  const chapterTheme = getChapterTheme(chapter.id);

  // Render appropriate interactive simulation based on lesson ID or simulationType
  const renderSimulationComponent = () => {
    if ([4, 5, 7, 8, 9].includes(lesson.id) || (lesson as any).simulationType === 'KINEMATICS_MOTION') {
      return <KinematicsMotionSim />;
    }

    if (lesson.id === 12 || (lesson as any).simulationType === 'PROJECTILE_MOTION') {
      return <ProjectileMotionLab />;
    }

    switch ((lesson as any).simulationType) {
      case 'PROJECTILE_MOTION':
        return <ProjectileMotionLab />;
      case 'KINEMATICS_MOTION':
        return <KinematicsMotionSim />;
      case 'NEWTON_SECOND_LAW':
        return <NewtonSecondLawSim />;
      case 'FORCE_ADDITION':
        return <ForceVectorsSim />;
      case 'ENERGY_CONSERVATION':
        return <EnergyConservationSim />;
      case 'CIRCULAR_MOTION':
        return <CircularMotionSim />;
      case 'MOMENTUM_COLLISION':
        return <MomentumCollisionSim />;
      default:
        if (lesson.id === 6) {
          return <VirtualPhysicsLab initialLabId="LAB_BAI_6" />;
        }
        if (lesson.id === 11) {
          return <VirtualPhysicsLab initialLabId="LAB_BAI_11" />;
        }
        if (lesson.id === 3) {
          return <VirtualPhysicsLab initialLabId="LAB_BAI_3" />;
        }
        if (lesson.id === 22) {
          return <VirtualPhysicsLab initialLabId="LAB_BAI_22" />;
        }
        if (lesson.id === 30) {
          return <VirtualPhysicsLab initialLabId="LAB_BAI_30" />;
        }
        if (lesson.chapterId === 2) {
          return <KinematicsMotionSim />;
        }
        return <NewtonSecondLawSim />;
    }
  };

  // Approximate page numbers for SGK Vật lí 10 Kết Nối Tri Thức
  const sgkPage = (lesson.id * 4) + 3;

  return (
    <div id={`lesson-view-${lesson.id}`} className="space-y-6">
      {/* Compact Hero Header Card with Gentle Ambient Neon Glow */}
      <div 
        className="relative rounded-3xl bg-[#040B1A]/95 px-5 py-4 sm:px-7 sm:py-4.5 backdrop-blur-2xl space-y-3 sm:space-y-3.5 transition-all duration-500 glitter-sparkle-card border-2"
        style={{
          ['--chapter-primary' as string]: chapterTheme.primary,
          borderColor: chapterTheme.primary,
        }}
      >
        {/* Top Meta Bar (Compact) */}
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-2.5">
          {/* Chapter & Page Tags */}
          <div className="flex items-center gap-2 flex-wrap">
            <div 
              className="flex items-center gap-2 rounded-full border px-3.5 py-1 text-xs sm:text-sm font-black tracking-wide shadow-sm"
              style={{
                borderColor: `${chapterTheme.primary}80`,
                backgroundColor: `${chapterTheme.primary}15`,
                color: chapterTheme.primary,
                boxShadow: `0 0 10px ${chapterTheme.primary}25`,
              }}
            >
              <span 
                className="h-2 w-2 rounded-full shrink-0 opacity-90"
                style={{ backgroundColor: chapterTheme.primary, boxShadow: `0 0 6px ${chapterTheme.primary}` }}
              />
              <span>CHƯƠNG {chapter.romanNumeral}: {chapter.title.toUpperCase()}</span>
            </div>
            <div className="text-xs sm:text-sm font-medium text-slate-300">
              Bài {lesson.lessonNumber} &nbsp;•&nbsp; Trang {sgkPage} SGK
            </div>
          </div>

          {/* Right Action Buttons: "Bài kế tiếp →" & "Đã hoàn thành" */}
          <div className="flex items-center gap-2">
            {/* Active Subtab Back to Lesson button */}
            {activeSubTab !== 0 && (
              <button
                onClick={() => {
                  setActiveSubTab(0);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="flex items-center gap-1.5 rounded-xl border border-[#00D4FF]/50 bg-[#00D4FF]/15 hover:bg-[#00D4FF]/25 px-3 py-1.5 text-xs sm:text-sm font-bold text-[#00D4FF] transition-all shadow-[0_0_12px_rgba(0,212,255,0.2)] cursor-pointer"
              >
                <BookOpen className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#00D4FF]" />
                <span>Trở về bài học</span>
              </button>
            )}

            <button
              id="mark-completed-btn"
              onClick={() => onToggleComplete(lesson.id)}
              className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs sm:text-sm font-semibold transition-all shadow-md cursor-pointer ${
                isCompleted
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
                  : 'border border-white/10 bg-[#0C172E] text-slate-300 hover:bg-white/5'
              }`}
            >
              <CheckCircle2 className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${isCompleted ? 'text-emerald-400' : 'text-slate-400'}`} />
              <span>{isCompleted ? 'Đã hoàn thành' : 'Đánh dấu đã học'}</span>
            </button>

            <button
              onClick={() => {
                if (lesson.id < 34) {
                  onSelectLesson(lesson.id + 1);
                  setActiveSubTab(0);
                }
              }}
              disabled={lesson.id >= 34}
              className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs sm:text-sm font-bold disabled:opacity-40 transition-all active:scale-95 cursor-pointer ${chapterTheme.btnGradient}`}
            >
              <span>Bài kế tiếp →</span>
            </button>
          </div>
        </div>

        {/* Big Centered Title & Description */}
        <div className="text-center space-y-1 sm:space-y-1.5 py-0.5">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-wide leading-tight drop-shadow-[0_2px_10px_rgba(0,0,0,0.7)]">
            Bài {lesson.lessonNumber}. {lesson.title}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-3xl mx-auto font-medium leading-relaxed line-clamp-1 sm:line-clamp-none">
            <InlinePhysicsText text={lesson.shortDescription || 'Khái niệm, các quy luật vật lí cốt lõi và hệ thống phương trình toán học chuẩn GDPT 2018.'} />
          </p>
        </div>

        {/* Sub-Tabs Module Bar with Sleek Horizontal Scrollbar */}
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pt-2 pb-1.5 tab-scrollbar scroll-smooth">
          {[
            { id: 0, label: 'Nội dung bài học', icon: BookOpen, activeColor: 'bg-[#2563EB] text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]' },
            { id: 1, label: 'Hỏi Đáp & Lời Giải SGK', icon: FileText, iconColor: 'text-emerald-400' },
            { id: 2, label: 'Mô Phỏng 60 FPS & Thí Nghiệm', icon: Activity, iconColor: 'text-cyan-400' },
            { id: 3, label: 'Video Mô Phỏng', icon: Film, iconColor: 'text-purple-400' },
            { id: 4, label: 'Luyện Tập', icon: CheckSquare, iconColor: 'text-amber-400' },
            { id: 5, label: 'Gia Sư Socratic AI', icon: Bot, iconColor: 'text-purple-400' },
            { id: 6, label: 'Ứng Dụng Thực Tế', icon: Compass, iconColor: 'text-teal-400' },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSubTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id)}
                className={`flex items-center gap-1.5 sm:gap-2 rounded-xl px-3 py-1.5 text-xs sm:text-sm font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer shrink-0 ${
                  isActive
                    ? 'bg-[#2563EB] text-white shadow-[0_0_15px_rgba(37,99,235,0.4)] font-bold'
                    : 'border border-white/10 bg-[#0C172E]/80 text-slate-300 hover:border-white/20 hover:bg-[#0E1E3C] hover:text-white'
                }`}
              >
                <Icon className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${isActive ? 'text-white' : tab.iconColor || 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
        </div>

      {/* Tab Panels */}
      {/* TAB 0: Nội dung bài học */}
      {activeSubTab === 0 && (
        <div className="space-y-6">
          {lesson.id === 1 ? (
            <Lesson1Detail />
          ) : (
            <LessonUniversalDetail lesson={lesson} chapter={chapter} />
          )}

          <div className="flex flex-wrap justify-between items-center gap-3 rounded-2xl border border-white/10 bg-[#0C1528]/80 p-4 sm:p-5 shadow-lg backdrop-blur-md">
            <button
              onClick={() => {
                if (lesson.id > 1) {
                  onSelectLesson(lesson.id - 1);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }
              }}
              disabled={lesson.id <= 1}
              className="flex items-center gap-2 rounded-xl border border-white/10 bg-[#070E1C] px-4.5 py-2.5 text-sm sm:text-base font-semibold text-gray-200 hover:bg-white/5 disabled:opacity-40 cursor-pointer"
            >
              <ChevronLeft className="h-4.5 w-4.5" />
              <span>Bài trước</span>
            </button>

            <button
              onClick={() => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="flex items-center gap-2 rounded-xl border border-white/15 bg-[#070E1C] hover:bg-[#0E1E3C] hover:text-white px-4 py-2.5 text-sm sm:text-base font-bold text-slate-300 transition-all cursor-pointer shadow-sm"
            >
              <BookOpen className="h-4.5 w-4.5 text-[#00D4FF]" />
              <span>Trở về đầu bài học</span>
            </button>

            <button
              onClick={() => {
                setActiveSubTab(1);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#00D4FF] to-[#00FFCC] hover:opacity-90 px-5.5 py-2.5 text-sm sm:text-base font-bold text-slate-950 shadow-[0_0_20px_rgba(0,212,255,0.25)] transition-all cursor-pointer"
            >
              <span>Xem Hỏi Đáp & Lời Giải SGK</span>
              <ChevronRight className="h-4.5 w-4.5" />
            </button>
          </div>
        </div>
      )}

      {/* TAB 1: Hỏi Đáp & Lời Giải SGK */}
      {activeSubTab === 1 && (
        <div className="space-y-6">
          <LessonSgkSolutions
            lesson={lesson}
            chapter={chapter}
          />

          <div className="flex flex-wrap justify-between items-center gap-3 rounded-2xl border border-white/10 bg-[#0C1528]/80 p-4 shadow-lg backdrop-blur-md">
            <button
              onClick={() => {
                setActiveSubTab(0);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="flex items-center gap-2 rounded-xl border border-[#00D4FF]/40 bg-[#00D4FF]/10 hover:bg-[#00D4FF]/20 px-4.5 py-2.5 text-sm font-bold text-[#00D4FF] transition-all cursor-pointer shadow-sm"
            >
              <BookOpen className="h-4.5 w-4.5 text-[#00D4FF]" />
              <span>Trở về bài học</span>
            </button>
            <button
              onClick={() => {
                setActiveSubTab(2);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="flex items-center gap-2 rounded-xl bg-[#00D4FF] hover:bg-[#00B8E0] px-5 py-2.5 text-sm font-bold text-black shadow-[0_0_20px_rgba(0,212,255,0.2)] transition-all cursor-pointer"
            >
              <span>Mở Mô phỏng 60 FPS & Thí nghiệm</span>
              <ChevronRight className="h-4.5 w-4.5" />
            </button>
          </div>
        </div>
      )}

      {/* TAB 2: Mô Phỏng 60 FPS & Thí Nghiệm */}
      {activeSubTab === 2 && (
        <div className="space-y-6">
          {renderSimulationComponent()}

          <div className="flex flex-wrap justify-between items-center gap-3 rounded-2xl border border-white/10 bg-[#0C1528]/80 p-4 shadow-lg backdrop-blur-md">
            <button
              onClick={() => {
                setActiveSubTab(0);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="flex items-center gap-2 rounded-xl border border-[#00D4FF]/40 bg-[#00D4FF]/10 hover:bg-[#00D4FF]/20 px-4.5 py-2.5 text-sm font-bold text-[#00D4FF] transition-all cursor-pointer shadow-sm"
            >
              <BookOpen className="h-4.5 w-4.5 text-[#00D4FF]" />
              <span>Trở về bài học</span>
            </button>
            <button
              onClick={() => {
                setActiveSubTab(3);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="flex items-center gap-2 rounded-xl bg-purple-600 hover:bg-purple-500 px-5 py-2.5 text-sm font-bold text-white shadow-[0_0_20px_rgba(168,85,247,0.3)] transition-all cursor-pointer"
            >
              <Film className="h-4 w-4" />
              <span>Mở Video Mô Phỏng</span>
              <ChevronRight className="h-4.5 w-4.5" />
            </button>
          </div>
        </div>
      )}

      {/* TAB 3: Video Mô Phỏng */}
      {activeSubTab === 3 && (
        <div className="space-y-6">
          <LessonVideoLab
            lesson={lesson}
            onBackToLesson={() => {
              setActiveSubTab(0);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />

          <div className="flex flex-wrap justify-between items-center gap-3 rounded-2xl border border-white/10 bg-[#0C1528]/80 p-4 shadow-lg backdrop-blur-md">
            <button
              onClick={() => {
                setActiveSubTab(2);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 px-4.5 py-2.5 text-sm font-semibold text-gray-200 transition-all cursor-pointer"
            >
              <ChevronLeft className="h-4.5 w-4.5" />
              <span>Mô phỏng 60 FPS</span>
            </button>
            <button
              onClick={() => {
                setActiveSubTab(4);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="flex items-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-400 px-5 py-2.5 text-sm font-bold text-black shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all cursor-pointer"
            >
              <span>Luyện tập</span>
              <ChevronRight className="h-4.5 w-4.5" />
            </button>
          </div>
        </div>
      )}

      {/* TAB 4: Luyện Tập */}
      {activeSubTab === 4 && (
        <div className="space-y-6 rounded-2xl border border-white/10 bg-[#0C1528]/80 p-6 sm:p-7 shadow-xl backdrop-blur-md">
          <div className="border-b border-white/10 pb-4">
            <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
              <CheckSquare className="h-4 w-4 text-amber-400" />
              LUYỆN TẬP & CỦNG CỐ NĂNG LỰC
            </span>
            <h3 className="mt-1.5 text-2xl sm:text-3xl font-extrabold text-white">
              {lesson.steps[3]?.title || 'Câu hỏi củng cố & Thử thách tư duy'}
            </h3>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#070E1C] p-5 sm:p-6 space-y-4">
            <div className="flex items-start gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-400/20 text-sm font-bold text-amber-300 border border-amber-400/30 shrink-0">
                Q1
              </span>
              <div className="text-base sm:text-lg font-medium text-gray-100 leading-relaxed">
                {lesson.steps[3]?.content || 'Vận dụng các kiến thức và công thức đã học của bài để giải thích các tình huống thực tiễn và tính toán đại lượng yêu cầu.'}
              </div>
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              <button
                onClick={() => setShowAnswerExplanation(!showAnswerExplanation)}
                className="flex items-center gap-2 rounded-xl border border-white/10 bg-[#0C1528] px-4 py-2.5 text-sm font-semibold text-gray-200 hover:bg-white/5 cursor-pointer"
              >
                <HelpCircle className="h-4 w-4 text-[#00FFCC]" />
                <span>{showAnswerExplanation ? 'Ẩn hướng dẫn giải' : 'Xem hướng dẫn & đáp án'}</span>
              </button>
            </div>

            {showAnswerExplanation && (
              <div className="mt-4 rounded-xl border border-[#00FFCC]/30 bg-[#00FFCC]/5 p-5 text-base sm:text-lg leading-relaxed text-[#00FFCC]">
                <strong className="block text-[#00FFCC] font-bold mb-1 text-base sm:text-lg">Phương pháp giải chuẩn GDPT 2018:</strong>
                Áp dụng trực tiếp công thức cốt lõi của bài học, phân tích đúng chiều dương quy ước của hệ quy chiếu và thay số với đơn vị SI chuẩn.
              </div>
            )}
          </div>

          {/* Next Lesson Navigator */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4">
            <button
              onClick={() => {
                setActiveSubTab(0);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="flex items-center gap-2 rounded-xl border border-[#00D4FF]/40 bg-[#00D4FF]/10 hover:bg-[#00D4FF]/20 px-4.5 py-2.5 text-sm font-bold text-[#00D4FF] transition-all cursor-pointer shadow-sm"
            >
              <BookOpen className="h-4.5 w-4.5 text-[#00D4FF]" />
              <span>Trở về bài học</span>
            </button>

            <button
              onClick={() => {
                setActiveSubTab(5);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-5 py-2.5 text-sm font-bold text-white shadow-[0_0_15px_rgba(99,102,241,0.3)] cursor-pointer"
            >
              <Bot className="h-4 w-4" />
              <span>Hỏi Gia Sư Socratic AI</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 5: Gia Sư Socratic AI */}
      {activeSubTab === 5 && (
        <div className="space-y-6">
          <VoicePhysicsTutor
            currentLessonTitle={lesson.title}
            currentChapterTitle={chapter.title}
          />

          <div className="flex flex-wrap justify-between items-center gap-3 rounded-2xl border border-white/10 bg-[#0C1528]/80 p-4 shadow-lg backdrop-blur-md">
            <button
              onClick={() => {
                setActiveSubTab(0);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="flex items-center gap-2 rounded-xl border border-[#00D4FF]/40 bg-[#00D4FF]/10 hover:bg-[#00D4FF]/20 px-4.5 py-2.5 text-sm font-bold text-[#00D4FF] transition-all cursor-pointer shadow-sm"
            >
              <BookOpen className="h-4.5 w-4.5 text-[#00D4FF]" />
              <span>Trở về bài học</span>
            </button>

            <button
              onClick={() => {
                setActiveSubTab(6);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="flex items-center gap-2 rounded-xl bg-[#00D4FF] hover:bg-[#00B8E0] px-5 py-2.5 text-sm font-bold text-black shadow-[0_0_20px_rgba(0,212,255,0.2)] transition-all cursor-pointer"
            >
              <span>Xem Ứng dụng thực tế</span>
              <ChevronRight className="h-4.5 w-4.5" />
            </button>
          </div>
        </div>
      )}

      {/* TAB 6: Ứng Dụng Thực Tế */}
      {activeSubTab === 6 && (
        <div className="space-y-6">
          <RealLifeView />

          <div className="flex flex-wrap justify-start items-center gap-3 rounded-2xl border border-white/10 bg-[#0C1528]/80 p-4 shadow-lg backdrop-blur-md">
            <button
              onClick={() => {
                setActiveSubTab(0);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="flex items-center gap-2 rounded-xl border border-[#00D4FF]/40 bg-[#00D4FF]/10 hover:bg-[#00D4FF]/20 px-4.5 py-2.5 text-sm font-bold text-[#00D4FF] transition-all cursor-pointer shadow-sm"
            >
              <BookOpen className="h-4.5 w-4.5 text-[#00D4FF]" />
              <span>Trở về bài học</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

