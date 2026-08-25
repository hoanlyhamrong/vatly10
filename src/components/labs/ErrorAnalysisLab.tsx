import React, { useState } from 'react';
import { Ruler, CheckCircle2, RotateCcw, Table, HelpCircle, Eye, Sparkles, Sliders } from 'lucide-react';

interface MeasurementRecord {
  run: number;
  d: number; // mm
  deltaD: number; // mm
}

export const ErrorAnalysisLab: React.FC = () => {
  // Target true object size
  const [objectType, setObjectType] = useState<'CYLINDER' | 'SPHERE' | 'BLOCK'>('CYLINDER');
  const [trueSize] = useState<Record<string, number>>({
    CYLINDER: 24.36,
    SPHERE: 18.74,
    BLOCK: 32.58,
  });

  // Vernier caliper interactive slider (0 to 50 mm, step 0.02)
  const [caliperPos, setCaliperPos] = useState<number>(0.0);
  const [magnifierOpen, setMagnifierOpen] = useState<boolean>(true);
  const [tableData, setTableData] = useState<MeasurementRecord[]>([
    { run: 1, d: 24.36, deltaD: 0.01 },
    { run: 2, d: 24.34, deltaD: 0.01 },
    { run: 3, d: 24.38, deltaD: 0.03 },
  ]);

  const targetSize = trueSize[objectType];

  // Vernier reading components:
  // Main scale in mm (integer part)
  const mainScaleReading = Math.floor(caliperPos);
  // Fractional part from vernier scale (0.00 to 0.98 in 0.02mm divisions, 50 subdivisions)
  const fractionalPart = Number((caliperPos - mainScaleReading).toFixed(2));
  const vernierMatchIndex = Math.round(fractionalPart / 0.02); // 0 to 49

  // Snap to object button
  const handleSnapToObject = () => {
    // Add realistic experimental noise (+-0.02mm or +-0.04mm)
    const noiseOptions = [-0.04, -0.02, 0, 0.02, 0.04];
    const noise = noiseOptions[Math.floor(Math.random() * noiseOptions.length)];
    const measured = Number((targetSize + noise).toFixed(2));
    setCaliperPos(measured);
  };

  // Record measurement
  const handleRecordMeasurement = () => {
    const newRun = tableData.length + 1;
    const currentD = Number(caliperPos.toFixed(2));
    setTableData((prev) => [
      ...prev,
      {
        run: newRun,
        d: currentD,
        deltaD: 0,
      },
    ]);
  };

  // Statistical calculations
  const dValues = tableData.map((r) => r.d);
  const dAvg = dValues.length > 0 ? dValues.reduce((a, b) => a + b, 0) / dValues.length : 0;
  const dAvgFixed = Number(dAvg.toFixed(2));

  const dcInstrumentError = 0.02; // ĐCNN thước kẹp 0.02 mm
  const deltaDList = dValues.map((v) => Math.abs(v - dAvg));
  const deltaDAvg = deltaDList.length > 0 ? deltaDList.reduce((a, b) => a + b, 0) / deltaDList.length : 0;
  const totalDeltaD = deltaDAvg + dcInstrumentError;
  const relErrorPercent = dAvgFixed > 0 ? (totalDeltaD / dAvgFixed) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Title & Description Header */}
      <div className="rounded-2xl border border-white/10 bg-[#071124]/90 p-5 shadow-xl backdrop-blur-xl">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <span className="h-4 w-1 rounded-full bg-[#00D4FF]"></span>
            <h3 className="text-lg sm:text-xl font-bold text-white uppercase tracking-tight">
              BÀI 3: THỰC HÀNH TÍNH SAI SỐ & SỬ DỤNG THƯỚC KẸP (VERNIER CALIPER)
            </h3>
          </div>
          <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-0.5 text-xs font-bold text-emerald-400">
            Dụng Cụ Đo Chuẩn Xác & Xử Lý Số Liệu
          </span>
        </div>
        <p className="mt-2 text-xs sm:text-sm text-slate-300 leading-relaxed">
          Thao tác kẹp vật mẫu bằng thước kẹp cơ khí (ĐCNN 0,02 mm), đọc số nguyên trên thân thước chính và số vạch trùng trên du xích. Tự động tính giá trị trung bình d̄, sai số tuyệt đối Δd và sai số tỉ đối δd.
        </p>
      </div>

      {/* Main Interactive Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left: Vernier Caliper Canvas & Interaction (7 cols) */}
        <div className="lg:col-span-7 space-y-4 rounded-2xl border border-white/10 bg-[#081022] p-5 shadow-2xl">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-[#00D4FF]">
              <Ruler className="h-4 w-4" />
              <span>GIAO DIỆN THƯỚC KẸP ẢO (0 - 50 mm)</span>
            </div>
            <button
              onClick={() => setMagnifierOpen(!magnifierOpen)}
              className="flex items-center gap-1 text-xs text-cyan-300 hover:text-cyan-200"
            >
              <Eye className="h-3.5 w-3.5" />
              <span>{magnifierOpen ? 'Ẩn kính lúp' : 'Bật kính lúp du xích'}</span>
            </button>
          </div>

          {/* Object Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-300">Chọn mẫu đo:</span>
            {[
              { id: 'CYLINDER', label: 'Trụ kim loại', size: 24.36 },
              { id: 'SPHERE', label: 'Viên bi thép', size: 18.74 },
              { id: 'BLOCK', label: 'Khối nhôm chữ nhật', size: 32.58 },
            ].map((obj) => (
              <button
                key={obj.id}
                onClick={() => {
                  setObjectType(obj.id as any);
                  setCaliperPos(0);
                }}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                  objectType === obj.id
                    ? 'bg-[#00D4FF] text-black font-bold shadow-md'
                    : 'bg-[#0C1E3C] text-slate-300 hover:bg-[#132B52]'
                }`}
              >
                {obj.label} ({obj.size} mm)
              </button>
            ))}
          </div>

          {/* Vernier Caliper Stage Visual */}
          <div className="relative rounded-xl border border-slate-700/80 bg-[#040914] p-4 overflow-hidden min-h-[220px] flex flex-col justify-between">
            {/* Fixed Main Caliper Body & Jaws */}
            <div className="relative w-full">
              {/* Left Fixed Jaw */}
              <div className="absolute left-4 top-0 w-8 h-28 bg-gradient-to-b from-slate-400 to-slate-600 rounded-bl-xl border border-slate-300 shadow-md flex items-end justify-center pb-2 z-10">
                <span className="text-[9px] font-bold text-black rotate-90">Mỏ cố định</span>
              </div>

              {/* Main Scale Beam (Horizontal Steel Bar) */}
              <div className="ml-12 h-14 bg-gradient-to-b from-slate-300 via-slate-200 to-slate-400 border border-slate-500 rounded-r shadow-inner relative flex items-center px-2">
                {/* Millimeter Ticks */}
                <div className="absolute inset-0 flex items-start justify-between px-2 pt-1">
                  {Array.from({ length: 51 }).map((_, i) => (
                    <div key={i} className="flex flex-col items-center" style={{ width: '1.9%' }}>
                      <div
                        className={`w-[1px] bg-slate-900 ${
                          i % 10 === 0 ? 'h-5 w-[1.5px]' : i % 5 === 0 ? 'h-3.5' : 'h-2'
                        }`}
                      />
                      {i % 10 === 0 && (
                        <span className="text-[9px] font-mono font-black text-slate-950 mt-0.5">
                          {i}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Measured Object In Jaw */}
              {caliperPos > 0 && (
                <div
                  className="absolute left-12 top-10 h-16 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 rounded shadow-lg border border-amber-300 flex items-center justify-center text-[10px] font-black text-black transition-all"
                  style={{ width: `${Math.min(caliperPos * 6.5, 330)}px` }}
                >
                  <span className="truncate px-1">{objectType}</span>
                </div>
              )}

              {/* Sliding Vernier Scale & Movable Jaw */}
              <div
                className="absolute top-0 h-28 bg-gradient-to-b from-slate-200 via-cyan-100 to-slate-400 border-2 border-[#00D4FF] rounded-b-xl shadow-2xl flex flex-col justify-between transition-all duration-75 z-20"
                style={{
                  left: `${48 + caliperPos * 6.5}px`,
                  width: '140px',
                }}
              >
                {/* Vernier top markings (50 divisions for 0.02mm) */}
                <div className="p-1 bg-[#061830] text-[9px] text-[#00D4FF] font-mono font-bold flex justify-between border-b border-[#00D4FF]/40">
                  <span>0 (Vạch 0)</span>
                  <span>ĐCNN: 0.02 mm</span>
                </div>

                {/* Du Xich Vạch Ticks */}
                <div className="px-1 py-1 flex justify-between items-start bg-slate-300/90">
                  {Array.from({ length: 11 }).map((_, v) => (
                    <div key={v} className="flex flex-col items-center">
                      <div className={`w-[1px] bg-red-600 ${v % 5 === 0 ? 'h-3 w-[1.5px]' : 'h-2'}`} />
                      <span className="text-[8px] font-mono font-bold text-red-900">{v}</span>
                    </div>
                  ))}
                </div>

                {/* Movable bottom jaw */}
                <div className="bg-gradient-to-b from-slate-500 to-slate-700 h-10 rounded-b-xl flex items-center justify-center text-[9px] font-bold text-white">
                  Mỏ di động
                </div>
              </div>
            </div>

            {/* Slider Control for Caliper Position */}
            <div className="mt-8 pt-4 border-t border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                  <Sliders className="h-4 w-4 text-[#00D4FF]" />
                  Điều chỉnh vị trí thước kẹp:
                </span>
                <span className="font-mono text-sm font-black text-[#00D4FF]">
                  {caliperPos.toFixed(2)} mm
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="50"
                step="0.02"
                value={caliperPos}
                onChange={(e) => setCaliperPos(parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#00D4FF]"
              />
            </div>
          </div>

          {/* Magnifier View (Kính lúp zoom vạch trùng) */}
          {magnifierOpen && (
            <div className="rounded-xl border border-cyan-500/40 bg-gradient-to-r from-[#071933] to-[#040D1D] p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#00FFCC] uppercase flex items-center gap-1.5">
                  <Eye className="h-4 w-4" />
                  Kính lúp phóng đại vạch trùng du xích (Vernier Coincidence Loupe)
                </span>
                <span className="text-xs font-mono text-slate-300">
                  Thước chính: <strong className="text-white">{mainScaleReading} mm</strong> + Du xích: <strong className="text-[#00D4FF]">+{fractionalPart.toFixed(2)} mm</strong>
                </span>
              </div>

              <div className="p-3 bg-[#030814] rounded-lg border border-slate-800 flex items-center justify-around font-mono">
                <div className="text-center">
                  <div className="text-[10px] text-slate-400">Phần nguyên (Thước chính)</div>
                  <div className="text-xl font-bold text-white">{mainScaleReading} mm</div>
                </div>
                <div className="text-2xl text-slate-600">+</div>
                <div className="text-center">
                  <div className="text-[10px] text-slate-400">Vạch trùng × 0,02 mm</div>
                  <div className="text-xl font-bold text-[#00D4FF]">
                    {vernierMatchIndex} × 0,02 = {fractionalPart.toFixed(2)} mm
                  </div>
                </div>
                <div className="text-2xl text-slate-600">=</div>
                <div className="text-center">
                  <div className="text-[10px] text-[#00FFCC]">Kết quả lần đo</div>
                  <div className="text-xl font-extrabold text-[#00FFCC]">
                    {caliperPos.toFixed(2)} mm
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <button
              onClick={handleSnapToObject}
              className="flex items-center gap-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 px-4 py-2 text-xs font-bold text-slate-950 shadow-md transition active:scale-95 cursor-pointer"
            >
              <Sparkles className="h-4 w-4" />
              <span>Kẹp vừa khít mẫu {objectType}</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCaliperPos(0)}
                className="flex items-center gap-1 rounded-xl border border-white/10 bg-[#0C1E3C] hover:bg-[#132E58] px-3 py-2 text-xs font-bold text-slate-300"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Mở về 0</span>
              </button>

              <button
                onClick={handleRecordMeasurement}
                className="flex items-center gap-1.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] px-4 py-2 text-xs font-bold text-white shadow-lg transition active:scale-95 cursor-pointer"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>Ghi số liệu vào Bảng 3.1</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right: Data Processing & Uncertainty Report (5 cols) */}
        <div className="lg:col-span-5 space-y-4 rounded-2xl border border-white/10 bg-[#081022] p-5 shadow-2xl">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-200">
              <Table className="h-4 w-4 text-[#00FFCC]" />
              <span>BẢNG 3.1: GHI KẾT QUẢ ĐO ĐƯỜNG KÍNH d (mm)</span>
            </div>
            <button
              onClick={() => setTableData([])}
              className="text-xs text-rose-400 hover:underline"
            >
              Xóa bảng
            </button>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="pb-2">Lần đo</th>
                  <th className="pb-2">d (mm)</th>
                  <th className="pb-2">|d - d̄| (mm)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {tableData.map((row) => {
                  const dev = Math.abs(row.d - dAvgFixed);
                  return (
                    <tr key={row.run} className="text-slate-300">
                      <td className="py-2 text-[#00D4FF] font-bold">Lần {row.run}</td>
                      <td className="py-2 text-white font-bold">{row.d.toFixed(2)}</td>
                      <td className="py-2 text-slate-400">{dev.toFixed(3)}</td>
                    </tr>
                  );
                })}
                {tableData.length === 0 && (
                  <tr>
                    <td colSpan={3} className="py-6 text-center text-slate-500 font-sans">
                      Chưa có số liệu. Bấm "Ghi số liệu vào Bảng 3.1".
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Statistical Uncertainty Calculations Box */}
          <div className="rounded-xl border border-white/10 bg-[#0C1A36] p-4 space-y-2.5 text-xs">
            <div className="font-bold text-[#00D4FF] border-b border-white/10 pb-1.5 flex items-center justify-between">
              <span>XỬ LÝ SAI SỐ CHUẨN GDPT 2018:</span>
              <span className="text-[10px] text-slate-400 font-normal">ĐCNN = 0,02 mm</span>
            </div>

            <div className="space-y-1.5 text-slate-300 font-mono">
              <div className="flex justify-between">
                <span>1. Giá trị trung bình d̄:</span>
                <span className="font-bold text-white">{dAvgFixed.toFixed(2)} mm</span>
              </div>
              <div className="flex justify-between">
                <span>2. Sai số ngẫu nhiên trung bình Δd̄:</span>
                <span className="text-slate-200">{deltaDAvg.toFixed(3)} mm</span>
              </div>
              <div className="flex justify-between">
                <span>3. Sai số dụng cụ Δd_dc:</span>
                <span className="text-slate-200">{dcInstrumentError.toFixed(2)} mm</span>
              </div>
              <div className="flex justify-between">
                <span>4. Sai số tuyệt đối toàn phần Δd:</span>
                <span className="font-bold text-amber-300">{totalDeltaD.toFixed(3)} mm</span>
              </div>
              <div className="flex justify-between">
                <span>5. Sai số tỉ đối δd = (Δd / d̄)·100%:</span>
                <span className="font-bold text-purple-300">{relErrorPercent.toFixed(2)} %</span>
              </div>
            </div>

            {/* Standard Result Box */}
            <div className="mt-3 rounded-lg border border-[#00FFCC]/30 bg-[#062436] p-3 text-center">
              <div className="text-[10px] uppercase font-bold text-slate-400">Cách viết kết quả phép đo chuẩn:</div>
              <div className="mt-1 font-mono text-base font-extrabold text-[#00FFCC]">
                d = {dAvgFixed.toFixed(2)} ± {totalDeltaD.toFixed(2)} (mm)
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
