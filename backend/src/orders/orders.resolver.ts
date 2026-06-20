import { UseGuards } from '@nestjs/common';
import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CurrentUser } from '../auth/current-user.decorator';
import { GqlAuthGuard } from '../auth/gql-auth.guard';
import { AuthUser } from '../auth/authz.service';
import { CreateOrderInput } from './create-order.input';
import { Order } from './order.model';
import { OrdersService } from './orders.service';

@UseGuards(GqlAuthGuard)
@Resolver(() => Order)
export class OrdersResolver {
  constructor(private readonly orders: OrdersService) {}

  @Query(() => [Order], { name: 'orders' })
  list(@CurrentUser() user: AuthUser) {
    return this.orders.listOrders(user);
  }

  @Mutation(() => Order)
  createOrder(@CurrentUser() user: AuthUser, @Args('input') input: CreateOrderInput) {
    return this.orders.createOrder(user, input);
  }

  @Mutation(() => Order)
  checkoutOrder(
    @CurrentUser() user: AuthUser,
    @Args('orderId', { type: () => ID }) orderId: string,
    @Args('paymentMethodId', { type: () => ID, nullable: true }) paymentMethodId?: string,
  ) {
    return this.orders.checkoutOrder(user, orderId, paymentMethodId);
  }

  @Mutation(() => Order)
  cancelOrder(@CurrentUser() user: AuthUser, @Args('orderId', { type: () => ID }) orderId: string) {
    return this.orders.cancelOrder(user, orderId);
  }
}
