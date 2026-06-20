import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { PrismaService } from '../prisma/prisma.service';
import { AuthUser } from './authz.service';
import { Country, Role } from '../common/enums';

/**
 * Mock, deterministic authentication.
 *
 * The frontend "user switcher" sends the selected user's id in the
 * `x-user-id` header. This guard resolves that into a real DB user and attaches
 * it to the GraphQL context as `req.user`, where `@CurrentUser()` reads it.
 *
 * This keeps auth trivial to review locally while still forcing every resolver
 * to run against a concrete, authorized principal.
 */
@Injectable()
export class GqlAuthGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = GqlExecutionContext.create(context);
    const req = ctx.getContext().req;

    const userId = req?.headers?.['x-user-id'];
    if (!userId || typeof userId !== 'string') {
      throw new UnauthorizedException('Missing x-user-id header. Pick a user on the login page.');
    }

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('Unknown user. Pick a valid user on the login page.');
    }

    req.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role as Role,
      country: user.country as Country,
    } satisfies AuthUser;

    return true;
  }
}
