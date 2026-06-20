import { UseGuards } from '@nestjs/common';
import { Query, Resolver } from '@nestjs/graphql';
import { CurrentUser } from '../auth/current-user.decorator';
import { GqlAuthGuard } from '../auth/gql-auth.guard';
import { AuthUser } from '../auth/authz.service';
import { User } from './user.model';
import { UsersService } from './users.service';

@Resolver(() => User)
export class UsersResolver {
  constructor(private readonly users: UsersService) {}

  /** Public: powers the mock login switcher (no session exists yet here). */
  @Query(() => [User], { name: 'users' })
  listUsers() {
    return this.users.findAllForLogin();
  }

  /** The currently authenticated user. */
  @UseGuards(GqlAuthGuard)
  @Query(() => User, { name: 'me' })
  me(@CurrentUser() user: AuthUser): AuthUser {
    return user;
  }
}
