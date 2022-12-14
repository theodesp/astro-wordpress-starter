import 'isomorphic-fetch';
import { getQueryParam } from '../utils';
import { Cookies } from './cookie';
import { OAuth } from './token';
/**
 * A Node handler for processing incoming requests to exchange an Authorization Code
 * for an Access Token using the WordPress API. Once the code is exchanged, this
 * handler stores the Access Token on the cookie and redirects to the frontend.
 *
 * @param {IncomingMessage} req
 * @param {ServerResponse} res
 *
 * @see https://faustjs.org/docs/next/guides/auth
 */
export async function authorizeHandler(
    req,
  ) {
    const url = req.url;
    const code = getQueryParam(url, 'code');
    const oauth = new OAuth(new Cookies(req, new Response()));
    const refreshToken = oauth.getRefreshToken();
  
    if (!refreshToken && !code) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {statusCode: 401})
    }
  
    try {
      const result = await oauth.fetch(code);
  
      if (oauth.isOAuthTokens(result)) {
        oauth.setRefreshToken(result.refreshToken);
        console.debug(result);
        return new Response(JSON.stringify(result), {statusCode: 200})
      } else {
        const {
          response: { status },
        } = result;
  
        let statusCode;
        if (status > 299) {
          statusCode = result.response.status;
        } else {
          statusCode = 401;
        }
        /**
         * If the response to the authorization request does not match
         * isOAuthTokens, remove the refresh token from the cookie in the case
         * the token is:
         * - expired
         * - invalid
         * - revoked
         * - from a different WordPress instance when developing on localhost
         */
        oauth.setRefreshToken(undefined);
        return new Response(JSON.stringify(result.result), {statusCode: statusCode})
  
      }
    } catch (e) {
      log(e);
      return new Response(JSON.stringify({ error: 'Internal Server Error' }), {statusCode: 500})
    }
  }
  
  /**
   * A Node handler for processing incoming requests to logout an authenticated user.
   * This handler clears the refresh token from the cookie and returns a response.
   *
   * @param {IncomingMessage} req
   * @param {ServerResponse} res
   *
   * @see https://faustjs.org/docs/next/guides/auth
   */
  // eslint-disable-next-line @typescript-eslint/require-await
  export async function logoutHandler(
    req
  ) {
    // Only allow POST requests, as browsers may pre-fetch GET requests.
    if (req.method !== 'POST') {
        return new Response(null, { status: 405 })
    }
  
    const oauth = new OAuth(new Cookies(req, new Response()));
    oauth.setRefreshToken(undefined);
    console.debug(oauth);
    return new Response(null, { status: 205 })
  }