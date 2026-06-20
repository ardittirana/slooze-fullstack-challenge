import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Country } from '../common/enums';

@ObjectType()
export class PaymentMethod {
  @Field(() => ID)
  id: string;

  @Field()
  label: string;

  @Field()
  type: string;

  @Field(() => Country)
  country: Country;

  @Field(() => String, { nullable: true })
  details?: string | null;
}
