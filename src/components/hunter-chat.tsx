"use client";

import { useState, useRef, useEffect } from "react";
import { askHunter } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import type { HunterMessage } from "@/lib/types";
import { DEMO_SCENARIOS } from "@/data/demo-scenarios";
import {
  Send,
  Bot,
  User,
  Gauge,
  ShieldAlert,
  Beaker,
  Layers,
  type LucideIcon,
} from "lucide-react";

const SCENARIO_ICONS: Record<string, LucideIcon> = {
  "speed-anomaly": Gauge,
  "safety-override": ShieldAlert,
  "champlain-hudson": Beaker,
  "vineyard-wind-quality": Layers,
};

// =============================================================
// HunterChat: Surface 3
// =============================================================
// The Claude-powered AI assistant operators talk to.
//
// Phase 1 (this file, scaffold): full UI with working send.
// Edge Function must be deployed for responses to work.
//
// Phase 3 (Wednesday): polish, streaming responses,
// markdown rendering for citations.
// =============================================================

export function HunterChat() {
  const [messages, setMessages] = useState<HunterMessage[]>([
    {
      role: "assistant",
      content:
        "I'm Hunter. I can see live machine state, the recent log feed, and the maintenance knowledge base. Click a scenario below or type a question about any line.",
    },
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sending]);

  async function handleSend(question: string) {
    if (!question.trim() || sending) return;

    const userMsg: HunterMessage = { role: "user", content: question };
    const history = messages.filter((m) => m.role !== "assistant" || m.content.length < 1000);

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setSending(true);

    try {
      const res = await askHunter(
        question,
        history.map((m) => ({ role: m.role, content: m.content })),
      );

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: res.answer,
          citations: res.citations,
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Hunter is unavailable right now. Please try again in a moment or escalate to your shift lead.",
        },
      ]);
      console.error(err);
    } finally {
      setSending(false);
    }
  }

  return (
    <section className="bg-panel border border-border rounded-lg flex flex-col overflow-hidden h-full">
      {/* Header */}
      <header className="border-b border-border px-4 py-3 flex items-center gap-2">
        <Bot className="w-4 h-4 text-primary-light" />
        <h2 className="text-sm font-semibold">Ask Hunter</h2>
        <span className="text-xs text-muted ml-auto">
          Grounded in live data + KB
        </span>
      </header>

      {/* Demo scenarios */}
      <div className="border-b border-border px-4 py-3">
        <p className="text-xs text-muted mb-2 uppercase tracking-wider">
          Demo scenarios
        </p>
        <div className="flex flex-col gap-1.5">
          {DEMO_SCENARIOS.map((s) => {
            const Icon = SCENARIO_ICONS[s.id] ?? Bot;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => handleSend(s.question)}
                disabled={sending}
                className="group text-left text-xs px-3 py-2 rounded bg-panel-elevated border border-border hover:border-primary-light/60 hover:bg-primary/10 transition-colors disabled:opacity-50 flex items-start gap-2.5"
              >
                <Icon className="w-3.5 h-3.5 mt-0.5 text-primary-light/80 group-hover:text-primary-light shrink-0" />
                <span className="flex-1 min-w-0">
                  <span className="text-foreground font-medium block">{s.label}</span>
                  <span className="text-muted text-[11px] leading-snug block mt-0.5">
                    {s.description}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto scrollbar-thin px-4 py-3 space-y-3">
        {messages.map((msg, i) => (
          <Message key={i} msg={msg} />
        ))}
        {sending && <TypingIndicator />}
        <div ref={endRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend(input);
        }}
        className="border-t border-border px-4 py-3 flex gap-2"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={sending}
          placeholder="Ask about a machine, anomaly, or procedure..."
          className="flex-1 bg-panel-elevated border border-border rounded px-3 py-2 text-sm focus:outline-none focus:border-primary-light disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={sending || !input.trim()}
          className="bg-primary hover:bg-primary-light text-primary-foreground px-3 py-2 rounded text-sm transition-colors disabled:opacity-50 flex items-center gap-1.5"
        >
          <Send className="w-3.5 h-3.5" />
          Send
        </button>
      </form>
    </section>
  );
}

function Message({ msg }: { msg: HunterMessage }) {
  const isUser = msg.role === "user";
  return (
    <div className={cn("flex gap-2", isUser && "flex-row-reverse")}>
      <div
        className={cn(
          "w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5",
          isUser ? "bg-primary" : "bg-panel-elevated border border-border",
        )}
      >
        {isUser ? (
          <User className="w-3.5 h-3.5" />
        ) : (
          <Bot className="w-3.5 h-3.5 text-primary-light" />
        )}
      </div>
      <div
        className={cn(
          "rounded-lg px-3 py-2 text-sm max-w-[85%] whitespace-pre-wrap leading-relaxed",
          isUser
            ? "bg-primary/15 border border-primary/30"
            : "bg-panel-elevated border border-border",
        )}
      >
        {isUser ? msg.content : <AssistantBody text={msg.content} />}
        {msg.citations && msg.citations.length > 0 && (
          <div className="mt-2 pt-2 border-t border-border/50 flex flex-wrap gap-1.5">
            {msg.citations.map((c) => (
              <span
                key={c.doc_id}
                className="text-xs px-1.5 py-0.5 rounded bg-primary/20 text-primary-light font-mono"
                title={c.title}
              >
                {c.doc_id}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Renders Hunter's text with inline KB-XXX mentions styled as pills.
function AssistantBody({ text }: { text: string }) {
  const parts = text.split(/(KB-\d+)/g);
  return (
    <>
      {parts.map((part, i) =>
        /^KB-\d+$/.test(part) ? (
          <span
            key={i}
            className="inline-block px-1.5 py-0.5 mx-0.5 rounded bg-primary/20 text-primary-light font-mono text-[10px] font-semibold align-[1px]"
          >
            {part}
          </span>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  );
}

function TypingIndicator() {
  return (
    <div className="flex items-center gap-2 text-muted text-sm">
      <div className="w-6 h-6 rounded-full bg-panel-elevated border border-border flex items-center justify-center shrink-0">
        <Bot className="w-3.5 h-3.5 text-primary-light" />
      </div>
      <div className="bg-panel-elevated border border-border rounded-lg px-3 py-2.5 flex items-center gap-1">
        <span className="w-1.5 h-1.5 rounded-full bg-primary-light animate-bounce [animation-delay:-0.3s]" />
        <span className="w-1.5 h-1.5 rounded-full bg-primary-light animate-bounce [animation-delay:-0.15s]" />
        <span className="w-1.5 h-1.5 rounded-full bg-primary-light animate-bounce" />
      </div>
    </div>
  );
}
