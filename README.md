<p align="center">
  <img alt="Friendly DI" src="https://www.natrube.net/friendly-di/friendly-di.png">
</p>

[![Version](https://img.shields.io/npm/v/friendly-di.svg?color=rgb(237,18,182)&labelColor=26272b)](https://www.npmjs.com/package/friendly-di)
[![GitHub License](https://img.shields.io/badge/license-MIT-232428.svg?color=rgb(237,18,182)&labelColor=26272b)](https://www.npmjs.com/package/friendly-di)

**Friendly DI** is light and fast Inversion Of Control Container based on Reflect metadata inspired by Angular and Nest DI systems.

**Friendly DI** is very versatile tool. You can use it in Node.js projects (express, koa, whatever), in the Browser (pure JS projects, React projects etc.).

**Benefits:**

- **Small size**: Just 2 KB with no external dependencies.
- **Cross-platform**: Works seamlessly in both the browser and Node.js environments.
- **Simple API**: Intuitive and easy to use, with minimal configuration.
- **MIT License**: Open-source with permissive licensing.

***

## How it works

IoC Container pattern helps to solve the problem of tightly coupled dependencies. The idea behind this approach
is that a class does not depend on another class directly, but depends on an interface. Thus, if there is a need to
replace one of the dependencies, it is enough for the declare dependency with the same interfaces into the IoC Container.

<p align="center">
  <img alt="IoC Diagram" src="https://www.natrube.net/friendly-di/ioc-diagram.png">
</p>

- Classes are linked via interfaces
- IoC Container registers dependencies
- When a class is extracted from a container, it will have all declared or substituted dependencies

If you wanna deep dive into Dependency Injection vs Dependency Inversion principle vs Inversion Of Control etc please
reach the link with article:

[Mastering the Dependency Inversion Principle: Best Practices for Clean Code with DI](https://dev.to/alexsergey/mastering-the-dependency-inversion-principle-best-practices-for-clean-code-with-di-5c0k)

## Usage

**Friendly DI** based the same idea as Angular DI has and NestJS DI has. We used interfaces in the constructor and Container establish connection from real instances and interfaces via metadata.

**Friendly DI** has Typescript metadata support. It's not possible to run it without Typescript.

1. Installation:

```shell
npm i friendly-di reflect-metadata
```

2. Add 2 lines in *tsconfig.json*:

```json
{
  "compilerOptions": {
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  }
}

```

3. Add Injectable decorator to each class and declare dependencies in constructor:

*! Important:*

It is recommended to containerize the root of your application to comply with the [composition root](https://blog.ploeh.dk/2011/07/28/CompositionRoot/)
to avoid the [service locator](https://blog.ploeh.dk/2010/02/03/ServiceLocatorisanAnti-Pattern/) anti-pattern.
In this example *class App* is our composition root.

<p align="center">
  <img alt="Friendly DI Diagram" src="https://www.natrube.net/friendly-di/4.png">
</p>

```ts
import 'reflect-metadata';
import { Injectable, Container } from 'friendly-di';

@Injectable()
class ProductService {
  getProducts() {
    return ['product 1', 'product 2', 'product 3'];
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
class UserService {
  constructor(private orderService: OrderService) {
  }

  getUserOrders() {
    return this.orderService.getOrdersForUser();
  }
}


@Injectable()
class App {
  constructor(private userService: UserService) {
  }

  run() {
    return this.userService.getUserOrders();
  }
}
```

4. Declare container and root class:

```ts
const app = new Container(App).compile();

app.run() // 'product 1', 'product 2', 'product 3'
```

## Use Cases

If we need to mock nested dependencies we should:

1. Make mock-class with similar interface:

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
const app = new Container(App)
  .replace(ProductService, MockProductService)
  .compile();

app.run() // 'new product 1', 'new product 2', 'new product 3'
```

*replace* method receives 2 arguments: Replaceable class, Class to be replaced.

Method *replace* is chainable, so we can make replace many times:

```ts
const app = new Container(App)
  .replace(ProductService, MockProductService)
  .replace(OrderService, MockOrderService)
  .compile();

app.run() // 'new product 1', 'new product 2', 'new product 3'
```

## Limitations

### TSX issue

Currently, **friendly-di** has problems with [tsx](https://github.com/privatenumber/tsx) usage. If you need use **friendly-di** in Node.js project please use *ts-node/esm* loader:

```shell
node --loader ts-node/esm index.ts
```

### Interfaces Dependency

**friendly-di** does not support interface as a dependency. Please use classes:

*Wrong*

```ts
interface ProductServiceInterface {
  getProducts(): string[];
}
@Injectable()
class OrderService {
  constructor(private productService: ProductServiceInterface) {
  }

  getOrdersForUser() {
    return this.productService.getProducts();
  }
}
```

*Correct*

```ts
@Injectable()
class ProductService {
  getProducts() {
    return ['product 1', 'product 2', 'product 3'];
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
```

## Alternatives

If you use projects like Angular, NestJS... I congratulate you! You don't need **friendly-di**, as there is already a great and very similar DI system there.

[Inversify](https://github.com/inversify/InversifyJS/tree/master) - The most popular IoC Container library in JS. The
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
