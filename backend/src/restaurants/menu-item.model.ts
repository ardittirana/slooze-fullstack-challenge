import { Field, Float, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class MenuItem {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field(() => String, { nullable: true })
  description?: string | null;

  @Field(() => Float)
  price: number;

  @Field()
  restaurantId: string;
}
