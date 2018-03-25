import test from "ava";
import compile from "..";
import { stringDecoder } from "../utils/string";
import { readFileSync } from "fs";
import path from "path";

const src = readFileSync(path.join(__dirname, "./string-spec.walt"), "utf8");

test("strings", t => {
  const memory = new WebAssembly.Memory({ initial: 1 });
  const view = new DataView(memory.buffer);

  return WebAssembly.instantiate(compile(src, { encodeNames: true }), {
    env: {
      memory,
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
  }).then(({ instance: { exports: { run } } }) => {
    run();
  });
});
