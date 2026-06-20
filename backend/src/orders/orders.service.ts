import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthUser, AuthzService } from '../auth/authz.service';
import { Country, OrderStatus } from '../common/enums';
import { CreateOrderInput } from './create-order.input';

const INCLUDE_ITEMS = { items: { include: { menuItem: true } } } as const;

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authz: AuthzService,
  ) {}

  /** Orders within the user's country scope (Admin sees all). */
  listOrders(user: AuthUser) {
    return this.prisma.order.findMany({
      where: this.authz.countryScope(user),
      include: INCLUDE_ITEMS,
      orderBy: { createdAt: 'desc' },
    });
  }

  /** Any role may create an order, but only within their own country. */
  async createOrder(user: AuthUser, input: CreateOrderInput) {
    if (!input.items?.length) {
      throw new BadRequestException('An order must contain at least one item.');
    }

    const restaurant = await this.prisma.restaurant.findUnique({ where: { id: input.restaurantId } });
    if (!restaurant) {
      throw new NotFoundException('Restaurant not found.');
    }
    this.authz.assertCountryAccess(user, restaurant.country as Country);

    // Validate every menu item belongs to this restaurant and price it now.
    const menuItems = await this.prisma.menuItem.findMany({
      where: { id: { in: input.items.map((i) => i.menuItemId) }, restaurantId: restaurant.id },
    });
    const byId = new Map(menuItems.map((m) => [m.id, m]));

    let total = 0;
    const itemsCreate = input.items.map((i) => {
      const menuItem = byId.get(i.menuItemId);
      if (!menuItem) {
        throw new BadRequestException(`Menu item ${i.menuItemId} is not on this restaurant's menu.`);
      }
      if (i.quantity < 1) {
        throw new BadRequestException('Quantity must be at least 1.');
      }
      total += menuItem.price * i.quantity;
      return { menuItemId: menuItem.id, quantity: i.quantity, priceAtOrder: menuItem.price };
    });

    return this.prisma.order.create({
      data: {
        userId: user.id,
        restaurantId: restaurant.id,
        country: restaurant.country,
        status: OrderStatus.PENDING,
        total: Number(total.toFixed(2)),
        items: { create: itemsCreate },
      },
      include: INCLUDE_ITEMS,
    });
  }

  /** Checkout & pay — Admin/Manager only, within country scope. */
  async checkoutOrder(user: AuthUser, orderId: string, paymentMethodId?: string) {
    this.authz.assertCanCheckout(user);
    const order = await this.getScopedOrder(user, orderId);

    if (order.status !== OrderStatus.PENDING) {
      throw new BadRequestException(`Only a pending order can be checked out (current: ${order.status}).`);
    }

    if (paymentMethodId) {
      const pm = await this.prisma.paymentMethod.findUnique({ where: { id: paymentMethodId } });
      if (!pm) {
        throw new NotFoundException('Payment method not found.');
      }
      this.authz.assertCountryAccess(user, pm.country as Country);
    }

    return this.prisma.order.update({
      where: { id: order.id },
      data: { status: OrderStatus.PAID, paymentMethodId: paymentMethodId ?? null },
      include: INCLUDE_ITEMS,
    });
  }

  /** Cancel — Admin/Manager only, within country scope. */
  async cancelOrder(user: AuthUser, orderId: string) {
    this.authz.assertCanCancel(user);
    const order = await this.getScopedOrder(user, orderId);

    if (order.status === OrderStatus.CANCELLED) {
      throw new BadRequestException('Order is already cancelled.');
    }

    return this.prisma.order.update({
      where: { id: order.id },
      data: { status: OrderStatus.CANCELLED },
      include: INCLUDE_ITEMS,
    });
  }

  /** Load an order and enforce country access in one place. */
  private async getScopedOrder(user: AuthUser, orderId: string) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) {
      throw new NotFoundException('Order not found.');
    }
    this.authz.assertCountryAccess(user, order.country as Country);
    return order;
  }
}
