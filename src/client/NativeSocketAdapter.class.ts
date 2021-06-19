import { noOp, Nullable, SimpleHandler } from "../utils";
import { InternalMessage } from "../InternalMessage.class";
import { Request } from "../Request.class";
import { IAdapter } from "./IAdapter.interface";

export class NativeSocketAdapter implements IAdapter {
  private websocket: Nullable<WebSocket> = null;

  private onConnectHandler: SimpleHandler = noOp;
  private onDisconnectHandler: SimpleHandler = noOp;
  private onErrorHandler: SimpleHandler = noOp;
  private onMessageHandler: SimpleHandler<void, [message: string]> = noOp;

  constructor(private host: string) {}

  public connect(): void {
    this.websocket = new WebSocket(this.host);
    this.websocket.addEventListener("open", this.onConnectHandler);
    this.websocket.addEventListener("close", this.onDisconnectHandler);
    this.websocket.addEventListener("error", this.onErrorHandler);
    this.websocket.addEventListener("message", this.handleMessage.bind(this));
  }

  public onConnect(handler: SimpleHandler): IAdapter {
    this.onConnectHandler = handler;
    return this;
  }

  public onDisconnect(handler: SimpleHandler): IAdapter {
    this.onDisconnectHandler = handler;
    return this;
  }

  public onError(handler: SimpleHandler): IAdapter {
    this.onErrorHandler = handler;
    return this;
  }

  public onMessage(handler: SimpleHandler<void, [message: string]>): IAdapter {
    this.onMessageHandler = handler;
    return this;
  }

  public send(message: InternalMessage<Request>): void {
    this.websocket!.send(JSON.stringify(message));
  }

  public get isConnected(): boolean {
    return Boolean(this.websocket?.readyState === this.websocket?.OPEN);
  }

  private handleMessage(message: MessageEvent): void {
    this.onMessageHandler(message.data);
  }
}
