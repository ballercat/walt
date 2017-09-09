import OutputStream from '../../utils/output-stream';
import { u8, i8,  u32, } from 'wasm-types';
import { varint1, varint7, varuint32 } from '../numbers';
import { getTypeString } from '../value_type';
import { EXTERN_GLOBAL } from '../external_kind';
import { emitString } from '../string';
import writer from './writer';

const emit = entries => {
  const payload = new OutputStream().push(varuint32, entries.length, 'entry count');

  entries.forEach(({module, field, kind, global}) => {
    emitString(payload, module, 'module');
    emitString(payload, field, 'field');

    switch(kind) {
      case EXTERN_GLOBAL: {
        payload.push(u8, kind, 'Global');
        payload.push(u8, global, getTypeString(global));
        payload.push(u8, 0, 'immutable');
        break;
      }
    }
  });

  return payload;
};

export default emit;

