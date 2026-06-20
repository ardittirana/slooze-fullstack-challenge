import { UseGuards } from '@nestjs/common';
import { Args, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { CurrentUser } from '../auth/current-user.decorator';
import { GqlAuthGuard } from '../auth/gql-auth.guard';
import { AuthUser } from '../auth/authz.service';
import { MenuItem } from './menu-item.model';
import { Restaurant } from './restaurant.model';
import { RestaurantsService } from './restaurants.service';

@UseGuards(GqlAuthGuard)
@Resolver(() => Restaurant)
export class RestaurantsResolver {
  constructor(private readonly restaurants: RestaurantsService) {}

  @Query(() => [Restaurant], { name: 'restaurants' })
  list(@CurrentUser() user: AuthUser) {
    return this.restaurants.listRestaurants(user);
  }

  @Query(() => [MenuItem], { name: 'menuItems' })
  menuItems(
    @CurrentUser() user: AuthUser,
    @Args('restaurantId', { nullable: true }) restaurantId?: string,
  ) {
    return this.restaurants.listMenuItems(user, restaurantId);
  }

  @ResolveField('menuItems', () => [MenuItem])
  resolveMenuItems(@Parent() restaurant: Restaurant) {
    return this.restaurants.menuItemsForRestaurant(restaurant.id);
  }
}
