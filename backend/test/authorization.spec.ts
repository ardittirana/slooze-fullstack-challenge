import { ForbiddenException } from '@nestjs/common';
import { AuthUser, AuthzService } from '../src/auth/authz.service';
import { Country, Role } from '../src/common/enums';

const user = (role: Role, country: Country): AuthUser => ({
  id: `${role}-${country}`,
  name: `${role} ${country}`,
  email: `${role}.${country}@slooze.test`.toLowerCase(),
  role,
  country,
});

const admin = user(Role.ADMIN, Country.INDIA);
const managerIN = user(Role.MANAGER, Country.INDIA);
const managerUS = user(Role.MANAGER, Country.AMERICA);
const memberIN = user(Role.MEMBER, Country.INDIA);
const memberUS = user(Role.MEMBER, Country.AMERICA);

describe('AuthzService — RBAC permission matrix', () => {
  const authz = new AuthzService();

  it('everyone can view the catalog and create orders', () => {
    for (const u of [admin, managerIN, memberIN]) {
      expect(authz.canViewCatalog(u)).toBe(true);
      expect(authz.canCreateOrder(u)).toBe(true);
    }
  });

  it('only Admin and Manager can checkout and cancel', () => {
    expect(authz.canCheckout(admin)).toBe(true);
    expect(authz.canCheckout(managerIN)).toBe(true);
    expect(authz.canCheckout(memberIN)).toBe(false);

    expect(authz.canCancelOrder(admin)).toBe(true);
    expect(authz.canCancelOrder(managerIN)).toBe(true);
    expect(authz.canCancelOrder(memberIN)).toBe(false);
  });

  it('only Admin can manage payment methods', () => {
    expect(authz.canManagePaymentMethods(admin)).toBe(true);
    expect(authz.canManagePaymentMethods(managerIN)).toBe(false);
    expect(authz.canManagePaymentMethods(memberIN)).toBe(false);
  });

  it('assertions throw ForbiddenException for disallowed roles', () => {
    expect(() => authz.assertCanCheckout(memberIN)).toThrow(ForbiddenException);
    expect(() => authz.assertCanManagePayments(managerIN)).toThrow(ForbiddenException);
    expect(() => authz.assertCanCheckout(managerIN)).not.toThrow();
  });
});

describe('AuthzService — ReBAC country scoping', () => {
  const authz = new AuthzService();

  it('Admin can access every country', () => {
    expect(authz.canAccessCountry(admin, Country.INDIA)).toBe(true);
    expect(authz.canAccessCountry(admin, Country.AMERICA)).toBe(true);
    expect(authz.countryScope(admin)).toEqual({});
  });

  it('India users cannot access America data and vice versa', () => {
    expect(authz.canAccessCountry(managerIN, Country.INDIA)).toBe(true);
    expect(authz.canAccessCountry(managerIN, Country.AMERICA)).toBe(false);
    expect(authz.canAccessCountry(memberUS, Country.AMERICA)).toBe(true);
    expect(authz.canAccessCountry(memberUS, Country.INDIA)).toBe(false);

    expect(() => authz.assertCountryAccess(memberIN, Country.AMERICA)).toThrow(ForbiddenException);
    expect(() => authz.assertCountryAccess(managerUS, Country.INDIA)).toThrow(ForbiddenException);
  });

  it('non-admins are scoped to their own country in queries', () => {
    expect(authz.countryScope(managerIN)).toEqual({ country: Country.INDIA });
    expect(authz.countryScope(memberUS)).toEqual({ country: Country.AMERICA });
  });
});
