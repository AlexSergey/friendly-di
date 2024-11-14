import type { Dependency } from './types';

export const counter = (
  (c) => () =>
    c++
)(0);

export function Injectable(): (target: Dependency) => void {
  return function (target: Dependency): void {
    Reflect.defineMetadata('injectableId', counter(), target);
  };
}
