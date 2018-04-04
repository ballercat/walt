import compile from "..";
import { stringDecoder } from "../utils/string";

export const harness = source => t => {
  const memory = new WebAssembly.Memory({ initial: 1 });
  const view = new DataView(memory.buffer);

  return WebAssembly.instantiate(compile(source, { encodeNames: true }), {
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
  }).then(module => module.instance.exports.run());
};
