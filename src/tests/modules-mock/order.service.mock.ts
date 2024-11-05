import { Injectable } from '../../injectable';
import { ProductServiceMock } from './product.service.mock';

@Injectable()
export class OrderServiceMock {
  constructor(private productService: ProductServiceMock) {}

  getOrdersForUser() {
    return this.productService.getProducts();
  }
}
