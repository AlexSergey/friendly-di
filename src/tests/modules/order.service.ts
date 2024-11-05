import { Injectable } from '../../injectable';
import { ProductService } from './product.service';

@Injectable()
export class OrderService {
  constructor(private productService: ProductService) {}

  getOrdersForUser() {
    return this.productService.getProducts();
  }
}
