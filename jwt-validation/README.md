# JWT EdgeEngine Validation

The StackPath [EdgeEngine™️](https://www.stackpath.com/services/edgeengine/) provides the
ability to write custom JavaScript code that is executed at the edge of the StackPath CDN.
This repo provides an example of how
[EdgeEngine™️](https://www.stackpath.com/services/edgeengine/) can be used to validate JWTs
used for API authentication at the edge. Handling JWT validation at the edge will ensure
that your API servers only see authenticated requests.

This script will only validate that the JWT provided is valid and the signature matches the
Public Key exposed by your [JWKS](https://auth0.com/docs/jwks) endpoint. If the JWT is
considered valid, the request will continue to your site and the response is returned to the
client.

## Getting Started

### Install Dependencies

This project uses [yarn](https://yarnpkg.com/) to manage dependencies and execute build scripts, please install `yarn` before continuing. Once `yarn` has been installed and after
you have cloned the repository, you can install the dependencies by executing the following
command.

```bash
$ yarn install
```

### Building the script

Before building the project, you will want to configure the project to reach out to the
correct JWKS endpoint. The endpoint the script uses to retrieve your JWKS will be injected
at build time through [webpack](https://webpack.js.org/). Set the `JWKS_URL` environment
variable at build time to configure the endpoint that's used by the script. The `JWKS_KID`
parameter should be set to the `kid` value defined within the JWK that's used for signing
your JWTs.

```bash
$ JWKS_URL="https://example.com/.well-known/jwks.json" JWKS_KID="$KID" yarn build
```

Once the build has completed, your script will be located in `build/bundle.js`.
