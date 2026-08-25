import React, { useState, useEffect, useRef } from 'react';
import { Upload, Maximize2, Download, Trash2, X, Image as ImageIcon, CheckCircle2 } from 'lucide-react';
import { savePortraitToDB, loadPortraitFromDB, deletePortraitFromDB, compressImage } from '../../utils/imageStorage';

interface SafetyImageCard16x9Props {
  id: string;
  title: string;
  subtitle?: string;
  defaultSvgIllustration: React.ReactNode;
}

export const SafetyImageCard16x9: React.FC<SafetyImageCard16x9Props> = ({
  id,
  title,
  subtitle,
  defaultSvgIllustration,
}) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load persistent image from IndexedDB on mount
  useEffect(() => {
    let isMounted = true;
    const fetchSavedImage = async () => {
      try {
        const saved = await loadPortraitFromDB(`safety_16x9_${id}`);
        if (saved && isMounted) {
          setImageUrl(saved);
        }
      } catch (err) {
        console.error(`Error loading saved image for ${id}:`, err);
      }
    };
    fetchSavedImage();
    return () => {
      isMounted = false;
    };
  }, [id]);

  const executeFileUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Vui lòng chọn tệp định dạng hình ảnh (PNG, JPG, WEBP).');
      return;
    }

    try {
      setIsUploading(true);
      const compressed = await compressImage(file, 1920);
      setImageUrl(compressed);
      await savePortraitToDB(`safety_16x9_${id}`, compressed);
    } catch (err) {
      console.error('Lỗi khi tải hoặc lưu ảnh:', err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileUpload = (file: File) => {
    executeFileUpload(file);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
    e.target.value = '';
  };

  const handleTriggerUpload = () => {
    fileInputRef.current?.click();
  };

  const executeRemoveImage = async () => {
    setImageUrl(null);
    await deletePortraitFromDB(`safety_16x9_${id}`);
  };

  const handleRemoveImage = () => {
    executeRemoveImage();
  };

  const handleDownload = () => {
    if (imageUrl) {
      const a = document.createElement('a');
      a.href = imageUrl;
      a.download = `${id}_16x9_illustration.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      executeFileUpload(file);
    }
  };

  return (
    <div
      id={`safety_card_${id}`}
      className="rounded-2xl border border-white/15 bg-[#0A1324]/90 p-4 sm:p-6 shadow-xl backdrop-blur-md transition-all space-y-4"
    >
      {/* Header with Title and Control Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#00D4FF]/20 text-[#00D4FF] border border-[#00D4FF]/30 shrink-0">
            <ImageIcon className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-base sm:text-lg font-bold text-white leading-snug">
              {title}
            </h4>
            {subtitle && (
              <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>
            )}
          </div>
        </div>

        {/* Action Button Group */}
        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleInputChange}
          />

          <button
            onClick={handleTriggerUpload}
            disabled={isUploading}
            className={`flex items-center gap-2 rounded-xl border px-3.5 py-2 text-xs sm:text-sm font-bold transition-all cursor-pointer shadow-md ${
              imageUrl
                ? 'border-cyan-500/40 bg-cyan-500/20 text-[#00D4FF] hover:bg-cyan-500/30'
                : 'border-amber-500/60 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 text-slate-950 hover:brightness-110 font-extrabold shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:scale-[1.02]'
            }`}
          >
            <Upload className="h-4 w-4" />
            <span>{isUploading ? 'Đang tải...' : imageUrl ? 'Đổi ảnh khác' : 'Tải ảnh lên (16:9)'}</span>
          </button>

          {imageUrl && (
            <>
              <button
                onClick={() => setIsPreviewOpen(true)}
                title="Xem ảnh phóng to"
                className="p-2 rounded-xl border border-cyan-500/30 bg-cyan-950/40 hover:bg-cyan-900/60 text-cyan-300 transition-colors cursor-pointer"
              >
                <Maximize2 className="h-4 w-4" />
              </button>
              <button
                onClick={handleDownload}
                title="Tải ảnh về máy"
                className="p-2 rounded-xl border border-white/10 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                <Download className="h-4 w-4" />
              </button>
              <button
                onClick={handleRemoveImage}
                title="Xóa ảnh tùy chỉnh (Khôi phục minh họa chuẩn)"
                className="p-2 rounded-xl border border-rose-500/30 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 transition-colors cursor-pointer"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* 16:9 Aspect Ratio Display Frame */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`relative w-full aspect-video rounded-2xl overflow-hidden border transition-all flex items-center justify-center bg-[#050B14] group ${
          isDragging
            ? 'border-[#00D4FF] bg-[#00D4FF]/10 scale-[0.99]'
            : 'border-white/15 hover:border-cyan-500/40 shadow-2xl'
        }`}
      >
        {imageUrl ? (
          <>
            <img
              src={imageUrl}
              alt={title}
              onClick={() => setIsPreviewOpen(true)}
              className="w-full h-full object-contain cursor-pointer transition-transform duration-300 group-hover:scale-[1.01]"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none gap-3">
              <button
                type="button"
                onClick={() => setIsPreviewOpen(true)}
                className="pointer-events-auto flex items-center gap-2 rounded-xl bg-black/80 backdrop-blur-md px-3.5 py-2 text-xs sm:text-sm font-bold text-white border border-[#00D4FF]/40 shadow-xl cursor-pointer hover:bg-black/95 transition-all"
              >
                <Maximize2 className="h-4 w-4 text-[#00D4FF]" />
                <span>Xem kích thước đầy đủ</span>
              </button>
              <button
                type="button"
                onClick={handleTriggerUpload}
                className="pointer-events-auto flex items-center gap-2 rounded-xl bg-cyan-950/90 backdrop-blur-md px-3.5 py-2 text-xs sm:text-sm font-bold text-[#00D4FF] border border-[#00D4FF]/50 shadow-xl cursor-pointer hover:bg-cyan-900 transition-all"
              >
                <Upload className="h-4 w-4" />
                <span>Đổi ảnh</span>
              </button>
            </div>
            <div className="absolute bottom-2 left-3 flex items-center gap-1.5 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-lg border border-emerald-500/40 text-[11px] text-emerald-300">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
              <span>Khung hình 16:9 • Đã lưu tự động</span>
            </div>
          </>
        ) : (
          <div className="relative w-full h-full flex flex-col items-center justify-center">
            {/* SVG Visual illustration */}
            <div className="w-full h-full flex items-center justify-center p-2">
              {defaultSvgIllustration}
            </div>

            {/* Quick upload overlay banner at bottom */}
            <div className="absolute bottom-3 inset-x-3 sm:inset-x-6 flex items-center justify-between gap-2 rounded-xl bg-slate-950/85 backdrop-blur-md p-2.5 sm:p-3 border border-white/10 shadow-lg">
              <span className="text-xs text-slate-300 hidden sm:inline">
                Khung hiển thị chuẩn tỉ lệ 16:9 • Hỗ trợ kéo thả ảnh hoặc nhấn tải lên
              </span>
              <button
                type="button"
                onClick={handleTriggerUpload}
                className="flex items-center gap-2 rounded-lg bg-[#00D4FF]/20 hover:bg-[#00D4FF]/30 px-3 py-1.5 text-xs font-bold text-[#00D4FF] border border-[#00D4FF]/40 cursor-pointer ml-auto transition-all"
              >
                <Upload className="h-3.5 w-3.5" />
                <span>Tải ảnh của bạn</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Lightbox / Fullscreen Modal */}
      {isPreviewOpen && imageUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-200"
          onClick={() => setIsPreviewOpen(false)}
        >
          <div
            className="relative max-w-5xl w-full max-h-[90vh] flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full flex items-center justify-between pb-3 text-white border-b border-white/10 mb-3">
              <span className="font-bold text-base sm:text-lg">{title} (Tỉ lệ 16:9)</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownload}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white cursor-pointer"
                  title="Tải ảnh về máy"
                >
                  <Download className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setIsPreviewOpen(false)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white cursor-pointer"
                  title="Đóng"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            <img
              src={imageUrl}
              alt={title}
              className="max-h-[80vh] w-auto object-contain rounded-2xl border border-white/20 shadow-2xl"
            />
          </div>
        </div>
      )}
    </div>
  );
};
