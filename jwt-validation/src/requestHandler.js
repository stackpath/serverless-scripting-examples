import getJWTFromRequest from './getJWTFromRequest';

/**
 * Handle the HTTP request for the script
 *
 * This handler will validate that the authorization token provided by the user is a valid JWT
 * that was signed by the authorization server. This validation is done by the TokenValidator
 * that was created above. If the token is valid, the request is fetched and the response is
 * returned to the client. If the token is invalid, a 401 error will be returned back to the client
 *
 * @param {Request} request
 * @returns {Response}
 */
export default function buildRequestHandler(tokenValidator) {
  return async function handleRequest(request) {
    try {
      // TODO: inspect returned token for additional verification
      await tokenValidator.verifyToken(getJWTFromRequest(request));
    } catch (err) {
      // TODO: match the 401 error format of your API endpoints
      return new Response(JSON.stringify({
        message: err.message,
      }), {
        status: 401,
      });
    }

    try {
      // Now that we've validated that the user has provided a valid JWT that our authorization
      // server provided we can continue processing the user's request
      const response = await fetch(request);

      // Modify the request here if necessary

      return response;
    } catch (e) {
      // TODO: add proper error handling
      return new Response(e.stack || e, {
        status: 500,
      });
    }
  };
}
