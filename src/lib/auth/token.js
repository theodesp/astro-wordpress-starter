import 'isomorphic-fetch';
import isNil from 'lodash/isNil.js';
import isString from 'lodash/isString.js';
import isNumber from 'lodash/isNumber.js';
import { getWpSecret, getWpUrl } from '../utils';

export class OAuth {
  cookies;

  tokenKey;

  constructor(cookies) {
    this.cookies = cookies;
    this.tokenKey = `${getWpUrl()}-rt`;
  }

   getRefreshToken() {
    return this.cookies.getCookie(this.tokenKey);
  }

   setRefreshToken(token, expires) {
    if (!isString(token) || token.length === 0) {
      this.cookies.removeCookie(this.tokenKey);
    }

    let maxAge = 2592000;
    let expiresIn;

    if (isNumber(expires)) {
      expiresIn = new Date(expires * 1000);
      maxAge = undefined;
    }

    this.cookies.setCookie(this.tokenKey, token, {
      expires: expiresIn,
      maxAge,
      path: '/',
      sameSite: 'strict',
      secure: true,
      httpOnly: true,
    });
  }

   async fetch(code) {
    const wpUrl = getWpUrl();
    const apiClientSecret = getWpSecret();

    if (!apiClientSecret) {
      throw new Error(
        'The apiClientSecret must be specified to use the auth middleware',
      );
    }

    let response = await fetch(`${wpUrl}/?rest_route=/faustwp/v1/authorize`, {
      headers: {
        'Content-Type': 'application/json',
        'x-faustwp-secret': apiClientSecret,
      },
      method: 'POST',
      body: JSON.stringify({
        code,
        refreshToken: this.getRefreshToken(),
      }),
    });

    if (response.status === 404) {
      // Check for the deprecated authorize endpoint.
      response = await fetch(`${wpUrl}/?rest_route=/wpac/v1/authorize`, {
        headers: {
          'Content-Type': 'application/json',
          'x-wpe-headless-secret': apiClientSecret,
        },
        method: 'POST',
        body: JSON.stringify({
          code,
          refreshToken: this.getRefreshToken(),
        }),
      });

      if (response.status !== 404) {
        console.log(
          'Authentication and post previews will soon be incompatible with ' +
            'your version of the FaustWP plugin. Please update to the latest' +
            ' version.',
        );
      }
    }

    const result = await response.json();

    if (!response.ok) {
      return {
        error: true,
        response,
        result,
      };
    }

    return result;
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, class-methods-use-this
   isOAuthTokens(value) {
    const castedValue = value;

    return (
      !isNil(castedValue) &&
      isString(castedValue.accessToken) &&
      isString(castedValue.refreshToken) &&
      isNumber(castedValue.accessTokenExpiration) &&
      isNumber(castedValue.refreshTokenExpiration)
    );
  }
}