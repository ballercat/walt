import { u8, i32, i64, f32, f64  } from 'wasm-types';
import { varuint32, varint7, varint1 } from '../numbers';
import { getTypeString } from '../value_type';
import OutputStream from '../../utils/output-stream';
import opcode, { opcodeMap } from '../opcode';

// TODO
const emitLocal = (stream, local) => {
  stream.push(varuint32, 1, 'number of locals of following type');
  stream.push(varint7, local.type, `${getTypeString(local.type)}`);
};

const emitFunctionBody = (stream, { locals, code }) => {
  // write bytecode into a clean buffer
  const body = new OutputStream();
  code.forEach(({ kind, params }) => {
    // There is a much nicer way of doing this
    body.push(u8, kind.code, kind.text);
    // map over all params, if any and encode each one
    (params || []).forEach(p => {
      let type = varuint32;
      // either encode unsigned 32 bit values or floats
      switch(kind.result) {
        case f64:
          type = f64;
          break;
        case f32:
          type = f32;
          break;
        case i32:
        default:
          type = varuint32;
      }
      body.push(type, p, 'param')
    });
  });

  // output locals to the stream
  const localsStream = new OutputStream();
  locals.forEach(local => emitLocal(localsStream, local));

  // body size is
  stream.push(varuint32, body.size + localsStream.size + 2, 'body size in bytes');
  stream.push(varuint32, locals.length, 'locals count');

  stream.write(localsStream);
  stream.write(body);
  stream.push(u8, opcode.End.code, 'end');
};

const emit = (functions) => {
  // do stuff with ast
  const stream = new OutputStream();
  stream.push(varuint32, functions.length, 'function count');
  functions.forEach(func => emitFunctionBody(stream, func));

  return stream;
}

export default emit;

