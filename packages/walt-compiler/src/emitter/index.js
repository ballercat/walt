// @flow
import preamble from './preamble';
import section from './section';
import OutputStream from '../utils/output-stream';
import type { ProgramType } from '../generator/flow/types';
import type { ConfigType } from '../flow/types';

function emit(program: ProgramType, config: ConfigType) {
  const stream = new OutputStream();

  // Write MAGIC and VERSION. This is now a valid WASM Module
  const result = stream
    .write(preamble(program.Version))
    .write(section.type(program))
    .write(section.imports(program))
    .write(section.function(program))
    .write(section.table(program))
    .write(section.memory(program))
    .write(section.globals(program))
    .write(section.exports(program))
    .write(section.start(program))
    .write(section.element(program))
    .write(section.code(program))
    .write(section.data(program));

  if (true) {
    // config.encodeNames) {
    return result.write(section.name(program));
  }

  return result;
}

export const async = (): Promise<any> => {
  return Promise.resolve(emit);
};

export default emit;
