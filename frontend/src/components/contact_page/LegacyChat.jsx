import React, { useEffect, useRef } from "react";
import { initLegacyChat } from "./legacyChatLogic";
import "./legacyChat.css";

export default function LegacyChat({ messages = [], onUserMessage, onBotMessage }) {
  const widgetRef = useRef(null);
  const apiRef = useRef(null);

  useEffect(() => {
    if (!widgetRef.current) return undefined;
    const api = initLegacyChat(widgetRef.current, {
      alwaysOpen: true,
      onUserMessage,
      onBotMessage,
      persistHistory: true,
    });
    apiRef.current = api;
    return () => api.destroy();
  }, [onUserMessage, onBotMessage]);

  useEffect(() => {
    apiRef.current?.setMessages(messages);
  }, [messages]);

  return (
    <div className="chat-widget inline" id="chatWidget" ref={widgetRef}>
      <button className="chat-toggle" id="chatToggle" aria-expanded="false" aria-controls="chatPanel">
        💬
      </button>

      <div className="chat-panel" id="chatPanel" aria-hidden="false">
        <div className="chat-panel-inner">
          <header className="chat-header">
            <div>
              <div className="chat-title">ECHO 2.0</div>
              <div className="chat-subtitle">Virtual assistant</div>
            </div>
            <div className="chat-header-actions">
              <button className="chat-clear" type="button" id="chatClear">
                Clear
              </button>
              <button className="chat-close" type="button" id="chatClose">
                ×
              </button>
            </div>
          </header>

          <div className="chat-body" id="chatBody">
            <div className="chat-messages" id="chatMessages" role="log" aria-live="polite" />
          </div>

          <form className="chat-form" id="chatForm" autoComplete="off">
            <input
              type="text"
              className="chat-input"
              id="chatInput"
              placeholder="Type a message..."
              aria-label="Message input"
            />
            <button type="submit" className="chat-send">
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
