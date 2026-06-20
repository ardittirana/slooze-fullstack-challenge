import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Deterministic seed. Uses fixed ids so reviewers can reference records
 * directly (e.g. the user switcher) and re-running is idempotent.
 */
async function main() {
  // ---- Users -------------------------------------------------------------
  const users = [
    { id: 'u-fury', name: 'Nick Fury', email: 'fury@slooze.test', role: 'ADMIN', country: 'INDIA' },
    { id: 'u-marvel', name: 'Captain Marvel', email: 'marvel@slooze.test', role: 'MANAGER', country: 'INDIA' },
    { id: 'u-america', name: 'Captain America', email: 'america@slooze.test', role: 'MANAGER', country: 'AMERICA' },
    { id: 'u-thanos', name: 'Thanos', email: 'thanos@slooze.test', role: 'MEMBER', country: 'INDIA' },
    { id: 'u-thor', name: 'Thor', email: 'thor@slooze.test', role: 'MEMBER', country: 'INDIA' },
    { id: 'u-travis', name: 'Travis', email: 'travis@slooze.test', role: 'MEMBER', country: 'AMERICA' },
  ];
  for (const u of users) {
    await prisma.user.upsert({ where: { id: u.id }, update: u, create: u });
  }

  // ---- Restaurants -------------------------------------------------------
  const restaurants = [
    { id: 'r-in-1', name: 'Spice Junction', country: 'INDIA' },
    { id: 'r-in-2', name: 'Tandoori Nights', country: 'INDIA' },
    { id: 'r-us-1', name: 'Liberty Diner', country: 'AMERICA' },
    { id: 'r-us-2', name: 'Brooklyn Slice', country: 'AMERICA' },
  ];
  for (const r of restaurants) {
    await prisma.restaurant.upsert({ where: { id: r.id }, update: r, create: r });
  }

  // ---- Menu items --------------------------------------------------------
  const menuItems = [
    { id: 'm-1', name: 'Paneer Butter Masala', description: 'Cottage cheese in a creamy tomato gravy', price: 6.5, restaurantId: 'r-in-1' },
    { id: 'm-2', name: 'Garlic Naan', description: 'Tandoor-baked flatbread', price: 1.8, restaurantId: 'r-in-1' },
    { id: 'm-3', name: 'Chicken Biryani', description: 'Fragrant basmati rice with spiced chicken', price: 7.2, restaurantId: 'r-in-2' },
    { id: 'm-4', name: 'Masala Chai', description: 'Spiced milk tea', price: 1.2, restaurantId: 'r-in-2' },
    { id: 'm-5', name: 'Classic Cheeseburger', description: 'Beef patty, cheddar, house sauce', price: 9.0, restaurantId: 'r-us-1' },
    { id: 'm-6', name: 'Buffalo Wings', description: 'Six wings, blue cheese dip', price: 8.0, restaurantId: 'r-us-1' },
    { id: 'm-7', name: 'Pepperoni Pizza', description: '12-inch, hand-tossed', price: 12.5, restaurantId: 'r-us-2' },
    { id: 'm-8', name: 'Caesar Salad', description: 'Romaine, parmesan, croutons', price: 6.0, restaurantId: 'r-us-2' },
  ];
  for (const m of menuItems) {
    await prisma.menuItem.upsert({ where: { id: m.id }, update: m, create: m });
  }

  // ---- Payment methods ---------------------------------------------------
  const paymentMethods = [
    { id: 'p-in-1', label: 'Corporate UPI', type: 'UPI', country: 'INDIA', details: 'slooze@upi' },
    { id: 'p-us-1', label: 'Corporate Visa ••4242', type: 'CARD', country: 'AMERICA', details: '**** **** **** 4242' },
  ];
  for (const p of paymentMethods) {
    await prisma.paymentMethod.upsert({ where: { id: p.id }, update: p, create: p });
  }

  // ---- Example orders ----------------------------------------------------
  // A pending India order (Thor) and a paid America order (Captain America).
  await prisma.order.upsert({
    where: { id: 'o-1' },
    update: {},
    create: {
      id: 'o-1',
      userId: 'u-thor',
      restaurantId: 'r-in-1',
      country: 'INDIA',
      status: 'PENDING',
      total: 6.5 * 1 + 1.8 * 2,
      items: {
        create: [
          { id: 'oi-1', menuItemId: 'm-1', quantity: 1, priceAtOrder: 6.5 },
          { id: 'oi-2', menuItemId: 'm-2', quantity: 2, priceAtOrder: 1.8 },
        ],
      },
    },
  });

  await prisma.order.upsert({
    where: { id: 'o-2' },
    update: {},
    create: {
      id: 'o-2',
      userId: 'u-america',
      restaurantId: 'r-us-1',
      country: 'AMERICA',
      status: 'PAID',
      total: 9.0 + 8.0,
      paymentMethodId: 'p-us-1',
      items: {
        create: [
          { id: 'oi-3', menuItemId: 'm-5', quantity: 1, priceAtOrder: 9.0 },
          { id: 'oi-4', menuItemId: 'm-6', quantity: 1, priceAtOrder: 8.0 },
        ],
      },
    },
  });

  console.log('Seed complete: %d users, %d restaurants, %d menu items.', users.length, restaurants.length, menuItems.length);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
