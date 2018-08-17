// @flow
import { u8 } from 'wasm-types';
import { varint32, varuint32 } from '../numbers';
import opcode from '../opcode';
import OutputStream from '../../utils/output-stream';
import type { DataSectionType } from '../../generator/flow/types';

const emitDataSegment = (stream, segment) => {
  stream.push(varuint32, 0, 'memory index');

  const { offset, data } = segment;

  stream.push(u8, opcode.i32Const.code, opcode.i32Const.text);
  stream.push(varint32, offset, `segment offset (${offset})`);
  stream.push(u8, opcode.End.code, 'end');

  stream.push(varuint32, data.size, 'segment size');
  // We invert the control here a bit so that any sort of data could be written
  // into the data section. This buys us a bit of flexibility for the cost of
  // doing encoding earlier in the funnel
  stream.write(data);
};

export default function emit(dataSection: DataSectionType): OutputStream {
  const stream = new OutputStream();
  stream.push(varuint32, dataSection.length, 'entries');

  for (let i = 0, len = dataSection.length; i < len; i++) {
    const segment = dataSection[i];
    emitDataSegment(stream, segment);
  }

  return stream;
}
