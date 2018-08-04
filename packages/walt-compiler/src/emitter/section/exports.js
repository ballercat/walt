// @flow
import { u8 } from 'wasm-types';
import { varuint32 } from '../numbers';
import { emitString } from '../string';
import OutputStream from '../../utils/output-stream';

const emit = (exports: any[]) => {
  const payload = new OutputStream();
  payload.push(varuint32, exports.length, 'count');

  exports.forEach(({ field, kind, index }) => {
    emitString(payload, field, 'field');

    payload.push(u8, kind, 'Global');
    payload.push(varuint32, index, 'index');
  });

  return payload;
};

export default emit;
