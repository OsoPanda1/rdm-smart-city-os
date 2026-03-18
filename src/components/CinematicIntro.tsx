import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import heroAerial from "@/assets/hero-aerial.jpg";

interface CinematicIntroProps {
  onComplete: () => void;
}

export function CinematicIntro({ onComplete }: CinematicIntroProps) {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 900),
      setTimeout(() => setPhase(2), 2500),
      setTimeout(() => setPhase(3), 3900),
      setTimeout(() => setPhase(4), 5800),
      setTimeout(() => onComplete(), 7500),
    ];
    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  return (
    <motion.div
      exit={{ opacity: 0 }}
      transition={{ duration: 2.8 }}
      className="fixed inset-0 z-[100] bg-background flex items-center justify-center overflow-hidden"
    >
      {/* Background image with Ken Burns */}
      <motion.div
        initial={{ opacity: 0, scale: 1.2 }}
        animate={{ opacity: phase >= 2 ? 0.25 : 0, scale: 1 }}
        transition={{ duration: 3, ease: "easeOut" }}
        className="absolute inset-0"
      >
        <img src={heroAerial} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-background/60" />
      </motion.div>

      <div className="relative z-10 text-center px-8">
        {/* Line 1: Small text */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: phase >= 1 ? 1 : 0, y: phase >= 1 ? 0 : 20 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="text-sm md:text-base tracking-[0.4em] uppercase text-muted-foreground mb-6 font-body"
        >
          RDM DIGITAL BIENBENIDO A UN LUGAR CERCA DEL CIELO
        </motion.p>

        {/* Line 2: Title */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: phase >= 2 ? 1 : 0, y: phase >= 2 ? 0 : 30 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="text-5xl md:text-8xl lg:text-9xl font-display font-bold tracking-tight mb-4"
        >
          <span className="shimmer-text">Real del Monte</span>
        </motion.h1>

        {/* Line 3: Subtitle */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: phase >= 3 ? 1 : 0 }}
          transition={{ duration: 1 }}
          className="text-lg md:text-2xl text-muted-foreground font-display italic"
        >
          "Entre Neblina y Montañas se esconde un tesoro
          es un pueblito minero con corazon de oro"
        </motion.p>

        {/* Divider line */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: phase >= 3 ? 1 : 0 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="w-32 h-px bg-accent mx-auto mt-8"
        />

        {/* Version badge */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: phase >= 4 ? 1 : 0 }}
          transition={{ duration: 0.8 }}
          className="mt-6 inline-flex items-center gap-2 text-xs tracking-wider text-muted-foreground font-body"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-accent" />
          RDM DIGITAL OS v1.0 Tecnolgia TAMV Online Orgullosamente Realmontese
          <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
        </motion.div>
      </div>

      {/* Cinematic bars */}
      <div className="absolute top-0 left-0 right-0 h-16 bg-background" />
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-background" />
    </motion.div>
  );
}
