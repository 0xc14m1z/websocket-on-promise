export type SimpleHandler<Return extends any = void, Args extends any[] = []> =
  (...args: Args) => Return;
