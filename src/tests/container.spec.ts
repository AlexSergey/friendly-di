import 'reflect-metadata';

import { Container } from '../container';
import { Injectable } from '../injectable';
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

  it('Check get method: [UserService] => [OrderService] => [ProductService] will return OrderService', () => {
    const container = new Container(UserService);
    container.compile();
    const orderService = container.get(OrderService);

    expect(orderService.getOrdersForUser()).toStrictEqual(['product 1', 'product 2', 'product 3']);

    const container2 = new Container(UserService);
    container2.replace(OrderService, OrderServiceMock).compile();
    const orderService2 = container2.get(OrderServiceMock);

    expect(orderService2.getOrdersForUser()).toStrictEqual(['product 99', 'product 98', 'product 97']);
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

  it('Error case: use Container without Injectable decorator', () => {
    class A {
      test() {
        return 1;
      }
    }

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    expect(() => new Container({})).toThrow('The Container supports class only');
    expect(() => new Container(A)).toThrow('The root class must use @Injectable() decorator');
  });

  it('Error case: compile without root', () => {
    class A {
      test() {
        return 1;
      }
    }
    const container = new Container(UserService);
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    container._root = null;
    expect(() => container.compile()).toThrow('Need mount class before resolve');
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    container._root = {};
    expect(() => container.compile()).toThrow('The Container supports class only');
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    container._root = A;
    expect(() => container.compile()).toThrow('The root class must use @Injectable() decorator');
  });

  it('Error case: replace errors', () => {
    @Injectable()
    class B {
      test() {
        return 1;
      }
    }

    @Injectable()
    class A {
      constructor(private service: B) {}

      test() {
        return 1;
      }
    }

    class AA {
      constructor(private service: B) {}

      test() {
        return 1;
      }
    }

    class BB {
      test() {
        return 1;
      }
    }

    @Injectable()
    class Root {
      constructor(private service: A) {}

      test() {
        return 1;
      }
    }

    expect(() => new Container(Root).replace(AA, A)).toThrow(
      'The first argument must be a class with @Injectable() decorator',
    );

    expect(() => new Container(Root).replace(B, BB)).toThrow(
      'The second argument must be a class with @Injectable() decorator',
    );
  });

  it('Replace nested dependencies', () => {
    @Injectable()
    class User {
      user() {
        return 'user';
      }
    }

    @Injectable()
    class Dear {
      which() {
        return ' dear ';
      }
    }

    @Injectable()
    class Hello {
      hello() {
        return 'Hello';
      }
    }

    @Injectable()
    class Root {
      constructor(
        private hello: Hello,
        private dear: Dear,
        private user: User,
      ) {}

      run() {
        return this.hello.hello() + this.dear.which() + this.user.user();
      }
    }

    @Injectable()
    class Customer {
      user() {
        return 'customer';
      }
    }

    @Injectable()
    class Nested {
      constructor(private root: Root) {}
      getString() {
        return this.root.run();
      }
    }

    @Injectable()
    class GreetingsBuilder {
      constructor(private nested: Nested) {}
      build() {
        return 'greetings: ' + this.nested.getString();
      }
    }

    @Injectable()
    class NewGreetingsBuilder {
      constructor(private nested: Nested) {}

      build() {
        return 'new greetings: ' + this.nested.getString();
      }
    }

    @Injectable()
    class Hate {
      which() {
        return ' hated ';
      }
    }
    @Injectable()
    class Composite {
      constructor(private greetingsBuilder: GreetingsBuilder) {}
      init() {
        return this.greetingsBuilder.build();
      }
    }

    expect(new Container(Root).compile().run()).toBe('Hello dear user');
    expect(new Container(Root).replace(User, Customer).compile().run()).toBe('Hello dear customer');
    expect(new Container(Composite).compile().init()).toBe('greetings: Hello dear user');
    expect(
      new Container(Composite)
        .replace(Dear, Hate)
        .replace(User, Customer)
        .replace(GreetingsBuilder, NewGreetingsBuilder)
        .compile()
        .init(),
    ).toBe('new greetings: Hello hated customer');
  });

  it('Error case: get method raise error when we try to get undeclared dependency', () => {
    @Injectable()
    class B {
      test() {
        return 1;
      }
    }

    const container = new Container(UserService);
    container.compile();

    expect(() => container.get(B)).toThrow('Dependency 18 is not found');
  });

  it('Error case: get method raise error when we try to get dependency without @Injectable() decorator', () => {
    class B {
      test() {
        return 1;
      }
    }

    const container = new Container(UserService);
    container.compile();

    expect(() => container.get(B)).toThrow('Provided class must use @Injectable() decorator');
  });
});
