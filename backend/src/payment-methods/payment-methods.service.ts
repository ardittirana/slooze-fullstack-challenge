import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthUser, AuthzService } from '../auth/authz.service';
import { AddPaymentMethodInput, UpdatePaymentMethodInput } from './payment-method.inputs';

@Injectable()
export class PaymentMethodsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authz: AuthzService,
  ) {}

  /** Viewing payment methods is Admin-only. */
  list(user: AuthUser) {
    this.authz.assertCanManagePayments(user);
    return this.prisma.paymentMethod.findMany({ orderBy: { label: 'asc' } });
  }

  add(user: AuthUser, input: AddPaymentMethodInput) {
    this.authz.assertCanManagePayments(user);
    return this.prisma.paymentMethod.create({ data: { ...input } });
  }

  async update(user: AuthUser, input: UpdatePaymentMethodInput) {
    this.authz.assertCanManagePayments(user);
    const existing = await this.prisma.paymentMethod.findUnique({ where: { id: input.id } });
    if (!existing) {
      throw new NotFoundException('Payment method not found.');
    }
    const { id, ...data } = input;
    return this.prisma.paymentMethod.update({ where: { id }, data });
  }
}
