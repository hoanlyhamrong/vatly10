import React from 'react';
import { Volume2, VolumeX, Mic, Square } from 'lucide-react';

interface VoiceWaveIndicatorProps {
  isSpeaking?: boolean;
  isListening?: boolean;
  onStop?: () => void;
  text?: string;
  className?: string;
}

export const VoiceWaveIndicator: React.FC<VoiceWaveIndicatorProps> = ({
  isSpeaking = false,
  isListening = false,
  onStop,
  text,
  className = '',
}) => {
  if (!isSpeaking && !isListening) return null;

  return (
    <div
      className={`flex items-center gap-2.5 rounded-xl border px-3 py-1.5 backdrop-blur-md transition-all shadow-md ${
        isListening
          ? 'border-rose-500/40 bg-rose-950/40 text-rose-300 shadow-[0_0_15px_rgba(244,63,94,0.2)]'
          : 'border-[#00D4FF]/40 bg-[#07162C]/90 text-[#00D4FF] shadow-[0_0_15px_rgba(0,212,255,0.2)]'
      } ${className}`}
    >
      <div className="flex items-center gap-1">
        {isListening ? (
          <div className="relative flex h-3 w-3 items-center justify-center">
            <span className="absolute h-full w-full animate-ping rounded-full bg-rose-500 opacity-75"></span>
            <span className="h-2 w-2 rounded-full bg-rose-500"></span>
          </div>
        ) : (
          <Volume2 className="h-4 w-4 animate-pulse text-[#00D4FF]" />
        )}

        {/* Dynamic Voice Waves */}
        <div className="flex items-center gap-0.5 ml-1">
          <span
            className={`w-0.5 rounded-full ${isListening ? 'bg-rose-400' : 'bg-[#00D4FF]'} animate-[pulse_0.6s_ease-in-out_infinite]`}
            style={{ height: '10px' }}
          ></span>
          <span
            className={`w-0.5 rounded-full ${isListening ? 'bg-rose-400' : 'bg-[#00D4FF]'} animate-[pulse_0.4s_ease-in-out_infinite_0.1s]`}
            style={{ height: '16px' }}
          ></span>
          <span
            className={`w-0.5 rounded-full ${isListening ? 'bg-rose-400' : 'bg-[#00D4FF]'} animate-[pulse_0.8s_ease-in-out_infinite_0.2s]`}
            style={{ height: '12px' }}
          ></span>
          <span
            className={`w-0.5 rounded-full ${isListening ? 'bg-rose-400' : 'bg-[#00D4FF]'} animate-[pulse_0.5s_ease-in-out_infinite_0.3s]`}
            style={{ height: '18px' }}
          ></span>
          <span
            className={`w-0.5 rounded-full ${isListening ? 'bg-rose-400' : 'bg-[#00D4FF]'} animate-[pulse_0.7s_ease-in-out_infinite_0.15s]`}
            style={{ height: '8px' }}
          ></span>
        </div>
      </div>

      <span className="text-xs font-semibold truncate max-w-[200px] sm:max-w-xs">
        {text || (isListening ? 'Đang lắng nghe giọng nói...' : 'Đang đọc lời giảng...')}
      </span>

      {onStop && (
        <button
          onClick={onStop}
          className="ml-auto flex h-5 w-5 items-center justify-center rounded bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
          title="Dừng phát âm thanh / ghi âm"
        >
          <Square className="h-2.5 w-2.5 fill-white" />
        </button>
      )}
    </div>
  );
};
