# Initialize an HLS Video Stream

_This example is explained in much more detail on the [StackPath blog](https://blog.stackpath.com/)._

The [HTTP Live Streaming (HLS)](https://en.wikipedia.org/wiki/HTTP_Live_Streaming) 
protocol changes a video stream's quality on-the-fly to provide the best fit of 
image quality and bandwidth usage while meeting the capabilities of the viewing 
device. This works well after a stream is established between a media server and 
the player, but what's the best way to figure out what the initial stream 
quality should be? 

If the server streams an initial media chunk that's too high in quality then 
viewers may experience lag or stutter until HLS adapts to a better stream 
quality. If the initial chunk's quality is too low then players will have a 
lossy or compressed viewing experience until the next chunk streams in at a 
better quality. 

Thankfully, a serverless script can analyze the media player and serve the best 
quality initial stream. This ensures the user gets the best video experience 
from the moment they hit "play". This example rearranges an [m3u8](https://en.wikipedia.org/wiki/M3U) 
playlist from an origin media server according to the capabilities of the 
requesting device, placing the best quality at the top of the playlist. 

## Prerequisites

* An origin server that serves a playlist. For example:
  
  ```
  #EXTM3U
  #EXT-X-VERSION:3
  #EXT-X-STREAM-INF:BANDWIDTH=5000000,RESOLUTION=1920x1080
  1080p.m3u8
  #EXT-X-STREAM-INF:BANDWIDTH=2800000,RESOLUTION=1280x720
  720p.m3u8
  #EXT-X-STREAM-INF:BANDWIDTH=1400000,RESOLUTION=842x480
  480p.m3u8
  #EXT-X-STREAM-INF:BANDWIDTH=800000,RESOLUTION=640x360
  360p.m3u8
  ```
  
  Note the highest bitrate is at the top of this playlist. This may be a great 
initial experience for desktop systems and TV sets, but may be a poor mobile 
experience. 

* An [OpenDDR](http://openddr.mobi/) API server endpoint. This script compares 
the requesting User-Agent against OpenDDR's exhaustive device lists. It's hard 
coded to use their demo server, but we recommend running your own instance to 
ensure reliability. A container image is available at 
[0x41mmar/openddr-api](https://hub.docker.com/r/0x41mmar/openddr-api) to run on 
[StackPath's Edge Compute](https://www.stackpath.com/products/edge-computing/containers/) 
or the platform of your choice. 

* A serverless scripting site on the StackPath platform configured to use your 
media server as an origin.

## Installation

Upload [hls.js](hls.js) to your serverless scripting site via the StackPath 
[control panel](https://control.stackpath.com/), [API](https://stackpath.dev/), 
or [CLI utility](https://github.com/stackpath/serverless-scripting-cli) to the 
same path as your origin's playlist. For instance, if your media server's 
playlist is at the path `/my-video.m3u8` then the `hls.js` script should be bound to 
the path `/my-video.m3u8`.

Once the script is in place it will serve a version of `/my-video.m3u8` that's 
rearranged and optimized for the requesting User-Agent.