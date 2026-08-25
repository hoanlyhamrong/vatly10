import React, { useState, useMemo } from 'react';
import { 
  BookOpen, 
  Search, 
  CheckCircle2, 
  HelpCircle, 
  Sparkles, 
  Copy, 
  Check, 
  ChevronRight, 
  Filter, 
  AlertTriangle, 
  Bot, 
  GraduationCap, 
  Bookmark, 
  ArrowUpRight,
  Printer,
  Compass,
  FileSpreadsheet,
  CheckSquare,
  Play,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { SGK_SOLUTIONS_DATA, SgkQuestionItem } from '../../data/sgkSolutionsData';
import { CHAPTERS } from '../../data/curriculumData';
import { Lesson10FreeFallSgkInteractive } from '../simulations/Lesson10FreeFallSgkInteractive';
import { ToyCarSpeedExperimentSim } from '../simulations/ToyCarSpeedExperimentSim';
import { TangentRulerVelocitySim } from '../simulations/TangentRulerVelocitySim';
import { Lesson4IntersectionSimulation } from '../simulations/Lesson4IntersectionSimulation';
import { Lesson4ThreePathsSimulation } from '../simulations/Lesson4ThreePathsSimulation';
import { Lesson4HanoiHaiPhongSimulation } from '../simulations/Lesson4HanoiHaiPhongSimulation';
import { Lesson4BicycleTripSimulation } from '../simulations/Lesson4BicycleTripSimulation';
import { Lesson4CarTripSimulation } from '../simulations/Lesson4CarTripSimulation';
import { Lesson4SwimmerRiverSimulation } from '../simulations/Lesson4SwimmerRiverSimulation';
import { FormattedPhysicsText, InlinePhysicsText } from '../ui/FormattedPhysicsText';

interface SgkSolutionsViewProps {
  onOpenAI?: (context?: { chapterTitle?: string; lessonTitle?: string; formulas?: string[]; customPrompt?: string }) => void;
  onNavigateLesson?: (lessonId: number) => void;
}

export const SgkSolutionsView: React.FC<SgkSolutionsViewProps> = ({
  onOpenAI,
  onNavigateLesson
}) => {
  const [selectedChapterId, setSelectedChapterId] = useState<number>(1);
  const [selectedLessonId, setSelectedLessonId] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('ALL');
  const [filterGroup, setFilterGroup] = useState<string>('ALL');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedChapter, setCopiedChapter] = useState<boolean>(false);
  const [activeInteractiveSim, setActiveInteractiveSim] = useState<string | null>(null);
  const [lesson4SimTab, setLesson4SimTab] = useState<'SWIMMER_RIVER' | 'CAR_TRIP' | 'BICYCLE_TRIP' | 'HANOI_HAIPHONG' | 'THREE_PATHS' | 'INTERSECTION'>('SWIMMER_RIVER');

  // Available chapters list
  const currentChapter = useMemo(() => {
    return SGK_SOLUTIONS_DATA.find((c) => c.chapterId === selectedChapterId) || SGK_SOLUTIONS_DATA[0];
  }, [selectedChapterId]);

  // Current lesson solutions
  const currentLesson = useMemo(() => {
    return currentChapter.lessons.find((l) => l.lessonId === selectedLessonId) || currentChapter.lessons[0];
  }, [currentChapter, selectedLessonId]);

  // Filtered questions based on search & tags
  const filteredQuestions = useMemo(() => {
    let list: SgkQuestionItem[] = [];

    if (searchQuery.trim()) {
      // Search across ALL chapters if user typed something
      for (const ch of SGK_SOLUTIONS_DATA) {
        for (const les of ch.lessons) {
          for (const q of les.questions) {
            const matchesQuery = 
              q.prompt.toLowerCase().includes(searchQuery.toLowerCase()) ||
              q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
              q.section.toLowerCase().includes(searchQuery.toLowerCase()) ||
              q.finalAnswer.toLowerCase().includes(searchQuery.toLowerCase()) ||
              les.lessonTitle.toLowerCase().includes(searchQuery.toLowerCase());
            
            if (matchesQuery) {
              list.push(q);
            }
          }
        }
      }
    } else {
      list = currentLesson ? [...currentLesson.questions] : [];
    }

    if (filterType !== 'ALL') {
      list = list.filter((q) => q.type === filterType);
    }

    if (filterGroup !== 'ALL') {
      list = list.filter((q) => q.targetCompetencyGroup === filterGroup);
    }

    return list;
  }, [searchQuery, currentLesson, filterType, filterGroup]);

  // Copy single question solution
  const handleCopyQuestion = (q: SgkQuestionItem) => {
    const text = `### ${q.title} (${q.section} - Trang ${q.page})
**Đề bài:**
${q.prompt}

${q.summary ? `**Tóm tắt:** ${q.summary}\n` : ''}${q.frameOfReference ? `**Hệ quy chiếu / Chiều dương:** ${q.frameOfReference}\n` : ''}${q.formula ? `**Công thức áp dụng:** ${q.formula}\n` : ''}
**Lời giải chi tiết:**
${q.stepByStepSolution.join('\n\n')}

**Đáp số / Kết luận:** ${q.finalAnswer}
${q.pedagogicalNote ? `\n*Lưu ý sư phạm:* ${q.pedagogicalNote}` : ''}
${q.errorWarning ? `\n*Cảnh báo lỗi sai:* ${q.errorWarning}` : ''}
`;
    navigator.clipboard.writeText(text);
    setCopiedId(q.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Copy entire lesson solutions as Markdown
  const handleCopyLessonMarkdown = () => {
    if (!currentLesson) return;
    let md = `# LỜI GIẢI CHI TIẾT CÂU HỎI & BÀI TẬP SGK VẬT LÍ 10
**${currentChapter.romanNumeral}. ${currentChapter.chapterTitle} - Bài ${currentLesson.lessonNumber}: ${currentLesson.lessonTitle}**
*Bộ sách: Kết nối tri thức với cuộc sống | Phạm vi: ${currentLesson.pageRange}*

---

`;
    currentLesson.questions.forEach((q, idx) => {
      md += `## ${idx + 1}. ${q.title} (${q.section} - Trang ${q.page})
**Câu hỏi:**
${q.prompt}

${q.summary ? `*Tóm tắt:* ${q.summary}\n` : ''}${q.frameOfReference ? `*Hệ quy chiếu:* ${q.frameOfReference}\n` : ''}
**Lời giải chuẩn mực:**
${q.stepByStepSolution.join('\n\n')}

**👉 Kết luận / Đáp số:** ${q.finalAnswer}
${q.pedagogicalNote ? `*Định hướng sư phạm:* ${q.pedagogicalNote}\n` : ''}
---

`;
    });

    navigator.clipboard.writeText(md);
    setCopiedChapter(true);
    setTimeout(() => setCopiedChapter(false), 2500);
  };

  return (
    <div id="sgk-solutions-view" className="space-y-6">
      
      {/* 1. Header Banner */}
      <div className="rounded-2xl border border-[#00D4FF]/30 bg-gradient-to-r from-[#0C1528] via-[#09152F] to-[#060D1E] p-6 sm:p-8 shadow-[0_0_35px_rgba(0,212,255,0.15)] relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-[#00D4FF]/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-[#00D4FF]/15 text-[#00D4FF] border border-[#00D4FF]/30">
                SGK VẬT LÍ 10 KẾT NỐI TRI THỨC VỚI CUỘC SỐNG
              </span>
              <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-white/5 text-gray-300 border border-white/10">
                7 Chương • 34 Bài
              </span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white flex items-center gap-3">
              <BookOpen className="h-8 w-8 text-[#00D4FF]" />
              <span>HỆ THỐNG GIẢI CHI TIẾT CÂU HỎI & BÀI TẬP SGK</span>
            </h1>

            <p className="text-sm sm:text-base text-gray-300 max-w-3xl leading-relaxed">
              Giải tường minh toàn bộ câu hỏi <strong>?</strong> trong bài, hoạt động khởi động, vận dụng và bài tập tự luyện cuối bài với đầy đủ các bước: <span className="text-[#00FFCC] font-semibold">Tóm tắt đề ➔ Chọn hệ quy chiếu & chiều dương ➔ Công thức gốc ➔ Thay số & Đơn vị chuẩn</span>.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleCopyLessonMarkdown}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600/90 hover:bg-emerald-600 text-white text-xs sm:text-sm font-bold border border-emerald-400/40 shadow-lg transition-all cursor-pointer hover:scale-105 active:scale-95"
              title="Sao chép toàn bộ lời giải bài này dạng Markdown để dán vào Word/Excel"
            >
              {copiedChapter ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              <span>{copiedChapter ? 'Đã sao chép Markdown!' : 'Xuất Lời Giải Bài Này'}</span>
            </button>

            {onOpenAI && (
              <button
                onClick={() => onOpenAI({
                  chapterTitle: currentChapter.chapterTitle,
                  lessonTitle: currentLesson?.lessonTitle,
                  customPrompt: `Giải thích chi tiết các bài toán trong ${currentLesson?.lessonTitle}`
                })}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#2563EB] hover:bg-[#3B82F6] text-white text-xs sm:text-sm font-bold border border-blue-400/30 shadow-lg transition-all cursor-pointer hover:scale-105 active:scale-95"
              >
                <Bot className="h-4 w-4" />
                <span>Hỏi Gia Sư AI</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. Chapter & Lesson Navigation Selector */}
      <div className="space-y-4">
        {/* Chapter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
          {SGK_SOLUTIONS_DATA.map((ch) => {
            const isSelected = selectedChapterId === ch.chapterId;
            return (
              <button
                key={ch.chapterId}
                onClick={() => {
                  setSelectedChapterId(ch.chapterId);
                  setSelectedLessonId(ch.lessons[0].lessonId);
                }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer border ${
                  isSelected
                    ? 'bg-[#3B82F6] text-white border-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.4)] scale-105'
                    : 'bg-[#0A1224] text-gray-300 border-white/10 hover:border-white/25 hover:text-white'
                }`}
              >
                <span className="font-mono text-[#00D4FF]">{ch.romanNumeral}</span>
                <span>{ch.chapterTitle}</span>
              </button>
            );
          })}
        </div>

        {/* Lessons in Selected Chapter */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {currentChapter.lessons.map((les) => {
            const isSelected = selectedLessonId === les.lessonId;
            return (
              <div
                key={les.lessonId}
                onClick={() => setSelectedLessonId(les.lessonId)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                  isSelected
                    ? 'border-[#00D4FF] bg-[#00D4FF]/15 text-white shadow-[0_0_15px_rgba(0,212,255,0.15)]'
                    : 'border-white/10 bg-[#070E1C] text-gray-300 hover:bg-white/5 hover:border-white/20'
                }`}
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-[#00FFCC]">Bài {les.lessonNumber}</span>
                    <span className="text-[11px] text-gray-400 font-mono">({les.pageRange})</span>
                  </div>
                  <h4 className="text-sm font-bold truncate text-white">
                    {les.lessonTitle}
                  </h4>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs px-2 py-0.5 rounded-md bg-black/40 border border-white/10 text-gray-300">
                    {les.questions.length} câu
                  </span>
                  {onNavigateLesson && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onNavigateLesson(les.lessonId);
                      }}
                      className="p-1.5 rounded-lg bg-white/10 hover:bg-[#00D4FF] hover:text-black text-gray-300 transition-colors"
                      title="Mở nội dung bài giảng & mô phỏng thí nghiệm"
                    >
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Search and Quick Filters Bar */}
      <div className="rounded-xl border border-white/10 bg-[#070E1C] p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Box */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm theo từ khóa câu hỏi, công thức, số trang, bài học..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#0C1528] border border-white/10 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-[#00D4FF]"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-white"
            >
              Xóa
            </button>
          )}
        </div>

        {/* Filter Badges */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-gray-400 flex items-center gap-1 font-semibold">
            <Filter className="h-3.5 w-3.5" /> Phân loại:
          </span>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-[#0C1528] border border-white/10 text-gray-200 text-xs focus:outline-none focus:border-[#00D4FF]"
          >
            <option value="ALL">Tất cả thể loại</option>
            <option value="IN_TEXT_QUESTION">Câu hỏi trong bài (?)</option>
            <option value="EXERCISE">Bài tập tính toán & Vận dụng</option>
            <option value="EM_CO_THE">Em có thể / Thực hành</option>
          </select>

          <select
            value={filterGroup}
            onChange={(e) => setFilterGroup(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-[#0C1528] border border-white/10 text-gray-200 text-xs focus:outline-none focus:border-[#00D4FF]"
          >
            <option value="ALL">Tất cả Nhóm Năng Lực</option>
            <option value="Nhóm A">Nhóm A (&lt; 7.0 - Bù nền)</option>
            <option value="Nhóm B">Nhóm B (7.0-7.75 - Biến đổi)</option>
            <option value="Nhóm C">Nhóm C (8.0-8.75 - Vận dụng)</option>
            <option value="Nhóm D">Nhóm D (&gt;= 9.0 - Nâng cao)</option>
          </select>
        </div>
      </div>

      {/* 3.5. Featured 3D Interactive Lab for Lesson 3 */}
      {currentLesson?.lessonId === 3 && !searchQuery.trim() && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-[#00D4FF]" />
              <span className="text-sm font-bold text-white uppercase tracking-wider">
                Mô Phỏng 3D: Phương án đo tốc độ xe ô tô đồ chơi (Trang 17 SGK)
              </span>
            </div>
            <button
              onClick={() => setActiveInteractiveSim(activeInteractiveSim === 'FEATURED' ? null : 'FEATURED')}
              className="text-xs font-bold text-[#00D4FF] hover:text-cyan-300 flex items-center gap-1 cursor-pointer bg-white/5 px-3 py-1.5 rounded-lg border border-white/10"
            >
              {activeInteractiveSim === 'FEATURED' ? (
                <><span>Thu gọn mô phỏng</span> <ChevronUp className="h-4 w-4" /></>
              ) : (
                <><span>Mở phòng thí nghiệm 3D</span> <ChevronDown className="h-4 w-4" /></>
              )}
            </button>
          </div>

          {(activeInteractiveSim === 'FEATURED' || activeInteractiveSim === null) && (
            <ToyCarSpeedExperimentSim />
          )}
        </div>
      )}

      {/* 3.5a. Featured Interactive Labs for Lesson 4 (Intersection 4 ways & Three Paths Figure 4.6) */}
      {currentLesson?.lessonId === 4 && !searchQuery.trim() && (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-[#00D4FF]" />
              <span className="text-sm font-bold text-white uppercase tracking-wider">
                Mô Phỏng 3D Tương Tác SGK Bài 4 (Độ dịch chuyển & Quãng đường)
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Tab Selector between the 6 simulations of Lesson 4 */}
              <div className="flex items-center bg-[#0C1629] p-1 rounded-xl border border-white/10 text-xs overflow-x-auto">
                <button
                  onClick={() => setLesson4SimTab('SWIMMER_RIVER')}
                  className={`px-3 py-1 rounded-lg font-bold transition-all whitespace-nowrap cursor-pointer ${
                    lesson4SimTab === 'SWIMMER_RIVER'
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md'
                      : 'text-gray-400 hover:text-gray-200'
                  }`}
                >
                  Bài 2: Người bơi qua sông (Trang 25)
                </button>
                <button
                  onClick={() => setLesson4SimTab('CAR_TRIP')}
                  className={`px-3 py-1 rounded-lg font-bold transition-all whitespace-nowrap cursor-pointer ${
                    lesson4SimTab === 'CAR_TRIP'
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md'
                      : 'text-gray-400 hover:text-gray-200'
                  }`}
                >
                  Bài 1: Ô tô 3 chặng (Trang 25)
                </button>
                <button
                  onClick={() => setLesson4SimTab('BICYCLE_TRIP')}
                  className={`px-3 py-1 rounded-lg font-bold transition-all whitespace-nowrap cursor-pointer ${
                    lesson4SimTab === 'BICYCLE_TRIP'
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md'
                      : 'text-gray-400 hover:text-gray-200'
                  }`}
                >
                  Hình 4.7: Xe đạp (Trang 24 - 25)
                </button>
                <button
                  onClick={() => setLesson4SimTab('HANOI_HAIPHONG')}
                  className={`px-3 py-1 rounded-lg font-bold transition-all whitespace-nowrap cursor-pointer ${
                    lesson4SimTab === 'HANOI_HAIPHONG'
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md'
                      : 'text-gray-400 hover:text-gray-200'
                  }`}
                >
                  Bản đồ Hà Nội - Hải Phòng (Trang 22)
                </button>
                <button
                  onClick={() => setLesson4SimTab('THREE_PATHS')}
                  className={`px-3 py-1 rounded-lg font-bold transition-all whitespace-nowrap cursor-pointer ${
                    lesson4SimTab === 'THREE_PATHS'
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md'
                      : 'text-gray-400 hover:text-gray-200'
                  }`}
                >
                  Hình 4.6: 3 Chuyển động (Trang 23)
                </button>
                <button
                  onClick={() => setLesson4SimTab('INTERSECTION')}
                  className={`px-3 py-1 rounded-lg font-bold transition-all whitespace-nowrap cursor-pointer ${
                    lesson4SimTab === 'INTERSECTION'
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md'
                      : 'text-gray-400 hover:text-gray-200'
                  }`}
                >
                  Khởi động: Ngã tư đường (Trang 21)
                </button>
              </div>

              <button
                onClick={() => setActiveInteractiveSim(activeInteractiveSim === 'FEATURED' ? null : 'FEATURED')}
                className="text-xs font-bold text-[#00D4FF] hover:text-cyan-300 flex items-center gap-1 cursor-pointer bg-white/5 px-3 py-1.5 rounded-lg border border-white/10"
              >
                {activeInteractiveSim === 'FEATURED' ? (
                  <><span>Thu gọn</span> <ChevronUp className="h-4 w-4" /></>
                ) : (
                  <><span>Mở mô phỏng</span> <ChevronDown className="h-4 w-4" /></>
                )}
              </button>
            </div>
          </div>

          {(activeInteractiveSim === 'FEATURED' || activeInteractiveSim === null) && (
            lesson4SimTab === 'SWIMMER_RIVER' ? (
              <Lesson4SwimmerRiverSimulation />
            ) : lesson4SimTab === 'CAR_TRIP' ? (
              <Lesson4CarTripSimulation />
            ) : lesson4SimTab === 'BICYCLE_TRIP' ? (
              <Lesson4BicycleTripSimulation />
            ) : lesson4SimTab === 'HANOI_HAIPHONG' ? (
              <Lesson4HanoiHaiPhongSimulation />
            ) : lesson4SimTab === 'THREE_PATHS' ? (
              <Lesson4ThreePathsSimulation />
            ) : (
              <Lesson4IntersectionSimulation />
            )
          )}
        </div>
      )}

      {/* 3.5b. Featured Interactive Lab for Lesson 5 */}
      {currentLesson?.lessonId === 5 && !searchQuery.trim() && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-[#00D4FF]" />
              <span className="text-sm font-bold text-white uppercase tracking-wider">
                Mô Phỏng Tương Tác: Tiếp tuyến mép thước kẻ đo vận tốc tức thời (Trang 28 SGK)
              </span>
            </div>
            <button
              onClick={() => setActiveInteractiveSim(activeInteractiveSim === 'FEATURED' ? null : 'FEATURED')}
              className="text-xs font-bold text-[#00D4FF] hover:text-cyan-300 flex items-center gap-1 cursor-pointer bg-white/5 px-3 py-1.5 rounded-lg border border-white/10"
            >
              {activeInteractiveSim === 'FEATURED' ? (
                <><span>Thu gọn mô phỏng</span> <ChevronUp className="h-4 w-4" /></>
              ) : (
                <><span>Mở mô phỏng thước kẻ tiếp tuyến</span> <ChevronDown className="h-4 w-4" /></>
              )}
            </button>
          </div>

          {(activeInteractiveSim === 'FEATURED' || activeInteractiveSim === null) && (
            <TangentRulerVelocitySim />
          )}
        </div>
      )}

      {/* 3.6. Featured 3D Interactive Lab for Lesson 10 */}
      {currentLesson?.lessonId === 10 && !searchQuery.trim() && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-[#00D4FF]" />
              <span className="text-sm font-bold text-white uppercase tracking-wider">
                Mô Phỏng 3D & Thí Nghiệm Trực Quan SGK Hình 10.2 & 10.3
              </span>
            </div>
            <button
              onClick={() => setActiveInteractiveSim(activeInteractiveSim === 'FEATURED' ? null : 'FEATURED')}
              className="text-xs font-bold text-[#00D4FF] hover:text-cyan-300 flex items-center gap-1 cursor-pointer bg-white/5 px-3 py-1.5 rounded-lg border border-white/10"
            >
              {activeInteractiveSim === 'FEATURED' ? (
                <><span>Thu gọn mô phỏng</span> <ChevronUp className="h-4 w-4" /></>
              ) : (
                <><span>Mở phòng thí nghiệm 3D</span> <ChevronDown className="h-4 w-4" /></>
              )}
            </button>
          </div>

          {(activeInteractiveSim === 'FEATURED' || activeInteractiveSim === null) && (
            <Lesson10FreeFallSgkInteractive initialTab="EXP_10_2" />
          )}
        </div>
      )}

      {/* 4. Questions List */}
      <div className="space-y-6">
        {filteredQuestions.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/20 bg-black/20 p-12 text-center space-y-3">
            <HelpCircle className="h-10 w-10 text-gray-400 mx-auto" />
            <p className="text-base text-gray-300 font-medium">Không tìm thấy câu hỏi hoặc bài tập phù hợp với bộ lọc hiện tại.</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setFilterType('ALL');
                setFilterGroup('ALL');
              }}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all"
            >
              Đặt lại bộ lọc
            </button>
          </div>
        ) : (
          filteredQuestions.map((q, idx) => (
            <div
              key={q.id}
              className="rounded-2xl border border-white/15 bg-gradient-to-b from-[#0B1426] to-[#060D1E] p-5 sm:p-7 shadow-xl space-y-5 transition-all hover:border-[#00D4FF]/40"
            >
              {/* Question Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#00D4FF]/20 text-[#00D4FF] font-black text-xs border border-[#00D4FF]/40">
                    {idx + 1}
                  </span>
                  <h3 className="text-base sm:text-lg font-extrabold text-white">
                    {q.title}
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-mono bg-white/5 text-gray-300 border border-white/10">
                    Trang {q.page}
                  </span>
                  {q.targetCompetencyGroup && (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      {q.targetCompetencyGroup}
                    </span>
                  )}
                  {q.interactiveKey && (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 flex items-center gap-1">
                      <Sparkles className="h-3.5 w-3.5" /> Có mô phỏng 3D
                    </span>
                  )}
                </div>

                {/* Question Actions */}
                <div className="flex items-center gap-2">
                  {q.interactiveKey && (
                    <button
                      onClick={() => setActiveInteractiveSim(activeInteractiveSim === q.id ? null : q.id)}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                        activeInteractiveSim === q.id
                          ? 'bg-cyan-500 text-slate-950 border-cyan-300 shadow-[0_0_12px_rgba(0,212,255,0.4)]'
                          : 'bg-cyan-950/40 text-cyan-300 border-cyan-500/30 hover:bg-cyan-900/50'
                      }`}
                    >
                      <Play className="h-3.5 w-3.5" />
                      <span>{activeInteractiveSim === q.id ? 'Đóng 3D' : 'Xem mô phỏng 3D'}</span>
                    </button>
                  )}

                  <button
                    onClick={() => handleCopyQuestion(q)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-gray-200 text-xs font-medium border border-white/10 transition-all cursor-pointer hover:scale-105"
                    title="Sao chép lời giải câu này"
                  >
                    {copiedId === q.id ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copiedId === q.id ? 'Đã chép' : 'Sao chép'}</span>
                  </button>

                  {onOpenAI && (
                    <button
                      onClick={() => onOpenAI({
                        chapterTitle: currentChapter.chapterTitle,
                        lessonTitle: currentLesson?.lessonTitle,
                        customPrompt: `Phân tích sâu và hướng dẫn phương pháp giải cho câu hỏi: "${q.prompt}"`
                      })}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/40 text-[#00D4FF] text-xs font-medium border border-[#00D4FF]/30 transition-all cursor-pointer hover:scale-105"
                    >
                      <Bot className="h-3.5 w-3.5" />
                      <span>Hỏi AI</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Inline Interactive Simulation for Question */}
              {activeInteractiveSim === q.id && q.interactiveKey && (
                <div className="rounded-2xl border border-cyan-500/40 p-1 bg-black/40 shadow-2xl">
                  {q.interactiveKey === 'LESSON4_SWIMMER_RIVER' ? (
                    <Lesson4SwimmerRiverSimulation />
                  ) : q.interactiveKey === 'LESSON4_CAR_TRIP' ? (
                    <Lesson4CarTripSimulation />
                  ) : q.interactiveKey === 'LESSON4_BICYCLE_TRIP' ? (
                    <Lesson4BicycleTripSimulation />
                  ) : q.interactiveKey === 'LESSON4_HANOI_HAIPHONG' ? (
                    <Lesson4HanoiHaiPhongSimulation />
                  ) : q.interactiveKey === 'LESSON4_THREE_PATHS' ? (
                    <Lesson4ThreePathsSimulation />
                  ) : q.interactiveKey === 'INTERSECTION_4_WAYS' ? (
                    <Lesson4IntersectionSimulation />
                  ) : q.interactiveKey === 'TOY_CAR_SPEED' ? (
                    <ToyCarSpeedExperimentSim />
                  ) : q.interactiveKey === 'TANGENT_RULER_VELOCITY' ? (
                    <TangentRulerVelocitySim />
                  ) : (
                    <Lesson10FreeFallSgkInteractive 
                      initialTab={
                        q.interactiveKey === 'WALL_CHECK' 
                          ? 'WALL_CHECK' 
                          : q.interactiveKey === 'EKE_FLOOR' 
                          ? 'EKE_FLOOR' 
                          : 'EXP_10_2'
                      } 
                    />
                  )}
                </div>
              )}

              {/* Question Statement Box */}
              <div className="rounded-xl bg-[#070E1C] border border-white/10 p-4 sm:p-5 space-y-2">
                <span className="text-xs sm:text-sm font-bold text-[#00FFCC] uppercase tracking-wider block">
                  Đề bài & Yêu cầu câu hỏi:
                </span>
                <div className="text-base sm:text-lg text-gray-100 font-normal leading-relaxed">
                  <FormattedPhysicsText content={q.prompt} />
                </div>
              </div>

              {/* Optional: Summary, Frame of Reference, and Formula */}
              {(q.summary || q.frameOfReference || q.formula) && (() => {
                const metaCount = [q.summary, q.frameOfReference, q.formula].filter(Boolean).length;
                const gridClass = metaCount === 1 ? 'grid-cols-1' : metaCount === 2 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 md:grid-cols-3';
                return (
                  <div className={`grid ${gridClass} gap-3.5`}>
                    {q.summary && (
                      <div className="rounded-xl bg-gradient-to-br from-amber-950/25 via-[#121420]/90 to-amber-900/15 border border-amber-500/30 p-4 space-y-2.5 shadow-md shadow-black/40">
                        <div className="flex items-center gap-2 pb-1.5 border-b border-amber-500/20">
                          <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-amber-500/20 text-amber-300 text-xs shrink-0">
                            📋
                          </span>
                          <span className="text-xs sm:text-sm font-bold text-amber-300 uppercase tracking-wider">
                            Tóm tắt số liệu
                          </span>
                        </div>
                        <div className="text-sm sm:text-base text-gray-200 leading-relaxed">
                          <FormattedPhysicsText content={q.summary} />
                        </div>
                      </div>
                    )}

                    {q.frameOfReference && (
                      <div className="rounded-xl bg-gradient-to-br from-cyan-950/25 via-[#0A1724]/90 to-cyan-900/15 border border-cyan-500/30 p-4 space-y-2.5 shadow-md shadow-black/40">
                        <div className="flex items-center gap-2 pb-1.5 border-b border-cyan-500/20">
                          <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-cyan-500/20 text-cyan-300 text-xs shrink-0">
                            <Compass className="h-3.5 w-3.5" />
                          </span>
                          <span className="text-xs sm:text-sm font-bold text-cyan-300 uppercase tracking-wider">
                            Hệ quy chiếu & Chiều dương
                          </span>
                        </div>
                        <div className="text-sm sm:text-base text-gray-200 leading-relaxed">
                          <FormattedPhysicsText content={q.frameOfReference} />
                        </div>
                      </div>
                    )}

                    {q.formula && (
                      <div className="rounded-xl bg-gradient-to-br from-indigo-950/25 via-[#101428]/90 to-indigo-900/15 border border-indigo-500/30 p-4 space-y-2.5 shadow-md shadow-black/40">
                        <div className="flex items-center gap-2 pb-1.5 border-b border-indigo-500/20">
                          <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-300 text-xs shrink-0">
                            📐
                          </span>
                          <span className="text-xs sm:text-sm font-bold text-indigo-300 uppercase tracking-wider">
                            Công thức áp dụng
                          </span>
                        </div>
                        <div className="text-sm sm:text-base text-[#00D4FF] leading-relaxed">
                          <FormattedPhysicsText content={q.formula.startsWith('$') ? q.formula : `$${q.formula}$`} />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Step-by-Step Solution */}
              <div className="space-y-3">
                <span className="text-xs sm:text-sm font-bold text-[#00D4FF] uppercase tracking-wider flex items-center gap-1.5">
                  <CheckSquare className="h-4 w-4" /> Lời giải chuẩn từng bước:
                </span>

                <div className="space-y-3.5 rounded-xl border border-white/10 bg-[#091124] p-4 sm:p-5">
                  {q.stepByStepSolution.map((step, sIdx) => (
                    <div key={sIdx} className="text-base sm:text-lg leading-relaxed text-gray-100 font-normal">
                      <FormattedPhysicsText content={step} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Final Answer Box */}
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/30 p-4 sm:p-4.5 flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <span className="text-xs sm:text-sm font-bold text-emerald-300 uppercase tracking-wider block">
                    Đáp số & Kết luận chuẩn:
                  </span>
                  <div className="text-base sm:text-lg font-bold text-emerald-100 mt-1 leading-relaxed">
                    <FormattedPhysicsText content={q.finalAnswer} />
                  </div>
                </div>
              </div>

              {/* Pedagogical Note & Error Warnings */}
              {(q.pedagogicalNote || q.errorWarning) && (
                <div className="pt-2.5 border-t border-white/10 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs sm:text-sm">
                  {q.pedagogicalNote && (
                    <div className="flex items-start gap-2 text-slate-300">
                      <GraduationCap className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                      <div><strong>Tư duy sư phạm:</strong> <InlinePhysicsText text={q.pedagogicalNote} /></div>
                    </div>
                  )}
                  {q.errorWarning && (
                    <div className="flex items-start gap-2 text-rose-300">
                      <AlertTriangle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
                      <div><strong>Cảnh báo lỗi sai phổ biến:</strong> <InlinePhysicsText text={q.errorWarning} /></div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>

    </div>
  );
};
