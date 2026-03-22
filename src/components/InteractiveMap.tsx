import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Layers, MapPin, Navigation, Route, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { Layers, Navigation, Search, Store, TrendingUp } from "lucide-react";
import { REAL_DEL_MONTE_SITES } from "@/lib/kernel";
import {
  BUSINESS_CAPACITY_TARGET,
  INITIAL_COMMERCIAL_BUSINESSES,
  MAP_INTEGRATION_PHASES,
  RDM_BUSINESS_CATEGORIES,
} from "@/lib/business-catalog";
import "leaflet/dist/leaflet.css";

type MapPlace = Pick<
  Tables<"places">,
  "id" | "name" | "category" | "lat" | "lng" | "rating" | "description"
>;

type MoodFilter = "all" | "tranquilo" | "aventura" | "familiar" | "romantico";

const CATEGORY_COLORS: Record<string, string> = {
  historia: "hsl(var(--primary) / 0.95)",
  cultura: "hsl(var(--accent) / 0.95)",
  gastronomia: "hsl(var(--success) / 0.95)",
  aventura: "hsl(var(--destructive) / 0.82)",
  hospedaje: "hsl(var(--foreground) / 0.82)",
};

const MOOD_OPTIONS: { id: MoodFilter; label: string }[] = [
  { id: "all", label: "Todo" },
  { id: "tranquilo", label: "Tranquilo" },
  { id: "aventura", label: "Aventura" },
  { id: "familiar", label: "Familiar" },
  { id: "romantico", label: "Romántico" },
];

const MOOD_CATEGORIES: Record<MoodFilter, string[]> = {
  all: ["historia", "cultura", "gastronomia", "aventura", "hospedaje"],
  tranquilo: ["historia", "hospedaje", "cultura"],
  aventura: ["aventura", "historia"],
  familiar: ["cultura", "gastronomia", "historia"],
  romantico: ["hospedaje", "cultura", "gastronomia"],
};

const FALLBACK_PLACES: MapPlace[] = REAL_DEL_MONTE_SITES.map((site) => ({
  id: site.id,
  name: site.name,
  category: site.category,
  lat: site.lat,
  lng: site.lng,
  rating: site.rating,
  description: site.description,
}));

export function InteractiveMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<any>(null);
  const leafletLibRef = useRef<any>(null);
  const markersLayerRef = useRef<any>(null);
  const markerIndexRef = useRef<Record<string, any>>({});

  const [places, setPlaces] = useState<MapPlace[]>(FALLBACK_PLACES);
  const [mapReady, setMapReady] = useState(false);
  const [selectedMood, setSelectedMood] = useState<MoodFilter>("all");
  const [selectedPlace, setSelectedPlace] = useState<MapPlace | null>(null);

  const filteredPlaces = useMemo(() => {
    const allowed = new Set(MOOD_CATEGORIES[selectedMood]);
    return places.filter((place) => allowed.has(place.category));
  }, [places, selectedMood]);
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
    let cancelled = false;

    async function loadPlaces() {
      const { data } = await supabase
        .from("places")
        .select("id,name,category,lat,lng,rating,description")
        .order("created_at", { ascending: true });

      if (!cancelled && data?.length) {
        setPlaces(data as MapPlace[]);
        setSelectedPlace((data[0] as MapPlace) ?? null);
      } else if (!cancelled) {
        setSelectedPlace(FALLBACK_PLACES[0] ?? null);
      }
    }

    loadPlaces();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current || leafletMapRef.current) return;

    let cancelled = false;

    import("leaflet").then((L) => {
      if (cancelled || !mapRef.current) return;

      leafletLibRef.current = L;

      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      const map = L.map(mapRef.current, {
        center: [20.138, -98.671],
        zoom: 15,
        zoomControl: false,
      });

      L.control.zoom({ position: "bottomright" }).addTo(map);
      L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>',
        maxZoom: 19,
      }).addTo(map);

      markersLayerRef.current = L.layerGroup().addTo(map);
      leafletMapRef.current = map;
      setMapReady(true);
      window.setTimeout(() => map.invalidateSize(), 250);

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
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapReady || !leafletMapRef.current || !leafletLibRef.current || !markersLayerRef.current) return;

    const L = leafletLibRef.current;
    const map = leafletMapRef.current;
    markersLayerRef.current.clearLayers();
    markerIndexRef.current = {};

    filteredPlaces.forEach((site) => {
      const color = CATEGORY_COLORS[site.category] ?? "hsl(var(--accent) / 0.95)";

      const marker = L.marker([site.lat, site.lng], {
        icon: L.divIcon({
          className: "rdm-map-marker",
          html: `<div class="rdm-map-pin" style="--pin-color: ${color}"></div>`,
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        }),
      }).addTo(markersLayerRef.current);

      marker.bindPopup(
        `<div class="rdm-popup-card">
          <div class="rdm-popup-kicker">
            <span class="rdm-popup-dot" style="background:${color};"></span>
            ${site.category}
          </div>
          <h3 class="rdm-popup-title">${site.name}</h3>
          <p class="rdm-popup-desc">${site.description ?? "Experiencia territorial de alto valor."}</p>
          <div class="rdm-popup-meta">
            <span>★ ${(site.rating ?? 4.5).toFixed(1)}</span>
            <span>${site.lat.toFixed(3)}°N · ${Math.abs(site.lng).toFixed(3)}°W</span>
          </div>
        </div>`,
        { className: "rdm-popup" },
      );

      marker.on("click", () => setSelectedPlace(site));
      markerIndexRef.current[site.id] = marker;
    });

    if (filteredPlaces.length > 1) {
      const bounds = L.latLngBounds(filteredPlaces.map((place) => [place.lat, place.lng]));
      map.fitBounds(bounds, { padding: [24, 24], maxZoom: 16 });
    }

    if (!filteredPlaces.some((place) => place.id === selectedPlace?.id)) {
      setSelectedPlace(filteredPlaces[0] ?? null);
    }
  }, [filteredPlaces, mapReady, selectedPlace?.id]);

  const focusPlace = (place: MapPlace) => {
    setSelectedPlace(place);
    const marker = markerIndexRef.current[place.id];

    if (marker) {
      marker.openPopup();
    }

    if (leafletMapRef.current) {
      leafletMapRef.current.flyTo([place.lat, place.lng], 17, { duration: 1.1 });
    }
  };

  return (
    <section id="mapa" className="px-6 py-24 md:px-16 lg:px-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        className="mb-10 text-center"
      >
        <p className="mb-4 flex items-center justify-center gap-2 text-sm font-body uppercase tracking-[0.3em] text-accent">
          <Navigation className="h-4 w-4" />
          Cartografía Territorial
        </p>
        <h2 className="text-4xl font-display font-bold md:text-6xl">
          Explorador <span className="text-accent">Interactivo</span>
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
          15 lugares de Real del Monte conectados a datos reales con filtros por estado de ánimo y panel contextual.
        </p>
      </motion.div>

      <div className="mx-auto grid max-w-7xl gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <motion.div
          initial={{ opacity: 0, scale: 0.985 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-2xl border border-border"
        >
          <div ref={mapRef} className="h-[520px] w-full md:h-[620px]" />
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
            <div className="absolute inset-0 flex items-center justify-center bg-background/95">
              <div className="text-center">
                <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
                <p className="text-sm text-muted-foreground">Sincronizando cartografía territorial…</p>
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-sm text-muted-foreground font-body">Cargando cartografía...</p>
              </div>
            </div>
          )}

          <div className="absolute left-4 top-4 z-[1000] glass rounded-xl p-3">
            <div className="mb-2 flex items-center gap-1.5 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              <Layers className="h-3 w-3 text-accent" />
              Capas
          <div className="absolute bottom-4 left-4 z-[1000] glass rounded-xl p-3">
            <div className="flex items-center gap-2 mb-2">
              <Layers className="w-3 h-3 text-primary" />
              <p className="text-[10px] font-body font-medium text-foreground/80">Capas Territoriales</p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {MOOD_OPTIONS.map((mood) => (
                <button
                  key={mood.id}
                  type="button"
                  onClick={() => setSelectedMood(mood.id)}
                  className={`rounded-full border px-2.5 py-1 text-[10px] font-body transition-colors ${
                    selectedMood === mood.id
                      ? "border-accent/50 bg-accent/20 text-accent"
                      : "border-border/50 bg-background/30 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {mood.label}
                </button>
              ))}
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: COMMERCIAL_COLOR }} />
                <span className="text-[10px] text-foreground/60 font-body">comercios</span>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="glass rounded-2xl border border-border/70 p-4">
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Punto activo</p>
          <h3 className="mt-1 text-xl font-display font-semibold text-accent">
            {selectedPlace?.name ?? "Selecciona un lugar"}
          </h3>
          <p className="mt-2 text-sm text-foreground/70">
            {selectedPlace?.description ?? "Explora el mapa para ver detalles de cada punto."}
          </p>

          {selectedPlace && (
            <div className="mt-4 flex items-center gap-3 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <Star className="h-3 w-3 text-accent" />
                {(selectedPlace.rating ?? 4.5).toFixed(1)}
              </span>
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-3 w-3 text-accent" />
                {selectedPlace.category}
              </span>
            </div>
          )}

          <div className="mt-5 space-y-2">
            {filteredPlaces.map((place) => (
              <button
                key={place.id}
                type="button"
                onClick={() => focusPlace(place)}
                className={`w-full rounded-xl border p-3 text-left transition-colors ${
                  selectedPlace?.id === place.id
                    ? "border-accent/40 bg-accent/10"
                    : "border-border/40 bg-background/20 hover:border-accent/25"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">{place.category}</p>
                    <p className="mt-0.5 text-sm font-display font-semibold leading-tight">{place.name}</p>
                  </div>
                  <span className="inline-flex items-center gap-1 text-xs text-accent">
                    <Route className="h-3 w-3" />
                    {(place.rating ?? 4.5).toFixed(1)}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .leaflet-container {
          background: hsl(var(--background));
        }

        .rdm-map-pin {
          width: 28px;
          height: 28px;
          border-radius: 9999px;
          border: 3px solid hsl(var(--background));
          background: var(--pin-color);
          box-shadow:
            0 0 0 2px hsl(var(--border) / 0.5),
            0 0 18px hsl(var(--accent) / 0.28);
          transition: transform 180ms ease;
          position: relative;
        }

        .rdm-map-pin::after {
          content: "";
          position: absolute;
          inset: 8px;
          border-radius: 9999px;
          background: hsl(var(--background));
        }

        .rdm-map-pin:hover {
          transform: scale(1.15);
        }

        .rdm-popup .leaflet-popup-content-wrapper,
        .rdm-popup .leaflet-popup-tip {
          background: hsl(var(--card));
          color: hsl(var(--foreground));
          border: 1px solid hsl(var(--border));
          box-shadow: 0 16px 36px hsl(var(--background) / 0.5);
        }

        .rdm-popup-card {
          min-width: 220px;
          padding: 4px;
          font-family: var(--font-body);
        }

        .rdm-popup-kicker {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 6px;
          color: hsl(var(--muted-foreground));
          font-size: 10px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
        }

        .rdm-popup-dot {
          width: 8px;
          height: 8px;
          border-radius: 9999px;
        }

        .rdm-popup-title {
          margin: 0;
          font-size: 16px;
          font-family: var(--font-display);
          color: hsl(var(--foreground));
        }

        .rdm-popup-desc {
          margin: 6px 0 8px;
          font-size: 12px;
          color: hsl(var(--foreground) / 0.78);
          line-height: 1.45;
        }

        .rdm-popup-meta {
          display: flex;
          justify-content: space-between;
          gap: 8px;
          font-size: 10px;
          color: hsl(var(--muted-foreground));
        }
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
