import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Car,
  Compass,
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
  TreePine,
  ArrowRight,
  HelpCircle,
  Award
} from 'lucide-react';
import { InlinePhysicsText } from '../ui/FormattedPhysicsText';

export const Lesson4CarTripSimulation: React.FC = () => {
  // Scenario Modes:
  // 'FULL_TRIP': Leg 1 (6 km West) -> Leg 2 (4 km South) -> Leg 3 (3 km East)
  // 'LEG_1': 6 km West only
  // 'LEG_2': 4 km South only
  // 'LEG_3': 3 km East only
  // 'MANUAL': Free interactive slider from 0 km to 13 km
  const [tripMode, setTripMode] = useState<'FULL_TRIP' | 'LEG_1' | 'LEG_2' | 'LEG_3' | 'MANUAL'>('FULL_TRIP');
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0); // 0 to 1 along current scenario
  const [animSpeed, setAnimSpeed] = useState<number>(1);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [showVectors, setShowVectors] = useState<boolean>(true);
  const [showPythagoras, setShowPythagoras] = useState<boolean>(true);
  const [showPathTrail, setShowPathTrail] = useState<boolean>(true);
  const [showTable, setShowTable] = useState<boolean>(true);
  const [showQuiz, setShowQuiz] = useState<boolean>(false);
  const [userAnswerS, setUserAnswerS] = useState<string>('');
  const [userAnswerD, setUserAnswerD] = useState<string>('');
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);

  // Sound generator
  const playSoundEffect = (type: 'engine' | 'horn' | 'arrive' | 'click' | 'correct') => {
    if (!soundEnabled) return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      if (type === 'horn') {
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();
        osc1.type = 'sawtooth';
        osc2.type = 'sawtooth';
        osc1.frequency.setValueAtTime(440, ctx.currentTime);
        osc2.frequency.setValueAtTime(554.37, ctx.currentTime);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(ctx.destination);
        osc1.start();
        osc2.start();
        osc1.stop(ctx.currentTime + 0.3);
        osc2.stop(ctx.currentTime + 0.3);
      } else if (type === 'arrive') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(523.25, ctx.currentTime);
        osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1);
        osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.2);
        osc.frequency.setValueAtTime(1046.5, ctx.currentTime + 0.3);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.5);
      } else if (type === 'correct') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, ctx.currentTime);
        osc.frequency.setValueAtTime(880, ctx.currentTime + 0.12);
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

  // Physical Trip Computation
  // Leg 1: 0 to 6 km (West: dx = -s, dy = 0)
  // Leg 2: 6 to 10 km (South: dx = -6, dy = -(s - 6))
  // Leg 3: 10 to 13 km (East: dx = -6 + (s - 10), dy = -4)
  // Total Distance = 13 km

  let currentDist = 0; // km (quãng đường s)
  let posX = 0; // km from origin (East is +, West is -)
  let posY = 0; // km from origin (North is +, South is -)
  let carHeadingAngle = Math.PI; // radians. 0: East, PI/2: South (Canvas y is down), PI: West, -PI/2: North
  let currentLegName = 'Xuất phát tại Điểm O (0, 0)';
  let currentLegColor = '#00FFCC';

  if (tripMode === 'FULL_TRIP' || tripMode === 'MANUAL') {
    const totalS = 13;
    currentDist = progress * totalS;

    if (currentDist <= 6) {
      // Leg 1: West
      const p = currentDist;
      posX = -p;
      posY = 0;
      carHeadingAngle = Math.PI; // Heading West (Left)
      currentLegName = `Chặng 1: Hướng Tây (Đã đi: ${p.toFixed(2)} / 6.00 km)`;
      currentLegColor = '#A855F7';
    } else if (currentDist <= 10) {
      // Leg 2: South
      const p = currentDist - 6;
      posX = -6;
      posY = -p;
      carHeadingAngle = Math.PI / 2; // Heading South (Down)
      currentLegName = `Chặng 2: Rẽ trái hướng Nam (Đã đi: ${p.toFixed(2)} / 4.00 km)`;
      currentLegColor = '#F59E0B';
    } else {
      // Leg 3: East
      const p = currentDist - 10;
      posX = -6 + p;
      posY = -4;
      carHeadingAngle = 0; // Heading East (Right)
      currentLegName = `Chặng 3: Rẽ trái hướng Đông (Đã đi: ${p.toFixed(2)} / 3.00 km)`;
      currentLegColor = '#10B981';
    }
  } else if (tripMode === 'LEG_1') {
    currentDist = progress * 6;
    posX = -currentDist;
    posY = 0;
    carHeadingAngle = Math.PI;
    currentLegName = `Chặng 1: Hướng Tây (${currentDist.toFixed(2)} / 6 km)`;
    currentLegColor = '#A855F7';
  } else if (tripMode === 'LEG_2') {
    currentDist = progress * 4;
    posX = -6;
    posY = -currentDist;
    carHeadingAngle = Math.PI / 2;
    currentLegName = `Chặng 2: Hướng Nam (${currentDist.toFixed(2)} / 4 km)`;
    currentLegColor = '#F59E0B';
  } else if (tripMode === 'LEG_3') {
    currentDist = progress * 3;
    posX = -6 + currentDist;
    posY = -4;
    carHeadingAngle = 0;
    currentLegName = `Chặng 3: Hướng Đông (${currentDist.toFixed(2)} / 3 km)`;
    currentLegColor = '#10B981';
  }

  // Displacement magnitude and angle
  // d = sqrt(posX^2 + posY^2)
  const displacementMagnitude = Math.sqrt(posX * posX + posY * posY);
  // Angle relative to West axis (towards South)
  // When at (-3, -4): alpha = arctan(4/3) = 53.13 deg
  let angleAlphaDeg = 0;
  if (Math.abs(posX) > 0.001) {
    angleAlphaDeg = (Math.atan(Math.abs(posY) / Math.abs(posX)) * 180) / Math.PI;
  } else if (Math.abs(posY) > 0.001) {
    angleAlphaDeg = 90;
  }

  // Animation Loop
  useEffect(() => {
    if (!isPlaying) {
      lastTimeRef.current = null;
      return;
    }

    const animate = (time: number) => {
      if (lastTimeRef.current !== null) {
        const delta = (time - lastTimeRef.current) / 1000;
        // Total duration for full trip is ~ 10 seconds at 1x speed
        const duration = tripMode === 'FULL_TRIP' ? 10 : 5;
        const step = (delta * animSpeed) / duration;

        setProgress((prev) => {
          const next = prev + step;
          if (next >= 1) {
            setIsPlaying(false);
            playSoundEffect('arrive');
            return 1;
          }
          return next;
        });
      }
      lastTimeRef.current = time;
      animFrameRef.current = requestAnimationFrame(animate);
    };

    animFrameRef.current = requestAnimationFrame(animate);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isPlaying, animSpeed, tripMode]);

  // Main Canvas Rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle high DPI
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const width = rect.width || 800;
    const height = rect.height || 480;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    // Clear Canvas
    ctx.fillStyle = '#060B16';
    ctx.fillRect(0, 0, width, height);

    // Subtle background grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
    ctx.lineWidth = 1;
    const gridSize = 40;
    for (let x = 0; x < width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Coordinate Mapping
    // World coordinates (in km):
    // Origin O is at (0, 0)
    // Point A (End of Leg 1) is at (-6, 0)
    // Point B (End of Leg 2) is at (-6, -4)
    // Point C (End of Leg 3) is at (-3, -4)
    // We want to map:
    // x in [-7, 1] km -> canvas X
    // y in [-5, 1] km -> canvas Y (Note: in math y is negative south, in canvas y increases downwards)

    const paddingX = Math.min(width * 0.12, 90);
    const paddingY = Math.min(height * 0.18, 90);

    const mapWidth = width - paddingX * 2;
    const mapHeight = height - paddingY * 2;

    // World X span: -7 to 1 (8 km span)
    // World Y span: -5 to 1 (6 km span)
    const scaleX = mapWidth / 8;
    const scaleY = mapHeight / 5.6;
    const scale = Math.min(scaleX, scaleY);

    // Origin O on Canvas:
    // O is at the top right of the route
    const originCanvasX = paddingX + 6.8 * scale;
    const originCanvasY = paddingY + 0.8 * scale;

    const toCanvasX = (wX: number) => originCanvasX + wX * scale;
    const toCanvasY = (wY: number) => originCanvasY - wY * scale; // wY is negative for South, so -(-4)*scale moves DOWN

    // Waypoints on canvas:
    const ptO = { x: toCanvasX(0), y: toCanvasY(0) }; // Start (0, 0)
    const ptA = { x: toCanvasX(-6), y: toCanvasY(0) }; // Corner 1 (-6, 0)
    const ptB = { x: toCanvasX(-6), y: toCanvasY(-4) }; // Corner 2 (-6, -4)
    const ptC = { x: toCanvasX(-3), y: toCanvasY(-4) }; // End (-3, -4)

    // Current car canvas position
    const carCanvasX = toCanvasX(posX);
    const carCanvasY = toCanvasY(posY);

    // 1. DRAW SCENERY & SURROUNDING CITYSCAPE (Trees, Houses, Grass)
    // Draw grassy background zone in the inner area
    ctx.fillStyle = '#08171E';
    ctx.beginPath();
    ctx.roundRect(ptA.x + 30, ptA.y + 30, (ptC.x - ptA.x) + 40, (ptB.y - ptA.y) - 60, 16);
    ctx.fill();
    ctx.strokeStyle = 'rgba(16, 185, 129, 0.15)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Draw little stylized trees in inner field
    const drawTree = (tx: number, ty: number, scaleFactor = 1) => {
      ctx.save();
      ctx.translate(tx, ty);
      // Trunk
      ctx.fillStyle = '#8B5A2B';
      ctx.fillRect(-2 * scaleFactor, 0, 4 * scaleFactor, 10 * scaleFactor);
      // Foliage layers
      ctx.fillStyle = '#10B981';
      ctx.beginPath();
      ctx.arc(0, -6 * scaleFactor, 10 * scaleFactor, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#059669';
      ctx.beginPath();
      ctx.arc(3 * scaleFactor, -8 * scaleFactor, 7 * scaleFactor, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    };

    // Inner green space trees
    drawTree(ptA.x + 80, ptA.y + 70, 0.9);
    drawTree(ptA.x + 130, ptA.y + 110, 1.1);
    drawTree(ptA.x + 90, ptA.y + 160, 1.0);
    drawTree(ptA.x + 150, ptA.y + 190, 0.8);

    // Draw Houses along the roads matching Image 2
    const drawHouse = (hx: number, hy: number, roofColor = '#EF4444', wallColor = '#FEF08A', isFlipped = false) => {
      ctx.save();
      ctx.translate(hx, hy);
      if (isFlipped) ctx.scale(-1, 1);

      // House body
      ctx.fillStyle = wallColor;
      ctx.fillRect(-18, -14, 36, 28);
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(-18, -14, 36, 28);

      // Roof (Triangle)
      ctx.fillStyle = roofColor;
      ctx.beginPath();
      ctx.moveTo(-22, -14);
      ctx.lineTo(0, -32);
      ctx.lineTo(22, -14);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Door
      ctx.fillStyle = '#9A3412';
      ctx.fillRect(-5, 0, 10, 14);

      // Windows
      ctx.fillStyle = '#67E8F9';
      ctx.fillRect(-14, -8, 7, 7);
      ctx.fillRect(7, -8, 7, 7);

      ctx.restore();
    };

    // Houses along Leg 1 (North side of Leg 1 road)
    drawHouse(ptO.x - 60, ptO.y - 45, '#F97316', '#FEF3C7');
    drawTree(ptO.x - 110, ptO.y - 40, 1.0);
    drawHouse(ptO.x - 160, ptO.y - 45, '#EF4444', '#E0E7FF');
    drawHouse(ptO.x - 220, ptO.y - 45, '#10B981', '#FEF3C7');
    drawTree(ptO.x - 270, ptO.y - 40, 1.1);
    drawHouse(ptA.x + 60, ptA.y - 45, '#8B5CF6', '#FCE7F3');

    // Houses along Leg 2 (West side of Leg 2 road)
    drawHouse(ptA.x - 45, ptA.y + 60, '#F59E0B', '#FEF3C7', true);
    drawTree(ptA.x - 45, ptA.y + 110, 1.0);
    drawHouse(ptA.x - 45, ptA.y + 160, '#EC4899', '#EDE9FE', true);

    // Houses along Leg 3 (North & South side of Leg 3 road)
    drawHouse(ptA.x + 80, ptB.y - 45, '#3B82F6', '#FEF3C7');
    drawHouse(ptA.x + 180, ptB.y - 45, '#F97316', '#FEF3C7');
    drawHouse(ptC.x + 50, ptB.y - 45, '#10B981', '#E0E7FF');
    drawTree(ptC.x + 100, ptB.y - 40, 1.1);

    // 2. DRAW ASPHALT ROADS (with curb and asphalt texture)
    const roadWidth = 44;

    const drawRoadSegment = (x1: number, y1: number, x2: number, y2: number) => {
      ctx.save();
      // Outer Curb
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = roadWidth + 8;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();

      // Asphalt
      ctx.strokeStyle = '#1E293B';
      ctx.lineWidth = roadWidth;
      ctx.lineCap = 'square';
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();

      // Dashed Centerline
      ctx.strokeStyle = '#FDE047';
      ctx.lineWidth = 2.5;
      ctx.setLineDash([12, 10]);
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
      ctx.restore();
    };

    // Extended road dead ends for realism
    drawRoadSegment(ptO.x + 40, ptO.y, ptA.x - 40, ptA.y); // Road 1 (West-East)
    drawRoadSegment(ptA.x, ptA.y - 30, ptB.x, ptB.y + 40); // Road 2 (North-South)
    drawRoadSegment(ptB.x - 30, ptB.y, ptC.x + 70, ptC.y); // Road 3 (West-East)

    // 3. DRAW PATH TRAIL (if enabled)
    if (showPathTrail && currentDist > 0.05) {
      ctx.save();
      ctx.strokeStyle = 'rgba(0, 255, 204, 0.7)';
      ctx.lineWidth = 5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.shadowColor = '#00FFCC';
      ctx.shadowBlur = 10;

      ctx.beginPath();
      ctx.moveTo(ptO.x, ptO.y);

      if (currentDist <= 6) {
        ctx.lineTo(carCanvasX, carCanvasY);
      } else if (currentDist <= 10) {
        ctx.lineTo(ptA.x, ptA.y);
        ctx.lineTo(carCanvasX, carCanvasY);
      } else {
        ctx.lineTo(ptA.x, ptA.y);
        ctx.lineTo(ptB.x, ptB.y);
        ctx.lineTo(carCanvasX, carCanvasY);
      }
      ctx.stroke();
      ctx.restore();
    }

    // 4. DRAW INDIVIDUAL LEG LABELS & DISTANCE MARKERS (Image 2 style)
    // Leg 1 Arrow: Above Road 1, pointing Left (West), 6 km
    ctx.save();
    ctx.fillStyle = '#A855F7';
    ctx.strokeStyle = '#A855F7';
    ctx.lineWidth = 2;

    // Arrow line
    ctx.beginPath();
    ctx.moveTo(ptO.x - 10, ptO.y - 28);
    ctx.lineTo(ptA.x + 20, ptA.y - 28);
    ctx.stroke();
    // Arrow head
    ctx.beginPath();
    ctx.moveTo(ptA.x + 20, ptA.y - 28);
    ctx.lineTo(ptA.x + 32, ptA.y - 34);
    ctx.lineTo(ptA.x + 32, ptA.y - 22);
    ctx.closePath();
    ctx.fill();

    // Text for Leg 1
    ctx.font = 'bold 12px Plus Jakarta Sans, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('CHẶNG 1: HƯỚNG TÂY (6 km)', (ptO.x + ptA.x) / 2, ptO.y - 34);
    ctx.restore();

    // Leg 2 Arrow: Left of Road 2, pointing Down (South), 4 km
    ctx.save();
    ctx.fillStyle = '#F59E0B';
    ctx.strokeStyle = '#F59E0B';
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.moveTo(ptA.x - 28, ptA.y + 20);
    ctx.lineTo(ptB.x - 28, ptB.y - 20);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(ptB.x - 28, ptB.y - 20);
    ctx.lineTo(ptB.x - 34, ptB.y - 32);
    ctx.lineTo(ptB.x - 22, ptB.y - 32);
    ctx.closePath();
    ctx.fill();

    ctx.save();
    ctx.translate(ptA.x - 36, (ptA.y + ptB.y) / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.font = 'bold 12px Plus Jakarta Sans, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('CHẶNG 2: HƯỚNG NAM (4 km)', 0, 0);
    ctx.restore();
    ctx.restore();

    // Leg 3 Arrow: Below Road 3, pointing Right (East), 3 km
    ctx.save();
    ctx.fillStyle = '#10B981';
    ctx.strokeStyle = '#10B981';
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.moveTo(ptB.x + 20, ptB.y + 28);
    ctx.lineTo(ptC.x - 10, ptC.y + 28);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(ptC.x - 10, ptC.y + 28);
    ctx.lineTo(ptC.x - 22, ptC.y + 22);
    ctx.lineTo(ptC.x - 22, ptC.y + 34);
    ctx.closePath();
    ctx.fill();

    ctx.font = 'bold 12px Plus Jakarta Sans, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('CHẶNG 3: HƯỚNG ĐÔNG (3 km)', (ptB.x + ptC.x) / 2, ptB.y + 44);
    ctx.restore();

    // 5. DRAW PYTHAGOREAN RIGHT TRIANGLE & DISPLACEMENT VECTOR (d = 5 km)
    if (showPythagoras && showVectors) {
      ctx.save();

      // Right triangle legs (dashed lines)
      // Horizontal leg: From (0, -4) to (-3, -4) or from (0, 0) to (-3, 0)
      const ptMidX = { x: toCanvasX(-3), y: toCanvasY(0) }; // Point (-3, 0)

      ctx.strokeStyle = 'rgba(234, 179, 8, 0.7)'; // Yellow
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 4]);

      // Vertical leg from Mid to C
      ctx.beginPath();
      ctx.moveTo(ptMidX.x, ptMidX.y);
      ctx.lineTo(ptC.x, ptC.y);
      ctx.stroke();

      // Horizontal leg from O to Mid
      ctx.beginPath();
      ctx.moveTo(ptO.x, ptO.y);
      ctx.lineTo(ptMidX.x, ptMidX.y);
      ctx.stroke();

      // Right angle square symbol at ptMidX
      const sqSize = 12;
      ctx.strokeStyle = '#EAB308';
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.moveTo(ptMidX.x + sqSize, ptMidX.y);
      ctx.lineTo(ptMidX.x + sqSize, ptMidX.y + sqSize);
      ctx.lineTo(ptMidX.x, ptMidX.y + sqSize);
      ctx.stroke();

      // Labels on triangle legs
      ctx.fillStyle = '#FEF08A';
      ctx.font = 'bold 11px JetBrains Mono, monospace';
      ctx.textAlign = 'center';
      ctx.fillText('Δx = 6 - 3 = 3 km', (ptO.x + ptMidX.x) / 2, ptO.y + 16);
      ctx.fillText('Δy = 4 km', ptMidX.x + 36, (ptMidX.y + ptC.y) / 2);

      // Angle Arc at Origin O
      ctx.strokeStyle = '#38BDF8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      // Arc from West (Math.PI) to displacement vector angle
      const angleRad = Math.atan2(ptC.y - ptO.y, ptC.x - ptO.x);
      ctx.arc(ptO.x, ptO.y, 28, Math.PI, angleRad, false);
      ctx.stroke();

      ctx.fillStyle = '#38BDF8';
      ctx.font = 'bold 10px JetBrains Mono, monospace';
      ctx.fillText('α ≈ 53.1°', ptO.x - 42, ptO.y + 22);

      ctx.restore();
    }

    // 6. DRAW NET DISPLACEMENT VECTOR (d) from O to Current Position
    if (showVectors && displacementMagnitude > 0.05) {
      ctx.save();
      ctx.strokeStyle = '#00FFCC';
      ctx.lineWidth = 3.5;
      ctx.shadowColor = '#00FFCC';
      ctx.shadowBlur = 12;

      // Line from O to Car
      ctx.beginPath();
      ctx.moveTo(ptO.x, ptO.y);
      ctx.lineTo(carCanvasX, carCanvasY);
      ctx.stroke();

      // Arrow head at Car
      const dAngle = Math.atan2(carCanvasY - ptO.y, carCanvasX - ptO.x);
      const headLen = 14;
      ctx.fillStyle = '#00FFCC';
      ctx.beginPath();
      ctx.moveTo(carCanvasX, carCanvasY);
      ctx.lineTo(
        carCanvasX - headLen * Math.cos(dAngle - Math.PI / 6),
        carCanvasY - headLen * Math.sin(dAngle - Math.PI / 6)
      );
      ctx.lineTo(
        carCanvasX - headLen * Math.cos(dAngle + Math.PI / 6),
        carCanvasY - headLen * Math.sin(dAngle + Math.PI / 6)
      );
      ctx.closePath();
      ctx.fill();

      // Label on displacement vector
      const midVecX = (ptO.x + carCanvasX) / 2;
      const midVecY = (ptO.y + carCanvasY) / 2;

      ctx.shadowBlur = 0;
      ctx.fillStyle = '#060B16';
      ctx.strokeStyle = '#00FFCC';
      ctx.lineWidth = 1.5;
      const labelText = `d = ${displacementMagnitude.toFixed(2)} km`;
      const textWidth = ctx.measureText(labelText).width + 16;
      ctx.beginPath();
      ctx.roundRect(midVecX - textWidth / 2, midVecY - 24, textWidth, 20, 6);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#00FFCC';
      ctx.font = 'bold 11px JetBrains Mono, monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(labelText, midVecX, midVecY - 14);

      ctx.restore();
    }

    // 7. DRAW WAYPOINT MARKERS (O, A, B, C)
    const drawPin = (pt: { x: number; y: number }, label: string, name: string, color: string) => {
      ctx.save();
      // Outer glow
      ctx.fillStyle = color;
      ctx.shadowColor = color;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 8, 0, Math.PI * 2);
      ctx.fill();

      // White inner core
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 3.5, 0, Math.PI * 2);
      ctx.fill();

      // Badge Label
      ctx.shadowBlur = 0;
      ctx.fillStyle = 'rgba(6, 11, 22, 0.85)';
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.5;
      const badgeText = `${label}: ${name}`;
      ctx.font = 'bold 11px Plus Jakarta Sans, sans-serif';
      const bWidth = ctx.measureText(badgeText).width + 14;
      ctx.beginPath();
      ctx.roundRect(pt.x - bWidth / 2, pt.y - 28, bWidth, 18, 5);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#FFFFFF';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(badgeText, pt.x, pt.y - 19);
      ctx.restore();
    };

    drawPin(ptO, 'O', 'Xuất phát (0,0)', '#00FFCC');
    drawPin(ptA, 'A', 'Rẽ trái (-6,0)', '#A855F7');
    drawPin(ptB, 'B', 'Quay Đông (-6,-4)', '#F59E0B');
    drawPin(ptC, 'C', 'Đích đến (-3,-4)', '#10B981');

    // 8. DRAW 3D STYLIZED SEDAN CAR (CYAN BLUE) matching user image
    ctx.save();
    ctx.translate(carCanvasX, carCanvasY);
    ctx.rotate(carHeadingAngle);

    // Car Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.beginPath();
    ctx.ellipse(0, 4, 26, 14, 0, 0, Math.PI * 2);
    ctx.fill();

    // Car Body (Sedan shape - viewed from side/isometric angle)
    const carColor = '#38BDF8'; // Sky cyan blue
    const carRoofColor = '#0284C7';
    const carGlassColor = '#BAE6FD';

    // Wheels
    ctx.fillStyle = '#0F172A';
    ctx.beginPath();
    ctx.roundRect(-18, 8, 9, 6, 2);
    ctx.roundRect(10, 8, 9, 6, 2);
    ctx.roundRect(-18, -14, 9, 6, 2);
    ctx.roundRect(10, -14, 9, 6, 2);
    ctx.fill();

    // Silver Rims
    ctx.fillStyle = '#CBD5E1';
    ctx.beginPath();
    ctx.arc(-13.5, 11, 2, 0, Math.PI * 2);
    ctx.arc(14.5, 11, 2, 0, Math.PI * 2);
    ctx.arc(-13.5, -11, 2, 0, Math.PI * 2);
    ctx.arc(14.5, -11, 2, 0, Math.PI * 2);
    ctx.fill();

    // Main Chassis
    ctx.fillStyle = carColor;
    ctx.beginPath();
    ctx.roundRect(-24, -11, 48, 22, 6);
    ctx.fill();
    ctx.strokeStyle = '#0369A1';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Hood / Trunk contours
    ctx.fillStyle = carRoofColor;
    ctx.beginPath();
    ctx.roundRect(-10, -8, 22, 16, 4);
    ctx.fill();

    // Windshield (Front and Back)
    ctx.fillStyle = carGlassColor;
    ctx.beginPath();
    ctx.roundRect(4, -7, 6, 14, 2); // Front windshield
    ctx.roundRect(-9, -7, 5, 14, 2); // Rear windshield
    ctx.fill();

    // Headlights (Yellow glow in front)
    ctx.fillStyle = '#FEF08A';
    ctx.shadowColor = '#FDE047';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(22, -6, 2.5, 0, Math.PI * 2);
    ctx.arc(22, 6, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Tail lights (Red in back)
    ctx.fillStyle = '#EF4444';
    ctx.shadowColor = '#EF4444';
    ctx.shadowBlur = 6;
    ctx.beginPath();
    ctx.arc(-23, -6, 2, 0, Math.PI * 2);
    ctx.arc(-23, 6, 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    // 9. COMPASS ROSE (Top Left)
    const compassX = 55;
    const compassY = 55;
    const cRadius = 26;

    ctx.save();
    ctx.translate(compassX, compassY);
    // Background disc
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, 0, cRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Direction arrows
    // North (Up) - Red
    ctx.fillStyle = '#EF4444';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(4, 0);
    ctx.lineTo(0, -cRadius + 6);
    ctx.lineTo(-4, 0);
    ctx.closePath();
    ctx.fill();

    // South (Down) - Blue
    ctx.fillStyle = '#3B82F6';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(4, 0);
    ctx.lineTo(0, cRadius - 6);
    ctx.lineTo(-4, 0);
    ctx.closePath();
    ctx.fill();

    // East (Right) & West (Left) - Gray
    ctx.fillStyle = '#94A3B8';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, 4);
    ctx.lineTo(cRadius - 6, 0);
    ctx.lineTo(0, -4);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, 4);
    ctx.lineTo(-cRadius + 6, 0);
    ctx.lineTo(0, -4);
    ctx.closePath();
    ctx.fill();

    // Labels N, S, W, E
    ctx.font = 'bold 10px Plus Jakarta Sans, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#EF4444';
    ctx.fillText('B (Bắc)', 0, -cRadius - 9);
    ctx.fillStyle = '#3B82F6';
    ctx.fillText('N (Nam)', 0, cRadius + 9);
    ctx.fillStyle = '#E2E8F0';
    ctx.fillText('T (Tây)', -cRadius - 16, 0);
    ctx.fillText('Đ (Đông)', cRadius + 18, 0);

    ctx.restore();

    // Scale Ruler (Bottom Left)
    const rulerX = 30;
    const rulerY = height - 25;
    const rulerLenKm = 1; // 1 km bar
    const rulerLenPx = rulerLenKm * scale;

    ctx.save();
    ctx.strokeStyle = '#CBD5E1';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(rulerX, rulerY);
    ctx.lineTo(rulerX + rulerLenPx, rulerY);
    ctx.moveTo(rulerX, rulerY - 4);
    ctx.lineTo(rulerX, rulerY + 4);
    ctx.moveTo(rulerX + rulerLenPx, rulerY - 4);
    ctx.lineTo(rulerX + rulerLenPx, rulerY + 4);
    ctx.stroke();

    ctx.fillStyle = '#94A3B8';
    ctx.font = '10px JetBrains Mono, monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`Tỉ lệ: 1 km`, rulerX + rulerLenPx / 2, rulerY - 6);
    ctx.restore();
  }, [
    posX,
    posY,
    carHeadingAngle,
    currentDist,
    displacementMagnitude,
    showVectors,
    showPythagoras,
    showPathTrail
  ]);

  // Handle Scenario Mode Switch
  const handleModeSwitch = (mode: 'FULL_TRIP' | 'LEG_1' | 'LEG_2' | 'LEG_3' | 'MANUAL') => {
    playSoundEffect('click');
    setTripMode(mode);
    setProgress(0);
    setIsPlaying(mode !== 'MANUAL');
  };

  const handleReset = () => {
    playSoundEffect('click');
    setIsPlaying(false);
    setProgress(0);
  };

  const handleQuizSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setQuizSubmitted(true);
    if (userAnswerS.trim() === '13' && userAnswerD.trim() === '5') {
      playSoundEffect('correct');
    }
  };

  return (
    <div className="flex flex-col gap-5 p-4 sm:p-6 bg-gradient-to-b from-[#090F1E] to-[#040814] rounded-2xl border border-white/10 shadow-2xl text-white">
      {/* Header & Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-cyan-500/20 text-[#00FFCC] border border-cyan-500/30 flex items-center gap-1.5">
              <Car className="h-3.5 w-3.5" />
              Diễn họa 3D Lộ trình Xe Ô tô
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-500/20 text-purple-300 border border-purple-500/30">
              Bài tập 1 (Trang 25 SGK Vật Lí 10)
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Tổng hợp Vectơ Độ dịch chuyển
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-200 to-amber-300">
            Mô phỏng Xe Ô tô chạy 3 Chặng & Độ dịch chuyển tổng hợp
          </h2>
          <p className="text-xs sm:text-sm text-gray-300 mt-1">
            Minh họa trực quan ô tô đi thẳng 6 km theo hướng Tây $\rightarrow$ rẽ trái theo hướng Nam 4 km $\rightarrow$ quay sang hướng Đông 3 km.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 self-start md:self-auto flex-wrap">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2 rounded-xl border transition-all cursor-pointer ${
              soundEnabled
                ? 'bg-cyan-950/60 border-cyan-500/40 text-cyan-300 hover:bg-cyan-900/60'
                : 'bg-slate-900 border-white/10 text-gray-400 hover:text-gray-200'
            }`}
            title={soundEnabled ? 'Tắt âm thanh' : 'Bật âm thanh'}
          >
            {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </button>

          <button
            onClick={() => {
              playSoundEffect('horn');
            }}
            className="px-3 py-1.5 rounded-xl border border-amber-500/40 bg-amber-950/40 text-amber-300 hover:bg-amber-900/50 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
            title="Bấm còi xe ô tô"
          >
            📢 Bấm Còi
          </button>

          <button
            onClick={() => setShowQuiz(!showQuiz)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              showQuiz
                ? 'bg-purple-600 border-purple-400 text-white shadow-lg shadow-purple-500/30'
                : 'bg-purple-950/40 border-purple-500/40 text-purple-300 hover:bg-purple-900/50'
            }`}
          >
            <HelpCircle className="h-3.5 w-3.5" />
            Tự kiểm tra
          </button>
        </div>
      </div>

      {/* Scenario Mode Selectors */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => handleModeSwitch('FULL_TRIP')}
          className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer ${
            tripMode === 'FULL_TRIP'
              ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30 border border-cyan-400/50'
              : 'bg-slate-900/80 border border-white/10 text-gray-300 hover:bg-slate-800'
          }`}
        >
          <Sparkles className="h-4 w-4 text-cyan-300" />
          Cả 3 chặng (Hành trình toàn phần)
        </button>

        <button
          onClick={() => handleModeSwitch('LEG_1')}
          className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
            tripMode === 'LEG_1'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30 border border-purple-400'
              : 'bg-slate-900/80 border border-white/10 text-gray-300 hover:bg-slate-800'
          }`}
        >
          Chặng 1: Tây (6 km)
        </button>

        <button
          onClick={() => handleModeSwitch('LEG_2')}
          className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
            tripMode === 'LEG_2'
              ? 'bg-amber-600 text-white shadow-lg shadow-amber-500/30 border border-amber-400'
              : 'bg-slate-900/80 border border-white/10 text-gray-300 hover:bg-slate-800'
          }`}
        >
          Chặng 2: Nam (4 km)
        </button>

        <button
          onClick={() => handleModeSwitch('LEG_3')}
          className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
            tripMode === 'LEG_3'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/30 border border-emerald-400'
              : 'bg-slate-900/80 border border-white/10 text-gray-300 hover:bg-slate-800'
          }`}
        >
          Chặng 3: Đông (3 km)
        </button>

        <button
          onClick={() => handleModeSwitch('MANUAL')}
          className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer ${
            tripMode === 'MANUAL'
              ? 'bg-gradient-to-r from-pink-500 to-rose-600 text-white shadow-lg shadow-pink-500/30 border border-pink-400/50'
              : 'bg-slate-900/80 border border-white/10 text-gray-300 hover:bg-slate-800'
          }`}
        >
          <Sliders className="h-4 w-4 text-pink-300" />
          Kéo thanh trượt tự do (0 - 13 km)
        </button>
      </div>

      {/* Main Interactive Stage */}
      <div className="relative rounded-2xl overflow-hidden border border-cyan-500/30 bg-[#060B16] shadow-2xl">
        <canvas
          ref={canvasRef}
          className="w-full h-[320px] sm:h-[420px] md:h-[480px] block cursor-crosshair"
        />

        {/* Current State Floating Banner */}
        <div className="absolute top-3 right-3 flex flex-col items-end gap-1.5 pointer-events-none">
          <div className="px-3 py-1.5 rounded-xl bg-slate-900/90 border border-cyan-500/40 text-xs font-mono text-cyan-300 shadow-xl backdrop-blur-md flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
            <span>{currentLegName}</span>
          </div>
          <div className="px-3 py-1 rounded-lg bg-slate-950/80 border border-white/10 text-[11px] font-mono text-gray-300 backdrop-blur-sm">
            Tọa độ: x = {posX.toFixed(2)} km, y = {posY.toFixed(2)} km
          </div>
        </div>

        {/* Real-time Physics HUD (Overlaid on bottom of Canvas) */}
        <div className="absolute bottom-3 left-3 right-3 sm:left-auto sm:right-3 sm:w-80 p-3 rounded-xl bg-slate-950/90 border border-white/15 backdrop-blur-md shadow-2xl flex flex-col gap-2">
          <div className="flex items-center justify-between border-b border-white/10 pb-1.5 text-xs">
            <span className="font-bold text-gray-300 flex items-center gap-1.5">
              <TrendingUp className="h-3.5 w-3.5 text-[#00FFCC]" />
              Thông số Vật lí thời gian thực
            </span>
            <span className="text-[10px] text-gray-400 font-mono">
              Tiến độ: {(progress * 100).toFixed(0)}%
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            {/* Distance s */}
            <div className="p-2 rounded-lg bg-amber-950/40 border border-amber-500/30 flex flex-col">
              <span className="text-[11px] text-amber-300 font-medium">Quãng đường (s):</span>
              <span className="text-base sm:text-lg font-black font-mono text-amber-200">
                {currentDist.toFixed(2)}{' '}
                <span className="text-xs font-normal text-amber-400">km</span>
              </span>
              <span className="text-[10px] text-amber-400/80">Tích lũy thực tế</span>
            </div>

            {/* Displacement d */}
            <div className="p-2 rounded-lg bg-cyan-950/40 border border-cyan-500/40 flex flex-col">
              <span className="text-[11px] text-cyan-300 font-medium">Độ dịch chuyển (d):</span>
              <span className="text-base sm:text-lg font-black font-mono text-[#00FFCC]">
                {displacementMagnitude.toFixed(2)}{' '}
                <span className="text-xs font-normal text-cyan-300">km</span>
              </span>
              <span className="text-[10px] text-cyan-400/80">
                Góc: {angleAlphaDeg.toFixed(1)}° (Tây Nam)
              </span>
            </div>
          </div>

          {/* Quick comparison note */}
          <div className="text-[11px] text-gray-300 flex items-center justify-between px-1">
            <span>
              Chênh lệch $(s - d)$:
            </span>
            <span className="font-mono font-bold text-rose-300">
              +{(currentDist - displacementMagnitude).toFixed(2)} km
            </span>
          </div>
        </div>
      </div>

      {/* Interactive Controls & Scrub Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-white/10 flex flex-col gap-4 shadow-xl">
        {/* Timeline Slider */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-xs sm:text-sm">
            <span className="font-bold text-gray-300 flex items-center gap-1.5">
              <Sliders className="h-4 w-4 text-cyan-400" />
              Điều khiển tiến trình lộ trình:
            </span>
            <span className="font-mono text-cyan-300 font-bold">
              Quãng đường s = {currentDist.toFixed(2)} km / 13.00 km
            </span>
          </div>
          <div className="relative flex items-center">
            <input
              type="range"
              min="0"
              max="1"
              step="0.005"
              value={progress}
              onChange={(e) => {
                setProgress(parseFloat(e.target.value));
                if (isPlaying) setIsPlaying(false);
              }}
              className="w-full h-2.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#00FFCC]"
            />
          </div>
          {/* Milestone Labels */}
          <div className="flex items-center justify-between text-[10px] text-gray-400 font-mono px-1">
            <span className="text-cyan-400 font-bold">O (0 km)</span>
            <span className="text-purple-400 font-bold">A: Hết Tây (6 km)</span>
            <span className="text-amber-400 font-bold">B: Hết Nam (10 km)</span>
            <span className="text-emerald-400 font-bold">C: Đích Đông (13 km)</span>
          </div>
        </div>

        {/* Playback Controls & Toggles */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-white/10">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                playSoundEffect('click');
                setIsPlaying(!isPlaying);
              }}
              className="px-4 py-2 rounded-xl font-bold text-xs sm:text-sm bg-gradient-to-r from-[#00FFCC] to-blue-500 text-slate-950 hover:brightness-110 shadow-lg shadow-cyan-500/20 flex items-center gap-2 cursor-pointer transition-all"
            >
              {isPlaying ? (
                <>
                  <Pause className="h-4 w-4" />
                  Tạm Dừng
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 fill-slate-950" />
                  {progress >= 1 ? 'Chạy Lại' : 'Phát Mô Phỏng'}
                </>
              )}
            </button>

            <button
              onClick={handleReset}
              className="p-2 rounded-xl bg-slate-800 border border-white/10 text-gray-300 hover:bg-slate-700 hover:text-white transition-all cursor-pointer"
              title="Đặt lại từ đầu"
            >
              <RotateCcw className="h-4 w-4" />
            </button>

            {/* Speed Selector */}
            <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-white/10 text-xs">
              {[0.5, 1, 2, 4].map((spd) => (
                <button
                  key={spd}
                  onClick={() => {
                    playSoundEffect('click');
                    setAnimSpeed(spd);
                  }}
                  className={`px-2.5 py-1 rounded-lg font-mono font-bold transition-all cursor-pointer ${
                    animSpeed === spd
                      ? 'bg-cyan-500 text-slate-950 shadow-md'
                      : 'text-gray-400 hover:text-gray-200'
                  }`}
                >
                  {spd}x
                </button>
              ))}
            </div>
          </div>

          {/* Visual Toggles */}
          <div className="flex items-center gap-2 flex-wrap text-xs">
            <button
              onClick={() => setShowVectors(!showVectors)}
              className={`px-3 py-1.5 rounded-xl border font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                showVectors
                  ? 'bg-cyan-950/70 border-cyan-500/50 text-[#00FFCC]'
                  : 'bg-slate-800/80 border-white/10 text-gray-400'
              }`}
            >
              <Eye className="h-3.5 w-3.5" />
              Vectơ Độ dịch chuyển (d)
            </button>

            <button
              onClick={() => setShowPythagoras(!showPythagoras)}
              className={`px-3 py-1.5 rounded-xl border font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                showPythagoras
                  ? 'bg-amber-950/70 border-amber-500/50 text-amber-300'
                  : 'bg-slate-800/80 border-white/10 text-gray-400'
              }`}
            >
              <TrendingUp className="h-3.5 w-3.5" />
              Tam giác Pitago
            </button>

            <button
              onClick={() => setShowPathTrail(!showPathTrail)}
              className={`px-3 py-1.5 rounded-xl border font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                showPathTrail
                  ? 'bg-purple-950/70 border-purple-500/50 text-purple-300'
                  : 'bg-slate-800/80 border-white/10 text-gray-400'
              }`}
            >
              Vết đường đi (Trail)
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Quiz / Self-check Card (Optional toggle) */}
      {showQuiz && (
        <div className="p-4 sm:p-5 rounded-2xl bg-purple-950/30 border border-purple-500/40 shadow-xl flex flex-col gap-3.5">
          <div className="flex items-center gap-2 text-purple-300 font-bold text-sm sm:text-base">
            <Award className="h-5 w-5 text-purple-400" />
            Tự kiểm tra kiến thức (Bài tập 1 Trang 25 SGK)
          </div>
          <p className="text-xs sm:text-sm text-gray-200">
            Hãy nhập đáp án của bạn cho cả chuyến đi của ô tô:
          </p>
          <form onSubmit={handleQuizSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-amber-300">
                1. Quãng đường $s$ tổng cộng (km):
              </label>
              <input
                type="text"
                placeholder="Nhập số km (VD: 13)"
                value={userAnswerS}
                onChange={(e) => setUserAnswerS(e.target.value)}
                className="p-2 rounded-xl bg-slate-900 border border-white/15 text-white font-mono text-sm focus:border-cyan-400 focus:outline-none"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-cyan-300">
                2. Độ lớn độ dịch chuyển $d$ tổng hợp (km):
              </label>
              <input
                type="text"
                placeholder="Nhập số km (VD: 5)"
                value={userAnswerD}
                onChange={(e) => setUserAnswerD(e.target.value)}
                className="p-2 rounded-xl bg-slate-900 border border-white/15 text-white font-mono text-sm focus:border-cyan-400 focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2 flex items-center gap-3 mt-1">
              <button
                type="submit"
                className="px-4 py-2 rounded-xl font-bold text-xs bg-purple-600 hover:bg-purple-500 text-white shadow-md transition-all cursor-pointer"
              >
                Kiểm tra Kết quả
              </button>
              {quizSubmitted && (
                <div className="text-xs font-bold flex items-center gap-1.5">
                  {userAnswerS.trim() === '13' && userAnswerD.trim() === '5' ? (
                    <span className="text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="h-4 w-4" /> Chính xác tuyệt đối! s = 13 km, d = 5 km.
                    </span>
                  ) : (
                    <span className="text-rose-400">
                      Chưa đúng. Gợi ý: s = 6 + 4 + 3 = 13 km; d = √(3² + 4²) = 5 km.
                    </span>
                  )}
                </div>
              )}
            </div>
          </form>
        </div>
      )}

      {/* Physics Table & SGK Step-by-Step Solution Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Table of the 3 Legs */}
        <div className="lg:col-span-1 p-4 rounded-2xl bg-slate-900/80 border border-white/10 flex flex-col gap-3">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <span className="font-bold text-sm text-cyan-300 flex items-center gap-1.5">
              <TableIcon className="h-4 w-4" />
              Bảng Phân Tích 3 Chặng
            </span>
          </div>

          <div className="flex flex-col gap-2.5 text-xs">
            {/* Leg 1 */}
            <div className="p-2.5 rounded-xl bg-purple-950/30 border border-purple-500/30 flex flex-col gap-1">
              <div className="flex items-center justify-between font-bold text-purple-300">
                <span>Chặng 1: O → A (Hướng Tây)</span>
                <span>6 km</span>
              </div>
              <div className="text-gray-300 text-[11px]">
                <InlinePhysicsText text="• $s_1 = 6\text{ km}$; $\vec{d_1} = (-6, 0)\text{ km}$ ($d_1 = 6\text{ km}$ hướng Tây)." />
              </div>
            </div>

            {/* Leg 2 */}
            <div className="p-2.5 rounded-xl bg-amber-950/30 border border-amber-500/30 flex flex-col gap-1">
              <div className="flex items-center justify-between font-bold text-amber-300">
                <span>Chặng 2: A → B (Hướng Nam)</span>
                <span>4 km</span>
              </div>
              <div className="text-gray-300 text-[11px]">
                <InlinePhysicsText text="• $s_2 = 4\text{ km}$; $\vec{d_2} = (0, -4)\text{ km}$ ($d_2 = 4\text{ km}$ hướng Nam)." />
              </div>
            </div>

            {/* Leg 3 */}
            <div className="p-2.5 rounded-xl bg-emerald-950/30 border border-emerald-500/30 flex flex-col gap-1">
              <div className="flex items-center justify-between font-bold text-emerald-300">
                <span>Chặng 3: B → C (Hướng Đông)</span>
                <span>3 km</span>
              </div>
              <div className="text-gray-300 text-[11px]">
                <InlinePhysicsText text="• $s_3 = 3\text{ km}$; $\vec{d_3} = (+3, 0)\text{ km}$ ($d_3 = 3\text{ km}$ hướng Đông)." />
              </div>
            </div>

            {/* Summary */}
            <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-500/40 flex flex-col gap-1 font-mono">
              <div className="flex items-center justify-between text-amber-300 font-bold">
                <span>Quãng đường s:</span>
                <span>13.00 km</span>
              </div>
              <div className="flex items-center justify-between text-[#00FFCC] font-bold">
                <span>Độ dịch chuyển d:</span>
                <span>5.00 km</span>
              </div>
              <div className="flex items-center justify-between text-cyan-300 text-[11px]">
                <span>Hướng dịch chuyển:</span>
                <span>Tây Nam (53,13°)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed SGK Math Derivation */}
        <div className="lg:col-span-2 p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-white/10 flex flex-col gap-3.5">
          <div className="flex items-center gap-2 text-sm sm:text-base font-bold text-[#00FFCC]">
            <CheckCircle2 className="h-5 w-5 text-[#00FFCC]" />
            Phương pháp & Lời giải chuẩn SGK Vật Lí 10 (Trang 25)
          </div>

          <div className="space-y-3 text-xs sm:text-sm text-gray-300 leading-relaxed">
            {/* Step 1 */}
            <div className="p-3 rounded-xl bg-slate-950/60 border border-white/5 flex flex-col gap-1">
              <span className="font-bold text-amber-300">
                1. Xác định Quãng đường đi được của ô tô (s):
              </span>
              <p>
                Quãng đường là tổng chiều dài tất cả các đoạn đường mà ô tô đã lăn bánh:
              </p>
              <div className="p-2 rounded-lg bg-black/40 font-mono text-amber-200 border border-amber-500/20 text-center">
                <InlinePhysicsText text="$$s = s_1 + s_2 + s_3 = 6 + 4 + 3 = 13\text{ km}$$" />
              </div>
            </div>

            {/* Step 2 */}
            <div className="p-3 rounded-xl bg-slate-950/60 border border-white/5 flex flex-col gap-1.5">
              <span className="font-bold text-[#00FFCC]">
                2. Xác định Độ dịch chuyển tổng hợp của ô tô (vectơ d):
              </span>
              <p>
                Chọn hệ tọa độ Oxy với O là điểm xuất phát, trục Ox hướng Đông (+), trục Oy hướng Bắc (+):
              </p>
              <ul className="list-disc list-inside space-y-1 text-gray-200 pl-1">
                <li>
                  Vị trí theo phương ngang (Tây - Đông): ô tô đi 6 km sang Tây rồi quay lại 3 km sang Đông → <InlinePhysicsText text="$d_x = -6 + 3 = -3\text{ km}$" /> (cách gốc 3 km về phía Tây).
                </li>
                <li>
                  Vị trí theo phương dọc (Bắc - Nam): ô tô đi 4 km sang Nam → <InlinePhysicsText text="$d_y = -4\text{ km}$" /> (cách gốc 4 km về phía Nam).
                </li>
              </ul>
              <p className="mt-1">
                Áp dụng định lí Pythagore cho tam giác vuông có 2 cạnh góc vuông 3 km và 4 km:
              </p>
              <div className="p-2 rounded-lg bg-black/40 font-mono text-[#00FFCC] border border-cyan-500/30 text-center font-bold">
                <InlinePhysicsText text="$$d = \sqrt{(\Delta x)^2 + (\Delta y)^2} = \sqrt{(-3)^2 + (-4)^2} = \sqrt{9 + 16} = \sqrt{25} = 5\text{ km}$$" />
              </div>
              <p>
                Hướng của vectơ độ dịch chuyển là hướng <strong>Tây Nam</strong>, tạo với hướng Tây một góc α:
              </p>
              <div className="p-2 rounded-lg bg-black/40 font-mono text-cyan-200 border border-cyan-500/20 text-center">
                <InlinePhysicsText text="$$\tan\alpha = \frac{|\Delta y|}{|\Delta x|} = \frac{4}{3} \Rightarrow \alpha \approx 53,13^\circ$$" />
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-500/30 flex items-start gap-2.5 text-xs text-amber-100 mt-1">
            <Info className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              💡 <strong>Kết luận:</strong> Quãng đường s = 13 km, trong khi độ lớn độ dịch chuyển chỉ là d = 5 km. Quãng đường s &gt; d vì ô tô đổi hướng chuyển động và không đi trên một đường thẳng không đổi chiều.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
