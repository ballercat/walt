// This thing is getting pretty large, should break this file up
import { EXTERN_GLOBAL, EXTERN_FUNCTION } from "../emitter/external_kind";
import { I32, I64, F32, F64 } from "../emitter/value_type";
import opcode, { opcodeFromOperator } from "../emitter/opcode";
import walkNode from "../utils/walk-node";
import Syntax from "../Syntax";
import invariant from "invariant";
import curry from "curry";
import {
  get,
  TABLE_INDEX,
  FUNCTION_INDEX,
  LOCAL_INDEX,
  GLOBAL_INDEX
} from "./metadata";

// clean this up
export const getType = str => {
  switch (str) {
    case "f32":
      return F32;
    case "f64":
      return F64;
    case "i32":
    case "Function":
    default:
      return I32;
  }
};

let syntaxMap = {};

const scopeOperation = curry((op, node) => {
  const local = get(LOCAL_INDEX, node);
  const _global = get(GLOBAL_INDEX, node);
  const index = local || _global;
  const kind = local ? op + "Local" : op + "Global";
  return { kind: opcode[kind], params: [index.payload] };
});

const getConstOpcode = node => ({
  kind: opcode[node.type + "Const"] || opcode.i32Const,
  params: [node.value]
});

const setInScope = scopeOperation("Set");
const getInScope = scopeOperation("Get");
const mergeBlock = (block, v) => {
  // some node types are a sequence of opcodes:
  // nested expressions for example
  if (Array.isArray(v)) block = [...block, ...v];
  else block.push(v);
  return block;
};

export const mapSyntax = curry((parent, operand) => {
  const mapping = syntaxMap[operand.Type];
  if (!mapping) {
    const value =
      operand.id ||
      operand.value ||
      (operand.operator && operand.operator.value);
    throw new Error(`Unexpected Syntax Token ${operand.Type} : ${value}`);
  }
  return mapping(operand, parent);
});

export const generateExport = node => {
  const _export = {};
  if (node && node.init) {
    return {
      index: node.globalIndex,
      kind: EXTERN_GLOBAL,
      field: node.id
    };
  }

  if (node && node.func) {
    return {
      get index() {
        return get(FUNCTION_INDEX, node).payload.functionIndex;
      },
      kind: EXTERN_FUNCTION,
      field: node.id
    };
  }

  invariant(false, "Unknown Export");
};

export const generateMemory = node => {
  const memory = { max: 0, initial: 0 };

  walkNode({
    [Syntax.Pair]: ({ params }) => {
      // This could procude garbage values but that is a fault of the source code
      const [{ value: key }, { value }] = params;
      memory[key] = parseInt(value);
    }
  })(node);

  return memory;
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
    switch (_global.type) {
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
  if (node.result && node.result !== "void") {
    type.result = getType(node.result);
  }

  type.params = node.params.map(p => getType(p.type));
  type.id = node.id;

  return type;
};

export const generateReturn = node => {
  const parent = { postfix: [] };
  // Postfix in return statement should be a no-op UNLESS it's editing globals
  const block = node.params.map(mapSyntax(parent)).reduce(mergeBlock, []);
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
    block.push({ kind: opcode.SetLocal, params: [node.localIndex] });
  }
  parent.locals.push(generateValueType(node));
  return block;
};

export const generateArrayDeclaration = (node, parent) => {
  const block = [];
  if (node.init) {
    block.push.apply(block, generateExpression(node.init));
    block.push({ kind: opcode.SetLocal, params: [node.localIndex] });
  }
  parent.locals.push(generateValueType(node));
  return block;
};

export const generateArraySubscript = (node, parent) => {
  const block = [
    ...node.params.map(mapSyntax(parent)).reduce(mergeBlock, []),
    { kind: opcode.i32Const, params: [4] },
    { kind: opcode.i32Mul, params: [] },
    { kind: opcode.i32Add, params: [] }
  ];

  // The last piece is the WASM opcode. Either load or store
  block.push({
    kind: opcode[node.type + "Load"],
    params: [
      // Alignment
      // TODO: make this extendible
      2,
      // Memory. Always 0 in the WASM MVP
      0
    ]
  });

  return block;
};

/**
 * Transform a binary expression node into a list of opcodes
 */
export const generateBinaryExpression = (node, parent) => {
  // Map operands first
  const block = node.params.map(mapSyntax(parent)).reduce(mergeBlock, []);
  // Increment and decrement make this less clean:
  // If either increment or decrement then:
  //  1. generate the expression
  //  2. APPEND TO PARENT post-expressions
  //  3. return [];
  if (node.isPostfix && parent) {
    parent.postfix.push(block);
    // Simply return the left-hand
    return node.params
      .slice(0, 1)
      .map(mapSyntax(parent))
      .reduce(mergeBlock, []);
  }

  // Map the operator last
  block.push({
    kind: opcodeFromOperator(node)
  });

  return block;
};

export const generateTernary = (node, parent) => {
  // TernaryExpression has a simple param layout of 2(TWO) total parameters.
  // It's a single param for the boolean check followed by
  // another param which is a Pair Node containing the 2(TWO) param results of
  // true and false branches.
  // The whole thing is encoded as an implicitly retunred if/then/else block.
  const mapper = mapSyntax(parent);
  const resultPair = node.params[1];

  // Truthy check
  const block = node.params
    .slice(0, 1)
    .map(mapper)
    .reduce(mergeBlock, []);

  // If Opcode
  block.push({
    kind: opcodeFromOperator(node),
    valueType: generateValueType(node)
  });

  // Map the true branch
  block.push.apply(
    block,
    resultPair.params
      .slice(0, 1)
      .map(mapper)
      .reduce(mergeBlock, [])
  );
  block.push({
    kind: opcodeFromOperator({ value: ":" })
  });

  // Map the false branch
  block.push.apply(
    block,
    resultPair.params
      .slice(-1)
      .map(mapper)
      .reduce(mergeBlock, [])
  );

  // Wrap up the node
  block.push({ kind: opcode.End });

  return block;
};

export const generateAssignment = (node, parent) => {
  const subParent = { postfix: [] };
  const block = node.params
    .slice(1)
    .map(mapSyntax(subParent))
    .reduce(mergeBlock, []);

  block.push(setInScope(node.params[0]));

  return subParent.postfix.reduce(mergeBlock, block);
};

const generateFunctionCall = (node, parent) => {
  const block = node.params.map(mapSyntax(parent)).reduce(mergeBlock, []);

  block.push({
    kind: opcode.Call,
    params: [get(FUNCTION_INDEX, node).payload.functionIndex]
  });

  return block;
};

const generateIndirectFunctionCall = (node, parent) => {
  const block = node.params.map(mapSyntax(parent)).reduce(mergeBlock, []);

  block.push({
    kind: opcode.CallIndirect,
    params: [node.typeIndex, { kind: opcode.Nop, params: [] }]
  });

  return block;
};

const generateFunctionPointer = node => {
  return {
    kind: opcode.i32Const,
    params: [get(TABLE_INDEX, node).payload]
  };
};

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
};

export const generateLoop = (node, parent) => {
  const block = [];
  const mapper = mapSyntax(parent);
  const reverse = {
    ">": "<",
    "<": ">",
    ">=": "<=",
    "<=": ">=",
    "==": "!=",
    "!=": "=="
  };

  const condition = node.params.slice(1, 2);
  condition[0].value = reverse[condition[0].value];
  const expression = node.params.slice(2, 3);

  block.push({ kind: opcode.Block, params: [0x40] });
  block.push({ kind: opcode.Loop, params: [0x40] });

  block.push.apply(block, condition.map(mapper).reduce(mergeBlock, []));
  block.push({ kind: opcode.BrIf, params: [1] });

  block.push.apply(block, node.body.map(mapper).reduce(mergeBlock, []));

  block.push.apply(block, expression.map(mapper).reduce(mergeBlock, []));
  block.push({ kind: opcode.Br, params: [0] });

  block.push({ kind: opcode.End });
  block.push({ kind: opcode.End });

  return block;
};

const generateSequence = (node, parent) => {
  return node.params.map(mapSyntax(parent)).reduce(mergeBlock, []);
};

const generateMemoryAssignment = (node, parent) => {
  const block = [
    ...node.params[0].params.map(mapSyntax(parent)).reduce(mergeBlock, []),
    // FIXME: 4 needs to be configurable
    { kind: opcode.i32Const, params: [4] },
    { kind: opcode.i32Mul, params: [] },
    { kind: opcode.i32Add, params: [] }
  ];

  block.push.apply(
    block,
    node.params
      .slice(1)
      .map(mapSyntax(parent))
      .reduce(mergeBlock, [])
  );

  // The last piece is the WASM opcode. Either load or store
  block.push({
    kind: opcode[node.type + "Store"],
    params: [
      // Alignment
      // TODO: make this extendible
      2,
      // Memory. Always 0 in the WASM MVP
      0
    ]
  });

  return block;
};

syntaxMap = {
  [Syntax.FunctionCall]: generateFunctionCall,
  [Syntax.IndirectFunctionCall]: generateIndirectFunctionCall,
  // Unary
  [Syntax.Constant]: getConstOpcode,
  [Syntax.BinaryExpression]: generateBinaryExpression,
  [Syntax.TernaryExpression]: generateTernary,
  [Syntax.IfThenElse]: generateIf,
  [Syntax.Identifier]: getInScope,
  [Syntax.FunctionIdentifier]: getInScope,
  [Syntax.FunctionPointer]: generateFunctionPointer,
  [Syntax.ReturnStatement]: generateReturn,
  // Binary
  [Syntax.Declaration]: generateDeclaration,
  [Syntax.ArrayDeclaration]: generateArrayDeclaration,
  [Syntax.ArraySubscript]: generateArraySubscript,
  [Syntax.Assignment]: generateAssignment,
  // Memory
  [Syntax.MemoryAssignment]: generateMemoryAssignment,
  // Imports
  [Syntax.Import]: generateImport,
  // Loops
  [Syntax.Loop]: generateLoop,
  // Comma separated lists
  [Syntax.Sequence]: generateSequence
};

export const generateExpression = (node, parent) => {
  const block = [node].map(mapSyntax(parent)).reduce(mergeBlock, []);
  return block;
};

export const generateElement = functionIndex => {
  return { functionIndex };
};

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
