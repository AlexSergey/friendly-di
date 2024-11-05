import { Injectable } from '../../injectable';

@Injectable()
export class ProductServiceMock {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  constructor() {}

  getProducts() {
    return ['product 99', 'product 98', 'product 97'];
  }
}
