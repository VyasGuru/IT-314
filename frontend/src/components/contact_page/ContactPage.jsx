import React, { useCallback, useState } from "react";
import LegacyChat from "./LegacyChat";

const touchpoints = [
  { label: "Call us", value: "+91 9090 3830 20", helper: "Mon–Sat, 9am–7pm" },
  { label: "Email", value: "info@findmysquare.com", helper: "We reply within 1 business day" },
  { label: "Visit us", value: "B-249, GIFT City, Gandhinagar", helper: "By appointment only" },
];

const highlights = [
  "Dedicated support crew for listers and seekers",
  "Average first response under 10 minutes",
  "Escalation desk for pricing, moderation, and verifications",
];

export default function ContactPage() {
  const [messages, setMessages] = useState([]);

  const handleUserMessage = useCallback((entry) => {
    setMessages((prev) => [...prev, entry]);
  }, []);

  const handleBotMessage = useCallback((entry) => {
    setMessages((prev) => [...prev, entry]);
  }, []);

  const handleClear = useCallback(() => {
    setMessages([]);
  }, []);

  return (
    <div className="min-h-screen bg-[#f6f9ff] py-12">
      <div className="max-w-6xl mx-auto px-4 space-y-10">
        <header className="text-center space-y-3">
          <p className="text-xs font-semibold tracking-[0.35em] text-blue-600 uppercase">Support</p>
          <h1 className="text-4xl font-bold text-slate-900">
            Let&apos;s Make Property Search Easy Together
          </h1>
          <p className="text-base text-slate-600 max-w-3xl mx-auto">
            Reach out to the FindMySquare team or chat with ECHO 2.0—your always-on assistant for every property
            question.
          </p>
        </header>

        <div className="grid gap-8 lg:grid-cols-2">
          <section className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 space-y-8">
            <div className="space-y-3">
              <p className="text-sm font-semibold text-blue-600">Talk to a real person</p>
              <h2 className="text-2xl font-semibold text-slate-900">We’re here when you need us</h2>
              <p className="text-slate-600">
                Tell us about the property you’re listing or the home you’re hunting. Our specialists respond quickly and
                keep you posted until everything is resolved.
              </p>
            </div>

            <div className="space-y-5">
              {touchpoints.map((item) => (
                <div key={item.label} className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-semibold">
                    {item.label.slice(0, 1)}
                  </div>
                  <div>
                    <p className="text-sm uppercase tracking-wide text-slate-500">{item.label}</p>
                    <p className="text-lg font-semibold text-slate-900">{item.value}</p>
                    <p className="text-sm text-slate-500">{item.helper}</p>
                  </div>
                </div>
              ))}
            </div>

            <ul className="space-y-2">
              {highlights.map((text) => (
                <li key={text} className="flex items-start gap-2 text-slate-600">
                  <span className="mt-1 h-2 w-2 rounded-full bg-blue-500" aria-hidden="true" />
                  {text}
                </li>
              ))}
            </ul>
          </section>

          <section className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div>
                <p className="text-lg font-semibold text-slate-900">ECHO 2.0 Assistant</p>
                <p className="text-sm text-slate-500">Always-on help for your questions.</p>
              </div>
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-50 px-3 py-1 rounded-full">
                <span className="h-2 w-2 rounded-full bg-green-500" aria-hidden="true" />
                Online
              </span>
            </div>
            <div className="p-6">
              <LegacyChat
                messages={messages}
                onUserMessage={handleUserMessage}
                onBotMessage={handleBotMessage}
                onClear={handleClear}
              />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
