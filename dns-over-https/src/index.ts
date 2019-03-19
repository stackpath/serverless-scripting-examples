import dnsPacket from 'dns-packet'

const conf = {
  log: true,
  dnsHttpUrlFallback: 'https://dns.google.com/experimental',
  newTld: 'stackpath',
  proxyDnsTo: 'localhost'
}

addEventListener('fetch', ((event: FetchEvent) => {
  event.respondWith(handleRequest(event.request))
}) as EventListener)

async function handleRequest(request: Request): Promise<Response> {
  try {
    logRequest(request)
    const url = new URL(request.url)

    // If the request is a POST to /dns-query on our host, it's a DNS request.
    // If this is an HTTP request on our new TLD, handle that. Otherwise, it is
    // not handled by this worker.
    const dnsQuery = request.method === 'POST' && url.pathname === '/dns-query'
    let response: Response
    if (dnsQuery) response = await handleDnsQuery(request)
    else if (url.hostname.endsWith('.' + conf.newTld)) response = await handleNewTldRequest(request, url)
    else response = new Response('Not found: ' + request.url, { status: 404 })

    logResponse(response)
    return response
  } catch (e) {
    console.error('Error', e)
    return new Response(e.stack || e, { status: 500 })
  }
}

async function handleNewTldRequest(request: Request, url: URL): Promise<Response> {
  return new Response('Thanks for accessing the new .' + conf.newTld + ' TLD via URL ' + request.url)
}

async function handleDnsQuery(request: Request) {
  // We need to take out the body and parse the DNS packet
  const requestBody = await request.arrayBuffer()
  const requestPacket = dnsPacket.decode(Buffer.from(new Uint8Array(requestBody)))
  logDnsPacket('Request DNS: ', requestPacket)

  // We only handle single questions for A and AAAA of the new TLD
  const question = (requestPacket.questions && requestPacket.questions.length === 1) ? requestPacket.questions[0] : null
  if (question === null || 
    (question.type !== 'A' && question.type !== 'AAAA') ||
    !question.name.endsWith('.' + conf.newTld)) return deferToDnsFallback(request, requestBody)
  log('Responding to query for new TLD')

  // If we ask for our TLD on localhost, we'll just send back the fixed local
  // IPs. However, if our host is something else, we defer to the fallback and
  // just change the answer names so we get SOAs, NSs, As, CNAMEs, etc.
  let responsePacket: dnsPacket.Packet
  if (conf.proxyDnsTo === 'localhost') {
    log('Sending back localhost IPs')
    responsePacket = {
      id: requestPacket.id,
      type: 'response',
      flags: dnsPacket.RECURSION_DESIRED | dnsPacket.RECURSION_AVAILABLE,
      questions: requestPacket.questions,
      answers: [{
        type: question.type,
        class: 'IN',
        name: question.name,
        data: question.type === 'A' ? '127.0.0.1' : '::1',
        ttl: 600
      }]
    }
  } else {
    // Update the request packet to do a different host
    log('Proxying requested DNS name to: ', conf.proxyDnsTo)
    const origName = question.name
    requestPacket.questions.forEach(q => q.name = conf.proxyDnsTo)
    // Send it off
    const proxiedResponse = await deferToDnsFallback(request, dnsPacket.encode(requestPacket).buffer)
    // Change any response names back
    responsePacket = dnsPacket.decode(Buffer.from(new Uint8Array(await proxiedResponse.arrayBuffer())))
    responsePacket.questions.forEach(q => {
      if (q.name === conf.proxyDnsTo) q.name = origName
    })
    responsePacket.answers.forEach(a => {
      if (a.name === conf.proxyDnsTo) a.name = origName
    })
  }
  
  // Send the response back
  const responseBody = dnsPacket.encode(responsePacket).buffer
  if (conf.log) logDnsPacket('Response DNS (custom): ', dnsPacket.decode(Buffer.from(new Uint8Array(responseBody))))
  return new Response(dnsPacket.encode(responsePacket).buffer, {
    status: 200,
    headers: { 'Content-Type': 'application/dns-message' }
  })
}

async function deferToDnsFallback(request: Request, requestBody: ArrayBuffer) {
  // Just create a request that mimics the original and send it off
  log('Falling back to other DNS at: ', conf.dnsHttpUrlFallback)
  const newRequest = new Request(conf.dnsHttpUrlFallback, {
    method: request.method,
    headers: { 'Content-Type': 'application/dns-message' },
    body: requestBody,
  })
  const response = await fetch(newRequest)
  const responseContentType = response.headers.get('content-type')
  if (responseContentType !== 'application/dns-message') {
    const respText = await response.clone().text()
    throw new Error('Got other content type, resp text: ' + respText)
  }

  // Log the DNS packet before returning
  if (conf.log) try {
    const responseBody = await response.clone().arrayBuffer()
    logDnsPacket('Response DNS (deferred): ', dnsPacket.decode(Buffer.from(new Uint8Array(responseBody))))
  } catch (e) { }
  return response
}

function log(...args: any[]) {
  if (conf.log) console.log(...args)
}

function logRequest(request: Request) {
  if (!conf.log) return
  log('Request: ', request.method, request.url)
  for (const [key, val] of request.headers) log('Request header: ', key, val)
}

function logResponse(response: Response) {
  if (!conf.log) return
  log('Response: ', response.status)
  for (const [key, val] of response.headers) log('Response header: ', key, val)
}

function logDnsPacket(message: string, packet: dnsPacket.Packet) {
  if (!conf.log) return
  log(message, packet)
  if (packet.additionals) packet.additionals.forEach(v => log(message, 'Additional: ', v))
}