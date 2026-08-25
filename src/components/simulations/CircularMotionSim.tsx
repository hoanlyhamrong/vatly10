import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Settings2 } from 'lucide-react';

export const CircularMotionSim: React.FC = () => {
  const [radiusM, setRadiusM] = useState<number>(2.0); // m
  const [angularOmega, setAngularOmega] = useState<number>(2.5); // rad/s
  const [massKg, setMassKg] = useState<number>(0.5); // kg
  const [showVectors, setShowVectors] = useState<boolean>(true);

  const [isRunning, setIsRunning] = useState<boolean>(true);
  const [angleTheta, setAngleTheta] = useState<number>(0);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameId = useRef<number | null>(null);

  // Derived quantities
  const linearV = angularOmega * radiusM; // v = omega * r
  const aHt = (linearV * linearV) / radiusM; // a_ht = v^2 / r = omega^2 * r
  const fHt = massKg * aHt; // F_ht = m * a_ht
  const periodT = (2 * Math.PI) / angularOmega; // T = 2pi / omega
  const freqF = 1 / periodT; // f = 1/T

  useEffect(() => {
    let lastTime = performance.now();

    const loop = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.03);
      lastTime = now;

      if (isRunning) {
        setAngleTheta((prev) => (prev + angularOmega * dt) % (2 * Math.PI));
      }

      animFrameId.current = requestAnimationFrame(loop);
    };

    animFrameId.current = requestAnimationFrame(loop);
    return () => {
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
    };
  }, [isRunning, angularOmega]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;

    ctx.fillStyle = '#090d16';
    ctx.fillRect(0, 0, w, h);

    const cx = w / 2;
    const cy = h / 2;
    const scale = 55; // pixels per meter
    const orbitRadiusPx = radiusM * scale;

    // Grid
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cx, 10);
    ctx.lineTo(cx, h - 10);
    ctx.moveTo(10, cy);
    ctx.lineTo(w - 10, cy);
    ctx.stroke();

    // Circular Orbit path
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 4]);
    ctx.beginPath();
    ctx.arc(cx, cy, orbitRadiusPx, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    // Tether String / Radius
    const px = cx + orbitRadiusPx * Math.cos(angleTheta);
    const py = cy - orbitRadiusPx * Math.sin(angleTheta);

    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(px, py);
    ctx.stroke();

    // Center Pivot
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.arc(cx, cy, 6, 0, Math.PI * 2);
    ctx.fill();

    // Particle
    ctx.save();
    ctx.beginPath();
    ctx.arc(px, py, 10, 0, Math.PI * 2);
    ctx.fillStyle = '#06b6d4';
    ctx.shadowColor = '#06b6d4';
    ctx.shadowBlur = 12;
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#ffffff';
    ctx.stroke();
    ctx.restore();

    if (showVectors) {
      // Tangential velocity vector (Emerald): perpendicular to radius
      const vScale = 12;
      const vx = -linearV * Math.sin(angleTheta) * vScale;
      const vy = -linearV * Math.cos(angleTheta) * vScale;

      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.lineTo(px + vx, py + vy);
      ctx.stroke();

      // Centripetal acceleration / Force vector (Rose): points toward center O
      const aScale = 2.5;
      const ax = -aHt * Math.cos(angleTheta) * aScale;
      const ay = aHt * Math.sin(angleTheta) * aScale;

      ctx.strokeStyle = '#f43f5e';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.lineTo(px + ax, py + ay);
      ctx.stroke();
    }
  }, [radiusM, angularOmega, angleTheta, showVectors, linearV, aHt]);

  return (
    <div id="circular-sim-container" className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl backdrop-blur-md">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-cyan-500/10 px-2 py-0.5 text-xs font-semibold text-cyan-400">
              MÔ PHỎNG CHUYỂN ĐỘNG TRÒN
            </span>
            <h3 className="text-xl font-bold text-slate-100">Động học & Lực Hướng tâm</h3>
          </div>
          <p className="mt-1 text-sm text-slate-400">
            Khảo sát liên hệ v = ω·r, gia tốc hướng tâm a_ht = v²/r = ω²·r và lực hướng tâm F_ht = m·a_ht (SGK Bài 31 & 32).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsRunning(!isRunning)}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 font-semibold text-white shadow-lg transition ${
              isRunning ? 'bg-amber-600 hover:bg-amber-500' : 'bg-cyan-600 hover:bg-cyan-500'
            }`}
          >
            {isRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            <span>{isRunning ? 'Tạm dừng' : 'Quay tròn'}</span>
          </button>
          <button
            onClick={() => setAngleTheta(0)}
            className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-slate-700"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Về gốc</span>
          </button>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="col-span-2 overflow-hidden rounded-xl border border-slate-800 bg-slate-950 p-2">
          <canvas ref={canvasRef} width={640} height={380} className="h-auto w-full rounded-lg" />
        </div>

        <div className="space-y-5 rounded-xl border border-slate-800 bg-slate-950/60 p-5">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-200">
            <Settings2 className="h-4 w-4 text-cyan-400" />
            <span>Thông số chuyển động tròn</span>
          </div>

          <div>
            <div className="flex justify-between text-xs text-slate-300">
              <span>Tốc độ góc $\omega$</span>
              <span className="font-mono font-bold text-cyan-400">{angularOmega.toFixed(1)} rad/s</span>
            </div>
            <input
              type="range"
              min={0.5}
              max={6.0}
              step={0.1}
              value={angularOmega}
              onChange={(e) => setAngularOmega(Number(e.target.value))}
              className="mt-2 w-full accent-cyan-500"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs text-slate-300">
              <span>Bán kính quỹ đạo $r$</span>
              <span className="font-mono font-bold text-cyan-400">{radiusM.toFixed(1)} m</span>
            </div>
            <input
              type="range"
              min={0.8}
              max={3.0}
              step={0.1}
              value={radiusM}
              onChange={(e) => setRadiusM(Number(e.target.value))}
              className="mt-2 w-full accent-cyan-500"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs text-slate-300">
              <span>Khối lượng vật $m$</span>
              <span className="font-mono font-bold text-cyan-400">{massKg.toFixed(2)} kg</span>
            </div>
            <input
              type="range"
              min={0.1}
              max={2.0}
              step={0.1}
              value={massKg}
              onChange={(e) => setMassKg(Number(e.target.value))}
              className="mt-2 w-full accent-cyan-500"
            />
          </div>

          <div className="space-y-2 rounded-xl border border-slate-800 bg-slate-900 p-4 text-xs">
            <div className="flex justify-between text-slate-300">
              <span>Tốc độ dài v = ω·r:</span>
              <span className="font-mono font-bold text-emerald-400">{linearV.toFixed(2)} m/s</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Gia tốc hướng tâm a_ht:</span>
              <span className="font-mono font-bold text-rose-400">{aHt.toFixed(2)} m/s²</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Lực hướng tâm F_ht = m·a_ht:</span>
              <span className="font-mono font-bold text-cyan-400">{fHt.toFixed(2)} N</span>
            </div>
            <div className="flex justify-between text-slate-300 border-t border-slate-800 pt-2">
              <span>Chu kì T: <strong className="text-slate-200">{periodT.toFixed(2)} s</strong></span>
              <span>Tần số f: <strong className="text-slate-200">{freqF.toFixed(2)} Hz</strong></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
