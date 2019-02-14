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
