import { marked } from "marked";
import DOMPurify from "dompurify";

const STORAGE_KEY = "popup_chat_history_v1";
const SESSION_ID_KEY = "popup_chat_session_id_v1";

const resolveBackendUrl = () => {
  try {
    if (typeof import.meta !== "undefined" && import.meta?.env?.VITE_BACKEND_URL) {
      return import.meta.env.VITE_BACKEND_URL;
    }
  } catch (error) {
    console.warn("Could not read VITE_BACKEND_URL", error);
  }

  if (typeof window !== "undefined" && window?.__BACKEND_URL) {
    return window.__BACKEND_URL;
  }

  return "http://localhost:8000";
};

const API_BASE_URL = resolveBackendUrl();

const generateSessionId = () => {
  const cryptoObj = typeof globalThis !== "undefined" ? globalThis.crypto : undefined;
  if (cryptoObj?.randomUUID) return cryptoObj.randomUUID();
  return `session-${Date.now()}-${Math.random().toString(16).slice(2, 10)}`;
};

let cachedSessionId = null;

const persistSessionId = (sessionId) => {
  if (!sessionId) return;
  cachedSessionId = sessionId;
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(SESSION_ID_KEY, sessionId);
  } catch (error) {
    console.warn("Could not persist chat session id", error);
  }
};

const getSessionId = () => {
  if (cachedSessionId) return cachedSessionId;
  if (typeof window === "undefined") {
    cachedSessionId = generateSessionId();
    return cachedSessionId;
  }
  try {
    const stored = window.localStorage.getItem(SESSION_ID_KEY);
    if (stored) {
      cachedSessionId = stored;
      return stored;
    }
  } catch (error) {
    console.warn("Could not read chat session id", error);
  }
  const fresh = generateSessionId();
  persistSessionId(fresh);
  return fresh;
};

const fetchChatHistory = async (sessionId) => {
  if (!sessionId) return [];
  try {
    const res = await fetch(`${API_BASE_URL}/api/chat/history/${encodeURIComponent(sessionId)}`);
    if (!res.ok) {
      if (res.status !== 404) {
        console.warn("Could not fetch chat history", res.status);
      }
      return [];
    }
    const payload = await res.json();
    if (Array.isArray(payload)) return payload;
    if (payload?.data && Array.isArray(payload.data)) {
      return payload.data;
    }
    return [];
  } catch (error) {
    console.warn("Failed to load chat history", error);
    return [];
  }
};

const clearChatHistoryRemote = async (sessionId) => {
  if (!sessionId) return false;
  try {
    const res = await fetch(`${API_BASE_URL}/api/chat/history/${encodeURIComponent(sessionId)}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      console.warn("Could not clear server chat history", res.status);
      return false;
    }
    return true;
  } catch (error) {
    console.warn("Failed to clear chat history", error);
    return false;
  }
};

const renderMarkdownToSafeHtml = (markdownText = "") => {
  return DOMPurify.sanitize(marked.parse(markdownText || ""));
};

const botReply = async (userText) => {
  const sessionId = getSessionId();
  try {
    const res = await fetch(`${API_BASE_URL}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: userText, sessionId }),
    });

    const contentType = res.headers.get("content-type") || "";
    if (!res.ok) {
      if (contentType.includes("application/json")) {
        const err = await res.json();
        console.error("Server error", res.status, err);
        return {
          reply: err.error || err.details || `! Server returned ${res.status}`,
          sessionId,
          historyId: null,
        };
      }
      console.error("Server returned non-OK status", res.status);
      return {
        reply: `! Server returned ${res.status}`,
        sessionId,
        historyId: null,
      };
    }

    const data = contentType.includes("application/json") ? await res.json() : null;
    if (!data) {
      return { reply: "! No response received from server.", sessionId, historyId: null };
    }

    const payload = {
      reply: data.reply || data.error || "! No response received from server.",
      sessionId: data.sessionId || sessionId,
      historyId: data.historyId ?? null,
    };

    if (payload.sessionId && payload.sessionId !== sessionId) {
      persistSessionId(payload.sessionId);
    }

    return payload;
  } catch (error) {
    console.error("Groq API error:", error);
    return {
      reply: "! Could not connect to Groq server.",
      sessionId,
      historyId: null,
    };
  }
};

const defaultOptions = {
  alwaysOpen: false,
  onUserMessage: undefined,
  onBotMessage: undefined,
  persistHistory: true,
  welcomeMessage: "Hello! What can I do for you today?",
};

export function initLegacyChat(root, options = {}) {
  if (typeof window === "undefined" || !root) {
    return {
      setMessages() {},
      destroy() {},
    };
  }

  const settings = { ...defaultOptions, ...options };

  const widget = root;
  const toggle = root.querySelector("#chatToggle");
  const panel = root.querySelector("#chatPanel");
  const closeBtn = root.querySelector("#chatClose");
  const form = root.querySelector("#chatForm");
  const input = root.querySelector("#chatInput");
  const messagesContainer = root.querySelector("#chatMessages");
  const body = root.querySelector("#chatBody");
  const clearBtn = root.querySelector("#chatClear");

  if (!panel || !form || !input || !messagesContainer || !body) {
    console.warn("Legacy chat widget missing required elements");
    return {
      setMessages() {},
      destroy() {},
    };
  }

  let destroyed = false;
  const sessionId = getSessionId();
  persistSessionId(sessionId);
  widget.dataset.sessionId = sessionId;

  const scrollToBottom = () => {
    body.scrollTop = body.scrollHeight;
  };

  const appendMessageNode = (text, who, { skipSave = false } = {}) => {
    const el = document.createElement("div");
    el.className = `msg ${who === "user" ? "user" : "bot"}`;
    el.classList.add("chat-bubble");
    el.dataset.raw = text;
    el.innerHTML = renderMarkdownToSafeHtml(text);
    messagesContainer.appendChild(el);
    scrollToBottom();
    if (!skipSave) saveHistory();
  };

  const appendSystem = (text) => {
    const el = document.createElement("div");
    el.className = "msg bot small chat-bubble";
    el.dataset.raw = text;
    el.innerHTML = renderMarkdownToSafeHtml(text);
    messagesContainer.appendChild(el);
    scrollToBottom();
  };

  const showTyping = () => {
    if (messagesContainer.querySelector("#typingIndicator")) return;
    const wrap = document.createElement("div");
    wrap.className = "msg bot";
    wrap.id = "typingIndicator";
    const t = document.createElement("div");
    t.className = "typing";
    t.innerHTML = "<span></span><span></span><span></span>";
    wrap.appendChild(t);
    messagesContainer.appendChild(wrap);
    scrollToBottom();
  };

  const removeTyping = () => {
    const t = messagesContainer.querySelector("#typingIndicator");
    if (t) t.remove();
  };

  const saveHistory = () => {
    if (!settings.persistHistory) return;
    const items = [];
    messagesContainer.querySelectorAll(".msg").forEach((node) => {
      if (node.id === "typingIndicator") return;
      items.push({
        who: node.classList.contains("user") ? "user" : "bot",
        text: node.dataset.raw ?? node.textContent,
      });
    });
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      console.warn("Could not persist chat history", error);
    }
  };

  const loadHistory = () => {
    if (!settings.persistHistory) return;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const arr = JSON.parse(raw);
      renderMessages(arr, { skipSave: true });
    } catch (error) {
      console.warn("Could not load chat history", error);
    }
  };

  const setOpen = (isOpen) => {
    panel.setAttribute("aria-hidden", String(!isOpen));
    if (toggle) toggle.setAttribute("aria-expanded", String(isOpen));
    if (widget) {
      widget.classList.toggle("open", isOpen);
    }
    if (isOpen) {
      const delay = settings.alwaysOpen ? 0 : 420;
      setTimeout(() => input.focus(), delay);
    }
  };

  const renderMessages = (items = [], { skipSave = false } = {}) => {
    messagesContainer.innerHTML = "";
    items.forEach((item) => appendMessageNode(item.text, item.who, { skipSave: true }));
    if (!skipSave) saveHistory();
  };

  const handleToggle = () => {
    const isOpen = panel.getAttribute("aria-hidden") === "false";
    setOpen(!isOpen);
  };

  const handleClose = () => {
    setOpen(false);
    toggle?.focus();
  };

  const ensureWelcomeMessage = ({ skipSave = false } = {}) => {
    if (!settings.welcomeMessage) return;
    const hasMessages = messagesContainer.querySelector(".msg");
    if (!hasMessages) {
      appendMessageNode(settings.welcomeMessage, "bot", { skipSave });
    }
  };

  const handleClear = async () => {
    messagesContainer.innerHTML = "";
    if (settings.persistHistory) {
      try {
        window.localStorage.removeItem(STORAGE_KEY);
      } catch (error) {
        console.warn("Could not clear chat history", error);
      }
    }
    await clearChatHistoryRemote(sessionId);
    appendSystem("Chat cleared");
    input.focus();
    ensureWelcomeMessage({ skipSave: true });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const text = input.value.trim();
    if (!text) return;

    const payload = { id: `user-${Date.now()}`, who: "user", text, time: Date.now() };
    appendMessageNode(payload.text, payload.who, { skipSave: true });
    settings.onUserMessage?.(payload);
    input.value = "";
    saveHistory();

    (async () => {
      showTyping();
      const replyResult = await botReply(text);
      removeTyping();
      const replyText = typeof replyResult === "string" ? replyResult : replyResult?.reply;
      const botPayload = {
        id: `bot-${Date.now()}`,
        who: "bot",
        text: replyText,
        time: Date.now(),
        sessionId: replyResult?.sessionId,
        historyId: replyResult?.historyId,
      };
      appendMessageNode(botPayload.text || "! No response received from server.", botPayload.who, {
        skipSave: true,
      });
      settings.onBotMessage?.(botPayload);
      saveHistory();
    })();
  };

  if (!settings.alwaysOpen && toggle) {
    toggle.addEventListener("click", handleToggle);
  } else {
    setOpen(true);
  }

  closeBtn?.addEventListener("click", handleClose);
  clearBtn?.addEventListener("click", handleClear);
  form.addEventListener("submit", handleSubmit);

  const hydrateFromServer = async () => {
    const records = await fetchChatHistory(sessionId);
    if (!records.length) {
      ensureWelcomeMessage({ skipSave: true });
      return;
    }
    const normalized = [];
    records.forEach((record) => {
      if (record.userMessage) {
        normalized.push({ who: "user", text: record.userMessage });
      }
      if (record.botReply) {
        normalized.push({ who: "bot", text: record.botReply });
      }
    });
    if (!normalized.length) {
      ensureWelcomeMessage({ skipSave: true });
      return;
    }
    renderMessages(normalized, { skipSave: true });
    saveHistory();
  };

  if (!settings.persistHistory) {
    messagesContainer.innerHTML = "";
  } else {
    loadHistory();
  }

  ensureWelcomeMessage({ skipSave: !settings.persistHistory });
  hydrateFromServer();

  const api = {
    setMessages(newMessages) {
      renderMessages(newMessages ?? [], { skipSave: !settings.persistHistory });
    },
    destroy() {
      if (destroyed) return;
      destroyed = true;
      if (!settings.alwaysOpen && toggle) toggle.removeEventListener("click", handleToggle);
      closeBtn?.removeEventListener("click", handleClose);
      clearBtn?.removeEventListener("click", handleClear);
      form.removeEventListener("submit", handleSubmit);
    },
  };

  return api;
}
