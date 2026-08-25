import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  BookOpen,
  HelpCircle,
  Activity,
  Layers,
  Zap,
  Target,
  Sliders,
  ChevronDown,
  ChevronUp,
  Upload,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Compass,
  Gauge,
  ShieldAlert,
  Ruler,
  Navigation,
  Scale,
  Trash2,
  Maximize2,
  X
} from 'lucide-react';
import { Lesson, Chapter } from '../../types/physics';
import { MathFormula, MathFormulaCard } from '../MathFormula';
import { savePortraitToDB, loadPortraitFromDB, deletePortraitFromDB, compressImage } from '../../utils/imageStorage';
import { FormattedPhysicsText, InlinePhysicsText } from '../ui/FormattedPhysicsText';
import { SafetyImageCard16x9 } from './SafetyImageCard16x9';
import { ApparatusIllustrationCard } from './ApparatusIllustrationCard';
import {
  LabEquipmentSymbolsIllustration,
  IndustrialWarningsIllustration,
  TrafficSignsIllustration,
} from './Lesson2SafetyIllustrations';
import { Lesson4IntersectionSimulation } from '../simulations/Lesson4IntersectionSimulation';
import { Lesson4ThreePathsSimulation } from '../simulations/Lesson4ThreePathsSimulation';
import { Lesson4HanoiHaiPhongSimulation } from '../simulations/Lesson4HanoiHaiPhongSimulation';
import { Lesson4BicycleTripSimulation } from '../simulations/Lesson4BicycleTripSimulation';
import { Lesson4CarTripSimulation } from '../simulations/Lesson4CarTripSimulation';
import { Lesson4SwimmerRiverSimulation } from '../simulations/Lesson4SwimmerRiverSimulation';

interface LessonUniversalDetailProps {
  lesson: Lesson;
  chapter: Chapter;
}

export const LessonUniversalDetail: React.FC<LessonUniversalDetailProps> = ({
  lesson,
  chapter,
}) => {
  const [activeTab, setActiveTab] = useState<'THEORY' | 'SIMULATION' | 'EXPERIMENT' | 'EXERCISES'>('THEORY');
  const [openQuestions, setOpenQuestions] = useState<Record<string, boolean>>({});
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState<boolean>(false);

  // Simulation parameters for interactive Canvas visualizers
  const [isRunning, setIsRunning] = useState<boolean>(true);
  const [simParam1, setSimParam1] = useState<number>(50); // General primary slider (0 - 100)
  const [simParam2, setSimParam2] = useState<number>(30); // General secondary slider (0 - 100)
  const [lesson4SimSubTab, setLesson4SimSubTab] = useState<'SWIMMER_RIVER' | 'CAR_TRIP' | 'BICYCLE_TRIP' | 'HANOI_HAIPHONG' | 'THREE_PATHS' | 'INTERSECTION'>('SWIMMER_RIVER');
  const [hoveredData, setHoveredData] = useState<{ label: string; value: string; unit: string } | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const simTimeRef = useRef<number>(0);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Load persistent uploaded image if exists
  useEffect(() => {
    async function loadImg() {
      const saved = await loadPortraitFromDB(`lesson_${lesson.id}_main`);
      if (saved) setUploadedImage(saved);
    }
    loadImg();
  }, [lesson.id]);

  // Handle upload image 16:9
  const executeImageUpload = async (file: File) => {
    try {
      const dataUrl = await compressImage(file);
      if (dataUrl) {
        setUploadedImage(dataUrl);
        await savePortraitToDB(`lesson_${lesson.id}_main`, dataUrl);
      }
    } catch (err) {
      console.error('Failed to save image:', err);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    executeImageUpload(file);
    e.target.value = '';
  };

  const handleTriggerUpload = () => {
    fileInputRef.current?.click();
  };

  const executeRemoveImage = async () => {
    setUploadedImage(null);
    await deletePortraitFromDB(`lesson_${lesson.id}_main`);
  };

  const handleRemoveImage = () => {
    executeRemoveImage();
  };

  // Toggle question accordion
  const toggleQ = (key: string) => {
    setOpenQuestions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Dedicated Interactive Canvas Animation Loop based on Lesson ID
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let startTime = performance.now();

    const render = (now: number) => {
      const dt = (now - startTime) / 1000;
      startTime = now;

      if (isRunning) {
        simTimeRef.current += dt;
      }
      const t = simTimeRef.current;

      const width = canvas.width;
      const height = canvas.height;

      // Clear Canvas with sleek high-tech background
      ctx.fillStyle = '#060D1A';
      ctx.fillRect(0, 0, width, height);

      // Draw high-tech grid
      ctx.strokeStyle = 'rgba(0, 212, 255, 0.08)';
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

      // RENDER SPECIFIC PHYSICS SIMULATION SCENE FOR THIS LESSON
      drawLessonSimulation(ctx, width, height, t, lesson.id, simParam1, simParam2);

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [lesson.id, isRunning, simParam1, simParam2]);

  // DRAW PHYSICS SIMULATION FUNCTION FOR ALL 34 LESSONS
  const drawLessonSimulation = (
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    t: number,
    lessonId: number,
    p1: number,
    p2: number
  ) => {
    const cx = w / 2;
    const cy = h / 2;

    switch (lessonId) {
      // BÀI 2: CÁC QUY TẮC AN TOÀN TRONG PHÒNG THỰC HÀNH VẬT LÍ (Đồng hồ VOM kim & Biển báo an toàn)
      case 2: {
        // Draw Multimeter Gauge
        ctx.save();
        ctx.translate(cx - 80, cy);
        ctx.fillStyle = '#0F1E36';
        ctx.strokeStyle = '#00D4FF';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.roundRect(-100, -110, 200, 220, 16);
        ctx.fill();
        ctx.stroke();

        // Screen / Dial
        ctx.fillStyle = '#E2E8F0';
        ctx.beginPath();
        ctx.roundRect(-80, -90, 160, 90, 8);
        ctx.fill();

        // Dial markings
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 1.5;
        for (let i = -60; i <= 60; i += 15) {
          const rad = (i * Math.PI) / 180 - Math.PI / 2;
          const r1 = 65;
          const r2 = 75;
          ctx.beginPath();
          ctx.moveTo(Math.cos(rad) * r1, Math.sin(rad) * r1 - 10);
          ctx.lineTo(Math.cos(rad) * r2, Math.sin(rad) * r2 - 10);
          ctx.stroke();
        }

        // Needle oscillating according to p1
        const needleAngle = (-60 + (p1 / 100) * 120 + Math.sin(t * 4) * 2) * (Math.PI / 180) - Math.PI / 2;
        ctx.strokeStyle = '#EF4444';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(0, -10);
        ctx.lineTo(Math.cos(needleAngle) * 70, Math.sin(needleAngle) * 70 - 10);
        ctx.stroke();

        // Pivot center
        ctx.fillStyle = '#EF4444';
        ctx.beginPath();
        ctx.arc(0, -10, 5, 0, Math.PI * 2);
        ctx.fill();

        // Dial Knob
        ctx.fillStyle = '#1E293B';
        ctx.strokeStyle = '#00FFCC';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 50, 30, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#00FFCC';
        ctx.font = 'bold 11px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('DC 20V (Thang đo an toàn)', 0, 95);
        ctx.restore();

        // Right side: Safety indicators
        ctx.fillStyle = '#102A45';
        ctx.strokeStyle = '#F59E0B';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(cx + 40, cy - 110, 200, 220, 16);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#F59E0B';
        ctx.font = 'bold 14px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText('⚡ CẢNH BÁO AN TOÀN', cx + 55, cy - 80);

        ctx.fillStyle = '#E2E8F0';
        ctx.font = '12px sans-serif';
        ctx.fillText(`• Điện áp đo: ${(p1 * 0.24).toFixed(1)} V (AC/DC)`, cx + 55, cy - 50);
        ctx.fillText(`• Cường độ: ${(p2 * 0.05).toFixed(2)} A`, cx + 55, cy - 25);
        ctx.fillText('• Cực dương (+) đỏ | Cực âm (-) đen', cx + 55, cy);
        ctx.fillText('• Chọn thang đo từ LỚN đến NHỎ', cx + 55, cy + 25);
        ctx.fillText('• Tuyệt đối không đo điện khi tay ướt', cx + 55, cy + 50);
        ctx.fillText('• Báo ngay giáo viên khi chập cháy', cx + 55, cy + 75);
        break;
      }

      // BÀI 3: THỰC HÀNH TÍNH SAI SỐ TRONG PHÉP ĐO (Thước kẹp Vernier & Phép tính sai số)
      case 3: {
        const measuredVal = (12.45 + (p1 / 100) * 8.5).toFixed(2);
        const errorVal = (0.02 + (p2 / 100) * 0.08).toFixed(3);

        // Draw Digital Vernier Caliper
        ctx.save();
        ctx.translate(cx, cy - 40);

        // Main bar
        ctx.fillStyle = '#334155';
        ctx.fillRect(-220, -15, 440, 30);

        // Main Scale Tick Marks
        ctx.strokeStyle = '#CBD5E1';
        ctx.lineWidth = 1;
        for (let i = -200; i <= 200; i += 10) {
          ctx.beginPath();
          ctx.moveTo(i, 15);
          ctx.lineTo(i, i % 50 === 0 ? -5 : 5);
          ctx.stroke();
        }

        // Sliding Jaw
        const slideOffset = -100 + (p1 / 100) * 150;
        ctx.fillStyle = '#0284C7';
        ctx.fillRect(slideOffset, -30, 90, 60);

        // Digital LCD Display
        ctx.fillStyle = '#0F172A';
        ctx.fillRect(slideOffset + 10, -20, 70, 40);
        ctx.fillStyle = '#00FFCC';
        ctx.font = 'bold 13px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`${measuredVal} mm`, slideOffset + 45, 5);

        ctx.restore();

        // Lower Statistics Box
        ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
        ctx.strokeStyle = '#00D4FF';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(cx - 220, cy + 40, 440, 110, 12);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#00D4FF';
        ctx.font = 'bold 14px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText('📊 KẾT QUẢ ĐO & TÍNH SAI SỐ THỰC NGHIỆM (CHUẨN SGK)', cx - 200, cy + 65);

        ctx.fillStyle = '#F8FAFC';
        ctx.font = '13px sans-serif';
        ctx.fillText(`• Giá trị trung bình Ā = ${measuredVal} mm`, cx - 200, cy + 90);
        ctx.fillText(`• Sai số tuyệt đối ΔA = ΔĀ + ΔAdc = ${errorVal} mm`, cx - 200, cy + 115);
        ctx.fillText(`• Sai số tỉ đối δA = (ΔA / Ā) × 100% = ${((parseFloat(errorVal) / parseFloat(measuredVal)) * 100).toFixed(2)} %`, cx - 200, cy + 140);
        break;
      }

      // BÀI 4: ĐỘ DỊCH CHUYỂN VÀ QUÃNG ĐƯỜNG ĐI ĐƯỢC (Vector map 2D)
      case 4: {
        const d1 = (p1 * 2); // metres East (20m - 200m)
        const d2 = (p2 * 1.5); // metres North (15m - 150m)
        const totalDistance = d1 + d2;
        const displacement = Math.sqrt(d1 * d1 + d2 * d2);
        const angleDeg = (Math.atan2(d2, d1) * 180 / Math.PI).toFixed(1);

        // Origin Point A (Left-Center)
        const ox = 90;
        const oy = h - 90;
        
        // Auto scale to fill left region generously
        const maxDrawW = 310;
        const maxDrawH = 200;
        const scale = Math.min(maxDrawW / Math.max(d1, 60), maxDrawH / Math.max(d2, 50));

        const x1 = ox + d1 * scale;
        const y1 = oy;
        const x2 = x1;
        const y2 = oy - d2 * scale;

        // Draw Grid Reference Axes
        ctx.strokeStyle = 'rgba(148, 163, 184, 0.25)';
        ctx.lineWidth = 1;
        ctx.setLineDash([]);
        
        // Axis East (+x)
        ctx.beginPath();
        ctx.moveTo(ox - 30, oy);
        ctx.lineTo(ox + maxDrawW + 40, oy);
        ctx.stroke();
        // Axis arrow head East
        ctx.fillStyle = '#94A3B8';
        ctx.beginPath();
        ctx.moveTo(ox + maxDrawW + 40, oy - 4);
        ctx.lineTo(ox + maxDrawW + 48, oy);
        ctx.lineTo(ox + maxDrawW + 40, oy + 4);
        ctx.fill();

        // Axis North (+y)
        ctx.beginPath();
        ctx.moveTo(ox, oy + 30);
        ctx.lineTo(ox, oy - maxDrawH - 40);
        ctx.stroke();
        // Axis arrow head North
        ctx.beginPath();
        ctx.moveTo(ox - 4, oy - maxDrawH - 40);
        ctx.lineTo(ox, oy - maxDrawH - 48);
        ctx.lineTo(ox + 4, oy - maxDrawH - 40);
        ctx.fill();

        ctx.font = 'bold 12px sans-serif';
        ctx.fillStyle = '#CBD5E1';
        ctx.fillText('Đông (+x)', ox + maxDrawW + 10, oy + 20);
        ctx.fillText('Bắc (+y)', ox - 55, oy - maxDrawH - 35);

        // Draw Right Angle marker at (x1, y1)
        const cornerSize = 12;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(x1 - cornerSize, y1);
        ctx.lineTo(x1 - cornerSize, y1 - cornerSize);
        ctx.lineTo(x1, y1 - cornerSize);
        ctx.stroke();

        // Draw Angle Arc at Origin
        ctx.strokeStyle = '#00D4FF';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(ox, oy, 32, -Math.atan2(d2, d1), 0);
        ctx.stroke();
        ctx.fillStyle = '#00D4FF';
        ctx.font = 'bold 11px sans-serif';
        ctx.fillText(`α = ${angleDeg}°`, ox + 38, oy - 12);

        // Path 1 (Orange: s1 - East)
        ctx.strokeStyle = '#F59E0B';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(ox, oy);
        ctx.lineTo(x1, y1);
        ctx.stroke();
        // Arrow head for s1
        ctx.fillStyle = '#F59E0B';
        ctx.beginPath();
        ctx.moveTo(x1 - 10, y1 - 6);
        ctx.lineTo(x1, y1);
        ctx.lineTo(x1 - 10, y1 + 6);
        ctx.fill();

        // Path 2 (Green: s2 - North)
        ctx.strokeStyle = '#10B981';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
        // Arrow head for s2
        ctx.fillStyle = '#10B981';
        ctx.beginPath();
        ctx.moveTo(x2 - 6, y2 + 10);
        ctx.lineTo(x2, y2);
        ctx.lineTo(x2 + 6, y2 + 10);
        ctx.fill();

        // Resultant Vector d (Cyan dashed displacement)
        ctx.strokeStyle = '#00D4FF';
        ctx.lineWidth = 3.5;
        ctx.setLineDash([8, 4]);
        ctx.beginPath();
        ctx.moveTo(ox, oy);
        ctx.lineTo(x2, y2);
        ctx.stroke();
        ctx.setLineDash([]);
        // Arrow head for d
        const vecAngle = Math.atan2(y2 - oy, x2 - ox);
        ctx.fillStyle = '#00D4FF';
        ctx.beginPath();
        ctx.moveTo(
          x2 - 12 * Math.cos(vecAngle - Math.PI / 6),
          y2 - 12 * Math.sin(vecAngle - Math.PI / 6)
        );
        ctx.lineTo(x2, y2);
        ctx.lineTo(
          x2 - 12 * Math.cos(vecAngle + Math.PI / 6),
          y2 - 12 * Math.sin(vecAngle + Math.PI / 6)
        );
        ctx.fill();

        // Vector labels on Canvas
        // s1 label badge
        ctx.fillStyle = '#F59E0B';
        ctx.font = 'bold 12px sans-serif';
        ctx.fillText(`s₁ = ${d1.toFixed(0)} m (Đông)`, (ox + x1) / 2 - 40, oy + 22);

        // s2 label badge
        ctx.fillStyle = '#10B981';
        ctx.fillText(`s₂ = ${d2.toFixed(0)} m (Bắc)`, x1 + 12, (y1 + y2) / 2 + 4);

        // d label badge along hypotenuse
        ctx.fillStyle = '#00D4FF';
        ctx.font = 'bold 13px sans-serif';
        ctx.fillText(`d = ${displacement.toFixed(1)} m`, (ox + x2) / 2 - 45, (oy + y2) / 2 - 15);

        // Point A (Start)
        ctx.fillStyle = '#EF4444';
        ctx.beginPath();
        ctx.arc(ox, oy, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#FCA5A5';
        ctx.font = 'bold 12px sans-serif';
        ctx.fillText('Điểm A (Gốc)', ox - 35, oy + 38);

        // Point B (End)
        ctx.fillStyle = '#00FFCC';
        ctx.beginPath();
        ctx.arc(x2, y2, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#00FFCC';
        ctx.font = 'bold 12px sans-serif';
        ctx.fillText('Điểm B (Đích)', x2 - 25, y2 - 18);

        // ==========================================
        // METRICS & ANALYSIS PANEL (RIGHT ZONE)
        // ==========================================
        const panelX = w - 280;
        const panelY = 25;
        const panelW = 260;
        const panelH = h - 50;

        ctx.fillStyle = 'rgba(8, 18, 38, 0.95)';
        ctx.strokeStyle = '#00D4FF';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(panelX, panelY, panelW, panelH, 16);
        ctx.fill();
        ctx.stroke();

        // Header
        ctx.fillStyle = '#00D4FF';
        ctx.font = 'bold 14px sans-serif';
        ctx.fillText('📐 THÔNG SỐ VECTƠ & QUỸ ĐẠO', panelX + 16, panelY + 30);
        ctx.fillStyle = '#94A3B8';
        ctx.font = '11px sans-serif';
        ctx.fillText('Chuyển động trong mặt phẳng 2D', panelX + 16, panelY + 48);

        // Divider
        ctx.strokeStyle = 'rgba(0, 212, 255, 0.2)';
        ctx.beginPath();
        ctx.moveTo(panelX + 16, panelY + 60);
        ctx.lineTo(panelX + panelW - 16, panelY + 60);
        ctx.stroke();

        // 1. Quãng đường
        ctx.fillStyle = '#F59E0B';
        ctx.font = 'bold 12px sans-serif';
        ctx.fillText('1. Quãng đường đi được (s):', panelX + 16, panelY + 84);
        ctx.fillStyle = '#E2E8F0';
        ctx.font = '12px sans-serif';
        ctx.fillText(`• Đoạn 1: s₁ = ${d1.toFixed(0)} m (hướng Đông)`, panelX + 22, panelY + 106);
        ctx.fillText(`• Đoạn 2: s₂ = ${d2.toFixed(0)} m (hướng Bắc)`, panelX + 22, panelY + 126);
        ctx.fillStyle = '#FBBF24';
        ctx.font = 'bold 12px sans-serif';
        ctx.fillText(`➜ Tổng: s = s₁ + s₂ = ${totalDistance.toFixed(0)} m`, panelX + 22, panelY + 150);

        // Divider
        ctx.strokeStyle = 'rgba(0, 212, 255, 0.2)';
        ctx.beginPath();
        ctx.moveTo(panelX + 16, panelY + 165);
        ctx.lineTo(panelX + panelW - 16, panelY + 165);
        ctx.stroke();

        // 2. Độ dịch chuyển
        ctx.fillStyle = '#00FFCC';
        ctx.font = 'bold 12px sans-serif';
        ctx.fillText('2. Độ dịch chuyển (vectơ d):', panelX + 16, panelY + 190);
        ctx.fillStyle = '#E2E8F0';
        ctx.font = '12px sans-serif';
        ctx.fillText(`• Độ lớn: d = √(s₁² + s₂²)`, panelX + 22, panelY + 212);
        ctx.fillStyle = '#00FFCC';
        ctx.font = 'bold 13px sans-serif';
        ctx.fillText(`  = ${displacement.toFixed(1)} m`, panelX + 22, panelY + 234);
        ctx.fillStyle = '#E2E8F0';
        ctx.font = '12px sans-serif';
        ctx.fillText(`• Góc lệch: α = ${angleDeg}° (Đông-Bắc)`, panelX + 22, panelY + 258);
        ctx.fillStyle = '#38BDF8';
        ctx.font = '11px sans-serif';
        ctx.fillText(`• So sánh: d < s (${displacement.toFixed(1)} m < ${totalDistance.toFixed(0)} m)`, panelX + 22, panelY + 282);
        break;
      }

      // BÀI 6: THỰC HÀNH ĐO TỐC ĐỘ CỦA VẬT CHUYỂN ĐỘNG (Cổng quang điện & Đồng hồ MC-964)
      case 6: {
        const sMeters = 0.4 + (p1 / 100) * 0.5; // 0.4m to 0.9m
        const slopeDeg = 5 + (p2 / 100) * 15; // 5° to 20°
        const acceleration = 9.8 * Math.sin((slopeDeg * Math.PI) / 180);
        const totalDuration = Math.sqrt((2 * sMeters) / acceleration);
        const loopTime = totalDuration + 1.5;
        const currentT = (t % loopTime);
        const isMoving = currentT < totalDuration;
        const currentDistance = isMoving ? 0.5 * acceleration * currentT * currentT : sMeters;
        const currentSpeed = isMoving ? acceleration * currentT : Math.sqrt(2 * acceleration * sMeters);

        // Track geometry on canvas
        const trackStartX = cx - 220;
        const trackStartY = cy - 20;
        const trackEndX = cx + 160;
        const trackEndY = cy + 40;
        const trackLengthPx = Math.hypot(trackEndX - trackStartX, trackEndY - trackStartY);
        const trackAngle = Math.atan2(trackEndY - trackStartY, trackEndX - trackStartX);

        // Draw incline track
        ctx.save();
        ctx.translate(trackStartX, trackStartY);
        ctx.rotate(trackAngle);

        // Metallic track bed
        ctx.fillStyle = '#1E293B';
        ctx.strokeStyle = '#00D4FF';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(0, 10, trackLengthPx + 40, 14, 4);
        ctx.fill();
        ctx.stroke();

        // Ruler ticks along track
        ctx.strokeStyle = '#94A3B8';
        ctx.fillStyle = '#94A3B8';
        ctx.font = '8px sans-serif';
        ctx.lineWidth = 1;
        for (let i = 0; i <= trackLengthPx; i += 20) {
          ctx.beginPath();
          ctx.moveTo(i, 10);
          ctx.lineTo(i, 4);
          ctx.stroke();
          if (i % 60 === 0) {
            ctx.fillText(`${(i / 3).toFixed(0)}cm`, i - 10, 0);
          }
        }

        // Photogate A (at x = 60) and Photogate B (at x = 60 + sPx)
        const gateAPx = 60;
        const gateBPx = 60 + (sMeters / 0.9) * 260;

        // Draw Photogate A
        ctx.fillStyle = '#0F172A';
        ctx.strokeStyle = '#F59E0B';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(gateAPx - 8, -35, 16, 45, 4);
        ctx.fill();
        ctx.stroke();
        // Infrared beam A
        ctx.strokeStyle = 'rgba(245, 158, 11, 0.8)';
        ctx.setLineDash([2, 2]);
        ctx.beginPath();
        ctx.moveTo(gateAPx, -30);
        ctx.lineTo(gateAPx, 10);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.fillStyle = '#F59E0B';
        ctx.font = 'bold 10px sans-serif';
        ctx.fillText('CỔNG A', gateAPx - 18, -42);

        // Draw Photogate B
        ctx.fillStyle = '#0F172A';
        ctx.strokeStyle = '#10B981';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(gateBPx - 8, -35, 16, 45, 4);
        ctx.fill();
        ctx.stroke();
        // Infrared beam B
        ctx.strokeStyle = 'rgba(16, 185, 129, 0.8)';
        ctx.setLineDash([2, 2]);
        ctx.beginPath();
        ctx.moveTo(gateBPx, -30);
        ctx.lineTo(gateBPx, 10);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.fillStyle = '#10B981';
        ctx.font = 'bold 10px sans-serif';
        ctx.fillText('CỔNG B', gateBPx - 18, -42);

        // Cart position
        const cartDistanceRatio = currentDistance / sMeters;
        const cartX = gateAPx - 30 + cartDistanceRatio * (gateBPx - gateAPx + 30);

        // Draw Cart with Light-blocking flag (d = 10mm)
        ctx.fillStyle = '#0284C7';
        ctx.strokeStyle = '#38BDF8';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(cartX, -6, 40, 16, 3);
        ctx.fill();
        ctx.stroke();

        // Light-blocking flag (d = 10mm = 0.01m)
        ctx.fillStyle = '#EF4444';
        ctx.fillRect(cartX + 15, -28, 8, 22);

        // Wheels
        ctx.fillStyle = '#475569';
        ctx.beginPath();
        ctx.arc(cartX + 8, 12, 4, 0, Math.PI * 2);
        ctx.arc(cartX + 32, 12, 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();

        // Digital Timer Display Box (MC-964 Digital Timer Simulation)
        ctx.fillStyle = 'rgba(10, 18, 36, 0.95)';
        ctx.strokeStyle = '#00D4FF';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(cx - 220, cy + 70, 440, 100, 12);
        ctx.fill();
        ctx.stroke();

        // Timer header
        ctx.fillStyle = '#00D4FF';
        ctx.font = 'bold 12px sans-serif';
        ctx.fillText('⏱️ ĐỒNG HỒ ĐO THỜI GIAN HIỆN SỐ MC-964 (MODE A ↔ B)', cx - 200, cy + 92);

        // Timer LCD screen
        ctx.fillStyle = '#021B17';
        ctx.strokeStyle = '#00FFCC';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(cx - 200, cy + 102, 140, 52, 6);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#00FFCC';
        ctx.font = 'bold 20px monospace';
        const displayTime = isMoving ? currentT.toFixed(3) : totalDuration.toFixed(3);
        ctx.fillText(`${displayTime} s`, cx - 185, cy + 136);

        // Speed & Error calculations
        const vMean = sMeters / totalDuration;
        const deltaS = 0.001;
        const deltaT = 0.003;
        const relError = (deltaS / sMeters + deltaT / totalDuration);
        const absError = vMean * relError;

        ctx.fillStyle = '#F8FAFC';
        ctx.font = '12px sans-serif';
        ctx.fillText(`• Quãng đường: s = ${sMeters.toFixed(3)} m (ĐCNN thước: 1 mm)`, cx - 45, cy + 112);
        ctx.fillText(`• Tốc độ tức thời xe: v_t = ${currentSpeed.toFixed(2)} m/s`, cx - 45, cy + 130);
        ctx.fillStyle = '#00FFCC';
        ctx.font = 'bold 12px sans-serif';
        ctx.fillText(`• Tốc độ trung bình: v = ${vMean.toFixed(3)} ± ${absError.toFixed(3)} (m/s)`, cx - 45, cy + 148);
        break;
      }

      // BÀI 10: SỰ RƠI TỰ DO (Ống chân không Newton)
      case 10: {
        const g = 9.8;
        const heightM = 20 + (p1 / 100) * 30; // 20 - 50m
        const fallTime = Math.sqrt((2 * heightM) / g);
        const currFallT = (t % (fallTime + 1));
        const fallProgress = Math.min(1, currFallT / fallTime);

        // Tube 1: Air-filled (with resistance)
        const yBallAir = cy - 90 + fallProgress * 180;
        const yFeatherAir = cy - 90 + Math.pow(fallProgress, 0.6) * 180 * 0.6 + Math.sin(t * 8) * 6;

        // Tube 2: Vacuum (Equal free fall)
        const yBallVac = cy - 90 + Math.pow(fallProgress, 2) * 180;
        const yFeatherVac = yBallVac;

        // Draw Left Tube: In Air
        ctx.fillStyle = 'rgba(30, 41, 59, 0.6)';
        ctx.strokeStyle = '#94A3B8';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.roundRect(cx - 160, cy - 100, 70, 200, 35);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#94A3B8';
        ctx.font = 'bold 11px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Có không khí', cx - 125, cy - 110);

        // Left Tube items
        ctx.fillStyle = '#64748B'; // lead ball
        ctx.beginPath();
        ctx.arc(cx - 140, Math.min(cy + 85, yBallAir), 7, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#F59E0B'; // feather
        ctx.beginPath();
        ctx.ellipse(cx - 110, Math.min(cy + 85, yFeatherAir), 9, 3, Math.PI / 4, 0, Math.PI * 2);
        ctx.fill();

        // Draw Right Tube: Vacuum
        ctx.fillStyle = 'rgba(14, 116, 144, 0.2)';
        ctx.strokeStyle = '#00D4FF';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.roundRect(cx - 50, cy - 100, 70, 200, 35);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#00D4FF';
        ctx.font = 'bold 11px sans-serif';
        ctx.fillText('Chân không (Newton)', cx - 15, cy - 110);

        // Right Tube items (Falling at EXACT SAME SPEED)
        ctx.fillStyle = '#CBD5E1';
        ctx.beginPath();
        ctx.arc(cx - 30, Math.min(cy + 85, yBallVac), 7, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#F59E0B';
        ctx.beginPath();
        ctx.ellipse(cx, Math.min(cy + 85, yFeatherVac), 9, 3, 0, 0, Math.PI * 2);
        ctx.fill();

        // Right Info Box
        ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
        ctx.strokeStyle = '#00FFCC';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(cx + 60, cy - 100, 210, 200, 12);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#00FFCC';
        ctx.font = 'bold 13px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText('🍏 ĐỊNH LUẬT RƠI TỰ DO', cx + 75, cy - 75);

        ctx.fillStyle = '#F8FAFC';
        ctx.font = '12px sans-serif';
        ctx.fillText(`• Độ cao h = ${heightM.toFixed(1)} m`, cx + 75, cy - 50);
        ctx.fillText(`• Gia tốc g = 9.80 m/s²`, cx + 75, cy - 30);
        ctx.fillText(`• Vận tốc chạm đất:`, cx + 75, cy - 10);
        ctx.fillText(`  v = √(2gh) = ${(Math.sqrt(2 * g * heightM)).toFixed(2)} m/s`, cx + 75, cy + 10);
        ctx.fillText(`• Thời gian rơi chạm đất:`, cx + 75, cy + 30);
        ctx.fillText(`  t = √(2h/g) = ${fallTime.toFixed(2)} s`, cx + 75, cy + 50);
        ctx.fillStyle = '#38BDF8';
        ctx.fillText('Trong chân không, mọi vật rơi', cx + 75, cy + 75);
        ctx.fillText('nhanh như nhau không phụ thuộc m!', cx + 75, cy + 90);
        break;
      }

      // BÀI 15: ĐỊNH LUẬT 2 NEWTON (F = m.a)
      case 15: {
        const massKg = 0.5 + (p1 / 100) * 2.5; // 0.5 - 3.0 kg
        const forceN = 1 + (p2 / 100) * 9; // 1 - 10 N
        const accel = forceN / massKg;

        const cartX = (cx - 150 + ((t * accel * 8) % 250));
        const cartY = cy + 20;

        // Track
        ctx.fillStyle = '#1E293B';
        ctx.fillRect(cx - 180, cartY + 15, 300, 8);

        // Cart
        ctx.fillStyle = '#0284C7';
        ctx.strokeStyle = '#38BDF8';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(cartX, cartY - 20, 50, 25, 6);
        ctx.fill();
        ctx.stroke();

        // Wheels
        ctx.fillStyle = '#0F172A';
        ctx.beginPath();
        ctx.arc(cartX + 12, cartY + 10, 6, 0, Math.PI * 2);
        ctx.arc(cartX + 38, cartY + 10, 6, 0, Math.PI * 2);
        ctx.fill();

        // Force Vector Arrow
        ctx.strokeStyle = '#EF4444';
        ctx.fillStyle = '#EF4444';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(cartX + 50, cartY - 8);
        ctx.lineTo(cartX + 50 + forceN * 6, cartY - 8);
        ctx.stroke();
        ctx.fillText(`F = ${forceN.toFixed(1)}N`, cartX + 50 + forceN * 3, cartY - 14);

        // Pulley & Weight
        ctx.strokeStyle = '#94A3B8';
        ctx.beginPath();
        ctx.arc(cx + 120, cartY + 15, 10, 0, Math.PI * 2);
        ctx.stroke();

        // Lower stats
        ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
        ctx.strokeStyle = '#00D4FF';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(cx - 200, cy - 100, 400, 80, 10);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#00D4FF';
        ctx.font = 'bold 14px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(`⚡ ĐỊNH LUẬT 2 NEWTON: F = m.a  ⟹  a = F / m`, cx - 180, cy - 75);

        ctx.fillStyle = '#F8FAFC';
        ctx.font = '13px sans-serif';
        ctx.fillText(`• Lực kéo tác dụng F = ${forceN.toFixed(1)} N | Khối lượng xe m = ${massKg.toFixed(2)} kg`, cx - 180, cy - 50);
        ctx.fillStyle = '#00FFCC';
        ctx.fillText(`• Gia tốc thu được: a = F/m = ${(forceN / massKg).toFixed(2)} m/s² (tỉ lệ thuận với F, nghịch với m)`, cx - 180, cy - 30);
        break;
      }

      // BÀI 26: CƠ NĂNG VÀ ĐỊNH LUẬT BẢO TOÀN CƠ NĂNG (Con lắc đơn & Biểu đồ thanh năng lượng)
      case 26: {
        const length = 120;
        const maxAngle = (20 + (p1 / 100) * 45) * (Math.PI / 180);
        const theta = maxAngle * Math.cos(t * 3);

        const bobX = cx - 50 + length * Math.sin(theta);
        const bobY = cy - 80 + length * Math.cos(theta);

        // Ceiling
        ctx.strokeStyle = '#64748B';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(cx - 100, cy - 80);
        ctx.lineTo(cx, cy - 80);
        ctx.stroke();

        // String
        ctx.strokeStyle = '#94A3B8';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(cx - 50, cy - 80);
        ctx.lineTo(bobX, bobY);
        ctx.stroke();

        // Bob
        ctx.fillStyle = '#00D4FF';
        ctx.beginPath();
        ctx.arc(bobX, bobY, 14, 0, Math.PI * 2);
        ctx.fill();

        // Kinetic Energy fraction & Potential Energy fraction
        const potRatio = Math.pow(theta / maxAngle, 2);
        const kinRatio = 1 - potRatio;

        // Energy Bars
        ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
        ctx.strokeStyle = '#00D4FF';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(cx + 60, cy - 90, 200, 180, 12);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#00D4FF';
        ctx.font = 'bold 13px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText('🔋 BẢO TOÀN CƠ NĂNG', cx + 75, cy - 65);

        // Potential Energy Bar (Orange)
        ctx.fillStyle = '#F59E0B';
        ctx.fillText(`Thế năng Wt = ${(potRatio * 100).toFixed(0)}%`, cx + 75, cy - 40);
        ctx.fillStyle = '#334155';
        ctx.fillRect(cx + 75, cy - 30, 160, 12);
        ctx.fillStyle = '#F59E0B';
        ctx.fillRect(cx + 75, cy - 30, 160 * potRatio, 12);

        // Kinetic Energy Bar (Green)
        ctx.fillStyle = '#10B981';
        ctx.fillText(`Động năng Wđ = ${(kinRatio * 100).toFixed(0)}%`, cx + 75, cy + 5);
        ctx.fillStyle = '#334155';
        ctx.fillRect(cx + 75, cy + 15, 160, 12);
        ctx.fillStyle = '#10B981';
        ctx.fillRect(cx + 75, cy + 15, 160 * kinRatio, 12);

        // Total Mechanical Energy (Cyan)
        ctx.fillStyle = '#00FFCC';
        ctx.fillText(`Cơ năng W = Wđ + Wt = const`, cx + 75, cy + 50);
        ctx.fillStyle = '#00FFCC';
        ctx.fillRect(cx + 75, cy + 60, 160, 12);
        break;
      }

      // DEFAULT DYNAMIC VISUALIZER FOR ANY OTHER LESSON (High Quality Physics Lab Engine)
      default: {
        const radius = 60 + (p1 / 100) * 40;
        const omega = 1 + (p2 / 100) * 3;
        const angle = t * omega;

        const px = cx + radius * Math.cos(angle);
        const py = cy + radius * Math.sin(angle);

        // Orbit path
        ctx.strokeStyle = 'rgba(0, 212, 255, 0.25)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.stroke();

        // Center mass
        ctx.fillStyle = '#F59E0B';
        ctx.beginPath();
        ctx.arc(cx, cy, 14, 0, Math.PI * 2);
        ctx.fill();

        // Rotating object
        ctx.fillStyle = '#00D4FF';
        ctx.beginPath();
        ctx.arc(px, py, 10, 0, Math.PI * 2);
        ctx.fill();

        // Velocity vector (tangential)
        const vx = -Math.sin(angle) * 35;
        const vy = Math.cos(angle) * 35;
        ctx.strokeStyle = '#10B981';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(px + vx, py + vy);
        ctx.stroke();

        // Centripetal acceleration vector (inwards)
        const ax = -Math.cos(angle) * 30;
        const ay = -Math.sin(angle) * 30;
        ctx.strokeStyle = '#EF4444';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(px + ax, py + ay);
        ctx.stroke();

        // Legend & Realtime metrics
        ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
        ctx.strokeStyle = '#00D4FF';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(20, 20, 220, 110, 10);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#00D4FF';
        ctx.font = 'bold 12px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(`🔬 DIỄN HỌA BÀI ${lesson.lessonNumber}: ${lesson.title}`, 32, 42);

        ctx.fillStyle = '#E2E8F0';
        ctx.font = '11px sans-serif';
        ctx.fillText(`• Bán kính r = ${(radius / 10).toFixed(1)} cm`, 32, 64);
        ctx.fillText(`• Tốc độ góc ω = ${omega.toFixed(2)} rad/s`, 32, 82);
        ctx.fillText(`• Gia tốc a = ${(omega * omega * (radius / 100)).toFixed(2)} m/s²`, 32, 100);
        ctx.fillText(`• Véc-tơ: Vận tốc (Xanh lá) | Gia tốc (Đỏ)`, 32, 118);
        break;
      }
    }
  };

  return (
    <div id={`lesson-universal-detail-${lesson.id}`} className="space-y-6">
      {/* 1. TOP HEADER WITH CHAPTER & LESSON NUMBER */}
      <div className="rounded-2xl border border-white/10 bg-gradient-to-r from-[#0C1528] via-[#0A1A35] to-[#071328] p-5 shadow-xl backdrop-blur-md">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#00D4FF]">
              <span>Chương {chapter.romanNumeral}: {chapter.title}</span>
              <span className="text-gray-500">•</span>
              <span className="text-[#00FFCC]">Sách giáo khoa Kết nối tri thức</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-normal">
              Bài {lesson.lessonNumber}: {lesson.title}
            </h2>
            <p className="text-sm sm:text-base text-gray-300 max-w-3xl leading-relaxed">
              <InlinePhysicsText text={lesson.shortDescription} />
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              className="hidden"
            />
            {!uploadedImage ? (
              <button
                type="button"
                onClick={handleTriggerUpload}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#00D4FF]/20 hover:bg-[#00D4FF]/30 text-[#00D4FF] font-semibold text-xs sm:text-sm border border-[#00D4FF]/40 transition-all cursor-pointer shadow-md"
              >
                <Upload className="h-4 w-4" />
                <span>Tải ảnh SGK 16:9 lên</span>
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleTriggerUpload}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#00D4FF]/20 hover:bg-[#00D4FF]/30 text-[#00D4FF] font-semibold text-xs border border-[#00D4FF]/40 transition-all cursor-pointer shadow-sm"
                >
                  <Upload className="h-3.5 w-3.5" />
                  <span>Đổi ảnh</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsPreviewOpen(true)}
                  className="p-1.5 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-slate-200 transition-colors cursor-pointer"
                  title="Xem kích thước đầy đủ"
                >
                  <Maximize2 className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="p-1.5 rounded-xl border border-rose-500/30 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 transition-colors cursor-pointer"
                  title="Xóa ảnh SGK"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Persistent 16:9 Image View */}
        {uploadedImage && (
          <div
            className="mt-6 overflow-hidden rounded-2xl border border-white/15 bg-black/60 shadow-2xl aspect-video flex items-center justify-center cursor-pointer group relative"
            onClick={() => setIsPreviewOpen(true)}
          >
            <img
              src={uploadedImage}
              alt={`Hình ảnh minh họa bài ${lesson.lessonNumber}`}
              className="w-full h-full object-contain rounded-xl transition-transform duration-300 group-hover:scale-[1.01]"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <span className="px-3.5 py-1.5 rounded-xl bg-black/75 text-white text-xs font-bold flex items-center gap-1.5 border border-white/20 shadow-lg backdrop-blur-sm">
                <Maximize2 className="h-4 w-4 text-[#00D4FF]" />
                Xem toàn màn hình
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Lightbox / Fullscreen Modal */}
      {isPreviewOpen && uploadedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-200"
          onClick={() => setIsPreviewOpen(false)}
        >
          <div
            className="relative max-w-5xl w-full max-h-[90vh] flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full flex items-center justify-between pb-3 text-white border-b border-white/10 mb-3">
              <span className="font-bold text-base sm:text-lg">
                Bài {lesson.lessonNumber}: {lesson.title} (Hình ảnh SGK)
              </span>
              <button
                onClick={() => setIsPreviewOpen(false)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white cursor-pointer"
                title="Đóng"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <img
              src={uploadedImage}
              alt={`Hình ảnh minh họa bài ${lesson.lessonNumber}`}
              className="max-h-[80vh] w-auto object-contain rounded-2xl border border-white/20 shadow-2xl"
            />
          </div>
        </div>
      )}

      {/* 2. DEDICATED INTERACTIVE SIMULATION OR 16:9 SAFETY BOARDS (LESSON 2) */}
      {lesson.id === 2 ? (
        <div className="space-y-6">
          {/* Card 1: Một số ký hiệu trên các thiết bị thí nghiệm */}
          <SafetyImageCard16x9
            id="symbols_apparatus"
            title="Một số ký hiệu trên các thiết bị thí nghiệm:"
            subtitle="Ký hiệu DC (dòng một chiều), AC (dòng xoay chiều), tiếp đất, Ampe kế (A), Vôn kế (V), Cầu chì, Khóa K và Điện trở"
            defaultSvgIllustration={<LabEquipmentSymbolsIllustration />}
          />

          {/* Card 2: Các biển cảnh báo nguy hiểm công nghiệp */}
          <SafetyImageCard16x9
            id="industrial_warnings"
            title="Các biển cảnh báo nguy hiểm công nghiệp"
            subtitle="Biển cảnh báo điện cao thế, chất dễ cháy nổ, chất độc hại, bức xạ tia laser, hóa chất ăn mòn và phóng xạ"
            defaultSvgIllustration={<IndustrialWarningsIllustration />}
          />

          {/* Card 3: Các biển cảnh báo giao thông đường bộ */}
          <SafetyImageCard16x9
            id="traffic_warnings"
            title="Các biển cảnh báo giao thông đường bộ"
            subtitle="Biển cảnh báo hình tam giác viền đỏ nền vàng: Chỗ ngoặt nguy hiểm (W.201), đường trơn trượt (W.222), trẻ em qua đường (W.225), đường hai chiều (W.204), v.v."
            defaultSvgIllustration={<TrafficSignsIllustration />}
          />
        </div>
      ) : lesson.id === 4 ? (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0A1326] p-3 rounded-2xl border border-white/10">
            <div className="flex items-center gap-2 text-white text-xs font-bold uppercase tracking-wider">
              <Sparkles className="h-4 w-4 text-[#00D4FF]" />
              <span>Chọn kịch bản mô phỏng 3D SGK Bài 4:</span>
            </div>
            <div className="flex items-center bg-[#070D1B] p-1 rounded-xl border border-white/10 text-xs overflow-x-auto">
              <button
                onClick={() => setLesson4SimSubTab('SWIMMER_RIVER')}
                className={`px-3.5 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap cursor-pointer ${
                  lesson4SimSubTab === 'SWIMMER_RIVER'
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                Bài 2: Người bơi qua sông (Trang 25)
              </button>
              <button
                onClick={() => setLesson4SimSubTab('CAR_TRIP')}
                className={`px-3.5 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap cursor-pointer ${
                  lesson4SimSubTab === 'CAR_TRIP'
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                Bài 1: Ô tô 3 chặng (Trang 25)
              </button>
              <button
                onClick={() => setLesson4SimSubTab('BICYCLE_TRIP')}
                className={`px-3.5 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap cursor-pointer ${
                  lesson4SimSubTab === 'BICYCLE_TRIP'
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                Hình 4.7: Xe đạp bạn A (Trang 24 - 25)
              </button>
              <button
                onClick={() => setLesson4SimSubTab('HANOI_HAIPHONG')}
                className={`px-3.5 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap cursor-pointer ${
                  lesson4SimSubTab === 'HANOI_HAIPHONG'
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                Bản đồ Hà Nội - Hải Phòng (Trang 22)
              </button>
              <button
                onClick={() => setLesson4SimSubTab('THREE_PATHS')}
                className={`px-3.5 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap cursor-pointer ${
                  lesson4SimSubTab === 'THREE_PATHS'
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                Hình 4.6: So sánh s & d (Trang 23 - 24)
              </button>
              <button
                onClick={() => setLesson4SimSubTab('INTERSECTION')}
                className={`px-3.5 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap cursor-pointer ${
                  lesson4SimSubTab === 'INTERSECTION'
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                Khởi động: Ngã tư 4 hướng (Trang 21)
              </button>
            </div>
          </div>

          {lesson4SimSubTab === 'SWIMMER_RIVER' ? (
            <Lesson4SwimmerRiverSimulation />
          ) : lesson4SimSubTab === 'CAR_TRIP' ? (
            <Lesson4CarTripSimulation />
          ) : lesson4SimSubTab === 'BICYCLE_TRIP' ? (
            <Lesson4BicycleTripSimulation />
          ) : lesson4SimSubTab === 'HANOI_HAIPHONG' ? (
            <Lesson4HanoiHaiPhongSimulation />
          ) : lesson4SimSubTab === 'THREE_PATHS' ? (
            <Lesson4ThreePathsSimulation />
          ) : (
            <Lesson4IntersectionSimulation />
          )}
        </div>
      ) : (
        <div className="rounded-3xl border border-cyan-500/30 bg-[#070F1E]/95 p-6 shadow-[0_0_30px_rgba(0,212,255,0.12)] space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
            <div className="flex items-center gap-2.5">
              <Activity className="h-5 w-5 text-[#00D4FF] animate-pulse" />
              <h3 className="text-lg sm:text-xl font-bold text-white">
                Diễn họa Vật lí Tương tác & Phân tích Dữ liệu Số (60 FPS)
              </h3>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsRunning(!isRunning)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  isRunning
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                }`}
              >
                {isRunning ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                <span>{isRunning ? 'Tạm dừng' : 'Chạy tiếp'}</span>
              </button>
              <button
                onClick={() => {
                  simTimeRef.current = 0;
                  setSimParam1(50);
                  setSimParam2(30);
                }}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-gray-300 border border-slate-700 transition-colors cursor-pointer"
                title="Đặt lại thông số ban đầu"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Canvas Element */}
          <div className="relative w-full h-[340px] sm:h-[400px] rounded-2xl overflow-hidden border border-white/10 bg-[#060D1A] shadow-inner flex items-center justify-center">
            <canvas
              ref={canvasRef}
              width={740}
              height={390}
              className="w-full h-full object-contain cursor-crosshair"
            />
          </div>

          {/* Live Parameter Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="rounded-xl border border-white/10 bg-[#0C1528] p-3.5 space-y-2">
              <div className="flex justify-between text-xs font-bold text-gray-300">
                <span>Thông số Vật lí 1 (Biên độ / Lực / Thang đo):</span>
                <span className="text-[#00D4FF] font-mono">{simParam1}%</span>
              </div>
              <input
                type="range"
                min={10}
                max={100}
                value={simParam1}
                onChange={(e) => setSimParam1(Number(e.target.value))}
                className="w-full accent-[#00D4FF] cursor-pointer"
              />
            </div>

            <div className="rounded-xl border border-white/10 bg-[#0C1528] p-3.5 space-y-2">
              <div className="flex justify-between text-xs font-bold text-gray-300">
                <span>Thông số Vật lí 2 (Tốc độ / Góc / Khối lượng):</span>
                <span className="text-[#00FFCC] font-mono">{simParam2}%</span>
              </div>
              <input
                type="range"
                min={10}
                max={100}
                value={simParam2}
                onChange={(e) => setSimParam2(Number(e.target.value))}
                className="w-full accent-[#00FFCC] cursor-pointer"
              />
            </div>
          </div>
        </div>
      )}

      {/* 3. FULL TEXTBOOK SECTIONS (KHỞI ĐỘNG, I, II, III, IV, EM ĐÃ HỌC, EM CÓ THỂ, EM CÓ BIẾT) */}
      <div className="space-y-5">
        {lesson.steps.map((step, idx) => (
          <div
            key={idx}
            className="rounded-2xl border border-white/10 bg-[#0C1528]/80 p-5 sm:p-6 shadow-lg backdrop-blur-md space-y-3.5"
          >
            <div className="flex items-center gap-3 border-b border-white/10 pb-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#00D4FF]/20 text-xs sm:text-sm font-bold text-[#00D4FF] border border-[#00D4FF]/30 shrink-0">
                {step.stepNumber || `0${idx + 1}`}
              </span>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-white">
                  {step.title}
                </h3>
                {step.subtitle && (
                  <p className="text-xs text-cyan-300 font-medium mt-0.5">{step.subtitle}</p>
                )}
              </div>
            </div>

            <div className="text-base sm:text-lg leading-relaxed text-gray-200 font-normal">
              <FormattedPhysicsText content={step.content} />
            </div>

            {/* If step contains apparatus / lab equipment, render dedicated Apparatus Illustration & Upload Card */}
            {(step.title.toLowerCase().includes('dụng cụ') ||
              step.subtitle?.toLowerCase().includes('dụng cụ') ||
              step.content.toLowerCase().includes('dụng cụ thí nghiệm') ||
              step.content.toLowerCase().includes('dụng cụ thực hành') ||
              (lesson.id === 6 && idx === 0)) && (
              <ApparatusIllustrationCard
                lessonId={lesson.id}
                stepIndex={idx}
                title={`Minh họa dụng cụ: ${step.title}`}
                subtitle="Tải ảnh SGK hoặc ảnh chụp thực tế trong phòng thí nghiệm để minh họa"
              />
            )}

            {step.observationPoints && step.observationPoints.length > 0 && (
              <div className="rounded-xl border border-cyan-500/20 bg-cyan-950/20 p-4 sm:p-5 space-y-2.5">
                <span className="text-xs sm:text-sm font-bold text-[#00D4FF] uppercase tracking-wider block">
                  Quan sát & Trọng tâm kiến thức:
                </span>
                <ul className="space-y-2 text-sm sm:text-base text-gray-200">
                  {step.observationPoints.map((pt, pIdx) => (
                    <li key={pIdx} className="flex items-start gap-2.5">
                      <span className="text-[#00FFCC] font-bold mt-0.5">•</span>
                      <div className="flex-1 leading-relaxed">
                        <InlinePhysicsText text={pt} />
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 4. KATEX FORMULA LIBRARY WITH VARIABLE INSPECTIONS */}
      {lesson.keyFormulas && lesson.keyFormulas.length > 0 && (
        <div className="rounded-2xl border border-white/10 bg-[#0C1528]/80 p-5 sm:p-6 shadow-lg space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
            <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <Zap className="h-5 w-5 text-[#00FFCC]" />
              <span>Hệ thống Công thức KaTeX chuẩn GDPT 2018</span>
            </h3>
            <span className="text-xs font-semibold text-cyan-300 bg-cyan-950/60 border border-cyan-500/30 px-2.5 py-1 rounded-lg">
              {lesson.keyFormulas.length} công thức cốt lõi • Nhấn để xem đại lượng & Đơn vị SI
            </span>
          </div>

          <div
            className={`grid gap-4 ${
              lesson.keyFormulas.length === 1
                ? 'grid-cols-1 max-w-xl mx-auto'
                : lesson.keyFormulas.length === 2
                ? 'grid-cols-1 md:grid-cols-2'
                : lesson.keyFormulas.length === 3
                ? 'grid-cols-1 md:grid-cols-3'
                : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
            }`}
          >
            {lesson.keyFormulas.map((formula, fIdx) => (
              <MathFormulaCard
                key={fIdx}
                latex={formula.latex}
                name={formula.name}
                description={formula.description}
                units={formula.units}
                conditions={formula.conditions}
              />
            ))}
          </div>
        </div>
      )}

      {/* 5. SUMMARY & COMPETENCY BOXES (EM ĐÃ HỌC, EM CÓ THỂ) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-5 sm:p-6 space-y-3">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-base sm:text-lg">
            <CheckCircle2 className="h-5 w-5" />
            <span>EM ĐÃ HỌC (TỔNG KẾT BÀI HỌC)</span>
          </div>
          <p className="text-sm sm:text-base text-gray-200 leading-relaxed">
            Nắm vững bản chất hiện tượng vật lí, phương pháp thực nghiệm, mô hình hóa toán học và hệ thống công thức của Bài {lesson.lessonNumber}.
          </p>
        </div>

        <div className="rounded-2xl border border-cyan-500/30 bg-cyan-950/20 p-5 sm:p-6 space-y-3">
          <div className="flex items-center gap-2 text-cyan-400 font-bold text-base sm:text-lg">
            <Lightbulb className="h-5 w-5" />
            <span>EM CÓ THỂ (VẬN DỤNG THỰC TIỄN)</span>
          </div>
          <p className="text-sm sm:text-base text-gray-200 leading-relaxed">
            Giải thích các hiện tượng tương tự trong đời sống, giải quyết bài toán định lượng và thiết kế phương án thí nghiệm kiểm tra.
          </p>
        </div>
      </div>
    </div>
  );
};
