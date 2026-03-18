export interface Coordenadas {
  lat: number;
  lng: number;
}

export interface TuristaEstado {
  id: string;
  coords: Coordenadas;
  prevCoords?: Coordenadas;
  stayTimeHours: number;
  activityTimestamps: {
    lastInteractionAt: Date;
  };
}

export type DecisionLevel = "CRITICO" | "ALERTA";

export interface Decision {
  traceId: string;
  accion: "PUSH_NOTIFICATION";
  nivel: DecisionLevel;
  payload: {
    titulo: string;
    mensaje: string;
    ruta_ar_activada: boolean;
  };
  score: number;
  factors: Record<string, number>;
}
