import "isomorphic-fetch";
import isString from "lodash/isString.js";
import cookie from "cookie";
import { base64Decode, base64Encode } from "../utils";

export class Cookies {
  cookies = {};

  constructor(req, res) {
    this.request = req;
    this.response = res;

    this.cookies = cookie.parse(this.request.headers.cookie || "");
  }

  getCookie(key, { encoded = true, isJson = false } = {}) {
    const value = this.cookies[key];

    if (!isString(value)) {
      return;
    }

    const valueStr = encoded ? base64Decode(value) : value;

    // eslint-disable-next-line consistent-return
    return isJson ? JSON.parse(valueStr) : valueStr;
  }

  setCookie(
    key,
    value,
    { encoded = true, isJson = false, ...serializeOptions } = {}
  ) {
    const valueStr = isJson ? JSON.stringify(value) : value;
    const cookieValue = encoded ? base64Encode(valueStr) : valueStr;

    this.cookies[key] = cookieValue;

    this.response?.headers.set(
      "Set-Cookie",
      cookie.serialize(key, cookieValue, serializeOptions)
    );
  }

  removeCookie(key) {
    delete this.cookies[key];

    this.response?.headers.set(
      "Set-Cookie",
      cookie.serialize(key, "", {
        expires: new Date(0),
      })
    );
  }
}
