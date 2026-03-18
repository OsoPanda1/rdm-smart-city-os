export type Listener<T = unknown> = (payload: T) => void | Promise<void>;

interface QueuedEvent {
  event: string;
  payload: unknown;
}

export class EventBus {
  private listeners = new Map<string, Set<Listener>>();
  private queue: QueuedEvent[] = [];
  private processing = false;
  private dropped = 0;

  constructor(private maxQueue = 1000) {}

  on(event: string, fn: Listener) {
    if (!this.listeners.has(event)) this.listeners.set(event, new Set());
    this.listeners.get(event)?.add(fn);
  }

  off(event: string, fn: Listener) {
    this.listeners.get(event)?.delete(fn);
  }

  emit(event: string, payload: unknown) {
    if (this.queue.length >= this.maxQueue) {
      this.dropped += 1;
      return false;
    }

    this.queue.push({ event, payload });
    void this.process();
    return true;
  }

  getDroppedCount() {
    return this.dropped;
  }

  private async process() {
    if (this.processing) return;
    this.processing = true;

    while (this.queue.length) {
      const current = this.queue.shift();
      if (!current) continue;

      const set = this.listeners.get(current.event);
      if (!set) continue;

      for (const fn of set) {
        try {
          await fn(current.payload);
        } catch {
          // No-op: listeners are isolated to avoid cascade failures.
        }
      }
    }

    this.processing = false;
  }
}

export const bus = new EventBus();
