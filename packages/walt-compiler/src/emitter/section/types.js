// @flow
import { FUNC, getTypeString } from '../value_type';
import { varuint32, varint7, varint1 } from '../numbers';
import OutputStream from '../../utils/output-stream';

const emitType = (stream, { params, result }, index) => {
  // as of wasm 1.0 spec types are only of from === func
  stream.push(varint7, FUNC, `func type (${index})`);
  stream.push(varuint32, params.length, 'parameter count');
  params.forEach(type => stream.push(varint7, type, 'param'));
  if (result) {
    stream.push(varint1, 1, 'result count');
    stream.push(varint7, result, `result type ${getTypeString(result)}`);
  } else {
    stream.push(varint1, 0, 'result count');
  }
};

const emit = (types: any[]) => {
  const stream = new OutputStream();
  stream.push(varuint32, types.length, 'count');

  types.forEach((type, index) => emitType(stream, type, index));

  return stream;
};

export default emit;
