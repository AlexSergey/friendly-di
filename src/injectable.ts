import type { Dependency } from './types';

import { counter } from './counter';

export function Injectable(): (target: Dependency) => void {
  return function (target: Dependency): void {
    Reflect.defineMetadata('injectableId', counter(), target);
  };
}
