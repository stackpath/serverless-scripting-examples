import { graphql, buildSchema } from 'graphql';

// Define GraphQL schema
const schema = buildSchema(`
type Query {
  hello: String
  sun(lat: Float!, long: Float!, date: String!): SunData
}

type SunData {
  sunrise: String
  sunset: String
}
`);

// Define resolvers for schema
const root = {
  hello: () => 'Hello world!',
  sun: async (args) => {
    const { lat, long, date } = args;
    const resp = await fetch(
      `https://api.sunrise-sunset.org/json?lat=${lat}0&lng=${long}&date=${date}`,
    );
    const json = await resp.json();
    return json.results;
  },
};

async function handleRequest(request) {
  // Get graphql query from request
  const reqJson = await request.json();
  if (!reqJson.query) {
    return new Response('Query missing', { status: 400 });
  }

  // Run graphql query
  const response = await graphql(schema, reqJson.query, root);

  // Return graphql response
  return new Response(JSON.stringify(response), {
    'Content-Type': 'application/json',
  });
}

addEventListener('fetch', (event) => {
  event.respondWith(handleRequest(event.request));
});
