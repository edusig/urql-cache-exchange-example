/* eslint-disable react/destructuring-assignment */
import { DataFields, ResolveInfo, Variables, cacheExchange } from '@urql/exchange-graphcache';
import { SSRExchange, initUrqlClient } from 'next-urql';
import { Client, ClientOptions, createClient, fetchExchange } from 'urql';
import schema from './_gen/urql-minified-schema.json';

let client: Client | null;

export interface GetGraphQLClientOptions {
  cookie?: any;
  ssrCache?: SSRExchange;
}

export const lower = (parent: DataFields, _args: Variables, _cache: Cache, info: ResolveInfo) => {
  const value = parent[info.fieldName];
  return typeof value === 'string' ? value.toLocaleLowerCase() : undefined;
};

export const getGraphQLClientConfig = ({ cookie, ssrCache }: GetGraphQLClientOptions) => {
  const config: ClientOptions = {
    url: 'https://rickandmortyapi.com/graphql',
    fetchOptions:
      cookie != null
        ? {
            headers: { cookie },
          }
        : undefined,
    exchanges: [
      cacheExchange({
        schema: schema as any,
        keys: {
          Characters: () => null,
          Locations: () => null,
          Episodes: () => null,
          Character: (data) => data.id?.toString() ?? null,
          Location: (data) => data.id?.toString() ?? null,
          Episode: (data) => data.id?.toString() ?? null,
        },
        resolvers: {
          Character: {
            name: lower,
          },
        },
      }),
      ...(ssrCache != null ? [ssrCache] : []),
      fetchExchange,
    ] as any[],
  };
  return config;
};

export const getGraphQLClient = (options: GetGraphQLClientOptions) => {
  const isSSR = typeof window === 'undefined';
  if (client != null && !isSSR) return client;
  const config = getGraphQLClientConfig(options);
  client = isSSR ? initUrqlClient(config, false) : createClient(config);
  if (client == null) throw new Error('Could not initialize urql client');
  return client;
};
