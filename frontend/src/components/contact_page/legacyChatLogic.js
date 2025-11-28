import { marked } from "marked";
import DOMPurify from "dompurify";
import { auth } from "../../firebase";

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

const buildAuthorizedHeaders = async () => {
  const headers = { "Content-Type": "application/json" };
  try {
    const user = auth.currentUser;
    if (user) {
      const token = await user.getIdToken();
      headers.Authorization = `Bearer ${token}`;
    }
  } catch (error) {
    console.warn("Could not attach auth token", error);
  }
  return headers;
};

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
  onClear: undefined,
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
  let sessionId = getSessionId();
  persistSessionId(sessionId);
  widget.dataset.sessionId = sessionId;

  const scrollToBottom = () => {
    body.scrollTop = body.scrollHeight;
  };

  // Admin-mode UI: create and manage admin query panel
  const chatAdminBtn = widget.querySelector("#chatAdmin");
  let adminPanelEl = null;

  const exitAdminMode = () => {
    if (!adminPanelEl) return;
    adminPanelEl.remove();
    adminPanelEl = null;
    messagesContainer.style.display = "";
    form.style.display = "flex";
    input.focus();
  };

  const getCurrentUserProfile = () => {
    const user = auth.currentUser;
    if (!user) return null;
    return {
      name: user.displayName || user.email || "",
      email: user.email || "",
    };
  };

  const enterAdminMode = () => {
    if (adminPanelEl) return;
    messagesContainer.style.display = "none";
    form.style.display = "none";

    adminPanelEl = document.createElement("div");
    adminPanelEl.className = "chat-admin-panel";
    const userProfile = getCurrentUserProfile();
    const emailField = userProfile?.email
      ? `<input id="adminEmail" class="admin-title" type="email" value="${userProfile.email}" readonly />`
      : `<input id="adminEmail" class="admin-title" type="email" placeholder="Enter your email" />`;
    const nameField = userProfile?.name
      ? `<input id="adminName" class="admin-title" type="text" value="${userProfile.name}" />`
      : `<input id="adminName" class="admin-title" type="text" placeholder="Your name" />`;

    adminPanelEl.innerHTML = `
      <div class="admin-panel-inner">
        <label class="admin-label">Your Email</label>
        ${emailField}
        <label class="admin-label">Your Name</label>
        ${nameField}
        <label class="admin-label">Subject</label>
        <input id="adminTitle" class="admin-title" type="text" placeholder="Short subject" />
        <label class="admin-label">Message</label>
        <textarea id="adminMessage" class="admin-message" rows="6" placeholder="Write your message to admin..."></textarea>
        <div class="admin-actions">
          <button id="adminSend" class="admin-send">Send to Admin</button>
          <button id="adminCancel" class="admin-cancel">Cancel</button>
        </div>
      </div>
    `;

    body.appendChild(adminPanelEl);

    const sendBtn = adminPanelEl.querySelector("#adminSend");
    const cancelBtn = adminPanelEl.querySelector("#adminCancel");

    cancelBtn?.addEventListener("click", (e) => {
      e.preventDefault();
      exitAdminMode();
    });

    sendBtn?.addEventListener("click", async (e) => {
      e.preventDefault();
      const titleEl = adminPanelEl.querySelector("#adminTitle");
      const emailEl = adminPanelEl.querySelector("#adminEmail");
      const nameEl = adminPanelEl.querySelector("#adminName");
      const messageEl = adminPanelEl.querySelector("#adminMessage");
      const title = (titleEl.value || "User query").toString().trim();
      const message = (messageEl.value || "").toString().trim();
      const contactEmail = (emailEl.value || "").toString().trim();
      const contactName = (nameEl.value || "").toString().trim();
      if (!message) {
        alert("Please enter a message for admin.");
        return;
      }
      if (!contactEmail) {
        alert("Please provide your email so the admin can reach you.");
        return;
      }

      sendBtn.disabled = true;
      sendBtn.textContent = "Sending...";

      try {
        const headers = await buildAuthorizedHeaders();
        const response = await fetch(`${API_BASE_URL}/api/notifications/to-admin`, {
          method: "POST",
          headers,
          body: JSON.stringify({ title, message, contactEmail, contactName }),
        });

        if (!response.ok) {
          const payload = await response.json().catch(() => null);
          const errMessage =
            payload?.message || payload?.error || `Server returned ${response.status}`;
          throw new Error(errMessage);
        }

        appendSystem("Your message was sent to admin");
      } catch (err) {
        console.error("Failed to send to admin", err);
        appendSystem(err.message || "Could not send message to admin. Please try again later.");
      } finally {
        sendBtn.disabled = false;
        sendBtn.textContent = "Send to Admin";
        exitAdminMode();
      }
    });
  };

  const handleAdminButton = (e) => {
    e.preventDefault();
    enterAdminMode();
  };

  chatAdminBtn?.addEventListener("click", handleAdminButton);

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
    exitAdminMode();
    messagesContainer.innerHTML = "";
    if (settings.persistHistory) {
      try {
        window.localStorage.removeItem(STORAGE_KEY);
      } catch (error) {
        console.warn("Could not clear chat history", error);
      }
    }
    const previousSessionId = sessionId;
    await clearChatHistoryRemote(previousSessionId);
    sessionId = generateSessionId();
    persistSessionId(sessionId);
    widget.dataset.sessionId = sessionId;
    settings.onClear?.();
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
    const targetSessionId = sessionId;
    const records = await fetchChatHistory(targetSessionId);
    if (sessionId !== targetSessionId) {
      return;
    }
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
      const items = Array.isArray(newMessages) ? newMessages : [];
      renderMessages(items, { skipSave: !settings.persistHistory });
      if (items.length === 0) {
        ensureWelcomeMessage({ skipSave: true });
      }
    },
    destroy() {
      if (destroyed) return;
      destroyed = true;
      if (!settings.alwaysOpen && toggle) toggle.removeEventListener("click", handleToggle);
      closeBtn?.removeEventListener("click", handleClose);
      clearBtn?.removeEventListener("click", handleClear);
      chatAdminBtn?.removeEventListener("click", handleAdminButton);
      form.removeEventListener("submit", handleSubmit);
      exitAdminMode();
    },
  };

  return api;
}
