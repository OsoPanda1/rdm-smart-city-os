import { type Intent } from "./types";

const PLACES_DB = [
  { id: "1", name: "Mina de Acosta", category: "historia", lat: 20.138, lng: -98.671, rating: 4.8, description: "Mina histórica del siglo XVIII, joya del patrimonio minero." },
  { id: "2", name: "Museo de Medicina Laboral", category: "cultura", lat: 20.139, lng: -98.673, rating: 4.6, description: "Historia médica de los mineros de Real del Monte." },
  { id: "3", name: "Panteón Inglés", category: "historia", lat: 20.137, lng: -98.670, rating: 4.9, description: "Cementerio histórico de mineros británicos, único en México." },
  { id: "4", name: "Pastes El Portal", category: "gastronomia", lat: 20.140, lng: -98.672, rating: 4.7, description: "Los mejores pastes tradicionales cornish del pueblo." },
  { id: "5", name: "Pastes Kiko's", category: "gastronomia", lat: 20.139, lng: -98.674, rating: 4.5, description: "Pastes artesanales con recetas originales desde 1940." },
  { id: "6", name: "Hotel Real del Monte", category: "hospedaje", lat: 20.141, lng: -98.675, rating: 4.3, description: "Hospedaje colonial con vista a las montañas." },
  { id: "7", name: "Peña del Cuervo", category: "aventura", lat: 20.135, lng: -98.668, rating: 4.8, description: "Mirador natural con senderos de montaña espectaculares." },
  { id: "8", name: "Iglesia de la Asunción", category: "cultura", lat: 20.140, lng: -98.671, rating: 4.6, description: "Templo del siglo XVIII, centro espiritual del pueblo." },
  { id: "9", name: "Centro Cultural Nicolás Zavala", category: "cultura", lat: 20.138, lng: -98.672, rating: 4.4, description: "Galería de arte y espacio cultural comunitario." },
  { id: "10", name: "Sendero de las Minas", category: "aventura", lat: 20.136, lng: -98.669, rating: 4.7, description: "Recorrido por antiguas minas con guías locales." },
];

const NARRATIVES: Record<Intent, string[]> = {
  gastronomia: [
    "Real del Monte es la cuna del paste en México. Este legado cornish llegó con los mineros ingleses del siglo XIX y se transformó en una tradición viva.",
    "Los aromas de paste fresco inundan las calles empedradas. Cada bocado es un viaje entre Cornwall y la Sierra de Pachuca.",
  ],
  historia: [
    "Bajo estas montañas, generaciones de mineros forjaron la historia de México. La plata de Real del Monte financió imperios.",
    "Las minas guardan secretos de 500 años. Cada túnel cuenta una historia de valentía, sudor y plata.",
  ],
  aventura: [
    "La Sierra de Pachuca te espera con senderos entre bosques de oyamel y vistas que quitan el aliento.",
    "A 2,700 metros sobre el nivel del mar, cada paso es una conquista. La bruma te envuelve como un abrazo ancestral.",
  ],
  hospedaje: [
    "Descansa en casas coloniales convertidas en refugios. Aquí el silencio de la montaña es tu mejor compañía.",
    "La hospitalidad de Real del Monte se siente en cada detalle: chimeneas encendidas, cobijas de lana y café de olla al amanecer.",
  ],
  cultura: [
    "Real del Monte es Pueblo Mágico por derecho propio. Su mezcla de herencia británica y raíces mexicanas crea algo irrepetible.",
    "Cada calle empedrada, cada fachada colorida, cada tradición preservada es un acto de resistencia cultural.",
  ],
};

export function inferIntent(query: string): Intent {
  const q = query.toLowerCase();
  if (q.match(/comer|paste|comida|restaurante|hambre|desayun|cena/)) return "gastronomia";
  if (q.match(/hotel|dormir|hosped|quedar|descansar|cabaña/)) return "hospedaje";
  if (q.match(/historia|mina|museo|colonial|antiguo|pasado/)) return "historia";
  if (q.match(/aventura|sendero|caminar|montaña|senderismo|escalada/)) return "aventura";
  return "cultura";
}

export function getRecommendations(intent: Intent) {
  return PLACES_DB.filter(p => p.category === intent).slice(0, 3);
}

export function generateNarrative(intent: Intent): string {
  const narrs = NARRATIVES[intent];
  return narrs[Math.floor(Math.random() * narrs.length)];
}

export function getAllPlaces() {
  return PLACES_DB;
}

export function getSystemMetrics() {
  return {
    activeUsers: Math.floor(Math.random() * 50) + 120,
    placesIndexed: PLACES_DB.length,
    kernelLatency: Math.floor(Math.random() * 30) + 80,
    uptime: 99.97,
    intentsProcessed: Math.floor(Math.random() * 200) + 1840,
  };
}

export interface KernelOutput {
  intent: Intent;
  recommendations: typeof PLACES_DB;
  narrative: string;
  confidence: number;
}

export function runRealitoKernel(query: string): KernelOutput {
  const intent = inferIntent(query);
  const recommendations = getRecommendations(intent);
  const narrative = generateNarrative(intent);
  return {
    intent,
    recommendations,
    narrative,
    confidence: 0.85 + Math.random() * 0.12,
  };
}
