'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useQuery } from '@apollo/client';
import { useAuth } from '@/lib/auth';
import { ME, User } from '@/lib/graphql';
import { Badge } from './ui';

const LINKS = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/restaurants', label: 'Restaurants' },
  { href: '/orders', label: 'Orders' },
  { href: '/payment-methods', label: 'Payment Methods' },
];

export function Nav() {
  const { userId, setUserId, ready } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const { data } = useQuery<{ me: User }>(ME, { skip: !userId });

  if (!ready || !userId) {
    return (
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <span className="font-semibold text-slate-900">🍔 Slooze Orders</span>
        </div>
      </header>
    );
  }

  const me = data?.me;

  const logout = () => {
    setUserId(null);
    router.push('/login');
  };

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="font-semibold text-slate-900">🍔 Slooze Orders</Link>
          <nav className="flex gap-1">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`rounded-md px-3 py-1.5 text-sm ${
                  pathname === l.href ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          {me ? (
            <span className="text-sm text-slate-600">
              {me.name} <Badge tone="blue">{me.role}</Badge> <Badge tone="violet">{me.country}</Badge>
            </span>
          ) : null}
          <button onClick={logout} className="text-sm text-slate-500 hover:text-slate-900">
            Switch user
          </button>
        </div>
      </div>
    </header>
  );
}
