import React, { useState } from 'react';
import { 
  BookOpen, 
  CheckCircle2, 
  ArrowRight, 
  Sparkles, 
  Activity, 
  Layers, 
  Compass, 
  Play,
  Users,
  FlaskConical,
  CheckSquare,
  AlertTriangle,
  Award,
  Crown,
  Calendar,
  Zap,
  TrendingUp,
  FileSpreadsheet,
  Copy,
  Check,
  Brain,
  HelpCircle,
  Clock,
  Target,
  ChevronRight,
  Sparkle
} from 'lucide-react';
import { CHAPTERS } from '../../data/curriculumData';
import { ActiveTab } from '../layout/Navbar';
import { InlinePhysicsText } from '../ui/FormattedPhysicsText';

interface CurriculumHubViewProps {
  onSelectLesson: (lessonId: number) => void;
  completedLessonIds: number[];
  onNavigateTab?: (tab: ActiveTab) => void;
}

export const CurriculumHubView: React.FC<CurriculumHubViewProps> = ({
  onSelectLesson,
  completedLessonIds,
  onNavigateTab,
}) => {
  const [copiedTable, setCopiedTable] = useState(false);
  const [selectedCompetenceGroup, setSelectedCompetenceGroup] = useState<'A' | 'B' | 'C' | 'D'>('B');

  const totalLessons = CHAPTERS.reduce((acc, ch) => acc + ch.lessons.length, 0);
  const totalCompleted = completedLessonIds.length;
  const progressPercent = Math.round((totalCompleted / totalLessons) * 100);

  // Copy pedagogical diagnostic table in Markdown format for Teacher's Records / Word / Excel
  const copyMarkdownReport = () => {
    const markdown = `# BÁO CÁO KHẢO THÍ & ĐO LƯỜNG ĐÁNH GIÁ NĂNG LỰC HỌC SINH MÔN VẬT LÍ 10
**Năm học:** 2026 - 2027 | **Bộ sách:** Kết nối tri thức với cuộc sống | **Giáo viên phụ trách:** Hoàng Quốc Hoàn

## 1. BẢNG PHÂN HÓA 4 NHÓM NĂNG LỰC CHUẨN KHẢO THÍ
| Nhóm | Điểm số | Đặc điểm Năng lực | Lộ trình Ôn tập Bắt buộc | Nội dung Giáo viên Cần Chữa |
|---|---|---|---|---|
| **Nhóm A** | < 7.0 | Cần bù nền kiến thức | Rà soát định nghĩa, bảng đơn vị SI, định luật Niutơn cơ bản | Chữa chi tiết từng bước, vẽ lại sơ đồ hiện tượng và tóm tắt đề |
| **Nhóm B** | 7.0 - 7.75 | Củng cố kỹ năng biến đổi | Luyện tập chiếu hệ trục tọa độ, rút ẩn số và biến đổi công thức | Chữa kỹ năng biến đổi toán học và khử sai số số học |
| **Nhóm C** | 8.0 - 8.75 | Luyện tập bài vận dụng | Giải các bài toán liên chương (Động học + Động lực học), đồ thị | Chữa phương pháp phân tích đồ thị phức hợp và hiện tượng ghép |
| **Nhóm D** | >= 9.0 | Bồi dưỡng nâng cao | Mở rộng bài toán va chạm phi tuyến, tối ưu góc bắn trên dốc nghiêng | Phân tích tư duy mô hình hóa và phương pháp thực nghiệm nâng cao |

## 2. BẢNG THỐNG KÊ 7 NHÓM LỖI SAI PHỔ BIẾN
| STT | Nhóm Lỗi Sai | Tỉ lệ gặp | Biện pháp Khắc phục Sư phạm |
|---|---|---|---|
| 1 | Sai kiến thức | 14% | Bù đắp lỗ hổng định luật, định nghĩa |
| 2 | Sai công thức | 12% | Hệ thống hóa sơ đồ Mindmap công thức theo chương |
| 3 | Sai mô hình hiện tượng | 22% | Sử dụng mô phỏng 60fps và thí nghiệm ảo để trực quan hóa |
| 4 | Sai toán học / biến đổi | 18% | Rèn luyện chiếu vectơ và rút ẩn số tuần tự |
| 5 | Sai kỹ năng đọc đề | 15% | Hướng dẫn gạch chân từ khóa và nhận diện điều kiện biên |
| 6 | Sai do cẩu thả / đơn vị | 11% | Nhắc nhở quy đổi đơn vị SI trước khi thế số |
| 7 | Không làm được | 8% | Hướng dẫn phân tích bài toán theo sơ đồ tư duy từng bước |
`;

    navigator.clipboard.writeText(markdown);
    setCopiedTable(true);
    setTimeout(() => setCopiedTable(false), 2500);
  };

  return (
    <div id="curriculum-hub-view" className="space-y-6">
      
      {/* 1. HERO BANNER BOX (With gentle ambient neon glow) */}
      <div className="relative continuous-neon-border glitter-sparkle-card px-6 py-4 sm:px-8 sm:py-5 shadow-[0_0_25px_rgba(0,212,255,0.25)]" style={{ ['--chapter-primary' as string]: '#00D4FF' }}>
        <div className="flex flex-col items-center text-center space-y-2 max-w-4xl mx-auto">
          {/* Top Pill Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-[#00D4FF]/40 bg-[#082238]/80 px-4.5 py-1.5 text-xs sm:text-sm font-extrabold uppercase tracking-widest text-[#00D4FF] shadow-[0_0_12px_rgba(0,212,255,0.2)]">
            <span>CHƯƠNG TRÌNH GDPT 2018</span>
          </div>

          {/* Grand Heading */}
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white uppercase drop-shadow-[0_2px_15px_rgba(255,255,255,0.15)] leading-tight">
            CỔNG HỌC LIỆU SỐ VẬT LÍ 10
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-base text-slate-200 font-medium pt-0.5">
            Giáo viên: <span className="text-white font-bold">Hoàng Quốc Hoàn</span>
          </p>
        </div>
      </div>

      {/* 2. THE 6 COLOR-CODED METRIC STAT CARDS (Exact match to Image 2 layout & colors) */}
      <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-6">
        
        {/* Card 1 (Dark Blue / Cyan): SĨ SỐ BÀI HỌC */}
        <div className="group relative overflow-hidden rounded-2xl border border-blue-500/30 bg-gradient-to-b from-[#0F1D38] to-[#0A1428] p-4.5 shadow-lg transition-all duration-300 hover:border-blue-400 hover:shadow-[0_0_20px_rgba(59,130,246,0.2)]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-blue-400">SĨ SỐ BÀI HỌC</span>
            <Users className="h-4.5 w-4.5 text-blue-400 opacity-80" />
          </div>
          <div className="mt-2.5 flex items-baseline gap-1">
            <span className="text-3xl sm:text-4xl font-black text-white font-mono">34</span>
          </div>
          <p className="mt-1.5 text-xs text-slate-300 font-medium truncate">7 Chương GDPT 2018</p>
        </div>

        {/* Card 2 (Emerald Green): TIẾN ĐỘ HOÀN THÀNH */}
        <div className="group relative overflow-hidden rounded-2xl border border-emerald-500/30 bg-gradient-to-b from-[#0A241F] to-[#061814] p-4.5 shadow-lg transition-all duration-300 hover:border-emerald-400 hover:shadow-[0_0_20px_rgba(16,185,129,0.2)]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-400">ĐÃ HOÀN THÀNH</span>
            <CheckCircle2 className="h-4.5 w-4.5 text-emerald-400 opacity-80" />
          </div>
          <div className="mt-2.5 flex items-baseline gap-1">
            <span className="text-3xl sm:text-4xl font-black text-[#00FFCC] font-mono">{totalCompleted}</span>
            <span className="text-sm text-emerald-300 font-bold">/ 34</span>
          </div>
          <p className="mt-1.5 text-xs text-emerald-300/90 font-medium truncate">{progressPercent}% Chuyên cần</p>
        </div>

        {/* Card 3 (Amber/Yellow): THÍ NGHIỆM ẢO */}
        <div 
          onClick={() => onNavigateTab && onNavigateTab('VIRTUAL_LAB')}
          className="group relative overflow-hidden rounded-2xl border border-amber-500/30 bg-gradient-to-b from-[#241D0C] to-[#171207] p-4.5 shadow-lg transition-all duration-300 hover:border-amber-400 hover:shadow-[0_0_20px_rgba(245,158,11,0.2)] cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-amber-400">THÍ NGHIỆM ẢO</span>
            <FlaskConical className="h-4.5 w-4.5 text-amber-400 opacity-80" />
          </div>
          <div className="mt-2.5 flex items-baseline gap-1">
            <span className="text-3xl sm:text-4xl font-black text-amber-300 font-mono">5</span>
            <span className="text-sm text-amber-300 font-bold">bài</span>
          </div>
          <p className="mt-1.5 text-xs text-amber-300/90 font-medium truncate">Thước đo & Số liệu</p>
        </div>

        {/* Card 4 (Rose / Crimson): NGÂN HÀNG CÂU HỎI */}
        <div 
          onClick={() => onNavigateTab && onNavigateTab('PRACTICE')}
          className="group relative overflow-hidden rounded-2xl border border-rose-500/30 bg-gradient-to-b from-[#280E18] to-[#1A0810] p-4.5 shadow-lg transition-all duration-300 hover:border-rose-400 hover:shadow-[0_0_20px_rgba(244,63,94,0.2)] cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-rose-400">LUYỆN TẬP ĐỀ</span>
            <Activity className="h-4.5 w-4.5 text-rose-400 opacity-80" />
          </div>
          <div className="mt-2.5 flex items-baseline gap-1">
            <span className="text-3xl sm:text-4xl font-black text-rose-300 font-mono">150+</span>
          </div>
          <p className="mt-1.5 text-xs text-rose-300/90 font-medium truncate">Chuẩn 7 nhóm lỗi sai</p>
        </div>

        {/* Card 5 (Indigo / Slate Blue): MÔ PHỎNG 60 FPS */}
        <div 
          onClick={() => onNavigateTab && onNavigateTab('SIMULATIONS')}
          className="group relative overflow-hidden rounded-2xl border border-indigo-500/30 bg-gradient-to-b from-[#161633] to-[#0D0D20] p-4.5 shadow-lg transition-all duration-300 hover:border-indigo-400 hover:shadow-[0_0_20px_rgba(99,102,241,0.2)] cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-indigo-400">MÔ PHỎNG SỐ</span>
            <Sparkles className="h-4.5 w-4.5 text-indigo-400 opacity-80" />
          </div>
          <div className="mt-2.5 flex items-baseline gap-1">
            <span className="text-3xl sm:text-4xl font-black text-indigo-300 font-mono">7</span>
            <span className="text-sm text-indigo-300 font-bold">mô hình</span>
          </div>
          <p className="mt-1.5 text-xs text-indigo-300/90 font-medium truncate">Vectơ & Đồ thị 60 FPS</p>
        </div>

        {/* Card 6 (Warning Orange/Gold): CẦN QUAN TÂM ⚠️ */}
        <div 
          onClick={() => {
            const element = document.getElementById('competence-section');
            element?.scrollIntoView({ behavior: 'smooth' });
          }}
          className="group relative overflow-hidden rounded-2xl border border-orange-500/40 bg-gradient-to-b from-[#2A1508] to-[#1C0D05] p-4.5 shadow-lg transition-all duration-300 hover:border-orange-400 hover:shadow-[0_0_20px_rgba(249,115,22,0.25)] cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-orange-400 flex items-center gap-1">
              CẦN QUAN TÂM <AlertTriangle className="h-3.5 w-3.5 text-orange-400" />
            </span>
          </div>
          <div className="mt-2.5 flex items-baseline gap-1">
            <span className="text-3xl sm:text-4xl font-black text-orange-400 font-mono">4</span>
            <span className="text-sm text-orange-300 font-bold">nhóm</span>
          </div>
          <p className="mt-1.5 text-xs text-orange-300/90 font-medium truncate">Nhóm A (Bù nền) → D</p>
        </div>
      </div>

      {/* 3. PEDAGOGY COMPETENCE & 7 ERROR CATEGORIES DIAGNOSTIC SECTION (Image 2 style container) */}
      <div id="competence-section" className="rounded-3xl border border-[#1E293B] bg-[#0A1020]/90 p-5 sm:p-6 shadow-xl backdrop-blur-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Award className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>Bảng Khảo thí & Đo lường Đánh giá Năng lực Môn Vật lí</span>
                <span className="rounded bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold text-amber-400 border border-amber-500/30">
                  Chuẩn GDPT 2018
                </span>
              </h2>
              <p className="text-xs text-slate-400">Phân hóa 4 nhóm năng lực học sinh và phân loại 7 nhóm lỗi sai sư phạm</p>
            </div>
          </div>

          <button
            onClick={copyMarkdownReport}
            className="flex items-center gap-1.5 self-start sm:self-auto rounded-xl border border-white/10 bg-[#131E38] hover:bg-[#1A2A4E] px-3.5 py-2 text-xs font-bold text-slate-200 transition active:scale-95 cursor-pointer shadow-sm"
          >
            {copiedTable ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5 text-[#00D4FF]" />}
            <span>{copiedTable ? 'Đã sao chép Markdown!' : 'Sao chép Bảng Markdown'}</span>
          </button>
        </div>

        {/* 4 Competence Group Selector Tabs */}
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {[
            { id: 'A', name: 'Nhóm A (< 7.0)', status: 'Cần bù nền', color: 'from-rose-500/20 to-rose-600/10 border-rose-500/30 text-rose-400' },
            { id: 'B', name: 'Nhóm B (7.0 - 7.75)', status: 'Củng cố biến đổi', color: 'from-amber-500/20 to-amber-600/10 border-amber-500/30 text-amber-400' },
            { id: 'C', name: 'Nhóm C (8.0 - 8.75)', status: 'Luyện tập vận dụng', color: 'from-blue-500/20 to-blue-600/10 border-blue-500/30 text-blue-400' },
            { id: 'D', name: 'Nhóm D (>= 9.0)', status: 'Bồi dưỡng nâng cao', color: 'from-emerald-500/20 to-emerald-600/10 border-emerald-500/30 text-emerald-400' },
          ].map((grp) => (
            <button
              key={grp.id}
              onClick={() => setSelectedCompetenceGroup(grp.id as any)}
              className={`flex flex-col items-start rounded-2xl border p-3 text-left transition-all cursor-pointer ${
                selectedCompetenceGroup === grp.id
                  ? `bg-gradient-to-br ${grp.color} border-current shadow-[0_0_15px_rgba(0,0,0,0.4)]`
                  : 'border-white/5 bg-[#0C1528]/50 text-slate-400 hover:bg-white/5'
              }`}
            >
              <span className="text-xs font-extrabold">{grp.name}</span>
              <span className="text-[11px] font-semibold opacity-90">{grp.status}</span>
            </button>
          ))}
        </div>

        {/* Dynamic Detail Plan for Selected Group */}
        <div className="mt-4 rounded-2xl border border-white/10 bg-[#060D1E] p-5 text-sm sm:text-base space-y-3.5">
          {selectedCompetenceGroup === 'A' && (
            <div>
              <div className="flex items-center gap-2 font-bold text-rose-400 text-base sm:text-lg">
                <AlertTriangle className="h-5 w-5" />
                <span>Kế hoạch Sư phạm cho Nhóm A (&lt; 7.0 - Cần bù nền)</span>
              </div>
              <p className="text-slate-200 mt-2 text-sm sm:text-base leading-relaxed">
                <strong className="text-white">Đặc điểm học sinh:</strong> Thường hổng kiến thức nhận biết, nhầm lẫn đơn vị (km/h sang m/s), chưa nắm chắc công thức cơ bản của chuyển động biến đổi đều và 3 định luật Niutơn.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 mt-3">
                <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-4 space-y-2">
                  <div className="font-bold text-rose-300 text-sm sm:text-base">🎯 Định hướng ôn tập bắt buộc:</div>
                  <ul className="list-disc pl-5 space-y-1.5 text-slate-200 text-sm sm:text-base leading-relaxed">
                    <li>Rà soát và vẽ lại sơ đồ Mindmap Chương I (Mở đầu) và Chương II (Động học).</li>
                    <li>Luyện tập 30 câu trắc nghiệm mức độ Nhận biết & Thông hiểu mỗi tuần.</li>
                    <li>Tự kiểm tra lại bản chất các đại lượng $s, d, v, a$ qua các ví dụ thực tiễn.</li>
                  </ul>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-2">
                  <div className="font-bold text-slate-100 text-sm sm:text-base">👨‍🏫 Nội dung cần chữa trên lớp cho Giáo viên:</div>
                  <ul className="list-disc pl-5 space-y-1.5 text-slate-200 text-sm sm:text-base leading-relaxed">
                    <li>Chữa chi tiết từng bước đặt tóm tắt và đổi đơn vị trước khi áp dụng công thức.</li>
                    <li>Vẽ hình minh họa hiện tượng thực tế (xe tăng tốc, rơi tự do) trước khi viết phương trình.</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {selectedCompetenceGroup === 'B' && (
            <div>
              <div className="flex items-center gap-2 font-bold text-amber-400 text-base sm:text-lg">
                <Target className="h-5 w-5" />
                <span>Kế hoạch Sư phạm cho Nhóm B (7.0 - 7.75 - Củng cố kỹ năng biến đổi)</span>
              </div>
              <p className="text-slate-200 mt-2 text-sm sm:text-base leading-relaxed">
                <strong className="text-white">Đặc điểm học sinh:</strong> Đã thuộc công thức cơ bản nhưng hay sai toán học biến đổi, lúng túng khi giải hệ phương trình hoặc chiếu vectơ lực lên hai trục $Ox, Oy$.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 mt-3">
                <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 space-y-2">
                  <div className="font-bold text-amber-300 text-sm sm:text-base">🎯 Định hướng ôn tập bắt buộc:</div>
                  <ul className="list-disc pl-5 space-y-1.5 text-slate-200 text-sm sm:text-base leading-relaxed">
                    <li>Rèn luyện kỹ năng biến đổi biểu thức chữ (rút $a$, rút $t$) trước khi bấm máy tính.</li>
                    <li>Thực hành kỹ thuật phân tích lực trên mặt phẳng nghiêng với góc nghiêng $\alpha$.</li>
                    <li>Kiểm tra lại dấu của gia tốc $a$ trong chuyển động chậm dần đều ($a \cdot v &lt; 0$).</li>
                  </ul>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-2">
                  <div className="font-bold text-slate-100 text-sm sm:text-base">👨‍🏫 Nội dung cần chữa trên lớp cho Giáo viên:</div>
                  <ul className="list-disc pl-5 space-y-1.5 text-slate-200 text-sm sm:text-base leading-relaxed">
                    <li>Chữa kỹ phương pháp chiếu vectơ lực: $F_x = F\cos\alpha$, $F_y = F\sin\alpha$.</li>
                    <li>Nhấn mạnh các bẫy biến đổi số học và cách cô lập ẩn số đại số.</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {selectedCompetenceGroup === 'C' && (
            <div>
              <div className="flex items-center gap-2 font-bold text-blue-400 text-base sm:text-lg">
                <Brain className="h-5 w-5" />
                <span>Kế hoạch Sư phạm cho Nhóm C (8.0 - 8.75 - Luyện tập bài vận dụng)</span>
              </div>
              <p className="text-slate-200 mt-2 text-sm sm:text-base leading-relaxed">
                <strong className="text-white">Đặc điểm học sinh:</strong> Kỹ năng toán và công thức tốt, tuy nhiên gặp khó khăn khi gặp bài toán ghép nhiều giai đoạn (ví dụ: chuyển động thẳng đều rồi hãm phanh rồi lùi lại) hoặc bài toán ném xiên từ độ cao $h_0$.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 mt-3">
                <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-4 space-y-2">
                  <div className="font-bold text-blue-300 text-sm sm:text-base">🎯 Định hướng ôn tập bắt buộc:</div>
                  <ul className="list-disc pl-5 space-y-1.5 text-slate-200 text-sm sm:text-base leading-relaxed">
                    <li>Luyện giải các bài toán liên kết Động học - Động lực học - Năng lượng & Công.</li>
                    <li>Khai thác thông tin từ diện tích dưới đồ thị vận tốc - thời gian $v(t)$ để tính độ dịch chuyển $d$.</li>
                    <li>Sử dụng Phòng Thí nghiệm Ảo Ném xiên để kiểm chứng điều kiện góc bắn tối ưu.</li>
                  </ul>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-2">
                  <div className="font-bold text-slate-100 text-sm sm:text-base">👨‍🏫 Nội dung cần chữa trên lớp cho Giáo viên:</div>
                  <ul className="list-disc pl-5 space-y-1.5 text-slate-200 text-sm sm:text-base leading-relaxed">
                    <li>Hướng dẫn cách phân đoạn chuyển động và bảo toàn các thông số biên nối giữa các giai đoạn.</li>
                    <li>Phân tích sâu bản chất vật lí trong các bài toán đồ thị nhiều đoạn.</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {selectedCompetenceGroup === 'D' && (
            <div>
              <div className="flex items-center gap-2 font-bold text-emerald-400 text-base sm:text-lg">
                <Sparkles className="h-5 w-5" />
                <span>Kế hoạch Sư phạm cho Nhóm D (&gt;= 9.0 - Bồi dưỡng nâng cao)</span>
              </div>
              <p className="text-slate-200 mt-2 text-sm sm:text-base leading-relaxed">
                <strong className="text-white">Đặc điểm học sinh:</strong> Tư duy vật lí sắc sảo, tự tin làm chủ toàn bộ chương trình, có khả năng tham gia kỳ thi Học sinh giỏi hoặc kỳ thi Đánh giá Năng lực (HSA, V-SAT).
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 mt-3">
                <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 space-y-2">
                  <div className="font-bold text-emerald-300 text-sm sm:text-base">🎯 Định hướng ôn tập bắt buộc:</div>
                  <ul className="list-disc pl-5 space-y-1.5 text-slate-200 text-sm sm:text-base leading-relaxed">
                    <li>Tiếp cận mô hình va chạm mềm và đàn hồi phi tuyến tính, chuyển động trong hệ quy chiếu có gia tốc (lực quán tính).</li>
                    <li>Nghiên cứu các bài toán tối ưu cực trị hình học trong ném xiên và định luật bảo toàn cơ năng.</li>
                    <li>Tự thiết kế phương án thí nghiệm ảo và viết báo cáo đánh giá sai số thực nghiệm chuẩn mực.</li>
                  </ul>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-2">
                  <div className="font-bold text-slate-100 text-sm sm:text-base">👨‍🏫 Nội dung cần chữa trên lớp cho Giáo viên:</div>
                  <ul className="list-disc pl-5 space-y-1.5 text-slate-200 text-sm sm:text-base leading-relaxed">
                    <li>Phân tích phương pháp mô hình hóa hiện tượng phức tạp và các định lý bảo toàn tổng quát.</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 4. SEVEN CHAPTERS CURRICULUM BENTO GRID (Retaining all existing lessons & chapters) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-3.5">
          <div className="flex items-center gap-3">
            <BookOpen className="h-6 w-6 text-[#00D4FF]" />
            <h2 className="text-xl sm:text-2xl font-black text-white">Danh mục 7 Chương học tập GDPT 2018</h2>
          </div>
          <span className="text-sm font-mono font-bold text-[#00D4FF] bg-[#00D4FF]/10 px-3 py-1.5 rounded-xl border border-[#00D4FF]/20">
            34 Bài học chuẩn
          </span>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {CHAPTERS.map((chapter) => {
            const completedInChapter = chapter.lessons.filter((l) =>
              completedLessonIds.includes(l.id)
            ).length;
            const progress = Math.round((completedInChapter / chapter.lessons.length) * 100);

            // 7 Distinct theme accents per chapter
            const chapterThemes: Record<number, { beamClass: string; badgeColor: string; titleColor: string; bgGradient: string }> = {
              1: { beamClass: 'chapter-beam-1', badgeColor: 'text-blue-400 bg-blue-500/10 border-blue-500/30', titleColor: 'text-blue-400', bgGradient: 'from-[#0C1733]/90 to-[#070D1E]' },
              2: { beamClass: 'chapter-beam-2', badgeColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30', titleColor: 'text-emerald-400', bgGradient: 'from-[#0A221E]/90 to-[#061412]' },
              3: { beamClass: 'chapter-beam-3', badgeColor: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30', titleColor: 'text-yellow-400', bgGradient: 'from-[#24200C]/90 to-[#141206]' },
              4: { beamClass: 'chapter-beam-4', badgeColor: 'text-orange-400 bg-orange-500/10 border-orange-500/30', titleColor: 'text-orange-400', bgGradient: 'from-[#28160B]/90 to-[#160B04]' },
              5: { beamClass: 'chapter-beam-5', badgeColor: 'text-purple-400 bg-purple-500/10 border-purple-500/30', titleColor: 'text-purple-400', bgGradient: 'from-[#221033]/90 to-[#12081C]' },
              6: { beamClass: 'chapter-beam-6', badgeColor: 'text-pink-400 bg-pink-500/10 border-pink-500/30', titleColor: 'text-pink-400', bgGradient: 'from-[#2B0E20]/90 to-[#170611]' },
              7: { beamClass: 'chapter-beam-7', badgeColor: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30', titleColor: 'text-cyan-400', bgGradient: 'from-[#0A202E]/90 to-[#051119]' },
            };

            const theme = chapterThemes[chapter.id] || chapterThemes[1];

            return (
              <div
                key={chapter.id}
                id={`chapter-card-${chapter.id}`}
                className={`flex flex-col justify-between rounded-3xl ${theme.beamClass} bg-gradient-to-b ${theme.bgGradient} p-6 sm:p-7 shadow-xl transition-all duration-300 backdrop-blur-xl`}
              >
                <div>
                  <div className="flex items-center justify-between border-b border-white/10 pb-3.5">
                    <span className={`text-xs sm:text-sm font-black uppercase tracking-wider px-3 py-1.5 rounded-xl border ${theme.badgeColor}`}>
                      CHƯƠNG {chapter.romanNumeral}
                    </span>
                    <span className="rounded-lg bg-white/5 border border-white/10 px-3 py-1 text-xs sm:text-sm font-mono text-slate-200">
                      {completedInChapter}/{chapter.lessons.length} bài
                    </span>
                  </div>

                  <h3 className="mt-3.5 text-xl sm:text-2xl font-black text-white">{chapter.title}</h3>
                  <p className="mt-1.5 text-base text-slate-200 leading-relaxed line-clamp-2">
                    <InlinePhysicsText text={chapter.description} />
                  </p>

                  {/* Lessons list inside chapter */}
                  <div className="mt-4 space-y-2.5 border-t border-white/5 pt-3.5">
                    {chapter.lessons.map((lesson) => {
                      const isDone = completedLessonIds.includes(lesson.id);
                      return (
                        <div
                          key={lesson.id}
                          onClick={() => onSelectLesson(lesson.id)}
                          className="flex cursor-pointer items-center justify-between rounded-xl border border-white/5 bg-[#0A1020]/90 px-4 py-3 text-base sm:text-lg transition-all hover:border-white/20 hover:bg-white/10"
                        >
                          <div className="flex items-center gap-3 truncate text-slate-200">
                            {isDone ? (
                              <CheckCircle2 className="h-5 w-5 text-[#00FFCC] shrink-0" />
                            ) : (
                              <span className="h-3 w-3 rounded-full bg-slate-500 shrink-0" />
                            )}
                            <span className="truncate font-semibold text-slate-100">
                              Bài {lesson.lessonNumber}: {lesson.title}
                            </span>
                          </div>
                          <ChevronRight className="h-5 w-5 text-slate-400 hover:text-white shrink-0 ml-2" />
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-5 border-t border-white/10 pt-3.5">
                  <div className="flex justify-between text-xs sm:text-sm text-slate-300">
                    <span className="font-semibold">Tiến độ chương:</span>
                    <span className="font-mono font-bold text-[#00FFCC]">{progress}%</span>
                  </div>
                  <div className="mt-2 h-2 w-full rounded-full bg-white/10 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#3B82F6] via-[#00D4FF] to-[#00FFCC] transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
