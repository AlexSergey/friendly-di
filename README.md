<p align="center">
  <img alt="Friendly DI" src="https://www.natrube.net/friendly-di/friendly-di.png">
</p>

**Friendly DI** is light and fast Inversion Of Control Container based on Reflect metadata inspired by Angular and Nest DI systems.

**Friendly DI** is very versatile tool. You can use it in Node.js projects (express, koa, whatever), in the Browser (pure JS projects, React projects etc.).

**Benefits:**

- 2kb size without dependencies
- Works the same in the Browser and Node.js
- Very simple API

***

## Problematics

In object-oriented programming, the Dependency Inversion Principle plays a key role in developing clean, extensible, and
easily testable code.

Suppose we have a simple set of classes that interact with each other:

- *A user can order products in our store.*

How it might look:

We have 3 classes:

[UserService] ---> [OrderService] ---> [ProductService]

```ts
class UserService {
  constructor() {
    this.orderService = new OrderService();
  }

  getUserOrders() {
    return this.orderService.getOrdersForUser();
  }
}

class OrderService {
  constructor() {
    this.productService = new ProductService();
  }

  getOrdersForUser() {
    return this.productService.getProducts();
  }
}

class ProductService {
  getProducts() {
    return ['product 1', 'product 2', 'product 3'];
  }
}
```

This code has a strong coupling between classes. We specify dependencies directly. This approach makes it difficult to
test this code if we need to replace, for example, a service that communicates with a database, or replace a class if we
need to use an adapter for another type of product.

***

## Solution

IoC Container pattern helps to solve the problem of tightly coupled dependencies. The idea behind this approach
is that a class does not depend on another class directly, but depends on an interface. Thus, if there is a need to
replace one of the dependencies, it is enough for the declare dependency with the same interfaces into the IoC Container.

<p align="center">
  <img alt="IoC Diagram" src="https://www.natrube.net/friendly-di/ioc-diagram.png">
</p>

- Classes are linked via interfaces
- IoC Container registers dependencies
- When a class is extracted from a container, it will have all declared or substituted dependencies

## Usage

**Friendly DI** based the same idea as Angular DI has and NestJS DI has. We used interfaces in the constructor and Container establish connection from real instances and interfaces via metadata.

**Friendly DI** has Typescript metadata support. It's not possible to run it without Typescript.

1. Installation:

```shell
npm i friendly-di reflect-metadata
```

2. Add 2 lines in *tsconfig.json*:

```json
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
```

3. Add Injectable decorator to each class and declare dependencies in constructor:

```ts
import { Injectable } from 'friendly-di';

@Injectable()
export class UserService {
  constructor(private orderService: OrderService) {}

  getUserOrders() {
    return this.orderService.getOrdersForUser();
  }
}

@Injectable()
class OrderService {
  constructor(private productService: ProductService) {}

  getOrdersForUser() {
    return this.productService.getProducts();
  }
}

@Injectable()
class ProductService {
  getProducts() {
    return ['product 1', 'product 2', 'product 3'];
  }
}
```

4. Declare container and root class:

```ts
const userService = new Container(UserService).compile();

userService.getUserOrders() // 'product 1', 'product 2', 'product 3'
```

## Use Cases

Let's override ProductService in our code:

```ts
import { Injectable } from 'friendly-di';

@Injectable()
export class UserService {
  constructor(private orderService: OrderService) {
  }

  getUserOrders() {
    return this.orderService.getOrdersForUser();
  }
}

@Injectable()
class OrderService {
  constructor(private productService: ProductService) {
  }

  getOrdersForUser() {
    return this.productService.getProducts();
  }
}

@Injectable()
class ProductService {
  getProducts() {
    return ['product 1', 'product 2', 'product 3'];
  }
}
```

1. We need to make mocked class with the same interface:

```ts
@Injectable()
class MockProductService {
  getProducts() {
    return ['new product 1', 'new product 2', 'new product 3'];
  }
}
```

2. When we declare container with root we also can replace classes:

```ts
const userService = new Container(UserService)
  .replace(ProductService, MockProductService)
  .compile();

userService.getUserOrders() // 'new product 1', 'new product 2', 'new product 3'
```

*replace* method receives 2 arguments: Replaceable class, Class to be replaced.

Method *replace* is chainable, so we can make replace many times:

```ts
const userService = new Container(UserService)
  .replace(ProductService, MockProductService)
  .replace(OrderService, MockOrderService)
  .compile();

userService.getUserOrders() // 'new product 1', 'new product 2', 'new product 3'
```

## Alternatives

If you use projects like Angular, NestJS... I congratulate you! You don't need **friendly-di**, as there is already a great and very similar DI system there.

[Inversify](https://github.com/inversify/InversifyJS/tree/master) - The most popular IoC Container library in JS.The
downside is that you'll have to write a lot of boilerplate code. It has a large number of features that may be specific
to large projects.

## The MIT License

Copyright (c) Sergey Aleksandrov

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated
documentation files (the “Software”), to deal in the Software without restriction, including without limitation the
rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit
persons to whom the Software is furnished to do so, subject to the following conditions:

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE
WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
