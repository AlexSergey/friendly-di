import 'reflect-metadata';

import { Injectable } from '../injectable';

@Injectable()
class Test {}

@Injectable()
class Test2 {}

describe('Test injectable decorator', () => {
  it('Reflect metadata must contain injectable id', () => {
    const injectableId = Reflect.getMetadata('injectableId', Test);
    expect(typeof injectableId).toEqual('number');
    expect(injectableId).toEqual(0);
  });
  it('Reflect metadata must contain injectable id with the following index', () => {
    const injectableId = Reflect.getMetadata('injectableId', Test2);
    expect(typeof injectableId).toEqual('number');
    expect(injectableId).toEqual(1);
  });
});
