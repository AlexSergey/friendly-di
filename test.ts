import { Injectable } from './src';
import { OrderService } from './src/tests/modules/order.service';

@Injectable()
export class UserService {
  constructor(private orderService: OrderService) {}

  getUserOrders() {
    return this.orderService.getOrdersForUser();
  }
}
