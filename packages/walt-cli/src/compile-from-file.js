"use strict";

function compileFromFile(path, compile, { readFile }) {
  let resolve, reject;
  const promise = new Promise((r, rj) => {
    resolve = r;
    reject = rj;
  });

  readFile(path, "utf8", (error, data) => {
    if (error) {
      reject(error);
    } else {
      try {
        const wasm = compile(data, { encodeNames: false });
        resolve(wasm);
      } catch (e) {
        reject(e);
      }
    }
  });

  return promise;
}

module.exports = compileFromFile;
