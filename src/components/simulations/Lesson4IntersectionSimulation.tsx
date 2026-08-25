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
  ArrowRight,
  ArrowLeft,
  ArrowDown,
  Eye,
  Sliders
} from 'lucide-react';
import { InlinePhysicsText } from '../ui/FormattedPhysicsText';

export type Direction4 = 'NORTH' | 'EAST' | 'SOUTH' | 'WEST';

export const Lesson4IntersectionSimulation: React.FC = () => {
  // Simulation States
  const [selectedDirection, setSelectedDirection] = useState<Direction4>('NORTH');
  const [speedKmh, setSpeedKmh] = useState<number>(36); // 36 km/h standard in SGK
  const [travelTimeSec, setTravelTimeSec] = useState<number>(10); // 10s standard in SGK
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0); // 0 to 1
  const [showAll4Cars, setShowAll4Cars] = useState<boolean>(false);
  const [showVectorD, setShowVectorD] = useState<boolean>(true);
  const [showScaleRuler, setShowScaleRuler] = useState<boolean>(true);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);

  // Physics Calculations
  const speedMs = speedKmh / 3.6; // 10 m/s
  const totalDistance = speedMs * travelTimeSec; // in meters (e.g. 100 m)
  const currentDistance = totalDistance * progress;

  // Sound generator
  const playSoundEffect = (type: 'engine' | 'arrive' | 'click') => {
    if (!soundEnabled) return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      if (type === 'engine') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(80, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(140, ctx.currentTime + 0.3);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
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
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      } else if (type === 'click') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(440, ctx.currentTime);
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

  // Animation Loop
  useEffect(() => {
    if (!isPlaying) {
      lastTimeRef.current = null;
      return;
    }

    const durationMs = travelTimeSec * 1000;

    const animate = (timestamp: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = timestamp;
      const deltaTime = timestamp - lastTimeRef.current;
      lastTimeRef.current = timestamp;

      setProgress((prev) => {
        const step = deltaTime / durationMs;
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
  }, [isPlaying, travelTimeSec]);

  // Determine current destination point
  const getDestinationPointName = (dir: Direction4, dist: number) => {
    if (dist <= 5) return 'Gốc O (0m)';
    if (Math.abs(dist - 50) < 15) {
      switch (dir) {
        case 'NORTH': return 'Điểm C (50 m)';
        case 'EAST': return 'Điểm K (50 m)';
        case 'SOUTH': return 'Điểm D (50 m)';
        case 'WEST': return 'Điểm I (50 m)';
      }
    }
    if (Math.abs(dist - 100) < 15) {
      switch (dir) {
        case 'NORTH': return 'Điểm B (100 m) - Đích SGK';
        case 'EAST': return 'Điểm L (100 m) - Đích SGK';
        case 'SOUTH': return 'Điểm E (100 m) - Đích SGK';
        case 'WEST': return 'Điểm H (100 m) - Đích SGK';
      }
    }
    if (Math.abs(dist - 150) < 15) {
      switch (dir) {
        case 'NORTH': return 'Điểm A (150 m)';
        case 'EAST': return 'Điểm M (150 m)';
        case 'SOUTH': return 'Điểm F (150 m)';
        case 'WEST': return 'Điểm G (150 m)';
      }
    }
    return `${dist.toFixed(1)} m`;
  };

  // Canvas Renderer
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    const cx = w / 2;
    const cy = h / 2;

    // Clear
    ctx.clearRect(0, 0, w, h);

    // 1. Grass Ground Background
    const grassGradient = ctx.createLinearGradient(0, 0, w, h);
    grassGradient.addColorStop(0, '#0F301F');
    grassGradient.addColorStop(0.5, '#133D28');
    grassGradient.addColorStop(1, '#0C2618');
    ctx.fillStyle = grassGradient;
    ctx.fillRect(0, 0, w, h);

    // 2. Subtle Ground Texture Grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
    ctx.lineWidth = 1;
    for (let x = 0; x <= w; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y <= h; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Road Dimensions
    const roadWidth = 72;
    const pxPerMeter = 1.35; // 50m = 67.5px, 100m = 135px, 150m = 202.5px

    // 3. Roads (Cross intersection)
    ctx.fillStyle = '#334155'; // Asphalt
    // Horizontal road (West - East)
    ctx.fillRect(0, cy - roadWidth / 2, w, roadWidth);
    // Vertical road (North - South)
    ctx.fillRect(cx - roadWidth / 2, 0, roadWidth, h);

    // Road Curbs / Sidewalk edges (Cyan glow borders)
    ctx.strokeStyle = '#64748B';
    ctx.lineWidth = 3;
    // Top-Left corner sidewalk
    ctx.strokeRect(-10, -10, cx - roadWidth / 2 + 10, cy - roadWidth / 2 + 10);
    // Top-Right corner sidewalk
    ctx.strokeRect(cx + roadWidth / 2, -10, w - (cx + roadWidth / 2) + 10, cy - roadWidth / 2 + 10);
    // Bottom-Left corner sidewalk
    ctx.strokeRect(-10, cy + roadWidth / 2, cx - roadWidth / 2 + 10, h - (cy + roadWidth / 2) + 10);
    // Bottom-Right corner sidewalk
    ctx.strokeRect(cx + roadWidth / 2, cy + roadWidth / 2, w - (cx + roadWidth / 2) + 10, h - (cy + roadWidth / 2) + 10);

    // Corner curves (Rounded sidewalks like SGK)
    ctx.fillStyle = '#1E293B';
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 2;

    // 4. Road Lane Centerlines (Dashed White)
    ctx.strokeStyle = '#F8FAFC';
    ctx.lineWidth = 2.5;
    ctx.setLineDash([8, 8]);

    // North lane
    ctx.beginPath();
    ctx.moveTo(cx, 0);
    ctx.lineTo(cx, cy - roadWidth / 2);
    ctx.stroke();

    // South lane
    ctx.beginPath();
    ctx.moveTo(cx, cy + roadWidth / 2);
    ctx.lineTo(cx, h);
    ctx.stroke();

    // West lane
    ctx.beginPath();
    ctx.moveTo(0, cy);
    ctx.lineTo(cx - roadWidth / 2, cy);
    ctx.stroke();

    // East lane
    ctx.beginPath();
    ctx.moveTo(cx + roadWidth / 2, cy);
    ctx.lineTo(w, cy);
    ctx.stroke();

    ctx.setLineDash([]);

    // 5. Environment Decor (Matching SGK Page 21)
    // A) House at Top-Left (North-West)
    const houseX = cx - 185;
    const houseY = cy - 170;
    // House Base (Red brick)
    ctx.fillStyle = '#B91C1C';
    ctx.fillRect(houseX, houseY + 22, 68, 42);
    ctx.strokeStyle = '#7F1D1D';
    ctx.lineWidth = 2;
    ctx.strokeRect(houseX, houseY + 22, 68, 42);
    // House Roof (Triangle Gable)
    ctx.fillStyle = '#991B1B';
    ctx.beginPath();
    ctx.moveTo(houseX - 5, houseY + 22);
    ctx.lineTo(houseX + 34, houseY - 5);
    ctx.lineTo(houseX + 73, houseY + 22);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    // Windows & Door
    ctx.fillStyle = '#E0F2FE';
    ctx.fillRect(houseX + 8, houseY + 30, 14, 14);
    ctx.fillRect(houseX + 46, houseY + 30, 14, 14);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(houseX + 27, houseY + 36, 14, 28);
    // House label
    ctx.fillStyle = '#CBD5E1';
    ctx.font = 'bold 10px sans-serif';
    ctx.fillText('Ngôi nhà SGK', houseX + 2, houseY + 76);

    // B) Pond / Lake at Top-Right (North-East) & Bottom-Right (South-East)
    // Top-Right Pond
    ctx.fillStyle = '#38BDF8';
    ctx.beginPath();
    ctx.ellipse(cx + 175, cy - 120, 36, 24, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#0284C7';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Bottom-Right Pond
    ctx.fillStyle = '#38BDF8';
    ctx.beginPath();
    ctx.ellipse(cx + 145, cy + 95, 30, 28, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#0284C7';
    ctx.stroke();

    // C) Tree Helper Function
    const drawTree = (tx: number, ty: number) => {
      // Tree Trunk
      ctx.fillStyle = '#78350F';
      ctx.fillRect(tx - 2.5, ty + 2, 5, 12);
      // Tree Shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
      ctx.beginPath();
      ctx.ellipse(tx + 4, ty + 12, 10, 5, 0, 0, Math.PI * 2);
      ctx.fill();
      // Tree Foliage (Green spheres)
      ctx.fillStyle = '#22C55E';
      ctx.beginPath();
      ctx.arc(tx, ty - 2, 11, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#4ADE80';
      ctx.beginPath();
      ctx.arc(tx - 3, ty - 5, 7, 0, Math.PI * 2);
      ctx.fill();
    };

    // Trees Top-Left
    drawTree(cx - 190, cy - 80);
    drawTree(cx - 150, cy - 80);
    drawTree(cx - 110, cy - 80);
    drawTree(cx - 65, cy - 70);
    drawTree(cx - 65, cy - 115);
    drawTree(cx - 65, cy - 160);

    // Trees Top-Right
    drawTree(cx + 65, cy - 70);
    drawTree(cx + 65, cy - 115);
    drawTree(cx + 65, cy - 160);
    drawTree(cx + 110, cy - 70);
    drawTree(cx + 155, cy - 70);
    drawTree(cx + 200, cy - 70);
    drawTree(cx + 130, cy - 160);
    drawTree(cx + 175, cy - 160);
    drawTree(cx + 220, cy - 160);

    // Trees Bottom-Left
    drawTree(cx - 65, cy + 70);
    drawTree(cx - 65, cy + 115);
    drawTree(cx - 65, cy + 160);
    drawTree(cx - 105, cy + 70);
    drawTree(cx - 145, cy + 70);
    drawTree(cx - 185, cy + 70);
    drawTree(cx - 120, cy + 125);
    drawTree(cx - 160, cy + 125);
    drawTree(cx - 100, cy + 175);
    drawTree(cx - 140, cy + 175);
    drawTree(cx - 180, cy + 175);

    // Trees Bottom-Right
    drawTree(cx + 65, cy + 165);
    drawTree(cx + 105, cy + 165);
    drawTree(cx + 145, cy + 165);
    drawTree(cx + 185, cy + 165);
    drawTree(cx + 225, cy + 165);
    drawTree(cx + 185, cy + 120);
    drawTree(cx + 225, cy + 120);

    // 6. Navigation Compass Rose (Top-Left corner)
    const compassX = 55;
    const compassY = 55;
    // Compass Needle
    ctx.save();
    ctx.translate(compassX, compassY);
    // Draw star compass
    ctx.fillStyle = '#0F172A';
    ctx.strokeStyle = '#38BDF8';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, 0, 24, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // 4 points
    ctx.fillStyle = '#EF4444'; // North (Red)
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, -20);
    ctx.lineTo(5, -4);
    ctx.fill();
    ctx.fillStyle = '#CBD5E1';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, -20);
    ctx.lineTo(-5, -4);
    ctx.fill();

    // South
    ctx.fillStyle = '#64748B';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, 20);
    ctx.lineTo(5, 4);
    ctx.fill();
    // East
    ctx.fillStyle = '#38BDF8';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(20, 0);
    ctx.lineTo(4, 5);
    ctx.fill();
    // West
    ctx.fillStyle = '#94A3B8';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-20, 0);
    ctx.lineTo(-4, 5);
    ctx.fill();

    ctx.font = 'bold 11px sans-serif';
    ctx.fillStyle = '#EF4444';
    ctx.fillText('B', -4, -26);
    ctx.fillStyle = '#38BDF8';
    ctx.fillText('Đ', 26, 4);
    ctx.fillStyle = '#94A3B8';
    ctx.fillText('T', -34, 4);
    ctx.fillStyle = '#64748B';
    ctx.fillText('N', -4, 34);
    ctx.restore();

    // 7. Axis Direction Labels at Ends of Road
    ctx.font = 'bold 14px sans-serif';
    // North
    ctx.fillStyle = '#F8FAFC';
    ctx.fillText('Bắc (+y)', cx - 28, 22);
    // South
    ctx.fillText('Nam (-y)', cx - 28, h - 12);
    // West
    ctx.fillText('Tây (-x)', 14, cy - roadWidth / 2 - 8);
    // East
    ctx.fillText('Đông (+x)', w - 85, cy - roadWidth / 2 - 8);

    // 8. Scale Ruler 50m (Bottom-Left)
    if (showScaleRuler) {
      const rulerX = 40;
      const rulerY = h - 35;
      const rulerW = 50 * pxPerMeter; // 67.5px

      ctx.fillStyle = '#F8FAFC';
      ctx.strokeStyle = '#F8FAFC';
      ctx.lineWidth = 2.5;

      ctx.beginPath();
      ctx.moveTo(rulerX, rulerY);
      ctx.lineTo(rulerX + rulerW, rulerY);
      // Left tick
      ctx.moveTo(rulerX, rulerY - 6);
      ctx.lineTo(rulerX, rulerY + 6);
      // Right tick
      ctx.moveTo(rulerX + rulerW, rulerY - 6);
      ctx.lineTo(rulerX + rulerW, rulerY + 6);
      ctx.stroke();

      ctx.font = 'bold 12px sans-serif';
      ctx.fillText('50 m (Đoạn tỉ xích SGK)', rulerX - 10, rulerY - 10);
    }

    // 9. Coordinate Points on Axes (A, B, C, D, E, F, G, H, I, K, L, M & Origin O)
    const drawCoordinatePoint = (
      px: number,
      py: number,
      label: string,
      distMeters: number,
      isTarget: boolean
    ) => {
      // Circle dot
      ctx.fillStyle = isTarget ? '#00FFCC' : '#FFFFFF';
      ctx.strokeStyle = isTarget ? '#00FFCC' : '#0F172A';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(px, py, isTarget ? 6.5 : 4.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      if (isTarget) {
        // Glowing ring
        ctx.strokeStyle = 'rgba(0, 255, 204, 0.5)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(px, py, 11, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Label
      ctx.fillStyle = isTarget ? '#00FFCC' : '#F8FAFC';
      ctx.font = isTarget ? 'bold 14px sans-serif' : 'bold 12px sans-serif';
      ctx.fillText(label, px + 8, py + 4);
    };

    // GỐC O (Origin)
    drawCoordinatePoint(cx, cy, 'O (Gốc 0m)', 0, currentDistance < 5);

    // HƯỚNG BẮC (NORTH): C (50m), B (100m), A (150m)
    drawCoordinatePoint(cx, cy - 50 * pxPerMeter, 'C (50m)', 50, selectedDirection === 'NORTH' && Math.abs(currentDistance - 50) < 10);
    drawCoordinatePoint(cx, cy - 100 * pxPerMeter, 'B (100m)', 100, selectedDirection === 'NORTH' && Math.abs(currentDistance - 100) < 10);
    drawCoordinatePoint(cx, cy - 150 * pxPerMeter, 'A (150m)', 150, selectedDirection === 'NORTH' && Math.abs(currentDistance - 150) < 10);

    // HƯỚNG NAM (SOUTH): D (50m), E (100m), F (150m)
    drawCoordinatePoint(cx, cy + 50 * pxPerMeter, 'D (50m)', 50, selectedDirection === 'SOUTH' && Math.abs(currentDistance - 50) < 10);
    drawCoordinatePoint(cx, cy + 100 * pxPerMeter, 'E (100m)', 100, selectedDirection === 'SOUTH' && Math.abs(currentDistance - 100) < 10);
    drawCoordinatePoint(cx, cy + 150 * pxPerMeter, 'F (150m)', 150, selectedDirection === 'SOUTH' && Math.abs(currentDistance - 150) < 10);

    // HƯỚNG TÂY (WEST): I (50m), H (100m), G (150m)
    drawCoordinatePoint(cx - 50 * pxPerMeter, cy, 'I (50m)', 50, selectedDirection === 'WEST' && Math.abs(currentDistance - 50) < 10);
    drawCoordinatePoint(cx - 100 * pxPerMeter, cy, 'H (100m)', 100, selectedDirection === 'WEST' && Math.abs(currentDistance - 100) < 10);
    drawCoordinatePoint(cx - 150 * pxPerMeter, cy, 'G (150m)', 150, selectedDirection === 'WEST' && Math.abs(currentDistance - 150) < 10);

    // HƯỚNG ĐÔNG (EAST): K (50m), L (100m), M (150m)
    drawCoordinatePoint(cx + 50 * pxPerMeter, cy, 'K (50m)', 50, selectedDirection === 'EAST' && Math.abs(currentDistance - 50) < 10);
    drawCoordinatePoint(cx + 100 * pxPerMeter, cy, 'L (100m)', 100, selectedDirection === 'EAST' && Math.abs(currentDistance - 100) < 10);
    drawCoordinatePoint(cx + 150 * pxPerMeter, cy, 'M (150m)', 150, selectedDirection === 'EAST' && Math.abs(currentDistance - 150) < 10);

    // 10. Car Drawing Function (Isometric 3D Car)
    const drawCar = (carX: number, carY: number, dir: Direction4, color: string, carNumber: string) => {
      ctx.save();
      ctx.translate(carX, carY);

      let rot = 0;
      if (dir === 'NORTH') rot = -Math.PI / 2;
      else if (dir === 'EAST') rot = 0;
      else if (dir === 'SOUTH') rot = Math.PI / 2;
      else if (dir === 'WEST') rot = Math.PI;

      ctx.rotate(rot);

      // Car Shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.beginPath();
      ctx.roundRect(-22, -13, 44, 26, 6);
      ctx.fill();

      // Car Wheels (4 black rounded rects)
      ctx.fillStyle = '#0F172A';
      ctx.fillRect(-16, -15, 9, 4);
      ctx.fillRect(8, -15, 9, 4);
      ctx.fillRect(-16, 11, 9, 4);
      ctx.fillRect(8, 11, 9, 4);

      // Car Body
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.roundRect(-20, -12, 40, 24, 7);
      ctx.fill();
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Car Roof & Windshield
      ctx.fillStyle = '#1E293B';
      ctx.beginPath();
      ctx.roundRect(-10, -9, 20, 18, 4);
      ctx.fill();

      // Front Windshield (Glass)
      ctx.fillStyle = '#7DD3FC';
      ctx.beginPath();
      ctx.roundRect(4, -8, 6, 16, 2);
      ctx.fill();

      // Rear Glass
      ctx.fillStyle = '#38BDF8';
      ctx.beginPath();
      ctx.roundRect(-9, -7, 4, 14, 2);
      ctx.fill();

      // Headlights (Yellow glowing front)
      ctx.fillStyle = '#FDE047';
      ctx.fillRect(18, -10, 2, 4);
      ctx.fillRect(18, 6, 2, 4);

      // Taillights (Red rear)
      ctx.fillStyle = '#EF4444';
      ctx.fillRect(-20, -10, 2, 4);
      ctx.fillRect(-20, 6, 2, 4);

      // Car Label Badge
      ctx.rotate(-rot); // upright label
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(carNumber, 0, -18);

      ctx.restore();
    };

    // 11. Draw Displacement Vector (d)
    if (showVectorD && currentDistance > 2) {
      ctx.save();
      ctx.strokeStyle = '#00FFCC';
      ctx.lineWidth = 3.5;
      ctx.setLineDash([6, 3]);

      let targetX = cx;
      let targetY = cy;

      if (selectedDirection === 'NORTH') targetY = cy - currentDistance * pxPerMeter;
      else if (selectedDirection === 'EAST') targetX = cx + currentDistance * pxPerMeter;
      else if (selectedDirection === 'SOUTH') targetY = cy + currentDistance * pxPerMeter;
      else if (selectedDirection === 'WEST') targetX = cx - currentDistance * pxPerMeter;

      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(targetX, targetY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Arrow head for vector d
      ctx.fillStyle = '#00FFCC';
      const angle = Math.atan2(targetY - cy, targetX - cx);
      ctx.beginPath();
      ctx.moveTo(targetX, targetY);
      ctx.lineTo(
        targetX - 12 * Math.cos(angle - Math.PI / 6),
        targetY - 12 * Math.sin(angle - Math.PI / 6)
      );
      ctx.lineTo(
        targetX - 12 * Math.cos(angle + Math.PI / 6),
        targetY - 12 * Math.sin(angle + Math.PI / 6)
      );
      ctx.closePath();
      ctx.fill();

      // Displacement Label badge
      const midX = (cx + targetX) / 2;
      const midY = (cy + targetY) / 2;
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.strokeStyle = '#00FFCC';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(midX - 35, midY - 20, 70, 20, 6);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#00FFCC';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`d = ${currentDistance.toFixed(0)} m`, midX, midY - 6);

      ctx.restore();
    }

    // 12. Draw Cars
    if (showAll4Cars) {
      // Draw 4 cars moving in 4 directions simultaneously to show SGK concept
      const dist = currentDistance * pxPerMeter;
      // North
      drawCar(cx, cy - dist, 'NORTH', '#3B82F6', 'Bắc 🚗');
      // East
      drawCar(cx + dist, cy, 'EAST', '#10B981', 'Đông 🚙');
      // South
      drawCar(cx, cy + dist, 'SOUTH', '#F59E0B', 'Nam 🚕');
      // West
      drawCar(cx - dist, cy, 'WEST', '#EC4899', 'Tây 🏎️');
    } else {
      // Draw Single active car
      let carX = cx;
      let carY = cy;
      const dist = currentDistance * pxPerMeter;

      if (selectedDirection === 'NORTH') carY = cy - dist;
      else if (selectedDirection === 'EAST') carX = cx + dist;
      else if (selectedDirection === 'SOUTH') carY = cy + dist;
      else if (selectedDirection === 'WEST') carX = cx - dist;

      drawCar(carX, carY, selectedDirection, '#0284C7', 'Ô tô SGK');
    }
  }, [
    progress,
    selectedDirection,
    speedKmh,
    travelTimeSec,
    showAll4Cars,
    showVectorD,
    showScaleRuler
  ]);

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

  const handleSelectDirection = (dir: Direction4) => {
    setSelectedDirection(dir);
    playSoundEffect('click');
  };

  return (
    <div className="rounded-2xl border border-cyan-500/30 bg-gradient-to-b from-[#081226] via-[#0B1A38] to-[#060D1E] p-4 sm:p-6 shadow-2xl space-y-5">
      {/* 1. HEADER TITLE WITH SGK INFO */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#00FFCC]">
            <Sparkles className="h-4 w-4 text-[#00D4FF]" />
            <span>Mô phỏng Diễn họa 3D Thực tế ảo</span>
            <span className="text-gray-500">•</span>
            <span className="text-amber-400">Trang 21 SGK Vật lí 10</span>
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
            <span>Bài toán Khởi động: Xe ô tô qua Ngã tư đường 4 hướng</span>
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
            <span className="hidden sm:inline">{soundEnabled ? 'Âm thanh: Bật' : 'Tắt âm'}</span>
          </button>
        </div>
      </div>

      {/* 2. MAIN INTERACTIVE CANVAS VIEWPORT */}
      <div className="relative w-full h-[360px] sm:h-[430px] rounded-2xl overflow-hidden border border-cyan-500/30 bg-[#061022] shadow-inner">
        <canvas
          ref={canvasRef}
          width={760}
          height={430}
          className="w-full h-full object-contain"
        />

        {/* Floating Quick Action Overlay Buttons for 4 Directions */}
        <div className="absolute top-3 right-3 flex flex-col gap-1.5 bg-black/75 p-2 rounded-xl border border-white/15 backdrop-blur-md">
          <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-300 text-center mb-1">
            Chọn Hướng Rẽ
          </span>
          <div className="grid grid-cols-3 gap-1 w-28 mx-auto">
            <div />
            <button
              onClick={() => handleSelectDirection('NORTH')}
              className={`p-1.5 rounded-lg flex flex-col items-center justify-center font-bold text-xs transition-all cursor-pointer ${
                selectedDirection === 'NORTH'
                  ? 'bg-blue-600 text-white shadow-lg ring-2 ring-cyan-300'
                  : 'bg-slate-800 text-gray-300 hover:bg-slate-700'
              }`}
              title="Hướng Bắc (Điểm C, B, A)"
            >
              <ArrowUp className="h-4 w-4" />
              <span className="text-[9px]">Bắc</span>
            </button>
            <div />

            <button
              onClick={() => handleSelectDirection('WEST')}
              className={`p-1.5 rounded-lg flex flex-col items-center justify-center font-bold text-xs transition-all cursor-pointer ${
                selectedDirection === 'WEST'
                  ? 'bg-pink-600 text-white shadow-lg ring-2 ring-cyan-300'
                  : 'bg-slate-800 text-gray-300 hover:bg-slate-700'
              }`}
              title="Hướng Tây (Điểm I, H, G)"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="text-[9px]">Tây</span>
            </button>
            <div className="flex items-center justify-center text-xs text-cyan-400 font-bold">O</div>
            <button
              onClick={() => handleSelectDirection('EAST')}
              className={`p-1.5 rounded-lg flex flex-col items-center justify-center font-bold text-xs transition-all cursor-pointer ${
                selectedDirection === 'EAST'
                  ? 'bg-emerald-600 text-white shadow-lg ring-2 ring-cyan-300'
                  : 'bg-slate-800 text-gray-300 hover:bg-slate-700'
              }`}
              title="Hướng Đông (Điểm K, L, M)"
            >
              <ArrowRight className="h-4 w-4" />
              <span className="text-[9px]">Đông</span>
            </button>

            <div />
            <button
              onClick={() => handleSelectDirection('SOUTH')}
              className={`p-1.5 rounded-lg flex flex-col items-center justify-center font-bold text-xs transition-all cursor-pointer ${
                selectedDirection === 'SOUTH'
                  ? 'bg-amber-600 text-white shadow-lg ring-2 ring-cyan-300'
                  : 'bg-slate-800 text-gray-300 hover:bg-slate-700'
              }`}
              title="Hướng Nam (Điểm D, E, F)"
            >
              <ArrowDown className="h-4 w-4" />
              <span className="text-[9px]">Nam</span>
            </button>
            <div />
          </div>
        </div>

        {/* Live HUD telemetry at Bottom-Right */}
        <div className="absolute bottom-3 right-3 bg-black/85 p-2.5 sm:p-3 rounded-xl border border-cyan-500/40 backdrop-blur-md text-xs space-y-1 shadow-xl">
          <div className="flex justify-between items-center gap-3">
            <span className="text-gray-400">Vận tốc $v$:</span>
            <span className="text-amber-400 font-mono font-bold">{speedKmh} km/h ({speedMs.toFixed(0)} m/s)</span>
          </div>
          <div className="flex justify-between items-center gap-3">
            <span className="text-gray-400">Thời gian $t$:</span>
            <span className="text-cyan-300 font-mono font-bold">{travelTimeSec} s</span>
          </div>
          <div className="flex justify-between items-center gap-3 border-t border-white/10 pt-1">
            <span className="text-emerald-400 font-bold">Quãng đường $s$:</span>
            <span className="text-emerald-300 font-mono font-bold">{currentDistance.toFixed(1)} / {totalDistance.toFixed(0)} m</span>
          </div>
          <div className="flex justify-between items-center gap-3">
            <span className="text-[#00FFCC] font-bold">Vị trí hiện tại:</span>
            <span className="text-[#00FFCC] font-bold font-mono">
              {getDestinationPointName(selectedDirection, currentDistance)}
            </span>
          </div>
        </div>
      </div>

      {/* 3. SIMULATION CONTROLS & SLIDERS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Playback Buttons */}
        <div className="rounded-xl border border-white/10 bg-[#0C1528] p-4 flex flex-col justify-between space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-cyan-300">
            Điều khiển Xe Chạy:
          </span>
          <div className="flex items-center gap-2">
            {!isPlaying ? (
              <button
                onClick={handleStart}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-black font-bold text-sm shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
              >
                <Play className="h-4 w-4 fill-current" />
                <span>Cho Xe Chạy</span>
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
              title="Đặt lại về gốc O"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>

          {/* Toggle Multi-Car mode */}
          <button
            onClick={() => setShowAll4Cars(!showAll4Cars)}
            className={`w-full py-1.5 px-2.5 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              showAll4Cars
                ? 'border-emerald-500/50 bg-emerald-950/50 text-emerald-300'
                : 'border-white/10 bg-slate-800/80 text-gray-300 hover:bg-slate-700'
            }`}
          >
            <Layers className="h-3.5 w-3.5 text-cyan-400" />
            <span>{showAll4Cars ? '✓ Chế độ 4 Xe Cùng Chạy' : 'Thử Chế độ 4 Xe Cùng Chạy'}</span>
          </button>
        </div>

        {/* Speed Slider */}
        <div className="rounded-xl border border-white/10 bg-[#0C1528] p-4 space-y-2.5">
          <div className="flex justify-between items-center text-xs font-bold text-gray-300">
            <span className="flex items-center gap-1 text-amber-400">
              <Sliders className="h-3.5 w-3.5" />
              Tốc độ không đổi $v$:
            </span>
            <span className="font-mono text-amber-300 font-bold text-sm">{speedKmh} km/h ({speedMs.toFixed(1)} m/s)</span>
          </div>
          <input
            type="range"
            min={18}
            max={72}
            step={18}
            value={speedKmh}
            onChange={(e) => {
              setSpeedKmh(Number(e.target.value));
              setProgress(0);
              setIsPlaying(false);
            }}
            className="w-full accent-amber-400 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-gray-400">
            <span>18 km/h (5 m/s)</span>
            <span className="text-amber-400 font-bold">36 km/h (10 m/s - Chuẩn SGK)</span>
            <span>72 km/h (20 m/s)</span>
          </div>
        </div>

        {/* Travel Time Slider */}
        <div className="rounded-xl border border-white/10 bg-[#0C1528] p-4 space-y-2.5">
          <div className="flex justify-between items-center text-xs font-bold text-gray-300">
            <span className="flex items-center gap-1 text-cyan-300">
              <Sliders className="h-3.5 w-3.5" />
              Thời gian đi tiếp $t$:
            </span>
            <span className="font-mono text-cyan-300 font-bold text-sm">{travelTimeSec} giây</span>
          </div>
          <input
            type="range"
            min={5}
            max={15}
            step={5}
            value={travelTimeSec}
            onChange={(e) => {
              setTravelTimeSec(Number(e.target.value));
              setProgress(0);
              setIsPlaying(false);
            }}
            className="w-full accent-[#00D4FF] cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-gray-400">
            <span>5 giây (50 m)</span>
            <span className="text-cyan-300 font-bold">10 giây (100 m - Chuẩn SGK)</span>
            <span>15 giây (150 m)</span>
          </div>
        </div>
      </div>

      {/* 4. COMPREHENSIVE PEDAGOGICAL SGK ANALYSIS ACCORDION */}
      <div className="rounded-xl border border-cyan-500/20 bg-cyan-950/20 p-4 sm:p-5 space-y-3">
        <div className="flex items-center gap-2 text-sm font-bold text-[#00FFCC]">
          <CheckCircle2 className="h-4.5 w-4.5 text-[#00D4FF]" />
          <span>Lời giải Phân tích Chuẩn mực SGK Trang 21:</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm text-gray-200">
          <div className="p-3.5 rounded-xl border border-white/10 bg-[#081326] space-y-2">
            <span className="font-bold text-amber-400 block">
              a) Tính Quãng đường đi tiếp của ô tô (s):
            </span>
            <p className="leading-relaxed">
              <InlinePhysicsText text="• Đổi đơn vị vận tốc: $v = 36\text{ km/h} = \frac{36}{3,6} = 10\text{ m/s}$." />
            </p>
            <div className="leading-relaxed">
              <span>• Quãng đường ô tô đi tiếp sau thời gian t = 10 s là:</span>
              <div className="text-amber-300 font-mono text-base font-bold mt-1 bg-amber-950/40 p-2 rounded-lg border border-amber-500/30 text-center">
                s = v × t = 10 × 10 = 100 m
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl border border-white/10 bg-[#081326] space-y-2">
            <span className="font-bold text-[#00FFCC] block">
              b) Vị trí của ô tô ở điểm nào trên hình vẽ?
            </span>
            <p className="leading-relaxed">
              Do đề bài chỉ cho tốc độ và thời gian mà <strong>chưa cho biết hướng chuyển động</strong>, nên ô tô có thể ở một trong 4 điểm cách gốc O đúng <strong>100 m</strong> (ứng với 2 đoạn tỉ xích 2 × 50 m):
            </p>
            <ul className="space-y-1 font-mono text-cyan-200 pl-2">
              <li>• Nếu đi theo hướng <strong>Bắc</strong>: Ô tô ở <strong>Điểm B</strong> (cách O 100m).</li>
              <li>• Nếu đi theo hướng <strong>Đông</strong>: Ô tô ở <strong>Điểm L</strong> (cách O 100m).</li>
              <li>• Nếu đi theo hướng <strong>Nam</strong>: Ô tô ở <strong>Điểm E</strong> (cách O 100m).</li>
              <li>• Nếu đi theo hướng <strong>Tây</strong>: Ô tô ở <strong>Điểm H</strong> (cách O 100m).</li>
            </ul>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-cyan-900/30 border border-cyan-500/30 flex items-start gap-2.5 text-xs sm:text-sm text-cyan-100">
          <Info className="h-4 w-4 text-[#00D4FF] shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            💡 <strong>Bản chất cốt lõi của bài học:</strong> Quãng đường <em>s</em> là một <em>đại lượng vô hướng</em> (chỉ cho biết độ dài đường đi 100 m mà không cho biết vị trí đích). Muốn xác định chính xác vị trí của vật, ta cần dùng <strong>Độ dịch chuyển d (vectơ)</strong> (một <em>đại lượng vectơ</em> gồm cả độ lớn và hướng chuyển động).
          </p>
        </div>
      </div>
    </div>
  );
};
