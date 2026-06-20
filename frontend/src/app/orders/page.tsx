'use client';

import { useMutation, useQuery } from '@apollo/client';
import { CANCEL_ORDER, CHECKOUT_ORDER, ME, ORDERS, Order, User } from '@/lib/graphql';
import { can } from '@/lib/permissions';
import { Badge, Button, Card, Loading, PageHeader } from '@/components/ui';

const statusTone: Record<string, 'amber' | 'green' | 'red'> = {
  PENDING: 'amber',
  PAID: 'green',
  CANCELLED: 'red',
};

export default function OrdersPage() {
  const { data: meData } = useQuery<{ me: User }>(ME);
  const { data, loading, error } = useQuery<{ orders: Order[] }>(ORDERS);
  const [checkout, { loading: checkingOut }] = useMutation(CHECKOUT_ORDER, { refetchQueries: [{ query: ORDERS }] });
  const [cancel, { loading: cancelling }] = useMutation(CANCEL_ORDER, { refetchQueries: [{ query: ORDERS }] });

  const me = meData?.me;
  const canCheckout = me ? can.checkout(me.role) : false;
  const canCancel = me ? can.cancel(me.role) : false;
  const busy = checkingOut || cancelling;

  const run = async (fn: () => Promise<unknown>) => {
    try {
      await fn();
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Action failed.');
    }
  };

  if (loading) return <Loading />;
  if (error) return <p className="text-sm text-red-600">Failed to load orders: {error.message}</p>;

  return (
    <div>
      <PageHeader title="Orders" subtitle="Orders in your country (Admin sees all). Checkout & cancel are Manager/Admin only." />
      <div className="space-y-4">
        {data?.orders.map((o) => (
          <Card key={o.id}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-slate-400">{o.id}</span>
                <Badge tone={statusTone[o.status]}>{o.status}</Badge>
                <Badge tone="violet">{o.country}</Badge>
              </div>
              <span className="text-sm font-semibold tabular-nums">${o.total.toFixed(2)}</span>
            </div>
            <ul className="mt-3 text-sm text-slate-600">
              {o.items.map((it) => (
                <li key={it.id}>{it.quantity}× {it.menuItem?.name ?? it.id}</li>
              ))}
            </ul>
            <div className="mt-4 flex items-center gap-2">
              <Button
                onClick={() => run(() => checkout({ variables: { orderId: o.id } }))}
                disabled={!canCheckout || o.status !== 'PENDING' || busy}
                title={canCheckout ? '' : 'Only Admin or Manager can checkout'}
              >
                Checkout & pay
              </Button>
              <Button
                variant="danger"
                onClick={() => run(() => cancel({ variables: { orderId: o.id } }))}
                disabled={!canCancel || o.status === 'CANCELLED' || busy}
                title={canCancel ? '' : 'Only Admin or Manager can cancel'}
              >
                Cancel
              </Button>
              {!canCheckout ? <span className="text-xs text-slate-400">Checkout/cancel disabled for your role (Member).</span> : null}
            </div>
          </Card>
        ))}
        {data?.orders.length === 0 ? <p className="text-sm text-slate-500">No orders yet. Create one from the Restaurants page.</p> : null}
      </div>
    </div>
  );
}
