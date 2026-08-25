import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Settings2 } from 'lucide-react';

export const NewtonSecondLawSim: React.FC = () => {
  const [pullForce, setPullForce] = useState<number>(4.0); // N
  const [massCart, setMassCart] = useState<number>(0.5); // kg
  const [frictionCoeff, setFrictionCoeff] = useState<number>(0.1); // mu
  const [inclineAngle, setInclineAngle] = useState<number>(0); // degrees

  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [simTime, setSimTime] = useState<number>(0);
  const [position, setPosition] = useState<number>(0);
  const [velocity, setVelocity] = useState<number>(0);

  const [dataHistory, setDataHistory] = useState<Array<{ t: number; v: number; s: number; a: number }>>([]);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const graphCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameId = useRef<number | null>(null);

  const g = 9.8;
  const rad = (inclineAngle * Math.PI) / 180;
  const gravityParallel = massCart * g * Math.sin(rad);
  const normalForce = massCart * g * Math.cos(rad);
  const frictionMax = frictionCoeff * normalForce;

  // Net force calculation
  let netForce = pullForce - gravityParallel - frictionMax;
  if (pullForce <= gravityParallel + frictionMax && velocity === 0 && inclineAngle === 0) {
    netForce = Math.max(0, pullForce - frictionMax);
  }
  const acceleration = Math.max(0, netForce / massCart);

  const handleReset = () => {
    setIsRunning(false);
    setSimTime(0);
    setPosition(0);
    setVelocity(0);
    setDataHistory([{ t: 0, v: 0, s: 0, a: acceleration }]);
  };

  useEffect(() => {
    handleReset();
  }, [pullForce, massCart, frictionCoeff, inclineAngle]);

  useEffect(() => {
    let lastTime = performance.now();

    const loop = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;

      if (isRunning) {
        setSimTime((prevT) => {
          const nextT = prevT + dt;
          const nextV = velocity + acceleration * dt;
          const nextS = position + velocity * dt + 0.5 * acceleration * dt * dt;

          // Rail length is 10 meters
          if (nextS >= 10) {
            setIsRunning(false);
            setPosition(10);
            return nextT;
          }

          setVelocity(nextV);
          setPosition(nextS);

          setDataHistory((prev) => {
            if (prev.length > 200) return [...prev.slice(1), { t: nextT, v: nextV, s: nextS, a: acceleration }];
            return [...prev, { t: nextT, v: nextV, s: nextS, a: acceleration }];
          });

          return nextT;
        });
      }

      animFrameId.current = requestAnimationFrame(loop);
    };

    animFrameId.current = requestAnimationFrame(loop);
    return () => {
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
    };
  }, [isRunning, velocity, position, acceleration]);

  // Render physical cart on track
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;

    ctx.fillStyle = '#090d16';
    ctx.fillRect(0, 0, w, h);

    // Track surface
    const trackStartX = 40;
    const trackEndX = w - 40;
    const trackY = h - 60;

    // Draw Track
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(trackStartX, trackY);
    ctx.lineTo(trackEndX, trackY);
    ctx.stroke();

    // Pulley & hanging weight
    const pulleyX = trackEndX + 15;
    const pulleyY = trackY;
    ctx.fillStyle = '#64748b';
    ctx.beginPath();
    ctx.arc(pulleyX, pulleyY, 12, 0, Math.PI * 2);
    ctx.fill();

    // Distance mapping: 0 to 10m -> trackStartX to trackEndX - 80
    const pixelDistance = (position / 10) * (trackEndX - trackStartX - 100);
    const cartX = trackStartX + pixelDistance;
    const cartY = trackY - 36;
    const cartW = 70;
    const cartH = 30;

    // Draw Cart
    ctx.fillStyle = '#0284c7';
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(cartX, cartY, cartW, cartH, 6);
    ctx.fill();
    ctx.stroke();

    // Wheels
    ctx.fillStyle = '#94a3b8';
    ctx.beginPath();
    ctx.arc(cartX + 15, cartY + cartH + 4, 6, 0, Math.PI * 2);
    ctx.arc(cartX + cartW - 15, cartY + cartH + 4, 6, 0, Math.PI * 2);
    ctx.fill();

    // Mass label on cart
    ctx.fillStyle = '#ffffff';
    ctx.font = '11px Plus Jakarta Sans';
    ctx.fillText(`m = ${massCart}kg`, cartX + 12, cartY + 18);

    // Tow String to pulley
    ctx.strokeStyle = '#f8fafc';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(cartX + cartW, cartY + 15);
    ctx.lineTo(pulleyX, pulleyY - 12);
    ctx.lineTo(pulleyX, pulleyY + 40 + pixelDistance * 0.2);
    ctx.stroke();

    // Hanging weight
    ctx.fillStyle = '#e11d48';
    ctx.fillRect(pulleyX - 8, pulleyY + 40 + pixelDistance * 0.2, 16, 20);

    // Force Vectors on Cart
    // Pull Force vector (Cyan)
    ctx.strokeStyle = '#06b6d4';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(cartX + cartW, cartY + 15);
    ctx.lineTo(cartX + cartW + pullForce * 10, cartY + 15);
    ctx.stroke();

    // Friction Force vector (Rose, backwards)
    if (frictionMax > 0) {
      ctx.strokeStyle = '#f43f5e';
      ctx.beginPath();
      ctx.moveTo(cartX, cartY + cartH);
      ctx.lineTo(cartX - frictionMax * 15, cartY + cartH);
      ctx.stroke();
    }
  }, [position, massCart, pullForce, frictionMax]);

  // Render Real-time v-t and s-t Graph
  useEffect(() => {
    const canvas = graphCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;

    ctx.fillStyle = '#090d16';
    ctx.fillRect(0, 0, w, h);

    // Grid & Axes
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = 30; x < w; x += 40) {
      ctx.moveTo(x, 10);
      ctx.lineTo(x, h - 25);
    }
    for (let y = 20; y < h - 25; y += 30) {
      ctx.moveTo(30, y);
      ctx.lineTo(w - 10, y);
    }
    ctx.stroke();

    // Origin
    const ox = 30;
    const oy = h - 25;
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(ox, 10);
    ctx.lineTo(ox, oy);
    ctx.lineTo(w - 10, oy);
    ctx.stroke();

    ctx.fillStyle = '#94a3b8';
    ctx.font = '10px JetBrains Mono';
    ctx.fillText('v (m/s)', 5, 15);
    ctx.fillText('t (s)', w - 25, oy + 18);

    if (dataHistory.length < 2) return;

    // Draw v(t) curve (Cyan)
    ctx.strokeStyle = '#06b6d4';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    const maxT = Math.max(5, simTime);
    const maxV = Math.max(5, velocity * 1.2);

    dataHistory.forEach((pt, i) => {
      const px = ox + (pt.t / maxT) * (w - 50);
      const py = oy - (pt.v / maxV) * (oy - 20);
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    });
    ctx.stroke();
  }, [dataHistory, simTime, velocity]);

  return (
    <div id="newton2-sim-container" className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl backdrop-blur-md">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-cyan-500/10 px-2 py-0.5 text-xs font-semibold text-cyan-400">
              MÔ PHỎNG ĐỘNG LỰC HỌC
            </span>
            <h3 className="text-xl font-bold text-slate-100">Định luật 2 Newton & Ma sát trượt</h3>
          </div>
          <p className="mt-1 text-sm text-slate-400">
            Khảo sát gia tốc a = (F - F_ms) / m, kiểm chứng đồ thị vận tốc v(t) theo SGK Bài 15.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="newton2-play-btn"
            onClick={() => setIsRunning(!isRunning)}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 font-semibold text-white shadow-lg transition ${
              isRunning ? 'bg-amber-600 hover:bg-amber-500' : 'bg-cyan-600 hover:bg-cyan-500'
            }`}
          >
            {isRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            <span>{isRunning ? 'Tạm dừng' : 'Kéo xe'}</span>
          </button>
          <button
            id="newton2-reset-btn"
            onClick={handleReset}
            className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-slate-700"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Đặt lại</span>
          </button>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-4 col-span-2">
          {/* Main Visual Track */}
          <div className="relative overflow-hidden rounded-xl border border-slate-800 bg-slate-950 p-2">
            <canvas ref={canvasRef} width={680} height={200} className="h-auto w-full rounded-lg" />
          </div>

          {/* Real-time v-t graph */}
          <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-950 p-3">
            <div className="mb-2 flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold text-cyan-400">Đồ thị vận tốc theo thời gian $v(t)$</span>
              <span className="font-mono">Độ dốc đường thẳng = Gia tốc $a$</span>
            </div>
            <canvas ref={graphCanvasRef} width={680} height={150} className="h-auto w-full rounded-lg" />
          </div>
        </div>

        {/* Sliders */}
        <div className="space-y-5 rounded-xl border border-slate-800 bg-slate-950/60 p-5">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-200">
            <Settings2 className="h-4 w-4 text-cyan-400" />
            <span>Thông số kéo & vật cản</span>
          </div>

          <div>
            <div className="flex justify-between text-xs text-slate-300">
              <span>Lực kéo $F$</span>
              <span className="font-mono font-bold text-cyan-400">{pullForce.toFixed(1)} N</span>
            </div>
            <input
              type="range"
              min={0}
              max={15}
              step={0.5}
              value={pullForce}
              onChange={(e) => setPullForce(Number(e.target.value))}
              className="mt-2 w-full accent-cyan-500"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs text-slate-300">
              <span>Khối lượng xe $m$</span>
              <span className="font-mono font-bold text-cyan-400">{massCart.toFixed(2)} kg</span>
            </div>
            <input
              type="range"
              min={0.1}
              max={2.0}
              step={0.1}
              value={massCart}
              onChange={(e) => setMassCart(Number(e.target.value))}
              className="mt-2 w-full accent-cyan-500"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs text-slate-300">
              <span>Hệ số ma sát trượt $\mu$</span>
              <span className="font-mono font-bold text-cyan-400">{frictionCoeff.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min={0.0}
              max={0.5}
              step={0.02}
              value={frictionCoeff}
              onChange={(e) => setFrictionCoeff(Number(e.target.value))}
              className="mt-2 w-full accent-cyan-500"
            />
          </div>

          {/* Quick Real-time calculations */}
          <div className="space-y-2 rounded-lg bg-slate-900 p-3 text-xs">
            <div className="flex justify-between text-slate-300">
              <span>Hợp lực tác dụng $\Sigma F$:</span>
              <span className="font-mono font-bold text-cyan-400">{netForce.toFixed(2)} N</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Gia tốc $a = \Sigma F / m$:</span>
              <span className="font-mono font-bold text-emerald-400">{acceleration.toFixed(2)} m/s²</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Vận tốc hiện tại $v$:</span>
              <span className="font-mono font-bold text-amber-400">{velocity.toFixed(2)} m/s</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Quãng đường đi $s$:</span>
              <span className="font-mono font-bold text-purple-400">{position.toFixed(2)} m / 10m</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
