import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Sparkles } from "lucide-react";
import { runRealitoKernel, type KernelOutput } from "@/lib/kernel";

interface Message {
  id: string;
  role: "user" | "realito";
  content: string;
  kernel?: KernelOutput;
}

const INTENT_LABELS: Record<string, string> = {
  gastronomia: "🍽️ Gastronomía",
  historia: "⛏️ Historia",
  aventura: "🏔️ Aventura",
  hospedaje: "🏨 Hospedaje",
  cultura: "🎭 Cultura",
};

export function RealitoOrb() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "realito",
      content: "¡Hola! Soy **Realito**, tu guía cognitivo de Real del Monte. ¿Qué quieres explorar hoy? Puedes preguntarme sobre comida, historia, aventura, hospedaje o cultura.",
    },
  ]);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg: Message = { id: Date.now().toString(), role: "user", content: input };
    setMessages((prev) => [...prev, userMsg]);

    const kernel = runRealitoKernel(input);
    const realitoMsg: Message = {
      id: (Date.now() + 1).toString(),
      role: "realito",
      content: kernel.narrative,
      kernel,
    };

    setTimeout(() => {
      setMessages((prev) => [...prev, realitoMsg]);
    }, 300);

    setInput("");
  };

  return (
    <>
      {/* Orb Button */}
      <AnimatePresence>
        {!open && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            onClick={() => setOpen(true)}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-14 h-14 rounded-full bg-accent flex items-center justify-center orb-pulse hover:scale-105 transition-transform"
          >
            <Sparkles className="w-6 h-6 text-accent-foreground" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[380px] max-w-[calc(100vw-2rem)] h-[520px] rounded-2xl bg-card border border-border shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-accent-foreground" />
                </div>
                <div>
                  <p className="text-sm font-semibold font-display">Realito Kernel</p>
                  <p className="text-[10px] text-muted-foreground">Cognitive Engine v4.1</p>
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[85%] rounded-xl px-3 py-2 text-sm ${
                      msg.role === "user"
                        ? "bg-accent text-accent-foreground"
                        : "bg-muted text-foreground"
                    }`}
                  >
                    <p>{msg.content}</p>
                    {msg.kernel && (
                      <div className="mt-2 space-y-2">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span className="px-1.5 py-0.5 rounded bg-accent/20 text-accent font-medium">
                            {INTENT_LABELS[msg.kernel.intent]}
                          </span>
                          <span>conf: {(msg.kernel.confidence * 100).toFixed(0)}%</span>
                        </div>
                        {msg.kernel.recommendations.map((rec) => (
                          <div key={rec.id} className="p-2 rounded-lg bg-background border border-border">
                            <p className="text-xs font-medium">{rec.name}</p>
                            <p className="text-[10px] text-muted-foreground mt-0.5">{rec.description}</p>
                            <div className="flex items-center gap-1 mt-1">
                              <span className="text-[10px] text-accent">★ {rec.rating}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Input */}
            <div className="p-3 border-t border-border">
              <div className="flex items-center gap-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  placeholder="¿Qué quieres explorar?"
                  className="flex-1 bg-muted rounded-lg px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus:ring-1 focus:ring-accent"
                />
                <button
                  onClick={handleSend}
                  className="w-9 h-9 rounded-lg bg-accent flex items-center justify-center hover:bg-accent/90 transition-colors"
                >
                  <Send className="w-4 h-4 text-accent-foreground" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
