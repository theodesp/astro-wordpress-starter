import 'isomorphic-fetch';
import isString from 'lodash/isString.js';
import { getQueryParam, removeURLParam, getWpUrl } from '../utils';
import { fetchAccessToken } from './accessToken.js';

/* eslint-disable consistent-return */
/**
 * Checks for an existing Access Token and returns one if it exists. Otherwise returns
 * an object containing a redirect URI to send the client to for authorization.
 *
 * @export
 * @param {string} EnsureAuthorizationOptions
 * @returns {(string | { redirect: string })}
 */
export async function ensureAuthorization(
  options,
) {
  const wpUrl = 'http://mysite.local';
  const { redirectUri, loginPageUri } = options || {};

  // Get the authorization code from the URL if it exists
  const code =
    typeof window !== 'undefined'
      ? getQueryParam(window.location.href, 'code')
      : undefined;

  const unauthorized = {};

  if (isString(redirectUri)) {
    unauthorized.redirect = `${wpUrl}/generate?redirect_uri=${encodeURIComponent(
      redirectUri,
    )}`;
  }

  if (isString(loginPageUri)) {
    unauthorized.login = loginPageUri;
  }

  const token = await fetchAccessToken(code);

  if (!token) {
    return unauthorized;
  }

  if (code) {
    window.history.replaceState(
      {},
      document.title,
      removeURLParam(window.location.href, 'code'),
    );
  }

  return true;
}
/* eslint-enable consistent-return */