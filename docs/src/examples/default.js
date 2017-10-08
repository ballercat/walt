function compile(buffer) {
  return WebAssembly.instantiate(buffer).then(result => {
    const exports = result.instance.exports;
    window.alert(exports.echo());
  });
}

export default compile;
