import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Country, Role } from '../common/enums';

@ObjectType()
export class User {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field()
  email: string;

  @Field(() => Role)
  role: Role;

  @Field(() => Country)
  country: Country;
}
