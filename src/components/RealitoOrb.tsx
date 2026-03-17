import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Sparkles } from "lucide-react";
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
      content: "¡Hola! Soy Realito, tu guía cognitivo de Real del Monte. ¿Qué quieres explorar? Pregúntame sobre comida, historia, aventura, hospedaje o cultura.",
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

    setTimeout(() => setMessages((prev) => [...prev, realitoMsg]), 300);
    setInput("");
  };

  return (
    <>
      <AnimatePresence>
        {!open && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            onClick={() => setOpen(true)}
            className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-accent flex items-center justify-center orb-pulse hover:scale-110 transition-transform shadow-2xl"
          >
            <Sparkles className="w-6 h-6 text-accent-foreground" />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ y: 100, opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 100, opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-6 right-6 z-50 w-[380px] max-w-[calc(100vw-2rem)] h-[520px] rounded-2xl glass shadow-2xl flex flex-col overflow-hidden"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-border/50">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-accent flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-accent-foreground" />
                </div>
                <div>
                  <p className="text-sm font-display font-bold">Realito</p>
                  <p className="text-[10px] text-muted-foreground font-body">Cognitive Engine v4.1</p>
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground transition-colors p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm font-body ${
                      msg.role === "user"
                        ? "bg-accent text-accent-foreground rounded-br-md"
                        : "bg-muted text-foreground rounded-bl-md"
                    }`}
                  >
                    <p>{msg.content}</p>
                    {msg.kernel && (
                      <div className="mt-3 space-y-2">
                        <div className="flex items-center gap-2 text-xs">
                          <span className="px-2 py-0.5 rounded-full bg-accent/20 text-accent font-medium">
                            {INTENT_LABELS[msg.kernel.intent]}
                          </span>
                          <span className="text-muted-foreground">
                            {(msg.kernel.confidence * 100).toFixed(0)}% conf
                          </span>
                        </div>
                        {msg.kernel.recommendations.map((rec) => (
                          <div key={rec.id} className="p-3 rounded-xl bg-background/50 border border-border/50">
                            <div className="flex justify-between items-start">
                              <p className="text-xs font-semibold">{rec.name}</p>
                              <span className="text-[10px] text-accent font-medium">★ {rec.rating}</span>
                            </div>
                            <p className="text-[10px] text-muted-foreground mt-1">{rec.description}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 border-t border-border/50">
              <div className="flex items-center gap-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  placeholder="¿Qué quieres explorar?"
                  className="flex-1 bg-muted/50 rounded-xl px-4 py-2.5 text-sm font-body outline-none placeholder:text-muted-foreground focus:ring-1 focus:ring-accent"
                />
                <button
                  onClick={handleSend}
                  className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center hover:bg-accent/90 transition-colors"
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
