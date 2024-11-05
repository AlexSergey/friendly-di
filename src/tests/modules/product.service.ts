import { Injectable } from '../../injectable';

@Injectable()
export class ProductService {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  constructor() {}

  getProducts() {
    return ['product 1', 'product 2', 'product 3'];
  }
}
