function compile(buffer) {
  const memory = new WebAssembly.Memory({ initial: 1 });
  return WebAssembly.instantiate(buffer, {
    env: { memory, new: () => 0 }
  }).then(result => {
    const exports = result.instance.exports;
    window.alert(exports.test());
  });
}

export default compile;
