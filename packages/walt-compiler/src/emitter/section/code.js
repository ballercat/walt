// @flow
import invariant from 'invariant';
import { u8, i32, f32, f64, i64 } from 'wasm-types';
import { varint32, varuint32, varint7, varint64 } from '../numbers';
import { getTypeString } from '../value_type';
import OutputStream from '../../utils/output-stream';
import opcode from '../opcode';

const emitLocal = (stream, local) => {
  if (local.isParam == null) {
    stream.push(varuint32, 1, 'number of locals of following type');
    stream.push(varint7, local.type, `${getTypeString(local.type)}`);
  }
};

const emitFunctionBody = (stream, { locals, code, debug: functionName }) => {
  // write bytecode into a clean buffer
  const body = new OutputStream();

  code.forEach(({ kind, params, valueType, debug }) => {
    invariant(
      typeof kind !== 'undefined',
      `Fatal error! Generated undefined opcode. debug code: ${JSON.stringify(
        debug
      )}`
    );
    // There is a much nicer way of doing this
    body.push(u8, kind.code, `${kind.text}  ${debug ? debug : ''}`);

    if (valueType) {
      body.push(u8, valueType.type, 'result type');
      body.push(u8, valueType.mutable, 'mutable');
    }

    // map over all params, if any and encode each on
    params.filter(p => typeof p !== 'undefined').forEach(p => {
      let type = varuint32;
      let stringType = 'i32.literal';

      // Memory opcode?
      if (kind.code >= 0x28 && kind.code <= 0x40) {
        type = varuint32;
        stringType = 'memory_immediate';
      } else {
        // either encode unsigned 32 bit values or floats
        switch (kind.result) {
          case f64:
            type = f64;
            stringType = 'f64.literal';
            break;
          case f32:
            type = f32;
            stringType = 'f32.literal';
            break;
          case i32:
            type = varint32;
            stringType = 'i32.literal';
            break;
          case i64:
            type = varint64;
            stringType = 'i64.literal';
            break;
          default:
            type = varuint32;
        }
      }
      body.push(type, p, `${stringType}`);
    });
  });

  // output locals to the stream
  const localsStream = new OutputStream();
  locals.forEach(local => emitLocal(localsStream, local));

  // body size is
  stream.push(varuint32, body.size + localsStream.size + 2, functionName);
  stream.push(varuint32, locals.length, 'locals count');

  stream.write(localsStream);
  stream.write(body);
  stream.push(u8, opcode.End.code, 'end');
};

const emit = (functions: any[]) => {
  // do stuff with ast
  const stream = new OutputStream();
  stream.push(varuint32, functions.length, 'function count');
  functions.forEach(func => emitFunctionBody(stream, func));

  return stream;
};

export default emit;
