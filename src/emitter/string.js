import { u8 } from 'wasm-types';
import { varuint32 } from './numbers';

export function emitString(stream, string, debug = 'string length') {
  stream.push(varuint32, string.length, debug);
  for(let i = 0; i < string.length; i++)
    stream.push(u8, string.charCodeAt(i), string[i]);
  return stream;
}
