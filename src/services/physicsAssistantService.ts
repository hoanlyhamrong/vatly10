export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  source?: 'gemini' | 'fallback';
  role?: 'user' | 'ai';
  content?: string;
}

export interface AssistantResponse {
  text: string;
  reply?: string;
  source: 'gemini' | 'fallback';
}

export const AI_SYSTEM_INSTRUCTION = `Bạn là một Trợ lý AI Chuyên gia Đa lĩnh vực (Multi-Domain AI Expert) thông minh, uyên bác, linh hoạt và toàn diện. 

NGUYÊN TẮC PHẢN HỒI BẮT BUỘC:
1. HIỂU ĐÚNG CHUYÊN NGÀNH:
   - Phải xác định chính xác lĩnh vực câu hỏi của người dùng (Toán học, Vật lí, Hóa học, Sinh học, Lập trình, Lịch sử, Ngữ văn, Đời sống, v.v.) để trả lời đúng trọng tâm.
   - TUYỆT ĐỐI KHÔNG tự ý ép buộc mọi câu hỏi về Vật lí. 
   - Ví dụ: Nếu người dùng hỏi "x + 1 = ?", đây là câu hỏi Toán học/Đại số, hãy trả lời theo Toán học (chưa thể xác định giá trị cụ thể nếu chưa biết x).

2. PHONG CÁCH TRÌNH BÀY:
   - Trả lời trực diện, thông minh, sắc sảo, không vòng vo, không dùng văn mẫu cứng nhắc.
   - Sử dụng 100% Tiếng Việt chuẩn mực, rõ ràng, đúng Unicode.
   - Định dạng Markdown đẹp mắt, rõ ràng. Sử dụng chuẩn LaTeX ($...$ cho dòng, $$...$$ cho khối) khi cần viết công thức Toán học hoặc Khoa học.
   - Đọc kỹ lịch sử hội thoại để hiểu đúng ngữ cảnh các câu hỏi tiếp theo.`;

export function normalizeVietnameseText(text: string): string {
  if (typeof text !== 'string') return '';
  return text.normalize('NFC').replace(/[\uFEFF]/g, '').trim();
}

function buildHistory(history: ChatMessage[]) {
  return history
    .filter((m) => m && (m.text || m.content))
    .slice(-10)
    .map((m) => ({
      role: (m.sender === 'user' || m.role === 'user') ? 'user' : 'model',
      content: normalizeVietnameseText(m.text || m.content || ''),
    }));
}

export async function askPhysicsAssistant(
  message: string,
  history: ChatMessage[] = []
): Promise<{ text: string; source: 'gemini' | 'fallback' }> {
  const userMessage = normalizeVietnameseText(message);

  if (!userMessage) {
    return {
      text: 'Bạn hãy nhập câu hỏi để tôi hỗ trợ nhé.',
      source: 'fallback',
    };
  }

  try {
    const payload = {
      message: userMessage,
      history: buildHistory(history),
    };

    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      const data = await response.json();
      const reply = typeof data.reply === 'string' ? normalizeVietnameseText(data.reply) : '';
      if (reply) {
        return { text: reply, source: data.source || 'gemini' };
      }
    }
  } catch (error) {
    console.error('[AI Assistant] API call failed:', error);
  }

  // Fallback response without rigid templates
  return {
    text: `Tôi đã nhận được câu hỏi: "${userMessage}". Hiện tại kết nối mạng đang gián đoạn, bạn vui lòng gửi lại yêu cầu nhé!`,
    source: 'fallback',
  };
}

export async function askAssistant(
  message: string,
  history: ChatMessage[] = []
): Promise<AssistantResponse> {
  const result = await askPhysicsAssistant(message, history);
  return {
    text: result.text,
    reply: result.text,
    source: result.source,
  };
}

export async function sendChatMessage(
  message: string,
  history: Array<{ role: string; content: string }> = []
): Promise<AssistantResponse> {
  const mappedHistory: ChatMessage[] = history.map((h, i) => ({
    id: `msg-${i}`,
    sender: h.role === 'user' ? 'user' : 'ai',
    text: h.content,
    timestamp: '',
  }));
  return askAssistant(message, mappedHistory);
}
