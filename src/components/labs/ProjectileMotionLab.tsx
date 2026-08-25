import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  RotateCcw, 
  Ruler, 
  Target, 
  Table, 
  Download, 
  Copy, 
  CheckCircle2, 
  Sparkles, 
  Crosshair, 
  Compass, 
  HelpCircle, 
  ChevronRight, 
  Eye, 
  Layers,
  Zap
} from 'lucide-react';
import { MathFormula } from '../MathFormula';

export interface ProjectileLabRecord {
  id: number;
  v0: number;
  angle: number;
  h0: number;
  g: number;
  tFlightTheory: number;
  tFlightMeasured: number;
  hMaxTheory: number;
  hMaxMeasured: number;
  rangeTheory: number;
  rangeMeasured: number;
  errorPercent: number;
  notes: string;
}

export const ProjectileMotionLab: React.FC = () => {
  // Launch parameters
  const [v0, setV0] = useState<number>(25); // m/s (5 to 45)
  const [angle, setAngle] = useState<number>(45); // degrees (0 to 90)
  const [h0, setH0] = useState<number>(10); // m (0 to 25)
  const [g, setG] = useState<number>(9.8); // m/s²
  const [airResistance, setAirResistance] = useState<boolean>(false);
  const [environment, setEnvironment] = useState<'EARTH' | 'MOON' | 'MARS' | 'JUPITER'>('EARTH');

  // Interactive Tools state
  const [activeTool, setActiveTool] = useState<'NONE' | 'TAPE' | 'PROBE' | 'TARGET'>('TAPE');
  
  // Measuring Tape Coordinates in Physics space (meters)
  const [tapeStart, setTapeStart] = useState<{ x: number; y: number }>({ x: 0, y: 10 });
  const [tapeEnd, setTapeEnd] = useState<{ x: number; y: number }>({ x: 45, y: 0 });
  const [isDraggingTapeStart, setIsDraggingTapeStart] = useState<boolean>(false);
  const [isDraggingTapeEnd, setIsDraggingTapeEnd] = useState<boolean>(false);

  // Movable Target in Physics space (meters)
  const [targetPos, setTargetPos] = useState<{ x: number; y: number }>({ x: 55, y: 0 });
  const [isDraggingTarget, setIsDraggingTarget] = useState<boolean>(false);
  const [targetHitMessage, setTargetHitMessage] = useState<string | null>(null);

  // Trajectory Probe state
  const [probeT, setProbeT] = useState<number>(0);

  // Simulation execution state
  const [isLaunching, setIsLaunching] = useState<boolean>(false);
  const [simTime, setSimTime] = useState<number>(0);
  const [launchHistory, setLaunchHistory] = useState<Array<{
    id: number;
    color: string;
    points: Array<{ x: number; y: number }>;
    v0: number;
    angle: number;
    h0: number;
    range: number;
    hMax: number;
  }>>([]);

  // Data Table Records
  const [records, setRecords] = useState<ProjectileLabRecord[]>([
    {
      id: 1,
      v0: 20,
      angle: 45,
      h0: 0,
      g: 9.8,
      tFlightTheory: 2.89,
      tFlightMeasured: 2.90,
      hMaxTheory: 10.20,
      hMaxMeasured: 10.22,
      rangeTheory: 40.82,
      rangeMeasured: 40.75,
      errorPercent: 0.17,
      notes: 'Bắn từ mặt đất góc 45° tầm xa cực đại',
    },
    {
      id: 2,
      v0: 20,
      angle: 30,
      h0: 0,
      g: 9.8,
      tFlightTheory: 2.04,
      tFlightMeasured: 2.05,
      hMaxTheory: 5.10,
      hMaxMeasured: 5.12,
      rangeTheory: 35.35,
      rangeMeasured: 35.40,
      errorPercent: 0.14,
      notes: 'Bắn góc 30° so sánh tầm xa với góc 60°',
    },
    {
      id: 3,
      v0: 20,
      angle: 60,
      h0: 0,
      g: 9.8,
      tFlightTheory: 3.53,
      tFlightMeasured: 3.52,
      hMaxTheory: 15.31,
      hMaxMeasured: 15.28,
      rangeTheory: 35.35,
      rangeMeasured: 35.30,
      errorPercent: 0.14,
      notes: 'Tầm xa góc 60° bằng góc 30° (cùng tổng 90°)',
    },
  ]);

  const [copiedSuccess, setCopiedSuccess] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameId = useRef<number | null>(null);
  const currentTrajectory = useRef<Array<{ x: number; y: number }>>([]);

  // Physics Calculations
  const rad = (angle * Math.PI) / 180;
  const vx0 = v0 * Math.cos(rad);
  const vy0 = v0 * Math.sin(rad);

  // Time to apex: t_up = vy0 / g
  const tUp = vy0 > 0 ? vy0 / g : 0;
  // Apex max height: H_max = h0 + vy0^2 / (2g)
  const hMaxTheory = vy0 > 0 ? h0 + (vy0 * vy0) / (2 * g) : h0;

  // Quadratic equation for total theoretical flight time: h0 + vy0*t - 0.5*g*t^2 = 0
  const discr = vy0 * vy0 + 2 * g * h0;
  const tFlightTheory = (vy0 + Math.sqrt(Math.max(0, discr))) / g;
  const rangeTheory = vx0 * tFlightTheory;

  // Measuring Tape Measured values
  const tapeDx = Math.abs(tapeEnd.x - tapeStart.x);
  const tapeDy = Math.abs(tapeEnd.y - tapeStart.y);
  const tapeLength = Math.sqrt(tapeDx * tapeDx + tapeDy * tapeDy);

  // Handle environment presets
  const handleSetEnvironment = (env: 'EARTH' | 'MOON' | 'MARS' | 'JUPITER') => {
    setEnvironment(env);
    if (env === 'EARTH') setG(9.8);
    if (env === 'MOON') setG(1.62);
    if (env === 'MARS') setG(3.71);
    if (env === 'JUPITER') setG(24.79);
  };

  // Launch the projectile
  const handleLaunch = () => {
    if (isLaunching) return;
    setIsLaunching(true);
    setSimTime(0);
    setTargetHitMessage(null);
    currentTrajectory.current = [{ x: 0, y: h0 }];
  };

  // Reset projectile & active canvas state
  const handleReset = () => {
    setIsLaunching(false);
    setSimTime(0);
    currentTrajectory.current = [{ x: 0, y: h0 }];
  };

  // Record current launch into the data table
  const handleRecordData = () => {
    const noiseT = (Math.random() - 0.5) * 0.02;
    const noiseH = (Math.random() - 0.5) * 0.05;
    const noiseL = (Math.random() - 0.5) * 0.1;

    const measuredT = Number(Math.max(0.1, tFlightTheory + noiseT).toFixed(2));
    const measuredH = Number(Math.max(0, hMaxTheory + noiseH).toFixed(2));
    const measuredL = Number(Math.max(0.1, rangeTheory + noiseL).toFixed(2));

    const err = Number((Math.abs(measuredL - rangeTheory) / rangeTheory * 100).toFixed(2));

    const newRecord: ProjectileLabRecord = {
      id: records.length + 1,
      v0,
      angle,
      h0,
      g,
      tFlightTheory: Number(tFlightTheory.toFixed(2)),
      tFlightMeasured: measuredT,
      hMaxTheory: Number(hMaxTheory.toFixed(2)),
      hMaxMeasured: measuredH,
      rangeTheory: Number(rangeTheory.toFixed(2)),
      rangeMeasured: measuredL,
      errorPercent: isNaN(err) ? 0 : err,
      notes: h0 > 0 ? `Ném từ độ cao ${h0}m góc ${angle}°` : `Ném từ mặt đất góc ${angle}°`,
    };

    setRecords((prev) => [...prev, newRecord]);
  };

  // Copy Markdown Table for teacher/student lab report
  const handleCopyMarkdownTable = () => {
    const mdHeader = `| Lần TN | $v_0$ (m/s) | $\\alpha$ (°) | $h_0$ (m) | $g$ (m/s²) | $t_{\\text{LT}}$ (s) | $t_{\\text{TN}}$ (s) | $H_{\\max\\text{, LT}}$ (m) | $H_{\\max\\text{, TN}}$ (m) | $L_{\\text{LT}}$ (m) | $L_{\\text{TN}}$ (m) | Sai số $\\delta L$ (%) | Nhận xét |\n|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---|\n`;
    const mdRows = records
      .map(
        (r) =>
          `| ${r.id} | ${r.v0} | ${r.angle} | ${r.h0} | ${r.g} | ${r.tFlightTheory} | ${r.tFlightMeasured} | ${r.hMaxTheory} | ${r.hMaxMeasured} | ${r.rangeTheory} | ${r.rangeMeasured} | ${r.errorPercent}% | ${r.notes} |`
      )
      .join('\n');

    const fullMarkdown = mdHeader + mdRows;
    navigator.clipboard.writeText(fullMarkdown);
    setCopiedSuccess(true);
    setTimeout(() => setCopiedSuccess(false), 3000);
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['Lan_TN', 'v0_m_s', 'Goc_deg', 'h0_m', 'g_m_s2', 't_LT_s', 't_TN_s', 'Hmax_LT_m', 'Hmax_TN_m', 'L_LT_m', 'L_TN_m', 'Sai_so_percent', 'Ghi_chu'];
    const rows = records.map((r) => [
      r.id,
      r.v0,
      r.angle,
      r.h0,
      r.g,
      r.tFlightTheory,
      r.tFlightMeasured,
      r.hMaxTheory,
      r.hMaxMeasured,
      r.rangeTheory,
      r.rangeMeasured,
      r.errorPercent,
      `"${r.notes}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `bao_cao_thi_nghiem_nem_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Animation / Simulation Loop
  useEffect(() => {
    let lastTime = performance.now();
    const colors = ['#00D4FF', '#00FFCC', '#F59E0B', '#A855F7', '#EC4899'];

    const updateLoop = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.04);
      lastTime = now;

      if (isLaunching) {
        setSimTime((prevTime) => {
          const nextTime = prevTime + dt * 1.5;

          let curX = vx0 * nextTime;
          let curY = h0 + vy0 * nextTime - 0.5 * g * nextTime * nextTime;

          if (airResistance) {
            const k = 0.035;
            curX = (vx0 / k) * (1 - Math.exp(-k * nextTime));
            curY = h0 + ((vy0 + g / k) / k) * (1 - Math.exp(-k * nextTime)) - (g / k) * nextTime;
          }

          // Check landing
          if (curY <= 0) {
            curY = 0;
            setIsLaunching(false);
            currentTrajectory.current.push({ x: curX, y: 0 });

            // Check target hit
            const distToTarget = Math.sqrt((curX - targetPos.x) ** 2 + (0 - targetPos.y) ** 2);
            if (distToTarget < 3.5) {
              setTargetHitMessage(`🎯 TRÚNG MỤC TIÊU! Độ lệch chỉ ${distToTarget.toFixed(2)}m!`);
            } else {
              setTargetHitMessage(`Vị trí rơi: ${curX.toFixed(2)}m (Cách mục tiêu ${Math.abs(curX - targetPos.x).toFixed(2)}m)`);
            }

            // Save to trajectory history
            const histColor = colors[launchHistory.length % colors.length];
            setLaunchHistory((prev) => [
              ...prev.slice(-4), // keep max 5
              {
                id: Date.now(),
                color: histColor,
                points: [...currentTrajectory.current],
                v0,
                angle,
                h0,
                range: curX,
                hMax: hMaxTheory,
              },
            ]);

            return tFlightTheory;
          }

          currentTrajectory.current.push({ x: curX, y: curY });
          return nextTime;
        });
      }

      animFrameId.current = requestAnimationFrame(updateLoop);
    };

    animFrameId.current = requestAnimationFrame(updateLoop);
    return () => {
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
    };
  }, [isLaunching, vx0, vy0, h0, g, airResistance, tFlightTheory, targetPos, launchHistory.length, hMaxTheory, v0, angle]);

  // Canvas Drawing (Field, Launcher, Trajectory, Measuring Tools, Target)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Viewport Coordinate Mapping
    // Max view range: 0m to 120m, height 0m to 50m
    const maxViewX = Math.max(75, rangeTheory * 1.25);
    const maxViewY = Math.max(30, hMaxTheory * 1.35);

    const padL = 50;
    const padB = 40;
    const padT = 30;
    const padR = 30;

    const plotW = width - padL - padR;
    const plotH = height - padB - padT;

    const toPxX = (mX: number) => padL + (mX / maxViewX) * plotW;
    const toPxY = (mY: number) => height - padB - (mY / maxViewY) * plotH;

    const fromPxX = (px: number) => ((px - padL) / plotW) * maxViewX;
    const fromPxY = (py: number) => ((height - padB - py) / plotH) * maxViewY;

    // Clear Canvas
    ctx.clearRect(0, 0, width, height);

    // Canvas Background
    const skyGrad = ctx.createLinearGradient(0, 0, 0, height - padB);
    skyGrad.addColorStop(0, '#070E1C');
    skyGrad.addColorStop(1, '#0C1528');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, width, height - padB);

    // Ground Platform
    ctx.fillStyle = '#050B18';
    ctx.fillRect(0, height - padB, width, padB);
    ctx.strokeStyle = '#00FFCC';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, height - padB);
    ctx.lineTo(width, height - padB);
    ctx.stroke();

    // Coordinate Grid lines & Meter ticks
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
    ctx.lineWidth = 1;
    ctx.fillStyle = '#64748B';
    ctx.font = '9px monospace';
    ctx.textAlign = 'center';

    for (let m = 0; m <= maxViewX; m += 10) {
      const px = toPxX(m);
      ctx.beginPath();
      ctx.moveTo(px, padT);
      ctx.lineTo(px, height - padB);
      ctx.stroke();

      // Tick on ground
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.beginPath();
      ctx.moveTo(px, height - padB);
      ctx.lineTo(px, height - padB + 6);
      ctx.stroke();

      ctx.fillText(`${m}m`, px, height - padB + 18);
    }

    // Y Axis Ticks
    ctx.textAlign = 'right';
    for (let m = 0; m <= maxViewY; m += 5) {
      const py = toPxY(m);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
      ctx.beginPath();
      ctx.moveTo(padL, py);
      ctx.lineTo(width - padR, py);
      ctx.stroke();

      ctx.fillText(`${m}m`, padL - 6, py + 3);
    }

    // Launch Platform Tower (if h0 > 0)
    if (h0 > 0) {
      const towerPxX = toPxX(0);
      const towerTopY = toPxY(h0);
      const groundY = toPxY(0);

      ctx.fillStyle = 'rgba(30, 41, 59, 0.8)';
      ctx.fillRect(towerPxX - 16, towerTopY, 32, groundY - towerTopY);
      ctx.strokeStyle = 'rgba(0, 212, 255, 0.4)';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(towerPxX - 16, towerTopY, 32, groundY - towerTopY);

      // Truss X markings on tower
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.beginPath();
      for (let y = 0; y < groundY - towerTopY; y += 20) {
        ctx.moveTo(towerPxX - 16, towerTopY + y);
        ctx.lineTo(towerPxX + 16, towerTopY + y + 20);
        ctx.moveTo(towerPxX + 16, towerTopY + y);
        ctx.lineTo(towerPxX - 16, towerTopY + y + 20);
      }
      ctx.stroke();
    }

    // Cannon / Launcher Barrel
    const barrelOriginX = toPxX(0);
    const barrelOriginY = toPxY(h0);
    const barrelLen = 28;

    ctx.save();
    ctx.translate(barrelOriginX, barrelOriginY);
    ctx.rotate(-rad); // Canvas Y is inverted

    // Cannon Barrel
    const barrelGrad = ctx.createLinearGradient(0, -6, barrelLen, 6);
    barrelGrad.addColorStop(0, '#00D4FF');
    barrelGrad.addColorStop(1, '#005588');
    ctx.fillStyle = barrelGrad;
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 1;
    ctx.fillRect(0, -6, barrelLen, 12);
    ctx.strokeRect(0, -6, barrelLen, 12);

    ctx.restore();

    // Cannon Base Wheel
    ctx.fillStyle = '#0F172A';
    ctx.strokeStyle = '#00D4FF';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(barrelOriginX, barrelOriginY, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Protractor Angle Arc around cannon
    ctx.strokeStyle = 'rgba(0, 255, 204, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(barrelOriginX, barrelOriginY, 36, 0, -rad, true);
    ctx.stroke();

    ctx.fillStyle = '#00FFCC';
    ctx.font = 'bold 10px monospace';
    ctx.fillText(`${angle}°`, barrelOriginX + 42, barrelOriginY - 8);

    // Draw Previous Trajectory History
    launchHistory.forEach((hist) => {
      if (hist.points.length > 1) {
        ctx.strokeStyle = hist.color;
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        hist.points.forEach((pt, i) => {
          const px = toPxX(pt.x);
          const py = toPxY(pt.y);
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        });
        ctx.stroke();
        ctx.setLineDash([]);
      }
    });

    // Draw Current Live Trajectory Path
    if (currentTrajectory.current.length > 1) {
      ctx.strokeStyle = '#00FFCC';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      currentTrajectory.current.forEach((pt, i) => {
        const px = toPxX(pt.x);
        const py = toPxY(pt.y);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      });
      ctx.stroke();

      // Theoretical Apex Point Star
      const apexPxX = toPxX(vx0 * tUp);
      const apexPxY = toPxY(hMaxTheory);
      ctx.fillStyle = '#F59E0B';
      ctx.beginPath();
      ctx.arc(apexPxX, apexPxY, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.font = 'bold 9px monospace';
      ctx.fillText(`H_max = ${hMaxTheory.toFixed(1)}m`, apexPxX, apexPxY - 8);

      // Theoretical Landing Point Marker
      const landPxX = toPxX(rangeTheory);
      const landPxY = toPxY(0);
      ctx.fillStyle = '#00D4FF';
      ctx.beginPath();
      ctx.arc(landPxX, landPxY, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillText(`L = ${rangeTheory.toFixed(1)}m`, landPxX, landPxY - 8);
    }

    // Draw Active Projectile Ball & Vector Arrows
    if (currentTrajectory.current.length > 0) {
      const lastPt = currentTrajectory.current[currentTrajectory.current.length - 1];
      const curPx = toPxX(lastPt.x);
      const curPy = toPxY(lastPt.y);

      // Glowing projectile
      ctx.shadowColor = '#00FFCC';
      ctx.shadowBlur = 15;
      ctx.fillStyle = '#00FFCC';
      ctx.beginPath();
      ctx.arc(curPx, curPy, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0; // reset
    }

    // Movable Target Bullseye
    const targetPxX = toPxX(targetPos.x);
    const targetPxY = toPxY(targetPos.y);

    ctx.strokeStyle = '#EF4444';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(targetPxX, targetPxY, 14, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = '#EF4444';
    ctx.beginPath();
    ctx.arc(targetPxX, targetPxY, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#F87171';
    ctx.font = 'bold 9px monospace';
    ctx.fillText(`Mục tiêu: ${targetPos.x.toFixed(1)}m`, targetPxX, targetPxY - 20);

    // Interactive Measuring Tape Tool
    if (activeTool === 'TAPE') {
      const startPxX = toPxX(tapeStart.x);
      const startPxY = toPxY(tapeStart.y);
      const endPxX = toPxX(tapeEnd.x);
      const endPxY = toPxY(tapeEnd.y);

      // Tape Line
      ctx.strokeStyle = '#FACC15';
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 3]);
      ctx.beginPath();
      ctx.moveTo(startPxX, startPxY);
      ctx.lineTo(endPxX, endPxY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Tape Handles
      ctx.fillStyle = '#FACC15';
      ctx.beginPath();
      ctx.arc(startPxX, startPxY, 7, 0, Math.PI * 2);
      ctx.arc(endPxX, endPxY, 7, 0, Math.PI * 2);
      ctx.fill();

      // Tape Center Badge with Measurement
      const midPxX = (startPxX + endPxX) / 2;
      const midPxY = (startPxY + endPxY) / 2;

      ctx.fillStyle = 'rgba(12, 21, 40, 0.9)';
      ctx.strokeStyle = '#FACC15';
      ctx.lineWidth = 1;
      ctx.fillRect(midPxX - 55, midPxY - 14, 110, 24);
      ctx.strokeRect(midPxX - 55, midPxY - 14, 110, 24);

      ctx.fillStyle = '#FACC15';
      ctx.font = 'bold 10px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`Thước: ${tapeLength.toFixed(2)} m`, midPxX, midPxY + 2);
    }

  }, [v0, angle, h0, g, airResistance, rangeTheory, hMaxTheory, launchHistory, targetPos, tapeStart, tapeEnd, activeTool]);

  // Mouse interaction for dragging measuring tape handles or target
  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const maxViewX = Math.max(75, rangeTheory * 1.25);
    const maxViewY = Math.max(30, hMaxTheory * 1.35);
    const padL = 50;
    const padB = 40;
    const padT = 30;
    const padR = 30;
    const plotW = canvas.width - padL - padR;
    const plotH = canvas.height - padB - padT;

    const toPxX = (mX: number) => padL + (mX / maxViewX) * plotW;
    const toPxY = (mY: number) => canvas.height - padB - (mY / maxViewY) * plotH;

    // Check Tape Handles
    if (activeTool === 'TAPE') {
      const dStart = Math.hypot(clickX - toPxX(tapeStart.x), clickY - toPxY(tapeStart.y));
      const dEnd = Math.hypot(clickX - toPxX(tapeEnd.x), clickY - toPxY(tapeEnd.y));

      if (dStart < 15) {
        setIsDraggingTapeStart(true);
        return;
      }
      if (dEnd < 15) {
        setIsDraggingTapeEnd(true);
        return;
      }
    }

    // Check Target
    if (activeTool === 'TARGET') {
      const dTarget = Math.hypot(clickX - toPxX(targetPos.x), clickY - toPxY(targetPos.y));
      if (dTarget < 25) {
        setIsDraggingTarget(true);
        return;
      }
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const maxViewX = Math.max(75, rangeTheory * 1.25);
    const maxViewY = Math.max(30, hMaxTheory * 1.35);
    const padL = 50;
    const padB = 40;
    const padT = 30;
    const padR = 30;
    const plotW = canvas.width - padL - padR;
    const plotH = canvas.height - padB - padT;

    const fromPxX = (px: number) => Math.max(0, ((px - padL) / plotW) * maxViewX);
    const fromPxY = (py: number) => Math.max(0, ((canvas.height - padB - py) / plotH) * maxViewY);

    if (isDraggingTapeStart) {
      setTapeStart({ x: Number(fromPxX(mouseX).toFixed(1)), y: Number(fromPxY(mouseY).toFixed(1)) });
    } else if (isDraggingTapeEnd) {
      setTapeEnd({ x: Number(fromPxX(mouseX).toFixed(1)), y: Number(fromPxY(mouseY).toFixed(1)) });
    } else if (isDraggingTarget) {
      setTargetPos({ x: Number(fromPxX(mouseX).toFixed(1)), y: 0 });
    }
  };

  const handleCanvasMouseUp = () => {
    setIsDraggingTapeStart(false);
    setIsDraggingTapeEnd(false);
    setIsDraggingTarget(false);
  };

  return (
    <div id="projectile-motion-lab" className="space-y-6 rounded-2xl border border-white/10 bg-[#0C1528]/90 p-6 shadow-2xl backdrop-blur-md">
      {/* Header & Objectives */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-[#00D4FF]/15 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-[#00D4FF] border border-[#00D4FF]/30">
              BÀI THỰC HÀNH THÍ NGHIỆM SỐ VẬT LÍ 10
            </span>
            <span className="rounded-md bg-[#00FFCC]/15 px-2.5 py-1 text-xs font-bold text-[#00FFCC] border border-[#00FFCC]/30">
              Chuẩn GDPT 2018 - Bài 12
            </span>
          </div>
          <h2 className="mt-1.5 text-xl font-bold text-white sm:text-2xl">
            Thí nghiệm Thực hành: Chuyển động ném xiên và ném ngang
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Bắn vật thể với các góc α, vận tốc v₀, độ cao h₀ khác nhau; dùng thước đo kiểm chứng tầm bay xa L, tầm cao H_max và lập bảng số liệu báo cáo thí nghiệm.
          </p>
        </div>

        {/* Launch Button & Controls */}
        <div className="flex items-center gap-2">
          <button
            id="lab-launch-projectile-btn"
            onClick={handleLaunch}
            disabled={isLaunching}
            className="flex items-center gap-2 rounded-xl bg-[#00D4FF] hover:bg-[#00B8E0] px-5 py-2.5 text-xs font-bold text-black shadow-[0_0_20px_rgba(0,212,255,0.3)] transition-all cursor-pointer disabled:opacity-50 active:scale-95"
          >
            <Play className="h-4 w-4 fill-black" />
            <span>{isLaunching ? 'ĐANG BAY...' : 'PHÓNG BẮN'}</span>
          </button>

          <button
            id="lab-record-data-btn"
            onClick={handleRecordData}
            className="flex items-center gap-1.5 rounded-xl border border-[#00FFCC]/40 bg-[#00FFCC]/10 px-4 py-2.5 text-xs font-bold text-[#00FFCC] hover:bg-[#00FFCC]/20 transition cursor-pointer"
          >
            <Table className="h-4 w-4" />
            <span>Ghi số liệu vào bảng</span>
          </button>

          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-[#070E1C] px-3.5 py-2.5 text-xs font-semibold text-gray-300 hover:bg-white/5 hover:text-white transition cursor-pointer"
          >
            <RotateCcw className="h-4 w-4" />
            <span className="hidden sm:inline">Đặt lại</span>
          </button>
        </div>
      </div>

      {/* Target Hit Notification */}
      {targetHitMessage && (
        <div className="flex items-center justify-between rounded-xl border border-[#00FFCC]/30 bg-[#00FFCC]/10 p-3 text-xs font-bold text-[#00FFCC] shadow-[0_0_15px_rgba(0,255,204,0.2)]">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-[#00FFCC]" />
            <span>{targetHitMessage}</span>
          </div>
          <button onClick={() => setTargetHitMessage(null)} className="text-gray-400 hover:text-white">
            ✕
          </button>
        </div>
      )}

      {/* Controls & Environment Parameters */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 rounded-xl border border-white/10 bg-[#070E1C] p-4">
        {/* Speed v0 */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-gray-300">Vận tốc ban đầu v₀:</span>
            <span className="font-mono font-bold text-[#00D4FF]">{v0} m/s</span>
          </div>
          <input
            type="range"
            min="5"
            max="45"
            step="1"
            value={v0}
            onChange={(e) => setV0(Number(e.target.value))}
            className="w-full accent-[#00D4FF] cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-gray-500 font-mono">
            <span>5 m/s</span>
            <span>25 m/s</span>
            <span>45 m/s</span>
          </div>
        </div>

        {/* Angle alpha */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-gray-300">Góc bắn α:</span>
            <span className="font-mono font-bold text-[#00FFCC]">{angle}°</span>
          </div>
          <input
            type="range"
            min="0"
            max="90"
            step="5"
            value={angle}
            onChange={(e) => setAngle(Number(e.target.value))}
            className="w-full accent-[#00FFCC] cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-gray-400 font-mono">
            {[0, 30, 45, 60, 90].map((deg) => (
              <button
                key={deg}
                onClick={() => setAngle(deg)}
                className={`hover:text-[#00FFCC] ${angle === deg ? 'font-bold text-[#00FFCC]' : ''}`}
              >
                {deg}°
              </button>
            ))}
          </div>
        </div>

        {/* Initial Height h0 */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-gray-300">Độ cao bệ phóng h₀:</span>
            <span className="font-mono font-bold text-[#F59E0B]">{h0} m</span>
          </div>
          <input
            type="range"
            min="0"
            max="25"
            step="2.5"
            value={h0}
            onChange={(e) => setH0(Number(e.target.value))}
            className="w-full accent-[#F59E0B] cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-gray-500 font-mono">
            <span>0m (Mặt đất)</span>
            <span>10m</span>
            <span>25m (Tháp cao)</span>
          </div>
        </div>

        {/* Gravity Environment */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-gray-300">Môi trường trọng lực g:</span>
            <span className="font-mono font-bold text-purple-400">{g} m/s²</span>
          </div>
          <div className="grid grid-cols-4 gap-1">
            {[
              { id: 'EARTH', label: 'Trái Đất', g: 9.8 },
              { id: 'MOON', label: 'Mặt Trăng', g: 1.62 },
              { id: 'MARS', label: 'Sao Hỏa', g: 3.71 },
              { id: 'JUPITER', label: 'Sao Mộc', g: 24.8 },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => handleSetEnvironment(item.id as any)}
                className={`rounded py-1 text-[10px] font-semibold transition ${
                  environment === item.id ? 'bg-[#00D4FF] text-black font-bold' : 'bg-white/5 text-gray-400 hover:bg-white/10'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 pt-1 text-[11px]">
            <label className="flex items-center gap-1 text-gray-400 cursor-pointer">
              <input
                type="checkbox"
                checked={airResistance}
                onChange={(e) => setAirResistance(e.target.checked)}
                className="rounded accent-[#00D4FF]"
              />
              <span>Lực cản không khí</span>
            </label>
          </div>
        </div>
      </div>

      {/* Tool Selection Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-[#070E1C] px-4 py-2.5">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-gray-400">Dụng cụ đo lường:</span>
          {[
            { id: 'TAPE', label: 'Thước đo khoảng cách (Tape Ruler)', icon: Ruler },
            { id: 'TARGET', label: 'Mục tiêu bia ngắm (Target)', icon: Target },
            { id: 'NONE', label: 'Tắt thước', icon: Eye },
          ].map((t) => {
            const Icon = t.icon;
            const isSelected = activeTool === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTool(t.id as any)}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-semibold transition ${
                  isSelected ? 'bg-[#00D4FF] text-black font-bold' : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        {activeTool === 'TAPE' && (
          <div className="flex items-center gap-3 text-xs font-mono text-gray-300">
            <span>Δx: <strong className="text-[#00D4FF]">{tapeDx.toFixed(2)}m</strong></span>
            <span>Δy: <strong className="text-[#00FFCC]">{tapeDy.toFixed(2)}m</strong></span>
            <span>Khoảng cách: <strong className="text-yellow-400">{tapeLength.toFixed(2)}m</strong></span>
          </div>
        )}
      </div>

      {/* Main Interactive Canvas Field */}
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#050B18] shadow-inner">
        <canvas
          ref={canvasRef}
          width={880}
          height={320}
          onMouseDown={handleCanvasMouseDown}
          onMouseMove={handleCanvasMouseMove}
          onMouseUp={handleCanvasMouseUp}
          className="w-full h-auto block cursor-crosshair"
        />

        <div className="absolute top-3 right-3 rounded-lg border border-white/10 bg-[#0C1528]/90 p-2.5 text-[11px] font-mono text-gray-300 backdrop-blur space-y-1">
          <div>v₀x = v₀ cos α: <span className="text-[#00D4FF] font-bold">{vx0.toFixed(2)} m/s</span></div>
          <div>v₀y = v₀ sin α: <span className="text-[#00FFCC] font-bold">{vy0.toFixed(2)} m/s</span></div>
          <div>t rơi (Lí thuyết): <span className="text-amber-400 font-bold">{tFlightTheory.toFixed(2)} s</span></div>
          <div>H_max (Lí thuyết): <span className="text-purple-400 font-bold">{hMaxTheory.toFixed(2)} m</span></div>
          <div>L (Tầm xa lí thuyết): <span className="text-[#00D4FF] font-bold">{rangeTheory.toFixed(2)} m</span></div>
        </div>
      </div>

      {/* Interactive Data Table & Recording Observations */}
      <div className="space-y-4 rounded-xl border border-white/10 bg-[#070E1C] p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <Table className="h-5 w-5 text-[#00FFCC]" />
            <h3 className="text-sm font-bold text-white">
              Bảng kết quả đo lường và tính toán sai số (Experimental Observation Table)
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyMarkdownTable}
              className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-[#0C1528] px-3 py-1.5 text-xs font-semibold text-gray-200 hover:border-[#00D4FF]/40 hover:text-[#00D4FF] transition"
            >
              {copiedSuccess ? <CheckCircle2 className="h-3.5 w-3.5 text-[#00FFCC]" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copiedSuccess ? 'Đã sao chép Markdown!' : 'Sao chép Markdown'}</span>
            </button>

            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 rounded-lg bg-[#00D4FF] hover:bg-[#00B8E0] px-3 py-1.5 text-xs font-bold text-black transition"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Xuất CSV</span>
            </button>
          </div>
        </div>

        {/* Observation Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-white/10 bg-[#0C1528] text-gray-400 font-mono">
              <tr>
                <th className="py-2.5 px-3">Lần TN</th>
                <th className="py-2.5 px-3">v₀ (m/s)</th>
                <th className="py-2.5 px-3">Góc α (°)</th>
                <th className="py-2.5 px-3">h₀ (m)</th>
                <th className="py-2.5 px-3">t_LT (s)</th>
                <th className="py-2.5 px-3">t_TN (s)</th>
                <th className="py-2.5 px-3">H_max, LT (m)</th>
                <th className="py-2.5 px-3">H_max, TN (m)</th>
                <th className="py-2.5 px-3">L_LT (m)</th>
                <th className="py-2.5 px-3">L_TN (m)</th>
                <th className="py-2.5 px-3">Sai số δL (%)</th>
                <th className="py-2.5 px-3">Nhận xét</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-mono">
              {records.map((r) => (
                <tr key={r.id} className="hover:bg-white/5 transition-colors">
                  <td className="py-2 px-3 font-bold text-white">#{r.id}</td>
                  <td className="py-2 px-3 text-[#00D4FF]">{r.v0}</td>
                  <td className="py-2 px-3 text-[#00FFCC]">{r.angle}°</td>
                  <td className="py-2 px-3">{r.h0}</td>
                  <td className="py-2 px-3 text-gray-400">{r.tFlightTheory}</td>
                  <td className="py-2 px-3 text-white font-bold">{r.tFlightMeasured}</td>
                  <td className="py-2 px-3 text-gray-400">{r.hMaxTheory}</td>
                  <td className="py-2 px-3 text-purple-300 font-bold">{r.hMaxMeasured}</td>
                  <td className="py-2 px-3 text-gray-400">{r.rangeTheory}</td>
                  <td className="py-2 px-3 text-[#00D4FF] font-bold">{r.rangeMeasured}</td>
                  <td className="py-2 px-3 text-amber-400">{r.errorPercent}%</td>
                  <td className="py-2 px-3 font-sans text-gray-300 text-[11px]">{r.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pedagogical Conclusion according to GDPT 2018 */}
        <div className="rounded-xl border border-white/10 bg-[#0C1528] p-4 text-xs leading-relaxed text-gray-300 space-y-2">
          <div className="font-bold text-white flex items-center gap-1.5">
            <Sparkles className="h-4 w-4 text-[#00FFCC]" />
            <span>Kết luận thực nghiệm rút ra từ bảng số liệu:</span>
          </div>
          <ul className="list-disc pl-5 space-y-1 text-gray-300">
            <li>
              Khi ném xiên từ mặt đất (h₀ = 0), với cùng vận tốc ban đầu v₀, hai góc bắn phụ nhau (α₁ + α₂ = 90°, ví dụ 30° và 60°) sẽ cho <strong>cùng một tầm xa L</strong>.
            </li>
            <li>
              Tầm xa L đạt giá trị lớn nhất (L_max = v₀² / g) khi góc bắn <strong>α = 45°</strong>.
            </li>
            <li>
              Chuyển động ném là sự kết hợp độc lập của 2 chuyển động thành phần: theo phương ngang Ox chuyển động thẳng đều với vận tốc v₀x = v₀ cos α, theo phương thẳng đứng Oy là chuyển động biến đổi đều với gia tốc rơi tự do g.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
