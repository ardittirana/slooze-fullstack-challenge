import { Field, ID, InputType, Int } from '@nestjs/graphql';

@InputType()
export class OrderItemInput {
  @Field(() => ID)
  menuItemId: string;

  @Field(() => Int, { defaultValue: 1 })
  quantity: number;
}

@InputType()
export class CreateOrderInput {
  @Field(() => ID)
  restaurantId: string;

  @Field(() => [OrderItemInput])
  items: OrderItemInput[];
}
