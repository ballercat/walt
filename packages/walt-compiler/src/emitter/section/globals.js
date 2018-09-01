// @flow
import { u8, f32, f64 } from 'wasm-types';
import { I32, I64, F64, F32, getTypeString } from '../value_type';
import { varuint32, varint32, varint64 } from '../numbers';
import opcode from '../opcode';
import OutputStream from '../../utils/output-stream';

const encode = (payload, { type, init, mutable }) => {
  payload.push(u8, type, getTypeString(type));
  payload.push(u8, mutable, 'mutable');
  // Encode the constant
  switch (type) {
    case I32:
      payload.push(u8, opcode.i32Const.code, opcode.i32Const.text);
      payload.push(varint32, init, `value (${init})`);
      break;
    case F32:
      payload.push(u8, opcode.f32Const.code, opcode.f32Const.text);
      payload.push(f32, init, `value (${init})`);
      break;
    case F64:
      payload.push(u8, opcode.f64Const.code, opcode.f64Const.text);
      payload.push(f64, init, `value (${init})`);
      break;
    case I64:
      payload.push(u8, opcode.i64Const.code, opcode.i64Const.text);
      payload.push(varint64, init, `value (${init})`);
  }

  payload.push(u8, opcode.End.code, 'end');
};

const emit = (globals: any[]) => {
  const payload = new OutputStream();
  payload.push(varuint32, globals.length, 'count');

  globals.forEach(g => encode(payload, g));

  return payload;
};

export default emit;
