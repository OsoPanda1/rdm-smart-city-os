import { Kafka, type Producer } from "kafkajs";
import { randomUUID } from "node:crypto";
import { persistEvent } from "./event-store";
import type { CivicEvent } from "./types";

let producer: Producer | null = null;

async function getProducer() {
  if (producer) return producer;

  const broker = process.env.KAFKA_BROKER;
  if (!broker) {
    throw new Error("KAFKA_BROKER is not configured");
  }

  const kafka = new Kafka({ clientId: "tamv-os", brokers: [broker] });
  producer = kafka.producer();
  await producer.connect();
  return producer;
}

export async function publishEvent(event: Partial<CivicEvent>): Promise<CivicEvent> {
  if (!event.type || !event.federation || !event.source) {
    throw new Error("event.type, event.federation and event.source are required");
  }

  const enriched: CivicEvent = {
    id: event.id ?? randomUUID(),
    type: event.type,
    federation: event.federation,
    payload: event.payload ?? {},
    occurredAt: event.occurredAt ?? new Date().toISOString(),
    source: event.source,
    correlationId: event.correlationId,
  };

  await persistEvent(enriched);

  const connectedProducer = await getProducer();
  await connectedProducer.send({
    topic: "tamv-events",
    messages: [{ value: JSON.stringify(enriched) }],
  });

  return enriched;
}
