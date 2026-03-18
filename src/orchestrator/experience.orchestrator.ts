import { MovementFilter } from "@/core/behavior/movement.filter";
import { createTraceId } from "@/core/context/trace";
import { type IClock, Clock } from "@/core/engine/deterministic-clock";
import { ScoringEngine } from "@/core/engine/scoring.engine";
import { withinBBox } from "@/core/geo/bbox";
import { fastDistance } from "@/core/geo/haversine.fast";
import { LRUCache } from "@/core/geo/lru-cache";
import { bus, type EventBus } from "@/core/infra/event-bus";
import type { Coordenadas, Decision, TuristaEstado } from "@/core/models";
import { decisionLatency, decisionScore } from "@/infra/metrics/prometheus";

interface OrchestratorOptions {
  cacheCapacity?: number;
  cacheTtlMs?: number;
  movementAlpha?: number;
  clock?: IClock;
  engine?: ScoringEngine;
  eventBus?: EventBus;
  throttleMs?: number;
  proximityBBoxMeters?: number;
}

export class ExperienceOrchestrator {
  private cache: LRUCache<string, number>;
  private movement: MovementFilter;
  private clock: IClock;
  private engine: ScoringEngine;
  private eventBus: EventBus;
  private throttleMs: number;
  private proximityBBoxMeters: number;
  private lastDecisionAt = new Map<string, number>();

  constructor(
    private exits: Coordenadas[],
    options: OrchestratorOptions = {},
  ) {
    this.clock = options.clock ?? new Clock();
    this.engine = options.engine ?? new ScoringEngine();
    this.eventBus = options.eventBus ?? bus;
    this.cache = new LRUCache(
      options.cacheCapacity ?? 5000,
      options.cacheTtlMs ?? 30_000,
      () => this.clock.now(),
    );
    this.movement = new MovementFilter(options.movementAlpha ?? 0.3);
    this.throttleMs = options.throttleMs ?? 45_000;
    this.proximityBBoxMeters = options.proximityBBoxMeters ?? 300;
  }

  evaluar(t: TuristaEstado): Decision | null {
    const started = this.clock.now();
    const traceId = createTraceId();

    const nearest = this.getNearestExit(t.coords);
    if (!nearest || !withinBBox(t.coords, nearest, this.proximityBBoxMeters)) {
      return null;
    }

    if (this.wasRecentlyNotified(t.id, started)) {
      return null;
    }

    const key = `${t.coords.lat.toFixed(5)},${t.coords.lng.toFixed(5)}->${nearest.lat.toFixed(5)},${nearest.lng.toFixed(5)}`;
    let dist = this.cache.get(key);
    if (dist === undefined) {
      dist = fastDistance(t.coords, nearest);
      this.cache.set(key, dist);
    }

    const rawSpeed = t.prevCoords ? fastDistance(t.prevCoords, t.coords) / 5 : 0;
    const speed = this.movement.update(rawSpeed);

    const inactivity = (started - t.activityTimestamps.lastInteractionAt.getTime()) / 60_000;

    const score = this.engine.evaluar({
      distanceToExit: dist,
      stayTimeHours: t.stayTimeHours,
      inactivityMinutes: inactivity,
      speedMps: speed,
    });

    if (score.total < 40) {
      return null;
    }

    const decision: Decision = {
      traceId,
      accion: "PUSH_NOTIFICATION",
      nivel: score.total >= 70 ? "CRITICO" : "ALERTA",
      payload: {
        titulo: "Experiencia desbloqueada",
        mensaje: "Ruta secreta activada antes de salir",
        ruta_ar_activada: true,
      },
      score: score.total,
      factors: score.factors,
    };

    this.lastDecisionAt.set(t.id, started);
    this.eventBus.emit("isabella:decision", decision);

    decisionScore.observe(decision.score);
    decisionLatency.observe(this.clock.now() - started);

    return decision;
  }

  private wasRecentlyNotified(touristId: string, now: number): boolean {
    const previous = this.lastDecisionAt.get(touristId);
    if (!previous) return false;
    return now - previous < this.throttleMs;
  }

  private getNearestExit(coords: Coordenadas): Coordenadas | null {
    let nearest: Coordenadas | null = null;
    let bestDistance = Number.POSITIVE_INFINITY;

    for (const exit of this.exits) {
      const current = fastDistance(coords, exit);
      if (current < bestDistance) {
        bestDistance = current;
        nearest = exit;
      }
    }

    return nearest;
  }
}
