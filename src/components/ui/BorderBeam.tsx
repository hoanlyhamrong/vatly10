import React from 'react';

export interface ChapterColorConfig {
  primary: string;
  mid: string;
  to: string;
  glow: string;
  ambientBg: string;
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
  tagDot: string;
  btnGradient: string;
}

export const CHAPTER_COLOR_MAP: Record<number, ChapterColorConfig> = {
  1: {
    primary: '#00D4FF',
    mid: '#38BDF8',
    to: '#00FFCC',
    glow: 'rgba(0, 212, 255, 0.85)',
    ambientBg: 'rgba(0, 212, 255, 0.08)',
    badgeBg: 'rgba(0, 212, 255, 0.15)',
    badgeBorder: 'rgba(0, 212, 255, 0.45)',
    badgeText: '#00D4FF',
    tagDot: 'bg-[#00D4FF]',
    btnGradient: 'bg-gradient-to-r from-[#0090E0] to-[#00D4FF] hover:from-[#007AC0] hover:to-[#00BCE5] text-slate-950 shadow-[0_0_20px_rgba(0,212,255,0.4)]',
  },
  2: {
    primary: '#3B82F6',
    mid: '#60A5FA',
    to: '#818CF8',
    glow: 'rgba(59, 130, 246, 0.85)',
    ambientBg: 'rgba(59, 130, 246, 0.08)',
    badgeBg: 'rgba(59, 130, 246, 0.15)',
    badgeBorder: 'rgba(59, 130, 246, 0.45)',
    badgeText: '#60A5FA',
    tagDot: 'bg-[#3B82F6]',
    btnGradient: 'bg-gradient-to-r from-[#2563EB] to-[#3B82F6] hover:from-[#1D4ED8] hover:to-[#2563EB] text-white shadow-[0_0_20px_rgba(59,130,246,0.4)]',
  },
  3: {
    primary: '#10B981',
    mid: '#00FFCC',
    to: '#34D399',
    glow: 'rgba(16, 185, 129, 0.85)',
    ambientBg: 'rgba(16, 185, 129, 0.08)',
    badgeBg: 'rgba(16, 185, 129, 0.15)',
    badgeBorder: 'rgba(16, 185, 129, 0.45)',
    badgeText: '#34D399',
    tagDot: 'bg-[#10B981]',
    btnGradient: 'bg-gradient-to-r from-[#059669] to-[#10B981] hover:from-[#047857] hover:to-[#059669] text-white shadow-[0_0_20px_rgba(16,185,129,0.4)]',
  },
  4: {
    primary: '#F59E0B',
    mid: '#FBBF24',
    to: '#F97316',
    glow: 'rgba(245, 158, 11, 0.85)',
    ambientBg: 'rgba(245, 158, 11, 0.08)',
    badgeBg: 'rgba(245, 158, 11, 0.15)',
    badgeBorder: 'rgba(245, 158, 11, 0.45)',
    badgeText: '#FBBF24',
    tagDot: 'bg-[#F59E0B]',
    btnGradient: 'bg-gradient-to-r from-[#D97706] to-[#F59E0B] hover:from-[#B45309] hover:to-[#D97706] text-slate-950 shadow-[0_0_20px_rgba(245,158,11,0.4)]',
  },
  5: {
    primary: '#F97316',
    mid: '#FB923C',
    to: '#EF4444',
    glow: 'rgba(249, 115, 22, 0.85)',
    ambientBg: 'rgba(249, 115, 22, 0.08)',
    badgeBg: 'rgba(249, 115, 22, 0.15)',
    badgeBorder: 'rgba(249, 115, 22, 0.45)',
    badgeText: '#FB923C',
    tagDot: 'bg-[#F97316]',
    btnGradient: 'bg-gradient-to-r from-[#EA580C] to-[#F97316] hover:from-[#C2410C] hover:to-[#EA580C] text-white shadow-[0_0_20px_rgba(249,115,22,0.4)]',
  },
  6: {
    primary: '#A855F7',
    mid: '#C084FC',
    to: '#EC4899',
    glow: 'rgba(168, 85, 247, 0.85)',
    ambientBg: 'rgba(168, 85, 247, 0.08)',
    badgeBg: 'rgba(168, 85, 247, 0.15)',
    badgeBorder: 'rgba(168, 85, 247, 0.45)',
    badgeText: '#C084FC',
    tagDot: 'bg-[#A855F7]',
    btnGradient: 'bg-gradient-to-r from-[#9333EA] to-[#A855F7] hover:from-[#7E22CE] hover:to-[#9333EA] text-white shadow-[0_0_20px_rgba(168,85,247,0.4)]',
  },
  7: {
    primary: '#EC4899',
    mid: '#F472B6',
    to: '#06B6D4',
    glow: 'rgba(236, 72, 153, 0.85)',
    ambientBg: 'rgba(236, 72, 153, 0.08)',
    badgeBg: 'rgba(236, 72, 153, 0.15)',
    badgeBorder: 'rgba(236, 72, 153, 0.45)',
    badgeText: '#F472B6',
    tagDot: 'bg-[#EC4899]',
    btnGradient: 'bg-gradient-to-r from-[#DB2777] to-[#EC4899] hover:from-[#BE185D] hover:to-[#DB2777] text-white shadow-[0_0_20px_rgba(236,72,153,0.4)]',
  },
};

export function getChapterTheme(chapterId: number): ChapterColorConfig {
  const normId = ((chapterId - 1) % 7) + 1;
  return CHAPTER_COLOR_MAP[normId] || CHAPTER_COLOR_MAP[1];
}

interface BorderBeamProps {
  chapterId?: number;
  colorFrom?: string;
  colorMid?: string;
  colorTo?: string;
  glowColor?: string;
  duration?: number;
  borderWidth?: number;
  className?: string;
  rx?: number;
}

export const BorderBeam: React.FC<BorderBeamProps> = ({
  chapterId = 1,
  duration = 5,
  className = '',
}) => {
  const theme = getChapterTheme(chapterId);

  return (
    <div
      className={`pointer-events-none absolute -inset-[200%] animate-[spin_5s_linear_infinite] ${className}`}
      style={{
        animationDuration: `${duration}s`,
        background: `conic-gradient(from 0deg at 50% 50%, transparent 0deg, transparent 250deg, ${theme.mid} 290deg, ${theme.primary} 340deg, #FFFFFF 360deg)`,
      }}
      aria-hidden="true"
    />
  );
};


