import React, { useState } from 'react';
import { Network, Table, CheckCircle2, RotateCcw, Sliders, Sparkles, Compass } from 'lucide-react';

interface ForceRecord {
  run: number;
  F1: number;
  F2: number;
  alpha: number;
  F_exp: number;
  F_theo: number;
}

export const ForceAdditionLab: React.FC = () => {
  const [labMode, setLabMode] = useState<'CONCURRENT' | 'PARALLEL'>('CONCURRENT');

  // Concurrent forces state
  const [f1, setF1] = useState<number>(3.0); // N (0 to 5N)
  const [f2, setF2] = useState<number>(4.0); // N (0 to 5N)
  const [alphaDeg, setAlphaDeg] = useState<number>(90); // degrees (0 to 180)
  const [fExp, setFExp] = useState<number>(5.0); // Experimental result

  // Parallel forces state
  const [distAB, setDistAB] = useState<number>(40); // cm
  const [posO, setPosO] = useState<number>(24); // cm from A
  const [f1Par, setF1Par] = useState<number>(2.0); // N
  const [f2Par, setF2Par] = useState<number>(3.0); // N

  // Table data
  const [concurrentRecords, setConcurrentRecords] = useState<ForceRecord[]>([
    { run: 1, F1: 3.0, F2: 4.0, alpha: 90, F_exp: 5.0, F_theo: 5.0 },
    { run: 2, F1: 3.0, F2: 3.0, alpha: 60, F_exp: 5.2, F_theo: 5.2 },
    { run: 3, F1: 4.0, F2: 2.0, alpha: 120, F_exp: 3.5, F_theo: 3.46 },
  ]);

  // Calculate theoretical resultant force for concurrent: F = sqrt(F1^2 + F2^2 + 2*F1*F2*cos(alpha))
  const alphaRad = (alphaDeg * Math.PI) / 180;
  const fTheo = Math.sqrt(f1 * f1 + f2 * f2 + 2 * f1 * f2 * Math.cos(alphaRad));

  // Handle pull to point A1
  const handleSimulatePull = () => {
    const noise = (Math.random() - 0.5) * 0.1;
    const measuredF = Number(Math.max(0.1, fTheo + noise).toFixed(2));
    setFExp(measuredF);

    setConcurrentRecords((prev) => [
      ...prev,
      {
        run: prev.length + 1,
        F1: f1,
        F2: f2,
        alpha: alphaDeg,
        F_exp: measuredF,
        F_theo: Number(fTheo.toFixed(2)),
      },
    ]);
  };

  // Parallel torque check: F1 * d1 = F2 * d2 => d1 = posO, d2 = distAB - posO
  const d1 = posO;
  const d2 = distAB - posO;
  const torque1 = f1Par * d1;
  const torque2 = f2Par * d2;
  const fTotalParallel = f1Par + f2Par;

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="rounded-2xl border border-white/10 bg-[#071124]/90 p-5 shadow-xl backdrop-blur-xl">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <span className="h-4 w-1 rounded-full bg-[#00D4FF]"></span>
            <h3 className="text-lg sm:text-xl font-bold text-white uppercase tracking-tight">
              BÀI 22: THỰC HÀNH TỔNG HỢP LỰC (HAI LỰC ĐỒNG QUY & HAI LỰC SONG SONG)
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setLabMode('CONCURRENT')}
              className={`rounded-lg px-3 py-1 text-xs font-bold transition ${
                labMode === 'CONCURRENT'
                  ? 'bg-[#00D4FF] text-slate-950 shadow'
                  : 'bg-[#0C1E3C] text-slate-300 hover:bg-[#132E58]'
              }`}
            >
              1. Lực đồng quy
            </button>
            <button
              onClick={() => setLabMode('PARALLEL')}
              className={`rounded-lg px-3 py-1 text-xs font-bold transition ${
                labMode === 'PARALLEL'
                  ? 'bg-[#00D4FF] text-slate-950 shadow'
                  : 'bg-[#0C1E3C] text-slate-300 hover:bg-[#132E58]'
              }`}
            >
              2. Lực song song cùng chiều
            </button>
          </div>
        </div>
        <p className="mt-2 text-xs sm:text-sm text-slate-300 leading-relaxed">
          {labMode === 'CONCURRENT'
            ? 'Bố trí hai lực kế F1 và F2 trên bảng thép kéo dãn sợi dây cao su tạo góc α. Sau đó dùng 1 lực kế kéo đúng về điểm A1 để xác định lực tổng hợp Ftn và so sánh với lí thuyết quy tắc hình bình hành lực.'
            : 'Treo các quả nặng lên thanh kim loại có gắn thước chia độ. Kiểm chứng quy tắc hợp lực song song cùng chiều: F = F1 + F2 và F1 / F2 = d2 / d1.'}
        </p>
      </div>

      {/* Main Mode View */}
      {labMode === 'CONCURRENT' ? (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Left Canvas: Steel Board & Vector Diagram (7 cols) */}
          <div className="lg:col-span-7 space-y-4 rounded-2xl border border-white/10 bg-[#081022] p-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-[#00D4FF]">
                <Network className="h-4 w-4" />
                <span>BẢNG THÉP THỰC NGHIỆM VÀ ĐĨA CHIA ĐỘ (0° - 180°)</span>
              </div>
              <span className="text-[11px] font-mono text-[#00FFCC]">
                F_lt = {fTheo.toFixed(2)} N
              </span>
            </div>

            {/* Steel Board Stage Canvas */}
            <div className="relative h-72 rounded-xl border border-slate-700/80 bg-gradient-to-b from-[#101E36] to-[#081122] p-4 overflow-hidden flex items-center justify-center">
              {/* Circular Protractor Disk on Steel Board */}
              <div className="relative h-60 w-60 rounded-full border-2 border-slate-500/40 bg-slate-900/60 shadow-2xl flex items-center justify-center">
                {/* Protractor Angle Lines */}
                <div className="absolute inset-0 rounded-full border border-dashed border-cyan-500/20" />
                <div className="absolute h-full w-[1px] bg-slate-700/60" />
                <div className="absolute w-full h-[1px] bg-slate-700/60" />

                {/* Center Ring Node O */}
                <div className="absolute z-20 h-4 w-4 rounded-full bg-amber-400 border-2 border-white shadow-[0_0_10px_rgba(251,191,36,0.8)] flex items-center justify-center text-[7px] font-black text-black">
                  O
                </div>

                {/* Vector F1 */}
                <div
                  className="absolute z-10 h-1 bg-[#00D4FF] origin-left rounded-full shadow-[0_0_8px_rgba(0,212,255,0.8)] transition-all flex items-center justify-end pr-1 text-[9px] font-bold text-white"
                  style={{
                    width: `${f1 * 22}px`,
                    transform: `rotate(-${alphaDeg / 2}deg)`,
                    left: '50%',
                    top: '50%',
                  }}
                >
                  <span className="translate-y-3 font-mono">F₁={f1}N</span>
                </div>

                {/* Vector F2 */}
                <div
                  className="absolute z-10 h-1 bg-purple-400 origin-left rounded-full shadow-[0_0_8px_rgba(192,132,252,0.8)] transition-all flex items-center justify-end pr-1 text-[9px] font-bold text-white"
                  style={{
                    width: `${f2 * 22}px`,
                    transform: `rotate(${alphaDeg / 2}deg)`,
                    left: '50%',
                    top: '50%',
                  }}
                >
                  <span className="translate-y-3 font-mono">F₂={f2}N</span>
                </div>

                {/* Resultant Vector F (Theoretical & Experimental) */}
                <div
                  className="absolute z-10 h-1.5 bg-[#00FFCC] origin-left rounded-full shadow-[0_0_12px_rgba(0,255,204,1)] transition-all flex items-center justify-end pr-1 text-[10px] font-black text-black"
                  style={{
                    width: `${fTheo * 22}px`,
                    transform: 'rotate(0deg)',
                    left: '50%',
                    top: '50%',
                  }}
                >
                  <span className="translate-y-4 font-mono text-emerald-300">F={fTheo.toFixed(2)}N</span>
                </div>
              </div>
            </div>

            {/* Sliders for F1, F2 and Alpha */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 rounded-xl border border-slate-800 bg-[#061226] p-4 text-xs">
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-cyan-300 font-bold">Lực kế F₁:</span>
                  <span className="font-mono font-bold text-white">{f1} N</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  step="0.5"
                  value={f1}
                  onChange={(e) => setF1(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded appearance-none accent-[#00D4FF]"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-purple-300 font-bold">Lực kế F₂:</span>
                  <span className="font-mono font-bold text-white">{f2} N</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  step="0.5"
                  value={f2}
                  onChange={(e) => setF2(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded appearance-none accent-purple-400"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-amber-300 font-bold">Góc hợp α:</span>
                  <span className="font-mono font-bold text-white">{alphaDeg}°</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="180"
                  step="15"
                  value={alphaDeg}
                  onChange={(e) => setAlphaDeg(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded appearance-none accent-amber-400"
                />
              </div>
            </div>

            {/* Pull Trigger */}
            <div className="flex items-center justify-between pt-1">
              <button
                onClick={handleSimulatePull}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#00D4FF] to-[#00FFCC] hover:opacity-90 px-6 py-2.5 text-xs font-bold text-slate-950 shadow-[0_0_20px_rgba(0,212,255,0.3)] transition active:scale-95 cursor-pointer"
              >
                <Sparkles className="h-4 w-4" />
                <span>Kéo 1 lực kế về điểm A1 (Đo F_thực nghiệm)</span>
              </button>
            </div>
          </div>

          {/* Right: Verification Table & Comparison (5 cols) */}
          <div className="lg:col-span-5 space-y-4 rounded-2xl border border-white/10 bg-[#081022] p-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-200">
                <Table className="h-4 w-4 text-[#00FFCC]" />
                <span>BẢNG 22.1: SO SÁNH F_TN VÀ F_LT</span>
              </div>
              <button onClick={() => setConcurrentRecords([])} className="text-xs text-rose-400 hover:underline">
                Xóa
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="pb-1.5">Lần</th>
                    <th className="pb-1.5">F₁ (N)</th>
                    <th className="pb-1.5">F₂ (N)</th>
                    <th className="pb-1.5">α (°)</th>
                    <th className="pb-1.5">F_tn (N)</th>
                    <th className="pb-1.5">F_lt (N)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {concurrentRecords.map((r) => (
                    <tr key={r.run} className="text-slate-300">
                      <td className="py-1.5 text-[#00D4FF] font-bold">Lần {r.run}</td>
                      <td className="py-1.5">{r.F1}</td>
                      <td className="py-1.5">{r.F2}</td>
                      <td className="py-1.5 text-amber-300">{r.alpha}°</td>
                      <td className="py-1.5 text-emerald-400 font-bold">{r.F_exp}</td>
                      <td className="py-1.5 text-white font-bold">{r.F_theo}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Formula verification box */}
            <div className="rounded-xl border border-white/10 bg-[#0C1A36] p-4 space-y-2 text-xs">
              <div className="font-bold text-[#00D4FF]">Công thức kiểm chứng quy tắc hình bình hành:</div>
              <div className="font-mono text-emerald-300 bg-black/40 p-2.5 rounded-lg text-center font-bold">
                F_lt = √(F₁² + F₂² + 2·F₁·F₂·cos α)
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Khi sai lệch giữa F_tn và F_lt nằm trong giới hạn sai số dụng cụ (≤ 0,1 N), quy tắc hình bình hành lực được nghiệm đúng hoàn toàn.
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* Parallel Forces Mode */
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="lg:col-span-7 space-y-4 rounded-2xl border border-white/10 bg-[#081022] p-5 shadow-2xl">
            <div className="text-xs sm:text-sm font-bold text-[#00D4FF] border-b border-white/10 pb-3">
              MÔ PHỎNG THANH KIM LOẠI CÂN BẰNG DƯỚI HAI LỰC SONG SONG
            </div>

            <div className="relative h-64 rounded-xl border border-slate-700 bg-[#040914] p-4 flex flex-col justify-between">
              <div className="flex justify-between text-xs text-slate-300 font-mono">
                <span>Điểm A (d1 = {d1} cm)</span>
                <span>Điểm O (Hợp lực F = {fTotalParallel} N)</span>
                <span>Điểm B (d2 = {d2} cm)</span>
              </div>

              {/* Horizontal Beam */}
              <div className="relative h-8 bg-gradient-to-r from-amber-300 via-amber-200 to-amber-400 rounded-lg border-2 border-amber-500 shadow-xl flex items-center">
                {/* Center of load O */}
                <div
                  className="absolute top-0 bottom-0 w-2 bg-red-600 rounded z-20 shadow-md"
                  style={{ left: `${(posO / distAB) * 100}%` }}
                />
              </div>

              {/* Weights below */}
              <div className="flex justify-between text-xs font-mono">
                <div className="text-cyan-400">Tải F1 = {f1Par} N</div>
                <div className="text-red-400 font-bold">Điểm treo O = {posO} cm</div>
                <div className="text-purple-400">Tải F2 = {f2Par} N</div>
              </div>
            </div>

            {/* Sliders */}
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div>
                <span className="text-slate-300">F1: {f1Par}N</span>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={f1Par}
                  onChange={(e) => setF1Par(parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>
              <div>
                <span className="text-slate-300">Vị trí O: {posO}cm</span>
                <input
                  type="range"
                  min="10"
                  max="30"
                  value={posO}
                  onChange={(e) => setPosO(parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
              <div>
                <span className="text-slate-300">F2: {f2Par}N</span>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={f2Par}
                  onChange={(e) => setF2Par(parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-4 rounded-2xl border border-white/10 bg-[#081022] p-5 shadow-2xl text-xs">
            <div className="font-bold text-[#00D4FF] border-b border-white/10 pb-2">
              QUY TẮC HAI LỰC SONG SONG CÙNG CHIỀU:
            </div>
            <div className="space-y-2 font-mono">
              <div className="p-2 bg-[#0C1A36] rounded">1. Hợp lực: F = F₁ + F₂ = {fTotalParallel} N</div>
              <div className="p-2 bg-[#0C1A36] rounded">2. Tỉ số cánh tay đòn: F₁·d₁ = {(f1Par * d1).toFixed(1)} N·cm</div>
              <div className="p-2 bg-[#0C1A36] rounded">3. Tỉ số đối nghịch: F₂·d₂ = {(f2Par * d2).toFixed(1)} N·cm</div>
            </div>
            <div className="rounded-lg bg-emerald-950/60 p-3 text-emerald-300 text-center font-bold">
              {Math.abs(torque1 - torque2) < 5
                ? '✓ THANH ĐANG Ở TRẠNG THÁI CÂN BẰNG TỐT'
                : '⚠ THANH BỊ LỆCH, CẦN ĐIỀU CHỈNH VỊ TRÍ O'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
