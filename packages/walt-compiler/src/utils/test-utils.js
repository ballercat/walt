import { link } from "walt-link";
import { stringDecoder } from "../utils/string";
import {
  mapNode,
  walkNode,
  parser,
  semantics,
  validate,
  emitter,
  generator,
} from "..";

export const harness = filepath => t => {
  const memory = new WebAssembly.Memory({ initial: 1 });
  const view = new DataView(memory.buffer);

  const build = link(
    filepath,
    { logger: console },
    {
      mapNode,
      walkNode,
      parser,
      semantics,
      validate,
      emitter,
      generator,
    }
  );
  return build({
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
