// @flow
// Emits function section. For function code emitter look into code.js
import { varuint32, varint1 } from '../numbers';
import OutputStream from '../../utils/output-stream';

const emitEntry = (payload, entry) => {
  payload.push(varint1, entry.max ? 1 : 0, 'has no max');
  payload.push(varuint32, entry.initial, 'initial memory size(PAGES)');
  if (entry.max) {
    payload.push(varuint32, entry.max, 'max memory size(PAGES)');
  }
};

const emit = (memories: any[]) => {
  const stream = new OutputStream();
  stream.push(varuint32, memories.length, 'count');
  memories.forEach(entry => emitEntry(stream, entry));

  return stream;
};

export default emit;
