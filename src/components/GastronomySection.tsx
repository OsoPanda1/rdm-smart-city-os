import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import pastesFood from "@/assets/pastes-food.jpg";
import marketArtesanias from "@/assets/market-artesanias.jpg";

const DISHES = [
  { name: "Paste Tradicional", desc: "Herencia cornish con papa, carne y cebolla", price: "$35" },
  { name: "Paste de Mole", desc: "Fusión mexicana con mole rojo de Hidalgo", price: "$40" },
  { name: "Paste Dulce de Piña", desc: "Relleno de piña caramelizada con canela", price: "$30" },
  { name: "Café de Olla", desc: "Con piloncillo, canela y clavo en barro", price: "$25" },
  { name: "Barbacoa de Borrego", desc: "Cocida en horno de tierra toda la noche", price: "$120" },
  { name: "Pulque Curado", desc: "De avena, piñón o tuna, tradición milenaria", price: "$40" },
];

export function GastronomySection() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const imgY = useTransform(scrollYProgress, [0, 1], ["-5%", "5%"]);

  return (
    <section id="gastronomia" ref={ref} className="relative">
      {/* Full bleed image */}
      <div className="relative h-[60vh] overflow-hidden">
        <motion.img
          style={{ y: imgY }}
          src={pastesFood}
          alt="Pastes tradicionales"
          className="absolute inset-0 w-full h-[120%] object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-transparent to-background" />

        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-16 lg:p-24">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <p className="text-sm tracking-[0.3em] uppercase text-accent font-body mb-4">
              🍽️ Gastronomía
            </p>
            <h2 className="text-4xl md:text-7xl font-display font-bold leading-[0.9]">
              Sabores que cruzan
              <br />
              <span className="text-accent">océanos</span>
            </h2>
          </motion.div>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 md:px-16 lg:px-24 py-20 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          <div>
            <p className="text-foreground/70 font-body text-lg leading-relaxed mb-10">
              El paste llegó a Real del Monte en 1824 con los mineros de Cornwall, Inglaterra.
              Lo que comenzó como un almuerzo práctico para las profundidades de la mina, se
              transformó en el platillo más icónico de Hidalgo. Hoy, cada pastería guarda su
              receta como un secreto generacional.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {DISHES.map((dish, i) => (
                <motion.div
                  key={dish.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="group p-4 rounded-xl bg-card border border-border hover:border-accent/30 transition-all cursor-pointer"
                >
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-display font-semibold text-sm group-hover:text-accent transition-colors">
                      {dish.name}
                    </h4>
                    <span className="text-accent font-body font-semibold text-sm">{dish.price}</span>
                  </div>
                  <p className="text-xs text-muted-foreground font-body">{dish.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="rounded-2xl overflow-hidden h-[500px]"
          >
            <img
              src={marketArtesanias}
              alt="Mercado de artesanías"
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
