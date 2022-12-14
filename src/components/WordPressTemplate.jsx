import React, { useEffect, useState } from "react";
import { ensureAuthorization } from "../lib/auth/authorize";
import { getAccessToken } from "../lib/auth/accessToken";
import { useQuery } from "../lib/api";
import templates from "../components/templates/index.react";
import { getTemplate } from "../lib/getWordPressProps";
import { SEED_QUERY } from "../queries/seedQuery.js";
import { getQueryParam } from "../lib/utils";

export function WordPressTemplate(props) {
  if (!templates) {
    throw new Error("Templates are required. Please add them to your config.");
  }

  const {
    __SEED_NODE__: seedNodeProp,
    __TEMPLATE_QUERY_DATA__: templateQueryDataProp,
  } = props;

  const [seedNode, setSeedNode] = useState(seedNodeProp);
  const template = getTemplate(seedNode, templates);

  const [data, setData] = useState(templateQueryDataProp);
  const [loading, setLoading] = useState(template === null);
  const [isPreview, setIsPreview] = useState(
    templateQueryDataProp ? false : null
  );
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  /**
   * Determine if the URL we are on is for previews
   */
  useEffect(() => {
    if (!window) {
      return;
    }

    setIsPreview(window.location.search.includes("preview=true"));
  }, []);

  /**
   * If the URL we are on is for previews, ensure we are authenticated.
   */
  useEffect(() => {
    if (isPreview === null || isPreview === false) {
      return;
    }

    void (async () => {
      const ensureAuthRes = await ensureAuthorization({
        redirectUri: window.location.href,
      });

      if (ensureAuthRes !== true && ensureAuthRes?.redirect) {
        window.location.replace(ensureAuthRes.redirect);
      }

      setIsAuthenticated(ensureAuthRes);
    })();
  }, [isPreview]);

  /**
   * Execute the seed query.
   *
   * If the seed query was not available via a prop, it was not executed on the
   * server, meaning we are either dealing with a CSR page, or a preview page.
   */
  useEffect(() => {
    if (isPreview === null) {
      return;
    }

    if (isPreview === true && isAuthenticated !== true) {
      return;
    }

    void (async () => {
      let seedQueryUri = window.location.href.replace(
        window.location.origin,
        ""
      );

      if (isPreview) {
        seedQueryUri = getQueryParam(window.location.href, "previewPathname");

        if (seedQueryUri === "") {
          throw new Error(
            'The URL must contain the proper "previewPathname" query param for previews.'
          );
        }
      }

      let queryArgs = {
        query: SEED_QUERY,
        variables: {
          uri: seedQueryUri,
        },
      };
      let headers = {};
      if (isPreview) {
        headers = {
          /**
           * We know the access token is available here since we ensured
           * authorization in the useEffect above
           */
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          Authorization: `bearer ${getAccessToken()}`,
        };
      }

      if (!seedNode) {
        setLoading(true);

        const seedQueryRes = await useQuery(
          queryArgs.query,
          queryArgs.variables,
          headers
        );

        const node = seedQueryRes.node;

        setSeedNode(node);
      }
    })();
  }, [seedNode, isPreview, isAuthenticated]);

  /**
   * Finally, get the template's query data.
   */
  useEffect(() => {
    // We don't know yet if this is a preview route or not
    if (isPreview === null) {
      return;
    }

    // This is a preview route, but we are not authenticated yet.
    if (isPreview === true && isAuthenticated !== true) {
      return;
    }

    void (async () => {
      if (!template || !template?.query || !seedNode) {
        return;
      }

      if (!data) {
        setLoading(true);

        let queryArgs = {
          query: template?.query,
          variables: template?.variables
            ? template?.variables(seedNode, { asPreview: isPreview })
            : undefined,
        };

        let headers = {};
        if (isPreview) {
            headers = {
            /**
             * We know the access token is available here since we ensured
             * authorization in the useEffect above
             */
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            Authorization: `bearer ${getAccessToken()}`,
            };
        }

        const templateQueryRes = await useQuery(
          queryArgs.query,
          queryArgs.variables,
          headers
        );

        setData(templateQueryRes);

        setLoading(false);
      }
    })();
  }, [data, template, seedNode, isPreview, isAuthenticated]);

  if (!template) {
    return null;
  }

  return React.createElement(template, { ...props, data, loading }, null);
}
