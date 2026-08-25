import React, { useState } from 'react';
import { Network, ZoomIn, ZoomOut, RotateCcw, ChevronRight, BookOpen, Layers } from 'lucide-react';
import { CHAPTERS } from '../../data/curriculumData';

interface MindmapNode {
  id: string;
  title: string;
  subtitle?: string;
  color: string;
  formulas?: string[];
  children?: MindmapNode[];
}

export const MINDMAP_DATA: Record<number, MindmapNode> = {
  1: {
    id: 'c1',
    title: 'CHƯƠNG I: MỞ ĐẦU',
    color: '#0ea5e9',
    children: [
      {
        id: 'c1-1',
        title: 'Đối tượng & Lịch sử',
        subtitle: 'Vật chất & Năng lượng',
        color: '#38bdf8',
        children: [
          { id: 'c1-1-1', title: 'Tiền Vật lí (Aristotle)', subtitle: 'Quan sát & suy luận', color: '#94a3b8' },
          { id: 'c1-1-2', title: 'Vật lí Cổ điển (Galilei, Newton)', subtitle: 'Thực nghiệm khoa học', color: '#94a3b8' },
          { id: 'c1-1-3', title: 'Vật lí Hiện đại (Einstein, Planck)', subtitle: 'Thuyết tương đối & Lượng tử', color: '#94a3b8' },
        ],
      },
      {
        id: 'c1-2',
        title: 'Phương pháp Nghiên cứu',
        color: '#06b6d4',
        children: [
          { id: 'c1-2-1', title: 'Thực nghiệm', subtitle: 'Đặt vấn đề → Dự đoán → TN → Kết luận', color: '#67e8f9' },
          { id: 'c1-2-2', title: 'Mô hình hoá', subtitle: 'Vật chất, Lí thuyết (chất điểm), Toán học', color: '#67e8f9' },
        ],
      },
      {
        id: 'c1-3',
        title: 'Sai số phép đo',
        color: '#f59e0b',
        formulas: ['\\bar{A} = \\frac{\\sum A_i}{n}', '\\Delta A = \\overline{\\Delta A} + \\Delta A_{dc}', '\\delta A = \\frac{\\Delta A}{\\bar{A}}.100\\%'],
        children: [
          { id: 'c1-3-1', title: 'Sai số hệ thống', subtitle: 'Do cấu tạo dụng cụ (DCNN)', color: '#fcd34d' },
          { id: 'c1-3-2', title: 'Sai số ngẫu nhiên', subtitle: 'Do thao tác, giác quan, môi trường', color: '#fcd34d' },
        ],
      },
    ],
  },
  2: {
    id: 'c2',
    title: 'CHƯƠNG II: ĐỘNG HỌC',
    color: '#06b6d4',
    children: [
      {
        id: 'c2-1',
        title: 'Đại lượng cơ bản',
        color: '#38bdf8',
        formulas: ['d = x - x_0', 'v_{tb} = \\frac{s}{t}', '\\vec{v} = \\frac{\\Delta\\vec{d}}{\\Delta t}', 'a = \\frac{\\Delta v}{\\Delta t}'],
        children: [
          { id: 'c2-1-1', title: 'Quãng đường (s)', subtitle: 'Vô hướng, luôn dương', color: '#94a3b8' },
          { id: 'c2-1-2', title: 'Độ dịch chuyển (d)', subtitle: 'Vectơ nối đầu - cuối', color: '#94a3b8' },
          { id: 'c2-1-3', title: 'Gia tốc (a)', subtitle: 'Tốc độ biến đổi vận tốc', color: '#94a3b8' },
        ],
      },
      {
        id: 'c2-2',
        title: 'Chuyển động thẳng biến đổi đều',
        color: '#10b981',
        formulas: ['v = v_0 + a.t', 'd = v_0.t + \\frac{1}{2}a.t^2', 'v^2 - v_0^2 = 2.a.d'],
        children: [
          { id: 'c2-2-1', title: 'Nhanh dần đều', subtitle: 'a.v > 0 (cùng dấu)', color: '#6ee7b7' },
          { id: 'c2-2-2', title: 'Chậm dần đều', subtitle: 'a.v < 0 (trái dấu)', color: '#6ee7b7' },
        ],
      },
      {
        id: 'c2-3',
        title: 'Rơi tự do & Chuyển động ném',
        color: '#f59e0b',
        formulas: ['v = g.t', 'h = \\frac{1}{2}g.t^2', 'L_{ngang} = v_0\\sqrt{\\frac{2H}{g}}', 'L_{xien} = \\frac{v_0^2\\sin 2\\alpha}{g}'],
        children: [
          { id: 'c2-3-1', title: 'Rơi tự do', subtitle: 'Chỉ dưới tác dụng của trọng lực, a = g', color: '#fcd34d' },
          { id: 'c2-3-2', title: 'Ném ngang', subtitle: 'Ox thẳng đều, Oy rơi tự do', color: '#fcd34d' },
          { id: 'c2-3-3', title: 'Ném xiên', subtitle: 'Quỹ đạo Parabol, max khi 45°', color: '#fcd34d' },
        ],
      },
    ],
  },
  3: {
    id: 'c3',
    title: 'CHƯƠNG III: ĐỘNG LỰC HỌC',
    color: '#8b5cf6',
    children: [
      {
        id: 'c3-1',
        title: '3 Định luật Newton',
        color: '#a78bfa',
        formulas: ['\\Sigma\\vec{F} = \\vec{0} \\implies \\vec{v} = \\text{const}', '\\vec{F} = m.\\vec{a}', '\\vec{F}_{AB} = -\\vec{F}_{BA}'],
        children: [
          { id: 'c3-1-1', title: 'ĐL 1: Quán tính', subtitle: 'Bảo toàn vận tốc khi không có lực', color: '#c4b5fd' },
          { id: 'c3-1-2', title: 'ĐL 2: Động lực học', subtitle: 'Gia tốc tỉ lệ thuận F, nghịch m', color: '#c4b5fd' },
          { id: 'c3-1-3', title: 'ĐL 3: Tác dụng - Phản lực', subtitle: 'Hai lực trực đối đặt lên 2 vật', color: '#c4b5fd' },
        ],
      },
      {
        id: 'c3-2',
        title: 'Các lực trong Cơ học',
        color: '#06b6d4',
        formulas: ['P = m.g', 'F_{mst} = \\mu.N', 'M = F.d'],
        children: [
          { id: 'c3-2-1', title: 'Trọng lực & Lực căng', subtitle: 'P hướng tâm Trái Đất, T dọc dây', color: '#67e8f9' },
          { id: 'c3-2-2', title: 'Lực ma sát', subtitle: 'Ma sát nghỉ, ma sát trượt', color: '#67e8f9' },
          { id: 'c3-2-3', title: 'Moment lực & Cân bằng', subtitle: 'M = F.d, tổng Moment = 0', color: '#67e8f9' },
        ],
      },
    ],
  },
  4: {
    id: 'c4',
    title: 'CHƯƠNG IV: NĂNG LƯỢNG',
    color: '#ec4899',
    children: [
      {
        id: 'c4-1',
        title: 'Công & Công suất',
        color: '#f472b6',
        formulas: ['A = F.s.\\cos\\alpha', '\\mathcal{P} = \\frac{A}{t} = F.v'],
        children: [
          { id: 'c4-1-1', title: 'Công phát động (A > 0)', subtitle: 'alpha < 90°', color: '#fbcfe8' },
          { id: 'c4-1-2', title: 'Công cản (A < 0)', subtitle: 'alpha > 90°', color: '#fbcfe8' },
        ],
      },
      {
        id: 'c4-2',
        title: 'Cơ năng & Bảo toàn',
        color: '#10b981',
        formulas: ['W_d = \\frac{1}{2}m.v^2', 'W_t = m.g.h', 'W = W_d + W_t = \\text{const}', 'H = \\frac{W_{ci}}{W_{tp}}.100\\%'],
        children: [
          { id: 'c4-2-1', title: 'Động năng', subtitle: 'Năng lượng do chuyển động', color: '#6ee7b7' },
          { id: 'c4-2-2', title: 'Thế năng trọng trường', subtitle: 'Năng lượng vị trí', color: '#6ee7b7' },
          { id: 'c4-2-3', title: 'Bảo toàn cơ năng', subtitle: 'Chỉ có lực thế tác dụng', color: '#6ee7b7' },
        ],
      },
    ],
  },
};

export const PhysicsMindmap: React.FC = () => {
  const [selectedChapterId, setSelectedChapterId] = useState<number>(2);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [activeNodeId, setActiveNodeId] = useState<string | null>(null);

  const currentTree = MINDMAP_DATA[selectedChapterId] || MINDMAP_DATA[2];

  return (
    <div id="physics-mindmap-section" className="space-y-6">
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl backdrop-blur-md">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-cyan-500/10 px-2.5 py-1 text-xs font-semibold text-cyan-400">
                SƠ ĐỒ TƯ DUY TƯƠNG TÁC
              </span>
              <h2 className="text-2xl font-bold text-slate-100">Physics Mindmap Hub</h2>
            </div>
            <p className="mt-1 text-sm text-slate-400">
              Tổng quan cấu trúc logic mạng lưới kiến thức theo từng chương GDPT 2018. Click vào từng nhánh để xem công thức và bài học liên quan.
            </p>
          </div>

          {/* Chapter Tabs */}
          <div className="flex flex-wrap gap-1.5">
            {CHAPTERS.slice(0, 4).map((ch) => (
              <button
                key={ch.id}
                onClick={() => setSelectedChapterId(ch.id)}
                className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition ${
                  selectedChapterId === ch.id
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                    : 'border border-slate-800 bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                Chương {ch.romanNumeral}
              </button>
            ))}
          </div>
        </div>

        {/* Mindmap Interactive Canvas */}
        <div className="relative mt-6 min-h-[460px] overflow-auto rounded-xl border border-slate-800 bg-slate-950 p-8">
          {/* Zoom controls */}
          <div className="absolute top-4 right-4 flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900/90 p-1 backdrop-blur-md z-10">
            <button
              onClick={() => setZoomLevel((z) => Math.min(1.4, z + 0.1))}
              className="rounded p-1.5 text-slate-300 hover:bg-slate-800"
              title="Phóng to"
            >
              <ZoomIn className="h-4 w-4" />
            </button>
            <button
              onClick={() => setZoomLevel((z) => Math.max(0.7, z - 0.1))}
              className="rounded p-1.5 text-slate-300 hover:bg-slate-800"
              title="Thu nhỏ"
            >
              <ZoomOut className="h-4 w-4" />
            </button>
            <button
              onClick={() => setZoomLevel(1)}
              className="rounded p-1.5 text-slate-300 hover:bg-slate-800"
              title="Khôi phục kích thước"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>

          {/* Hierarchical Node Tree */}
          <div
            className="flex flex-col items-center gap-8 transition-transform duration-200"
            style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'top center' }}
          >
            {/* Root Node */}
            <div
              className="rounded-2xl border-2 border-cyan-400 bg-cyan-950/70 px-6 py-3.5 text-center shadow-lg shadow-cyan-950/80 cursor-pointer hover:border-cyan-300"
              onClick={() => setActiveNodeId(currentTree.id)}
            >
              <h3 className="text-base font-extrabold text-cyan-300 tracking-wide">{currentTree.title}</h3>
            </div>

            {/* Level 1 branches */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl">
              {currentTree.children?.map((branch) => (
                <div
                  key={branch.id}
                  className="flex flex-col gap-4 rounded-xl border border-slate-800 bg-slate-900/80 p-5 shadow transition hover:border-cyan-500/50 hover:bg-slate-900"
                >
                  <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: branch.color }}
                    />
                    <h4 className="font-bold text-slate-100 text-sm">{branch.title}</h4>
                  </div>

                  {branch.subtitle && (
                    <span className="text-xs text-slate-400">{branch.subtitle}</span>
                  )}

                  {/* Formulas in this branch */}
                  {branch.formulas && branch.formulas.length > 0 && (
                    <div className="space-y-1.5 rounded-lg bg-slate-950/80 p-3 border border-slate-800/80">
                      <div className="text-[10px] font-semibold uppercase text-cyan-400">Công thức cốt lõi:</div>
                      {branch.formulas.map((f, i) => (
                        <div key={i} className="font-mono text-xs text-slate-200">
                          ${f}$
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Sub-branches */}
                  {branch.children && (
                    <div className="space-y-2 pt-1">
                      {branch.children.map((sub) => (
                        <div
                          key={sub.id}
                          className="flex items-start gap-2 rounded-lg bg-slate-950/50 p-2.5 border border-slate-800/60"
                        >
                          <ChevronRight className="h-3.5 w-3.5 text-cyan-400 mt-0.5 shrink-0" />
                          <div>
                            <div className="text-xs font-semibold text-slate-200">{sub.title}</div>
                            {sub.subtitle && (
                              <div className="text-[11px] text-slate-400 mt-0.5">{sub.subtitle}</div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
