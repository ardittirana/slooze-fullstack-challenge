import { Role } from './graphql';

/**
 * UI-side mirror of the backend permission matrix. Used only to enable/disable
 * controls for a better UX — the backend (AuthzService) remains the source of
 * truth and re-checks every request.
 */
export const can = {
  viewCatalog: (_role: Role) => true,
  createOrder: (_role: Role) => true,
  checkout: (role: Role) => role === 'ADMIN' || role === 'MANAGER',
  cancel: (role: Role) => role === 'ADMIN' || role === 'MANAGER',
  managePayments: (role: Role) => role === 'ADMIN',
};

export const ALLOWED_ACTIONS: { label: string; allowed: (role: Role) => boolean }[] = [
  { label: 'View restaurants & menu items', allowed: can.viewCatalog },
  { label: 'Create order / add food items', allowed: can.createOrder },
  { label: 'Checkout and pay', allowed: can.checkout },
  { label: 'Cancel order', allowed: can.cancel },
  { label: 'Add / modify payment methods', allowed: can.managePayments },
];
