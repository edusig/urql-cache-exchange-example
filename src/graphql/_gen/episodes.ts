import * as Types from './types.d';

import gql from 'graphql-tag';
import * as Urql from 'urql';
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
export type EpisodesQueryVariables = Types.Exact<{ [key: string]: never; }>;


export type EpisodesQuery = { episodes?: { results?: Array<{ __typename: 'Episode', id?: string | null, name?: string | null, characters: Array<{ id?: string | null, name?: string | null, location?: { id?: string | null, dimension?: string | null } | null } | null> } | null> | null } | null };


export const EpisodesDocument = gql`
    query Episodes {
  episodes {
    results {
      __typename
      id
      name
      characters {
        id
        name
        location {
          id
          dimension
        }
      }
    }
  }
}
    `;

export function useEpisodesQuery(options?: Omit<Urql.UseQueryArgs<EpisodesQueryVariables>, 'query'>) {
  return Urql.useQuery<EpisodesQuery, EpisodesQueryVariables>({ query: EpisodesDocument, ...options });
};