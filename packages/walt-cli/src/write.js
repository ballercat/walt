"use strict";

module.exports = function write(buffer, output, { open, write }) {
  let resolve, reject;
  const promise = new Promise((r, rj) => {
    resolve = r;
    reject = rj;
  });

  open(output, "w", (err, fd) => {
    if (err) {
      console.log(err);
      return reject(err);
    }
    write(fd, buffer, 0, buffer.length, 0, (error, bytes) => {
      if (error != null) {
        reject(error);
      } else {
        resolve();
      }
    });
  });

  return promise;
};
