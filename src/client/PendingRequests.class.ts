import { PlainObject } from "../utils";
import { PendingRequest } from "./PendingRequest.class";

export class PendingRequests {
  private requests: Map<string, PendingRequest> = new Map();
  private timers: Map<string, number> = new Map();

  public add(
    correlationToken: string,
    resolve: Function,
    reject: Function,
    timeout: number
  ): void {
    const request = new PendingRequest(resolve, reject);
    const timer = setTimeout(this.cancel.bind(this), timeout, correlationToken);

    this.requests.set(correlationToken, request);
    this.timers.set(correlationToken, timer);
  }

  public fulfill(correlationToken: string, response: PlainObject): void {
    const request = this.requests.get(correlationToken);
    request?.respondWith(response);
    this.remove(correlationToken);
  }

  private cancel(correlationToken: string): void {
    const request = this.requests.get(correlationToken);
    request?.cancel();
    this.remove(correlationToken);
  }

  private remove(correlationToken: string): void {
    this.requests.delete(correlationToken);

    const timer = this.timers.get(correlationToken);
    if (timer) {
      clearTimeout(timer);
      this.timers.delete(correlationToken);
    }
  }
}
