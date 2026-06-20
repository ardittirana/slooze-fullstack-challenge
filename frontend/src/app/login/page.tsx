'use client';

import { useQuery } from '@apollo/client';
import { useAuth } from '@/lib/auth';
import { USERS, User } from '@/lib/graphql';
import { Badge, Card, Loading, PageHeader } from '@/components/ui';

export default function LoginPage() {
  const { setUserId } = useAuth();
  const { data, loading, error } = useQuery<{ users: User[] }>(USERS);

  const choose = (id: string) => {
    setUserId(id);
    // Full navigation guarantees a clean Apollo cache for the new identity.
    window.location.assign('/dashboard');
  };

  return (
    <div>
      <PageHeader title="Pick a user" subtitle="Mock login — choose one of the seeded users to sign in as." />
      {loading ? <Loading /> : null}
      {error ? <p className="text-sm text-red-600">Could not reach the API. Is the backend running on :4000?</p> : null}
      <div className="grid gap-3 sm:grid-cols-2">
        {data?.users.map((u) => (
          <button key={u.id} onClick={() => choose(u.id)} className="text-left">
            <Card className="transition hover:border-slate-400 hover:shadow">
              <div className="flex items-center justify-between">
                <span className="font-medium text-slate-900">{u.name}</span>
                <span className="flex gap-1">
                  <Badge tone="blue">{u.role}</Badge>
                  <Badge tone="violet">{u.country}</Badge>
                </span>
              </div>
            </Card>
          </button>
        ))}
      </div>
    </div>
  );
}
