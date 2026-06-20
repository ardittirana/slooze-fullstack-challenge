import { Field, Float, ID, Int, ObjectType } from '@nestjs/graphql';
import { MenuItem } from '../restaurants/menu-item.model';

@ObjectType()
export class OrderItem {
  @Field(() => ID)
  id: string;

  @Field()
  menuItemId: string;

  @Field(() => Int)
  quantity: number;

  @Field(() => Float)
  priceAtOrder: number;

  @Field(() => MenuItem, { nullable: true })
  menuItem?: MenuItem;
}
