import { Method, PlainObject } from "./utils";

export class Request {
  constructor(
    public readonly method: Method,
    public readonly endpoint: string,
    public readonly body: PlainObject = {}
  ) {}
}
