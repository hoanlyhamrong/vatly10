import React, { useState, useEffect, useRef } from 'react';
import {
  Ruler,
  Clock,
  Scale,
  Sparkles,
  Search,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  FileText,
  Sliders,
  Compass,
  Activity,
  Layers,
  HelpCircle,
  RotateCcw,
  Calculator,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  BookOpen,
  ArrowRight,
  Target,
  Info,
  Check,
  Upload,
  Camera,
  Trash2,
  Maximize2,
  X,
  Car,
  Play,
  Gauge
} from 'lucide-react';
import { MathFormula } from '../MathFormula';
import { FormattedPhysicsText, InlinePhysicsText } from '../ui/FormattedPhysicsText';
import { savePortraitToDB, loadPortraitFromDB, deletePortraitFromDB, compressImage } from '../../utils/imageStorage';
import { ToyCarSpeedExperimentSim } from '../simulations/ToyCarSpeedExperimentSim';
import { Lesson3InfographicCard } from './Lesson3InfographicCard';

export const Lesson3Detail: React.FC = () => {
  // Image Upload State for Lesson 3
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Active Tab for Lesson 3
  const [activeTab, setActiveTab] = useState<'INFOGRAPHIC' | 'THEORY' | 'TOY_CAR_EXPERIMENT' | 'CALCULATOR'>('INFOGRAPHIC');

  // Load custom image from DB on mount
  useEffect(() => {
    loadPortraitFromDB('lesson_image_3').then((img) => {
      if (img) setUploadedImage(img);
    });
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const compressed = await compressImage(file, 1600);
      await savePortraitToDB('lesson_image_3', compressed);
      setUploadedImage(compressed);
    } catch (err) {
      console.error('Lỗi khi tải ảnh lên:', err);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemoveImage = async () => {
    await deletePortraitFromDB('lesson_image_3');
    setUploadedImage(null);
  };

  const handleTriggerUpload = () => {
    fileInputRef.current?.click();
  };

  // Collapsible section states
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    'intro-q': true,
    'part1-activity': true,
    'part2-activity1': true,
    'part2-activity2': false,
    'part3-activity': false,
    'interactive-calc': true,
    'toy-car-guide': true
  });

  const toggleSection = (id: string) => {
    setOpenSections((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Interactive quick calculator state for students
  const [sampleValues, setSampleValues] = useState<number[]>([20.12, 20.14, 20.10, 20.12, 20.16]);
  const [dcnnVal, setDcnnVal] = useState<number>(0.02);
  const [errorFactor, setErrorFactor] = useState<number>(1); // 0.5 or 1
  const [unitStr, setUnitStr] = useState<string>('mm');
  const [symbolStr, setSymbolStr] = useState<string>('d');

  // Calculation logic
  const n = sampleValues.length;
  const meanVal = n > 0 ? sampleValues.reduce((a, b) => a + b, 0) / n : 0;
  const deviations = sampleValues.map((v) => Math.abs(meanVal - v));
  const randomErr = n > 0 ? deviations.reduce((a, b) => a + b, 0) / n : 0;
  const instErr = dcnnVal * errorFactor;
  const totalAbsErr = randomErr + instErr;
  const relErr = meanVal !== 0 ? (totalAbsErr / meanVal) * 100 : 0;

  const handleValueChange = (idx: number, val: string) => {
    const parsed = parseFloat(val);
    const updated = [...sampleValues];
    updated[idx] = isNaN(parsed) ? 0 : parsed;
    setSampleValues(updated);
  };

  // Vernier caliper interactive demo slider
  const [vernierReading, setVernierReading] = useState<number>(24.36);
  const mainScale = Math.floor(vernierReading);
  const fractional = vernierReading - mainScale;
  const vernierIndex = Math.round(fractional / 0.02);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Hidden File Input for Image Upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageUpload}
        accept="image/*"
        className="hidden"
      />

      {/* 1. HERO HEADER - BÀI 3 */}
      <div className="rounded-3xl border-2 border-cyan-500/40 bg-gradient-to-br from-[#061227] via-[#091B38] to-[#040C1A] p-6 sm:p-8 lg:p-10 shadow-[0_0_40px_rgba(0,212,255,0.15)] relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#00D4FF_1px,transparent_1px)] [background-size:20px_20px] opacity-10 pointer-events-none" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="px-3.5 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-mono font-black border border-cyan-500/40 uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
                <Ruler className="h-3.5 w-3.5 text-cyan-400" />
                Chương I: Mở đầu • Bài 3
              </span>
              <span className="px-3 py-1 rounded-md bg-blue-500/20 text-blue-300 text-xs font-bold border border-blue-500/30">
                Vật lí 10 SGK Chuẩn GDPT 2018
              </span>
            </div>

            {/* Top Upload Action Buttons */}
            <div className="flex items-center gap-2">
              {!uploadedImage ? (
                <button
                  type="button"
                  onClick={handleTriggerUpload}
                  disabled={isUploading}
                  className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-xs sm:text-sm font-bold border border-cyan-500/40 transition-all cursor-pointer shadow-sm"
                >
                  <Upload className="h-4 w-4" />
                  <span>{isUploading ? 'Đang tải...' : 'Tải ảnh bài 3 (16:9)'}</span>
                </button>
              ) : (
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handleTriggerUpload}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-xs font-bold border border-cyan-500/40 transition-colors cursor-pointer"
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
                    title="Xóa ảnh"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2 max-w-4xl">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight uppercase">
              BÀI 3. THỰC HÀNH TÍNH SAI SỐ TRONG PHÉP ĐO. GHI KẾT QUẢ ĐO
            </h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed font-medium">
              Toàn bộ nội dung chuẩn theo Sách giáo khoa Vật lí 10: Phép đo trực tiếp &amp; gián tiếp, phân loại sai số, quy tắc tính sai số và cách ghi kết quả đo chuẩn xác: <span className="font-mono text-cyan-300 font-bold"><InlinePhysicsText text="$A = \bar{A} \pm \Delta A$" /></span>.
            </p>
          </div>

          {/* Tab Navigation for Lesson 3 */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-cyan-500/20">
            <button
              onClick={() => setActiveTab('INFOGRAPHIC')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'INFOGRAPHIC'
                  ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/30'
                  : 'bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10'
              }`}
            >
              <Layers className="h-4 w-4" />
              <span>Sơ Đồ Tư Duy Bài 3 (Infographic)</span>
            </button>

            <button
              onClick={() => setActiveTab('THEORY')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'THEORY'
                  ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
                  : 'bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10'
              }`}
            >
              <BookOpen className="h-4 w-4" />
              <span>Nội Dung SGK &amp; Lý Thuyết Chi Tiết</span>
            </button>

            <button
              onClick={() => setActiveTab('TOY_CAR_EXPERIMENT')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'TOY_CAR_EXPERIMENT'
                  ? 'bg-amber-400 text-black shadow-lg shadow-amber-400/30'
                  : 'bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 border border-amber-500/30'
              }`}
            >
              <Car className="h-4 w-4" />
              <span>Thực Hành Xe Đồ Chơi (Đo &amp; Sai Số)</span>
            </button>

            <button
              onClick={() => setActiveTab('CALCULATOR')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'CALCULATOR'
                  ? 'bg-emerald-400 text-black shadow-lg shadow-emerald-400/30'
                  : 'bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20 border border-emerald-500/30'
              }`}
            >
              <Calculator className="h-4 w-4" />
              <span>Công Cụ Xử Lý Sai Số Tự Động</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. IMAGE DISPLAY & UPLOAD SECTION (16:9 PROPORTION, WITH ZOOM & PERSISTENCE) */}
      {uploadedImage ? (
        <div className="relative overflow-hidden rounded-3xl border-2 border-cyan-500/40 bg-[#040C1A] shadow-2xl p-3 sm:p-4 group/img aspect-video md:aspect-[16/9] w-full flex items-center justify-center">
          <img
            src={uploadedImage}
            alt="Hình ảnh thực hành Bài 3 SGK Vật lí 10"
            className="w-full h-full object-contain rounded-2xl transition-transform duration-300 group-hover/img:scale-[1.01]"
          />
          <div className="absolute bottom-6 right-6 flex items-center gap-2 opacity-90 hover:opacity-100 transition-opacity">
            <button
              onClick={() => setIsPreviewOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/70 hover:bg-black/90 text-white text-xs font-semibold backdrop-blur-md border border-white/20 shadow-lg cursor-pointer"
            >
              <Maximize2 className="h-3.5 w-3.5 text-cyan-400" />
              <span>Xem phóng to toàn màn hình</span>
            </button>
          </div>
        </div>
      ) : activeTab === 'INFOGRAPHIC' ? (
        /* Render vector interactive infographic matching the uploaded image */
        <Lesson3InfographicCard />
      ) : (
        <div
          onClick={handleTriggerUpload}
          className="w-full rounded-3xl border-2 border-dashed border-cyan-500/30 hover:border-cyan-400 bg-cyan-950/20 hover:bg-cyan-950/30 flex flex-col items-center justify-center p-6 text-center cursor-pointer transition-all duration-200 group/upload shadow-inner"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-500/10 group-hover/upload:bg-cyan-500/20 text-cyan-400 mb-2 shadow-inner">
            <Camera className="h-6 w-6" />
          </div>
          <span className="text-sm sm:text-base font-bold text-white group-hover/upload:text-cyan-300 flex items-center gap-2 transition-colors">
            Tải ảnh chụp Sách Giáo Khoa / Hình ảnh Thí nghiệm Bài 3 (Tỉ lệ 16:9)
          </span>
          <p className="text-xs text-slate-300 mt-1 max-w-lg leading-relaxed">
            Bạn có thể tải ảnh chụp bài 3 từ máy tính để hiển thị trong bài học và lưu trữ trên trình duyệt.
          </p>
        </div>
      )}

      {/* FULLSCREEN IMAGE PREVIEW MODAL */}
      {isPreviewOpen && uploadedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-6"
          onClick={() => setIsPreviewOpen(false)}
        >
          <div
            className="relative max-w-6xl w-full max-h-[90vh] flex flex-col items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setIsPreviewOpen(false)}
              className="absolute -top-12 right-0 p-2 text-white/80 hover:text-white rounded-full bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"
            >
              <X className="h-6 w-6" />
            </button>
            <img
              src={uploadedImage}
              alt="Xem ảnh kích thước đầy đủ"
              className="max-h-[85vh] w-auto max-w-full object-contain rounded-2xl border border-white/20 shadow-2xl"
            />
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB CONTENT 0: INFOGRAPHIC (IF AN IMAGE IS UPLOADED, SHOW INFOGRAPHIC CARD TOO) */}
      {/* ========================================================================= */}
      {activeTab === 'INFOGRAPHIC' && uploadedImage && (
        <div className="space-y-4">
          <div className="text-xs font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-2">
            <Layers className="h-4 w-4" />
            Bản đồ tư duy tóm tắt nội dung bài học:
          </div>
          <Lesson3InfographicCard />
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB CONTENT 1: TOY CAR SPEED EXPERIMENT SIMULATION ("XE ĐỒ CHƠI") */}
      {/* ========================================================================= */}
      {activeTab === 'TOY_CAR_EXPERIMENT' && (
        <div className="space-y-6">
          <div className="rounded-3xl border-2 border-amber-500/40 bg-[#08152B] p-6 sm:p-8 space-y-6 shadow-xl relative overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-amber-500/30 pb-4">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  <Car className="h-6 w-6" />
                </span>
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-amber-300 uppercase tracking-tight">
                    THỰC HÀNH: ĐO TỐC ĐỘ CỦA XE Ô TÔ ĐỒ CHƠI &amp; TÍNH SAI SỐ
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-300 font-medium">
                    Mô hình thực nghiệm kết nối Bài 3 &amp; Bài 6 SGK: Đo quãng đường <span className="font-mono text-cyan-300 font-bold">$s$</span>, đo thời gian <span className="font-mono text-cyan-300 font-bold">$t$</span>, tính tốc độ <span className="font-mono text-cyan-300 font-bold">$v = s/t$</span> và xác định sai số gián tiếp <span className="font-mono text-amber-300 font-bold">$\Delta v$</span>.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-mono font-bold border border-amber-500/40">
                  Thí nghiệm liên kết Bài 3
                </span>
              </div>
            </div>

            {/* Render full ToyCarSpeedExperimentSim */}
            <ToyCarSpeedExperimentSim compact={false} />
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB CONTENT 2: AUTOMATIC ERROR CALCULATOR */}
      {/* ========================================================================= */}
      {activeTab === 'CALCULATOR' && (
        <div className="space-y-6">
          <div className="rounded-3xl border-2 border-emerald-500/40 bg-[#08152B] p-6 sm:p-8 space-y-6 shadow-xl">
            <div className="border-b border-emerald-500/30 pb-4">
              <h2 className="text-xl sm:text-2xl font-black text-emerald-300 uppercase tracking-tight flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-base font-mono">
                  <Calculator className="h-5 w-5" />
                </span>
                CÔNG CỤ XỬ LÝ SỐ LIỆU &amp; TÍNH SAI SỐ TỰ ĐỘNG THEO CHUẨN SGK
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-1">
                Nhập số lần đo và số liệu thực nghiệm để tự động tính toán <InlinePhysicsText text="$\bar{A}$" />, <InlinePhysicsText text="$\overline{\Delta A}$" />, <InlinePhysicsText text="$\Delta A_{dc}$" />, <InlinePhysicsText text="$\Delta A$" />, <InlinePhysicsText text="$\delta A$" /> và xuất kết quả đo chuẩn SGK.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-black/40 border border-emerald-500/20 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Ký hiệu đại lượng đo:</label>
                  <input
                    type="text"
                    value={symbolStr}
                    onChange={(e) => setSymbolStr(e.target.value)}
                    className="w-full rounded-xl bg-[#061227] border border-cyan-500/30 px-3 py-2 text-sm font-mono text-cyan-300 font-bold focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Đơn vị đo:</label>
                  <input
                    type="text"
                    value={unitStr}
                    onChange={(e) => setUnitStr(e.target.value)}
                    className="w-full rounded-xl bg-[#061227] border border-cyan-500/30 px-3 py-2 text-sm font-mono text-cyan-300 font-bold focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Độ chia nhỏ nhất (ĐCNN):</label>
                  <input
                    type="number"
                    step="0.001"
                    value={dcnnVal}
                    onChange={(e) => setDcnnVal(parseFloat(e.target.value) || 0)}
                    className="w-full rounded-xl bg-[#061227] border border-amber-500/30 px-3 py-2 text-sm font-mono text-amber-300 font-bold focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Quy ước sai số dụng cụ:</label>
                  <select
                    value={errorFactor}
                    onChange={(e) => setErrorFactor(parseFloat(e.target.value))}
                    className="w-full rounded-xl bg-[#061227] border border-purple-500/30 px-3 py-2 text-xs font-medium text-purple-300 focus:outline-none focus:border-purple-400 cursor-pointer"
                  >
                    <option value={1}>Bằng 1 ĐCNN (Chuẩn SGK phổ thông)</option>
                    <option value={0.5}>Bằng 1/2 ĐCNN (Dụng cụ độ chính xác cao)</option>
                  </select>
                </div>
              </div>

              {/* Trials row */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300">Các giá trị đo được qua {n} lần:</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSampleValues([...sampleValues, sampleValues[sampleValues.length - 1] || 0])}
                      className="px-2.5 py-1 rounded-lg bg-cyan-500/20 text-cyan-300 text-xs font-bold hover:bg-cyan-500/30 border border-cyan-500/30 cursor-pointer"
                    >
                      + Thêm lần đo
                    </button>
                    {sampleValues.length > 3 && (
                      <button
                        onClick={() => setSampleValues(sampleValues.slice(0, -1))}
                        className="px-2.5 py-1 rounded-lg bg-rose-500/20 text-rose-300 text-xs font-bold hover:bg-rose-500/30 border border-rose-500/30 cursor-pointer"
                      >
                        - Bớt lần đo
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
                  {sampleValues.map((val, idx) => (
                    <div key={idx} className="p-2.5 rounded-xl bg-[#08152B] border border-cyan-500/20 text-center space-y-1">
                      <span className="text-[11px] font-mono text-slate-400">Lần {idx + 1} ({symbolStr}_{idx + 1})</span>
                      <input
                        type="number"
                        step="0.001"
                        value={val}
                        onChange={(e) => handleValueChange(idx, e.target.value)}
                        className="w-full rounded-lg bg-[#040C1A] border border-white/10 px-2 py-1.5 text-xs font-mono text-white text-center font-bold focus:outline-none focus:border-cyan-400"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Calculation Summary Table */}
              <div className="rounded-2xl border border-white/10 overflow-hidden">
                <div className="bg-[#051329] px-4 py-2.5 font-bold text-emerald-300 text-xs sm:text-sm flex items-center justify-between">
                  <span>BẢNG KẾT QUẢ XỬ LÝ SỐ LIỆU TỰ ĐỘNG</span>
                  <span className="font-mono text-cyan-300 font-bold">n = {n} lần đo</span>
                </div>
                <div className="p-4 bg-[#030914] space-y-4 text-xs sm:text-sm">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    <div className="p-3 rounded-xl bg-black/50 border border-cyan-500/20 space-y-1">
                      <span className="text-[11px] text-slate-400">1. Giá trị trung bình ({symbolStr}̄):</span>
                      <div className="text-base font-mono font-bold text-cyan-300">
                        {meanVal.toFixed(4)} {unitStr}
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-black/50 border border-emerald-500/20 space-y-1">
                      <span className="text-[11px] text-slate-400">2. Sai số ngẫu nhiên (Δ̄{symbolStr}):</span>
                      <div className="text-base font-mono font-bold text-emerald-300">
                        {randomErr.toFixed(4)} {unitStr}
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-black/50 border border-amber-500/20 space-y-1">
                      <span className="text-[11px] text-slate-400">3. Sai số tuyệt đối (Δ{symbolStr}):</span>
                      <div className="text-base font-mono font-bold text-amber-300">
                        {totalAbsErr.toFixed(4)} {unitStr}
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-black/50 border border-purple-500/20 space-y-1">
                      <span className="text-[11px] text-slate-400">4. Sai số tỉ đối (δ{symbolStr}):</span>
                      <div className="text-base font-mono font-bold text-purple-300">
                        {relErr.toFixed(2)}%
                      </div>
                    </div>
                  </div>

                  {/* Final recorded measurement banner */}
                  <div className="p-4 rounded-xl bg-gradient-to-r from-cyan-950/60 to-blue-950/60 border border-cyan-500/40 text-center space-y-1.5">
                    <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                      Ghi kết quả đo chuẩn xác theo quy định SGK:
                    </div>
                    <div className="text-lg sm:text-xl font-mono font-black text-cyan-300">
                      <InlinePhysicsText text={`$${symbolStr} = ${meanVal.toFixed(2)} \\pm ${totalAbsErr.toFixed(2)}\\text{ (${unitStr})}$`} />
                    </div>
                    <div className="text-[11px] text-slate-400">
                      (Hoặc: <span className="font-mono text-white">{symbolStr} = {meanVal.toFixed(2)} {unitStr} ± {relErr.toFixed(2)}%</span>)
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB CONTENT 3: FULL SGK THEORY (CHÍNH XÁC THEO SÁCH GIÁO KHOA VẬT LÍ 10) */}
      {/* ========================================================================= */}
      {activeTab === 'THEORY' && (
        <div className="space-y-8">
          {/* KHỞI ĐỘNG (MỞ ĐẦU BÀI HỌC) */}
          <div className="rounded-2xl border border-cyan-500/30 bg-[#0A1835]/90 p-5 sm:p-6 space-y-4 shadow-lg backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-sm font-black">
                  ?
                </span>
                <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-wide">
                  KHỞI ĐỘNG: CÂU HỎI MỞ ĐẦU TRANG 17 SGK
                </h3>
              </div>
              <button
                onClick={() => toggleSection('intro-q')}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all cursor-pointer"
              >
                {openSections['intro-q'] ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </button>
            </div>

            <p className="text-sm text-slate-200 leading-relaxed font-medium">
              <em>&ldquo;Để đo đường kính của một chiếc nắp chai hình tròn, bạn Nam dùng thước kẻ có ĐCNN là 1 mm đo được 5 lần với các giá trị: 3,2 cm; 3,1 cm; 3,2 cm; 3,3 cm; 3,2 cm. Theo em, vì sao các kết quả đo lại khác nhau? Giá trị nào gần đúng nhất với đường kính nắp chai và làm thế nào để biểu diễn kết quả đo một cách khoa học?&rdquo;</em>
            </p>

            {openSections['intro-q'] && (
              <div className="p-4 rounded-xl bg-[#061226] border border-cyan-500/20 text-xs sm:text-sm text-slate-300 space-y-2 animate-in fade-in duration-200">
                <div className="font-bold text-cyan-300 flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-cyan-400" />
                  Gợi ý trả lời &amp; Dẫn dắt bài học:
                </div>
                <p>
                  • <strong>Nguyên nhân kết quả khác nhau:</strong> Do sự không hoàn hảo của dụng cụ đo (sai số dụng cụ) và do thao tác đặt thước, góc nhìn của mắt bạn Nam ở mỗi lần đo có sự chênh lệch nhỏ (sai số ngẫu nhiên).
                </p>
                <p>
                  • <strong>Giá trị gần đúng nhất:</strong> Là <em>giá trị trung bình cộng</em> của 5 lần đo: <InlinePhysicsText text="$\bar{d} = \frac{3,2 + 3,1 + 3,2 + 3,3 + 3,2}{5} = 3,20\text{ cm}$" />.
                </p>
                <p>
                  • <strong>Biểu diễn khoa học:</strong> Cần kèm theo sai số của phép đo theo đúng quy tắc SGK: <span className="font-mono text-cyan-300 font-bold"><InlinePhysicsText text="$d = \bar{d} \pm \Delta d = 3,2 \pm 0,1\text{ (cm)}$" /></span>.
                </p>
              </div>
            )}
          </div>

          {/* ========================================================================= */}
          {/* MỤC I. PHÉP ĐO TRỰC TIẾP VÀ PHÉP ĐO GIÁN TIẾP */}
          {/* ========================================================================= */}
          <div className="rounded-3xl border-2 border-cyan-500/40 bg-[#08152B] p-6 sm:p-8 space-y-6 shadow-xl relative overflow-hidden">
            <div className="border-b border-cyan-500/30 pb-4">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-cyan-300 uppercase tracking-tight flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-base font-mono">I</span>
                PHÉP ĐO TRỰC TIẾP VÀ PHÉP ĐO GIÁN TIẾP
              </h2>
            </div>

            <div className="space-y-6">
              {/* 1. Phép đo trực tiếp */}
              <div className="rounded-2xl bg-black/40 border border-cyan-500/20 p-5 space-y-3">
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  <span className="text-cyan-400 font-mono">1.</span>
                  Phép đo trực tiếp
                </h3>
                <p className="text-sm text-slate-200 leading-relaxed font-medium">
                  <strong>Phép đo trực tiếp</strong> là phép so sánh trực tiếp đại lượng cần đo với dụng cụ đo tiêu chuẩn (mang đơn vị chuẩn).
                </p>
                <div className="p-4 rounded-xl bg-[#0C1B38] border border-cyan-500/20 space-y-2 text-xs sm:text-sm text-slate-300">
                  <div className="font-bold text-cyan-300 flex items-center gap-1.5">
                    <Lightbulb className="h-4 w-4 text-cyan-400" />
                    Các ví dụ thực tế về phép đo trực tiếp:
                  </div>
                  <ul className="space-y-1.5 pl-4 list-disc marker:text-cyan-400">
                    <li>Dùng <strong>thước kẻ / thước cuộn / thước kẹp</strong> có vạch chia để đo chiều dài của một cái bàn hoặc đường kính một quả cầu.</li>
                    <li>Dùng <strong>cân đòn / cân đồng hồ / cân điện tử</strong> để đo khối lượng của một vật thể.</li>
                    <li>Dùng <strong>nhiệt kế thủy ngân / nhiệt kế điện tử</strong> để đo nhiệt độ của một cốc nước.</li>
                    <li>Dùng <strong>đồng hồ bấm giây / đồng hồ hiện số</strong> để đo thời gian rơi tự do của một viên bi.</li>
                  </ul>
                </div>
              </div>

              {/* 2. Phép đo gián tiếp */}
              <div className="rounded-2xl bg-black/40 border border-blue-500/20 p-5 space-y-3">
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  <span className="text-blue-400 font-mono">2.</span>
                  Phép đo gián tiếp
                </h3>
                <p className="text-sm text-slate-200 leading-relaxed font-medium">
                  <strong>Phép đo gián tiếp</strong> là phép xác định giá trị của một đại lượng thông qua công thức toán học thể hiện mối quan hệ giữa đại lượng đó với các đại lượng được đo trực tiếp.
                </p>
                <div className="p-4 rounded-xl bg-[#0C1B38] border border-blue-500/20 space-y-2 text-xs sm:text-sm text-slate-300">
                  <div className="font-bold text-blue-300 flex items-center gap-1.5">
                    <Lightbulb className="h-4 w-4 text-blue-400" />
                    Các ví dụ thực tế về phép đo gián tiếp:
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                    <div className="p-3 rounded-lg bg-black/30 border border-white/10 space-y-1">
                      <span className="font-bold text-white text-xs">Xác định khối lượng riêng (D):</span>
                      <div className="font-mono text-cyan-300 text-xs">
                        <InlinePhysicsText text="$D = \frac{m}{V}$" />
                      </div>
                      <p className="text-[11px] text-slate-400">Đo trực tiếp khối lượng $m$ bằng cân và đo thể tích $V$ bằng bình chia độ.</p>
                    </div>

                    <div className="p-3 rounded-lg bg-black/30 border border-white/10 space-y-1">
                      <span className="font-bold text-white text-xs">Xác định tốc độ chuyển động (v):</span>
                      <div className="font-mono text-cyan-300 text-xs">
                        <InlinePhysicsText text="$v = \frac{s}{t}$" />
                      </div>
                      <p className="text-[11px] text-slate-400">Đo trực tiếp quãng đường $s$ bằng thước và thời gian $t$ bằng đồng hồ bấm giây.</p>
                    </div>

                    <div className="p-3 rounded-lg bg-black/30 border border-white/10 space-y-1">
                      <span className="font-bold text-white text-xs">Xác định thể tích khối trụ (V):</span>
                      <div className="font-mono text-cyan-300 text-xs">
                        <InlinePhysicsText text="$V = \frac{\pi d^2 h}{4}$" />
                      </div>
                      <p className="text-[11px] text-slate-400">Đo trực tiếp đường kính $d$ và chiều cao $h$ bằng thước kẹp.</p>
                    </div>

                    <div className="p-3 rounded-lg bg-black/30 border border-white/10 space-y-1">
                      <span className="font-bold text-white text-xs">Xác định gia tốc trọng trường (g):</span>
                      <div className="font-mono text-cyan-300 text-xs">
                        <InlinePhysicsText text="$g = \frac{2s}{t^2}$" />
                      </div>
                      <p className="text-[11px] text-slate-400">Đo trực tiếp quãng đường rơi $s$ và thời gian rơi $t$ qua cổng quang điện.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bảng so sánh trực tiếp vs gián tiếp */}
              <div className="rounded-2xl border border-cyan-500/20 overflow-hidden">
                <div className="bg-[#0A1835] px-4 py-2.5 text-xs sm:text-sm font-bold text-cyan-300 uppercase tracking-wider">
                  BẢNG SO SÁNH PHÉP ĐO TRỰC TIẾP VÀ PHÉP ĐO GIÁN TIẾP
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs sm:text-sm text-slate-300">
                    <thead className="bg-[#051124] text-white border-b border-white/10 font-bold">
                      <tr>
                        <th className="p-3">Tiêu chí</th>
                        <th className="p-3 text-cyan-300">Phép đo trực tiếp</th>
                        <th className="p-3 text-blue-300">Phép đo gián tiếp</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 bg-[#030914]">
                      <tr>
                        <td className="p-3 font-semibold text-white">Cách thực hiện</td>
                        <td className="p-3">Đọc trực tiếp số liệu hiển thị trên thang chia của dụng cụ đo.</td>
                        <td className="p-3">Tính toán qua công thức toán học từ các đại lượng đo trực tiếp.</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-semibold text-white">Dụng cụ sử dụng</td>
                        <td className="p-3">Chỉ cần 1 dụng cụ đo chuyên dụng (thước, cân, nhiệt kế).</td>
                        <td className="p-3">Cần phối hợp nhiều dụng cụ đo khác nhau.</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-semibold text-white">Cách tính sai số</td>
                        <td className="p-3">Sai số gồm sai số dụng cụ và sai số ngẫu nhiên qua các lần đo.</td>
                        <td className="p-3">Tính theo quy tắc lan truyền sai số (tổng sai số tỉ đối/tuyệt đối).</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* MỤC II. PHÂN LOẠI SAI SỐ CỦA PHÉP ĐO */}
          {/* ========================================================================= */}
          <div className="rounded-3xl border-2 border-amber-500/40 bg-[#08152B] p-6 sm:p-8 space-y-6 shadow-xl relative overflow-hidden">
            <div className="border-b border-amber-500/30 pb-4">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-amber-300 uppercase tracking-tight flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 text-base font-mono">II</span>
                PHÂN LOẠI SAI SỐ CỦA PHÉP ĐO
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 font-medium">
                Trong mọi phép đo vật lí, kết quả thu được không bao giờ tuyệt đối chính xác mà luôn tồn tại độ lệch gọi là <strong>sai số phép đo</strong>.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 1. Sai số hệ thống */}
              <div className="rounded-2xl bg-black/40 border border-amber-500/30 p-5 space-y-3 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
                      <AlertTriangle className="h-5 w-5" />
                    </span>
                    <h3 className="text-lg font-black text-white">1. Sai số hệ thống (Systematic Error)</h3>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                    Là sai số có <strong>tính quy luật</strong>, làm cho kết quả đo luôn luôn lệch về một phía (luôn lớn hơn hoặc luôn nhỏ hơn giá trị thực) một lượng không đổi hoặc biến đổi theo quy luật xác định.
                  </p>
                  <div className="p-3.5 rounded-xl bg-[#141208] border border-amber-500/20 text-xs text-slate-300 space-y-1.5">
                    <span className="font-bold text-amber-300">Nguyên nhân chủ yếu:</span>
                    <ul className="list-disc pl-4 space-y-1 marker:text-amber-400">
                      <li><strong>Sai số do dụng cụ đo:</strong> Do cấu tạo, độ chia nhỏ nhất hoặc sai số chế tạo (kí hiệu <InlinePhysicsText text="$\Delta A_{dc}$" />). Thường lấy bằng 1 độ chia nhỏ nhất (hoặc 1/2 ĐCNN).</li>
                      <li><strong>Sai lệch điểm không (Zero error):</strong> Kim cân hoặc kim vôn kế trước khi đo chưa được hiệu chỉnh về đúng vạch số 0.</li>
                    </ul>
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-500/30 text-xs text-amber-200">
                  <strong>Cách khắc phục:</strong> Hiệu chỉnh điểm 0 của thiết bị trước khi đo, chọn dụng cụ có độ chính xác cao hơn, trừ bớt độ lệch điểm 0 trong quá trình tính toán.
                </div>
              </div>

              {/* 2. Sai số ngẫu nhiên */}
              <div className="rounded-2xl bg-black/40 border border-cyan-500/30 p-5 space-y-3 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400">
                      <Activity className="h-5 w-5" />
                    </span>
                    <h3 className="text-lg font-black text-white">2. Sai số ngẫu nhiên (Random Error)</h3>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                    Là sai số xuất hiện <strong>không có quy luật</strong> rõ ràng, làm kết quả đo phân tán ngẫu nhiên ở hai phía (lúc lớn hơn, lúc nhỏ hơn giá trị thực) giữa các lần đo lặp lại.
                  </p>
                  <div className="p-3.5 rounded-xl bg-[#061226] border border-cyan-500/20 text-xs text-slate-300 space-y-1.5">
                    <span className="font-bold text-cyan-300">Nguyên nhân chủ yếu:</span>
                    <ul className="list-disc pl-4 space-y-1 marker:text-cyan-400">
                      <li>Do sự không đồng đều của thao tác đo (ví dụ: bấm đồng hồ nhanh hay chậm một vài tích tắc).</li>
                      <li>Do hạn chế về giác quan của người làm thí nghiệm (mắt nhìn vạch chia ở các góc nghiêng khác nhau).</li>
                      <li>Do điều kiện môi trường thay đổi đột ngột (gió thổi nhẹ, rung động bàn thí nghiệm, biến động điện áp nguồn).</li>
                    </ul>
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-500/30 text-xs text-cyan-200">
                  <strong>Cách khắc phục:</strong> Thực hiện phép đo <strong>nhiều lần</strong> (thường từ 3 đến 5 lần) trong cùng điều kiện và lấy giá trị <em>trung bình cộng</em> để bù trừ các sai lệch ngẫu nhiên.
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* MỤC III. CÁCH XÁC ĐỊNH VÀ BIỂU DIỄN SAI SỐ PHÉP ĐO */}
          {/* ========================================================================= */}
          <div className="rounded-3xl border-2 border-emerald-500/40 bg-[#08152B] p-6 sm:p-8 space-y-6 shadow-xl relative overflow-hidden">
            <div className="border-b border-emerald-500/30 pb-4">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-emerald-300 uppercase tracking-tight flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-base font-mono">III</span>
                CÁCH XÁC ĐỊNH VÀ BIỂU DIỄN SAI SỐ PHÉP ĐO
              </h2>
            </div>

            <div className="space-y-6">
              {/* 1. Giá trị trung bình */}
              <div className="p-5 rounded-2xl bg-black/40 border border-emerald-500/20 space-y-3">
                <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                  <span className="text-emerald-400 font-mono">1.</span>
                  Giá trị trung bình khi đo n lần
                </h3>
                <p className="text-xs sm:text-sm text-slate-200">
                  Khi đo $n$ lần cùng một đại lượng $A$, ta nhận được các giá trị $A_1, A_2, ..., A_n$. Giá trị trung bình được tính bằng công thức:
                </p>
                <div className="p-4 rounded-xl bg-[#061814] border border-emerald-500/30 text-center">
                  <MathFormula
                    formula="\bar{A} = \frac{A_1 + A_2 + ... + A_n}{n}"
                    description="Giá trị trung bình đại diện cho kết quả gần đúng nhất của đại lượng đo A."
                  />
                </div>
              </div>

              {/* 2. Sai số ngẫu nhiên tuyệt đối */}
              <div className="p-5 rounded-2xl bg-black/40 border border-cyan-500/20 space-y-3">
                <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                  <span className="text-cyan-400 font-mono">2.</span>
                  Sai số tuyệt đối của từng lần đo và sai số ngẫu nhiên tuyệt đối trung bình
                </h3>
                <p className="text-xs sm:text-sm text-slate-200">
                  • Sai số tuyệt đối của lần đo thứ $i$ là độ lệch giữa giá trị đo $A_i$ và giá trị trung bình <InlinePhysicsText text="$\bar{A}$" />:
                </p>
                <div className="p-3 rounded-xl bg-[#061226] border border-cyan-500/20 text-center font-mono text-cyan-300 text-sm">
                  <InlinePhysicsText text="$\Delta A_i = |\bar{A} - A_i|$" />
                </div>
                <p className="text-xs sm:text-sm text-slate-200 pt-2">
                  • <strong>Sai số ngẫu nhiên tuyệt đối trung bình</strong> của $n$ lần đo là trung bình cộng của các sai số tuyệt đối từng lần:
                </p>
                <div className="p-4 rounded-xl bg-[#061226] border border-cyan-500/30 text-center">
                  <MathFormula
                    formula="\overline{\Delta A} = \frac{\Delta A_1 + \Delta A_2 + ... + \Delta A_n}{n}"
                    description="Sai số ngẫu nhiên tuyệt đối trung bình phản ánh độ phân tán của các lần đo quanh giá trị trung bình."
                  />
                </div>
              </div>

              {/* 3. Sai số tuyệt đối toàn phần */}
              <div className="p-5 rounded-2xl bg-black/40 border border-amber-500/20 space-y-3">
                <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                  <span className="text-amber-400 font-mono">3.</span>
                  Sai số tuyệt đối toàn phần của phép đo
                </h3>
                <p className="text-xs sm:text-sm text-slate-200">
                  Sai số tuyệt đối của phép đo là tổng của sai số ngẫu nhiên và sai số dụng cụ:
                </p>
                <div className="p-4 rounded-xl bg-[#141208] border border-amber-500/30 text-center">
                  <MathFormula
                    formula="\Delta A = \overline{\Delta A} + \Delta A_{dc}"
                    description="Trong đó ΔA_dc là sai số dụng cụ (thường lấy bằng 1 độ chia nhỏ nhất hoặc nửa độ chia nhỏ nhất)."
                  />
                </div>
              </div>

              {/* 4. Sai số tỉ đối */}
              <div className="p-5 rounded-2xl bg-black/40 border border-purple-500/20 space-y-3">
                <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                  <span className="text-purple-400 font-mono">4.</span>
                  Sai số tỉ đối (Relative Error)
                </h3>
                <p className="text-xs sm:text-sm text-slate-200">
                  <strong>Sai số tỉ đối</strong> là tỉ số phần trăm giữa sai số tuyệt đối và giá trị trung bình của đại lượng đo:
                </p>
                <div className="p-4 rounded-xl bg-[#130821] border border-purple-500/30 text-center">
                  <MathFormula
                    formula="\delta A = \frac{\Delta A}{\bar{A}} \times 100\%"
                    description="Sai số tỉ đối càng nhỏ chứng tỏ phép đo càng chính xác."
                  />
                </div>
              </div>

              {/* 5. Quy tắc xác định sai số của phép đo gián tiếp */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-[#0C152B] to-[#040C1A] border-2 border-cyan-500/30 space-y-4">
                <div className="flex items-center gap-2 text-cyan-300 font-black text-base sm:text-lg uppercase">
                  <Sparkles className="h-5 w-5 text-cyan-400" />
                  5. Quy tắc lan truyền sai số cho phép đo gián tiếp
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm">
                  {/* Quy tắc 1: Tổng và Hiệu */}
                  <div className="p-4 rounded-xl bg-black/40 border border-cyan-500/20 space-y-2">
                    <span className="font-bold text-cyan-300">Quy tắc 1 (Tổng &amp; Hiệu):</span>
                    <p className="text-slate-200">
                      Nếu <InlinePhysicsText text="$X = A + B$" /> hoặc <InlinePhysicsText text="$X = A - B$" /> thì <strong>sai số tuyệt đối</strong> của tổng/hiệu bằng tổng các sai số tuyệt đối:
                    </p>
                    <div className="p-2.5 rounded-lg bg-[#061226] font-mono text-cyan-300 font-bold text-center">
                      <InlinePhysicsText text="$\Delta X = \Delta A + \Delta B$" />
                    </div>
                  </div>

                  {/* Quy tắc 2: Tích và Thương */}
                  <div className="p-4 rounded-xl bg-black/40 border border-purple-500/20 space-y-2">
                    <span className="font-bold text-purple-300">Quy tắc 2 (Tích &amp; Thương):</span>
                    <p className="text-slate-200">
                      Nếu <InlinePhysicsText text="$X = A \times B$" /> hoặc <InlinePhysicsText text="$X = \frac{A}{B}$" /> thì <strong>sai số tỉ đối</strong> của tích/thương bằng tổng các sai số tỉ đối:
                    </p>
                    <div className="p-2.5 rounded-lg bg-[#120626] font-mono text-purple-300 font-bold text-center">
                      <InlinePhysicsText text="$\delta X = \delta A + \delta B$" />
                    </div>
                  </div>

                  {/* Quy tắc 3: Lũy thừa */}
                  <div className="p-4 rounded-xl bg-black/40 border border-amber-500/20 space-y-2 md:col-span-2">
                    <span className="font-bold text-amber-300">Quy tắc 3 (Lũy thừa):</span>
                    <p className="text-slate-200">
                      Nếu <InlinePhysicsText text="$X = A^m \times B^n$" /> hoặc <InlinePhysicsText text="$X = \frac{A^m}{B^n}$" /> thì sai số tỉ đối là:
                    </p>
                    <div className="p-2.5 rounded-lg bg-[#160E04] font-mono text-amber-300 font-bold text-center">
                      <InlinePhysicsText text="$\delta X = m \cdot \delta A + n \cdot \delta B$" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* MỤC IV. CÁCH GHI KẾT QUẢ ĐO VÀ CHỮ SỐ CÓ NGHĨA */}
          {/* ========================================================================= */}
          <div className="rounded-3xl border-2 border-cyan-500/40 bg-[#08152B] p-6 sm:p-8 space-y-6 shadow-xl relative overflow-hidden">
            <div className="border-b border-cyan-500/30 pb-4">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-cyan-300 uppercase tracking-tight flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-base font-mono">IV</span>
                CÁCH GHI KẾT QUẢ ĐO VÀ QUY TẮC CHỮ SỐ CÓ NGHĨA
              </h2>
            </div>

            <div className="space-y-6">
              {/* Dạng biểu diễn chuẩn SGK */}
              <div className="p-5 rounded-2xl bg-black/40 border border-cyan-500/30 space-y-3 text-center">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  CÔNG THỨC BIỂU DIỄN KẾT QUẢ PHÉP ĐO CHUẨN SGK:
                </span>
                <div className="py-2">
                  <MathFormula
                    formula="A = \bar{A} \pm \Delta A \quad (\text{đơn vị})"
                    description="Kết quả đo được viết dưới dạng một khoảng giá trị từ (Ā - ΔA) đến (Ā + ΔA)."
                  />
                </div>
                <div className="text-xs text-slate-400">
                  (Hoặc biểu diễn theo sai số tỉ đối: <span className="font-mono text-cyan-300 font-bold"><InlinePhysicsText text="$A = \bar{A} \pm \delta A\%$" /></span>)
                </div>
              </div>

              {/* Quy tắc làm tròn chữ số có nghĩa */}
              <div className="p-5 rounded-2xl bg-[#07132B] border border-white/10 space-y-3">
                <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  Quy tắc làm tròn chữ số có nghĩa (Significant Figures):
                </h3>
                <ul className="space-y-2 text-xs sm:text-sm text-slate-300 pl-4 list-disc marker:text-cyan-400">
                  <li><strong>Sai số tuyệt đối <InlinePhysicsText text="$\Delta A$" /></strong> thường được làm tròn đến <strong>1 chữ số có nghĩa</strong> (hoặc tối đa 2 chữ số nếu chữ số đầu tiên là 1 hoặc 2).</li>
                  <li><strong>Giá trị trung bình <InlinePhysicsText text="$\bar{A}$" /></strong> được làm tròn đến bậc thập phân tương ứng với sai số tuyệt đối <InlinePhysicsText text="$\Delta A$" />.</li>
                  <li>
                    <em>Ví dụ chuẩn SGK:</em> Tính ra <InlinePhysicsText text="$\bar{d} = 12,3456\text{ mm}$" /> và <InlinePhysicsText text="$\Delta d = 0,0182\text{ mm}$" />. Làm tròn sai số <InlinePhysicsText text="$\Delta d \approx 0,02\text{ mm}$" />, làm tròn trung bình <InlinePhysicsText text="$\bar{d} \approx 12,35\text{ mm}$" />. Ghi kết quả: <span className="font-mono text-cyan-300 font-bold"><InlinePhysicsText text="$d = 12,35 \pm 0,02\text{ (mm)}$" /></span>.
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* MỤC V. TỔNG KẾT BÀI HỌC: EM ĐÃ HỌC & EM CÓ THỂ */}
          {/* ========================================================================= */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Em đã học */}
            <div className="rounded-3xl border border-cyan-500/30 bg-[#061226] p-6 space-y-3.5 shadow-lg">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-lg bg-cyan-500/20 text-cyan-400">
                  <CheckCircle2 className="h-5 w-5" />
                </span>
                <h3 className="text-base font-black text-white uppercase tracking-wide">
                  EM ĐÃ HỌC (GHI NHỚ CỐT LÕI)
                </h3>
              </div>
              <ul className="space-y-2 text-xs sm:text-sm text-slate-300 pl-2">
                <li className="flex items-start gap-2">
                  <span className="text-cyan-400 font-bold">•</span>
                  <span>Phép đo trực tiếp (so sánh với dụng cụ đo) và phép đo gián tiếp (tính qua công thức toán học).</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cyan-400 font-bold">•</span>
                  <span>Sai số hệ thống (do dụng cụ, điểm 0) và sai số ngẫu nhiên (do thao tác, giác quan con người).</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cyan-400 font-bold">•</span>
                  <span>Công thức tính sai số tuyệt đối: <InlinePhysicsText text="$\Delta A = \overline{\Delta A} + \Delta A_{dc}$" /> và sai số tỉ đối: <InlinePhysicsText text="$\delta A = \frac{\Delta A}{\bar{A}} \times 100\%$" />.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cyan-400 font-bold">•</span>
                  <span>Quy tắc ghi kết quả phép đo chuẩn SGK: <InlinePhysicsText text="$A = \bar{A} \pm \Delta A \quad (\text{đơn vị})$" />.</span>
                </li>
              </ul>
            </div>

            {/* Em có thể */}
            <div className="rounded-3xl border border-blue-500/30 bg-[#061226] p-6 space-y-3.5 shadow-lg">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-lg bg-blue-500/20 text-blue-400">
                  <Sparkles className="h-5 w-5" />
                </span>
                <h3 className="text-base font-black text-white uppercase tracking-wide">
                  EM CÓ THỂ (VẬN DỤNG THỰC TẾ)
                </h3>
              </div>
              <ul className="space-y-2 text-xs sm:text-sm text-slate-300 pl-2">
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 font-bold">•</span>
                  <span>Sử dụng thành thạo thước kẹp (Vernier), panme (Micrometer) và đồng hồ hiện số nối cổng quang điện.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 font-bold">•</span>
                  <span>Thực hành đo tốc độ xe đồ chơi, phân tích sai số phản xạ bấm tay so với đo tự động qua cổng quang.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 font-bold">•</span>
                  <span>Lập bảng số liệu thực nghiệm và tính toán chính xác sai số cho bất kỳ bài thực hành thí nghiệm Vật lí nào.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
