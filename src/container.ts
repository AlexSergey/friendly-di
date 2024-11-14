import type { ClassMethods, Constructor, Dependency, Replace } from './types';

import { counter } from './injectable';

function isClass(v: Dependency): boolean {
  return typeof v === 'function' && /^\s*class/.test(v.toString());
}

export class Container<T extends Dependency> {
  _dependencies: InstanceType<Dependency>[] = [];
  _replaces: Replace[] = [];
  _root: T;

  constructor(root: T) {
    if (!isClass(root)) {
      throw new Error('The Container supports class only');
    }

    const diId = Reflect.getMetadata('injectableId', root);

    if (typeof diId !== 'number') {
      throw new Error('The root class must use @Injectable() decorator');
    }

    this._root = root;

    return this;
  }

  _build(deps: Dependency[]): this {
    deps.map((target) => {
      const injectableId =
        typeof Reflect.getMetadata('injectableId', target) === 'number'
          ? Reflect.getMetadata('injectableId', target)
          : counter();

      const paramTypes = Reflect.getMetadata('design:paramtypes', target) || [];

      const childrenDep = paramTypes.map((paramType: Dependency): InstanceType<Dependency> | undefined => {
        const injectableId =
          typeof Reflect.getMetadata('injectableId', paramType) === 'number'
            ? Reflect.getMetadata('injectableId', paramType)
            : counter();
        const needToReplace = this._replaces.find((d) => d.from === injectableId);

        this._build([needToReplace ? needToReplace.cls : paramType]);

        if (!this._dependencies[needToReplace ? needToReplace.to : injectableId]) {
          this._dependencies[needToReplace ? needToReplace.to : injectableId] = new paramType();

          return this._dependencies[needToReplace ? needToReplace.to : injectableId];
        }

        return this._dependencies[needToReplace ? needToReplace.to : injectableId];
      });

      const needToReplace = this._replaces.find((d) => d.from === injectableId);

      if (!this._dependencies[needToReplace ? needToReplace.to : injectableId]) {
        this._dependencies[needToReplace ? needToReplace.to : injectableId] = needToReplace
          ? new needToReplace.cls(...childrenDep)
          : new target(...childrenDep);
      }
    });

    return this;
  }

  compile(): InstanceType<T> {
    if (!this._root) {
      throw new Error('Need mount class before resolve');
    }

    if (!isClass(this._root)) {
      throw new Error('The Container supports class only');
    }

    const diId = Reflect.getMetadata('injectableId', this._root);

    if (typeof diId !== 'number') {
      throw new Error('The root class must use @Injectable() decorator');
    }

    this._build([this._root]);

    const dep = this._dependencies[diId];

    this._replaces = [];

    if (!dep) {
      throw new Error(`Dependency ${diId} not found`);
    }

    return dep as never as InstanceType<T>;
  }

  public get<T extends Dependency>(cls: T): InstanceType<T> {
    const diId = Reflect.getMetadata('injectableId', cls);

    if (typeof diId !== 'number') {
      throw new Error('Provided class must use @Injectable() decorator');
    }

    const dep = this._dependencies[diId];

    if (!dep) {
      throw new Error(`Dependency ${diId} is not found`);
    }

    return dep;
  }

  replace<
    T1,
    T2 extends {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      [K in ClassMethods<T1>]: T1[K] extends (...args: any[]) => any
        ? (...args: Parameters<T1[K]>) => ReturnType<T1[K]>
        : T1[K];
    },
  >(from: Constructor<T1>, to: Constructor<T2>): this {
    const injectableIdFrom = Reflect.getMetadata('injectableId', from);
    const injectableIdTo = Reflect.getMetadata('injectableId', to);

    if (typeof injectableIdFrom !== 'number') {
      throw new Error('The first argument must be a class with @Injectable() decorator');
    }
    if (typeof injectableIdTo !== 'number') {
      throw new Error('The second argument must be a class with @Injectable() decorator');
    }

    this._replaces.push({
      cls: to,
      from: injectableIdFrom,
      to: injectableIdTo,
    });

    return this;
  }
}
