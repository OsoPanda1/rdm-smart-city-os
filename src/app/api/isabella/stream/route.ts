import { bus } from "@/core/infra/event-bus";
import { streamConnections } from "@/infra/metrics/prometheus";

const HEARTBEAT_MS = 25_000;
const RETRY_MS = 3_000;

export async function GET() {
  let eventId = 0;

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      const encoder = new TextEncoder();
      streamConnections.inc();

      const send = (data: unknown) => {
        controller.enqueue(
          encoder.encode(`id:${eventId++}\nretry:${RETRY_MS}\ndata:${JSON.stringify(data)}\n\n`),
        );
      };

      const listener = (payload: unknown) => send(payload);
      bus.on("isabella:decision", listener);

      const keepAlive = setInterval(() => {
        controller.enqueue(encoder.encode(`:heartbeat ${Date.now()}\n\n`));
      }, HEARTBEAT_MS);

      controller.enqueue(encoder.encode(`event:ready\ndata:{"ok":true}\n\n`));

      return () => {
        clearInterval(keepAlive);
        bus.off("isabella:decision", listener);
        streamConnections.dec();
      };
    },
    cancel() {
      streamConnections.dec();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
