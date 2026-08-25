import { useState, useEffect, useRef, useCallback } from 'react';
import { speakVietnamese, stopSpeaking, prepareTextForSpeech, isSpeechSupported } from '../utils/speechUtils';

export interface UseVoiceInteractionOptions {
  onTranscript?: (transcript: string, isFinal: boolean) => void;
  autoSpeakAI?: boolean;
}

export function useVoiceInteraction(options?: UseVoiceInteractionOptions) {
  const [isListening, setIsListening] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>('');
  const [interimTranscript, setInterimTranscript] = useState<string>('');
  const [speechError, setSpeechError] = useState<string | null>(null);

  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const [autoSpeak, setAutoSpeak] = useState<boolean>(options?.autoSpeakAI ?? true);

  const recognitionRef = useRef<any>(null);
  const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Initialize Speech Recognition
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'vi-VN';

      recognition.onstart = () => {
        setIsListening(true);
        setSpeechError(null);
      };

      recognition.onresult = (event: any) => {
        let currentInterim = '';
        let finalChunk = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalChunk += event.results[i][0].transcript;
          } else {
            currentInterim += event.results[i][0].transcript;
          }
        }

        if (finalChunk) {
          setTranscript((prev) => {
            const updated = prev ? `${prev} ${finalChunk}` : finalChunk;
            options?.onTranscript?.(updated, true);
            return updated;
          });
          setInterimTranscript('');
        } else {
          setInterimTranscript(currentInterim);
          options?.onTranscript?.(currentInterim, false);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        if (event.error === 'not-allowed') {
          setSpeechError('Trình duyệt chưa được cấp quyền truy cập Micro. Vui lòng cho phép để nói câu hỏi.');
        } else if (event.error === 'no-speech') {
          // Normal timeout if user was silent
        } else {
          setSpeechError(`Lỗi nhận diện giọng nói: ${event.error}`);
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // ignore
        }
      }
      stopSpeaking();
    };
  }, []);

  // Voice input toggle
  const startListening = useCallback(() => {
    setSpeechError(null);
    setTranscript('');
    setInterimTranscript('');

    if (!recognitionRef.current) {
      const { stt } = isSpeechSupported();
      if (!stt) {
        setSpeechError('Trình duyệt hiện tại chưa hỗ trợ nhận diện giọng nói Web Speech. Bạn có thể sử dụng Chrome/Edge.');
      } else {
        setSpeechError('Không thể khởi tạo micro nhận diện giọng nói.');
      }
      return;
    }

    // If currently speaking, stop AI speech when student starts speaking
    stopSpeaking();
    setIsSpeaking(false);
    setSpeakingMessageId(null);

    try {
      recognitionRef.current.start();
    } catch (e: any) {
      // If already started, stop and restart
      try {
        recognitionRef.current.stop();
        setTimeout(() => recognitionRef.current?.start(), 150);
      } catch (err) {
        console.warn(err);
      }
    }
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
    }
    setIsListening(false);
  }, []);

  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  // Read message aloud
  const speakMessage = useCallback((messageId: string, text: string) => {
    // If clicking the same message that is currently playing -> stop
    if (isSpeaking && speakingMessageId === messageId) {
      stopSpeaking();
      setIsSpeaking(false);
      setSpeakingMessageId(null);
      return;
    }

    setSpeakingMessageId(messageId);
    setIsSpeaking(true);

    const utterance = speakVietnamese(text, {
      onStart: () => {
        setIsSpeaking(true);
        setSpeakingMessageId(messageId);
      },
      onEnd: () => {
        setIsSpeaking(false);
        setSpeakingMessageId(null);
      },
      onError: () => {
        setIsSpeaking(false);
        setSpeakingMessageId(null);
      },
    });

    currentUtteranceRef.current = utterance;
  }, [isSpeaking, speakingMessageId]);

  const stopCurrentSpeech = useCallback(() => {
    stopSpeaking();
    setIsSpeaking(false);
    setSpeakingMessageId(null);
  }, []);

  return {
    isListening,
    transcript,
    interimTranscript,
    speechError,
    setSpeechError,
    startListening,
    stopListening,
    toggleListening,
    isSpeaking,
    speakingMessageId,
    autoSpeak,
    setAutoSpeak,
    speakMessage,
    stopCurrentSpeech,
    isSupported: isSpeechSupported(),
  };
}
