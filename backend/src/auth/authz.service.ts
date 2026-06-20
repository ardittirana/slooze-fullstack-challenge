import { ForbiddenException, Injectable } from '@nestjs/common';
import { Country, Role } from '../common/enums';

/** Minimal shape of an authenticated user used for authorization decisions. */
export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  country: Country;
}

/**
 * Centralized authorization. Every RBAC (role) and ReBAC (country) decision in
 * the app flows through this service so the access model lives in exactly one
 * place and is easy to review and test (see test/authorization.spec.ts).
 */
@Injectable()
export class AuthzService {
  // ---- RBAC: role capabilities ------------------------------------------
  canViewCatalog(_user: AuthUser): boolean {
    return true; // Admin, Manager, Member
  }

  canCreateOrder(_user: AuthUser): boolean {
    return true; // Admin, Manager, Member
  }

  canCheckout(user: AuthUser): boolean {
    return user.role === Role.ADMIN || user.role === Role.MANAGER;
  }

  canCancelOrder(user: AuthUser): boolean {
    return user.role === Role.ADMIN || user.role === Role.MANAGER;
  }

  canManagePaymentMethods(user: AuthUser): boolean {
    return user.role === Role.ADMIN;
  }

  // ---- ReBAC: country scoping -------------------------------------------
  /** Admin sees all countries; everyone else is scoped to their own. */
  canAccessCountry(user: AuthUser, country: Country): boolean {
    return user.role === Role.ADMIN || user.country === country;
  }

  /** Prisma `where` fragment that scopes a query to the user's allowed countries. */
  countryScope(user: AuthUser): { country?: Country } {
    return user.role === Role.ADMIN ? {} : { country: user.country };
  }

  // ---- Assertions (throw 403 with a clear message) ----------------------
  assert(condition: boolean, message: string): void {
    if (!condition) {
      throw new ForbiddenException(message);
    }
  }

  assertCanCheckout(user: AuthUser): void {
    this.assert(this.canCheckout(user), 'Only an Admin or Manager can checkout and pay for an order.');
  }

  assertCanCancel(user: AuthUser): void {
    this.assert(this.canCancelOrder(user), 'Only an Admin or Manager can cancel an order.');
  }

  assertCanManagePayments(user: AuthUser): void {
    this.assert(this.canManagePaymentMethods(user), 'Only an Admin can add or modify payment methods.');
  }

  assertCountryAccess(user: AuthUser, country: Country): void {
    this.assert(
      this.canAccessCountry(user, country),
      `${user.country} users cannot access ${country} data.`,
    );
  }
}
