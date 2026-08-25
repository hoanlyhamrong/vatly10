import React, { useState } from 'react';
import { 
  Users, 
  FileSpreadsheet, 
  PlusCircle, 
  CheckCircle2, 
  BarChart3, 
  Send, 
  Copy, 
  Download, 
  Sparkles, 
  AlertTriangle, 
  FileText, 
  Layers, 
  Award,
  BookOpen
} from 'lucide-react';
import { Classroom, CompetencyGroup, ErrorClassification } from '../../types/physics';
import { CHAPTERS } from '../../data/curriculumData';

export const TeacherDashboard: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState<'ANALYTICS' | 'CLASSES' | 'ASSIGN' | 'TEST_CREATOR'>('ANALYTICS');
  const [copySuccess, setCopySuccess] = useState<boolean>(false);

  // Sample realistic high school physics classroom data
  const [classes, setClasses] = useState<Classroom[]>([
    {
      id: 'cls-10a1',
      name: 'Lớp 10A1',
      grade: '10',
      studentsCount: 42,
      averageScore: 8.15,
      completionRate: 88,
      students: [
        { id: 'st-1', name: 'Nguyễn Văn An', score: 9.25, competencyGroup: 'Nhóm D', errorBreakdown: { 'Sai kiến thức': 0, 'Sai công thức': 0, 'Sai mô hình hiện tượng': 0, 'Sai toán học': 0, 'Sai kỹ năng đọc đề': 0, 'Sai do cẩu thả': 1, 'Không làm được': 0 }, completedLessons: 12, totalQuestionsDone: 45 },
        { id: 'st-2', name: 'Trần Thị Bích', score: 8.5, competencyGroup: 'Nhóm C', errorBreakdown: { 'Sai kiến thức': 0, 'Sai công thức': 1, 'Sai mô hình hiện tượng': 1, 'Sai toán học': 0, 'Sai kỹ năng đọc đề': 0, 'Sai do cẩu thả': 0, 'Không làm được': 0 }, completedLessons: 11, totalQuestionsDone: 42 },
        { id: 'st-3', name: 'Lê Hoàng Cường', score: 7.5, competencyGroup: 'Nhóm B', errorBreakdown: { 'Sai kiến thức': 1, 'Sai công thức': 1, 'Sai mô hình hiện tượng': 0, 'Sai toán học': 1, 'Sai kỹ năng đọc đề': 1, 'Sai do cẩu thả': 0, 'Không làm được': 0 }, completedLessons: 9, totalQuestionsDone: 36 },
        { id: 'st-4', name: 'Phạm Minh Đức', score: 6.25, competencyGroup: 'Nhóm A', errorBreakdown: { 'Sai kiến thức': 3, 'Sai công thức': 2, 'Sai mô hình hiện tượng': 1, 'Sai toán học': 1, 'Sai kỹ năng đọc đề': 1, 'Sai do cẩu thả': 0, 'Không làm được': 1 }, completedLessons: 6, totalQuestionsDone: 28 },
        { id: 'st-5', name: 'Hoàng Thuỳ Dương', score: 8.75, competencyGroup: 'Nhóm C', errorBreakdown: { 'Sai kiến thức': 0, 'Sai công thức': 0, 'Sai mô hình hiện tượng': 1, 'Sai toán học': 0, 'Sai kỹ năng đọc đề': 1, 'Sai do cẩu thả': 0, 'Không làm được': 0 }, completedLessons: 12, totalQuestionsDone: 44 },
        { id: 'st-6', name: 'Đặng Tuấn Kiệt', score: 9.5, competencyGroup: 'Nhóm D', errorBreakdown: { 'Sai kiến thức': 0, 'Sai công thức': 0, 'Sai mô hình hiện tượng': 0, 'Sai toán học': 0, 'Sai kỹ năng đọc đề': 0, 'Sai do cẩu thả': 0, 'Không làm được': 0 }, completedLessons: 12, totalQuestionsDone: 45 },
      ],
    },
    {
      id: 'cls-10a2',
      name: 'Lớp 10A2',
      grade: '10',
      studentsCount: 40,
      averageScore: 7.45,
      completionRate: 76,
      students: [],
    },
  ]);

  const [selectedClassId, setSelectedClassId] = useState<string>('cls-10a1');
  const activeClass = classes.find((c) => c.id === selectedClassId) || classes[0];

  // Test Generator State
  const [selectedChapterForTest, setSelectedChapterForTest] = useState<number>(2);
  const [numNhanBiet, setNumNhanBiet] = useState<number>(4);
  const [numThongHieu, setNumThongHieu] = useState<number>(4);
  const [numVanDung, setNumVanDung] = useState<number>(3);
  const [numVanDungCao, setNumVanDungCao] = useState<number>(1);
  const [testCreatedMessage, setTestCreatedMessage] = useState<string | null>(null);

  // Markdown Assessment Report Generator according to Mandatory Pedagogical Rules
  const generateMarkdownReport = () => {
    const students = activeClass.students;
    const groupA = students.filter((s) => s.score < 7.0);
    const groupB = students.filter((s) => s.score >= 7.0 && s.score < 8.0);
    const groupC = students.filter((s) => s.score >= 8.0 && s.score < 9.0);
    const groupD = students.filter((s) => s.score >= 9.0);

    return `# BÁO CÁO KHẢO THÍ VÀ ĐO LƯỜNG ĐÁNH GIÁ NĂNG LỰC HỌC SINH MÔN VẬT LÍ 10
**Lớp:** ${activeClass.name} | **Chương trình:** GDPT 2018 (Kết nối tri thức) | **Ngày xuất:** ${new Date().toLocaleDateString('vi-VN')}
**Điểm trung bình:** ${activeClass.averageScore}/10 | **Tỉ lệ hoàn thành:** ${activeClass.completionRate}%

---

## 1. BẢNG PHÂN TẦNG NHÓM NĂNG LỰC HỌC SINH
| Nhóm Năng Lực | Khung Điểm | Số Lượng | Tỉ Lệ (%) | Mục Tiêu & Định Hướng Sư Phạm |
| :--- | :--- | :---: | :---: | :--- |
| **Nhóm A** | < 7.0 | ${groupA.length} | ${((groupA.length / (students.length || 1)) * 100).toFixed(1)}% | **Cần bù nền:** Củng cố lại định nghĩa, hiện tượng và các công thức cơ bản. |
| **Nhóm B** | 7.0 - 7.75 | ${groupB.length} | ${((groupB.length / (students.length || 1)) * 100).toFixed(1)}% | **Củng cố kỹ năng:** Rèn luyện kỹ năng biến đổi công thức và xử lý đồ thị (d-t, v-t). |
| **Nhóm C** | 8.0 - 8.75 | ${groupC.length} | ${((groupC.length / (students.length || 1)) * 100).toFixed(1)}% | **Luyện tập vận dụng:** Giải các bài toán tổng hợp đa lực, phân tích chuyển động ném. |
| **Nhóm D** | >= 9.0 | ${groupD.length} | ${((groupD.length / (students.length || 1)) * 100).toFixed(1)}% | **Bồi dưỡng nâng cao:** Phát triển tư duy mô hình hóa và giải quyết bài toán thực tiễn. |

---

## 2. BẢNG PHÂN LOẠI 7 NHÓM LỖI SAI TRỌNG TÂM CỦA HỌC SINH
| STT | Nhóm Lỗi Sai | Tần Suất | Mức Độ Ảnh Hưởng | Biện Pháp Khắc Phục Sư Phạm |
| :---: | :--- | :---: | :---: | :--- |
| 1 | **Sai kiến thức** | 4 lỗi | Trung bình | Yêu cầu học sinh đọc lại phần "Em đã học" cuối mỗi bài SGK. |
| 2 | **Sai công thức** | 4 lỗi | Cao | Lập bảng hệ thống công thức và kiểm tra nhanh 5 phút đầu giờ. |
| 3 | **Sai mô hình hiện tượng** | 3 lỗi | Cao | Cho học sinh quan sát mô phỏng tương tác 2D và phòng thí nghiệm ảo. |
| 4 | **Sai toán học (tính toán, đơn vị)** | 2 lỗi | Trung bình | Rèn kỹ năng đổi đơn vị SI (km/h sang m/s, cm sang m, gram sang kg). |
| 5 | **Sai kỹ năng đọc đề** | 3 lỗi | Trung bình | Hướng dẫn gạch chân từ khóa: "không đổi", "đứng yên", "bỏ qua ma sát". |
| 6 | **Sai do cẩu thả** | 1 lỗi | Thấp | Nhắc nhở kiểm tra lại dấu vector và điều kiện góc cos alpha. |
| 7 | **Không làm được** | 1 lỗi | Thấp | Chia nhỏ bài toán thành các câu hỏi phụ dẫn dắt từng bước. |

---

## 3. DANH SÁCH CHI TIẾT KẾT QUẢ ĐÁNH GIÁ HỌC SINH
| STT | Họ và Tên | Điểm Số | Nhóm Năng Lực | Bài Đã Học | Lỗi Sai Chủ Yếu |
| :---: | :--- | :---: | :---: | :---: | :--- |
${students.map((s, i) => `| ${i + 1} | ${s.name} | **${s.score}** | ${s.competencyGroup} | ${s.completedLessons}/12 | ${Object.entries(s.errorBreakdown).filter(([_, count]) => (count as number) > 0).map(([err, count]) => `${err} (${count})`).join(', ') || 'Không mắc lỗi'} |`).join('\n')}

---

## 4. KẾ HOẠCH BÀI GIẢNG VÀ NỘI DUNG CHỮA TRÊN LỚP
- **Nội dung trọng tâm cần chữa chung:** 
  1. Phân biệt độ dịch chuyển $d$ (vectơ) và quãng đường $s$ (vô hướng) khi đổi chiều chuyển động.
  2. Xác định dấu của gia tốc $a$ và vận tốc $v$ trong chuyển động chậm dần đều ($a.v < 0$).
  3. Phân tích lực trên mặt phẳng nghiêng $P_x = P.\\sin\\alpha$ và $P_y = P.\\cos\\alpha$.
- **Giao bài tập phân hoá:**
  - **Nhóm A & B:** Giao phiếu bài tập củng cố nhận biết - thông hiểu Bài 9 và Bài 15.
  - **Nhóm C & D:** Thử thách mô phỏng chuyển động ném xiên và bài toán va chạm mềm.`;
  };

  const handleCopyMarkdown = () => {
    const md = generateMarkdownReport();
    navigator.clipboard.writeText(md);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2500);
  };

  const handleDownloadMarkdown = () => {
    const md = generateMarkdownReport();
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Bao_Cao_Khao_Thi_${activeClass.name}_VatLi10.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div id="teacher-dashboard" className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-2xl border border-cyan-500/30 bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/40 p-6 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-cyan-500/20 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-cyan-300">
                KHU VỰC KHẢO THÍ & ĐÁNH GIÁ SƯ PHẠM
              </span>
              <span className="rounded-md bg-purple-500/20 px-2.5 py-1 text-xs font-bold text-purple-300">
                GDPT 2018
              </span>
            </div>
            <h2 className="mt-2 text-2xl font-extrabold text-slate-100 sm:text-3xl">
              Teacher Dashboard & Assessment Analytics
            </h2>
            <p className="mt-1 text-sm text-slate-300">
              Công cụ Khảo thí & Đo lường Đánh giá Giáo dục môn Vật lí THPT: Phân tầng 4 nhóm năng lực (A/B/C/D), phân tích 7 nhóm lỗi sai và xuất báo cáo Markdown chuẩn sư phạm.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              id="copy-markdown-report-btn"
              onClick={handleCopyMarkdown}
              className="flex items-center gap-2 rounded-xl bg-cyan-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg transition hover:bg-cyan-500"
            >
              {copySuccess ? <CheckCircle2 className="h-4 w-4 text-emerald-300" /> : <Copy className="h-4 w-4" />}
              <span>{copySuccess ? 'Đã sao chép Bảng Markdown!' : 'Sao chép Báo cáo Markdown'}</span>
            </button>

            <button
              id="download-markdown-report-btn"
              onClick={handleDownloadMarkdown}
              className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2.5 text-xs font-semibold text-slate-300 hover:bg-slate-700"
            >
              <Download className="h-4 w-4" />
              <span>Tải file .md</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mt-6 flex flex-wrap gap-2 border-t border-slate-800/80 pt-4">
          {[
            { id: 'ANALYTICS', label: 'Báo cáo Khảo thí & Lỗi sai', icon: BarChart3 },
            { id: 'CLASSES', label: 'Quản lý Lớp & Học sinh', icon: Users },
            { id: 'ASSIGN', label: 'Giao bài & Nhiệm vụ', icon: Send },
            { id: 'TEST_CREATOR', label: 'Ma trận Đề kiểm tra', icon: FileSpreadsheet },
          ].map((tab) => {
            const Icon = tab.icon;
            const isSelected = selectedTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`teacher-tab-${tab.id}`}
                onClick={() => setSelectedTab(tab.id as any)}
                className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
                  isSelected
                    ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                    : 'border border-slate-800 bg-slate-800/80 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab 1: Pedagogical Assessment & Error Taxonomy */}
      {selectedTab === 'ANALYTICS' && (
        <div className="space-y-6">
          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-4">
              <span className="text-xs text-slate-400">Sĩ số lớp hiện tại</span>
              <p className="mt-1 text-2xl font-extrabold text-slate-100">{activeClass.studentsCount} học sinh</p>
              <span className="text-[11px] text-cyan-400">Đã cập nhật bài làm</span>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-4">
              <span className="text-xs text-slate-400">Điểm trung bình lớp</span>
              <p className="mt-1 text-2xl font-extrabold text-emerald-400">{activeClass.averageScore} / 10</p>
              <span className="text-[11px] text-slate-400">Chuẩn đánh giá năng lực</span>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-4">
              <span className="text-xs text-slate-400">Tỉ lệ hoàn thành chương trình</span>
              <p className="mt-1 text-2xl font-extrabold text-cyan-400">{activeClass.completionRate}%</p>
              <div className="mt-1 h-1.5 w-full rounded-full bg-slate-800">
                <div className="h-full rounded-full bg-cyan-500" style={{ width: `${activeClass.completionRate}%` }} />
              </div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-4">
              <span className="text-xs text-slate-400">Nhóm cần bù nền (Nhóm A)</span>
              <p className="mt-1 text-2xl font-extrabold text-amber-400">1 học sinh</p>
              <span className="text-[11px] text-amber-300">Cần kế hoạch phụ đạo</span>
            </div>
          </div>

          {/* 4 Competency Groups Table (Rule 1) */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-cyan-400" />
                <h3 className="font-bold text-slate-100">1. Quy chuẩn 4 Nhóm Năng lực Học sinh (Theo Quy chuẩn Khảo thí)</h3>
              </div>
              <span className="text-xs text-slate-400 font-mono">Quy định A/B/C/D</span>
            </div>

            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="pb-3">Nhóm Năng Lực</th>
                    <th className="pb-3">Khung Điểm</th>
                    <th className="pb-3">Số Lượng</th>
                    <th className="pb-3">Mục Tiêu Sư Phạm</th>
                    <th className="pb-3">Kế Hoạch Ôn Tập Cụ Thể</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  <tr className="text-slate-300">
                    <td className="py-3 font-bold text-amber-400">Nhóm A</td>
                    <td className="py-3 font-mono">&lt; 7.0</td>
                    <td className="py-3 font-bold">1 HS (16.7%)</td>
                    <td className="py-3 text-amber-300">Cần bù nền kiến thức</td>
                    <td className="py-3 text-slate-300">Củng cố khái niệm, công thức cơ bản và làm thí nghiệm ảo kiểm chứng hiện tượng.</td>
                  </tr>
                  <tr className="text-slate-300">
                    <td className="py-3 font-bold text-cyan-400">Nhóm B</td>
                    <td className="py-3 font-mono">7.0 - 7.75</td>
                    <td className="py-3 font-bold">1 HS (16.7%)</td>
                    <td className="py-3 text-cyan-300">Củng cố kỹ năng biến đổi</td>
                    <td className="py-3 text-slate-300">Rèn luyện kỹ năng biến đổi đại số, quy tắc cộng vectơ và đọc đồ thị d-t, v-t.</td>
                  </tr>
                  <tr className="text-slate-300">
                    <td className="py-3 font-bold text-emerald-400">Nhóm C</td>
                    <td className="py-3 font-mono">8.0 - 8.75</td>
                    <td className="py-3 font-bold">2 HS (33.3%)</td>
                    <td className="py-3 text-emerald-300">Luyện tập bài vận dụng</td>
                    <td className="py-3 text-slate-300">Giải các bài toán nhiều giai đoạn chuyển động, ném xiên và tổng hợp nhiều lực.</td>
                  </tr>
                  <tr className="text-slate-300">
                    <td className="py-3 font-bold text-purple-400">Nhóm D</td>
                    <td className="py-3 font-mono">&gt;= 9.0</td>
                    <td className="py-3 font-bold">2 HS (33.3%)</td>
                    <td className="py-3 text-purple-300">Bồi dưỡng nâng cao</td>
                    <td className="py-3 text-slate-300">Phát triển tư duy mô hình hoá, thiết kế phương án thí nghiệm và giải bài toán thực tiễn.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* 7 Error Taxonomy Table (Rule 2) */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-400" />
                <h3 className="font-bold text-slate-100">2. Ma trận Phân loại 7 Nhóm Lỗi Sai của Học sinh</h3>
              </div>
              <span className="text-xs text-slate-400 font-mono">7 Nhóm Lỗi Sư Phạm</span>
            </div>

            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="pb-3">STT</th>
                    <th className="pb-3">Nhóm Lỗi Sai</th>
                    <th className="pb-3">Tần Suất Xuất Hiện</th>
                    <th className="pb-3">Ví Dụ Minh Họa</th>
                    <th className="pb-3">Giải Pháp Sư Phạm</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {[
                    { no: 1, name: 'Sai kiến thức', count: 4, example: 'Hiểu nhầm lực và phản lực là hai lực cân bằng nhau', solution: 'Nhấn mạnh điểm đặt của cặp lực trực đối trên 2 vật khác nhau' },
                    { no: 2, name: 'Sai công thức', count: 4, example: 'Quên chia 2 trong công thức thế năng đàn hồi hoặc rơi tự do h = 1/2gt²', solution: 'Kiểm tra 5 phút đầu giờ bảng công thức' },
                    { no: 3, name: 'Sai mô hình hiện tượng', count: 3, example: 'Không nhận diện được lực đóng vai trò lực hướng tâm', solution: 'Sử dụng mô phỏng trực quan chuyển động tròn để chỉ ra thành phần lực hướng tâm' },
                    { no: 4, name: 'Sai toán học', count: 2, example: 'Quên đổi km/h sang m/s (chia 3,6)', solution: 'Rèn thói quen ghi rõ đơn vị trong từng bước thế số' },
                    { no: 5, name: 'Sai kỹ năng đọc đề', count: 3, example: 'Bỏ sót giả thiết "thả rơi không vận tốc đầu (v0 = 0)"', solution: 'Yêu cầu gạch chân từ khóa đề bài' },
                    { no: 6, name: 'Sai do cẩu thả', count: 1, example: 'Tính đúng biểu thức nhưng bấm sai máy tính', solution: 'Tập thói quen ước lượng bậc độ lớn của kết quả' },
                    { no: 7, name: 'Không làm được', count: 1, example: 'Bài toán ném xiên góc alpha kết hợp bảo toàn cơ năng', solution: 'Sử dụng trợ lý Socratic chia nhỏ bài toán thành các câu hỏi dẫn dắt' },
                  ].map((err) => (
                    <tr key={err.no} className="text-slate-300">
                      <td className="py-3 font-bold text-cyan-400">{err.no}</td>
                      <td className="py-3 font-semibold text-slate-100">{err.name}</td>
                      <td className="py-3 font-mono">{err.count} lần</td>
                      <td className="py-3 text-slate-400">{err.example}</td>
                      <td className="py-3 text-emerald-300">{err.solution}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Student List Table */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl">
            <h3 className="font-bold text-slate-100 border-b border-slate-800 pb-3">
              3. Danh sách Học sinh & Minh chứng Đánh giá ({activeClass.name})
            </h3>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="pb-3">Mã HS</th>
                    <th className="pb-3">Họ và Tên</th>
                    <th className="pb-3">Điểm Số</th>
                    <th className="pb-3">Nhóm Năng Lực</th>
                    <th className="pb-3">Tiến Độ Bài Học</th>
                    <th className="pb-3">Lỗi Sai Chủ Yếu</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {activeClass.students.map((st) => (
                    <tr key={st.id} className="text-slate-300 font-sans">
                      <td className="py-3 font-mono text-slate-400">{st.id}</td>
                      <td className="py-3 font-semibold text-slate-100">{st.name}</td>
                      <td className="py-3 font-mono font-bold text-cyan-400">{st.score}</td>
                      <td className="py-3">
                        <span className={`rounded-md px-2 py-0.5 text-[11px] font-bold ${
                          st.competencyGroup === 'Nhóm D' ? 'bg-purple-500/20 text-purple-300' :
                          st.competencyGroup === 'Nhóm C' ? 'bg-emerald-500/20 text-emerald-300' :
                          st.competencyGroup === 'Nhóm B' ? 'bg-cyan-500/20 text-cyan-300' :
                          'bg-amber-500/20 text-amber-300'
                        }`}>
                          {st.competencyGroup}
                        </span>
                      </td>
                      <td className="py-3 font-mono">{st.completedLessons}/12 bài</td>
                      <td className="py-3 text-slate-400 text-xs">
                        {Object.entries(st.errorBreakdown)
                          .filter(([_, count]) => (count as number) > 0)
                          .map(([err, count]) => `${err} (${count})`)
                          .join(', ') || 'Không mắc lỗi'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Class Management */}
      {selectedTab === 'CLASSES' && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <h3 className="font-bold text-slate-100">Danh sách Lớp học phụ trách</h3>
            <button className="flex items-center gap-1.5 rounded-xl bg-cyan-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-cyan-500">
              <PlusCircle className="h-4 w-4" />
              <span>Thêm lớp mới</span>
            </button>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            {classes.map((c) => (
              <div
                key={c.id}
                onClick={() => setSelectedClassId(c.id)}
                className={`cursor-pointer rounded-xl border p-5 transition ${
                  selectedClassId === c.id
                    ? 'border-cyan-500 bg-cyan-950/30'
                    : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-lg font-bold text-slate-100">{c.name}</h4>
                  <span className="rounded-md bg-slate-800 px-2 py-0.5 text-xs text-slate-300">Khối {c.grade}</span>
                </div>
                <div className="mt-3 flex justify-between text-xs text-slate-400">
                  <span>Sĩ số: <strong className="text-slate-200">{c.studentsCount} HS</strong></span>
                  <span>Điểm TB: <strong className="text-emerald-400">{c.averageScore}</strong></span>
                  <span>Hoàn thành: <strong className="text-cyan-400">{c.completionRate}%</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Assign Lessons */}
      {selectedTab === 'ASSIGN' && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl">
          <h3 className="font-bold text-slate-100 border-b border-slate-800 pb-4">Giao bài tập & Nhiệm vụ học tập</h3>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              alert('Đã giao nhiệm vụ thành công cho toàn bộ học sinh lớp!');
            }}
            className="mt-6 space-y-4 max-w-xl"
          >
            <div>
              <label className="block text-xs font-semibold text-slate-300">Chọn Lớp học:</label>
              <select className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-slate-200">
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>{c.name} ({c.studentsCount} học sinh)</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300">Chọn Chương & Bài học:</label>
              <select className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-slate-200">
                {CHAPTERS.map((ch) => (
                  <optgroup key={ch.id} label={`Chương ${ch.romanNumeral}: ${ch.title}`}>
                    {ch.lessons.map((ls) => (
                      <option key={ls.id} value={ls.id}>Bài {ls.lessonNumber}: {ls.title}</option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300">Hạn nộp bài:</label>
              <input
                type="date"
                defaultValue={new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]}
                className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-slate-200"
              />
            </div>

            <button
              type="submit"
              className="flex items-center gap-2 rounded-xl bg-cyan-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg transition hover:bg-cyan-500"
            >
              <Send className="h-4 w-4" />
              <span>Giao bài cho học sinh</span>
            </button>
          </form>
        </div>
      )}

      {/* Tab 4: Test Creator Matrix */}
      {selectedTab === 'TEST_CREATOR' && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl">
          <h3 className="font-bold text-slate-100 border-b border-slate-800 pb-4">
            Thiết kế Ma trận Đề kiểm tra Chuẩn GDPT 2018
          </h3>

          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300">Chọn Chủ đề / Chương kiểm tra:</label>
                <select
                  value={selectedChapterForTest}
                  onChange={(e) => setSelectedChapterForTest(Number(e.target.value))}
                  className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-slate-200"
                >
                  {CHAPTERS.map((ch) => (
                    <option key={ch.id} value={ch.id}>Chương {ch.romanNumeral}: {ch.title}</option>
                  ))}
                </select>
              </div>

              {/* 4 Levels Distribution */}
              <div className="space-y-3 rounded-xl border border-slate-800 bg-slate-950/60 p-4">
                <div className="text-xs font-bold text-cyan-400 uppercase">Phân bổ 4 Mức độ Nhận thức</div>

                <div>
                  <div className="flex justify-between text-xs text-slate-300">
                    <span>Nhận biết (40%):</span>
                    <span className="font-mono font-bold text-slate-100">{numNhanBiet} câu</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={10}
                    value={numNhanBiet}
                    onChange={(e) => setNumNhanBiet(Number(e.target.value))}
                    className="w-full accent-cyan-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs text-slate-300">
                    <span>Thông hiểu (30%):</span>
                    <span className="font-mono font-bold text-slate-100">{numThongHieu} câu</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={10}
                    value={numThongHieu}
                    onChange={(e) => setNumThongHieu(Number(e.target.value))}
                    className="w-full accent-cyan-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs text-slate-300">
                    <span>Vận dụng (20%):</span>
                    <span className="font-mono font-bold text-slate-100">{numVanDung} câu</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={8}
                    value={numVanDung}
                    onChange={(e) => setNumVanDung(Number(e.target.value))}
                    className="w-full accent-cyan-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs text-slate-300">
                    <span>Vận dụng cao (10%):</span>
                    <span className="font-mono font-bold text-slate-100">{numVanDungCao} câu</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={4}
                    value={numVanDungCao}
                    onChange={(e) => setNumVanDungCao(Number(e.target.value))}
                    className="w-full accent-cyan-500"
                  />
                </div>
              </div>

              <button
                onClick={() => {
                  setTestCreatedMessage(`Đã tạo thành công Đề kiểm tra gồm ${numNhanBiet + numThongHieu + numVanDung + numVanDungCao} câu hỏi theo chuẩn ma trận!`);
                }}
                className="w-full rounded-xl bg-cyan-600 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-cyan-500"
              >
                Tạo Đề & Trộn Câu hỏi Tự động
              </button>

              {testCreatedMessage && (
                <div className="rounded-xl border border-emerald-500/40 bg-emerald-950/40 p-3 text-xs text-emerald-300">
                  {testCreatedMessage}
                </div>
              )}
            </div>

            {/* Matrix Summary Table */}
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
              <div className="text-xs font-bold uppercase text-slate-400 mb-3">Bảng Ma trận Đề thi Chuẩn</div>
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="pb-2">Mức độ</th>
                    <th className="pb-2">Số câu</th>
                    <th className="pb-2">Điểm số</th>
                    <th className="pb-2">Tỉ lệ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  <tr>
                    <td className="py-2 text-cyan-400 font-sans">Nhận biết</td>
                    <td className="py-2">{numNhanBiet}</td>
                    <td className="py-2">{((numNhanBiet / (numNhanBiet + numThongHieu + numVanDung + numVanDungCao)) * 10).toFixed(1)} đ</td>
                    <td className="py-2">{(((numNhanBiet) / (numNhanBiet + numThongHieu + numVanDung + numVanDungCao)) * 100).toFixed(0)}%</td>
                  </tr>
                  <tr>
                    <td className="py-2 text-cyan-400 font-sans">Thông hiểu</td>
                    <td className="py-2">{numThongHieu}</td>
                    <td className="py-2">{((numThongHieu / (numNhanBiet + numThongHieu + numVanDung + numVanDungCao)) * 10).toFixed(1)} đ</td>
                    <td className="py-2">{(((numThongHieu) / (numNhanBiet + numThongHieu + numVanDung + numVanDungCao)) * 100).toFixed(0)}%</td>
                  </tr>
                  <tr>
                    <td className="py-2 text-amber-400 font-sans">Vận dụng</td>
                    <td className="py-2">{numVanDung}</td>
                    <td className="py-2">{((numVanDung / (numNhanBiet + numThongHieu + numVanDung + numVanDungCao)) * 10).toFixed(1)} đ</td>
                    <td className="py-2">{(((numVanDung) / (numNhanBiet + numThongHieu + numVanDung + numVanDungCao)) * 100).toFixed(0)}%</td>
                  </tr>
                  <tr>
                    <td className="py-2 text-purple-400 font-sans">Vận dụng cao</td>
                    <td className="py-2">{numVanDungCao}</td>
                    <td className="py-2">{((numVanDungCao / (numNhanBiet + numThongHieu + numVanDung + numVanDungCao)) * 10).toFixed(1)} đ</td>
                    <td className="py-2">{(((numVanDungCao) / (numNhanBiet + numThongHieu + numVanDung + numVanDungCao)) * 100).toFixed(0)}%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
