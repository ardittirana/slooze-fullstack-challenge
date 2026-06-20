import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CurrentUser } from '../auth/current-user.decorator';
import { GqlAuthGuard } from '../auth/gql-auth.guard';
import { AuthUser } from '../auth/authz.service';
import { PaymentMethod } from './payment-method.model';
import { AddPaymentMethodInput, UpdatePaymentMethodInput } from './payment-method.inputs';
import { PaymentMethodsService } from './payment-methods.service';

@UseGuards(GqlAuthGuard)
@Resolver(() => PaymentMethod)
export class PaymentMethodsResolver {
  constructor(private readonly paymentMethods: PaymentMethodsService) {}

  @Query(() => [PaymentMethod], { name: 'paymentMethods' })
  list(@CurrentUser() user: AuthUser) {
    return this.paymentMethods.list(user);
  }

  @Mutation(() => PaymentMethod)
  addPaymentMethod(@CurrentUser() user: AuthUser, @Args('input') input: AddPaymentMethodInput) {
    return this.paymentMethods.add(user, input);
  }

  @Mutation(() => PaymentMethod)
  updatePaymentMethod(@CurrentUser() user: AuthUser, @Args('input') input: UpdatePaymentMethodInput) {
    return this.paymentMethods.update(user, input);
  }
}
