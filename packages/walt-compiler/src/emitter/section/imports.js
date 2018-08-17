// @flow
import OutputStream from '../../utils/output-stream';
import { u8 } from 'wasm-types';
import { varint1, varuint32 } from '../numbers';
import { getTypeString, ANYFUNC } from '../value_type';
import {
  EXTERN_GLOBAL,
  EXTERN_FUNCTION,
  EXTERN_TABLE,
  EXTERN_MEMORY,
} from '../external_kind';
import { emitString } from '../string';

const emit = (entries: any[]) => {
  const payload = new OutputStream().push(
    varuint32,
    entries.length,
    'entry count'
  );

  entries.forEach(entry => {
    emitString(payload, entry.module, 'module');
    emitString(payload, entry.field, 'field');

    switch (entry.kind) {
      case EXTERN_GLOBAL: {
        payload.push(u8, EXTERN_GLOBAL, 'Global');
        payload.push(u8, entry.type, getTypeString(entry.type));
        payload.push(u8, 0, 'immutable');
        break;
      }
      case EXTERN_FUNCTION: {
        payload.push(u8, entry.kind, 'Function');
        payload.push(varuint32, entry.typeIndex, 'type index');
        break;
      }
      case EXTERN_TABLE: {
        payload.push(u8, entry.kind, 'Table');
        payload.push(u8, ANYFUNC, 'function table types');
        payload.push(varint1, 0, 'has max value');
        payload.push(varuint32, 0, 'iniital table size');
        break;
      }
      case EXTERN_MEMORY: {
        payload.push(u8, entry.kind, 'Memory');
        payload.push(varint1, !!entry.max, 'has no max');
        payload.push(varuint32, entry.initial, 'initial memory size(PAGES)');
        if (entry.max) {
          payload.push(varuint32, entry.max, 'max memory size(PAGES)');
        }
        break;
      }
    }
  });

  return payload;
};

export default emit;
