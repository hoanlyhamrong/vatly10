import React, { useState, useEffect, useRef } from 'react';
import { Settings2, RotateCcw } from 'lucide-react';

export const ForceVectorsSim: React.FC = () => {
  const [f1, setF1] = useState<number>(60); // N
  const [f2, setF2] = useState<number>(80); // N
  const [angleDeg, setAngleDeg] = useState<number>(90); // degrees

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const rad = (angleDeg * Math.PI) / 180;
  // Parallelogram rule: F^2 = F1^2 + F2^2 + 2*F1*F2*cos(alpha)
  const fNet = Math.sqrt(f1 * f1 + f2 * f2 + 2 * f1 * f2 * Math.cos(rad));
  // Direction angle theta of F_net relative to F1
  const thetaRad = Math.atan2(f2 * Math.sin(rad), f1 + f2 * Math.cos(rad));
  const thetaDeg = (thetaRad * 180) / Math.PI;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;

    ctx.fillStyle = '#090d16';
    ctx.fillRect(0, 0, w, h);

    const ox = w / 3;
    const oy = (2 * h) / 3;
    const scale = 1.6; // pixels per Newton

    // Coordinate grid
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    for (let x = 0; x < w; x += 30) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y < h; y += 30) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Origin point
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.arc(ox, oy, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.font = '12px JetBrains Mono';
    ctx.fillText('O', ox - 15, oy + 15);

    // Vector F1 (along positive x axis)
    const f1X = ox + f1 * scale;
    const f1Y = oy;

    // Vector F2 (at angleDeg counterclockwise)
    const f2X = ox + f2 * scale * Math.cos(rad);
    const f2Y = oy - f2 * scale * Math.sin(rad);

    // Resultant Vector F_net
    const fNetX = f1X + f2 * scale * Math.cos(rad);
    const fNetY = oy - f2 * scale * Math.sin(rad);

    // Draw Parallelogram dotted lines
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(f1X, f1Y);
    ctx.lineTo(fNetX, fNetY);
    ctx.lineTo(f2X, f2Y);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw Angle Arc
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(ox, oy, 35, 0, -rad, true);
    ctx.stroke();
    ctx.fillStyle = '#38bdf8';
    ctx.fillText(`α = ${angleDeg}°`, ox + 42, oy - 15);

    // Function to draw arrow
    const drawArrow = (x1: number, y1: number, x2: number, y2: number, color: string, label: string) => {
      const headlen = 10;
      const dx = x2 - x1;
      const dy = y2 - y1;
      const angle = Math.atan2(dy, dx);

      ctx.strokeStyle = color;
      ctx.fillStyle = color;
      ctx.lineWidth = 3;

      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(x2, y2);
      ctx.lineTo(x2 - headlen * Math.cos(angle - Math.PI / 6), y2 - headlen * Math.sin(angle - Math.PI / 6));
      ctx.lineTo(x2 - headlen * Math.cos(angle + Math.PI / 6), y2 - headlen * Math.sin(angle + Math.PI / 6));
      ctx.closePath();
      ctx.fill();

      ctx.font = 'bold 13px Plus Jakarta Sans';
      ctx.fillText(label, x2 + 10, y2 - 5);
    };

    // Draw F1 (Cyan)
    drawArrow(ox, oy, f1X, f1Y, '#06b6d4', `F1 = ${f1} N`);

    // Draw F2 (Amber)
    drawArrow(ox, oy, f2X, f2Y, '#f59e0b', `F2 = ${f2} N`);

    // Draw F_net (Emerald / Green)
    drawArrow(ox, oy, fNetX, fNetY, '#10b981', `F_ht = ${fNet.toFixed(1)} N`);
  }, [f1, f2, angleDeg, fNet, rad]);

  return (
    <div id="force-vectors-sim-container" className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl backdrop-blur-md">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-cyan-500/10 px-2 py-0.5 text-xs font-semibold text-cyan-400">
              MÔ PHỎNG VECTƠ LỰC
            </span>
            <h3 className="text-xl font-bold text-slate-100">Quy tắc Hình bình hành Tổng hợp Lực</h3>
          </div>
          <p className="mt-1 text-sm text-slate-400">
            Khảo sát hợp lực F = F1 + F2 và định lí hàm cosin F = √(F1² + F2² + 2·F1·F2·cos α) (SGK Bài 13 & 22).
          </p>
        </div>

        <button
          onClick={() => {
            setF1(60);
            setF2(80);
            setAngleDeg(90);
          }}
          className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2 text-sm font-medium text-slate-300 transition hover:bg-slate-700"
        >
          <RotateCcw className="h-4 w-4" />
          <span>Mặc định (Vuông góc)</span>
        </button>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="col-span-2 overflow-hidden rounded-xl border border-slate-800 bg-slate-950 p-2">
          <canvas ref={canvasRef} width={640} height={380} className="h-auto w-full rounded-lg" />
        </div>

        <div className="space-y-5 rounded-xl border border-slate-800 bg-slate-950/60 p-5">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-200">
            <Settings2 className="h-4 w-4 text-cyan-400" />
            <span>Điều chỉnh lực & góc kẹp</span>
          </div>

          <div>
            <div className="flex justify-between text-xs text-slate-300">
              <span>Độ lớn lực $F_1$</span>
              <span className="font-mono font-bold text-cyan-400">{f1} N</span>
            </div>
            <input
              type="range"
              min={10}
              max={150}
              step={5}
              value={f1}
              onChange={(e) => setF1(Number(e.target.value))}
              className="mt-2 w-full accent-cyan-500"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs text-slate-300">
              <span>Độ lớn lực $F_2$</span>
              <span className="font-mono font-bold text-amber-400">{f2} N</span>
            </div>
            <input
              type="range"
              min={10}
              max={150}
              step={5}
              value={f2}
              onChange={(e) => setF2(Number(e.target.value))}
              className="mt-2 w-full accent-amber-500"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs text-slate-300">
              <span>Góc kẹp $\alpha$</span>
              <span className="font-mono font-bold text-cyan-400">{angleDeg}°</span>
            </div>
            <input
              type="range"
              min={0}
              max={180}
              step={1}
              value={angleDeg}
              onChange={(e) => setAngleDeg(Number(e.target.value))}
              className="mt-2 w-full accent-cyan-500"
            />
            <div className="mt-2 flex flex-wrap gap-1.5">
              {[
                { label: 'Cùng chiều (0°)', val: 0 },
                { label: 'Vuông góc (90°)', val: 90 },
                { label: '120°', val: 120 },
                { label: 'Ngược chiều (180°)', val: 180 },
              ].map((item) => (
                <button
                  key={item.label}
                  onClick={() => setAngleDeg(item.val)}
                  className={`rounded-md px-2 py-1 text-[11px] font-medium transition ${
                    angleDeg === item.val
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2 rounded-xl bg-slate-900 p-4 text-xs">
            <div className="flex justify-between text-slate-300">
              <span>Độ lớn Hợp lực F:</span>
              <span className="font-mono text-base font-bold text-emerald-400">{fNet.toFixed(2)} N</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Góc lệch θ so với vectơ F1:</span>
              <span className="font-mono font-bold text-slate-200">{thetaDeg.toFixed(1)}°</span>
            </div>
            <div className="mt-2 text-[11px] text-slate-400">
              Khoảng giới hạn hợp lực: |F1 - F2| ≤ F ≤ F1 + F2: [{Math.abs(f1 - f2)} N → {f1 + f2} N]
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
