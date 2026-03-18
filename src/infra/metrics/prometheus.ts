type Labels = Record<string, string>;

class Counter {
  private data = new Map<string, number>();

  constructor(public name: string, public help: string) {}

  inc(labels: Labels = {}, value = 1) {
    const key = JSON.stringify(labels);
    const previous = this.data.get(key) ?? 0;
    this.data.set(key, previous + value);
  }

  snapshot() {
    return [...this.data.entries()].map(([labels, value]) => ({ labels: JSON.parse(labels), value }));
  }
}

class Gauge {
  private value = 0;

  constructor(public name: string, public help: string) {}

  inc() {
    this.value += 1;
  }

  dec() {
    this.value -= 1;
  }

  set(value: number) {
    this.value = value;
  }

  snapshot() {
    return this.value;
  }
}

class Histogram {
  private observations: number[] = [];

  constructor(public name: string, public help: string, private buckets: number[]) {}

  observe(value: number) {
    this.observations.push(value);
  }

  snapshot() {
    const counts = this.buckets.map((bucket) => ({ le: bucket, count: this.observations.filter((v) => v <= bucket).length }));
    return {
      count: this.observations.length,
      sum: this.observations.reduce((acc, curr) => acc + curr, 0),
      buckets: counts,
    };
  }
}

class Registry {
  private metrics = new Map<string, Counter | Gauge | Histogram>();

  registerMetric(metric: Counter | Gauge | Histogram) {
    this.metrics.set(metric.name, metric);
  }

  async metricsText() {
    const lines: string[] = [];

    for (const metric of this.metrics.values()) {
      lines.push(`# HELP ${metric.name} ${metric.help}`);
      if (metric instanceof Counter) {
        lines.push(`# TYPE ${metric.name} counter`);
        const entries = metric.snapshot();
        for (const entry of entries) {
          const labels = Object.entries(entry.labels)
            .map(([k, v]) => `${k}="${v}"`)
            .join(",");
          lines.push(`${metric.name}{${labels}} ${entry.value}`);
        }
      } else if (metric instanceof Gauge) {
        lines.push(`# TYPE ${metric.name} gauge`);
        lines.push(`${metric.name} ${metric.snapshot()}`);
      } else {
        lines.push(`# TYPE ${metric.name} histogram`);
        const snap = metric.snapshot();
        for (const bucket of snap.buckets) {
          lines.push(`${metric.name}_bucket{le="${bucket.le}"} ${bucket.count}`);
        }
        lines.push(`${metric.name}_count ${snap.count}`);
        lines.push(`${metric.name}_sum ${snap.sum}`);
      }
    }

    return lines.join("\n");
  }
}

export const register = new Registry();

export const decisionLatency = new Histogram(
  "decision_latency_ms",
  "Latencia de decisiones del motor territorial",
  [10, 25, 50, 100, 200, 500],
);

export const decisionScore = new Histogram(
  "decision_score",
  "Distribución del score calculado por turista",
  [0, 20, 40, 60, 80, 100],
);

export const reviews = new Counter("reviews_total", "Volumen de reseñas por territorio y polaridad");

export const consentEvents = new Counter("consent_events_total", "Total de eventos de consentimiento");

export const streamConnections = new Gauge("sse_connections", "Conexiones SSE activas");

register.registerMetric(decisionLatency);
register.registerMetric(decisionScore);
register.registerMetric(reviews);
register.registerMetric(consentEvents);
register.registerMetric(streamConnections);
