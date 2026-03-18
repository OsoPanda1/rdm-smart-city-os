import { consentEvents, reviews } from "@/infra/metrics/prometheus";

const ALLOWED_TERRITORIES = new Set(["RDM", "PACHUCA", "HIDALGO"]);

function sanitizeTerritory(raw?: string) {
  const normalized = (raw ?? "RDM").toUpperCase().slice(0, 24);
  return ALLOWED_TERRITORIES.has(normalized) ? normalized : "RDM";
}

export async function POST(req: Request) {
  const body = await req.json();
  const territory = sanitizeTerritory(body.territory);

  if (typeof body.rating === "number") {
    const type = body.rating >= 4 ? "positive" : body.rating <= 2 ? "negative" : "neutral";
    reviews.inc({ territory, type });
  }

  if (typeof body.consent === "boolean") {
    consentEvents.inc({ territory, status: body.consent ? "granted" : "denied" });
  }

  return new Response(JSON.stringify({ ok: true }), {
    headers: { "Content-Type": "application/json" },
  });
}
