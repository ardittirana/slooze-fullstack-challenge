import { Field, ID, InputType } from '@nestjs/graphql';
import { Country } from '../common/enums';

@InputType()
export class AddPaymentMethodInput {
  @Field()
  label: string;

  @Field()
  type: string;

  @Field(() => Country)
  country: Country;

  @Field({ nullable: true })
  details?: string;
}

@InputType()
export class UpdatePaymentMethodInput {
  @Field(() => ID)
  id: string;

  @Field({ nullable: true })
  label?: string;

  @Field({ nullable: true })
  type?: string;

  @Field({ nullable: true })
  details?: string;
}
