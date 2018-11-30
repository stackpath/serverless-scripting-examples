/**
 * Parse out a JWT token string from the Authorization header
 *
 * This function will parse the Authorization header to retrieve the raw JWT token. It expects
 * that the Authorization header will have the format `Bearer {$jwt}`. If the header is missing
 * or is not in the expected format, an exception will be thrown.
 *
 * @param {Request} request
 * @throws {Error}
 */
export default function getJWTFromRequest(request) {
  if (!request.headers.has('Authorization')) {
    throw new Error('Missing Authorization Header');
  }

  const authParts = request.headers.get('Authorization').split(' ');
  if (authParts.length !== 2 || authParts[0].trim() !== 'Bearer' || authParts[1].trim() === '') {
    throw new Error('Bad authorization string');
  }

  return authParts[1];
}
