import React, { useState } from 'react';
import { Play, RotateCcw, Table, CheckCircle2, Clock, Sparkles, Sliders } from 'lucide-react';

interface FreeFallRecord {
  run: number;
  s: number; // m
  t: number; // s
  deltaT: number;
}

export const FreeFallLab: React.FC = () => {
  const [distanceS, setDistanceS] = useState<number>(0.6); // 0.2 to 0.9 m
  const [isDropping, setIsDropping] = useState<boolean>(false);
  const [digitalDisplay, setDigitalDisplay] = useState<string>('0.0000');
  const [tableData, setTableData] = useState<FreeFallRecord[]>([
    { run: 1, s: 0.6, t: 0.3502, deltaT: 0.0002 },
    { run: 2, s: 0.6, t: 0.3498, deltaT: 0.0002 },
    { run: 3, s: 0.6, t: 0.3506, deltaT: 0.0006 },
  ]);

  // Statistical calculations
  const validTimes = tableData.map((r) => r.t);
  const tAvg = validTimes.length > 0 ? validTimes.reduce((a, b) => a + b, 0) / validTimes.length : 0;
  const deltaTList = validTimes.map((t) => Math.abs(t - tAvg));
  const deltaTAvg = deltaTList.length > 0 ? deltaTList.reduce((a, b) => a + b, 0) / deltaTList.length : 0;
  const instrumentError = 0.001; // ĐCNN đồng hồ 0.001s
  const deltaTTot = deltaTAvg + instrumentError;

  const gCalculated = tAvg > 0 ? (2 * distanceS) / (tAvg * tAvg) : 0;
  const deltaG = gCalculated * (2 * (deltaTTot / (tAvg || 1)) + 0.001 / distanceS);

  // Trigger drop
  const handleTriggerDrop = () => {
    if (isDropping) return;
    setIsDropping(true);
    setDigitalDisplay('CHỜ...');

    // Theoretical time: t = sqrt(2s / g) + small random experimental noise
    const trueG = 9.806;
    const theoreticalT = Math.sqrt((2 * distanceS) / trueG);
    const noise = (Math.random() - 0.5) * 0.003;
    const finalT = Math.max(0.05, theoreticalT + noise);

    setTimeout(() => {
      setDigitalDisplay(finalT.toFixed(4));
      setIsDropping(false);

      setTableData((prev) => [
        ...prev,
        {
          run: prev.length + 1,
          s: distanceS,
          t: Number(finalT.toFixed(4)),
          deltaT: 0,
        },
      ]);
    }, 600);
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="rounded-2xl border border-white/10 bg-[#071124]/90 p-5 shadow-xl backdrop-blur-xl">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <span className="h-4 w-1 rounded-full bg-[#00D4FF]"></span>
            <h3 className="text-lg sm:text-xl font-bold text-white uppercase tracking-tight">
              BÀI 11: THỰC HÀNH ĐO GIA TỐC RƠI TỰ DO (MÁNG ĐỨNG, NAM CHÂM ĐIỆN & CỔNG QUANG)
            </h3>
          </div>
          <span className="rounded-full border border-[#00D4FF]/30 bg-[#00D4FF]/10 px-3 py-0.5 text-xs font-bold text-[#00D4FF]">
            Đo Lường Gia Tốc Trọng Trường Chuẩn Xác
          </span>
        </div>
        <p className="mt-2 text-xs sm:text-sm text-slate-300 leading-relaxed">
          Bố trí thí nghiệm gồm giá đỡ thẳng đứng có dây dọi, nam châm điện giữ trụ thép ở đỉnh và cổng quang điện E cách một khoảng s. Ngắt công tắc kép để thả trụ thép rơi tự do và ghi nhận thời gian t trên đồng hồ hiện số MC964.
        </p>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Stage (7 cols) */}
        <div className="lg:col-span-7 space-y-4 rounded-2xl border border-white/10 bg-[#081022] p-5 shadow-2xl">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-[#00D4FF]">
              <Clock className="h-4 w-4" />
              <span>BỐ TRÍ MÁNG ĐỨNG & ĐỒNG HỒ MC964 (60 FPS)</span>
            </div>
            <span className="text-xs text-emerald-400 font-mono">Độ chính xác: 0.0001s</span>
          </div>

          <div className="relative h-72 rounded-xl border border-slate-700/80 bg-gradient-to-b from-[#060E1C] to-[#020710] p-4 flex items-center justify-around">
            {/* Stand & Plummet Dây dọi */}
            <div className="relative flex h-full w-24 flex-col items-center justify-between rounded-lg border border-slate-700 bg-slate-800/90 py-2">
              {/* Electromagnet N */}
              <div className="flex flex-col items-center">
                <div className="h-6 w-16 rounded bg-rose-600 shadow-md text-[9px] font-bold text-white flex items-center justify-center">
                  NC Điện N
                </div>
                {/* Steel bob */}
                <div
                  className={`mt-1 h-7 w-4 rounded-sm bg-slate-200 border border-slate-400 shadow-lg transition-all duration-500 ${
                    isDropping ? 'translate-y-48 opacity-10' : ''
                  }`}
                />
              </div>

              {/* Millimeter scale */}
              <div className="absolute left-2 top-8 bottom-8 flex flex-col justify-between text-[8px] font-mono text-slate-400">
                <span>0.0m</span>
                <span>0.2m</span>
                <span>0.4m</span>
                <span>0.6m</span>
                <span>0.8m</span>
                <span>1.0m</span>
              </div>

              {/* Photogate E */}
              <div
                className="absolute left-0 right-0 flex items-center justify-center transition-all"
                style={{ top: `${Math.min(85, distanceS * 75 + 15)}%` }}
              >
                <div className="flex h-6 w-full items-center justify-between rounded bg-amber-500 px-1 text-[8px] font-bold text-slate-950 shadow">
                  <span>CỔNG E</span>
                  <span>s={distanceS}m</span>
                </div>
              </div>
            </div>

            {/* Digital Timer MC964 Device */}
            <div className="flex flex-col items-center rounded-2xl border-2 border-slate-700 bg-[#071328] p-5 shadow-2xl space-y-3">
              <div className="text-[11px] font-bold uppercase text-[#00D4FF]">
                ĐỒNG HỒ ĐO THỜI GIAN HIỆN SỐ MC964
              </div>
              <div className="flex h-16 w-52 items-center justify-center rounded-lg border border-emerald-900/60 bg-emerald-950 font-mono text-3xl font-bold tracking-widest text-emerald-400 shadow-inner">
                {digitalDisplay} <span className="ml-1 text-sm text-emerald-500">s</span>
              </div>
              <div className="text-[10px] text-slate-400 font-mono">MODE: A ↔ B (Cổng quang E)</div>
            </div>
          </div>

          {/* Distance S Selector */}
          <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-[#061226] p-4">
            <div className="text-xs text-slate-300">
              <span className="font-bold text-[#00D4FF]">Quãng đường rơi s:</span>
            </div>
            <div className="flex items-center gap-2">
              {[0.4, 0.5, 0.6, 0.7, 0.8].map((dist) => (
                <button
                  key={dist}
                  onClick={() => setDistanceS(dist)}
                  className={`rounded-lg px-3 py-1.5 font-mono text-xs font-bold transition ${
                    distanceS === dist
                      ? 'bg-[#00D4FF] text-black shadow'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {dist} m
                </button>
              ))}
            </div>
          </div>

          {/* Trigger Action */}
          <div className="flex items-center justify-between pt-1">
            <button
              onClick={handleTriggerDrop}
              disabled={isDropping}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#00D4FF] to-[#00FFCC] hover:opacity-90 px-6 py-2.5 text-xs font-bold text-slate-950 shadow-[0_0_20px_rgba(0,212,255,0.3)] transition active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              <Play className="h-4 w-4 fill-slate-950" />
              <span>{isDropping ? 'Đang rơi tự do...' : 'Ngắt điện thả trụ thép rơi'}</span>
            </button>

            <button
              onClick={() => {
                setDigitalDisplay('0.0000');
              }}
              className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-[#0C1E3C] px-4 py-2.5 text-xs font-bold text-slate-300 hover:bg-[#122A50]"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Đặt lại 0.0000</span>
            </button>
          </div>
        </div>

        {/* Right Table & Statistics (5 cols) */}
        <div className="lg:col-span-5 space-y-4 rounded-2xl border border-white/10 bg-[#081022] p-5 shadow-2xl">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-200">
              <Table className="h-4 w-4 text-[#00FFCC]" />
              <span>BẢNG 11.1: GHI KẾT QUẢ THỜI GIAN RƠI</span>
            </div>
            <button onClick={() => setTableData([])} className="text-xs text-rose-400 hover:underline">
              Xóa bảng
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="pb-1.5">Lần</th>
                  <th className="pb-1.5">s (m)</th>
                  <th className="pb-1.5">t (s)</th>
                  <th className="pb-1.5">|t - t̄| (s)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {tableData.map((r) => (
                  <tr key={r.run} className="text-slate-300">
                    <td className="py-1.5 text-[#00D4FF] font-bold">Lần {r.run}</td>
                    <td className="py-1.5">{r.s}</td>
                    <td className="py-1.5 text-emerald-400 font-bold">{r.t.toFixed(4)}</td>
                    <td className="py-1.5 text-slate-400">{Math.abs(r.t - tAvg).toFixed(4)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Statistical Uncertainty Box */}
          <div className="rounded-xl border border-white/10 bg-[#0C1A36] p-4 space-y-2 text-xs font-mono">
            <div className="font-bold text-[#00D4FF] border-b border-white/10 pb-1">
              TÍNH GIA TỐC RƠI TỰ DO ḡ = 2s / t̄²:
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Thời gian trung bình t̄:</span>
              <span className="font-bold text-white">{tAvg.toFixed(4)} s</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Sai số tuyệt đối Δt:</span>
              <span className="font-bold text-amber-300">{deltaTTot.toFixed(4)} s</span>
            </div>
            <div className="flex justify-between text-slate-300 border-t border-slate-800 pt-1.5">
              <span>Gia tốc trọng trường ḡ:</span>
              <span className="font-bold text-[#00FFCC] text-sm">{gCalculated.toFixed(2)} m/s²</span>
            </div>
            <div className="mt-2 rounded-lg bg-[#062436] p-2.5 text-center font-bold text-[#00FFCC]">
              g = {gCalculated.toFixed(2)} ± {deltaG.toFixed(2)} (m/s²)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
