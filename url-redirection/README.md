# URL Redirection

This script is live and in use by StackPath to redirect requests from the 
original StackPath developer site at 
[developer.stackpath.com](https://developer.stackpath.com/) to the newer site at 
[stackpath.dev](https://stackpath.dev). It defines a set of original URL paths 
and new paths to redirect to. Redirects occur as an HTTP 301 response to the 
browser. If a redirection rule isn't defined then the script returns the result from the original request.

## Installation

* Re-define `redirectHost` and `redirects` in `url-redirection.js` with your site's new host and redirection rules. 
* Upload `url-redirection.js` as a site's serverless script either via the [StackPath customer portal](https://control.stackpath.com) or [API](https://stackpath.dev/reference/serverless-scripting#createsitescript). The script should listen on the `/` path so every request to the site is intercepted by the script. 