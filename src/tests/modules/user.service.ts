import { Injectable } from '../../injectable';
import { OrderService } from './order.service';

@Injectable()
export class UserService {
  constructor(private orderService: OrderService) {}

  getUserOrders() {
    return this.orderService.getOrdersForUser();
  }
}
