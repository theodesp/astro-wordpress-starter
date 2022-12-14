import trimEnd from "lodash/trimEnd.js";
import {
  logoutHandler,
  authorizeHandler,
} from "../../../lib/auth/middleware.js";
import { parseUrl } from "../../../lib/utils";

import {
  FAUST_API_BASE_PATH,
  TOKEN_ENDPOINT_PARTIAL_PATH,
  LOGOUT_ENDPOINT_PARTIAL_PATH
} from '../../../lib/constants';

export async function post({ request }) {
  const parsedUrl = parseUrl(request.url);
  const pathname = trimEnd(parsedUrl?.pathname, "/");
  switch (pathname) {
    case `${FAUST_API_BASE_PATH}/${LOGOUT_ENDPOINT_PARTIAL_PATH}`:
      return logoutHandler(request);
    default:
      return new Response(null, { status: 404 });
  }
}
export async function get({ request }) {
  const parsedUrl = parseUrl(request.url);
  const pathname = trimEnd(parsedUrl?.pathname, "/");
  switch (pathname) {
    case `${FAUST_API_BASE_PATH}/${TOKEN_ENDPOINT_PARTIAL_PATH}`:
      return authorizeHandler(request);
    default:
      return new Response(null, { status: 404 });
  }
}
