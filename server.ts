import express, { Request, Response } from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

function getAIClient(): GoogleGenAI | null {
  try {
    const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
    if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey.trim() === "") {
      return null;
    }
    return new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  } catch (e) {
    return null;
  }
}

function buildSystemInstruction(): string {
  return `Bạn là một Trợ lý AI Chuyên gia Đa lĩnh vực (Multi-Domain AI Expert) thông minh, uyên bác, linh hoạt và toàn diện. 

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
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "25mb" }));
  app.use(express.urlencoded({ extended: true, limit: "25mb" }));

  // Health check
  app.get("/api/health", (_req: Request, res: Response) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Global Multi-Domain Expert Chat API
  app.post("/api/chat", async (req: Request, res: Response) => {
    const { message, prompt, text, history } = req.body;
    const userMessage = message || prompt || text;

    if (!userMessage || typeof userMessage !== "string") {
      return res.status(400).json({ error: "Thiếu nội dung câu hỏi" });
    }

    const client = getAIClient();

    if (client) {
      try {
        const systemInstruction = buildSystemInstruction();

        const contents: any[] = [];
        if (Array.isArray(history) && history.length > 0) {
          for (const item of history.slice(-6)) {
            contents.push({
              role: item.role === "user" ? "user" : "model",
              parts: [{ text: item.content }],
            });
          }
        }
        contents.push({
          role: "user",
          parts: [{ text: userMessage }],
        });

        const response = await client.models.generateContent({
          model: "gemini-3.7-flash",
          contents,
          config: {
            systemInstruction,
            temperature: 0.7,
          },
        });

        const reply = response.text?.trim();
        if (reply) {
          return res.json({ reply, source: "gemini" });
        }
      } catch (err: any) {
        console.warn("[API Chat] Gemini server call failed, trying fallback response:", err?.message || err);
      }
    }

    // Fallback phản hồi thông minh nếu mạng gặp trục trặc
    return res.json({
      reply: `Chào thầy/bạn, tôi đã nhận được câu hỏi: "${userMessage}". Hệ thống đa lĩnh vực đang sẵn sàng hỗ trợ, vui lòng thử lại câu hỏi chi tiết hơn nhé!`,
      source: "fallback",
    });
  });

  // Vite middleware in dev or static files in production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Multi-Domain Expert Server running on http://localhost:${PORT}`);
  });
}

startServer().catch(console.error);