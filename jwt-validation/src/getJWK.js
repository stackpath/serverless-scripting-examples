import { KEYUTIL } from 'jsrsasign';
import fetchJWKFromURL from './fetchJWKFromURL';

const cache = {};

/**
 * Retrieve a JWK from cache or from the URL
 *
 * This function will retrieve a JWK from the cache if available, otherwise it will reach
 * out to the endpoint to retrieve the JWK and save it in cache. The returned Key will be
 * the PEM encoded version of the key that can be directly used in the `verify` call for a
 * JWT.
 *
 * @param {string} jwksURL
 * @param {string} kid
 * @param {object} cache
 */
export default async function getJWK(jwksURL, kid) {
  return new Promise((resolve) => {
    if (kid in cache) {
      // TODO: add cache expiration
      return resolve(cache[kid]);
    }

    return resolve(
      fetchJWKFromURL(jwksURL, kid)
        .then((key) => {
          cache[kid] = KEYUTIL.getPEM(KEYUTIL.getKey(key));
          return cache[kid];
        }),
    );
  });
}
