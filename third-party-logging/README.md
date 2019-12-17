# third-party-logging

These are examples of [serverless scripting](https://www.stackpath.com/products/edge-computing/serverless-scripting/)
workers that send logs to a 3rd party logging service.

This is the accompanying code for the blog post
[Serverless Scripting: Send Logs to Logging Services](https://support.stackpath.com/hc/en-us/articles/360029669792-Serverless-Scripting-Send-Logs-to-Logging-Services).

## Prerequisites

* Access to a 3rd party logging service
* Credentials (if necessary) to logging service

## Inline Logging

If your business needs require that you have robust logging that can't have logs
dropped, you'll want to use non-batched inline logging. For inline logging, each
inbound request received will send an outbound request to your 3rd party logging
service.

See `inline-logging.js` for details.

## Batched Logging

As long as your 3rd party logging service allows sending multiple records, you
are able to batch your logs so that you're not making an outbound request for
each inbound request you receive.

As referenced above, if you need to guarantee that logs are sent, do not used
batched logging. It is possible that the logging interval you specify lasts longer
than the script isolate, causing you to lose logs when terminated.

You can test the interval that works best for your use case. Shorter intervals
will produce more requests, but have a greater chance of sending all logs. Longer
intervals will produce less requests, but have a greater chance of losing logs.

See `batched-logging.js` for details.

## Important Notes

* Serverless scripts are only guaranteed to exist during the life of the request,
  but in practice in production, they will hang around for a short while listening
  for subsequent requests. This is important because it allows the batching
  functionality to work as expected.
* [Serverless scripting sandbox](https://sandbox.edgeengine.io/) scripts do NOT
  persist between requests. This means when you attempt to test batched logging
  in our sandbox, you will not get expected results.