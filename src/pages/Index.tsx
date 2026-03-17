import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CinematicIntro } from "@/components/CinematicIntro";
import { HeroSection } from "@/components/HeroSection";
import { ExperienceGrid } from "@/components/ExperienceGrid";
import { HistorySection } from "@/components/HistorySection";
import { GastronomySection } from "@/components/GastronomySection";
import { AdventureSection } from "@/components/AdventureSection";
import { AccommodationSection } from "@/components/AccommodationSection";
import { CultureSection } from "@/components/CultureSection";
import { FooterSection } from "@/components/FooterSection";
import { FloatingNav } from "@/components/FloatingNav";
import { RealitoOrb } from "@/components/RealitoOrb";

const Index = () => {
  const [introComplete, setIntroComplete] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <AnimatePresence>
        {!introComplete && (
          <CinematicIntro onComplete={() => setIntroComplete(true)} />
        )}
      </AnimatePresence>

      {introComplete && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          <FloatingNav />
          <HeroSection />
          <ExperienceGrid />
          <HistorySection />
          <GastronomySection />
          <AdventureSection />
          <AccommodationSection />
          <CultureSection />
          <FooterSection />
          <RealitoOrb />
        </motion.div>
      )}
    </div>
  );
};

export default Index;
