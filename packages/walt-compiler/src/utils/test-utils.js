import { link } from "walt-link";
import { getText } from "../utils/string";
import {
  mapNode,
  walkNode,
  parser,
  semantics,
  validate,
  emitter,
  generator,
  prettyPrintNode,
} from "..";

export const harness = filepath => t => {
  const memory = new WebAssembly.Memory({ initial: 1 });
  const view = new DataView(memory.buffer);
  const decodeText = getText(view);
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
      prettyPrintNode,
    }
  );
  return build({
    env: {
      memory,
      MEMORY_OFFSET: 0,
      log: console.log,
      assert(strPointer, value, expected) {
        const text = decodeText(strPointer);

        t.is(value, expected, text);
      },
    },
  }).then(module => module.instance.exports.run());
};
