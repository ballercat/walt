// @flow
import { varuint32, varint1, varint7 } from '../numbers';
import OutputStream from '../../utils/output-stream';

const typeBytecodes = {
  anyfunc: 0x70,
};

type TableEntryType = {
  initial: number,
  max?: number,
  type: string,
};

const emitEntry = (payload, entry: TableEntryType) => {
  payload.push(varint7, typeBytecodes[entry.type], entry.type);
  payload.push(varint1, entry.max ? 1 : 0, 'has max');
  payload.push(varuint32, entry.initial, 'initial table size');
  if (entry.max) {
    payload.push(varuint32, entry.max, 'max table size');
  }
};

export default function emitTables(tables: TableEntryType[]) {
  const stream = new OutputStream();
  stream.push(varuint32, tables.length, 'count');
  tables.forEach(entry => emitEntry(stream, entry));

  return stream;
}
