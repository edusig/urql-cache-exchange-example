import * as fs from 'fs';
import { getIntrospectionQuery } from 'graphql';
import fetch from 'node-fetch'; // or your preferred request in Node.js
import * as url from 'url';

import { getIntrospectedSchema, minifyIntrospectionQuery } from '@urql/introspection';
import path from 'path';
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

fetch('https://rickandmortyapi.com/graphql', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    variables: {},
    query: getIntrospectionQuery({ descriptions: false }),
  }),
})
  .then((result) => result.json())
  .then(({ data }) => {
    const minified = minifyIntrospectionQuery(getIntrospectedSchema(data));
    fs.writeFileSync(
      path.join(__dirname, './src/graphql/_gen/urql-minified-schema.json'),
      JSON.stringify(minified),
    );
  });
