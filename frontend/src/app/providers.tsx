'use client';

import { ApolloProvider } from '@apollo/client';
import { useState, ReactNode } from 'react';
import { makeClient } from '@/lib/apollo';
import { AuthProvider } from '@/lib/auth';

export function Providers({ children }: { children: ReactNode }) {
  const [client] = useState(() => makeClient());
  return (
    <ApolloProvider client={client}>
      <AuthProvider>{children}</AuthProvider>
    </ApolloProvider>
  );
}
