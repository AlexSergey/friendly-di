import type { ClassMethods, Constructor, Dependency, Replace } from './types';

export class Container<T extends Dependency> {
  _dependencies: InstanceType<Dependency>[] = [];
  _replaces: Replace[] = [];
  _root: T;

  constructor(root: T) {
    const diId = Reflect.getMetadata('injectableId', root);

    if (typeof diId !== 'number') {
      throw new Error('The root class must use @Injectable() decorator');
    }

    this._root = root;

    return this;
  }

  _build(deps: Dependency[]): this {
    deps.map((target) => {
      const injectableId = Reflect.getMetadata('injectableId', target);

      if (typeof injectableId !== 'number') return;

      // get the typeof parameters of constructor
      const paramTypes = Reflect.getMetadata('design:paramtypes', target) || [];
      // resolve dependencies of current dependency
      const childrenDep = paramTypes.map((paramType: Dependency): InstanceType<Dependency> | undefined => {
        const injectableId = Reflect.getMetadata('injectableId', paramType);
        const needToReplace = this._replaces.find((d) => d.from === injectableId);
        // recursively resolve all child dependencies:
        this._build([needToReplace ? needToReplace.cls : paramType]);

        if (!this._dependencies[needToReplace ? needToReplace.to : injectableId]) {
          this._dependencies[needToReplace ? needToReplace.to : injectableId] = new paramType();

          return this._dependencies[needToReplace ? needToReplace.to : injectableId];
        }

        return this._dependencies[needToReplace ? needToReplace.to : injectableId];
      });

      const needToReplace = this._replaces.find((d) => d.from === injectableId);
      // resolve dependency by injection child classes that already resolved
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

    this._build([this._root]);

    const diId = Reflect.getMetadata('injectableId', this._root);

    if (typeof diId !== 'number') {
      throw new Error('The root class must use @Injectable() decorator');
    }

    const dep = this._dependencies[diId];

    if (!dep) {
      throw new Error(`Dependency ${diId} not found`);
    }

    return dep as never as InstanceType<T>;
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

    if (typeof injectableIdFrom !== 'number') return this;
    if (typeof injectableIdTo !== 'number') return this;

    this._replaces.push({
      cls: to,
      from: injectableIdFrom,
      to: injectableIdTo,
    });

    return this;
  }
}
