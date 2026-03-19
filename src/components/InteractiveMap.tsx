import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Star, Navigation, Layers } from "lucide-react";
import { REAL_DEL_MONTE_SITES } from "@/lib/kernel";
import "leaflet/dist/leaflet.css";

const CATEGORIES_COLORS: Record<string, string> = {
  historia: "#e07730",
  cultura: "#5b8cc9",
  gastronomia: "#e8a040",
  aventura: "#6b8e56",
  hospedaje: "#8b7ec8",
};

export function InteractiveMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<any>(null);
  const [selectedPlace, setSelectedPlace] = useState<typeof REAL_DEL_MONTE_SITES[number] | null>(null);
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    if (!mapRef.current || leafletMap.current) return;

    let cancelled = false;

    import("leaflet").then((L) => {
      if (cancelled || !mapRef.current) return;

      // Fix default icon paths
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      const map = L.map(mapRef.current!, {
        center: [20.138, -98.671],
        zoom: 16,
        zoomControl: false,
        scrollWheelZoom: true,
      });

      L.control.zoom({ position: "bottomright" }).addTo(map);

      // Dark tile layer
      L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>',
        maxZoom: 19,
      }).addTo(map);

      // Add markers
      REAL_DEL_MONTE_SITES.forEach((site) => {
        const color = CATEGORIES_COLORS[site.category] || "#d4a843";
        const icon = L.divIcon({
          className: "custom-marker",
          html: `<div style="
            width: 28px; height: 28px; border-radius: 50%;
            background: ${color}; border: 3px solid #0f172a;
            box-shadow: 0 0 12px ${color}80, 0 2px 8px rgba(0,0,0,0.5);
            display: flex; align-items: center; justify-content: center;
            cursor: pointer; transition: transform 0.2s;
          "><div style="width: 8px; height: 8px; border-radius: 50%; background: #0f172a;"></div></div>`,
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        });

        const marker = L.marker([site.lat, site.lng], { icon }).addTo(map);

        marker.bindPopup(`
          <div style="font-family: 'DM Sans', sans-serif; min-width: 200px; padding: 4px;">
            <div style="display:flex; align-items:center; gap:6px; margin-bottom:6px;">
              <div style="width:10px;height:10px;border-radius:50%;background:${color};"></div>
              <span style="font-size:10px;text-transform:uppercase;letter-spacing:1px;color:#888;">${site.category}</span>
            </div>
            <h3 style="font-size:15px;font-weight:700;margin:0 0 4px;font-family:'Playfair Display',serif;color:#1a1a2e;">${site.name}</h3>
            <p style="font-size:12px;color:#555;margin:0 0 8px;line-height:1.4;">${site.description}</p>
            <div style="display:flex;justify-content:space-between;align-items:center;">
              <span style="font-size:11px;color:#d4a843;font-weight:600;">★ ${site.rating}</span>
              <span style="font-size:10px;color:#999;">${site.lat.toFixed(3)}°N, ${Math.abs(site.lng).toFixed(3)}°W</span>
            </div>
          </div>
        `, { className: "rdm-popup" });
      });

      leafletMap.current = map;
      setMapReady(true);

      // Invalidate size after animation
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
        <p className="text-sm tracking-[0.3em] uppercase text-accent font-body mb-4 flex items-center justify-center gap-2">
          <Navigation className="w-4 h-4" />
          Cartografía Territorial
        </p>
        <h2 className="text-4xl md:text-6xl font-display font-bold">
          Mapa <span className="text-accent">Interactivo</span>
        </h2>
        <p className="text-muted-foreground font-body mt-4 max-w-xl mx-auto">
          Explora los 15 puntos emblemáticos de Real del Monte. Cada marcador revela historia, gastronomía, cultura y aventura.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="max-w-6xl mx-auto"
      >
        {/* Map container */}
        <div className="relative rounded-2xl overflow-hidden border border-border">
          <div ref={mapRef} className="w-full h-[500px] md:h-[600px]" />

          {/* Loading overlay */}
          {!mapReady && (
            <div className="absolute inset-0 bg-background flex items-center justify-center">
              <div className="text-center">
                <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-sm text-muted-foreground font-body">Cargando cartografía...</p>
              </div>
            </div>
          )}

          {/* Legend */}
          <div className="absolute bottom-4 left-4 z-[1000] glass rounded-xl p-3">
            <div className="flex items-center gap-2 mb-2">
              <Layers className="w-3 h-3 text-accent" />
              <p className="text-[10px] font-body font-medium text-foreground/80">Capas Territoriales</p>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1">
              {Object.entries(CATEGORIES_COLORS).map(([cat, color]) => (
                <div key={cat} className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
                  <span className="text-[10px] text-foreground/60 font-body capitalize">{cat}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Places grid below map */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mt-6">
          {REAL_DEL_MONTE_SITES.slice(0, 10).map((place, i) => (
            <motion.div
              key={place.id}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.04 }}
              className="glass rounded-xl p-3 cursor-pointer hover:border-accent/30 transition-colors group"
              onClick={() => {
                if (leafletMap.current) {
                  leafletMap.current.flyTo([place.lat, place.lng], 18, { duration: 1 });
                }
              }}
            >
              <div className="flex items-center gap-1.5 mb-1">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ background: CATEGORIES_COLORS[place.category] || "#d4a843" }}
                />
                <span className="text-[9px] text-muted-foreground font-body uppercase tracking-wider">
                  {place.category}
                </span>
              </div>
              <p className="text-xs font-display font-semibold group-hover:text-accent transition-colors leading-tight">
                {place.name}
              </p>
              <p className="text-[10px] text-accent mt-1 flex items-center gap-1">
                <Star className="w-2.5 h-2.5" /> {place.rating}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Custom popup styles */}
      <style>{`
        .rdm-popup .leaflet-popup-content-wrapper {
          background: #fafaf8;
          border-radius: 12px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.3);
          border: 1px solid #e2e8f0;
        }
        .rdm-popup .leaflet-popup-tip {
          background: #fafaf8;
        }
        .leaflet-container {
          background: hsl(220, 20%, 7%);
        }
        .custom-marker div:hover {
          transform: scale(1.3) !important;
        }
      `}</style>
    </section>
  );
}
