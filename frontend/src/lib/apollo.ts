import { ApolloClient, ApolloLink, HttpLink, InMemoryCache } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

const GRAPHQL_URL = process.env.NEXT_PUBLIC_GRAPHQL_URL ?? 'http://localhost:4000/graphql';

/**
 * Builds an Apollo client that attaches the active mock user's id as the
 * `x-user-id` header on every request (read from localStorage at request time,
 * so it always reflects the current login).
 */
export function makeClient() {
  const httpLink = new HttpLink({ uri: GRAPHQL_URL });

  const authLink = setContext((_, { headers }) => {
    const userId = typeof window !== 'undefined' ? localStorage.getItem('slooze:userId') : null;
    return {
      headers: {
        ...headers,
        ...(userId ? { 'x-user-id': userId } : {}),
      },
    };
  });

  return new ApolloClient({
    link: ApolloLink.from([authLink, httpLink]),
    cache: new InMemoryCache(),
    defaultOptions: {
      watchQuery: { fetchPolicy: 'cache-and-network' },
    },
  });
}
