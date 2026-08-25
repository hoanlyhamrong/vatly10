import React, { useState } from 'react';
import katex from 'katex';
import { Info, X, Zap } from 'lucide-react';

export interface MathFormulaProps {
  latex: string;
  displayMode?: boolean;
  name?: string;
  description?: string;
  units?: string;
  conditions?: string;
  className?: string;
  asCard?: boolean;
}

export const MathFormulaModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  latex: string;
  name?: string;
  description?: string;
  units?: string;
  conditions?: string;
}> = ({ isOpen, onClose, latex, name, description, units, conditions }) => {
  if (!isOpen) return null;

  return (
    <div
      id="formula-detail-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl rounded-2xl border border-cyan-500/30 bg-[#0C1528] p-5 sm:p-6 shadow-2xl space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-white/10 pb-3.5">
          <div className="flex items-center gap-2.5">
            <span className="rounded-lg bg-[#00D4FF]/10 border border-[#00D4FF]/30 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-[#00D4FF]">
              Công thức Vật lí 10
            </span>
            {name && <h4 className="font-bold text-base sm:text-lg text-white">{name}</h4>}
          </div>
          <button
            id="close-formula-modal-btn"
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="rounded-xl border border-cyan-500/20 bg-[#070E1C] p-4 text-center text-lg sm:text-xl shadow-inner overflow-x-auto">
          <div
            dangerouslySetInnerHTML={{
              __html: katex.renderToString(latex, {
                displayMode: true,
                throwOnError: false,
              }),
            }}
          />
        </div>

        <div className="space-y-2.5 text-xs sm:text-sm text-gray-200">
          {description && (
            <div className="rounded-xl border border-white/5 bg-[#070E1C] p-3.5 space-y-1">
              <span className="font-bold text-[#00D4FF] block text-xs uppercase tracking-wider">Ý nghĩa các đại lượng:</span>
              <p className="text-gray-100 leading-relaxed">{description}</p>
            </div>
          )}

          {units && (
            <div className="rounded-xl border border-white/5 bg-[#070E1C] p-3.5 space-y-1">
              <span className="font-bold text-[#00FFCC] block text-xs uppercase tracking-wider">Đơn vị chuẩn SI:</span>
              <p className="font-mono text-emerald-300 font-semibold">{units}</p>
            </div>
          )}

          {conditions && (
            <div className="rounded-xl border border-white/5 bg-[#070E1C] p-3.5 space-y-1">
              <span className="font-bold text-amber-400 block text-xs uppercase tracking-wider">Điều kiện áp dụng & Lưu ý:</span>
              <p className="text-gray-100 leading-relaxed">{conditions}</p>
            </div>
          )}
        </div>

        <div className="mt-4 flex justify-end">
          <button
            id="formula-modal-done-btn"
            onClick={onClose}
            className="rounded-xl bg-[#00D4FF] hover:bg-[#00B8E0] px-5 py-2 text-xs sm:text-sm font-bold text-black shadow-[0_0_15px_rgba(0,212,255,0.3)] transition-all cursor-pointer"
          >
            Đã hiểu
          </button>
        </div>
      </div>
    </div>
  );
};

export const MathFormulaCard: React.FC<MathFormulaProps> = ({
  latex,
  name,
  description,
  units,
  conditions,
  className = '',
}) => {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <div
        className={`group relative flex flex-col justify-between rounded-2xl border border-cyan-500/25 bg-gradient-to-b from-[#0F1E38] to-[#091326] p-4 sm:p-4.5 shadow-md transition-all duration-300 hover:border-cyan-400 hover:shadow-[0_0_20px_rgba(0,212,255,0.18)] hover:-translate-y-0.5 cursor-pointer ${className}`}
        onClick={() => setShowModal(true)}
      >
        {/* Card Header: Formula Name & Info Icon */}
        <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-2.5">
          <div className="flex items-center gap-2 truncate">
            <span className="h-2 w-2 rounded-full bg-[#00D4FF] shadow-[0_0_8px_#00D4FF] shrink-0" />
            <span className="text-xs sm:text-sm font-bold text-cyan-200 truncate">
              {name || 'Công thức trọng tâm'}
            </span>
          </div>
          <span className="flex items-center gap-1 rounded-md bg-[#00D4FF]/10 border border-[#00D4FF]/30 px-2 py-0.5 text-[10px] font-bold text-[#00D4FF] uppercase shrink-0 group-hover:bg-[#00D4FF]/20 transition-colors">
            <Info className="h-3 w-3" />
            <span>Chi tiết</span>
          </span>
        </div>

        {/* KaTeX Formula Display Box (Centered, Symmetrical, Balanced) */}
        <div className="my-3 flex items-center justify-center rounded-xl bg-[#050C1A]/90 border border-white/5 px-3 py-3.5 shadow-inner min-h-[68px] text-center overflow-x-auto no-scrollbar">
          <div
            className="text-white text-sm sm:text-base font-normal tracking-wide"
            dangerouslySetInnerHTML={{
              __html: katex.renderToString(latex, {
                displayMode: true,
                throwOnError: false,
              }),
            }}
          />
        </div>

        {/* Card Footer: Short description / SI Unit */}
        <div className="flex items-center justify-between text-[11px] text-slate-300 pt-2 border-t border-white/5">
          {units ? (
            <span className="truncate text-emerald-300 font-mono">
              Đơn vị: <strong className="text-emerald-200">{units}</strong>
            </span>
          ) : description ? (
            <span className="truncate text-slate-300">
              {description}
            </span>
          ) : (
            <span className="text-slate-400">Chuẩn GDPT 2018</span>
          )}
          <span className="text-[#00D4FF] font-semibold text-[10px] shrink-0 ml-1.5 opacity-80 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all">
            Tra cứu →
          </span>
        </div>
      </div>

      <MathFormulaModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        latex={latex}
        name={name}
        description={description}
        units={units}
        conditions={conditions}
      />
    </>
  );
};

export const MathFormula: React.FC<MathFormulaProps> = ({
  latex,
  displayMode = false,
  name,
  description,
  units,
  conditions,
  className = '',
  asCard = false,
}) => {
  const [showModal, setShowModal] = useState(false);

  if (asCard) {
    return (
      <MathFormulaCard
        latex={latex}
        name={name}
        description={description}
        units={units}
        conditions={conditions}
        className={className}
      />
    );
  }

  let html = '';
  try {
    html = katex.renderToString(latex, {
      displayMode,
      throwOnError: false,
    });
  } catch (err) {
    html = latex;
  }

  const isInteractive = Boolean(name || description || units || conditions);

  return (
    <>
      <span
        className={`inline-flex items-center gap-1.5 ${
          isInteractive
            ? 'group cursor-pointer rounded px-1.5 py-0.5 transition-colors hover:bg-[#00D4FF]/15 hover:text-[#00D4FF]'
            : ''
        } ${className}`}
        onClick={() => isInteractive && setShowModal(true)}
        title={isInteractive ? 'Nhấn để xem giải nghĩa đại lượng và điều kiện áp dụng' : undefined}
      >
        <span dangerouslySetInnerHTML={{ __html: html }} />
        {isInteractive && (
          <Info className="inline-block h-3.5 w-3.5 text-[#00D4FF] opacity-0 transition-opacity group-hover:opacity-100" />
        )}
      </span>

      <MathFormulaModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        latex={latex}
        name={name}
        description={description}
        units={units}
        conditions={conditions}
      />
    </>
  );
};

