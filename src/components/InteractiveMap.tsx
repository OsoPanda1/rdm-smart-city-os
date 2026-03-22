import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Layers, Navigation, Search, Store, TrendingUp } from "lucide-react";
import { REAL_DEL_MONTE_SITES } from "@/lib/kernel";
import {
  BUSINESS_CAPACITY_TARGET,
  INITIAL_COMMERCIAL_BUSINESSES,
  MAP_INTEGRATION_PHASES,
  RDM_BUSINESS_CATEGORIES,
} from "@/lib/business-catalog";
import "leaflet/dist/leaflet.css";

const CATEGORIES_COLORS: Record<string, string> = {
  historia: "#A85D34",
  cultura: "#516B8B",
  gastronomia: "#C86B2B",
  aventura: "#5E7B58",
  hospedaje: "#6E6AA3",
};

const COMMERCIAL_COLOR = "#2C4A66";

export function InteractiveMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<any>(null);
  const [mapReady, setMapReady] = useState(false);
  const [activeBusinessCategory, setActiveBusinessCategory] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  const visibleBusinesses = useMemo(() => {
    const byCategory = activeBusinessCategory === "all"
      ? INITIAL_COMMERCIAL_BUSINESSES
      : INITIAL_COMMERCIAL_BUSINESSES.filter((business) => business.category === activeBusinessCategory);

    return byCategory.filter((business) =>
      business.name.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [activeBusinessCategory, searchTerm]);

  useEffect(() => {
    if (!mapRef.current || leafletMap.current) return;

    let cancelled = false;

    import("leaflet").then((L) => {
      if (cancelled || !mapRef.current) return;

      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      const map = L.map(mapRef.current!, {
        center: [20.138, -98.671],
        zoom: 15,
        zoomControl: false,
        scrollWheelZoom: true,
      });

      L.control.zoom({ position: "bottomright" }).addTo(map);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>',
        maxZoom: 19,
      }).addTo(map);

      REAL_DEL_MONTE_SITES.forEach((site) => {
        const color = CATEGORIES_COLORS[site.category] || "#A88A5A";
        const icon = L.divIcon({
          className: "custom-marker",
          html: `<div style="
            width: 26px; height: 26px; border-radius: 50%;
            background: ${color}; border: 2px solid #ffffff;
            box-shadow: 0 0 0 3px rgba(44,74,102,0.16), 0 4px 14px rgba(17,24,39,0.32);
            display: flex; align-items: center; justify-content: center;
            cursor: pointer; transition: transform 0.2s;
          "><div style="width: 8px; height: 8px; border-radius: 50%; background: #ffffff;"></div></div>`,
          iconSize: [26, 26],
          iconAnchor: [13, 13],
        });

        const marker = L.marker([site.lat, site.lng], { icon }).addTo(map);
        marker.bindPopup(`
          <div style="font-family: 'DM Sans', sans-serif; min-width: 210px; padding: 4px; color:#1F2937;">
            <div style="display:flex; align-items:center; gap:6px; margin-bottom:6px;">
              <div style="width:10px;height:10px;border-radius:50%;background:${color};"></div>
              <span style="font-size:10px;text-transform:uppercase;letter-spacing:1px;color:#64748B;">${site.category}</span>
            </div>
            <h3 style="font-size:15px;font-weight:700;margin:0 0 4px;font-family:'Playfair Display',serif;">${site.name}</h3>
            <p style="font-size:12px;color:#475569;margin:0 0 8px;line-height:1.4;">${site.description}</p>
            <span style="font-size:11px;color:#B45309;font-weight:600;">★ ${site.rating}</span>
          </div>
        `, { className: "rdm-popup" });
      });

      INITIAL_COMMERCIAL_BUSINESSES.forEach((business) => {
        const marker = L.circleMarker([business.lat, business.lng], {
          radius: 6,
          color: "#fff",
          weight: 1,
          fillColor: COMMERCIAL_COLOR,
          fillOpacity: business.status === "active" ? 0.9 : 0.45,
        }).addTo(map);

        marker.bindPopup(`
          <div style="font-family: 'DM Sans', sans-serif; min-width: 190px; color:#1F2937;">
            <p style="margin:0;font-size:10px;letter-spacing:1px;text-transform:uppercase;color:#64748B;">Comercio RDM</p>
            <h4 style="margin:5px 0 6px;font-size:14px;">${business.name}</h4>
            <p style="margin:0;font-size:11px;color:#475569;">Estado: ${business.status === "active" ? "Activo" : "Próxima alta"}</p>
          </div>
        `, { className: "rdm-popup" });
      });

      leafletMap.current = map;
      setMapReady(true);
      setTimeout(() => map.invalidateSize(), 300);
    });

    return () => {
      cancelled = true;
      if (leafletMap.current) {
        leafletMap.current.remove();
        leafletMap.current = null;
      }
    };
  }, []);

  return (
    <section id="mapa" className="py-24 px-6 md:px-16 lg:px-24">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="text-center mb-12"
      >
        <p className="text-sm tracking-[0.3em] uppercase text-primary font-body mb-4 flex items-center justify-center gap-2">
          <Navigation className="w-4 h-4" />
          Cartografía Territorial + Comercial
        </p>
        <h2 className="text-4xl md:text-6xl font-display font-bold text-foreground">
          Mapa <span className="text-accent">Interactivo</span>
        </h2>
        <p className="text-muted-foreground font-body mt-4 max-w-2xl mx-auto">
          Plataforma preparada para integrar hasta {BUSINESS_CAPACITY_TARGET} negocios: puntos turísticos, comercios y servicios con crecimiento por fases.
        </p>
      </motion.div>

      <div className="max-w-6xl mx-auto grid lg:grid-cols-[1.55fr_1fr] gap-5 mb-6">
        <div className="glass rounded-2xl p-4">
          <div className="flex items-center justify-between gap-2 mb-3">
            <p className="text-xs uppercase tracking-[0.2em] text-foreground/70 flex items-center gap-2"><Store className="w-3 h-3" /> Registro comercial</p>
            <p className="text-xs text-foreground/70">{INITIAL_COMMERCIAL_BUSINESSES.length}/{BUSINESS_CAPACITY_TARGET}</p>
          </div>
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Buscar negocio…"
              className="w-full rounded-xl border border-border bg-white/75 py-2 pl-10 pr-3 text-sm outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div className="flex flex-wrap gap-2 mb-4">
            <button
              onClick={() => setActiveBusinessCategory("all")}
              className={`px-3 py-1 rounded-full text-xs border transition ${activeBusinessCategory === "all" ? "bg-primary text-primary-foreground border-primary" : "bg-white/70 border-border text-foreground/80"}`}
            >
              Todas
            </button>
            {RDM_BUSINESS_CATEGORIES.slice(0, 6).map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveBusinessCategory(category.id)}
                className={`px-3 py-1 rounded-full text-xs border transition ${activeBusinessCategory === category.id ? "bg-primary text-primary-foreground border-primary" : "bg-white/70 border-border text-foreground/80"}`}
              >
                {category.icon} {category.name}
              </button>
            ))}
          </div>
          <div className="space-y-2 max-h-[210px] overflow-auto pr-1">
            {visibleBusinesses.map((business) => (
              <button
                key={business.id}
                className="w-full text-left rounded-xl border border-border/70 bg-white/60 px-3 py-2 hover:border-primary/40 transition"
                onClick={() => leafletMap.current?.flyTo([business.lat, business.lng], 17, { duration: 0.8 })}
              >
                <p className="text-sm font-semibold text-foreground">{business.name}</p>
                <p className="text-xs text-muted-foreground">{business.status === "active" ? "Activo" : "Próxima alta"}</p>
              </button>
            ))}
            {visibleBusinesses.length === 0 && <p className="text-xs text-muted-foreground">Sin resultados para esta búsqueda.</p>}
          </div>
        </div>

        <div className="glass rounded-2xl p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-foreground/70 mb-3 flex items-center gap-2"><TrendingUp className="w-3 h-3" /> Roadmap de expansión</p>
          <ul className="space-y-2">
            {MAP_INTEGRATION_PHASES.map((phase) => (
              <li key={phase} className="text-sm text-foreground/85 leading-relaxed border-l-2 border-primary/35 pl-3">{phase}</li>
            ))}
          </ul>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="max-w-6xl mx-auto"
      >
        <div className="relative rounded-2xl overflow-hidden border border-border/80 shadow-2xl shadow-slate-900/10">
          <div ref={mapRef} className="w-full h-[500px] md:h-[600px]" />

          {!mapReady && (
            <div className="absolute inset-0 bg-background flex items-center justify-center">
              <div className="text-center">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-sm text-muted-foreground font-body">Cargando cartografía...</p>
              </div>
            </div>
          )}

          <div className="absolute bottom-4 left-4 z-[1000] glass rounded-xl p-3">
            <div className="flex items-center gap-2 mb-2">
              <Layers className="w-3 h-3 text-primary" />
              <p className="text-[10px] font-body font-medium text-foreground/80">Capas Territoriales</p>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1">
              {Object.entries(CATEGORIES_COLORS).map(([cat, color]) => (
                <div key={cat} className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
                  <span className="text-[10px] text-foreground/60 font-body capitalize">{cat}</span>
                </div>
              ))}
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: COMMERCIAL_COLOR }} />
                <span className="text-[10px] text-foreground/60 font-body">comercios</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <style>{`
        .rdm-popup .leaflet-popup-content-wrapper {
          background: #fffef9;
          border-radius: 12px;
          box-shadow: 0 10px 36px rgba(31,41,55,0.18);
          border: 1px solid #e2e8f0;
        }
        .rdm-popup .leaflet-popup-tip { background: #fffef9; }
        .leaflet-container { background: #f8f6ef; }
        .custom-marker div:hover { transform: scale(1.2) !important; }
      `}</style>
    </section>
  );
}
