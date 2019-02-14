# AssemblyScript WebAssembly

This script demonstrates how to use [AssemblyScript](https://github.com/AssemblyScript/assemblyscript) compiled to [WebAssembly](https://webassembly.org/) within a script.

## Getting Started

### Install Dependencies

[Install yarn](https://yarnpkg.com/en/docs/install) if it is not already installed and run it from the root of the `wasm-assembly-script` directory

```bash
yarn
```

### AssemblyScript

In our AssemblyScript [file](./assembly/index.ts), we export a function `fib` that returns the nth fibonnaci number

```ts
export function fib(n: i32): i32 {
  let t: i32;
  let a: i32 = 0;
  let b: i32 = 1;
  for (let i: i32 = 0; i < n; i++) {
    t = a + b;
    a = b;
    b = t;
  }
  return b;
}
```

### Build wasm

In order to access this function in our javascript script, we need to compile it to a `.wasm` file. To compile the AssemblyScript, run

```bash
yarn asbuild
```

which outputs an `optimized.wasm` file in the `build/` directory.

### Importing wasm

Our script imports the WASM file using [arraybuffer-loader](https://github.com/pine/arraybuffer-loader), setup in our [webpack.config.js](./webpack.config.js). Our script looks like this:

```js
import wasmBuffer from "./build/optimized.wasm";

const binary = new Uint8Array(wasmBuffer);
const memory = new WebAssembly.Memory({ initial: 256, maximum: 256 });
const wasmModule = new WebAssembly.Module(binary);
const instance = new WebAssembly.Instance(wasmModule, { env: { memory } })
  .exports;

addEventListener("fetch", event => {
  event.respondWith(handleRequest());
});

async function handleRequest() {
  return new Response(String(instance.fib(12)));
}
```

The wasm file is loaded into an ArrayBuffer, used to create a [WebAssembly.Module](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WebAssembly/Module), which is used to create a [WebAssembly.Instance](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WebAssembly/Instance). With the instance, we are able to call our function defined in AssemblyScript.

### Build js

To build our script, run

```bash
yarn build:js
```

The `dist/main.js` file will contain the runnable script.

### Build project

To build the entire project (combines `yarn asbuild` and `yarn build:js`), run

```bash
yarn build
```
