export type FederationId =
  | "DEKATEOTL"
  | "ANUBIS"
  | "BOOKPI_DATAGIT"
  | "PHOENIX"
  | "MDD_TAMV"
  | "KAOS_HYPERRENDER"
  | "CHRONOS";

export type FederationModule = {
  id: FederationId;
  name: string;
  specialty: string;
  stack: string[];
  role: string;
  status: "ACTIVE" | "IDLE" | "DEGRADED";
  health: number;
};

export const HEPTAFEDERATION: FederationModule[] = [
  {
    id: "DEKATEOTL",
    name: "Dekateotl™",
    specialty: "Ética y Lógica Narrativa",
    stack: ["LangGraph", "SHAP", "RLHF"],
    role: "Orquestador de axiología, veto ético y memoria de valores.",
    status: "ACTIVE",
    health: 0.98,
  },
  {
    id: "ANUBIS",
    name: "Anubis Sentinel™",
    specialty: "Seguridad PQC",
    stack: ["Dilithium-5", "Kyber-1024", "zk-SNARKs"],
    role: "Blindaje criptográfico poscuántico y túnel de soberanía.",
    status: "ACTIVE",
    health: 1.0,
  },
  {
    id: "BOOKPI_DATAGIT",
    name: "BookPI™ / DataGit™",
    specialty: "Inmutabilidad y Auditoría",
    stack: ["IPFS Pinning", "Merkle Trees", "MSR Blockchain"],
    role: "Caja negra y trazabilidad granular de decisiones.",
    status: "ACTIVE",
    health: 0.94,
  },
  {
    id: "PHOENIX",
    name: "Phoenix Protocol™",
    specialty: "Resiliencia y P2P",
    stack: ["libp2p", "Swarm Quorum"],
    role: "Topología de resiliencia sin SPOF y auto-reparación.",
    status: "ACTIVE",
    health: 0.96,
  },
  {
    id: "MDD_TAMV",
    name: "MDD / TAMV Credits™",
    specialty: "Economía Creativa",
    stack: ["Web3 Identity", "Quadratic Funding"],
    role: "Motor de valor y financiamiento comunitario.",
    status: "ACTIVE",
    health: 0.93,
  },
  {
    id: "KAOS_HYPERRENDER",
    name: "KAOS / HyperRender™",
    specialty: "Sensorialidad y XR",
    stack: ["Three.js", "WebNN", "Haptics API"],
    role: "Capa multisensorial y sinestesia digital Crystal Glow.",
    status: "IDLE",
    health: 0.89,
  },
  {
    id: "CHRONOS",
    name: "Chronos Planning™",
    specialty: "Gestión de Tiempo y Guía",
    stack: ["Genetic Algorithms", "Mapbox GL", "Turf.js"],
    role: "Planificador multiobjetivo territorial.",
    status: "ACTIVE",
    health: 0.97,
  },
];

export type SiteSignals = {
  relevance: number;
  crowd: number;
  heritage: number;
  gastroAffinity: number;
};

export type Weights = {
  w1: number;
  w2: number;
  w3: number;
  w4: number;
};

export const defaultWeights: Weights = {
  w1: 0.35,
  w2: 0.25,
  w3: 0.25,
  w4: 0.15,
};

export function scoreSite(signals: SiteSignals, weights = defaultWeights): number {
  const { relevance, crowd, heritage, gastroAffinity } = signals;
  const { w1, w2, w3, w4 } = weights;
  const score = w1 * relevance + w2 * (1 - crowd) + w3 * heritage + w4 * gastroAffinity;
  return Math.max(0, Math.min(1, score));
}

export function getGlobalHealth(): number {
  return HEPTAFEDERATION.reduce((acc, m) => acc + m.health, 0) / HEPTAFEDERATION.length;
}

export function getTelemetry() {
  return HEPTAFEDERATION.map((m) => ({
    id: m.id.slice(0, 3),
    label: m.name,
    status: Math.round(m.health * 100),
    specialty: m.specialty,
    statusLabel: m.status,
  }));
}
