import React, { useState } from 'react';
import { Play, RotateCcw, Table, CheckCircle2, Sliders, Activity, Zap, ShieldAlert } from 'lucide-react';

interface CollisionRecord {
  run: number;
  type: string;
  m1: number;
  m2: number;
  p_before: number;
  p_after: number;
  deltaP_percent: number;
}

export const AirTrackCollisionLab: React.FC = () => {
  const [collisionType, setCollisionType] = useState<'ELASTIC' | 'INELASTIC'>('INELASTIC');
  const [m1, setM1] = useState<number>(0.2); // kg (Cart 1: 0.1 to 0.5 kg)
  const [m2, setM2] = useState<number>(0.2); // kg (Cart 2: 0.1 to 0.5 kg)
  const [v1Init, setV1Init] = useState<number>(0.6); // m/s
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [animProgress, setAnimProgress] = useState<number>(0);

  // Digital timer readings
  const [t1Before, setT1Before] = useState<number>(0.167); // shutter 0.1m / 0.6m/s = 0.167s
  const [t1After, setT1After] = useState<number>(0);
  const [t2After, setT2After] = useState<number>(0);

  // Table records
  const [tableData, setTableData] = useState<CollisionRecord[]>([
    { run: 1, type: 'Va chạm mềm', m1: 0.2, m2: 0.2, p_before: 0.12, p_after: 0.12, deltaP_percent: 0 },
    { run: 2, type: 'Va chạm đàn hồi', m1: 0.2, m2: 0.3, p_before: 0.12, p_after: 0.119, deltaP_percent: 0.8 },
  ]);

  // Calculations:
  // Before: Cart 1 has v1 = v1Init, Cart 2 is at rest (v2 = 0)
  const pBefore = m1 * v1Init;

  // After collision:
  // Elastic: v1' = (m1 - m2)/(m1 + m2) * v1, v2' = 2*m1/(m1 + m2) * v1
  // Inelastic (Soft/Mềm): v_comb = (m1 * v1) / (m1 + m2)
  const v1PrimeElastic = ((m1 - m2) / (m1 + m2)) * v1Init;
  const v2PrimeElastic = ((2 * m1) / (m1 + m2)) * v1Init;
  const vInelastic = (m1 * v1Init) / (m1 + m2);

  const handleRunCollision = () => {
    if (isSimulating) return;
    setIsSimulating(true);
    setAnimProgress(0);

    const startTime = performance.now();
    const duration = 1400; // ms

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      setAnimProgress(progress);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setIsSimulating(false);

        // Calculate final experimental momentum
        let pAfterVal = 0;
        const shutterL = 0.1; // 10cm shutter

        if (collisionType === 'INELASTIC') {
          pAfterVal = (m1 + m2) * vInelastic;
          setT1After(Number((shutterL / vInelastic).toFixed(3)));
          setT2After(Number((shutterL / vInelastic).toFixed(3)));
        } else {
          pAfterVal = m1 * v1PrimeElastic + m2 * v2PrimeElastic;
          if (Math.abs(v1PrimeElastic) > 0.01) {
            setT1After(Number((shutterL / Math.abs(v1PrimeElastic)).toFixed(3)));
          } else {
            setT1After(9.999);
          }
          setT2After(Number((shutterL / v2PrimeElastic).toFixed(3)));
        }

        const deltaP = Math.abs(pAfterVal - pBefore);
        const deltaPercent = (deltaP / (pBefore || 1)) * 100;

        setTableData((prev) => [
          ...prev,
          {
            run: prev.length + 1,
            type: collisionType === 'INELASTIC' ? 'Va chạm mềm' : 'Va chạm đàn hồi',
            m1,
            m2,
            p_before: Number(pBefore.toFixed(3)),
            p_after: Number(pAfterVal.toFixed(3)),
            deltaP_percent: Number(deltaPercent.toFixed(1)),
          },
        ]);
      }
    };

    requestAnimationFrame(animate);
  };

  // Compute cart positions on air track based on animProgress
  // Collision point is at 50% of track
  let cart1Pos = 20; // %
  let cart2Pos = 60; // %

  if (animProgress <= 0.5) {
    const p1 = animProgress / 0.5;
    cart1Pos = 20 + p1 * (52 - 20);
    cart2Pos = 60;
  } else {
    const p2 = (animProgress - 0.5) / 0.5;
    if (collisionType === 'INELASTIC') {
      // Both move together
      cart1Pos = 52 + p2 * (85 - 52);
      cart2Pos = 60 + p2 * (93 - 60);
    } else {
      // Elastic separation
      cart1Pos = 52 + p2 * ((v1PrimeElastic / v1Init) * 30);
      cart2Pos = 60 + p2 * ((v2PrimeElastic / v1Init) * 35);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl border border-white/10 bg-[#071124]/90 p-5 shadow-xl backdrop-blur-xl">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <span className="h-4 w-1 rounded-full bg-[#00D4FF]"></span>
            <h3 className="text-lg sm:text-xl font-bold text-white uppercase tracking-tight">
              BÀI 30: THỰC HÀNH XÁC ĐỊNH ĐỘNG LƯỢNG TRƯỚC VÀ SAU VA CHẠM (BĂNG ĐỆM KHÍ)
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCollisionType('INELASTIC')}
              className={`rounded-lg px-3 py-1 text-xs font-bold transition ${
                collisionType === 'INELASTIC'
                  ? 'bg-amber-400 text-black shadow'
                  : 'bg-[#0C1E3C] text-slate-300 hover:bg-[#132E58]'
              }`}
            >
              Va chạm mềm (Mũi dính)
            </button>
            <button
              onClick={() => setCollisionType('ELASTIC')}
              className={`rounded-lg px-3 py-1 text-xs font-bold transition ${
                collisionType === 'ELASTIC'
                  ? 'bg-[#00D4FF] text-black shadow'
                  : 'bg-[#0C1E3C] text-slate-300 hover:bg-[#132E58]'
              }`}
            >
              Va chạm đàn hồi (Lò xo)
            </button>
          </div>
        </div>
        <p className="mt-2 text-xs sm:text-sm text-slate-300 leading-relaxed">
          Sử dụng băng đệm khí phẳng gần như triệt tiêu ma sát (a ≈ 0). Xe 1 có cản quang 10 cm chuyển động tới va chạm vào Xe 2 đang đứng yên. Đo thời gian qua cổng quang điện trước và sau va chạm để kiểm chứng định luật bảo toàn động lượng p = p'.
        </p>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left: Air Track Canvas (7 cols) */}
        <div className="lg:col-span-7 space-y-4 rounded-2xl border border-white/10 bg-[#081022] p-5 shadow-2xl">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-[#00D4FF]">
              <Activity className="h-4 w-4" />
              <span>BĂNG ĐỆM KHÍ & 2 XE TRƯỢT (60 FPS)</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-mono">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Bơm khí nén: BẬT</span>
            </div>
          </div>

          {/* Air Track Stage */}
          <div className="relative h-64 rounded-xl border border-slate-700/80 bg-gradient-to-b from-[#060D1E] to-[#020712] p-4 overflow-hidden flex items-center justify-center">
            {/* Air Track Aluminum Rail */}
            <div className="relative w-full h-12 bg-gradient-to-r from-slate-400 via-slate-300 to-slate-400 rounded border border-slate-400 shadow-2xl flex items-center">
              {/* Air holes array */}
              <div className="absolute inset-0 flex justify-between px-3 items-center">
                {Array.from({ length: 25 }).map((_, i) => (
                  <div key={i} className="h-1 w-1 rounded-full bg-black/60" />
                ))}
              </div>

              {/* Photogate 1 (Gate 1 before collision) */}
              <div className="absolute left-[38%] -top-7 flex flex-col items-center z-10">
                <div className="rounded bg-amber-500 px-1 py-0.5 text-[8px] font-bold text-black shadow">
                  CỔNG 1
                </div>
                <div className="w-[1px] h-7 bg-red-400" />
              </div>

              {/* Photogate 2 (Gate 2 after collision) */}
              <div className="absolute left-[75%] -top-7 flex flex-col items-center z-10">
                <div className="rounded bg-cyan-400 px-1 py-0.5 text-[8px] font-bold text-black shadow">
                  CỔNG 2
                </div>
                <div className="w-[1px] h-7 bg-cyan-400" />
              </div>

              {/* Cart 1 (Blue) */}
              <div
                className="absolute -top-6 h-10 w-16 bg-gradient-to-b from-blue-500 to-blue-700 rounded border border-blue-300 shadow-xl flex flex-col items-center justify-between p-0.5 text-[8px] font-bold text-white transition-all z-20"
                style={{ left: `${cart1Pos}%` }}
              >
                {/* 10cm Optical Shutter Flag on top */}
                <div className="h-3 w-8 bg-slate-900 border border-slate-300 rounded-t text-[6px] flex items-center justify-center">
                  10cm
                </div>
                <span>Xe 1 ({m1}kg)</span>
              </div>

              {/* Cart 2 (Purple/Red) */}
              <div
                className="absolute -top-6 h-10 w-16 bg-gradient-to-b from-purple-500 to-purple-700 rounded border border-purple-300 shadow-xl flex flex-col items-center justify-between p-0.5 text-[8px] font-bold text-white transition-all z-20"
                style={{ left: `${cart2Pos}%` }}
              >
                {/* 10cm Optical Shutter Flag on top */}
                <div className="h-3 w-8 bg-slate-900 border border-slate-300 rounded-t text-[6px] flex items-center justify-center">
                  10cm
                </div>
                <span>Xe 2 ({m2}kg)</span>
              </div>
            </div>
          </div>

          {/* Mass & Speed Controls */}
          <div className="grid grid-cols-3 gap-3 rounded-xl border border-slate-800 bg-[#061226] p-4 text-xs">
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-blue-300 font-bold">Khối lượng m₁:</span>
                <span className="font-mono text-white font-bold">{m1} kg</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="0.5"
                step="0.05"
                disabled={isSimulating}
                value={m1}
                onChange={(e) => setM1(parseFloat(e.target.value))}
                className="w-full"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-purple-300 font-bold">Khối lượng m₂:</span>
                <span className="font-mono text-white font-bold">{m2} kg</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="0.5"
                step="0.05"
                disabled={isSimulating}
                value={m2}
                onChange={(e) => setM2(parseFloat(e.target.value))}
                className="w-full"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-amber-300 font-bold">Vận tốc ban đầu v₁:</span>
                <span className="font-mono text-white font-bold">{v1Init} m/s</span>
              </div>
              <input
                type="range"
                min="0.3"
                max="1.0"
                step="0.1"
                disabled={isSimulating}
                value={v1Init}
                onChange={(e) => setV1Init(parseFloat(e.target.value))}
                className="w-full"
              />
            </div>
          </div>

          {/* Action Trigger */}
          <div className="flex items-center justify-between pt-1">
            <button
              onClick={handleRunCollision}
              disabled={isSimulating}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#00D4FF] to-[#00FFCC] hover:opacity-90 px-6 py-2.5 text-xs font-bold text-slate-950 shadow-[0_0_20px_rgba(0,212,255,0.3)] transition active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              <Play className="h-4 w-4 fill-slate-950" />
              <span>{isSimulating ? 'Đang va chạm...' : 'Đẩy Xe 1 chuyển động & Va chạm'}</span>
            </button>

            <button
              onClick={() => setAnimProgress(0)}
              className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-[#0C1E3C] px-4 py-2.5 text-xs font-bold text-slate-300 hover:bg-[#122A50]"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Đặt lại 2 xe</span>
            </button>
          </div>
        </div>

        {/* Right: Momentum Verification Table (5 cols) */}
        <div className="lg:col-span-5 space-y-4 rounded-2xl border border-white/10 bg-[#081022] p-5 shadow-2xl">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-200">
              <Table className="h-4 w-4 text-[#00FFCC]" />
              <span>BẢNG 30.1: KIỂM CHỨNG ĐỘNG LƯỢNG p = p'</span>
            </div>
            <button onClick={() => setTableData([])} className="text-xs text-rose-400 hover:underline">
              Xóa
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="pb-1.5">Loại va chạm</th>
                  <th className="pb-1.5">p (kg·m/s)</th>
                  <th className="pb-1.5">p' (kg·m/s)</th>
                  <th className="pb-1.5">Sai lệch %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {tableData.map((r, idx) => (
                  <tr key={idx} className="text-slate-300">
                    <td className="py-1.5 text-amber-300 font-medium">{r.type}</td>
                    <td className="py-1.5 text-cyan-400 font-bold">{r.p_before}</td>
                    <td className="py-1.5 text-emerald-400 font-bold">{r.p_after}</td>
                    <td className="py-1.5 text-white font-bold">{r.deltaP_percent}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Law Summary Box */}
          <div className="rounded-xl border border-white/10 bg-[#0C1A36] p-4 space-y-2 text-xs">
            <div className="font-bold text-[#00D4FF]">Định luật bảo toàn động lượng cho hệ kín:</div>
            <div className="p-2.5 bg-black/40 rounded-lg text-center font-mono text-emerald-300 font-bold text-sm">
              m₁·v₁ + m₂·v₂ = m₁·v₁' + m₂·v₂'
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Tổng vectơ động lượng của hệ trước va chạm bằng tổng vectơ động lượng sau va chạm. Trong va chạm đàn hồi động năng được bảo toàn; trong va chạm mềm một phần động năng chuyển hóa thành nội năng.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
