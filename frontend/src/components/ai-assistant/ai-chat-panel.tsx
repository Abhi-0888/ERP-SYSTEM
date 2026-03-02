"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AiService, ChatMessage } from "@/lib/services/ai.service";
import {
    X,
    Send,
    Sparkles,
    Trash2,
    Bot,
    User,
    Loader2,
    RotateCcw,
} from "lucide-react";

interface AiChatPanelProps {
    isOpen: boolean;
    onClose: () => void;
}

const WELCOME: ChatMessage = {
    role: "assistant",
    content:
        "👋 Hi! I'm **EduCore AI**, your intelligent ERP assistant.\n\nI can help you with:\n- 📚 Academic modules & navigation\n- 📊 Attendance, exams & results\n- 💰 Fee management\n- 🏠 Hostel & transport\n- 📖 Library & placement\n\nWhat can I help you with today?",
};

function formatMessage(text: string) {
    // Convert **bold**, bullet points, and newlines to styled jsx
    const lines = text.split("\n");
    return lines.map((line, i) => {
        const isBullet = line.trimStart().startsWith("- ");
        const content = isBullet ? line.trimStart().slice(2) : line;

        // Replace **text** with bold spans
        const parts = content.split(/(\*\*[^*]+\*\*)/g);
        const formatted = parts.map((part, j) => {
            if (part.startsWith("**") && part.endsWith("**")) {
                return (
                    <strong key={j} className="font-semibold">
                        {part.slice(2, -2)}
                    </strong>
                );
            }
            return <span key={j}>{part}</span>;
        });

        if (isBullet) {
            return (
                <li key={i} className="flex items-start gap-1.5 ml-2">
                    <span className="mt-1 text-purple-400">•</span>
                    <span>{formatted}</span>
                </li>
            );
        }
        if (line === "") return <br key={i} />;
        return <p key={i}>{formatted}</p>;
    });
}

export function AiChatPanel({ isOpen, onClose }: AiChatPanelProps) {
    const [messages, setMessages] = useState<ChatMessage[]>([WELCOME]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const bottomRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    // Auto-scroll on new messages
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isLoading]);

    // Focus input when panel opens
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 300);
        }
    }, [isOpen]);

    const sendMessage = useCallback(async () => {
        const trimmed = input.trim();
        if (!trimmed || isLoading) return;

        const userMsg: ChatMessage = { role: "user", content: trimmed };
        const updatedMessages = [...messages, userMsg];
        setMessages(updatedMessages);
        setInput("");
        setIsLoading(true);
        setError(null);

        try {
            // Only send user/assistant turns (not the welcome) to the API
            const apiMessages = updatedMessages.slice(1); // skip welcome message
            const reply = await AiService.chat(apiMessages);
            setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
        } catch (err: any) {
            const msg =
                err?.response?.data?.message ||
                err?.message ||
                "Failed to reach the AI. Please try again.";
            setError(msg);
        } finally {
            setIsLoading(false);
        }
    }, [input, isLoading, messages]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const clearChat = () => {
        setMessages([WELCOME]);
        setError(null);
    };

    return (
        <>
            {/* Backdrop */}
            <div
                onClick={onClose}
                className={cn(
                    "fixed inset-0 z-40 bg-black/20 backdrop-blur-[1px] transition-opacity duration-300",
                    isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
                )}
            />

            {/* Panel */}
            <aside
                className={cn(
                    "fixed right-0 top-0 z-50 flex h-screen w-full max-w-md flex-col shadow-2xl transition-transform duration-300 ease-out",
                    "bg-white border-l border-slate-200",
                    isOpen ? "translate-x-0" : "translate-x-full"
                )}
            >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-100 bg-gradient-to-r from-violet-600 to-purple-700 px-4 py-4 text-white">
                    <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                            <Sparkles className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="font-bold text-sm">EduCore AI</p>
                            <p className="text-xs text-purple-200">Intelligent ERP Assistant</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-1">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={clearChat}
                            className="h-8 w-8 text-white/70 hover:text-white hover:bg-white/10 rounded-lg"
                            title="Clear chat"
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onClose}
                            className="h-8 w-8 text-white/70 hover:text-white hover:bg-white/10 rounded-lg"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
                    {messages.map((msg, idx) => (
                        <div
                            key={idx}
                            className={cn(
                                "flex items-start gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300",
                                msg.role === "user" ? "flex-row-reverse" : "flex-row"
                            )}
                        >
                            {/* Avatar */}
                            <div
                                className={cn(
                                    "flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl shadow-sm",
                                    msg.role === "user"
                                        ? "bg-gradient-to-br from-blue-500 to-indigo-600"
                                        : "bg-gradient-to-br from-violet-500 to-purple-700"
                                )}
                            >
                                {msg.role === "user" ? (
                                    <User className="h-4 w-4 text-white" />
                                ) : (
                                    <Bot className="h-4 w-4 text-white" />
                                )}
                            </div>

                            {/* Bubble */}
                            <div
                                className={cn(
                                    "max-w-[78%] rounded-2xl px-4 py-3 text-sm shadow-sm leading-relaxed",
                                    msg.role === "user"
                                        ? "bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-tr-sm"
                                        : "bg-white text-slate-700 border border-slate-100 rounded-tl-sm"
                                )}
                            >
                                {msg.role === "assistant" ? (
                                    <div className="space-y-0.5">{formatMessage(msg.content)}</div>
                                ) : (
                                    <p>{msg.content}</p>
                                )}
                            </div>
                        </div>
                    ))}

                    {/* Typing indicator */}
                    {isLoading && (
                        <div className="flex items-start gap-3 animate-in fade-in duration-300">
                            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-700 shadow-sm">
                                <Bot className="h-4 w-4 text-white" />
                            </div>
                            <div className="rounded-2xl rounded-tl-sm bg-white border border-slate-100 px-4 py-3 shadow-sm">
                                <div className="flex items-center gap-1.5">
                                    <span className="h-2 w-2 rounded-full bg-purple-400 animate-bounce [animation-delay:-0.3s]" />
                                    <span className="h-2 w-2 rounded-full bg-purple-400 animate-bounce [animation-delay:-0.15s]" />
                                    <span className="h-2 w-2 rounded-full bg-purple-400 animate-bounce" />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Error state */}
                    {error && (
                        <div className="flex items-start gap-2 rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-600 animate-in fade-in duration-300">
                            <span className="mt-0.5">⚠️</span>
                            <div className="flex-1">
                                <p className="font-medium">Something went wrong</p>
                                <p className="text-xs text-red-400 mt-0.5">{error}</p>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={sendMessage}
                                className="h-6 w-6 text-red-400 hover:text-red-600 hover:bg-red-100 rounded"
                            >
                                <RotateCcw className="h-3 w-3" />
                            </Button>
                        </div>
                    )}

                    <div ref={bottomRef} />
                </div>

                {/* Suggested prompts (show when only welcome message) */}
                {messages.length === 1 && (
                    <div className="border-t border-slate-100 bg-white px-4 py-3">
                        <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                            Try asking…
                        </p>
                        <div className="flex flex-col gap-1.5">
                            {[
                                "What modules are available in this ERP?",
                                "How do I manage student attendance?",
                                "Explain the fee management workflow",
                            ].map((prompt) => (
                                <button
                                    key={prompt}
                                    onClick={() => {
                                        setInput(prompt);
                                        inputRef.current?.focus();
                                    }}
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-left text-xs text-slate-600 transition-colors hover:bg-purple-50 hover:border-purple-200 hover:text-purple-700"
                                >
                                    {prompt}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Input area */}
                <div className="border-t border-slate-100 bg-white p-4">
                    <div className="flex items-end gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 focus-within:border-purple-400 focus-within:ring-2 focus-within:ring-purple-100 transition-all">
                        <textarea
                            ref={inputRef}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Ask anything about the ERP…"
                            rows={1}
                            disabled={isLoading}
                            className="flex-1 resize-none bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none disabled:opacity-50 max-h-32 leading-relaxed"
                            style={{ minHeight: "24px" }}
                            onInput={(e) => {
                                const el = e.currentTarget;
                                el.style.height = "auto";
                                el.style.height = Math.min(el.scrollHeight, 128) + "px";
                            }}
                        />
                        <Button
                            onClick={sendMessage}
                            disabled={!input.trim() || isLoading}
                            size="icon"
                            className={cn(
                                "h-8 w-8 flex-shrink-0 rounded-xl transition-all duration-200",
                                input.trim() && !isLoading
                                    ? "bg-gradient-to-br from-violet-600 to-purple-700 text-white shadow-md hover:shadow-lg hover:scale-105"
                                    : "bg-slate-200 text-slate-400 cursor-not-allowed"
                            )}
                        >
                            {isLoading ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Send className="h-4 w-4" />
                            )}
                        </Button>
                    </div>
                    <p className="mt-2 text-center text-[10px] text-slate-400">
                        Powered by Mistral 7B via OpenRouter · Press Enter to send
                    </p>
                </div>
            </aside>
        </>
    );
}
