import express from "express";
import {
  addPair,
  clearMessages,
  deleteMessage,
  listMessages,
  recentMessages,
  updateMessage,
  portfolioIsEmpty,
} from "./db";
import { getReply } from "./reply";
import { isLlmConfigured } from "./llm";
import { runSeed } from "./seed";

try {
  process.loadEnvFile();
} catch {
}

const app = express();

// ถ้าฐานข้อมูนยังว่างเปล่า (เช่น chat.db บน Vercel ที่เพิ่งเริ่มต้น): seed ด้วยตัวเองเพื่อให้ Chat AI มีข้อมูน portfolio และแนะนำได้ทันที
if (portfolioIsEmpty()) {
  runSeed();
}

const MAX_HISTORY = 10;

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello, World!");
});

app.get("/status", (req, res) => {
  res.json({
    aiConfigured: isLlmConfigured(),
    model: process.env.LLM_MODEL || "gemini-3.5-flash-lite",
  });
});

app.get("/messages", (req, res) => {
  res.json(listMessages());
});

app.post("/messages", async (req, res) => {
  const text = req.body?.text;
  if (typeof text !== "string" || !text.trim()) {
    res.status(400).json({ error: "text is required" });
    return;
  }
  const userText = text.trim();

  const history = recentMessages(MAX_HISTORY).map((m) => ({
    role: m.role,
    content: m.text,
  }));

  let replyText: string;
  try {
    replyText = await getReply(userText, history);
  } catch (err) {
    const e = err as { status?: number; message?: string };
    console.error("LLM error:", e.status ?? "-", e.message);
    if (e.status === 429) {
      res
        .status(429)
        .json({ error: "เรียก AI ถี่เกินโควตา รอสักครู่แล้วลองใหม่" });
    } else {
      res.status(502).json({
        error: "เรียก AI ไม่สำเร็จ ตรวจ LLM_API_KEY / LLM_MODEL ใน BE/.env",
      });
    }
    return;
  }

  const [userMessage, assistantMessage] = addPair(userText, replyText);

  res.status(201).json({ userMessage, assistantMessage });
});

app.put("/messages/:id", (req, res) => {
  const id = Number(req.params.id);
  const text = req.body?.text;
  if (typeof text !== "string" || !text.trim()) {
    res.status(400).json({ error: "text is required" });
    return;
  }

  const message = updateMessage(id, text.trim());
  if (!message) {
    res.status(404).json({ error: "message not found" });
    return;
  }

  res.json(message);
});

app.delete("/messages/:id", (req, res) => {
  const id = Number(req.params.id);
  if (!deleteMessage(id)) {
    res.status(404).json({ error: "message not found" });
    return;
  }

  res.json({ message: "deleted" });
});

app.delete("/messages", (req, res) => {
  clearMessages();
  res.json({ message: "cleared" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
