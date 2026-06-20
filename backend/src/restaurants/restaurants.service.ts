import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthUser, AuthzService } from '../auth/authz.service';
import { Country } from '../common/enums';

@Injectable()
export class RestaurantsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authz: AuthzService,
  ) {}

  /** Restaurants the user is allowed to see (country-scoped; Admin sees all). */
  listRestaurants(user: AuthUser) {
    return this.prisma.restaurant.findMany({
      where: this.authz.countryScope(user),
      orderBy: { name: 'asc' },
    });
  }

  /** Menu items, scoped via the parent restaurant's country. */
  async listMenuItems(user: AuthUser, restaurantId?: string) {
    if (restaurantId) {
      const restaurant = await this.prisma.restaurant.findUnique({ where: { id: restaurantId } });
      if (!restaurant) {
        throw new NotFoundException('Restaurant not found.');
      }
      this.authz.assertCountryAccess(user, restaurant.country as Country);
      return this.prisma.menuItem.findMany({ where: { restaurantId }, orderBy: { name: 'asc' } });
    }
    return this.prisma.menuItem.findMany({
      where: { restaurant: this.authz.countryScope(user) },
      orderBy: { name: 'asc' },
    });
  }

  menuItemsForRestaurant(restaurantId: string) {
    return this.prisma.menuItem.findMany({ where: { restaurantId }, orderBy: { name: 'asc' } });
  }
}
