import React from 'react';
import { 
  Atom, 
  BookOpen, 
  FlaskConical, 
  CheckCircle2, 
  Network, 
  GraduationCap, 
  Bot, 
  PanelLeft,
  Activity,
  FileSpreadsheet,
  Zap,
  Sparkles,
  Clock
} from 'lucide-react';

export type ActiveTab = 'CURRICULUM' | 'LESSON' | 'VOICE_TUTOR' | 'SIMULATIONS' | 'VIRTUAL_LAB' | 'PRACTICE' | 'MINDMAP' | 'REAL_LIFE' | 'TEACHER';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  completedCount: number;
  totalLessons: number;
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  completedCount,
  totalLessons,
  isSidebarOpen,
  toggleSidebar,
}) => {
  return (
    <header id="main-navbar" className="sticky top-0 z-50 w-full border-b border-[#132238] bg-[#060D1E]/95 backdrop-blur-2xl shadow-[0_4px_24px_rgba(0,0,0,0.7)] transition-all">
      <div className="mx-auto flex w-full items-center justify-between px-3 py-2.5 sm:px-5 lg:px-6 gap-2">
        
        {/* Left Section: Danh mục Toggle Button & App Brand Logo */}
        <div className="flex items-center gap-3 sm:gap-3.5 shrink-0">
          {/* Universal "Danh mục" Toggle Button (Image 2 style) */}
          <button
            onClick={toggleSidebar}
            type="button"
            aria-label="Toggle curriculum sidebar"
            className="flex items-center gap-2 rounded-xl border border-[#00D4FF]/40 bg-[#0C1E3C]/90 hover:bg-[#0C2A54] px-3.5 sm:px-4 py-2 text-sm sm:text-base font-bold text-[#00D4FF] shadow-[0_0_15px_rgba(0,212,255,0.15)] transition-all active:scale-95 cursor-pointer group"
          >
            <PanelLeft className="h-4.5 w-4.5 text-[#00D4FF] transition-transform group-hover:scale-110" />
            <span className="inline font-extrabold">Danh mục</span>
          </button>

          {/* Logo Badge with Atom Icon */}
          <div
            onClick={() => setActiveTab('CURRICULUM')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="relative flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[#0EA5E9] via-[#0284C7] to-[#00D4FF] text-white shadow-[0_0_20px_rgba(14,165,233,0.5)] group-hover:scale-105 transition-transform duration-300">
              <Atom className="h-6 w-6 animate-spin-slow text-white" />
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00FFCC] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#00FFCC]"></span>
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base sm:text-lg lg:text-xl font-black tracking-tight text-white flex items-center gap-1">
                  PHYSICS <span className="text-[#00D4FF]">10</span>
                </span>
                <span className="rounded-md bg-[#00D4FF]/15 px-2 py-0.5 text-[10px] sm:text-xs font-black text-[#00D4FF] border border-[#00D4FF]/30 uppercase tracking-wider">
                  GDPT 2018
                </span>
              </div>
              <p className="text-xs sm:text-sm font-semibold text-slate-300 hidden sm:block tracking-wide uppercase">HOÀNG QUỐC HOÀN</p>
            </div>
          </div>
        </div>

        {/* Center: Navigation Links (Matching Image 2 pills) */}
        <nav className="hidden lg:flex items-center gap-1.5 xl:gap-2">
          {[
            { id: 'CURRICULUM', label: 'Tổng quan', icon: BookOpen },
            { id: 'VIRTUAL_LAB', label: 'Phòng thí nghiệm', icon: FlaskConical },
            { id: 'SIMULATIONS', label: 'Mô phỏng 60fps', icon: Activity, pillBadge: true },
            { id: 'PRACTICE', label: 'Luyện tập', icon: Clock },
            { id: 'MINDMAP', label: 'Sơ đồ', icon: Network },
            { id: 'TEACHER', label: 'Khảo thí', icon: GraduationCap },
          ].map((link) => {
            const Icon = link.icon;
            const isCurrent = activeTab === link.id || (link.id === 'CURRICULUM' && activeTab === 'LESSON');
            
            if (link.pillBadge && isCurrent) {
              return (
                <button
                  key={link.id}
                  onClick={() => setActiveTab(link.id as ActiveTab)}
                  className="flex items-center gap-2 rounded-2xl border border-[#00D4FF]/50 bg-[#0C1E3C] px-4 py-2 text-sm xl:text-base font-bold text-[#00D4FF] shadow-[0_0_15px_rgba(0,212,255,0.25)] transition-all cursor-pointer"
                >
                  <Icon className="h-4.5 w-4.5 text-[#00D4FF]" />
                  <span>{link.label}</span>
                </button>
              );
            }

            return (
              <button
                key={link.id}
                onClick={() => setActiveTab(link.id as ActiveTab)}
                className={`flex items-center gap-2 rounded-xl px-3 xl:px-3.5 py-2 text-sm xl:text-base font-semibold transition-all cursor-pointer ${
                  isCurrent
                    ? 'bg-[#1E293B] text-white shadow-sm font-bold'
                    : 'text-slate-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Icon className="h-4.5 w-4.5 shrink-0 text-slate-400" />
                <span>{link.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right Section: Action Buttons Matching Image 2 */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Emerald Green: Báo cáo Khảo thí button */}
          <button
            onClick={() => setActiveTab('TEACHER')}
            type="button"
            className="flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-3.5 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm md:text-base font-bold text-white shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all active:scale-95 cursor-pointer"
          >
            <FileSpreadsheet className="h-4.5 w-4.5" />
            <span className="hidden sm:inline">Báo cáo Khảo thí</span>
            <span className="sm:hidden">Khảo thí</span>
          </button>

          {/* Indigo / Violet: Trợ lý AI button */}
          <button
            onClick={() => setActiveTab('VOICE_TUTOR')}
            type="button"
            className="flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-3.5 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm md:text-base font-bold text-white shadow-[0_0_15px_rgba(99,102,241,0.3)] transition-all active:scale-95 cursor-pointer"
          >
            <Bot className="h-4.5 w-4.5" />
            <span>Trợ lý AI</span>
          </button>
        </div>
      </div>
    </header>
  );
};
