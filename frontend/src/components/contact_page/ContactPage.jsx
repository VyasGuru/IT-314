import React, { useState, useMemo, useEffect, useRef } from "react";

// Simple in-memory chat UI for contacting admin
// Features:
// - Left column: list of conversations (past + active)
// - Right column: messages for selected conversation and input to send new messages

const initialConversations = [
  {
    id: "c1",
    title: "Report: Suspicious listing",
    updatedAt: Date.now() - 1000 * 60 * 60 * 24,
    messages: [
      { id: "m1", sender: "user", text: "I think listing #123 is a scam.", time: Date.now() - 1000 * 60 * 60 * 24 },
      { id: "m2", sender: "admin", text: "Thanks — we'll investigate and get back to you.", time: Date.now() - 1000 * 60 * 60 * 24 + 60000 },
    ],
    status: "closed",
  },
  {
    id: "c2",
    title: "Payment issue",
    updatedAt: Date.now() - 1000 * 60 * 60,
    messages: [
      { id: "m3", sender: "user", text: "Payment failed but money deducted.", time: Date.now() - 1000 * 60 * 60 },
      { id: "m4", sender: "admin", text: "Please share transaction ID.", time: Date.now() - 1000 * 60 * 60 + 30000 },
    ],
    status: "open",
  },
];

function formatTime(ts) {
  const d = new Date(ts);
  return d.toLocaleString();
}

export default function ContactPage() {
  const [conversations, setConversations] = useState(initialConversations);
  const [activeId, setActiveId] = useState(conversations[0]?.id || null);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);

  // Ensure we always have a selected conversation when conversations change
  useEffect(() => {
    if (!activeId && conversations.length) setActiveId(conversations[0].id);
  }, [conversations, activeId]);

  const activeConversation = useMemo(() => conversations.find((c) => c.id === activeId) || null, [conversations, activeId]);

  useEffect(() => {
    // scroll to bottom when messages change
    if (messagesEndRef.current) messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
  }, [activeConversation]);

  function handleSend() {
    if (!input.trim()) return;
    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeId
          ? {
              ...c,
              messages: [...c.messages, { id: `m${Date.now()}`, sender: "user", text: input.trim(), time: Date.now() }],
              updatedAt: Date.now(),
              status: "open",
            }
          : c
      )
    );
    setInput("");
  }

  function handleCreateNew() {
    const id = `c${Date.now()}`;
    const newConv = {
      id,
      title: `New query — ${new Date().toLocaleString()}`,
      updatedAt: Date.now(),
      messages: [{ id: `m${Date.now()}`, sender: "user", text: "Hello, I want to report an issue.", time: Date.now() }],
      status: "open",
    };
    setConversations((prev) => [newConv, ...prev]);
    setActiveId(id);
  }

  function handleSelect(id) {
    setActiveId(id);
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">Contact Admin — Support Chat</h1>
        <div className="flex gap-6">
          {/* Left: conversations list */}
          <aside className="w-80 border rounded p-3 bg-gray-50">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold">Conversations</h2>
              <button onClick={handleCreateNew} className="text-sm text-blue-600">New</button>
            </div>
            <ul className="space-y-2 max-h-[60vh] overflow-auto">
              {conversations.map((c) => (
                <li
                  key={c.id}
                  onClick={() => handleSelect(c.id)}
                  className={`p-2 rounded cursor-pointer hover:bg-white hover:shadow ${c.id === activeId ? "bg-white shadow" : ""}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="font-medium">{c.title}</div>
                    <div className="text-xs text-gray-500">{c.status}</div>
                  </div>
                  <div className="text-xs text-gray-500">{formatTime(c.updatedAt)}</div>
                </li>
              ))}
              {conversations.length === 0 && <li className="text-sm text-gray-500">No conversations yet.</li>}
            </ul>
          </aside>

          {/* Right: messages and input */}
          <section className="flex-1 border rounded p-3 flex flex-col bg-white">
            {activeConversation ? (
              <>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-semibold">{activeConversation.title}</h3>
                    <div className="text-xs text-gray-500">Last updated: {formatTime(activeConversation.updatedAt)}</div>
                  </div>
                  <div className="text-sm text-gray-600">Status: {activeConversation.status}</div>
                </div>

                <div className="flex-1 overflow-auto border rounded p-3 bg-gray-50 mb-3">
                  {activeConversation.messages.map((m) => (
                    <div key={m.id} className={`mb-3 max-w-[80%] ${m.sender === "user" ? "ml-auto text-right" : "mr-auto text-left"}`}>
                      <div className={`inline-block px-3 py-2 rounded ${m.sender === "user" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-800"}`}>
                        {m.text}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">{formatTime(m.time)}</div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                <div className="flex gap-2">
                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSend();
                    }}
                    placeholder="Type your message to admin..."
                    className="flex-1 border rounded px-3 py-2 focus:outline-none"
                  />
                  <button onClick={handleSend} className="bg-blue-600 text-white px-4 py-2 rounded">Send</button>
                </div>
              </>
            ) : (
              <div className="text-center text-gray-500">Select or create a conversation to start chatting.</div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
