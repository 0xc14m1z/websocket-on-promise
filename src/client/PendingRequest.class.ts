import { PlainObject } from "../utils";

export class PendingRequest {
  constructor(
    private resolveHandler: Function,
    private rejectHandler: Function
  ) {}

  public respondWith(message: PlainObject): void {
    this.resolveHandler(message);
  }

  public cancel(): void {
    this.rejectHandler();
  }
}
