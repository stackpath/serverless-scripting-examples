/**
 * Fetch the JWK from the URL based on the value of the kid parameter
 *
 * @param {string} jwksURL
 * @param {string} kid
 */
export default async function fetchJWKFromURL(jwksURL, kid) {
  return fetch(jwksURL)
    .then((response) => {
      if (response.status !== 200) {
        throw new Error('Could not check Authorization token');
      }

      return response.json();
    })
    .then(body => body.keys)
    .then(keys => keys.find(key => key.kid === kid));
}
