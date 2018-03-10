// @flow
import preamble from "./preamble";
import section from "./section";
import OutputStream from "../utils/output-stream";
import type { ProgramType } from "../generator/flow/types";

export default function emit(program: ProgramType) {
  const stream = new OutputStream();

  // Write MAGIC and VERSION. This is now a valid WASM Module
  return stream
    .write(preamble())
    .write(section.type(program))
    .write(section.imports(program))
    .write(section.function(program))
    .write(section.table(program))
    .write(section.memory(program))
    .write(section.globals(program))
    .write(section.exports(program))
    .write(section.element(program))
    .write(section.code(program))
    .write(section.name(program));
}
