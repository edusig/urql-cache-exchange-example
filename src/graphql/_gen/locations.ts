import * as Types from './types.d';

import gql from 'graphql-tag';
import { LocationFieldsFragmentDoc } from './fragments';
import * as Urql from 'urql';
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
export type LocationsQueryVariables = Types.Exact<{ [key: string]: never; }>;


export type LocationsQuery = { locations?: { results?: Array<{ __typename: 'Location', dimension?: string | null, id?: string | null, name?: string | null, type?: string | null, residents: Array<{ id?: string | null, status?: string | null, created?: string | null } | null> } | null> | null } | null };


export const LocationsDocument = gql`
    query Locations {
  locations {
    results {
      __typename
      ...locationFields
      dimension
      residents {
        id
        status
        created
      }
    }
  }
}
    ${LocationFieldsFragmentDoc}`;

export function useLocationsQuery(options?: Omit<Urql.UseQueryArgs<LocationsQueryVariables>, 'query'>) {
  return Urql.useQuery<LocationsQuery, LocationsQueryVariables>({ query: LocationsDocument, ...options });
};