import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Activity, LineChart, FastForward, Zap, Sparkles, Gauge, Compass, Info } from 'lucide-react';
import { MathFormula } from '../MathFormula';

export const KinematicsMotionSim: React.FC = () => {
  // Motion parameters
  const [v0, setV0] = useState<number>(5); // m/s
  const [a, setA] = useState<number>(2); // m/s²
  const [x0, setX0] = useState<number>(0); // m
  const [simSpeed, setSimSpeed] = useState<number>(1.0); // time multiplier

  // Simulation controls & state
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [simTime, setSimTime] = useState<number>(0); // elapsed time in seconds
  const [selectedGraph, setSelectedGraph] = useState<'ALL' | 'X_T' | 'V_T' | 'A_T'>('ALL');
  const [showVectors, setShowVectors] = useState<boolean>(true);
  const [showStroboscopicDots, setShowStroboscopicDots] = useState<boolean>(true);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameId = useRef<number | null>(null);
  const stroboscopicPoints = useRef<Array<{ x: number; t: number; v: number }>>([]);
  const lastStrobeTime = useRef<number>(0);

  // Maximum time duration for simulation track (e.g. 10s or until out of bounds)
  const maxTime = 8.0;

  // Real-time kinematic calculations at current simTime
  const currentV = v0 + a * simTime;
  const currentX = x0 + v0 * simTime + 0.5 * a * simTime * simTime;
  const currentD = currentX - x0;

  // Calculate total distance traveled s
  let currentS = 0;
  if (a === 0) {
    currentS = Math.abs(v0 * simTime);
  } else {
    // If motion reverses direction at t_stop = -v0 / a
    const tReverse = -v0 / a;
    if (tReverse > 0 && tReverse < simTime) {
      const xReverse = x0 + v0 * tReverse + 0.5 * a * tReverse * tReverse;
      currentS = Math.abs(xReverse - x0) + Math.abs(currentX - xReverse);
    } else {
      currentS = Math.abs(currentD);
    }
  }

  // Determine motion nature
  let motionType = 'Đứng yên';
  let motionColor = 'text-gray-400';
  if (a === 0) {
    if (v0 === 0) {
      motionType = 'Đứng yên (v = 0, a = 0)';
      motionColor = 'text-gray-400';
    } else {
      motionType = 'Chuyển động thẳng đều (a = 0)';
      motionColor = 'text-[#00D4FF]';
    }
  } else {
    const dotProduct = currentV * a;
    if (Math.abs(currentV) < 0.001) {
      motionType = 'Đổi chiều chuyển động (v = 0)';
      motionColor = 'text-amber-400';
    } else if (dotProduct > 0) {
      motionType = 'Chuyển động nhanh dần đều (v.a > 0)';
      motionColor = 'text-[#00FFCC]';
    } else {
      motionType = 'Chuyển động chậm dần đều (v.a < 0)';
      motionColor = 'text-rose-400';
    }
  }

  // Reset simulation
  const handleReset = () => {
    setIsRunning(false);
    setSimTime(0);
    lastStrobeTime.current = 0;
    stroboscopicPoints.current = [{ x: x0, t: 0, v: v0 }];
  };

  // Preset scenarios
  const applyPreset = (presetV0: number, presetA: number, presetX0: number = 0) => {
    setV0(presetV0);
    setA(presetA);
    setX0(presetX0);
    setIsRunning(false);
    setSimTime(0);
    lastStrobeTime.current = 0;
    stroboscopicPoints.current = [{ x: presetX0, t: 0, v: presetV0 }];
  };

  // Reset when initial parameters change
  useEffect(() => {
    handleReset();
  }, [v0, a, x0]);

  // Main animation / physics loop
  useEffect(() => {
    let lastTime = performance.now();

    const loop = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;

      if (isRunning) {
        setSimTime((prevTime) => {
          const nextTime = prevTime + dt * simSpeed;

          // Record stroboscopic dot every 0.25 seconds
          if (nextTime - lastStrobeTime.current >= 0.25) {
            const curPos = x0 + v0 * nextTime + 0.5 * a * nextTime * nextTime;
            const curVel = v0 + a * nextTime;
            stroboscopicPoints.current.push({ x: curPos, t: nextTime, v: curVel });
            lastStrobeTime.current = nextTime;
          }

          // Stop if time exceeded max or position goes off standard track bounds (-40m to +80m)
          const curPos = x0 + v0 * nextTime + 0.5 * a * nextTime * nextTime;
          if (nextTime >= maxTime || curPos > 95 || curPos < -45) {
            setIsRunning(false);
            return Math.min(nextTime, maxTime);
          }

          return nextTime;
        });
      }

      animFrameId.current = requestAnimationFrame(loop);
    };

    animFrameId.current = requestAnimationFrame(loop);
    return () => {
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
    };
  }, [isRunning, v0, a, x0, simSpeed]);

  // Canvas rendering of track and moving object
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Background gradient
    const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
    bgGrad.addColorStop(0, '#070E1C');
    bgGrad.addColorStop(1, '#0C1528');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Track coordinate mapping: meter scale from -30m to +70m
    const minM = -30;
    const maxM = 70;
    const paddingX = 60;
    const meterToPx = (width - 2 * paddingX) / (maxM - minM);
    const toPxX = (m: number) => paddingX + (m - minM) * meterToPx;

    const trackY = height * 0.55;

    // Draw Grid & Distance Ticks on the Track
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1;
    for (let m = minM; m <= maxM; m += 5) {
      const px = toPxX(m);
      ctx.beginPath();
      ctx.moveTo(px, 20);
      ctx.lineTo(px, height - 30);
      ctx.stroke();
    }

    // Draw Main Track (Highway / Air track)
    ctx.fillStyle = '#050B18';
    ctx.fillRect(paddingX - 20, trackY - 14, width - 2 * paddingX + 40, 28);
    ctx.strokeStyle = 'rgba(0, 212, 255, 0.4)';
    ctx.lineWidth = 2;
    ctx.strokeRect(paddingX - 20, trackY - 14, width - 2 * paddingX + 40, 28);

    // Track center line (dashed)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.setLineDash([6, 6]);
    ctx.beginPath();
    ctx.moveTo(paddingX - 10, trackY);
    ctx.lineTo(width - paddingX + 10, trackY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw Meter Ticks & Labels
    ctx.fillStyle = '#94A3B8';
    ctx.font = '10px Inter, monospace';
    ctx.textAlign = 'center';

    for (let m = minM; m <= maxM; m += 10) {
      const px = toPxX(m);
      // Large tick
      ctx.strokeStyle = m === 0 ? '#00FFCC' : 'rgba(255, 255, 255, 0.5)';
      ctx.lineWidth = m === 0 ? 2 : 1;
      ctx.beginPath();
      ctx.moveTo(px, trackY + 14);
      ctx.lineTo(px, trackY + 24);
      ctx.stroke();

      ctx.fillStyle = m === 0 ? '#00FFCC' : '#94A3B8';
      ctx.fillText(`${m}m`, px, trackY + 36);
    }

    // Highlight Origin (x = 0) with a flag/marker
    const originPx = toPxX(0);
    ctx.fillStyle = '#00FFCC';
    ctx.beginPath();
    ctx.arc(originPx, trackY, 4, 0, Math.PI * 2);
    ctx.fill();

    // Draw Stroboscopic / Ticker-tape Dots
    if (showStroboscopicDots && stroboscopicPoints.current.length > 0) {
      stroboscopicPoints.current.forEach((pt, i) => {
        const dotPx = toPxX(pt.x);
        ctx.fillStyle = 'rgba(0, 212, 255, 0.5)';
        ctx.beginPath();
        ctx.arc(dotPx, trackY, 3, 0, Math.PI * 2);
        ctx.fill();

        // Label initial and certain milestone dots
        if (i === 0 || i % 4 === 0) {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
          ctx.font = '8px monospace';
          ctx.fillText(`${pt.t.toFixed(1)}s`, dotPx, trackY - 20);
        }
      });
    }

    // Calculate current object X pixel
    const objectPx = toPxX(currentX);

    // Draw Moving Vehicle / Object Cart
    const carWidth = 44;
    const carHeight = 22;
    const carX = objectPx - carWidth / 2;
    const carY = trackY - carHeight - 2;

    // Vehicle Body Glow
    ctx.shadowColor = '#00D4FF';
    ctx.shadowBlur = 12;
    const carGrad = ctx.createLinearGradient(carX, carY, carX + carWidth, carY + carHeight);
    carGrad.addColorStop(0, '#00D4FF');
    carGrad.addColorStop(1, '#0088CC');
    ctx.fillStyle = carGrad;
    ctx.beginPath();
    ctx.roundRect(carX, carY, carWidth, carHeight, 6);
    ctx.fill();
    ctx.shadowBlur = 0; // reset shadow

    // Vehicle Window & Detail
    ctx.fillStyle = '#050B18';
    ctx.beginPath();
    ctx.roundRect(carX + 10, carY + 3, carWidth - 20, carHeight - 12, 3);
    ctx.fill();

    // Wheels
    ctx.fillStyle = '#1E293B';
    ctx.strokeStyle = '#00FFCC';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(carX + 10, carY + carHeight + 2, 5, 0, Math.PI * 2);
    ctx.arc(carX + carWidth - 10, carY + carHeight + 2, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Center point marker on cart
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(objectPx, trackY - carHeight / 2 - 2, 3, 0, Math.PI * 2);
    ctx.fill();

    // Vectors Visualizer (Velocity & Acceleration)
    if (showVectors) {
      // 1. Velocity Vector (Cyan)
      const vMagnitude = currentV;
      if (Math.abs(vMagnitude) > 0.05) {
        const vLen = Math.max(-100, Math.min(100, vMagnitude * 4)); // pixel length
        const arrowY = carY - 14;
        ctx.strokeStyle = '#00FFCC';
        ctx.fillStyle = '#00FFCC';
        ctx.lineWidth = 2.5;

        // Line
        ctx.beginPath();
        ctx.moveTo(objectPx, arrowY);
        ctx.lineTo(objectPx + vLen, arrowY);
        ctx.stroke();

        // Arrowhead
        const arrowDir = vLen >= 0 ? 1 : -1;
        ctx.beginPath();
        ctx.moveTo(objectPx + vLen, arrowY);
        ctx.lineTo(objectPx + vLen - arrowDir * 8, arrowY - 4);
        ctx.lineTo(objectPx + vLen - arrowDir * 8, arrowY + 4);
        ctx.closePath();
        ctx.fill();

        // Label
        ctx.font = 'bold 10px monospace';
        ctx.fillText(`v = ${currentV.toFixed(1)} m/s`, objectPx + vLen / 2, arrowY - 7);
      }

      // 2. Acceleration Vector (Amber/Orange)
      if (Math.abs(a) > 0.05) {
        const aLen = Math.max(-80, Math.min(80, a * 6));
        const arrowY = carY - 32;
        ctx.strokeStyle = '#F59E0B';
        ctx.fillStyle = '#F59E0B';
        ctx.lineWidth = 2.5;

        // Line
        ctx.beginPath();
        ctx.moveTo(objectPx, arrowY);
        ctx.lineTo(objectPx + aLen, arrowY);
        ctx.stroke();

        // Arrowhead
        const arrowDir = aLen >= 0 ? 1 : -1;
        ctx.beginPath();
        ctx.moveTo(objectPx + aLen, arrowY);
        ctx.lineTo(objectPx + aLen - arrowDir * 8, arrowY - 4);
        ctx.lineTo(objectPx + aLen - arrowDir * 8, arrowY + 4);
        ctx.closePath();
        ctx.fill();

        // Label
        ctx.font = 'bold 10px monospace';
        ctx.fillText(`a = ${a.toFixed(1)} m/s²`, objectPx + aLen / 2, arrowY - 7);
      }
    }

    // Top Header on Canvas: Coordinate readout
    ctx.fillStyle = 'rgba(12, 21, 40, 0.8)';
    ctx.fillRect(10, 10, 220, 28);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.strokeRect(10, 10, 220, 28);
    ctx.fillStyle = '#00D4FF';
    ctx.font = 'bold 11px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`x(t) = ${currentX.toFixed(2)} m  |  t = ${simTime.toFixed(2)} s`, 20, 28);

  }, [currentX, currentV, a, x0, simTime, showVectors, showStroboscopicDots]);

  // Graph Rendering Helper Functions
  const renderGraphs = () => {
    const timeSteps: number[] = [];
    for (let t = 0; t <= maxTime; t += 0.1) {
      timeSteps.push(t);
    }

    const xPoints = timeSteps.map((t) => ({ t, val: x0 + v0 * t + 0.5 * a * t * t }));
    const vPoints = timeSteps.map((t) => ({ t, val: v0 + a * t }));
    const aPoints = timeSteps.map((t) => ({ t, val: a }));

    const graphWidth = 320;
    const graphHeight = 160;
    const pad = 35;

    // Helper to draw a single SVG graph
    const drawSvgGraph = (
      title: string,
      data: Array<{ t: number; val: number }>,
      curVal: number,
      unit: string,
      color: string,
      formulaStr: string,
      idPrefix: string
    ) => {
      const minVal = Math.min(0, ...data.map((d) => d.val));
      const maxVal = Math.max(5, ...data.map((d) => d.val));
      const valRange = Math.max(1, maxVal - minVal);

      const toSvgX = (t: number) => pad + (t / maxTime) * (graphWidth - 2 * pad);
      const toSvgY = (val: number) => graphHeight - pad - ((val - minVal) / valRange) * (graphHeight - 2 * pad);

      const zeroY = toSvgY(0);
      const curSvgX = toSvgX(simTime);
      const curSvgY = toSvgY(curVal);

      // Path string
      const pathD = data.reduce((acc, pt, i) => {
        const cmd = i === 0 ? 'M' : 'L';
        return `${acc} ${cmd} ${toSvgX(pt.t).toFixed(1)} ${toSvgY(pt.val).toFixed(1)}`;
      }, '');

      return (
        <div className="flex flex-col rounded-xl border border-white/10 bg-[#070E1C] p-3 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
              <span className="text-xs font-bold text-white">{title}</span>
            </div>
            <span className="font-mono text-xs font-bold" style={{ color }}>
              {curVal.toFixed(2)} {unit}
            </span>
          </div>

          <div className="text-[10px] font-mono text-gray-400">{formulaStr}</div>

          <div className="relative overflow-hidden rounded-lg bg-[#0C1528] border border-white/5">
            <svg viewBox={`0 0 ${graphWidth} ${graphHeight}`} className="w-full h-auto">
              {/* Grid Lines */}
              <line x1={pad} y1={graphHeight - pad} x2={graphWidth - pad} y2={graphHeight - pad} stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
              <line x1={pad} y1={pad} x2={pad} y2={graphHeight - pad} stroke="rgba(255,255,255,0.2)" strokeWidth="1" />

              {/* Zero horizontal axis if visible */}
              {minVal < 0 && maxVal > 0 && (
                <line x1={pad} y1={zeroY} x2={graphWidth - pad} y2={zeroY} stroke="rgba(255,255,255,0.3)" strokeDasharray="3 3" strokeWidth="1" />
              )}

              {/* Axis Labels */}
              <text x={graphWidth - pad + 5} y={graphHeight - pad + 4} fill="#94A3B8" fontSize="9" textAnchor="start">t(s)</text>
              <text x={pad} y={pad - 6} fill="#94A3B8" fontSize="9" textAnchor="middle">{unit}</text>

              {/* Max & Min labels */}
              <text x={pad - 4} y={toSvgY(maxVal) + 3} fill="#64748B" fontSize="8" textAnchor="end">{maxVal.toFixed(0)}</text>
              <text x={pad - 4} y={toSvgY(minVal) + 3} fill="#64748B" fontSize="8" textAnchor="end">{minVal.toFixed(0)}</text>

              {/* Data Curve */}
              <path d={pathD} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" />

              {/* Current Time Cursor Line */}
              <line x1={curSvgX} y1={pad} x2={curSvgX} y2={graphHeight - pad} stroke="#FFFFFF" strokeDasharray="2 2" strokeWidth="1.5" />

              {/* Current Data Point Marker */}
              <circle cx={curSvgX} cy={curSvgY} r="4.5" fill={color} stroke="#FFFFFF" strokeWidth="1.5" />
            </svg>
          </div>
        </div>
      );
    };

    return (
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {(selectedGraph === 'ALL' || selectedGraph === 'X_T') &&
          drawSvgGraph(
            'Đồ thị Tọa độ x - t (Parabol)',
            xPoints,
            currentX,
            'm',
            '#00D4FF',
            `x = ${x0} + (${v0})t + 0.5(${a})t²`,
            'xt'
          )}
        {(selectedGraph === 'ALL' || selectedGraph === 'V_T') &&
          drawSvgGraph(
            'Đồ thị Vận tốc v - t (Bậc 1)',
            vPoints,
            currentV,
            'm/s',
            '#00FFCC',
            `v = ${v0} + (${a})t`,
            'vt'
          )}
        {(selectedGraph === 'ALL' || selectedGraph === 'A_T') &&
          drawSvgGraph(
            'Đồ thị Gia tốc a - t (Hằng số)',
            aPoints,
            a,
            'm/s²',
            '#F59E0B',
            `a = ${a} m/s² (Không đổi)`,
            'at'
          )}
      </div>
    );
  };

  return (
    <div id="kinematics-motion-sim" className="space-y-6 rounded-2xl border border-white/10 bg-[#0C1528]/90 p-6 shadow-2xl backdrop-blur-md">
      {/* Header & Title */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-[#00D4FF]/15 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-[#00D4FF] border border-[#00D4FF]/30">
              MÔ PHỎNG TƯƠNG TÁC ĐỘNG HỌC 1D
            </span>
            <span className="rounded-md bg-[#00FFCC]/15 px-2.5 py-1 text-xs font-bold text-[#00FFCC] border border-[#00FFCC]/30">
              60 FPS Physics Engine
            </span>
          </div>
          <h2 className="mt-1.5 text-xl font-bold text-white sm:text-2xl">
            Chuyển động thẳng biến đổi đều (Kinematics Motion Lab)
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Khám phá quy luật chuyển động thẳng biến đổi đều qua việc điều chỉnh vận tốc ban đầu $v_0$, gia tốc $a$ và quan sát trực quan đồ thị $x(t), v(t), a(t)$.
          </p>
        </div>

        {/* Playback Controls */}
        <div className="flex items-center gap-2">
          <button
            id="sim-play-pause-btn"
            onClick={() => setIsRunning(!isRunning)}
            className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold transition-all shadow-lg cursor-pointer ${
              isRunning
                ? 'bg-amber-500 hover:bg-amber-400 text-black shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                : 'bg-[#00D4FF] hover:bg-[#00B8E0] text-black shadow-[0_0_20px_rgba(0,212,255,0.3)]'
            }`}
          >
            {isRunning ? <Pause className="h-4 w-4 fill-black" /> : <Play className="h-4 w-4 fill-black" />}
            <span>{isRunning ? 'TẠM DỪNG' : 'CHẠY MÔ PHỎNG'}</span>
          </button>

          <button
            id="sim-reset-btn"
            onClick={handleReset}
            className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-[#070E1C] px-3.5 py-2.5 text-xs font-semibold text-gray-300 hover:bg-white/5 hover:text-white transition cursor-pointer"
            title="Khởi tạo lại"
          >
            <RotateCcw className="h-4 w-4" />
            <span className="hidden sm:inline">Đặt lại</span>
          </button>
        </div>
      </div>

      {/* Preset Quick Scenarios */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-bold text-gray-400 flex items-center gap-1">
          <Sparkles className="h-3.5 w-3.5 text-[#00D4FF]" />
          <span>Kịch bản mẫu:</span>
        </span>
        {[
          { label: '1. Nhanh dần đều (v0=0, a=+2.5)', v0: 0, a: 2.5, x0: 0 },
          { label: '2. Hãm phanh dừng lại (v0=12, a=-3.0)', v0: 12, a: -3.0, x0: -10 },
          { label: '3. Chuyển động thẳng đều (v0=8, a=0)', v0: 8, a: 0, x0: -20 },
          { label: '4. Đổi chiều chuyển động (v0=-6, a=+2.0)', v0: -6, a: 2.0, x0: 10 },
        ].map((p, idx) => (
          <button
            key={idx}
            onClick={() => applyPreset(p.v0, p.a, p.x0)}
            className="rounded-lg border border-white/10 bg-[#070E1C] px-3 py-1 text-xs text-gray-300 hover:border-[#00D4FF]/40 hover:text-[#00D4FF] transition cursor-pointer"
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Interactive Sliders & Parameter Configuration */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 rounded-xl border border-white/10 bg-[#070E1C] p-4">
        {/* Slider 1: v0 */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-gray-300">Vận tốc đầu $v_0$:</span>
            <span className="font-mono font-bold text-[#00FFCC]">{v0} m/s</span>
          </div>
          <input
            type="range"
            min="-15"
            max="25"
            step="1"
            value={v0}
            onChange={(e) => setV0(Number(e.target.value))}
            className="w-full accent-[#00FFCC] cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-gray-500 font-mono">
            <span>-15 m/s (Lùi)</span>
            <span>0 m/s</span>
            <span>+25 m/s (Tiến)</span>
          </div>
        </div>

        {/* Slider 2: a */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-gray-300">Gia tốc $a$:</span>
            <span className="font-mono font-bold text-[#F59E0B]">{a} m/s²</span>
          </div>
          <input
            type="range"
            min="-6"
            max="6"
            step="0.5"
            value={a}
            onChange={(e) => setA(Number(e.target.value))}
            className="w-full accent-[#F59E0B] cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-gray-500 font-mono">
            <span>-6.0 m/s²</span>
            <span>0 (Đều)</span>
            <span>+6.0 m/s²</span>
          </div>
        </div>

        {/* Slider 3: x0 */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-gray-300">Tọa độ ban đầu $x_0$:</span>
            <span className="font-mono font-bold text-[#00D4FF]">{x0} m</span>
          </div>
          <input
            type="range"
            min="-25"
            max="25"
            step="5"
            value={x0}
            onChange={(e) => setX0(Number(e.target.value))}
            className="w-full accent-[#00D4FF] cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-gray-500 font-mono">
            <span>-25 m</span>
            <span>0 m (Gốc O)</span>
            <span>+25 m</span>
          </div>
        </div>

        {/* Slider 4: Simulation Speed & Display Toggles */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-gray-300">Tốc độ chạy & Hiển thị:</span>
            <span className="font-mono font-bold text-gray-200">{simSpeed}x</span>
          </div>
          <div className="flex items-center gap-1.5">
            {[0.5, 1.0, 2.0].map((spd) => (
              <button
                key={spd}
                onClick={() => setSimSpeed(spd)}
                className={`flex-1 rounded py-1 text-[11px] font-mono font-bold transition ${
                  simSpeed === spd ? 'bg-[#00D4FF] text-black' : 'bg-white/5 text-gray-400 hover:bg-white/10'
                }`}
              >
                {spd}x
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3 pt-1 text-[11px]">
            <label className="flex items-center gap-1 text-gray-400 cursor-pointer">
              <input
                type="checkbox"
                checked={showVectors}
                onChange={(e) => setShowVectors(e.target.checked)}
                className="rounded accent-[#00D4FF]"
              />
              <span>Vector v⃗, a⃗</span>
            </label>
            <label className="flex items-center gap-1 text-gray-400 cursor-pointer">
              <input
                type="checkbox"
                checked={showStroboscopicDots}
                onChange={(e) => setShowStroboscopicDots(e.target.checked)}
                className="rounded accent-[#00FFCC]"
              />
              <span>Vết chấm vị trí</span>
            </label>
          </div>
        </div>
      </div>

      {/* Main Interactive Canvas Display */}
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#050B18] shadow-inner">
        <canvas
          ref={canvasRef}
          width={880}
          height={200}
          className="w-full h-auto block"
        />
      </div>

      {/* Real-Time Numerical Readouts Grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <div className="rounded-xl border border-white/10 bg-[#070E1C] p-3 text-center">
          <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Thời gian ($t$)</div>
          <div className="mt-1 font-mono text-xl font-extrabold text-white">
            {simTime.toFixed(2)} <span className="text-xs font-normal text-gray-400">s</span>
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-[#070E1C] p-3 text-center">
          <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Tọa độ ($x$)</div>
          <div className="mt-1 font-mono text-xl font-extrabold text-[#00D4FF]">
            {currentX.toFixed(2)} <span className="text-xs font-normal text-gray-400">m</span>
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-[#070E1C] p-3 text-center">
          <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Độ dịch chuyển ($d$)</div>
          <div className="mt-1 font-mono text-xl font-extrabold text-[#00FFCC]">
            {currentD.toFixed(2)} <span className="text-xs font-normal text-gray-400">m</span>
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-[#070E1C] p-3 text-center">
          <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Vận tốc tức thời ($v$)</div>
          <div className="mt-1 font-mono text-xl font-extrabold text-[#00FFCC]">
            {currentV.toFixed(2)} <span className="text-xs font-normal text-gray-400">m/s</span>
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-[#070E1C] p-3 text-center">
          <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Gia tốc ($a$)</div>
          <div className="mt-1 font-mono text-xl font-extrabold text-[#F59E0B]">
            {a.toFixed(2)} <span className="text-xs font-normal text-gray-400">m/s²</span>
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-[#070E1C] p-3 text-center">
          <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Quãng đường ($s$)</div>
          <div className="mt-1 font-mono text-xl font-extrabold text-purple-400">
            {currentS.toFixed(2)} <span className="text-xs font-normal text-gray-400">m</span>
          </div>
        </div>
      </div>

      {/* Physics State & Mathematical Equation Live Card */}
      <div className="flex flex-col gap-4 rounded-xl border border-white/10 bg-[#070E1C] p-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-1">
          <div className="text-xs font-bold uppercase text-gray-400">Trạng thái tính chất chuyển động:</div>
          <div className={`text-sm font-bold ${motionColor} flex items-center gap-2`}>
            <Activity className="h-4 w-4" />
            <span>{motionType}</span>
          </div>
        </div>

        <div className="space-y-1 font-mono text-xs text-gray-300">
          <div className="text-[10px] font-bold uppercase text-gray-400 font-sans">Phương trình tọa độ hiện thời:</div>
          <div className="text-[#00D4FF] font-bold">
            $x(t) = {x0} + ({v0})t + {0.5 * a}t^2$
          </div>
        </div>

        <div className="space-y-1 font-mono text-xs text-gray-300">
          <div className="text-[10px] font-bold uppercase text-gray-400 font-sans">Công thức độc lập thời gian ($v^2 - v_0^2 = 2ad$):</div>
          <div className="text-[#00FFCC] font-bold">
            ${currentV.toFixed(1)}^2 - ({v0})^2 = 2 \times ({a}) \times ({currentD.toFixed(1)}) = {(2 * a * currentD).toFixed(1)}$
          </div>
        </div>
      </div>

      {/* Real-Time Dynamic Graphs */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between border-b border-white/10 pb-2">
          <div className="flex items-center gap-2">
            <LineChart className="h-4 w-4 text-[#00D4FF]" />
            <h3 className="text-sm font-bold text-white">
              Đồ thị động học thời gian thực (Real-time Kinematics Graphs)
            </h3>
          </div>

          {/* Graph Tab Selectors */}
          <div className="flex items-center gap-1 rounded-lg bg-[#070E1C] p-1 border border-white/10">
            {[
              { id: 'ALL', label: 'Tất cả 3 đồ thị' },
              { id: 'X_T', label: 'x - t' },
              { id: 'V_T', label: 'v - t' },
              { id: 'A_T', label: 'a - t' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedGraph(tab.id as any)}
                className={`rounded px-2.5 py-1 text-[11px] font-bold transition ${
                  selectedGraph === tab.id
                    ? 'bg-[#00D4FF] text-black shadow'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {renderGraphs()}
      </div>
    </div>
  );
};
