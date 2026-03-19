import type { CivicEvent } from "./domain/events";

type Handler = (event: CivicEvent) => Promise<void> | void;

export class FederationBus {
  private handlers: Handler[] = [];

  subscribe(handler: Handler) {
    this.handlers.push(handler);
  }

  async publish(event: CivicEvent) {
    // TODO: conectar a Kafka / stream urbano real
    await Promise.all(this.handlers.map((h) => h(event)));
  }
}

export const federationBus = new FederationBus();
