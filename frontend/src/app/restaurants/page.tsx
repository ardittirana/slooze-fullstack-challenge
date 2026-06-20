'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery } from '@apollo/client';
import { CREATE_ORDER, MenuItem, RESTAURANTS, Restaurant } from '@/lib/graphql';
import { Badge, Button, Card, Loading, PageHeader } from '@/components/ui';

interface CartLine {
  item: MenuItem;
  qty: number;
}

export default function RestaurantsPage() {
  const router = useRouter();
  const { data, loading, error } = useQuery<{ restaurants: Restaurant[] }>(RESTAURANTS);
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const [cart, setCart] = useState<Record<string, CartLine>>({});
  const [createOrder, { loading: placing }] = useMutation(CREATE_ORDER);

  const lines = Object.values(cart);
  const total = useMemo(() => lines.reduce((s, l) => s + l.item.price * l.qty, 0), [lines]);

  const add = (restaurant: Restaurant, item: MenuItem) => {
    if (restaurantId && restaurantId !== restaurant.id) {
      alert('An order is per-restaurant. Place or clear your current cart first.');
      return;
    }
    setRestaurantId(restaurant.id);
    setCart((c) => ({ ...c, [item.id]: { item, qty: (c[item.id]?.qty ?? 0) + 1 } }));
  };

  const clear = () => {
    setCart({});
    setRestaurantId(null);
  };

  const place = async () => {
    if (!restaurantId || lines.length === 0) return;
    try {
      await createOrder({
        variables: {
          input: {
            restaurantId,
            items: lines.map((l) => ({ menuItemId: l.item.id, quantity: l.qty })),
          },
        },
      });
      clear();
      router.push('/orders');
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Could not create order.');
    }
  };

  if (loading) return <Loading />;
  if (error) return <p className="text-sm text-red-600">Failed to load restaurants: {error.message}</p>;

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <PageHeader title="Restaurants" subtitle="Only restaurants in your country are shown (Admin sees all)." />
        <div className="space-y-5">
          {data?.restaurants.map((r) => (
            <Card key={r.id}>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900">{r.name}</h2>
                <Badge tone="violet">{r.country}</Badge>
              </div>
              <ul className="divide-y divide-slate-100">
                {r.menuItems.map((m) => (
                  <li key={m.id} className="flex items-center justify-between py-2">
                    <div>
                      <p className="text-sm font-medium text-slate-800">{m.name}</p>
                      {m.description ? <p className="text-xs text-slate-500">{m.description}</p> : null}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm tabular-nums text-slate-600">${m.price.toFixed(2)}</span>
                      <Button variant="secondary" onClick={() => add(r, m)}>Add</Button>
                    </div>
                  </li>
                ))}
              </ul>
            </Card>
          ))}
          {data?.restaurants.length === 0 ? <p className="text-sm text-slate-500">No restaurants available.</p> : null}
        </div>
      </div>

      <aside className="lg:col-span-1">
        <Card className="sticky top-6">
          <h2 className="text-base font-semibold text-slate-900">Your cart</h2>
          {lines.length === 0 ? (
            <p className="mt-2 text-sm text-slate-500">Add items from a restaurant to start an order.</p>
          ) : (
            <>
              <ul className="mt-3 space-y-2">
                {lines.map((l) => (
                  <li key={l.item.id} className="flex justify-between text-sm">
                    <span className="text-slate-700">{l.qty}× {l.item.name}</span>
                    <span className="tabular-nums text-slate-600">${(l.item.price * l.qty).toFixed(2)}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-3 flex justify-between border-t border-slate-100 pt-3 text-sm font-semibold">
                <span>Total</span>
                <span className="tabular-nums">${total.toFixed(2)}</span>
              </div>
              <div className="mt-4 flex gap-2">
                <Button onClick={place} disabled={placing} className="flex-1">
                  {placing ? 'Placing…' : 'Create order'}
                </Button>
                <Button variant="secondary" onClick={clear}>Clear</Button>
              </div>
              <p className="mt-2 text-xs text-slate-400">Members can create orders; checkout/pay is Manager/Admin only.</p>
            </>
          )}
        </Card>
      </aside>
    </div>
  );
}
