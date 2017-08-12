import preamble from './preamble';
import invariant from 'invariant';
import imports from './imports';
import exports from './exports';
import code from './code';
import OutputStream from '../utils/output-stream';

export default function emit(
  ast = {}
) {
  const stream = new OutputStream();

  // Write MAGIC and VERSION. This is now a valid WASM Module
  return stream.write(preamble())
    .write(imports(ast))
    .write(exports(ast))
    .write(code(ast));
};

