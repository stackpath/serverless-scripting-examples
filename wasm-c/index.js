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
