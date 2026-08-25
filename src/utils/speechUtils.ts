/**
 * Speech Utilities for Physics Socratic AI Assistant
 * - Speech-to-Text (STT) via Web Speech API (vi-VN)
 * - Text-to-Speech (TTS) via SpeechSynthesis with Physics/Markdown speech sanitizer
 */

// Clean markdown, symbols, and convert LaTeX/Physics notation to natural Vietnamese speech
export function prepareTextForSpeech(rawText: string): string {
  if (!rawText) return '';

  let text = rawText;

  // 1. Remove code blocks and inline code
  text = text.replace(/```[\s\S]*?```/g, ' ');
  text = text.replace(/`([^`]+)`/g, '$1');

  // 2. Remove markdown tables formatting cleanly
  text = text.replace(/\|[\s-:]+\|/g, '. '); // table headers separator row
  text = text.replace(/\|\s*/g, ', '); // replace table pipes with commas/pauses

  // 3. Physics & Math symbols to Vietnamese pronunciation
  text = text
    .replace(/\\vec\{([a-zA-Z0-9_]+)\}/g, 'vectơ $1')
    .replace(/\\vec\s*([a-zA-Z])/g, 'vectơ $1')
    .replace(/\\Delta\s*([a-zA-Z0-9]+)/g, 'độ biến thiên $1')
    .replace(/\\Delta/g, 'đen-ta')
    .replace(/\\alpha/g, 'an-pha')
    .replace(/\\beta/g, 'bê-ta')
    .replace(/\\theta/g, 'thê-ta')
    .replace(/\\omega/g, 'ô-mê-ga')
    .replace(/\\varphi/g, 'phi')
    .replace(/\\phi/g, 'phi')
    .replace(/\\mu/g, 'muy')
    .replace(/\\pi/g, 'pi')
    .replace(/\\lambda/g, 'lam-đa')
    .replace(/\\rho/g, 'rô')
    .replace(/\\sum/g, 'tổng')
    .replace(/\\iff/g, ' tương đương ')
    .replace(/\\implies/g, ' suy ra ')
    .replace(/\\to/g, ' đến ')
    .replace(/\\sqrt\{([^}]+)\}/g, 'căn bậc hai của $1')
    .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '$1 chia cho $2')
    .replace(/\\cdot/g, ' nhân ')
    .replace(/\\times/g, ' nhân ')
    .replace(/\\approx/g, ' xấp xỉ ')
    .replace(/\\le/g, ' nhỏ hơn hoặc bằng ')
    .replace(/\\ge/g, ' lớn hơn hoặc bằng ')
    .replace(/\\neq/g, ' khác ')
    .replace(/\\pm/g, ' cộng trừ ')
    .replace(/\\in/g, ' thuộc ')
    .replace(/\\mathbb\{Z\}/g, 'tập số nguyên')
    .replace(/\\mathcal\{P\}/g, 'công suất P')
    .replace(/\\text\{([^}]+)\}/g, '$1');

  // 4. Common physics subscripts
  text = text
    .replace(/v_0/g, 'v không')
    .replace(/x_0/g, 'x không')
    .replace(/t_0/g, 't không')
    .replace(/a_{max}|a_max/gi, 'a cực đại')
    .replace(/v_{max}|v_max/gi, 'v cực đại')
    .replace(/F_{ms}|F_ms/gi, 'lực ma sát')
    .replace(/F_{dh}|F_dh/gi, 'lực đàn hồi')
    .replace(/F_{hl}|F_hl/gi, 'hợp lực')
    .replace(/F_{ht}|F_ht/gi, 'lực hướng tâm')
    .replace(/a_{ht}|a_ht/gi, 'gia tốc hướng tâm')
    .replace(/W_d|W_đ/gi, 'động năng')
    .replace(/W_t/gi, 'thế năng')
    .replace(/v_{tb}/gi, 'vận tốc trung bình');

  // 5. Units & superscripts
  text = text
    .replace(/m\/s\^2/gi, 'mét trên giây bình phương')
    .replace(/m\/s²/gi, 'mét trên giây bình phương')
    .replace(/m\/s/gi, 'mét trên giây')
    .replace(/km\/h/gi, 'ki-lô-mét trên giờ')
    .replace(/kg\cdot m\/s/gi, 'ki-lô-gam mét trên giây')
    .replace(/rad\/s/gi, 'ra-đi-an trên giây')
    .replace(/N\/m/gi, 'Niu-tơn trên mét')
    .replace(/\^2/g, ' bình phương')
    .replace(/\^3/g, ' lập phương')
    .replace(/²/g, ' bình phương')
    .replace(/³/g, ' lập phương')
    .replace(/°C/g, ' độ C')
    .replace(/°/g, ' độ ');

  // 6. Clean formatting symbols
  text = text
    .replace(/\$+/g, '') // remove LaTeX $
    .replace(/\*\*([^*]+)\*\*/g, '$1') // bold
    .replace(/\*([^*]+)\*/g, '$1') // italic
    .replace(/__([^_]+)__/g, '$1')
    .replace(/_([^_]+)_/g, '$1')
    .replace(/#+\s*/g, '') // headers
    .replace(/^>\s*/gm, '') // blockquotes
    .replace(/[-*+]\s+/g, '') // lists
    .replace(/\d+\.\s+/g, '') // numbered lists
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // links
    .replace(/\{([^}]+)\}/g, '$1') // latex curlies
    .replace(/[\n\r]+/g, '. ') // line breaks to pauses
    .replace(/\s{2,}/g, ' ') // excessive spaces
    .trim();

  return text;
}

// Pre-warm voices
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  window.speechSynthesis.onvoiceschanged = () => {
    // Voices cache primed
    getVietnameseVoice();
  };
}

// Helper to get available Vietnamese voices
export function getVietnameseVoice(): SpeechSynthesisVoice | null {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return null;
  }

  const voices = window.speechSynthesis.getVoices();
  if (!voices || voices.length === 0) return null;

  // 1. Prefer explicit vi-VN voices
  const viVoice = voices.find((v) => {
    const lang = (v.lang || '').toLowerCase().replace('_', '-');
    return lang === 'vi-vn' || lang === 'vi' || lang.startsWith('vi-');
  });
  if (viVoice) return viVoice;

  // 2. Secondary fallback: any voice with Vietnamese / Vietnam in name
  const nameVoice = voices.find((v) => {
    const name = (v.name || '').toLowerCase();
    return (
      name.includes('vietnam') ||
      name.includes('vietnamese') ||
      name.includes('tiếng việt') ||
      name.includes('tieng viet') ||
      name.includes('hoai-my') ||
      name.includes('nam-minh') ||
      name.includes('an-') ||
      name.includes('mai-') ||
      name.includes('linh')
    );
  });
  if (nameVoice) return nameVoice;

  // 3. IMPORTANT: DO NOT fallback to voices[0] if it is English/non-Vietnamese!
  // Returning null allows the browser to synthesize using the native OS vi-VN engine
  // without being hijacked by an English speech synthesizer.
  return null;
}

// Speak text using SpeechSynthesis
export function speakVietnamese(
  text: string,
  options?: {
    onStart?: () => void;
    onEnd?: () => void;
    onError?: (err: any) => void;
    rate?: number;
    pitch?: number;
  }
): SpeechSynthesisUtterance | null {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    console.warn('SpeechSynthesis is not supported in this browser.');
    return null;
  }

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  const preparedText = prepareTextForSpeech(text);
  if (!preparedText) return null;

  const utterance = new SpeechSynthesisUtterance(preparedText);
  utterance.lang = 'vi-VN';
  utterance.rate = options?.rate ?? 0.96; // Measured rate for pedagogical clarity
  utterance.pitch = options?.pitch ?? 1.0;

  const voice = getVietnameseVoice();
  if (voice) {
    utterance.voice = voice;
  }

  if (options?.onStart) utterance.onstart = options.onStart;
  if (options?.onEnd) utterance.onend = options.onEnd;
  if (options?.onError) utterance.onerror = options.onError;

  // Chrome bug workaround: keep synthesis active for long speeches
  window.speechSynthesis.speak(utterance);

  return utterance;
}

export function stopSpeaking(): void {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

export function pauseSpeaking(): void {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.pause();
  }
}

export function resumeSpeaking(): void {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.resume();
  }
}

export function isSpeechSupported(): { stt: boolean; tts: boolean } {
  const isClient = typeof window !== 'undefined';
  const stt = isClient && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);
  const tts = isClient && 'speechSynthesis' in window;
  return { stt, tts };
}
