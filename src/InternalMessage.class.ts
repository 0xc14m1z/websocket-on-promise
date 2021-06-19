import { Request } from "./Request.class";
import { Response } from "./Response.class";

export class InternalMessage<Data extends Request | Response> {
  constructor(
    public readonly clientId: string,
    public readonly correlationToken: string,
    public readonly data: Data
  ) {}

  public format() {
    return {
      clientId: this.clientId,
      correlationToken: this.correlationToken,
      data: this.data,
    };
  }

  public static parse<Data extends Request | Response>(
    rawMessage: string
  ): InternalMessage<Data> {
    const { clientId, correlationToken, data } = JSON.parse(rawMessage);
    return new InternalMessage(clientId, correlationToken, data as Data);
  }
}
