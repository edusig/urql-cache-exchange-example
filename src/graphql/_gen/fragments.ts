import * as Types from './types.d';

import gql from 'graphql-tag';
export type LocationFieldsFragment = { id?: string | null, name?: string | null, type?: string | null };

export const LocationFieldsFragmentDoc = gql`
    fragment locationFields on Location {
  id
  name
  type
}
    `;