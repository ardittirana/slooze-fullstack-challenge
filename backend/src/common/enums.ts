import { registerEnumType } from '@nestjs/graphql';

/** Application-level enums. Stored as strings in SQLite (see schema.prisma). */

export enum Role {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  MEMBER = 'MEMBER',
}

export enum Country {
  INDIA = 'INDIA',
  AMERICA = 'AMERICA',
}

export enum OrderStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  CANCELLED = 'CANCELLED',
}

registerEnumType(Role, { name: 'Role', description: 'Access role of a user' });
registerEnumType(Country, { name: 'Country', description: 'Country a record belongs to' });
registerEnumType(OrderStatus, { name: 'OrderStatus', description: 'Lifecycle state of an order' });
