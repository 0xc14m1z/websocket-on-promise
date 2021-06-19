import { PlainObject } from "./utils";

export class Response {
  constructor(public readonly body: PlainObject = {}) {}
}
