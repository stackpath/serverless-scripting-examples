addEventListener("fetch", event => {
  event.respondWith(handleRequest(event.request));
});

/**
 * Redirect requests from developer.stackpath.com to stackpath.dev.
 *
 * @param {Request} request
 */
async function handleRequest(request) {
  try {
    // The site to redirect requests to.
    const redirectHost = 'https://stackpath.dev';

    // A map of paths at the original site and new paths to redirect to.
    const redirects = new Map([
      // The home page
      ['/', ''],
      ['/en/', ''],

      // The welcome section
      ['/docs/en/getting-started/', 'docs/getting-started'],

      // CDN guides
      ['/docs/en/cdn/static-site-s3/', 'docs/static-site-with-s3'],
      ['/docs/en/cdn/getting-stack-metrics/', 'docs/getting-stack-metrics'],

      // Serverless scripting guides
      ['/docs/en/EdgeEngine/introduction/', 'docs/introduction'],
      ['/docs/en/EdgeEngine/edgeengine-quickstart/', 'docs/getting-started-1'],
      ['/docs/en/EdgeEngine/available-apis/', 'docs/available-apis'],
      ['/docs/en/EdgeEngine/debug/', 'docs/debugging'],
      ['/docs/en/EdgeEngine/cli/', 'docs/edgeengine-cli'],
      ['/docs/en/EdgeEngine/block-countries/', 'docs/block-countries'],
      ['/docs/en/EdgeEngine/cookies/', 'docs/cookies'],
      ['/docs/en/EdgeEngine/crypto/', 'docs/crypto'],
      ['/docs/en/EdgeEngine/in-memory-caching/', 'docs/in-memory-caching'],
      ['/docs/en/EdgeEngine/modify-headers/', 'docs/modify-headers'],
      ['/docs/en/EdgeEngine/modify-response-body/', 'docs/modify-response-body'],
      ['/docs/en/EdgeEngine/request-header-variables/', 'docs/request-header-variables'],
      ['/docs/en/EdgeEngine/static-response/', 'docs/static-response'],

      // Edge computing guides
      ['/docs/en/edgecomputing/creating-a-workload/', 'docs/create-a-container-workload'],

      // API references
      ['/en/api/identity/', 'reference/accounts'],
      ['/en/api/dns/', 'reference/scanning'],
      ['/en/api/cdn/', 'reference/infrastructure'],
      ['/en/api/workload/', 'reference/workloads'],
      ['/en/api/waf/', 'reference/infrastructure-2'],
      ['/en/api/monitoring/', 'reference/http-monitoring'],
      ['/en/api/stacks/', 'reference/stacks'],
    ]);

    // Make sure the request path ends with a / so map gets will work for
    // requests without a trailing slash.
    let path = new URL(request.url).pathname;
    if (!path.endsWith('/')) {
      path += '/';
    }

    const redirectTo = redirects.get(path);

    // If there wasn't a redirect defined then return the fetched original
    // request.
    //
    // Consider logging when this happens.
    if (redirectTo === undefined) {
      const response = await fetch(request);
      return response;
    }

    // Otherwise, redirect the user to the new URL.
    const response = new Response();
    response.status = 301;
    response.statusText = 'Moved Permanently';
    response.headers.set('Location', `${redirectHost}/${redirectTo}`);
    return response;
  } catch (e) {
    return new Response(e.stack || e, { status: 500 });
  }
}