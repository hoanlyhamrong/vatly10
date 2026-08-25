import React, { useState, useEffect, useRef } from 'react';
import {
  Upload,
  Image as ImageIcon,
  Maximize2,
  Download,
  Trash2,
  X,
  Sparkles,
  Info,
  Layers,
  ZoomIn
} from 'lucide-react';
import {
  savePortraitToDB,
  loadPortraitFromDB,
  deletePortraitFromDB,
  compressImage
} from '../../utils/imageStorage';

interface ApparatusIllustrationCardProps {
  lessonId: number;
  stepIndex: number;
  title?: string;
  subtitle?: string;
  variant?: 'apparatus_overview' | 'photogate_method' | 'generic';
}

// Vector SVG schematic illustration for Photogates Method (Đo tốc độ trung bình và tức thời)
export const PhotogateMethodSvg: React.FC = () => {
  return (
    <div className="relative w-full aspect-[16/9] min-h-[340px] max-h-[490px] rounded-2xl overflow-hidden bg-gradient-to-b from-[#060E1F] via-[#09152B] to-[#040814] border border-cyan-500/25 p-4 flex flex-col justify-between shadow-inner select-none">
      {/* Header Banner */}
      <div className="flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-md bg-[#00FFCC]/20 text-[#00FFCC] border border-[#00FFCC]/40 text-xs font-bold uppercase tracking-wider">
            Sơ đồ nguyên lí thí nghiệm
          </span>
          <span className="text-xs sm:text-sm font-semibold text-slate-200">
            Phương pháp đo tốc độ bằng Cổng quang điện & Đồng hồ hiện số MC-964
          </span>
        </div>
        <span className="text-[11px] text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/30 font-mono hidden sm:inline-block">
          MODE A & MODE A ↔ B
        </span>
      </div>

      {/* SVG Canvas with 2 sub-diagrams: Left = Average Speed (2 gates), Right = Instantaneous Speed (1 gate + flag d) */}
      <div className="relative flex-1 w-full my-1 flex items-center justify-center">
        <svg
          viewBox="0 0 920 440"
          className="w-full h-full object-contain"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Defs */}
          <defs>
            <pattern id="photoGrid" width="30" height="30" patternUnits="userSpaceOnUse">
              <path d="M 30 0 L 0 0 0 30" fill="none" stroke="rgba(0, 212, 255, 0.05)" strokeWidth="1" />
            </pattern>
            <linearGradient id="gateGradA" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#B45309" />
            </linearGradient>
            <linearGradient id="gateGradB" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#10B981" />
              <stop offset="100%" stopColor="#047857" />
            </linearGradient>
            <linearGradient id="timerLcdGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#021E19" />
              <stop offset="100%" stopColor="#01120F" />
            </linearGradient>
          </defs>
          <rect width="920" height="440" fill="url(#photoGrid)" />

          {/* Central Divider */}
          <line x1="460" y1="20" x2="460" y2="420" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" strokeDasharray="4 4" />

          {/* ========================================================================= */}
          {/* LEFT HALF: 1. ĐO TỐC ĐỘ TRUNG BÌNH (2 CỔNG QUANG ĐIỆN A & B, MODE A <-> B) */}
          {/* ========================================================================= */}
          <g transform="translate(15, 10)">
            {/* Section Badge */}
            <rect x="10" y="8" width="220" height="24" rx="6" fill="#0284C7" fillOpacity="0.2" stroke="#38BDF8" strokeWidth="1" />
            <text x="20" y="24" fill="#38BDF8" fontSize="11" fontWeight="bold">1. ĐO TỐC ĐỘ TRUNG BÌNH (v_tb)</text>

            {/* Incline Track Segment */}
            <g transform="translate(20, 120)">
              {/* Track Bed */}
              <rect x="0" y="0" width="380" height="14" rx="3" fill="#1E293B" stroke="#00D4FF" strokeWidth="1.5" />
              {/* Ruler ticks */}
              {Array.from({ length: 19 }).map((_, i) => (
                <line key={i} x1={15 + i * 19} y1="0" x2={15 + i * 19} y2="4" stroke="#94A3B8" strokeWidth="1" />
              ))}

              {/* Photogate A */}
              <g transform="translate(60, -45)">
                <path d="M 0 0 L 14 0 L 14 55 L 0 55 L 0 45 L 7 45 L 7 10 L 0 10 Z" fill="#0F172A" stroke="#F59E0B" strokeWidth="2" />
                <line x1="7" y1="10" x2="7" y2="45" stroke="#F59E0B" strokeWidth="2" strokeDasharray="2 2" />
                <rect x="-10" y="-18" width="50" height="16" rx="3" fill="#0F172A" stroke="#F59E0B" strokeWidth="1" />
                <text x="-4" y="-6" fill="#F59E0B" fontSize="9" fontWeight="bold">CỔNG A</text>
              </g>

              {/* Photogate B */}
              <g transform="translate(280, -45)">
                <path d="M 0 0 L 14 0 L 14 55 L 0 55 L 0 45 L 7 45 L 7 10 L 0 10 Z" fill="#0F172A" stroke="#10B981" strokeWidth="2" />
                <line x1="7" y1="10" x2="7" y2="45" stroke="#10B981" strokeWidth="2" strokeDasharray="2 2" />
                <rect x="-10" y="-18" width="50" height="16" rx="3" fill="#0F172A" stroke="#10B981" strokeWidth="1" />
                <text x="-4" y="-6" fill="#10B981" fontSize="9" fontWeight="bold">CỔNG B</text>
              </g>

              {/* Cart moving from A to B */}
              <g transform="translate(140, -22)">
                <rect x="0" y="0" width="52" height="16" rx="3" fill="#0284C7" stroke="#38BDF8" strokeWidth="1.2" />
                <rect x="22" y="-18" width="8" height="18" fill="#EF4444" rx="1" />
                <circle cx="10" cy="18" r="4" fill="#475569" stroke="#94A3B8" />
                <circle cx="42" cy="18" r="4" fill="#475569" stroke="#94A3B8" />
                {/* Motion arrow */}
                <path d="M 58 8 L 74 8 M 70 4 L 74 8 L 70 12" stroke="#00FFCC" strokeWidth="2" strokeLinecap="round" />
              </g>

              {/* Distance dimension s_AB */}
              <g transform="translate(67, -65)">
                <line x1="0" y1="0" x2="220" y2="0" stroke="#00D4FF" strokeWidth="1.5" />
                <line x1="0" y1="-4" x2="0" y2="4" stroke="#00D4FF" strokeWidth="1.5" />
                <line x1="220" y1="-4" x2="220" y2="4" stroke="#00D4FF" strokeWidth="1.5" />
                <rect x="65" y="-10" width="90" height="20" rx="4" fill="#09152B" stroke="#00D4FF" strokeWidth="1" />
                <text x="73" y="4" fill="#00D4FF" fontSize="11" fontWeight="bold">Quãng đường s</text>
              </g>
            </g>

            {/* Timer MC-964 box in Mode A <-> B */}
            <g transform="translate(45, 190)">
              <rect x="0" y="0" width="340" height="135" rx="8" fill="#0F172A" stroke="#00D4FF" strokeWidth="1.5" />
              <text x="14" y="20" fill="#00D4FF" fontSize="10" fontWeight="bold">ĐỒNG HỒ HIỆN SỐ (MODE A ↔ B)</text>
              
              {/* LCD */}
              <rect x="14" y="30" width="160" height="48" rx="5" fill="url(#timerLcdGrad)" stroke="#00FFCC" strokeWidth="1.2" />
              <text x="26" y="64" fill="#00FFCC" fontSize="24" fontFamily="monospace" fontWeight="bold">0.848 s</text>
              <text x="14" y="92" fill="#94A3B8" fontSize="9">Đo thời gian t_AB xe đi từ A đến B</text>

              {/* Explanation notes */}
              <rect x="185" y="30" width="142" height="92" rx="5" fill="#1E293B" stroke="#334155" />
              <text x="193" y="46" fill="#FCD34D" fontSize="8.5" fontWeight="bold">Cơ chế hoạt động:</text>
              <text x="193" y="60" fill="#E2E8F0" fontSize="8">• Cờ qua A: Bắt đầu đếm</text>
              <text x="193" y="74" fill="#E2E8F0" fontSize="8">• Cờ qua B: Dừng đếm</text>
              <text x="193" y="88" fill="#E2E8F0" fontSize="8">• Lưu chính xác thời gian t</text>
              <text x="193" y="104" fill="#38BDF8" fontSize="8">• Δt_dc = 0,001 s</text>
            </g>

            {/* Formula banner */}
            <g transform="translate(45, 340)">
              <rect x="0" y="0" width="340" height="42" rx="6" fill="#021B17" stroke="#00FFCC" strokeWidth="1.2" />
              <text x="16" y="26" fill="#00FFCC" fontSize="13" fontWeight="bold">Công thức: v_tb = s_AB / t_AB</text>
            </g>
          </g>

          {/* ========================================================================= */}
          {/* RIGHT HALF: 2. ĐO TỐC ĐỘ TỨC THỜI (1 CỔNG QUANG ĐIỆN A, MODE A, CỜ d=10mm) */}
          {/* ========================================================================= */}
          <g transform="translate(480, 10)">
            {/* Section Badge */}
            <rect x="10" y="8" width="230" height="24" rx="6" fill="#10B981" fillOpacity="0.2" stroke="#34D399" strokeWidth="1" />
            <text x="20" y="24" fill="#34D399" fontSize="11" fontWeight="bold">2. ĐO TỐC ĐỘ TỨC THỜI (v_tức thời)</text>

            {/* Incline Track Segment with 1 Gate & Zoomed Flag */}
            <g transform="translate(20, 120)">
              {/* Track Bed */}
              <rect x="0" y="0" width="380" height="14" rx="3" fill="#1E293B" stroke="#00D4FF" strokeWidth="1.5" />
              {/* Ruler ticks */}
              {Array.from({ length: 19 }).map((_, i) => (
                <line key={i} x1={15 + i * 19} y1="0" x2={15 + i * 19} y2="4" stroke="#94A3B8" strokeWidth="1" />
              ))}

              {/* Single Photogate A */}
              <g transform="translate(170, -45)">
                <path d="M 0 0 L 16 0 L 16 55 L 0 55 L 0 45 L 8 45 L 8 10 L 0 10 Z" fill="#0F172A" stroke="#F59E0B" strokeWidth="2.2" />
                <line x1="8" y1="10" x2="8" y2="45" stroke="#F59E0B" strokeWidth="2.5" strokeDasharray="2 2" />
                <rect x="-14" y="-18" width="60" height="16" rx="3" fill="#0F172A" stroke="#F59E0B" strokeWidth="1" />
                <text x="-8" y="-6" fill="#F59E0B" fontSize="9" fontWeight="bold">CỔNG A (Mode A)</text>
              </g>

              {/* Cart exactly passing through Gate A */}
              <g transform="translate(142, -22)">
                <rect x="0" y="0" width="52" height="16" rx="3" fill="#0284C7" stroke="#38BDF8" strokeWidth="1.2" />
                {/* Highlighted light-blocking flag */}
                <rect x="22" y="-22" width="10" height="22" fill="#EF4444" stroke="#FECACA" strokeWidth="1.2" rx="1" />
                <circle cx="10" cy="18" r="4" fill="#475569" stroke="#94A3B8" />
                <circle cx="42" cy="18" r="4" fill="#475569" stroke="#94A3B8" />
                {/* Motion arrow */}
                <path d="M 58 8 L 74 8 M 70 4 L 74 8 L 70 12" stroke="#00FFCC" strokeWidth="2" strokeLinecap="round" />
              </g>

              {/* Flag width d callout */}
              <g transform="translate(145, -68)">
                <rect x="0" y="0" width="85" height="20" rx="4" fill="#09152B" stroke="#EF4444" strokeWidth="1.2" />
                <text x="6" y="14" fill="#EF4444" fontSize="10" fontWeight="bold">Bề rộng d = 10mm</text>
                <line x1="28" y1="20" x2="28" y2="28" stroke="#EF4444" strokeWidth="1.5" />
              </g>
            </g>

            {/* Timer MC-964 box in Mode A */}
            <g transform="translate(45, 190)">
              <rect x="0" y="0" width="340" height="135" rx="8" fill="#0F172A" stroke="#10B981" strokeWidth="1.5" />
              <text x="14" y="20" fill="#10B981" fontSize="10" fontWeight="bold">ĐỒNG HỒ HIỆN SỐ (MODE A)</text>
              
              {/* LCD */}
              <rect x="14" y="30" width="160" height="48" rx="5" fill="url(#timerLcdGrad)" stroke="#00FFCC" strokeWidth="1.2" />
              <text x="26" y="64" fill="#00FFCC" fontSize="24" fontFamily="monospace" fontWeight="bold">0.014 s</text>
              <text x="14" y="92" fill="#94A3B8" fontSize="9">Thời gian Δt cờ chắn chùm tia tại A</text>

              {/* Explanation notes */}
              <rect x="185" y="30" width="142" height="92" rx="5" fill="#1E293B" stroke="#334155" />
              <text x="193" y="46" fill="#34D399" fontSize="8.5" fontWeight="bold">Cơ chế hoạt động:</text>
              <text x="193" y="60" fill="#E2E8F0" fontSize="8">• Cờ chắn tia: Đếm giờ</text>
              <text x="193" y="74" fill="#E2E8F0" fontSize="8">• Cờ qua hết: Ngắt đếm</text>
              <text x="193" y="88" fill="#E2E8F0" fontSize="8">• Δt rất ngắn (chuyển động</text>
              <text x="193" y="100" fill="#E2E8F0" fontSize="8">  coi là đều qua cổng)</text>
            </g>

            {/* Formula banner */}
            <g transform="translate(45, 340)">
              <rect x="0" y="0" width="340" height="42" rx="6" fill="#021B17" stroke="#34D399" strokeWidth="1.2" />
              <text x="16" y="26" fill="#34D399" fontSize="13" fontWeight="bold">Công thức: v_tức thời = d / Δt</text>
            </g>
          </g>
        </svg>
      </div>

      {/* Legend Footer */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 border-t border-white/10 text-[11px] text-slate-300">
        <div className="flex items-center gap-1.5">
          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#00D4FF] text-slate-950 font-bold text-[9px]">A</span>
          <span>Mode A ↔ B: Đo tốc độ trung bình</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#10B981] text-slate-950 font-bold text-[9px]">B</span>
          <span>Mode A: Đo tốc độ tức thời</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#EF4444] text-white font-bold text-[9px]">d</span>
          <span>Cờ chắn sáng chuẩn d = 10 mm</span>
        </div>
      </div>
    </div>
  );
};

// Vector SVG schematic illustration for Lesson 6 (Hình 6.1 SGK: Bộ dụng cụ đo tốc độ chuyển động)
export const Lesson6ApparatusSvg: React.FC = () => {
  return (
    <div className="relative w-full aspect-[16/9] min-h-[300px] max-h-[460px] rounded-2xl overflow-hidden bg-gradient-to-b from-[#060D1E] via-[#0A162B] to-[#040915] border border-cyan-500/25 p-4 flex flex-col justify-between shadow-inner select-none">
      {/* Header Banner */}
      <div className="flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-md bg-[#00D4FF]/20 text-[#00D4FF] border border-[#00D4FF]/40 text-xs font-bold uppercase tracking-wider">
            Hình 6.1 SGK KNTT
          </span>
          <span className="text-xs sm:text-sm font-semibold text-slate-200">
            Sơ đồ bố trí dụng cụ thực hành đo tốc độ của vật chuyển động
          </span>
        </div>
        <span className="text-[11px] text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/30 font-mono hidden sm:inline-block">
          Sơ đồ chuẩn GDPT 2018
        </span>
      </div>

      {/* SVG Canvas */}
      <div className="relative flex-1 w-full my-1 flex items-center justify-center">
        <svg
          viewBox="0 0 880 440"
          className="w-full h-full object-contain"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Background Laboratory Grid Pattern */}
          <defs>
            <pattern id="labGrid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(0, 212, 255, 0.05)" strokeWidth="1" />
            </pattern>
            <linearGradient id="trackGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#334155" />
              <stop offset="50%" stopColor="#1E293B" />
              <stop offset="100%" stopColor="#0F172A" />
            </linearGradient>
            <linearGradient id="metalGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#64748B" />
              <stop offset="50%" stopColor="#475569" />
              <stop offset="100%" stopColor="#1E293B" />
            </linearGradient>
            <linearGradient id="beamGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgba(245, 158, 11, 0.9)" />
              <stop offset="50%" stopColor="rgba(245, 158, 11, 0.2)" />
              <stop offset="100%" stopColor="rgba(245, 158, 11, 0.9)" />
            </linearGradient>
          </defs>
          <rect width="880" height="440" fill="url(#labGrid)" />

          {/* Workbench / Table surface */}
          <rect x="30" y="380" width="820" height="12" rx="4" fill="#1E293B" stroke="#334155" strokeWidth="1.5" />
          <line x1="120" y1="392" x2="120" y2="430" stroke="#334155" strokeWidth="4" />
          <line x1="760" y1="392" x2="760" y2="430" stroke="#334155" strokeWidth="4" />

          {/* Support Incline Stand & Elevation Wedge (Trụ đỡ & Khối nêm tạo độ dốc) */}
          <path d="M 90 380 L 130 170 L 150 170 L 150 380 Z" fill="#334155" stroke="#475569" strokeWidth="2" />
          <circle cx="140" cy="180" r="6" fill="#00D4FF" />
          <line x1="140" y1="180" x2="140" y2="380" stroke="#00D4FF" strokeWidth="1" strokeDasharray="3 3" />

          {/* Incline Track - Máng định hướng nhôm (Item 1) */}
          {/* Angle ~ 12 degrees */}
          <g transform="translate(110, 160) rotate(14)">
            {/* Track Base */}
            <rect x="0" y="0" width="620" height="24" rx="4" fill="url(#trackGrad)" stroke="#00D4FF" strokeWidth="2" />

            {/* Millimeter Ruler on Track */}
            <rect x="10" y="4" width="600" height="8" fill="#0F172A" />
            {Array.from({ length: 31 }).map((_, idx) => (
              <g key={idx} transform={`translate(${15 + idx * 19}, 4)`}>
                <line x1="0" y1="0" x2="0" y2="6" stroke="#94A3B8" strokeWidth="1" />
                {idx % 5 === 0 && (
                  <text x="-4" y="14" fill="#00FFCC" fontSize="6" fontFamily="sans-serif">
                    {idx * 3}
                  </text>
                )}
              </g>
            ))}

            {/* Electromagnet Holder at top of track (Item 6) */}
            <g transform="translate(10, -22)">
              <rect x="0" y="0" width="28" height="22" rx="3" fill="#0F172A" stroke="#EF4444" strokeWidth="1.5" />
              <rect x="24" y="6" width="6" height="10" fill="#EF4444" />
              <text x="4" y="14" fill="#EF4444" fontSize="7" fontWeight="bold">NCĐ</text>
            </g>

            {/* Dynamics Cart - Xe con thí nghiệm (Item 2) */}
            <g transform="translate(50, -24)">
              {/* Cart Body */}
              <rect x="0" y="0" width="65" height="20" rx="4" fill="#0284C7" stroke="#38BDF8" strokeWidth="1.5" />
              <rect x="5" y="4" width="55" height="6" rx="2" fill="#0369A1" />

              {/* Light-blocking Flag - Cờ chắn sáng d = 10mm (Item 3) */}
              <rect x="27" y="-30" width="10" height="30" fill="#EF4444" stroke="#FECACA" strokeWidth="0.8" rx="1" />
              <text x="12" y="-35" fill="#EF4444" fontSize="9" fontWeight="bold">d=10mm</text>

              {/* Wheels */}
              <circle cx="12" cy="22" r="6" fill="#475569" stroke="#94A3B8" strokeWidth="1.5" />
              <circle cx="53" cy="22" r="6" fill="#475569" stroke="#94A3B8" strokeWidth="1.5" />
              <circle cx="12" cy="22" r="2" fill="#CBD5E1" />
              <circle cx="53" cy="22" r="2" fill="#CBD5E1" />
            </g>

            {/* Photogate A - Cổng quang điện A (Item 4A) */}
            <g transform="translate(190, -50)">
              {/* C-shaped Optical Gate */}
              <path
                d="M 0 0 L 16 0 L 16 65 L 0 65 L 0 52 L 8 52 L 8 13 L 0 13 Z"
                fill="#0F172A"
                stroke="#F59E0B"
                strokeWidth="2"
              />
              {/* IR Emitter / Detector LED */}
              <circle cx="8" cy="7" r="3" fill="#F59E0B" />
              <circle cx="8" cy="58" r="3" fill="#F59E0B" />
              {/* Infrared Beam */}
              <line x1="8" y1="10" x2="8" y2="55" stroke="url(#beamGrad)" strokeWidth="2" strokeDasharray="3 2" />
              <text x="-12" y="-6" fill="#F59E0B" fontSize="10" fontWeight="bold">CỔNG A</text>
            </g>

            {/* Photogate B - Cổng quang điện B (Item 4B) */}
            <g transform="translate(430, -50)">
              {/* C-shaped Optical Gate */}
              <path
                d="M 0 0 L 16 0 L 16 65 L 0 65 L 0 52 L 8 52 L 8 13 L 0 13 Z"
                fill="#0F172A"
                stroke="#10B981"
                strokeWidth="2"
              />
              {/* IR Emitter / Detector LED */}
              <circle cx="8" cy="7" r="3" fill="#10B981" />
              <circle cx="8" cy="58" r="3" fill="#10B981" />
              {/* Infrared Beam */}
              <line x1="8" y1="10" x2="8" y2="55" stroke="#10B981" strokeWidth="2" strokeDasharray="3 2" opacity="0.8" />
              <text x="-12" y="-6" fill="#10B981" fontSize="10" fontWeight="bold">CỔNG B</text>
            </g>

            {/* Distance between Gate A and Gate B label */}
            <g transform="translate(200, -70)">
              <line x1="0" y1="0" x2="240" y2="0" stroke="#00D4FF" strokeWidth="1.5" />
              <line x1="0" y1="-5" x2="0" y2="5" stroke="#00D4FF" strokeWidth="1.5" />
              <line x1="240" y1="-5" x2="240" y2="5" stroke="#00D4FF" strokeWidth="1.5" />
              <rect x="75" y="-12" width="90" height="18" rx="4" fill="#0C1528" stroke="#00D4FF" strokeWidth="1" />
              <text x="82" y="1" fill="#00D4FF" fontSize="10" fontWeight="bold">Quãng đường s</text>
            </g>
          </g>

          {/* Connection Cables from Photogates & Magnet to Digital Timer */}
          {/* Cable A (Yellow) */}
          <path d="M 280 230 Q 320 310 490 310" fill="none" stroke="#F59E0B" strokeWidth="1.5" strokeDasharray="4 2" opacity="0.7" />
          {/* Cable B (Green) */}
          <path d="M 520 280 Q 540 320 530 320" fill="none" stroke="#10B981" strokeWidth="1.5" strokeDasharray="4 2" opacity="0.7" />

          {/* Digital Timer MC-964 (Item 5) */}
          <g transform="translate(450, 245)">
            {/* Outer Box */}
            <rect x="0" y="0" width="220" height="135" rx="10" fill="#0F172A" stroke="#00D4FF" strokeWidth="2" />
            <rect x="8" y="8" width="204" height="22" rx="4" fill="#1E293B" />
            <text x="16" y="23" fill="#00D4FF" fontSize="9" fontWeight="bold">ĐỒNG HỒ ĐO HIỆN SỐ MC-964</text>

            {/* Mode Indicator */}
            <rect x="145" y="12" width="60" height="14" rx="3" fill="#021B17" stroke="#00FFCC" strokeWidth="0.8" />
            <text x="150" y="22" fill="#00FFCC" fontSize="7.5" fontWeight="bold">MODE A ↔ B</text>

            {/* LED Display Screen */}
            <rect x="12" y="36" width="130" height="46" rx="6" fill="#021B17" stroke="#00FFCC" strokeWidth="1.5" />
            <text x="24" y="68" fill="#00FFCC" fontSize="26" fontFamily="monospace" fontWeight="bold">0.848</text>
            <text x="120" y="68" fill="#00FFCC" fontSize="12" fontFamily="monospace">s</text>

            {/* Scale indicator */}
            <text x="16" y="94" fill="#94A3B8" fontSize="8">Thang: 9,999s (ĐCNN: 0,001s)</text>

            {/* Control Buttons & Sockets */}
            <circle cx="165" cy="50" r="9" fill="#DC2626" stroke="#EF4444" strokeWidth="1" />
            <text x="152" y="53" fill="#FFFFFF" fontSize="6.5" fontWeight="bold">RESET</text>

            <circle cx="195" cy="50" r="9" fill="#2563EB" stroke="#60A5FA" strokeWidth="1" />
            <text x="184" y="53" fill="#FFFFFF" fontSize="6.5" fontWeight="bold">MODE</text>

            {/* Sockets A and B */}
            <circle cx="165" cy="85" r="7" fill="#000000" stroke="#F59E0B" strokeWidth="2" />
            <text x="162" y="103" fill="#F59E0B" fontSize="8" fontWeight="bold">Ổ A</text>

            <circle cx="195" cy="85" r="7" fill="#000000" stroke="#10B981" strokeWidth="2" />
            <text x="192" y="103" fill="#10B981" fontSize="8" fontWeight="bold">Ổ B</text>

            {/* Power Switch & Ground */}
            <rect x="14" y="108" width="30" height="12" rx="2" fill="#334155" />
            <text x="18" y="117" fill="#E2E8F0" fontSize="7">BẬT/TẮT</text>
          </g>

          {/* Manual Stopwatch & Tape Measure Table Accessories (Item 7) */}
          <g transform="translate(690, 290)">
            {/* Stopwatch */}
            <circle cx="35" cy="45" r="22" fill="#1E293B" stroke="#F59E0B" strokeWidth="1.5" />
            <circle cx="35" cy="45" r="18" fill="#021B17" stroke="#00FFCC" strokeWidth="1" />
            <text x="24" y="49" fill="#00FFCC" fontSize="10" fontFamily="monospace" fontWeight="bold">0.85</text>
            <rect x="32" y="19" width="6" height="5" fill="#F59E0B" />
            <text x="10" y="80" fill="#E2E8F0" fontSize="8" fontWeight="bold">Đồng hồ bấm giây</text>

            {/* Tape measure */}
            <rect x="75" y="32" width="28" height="24" rx="4" fill="#F59E0B" stroke="#B45309" strokeWidth="1" />
            <path d="M 75 44 L 60 44" stroke="#FCD34D" strokeWidth="3" />
            <text x="68" y="70" fill="#E2E8F0" fontSize="8" fontWeight="bold">Thước cuộn</text>
          </g>

          {/* NUMBERED CALLOUT BADGES (1 to 7 matching SGK 6.1 list in user prompt) */}
          {/* (1) Máng định hướng */}
          <g transform="translate(340, 165)">
            <circle cx="12" cy="12" r="11" fill="#00D4FF" />
            <text x="8.5" y="16" fill="#040D1A" fontSize="12" fontWeight="bold">1</text>
          </g>
          {/* (2) Xe con */}
          <g transform="translate(195, 140)">
            <circle cx="12" cy="12" r="11" fill="#00D4FF" />
            <text x="8.5" y="16" fill="#040D1A" fontSize="12" fontWeight="bold">2</text>
          </g>
          {/* (3) Tấm chắn sáng d=10mm */}
          <g transform="translate(175, 95)">
            <circle cx="12" cy="12" r="11" fill="#00D4FF" />
            <text x="8.5" y="16" fill="#040D1A" fontSize="12" fontWeight="bold">3</text>
          </g>
          {/* (4) Hai cổng quang điện */}
          <g transform="translate(480, 145)">
            <circle cx="12" cy="12" r="11" fill="#00D4FF" />
            <text x="8.5" y="16" fill="#040D1A" fontSize="12" fontWeight="bold">4</text>
          </g>
          {/* (5) Đồng hồ hiện số MC-964 */}
          <g transform="translate(430, 240)">
            <circle cx="12" cy="12" r="11" fill="#00D4FF" />
            <text x="8.5" y="16" fill="#040D1A" fontSize="12" fontWeight="bold">5</text>
          </g>
          {/* (6) Nam châm điện */}
          <g transform="translate(90, 130)">
            <circle cx="12" cy="12" r="11" fill="#00D4FF" />
            <text x="8.5" y="16" fill="#040D1A" fontSize="12" fontWeight="bold">6</text>
          </g>
          {/* (7) Thước cuộn & đồng hồ bấm giây */}
          <g transform="translate(730, 270)">
            <circle cx="12" cy="12" r="11" fill="#00D4FF" />
            <text x="8.5" y="16" fill="#040D1A" fontSize="12" fontWeight="bold">7</text>
          </g>
        </svg>
      </div>

      {/* Legend Footer */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 pt-2 border-t border-white/10 text-[11px] text-slate-300">
        <div className="flex items-center gap-1.5">
          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#00D4FF] text-slate-950 font-bold text-[9px]">1</span>
          <span>Máng dẫn hướng</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#00D4FF] text-slate-950 font-bold text-[9px]">2</span>
          <span>Xe con thí nghiệm</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#00D4FF] text-slate-950 font-bold text-[9px]">3</span>
          <span>Cờ chắn sáng d=10mm</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#00D4FF] text-slate-950 font-bold text-[9px]">4</span>
          <span>Cổng quang A & B</span>
        </div>
      </div>
    </div>
  );
};

export const ApparatusIllustrationCard: React.FC<ApparatusIllustrationCardProps> = ({
  lessonId,
  stepIndex,
  title = 'Dụng cụ thí nghiệm (Hình minh họa chuẩn)',
  subtitle = 'Hình ảnh và sơ đồ trực quan các dụng cụ theo chuẩn SGK KNTT',
  variant = 'apparatus_overview'
}) => {
  const storageKey = `lesson_${lessonId}_apparatus_step_${stepIndex}`;
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load saved custom image from IndexedDB on mount
  useEffect(() => {
    let isMounted = true;
    async function loadSaved() {
      try {
        const saved = await loadPortraitFromDB(storageKey);
        if (saved && isMounted) {
          setImageUrl(saved);
        }
      } catch (e) {
        console.error('Error loading apparatus image:', e);
      }
    }
    loadSaved();
    return () => {
      isMounted = false;
    };
  }, [storageKey]);

  const executeFileUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Vui lòng chọn tệp định dạng hình ảnh (PNG, JPG, WEBP).');
      return;
    }

    try {
      setIsUploading(true);
      const compressed = await compressImage(file, 1920);
      if (compressed) {
        setImageUrl(compressed);
        await savePortraitToDB(storageKey, compressed);
      }
    } catch (err) {
      console.error('Lỗi khi tải hoặc lưu ảnh dụng cụ thí nghiệm:', err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileUpload = (file: File) => {
    executeFileUpload(file);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
    e.target.value = '';
  };

  const handleTriggerUpload = () => {
    fileInputRef.current?.click();
  };

  const executeRemoveImage = async () => {
    setImageUrl(null);
    await deletePortraitFromDB(storageKey);
  };

  const handleRemoveImage = () => {
    executeRemoveImage();
  };

  const handleDownload = () => {
    if (imageUrl) {
      const a = document.createElement('a');
      a.href = imageUrl;
      a.download = `lesson_${lessonId}_apparatus_illustration.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      executeFileUpload(file);
    }
  };

  return (
    <div
      id={`apparatus_illustration_card_${lessonId}_${stepIndex}`}
      className="mt-4 rounded-2xl border border-cyan-500/30 bg-[#071325]/90 p-4 sm:p-5 shadow-xl backdrop-blur-md space-y-3.5 transition-all"
    >
      {/* Card Header with prominent Upload Button */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#00D4FF]/20 text-[#00D4FF] border border-[#00D4FF]/30 shrink-0">
            <ImageIcon className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-sm sm:text-base font-bold text-white leading-snug flex items-center gap-2">
              <span>{title}</span>
              {imageUrl && (
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-semibold">
                  Ảnh tùy chỉnh đã lưu
                </span>
              )}
            </h4>
            {subtitle && (
              <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleInputChange}
          />

          <button
            type="button"
            onClick={handleTriggerUpload}
            disabled={isUploading}
            className={`flex items-center gap-2 rounded-xl border px-3.5 py-2 text-xs sm:text-sm font-bold transition-all cursor-pointer shadow-md ${
              imageUrl
                ? 'border-cyan-500/40 bg-cyan-500/20 text-[#00D4FF] hover:bg-cyan-500/30'
                : 'border-amber-500/60 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 text-slate-950 hover:brightness-110 font-extrabold shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:scale-[1.02]'
            }`}
          >
            <Upload className="h-4 w-4" />
            <span>
              {isUploading
                ? 'Đang tải ảnh...'
                : imageUrl
                ? 'Đổi ảnh khác'
                : 'Tải ảnh minh họa lên'}
            </span>
          </button>

          {imageUrl && (
            <>
              <button
                type="button"
                onClick={() => setIsPreviewOpen(true)}
                className="flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-white/10 transition-colors cursor-pointer"
                title="Phóng to ảnh"
              >
                <Maximize2 className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Phóng to</span>
              </button>

              <button
                type="button"
                onClick={handleDownload}
                className="flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-white/10 transition-colors cursor-pointer"
                title="Tải ảnh về máy"
              >
                <Download className="h-3.5 w-3.5" />
              </button>

              <button
                type="button"
                onClick={handleRemoveImage}
                className="flex items-center gap-1.5 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-300 hover:bg-red-500/20 transition-colors cursor-pointer"
                title="Xóa ảnh tùy chỉnh và quay lại sơ đồ mặc định"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Main Display Area: Uploaded Image OR Vector Default Schematic OR Dropzone */}
      {imageUrl ? (
        <div
          className="relative overflow-hidden rounded-2xl border border-white/15 bg-black/60 shadow-2xl aspect-video flex items-center justify-center group cursor-pointer"
          onClick={() => setIsPreviewOpen(true)}
        >
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-contain rounded-xl transition-transform duration-300 group-hover:scale-[1.01]"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <span className="px-3.5 py-1.5 rounded-xl bg-black/75 text-white text-xs font-bold flex items-center gap-1.5 border border-white/20 shadow-lg backdrop-blur-sm">
              <ZoomIn className="h-4 w-4 text-[#00D4FF]" />
              Nhấn để xem toàn màn hình
            </span>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {/* If photogate method variant, render PhotogateMethodSvg */}
          {variant === 'photogate_method' ||
          title.toLowerCase().includes('cổng quang') ||
          subtitle.toLowerCase().includes('cổng quang') ? (
            <PhotogateMethodSvg />
          ) : lessonId === 6 ? (
            <Lesson6ApparatusSvg />
          ) : (
            /* Drag and drop placeholder zone */
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={handleTriggerUpload}
              className={`relative flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-dashed transition-all cursor-pointer ${
                isDragging
                  ? 'border-[#00D4FF] bg-[#00D4FF]/10'
                  : 'border-white/15 bg-black/30 hover:border-cyan-500/40 hover:bg-black/40'
              }`}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/10 text-[#00D4FF] border border-cyan-500/20 mb-3">
                <Upload className="h-6 w-6" />
              </div>
              <p className="text-sm font-bold text-white text-center">
                Nhấn vào đây hoặc kéo thả ảnh minh họa để tải lên
              </p>
              <p className="text-xs text-slate-400 mt-1 text-center">
                Hỗ trợ định dạng PNG, JPG, WEBP (Tự động lưu trữ ngoại tuyến trên trình duyệt)
              </p>
            </div>
          )}
        </div>
      )}

      {/* Lightbox Fullscreen Modal */}
      {isPreviewOpen && imageUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-md animate-fade-in"
          onClick={() => setIsPreviewOpen(false)}
        >
          <div
            className="relative max-h-[90vh] max-w-[90vw] overflow-hidden rounded-2xl border border-white/20 bg-[#0A1324] shadow-2xl p-2"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-3 border-b border-white/10">
              <span className="text-sm font-bold text-white">{title}</span>
              <button
                type="button"
                onClick={() => setIsPreviewOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-2 flex items-center justify-center max-h-[80vh] overflow-auto">
              <img
                src={imageUrl}
                alt={title}
                className="max-h-[75vh] w-auto object-contain rounded-xl shadow-lg"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
