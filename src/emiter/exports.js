import { SECTION_EXPORT } from './sectionCodes';
import { u8 } from 'wasm-types';
import { varuint32 } from './numbers';
import { emitString } from './string';
import OutputStream from '../utils/output-stream';

const emitEntries = (exports) => {
  const payload = new OutputStream();
  payload.push(varuint32, exports.length, 'count');

  exports.forEach(({ field, kind, index }) => {
    emitString(payload, field, 'field');

    payload.push(u8, kind, 'Global');
    payload.push(varuint32, index, 'index');
  });

  return payload;
};

export default function exports({ exports }) {
  if (!exports || !exports.length)
    return null;

  const stream = new OutputStream().push(u8, SECTION_EXPORT, 'section Exports');
  const entries = emitEntries(exports);

  stream.push(varuint32, entries.size, 'size');
  stream.write(entries);

  return stream;
}

