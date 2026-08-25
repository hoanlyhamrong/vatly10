import React, { useState, useRef, useEffect, useId } from 'react';
import {
  Activity,
  Play,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  TrendingDown,
  TrendingUp,
  Ruler,
  HelpCircle,
  Volume2,
  VolumeX,
  Eye,
  Sliders,
  ChevronRight,
  Maximize2
} from 'lucide-react';
import { InlinePhysicsText, FormattedPhysicsText } from '../ui/FormattedPhysicsText';
import { speakVietnamese, stopSpeaking } from '../../utils/speechUtils';

export type PointKey = 'E' | 'C' | 'D' | 'G' | 'H' | 'THREE_T_4' | 'CUSTOM';

interface PointInfo {
  key: PointKey;
  label: string;
  subLabel: string;
  tNorm: number; // 0 to 1 along a full period T
  dNorm: number; // displacement in terms of A (-1 to 1)
  slope: number; // normalized physical derivative: -sin(2*pi*tNorm)
  speedFraction: number; // fraction of v_max (0 to 1)
  speedLabel: string;
  velocitySign: '< 0' | '= 0' | '> 0';
  velocityLabel: string;
  geometricAngleDeg: number;
  description: string;
  themeColor: string;
}

const PRESET_POINTS: Record<Exclude<PointKey, 'CUSTOM'>, PointInfo> = {
  E: {
    key: 'E',
    label: 'Điểm E (Biên dương / Đỉnh)',
    subLabel: 'd = +A, t = 0',
    tNorm: 0,
    dNorm: 1.0,
    slope: 0,
    speedFraction: 0,
    speedLabel: '|v_E| = 0',
    velocitySign: '= 0',
    velocityLabel: 'v_E = 0',
    geometricAngleDeg: 0,
    description: 'Mép thước kẻ nằm ngang hoàn toàn (song song với trục thời gian Ot) => Độ dốc bằng 0 => Vận tốc v_E = 0.',
    themeColor: '#FF4D4D',
  },
  C: {
    key: 'C',
    label: 'Điểm C (Vị trí xấp xỉ +0,71A)',
    subLabel: 'd ≈ +0,71A, t = T/8',
    tNorm: 0.125,
    dNorm: 0.7071,
    slope: -0.7071,
    speedFraction: 0.71,
    speedLabel: '|v_C| = 0,71 v_{max}',
    velocitySign: '< 0',
    velocityLabel: 'v_C = -0,71 v_{max} < 0',
    geometricAngleDeg: -35.26,
    description: 'Mép thước kẻ tiếp xúc đồ thị tại C, nghiêng dốc xuống về bên phải => Vận tốc âm (v_C < 0), tốc độ tức thời |v_C| = 0,71 v_max.',
    themeColor: '#00D4FF',
  },
  D: {
    key: 'D',
    label: 'Điểm D (VTCB theo chiều âm)',
    subLabel: 'd = 0, t = T/4',
    tNorm: 0.25,
    dNorm: 0,
    slope: -1.0,
    speedFraction: 1.0,
    speedLabel: '|v_D| = v_{max}',
    velocitySign: '< 0',
    velocityLabel: 'v_D = -v_{max} < 0',
    geometricAngleDeg: -51.49,
    description: 'Mép thước kẻ tiếp xúc đồ thị tại D, có độ dốc lớn nhất hướng xuống => Tốc độ tức thời đạt cực đại |v_D| = v_{max}.',
    themeColor: '#FFB800',
  },
  G: {
    key: 'G',
    label: 'Điểm G (Vị trí xấp xỉ -0,71A)',
    subLabel: 'd ≈ -0,71A, t = 3T/8',
    tNorm: 0.375,
    dNorm: -0.7071,
    slope: -0.7071,
    speedFraction: 0.71,
    speedLabel: '|v_G| = 0,71 v_{max}',
    velocitySign: '< 0',
    velocityLabel: 'v_G = -0,71 v_{max} < 0',
    geometricAngleDeg: -35.26,
    description: 'Mép thước kẻ tiếp xúc đồ thị tại G, nghiêng dốc xuống về bên phải => v_G < 0, tốc độ tức thời |v_G| = 0,71 v_max = |v_C|.',
    themeColor: '#A855F7',
  },
  H: {
    key: 'H',
    label: 'Điểm H (Biên âm / Đáy)',
    subLabel: 'd = -A, t = T/2',
    tNorm: 0.5,
    dNorm: -1.0,
    slope: 0,
    speedFraction: 0,
    speedLabel: '|v_H| = 0',
    velocitySign: '= 0',
    velocityLabel: 'v_H = 0',
    geometricAngleDeg: 0,
    description: 'Mép thước kẻ tiếp xúc tại đáy sóng H, nằm ngang hoàn toàn (song song trục Ot) => Độ dốc bằng 0 => Vận tốc v_H = 0.',
    themeColor: '#FF4D4D',
  },
  THREE_T_4: {
    key: 'THREE_T_4',
    label: 'Điểm 3T/4 (VTCB theo chiều dương)',
    subLabel: 'd = 0, t = 3T/4',
    tNorm: 0.75,
    dNorm: 0,
    slope: 1.0,
    speedFraction: 1.0,
    speedLabel: '|v_{3T/4}| = v_{max}',
    velocitySign: '> 0',
    velocityLabel: 'v_{3T/4} = +v_{max} > 0',
    geometricAngleDeg: 51.49,
    description: 'Mép thước kẻ tiếp xúc đồ thị tại 3T/4, dốc đứng nhất nhưng hướng lên về bên phải => Vận tốc dương cực đại v = +v_max, tốc độ đạt cực đại.',
    themeColor: '#10B981',
  },
};

export const TangentRulerVelocitySim: React.FC = () => {
  const [selectedPoint, setSelectedPoint] = useState<PointKey>('C');
  const [customTNorm, setCustomTNorm] = useState<number>(0.125);
  const [isAutoScanning, setIsAutoScanning] = useState<boolean>(false);
  const [showTangentTriangle, setShowTangentTriangle] = useState<boolean>(true);
  const [showRulerGrid, setShowRulerGrid] = useState<boolean>(true);
  const [showSpeedometer, setShowSpeedometer] = useState<boolean>(true);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const containerId = useId();

  // Active calculation based on selectedPoint or customTNorm
  const currentTNorm = selectedPoint === 'CUSTOM' 
    ? customTNorm 
    : PRESET_POINTS[selectedPoint].tNorm;

  // d(t) = A * cos(2*pi*t/T) -> normalized: cos(2*pi*tNorm)
  const currentDNorm = Math.cos(2 * Math.PI * currentTNorm);
  
  // Physical velocity v(t) = -omega * A * sin(2*pi*t/T) -> normalized factor: -sin(2*pi*tNorm)
  const currentSlope = -Math.sin(2 * Math.PI * currentTNorm);
  const currentSpeedFraction = Math.abs(currentSlope);

  // Auto scan animation loop
  useEffect(() => {
    if (!isAutoScanning) return;

    let startTime: number | null = null;
    const periodMs = 6000; // 6 seconds for full scan

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = (elapsed % periodMs) / periodMs;
      
      setSelectedPoint('CUSTOM');
      setCustomTNorm(progress);
      
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isAutoScanning]);

  // Canvas Geometry constants for angle & slope calculations
  const plotWidthApprox = 660;
  const plotHeightApprox = 280;
  const amplitudePxApprox = plotHeightApprox * 0.4;
  const dxApprox = plotWidthApprox;
  const dyApprox = 2 * Math.PI * Math.sin(2 * Math.PI * currentTNorm) * amplitudePxApprox;
  const currentRulerAngleDeg = Math.atan2(-dyApprox, dxApprox) * (180 / Math.PI);

  // Render high resolution Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Clear background with rich blueprint grid
    ctx.clearRect(0, 0, width, height);

    // Background gradient
    const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
    bgGrad.addColorStop(0, '#060D1A');
    bgGrad.addColorStop(1, '#0A1526');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Grid parameters
    const marginX = 70;
    const marginY = 50;
    const plotWidth = width - marginX * 2;
    const plotHeight = height - marginY * 2;
    const centerY = marginY + plotHeight / 2;
    const amplitudePx = plotHeight * 0.4; // +/- A

    // Draw subtle grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    for (let x = marginX; x <= marginX + plotWidth; x += plotWidth / 8) {
      ctx.beginPath();
      ctx.moveTo(x, marginY);
      ctx.lineTo(x, marginY + plotHeight);
      ctx.stroke();
    }
    for (let y = marginY; y <= marginY + plotHeight; y += plotHeight / 8) {
      ctx.beginPath();
      ctx.moveTo(marginX, y);
      ctx.lineTo(marginX + plotWidth, y);
      ctx.stroke();
    }

    // Coordinate Axes
    // Axis Ot (Horizontal Center)
    ctx.strokeStyle = '#64748B';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(marginX - 20, centerY);
    ctx.lineTo(marginX + plotWidth + 30, centerY);
    ctx.stroke();

    // Arrow for Ot
    ctx.fillStyle = '#64748B';
    ctx.beginPath();
    ctx.moveTo(marginX + plotWidth + 35, centerY);
    ctx.lineTo(marginX + plotWidth + 23, centerY - 5);
    ctx.lineTo(marginX + plotWidth + 23, centerY + 5);
    ctx.fill();

    // Axis Od (Vertical Left)
    ctx.beginPath();
    ctx.moveTo(marginX, marginY + plotHeight + 20);
    ctx.lineTo(marginX, marginY - 25);
    ctx.stroke();

    // Arrow for Od
    ctx.beginPath();
    ctx.moveTo(marginX, marginY - 30);
    ctx.lineTo(marginX - 5, marginY - 18);
    ctx.lineTo(marginX + 5, marginY - 18);
    ctx.fill();

    // Axis Labels
    ctx.font = 'bold 13px system-ui, sans-serif';
    ctx.fillStyle = '#94A3B8';
    ctx.fillText('d (Độ dịch chuyển)', marginX - 10, marginY - 35);
    ctx.fillText('t (Thời gian)', marginX + plotWidth + 5, centerY + 22);
    ctx.fillText('O', marginX - 18, centerY + 16);

    // Amplitude Labels (+A, +0.71A, 0, -0.71A, -A)
    ctx.font = '11px system-ui, sans-serif';
    ctx.fillStyle = '#38BDF8';
    ctx.fillText('+A', marginX - 35, centerY - amplitudePx + 4);
    ctx.fillText('+0,71A', marginX - 48, centerY - amplitudePx * 0.7071 + 4);
    ctx.fillText('-0,71A', marginX - 48, centerY + amplitudePx * 0.7071 + 4);
    ctx.fillText('-A', marginX - 35, centerY + amplitudePx + 4);

    // Horizontal dashed guidelines for +/- A and +/- 0.71A
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.15)';
    ctx.setLineDash([4, 4]);
    [amplitudePx, amplitudePx * 0.7071, -amplitudePx * 0.7071, -amplitudePx].forEach(offset => {
      ctx.beginPath();
      ctx.moveTo(marginX, centerY - offset);
      ctx.lineTo(marginX + plotWidth, centerY - offset);
      ctx.stroke();
    });
    ctx.setLineDash([]);

    // Time ticks (0, T/8, T/4, 3T/8, T/2, 5T/8, 3T/4, 7T/8, T)
    const timeLabels = ['0', 'T/8', 'T/4', '3T/8', 'T/2', '5T/8', '3T/4', '7T/8', 'T'];
    timeLabels.forEach((label, idx) => {
      const x = marginX + (plotWidth / 8) * idx;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, centerY - 4);
      ctx.lineTo(x, centerY + 4);
      ctx.stroke();

      ctx.fillStyle = '#94A3B8';
      ctx.textAlign = 'center';
      ctx.fillText(label, x, centerY + 18);
    });

    // Draw the Cosine Wave Curve d(t) = A * cos(2*pi*t/T)
    ctx.strokeStyle = '#00D4FF';
    ctx.lineWidth = 3.5;
    ctx.shadowColor = 'rgba(0, 212, 255, 0.6)';
    ctx.shadowBlur = 12;
    ctx.beginPath();
    const steps = 200;
    for (let i = 0; i <= steps; i++) {
      const tNorm = i / steps;
      const x = marginX + tNorm * plotWidth;
      const d = Math.cos(2 * Math.PI * tNorm);
      const y = centerY - d * amplitudePx;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.shadowBlur = 0; // Reset shadow

    // Draw Named Points on the curve (E, C, D, G, H, 3T/4)
    const namedPoints: { key: PointKey; label: string; tNorm: number; dNorm: number; color: string }[] = [
      { key: 'E', label: 'E (+A)', tNorm: 0, dNorm: 1.0, color: '#FF4D4D' },
      { key: 'C', label: 'C (≈ +0,71A)', tNorm: 0.125, dNorm: 0.7071, color: '#00D4FF' },
      { key: 'D', label: 'D (VTCB)', tNorm: 0.25, dNorm: 0, color: '#FFB800' },
      { key: 'G', label: 'G (≈ -0,71A)', tNorm: 0.375, dNorm: -0.7071, color: '#A855F7' },
      { key: 'H', label: 'H (-A)', tNorm: 0.5, dNorm: -1.0, color: '#FF4D4D' },
      { key: 'THREE_T_4', label: '3T/4 (VTCB)', tNorm: 0.75, dNorm: 0, color: '#10B981' },
    ];

    namedPoints.forEach(p => {
      const px = marginX + p.tNorm * plotWidth;
      const py = centerY - p.dNorm * amplitudePx;

      const isSelected = selectedPoint === p.key;

      // Glow circle
      ctx.fillStyle = isSelected ? p.color : 'rgba(255,255,255,0.7)';
      ctx.beginPath();
      ctx.arc(px, py, isSelected ? 7 : 4.5, 0, Math.PI * 2);
      ctx.fill();

      if (isSelected) {
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // Label above/below
      ctx.fillStyle = isSelected ? '#FFFFFF' : '#CBD5E1';
      ctx.font = isSelected ? 'bold 12px system-ui, sans-serif' : '11px system-ui, sans-serif';
      ctx.textAlign = 'center';
      const labelY = p.dNorm > 0 ? py - 12 : p.dNorm < 0 ? py + 18 : py - 12;
      ctx.fillText(p.label, px, labelY);
    });

    // Current point calculation on canvas
    const curX = marginX + currentTNorm * plotWidth;
    const curY = centerY - currentDNorm * amplitudePx;

    // Mathematical Tangent Vector on Canvas Coordinate System
    // x(t) = marginX + tNorm * plotWidth => dx/dt = plotWidth
    // y(t) = centerY - cos(2*pi*tNorm) * amplitudePx => dy/dt = + 2*pi*sin(2*pi*tNorm) * amplitudePx
    const dx_dt = plotWidth;
    const dy_dt = 2 * Math.PI * Math.sin(2 * Math.PI * currentTNorm) * amplitudePx;
    const screenTangentAngleRad = Math.atan2(dy_dt, dx_dt);

    // Visual Tangent Triangle (Delta d / Delta t)
    if (showTangentTriangle && Math.abs(currentSlope) > 0.05) {
      const deltaX = 60; // px
      const dy = Math.tan(screenTangentAngleRad) * (deltaX / 2);

      const x1 = curX - deltaX / 2;
      const y1 = curY - dy;
      const x2 = curX + deltaX / 2;
      const y2 = curY + dy;

      // Triangle fill
      ctx.fillStyle = 'rgba(0, 212, 255, 0.12)';
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y1);
      ctx.lineTo(x2, y2);
      ctx.closePath();
      ctx.fill();

      // Triangle borders
      ctx.strokeStyle = 'rgba(0, 212, 255, 0.5)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([2, 2]);
      ctx.stroke();
      ctx.setLineDash([]);

      // Delta t & Delta d annotations
      ctx.font = '10px system-ui, sans-serif';
      ctx.fillStyle = '#38BDF8';
      ctx.textAlign = 'center';
      ctx.fillText('Δt', (x1 + x2) / 2, y1 - 4);
      ctx.textAlign = 'left';
      ctx.fillText('Δd', x2 + 4, (y1 + y2) / 2);
    }

    // DRAW THE REALISTIC PHYSICAL RULER: STRAIGHT EDGE IS EXACTLY TANGENT TO THE CURVE!
    const rulerLength = 260; // Length of ruler in px
    const rulerThickness = 32; // Thickness of ruler in px

    ctx.save();
    ctx.translate(curX, curY);
    ctx.rotate(screenTangentAngleRad);

    // 1. Tangent line extension guideline (dashed cyan)
    ctx.strokeStyle = 'rgba(0, 212, 255, 0.35)';
    ctx.lineWidth = 1.2;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(-rulerLength * 0.9, 0);
    ctx.lineTo(rulerLength * 0.9, 0);
    ctx.stroke();
    ctx.setLineDash([]);

    // 2. Ruler Body (Transparent Acrylic Glass with bevel)
    // The straight measuring edge is at y = 0 (touching the curve at (0,0)).
    // The ruler body extends upwards into y in [-rulerThickness, 0].
    const rulerGrad = ctx.createLinearGradient(0, -rulerThickness, 0, 0);
    rulerGrad.addColorStop(0, 'rgba(15, 23, 42, 0.85)');
    rulerGrad.addColorStop(0.3, 'rgba(14, 116, 144, 0.55)');
    rulerGrad.addColorStop(0.8, 'rgba(6, 182, 212, 0.35)');
    rulerGrad.addColorStop(1, 'rgba(0, 212, 255, 0.25)');

    ctx.fillStyle = rulerGrad;
    ctx.strokeStyle = '#00E5FF';
    ctx.lineWidth = 1.5;
    ctx.shadowColor = 'rgba(0, 229, 255, 0.4)';
    ctx.shadowBlur = 8;

    // Rounded rectangle for ruler (top corners rounded, bottom contact edge sharp & straight)
    const rx = -rulerLength / 2;
    const ry = -rulerThickness;
    ctx.beginPath();
    ctx.roundRect(rx, ry, rulerLength, rulerThickness, [6, 6, 0, 0]);
    ctx.fill();
    ctx.stroke();
    ctx.shadowBlur = 0;

    // 3. Highlighted Straight Measuring Edge (Mép thước kẻ) at y = 0
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2;
    ctx.shadowColor = '#00FFFF';
    ctx.shadowBlur = 6;
    ctx.beginPath();
    ctx.moveTo(-rulerLength / 2, 0);
    ctx.lineTo(rulerLength / 2, 0);
    ctx.stroke();
    ctx.shadowBlur = 0;

    // 4. Millimeter tick marks along the contact edge (y = 0)
    if (showRulerGrid) {
      ctx.strokeStyle = '#E2E8F0';
      ctx.lineWidth = 1;
      for (let tx = -rulerLength / 2 + 12; tx <= rulerLength / 2 - 12; tx += 5) {
        const isMajor = Math.round((tx + rulerLength / 2 - 12) / 5) % 5 === 0;
        const tickHeight = isMajor ? 9 : 4.5;
        ctx.beginPath();
        ctx.moveTo(tx, 0);
        ctx.lineTo(tx, -tickHeight);
        ctx.stroke();
      }

      // Red central indicator mark at point of tangency (0, 0)
      ctx.strokeStyle = '#EF4444';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, -14);
      ctx.stroke();
    }

    // 5. Ruler Label etched on the acrylic body
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 9px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('MÉP THƯỚC TIẾP TUYẾN', 0, -rulerThickness / 2 + 1);

    ctx.restore();

    // Red Pulsing Contact Point on the curve at (curX, curY)
    ctx.fillStyle = '#EF4444';
    ctx.shadowColor = '#EF4444';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(curX, curY, 5.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Velocity Vector Arrow (v) pointing tangent to curve in motion direction
    if (Math.abs(currentSlope) > 0.02) {
      const vectorLen = currentSpeedFraction * 55; // length proportional to speed
      const vx = Math.cos(screenTangentAngleRad) * vectorLen;
      const vy = Math.sin(screenTangentAngleRad) * vectorLen;

      ctx.strokeStyle = '#10B981';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(curX, curY);
      ctx.lineTo(curX + vx, curY + vy);
      ctx.stroke();

      // Arrow head
      const arrowAngle = Math.atan2(vy, vx);
      ctx.fillStyle = '#10B981';
      ctx.beginPath();
      ctx.moveTo(curX + vx, curY + vy);
      ctx.lineTo(
        curX + vx - 10 * Math.cos(arrowAngle - Math.PI / 6),
        curY + vy - 10 * Math.sin(arrowAngle - Math.PI / 6)
      );
      ctx.lineTo(
        curX + vx - 10 * Math.cos(arrowAngle + Math.PI / 6),
        curY + vy - 10 * Math.sin(arrowAngle + Math.PI / 6)
      );
      ctx.fill();

      // Label vector v
      ctx.fillStyle = '#34D399';
      ctx.font = 'bold 12px system-ui, sans-serif';
      ctx.fillText('v⃗', curX + vx + 8, curY + vy + 4);
    }

  }, [currentTNorm, currentDNorm, currentSlope, currentSpeedFraction, selectedPoint, showTangentTriangle, showRulerGrid]);

  // Voice explanation trigger
  const handleToggleVoice = () => {
    if (isSpeaking) {
      stopSpeaking();
      setIsSpeaking(false);
    } else {
      let speechText = '';
      if (selectedPoint === 'E' || selectedPoint === 'H') {
        speechText = 'Tại điểm biên E và H, mép thước kẻ tiếp xúc đồ thị và nằm ngang song song trục Ot, độ dốc bằng 0 nên vận tốc vE và vH bằng 0.';
      } else if (selectedPoint === 'C' || selectedPoint === 'G') {
        speechText = 'Tại điểm C và G có li độ xấp xỉ 0 phẩy 71 A, mép thước kẻ tiếp xúc đồ thị và nghiêng dốc xuống về bên phải, vận tốc âm nhỏ hơn 0, tốc độ tức thời bằng 0 phẩy 71 v cực đại.';
      } else if (selectedPoint === 'D') {
        speechText = 'Tại điểm D ở vị trí cân bằng theo chiều âm, mép thước tiếp xúc đồ thị với độ dốc lớn nhất dốc đứng nhất hướng xuống, nên vận tốc âm có độ lớn cực đại vD bằng âm v max, tốc độ đạt cực đại.';
      } else if (selectedPoint === 'THREE_T_4') {
        speechText = 'Tại điểm 3T trên 4 ở vị trí cân bằng theo chiều dương, mép thước tiếp xúc đồ thị với độ dốc lớn nhất hướng lên, nên vận tốc dương cực đại, tốc độ đạt cực đại v max.';
      } else {
        speechText = 'Độ dốc của tiếp tuyến mép thước kẻ trên đồ thị độ dịch chuyển thời gian chính là vận tốc tức thời. So sánh tốc độ: trị tuyệt đối vD bằng trị tuyệt đối v 3T trên 4 lớn hơn trị tuyệt đối vC bằng trị tuyệt đối vG lớn hơn trị tuyệt đối vE bằng trị tuyệt đối vH bằng 0.';
      }
      speakVietnamese(speechText, {
        onEnd: () => setIsSpeaking(false),
        onError: () => setIsSpeaking(false)
      });
      setIsSpeaking(true);
    }
  };

  return (
    <div id={containerId} className="w-full space-y-5 rounded-2xl border border-cyan-500/30 bg-[#080E1A] p-4 sm:p-6 text-white shadow-2xl">
      {/* 1. Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="flex items-center gap-1.5 rounded-md bg-cyan-500/20 px-2.5 py-1 text-xs font-bold text-cyan-300 border border-cyan-500/30">
              <Ruler className="h-3.5 w-3.5" /> SGK Vật lí 10 - Bài 5 & Bài 7
            </span>
            <span className="rounded-md bg-purple-500/20 px-2.5 py-1 text-xs font-bold text-purple-300 border border-purple-500/30">
              Xác định vận tốc tức thời bằng mép thước kẻ tiếp xúc đồ thị
            </span>
          </div>
          <h2 className="text-base sm:text-lg md:text-xl font-bold text-white mt-1.5 flex items-center gap-2">
            <TrendingDown className="h-5 w-5 text-[#00D4FF]" />
            Phương pháp tiếp tuyến mép thước kẻ trên đồ thị độ dịch chuyển <InlinePhysicsText text="$d - t$" />
          </h2>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 self-start md:self-auto flex-wrap">
          <button
            onClick={() => setIsAutoScanning(!isAutoScanning)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              isAutoScanning
                ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/30'
                : 'bg-white/10 text-gray-200 hover:bg-white/20 border border-white/15'
            }`}
          >
            <Play className={`h-3.5 w-3.5 ${isAutoScanning ? 'animate-pulse' : ''}`} />
            <span>{isAutoScanning ? 'Đang quét đồ thị' : 'Quét tự động'}</span>
          </button>

          <button
            onClick={handleToggleVoice}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              isSpeaking
                ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/30 animate-pulse'
                : 'bg-white/10 text-cyan-300 hover:bg-white/20 border border-white/15'
            }`}
            title="Đọc thuyết minh bằng giọng nói AI"
          >
            {isSpeaking ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
            <span>{isSpeaking ? 'Đang đọc...' : 'Nghe giảng'}</span>
          </button>
        </div>
      </div>

      {/* 2. Interactive Point Selector Tabs */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-gray-300">
          <span className="font-semibold text-cyan-300 flex items-center gap-1.5">
            <Sliders className="h-3.5 w-3.5" /> Chọn vị trí đặt tiếp tuyến mép thước kẻ:
          </span>
          <span className="text-[11px] text-gray-400">
            Hệ số góc tiếp tuyến <InlinePhysicsText text="$k = \tan\alpha = \frac{\Delta d}{\Delta t} = v$" />
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-7 gap-2">
          {(Object.keys(PRESET_POINTS) as Array<Exclude<PointKey, 'CUSTOM'>>).map(key => {
            const pt = PRESET_POINTS[key];
            const isSelected = selectedPoint === key;
            return (
              <button
                key={key}
                onClick={() => {
                  setIsAutoScanning(false);
                  setSelectedPoint(key);
                }}
                className={`flex flex-col items-start p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'border-cyan-400 bg-cyan-950/40 shadow-lg shadow-cyan-500/20 ring-1 ring-cyan-400'
                    : 'border-white/10 bg-white/5 hover:bg-white/10 text-gray-300'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="font-bold text-xs" style={{ color: pt.themeColor }}>
                    {key === 'THREE_T_4' ? 'Điểm 3T/4' : `Điểm ${key}`}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-black/40 font-mono text-gray-300">
                    {pt.subLabel.split(',')[0]}
                  </span>
                </div>
                <div className="text-[11px] text-gray-200 mt-1 font-semibold">
                  <InlinePhysicsText text={`$${pt.speedLabel}$`} />
                </div>
              </button>
            );
          })}

          {/* Custom Slider Toggle */}
          <button
            onClick={() => {
              setIsAutoScanning(false);
              setSelectedPoint('CUSTOM');
            }}
            className={`flex flex-col items-start p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
              selectedPoint === 'CUSTOM'
                ? 'border-amber-400 bg-amber-950/40 shadow-lg shadow-amber-500/20 ring-1 ring-amber-400'
                : 'border-white/10 bg-white/5 hover:bg-white/10 text-gray-300'
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <span className="font-bold text-xs text-amber-300">Kéo tự do</span>
              <Sliders className="h-3 w-3 text-amber-400" />
            </div>
            <div className="text-[11px] text-gray-300 mt-1">
              t = {(currentTNorm * 100).toFixed(0)}% T
            </div>
          </button>
        </div>

        {/* Free Drag Slider */}
        {selectedPoint === 'CUSTOM' && (
          <div className="rounded-xl border border-amber-500/30 bg-amber-950/20 p-3 flex flex-col sm:flex-row items-center gap-3">
            <span className="text-xs font-bold text-amber-300 shrink-0">
              Kéo dịch chuyển thước trên trục thời gian:
            </span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.005"
              value={customTNorm}
              onChange={e => {
                setIsAutoScanning(false);
                setCustomTNorm(parseFloat(e.target.value));
              }}
              className="w-full accent-amber-400 h-2 bg-black/40 rounded-lg cursor-pointer"
            />
            <span className="text-xs font-mono font-bold text-white shrink-0">
              t = {(customTNorm).toFixed(3)} T
            </span>
          </div>
        )}
      </div>

      {/* 3. 2D Interactive Canvas Simulation */}
      <div className="relative rounded-2xl border border-cyan-500/20 bg-black/50 overflow-hidden shadow-inner">
        {/* Canvas Display */}
        <canvas
          ref={canvasRef}
          width={800}
          height={380}
          className="w-full h-auto block"
        />

        {/* Floating Tangent Slope HUD */}
        <div className="absolute top-3 right-3 flex flex-col items-end gap-2 bg-black/75 backdrop-blur-md border border-white/15 p-2.5 rounded-xl text-xs">
          <div className="flex items-center gap-2">
            <span className="text-gray-400">Góc nghiêng mép thước:</span>
            <span className="font-mono font-bold text-cyan-300">
              {currentRulerAngleDeg >= 0 ? `+${currentRulerAngleDeg.toFixed(1)}°` : `${currentRulerAngleDeg.toFixed(1)}°`}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-400">Độ dốc (Độ lớn):</span>
            <span className="font-mono font-bold text-amber-300">
              {currentSpeedFraction.toFixed(2)}
            </span>
          </div>
          <div className="flex items-center gap-2 border-t border-white/10 pt-1">
            <span className="text-gray-300 font-semibold">Tốc độ tức thời:</span>
            <span className="font-bold text-emerald-400">
              <InlinePhysicsText text={`$|v| = ${(currentSpeedFraction).toFixed(2)} v_{\\max}$`} />
            </span>
          </div>
        </div>

        {/* Canvas Visual Toggles */}
        <div className="absolute bottom-3 left-3 flex items-center gap-2 bg-black/70 backdrop-blur-sm border border-white/10 px-2.5 py-1.5 rounded-lg text-[11px] text-gray-300">
          <label className="flex items-center gap-1.5 cursor-pointer hover:text-white">
            <input
              type="checkbox"
              checked={showTangentTriangle}
              onChange={e => setShowTangentTriangle(e.target.checked)}
              className="accent-cyan-400"
            />
            Tam giác độ dốc (Δd / Δt)
          </label>
          <span className="text-gray-600">|</span>
          <label className="flex items-center gap-1.5 cursor-pointer hover:text-white">
            <input
              type="checkbox"
              checked={showRulerGrid}
              onChange={e => setShowRulerGrid(e.target.checked)}
              className="accent-cyan-400"
            />
            Vạch milimet mép thước
          </label>
        </div>
      </div>

      {/* 4. THE 3 DETAILED ANALYSIS CARDS */}
      <div className="space-y-3">
        <div className="text-xs font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-[#00D4FF]" />
          Phân tích chi tiết độ dốc mép thước kẻ tại các điểm đặc biệt:
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1: Điểm E và H */}
          <div className={`rounded-xl border p-4 space-y-2 transition-all ${
            selectedPoint === 'E' || selectedPoint === 'H'
              ? 'border-red-500 bg-red-950/30 shadow-lg shadow-red-500/20 ring-1 ring-red-500'
              : 'border-red-500/30 bg-[#12080D]/80'
          }`}>
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm font-bold text-red-400">
                1. Tại điểm E và H (Biên):
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-500/20 text-red-300">
                <InlinePhysicsText text="$d = \pm A$" />
              </span>
            </div>
            <p className="text-xs sm:text-sm text-gray-200 leading-relaxed">
              Mép thước kẻ tiếp xúc đồ thị và nằm ngang (song song trục <InlinePhysicsText text="$Ot$" />) <InlinePhysicsText text="$\Rightarrow$" /> Độ dốc bằng <InlinePhysicsText text="$0 \Rightarrow v_E = v_H = 0$" />.
            </p>
            <div className="mt-2 rounded-lg bg-black/40 p-2 border border-red-500/20 text-center font-bold text-red-300 text-xs">
              <InlinePhysicsText text="$|v_E| = |v_H| = 0$" />
            </div>
          </div>

          {/* Card 2: Điểm C và Điểm G */}
          <div className={`rounded-xl border p-4 space-y-2 transition-all ${
            selectedPoint === 'C' || selectedPoint === 'G'
              ? 'border-cyan-400 bg-cyan-950/30 shadow-lg shadow-cyan-500/20 ring-1 ring-cyan-400'
              : 'border-cyan-500/30 bg-[#06121C]/80'
          }`}>
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm font-bold text-cyan-300">
                2. Tại điểm C & G (<InlinePhysicsText text="$d \approx \pm 0{,}71A$" />):
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300">
                <InlinePhysicsText text="$t = T/8, 3T/8$" />
              </span>
            </div>
            <p className="text-xs sm:text-sm text-gray-200 leading-relaxed">
              Mép thước kẻ tiếp xúc đồ thị, nghiêng dốc xuống về bên phải <InlinePhysicsText text="$\Rightarrow v < 0$" />, tốc độ tức thời <InlinePhysicsText text="$|v_C| = |v_G| = 0{,}71 v_{\max}$" />.
            </p>
            <div className="mt-2 rounded-lg bg-black/40 p-2 border border-cyan-500/20 text-center font-bold text-cyan-300 text-xs">
              <InlinePhysicsText text="$|v_C| = |v_G| = 0{,}71 v_{\max} = \frac{\sqrt{2}}{2} v_{\max}$" />
            </div>
          </div>

          {/* Card 3: Điểm D và Điểm 3T/4 */}
          <div className={`rounded-xl border p-4 space-y-2 transition-all ${
            selectedPoint === 'D' || selectedPoint === 'THREE_T_4'
              ? 'border-amber-400 bg-amber-950/30 shadow-lg shadow-amber-500/20 ring-1 ring-amber-400'
              : 'border-amber-500/30 bg-[#171107]/80'
          }`}>
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm font-bold text-amber-300">
                3. Tại điểm D & 3T/4 (VTCB <InlinePhysicsText text="$d = 0$" />):
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300">
                <InlinePhysicsText text="$t = T/4, 3T/4$" />
              </span>
            </div>
            <p className="text-xs sm:text-sm text-gray-200 leading-relaxed">
              Mép thước kẻ tiếp xúc đồ thị, có độ dốc lớn nhất (dốc đứng nhất) <InlinePhysicsText text="$\Rightarrow$" /> Tốc độ cực đại <InlinePhysicsText text="$|v_D| = |v_{3T/4}| = v_{\max}$" />.
            </p>
            <div className="mt-2 rounded-lg bg-black/40 p-2 border border-amber-500/20 text-center font-bold text-amber-300 text-xs">
              <InlinePhysicsText text="$|v_D| = |v_{3T/4}| = v_{\max} = \omega A$" />
            </div>
          </div>
        </div>
      </div>

      {/* 5. CONCLUSION COMPARISON CARD */}
      <div className="rounded-2xl border border-emerald-500/40 bg-gradient-to-r from-emerald-950/30 via-[#061A14] to-emerald-950/30 p-4 sm:p-5 shadow-xl space-y-2">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-emerald-400" />
          <span className="text-xs sm:text-sm font-bold text-emerald-300 uppercase tracking-wide">
            Kết luận so sánh độ lớn vận tốc (tốc độ):
          </span>
        </div>

        {/* Exact formula highlighted with LaTeX Subscripts */}
        <div className="py-2 text-center overflow-x-auto">
          <div className="inline-block rounded-xl bg-black/60 px-6 py-3 border border-emerald-400/30 text-emerald-300 font-mono text-base sm:text-lg md:text-xl font-bold shadow-lg">
            <InlinePhysicsText text="$$|v_D| = |v_{3T/4}| > |v_C| = |v_G| > |v_E| = |v_H| = 0$$" />
          </div>
        </div>

        <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
          <strong>Ý nghĩa vật lí quan trọng:</strong> Độ dốc (hệ số góc) của tiếp tuyến mép thước kẻ trên đồ thị độ dịch chuyển – thời gian <InlinePhysicsText text="$d - t$" /> chính là vận tốc tức thời <InlinePhysicsText text="$v = \frac{\Delta d}{\Delta t} = \tan\alpha$" />. Khi mép thước càng dựng dốc thì tốc độ càng lớn; khi mép thước nằm ngang thì tốc độ bằng <InlinePhysicsText text="$0$" />.
        </p>
      </div>
    </div>
  );
};
