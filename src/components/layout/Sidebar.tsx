import React, { useState } from 'react';
import { 
  ChevronDown, 
  ChevronRight, 
  CheckCircle2, 
  BookOpen, 
  Search, 
  Sparkles,
  Layers,
  Circle,
  Crown,
  LayoutDashboard,
  FlaskConical,
  Activity,
  Bot,
  CheckSquare,
  Network,
  GraduationCap,
  Sparkle,
  Award,
  CalendarDays,
  FileSpreadsheet,
  AlertTriangle,
  Lightbulb,
  X
} from 'lucide-react';
import { CHAPTERS } from '../../data/curriculumData';
import { ActiveTab } from './Navbar';

interface SidebarProps {
  selectedLessonId: number;
  onSelectLesson: (lessonId: number) => void;
  completedLessonIds: number[];
  isOpen: boolean;
  onClose: () => void;
  activeTab?: ActiveTab;
  setActiveTab?: (tab: ActiveTab) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  selectedLessonId,
  onSelectLesson,
  completedLessonIds,
  isOpen,
  onClose,
  activeTab = 'CURRICULUM',
  setActiveTab,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [openChapterIds, setOpenChapterIds] = useState<number[]>([1, 2]);
  const [isOverviewExpanded, setIsOverviewExpanded] = useState<boolean>(true);

  const toggleChapter = (chapterId: number) => {
    setOpenChapterIds((prev) =>
      prev.includes(chapterId) ? prev.filter((id) => id !== chapterId) : [...prev, chapterId]
    );
  };

  const filteredChapters = CHAPTERS.map((ch) => ({
    ...ch,
    lessons: ch.lessons.filter((l) =>
      l.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.lessonNumber.toString().includes(searchQuery)
    ),
  })).filter((ch) => ch.lessons.length > 0 || ch.title.toLowerCase().includes(searchQuery.toLowerCase()));

  const subItems: { id: ActiveTab; label: string; icon: React.FC<{ className?: string }>; badge?: string; badgeColor?: string }[] = [
    { id: 'VOICE_TUTOR', label: '🤖 Trợ lí Vật lí AI', icon: Bot, badge: 'Live Voice', badgeColor: 'bg-blue-500/20 text-sky-300' },
    { id: 'VIRTUAL_LAB', label: 'Phòng thí nghiệm', icon: FlaskConical, badge: '5 TN', badgeColor: 'bg-emerald-500/20 text-emerald-300' },
    { id: 'SIMULATIONS', label: 'Mô phỏng 60 FPS', icon: Activity, badge: 'Động học', badgeColor: 'bg-cyan-500/20 text-cyan-300' },
    { id: 'PRACTICE', label: 'Luyện tập & Đề thi', icon: CheckSquare, badge: '150+ câu', badgeColor: 'bg-rose-500/20 text-rose-300' },
    { id: 'TEACHER', label: 'Khảo thí & 4 Nhóm', icon: Award, badge: 'Nhóm A-D', badgeColor: 'bg-amber-500/20 text-amber-300' },
    { id: 'MINDMAP', label: 'Sơ đồ tư duy', icon: Network, badge: 'Trực quan', badgeColor: 'bg-purple-500/20 text-purple-300' },
    { id: 'REAL_LIFE', label: 'Vật lí thực tế', icon: Lightbulb, badge: 'Ứng dụng', badgeColor: 'bg-teal-500/20 text-teal-300' },
  ];

  if (!isOpen) {
    return null;
  }

  return (
    <>
      {/* Mobile Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm lg:hidden transition-opacity"
      />

      <aside
        id="curriculum-sidebar"
        className="fixed top-14 bottom-0 left-0 z-40 w-80 sm:w-96 lg:w-[22rem] xl:w-[24rem] border-r border-[#132238] bg-[#070D1E] p-4 transition-all duration-300 backdrop-blur-2xl lg:sticky lg:top-[57px] lg:h-[calc(100vh-57px)] overflow-y-auto shrink-0 shadow-2xl"
      >
        {/* Mobile Header with Close Button */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 lg:hidden mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-[#00D4FF]">
            Danh mục bài học GDPT 2018
          </span>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Primary Navigation Menu */}
        <div className="mb-4 space-y-2.5">
          <div className="px-2 py-1 text-sm sm:text-base font-black uppercase tracking-wider text-slate-200">
            DANH MỤC HỌC TẬP & KHẢO THÍ
          </div>

          {/* Collapsible Overview Tab */}
          <div className="rounded-2xl border border-white/10 bg-[#0C1528]/80 overflow-hidden shadow-sm">
            <button
              onClick={() => {
                setIsOverviewExpanded(!isOverviewExpanded);
                if (setActiveTab) setActiveTab('CURRICULUM');
              }}
              className={`flex w-full items-center justify-between px-4 py-3.5 text-base sm:text-lg font-bold transition-all duration-200 cursor-pointer ${
                activeTab === 'CURRICULUM' || activeTab === 'LESSON'
                  ? 'bg-gradient-to-r from-[#3B82F6] to-[#2563EB] text-white shadow-[0_0_18px_rgba(59,130,246,0.45)]'
                  : 'text-slate-100 hover:bg-white/5 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <LayoutDashboard className="h-5 w-5 sm:h-6 sm:w-6 text-[#00D4FF]" />
                <span className="font-extrabold text-base sm:text-lg">Tổng quan</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-blue-500/20 px-2.5 py-0.5 text-xs sm:text-sm font-bold text-blue-200">
                  7 Ch.
                </span>
                {isOverviewExpanded ? (
                  <ChevronDown className="h-5 w-5 text-slate-300 transition-transform duration-200" />
                ) : (
                  <ChevronRight className="h-5 w-5 text-slate-400 transition-transform duration-200" />
                )}
              </div>
            </button>

            {/* Sub-items Collapsible Container */}
            {isOverviewExpanded && (
              <div className="space-y-1 p-2 border-t border-white/5 bg-[#080E1C]/90">
                {subItems.map((item) => {
                  const Icon = item.icon;
                  const isSelected = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        if (setActiveTab) setActiveTab(item.id);
                        if (window.innerWidth < 1024) onClose();
                      }}
                      className={`flex w-full items-center justify-between rounded-xl px-3.5 py-3 text-base sm:text-lg font-semibold transition-all duration-150 cursor-pointer ${
                        isSelected
                          ? 'bg-[#3B82F6] text-white shadow-[0_0_15px_rgba(59,130,246,0.4)] font-bold'
                          : 'text-slate-100 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`h-5 w-5 sm:h-5.5 sm:w-5.5 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className={`rounded-md px-2.5 py-0.5 text-xs sm:text-sm font-bold ${isSelected ? 'bg-white/20 text-white' : item.badgeColor}`}>
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}

                {/* Sub-item: Tiến độ bài học (3/34 - 9%) */}
                <div className="mt-2 rounded-xl border border-white/5 bg-[#0D182E] p-3.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-200">
                      Tiến độ bài học
                    </span>
                    <span className="font-mono text-xs sm:text-sm font-bold text-[#00FFCC]">
                      {completedLessonIds.length}/34 ({Math.round((completedLessonIds.length / 34) * 100)}%)
                    </span>
                  </div>
                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full bg-gradient-to-r from-[#3B82F6] via-[#00D4FF] to-[#00FFCC] transition-all duration-500"
                      style={{ width: `${Math.round((completedLessonIds.length / 34) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Search Box */}
        <div className="relative mb-4">
          <Search className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm bài học..."
            className="w-full rounded-xl border border-white/10 bg-[#0C1528] py-2.5 pl-10 pr-4 text-base text-white placeholder-slate-400 focus:border-[#3B82F6] focus:outline-none transition-colors"
          />
        </div>

        {/* Chapters & Lessons Tree */}
        <div className="space-y-3">
          {filteredChapters.map((chapter) => {
            const isExpanded = openChapterIds.includes(chapter.id) || searchQuery.length > 0;
            const completedInChapter = chapter.lessons.filter((l) =>
              completedLessonIds.includes(l.id)
            ).length;

            return (
              <div key={chapter.id} className="rounded-2xl border border-white/10 bg-[#0C1528]/80 overflow-hidden shadow-sm">
                {/* Chapter Header Accordion */}
                <button
                  onClick={() => toggleChapter(chapter.id)}
                  className="flex w-full items-center justify-between p-3.5 text-left transition hover:bg-white/5 cursor-pointer"
                >
                  <div className="flex items-center gap-2.5 truncate">
                    {isExpanded ? (
                      <ChevronDown className="h-5 w-5 text-[#00D4FF] shrink-0" />
                    ) : (
                      <ChevronRight className="h-5 w-5 text-slate-400 shrink-0" />
                    )}
                    <span className="text-base sm:text-lg font-black text-white truncate">
                      Chương {chapter.romanNumeral}: {chapter.title}
                    </span>
                  </div>
                  <span className="text-xs sm:text-sm font-mono font-bold text-[#00D4FF] shrink-0 bg-[#00D4FF]/10 px-2.5 py-0.5 rounded-md border border-[#00D4FF]/20">
                    {completedInChapter}/{chapter.lessons.length}
                  </span>
                </button>

                {/* Lessons List */}
                {isExpanded && (
                  <div className="space-y-1 p-2 pt-0 border-t border-white/5">
                    {chapter.lessons.map((lesson) => {
                      const isSelected = selectedLessonId === lesson.id && activeTab === 'LESSON';
                      const isCompleted = completedLessonIds.includes(lesson.id);

                      return (
                        <button
                          key={lesson.id}
                          onClick={() => {
                            onSelectLesson(lesson.id);
                            if (setActiveTab) setActiveTab('LESSON');
                            if (window.innerWidth < 1024) onClose();
                          }}
                          className={`flex w-full items-center justify-between px-3.5 py-2.5 text-left text-base sm:text-lg transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-[#3B82F6]/30 text-[#00D4FF] font-bold border-l-4 border-[#00D4FF] rounded-r-xl shadow-md'
                              : 'text-slate-100 hover:bg-white/5 hover:text-white rounded-xl font-medium'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 truncate">
                            {isCompleted ? (
                              <CheckCircle2 className="h-4.5 w-4.5 text-[#00FFCC] shrink-0" />
                            ) : (
                              <Circle className="h-3 w-3 text-slate-500 shrink-0 ml-1 mr-1" />
                            )}
                            <span className="truncate font-semibold">
                              Bài {lesson.lessonNumber}: {lesson.title}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer info line */}
        <div className="mt-4 border-t border-white/10 pt-3 flex items-center justify-between text-xs sm:text-sm text-slate-300">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-semibold">GDPT 2018 Vật lí 10</span>
          </div>
          <span className="font-mono font-bold text-slate-200">34 Bài học</span>
        </div>
      </aside>
    </>
  );
};
