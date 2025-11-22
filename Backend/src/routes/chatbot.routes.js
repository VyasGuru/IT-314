import { Router } from "express";
import { echoChatHandler, getChatHistory, clearChatHistory } from "../controllers/chatbot.controller.js";

const router = Router();

router.post("/chat", echoChatHandler);
router.get("/chat/history/:sessionId", getChatHistory);
router.delete("/chat/history/:sessionId", clearChatHistory);

export default router;
