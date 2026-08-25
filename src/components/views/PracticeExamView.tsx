import React, { useState } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  Filter, 
  RotateCcw, 
  AlertTriangle
} from 'lucide-react';
import { PRACTICE_QUESTIONS } from '../../data/practiceQuestionsData';
import { CHAPTERS } from '../../data/curriculumData';
import { FormattedPhysicsText, InlinePhysicsText } from '../ui/FormattedPhysicsText';

export const PracticeExamView: React.FC = () => {
  const [selectedChapterId, setSelectedChapterId] = useState<number | 'ALL'>('ALL');
  const [selectedLevel, setSelectedLevel] = useState<string | 'ALL'>('ALL');
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [submittedQuestions, setSubmittedQuestions] = useState<Record<string, boolean>>({});

  const filteredQuestions = PRACTICE_QUESTIONS.filter((q) => {
    if (selectedChapterId !== 'ALL' && q.chapterId !== selectedChapterId) return false;
    if (selectedLevel !== 'ALL' && q.level !== selectedLevel) return false;
    return true;
  });

  const handleSelectOption = (questionId: string, option: string) => {
    if (submittedQuestions[questionId]) return;
    setUserAnswers((prev) => ({ ...prev, [questionId]: option }));
  };

  const handleCheckAnswer = (questionId: string) => {
    if (!userAnswers[questionId]) return;
    setSubmittedQuestions((prev) => ({ ...prev, [questionId]: true }));
  };

  const handleResetAll = () => {
    setUserAnswers({});
    setSubmittedQuestions({});
  };

  // Score calculation
  const totalAttempted = Object.keys(submittedQuestions).length;
  const correctCount = Object.keys(submittedQuestions).filter(
    (qId) => userAnswers[qId] === PRACTICE_QUESTIONS.find((q) => q.id === qId)?.correctAnswer
  ).length;

  return (
    <div id="practice-exam-view" className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-2xl border border-white/10 bg-[#0C1528]/80 p-6 shadow-xl backdrop-blur-md">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-[#00D4FF]/15 border border-[#00D4FF]/30 px-2.5 py-1 text-xs font-bold text-[#00D4FF]">
                LUYỆN TẬP & ĐÁNH GIÁ NĂNG LỰC
              </span>
              <h2 className="text-2xl font-bold text-white">Practice & Assessment Arena</h2>
            </div>
            <p className="mt-1 text-sm text-gray-400">
              Hệ thống câu hỏi trắc nghiệm đa tầng (Nhận biết → Thông hiểu → Vận dụng → Vận dụng cao) tích hợp tự động phân loại lỗi sai sư phạm và gợi ý bổ trợ.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="rounded-xl border border-white/10 bg-[#070E1C] px-4 py-2 text-right">
              <div className="text-xs text-gray-400">Kết quả hiện tại:</div>
              <div className="font-mono text-lg font-bold text-[#00FFCC]">
                {correctCount} / {totalAttempted} Đúng ({totalAttempted > 0 ? Math.round((correctCount / totalAttempted) * 100) : 0}%)
              </div>
            </div>

            <button
              onClick={handleResetAll}
              className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-[#070E1C] px-3.5 py-2.5 text-xs font-semibold text-gray-300 hover:bg-white/5 transition-colors cursor-pointer"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Làm lại từ đầu</span>
            </button>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Filter className="h-4 w-4 text-[#00D4FF]" />
            <span>Lọc theo:</span>
          </div>

          <select
            value={selectedChapterId}
            onChange={(e) => setSelectedChapterId(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))}
            className="rounded-xl border border-white/10 bg-[#070E1C] px-3 py-1.5 text-xs text-white focus:border-[#00D4FF] focus:outline-none"
          >
            <option value="ALL">Tất cả các chương</option>
            {CHAPTERS.map((ch) => (
              <option key={ch.id} value={ch.id}>Chương {ch.romanNumeral}: {ch.title}</option>
            ))}
          </select>

          <select
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
            className="rounded-xl border border-white/10 bg-[#070E1C] px-3 py-1.5 text-xs text-white focus:border-[#00D4FF] focus:outline-none"
          >
            <option value="ALL">Tất cả mức độ</option>
            <option value="NHẬN BIẾT">Nhận biết</option>
            <option value="THÔNG HIỂU">Thông hiểu</option>
            <option value="VẬN DỤNG">Vận dụng</option>
            <option value="VẬN DỤNG CAO">Vận dụng cao</option>
          </select>
        </div>
      </div>

      {/* Question Cards List */}
      <div className="space-y-6">
        {filteredQuestions.map((q, qIndex) => {
          const isSubmitted = submittedQuestions[q.id];
          const selectedAns = userAnswers[q.id];
          const isCorrect = isSubmitted && selectedAns === q.correctAnswer;

          return (
            <div
              key={q.id}
              id={`question-card-${q.id}`}
              className={`rounded-2xl border bg-[#0C1528]/80 p-6 shadow-xl transition backdrop-blur-md ${
                isSubmitted
                  ? isCorrect
                    ? 'border-[#00FFCC]/50 shadow-[0_0_20px_rgba(0,255,204,0.15)]'
                    : 'border-rose-500/40 shadow-[0_0_20px_rgba(244,63,94,0.15)]'
                  : 'border-white/10 hover:border-white/20'
              }`}
            >
              {/* Question Header & Meta Tags */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#00D4FF]/20 text-xs font-bold text-[#00D4FF] border border-[#00D4FF]/30">
                    {qIndex + 1}
                  </span>
                  <span className="text-xs font-semibold text-white">{q.topic}</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`rounded-md px-2 py-0.5 text-[11px] font-bold ${
                    q.level === 'NHẬN BIẾT' ? 'bg-[#00D4FF]/10 text-[#00D4FF] border border-[#00D4FF]/30' :
                    q.level === 'THÔNG HIỂU' ? 'bg-[#00FFCC]/10 text-[#00FFCC] border border-[#00FFCC]/30' :
                    q.level === 'VẬN DỤNG' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' :
                    'bg-purple-500/10 text-purple-400 border border-purple-500/30'
                  }`}>
                    {q.level}
                  </span>
                  <span className="text-xs text-gray-500">Chương {q.chapterId}</span>
                </div>
              </div>

              {/* Question Prompt */}
              <div className="mt-4 text-base sm:text-lg font-medium text-white leading-relaxed">
                <InlinePhysicsText text={q.prompt} />
              </div>

              {/* Options */}
              <div className="mt-4 space-y-2.5">
                {q.options?.map((opt, optIdx) => {
                  const isSelected = selectedAns === opt;
                  let optionStyles = 'border-white/5 bg-[#070E1C] text-gray-200 hover:border-[#00D4FF]/30 hover:bg-[#0C1528]';

                  if (isSelected) {
                    optionStyles = 'border-[#00D4FF] bg-[#00D4FF]/10 text-[#00D4FF] font-semibold';
                  }

                  if (isSubmitted) {
                    if (opt === q.correctAnswer) {
                      optionStyles = 'border-[#00FFCC] bg-[#00FFCC]/10 text-[#00FFCC] font-bold';
                    } else if (isSelected && !isCorrect) {
                      optionStyles = 'border-rose-500 bg-rose-950/40 text-rose-300';
                    }
                  }

                  return (
                    <div
                      key={optIdx}
                      onClick={() => handleSelectOption(q.id, opt)}
                      className={`flex cursor-pointer items-center justify-between rounded-xl border p-4 text-base sm:text-lg transition-all ${optionStyles}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full border border-white/10 bg-[#0C1528] text-xs font-mono text-gray-200 font-bold shrink-0">
                          {String.fromCharCode(65 + optIdx)}
                        </span>
                        <span>
                          <InlinePhysicsText text={opt} />
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Submit Action Bar */}
              <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCheckAnswer(q.id)}
                    disabled={!selectedAns || isSubmitted}
                    className="flex items-center gap-2 rounded-xl bg-[#00D4FF] hover:bg-[#00B8E0] px-5 py-2.5 text-sm font-bold text-black shadow-[0_0_15px_rgba(0,212,255,0.25)] transition-all disabled:opacity-40 cursor-pointer"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Kiểm tra đáp án</span>
                  </button>
                </div>

                {isSubmitted && (
                  <div className="flex items-center gap-2">
                    {isCorrect ? (
                      <span className="flex items-center gap-2 text-sm font-bold text-[#00FFCC]">
                        <CheckCircle2 className="h-4 w-4" />
                        Chính xác! (+1.0 điểm)
                      </span>
                    ) : (
                      <span className="flex items-center gap-2 text-sm font-bold text-rose-400">
                        <XCircle className="h-4 w-4" />
                        Chưa chính xác
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Explanation & Pedagogical Error Diagnosis Box */}
              {isSubmitted && (
                <div className="mt-4 space-y-3.5 rounded-2xl border border-white/10 bg-[#070E1C] p-5 text-base sm:text-lg">
                  <div>
                    <span className="font-bold text-[#00D4FF] block mb-1">Lời giải chi tiết: </span>
                    <div className="text-gray-100 leading-relaxed">
                      <FormattedPhysicsText content={q.explanation} />
                    </div>
                  </div>

                  {q.relatedKnowledge && (
                    <div className="text-gray-300 text-sm sm:text-base border-t border-white/5 pt-2">
                      <strong className="text-[#00FFCC]">Kiến thức liên quan:</strong> <InlinePhysicsText text={q.relatedKnowledge} />
                    </div>
                  )}

                  {!isCorrect && (
                    <div className="rounded-2xl border border-amber-500/30 bg-amber-950/20 p-4 text-base sm:text-lg text-amber-200 space-y-3">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2 font-bold text-amber-400">
                          <AlertTriangle className="h-5 w-5 shrink-0" />
                          <span>Chẩn đoán lỗi sai: <InlinePhysicsText text={q.commonErrorCategory} /></span>
                        </div>
                      </div>
                      <div className="text-gray-200 text-sm sm:text-base">
                        <strong className="text-amber-300">Định hướng ôn tập:</strong> <InlinePhysicsText text={q.remedialHint} />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
