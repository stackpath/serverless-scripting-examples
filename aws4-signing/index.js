import aws4 from 'aws4';

const credentials = {
  accessKeyId: process.env.ACCESS_KEY_ID,
  secretAccessKey: process.env.SECRET_ACCESS_KEY,
};

async function handleRequest() {
  const req = aws4.sign(
    {
      service: 's3',
      region: process.env.REGION,
      path: process.env.REQUEST_PATH,
    },
    credentials,
  );

  return fetch(`https://${req.hostname}${req.path}`, {
    headers: req.headers,
  });
}

addEventListener('fetch', (event) => {
  event.respondWith(handleRequest(event.request));
});
