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

const isLocal = node => ('localIndex' in node);
const scopeOperation = (node, op) => {
  const index = isLocal(node) ? node.localIndex : node.globalIndex;
  const kind = isLocal(node) ? op + 'Local' : op + 'Global';
  return { kind: opcode[kind].code, params: [index] };
}

const getConstOpcode = node => ({
  kind: (opcode[node.type + 'Const'] || opcode.i32Const).code,
  params: [node.value]
});

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

export const generateBinaryExpression = node => {
  let block = [];
  if (node.left.Type === Syntax.Constant)
    block.push(getConstOpcode(node.left));
  if (node.right.Type === Syntax.Constant)
    block.push(getConstOpcode(node.right));

  if (node.left.Type === Syntax.BinaryExpression)
    block = [...block, ...generateBinaryExpression(node.left)];

  if (node.right.Type === Syntax.BinaryExpression)
    block = [...block, ...generateBinaryExpression(node.right)];

  if (node.left.Type === Syntax.Identifier)
    block.push(scopeOperation(node.left, 'Get'));

  if (node.right.Type === Syntax.Identifier)
    block.push(scopeOperation(node.right, 'Get'));

  //block.push(scopeOperation(node, 'Set'));
  switch(node.operator.value) {
    case '+':
      block.push({ kind: opcode[node.type + 'Add'].code });
      break;
    case '-':
      block.push({ kind: opcode[node.type + 'Sub'].code });
      break;
    case '*':
      block.push({ kind: opcode[node.type + 'Mul'].code });
      break;
    case '/':
      block.push({ kind: (opcode[node.type + 'Div'] || opcode[node.type + 'DivS']).code });
      break;
  }

  return block;
};

export const generateExpression = expr => {
  let block = [];
  switch(expr.Type) {
    case Syntax.BinaryExpression: {
      const ops = generateBinaryExpression(expr);
      block = [...block, ...ops];
      break;
    }
    case Syntax.Constant: {
      const op = opcode[expr.type + 'Const'];
      block.push({ kind: op.code, params: [expr.value] });
      break;
    }
    case Syntax.Identifier: {
      block.push(scopeOperation(expr, 'Get'));
      break;
    }
  };
  return block;
}

