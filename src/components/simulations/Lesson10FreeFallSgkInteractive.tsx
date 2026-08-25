import React, { useState, useEffect, useRef } from 'react';
import { 
  Flame, 
  RotateCcw, 
  Play, 
  Pause, 
  Compass, 
  Layers, 
  HelpCircle, 
  CheckCircle2, 
  AlertCircle, 
  Info,
  Maximize2,
  Minimize2,
  Sparkles,
  Volume2,
  VolumeX,
  Eye,
  Sliders,
  Check,
  ChevronRight
} from 'lucide-react';

interface Lesson10FreeFallSgkInteractiveProps {
  initialTab?: 'EXP_10_2' | 'WALL_CHECK' | 'EKE_FLOOR';
  compact?: boolean;
}

export const Lesson10FreeFallSgkInteractive: React.FC<Lesson10FreeFallSgkInteractiveProps> = ({
  initialTab = 'EXP_10_2',
  compact = false
}) => {
  // Tabs:
  // 1: Thí nghiệm Hình 10.2 (Đốt sợi chỉ - Dây dọi & Quả nặng rơi tự do)
  // 2: Kiểm tra độ thẳng đứng của tường lớp học bằng Dây dọi (Câu 2)
  // 3: Kiểm tra sàn phẳng bằng Êke tam giác vuông cân & Dây dọi (Hình 10.3 & Câu 3)
  const [activeMode, setActiveMode] = useState<'EXP_10_2' | 'WALL_CHECK' | 'EKE_FLOOR'>(initialTab);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // -------------------------------------------------------------
  // MODE 1: Thí nghiệm Hình 10.2
  // -------------------------------------------------------------
  const [isMatchBurning, setIsMatchBurning] = useState<boolean>(false);
  const [isStringCut, setIsStringCut] = useState<boolean>(false);
  const [ballY, setBallY] = useState<number>(0); // 0 to 100%
  const [ballVelocity, setBallVelocity] = useState<number>(0); // m/s
  const [fallTime, setFallTime] = useState<number>(0); // seconds
  const [gravityG, setGravityG] = useState<number>(9.8); // m/s2
  const [showGuidelines, setShowGuidelines] = useState<boolean>(true);
  const [showVectors, setShowVectors] = useState<boolean>(true);
  const [hasLanded, setHasLanded] = useState<boolean>(false);
  const animRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  // Audio effects synthesizer using Web Audio API
  const playSoundEffect = (type: 'match' | 'drop' | 'land' | 'tick') => {
    if (!soundEnabled) return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      if (type === 'match') {
        // Hissing flame sound
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(400, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.3);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      } else if (type === 'drop') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(220, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(55, ctx.currentTime + 0.4);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.4);
      } else if (type === 'land') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(120, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.15);
      }
    } catch (e) {
      // Audio context might be restricted before user gesture
    }
  };

  const handleIgniteMatch = () => {
    if (isStringCut || isMatchBurning) return;
    setIsMatchBurning(true);
    playSoundEffect('match');

    setTimeout(() => {
      setIsStringCut(true);
      playSoundEffect('drop');
      startTimeRef.current = performance.now();
      
      const animateFall = (now: number) => {
        if (!startTimeRef.current) return;
        const elapsedSec = (now - startTimeRef.current) / 1000;
        // scaled fall: 1.2 meters total height takes ~0.5s with g=9.8
        const totalHeight = 1.2; // m
        const currentDistance = 0.5 * gravityG * elapsedSec * elapsedSec;
        const currentV = gravityG * elapsedSec;

        if (currentDistance >= totalHeight) {
          setBallY(100);
          setBallVelocity(Math.sqrt(2 * gravityG * totalHeight));
          setFallTime(Math.sqrt((2 * totalHeight) / gravityG));
          setHasLanded(true);
          playSoundEffect('land');
        } else {
          setBallY((currentDistance / totalHeight) * 100);
          setBallVelocity(currentV);
          setFallTime(elapsedSec);
          animRef.current = requestAnimationFrame(animateFall);
        }
      };

      animRef.current = requestAnimationFrame(animateFall);
    }, 450);
  };

  const handleResetExp10_2 = () => {
    if (animRef.current) cancelAnimationFrame(animRef.current);
    setIsMatchBurning(false);
    setIsStringCut(false);
    setBallY(0);
    setBallVelocity(0);
    setFallTime(0);
    setHasLanded(false);
    startTimeRef.current = null;
  };

  // -------------------------------------------------------------
  // MODE 2: Kiểm tra tường lớp học bằng Dây dọi (Câu 2)
  // -------------------------------------------------------------
  const [wallTiltAngle, setWallTiltAngle] = useState<number>(0); // degrees (-5 to +5)
  const [wallRoughness, setWallRoughness] = useState<boolean>(false);
  const plumbLineDistanceTop = 8.0; // cm at the anchor point
  // Top distance = 8.0 cm
  // Mid distance = 8.0 - (wallTiltAngle * 0.8) cm
  // Bottom distance = 8.0 - (wallTiltAngle * 1.6) cm
  const distTop = plumbLineDistanceTop;
  const distMid = Number((plumbLineDistanceTop - wallTiltAngle * 0.75 + (wallRoughness ? 1.2 : 0)).toFixed(1));
  const distBot = Number((plumbLineDistanceTop - wallTiltAngle * 1.5 - (wallRoughness ? 0.8 : 0)).toFixed(1));
  const isWallVertical = wallTiltAngle === 0 && !wallRoughness;

  // -------------------------------------------------------------
  // MODE 3: Kiểm tra sàn lớp học bằng Êke tam giác vuông cân & Dây dọi (Hình 10.3 & Câu 3)
  // -------------------------------------------------------------
  const [floorTiltAngle, setFloorTiltAngle] = useState<number>(0); // degrees (-6 to +6)
  const isFloorFlat = floorTiltAngle === 0;

  useEffect(() => {
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, []);

  return (
    <div className="w-full rounded-2xl border border-white/15 bg-gradient-to-b from-[#09152C] via-[#071024] to-[#040A18] p-4 sm:p-5 shadow-2xl space-y-4">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-[#00D4FF] to-blue-600 flex items-center justify-center text-slate-950 font-black shadow-[0_0_15px_rgba(0,212,255,0.4)]">
            <Sparkles className="h-5 w-5 text-slate-950" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-[#00D4FF]/20 text-[#00D4FF] border border-[#00D4FF]/40">
                Mô Phỏng 3D SGK Bài 10
              </span>
              <span className="text-[10px] text-slate-400 font-mono">Hình 10.2 & 10.3</span>
            </div>
            <h3 className="text-base sm:text-lg font-black text-white tracking-tight">
              Thí Nghiệm & Ứng Dụng Phương Rơi Tự Do
            </h3>
          </div>
        </div>

        {/* Sound toggle & quick reset */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              soundEnabled 
                ? 'border-cyan-500/40 bg-cyan-950/30 text-cyan-300' 
                : 'border-white/10 bg-black/20 text-slate-400'
            }`}
            title="Bật / Tắt âm thanh thí nghiệm"
          >
            {soundEnabled ? <Volume2 className="h-3.5 w-3.5 text-cyan-400" /> : <VolumeX className="h-3.5 w-3.5 text-slate-500" />}
            <span className="text-[11px] hidden sm:inline">{soundEnabled ? 'Âm thanh: Bật' : 'Tắt tiếng'}</span>
          </button>
        </div>
      </div>

      {/* 3 Sub-mode Pill Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <button
          onClick={() => { setActiveMode('EXP_10_2'); handleResetExp10_2(); }}
          className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
            activeMode === 'EXP_10_2'
              ? 'border-[#00D4FF] bg-gradient-to-r from-[#00D4FF]/20 to-blue-600/20 text-white shadow-[0_0_15px_rgba(0,212,255,0.25)] font-black'
              : 'border-white/10 bg-[#0B172E] text-slate-300 hover:border-white/20 hover:text-white'
          }`}
        >
          <Flame className={`h-4 w-4 ${activeMode === 'EXP_10_2' ? 'text-amber-400' : 'text-slate-400'}`} />
          <span>1. Thí nghiệm Hình 10.2 (Đốt chỉ)</span>
        </button>

        <button
          onClick={() => setActiveMode('WALL_CHECK')}
          className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
            activeMode === 'WALL_CHECK'
              ? 'border-[#00D4FF] bg-gradient-to-r from-[#00D4FF]/20 to-blue-600/20 text-white shadow-[0_0_15px_rgba(0,212,255,0.25)] font-black'
              : 'border-white/10 bg-[#0B172E] text-slate-300 hover:border-white/20 hover:text-white'
          }`}
        >
          <Layers className={`h-4 w-4 ${activeMode === 'WALL_CHECK' ? 'text-emerald-400' : 'text-slate-400'}`} />
          <span>2. Kiểm tra tường thẳng đứng</span>
        </button>

        <button
          onClick={() => setActiveMode('EKE_FLOOR')}
          className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
            activeMode === 'EKE_FLOOR'
              ? 'border-[#00D4FF] bg-gradient-to-r from-[#00D4FF]/20 to-blue-600/20 text-white shadow-[0_0_15px_rgba(0,212,255,0.25)] font-black'
              : 'border-white/10 bg-[#0B172E] text-slate-300 hover:border-white/20 hover:text-white'
          }`}
        >
          <Compass className={`h-4 w-4 ${activeMode === 'EKE_FLOOR' ? 'text-yellow-400' : 'text-slate-400'}`} />
          <span>3. Êke vuông cân & sàn phẳng (Hình 10.3)</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* MODE 1: THÍ NGHIỆM HÌNH 10.2 (ĐỐT SỢI CHỈ TREO QUẢ NẶNG & DÂY DỌI) */}
      {/* ========================================================================= */}
      {activeMode === 'EXP_10_2' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            
            {/* Visual Canvas (3D Stand & Interactive Flame) */}
            <div className="lg:col-span-7 rounded-xl border border-white/10 bg-[#030914] p-3 relative flex flex-col items-center justify-center overflow-hidden min-h-[360px]">
              
              {/* Background Lab Grid */}
              <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-30 pointer-events-none" />

              {/* Top Banner Tag */}
              <div className="absolute top-2.5 left-2.5 flex items-center gap-2 z-10">
                <span className="px-2 py-0.5 rounded bg-black/60 border border-white/10 text-[10px] font-mono text-cyan-300 backdrop-blur-md">
                  Giá Thí Nghiệm Vật Lí THPT
                </span>
                {isStringCut && (
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    hasLanded ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-amber-500/20 text-amber-300 animate-pulse border border-amber-500/40'
                  }`}>
                    {hasLanded ? '✓ Quả nặng đã chạm đáy' : '⚡ Đang rơi tự do...'}
                  </span>
                )}
              </div>

              {/* Main SVG Rig Visual */}
              <svg className="w-full max-w-[400px] h-[320px]" viewBox="0 0 400 320">
                <defs>
                  {/* Metallic gradient for steel ball */}
                  <radialGradient id="steelBallGrad" cx="35%" cy="35%" r="65%">
                    <stop offset="0%" stopColor="#ffffff" />
                    <stop offset="25%" stopColor="#94a3b8" />
                    <stop offset="70%" stopColor="#1e293b" />
                    <stop offset="100%" stopColor="#0f172a" />
                  </radialGradient>

                  {/* Brass gradient for plumb bob (quả dọi) */}
                  <linearGradient id="brassGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#fef08a" />
                    <stop offset="40%" stopColor="#eab308" />
                    <stop offset="80%" stopColor="#854d0e" />
                    <stop offset="100%" stopColor="#451a03" />
                  </linearGradient>

                  {/* Flame Gradient */}
                  <radialGradient id="flameGrad" cx="50%" cy="80%" r="60%">
                    <stop offset="0%" stopColor="#ffffff" />
                    <stop offset="30%" stopColor="#fef08a" />
                    <stop offset="70%" stopColor="#f97316" />
                    <stop offset="100%" stopColor="#dc2626" />
                  </radialGradient>

                  {/* Glow filter */}
                  <filter id="glowExp" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>

                {/* 1. Stand Base (Đế chân giá chữ U bằng gang xám) */}
                <rect x="50" y="280" width="300" height="14" rx="4" fill="#334155" stroke="#475569" strokeWidth="1.5" />
                <rect x="70" y="275" width="260" height="5" rx="2" fill="#1e293b" />
                {/* Rubber feet */}
                <rect x="60" y="294" width="20" height="4" rx="1" fill="#0f172a" />
                <rect x="320" y="294" width="20" height="4" rx="1" fill="#0f172a" />

                {/* 2. Stand Vertical Rod (Cột đứng bằng inox mạ chrome) */}
                <rect x="310" y="25" width="10" height="255" rx="2" fill="#94a3b8" stroke="#cbd5e1" strokeWidth="1" />
                <rect x="312" y="25" width="3" height="255" fill="#f8fafc" opacity="0.6" />

                {/* 3. Upper Cross Bar (Thanh ngang treo trên) */}
                <rect x="100" y="45" width="230" height="8" rx="2" fill="#64748b" stroke="#475569" strokeWidth="1" />
                {/* Clamp junction */}
                <rect x="306" y="41" width="18" height="16" rx="3" fill="#1e293b" stroke="#94a3b8" strokeWidth="1" />
                <circle cx="315" cy="49" r="3" fill="#cbd5e1" />

                {/* 4. Lower Reference Cross Bar (Thanh ngang dưới) */}
                <rect x="100" y="80" width="230" height="6" rx="2" fill="#475569" opacity="0.7" />
                <rect x="306" y="77" width="18" height="12" rx="2" fill="#1e293b" />

                {/* Vertical Guidelines & Plumb Comparison Axis */}
                {showGuidelines && (
                  <>
                    {/* Falling trajectory line */}
                    <line x1="160" y1="53" x2="160" y2="280" stroke="#00D4FF" strokeWidth="1.5" strokeDasharray="3,3" opacity="0.6" />
                    {/* Plumb line axis */}
                    <line x1="240" y1="53" x2="240" y2="280" stroke="#fbbf24" strokeWidth="1.5" strokeDasharray="3,3" opacity="0.6" />
                    
                    {/* Parallel connection indicators */}
                    <line x1="160" y1="120" x2="240" y2="120" stroke="#ffffff" strokeWidth="0.8" strokeDasharray="2,2" opacity="0.4" />
                    <line x1="160" y1="200" x2="240" y2="200" stroke="#ffffff" strokeWidth="0.8" strokeDasharray="2,2" opacity="0.4" />
                    <text x="200" y="116" fontSize="8" fill="#94a3b8" textAnchor="middle">Phương song song</text>
                  </>
                )}

                {/* ------------------------------------------------ */}
                {/* RIGHT SYSTEM: SỢI DÂY DỌI (PLUMB LINE & PLUMB BOB) */}
                {/* ------------------------------------------------ */}
                {/* Clamp knob */}
                <circle cx="240" cy="49" r="4" fill="#0f172a" stroke="#cbd5e1" strokeWidth="1" />
                {/* String */}
                <line x1="240" y1="53" x2="240" y2="240" stroke="#e2e8f0" strokeWidth="1.2" />
                
                {/* Plumb Bob (Quả dọi bằng đồng - Brass Plumb Bob) */}
                <g transform="translate(240, 240)">
                  {/* Top ring & cylinder */}
                  <circle cx="0" cy="0" r="3" fill="#eab308" />
                  <rect x="-6" y="3" width="12" height="14" rx="2" fill="url(#brassGrad)" stroke="#713f12" strokeWidth="0.8" />
                  {/* Conical tip pointing strictly downward */}
                  <polygon points="-6,17 6,17 0,28" fill="url(#brassGrad)" stroke="#713f12" strokeWidth="0.8" />
                  {/* Sharp tip point */}
                  <circle cx="0" cy="28" r="1" fill="#fef08a" />
                </g>
                <text x="240" y="278" fontSize="9" fill="#fbbf24" fontWeight="bold" textAnchor="middle">
                  Dây dọi
                </text>

                {/* ------------------------------------------------ */}
                {/* LEFT SYSTEM: SỢI CHỈ & QUẢ NẶNG (BALL & THREAD) */}
                {/* ------------------------------------------------ */}
                {/* Clamp knob */}
                <circle cx="160" cy="49" r="4" fill="#0f172a" stroke="#cbd5e1" strokeWidth="1" />

                {/* Upper Thread (Sợi chỉ treo) */}
                {!isStringCut ? (
                  <>
                    <line x1="160" y1="53" x2="160" y2="105" stroke="#ef4444" strokeWidth="1.5" />
                    {/* Burn mark position on string */}
                    <circle cx="160" cy="78" r="2.5" fill="#f97316" />
                  </>
                ) : (
                  <>
                    {/* Cut top piece */}
                    <line x1="160" y1="53" x2="160" y2="76" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="1,2" />
                  </>
                )}

                {/* Falling Ball & Cut bottom thread */}
                {/* Initial Y center = 115, Final Y center = 270 (delta = 155px) */}
                {(() => {
                  const currentCenterY = 115 + (ballY / 100) * 155;
                  return (
                    <g>
                      {/* Trail dots */}
                      {ballY > 10 && (
                        <>
                          <circle cx="160" cy="130" r="2" fill="#00D4FF" opacity="0.4" />
                          <circle cx="160" cy="165" r="2.5" fill="#00D4FF" opacity="0.6" />
                          <circle cx="160" cy="210" r="3" fill="#00D4FF" opacity="0.8" />
                        </>
                      )}

                      {/* Small piece of cut string moving with ball if cut */}
                      {isStringCut && (
                        <line x1="160" y1={currentCenterY - 10} x2="160" y2={currentCenterY - 25} stroke="#ef4444" strokeWidth="1.2" opacity="0.8" />
                      )}

                      {/* Steel Ball (Quả nặng kim loại) */}
                      <circle
                        cx="160"
                        cy={currentCenterY}
                        r="12"
                        fill="url(#steelBallGrad)"
                        stroke="#475569"
                        strokeWidth="1"
                        filter={hasLanded ? 'url(#glowExp)' : undefined}
                      />
                      
                      {/* Metal Ring Hook on top of ball */}
                      <circle cx="160" cy={currentCenterY - 12} r="2.5" fill="none" stroke="#cbd5e1" strokeWidth="1.2" />

                      {/* Vectors (P & v) */}
                      {showVectors && isStringCut && !hasLanded && (
                        <g>
                          {/* Gravity Vector P */}
                          <line x1="160" y1={currentCenterY} x2="160" y2={currentCenterY + 28} stroke="#fbbf24" strokeWidth="2.5" />
                          <polygon points="157,currentCenterY+26 163,currentCenterY+26 160,currentCenterY+32" fill="#fbbf24" />
                          <text x="172" y={currentCenterY + 24} fontSize="8" fill="#fbbf24" fontWeight="bold">P⃗</text>

                          {/* Velocity Vector v */}
                          {ballVelocity > 0.5 && (
                            <>
                              <line x1="160" y1={currentCenterY} x2="160" y2={currentCenterY + Math.min(ballVelocity * 10, 40)} stroke="#10b981" strokeWidth="2" strokeDasharray="3,1" />
                              <text x="146" y={currentCenterY + 20} fontSize="8" fill="#10b981" fontWeight="bold">v⃗</text>
                            </>
                          )}
                        </g>
                      )}

                      <text x="160" y={isStringCut && ballY > 80 ? currentCenterY - 18 : 142} fontSize="9" fill="#94a3b8" fontWeight="bold" textAnchor="middle">
                        Quả nặng
                      </text>
                    </g>
                  );
                })()}

                {/* ------------------------------------------------ */}
                {/* MATCH & FLAME (QUE DIÊM ĐANG ĐỐT) */}
                {/* ------------------------------------------------ */}
                {!isStringCut && (
                  <g className="cursor-pointer" onClick={handleIgniteMatch} title="Nhấn vào que diêm để đốt sợi chỉ">
                    {/* Matchstick wooden body */}
                    <line x1="110" y1="105" x2="152" y2="82" stroke="#d97706" strokeWidth="3" strokeLinecap="round" />
                    {/* Sulfur head */}
                    <circle cx="152" cy="82" r="3.5" fill="#7f1d1d" />

                    {/* Animated Flame */}
                    {isMatchBurning ? (
                      <g transform="translate(155, 78)" filter="url(#glowExp)">
                        <ellipse cx="0" cy="-6" rx="6" ry="9" fill="url(#flameGrad)" />
                        <ellipse cx="0" cy="-4" rx="3" ry="5" fill="#ffffff" />
                      </g>
                    ) : (
                      <g transform="translate(152, 78)">
                        <circle cx="0" cy="-4" r="3" fill="#f97316" opacity="0.8" />
                        <text x="-25" y="-6" fontSize="8" fill="#f97316" fontWeight="bold">🔥 Click để đốt</text>
                      </g>
                    )}
                  </g>
                )}
              </svg>

              {/* Bottom Live Metric Strip */}
              <div className="w-full mt-2 grid grid-cols-3 gap-2 px-2 py-1.5 rounded-lg bg-[#0A1835] border border-white/10 text-center font-mono">
                <div>
                  <span className="text-[9px] text-slate-400 block">Thời gian rơi (t)</span>
                  <span className="text-xs font-bold text-cyan-300">{fallTime.toFixed(3)} s</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 block">Vận tốc rơi (v)</span>
                  <span className="text-xs font-bold text-emerald-400">{ballVelocity.toFixed(2)} m/s</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 block">Quãng đường (h)</span>
                  <span className="text-xs font-bold text-amber-300">{(1.2 * (ballY / 100)).toFixed(2)} m</span>
                </div>
              </div>
            </div>

            {/* Controls & Pedagogical Analysis */}
            <div className="lg:col-span-5 flex flex-col justify-between space-y-3">
              <div className="space-y-3">
                <div className="rounded-xl bg-[#070E1C] border border-white/10 p-3.5 space-y-2">
                  <span className="text-xs font-bold text-[#00D4FF] uppercase tracking-wider flex items-center gap-1.5">
                    <Sliders className="h-3.5 w-3.5" /> Bảng Điều Khiển Thí Nghiệm:
                  </span>

                  {/* Primary Trigger Button */}
                  <button
                    onClick={handleIgniteMatch}
                    disabled={isStringCut}
                    className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg cursor-pointer ${
                      !isStringCut
                        ? 'bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-white shadow-[0_0_20px_rgba(245,158,11,0.35)] active:scale-95'
                        : 'bg-slate-800 text-slate-500 border border-white/5 cursor-not-allowed'
                    }`}
                  >
                    <Flame className="h-4 w-4" />
                    <span>{!isStringCut ? '🔥 Quẹt Diêm Đốt Đứt Sợi Chỉ (Hình 10.2)' : 'Sợi chỉ đã bị đốt đứt'}</span>
                  </button>

                  <button
                    onClick={handleResetExp10_2}
                    className="w-full py-2 px-3 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <RotateCcw className="h-3.5 w-3.5 text-cyan-400" />
                    <span>Đặt lại thí nghiệm ban đầu</span>
                  </button>

                  {/* Checkbox options */}
                  <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs text-slate-300">
                    <label className="flex items-center gap-1.5 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={showGuidelines}
                        onChange={(e) => setShowGuidelines(e.target.checked)}
                        className="rounded border-white/20 bg-slate-800 text-cyan-500"
                      />
                      <span>Đường gióng song song</span>
                    </label>

                    <label className="flex items-center gap-1.5 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={showVectors}
                        onChange={(e) => setShowVectors(e.target.checked)}
                        className="rounded border-white/20 bg-slate-800 text-cyan-500"
                      />
                      <span>Vectơ lực P⃗ và v⃗</span>
                    </label>
                  </div>
                </div>

                {/* Conclusion Callout Card */}
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-3.5 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                    <span>Kết Luận Rút Ra Từ Thí Nghiệm:</span>
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed">
                    Khi đốt đứt sợi chỉ, quả nặng rơi tự do theo quỹ đạo <strong>thẳng đứng</strong>, luôn <strong>song song và trùng với phương của sợi dây dọi</strong>, có chiều <strong>từ trên xuống dưới</strong>.
                  </p>
                </div>
              </div>

              {/* Formula reference */}
              <div className="rounded-lg bg-black/40 border border-white/10 p-2.5 text-center font-mono text-xs text-cyan-300">
                Phương trình: <span className="text-white font-bold">s = ½ g·t²</span> &nbsp;|&nbsp; <span className="text-white font-bold">v = g·t</span>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 2: KIỂM TRA TƯỜNG LỚP HỌC BẰNG DÂY DỌI (CÂU 2) */}
      {/* ========================================================================= */}
      {activeMode === 'WALL_CHECK' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            
            {/* Visual Canvas: Wall cross-section & Plumb line */}
            <div className="lg:col-span-7 rounded-xl border border-white/10 bg-[#030914] p-4 relative flex flex-col items-center justify-center overflow-hidden min-h-[360px]">
              
              <div className="absolute top-2.5 left-2.5 flex items-center gap-2 z-10">
                <span className="px-2 py-0.5 rounded bg-black/60 border border-white/10 text-[10px] font-mono text-emerald-300 backdrop-blur-md">
                  Mô phỏng mặt cắt bức tường & Dây dọi
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  isWallVertical ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                }`}>
                  {isWallVertical ? '✓ TƯỜNG THẲNG ĐỨNG ĐẠT CHUẨN' : '⚠ TƯỜNG BỊ NGHIÊNG / LỆCH'}
                </span>
              </div>

              <svg className="w-full max-w-[380px] h-[300px]" viewBox="0 0 380 300">
                <defs>
                  <linearGradient id="wallTexture" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#475569" />
                    <stop offset="100%" stopColor="#334155" />
                  </linearGradient>
                </defs>

                {/* Ceiling Beam */}
                <rect x="20" y="20" width="340" height="20" rx="2" fill="#1e293b" stroke="#334155" strokeWidth="1" />
                <text x="30" y="34" fontSize="8" fill="#94a3b8">Trần nhà / Mép tường trên</text>

                {/* Floor */}
                <rect x="20" y="270" width="340" height="20" rx="2" fill="#0f172a" stroke="#1e293b" strokeWidth="1" />
                <text x="30" y="284" fontSize="8" fill="#94a3b8">Sàn lớp học</text>

                {/* Wall Plane (Adjusted by wallTiltAngle) */}
                {/* Anchor top at x=80, y=40; Bottom at x=80 + (wallTiltAngle * 10), y=270 */}
                {(() => {
                  const topX = 90;
                  const botX = 90 + wallTiltAngle * 8 + (wallRoughness ? 12 : 0);
                  const wallThickness = 45;

                  return (
                    <g>
                      {/* Wall Solid Body */}
                      <polygon
                        points={`${topX},40 ${topX + wallThickness},40 ${botX + wallThickness},270 ${botX},270`}
                        fill="url(#wallTexture)"
                        stroke="#64748b"
                        strokeWidth="1.5"
                      />
                      {/* Brick lines inside wall */}
                      <line x1={topX + 15} y1="40" x2={botX + 15} y2="270" stroke="#1e293b" strokeWidth="1" opacity="0.4" />
                      <line x1={topX + 30} y1="40" x2={botX + 30} y2="270" stroke="#1e293b" strokeWidth="1" opacity="0.4" />

                      {/* Wall Face Line (Front surface being tested) */}
                      <line
                        x1={topX + wallThickness}
                        y1="40"
                        x2={botX + wallThickness}
                        y2="270"
                        stroke={isWallVertical ? '#10b981' : '#f43f5e'}
                        strokeWidth="2.5"
                      />

                      <text x={topX + 22} y="150" fontSize="9" fill="#f8fafc" fontWeight="bold" transform={`rotate(90, ${topX + 22}, 150)`}>
                        Bề mặt tường
                      </text>
                    </g>
                  );
                })()}

                {/* Plumb Line Hanging from Anchor (Fixed strictly vertical at X = 200) */}
                {/* Anchor bracket */}
                <rect x="195" y="38" width="10" height="6" fill="#cbd5e1" rx="1" />
                {/* String */}
                <line x1="200" y1="44" x2="200" y2="245" stroke="#f8fafc" strokeWidth="1.5" />
                
                {/* Plumb bob */}
                <g transform="translate(200, 245)">
                  <polygon points="-7,0 7,0 0,16" fill="#eab308" stroke="#854d0e" strokeWidth="1" />
                  <circle cx="0" cy="0" r="3" fill="#fef08a" />
                </g>

                {/* 3 Distance Measurement Calipers (d1, d2, d3) */}
                {(() => {
                  const wallTopX = 90 + 45; // 135
                  const wallMidX = 90 + 45 + (wallTiltAngle * 4) + (wallRoughness ? 6 : 0);
                  const wallBotX = 90 + 45 + (wallTiltAngle * 8) + (wallRoughness ? 12 : 0);
                  const plumbX = 200;

                  return (
                    <g>
                      {/* Top measurement (d1) at y=70 */}
                      <line x1={wallTopX} y1="70" x2={plumbX} y2="70" stroke="#38bdf8" strokeWidth="1.5" />
                      <line x1={wallTopX} y1="65" x2={wallTopX} y2="75" stroke="#38bdf8" strokeWidth="1.5" />
                      <line x1={plumbX} y1="65" x2={plumbX} y2="75" stroke="#38bdf8" strokeWidth="1.5" />
                      <rect x={(wallTopX + plumbX) / 2 - 18} y="58" width="36" height="14" rx="3" fill="#0c4a6e" stroke="#38bdf8" strokeWidth="0.8" />
                      <text x={(wallTopX + plumbX) / 2} y="68" fontSize="8" fill="#ffffff" fontWeight="bold" textAnchor="middle">
                        d₁ = {distTop.toFixed(1)} cm
                      </text>

                      {/* Middle measurement (d2) at y=155 */}
                      <line x1={wallMidX} y1="155" x2={plumbX} y2="155" stroke="#38bdf8" strokeWidth="1.5" />
                      <line x1={wallMidX} y1="150" x2={wallMidX} y2="160" stroke="#38bdf8" strokeWidth="1.5" />
                      <line x1={plumbX} y1="150" x2={plumbX} y2="160" stroke="#38bdf8" strokeWidth="1.5" />
                      <rect x={(wallMidX + plumbX) / 2 - 18} y="143" width="36" height="14" rx="3" fill="#0c4a6e" stroke="#38bdf8" strokeWidth="0.8" />
                      <text x={(wallMidX + plumbX) / 2} y="153" fontSize="8" fill="#ffffff" fontWeight="bold" textAnchor="middle">
                        d₂ = {distMid.toFixed(1)} cm
                      </text>

                      {/* Bottom measurement (d3) at y=235 */}
                      <line x1={wallBotX} y1="235" x2={plumbX} y2="235" stroke="#38bdf8" strokeWidth="1.5" />
                      <line x1={wallBotX} y1="230" x2={wallBotX} y2="240" stroke="#38bdf8" strokeWidth="1.5" />
                      <line x1={plumbX} y1="230" x2={plumbX} y2="240" stroke="#38bdf8" strokeWidth="1.5" />
                      <rect x={(wallBotX + plumbX) / 2 - 18} y="223" width="36" height="14" rx="3" fill="#0c4a6e" stroke="#38bdf8" strokeWidth="0.8" />
                      <text x={(wallBotX + plumbX) / 2} y="233" fontSize="8" fill="#ffffff" fontWeight="bold" textAnchor="middle">
                        d₃ = {distBot.toFixed(1)} cm
                      </text>
                    </g>
                  );
                })()}
              </svg>
            </div>

            {/* Controls & Method Explanation */}
            <div className="lg:col-span-5 flex flex-col justify-between space-y-3">
              <div className="space-y-3">
                <div className="rounded-xl bg-[#070E1C] border border-white/10 p-3.5 space-y-3">
                  <span className="text-xs font-bold text-[#00FFCC] uppercase tracking-wider block">
                    ⚙️ Thử Nghiệm Các Trường Hợp Bức Tường:
                  </span>

                  {/* Tilt Slider */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-300">Góc nghiêng bức tường (θ):</span>
                      <span className="font-mono font-bold text-cyan-300">{wallTiltAngle > 0 ? `+${wallTiltAngle}°` : `${wallTiltAngle}°`}</span>
                    </div>
                    <input
                      type="range"
                      min="-4"
                      max="4"
                      step="1"
                      value={wallTiltAngle}
                      onChange={(e) => {
                        setWallTiltAngle(Number(e.target.value));
                        setWallRoughness(false);
                      }}
                      className="w-full accent-cyan-400 cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                      <span>Nghiêng vào (-4°)</span>
                      <span>Thẳng đứng (0°)</span>
                      <span>Nghiêng ra (+4°)</span>
                    </div>
                  </div>

                  {/* Quick Preset Buttons */}
                  <div className="grid grid-cols-3 gap-1.5 pt-1">
                    <button
                      onClick={() => { setWallTiltAngle(0); setWallRoughness(false); }}
                      className={`py-1.5 px-2 rounded-lg text-[11px] font-bold border transition-all cursor-pointer ${
                        wallTiltAngle === 0 && !wallRoughness
                          ? 'bg-emerald-600 text-white border-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                          : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                      }`}
                    >
                      Tường chuẩn 90°
                    </button>

                    <button
                      onClick={() => { setWallTiltAngle(2); setWallRoughness(false); }}
                      className={`py-1.5 px-2 rounded-lg text-[11px] font-bold border transition-all cursor-pointer ${
                        wallTiltAngle === 2
                          ? 'bg-amber-600 text-white border-amber-400'
                          : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                      }`}
                    >
                      Tường nghiêng +2°
                    </button>

                    <button
                      onClick={() => { setWallTiltAngle(0); setWallRoughness(true); }}
                      className={`py-1.5 px-2 rounded-lg text-[11px] font-bold border transition-all cursor-pointer ${
                        wallRoughness
                          ? 'bg-rose-600 text-white border-rose-400'
                          : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                      }`}
                    >
                      Tường lồi lõm
                    </button>
                  </div>
                </div>

                {/* Evaluation Card */}
                <div className={`rounded-xl border p-3.5 space-y-1.5 ${
                  isWallVertical 
                    ? 'border-emerald-500/40 bg-emerald-950/20 text-emerald-200' 
                    : 'border-rose-500/40 bg-rose-950/20 text-rose-200'
                }`}>
                  <div className="flex items-center gap-1.5 text-xs font-bold">
                    {isWallVertical ? <CheckCircle2 className="h-4 w-4 text-emerald-400" /> : <AlertCircle className="h-4 w-4 text-rose-400" />}
                    <span>{isWallVertical ? 'ĐÁNH GIÁ: BỨC TƯỜNG THẲNG ĐỨNG HOÀN HẢO' : 'ĐÁNH GIÁ: BỨC TƯỜNG KHÔNG THẲNG ĐỨNG'}</span>
                  </div>
                  <p className="text-xs leading-relaxed text-slate-200">
                    {isWallVertical ? (
                      <>Khoảng cách từ dây dọi đến tường tại mọi vị trí đều bằng nhau (<strong>d₁ = d₂ = d₃ = {distTop} cm</strong>). Do dây dọi luôn có phương thẳng đứng, bức tường là một <strong>mặt phẳng thẳng đứng</strong>.</>
                    ) : (
                      <>Khoảng cách từ dây dọi đến tường thay đổi (<strong>d₁ = {distTop} cm, d₂ = {distMid} cm, d₃ = {distBot} cm</strong>). Bức tường bị nghiêng hoặc không phẳng.</>
                    )}
                  </p>
                </div>
              </div>

              {/* Method Guide Summary */}
              <div className="rounded-lg bg-black/40 border border-white/10 p-2.5 text-xs text-slate-300 leading-relaxed">
                💡 <strong>Phương pháp thực nghiệm SGK (Câu 2):</strong> Treo dây dọi từ đỉnh tường, dùng thước đo khoảng cách từ dây dọi tới tường ở 3 điểm (trên, giữa, dưới). Nếu 3 khoảng cách bằng nhau $\implies$ Tường thẳng đứng.
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 3: KIỂM TRA SÀN PHẲNG BẰNG ÊKE TAM GIÁC VUÔNG CÂN (HÌNH 10.3 & CÂU 3) */}
      {/* ========================================================================= */}
      {activeMode === 'EKE_FLOOR' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            
            {/* Visual Canvas: 3D Wooden Set Square (Êke tam giác vuông cân) */}
            <div className="lg:col-span-7 rounded-xl border border-white/10 bg-[#030914] p-4 relative flex flex-col items-center justify-center overflow-hidden min-h-[360px]">
              
              <div className="absolute top-2.5 left-2.5 flex items-center gap-2 z-10">
                <span className="px-2 py-0.5 rounded bg-black/60 border border-white/10 text-[10px] font-mono text-yellow-300 backdrop-blur-md">
                  Êke Tam Giác Vuông Cân (Hình 10.3)
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  isFloorFlat ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                }`}>
                  {isFloorFlat ? '✓ SÀN PHẲNG NẰM NGANG CHUẨN' : '⚠ SÀN BỊ NGHIÊNG / DỐC'}
                </span>
              </div>

              <svg className="w-full max-w-[380px] h-[300px]" viewBox="0 0 380 300">
                <defs>
                  {/* Wooden Texture Gradient for Set Square */}
                  <linearGradient id="woodGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#fef08a" />
                    <stop offset="30%" stopColor="#d97706" />
                    <stop offset="70%" stopColor="#b45309" />
                    <stop offset="100%" stopColor="#78350f" />
                  </linearGradient>

                  <linearGradient id="floorGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#1e293b" />
                    <stop offset="100%" stopColor="#0f172a" />
                  </linearGradient>
                </defs>

                {/* Floor Surface - Tilting with floorTiltAngle around center (190, 260) */}
                <g transform={`rotate(${floorTiltAngle}, 190, 260)`}>
                  {/* Floor slab */}
                  <rect x="20" y="260" width="340" height="25" rx="2" fill="url(#floorGrad)" stroke="#475569" strokeWidth="1.5" />
                  {/* Floor tiles pattern */}
                  <line x1="100" y1="260" x2="100" y2="285" stroke="#334155" />
                  <line x1="190" y1="260" x2="190" y2="285" stroke="#334155" />
                  <line x1="280" y1="260" x2="280" y2="285" stroke="#334155" />
                  <text x="40" y="276" fontSize="8" fill="#94a3b8">Mặt sàn lớp học</text>

                  {/* ---------------------------------------------------- */}
                  {/* WOODEN SET SQUARE (ÊKE GỖ TAM GIÁC VUÔNG CÂN) */}
                  {/* Hypotenuse sits on floor, length 240px from (70,260) to (310,260) */}
                  {/* Right-angle vertex at top: (190, 140) => Height = 120px */}
                  {/* ---------------------------------------------------- */}
                  <g id="wooden-eke">
                    {/* Outer Triangle */}
                    <polygon
                      points="70,260 310,260 190,140"
                      fill="url(#woodGrad)"
                      stroke="#451a03"
                      strokeWidth="2"
                    />

                    {/* Inner Triangle Cutout (Hollow Frame like standard carpenter square) */}
                    <polygon
                      points="110,245 270,245 190,165"
                      fill="#030914"
                      stroke="#451a03"
                      strokeWidth="1.5"
                    />

                    {/* Middle Vertical Wooden Rib with Center Altitude Mark Line */}
                    <rect x="187" y="165" width="6" height="80" fill="url(#woodGrad)" />
                    {/* Engraved Black Center Altitude Line (Đường cao / đường trục đối xứng) */}
                    <line x1="190" y1="140" x2="190" y2="245" stroke="#000000" strokeWidth="1.8" strokeDasharray="4,2" />

                    {/* Ruler tick marks on hypotenuse & legs */}
                    <line x1="190" y1="260" x2="190" y2="252" stroke="#451a03" strokeWidth="1.5" />
                    <line x1="150" y1="260" x2="150" y2="255" stroke="#451a03" />
                    <line x1="230" y1="260" x2="230" y2="255" stroke="#451a03" />
                    
                    {/* Angle labels: 45 deg, 90 deg, 45 deg */}
                    <text x="85" y="255" fontSize="7" fill="#451a03" fontWeight="bold">45°</text>
                    <text x="290" y="255" fontSize="7" fill="#451a03" fontWeight="bold">45°</text>
                    <text x="190" y="152" fontSize="7" fill="#451a03" fontWeight="bold" textAnchor="middle">90°</text>
                  </g>
                </g>

                {/* ---------------------------------------------------- */}
                {/* PLUMB LINE HANGING FROM TOP VERTEX (190, 140 when level) */}
                {/* Plumb line ALWAYS points true gravity vertical (no floor tilt rotation) */}
                {/* Pivot point calculates from floor rotation */}
                {/* ---------------------------------------------------- */}
                {(() => {
                  // In rotated floor frame, top vertex is at (190, 140)
                  // Let's compute world coordinates of the vertex:
                  const angleRad = (floorTiltAngle * Math.PI) / 180;
                  const cx = 190;
                  const cy = 260;
                  const vx = 190;
                  const vy = 140;
                  // Rotate (vx, vy) around (cx, cy) by angleRad
                  const worldVertexX = cx + (vx - cx) * Math.cos(angleRad) - (vy - cy) * Math.sin(angleRad);
                  const worldVertexY = cy + (vx - cx) * Math.sin(angleRad) + (vy - cy) * Math.cos(angleRad);

                  const plumbLength = 95;
                  const worldBobX = worldVertexX; // strictly vertical!
                  const worldBobY = worldVertexY + plumbLength;

                  return (
                    <g>
                      {/* Anchor nail/pin at vertex */}
                      <circle cx={worldVertexX} cy={worldVertexY} r="3.5" fill="#f8fafc" stroke="#334155" strokeWidth="1" />

                      {/* Plumb string (Strictly vertical) */}
                      <line
                        x1={worldVertexX}
                        y1={worldVertexY}
                        x2={worldBobX}
                        y2={worldBobY}
                        stroke={isFloorFlat ? '#10b981' : '#f59e0b'}
                        strokeWidth="1.8"
                      />

                      {/* Plumb Bob (Quả dọi kim loại nhỏ) */}
                      <g transform={`translate(${worldBobX}, ${worldBobY})`}>
                        <circle cx="0" cy="0" r="2.5" fill="#eab308" />
                        <polygon points="-4,2 4,2 0,12" fill="#eab308" stroke="#854d0e" strokeWidth="0.8" />
                        <circle cx="0" cy="12" r="0.8" fill="#fef08a" />
                      </g>

                      {/* Alignment indicator text */}
                      {isFloorFlat ? (
                        <g transform={`translate(${worldVertexX + 15}, ${worldVertexY + 50})`}>
                          <rect x="0" y="0" width="85" height="18" rx="3" fill="#065f46" stroke="#10b981" strokeWidth="1" />
                          <text x="42" y="12" fontSize="7" fill="#ffffff" fontWeight="bold" textAnchor="middle">
                            ✓ Trùng vạch đường cao
                          </text>
                        </g>
                      ) : (
                        <g transform={`translate(${worldVertexX + (floorTiltAngle > 0 ? 15 : -95)}, ${worldVertexY + 50})`}>
                          <rect x="0" y="0" width="80" height="18" rx="3" fill="#78350f" stroke="#f59e0b" strokeWidth="1" />
                          <text x="40" y="12" fontSize="7" fill="#ffffff" fontWeight="bold" textAnchor="middle">
                            ⚠ Lệch khỏi vạch ({Math.abs(floorTiltAngle)}°)
                          </text>
                        </g>
                      )}
                    </g>
                  );
                })()}

                {/* Floor horizontal reference line (True Level) */}
                <line x1="20" y1="260" x2="360" y2="260" stroke="#00D4FF" strokeWidth="1" strokeDasharray="3,3" opacity="0.4" />
                <text x="350" y="255" fontSize="7" fill="#00D4FF" textAnchor="end">Mặt phẳng chuẩn ngang</text>
              </svg>
            </div>

            {/* Controls & Geometric Explanation */}
            <div className="lg:col-span-5 flex flex-col justify-between space-y-3">
              <div className="space-y-3">
                <div className="rounded-xl bg-[#070E1C] border border-white/10 p-3.5 space-y-3">
                  <span className="text-xs font-bold text-yellow-300 uppercase tracking-wider block">
                    ⚙️ Thử Nghiệm Độ Nghiêng Của Sàn Nhà:
                  </span>

                  {/* Slider */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-300">Độ dốc của sàn (α):</span>
                      <span className="font-mono font-bold text-yellow-300">{floorTiltAngle > 0 ? `+${floorTiltAngle}°` : `${floorTiltAngle}°`}</span>
                    </div>
                    <input
                      type="range"
                      min="-5"
                      max="5"
                      step="1"
                      value={floorTiltAngle}
                      onChange={(e) => setFloorTiltAngle(Number(e.target.value))}
                      className="w-full accent-yellow-400 cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                      <span>Dốc sang trái (-5°)</span>
                      <span>Thăng bằng (0°)</span>
                      <span>Dốc sang phải (+5°)</span>
                    </div>
                  </div>

                  {/* Presets */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      onClick={() => setFloorTiltAngle(0)}
                      className={`py-1.5 px-2 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                        floorTiltAngle === 0
                          ? 'bg-emerald-600 text-white border-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                          : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                      }`}
                    >
                      Sàn phẳng thăng bằng (0°)
                    </button>

                    <button
                      onClick={() => setFloorTiltAngle(3)}
                      className={`py-1.5 px-2 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                        floorTiltAngle !== 0
                          ? 'bg-amber-600 text-white border-amber-400'
                          : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                      }`}
                    >
                      Sàn dốc nghiêng (+3°)
                    </button>
                  </div>
                </div>

                {/* Analysis Card */}
                <div className={`rounded-xl border p-3.5 space-y-1.5 ${
                  isFloorFlat 
                    ? 'border-emerald-500/40 bg-emerald-950/20 text-emerald-200' 
                    : 'border-amber-500/40 bg-amber-950/20 text-amber-200'
                }`}>
                  <div className="flex items-center gap-1.5 text-xs font-bold">
                    {isFloorFlat ? <CheckCircle2 className="h-4 w-4 text-emerald-400" /> : <AlertCircle className="h-4 w-4 text-amber-400" />}
                    <span>{isFloorFlat ? 'KẾT QUẢ: SÀN LỚP HỌC NẰM NGANG PHẲNG HOÀN TOÀN' : 'KẾT QUẢ: SÀN BỊ DỐC NGHIÊNG'}</span>
                  </div>
                  <p className="text-xs leading-relaxed text-slate-200">
                    {isFloorFlat ? (
                      <>Dây dọi buông từ đỉnh góc vuông <strong>trùng khít với đường cao kẻ từ đỉnh xuống cạnh huyền</strong> của êke tam giác vuông cân $\implies$ Cạnh huyền nằm ngang $\implies$ <strong>Mặt sàn phẳng thăng bằng</strong>.</>
                    ) : (
                      <>Dây dọi bị <strong>lệch khỏi vạch dấu đường cao</strong> một góc đúng bằng góc nghiêng của sàn ({Math.abs(floorTiltAngle)}°) $\implies$ Sàn bị dốc nghiêng.</>
                    )}
                  </p>
                </div>
              </div>

              {/* SGK Question 3 Method */}
              <div className="rounded-lg bg-black/40 border border-white/10 p-2.5 text-xs text-slate-300 leading-relaxed">
                📐 <strong>Cách thực hiện theo SGK (Câu 3):</strong> Áp cạnh huyền của êke tam giác vuông cân vào mặt sàn, treo dây dọi từ đỉnh góc vuông. Quan sát xem dây dọi có trùng với đường cao (đường phân giác $45^\circ$) hay không để kết luận độ phẳng của sàn.
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
