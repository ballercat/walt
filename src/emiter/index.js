import preamble from './preamble';
import invariant from 'invariant';
import OutputStream from '../utils/output-stream';

export default function emit(
  ast = {}
) {
  const stream = new OutputStream();

  // Write MAGIC and VERSION. This is now a valid WASM Module
  preamble(stream);

  return stream;
};

