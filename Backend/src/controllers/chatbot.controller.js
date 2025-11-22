import Groq from "groq-sdk";
import crypto from "crypto";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ChatMessage } from "../models/chatMessage.models.js";

const DEFAULT_MODEL = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";
const systemPrompt =
  process.env.GROQ_SYSTEM_PROMPT ||
  `You are Echo, a helpful chatbot for the FindMySquare website. You must always answer using clean Markdown formatting and follow these permanent rules:

1. Start longer replies with meaningful headings (H1–H4) and keep paragraphs short.
2. Insert a blank line after every heading and before/after lists so the Markdown renders cleanly.
3. Use bullet lists for unordered details, numbered lists for procedures, bold text for emphasis, and tables whenever they add clarity.
4. Wrap all code or CLI output inside triple-backtick code blocks with a language hint when possible.
5. When providing solutions, include three sections separated by headings: **Summary**, **Steps**, and **Example**.
6. When explaining errors, include three sections: **Meaning**, **Why it happens**, and **How to fix it**.
7. Never produce unformatted walls of text or ignore this structure. Keep the tone clear, direct, and concise, using emojis only when they add value.

Always tailor the content to property-search topics and user support for FindMySquare.`;

const groqClient = new Groq({ apiKey: process.env.GROQ_API_KEY });

const ensureSessionId = (sessionId) => {
  if (sessionId && typeof sessionId === "string" && sessionId.trim()) {
    return sessionId.trim();
  }
  return crypto.randomUUID();
};

export const echoChatHandler = asyncHandler(async (req, res) => {
  const { message, sessionId } = req.body || {};

  if (!process.env.GROQ_API_KEY) {
    throw new ApiError(500, "GROQ API key is not configured on the server");
  }

  if (!message || !message.trim()) {
    throw new ApiError(400, "Message text is required");
  }

  const normalizedSessionId = ensureSessionId(sessionId);

  try {
    const completion = await groqClient.chat.completions.create({
      model: DEFAULT_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message.trim() },
      ],
      temperature: Number(process.env.GROQ_TEMPERATURE ?? 0.5),
      max_tokens: Number(process.env.GROQ_MAX_TOKENS ?? 512),
    });

    const reply = completion?.choices?.[0]?.message?.content?.trim();

    if (!reply) {
      throw new ApiError(502, "Groq returned an empty response");
    }

    let historyRecord = null;
    try {
      historyRecord = await ChatMessage.create({
        sessionId: normalizedSessionId,
        userMessage: message.trim(),
        botReply: reply,
        metadata: {
          ip: req.ip,
          userAgent: req.get("user-agent"),
        },
      });
    } catch (historyError) {
      console.error("Failed to store chat history", historyError);
    }

    res.status(200).json({
      reply,
      sessionId: normalizedSessionId,
      historyId: historyRecord?._id ?? null,
    });
  } catch (error) {
    console.error("Groq chat error", error);
    throw new ApiError(502, "Unable to get response from Echo", error?.message ? [error.message] : undefined);
  }
});

export const getChatHistory = asyncHandler(async (req, res) => {
  const { sessionId } = req.params || {};

  if (!sessionId || !sessionId.trim()) {
    throw new ApiError(400, "Session ID is required");
  }

  const records = await ChatMessage.find({ sessionId: sessionId.trim() })
    .sort({ createdAt: 1 })
    .lean();

  res
    .status(200)
    .json(new ApiResponse(200, records ?? [], "Chat history fetched successfully"));
});

export const clearChatHistory = asyncHandler(async (req, res) => {
  const { sessionId } = req.params || {};

  if (!sessionId || !sessionId.trim()) {
    throw new ApiError(400, "Session ID is required");
  }

  await ChatMessage.deleteMany({ sessionId: sessionId.trim() });

  res
    .status(200)
    .json(new ApiResponse(200, null, "Chat history cleared successfully"));
});
