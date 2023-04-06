import * as Types from './types.d';

import gql from 'graphql-tag';
import { LocationFieldsFragmentDoc } from './fragments';
import * as Urql from 'urql';
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
export type CharactersQueryVariables = Types.Exact<{ [key: string]: never; }>;


export type CharactersQuery = { characters?: { results?: Array<{ __typename: 'Character', id?: string | null, name?: string | null, location?: { id?: string | null, name?: string | null, type?: string | null } | null, episode: Array<{ id?: string | null, episode?: string | null } | null>, episodeAlias: Array<{ id?: string | null, air_date?: string | null } | null> } | null> | null } | null };


export const CharactersDocument = gql`
    query Characters {
  characters {
    results {
      __typename
      id
      name
      location {
        ...locationFields
      }
      episode {
        id
        episode
      }
      episodeAlias: episode {
        id
        air_date
      }
    }
  }
}
    ${LocationFieldsFragmentDoc}`;

export function useCharactersQuery(options?: Omit<Urql.UseQueryArgs<CharactersQueryVariables>, 'query'>) {
  return Urql.useQuery<CharactersQuery, CharactersQueryVariables>({ query: CharactersDocument, ...options });
};