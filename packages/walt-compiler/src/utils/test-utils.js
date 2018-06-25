import { link } from "walt-link";
import path from "path";
import fs from "fs";
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

function resolve(file, parent) {
  const root = parent ? path.dirname(parent) : __dirname;
  return path.resolve(root, file.slice(-5) === ".walt" ? file : file + ".walt");
}

function getFileContents(file, parent, mode) {
  return fs.readFileSync(resolve(file, parent), mode);
}

export const harness = (filepath, env) => t => {
  const memory = new WebAssembly.Memory({ initial: 1 });
  const view = new DataView(memory.buffer);
  const decodeText = getText(view);
  const build = link(
    filepath,
    { logger: console },
    {
      resolve,
      getFileContents,
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
      ...env,
    },
  }).then(module => module.instance.exports.run());
};
