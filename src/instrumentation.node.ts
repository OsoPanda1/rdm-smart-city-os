import { createTraceId } from "@/core/context/trace";

export async function withSpan<T>(name: string, fn: () => Promise<T> | T): Promise<T> {
  const traceId = createTraceId();
  const started = Date.now();

  try {
    return await fn();
  } finally {
    const elapsed = Date.now() - started;
    if (import.meta.env?.DEV) {
      console.debug(`[trace=${traceId}] span=${name} duration_ms=${elapsed}`);
    }
  }
}
