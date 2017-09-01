import { EXTERN_GLOBAL, EXTERN_FUNCTION } from '../emitter/external_kind';
import { I32, I64, F32, F64 } from '../emitter/value_type';
import opcode, { opcodeFromOperator } from '../emitter/opcode';
import Syntax from '../Syntax';
import curry from 'curry';

// clean this up
export const getType = str => {
  switch(str) {
    case 'f32': return F32;
    case 'f64': return F64;
    case 'i32':
    default: return I32;
  }
};

const isLocal = node => ('localIndex' in node);
const scopeOperation = curry((op, node) => {
  const index = isLocal(node) ? node.localIndex : node.globalIndex;
  const kind = isLocal(node) ? op + 'Local' : op + 'Global';
  return { kind: opcode[kind], params: [index] };
});

const getConstOpcode = node => ({
  kind: opcode[node.type + 'Const'] || opcode.i32Const,
  params: [node.value]
});

const setInScope = scopeOperation('Set');
const getInScope = scopeOperation('Get');
const mergeBlock = (block, v) => {
  // some node types are a sequence of opcodes:
  // nested expressions for example
  if (Array.isArray(v))
    block = [...block, ...v];
  else
    block.push(v);
  return block;
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
  const value = {
    mutable: node.const ? 0 : 1,
    type: getType(node.type)
  };
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

export const generateReturn = node => {
  const parent = { postfix: [] };
  // Postfix in return statement should be a no-op UNLESS it's editing globals
  const block = generateExpression(node.expr, parent);
  if (parent.postfix.length) {
    // do we have postfix operations?
    // are they editing globals?
    // TODO: do things to globals
  }

  return block;
};

export const generateDeclaration = (node, parent) => {
  let block = [];
  if (node.init) {
    node.init.type = node.type;
    block = [...block, ...generateExpression(node.init)];
    block.push({ kind: opcode.SetLocal, params: [parent.locals.length] });
  }
  parent.locals.push(generateValueType(node));
  return block;
};

/**
 * Transform a binary expression node into a list of opcodes
 */
export const generateBinaryExpression = (node, parent) => {
  // Map operands first
  const block = node.operands
    .map(mapSyntax(parent))
    .reduce(mergeBlock, []);

  // Increment and decrement make this less clean:
  // If either increment or decrement then:
  //  1. generate the expression
  //  2. APPEND TO PARENT post-expressions
  //  3. return [];
  if (node.isPostfix && parent) {
    parent.postfix.push(block);
    // Simply return the left-hand
    return node.operands.slice(0, 1).map(mapSyntax(parent)).reduce(mergeBlock, []);
  }

  // Map the operator last
  block.push({
    kind: opcodeFromOperator(node)
  });

  return block;
};

export const generateAssignment = (node, parent) => {
  const subParent = { postfix: [] };
  const block = node.operands.slice(1)
    .map(mapSyntax(subParent))
    .reduce(mergeBlock, []);

  block.push(setInScope(node.operands[0]));

  return subParent.postfix.reduce(mergeBlock, block);
};

const generateFunctionCall = (node, parent) => {
  const block = node.arguments.map(mapSyntax(parent))
    .reduce(mergeBlock, []);

  block.push({
    kind: opcode.Call,
    params: [node.functionIndex]
  });

  return block;
}

const syntaxMap = {
  [Syntax.FunctionCall]: generateFunctionCall,
  // Unary
  [Syntax.Constant]: getConstOpcode,
  [Syntax.BinaryExpression]: generateBinaryExpression,
  [Syntax.Identifier]: getInScope,
  [Syntax.ReturnStatement]: generateReturn,
  // Binary
  [Syntax.Declaration]: generateDeclaration,
  [Syntax.Assignment]: generateAssignment
};

export const mapSyntax = curry((parent, operand) => {
  const mapping = syntaxMap[operand.Type];
  if (!mapping)
    throw new Error(`Unexpected Syntax Token ${operand.Type} : ${operand.id || operand.operator.value}`);
  return mapping(operand, parent);
});

export const generateExpression = (node, parent) => {
  const block = [node].map(mapSyntax(parent)).reduce(mergeBlock, []);
  return block;
}

export const generateCode = func => {
  const block = {
    code: [],
    locals: func.paramList.map(generateValueType)
  };

  // NOTE: Declarations have a side-effect of changing the local count
  //       This is why mapSyntax takes a parent argument
  block.code = func.body.map(mapSyntax(block)).reduce(mergeBlock, []);

  return block;
};

