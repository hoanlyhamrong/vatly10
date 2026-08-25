import React, { useState } from 'react';
import { ErrorAnalysisLab } from './ErrorAnalysisLab';
import { SpeedMeasurementLab } from './SpeedMeasurementLab';
import { FreeFallLab } from './FreeFallLab';
import { ProjectileMotionLab } from './ProjectileMotionLab';
import { ForceAdditionLab } from './ForceAdditionLab';
import { AirTrackCollisionLab } from './AirTrackCollisionLab';

export type LabExperimentId = 
  | 'LAB_BAI_3' 
  | 'LAB_BAI_6' 
  | 'LAB_BAI_11' 
  | 'LAB_BAI_12' 
  | 'LAB_BAI_22' 
  | 'LAB_BAI_30';

interface VirtualPhysicsLabProps {
  initialLabId?: LabExperimentId;
}

export const VirtualPhysicsLab: React.FC<VirtualPhysicsLabProps> = ({
  initialLabId = 'LAB_BAI_6',
}) => {
  const [activeLab, setActiveLab] = useState<LabExperimentId>(initialLabId);

  const labList = [
    {
      id: 'LAB_BAI_3' as LabExperimentId,
      label: 'Bài 3: Thực hành tính sai số (Thước kẹp / Panme)',
      shortTitle: 'Bài 3: Tính sai số',
      badge: 'Thước kẹp 0.02mm',
    },
    {
      id: 'LAB_BAI_6' as LabExperimentId,
      label: 'Bài 6: Đo tốc độ của vật chuyển động (Cổng quang điện)',
      shortTitle: 'Bài 6: Đo tốc độ',
      badge: 'Đồng hồ MC964',
    },
    {
      id: 'LAB_BAI_11' as LabExperimentId,
      label: 'Bài 11: Đo gia tốc rơi tự do (Nam châm điện & Trụ thép)',
      shortTitle: 'Bài 11: Rơi tự do',
      badge: 'Gia tốc g',
    },
    {
      id: 'LAB_BAI_12' as LabExperimentId,
      label: 'Bài 12: Chuyển động ném ngang & ném xiên',
      shortTitle: 'Bài 12: Chuyển động ném',
      badge: 'Quỹ đạo Parabol',
    },
    {
      id: 'LAB_BAI_22' as LabExperimentId,
      label: 'Bài 22: Thực hành tổng hợp lực (Đồng quy & Song song)',
      shortTitle: 'Bài 22: Tổng hợp lực',
      badge: 'Bảng thép & Lực kế',
    },
    {
      id: 'LAB_BAI_30' as LabExperimentId,
      label: 'Bài 30: Đo động lượng trước & sau va chạm (Đệm khí)',
      shortTitle: 'Bài 30: Đo động lượng',
      badge: 'Băng đệm khí',
    },
  ];

  return (
    <div id="virtual-physics-lab-hub" className="space-y-6">
      {/* Master Header Card (Matching User Image 1 & 2 Layout Exactly) */}
      <div className="rounded-3xl border border-white/10 bg-[#071124]/90 p-5 sm:p-7 shadow-[0_10px_35px_rgba(0,0,0,0.6)] backdrop-blur-2xl space-y-5">
        
        {/* Top Header Row with Cyan Vertical Bar and Badge */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <span className="h-6 w-1.5 rounded-full bg-[#00D4FF] shadow-[0_0_10px_rgba(0,212,255,0.8)]"></span>
            <h2 className="text-lg sm:text-2xl font-black text-white uppercase tracking-tight">
              TRUNG TÂM THÍ NGHIỆM ẢO & XỬ LÝ SỐ LIỆU THỰC NGHIỆM (VIRTUAL LAB)
            </h2>
          </div>
          <span className="rounded-full border border-cyan-500/40 bg-cyan-500/10 px-3.5 py-1 text-xs font-extrabold text-[#00FFCC] shadow-sm">
            Thực Hành Chuẩn GDPT 2018
          </span>
        </div>

        {/* Description */}
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-5xl font-medium">
          Mô phỏng chân thực các thí nghiệm thực hành bắt buộc trong chương trình Vật lí 10 với dụng cụ đo ảo, bảng số liệu thực nghiệm tự động ghi nhận và phương pháp xử lý sai số chuẩn hóa.
        </p>

        {/* Experiment Selector Pill Buttons (Horizontal Scrollable) */}
        <div className="flex items-center gap-2.5 overflow-x-auto pb-1 pt-1 no-scrollbar">
          {labList.map((item) => {
            const isActive = activeLab === item.id;
            return (
              <button
                key={item.id}
                id={`btn-lab-${item.id}`}
                onClick={() => setActiveLab(item.id)}
                className={`flex items-center gap-2 rounded-2xl px-4 py-2.5 text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-200 cursor-pointer shrink-0 ${
                  isActive
                    ? 'bg-[#2563EB] text-white shadow-[0_0_20px_rgba(37,99,235,0.5)] font-black border border-blue-400/40 scale-100'
                    : 'border border-white/10 bg-[#0C172E]/80 text-slate-300 hover:border-white/20 hover:bg-[#0E1E3C] hover:text-white'
                }`}
              >
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Render Active Lab Module */}
      <div className="transition-all duration-300">
        {activeLab === 'LAB_BAI_3' && <ErrorAnalysisLab />}
        {activeLab === 'LAB_BAI_6' && <SpeedMeasurementLab />}
        {activeLab === 'LAB_BAI_11' && <FreeFallLab />}
        {activeLab === 'LAB_BAI_12' && <ProjectileMotionLab />}
        {activeLab === 'LAB_BAI_22' && <ForceAdditionLab />}
        {activeLab === 'LAB_BAI_30' && <AirTrackCollisionLab />}
      </div>
    </div>
  );
};
