import { SECTION_GLOBAL } from './sectionCodes';
import { u8 } from 'wasm-types';
import { I32 } from './value_type';
import { varuint32 } from './numbers';
import { emitString } from './string';
import opcode from './opcode';
import OutputStream from '../utils/output-stream';

const emitEntries = (globals) => {
  const payload = new OutputStream();
  payload.push(varuint32, globals.length, 'count');

  globals.forEach(({ kind, type, init }) => {
    if (kind === 'const') {
      switch (type) {
        case I32:
          payload.push(u8, I32, 'i32');
          payload.push(u8,   0, 'immuatble');
          payload.push(u8, opcode.i32Const.code, 'i32.const');
          payload.push(varuint32, init, `value (${init})`);
          payload.push(u8, opcode.End.code, 'end');
          break;
      }
    }
  });

  return payload;
};

export default function globals({ globals }) {
  if (!globals || !globals.length)
    return null;

  const stream = new OutputStream().push(u8, SECTION_GLOBAL, 'section Globals');
  const entries = emitEntries(globals);

  stream.push(varuint32, entries.size, 'size');
  stream.write(entries);

  return stream;
}
