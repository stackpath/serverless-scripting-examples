# graphql-js

This script demonstrates using [GraphQL.js](https://github.com/graphql/graphql-js) 
as an API gateway at the edge. The GraphQL schema contains two queryable fields:

```graphql
type Query {
  hello: String
  sun(lat: Float!, long: Float!, date: String!): SunData
}

type SunData {
  sunrise: String
  sunset: String
}
```

`hello` returns a static `String` while `sun` requests the [sunrise-sunset api](https://sunrise-sunset.org/api) 
to return the sunrise and sunset time for a particular day and place. The ideal 
use case for running GraphQL at the edge involves caching API responses in the 
CDN so that requests would not need to travel back to the origin every time.

Note: The sunrise sunset API is a public third-party API. StackPath makes no 
guarantees to its uptime or availability.

## Getting Started

### Install Dependencies

[Install yarn](https://yarnpkg.com/en/docs/install) if it is not already 
installed and run it from the root of the `graphql` directory

```bash
yarn
```

### Build Script

To build the project, run

```bash
yarn build
```

The output `dist/main.js` can be run from StackPath's serverless scripting platform.

### Curl Example

```bash
curl -X POST \
  -H "Content-Type: application/json" \
  --data '{ "query": "{ hello, sun(lat: 36.7201600, long: -4.4203400, date: \"today\") { sunrise, sunset } }" }' \
  <script-url>
```

The above query returns a response similar to

```json
{
  "data": {
    "hello": "Hello world!",
    "sun": { "sunrise": "6:51:52 AM", "sunset": "6:09:09 PM" }
  }
}
```
