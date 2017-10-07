import OutputStream from '../../utils/output-stream';
import { u8, i8,  u32, } from 'wasm-types';
import { varint1, varint7, varuint32 } from '../numbers';
import { getTypeString, ANYFUNC } from '../value_type';
import {
  EXTERN_GLOBAL,
  EXTERN_FUNCTION,
  EXTERN_TABLE,
  EXTERN_MEMORY
} from '../external_kind';
import { emitString } from '../string';
import writer from './writer';

const emit = entries => {
  const payload = new OutputStream().push(varuint32, entries.length, 'entry count');

  entries.forEach(({module, field, kind, global, typeIndex}) => {
    emitString(payload, module, 'module');
    emitString(payload, field, 'field');

    switch(kind) {
      case EXTERN_GLOBAL: {
        payload.push(u8, kind, 'Global');
        payload.push(u8, global, getTypeString(global));
        payload.push(u8, 0, 'immutable');
        break;
      }
      case EXTERN_FUNCTION: {
        payload.push(u8, kind, 'Function');
        payload.push(varuint32, typeIndex, 'type index');
        break;
      }
      case EXTERN_TABLE: {
        payload.push(u8, kind, 'Table');
        payload.push(u8, ANYFUNC, 'function table types');
        payload.push(varint1, 0, 'has max value');
        payload.push(varuint32, 0, 'iniital table size');
        break;
      }
      case EXTERN_MEMORY: {
        payload.push(u8, kind, 'Memory');
        payload.push(varint1, 0, 'has no max');
        payload.push(varuint32, 1, 'iniital memory size(PAGES)');
        break;
      }
    }
  });

  return payload;
};

export default emit;

