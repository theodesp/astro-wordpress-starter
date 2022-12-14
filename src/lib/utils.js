import isArrayLike from "lodash/isArrayLike.js";
import isEmpty from "lodash/isEmpty.js";
import isUndefined from "lodash/isUndefined.js";
import isString from "lodash/isString.js";

/**
 * Returns whether or not the app execution context is currently Server-Side or Client-Side
 *
 * @export
 * @returns {boolean}
 */
export function isServerSide() {
  return typeof window === "undefined";
}

/**
 * Returns whether or not a string is a base64 encoded string
 *
 * @export
 * @param {string} str
 * @returns
 */
export function isBase64(str) {
  if (!isString(str) || str.length === 0) {
    return false;
  }

  return /^([A-Za-z0-9+/]{4})*([A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{2}==)?\n?$/.test(
    str.replace(/\n/g, "")
  );
}

export const previewRegex = /\/preview(\/\w|\?)/;

export function isPreviewPath(uri) {
  if (!isString(uri)) {
    return false;
  }

  return previewRegex.test(uri);
}

/**
 * Returns whether or not a string is a valid URL
 *
 * @export
 * @returns
 */
export function isValidUrl(url) {
  try {
    new URL(url);
    return true;
  } catch (e) {
    return false;
  }
}

export const emailRegex =
  /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

/**
 * Returns whether or not a string is a valid email address
 *
 * @export
 * @returns
 */
export function isValidEmail(email) {
  return emailRegex.test(String(email).toLowerCase());
}

/**
 * Decodes a base64 string, compatible server-side and client-side
 *
 * @export
 * @param {string} str
 * @returns
 */
export function base64Decode(str) {
  if (!isBase64(str)) {
    return str;
  }

  if (isServerSide()) {
    return Buffer.from(str, "base64").toString("utf8");
  }

  return atob(str);
}

/**
 * Encodes a string to base64, compatible server-side and client-side
 *
 * @export
 * @param {string} str
 * @returns
 */
export function base64Encode(str) {
  if (!isString(str)) {
    return "";
  }

  if (isServerSide()) {
    return Buffer.from(str, "utf8").toString("base64");
  }

  return btoa(str);
}

const URL_REGEX = /^(([^:/?#]+):)?(\/\/([^/?#]*))?([^?#]*)(\?([^#]*))?(#(.*))?/;

/* eslint-disable consistent-return */
/**
 * Parses a url into various parts
 *
 * @export
 * @param {(string | undefined)} url
 * @returns {ParsedUrlInfo}
 */
export function parseUrl(url) {
  if (!url) {
    return;
  }

  const parsed = URL_REGEX.exec(url);

  if (
    !isArrayLike(parsed) ||
    isEmpty(parsed) ||
    (isUndefined(parsed[4]) && url[0] !== "/")
  ) {
    return;
  }

  return {
    href: parsed[0],
    protocol: parsed[1],
    baseUrl: `${parsed[1]}${parsed[3]}`,
    host: parsed[4],
    pathname: parsed[5],
    search: parsed[6],
    hash: parsed[8],
  };
}

export function getQueryParam(url, param) {
  if (!isString(url) || !isString(param) || isEmpty(url) || isEmpty(param)) {
    return "";
  }

  const parsedUrl = parseUrl(url);

  if (isUndefined(parsedUrl) || !isString(parsedUrl.search)) {
    return "";
  }

  let query = parsedUrl.search;

  if (query[0] === "?") {
    query = query.substring(1);
  }

  const params = query.split("&");

  for (let i = 0; i < params.length; i += 1) {
    const pair = params[i].split("=");
    if (decodeURIComponent(pair[0]) === param) {
      return decodeURIComponent(pair[1]);
    }
  }

  return "";
}

export function getWpSecret() {
  return import.meta.env.FAUSTWP_SECRET_KEY;
}

export function getWpUrl() {
  let wpUrl = import.meta.env.WORDPRESS_API_URL;
  return wpUrl;
}

export function removeURLParam(url, parameter) {
  const parts = url.split('?');
  if (parts.length >= 2) {
    const prefix = `${encodeURIComponent(parameter)}=`;
    const pars = parts[1].split(/[&;]/g);

    // eslint-disable-next-line no-plusplus
    for (let i = pars.length; i-- > 0; ) {
      if (pars[i].lastIndexOf(prefix, 0) !== -1) {
        pars.splice(i, 1);
      }
    }

    return parts[0] + (pars.length > 0 ? `?${pars.join('&')}` : '');
  }
  return url;
}