'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { Loading } from '@/components/ui';

export default function Home() {
  const { userId, ready } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!ready) return;
    router.replace(userId ? '/dashboard' : '/login');
  }, [ready, userId, router]);

  return <Loading />;
}
