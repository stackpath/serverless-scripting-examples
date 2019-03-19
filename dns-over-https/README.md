# DNS over HTTPS

This is an example of an [EdgeEngine](https://www.stackpath.com/products/edgeengine/) worker that responds to
[DNS over HTTPS (DoH)](https://en.wikipedia.org/wiki/DNS_over_HTTPS) requests. It delegates all calls to the Google DNS
over HTTPS server for all requests except for `.stackpath` which it will use another site's IPs for.

### Running Locally

Prereqs:

* Latest [Go](https://golang.org/)
* Latest LTS [Node.js](https://nodejs.org)
* Latest [mkcert](https://github.com/FiloSottile/mkcert) on the PATH (and `mkcert -install` run at some point)
* Latest Firefox (also expects root CA cert created by `mkcert` imported in Firefox for whatever profile you're testing
  with)

Install deps:

    npm install

Gen certs:

    npm run genlocalcert

Then in one terminal:

    npm run dev

And in another:

    npm run httpsworker

Now a DNS over HTTPS worker is started on 3001 (HTTP side is 3000) listening for updates. To test, set the following
Firefox [Trusted Recursive Resolver (TRR)](https://wiki.mozilla.org/Trusted_Recursive_Resolver) values in `about:config`
(do in separate profile if preferred):

* Set `network.trr.mode` to `2` which makes Firefox try this DNS server before system fallback
* Set `network.trr.uri` to `https://localhost:3001/dns-query` to set the DNS over HTTPS URL

Now go do `about:networking` and do a `DNS Lookup` for `mywebsite.stackpath`. You should see local IPs.

### Deploy on EdgeEngine

Change `proxyDnsTo` in `src/index.ts` to given CDN domain (e.g. `a1b2c3d4.stackpathcdn.com`) and set `logs` to `false`.
Then compile:

    npm run build

Take `dist/index.js` and upload an EdgeEngine script in the [StackPath portal](https://control.stackpath.com/). Also in
the portal, add `Delivery Domain` for `mywebsite.stackpath`. Then set the Firefox `network.trr.uri` setting to the CDN
name and should work.