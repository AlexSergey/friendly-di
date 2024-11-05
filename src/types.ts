// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Dependency = new (...args: any[]) => any;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Constructor<T> = new (...args: any[]) => T;

export type ClassMethods<T> = {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  [K in keyof T]: T[K] extends Function ? K : never;
}[keyof T];

export interface Replace {
  cls: Dependency;
  from: number;
  to: number;
}
