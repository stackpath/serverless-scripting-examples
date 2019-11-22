// Replace this with a local running OpenDDR instance. OpenDDR analyzes a
// User-Agent and presents that device's capabilities.
//
// See http://openddr.mobi/ for more information.
// See https://hub.docker.com/r/0x41mmar/openddr-api for a deployable OpenDDR
// instance.
const OPENDDR_URL = 'http://openddr.demo.jelastic.com/servlet/classify?ua=';

// Available options for how to sort the original m3u8 playlist by quality.
const HIGHEST_FIRST = 1;
const HIGHEST_WITHIN_RESOLUTION = 2; // Use the highest quality within the the
                                     // device's resolution or use the next one
                                     // if the device is capable of >4Mbps
                                     // bitrate.
const MIDDLE_FIRST = 0;
const LOWEST_FIRST = -1;

// Bind the request handler to the incoming request.
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

/**
 * Sort an m3u8 playlist from the origin based on the requesting device's
 * capabilities
 *
 * @param {Request} request
 * @return {Response}
 */
async function handleRequest(request) {
  try {
    // Send the original request for the m3u8 playlist to the origin while
    // querying OpenDDR for device data based on the User-Agent.
    let [openDdrResponse, originResponse] = await Promise.all([
      fetch(OPENDDR_URL + request.headers.get('User-Agent')),
      fetch(request),
    ]);

    // If the playlist wasn't retrievable from the origin then error out early.
    if (!originResponse.ok) {
      return new Response(
        `Unable to retrieve origin playlist: ${originResponse.status} ${originResponse.statusText}`,
        {
          status: 502,
          headers: originResponse.headers,
        }
      );
    }

    // If device information couldn't be retrieved then error out early.
    if (!openDdrResponse.ok) {
      return new Response(
        `Unable to query device data: ${openDdrResponse.status} ${openDdrResponse.statusText}`,
        {
          status: 502,
          headers: openDdrResponse.headers,
        }
      );
    }

    const originalPlaylist = await originResponse.text();
    const deviceInformation = await openDdrResponse.json();

    // Parse the playlist from the origin into a list of bitrate, resolution,
    // and codec variants.
    const variants = parseM3u8(originalPlaylist);

    // Decide how to generate the new playlist based on the device's
    // capabilities.
    const config = buildModificationConfig(deviceInformation.result.attributes);

    // Sort the playlist by according to the parsed device information.
    const newPlaylist = buildNewPlaylist(variants, config);

    // Return the modified playlist.
    //
    // Base the new response on the response from the origin, using the newly
    // sorted playlist and a Content-Length header based on the new playlist.
    originResponse.headers.set('Content-Length', newPlaylist.length.toString());

    return new Response(newPlaylist, {
      status: originResponse.status,
      statusText: originResponse.statusText,
      headers: originResponse.headers,
    });
  } catch (e) {
    return new Response(`${e.message}\n${e.stack}`, {
      status: 500,
    });
  }
}

/**
 * Parse an m3u8 playlist into a collection of bitrates, resolutions, and codec
 * information.
 *
 * @see https://en.wikipedia.org/wiki/M3U
 * @param {String} body
 * @returns {Object[]}
 */
function parseM3u8(body) {
  const regex = /^#EXT-X-STREAM-INF:BANDWIDTH=(\d+)(?:,RESOLUTION=(\d+x\d+))?,?(.*)\r?\n(.*)$/gm;
  const qualities = [];

  let match;
  while ((match = regex.exec(body)) != null) {
    qualities.push({
      bitrate: parseInt(match[1]),
      resolution: match[2],
      playlist: match[4],
      codec: match[3],
    });
  }

  return qualities;
}

/**
 * Determine how to modify an m3u8 playlist based on device data.
 *
 * @param {Object} deviceData
 * @returns {{capAtResolution: boolean, qualityPriority: number, resolution: number}}
 */
function buildModificationConfig(deviceData) {
  // Assume 1280x720 resolution for desktop devices. Note that OpenDDR returns
  // all data as strings.
  if (deviceData.is_desktop === 'true') {
    return {
      qualityPriority: HIGHEST_FIRST,
      capAtResolution: false,
      resolution: 1280,
    };
  }

  const resolution = Math.max(deviceData.displayHeight, deviceData.displayWidth);

  // Default to lower quality videos for older mobile devices.
  if (
    (deviceData.device_os === 'iOS' && parseInt(deviceData.device_os_version) < 7)
    || (deviceData.device_os === 'Android' && parseInt(deviceData.device_os_version) < 6)
    || (deviceData['release-year'] < 2012)
  ) {
    return {
      qualityPriority: LOWEST_FIRST,
      capAtResolution: true,
      resolution: resolution,
    };
  }

  // Otherwise, the device is a high quality mobile device. Go for the highest
  // resolution possible while conserving bandwidth.
  return {
    qualityPriority: HIGHEST_WITHIN_RESOLUTION,
    capAtResolution: false,
    resolution: resolution,
  };
}

/**
 * Sort qualities, optionally cap at a certain resolution, and render the
 * remaining qualities into HLS manifest syntax.
 *
 * @param {Object[]} qualities
 * @param {Object} config
 * @returns {String}
 */
function buildNewPlaylist(qualities, config) {
  // Remove qualities with a resolution higher than the device's resolution.
  if (config.capAtResolution) {
    const newQualities = qualities.filter(
      q => Math.max.apply({}, q.resolution.split('x')) <= config.resolution
    );

    if (newQualities.length > 0) {
      qualities = newQualities;
    }
  }

  // Sort qualities so either the best or worst quality is the first.
  //
  // Use a direction value of 1 for descending or -1 for ascending. Sort in
  // descending order for any quality priorities other than lowest first.
  const dir = config.qualityPriority === LOWEST_FIRST ? -1 : 1;
  qualities.sort((a, b) => (a.bitrate > b.bitrate) ? -1 * dir : dir);

  // If applying the highest within resolution rule then process from top to
  // bottom to find variant satisfying conditions.
  if (config.qualityPriority === HIGHEST_WITHIN_RESOLUTION) {
    let topQuality;
    let i;

    for (i in qualities) {
      topQuality = qualities[i];

      // Separate dimensions into width and height and take the higher of the
      // two.
      const dimension = qualities[i].resolution.split('x').sort()[1];

      // Check if the quality's dimension is greater than the device's
      // resolution.
      if (dimension <= config.resolution) {
        // If the bitrate is under 4Mbps then qualities[i] is the preferred
        // quality.
        if (qualities[i].bitrate < 4000000) {
          break;
        }

        // Otherwise, set the top quality to the next one, if it exists.
        if (qualities.length > i) {
          i++;
          topQuality = qualities[i];
          break;
        }

        // If there are no more qualities to check then the current quality is
        // the top one.
        break;
      }
    }

    // Move the top quality to the top of the qualities list
    // qualities.splice(i, 1);
    qualities.splice(0, 0, topQuality);
  }

  // Otherwise, if the middle quality is preferred then move it to the top of
  // the list.
  if (config.qualityPriority === MIDDLE_FIRST) {
    const m = Math.floor(qualities.length / 2);
    const middleItem = qualities[m];
    qualities.splice(m, 1);
    qualities.splice(0, 0, middleItem);
  }

  // Render the newly sorted m3u8 playlist.
  return `
#EXTM3U
#EXT-X-VERSION:3
${qualities.map(
  q => {
    const codec = q.codec ? `,${q.codec}` : '';
    return `#EXT-X-STREAM-INF:BANDWIDTH=${q.bitrate},RESOLUTION=${q.resolution}${codec}\n${q.playlist}\n`;
  }
)}`.trim();
}
