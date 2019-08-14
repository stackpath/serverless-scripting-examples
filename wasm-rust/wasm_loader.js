
module.exports = function(source) {
  // We'll just do simple instantiation in this loader
  let code = "// Load WASM\n"
  const wasmBuf = new Uint8Array(source)
  code += "const wasmMod = new WebAssembly.Module(new Uint8Array([" + wasmBuf + "]))\n"
  // Load up the module to get import metadata and setup imports. We'll first
  // group by module name, then create a bunch of function proxies. This is a
  // hacky approach around proper import resolution.
  const wasmMod = new WebAssembly.Module(wasmBuf)
  // Key is module, val is array of imports
  const importMap = {}
  WebAssembly.Module.imports(wasmMod).forEach(mport => {
    if (mport.kind !== 'function') throw new Error('Only function imports supported')
    if (!importMap[mport.module]) importMap[mport.module] = []
    importMap[mport.module].push(mport)
  })
  let importCode = ''
  for (let modName in importMap) {
    let parts = ''
    importMap[modName].forEach(mport => {
      if (parts) parts += ','
      parts += "\n    '" + mport.name + "': function() { return require('" +
        modName + "')." + mport.name + ".apply(null, arguments) }"
    })
    if (importCode) importCode += ','
    importCode += "\n  '" + modName + "': {" + parts + "\n  }"
  }
  code += "const wasmImports = {" + importCode + "\n}\n"
  code += "const wasmInst = new WebAssembly.Instance(wasmMod, wasmImports)\n"
  code += "module.exports = wasmInst.exports\n"
  return code
}

// We need it as a buffer instead of a string
module.exports.raw = true