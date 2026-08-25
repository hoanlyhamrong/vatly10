import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Compass,
  Navigation,
  Sparkles,
  Info,
  CheckCircle2,
  Volume2,
  VolumeX,
  Layers,
  ArrowUp,
  MapPin,
  Sliders,
  Check,
  TrendingUp,
  HelpCircle
} from 'lucide-react';
import { InlinePhysicsText } from '../ui/FormattedPhysicsText';

export type PathMode = 'ALL' | 'MOTORBIKE' | 'PEDESTRIAN' | 'CAR';

interface Point2D {
  x: number;
  y: number;
}

export const Lesson4ThreePathsSimulation: React.FC = () => {
  const [selectedMode, setSelectedMode] = useState<PathMode>('ALL');
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0); // 0 to 1
  const [animSpeed, setAnimSpeed] = useState<number>(1); // 0.5x, 1x, 2x
  const [showVectorD, setShowVectorD] = useState<boolean>(true);
  const [showTrails, setShowTrails] = useState<boolean>(true);
  const [showScaleRuler, setShowScaleRuler] = useState<boolean>(true);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);

  // Sound effects generator
  const playSoundEffect = (type: 'engine' | 'walk' | 'arrive' | 'click') => {
    if (!soundEnabled) return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      if (type === 'engine') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(100, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(160, ctx.currentTime + 0.25);
        gain.gain.setValueAtTime(0.06, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.25);
      } else if (type === 'walk') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(200, ctx.currentTime);
        gain.gain.setValueAtTime(0.04, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.1);
      } else if (type === 'arrive') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, ctx.currentTime); // A4
        osc.frequency.setValueAtTime(554.37, ctx.currentTime + 0.1); // C#5
        osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.2); // E5
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.4);
      } else if (type === 'click') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(500, ctx.currentTime);
        gain.gain.setValueAtTime(0.05, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.05);
      }
    } catch (e) {
      // Audio context policy
    }
  };

  // Trajectory Waypoints Definition (Canvas Coordinates scaled to 760x440)
  // Origin A: cx = 380, cy = 370 (South, near Supermarket)
  // Destination B: cx = 380, cy = 70 (North, near Post Office)
  // Distance AB = 300px (Corresponds to 400m in real scale)
  const pointA: Point2D = { x: 380, y: 370 };
  const pointB: Point2D = { x: 380, y: 70 };

  // Path 1 (Motorbike - Black Line): A -> Left (West) -> Up (North) -> Right (East) -> Up into B
  const path1Waypoints: Point2D[] = [
    { x: 365, y: 370 }, // Start A1
    { x: 365, y: 320 }, // Go north to street
    { x: 260, y: 320 }, // Turn West
    { x: 260, y: 140 }, // Go North along West Avenue
    { x: 365, y: 140 }, // Turn East towards Post Office
    { x: 365, y: 70 }   // Turn North to B1
  ];

  // Path 2 (Pedestrian - Blue Line): A -> Straight North through Central Circle/Roundabout -> B
  const path2Waypoints: Point2D[] = [
    { x: 380, y: 370 }, // Start A2
    { x: 380, y: 280 }, // Straight North
    // Curve slightly around/through roundabout or straight
    { x: 380, y: 220 }, // Center Roundabout
    { x: 380, y: 140 }, // North of Roundabout
    { x: 380, y: 70 }   // End B2
  ];

  // Path 3 (Car - Red Line): A -> Right (East) -> Up (North) along East Boulevard -> Left (West) -> Up into B
  const path3Waypoints: Point2D[] = [
    { x: 395, y: 370 }, // Start A3
    { x: 395, y: 320 }, // Go north to avenue
    { x: 580, y: 320 }, // Turn East past supermarket
    { x: 605, y: 140 }, // Go North along East Highway (slanted slightly like SGK)
    { x: 395, y: 140 }, // Turn West towards Post Office
    { x: 395, y: 70 }   // Turn North to B3
  ];

  // Helper to calculate total polyline length and interpolate position
  const getPolylineLength = (pts: Point2D[]) => {
    let len = 0;
    for (let i = 0; i < pts.length - 1; i++) {
      const dx = pts[i + 1].x - pts[i].x;
      const dy = pts[i + 1].y - pts[i].y;
      len += Math.sqrt(dx * dx + dy * dy);
    }
    return len;
  };

  const len1 = getPolylineLength(path1Waypoints); // ~650m scale
  const len2 = getPolylineLength(path2Waypoints); // 400m scale
  const len3 = getPolylineLength(path3Waypoints); // ~820m scale

  // Convert canvas pixel distance to real-world meters (Tỉ xích: 1cm = 100m, 75px = 100m)
  const pxToMeters = 400 / 300; // 300px AB = 400m

  const realDistance1 = Math.round(len1 * pxToMeters); // ~680 m
  const realDistance2 = 400; // 400 m (Exact straight line)
  const realDistance3 = Math.round(len3 * pxToMeters); // ~850 m
  const realDisplacement = 400; // 400 m (Same for all 3!)

  const interpolatePolyline = (pts: Point2D[], t: number): { pos: Point2D; heading: number; distanceSoFar: number } => {
    const totalLen = getPolylineLength(pts);
    const targetDist = totalLen * Math.max(0, Math.min(1, t));

    let accumulated = 0;
    for (let i = 0; i < pts.length - 1; i++) {
      const dx = pts[i + 1].x - pts[i].x;
      const dy = pts[i + 1].y - pts[i].y;
      const segLen = Math.sqrt(dx * dx + dy * dy);

      if (accumulated + segLen >= targetDist || i === pts.length - 2) {
        const segT = (targetDist - accumulated) / segLen;
        const clampedT = Math.max(0, Math.min(1, segT));
        return {
          pos: {
            x: pts[i].x + dx * clampedT,
            y: pts[i].y + dy * clampedT
          },
          heading: Math.atan2(dy, dx),
          distanceSoFar: targetDist * pxToMeters
        };
      }
      accumulated += segLen;
    }
    return { pos: pts[pts.length - 1], heading: 0, distanceSoFar: totalLen * pxToMeters };
  };

  // Animation Loop
  useEffect(() => {
    if (!isPlaying) {
      lastTimeRef.current = null;
      return;
    }

    const baseDurationMs = 8000 / animSpeed;

    const animate = (timestamp: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = timestamp;
      const deltaTime = timestamp - lastTimeRef.current;
      lastTimeRef.current = timestamp;

      setProgress((prev) => {
        const step = deltaTime / baseDurationMs;
        const next = prev + step;
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

    // Clear background (City light slate)
    ctx.clearRect(0, 0, w, h);

    // 1. Base Map Background
    ctx.fillStyle = '#94A3B8'; // City Road Asphalt light gray like SGK
    ctx.fillRect(0, 0, w, h);

    // 2. City Blocks & Green Parks (Faithfully reproducing Hình 4.6 SGK)
    const drawBlock = (x: number, y: number, bw: number, bh: number, color: string, strokeColor = '#CBD5E1', radius = 8) => {
      ctx.fillStyle = color;
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(x, y, bw, bh, radius);
      ctx.fill();
      ctx.stroke();
    };

    // A) Top Area (Around Post Office - Bưu điện)
    // Post Office Lot (Green Lawn)
    drawBlock(275, 25, 360, 95, '#86EFAC', '#4ADE80', 12);
    // Green Lawns on Left & Right Top
    drawBlock(155, 90, 75, 45, '#99F6E4', '#5EEAD4', 8);
    drawBlock(155, 140, 75, 45, '#FED7AA', '#FDBA74', 8);
    drawBlock(275, 130, 85, 45, '#FED7AA', '#FDBA74', 8);
    drawBlock(420, 130, 195, 45, '#86EFAC', '#4ADE80', 8);
    drawBlock(645, 30, 75, 160, '#FED7AA', '#FDBA74', 8);

    // B) Middle Area (Around Roundabout)
    // Left blocks
    drawBlock(45, 210, 80, 40, '#FACC15', '#EAB308', 6);
    drawBlock(130, 210, 85, 40, '#F87171', '#EF4444', 6);
    drawBlock(45, 260, 130, 45, '#EF4444', '#DC2626', 6);
    drawBlock(180, 260, 50, 45, '#FACC15', '#EAB308', 6);

    // Middle-left and middle-right blocks
    drawBlock(275, 215, 80, 65, '#FED7AA', '#FDBA74', 8);
    drawBlock(420, 215, 75, 65, '#FED7AA', '#FDBA74', 8);
    // Forest / Green Park at Middle-Right
    drawBlock(525, 210, 85, 85, '#86EFAC', '#4ADE80', 10);
    drawBlock(630, 215, 90, 80, '#FED7AA', '#FDBA74', 8);

    // C) Bottom Area (Around Supermarket - Siêu thị)
    // Left Water Canal / Lawn
    drawBlock(45, 380, 190, 50, '#99F6E4', '#5EEAD4', 8);
    // Forest at Bottom-Left
    drawBlock(250, 470 - 110, 115, 70, '#86EFAC', '#4ADE80', 10);
    // Middle-bottom blocks
    drawBlock(275, 370, 80, 55, '#FED7AA', '#FDBA74', 8);
    drawBlock(420, 370, 85, 55, '#FED7AA', '#FDBA74', 8);
    // Red accent block
    drawBlock(530, 375, 55, 50, '#F87171', '#EF4444', 6);
    // Supermarket Lot at Bottom-Right
    drawBlock(425, 470 - 95, 140, 80, '#FED7AA', '#FDBA74', 10);
    drawBlock(645, 480 - 110, 75, 70, '#FED7AA', '#FDBA74', 8);

    // 3. Central Roundabout (Vòng xoay bùng binh ở ngã tư trung tâm)
    const rcx = 380;
    const rcy = 295;
    // Outer road ring
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(rcx, rcy, 68, 0, Math.PI * 2);
    ctx.stroke();

    // Inner Green Roundabout
    ctx.fillStyle = '#22C55E';
    ctx.strokeStyle = '#FACC15';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(rcx, rcy, 46, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Roundabout Center Trees
    ctx.fillStyle = '#15803D';
    ctx.beginPath();
    ctx.arc(rcx - 12, rcy - 10, 18, 0, Math.PI * 2);
    ctx.arc(rcx + 14, rcy - 8, 16, 0, Math.PI * 2);
    ctx.arc(rcx, rcy + 12, 19, 0, Math.PI * 2);
    ctx.fill();

    // 4. Tree stamp helper
    const drawSimpleTree = (tx: number, ty: number) => {
      // Trunk
      ctx.fillStyle = '#78350F';
      ctx.fillRect(tx - 2, ty + 2, 4, 8);
      // Leaves
      ctx.fillStyle = '#22C55E';
      ctx.beginPath();
      ctx.arc(tx, ty - 3, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#4ADE80';
      ctx.beginPath();
      ctx.arc(tx - 2, ty - 5, 5, 0, Math.PI * 2);
      ctx.fill();
    };

    // Scatter Trees in Forest lots
    drawSimpleTree(545, 235);
    drawSimpleTree(575, 230);
    drawSimpleTree(560, 260);
    drawSimpleTree(585, 265);
    drawSimpleTree(280, 480 - 80);
    drawSimpleTree(315, 480 - 85);
    drawSimpleTree(340, 480 - 75);
    drawSimpleTree(300, 480 - 60);

    // 5. White Dashed Road Lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.lineWidth = 2;
    ctx.setLineDash([8, 8]);
    // Horizontal main avenues
    ctx.beginPath();
    ctx.moveTo(40, 185);
    ctx.lineTo(720, 185);
    ctx.moveTo(40, 345);
    ctx.lineTo(720, 345);
    // Vertical side avenues
    ctx.moveTo(245, 40);
    ctx.lineTo(245, 420);
    ctx.moveTo(625, 40);
    ctx.lineTo(625, 420);
    ctx.stroke();
    ctx.setLineDash([]);

    // 6. DRAW BUILDINGS: BƯU ĐIỆN (North) & SIÊU THỊ (South)
    // A) Bưu điện (Post Office Building)
    const bldX = 350;
    const bldY = 32;
    // Roof (Brown/Red Clay Tile)
    ctx.fillStyle = '#B91C1C';
    ctx.beginPath();
    ctx.moveTo(bldX - 10, bldY + 42);
    ctx.lineTo(bldX + 30, bldY);
    ctx.lineTo(bldX + 70, bldY + 42);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#7F1D1D';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#991B1B';
    ctx.fillRect(bldX - 5, bldY + 42, 70, 30);
    // Door
    ctx.fillStyle = '#FDE047';
    ctx.fillRect(bldX + 22, bldY + 52, 16, 20);

    // Bưu điện Map Pin & Label
    ctx.fillStyle = '#DC2626';
    ctx.beginPath();
    ctx.arc(465, 45, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 9px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Bưu', 465, 42);
    ctx.fillText('điện', 465, 52);

    // Điểm đích B badge
    ctx.fillStyle = '#1E293B';
    ctx.beginPath();
    ctx.arc(380, 75, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#00FFCC';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = '#00FFCC';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText('B', 380, 79);

    // B) Siêu thị (Supermarket Building)
    const smX = 440;
    const smY = 390;
    // Building body
    ctx.fillStyle = '#B91C1C';
    ctx.fillRect(smX, smY, 65, 35);
    ctx.strokeStyle = '#7F1D1D';
    ctx.strokeRect(smX, smY, 65, 35);
    // Yellow entrance
    ctx.fillStyle = '#FDE047';
    ctx.fillRect(smX - 10, smY + 10, 10, 20);

    // Siêu thị Map Pin & Label
    ctx.fillStyle = '#DC2626';
    ctx.beginPath();
    ctx.arc(520, 395, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 9px sans-serif';
    ctx.fillText('Siêu', 520, 392);
    ctx.fillText('thị', 520, 402);

    // Điểm xuất phát A badge
    ctx.fillStyle = '#1E293B';
    ctx.beginPath();
    ctx.arc(380, 370, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#FACC15';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = '#FACC15';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText('A', 380, 374);

    // 7. Navigation Compass Rose (Top-Left corner)
    const compassX = 65;
    const compassY = 55;
    ctx.save();
    ctx.translate(compassX, compassY);
    ctx.fillStyle = '#0F172A';
    ctx.strokeStyle = '#38BDF8';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, 0, 22, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Compass 4 points
    ctx.fillStyle = '#EF4444'; // North
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, -18);
    ctx.lineTo(4, -3);
    ctx.fill();
    ctx.fillStyle = '#E2E8F0';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, -18);
    ctx.lineTo(-4, -3);
    ctx.fill();
    // South
    ctx.fillStyle = '#64748B';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, 18);
    ctx.lineTo(4, 3);
    ctx.fill();
    // East
    ctx.fillStyle = '#38BDF8';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(18, 0);
    ctx.lineTo(3, 4);
    ctx.fill();
    // West
    ctx.fillStyle = '#94A3B8';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-18, 0);
    ctx.lineTo(-3, 4);
    ctx.fill();

    ctx.font = 'bold 10px sans-serif';
    ctx.fillStyle = '#EF4444';
    ctx.fillText('B', -4, -24);
    ctx.fillStyle = '#38BDF8';
    ctx.fillText('Đ', 24, 4);
    ctx.fillStyle = '#94A3B8';
    ctx.fillText('T', -30, 4);
    ctx.fillStyle = '#64748B';
    ctx.fillText('N', -4, 30);
    ctx.restore();

    // 8. Scale Ruler 1cm = 100m (Bottom-Left)
    if (showScaleRuler) {
      const rx = 45;
      const ry = h - 25;
      const rw = 75; // 75px = 100m

      ctx.strokeStyle = '#0F172A';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(rx, ry);
      ctx.lineTo(rx + rw, ry);
      ctx.moveTo(rx, ry - 5);
      ctx.lineTo(rx, ry + 5);
      ctx.moveTo(rx + rw, ry - 5);
      ctx.lineTo(rx + rw, ry + 5);
      ctx.stroke();

      ctx.fillStyle = '#0F172A';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('Tỉ xích 1 cm ứng với 100 m', rx, ry - 8);
    }

    // 9. DRAW THE 3 TRAJECTORY PATHS (STATIC OR HIGHLIGHTED)
    const drawTrajectoryPath = (pts: Point2D[], color: string, width: number, isDashed = false) => {
      ctx.strokeStyle = color;
      ctx.lineWidth = width;
      if (isDashed) ctx.setLineDash([6, 4]);
      else ctx.setLineDash([]);

      ctx.beginPath();
      ctx.moveTo(pts[0].x, pts[0].y);
      for (let i = 1; i < pts.length; i++) {
        ctx.lineTo(pts[i].x, pts[i].y);
      }
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw direction arrows along the path
      for (let i = 0; i < pts.length - 1; i++) {
        const midX = (pts[i].x + pts[i + 1].x) / 2;
        const midY = (pts[i].y + pts[i + 1].y) / 2;
        const angle = Math.atan2(pts[i + 1].y - pts[i].y, pts[i + 1].x - pts[i].x);

        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(midX, midY);
        ctx.lineTo(midX - 7 * Math.cos(angle - Math.PI / 6), midY - 7 * Math.sin(angle - Math.PI / 6));
        ctx.lineTo(midX - 7 * Math.cos(angle + Math.PI / 6), midY - 7 * Math.sin(angle + Math.PI / 6));
        ctx.closePath();
        ctx.fill();
      }
    };

    // Draw Đường 1 (Xe máy - Đen)
    drawTrajectoryPath(path1Waypoints, '#0F172A', selectedMode === 'MOTORBIKE' || selectedMode === 'ALL' ? 3.5 : 2);
    // Draw Đường 2 (Người đi bộ - Xanh dương)
    drawTrajectoryPath(path2Waypoints, '#2563EB', selectedMode === 'PEDESTRIAN' || selectedMode === 'ALL' ? 3.5 : 2);
    // Draw Đường 3 (Ô tô - Đỏ)
    drawTrajectoryPath(path3Waypoints, '#DC2626', selectedMode === 'CAR' || selectedMode === 'ALL' ? 3.5 : 2);

    // Numbers 1, 2, 3 near starting point A
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#0F172A';
    ctx.fillText('1', 365, 390);
    ctx.fillStyle = '#2563EB';
    ctx.fillText('2', 380, 390);
    ctx.fillStyle = '#DC2626';
    ctx.fillText('3', 395, 390);

    // 10. DRAW DISPLACEMENT VECTOR d (Green glowing line from A straight to B)
    if (showVectorD) {
      ctx.save();
      ctx.strokeStyle = '#00FFCC';
      ctx.lineWidth = 3.5;
      ctx.setLineDash([8, 4]);

      ctx.beginPath();
      ctx.moveTo(pointA.x, pointA.y);
      ctx.lineTo(pointB.x, pointB.y);
      ctx.stroke();
      ctx.setLineDash([]);

      // Arrow head at B
      ctx.fillStyle = '#00FFCC';
      ctx.beginPath();
      ctx.moveTo(pointB.x, pointB.y);
      ctx.lineTo(pointB.x - 7, pointB.y + 16);
      ctx.lineTo(pointB.x + 7, pointB.y + 16);
      ctx.closePath();
      ctx.fill();

      // Label badge
      ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
      ctx.strokeStyle = '#00FFCC';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(pointA.x + 12, (pointA.y + pointB.y) / 2 - 12, 108, 24, 6);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#00FFCC';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('Vectơ d = 400 m (Bắc)', pointA.x + 16, (pointA.y + pointB.y) / 2 + 4);
      ctx.restore();
    }

    // 11. DRAW VEHICLES / CHARACTERS AT CURRENT PROGRESS
    const current1 = interpolatePolyline(path1Waypoints, progress);
    const current2 = interpolatePolyline(path2Waypoints, progress);
    const current3 = interpolatePolyline(path3Waypoints, progress);

    // Vehicle 1: Motorbike (Xe máy vàng + người đội mũ)
    const drawMotorbike = (pos: Point2D, angle: number) => {
      ctx.save();
      ctx.translate(pos.x, pos.y);
      ctx.rotate(angle);

      // Shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
      ctx.beginPath();
      ctx.ellipse(0, 3, 14, 6, 0, 0, Math.PI * 2);
      ctx.fill();

      // Bike Body (Yellow scooter)
      ctx.fillStyle = '#F59E0B';
      ctx.beginPath();
      ctx.roundRect(-10, -5, 20, 10, 3);
      ctx.fill();

      // Front wheel & Rear wheel
      ctx.fillStyle = '#0F172A';
      ctx.fillRect(7, -2, 5, 4);
      ctx.fillRect(-11, -2, 5, 4);

      // Rider Helmet (Orange)
      ctx.fillStyle = '#EA580C';
      ctx.beginPath();
      ctx.arc(-1, 0, 4.5, 0, Math.PI * 2);
      ctx.fill();

      // Label
      ctx.rotate(-angle);
      ctx.fillStyle = '#0F172A';
      ctx.font = 'bold 9px sans-serif';
      ctx.fillText('1. Xe máy', 0, -10);
      ctx.restore();
    };

    // Vehicle 2: Pedestrian (Người đi bộ)
    const drawPedestrian = (pos: Point2D) => {
      ctx.save();
      ctx.translate(pos.x, pos.y);

      // Shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.beginPath();
      ctx.ellipse(0, 4, 8, 4, 0, 0, Math.PI * 2);
      ctx.fill();

      // Body (Blue Shirt)
      ctx.fillStyle = '#2563EB';
      ctx.beginPath();
      ctx.arc(0, -2, 4.5, 0, Math.PI * 2);
      ctx.fill();

      // Head (Skin color)
      ctx.fillStyle = '#FDE68A';
      ctx.beginPath();
      ctx.arc(0, -8, 3.5, 0, Math.PI * 2);
      ctx.fill();

      // Label
      ctx.fillStyle = '#1E3A8A';
      ctx.font = 'bold 9px sans-serif';
      ctx.fillText('2. Đi bộ', 0, -14);
      ctx.restore();
    };

    // Vehicle 3: Car (Ô tô xanh lá)
    const drawCar = (pos: Point2D, angle: number) => {
      ctx.save();
      ctx.translate(pos.x, pos.y);
      ctx.rotate(angle);

      // Shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.beginPath();
      ctx.roundRect(-16, -10, 32, 20, 4);
      ctx.fill();

      // Car Body (Green Sedan)
      ctx.fillStyle = '#15803D';
      ctx.beginPath();
      ctx.roundRect(-14, -8, 28, 16, 4);
      ctx.fill();
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Windshield (Glass)
      ctx.fillStyle = '#7DD3FC';
      ctx.fillRect(2, -6, 5, 12);
      ctx.fillRect(-7, -5, 4, 10);

      // Wheels
      ctx.fillStyle = '#0F172A';
      ctx.fillRect(6, -10, 6, 2.5);
      ctx.fillRect(6, 7.5, 6, 2.5);
      ctx.fillRect(-12, -10, 6, 2.5);
      ctx.fillRect(-12, 7.5, 6, 2.5);

      // Headlights (Yellow)
      ctx.fillStyle = '#FDE047';
      ctx.fillRect(13, -7, 1.5, 3);
      ctx.fillRect(13, 4, 1.5, 3);

      // Label
      ctx.rotate(-angle);
      ctx.fillStyle = '#991B1B';
      ctx.font = 'bold 9px sans-serif';
      ctx.fillText('3. Ô tô', 0, -12);
      ctx.restore();
    };

    // Render selected vehicles
    if (selectedMode === 'MOTORBIKE' || selectedMode === 'ALL') {
      drawMotorbike(current1.pos, current1.heading);
    }
    if (selectedMode === 'PEDESTRIAN' || selectedMode === 'ALL') {
      drawPedestrian(current2.pos);
    }
    if (selectedMode === 'CAR' || selectedMode === 'ALL') {
      drawCar(current3.pos, current3.heading);
    }
  }, [progress, selectedMode, showVectorD, showScaleRuler, showTrails]);

  const handleStart = () => {
    if (progress >= 1) setProgress(0);
    setIsPlaying(true);
    playSoundEffect('engine');
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
            <span>Mô phỏng Diễn họa 3D Thực tế</span>
            <span className="text-gray-500">•</span>
            <span className="text-amber-400">Hình 4.6 (Trang 23 - 24 SGK Vật lí 10)</span>
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
            <span>So sánh Quãng đường (s) &amp; Độ dịch chuyển (vectơ d) của 3 Chuyển động</span>
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

      {/* 2. MODE SELECTOR PILLS */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-bold text-gray-300 mr-1">Chọn đối tượng quan sát:</span>
        <button
          onClick={() => { setSelectedMode('ALL'); playSoundEffect('click'); }}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            selectedMode === 'ALL'
              ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/25 ring-2 ring-cyan-400'
              : 'bg-[#0F1B30] text-gray-300 hover:bg-[#162744] border border-white/10'
          }`}
        >
          <Layers className="h-3.5 w-3.5" />
          <span>Cả 3 Chuyển Động Cùng Lúc</span>
        </button>

        <button
          onClick={() => { setSelectedMode('MOTORBIKE'); playSoundEffect('click'); }}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            selectedMode === 'MOTORBIKE'
              ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/25 ring-2 ring-amber-300'
              : 'bg-[#0F1B30] text-gray-300 hover:bg-[#162744] border border-white/10'
          }`}
        >
          <span>🛵 1. Người đi xe máy</span>
        </button>

        <button
          onClick={() => { setSelectedMode('PEDESTRIAN'); playSoundEffect('click'); }}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            selectedMode === 'PEDESTRIAN'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25 ring-2 ring-cyan-300'
              : 'bg-[#0F1B30] text-gray-300 hover:bg-[#162744] border border-white/10'
          }`}
        >
          <span>🚶 2. Người đi bộ</span>
        </button>

        <button
          onClick={() => { setSelectedMode('CAR'); playSoundEffect('click'); }}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            selectedMode === 'CAR'
              ? 'bg-red-600 text-white shadow-lg shadow-red-500/25 ring-2 ring-red-300'
              : 'bg-[#0F1B30] text-gray-300 hover:bg-[#162744] border border-white/10'
          }`}
        >
          <span>🚗 3. Người đi ô tô</span>
        </button>
      </div>

      {/* 3. CANVAS VIEWPORT */}
      <div className="relative w-full h-[360px] sm:h-[430px] rounded-2xl overflow-hidden border border-cyan-500/30 bg-[#94A3B8] shadow-inner flex items-center justify-center">
        <canvas
          ref={canvasRef}
          width={760}
          height={430}
          className="w-full h-full object-contain"
        />

        {/* Live Vector D switch & toggles overlay at top-right */}
        <div className="absolute top-3 right-3 flex flex-col gap-1.5 bg-black/80 p-2.5 rounded-xl border border-cyan-500/40 backdrop-blur-md text-xs">
          <label className="flex items-center gap-2 text-[#00FFCC] font-bold cursor-pointer select-none">
            <input
              type="checkbox"
              checked={showVectorD}
              onChange={(e) => setShowVectorD(e.target.checked)}
              className="accent-[#00FFCC] cursor-pointer"
            />
            <span>Hiện Vectơ d (Nét đứt Cyan)</span>
          </label>

          <label className="flex items-center gap-2 text-gray-300 text-[11px] cursor-pointer select-none">
            <input
              type="checkbox"
              checked={showScaleRuler}
              onChange={(e) => setShowScaleRuler(e.target.checked)}
              className="accent-cyan-400 cursor-pointer"
            />
            <span>Hiện Tỉ xích (1 cm = 100 m)</span>
          </label>
        </div>

        {/* Live Comparison Telemetry HUD at bottom-right */}
        <div className="absolute bottom-3 right-3 bg-black/85 p-3 rounded-xl border border-cyan-500/40 backdrop-blur-md text-xs space-y-1.5 shadow-xl max-w-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-cyan-300 border-b border-white/10 pb-1 flex justify-between">
            <span>Bảng số liệu thực nghiệm:</span>
            <span className="text-amber-400 font-mono">{(progress * 100).toFixed(0)}%</span>
          </div>

          <div className="space-y-1 font-mono text-[11px]">
            <div className="flex justify-between items-center text-amber-300">
              <span>1. Xe máy ($s_1$):</span>
              <span className="font-bold">{(realDistance1 * progress).toFixed(0)} / {realDistance1} m</span>
            </div>
            <div className="flex justify-between items-center text-cyan-300">
              <span>2. Đi bộ ($s_2$):</span>
              <span className="font-bold">{(realDistance2 * progress).toFixed(0)} / {realDistance2} m</span>
            </div>
            <div className="flex justify-between items-center text-red-400">
              <span>3. Ô tô ($s_3$):</span>
              <span className="font-bold">{(realDistance3 * progress).toFixed(0)} / {realDistance3} m</span>
            </div>
            <div className="flex justify-between items-center text-[#00FFCC] border-t border-white/10 pt-1 font-bold">
              <span>Độ dịch chuyển $d$:</span>
              <span>{(realDisplacement * progress).toFixed(0)} / {realDisplacement} m</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. CONTROLS & INTERACTIVE COMPARISON BAR */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Playback Controls */}
        <div className="rounded-xl border border-white/10 bg-[#0C1528] p-4 flex flex-col justify-between space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-cyan-300">
            Điều khiển Di chuyển:
          </span>
          <div className="flex items-center gap-2">
            {!isPlaying ? (
              <button
                onClick={handleStart}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-black font-bold text-sm shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
              >
                <Play className="h-4 w-4 fill-current" />
                <span>Cho Chạy (Từ A $\rightarrow$ B)</span>
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
              title="Đặt lại về Siêu thị A"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>

          {/* Speed Toggle */}
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>Tốc độ mô phỏng:</span>
            <div className="flex gap-1">
              {[0.5, 1, 2].map((spd) => (
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

        {/* Visual Comparison Bar Chart */}
        <div className="md:col-span-2 rounded-xl border border-white/10 bg-[#0C1528] p-4 space-y-2.5">
          <div className="flex justify-between items-center text-xs font-bold text-gray-300">
            <span className="text-[#00D4FF] flex items-center gap-1.5">
              <TrendingUp className="h-3.5 w-3.5" />
              So sánh trực quan Quãng đường $s$ và Độ dịch chuyển $d$:
            </span>
            <span className="text-emerald-400 font-mono font-bold">s₂ = d &lt; s₁ &lt; s₃</span>
          </div>

          <div className="space-y-2 text-xs">
            {/* Bar 2: Đi bộ */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px]">
                <span className="text-cyan-300 font-semibold">2. Người đi bộ ($s_2$ - Đường thẳng):</span>
                <span className="font-mono text-cyan-300 font-bold">{realDistance2} m (Bằng đúng d = 400 m)</span>
              </div>
              <div className="h-2.5 w-full bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-cyan-400 rounded-full transition-all duration-300"
                  style={{ width: `${(realDistance2 / realDistance3) * 100}%` }}
                />
              </div>
            </div>

            {/* Bar 1: Xe máy */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px]">
                <span className="text-amber-300 font-semibold">1. Người đi xe máy ($s_1$ - Vòng qua góc phố phía Tây):</span>
                <span className="font-mono text-amber-300 font-bold">{realDistance1} m ({'>'} d)</span>
              </div>
              <div className="h-2.5 w-full bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-400 rounded-full transition-all duration-300"
                  style={{ width: `${(realDistance1 / realDistance3) * 100}%` }}
                />
              </div>
            </div>

            {/* Bar 3: Ô tô */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px]">
                <span className="text-red-400 font-semibold">3. Người đi ô tô ($s_3$ - Vòng qua đại lộ phía Đông):</span>
                <span className="font-mono text-red-400 font-bold">{realDistance3} m (Dài nhất)</span>
              </div>
              <div className="h-2.5 w-full bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-red-500 rounded-full transition-all duration-300"
                  style={{ width: '100%' }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 5. DETAILED PEDAGOGICAL SGK ANALYSIS */}
      <div className="rounded-xl border border-cyan-500/20 bg-cyan-950/20 p-4 sm:p-5 space-y-3">
        <div className="flex items-center gap-2 text-sm font-bold text-[#00FFCC]">
          <CheckCircle2 className="h-4.5 w-4.5 text-[#00D4FF]" />
          <span>Lời giải Phân tích Chuẩn mực SGK (Trang 23 - 24):</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm text-gray-200">
          <div className="p-3.5 rounded-xl border border-white/10 bg-[#081326] space-y-2">
            <span className="font-bold text-[#00D4FF] block">
              1. So sánh độ lớn Độ dịch chuyển (d) và Quãng đường (s) ở Hình 4.6:
            </span>
            <p className="leading-relaxed">
              • <strong>Về độ dịch chuyển (vectơ d):</strong> Cả 3 người đều có cùng vị trí xuất phát là <strong>Siêu thị A</strong> và cùng vị trí đích đến là <strong>Bưu điện B</strong>.
              <br />
              &rArr; <strong>Độ lớn độ dịch chuyển của cả 3 chuyển động là hoàn toàn bằng nhau:</strong>
            </p>
            <div className="text-center font-mono font-bold text-[#00FFCC] bg-cyan-950/50 p-1.5 rounded-lg border border-cyan-500/30">
              d₁ = d₂ = d₃ = AB = 400 m (hướng thẳng Bắc)
            </div>
            <p className="leading-relaxed">
              • <strong>Về quãng đường đi được (s):</strong>
              <br />
              - Người 2 (đi bộ) đi thẳng: s₂ = AB = 400 m.
              <br />
              - Người 1 (xe máy) &amp; Người 3 (ô tô) phải đi vòng qua các góc phố nên s₁ &gt; AB và s₃ &gt; AB.
              <br />
              &rArr; <strong>So sánh quãng đường:</strong> <span className="text-amber-300 font-bold font-mono">s₂ &lt; s₁ &lt; s₃</span>.
            </p>
          </div>

          <div className="p-3.5 rounded-xl border border-white/10 bg-[#081326] space-y-2">
            <span className="font-bold text-amber-400 block">
              2. Khi nào độ lớn độ dịch chuyển và quãng đường bằng nhau ($d = s$)?
            </span>
            <p className="leading-relaxed">
              Độ lớn của độ dịch chuyển và quãng đường đi được của một chuyển động bằng nhau ($d = s$) khi và chỉ khi:
            </p>
            <div className="bg-amber-950/40 p-2.5 rounded-xl border border-amber-500/30 text-amber-200 font-semibold space-y-1">
              <div className="flex items-center gap-1.5">
                <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>Vật chuyển động trên một <strong>đường thẳng</strong>.</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>Vật <strong>không đổi chiều</strong> chuyển động (chỉ đi theo một chiều dương xác định).</span>
              </div>
            </div>
            <p className="leading-relaxed text-gray-300 text-xs mt-1">
              * Nếu vật đổi chiều hoặc đi đường cong (như xe máy 1 và ô tô 3), quãng đường luôn lớn hơn độ lớn độ dịch chuyển ($s &gt; d$).
            </p>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-cyan-900/30 border border-cyan-500/30 flex items-start gap-2.5 text-xs sm:text-sm text-cyan-100">
          <Info className="h-4 w-4 text-[#00D4FF] shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            💡 <strong>Quy tắc tổng quát trong Vật lí:</strong> Trong mọi chuyển động thực tế:
            <strong className="text-white font-mono ml-1">|d| ≤ s</strong>. Dấu bằng ("=") xảy ra duy nhất khi chuyển động thẳng và không đổi chiều.
          </p>
        </div>
      </div>
    </div>
  );
};
