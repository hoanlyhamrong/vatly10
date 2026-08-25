import React from 'react';
import { InlinePhysicsText } from '../ui/FormattedPhysicsText';
import { Ruler, Scale, Clock, Activity, AlertTriangle, Layers, BookOpen } from 'lucide-react';

export const Lesson3InfographicCard: React.FC = () => {
  return (
    <div className="w-full rounded-3xl border-2 border-cyan-500/40 bg-gradient-to-b from-[#07132B] via-[#091B38] to-[#040C1A] p-4 sm:p-6 lg:p-8 text-white shadow-2xl space-y-6 relative overflow-hidden font-sans">
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#00D4FF_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />

      {/* HEADER BANNER */}
      <div className="text-center space-y-2 border-b border-cyan-500/30 pb-5 relative z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-bold border border-cyan-500/40 uppercase tracking-widest">
          <BookOpen className="h-3.5 w-3.5" />
          Vật Lí 10 • Kết Nối Tri Thức Với Cuộc Sống
        </div>
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight uppercase">
          BÀI 3: SAI SỐ TRONG PHÉP ĐO VÀ GHI KẾT QUẢ ĐO
        </h2>
      </div>

      {/* TOP ROW: PHÉP ĐO TRỰC TIẾP VS GIÁN TIẾP */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
        {/* Phép đo trực tiếp */}
        <div className="rounded-2xl border border-cyan-500/30 bg-[#061226]/90 p-4 sm:p-5 flex flex-col justify-between space-y-3 shadow-md">
          <div className="flex items-center gap-2.5">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-500/20 text-cyan-300 font-bold text-xs border border-cyan-500/30">
              1
            </span>
            <h3 className="text-sm sm:text-base font-black text-cyan-300 uppercase tracking-wide">
              PHÉP ĐO TRỰC TIẾP
            </h3>
          </div>
          <div className="flex items-center justify-between gap-4">
            <ul className="text-xs sm:text-sm text-slate-300 space-y-1.5 list-disc pl-4 marker:text-cyan-400">
              <li>Thước kẻ, thước cuộn, thước kẹp</li>
              <li>Cân đồng hồ, cân điện tử</li>
              <li>Đồng hồ bấm giây, đồng hồ hiện số</li>
            </ul>
            <div className="flex items-center gap-2 text-cyan-400 opacity-90">
              <span className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30"><Scale className="h-5 w-5" /></span>
              <span className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30"><Clock className="h-5 w-5" /></span>
            </div>
          </div>
        </div>

        {/* Phép đo gián tiếp */}
        <div className="rounded-2xl border border-blue-500/30 bg-[#061226]/90 p-4 sm:p-5 flex flex-col justify-between space-y-3 shadow-md">
          <div className="flex items-center gap-2.5">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/20 text-blue-300 font-bold text-xs border border-blue-500/30">
              2
            </span>
            <h3 className="text-sm sm:text-base font-black text-blue-300 uppercase tracking-wide">
              PHÉP ĐO GIÁN TIẾP
            </h3>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs sm:text-sm font-mono">
            <div className="p-2.5 rounded-xl bg-black/40 border border-white/10 text-center space-y-0.5">
              <span className="text-[10px] text-slate-400 font-sans block">Thể tích khối hộp:</span>
              <span className="text-cyan-300 font-bold"><InlinePhysicsText text="$V = a \times b \times c$" /></span>
            </div>
            <div className="p-2.5 rounded-xl bg-black/40 border border-white/10 text-center space-y-0.5">
              <span className="text-[10px] text-slate-400 font-sans block">Gia tốc trọng trường:</span>
              <span className="text-blue-300 font-bold"><InlinePhysicsText text="$g = \frac{4\pi^2 l}{T^2}$" /></span>
            </div>
          </div>
        </div>
      </div>

      {/* MIDDLE ROW: (1) PHÂN LOẠI SAI SỐ (VỚI 2 ĐỒ THỊ PHÂN PHỐI GAUSS) & (2) CÁC LOẠI SAI SỐ CƠ BẢN */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 relative z-10">
        {/* CỘT TRÁI: (1) PHÂN LOẠI SAI SỐ */}
        <div className="lg:col-span-6 rounded-2xl border border-white/15 bg-[#061226]/90 p-4 sm:p-5 space-y-4 shadow-md">
          <div className="flex items-center gap-2 pb-2 border-b border-white/10">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-500 text-black font-bold text-xs">
              1
            </span>
            <h3 className="text-sm sm:text-base font-black text-white uppercase tracking-wide">
              PHÂN LOẠI SAI SỐ
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* SAI SỐ NGẪU NHIÊN */}
            <div className="p-3.5 rounded-xl bg-cyan-950/20 border border-cyan-500/30 space-y-2 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="text-xs font-black text-cyan-300 uppercase tracking-wide flex items-center gap-1.5">
                  <Activity className="h-3.5 w-3.5 text-cyan-400" />
                  SAI SỐ NGẪU NHIÊN
                </div>

                {/* SVG Bell Curve (Chuẩn đối xứng) */}
                <div className="h-20 w-full bg-black/40 rounded-lg p-1 border border-cyan-500/20 flex items-center justify-center">
                  <svg viewBox="0 0 160 70" className="w-full h-full">
                    {/* Axes */}
                    <line x1="10" y1="60" x2="150" y2="60" stroke="#475569" strokeWidth="1.5" />
                    <line x1="80" y1="10" x2="80" y2="60" stroke="#00D4FF" strokeWidth="1" strokeDasharray="2,2" />
                    {/* Gaussian Curve */}
                    <path
                      d="M 15 58 C 45 58 60 15 80 15 C 100 15 115 58 145 58"
                      fill="none"
                      stroke="#00D4FF"
                      strokeWidth="2"
                    />
                    {/* Dots representing random trials */}
                    <circle cx="50" cy="50" r="2" fill="#38BDF8" />
                    <circle cx="65" cy="35" r="2" fill="#38BDF8" />
                    <circle cx="80" cy="15" r="2.5" fill="#F43F5E" />
                    <circle cx="95" cy="38" r="2" fill="#38BDF8" />
                    <circle cx="110" cy="52" r="2" fill="#38BDF8" />
                    <circle cx="75" cy="22" r="2" fill="#38BDF8" />
                    <circle cx="88" cy="26" r="2" fill="#38BDF8" />
                  </svg>
                </div>

                <p className="text-[11px] text-slate-300 leading-snug">
                  Do các yếu tố ngẫu nhiên, không kiểm soát được (thao tác, nhiệt độ, giác quan).
                </p>
                <div className="text-[11px] text-slate-400">
                  <strong className="text-cyan-300">Nguyên nhân:</strong> Thay đổi nhiệt độ, độ ẩm, sai số phản xạ người đọc.
                </div>
              </div>
              <div className="pt-2 border-t border-cyan-500/20 text-[11px] text-cyan-200">
                <strong>Khắc phục:</strong> Đo nhiều lần, lấy giá trị trung bình cộng.
              </div>
            </div>

            {/* SAI SỐ HỆ THỐNG */}
            <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-500/30 space-y-2 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="text-xs font-black text-amber-300 uppercase tracking-wide flex items-center gap-1.5">
                  <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
                  SAI SỐ HỆ THỐNG
                </div>

                {/* SVG Shifted Curve (Lệch một phía) */}
                <div className="h-20 w-full bg-black/40 rounded-lg p-1 border border-amber-500/20 flex items-center justify-center">
                  <svg viewBox="0 0 160 70" className="w-full h-full">
                    {/* Axes */}
                    <line x1="10" y1="60" x2="150" y2="60" stroke="#475569" strokeWidth="1.5" />
                    <line x1="50" y1="10" x2="50" y2="60" stroke="#64748B" strokeWidth="1" strokeDasharray="2,2" />
                    <line x1="95" y1="10" x2="95" y2="60" stroke="#F59E0B" strokeWidth="1.5" strokeDasharray="2,2" />
                    {/* Shifted Curve */}
                    <path
                      d="M 30 58 C 60 58 75 15 95 15 C 115 15 130 58 150 58"
                      fill="none"
                      stroke="#F59E0B"
                      strokeWidth="2"
                    />
                    <circle cx="95" cy="15" r="2.5" fill="#F43F5E" />
                    <circle cx="95" cy="60" r="2" fill="#F43F5E" />
                  </svg>
                </div>

                <p className="text-[11px] text-slate-300 leading-snug">
                  Do dụng cụ đo không chính xác, hỏng hóc hoặc phương pháp đo sai quy chuẩn.
                </p>
                <div className="text-[11px] text-slate-400">
                  <strong className="text-amber-300">Nguyên nhân:</strong> Lệch chuẩn, điểm 0 ban đầu sai, môi trường cố định.
                </div>
              </div>
              <div className="pt-2 border-t border-amber-500/20 text-[11px] text-amber-200">
                <strong>Khắc phục:</strong> Hiệu chuẩn điểm 0, chọn dụng cụ chính xác hơn.
              </div>
            </div>
          </div>
        </div>

        {/* CỘT PHẢI: (2) CÁC LOẠI SAI SỐ CƠ BẢN */}
        <div className="lg:col-span-6 rounded-2xl border border-white/15 bg-[#061226]/90 p-4 sm:p-5 space-y-4 shadow-md flex flex-col justify-between">
          <div className="flex items-center gap-2 pb-2 border-b border-white/10">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500 text-white font-bold text-xs">
              2
            </span>
            <h3 className="text-sm sm:text-base font-black text-white uppercase tracking-wide">
              CÁC LOẠI SAI SỐ CƠ BẢN
            </h3>
          </div>

          {/* Minh họa thước đo ĐCNN */}
          <div className="p-3 rounded-xl bg-black/40 border border-white/10 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-amber-300 flex items-center gap-1.5">
                <Ruler className="h-4 w-4 text-amber-400" />
                Thước đo &amp; Độ chia nhỏ nhất (ĐCNN):
              </span>
              <span className="font-mono text-cyan-300 font-bold">$X \pm \Delta X$</span>
            </div>
            {/* SVG Ruler drawing */}
            <div className="h-10 w-full bg-[#1E293B] rounded-lg relative overflow-hidden border border-slate-600 flex items-end px-3">
              {Array.from({ length: 25 }).map((_, i) => (
                <div
                  key={i}
                  className={`flex-1 border-r border-slate-400 ${i % 5 === 0 ? 'h-6 border-amber-400' : 'h-3'}`}
                />
              ))}
              <div className="absolute top-1 right-4 text-[10px] font-mono text-amber-300">ĐCNN = 1 mm</div>
            </div>
          </div>

          <div className="space-y-3">
            {/* Sai số dụng cụ */}
            <div className="p-3 rounded-xl bg-purple-950/20 border border-purple-500/30 text-xs space-y-1">
              <div className="font-bold text-purple-300 uppercase tracking-wide">
                SAI SỐ DỤNG CỤ (<InlinePhysicsText text="$\Delta A_{dc}$" />)
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                Là sai số liên quan đến độ chính xác của dụng cụ chế tạo.
              </p>
              <div className="text-[11px] text-purple-200 font-medium">
                <strong>Quy tắc thông dụng:</strong> <span className="font-mono text-white font-bold"><InlinePhysicsText text="$\Delta A_{dc} = \frac{1}{2}\text{ ĐCNN}$" /></span> (hoặc <InlinePhysicsText text="$\Delta A_{dc} = 1\text{ ĐCNN}$" /> theo quy ước trường học).
              </div>
            </div>

            {/* Sai số ngẫu nhiên */}
            <div className="p-3 rounded-xl bg-cyan-950/20 border border-cyan-500/30 text-xs space-y-1">
              <div className="font-bold text-cyan-300 uppercase tracking-wide">
                SAI SỐ NGẪU NHIÊN (<InlinePhysicsText text="$\Delta A_{ng} = \overline{\Delta A}$" />)
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                Được xác định bởi <strong>sai số tuyệt đối trung bình</strong> khi đo lường nhiều lần qua công thức:
              </p>
              <div className="font-mono text-cyan-300 font-bold text-[11px]">
                <InlinePhysicsText text="$\Delta A_{ng} = \overline{\Delta A} = \frac{\Delta A_1 + \dots + \Delta A_n}{n}$" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* LOWER ROW: (3) CÔNG THỨC TÍNH TOÁN SAI SỐ & CÁCH GHI KẾT QUẢ */}
      <div className="rounded-2xl border border-white/15 bg-[#061226]/90 p-4 sm:p-5 space-y-4 shadow-md relative z-10">
        <div className="flex items-center gap-2 pb-2 border-b border-white/10">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-black font-bold text-xs">
            3
          </span>
          <h3 className="text-sm sm:text-base font-black text-white uppercase tracking-wide">
            CÔNG THỨC TÍNH TOÁN SAI SỐ &amp; GHI KẾT QUẢ ĐO
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs sm:text-sm">
          <div className="p-3 rounded-xl bg-black/40 border border-cyan-500/20 text-center space-y-1">
            <span className="text-[11px] text-slate-400 block font-sans">Giá trị trung bình:</span>
            <div className="font-mono text-cyan-300 font-bold">
              <InlinePhysicsText text="$\bar{A} = \frac{A_1 + A_2 + \dots + A_n}{n}$" />
            </div>
            <span className="text-[10px] text-slate-500 block">(với n lần đo)</span>
          </div>

          <div className="p-3 rounded-xl bg-black/40 border border-amber-500/20 text-center space-y-1">
            <span className="text-[11px] text-slate-400 block font-sans">Sai số tuyệt đối của phép đo:</span>
            <div className="font-mono text-amber-300 font-bold">
              <InlinePhysicsText text="$\Delta A = \Delta A_{ng} + \Delta A_{dc}$" />
            </div>
            <span className="text-[10px] text-slate-500 block">(Tổng sai số ngẫu nhiên + dụng cụ)</span>
          </div>

          <div className="p-3 rounded-xl bg-black/40 border border-purple-500/20 text-center space-y-1">
            <span className="text-[11px] text-slate-400 block font-sans">Sai số tỉ đối (%):</span>
            <div className="font-mono text-purple-300 font-bold">
              <InlinePhysicsText text="$\delta A = \frac{\Delta A}{\bar{A}} \cdot 100\%$" />
            </div>
            <span className="text-[10px] text-slate-500 block">(Đặc trưng cho độ chính xác)</span>
          </div>

          <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-center space-y-1">
            <span className="text-[11px] text-emerald-300 font-bold block font-sans">Cách ghi kết quả đo chuẩn:</span>
            <div className="font-mono text-emerald-300 font-black text-sm">
              <InlinePhysicsText text="$A = \bar{A} \pm \Delta A$" />
            </div>
            <span className="text-[10px] text-slate-400 block">(hoặc <InlinePhysicsText text="$A = \bar{A} \pm \delta A\%$" />)</span>
          </div>
        </div>
      </div>

      {/* BOTTOM ROW: (4) SAI SỐ CỦA PHÉP ĐO GIÁN TIẾP (QUY TẮC LAN TRUYỀN SAI SỐ) */}
      <div className="rounded-2xl border border-white/15 bg-[#061226]/90 p-4 sm:p-5 space-y-4 shadow-md relative z-10">
        <div className="flex items-center gap-2 pb-2 border-b border-white/10">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-rose-500 text-white font-bold text-xs">
            4
          </span>
          <h3 className="text-sm sm:text-base font-black text-white uppercase tracking-wide">
            SAI SỐ CỦA PHÉP ĐO GIÁN TIẾP (LAN TRUYỀN SAI SỐ)
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {/* Tổng */}
          <div className="p-3.5 rounded-xl bg-black/40 border border-cyan-500/20 space-y-2 text-center">
            <div className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-bold text-[11px] inline-block font-mono">
              <InlinePhysicsText text="$F = A + B$" />
            </div>
            <div className="font-mono text-cyan-300 font-bold text-sm">
              <InlinePhysicsText text="$\Delta F = \Delta A + \Delta B$" />
            </div>
            <p className="text-[11px] text-slate-300">
              Sai số tuyệt đối của tổng bằng tổng các sai số tuyệt đối.
            </p>
          </div>

          {/* Hiệu */}
          <div className="p-3.5 rounded-xl bg-black/40 border border-blue-500/20 space-y-2 text-center">
            <div className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-bold text-[11px] inline-block font-mono">
              <InlinePhysicsText text="$F = A - B$" />
            </div>
            <div className="font-mono text-blue-300 font-bold text-sm">
              <InlinePhysicsText text="$\Delta F = \Delta A + \Delta B$" />
            </div>
            <p className="text-[11px] text-slate-300">
              Sai số tuyệt đối của hiệu bằng tổng các sai số tuyệt đối.
            </p>
          </div>

          {/* Tích */}
          <div className="p-3.5 rounded-xl bg-black/40 border border-amber-500/20 space-y-2 text-center">
            <div className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold text-[11px] inline-block font-mono">
              <InlinePhysicsText text="$F = A \times B$" />
            </div>
            <div className="font-mono text-amber-300 font-bold text-sm">
              <InlinePhysicsText text="$\delta F = \delta A + \delta B$" />
            </div>
            <p className="text-[11px] text-slate-300">
              Sai số tỉ đối của tích bằng tổng các sai số tỉ đối.
            </p>
          </div>

          {/* Thương */}
          <div className="p-3.5 rounded-xl bg-black/40 border border-purple-500/20 space-y-2 text-center">
            <div className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-bold text-[11px] inline-block font-mono">
              <InlinePhysicsText text="$F = \frac{A}{B}$" />
            </div>
            <div className="font-mono text-purple-300 font-bold text-sm">
              <InlinePhysicsText text="$\delta F = \delta A + \delta B$" />
            </div>
            <p className="text-[11px] text-slate-300">
              Sai số tỉ đối của thương bằng tổng các sai số tỉ đối.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
