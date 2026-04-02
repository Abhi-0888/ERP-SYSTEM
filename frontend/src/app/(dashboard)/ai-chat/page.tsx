"use client";

import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import api from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Send, Sparkles, Bot, User, Trash2 } from "lucide-react";

interface Message {
    role: "user" | "assistant" | "system";
    content: string;
}

export default function AiChatPage() {
    const { user, activeRole } = useAuth();
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Initial greeting
    useEffect(() => {
        if (messages.length === 0 && user) {
            setMessages([
                {
                    role: "assistant",
                    content: `Hello ${user.name}! I am EduCore AI. I can help you navigate the ERP system, understand your data, or answer questions about your role as ${activeRole}. How can I assist you today?`
                }
            ]);
        }
    }, [user, activeRole, messages.length]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, loading]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMsg = input.trim();
        setInput("");
        
        const newMessages: Message[] = [...messages, { role: "user", content: userMsg }];
        setMessages(newMessages);
        setLoading(true);

        try {
            // Only send the last 10 messages to save tokens and context limit
            const contextMessages = newMessages.slice(-10);
            
            const response = await api.post('/ai/chat', {
                messages: contextMessages
            });

            setMessages([...newMessages, { role: "assistant", content: response.data.reply || response.data }]);
        } catch (error) {
            console.error("AI Chat Error:", error);
            setMessages([
                ...newMessages,
                { role: "assistant", content: "Sorry, I am having trouble connecting to the intelligence core right now. Please try again later." }
            ]);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const clearChat = () => {
        setMessages([
            {
                role: "assistant",
                content: `Chat history cleared. How else can I help you today?`
            }
        ]);
    };

    return (
        <div className="h-[calc(100vh-8rem)] flex flex-col animate-in fade-in duration-700">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight font-outfit flex items-center gap-3">
                        <Sparkles className="h-8 w-8 text-blue-600" />
                        EduCore AI
                    </h1>
                    <p className="text-slate-500 font-medium mt-1">Your intelligent institutional assistant.</p>
                </div>
                <Button 
                    variant="outline" 
                    onClick={clearChat}
                    className="rounded-2xl border-slate-200 text-slate-500 hover:text-red-600 hover:bg-red-50"
                >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear Chat
                </Button>
            </div>

            <Card className="flex-1 flex flex-col border-0 shadow-xl rounded-[2.5rem] overflow-hidden border border-slate-100/50 bg-white relative">
                <div className="absolute inset-0 bg-gradient-to-b from-blue-50/50 block pointer-events-none" />
                
                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 relative z-10 scroll-smooth">
                    {messages.map((msg, idx) => (
                        <div key={idx} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                            {/* Avatar */}
                            <div className={`h-10 w-10 shrink-0 rounded-2xl flex items-center justify-center shadow-sm ${
                                msg.role === 'user' 
                                    ? 'bg-blue-600 text-white' 
                                    : 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white'
                            }`}>
                                {msg.role === 'user' ? <User className="h-5 w-5" /> : <Bot className="h-5 w-5" />}
                            </div>

                            {/* Message Bubble */}
                            <div className={`max-w-[80%] md:max-w-[70%] rounded-3xl p-5 ${
                                msg.role === 'user' 
                                    ? 'bg-slate-100 text-slate-800 rounded-tr-sm' 
                                    : 'bg-white border border-slate-100 shadow-sm text-slate-700 rounded-tl-sm'
                            }`}>
                                <div className="prose prose-sm prose-slate max-w-none">
                                    {msg.content.split('\n').map((line, i) => (
                                        <p key={i} className="mb-2 last:mb-0 leading-relaxed font-medium">
                                            {line}
                                        </p>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}

                    {loading && (
                        <div className="flex gap-4 flex-row">
                            <div className="h-10 w-10 shrink-0 rounded-2xl flex items-center justify-center shadow-sm bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
                                <Bot className="h-5 w-5" />
                            </div>
                            <div className="bg-white border border-slate-100 shadow-sm rounded-3xl rounded-tl-sm p-5 flex items-center gap-2">
                                <span className="flex gap-1">
                                    <span className="h-2 w-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                    <span className="h-2 w-2 bg-purple-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                    <span className="h-2 w-2 bg-pink-400 rounded-full animate-bounce"></span>
                                </span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 bg-white border-t border-slate-100 relative z-10">
                    <div className="flex gap-3 max-w-5xl mx-auto">
                        <Input 
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Ask me anything about the ERP system..."
                            className="flex-1 rounded-full bg-slate-50 border-transparent focus-visible:ring-blue-500 focus-visible:bg-white h-14 px-6 shadow-inner text-base font-medium"
                            disabled={loading}
                        />
                        <Button 
                            onClick={handleSend}
                            disabled={loading || !input.trim()}
                            className="h-14 w-14 rounded-full bg-blue-600 hover:bg-blue-700 shadow-blue-200 shadow-lg text-white"
                        >
                            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5 ml-1" />}
                        </Button>
                    </div>
                    <div className="text-center mt-3">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                            EduCore AI can make mistakes. Verify important institutional information.
                        </p>
                    </div>
                </div>
            </Card>
        </div>
    );
}
