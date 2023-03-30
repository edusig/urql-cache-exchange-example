/* eslint-disable no-await-in-loop */
import {
  GetServerSideProps,
  GetServerSidePropsContext,
  GetServerSidePropsResult,
  GetStaticProps,
  GetStaticPropsContext,
  GetStaticPropsResult,
  PreviewData,
} from 'next';
import { SSRExchange, withUrqlClient } from 'next-urql';
import { ParsedUrlQuery } from 'querystring';
import { Client, ssrExchange } from 'urql';
import { getGraphQLClient, getGraphQLClientConfig } from './client';

const GRAPHQL_STATE = 'urqlState';

export interface GetServerSidePropsWithUrql {
  client: Client;
}

export type GetServerSidePropsWithApollo<
  P extends Record<string, any> = Record<string, any>,
  Q extends ParsedUrlQuery = ParsedUrlQuery,
  D extends PreviewData = PreviewData,
> = (
  graphQL: GetServerSidePropsWithUrql,
  context: GetServerSidePropsContext<Q, D>,
) => Promise<GetServerSidePropsResult<P>>;

export type GetStaticPropsWithApollo<
  P extends Record<string, any> = Record<string, any>,
  Q extends ParsedUrlQuery = ParsedUrlQuery,
  D extends PreviewData = PreviewData,
> = (client: Client, context: GetStaticPropsContext<Q, D>) => Promise<GetServerSidePropsResult<P>>;

export const withServerGraphQLClient =
  (fn: GetServerSidePropsWithApollo | GetServerSidePropsWithApollo[]): GetServerSideProps =>
  async (ctx) => {
    const ssrCache = ssrExchange({ isClient: false });
    const client = getGraphQLClient({
      cookie: ctx.req.headers.cookie,
      ssrCache,
    });
    let res: GetServerSidePropsResult<any> = { props: {} };
    try {
      if (Array.isArray(fn)) {
        for (const f of fn) {
          const fnRes = await f({ client }, ctx);
          if ('props' in fnRes) {
            res.props = {
              ...res.props,
              ...('then' in fnRes.props ? await fnRes.props : fnRes.props),
            };
          } else if ('redirect' in fnRes || 'notFound' in fnRes) {
            res = fnRes;
            break;
          }
        }
      } else {
        res = await fn({ client }, ctx);
      }
    } catch (e) {
      console.error(e);
    }
    return getPropsWithGraphQLCache(ssrCache, res);
  };

export const withStaticGraphQLClient =
  (fn: GetStaticPropsWithApollo | GetStaticPropsWithApollo[]): GetStaticProps =>
  async (ctx) => {
    const ssrCache = ssrExchange({ isClient: false });
    const client = getGraphQLClient({ ssrCache });
    let res: GetStaticPropsResult<any> = { props: {} };
    try {
      if (Array.isArray(fn)) {
        for (const f of fn) {
          const fnRes = await f(client, ctx);
          if ('props' in fnRes) {
            res.props = {
              ...res.props,
              ...('then' in fnRes.props ? await fnRes.props : fnRes.props),
            };
          } else if ('redirect' in fnRes || 'notFound' in fnRes) {
            res = fnRes;
            break;
          }
        }
      } else {
        res = await fn(client, ctx);
      }
    } catch (e) {
      console.error(e);
    }
    return getPropsWithGraphQLCache(ssrCache, res);
  };

export const getPropsWithGraphQLCache = async (
  ssrCache: SSRExchange,
  pageProps: GetServerSidePropsResult<Record<string, unknown>>,
) => {
  return 'props' in pageProps
    ? {
        ...pageProps,
        props: {
          ...('then' in pageProps.props ? await pageProps.props : pageProps.props),
          [GRAPHQL_STATE]: ssrCache.extractData(),
        },
      }
    : pageProps;
};

export const withGraphQLClientHOC = withUrqlClient((ssrCache, ctx) =>
  getGraphQLClientConfig({ ssrCache, cookie: ctx?.req?.headers.cookie }),
);
