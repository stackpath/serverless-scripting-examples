import { verify } from 'jsonwebtoken';
import getJWK from './getJWK';

/**
 * Class for validating JWT tokens using a JWKS Endpoint
 */
export default class TokenValidator {
  constructor(jwksURL, kid, algorithms = ['RS256'], audience, issuer) {
    this.kid = kid;
    this.jwksURL = jwksURL;
    this.algorithms = algorithms;
    this.audience = audience;
    this.issuer = issuer;
    this.cache = {};
  }

  /**
   * Verify the given string is a valid JWT based on the validator configuration
   *
   * @param {string} token
   * @returns {Promise}
   */
  async verifyToken(token) {
    return getJWK(this.jwksURL, this.kid, this.cache)
      .then(publicKey => verify(token, publicKey, {
        algorithms: this.algorithms,
        issuer: this.issuer,
        // TODO: support multiple audience values
        audience: this.audience,
      }));
  }
}
