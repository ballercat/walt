import OutputStream from '../utils/output-stream';
import { u8, i8,  u32, } from 'wasm-types';
import { varint1, varint7, varuint32 } from './numbers';
import { getTypeString } from './value_type';
import { _GLOBAL } from './external_kind';
import { IMPORT } from './sectionCodes';
import { emitString } from './string';

const emitEntries = entries => {
  const payload = new OutputStream();
  const length = entries.length;
  if (entries)
    payload.push(u8, length, 'entry count');

  entries.forEach(({module, field, kind, global}) => {
    emitString(payload, module, 'module');
    emitString(payload, field, 'field');


    switch(kind) {
      case _GLOBAL: {
        payload.push(u8, kind, 'Global');
        payload.push(u8, global, getTypeString(global));
        payload.push(u8, 0, 'immutable');
        break;
      }
    }
  });

  return payload;
};

export default function imports(ast) {
  const imports = ast.imports || {};
  if (!imports.entries || !imports.entries.length)
    return null;
  // Generate payload
  const stream = new OutputStream().push(u8, IMPORT, 'import section');
  const entries = emitEntries(imports.entries);

  stream.push(varuint32, entries.size, 'section size');
  stream.write(entries);

  return stream;
}

