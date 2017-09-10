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
    case 'Function':
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

export const generateImport = node => {
  const module = node.module;
  return node.fields.map(({ id, nativeType, typeIndex, global, kind }) => {
    kind = kind || ((nativeType && EXTERN_GLOBAL) || EXTERN_FUNCTION);
    return {
      module,
      field: id,
      global,
      kind,
      typeIndex
    };
  });
}

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
  if (node.result && node.result !== 'void') {
    type.result = getType(node.result);
  }

  type.params = node.params.map(p => getType(p.type));
  type.id = node.id;

  return type;
}

export const generateReturn = node => {
  const parent = { postfix: [] };
  // Postfix in return statement should be a no-op UNLESS it's editing globals
  const block = generateExpression(node.expr, parent);
  block.push({ kind: opcode.Return });
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

export const generateTernary = (node, parent) => {
  const mapper = mapSyntax(parent);
  const block = node.operands.slice(0, 1)
    .map(mapper)
    .reduce(mergeBlock, []);

  block.push({
    kind: opcodeFromOperator(node),
    valueType: generateValueType(node)
  });
  block.push.apply(block, node.operands.slice(1, 2).map(mapper).reduce(mergeBlock, []));
  block.push({
    kind: opcodeFromOperator({ operator: { value: ':' } })
  });
  block.push.apply(block, node.operands.slice(-1).map(mapper).reduce(mergeBlock, []));
  block.push({ kind: opcode.End });

  return block;
}

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

// probably should be called "generateBranch" and be more generic
// like handling ternary for example. A lot of shared logic here & ternary
const generateIf = (node, parent) => {
  const mapper = mapSyntax(parent);
  const block = [node.expr].map(mapper).reduce(mergeBlock, []);

  block.push({
    kind: opcode.If,
    // if-then-else blocks have no return value and the Wasm spec requires us to
    // provide a literal byte '0x40' for "empty block" in these cases
    params: [0x40]
  });

  // after the expression is on the stack and opcode is following it we can write the
  // implicit 'then' block
  block.push.apply(block, node.then.map(mapper).reduce(mergeBlock, []));

  // fllowed by the optional 'else'
  if (node.else.length) {
    block.push({ kind: opcode.Else });
    block.push.apply(block, node.else.map(mapper).reduce(mergeBlock, []));
  }

  block.push({ kind: opcode.End });
  return block;
}

const syntaxMap = {
  [Syntax.FunctionCall]: generateFunctionCall,
  // Unary
  [Syntax.Constant]: getConstOpcode,
  [Syntax.BinaryExpression]: generateBinaryExpression,
  [Syntax.TernaryExpression]: generateTernary,
  [Syntax.IfThenElse]: generateIf,
  [Syntax.Identifier]: getInScope,
  [Syntax.ReturnStatement]: generateReturn,
  // Binary
  [Syntax.Declaration]: generateDeclaration,
  [Syntax.Assignment]: generateAssignment,
  [Syntax.Import]: generateImport
};

export const mapSyntax = curry((parent, operand) => {
  const mapping = syntaxMap[operand.Type];
  if (!mapping) {
    const value = (operand.id || operand.value) || (operand.operator && operand.operator.value);
    throw new Error(`Unexpected Syntax Token ${operand.Type} : ${value}`);
  }
  return mapping(operand, parent);
});

export const generateExpression = (node, parent) => {
  const block = [node].map(mapSyntax(parent)).reduce(mergeBlock, []);
  return block;
}

export const generateElement = (functionIndex) => {
  return { functionIndex };
}

export const generateCode = func => {
  const block = {
    code: [],
    locals: []
  };

  // NOTE: Declarations have a side-effect of changing the local count
  //       This is why mapSyntax takes a parent argument
  block.code = func.body.map(mapSyntax(block)).reduce(mergeBlock, []);

  return block;
};

