import {
  EXTERN_GLOBAL,
  EXTERN_FUNCTION
} from '../emiter/external_kind';
import {
  I32,
  I64,
  F32,
  F64
} from '../emiter/value_type';
import opcode from '../emiter/opcode';
import Syntax from './Syntax';

export const getType = str => {
  switch(str) {
    case 'f32': return F32;
    case 'f64': return F64;
    case 'i32':
    default: return I32;
  }
};

export const generateExport = decl => {
  const _export = {};
  if (decl && decl.init) {
    _export.index = decl.globalIndex;
    _export.kind = EXTERN_GLOBAL;
    _export.field = decl.id;
  }

  if (decl && decl.func) {
    _export.index = decl.functionIndex;
    _export.kind = EXTERN_FUNCTION;
    _export.field = decl.id;
  }

  return _export;
};

export const generateValueType = node => {
  const value = {};
  value.mutable = node.const ? 0 : 1;
  value.type = getType(node.type);

  return value;
};

export const generateInit = node => {
  const _global = generateValueType(node);

  const { Type, value } = node.init;
  if (Type === Syntax.Constant) {
    switch(_global.type) {
      case F32:
      case F64:
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

export const generateType = node => {
  const type = { params: [], result: null };
  if (node.result !== 'void') {
    type.result = getType(node.result);
  }

  type.params = node.paramList.map(p => getType(p.type));

  return type;
}

export const generateCode = func => {
  // TODO generate locals
  const block = { locals: [], code: [] };

  // the binary encoding is not a tree per se, so we need to concat everything
  func.body.forEach(node => {
    switch(node.Type) {
      case Syntax.ReturnStatement:
        block.code = [...block.code, ...generateReturn(node)];
        break;
      case Syntax.Declaration: {
        // add possible set_local call
        if (node.init) {
          node.init.type = node.type;
          block.code = [...block.code, ...generateExpression(node.init)];
          block.code.push({ kind: opcode.SetLocal.code, params: [block.locals.length] });
        }

        // add a local entry
        block.locals.push(generateValueType(node));
        break;
      }
    }
  });

  return block;
};

export const generateReturn = node => {
  return generateExpression(node.expr);
};

export const generateExpression = expr => {
  const block = [];
  switch(expr.Type) {
    case Syntax.Constant: {
      const op = opcode[expr.type + 'Const'];
      block.push({ kind: op.code, params: [expr.value] });
      break;
    }
    case Syntax.Identifier: {
      if ('globalIndex' in expr)
        block.push({ kind: opcode.GetGlobal.code, params: [expr.globalIndex] });
      if ('localIndex' in expr)
        block.push({ kind: opcode.GetLocal.code, params: [expr.localIndex] });
      break;
    }
  };
  return block;
}

