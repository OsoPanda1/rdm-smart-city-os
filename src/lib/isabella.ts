import type { TuristaEstado } from "@/core/models";
import { ExperienceOrchestrator } from "@/orchestrator/experience.orchestrator";

const exits = [
  { lat: 20.14032, lng: -98.67156 },
  { lat: 20.13971, lng: -98.67411 },
];

export const isabellaOrchestrator = new ExperienceOrchestrator(exits);

export function evaluateTouristExperience(state: TuristaEstado) {
  return isabellaOrchestrator.evaluar(state);
}
