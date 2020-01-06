// 3rd party logging url
const LOG_URL = "https://example.com/ingest";

// 3rd party basic authentication
const BASIC_AUTH_SECRET = "YOUR AUTH SECRET";

// interval (in milliseconds) for sending batched logs to 3rd party logger
const INTERVAL_MS = 10000;

// collection of unsent batched logs
let logs = [];

(function initSaveInterval() {
  // setup to save logs every X ms. this uses setTimeout so that when logs are
  // being sent, the next interval won't start until the previous one is complete
  setTimeout(async () => {
    // save logs when there are some present, and clear the logs afterwards so
    // they're not sent subsequent times causing duplicates
    if (logs.length > 0) {
      await saveLogs(logs);
      logs = [];
    }

    initSaveInterval();
  }, INTERVAL_MS);
})();

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

  // append the individual log to the collection so it may be sent in batch
  logs.push(getLogRecord(request, response, requestTimeMs));

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
 * Check the 3rd party logger's API documentation to see available headers.
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
    // Handle errors per your needs
    console.error(e);
  }
}
