// @flow
import { u8 } from 'wasm-types';
import { varuint32 } from '../numbers';
import opcode from '../opcode';
import OutputStream from '../../utils/output-stream';

type Element = {
  functionIndex: number,
};

const emitElement = (stream: OutputStream) => (
  { functionIndex }: Element,
  index: number
) => {
  stream.push(varuint32, 0, 'table index');
  stream.push(u8, opcode.i32Const.code, 'offset');
  stream.push(varuint32, index, index.toString());
  stream.push(u8, opcode.End.code, 'end');
  stream.push(varuint32, 1, 'number of elements');
  stream.push(varuint32, functionIndex, 'function index');
};

const emit = (elements: Element[]) => {
  const stream = new OutputStream();
  stream.push(varuint32, elements.length, 'count');

  elements.forEach(emitElement(stream));

  return stream;
};

export default emit;
