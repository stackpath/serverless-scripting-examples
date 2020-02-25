import wasmBinary from './build/fib.wasm';
import WasmModule from './build/fib.js';

// Pass wasmBinary in so initialization does not have to fetch it
const instance = WasmModule({ wasmBinary });

async function handleRequest() {
  return new Response(String(instance._fib(12)));
}

addEventListener('fetch', (event) => {
  event.respondWith(handleRequest());
});
