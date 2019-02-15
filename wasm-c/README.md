# C WebAssembly

This script demonstrates how to use C code compiled to [WebAssembly](https://webassembly.org/) within a script.

## Getting Started

### Install Dependencies

- [Install yarn](https://yarnpkg.com/en/docs/install) if it is not already installed and run it from the root of the `wasm-c` directory

```bash
yarn
```

- Follow instructions for installing [Emscripten](https://emscripten.org/docs/getting_started/downloads.html)

### C

In our C [file](./C/fib.c), we define a function `fib` that returns the nth fibonnaci number. `EMSCRIPTEN_KEEPALIVE` informs Emscripten that we want to keep this function in our build even though nothing is calling it.

```C
#include <emscripten.h>

EMSCRIPTEN_KEEPALIVE
int fib(int n)
{
  int i, t, a = 0, b = 1;
  for (i = 0; i < n; i++)
  {
    t = a + b;
    a = b;
    b = t;
  }
  return b;
}
```

### Build WASM

In order to access this function in our JavaScript script, we need to compile it to a `.wasm` file. [Emscripten](https://emscripten.org/docs/getting_started/downloads.html) performs this compilation step. Assuming it has been installed correctly, run

```bash
yarn build:wasm
```

which outputs `build/fib.js` and `build/fib.wasm`. The JavaScript file contains code to make initializaing the [WebAssembly.Instance](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WebAssembly/Instance) easier and additional glue code.

### Importing WASM

Our script imports the WASM file using [arraybuffer-loader](https://github.com/pine/arraybuffer-loader), setup in our [webpack.config.js](./webpack.config.js). Our script looks like this:

```js
import wasmBinary from "./build/fib.wasm";
import WasmModule from "./build/fib.js";

// Pass wasmBinary in so initialization does not have to fetch it
let instance = WasmModule({ wasmBinary });

addEventListener("fetch", event => {
  event.respondWith(handleRequest());
});

async function handleRequest() {
  return new Response(String(instance._fib(12)));
}
```

The WASM file is loaded into an ArrayBuffer and is passed to the WasmModule that the build Emscripten js file exports. By including the WASM file contents in the script, it prevents having to fetch it separately, as would be typical in a browser setting. Our instance allows us to call our original function defined in C, prefixed with an underscore.

### Build js

To build our script, run

```bash
yarn build:js
```

The `dist/main.js` file will contain the runnable script.

### Build project

To build the entire project (combines `yarn build:wasm` and `yarn build:js`), run

```bash
yarn build
```
