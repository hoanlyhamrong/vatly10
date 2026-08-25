import React, { useState } from 'react';
import { Activity, Play, Sparkles, Compass, Zap, RotateCw, Orbit, Layers, Bike, Car } from 'lucide-react';
import { KinematicsMotionSim } from '../simulations/KinematicsMotionSim';
import { ProjectileMotionLab } from '../labs/ProjectileMotionLab';
import { NewtonSecondLawSim } from '../simulations/NewtonSecondLawSim';
import { ForceVectorsSim } from '../simulations/ForceVectorsSim';
import { EnergyConservationSim } from '../simulations/EnergyConservationSim';
import { CircularMotionSim } from '../simulations/CircularMotionSim';
import { MomentumCollisionSim } from '../simulations/MomentumCollisionSim';
import { ToyCarSpeedExperimentSim } from '../simulations/ToyCarSpeedExperimentSim';
import { TangentRulerVelocitySim } from '../simulations/TangentRulerVelocitySim';
import { Lesson4IntersectionSimulation } from '../simulations/Lesson4IntersectionSimulation';
import { Lesson4ThreePathsSimulation } from '../simulations/Lesson4ThreePathsSimulation';
import { Lesson4HanoiHaiPhongSimulation } from '../simulations/Lesson4HanoiHaiPhongSimulation';
import { Lesson4BicycleTripSimulation } from '../simulations/Lesson4BicycleTripSimulation';
import { Lesson4CarTripSimulation } from '../simulations/Lesson4CarTripSimulation';

export const SimulationsHubView: React.FC = () => {
  const [activeSim, setActiveSim] = useState<'CAR_TRIP' | 'BICYCLE_TRIP' | 'HANOI_HAIPHONG' | 'THREE_PATHS' | 'INTERSECTION' | 'TANGENT_RULER' | 'TOY_CAR' | 'KINEMATICS' | 'PROJECTILE' | 'NEWTON' | 'FORCE' | 'ENERGY' | 'CIRCULAR' | 'MOMENTUM'>('CAR_TRIP');

  const simCards = [
    {
      id: 'CAR_TRIP',
      title: 'Bài tập 1: Ô tô chạy 3 chặng Tây (6km) - Nam (4km) - Đông (3km) (Bài 4 SGK)',
      chapter: 'Chương II: Động học',
      description: 'Diễn họa 3D ô tô chạy 3 chặng đường phố, tính quãng đường s = 13 km và vectơ độ dịch chuyển tổng hợp d = 5 km theo hướng Tây Nam.',
      icon: Car,
      color: '#00FFCC',
      badge: 'Trang 25 SGK',
    },
    {
      id: 'BICYCLE_TRIP',
      title: 'Hình 4.7: Bạn A đi xe đạp qua trạm xăng, siêu thị, trường học (Bài 4 SGK)',
      chapter: 'Chương II: Động học',
      description: 'Diễn họa 3D chuyển động xe đạp bạn A qua Nhà (0 m), Trạm xăng (400 m), Siêu thị (800 m), Trường học (1200 m). Điền kết quả Bảng 4.1 SGK.',
      icon: Bike,
      color: '#00FFCC',
      badge: 'Trang 24 - 25 SGK',
    },
    {
      id: 'HANOI_HAIPHONG',
      title: 'Bản đồ Việt Nam: Vị trí TP. Hải Phòng so với Hà Nội (Bài 4 SGK)',
      chapter: 'Chương II: Động học',
      description: 'Diễn họa 3D bản đồ địa lí miền Bắc, đường chim bay máy bay từ Hà Nội đến Hải Phòng (vectơ d = 102 km, hướng 105° Đông Nam) và đường bộ cao tốc.',
      icon: Compass,
      color: '#00FFCC',
      badge: 'Trang 22 SGK',
    },
    {
      id: 'THREE_PATHS',
      title: 'Hình 4.6: So sánh s và d của 3 chuyển động (Bài 4 SGK)',
      chapter: 'Chương II: Động học',
      description: 'Diễn họa 3D trực quan Xe máy 1, Người đi bộ 2, Ô tô 3 từ Siêu thị A đến Bưu điện B. So sánh độ lớn độ dịch chuyển d và quãng đường s thực tế.',
      icon: Activity,
      color: '#00FFCC',
      badge: 'Trang 23 - 24 SGK',
    },
    {
      id: 'INTERSECTION',
      title: 'Khởi động: Ngã tư đường 4 hướng Đông, Tây, Nam, Bắc (Bài 4 SGK)',
      chapter: 'Chương II: Động học',
      description: 'Diễn họa 3D ô tô chuyển động qua ngã tư O với 4 hướng, phân tích sự khác nhau giữa Quãng đường s (vô hướng) và Độ dịch chuyển d (vectơ).',
      icon: Compass,
      color: '#00D4FF',
      badge: 'Trang 21 SGK',
    },
    {
      id: 'TANGENT_RULER',
      title: 'Tiếp tuyến mép thước kẻ đo vận tốc tức thời (Bài 5 & 7 SGK)',
      chapter: 'Chương II: Động học',
      description: 'Phương pháp tiếp tuyến mép thước kẻ trên đồ thị d-t, phân tích độ dốc tại các điểm E, C, D, G, H và so sánh độ lớn vận tốc.',
      icon: Layers,
      color: '#00D4FF',
      badge: 'Thực nghiệm SGK',
    },
    {
      id: 'TOY_CAR',
      title: 'Đo tốc độ xe ô tô đồ chơi (Bài 3 SGK)',
      chapter: 'Chương I: Mở đầu',
      description: 'Phương án thí nghiệm đo s và t, đồng hồ bấm giây điện tử, khử sai số ngẫu nhiên qua 5 lần đo và xử lý số liệu.',
      icon: Activity,
      color: '#00FFCC',
      badge: 'Thực nghiệm SGK',
    },
    {
      id: 'KINEMATICS',
      title: 'Chuyển động thẳng biến đổi đều (Kinematics 1D)',
      chapter: 'Chương II: Động học',
      description: 'Điều chỉnh v0, gia tốc a; quan sát quỹ đạo, vector vận tốc & gia tốc, vết chấm stroboscopic và đồ thị x(t), v(t), a(t) trực quan.',
      icon: Activity,
      color: '#00D4FF',
      badge: 'Mới & Tương tác cao',
    },
    {
      id: 'PROJECTILE',
      title: 'Chuyển động ném xiên & ném ngang (Bài 12)',
      chapter: 'Chương II: Động học',
      description: 'Bắn góc 0°-90°, điều chỉnh v0, độ cao h0, môi trường trọng lực Trái Đất/Mặt Trăng/Sao Hỏa, đo tầm xa L và tầm cao Hmax bằng thước kẹp.',
      icon: Compass,
      color: '#00FFCC',
      badge: 'Phòng TN Thực hành',
    },
    {
      id: 'NEWTON',
      title: 'Định luật II Newton & Ma sát (F = m.a)',
      chapter: 'Chương III: Động lực học',
      description: 'Khảo sát quan hệ giữa lực kéo F, khối lượng m, hệ số ma sát μ và gia tốc chuyển động của vật thể.',
      icon: Zap,
      color: '#F59E0B',
      badge: 'Cốt lõi Động lực học',
    },
    {
      id: 'FORCE',
      title: 'Tổng hợp & Phân tích Vectơ Lực',
      chapter: 'Chương III: Động lực học',
      description: 'Quy tắc hình bình hành lực, tổng hợp lực đồng quy F = √(F1² + F2² + 2F1F2 cos α).',
      icon: Layers,
      color: '#A855F7',
      badge: 'Vectơ 2D',
    },
    {
      id: 'ENERGY',
      title: 'Bảo toàn Cơ năng & Con lắc (W = Wd + Wt)',
      chapter: 'Chương V: Năng lượng',
      description: 'Chuyển hóa qua lại giữa thế năng trọng trường Wt và động năng Wd trong hệ kín không ma sát.',
      icon: RotateCw,
      color: '#EC4899',
      badge: 'Định luật Bảo toàn',
    },
    {
      id: 'CIRCULAR',
      title: 'Chuyển động tròn đều & Lực hướng tâm',
      chapter: 'Chương VII: Chuyển động tròn',
      description: 'Tốc độ góc ω, gia tốc hướng tâm a_ht = v²/r = ω²r và vector vận tốc tức thời tiếp tuyến.',
      icon: Orbit,
      color: '#38BDF8',
      badge: 'Cơ học chuyển động quay',
    },
    {
      id: 'MOMENTUM',
      title: 'Động lượng & Va chạm (p = m.v)',
      chapter: 'Chương VI: Động lượng',
      description: 'Khảo sát va chạm đàn hồi và va chạm mềm trên đệm khí không ma sát.',
      icon: Sparkles,
      color: '#34D399',
      badge: 'Va chạm cơ học',
    },
  ];

  return (
    <div id="simulations-hub-view" className="space-y-6">
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0C1528]/80 p-6 shadow-2xl backdrop-blur-md">
        <div className="space-y-1.5 max-w-3xl">
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-[#00D4FF]/15 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-[#00D4FF] border border-[#00D4FF]/30">
              TRUNG TÂM MÔ PHỎNG VẬT LÍ TƯƠNG TÁC
            </span>
            <span className="rounded-md bg-[#00FFCC]/15 px-2.5 py-1 text-xs font-bold text-[#00FFCC] border border-[#00FFCC]/30">
              60 FPS Vector Graphics
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-white sm:text-3xl tracking-tight">
            Mô phỏng Động học & Động lực học Vật lí 10
          </h1>
          <p className="text-xs text-gray-400 leading-relaxed">
            Hệ thống mô phỏng đồ họa thời gian thực, cho phép tự do biến đổi các thông số vật lí, quan sát quỹ đạo, vector lực, vector vận tốc và hệ thống đồ thị trực tiếp.
          </p>
        </div>
      </div>

      {/* Simulation Horizontal Selector Tabs */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-7">
        {simCards.map((card) => {
          const Icon = card.icon;
          const isSelected = activeSim === card.id;
          return (
            <button
              key={card.id}
              onClick={() => setActiveSim(card.id as any)}
              className={`flex flex-col items-start justify-between rounded-xl border p-3 text-left transition-all cursor-pointer ${
                isSelected
                  ? 'border-[#00D4FF] bg-[#00D4FF]/10 shadow-[0_0_15px_rgba(0,212,255,0.2)]'
                  : 'border-white/10 bg-[#0C1528]/60 hover:border-white/20 hover:bg-white/5'
              }`}
            >
              <div className="flex w-full items-center justify-between">
                <Icon
                  className="h-4 w-4"
                  style={{ color: isSelected ? '#00D4FF' : card.color }}
                />
                {isSelected && (
                  <span className="h-1.5 w-1.5 rounded-full bg-[#00D4FF] animate-pulse" />
                )}
              </div>
              <div className="mt-2 text-xs font-bold leading-tight line-clamp-2 text-white">
                {card.title.split('(')[0]}
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Simulation Display */}
      <div className="min-w-0">
        {activeSim === 'CAR_TRIP' && <Lesson4CarTripSimulation />}
        {activeSim === 'BICYCLE_TRIP' && <Lesson4BicycleTripSimulation />}
        {activeSim === 'HANOI_HAIPHONG' && <Lesson4HanoiHaiPhongSimulation />}
        {activeSim === 'THREE_PATHS' && <Lesson4ThreePathsSimulation />}
        {activeSim === 'INTERSECTION' && <Lesson4IntersectionSimulation />}
        {activeSim === 'TANGENT_RULER' && <TangentRulerVelocitySim />}
        {activeSim === 'TOY_CAR' && <ToyCarSpeedExperimentSim />}
        {activeSim === 'KINEMATICS' && <KinematicsMotionSim />}
        {activeSim === 'PROJECTILE' && <ProjectileMotionLab />}
        {activeSim === 'NEWTON' && <NewtonSecondLawSim />}
        {activeSim === 'FORCE' && <ForceVectorsSim />}
        {activeSim === 'ENERGY' && <EnergyConservationSim />}
        {activeSim === 'CIRCULAR' && <CircularMotionSim />}
        {activeSim === 'MOMENTUM' && <MomentumCollisionSim />}
      </div>
    </div>
  );
};
