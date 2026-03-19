export type Federation =
  | "DEKATEOTL"
  | "ANUBIS"
  | "BOOKPI"
  | "PHOENIX"
  | "MDD_TAMV"
  | "KAOS"
  | "CHRONOS";

export interface CivicEvent<TPayload = unknown> {
  id: string;
  type:
    | "TOURISM_INTERACTION"
    | "DICHO_CONSULTED"
    | "PAYMENT_COMPLETED"
    | "ALERT_SECURITY"
    | "CITY_FEEDBACK"
    | "SYSTEM_METRIC";
  federation: Federation;
  payload: TPayload;
  occurredAt: string;
  source: "WEB_PORTAL" | "EDGE_NODE" | "MOBILE_APP" | "BACKOFFICE";
  correlationId?: string;
}
