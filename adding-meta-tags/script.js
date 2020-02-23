// check the incoming request
addEventListener("fetch", event => {
    event.respondWith(fetchAndModify(event.request));
});

//function that runs on the requests
async function fetchAndModify(request) {
    const response = await fetch(request);

    // Check response is html content
    if (
        !response.headers.get("content-type") ||
        !response.headers.get("content-type").includes("text/html")
    ) {
        return response;
    }


    // Read response body.
    const text = await response.text();
    // modify the URL
    const url = response.url.replace("https://",'https://content.');


    // add the tag by performing replace on head .
    const modified = text.replace("<head>",'<head> <link rel="amphtml" href='+url+'/amp >');

    // Return modified response.
    return new Response(modified, {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers
    });
}
