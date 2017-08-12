import preamble from './preamble';
import invariant from 'invariant';
import section from './section';
import OutputStream from '../utils/output-stream';

export default function emit(
  ast = {}
) {
  const stream = new OutputStream();

  // Write MAGIC and VERSION. This is now a valid WASM Module
  return stream.write(preamble())
    .write(section.function(ast))
    .write(section.imports(ast))
    .write(section.globals(ast))
    .write(section.exports(ast))
    .write(section.code(ast));
};

