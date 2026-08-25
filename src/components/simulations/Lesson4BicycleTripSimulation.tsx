import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Bike,
  Navigation,
  Sparkles,
  Info,
  CheckCircle2,
  Volume2,
  VolumeX,
  Sliders,
  Table as TableIcon,
  Eye,
  TrendingUp,
  MapPin,
  Building2,
  Home,
  Fuel,
  ShoppingBag,
  GraduationCap
} from 'lucide-react';
import { InlinePhysicsText } from '../ui/FormattedPhysicsText';

export const Lesson4BicycleTripSimulation: React.FC = () => {
  // Scenario Modes:
  // 'FULL_TRIP': N (0) -> X (400) -> S (800) -> N (0) -> T (1200)
  // 'GAS_TO_MARKET': X (400) -> S (800) [Cau a]
  // 'MANUAL': Free interactive slider
  const [tripMode, setTripMode] = useState<'FULL_TRIP' | 'GAS_TO_MARKET' | 'MANUAL'>('FULL_TRIP');
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0); // 0 to 1 along current scenario
  const [animSpeed, setAnimSpeed] = useState<number>(1);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [showVectorD, setShowVectorD] = useState<boolean>(true);
  const [showPathTrail, setShowPathTrail] = useState<boolean>(true);
  const [showTable, setShowTable] = useState<boolean>(true);
  const [currentStageName, setCurrentStageName] = useState<string>('Xuất phát tại Nhà (N = 0 m)');

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);

  // Sound generator
  const playSoundEffect = (type: 'bell' | 'arrive' | 'click') => {
    if (!soundEnabled) return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      if (type === 'bell') {
        // Bicycle bell dual chime
        const playChime = (freq: number, startDelay: number) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, ctx.currentTime + startDelay);
          gain.gain.setValueAtTime(0.08, ctx.currentTime + startDelay);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + startDelay + 0.25);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(ctx.currentTime + startDelay);
          osc.stop(ctx.currentTime + startDelay + 0.25);
        };
        playChime(2093, 0);    // C7
        playChime(2637, 0.08); // E7
        playChime(2093, 0.16); // C7
      } else if (type === 'arrive') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(523.25, ctx.currentTime);
        osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1);
        osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.2);
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

  // World parameters: Coordinate range [0 m, 1400 m]
  // In Full Trip: Total distance s_total = 800 + 800 + 1200 = 2800 m.
  // Stage 1 (0 to 800/2800 ~ 0.2857): N (0) -> X (400) -> S (800)
  // Stage 2 (0.2857 to 1600/2800 ~ 0.5714): S (800) -> N (0)
  // Stage 3 (0.5714 to 2800/2800 = 1.0): N (0) -> T (1200)

  // Calculate current real-world physical states
  let currentPosM = 0; // x coordinate in meters
  let accumulatedDistanceM = 0; // total path s
  let displacementM = 0; // displacement d = x - x_origin
  let isMovingForward = true; // true: facing right (+), false: facing left (-)

  if (tripMode === 'FULL_TRIP') {
    const totalS = 2800;
    const currentS = progress * totalS;
    accumulatedDistanceM = currentS;

    if (currentS <= 800) {
      // Leg 1: N (0) -> S (800)
      currentPosM = currentS;
      displacementM = currentPosM - 0;
      isMovingForward = true;
    } else if (currentS <= 1600) {
      // Leg 2: S (800) -> N (0)
      const leg2S = currentS - 800;
      currentPosM = 800 - leg2S;
      displacementM = currentPosM - 0;
      isMovingForward = false;
    } else {
      // Leg 3: N (0) -> T (1200)
      const leg3S = currentS - 1600;
      currentPosM = leg3S;
      displacementM = currentPosM - 0;
      isMovingForward = true;
    }
  } else if (tripMode === 'GAS_TO_MARKET') {
    // X (400) -> S (800), total s = 400 m
    accumulatedDistanceM = progress * 400;
    currentPosM = 400 + progress * 400;
    displacementM = currentPosM - 400; // relative to X or relative to N (+400 to +800)
    isMovingForward = true;
  } else {
    // MANUAL mode
    currentPosM = progress * 1200;
    accumulatedDistanceM = currentPosM;
    displacementM = currentPosM;
    isMovingForward = true;
  }

  // Update human-readable stage text
  useEffect(() => {
    if (tripMode === 'GAS_TO_MARKET') {
      setCurrentStageName(`Chặng a: Trạm xăng (400 m) ➔ Siêu thị (800 m) [x = ${currentPosM.toFixed(0)} m]`);
    } else if (tripMode === 'FULL_TRIP') {
      if (accumulatedDistanceM < 400) {
        setCurrentStageName(`Chặng 1a: Nhà (0 m) ➔ Trạm xăng (400 m) [x = ${currentPosM.toFixed(0)} m]`);
      } else if (accumulatedDistanceM < 800) {
        setCurrentStageName(`Chặng 1b: Trạm xăng (400 m) ➔ Siêu thị (800 m) [x = ${currentPosM.toFixed(0)} m]`);
      } else if (accumulatedDistanceM < 1600) {
        setCurrentStageName(`Chặng 2: Siêu thị (800 m) ➔ Quay về Nhà (0 m) [x = ${currentPosM.toFixed(0)} m]`);
      } else {
        setCurrentStageName(`Chặng 3: Nhà (0 m) ➔ Trường học (1200 m) [x = ${currentPosM.toFixed(0)} m]`);
      }
    } else {
      setCurrentStageName(`Vị trí tùy chỉnh: x = ${currentPosM.toFixed(0)} m`);
    }
  }, [currentPosM, accumulatedDistanceM, tripMode]);

  // Animation Loop
  useEffect(() => {
    if (!isPlaying) {
      lastTimeRef.current = null;
      return;
    }

    const durationMs = (tripMode === 'FULL_TRIP' ? 12000 : 6000) / animSpeed;

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
  }, [isPlaying, animSpeed, tripMode]);

  // Main Canvas Rendering for SGK Hình 4.7
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);

    // Coordinate mapping:
    // Physical coordinate: 0 m -> 1300 m
    // Screen X: paddingLeft = 80px, paddingRight = 70px -> available width = w - 150
    const padL = 75;
    const padR = 60;
    const maxCoordM = 1300;
    const metersToScreenX = (m: number) => padL + (m / maxCoordM) * (w - padL - padR);

    const roadY = h - 120; // Asphalt Road Top Surface
    const axisY = h - 55;  // Coordinate axis line

    // 1. SKY & BACKGROUND GRADIENT
    const skyGrad = ctx.createLinearGradient(0, 0, 0, roadY);
    skyGrad.addColorStop(0, '#0A1B3A');
    skyGrad.addColorStop(0.6, '#102B52');
    skyGrad.addColorStop(1, '#1A3F6D');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, w, roadY);

    // Distant soft hills / horizon
    ctx.fillStyle = '#17365D';
    ctx.beginPath();
    ctx.moveTo(0, roadY - 40);
    ctx.bezierCurveTo(w * 0.25, roadY - 80, w * 0.5, roadY - 30, w * 0.75, roadY - 70);
    ctx.bezierCurveTo(w * 0.9, roadY - 40, w, roadY - 60, w, roadY);
    ctx.lineTo(0, roadY);
    ctx.closePath();
    ctx.fill();

    // 2. GREEN LAWN / SIDEWALK STRIP
    const lawnGrad = ctx.createLinearGradient(0, roadY - 40, 0, roadY);
    lawnGrad.addColorStop(0, '#1E4620');
    lawnGrad.addColorStop(1, '#2E6B32');
    ctx.fillStyle = lawnGrad;
    ctx.fillRect(0, roadY - 30, w, 30);

    // Decorative sidewalk tiles
    ctx.fillStyle = '#CBD5E1';
    ctx.fillRect(0, roadY - 8, w, 8);
    ctx.strokeStyle = '#94A3B8';
    ctx.lineWidth = 1;
    for (let sx = 0; sx < w; sx += 24) {
      ctx.beginPath();
      ctx.moveTo(sx, roadY - 8);
      ctx.lineTo(sx, roadY);
      ctx.stroke();
    }

    // 3. ASPHALT ROAD & MARKINGS
    const roadGrad = ctx.createLinearGradient(0, roadY, 0, h);
    roadGrad.addColorStop(0, '#334155');
    roadGrad.addColorStop(1, '#1E293B');
    ctx.fillStyle = roadGrad;
    ctx.fillRect(0, roadY, w, h - roadY);

    // Road dashed lane divider
    ctx.strokeStyle = '#FACC15';
    ctx.lineWidth = 2.5;
    ctx.setLineDash([16, 12]);
    ctx.beginPath();
    ctx.moveTo(0, roadY + 28);
    ctx.lineTo(w, roadY + 28);
    ctx.stroke();
    ctx.setLineDash([]);

    // 4. DRAW 4 LANDMARKS (Nhà N, Trạm Xăng X, Siêu Thị S, Trường Học T)

    // Helper: Draw walkway ramp from building to sidewalk
    const drawWalkway = (centerX: number, width: number) => {
      ctx.fillStyle = '#E2E8F0';
      ctx.beginPath();
      ctx.moveTo(centerX - width / 2, roadY - 4);
      ctx.lineTo(centerX + width / 2, roadY - 4);
      ctx.lineTo(centerX + width / 2 + 10, roadY);
      ctx.lineTo(centerX - width / 2 - 10, roadY);
      ctx.closePath();
      ctx.fill();
    };

    // A) NHÀ BẠN A (N = 0 m)
    const nX = metersToScreenX(0);
    drawWalkway(nX, 46);
    ctx.save();
    // House Base
    ctx.fillStyle = '#FED7AA'; // warm cream wall
    ctx.strokeStyle = '#EA580C';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(nX - 28, roadY - 85, 56, 55, 4);
    ctx.fill();
    ctx.stroke();

    // Red/Orange Triangular Roof
    ctx.fillStyle = '#DC2626';
    ctx.beginPath();
    ctx.moveTo(nX, roadY - 125);
    ctx.lineTo(nX - 36, roadY - 83);
    ctx.lineTo(nX + 36, roadY - 83);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#991B1B';
    ctx.stroke();

    // Chimney
    ctx.fillStyle = '#B91C1C';
    ctx.fillRect(nX + 15, roadY - 120, 10, 22);

    // Door & Window
    ctx.fillStyle = '#0284C7'; // Blue door
    ctx.fillRect(nX - 20, roadY - 60, 18, 30);
    ctx.fillStyle = '#38BDF8'; // Window
    ctx.fillRect(nX + 5, roadY - 72, 16, 16);
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 1;
    ctx.strokeRect(nX + 5, roadY - 72, 16, 16);

    // House Label Sign
    ctx.fillStyle = '#FDE047';
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Nhà bạn A', nX, roadY - 132);
    ctx.restore();

    // B) TRẠM XĂNG (X = 400 m)
    const xX = metersToScreenX(400);
    drawWalkway(xX, 60);
    ctx.save();
    // Main Roof Canopy
    ctx.fillStyle = '#991B1B'; // Red canopy beam
    ctx.fillRect(xX - 44, roadY - 102, 88, 18);
    // Yellow Sign Board
    ctx.fillStyle = '#FACC15';
    ctx.fillRect(xX - 38, roadY - 118, 76, 16);
    ctx.fillStyle = '#78350F';
    ctx.font = 'bold 10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Trạm Xăng', xX, roadY - 106);

    // Canopy Support Pillars (2 grey pillars)
    ctx.fillStyle = '#334155';
    ctx.fillRect(xX - 38, roadY - 84, 8, 54);
    ctx.fillRect(xX + 30, roadY - 84, 8, 54);

    // Gas Pump 1 & Pump 2 (Red & White)
    const drawPump = (px: number) => {
      ctx.fillStyle = '#EF4444';
      ctx.beginPath();
      ctx.roundRect(px - 9, roadY - 62, 18, 32, 3);
      ctx.fill();
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Screen
      ctx.fillStyle = '#FDE047';
      ctx.fillRect(px - 6, roadY - 58, 12, 8);
      // Nozzle hose
      ctx.strokeStyle = '#0F172A';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(px + 9, roadY - 48);
      ctx.quadraticCurveTo(px + 14, roadY - 40, px + 9, roadY - 34);
      ctx.stroke();
    };
    drawPump(xX - 18);
    drawPump(xX + 18);
    ctx.restore();

    // C) SIÊU THỊ (S = 800 m)
    const sX = metersToScreenX(800);
    drawWalkway(sX, 70);
    ctx.save();
    // Modern Supermarket Building
    ctx.fillStyle = '#38BDF8'; // Glass facade
    ctx.strokeStyle = '#0284C7';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(sX - 52, roadY - 95, 104, 65, 4);
    ctx.fill();
    ctx.stroke();

    // Glass panel grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 1;
    for (let gx = sX - 40; gx < sX + 45; gx += 22) {
      ctx.beginPath();
      ctx.moveTo(gx, roadY - 75);
      ctx.lineTo(gx, roadY - 30);
      ctx.stroke();
    }

    // Top Red Header & Sign
    ctx.fillStyle = '#DC2626';
    ctx.fillRect(sX - 54, roadY - 110, 108, 18);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('★ Siêu thị ★', sX, roadY - 97);

    // AC unit on roof
    ctx.fillStyle = '#E2E8F0';
    ctx.fillRect(sX + 26, roadY - 122, 18, 12);
    ctx.restore();

    // D) TRƯỜNG HỌC (T = 1200 m)
    const tX = metersToScreenX(1200);
    drawWalkway(tX, 90);
    ctx.save();
    // Two-story Yellow School Building
    ctx.fillStyle = '#F59E0B'; // Main yellow brick
    ctx.strokeStyle = '#B45309';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(tX - 65, roadY - 110, 130, 80, 4);
    ctx.fill();
    ctx.stroke();

    // Center Tower with Round Clock
    ctx.fillStyle = '#D97706';
    ctx.beginPath();
    ctx.roundRect(tX - 25, roadY - 145, 50, 40, 4);
    ctx.fill();
    ctx.stroke();

    // Clock Face
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(tX, roadY - 128, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#78350F';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    // Clock hands (showing 7:00 AM)
    ctx.beginPath();
    ctx.moveTo(tX, roadY - 128);
    ctx.lineTo(tX, roadY - 136); // Minute hand (12)
    ctx.moveTo(tX, roadY - 128);
    ctx.lineTo(tX - 5, roadY - 124); // Hour hand (7)
    ctx.stroke();

    // Windows rows (8 windows)
    ctx.fillStyle = '#38BDF8';
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 1;
    [-52, -36, 26, 42].forEach((wx) => {
      // 2nd floor
      ctx.fillRect(tX + wx - 6, roadY - 98, 12, 16);
      ctx.strokeRect(tX + wx - 6, roadY - 98, 12, 16);
      // 1st floor
      ctx.fillRect(tX + wx - 6, roadY - 70, 12, 16);
      ctx.strokeRect(tX + wx - 6, roadY - 70, 12, 16);
    });

    // Main Entrance Doors
    ctx.fillStyle = '#78350F';
    ctx.fillRect(tX - 16, roadY - 55, 32, 25);
    ctx.fillStyle = '#FDE047';
    ctx.fillRect(tX - 14, roadY - 50, 12, 20);
    ctx.fillRect(tX + 2, roadY - 50, 12, 20);

    // School Sign
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Trường Học', tX, roadY - 152);
    ctx.restore();

    // 5. COORDINATE AXIS Ox & METRIC TICKS
    ctx.save();
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(padL - 25, axisY);
    ctx.lineTo(w - padR + 35, axisY);
    ctx.stroke();

    // Arrow Head +x
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.moveTo(w - padR + 35, axisY);
    ctx.lineTo(w - padR + 25, axisY - 5);
    ctx.lineTo(w - padR + 25, axisY + 5);
    ctx.closePath();
    ctx.fill();

    // Axis label
    ctx.font = 'bold 13px sans-serif';
    ctx.fillText('x (m)', w - padR + 42, axisY + 4);

    // Major Ticks (0, 200, 400, 600, 800, 1000, 1200)
    const ticks = [
      { m: 0, label: '0', sub: 'N (Gốc O)' },
      { m: 200, label: '200 m', sub: '' },
      { m: 400, label: '400 m', sub: 'X (Trạm xăng)' },
      { m: 600, label: '600 m', sub: '' },
      { m: 800, label: '800 m', sub: 'S (Siêu thị)' },
      { m: 1000, label: '1000 m', sub: '' },
      { m: 1200, label: '1200 m', sub: 'T (Trường)' },
    ];

    ticks.forEach((tk) => {
      const scrX = metersToScreenX(tk.m);
      // Tick vertical line
      ctx.strokeStyle = tk.sub ? '#00FFCC' : '#94A3B8';
      ctx.lineWidth = tk.sub ? 2.5 : 1.5;
      ctx.beginPath();
      ctx.moveTo(scrX, axisY - 8);
      ctx.lineTo(scrX, axisY + 8);
      ctx.stroke();

      // Number label
      ctx.fillStyle = tk.sub ? '#00FFCC' : '#E2E8F0';
      ctx.font = tk.sub ? 'bold 12px sans-serif' : '11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(tk.label, scrX, axisY + 22);

      // Landmark symbol
      if (tk.sub) {
        ctx.fillStyle = '#FDE047';
        ctx.font = 'bold 12px sans-serif';
        ctx.fillText(tk.sub.split(' ')[0], scrX, axisY - 14);
      }
    });

    // Title Caption "Hình 4.7"
    ctx.fillStyle = '#94A3B8';
    ctx.font = 'italic 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Hình 4.7: Sơ đồ chuyển động bạn A đi xe đạp', w / 2, h - 8);
    ctx.restore();

    // 6. VECTOR DISPLACEMENT d & DISTANCE TRAIL
    const currentScreenX = metersToScreenX(currentPosM);
    const originScreenX = tripMode === 'GAS_TO_MARKET' ? metersToScreenX(400) : metersToScreenX(0);

    if (showVectorD && Math.abs(currentScreenX - originScreenX) > 4) {
      ctx.save();
      const vecY = roadY + 52;
      ctx.strokeStyle = '#00FFCC';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(originScreenX, vecY);
      ctx.lineTo(currentScreenX, vecY);
      ctx.stroke();

      // Arrow head for vector d
      const dir = currentScreenX >= originScreenX ? 1 : -1;
      ctx.fillStyle = '#00FFCC';
      ctx.beginPath();
      ctx.moveTo(currentScreenX, vecY);
      ctx.lineTo(currentScreenX - dir * 10, vecY - 5);
      ctx.lineTo(currentScreenX - dir * 10, vecY + 5);
      ctx.closePath();
      ctx.fill();

      // Vector Label badge
      const midVX = (originScreenX + currentScreenX) / 2;
      ctx.fillStyle = 'rgba(10, 25, 47, 0.9)';
      ctx.strokeStyle = '#00FFCC';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(midVX - 45, vecY - 20, 90, 18, 4);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#00FFCC';
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`d = ${displacementM >= 0 ? '+' : ''}${displacementM.toFixed(0)} m`, midVX, vecY - 7);
      ctx.restore();
    }

    // 7. DRAW CYCLIST (BẠN A ĐẠP XE ĐẠP 3D)
    ctx.save();
    const bikeX = currentScreenX;
    const bikeY = roadY + 14;

    ctx.translate(bikeX, bikeY);
    if (!isMovingForward) {
      ctx.scale(-1, 1); // Flip horizontally when cycling backward towards house
    }

    // Pedaling angle linked to accumulated distance
    const wheelRot = (accumulatedDistanceM / 2) % (Math.PI * 2);

    // Wheels (2 Spoked Wheels)
    const drawBikeWheel = (wx: number, wy: number) => {
      // Tyre
      ctx.fillStyle = '#0F172A';
      ctx.beginPath();
      ctx.arc(wx, wy, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#94A3B8';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Spokes
      ctx.strokeStyle = '#E2E8F0';
      ctx.lineWidth = 1;
      for (let a = 0; a < 4; a++) {
        const ang = wheelRot + (a * Math.PI) / 4;
        ctx.beginPath();
        ctx.moveTo(wx + Math.cos(ang) * 9, wy + Math.sin(ang) * 9);
        ctx.lineTo(wx - Math.cos(ang) * 9, wy - Math.sin(ang) * 9);
        ctx.stroke();
      }
    };

    drawBikeWheel(-14, 0); // Rear Wheel
    drawBikeWheel(14, 0);  // Front Wheel

    // Bike Frame (Cyan / Blue Sport Frame)
    ctx.strokeStyle = '#0284C7';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(-14, 0); // Rear axle
    ctx.lineTo(-2, 0);  // Bottom bracket (pedal)
    ctx.lineTo(8, -12); // Head tube top
    ctx.lineTo(14, 0);  // Front axle
    ctx.moveTo(-2, 0);
    ctx.lineTo(-6, -14);// Seat tube top
    ctx.lineTo(8, -12); // Top tube
    ctx.moveTo(-14, 0);
    ctx.lineTo(-6, -14);// Seat stays
    ctx.stroke();

    // Handlebar & Saddle
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 2;
    // Handlebar
    ctx.beginPath();
    ctx.moveTo(8, -12);
    ctx.lineTo(10, -18);
    ctx.lineTo(14, -18);
    ctx.stroke();
    // Saddle
    ctx.fillStyle = '#1E293B';
    ctx.fillRect(-10, -16, 9, 3);

    // Cyclist Body (Bạn A)
    // Legs & Pedals
    const legAng = wheelRot;
    const pedalX = -2 + Math.cos(legAng) * 4;
    const pedalY = 0 + Math.sin(legAng) * 4;
    ctx.strokeStyle = '#1E3A8A';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-6, -14); // Hip
    ctx.lineTo(pedalX, pedalY - 6); // Knee
    ctx.lineTo(pedalX, pedalY); // Foot
    ctx.stroke();

    // Torso (Light Blue Shirt)
    ctx.fillStyle = '#0284C7';
    ctx.beginPath();
    ctx.moveTo(-6, -14);
    ctx.lineTo(2, -26);
    ctx.lineTo(7, -24);
    ctx.lineTo(0, -12);
    ctx.closePath();
    ctx.fill();

    // Arms
    ctx.strokeStyle = '#FDE047'; // Skin
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(4, -24); // Shoulder
    ctx.lineTo(11, -17); // Hand on bar
    ctx.stroke();

    // Head & Helmet
    ctx.fillStyle = '#FDE047'; // Face
    ctx.beginPath();
    ctx.arc(4, -31, 5, 0, Math.PI * 2);
    ctx.fill();

    // Cyan Helmet
    ctx.fillStyle = '#00D4FF';
    ctx.beginPath();
    ctx.arc(4, -33, 6, Math.PI, Math.PI * 2);
    ctx.lineTo(11, -33);
    ctx.lineTo(4, -36);
    ctx.closePath();
    ctx.fill();

    // Cyclist HUD Badge
    if (!isMovingForward) ctx.scale(-1, 1);
    ctx.fillStyle = '#FDE047';
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Bạn A', 0, -42);
    ctx.restore();

  }, [currentPosM, accumulatedDistanceM, displacementM, tripMode, showVectorD, isMovingForward]);

  const handleStart = () => {
    if (progress >= 1) setProgress(0);
    setIsPlaying(true);
    playSoundEffect('bell');
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
            <span>Mô Phỏng 3D Hình 4.7 SGK Vật Lí 10</span>
            <span className="text-gray-500">•</span>
            <span className="text-amber-400">Trang 24 - 25</span>
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
            <Bike className="h-5 w-5 text-cyan-400" />
            <span>Chuyến Đi Xe Đạp Của Bạn A (Nhà ➔ Trạm Xăng ➔ Siêu Thị ➔ Trường Học)</span>
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
            title="Bật/Tắt chuông xe đạp & âm thanh"
          >
            {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            <span className="hidden sm:inline">{soundEnabled ? 'Chuông xe: Bật' : 'Tắt âm'}</span>
          </button>
        </div>
      </div>

      {/* 2. SCENARIO SELECTOR */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-[#09152B] p-2 rounded-xl border border-white/10 text-xs">
        <div className="flex items-center gap-1.5 text-gray-300 font-medium pl-1">
          <Navigation className="h-4 w-4 text-[#00D4FF]" />
          <span>Kịch bản di chuyển:</span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => {
              setTripMode('FULL_TRIP');
              setProgress(0);
              setIsPlaying(false);
            }}
            className={`px-3.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              tripMode === 'FULL_TRIP'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md'
                : 'text-gray-400 hover:text-gray-200 bg-white/5'
            }`}
          >
            🚗 Toàn Bộ Chuyến Đi (Câu b: Nhà ➔ X ➔ S ➔ Nhà ➔ Trường)
          </button>

          <button
            onClick={() => {
              setTripMode('GAS_TO_MARKET');
              setProgress(0);
              setIsPlaying(false);
            }}
            className={`px-3.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              tripMode === 'GAS_TO_MARKET'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md'
                : 'text-gray-400 hover:text-gray-200 bg-white/5'
            }`}
          >
            ⛽ Chặng Trạm Xăng ➔ Siêu Thị (Câu a)
          </button>

          <button
            onClick={() => {
              setTripMode('MANUAL');
              setIsPlaying(false);
            }}
            className={`px-3.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              tripMode === 'MANUAL'
                ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-md'
                : 'text-gray-400 hover:text-gray-200 bg-white/5'
            }`}
          >
            🎛️ Tự Kéo Thước Đo
          </button>
        </div>
      </div>

      {/* 3. 3D CANVAS VIEWPORT */}
      <div className="relative w-full h-[320px] sm:h-[400px] rounded-2xl overflow-hidden border border-cyan-500/30 bg-[#0A1A2F] shadow-inner flex items-center justify-center">
        <canvas
          ref={canvasRef}
          width={900}
          height={400}
          className="w-full h-full object-contain"
        />

        {/* Live HUD (Top-Right) */}
        <div className="absolute top-3 right-3 bg-black/85 p-3 rounded-xl border border-cyan-500/40 backdrop-blur-md text-xs space-y-1.5 shadow-xl max-w-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-cyan-300 border-b border-white/10 pb-1 flex justify-between">
            <span className="flex items-center gap-1.5">
              <Bike className="h-3.5 w-3.5 text-[#00FFCC]" />
              <span>Đồng hồ hành trình:</span>
            </span>
            <span className="text-amber-400 font-mono">{(progress * 100).toFixed(0)}%</span>
          </div>

          <div className="space-y-1 font-mono text-[11px]">
            <div className="flex justify-between items-center text-white">
              <span>Tọa độ hiện tại (x):</span>
              <span className="font-bold text-amber-300">{currentPosM.toFixed(0)} m</span>
            </div>
            <div className="flex justify-between items-center text-amber-300">
              <span>Quãng đường đi được (s):</span>
              <span className="font-bold">{accumulatedDistanceM.toFixed(0)} m</span>
            </div>
            <div className="flex justify-between items-center text-[#00FFCC]">
              <span>Độ dịch chuyển (d):</span>
              <span className="font-bold">{displacementM >= 0 ? '+' : ''}{displacementM.toFixed(0)} m</span>
            </div>
          </div>
        </div>

        {/* Current Stage Indicator Banner (Top-Left) */}
        <div className="absolute top-3 left-3 bg-black/80 px-3 py-1.5 rounded-xl border border-white/15 backdrop-blur-md text-xs font-semibold text-cyan-200 flex items-center gap-2">
          <MapPin className="h-3.5 w-3.5 text-amber-400" />
          <span>{currentStageName}</span>
        </div>
      </div>

      {/* 4. CONTROLS & MANUAL SLIDER */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Playback Controls */}
        <div className="rounded-xl border border-white/10 bg-[#0C1528] p-4 flex flex-col justify-between space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-cyan-300">
            Điều Khiển Chuyển Động:
          </span>
          <div className="flex items-center gap-2">
            {!isPlaying ? (
              <button
                onClick={handleStart}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-black font-bold text-sm shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
              >
                <Play className="h-4 w-4 fill-current" />
                <span>Cho Bạn A Đạp Xe</span>
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
              title="Đặt lại từ đầu"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>

          {/* Speed Selection */}
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>Tốc độ đạp xe:</span>
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

        {/* Progress / Manual Slider */}
        <div className="md:col-span-2 rounded-xl border border-white/10 bg-[#0C1528] p-4 space-y-3 flex flex-col justify-between">
          <div className="flex justify-between items-center text-xs font-bold">
            <span className="text-cyan-300 flex items-center gap-1.5">
              <Sliders className="h-3.5 w-3.5 text-cyan-400" />
              Tiến trình chuyến đi:
            </span>
            <span className="text-amber-400 font-mono">
              s = {accumulatedDistanceM.toFixed(0)} m | d = {displacementM >= 0 ? '+' : ''}{displacementM.toFixed(0)} m
            </span>
          </div>

          <input
            type="range"
            min="0"
            max="1"
            step="0.005"
            value={progress}
            onChange={(e) => {
              setProgress(parseFloat(e.target.value));
              setIsPlaying(false);
            }}
            className="w-full h-2.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
          />

          <div className="flex justify-between text-[11px] text-gray-400 font-mono">
            <span>Nhà (0 m)</span>
            <span>Trạm Xăng (400 m)</span>
            <span>Siêu Thị (800 m)</span>
            <span>Trường (1200 m)</span>
          </div>
        </div>
      </div>

      {/* 5. INTERACTIVE BẢNG 4.1 SGK (TRANG 24) */}
      <div className="rounded-xl border border-cyan-500/30 bg-[#09152B] p-4 sm:p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
          <div className="flex items-center gap-2 text-sm font-bold text-white">
            <TableIcon className="h-4.5 w-4.5 text-[#00FFCC]" />
            <span>BẢNG 4.1 (SGK TRANG 24): KẾT QUẢ ĐO ĐẠC VÀ TÍNH TOÁN QUÃNG ĐƯỜNG & ĐỘ DỊCH CHUYỂN</span>
          </div>

          <span className="text-xs px-2.5 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 font-mono">
            Quy ước: Gốc O tại Nhà, Chiều dương (+) từ Nhà đến Trường
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm border-collapse">
            <thead>
              <tr className="bg-slate-900/90 text-cyan-300 border-b border-cyan-500/40">
                <th className="p-3 font-bold border-r border-white/10">Chặng chuyển động</th>
                <th className="p-3 font-bold border-r border-white/10">Vị trí đầu ($x_1$)</th>
                <th className="p-3 font-bold border-r border-white/10">Vị trí cuối (x₂)</th>
                <th className="p-3 font-bold border-r border-white/10 text-amber-300">Quãng đường (s)</th>
                <th className="p-3 font-bold text-[#00FFCC]">Độ dịch chuyển (d)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10 text-gray-200">
              <tr className="hover:bg-white/5 transition-colors">
                <td className="p-3 font-medium flex items-center gap-2">
                  <Home className="h-3.5 w-3.5 text-orange-400" />
                  <span>Từ Nhà đến Trạm xăng</span>
                </td>
                <td className="p-3 font-mono text-gray-400">0 m</td>
                <td className="p-3 font-mono text-gray-300">400 m</td>
                <td className="p-3 font-mono font-bold text-amber-400">400 m</td>
                <td className="p-3 font-mono font-bold text-[#00FFCC]">+400 m</td>
              </tr>

              {/* Row Câu a */}
              <tr className="bg-cyan-950/30 hover:bg-cyan-950/50 transition-colors border-l-4 border-l-cyan-400">
                <td className="p-3 font-bold text-cyan-300 flex items-center gap-2">
                  <Fuel className="h-3.5 w-3.5 text-cyan-400" />
                  <span>Từ Trạm xăng đến Siêu thị (Câu a)</span>
                </td>
                <td className="p-3 font-mono text-gray-300">400 m</td>
                <td className="p-3 font-mono text-gray-300">800 m</td>
                <td className="p-3 font-mono font-bold text-amber-400 text-sm">400 m</td>
                <td className="p-3 font-mono font-bold text-[#00FFCC] text-sm">+400 m</td>
              </tr>

              <tr className="hover:bg-white/5 transition-colors">
                <td className="p-3 font-medium flex items-center gap-2">
                  <ShoppingBag className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Từ Siêu thị quay về Nhà</span>
                </td>
                <td className="p-3 font-mono text-gray-300">800 m</td>
                <td className="p-3 font-mono text-gray-400">0 m</td>
                <td className="p-3 font-mono font-bold text-amber-400">800 m</td>
                <td className="p-3 font-mono font-bold text-rose-400">-800 m</td>
              </tr>

              <tr className="hover:bg-white/5 transition-colors">
                <td className="p-3 font-medium flex items-center gap-2">
                  <GraduationCap className="h-3.5 w-3.5 text-yellow-400" />
                  <span>Từ Nhà đến Trường</span>
                </td>
                <td className="p-3 font-mono text-gray-400">0 m</td>
                <td className="p-3 font-mono text-gray-300">1200 m</td>
                <td className="p-3 font-mono font-bold text-amber-400">1200 m</td>
                <td className="p-3 font-mono font-bold text-[#00FFCC]">+1200 m</td>
              </tr>

              {/* Row Câu b */}
              <tr className="bg-emerald-950/40 hover:bg-emerald-950/60 transition-colors border-l-4 border-l-emerald-400 font-bold">
                <td className="p-3 text-emerald-300 flex items-center gap-2">
                  <Bike className="h-4 w-4 text-emerald-400" />
                  <span>CẢ CHUYẾN ĐI (Câu b: Nhà ➔ S ➔ Nhà ➔ Trường)</span>
                </td>
                <td className="p-3 font-mono text-gray-300">0 m (Nhà)</td>
                <td className="p-3 font-mono text-gray-300">1200 m (Trường)</td>
                <td className="p-3 font-mono font-bold text-amber-300 text-sm">
                  2800 m <span className="text-[10px] text-gray-400 font-normal">(800+800+1200)</span>
                </td>
                <td className="p-3 font-mono font-bold text-[#00FFCC] text-sm">
                  +1200 m <span className="text-[10px] text-gray-400 font-normal">(1200 - 0)</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 6. PEDAGOGICAL SGK ANALYSIS */}
      <div className="rounded-xl border border-cyan-500/20 bg-cyan-950/20 p-4 sm:p-5 space-y-3">
        <div className="flex items-center gap-2 text-sm font-bold text-[#00FFCC]">
          <CheckCircle2 className="h-4.5 w-4.5 text-[#00D4FF]" />
          <span>Phương Pháp Giải Chi Tiết SGK Vật Lí 10:</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm text-gray-200">
          <div className="p-3.5 rounded-xl border border-white/10 bg-[#081326] space-y-2">
            <span className="font-bold text-[#00D4FF] block">
              Câu a) Chặng từ Trạm xăng (X) đến Siêu thị (S):
            </span>
            <p className="leading-relaxed">
              • <strong>Quãng đường s:</strong> Là độ dài đoạn XS = 800 - 400 = 400 m.
              <br />
              • <strong>Độ dịch chuyển d:</strong> Vì bạn A đi theo chiều dương Ox nên:
              <br />
              <span className="font-mono text-[#00FFCC]">d_XS = x_S - x_X = 800 - 400 = +400 m</span>
            </p>
          </div>

          <div className="p-3.5 rounded-xl border border-white/10 bg-[#081326] space-y-2">
            <span className="font-bold text-emerald-400 block">
              Câu b) Cả chuyến đi (Nhà ➔ S ➔ Nhà ➔ Trường):
            </span>
            <p className="leading-relaxed">
              • <strong>Quãng đường tổng cộng:</strong>
              <br />
              <span className="font-mono text-amber-300">s = s_(N➔S) + s_(S➔N) + s_(N➔T) = 800 + 800 + 1200 = 2800 m</span>
              <br />
              • <strong>Độ dịch chuyển cả chuyến:</strong> Chỉ phụ thuộc vị trí đầu (x₁ = 0) và vị trí cuối (x₂ = 1200 m):
              <br />
              <span className="font-mono text-[#00FFCC]">d = x₂ - x₁ = 1200 - 0 = +1200 m</span>
            </p>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-500/30 flex items-start gap-2.5 text-xs sm:text-sm text-amber-100">
          <Info className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            ⚠️ <strong>Lưu ý sai lầm thường gặp:</strong> Học sinh thường nhầm độ dịch chuyển của cả chuyến đi bằng tổng quãng đường (2800 m). Trong vật lí, độ dịch chuyển d = x₂ - x₁ chỉ nối từ vị trí đầu tiên (Nhà) tới vị trí cuối cùng (Trường học), không phụ thuộc vào việc bạn A đã quay về nhà cất đồ bao nhiêu lần!
          </p>
        </div>
      </div>
    </div>
  );
};
