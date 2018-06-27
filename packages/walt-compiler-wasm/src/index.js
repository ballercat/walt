// TODO: import compiler.walt

/**
 * Walt Compiler
 *
 * Uses WebAssembly internally/is self-hosted
 *
 * @param {String} source Source input
 */
export default function compile(source) {
  // return Promise.all([asyncSemantics(), asyncGenerator(), asyncEmitter()]).then(
  //   ([sem, gen, emit]) => {
  //     const lines = source.split("\n");
  //     const filename = "??";
  //     const encodeNames = true;
  //     const version = 0x1;
  //     return asyncParser(source)
  //       .then(sem)
  //       .then(ast => {
  //         validate(ast, { lines, filename });
  //         return ast;
  //       })
  //       .then(ast => {
  //         const code = gen(ast, {
  //           version,
  //           encodeNames,
  //           lines,
  //           filename,
  //         });
  //         const wasm = emit(code, {
  //           version,
  //           encodeNames,
  //           filename,
  //           lines,
  //         });

  //         return wasm;
  //       });
  //   }
  // );
};


