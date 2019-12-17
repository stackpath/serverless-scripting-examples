// 3rd party logging url
const LOG_URL = "https://logging.service.com/ingest";

// 3rd party basic authentication
const BASIC_AUTH_SECRET = "YOUR AUTH SECRET";

addEventListener("fetch", event => {
  event.respondWith(handleRequest(event.request));
});

/**
 * @param {Request} request
 * @return {Response}
 */
async function handleRequest(request) {
  let requestTimeMs = -Date.now();
  const response = await fetch(request);
  requestTimeMs += Date.now();

  // send the log record immediately
  const record = getLogRecord(request, response, requestTimeMs);
  await saveLogs([record]);

  return response;
}

/**
 * Parse the request and response into an expected format.
 *
 * @param {Request} request
 * @param {Response} response
 * @param {number} requestTimeMs The length of the request in ms
 */
function getLogRecord(request, response, requestTimeMs) {
  const url = request.url;
  const method = request.method;
  const userAgent = request.headers.get("user-agent");
  const referer = request.headers.get("Referer");
  const ip = request.headers.get("x-app-client-ip");
  const countryCode = request.headers.get("x-app-client-geo-countryCode");
  const status = response.status;

  // format the log record however the 3rd party logger expects
  return {
    countryCode,
    ip,
    level: "INFO",
    line: `${method} ${url} ${status} Additional logging info`,
    method,
    referer,
    requestTimeMs,
    status,
    timestamp: Date.now(),
    url,
    userAgent
    // ...additional fields
  };
}

/**
 * Send the logs off to the 3rd party logger.
 *
 * @param {array} records The collection of log records
 * @return {Promise}
 */
async function saveLogs(records) {
  const headers = new Headers();
  headers.append("Content-Type", "application/json; charset=UTF-8");
  headers.append("Authorization", `Basic ${BASIC_AUTH_SECRET}`);

  try {
    await fetch(LOG_URL, {
      method: "POST",
      body: JSON.stringify({ records }),
      headers
    });
  } catch (e) {
    console.error(e);
  }
}
