# JWT Validation

StackPath's [serverless scripting](https://www.stackpath.com/products/edge-computing/serverless-scripting/) 
provides the ability to write custom JavaScript code that is executed at the 
edge of the StackPath CDN. This example shows how serverless scripting can be 
used to validate [JSON Web Tokens](https://jwt.io/) used for API authentication 
at the edge. Handling JWT validation at the edge ensures that your API servers 
only see authenticated requests.

This script ensures that the JWT provided is valid and the signature matches the
public key exposed by your [JWKS](https://auth0.com/docs/jwks) endpoint. If the 
JWT is considered valid, the request will continue to your site and the response 
is returned to the client.

## Getting Started

### Install Dependencies

This project uses [yarn](https://yarnpkg.com/) to manage dependencies and 
execute build scripts, please install `yarn` before continuing. Then clone this 
repository. Next, install the dependencies by executing the following command:

```bash
$ yarn install
```

### Building the script

Before building the project, you will want to configure the project to reach out 
to the correct JWKS endpoint. The endpoint the script uses to retrieve your JWKS 
is injected at build time through [webpack](https://webpack.js.org/). Set the 
`JWKS_URL` environment variable at build time to configure the endpoint used by 
the script. Set the `JWKS_KID` parameter to the `kid` value defined in the JWK 
that's used for signing your JWTs.

```bash
$ JWKS_URL="https://example.com/.well-known/jwks.json" JWKS_KID="$KID" yarn build
```

Once the build has completed, your script will be located in `build/bundle.js`.
