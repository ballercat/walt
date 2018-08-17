// @flow
import { u8 } from 'wasm-types';
import { varuint32 } from './numbers';
import OutputStream from '../utils/output-stream';

export function emitString(
  stream: OutputStream,
  string: string,
  debug: string
) {
  stream.push(varuint32, string.length, debug);
  for (let i = 0; i < string.length; i++) {
    stream.push(u8, string.charCodeAt(i), string[i]);
  }
  return stream;
}
