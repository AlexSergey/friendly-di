import { counter } from '../counter';

describe('Counter', () => {
  it('get initial value 0', () => {
    expect(counter()).toBe(0);
  });
  it('increase value to 1', () => {
    expect(counter()).toBe(1);
  });
});
