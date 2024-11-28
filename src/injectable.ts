import type { Dependency } from './types';

import { _injectableId } from './constants';

export const counter = (
  (c) => () =>
    c++
)(0);

export function Injectable(): (target: Dependency) => void {
  return function (target: Dependency): void {
    Reflect.defineMetadata(_injectableId, counter(), target);
  };
}
