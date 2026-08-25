import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  RotateCcw,
  Volume2,
  VolumeX,
  Sparkles,
  Info,
  HelpCircle,
  Video,
  Layers,
  ChevronDown,
  Gauge,
  Sliders,
  CheckCircle,
  Table as TableIcon,
  TrendingUp,
  Download,
  Flame,
} from 'lucide-react';

interface ExperimentRun {
  run: number;
  t1: number; // s (Gate E blocking time)
  t2: number; // s (Gate F blocking time)
  tEF: number; // s (time from E to F)
  dCm: number; // cm (ball diameter)
  sCm: number; // cm (distance E to F)
  vE: number; // m/s (instant speed at E)
  vF: number; // m/s (instant speed at F)
  vAvg: number; // m/s (average speed E->F)
  accel: number; // m/s^2 (measured acceleration)
}

export const SpeedMeasurementLab: React.FC = () => {
  // Mode selection
  // 'AVG_SPEED': Đo tốc độ trung bình v_tb = s / Δt
  // 'INSTANT_SPEED': Đo tốc độ tức thời v = d / t tại Cổng E hoặc Cổng F
  // 'ACCELERATION': Đo gia tốc a = (v_F^2 - v_E^2) / 2s
  const [experimentMode, setExperimentMode] = useState<'AVG_SPEED' | 'INSTANT_SPEED' | 'ACCELERATION'>('AVG_SPEED');
  const [instantGateTarget, setInstantGateTarget] = useState<'GATE_E' | 'GATE_F' | 'BOTH'>('GATE_E');
  const [measurementSelect, setMeasurementSelect] = useState<'EF' | 'T1' | 'T2' | 'ALL'>('EF');

  // Parameters (matching user screenshot)
  const [inclineAngle, setInclineAngle] = useState<number>(15); // degrees
  const [gateEPos, setGateEPos] = useState<number>(10); // cm (5 to 25)
  const [gateFPos, setGateFPos] = useState<number>(40); // cm (25 to 55)
  const [ballDiameterMm, setBallDiameterMm] = useState<number>(10); // mm (8 to 25)
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1); // 1x, 0.5x, 0.25x

  // Simulation physics state
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [ballState, setBallState] = useState<{
    section: 'INCLINE' | 'TRANSITION' | 'HORIZONTAL' | 'STOPPED';
    xPx: number;
    yPx: number;
    rotationDeg: number;
    currentV: number; // m/s
    progressSec: number;
  }>({
    section: 'INCLINE',
    xPx: 0,
    yPx: 0,
    rotationDeg: 0,
    currentV: 0,
    progressSec: 0,
  });

  // Active optical gate triggers
  const [gateETriggered, setGateETriggered] = useState<boolean>(false);
  const [gateFTriggered, setGateFTriggered] = useState<boolean>(false);

  // Digital MC964 display state
  const [mc964Display, setMc964Display] = useState<string>('00.00');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Measurements & Telemetry cache
  const [lastTEF, setLastTEF] = useState<number | null>(0.384);
  const [lastVAvg, setLastVAvg] = useState<number | null>(0.781);
  const [lastT1, setLastT1] = useState<number | null>(0.0244);
  const [lastT2, setLastT2] = useState<number | null>(0.0245);
  const [lastVE, setLastVE] = useState<number | null>(0.410);
  const [lastVF, setLastVF] = useState<number | null>(0.408);
  const [lastAccel, setLastAccel] = useState<number | null>(0.01);

  // Data table
  const [results, setResults] = useState<ExperimentRun[]>([
    {
      run: 1,
      t1: 0.0244,
      t2: 0.0245,
      tEF: 0.384,
      dCm: 1.0,
      sCm: 30.0,
      vE: 0.41,
      vF: 0.408,
      vAvg: 0.781,
      accel: 0.0,
    },
    {
      run: 2,
      t1: 0.0243,
      t2: 0.0246,
      tEF: 0.386,
      dCm: 1.0,
      sCm: 30.0,
      vE: 0.412,
      vF: 0.407,
      vAvg: 0.777,
      accel: 0.0,
    },
  ]);

  // Audio Context synthesizer for realistic laboratory sound effects
  const audioCtxRef = useRef<AudioContext | null>(null);
  const rollingGainRef = useRef<GainNode | null>(null);
  const rollingOscRef = useRef<OscillatorNode | null>(null);

  const getAudioContext = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  };

  const playTone = (freq: number, type: OscillatorType, duration: number, vol = 0.08) => {
    if (!soundEnabled) return;
    try {
      const ctx = getAudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(vol, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch {
      // Audio not supported or blocked
    }
  };

  // Start continuous rolling hum sound
  const startRollingSound = () => {
    if (!soundEnabled) return;
    try {
      const ctx = getAudioContext();
      stopRollingSound();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(90, ctx.currentTime);
      gain.gain.setValueAtTime(0.015, ctx.currentTime);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      rollingOscRef.current = osc;
      rollingGainRef.current = gain;
    } catch {
      // Audio blocked
    }
  };

  const updateRollingSound = (velocity: number) => {
    if (!soundEnabled || !rollingOscRef.current || !rollingGainRef.current || !audioCtxRef.current) return;
    try {
      const ctx = audioCtxRef.current;
      const targetFreq = Math.min(260, 80 + velocity * 120);
      const targetGain = Math.min(0.04, 0.005 + velocity * 0.025);
      rollingOscRef.current.frequency.setTargetAtTime(targetFreq, ctx.currentTime, 0.05);
      rollingGainRef.current.gain.setTargetAtTime(targetGain, ctx.currentTime, 0.05);
    } catch {
      // Ignore
    }
  };

  const stopRollingSound = () => {
    try {
      if (rollingOscRef.current) {
        rollingOscRef.current.stop();
        rollingOscRef.current.disconnect();
        rollingOscRef.current = null;
      }
      if (rollingGainRef.current) {
        rollingGainRef.current.disconnect();
        rollingGainRef.current = null;
      }
    } catch {
      // Ignore
    }
  };

  const distanceEFCm = Math.max(1, gateFPos - gateEPos);
  const distanceEFM = distanceEFCm / 100;
  const ballDiameterM = ballDiameterMm / 1000;
  const ballRadiusPx = (ballDiameterMm / 10) * 5; // Visual ball radius in px (scaled 5px per mm/2)

  // Track geometry helper constants
  const pivotX = 265;
  const pivotY = 218;
  const rampPixelLen = 145; // pixels
  const angleRad = (inclineAngle * Math.PI) / 180;
  const topX = pivotX - rampPixelLen * Math.cos(angleRad);
  const topY = pivotY - rampPixelLen * Math.sin(angleRad);

  // Position of ball resting at electromagnet top
  const getInitialBallPos = () => {
    const sRest = 18; // offset from top box
    const xBase = topX + sRest * Math.cos(angleRad);
    const yBase = topY + sRest * Math.sin(angleRad);
    // Offset along normal perpendicular to ramp
    const normX = Math.sin(angleRad);
    const normY = -Math.cos(angleRad);
    return {
      xPx: xBase + normX * ballRadiusPx,
      yPx: yBase + normY * ballRadiusPx,
      rotationDeg: 0,
    };
  };

  // Sync initial ball position when parameters change while not running
  useEffect(() => {
    if (!isSimulating) {
      const init = getInitialBallPos();
      setBallState({
        section: 'INCLINE',
        xPx: init.xPx,
        yPx: init.yPx,
        rotationDeg: init.rotationDeg,
        currentV: 0,
        progressSec: 0,
      });
    }
  }, [inclineAngle, ballDiameterMm, isSimulating]);

  // Animation frame loop
  const animRef = useRef<number | null>(null);

  const handleStartSimulation = () => {
    if (isSimulating) return;
    setIsSimulating(true);
    setGateETriggered(false);
    setGateFTriggered(false);
    setMc964Display('00.00');

    // 1. Electromagnet release sound
    playTone(950, 'square', 0.08, 0.12);
    startRollingSound();

    // 2. High-precision rolling physics:
    // Solid steel ball moment of inertia I = 2/5 * m * r^2
    // True rolling acceleration down incline: a_ramp = (5/7) * g * sin(theta)
    const g = 9.806;
    const aRamp = (5 / 7) * g * Math.sin(angleRad);
    const rampLengthM = 0.24; // 24 cm ramp

    // Time on incline: t_ramp = sqrt(2 * L / a)
    const timeRamp = Math.sqrt((2 * rampLengthM) / aRamp);
    const vAtRampEnd = aRamp * timeRamp;

    // Rolling friction deceleration on horizontal aluminum track: a_horiz = -mu_r * g
    const muRoll = 0.012;
    const aHoriz = -muRoll * g;

    // Horizontal distances:
    const posEM = gateEPos / 100;
    const posFM = gateFPos / 100;
    const trackEndM = 0.60; // 60 cm track length

    // Solve quadratic for time to reach distance x: x = v0*t + 0.5*a*t^2
    const calcTimeToPos = (x: number) => {
      const A = 0.5 * aHoriz;
      const B = vAtRampEnd;
      const C = -x;
      const discr = B * B - 4 * A * C;
      if (discr < 0) return x / vAtRampEnd;
      return (-B + Math.sqrt(discr)) / (2 * A);
    };

    const timeToEHoriz = calcTimeToPos(posEM);
    const timeToFHoriz = calcTimeToPos(posFM);
    const timeToEndHoriz = calcTimeToPos(trackEndM);

    const vE = Math.max(0.05, vAtRampEnd + aHoriz * timeToEHoriz);
    const vF = Math.max(0.05, vAtRampEnd + aHoriz * timeToFHoriz);

    // Photogate shutter times
    const t1 = ballDiameterM / vE;
    const t2 = ballDiameterM / vF;

    // Experimental noise ~0.001s
    const noise = (Math.random() - 0.5) * 0.002;
    const measuredTEF = Math.max(0.05, timeToFHoriz - timeToEHoriz + noise);
    const measuredVAvg = distanceEFM / measuredTEF;
    const measuredAccel = (vF * vF - vE * vE) / (2 * distanceEFM);

    const totalSimTime = (timeRamp + timeToEndHoriz + 0.6) * 1000;
    const startTime = performance.now();

    let eBeeped = false;
    let fBeeped = false;
    let endBumped = false;

    const updateFrame = (now: number) => {
      const elapsed = (now - startTime) * playbackSpeed;
      const elapsedSec = elapsed / 1000;

      let currentX = 0;
      let currentY = 0;
      let currentV = 0;
      let currentRot = 0;
      let section: 'INCLINE' | 'TRANSITION' | 'HORIZONTAL' | 'STOPPED' = 'INCLINE';

      if (elapsedSec <= timeRamp) {
        // --- 1. ROLLING DOWN INCLINE ---
        section = 'INCLINE';
        const progressFrac = Math.min(1, elapsedSec / timeRamp);
        const distM = 0.5 * aRamp * elapsedSec * elapsedSec;
        currentV = aRamp * elapsedSec;

        const sRest = 18;
        const totalRampPx = rampPixelLen - sRest;
        const currentDistPx = progressFrac * totalRampPx;

        // Position on slope
        const xSlope = topX + sRest * Math.cos(angleRad) + currentDistPx * Math.cos(angleRad);
        const ySlope = topY + sRest * Math.sin(angleRad) + currentDistPx * Math.sin(angleRad);

        // Normal offset
        const normX = Math.sin(angleRad);
        const normY = -Math.cos(angleRad);
        currentX = xSlope + normX * ballRadiusPx;
        currentY = ySlope + normY * ballRadiusPx;

        // Rotation angle = (dist / radius) in radians -> degrees
        currentRot = (distM / (ballDiameterM / 2)) * (180 / Math.PI);
        updateRollingSound(currentV);
      } else {
        // --- 2. TRANSITION & HORIZONTAL TRACK ---
        const tHoriz = elapsedSec - timeRamp;
        const distHorizM = Math.min(trackEndM, vAtRampEnd * tHoriz + 0.5 * aHoriz * tHoriz * tHoriz);
        currentV = Math.max(0, vAtRampEnd + aHoriz * tHoriz);

        // Map distHorizM (0 to 0.60m) to rail coordinates (pivotX to pivotX + 60*6.2)
        const railStartX = pivotX;
        const railEndX = pivotX + 60 * 6.2; // ~637px
        const currentRailX = railStartX + (distHorizM / 0.60) * (60 * 6.2);

        // Smooth curve transition near 0cm (pivotX)
        const transitionDistPx = 15;
        if (currentRailX < railStartX + transitionDistPx) {
          section = 'TRANSITION';
          const tFrac = (currentRailX - railStartX) / transitionDistPx;
          currentX = currentRailX;
          // Smooth blend between ramp exit Y and horizontal rail Y
          const rampExitY = pivotY - ballRadiusPx * Math.cos(angleRad);
          const horizY = pivotY - ballRadiusPx;
          currentY = rampExitY * (1 - tFrac) + horizY * tFrac;
        } else {
          section = 'HORIZONTAL';
          currentX = Math.min(railEndX - ballRadiusPx, currentRailX);
          currentY = pivotY - ballRadiusPx;
        }

        // Total rotation
        const totalDistM = rampLengthM + distHorizM;
        currentRot = (totalDistM / (ballDiameterM / 2)) * (180 / Math.PI);

        updateRollingSound(currentV);

        // Gate E Trigger checking
        const isAtGateE = Math.abs(distHorizM - posEM) <= ballDiameterM * 1.2;
        if (isAtGateE) {
          setGateETriggered(true);
          if (!eBeeped) {
            eBeeped = true;
            playTone(1200, 'sine', 0.06, 0.1);
          }
        } else if (distHorizM > posEM + ballDiameterM * 1.5) {
          setGateETriggered(false);
        }

        // Gate F Trigger checking
        const isAtGateF = Math.abs(distHorizM - posFM) <= ballDiameterM * 1.2;
        if (isAtGateF) {
          setGateFTriggered(true);
          if (!fBeeped) {
            fBeeped = true;
            playTone(1600, 'sine', 0.08, 0.1);
          }
        } else if (distHorizM > posFM + ballDiameterM * 1.5) {
          setGateFTriggered(false);
        }

        // Update live timer MC964
        if (experimentMode === 'AVG_SPEED' || experimentMode === 'ACCELERATION') {
          if (elapsedSec >= timeRamp + timeToEHoriz && elapsedSec <= timeRamp + timeToFHoriz) {
            const counting = elapsedSec - (timeRamp + timeToEHoriz);
            setMc964Display(counting.toFixed(3));
          } else if (elapsedSec > timeRamp + timeToFHoriz) {
            setMc964Display(measuredTEF.toFixed(3));
          }
        } else if (experimentMode === 'INSTANT_SPEED') {
          if (instantGateTarget === 'GATE_E') {
            if (elapsedSec >= timeRamp + timeToEHoriz) {
              setMc964Display(t1.toFixed(4));
            }
          } else if (instantGateTarget === 'GATE_F') {
            if (elapsedSec >= timeRamp + timeToFHoriz) {
              setMc964Display(t2.toFixed(4));
            }
          } else {
            // BOTH
            if (elapsedSec >= timeRamp + timeToFHoriz) {
              setMc964Display(t2.toFixed(4));
            } else if (elapsedSec >= timeRamp + timeToEHoriz) {
              setMc964Display(t1.toFixed(4));
            }
          }
        }

        // Hit End Stop Cushion
        if (distHorizM >= trackEndM - 0.01 && !endBumped) {
          endBumped = true;
          playTone(400, 'sine', 0.12, 0.09); // Bumper thud
        }
      }

      setBallState({
        section,
        xPx: currentX,
        yPx: currentY,
        rotationDeg: currentRot,
        currentV,
        progressSec: elapsedSec,
      });

      if (elapsedSec < timeRamp + timeToEndHoriz + 0.4) {
        animRef.current = requestAnimationFrame(updateFrame);
      } else {
        // Run complete
        setIsSimulating(false);
        stopRollingSound();
        setGateETriggered(false);
        setGateFTriggered(false);

        let finalDisplayVal = measuredTEF.toFixed(3);
        if (experimentMode === 'INSTANT_SPEED') {
          if (instantGateTarget === 'GATE_E') finalDisplayVal = t1.toFixed(4);
          else if (instantGateTarget === 'GATE_F') finalDisplayVal = t2.toFixed(4);
          else finalDisplayVal = `${t1.toFixed(3)} | ${t2.toFixed(3)}`;
        } else if (measurementSelect === 'T1') {
          finalDisplayVal = t1.toFixed(4);
        } else if (measurementSelect === 'T2') {
          finalDisplayVal = t2.toFixed(4);
        }

        setMc964Display(finalDisplayVal);
        setLastTEF(Number(measuredTEF.toFixed(3)));
        setLastVAvg(Number(measuredVAvg.toFixed(3)));
        setLastT1(Number(t1.toFixed(4)));
        setLastT2(Number(t2.toFixed(4)));
        setLastVE(Number(vE.toFixed(3)));
        setLastVF(Number(vF.toFixed(3)));
        setLastAccel(Number(measuredAccel.toFixed(3)));

        // Record in table
        setResults((prev) => [
          ...prev,
          {
            run: prev.length + 1,
            t1: Number(t1.toFixed(4)),
            t2: Number(t2.toFixed(4)),
            tEF: Number(measuredTEF.toFixed(3)),
            dCm: Number((ballDiameterMm / 10).toFixed(1)),
            sCm: distanceEFCm,
            vE: Number(vE.toFixed(3)),
            vF: Number(vF.toFixed(3)),
            vAvg: Number(measuredVAvg.toFixed(3)),
            accel: Number(measuredAccel.toFixed(3)),
          },
        ]);
      }
    };

    animRef.current = requestAnimationFrame(updateFrame);
  };

  const handleReset = () => {
    if (animRef.current) cancelAnimationFrame(animRef.current);
    stopRollingSound();
    setIsSimulating(false);
    setGateETriggered(false);
    setGateFTriggered(false);
    const init = getInitialBallPos();
    setBallState({
      section: 'INCLINE',
      xPx: init.xPx,
      yPx: init.yPx,
      rotationDeg: init.rotationDeg,
      currentV: 0,
      progressSec: 0,
    });
    setMc964Display('00.00');
    setLastTEF(null);
    setLastVAvg(null);
  };

  useEffect(() => {
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      stopRollingSound();
    };
  }, []);

  return (
    <div className="space-y-6" id="speed-measurement-lab-container">
      {/* Title Header Matching User Screenshot */}
      <div className="rounded-3xl border border-white/10 bg-[#071124]/90 p-5 sm:p-6 shadow-2xl backdrop-blur-xl">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <span className="h-6 w-1.5 rounded-full bg-[#00D4FF] shadow-[0_0_12px_rgba(0,212,255,0.8)]"></span>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Mô Phỏng Thí Nghiệm Đo Tốc Độ Viên Bi Thép
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold transition cursor-pointer ${
                soundEnabled
                  ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
                  : 'border-slate-700 bg-slate-800 text-slate-400'
              }`}
              title="Âm thanh thí nghiệm"
            >
              {soundEnabled ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
              <span>{soundEnabled ? 'Âm thanh BẬT' : 'Âm thanh TẮT'}</span>
            </button>

            <span className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3.5 py-1 text-xs font-extrabold text-[#00FFCC]">
              Chuẩn GDPT 2018
            </span>
          </div>
        </div>
        <p className="mt-2 text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
          Mô phỏng chân thực hệ thống máng nghiêng, máng dẫn hướng ngang, 2 cổng quang điện $E, F$ và đồng hồ hiện số MC964. Thả viên bi lăn để đo thời gian chắn quang hoặc thời gian di chuyển giữa 2 cổng, từ đó xác định tốc độ tức thời và tốc độ trung bình.
        </p>
      </div>

      {/* Main Workspace Layout (Left: Lab Simulation Canvas | Right: Control Panel) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* ================= LEFT COLUMN: VIRTUAL EXPERIMENT APPARATUS (8 COLS) ================= */}
        <div className="lg:col-span-8 flex flex-col space-y-3">
          <div className="relative rounded-3xl border border-white/10 bg-gradient-to-b from-[#081329] to-[#040A17] p-4 sm:p-5 shadow-2xl overflow-hidden flex flex-col justify-between">
            
            {/* Top Canvas Bar */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3 z-10">
              <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-[#00D4FF]">
                <Video className="h-4 w-4" />
                <span>BỐ TRÍ THÍ NGHIỆM VẬT LÍ 10 (MÁNG DẪN HƯỚNG & ĐỒNG HỒ MC964)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="text-[11px] font-mono text-emerald-300">60 FPS Real-time Engine</span>
              </div>
            </div>

            {/* ================= REAL-TIME MEASUREMENT HUD (3 Cards nằm ngang phía trên máng thí nghiệm) ================= */}
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2.5 z-10">
              {experimentMode === 'INSTANT_SPEED' ? (
                <>
                  {instantGateTarget === 'GATE_E' && (
                    <>
                      {/* Metric 1: Thời gian chắn Cổng E */}
                      <div className="flex items-center justify-between gap-2 rounded-xl border border-cyan-500/40 bg-[#031d2e]/90 px-3.5 py-2 shadow-sm transition-all hover:border-cyan-500/60">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400/90">Thời gian chắn Cổng E</span>
                          <span className="text-xs font-semibold text-slate-300">t₁ (qua cổng quang E)</span>
                        </div>
                        <span className="rounded-lg border border-cyan-500/50 bg-[#011422] px-2.5 py-1 font-mono text-sm sm:text-base font-black text-[#00D4FF] shadow-inner">
                          {lastT1 !== null ? lastT1.toFixed(4) : '0.0000'} <span className="text-xs font-normal text-cyan-400">s</span>
                        </span>
                      </div>

                      {/* Metric 2: Đường kính viên bi */}
                      <div className="flex items-center justify-between gap-2 rounded-xl border border-emerald-500/30 bg-[#031c15]/90 px-3.5 py-2 shadow-sm transition-all hover:border-emerald-500/50">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400/80">Đường kính bi thép</span>
                          <span className="text-xs font-semibold text-slate-300">d = 2r</span>
                        </div>
                        <span className="rounded-lg border border-emerald-500/50 bg-[#01140e] px-2.5 py-1 font-mono text-sm sm:text-base font-black text-emerald-400 shadow-inner">
                          {ballDiameterMm} <span className="text-xs font-normal text-emerald-500">mm</span>
                        </span>
                      </div>

                      {/* Metric 3: Tốc độ tức thời tại E */}
                      <div className="flex items-center justify-between gap-2 rounded-xl border border-amber-500/40 bg-[#291704]/90 px-3.5 py-2 shadow-sm transition-all hover:border-amber-500/60">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400/90">Tốc độ tức thời tại E</span>
                          <span className="text-xs font-semibold text-slate-300">v_E = d / t₁</span>
                        </div>
                        <span className="rounded-lg border border-amber-500/50 bg-[#1c0f01] px-2.5 py-1 font-mono text-sm sm:text-base font-black text-amber-300 shadow-inner">
                          {lastVE !== null ? lastVE.toFixed(3) : '0.000'} <span className="text-xs font-normal text-amber-400">m/s</span>
                        </span>
                      </div>
                    </>
                  )}

                  {instantGateTarget === 'GATE_F' && (
                    <>
                      {/* Metric 1: Thời gian chắn Cổng F */}
                      <div className="flex items-center justify-between gap-2 rounded-xl border border-pink-500/40 bg-[#2b0c20]/90 px-3.5 py-2 shadow-sm transition-all hover:border-pink-500/60">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-pink-400/90">Thời gian chắn Cổng F</span>
                          <span className="text-xs font-semibold text-slate-300">t₂ (qua cổng quang F)</span>
                        </div>
                        <span className="rounded-lg border border-pink-500/50 bg-[#1f0515] px-2.5 py-1 font-mono text-sm sm:text-base font-black text-pink-400 shadow-inner">
                          {lastT2 !== null ? lastT2.toFixed(4) : '0.0000'} <span className="text-xs font-normal text-pink-300">s</span>
                        </span>
                      </div>

                      {/* Metric 2: Đường kính viên bi */}
                      <div className="flex items-center justify-between gap-2 rounded-xl border border-emerald-500/30 bg-[#031c15]/90 px-3.5 py-2 shadow-sm transition-all hover:border-emerald-500/50">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400/80">Đường kính bi thép</span>
                          <span className="text-xs font-semibold text-slate-300">d = 2r</span>
                        </div>
                        <span className="rounded-lg border border-emerald-500/50 bg-[#01140e] px-2.5 py-1 font-mono text-sm sm:text-base font-black text-emerald-400 shadow-inner">
                          {ballDiameterMm} <span className="text-xs font-normal text-emerald-500">mm</span>
                        </span>
                      </div>

                      {/* Metric 3: Tốc độ tức thời tại F */}
                      <div className="flex items-center justify-between gap-2 rounded-xl border border-amber-500/40 bg-[#291704]/90 px-3.5 py-2 shadow-sm transition-all hover:border-amber-500/60">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400/90">Tốc độ tức thời tại F</span>
                          <span className="text-xs font-semibold text-slate-300">v_F = d / t₂</span>
                        </div>
                        <span className="rounded-lg border border-amber-500/50 bg-[#1c0f01] px-2.5 py-1 font-mono text-sm sm:text-base font-black text-amber-300 shadow-inner">
                          {lastVF !== null ? lastVF.toFixed(3) : '0.000'} <span className="text-xs font-normal text-amber-400">m/s</span>
                        </span>
                      </div>
                    </>
                  )}

                  {instantGateTarget === 'BOTH' && (
                    <>
                      {/* Metric 1: Tốc độ tại Cổng E */}
                      <div className="flex items-center justify-between gap-2 rounded-xl border border-cyan-500/40 bg-[#031d2e]/90 px-3.5 py-2 shadow-sm transition-all hover:border-cyan-500/60">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400/90">Tốc độ Cổng E</span>
                          <span className="text-xs font-semibold text-slate-300">v_E = d / t₁</span>
                        </div>
                        <span className="rounded-lg border border-cyan-500/50 bg-[#011422] px-2 py-1 font-mono text-sm sm:text-base font-black text-[#00D4FF] shadow-inner">
                          {lastVE !== null ? lastVE.toFixed(3) : '0.000'} <span className="text-xs font-normal text-cyan-400">m/s</span>
                        </span>
                      </div>

                      {/* Metric 2: Tốc độ tại Cổng F */}
                      <div className="flex items-center justify-between gap-2 rounded-xl border border-pink-500/40 bg-[#2b0c20]/90 px-3.5 py-2 shadow-sm transition-all hover:border-pink-500/60">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-pink-400/90">Tốc độ Cổng F</span>
                          <span className="text-xs font-semibold text-slate-300">v_F = d / t₂</span>
                        </div>
                        <span className="rounded-lg border border-pink-500/50 bg-[#1f0515] px-2 py-1 font-mono text-sm sm:text-base font-black text-pink-400 shadow-inner">
                          {lastVF !== null ? lastVF.toFixed(3) : '0.000'} <span className="text-xs font-normal text-pink-300">m/s</span>
                        </span>
                      </div>

                      {/* Metric 3: So sánh độ chênh lệch */}
                      <div className="flex items-center justify-between gap-2 rounded-xl border border-amber-500/40 bg-[#291704]/90 px-3.5 py-2 shadow-sm transition-all hover:border-amber-500/60">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400/90">Độ chênh lệch Δv</span>
                          <span className="text-xs font-semibold text-slate-300">|v_F - v_E|</span>
                        </div>
                        <span className="rounded-lg border border-amber-500/50 bg-[#1c0f01] px-2.5 py-1 font-mono text-sm sm:text-base font-black text-amber-300 shadow-inner">
                          {lastVE !== null && lastVF !== null ? Math.abs(lastVF - lastVE).toFixed(3) : '0.000'} <span className="text-xs font-normal text-amber-400">m/s</span>
                        </span>
                      </div>
                    </>
                  )}
                </>
              ) : experimentMode === 'ACCELERATION' ? (
                <>
                  {/* Metric 1: Vận tốc vE & vF */}
                  <div className="flex items-center justify-between gap-2 rounded-xl border border-cyan-500/30 bg-[#041c30]/90 px-3.5 py-2 shadow-sm transition-all hover:border-cyan-500/50">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400/80">Vận tốc v_E → v_F</span>
                      <span className="text-xs font-semibold text-slate-300">v_E | v_F</span>
                    </div>
                    <span className="rounded-lg border border-cyan-500/50 bg-[#021321] px-2 py-1 font-mono text-xs sm:text-sm font-black text-[#00D4FF] shadow-inner">
                      {lastVE !== null ? lastVE.toFixed(2) : '0.00'} → {lastVF !== null ? lastVF.toFixed(2) : '0.00'} <span className="text-[10px] font-normal text-cyan-500">m/s</span>
                    </span>
                  </div>

                  {/* Metric 2: Quãng đường s */}
                  <div className="flex items-center justify-between gap-2 rounded-xl border border-emerald-500/30 bg-[#031c15]/90 px-3.5 py-2 shadow-sm transition-all hover:border-emerald-500/50">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400/80">Quãng đường s</span>
                      <span className="text-xs font-semibold text-slate-300">s = |x_F - x_E|</span>
                    </div>
                    <span className="rounded-lg border border-emerald-500/50 bg-[#01140e] px-2.5 py-1 font-mono text-sm sm:text-base font-black text-emerald-400 shadow-inner">
                      {distanceEFCm.toFixed(1)} <span className="text-xs font-normal text-emerald-500">cm</span>
                    </span>
                  </div>

                  {/* Metric 3: Gia tốc a */}
                  <div className="flex items-center justify-between gap-2 rounded-xl border border-pink-500/40 bg-[#2b0c20]/90 px-3.5 py-2 shadow-sm transition-all hover:border-pink-500/60">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-pink-400/90">Gia tốc chuyển động</span>
                      <span className="text-xs font-semibold text-slate-300">a = (v_F² - v_E²)/2s</span>
                    </div>
                    <span className="rounded-lg border border-pink-500/50 bg-[#1f0515] px-2.5 py-1 font-mono text-sm sm:text-base font-black text-pink-400 shadow-inner">
                      {lastAccel !== null ? lastAccel.toFixed(3) : '0.000'} <span className="text-xs font-normal text-pink-300">m/s²</span>
                    </span>
                  </div>
                </>
              ) : (
                <>
                  {/* Metric 1: Thời gian qua E-F */}
                  <div className="flex items-center justify-between gap-2 rounded-xl border border-emerald-500/30 bg-[#031c15]/90 px-3.5 py-2 shadow-sm transition-all hover:border-emerald-500/50">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400/80">Thời gian qua E-F</span>
                      <span className="text-xs font-semibold text-slate-300">Δt (E → F)</span>
                    </div>
                    <span className="rounded-lg border border-emerald-500/50 bg-[#01140e] px-2.5 py-1 font-mono text-sm sm:text-base font-black text-emerald-400 shadow-inner">
                      {lastTEF !== null ? lastTEF.toFixed(3) : '0.000'} <span className="text-xs font-normal text-emerald-500">s</span>
                    </span>
                  </div>

                  {/* Metric 2: Quãng đường E-F */}
                  <div className="flex items-center justify-between gap-2 rounded-xl border border-cyan-500/30 bg-[#041c30]/90 px-3.5 py-2 shadow-sm transition-all hover:border-cyan-500/50">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400/80">Quãng đường E-F</span>
                      <span className="text-xs font-semibold text-slate-300">s = |x_F - x_E|</span>
                    </div>
                    <span className="rounded-lg border border-cyan-500/50 bg-[#021321] px-2.5 py-1 font-mono text-sm sm:text-base font-black text-[#00D4FF] shadow-inner">
                      {distanceEFCm.toFixed(1)} <span className="text-xs font-normal text-cyan-500">cm</span>
                    </span>
                  </div>

                  {/* Metric 3: Tốc độ trung bình v */}
                  <div className="flex items-center justify-between gap-2 rounded-xl border border-amber-500/30 bg-[#291704]/90 px-3.5 py-2 shadow-sm transition-all hover:border-amber-500/50">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400/80">Tốc độ trung bình</span>
                      <span className="text-xs font-semibold text-slate-300">v̄ = s / Δt</span>
                    </div>
                    <span className="rounded-lg border border-amber-500/50 bg-[#1c0f01] px-2.5 py-1 font-mono text-sm sm:text-base font-black text-amber-300 shadow-inner">
                      {lastVAvg !== null ? lastVAvg.toFixed(3) : '0.000'} <span className="text-xs font-normal text-amber-400">m/s</span>
                    </span>
                  </div>
                </>
              )}
            </div>

            {/* Visual Lab Stage with Photorealistic Lab Environment (SVG & HTML Rig) */}
            <div className="relative my-3 w-full rounded-2xl border border-slate-700/80 bg-[#09152B] p-2 flex flex-col justify-between overflow-hidden shadow-inner h-[320px] sm:h-[340px]">
              
              {/* Background Laboratory Shelf & Instruments (Blurred Blueprint Art) */}
              <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(#00d4ff_1px,transparent_1px)] [background-size:16px_16px]"></div>
              
              {/* Desk Surface (Mặt bàn thí nghiệm màu xanh dương xám) */}
              <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-[#040c1a] via-[#071630] to-[#0a1e3f] border-t-2 border-cyan-500/30"></div>

              {/* SVG APPARATUS RIG: Stand, Incline, Horizontal Rail, Protractor & Plumb Line, Gates, Wires */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 800 380" preserveAspectRatio="xMidYMid meet">
                <defs>
                  {/* Gradients for metallic parts */}
                  <linearGradient id="metalPole" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#94a3b8" />
                    <stop offset="50%" stopColor="#f8fafc" />
                    <stop offset="100%" stopColor="#64748b" />
                  </linearGradient>

                  <linearGradient id="aluminumRail" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#e2e8f0" />
                    <stop offset="35%" stopColor="#cbd5e1" />
                    <stop offset="70%" stopColor="#94a3b8" />
                    <stop offset="100%" stopColor="#64748b" />
                  </linearGradient>

                  <linearGradient id="tripodCast" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#334155" />
                    <stop offset="50%" stopColor="#1e293b" />
                    <stop offset="100%" stopColor="#0f172a" />
                  </linearGradient>

                  {/* 3D Photorealistic Chrome Steel Ball Radial Gradient */}
                  <radialGradient id="chromeBall" cx="32%" cy="30%" r="68%" fx="28%" fy="26%">
                    <stop offset="0%" stopColor="#ffffff" />
                    <stop offset="18%" stopColor="#f1f5f9" />
                    <stop offset="42%" stopColor="#cbd5e1" />
                    <stop offset="70%" stopColor="#64748b" />
                    <stop offset="90%" stopColor="#334155" />
                    <stop offset="100%" stopColor="#0f172a" />
                  </radialGradient>

                  <radialGradient id="ballSpecHighlight" cx="30%" cy="28%" r="40%">
                    <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
                    <stop offset="50%" stopColor="#ffffff" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
                  </radialGradient>

                  {/* Contact Shadow Blur Filter */}
                  <filter id="contactShadowFilter" x="-40%" y="-40%" width="180%" height="180%">
                    <feGaussianBlur stdDeviation="1.5" />
                  </filter>

                  {/* Laser Glow */}
                  <filter id="laserGlow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="2" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>

                {/* --- 1. TRIPOD BASE (Chân đế 3 chạc màu đen đúc đối xứng, cân đối) --- */}
                <g id="tripod-base">
                  {/* Soft Drop Shadow on Tabletop */}
                  <ellipse cx="130" cy="348" rx="68" ry="10" fill="#000000" opacity="0.45" filter="url(#contactShadowFilter)" />
                  <ellipse cx="130" cy="282" rx="16" ry="4" fill="#000000" opacity="0.3" filter="url(#contactShadowFilter)" />

                  {/* Back Leg (Nhánh chân sau hướng lên theo luật phối cảnh) */}
                  <path
                    d="M 124 298 L 126 278 L 134 278 L 136 298 Z"
                    fill="#1e293b"
                    stroke="#334155"
                    strokeWidth="1.2"
                  />
                  {/* Back Leveling Screw Foot */}
                  <ellipse cx="130" cy="276" rx="5.5" ry="2.8" fill="#64748b" stroke="#334155" strokeWidth="0.8" />
                  <ellipse cx="130" cy="279" rx="4" ry="1.8" fill="#0f172a" />

                  {/* Front Left Leg (Nhánh chân trước bên trái đối xứng) */}
                  <path
                    d="M 118 304 L 75 344 L 85 351 L 127 312 Z"
                    fill="url(#tripodCast)"
                    stroke="#475569"
                    strokeWidth="1.5"
                  />
                  {/* Left Leg Highlight Ridge */}
                  <line x1="122" y1="307" x2="80" y2="347" stroke="#64748b" strokeWidth="1" strokeLinecap="round" />

                  {/* Front Right Leg (Nhánh chân trước bên phải đối xứng 100%) */}
                  <path
                    d="M 142 304 L 185 344 L 175 351 L 133 312 Z"
                    fill="url(#tripodCast)"
                    stroke="#475569"
                    strokeWidth="1.5"
                  />
                  {/* Right Leg Highlight Ridge */}
                  <line x1="138" y1="307" x2="180" y2="347" stroke="#64748b" strokeWidth="1" strokeLinecap="round" />

                  {/* Left Leveling Foot Assembly */}
                  <rect x="78.5" y="340" width="3" height="8" fill="#cbd5e1" stroke="#475569" strokeWidth="0.5" />
                  <ellipse cx="80" cy="344" rx="6.5" ry="3.5" fill="#94a3b8" stroke="#334155" strokeWidth="0.8" />
                  <ellipse cx="80" cy="349" rx="5" ry="2" fill="#0f172a" stroke="#1e293b" strokeWidth="0.6" />

                  {/* Right Leveling Foot Assembly */}
                  <rect x="178.5" y="340" width="3" height="8" fill="#cbd5e1" stroke="#475569" strokeWidth="0.5" />
                  <ellipse cx="180" cy="344" rx="6.5" ry="3.5" fill="#94a3b8" stroke="#334155" strokeWidth="0.8" />
                  <ellipse cx="180" cy="349" rx="5" ry="2" fill="#0f172a" stroke="#1e293b" strokeWidth="0.6" />

                  {/* Central Heavy Cast Iron Boss / Hub */}
                  <ellipse cx="130" cy="308" rx="22" ry="12" fill="url(#tripodCast)" stroke="#475569" strokeWidth="1.5" />
                  <ellipse cx="130" cy="306" rx="17" ry="8.5" fill="#1e293b" stroke="#64748b" strokeWidth="1.2" />

                  {/* Vertical Collar Socket holding the steel pole */}
                  <rect x="122" y="280" width="16" height="24" rx="3" fill="#1e293b" stroke="#64748b" strokeWidth="1.5" />
                  <ellipse cx="130" cy="280" rx="8" ry="4" fill="#0f172a" stroke="#94a3b8" strokeWidth="1" />
                  {/* Socket Locking Screw T-Handle */}
                  <circle cx="142" cy="290" r="3.5" fill="#cbd5e1" stroke="#475569" strokeWidth="1" />
                  <line x1="142" y1="285" x2="142" y2="295" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" />
                </g>

                {/* --- 2. VERTICAL STEEL POLE (Trục đứng inox) --- */}
                <rect x="126" y="30" width="8" height="255" fill="url(#metalPole)" stroke="#475569" strokeWidth="0.5" />

                {/* Horizontal Clamp Joint on Pole */}
                <rect x="120" y="210" width="20" height="22" rx="3" fill="#334155" stroke="#94a3b8" strokeWidth="1.5" />
                <circle cx="115" cy="221" r="5" fill="#cbd5e1" stroke="#475569" />

                {/* --- 3. PROTRACTOR & PLUMB BOB (Thước đo độ & Dây dọi) --- */}
                <g id="protractor-group" transform="translate(180, 225)">
                  {/* Protractor semi-circle */}
                  <path d="M -35 0 A 35 35 0 0 0 35 0 Z" fill="#ffffff" fillOpacity="0.9" stroke="#334155" strokeWidth="1.5" />
                  {/* Degree marks */}
                  {[-60, -45, -30, -15, 0, 15, 30, 45, 60].map((deg) => (
                    <line
                      key={deg}
                      x1="0"
                      y1="0"
                      x2={30 * Math.sin((deg * Math.PI) / 180)}
                      y2={30 * Math.cos((deg * Math.PI) / 180)}
                      stroke="#475569"
                      strokeWidth="0.8"
                    />
                  ))}
                  {/* Center origin */}
                  <circle cx="0" cy="0" r="3" fill="#0f172a" />
                  
                  {/* Plumb Line (Dây dọi thẳng đứng theo trọng lực) */}
                  <line x1="0" y1="0" x2="0" y2="45" stroke="#e2e8f0" strokeWidth="1.2" strokeDasharray="2,2" />
                  {/* Plumb cone bob */}
                  <polygon points="0,52 -4,45 4,45" fill="#f59e0b" stroke="#78350f" strokeWidth="1" />
                </g>

                {/* --- 4. INCLINED RELEASE TRACK (Máng nghiêng có thể chỉnh góc) --- */}
                {(() => {
                  return (
                    <g id="incline-track">
                      {/* Incline support rod to vertical pole */}
                      <line x1="130" y1="180" x2={topX + 15} y2={topY + 8} stroke="#94a3b8" strokeWidth="3" />
                      
                      {/* Incline Track Aluminum Beam */}
                      <line
                        x1={topX}
                        y1={topY}
                        x2={pivotX}
                        y2={pivotY}
                        stroke="url(#aluminumRail)"
                        strokeWidth="8"
                        strokeLinecap="round"
                      />

                      {/* Smooth Arc Junction connecting incline ramp to horizontal rail */}
                      <path
                        d={`M ${pivotX - 10} ${pivotY - 4} Q ${pivotX} ${pivotY} ${pivotX + 12} ${pivotY}`}
                        fill="none"
                        stroke="url(#aluminumRail)"
                        strokeWidth="8"
                        strokeLinecap="round"
                      />

                      {/* Release Box / Electromagnet N at top of incline */}
                      <g transform={`translate(${topX + 8}, ${topY - 8}) rotate(${inclineAngle})`}>
                        <rect x="-10" y="-12" width="24" height="20" rx="3" fill="#1e293b" stroke="#cbd5e1" strokeWidth="1.5" />
                        <rect x="-6" y="-8" width="16" height="6" fill="#dc2626" rx="1" />
                        <text x="2" y="-3" fontSize="5" fill="#ffffff" fontWeight="bold" textAnchor="middle">NC</text>
                      </g>
                    </g>
                  );
                })()}

                {/* --- 5. HORIZONTAL ALUMINUM RAIL (Máng dẫn hướng nằm ngang có vạch milimet) --- */}
                {/* --- 5a. END SUPPORT STAND (Chân đế đỡ cuối máng thí nghiệm có vít vi chỉnh thăng bằng) --- */}
                <g id="end-support-stand">
                  {/* Cast Iron Heavy Support Base resting on table */}
                  <path
                    d="M 618 342 L 640 326 L 652 326 L 674 342 L 670 346 L 622 346 Z"
                    fill="url(#tripodCast)"
                    stroke="#475569"
                    strokeWidth="1.5"
                  />
                  {/* Base Boss Hub */}
                  <ellipse cx="646" cy="326" rx="9" ry="5" fill="#1e293b" stroke="#64748b" strokeWidth="1.5" />
                  {/* Leveling screw feet on desk */}
                  <circle cx="622" cy="344" r="3.5" fill="#94a3b8" stroke="#334155" strokeWidth="0.8" />
                  <circle cx="670" cy="344" r="3.5" fill="#94a3b8" stroke="#334155" strokeWidth="0.8" />
                  <line x1="622" y1="340" x2="622" y2="344" stroke="#475569" strokeWidth="1" />
                  <line x1="670" y1="340" x2="670" y2="344" stroke="#475569" strokeWidth="1" />

                  {/* Vertical Stainless Steel Support Pillar */}
                  <rect x="642.5" y="233" width="7" height="94" fill="url(#metalPole)" stroke="#475569" strokeWidth="0.5" />

                  {/* Mid-Pillar Height Adjustment Ring & Locking Screw */}
                  <rect x="640" y="270" width="12" height="8" rx="2" fill="#334155" stroke="#94a3b8" strokeWidth="1" />
                  <circle cx="654" cy="274" r="3.5" fill="#d97706" stroke="#78350f" strokeWidth="0.8" />

                  {/* Top Rail Clamp Collar underneath horizontal track */}
                  <rect x="639" y="230" width="14" height="10" rx="2" fill="#1e293b" stroke="#64748b" strokeWidth="1.2" />
                  <circle cx="637" cy="235" r="3" fill="#cbd5e1" stroke="#475569" strokeWidth="0.8" />
                </g>

                <g id="horizontal-rail" transform="translate(130, 218)">
                  {/* Main Beam */}
                  <rect x="0" y="0" width="530" height="15" rx="2" fill="url(#aluminumRail)" stroke="#475569" strokeWidth="1.5" />
                  {/* Millimeter Scale Top Strip */}
                  <rect x="5" y="1" width="520" height="4" fill="#ffffff" opacity="0.9" />
                  
                  {/* Scale Markings every 5cm / 10cm */}
                  {[0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60].map((val) => {
                    const xPos = 135 + val * 6.2; // mapping 0-60cm to rail pixels
                    return (
                      <g key={val} transform={`translate(${xPos}, 0)`}>
                        <line x1="0" y1="1" x2="0" y2="5" stroke="#0f172a" strokeWidth="1" />
                        <text x="0" y="11" fontSize="6" fill="#0f172a" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
                          {val}
                        </text>
                      </g>
                    );
                  })}

                  {/* End Stopper & Rubber Cushion at 60cm */}
                  <g transform="translate(515, -4)">
                    <rect x="0" y="0" width="10" height="19" rx="2" fill="#0f172a" stroke="#475569" strokeWidth="1.2" />
                    <rect x="-3" y="2" width="4" height="15" rx="1.5" fill="#e11d48" />
                  </g>
                </g>

                {/* --- 6. PHOTOGATE E (Cổng quang điện E) --- */}
                {(() => {
                  const gateEX = 130 + 135 + gateEPos * 6.2;
                  const gateEY = 210;
                  return (
                    <g id="gate-e" transform={`translate(${gateEX}, ${gateEY})`}>
                      {/* Gate U-Frame (Màu xám đen viền vàng đồng) */}
                      <rect x="-10" y="-35" width="20" height="35" rx="3" fill="#1e293b" stroke="#d97706" strokeWidth="1.5" />
                      <rect x="-5" y="-28" width="10" height="28" fill="#09152b" />
                      {/* Gate Label E */}
                      <rect x="-7" y="-33" width="14" height="10" rx="1" fill="#3b82f6" />
                      <text x="0" y="-25.5" fontSize="8" fill="#ffffff" fontWeight="black" textAnchor="middle">E</text>
                      
                      {/* Golden tightening knob below rail */}
                      <circle cx="0" cy="18" r="4" fill="#d97706" stroke="#78350f" strokeWidth="1" />
                      
                      {/* Optical Laser Beam across Gate */}
                      <line
                        x1="-4"
                        y1="-8"
                        x2="4"
                        y2="-8"
                        stroke={gateETriggered ? '#ef4444' : '#00d4ff'}
                        strokeWidth={gateETriggered ? '3' : '1.5'}
                        filter="url(#laserGlow)"
                      />

                      {/* Cable curving down to Digital Timer */}
                      <path
                        d="M 0 22 C 0 50, 40 70, 80 80"
                        fill="none"
                        stroke="#94a3b8"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </g>
                  );
                })()}

                {/* --- 7. PHOTOGATE F (Cổng quang điện F) --- */}
                {(() => {
                  const gateFX = 130 + 135 + gateFPos * 6.2;
                  const gateFY = 210;
                  return (
                    <g id="gate-f" transform={`translate(${gateFX}, ${gateFY})`}>
                      {/* Gate U-Frame */}
                      <rect x="-10" y="-35" width="20" height="35" rx="3" fill="#1e293b" stroke="#d97706" strokeWidth="1.5" />
                      <rect x="-5" y="-28" width="10" height="28" fill="#09152b" />
                      {/* Gate Label F */}
                      <rect x="-7" y="-33" width="14" height="10" rx="1" fill="#ec4899" />
                      <text x="0" y="-25.5" fontSize="8" fill="#ffffff" fontWeight="black" textAnchor="middle">F</text>
                      
                      {/* Golden tightening knob below rail */}
                      <circle cx="0" cy="18" r="4" fill="#d97706" stroke="#78350f" strokeWidth="1" />
                      
                      {/* Optical Laser Beam across Gate */}
                      <line
                        x1="-4"
                        y1="-8"
                        x2="4"
                        y2="-8"
                        stroke={gateFTriggered ? '#ef4444' : '#ec4899'}
                        strokeWidth={gateFTriggered ? '3' : '1.5'}
                        filter="url(#laserGlow)"
                      />

                      {/* Cable curving down to Digital Timer */}
                      <path
                        d="M 0 22 C -20 60, -60 70, -120 80"
                        fill="none"
                        stroke="#94a3b8"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </g>
                  );
                })()}

                {/* --- 8. REALISTIC 3D CHROME STEEL BALL WITH SPINNING SURFACE & CONTACT SHADOW --- */}
                {ballState.xPx > 0 && (
                  <g id="steel-ball-rig" transform={`translate(${ballState.xPx}, ${ballState.yPx})`}>
                    {/* Elliptical Contact Shadow under ball */}
                    <ellipse
                      cx="0"
                      cy={ballRadiusPx * 0.95}
                      rx={ballRadiusPx * 0.9}
                      ry={ballRadiusPx * 0.3}
                      fill="rgba(0, 0, 0, 0.65)"
                      filter="url(#contactShadowFilter)"
                    />

                    {/* Sphere Base with Multi-Layer Chrome Radial Gradient */}
                    <circle
                      cx="0"
                      cy="0"
                      r={ballRadiusPx}
                      fill="url(#chromeBall)"
                      stroke="#475569"
                      strokeWidth="0.8"
                    />

                    {/* Rotating Surface Markings (Simulating visual sphere rolling w = v / r) */}
                    <g transform={`rotate(${ballState.rotationDeg})`}>
                      {/* Latitude & Longitude Curvature Lines */}
                      <ellipse
                        cx="0"
                        cy="0"
                        rx={ballRadiusPx * 0.85}
                        ry={ballRadiusPx * 0.3}
                        fill="none"
                        stroke="rgba(255, 255, 255, 0.4)"
                        strokeWidth="0.8"
                        strokeDasharray="2,2"
                      />
                      <line
                        x1={-ballRadiusPx * 0.8}
                        y1="0"
                        x2={ballRadiusPx * 0.8}
                        y2="0"
                        stroke="rgba(15, 23, 42, 0.45)"
                        strokeWidth="0.9"
                      />
                      {/* Rolling orientation notch */}
                      <circle cx={ballRadiusPx * 0.5} cy="0" r="1.2" fill="#0284c7" />
                    </g>

                    {/* Specular Glare Reflection Spot */}
                    <ellipse
                      cx={-ballRadiusPx * 0.32}
                      cy={-ballRadiusPx * 0.35}
                      rx={ballRadiusPx * 0.45}
                      ry={ballRadiusPx * 0.3}
                      transform={`rotate(-25, ${-ballRadiusPx * 0.32}, ${-ballRadiusPx * 0.35})`}
                      fill="url(#ballSpecHighlight)"
                    />
                    <circle
                      cx={-ballRadiusPx * 0.36}
                      cy={-ballRadiusPx * 0.38}
                      r={ballRadiusPx * 0.16}
                      fill="#ffffff"
                      opacity="0.9"
                    />
                  </g>
                )}

                {/* --- 8. POWER SUPPLY ADAPTER (Cục nguồn DC màu đen) --- */}
                <g id="power-adapter" transform="translate(260, 275)">
                  <rect x="0" y="0" width="80" height="32" rx="4" fill="#0f172a" stroke="#334155" strokeWidth="1.5" />
                  {/* Decorative grooves on adapter */}
                  <rect x="25" y="5" width="30" height="22" fill="#1e293b" rx="2" />
                  <line x1="35" y1="5" x2="35" y2="27" stroke="#334155" strokeWidth="1" />
                  <line x1="45" y1="5" x2="45" y2="27" stroke="#334155" strokeWidth="1" />
                  {/* Power LED Indicator */}
                  <circle cx="10" cy="16" r="2.5" fill="#22c55e" filter="url(#laserGlow)" />
                  {/* DC Cable output to MC964 */}
                  <path d="M 80 16 L 140 20" fill="none" stroke="#64748b" strokeWidth="3" />
                </g>

                {/* --- 9. DIGITAL TIMER MC964 (Đồng hồ hiện số MC964 trên bàn) --- */}
                <g id="digital-timer-mc964" transform="translate(410, 260)">
                  {/* Timer Body */}
                  <rect x="0" y="0" width="145" height="68" rx="6" fill="#e2e8f0" stroke="#475569" strokeWidth="2" />
                  {/* Front metallic stand leg */}
                  <polygon points="10,68 5,80 20,80 25,68" fill="#94a3b8" />
                  <polygon points="135,68 140,80 125,80 120,68" fill="#94a3b8" />
                  
                  {/* LCD Display Screen Bezel */}
                  <rect x="18" y="10" width="60" height="28" rx="3" fill="#022c22" stroke="#064e3b" strokeWidth="1.5" />
                  {/* 7-Segment Timer digits */}
                  <text x="48" y="30" fontSize="15" fill="#34d399" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
                    {mc964Display}
                  </text>
                  <text x="72" y="30" fontSize="7" fill="#10b981" fontFamily="sans-serif">s</text>

                  {/* Brand & Model Text */}
                  <text x="48" y="46" fontSize="4.5" fill="#475569" fontWeight="bold" textAnchor="middle">DIGITAL TIMER MC-964</text>
                  <text x="48" y="54" fontSize="4" fill="#64748b" textAnchor="middle">MODE A ↔ B</text>

                  {/* Rotary Dial & Function Switches */}
                  <circle cx="105" cy="24" r="8" fill="#334155" stroke="#0f172a" strokeWidth="1" />
                  <line x1="105" y1="24" x2="105" y2="18" stroke="#ffffff" strokeWidth="1.5" />
                  
                  {/* Red Reset / Start Button */}
                  <circle cx="128" cy="24" r="5" fill="#dc2626" stroke="#991b1b" strokeWidth="1" />
                </g>


              </svg>

              {/* Bottom Spacer / Clean visual clearance for the apparatus table */}
              <div className="relative z-10 h-2"></div>
            </div>

            {/* Integrated Primary Interactive Control Bar (Directly beneath the stage) */}
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-[#061022] p-3 shadow-md">
              {/* Left: Release Ball & Reset Buttons */}
              <div className="flex items-center gap-2.5">
                <button
                  id="btn-release-ball-steel"
                  onClick={handleStartSimulation}
                  disabled={isSimulating}
                  className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 via-amber-500 to-rose-600 hover:opacity-95 px-5 py-2.5 text-xs sm:text-sm font-black text-white shadow-[0_0_20px_rgba(34,197,94,0.4)] transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer"
                >
                  <Play className="h-4 w-4 fill-white" />
                  <span>{isSimulating ? 'Đang Lăn Thí Nghiệm...' : 'Thả Bi (Start)'}</span>
                </button>

                <button
                  onClick={handleReset}
                  className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-[#0D1E3A] hover:bg-[#12284C] px-3.5 py-2.5 text-xs font-bold text-slate-300 transition cursor-pointer"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Đặt lại (Reset)</span>
                </button>
              </div>

              {/* Center: Live Telemetry Status */}
              <div className="hidden sm:flex items-center gap-4 text-xs text-slate-400">
                <div className="flex items-center gap-1.5">
                  <span>Vận tốc:</span>
                  <strong className="font-mono font-bold text-[#00FFCC]">{ballState.currentV.toFixed(2)} m/s</strong>
                </div>
                <div className="flex items-center gap-1.5">
                  <span>Vị trí:</span>
                  <strong className="font-mono font-semibold text-slate-200">{ballState.section === 'INCLINE' ? 'Máng nghiêng' : 'Máng ngang'}</strong>
                </div>
              </div>

              {/* Right: Slow Motion Speed Control */}
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <span className="text-[11px]">Tốc độ:</span>
                {[1, 0.5, 0.25].map((spd) => (
                  <button
                    key={spd}
                    onClick={() => setPlaybackSpeed(spd)}
                    className={`rounded-lg px-2.5 py-1 font-mono text-[11px] font-bold transition cursor-pointer ${
                      playbackSpeed === spd
                        ? 'bg-[#00D4FF] text-black shadow-[0_0_10px_rgba(0,212,255,0.5)]'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {spd}x
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* ================= RIGHT COLUMN: CÀI ĐẶT THAM SỐ THIẾT BỊ (4 COLS) ================= */}
        <div className="lg:col-span-4 flex flex-col space-y-4">
          <div className="rounded-3xl border border-white/10 bg-[#081329] p-4 sm:p-5 shadow-2xl space-y-4 h-full flex flex-col justify-between">
            
            {/* Header: Bảng Điều Khiển */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h2 className="text-sm sm:text-base font-black text-white uppercase tracking-tight flex items-center gap-2">
                <Sliders className="h-4 w-4 text-[#00D4FF]" />
                <span>Cài Đặt Tham Số</span>
              </h2>
              <span className="text-[11px] font-mono text-emerald-400 font-bold bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-md">
                Chuẩn GDPT 2018
              </span>
            </div>

            {/* Section 1: Chế độ đo (Mode Selection) */}
            <div className="space-y-2.5 rounded-2xl border border-white/5 bg-[#0A1835] p-3">
              <div className="flex items-center justify-between">
                <div className="text-[11px] font-bold text-[#00D4FF] uppercase tracking-wider">Chế độ thực hành</div>
                <span className="text-[10px] font-mono text-slate-400">SGK Vật Lí 10</span>
              </div>
              
              <div className="grid grid-cols-3 gap-1.5 text-xs font-semibold">
                <button
                  type="button"
                  id="btn-mode-avg-speed"
                  onClick={() => {
                    setExperimentMode('AVG_SPEED');
                    setMeasurementSelect('EF');
                  }}
                  className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl border transition-all cursor-pointer text-center ${
                    experimentMode === 'AVG_SPEED'
                      ? 'bg-[#00D4FF]/20 border-[#00D4FF] text-cyan-200 shadow-[0_0_12px_rgba(0,212,255,0.3)] font-bold'
                      : 'bg-[#071328] border-white/5 text-slate-400 hover:text-white'
                  }`}
                >
                  <span className="text-xs">🎯 Tốc Độ TB</span>
                  <span className="text-[9.5px] opacity-80 font-mono mt-0.5">v̄ = s/Δt</span>
                </button>

                <button
                  type="button"
                  id="btn-mode-instant-speed"
                  onClick={() => {
                    setExperimentMode('INSTANT_SPEED');
                    setMeasurementSelect(instantGateTarget === 'GATE_F' ? 'T2' : 'T1');
                  }}
                  className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl border transition-all cursor-pointer text-center ${
                    experimentMode === 'INSTANT_SPEED'
                      ? 'bg-emerald-500/20 border-emerald-400 text-emerald-200 shadow-[0_0_12px_rgba(16,185,129,0.3)] font-bold'
                      : 'bg-[#071328] border-white/5 text-slate-400 hover:text-white'
                  }`}
                >
                  <span className="text-xs">⏱️ Tức Thời (v)</span>
                  <span className="text-[9.5px] opacity-80 font-mono mt-0.5">v = d/t</span>
                </button>

                <button
                  type="button"
                  id="btn-mode-accel"
                  onClick={() => {
                    setExperimentMode('ACCELERATION');
                    setMeasurementSelect('ALL');
                  }}
                  className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl border transition-all cursor-pointer text-center ${
                    experimentMode === 'ACCELERATION'
                      ? 'bg-pink-500/20 border-pink-500 text-pink-200 shadow-[0_0_12px_rgba(236,72,153,0.3)] font-bold'
                      : 'bg-[#071328] border-white/5 text-slate-400 hover:text-white'
                  }`}
                >
                  <span className="text-xs">⚡ Gia Tốc (a)</span>
                  <span className="text-[9.5px] opacity-80 font-mono mt-0.5">a = Δv/Δt</span>
                </button>
              </div>

              {/* Sub-selector for Instant Speed: Cổng E / Cổng F / Cả 2 cổng */}
              {experimentMode === 'INSTANT_SPEED' && (
                <div className="rounded-xl border border-emerald-500/25 bg-[#031d16] p-2.5 space-y-1.5 transition-all">
                  <div className="flex items-center justify-between text-[10px] font-bold text-emerald-300 uppercase">
                    <span>Vị trí cổng đo tốc độ tức thời:</span>
                    <span className="font-mono text-xs text-amber-300">v = d / t</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5 text-[11px]">
                    <button
                      type="button"
                      id="btn-instant-gate-e"
                      onClick={() => {
                        setInstantGateTarget('GATE_E');
                        setMeasurementSelect('T1');
                      }}
                      className={`py-1.5 px-1 rounded-lg border text-center transition cursor-pointer font-bold ${
                        instantGateTarget === 'GATE_E'
                          ? 'bg-cyan-500/30 border-cyan-400 text-cyan-200 shadow-sm'
                          : 'bg-[#071328] border-white/5 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      🔵 Cổng E (v_E)
                    </button>

                    <button
                      type="button"
                      id="btn-instant-gate-f"
                      onClick={() => {
                        setInstantGateTarget('GATE_F');
                        setMeasurementSelect('T2');
                      }}
                      className={`py-1.5 px-1 rounded-lg border text-center transition cursor-pointer font-bold ${
                        instantGateTarget === 'GATE_F'
                          ? 'bg-pink-500/30 border-pink-400 text-pink-200 shadow-sm'
                          : 'bg-[#071328] border-white/5 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      🟣 Cổng F (v_F)
                    </button>

                    <button
                      type="button"
                      id="btn-instant-gate-both"
                      onClick={() => {
                        setInstantGateTarget('BOTH');
                        setMeasurementSelect('ALL');
                      }}
                      className={`py-1.5 px-1 rounded-lg border text-center transition cursor-pointer font-bold ${
                        instantGateTarget === 'BOTH'
                          ? 'bg-amber-500/30 border-amber-400 text-amber-200 shadow-sm'
                          : 'bg-[#071328] border-white/5 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      🟢 Cả 2 cổng
                    </button>
                  </div>
                </div>
              )}

              {/* Dropdown Phương thức đo */}
              <div className="pt-1">
                <label className="block text-[10px] text-slate-400 mb-1 font-medium">Đại lượng hiển thị trên đồng hồ MC964:</label>
                <select
                  value={measurementSelect}
                  onChange={(e) => setMeasurementSelect(e.target.value as any)}
                  className="w-full rounded-xl border border-white/10 bg-[#071124] px-3 py-1.5 text-xs font-bold text-slate-200 focus:border-[#00D4FF] focus:outline-none cursor-pointer"
                >
                  <option value="EF">Thời gian t(E → F) qua 2 cổng</option>
                  <option value="T1">Thời gian chắn Cổng E (t1)</option>
                  <option value="T2">Thời gian chắn Cổng F (t2)</option>
                  <option value="ALL">Đo toàn diện (t1, t2, t_EF)</option>
                </select>
              </div>
            </div>

            {/* Section 2: Cài đặt (Parameters Sliders) */}
            <div className="space-y-3 rounded-2xl border border-white/5 bg-[#0A1835] p-3 flex-1">
              <div className="text-[11px] font-bold text-[#00D4FF] uppercase tracking-wider">Tinh chỉnh kích thước & vị trí</div>
              
              {/* Slider 1: Độ dốc máng nghiêng */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300">Góc nghiêng máng (α):</span>
                  <span className="font-mono font-bold text-amber-400">{inclineAngle}°</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="35"
                  step="1"
                  disabled={isSimulating}
                  value={inclineAngle}
                  onChange={(e) => setInclineAngle(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
                />
              </div>

              {/* Slider 2: Vị trí Cổng E */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300">Vị trí Cổng E trên thước:</span>
                  <span className="font-mono font-bold text-[#00D4FF]">{gateEPos} cm</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max={Math.min(25, gateFPos - 5)}
                  step="1"
                  disabled={isSimulating}
                  value={gateEPos}
                  onChange={(e) => setGateEPos(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#00D4FF]"
                />
              </div>

              {/* Slider 3: Vị trí Cổng F */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300">Vị trí Cổng F trên thước:</span>
                  <span className="font-mono font-bold text-pink-400">{gateFPos} cm</span>
                </div>
                <input
                  type="range"
                  min={Math.max(25, gateEPos + 5)}
                  max="55"
                  step="1"
                  disabled={isSimulating}
                  value={gateFPos}
                  onChange={(e) => setGateFPos(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-pink-400"
                />
              </div>

              {/* Slider 4: Đường kính viên bi thép */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300">Đường kính bi thép (d):</span>
                  <span className="font-mono font-bold text-emerald-400">{ballDiameterMm} mm</span>
                </div>
                <input
                  type="range"
                  min="8"
                  max="25"
                  step="1"
                  disabled={isSimulating}
                  value={ballDiameterMm}
                  onChange={(e) => setBallDiameterMm(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
                />
              </div>
            </div>

            {/* Quick Principle Note */}
            <div className="rounded-xl border border-cyan-500/20 bg-cyan-950/20 p-2.5 text-[11px] text-slate-300 flex items-start gap-2">
              <Info className="h-4 w-4 text-[#00D4FF] shrink-0 mt-0.5" />
              <span>
                Đồng hồ MC-964 tự động kích hoạt đếm khi bi đi qua Cổng E và ngắt khi qua Cổng F với độ chính xác <strong className="text-emerald-400 font-mono">0.001s</strong>.
              </span>
            </div>

          </div>
        </div>

      </div>

      {/* ================= ZONE 2: ANALYTICAL DASHBOARD (TABLE, GRAPH, FORMULAS) ================= */}
      {/* Full 12-column balanced row across the lower screen */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
        
        {/* 1. BẢNG KẾT QUẢ THỰC NGHIỆM & THỐNG KÊ SAI SỐ (5 COLS) */}
        <div className="lg:col-span-5 rounded-3xl border border-white/10 bg-[#081329] p-4 sm:p-5 shadow-2xl space-y-3 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
              <div className="flex items-center gap-2">
                <TableIcon className="h-4 w-4 text-[#00FFCC]" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Bảng Số Liệu Thực Nghiệm</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    // Seed realistic experimental run
                    setResults((prev) => [
                      ...prev,
                      {
                        run: prev.length + 1,
                        t1: Number((0.0242 + (Math.random() - 0.5) * 0.001).toFixed(4)),
                        t2: Number((0.0245 + (Math.random() - 0.5) * 0.001).toFixed(4)),
                        tEF: Number((0.384 + (Math.random() - 0.5) * 0.005).toFixed(3)),
                        dCm: Number((ballDiameterMm / 10).toFixed(1)),
                        sCm: distanceEFCm,
                        vE: 0.412,
                        vF: 0.408,
                        vAvg: Number((distanceEFM / 0.385).toFixed(3)),
                        accel: 0.01,
                      }
                    ]);
                  }}
                  className="text-[11px] font-bold text-[#00D4FF] hover:underline cursor-pointer"
                >
                  + Thêm mẫu
                </button>
                <span className="text-slate-600">|</span>
                <button
                  onClick={() => setResults([])}
                  className="text-[11px] text-rose-400 hover:underline cursor-pointer"
                >
                  Xóa bảng
                </button>
              </div>
            </div>

            {/* Data Table */}
            <div className="overflow-x-auto rounded-xl border border-white/10 bg-[#050C1A] max-h-56 overflow-y-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="sticky top-0 bg-[#071328] text-slate-300 border-b border-white/10 text-[11px]">
                  <tr>
                    <th className="p-2">Lần</th>
                    <th className={`p-2 ${experimentMode === 'INSTANT_SPEED' && (instantGateTarget === 'GATE_E' || instantGateTarget === 'BOTH') ? 'font-bold text-[#00D4FF] bg-cyan-950/40' : ''}`}>
                      t₁ (s)
                    </th>
                    <th className={`p-2 ${experimentMode === 'INSTANT_SPEED' && (instantGateTarget === 'GATE_F' || instantGateTarget === 'BOTH') ? 'font-bold text-pink-400 bg-pink-950/40' : ''}`}>
                      t₂ (s)
                    </th>
                    <th className={`p-2 ${(experimentMode === 'AVG_SPEED' || experimentMode === 'ACCELERATION') ? 'font-bold text-emerald-400 bg-emerald-950/40' : ''}`}>
                      Δt<sub>EF</sub> (s)
                    </th>
                    <th className={`p-2 ${experimentMode === 'INSTANT_SPEED' ? 'font-bold text-emerald-400 bg-emerald-950/40' : ''}`}>
                      d (cm)
                    </th>
                    <th className={`p-2 ${experimentMode === 'INSTANT_SPEED' && (instantGateTarget === 'GATE_E' || instantGateTarget === 'BOTH') ? 'font-bold text-[#00FFCC] bg-teal-950/50' : 'text-slate-400'}`}>
                      v<sub>E</sub> (m/s)
                    </th>
                    <th className={`p-2 ${experimentMode === 'INSTANT_SPEED' && (instantGateTarget === 'GATE_F' || instantGateTarget === 'BOTH') ? 'font-bold text-pink-300 bg-pink-950/50' : 'text-slate-400'}`}>
                      v<sub>F</sub> (m/s)
                    </th>
                    <th className={`p-2 ${experimentMode === 'AVG_SPEED' ? 'font-bold text-amber-300 bg-amber-950/50' : 'text-slate-400'}`}>
                      v̄<sub>tb</sub> (m/s)
                    </th>
                    {experimentMode === 'ACCELERATION' && (
                      <th className="p-2 font-bold text-pink-400 bg-pink-950/50">a(m/s²)</th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {results.length === 0 ? (
                    <tr>
                      <td colSpan={experimentMode === 'ACCELERATION' ? 9 : 8} className="p-6 text-center text-slate-500 font-sans text-xs">
                        Chưa có dữ liệu lần đo nào. Bấm <strong>"Thả Bi (Start)"</strong> để bắt đầu ghi nhận kết quả.
                      </td>
                    </tr>
                  ) : (
                    results.map((r) => (
                      <tr key={r.run} className="hover:bg-white/5 transition-colors">
                        <td className="p-2 font-bold text-[#00D4FF]">#{r.run}</td>
                        <td className={`p-2 ${experimentMode === 'INSTANT_SPEED' && (instantGateTarget === 'GATE_E' || instantGateTarget === 'BOTH') ? 'font-bold text-[#00D4FF]' : ''}`}>
                          {r.t1.toFixed(4)}
                        </td>
                        <td className={`p-2 ${experimentMode === 'INSTANT_SPEED' && (instantGateTarget === 'GATE_F' || instantGateTarget === 'BOTH') ? 'font-bold text-pink-400' : ''}`}>
                          {r.t2.toFixed(4)}
                        </td>
                        <td className={`p-2 ${(experimentMode === 'AVG_SPEED' || experimentMode === 'ACCELERATION') ? 'font-bold text-emerald-400' : ''}`}>
                          {r.tEF.toFixed(3)}
                        </td>
                        <td className="p-2">{r.dCm.toFixed(1)}</td>
                        <td className={`p-2 ${experimentMode === 'INSTANT_SPEED' && (instantGateTarget === 'GATE_E' || instantGateTarget === 'BOTH') ? 'font-bold text-[#00FFCC]' : ''}`}>
                          {r.vE.toFixed(3)}
                        </td>
                        <td className={`p-2 ${experimentMode === 'INSTANT_SPEED' && (instantGateTarget === 'GATE_F' || instantGateTarget === 'BOTH') ? 'font-bold text-pink-300' : ''}`}>
                          {r.vF.toFixed(3)}
                        </td>
                        <td className={`p-2 ${experimentMode === 'AVG_SPEED' ? 'font-bold text-amber-300' : ''}`}>
                          {r.vAvg.toFixed(3)}
                        </td>
                        {experimentMode === 'ACCELERATION' && (
                          <td className="p-2 font-bold text-pink-400">{r.accel.toFixed(2)}</td>
                        )}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Error Processing Box (Xử lí sai số theo SGK) */}
          {results.length > 0 && (() => {
            const avgVAvg = results.reduce((acc, r) => acc + r.vAvg, 0) / results.length;
            const avgVE = results.reduce((acc, r) => acc + r.vE, 0) / results.length;
            const avgVF = results.reduce((acc, r) => acc + r.vF, 0) / results.length;
            const avgT1 = results.reduce((acc, r) => acc + r.t1, 0) / results.length;
            const avgT2 = results.reduce((acc, r) => acc + r.t2, 0) / results.length;
            const avgTEF = results.reduce((acc, r) => acc + r.tEF, 0) / results.length;
            const avgAccel = results.reduce((acc, r) => acc + r.accel, 0) / results.length;

            const deltaVAvg = results.reduce((acc, r) => acc + Math.abs(r.vAvg - avgVAvg), 0) / results.length;
            const deltaVE = results.reduce((acc, r) => acc + Math.abs(r.vE - avgVE), 0) / results.length;
            const deltaVF = results.reduce((acc, r) => acc + Math.abs(r.vF - avgVF), 0) / results.length;
            const deltaAccel = results.reduce((acc, r) => acc + Math.abs(r.accel - avgAccel), 0) / results.length;

            return (
              <div className="rounded-xl border border-white/5 bg-[#061226] p-3 space-y-1.5 text-xs">
                {experimentMode === 'INSTANT_SPEED' ? (
                  <>
                    {instantGateTarget === 'GATE_E' && (
                      <>
                        <div className="flex items-center justify-between text-slate-300">
                          <span>Thời gian chắn sáng TB <span className="font-mono text-[#00D4FF] font-bold">t̄₁</span>:</span>
                          <span className="font-mono font-bold text-[#00D4FF]">{avgT1.toFixed(4)} s</span>
                        </div>
                        <div className="flex items-center justify-between text-slate-300">
                          <span>Tốc độ tức thời TB tại E <span className="font-mono text-[#00FFCC] font-bold">v̄_E = d / t̄₁</span>:</span>
                          <span className="font-mono font-bold text-[#00FFCC]">{avgVE.toFixed(3)} m/s</span>
                        </div>
                        <div className="flex items-center justify-between pt-1 border-t border-white/5 font-semibold">
                          <span className="text-cyan-300">Kết quả đo tốc độ tức thời tại E:</span>
                          <span className="font-mono text-[#00FFCC] bg-[#02201c] px-2 py-0.5 rounded border border-emerald-500/30">
                            v_E = {avgVE.toFixed(3)} ± {deltaVE.toFixed(3)} (m/s)
                          </span>
                        </div>
                      </>
                    )}

                    {instantGateTarget === 'GATE_F' && (
                      <>
                        <div className="flex items-center justify-between text-slate-300">
                          <span>Thời gian chắn sáng TB <span className="font-mono text-pink-400 font-bold">t̄₂</span>:</span>
                          <span className="font-mono font-bold text-pink-400">{avgT2.toFixed(4)} s</span>
                        </div>
                        <div className="flex items-center justify-between text-slate-300">
                          <span>Tốc độ tức thời TB tại F <span className="font-mono text-pink-300 font-bold">v̄_F = d / t̄₂</span>:</span>
                          <span className="font-mono font-bold text-pink-300">{avgVF.toFixed(3)} m/s</span>
                        </div>
                        <div className="flex items-center justify-between pt-1 border-t border-white/5 font-semibold">
                          <span className="text-pink-300">Kết quả đo tốc độ tức thời tại F:</span>
                          <span className="font-mono text-pink-300 bg-[#240618] px-2 py-0.5 rounded border border-pink-500/30">
                            v_F = {avgVF.toFixed(3)} ± {deltaVF.toFixed(3)} (m/s)
                          </span>
                        </div>
                      </>
                    )}

                    {instantGateTarget === 'BOTH' && (
                      <>
                        <div className="flex items-center justify-between text-slate-300">
                          <span>Tốc độ tức thời tại E & F:</span>
                          <span className="font-mono font-bold text-[#00D4FF]">{avgVE.toFixed(3)} m/s <span className="text-slate-400">|</span> {avgVF.toFixed(3)} m/s</span>
                        </div>
                        <div className="flex items-center justify-between pt-1 border-t border-white/5 font-semibold text-[11px]">
                          <span className="text-cyan-300">Biểu diễn kết quả:</span>
                          <div className="flex gap-1.5 font-mono text-xs">
                            <span className="text-[#00FFCC] bg-[#02201c] px-1.5 py-0.5 rounded border border-emerald-500/30">
                              v_E = {avgVE.toFixed(3)} ± {deltaVE.toFixed(3)}
                            </span>
                            <span className="text-pink-300 bg-[#240618] px-1.5 py-0.5 rounded border border-pink-500/30">
                              v_F = {avgVF.toFixed(3)} ± {deltaVF.toFixed(3)}
                            </span>
                          </div>
                        </div>
                      </>
                    )}
                  </>
                ) : experimentMode === 'ACCELERATION' ? (
                  <>
                    <div className="flex items-center justify-between text-slate-300">
                      <span>Vận tốc TB tại 2 cổng <span className="font-mono text-cyan-300 font-bold">v̄_E & v̄_F</span>:</span>
                      <span className="font-mono font-bold text-cyan-300">{avgVE.toFixed(3)} m/s → {avgVF.toFixed(3)} m/s</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-300">
                      <span>Gia tốc trung bình <span className="font-mono text-pink-300 font-bold">ā</span>:</span>
                      <span className="font-mono font-bold text-pink-300">{avgAccel.toFixed(3)} m/s²</span>
                    </div>
                    <div className="flex items-center justify-between pt-1 border-t border-white/5 font-semibold">
                      <span className="text-pink-300">Kết quả đo gia tốc:</span>
                      <span className="font-mono text-pink-300 bg-[#240618] px-2 py-0.5 rounded border border-pink-500/30">
                        a = {avgAccel.toFixed(3)} ± {deltaAccel.toFixed(3)} (m/s²)
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center justify-between text-slate-300">
                      <span>Thời gian trung bình <span className="font-mono text-emerald-400 font-bold">Δt̄</span>:</span>
                      <span className="font-mono font-bold text-emerald-400">{avgTEF.toFixed(3)} s</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-300">
                      <span>Tốc độ trung bình <span className="font-mono text-amber-300 font-bold">v̄<sub>tb</sub></span>:</span>
                      <span className="font-mono font-bold text-amber-300">{avgVAvg.toFixed(3)} m/s</span>
                    </div>
                    <div className="flex items-center justify-between pt-1 border-t border-white/5 font-semibold">
                      <span className="text-cyan-300">Kết quả đo biểu diễn:</span>
                      <span className="font-mono text-[#00FFCC] bg-[#02201c] px-2 py-0.5 rounded border border-emerald-500/30">
                        v = {avgVAvg.toFixed(3)} ± {deltaVAvg.toFixed(3)} (m/s)
                      </span>
                    </div>
                  </>
                )}
              </div>
            );
          })()}
        </div>

        {/* 2. BIỂU ĐỒ VẬN TỐC THEO THỜI GIAN v(t) & ĐỘ THỊ THỰC NGHIỆM (4 COLS) */}
        <div className="lg:col-span-4 rounded-3xl border border-white/10 bg-[#081329] p-4 sm:p-5 shadow-2xl space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-[#00D4FF]" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Đồ Thị Vận Tốc v - t</h3>
              </div>
              <span className="font-mono text-xs font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded">
                v = a · t
              </span>
            </div>

            {/* Dynamic SVG Plot - Showing straight line through origin with actual experimental points */}
            <div className="mt-3 h-44 w-full rounded-2xl bg-[#040C1A] border border-white/5 p-2 flex flex-col items-center justify-center relative">
              <svg className="h-full w-full" viewBox="0 0 240 120">
                <defs>
                  <linearGradient id="vLineGrad2" x1="0%" y1="100%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#00D4FF" />
                    <stop offset="100%" stopColor="#00FFCC" />
                  </linearGradient>
                  <linearGradient id="areaFillGrad2" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#00D4FF" stopOpacity="0.22" />
                    <stop offset="100%" stopColor="#00D4FF" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Horizontal Grid lines */}
                <line x1="30" y1="25" x2="220" y2="25" stroke="#1e293b" strokeDasharray="2,2" />
                <line x1="30" y1="48" x2="220" y2="48" stroke="#1e293b" strokeDasharray="2,2" />
                <line x1="30" y1="71" x2="220" y2="71" stroke="#1e293b" strokeDasharray="2,2" />
                <line x1="30" y1="94" x2="220" y2="94" stroke="#1e293b" strokeDasharray="2,2" />
                
                {/* Coordinate Axes */}
                <line x1="30" y1="94" x2="225" y2="94" stroke="#64748b" strokeWidth="1.5" />
                <line x1="30" y1="94" x2="30" y2="15" stroke="#64748b" strokeWidth="1.5" />
                
                {/* Axis Arrows */}
                <polygon points="225,92 230,94 225,96" fill="#64748b" />
                <polygon points="28,15 30,10 32,15" fill="#64748b" />

                {/* Axis labels */}
                <text x="228" y="106" fontSize="7" fill="#94a3b8" textAnchor="end" fontWeight="bold">t (s)</text>
                <text x="8" y="16" fontSize="7" fill="#94a3b8" fontWeight="bold">v(m/s)</text>

                {/* Time Ticks */}
                <text x="30" y="105" fontSize="6" fill="#64748b" textAnchor="middle">0.0</text>
                <text x="90" y="105" fontSize="6" fill="#64748b" textAnchor="middle">0.2</text>
                <text x="150" y="105" fontSize="6" fill="#64748b" textAnchor="middle">0.4</text>
                <text x="210" y="105" fontSize="6" fill="#64748b" textAnchor="middle">0.6</text>

                {/* Velocity Ticks */}
                <text x="25" y="96" fontSize="6" fill="#64748b" textAnchor="end">0</text>
                <text x="25" y="73" fontSize="6" fill="#64748b" textAnchor="end">0.3</text>
                <text x="25" y="50" fontSize="6" fill="#64748b" textAnchor="end">0.6</text>
                <text x="25" y="27" fontSize="6" fill="#64748b" textAnchor="end">0.9</text>

                {/* Shaded Area under v-t graph */}
                <polygon
                  points="30,94 210,25 210,94"
                  fill="url(#areaFillGrad2)"
                />

                {/* Straight Line: v(t) = a*t */}
                <line
                  x1="30"
                  y1="94"
                  x2="210"
                  y2="25"
                  stroke="url(#vLineGrad2)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />

                {/* Experimental Data Points */}
                <circle cx="30" cy="94" r="2.5" fill="#64748b" />
                <circle cx="90" cy="71" r="3.5" fill="#00D4FF" stroke="#ffffff" strokeWidth="1" />
                <circle cx="150" cy="48" r="3.5" fill="#3b82f6" stroke="#ffffff" strokeWidth="1" />
                <circle cx="210" cy="25" r="3.5" fill="#ec4899" stroke="#ffffff" strokeWidth="1" />

                <text x="125" y="40" fontSize="6.5" fill="#00FFCC" fontWeight="bold" transform="rotate(-21, 125, 40)">
                  v = a · t (a &gt; 0)
                </text>
              </svg>
            </div>
          </div>

          <div className="rounded-xl border border-white/5 bg-[#061226] p-2.5 text-[11px] text-slate-300 space-y-1">
            <div className="flex items-center justify-between">
              <span>Dạng đồ thị:</span>
              <strong className="text-white">Đường thẳng qua gốc O</strong>
            </div>
            <div className="flex items-center justify-between">
              <span>Tính chất:</span>
              <strong className="text-emerald-400">Nhanh dần đều trên dốc</strong>
            </div>
          </div>
        </div>

        {/* 3. HỆ THỐNG CÔNG THỨC & NGUYÊN LÍ SGK (3 COLS) */}
        <div className="lg:col-span-3 rounded-3xl border border-white/10 bg-[#081329] p-4 sm:p-5 shadow-2xl space-y-3 flex flex-col justify-between">
          <div className="space-y-2.5">
            <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-amber-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Công Thức Cốt Lõi</h3>
              </div>
            </div>

            <div className="space-y-2 text-xs font-mono">
              {/* Formula 1: Tốc độ tức thời */}
              <div className={`rounded-xl border p-2.5 space-y-1 transition-all ${
                experimentMode === 'INSTANT_SPEED'
                  ? 'border-[#00FFCC] bg-[#022b22] shadow-[0_0_12px_rgba(0,255,204,0.2)]'
                  : 'border-cyan-500/20 bg-cyan-950/20'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="text-[10px] text-slate-300 font-sans uppercase font-bold">1. Tốc độ tức thời tại cổng:</div>
                  {experimentMode === 'INSTANT_SPEED' && (
                    <span className="text-[9px] bg-[#00FFCC] text-black font-bold px-1.5 py-0.2 rounded font-sans">ĐANG ĐO</span>
                  )}
                </div>
                <div className="text-sm font-black text-[#00FFCC] text-center">v = d / t</div>
                <div className="text-[10px] text-slate-400 font-sans text-center">v_E = d / t₁ &nbsp;|&nbsp; v_F = d / t₂</div>
              </div>

              {/* Formula 2: Tốc độ trung bình */}
              <div className={`rounded-xl border p-2.5 space-y-1 transition-all ${
                experimentMode === 'AVG_SPEED'
                  ? 'border-amber-400 bg-[#291704] shadow-[0_0_12px_rgba(251,191,36,0.2)]'
                  : 'border-amber-500/20 bg-amber-950/20'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="text-[10px] text-slate-300 font-sans uppercase font-bold">2. Tốc độ trung bình E → F:</div>
                  {experimentMode === 'AVG_SPEED' && (
                    <span className="text-[9px] bg-amber-400 text-black font-bold px-1.5 py-0.2 rounded font-sans">ĐANG ĐO</span>
                  )}
                </div>
                <div className="text-sm font-black text-amber-300 text-center">v̄ = s / Δt</div>
                <div className="text-[10px] text-slate-400 font-sans text-center">(s: khoảng cách E-F, Δt: t_EF)</div>
              </div>

              {/* Formula 3: Gia tốc */}
              <div className={`rounded-xl border p-2.5 space-y-1 transition-all ${
                experimentMode === 'ACCELERATION'
                  ? 'border-pink-500 bg-[#2b0c20] shadow-[0_0_12px_rgba(236,72,153,0.2)]'
                  : 'border-pink-500/20 bg-pink-950/20'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="text-[10px] text-slate-300 font-sans uppercase font-bold">3. Gia tốc chuyển động:</div>
                  {experimentMode === 'ACCELERATION' && (
                    <span className="text-[9px] bg-pink-500 text-white font-bold px-1.5 py-0.2 rounded font-sans">ĐANG ĐO</span>
                  )}
                </div>
                <div className="text-sm font-black text-pink-300 text-center">a = (v_F² - v_E²) / 2s</div>
                <div className="text-[10px] text-slate-400 font-sans text-center">hoặc a = (v_F - v_E) / Δt</div>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-white/5 bg-[#061226] p-2.5 text-[11px] text-slate-400 text-center font-sans">
            📖 <strong className="text-slate-200">Bài 6 SGK Vật lí 10</strong>: Thực hành đo tốc độ của vật chuyển động
          </div>
        </div>

      </div>
    </div>
  );
};
