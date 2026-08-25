import React, { useState, useEffect, useRef } from 'react';
import { useVoiceInteraction } from '../../hooks/useVoiceInteraction';
import { askPhysicsAssistant, ChatMessage } from '../../services/physicsAssistantService';
import katex from 'katex';
import {
  Mic,
  Volume2,
  VolumeX,
  Send,
  Trash2,
  Cpu,
  AlertCircle,
  MessageSquare,
  Globe2,
  Atom,
} from 'lucide-react';

interface VoicePhysicsTutorProps {
  currentLessonTitle?: string;
  currentChapterTitle?: string;
  currentSimulationName?: string;
  currentExercisePrompt?: string;
}

// Markdown & LaTeX renderer helper
const renderMarkdownWithMath = (content: string) => {
  if (!content) return null;

  const blocks = content.split(/\n\n+/);

  return (
    <div className="space-y-3 text-slate-100 text-sm leading-relaxed font-sans">
      {blocks.map((block, bIdx) => {
        const trimmed = block.trim();
        if (!trimmed) return null;

        // 1. Math Block ($$...$$)
        if (trimmed.startsWith('$$') && trimmed.endsWith('$$')) {
          const latex = trimmed.slice(2, -2).trim();
          try {
            const html = katex.renderToString(latex, { displayMode: true, throwOnError: false });
            return (
              <div
                key={bIdx}
                className="my-3 py-2 px-4 rounded-xl bg-slate-950/80 border border-sky-500/30 text-center overflow-x-auto"
                dangerouslySetInnerHTML={{ __html: html }}
              />
            );
          } catch {
            return (
              <div key={bIdx} className="font-mono text-xs text-amber-300">
                {latex}
              </div>
            );
          }
        }

        // 2. Heading
        if (trimmed.startsWith('### ')) {
          return (
            <h4 key={bIdx} className="text-base font-bold text-sky-300 flex items-center gap-2 pt-1">
              {renderInline(trimmed.replace(/^###\s+/, ''))}
            </h4>
          );
        }
        if (trimmed.startsWith('## ')) {
          return (
            <h3 key={bIdx} className="text-lg font-bold text-sky-400 border-b border-slate-700/60 pb-1 pt-1">
              {renderInline(trimmed.replace(/^##\s+/, ''))}
            </h3>
          );
        }

        // 3. Blockquote
        if (trimmed.startsWith('> ')) {
          return (
            <blockquote
              key={bIdx}
              className="p-3 my-2 rounded-xl bg-sky-950/40 border-l-4 border-sky-400 text-slate-200 italic"
            >
              {renderInline(trimmed.replace(/^>\s+/, ''))}
            </blockquote>
          );
        }

        // 4. Bullet lists
        const lines = trimmed.split('\n');
        if (lines.every((l) => l.trim().startsWith('- ') || l.trim().startsWith('* ') || /^\d+\.\s/.test(l.trim()))) {
          return (
            <ul key={bIdx} className="space-y-1.5 pl-2">
              {lines.map((line, lIdx) => {
                const cleanLine = line.replace(/^[-*]\s+|\d+\.\s+/, '').trim();
                return (
                  <li key={lIdx} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-400 mt-2 shrink-0" />
                    <span>{renderInline(cleanLine)}</span>
                  </li>
                );
              })}
            </ul>
          );
        }

        // 5. Normal text
        return <p key={bIdx}>{renderInline(trimmed)}</p>;
      })}
    </div>
  );
};

// Render inline LaTeX ($...$) and bold (**...**)
const renderInline = (text: string): React.ReactNode => {
  const parts = text.split(/(\$[^$]+\$|\*\*[^*]+\*\*)/g);

  return parts.map((part, idx) => {
    if (part.startsWith('$') && part.endsWith('$')) {
      const latex = part.slice(1, -1);
      try {
        const html = katex.renderToString(latex, { displayMode: false, throwOnError: false });
        return (
          <span
            key={idx}
            className="inline-block px-1 py-0.5 font-serif text-sky-300 font-semibold"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        );
      } catch {
        return <span key={idx} className="font-mono text-sky-300">{latex}</span>;
      }
    }

    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={idx} className="font-bold text-white">
          {part.slice(2, -2)}
        </strong>
      );
    }

    return part;
  });
};

export const VoicePhysicsTutor: React.FC<VoicePhysicsTutorProps> = () => {
  // Start with a clean empty chat or single concise prompt
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputVal, setInputVal] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const {
    isListening,
    transcript,
    interimTranscript,
    speechError,
    toggleListening,
    stopListening,
    isSpeaking,
    speakingMessageId,
    autoSpeak,
    setAutoSpeak,
    speakMessage,
    stopCurrentSpeech,
  } = useVoiceInteraction({
    autoSpeakAI: true,
  });

  useEffect(() => {
    if (transcript) {
      setInputVal(transcript);
    }
  }, [transcript]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isProcessing, isListening]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputVal).trim();
    if (!query || isProcessing) return;

    if (isListening) {
      stopListening();
    }

    const userMsgId = `user-${Date.now()}`;
    const newMessages: ChatMessage[] = [
      ...messages,
      {
        id: userMsgId,
        sender: 'user',
        text: query,
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      },
    ];

    setMessages(newMessages);
    setInputVal('');
    setIsProcessing(true);

    try {
      const response = await askPhysicsAssistant(query, newMessages);

      const aiMsgId = `ai-${Date.now()}`;
      const aiMessage: ChatMessage = {
        id: aiMsgId,
        sender: 'ai',
        text: response.text,
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        source: response.source,
      };

      setMessages((prev) => [...prev, aiMessage]);

      if (autoSpeak) {
        speakMessage(aiMsgId, response.text);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClearHistory = () => {
    stopCurrentSpeech();
    setMessages([]);
    setInputVal('');
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 animate-fadeIn">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-sky-500/20 bg-gradient-to-r from-slate-900 via-sky-950/40 to-slate-900 p-5 sm:p-6 shadow-2xl backdrop-blur-xl">
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-sky-500/10 blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-400/30 text-sky-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <Globe2 className="w-3.5 h-3.5 text-sky-400" />
              Chuyên gia Vật lí Toàn cầu (Phổ thông & Đại học)
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight flex items-center gap-3">
              <Atom className="w-8 h-8 text-sky-400 animate-spin-slow" />
              <span>CHUYÊN GIA VẬT LÍ AI</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 font-mono font-medium">
                Sẵn sàng
              </span>
            </h1>
            <p className="text-slate-300 text-sm mt-1 max-w-2xl">
              Phản hồi trực diện, tự nhiên, giải quyết mọi bài toán, định luật, hiện tượng từ cơ học, điện từ, nhiệt học đến vật lí lượng tử & thuyết tương đối.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start md:self-auto">
            {/* Auto Read Toggle */}
            <button
              onClick={() => setAutoSpeak(!autoSpeak)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                autoSpeak
                  ? 'bg-emerald-500/20 border-emerald-400/40 text-emerald-300'
                  : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-slate-200'
              }`}
              title="Tự động đọc câu trả lời của AI"
            >
              {autoSpeak ? <Volume2 className="w-4 h-4 text-emerald-400 animate-pulse" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
              <span>{autoSpeak ? 'Tự động đọc: BẬT' : 'Tự động đọc: TẮT'}</span>
            </button>

            {messages.length > 0 && (
              <button
                onClick={handleClearHistory}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-950/40 hover:bg-red-900/60 border border-red-500/40 text-xs text-red-300 hover:text-white transition-all cursor-pointer shadow-sm"
                title="Xóa sạch khung chat"
              >
                <Trash2 className="w-3.5 h-3.5 text-red-400" />
                <span>Xoá sạch hội thoại</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Grid: Interactive Center Stage (Left) & Chat Stream (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Voice Interaction Visualizer & Quick Prompts */}
        <div className="lg:col-span-5 flex flex-col space-y-4">
          <div className="relative flex flex-col items-center justify-center p-8 rounded-2xl border border-slate-800 bg-slate-900/90 backdrop-blur-xl shadow-2xl overflow-hidden min-h-[380px]">
            <div
              className={`absolute inset-0 transition-opacity duration-700 pointer-events-none ${
                isSpeaking
                  ? 'bg-emerald-500/10'
                  : isListening
                  ? 'bg-sky-500/15'
                  : isProcessing
                  ? 'bg-amber-500/10'
                  : 'bg-transparent'
              }`}
            />

            <div className="relative z-10 flex flex-col items-center text-center space-y-5 w-full">
              <div className="relative flex items-center justify-center">
                <div
                  className={`absolute w-40 h-40 rounded-full transition-all duration-300 ${
                    isSpeaking
                      ? 'bg-emerald-500/20 animate-ping'
                      : isListening
                      ? 'bg-sky-500/25 animate-pulse'
                      : 'bg-transparent'
                  }`}
                />
                <div
                  className={`absolute w-32 h-32 rounded-full border transition-all duration-500 ${
                    isSpeaking
                      ? 'border-emerald-400/40 animate-spin-slow'
                      : isListening
                      ? 'border-sky-400/50 scale-110'
                      : 'border-slate-700'
                  }`}
                />

                <button
                  id="voice-tutor-mic-toggle-btn"
                  onClick={toggleListening}
                  className={`relative z-20 w-24 h-24 rounded-full flex flex-col items-center justify-center transition-all duration-300 shadow-2xl active:scale-95 cursor-pointer ${
                    isSpeaking
                      ? 'bg-gradient-to-br from-emerald-500 to-teal-700 text-white shadow-[0_0_35px_rgba(16,185,129,0.5)]'
                      : isListening
                      ? 'bg-gradient-to-br from-sky-500 to-blue-700 text-white shadow-[0_0_35px_rgba(14,165,233,0.6)] scale-105'
                      : isProcessing
                      ? 'bg-gradient-to-br from-amber-500 to-orange-700 text-white shadow-[0_0_25px_rgba(245,158,11,0.4)]'
                      : 'bg-gradient-to-br from-sky-600 to-indigo-700 hover:from-sky-500 hover:to-indigo-600 text-white shadow-[0_0_25px_rgba(59,130,246,0.3)]'
                  }`}
                  title={isListening ? 'Nhấn để dừng thu âm' : 'Nhấn để nói câu hỏi'}
                >
                  {isSpeaking ? (
                    <Volume2 className="w-10 h-10 animate-pulse" />
                  ) : isListening ? (
                    <Mic className="w-10 h-10 animate-bounce" />
                  ) : isProcessing ? (
                    <Cpu className="w-10 h-10 animate-spin text-amber-300" />
                  ) : (
                    <Mic className="w-10 h-10" />
                  )}
                </button>
              </div>

              {/* Status Text */}
              <div className="space-y-1.5 max-w-sm">
                {isListening ? (
                  <>
                    <h3 className="text-lg font-black text-sky-300 flex items-center justify-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                      ĐANG LẮNG NGHE...
                    </h3>
                    <div className="flex items-end justify-center gap-1.5 h-7 pt-1 font-mono text-sky-400 text-sm tracking-widest animate-pulse">
                      ▂▅▇▅▂▃▆▇▃▅▂
                    </div>
                    <p className="text-slate-300 text-xs font-medium">Hãy nói câu hỏi hoặc thắc mắc của bạn qua micro...</p>
                    {interimTranscript && (
                      <p className="text-sky-300 text-xs italic bg-sky-950/60 p-2 rounded-lg border border-sky-500/30 mt-2">
                        "{interimTranscript}"
                      </p>
                    )}
                  </>
                ) : isProcessing ? (
                  <>
                    <h3 className="text-lg font-black text-amber-400 flex items-center justify-center gap-2">
                      <Cpu className="w-4 h-4 animate-spin" />
                      ĐANG PHÂN TÍCH...
                    </h3>
                    <div className="flex items-center justify-center gap-1.5 py-1">
                      <span className="w-2 h-2 rounded-full bg-amber-400 animate-bounce delay-100" />
                      <span className="w-2 h-2 rounded-full bg-amber-400 animate-bounce delay-200" />
                      <span className="w-2 h-2 rounded-full bg-amber-400 animate-bounce delay-300" />
                    </div>
                    <p className="text-slate-400 text-xs">Chuyên gia đang giải đáp chi tiết câu hỏi...</p>
                  </>
                ) : isSpeaking ? (
                  <>
                    <h3 className="text-lg font-black text-emerald-400 flex items-center justify-center gap-2">
                      <Volume2 className="w-4 h-4 animate-pulse" />
                      ĐANG ĐỌC BÀI...
                    </h3>
                    <div className="w-36 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent mx-auto my-1" />
                    <p className="text-emerald-300 text-xs font-medium">Giọng đọc Tiếng Việt đang phát...</p>
                    <button
                      onClick={stopCurrentSpeech}
                      className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-300 text-[11px] font-bold transition-all cursor-pointer"
                    >
                      <VolumeX className="w-3.5 h-3.5" />
                      Dừng đọc
                    </button>
                  </>
                ) : (
                  <>
                    <h3 className="text-lg font-black text-white tracking-wide">TRỢ LÍ VẬT LÍ</h3>
                    <p className="text-slate-400 text-sm font-medium">"Bạn cần giải đáp bài toán hay hiện tượng nào?"</p>
                    <div className="pt-2">
                      <button
                        onClick={toggleListening}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-sky-500/25 transition-all active:scale-95 cursor-pointer"
                      >
                        <Mic className="w-4 h-4" />
                        <span>🎙️ BẮT ĐẦU NÓI</span>
                      </button>
                    </div>
                  </>
                )}
              </div>

              {speechError && (
                <div className="w-full p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-red-200 text-xs flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                    <span>{speechError}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Chat Conversation Stream & Text/Voice Input */}
        <div className="lg:col-span-7 flex flex-col space-y-4">
          <div className="flex-1 min-h-[500px] max-h-[640px] flex flex-col rounded-2xl border border-slate-800 bg-slate-900/90 backdrop-blur-xl shadow-2xl overflow-hidden">
            {/* Top Bar */}
            <div className="px-5 py-3.5 border-b border-slate-800 bg-slate-950/70 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-sky-400" />
                <span className="text-xs font-bold text-slate-200 tracking-wide uppercase">
                  Khung hội thoại & Giải đáp trực diện
                </span>
              </div>
              <span className="text-[11px] text-slate-500 font-mono">
                {messages.length === 0 ? 'Chưa có tin nhắn' : `${messages.length} tin nhắn`}
              </span>
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4 font-sans">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400 space-y-3">
                  <Atom className="w-12 h-12 text-sky-500/40 animate-spin-slow" />
                  <div className="space-y-1">
                    <p className="text-slate-200 font-semibold text-sm">Khung hội thoại đang trống</p>
                    <p className="text-slate-500 text-xs max-w-sm">
                      Bạn có thể gõ câu hỏi, bài tập hoặc bấm nút Micro để bắt đầu thảo luận với Chuyên gia Vật lí.
                    </p>
                  </div>
                </div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${
                      msg.sender === 'user' ? 'items-end' : 'items-start'
                    } animate-fadeIn`}
                  >
                    {/* Sender Header */}
                    <div className="flex items-center gap-2 mb-1 px-1">
                      <span className="text-[11px] font-bold text-slate-400">
                        {msg.sender === 'user' ? '👤 BẠN' : '⚛️ CHUYÊN GIA VẬT LÍ'}
                      </span>
                      <span className="text-[10px] text-slate-600 font-mono">{msg.timestamp}</span>
                    </div>

                    {/* Message Bubble */}
                    <div
                      className={`max-w-[92%] p-4 rounded-2xl text-sm leading-relaxed shadow-lg ${
                        msg.sender === 'user'
                          ? 'bg-gradient-to-r from-sky-600 to-blue-600 text-white rounded-br-none shadow-sky-600/20'
                          : 'bg-slate-800/95 text-slate-100 rounded-bl-none border border-slate-700/80'
                      }`}
                    >
                      {renderMarkdownWithMath(msg.text)}

                      {/* AI Message Action Footer: Speak Aloud */}
                      {msg.sender === 'ai' && (
                        <div className="mt-3 pt-2.5 border-t border-slate-700/50 flex items-center justify-between text-xs">
                          <button
                            onClick={() => speakMessage(msg.id, msg.text)}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                              isSpeaking && speakingMessageId === msg.id
                                ? 'bg-emerald-500/20 border border-emerald-400/40 text-emerald-300'
                                : 'bg-slate-700/60 hover:bg-slate-700 text-slate-300 hover:text-white'
                            }`}
                          >
                            {isSpeaking && speakingMessageId === msg.id ? (
                              <>
                                <VolumeX className="w-3.5 h-3.5 text-emerald-400" />
                                <span>Dừng đọc</span>
                              </>
                            ) : (
                              <>
                                <Volume2 className="w-3.5 h-3.5 text-sky-400" />
                                <span>🔊 Đọc to</span>
                              </>
                            )}
                          </button>

                          <span className="text-[10px] text-slate-500 italic">
                            {isSpeaking && speakingMessageId === msg.id ? 'Đang phát âm thanh...' : 'Nhấn để nghe giọng đọc'}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}

              {/* Processing loader */}
              {isProcessing && (
                <div className="flex items-center gap-2 p-3 rounded-2xl bg-slate-800/70 border border-slate-700/60 text-slate-300 text-xs w-fit animate-pulse">
                  <Cpu className="w-4 h-4 text-amber-400 animate-spin" />
                  <span>Chuyên gia đang phân tích và giải đáp...</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <div className="p-3 border-t border-slate-800 bg-slate-950/80">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center gap-2"
              >
                <button
                  type="button"
                  onClick={toggleListening}
                  className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                    isListening
                      ? 'bg-red-500/20 border-red-500 text-red-400 animate-pulse'
                      : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-sky-300 hover:border-sky-500'
                  }`}
                  title={isListening ? 'Dừng thu âm' : 'Nói câu hỏi qua Micro'}
                >
                  <Mic className="w-4 h-4" />
                </button>

                <input
                  type="text"
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  placeholder={
                    isListening
                      ? 'Đang lắng nghe giọng nói của bạn...'
                      : 'Nhập câu hỏi, bài tập hoặc bấm Micro để nói...'
                  }
                  className="flex-1 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-xs sm:text-sm focus:outline-none focus:border-sky-400 placeholder:text-slate-500"
                />

                <button
                  type="submit"
                  disabled={!inputVal.trim() || isProcessing}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 disabled:opacity-40 text-white font-bold text-xs sm:text-sm transition-all cursor-pointer shadow-lg shadow-sky-600/20"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Gửi</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
