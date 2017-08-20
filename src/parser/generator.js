import {
  EXTERN_GLOBAL
} from '../emiter/external_kind';
import {
  I32,
  I64,
  F32
} from '../emiter/value_type';
import Syntax from './Syntax';

const getType = str => {
  switch(str) {
    case 'i32': return I32;
    default: return I32;
  }
};

export const generateExport = node => {
  const _export = {};
  if (node.decl) {
    _export.index = node.decl.globalIndex;
    _export.kind = EXTERN_GLOBAL;
    _export.field = node.decl.id;
  }

  return _export;
};

export const generateGlobal = node => {
  const _global = {};
  _global.mutable = node.const ? 0 : 1;
  _global.type = getType(node.type);

  const { Type, value } = node.init;
  if (Type === Syntax.Constant) {
    switch(_global.type) {
      case F32:
        _global.init = parseFloat(value);
        break;
      case I32:
      case I64:
      default:
        _global.init = parseInt(value);
    }
  }

  return _global;
};

