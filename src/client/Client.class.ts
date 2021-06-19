import { nanoid } from "nanoid";
import { InternalMessage } from "../InternalMessage.class";
import { Request } from "../Request.class";

import { PlainObject } from "../utils";
import { IAdapter } from "./IAdapter.interface";
import { PendingRequests } from "./PendingRequests.class";

export class Client {
  private pendingRequests = new PendingRequests();
  private queuedRequests: InternalMessage<Request>[] = [];

  private clientId: string;

  constructor(
    private adapter: IAdapter,
    public readonly timeout: number = 5000
  ) {
    this.clientId = nanoid();
    this.setupAdapter(this.adapter).connect();
  }

  private setupAdapter(adapter: IAdapter) {
    return adapter
      .onConnect(this.handleConnection.bind(this))
      .onDisconnect(this.handleDisconnection.bind(this))
      .onError(this.handleError.bind(this))
      .onMessage(this.handleMessage.bind(this));
  }

  private handleConnection(): void {
    console.log("handleConnection");

    if (this.queuedRequests.length) {
      while (this.queuedRequests.length > 0) {
        this.adapter.send(this.queuedRequests[0].format());
        this.queuedRequests.splice(0, 1);
      }
    }
  }

  private handleDisconnection(): void {
    console.log("handleDisconnection");
  }

  private handleError(): void {
    console.log("handleError");
  }

  private handleMessage(rawMessage: string): void {
    // console.log("handleMessage", rawMessage);
    try {
      const message = InternalMessage.parse(rawMessage);
      this.pendingRequests.fulfill(message.correlationToken, message.data.body);
    } catch (_) {
      console.error("handleMessage", rawMessage);
      // let's ignore malformed messages
    }
  }

  private async send<DTO>(request: Request): Promise<DTO> {
    /**
     * TODO: queue messages when not connected yet
     */

    const correlationToken = nanoid();
    const message = new InternalMessage(
      this.clientId,
      correlationToken,
      request
    );

    if (this.adapter.isConnected) {
      this.adapter.send(message.format());
    } else {
      this.queuedRequests.push(message);
    }

    return new Promise<DTO>((resolve, reject) => {
      this.pendingRequests.add(correlationToken, resolve, reject, this.timeout);
    });
  }

  public get<DTO>(endpoint: string): Promise<DTO> {
    return this.send<DTO>(new Request("GET", endpoint));
  }

  public post<DTO>(endpoint: string, body: PlainObject = {}): Promise<DTO> {
    return this.send<DTO>(new Request("POST", endpoint, body));
  }

  public put<DTO>(endpoint: string, body: PlainObject = {}): Promise<DTO> {
    return this.send<DTO>(new Request("PUT", endpoint, body));
  }

  public delete<DTO>(endpoint: string): Promise<DTO> {
    return this.send<DTO>(new Request("DELETE", endpoint));
  }
}
