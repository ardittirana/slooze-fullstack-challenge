'use client';

import { FormEvent, useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { ADD_PAYMENT_METHOD, ME, PAYMENT_METHODS, PaymentMethod, User } from '@/lib/graphql';
import { Badge, Button, Card, Loading, PageHeader, AccessDenied } from '@/components/ui';

export default function PaymentMethodsPage() {
  const { data: meData, loading: meLoading } = useQuery<{ me: User }>(ME);
  const me = meData?.me;
  const isAdmin = me?.role === 'ADMIN';

  const { data, loading } = useQuery<{ paymentMethods: PaymentMethod[] }>(PAYMENT_METHODS, { skip: !isAdmin });
  const [addPaymentMethod, { loading: adding }] = useMutation(ADD_PAYMENT_METHOD, {
    refetchQueries: [{ query: PAYMENT_METHODS }],
  });

  const [form, setForm] = useState({ label: '', type: 'CARD', country: 'INDIA', details: '' });

  if (meLoading) return <Loading />;
  if (!isAdmin) {
    return (
      <div>
        <PageHeader title="Payment Methods" />
        <AccessDenied message="Only an Admin can view or modify payment methods." />
      </div>
    );
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.label.trim()) return;
    try {
      await addPaymentMethod({
        variables: {
          input: {
            label: form.label,
            type: form.type,
            country: form.country,
            details: form.details || null,
          },
        },
      });
      setForm({ label: '', type: 'CARD', country: 'INDIA', details: '' });
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Could not add payment method.');
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <PageHeader title="Payment Methods" subtitle="Admin-only. Manage corporate payment methods per country." />
        {loading ? <Loading /> : null}
        <div className="space-y-3">
          {data?.paymentMethods.map((p) => (
            <Card key={p.id}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-900">{p.label}</p>
                  <p className="text-xs text-slate-500">{p.type}{p.details ? ` · ${p.details}` : ''}</p>
                </div>
                <Badge tone="violet">{p.country}</Badge>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <aside className="lg:col-span-1">
        <Card>
          <h2 className="text-base font-semibold text-slate-900">Add payment method</h2>
          <form onSubmit={submit} className="mt-3 space-y-3">
            <input
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              placeholder="Label (e.g. Corporate Visa ••4242)"
              value={form.label}
              onChange={(e) => setForm({ ...form, label: e.target.value })}
            />
            <select className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
              <option value="CARD">CARD</option>
              <option value="UPI">UPI</option>
              <option value="NET_BANKING">NET_BANKING</option>
            </select>
            <select className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })}>
              <option value="INDIA">INDIA</option>
              <option value="AMERICA">AMERICA</option>
            </select>
            <input
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              placeholder="Details (optional, masked)"
              value={form.details}
              onChange={(e) => setForm({ ...form, details: e.target.value })}
            />
            <Button type="submit" disabled={adding} className="w-full">{adding ? 'Adding…' : 'Add'}</Button>
          </form>
        </Card>
      </aside>
    </div>
  );
}
