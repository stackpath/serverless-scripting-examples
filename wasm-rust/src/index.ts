import * as rustImage from '../rust-image/pkg/index'

rustImage.init()

addEventListener('fetch', ((event: FetchEvent) => {
  event.respondWith(handleRequest(event.request))
}) as EventListener)

async function handleRequest(request: Request) {
  let image: rustImage.WorkingImage|null = null
  try {
    // Pull the URL param
    const requestParams = new URL(request.url).searchParams
    const imageUrl = requestParams.get('url')
    if (!imageUrl) return new Response('Missing URL param', { status: 400 })
    // Load it
    image = new rustImage.WorkingImage(imageUrl)
    // Resize if params present
    const w = requestParams.get('w')
    if (w) {
      const wInt = parseInt(w)
      const hInt = parseInt(requestParams.get('h') || w)
      if (Number.isNaN(wInt) || Number.isNaN(hInt)) {
        return new Response('Invalid width or height', { status: 400 })
      }
      image = image.resize(wInt, hInt, requestParams.get('exact') !== null)
    }
    // Build it
    return await (image.build() as Promise<Response>)
  } catch (e) {
    if (e instanceof Response) return e
    return new Response('Error: ' + e.stack || e, { status: 500 })
  } finally {
    if (image) try { (image as any).free() } catch (e) { }
  }
}
