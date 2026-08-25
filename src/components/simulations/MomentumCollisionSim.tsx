import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Settings2 } from 'lucide-react';

export const MomentumCollisionSim: React.FC = () => {
  const [m1, setM1] = useState<number>(0.3); // kg
  const [m2, setM2] = useState<number>(0.3); // kg
  const [v1Init, setV1Init] = useState<number>(1.5); // m/s
  const [v2Init, setV2Init] = useState<number>(0.0); // m/s
  const [collisionType, setCollisionType] = useState<'ELASTIC' | 'INELASTIC'>('ELASTIC');

  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [hasCollided, setHasCollided] = useState<boolean>(false);

  const [cart1Pos, setCart1Pos] = useState<number>(100);
  const [cart2Pos, setCart2Pos] = useState<number>(350);
  const [v1, setV1] = useState<number>(1.5);
  const [v2, setV2] = useState<number>(0);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameId = useRef<number | null>(null);

  // Total initial momentum: p = m1*v1 + m2*v2
  const pTotal = m1 * v1Init + m2 * v2Init;
  // Total initial kinetic energy: Wd = 1/2 m1 v1^2 + 1/2 m2 v2^2
  const wTotal = 0.5 * m1 * v1Init * v1Init + 0.5 * m2 * v2Init * v2Init;

  const handleReset = () => {
    setIsRunning(false);
    setHasCollided(false);
    setCart1Pos(100);
    setCart2Pos(350);
    setV1(v1Init);
    setV2(v2Init);
  };

  useEffect(() => {
    handleReset();
  }, [m1, m2, v1Init, v2Init, collisionType]);

  useEffect(() => {
    let lastTime = performance.now();

    const loop = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.03);
      lastTime = now;

      if (isRunning) {
        setCart1Pos((pos1) => {
          setCart2Pos((pos2) => {
            const scale = 120; // pixel per meter
            let nextPos1 = pos1 + v1 * dt * scale;
            let nextPos2 = pos2 + v2 * dt * scale;

            const cartW = 60;
            // Collision detection
            if (!hasCollided && nextPos1 + cartW >= nextPos2) {
              setHasCollided(true);

              if (collisionType === 'ELASTIC') {
                // Elastic collision 1D formulas:
                // v1' = ((m1 - m2)*v1 + 2*m2*v2) / (m1 + m2)
                // v2' = ((m2 - m1)*v2 + 2*m1*v1) / (m1 + m2)
                const v1Prime = ((m1 - m2) * v1 + 2 * m2 * v2) / (m1 + m2);
                const v2Prime = ((m2 - m1) * v2 + 2 * m1 * v1) / (m1 + m2);
                setV1(v1Prime);
                setV2(v2Prime);
              } else {
                // Inelastic (va chạm mềm) formula:
                // v' = (m1*v1 + m2*v2) / (m1 + m2)
                const vCommon = (m1 * v1 + m2 * v2) / (m1 + m2);
                setV1(vCommon);
                setV2(vCommon);
              }
            }

            if (nextPos2 >= 620 || nextPos1 <= 20) {
              setIsRunning(false);
            }

            return nextPos2;
          });
          return pos1 + v1 * dt * 120;
        });
      }

      animFrameId.current = requestAnimationFrame(loop);
    };

    animFrameId.current = requestAnimationFrame(loop);
    return () => {
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
    };
  }, [isRunning, v1, v2, hasCollided, collisionType, m1, m2]);

  // Render air track
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;

    ctx.fillStyle = '#090d16';
    ctx.fillRect(0, 0, w, h);

    const trackY = h / 2 + 20;

    // Air Cushion Track
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(20, trackY, w - 40, 24);
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 2;
    ctx.strokeRect(20, trackY, w - 40, 24);

    // Air holes
    ctx.fillStyle = '#38bdf8';
    for (let x = 30; x < w - 30; x += 20) {
      ctx.beginPath();
      ctx.arc(x, trackY + 12, 2, 0, Math.PI * 2);
      ctx.fill();
    }

    const cartW = 60;
    const cartH = 34;

    // Cart 1 (Cyan)
    ctx.fillStyle = '#0ea5e9';
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(cart1Pos, trackY - cartH, cartW, cartH, 4);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = '11px Plus Jakarta Sans';
    ctx.fillText(`Xe 1: ${m1}kg`, cart1Pos + 6, trackY - 14);

    // Cart 2 (Amber)
    ctx.fillStyle = '#f59e0b';
    ctx.strokeStyle = '#fbbf24';
    ctx.beginPath();
    ctx.roundRect(cart2Pos, trackY - cartH, cartW, cartH, 4);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.fillText(`Xe 2: ${m2}kg`, cart2Pos + 6, trackY - 14);

    // Velocity Vectors
    const vScale = 25;
    // v1 vector
    if (Math.abs(v1) > 0.01) {
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(cart1Pos + cartW / 2, trackY - cartH - 8);
      ctx.lineTo(cart1Pos + cartW / 2 + v1 * vScale, trackY - cartH - 8);
      ctx.stroke();
    }

    // v2 vector
    if (Math.abs(v2) > 0.01) {
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(cart2Pos + cartW / 2, trackY - cartH - 8);
      ctx.lineTo(cart2Pos + cartW / 2 + v2 * vScale, trackY - cartH - 8);
      ctx.stroke();
    }
  }, [cart1Pos, cart2Pos, m1, m2, v1, v2]);

  return (
    <div id="momentum-sim-container" className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl backdrop-blur-md">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-cyan-500/10 px-2 py-0.5 text-xs font-semibold text-cyan-400">
              MÔ PHỎNG ĐỘNG LƯỢNG
            </span>
            <h3 className="text-xl font-bold text-slate-100">Bảo toàn Động lượng & Va chạm</h3>
          </div>
          <p className="mt-1 text-sm text-slate-400">
            Khảo sát va chạm đàn hồi và va chạm mềm trên đệm khí theo định luật bảo toàn p1 + p2 = p1' + p2' (SGK Bài 29 & 30).
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
            <span>{isRunning ? 'Tạm dừng' : 'Va chạm'}</span>
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
          <canvas ref={canvasRef} width={680} height={260} className="h-auto w-full rounded-lg" />
        </div>

        <div className="space-y-4 rounded-xl border border-slate-800 bg-slate-950/60 p-5">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-200">
            <Settings2 className="h-4 w-4 text-cyan-400" />
            <span>Loại va chạm & Khối lượng</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setCollisionType('ELASTIC')}
              className={`rounded-lg py-2 text-xs font-semibold transition ${
                collisionType === 'ELASTIC'
                  ? 'bg-cyan-500 text-white'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
            >
              Va chạm Đàn hồi
            </button>
            <button
              onClick={() => setCollisionType('INELASTIC')}
              className={`rounded-lg py-2 text-xs font-semibold transition ${
                collisionType === 'INELASTIC'
                  ? 'bg-amber-500 text-slate-950'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
            >
              Va chạm Mềm (dính)
            </button>
          </div>

          <div>
            <div className="flex justify-between text-xs text-slate-300">
              <span>Khối lượng xe 1 ($m_1$)</span>
              <span className="font-mono font-bold text-cyan-400">{m1.toFixed(2)} kg</span>
            </div>
            <input
              type="range"
              min={0.1}
              max={1.0}
              step={0.05}
              value={m1}
              onChange={(e) => setM1(Number(e.target.value))}
              className="mt-1 w-full accent-cyan-500"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs text-slate-300">
              <span>Khối lượng xe 2 ($m_2$)</span>
              <span className="font-mono font-bold text-amber-400">{m2.toFixed(2)} kg</span>
            </div>
            <input
              type="range"
              min={0.1}
              max={1.0}
              step={0.05}
              value={m2}
              onChange={(e) => setM2(Number(e.target.value))}
              className="mt-1 w-full accent-amber-500"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs text-slate-300">
              <span>Vận tốc ban đầu $v_1$</span>
              <span className="font-mono font-bold text-cyan-400">{v1Init.toFixed(1)} m/s</span>
            </div>
            <input
              type="range"
              min={0.5}
              max={3.0}
              step={0.1}
              value={v1Init}
              onChange={(e) => setV1Init(Number(e.target.value))}
              className="mt-1 w-full accent-cyan-500"
            />
          </div>

          <div className="space-y-1.5 rounded-lg bg-slate-900 p-3 text-xs">
            <div className="flex justify-between text-slate-300">
              <span>Tổng động lượng hệ p:</span>
              <span className="font-mono font-bold text-emerald-400">{pTotal.toFixed(2)} kg.m/s</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Vận tốc xe 1 sau va chạm:</span>
              <span className="font-mono text-cyan-300">{v1.toFixed(2)} m/s</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Vận tốc xe 2 sau va chạm:</span>
              <span className="font-mono text-amber-300">{v2.toFixed(2)} m/s</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
