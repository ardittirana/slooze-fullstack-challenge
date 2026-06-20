'use client';

import { useQuery } from '@apollo/client';
import { ME, User } from '@/lib/graphql';
import { ALLOWED_ACTIONS } from '@/lib/permissions';
import { Badge, Card, Loading, PageHeader } from '@/components/ui';

export default function DashboardPage() {
  const { data, loading } = useQuery<{ me: User }>(ME);

  if (loading) return <Loading />;
  const me = data?.me;
  if (!me) return <p className="text-sm text-slate-500">Not signed in. Go to the login page.</p>;

  return (
    <div>
      <PageHeader title={`Welcome, ${me.name}`} subtitle="Your role and country determine what you can do." />
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <p className="text-xs uppercase tracking-wide text-slate-400">Role</p>
          <p className="mt-1"><Badge tone="blue">{me.role}</Badge></p>
        </Card>
        <Card>
          <p className="text-xs uppercase tracking-wide text-slate-400">Country</p>
          <p className="mt-1"><Badge tone="violet">{me.country}</Badge></p>
        </Card>
        <Card>
          <p className="text-xs uppercase tracking-wide text-slate-400">Email</p>
          <p className="mt-1 text-sm text-slate-700">{me.email}</p>
        </Card>
      </div>

      <Card className="mt-6">
        <h2 className="text-base font-semibold text-slate-900">Allowed actions</h2>
        <ul className="mt-3 space-y-2">
          {ALLOWED_ACTIONS.map((a) => {
            const ok = a.allowed(me.role);
            return (
              <li key={a.label} className="flex items-center justify-between text-sm">
                <span className={ok ? 'text-slate-700' : 'text-slate-400 line-through'}>{a.label}</span>
                {ok ? <Badge tone="green">Allowed</Badge> : <Badge tone="red">Denied</Badge>}
              </li>
            );
          })}
        </ul>
        <p className="mt-4 text-xs text-slate-400">
          {me.role === 'ADMIN'
            ? 'As Admin you can access data across all countries.'
            : `You can only access ${me.country} data.`}
        </p>
      </Card>
    </div>
  );
}
