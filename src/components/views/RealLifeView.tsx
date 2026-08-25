import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Compass, Lightbulb } from 'lucide-react';
import { REAL_LIFE_PHYSICS_ITEMS } from '../../data/realLifePhysicsData';

export const RealLifeView: React.FC = () => {
  const [openChallengeId, setOpenChallengeId] = useState<string | null>(null);

  const toggleChallenge = (id: string) => {
    setOpenChallengeId(openChallengeId === id ? null : id);
  };

  return (
    <div id="real-life-physics-view" className="space-y-6">
      {/* Banner */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl backdrop-blur-md">
        <div className="flex items-center gap-2">
          <span className="rounded-md bg-cyan-500/10 px-2.5 py-1 text-xs font-semibold text-cyan-400">
            VẬT LÍ QUANH TA
          </span>
          <h2 className="text-2xl font-bold text-slate-100">Physics in Real Life & Technology</h2>
        </div>
        <p className="mt-2 text-sm text-slate-400 max-w-3xl">
          Khám phá cách các định luật Vật lí 10 vận hành trong công nghệ hiện đại, giao thông, thể thao và vũ trụ. Từ dây an toàn ô tô đến tên lửa phản lực trong chân không.
        </p>
      </div>

      {/* Real Life Cards Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {REAL_LIFE_PHYSICS_ITEMS.map((item) => {
          const isChallengeOpen = openChallengeId === item.id;

          return (
            <div
              key={item.id}
              id={`real-card-${item.id}`}
              className="flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl transition hover:border-cyan-500/40"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-2 border-b border-slate-800 pb-3">
                  <div>
                    <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider">
                      {item.category}
                    </span>
                    <h3 className="text-lg font-bold text-slate-100 mt-0.5">{item.title}</h3>
                  </div>
                  <span className="rounded-md bg-slate-800 px-2 py-0.5 text-[10px] font-mono text-slate-300">
                    {item.tag}
                  </span>
                </div>

                {/* Phenomenon */}
                <div>
                  <div className="text-xs sm:text-sm font-bold text-slate-400 uppercase tracking-wider">Hiện tượng quan sát thực tế:</div>
                  <p className="mt-1.5 text-base sm:text-lg text-slate-100 leading-relaxed italic bg-slate-950/60 p-4 sm:p-5 rounded-2xl border border-slate-800/80">
                    "{item.phenomenon}"
                  </p>
                </div>

                {/* Physics Explanation */}
                <div>
                  <div className="text-xs sm:text-sm font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
                    <Compass className="h-4 w-4" />
                    <span>Bản chất Vật lí:</span>
                  </div>
                  <p className="mt-1.5 text-base sm:text-lg text-slate-100 leading-relaxed">
                    {item.physicsExplanation}
                  </p>
                </div>

                {/* Related Curriculum */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-xl bg-slate-950/80 p-3.5 sm:p-4 text-sm sm:text-base text-slate-300 border border-slate-800/60">
                  <div>
                    <strong className="text-[#00D4FF]">Kiến thức SGK:</strong> {item.relatedKnowledge}
                  </div>
                </div>
              </div>

              {/* Challenge Toggle */}
              <div className="mt-5 border-t border-slate-800/80 pt-4">
                <button
                  onClick={() => toggleChallenge(item.id)}
                  className="flex w-full items-center justify-between rounded-xl bg-slate-950 p-4 text-left text-sm sm:text-base font-semibold text-amber-300 transition hover:bg-slate-800 cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <Lightbulb className="h-5 w-5 text-amber-400 shrink-0" />
                    <span>Thử thách tư duy: {item.challengeQuestion}</span>
                  </div>
                  {isChallengeOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                </button>

                {isChallengeOpen && (
                  <div className="mt-3 rounded-xl border border-amber-500/20 bg-amber-950/20 p-4 text-sm sm:text-base text-amber-200">
                    <strong className="block text-amber-300 font-bold mb-1">Giải đáp chuyên sâu:</strong>
                    {item.challengeAnswer}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
