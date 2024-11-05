import 'reflect-metadata';

import { Injectable } from '../injectable';

@Injectable()
class Test {}

describe('Test injectable decorator', () => {
  it('Reflect metadata must contain injectable id', () => {
    const injectableId = Reflect.getMetadata('injectableId', Test);
    expect(typeof injectableId).toEqual('number');
    expect(injectableId).toEqual(0);
  });
});
