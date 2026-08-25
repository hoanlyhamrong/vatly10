import React, { useState, useRef, useEffect } from 'react';
import {
  BookOpen,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Clock,
  Cpu,
  Zap,
  Flame,
  Globe,
  Compass,
  AlertTriangle,
  Lightbulb,
  CheckCircle2,
  Atom,
  Layers,
  ArrowRight,
  TrendingUp,
  ShieldAlert,
  HelpCircle,
  Factory,
  Radio,
  Eye,
  Bot,
  Camera,
  Upload,
  Trash2
} from 'lucide-react';
import { MathFormula } from '../MathFormula';
import {
  savePortraitToDB,
  loadAllPortraitsFromDB,
  deletePortraitFromDB
} from '../../utils/imageStorage';

export const Lesson1Detail: React.FC = () => {
  // State for collapsible discussion questions
  const [openQuestions, setOpenQuestions] = useState<Record<string, boolean>>({
    'intro-q': true,
    'part1-q1': false,
    'part3-q1': false,
    'part3-q2': false,
    'part4-exp': true,
    'part4-model': false
  });

  // State for active timeline item in Part II
  const [activeTimelineIdx, setActiveTimelineIdx] = useState<number>(0);

  // State for active scientist tab ('aristotle' | 'galilei' | 'newton' | 'einstein')
  const [activeScientistId, setActiveScientistId] = useState<string>('aristotle');

  // State for active interdisciplinary science tab in Part III
  const [activeInterdisciplinaryIdx, setActiveInterdisciplinaryIdx] = useState<number>(0);

  // State for custom uploaded scientist portraits with IndexedDB persistence
  const [scientistPortraits, setScientistPortraits] = useState<Record<string, string>>({});

  // Load all saved portraits from IndexedDB on component mount
  useEffect(() => {
    let isMounted = true;
    const allKeys = [
      'aristotle',
      'galilei',
      'newton',
      'coulomb',
      'faraday',
      'planck',
      'einstein',
      'kilby',
      'biophysics',
      'geophysics',
      'astrophysics',
      'physical_chemistry',
      'quantum_biology',
      'quantum_chemistry'
    ];
    loadAllPortraitsFromDB(allKeys).then((loaded) => {
      if (isMounted && Object.keys(loaded).length > 0) {
        setScientistPortraits(loaded);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const handleUploadClick = (id: string) => {
    fileInputRefs.current[id]?.click();
  };

  const handleDeletePortrait = async (id: string) => {
    try {
      await deletePortraitFromDB(id);
      setScientistPortraits((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  // Optimize and compress large image before saving to database
  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const maxDim = 2000;
          let width = img.width;
          let height = img.height;

          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(event.target?.result as string);
            return;
          }
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.92);
          resolve(compressedDataUrl);
        };
        img.onerror = () => resolve(event.target?.result as string);
        img.src = event.target?.result as string;
      };
      reader.onerror = (e) => reject(e);
      reader.readAsDataURL(file);
    });
  };

  const handleFileChange = async (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Vui lòng chọn tệp hình ảnh hợp lệ (PNG, JPG, JPEG, WEBP)!');
      return;
    }

    try {
      const dataUrl = await compressImage(file);
      if (dataUrl) {
        setScientistPortraits((prev) => ({ ...prev, [id]: dataUrl }));
        await savePortraitToDB(id, dataUrl);
      }
    } catch (err) {
      console.error('Save failed:', err);
    } finally {
      e.target.value = '';
    }
  };

  const toggleQuestion = (id: string) => {
    setOpenQuestions((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const scientists = [
    {
      id: 'aristotle',
      name: 'Aristotle (A-ri-xtốt)',
      shortName: 'Aristotle',
      icon: '🏛️',
      eraTitle: 'Giai đoạn Tiền Vật lí (Triết học tự nhiên)',
      field: 'Triết học tự nhiên & Tư duy Cổ đại',
      lifespan: '384 TCN – 322 TCN',
      title: 'Nhà bách khoa toàn thư Hy Lạp cổ đại',
      avatarBg: 'from-amber-500/15 via-yellow-950/20 to-black/40 border-amber-500/40',
      activeTabClass: 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-amber-500/20',
      tagColor: 'text-amber-400 bg-amber-400/10 border-amber-400/30',
      accentColor: 'text-amber-400',
      glowColor: 'bg-amber-500/10',
      description:
        'Nhà triết học, nhà khoa học Hy Lạp cổ đại lỗi lạc. Người đã đặt nền móng cho thuật ngữ "Vật lí" (Physiko - kiến thức về tự nhiên) và xây dựng hệ thống triết học tự nhiên chi phối tư duy khoa học phương Tây suốt gần 2000 năm.',
      achievements: [
        'Sáng lập thuật ngữ "Vật lí" (Physica) bắt nguồn từ tiếng Hy Lạp Physiko nghĩa là tự nhiên.',
        'Tổng hợp và hệ thống hóa toàn bộ tri thức khoa học, vũ trụ và tự nhiên của thế giới cổ đại.',
        'Đưa ra quan niệm về sự rơi của các vật nặng nhẹ, mở đầu chuỗi tranh luận thực nghiệm sau này.'
      ]
    },
    {
      id: 'galilei',
      name: 'Galileo Galilei (Ga-li-lê)',
      shortName: 'Galileo Galilei',
      icon: '🔭',
      eraTitle: 'Giai đoạn Tiền đề & Thực nghiệm',
      field: 'Cơ học thực nghiệm & Thiên văn học',
      lifespan: '1564 – 1642',
      title: 'Cha đẻ của phương pháp thực nghiệm',
      avatarBg: 'from-amber-500/15 via-orange-950/20 to-black/40 border-amber-500/40',
      activeTabClass: 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-amber-500/20',
      tagColor: 'text-amber-400 bg-amber-400/10 border-amber-400/30',
      accentColor: 'text-amber-400',
      glowColor: 'bg-amber-500/10',
      description:
        'Nhà thiên văn học, vật lí học người Ý. Người đầu tiên sử dụng kính thiên văn quan sát các thiên thể và đặt nền móng cho cơ học thực nghiệm qua thí nghiệm nổi tiếng tại tháp nghiêng Pisa.',
      achievements: [
        'Bác bỏ quan niệm sai lầm 2000 năm của Aristotle về sự rơi của các vật nặng nhẹ.',
        'Phát hiện ra 4 vệ tinh lớn của Sao Mộc (vệ tinh Galilei) và các pha của Sao Kim.',
        'Khởi xướng và hoàn thiện chu trình phương pháp thực nghiệm khoa học hiện đại.'
      ]
    },
    {
      id: 'newton',
      name: 'Isaac Newton (Niu-tơn)',
      shortName: 'Isaac Newton',
      icon: '🍎',
      eraTitle: 'Giai đoạn Vật lí Cổ điển',
      field: 'Cơ học cổ điển, Hấp dẫn & Quang học',
      lifespan: '1642 – 1727',
      title: 'Người tìm ra Định luật Vạn vật hấp dẫn',
      avatarBg: 'from-cyan-500/15 via-blue-950/20 to-black/40 border-cyan-500/40',
      activeTabClass: 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-cyan-500/20',
      tagColor: 'text-[#00D4FF] bg-[#00D4FF]/10 border-[#00D4FF]/30',
      accentColor: 'text-[#00D4FF]',
      glowColor: 'bg-cyan-500/10',
      description:
        'Nhà vật lí, toán học lỗi lạc người Anh. Tác giả công trình vĩ đại "Các nguyên lí toán học của triết học tự nhiên" (1687), đặt nền tảng vững chắc cho Vật lí cổ điển.',
      achievements: [
        'Tìm ra Định luật Vạn vật hấp dẫn thống nhất chuyển động trên Trái Đất và vũ trụ.',
        'Xây dựng 3 Định luật chuyển động cơ bản (Động lực học cổ điển Newton).',
        'Khám phá hiện tượng tán sắc ánh sáng và sáng chế kính thiên văn phản xạ.'
      ]
    },
    {
      id: 'einstein',
      name: 'Albert Einstein (Anh-xtanh)',
      shortName: 'Albert Einstein',
      icon: '⚛️',
      eraTitle: 'Giai đoạn Vật lí Hiện đại',
      field: 'Thuyết tương đối & Vật lí lượng tử',
      lifespan: '1879 – 1955',
      title: 'Người tìm ra Thuyết tương đối & Hệ thức E = mc²',
      avatarBg: 'from-purple-500/15 via-pink-950/20 to-black/40 border-purple-500/40',
      activeTabClass: 'bg-purple-500/20 border-purple-400 text-purple-300 shadow-purple-500/20',
      tagColor: 'text-purple-400 bg-purple-400/10 border-purple-400/30',
      accentColor: 'text-purple-400',
      glowColor: 'bg-purple-500/10',
      description:
        'Nhà vật lí lí thuyết vĩ đại thế kỉ XX. Người đã cách mạng hóa hiểu biết của nhân loại về không gian, thời gian, năng lượng và lực hấp dẫn.',
      achievements: [
        'Xây dựng Thuyết tương đối hẹp (1905) và Thuyết tương đối rộng (1915).',
        'Giải thích bản chất hiệu ứng quang điện (Giải Nobel Vật lí 1921).',
        'Tìm ra hệ thức tương đương khối lượng – năng lượng vĩ đại: E = mc².'
      ]
    }
  ];

  const timelineEvents = [
    {
      id: 'aristotle',
      year: '350 TCN',
      era: 'Tiền Vật lí',
      figure: 'Aristotle (A-ri-xtốt)',
      shortFigure: 'Aristotle',
      event: 'Quan sát và đưa ra quan niệm: "Vật nặng rơi nhanh hơn vật nhẹ, vật càng nặng rơi càng nhanh".',
      detail: 'Các nhà triết học cổ đại tìm hiểu tự nhiên dựa thuần túy vào quan sát cảm tính và suy luận chủ quan mà không qua kiểm chứng thực nghiệm.',
      color: 'border-amber-500 text-amber-400'
    },
    {
      id: 'galilei',
      year: '1600',
      era: 'Vật lí cổ điển',
      figure: 'Galileo Galilei',
      shortFigure: 'Galileo',
      event: 'Thí nghiệm thả 2 quả cầu kim loại khác nhau tại tháp nghiêng Pisa.',
      detail: 'Chứng minh sự rơi tự do không phụ thuộc vào khối lượng vật, mở đầu kỉ nguyên phương pháp thực nghiệm khoa học.',
      color: 'border-cyan-500 text-cyan-400'
    },
    {
      id: 'newton',
      year: '1687',
      era: 'Vật lí cổ điển',
      figure: 'Isaac Newton',
      shortFigure: 'Newton',
      event: 'Công bố tác phẩm "Các nguyên lí Toán học của Triết học tự nhiên".',
      detail: 'Thống nhất cơ học mặt đất và cơ học thiên thể qua 3 định luật Newton và định luật vạn vật hấp dẫn.',
      color: 'border-blue-500 text-blue-400'
    },
    {
      id: 'coulomb',
      year: '1785',
      era: 'Vật lí cổ điển',
      figure: 'Coulomb & Joule',
      shortFigure: 'Coulomb',
      event: 'Định luật Coulomb (1785) & Phát triển nhiệt động lực học (Joule).',
      detail: 'Xây dựng các định luật về tương tác tĩnh điện và định luật bảo toàn & chuyển hóa năng lượng trong nhiệt học.',
      color: 'border-emerald-500 text-emerald-400'
    },
    {
      id: 'faraday',
      year: '1831',
      era: 'Vật lí cổ điển',
      figure: 'Michael Faraday',
      shortFigure: 'Faraday',
      event: 'Khám phá ra hiện tượng cảm ứng điện từ.',
      detail: 'Cơ sở ra đời của máy phát điện và động cơ điện, mở ra kỉ nguyên điện năng cho toàn nhân loại.',
      color: 'border-teal-500 text-teal-400'
    },
    {
      id: 'planck',
      year: '1900',
      era: 'Vật lí hiện đại',
      figure: 'Max Planck (Plăng)',
      shortFigure: 'Planck',
      event: 'Đề xuất Thuyết lượng tử năng lượng.',
      detail: 'Năng lượng bức xạ và hấp thụ không liên tục mà theo từng lượng nhỏ gián đoạn (quanta), mở đầu cho Vật lí lượng tử.',
      color: 'border-purple-500 text-purple-400'
    },
    {
      id: 'einstein',
      year: '1905',
      era: 'Vật lí hiện đại',
      figure: 'Albert Einstein',
      shortFigure: 'Einstein',
      event: 'Xây dựng Thuyết tương đối hẹp và phương trình E = mc².',
      detail: 'Thay đổi toàn diện khái niệm không - thời gian tuyệt đối của Newton, mở đường cho vật lí hạt nhân và vũ trụ học hiện đại.',
      color: 'border-fuchsia-500 text-fuchsia-400'
    },
    {
      id: 'kilby',
      year: '1958',
      era: 'Vật lí hiện đại',
      figure: 'Jack Kilby & Robert Noyce',
      shortFigure: 'Jack Kilby',
      event: 'Sáng chế ra mạch vi mạch tích hợp (Integrated Circuit - IC).',
      detail: 'Khởi đầu cuộc cách mạng máy tính, vi xử lý và tự động hóa toàn cầu thế kỉ XX – XXI.',
      color: 'border-[#00FFCC] text-[#00FFCC]'
    }
  ];

  return (
    <div className="space-y-10">
      {/* 0. PHẦN MỞ ĐẦU & CÁC NHÀ VẬT LÍ TIÊU BIỂU */}
      <section className="rounded-2xl border border-white/10 bg-[#070E1C]/90 p-6 md:p-8 shadow-xl backdrop-blur-md">
        <div className="flex items-center gap-3 border-b border-white/10 pb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#00D4FF] to-[#00FFCC] text-black shadow-lg">
            <Atom className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#00D4FF]">
              Khởi động & Bối cảnh lịch sử
            </span>
            <h2 className="text-xl md:text-2xl font-extrabold text-white">
              Các Nhà Vật Lí Tiêu Biểu Cho Mỗi Giai Đoạn Phát Triển
            </h2>
          </div>
        </div>

        <p className="mt-4 text-base sm:text-lg md:text-xl leading-relaxed text-gray-100">
          Hình ảnh các nhà vật lí tiêu biểu đại diện cho mỗi giai đoạn phát triển khoa học và công nghệ của nhân loại:
          từ đặt nền móng phương pháp thực nghiệm, xây dựng hệ thống cơ học cổ điển đến cách mạng hóa với thuyết tương đối và vật lí hiện đại.
        </p>

        {/* Navigation Tabs for Independent Scientist Views */}
        <div className="mt-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-2 rounded-2xl bg-black/40 border border-white/10">
            {scientists.map((sc) => {
              const isActive = activeScientistId === sc.id;
              const hasImg = !!scientistPortraits[sc.id];

              return (
                <button
                  key={sc.id}
                  type="button"
                  onClick={() => setActiveScientistId(sc.id)}
                  className={`flex items-center justify-between px-3.5 py-3 rounded-xl border text-left transition-all duration-200 cursor-pointer ${
                    isActive
                      ? `${sc.activeTabClass} border-current shadow-lg scale-[1.01]`
                      : 'border-transparent text-gray-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <span className="text-xl sm:text-2xl">{sc.icon}</span>
                    <div className="truncate">
                      <div className="font-extrabold text-sm sm:text-base tracking-wide truncate text-white">
                        {sc.shortName}
                      </div>
                      <div className="text-xs sm:text-sm opacity-90 font-mono mt-0.5">{sc.lifespan}</div>
                    </div>
                  </div>
                  {hasImg && (
                    <span className="hidden sm:inline-block text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Có ảnh
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Dedicated Independent View for Selected Scientist */}
        {(() => {
          const currentSc = scientists.find((s) => s.id === activeScientistId) || scientists[0];
          const hasPortrait = !!scientistPortraits[currentSc.id];
          const currentIdx = scientists.findIndex((s) => s.id === currentSc.id);
          const prevSc = scientists[(currentIdx - 1 + scientists.length) % scientists.length];
          const nextSc = scientists[(currentIdx + 1) % scientists.length];

          return (
            <div className="mt-6">
              {/* Hidden File Input for Current Scientist */}
              <input
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp"
                className="hidden"
                ref={(el) => {
                  fileInputRefs.current[currentSc.id] = el;
                }}
                onChange={(e) => handleFileChange(currentSc.id, e)}
              />

              <div
                className={`rounded-2xl border bg-gradient-to-b ${currentSc.avatarBg} p-6 sm:p-8 shadow-2xl transition-all duration-300 relative`}
              >
                {/* 1. Top Header Info Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4 mb-6">
                  <div className="flex items-center gap-3">
                    <span className={`text-sm sm:text-base font-bold px-3.5 py-1 rounded-full border ${currentSc.tagColor}`}>
                      {currentSc.lifespan}
                    </span>
                    <span className="text-sm sm:text-base text-gray-200 font-mono tracking-wider">
                      GDPT 2018 • VẬT LÍ 10
                    </span>
                    <span className="hidden sm:inline-block text-sm sm:text-base font-medium px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-gray-200">
                      {currentSc.eraTitle}
                    </span>
                  </div>

                  {hasPortrait ? (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleUploadClick(currentSc.id)}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-200 text-xs sm:text-sm font-semibold border border-white/10 transition-colors cursor-pointer"
                        title="Thay đổi ảnh minh họa"
                      >
                        <Upload className="h-3.5 w-3.5 text-[#00D4FF]" />
                        <span>Đổi ảnh</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeletePortrait(currentSc.id)}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs sm:text-sm font-semibold border border-rose-500/30 transition-colors cursor-pointer"
                        title="Xóa ảnh này"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span>Xóa ảnh</span>
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleUploadClick(currentSc.id)}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#00D4FF]/20 hover:bg-[#00D4FF]/30 text-[#00D4FF] text-sm sm:text-base font-bold border border-[#00D4FF]/40 transition-colors cursor-pointer shadow-sm"
                    >
                      <Upload className="h-4 w-4" />
                      <span>Tải ảnh lên (16:9)</span>
                    </button>
                  )}
                </div>

                {/* 2. TOP: FULL 16:9 IMAGE DISPLAY (Không bị che khuất, giữ nguyên tỉ lệ chuẩn) */}
                <div className="mb-8">
                  {hasPortrait ? (
                    <div className="relative overflow-hidden rounded-2xl border border-white/20 bg-stone-950/90 shadow-2xl p-3 sm:p-4 flex items-center justify-center group/img aspect-video md:aspect-[16/9] w-full">
                      <img
                        src={scientistPortraits[currentSc.id]}
                        alt={currentSc.name}
                        className="w-full h-full object-contain rounded-xl transition-transform duration-300 group-hover/img:scale-[1.01]"
                      />
                    </div>
                  ) : (
                    <div
                      onClick={() => handleUploadClick(currentSc.id)}
                      className="aspect-video md:aspect-[16/9] w-full rounded-2xl border-2 border-dashed border-white/20 hover:border-[#00D4FF]/60 bg-black/30 hover:bg-black/40 flex flex-col items-center justify-center p-8 text-center cursor-pointer transition-all duration-200 group/upload"
                    >
                      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 group-hover/upload:bg-[#00D4FF]/20 group-hover/upload:text-[#00D4FF] text-gray-300 transition-colors mb-3 shadow-inner">
                        <Camera className="h-8 w-8" />
                      </div>
                      <span className="text-base sm:text-lg font-bold text-white group-hover/upload:text-[#00D4FF] flex items-center gap-2 transition-colors">
                        Tải ảnh Infographic / Chân dung của {currentSc.shortName} (Tỉ lệ 16:9)
                      </span>
                      <p className="text-sm sm:text-base text-gray-300 mt-2 max-w-lg leading-relaxed">
                        Hình ảnh tải lên chuẩn <strong>tỉ lệ 16:9</strong> (không bị cắt xén hay che khuất), tự động nén tối ưu và lưu trữ vĩnh viễn trên trình duyệt của bạn.
                      </p>
                      <div className="mt-4 flex items-center gap-3">
                        <span className="px-3.5 py-1.5 rounded-full bg-[#00D4FF] text-black font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-md">
                          <Upload className="h-4 w-4" />
                          Tải ảnh {currentSc.shortName} lên
                        </span>
                        <span className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-gray-300 font-mono">
                          PNG, JPG, WEBP • Lưu trữ tự động
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* 3. BOTTOM: ACADEMIC TEXT & SCIENTIFIC CONTRIBUTIONS (Chữ lớn, rõ ràng, dễ đọc) */}
                <div className="space-y-6">
                  {/* Name & Academic Title */}
                  <div className="p-6 rounded-2xl bg-black/40 border border-white/10 space-y-3">
                    <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold uppercase tracking-wider text-gray-300">
                      <span className="text-base">{currentSc.icon}</span>
                      <span>{currentSc.eraTitle}</span>
                      <span>•</span>
                      <span className="text-[#00FFCC]">{currentSc.field}</span>
                    </div>
                    <h3 className="text-2xl sm:text-4xl font-extrabold text-white tracking-wide">
                      {currentSc.name}
                    </h3>
                    <p className={`text-lg sm:text-2xl font-bold ${currentSc.accentColor}`}>
                      {currentSc.title}
                    </p>

                    {/* Historical Context Description - Chữ lớn rõ ràng tương đương mẫu */}
                    <p className="text-base sm:text-lg md:text-xl leading-relaxed text-gray-100 border-t border-white/10 pt-4 font-normal">
                      {currentSc.description}
                    </p>
                  </div>

                  {/* Scientific Contributions */}
                  <div className="p-6 rounded-2xl bg-black/40 border border-white/10">
                    <span className="text-base sm:text-lg font-bold text-gray-200 uppercase tracking-wider flex items-center gap-2.5 mb-4">
                      <CheckCircle2 className="h-5 w-5 text-[#00D4FF]" />
                      CÁC ĐÓNG GÓP KHOA HỌC TIÊU BIỂU:
                    </span>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {currentSc.achievements.map((ach, i) => (
                        <div
                          key={i}
                          className="flex items-start gap-3.5 p-4 rounded-xl bg-white/5 border border-white/10 hover:border-white/25 transition-colors"
                        >
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#00D4FF]/25 text-[#00D4FF] font-bold text-sm sm:text-base">
                            {i + 1}
                          </div>
                          <span className="text-base sm:text-lg text-gray-100 font-medium leading-relaxed">
                            {ach}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Bottom Navigation Switcher */}
                  <div className="pt-2 flex items-center justify-between gap-4">
                    <button
                      type="button"
                      onClick={() => setActiveScientistId(prevSc.id)}
                      className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-gray-200 hover:text-white text-sm sm:text-base font-semibold border border-white/10 transition-colors cursor-pointer"
                    >
                      <span>←</span>
                      <span>Xem: {prevSc.shortName}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveScientistId(nextSc.id)}
                      className="flex items-center gap-2 px-5 py-3 rounded-xl bg-[#00D4FF]/20 hover:bg-[#00D4FF]/30 text-[#00D4FF] hover:text-cyan-200 text-sm sm:text-base font-bold border border-[#00D4FF]/40 transition-colors cursor-pointer shadow-md"
                    >
                      <span>Xem: {nextSc.shortName}</span>
                      <span>→</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

        {/* Interactive Discussion Box */}
        <div className="mt-6 rounded-xl border border-amber-500/30 bg-amber-500/10 p-5 sm:p-6">
          <button
            onClick={() => toggleQuestion('intro-q')}
            className="flex w-full items-center justify-between text-left text-base sm:text-lg font-bold text-amber-300 hover:text-amber-200 cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <HelpCircle className="h-5 w-5 shrink-0 text-amber-400" />
              <span>? Câu hỏi mở đầu: Em đã biết gì về các nhà khoa học Galilei, Newton, Einstein?</span>
            </div>
            {openQuestions['intro-q'] ? <ChevronUp className="h-5 w-5 shrink-0" /> : <ChevronDown className="h-5 w-5 shrink-0" />}
          </button>

          {openQuestions['intro-q'] && (
            <div className="mt-4 border-t border-amber-500/20 pt-4 text-base sm:text-lg leading-relaxed text-gray-100 space-y-3">
              <p className="font-bold text-amber-200">
                💡 Gợi ý trả lời sư phạm:
              </p>
              <ul className="list-disc pl-5 space-y-2.5 text-gray-100">
                <li>
                  <strong>Galileo Galilei (1564 – 1642):</strong> Là người đầu tiên dùng thí nghiệm thực tế (như thả 2 quả cầu tại tháp nghiêng Pisa) để kiểm tra các phán đoán lý thuyết, khai sinh ra phương pháp thực nghiệm khoa học.
                </li>
                <li>
                  <strong>Isaac Newton (1642 – 1727):</strong> Từ hiện tượng quả táo rơi đã tìm ra Định luật Vạn vật hấp dẫn và 3 Định luật chuyển động, là nền tảng cho ngành chế tạo máy móc, cầu đường và phóng vệ tinh.
                </li>
                <li>
                  <strong>Albert Einstein (1879 – 1955):</strong> Đề xuất Thuyết tương đối, tìm ra công thức nổi tiếng $E = mc^2$ giải thích nguồn gốc năng lượng khổng lồ của phản ứng hạt nhân và hiện tượng trong vũ trụ.
                </li>
              </ul>
            </div>
          )}
        </div>
      </section>

      {/* I. ĐỐI TƯỢNG NGHIÊN CỨU CỦA VẬT LÍ VÀ MỤC TIÊU CỦA MÔN VẬT LÍ */}
      <section className="rounded-2xl border border-white/10 bg-[#0C1528]/80 p-6 md:p-8 shadow-xl backdrop-blur-md space-y-6">
        <div className="border-b border-white/10 pb-4">
          <div className="flex items-center gap-2 text-xs sm:text-sm font-bold uppercase tracking-wider text-[#00D4FF]">
            <BookOpen className="h-4 w-4" />
            <span>Phần I</span>
          </div>
          <h2 className="mt-1 text-xl md:text-2xl font-extrabold text-white">
            I. Đối tượng nghiên cứu của Vật lí và Mục tiêu của môn Vật lí
          </h2>
        </div>

        {/* 1. Definition */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="rounded-xl border border-[#00D4FF]/20 bg-[#00D4FF]/5 p-5 sm:p-6 space-y-3">
            <h3 className="text-base sm:text-lg font-bold text-[#00D4FF] flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              <span>Nguồn gốc thuật ngữ & Định nghĩa</span>
            </h3>
            <p className="text-base sm:text-lg leading-relaxed text-gray-100">
              Thuật ngữ <strong>"vật lí"</strong> có nguồn gốc từ tiếng Hy Lạp <em>"physiko"</em> có nghĩa là <strong>"kiến thức về tự nhiên"</strong>.
            </p>
            <p className="text-base sm:text-lg leading-relaxed text-gray-100">
              Vật lí là môn <strong>khoa học tự nhiên</strong> có đối tượng nghiên cứu tập trung vào <strong>các dạng vận động của vật chất (chất, trường), năng lượng</strong>.
            </p>
          </div>

          <div className="rounded-xl border border-[#00FFCC]/20 bg-[#00FFCC]/5 p-5 sm:p-6 space-y-3">
            <h3 className="text-base sm:text-lg font-bold text-[#00FFCC] flex items-center gap-2">
              <Layers className="h-5 w-5" />
              <span>Các lĩnh vực nghiên cứu đa dạng của Vật lí</span>
            </h3>
            <p className="text-base sm:text-lg text-gray-200">Từ vi mô đến vĩ mô, bao gồm:</p>
            <div className="flex flex-wrap gap-2">
              {[
                'Cơ học',
                'Nhiệt học & Nhiệt động lực học',
                'Điện học & Điện từ học',
                'Quang học',
                'Âm học',
                'Vật lí nguyên tử & hạt nhân',
                'Vật lí lượng tử',
                'Thuyết tương đối',
                'Vật lí thiên văn'
              ].map((field, i) => (
                <span
                  key={i}
                  className="rounded-lg border border-white/10 bg-[#070E1C] px-3.5 py-1.5 text-sm sm:text-base font-semibold text-slate-100"
                >
                  {field}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Discussion Questions 1 & 2 */}
        <div className="rounded-xl border border-cyan-500/30 bg-cyan-500/10 p-5 sm:p-6">
          <button
            onClick={() => toggleQuestion('part1-q1')}
            className="flex w-full items-center justify-between text-left text-base sm:text-lg font-bold text-cyan-300 hover:text-cyan-200 cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <HelpCircle className="h-5 w-5 shrink-0 text-cyan-400" />
              <span>? Thảo luận trang 7: 1. Các lĩnh vực đã học ở THCS? & 2. Em thích nhất lĩnh vực nào?</span>
            </div>
            {openQuestions['part1-q1'] ? <ChevronUp className="h-5 w-5 shrink-0" /> : <ChevronDown className="h-5 w-5 shrink-0" />}
          </button>

          {openQuestions['part1-q1'] && (
            <div className="mt-4 border-t border-cyan-500/20 pt-4 text-base sm:text-lg leading-relaxed text-gray-100 space-y-3.5">
              <div>
                <strong className="text-cyan-200">1. Các lĩnh vực vật lí đã học trong môn KHTN cấp THCS:</strong>
                <ul className="list-disc pl-5 mt-2 text-gray-100 space-y-2">
                  <li><strong>Cơ học:</strong> Lực, chuyển động, quán tính, áp suất, công và công suất, đòn bẩy.</li>
                  <li><strong>Nhiệt học:</strong> Sự nở vì nhiệt, sự truyền nhiệt, các hình thức truyền nhiệt (dẫn nhiệt, đối lưu, bức xạ nhiệt).</li>
                  <li><strong>Điện học & Từ học:</strong> Mạch điện, định luật Ôm, nam châm, từ trường của dòng điện.</li>
                  <li><strong>Quang học & Âm học:</strong> Sự truyền thẳng ánh sáng, phản xạ, khúc xạ ánh sáng, gương phẳng, thấu kính, nguồn âm, độ to và độ cao của âm.</li>
                </ul>
              </div>
              <div className="pt-3 border-t border-cyan-500/10">
                <strong className="text-cyan-200">2. Lĩnh vực yêu thích (Ví dụ gợi ý):</strong>
                <p className="text-gray-100 mt-1">
                  Em thích nhất <em>Cơ học và Thiên văn học</em> vì giúp giải thích được quỹ đạo bay của các vệ tinh, cách tên lửa rời bệ phóng thoát khỏi lực hút Trái Đất và khám phá các hành tinh xa xôi trong hệ Mặt Trời.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Objectives / 3 Competencies */}
        <div className="space-y-3">
          <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-[#00FFCC]" />
            <span>Mục tiêu môn học: Hình thành và phát triển 3 biểu hiện chính của Năng lực Vật lí:</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-xl border border-white/10 bg-[#070E1C] p-5 space-y-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#00D4FF]/20 text-[#00D4FF] font-bold text-base">
                1
              </div>
              <h4 className="text-base sm:text-lg font-bold text-white">Kiến thức & Kĩ năng nền tảng</h4>
              <p className="text-sm sm:text-base leading-relaxed text-gray-200">
                Có được những kiến thức, kĩ năng cốt lõi về bản chất các hiện tượng vật lí, đại lượng và đơn vị đo chuẩn SI.
              </p>
            </div>

            <div className="rounded-xl border border-white/10 bg-[#070E1C] p-5 space-y-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#00FFCC]/20 text-[#00FFCC] font-bold text-base">
                2
              </div>
              <h4 className="text-base sm:text-lg font-bold text-white">Khám phá & Giải quyết vấn đề</h4>
              <p className="text-sm sm:text-base leading-relaxed text-gray-200">
                Vận dụng kiến thức, kĩ năng đã học để khám phá, thiết kế phương án thực nghiệm và giải quyết các bài toán trong đời sống.
              </p>
            </div>

            <div className="rounded-xl border border-white/10 bg-[#070E1C] p-5 space-y-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/20 text-purple-400 font-bold text-base">
                3
              </div>
              <h4 className="text-base sm:text-lg font-bold text-white">Định hướng nghề nghiệp</h4>
              <p className="text-sm sm:text-base leading-relaxed text-gray-200">
                Nhận biết được năng lực, sở trường của bản thân đối với các ngành khoa học kĩ thuật, công nghệ cao, tự động hóa và y sinh.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* II. QUÁ TRÌNH PHÁT TRIỂN CỦA VẬT LÍ */}
      <section className="rounded-2xl border border-white/10 bg-[#070E1C]/90 p-6 md:p-8 shadow-xl backdrop-blur-md space-y-6">
        <div className="border-b border-white/10 pb-4">
          <div className="flex items-center gap-2 text-xs sm:text-sm font-bold uppercase tracking-wider text-[#00FFCC]">
            <Clock className="h-4 w-4" />
            <span>Phần II</span>
          </div>
          <h2 className="mt-1 text-xl md:text-2xl font-extrabold text-white">
            II. Quá trình phát triển của Vật lí
          </h2>
          <p className="text-base sm:text-lg text-gray-100 mt-2">
            Lịch sử phát triển của Vật lí được chia thành 3 giai đoạn chính với những đặc điểm, phương pháp luận riêng biệt:
          </p>
        </div>

        {/* 3 Main Eras Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5 sm:p-6 space-y-3">
            <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-amber-300 bg-amber-400/20 px-2.5 py-1 rounded-md">
              Giai đoạn 1 (350 TCN – TK XVI)
            </span>
            <h3 className="text-lg sm:text-xl font-bold text-white">Tiền Vật lí (Triết học tự nhiên)</h3>
            <p className="text-base sm:text-lg text-gray-100 leading-relaxed">
              Các nhà triết học tìm hiểu thế giới tự nhiên dựa trên <strong>quan sát cảm tính và suy luận chủ quan</strong> (tiêu biểu là Aristotle).
            </p>
          </div>

          <div className="rounded-2xl border border-cyan-500/30 bg-cyan-500/10 p-5 sm:p-6 space-y-3">
            <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-cyan-300 bg-cyan-400/20 px-2.5 py-1 rounded-md">
              Giai đoạn 2 (TK XVII – Cuối TK XIX)
            </span>
            <h3 className="text-lg sm:text-xl font-bold text-white">Vật lí cổ điển</h3>
            <p className="text-base sm:text-lg text-gray-100 leading-relaxed">
              Các nhà vật lí sử dụng <strong>phương pháp thực nghiệm</strong> để kiểm chứng và tìm hiểu các quy luật tự nhiên (Galilei, Newton, Joule, Faraday).
            </p>
          </div>

          <div className="rounded-2xl border border-purple-500/30 bg-purple-500/10 p-5 sm:p-6 space-y-3">
            <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-purple-300 bg-purple-400/20 px-2.5 py-1 rounded-md">
              Giai đoạn 3 (Cuối TK XIX – Nay)
            </span>
            <h3 className="text-lg sm:text-xl font-bold text-white">Vật lí hiện đại</h3>
            <p className="text-base sm:text-lg text-gray-100 leading-relaxed">
              Tập trung vào các <strong>mô hình lí thuyết tìm hiểu thế giới vi mô và vũ trụ</strong>, kết hợp các thiết bị thí nghiệm hiện đại để kiểm chứng (Planck, Einstein).
            </p>
          </div>
        </div>

        {/* Interactive Timeline */}
        <div className="space-y-4 pt-3">
          <h3 className="text-sm sm:text-base font-bold uppercase tracking-wider text-gray-300">
            Sơ đồ mốc thời gian lịch sử các phát kiến Vật lí (Click vào mốc để xem chi tiết):
          </h3>

          <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-thin">
            {timelineEvents.map((evt, idx) => (
              <button
                key={idx}
                onClick={() => setActiveTimelineIdx(idx)}
                className={`shrink-0 rounded-xl px-4 py-2.5 text-sm sm:text-base font-bold transition-all cursor-pointer ${
                  activeTimelineIdx === idx
                    ? 'bg-[#00D4FF] text-black shadow-[0_0_15px_rgba(0,212,255,0.3)] scale-105'
                    : 'border border-white/10 bg-[#0C1528] text-gray-200 hover:border-white/20'
                }`}
              >
                <div>{evt.year}</div>
                <div className="text-xs sm:text-sm opacity-85 font-normal">{evt.figure.split(' ')[0]}</div>
              </button>
            ))}
          </div>

          {/* Active Event Detail Card */}
          {(() => {
            const currentEvt = timelineEvents[activeTimelineIdx] || timelineEvents[0];
            const hasTimelineImg = !!scientistPortraits[currentEvt.id];

            return (
              <div className="rounded-2xl border border-[#00D4FF]/30 bg-gradient-to-r from-[#0C1528] to-[#070E1C] p-6 shadow-xl space-y-5">
                {/* Hidden File Input for Current Timeline Event */}
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/webp"
                  className="hidden"
                  ref={(el) => {
                    fileInputRefs.current[currentEvt.id] = el;
                  }}
                  onChange={(e) => handleFileChange(currentEvt.id, e)}
                />

                {/* Header Info Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-xl sm:text-2xl font-extrabold text-[#00D4FF]">
                      Năm {currentEvt.year}
                    </span>
                    <span className="text-xs sm:text-sm px-3 py-1 rounded-full border border-white/10 bg-white/5 text-gray-200">
                      {currentEvt.era}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-base sm:text-lg font-bold text-[#00FFCC]">
                      {currentEvt.figure}
                    </span>
                    {hasTimelineImg ? (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleUploadClick(currentEvt.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-200 text-xs sm:text-sm font-semibold border border-white/10 transition-colors cursor-pointer"
                          title="Thay đổi ảnh"
                        >
                          <Upload className="h-3.5 w-3.5 text-[#00D4FF]" />
                          <span>Đổi ảnh</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeletePortrait(currentEvt.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs sm:text-sm font-semibold border border-rose-500/30 transition-colors cursor-pointer"
                          title="Xóa ảnh này"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span>Xóa ảnh</span>
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleUploadClick(currentEvt.id)}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#00D4FF]/15 hover:bg-[#00D4FF]/25 text-[#00D4FF] text-xs sm:text-sm font-bold border border-[#00D4FF]/30 transition-all cursor-pointer shadow-sm hover:scale-105"
                        title="Tải ảnh 16:9 cho mốc thời gian này"
                      >
                        <Upload className="h-3.5 w-3.5" />
                        <span>{`Tải ảnh ${currentEvt.shortFigure} (16:9)`}</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* 16:9 Infographic Image Frame */}
                <div className="relative w-full">
                  {hasTimelineImg ? (
                    <div className="relative w-full aspect-video md:aspect-[16/9] overflow-hidden rounded-2xl border border-white/20 bg-stone-950/90 shadow-2xl flex items-center justify-center group/img">
                      <img
                        src={scientistPortraits[currentEvt.id]}
                        alt={currentEvt.figure}
                        className="w-full h-full object-contain rounded-xl transition-transform duration-300 group-hover/img:scale-[1.01]"
                      />
                    </div>
                  ) : (
                    <div
                      onClick={() => handleUploadClick(currentEvt.id)}
                      className="aspect-video md:aspect-[16/9] w-full rounded-2xl border-2 border-dashed border-white/20 hover:border-[#00D4FF]/60 bg-black/30 hover:bg-black/40 flex flex-col items-center justify-center p-6 sm:p-8 text-center cursor-pointer transition-all duration-200 group/upload"
                    >
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 group-hover/upload:bg-[#00D4FF]/20 group-hover/upload:text-[#00D4FF] text-gray-300 transition-colors mb-3 shadow-inner">
                        <Camera className="h-7 w-7" />
                      </div>
                      <span className="text-base sm:text-lg font-bold text-white group-hover/upload:text-[#00D4FF] flex items-center gap-2 transition-colors">
                        Tải ảnh Infographic / Chân dung của {currentEvt.figure} (Tỉ lệ 16:9)
                      </span>
                      <p className="text-xs sm:text-sm text-gray-300 mt-2 max-w-lg leading-relaxed">
                        Tải lên tệp ảnh minh họa tỉ lệ chuẩn <strong>16:9</strong> cho mốc lịch sử <strong>{currentEvt.year} - {currentEvt.shortFigure}</strong>. Ảnh sẽ được tự động lưu trữ vĩnh viễn trong IndexedDB.
                      </p>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUploadClick(currentEvt.id);
                        }}
                        className="mt-4 flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#00D4FF] hover:bg-[#00b8e6] text-black font-bold text-xs sm:text-sm transition-all shadow-lg cursor-pointer hover:scale-105"
                      >
                        <Upload className="h-4 w-4" />
                        <span>Tải ảnh {currentEvt.shortFigure} (16:9) lên</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Event Description & Scientific Significance */}
                <div className="rounded-xl bg-black/30 border border-white/10 p-5 space-y-2.5">
                  <h4 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-[#00D4FF]" />
                    <span>{currentEvt.event}</span>
                  </h4>
                  <p className="text-base sm:text-lg leading-relaxed text-gray-100">
                    {currentEvt.detail}
                  </p>
                </div>
              </div>
            );
          })()}
        </div>
      </section>

      {/* III. VAI TRÒ CỦA VẬT LÍ ĐỐI VỚI KHOA HỌC, KĨ THUẬT VÀ CÔNG NGHỆ */}
      <section className="rounded-2xl border border-white/10 bg-[#0C1528]/80 p-6 md:p-8 shadow-xl backdrop-blur-md space-y-6">
        <div className="border-b border-white/10 pb-4">
          <div className="flex items-center gap-2 text-xs sm:text-sm font-bold uppercase tracking-wider text-[#00D4FF]">
            <Cpu className="h-4 w-4" />
            <span>Phần III</span>
          </div>
          <h2 className="mt-1 text-xl md:text-2xl font-extrabold text-white">
            III. Vai trò của Vật lí đối với Khoa học, Kĩ thuật và Công nghệ
          </h2>
        </div>

        {/* a) Cơ sở của KHTN & Liên môn */}
        <div className="space-y-5">
          <h3 className="text-base sm:text-lg font-bold text-[#00FFCC] flex items-center gap-2">
            <Globe className="h-5 w-5" />
            <span>a) Vật lí là cơ sở của Khoa học Tự nhiên (KHTN)</span>
          </h3>
          <p className="text-base sm:text-lg leading-relaxed text-gray-100">
            Vật lí có quan hệ mật thiết với mọi ngành khoa học. Các khái niệm, định luật, nguyên lí của Vật lí được sử dụng rộng rãi để giải thích cơ chế của các hiện tượng tự nhiên:
            từ các hiện tượng xảy ra trong thế giới sinh học, các phản ứng hoá học đến các hiện tượng thiên văn vũ trụ.
          </p>

          {/* Interactive Interdisciplinary Sciences Container */}
          {(() => {
            const interdisciplinaryFields = [
              {
                id: 'biophysics',
                name: 'Vật lí sinh học',
                englishName: 'Biophysics',
                icon: '🧬',
                tag: 'Y học & Sinh học',
                activeTabClass: 'bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-emerald-500/20',
                description:
                  'Nghiên cứu các quy luật vật lí trong các hệ sinh học sống. Ứng dụng đột phá trong y học hiện đại như chụp cộng hưởng từ (MRI), chụp cắt lớp vi tính (CT Scanner), siêu âm Doppler, điện tâm đồ, và phân tích cơ học phân tử ADN, màng tế bào.',
                examples: 'Máy MRI, xạ trị proton ung thư, mô hình chuyển động của cơ bắp, cấu trúc xoắn kép ADN.'
              },
              {
                id: 'geophysics',
                name: 'Vật lí địa lí',
                englishName: 'Geophysics',
                icon: '🌍',
                tag: 'Địa chất & Khí tượng',
                activeTabClass: 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-amber-500/20',
                description:
                  'Nghiên cứu cấu trúc bên trong của Trái Đất và các quá trình vật lí quyển địa chấn, quyển khí và thủy quyển bằng các phương pháp đo địa chấn, từ trường, trọng lực và nhiệt động lực học Trái Đất.',
                examples: 'Hệ thống cảnh báo sớm động đất - sóng thần, thăm dò dầu khí, dự báo bão, đo đạc dịch chuyển mảng kiến tạo.'
              },
              {
                id: 'astrophysics',
                name: 'Vật lí thiên văn',
                englishName: 'Astrophysics',
                icon: '🌌',
                tag: 'Vũ trụ & Thiên văn',
                activeTabClass: 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-cyan-500/20',
                description:
                  'Vận dụng toàn diện các định luật quang học, nhiệt động học, thuyết tương đối và cơ học lượng tử để giải thích bản chất vật lí, sự hình thành, tiến hóa của các ngôi sao, lỗ đen, thiên hà và toàn bộ vũ trụ.',
                examples: 'Kính thiên văn James Webb, phát hiện sóng hấp dẫn, phân tích quang phổ sao, nghiên cứu vật chất tối.'
              },
              {
                id: 'physical_chemistry',
                name: 'Hoá lí',
                englishName: 'Physical Chemistry',
                icon: '⚗️',
                tag: 'Hoá học & Vật liệu',
                activeTabClass: 'bg-blue-500/20 border-blue-400 text-blue-300 shadow-blue-500/20',
                description:
                  'Nghiên cứu các nguyên lí vật lí nền tảng chi phối các tương tác và biến đổi hoá học, bao gồm nhiệt hoá học, động học tốc độ phản ứng, điện hoá học của pin và quá trình xúc tác bề mặt.',
                examples: 'Pin Lithium-ion, pin nhiên liệu hydro, chất siêu dẫn nhiệt độ cao, quang xúc tác tách nước sinh hydro sạch.'
              },
              {
                id: 'quantum_biology',
                name: 'Sinh học lượng tử',
                englishName: 'Quantum Biology',
                icon: '🔬',
                tag: 'Lượng tử sinh học',
                activeTabClass: 'bg-teal-500/20 border-teal-400 text-teal-300 shadow-teal-500/20',
                description:
                  'Ứng dụng cơ học lượng tử và các hiệu ứng phi cổ điển (như hiệu ứng đường ngầm lượng tử, vướng víu lượng tử) để giải thích cơ chế siêu nhạy của tự nhiên như định vị từ trường của chim di cư và hiệu suất quang hợp gần 100%.',
                examples: 'Cơ chế định hướng chim di cư bằng protein Cryptochrome, đường ngầm electron trong enzyme, cơ chế nhận biết mùi.'
              },
              {
                id: 'quantum_chemistry',
                name: 'Hoá học lượng tử',
                englishName: 'Quantum Chemistry',
                icon: '⚛️',
                tag: 'Lượng tử & Mô phỏng',
                activeTabClass: 'bg-purple-500/20 border-purple-400 text-purple-300 shadow-purple-500/20',
                description:
                  'Sử dụng các phương trình cơ học lượng tử (như phương trình Schrödinger) và siêu máy tính để mô phỏng cấu trúc obitan điện tử, dự đoán độ bền liên kết hoá học và thiết kế các loại thuốc điều trị đặc hiệu.',
                examples: 'Mô phỏng thuốc ức chế virus trên siêu máy tính, thiết kế phân tử polymer tự phục hồi, vật liệu lưu trữ năng lượng.'
              }
            ];

            const currentField = interdisciplinaryFields[activeInterdisciplinaryIdx] || interdisciplinaryFields[0];
            const hasFieldImg = !!scientistPortraits[currentField.id];

            return (
              <div className="rounded-2xl border border-white/15 bg-[#070E1C] p-5 sm:p-7 space-y-6">
                {/* Hidden File Input for Current Interdisciplinary Field */}
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/webp"
                  className="hidden"
                  ref={(el) => {
                    fileInputRefs.current[currentField.id] = el;
                  }}
                  onChange={(e) => handleFileChange(currentField.id, e)}
                />

                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs sm:text-sm font-bold text-gray-300 uppercase tracking-wider">
                    Các ngành khoa học liên môn phát triển mạnh mẽ (Click để xem chi tiết & tải ảnh):
                  </span>
                  <span className="text-xs font-mono text-[#00D4FF]">
                    {activeInterdisciplinaryIdx + 1}/{interdisciplinaryFields.length} ngành liên môn
                  </span>
                </div>

                {/* 6 Selector Tabs */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                  {interdisciplinaryFields.map((field, idx) => {
                    const isActive = activeInterdisciplinaryIdx === idx;
                    const hasImg = !!scientistPortraits[field.id];

                    return (
                      <button
                        key={field.id}
                        type="button"
                        onClick={() => setActiveInterdisciplinaryIdx(idx)}
                        className={`relative flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all duration-200 cursor-pointer ${
                          isActive
                            ? `${field.activeTabClass} border-current shadow-lg scale-[1.02]`
                            : 'border-white/10 bg-[#0C1528] text-gray-300 hover:text-white hover:bg-white/5 hover:border-white/20'
                        }`}
                      >
                        <span className="text-xl mb-1">{field.icon}</span>
                        <div className={`font-bold text-xs sm:text-sm ${isActive ? 'text-white' : 'text-[#00D4FF]'}`}>
                          {field.name}
                        </div>
                        <div className="text-[11px] text-gray-400 font-mono mt-0.5">{field.englishName}</div>

                        {hasImg && (
                          <span className="mt-1.5 inline-block text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            Có ảnh
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Detailed Active Field Card with 16:9 Image Frame */}
                <div className="rounded-2xl border border-[#00D4FF]/30 bg-gradient-to-r from-[#0C1528] to-[#08101E] p-5 sm:p-6 shadow-xl space-y-5">
                  {/* Top Bar with Field Title & Action */}
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{currentField.icon}</span>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-lg sm:text-xl font-extrabold text-white">
                            {currentField.name}
                          </h4>
                          <span className="text-xs px-2.5 py-0.5 rounded-full border border-white/10 bg-white/5 text-gray-300 font-mono">
                            {currentField.englishName}
                          </span>
                        </div>
                        <span className="text-xs sm:text-sm text-[#00FFCC] font-medium mt-0.5 block">
                          Lĩnh vực: {currentField.tag}
                        </span>
                      </div>
                    </div>

                    {hasFieldImg ? (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleUploadClick(currentField.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-200 text-xs sm:text-sm font-semibold border border-white/10 transition-colors cursor-pointer"
                          title="Thay đổi ảnh"
                        >
                          <Upload className="h-3.5 w-3.5 text-[#00D4FF]" />
                          <span>Đổi ảnh</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeletePortrait(currentField.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs sm:text-sm font-semibold border border-rose-500/30 transition-colors cursor-pointer"
                          title="Xóa ảnh này"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span>Xóa ảnh</span>
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleUploadClick(currentField.id)}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#00D4FF]/15 hover:bg-[#00D4FF]/25 text-[#00D4FF] text-xs sm:text-sm font-bold border border-[#00D4FF]/30 transition-all cursor-pointer shadow-sm hover:scale-105"
                        title="Tải ảnh 16:9 cho ngành liên môn này"
                      >
                        <Upload className="h-3.5 w-3.5" />
                        <span>{`Tải ảnh ${currentField.name} (16:9)`}</span>
                      </button>
                    )}
                  </div>

                  {/* 16:9 Infographic Image Frame */}
                  <div className="relative w-full">
                    {hasFieldImg ? (
                      <div className="relative w-full aspect-video md:aspect-[16/9] overflow-hidden rounded-2xl border border-white/20 bg-stone-950/90 shadow-2xl flex items-center justify-center group/img">
                        <img
                          src={scientistPortraits[currentField.id]}
                          alt={currentField.name}
                          className="w-full h-full object-contain rounded-xl transition-transform duration-300 group-hover/img:scale-[1.01]"
                        />
                      </div>
                    ) : (
                      <div
                        onClick={() => handleUploadClick(currentField.id)}
                        className="aspect-video md:aspect-[16/9] w-full rounded-2xl border-2 border-dashed border-white/20 hover:border-[#00D4FF]/60 bg-black/30 hover:bg-black/40 flex flex-col items-center justify-center p-6 sm:p-8 text-center cursor-pointer transition-all duration-200 group/upload"
                      >
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 group-hover/upload:bg-[#00D4FF]/20 group-hover/upload:text-[#00D4FF] text-gray-300 transition-colors mb-3 shadow-inner">
                          <Camera className="h-7 w-7" />
                        </div>
                        <span className="text-base sm:text-lg font-bold text-white group-hover/upload:text-[#00D4FF] flex items-center gap-2 transition-colors">
                          Tải ảnh Infographic minh họa cho {currentField.name} (Tỉ lệ 16:9)
                        </span>
                        <p className="text-xs sm:text-sm text-gray-300 mt-2 max-w-lg leading-relaxed">
                          Tải lên hình ảnh sơ đồ, thiết bị hoặc ứng dụng thực tế tỉ lệ chuẩn <strong>16:9</strong> của ngành <strong>{currentField.name} ({currentField.englishName})</strong>.
                        </p>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUploadClick(currentField.id);
                          }}
                          className="mt-4 flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#00D4FF] hover:bg-[#00b8e6] text-black font-bold text-xs sm:text-sm transition-all shadow-lg cursor-pointer hover:scale-105"
                        >
                          <Upload className="h-4 w-4" />
                          <span>Tải ảnh {currentField.name} (16:9) lên</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Field Detailed Role & Applications */}
                  <div className="rounded-xl bg-black/30 border border-white/10 p-5 space-y-3">
                    <div>
                      <span className="text-xs font-bold text-[#00FFCC] uppercase tracking-wider block mb-1">
                        Bản chất & Mối liên hệ với Vật lí:
                      </span>
                      <p className="text-base sm:text-lg leading-relaxed text-gray-100">
                        {currentField.description}
                      </p>
                    </div>
                    <div className="pt-2 border-t border-white/10">
                      <span className="text-xs font-bold text-[#00D4FF] uppercase tracking-wider block mb-1">
                        Ứng dụng & Thành tựu tiêu biểu:
                      </span>
                      <p className="text-sm sm:text-base text-gray-300 italic">
                        {currentField.examples}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>

        {/* b) 4 Cuộc cách mạng công nghiệp */}
        <div className="space-y-4 pt-3">
          <h3 className="text-base sm:text-lg font-bold text-[#00D4FF] flex items-center gap-2">
            <Zap className="h-5 w-5" />
            <span>b) Vật lí là cơ sở của Công nghệ qua 4 Cuộc Cách mạng Công nghiệp</span>
          </h3>
          <p className="text-base sm:text-lg text-cyan-200 italic font-medium">
            "Có thể khẳng định là không có các thành tựu nghiên cứu của Vật lí thì không có công nghệ."
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* CMCN 1 */}
            <div className="rounded-2xl border border-amber-500/20 bg-[#070E1C] p-5 sm:p-6 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs sm:text-sm font-bold text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded">
                  Cách mạng lần 1 (1765)
                </span>
                <Factory className="h-5 w-5 text-amber-400" />
              </div>
              <h4 className="text-base sm:text-lg font-bold text-white">Máy hơi nước James Watt & Động cơ nhiệt</h4>
              <p className="text-base sm:text-lg text-gray-100 leading-relaxed">
                Năm 1765, James Watt sáng chế máy hơi nước dựa trên các nghiên cứu về Nhiệt học.
                Đặc trưng cơ bản là <strong>thay thế sức lực cơ bắp bằng sức lực máy móc</strong>.
              </p>
            </div>

            {/* CMCN 2 */}
            <div className="rounded-2xl border border-cyan-500/20 bg-[#070E1C] p-5 sm:p-6 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs sm:text-sm font-bold text-cyan-400 bg-cyan-400/10 px-2.5 py-1 rounded">
                  Cách mạng lần 2 (Cuối TK XIX)
                </span>
                <Zap className="h-5 w-5 text-cyan-400" />
              </div>
              <h4 className="text-base sm:text-lg font-bold text-white">Cảm ứng điện từ & Kỉ nguyên Điện năng</h4>
              <p className="text-base sm:text-lg text-gray-100 leading-relaxed">
                Nhờ phát hiện cảm ứng điện từ của Faraday (1831), máy phát điện ra đời.
                Đặc trưng: <strong>xuất hiện các thiết bị dùng điện trong sản xuất và đời sống</strong> (nhà máy thủy điện, động cơ điện).
              </p>
            </div>

            {/* CMCN 3 */}
            <div className="rounded-2xl border border-blue-500/20 bg-[#070E1C] p-5 sm:p-6 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs sm:text-sm font-bold text-blue-400 bg-blue-400/10 px-2.5 py-1 rounded">
                  Cách mạng lần 3 (Những năm 70 TK XX)
                </span>
                <Cpu className="h-5 w-5 text-blue-400" />
              </div>
              <h4 className="text-base sm:text-lg font-bold text-white">Chất bán dẫn, Vi mạch & Tự động hoá</h4>
              <p className="text-base sm:text-lg text-gray-100 leading-relaxed">
                Nghiên cứu về điện tử học, vật liệu bán dẫn (silicon) và vi mạch IC.
                Đặc trưng: <strong>tự động hoá các dây chuyền sản xuất công nghiệp</strong> (lắp ráp ô tô, máy tính cá nhân).
              </p>
            </div>

            {/* CMCN 4 */}
            <div className="rounded-2xl border border-[#00FFCC]/20 bg-[#070E1C] p-5 sm:p-6 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs sm:text-sm font-bold text-[#00FFCC] bg-[#00FFCC]/10 px-2.5 py-1 rounded">
                  Cách mạng lần 4 (Đầu TK XXI)
                </span>
                <Bot className="h-5 w-5 text-[#00FFCC]" />
              </div>
              <h4 className="text-base sm:text-lg font-bold text-white">AI, Robot, Nano & Thành phố thông minh</h4>
              <p className="text-base sm:text-lg text-gray-100 leading-relaxed">
                Dựa trên vật lí lượng tử, quang điện tử và vật liệu nano.
                Đặc trưng: <strong>trí tuệ nhân tạo (AI), robot tự hành, Internet vạn vật (IoT), bóng đèn/nhà ở/nhà máy thông minh</strong>.
              </p>
            </div>
          </div>
        </div>

        {/* c) Tác động môi trường & Trách nhiệm xã hội */}
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-5 sm:p-6 space-y-3">
          <h3 className="text-base sm:text-lg font-bold text-red-300 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-400" />
            <span>c) Tác động tiêu cực đối với môi trường nếu không sử dụng đúng mục đích</span>
          </h3>
          <p className="text-base sm:text-lg leading-relaxed text-gray-100">
            Việc ứng dụng các thành tựu của Vật lí vào công nghệ nếu không có sự kiểm soát chặt chẽ có thể dẫn đến:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-base">
            <div className="rounded-xl border border-red-500/20 bg-[#070E1C] p-4 sm:p-5">
              <span className="font-bold text-red-300 block mb-1.5 text-base sm:text-lg">🏭 Ô nhiễm khí thải & Biến đổi khí hậu:</span>
              <span className="text-gray-100 leading-relaxed text-sm sm:text-base">Khí thải từ các nhà máy nhiệt điện, động cơ đốt trong gây hiệu ứng nhà kính và mưa axit.</span>
            </div>
            <div className="rounded-xl border border-red-500/20 bg-[#070E1C] p-4 sm:p-5">
              <span className="font-bold text-red-300 block mb-1.5 text-base sm:text-lg">☢️ Nguy cơ phóng xạ & Vũ khí hạt nhân:</span>
              <span className="text-gray-100 leading-relaxed text-sm sm:text-base">Tai nạn nhà máy điện hạt nhân hoặc vũ khí hủy diệt hàng loạt đe dọa trực tiếp sự tồn vong của sinh quyển.</span>
            </div>
          </div>
        </div>

        {/* Discussion questions for Section III */}
        <div className="rounded-xl border border-indigo-500/30 bg-indigo-500/10 p-5 sm:p-6">
          <button
            onClick={() => toggleQuestion('part3-q1')}
            className="flex w-full items-center justify-between text-left text-base sm:text-lg font-bold text-indigo-300 hover:text-indigo-200 cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <HelpCircle className="h-5 w-5 shrink-0 text-indigo-400" />
              <span>? Thảo luận trang 8 & 9: Các câu hỏi liên môn và so sánh công nghệ</span>
            </div>
            {openQuestions['part3-q1'] ? <ChevronUp className="h-5 w-5 shrink-0" /> : <ChevronDown className="h-5 w-5 shrink-0" />}
          </button>

          {openQuestions['part3-q1'] && (
            <div className="mt-4 border-t border-indigo-500/20 pt-4 text-base sm:text-lg leading-relaxed text-gray-100 space-y-4">
              <div>
                <strong className="text-indigo-200">1. Cơ chế phản ứng hoá học được giải thích dựa trên lĩnh vực nào?</strong>
                <p className="text-gray-100 mt-1">👉 Dựa trên <em>Vật lí nguyên tử và Vật lí lượng tử</em> (sự tương tác và trao đổi electron giữa các lớp vỏ nguyên tử).</p>
              </div>
              <div>
                <strong className="text-indigo-200">2. Từ trường Trái Đất giải thích đặc điểm nào của loài chim di trú?</strong>
                <p className="text-gray-100 mt-1">👉 Giải thích khả năng <em>định hướng phương hướng bay</em> nghìn cây số mà không bị lạc đường nhờ các hạt từ tính sinh học trong cơ thể chim cảm nhận từ trường Trái Đất.</p>
              </div>
              <div>
                <strong className="text-indigo-200">3. Ưu điểm vượt trội của động cơ điện so với máy hơi nước:</strong>
                <p className="text-gray-100 mt-1">👉 Hiệu suất cao hơn rất nhiều (trên 90% so với xấp xỉ 10-15%), khởi động nhanh, nhỏ gọn, không thải trực tiếp khói bụi độc hại tại nơi vận hành.</p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* IV. PHƯƠNG PHÁP NGHIÊN CỨU VẬT LÍ */}
      <section className="rounded-2xl border border-white/10 bg-[#070E1C]/90 p-6 md:p-8 shadow-xl backdrop-blur-md space-y-8">
        <div className="border-b border-white/10 pb-4">
          <div className="flex items-center gap-2 text-xs sm:text-sm font-bold uppercase tracking-wider text-[#00D4FF]">
            <Compass className="h-4 w-4" />
            <span>Phần IV</span>
          </div>
          <h2 className="mt-1 text-xl md:text-2xl font-extrabold text-white">
            IV. Phương pháp nghiên cứu Vật lí
          </h2>
          <p className="text-base sm:text-lg text-gray-100 mt-2">
            Hai phương pháp nghiên cứu cốt lõi thường được sử dụng trong Vật lí là <strong>Phương pháp thực nghiệm</strong> và <strong>Phương pháp mô hình</strong>.
          </p>
        </div>

        {/* 1. PHƯƠNG PHÁP THỰC NGHIỆM */}
        <div className="space-y-5">
          <div className="flex items-center gap-2 text-lg sm:text-xl font-bold text-white border-l-4 border-[#00D4FF] pl-3">
            <span>1. Phương pháp thực nghiệm</span>
          </div>

          {/* Aristotle vs Galilei Story */}
          <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-b from-[#0C1528] to-[#070E1C] p-6 space-y-4">
            <h4 className="text-base sm:text-lg font-bold text-amber-300 flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              <span>Câu chuyện lịch sử: Sự đối lập giữa Quan niệm Aristotle và Thí nghiệm Galilei</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-base sm:text-lg">
              <div className="rounded-xl border border-white/10 bg-[#070E1C] p-5 space-y-3">
                <span className="font-bold text-amber-400 block text-base sm:text-lg">🏛️ Quan niệm Aristotle (350 TCN)</span>
                <p className="text-gray-100 leading-relaxed">
                  • Khẳng định: <em>"Vật nặng rơi nhanh hơn vật nhẹ, vật càng nặng rơi càng nhanh."</em>
                </p>
                <p className="text-gray-100 leading-relaxed">
                  • Lập luận suy luận: 4 hòn đá buộc lại với nhau rơi nhanh gấp 4 lần 1 hòn đá (giống xe kéo bằng 4 con ngựa chạy nhanh gấp 4 lần xe 1 con ngựa).
                </p>
                <p className="text-gray-400 italic text-sm sm:text-base">
                  Chỉ dừng lại ở quan sát và suy luận chủ quan, không làm thí nghiệm kiểm chứng. Vì uy tín của ông, quan niệm này tồn tại gần 20 thế kỉ!
                </p>
              </div>

              <div className="rounded-xl border border-cyan-500/30 bg-[#070E1C] p-5 space-y-3">
                <span className="font-bold text-[#00D4FF] block text-base sm:text-lg">🗼 Thí nghiệm Galilei (Thế kỉ XVI)</span>
                <p className="text-gray-100 leading-relaxed">
                  • Quan sát hạt mưa to/nhỏ và hạt tuyết rơi như nhau.
                </p>
                <p className="text-gray-100 leading-relaxed">
                  • Đưa ra dự đoán: <em>Sự rơi nhanh hay chậm không phụ thuộc vào vật nặng hay nhẹ</em>.
                </p>
                <p className="text-gray-100 leading-relaxed">
                  • <strong>Thí nghiệm tháp nghiêng Pisa:</strong> Thả đồng thời 2 quả cầu kim loại nặng gấp nhau 10 lần. Cả hai cùng chạm đất cùng một lúc trước hàng trăm người dân chứng kiến!
                </p>
              </div>
            </div>
          </div>

          {/* 5 Steps of Experimental Method */}
          <div className="space-y-3">
            <h4 className="text-sm sm:text-base font-bold uppercase tracking-wider text-gray-300">
              Sơ đồ 5 bước của Phương pháp Thực nghiệm (Hình 1.8 SGK):
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
              {[
                { step: '1', title: 'Xác định vấn đề', desc: 'Có đúng vật nặng rơi nhanh hơn vật nhẹ không?' },
                { step: '2', title: 'Quan sát & Thu thập', desc: 'Quan sát giọt mưa to/nhỏ rơi trong thực tế.' },
                { step: '3', title: 'Đưa ra dự đoán', desc: 'Sự rơi không phụ thuộc khối lượng vật.' },
                { step: '4', title: 'Thí nghiệm kiểm tra', desc: 'Thả 2 quả cầu chì tại tháp nghiêng Pisa.' },
                { step: '5', title: 'Kết luận', desc: 'Khẳng định dự đoán đúng hoặc điều chỉnh lại.' },
              ].map((st) => (
                <div
                  key={st.step}
                  className="rounded-xl border border-[#00D4FF]/20 bg-[#0C1528] p-4 flex flex-col justify-between hover:border-[#00D4FF] transition-all"
                >
                  <div>
                    <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#00D4FF] text-black font-extrabold text-sm mb-2.5">
                      {st.step}
                    </div>
                    <div className="text-sm sm:text-base font-bold text-white">{st.title}</div>
                    <div className="text-xs sm:text-sm text-gray-200 mt-1.5 leading-relaxed">{st.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 2. PHƯƠNG PHÁP MÔ HÌNH */}
        <div className="space-y-5 pt-4 border-t border-white/10">
          <div className="flex items-center gap-2 text-lg sm:text-xl font-bold text-white border-l-4 border-[#00FFCC] pl-3">
            <span>2. Phương pháp mô hình</span>
          </div>

          <p className="text-base sm:text-lg leading-relaxed text-gray-100">
            Phương pháp mô hình là phương pháp dùng các <strong>mô hình</strong> để nghiên cứu, giải thích các tính chất của vật thật, tìm ra cơ chế hoạt động của nó trong tự nhiên.
          </p>

          {/* 3 Model Types */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-2xl border border-white/10 bg-[#0C1528] p-5 sm:p-6 space-y-3">
              <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded">
                Loại 1
              </span>
              <h4 className="text-base sm:text-lg font-bold text-white">Mô hình vật chất</h4>
              <p className="text-sm sm:text-base text-gray-200 leading-relaxed">
                Là các vật thu nhỏ hoặc phóng to của vật thật, có một số đặc điểm giống vật thật.
              </p>
              <div className="text-sm sm:text-base text-amber-300 font-medium leading-relaxed">
                • Ví dụ: Quả địa cầu thu nhỏ Trái Đất, mô hình hệ Mặt Trời, mô hình nguyên tử Rutherford phóng to.
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-[#0C1528] p-5 sm:p-6 space-y-3">
              <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-cyan-400 bg-cyan-400/10 px-2.5 py-1 rounded">
                Loại 2
              </span>
              <h4 className="text-base sm:text-lg font-bold text-white">Mô hình lí thuyết</h4>
              <p className="text-sm sm:text-base text-gray-200 leading-relaxed">
                Các khái niệm trừu tượng lí tưởng hóa để bỏ qua các yếu tố phụ không đáng kể.
              </p>
              <div className="text-sm sm:text-base text-cyan-300 font-medium leading-relaxed">
                • Ví dụ: "Chất điểm" khi ô tô chạy đường dài, "tia sáng" biểu diễn đường truyền ánh sáng thẳng.
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-[#0C1528] p-5 sm:p-6 space-y-3">
              <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#00FFCC] bg-[#00FFCC]/10 px-2.5 py-1 rounded">
                Loại 3
              </span>
              <h4 className="text-base sm:text-lg font-bold text-white">Mô hình toán học</h4>
              <p className="text-sm sm:text-base text-gray-200 leading-relaxed">
                Các công thức, phương trình, đồ thị, kí hiệu toán học mô tả quan hệ giữa các đại lượng.
              </p>
              <div className="text-sm sm:text-base text-[#00FFCC] font-medium leading-relaxed">
                • Ví dụ: Vectơ lực (kí hiệu vectơ), phương trình chuyển động s = v.t, đồ thị toạ độ - thời gian s-t và vận tốc - thời gian v-t.
              </div>
            </div>
          </div>

          {/* 4 Steps of Modeling Method */}
          <div className="space-y-3">
            <h4 className="text-sm sm:text-base font-bold uppercase tracking-wider text-gray-300">
              Sơ đồ 4 bước của Quy trình xây dựng mô hình (Hình 1.10 SGK):
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3.5">
              <div className="rounded-xl border border-[#00FFCC]/20 bg-[#0C1528] p-4 space-y-1">
                <div className="font-extrabold text-sm sm:text-base text-[#00FFCC]">Bước 1</div>
                <div className="text-sm sm:text-base font-bold text-white">Xác định đối tượng</div>
                <div className="text-xs sm:text-sm text-gray-200 leading-relaxed">Chọn đối tượng cần được mô hình hoá.</div>
              </div>
              <div className="rounded-xl border border-[#00FFCC]/20 bg-[#0C1528] p-4 space-y-1">
                <div className="font-extrabold text-sm sm:text-base text-[#00FFCC]">Bước 2</div>
                <div className="text-sm sm:text-base font-bold text-white">Xây dựng mô hình</div>
                <div className="text-xs sm:text-sm text-gray-200 leading-relaxed">Đưa ra mô hình giả thuyết ban đầu.</div>
              </div>
              <div className="rounded-xl border border-[#00FFCC]/20 bg-[#0C1528] p-4 space-y-1">
                <div className="font-extrabold text-sm sm:text-base text-[#00FFCC]">Bước 3</div>
                <div className="text-sm sm:text-base font-bold text-white">Kiểm tra sự phù hợp</div>
                <div className="text-xs sm:text-sm text-gray-200 leading-relaxed">Đối chiếu kết quả thí nghiệm & điều chỉnh nếu cần.</div>
              </div>
              <div className="rounded-xl border border-[#00FFCC]/20 bg-[#0C1528] p-4 space-y-1">
                <div className="font-extrabold text-sm sm:text-base text-[#00FFCC]">Bước 4</div>
                <div className="text-sm sm:text-base font-bold text-white">Kết luận</div>
                <div className="text-xs sm:text-sm text-gray-200 leading-relaxed">Kết luận và áp dụng mô hình vào thực tiễn.</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* EM ĐÃ HỌC (GHI NHỚ) & EM CÓ THỂ (VẬN DỤNG) */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="rounded-2xl border border-[#00D4FF]/30 bg-gradient-to-b from-[#00D4FF]/10 to-[#070E1C] p-6 sm:p-7 space-y-3.5">
          <div className="flex items-center gap-2 text-base sm:text-lg font-bold text-[#00D4FF] uppercase tracking-wider">
            <CheckCircle2 className="h-5 w-5" />
            <span>EM ĐÃ HỌC (Ghi nhớ cốt lõi)</span>
          </div>
          <ul className="space-y-2.5 text-base sm:text-lg text-gray-100 leading-relaxed">
            <li className="flex items-start gap-2.5">
              <span className="text-[#00D4FF] font-bold text-xl">•</span>
              <span><strong>Đối tượng nghiên cứu chủ yếu</strong> của Vật lí là các dạng của vật chất và năng lượng.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="text-[#00D4FF] font-bold text-xl">•</span>
              <span><strong>Phương pháp nghiên cứu</strong> thường sử dụng của Vật lí là <em>Phương pháp thực nghiệm</em> và <em>Phương pháp mô hình</em>.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="text-[#00D4FF] font-bold text-xl">•</span>
              <span>Vật lí được coi là <strong>cơ sở của Khoa học Tự nhiên và Công nghệ</strong>.</span>
            </li>
          </ul>
        </div>

        <div className="rounded-2xl border border-[#00FFCC]/30 bg-gradient-to-b from-[#00FFCC]/10 to-[#070E1C] p-6 sm:p-7 space-y-3.5">
          <div className="flex items-center gap-2 text-base sm:text-lg font-bold text-[#00FFCC] uppercase tracking-wider">
            <Sparkles className="h-5 w-5" />
            <span>EM CÓ THỂ (Thử thách vận dụng)</span>
          </div>
          <p className="text-base sm:text-lg text-gray-100 leading-relaxed">
            Dự đoán về sự phụ thuộc tốc độ bay hơi của nước vào nhiệt độ nước và gió thổi trên mặt nước, rồi lập phương án thí nghiệm kiểm tra dự đoán:
          </p>
          <div className="rounded-xl border border-white/10 bg-[#070E1C] p-4 sm:p-5 text-sm sm:text-base text-gray-100 space-y-2 leading-relaxed">
            <div>• <strong>Dự đoán:</strong> Nhiệt độ càng cao và gió thổi càng mạnh thì tốc độ bay hơi càng nhanh.</div>
            <div>• <strong>Thí nghiệm:</strong> Lấy 2 đĩa nước cùng lượng nước: 1 đĩa hơ ấm/quạt gió, 1 đĩa để yên trong phòng mát để so sánh thời gian cạn.</div>
          </div>
        </div>
      </section>
    </div>
  );
};
