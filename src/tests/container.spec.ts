import 'reflect-metadata';

import { Container } from '../container';
import { OrderService } from './modules/order.service';
import { ProductService } from './modules/product.service';
import { UserService } from './modules/user.service';
import { OrderServiceMock } from './modules-mock/order.service.mock';
import { ProductServiceMock } from './modules-mock/product.service.mock';

describe('Container test cases', () => {
  it('Check correct deps chain: [UserService] => [OrderService] => [ProductService]', () => {
    const userService = new Container(UserService).compile();

    expect(userService.getUserOrders()).toStrictEqual(['product 1', 'product 2', 'product 3']);
  });
  it('Check mocked deps chain: [UserService] => [OrderServiceMock] => [ProductServiceMock]', () => {
    const userService = new Container(UserService).replace(OrderService, OrderServiceMock).compile();

    expect(userService.getUserOrders()).toStrictEqual(['product 99', 'product 98', 'product 97']);
  });
  it('Check mocked deps chain: [UserService] => [OrderServiceMock] => [ProductMock]', () => {
    const userService = new Container(UserService)
      .replace(OrderService, OrderServiceMock)
      .replace(ProductServiceMock, ProductService)
      .compile();

    expect(userService.getUserOrders()).toStrictEqual(['product 1', 'product 2', 'product 3']);
  });
  it('Use Container without Injectable decorator', () => {
    class A {
      test() {
        return 1;
      }
    }
    expect(() => new Container(A)).toThrow('The root class must use @Injectable() decorator');
  });
});
