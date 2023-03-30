import { Page } from '@/get-page-type';
import { withGraphQLClientHOC } from '@/graphql/with-graphql-client';
import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import { FC } from 'react';

type AppPropsWithLayout = AppProps & {
  Component: Page;
};

const CustomApp: FC<AppPropsWithLayout> = ({ Component, pageProps, router }) => {
  const getLayout = Component.getLayout ?? ((page) => page);
  return <div>{getLayout(<Component {...pageProps} key={router.route} />)}</div>;
};

export default withGraphQLClientHOC(CustomApp);
