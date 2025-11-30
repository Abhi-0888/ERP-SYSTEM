import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Bot, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface Message {
  id: number;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
}

export function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, text: "Hi! I'm EduBot. Ask me about attendance, homework, or fees.", sender: "bot", timestamp: new Date() }
  ]);
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = () => {
    if (!inputValue.trim()) return;

    const newUserMsg: Message = {
      id: Date.now(),
      text: inputValue,
      sender: "user",
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newUserMsg]);
    setInputValue("");

    // Simulate AI response
    setTimeout(() => {
      let botResponse = "I can help you with that. Please contact the administration for more details.";
      const lowerInput = newUserMsg.text.toLowerCase();
      
      if (lowerInput.includes("attendance")) {
        botResponse = "Your attendance for this month is 92%. You were absent on 3 days.";
      } else if (lowerInput.includes("fee") || lowerInput.includes("due")) {
        botResponse = "You have a pending transport fee of $450 due on April 20th.";
      } else if (lowerInput.includes("homework") || lowerInput.includes("assignment")) {
        botResponse = "You have 2 pending assignments in Mathematics due tomorrow.";
      }

      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        text: botResponse,
        sender: "bot",
        timestamp: new Date()
      }]);
    }, 1000);
  };

  return (
    <>
      {/* Floating Trigger Button */}
      <Button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-xl transition-transform duration-300 z-50 ${isOpen ? 'scale-0' : 'scale-100'}`}
      >
        <MessageCircle className="w-7 h-7" />
      </Button>

      {/* Chat Window */}
      <div className={`fixed bottom-6 right-6 z-50 transition-all duration-300 transform ${isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0 pointer-events-none'}`}>
        <Card className="w-[350px] h-[500px] flex flex-col shadow-2xl border-border">
          {/* Header */}
          <div className="p-4 bg-primary text-primary-foreground rounded-t-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <Bot className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-sm">EduBot AI</h3>
                <p className="text-xs opacity-80 flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  Online
                </p>
              </div>
            </div>
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/20" onClick={() => setIsOpen(false)}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Messages Area */}
          <ScrollArea className="flex-1 p-4 bg-secondary/10">
            <div className="space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex gap-2 max-w-[80%] ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <Avatar className="w-8 h-8 mt-1">
                      {msg.sender === 'bot' ? (
                        <AvatarFallback className="bg-primary/10 text-primary"><Bot className="w-4 h-4" /></AvatarFallback>
                      ) : (
                        <AvatarFallback className="bg-secondary text-foreground"><User className="w-4 h-4" /></AvatarFallback>
                      )}
                    </Avatar>
                    <div
                      className={`p-3 rounded-lg text-sm ${
                        msg.sender === 'user'
                          ? 'bg-primary text-primary-foreground rounded-tr-none'
                          : 'bg-secondary text-foreground rounded-tl-none'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Input Area */}
          <div className="p-4 border-t border-border bg-background rounded-b-xl">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex gap-2"
            >
              <Input
                placeholder="Type a message..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" size="icon" disabled={!inputValue.trim()}>
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </div>
        </Card>
      </div>
    </>
  );
}
