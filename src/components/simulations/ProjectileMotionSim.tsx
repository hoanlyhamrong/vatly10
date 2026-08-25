import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Eye, Settings2 } from 'lucide-react';
import { MathFormula } from '../MathFormula';

export const ProjectileMotionSim: React.FC = () => {
  const [v0, setV0] = useState<number>(20); // m/s
  const [angle, setAngle] = useState<number>(45); // degrees
  const [height, setHeight] = useState<number>(10); // m
  const [g, setG] = useState<number>(9.8); // m/s2
  const [airResistance, setAirResistance] = useState<boolean>(false);
  const [showVectors, setShowVectors] = useState<boolean>(true);
  const [showTrajectory, setShowTrajectory] = useState<boolean>(true);

  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [simTime, setSimTime] = useState<number>(0);
  const [currentPos, setCurrentPos] = useState<{ x: number; y: number; vx: number; vy: number }>({
    x: 0,
    y: 10,
    vx: 20 * Math.cos((45 * Math.PI) / 180),
    vy: 20 * Math.sin((45 * Math.PI) / 180),
  });

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameId = useRef<number | null>(null);
  const trajectoryPoints = useRef<Array<{ x: number; y: number }>>([]);

  const rad = (angle * Math.PI) / 180;
  const vx0 = v0 * Math.cos(rad);
  const vy0 = v0 * Math.sin(rad);

  // Theoretical calculations
  // Time to max height: t_up = vy0 / g
  const tUp = vy0 > 0 ? vy0 / g : 0;
  // Max height above ground: H_max = height + vy0^2 / (2g)
  const hMax = vy0 > 0 ? height + (vy0 * vy0) / (2 * g) : height;
  // Total flight time: solve y(t) = height + vy0*t - 0.5*g*t^2 = 0
  const discriminant = vy0 * vy0 + 2 * g * height;
  const tFlight = (vy0 + Math.sqrt(Math.max(0, discriminant))) / g;
  const rangeL = vx0 * tFlight;

  // Reset simulation
  const handleReset = () => {
    setIsRunning(false);
    setSimTime(0);
    trajectoryPoints.current = [{ x: 0, y: height }];
    setCurrentPos({ x: 0, y: height, vx: vx0, vy: vy0 });
  };

  useEffect(() => {
    handleReset();
  }, [v0, angle, height, g]);

  // Simulation Loop
  useEffect(() => {
    let lastTimestamp = performance.now();

    const updatePhysics = (now: number) => {
      const dt = Math.min((now - lastTimestamp) / 1000, 0.05); // cap delta
      lastTimestamp = now;

      if (isRunning) {
        setSimTime((prevTime) => {
          const newTime = prevTime + dt * 1.2; // 1.2x time scale

          let x = 0;
          let y = 0;
          let vx = vx0;
          let vy = vy0 - g * newTime;

          if (airResistance) {
            // Simplified drag model
            const k = 0.04;
            vx = vx0 * Math.exp(-k * newTime);
            x = (vx0 / k) * (1 - Math.exp(-k * newTime));
            y = height + ((vy0 + g / k) / k) * (1 - Math.exp(-k * newTime)) - (g / k) * newTime;
            vy = (vy0 + g / k) * Math.exp(-k * newTime) - g / k;
          } else {
            x = vx0 * newTime;
            y = height + vy0 * newTime - 0.5 * g * newTime * newTime;
          }

          if (y <= 0) {
            y = 0;
            setIsRunning(false);
            setCurrentPos({ x, y: 0, vx, vy });
            trajectoryPoints.current.push({ x, y: 0 });
            return tFlight;
          }

          setCurrentPos({ x, y, vx, vy });
          trajectoryPoints.current.push({ x, y });
          return newTime;
        });
      }

      animFrameId.current = requestAnimationFrame(updatePhysics);
    };

    animFrameId.current = requestAnimationFrame(updatePhysics);
    return () => {
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
    };
  }, [isRunning, vx0, vy0, height, g, airResistance, tFlight]);

  // Draw Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const heightPx = canvas.height;

    // Viewport scaling: map physics coordinates to canvas pixels
    const maxViewX = Math.max(60, rangeL * 1.2);
    const maxViewY = Math.max(30, hMax * 1.3);
    const scaleX = (width - 80) / maxViewX;
    const scaleY = (heightPx - 80) / maxViewY;
    const originX = 50;
    const originY = heightPx - 40;

    const toCanvasX = (x: number) => originX + x * scaleX;
    const toCanvasY = (y: number) => originY - y * scaleY;

    // Clear background
    ctx.fillStyle = '#090d16';
    ctx.fillRect(0, 0, width, heightPx);

    // Draw Grid Lines
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    for (let x = 0; x <= maxViewX; x += 10) {
      const cx = toCanvasX(x);
      ctx.beginPath();
      ctx.moveTo(cx, 0);
      ctx.lineTo(cx, originY);
      ctx.stroke();

      ctx.fillStyle = '#64748b';
      ctx.font = '10px JetBrains Mono';
      ctx.fillText(`${x}m`, cx - 8, originY + 16);
    }

    for (let y = 0; y <= maxViewY; y += 10) {
      const cy = toCanvasY(y);
      ctx.beginPath();
      ctx.moveTo(originX, cy);
      ctx.lineTo(width, cy);
      ctx.stroke();

      ctx.fillStyle = '#64748b';
      ctx.font = '10px JetBrains Mono';
      ctx.fillText(`${y}m`, originX - 35, cy + 3);
    }

    // Axes
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    // X axis (Ground)
    ctx.beginPath();
    ctx.moveTo(originX, originY);
    ctx.lineTo(width - 10, originY);
    ctx.stroke();

    // Y axis (Height)
    ctx.beginPath();
    ctx.moveTo(originX, originY);
    ctx.lineTo(originX, 10);
    ctx.stroke();

    // Initial Cliff / Height Platform
    if (height > 0) {
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(originX - 30, toCanvasY(height), 30, height * scaleY);
      ctx.strokeStyle = '#0ea5e9';
      ctx.strokeRect(originX - 30, toCanvasY(height), 30, height * scaleY);
    }

    // Trajectory Path
    if (showTrajectory && trajectoryPoints.current.length > 1) {
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2.5;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(toCanvasX(trajectoryPoints.current[0].x), toCanvasY(trajectoryPoints.current[0].y));
      for (let i = 1; i < trajectoryPoints.current.length; i++) {
        ctx.lineTo(toCanvasX(trajectoryPoints.current[i].x), toCanvasY(trajectoryPoints.current[i].y));
      }
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Projectile Ball
    const ballX = toCanvasX(currentPos.x);
    const ballY = toCanvasY(currentPos.y);

    ctx.save();
    ctx.beginPath();
    ctx.arc(ballX, ballY, 8, 0, Math.PI * 2);
    ctx.fillStyle = '#06b6d4';
    ctx.shadowColor = '#06b6d4';
    ctx.shadowBlur = 12;
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#ffffff';
    ctx.stroke();
    ctx.restore();

    // Vectors (vx, vy, v)
    if (showVectors && (isRunning || simTime > 0)) {
      const vScale = 1.5; // vector visual length scale

      // vx vector (Cyan)
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(ballX, ballY);
      ctx.lineTo(ballX + currentPos.vx * vScale, ballY);
      ctx.stroke();

      // vy vector (Amber)
      ctx.strokeStyle = '#f59e0b';
      ctx.beginPath();
      ctx.moveTo(ballX, ballY);
      ctx.lineTo(ballX, ballY - currentPos.vy * vScale);
      ctx.stroke();

      // Resultant v vector (Emerald)
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(ballX, ballY);
      ctx.lineTo(ballX + currentPos.vx * vScale, ballY - currentPos.vy * vScale);
      ctx.stroke();
    }
  }, [currentPos, height, rangeL, hMax, showTrajectory, showVectors, isRunning, simTime]);

  return (
    <div id="projectile-sim-container" className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl backdrop-blur-md">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-cyan-500/10 px-2 py-0.5 text-xs font-semibold text-cyan-400">
              MÔ PHỎNG ĐỘNG HỌC
            </span>
            <h3 className="text-xl font-bold text-slate-100">Chuyển động Ném Ngang & Ném Xiên</h3>
          </div>
          <p className="mt-1 text-sm text-slate-400">
            Khảo sát quỹ đạo Parabol, tính độc lập chuyển động theo hai trục Ox và Oy theo SGK Bài 12.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            id="projectile-play-btn"
            onClick={() => setIsRunning(!isRunning)}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 font-semibold text-white shadow-lg transition ${
              isRunning ? 'bg-amber-600 hover:bg-amber-500' : 'bg-cyan-600 hover:bg-cyan-500'
            }`}
          >
            {isRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            <span>{isRunning ? 'Tạm dừng' : 'Bắn / Tiếp tục'}</span>
          </button>
          <button
            id="projectile-reset-btn"
            onClick={handleReset}
            className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-slate-700"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Đặt lại</span>
          </button>
        </div>
      </div>

      {/* Main Simulation Viewport + Interactive Controls */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Canvas Stage */}
        <div className="relative col-span-2 overflow-hidden rounded-xl border border-slate-800 bg-slate-950 p-2">
          <canvas
            ref={canvasRef}
            width={720}
            height={420}
            className="h-auto w-full rounded-lg"
          />

          {/* Overlay Live Metrics */}
          <div className="absolute top-4 right-4 flex flex-col gap-1.5 rounded-xl border border-slate-800/80 bg-slate-900/90 p-3 text-xs backdrop-blur-md">
            <div className="font-mono text-slate-300">
              <span className="text-slate-400">Thời gian $t$:</span>{' '}
              <strong className="text-cyan-400">{simTime.toFixed(2)}s</strong> / {tFlight.toFixed(2)}s
            </div>
            <div className="font-mono text-slate-300">
              <span className="text-slate-400">Tọa độ $x$:</span>{' '}
              <strong className="text-slate-100">{currentPos.x.toFixed(2)} m</strong>
            </div>
            <div className="font-mono text-slate-300">
              <span className="text-slate-400">Độ cao $y$:</span>{' '}
              <strong className="text-emerald-400">{currentPos.y.toFixed(2)} m</strong>
            </div>
            <div className="font-mono text-slate-300">
              <span className="text-slate-400">Vận tốc $v$:</span>{' '}
              <strong className="text-amber-400">
                {Math.sqrt(currentPos.vx ** 2 + currentPos.vy ** 2).toFixed(2)} m/s
              </strong>
            </div>
          </div>
        </div>

        {/* Sliders & Parameters */}
        <div className="space-y-5 rounded-xl border border-slate-800 bg-slate-950/60 p-5">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-200">
            <Settings2 className="h-4 w-4 text-cyan-400" />
            <span>Thông số vật lí điều khiển</span>
          </div>

          {/* V0 Slider */}
          <div>
            <div className="flex justify-between text-xs text-slate-300">
              <span>Vận tốc ban đầu $v_0$</span>
              <span className="font-mono font-bold text-cyan-400">{v0} m/s</span>
            </div>
            <input
              id="slider-v0"
              type="range"
              min={5}
              max={50}
              step={1}
              value={v0}
              onChange={(e) => setV0(Number(e.target.value))}
              className="mt-2 w-full accent-cyan-500"
            />
          </div>

          {/* Angle Slider */}
          <div>
            <div className="flex justify-between text-xs text-slate-300">
              <span>Góc ném $\alpha$ (0° = Ném ngang)</span>
              <span className="font-mono font-bold text-cyan-400">{angle}°</span>
            </div>
            <input
              id="slider-angle"
              type="range"
              min={0}
              max={90}
              step={1}
              value={angle}
              onChange={(e) => setAngle(Number(e.target.value))}
              className="mt-2 w-full accent-cyan-500"
            />
          </div>

          {/* Initial Height Slider */}
          <div>
            <div className="flex justify-between text-xs text-slate-300">
              <span>Độ cao ném $H_0$</span>
              <span className="font-mono font-bold text-cyan-400">{height} m</span>
            </div>
            <input
              id="slider-height"
              type="range"
              min={0}
              max={40}
              step={1}
              value={height}
              onChange={(e) => setHeight(Number(e.target.value))}
              className="mt-2 w-full accent-cyan-500"
            />
          </div>

          {/* Gravity g */}
          <div>
            <div className="flex justify-between text-xs text-slate-300">
              <span>Gia tốc trọng trường $g$</span>
              <span className="font-mono font-bold text-cyan-400">{g} m/s²</span>
            </div>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {[
                { label: 'Trái Đất (9.8)', val: 9.8 },
                { label: 'Mặt Trăng (1.6)', val: 1.62 },
                { label: 'Sao Hỏa (3.7)', val: 3.71 },
              ].map((item) => (
                <button
                  key={item.label}
                  onClick={() => setG(item.val)}
                  className={`rounded-lg py-1.5 text-xs font-medium transition ${
                    g === item.val
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Toggles */}
          <div className="space-y-2.5 border-t border-slate-800 pt-3">
            <label className="flex items-center justify-between text-xs text-slate-300 cursor-pointer">
              <span>Hiển thị Vectơ vận tốc (vx, vy, v)</span>
              <input
                type="checkbox"
                checked={showVectors}
                onChange={(e) => setShowVectors(e.target.checked)}
                className="rounded accent-cyan-500"
              />
            </label>
            <label className="flex items-center justify-between text-xs text-slate-300 cursor-pointer">
              <span>Hiển thị Quỹ đạo Parabol</span>
              <input
                type="checkbox"
                checked={showTrajectory}
                onChange={(e) => setShowTrajectory(e.target.checked)}
                className="rounded accent-cyan-500"
              />
            </label>
            <label className="flex items-center justify-between text-xs text-slate-300 cursor-pointer">
              <span>Lực cản không khí (mô hình khí động)</span>
              <input
                type="checkbox"
                checked={airResistance}
                onChange={(e) => setAirResistance(e.target.checked)}
                className="rounded accent-cyan-500"
              />
            </label>
          </div>
        </div>
      </div>

      {/* Theoretical Results Box */}
      <div className="mt-6 grid grid-cols-2 gap-4 rounded-xl border border-slate-800 bg-slate-950/40 p-4 sm:grid-cols-4">
        <div className="rounded-lg bg-slate-900/60 p-3">
          <span className="text-xs text-slate-400">Tầm xa L_max</span>
          <p className="mt-1 font-mono text-lg font-bold text-cyan-400">{rangeL.toFixed(2)} m</p>
          <span className="text-[11px] text-slate-500">L = v0·cos α·t</span>
        </div>

        <div className="rounded-lg bg-slate-900/60 p-3">
          <span className="text-xs text-slate-400">Tầm cao cực đại H_max</span>
          <p className="mt-1 font-mono text-lg font-bold text-emerald-400">{hMax.toFixed(2)} m</p>
          <span className="text-[11px] text-slate-500">H = H0 + (v0·sin α)²/(2g)</span>
        </div>

        <div className="rounded-lg bg-slate-900/60 p-3">
          <span className="text-xs text-slate-400">Thời gian bay t_flight</span>
          <p className="mt-1 font-mono text-lg font-bold text-amber-400">{tFlight.toFixed(2)} s</p>
          <span className="text-[11px] text-slate-500">Thời gian chạm đất</span>
        </div>

        <div className="rounded-lg bg-slate-900/60 p-3">
          <span className="text-xs text-slate-400">Vận tốc chạm đất v_land</span>
          <p className="mt-1 font-mono text-lg font-bold text-purple-400">
            {Math.sqrt(vx0 ** 2 + 2 * g * height + vy0 ** 2).toFixed(2)} m/s
          </p>
          <span className="text-[11px] text-slate-500">√(vx² + vy²)</span>
        </div>
      </div>
    </div>
  );
};
