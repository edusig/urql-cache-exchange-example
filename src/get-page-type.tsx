import { NextPage } from 'next';
import { ReactNode } from 'react';

type GetLayout = (page: ReactNode) => ReactNode;

export type Page<P = Record<string, any>> = NextPage<P> & {
  getLayout?: GetLayout;
};
