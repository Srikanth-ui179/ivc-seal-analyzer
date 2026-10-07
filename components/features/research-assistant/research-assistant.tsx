"use client";

import { useState, useRef, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import type { AssistantContext, AssistantMessage } from "@/lib/ai/research-types";
import { Answer } from "./answer";
import { SuggestedQuestion } from "./suggested-question";

const PRESET_QUESTIONS = [
  "What is the most common sign?",
  "How often does P122 occur?",
  "Which sign most commonly follows P122?",
  "Which sign most commonly precedes P122?",
  "What is the most common recurring trigram?",
  "Are there exact duplicate sequences?",
  "What is the longest sequence?",
  "How many inscriptions are in the dataset?",
  "What sites have actual corpus data?",
  "Can we quantitatively compare Harappa and Mohenjo-daro?",
  "What does P324 mean?",
  "Can you translate an inscription?",
  "Is the final token definitely the physical end of an inscription?",
  "What are the limitations of this dataset?",
];

export function ResearchAssistant() {
  const [messages, setMessages] = useState<AssistantMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [context, setContext] = useState<AssistantContext>({});

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const initialHandled = useRef(false);
  const searchParams = useSearchParams();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  useEffect(() => {
    if (!initialHandled.current) {
      const q = searchParams.get("q");
      if (q && q.trim().length > 0) {
        initialHandled.current = true;
        handleSubmit(q.trim());
      }
    }
  }, [searchParams]);

  const handleSubmit = async (queryText?: string) => {
    const textToSend = (queryText ?? input).trim();
    if (!textToSend || isLoading) return;

    setError(null);
    setInput("");

    const userMessage: AssistantMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: textToSend,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const res = await fetch("/api/research/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: textToSend,
          context,
        }),
      });

      if (!res.ok) {
        throw new Error(`Server returned HTTP ${res.status}`);
      }

      const data = await res.json();

      const assistantMessage: AssistantMessage = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: data.answer,
        evidence: data.evidence,
        createdAt: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
      if (data.context) {
        setContext(data.context);
      }
    } catch (err: any) {
      console.error("Failed to query research assistant:", err);
      setError(
        "Failed to reach the research assistant service. Please check database connectivity or try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Messages Thread */}
      {messages.length === 0 ? (
        <section className="panel p-6 sm:p-8" aria-label="Suggested Inquiries">
          <span className="data-label">Evidence-Grounded Inquiries</span>
          <h2 className="mt-1 font-display text-xl font-bold text-ink">
            Frequently Asked Corpus Questions
          </h2>
          <p className="mt-2 text-xs leading-relaxed text-ink/70">
            Select a verified question below or type your own question regarding sign frequency, transitions, motifs, duplicate sequences, outliers, or archaeological provenance.
          </p>

          <div className="mt-5">
            <SuggestedQuestion
              questions={PRESET_QUESTIONS}
              onSelect={(q) => handleSubmit(q)}
              disabled={isLoading}
            />
          </div>
        </section>
      ) : (
        <div className="space-y-8">
          {messages.map((m) => (
            <div key={m.id} className="space-y-2">
              {m.role === "user" ? (
                <div className="flex justify-end">
                  <div className="max-w-2xl rounded border border-ink/20 bg-sandstone/30 px-4 py-3 text-sm text-ink font-semibold">
                    {m.content}
                  </div>
                </div>
              ) : (
                <div className="max-w-4xl">
                  <Answer content={m.content} evidence={m.evidence} />
                </div>
              )}
            </div>
          ))}

          {/* Suggested follow-ups if messages exist */}
          {!isLoading && messages.length > 0 && (
            <div className="pt-2">
              <span className="block font-sans text-[11px] font-bold uppercase tracking-wider text-ink/50 mb-2">
                Explore Next Questions
              </span>
              <SuggestedQuestion
                questions={
                  context.activeSign
                    ? [
                        `How often does ${context.activeSign} occur?`,
                        `Which sign most commonly follows ${context.activeSign}?`,
                        `Which inscriptions contain ${context.activeSign}?`,
                        "What is the most common recurring trigram?",
                        "What are the limitations of this dataset?",
                      ]
                    : PRESET_QUESTIONS.slice(0, 5)
                }
                onSelect={(q) => handleSubmit(q)}
                disabled={isLoading}
              />
            </div>
          )}
        </div>
      )}

      {/* Loading Indicator */}
      {isLoading && (
        <div className="flex items-center gap-3 rounded border border-ink/10 bg-sandstone/15 p-4 text-xs text-ink/70">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-clay border-t-transparent" />
          <span>Querying research database and synthesizing evidence-grounded response...</span>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div className="rounded border border-clay/30 bg-clay/10 p-4 text-xs text-clay">
          <p className="font-semibold">Inquiry Error</p>
          <p className="mt-1">{error}</p>
        </div>
      )}

      <div ref={messagesEndRef} />

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
        className="sticky bottom-4 rounded border border-ink/20 bg-paper p-3 shadow-md sm:p-4"
      >
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            placeholder="Ask about signs, transitions, motifs, duplicates, outliers, sites, or limitations..."
            className="w-full rounded border border-ink/20 bg-sandstone/10 px-4 py-2.5 text-sm text-ink placeholder:text-ink/40 focus:border-clay focus:outline-none focus:ring-1 focus:ring-clay"
          />
          <div className="flex items-center justify-end gap-2 shrink-0">
            {messages.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setMessages([]);
                  setContext({});
                  setError(null);
                }}
                disabled={isLoading}
                className="rounded border border-ink/15 px-3 py-2 text-xs font-semibold text-ink/70 hover:bg-sandstone/20 cursor-pointer"
              >
                Reset Thread
              </button>
            )}
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="rounded border border-ink bg-ink px-5 py-2 text-xs font-semibold uppercase tracking-wider text-paper transition hover:bg-moss disabled:opacity-40 cursor-pointer"
            >
              Ask
            </button>
          </div>
        </div>
        <p className="mt-2 text-[11px] text-ink/50 text-right">
          Answers grounded strictly in DATASET-CISI-MOHENJODARO-V1 · No decipherment claims
        </p>
      </form>
    </div>
  );
}
