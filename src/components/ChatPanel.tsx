import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
}

interface ChatPanelProps {
  sessionId: string | null;
  onSendMessage: (message: string) => void;
  isProcessing: boolean;
}

export const ChatPanel = ({ sessionId, onSendMessage, isProcessing }: ChatPanelProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (!input.trim() || isProcessing) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newMessage]);
    onSendMessage(input);
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex h-full flex-col bg-card border-r border-border">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border p-4 glass-effect">
        <Sparkles className="h-5 w-5 text-primary" />
        <div>
          <h2 className="text-lg font-semibold">Game Dev Agent</h2>
          <p className="text-xs text-muted-foreground">Describe your game to get started</p>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-full bg-primary/10 p-6 mb-4">
                <Sparkles className="h-12 w-12 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Let's Build a Game!</h3>
              <p className="text-muted-foreground max-w-sm">
                Describe the game you want to create. I'll generate the code, assets, and handle
                debugging in an iterative loop.
              </p>
            </div>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex gap-3 animate-in fade-in-0 slide-in-from-bottom-3",
                message.role === "user" ? "justify-end" : "justify-start"
              )}
            >
              <div
                className={cn(
                  "max-w-[80%] rounded-lg p-4 glass-effect",
                  message.role === "user"
                    ? "bg-[hsl(var(--chat-bubble-user))] border border-primary/20"
                    : "bg-[hsl(var(--chat-bubble-ai))] border border-secondary/20"
                )}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                <span className="text-xs text-muted-foreground mt-2 block">
                  {message.timestamp.toLocaleTimeString()}
                </span>
              </div>
            </div>
          ))}

          {isProcessing && (
            <div className="flex gap-3 animate-pulse">
              <div className="max-w-[80%] rounded-lg p-4 glass-effect bg-[hsl(var(--chat-bubble-ai))] border border-secondary/20">
                <div className="flex gap-2">
                  <div className="h-2 w-2 rounded-full bg-secondary animate-bounce" />
                  <div className="h-2 w-2 rounded-full bg-secondary animate-bounce delay-100" />
                  <div className="h-2 w-2 rounded-full bg-secondary animate-bounce delay-200" />
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="border-t border-border p-4 glass-effect">
        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Describe your game or request changes..."
            className="min-h-[80px] resize-none bg-background/50"
            disabled={isProcessing}
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isProcessing}
            size="icon"
            className="h-[80px] w-[80px] shrink-0 game-glow"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
        {!sessionId && (
          <p className="text-xs text-muted-foreground mt-2">
            💡 Tip: Be specific! Mention game genre, mechanics, visual style, and any special
            features.
          </p>
        )}
      </div>
    </div>
  );
};