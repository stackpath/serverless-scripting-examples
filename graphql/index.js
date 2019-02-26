import { graphql, buildSchema } from "graphql";

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

const root = {
  hello: () => {
    return "Hello world!";
  },
  sun: async args => {
    const { lat, long, date } = args;
    const resp = await fetch(
      `https://api.sunrise-sunset.org/json?lat=${lat}0&lng=${long}&date=${date}`
    );
    const json = await resp.json();
    return json.results;
  }
};

addEventListener("fetch", event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  const reqJson = await request.json();

  if (!reqJson.query) {
    return new Response("Query missing", { status: 400 });
  }

  const response = await graphql(schema, reqJson.query, root);

  return new Response(JSON.stringify(response));
}
