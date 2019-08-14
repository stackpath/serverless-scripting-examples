# Rust WebAssembly

This example demonstrates how to use Rust with WebAssembly to leverage a Rust library inside Serverless Scripting.
Specifically, this example uses [image-rs](https://github.com/image-rs/image) to dynamically resize an image.

Features:

* TypeScript
* webpack with wasm-pack plugin
* Custom webpack loader to embed WASM
* Rust image library support
* Rust future integration with JS promises using wasm-bindgen-futures

The resulting script accepts an image `url` query parameter and given a `w` parameter, an optional `h` parameter
(defaults to `w` value), and an optional `exact` parameter to ignore aspect ratio, the image is loaded and resized
dynamically.

**NOTE:** This is just a tech demo and doesn't restrict the image URL by origin or anything. Developers are expected to
take these ideas and tailor them to their specific use cases.

## Usage

To build the bundled JS file, latest versions of [Rust](https://www.rust-lang.org/) and [Nodejs](https://nodejs.org/)
must be installed. Then, install of the Nodejs modules:

    npm install

To build the script, simply run:

    npm run build

This will build a service worker script in `dist/index.js` that can be used as a Serverless Script. The initial build is
slow but subsequent builds are much faster. To build the script in development mode instead and watch for any
Rust/TypeScript changes to automatically trigger rebuild, run `npm run dev` instead.

To test locally using `cloudworker` instead of uploading to StackPath, run:

    npm run cloudworker

This will host the script at http://localhost:3000, automatically reloading when changed.

Now that it's running, test it by navigating to
http://localhost:3000/?url=https://picsum.photos/id/1003/500/500&w=300&h=100&exact. That takes a 500x500 image and
resizes it to 300x100, setting `exact` to ignore aspect ratio and make it stretch.