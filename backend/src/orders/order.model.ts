import { Field, Float, ID, ObjectType } from '@nestjs/graphql';
import { Country, OrderStatus } from '../common/enums';
import { OrderItem } from './order-item.model';

@ObjectType()
export class Order {
  @Field(() => ID)
  id: string;

  @Field()
  userId: string;

  @Field()
  restaurantId: string;

  @Field(() => Country)
  country: Country;

  @Field(() => OrderStatus)
  status: OrderStatus;

  @Field(() => Float)
  total: number;

  @Field(() => String, { nullable: true })
  paymentMethodId?: string | null;

  @Field(() => [OrderItem])
  items?: OrderItem[];

  @Field()
  createdAt: Date;
}
