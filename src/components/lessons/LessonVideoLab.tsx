import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Upload, 
  Play, 
  Pause, 
  RotateCcw, 
  Trash2, 
  Film, 
  Volume2, 
  VolumeX, 
  Maximize2, 
  FileVideo, 
  AlertCircle,
  BookOpen,
  Layers,
  CloudUpload,
  Link as LinkIcon,
  Loader2,
  CheckCircle2,
  Plus
} from 'lucide-react';
import { Lesson } from '../../types/physics';
import { 
  StoredLessonVideo,
  getLessonVideos, 
  addLessonVideoFromFile, 
  addLessonVideoFromUrl, 
  deleteLessonVideo, 
  clearAllLessonVideos 
} from '../../utils/videoStorage';

interface LessonVideoLabProps {
  lesson: Lesson;
  onBackToLesson?: () => void;
}

export const LessonVideoLab: React.FC<LessonVideoLabProps> = ({ lesson, onBackToLesson }) => {
  const [videos, setVideos] = useState<StoredLessonVideo[]>([]);
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'file' | 'url'>('file');
  const [urlTitle, setUrlTitle] = useState('');
  const [urlInput, setUrlInput] = useState('');
  
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [playbackRate, setPlaybackRate] = useState<number>(1);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Load videos from IndexedDB
  const refreshVideos = async (selectNewestId?: string) => {
    setIsLoading(true);
    try {
      const list = await getLessonVideos(lesson.id);
      setVideos(list);
      if (selectNewestId) {
        setSelectedVideoId(selectNewestId);
      } else if (list.length > 0 && (!selectedVideoId || !list.some(v => v.id === selectedVideoId))) {
        setSelectedVideoId(list[0].id);
      } else if (list.length === 0) {
        setSelectedVideoId(null);
      }
    } catch (err) {
      console.error('Error fetching videos:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshVideos();
  }, [lesson.id]);

  // Find active video
  const activeVideo = useMemo(() => {
    return videos.find(v => v.id === selectedVideoId) || (videos.length > 0 ? videos[0] : null);
  }, [videos, selectedVideoId]);

  // Active video source object URL
  const activeVideoSrc = useMemo(() => {
    if (!activeVideo) return null;
    if (activeVideo.blob) {
      return URL.createObjectURL(activeVideo.blob);
    }
    return activeVideo.url || null;
  }, [activeVideo]);

  // Clean up object URLs when switching
  useEffect(() => {
    return () => {
      if (activeVideoSrc && activeVideo?.blob) {
        URL.revokeObjectURL(activeVideoSrc);
      }
    };
  }, [activeVideoSrc, activeVideo]);

  // Reset playback state when active video changes
  useEffect(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
  }, [selectedVideoId]);

  const executeFileUpload = async (file: File) => {
    setErrorMessage(null);
    if (!file.type.startsWith('video/')) {
      setErrorMessage('Vui lòng chọn tệp video hợp lệ (MP4, WebM, MOV, OGG).');
      return;
    }

    setIsUploading(true);
    try {
      const newVideo = await addLessonVideoFromFile(lesson.id, file);
      await refreshVideos(newVideo.id);
    } catch (err) {
      console.error('Upload failed:', err);
      setErrorMessage('Không thể lưu video vào trình duyệt.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileUpload = (file: File) => {
    executeFileUpload(file);
  };

  const executeAddUrl = async () => {
    if (!urlInput.trim()) return;

    setIsUploading(true);
    try {
      const newVideo = await addLessonVideoFromUrl(lesson.id, urlTitle, urlInput.trim());
      setUrlTitle('');
      setUrlInput('');
      await refreshVideos(newVideo.id);
    } catch (err) {
      console.error('Error adding url:', err);
      setErrorMessage('Không thể thêm video từ URL.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;
    executeAddUrl();
  };

  const executeDeleteVideo = async (videoId: string) => {
    if (videoRef.current && selectedVideoId === videoId) {
      videoRef.current.pause();
    }
    await deleteLessonVideo(videoId);
    await refreshVideos();
  };

  const handleDeleteVideo = (e: React.MouseEvent, videoId: string, videoTitle: string) => {
    e.stopPropagation();
    executeDeleteVideo(videoId);
  };

  const executeDeleteActiveVideo = async () => {
    if (!activeVideo) return;
    if (videoRef.current) {
      videoRef.current.pause();
    }
    await deleteLessonVideo(activeVideo.id);
    await refreshVideos();
  };

  const handleDeleteActiveVideo = () => {
    if (!activeVideo) return;
    executeDeleteActiveVideo();
  };

  const executeClearAll = async () => {
    if (videoRef.current) {
      videoRef.current.pause();
    }
    await clearAllLessonVideos(lesson.id);
    await refreshVideos();
  };

  const handleClearAll = () => {
    if (videos.length === 0) return;
    executeClearAll();
  };

  const handleTabChange = (newTab: 'file' | 'url') => {
    setActiveTab(newTab);
  };

  const handleTriggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      setDuration(videoRef.current.duration || 0);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const changePlaybackRate = (rate: number) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
      setPlaybackRate(rate);
    }
  };

  const toggleFullScreen = () => {
    if (!videoRef.current) return;
    if (videoRef.current.requestFullscreen) {
      videoRef.current.requestFullscreen();
    }
  };

  const formatPreciseTime = (seconds: number) => {
    if (isNaN(seconds) || seconds < 0) return '00:00.00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const hundredths = Math.floor((seconds % 1) * 100);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${hundredths.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6 text-slate-100 relative">
      {/* Hidden File Input */}
      <input 
        type="file" 
        ref={fileInputRef} 
        accept="video/*" 
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            executeFileUpload(e.target.files[0]);
            e.target.value = ''; // Reset input
          }
        }} 
        className="hidden" 
      />

      {/* Top Header Card */}
      <div className="rounded-2xl border border-white/10 bg-[#070E1C]/90 p-4 sm:p-5 shadow-2xl backdrop-blur-md">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 shadow-inner">
              <Film className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg sm:text-xl font-black text-white tracking-wide">
                  Kho Video Mô Phỏng & Thí Nghiệm
                </h2>
                <span className="rounded-full bg-cyan-500/20 px-2.5 py-0.5 text-xs font-bold text-cyan-300 border border-cyan-500/40">
                  Bài {lesson.lessonNumber}
                </span>
                <span className="flex items-center gap-1 text-[11px] font-semibold text-cyan-300 bg-cyan-500/10 border border-cyan-500/30 px-2 py-0.5 rounded-md">
                  <CheckCircle2 className="h-3 w-3 text-cyan-400" />
                  Đồng bộ & Lưu trữ
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                Tải lên video thí nghiệm thực tế hoặc mô phỏng 3D tương ứng cho từng bài học
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5">
            {activeVideo && (
              <button
                onClick={handleDeleteActiveVideo}
                className="flex items-center gap-1.5 rounded-xl bg-rose-600/90 hover:bg-rose-600 text-white px-3.5 py-2 text-xs sm:text-sm font-bold shadow-lg shadow-rose-600/20 active:scale-95 transition-all cursor-pointer border border-rose-400/30"
                title="Xóa Video Này"
              >
                <Trash2 className="h-4 w-4" />
                <span>Xóa Video Này</span>
              </button>
            )}

            <button
              onClick={handleTriggerFileInput}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white px-4 py-2 text-xs sm:text-sm font-bold shadow-lg shadow-cyan-500/25 active:scale-95 transition-all cursor-pointer border border-cyan-300/40"
              title="Tải Video Lên"
            >
              <Upload className="h-4 w-4" />
              <span>Tải Video Lên</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
        {/* Left Column: Big Video Stage (2 Cols) */}
        <div className="lg:col-span-2 space-y-3">
          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black shadow-2xl aspect-video w-full flex items-center justify-center group">
            {activeVideoSrc ? (
              <>
                <video
                  ref={videoRef}
                  src={activeVideoSrc}
                  className="w-full h-full object-contain"
                  onTimeUpdate={handleTimeUpdate}
                  onEnded={() => setIsPlaying(false)}
                  onClick={togglePlay}
                  playsInline
                />

                {/* Big Center Play Circle Button when paused */}
                {!isPlaying && (
                  <button
                    onClick={togglePlay}
                    className="absolute inset-0 m-auto flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-full bg-cyan-500/90 hover:bg-cyan-400 text-white shadow-[0_0_30px_rgba(6,182,212,0.6)] hover:scale-110 active:scale-95 transition-all cursor-pointer z-20 border border-white/40"
                  >
                    <Play className="h-8 w-8 sm:h-10 sm:w-10 translate-x-0.5 fill-current" />
                  </button>
                )}

                {/* Timestamp & Speed Badge (Top Right) */}
                <div className="absolute top-3 right-3 z-10 pointer-events-none">
                  <div className="rounded-lg bg-black/80 px-3 py-1 text-xs font-mono font-bold text-cyan-300 border border-white/15 backdrop-blur-md shadow-md">
                    t = {currentTime.toFixed(2)} s ({playbackRate}x)
                  </div>
                </div>

                {/* Video Title (Top Left) */}
                <div className="absolute top-3 left-3 z-10 pointer-events-none max-w-[60%] truncate">
                  <div className="rounded-lg bg-black/80 px-3 py-1 text-xs font-medium text-slate-200 border border-white/15 backdrop-blur-md truncate">
                    {activeVideo?.title || 'Video mô phỏng'}
                  </div>
                </div>
              </>
            ) : isLoading ? (
              <div className="flex flex-col items-center justify-center p-8 space-y-3 text-slate-400">
                <Loader2 className="h-10 w-10 text-cyan-400 animate-spin" />
                <span className="text-xs font-mono">Đang tải kho video của bài học...</span>
              </div>
            ) : (
              /* No video placeholder */
              <div 
                onClick={handleTriggerFileInput}
                className="flex flex-col items-center justify-center p-8 text-center cursor-pointer hover:bg-white/5 transition-all w-full h-full"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 mb-3 shadow-lg">
                  <CloudUpload className="h-8 w-8 text-cyan-400" />
                </div>
                <h4 className="text-base font-bold text-white mb-1">Chưa có video nào cho Bài {lesson.lessonNumber}</h4>
                <p className="text-xs text-slate-400 max-w-sm mb-3">
                  Nhấp vào đây hoặc kéo thả để tải tệp video từ máy tính của bạn
                </p>
                <span className="rounded-xl bg-cyan-500 text-black px-4 py-2 text-xs font-extrabold shadow-md flex items-center gap-1.5 hover:bg-cyan-400 transition-colors">
                  <Plus className="h-3.5 w-3.5" />
                  + Thêm Video Ngay
                </span>
              </div>
            )}
          </div>

          {/* Custom Time Scrubber Bar (Cyan themed) */}
          <div className="rounded-2xl border border-white/10 bg-[#070E1C] p-3.5 space-y-2.5 shadow-xl">
            {/* Scrubber slider */}
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono font-bold text-cyan-400 w-16 text-left shrink-0">
                {formatPreciseTime(currentTime)}
              </span>
              <input
                type="range"
                min="0"
                max={duration || 100}
                step="0.05"
                value={currentTime}
                onChange={handleSeek}
                disabled={!activeVideoSrc}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400 disabled:opacity-40"
              />
              <span className="text-xs font-mono font-bold text-slate-400 w-16 text-right shrink-0">
                {formatPreciseTime(duration)}
              </span>
            </div>

            {/* Controls */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-white/5">
              <div className="flex items-center gap-2">
                <button
                  onClick={togglePlay}
                  disabled={!activeVideoSrc}
                  className="flex items-center gap-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer shadow-md disabled:opacity-40"
                >
                  {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5 fill-current" />}
                  <span>{isPlaying ? 'Tạm dừng' : 'Phát'}</span>
                </button>

                <button
                  onClick={() => {
                    if (videoRef.current) {
                      videoRef.current.currentTime = 0;
                      setCurrentTime(0);
                    }
                  }}
                  disabled={!activeVideoSrc}
                  className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 px-2.5 py-1.5 text-xs font-semibold text-slate-300 cursor-pointer disabled:opacity-40"
                  title="Xem lại từ đầu"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Lặp lại</span>
                </button>

                <button
                  onClick={toggleMute}
                  disabled={!activeVideoSrc}
                  className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 px-2.5 py-1.5 text-xs font-semibold text-slate-300 cursor-pointer disabled:opacity-40"
                >
                  {isMuted ? <VolumeX className="h-3.5 w-3.5 text-rose-400" /> : <Volume2 className="h-3.5 w-3.5 text-cyan-400" />}
                </button>
              </div>

              {/* Speed & Fullscreen */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 bg-black/60 p-1 rounded-lg border border-white/10 text-xs font-mono">
                  <span className="text-slate-400 text-[10px] px-1">Tốc độ:</span>
                  {[0.25, 0.5, 1, 1.5, 2].map((rate) => (
                    <button
                      key={rate}
                      onClick={() => changePlaybackRate(rate)}
                      disabled={!activeVideoSrc}
                      className={`px-1.5 py-0.5 rounded text-[11px] font-bold cursor-pointer transition-all ${
                        playbackRate === rate 
                          ? 'bg-cyan-500 text-black shadow-sm'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {rate}x
                    </button>
                  ))}
                </div>

                <button
                  onClick={toggleFullScreen}
                  disabled={!activeVideoSrc}
                  className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 px-2.5 py-1.5 text-xs font-semibold text-slate-300 cursor-pointer disabled:opacity-40"
                  title="Toàn màn hình"
                >
                  <Maximize2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Upload Box + Video Playlist (1 Col) */}
        <div className="space-y-4">
          {/* Card 1: Thêm Video Mới */}
          <div className="rounded-2xl border border-white/10 bg-[#070E1C] p-4 space-y-3.5 shadow-xl">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <CloudUpload className="h-4 w-4 text-cyan-400" />
                <h3 className="text-sm font-extrabold text-white">
                  Thêm Video Mới
                </h3>
              </div>

              {/* Segmented Tab */}
              <div className="flex items-center bg-black/60 p-0.5 rounded-lg border border-white/10 text-xs">
                <button
                  onClick={() => handleTabChange('file')}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                    activeTab === 'file'
                      ? 'bg-cyan-500 text-black shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Tệp máy tính
                </button>
                <button
                  onClick={() => handleTabChange('url')}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                    activeTab === 'url'
                      ? 'bg-cyan-500 text-black shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Link URL
                </button>
              </div>
            </div>

            {/* Dropzone for File Mode */}
            {activeTab === 'file' ? (
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                    handleFileUpload(e.dataTransfer.files[0]);
                  }
                }}
                onClick={handleTriggerFileInput}
                className={`rounded-xl border border-dashed p-6 text-center transition-all cursor-pointer flex flex-col items-center justify-center ${
                  isDragging
                    ? 'border-cyan-400 bg-cyan-950/30'
                    : 'border-white/15 bg-black/40 hover:border-cyan-500/50 hover:bg-black/60'
                }`}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 mb-2">
                  {isUploading ? (
                    <Loader2 className="h-6 w-6 animate-spin text-cyan-400" />
                  ) : (
                    <CloudUpload className="h-6 w-6 text-cyan-400" />
                  )}
                </div>
                <h4 className="text-xs sm:text-sm font-bold text-white mb-0.5">
                  {isUploading ? 'Đang lưu video...' : 'Chọn hoặc Kéo thả video'}
                </h4>
                <p className="text-[11px] text-slate-400 font-mono">
                  MP4, WebM, MOV, OGG (Tối ưu lưu trữ)
                </p>
              </div>
            ) : (
              /* URL Input Mode */
              <form onSubmit={handleAddUrl} className="space-y-2.5">
                <input
                  type="text"
                  placeholder="Tiêu đề video (tùy chọn)..."
                  value={urlTitle}
                  onChange={(e) => setUrlTitle(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
                />
                <input
                  type="url"
                  placeholder="Nhập đường link video (https://...)..."
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  required
                  className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={isUploading || !urlInput.trim()}
                  className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black py-2 text-xs font-bold shadow-md transition-all cursor-pointer disabled:opacity-40"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Thêm Video Trực Tuyến</span>
                </button>
              </form>
            )}

            {errorMessage && (
              <div className="flex items-center gap-1.5 rounded-lg bg-rose-500/10 border border-rose-500/30 p-2.5 text-xs text-rose-300">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}
          </div>

          {/* Card 2: Danh Sách Video */}
          <div className="rounded-2xl border border-white/10 bg-[#070E1C] p-4 space-y-3 shadow-xl">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-cyan-400" />
                <h3 className="text-sm font-extrabold text-white">
                  Danh Sách Video ({videos.length})
                </h3>
              </div>

              {videos.length > 0 && (
                <button
                  onClick={handleClearAll}
                  className="flex items-center gap-1 text-[11px] font-semibold text-rose-400 hover:text-rose-300 transition-colors cursor-pointer"
                >
                  <Trash2 className="h-3 w-3" />
                  <span>Xóa tất cả</span>
                </button>
              )}
            </div>

            {/* Video Items List */}
            <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
              {videos.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-500">
                  Chưa có video nào trong danh sách.
                </div>
              ) : (
                videos.map((vid) => {
                  const isCurrent = vid.id === (activeVideo?.id || selectedVideoId);
                  return (
                    <div
                      key={vid.id}
                      onClick={() => setSelectedVideoId(vid.id)}
                      className={`group flex items-center justify-between gap-2.5 rounded-xl p-2.5 transition-all cursor-pointer border ${
                        isCurrent
                          ? 'border-cyan-500/60 bg-cyan-950/30 shadow-md'
                          : 'border-white/10 bg-black/40 hover:border-white/20 hover:bg-white/5'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <div className={`flex h-8 w-8 items-center justify-center rounded-lg border shrink-0 ${
                          isCurrent
                            ? 'bg-cyan-500 text-black border-cyan-400'
                            : 'bg-white/5 text-slate-400 border-white/10'
                        }`}>
                          <Play className={`h-4 w-4 ${isCurrent ? 'fill-current' : ''}`} />
                        </div>

                        <div className="min-w-0 flex-1">
                          <h4 className={`text-xs font-bold truncate ${
                            isCurrent ? 'text-cyan-300' : 'text-slate-200'
                          }`}>
                            {vid.title}
                          </h4>
                          <p className="text-[10px] font-mono text-slate-500 truncate">
                            {vid.fileName} {vid.sizeFormatted ? `• ${vid.sizeFormatted}` : ''}
                          </p>
                        </div>
                      </div>

                      {/* Delete icon */}
                      <button
                        onClick={(e) => handleDeleteVideo(e, vid.id, vid.title)}
                        className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors shrink-0 cursor-pointer"
                        title="Xóa video này"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Footer */}
      {onBackToLesson && (
        <div className="flex flex-wrap justify-between items-center gap-3 rounded-2xl border border-white/10 bg-[#070E1C]/80 p-4 shadow-lg backdrop-blur-md">
          <button
            onClick={onBackToLesson}
            className="flex items-center gap-2 rounded-xl border border-cyan-500/40 bg-cyan-500/10 hover:bg-cyan-500/20 px-4.5 py-2.5 text-sm font-bold text-cyan-400 transition-all cursor-pointer shadow-sm"
          >
            <BookOpen className="h-4.5 w-4.5 text-cyan-400" />
            <span>Trở về bài học</span>
          </button>
        </div>
      )}
    </div>
  );
};

