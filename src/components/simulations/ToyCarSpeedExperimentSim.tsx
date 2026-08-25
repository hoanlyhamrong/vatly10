import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Clock,
  Ruler,
  Car,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Sparkles,
  Volume2,
  VolumeX,
  Layers,
  Sliders,
  Award,
  ChevronRight,
  TrendingUp,
  Activity,
  FileSpreadsheet
} from 'lucide-react';
import { InlinePhysicsText, FormattedPhysicsText } from '../ui/FormattedPhysicsText';

interface MeasurementTrial {
  trialNumber: number;
  time: number;
  deltaT: number;
}

export const ToyCarSpeedExperimentSim: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  // Mode selection: 'AUTO' (Cổng đo tự động chuẩn) | 'MANUAL' (Tự bấm tay trải nghiệm phản xạ sai số)
  const [measurementMode, setMeasurementMode] = useState<'AUTO' | 'MANUAL'>('AUTO');
  const [activeTab, setActiveTab] = useState<'SIMULATION' | 'PROCEDURE' | 'DATA_TABLE'>('SIMULATION');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Physical Parameters
  const [trackDistanceM, setTrackDistanceM] = useState<number>(1.0); // Quãng đường s (m)
  const [carSpeedSetting, setCarSpeedSetting] = useState<number>(0.8); // Vận tốc xe (m/s)

  // Simulation Running State
  const [simState, setSimState] = useState<'IDLE' | 'PRE_RUN' | 'MEASURING' | 'FINISHED'>('IDLE');
  const [carPosNorm, setCarPosNorm] = useState<number>(0); // 0 (start pre-run) to 1.3 (passed finish)
  const [stopwatchTime, setStopwatchTime] = useState<number>(0); // s
  const [isStopwatchRunning, setIsStopwatchRunning] = useState<boolean>(false);
  const [reactionLagAlert, setReactionLagAlert] = useState<string | null>(null);

  // Stored Trials Data
  const [trials, setTrials] = useState<MeasurementTrial[]>([
    { trialNumber: 1, time: 1.26, deltaT: 0.01 },
    { trialNumber: 2, time: 1.24, deltaT: 0.01 },
    { trialNumber: 3, time: 1.25, deltaT: 0.00 },
  ]);

  const animRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);
  const measurementStartTimeRef = useRef<number | null>(null);

  // Play Sound helper with Web Audio API
  const playBeep = (freq = 600, duration = 0.1, type: OscillatorType = 'sine') => {
    if (!soundEnabled) return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch {
      // AudioContext not allowed or disabled
    }
  };

  // Reset Simulation
  const handleReset = () => {
    if (animRef.current) cancelAnimationFrame(animRef.current);
    setSimState('IDLE');
    setCarPosNorm(0);
    setStopwatchTime(0);
    setIsStopwatchRunning(false);
    setReactionLagAlert(null);
    lastTimeRef.current = null;
    measurementStartTimeRef.current = null;
  };

  // Start Car Run
  const handleStartCar = () => {
    handleReset();
    setSimState('PRE_RUN');
    playBeep(450, 0.15, 'sawtooth');
    lastTimeRef.current = performance.now();
  };

  // Manual Stopwatch triggers
  const handleManualStartTimer = () => {
    if (simState === 'IDLE') return;
    setIsStopwatchRunning(true);
    measurementStartTimeRef.current = performance.now();
    playBeep(800, 0.08, 'triangle');

    // Check accuracy of pressing start near Line A (carPosNorm ≈ 0.25)
    const accuracyDiff = Math.abs(carPosNorm - 0.25);
    if (accuracyDiff > 0.06) {
      if (carPosNorm < 0.25) {
        setReactionLagAlert('⚠️ Bạn bấm giờ quá sớm (khi xe chưa chạm vạch A)!');
      } else {
        setReactionLagAlert('⚠️ Bạn bấm giờ hơi trễ do độ trễ phản xạ mắt!');
      }
    } else {
      setReactionLagAlert('✅ Bấm Start rất chuẩn ngay vạch A!');
    }
  };

  const handleManualStopTimer = () => {
    if (!isStopwatchRunning) return;
    setIsStopwatchRunning(false);
    playBeep(1000, 0.15, 'sine');

    // Check accuracy of pressing stop near Line B (carPosNorm ≈ 0.95)
    const accuracyDiff = Math.abs(carPosNorm - 0.95);
    if (accuracyDiff > 0.06) {
      if (carPosNorm < 0.95) {
        setReactionLagAlert('⚠️ Bạn dừng đồng hồ trước khi xe chạm vạch B!');
      } else {
        setReactionLagAlert('⚠️ Phản xạ dừng đồng hồ có độ trễ nhỏ sau vạch B (+0.1s)!');
      }
    } else {
      setReactionLagAlert('🎯 Bấm Stop cực chuẩn khi xe cán đích!');
    }
  };

  // Record Current Time into Table
  const handleRecordTrial = () => {
    if (stopwatchTime <= 0) return;
    const newTrialNum = trials.length + 1;
    const newTrial: MeasurementTrial = {
      trialNumber: newTrialNum,
      time: parseFloat(stopwatchTime.toFixed(2)),
      deltaT: 0,
    };
    const updated = [...trials, newTrial];

    // Recalculate average and deltaT
    const avgTime = updated.reduce((acc, t) => acc + t.time, 0) / updated.length;
    const recalculated = updated.map((t) => ({
      ...t,
      deltaT: parseFloat(Math.abs(avgTime - t.time).toFixed(3)),
    }));

    setTrials(recalculated);
    playBeep(900, 0.2, 'sine');
  };

  // Clear Trials
  const handleClearTrials = () => {
    setTrials([]);
  };

  // Animation Loop
  useEffect(() => {
    if (simState === 'IDLE') return;

    const updateCar = (now: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = now;
      const dt = (now - lastTimeRef.current) / 1000;
      lastTimeRef.current = now;

      // Position logic:
      // 0.0 -> 0.25: Pre-run zone (lấy đà trước vạch A)
      // 0.25 -> 0.95: Main track AB (khoảng đo s = 1m)
      // 0.95 -> 1.15: Post-run zone (sau vạch B)
      const trackPixelsLength = 0.70; // 0.95 - 0.25 = 0.70 of screen
      const normalizedSpeed = (carSpeedSetting / trackDistanceM) * trackPixelsLength;

      setCarPosNorm((prev) => {
        const nextPos = prev + normalizedSpeed * dt;

        // Transition from PRE_RUN to MEASURING at Line A (pos = 0.25)
        if (prev < 0.25 && nextPos >= 0.25) {
          setSimState('MEASURING');
          if (measurementMode === 'AUTO') {
            setIsStopwatchRunning(true);
            measurementStartTimeRef.current = now;
            playBeep(880, 0.1, 'sine');
          }
        }

        // Transition to FINISHED at Line B (pos = 0.95)
        if (prev < 0.95 && nextPos >= 0.95) {
          setSimState('FINISHED');
          if (measurementMode === 'AUTO') {
            setIsStopwatchRunning(false);
            playBeep(1200, 0.25, 'triangle');
          }
        }

        if (nextPos >= 1.15) {
          // Stop car animation
          return 1.15;
        }

        return nextPos;
      });

      // Update Stopwatch
      if (isStopwatchRunning && measurementStartTimeRef.current) {
        const elapsed = (now - measurementStartTimeRef.current) / 1000;
        setStopwatchTime(elapsed);
      }

      if (carPosNorm < 1.15) {
        animRef.current = requestAnimationFrame(updateCar);
      }
    };

    animRef.current = requestAnimationFrame(updateCar);

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [simState, isStopwatchRunning, carSpeedSetting, trackDistanceM, measurementMode, carPosNorm]);

  // Derived Error Calculations
  const averageTime =
    trials.length > 0 ? trials.reduce((acc, t) => acc + t.time, 0) / trials.length : 0;
  const avgRandomErrorDeltaT =
    trials.length > 0 ? trials.reduce((acc, t) => acc + t.deltaT, 0) / trials.length : 0;
  const instrumentErrorDeltaT = 0.01; // ĐCNN đồng hồ = 0.01s
  const totalAbsoluteErrorDeltaT = avgRandomErrorDeltaT + instrumentErrorDeltaT;

  const instrumentErrorDeltaS = 0.001; // ĐCNN thước = 1mm = 0.001m
  const relativeErrorDeltaS = (instrumentErrorDeltaS / trackDistanceM) * 100;
  const relativeErrorDeltaT =
    averageTime > 0 ? (totalAbsoluteErrorDeltaT / averageTime) * 100 : 0;
  const relativeErrorDeltaV = relativeErrorDeltaS + relativeErrorDeltaT;

  const averageVelocity = averageTime > 0 ? trackDistanceM / averageTime : 0;
  const absoluteErrorDeltaV = averageVelocity * (relativeErrorDeltaV / 100);

  return (
    <div className="rounded-2xl border border-cyan-500/30 bg-[#070e1c] p-4 sm:p-6 shadow-2xl space-y-5 my-4">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/20 text-white font-bold">
            <Car className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-bold text-white tracking-wide">
                Mô hình 3D: Phương án đo tốc độ xe ô tô đồ chơi
              </h3>
              <span className="rounded-full bg-cyan-500/20 border border-cyan-400/40 px-2 py-0.5 text-[10px] font-bold text-cyan-300">
                SGK Vật lí 10 - Bài 3
              </span>
            </div>
            <p className="text-xs text-gray-300 mt-0.5 flex items-center gap-1">
              <span>Mô phỏng trực quan phép đo quãng đường</span>
              <InlinePhysicsText text="$s$" />
              <span>và thời gian</span>
              <InlinePhysicsText text="$t$" />
              <span>để xác định gián tiếp tốc độ</span>
              <InlinePhysicsText text="$v = \frac{s}{t}$" />
            </p>
          </div>
        </div>

        {/* View Switcher Tabs & Sound */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 transition-colors"
            title={soundEnabled ? 'Tắt âm thanh' : 'Bật âm thanh'}
          >
            {soundEnabled ? <Volume2 className="h-4 w-4 text-cyan-400" /> : <VolumeX className="h-4 w-4" />}
          </button>

          <div className="flex rounded-xl bg-black/40 p-1 border border-white/10">
            <button
              onClick={() => setActiveTab('SIMULATION')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'SIMULATION'
                  ? 'bg-cyan-500 text-black shadow-md'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              <Activity className="h-3.5 w-3.5" />
              <span>Diễn họa 3D</span>
            </button>
            <button
              onClick={() => setActiveTab('PROCEDURE')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'PROCEDURE'
                  ? 'bg-cyan-500 text-black shadow-md'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              <FileSpreadsheet className="h-3.5 w-3.5" />
              <span>Phương án SGK</span>
            </button>
            <button
              onClick={() => setActiveTab('DATA_TABLE')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'DATA_TABLE'
                  ? 'bg-cyan-500 text-black shadow-md'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              <TrendingUp className="h-3.5 w-3.5" />
              <span>Bảng số liệu & Sai số ({trials.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* TAB 1: 3D ISOMETRIC SIMULATION STAGE */}
      {activeTab === 'SIMULATION' && (
        <div className="space-y-4">
          {/* Controls Bar Above Track */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-[#0c162c] p-3.5 rounded-xl border border-white/10 text-xs">
            {/* Mode selection */}
            <div>
              <span className="text-gray-300 font-semibold block mb-1.5 flex items-center gap-1">
                <Sliders className="h-3.5 w-3.5 text-cyan-400" /> Chế độ bấm giờ:
              </span>
              <div className="grid grid-cols-2 gap-1 bg-black/40 p-1 rounded-lg border border-white/10">
                <button
                  onClick={() => {
                    setMeasurementMode('AUTO');
                    handleReset();
                  }}
                  className={`py-1 rounded text-[11px] font-bold transition-all ${
                    measurementMode === 'AUTO'
                      ? 'bg-cyan-500 text-black shadow'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  ⚡ Tự động chuẩn
                </button>
                <button
                  onClick={() => {
                    setMeasurementMode('MANUAL');
                    handleReset();
                  }}
                  className={`py-1 rounded text-[11px] font-bold transition-all ${
                    measurementMode === 'MANUAL'
                      ? 'bg-amber-400 text-black shadow'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  🖐️ Tự bấm phản xạ
                </button>
              </div>
            </div>

            {/* Track distance setting */}
            <div>
              <span className="text-gray-300 font-semibold block mb-1 flex items-center justify-between">
                <span>Quãng đường $s$:</span>
                <strong className="text-cyan-300">{trackDistanceM.toFixed(2)} m</strong>
              </span>
              <input
                type="range"
                min="0.5"
                max="2.0"
                step="0.1"
                value={trackDistanceM}
                onChange={(e) => {
                  setTrackDistanceM(parseFloat(e.target.value));
                  handleReset();
                }}
                className="w-full accent-cyan-400 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-gray-300 mt-0.5">
                <span>0.5 m (50cm)</span>
                <span>1.0 m</span>
                <span>2.0 m (200cm)</span>
              </div>
            </div>

            {/* Car speed setting */}
            <div>
              <span className="text-gray-300 font-semibold block mb-1 flex items-center justify-between">
                <span>Vận tốc xe $v$:</span>
                <strong className="text-amber-300">{carSpeedSetting.toFixed(2)} m/s</strong>
              </span>
              <input
                type="range"
                min="0.3"
                max="1.5"
                step="0.1"
                value={carSpeedSetting}
                onChange={(e) => {
                  setCarSpeedSetting(parseFloat(e.target.value));
                  handleReset();
                }}
                className="w-full accent-amber-400 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-gray-300 mt-0.5">
                <span>Chậm (0.3 m/s)</span>
                <span>Trung bình (0.8 m/s)</span>
                <span>Nhanh (1.5 m/s)</span>
              </div>
            </div>
          </div>

          {/* 3D SVG EXPERIMENT STAGE */}
          <div className="relative overflow-hidden rounded-2xl border border-cyan-500/30 bg-gradient-to-b from-[#060b17] via-[#091326] to-[#040813] shadow-inner">
            <svg
              viewBox="0 0 900 380"
              className="w-full h-auto select-none"
              style={{ minHeight: compact ? '220px' : '280px' }}
            >
              <defs>
                {/* 3D Floor Grid Gradient */}
                <linearGradient id="floorGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0f1f3d" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#081020" stopOpacity="0.95" />
                </linearGradient>

                {/* Ruler Metallic Gradient */}
                <linearGradient id="rulerGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#fef08a" />
                  <stop offset="50%" stopColor="#eab308" />
                  <stop offset="100%" stopColor="#ca8a04" />
                </linearGradient>

                {/* Car Paint Gradient */}
                <linearGradient id="carBodyGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ef4444" />
                  <stop offset="45%" stopColor="#dc2626" />
                  <stop offset="100%" stopColor="#991b1b" />
                </linearGradient>

                {/* Car Roof Gradient */}
                <linearGradient id="carRoofGrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#38bdf8" />
                  <stop offset="100%" stopColor="#0284c7" />
                </linearGradient>

                {/* Soft Contact Shadow */}
                <filter id="carShadow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="5" result="blur" />
                </filter>
              </defs>

              {/* --- 1. PERSPECTIVE LAB FLOOR --- */}
              <polygon
                points="40,240 860,240 890,370 10,370"
                fill="url(#floorGrad)"
                stroke="#1e3a8a"
                strokeWidth="1.5"
              />

              {/* Lab Floor Grid Tiles */}
              <line x1="80" y1="240" x2="60" y2="370" stroke="#1e293b" strokeWidth="1" strokeDasharray="3 3" />
              <line x1="200" y1="240" x2="180" y2="370" stroke="#1e293b" strokeWidth="1" strokeDasharray="3 3" />
              <line x1="320" y1="240" x2="300" y2="370" stroke="#1e293b" strokeWidth="1" strokeDasharray="3 3" />
              <line x1="440" y1="240" x2="420" y2="370" stroke="#1e293b" strokeWidth="1" strokeDasharray="3 3" />
              <line x1="560" y1="240" x2="540" y2="370" stroke="#1e293b" strokeWidth="1" strokeDasharray="3 3" />
              <line x1="680" y1="240" x2="660" y2="370" stroke="#1e293b" strokeWidth="1" strokeDasharray="3 3" />
              <line x1="800" y1="240" x2="780" y2="370" stroke="#1e293b" strokeWidth="1" strokeDasharray="3 3" />
              <line x1="20" y1="300" x2="880" y2="300" stroke="#1e293b" strokeWidth="0.8" strokeDasharray="2 2" />

              {/* --- 2. PRE-RUN ZONE (Khu vực lấy đà trước vạch A) --- */}
              <rect x="40" y="248" width="160" height="5" fill="#3b82f6" opacity="0.25" />
              <text x="60" y="235" fill="#60a5fa" fontSize="11" fontWeight="bold">
                🏎️ Vị trí thả xe lấy đà (Ổn định tốc độ)
              </text>
              <line x1="120" y1="240" x2="120" y2="310" stroke="#60a5fa" strokeWidth="1.5" strokeDasharray="4 3" />

              {/* --- 3. START LINE (VẠCH XUẤT PHÁT A - Phấn trắng/vàng) --- */}
              {/* x = 200 */}
              <polygon points="196,242 204,242 208,350 192,350" fill="#facc15" opacity="0.9" />
              <circle cx="200" cy="242" r="3" fill="#facc15" />
              {/* Flag / Marker A */}
              <g transform="translate(180, 160)">
                <rect x="18" y="0" width="4" height="82" fill="#94a3b8" />
                <polygon points="22,0 55,14 22,28" fill="#eab308" stroke="#ca8a04" strokeWidth="1" />
                <text x="26" y="18" fill="#000" fontSize="11" fontWeight="900">A</text>
                <text x="-35" y="-6" fill="#facc15" fontSize="11" fontWeight="bold">
                  Vạch Xuất Phát (A)
                </text>
                <text x="-25" y="96" fill="#fef08a" fontSize="10" fontWeight="bold">
                  Bắt đầu bấm giờ
                </text>
              </g>

              {/* --- 4. MEASUREMENT RANGE (Khoảng cách s = 1m giữa A và B) --- */}
              {/* From x = 200 to x = 740 (Distance = 540px) */}
              <g transform="translate(200, 340)">
                {/* Distance Dimension Line */}
                <line x1="0" y1="12" x2="540" y2="12" stroke="#00D4FF" strokeWidth="2.5" />
                <polygon points="0,12 12,8 12,16" fill="#00D4FF" />
                <polygon points="540,12 528,8 528,16" fill="#00D4FF" />

                {/* Distance Dimension Badge */}
                <rect x="210" y="-1" width="120" height="26" rx="6" fill="#0369a1" stroke="#38bdf8" strokeWidth="1.5" />
                <text x="270" y="16" fill="#ffffff" fontSize="12" fontWeight="bold" textAnchor="middle">
                  s = {trackDistanceM.toFixed(2)} m (±1mm)
                </text>
              </g>

              {/* --- 5. RULER (Thước mét đặt dọc theo sàn) --- */}
              <g transform="translate(200, 315)">
                <rect x="0" y="0" width="540" height="14" rx="2" fill="url(#rulerGrad)" stroke="#713f12" strokeWidth="1" />
                {/* Millimeter & Centimeter Ticks on Ruler */}
                {Array.from({ length: 11 }).map((_, idx) => {
                  const xPos = (idx / 10) * 540;
                  const labelCm = Math.round((idx / 10) * trackDistanceM * 100);
                  return (
                    <g key={idx} transform={`translate(${xPos}, 0)`}>
                      <line x1="0" y1="0" x2="0" y2="8" stroke="#000" strokeWidth="1.2" />
                      <line x1="13.5" y1="0" x2="13.5" y2="4" stroke="#451a03" strokeWidth="0.8" />
                      <line x1="27" y1="0" x2="27" y2="6" stroke="#451a03" strokeWidth="0.8" />
                      <line x1="40.5" y1="0" x2="40.5" y2="4" stroke="#451a03" strokeWidth="0.8" />
                      <text x="0" y="12" fill="#000" fontSize="7" fontWeight="bold" textAnchor="middle">
                        {labelCm}
                      </text>
                    </g>
                  );
                })}
              </g>

              {/* --- 6. FINISH LINE (VẠCH ĐÍCH B - Phấn đỏ/trắng) --- */}
              {/* x = 740 */}
              <polygon points="736,242 744,242 748,350 732,350" fill="#ef4444" opacity="0.9" />
              <circle cx="740" cy="242" r="3" fill="#ef4444" />
              {/* Flag / Marker B */}
              <g transform="translate(720, 160)">
                <rect x="18" y="0" width="4" height="82" fill="#94a3b8" />
                <polygon points="22,0 55,14 22,28" fill="#ef4444" stroke="#991b1b" strokeWidth="1" />
                <text x="26" y="18" fill="#fff" fontSize="11" fontWeight="900">B</text>
                <text x="-25" y="-6" fill="#f87171" fontSize="11" fontWeight="bold">
                  Vạch Đích (B)
                </text>
                <text x="-22" y="96" fill="#fca5a5" fontSize="10" fontWeight="bold">
                  Dừng bấm giờ
                </text>
              </g>

              {/* --- 7. MOVING TOY CAR (Xe ô tô đồ chơi 3D) --- */}
              {(() => {
                // Calculate Pixel X position from carPosNorm (0 -> 1.15)
                // 0.0 -> x = 60 (Pre-start)
                // 0.25 -> x = 200 (Line A)
                // 0.95 -> x = 740 (Line B)
                // 1.15 -> x = 840 (Post-finish)
                const carX = 60 + (carPosNorm / 0.95) * 540;
                const carY = 268;

                return (
                  <g transform={`translate(${carX}, ${carY})`}>
                    {/* Shadow underneath car */}
                    <ellipse cx="25" cy="24" rx="42" ry="8" fill="#000000" opacity="0.6" filter="url(#carShadow)" />

                    {/* Front Headlight Light Beam Cone */}
                    {simState !== 'IDLE' && (
                      <polygon
                        points="65,10 130,-5 130,25 65,16"
                        fill="#fef08a"
                        opacity="0.35"
                      />
                    )}

                    {/* Back Wheel */}
                    <g transform="translate(-10, 14)">
                      <circle cx="0" cy="0" r="9" fill="#1e293b" stroke="#475569" strokeWidth="2" />
                      <circle cx="0" cy="0" r="4" fill="#94a3b8" />
                      {/* Rotating spoke */}
                      <line x1="-7" y1="0" x2="7" y2="0" stroke="#cbd5e1" strokeWidth="1.2" transform={`rotate(${carPosNorm * 720})`} />
                    </g>

                    {/* Front Wheel */}
                    <g transform="translate(48, 14)">
                      <circle cx="0" cy="0" r="9" fill="#1e293b" stroke="#475569" strokeWidth="2" />
                      <circle cx="0" cy="0" r="4" fill="#94a3b8" />
                      <line x1="-7" y1="0" x2="7" y2="0" stroke="#cbd5e1" strokeWidth="1.2" transform={`rotate(${carPosNorm * 720})`} />
                    </g>

                    {/* Main Car Chassis / Body (Chất liệu thể thao đỏ) */}
                    <path
                      d="M -22 14 L -22 4 Q -20 -4 -8 -6 L 10 -6 Q 22 -14 38 -14 L 52 -2 Q 68 2 68 12 L 62 14 Z"
                      fill="url(#carBodyGrad)"
                      stroke="#7f1d1d"
                      strokeWidth="1.5"
                    />

                    {/* Car Cabin Roof & Glass Windows */}
                    <path
                      d="M -4 -6 L 8 -6 L 32 -13 L 46 -3 L -4 -6 Z"
                      fill="url(#carRoofGrad)"
                      stroke="#0369a1"
                      strokeWidth="1"
                      opacity="0.85"
                    />
                    {/* Window Reflection Stripe */}
                    <line x1="12" y1="-10" x2="28" y2="-10" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />

                    {/* Headlight Bulb */}
                    <circle cx="67" cy="11" r="3.5" fill="#fef08a" stroke="#ca8a04" strokeWidth="1" />
                    {/* Taillight */}
                    <rect x="-23" y="6" width="3" height="6" rx="1" fill="#f87171" />

                    {/* Front Bumper Pointer Indicator (Đầu xe căn chỉnh vạch) */}
                    <polygon points="68,12 76,8 76,16" fill="#38bdf8" />
                    <line x1="68" y1="12" x2="68" y2="28" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="2 2" />

                    {/* Speed Vector Arrow */}
                    {simState !== 'IDLE' && (
                      <g transform="translate(25, -24)">
                        <line x1="0" y1="0" x2="35" y2="0" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" />
                        <polygon points="35,0 27,-4 27,4" fill="#22c55e" />
                        <text x="12" y="-5" fill="#4ade80" fontSize="10" fontWeight="bold">
                          v = {carSpeedSetting.toFixed(1)} m/s
                        </text>
                      </g>
                    )}
                  </g>
                );
              })()}

              {/* --- 8. FLOATING DIGITAL STOPWATCH (Đồng hồ bấm giây điện tử) --- */}
              <g transform="translate(560, 20)">
                {/* Watch Body Casing */}
                <rect x="0" y="0" width="165" height="95" rx="14" fill="#0f172a" stroke="#38bdf8" strokeWidth="2" filter="drop-shadow(0px 8px 16px rgba(0,0,0,0.6))" />
                {/* Top Buttons on Stopwatch */}
                <rect x="35" y="-7" width="22" height="8" rx="2" fill="#ef4444" stroke="#991b1b" strokeWidth="1" />
                <rect x="105" y="-7" width="22" height="8" rx="2" fill="#22c55e" stroke="#166534" strokeWidth="1" />
                <rect x="72" y="-9" width="18" height="9" rx="2" fill="#94a3b8" stroke="#475569" strokeWidth="1" />

                {/* Inner LCD Display Screen */}
                <rect x="12" y="16" width="141" height="50" rx="8" fill="#020617" stroke="#1e293b" strokeWidth="1.5" />

                {/* LCD Label */}
                <text x="20" y="28" fill="#38bdf8" fontSize="8" fontWeight="bold" letterSpacing="0.5">
                  STOPWATCH (ĐCNN: 0.01s)
                </text>
                <circle cx="140" cy="26" r="3" fill={isStopwatchRunning ? '#22c55e' : '#ef4444'} />

                {/* Digital Clock Digits */}
                <text x="82" y="58" fill="#00FFCC" fontSize="26" fontFamily="monospace" fontWeight="900" textAnchor="middle">
                  {stopwatchTime.toFixed(2)}
                  <tspan fontSize="13" fill="#67e8f9"> s</tspan>
                </text>

                {/* Status Indicator */}
                <rect x="12" y="72" width="141" height="15" rx="4" fill="#1e293b" />
                <text x="82" y="83" fill="#94a3b8" fontSize="9" fontWeight="bold" textAnchor="middle">
                  {isStopwatchRunning
                    ? '⚡ ĐANG ĐO THỜI GIAN...'
                    : simState === 'FINISHED'
                    ? '✅ ĐÃ ĐO XONG QUÃNG ĐƯỜNG s'
                    : '⏸️ SẴN SÀNG ĐO'}
                </text>
              </g>

              {/* --- 9. LIVE EXPERIMENT STAGE BANNER / STATUS OVERLAY --- */}
              <g transform="translate(40, 20)">
                <rect x="0" y="0" width="340" height="65" rx="10" fill="#030712" stroke="#1e293b" strokeWidth="1.2" opacity="0.9" />
                <text x="14" y="22" fill="#00FFCC" fontSize="12" fontWeight="bold">
                  TRẠNG THÁI TIẾN TRÌNH THỰC HIỆN:
                </text>
                <text x="14" y="42" fill="#ffffff" fontSize="11" fontWeight="medium">
                  {simState === 'IDLE' && '1. Nhấn nút "Cho xe chạy" để bắt đầu thí nghiệm.'}
                  {simState === 'PRE_RUN' && '2. Xe đang lấy đà để đạt tốc độ ổn định trước vạch A...'}
                  {simState === 'MEASURING' && '3. Xe đã qua vạch A! Đồng hồ đang ghi nhận thời gian t...'}
                  {simState === 'FINISHED' && '4. Xe đã qua vạch đích B! Đã ghi nhận xong thời gian t.'}
                </text>
                <text x="14" y="56" fill="#94a3b8" fontSize="9">
                  {measurementMode === 'AUTO'
                    ? '• Cơ chế: Tự động kích hoạt bấm giờ tại A và dừng tại B'
                    : '• Cơ chế: Bạn tự bấm nút Start/Stop để trải nghiệm sai số phản xạ'}
                </text>
              </g>
            </svg>

            {/* Reaction lag warning badge if manual */}
            {reactionLagAlert && (
              <div className="absolute bottom-3 left-4 right-4 sm:left-auto sm:right-4 bg-black/85 border border-amber-400/50 rounded-xl px-3.5 py-2 text-xs font-bold text-amber-200 shadow-xl flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-amber-400 shrink-0" />
                <span>{reactionLagAlert}</span>
              </div>
            )}
          </div>

          {/* Action Buttons Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-[#091124] p-4 rounded-2xl border border-white/10">
            {/* Primary Action Buttons */}
            <div className="flex flex-wrap items-center gap-2.5">
              {simState === 'IDLE' || simState === 'FINISHED' ? (
                <button
                  onClick={handleStartCar}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-extrabold text-sm shadow-lg shadow-cyan-500/25 transition-all transform hover:scale-105 active:scale-95 cursor-pointer"
                >
                  <Play className="h-4 w-4 fill-current" />
                  <span>Cho xe chạy & Đo</span>
                </button>
              ) : (
                <button
                  onClick={handleReset}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600/80 hover:bg-rose-500 text-white font-bold text-sm transition-all cursor-pointer"
                >
                  <Pause className="h-4 w-4" />
                  <span>Dừng xe</span>
                </button>
              )}

              <button
                onClick={handleReset}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/15 text-gray-200 font-semibold text-sm border border-white/10 transition-all cursor-pointer"
              >
                <RotateCcw className="h-4 w-4" />
                <span>Đặt lại vị trí xe</span>
              </button>

              {/* Manual mode buttons */}
              {measurementMode === 'MANUAL' && simState !== 'IDLE' && (
                <div className="flex items-center gap-2 ml-1">
                  <button
                    onClick={handleManualStartTimer}
                    disabled={isStopwatchRunning}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                      !isStopwatchRunning
                        ? 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-lg shadow-emerald-500/20 cursor-pointer animate-pulse'
                        : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <Clock className="h-3.5 w-3.5" />
                    <span>Bấm Bắt Đầu (Vạch A)</span>
                  </button>

                  <button
                    onClick={handleManualStopTimer}
                    disabled={!isStopwatchRunning}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                      isStopwatchRunning
                        ? 'bg-rose-500 hover:bg-rose-400 text-white shadow-lg shadow-rose-500/20 cursor-pointer animate-pulse'
                        : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <Pause className="h-3.5 w-3.5" />
                    <span>Bấm Dừng (Vạch B)</span>
                  </button>
                </div>
              )}
            </div>

            {/* Record Trial into Table Button */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleRecordTrial}
                disabled={stopwatchTime <= 0}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  stopwatchTime > 0
                    ? 'bg-amber-400 hover:bg-amber-300 text-black shadow-lg shadow-amber-400/20 cursor-pointer'
                    : 'bg-white/5 text-gray-300 border border-white/5 cursor-not-allowed'
                }`}
              >
                <FileSpreadsheet className="h-4 w-4" />
                <span>Lưu kết quả t = {stopwatchTime.toFixed(2)} s vào bảng đo</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DETAILED SGK PROCEDURE SPECIFICATION */}
      {activeTab === 'PROCEDURE' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Tools Box */}
            <div className="rounded-xl border border-cyan-500/30 bg-[#0c162c] p-4.5 space-y-3">
              <div className="flex items-center gap-2 text-cyan-300 font-bold text-sm uppercase tracking-wider border-b border-cyan-500/20 pb-2">
                <Layers className="h-4 w-4 text-cyan-400" />
                <span>1. Dụng cụ thí nghiệm (Chuẩn bị)</span>
              </div>
              <ul className="space-y-2.5 text-xs sm:text-sm text-gray-200">
                <li className="flex items-start gap-2.5">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-cyan-500/20 text-[11px] font-bold text-cyan-300">
                    1
                  </span>
                  <div>
                    <strong className="text-white">01 Xe ô tô đồ chơi:</strong> Xe chạy pin/dây cót có thể chuyển động thẳng với tốc độ tương đối ổn định.
                  </div>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-cyan-500/20 text-[11px] font-bold text-cyan-300">
                    2
                  </span>
                  <div>
                    <strong className="text-white">01 Thước cuộn / thước thẳng:</strong> Độ dài <InlinePhysicsText text="$1 - 2\text{ m}$" />, có độ chia nhỏ nhất (ĐCNN) là <InlinePhysicsText text="$1\text{ mm}$" /> (<InlinePhysicsText text="$0{,}001\text{ m}$" />).
                  </div>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-cyan-500/20 text-[11px] font-bold text-cyan-300">
                    3
                  </span>
                  <div>
                    <strong className="text-white">01 Đồng hồ bấm giây:</strong> Điện tử hoặc cơ học, có ĐCNN là <InlinePhysicsText text="$0{,}01\text{ s}$" />.
                  </div>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-cyan-500/20 text-[11px] font-bold text-cyan-300">
                    4
                  </span>
                  <div>
                    <strong className="text-white">Phấn vẽ / Băng dính màu:</strong> Dùng để đánh dấu vạch xuất phát (A) và vạch đích (B) trên mặt sàn phẳng.
                  </div>
                </li>
              </ul>
            </div>

            {/* Scientific Steps Box */}
            <div className="rounded-xl border border-emerald-500/30 bg-[#091e1d]/40 p-4.5 space-y-3">
              <div className="flex items-center gap-2 text-emerald-300 font-bold text-sm uppercase tracking-wider border-b border-emerald-500/20 pb-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span>2. Các bước tiến hành thí nghiệm</span>
              </div>
              <ol className="space-y-2.5 text-xs sm:text-sm text-gray-200">
                <li className="flex items-start gap-2.5">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-[11px] font-bold text-emerald-300">
                    1
                  </span>
                  <div>
                    <strong>Xác định quãng đường cố định:</strong> Dùng thước đo một khoảng quãng đường cố định trên mặt sàn (ví dụ: <InlinePhysicsText text="$s = 1\text{ m}$" />), dùng phấn vạch rõ <strong>vạch xuất phát (A)</strong> và <strong>vạch đích (B)</strong>.
                  </div>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-[11px] font-bold text-emerald-300">
                    2
                  </span>
                  <div>
                    <strong>Cho xe lấy đà:</strong> Đặt và cho xe chạy từ vị trí <em>trước vạch xuất phát một đoạn</em> để xe đạt tốc độ chuyển động ổn định trước khi chạm vạch A.
                  </div>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-[11px] font-bold text-emerald-300">
                    3
                  </span>
                  <div>
                    <strong>Bấm giờ chính xác:</strong> Bấm đồng hồ đo thời gian <InlinePhysicsText text="$t$" /> ngay khi mũi xe vừa chạm vạch xuất phát A và bấm dừng đồng hồ khi mũi xe vừa chạm vạch đích B.
                  </div>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-[11px] font-bold text-emerald-300">
                    4
                  </span>
                  <div>
                    <strong>Lặp lại phép đo:</strong> Lặp lại phép đo khoảng <strong>3–5 lần</strong> để ghi số liệu và lấy giá trị trung bình <InlinePhysicsText text="$\bar{t}$" /> nhằm giảm sai số ngẫu nhiên do phản xạ tay.
                  </div>
                </li>
              </ol>
            </div>
          </div>

          {/* Classification Direct vs Indirect */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-xl border border-blue-500/30 bg-blue-950/20 p-4 space-y-1.5">
              <span className="text-xs font-bold text-blue-300 uppercase tracking-wider block flex items-center gap-1.5">
                <Ruler className="h-3.5 w-3.5" /> Phép đo trực tiếp (Direct Measurement)
              </span>
              <div className="text-xs sm:text-sm text-gray-200 leading-relaxed space-y-1">
                <p>• <strong>Đo quãng đường <InlinePhysicsText text="$s$" /></strong> bằng thước thẳng.</p>
                <p>• <strong>Đo thời gian <InlinePhysicsText text="$t$" /></strong> bằng đồng hồ bấm giây.</p>
                <p className="italic text-gray-300">👉 Vì giá trị của chúng được đọc trực tiếp trên các vạch chia của dụng cụ đo.</p>
              </div>
            </div>

            <div className="rounded-xl border border-purple-500/30 bg-purple-950/20 p-4 space-y-1.5">
              <span className="text-xs font-bold text-purple-300 uppercase tracking-wider block flex items-center gap-1.5">
                <TrendingUp className="h-3.5 w-3.5" /> Phép đo gián tiếp (Indirect Measurement)
              </span>
              <div className="text-xs sm:text-sm text-gray-200 leading-relaxed space-y-1">
                <p>• <strong>Xác định tốc độ <InlinePhysicsText text="$v$" /></strong> của ô tô đồ chơi.</p>
                <p className="italic text-gray-300">👉 Vì tốc độ <InlinePhysicsText text="$v$" /> không được đo trực tiếp bằng một dụng cụ riêng biệt, mà được suy ra qua công thức liên hệ toán học:</p>
                <div className="py-1">
                  <FormattedPhysicsText content="$$v = \frac{s}{t}$$" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: DATA TABLE & ERROR ANALYSIS CALCULATION */}
      {activeTab === 'DATA_TABLE' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm font-bold text-cyan-300">
              📋 Bảng số liệu thực nghiệm đo thời gian (<InlinePhysicsText text={`$s = ${trackDistanceM.toFixed(2)}\\text{ m}$`} />, <InlinePhysicsText text="$\Delta s_{dc} = 0{,}001\text{ m}$" />, <InlinePhysicsText text="$\Delta t_{dc} = 0{,}01\text{ s}$" />)
            </span>
            <button
              onClick={handleClearTrials}
              className="text-[11px] font-bold text-rose-400 hover:text-rose-300 underline cursor-pointer"
            >
              Xóa dữ liệu để đo lại từ đầu
            </button>
          </div>

          {/* Trials Table */}
          <div className="overflow-x-auto rounded-xl border border-white/10 bg-black/40">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-white/5 text-[#00D4FF]">
                  <th className="p-3">Lần đo</th>
                  <th className="p-3">Quãng đường s (m)</th>
                  <th className="p-3">Thời gian <InlinePhysicsText text="$t_i\text{ (s)}$" /></th>
                  <th className="p-3">Sai số ngẫu nhiên <InlinePhysicsText text="$\Delta t_i = |\bar{t} - t_i|\text{ (s)}$" /></th>
                  <th className="p-3">Tốc độ tức thời <InlinePhysicsText text="$v_i = \frac{s}{t_i}\text{ (m/s)}$" /></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {trials.map((t) => (
                  <tr key={t.trialNumber} className="hover:bg-white/5">
                    <td className="p-3 font-bold text-gray-300">Lần {t.trialNumber}</td>
                    <td className="p-3 text-gray-200">{trackDistanceM.toFixed(2)}</td>
                    <td className="p-3 font-mono font-bold text-cyan-300">{t.time.toFixed(2)}</td>
                    <td className="p-3 font-mono text-amber-300">{t.deltaT.toFixed(3)}</td>
                    <td className="p-3 font-mono text-emerald-300">{(trackDistanceM / t.time).toFixed(3)}</td>
                  </tr>
                ))}
                {trials.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-4 text-center text-gray-300 italic">
                      Chưa có lần đo nào. Hãy chuyển sang tab "Diễn họa 3D", bấm "Cho xe chạy & Đo" rồi bấm "Lưu vào bảng đo".
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Error Synthesis Results Card */}
          {trials.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="rounded-xl border border-cyan-500/30 bg-cyan-950/20 p-3.5 space-y-1">
                <span className="text-[11px] font-bold text-cyan-300 uppercase tracking-wider block">
                  1. Thời gian trung bình & Sai số
                </span>
                <div className="text-xs text-gray-200 space-y-1">
                  <FormattedPhysicsText content={`$$\\bar{t} = ${averageTime.toFixed(2)}\\text{ s}$$`} />
                  <FormattedPhysicsText content={`$$\\overline{\\Delta t} = ${avgRandomErrorDeltaT.toFixed(3)}\\text{ s}$$`} />
                  <FormattedPhysicsText content={`$$\\Delta t = \\overline{\\Delta t} + \\Delta t_{dc} = ${totalAbsoluteErrorDeltaT.toFixed(2)}\\text{ s}$$`} />
                </div>
                <div className="mt-2 rounded-lg bg-black/40 p-2 border border-cyan-500/30 text-center font-bold text-cyan-300 text-xs">
                  <InlinePhysicsText text={`$t = (${averageTime.toFixed(2)} \\pm ${totalAbsoluteErrorDeltaT.toFixed(2)})\\text{ s}$`} />
                </div>
              </div>

              <div className="rounded-xl border border-amber-500/30 bg-amber-950/20 p-3.5 space-y-1">
                <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wider block">
                  2. Sai số tỉ đối <InlinePhysicsText text="$\delta v$" />
                </span>
                <div className="text-xs text-gray-200 space-y-1">
                  <FormattedPhysicsText content={`$$\\delta s = \\frac{0{,}001}{${trackDistanceM.toFixed(2)}} \\times 100\\% = ${relativeErrorDeltaS.toFixed(2)}\\%$$`} />
                  <FormattedPhysicsText content={`$$\\delta t = \\frac{${totalAbsoluteErrorDeltaT.toFixed(2)}}{${averageTime.toFixed(2)}} \\times 100\\% = ${relativeErrorDeltaT.toFixed(2)}\\%$$`} />
                  <FormattedPhysicsText content={`$$\\delta v = \\delta s + \\delta t = ${relativeErrorDeltaV.toFixed(2)}\\%$$`} />
                </div>
                <div className="mt-2 rounded-lg bg-black/40 p-2 border border-amber-500/30 text-center font-bold text-amber-300 text-xs">
                  <InlinePhysicsText text={`$\\delta v \\approx ${relativeErrorDeltaV.toFixed(1)}\\%$`} />
                </div>
              </div>

              <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-3.5 space-y-1">
                <span className="text-[11px] font-bold text-emerald-300 uppercase tracking-wider block">
                  3. Kết quả đo tốc độ <InlinePhysicsText text="$v$" />
                </span>
                <div className="text-xs text-gray-200 space-y-1">
                  <FormattedPhysicsText content={`$$\\bar{v} = \\frac{s}{\\bar{t}} = \\frac{${trackDistanceM.toFixed(2)}}{${averageTime.toFixed(2)}} = ${averageVelocity.toFixed(2)}\\text{ m/s}$$`} />
                  <FormattedPhysicsText content={`$$\\Delta v = \\bar{v} \\times \\delta v = ${absoluteErrorDeltaV.toFixed(2)}\\text{ m/s}$$`} />
                </div>
                <div className="mt-2 rounded-lg bg-black/40 p-2 border border-emerald-500/30 text-center font-bold text-emerald-300 text-xs">
                  <InlinePhysicsText text={`$v = (${averageVelocity.toFixed(2)} \\pm ${absoluteErrorDeltaV.toFixed(2)})\\text{ m/s}$`} />
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
