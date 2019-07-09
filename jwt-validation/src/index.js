import TokenValidator from './tokenValidator';
import buildRequestHandler from './requestHandler';

// the kid value of the key that should be used from the JWKS endpoint
const kid = process.env.JWKS_KID;
// the URL endpoint that should be used to retrieve the JWKS
const jwksURL = process.env.JWKS_URL;

// Create a new instance of the JWT Validator based on the configuration
const jwtValidator = new TokenValidator(jwksURL, kid);

// Create the handler for our requests and inject the JWT validator we built
const handleRequest = buildRequestHandler(jwtValidator);

// Register the request handler with StackPath's serverless scripting platform
//
// eslint-disable-next-line no-restricted-globals
addEventListener('fetch', (event) => {
  event.respondWith(handleRequest(event.request));
});
