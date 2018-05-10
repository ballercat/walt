import test from "ava";
import compile, { unstableAsyncCompile } from "..";
import { stringDecoder } from "../utils/string";
import { readFileSync } from "fs";
import path from "path";

const compilerWalt = readFileSync(
  path.join(__dirname, "./compiler-spec.walt"),
  "utf8"
);

const compileAndRun = (src, imports) =>
  WebAssembly.instantiate(compile(src, { encodeNames: true }), imports);

test("empty module compilation", t =>
  compileAndRun("").then(({ module, instance }) => {
    t.is(instance instanceof WebAssembly.Instance, true);
    t.is(module instanceof WebAssembly.Module, true);
  }));

test("invalid imports throw", t =>
  t.throws(() => compile("import foo from 'bar'")));

test("async compiler", t => {
  const memory = new WebAssembly.Memory({ initial: 1 });
  const view = new DataView(memory.buffer);

  return unstableAsyncCompile(compilerWalt)
    .then(wasm =>
      WebAssembly.instantiate(wasm.buffer(), {
        env: {
          memory,
          externalConst: 42,
          assert(strPointer, value, expected) {
            let text = "";

            const decoder = stringDecoder(view, strPointer);
            let iterator = decoder.next();
            while (!iterator.done) {
              text += String.fromCodePoint(iterator.value);
              iterator = decoder.next();
            }

            t.is(value, expected, text);
          },
        },
      })
    )
    .then(module => {
      module.instance.exports.run();
    });
});
