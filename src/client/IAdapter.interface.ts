import { PlainObject } from "../utils";

export interface IAdapter {
  connect(): void;
  send(message: PlainObject): void;

  onConnect(handler: () => void): IAdapter;
  onDisconnect(handler: () => void): IAdapter;
  onError(handler: () => void): IAdapter;
  onMessage(handler: (message: string) => void): IAdapter;

  isConnected: boolean;
}
