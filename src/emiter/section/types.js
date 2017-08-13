import { u8 } from 'wasm-types';
import { I32, FUNC } from '../value_type';
import { varuint32, varint7, varint1 } from '../numbers';
import { emitString } from '../string';
import opcode from '../opcode';
import OutputStream from '../../utils/output-stream';

const emitType = (stream, { params, result }) => {
  // as of wasm 1.0 spec types are only of from === func
  stream.push(varint7, FUNC, 'func type');
  stream.push(varuint32, params.length, 'parameter count');
  params.forEach(type => stream.push(varint7, type, 'param'));
  if (result) {
    stream.push(varint1, 1, 'result count');
    stream.push(varint7, result, 'result type');
  }
}

const emitter = (types) => {
  const stream = new OutputStream();
  stream.push(varuint32, types.length, 'count');

  types.forEach(type => emitType(stream, type));

  return stream;
};

export default emitter;
