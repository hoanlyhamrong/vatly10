import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Plane,
  Compass,
  MapPin,
  Sparkles,
  Info,
  CheckCircle2,
  Volume2,
  VolumeX,
  Layers,
  TrendingUp,
  Navigation,
  Check,
  Eye,
  Sliders,
  Car
} from 'lucide-react';
import { InlinePhysicsText } from '../ui/FormattedPhysicsText';

export const Lesson4HanoiHaiPhongSimulation: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0); // 0 (Hanoi) to 1 (Hai Phong)
  const [flightDirection, setFlightDirection] = useState<'HN_TO_HP' | 'HP_TO_HN'>('HN_TO_HP');
  const [animSpeed, setAnimSpeed] = useState<number>(1);
  const [showHighwayCar, setShowHighwayCar] = useState<boolean>(true);
  const [showGridCoords, setShowGridCoords] = useState<boolean>(true);
  const [showVectorD, setShowVectorD] = useState<boolean>(true);
  const [showAngleProtractor, setShowAngleProtractor] = useState<boolean>(true);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [viewMode, setViewMode] = useState<'MAP_TERRAIN' | 'RADAR_CLEAN'>('MAP_TERRAIN');

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);

  // Sound generator
  const playSoundEffect = (type: 'jet' | 'arrive' | 'click') => {
    if (!soundEnabled) return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      if (type === 'jet') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(80, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(140, ctx.currentTime + 0.3);
        gain.gain.setValueAtTime(0.05, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      } else if (type === 'arrive') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
        osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1); // E5
        osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.2); // G5
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.45);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.45);
      } else if (type === 'click') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        gain.gain.setValueAtTime(0.04, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.05);
      }
    } catch (e) {
      // AudioContext policy
    }
  };

  // Coordinates on Canvas 800 x 480
  // Map Region: Northern Vietnam (from Hà Giang/Lào Cai down to Hà Tĩnh/Quảng Bình)
  // Hanoi: 21°02' N, 105°51' E -> Canvas (x: 350, y: 195)
  // Hai Phong: 20°51' N, 106°41' E -> Canvas (x: 555, y: 228)
  const hanoiPos = { x: 350, y: 195 };
  const haiphongPos = { x: 555, y: 228 };

  // Highway Hanoi - Hai Phong (CT04 / QL5: Hanoi -> Hung Yen -> Hai Duong -> Hai Phong)
  const highwayWaypoints = [
    { x: 350, y: 195 }, // Hanoi (Nut giao Co Linh / Long Bien)
    { x: 385, y: 215 }, // Gia Lam / Hung Yen
    { x: 440, y: 232 }, // Yen My / Hai Duong border
    { x: 495, y: 230 }, // Hai Duong / Gia Loc
    { x: 555, y: 228 }  // Hai Phong (Nut giao Dinh Vu)
  ];

  // Straight line air distance ~ 102 km
  // Highway road distance ~ 120 km
  const airDistanceKm = 102;
  const highwayDistanceKm = 120;

  // Animation Loop
  useEffect(() => {
    if (!isPlaying) {
      lastTimeRef.current = null;
      return;
    }

    const durationMs = 6000 / animSpeed;

    const animate = (timestamp: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = timestamp;
      const deltaTime = timestamp - lastTimeRef.current;
      lastTimeRef.current = timestamp;

      setProgress((prev) => {
        const next = prev + deltaTime / durationMs;
        if (next >= 1) {
          setIsPlaying(false);
          playSoundEffect('arrive');
          return 1;
        }
        return next;
      });

      animFrameRef.current = requestAnimationFrame(animate);
    };

    animFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isPlaying, animSpeed]);

  // Main Canvas Rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);

    // 1. BACKGROUND / SEA COLOR (Vịnh Bắc Bộ & Biển Đông)
    ctx.fillStyle = viewMode === 'MAP_TERRAIN' ? '#0E3A5A' : '#07152B';
    ctx.fillRect(0, 0, w, h);

    // Subtle wave texture in sea
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.12)';
    ctx.lineWidth = 1;
    for (let sy = 120; sy < h; sy += 35) {
      ctx.beginPath();
      ctx.moveTo(520, sy);
      ctx.bezierCurveTo(600, sy - 8, 680, sy + 8, w, sy);
      ctx.stroke();
    }

    // 2. MAINLAND VIETNAM & NORTHERN REGION (Phần đất liền từ Hà Tĩnh trở ra Bắc)
    ctx.save();
    ctx.fillStyle = viewMode === 'MAP_TERRAIN' ? '#1E3A24' : '#0B2342';
    ctx.strokeStyle = '#22C55E';
    ctx.lineWidth = 2;

    // Draw realistic coastline & boundary of Northern Vietnam
    ctx.beginPath();
    // Northwest border (Lao Cai, Lai Chau, Ha Giang, Cao Bang, Lang Son)
    ctx.moveTo(60, 40);
    ctx.lineTo(160, 30);
    ctx.lineTo(260, 35); // Ha Giang
    ctx.lineTo(380, 45); // Cao Bang
    ctx.lineTo(490, 70); // Lang Son border
    ctx.lineTo(590, 110); // Quang Ninh (Mong Cai border)
    // Coastline of Quang Ninh (Ha Long Bay islands)
    ctx.bezierCurveTo(610, 150, 580, 175, 570, 195);
    // Hai Phong Coast (Do Son, Cat Ba)
    ctx.lineTo(565, 235);
    ctx.bezierCurveTo(555, 250, 545, 260, 530, 275); // Thai Binh coast
    // Nam Dinh / Ninh Binh (Kim Son) coast
    ctx.bezierCurveTo(510, 300, 485, 320, 460, 340);
    // Thanh Hoa (Sam Son, Tinh Gia) coast
    ctx.bezierCurveTo(440, 360, 415, 390, 390, 415);
    // Nghe An (Cua Lo) & Ha Tinh (Vung Ang / Deo Ngang)
    ctx.bezierCurveTo(370, 440, 350, 465, 330, 480);
    // Southern cut line (Ha Tinh - Quang Binh border)
    ctx.lineTo(180, 480);
    // Vietnam - Laos western border
    ctx.lineTo(190, 420); // Western Nghe An
    ctx.lineTo(210, 350); // Western Thanh Hoa
    ctx.lineTo(170, 280); // Son La / Hoa Binh
    ctx.lineTo(90, 210);  // Dien Bien
    ctx.lineTo(60, 110);  // Lai Chau
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Red River Delta highlight (Đồng bằng Sông Hồng - màu đất phù sa xanh tươi)
    ctx.fillStyle = viewMode === 'MAP_TERRAIN' ? '#295B35' : '#103058';
    ctx.beginPath();
    ctx.moveTo(310, 160); // Viet Tri / Phu Tho
    ctx.lineTo(410, 150); // Bac Giang
    ctx.lineTo(530, 190); // Quang Ninh
    ctx.lineTo(560, 240); // Hai Phong
    ctx.lineTo(520, 285); // Thai Binh / Nam Dinh
    ctx.lineTo(440, 310); // Ninh Binh
    ctx.lineTo(330, 240); // Ha Nam / Hoa Binh
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // 3. ISLANDS (Cát Bà, Bạch Long Vĩ, Vịnh Hạ Long)
    // Cát Bà Island
    ctx.fillStyle = '#166534';
    ctx.beginPath();
    ctx.ellipse(590, 230, 14, 8, Math.PI / 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#4ADE80';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Bạch Long Vĩ Island (Out in Gulf of Tonkin)
    ctx.fillStyle = '#FACC15';
    ctx.beginPath();
    ctx.arc(660, 280, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 9px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('Đ. Bạch Long Vĩ', 670, 283);

    // 4. MAJOR RIVERS (Sông Hồng, Sông Thái Bình, Sông Mã, Sông Lam)
    ctx.strokeStyle = '#38BDF8';
    ctx.lineWidth = 2.5;
    // Sông Hồng (chảy qua Hà Nội ra biển Ba Lạt)
    ctx.beginPath();
    ctx.moveTo(250, 70); // Yen Bai
    ctx.quadraticCurveTo(310, 140, 350, 195); // to Hanoi
    ctx.bezierCurveTo(385, 230, 450, 270, 515, 305); // to Nam Dinh/Thai Binh estuary
    ctx.stroke();

    // Sông Cấm / Sông Bạch Đằng qua Hải Phòng
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(430, 180);
    ctx.quadraticCurveTo(490, 205, 555, 228);
    ctx.lineTo(580, 232);
    ctx.stroke();

    // 5. GEOGRAPHIC COORDINATE GRID & PARALLELS/MERIDIANS (Hệ tọa độ địa lí)
    if (showGridCoords) {
      ctx.save();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);

      // Latitudes (Vĩ tuyến: 18°N, 19°N, 20°N, 21°N, 22°N)
      const lats = [
        { label: '22°B', y: 85 },
        { label: '21°B (Hà Nội)', y: 195 },
        { label: '20°B (Hải Phòng ~20°51\'B)', y: 240 },
        { label: '19°B (Thanh Hóa / Nghệ An)', y: 350 },
        { label: '18°B (Hà Tĩnh)', y: 450 },
      ];

      lats.forEach((lat) => {
        ctx.beginPath();
        ctx.moveTo(40, lat.y);
        ctx.lineTo(760, lat.y);
        ctx.stroke();

        ctx.fillStyle = '#94A3B8';
        ctx.font = '9px monospace';
        ctx.textAlign = 'right';
        ctx.fillText(lat.label, w - 15, lat.y - 3);
      });

      // Longitudes (Kinh tuyến: 104°E, 105°E, 106°E, 107°E, 108°E)
      const lons = [
        { label: '104°Đ', x: 140 },
        { label: '105°Đ', x: 270 },
        { label: '106°Đ (Hà Nội: 105°51\'Đ)', x: 350 },
        { label: '107°Đ (Hải Phòng: 106°41\'Đ)', x: 555 },
        { label: '108°Đ (Vịnh Bắc Bộ)', x: 670 },
      ];

      lons.forEach((lon) => {
        ctx.beginPath();
        ctx.moveTo(lon.x, 30);
        ctx.lineTo(lon.x, h - 30);
        ctx.stroke();

        ctx.fillStyle = '#94A3B8';
        ctx.font = '9px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(lon.label, lon.x, h - 12);
      });

      ctx.restore();
    }

    // 6. PROVINCE & CITY LABELS (Định vị các tỉnh thành miền Bắc)
    const drawCityDot = (x: number, y: number, name: string, isMajor = false, color = '#E2E8F0') => {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(x, y, isMajor ? 5 : 3, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = isMajor ? '#FFFFFF' : '#CBD5E1';
      ctx.font = isMajor ? 'bold 11px sans-serif' : '10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(name, x, y - 8);
    };

    drawCityDot(520, 160, 'Quảng Ninh (Hạ Long)');
    drawCityDot(440, 215, 'Hải Dương');
    drawCityDot(395, 240, 'Hưng Yên');
    drawCityDot(460, 290, 'Nam Định');
    drawCityDot(415, 310, 'Ninh Bình');
    drawCityDot(380, 360, 'Thanh Hóa');
    drawCityDot(320, 420, 'Nghệ An (Vinh)');
    drawCityDot(270, 460, 'Hà Tĩnh');

    // Gulf of Tonkin Watermark
    ctx.fillStyle = 'rgba(56, 189, 248, 0.3)';
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('VỊNH BẮC BỘ', 640, 180);

    // 7. HIGHWAY HN - HP (ĐƯỜNG BỘ CAO TỐC CT04)
    ctx.save();
    ctx.strokeStyle = '#F59E0B';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(highwayWaypoints[0].x, highwayWaypoints[0].y);
    for (let i = 1; i < highwayWaypoints.length; i++) {
      ctx.lineTo(highwayWaypoints[i].x, highwayWaypoints[i].y);
    }
    ctx.stroke();

    // Highway label
    ctx.fillStyle = '#F59E0B';
    ctx.font = 'bold 10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Cao tốc HN - HP (s ≈ 120 km)', 455, 250);
    ctx.restore();

    // 8. DISPLACEMENT VECTOR d / FLIGHT PATH (ĐƯỜNG CHIM BAY)
    if (showVectorD) {
      ctx.save();
      ctx.strokeStyle = '#00FFCC';
      ctx.lineWidth = 3.5;
      ctx.setLineDash([8, 5]);

      ctx.beginPath();
      ctx.moveTo(hanoiPos.x, hanoiPos.y);
      ctx.lineTo(haiphongPos.x, haiphongPos.y);
      ctx.stroke();
      ctx.setLineDash([]);

      // Arrow head towards Hai Phong (or Hanoi if reversed)
      const targetPos = flightDirection === 'HN_TO_HP' ? haiphongPos : hanoiPos;
      const originPos = flightDirection === 'HN_TO_HP' ? hanoiPos : haiphongPos;
      const angle = Math.atan2(targetPos.y - originPos.y, targetPos.x - originPos.x);

      ctx.fillStyle = '#00FFCC';
      ctx.beginPath();
      ctx.moveTo(targetPos.x, targetPos.y);
      ctx.lineTo(targetPos.x - 14 * Math.cos(angle - Math.PI / 6), targetPos.y - 14 * Math.sin(angle - Math.PI / 6));
      ctx.lineTo(targetPos.x - 14 * Math.cos(angle + Math.PI / 6), targetPos.y - 14 * Math.sin(angle + Math.PI / 6));
      ctx.closePath();
      ctx.fill();

      // Vector Label badge
      const midX = (hanoiPos.x + haiphongPos.x) / 2;
      const midY = (hanoiPos.y + haiphongPos.y) / 2 - 16;
      ctx.fillStyle = 'rgba(8, 18, 38, 0.9)';
      ctx.strokeStyle = '#00FFCC';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(midX - 85, midY - 14, 170, 26, 6);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#00FFCC';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Đường chim bay d = 102 km', midX, midY + 3);
      ctx.restore();
    }

    // 9. PROTRACTOR / BEARING ANGLE AT HANOI (Góc lệch 105° Đông Nam)
    if (showAngleProtractor) {
      ctx.save();
      const r = 48;
      // North reference dashed line
      ctx.strokeStyle = '#EF4444';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 3]);
      ctx.beginPath();
      ctx.moveTo(hanoiPos.x, hanoiPos.y);
      ctx.lineTo(hanoiPos.x, hanoiPos.y - r - 15);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = '#EF4444';
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Bắc (0°)', hanoiPos.x, hanoiPos.y - r - 18);

      // East reference line
      ctx.strokeStyle = '#38BDF8';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 3]);
      ctx.beginPath();
      ctx.moveTo(hanoiPos.x, hanoiPos.y);
      ctx.lineTo(hanoiPos.x + r + 15, hanoiPos.y);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = '#38BDF8';
      ctx.fillText('Đông (90°)', hanoiPos.x + r + 30, hanoiPos.y + 4);

      // Arc for angle 105° (Clockwise from North to Vector d)
      const vectorAngle = Math.atan2(haiphongPos.y - hanoiPos.y, haiphongPos.x - hanoiPos.x); // approx +9.1° from East -> 99° from North
      ctx.strokeStyle = '#FACC15';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(hanoiPos.x, hanoiPos.y, r, -Math.PI / 2, vectorAngle);
      ctx.stroke();

      // Angle badge
      ctx.fillStyle = '#FACC15';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('Góc lệch ~ 105° (Đông Nam)', hanoiPos.x + 18, hanoiPos.y - 12);
      ctx.restore();
    }

    // 10. HANOI & HAI PHONG MAIN HUBS / PINS
    // A) THỦ ĐÔ HÀ NỘI (Origin)
    ctx.save();
    // Yellow pulsing beacon
    ctx.fillStyle = 'rgba(239, 68, 68, 0.35)';
    ctx.beginPath();
    ctx.arc(hanoiPos.x, hanoiPos.y, 22, 0, Math.PI * 2);
    ctx.fill();

    // Red Hub
    ctx.fillStyle = '#DC2626';
    ctx.beginPath();
    ctx.arc(hanoiPos.x, hanoiPos.y, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#FDE047';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Hanoi Star
    ctx.fillStyle = '#FDE047';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('★', hanoiPos.x, hanoiPos.y + 4);

    // Hanoi Tag
    ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
    ctx.strokeStyle = '#EF4444';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(hanoiPos.x - 65, hanoiPos.y + 14, 130, 24, 6);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 11px sans-serif';
    ctx.fillText('THỦ ĐÔ HÀ NỘI (O)', hanoiPos.x, hanoiPos.y + 30);
    ctx.restore();

    // B) THÀNH PHỐ HẢI PHÒNG (Destination)
    ctx.save();
    ctx.fillStyle = 'rgba(6, 182, 212, 0.35)';
    ctx.beginPath();
    ctx.arc(haiphongPos.x, haiphongPos.y, 20, 0, Math.PI * 2);
    ctx.fill();

    // Cyan Hub
    ctx.fillStyle = '#0891B2';
    ctx.beginPath();
    ctx.arc(haiphongPos.x, haiphongPos.y, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#67E8F9';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Hai Phong Tag
    ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
    ctx.strokeStyle = '#00D4FF';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(haiphongPos.x - 70, haiphongPos.y + 14, 140, 24, 6);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#00FFCC';
    ctx.font = 'bold 11px sans-serif';
    ctx.fillText('TP. HẢI PHÒNG (Đích)', haiphongPos.x, haiphongPos.y + 30);
    ctx.restore();

    // 11. CAR RUNNING ON HIGHWAY (If enabled)
    if (showHighwayCar) {
      const highwayT = progress;
      const totalSegs = highwayWaypoints.length - 1;
      const segIndex = Math.min(totalSegs - 1, Math.floor(highwayT * totalSegs));
      const segT = (highwayT * totalSegs) - segIndex;
      const p1 = highwayWaypoints[segIndex];
      const p2 = highwayWaypoints[segIndex + 1];

      const carX = p1.x + (p2.x - p1.x) * segT;
      const carY = p1.y + (p2.y - p1.y) * segT;
      const carAngle = Math.atan2(p2.y - p1.y, p2.x - p1.x);

      ctx.save();
      ctx.translate(carX, carY);
      ctx.rotate(carAngle);

      // Car body
      ctx.fillStyle = '#F59E0B';
      ctx.beginPath();
      ctx.roundRect(-10, -5, 20, 10, 3);
      ctx.fill();
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Windshield
      ctx.fillStyle = '#38BDF8';
      ctx.fillRect(1, -3.5, 4, 7);

      // Car label
      ctx.rotate(-carAngle);
      ctx.fillStyle = '#FDE047';
      ctx.font = 'bold 9px sans-serif';
      ctx.fillText('🚗 Ô tô (Đường bộ s)', 0, -10);
      ctx.restore();
    }

    // 12. 3D AIRPLANE FLYING ALONG STRAIGHT VECTOR d (ĐƯỜNG CHIM BAY)
    const t = progress;
    const planeX = hanoiPos.x + (haiphongPos.x - hanoiPos.x) * t;
    const planeY = hanoiPos.y + (haiphongPos.y - hanoiPos.y) * t;
    const planeHeading = Math.atan2(haiphongPos.y - hanoiPos.y, haiphongPos.x - hanoiPos.x);

    // Contrail vapor trail behind airplane
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.lineWidth = 3;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(hanoiPos.x, hanoiPos.y);
    ctx.lineTo(planeX, planeY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Airplane 3D Drawing
    ctx.translate(planeX, planeY);
    ctx.rotate(planeHeading);

    // Airplane Shadow (Offset down-right)
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.beginPath();
    ctx.ellipse(-2, 16, 18, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Fuselage (White/Silver Passenger Jet)
    ctx.fillStyle = '#FFFFFF';
    ctx.strokeStyle = '#0284C7';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.ellipse(0, 0, 20, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Nose cone
    ctx.fillStyle = '#0284C7';
    ctx.beginPath();
    ctx.arc(18, 0, 3.5, -Math.PI / 2, Math.PI / 2);
    ctx.fill();

    // Wings (Main delta wings)
    ctx.fillStyle = '#E2E8F0';
    ctx.beginPath();
    ctx.moveTo(4, 0);
    ctx.lineTo(-8, -22); // Left wing tip
    ctx.lineTo(-12, -22);
    ctx.lineTo(-6, 0);
    ctx.lineTo(-12, 22); // Right wing tip
    ctx.lineTo(-8, 22);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#0284C7';
    ctx.stroke();

    // Jet Engines
    ctx.fillStyle = '#475569';
    ctx.fillRect(-4, -10, 8, 3.5);
    ctx.fillRect(-4, 6.5, 8, 3.5);

    // Tail Fin & Stabilizers
    ctx.fillStyle = '#DC2626'; // Vietnam Red Tail Flag
    ctx.beginPath();
    ctx.moveTo(-14, 0);
    ctx.lineTo(-24, 0);
    ctx.lineTo(-20, -10);
    ctx.closePath();
    ctx.fill();

    // Horizontal stabilizers
    ctx.fillStyle = '#CBD5E1';
    ctx.beginPath();
    ctx.moveTo(-16, 0);
    ctx.lineTo(-22, -10);
    ctx.lineTo(-22, 10);
    ctx.closePath();
    ctx.fill();

    // Airplane HUD Tag
    ctx.rotate(-planeHeading);
    ctx.fillStyle = '#00FFCC';
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('✈️ Máy bay (Độ dịch chuyển d)', 0, -26);
    ctx.restore();

    // 13. COMPASS ROSE (Top-Left)
    const cx = 70;
    const cy = 60;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.fillStyle = '#0B1528';
    ctx.strokeStyle = '#38BDF8';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, 0, 26, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // 4 Compass points
    ctx.fillStyle = '#EF4444'; // North
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, -22);
    ctx.lineTo(5, -4);
    ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, -22);
    ctx.lineTo(-5, -4);
    ctx.fill();

    // South
    ctx.fillStyle = '#64748B';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, 22);
    ctx.lineTo(5, 4);
    ctx.fill();

    // East
    ctx.fillStyle = '#38BDF8';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(22, 0);
    ctx.lineTo(4, 5);
    ctx.fill();

    // West
    ctx.fillStyle = '#94A3B8';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-22, 0);
    ctx.lineTo(-4, 5);
    ctx.fill();

    // Labels
    ctx.font = 'bold 10px sans-serif';
    ctx.fillStyle = '#EF4444';
    ctx.fillText('B (Bắc)', -16, -28);
    ctx.fillStyle = '#38BDF8';
    ctx.fillText('Đ', 28, 4);
    ctx.fillStyle = '#94A3B8';
    ctx.fillText('T', -36, 4);
    ctx.fillStyle = '#64748B';
    ctx.fillText('N', -4, 36);

    // Southeast Indicator Arrow
    ctx.strokeStyle = '#FACC15';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(16, 16);
    ctx.stroke();
    ctx.fillStyle = '#FACC15';
    ctx.font = 'bold 9px sans-serif';
    ctx.fillText('ĐN', 18, 20);
    ctx.restore();

    // 14. MAP SCALE RULER (Bottom-Left)
    const rx = 40;
    const ry = h - 25;
    const rw = 100; // 100px = 50 km
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(rx, ry);
    ctx.lineTo(rx + rw, ry);
    ctx.moveTo(rx, ry - 5);
    ctx.lineTo(rx, ry + 5);
    ctx.moveTo(rx + rw, ry - 5);
    ctx.lineTo(rx + rw, ry + 5);
    ctx.stroke();

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('Tỉ xích: 1 cm ≈ 20 km (Thước đo 50 km)', rx, ry - 8);

  }, [progress, viewMode, showGridCoords, showVectorD, showAngleProtractor, showHighwayCar, flightDirection]);

  const handleStart = () => {
    if (progress >= 1) setProgress(0);
    setIsPlaying(true);
    playSoundEffect('jet');
  };

  const handlePause = () => {
    setIsPlaying(false);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setProgress(0);
    playSoundEffect('click');
  };

  return (
    <div className="rounded-2xl border border-cyan-500/30 bg-gradient-to-b from-[#081226] via-[#0B1A38] to-[#060D1E] p-4 sm:p-6 shadow-2xl space-y-5">
      {/* 1. HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#00FFCC]">
            <Sparkles className="h-4 w-4 text-[#00D4FF]" />
            <span>Mô Phỏng 3D Bản Đồ Địa Lí & Đường Chim Bay</span>
            <span className="text-gray-500">•</span>
            <span className="text-amber-400">Trang 22 SGK Vật lí 10</span>
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
            <span>Xác định Vị trí TP. Hải Phòng so với Thủ đô Hà Nội</span>
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              soundEnabled
                ? 'border-cyan-500/40 bg-cyan-950/40 text-cyan-300 hover:bg-cyan-900/60'
                : 'border-white/10 bg-slate-800 text-gray-400'
            }`}
            title="Bật/Tắt âm thanh"
          >
            {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            <span className="hidden sm:inline">{soundEnabled ? 'Bật âm' : 'Tắt âm'}</span>
          </button>
        </div>
      </div>

      {/* 2. CANVAS VIEWPORT (Northern Vietnam Map) */}
      <div className="relative w-full h-[380px] sm:h-[480px] rounded-2xl overflow-hidden border border-cyan-500/30 bg-[#0A1A2F] shadow-inner flex items-center justify-center">
        <canvas
          ref={canvasRef}
          width={800}
          height={480}
          className="w-full h-full object-contain"
        />

        {/* Live Controls Overlay (Top-Right) */}
        <div className="absolute top-3 right-3 flex flex-col gap-1.5 bg-black/85 p-3 rounded-xl border border-cyan-500/40 backdrop-blur-md text-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-cyan-300 border-b border-white/10 pb-1 flex items-center gap-1.5">
            <Layers className="h-3.5 w-3.5 text-[#00FFCC]" />
            <span>Lớp Bản Đồ & Tùy Chọn:</span>
          </div>

          <label className="flex items-center gap-2 text-[#00FFCC] font-bold cursor-pointer select-none">
            <input
              type="checkbox"
              checked={showVectorD}
              onChange={(e) => setShowVectorD(e.target.checked)}
              className="accent-[#00FFCC] cursor-pointer"
            />
            <span>Hiện Vectơ d (Đường chim bay)</span>
          </label>

          <label className="flex items-center gap-2 text-amber-300 text-[11px] cursor-pointer select-none">
            <input
              type="checkbox"
              checked={showHighwayCar}
              onChange={(e) => setShowHighwayCar(e.target.checked)}
              className="accent-amber-400 cursor-pointer"
            />
            <span>Hiện Cao tốc & Ô tô (Đường bộ s)</span>
          </label>

          <label className="flex items-center gap-2 text-yellow-300 text-[11px] cursor-pointer select-none">
            <input
              type="checkbox"
              checked={showAngleProtractor}
              onChange={(e) => setShowAngleProtractor(e.target.checked)}
              className="accent-yellow-400 cursor-pointer"
            />
            <span>Hiện Thước đo góc (105° Đông Nam)</span>
          </label>

          <label className="flex items-center gap-2 text-gray-300 text-[11px] cursor-pointer select-none">
            <input
              type="checkbox"
              checked={showGridCoords}
              onChange={(e) => setShowGridCoords(e.target.checked)}
              className="accent-cyan-400 cursor-pointer"
            />
            <span>Hiện Lưới Kinh - Vĩ tuyến Địa lí</span>
          </label>
        </div>

        {/* Live Flight Radar HUD (Bottom-Right) */}
        <div className="absolute bottom-3 right-3 bg-black/85 p-3 rounded-xl border border-cyan-500/40 backdrop-blur-md text-xs space-y-1.5 shadow-xl max-w-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-cyan-300 border-b border-white/10 pb-1 flex justify-between">
            <span className="flex items-center gap-1.5">
              <Plane className="h-3.5 w-3.5 text-[#00FFCC]" />
              <span>Dữ liệu Chuyến bay Trực tiếp:</span>
            </span>
            <span className="text-amber-400 font-mono">{(progress * 100).toFixed(0)}%</span>
          </div>

          <div className="space-y-1 font-mono text-[11px]">
            <div className="flex justify-between items-center text-[#00FFCC]">
              <span>Độ dịch chuyển d (Bay):</span>
              <span className="font-bold">{(airDistanceKm * progress).toFixed(1)} / {airDistanceKm} km</span>
            </div>
            <div className="flex justify-between items-center text-amber-300">
              <span>Quãng đường s (Cao tốc):</span>
              <span className="font-bold">{(highwayDistanceKm * progress).toFixed(1)} / {highwayDistanceKm} km</span>
            </div>
            <div className="flex justify-between items-center text-yellow-300">
              <span>Phương vị (Heading):</span>
              <span className="font-bold">105° (Đông - Đông Nam)</span>
            </div>
            <div className="flex justify-between items-center text-gray-300 border-t border-white/10 pt-1 text-[10px]">
              <span>Vận tốc máy bay (v):</span>
              <span className="font-bold text-white">600 km/h (≈ 10 phút)</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. PLAYBACK CONTROLS & COMPARISON */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Controls */}
        <div className="rounded-xl border border-white/10 bg-[#0C1528] p-4 flex flex-col justify-between space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-cyan-300">
            Điều khiển Chuyến Bay:
          </span>
          <div className="flex items-center gap-2">
            {!isPlaying ? (
              <button
                onClick={handleStart}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-black font-bold text-sm shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
              >
                <Play className="h-4 w-4 fill-current" />
                <span>Cho Máy Bay Cất Cánh</span>
              </button>
            ) : (
              <button
                onClick={handlePause}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-sm shadow-lg transition-all cursor-pointer"
              >
                <Pause className="h-4 w-4 fill-current" />
                <span>Tạm Dừng</span>
              </button>
            )}

            <button
              onClick={handleReset}
              className="p-2.5 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-white transition-colors cursor-pointer"
              title="Đặt lại về Thủ đô Hà Nội"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>

          {/* Speed Toggle */}
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>Tốc độ mô phỏng:</span>
            <div className="flex gap-1">
              {[0.5, 1, 2, 4].map((spd) => (
                <button
                  key={spd}
                  onClick={() => setAnimSpeed(spd)}
                  className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                    animSpeed === spd
                      ? 'bg-cyan-500 text-black'
                      : 'bg-white/5 text-gray-300 hover:bg-white/10'
                  }`}
                >
                  {spd}x
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Scientific Comparison Card */}
        <div className="md:col-span-2 rounded-xl border border-white/10 bg-[#0C1528] p-4 space-y-2.5">
          <div className="flex justify-between items-center text-xs font-bold text-gray-300">
            <span className="text-[#00D4FF] flex items-center gap-1.5">
              <TrendingUp className="h-3.5 w-3.5" />
              So sánh Đường chim bay (vectơ d) và Đường bộ (s):
            </span>
            <span className="text-emerald-400 font-mono font-bold">d = 102 km &lt; s = 120 km</span>
          </div>

          <div className="space-y-2 text-xs">
            {/* Air distance */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px]">
                <span className="text-[#00FFCC] font-semibold">✈️ Đường chim bay (Độ dịch chuyển vectơ d):</span>
                <span className="font-mono text-[#00FFCC] font-bold">102 km (Hướng 105° Đông Nam)</span>
              </div>
              <div className="h-2.5 w-full bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-cyan-400 rounded-full transition-all duration-300"
                  style={{ width: `${(airDistanceKm / highwayDistanceKm) * 100}%` }}
                />
              </div>
            </div>

            {/* Highway distance */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px]">
                <span className="text-amber-300 font-semibold">🚗 Đường bộ Cao tốc CT04 (Quãng đường s):</span>
                <span className="font-mono text-amber-300 font-bold">120 km (Uốn lượn qua các nút giao)</span>
              </div>
              <div className="h-2.5 w-full bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-400 rounded-full transition-all duration-300"
                  style={{ width: '100%' }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. PEDAGOGICAL SGK ANALYSIS */}
      <div className="rounded-xl border border-cyan-500/20 bg-cyan-950/20 p-4 sm:p-5 space-y-3">
        <div className="flex items-center gap-2 text-sm font-bold text-[#00FFCC]">
          <CheckCircle2 className="h-4.5 w-4.5 text-[#00D4FF]" />
          <span>Lời giải Phân tích Chuẩn mực SGK (Trang 22):</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm text-gray-200">
          <div className="p-3.5 rounded-xl border border-white/10 bg-[#081326] space-y-2">
            <span className="font-bold text-[#00D4FF] block">
              1. Chọn Hệ quy chiếu Địa lí & Tọa độ Mốc:
            </span>
            <p className="leading-relaxed">
              • <strong>Gốc tọa độ O:</strong> Đặt tại Trung tâm Thủ đô Hà Nội (21°02&apos;B, 105°51&apos;Đ).
              <br />
              • <strong>Trục tọa độ:</strong> Trục thẳng đứng hướng Bắc - Nam, trục nằm ngang hướng Tây - Đông.
              <br />
              • <strong>Vị trí TP. Hải Phòng:</strong> Có tọa độ địa lí khoảng 20°51&apos;B, 106°41&apos;Đ.
            </p>
          </div>

          <div className="p-3.5 rounded-xl border border-white/10 bg-[#081326] space-y-2">
            <span className="font-bold text-amber-400 block">
              2. Kết luận Vị trí Hải Phòng so với Hà Nội:
            </span>
            <p className="leading-relaxed">
              Dựa vào bản đồ Việt Nam và thước đo tỉ xích:
            </p>
            <ul className="space-y-1.5 font-mono text-cyan-200 pl-1">
              <li>• <strong>Khoảng cách đường chim bay:</strong> d ≈ 102 km - 105 km.</li>
              <li>• <strong>Phương hướng:</strong> Nằm ở phía <strong>Đông - Đông Nam</strong> của Hà Nội (lệch khoảng 15° về phía Nam so với hướng chính Đông, hay góc phương vị khoảng 105° so với hướng Bắc).</li>
            </ul>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-cyan-900/30 border border-cyan-500/30 flex items-start gap-2.5 text-xs sm:text-sm text-cyan-100">
          <Info className="h-4 w-4 text-[#00D4FF] shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            💡 <strong>Bản chất Vật lí:</strong> Để xác định vị trí của một điểm trong không gian, ta luôn cần chỉ rõ: <strong>1) Gốc tọa độ mốc (O)</strong>, <strong>2) Khoảng cách đến gốc (d)</strong> và <strong>3) Hướng xác định (Góc lệch so với trục chuẩn)</strong>. Đường chim bay của máy bay chính là hình ảnh trực quan của <em>vectơ độ dịch chuyển d</em> từ Hà Nội đến Hải Phòng.
          </p>
        </div>
      </div>
    </div>
  );
};
