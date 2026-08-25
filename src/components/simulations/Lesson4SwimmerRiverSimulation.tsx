import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Eye,
  Layers,
  Compass,
  CheckCircle2,
  HelpCircle,
  Sparkles,
  Info,
  Waves,
  Zap,
  Sliders,
  Maximize2
} from 'lucide-react';
import { InlinePhysicsText } from '../ui/FormattedPhysicsText';

type SimMode = 'COMBINED' | 'STEP_BY_STEP' | 'VELOCITY_VECTORS' | 'SANDBOX';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  maxLife: number;
  life: number;
}

export const Lesson4SwimmerRiverSimulation: React.FC = () => {
  // Parameters
  const [riverWidth, setRiverWidth] = useState<number>(50); // Width in meters (East)
  const [driftDistance, setDriftDistance] = useState<number>(50); // Drift South in meters
  const [simMode, setSimMode] = useState<SimMode>('COMBINED');
  
  // Animation state
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [progress, setProgress] = useState<number>(0); // 0 to 1
  const [animSpeed, setAnimSpeed] = useState<number>(1);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  
  // Visual toggles
  const [showPythagoras, setShowPythagoras] = useState<boolean>(true);
  const [showVectors, setShowVectors] = useState<boolean>(true);
  const [showTrail, setShowTrail] = useState<boolean>(true);
  const [showWaterFlow, setShowWaterFlow] = useState<boolean>(true);
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'SIMULATION' | 'MATH_STEPS' | 'QUIZ'>('SIMULATION');

  // Quiz state
  const [userAnsD, setUserAnsD] = useState<string>('');
  const [userAnsAngle, setUserAnsAngle] = useState<string>('');
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const waterFlowOffsetRef = useRef<number>(0);
  const animFrameIdRef = useRef<number | null>(null);

  // Physics Calculations
  const calculatedD = useMemo(() => {
    return Math.sqrt(riverWidth * riverWidth + driftDistance * driftDistance);
  }, [riverWidth, driftDistance]);

  const calculatedAngleRad = useMemo(() => {
    return Math.atan2(driftDistance, riverWidth);
  }, [riverWidth, driftDistance]);

  const calculatedAngleDeg = useMemo(() => {
    return (calculatedAngleRad * 180) / Math.PI;
  }, [calculatedAngleRad]);

  // Audio effect generator
  const playWaterSound = (type: 'splash' | 'flow') => {
    if (isMuted) return;
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      if (type === 'splash') {
        const bufferSize = ctx.sampleRate * 0.08;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
        }
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 800;
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.04, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        noise.start();
      }
    } catch {
      // Audio context may be restricted before user interaction
    }
  };

  // Main animation loop
  useEffect(() => {
    let lastTime = performance.now();

    const render = (time: number) => {
      const dt = (time - lastTime) / 1000;
      lastTime = time;

      // Update flow offset for water animation
      waterFlowOffsetRef.current = (waterFlowOffsetRef.current + dt * 40 * animSpeed) % 1000;

      // Update simulation progress
      if (isPlaying) {
        setProgress((prev) => {
          const tripDuration = 8 / animSpeed; // 8 seconds standard trip
          const next = prev + dt / tripDuration;
          if (next >= 1) {
            return 1;
          }
          return next;
        });
      }

      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          drawScene(ctx, canvas.width, canvas.height, progress);
        }
      }

      animFrameIdRef.current = requestAnimationFrame(render);
    };

    animFrameIdRef.current = requestAnimationFrame(render);

    return () => {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, [isPlaying, progress, animSpeed, riverWidth, driftDistance, simMode, showPythagoras, showVectors, showTrail, showWaterFlow, showGrid]);

  // Periodic water splash particles
  useEffect(() => {
    if (!isPlaying || progress <= 0 || progress >= 1) return;
    const interval = setInterval(() => {
      playWaterSound('splash');
    }, 450 / animSpeed);
    return () => clearInterval(interval);
  }, [isPlaying, progress, animSpeed, isMuted]);

  // Helper to project 3D River World Coordinates to 2D Canvas Screen
  // In our 3D isometric river coordinate system:
  // X-axis: Across the river (West to East) -> x = 0 (West bank) to riverWidth (East bank)
  // Y-axis: River flow (North to South) -> y = 0 (North/Start line) to driftDistance (South)
  const getScreenCoords = (
    worldX: number,
    worldY: number,
    width: number,
    height: number
  ) => {
    // Center isometric projection aligned with the prompt's 3D perspective (Ảnh 2)
    // Looking from South-West towards North-East
    const originX = width * 0.22;
    const originY = height * 0.38;

    // Vector u: Eastward (across the river, slightly down-right)
    const uX = Math.cos(Math.PI * 0.12) * (width * 0.58 / Math.max(riverWidth, 50));
    const uY = Math.sin(Math.PI * 0.12) * (height * 0.22 / Math.max(riverWidth, 50));

    // Vector v: Southward (down along the river, steep down-right)
    const vX = Math.cos(Math.PI * 0.32) * (width * 0.38 / Math.max(driftDistance, 50));
    const vY = Math.sin(Math.PI * 0.32) * (height * 0.50 / Math.max(driftDistance, 50));

    const screenX = originX + worldX * uX + worldY * vX;
    const screenY = originY + worldX * uY + worldY * vY;

    return { x: screenX, y: screenY };
  };

  // Canvas Drawing Function
  const drawScene = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    currentProgress: number
  ) => {
    ctx.clearRect(0, 0, width, height);

    // 1. Draw 3D Natural Landscape Background (Sky, Mountains, Distant Fields)
    drawLandscape(ctx, width, height);

    // 2. Draw River Banks (West Bank, River Water Body, East Bank)
    drawRiverAndBanks(ctx, width, height);

    // 3. Draw Water Current Lines & Floating Wavelets
    if (showWaterFlow) {
      drawWaterCurrentEffect(ctx, width, height);
    }

    // 4. Coordinates Grid (if enabled)
    if (showGrid) {
      drawMetricGrid(ctx, width, height);
    }

    // 5. Calculate Current Swimmer Position based on Sim Mode
    let currWorldX = 0;
    let currWorldY = 0;

    if (simMode === 'COMBINED' || simMode === 'VELOCITY_VECTORS' || simMode === 'SANDBOX') {
      currWorldX = currentProgress * riverWidth;
      currWorldY = currentProgress * driftDistance;
    } else if (simMode === 'STEP_BY_STEP') {
      if (currentProgress <= 0.5) {
        // Step 1: Swimming across (West to East)
        currWorldX = (currentProgress / 0.5) * riverWidth;
        currWorldY = 0;
      } else {
        // Step 2: Drifting South (North to South)
        currWorldX = riverWidth;
        currWorldY = ((currentProgress - 0.5) / 0.5) * driftDistance;
      }
    }

    // 6. Draw Planned Cross Path (Nét đứt bơi ngang 50m - Hướng Đông)
    drawPlannedPath(ctx, width, height);

    // 7. Draw Drift Path (Nét đứt/mũi tên trôi dạt 50m - Hướng Nam)
    drawDriftPath(ctx, width, height);

    // 8. Draw Actual Displacement Vector d (Vectơ độ dịch chuyển tổng hợp màu neon)
    if (showVectors) {
      drawDisplacementVector(ctx, width, height, currentProgress);
    }

    // 9. Draw Pythagoras Right Triangle Overlay (as in Image 2)
    if (showPythagoras) {
      drawPythagorasTriangle(ctx, width, height);
    }

    // 10. Draw Velocity Vectors (if in Velocity Mode)
    if (simMode === 'VELOCITY_VECTORS') {
      drawVelocityVectorsAtSwimmer(ctx, width, height, currWorldX, currWorldY);
    }

    // 11. Draw Swim Trail & Water Foam Particles
    if (showTrail) {
      drawSwimTrail(ctx, width, height, currentProgress);
    }
    updateAndDrawParticles(ctx, width, height, currWorldX, currWorldY);

    // 12. Draw Swimmer 3D Character (Đầu, nón bơi, kính, tay sải nước, chân đạp)
    draw3DSwimmer(ctx, width, height, currWorldX, currWorldY, currentProgress);

    // 13. Draw Landmarks (Start Point O, Target Point A, End Point B)
    drawLandmarks(ctx, width, height);

    // 14. Draw 3D Compass (Bắc - Nam - Đông - Tây) at top-left
    draw3DCompass(ctx, width * 0.08, height * 0.18, Math.min(width, height) * 0.07);
  };

  // Draw Natural Background: Sky, distant mountains, green meadows
  const drawLandscape = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // Sky gradient with atmospheric haze
    const skyGrad = ctx.createLinearGradient(0, 0, 0, height * 0.45);
    skyGrad.addColorStop(0, '#0a192f');
    skyGrad.addColorStop(0.5, '#132f4c');
    skyGrad.addColorStop(0.85, '#1e4976');
    skyGrad.addColorStop(1, '#2b5f88');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, width, height);

    // Distant Mountain Ranges (Soft layered silhouettes)
    ctx.save();
    ctx.fillStyle = 'rgba(28, 58, 86, 0.6)';
    ctx.beginPath();
    ctx.moveTo(0, height * 0.28);
    ctx.bezierCurveTo(width * 0.15, height * 0.14, width * 0.35, height * 0.22, width * 0.5, height * 0.16);
    ctx.bezierCurveTo(width * 0.65, height * 0.1, width * 0.85, height * 0.24, width, height * 0.18);
    ctx.lineTo(width, height * 0.45);
    ctx.lineTo(0, height * 0.45);
    ctx.closePath();
    ctx.fill();

    // Closer Hills with greenery
    ctx.fillStyle = 'rgba(38, 78, 60, 0.7)';
    ctx.beginPath();
    ctx.moveTo(0, height * 0.34);
    ctx.bezierCurveTo(width * 0.2, height * 0.25, width * 0.45, height * 0.32, width * 0.7, height * 0.24);
    ctx.bezierCurveTo(width * 0.85, height * 0.2, width * 0.95, height * 0.28, width, height * 0.26);
    ctx.lineTo(width, height * 0.45);
    ctx.lineTo(0, height * 0.45);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  };

  // Draw River Bed, River Banks (West Bank & East Bank in Isometric 3D)
  const drawRiverAndBanks = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // 4 Key bounding corner points of the river in 3D world:
    // (0, -20) -> Upstream West
    // (riverWidth, -20) -> Upstream East
    // (riverWidth, driftDistance + 35) -> Downstream East
    // (0, driftDistance + 35) -> Downstream West
    const pUpWest = getScreenCoords(0, -20, width, height);
    const pUpEast = getScreenCoords(riverWidth, -20, width, height);
    const pDownEast = getScreenCoords(riverWidth, driftDistance + 35, width, height);
    const pDownWest = getScreenCoords(0, driftDistance + 35, width, height);

    // 1. West Meadow & Farm Field (Bờ Tây)
    ctx.save();
    const westGrad = ctx.createLinearGradient(0, 0, pUpWest.x, pDownWest.y);
    westGrad.addColorStop(0, '#385e38');
    westGrad.addColorStop(0.5, '#497c49');
    westGrad.addColorStop(1, '#2f522f');
    ctx.fillStyle = westGrad;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(pUpWest.x, pUpWest.y);
    ctx.lineTo(pDownWest.x, pDownWest.y);
    ctx.lineTo(0, height);
    ctx.closePath();
    ctx.fill();

    // West River Bank Slope (Bờ kè nghiêng đất & cỏ)
    const slopeWestGrad = ctx.createLinearGradient(pUpWest.x - 20, pUpWest.y, pUpWest.x + 10, pUpWest.y);
    slopeWestGrad.addColorStop(0, '#756344');
    slopeWestGrad.addColorStop(0.5, '#967d58');
    slopeWestGrad.addColorStop(1, '#5a4931');
    ctx.fillStyle = slopeWestGrad;
    ctx.beginPath();
    ctx.moveTo(pUpWest.x - 18, pUpWest.y);
    ctx.lineTo(pUpWest.x + 8, pUpWest.y);
    ctx.lineTo(pDownWest.x + 8, pDownWest.y);
    ctx.lineTo(pDownWest.x - 18, pDownWest.y);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // 2. East Meadow & Rural Road (Bờ Đông)
    ctx.save();
    const eastGrad = ctx.createLinearGradient(pUpEast.x, pUpEast.y, width, height);
    eastGrad.addColorStop(0, '#2e5d3c');
    eastGrad.addColorStop(0.4, '#447d44');
    eastGrad.addColorStop(1, '#346434');
    ctx.fillStyle = eastGrad;
    ctx.beginPath();
    ctx.moveTo(pUpEast.x, pUpEast.y);
    ctx.lineTo(width, 0);
    ctx.lineTo(width, height);
    ctx.lineTo(pDownEast.x, pDownEast.y);
    ctx.closePath();
    ctx.fill();

    // East Dirt Path along the bank
    ctx.strokeStyle = '#a68a5c';
    ctx.lineWidth = 14;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(pUpEast.x + 35, pUpEast.y);
    ctx.lineTo(pDownEast.x + 40, pDownEast.y);
    ctx.stroke();

    // East Bank Slope
    const slopeEastGrad = ctx.createLinearGradient(pUpEast.x - 10, pUpEast.y, pUpEast.x + 15, pUpEast.y);
    slopeEastGrad.addColorStop(0, '#5a4931');
    slopeEastGrad.addColorStop(0.5, '#8c734e');
    slopeEastGrad.addColorStop(1, '#665236');
    ctx.fillStyle = slopeEastGrad;
    ctx.beginPath();
    ctx.moveTo(pUpEast.x - 8, pUpEast.y);
    ctx.lineTo(pUpEast.x + 16, pUpEast.y);
    ctx.lineTo(pDownEast.x + 16, pDownEast.y);
    ctx.lineTo(pDownEast.x - 8, pDownEast.y);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // 3. The River Body (Mặt nước sông 3D sâu thẳm trong xanh)
    ctx.save();
    const riverGrad = ctx.createLinearGradient(pUpWest.x, pUpWest.y, pDownEast.x, pDownEast.y);
    riverGrad.addColorStop(0, '#15657a');
    riverGrad.addColorStop(0.3, '#1e88a8');
    riverGrad.addColorStop(0.7, '#2bb5d8');
    riverGrad.addColorStop(1, '#1b728b');
    ctx.fillStyle = riverGrad;
    ctx.beginPath();
    ctx.moveTo(pUpWest.x + 5, pUpWest.y);
    ctx.lineTo(pUpEast.x - 5, pUpEast.y);
    ctx.lineTo(pDownEast.x - 5, pDownEast.y);
    ctx.lineTo(pDownWest.x + 5, pDownWest.y);
    ctx.closePath();
    ctx.fill();

    // Water surface reflective sheen
    const sheenGrad = ctx.createLinearGradient(pUpWest.x, pUpWest.y, pUpEast.x, pUpEast.y);
    sheenGrad.addColorStop(0, 'rgba(255, 255, 255, 0.15)');
    sheenGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.35)');
    sheenGrad.addColorStop(1, 'rgba(255, 255, 255, 0.1)');
    ctx.fillStyle = sheenGrad;
    ctx.fill();

    // Bank water rim highlights (bọt mép nước)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(pUpWest.x + 6, pUpWest.y);
    ctx.lineTo(pDownWest.x + 6, pDownWest.y);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(pUpEast.x - 6, pUpEast.y);
    ctx.lineTo(pDownEast.x - 6, pDownEast.y);
    ctx.stroke();

    ctx.restore();
  };

  // Draw 3D Water Current Curved Arrows & Flow Waves
  const drawWaterCurrentEffect = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.save();
    const offset = waterFlowOffsetRef.current;

    // Draw wavy stream lines along the river
    const numStreams = 8;
    for (let i = 1; i <= numStreams; i++) {
      const fracX = i / (numStreams + 1);
      const wx = fracX * riverWidth;

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
      ctx.lineWidth = 1.2;
      ctx.setLineDash([18, 24]);
      ctx.lineDashOffset = -offset * 0.8;

      const pStart = getScreenCoords(wx, -15, width, height);
      const pEnd = getScreenCoords(wx, driftDistance + 30, width, height);

      ctx.beginPath();
      ctx.moveTo(pStart.x, pStart.y);
      ctx.lineTo(pEnd.x, pEnd.y);
      ctx.stroke();
    }
    ctx.setLineDash([]);

    // Draw 4 Large Curved 3D Current Arrows (Nhóm mũi tên dòng chảy như Ảnh 2)
    const arrowYPositions = [
      driftDistance * 0.25,
      driftDistance * 0.45,
      driftDistance * 0.65,
      driftDistance * 0.85
    ];

    arrowYPositions.forEach((wy, idx) => {
      const wxStart = riverWidth * 0.18 + (idx % 2) * (riverWidth * 0.08);
      const wxEnd = riverWidth * 0.52 + (idx % 2) * (riverWidth * 0.08);
      const p1 = getScreenCoords(wxStart, wy, width, height);
      const p2 = getScreenCoords(wxEnd, wy + 16, width, height);

      // Curve control point
      const mid = getScreenCoords((wxStart + wxEnd) / 2 + 5, wy + 6, width, height);

      // Glowing Arrow Shaft
      ctx.strokeStyle = 'rgba(200, 240, 255, 0.7)';
      ctx.lineWidth = 3.5;
      ctx.shadowColor = '#00e5ff';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.quadraticCurveTo(mid.x, mid.y, p2.x, p2.y);
      ctx.stroke();

      // Arrow Head
      const angle = Math.atan2(p2.y - mid.y, p2.x - mid.x);
      const headLen = 14;
      ctx.fillStyle = 'rgba(230, 250, 255, 0.95)';
      ctx.beginPath();
      ctx.moveTo(p2.x, p2.y);
      ctx.lineTo(
        p2.x - headLen * Math.cos(angle - Math.PI / 7),
        p2.y - headLen * Math.sin(angle - Math.PI / 7)
      );
      ctx.lineTo(
        p2.x - headLen * 0.6 * Math.cos(angle),
        p2.y - headLen * 0.6 * Math.sin(angle)
      );
      ctx.lineTo(
        p2.x - headLen * Math.cos(angle + Math.PI / 7),
        p2.y - headLen * Math.sin(angle + Math.PI / 7)
      );
      ctx.closePath();
      ctx.fill();
    });

    // Label: "DÒNG CHẢY (CURRENT) - HƯỚNG NAM (SOUTHWARD)"
    const labelPos = getScreenCoords(riverWidth * 0.32, driftDistance * 0.72, width, height);
    ctx.shadowBlur = 6;
    ctx.shadowColor = 'rgba(0,0,0,0.8)';
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px Plus Jakarta Sans, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('DÒNG CHẢY (CURRENT)', labelPos.x, labelPos.y);
    ctx.font = 'bold 11px Plus Jakarta Sans, sans-serif';
    ctx.fillStyle = '#bae6fd';
    ctx.fillText('HƯỚNG NAM (SOUTHWARD) ⬇', labelPos.x, labelPos.y + 14);

    ctx.restore();
  };

  // Draw Metric Grid across the river
  const drawMetricGrid = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.lineWidth = 0.8;

    // Cross grid lines every 10m
    const step = 10;
    for (let x = 0; x <= riverWidth; x += step) {
      const p1 = getScreenCoords(x, 0, width, height);
      const p2 = getScreenCoords(x, driftDistance, width, height);
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
    }

    for (let y = 0; y <= driftDistance; y += step) {
      const p1 = getScreenCoords(0, y, width, height);
      const p2 = getScreenCoords(riverWidth, y, width, height);
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
    }
    ctx.restore();
  };

  // Draw Planned Path (Bơi ngang 50m - Hướng Đông)
  const drawPlannedPath = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const pStart = getScreenCoords(0, 0, width, height);
    const pTarget = getScreenCoords(riverWidth, 0, width, height);

    ctx.save();
    // Dashed Blue Line
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2.8;
    ctx.setLineDash([8, 6]);
    ctx.shadowColor = '#0284c7';
    ctx.shadowBlur = 6;
    ctx.beginPath();
    ctx.moveTo(pStart.x, pStart.y);
    ctx.lineTo(pTarget.x, pTarget.y);
    ctx.stroke();
    ctx.setLineDash([]);

    // Arrowhead at target
    const angle = Math.atan2(pTarget.y - pStart.y, pTarget.x - pStart.x);
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.moveTo(pTarget.x, pTarget.y);
    ctx.lineTo(pTarget.x - 12 * Math.cos(angle - 0.4), pTarget.y - 12 * Math.sin(angle - 0.4));
    ctx.lineTo(pTarget.x - 12 * Math.cos(angle + 0.4), pTarget.y - 12 * Math.sin(angle + 0.4));
    ctx.closePath();
    ctx.fill();

    // Text Label: "BƠI NGANG 50 M (HƯỚNG ĐÔNG)"
    const midX = (pStart.x + pTarget.x) / 2;
    const midY = (pStart.y + pTarget.y) / 2;

    // Pill badge background
    ctx.shadowBlur = 8;
    ctx.shadowColor = 'rgba(0,0,0,0.6)';
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.roundRect(midX - 75, midY - 26, 150, 22, 6);
    ctx.fill();
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = '#e0f2fe';
    ctx.font = 'bold 11px Plus Jakarta Sans, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`BƠI NGANG ${riverWidth} M (ĐÔNG)`, midX, midY - 15);
    ctx.restore();
  };

  // Draw Drift Path (Trôi dạt xuôi dòng 50m - Hướng Nam)
  const drawDriftPath = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const pTarget = getScreenCoords(riverWidth, 0, width, height);
    const pEnd = getScreenCoords(riverWidth, driftDistance, width, height);

    ctx.save();
    // Dashed Amber Line along the East bank
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 2.4;
    ctx.setLineDash([6, 5]);
    ctx.shadowColor = '#d97706';
    ctx.shadowBlur = 6;
    ctx.beginPath();
    ctx.moveTo(pTarget.x, pTarget.y);
    ctx.lineTo(pEnd.x, pEnd.y);
    ctx.stroke();
    ctx.setLineDash([]);

    // Arrowhead at end
    const angle = Math.atan2(pEnd.y - pTarget.y, pEnd.x - pTarget.x);
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.moveTo(pEnd.x, pEnd.y);
    ctx.lineTo(pEnd.x - 11 * Math.cos(angle - 0.4), pEnd.y - 11 * Math.sin(angle - 0.4));
    ctx.lineTo(pEnd.x - 11 * Math.cos(angle + 0.4), pEnd.y - 11 * Math.sin(angle + 0.4));
    ctx.closePath();
    ctx.fill();

    // Text Label: "TRÔI DẠT XUÔI DÒNG 50 M (HƯỚNG NAM)"
    const midX = (pTarget.x + pEnd.x) / 2 + 18;
    const midY = (pTarget.y + pEnd.y) / 2;

    ctx.shadowBlur = 8;
    ctx.shadowColor = 'rgba(0,0,0,0.6)';
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.roundRect(midX - 10, midY - 11, 150, 22, 6);
    ctx.fill();
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = '#fef3c7';
    ctx.font = 'bold 10px Plus Jakarta Sans, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(`TRÔI DẠT ${driftDistance} M (NAM) ⬇`, midX, midY);
    ctx.restore();
  };

  // Draw Actual Total Displacement Vector d (Vectơ độ dịch chuyển tổng hợp)
  const drawDisplacementVector = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    currentProgress: number
  ) => {
    const pStart = getScreenCoords(0, 0, width, height);
    const pEnd = getScreenCoords(riverWidth, driftDistance, width, height);

    ctx.save();
    // Solid Bold Neon Green/Cyan Vector Arrow
    ctx.strokeStyle = '#00FFCC';
    ctx.lineWidth = 4;
    ctx.shadowColor = '#00FFCC';
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.moveTo(pStart.x, pStart.y);
    ctx.lineTo(pEnd.x, pEnd.y);
    ctx.stroke();

    // Vector Arrow Head
    const angle = Math.atan2(pEnd.y - pStart.y, pEnd.x - pStart.x);
    ctx.fillStyle = '#00FFCC';
    ctx.beginPath();
    ctx.moveTo(pEnd.x, pEnd.y);
    ctx.lineTo(pEnd.x - 16 * Math.cos(angle - 0.35), pEnd.y - 16 * Math.sin(angle - 0.35));
    ctx.lineTo(pEnd.x - 10 * Math.cos(angle), pEnd.y - 10 * Math.sin(angle));
    ctx.lineTo(pEnd.x - 16 * Math.cos(angle + 0.35), pEnd.y - 16 * Math.sin(angle + 0.35));
    ctx.closePath();
    ctx.fill();

    // Floating Label for Vector d: "d = 50√2 ≈ 70,71 m"
    const midX = (pStart.x + pEnd.x) / 2 - 25;
    const midY = (pStart.y + pEnd.y) / 2 + 18;

    ctx.shadowBlur = 10;
    ctx.shadowColor = '#000000';
    ctx.fillStyle = 'rgba(6, 78, 59, 0.9)';
    ctx.roundRect(midX - 85, midY - 14, 170, 28, 8);
    ctx.fill();
    ctx.strokeStyle = '#00FFCC';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px Plus Jakarta Sans, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`Vectơ d = ${calculatedD.toFixed(1)} m (${calculatedAngleDeg.toFixed(1)}° ĐN)`, midX, midY);

    ctx.restore();
  };

  // Draw Pythagoras Right Triangle Overlay (Góc trái dưới như trong Ảnh 2)
  const drawPythagorasTriangle = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.save();
    const triOriginX = width * 0.12;
    const triOriginY = height * 0.88;
    const legLength = Math.min(width, height) * 0.14;

    const cornerX = triOriginX;
    const cornerY = triOriginY;
    const topY = cornerY - legLength;
    const rightX = cornerX + legLength;

    // Triangle fill
    ctx.fillStyle = 'rgba(15, 23, 42, 0.82)';
    ctx.beginPath();
    ctx.moveTo(cornerX, topY);
    ctx.lineTo(cornerX, cornerY);
    ctx.lineTo(rightX, cornerY);
    ctx.closePath();
    ctx.fill();

    // Triangle borders
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2.5;
    ctx.shadowColor = '#0284c7';
    ctx.shadowBlur = 6;
    ctx.beginPath();
    ctx.moveTo(cornerX, topY);
    ctx.lineTo(cornerX, cornerY);
    ctx.stroke();

    ctx.strokeStyle = '#fbbf24';
    ctx.shadowColor = '#d97706';
    ctx.beginPath();
    ctx.moveTo(cornerX, cornerY);
    ctx.lineTo(rightX, cornerY);
    ctx.stroke();

    // Hypotenuse (Neon Green Vector)
    ctx.strokeStyle = '#00FFCC';
    ctx.lineWidth = 3;
    ctx.shadowColor = '#00FFCC';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.moveTo(cornerX, topY);
    ctx.lineTo(rightX, cornerY);
    ctx.stroke();

    // Hypotenuse Arrow
    const angle = Math.atan2(cornerY - topY, rightX - cornerX);
    ctx.fillStyle = '#00FFCC';
    ctx.beginPath();
    ctx.moveTo(rightX, cornerY);
    ctx.lineTo(rightX - 10 * Math.cos(angle - 0.4), cornerY - 10 * Math.sin(angle - 0.4));
    ctx.lineTo(rightX - 10 * Math.cos(angle + 0.4), cornerY - 10 * Math.sin(angle + 0.4));
    ctx.closePath();
    ctx.fill();

    // Right angle symbol (Ký hiệu góc vuông)
    const squareSize = 10;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(cornerX, cornerY - squareSize, squareSize, squareSize);

    // Dimension labels
    ctx.font = 'bold 11px Plus Jakarta Sans, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillStyle = '#38bdf8';
    ctx.fillText(`${riverWidth} m (ngang)`, cornerX - 6, (topY + cornerY) / 2);

    ctx.textAlign = 'center';
    ctx.fillStyle = '#fbbf24';
    ctx.fillText(`${driftDistance} m (dòng chảy)`, (cornerX + rightX) / 2, cornerY + 16);

    ctx.textAlign = 'left';
    ctx.fillStyle = '#00FFCC';
    ctx.fillText(`d = ${calculatedD.toFixed(1)} m`, (cornerX + rightX) / 2 + 10, (topY + cornerY) / 2 - 8);

    // Title box
    ctx.font = 'bold 10px Plus Jakarta Sans, sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.textAlign = 'center';
    ctx.fillText('SƠ ĐỒ TAM GIÁC VUÔNG TỌA ĐỘ', (cornerX + rightX) / 2, topY - 10);

    ctx.restore();
  };

  // Draw Velocity Vectors Attached to Swimmer
  const drawVelocityVectorsAtSwimmer = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    wx: number,
    wy: number
  ) => {
    const pSwimmer = getScreenCoords(wx, wy, width, height);

    ctx.save();
    // 1. Vector v_ng/n: Relative swimmer velocity to water (Eastwards)
    const pEast = getScreenCoords(wx + 15, wy, width, height);
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 3;
    ctx.shadowColor = '#0284c7';
    ctx.shadowBlur = 6;
    ctx.beginPath();
    ctx.moveTo(pSwimmer.x, pSwimmer.y);
    ctx.lineTo(pEast.x, pEast.y);
    ctx.stroke();

    // 2. Vector v_n/b: Water flow velocity (Southwards)
    const pSouth = getScreenCoords(wx, wy + 15, width, height);
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 3;
    ctx.shadowColor = '#d97706';
    ctx.beginPath();
    ctx.moveTo(pSwimmer.x, pSwimmer.y);
    ctx.lineTo(pSouth.x, pSouth.y);
    ctx.stroke();

    // 3. Vector v_ng/b: Combined resultant velocity (Southeastwards)
    const pResult = getScreenCoords(wx + 15, wy + 15, width, height);
    ctx.strokeStyle = '#00FFCC';
    ctx.lineWidth = 3.5;
    ctx.shadowColor = '#00FFCC';
    ctx.beginPath();
    ctx.moveTo(pSwimmer.x, pSwimmer.y);
    ctx.lineTo(pResult.x, pResult.y);
    ctx.stroke();

    ctx.restore();
  };

  // Swim Trail (Vết nước rẽ sóng sau lưng người bơi)
  const drawSwimTrail = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    currentProgress: number
  ) => {
    if (currentProgress <= 0.02) return;

    ctx.save();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 3;
    ctx.setLineDash([4, 4]);

    const pStart = getScreenCoords(0, 0, width, height);
    const pCurrent = getScreenCoords(currentProgress * riverWidth, currentProgress * driftDistance, width, height);

    ctx.beginPath();
    ctx.moveTo(pStart.x, pStart.y);
    ctx.lineTo(pCurrent.x, pCurrent.y);
    ctx.stroke();
    ctx.restore();
  };

  // Water Splash Particles
  const updateAndDrawParticles = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    wx: number,
    wy: number
  ) => {
    const pSwimmer = getScreenCoords(wx, wy, width, height);

    // Spawn new water particles if moving
    if (isPlaying && progress > 0 && progress < 1) {
      for (let i = 0; i < 2; i++) {
        particlesRef.current.push({
          x: pSwimmer.x + (Math.random() - 0.5) * 12,
          y: pSwimmer.y + (Math.random() - 0.5) * 8,
          vx: (Math.random() - 0.5) * 1.5,
          vy: (Math.random() - 0.5) * 1.5,
          size: Math.random() * 3 + 1.5,
          alpha: 0.8,
          maxLife: 20,
          life: 0
        });
      }
    }

    // Render & update particles
    ctx.save();
    particlesRef.current.forEach((p, idx) => {
      p.life++;
      p.x += p.vx;
      p.y += p.vy;
      p.alpha = Math.max(0, 1 - p.life / p.maxLife);

      ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha * 0.7})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    });

    particlesRef.current = particlesRef.current.filter((p) => p.life < p.maxLife);
    ctx.restore();
  };

  // Draw Realistic 3D Swimmer Character (Head, swim cap, goggles, freestyle arm stroke, kicking legs)
  const draw3DSwimmer = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    wx: number,
    wy: number,
    currentProgress: number
  ) => {
    const p = getScreenCoords(wx, wy, width, height);

    ctx.save();
    ctx.translate(p.x, p.y);

    // Direction angle: Swimmer faces East (towards right bank) with slight drift tilt
    const swimAngle = Math.PI * 0.12; // Aligned with the isometric river cross axis
    ctx.rotate(swimAngle);

    // Stroke animation cycle based on progress
    const strokePhase = (currentProgress * 40 * animSpeed) % (Math.PI * 2);
    const leftArmAngle = Math.sin(strokePhase);
    const rightArmAngle = Math.sin(strokePhase + Math.PI);
    const legKick = Math.sin(strokePhase * 2) * 4;

    // 1. Water Ripple Ring under swimmer
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(0, 0, 24, 10, 0, 0, Math.PI * 2);
    ctx.stroke();

    // 2. Swimmer Legs (Chân đập nước)
    ctx.fillStyle = '#e0a96d'; // Skin tone
    // Left Leg
    ctx.beginPath();
    ctx.roundRect(-22, -4 + legKick, 12, 4, 2);
    ctx.fill();
    // Right Leg
    ctx.beginPath();
    ctx.roundRect(-22, 1 - legKick, 12, 4, 2);
    ctx.fill();

    // Water splash at feet
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.beginPath();
    ctx.arc(-24, legKick * 0.5, 4, 0, Math.PI * 2);
    ctx.fill();

    // 3. Swimmer Torso & Swim Trunks (Thân người & Quần bơi)
    // Blue/Black swim trunks
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.roundRect(-12, -5, 10, 10, 2);
    ctx.fill();

    // Tanned Back/Torso
    ctx.fillStyle = '#d99b5a';
    ctx.beginPath();
    ctx.roundRect(-4, -6, 16, 12, 4);
    ctx.fill();

    // 4. Arms performing Freestyle Crawl Stroke (Cánh tay sải nước)
    ctx.fillStyle = '#e0a96d';
    // Right arm (near viewer)
    ctx.beginPath();
    ctx.ellipse(6 + rightArmAngle * 8, 8, 8, 3, rightArmAngle * 0.5, 0, Math.PI * 2);
    ctx.fill();

    // Left arm (far side)
    ctx.beginPath();
    ctx.ellipse(6 + leftArmAngle * 8, -8, 8, 3, leftArmAngle * 0.5, 0, Math.PI * 2);
    ctx.fill();

    // 5. Swimmer Head, Neon Swim Cap & Goggles (Đầu, nón bơi, kính bơi)
    // Head base
    ctx.fillStyle = '#e0a96d';
    ctx.beginPath();
    ctx.arc(14, 0, 6, 0, Math.PI * 2);
    ctx.fill();

    // Blue Swim Cap (Mũ bơi xanh)
    ctx.fillStyle = '#0284c7';
    ctx.beginPath();
    ctx.arc(14, 0, 6, -Math.PI * 0.7, Math.PI * 0.7);
    ctx.closePath();
    ctx.fill();

    // Swim Goggles (Kính bơi phản quang)
    ctx.fillStyle = '#00FFCC';
    ctx.beginPath();
    ctx.roundRect(16, -3, 3, 6, 1);
    ctx.fill();

    ctx.restore();
  };

  // Draw 3 Key Strategic Landmarks: Start Point O, Target Point A, End Point B
  const drawLandmarks = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // 1. Điểm Xuất Phát (Start Point O)
    const pStart = getScreenCoords(0, 0, width, height);
    drawMarkerBadge(
      ctx,
      pStart.x,
      pStart.y,
      '#00FFCC',
      'ĐIỂM XUẤT PHÁT',
      '(START POINT O)',
      'O (0, 0)',
      'left'
    );

    // 2. Điểm Dự Kiến (Target Point A)
    const pTarget = getScreenCoords(riverWidth, 0, width, height);
    drawMarkerBadge(
      ctx,
      pTarget.x,
      pTarget.y,
      '#38bdf8',
      'ĐIỂM DỰ KIẾN',
      '(TARGET A - BỜ ĐÔNG)',
      `A (${riverWidth}m, 0)`,
      'right'
    );

    // 3. Điểm Kết Thúc Thực Tế (Actual End Point B)
    const pEnd = getScreenCoords(riverWidth, driftDistance, width, height);
    drawMarkerBadge(
      ctx,
      pEnd.x,
      pEnd.y,
      '#f43f5e',
      'ĐIỂM KẾT THÚC',
      '(ACTUAL END POINT B)',
      `B (${riverWidth}m, -${driftDistance}m)`,
      'right'
    );
  };

  // Helper to draw a sleek glowing marker badge with text
  const drawMarkerBadge = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    color: string,
    title: string,
    subtitle: string,
    coord: string,
    align: 'left' | 'right'
  ) => {
    ctx.save();
    // Glowing circle on ground
    ctx.shadowColor = color;
    ctx.shadowBlur = 12;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, 7, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(x, y, 3, 0, Math.PI * 2);
    ctx.fill();

    // Text box offset
    const boxWidth = 140;
    const boxHeight = 44;
    const boxX = align === 'left' ? x - boxWidth - 14 : x + 14;
    const boxY = y - boxHeight / 2;

    // Leader line
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(align === 'left' ? x - 14 : x + 14, y);
    ctx.stroke();

    // Box container
    ctx.shadowBlur = 10;
    ctx.shadowColor = 'rgba(0,0,0,0.7)';
    ctx.fillStyle = 'rgba(11, 20, 38, 0.9)';
    ctx.roundRect(boxX, boxY, boxWidth, boxHeight, 8);
    ctx.fill();
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // Text lines
    ctx.textAlign = 'left';
    ctx.font = 'bold 10px Plus Jakarta Sans, sans-serif';
    ctx.fillStyle = color;
    ctx.fillText(title, boxX + 8, boxY + 14);

    ctx.font = '9px Plus Jakarta Sans, sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText(subtitle, boxX + 8, boxY + 26);

    ctx.font = 'bold 9px monospace';
    ctx.fillStyle = '#f8fafc';
    ctx.fillText(coord, boxX + 8, boxY + 38);

    ctx.restore();
  };

  // Draw 3D Compass Rose
  const draw3DCompass = (
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    radius: number
  ) => {
    ctx.save();
    ctx.translate(cx, cy);

    // Outer dial circle
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.5)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // North Needle (Red/Orange)
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-radius * 0.22, -radius * 0.15);
    ctx.lineTo(0, -radius * 0.75);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#b91c1c';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(radius * 0.22, -radius * 0.15);
    ctx.lineTo(0, -radius * 0.75);
    ctx.closePath();
    ctx.fill();

    // South Needle (White/Gray)
    ctx.fillStyle = '#e2e8f0';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-radius * 0.22, radius * 0.15);
    ctx.lineTo(0, radius * 0.75);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#94a3b8';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(radius * 0.22, radius * 0.15);
    ctx.lineTo(0, radius * 0.75);
    ctx.closePath();
    ctx.fill();

    // East & West Points
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(radius * 0.15, -radius * 0.18);
    ctx.lineTo(radius * 0.75, 0);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#0284c7';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-radius * 0.15, -radius * 0.18);
    ctx.lineTo(-radius * 0.75, 0);
    ctx.closePath();
    ctx.fill();

    // Center jewel
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.15, 0, Math.PI * 2);
    ctx.fill();

    // Letters (B, N, Đ, T)
    ctx.font = 'bold 11px Plus Jakarta Sans, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    ctx.fillStyle = '#ef4444';
    ctx.fillText('Bắc', 0, -radius * 0.95);

    ctx.fillStyle = '#94a3b8';
    ctx.fillText('Nam', 0, radius * 0.95);

    ctx.fillStyle = '#38bdf8';
    ctx.fillText('Đông', radius * 1.05, 0);

    ctx.fillStyle = '#38bdf8';
    ctx.fillText('Tây', -radius * 1.05, 0);

    ctx.restore();
  };

  const handleReset = () => {
    setProgress(0);
    setIsPlaying(false);
  };

  const handleQuizSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setQuizSubmitted(true);
  };

  return (
    <div className="w-full bg-[#060D1E] rounded-3xl border border-cyan-500/30 overflow-hidden shadow-2xl text-gray-100 flex flex-col my-4">
      {/* 1. Header Bar with Topic Title & Action Badges */}
      <div className="p-4 sm:p-5 bg-gradient-to-r from-[#0C1938] via-[#0E244D] to-[#0A1630] border-b border-cyan-500/20 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 shadow-lg shadow-cyan-500/20">
            <Waves className="h-6 w-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                Bài tập 2 • Trang 25 SGK
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1">
                <Sparkles className="h-3 w-3" /> Diễn họa 3D Isometric
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-200 via-white to-blue-200 mt-0.5">
              Mô phỏng 3D: Người bơi qua sông có dòng chảy cuốn trôi
            </h2>
          </div>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center bg-[#070E22] p-1 rounded-xl border border-white/10 text-xs">
          <button
            onClick={() => setActiveTab('SIMULATION')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              activeTab === 'SIMULATION'
                ? 'bg-cyan-500 text-white shadow-md'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            Mô phỏng 3D
          </button>
          <button
            onClick={() => setActiveTab('MATH_STEPS')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              activeTab === 'MATH_STEPS'
                ? 'bg-cyan-500 text-white shadow-md'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            Lời giải chi tiết
          </button>
          <button
            onClick={() => setActiveTab('QUIZ')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              activeTab === 'QUIZ'
                ? 'bg-cyan-500 text-white shadow-md'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            Tự kiểm tra
          </button>
        </div>
      </div>

      {/* 2. Main Visual Canvas Area & Side Control Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 border-b border-white/10">
        {/* Left/Top Canvas Container (col-span-8) */}
        <div className="lg:col-span-8 relative bg-black/50 flex flex-col justify-between overflow-hidden min-h-[420px] sm:min-h-[500px]">
          {/* Canvas */}
          <canvas
            ref={canvasRef}
            width={900}
            height={560}
            className="w-full h-full object-cover block"
          />

          {/* Floating HUD Live Data Panel (Top-Right) */}
          <div className="absolute top-3 right-3 bg-slate-950/85 backdrop-blur-md p-3 rounded-2xl border border-cyan-500/30 text-xs shadow-xl flex flex-col gap-1.5 min-w-[200px] z-10">
            <div className="flex items-center justify-between border-b border-white/10 pb-1.5">
              <span className="font-bold text-cyan-300 flex items-center gap-1.5">
                <Zap className="h-3.5 w-3.5 text-cyan-400" /> Trạng thái Vật lí
              </span>
              <span className="text-[10px] font-mono text-gray-400">
                t = {(progress * 8).toFixed(1)} s
              </span>
            </div>

            <div className="grid grid-cols-2 gap-1.5 pt-0.5">
              <div className="bg-slate-900/90 p-2 rounded-xl border border-white/5">
                <div className="text-[10px] text-gray-400">Bơi ngang (Đông)</div>
                <div className="font-mono font-bold text-[#38bdf8] text-sm">
                  {(progress * riverWidth).toFixed(1)} / {riverWidth} m
                </div>
              </div>

              <div className="bg-slate-900/90 p-2 rounded-xl border border-white/5">
                <div className="text-[10px] text-gray-400">Dạt xuôi (Nam)</div>
                <div className="font-mono font-bold text-[#fbbf24] text-sm">
                  {(progress * driftDistance).toFixed(1)} / {driftDistance} m
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-emerald-950/70 to-teal-950/70 p-2 rounded-xl border border-emerald-500/40 flex items-center justify-between">
              <div>
                <div className="text-[10px] text-emerald-300 font-bold">Độ dịch chuyển d:</div>
                <div className="text-[10px] text-gray-300">Góc hướng Đông Nam:</div>
              </div>
              <div className="text-right font-mono font-black">
                <div className="text-sm text-[#00FFCC]">
                  {(progress * calculatedD).toFixed(1)} / {calculatedD.toFixed(1)} m
                </div>
                <div className="text-[11px] text-emerald-200">
                  {calculatedAngleDeg.toFixed(1)}°
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Floating Control Bar (Canvas Overlay) */}
          <div className="p-3 bg-gradient-to-t from-slate-950 via-slate-950/90 to-transparent flex flex-wrap items-center justify-between gap-2 z-10">
            {/* Play/Pause & Reset & Step Progress */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="p-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold transition-transform active:scale-95 shadow-lg shadow-cyan-500/25 cursor-pointer"
                title={isPlaying ? 'Tạm dừng' : 'Chạy tiếp'}
              >
                {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
              </button>

              <button
                onClick={handleReset}
                className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-gray-300 transition-colors border border-white/10 cursor-pointer"
                title="Bắt đầu lại từ điểm xuất phát"
              >
                <RotateCcw className="h-4 w-4" />
              </button>

              {/* Progress Slider */}
              <div className="hidden sm:flex items-center gap-2 bg-slate-900/80 px-3 py-1.5 rounded-xl border border-white/10">
                <span className="text-[11px] font-mono text-gray-400">Tiến trình:</span>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={progress}
                  onChange={(e) => {
                    setProgress(parseFloat(e.target.value));
                    setIsPlaying(false);
                  }}
                  className="w-24 sm:w-32 accent-cyan-400 cursor-pointer"
                />
                <span className="text-[11px] font-mono font-bold text-cyan-300 w-9 text-right">
                  {Math.round(progress * 100)}%
                </span>
              </div>
            </div>

            {/* Speed & Mute & Display Toggles */}
            <div className="flex items-center gap-1.5">
              {/* Speed Buttons */}
              <div className="flex items-center bg-slate-900/80 p-1 rounded-xl border border-white/10 text-xs font-mono">
                {[0.5, 1, 2].map((spd) => (
                  <button
                    key={spd}
                    onClick={() => setAnimSpeed(spd)}
                    className={`px-2 py-0.5 rounded-md font-bold transition-colors cursor-pointer ${
                      animSpeed === spd
                        ? 'bg-cyan-500/30 text-cyan-300 border border-cyan-500/50'
                        : 'text-gray-400 hover:text-gray-200'
                    }`}
                  >
                    {spd}x
                  </button>
                ))}
              </div>

              {/* Mute Audio Button */}
              <button
                onClick={() => setIsMuted(!isMuted)}
                className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                  isMuted
                    ? 'bg-slate-800/80 text-gray-400 border-white/10'
                    : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-sm shadow-cyan-500/20'
                }`}
                title={isMuted ? 'Bật âm thanh tiếng nước' : 'Tắt âm thanh'}
              >
                {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* Right Interactive Controls Panel (col-span-4) */}
        <div className="lg:col-span-4 bg-[#081126] p-4 sm:p-5 flex flex-col justify-between gap-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <h3 className="font-bold text-sm text-cyan-300 flex items-center gap-2">
                <Sliders className="h-4 w-4" /> Điều khiển Mô phỏng
              </h3>
              <span className="text-[10px] text-gray-400">Tùy biến trực quan</span>
            </div>

            {/* Sim Mode Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-300">Chế độ hiển thị diễn họa:</label>
              <div className="grid grid-cols-2 gap-1.5 text-xs">
                <button
                  onClick={() => setSimMode('COMBINED')}
                  className={`p-2 rounded-xl text-left font-bold transition-all border cursor-pointer ${
                    simMode === 'COMBINED'
                      ? 'bg-cyan-500/20 text-cyan-200 border-cyan-500/50 shadow-md shadow-cyan-500/10'
                      : 'bg-slate-900/60 text-gray-400 border-white/5 hover:border-white/20'
                  }`}
                >
                  <div className="text-[11px]">🌊 Bơi thực tế</div>
                  <div className="text-[9px] text-gray-400 font-normal">Chuyển động kết hợp</div>
                </button>

                <button
                  onClick={() => setSimMode('STEP_BY_STEP')}
                  className={`p-2 rounded-xl text-left font-bold transition-all border cursor-pointer ${
                    simMode === 'STEP_BY_STEP'
                      ? 'bg-purple-500/20 text-purple-200 border-purple-500/50 shadow-md shadow-purple-500/10'
                      : 'bg-slate-900/60 text-gray-400 border-white/5 hover:border-white/20'
                  }`}
                >
                  <div className="text-[11px]">🪜 Từng chặng</div>
                  <div className="text-[9px] text-gray-400 font-normal">Bơi ngang rồi bị trôi</div>
                </button>

                <button
                  onClick={() => setSimMode('VELOCITY_VECTORS')}
                  className={`p-2 rounded-xl text-left font-bold transition-all border cursor-pointer ${
                    simMode === 'VELOCITY_VECTORS'
                      ? 'bg-emerald-500/20 text-emerald-200 border-emerald-500/50 shadow-md shadow-emerald-500/10'
                      : 'bg-slate-900/60 text-gray-400 border-white/5 hover:border-white/20'
                  }`}
                >
                  <div className="text-[11px]">➡️ Vectơ Vận tốc</div>
                  <div className="text-[9px] text-gray-400 font-normal">v(ng/n) + v(n/b)</div>
                </button>

                <button
                  onClick={() => setSimMode('SANDBOX')}
                  className={`p-2 rounded-xl text-left font-bold transition-all border cursor-pointer ${
                    simMode === 'SANDBOX'
                      ? 'bg-amber-500/20 text-amber-200 border-amber-500/50 shadow-md shadow-amber-500/10'
                      : 'bg-slate-900/60 text-gray-400 border-white/5 hover:border-white/20'
                  }`}
                >
                  <div className="text-[11px]">🛠️ Tự do Sandbox</div>
                  <div className="text-[9px] text-gray-400 font-normal">Kéo chỉnh W & L</div>
                </button>
              </div>
            </div>

            {/* Sandbox Slider Controls (Enabled in Sandbox Mode or default) */}
            <div className="p-3 rounded-2xl bg-slate-900/70 border border-white/5 space-y-3">
              <div>
                <div className="flex justify-between text-xs font-bold text-gray-300 mb-1">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-[#38bdf8]"></span> Chiều rộng sông $d_1$:
                  </span>
                  <span className="text-[#38bdf8] font-mono">{riverWidth} m</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="100"
                  step="5"
                  value={riverWidth}
                  onChange={(e) => setRiverWidth(parseInt(e.target.value))}
                  className="w-full accent-[#38bdf8] cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold text-gray-300 mb-1">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-[#fbbf24]"></span> Độ dạt xuôi dòng $d_2$:
                  </span>
                  <span className="text-[#fbbf24] font-mono">{driftDistance} m</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  step="5"
                  value={driftDistance}
                  onChange={(e) => setDriftDistance(parseInt(e.target.value))}
                  className="w-full accent-[#fbbf24] cursor-pointer"
                />
              </div>
            </div>

            {/* Visual Feature Checkboxes */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-300">Lớp hiển thị trực quan:</label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <label className="flex items-center gap-2 p-2 rounded-xl bg-slate-900/50 border border-white/5 cursor-pointer hover:bg-slate-900">
                  <input
                    type="checkbox"
                    checked={showPythagoras}
                    onChange={(e) => setShowPythagoras(e.target.checked)}
                    className="accent-cyan-400 rounded"
                  />
                  <span className="text-[11px] text-gray-300">📐 Tam giác vuông</span>
                </label>

                <label className="flex items-center gap-2 p-2 rounded-xl bg-slate-900/50 border border-white/5 cursor-pointer hover:bg-slate-900">
                  <input
                    type="checkbox"
                    checked={showVectors}
                    onChange={(e) => setShowVectors(e.target.checked)}
                    className="accent-cyan-400 rounded"
                  />
                  <span className="text-[11px] text-gray-300">🎯 Vectơ độ dịch chuyển</span>
                </label>

                <label className="flex items-center gap-2 p-2 rounded-xl bg-slate-900/50 border border-white/5 cursor-pointer hover:bg-slate-900">
                  <input
                    type="checkbox"
                    checked={showWaterFlow}
                    onChange={(e) => setShowWaterFlow(e.target.checked)}
                    className="accent-cyan-400 rounded"
                  />
                  <span className="text-[11px] text-gray-300">🌊 Dòng chảy cuộn</span>
                </label>

                <label className="flex items-center gap-2 p-2 rounded-xl bg-slate-900/50 border border-white/5 cursor-pointer hover:bg-slate-900">
                  <input
                    type="checkbox"
                    checked={showGrid}
                    onChange={(e) => setShowGrid(e.target.checked)}
                    className="accent-cyan-400 rounded"
                  />
                  <span className="text-[11px] text-gray-300">📏 Lưới tọa độ (10m)</span>
                </label>
              </div>
            </div>
          </div>

          {/* Quick Result Summary Card */}
          <div className="p-3 rounded-2xl bg-gradient-to-br from-cyan-950/40 via-slate-900/80 to-blue-950/40 border border-cyan-500/30 text-xs space-y-1.5">
            <div className="font-bold text-cyan-300 flex items-center justify-between">
              <span>Kết quả tính toán:</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                Pythagore
              </span>
            </div>
            <div className="flex items-center justify-between text-gray-300">
              <span>Độ lớn $d = \sqrt{{d_1}^2 + {d_2}^2}$:</span>
              <span className="font-mono font-bold text-[#00FFCC] text-sm">
                {calculatedD.toFixed(2)} m
              </span>
            </div>
            <div className="flex items-center justify-between text-gray-300">
              <span>Hướng dịch chuyển:</span>
              <span className="font-mono font-bold text-amber-300">
                Đông Nam ({calculatedAngleDeg.toFixed(1)}°)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Tab Content Area: Detailed Math Solution vs Interactive Quiz */}
      <div className="p-5 sm:p-6 bg-[#070F24]">
        {activeTab === 'SIMULATION' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Step 1 Card */}
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-blue-500/30 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">
                  Chặng 1: Bơi ngang
                </span>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-500/20 text-blue-300">
                  {riverWidth} m
                </span>
              </div>
              <p className="text-xs text-gray-300 leading-relaxed">
                Người bơi hướng vuông góc với dòng sông sang bờ đối diện (hướng <strong>Đông</strong>).
              </p>
              <div className="p-2 rounded-xl bg-black/40 font-mono text-xs text-blue-200 border border-blue-500/20 text-center">
                <InlinePhysicsText text="$\vec{d_1} = (+50\text{ m}, 0)$" />
              </div>
            </div>

            {/* Step 2 Card */}
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-amber-500/30 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                  Chặng 2: Nước trôi đẩy
                </span>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/20 text-amber-300">
                  {driftDistance} m
                </span>
              </div>
              <p className="text-xs text-gray-300 leading-relaxed">
                Dòng nước chảy từ Bắc xuống Nam cuốn người dạt xuôi dòng (hướng <strong>Nam</strong>).
              </p>
              <div className="p-2 rounded-xl bg-black/40 font-mono text-xs text-amber-200 border border-amber-500/20 text-center">
                <InlinePhysicsText text="$\vec{d_2} = (0, -50\text{ m})$" />
              </div>
            </div>

            {/* Step 3 Card */}
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-emerald-500/30 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                  Độ dịch chuyển tổng hợp
                </span>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/20 text-emerald-300">
                  {calculatedD.toFixed(1)} m
                </span>
              </div>
              <p className="text-xs text-gray-300 leading-relaxed">
                Nối từ vị trí xuất phát đến vị trí kết thúc thực tế theo hướng <strong>Đông Nam</strong> ($45^\circ$).
              </p>
              <div className="p-2 rounded-xl bg-black/40 font-mono text-xs text-emerald-200 border border-emerald-500/20 text-center font-bold">
                <InlinePhysicsText text="$d = \sqrt{50^2 + 50^2} = 50\sqrt{2}\approx 70,7\text{ m}$" />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'MATH_STEPS' && (
          <div className="space-y-4 max-w-4xl mx-auto">
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-cyan-500/30 space-y-3">
              <h4 className="font-bold text-cyan-300 text-sm flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-cyan-400" /> Các bước giải bài toán Vật lí chuẩn mực:
              </h4>

              <div className="space-y-3 text-xs leading-relaxed text-gray-200">
                <div className="p-3 rounded-xl bg-black/30 border border-white/5">
                  <strong className="text-cyan-300">Bước 1: Chọn hệ quy chiếu và hệ tọa độ $Oxy$</strong>
                  <p className="mt-1 text-gray-300">
                    • Gốc tọa độ $O$ đặt tại điểm xuất phát của người bơi trên bờ sông bên này.<br />
                    • Trục $Ox$ nằm ngang hướng từ Tây sang Đông (vuông góc với bờ sông, hướng sang bờ đối diện).<br />
                    • Trục $Oy$ dọc theo bờ sông, hướng từ Nam lên Bắc. Dòng nước chảy từ Bắc xuống Nam nên chiều âm của trục $Oy$ là hướng Nam.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-black/30 border border-white/5">
                  <strong className="text-cyan-300">Bước 2: Phân tích các vectơ độ dịch chuyển thành phần</strong>
                  <p className="mt-1 text-gray-300">
                    • Người bơi ngang sông sang bờ bên kia: $\vec{d_1}$ có hướng Đông, độ lớn $d_1 = 50\text{ m}$.<br />
                    • Nước trôi đẩy người dạt xuôi dòng: $\vec{d_2}$ có hướng Nam, độ lớn $d_2 = 50\text{ m}$.<br />
                    • Vì phương bơi ngang vuông góc với phương dòng chảy nên $\vec{d_1} \perp \vec{d_2}$.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-black/30 border border-white/5">
                  <strong className="text-cyan-300">Bước 3: Tính độ lớn và hướng của độ dịch chuyển tổng hợp $\vec{d}$</strong>
                  <p className="mt-1 text-gray-300">
                    Độ dịch chuyển tổng hợp: $\vec{d} = \vec{d_1} + \vec{d_2}$.<br />
                    Áp dụng định lí Pythagore trong tam giác vuông:
                  </p>
                  <div className="my-2 p-2.5 rounded-lg bg-slate-950 font-mono text-cyan-300 text-center font-bold border border-cyan-500/20">
                    <InlinePhysicsText text="$$d = \sqrt{d_1^2 + d_2^2} = \sqrt{50^2 + 50^2} = \sqrt{2500 + 2500} = \sqrt{5000} = 50\sqrt{2} \approx 70,71\text{ m}$$" />
                  </div>
                  <p className="text-gray-300">
                    Góc hướng $\alpha$ hợp bởi vectơ $\vec{d}$ với bờ sông (hướng Đông):
                  </p>
                  <div className="my-2 p-2.5 rounded-lg bg-slate-950 font-mono text-amber-300 text-center border border-amber-500/20">
                    <InlinePhysicsText text="$$\tan\alpha = \frac{d_2}{d_1} = \frac{50}{50} = 1 \Rightarrow \alpha = 45^\circ$$" />
                  </div>
                  <p className="text-emerald-300 font-bold">
                    👉 Kết luận: Độ dịch chuyển của người đó có độ lớn xấp xỉ $70,71\text{ m}$ theo hướng Đông Nam (lệch $45^\circ$ so với hướng bơi ban đầu).
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'QUIZ' && (
          <div className="max-w-2xl mx-auto p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-purple-500/30">
            <h4 className="font-bold text-purple-300 text-sm flex items-center gap-2 mb-3">
              <HelpCircle className="h-4 w-4" /> Thử tài Trắc nghiệm & Tự kiểm tra
            </h4>

            <form onSubmit={handleQuizSubmit} className="space-y-4 text-xs">
              <p className="text-gray-300 leading-relaxed">
                Cho sông rộng <strong>50 m</strong>, dòng nước cuốn trôi <strong>50 m</strong>. Hãy nhập kết quả tính toán của bạn:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1.5">
                  <label className="font-bold text-cyan-300">Độ lớn độ dịch chuyển $d$ (lấy tròn 1 chữ số thập phân):</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Ví dụ: 70.7"
                      value={userAnsD}
                      onChange={(e) => setUserAnsD(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-white/10 text-white font-mono focus:border-cyan-400 focus:outline-none"
                    />
                    <span className="text-gray-400 font-bold">m</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1.5">
                  <label className="font-bold text-amber-300">Góc lệch hướng $\alpha$ so với hướng Đông:</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Ví dụ: 45"
                      value={userAnsAngle}
                      onChange={(e) => setUserAnsAngle(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-white/10 text-white font-mono focus:border-amber-400 focus:outline-none"
                    />
                    <span className="text-gray-400 font-bold">độ (°)</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-cyan-500 text-white font-bold transition-transform active:scale-95 shadow-lg shadow-purple-500/20 cursor-pointer"
                >
                  Kiểm tra kết quả
                </button>

                {quizSubmitted && (
                  <div className="text-xs font-bold">
                    {(userAnsD.includes('70.7') || userAnsD.includes('70,7') || userAnsD.includes('71')) &&
                    userAnsAngle.trim() === '45' ? (
                      <span className="text-emerald-400 flex items-center gap-1.5">
                        <CheckCircle2 className="h-4 w-4" /> Xuất sắc! Kết quả chính xác: $d = 50\sqrt{2}\approx 70,7\text{ m}$, $\alpha = 45^\circ$.
                      </span>
                    ) : (
                      <span className="text-rose-400">
                        Chưa chính xác. Gợi ý: $d = \sqrt{50^2 + 50^2} \approx 70,7\text{ m}$; $\tan\alpha = 50/50 = 1 \Rightarrow \alpha = 45^\circ$.
                      </span>
                    )}
                  </div>
                )}
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
