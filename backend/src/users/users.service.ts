import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  /** All seeded users — used by the login / user-switcher page. */
  findAllForLogin() {
    return this.prisma.user.findMany({ orderBy: { name: 'asc' } });
  }
}
