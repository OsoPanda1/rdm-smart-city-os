import { motion, useInView, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import mineEntrance from "@/assets/mine-entrance.jpg";
import panteonIngles from "@/assets/panteon-ingles.jpg";
import miningEquipment from "@/assets/mining-equipment.jpg";
import mineTunnel from "@/assets/mine-tunnel.jpg";

const TIMELINE = [
  { year: "1521", event: "Los españoles descubren las vetas de plata en la Sierra de Pachuca." },
  { year: "1739", event: "José Alejandro Bustamante funda Real del Monte como pueblo minero." },
  { year: "1824", event: "Llegan los mineros cornish de Inglaterra, trayendo pastes, fútbol y nuevas técnicas." },
  { year: "1872", event: "Primera huelga minera de América Latina. Los trabajadores exigen derechos." },
  { year: "2004", event: "Real del Monte es declarado Pueblo Mágico por su riqueza cultural." },
];

export function HistorySection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });
  const imgY = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"]);

  return (
    <section id="historia" ref={containerRef} className="relative">
      {/* Full bleed image */}
      <div className="relative h-[70vh] overflow-hidden">
        <motion.img
          style={{ y: imgY }}
          src={mineEntrance}
          alt="Mina de Acosta"
          className="absolute inset-0 w-full h-[120%] object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-transparent to-background" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-background/20 to-transparent" />

        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-16 lg:p-24">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
            ref={ref}
          >
            <p className="text-sm tracking-[0.3em] uppercase text-accent font-body mb-4">
              ⛏️ Patrimonio Minero
            </p>
            <h2 className="text-4xl md:text-7xl font-display font-bold leading-[0.9]">
              Bajo estas montañas,
              <br />
              <span className="text-accent">imperios</span> nacieron
            </h2>
          </motion.div>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 md:px-16 lg:px-24 py-20 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Left: Image mosaic */}
          <div className="grid grid-cols-2 gap-3">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="col-span-2 rounded-2xl overflow-hidden h-[280px]"
            >
              <img src={mineTunnel} alt="Túnel de mina" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="rounded-2xl overflow-hidden h-[200px]"
            >
              <img src={panteonIngles} alt="Panteón Inglés" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="rounded-2xl overflow-hidden h-[200px]"
            >
              <img src={miningEquipment} alt="Equipo minero" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
            </motion.div>
          </div>

          {/* Right: Timeline */}
          <div className="flex flex-col justify-center">
            <p className="text-foreground/70 font-body text-lg leading-relaxed mb-10">
              La historia de Real del Monte es la historia de la ambición humana. Bajo estas montañas,
              generaciones de mineros —primero indígenas, después españoles, luego ingleses— extrajeron
              la plata que financió revoluciones, construyó catedrales y cambió el destino de naciones enteras.
            </p>

            <div className="space-y-6">
              {TIMELINE.map((item, i) => (
                <motion.div
                  key={item.year}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex gap-4 group"
                >
                  <div className="flex flex-col items-center">
                    <span className="text-lg font-display font-bold text-accent">{item.year}</span>
                    <div className="flex-1 w-px bg-border mt-2" />
                  </div>
                  <p className="text-sm text-foreground/70 font-body leading-relaxed pt-1 group-hover:text-foreground transition-colors">
                    {item.event}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
