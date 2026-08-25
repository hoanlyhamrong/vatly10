import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Settings2 } from 'lucide-react';

export const EnergyConservationSim: React.FC = () => {
  const [lengthL, setLengthL] = useState<number>(2.0); // m
  const [mass, setMass] = useState<number>(1.0); // kg
  const [initialAngleDeg, setInitialAngleDeg] = useState<number>(45); // degrees
  const [airFriction, setAirFriction] = useState<boolean>(false);

  const [isRunning, setIsRunning] = useState<boolean>(true);
  const [currentAngleRad, setCurrentAngleRad] = useState<number>((45 * Math.PI) / 180);
  const [angularVelocity, setAngularVelocity] = useState<number>(0);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameId = useRef<number | null>(null);

  const g = 9.8;
  const initAngleRad = (initialAngleDeg * Math.PI) / 180;

  // Energy calculations
  // Height from lowest position (O): h = L * (1 - cos(theta))
  const currentHeight = lengthL * (1 - Math.cos(currentAngleRad));
  const initialHeight = lengthL * (1 - Math.cos(initAngleRad));
  const totalEnergy = mass * g * initialHeight; // J
  const potentialEnergy = mass * g * currentHeight; // J
  const kineticEnergy = Math.max(0, totalEnergy - potentialEnergy);
  const speedV = Math.sqrt(Math.max(0, 2 * g * (initialHeight - currentHeight)));

  const handleReset = () => {
    setIsRunning(false);
    setCurrentAngleRad(initAngleRad);
    setAngularVelocity(0);
  };

  useEffect(() => {
    handleReset();
  }, [lengthL, mass, initialAngleDeg]);

  // Pendulum differential equation physics loop: theta'' + (g/L)*sin(theta) + b*theta' = 0
  useEffect(() => {
    let lastTime = performance.now();

    const loop = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.03);
      lastTime = now;

      if (isRunning) {
        // Runge-Kutta / Euler integration
        const damping = airFriction ? 0.05 : 0.001;
        const alpha = -(g / lengthL) * Math.sin(currentAngleRad) - damping * angularVelocity;
        const nextOmega = angularVelocity + alpha * dt;
        const nextAngle = currentAngleRad + nextOmega * dt;

        setAngularVelocity(nextOmega);
        setCurrentAngleRad(nextAngle);
      }

      animFrameId.current = requestAnimationFrame(loop);
    };

    animFrameId.current = requestAnimationFrame(loop);
    return () => {
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
    };
  }, [isRunning, currentAngleRad, angularVelocity, lengthL, g, airFriction]);

  // Render canvas pendulum & live energy bar meters
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;

    ctx.fillStyle = '#090d16';
    ctx.fillRect(0, 0, w, h);

    const pivotX = w / 2;
    const pivotY = 50;
    const pixelLength = (lengthL / 3.0) * (h - 140);

    // Pivot mount
    ctx.fillStyle = '#475569';
    ctx.fillRect(pivotX - 30, pivotY - 8, 60, 8);
    ctx.fillStyle = '#cbd5e1';
    ctx.beginPath();
    ctx.arc(pivotX, pivotY, 6, 0, Math.PI * 2);
    ctx.fill();

    // Dotted vertical centerline
    ctx.strokeStyle = '#334155';
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(pivotX, pivotY);
    ctx.lineTo(pivotX, pivotY + pixelLength + 30);
    ctx.stroke();
    ctx.setLineDash([]);

    // Pendulum Bob Position
    const bobX = pivotX + pixelLength * Math.sin(currentAngleRad);
    const bobY = pivotY + pixelLength * Math.cos(currentAngleRad);

    // Arc path of oscillation
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.2)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(pivotX, pivotY, pixelLength, Math.PI / 2 - initAngleRad, Math.PI / 2 + initAngleRad);
    ctx.stroke();

    // String
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(pivotX, pivotY);
    ctx.lineTo(bobX, bobY);
    ctx.stroke();

    // Bob
    const bobRadius = 14 + mass * 4;
    ctx.save();
    ctx.beginPath();
    ctx.arc(bobX, bobY, bobRadius, 0, Math.PI * 2);
    ctx.fillStyle = '#06b6d4';
    ctx.shadowColor = '#06b6d4';
    ctx.shadowBlur = 15;
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#ffffff';
    ctx.stroke();
    ctx.restore();

    // Tangential Velocity vector (Emerald)
    if (Math.abs(angularVelocity) > 0.05) {
      const vVectorScale = 8;
      const vTangentialX = Math.cos(currentAngleRad) * angularVelocity * lengthL * vVectorScale;
      const vTangentialY = -Math.sin(currentAngleRad) * angularVelocity * lengthL * vVectorScale;

      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(bobX, bobY);
      ctx.lineTo(bobX + vTangentialX, bobY + vTangentialY);
      ctx.stroke();
    }
  }, [currentAngleRad, lengthL, mass, initAngleRad, angularVelocity]);

  return (
    <div id="energy-sim-container" className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl backdrop-blur-md">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-cyan-500/10 px-2 py-0.5 text-xs font-semibold text-cyan-400">
              MÔ PHỎNG BẢO TOÀN NĂNG LƯỢNG
            </span>
            <h3 className="text-xl font-bold text-slate-100">Bảo toàn Cơ năng: Động năng & Thế năng</h3>
          </div>
          <p className="mt-1 text-sm text-slate-400">
            Khảo sát sự chuyển hoá liên tục giữa Động năng Wđ = 0.5·m·v² và Thế năng Wt = m·g·h, Cơ năng W = Wđ + Wt = const (SGK Bài 25 & 26).
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
            <span>{isRunning ? 'Tạm dừng' : 'Thả con lắc'}</span>
          </button>
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-slate-700"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Đặt lại</span>
          </button>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="col-span-2 overflow-hidden rounded-xl border border-slate-800 bg-slate-950 p-2">
          <canvas ref={canvasRef} width={680} height={380} className="h-auto w-full rounded-lg" />
        </div>

        {/* Sliders & Energy Meters */}
        <div className="space-y-5 rounded-xl border border-slate-800 bg-slate-950/60 p-5">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-200">
            <Settings2 className="h-4 w-4 text-cyan-400" />
            <span>Thông số con lắc</span>
          </div>

          <div>
            <div className="flex justify-between text-xs text-slate-300">
              <span>Góc lệch ban đầu $\alpha_0$</span>
              <span className="font-mono font-bold text-cyan-400">{initialAngleDeg}°</span>
            </div>
            <input
              type="range"
              min={10}
              max={80}
              step={5}
              value={initialAngleDeg}
              onChange={(e) => setInitialAngleDeg(Number(e.target.value))}
              className="mt-2 w-full accent-cyan-500"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs text-slate-300">
              <span>Chiều dài dây treo $L$</span>
              <span className="font-mono font-bold text-cyan-400">{lengthL.toFixed(1)} m</span>
            </div>
            <input
              type="range"
              min={0.5}
              max={3.0}
              step={0.1}
              value={lengthL}
              onChange={(e) => setLengthL(Number(e.target.value))}
              className="mt-2 w-full accent-cyan-500"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs text-slate-300">
              <span>Khối lượng vật nặng $m$</span>
              <span className="font-mono font-bold text-cyan-400">{mass.toFixed(1)} kg</span>
            </div>
            <input
              type="range"
              min={0.2}
              max={3.0}
              step={0.2}
              value={mass}
              onChange={(e) => setMass(Number(e.target.value))}
              className="mt-2 w-full accent-cyan-500"
            />
          </div>

          {/* Real-time Dynamic Energy Bar Meters */}
          <div className="space-y-3 rounded-xl border border-slate-800 bg-slate-900 p-4">
            <div className="text-xs font-semibold text-slate-300">Thanh năng lượng thời gian thực</div>

            {/* Kinetic Energy W_d */}
            <div>
              <div className="flex justify-between text-xs">
                <span className="text-emerald-400 font-medium">Động năng $W_đ$</span>
                <span className="font-mono text-emerald-300">{kineticEnergy.toFixed(2)} J</span>
              </div>
              <div className="mt-1 h-3 w-full overflow-hidden rounded-full bg-slate-800">
                <div
                  className="h-full bg-emerald-500 transition-all duration-75"
                  style={{ width: `${totalEnergy > 0 ? (kineticEnergy / totalEnergy) * 100 : 0}%` }}
                />
              </div>
            </div>

            {/* Potential Energy W_t */}
            <div>
              <div className="flex justify-between text-xs">
                <span className="text-amber-400 font-medium">Thế năng $W_t$</span>
                <span className="font-mono text-amber-300">{potentialEnergy.toFixed(2)} J</span>
              </div>
              <div className="mt-1 h-3 w-full overflow-hidden rounded-full bg-slate-800">
                <div
                  className="h-full bg-amber-500 transition-all duration-75"
                  style={{ width: `${totalEnergy > 0 ? (potentialEnergy / totalEnergy) * 100 : 0}%` }}
                />
              </div>
            </div>

            {/* Total Mechanical Energy W */}
            <div className="border-t border-slate-800 pt-2">
              <div className="flex justify-between text-xs">
                <span className="text-cyan-400 font-bold">Cơ năng toàn phần $W$</span>
                <span className="font-mono font-bold text-cyan-300">{totalEnergy.toFixed(2)} J</span>
              </div>
              <div className="mt-1 flex justify-between text-[11px] text-slate-400">
                <span>Vận tốc $v$: <strong className="text-slate-200">{speedV.toFixed(2)} m/s</strong></span>
                <span>Độ cao $h$: <strong className="text-slate-200">{currentHeight.toFixed(2)} m</strong></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
