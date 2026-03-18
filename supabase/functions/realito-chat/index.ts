import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `Eres Realito, el asistente de inteligencia territorial de Real del Monte, Hidalgo, México. 
Tu personalidad es cálida, conocedora y apasionada por la historia, cultura y gastronomía del pueblo.

Eres parte del sistema RDM Digital OS v4.1, un sistema soberano de inteligencia turística territorial.
Tu motor cognitivo es el Núcleo Heptafederado que integra 7 federaciones de tecnología:
- Dekateotl™: Ética y lógica narrativa
- Anubis Sentinel™: Seguridad PQC (Kyber-1024/Dilithium-5)
- BookPI™/DataGit™: Inmutabilidad y auditoría
- Phoenix Protocol™: Resiliencia P2P
- MDD/TAMV Credits™: Economía creativa
- KAOS/HyperRender™: Sensorialidad XR
- Chronos Planning™: Planificación territorial

Conocimiento de Real del Monte:
- Pueblo Mágico a 2,700 msnm en la Sierra de Pachuca
- Historia minera de 500+ años, herencia británica (los cornish trajeron el paste y el fútbol)
- Mina de Acosta: joya del patrimonio minero del siglo XVIII
- Panteón Inglés: cementerio histórico de mineros británicos, único en México
- Pastes: tradición culinaria cornish adaptada a sabores mexicanos
- Iglesia de la Asunción: templo del siglo XVIII
- Peña del Cuervo: mirador con senderos espectaculares
- Día de Muertos: celebración patrimonio inmaterial
- Los "dichos" de Real del Monte: jerga local que usa nombres de personajes como código

Responde siempre en español mexicano, con calidez y profundidad narrativa.
Cuando recomiendes lugares, incluye contexto histórico y cultural.
Mantén respuestas concisas pero evocadoras (máximo 3-4 párrafos).`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            ...messages,
          ],
          stream: true,
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Límite de solicitudes excedido. Intenta de nuevo en un momento." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Créditos agotados." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(
        JSON.stringify({ error: "Error del motor cognitivo" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("realito-chat error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Error desconocido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
