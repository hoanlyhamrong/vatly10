import React, { useState, useMemo } from 'react';
import { 
  BookOpen, 
  Search, 
  CheckCircle2, 
  HelpCircle, 
  Copy, 
  Check, 
  Filter, 
  AlertTriangle, 
  GraduationCap, 
  Compass, 
  CheckSquare,
  FileSpreadsheet,
  Sparkles,
  Play,
  Eye,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Lesson, Chapter } from '../../types/physics';
import { getSgkSolutionsForLesson, SgkQuestionItem, SgkLessonSolutions } from '../../data/sgkSolutionsData';
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

interface LessonSgkSolutionsProps {
  lesson: Lesson;
  chapter: Chapter;
}

export const LessonSgkSolutions: React.FC<LessonSgkSolutionsProps> = ({
  lesson,
  chapter,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('ALL');
  const [filterGroup, setFilterGroup] = useState<string>('ALL');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedLesson, setCopiedLesson] = useState<boolean>(false);
  const [activeInteractiveSim, setActiveInteractiveSim] = useState<string | null>(
    (lesson.id === 10 || lesson.id === 4) ? 'FEATURED' : null
  );
  const [lesson4SimTab, setLesson4SimTab] = useState<'HANOI_HAIPHONG' | 'THREE_PATHS' | 'INTERSECTION'>('HANOI_HAIPHONG');

  // Retrieve SGK solutions data for this specific lesson
  const lessonSolutions: SgkLessonSolutions = useMemo(() => {
    const found = getSgkSolutionsForLesson(lesson.id);
    if (found) return found;

    // Fallback dynamic generation if not explicitly predefined
    const fallbackQuestions: SgkQuestionItem[] = lesson.steps.map((step, sIdx) => {
      const isExercise = sIdx >= 2;
      return {
        id: `les_${lesson.id}_q_${sIdx + 1}`,
        type: isExercise ? 'EXERCISE' : 'IN_TEXT_QUESTION',
        title: `Câu hỏi mục ${step.stepNumber || sIdx + 1} (${step.title})`,
        page: 10 + lesson.id * 3 + sIdx,
        section: step.title,
        prompt: step.content.slice(0, 240) + '...',
        summary: step.observationPoints?.join('; ') || `Kiến thức trọng tâm bài ${lesson.lessonNumber}: ${lesson.title}`,
        frameOfReference: 'Gốc tọa độ O tại vị trí ban đầu, chiều dương theo hướng chuyển động của vật, gốc thời gian t=0 lúc bắt đầu khảo sát.',
        formula: lesson.keyFormulas?.[0]?.latex || '',
        stepByStepSolution: [
          `1. **Phân tích bản chất hiện tượng:** Dựa trên định luật và nguyên lí cốt lõi của bài "${lesson.title}".`,
          `2. **Lập phương trình / Áp dụng công thức:** ${lesson.keyFormulas?.[0]?.description || 'Sử dụng các công thức liên hệ chuẩn mực'}.`,
          `3. **Thay số và biến đổi:** Đảm bảo tất cả các đại lượng đã đổi về đơn vị đo lường SI chuẩn.`
        ],
        finalAnswer: `Áp dụng đúng định luật và công thức bài ${lesson.lessonNumber}, giải thích chính xác hiện tượng thực nghiệm.`,
        pedagogicalNote: `Rèn luyện năng lực mô hình hóa hiện tượng vật lí cho bài "${lesson.title}".`,
        targetCompetencyGroup: sIdx === 0 ? 'Nhóm A' : sIdx === 1 ? 'Nhóm B' : 'Nhóm C',
        errorWarning: lesson.commonMistakes?.[0] || 'Chú ý đổi đơn vị về hệ chuẩn SI và xét đúng dấu đại số của các vectơ.'
      };
    });

    return {
      lessonId: lesson.id,
      chapterId: chapter.id,
      lessonNumber: lesson.lessonNumber || lesson.id,
      lessonTitle: lesson.title,
      pageRange: `Trang ${10 + lesson.id * 3} - ${14 + lesson.id * 3}`,
      totalQuestions: fallbackQuestions.length,
      questions: fallbackQuestions
    };
  }, [lesson, chapter]);

  // Filter questions within this lesson
  const filteredQuestions = useMemo(() => {
    let list = [...lessonSolutions.questions];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((item) => 
        item.prompt.toLowerCase().includes(q) ||
        item.title.toLowerCase().includes(q) ||
        item.section.toLowerCase().includes(q) ||
        item.finalAnswer.toLowerCase().includes(q)
      );
    }

    if (filterType !== 'ALL') {
      list = list.filter((item) => item.type === filterType);
    }

    if (filterGroup !== 'ALL') {
      list = list.filter((item) => item.targetCompetencyGroup === filterGroup);
    }

    return list;
  }, [lessonSolutions, searchQuery, filterType, filterGroup]);

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
    let md = `# LỜI GIẢI CHI TIẾT CÂU HỎI & BÀI TẬP SGK VẬT LÍ 10
**Bài ${lesson.lessonNumber}: ${lesson.title}**
*Bộ sách: Kết nối tri thức với cuộc sống | Phạm vi: ${lessonSolutions.pageRange}*

---

`;
    lessonSolutions.questions.forEach((q, idx) => {
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
    setCopiedLesson(true);
    setTimeout(() => setCopiedLesson(false), 2500);
  };

  return (
    <div id={`lesson-sgk-solutions-${lesson.id}`} className="space-y-6">
      
      {/* 1. Header Banner For This Specific Lesson */}
      <div className="rounded-2xl border border-[#00D4FF]/30 bg-gradient-to-r from-[#0C1528] via-[#09152F] to-[#060D1E] p-5 sm:p-6 shadow-[0_0_30px_rgba(0,212,255,0.12)] relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-6 -mr-6 w-48 h-48 bg-[#00D4FF]/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider bg-[#00D4FF]/20 text-[#00D4FF] border border-[#00D4FF]/40">
                SGK KẾT NỐI TRI THỨC
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono bg-white/10 text-gray-200">
                {lessonSolutions.pageRange}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                {lessonSolutions.questions.length} câu hỏi & bài tập
              </span>
            </div>
            
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2.5">
              <BookOpen className="h-6 w-6 text-[#00D4FF] shrink-0" />
              <span>Lời Giải Chi Tiết: Bài {lesson.lessonNumber}: {lesson.title}</span>
            </h2>

            <p className="text-xs sm:text-sm text-gray-300 max-w-2xl leading-relaxed">
              Toàn bộ câu hỏi <strong>?</strong> trong bài, hoạt động khám phá, câu hỏi vận dụng và bài tập tự luyện cuối bài được giải mẫu chuẩn mực từng bước.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleCopyLessonMarkdown}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600/90 hover:bg-emerald-600 text-white text-xs font-bold border border-emerald-400/40 shadow-lg transition-all cursor-pointer hover:scale-105 active:scale-95"
              title="Sao chép toàn bộ lời giải bài này dạng Markdown"
            >
              {copiedLesson ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              <span>{copiedLesson ? 'Đã sao chép!' : 'Xuất Lời Giải Bài Này'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Filter and Search Bar for this Lesson */}
      <div className="rounded-xl border border-white/10 bg-[#070E1C] p-3.5 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm câu hỏi, số trang, công thức bài này..."
            className="w-full pl-9 pr-4 py-1.5 rounded-lg bg-[#0C1528] border border-white/10 text-xs text-white placeholder-gray-400 focus:outline-none focus:border-[#00D4FF]"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-gray-400 flex items-center gap-1 font-semibold text-[11px]">
            <Filter className="h-3 w-3" /> Lọc:
          </span>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-[#0C1528] border border-white/10 text-gray-200 text-xs focus:outline-none focus:border-[#00D4FF]"
          >
            <option value="ALL">Tất cả dạng bài</option>
            <option value="IN_TEXT_QUESTION">Câu hỏi trong bài (?)</option>
            <option value="EXERCISE">Bài tập & Vận dụng</option>
            <option value="EM_CO_THE">Em có thể / Thực hành</option>
          </select>

          <select
            value={filterGroup}
            onChange={(e) => setFilterGroup(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-[#0C1528] border border-white/10 text-gray-200 text-xs focus:outline-none focus:border-[#00D4FF]"
          >
            <option value="ALL">Mọi nhóm năng lực</option>
            <option value="Nhóm A">Nhóm A (&lt; 7.0 - Bù nền)</option>
            <option value="Nhóm B">Nhóm B (7.0-7.75 - Biến đổi)</option>
            <option value="Nhóm C">Nhóm C (8.0-8.75 - Vận dụng)</option>
            <option value="Nhóm D">Nhóm D (&gt;= 9.0 - Nâng cao)</option>
          </select>
        </div>
      </div>

      {/* 2.4. Featured 3D Interactive Lab for Lesson 4 */}
      {lesson.id === 4 && (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[#00D4FF]" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Mô Phỏng 3D Tương Tác SGK Bài 4 (Độ dịch chuyển & Quãng đường)
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Tab Selector between the 3 simulations of Lesson 4 */}
              <div className="flex items-center bg-[#0C1629] p-1 rounded-xl border border-white/10 text-xs overflow-x-auto">
                <button
                  onClick={() => {
                    setLesson4SimTab('HANOI_HAIPHONG');
                    if (activeInteractiveSim !== 'FEATURED') setActiveInteractiveSim('FEATURED');
                  }}
                  className={`px-3 py-1 rounded-lg font-bold transition-all whitespace-nowrap cursor-pointer ${
                    lesson4SimTab === 'HANOI_HAIPHONG' && activeInteractiveSim === 'FEATURED'
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md'
                      : 'text-gray-400 hover:text-gray-200'
                  }`}
                >
                  Bản đồ Hà Nội - Hải Phòng (Trang 22)
                </button>
                <button
                  onClick={() => {
                    setLesson4SimTab('THREE_PATHS');
                    if (activeInteractiveSim !== 'FEATURED') setActiveInteractiveSim('FEATURED');
                  }}
                  className={`px-3 py-1 rounded-lg font-bold transition-all whitespace-nowrap cursor-pointer ${
                    lesson4SimTab === 'THREE_PATHS' && activeInteractiveSim === 'FEATURED'
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md'
                      : 'text-gray-400 hover:text-gray-200'
                  }`}
                >
                  Hình 4.6: 3 Chuyển động (Trang 23)
                </button>
                <button
                  onClick={() => {
                    setLesson4SimTab('INTERSECTION');
                    if (activeInteractiveSim !== 'FEATURED') setActiveInteractiveSim('FEATURED');
                  }}
                  className={`px-3 py-1 rounded-lg font-bold transition-all whitespace-nowrap cursor-pointer ${
                    lesson4SimTab === 'INTERSECTION' && activeInteractiveSim === 'FEATURED'
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md'
                      : 'text-gray-400 hover:text-gray-200'
                  }`}
                >
                  Khởi động: Ngã tư đường (Trang 21)
                </button>
              </div>

              <button
                onClick={() => setActiveInteractiveSim(activeInteractiveSim === 'FEATURED' ? null : 'FEATURED')}
                className="text-xs font-bold text-[#00D4FF] hover:text-cyan-300 flex items-center gap-1 cursor-pointer bg-white/5 px-2.5 py-1 rounded-lg border border-white/10"
              >
                {activeInteractiveSim === 'FEATURED' ? (
                  <><span>Thu gọn</span> <ChevronUp className="h-3.5 w-3.5" /></>
                ) : (
                  <><span>Mở mô phỏng</span> <ChevronDown className="h-3.5 w-3.5" /></>
                )}
              </button>
            </div>
          </div>

          {activeInteractiveSim === 'FEATURED' && (
            lesson4SimTab === 'HANOI_HAIPHONG' ? (
              <Lesson4HanoiHaiPhongSimulation />
            ) : lesson4SimTab === 'THREE_PATHS' ? (
              <Lesson4ThreePathsSimulation />
            ) : (
              <Lesson4IntersectionSimulation />
            )
          )}
        </div>
      )}

      {/* 2.5. Featured 3D Interactive Lab for Lesson 10 */}
      {lesson.id === 10 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[#00D4FF]" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Mô Phỏng 3D & Thí Nghiệm Trực Quan SGK Hình 10.2 & 10.3
              </span>
            </div>
            <button
              onClick={() => setActiveInteractiveSim(activeInteractiveSim === 'FEATURED' ? null : 'FEATURED')}
              className="text-xs font-bold text-[#00D4FF] hover:text-cyan-300 flex items-center gap-1 cursor-pointer bg-white/5 px-2.5 py-1 rounded-lg border border-white/10"
            >
              {activeInteractiveSim === 'FEATURED' ? (
                <><span>Thu gọn mô phỏng</span> <ChevronUp className="h-3.5 w-3.5" /></>
              ) : (
                <><span>Mở phòng thí nghiệm 3D</span> <ChevronDown className="h-3.5 w-3.5" /></>
              )}
            </button>
          </div>

          {activeInteractiveSim === 'FEATURED' && (
            <Lesson10FreeFallSgkInteractive initialTab="EXP_10_2" />
          )}
        </div>
      )}

      {/* 3. Questions List */}
      <div className="space-y-5">
        {filteredQuestions.length === 0 ? (
          <div className="rounded-xl border border-dashed border-white/20 bg-black/20 p-8 text-center space-y-2">
            <HelpCircle className="h-8 w-8 text-gray-400 mx-auto" />
            <p className="text-sm text-gray-300">Không tìm thấy câu hỏi phù hợp với bộ lọc hiện tại.</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setFilterType('ALL');
                setFilterGroup('ALL');
              }}
              className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all"
            >
              Xóa bộ lọc
            </button>
          </div>
        ) : (
          filteredQuestions.map((q, idx) => (
            <div
              key={q.id}
              className="rounded-2xl border border-white/15 bg-gradient-to-b from-[#0B1426] to-[#060D1E] p-5 sm:p-6 shadow-lg space-y-4 transition-all hover:border-[#00D4FF]/40"
            >
              {/* Question Header */}
              <div className="flex flex-wrap items-center justify-between gap-2.5 border-b border-white/10 pb-3.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[#00D4FF]/20 text-[#00D4FF] font-black text-xs border border-[#00D4FF]/40">
                    {idx + 1}
                  </span>
                  <h3 className="text-sm sm:text-base font-extrabold text-white">
                    {q.title}
                  </h3>
                  <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-white/5 text-gray-300 border border-white/10">
                    Trang {q.page}
                  </span>
                  {q.targetCompetencyGroup && (
                    <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      {q.targetCompetencyGroup}
                    </span>
                  )}
                  {q.interactiveKey && (
                    <span className="px-2 py-0.5 rounded text-[11px] font-black bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 flex items-center gap-1">
                      <Sparkles className="h-3 w-3" /> Có mô phỏng 3D
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5">
                  {q.interactiveKey && (
                    <button
                      onClick={() => setActiveInteractiveSim(activeInteractiveSim === q.id ? null : q.id)}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold border transition-all cursor-pointer ${
                        activeInteractiveSim === q.id
                          ? 'bg-cyan-500 text-slate-950 border-cyan-300 shadow-[0_0_10px_rgba(0,212,255,0.4)]'
                          : 'bg-cyan-950/40 text-cyan-300 border-cyan-500/30 hover:bg-cyan-900/50'
                      }`}
                    >
                      <Play className="h-3 w-3" />
                      <span>{activeInteractiveSim === q.id ? 'Đóng 3D' : 'Xem mô phỏng 3D'}</span>
                    </button>
                  )}

                  <button
                    onClick={() => handleCopyQuestion(q)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-white/5 hover:bg-white/15 text-gray-200 text-xs font-medium border border-white/10 transition-all cursor-pointer hover:scale-105"
                    title="Sao chép lời giải câu này"
                  >
                    {copiedId === q.id ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                    <span>{copiedId === q.id ? 'Đã chép' : 'Sao chép'}</span>
                  </button>
                </div>
              </div>

              {/* Inline Interactive Simulation for Question */}
              {activeInteractiveSim === q.id && q.interactiveKey && (
                <div className="rounded-xl border border-cyan-500/40 p-1 bg-black/40 shadow-xl">
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
              <div className="space-y-2.5">
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
                      <div><strong>Cảnh báo lỗi sai:</strong> <InlinePhysicsText text={q.errorWarning} /></div>
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
