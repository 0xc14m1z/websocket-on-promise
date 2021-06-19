import WebSocket, { Server as WebSocketServer, Data } from "ws";
import { Method, Nullable, PlainObject, SimpleHandler } from "../utils";
import { InternalMessage } from "../InternalMessage.class";
import { Request } from "../Request.class";
import { Response } from "../Response.class";

export class Server {
  private socket: Nullable<WebSocketServer> = null;
  private handlers: Map<
    Method,
    Map<string, SimpleHandler<PlainObject, [body?: PlainObject]>>
  > = new Map([
    ["GET", new Map()],
    ["POST", new Map()],
    ["PUT", new Map()],
    ["DELETE", new Map()],
  ]);

  constructor(port: number) {
    this.socket = new WebSocketServer({ port });
    this.socket.on("connection", this.handleConnection.bind(this));
    this.socket.on("error", this.handleServerError.bind(this));
    this.socket.on("close", this.handleServerDisconnection.bind(this));
  }

  private handleConnection(client: WebSocket): void {
    console.log("handleConnection");

    client.on("close", this.handleClientDisconnection.bind(this));
    client.on("error", this.handleClientError.bind(this));
    client.on("message", this.handleMessage.bind(this, client));
  }

  private handleServerDisconnection(): void {
    console.log("handleServerDisconnection");
  }

  private handleServerError(): void {
    console.log("handleServerError");
  }

  private handleClientDisconnection(): void {
    console.log("handleClientDisconnection");
  }

  private handleClientError(): void {
    console.log("handleClientError");
  }

  private async handleMessage(
    client: WebSocket,
    rawMessage: Data
  ): Promise<void> {
    console.log("handleMessage", rawMessage);
    const message = InternalMessage.parse<Request>(rawMessage.toString());

    const methodHandlers = this.handlers.get(message.data.method);
    const handler = methodHandlers?.get(message.data.endpoint);

    if (handler) {
      // TODO: handle asynchronous responses
      const rawResponse = handler(message.data.body);

      const response = new Response(
        rawResponse instanceof Promise ? await rawResponse : rawResponse
      );

      const responseMessage = new InternalMessage(
        message.clientId,
        message.correlationToken,
        response
      );

      client.send(JSON.stringify(responseMessage.format()));
    }
  }

  public get(endpoint: string, handler: SimpleHandler<PlainObject>): void {
    this.handlers.get("GET")!.set(endpoint, handler);
  }
}
