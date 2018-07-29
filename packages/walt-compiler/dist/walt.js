(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(factory((global.Walt = {})));
}(this, (function (exports) { 'use strict';

//      

// Main Program
const Program = "Program";
const Keyword = "Keyword";
const Export = "Export";
const Import = "Import";
const Statement = "Statement";
const IfThenElse = "IfThenElse";
const Select = "Select";
const Else = "Else";
const UnaryExpression = "UnaryExpression";
const BinaryExpression = "BinaryExpression";
const TernaryExpression = "TernaryExpression";
const NumberLiteral = "NumberLiteral";
const StringLiteral = "StringLiteral";
const CharacterLiteral = "CharacterLiteral";
const Punctuator = "Punctuator";
const Identifier = "Identifier";
const ArraySubscript = "ArraySubscript";
const Constant = "Constant";
const Type = "Type";
const GenericType = "GenericType";
const UserType = "UserType";
const FunctionType = "FunctionType";
const Declaration = "Declaration";
const ImmutableDeclaration = "ImmutableDeclaration";
const FunctionDeclaration = "FunctionDeclaration";
const ArrayDeclaration = "ArrayDeclaration";
const IndirectFunctionCall = "IndirectFunctionCall";
const FunctionCall = "FunctionCall";
const Loop = "Loop";
const MemoryAssignment = "MemoryAssignment";
const Assignment = "Assignment";
const Param = "Param";
const Typedef = "Typedef";
const Struct = "Struct";
const ReturnStatement = "ReturnStatement";
const Sequence = "Sequence";
const ObjectLiteral = "ObjectLiteral";
const Pair = "Pair";
const TypeCast = "TypeCast";
const Break = "Break";
const Comment = "Comment";
const Sizeof = "Sizeof";
const Spread = "Spread";
const Closure = "Closure";
const Noop = "Noop";
const ClosureType = "ClosureType";
const Block = "Block";
const ObjectField = "ObjectField";
const FunctionIndex = "FunctionIndex";
const FunctionIdentifier = "FunctionIdentifier";
const FunctionPointer = "FunctionPointer";
const FunctionArguments = "FunctionArguments";
const FunctionResult = "FunctionResult";
const FunctionLocals = "FunctionLocals";
const NativeMethod = "NativeMethod";

const i32 = "i32";
const f32 = "f32";
const i64 = "i64";
const f64 = "f64";
const Memory = "Memory";
const Table = "Table";
const bool = "bool";

const builtinTypes = {
  i32,
  f32,
  i64,
  f64,
  Memory,
  Table,
  bool
};

const statements = {
  // Main Program
  Program,

  // Syntax Nodes
  Export,
  Import,
  IfThenElse,
  Else,
  Declaration,
  ImmutableDeclaration,
  FunctionDeclaration,
  ArrayDeclaration,
  Loop,
  MemoryAssignment,
  Assignment,
  Typedef,
  Struct,
  ReturnStatement,
  Sequence,
  ObjectLiteral,
  Pair,
  Break,
  Comment,
  Sizeof,
  Spread,
  Noop,
  Block
};

var Syntax = {
  // Main Program
  Program,

  // Syntax Nodes
  Keyword,
  Export,
  Import,
  Statement,
  IfThenElse,
  Select,
  Else,
  UnaryExpression,
  BinaryExpression,
  TernaryExpression,
  NumberLiteral,
  StringLiteral,
  CharacterLiteral,
  Punctuator,
  Identifier,
  ArraySubscript,
  Constant,
  Type,
  GenericType,
  UserType,
  FunctionType,
  Declaration,
  ImmutableDeclaration,
  FunctionDeclaration,
  ArrayDeclaration,
  IndirectFunctionCall,
  FunctionCall,
  Loop,
  MemoryAssignment,
  Assignment,
  Param,
  Typedef,
  Struct,
  ReturnStatement,
  Sequence,
  ObjectLiteral,
  Pair,
  TypeCast,
  Break,
  Comment,
  Sizeof,
  Spread,
  Closure,

  Noop,

  // Semantic Nodes
  ClosureType,
  Block,
  ObjectField,
  FunctionIndex,
  FunctionIdentifier,
  FunctionPointer,
  FunctionArguments,
  FunctionResult,
  FunctionLocals,

  // Natives
  NativeMethod
};

var _extends = Object.assign || function (target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i];

    for (var key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        target[key] = source[key];
      }
    }
  }

  return target;
};













var objectWithoutProperties = function (obj, keys) {
  var target = {};

  for (var i in obj) {
    if (keys.indexOf(i) >= 0) continue;
    if (!Object.prototype.hasOwnProperty.call(obj, i)) continue;
    target[i] = obj[i];
  }

  return target;
};

//      
function blockParser(ctx) {
  const node = ctx.startNode();
  const params = [];
  if (ctx.eat(["{"])) {
    let stmt;
    while (ctx.token && ctx.token.value !== "}") {
      stmt = statement(ctx);
      if (stmt) {
        params.push(stmt);
      }
    }
    ctx.expect(["}"]);
  }

  return ctx.endNode(_extends({}, node, {
    params
  }), Syntax.Block);
}

//      
const makeResult = node => _extends({
  range: []
}, node, {
  meta: {},
  params: [],
  Type: Syntax.FunctionResult,
  value: "FUNCTION_RESULT"
});

const makeArgs = node => _extends({
  range: []
}, node, {
  params: (() => {
    if (node == null) {
      return [];
    }
    return node.Type === Syntax.Sequence ? node.params : [node];
  })(),
  type: null,
  meta: {},
  value: "FUNCTION_ARGUMENTS",
  Type: Syntax.FunctionArguments
});

function parselambda(ctx, op, operands) {
  const args = operands[0];
  const result = operands[1];
  const block = operands[2] || result || args;
  operands.splice(-3);

  let baseParams = [];
  const lambda = _extends({}, op, {
    type: "i32",
    range: [ctx.token.start, ctx.token.end],
    meta: {},
    Type: Syntax.Closure,
    params: []
  });

  const [lhs, rhs] = args.params;
  // The reason why this is so tricky to parse is because there are too many
  // optional parts of a coluse definition, like arguments and return type
  if (args.Type === Syntax.Pair) {
    if (lhs != null && rhs != null) {
      baseParams = lhs.Type === Syntax.Pair ? [makeArgs(lhs), makeResult(rhs)] : [makeArgs(lhs.Type === Syntax.Sequence ? lhs : args), makeResult(rhs.Type === Syntax.Type ? rhs : null)];
    } else {
      baseParams = [makeArgs(null), makeResult(lhs)];
    }
  } else if (args.Type === Syntax.Sequence) {
    baseParams = [makeArgs(args), makeResult(result.Type === Syntax.Type ? result : null)];
  } else {
    baseParams = [makeArgs(null), makeResult(null)];
  }

  return _extends({}, lambda, {
    params: [_extends({}, lambda, {
      Type: Syntax.FunctionDeclaration,
      params: [...baseParams, block]
    })]
  });
}

//      
const subscriptFromNode = (ctx, node) => {
  const [identifier] = node.params;

  return ctx.endNode(_extends({}, node, { value: identifier.value }), Syntax.ArraySubscript);
};

//      
function binary(ctx, op, params) {
  const node = _extends({}, params[0]);
  node.value = op.value;
  node.params = params;

  let Type$$1 = Syntax.BinaryExpression;
  if (node.value === "=") {
    Type$$1 = Syntax.Assignment;
  } else if (node.value === "-=" || node.value === "+=") {
    Type$$1 = Syntax.Assignment;
    const value = node.value[0];
    node.value = "=";
    node.params = [node.params[0], binary(ctx, _extends({}, op, { value }), [node.params[0], node.params[1]])];
  } else if (node.value === "[" || node.value === ".") {
    return subscriptFromNode(ctx, node);
  } else if (node.value === ":") {
    Type$$1 = Syntax.Pair;
  } else if (node.value === "||" || node.value === "&&") {
    Type$$1 = Syntax.Select;
  }

  return ctx.endNode(node, Type$$1);
}

function unary(ctx, op, params) {
  const [target] = params;
  switch (op.value) {
    case "--":
      return _extends({}, target, {
        Type: Syntax.UnaryExpression,
        value: "-",
        meta: {},
        params: [_extends({}, target, {
          value: "0",
          Type: Syntax.Constant,
          params: [],
          meta: {}
        }), target]
      });
    case "!":
    case "~":
      return _extends({}, target, {
        value: op.value,
        params,
        Type: Syntax.UnaryExpression
      });
    default:
      return _extends({}, op, {
        range: [op.start, target.range[1]],
        meta: {},
        Type: Syntax.Spread,
        params: [target]
      });
  }
}

function objectLiteral(ctx, op, params) {
  const node = ctx.startNode(op);
  node.params = params;
  return ctx.endNode(node, Syntax.ObjectLiteral);
}

const ternary = (ctx, op, params) => {
  const node = ctx.startNode(params[0]);
  node.params = params;
  node.value = op.value;
  node.type = params[params.length - 1].type;

  return ctx.endNode(node, Syntax.TernaryExpression);
};

const flattenSequence = sequence => {
  return sequence.reduce((memo, node) => {
    if (node.Type === Syntax.Sequence) {
      memo.push.apply(memo, flattenSequence(node.params));
    } else {
      memo.push(node);
    }

    return memo;
  }, []);
};

// Sequence is a list of comma separated nodes. It's a slighlty special operator
// in that it unrolls any other sequences into it's own params
const sequence = (ctx, op, params) => {
  const node = ctx.startNode(params[0]);
  node.value = op.value;
  node.params = flattenSequence(params);
  return ctx.endNode(node, Syntax.Sequence);
};

// Abstraction for handling operations
const operator = (ctx, operators, operands) => {
  const op = operators.pop();
  switch (op.value) {
    case "=>":
      return parselambda(ctx, op, operands);
    case "?":
      return ternary(ctx, op, operands.splice(-2));
    case ",":
      return sequence(ctx, op, operands.splice(-2));
    case "{":
      return objectLiteral(ctx, op, operands.splice(-1));
    case "--":
    case "...":
    case "sizeof":
    case "~":
    case "!":
      return unary(ctx, op, operands.splice(-1));
    default:
      return binary(ctx, op, operands.splice(-2));
  }
};

//      

function parseConstant(ctx) {
  const node = ctx.startNode();
  const value = ctx.token.value;
  const type = value.toString().indexOf(".") !== -1 ? "f32" : "i32";
  return ctx.endNode(_extends({}, node, { type, value }), Syntax.Constant);
}

//      
// Note: string literal does not increment the token.
function stringLiteral(ctx) {
  const node = ctx.startNode();
  node.value = ctx.token.value.substring(1, ctx.token.value.length - 1);

  // Replace escape sequences
  switch (node.value) {
    case "\\b":
      node.value = "\b";
      break;
    case "\\f":
      node.value = "\f";
      break;
    case "\\n":
      node.value = "\n";
      break;
    case "\\r":
      node.value = "\r";
      break;
    case "\\t":
      node.value = "\t";
      break;
    case "\\v":
      node.value = "\v";
      break;
    case "\\0":
      node.value = "\0";
      break;
    case "\\'":
      node.value = "'";
      break;
    case '\\"':
      node.value = '"';
  }

  const Type$$1 = ctx.token.value[0] === "'" && Array.from(node.value).length === 1 ? Syntax.CharacterLiteral : Syntax.StringLiteral;
  return ctx.endNode(node, Type$$1);
}

//      

function builtInType(ctx) {
  if (ctx.stream.peek().value === "<") {
    const valueType = ctx.token.value;
    ctx.eat(["Memory", "Table"]);
    ctx.eat(["<"]);
    ctx.eat(["{"]);
    const node = ctx.makeNode({
      value: valueType,
      type: valueType,
      params: [expression(ctx)]
    }, Syntax.Type);
    ctx.eat(["}"]);
    return node;
  }

  return ctx.makeNode({ value: ctx.token.value, type: ctx.token.value }, Syntax.Type);
}

//      
// More or less JavaScript precedence
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Operator_Precedence

const PRECEDENCE_MEMBER_ACCESS = 19;

const PRECEDENCE_NOT = 18;
const PRECEDENCE_ASSIGNMENT = 3;


const PRECEDENCE_DIVIDE = 1;
const PRECEDENCE_MULTIPLY = 1;
const PRECEDENCE_ADDITION = 0;
const PRECEDENCE_SUBTRACTION = 0;
const PRECEDENCE_SHIFT = -1;
const PRECEDENCE_COMMA = -2;
const PRECEDENCE_BITWISE_XOR = -2;
const PRECEDENCE_SPREAD = -1;
const PRECEDENCE_BITWISE_AND = -1;
const PRECEDENCE_BITWISE_OR = -3;
const PRECEDENCE_LOGICAL_AND = -4;

const PRECEDENCE_LOGICAL_OR = -5;
const PRECEDENCE_KEY_VALUE_PAIR = -1;

const PRECEDENCE_PARAMS = -99;

const precedence = {
  "=>": PRECEDENCE_PARAMS,
  "(": PRECEDENCE_PARAMS,
  ",": PRECEDENCE_COMMA,
  as: PRECEDENCE_COMMA + 1,
  ">>": PRECEDENCE_SHIFT,
  ">>>": PRECEDENCE_SHIFT,
  "<<": PRECEDENCE_SHIFT,
  "+": PRECEDENCE_ADDITION,
  "-": PRECEDENCE_SUBTRACTION,
  "*": PRECEDENCE_MULTIPLY,
  "/": PRECEDENCE_DIVIDE,
  "==": 2,
  "!=": 2,
  ".": PRECEDENCE_MEMBER_ACCESS,
  "=": -1,
  "-=": PRECEDENCE_ASSIGNMENT,
  "+=": PRECEDENCE_ASSIGNMENT,
  "?": 4,
  ">": 5,
  "<": 5,
  ":": PRECEDENCE_KEY_VALUE_PAIR,
  "^": PRECEDENCE_BITWISE_XOR,
  "&": PRECEDENCE_BITWISE_AND,
  "|": PRECEDENCE_BITWISE_OR,
  "&&": PRECEDENCE_LOGICAL_AND,
  "||": PRECEDENCE_LOGICAL_OR,
  "...": PRECEDENCE_SPREAD,
  "~": PRECEDENCE_NOT,
  "!": PRECEDENCE_NOT
};

//      
const getPrecedence = token => precedence[token.value];

const getAssociativty = token => {
  switch (token.value) {
    case "=":
    case "-=":
    case "+=":
    case "--":
    case "++":
    case "?":
      return "right";
    case "+":
    case "-":
    case "/":
    case "*":
    case ":":
    default:
      return "left";
  }
};

//      
// Maybe identifier, maybe function call
const maybeIdentifier = ctx => {
  const node = ctx.startNode();
  ctx.eat(null, Syntax.Identifier);

  if (node.value === "false" || node.value === "true") {
    node.type = "bool";
    node.value = node.value === "true" ? "1" : "0";
    return ctx.endNode(node, Syntax.Constant);
  }

  if (ctx.eat(["("])) {
    const params = [expression(ctx)];
    const functionCall = ctx.endNode(_extends({}, node, {
      params: params.filter(Boolean)
    }), Syntax.FunctionCall);
    ctx.expect([")"]);
    return functionCall;
  }

  return ctx.endNode(node, Syntax.Identifier);
};

//      
/**
 * The expression parser for generating all parsed nodes, uses a modified Shunting
 * Yard algo.
 *
 * @author Arthur Buldauksas <arthurbuldauskas@gmail.com>
 */
// PLEASE READ BEFORE EDITING:
//
// 100% of the program is statements which are made up of expressions. The code
// below is the "engine" to parsing just about everything(useful) in the syntax.
// Take great care editing it.
//
// * Avoid special cases as much as possible.
// * Leverage precednece and other Shunting Yard rules.
// * Simplify whenever possible, avoid adding code.
//
// Thanks.

const last = list => list[list.length - 1];

const isPunctuatorAndNotBracket = t => t && t.type === Syntax.Punctuator && t.value !== "]" && t.value !== ")";

// Because expressions can be anywhere and likely nested inside another expression
// this nesting is represented with a depth. If we reach an "exit" like a ) or a }
// and drop our depth below zero we know we have escaped our intended expression
// and we bail out.
const predicate = (token, depth) => token.value !== ";" && depth > 0;

// Exceptions to no-keywords-in-expressions
const validKeywordsInExpressions = ["as"];

// Shunting yard
const expression = (ctx, check = predicate) => {
  const operators = [];
  const operands = [];

  // Depth is the nesting level of brackets in this expression. If we find a
  // closing bracket which causes our depth to fall below 1, then we know we
  // should exit the expression.
  let depth = 1;
  let previousToken = null;

  const consume = () => operands.push(operator(ctx, operators, operands));

  const eatUntil = condition => {
    let previous = last(operators);
    while (previous && previous.value !== condition) {
      consume();
      previous = last(operators);
    }
  };

  // The rules for consuming punctuators(+ - , etc.)
  const flushOperators = precedence => {
    let previous = last(operators);
    while (previous &&
    // A sequence is a special case. Note that this is a check for a Sequence NODE.
    // This is so that math operators don't "eat" already parsed sequences of nodes.
    // To put it plainly a comma separated list should never be added to a number.
    // Examples include code like: 1, 2, 3, 2 + 2.
    previous.Type !== Syntax.Sequence &&
    // The rest of this is Shunting Yard rules
    getPrecedence(previous) >= precedence && getAssociativty(previous) === "left") {
      consume();
      previous = last(operators);
    }
  };

  // Process individual punctuators, below are the rules for handling things like
  // brackets and code blocks. Other punctuators follow a precedence rule parsing
  // approach.
  const processPunctuator = () => {
    switch (ctx.token.value) {
      case "=>":
        flushOperators(getPrecedence(ctx.token));
        operators.push(ctx.token);
        ctx.next();
        if (ctx.token.value === "{") {
          operands.push(blockParser(ctx));
        }
        return false;
      case "(":
        depth++;
        operators.push(ctx.token);
        break;
      case "[":
        depth++;
        operators.push(ctx.token);
        break;
      case "]":
        depth--;
        eatUntil("[");
        consume();
        break;
      case ")":
        {
          depth--;
          if (depth < 1) {
            return false;
          }
          // If we are not in a group already find the last LBracket,
          // consume everything until that point
          eatUntil("(");
          // Pop left bracket
          operators.pop();

          break;
        }
      case "{":
        depth++;
        operators.push(ctx.token);
        break;
      case "}":
        depth--;
        if (depth < 1) {
          return false;
        }
        eatUntil("{");
        consume();
        break;
      default:
        {
          const token = (t => {
            if (t.value === "-" && previousToken == null || t.value === "-" && isPunctuatorAndNotBracket(previousToken)) {
              return _extends({}, t, {
                value: "--"
              });
            }

            return t;
          })(ctx.token);

          flushOperators(getPrecedence(token));
          operators.push(token);
        }
    }
  };

  // Process individual tokens, this will either push to an operand stack or
  // process an operator.
  const process = () => {
    switch (ctx.token.type) {
      case Syntax.Constant:
        operands.push(parseConstant(ctx));
        break;
      case Syntax.Identifier:
        previousToken = ctx.token;
        // Maybe an Identifier or a function call
        operands.push(maybeIdentifier(ctx));
        return false;
      case Syntax.StringLiteral:
        operands.push(stringLiteral(ctx));
        break;
      case Syntax.Type:
        operands.push(builtInType(ctx));
        break;
      case Syntax.Keyword:
      case Syntax.Punctuator:
        // Some special keywords may show up in expressions, but only a small
        // subset. These keywords are treated as punctuators and processed by
        // the overall punctuator rules
        // EXAMPLE: the 'as' keyword - import statements consist of a sequence of
        // expressions but the as keyword can be used to rename an import within.
        if (ctx.token.type === Syntax.Keyword && !validKeywordsInExpressions.includes(ctx.token.value)) {
          break;
        }
        const punctuatorResult = processPunctuator();
        if (punctuatorResult != null) {
          return punctuatorResult;
        }
        break;
    }

    return true;
  };

  while (ctx.token && check(ctx.token, depth)) {
    if (process()) {
      previousToken = ctx.token;
      ctx.next();
    }
  }

  // If we get to the end of our available tokens then proceed to eat any left over
  // operators and finalize the expression.
  while (operators.length) {
    consume();
  }

  // Last operand should be a node that is at the "root" of this expression
  return operands.pop();
};

//      
const declaration = ctx => {
  const node = ctx.startNode();
  let Type$$1 = Syntax.Declaration;

  if (ctx.token.value === "const") {
    Type$$1 = Syntax.ImmutableDeclaration;
  }

  ctx.eat(["const", "let", "function"]);

  node.value = ctx.expect(null, Syntax.Identifier).value;
  ctx.expect([":"]);

  let type = ctx.token.value;

  if (!ctx.eat(null, Syntax.Type)) {
    ctx.expect(null, Syntax.Identifier);
  }

  const params = [];
  // Parse generic
  if (ctx.eat(["<"])) {
    ctx.eat(["{"]);
    params.push(expression(ctx));
    ctx.eat(["}"]);
    ctx.eat([">"]);
  } else if (ctx.eat(["="])) {
    params.push(expression(ctx));
  }

  return ctx.endNode(_extends({}, node, { params, type }), Type$$1);
};

//      
const parseArguments = ctx => {
  ctx.expect(["("]);
  const argumentsNode = ctx.makeNode({
    params: [expression(ctx)],
    value: "FUNCTION_ARGUMENTS"
  }, Syntax.FunctionArguments);
  ctx.expect([")"]);
  return argumentsNode;
};

const parseFunctionResult = ctx => {
  const baseNode = ctx.startNode();
  if (ctx.eat([":"])) {
    return ctx.endNode(_extends({}, baseNode, {
      value: ctx.token.value,
      type: (() => {
        const value = ctx.token.value;
        if (ctx.eat(null, Syntax.Type)) {
          return value === "void" ? null : value;
        }

        // If we did not find a user-type we default to an i32
        ctx.expect(null, Syntax.Identifier);

        return "i32";
      })()
    }), Syntax.FunctionResult);
  }

  return ctx.endNode(_extends({}, baseNode, {
    value: "FUNCTION_RESULT"
  }), Syntax.FunctionResult);
};

function maybeFunctionDeclaration(ctx) {
  if (!ctx.eat(["function"])) {
    return declaration(ctx);
  }

  const node = ctx.startNode();
  const value = ctx.expect(null, Syntax.Identifier).value;
  const argumentsNode = parseArguments(ctx);
  const resultNode = parseFunctionResult(ctx);
  ctx.expect(["{"]);
  const statements$$1 = [];
  while (ctx.token && ctx.token.value !== "}") {
    const stmt = statement(ctx);
    if (stmt) {
      statements$$1.push(stmt);
    }
  }
  ctx.expect(["}"]);

  return ctx.endNode(_extends({}, node, {
    value,
    params: [argumentsNode, resultNode, ...statements$$1]
  }), Syntax.FunctionDeclaration);
}

//      

function generateErrorString(msg, error, marker, filename, func) {
  let line;
  let col;
  let end;

  if (marker.start.line !== marker.end.line) {
    end = marker.start.col + 1;
    col = marker.start.col;
    line = marker.start.line;
  } else {
    line = marker.start.line;
    col = marker.start.col;
    end = marker.end.col;
  }
  const Line = (() => {
    if (marker.start.sourceLine !== marker.end.sourceLine) {
      return marker.start.sourceLine + "\n" + marker.end.sourceLine;
    }
    return marker.end.sourceLine;
  })();

  const highlight = new Array(end - col + 1).join("^").padStart(end, " ");
  return "\n" + Line + "\n" + highlight + ` ${error}` + "\n" + msg + "\n" + `  at ${func} (${filename}:${line}:${col})`;
}

//      
function typeParser(ctx) {
  const node = ctx.startNode();
  ctx.eat(["type"]);

  const value = ctx.expect(null, Syntax.Identifier).value;
  ctx.expect(["="]);

  const maybeGeneric = ctx.token.value;
  // Generic Type
  if (ctx.eat(null, Syntax.Identifier)) {
    ctx.expect(["<"]);
    const idNode = ctx.makeNode(_extends({}, ctx.token, { type: null }), Syntax.Identifier);
    ctx.expect(null, Syntax.Identifier);
    ctx.expect([">"]);

    const genericTypeNode = ctx.endNode(_extends({}, node, { value, params: [_extends({}, idNode, { value: maybeGeneric }), idNode] }), Syntax.GenericType);
    return genericTypeNode;
  }

  // Regular function type definition
  if (ctx.eat(["("])) {
    // Arguments are optional
    const argsExpression = expression(ctx);
    const args = argsExpression != null ? _extends({}, argsExpression, {
      value: "FUNCTION_ARGUMENTS",
      Type: Syntax.FunctionArguments,
      params: [argsExpression]
    }) : _extends({}, node, {
      value: "FUNCTION_ARGUMENTS",
      Type: Syntax.FunctionArguments,
      params: []
    });

    ctx.expect([")"]);
    ctx.expect(["=>"]);
    // Result is not optional
    const result = _extends({}, expression(ctx), {
      value: "FUNCTION_RESULT",
      Type: Syntax.FunctionResult
    });
    return ctx.endNode(_extends({}, node, {
      value,
      type: result.type,
      params: [args, result]
    }), Syntax.Typedef);
  }

  // Sanity check definition
  if (ctx.token.value !== "{") {
    const start = node.range[0];
    const end = ctx.token.end;
    throw new SyntaxError(generateErrorString("Invalid type syntax", "A function type must be of form (<type>, ...) <type>", { start, end }, "", ""));
  }

  // Struct type definition
  return ctx.endNode(_extends({}, node, {
    value,
    params: [expression(ctx)],
    type: "i32"
  }), Syntax.Struct);
}

//      
function parseExport(ctx) {
  const node = ctx.startNode();
  ctx.eat(["export"]);

  if (ctx.token.value === "type") {
    const typedef = typeParser(ctx);
    return ctx.endNode(_extends({}, node, {
      params: [typedef]
    }), Syntax.Export);
  }
  const params = [maybeFunctionDeclaration(ctx)];

  return ctx.endNode(_extends({}, node, { params }), Syntax.Export);
}

//      
function parseImport(ctx) {
  const baseNode = ctx.startNode();
  ctx.eat(["import"]);

  if (!ctx.eat(["{"])) {
    throw ctx.syntaxError("expected {");
  }

  const fields = expression(ctx);

  ctx.expect(["}"]);
  ctx.expect(["from"]);

  const module = expression(ctx);

  return ctx.endNode(_extends({}, baseNode, { params: [fields, module] }), Syntax.Import);
}

//      
function breakParser(ctx) {
  const node = ctx.startNode();
  ctx.expect(["break"]);
  return ctx.endNode(node, Syntax.Break);
}

//      
const paramList = ctx => {
  ctx.expect(["("]);
  const params = [];
  let node = null;
  while (ctx.token.value && ctx.token.value !== ")") {
    node = expression(ctx);
    if (node) {
      params.push(node);
      ctx.eat([";"]);
    }
  }

  ctx.expect([")"]);
  return params;
};

const forLoop = ctx => {
  const node = ctx.startNode();
  ctx.eat(["for"]);

  // Pop the last expression from param list to append to the body of the loop.
  // This is important to do here as it'll be more difficult to acomplish later
  // in the generator accurately. In a for-loop we always want the afterthought
  // to follow the entire body, so here we are.
  const [initializer, condition, afterthought] = paramList(ctx);
  const body = [];

  ctx.expect(["{"]);

  let stmt = null;
  while (ctx.token && ctx.token.value !== "}") {
    stmt = statement(ctx);
    if (stmt) {
      body.push(stmt);
    }
  }
  ctx.expect(["}"]);

  return ctx.endNode(_extends({}, node, {
    params: [initializer, condition, ...body, afterthought]
  }), Syntax.Loop);
};

//      
const whileLoop = ctx => {
  const node = ctx.startNode();
  ctx.eat(["while"]);
  ctx.expect(["("]);

  const initializer = ctx.makeNode({}, Syntax.Noop);
  const condition = expression(ctx);
  const body = [];

  ctx.expect([")"]);
  ctx.expect(["{"]);

  let stmt = null;
  while (ctx.token && ctx.token.value !== "}") {
    stmt = statement(ctx);
    if (stmt) {
      body.push(stmt);
    }
  }

  ctx.expect(["}"]);

  return ctx.endNode(_extends({}, node, {
    params: [initializer, condition, ...body]
  }), Syntax.Loop);
};

/**
 * Context is used to parse tokens into the base AST.
 * Originally the parser was a giant class and the context was the 'this' pointer.
 * Maintaining a monolithic parser is rather difficult so it was broken up into a
 * collection of self-contained parsers for each syntactic construct. The context
 * is passed around between each one to generate the desired tree
 */

//      
class Context {

  constructor({
    stream,
    token,
    lines
  }) {
    this.token = token;
    this.stream = stream;
    this.lines = lines;
  }

  syntaxError(msg, error) {
    const functionId = "unknown";
    return new SyntaxError(generateErrorString(msg, error || "", this.token, this.filename || "unknown", functionId));
  }

  unexpectedValue(value) {
    return this.syntaxError(`Expected: ${String(value)}`, "Unexpected value");
  }

  unexpected(token) {
    return this.syntaxError(`Expected: ${String(token)}`, `Unexpected token ${this.token.type}`);
  }

  unknown({ value }) {
    return this.syntaxError("Unknown token", value);
  }

  unsupported() {
    return this.syntaxError("Language feature not supported", this.token.value);
  }

  expect(value, type) {
    const token = this.token;
    if (!this.eat(value, type)) {
      throw value ? this.unexpectedValue(value) : this.unexpected(type);
    }

    return token;
  }

  next() {
    this.token = this.stream.next();
  }

  eat(value, type) {
    if (this.token == null) {
      return false;
    }

    if (value) {
      if (value.includes(this.token.value)) {
        this.next();
        return true;
      }
      return false;
    }

    if (this.token.type === type) {
      this.next();
      return true;
    }

    return false;
  }

  startNode(token = this.token || {}) {
    return {
      Type: "",
      value: token.value,
      range: [token.start],
      meta: {},
      params: [],
      type: null
    };
  }

  endNode(base, Type) {
    const token = this.token || this.stream.last() || {};
    const range = base.range.concat(token.start);
    const toString = () => {
      const start = range[0];
      const end = range[range.length - 1];

      return start.sourceLine.slice(start.col, end.col);
    };
    const { toString: omit } = base,
          seed = objectWithoutProperties(base, ["toString"]);
    const node = _extends({
      toString
    }, seed, {
      Type,
      range
    });
    return node;
  }

  makeNode(node, syntax) {
    return this.endNode(_extends({}, this.startNode(), node), syntax);
  }
}

//      
const returnStatement = ctx => {
  const node = ctx.startNode();
  ctx.expect(["return"]);
  const expr = expression(ctx);

  node.params.push(expr);

  return ctx.endNode(node, Syntax.ReturnStatement);
};

//      
const condition = ctx => {
  ctx.expect(["("]);
  const expr = expression(ctx);
  ctx.expect([")"]);
  return expr;
};

function parseIfStatement(ctx) {
  const node = _extends({}, ctx.startNode(ctx.token));

  ctx.eat(["if"]);
  // First operand is the expression
  const params = [condition(ctx)];
  const statementNode = statement(ctx);
  if (statementNode) {
    params.push(statementNode);
  }

  ctx.eat([";"]);
  while (ctx.eat(["else"])) {
    // maybe another if statement
    const elseNode = ctx.makeNode(null, Syntax.Else);
    const elseParams = [];
    const stmt = statement(ctx);
    if (stmt) {
      elseParams.push(stmt);
    }
    params.push(_extends({}, elseNode, { params: elseParams }));
  }

  return ctx.endNode(_extends({}, node, {
    params
  }), Syntax.IfThenElse);
}

//      
const keyword = ctx => {
  switch (ctx.token.value) {
    case "let":
    case "const":
      return declaration(ctx);
    case "function":
      return maybeFunctionDeclaration(ctx);
    case "export":
      return parseExport(ctx);
    case "import":
      return parseImport(ctx);
    case "type":
      return typeParser(ctx);
    case "if":
      return parseIfStatement(ctx);
    case "for":
      return forLoop(ctx);
    case "while":
      return whileLoop(ctx);
    case "return":
      return returnStatement(ctx);
    case "break":
      return breakParser(ctx);
    default:
      throw ctx.unsupported();
  }
};

/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

/**
 * Use invariant() to assert state which your program assumes to be true.
 *
 * Provide sprintf-style format (only %s is supported) and arguments
 * to provide information about what broke and what you were
 * expecting.
 *
 * The invariant message will be stripped in production, but the invariant
 * will remain to ensure logic does not differ in production.
 */

var NODE_ENV = undefined;

var invariant = function (condition, format, a, b, c, d, e, f) {
  if (NODE_ENV !== 'production') {
    if (format === undefined) {
      throw new Error('invariant requires an error message argument');
    }
  }

  if (!condition) {
    var error;
    if (format === undefined) {
      error = new Error('Minified exception occurred; use the non-minified dev environment ' + 'for the full error message and additional helpful warnings.');
    } else {
      var args = [a, b, c, d, e, f];
      var argIndex = 0;
      error = new Error(format.replace(/%s/g, function () {
        return args[argIndex++];
      }));
      error.name = 'Invariant Violation';
    }

    error.framesToPop = 1; // we don't care about invariant's own frame
    throw error;
  }
};

var invariant_1 = invariant;

//      
// Parse the expression and set the appropriate Type for the generator
const memoryStore = ctx => {
  // Parse the assignment
  const node = expression(ctx);

  invariant_1(node.params.length > 0, "Memory Store expression could not be parsed");

  const type = node.params[0].type;

  return ctx.endNode(_extends({}, node, { type }), Syntax.MemoryAssignment);
};

//      
// It is easier to parse assignment this way as we need to maintain a valid type
// through out the right-hand side of the expression
function maybeAssignment(ctx) {
  const nextValue = ctx.stream.peek().value;
  if (nextValue === "[" || nextValue === ".") {
    return memoryStore(ctx);
  }
  return expression(ctx);
}

//      
const statement = ctx => {
  switch (ctx.token.type) {
    case Syntax.Keyword:
      return keyword(ctx);
    case Syntax.Identifier:
      return maybeAssignment(ctx);
    case Syntax.Punctuator:
    default:
      if (ctx.eat([";"])) {
        return null;
      }
      if (ctx.token.value === "{") {
        return blockParser(ctx);
      }
      return expression(ctx);
  }
};

//      
const eol = char => char === "\n";

// Base Character stream class
class Stream {

  constructor(input) {
    this.pos = this.line = this.col = 0;
    this.input = input;
    this.lines = input.split("\n");
    this.newLine();
  }

  // Peek at a character at current position
  peek() {
    return this.input.charAt(this.pos);
  }

  // Advance to next character in stream
  next() {
    const char = this.input.charAt(this.pos++);

    if (this.eol(char)) {
      this.newLine();
    } else {
      this.col++;
    }

    return char;
  }

  // Begin a new line
  newLine() {
    this.line++;
    this.col = 0;
  }

  // Is the character an end of line
  eol(char) {
    return char === "\n";
  }

  // Is the character an end of file
  eof(char) {
    return char === "";
  }

  // Is the charater a whitespace
  static whitespace(char) {
    return char === "\n" || char === " " || char === "\t" || char === "\v" || char === "\r" || char === "\f";
  }
}

//      
/**
 * A very basic trie with functional,recursive search
 */
const fsearch = node => {
  const next = char => {
    if (node && node.children[char]) {
      return fsearch(node.children[char]);
    }

    return null;
  };

  next.leaf = node.leaf;

  return next;
};

class Trie {

  constructor(words) {
    this.root = {
      char: "",
      children: {},
      leaf: false
    };

    words.map(word => this.add(word));
    this.fsearch = fsearch(this.root);
  }

  add(word) {
    let current = this.root;
    let char = word.slice(0, 1);

    word = word.slice(1);

    while (typeof current.children[char] !== "undefined" && char.length > 0) {
      current = current.children[char];
      char = word.slice(0, 1);
      word = word.slice(1);
    }

    while (char.length > 0) {
      const node = {
        char,
        children: {},
        leaf: false
      };

      current.children[char] = node;
      current = node;
      char = word.slice(0, 1);
      word = word.slice(1);
    }

    current.leaf = true;
  }
}

var trie$1 = Trie;

//      
const wrap = (predicate, type, supported) => {
  const wrapper = value => {
    const result = predicate(value);
    return typeof result === "function" ? wrap(result, type, supported) : result;
  };
  wrapper.type = type;
  wrapper.supported = supported;
  wrapper.strict = !!supported;
  wrapper.leaf = predicate.leaf;
  return wrapper;
};

var token = wrap;

//      
const supported = ["+", "++", "-", "--", ">>", ">>>", "<<", "=", "==", "+=", "-=", "=>", "<=", ">=", "!=", "%", "/", "^", "&", "~", "|", "!", "**", ":", "(", ")", ".", "{", "}", ",", "[", "]", ";", ">", "<", "?", "||", "&&", "{", "}", "..."];

const trie = new trie$1(supported);
var punctuator = token(trie.fsearch, Syntax.Punctuator, supported);

//      
const { isNaN, parseInt: parseInt$1 } = Number;
const isNumber = char => !isNaN(parseInt$1(char));
const isDot = char => char === ".";
const number = char => isNumber(char) ? number : null;

const numberOrDot = char => {
  if (isDot(char)) {
    return number;
  }

  if (isNumber(char)) {
    return numberOrDot;
  }
  return null;
};

const hex = char => {
  if (/[0-9a-fA-F]/.test(char)) {
    return hex;
  }

  return null;
};

const maybeExponent = char => {
  switch (char) {
    case "e":
    case "E":
      return number;
    default:
      return numberOrDot(char);
  }
};
const maybeModifier = char => {
  switch (char) {
    case "b":
    case "B":
      return number;
    case "o":
      return number;
    case "x":
    case "X":
      return hex;
    default:
      return numberOrDot(char);
  }
};

const root = char => {
  if (char === "-") {
    return root;
  } else if (isDot(char)) {
    return number;
  } else if (char === "0") {
    return maybeModifier;
  } else if (isNumber(char)) {
    return maybeExponent;
  }

  return null;
};

var constant = token(root, Syntax.Constant);

//      
const quoteOK = quoteCheck => () => quoteCheck;
const nextFails = () => null;

const endsInSingleQuote = char => {
  if (/\\/.test(char)) {
    return quoteOK(endsInSingleQuote);
  }
  if (char === "'") {
    return nextFails;
  }

  return endsInSingleQuote;
};

const endsInDoubleQuote = char => {
  if (/\\/.test(char)) {
    return quoteOK(endsInDoubleQuote);
  }
  if (char === '"') {
    return nextFails;
  }

  return endsInDoubleQuote;
};

const maybeQuote = char => {
  if (char === "'") {
    return endsInSingleQuote;
  }
  if (char === '"') {
    return endsInDoubleQuote;
  }

  return null;
};

const stringParser = token(maybeQuote, Syntax.StringLiteral);

//      
const isValidIdentifier = char => {
  // Don't allow these
  return !stringParser(char) && !punctuator(char) && !eol(char) && char !== " ";
};

const supportAny = char => {
  return isValidIdentifier(char) ? supportAny : null;
};

const parse$1 = char => {
  return isValidIdentifier(char) && !constant(char) ? supportAny : null;
};
const tokenParser = token(parse$1, Syntax.Identifier);

//      
const supported$1 = [
// EcmaScript
"break", "if", "else", "import", "as", "from", "export", "return", "switch", "case", "default", "const", "let", "for", "continue", "do", "while", "function",

// s-expression
"global", "module", "type", "lambda",

// Unsupported
"catch", "extends", "super",
// There is no concept of this in wast
"this", "debugger",
// vars and lets are replaced with types (i32, f32, etc)
"var",
// no classes in wast
"class", "try", "finally",
// Everything is statically typed
"typeof"];

const trie$2 = new trie$1(supported$1);
const root$1 = trie$2.fsearch;

var keyword$2 = token(root$1, Syntax.Keyword, supported$1);

//      
const SLASH = "/";
const ASTERIX = "*";

const SINGLE_LINE = `${SLASH}${SLASH}`;
const MULTI_LINE_START = `${SLASH}${ASTERIX}`;
const MULTI_LINE_END = `${ASTERIX}${SLASH}`;

const COMMENT_IDENTIFIERS = [SINGLE_LINE, MULTI_LINE_START, MULTI_LINE_END];

//      
const parser = char => {
  let isMultiline = false;
  let isSingleLine = false;
  let previous;

  const isComment = current => {
    if (eol(current)) {
      isSingleLine = false;
    }

    switch (`${previous}${current}`) {
      case MULTI_LINE_END:
        {
          isMultiline = false;
          return isComment;
        }
      case MULTI_LINE_START:
        {
          isMultiline = true;
          return isComment;
        }
      case SINGLE_LINE:
        {
          isSingleLine = true;
          return isComment;
        }
      default:
        {
          if (isMultiline || isSingleLine) {
            previous = current;
            return isComment;
          }
        }
    }
  };

  const maybeComment = current => {
    const buffer = previous;
    previous = current;

    if (current === SLASH || isMultiline || COMMENT_IDENTIFIERS.indexOf(`${buffer}${current}`) > -1) {
      return isComment;
    }

    return null;
  };

  return maybeComment(char);
};

var comments = token(parser, Syntax.Comment);

//      
const supported$2 = ["i32", "i64", "f32", "f64", "i32[]", "i64[]", "f32[]", "f64[]", "u8[]", "bool", "Function", "Memory", "Table", "void"];
const trie$3 = new trie$1(supported$2);
var type = token(trie$3.fsearch, Syntax.Type, supported$2);

//      
class Tokenizer {

  constructor(stream, parsers = [punctuator, constant, tokenParser, keyword$2, stringParser, type, comments]) {
    this.stream = stream;
    this.tokens = [];
    this.pos = 0;
    this.parsers = parsers;
  }

  /**
   * Get next token
   */
  next() {
    let value = "";
    this.seekNonWhitespace();
    let char = "";
    let matchers = this.parsers;
    let next;
    let nextMatchers = this.match(char, matchers);
    let start = {
      sourceLine: this.stream.lines[this.stream.line - 1],
      line: this.stream.line,
      col: this.stream.col
    };

    do {
      char = this.stream.peek();
      matchers = this.match(char, matchers);
      value += char;
      this.stream.next();
      next = this.stream.peek();
      nextMatchers = this.match(next, matchers);
    } while (!this.stream.eof(next) && nextMatchers.length > 0);

    // If we fell off the end then bail out
    if (this.stream.eof(value)) {
      return null;
    }

    const token = this.token(value, matchers);
    token.start = start;
    token.end = {
      sourceLine: this.stream.lines[this.stream.line - 1],
      line: this.stream.line,
      col: this.stream.col
    };
    // Comments are ignored for now
    if (token.type !== comments.type) {
      this.tokens.push(token);
    }

    return this.tokens[this.pos++];
  }

  match(char, parsers) {
    return parsers.map(parse => parse(char)).filter(p => p);
  }

  /**
   * Match a particular non-whitespace value to a token
   */
  token(value, parsers, token = {
    type: "unknown",
    value,
    start: {},
    end: {}
  }) {
    // Strict parsers must end on a leaf node
    if (parsers.length > 1) {
      parsers = parsers.filter(parser => parser.strict ? parser.leaf : true);
      if (parsers.length > 1) {
        parsers = parsers.filter(parser => parser.strict);
      }
    }

    token.type = parsers.pop().type;

    return token;
  }

  /**
   * Seek Stream until next non-whitespace character. Can end in eof/eol
   */
  seekNonWhitespace() {
    while (this.stream.peek() && Stream.whitespace(this.stream.peek())) {
      this.stream.next();
    }
  }

  parse() {
    while (!this.stream.eof(this.stream.peek())) {
      this.next();
    }
    return this.tokens;
  }
}

//      


function tokenStream(tokens) {
  const length = tokens.length;
  let pos = 0;

  const next = () => tokens[++pos];
  const peek = () => tokens[pos + 1];
  const last = () => tokens[length - 1];

  return { pos, tokens, next, peek, last, length };
}

/**
 * Syntax Analysis
 *
 * The parser below creates the "bare" Abstract Syntax Tree.
 */

//      
function parse(source) {
  const stream = new Stream(source);
  const tokenizer = new Tokenizer(stream);
  const tokens = tokenStream(tokenizer.parse());

  const ctx = new Context({
    stream: tokens,
    token: tokens.tokens[0],
    lines: stream.lines,
    filename: "unknown.walt"
  });

  const node = ctx.makeNode({
    value: "ROOT_NODE"
  }, Syntax.Program);

  // No code, no problem, empty ast equals
  // (module) ; the most basic wasm module
  if (!ctx.stream || !ctx.stream.length) {
    return node;
  }

  while (ctx.stream.peek()) {
    const child = statement(ctx);
    if (child) {
      node.params.push(child);
    }
  }

  return node;
}

//      


function mapNode(visitor) {
  const nodeMapper = node => {
    if (node == null) {
      return node;
    }

    const mappingFunction = (() => {
      if ("*" in visitor && typeof visitor["*"] === "function") {
        return visitor["*"];
      }

      if (node.Type in visitor && typeof visitor[node.Type] === "function") {
        return visitor[node.Type];
      }
      return identity => identity;
    })();

    if (mappingFunction.length === 2) {
      return mappingFunction(node, nodeMapper);
    }

    const mappedNode = mappingFunction(node);
    const params = mappedNode.params.map(nodeMapper);

    return _extends({}, mappedNode, {
      params
    });
  };

  return nodeMapper;
}

//      


// Dead simple AST walker, takes a visitor object and calls all methods for
// appropriate node Types.
function walker(visitor) {
  const walkNode = node => {
    if (node == null) {
      return node;
    }
    const { params } = node;

    const mappingFunction = (() => {
      if ("*" in visitor && typeof visitor["*"] === "function") {
        return visitor["*"];
      }

      if (node.Type in visitor && typeof visitor[node.Type] === "function") {
        return visitor[node.Type];
      }

      return () => node;
    })();

    if (mappingFunction.length === 2) {
      mappingFunction(node, walkNode);
      return node;
    }

    mappingFunction(node);
    params.forEach(walkNode);

    return node;
  };

  return walkNode;
}

var slice = Array.prototype.slice;
var toArray$1 = function (a) {
    return slice.call(a);
};
var tail = function (a) {
    return slice.call(a, 1);
};

// fn, [value] -> fn
//-- create a curried function, incorporating any number of
//-- pre-existing arguments (e.g. if you're further currying a function).
var createFn = function (fn, args, totalArity) {
    var remainingArity = totalArity - args.length;

    switch (remainingArity) {
        case 0:
            return function () {
                return processInvocation(fn, concatArgs(args, arguments), totalArity);
            };
        case 1:
            return function (a) {
                return processInvocation(fn, concatArgs(args, arguments), totalArity);
            };
        case 2:
            return function (a, b) {
                return processInvocation(fn, concatArgs(args, arguments), totalArity);
            };
        case 3:
            return function (a, b, c) {
                return processInvocation(fn, concatArgs(args, arguments), totalArity);
            };
        case 4:
            return function (a, b, c, d) {
                return processInvocation(fn, concatArgs(args, arguments), totalArity);
            };
        case 5:
            return function (a, b, c, d, e) {
                return processInvocation(fn, concatArgs(args, arguments), totalArity);
            };
        case 6:
            return function (a, b, c, d, e, f) {
                return processInvocation(fn, concatArgs(args, arguments), totalArity);
            };
        case 7:
            return function (a, b, c, d, e, f, g) {
                return processInvocation(fn, concatArgs(args, arguments), totalArity);
            };
        case 8:
            return function (a, b, c, d, e, f, g, h) {
                return processInvocation(fn, concatArgs(args, arguments), totalArity);
            };
        case 9:
            return function (a, b, c, d, e, f, g, h, i) {
                return processInvocation(fn, concatArgs(args, arguments), totalArity);
            };
        case 10:
            return function (a, b, c, d, e, f, g, h, i, j) {
                return processInvocation(fn, concatArgs(args, arguments), totalArity);
            };
        default:
            return createEvalFn(fn, args, remainingArity);
    }
};

// [value], arguments -> [value]
//-- concat new arguments onto old arguments array
var concatArgs = function (args1, args2) {
    return args1.concat(toArray$1(args2));
};

// fn, [value], int -> fn
//-- create a function of the correct arity by the use of eval,
//-- so that curry can handle functions of any arity
var createEvalFn = function (fn, args, arity) {
    var argList = makeArgList(arity);

    //-- hack for IE's faulty eval parsing -- http://stackoverflow.com/a/6807726
    var fnStr = 'false||' + 'function(' + argList + '){ return processInvocation(fn, concatArgs(args, arguments)); }';
    return eval(fnStr);
};

var makeArgList = function (len) {
    var a = [];
    for (var i = 0; i < len; i += 1) a.push('a' + i.toString());
    return a.join(',');
};

var trimArrLength = function (arr, length) {
    if (arr.length > length) return arr.slice(0, length);else return arr;
};

// fn, [value] -> value
//-- handle a function being invoked.
//-- if the arg list is long enough, the function will be called
//-- otherwise, a new curried version is created.
var processInvocation = function (fn, argsArr, totalArity) {
    argsArr = trimArrLength(argsArr, totalArity);

    if (argsArr.length === totalArity) return fn.apply(null, argsArr);
    return createFn(fn, argsArr, totalArity);
};

// fn -> fn
//-- curries a function! <3
var curry = function (fn) {
    return createFn(fn, [], fn.length);
};

// num, fn -> fn
//-- curries a function to a certain arity! <33
curry.to = curry(function (arity, fn) {
    return createFn(fn, [], arity);
});

// num, fn -> fn
//-- adapts a function in the context-first style
//-- to a curried version. <3333
curry.adaptTo = curry(function (num, fn) {
    return curry.to(num, function (context) {
        var args = tail(arguments).concat(context);
        return fn.apply(this, args);
    });
});

// fn -> fn
//-- adapts a function in the context-first style to
//-- a curried version. <333
curry.adapt = function (fn) {
    return curry.adaptTo(fn.length, fn);
};

var curry_1 = curry;

//      
const FUNCTION_INDEX = "function/index";



const LOCAL_INDEX = "local/index";
const GLOBAL_INDEX = "global/index";

const TYPE_CONST = "type/const";
const TYPE_ARRAY = "type/array";

const TYPE_OBJECT = "type/object";
const TYPE_INDEX = "type/index";
const OBJECT_SIZE = "object/size";
const TYPE_CAST = "type/cast";
const OBJECT_KEY_TYPES = "object/key-types";
const CLOSURE_TYPE = "closure/type";
const AST_METADATA = "AST_METADATA";
const FUNCTION_METADATA = "FUNCTION_METADATA";
const ALIAS = "alias";

// Statics

//      
const mapImport = curry_1((options, node, _) => {
  return mapNode({
    [Syntax.BinaryExpression]: (as, transform) => {
      const [maybePair, asIdentifier] = as.params;
      // if the original import is not typed this isn't a valid import and is ignored
      if (maybePair.Type !== Syntax.Pair) {
        // No transform happens here (the transform is what creates the global fn to reference)
        return as;
      }
      // Continue transforming the import as before, the AS metadata will notify
      // the generator to ask for the original import.
      const [original, typeNode] = maybePair.params;

      return transform(_extends({}, maybePair, {
        params: [_extends({}, asIdentifier, {
          meta: _extends({}, original.meta, {
            // <new-value> AS <original-value>
            AS: original.value
          })
        }), typeNode]
      }));
    },
    [Syntax.Pair]: (pairNode, __) => {
      const { types, functions, globals } = options;
      const [identifierNode, typeNode] = pairNode.params;

      if (types[typeNode.value] != null) {
        // crate a new type

        const functionIndex = Object.keys(functions).length;
        const typeIndex = Object.keys(types).indexOf(typeNode.value);
        const functionNode = _extends({}, identifierNode, {
          id: identifierNode.value,
          type: types[typeNode.value].type,
          meta: _extends({}, identifierNode.meta, {
            [FUNCTION_INDEX]: functionIndex,
            [TYPE_INDEX]: typeIndex,
            FUNCTION_METADATA: types[typeNode.value].meta.FUNCTION_METADATA,
            DEFAULT_ARGUMENTS: types[typeNode.value].meta.DEFAULT_ARGUMENTS
          })
        });
        functions[identifierNode.value] = functionNode;
        return _extends({}, pairNode, {
          params: [functionNode, types[typeNode.value]]
        });
      }

      if (!["Table", "Memory"].includes(typeNode.type)) {
        const index = Object.keys(globals).length;

        globals[identifierNode.value] = _extends({}, identifierNode, {
          meta: { [GLOBAL_INDEX]: index, [TYPE_CONST]: true },
          type: typeNode.type
        });
      }

      return pairNode;
    }
  })(node);
});

const extendNode = curry_1((options, node) => {
  return _extends({}, node, options);
});

const getTypeSize = typeString => {
  switch (typeString) {
    case "i64":
    case "f64":
      return 8;
    case "i32":
    case "f32":
    case "bool":
    default:
      return 4;
  }
};

//      
const parseArray = type => {
  const subscriptType = type.slice(-2) === "[]" ? "i32" : null;
  return {
    arrayType: subscriptType ? type.slice(0, -2) : null,
    subscriptType
  };
};

// Parse and return a fully typed declaration options
// [ type, meta, index ]
const parse$2 = ({ isConst, types, scope, node }) => {
  const { subscriptType, arrayType } = parseArray(node.type);
  const closureType = types[node.type] && types[node.type].meta[CLOSURE_TYPE] ? "i64" : null;

  return [subscriptType || closureType || node.type, {
    [TYPE_ARRAY]: arrayType,
    [TYPE_CONST]: isConst || null,
    [CLOSURE_TYPE]: closureType,
    [TYPE_INDEX]: Object.keys(types).indexOf(node.type)
  }, Object.keys(scope).length];
};

// Parse a local declaration
const parseDeclaration = curry_1((isConst, options, node) => {
  const { locals: scope, closures, types } = options;
  const [type, meta, index] = parse$2({ isConst, types, scope, node });

  scope[node.value] = extendNode({
    params: node.params.map(extendNode({ type: node.type })),
    type,
    meta: _extends({}, meta, { [LOCAL_INDEX]: index }),
    Type: Syntax.Declaration
  }, node);

  if (closures.variables[node.value] != null && node.params[0]) {
    closures.offsets[node.value] = closures.envSize;
    closures.envSize += getTypeSize(node.type);
  }
});

// Map a global declaration
const parseGlobalDeclaration = curry_1((isConst, options, node) => {
  const { globals: scope, types } = options;
  const [type, meta, index] = parse$2({ isConst, types, scope, node });

  if (["Table", "Memory"].includes(node.type)) {
    return extendNode({ meta: { [GLOBAL_INDEX]: -1 } }, node);
  }

  scope[node.value] = extendNode({
    meta: _extends({}, meta, { [GLOBAL_INDEX]: index }),
    type,
    Type: Syntax.Declaration
  }, node);

  return scope[node.value];
});

//      
function mapCharacterLiteral(node) {
  const codePoint = node.value.codePointAt(0);
  return _extends({}, node, {
    Type: Syntax.Constant,
    type: "i32",
    value: String(codePoint)
  });
}

/**
 * Syntax Analysis
 *
 * The parser below creates the "bare" Abstract Syntax Tree.
 */

//      
const fragment = (source, parser) => {
  const stream = new Stream(source);
  const tokenizer = new Tokenizer(stream);
  const tokens = tokenStream(tokenizer.parse());

  const ctx = new Context({
    stream: tokens,
    token: tokens.tokens[0],
    lines: stream.lines,
    filename: "unknown.walt"
  });

  return parser(ctx);
};

const expressionFragment = source => fragment(source, expression);

// Unary expressions need to be patched so that the LHS type matches the RHS
function mapUnary (unaryNode, transform) {
  // While it's counter-intuitive that an unary operation would have two operands
  const [lhs, rhs] = unaryNode.params.map(transform);
  switch (unaryNode.value) {
    // Transform bang
    case "!":
      const shift = ["i64", "f64"].includes(lhs.type) ? "63" : "31";
      return transform(expressionFragment(`(((${String(lhs)} >> ${shift}) | ((~${String(lhs)} + 1) >> ${shift})) + 1)`));
    case "~":
      const mask = ["i64", "f64"].includes(transform(lhs).type) ? "0xffffffffffff" : "0xffffff";
      return transform(expressionFragment(`(${String(lhs)} ^ ${mask})`));
    default:
      return _extends({}, unaryNode, {
        type: rhs.type,
        params: [_extends({}, lhs, {
          type: rhs.type
        }), rhs],
        Type: Syntax.BinaryExpression
      });
  }
}

//      
const patchStringSubscript = (byteOffsetsByKey, params) => {
  const field = params[1];
  const absoluteByteOffset = byteOffsetsByKey[field.value];
  return [params[0], _extends({}, field, {
    meta: { [ALIAS]: field.value },
    value: absoluteByteOffset,
    type: "i32",
    Type: Syntax.Constant
  })];
};

const mapArraySubscript = curry_1(({ userTypes }, node, mapChildren) => {
  const params = node.params.map(mapChildren);
  const [identifier, field] = params;
  const userType = userTypes[identifier.type];
  if (userType != null) {
    const metaObject = userType.meta[TYPE_OBJECT];
    const objectKeyTypeMap = userType.meta[OBJECT_KEY_TYPES];
    return _extends({}, node, {
      type: objectKeyTypeMap ? objectKeyTypeMap[field.value] : "i32",
      params: patchStringSubscript(metaObject, params)
    });
  }

  // Native method
  if (identifier.Type === Syntax.Type && field.Type === Syntax.FunctionCall) {
    return _extends({}, node, {
      Type: Syntax.NativeMethod,
      type: identifier.value,
      value: identifier.value + "." + field.value,
      params: field.params
    });
  }

  const type = identifier.type;

  return _extends({}, node, {
    type,
    params
  });
});

//      
const mapIdentifier = curry_1(({ locals, globals, functions, table }, identifier) => {
  // Not a function call or pointer, look-up variables
  const local = locals[identifier.value];
  const global = globals[identifier.value];

  if (identifier.value === "__DATA_LENGTH__") {
    return _extends({}, identifier, {
      type: "i32",
      Type: Syntax.ArraySubscript,
      params: [_extends({}, identifier, { type: "i32", value: "0", Type: Syntax.Constant }), _extends({}, identifier, { type: "i32", value: "0", Type: Syntax.Constant })]
    });
  }

  if (local != null) {
    const type = (() => {
      const isArray = local.meta[TYPE_ARRAY];
      return isArray || local.type;
    })();
    return _extends({}, identifier, {
      type,
      meta: _extends({}, local.meta)
    });
  } else if (global != null) {
    return _extends({}, identifier, {
      type: globals[identifier.value].type,
      meta: _extends({}, global.meta)
    });
  } else if (functions[identifier.value] != null) {
    if (table[identifier.value] == null) {
      table[identifier.value] = functions[identifier.value];
    }
    return _extends({}, identifier, {
      type: "i32",
      meta: {
        [FUNCTION_INDEX]: Object.keys(functions).indexOf(identifier.value)
      },
      value: Object.keys(table).indexOf(identifier.value),
      Type: Syntax.FunctionPointer
    });
  }

  return identifier;
});

//      
const variableSize = type => {
  switch (type) {
    case "i64":
    case "f64":
      return "8";
    case "i32":
    case "f32":
    default:
      return "4";
  }
};

const mapSizeof = curry_1(({ locals, globals, functions, userTypes }, sizeof) => {
  const [target] = sizeof.params;
  const local = locals[target.value];
  const global = globals[target.value];
  const userType = userTypes[target.value] || (local ? userTypes[local.type] : null);
  const func = functions[target.value];

  if (userType != null) {
    const metaSize = userType.meta[OBJECT_SIZE];
    invariant_1(metaSize, "Object size information is missing");
    return _extends({}, sizeof, {
      value: metaSize,
      params: [],
      type: "i32",
      Type: Syntax.Constant
    });
  }

  const node = local || global || userType || func;

  return _extends({}, sizeof, {
    value: variableSize(node ? node.type : target.value),
    type: "i32",
    params: [],
    Type: Syntax.Constant
  });
});

//      
var makeAssignment = curry_1(function mapAssignment(options, node, mapChildren) {
  const [lhs, rhs] = node.params;

  // id = { <param>: <value> };
  if (rhs && rhs.Type === Syntax.ObjectLiteral) {
    const individualKeys = {};
    const spreadKeys = {};
    // We have to walk the nodes twice, once for regular prop keys and then again
    // for ...(spread)
    walker({
      // Top level Identifiers _inside_ an object literal === shorthand
      // Notice that we ignore chld mappers in both Pairs and Spread(s) so the
      // only way this is hit is if the identifier is TOP LEVEL
      [Syntax.Identifier]: (identifier, _) => {
        individualKeys[identifier.value] = _extends({}, lhs, {
          Type: Syntax.MemoryAssignment,
          params: [_extends({}, lhs, { Type: Syntax.ArraySubscript, params: [lhs, identifier] }), identifier]
        });
      },
      [Syntax.Pair]: (pair, _) => {
        const [property, value] = pair.params;
        individualKeys[property.value] = _extends({}, lhs, {
          Type: Syntax.MemoryAssignment,
          params: [_extends({}, lhs, { Type: Syntax.ArraySubscript, params: [lhs, property] }), value]
        });
      },
      [Syntax.Spread]: (spread, _) => {
        // find userType
        const { locals, userTypes } = options;
        const [target] = spread.params;
        const userType = userTypes[locals[target.value].type];
        const keyOffsetMap = userType.meta[TYPE_OBJECT];
        if (keyOffsetMap != null) {
          // map over the keys
          Object.keys(keyOffsetMap).forEach(key => {
            const offsetNode = _extends({}, target, {
              Type: Syntax.Identifier,
              value: key,
              params: []
            });
            // profit
            spreadKeys[key] = _extends({}, lhs, {
              Type: Syntax.MemoryAssignment,
              params: [_extends({}, lhs, {
                Type: Syntax.ArraySubscript,
                params: [lhs, _extends({}, offsetNode)]
              }), _extends({}, target, {
                Type: Syntax.ArraySubscript,
                params: [target, _extends({}, offsetNode)]
              })]
            });
          });
        }
      }
    })(rhs);

    const params = Object.values(_extends({}, spreadKeys, individualKeys));
    return _extends({}, lhs, {
      Type: Syntax.Block,
      // We just created a bunch of MemoryAssignment nodes, map over them so that
      // the correct metadata is applied to everything
      params: params.map(mapChildren)
    });
  }

  return _extends({}, node, {
    params: node.params.map(mapChildren)
  });
});

//      
const CLOSURE_FREE = "closure-free";
const CLOSURE_MALLOC = "closure-malloc";
const CLOSURE_BASE = "closure_base";
const CLOSURE_INNER = "closure_inner";
const CLOSURE_GET = "closure--get";
const CLOSURE_SET = "closure--set";

/**
 * "expand" an identifier Node into two nodes, the least significant word which
 * is the table index and into most signifact word Node which is the closure
 * pointer
 *
 */
const expandClosureIdentifier = identifier => {
  const bareIdentifier = () => _extends({}, identifier, { params: [] });
  // regular params, we APPEND function pointer math to list of params
  return [_extends({}, identifier, {
    value: ":",
    meta: {},
    Type: Syntax.Pair,
    params: [bareIdentifier(), _extends({}, identifier, {
      value: "i32",
      type: "i32",
      meta: {},
      params: [],
      Type: Syntax.Type
    })]
  }), ...identifier.params, _extends({}, identifier, {
    value: ":",
    Type: Syntax.Pair,
    meta: {},
    params: [_extends({}, identifier, {
      value: ">>",
      meta: {},
      Type: Syntax.BinaryExpression,
      params: [bareIdentifier(), _extends({}, identifier, {
        value: "32",
        type: "i32",
        meta: {},
        params: [],
        Type: Syntax.Constant
      })]
    }), _extends({}, identifier, {
      meta: {},
      value: "i32",
      type: "i32",
      params: [],
      Type: Syntax.Type
    })]
  })];
};

const collapseClosureIdentifier = (closure, pointer) => {
  return _extends({}, closure, {
    value: "+",
    Type: Syntax.BinaryExpression,
    params: [_extends({}, closure, {
      value: ":",
      meta: {},
      Type: Syntax.Pair,
      params: [_extends({}, closure, { Type: Syntax.Identifier, params: [] }), _extends({}, closure, {
        value: "i64",
        type: "i64",
        Type: Syntax.Type,
        params: []
      })]
    }), _extends({}, pointer, {
      value: "<<",
      Type: Syntax.BinaryExpression,
      params: [pointer, _extends({}, pointer, {
        value: "32",
        type: "i64",
        meta: {},
        params: [],
        Type: Syntax.Constant
      })]
    })]
  });
};

const mapIdentifierToOffset = (base, offset) => expressionFragment(`${offset} + ${base.value}`);

/**
 * Walks over a function ndoe and finds any enclosed variables in any closure in
 * its body. This is used to create an environment object for all of the closures
 */
const getEnclosedVariables = fun => {
  const variables = {};
  const encloseMaybe = curry_1((locals, identifier, _) => {
    if (locals[identifier.value] == null) {
      variables[identifier.value] = identifier;
    }
  });
  const ignore = curry_1((locals, identifier, _) => {
    locals[identifier.value] = identifier;
  });
  walker({
    // Only map over closures, ignore everything else
    [Syntax.Closure]: (closure, _) => {
      const locals = {};
      const ignoreLocals = ignore(locals);
      // Walk over the closure body enclose upper scope variables if necessary
      walker({
        // All arguments and local declarations are ignored. This means that
        // variable name shadowing does not enclose upper scope vars
        [Syntax.FunctionArguments]: (fnArgs, __) => {
          walker({
            [Syntax.Pair]: pair => {
              const [identifier] = pair.params;
              ignoreLocals(identifier, null);
            }
          })(fnArgs);
        },
        [Syntax.Declaration]: ignoreLocals,
        [Syntax.ImmutableDeclaration]: ignoreLocals,
        // Maybe enclose over an upper scope identifier
        [Syntax.Identifier]: encloseMaybe(locals)
      })(closure);
    }
  })(fun);

  return variables;
};

/**
 * Modifies a function parameter list and injects an environment declaration if
 * necessary
 */
const injectEnvironmentMaybe = ({
  mapFunctionCall,
  variables
}, params) => {
  if (Object.keys(variables).length > 0) {
    const start = params[2];
    return [...params.slice(0, 2), _extends({}, start, {
      value: CLOSURE_BASE,
      type: "i32",
      Type: Syntax.Declaration,
      params: [mapFunctionCall(_extends({}, start, {
        type: "i32",
        meta: {},
        value: CLOSURE_MALLOC,
        Type: Syntax.FunctionCall,
        params: [_extends({}, start, {
          params: [],
          type: "i32",
          value: "0",
          Type: Syntax.Constant
        })]
      }))]
    }), ...params.slice(2)];
  }

  return params;
};

const transformClosedDeclaration = curry_1((options, decl, transform) => {
  const { closures, locals } = options;
  const [init] = decl.params;
  // We don't know the size of the environment until all locals are walked. This
  // means we need to patch in the size of the env here where we can map nodes
  if (decl.value === CLOSURE_BASE) {
    return _extends({}, locals[decl.value], {
      params: [_extends({}, init, {
        params: [_extends({}, init.params[0], {
          value: closures.envSize
        })]
      })].map(transform)
    });
  }

  // If the value is enclosed and has an initializer we need to transform it into
  // a memory operation. AKA a function call to the closure plugin
  if (init && closures.variables[decl.value] != null) {
    const { offsets } = closures;
    return transform(_extends({}, init, {
      value: `${CLOSURE_SET}-${decl.type}`,
      params: [_extends({}, mapIdentifierToOffset(_extends({}, init, { value: CLOSURE_BASE }), offsets[decl.value])), init],
      meta: {},
      Type: Syntax.FunctionCall
    }));
  }

  // Not a closure of any kind, return the local
  return _extends({}, locals[decl.value], {
    params: locals[decl.value].params.map(transform)
  });
});

var makeClosure = curry_1(function mapClosure(options, node, topLevelTransform) {
  const { locals, closures, fun } = options;
  const { variables, offsets } = closures;

  const patched = mapNode({
    [Syntax.FunctionDeclaration]: decl => {
      // add a name
      return _extends({}, decl, {
        value: `internalClosure--${fun.value}`
      });
    },
    [Syntax.FunctionArguments]: (args, _) => {
      return _extends({}, args, {
        params: [_extends({}, args, {
          value: ":",
          params: [_extends({}, args, {
            value: CLOSURE_INNER,
            params: [],
            Type: Syntax.Identifier
          }), _extends({}, args, {
            value: "i32",
            type: "i32",
            params: [],
            Type: Syntax.Type
          })],
          Type: Syntax.Pair
        }), ...args.params]
      });
    },
    // Every assignment becomes a set function call
    [Syntax.Assignment]: assignment => {
      const [rhs, lhs] = assignment.params;
      if (variables[rhs.value] != null) {
        const local = locals[rhs.value];
        return _extends({}, assignment, {
          value: `closure--set-${local.type}`,
          params: [mapIdentifierToOffset(_extends({}, rhs, { value: String(CLOSURE_INNER) }), offsets[local.value]), lhs],
          meta: {},
          Type: Syntax.FunctionCall
        });
      }
      return assignment;
    },
    // Every lookup becomes a get function call
    [Syntax.Identifier]: (identifier, _) => {
      if (variables[identifier.value] != null) {
        const local = locals[identifier.value];
        return _extends({}, identifier, {
          value: `closure--get-${local.type}`,
          params: [mapIdentifierToOffset(_extends({}, identifier, { value: CLOSURE_INNER }), offsets[local.value])],
          Type: Syntax.FunctionCall
        });
      }

      return identifier;
    }
  })(node);

  // Magic
  return topLevelTransform(patched);
});

//      
const withDefaultArguments = (call, target) => {
  // Most likely a built-in funciton
  if (target == null) {
    return call;
  }

  const expectedArguments = target.meta.FUNCTION_METADATA.argumentsCount;
  const count = call.params.length > 0 && call.params[0].Type === Syntax.Sequence ? call.params[0].length : call.params.length;
  const difference = expectedArguments - count;
  if (difference > 0) {
    return _extends({}, call, {
      params: [...call.params, ...target.meta.DEFAULT_ARGUMENTS.slice(difference - 1)]
    });
  }

  return call;
};

var makeFunctionCall = curry_1(function mapFunctonCall(options, call) {
  const { functions, types, locals, mapIdentifier, mapSizeof } = options;

  // sizeof(<target>) calls
  if (call.value === "sizeof") {
    return mapSizeof(call);
  }

  // Function pointer calls aka indirect calls
  if (locals[call.value] != null) {
    // Closures are a special case of indirect function calls where a 64-bit
    // variable is used to encode both the function index and the memory pointer.
    const identifier = _extends({}, mapIdentifier(call), {
      Type: Syntax.Identifier
    });
    const meta = _extends({}, identifier.meta);

    const type = (() => {
      const typedef = types[identifier.type];
      return typedef != null ? typedef.type : call.type;
    })();

    // Expand the 64-bit identifier into an additional 32-bit argument for closure
    // base pointer and table index.
    if (identifier.meta[CLOSURE_TYPE] != null) {
      return _extends({}, call, {
        meta,
        type,
        Type: Syntax.IndirectFunctionCall,
        params: [...expandClosureIdentifier(identifier)]
      });
    }

    const typeIndex = Object.keys(types).indexOf(identifier.type);

    return _extends({}, call, {
      meta: _extends({}, meta, {
        [TYPE_INDEX]: typeIndex
      }),
      type,
      params: [...call.params, identifier],
      Type: Syntax.IndirectFunctionCall
    });
  }

  // Regular function calls
  const index = Object.keys(functions).indexOf(call.value);

  return withDefaultArguments(_extends({}, call, {
    type: functions[call.value] != null ? functions[call.value].type : null,
    meta: { [FUNCTION_INDEX]: index }
  }), functions[call.value]);
});

//      

const typeWeight = typeString => {
  switch (typeString) {
    case "i32":
    case "bool":
      return 0;
    case "i64":
      return 1;
    case "f32":
      return 2;
    case "f64":
      return 3;
    default:
      return -1;
  }
};

//      
var makePair = curry_1((options, typeCastMaybe, transform) => {
  const [targetNode, typeNode] = typeCastMaybe.params.map(transform);

  const { type: from } = targetNode;
  const { value: to } = typeNode;

  // If both sides of a pair don't have types then it's not a typecast,
  // more likely a string: value pair in an object for example
  if (typeNode.Type === Syntax.Type && !!from && !!to) {
    return _extends({}, typeCastMaybe, {
      type: to,
      value: targetNode.value,
      Type: Syntax.TypeCast,
      meta: _extends({}, typeCastMaybe.meta, { [TYPE_CAST]: { to, from } }),
      // We need to drop the typeNode here, because it's not something we can generate
      params: [targetNode]
    });
  }

  return _extends({}, typeCastMaybe, {
    params: typeCastMaybe.params.map(transform)
  });
});

//      
const balanceTypesInMathExpression = expression => {
  // find the heaviest type in the expression
  const type = expression.params.reduce((acc, { type: childType }) => {
    // The way we do that is by scanning the top-level nodes in our expression
    if (typeWeight(acc) < typeWeight(childType)) {
      return childType;
    }

    return acc;
  }, expression.type);

  // iterate again, this time, patching any lighter types
  const params = expression.params.map(paramNode => {
    if (paramNode.type != null && typeWeight(paramNode.type) !== typeWeight(type)) {
      return _extends({}, paramNode, {
        type,
        value: paramNode.value,
        Type: Syntax.TypeCast,
        meta: _extends({}, paramNode.meta, {
          [TYPE_CAST]: { to: type, from: paramNode.type }
        }),
        params: [paramNode]
      });
    }

    return paramNode;
  });

  return _extends({}, expression, {
    params,
    type
  });
};

//      
/**
 * Function Semantics Parser.
 *
 * This is where 80% of the semantic logic lives. Pretty much everything in
 * WebAssembly is performed in some function. Most of the heavy logic is offloaded
 * to smaller parsers in here.
 */
/**
 * Initialize function node and patch it's type and meta
 */
const initialize = (options, node) => {
  const { functions, types } = options;
  // All of the local variables need to be mapped
  const locals = {};
  // default arguments
  const defaultArgs = [];
  // Count the number of arguments to help with generating bytecode
  let argumentsCount = 0;
  const closures = {
    // Capture all enclosed variables if any
    variables: getEnclosedVariables(node),
    // All of the closure offsets need to be tracked
    offsets: {},
    envSize: 0
  };

  // Walk the node and calculate closure env size and closure offsets
  const fun = walker({
    // Function arguments need to be accounted for as well
    [Syntax.FunctionArguments]: (args, _) => {
      walker({
        [Syntax.Assignment]: defaultArg => {
          const defaultValue = defaultArg.params[1];
          defaultArgs.push(defaultValue);
        },
        [Syntax.Pair]: pairNode => {
          argumentsCount += 1;
          const [identifierNode, typeNode] = pairNode.params;
          const withTypeApplied = _extends({}, identifierNode, {
            type: typeNode.value
          });
          parseDeclaration(false, _extends({}, options, { locals, closures }), withTypeApplied, _);
        }
      })(args);
    },
    [Syntax.Declaration]: parseDeclaration(false, _extends({}, options, {
      locals,
      closures
    })),
    [Syntax.ImmutableDeclaration]: parseDeclaration(true, _extends({}, options, {
      locals,
      closures
    }))
  })(_extends({}, node, {
    type: (() => {
      const typeDef = node.params[1];
      // Identifier, can match Struct type, Function Type or Lambda. Check lambda
      if (types[typeDef.value] != null && types[typeDef.value].meta[CLOSURE_TYPE]) {
        // Lmbdas are 64-bit Integers when used in source
        return "i64";
      }

      // Everything non-lambda just return the type
      return typeDef.type;
    })(),
    meta: _extends({}, node.meta, {
      [FUNCTION_INDEX]: Object.keys(functions).length,
      [FUNCTION_METADATA]: {
        locals,
        get argumentsCount() {
          return argumentsCount;
        }
      },
      DEFAULT_ARGUMENTS: defaultArgs
    }),
    // If we are generating closures for this function, then we need to inject a
    // declaration for the environment local. This local cannot be referenced or
    // changed via source code.
    params: injectEnvironmentMaybe(_extends({
      mapFunctionCall: makeFunctionCall(_extends({}, options, {
        locals,
        mapIdentifier: mapIdentifier(_extends({ locals }, options)),
        mapSizeof: mapSizeof(_extends({ locals }, options))
      }))
    }, closures), node.params)
  }));
  functions[node.value] = fun;

  return [fun, locals, closures];
};

const mapFunctionNode = (options, node, topLevelTransform) => {
  // Initialize our function node
  const [fun, locals, closures] = initialize(options, node);

  // Construct all the mapping functions
  const mapIdentifier$$1 = mapIdentifier(_extends({}, options, { locals }));
  const mapArraySubscript$$1 = mapArraySubscript(_extends({}, options, { locals }));
  const mapSizeof$$1 = mapSizeof(_extends({}, options, { locals }));
  const mapAssignment = makeAssignment(_extends({}, options, { locals }));
  const mapClosure = makeClosure(_extends({}, options, {
    fun,
    locals,
    closures
  }));
  const mapPair = makePair(_extends({}, options, {
    locals,
    mapIdentifier: mapIdentifier$$1,
    mapClosure,
    topLevelTransform
  }));
  const mapFunctonCall = makeFunctionCall(_extends({}, options, {
    locals,
    mapIdentifier: mapIdentifier$$1,
    mapSizeof: mapSizeof$$1
  }));

  return mapNode({
    // Patch function arguments so that they mirror locals
    [Syntax.FunctionArguments]: (args, _) => {
      return mapNode({
        [Syntax.Assignment]: argument => {
          return argument.params[0];
        },
        [Syntax.Pair]: pairNode => {
          const [identifierNode, typeNode] = pairNode.params;
          return _extends({}, pairNode, {
            params: [locals[identifierNode.value], typeNode]
          });
        }
      })(args);
    },
    [Syntax.Declaration]: transformClosedDeclaration(_extends({}, options, {
      locals,
      closures
    })),
    [Syntax.ImmutableDeclaration]: transformClosedDeclaration(_extends({}, options, {
      locals,
      closures
    })),
    [Syntax.Identifier]: mapIdentifier$$1,
    [Syntax.FunctionCall]: mapFunctonCall,
    [Syntax.Pair]: mapPair,
    // Unary expressions need to be patched so that the LHS type matches the RHS
    [Syntax.UnaryExpression]: mapUnary,
    // All binary expressions are patched
    [Syntax.BinaryExpression]: (binaryNode, transform) => {
      return balanceTypesInMathExpression(_extends({}, binaryNode, {
        params: binaryNode.params.map(transform)
      }));
    },
    [Syntax.TernaryExpression]: (ternaryNode, transform) => {
      const params = ternaryNode.params.map(transform);
      return _extends({}, ternaryNode, {
        type: params[0].type,
        params
      });
    },
    [Syntax.Select]: (binaryNode, transform) => {
      return balanceTypesInMathExpression(_extends({}, binaryNode, {
        params: binaryNode.params.map(transform)
      }));
    },
    [Syntax.CharacterLiteral]: mapCharacterLiteral,
    [Syntax.StringLiteral]: (stringLiteral, _) => {
      const { statics } = options;
      const { value } = stringLiteral;

      // did we already encode the static?
      if (!(value in statics)) {
        statics[value] = null;
      }

      // It's too early to tranform a string at this point
      // we need additional information, only available in the generator.
      // This also avoids doing the work in two places, in semantics AND gen
      return stringLiteral;
    },
    [Syntax.Assignment]: mapAssignment,
    [Syntax.MemoryAssignment]: (inputNode, transform) => {
      const params = inputNode.params.map(transform);
      const { type } = params[0];
      return _extends({}, inputNode, { params, type });
    },
    [Syntax.ReturnStatement]: returnNode => {
      const [expression] = returnNode.params;
      if (expression != null && expression.Type === Syntax.Constant && typeWeight(expression.type) !== typeWeight(fun.type)) {
        return _extends({}, returnNode, {
          params: [_extends({}, expression, {
            value: ":",
            Type: Syntax.Pair,
            params: [expression, _extends({}, expression, {
              value: String(fun.type),
              type: fun.type,
              Type: Syntax.Type,
              params: []
            })]
          })]
        });
      }
      return returnNode;
    },
    [Syntax.ArraySubscript]: mapArraySubscript$$1,
    [Syntax.Sizeof]: mapSizeof$$1,
    [Syntax.Closure]: (closure, transform) => {
      const mappedClosure = mapClosure(closure, topLevelTransform);
      const [decl] = mappedClosure.params;
      options.hoist.push(decl);

      return transform(collapseClosureIdentifier(_extends({}, locals[CLOSURE_BASE], { meta: [] }), mapIdentifier$$1(_extends({}, decl, {
        params: [],
        type: "i32",
        Type: Syntax.Identifier,
        meta: []
      }))));
    }
  })(fun);
};

var mapFunctionNode$1 = curry_1(mapFunctionNode);

//      
function imports() {
  return parse(`
    import {
      '${CLOSURE_MALLOC}': ClosureGeti32,
      '${CLOSURE_FREE}': ClosureFree,
      '${CLOSURE_GET}-i32': ClosureGeti32,
      '${CLOSURE_GET}-f32': ClosureGetf32,
      '${CLOSURE_GET}-i64': ClosureGeti64,
      '${CLOSURE_GET}-f64': ClosureGetf64,
      '${CLOSURE_SET}-i32': ClosureSeti32,
      '${CLOSURE_SET}-f32': ClosureSetf32,
      '${CLOSURE_SET}-i64': ClosureSeti64,
      '${CLOSURE_SET}-f64': ClosureSetf64
    } from 'walt-plugin-closure';
    type ClosureFree = (i32) => void;
    type ClosureGeti32 = (i32) => i32;
    type ClosureGetf32 = (i32) => f32;
    type ClosureGeti64 = (i32) => i64;
    type ClosureGetf64 = (i32) => f64;
    type ClosureSeti32 = (i32, i32) => void;
    type ClosureSetf32 = (i32, f32) => void;
    type ClosureSeti64 = (i32, i64) => void;
    type ClosureSetf64 = (i32, f64) => void;
  `).params;
}

//      
const getByteOffsetsAndSize = objectLiteralNode => {
  const offsetsByKey = {};
  const keyTypeMap = {};
  let size = 0;
  walker({
    [Syntax.Pair]: keyTypePair => {
      const { value: key } = keyTypePair.params[0];
      const { value: typeString } = keyTypePair.params[1];
      invariant_1(offsetsByKey[key] == null, `Duplicate key ${key} not allowed in object type`);

      keyTypeMap[key] = typeString;
      offsetsByKey[key] = size;
      switch (typeString) {
        case "i64":
        case "f64":
          size += 8;
          break;
        case "i32":
        case "f32":
        default:
          size += 4;
      }
    }
  })(objectLiteralNode);

  return [offsetsByKey, size, keyTypeMap];
};

const mapStruct = curry_1(({ userTypes }, node, _ignore) => {
  const [offsetsByKey, totalSize, keyTypeMap] = getByteOffsetsAndSize(node.params[0]);

  const struct = _extends({}, node, {
    meta: _extends({}, node.meta, {
      [TYPE_OBJECT]: offsetsByKey,
      [OBJECT_SIZE]: totalSize,
      [OBJECT_KEY_TYPES]: keyTypeMap
    })
  });

  userTypes[struct.value] = struct;
  return struct;
});

//      
const mapGeneric = curry_1((options, node, _) => {
  const { types } = options;
  const [generic, T] = node.params;
  const realType = types[T.value];
  const [args, result] = realType.params;
  // Patch the node to be a real type which we can reference later
  const patch = _extends({}, realType, {
    range: generic.range,
    value: node.value,
    meta: _extends({}, realType.meta, { [CLOSURE_TYPE]: generic.value === "Lambda" }),
    params: [_extends({}, args, {
      params: [_extends({}, args, {
        params: [],
        type: "i32",
        value: "i32",
        Type: Syntax.Type
      }), ...args.params]
    }), result]
  });
  types[patch.value] = patch;
  return patch;
});

//      


function hasNode(Type, ast) {
  const test = node => node && node.Type === Type;

  const walker = node => {
    if (node == null) {
      return false;
    }

    return test(node) || node.params.some(walker);
  };

  return walker(ast);
}

/**
 * Semantic Analysis
 *
 * The semantic analyzer below accepts a Walt AST and maps it, returning a new
 * transformed AST which contains all necessary data to generate the final
 * WebAssembly binary.
 *
 * The transformations may or may not create new nodes or attach metadata to
 * existing nodes.
 *
 * Metadata is information necessary to generate a valid binary, like type info.
 */

//      
function semantics(ast) {
  const functions = {};
  const globals = {};
  const types = {};
  const userTypes = {};
  const table = {};
  const hoist = [];
  const hoistImports = [];
  const statics = {};

  if (hasNode(Syntax.Closure, ast)) {
    ast = _extends({}, ast, { params: [...imports(), ...ast.params] });
  }
  // Types have to be pre-parsed before the rest of the program
  const astWithTypes = mapNode({
    [Syntax.Export]: (node, transform) => {
      const [maybeType] = node.params;
      if (maybeType != null && [Syntax.Typedef, Syntax.Struct].includes(maybeType.Type)) {
        return transform(_extends({}, maybeType, {
          meta: _extends({}, maybeType.meta, {
            EXPORTED: true
          })
        }));
      }
      return node;
    },
    [Syntax.Typedef]: (node, _) => {
      let argumentsCount = 0;
      const defaultArgs = [];
      walker({
        Assignment(assignment) {
          const defaultValue = assignment.params[1];
          defaultArgs.push(defaultValue);
        },
        Type() {
          argumentsCount += 1;
        }
      })(node);
      const parsed = _extends({}, node, {
        meta: _extends({}, node.meta, {
          FUNCTION_METADATA: {
            argumentsCount
          },
          DEFAULT_ARGUMENTS: defaultArgs
        })
      });
      types[node.value] = parsed;
      return parsed;
    },
    [Syntax.GenericType]: mapGeneric({ types })
  })(ast);

  const patched = mapNode({
    [Syntax.Typedef]: (_, __) => _,
    // Read Import node, attach indexes if non-scalar
    [Syntax.Import]: mapImport({ functions, types, globals }),
    [Syntax.Declaration]: parseGlobalDeclaration(false, { globals, types }),
    [Syntax.ImmutableDeclaration]: parseGlobalDeclaration(true, {
      globals,
      types
    }),
    [Syntax.CharacterLiteral]: mapCharacterLiteral,
    [Syntax.Struct]: mapStruct({ userTypes }),
    [Syntax.FunctionDeclaration]: mapFunctionNode$1({
      hoist,
      hoistImports,
      types,
      globals,
      functions,
      userTypes,
      table,
      statics
    })
  })(astWithTypes);

  return _extends({}, patched, {
    meta: _extends({}, patched.meta, {
      // Attach information collected to the AST
      [AST_METADATA]: { functions, globals, types, userTypes, statics }
    }),
    params: [...hoistImports, ...patched.params, ...hoist]
  });
}

/* eslint-env es6 */
/**
 * WASM types
 *
 * https://github.com/WebAssembly/spec/tree/master/interpreter#s-expression-syntax
 *
 * Plus some extra C type mappings
 *
 * @author arthrubuldauskas@gmail.com
 * @license MIT
 */

const i32$1 = 1;
const i64$1 = 1 << 1;
const f32$1 = 1 << 2;
const f64$1 = 1 << 3;
const anyfunc = 1 << 4;
const func = 1 << 5;
const block_type = 1 << 6;

// C type mappings
const i8 = 1 << 7;
const u8 = 1 << 8;
const i16 = 1 << 9;
const u16 = 1 << 10;
const u32 = 1 << 11;
const u64 = 1 << 12;

// In _bytes_
const word = 4;

const sizeof = {
  [i32$1]: word,
  [i64$1]: word * 2,
  [f32$1]: word,
  [f64$1]: word * 2,
  [u32]: word,
  [u16]: word >> 1,
  [u8]: word >> 2,
  [i8]: word >> 2,
  [i16]: word >> 1,
  [anyfunc]: word,
  [func]: word,
  [block_type]: word
};

// TODO: Make this configurable.
const LITTLE_ENDIAN = true;

const get$1 = (type, index, dataView) => {
  switch (type) {
    case i32$1:
      return dataView.getInt32(index, LITTLE_ENDIAN);
    case i64$1:
      return dataView.getInt64(index, LITTLE_ENDIAN);
    case f32$1:
      return dataView.getFloat32(index, LITTLE_ENDIAN);
    case f64$1:
      return dataView.getFloat64(index, LITTLE_ENDIAN);
    case anyfunc:
      return dataView.getUint32(index, LITTLE_ENDIAN);
    case func:
      return dataView.getUint32(index, LITTLE_ENDIAN);
    case i8:
      return dataView.getInt8(index, LITTLE_ENDIAN);
    case u8:
      return dataView.getUint8(index, LITTLE_ENDIAN);
    case i16:
      return dataView.getInt16(index, LITTLE_ENDIAN);
    case u16:
      return dataView.getUint16(index, LITTLE_ENDIAN);
    case u32:
      return dataView.getUint32(index, LITTLE_ENDIAN);
    case u64:
      return dataView.getUint64(index, LITTLE_ENDIAN);
    default:
      return dataView.getUint8(index, LITTLE_ENDIAN);
  }
};

const set$1 = (type, index, dataView, value) => {
  switch (type) {
    case i32$1:
      return dataView.setInt32(index, value, LITTLE_ENDIAN);
    case i64$1:
      return dataView.setInt64(index, value, LITTLE_ENDIAN);
    case f32$1:
      return dataView.setFloat32(index, value, LITTLE_ENDIAN);
    case f64$1:
      return dataView.setFloat64(index, value, LITTLE_ENDIAN);
    case anyfunc:
      return dataView.setUint32(index, value, LITTLE_ENDIAN);
    case func:
      return dataView.setUint32(index, value, LITTLE_ENDIAN);
    case i8:
      return dataView.setInt8(index, value, LITTLE_ENDIAN);
    case u8:
      return dataView.setUint8(index, value, LITTLE_ENDIAN);
    case i16:
      return dataView.setInt16(index, value, LITTLE_ENDIAN);
    case u16:
      return dataView.setUint16(index, value, LITTLE_ENDIAN);
    case u32:
      return dataView.setUint32(index, value, LITTLE_ENDIAN);
    case u64:
      return dataView.setUint64(index, value, LITTLE_ENDIAN);
    default:
      return dataView.setUint8(index, value, LITTLE_ENDIAN);
  }
};

var index = {
  i32: i32$1,
  i64: i64$1,
  f32: f32$1,
  f64: f64$1,
  anyfunc,
  func,
  block_type,
  i8,
  u8,
  i16,
  u16,
  u32,
  u64,
  set: set$1,
  get: get$1,
  sizeof
};

var index_1 = index.i32;
var index_2 = index.i64;
var index_3 = index.f32;
var index_4 = index.f64;
var index_9 = index.u8;
var index_12 = index.u32;
var index_14 = index.set;
var index_16 = index.sizeof;

//      
/**
 * Ported from https://github.com/WebAssembly/wabt/blob/master/src/opcode.def
 */
const def = {};
const opcodeMap = [];
const textMap = {};
const ___ = null;

/**
 * Convert Opcode definiton to usable object(s)
 **/
const opcode = (result, first, second, size, code, name, text) => {
  const definition = {
    result,
    first,
    second,
    size,
    code,
    name,
    text
  };

  def[name] = definition;
  opcodeMap[code] = definition;
  textMap[text] = definition;

  return definition;
};

opcode(___, ___, ___, 0, 0x00, "Unreachable", "unreachable");
opcode(___, ___, ___, 0, 0x01, "Nop", "nop");
opcode(___, ___, ___, 0, 0x02, "Block", "block");
opcode(___, ___, ___, 0, 0x03, "Loop", "loop");
opcode(___, ___, ___, 0, 0x04, "If", "if");
opcode(___, ___, ___, 0, 0x05, "Else", "else");
opcode(___, ___, ___, 0, 0x06, "Try", "try");
opcode(___, ___, ___, 0, 0x07, "Catch", "catch");
opcode(___, ___, ___, 0, 0x08, "Throw", "throw");
opcode(___, ___, ___, 0, 0x09, "Rethrow", "rethrow");
opcode(___, ___, ___, 0, 0x0a, "CatchAll", "catch_all");
opcode(___, ___, ___, 0, 0x0b, "End", "end");
opcode(___, ___, ___, 0, 0x0c, "Br", "br");
opcode(___, ___, ___, 0, 0x0d, "BrIf", "br_if");
opcode(___, ___, ___, 0, 0x0e, "BrTable", "br_table");
opcode(___, ___, ___, 0, 0x0f, "Return", "return");
opcode(___, ___, ___, 0, 0x10, "Call", "call");
opcode(___, ___, ___, 0, 0x11, "CallIndirect", "call_indirect");
opcode(___, ___, ___, 0, 0x1a, "Drop", "drop");
opcode(___, ___, ___, 0, 0x1b, "Select", "select");
opcode(___, ___, ___, 0, 0x20, "GetLocal", "get_local");
opcode(___, ___, ___, 0, 0x21, "SetLocal", "set_local");
opcode(___, ___, ___, 0, 0x22, "TeeLocal", "tee_local");
opcode(___, ___, ___, 0, 0x23, "GetGlobal", "get_global");
opcode(___, ___, ___, 0, 0x24, "SetGlobal", "set_global");
opcode(index_1, index_1, ___, 4, 0x28, "i32Load", "i32.load");
opcode(index_2, index_1, ___, 8, 0x29, "i64Load", "i64.load");
opcode(index_3, index_1, ___, 4, 0x2a, "f32Load", "f32.load");
opcode(index_4, index_1, ___, 8, 0x2b, "f64Load", "f64.load");
opcode(index_1, index_1, ___, 1, 0x2c, "i32Load8S", "i32.load8_s");
opcode(index_1, index_1, ___, 1, 0x2d, "i32Load8U", "i32.load8_u");
opcode(index_1, index_1, ___, 2, 0x2e, "i32Load16S", "i32.load16_s");
opcode(index_1, index_1, ___, 2, 0x2f, "i32Load16U", "i32.load16_u");
opcode(index_2, index_1, ___, 1, 0x30, "i64Load8S", "i64.load8_s");
opcode(index_2, index_1, ___, 1, 0x31, "i64Load8U", "i64.load8_u");
opcode(index_2, index_1, ___, 2, 0x32, "i64Load16S", "i64.load16_s");
opcode(index_2, index_1, ___, 2, 0x33, "i64Load16U", "i64.load16_u");
opcode(index_2, index_1, ___, 4, 0x34, "i64Load32S", "i64.load32_s");
opcode(index_2, index_1, ___, 4, 0x35, "i64Load32U", "i64.load32_u");
opcode(___, index_1, index_1, 4, 0x36, "i32Store", "i32.store");
opcode(___, index_1, index_2, 8, 0x37, "i64Store", "i64.store");
opcode(___, index_1, index_3, 4, 0x38, "f32Store", "f32.store");
opcode(___, index_1, index_3, 8, 0x39, "f64Store", "f64.store");
opcode(___, index_1, index_1, 1, 0x3a, "i32Store8", "i32.store8");
opcode(___, index_1, index_1, 2, 0x3b, "i32Store16", "i32.store16");
opcode(___, index_1, index_2, 1, 0x3c, "i64Store8", "i64.store8");
opcode(___, index_1, index_2, 2, 0x3d, "i64Store16", "i64.store16");
opcode(___, index_1, index_2, 4, 0x3e, "i64Store32", "i64.store32");
opcode(index_1, ___, ___, 0, 0x3f, "CurrentMemory", "current_memory");
opcode(index_1, index_1, ___, 0, 0x40, "GrowMemory", "grow_memory");
opcode(index_1, ___, ___, 0, 0x41, "i32Const", "i32.const");
opcode(index_2, ___, ___, 0, 0x42, "i64Const", "i64.const");
opcode(index_3, ___, ___, 0, 0x43, "f32Const", "f32.const");
opcode(index_4, ___, ___, 0, 0x44, "f64Const", "f64.const");
opcode(index_1, index_1, ___, 0, 0x45, "i32Eqz", "i32.eqz");
opcode(index_1, index_1, index_1, 0, 0x46, "i32Eq", "i32.eq");
opcode(index_1, index_1, index_1, 0, 0x47, "i32Ne", "i32.ne");
opcode(index_1, index_1, index_1, 0, 0x48, "i32LtS", "i32.lt_s");
opcode(index_1, index_1, index_1, 0, 0x49, "i32LtU", "i32.lt_u");
opcode(index_1, index_1, index_1, 0, 0x4a, "i32GtS", "i32.gt_s");
opcode(index_1, index_1, index_1, 0, 0x4b, "i32GtU", "i32.gt_u");
opcode(index_1, index_1, index_1, 0, 0x4c, "i32LeS", "i32.le_s");
opcode(index_1, index_1, index_1, 0, 0x4d, "i32LeU", "i32.le_u");
opcode(index_1, index_1, index_1, 0, 0x4e, "i32GeS", "i32.ge_s");
opcode(index_1, index_1, index_1, 0, 0x4f, "i32GeU", "i32.ge_u");
opcode(index_1, index_2, ___, 0, 0x50, "i64Eqz", "i64.eqz");
opcode(index_1, index_2, index_2, 0, 0x51, "i64Eq", "i64.eq");
opcode(index_1, index_2, index_2, 0, 0x52, "i64Ne", "i64.ne");
opcode(index_1, index_2, index_2, 0, 0x53, "i64LtS", "i64.lt_s");
opcode(index_1, index_2, index_2, 0, 0x54, "i64LtU", "i64.lt_u");
opcode(index_1, index_2, index_2, 0, 0x55, "i64GtS", "i64.gt_s");
opcode(index_1, index_2, index_2, 0, 0x56, "i64GtU", "i64.gt_u");
opcode(index_1, index_2, index_2, 0, 0x57, "i64LeS", "i64.le_s");
opcode(index_1, index_2, index_2, 0, 0x58, "i64LeU", "i64.le_u");
opcode(index_1, index_2, index_2, 0, 0x59, "i64GeS", "i64.ge_s");
opcode(index_1, index_2, index_2, 0, 0x5a, "i64GeU", "i64.ge_u");
opcode(index_1, index_3, index_3, 0, 0x5b, "f32Eq", "f32.eq");
opcode(index_1, index_3, index_3, 0, 0x5c, "f32Ne", "f32.ne");
opcode(index_1, index_3, index_3, 0, 0x5d, "f32Lt", "f32.lt");
opcode(index_1, index_3, index_3, 0, 0x5e, "f32Gt", "f32.gt");
opcode(index_1, index_3, index_3, 0, 0x5f, "f32Le", "f32.le");
opcode(index_1, index_3, index_3, 0, 0x60, "f32Ge", "f32.ge");
opcode(index_1, index_3, index_3, 0, 0x61, "f64Eq", "f64.eq");
opcode(index_1, index_3, index_3, 0, 0x62, "f64Ne", "f64.ne");
opcode(index_1, index_3, index_3, 0, 0x63, "f64Lt", "f64.lt");
opcode(index_1, index_3, index_3, 0, 0x64, "f64Gt", "f64.gt");
opcode(index_1, index_3, index_3, 0, 0x65, "f64Le", "f64.le");
opcode(index_1, index_3, index_3, 0, 0x66, "f64Ge", "f64.ge");
opcode(index_1, index_1, ___, 0, 0x67, "i32Clz", "i32.clz");
opcode(index_1, index_1, ___, 0, 0x68, "i32Ctz", "i32.ctz");
opcode(index_1, index_1, ___, 0, 0x69, "i32Popcnt", "i32.popcnt");
opcode(index_1, index_1, index_1, 0, 0x6a, "i32Add", "i32.add");
opcode(index_1, index_1, index_1, 0, 0x6b, "i32Sub", "i32.sub");
opcode(index_1, index_1, index_1, 0, 0x6c, "i32Mul", "i32.mul");
opcode(index_1, index_1, index_1, 0, 0x6d, "i32DivS", "i32.div_s");
opcode(index_1, index_1, index_1, 0, 0x6e, "i32DivU", "i32.div_u");
opcode(index_1, index_1, index_1, 0, 0x6f, "i32RemS", "i32.rem_s");
opcode(index_1, index_1, index_1, 0, 0x70, "i32RemU", "i32.rem_u");
opcode(index_1, index_1, index_1, 0, 0x71, "i32And", "i32.and");
opcode(index_1, index_1, index_1, 0, 0x72, "i32Or", "i32.or");
opcode(index_1, index_1, index_1, 0, 0x73, "i32Xor", "i32.xor");
opcode(index_1, index_1, index_1, 0, 0x74, "i32Shl", "i32.shl");
opcode(index_1, index_1, index_1, 0, 0x75, "i32ShrS", "i32.shr_s");
opcode(index_1, index_1, index_1, 0, 0x76, "i32ShrU", "i32.shr_u");
opcode(index_1, index_1, index_1, 0, 0x77, "i32Rotl", "i32.rotl");
opcode(index_1, index_1, index_1, 0, 0x78, "i32Rotr", "i32.rotr");
opcode(index_2, index_2, ___, 0, 0x79, "i64Clz", "i64.clz");
opcode(index_2, index_2, ___, 0, 0x7a, "i64Ctz", "i64.ctz");
opcode(index_2, index_2, ___, 0, 0x7b, "i64Popcnt", "i64.popcnt");
opcode(index_2, index_2, index_2, 0, 0x7c, "i64Add", "i64.add");
opcode(index_2, index_2, index_2, 0, 0x7d, "i64Sub", "i64.sub");
opcode(index_2, index_2, index_2, 0, 0x7e, "i64Mul", "i64.mul");
opcode(index_2, index_2, index_2, 0, 0x7f, "i64DivS", "i64.div_s");
opcode(index_2, index_2, index_2, 0, 0x80, "i64DivU", "i64.div_u");
opcode(index_2, index_2, index_2, 0, 0x81, "i64RemS", "i64.rem_s");
opcode(index_2, index_2, index_2, 0, 0x82, "i64RemU", "i64.rem_u");
opcode(index_2, index_2, index_2, 0, 0x83, "i64And", "i64.and");
opcode(index_2, index_2, index_2, 0, 0x84, "i64Or", "i64.or");
opcode(index_2, index_2, index_2, 0, 0x85, "i64Xor", "i64.xor");
opcode(index_2, index_2, index_2, 0, 0x86, "i64Shl", "i64.shl");
opcode(index_2, index_2, index_2, 0, 0x87, "i64ShrS", "i64.shr_s");
opcode(index_2, index_2, index_2, 0, 0x88, "i64ShrU", "i64.shr_u");
opcode(index_2, index_2, index_2, 0, 0x89, "i64Rotl", "i64.rotl");
opcode(index_2, index_2, index_2, 0, 0x8a, "i64Rotr", "i64.rotr");
opcode(index_3, index_3, index_3, 0, 0x8b, "f32Abs", "f32.abs");
opcode(index_3, index_3, index_3, 0, 0x8c, "f32Neg", "f32.neg");
opcode(index_3, index_3, index_3, 0, 0x8d, "f32Ceil", "f32.ceil");
opcode(index_3, index_3, index_3, 0, 0x8e, "f32Floor", "f32.floor");
opcode(index_3, index_3, index_3, 0, 0x8f, "f32Trunc", "f32.trunc");
opcode(index_3, index_3, index_3, 0, 0x90, "f32Nearest", "f32.nearest");
opcode(index_3, index_3, index_3, 0, 0x91, "f32Sqrt", "f32.sqrt");
opcode(index_3, index_3, index_3, 0, 0x92, "f32Add", "f32.add");
opcode(index_3, index_3, index_3, 0, 0x93, "f32Sub", "f32.sub");
opcode(index_3, index_3, index_3, 0, 0x94, "f32Mul", "f32.mul");
opcode(index_3, index_3, index_3, 0, 0x95, "f32Div", "f32.div");
opcode(index_3, index_3, index_3, 0, 0x96, "f32Min", "f32.min");
opcode(index_3, index_3, index_3, 0, 0x97, "f32Max", "f32.max");
opcode(index_3, index_3, index_3, 0, 0x98, "f32Copysign", "f32.copysign");
opcode(index_3, index_3, index_3, 0, 0x99, "f32Abs", "f64.abs");
opcode(index_3, index_3, index_3, 0, 0x9a, "f32Neg", "f64.neg");
opcode(index_3, index_3, index_3, 0, 0x9b, "f32Ceil", "f64.ceil");
opcode(index_3, index_3, index_3, 0, 0x9c, "f32Floor", "f64.floor");
opcode(index_3, index_3, index_3, 0, 0x9d, "f32Trunc", "f64.trunc");
opcode(index_3, index_3, index_3, 0, 0x9e, "f32Nearest", "f64.nearest");
opcode(index_3, index_3, index_3, 0, 0x9f, "f32Sqrt", "f64.sqrt");
opcode(index_4, index_4, index_4, 0, 0xa0, "f64Add", "f64.add");
opcode(index_4, index_4, index_4, 0, 0xa1, "f64Sub", "f64.sub");
opcode(index_4, index_4, index_4, 0, 0xa2, "f64Mul", "f64.mul");
opcode(index_4, index_4, index_4, 0, 0xa3, "f64Div", "f64.div");
opcode(index_4, index_4, index_4, 0, 0xa4, "f64Min", "f64.min");
opcode(index_4, index_4, index_4, 0, 0xa5, "f64Max", "f64.max");
opcode(index_4, index_4, index_4, 0, 0xa6, "f64Copysign", "f64.copysign");
opcode(index_1, index_2, ___, 0, 0xa7, "i32Wrapi64", "i32.wrap/i64");
opcode(index_1, index_3, ___, 0, 0xa8, "i32TruncSf32", "i32.trunc_s/f32");
opcode(index_1, index_3, ___, 0, 0xa9, "i32TruncUf32", "i32.trunc_u/f32");
opcode(index_1, index_3, ___, 0, 0xaa, "i32TruncSf64", "i32.trunc_s/f64");
opcode(index_1, index_3, ___, 0, 0xab, "i32TruncUf64", "i32.trunc_u/f64");
opcode(index_2, index_1, ___, 0, 0xac, "i64ExtendSi32", "i64.extend_s/i32");
opcode(index_2, index_1, ___, 0, 0xad, "i64ExtendUi32", "i64.extend_u/i32");
opcode(index_2, index_3, ___, 0, 0xae, "i64TruncSf32", "i64.trunc_s/f32");
opcode(index_2, index_3, ___, 0, 0xaf, "i64TruncUf32", "i64.trunc_u/f32");
opcode(index_2, index_3, ___, 0, 0xb0, "i64TruncSf64", "i64.trunc_s/f64");
opcode(index_2, index_3, ___, 0, 0xb1, "i64TruncUf64", "i64.trunc_u/f64");
opcode(index_3, index_1, ___, 0, 0xb2, "f32ConvertSi32", "f32.convert_s/i32");
opcode(index_3, index_1, ___, 0, 0xb3, "f32ConvertUi32", "f32.convert_u/i32");
opcode(index_3, index_2, ___, 0, 0xb4, "f32ConvertSi64", "f32.convert_s/i64");
opcode(index_3, index_2, ___, 0, 0xb5, "f32ConvertUi64", "f32.convert_u/i64");
opcode(index_3, index_3, ___, 0, 0xb6, "f32Demotef64", "f32.demote/f64");
opcode(index_3, index_1, ___, 0, 0xb7, "f64ConvertSi32", "f64.convert_s/i32");
opcode(index_3, index_1, ___, 0, 0xb8, "f64ConvertUi32", "f64.convert_u/i32");
opcode(index_3, index_2, ___, 0, 0xb9, "f64ConvertSi64", "f64.convert_s/i64");
opcode(index_3, index_2, ___, 0, 0xba, "f64ConvertUi64", "f64.convert_u/i64");
opcode(index_3, index_3, ___, 0, 0xbb, "f64Promotef32", "f64.promote/f32");
opcode(index_1, index_3, ___, 0, 0xbc, "i32Reinterpretf32", "i32.reinterpret/f32");
opcode(index_2, index_3, ___, 0, 0xbd, "i64Reinterpretf64", "i64.reinterpret/f64");
opcode(index_3, index_1, ___, 0, 0xbe, "f32Reinterpreti32", "f32.reinterpret/i32");
opcode(index_3, index_2, ___, 0, 0xbf, "f32Reinterpreti64", "f64.reinterpret/i64");

const getTypecastOpcode = (to, from) => {
  const toType = to[0];

  if (["i32", "bool"].includes(to) && from === "i64") {
    return def.i32Wrapi64;
  }
  if (to === "i64" && ["i32", "bool"].includes(from)) {
    return def.i64ExtendSi32;
  }

  if (to === "f32" && from === "f64") {
    return def.f32Demotef64;
  }
  if (to === "f64" && from === "f32") {
    return def.f64Promotef32;
  }

  const conversion = toType === "f" ? "ConvertS" : "TruncS";
  return def[to + conversion + from];
};

/**
 * Return opcode mapping to the operator. Signed result is always prefered
 */
const opcodeFromOperator = ({
  type,
  value
}) => {
  // 100% code coverage is a harsh mistress
  const mapping = {
    "+": def[String(type) + "Add"],
    "-": def[String(type) + "Sub"],
    "*": def[String(type) + "Mul"],
    "/": def[String(type) + "DivS"] || def[String(type) + "Div"],
    "%": def[String(type) + "RemS"] || def[String(type) + "RemU"],
    "==": def[String(type) + "Eq"],
    "!=": def[String(type) + "Ne"],
    ">": def[String(type) + "Gt"] || def[String(type) + "GtS"],
    "<": def[String(type) + "Lt"] || def[String(type) + "LtS"],
    "<=": def[String(type) + "Le"] || def[String(type) + "LeS"],
    ">=": def[String(type) + "Ge"] || def[String(type) + "GeS"],
    "?": def.If,
    ":": def.Else,
    "&": def[String(type) + "And"],
    "|": def[String(type) + "Or"],
    "^": def[String(type) + "Xor"],
    ">>": def[String(type) + "ShrS"],
    ">>>": def[String(type) + "ShrU"],
    "<<": def[String(type) + "Shl"]
  };

  return mapping[value];
};

//      
const I32 = 0x7f;
const I64 = 0x7e;
const F32 = 0x7d;
const F64 = 0x7c;
const ANYFUNC = 0x70;
const FUNC = 0x60;


const stringToType = {
  i32: I32,
  i64: I64,
  f32: F32,
  f64: F64
};

const getTypeString = type => {
  switch (type) {
    case I64:
      return "i64";
    case F32:
      return "f32";
    case F64:
      return "f64";
    case FUNC:
      return "func";
    case ANYFUNC:
      return "anyfunc";
    case I32:
    default:
      return "i32";
  }
};

//      
const scopeOperation = curry_1((op, node) => {
  const local = node.meta[LOCAL_INDEX];
  const _global = node.meta[GLOBAL_INDEX];
  const index = local != null ? local : _global;

  invariant_1(index != null, `Unefined index for scope Operation. Possibly missing metadata. op: ${JSON.stringify(op)} node: ${JSON.stringify(node, null, 2)}`);

  const kind = local != null ? op + "Local" : op + "Global";
  const params = [Number(index)];

  return {
    kind: def[kind],
    params,
    debug: `${node.value}<${node.type ? node.type : "?"}>`
  };
});

const getConstOpcode = node => {
  const nodeType = node.type || builtinTypes.i32;

  const kind = def[nodeType + "Const"] || def.i32Const;
  const params = [Number(node.value)];

  return [{
    kind,
    params
  }];
};

// clean this up
const getType = str => {
  switch (str) {
    case builtinTypes.f32:
      return F32;
    case builtinTypes.f64:
      return F64;
    case builtinTypes.i64:
      return I64;
    case builtinTypes.i32:
    default:
      return I32;
  }
};

const isBuiltinType = type => {
  return typeof type === "string" && builtinTypes[type] != null;
};

const generateValueType = node => ({
  mutable: node.meta[TYPE_CONST] ? 0 : 1,
  type: getType(node.type)
});
const setInScope = scopeOperation("Set");
const getInScope = scopeOperation("Get");

//      
// AST Validator
const GLOBAL_LABEL = "global";

// We walk the the entire tree and perform syntax validation before we continue
// onto the generator. This may throw sometimes
function validate(ast, {
  filename
}) {
  const metadata = ast.meta[AST_METADATA];
  if (metadata == null) {
    throw new Error("Missing AST metadata!");
  }
  const { types, functions, userTypes } = metadata;
  const problems = [];

  walker({
    [Syntax.Pair]: pair => {
      const [start, end] = pair.range;
      problems.push(generateErrorString(`Unexpected expression ${pair.Type}`, "", { start, end }, filename, GLOBAL_LABEL));
    },
    [Syntax.Export]: _export => {
      const target = _export.params[0];
      const [start, end] = target.range;
      const globalIndex = target.meta[GLOBAL_INDEX];
      if (globalIndex != null && !target.params.length) {
        problems.push(generateErrorString("Global exports must have a value", "", { start, end }, filename, GLOBAL_LABEL));
      }
    },
    [Syntax.Import]: (importNode, _) => {
      walker({
        [Syntax.BinaryExpression]: (binary, __) => {
          const [start, end] = binary.range;
          problems.push(generateErrorString("Using an 'as' import without a type.", "A type for original import " + binary.params[0].value + " is not defined nor could it be inferred.", { start, end }, filename, GLOBAL_LABEL));
        },
        [Syntax.Identifier]: (identifier, __) => {
          const [start, end] = identifier.range;
          problems.push(generateErrorString("Infered type not supplied.", "Looks like you'd like to infer a type, but it was never provided by a linker. Non-concrete types cannot be compiled.", { start, end }, filename, GLOBAL_LABEL));
        },
        [Syntax.Pair]: (pair, __) => {
          const type = pair.params[1];
          if (!isBuiltinType(type.value) && types[type.value] == null) {
            const [start, end] = type.range;
            problems.push(generateErrorString(`Undefined Type ${type.value}`, `Invalid Import. ${type.value} type does not exist`, { start, end }, filename, GLOBAL_LABEL));
          }
        }
      })(importNode);
    },
    // All of the validators below need to be implemented
    [Syntax.Struct]: (_, __) => {},
    [Syntax.ImmutableDeclaration]: (_, __) => {},
    [Syntax.Declaration]: (decl, _validator) => {
      const [start, end] = decl.range;
      const [initializer] = decl.params;

      if (decl.meta[TYPE_CONST] != null) {
        const validTypes = [Syntax.Constant, Syntax.StringLiteral];
        if (initializer != null && !validTypes.includes(initializer.Type)) {
          problems.push(generateErrorString("Global Constants must be initialized with a Number literal.", "WebAssembly does not allow for non number literal constant initializers.", { start, end }, filename, GLOBAL_LABEL));
        }

        if (initializer == null) {
          problems.push(generateErrorString("Constant declaration without an initializer.", "Global constants must be initialized with a Number literal.", { start, end }, filename, GLOBAL_LABEL));
        }
      }
      if (!isBuiltinType(decl.type) && !types[decl.type] && !userTypes[decl.type]) {
        problems.push(generateErrorString("Unknown type used in a declaration, " + `"${String(decl.type)}"`, "Variables must be assigned with a known type.", { start, end }, filename, GLOBAL_LABEL));
      }
    },
    [Syntax.FunctionDeclaration]: (func, __) => {
      const functionName = `${func.value}()`;
      walker({
        [Syntax.Declaration]: (node, _validator) => {
          const [start, end] = node.range;
          const [initializer] = node.params;
          if (initializer != null && statements[initializer.Type] != null) {
            problems.push(generateErrorString(`Unexpected statement ${initializer.Type}`, "Attempting to assign a statement to a variable. Did you miss a semicolon(;)?", { start, end }, filename, functionName));
          }
          if (node.meta[TYPE_CONST] != null) {
            if (initializer == null) {
              problems.push(generateErrorString("Constant declaration without an initializer.", "Local Constants must be initialized with an expression.", { start, end }, filename, functionName));
            }
          }

          if (!isBuiltinType(node.type) && !types[node.type] && !userTypes[node.type]) {
            problems.push(generateErrorString("Unknown type used in a declartion, " + `"${String(node.type)}"`, "Variables must be assigned with a known type.", { start, end }, filename, functionName));
          }
        },
        [Syntax.Assignment]: node => {
          const [identifier] = node.params;
          const [start, end] = node.range;
          const statement = node.params.find(param => statements[param.Type] != null);
          if (statement != null) {
            problems.push(generateErrorString("Unexpected statement in assignment", "Statments cannot be used in assignment expressions. Did you miss a semicolon?", { start: statement.range[0], end: statement.range[1] }, filename, functionName));
          }

          const isConst = identifier.meta[TYPE_CONST];
          if (isConst != null) {
            problems.push(generateErrorString(`Cannot reassign a const variable ${identifier.value}`, "const variables cannot be reassigned, use let instead.", { start, end }, filename, functionName));
          }
        },
        [Syntax.ArraySubscript]: (node, _validator) => {
          const [identifier, offset] = node.params;
          const [start, end] = node.range;
          if (offset.value == null) {
            const alias = offset.meta[ALIAS];
            problems.push(generateErrorString("Cannot generate memory offset", `Undefined key ${alias != null ? alias : offset.value} for type ${String(identifier.type)}`, { start, end }, filename, functionName));
          }
        },
        [Syntax.ReturnStatement]: (node, validator) => {
          node.params.map(validator);
          if (func.type == null) {
            return;
          }
          const [expression] = node.params;
          const [start] = node.range;
          const end = expression != null ? expression.range[1] : node.range[1];
          const type = (() => {
            if (expression == null) {
              return null;
            }
            if (userTypes[expression.type] != null) {
              return "i32";
            }
            return expression.type;
          })();

          if (typeWeight(type) !== typeWeight(func.type)) {
            problems.push(generateErrorString("Missing return value", "Inconsistent return value. Expected " + func.type + " received " + String(type), { start, end }, filename, functionName));
          }
        },
        [Syntax.FunctionCall]: (node, _validator) => {
          if (functions[node.value] == null) {
            const [start, end] = node.range;

            problems.push(generateErrorString("Undefined function reference", `${node.value} is not defined.`, { start, end }, filename, functionName));
          }
        },
        [Syntax.IndirectFunctionCall]: (node, _validator) => {
          const identifier = node.params[node.params.length - 1];
          const type = types[identifier.type];

          if (!isBuiltinType(identifier.type) && type == null) {
            const [start, end] = node.range;
            problems.push(generateErrorString("Cannot make an indirect call without a valid function type", `${identifier.value} has type ${String(identifier.type)} which is not defined. Inidrect calls must have pre-defined types.`, { start, end }, filename, functionName));
          }
        }
      })(func);
    }
  })(ast);

  const problemCount = problems.length;
  if (problemCount > 0) {
    const errorString = problems.reduce((acc, value) => {
      return acc + "\n" + `${value}\n`;
    }, `Cannot generate WebAssembly for ${filename}. ${problemCount} problems.\n`);

    throw new Error(errorString);
  }
}

//      


const mergeBlock = (block, v) => {
  // some node types are a sequence of opcodes:
  // nested expressions for example
  if (Array.isArray(v)) {
    block = [...block, ...v];
  } else {
    block.push(v);
  }
  return block;
};

//      
const generateFunctionCall = (node, parent) => {
  const block = node.params.map(mapSyntax(parent)).reduce(mergeBlock, []);
  const metaFunctionIndex = node.meta[FUNCTION_INDEX];

  block.push({
    kind: def.Call,
    params: [metaFunctionIndex],
    debug: `${node.value}<${node.type ? node.type : "void"}>`
  });

  return block;
};

//      
const generateIndirectFunctionCall = (node, parent) => {
  const block = node.params.map(mapSyntax(parent)).reduce(mergeBlock, []);
  const localIndex = node.meta[LOCAL_INDEX];
  const typeIndexMeta = node.meta[TYPE_INDEX];
  invariant_1(localIndex != null, "Undefined local index, not a valid function pointer");
  invariant_1(typeIndexMeta != null, "Variable is not of a valid function pointer type");

  return [...block, {
    kind: def.CallIndirect,
    params: [typeIndexMeta, 0]
  }];
};

//      
/**
 * Transform a binary expression node into a list of opcodes
 */
const generateBinaryExpression = (node, parent) => {
  // Map operands first
  const block = node.params.map(mapSyntax(parent)).reduce(mergeBlock, []);

  // Map the operator last
  block.push({
    kind: opcodeFromOperator(_extends({}, node, {
      type: node.type
    })),
    params: []
  });

  return block;
};

//      
const generateTernary = (node, parent) => {
  // TernaryExpression has a simple param layout of 2(TWO) total parameters.
  // It's a single param for the boolean check followed by
  // another param which is a Pair Node containing the 2(TWO) param results of
  // true and false branches.
  // The whole thing is encoded as an implicitly retunred if/then/else block.
  const mapper = mapSyntax(parent);
  const resultPair = node.params[1];

  // Truthy check
  const block = node.params.slice(0, 1).map(mapper).reduce(mergeBlock, []);

  // If Opcode
  block.push({
    kind: opcodeFromOperator(node),
    valueType: generateValueType(node),
    params: []
  });

  // Map the true branch
  block.push.apply(block, resultPair.params.slice(0, 1).map(mapper).reduce(mergeBlock, []));
  block.push({
    kind: opcodeFromOperator({ value: ":", type: "i32" }),
    params: []
  });

  // Map the false branch
  block.push.apply(block, resultPair.params.slice(-1).map(mapper).reduce(mergeBlock, []));

  // Wrap up the node
  block.push({ kind: def.End, params: [] });

  return block;
};

//      
// probably should be called "generateBranch" and be more generic
// like handling ternary for example. A lot of shared logic here & ternary
const generateIf = (node, parent) => {
  const mapper = mapSyntax(parent);
  const [condition, thenBlock, ...restParams] = node.params;
  return [...[condition].map(mapper).reduce(mergeBlock, []), {
    kind: def.If,
    // if-then-else blocks have no return value and the Wasm spec requires us to
    // provide a literal byte '0x40' for "empty block" in these cases
    params: [0x40]
  },

  // after the expression is on the stack and opcode is following it we can write the
  // implicit 'then' block
  ...[thenBlock].map(mapper).reduce(mergeBlock, []),

  // fllowed by the optional 'else'
  ...restParams.map(mapper).reduce(mergeBlock, []), { kind: def.End, params: [] }];
};

//      
const generateFunctionPointer = node => {
  return [{
    kind: def.i32Const,
    params: [Number(node.value)]
  }];
};

//      
const generateReturn = node => {
  // Postfix in return statement should be a no-op UNLESS it's editing globals
  const block = node.params.map(mapSyntax(null)).reduce(mergeBlock, []);
  block.push({ kind: def.Return, params: [] });

  return block;
};

//      
const generateExpression = (node, parent) => [node].map(mapSyntax(parent)).reduce(mergeBlock, []);

//      
const generateDeclaration = (node, parent = { code: [], locals: [] }) => {
  const initNode = node.params[0];

  if (initNode) {
    const metaIndex = node.meta[LOCAL_INDEX];

    const type = isBuiltinType(node.type) ? node.type : i32;

    return [...generateExpression(_extends({}, initNode, { type }), parent), {
      kind: def.SetLocal,
      params: [metaIndex],
      debug: `${node.value}<${String(node.type)}>`
    }];
  }

  return [];
};

//      
const generateArraySubscript = (node, parent) => {
  const identifier = node.params[0];
  const isArray = identifier.meta[TYPE_ARRAY];
  const block = node.params.map(mapSyntax(parent)).reduce(mergeBlock, []);
  let type = node.type;

  if (isArray != null) {
    // For array types, the index is multiplied by the contained object size
    block.push.apply(block, [{ kind: def.i32Const, params: [2] }, { kind: def.i32Shl, params: [] }]);
    type = isArray;
  }

  // The sequence of opcodes to perfrom a memory load is
  // get(Local|Global) base, i32Const offset[, i32Const size, i32Mul ], i32Add
  block.push({ kind: def.i32Add, params: [] });

  block.push({
    kind: def[String(type) + "Load"],
    params: [
    // Alignment
    2,
    // Memory. Always 0 in the WASM MVP
    0]
  });

  return block;
};

//      
const generateAssignment = node => {
  const [target, value] = node.params;
  const block = [value].map(mapSyntax(null)).reduce(mergeBlock, []);

  block.push(setInScope(target));

  return block;
};

//      
const generateMemoryAssignment = (node, parent) => {
  const targetNode = node.params[0];
  const isArray = targetNode.params[0].meta[TYPE_ARRAY];
  let type = node.type;

  const block = node.params[0].params.map(mapSyntax(parent)).reduce(mergeBlock, []);

  if (isArray != null) {
    // For array types, the index is multiplied by the contained object size
    block.push.apply(block, [
    // TODO: fix this for user-defined types
    { kind: def.i32Const, params: [2] }, { kind: def.i32Shl, params: [] }]);
    type = isArray;
  }

  // The sequence of opcodes to perfrom a memory load is
  // get(Local|Global) base, i32Const offset[, i32Const size, i32Mul ], i32Add
  block.push({ kind: def.i32Add, params: [] });

  block.push.apply(block, node.params.slice(1).map(mapSyntax(parent)).reduce(mergeBlock, []));

  // The last piece is the WASM opcode. Either load or store
  block.push({
    kind: def[String(type) + "Store"],
    params: [
    // Alignment
    // TODO: make this extendible
    2,
    // Memory. Always 0 in the WASM MVP
    0]
  });

  return block;
};

//      
const generateLoop = (node, parent) => {
  const block = [];
  const mapper = mapSyntax(parent);

  // First param in a for loop is assignment expression or Noop if it's a while loop
  const [initializer, condition, ...body] = node.params;

  block.push.apply(block, [initializer].map(mapper).reduce(mergeBlock, []));
  block.push({ kind: def.Block, params: [0x40] });
  block.push({ kind: def.Loop, params: [0x40] });

  block.push.apply(block, [condition].map(mapper).reduce(mergeBlock, []));
  block.push({ kind: def.i32Eqz, params: [] });
  block.push({ kind: def.BrIf, params: [1] });

  block.push.apply(block, body.map(mapper).reduce(mergeBlock, []));

  block.push({ kind: def.Br, params: [0] });

  block.push({ kind: def.End, params: [] });
  block.push({ kind: def.End, params: [] });

  return block;
};

//      
const generateSequence = (node, parent) => {
  return node.params.map(mapSyntax(parent)).reduce(mergeBlock, []);
};

//      
//
const generateTypecast = (node, parent) => {
  const metaTypecast = node.meta[TYPE_CAST];
  invariant_1(metaTypecast, `Cannot generate typecast for node: ${JSON.stringify(node)}`);

  const { to, from } = metaTypecast;

  const block = node.params.map(mapSyntax(parent)).reduce(mergeBlock, []);
  return [...block, {
    kind: getTypecastOpcode(to, from),
    params: []
  }];
};

//      
const generateTypecast$2 = () => {
  return [{
    kind: def.Br,
    params: [2]
  }];
};

//      
function generateNoop() {
  return [];
}

//      
const generateBlock = (node, parent) => {
  // TODO: blocks should encode a return type and an end opcode,
  // but currently they are only used as part of a larger control flow instructions
  return node.params.map(mapSyntax(parent)).reduce(mergeBlock, []);
};

//      
const generateElse = (node, parent) => {
  // TODO: blocks should encode a return type and an end opcode,
  // but currently they are only used as part of a larger control flow instructions
  return [{ kind: def.Else, params: [] }, ...node.params.map(mapSyntax(parent)).reduce(mergeBlock, [])];
};

//      
const generateSelect = (node, parent) => {
  const [leftHandSide, rightHandSide] = node.params;
  const selectOpcode = { kind: def.Select, params: [] };
  const condition = [leftHandSide].map(mapSyntax(parent)).reduce(mergeBlock, []);

  if (node.value === "&&") {
    return [...[rightHandSide].map(mapSyntax(parent)).reduce(mergeBlock, []), { kind: def.i32Const, params: [0] }, ...condition, selectOpcode];
  }

  return [...condition, ...[rightHandSide].map(mapSyntax(parent)).reduce(mergeBlock, []), ...condition, selectOpcode];
};

//      
const alignCodes = {
  load8_s: 0,
  load8_u: 0,
  store8: 0,
  load16_s: 1,
  load16_u: 1,
  store16: 1,
  store32: 2,
  load32_s: 2,
  load32_u: 2,
  store: 2,
  load: 2
};

const generateNative = (node, parent) => {
  const block = node.params.map(mapSyntax(parent)).reduce(mergeBlock, []);

  const operation = node.value.split(".").pop();

  if (alignCodes[operation] == null) {
    block.push({ kind: textMap[node.value], params: [] });
  } else {
    const alignment = alignCodes[operation];

    const params = [alignment, 0];

    block.push({ kind: textMap[node.value], params });
  }

  return block;
};

const parseBounds = node => {
  const memory = {};
  walker({
    [Syntax.Pair]: ({ params }) => {
      const [{ value: key }, { value }] = params;
      memory[key] = parseInt(value);
    }
  })(node);
  return memory;
};

/* istanbul ignore file */
//      
const getText = node => {
  const value = node.value || "??";
  const hasType = node.type;
  const type = hasType || "i32";
  const op = opcodeFromOperator({ value, type });

  if (!hasType) {
    return op.text.replace("i32", "??");
  }

  return op.text;
};

const parseParams = node => {
  const params = [];
  walker({
    [Syntax.Pair]: (pair, _) => {
      params.push(`${pair.params[0].value} ${pair.params[1].value}`);
    },
    [Syntax.Type]: p => {
      params.push(p.value);
    }
  })(node);
  return params.length ? " param(" + params.join(" ") + ")" : "";
};

const parseResult = node => {
  if (node == null) {
    return "";
  }
  return " (result " + (node.type || "??") + ")";
};

const typedefString = node => {
  const [paramsNode, resultNode] = node.params;
  return "(type " + node.value + ` (func${parseParams(paramsNode)}${parseResult(resultNode)}))`;
};

const getPrinters = add => ({
  [Syntax.Import]: (node, _print) => {
    const [nodes, mod] = node.params;
    walker({
      [Syntax.Pair]: ({ params }, _) => {
        const { value: field } = params[0];
        const type = params[1];

        if (type.value === "Memory") {
          const memory = parseBounds(type);
          add(`(import "${mod.value}" "${field}" (memory ${memory.initial}${memory.max ? memory.max : ""}))`);
        } else {
          add(`(import "${mod.value}" "${field}" ${typedefString(type)})`);
        }
      },
      [Syntax.Identifier]: (missing, _) => {
        const { value } = missing;
        add(`(import "${mod.value}" "${value}" (type ??))`);
      }
    })(nodes);
  },
  [Syntax.Export]: (node, print) => {
    add("(export", 2);
    node.params.forEach(print);
    add(")", 0, -2);
  },
  [Syntax.GenericType]: (node, _print) => {
    add("(type-generic " + node.value + ")", 0, 0, " pseudo type");
  },
  [Syntax.FunctionCall]: (node, print) => {
    if (node.params.length > 0) {
      add(`(call ${node.value}`, 2);
      node.params.forEach(print);
      add(")", 0, -2);
    } else {
      add(`(call ${node.value})`);
    }
  },
  [Syntax.BinaryExpression]: (node, print) => {
    const text = getText(node);
    add("(" + text, 2);
    node.params.forEach(print);
    add(")", 0, -2);
  },
  [Syntax.ArraySubscript]: (node, print) => {
    add("(i32.add", 2);
    node.params.forEach(print);
    add(")", 0, -2);
  },
  [Syntax.Typedef]: (node, _) => {
    add(typedefString(node));
  },
  [Syntax.Identifier]: node => {
    const scope = node.meta[GLOBAL_INDEX] != null ? "global" : "local";
    add(`(get_${scope} ${node.value})`);
  },
  [Syntax.Constant]: node => {
    add(`(${String(node.type)}.const ${node.value})`);
  },
  [Syntax.FunctionDeclaration]: (node, print) => {
    const [params, result, ...rest] = node.params;
    add(`(func ${node.value}${parseParams(params)}${parseResult(result)}`, 2);

    rest.forEach(print);
    add(")", 0, -2);
  },
  [Syntax.ReturnStatement]: (node, print) => {
    add("(return", 2);
    node.params.forEach(print);
    add(")", 0, -2);
  },
  [Syntax.Declaration]: (node, print) => {
    const mutability = node.meta[TYPE_CONST] != null ? "immutable" : "mutable";
    add("(local " + node.value + " " + String(node.type), 2, 0, ` ${mutability}`);
    node.params.forEach(print);
    add(")", 0, -2);
  },
  [Syntax.ImmutableDeclaration]: (node, print) => {
    const scope = node.meta[GLOBAL_INDEX] != null ? "global" : "local";
    if (node.type === "Memory") {
      const memory = parseBounds(node);
      add(`(memory ${memory.initial}${memory.max ? ` ${memory.max}` : ""})`);
    } else {
      add(`(${scope} ` + node.value + " " + String(node.type), 2, 0, " immutable");
      node.params.forEach(print);
      add(")", 0, -2);
    }
  },
  [Syntax.StringLiteral]: node => {
    add("(i32.const ??)", 0, 0, ` string "${node.value}"`);
  },
  [Syntax.Type]: node => {
    add(node.value);
  },
  [Syntax.TypeCast]: (node, print) => {
    const from = node.params[0];
    const op = getTypecastOpcode(String(node.type), from.type);
    add("(" + op.text, 2);
    node.params.forEach(print);
    add(")", 0, -2);
  },
  [Syntax.ArraySubscript]: (node, print) => {
    add("(" + String(node.type) + ".load", 2, 0);
    node.params.forEach(print);
    add(")", 0, -2);
  },
  [Syntax.MemoryAssignment]: (node, print) => {
    add("(" + String(node.type) + ".store", 2, 0);
    node.params.forEach(print);
    add(")", 0, -2);
  },
  [Syntax.Assignment]: (node, print) => {
    const [target, ...params] = node.params;
    const scope = target.meta[GLOBAL_INDEX] != null ? "global" : "local";
    add(`(set_${scope} ${target.value}`, 2);
    params.forEach(print);
    add(")", 0, -2);
  },
  [Syntax.TernaryExpression]: (node, print) => {
    const [condition, options] = node.params;
    add("(select", 2);
    print(options);
    print(condition);
    add(")", 0, -2);
  },
  [Syntax.IfThenElse]: (node, print) => {
    const [condition, then, ...rest] = node.params;
    add("(if", 2);
    print(condition);
    add("(then", 2);
    print(then);
    add(")", 0, -2);
    if (rest.length > 0) {
      add("(else", 2);
      rest.forEach(print);
      add(")", 0, -2);
    }
    add(")", 0, -2);
  },
  [Syntax.ObjectLiteral]: (_, __) => {}
});

const printNode = node => {
  if (node == null) {
    return "";
  }

  let depth = 0;
  const offsets = [];
  const pieces = [];
  const comments = [];
  const add = (piece, post = 0, pre = 0, comment = "") => {
    depth += pre;
    comments.push(comment);
    pieces.push(piece);
    offsets.push(depth + piece.length);
    depth += post;
  };

  walker(getPrinters(add))(node);

  const max = Math.max(...offsets);
  const edge = max + 4;
  const result = pieces.reduce((acc, val, i) => {
    acc += val.padStart(offsets[i], " ").padEnd(edge, " ") + ";" + comments[i] + "\n";
    return acc;
  }, "");

  return result;
};

//      
const syntaxMap = {
  [Syntax.FunctionCall]: generateFunctionCall,
  [Syntax.IndirectFunctionCall]: generateIndirectFunctionCall,
  // Unary
  [Syntax.Constant]: getConstOpcode,
  [Syntax.BinaryExpression]: generateBinaryExpression,
  [Syntax.TernaryExpression]: generateTernary,
  [Syntax.IfThenElse]: generateIf,
  [Syntax.Else]: generateElse,
  [Syntax.Select]: generateSelect,
  [Syntax.Block]: generateBlock,
  [Syntax.Identifier]: getInScope,
  [Syntax.FunctionIdentifier]: getInScope,
  [Syntax.FunctionPointer]: generateFunctionPointer,
  [Syntax.ReturnStatement]: generateReturn,
  // Binary
  [Syntax.Declaration]: generateDeclaration,
  [Syntax.ArraySubscript]: generateArraySubscript,
  [Syntax.Assignment]: generateAssignment,
  // Memory
  [Syntax.MemoryAssignment]: generateMemoryAssignment,
  // Loops
  [Syntax.Loop]: generateLoop,
  [Syntax.Break]: generateTypecast$2,
  // Comma separated lists
  [Syntax.Sequence]: generateSequence,
  // Typecast
  [Syntax.TypeCast]: generateTypecast,
  [Syntax.Noop]: generateNoop,
  [Syntax.NativeMethod]: generateNative
};

const mapSyntax = curry_1((parent, operand) => {
  const mapping = syntaxMap[operand.Type];
  invariant_1(mapping, `Unexpected Syntax Token ${operand.Type} : ${operand.value}`);

  const validate = (block, i) => {
    // Only invariant a block if it's falsy, otherwise we will print _every_
    // opcode generated.
    if (!block.kind) {
      invariant_1(block.kind, "Unknown opcode generated in block index %s %s. \nOperand: \n%s", i, JSON.stringify(block), printNode(operand));
    }
  };
  const blocks = mapping(operand, parent);
  if (Array.isArray(blocks)) {
    blocks.forEach(validate);
  }

  return blocks;
});

//      
const generateElement = functionIndex => {
  return { functionIndex };
};

//      
const EXTERN_FUNCTION = 0;
const EXTERN_TABLE = 1;
const EXTERN_MEMORY = 2;
const EXTERN_GLOBAL = 3;

//      
const externaKindMap = {
  Memory: EXTERN_MEMORY,
  Table: EXTERN_TABLE
};

function generateExport(node) {
  const functionIndexMeta = node.meta[FUNCTION_INDEX];
  const globalIndexMeta = node.meta[GLOBAL_INDEX];

  if (globalIndexMeta != null) {
    const kind = externaKindMap[String(node.type)] || EXTERN_GLOBAL;
    const index = [EXTERN_MEMORY, EXTERN_TABLE].includes(kind) ? 0 : globalIndexMeta;
    return {
      index,
      kind,
      field: node.value
    };
  }

  return {
    index: functionIndexMeta,
    kind: EXTERN_FUNCTION,
    field: node.value
  };
}

//      
const generateMemory = node => {
  const memory = { max: 0, initial: 0 };
  walker({
    [Syntax.Pair]: ({ params }) => {
      // This could procude garbage values but that is a fault of the source code
      const [{ value: key }, { value }] = params;
      memory[key] = parseInt(value);
    }
  })(node);

  return memory;
};

//      
function generateMemory$2(node) {
  const table = { max: 0, initial: 0, type: "" };

  walker({
    [Syntax.Pair]: ({ params }) => {
      // This could procude garbage values but that is a fault of the source code
      const [{ value: key }, { value }] = params;
      if (key === "initial") {
        table.initial = parseInt(value);
      } else if (key === "element") {
        table.type = value;
      } else if (key === "max") {
        table.max = parseInt(value);
      }
    }
  })(node);

  return table;
}

//      
const generateInit = node => {
  const _global = generateValueType(node);
  const [initializer] = node.params;
  if (initializer != null) {
    const { value } = initializer;
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

//      
const getKindConstant = value => {
  switch (value) {
    case "Memory":
      return EXTERN_MEMORY;
    case "Table":
      return EXTERN_TABLE;
    case "i32":
    case "f32":
    case "i64":
    case "f64":
      return EXTERN_GLOBAL;
    default:
      return EXTERN_FUNCTION;
  }
};

const getFieldName = node => {
  let name = node.value;
  if (node.meta.AS != null) {
    return node.meta.AS;
  }

  return name;
};

function generateImportFromNode(node) {
  const [importsNode, moduleStringLiteralNode] = node.params;
  const { value: module } = moduleStringLiteralNode;
  const imports = [];

  // Look for Pair Types, encode them into imports array
  walker({
    [Syntax.Pair]: (pairNode, _) => {
      const [fieldIdentifierNode, typeOrIdentifierNode] = pairNode.params;

      const field = getFieldName(fieldIdentifierNode);
      const { value: importTypeValue } = typeOrIdentifierNode;

      const kind = getKindConstant(importTypeValue);

      const typeIndex = (() => {
        const typeIndexMeta = typeOrIdentifierNode.meta[TYPE_INDEX];
        if (typeIndexMeta) {
          return typeIndexMeta;
        }
        return null;
      })();
      const bounds = importTypeValue === "Memory" ? parseBounds(typeOrIdentifierNode) : {};

      imports.push(_extends({
        module,
        field,
        global: kind === EXTERN_GLOBAL,
        kind,
        type: stringToType[importTypeValue],
        typeIndex
      }, bounds));
    }
  })(importsNode);

  return imports;
}

//      
/**
 * Generate an Intermediate version for a WebAssembly function type
 **/
// clean this up
const getType$1 = str => {
  switch (str) {
    case "f32":
      return F32;
    case "f64":
      return F64;
    case "i64":
      return I64;
    case "i32":
    case "Function":
    default:
      return I32;
  }
};

const generateImplicitFunctionType = functionNode => {
  const [argsNode] = functionNode.params;
  const resultType = functionNode.type ? getType$1(functionNode.type) : null;

  const params = [];
  walker({
    [Syntax.Pair]: pairNode => {
      const typeNode = pairNode.params[1];
      invariant_1(typeNode, "Undefined type in a argument expression");
      params.push(getType$1(typeNode.value));
    }
  })(argsNode);

  return {
    params,
    result: resultType,
    id: functionNode.value
  };
};

function generateType(node) {
  const id = node.value;
  invariant_1(typeof id === "string", `Generator: A type must have a valid string identifier, node: ${JSON.stringify(node)}`);

  const [args, result] = node.params;

  // Collect the function params and result by walking the tree of nodes
  const params = [];

  walker({
    [Syntax.Type]: (t, __) => {
      params.push(getType$1(t.value));
    },
    // Generate Identifiers as UserType pointers, so i32s
    [Syntax.Identifier]: (t, __) => {
      params.push(getType$1(t.value));
    }
  })(args);

  return {
    id,
    params,
    result: result.type && result.type !== "void" ? getType$1(result.type) : null
  };
}

//      
const encodeSigned = value => {
  const encoding = [];
  while (true) {
    const byte = value & 127;
    value = value >> 7;
    const signbit = byte & 0x40;

    if (value === 0 && !signbit || value === -1 && signbit) {
      encoding.push(byte);
      break;
    } else {
      encoding.push(byte | 0x80);
    }
  }
  return encoding;
};

const encodeUnsigned = value => {
  const encoding = [];
  while (true) {
    const i = value & 127;
    value = value >>> 7;
    if (value === 0) {
      encoding.push(i);
      break;
    }

    encoding.push(i | 0x80);
  }

  return encoding;
};

//      
// Used to output raw binary, holds values and types in a large array 'stream'
class OutputStream {

  constructor() {
    // Our data, expand it
    this.data = [];

    // start at the beginning
    this.size = 0;
  }

  push(type, value, debug) {
    let size = 0;
    switch (type) {
      case "varuint7":
      case "varuint32":
      case "varint7":
      case "varint1":
        {
          // Encode all of the LEB128 aka 'var*' types
          value = encodeUnsigned(value);
          size = value.length;
          invariant_1(size, `Cannot write a value of size ${size}`);
          break;
        }
      case "varint32":
        {
          value = encodeSigned(value);
          size = value.length;
          invariant_1(size, `Cannot write a value of size ${size}`);
          break;
        }
      case "varint64":
        {
          value = encodeSigned(value);
          size = value.length;
          invariant_1(size, `Cannot write a value of size ${size}`);
          break;
        }
      default:
        {
          size = index_16[type];
          invariant_1(size, `Cannot write a value of size ${size}, type ${type}`);
        }
    }

    this.data.push({ type, value, debug });
    this.size += size;

    return this;
  }

  // Get the BUFFER, not data array.
  // Returns a new buffer unless one is passed in to be written to.
  buffer(buffer = new ArrayBuffer(this.size)) {
    const view = new DataView(buffer);
    let pc = 0;
    this.data.forEach(({ type, value }) => {
      if (Array.isArray(value)) {
        value.forEach(v => index_14(index_9, pc++, view, v));
      } else {
        index_14(type, pc, view, value);
        pc += index_16[type];
      }
    });
    return buffer;
  }

  // Writes source OutputStream into the current buffer
  write(source) {
    if (source) {
      this.data = this.data.concat(source.data);
      this.size += source.size;
    }

    return this;
  }
}

function* stringDecoder(view, start) {
  let length = 0;
  let index = 0;
  let shift = 0;
  let addr = start;
  while (true) {
    const byte = view.getUint8(addr, true);
    length |= (byte & 0x7f) << shift;
    addr += 1;
    if ((byte & 0x80) === 0) {
      break;
    }
    shift += 7;
  }

  let result = 0;
  while (index < length) {
    result = 0;
    shift = 0;
    while (true) {
      const byte = view.getUint8(addr, true);
      result |= (byte & 0x7f) << shift;
      addr += 1;
      if ((byte & 0x80) === 0) {
        break;
      }
      shift += 7;
    }
    index += 1;
    yield result;
  }
}

function stringEncoder(value) {
  const resultStream = new OutputStream();
  const characterStream = new OutputStream();

  characterStream.push("varuint32", value.length, value);
  let i = 0;
  for (i = 0; i < value.length; i++) {
    characterStream.push("varuint32", value.codePointAt(i), value[i]);
  }
  resultStream.write(characterStream);

  return resultStream;
}

//      
function generateData(statics, DATA_SECTION_HEADER_SIZE) {
  // Reserve N bytes for data size header
  let offsetAccumulator = DATA_SECTION_HEADER_SIZE;

  const map = {};
  const data = Object.keys(statics).reduce((acc, key) => {
    const encoded = stringEncoder(key);
    acc.push({ offset: Number(offsetAccumulator), data: encoded });
    map[key] = offsetAccumulator;
    offsetAccumulator += encoded.size;
    return acc;
  }, []);

  // reserved stream for the size header
  const lengthStream = new OutputStream();
  lengthStream.push(index_12, offsetAccumulator, String(offsetAccumulator));

  return {
    data: [{ offset: 0, data: lengthStream }, ...data],
    map
  };
}

//      
const DATA_SECTION_HEADER_SIZE = 4;

const generateCode = func => {
  // eslint-disable-next-line
  const [argsNode, resultNode, ...body] = func.params;

  const metadata = func.meta[FUNCTION_METADATA];
  invariant_1(body, "Cannot generate code for function without body");
  invariant_1(metadata, "Cannot generate code for function without metadata");

  const { locals, argumentsCount } = metadata;

  const block = {
    code: [],
    // On this Episode of ECMAScript Spec: Object own keys traversal!
    // Sometimes it pays to know the spec. Keys are traversed in the order
    // they are added to the object. This includes Object.keys. Because the AST is traversed
    // depth-first we can guarantee that arguments will also be added first
    // to the locals object. We can depend on the spec providing the keys,
    // such that we can slice away the number of arguments and get DECLARED locals _only_.
    locals: Object.keys(locals).slice(argumentsCount).map(key => generateValueType(locals[key])),
    debug: `Function ${func.value}`
  };

  // NOTE: Declarations have a side-effect of changing the local count
  //       This is why mapSyntax takes a parent argument
  const mappedSyntax = body.map(mapSyntax(block));
  if (mappedSyntax) {
    block.code = mappedSyntax.reduce(mergeBlock, []);
  }

  return block;
};

function generator(ast, config) {
  const program = {
    Version: config.version,
    Types: [],
    Start: [],
    Element: [],
    Code: [],
    Exports: [],
    Imports: [],
    Globals: [],
    Functions: [],
    Memory: [],
    Table: [],
    Artifacts: [],
    Data: [],
    Name: {
      module: config.filename,
      functions: [],
      locals: []
    }
  };

  let { statics } = ast.meta[AST_METADATA];
  if (config.linker != null) {
    statics = _extends({}, config.linker.statics, statics);
  }
  const { map: staticsMap, data } = generateData(statics, DATA_SECTION_HEADER_SIZE);
  if (Object.keys(statics).length > 0) {
    program.Data = data;
  }

  const findTypeIndex = functionNode => {
    const search = generateImplicitFunctionType(functionNode);

    return program.Types.findIndex(t => {
      const paramsMatch = t.params.length === search.params.length && t.params.reduce((a, v, i) => a && v === search.params[i], true);

      const resultMatch = t.result === search.result;

      return paramsMatch && resultMatch;
    });
  };

  const findTableIndex = functionIndex => program.Element.findIndex(n => n.functionIndex === functionIndex);

  const typeMap = {};
  const astWithTypes = mapNode({
    [Syntax.Typedef]: (node, _ignore) => {
      let typeIndex = program.Types.findIndex(({ id }) => id === node.value);
      let typeNode = program.Types[typeIndex];

      if (typeNode == null) {
        typeIndex = program.Types.length;
        program.Types.push(generateType(node));
      }

      typeNode = _extends({}, node, {
        meta: _extends({}, node.meta, { [TYPE_INDEX]: typeIndex })
      });

      typeMap[node.value] = { typeIndex, typeNode };
      return typeNode;
    }
  })(mapNode({
    [Syntax.Import]: (node, _) => node,
    [Syntax.StringLiteral]: (node, _ignore) => {
      if (Object.keys(statics).length === 0) {
        return node;
      }
      const { value } = node;
      return _extends({}, node, {
        value: String(staticsMap[value]),
        Type: Syntax.Constant
      });
    }
  })(ast));

  const nodeMap = {
    [Syntax.Typedef]: (_, __) => _,
    [Syntax.Export]: node => {
      const [nodeToExport] = node.params;
      program.Exports.push(generateExport(nodeToExport));
    },
    [Syntax.ImmutableDeclaration]: node => {
      const globalMeta = node.meta[GLOBAL_INDEX];
      if (globalMeta != null) {
        switch (node.type) {
          case "Memory":
            program.Memory.push(generateMemory(node));
            break;
          case "Table":
            program.Table.push(generateMemory$2(node));
            break;
        }
      }
    },
    [Syntax.Declaration]: node => {
      const globalMeta = node.meta[GLOBAL_INDEX];
      if (globalMeta != null) {
        program.Globals.push(generateInit(node));
      }
    },
    [Syntax.Import]: node => {
      program.Imports.push(...generateImportFromNode(node));
    },
    [Syntax.FunctionDeclaration]: node => {
      const typeIndex = (() => {
        const index = findTypeIndex(node);
        if (index === -1) {
          // attach to a type index
          program.Types.push(generateImplicitFunctionType(node));
          return program.Types.length - 1;
        }

        return index;
      })();

      const patched = mapNode({
        FunctionPointer(pointer) {
          const metaFunctionIndex = pointer.meta[FUNCTION_INDEX];
          const functionIndex = metaFunctionIndex;
          let tableIndex = findTableIndex(functionIndex);
          if (tableIndex < 0) {
            tableIndex = program.Element.length;
            program.Element.push(generateElement(functionIndex));
          }
          return pointer;
        }
      })(node);

      // Quick fix for shifting around function indices. These don't necessarily
      // get written in the order they appear in the source code.
      const index = node.meta[FUNCTION_INDEX];
      invariant_1(index != null, "Function index must be set");

      program.Functions[index] = typeIndex;
      // We will need to filter out the empty slots later
      program.Code[index] = generateCode(patched);

      if (patched.value === "start") {
        program.Start.push(index);
      }

      if (config.encodeNames) {
        program.Name.functions.push({
          index,
          name: node.value
        });
        const functionMetadata = node.meta[FUNCTION_METADATA];
        if (functionMetadata != null && Object.keys(functionMetadata.locals).length) {
          program.Name.locals[index] = {
            index,
            locals: Object.entries(functionMetadata.locals).map(([name, local]) => {
              return {
                name,
                index: Number(local.meta["local/index"])
              };
            })
          };
        }
      }
    }
  };

  walker(nodeMap)(astWithTypes);

  // Unlike function indexes we need function bodies to be exact
  program.Code = program.Code.filter(Boolean);

  return program;
}

//      
const VERSION_1 = 0x1;
const MAGIC = 0x6d736100;



function write(version) {
  return new OutputStream().push(index_12, MAGIC, "\\0asm").push(index_12, version, `version ${version}`);
}

//      

const varuint7 = "varuint7";
const varuint32 = "varuint32";
const varint7 = "varint7";
const varint1 = "varint1";
const varint32 = "varint32";
const varint64 = "varint64";

//      
function emitString(stream, string, debug) {
  stream.push(varuint32, string.length, debug);
  for (let i = 0; i < string.length; i++) {
    stream.push(index_9, string.charCodeAt(i), string[i]);
  }
  return stream;
}

//      
const emit$1 = entries => {
  const payload = new OutputStream().push(varuint32, entries.length, "entry count");

  entries.forEach(entry => {
    emitString(payload, entry.module, "module");
    emitString(payload, entry.field, "field");

    switch (entry.kind) {
      case EXTERN_GLOBAL:
        {
          payload.push(index_9, EXTERN_GLOBAL, "Global");
          payload.push(index_9, entry.type, getTypeString(entry.type));
          payload.push(index_9, 0, "immutable");
          break;
        }
      case EXTERN_FUNCTION:
        {
          payload.push(index_9, entry.kind, "Function");
          payload.push(varuint32, entry.typeIndex, "type index");
          break;
        }
      case EXTERN_TABLE:
        {
          payload.push(index_9, entry.kind, "Table");
          payload.push(index_9, ANYFUNC, "function table types");
          payload.push(varint1, 0, "has max value");
          payload.push(varuint32, 0, "iniital table size");
          break;
        }
      case EXTERN_MEMORY:
        {
          payload.push(index_9, entry.kind, "Memory");
          payload.push(varint1, !!entry.max, "has no max");
          payload.push(varuint32, entry.initial, "initial memory size(PAGES)");
          if (entry.max) {
            payload.push(varuint32, entry.max, "max memory size(PAGES)");
          }
          break;
        }
    }
  });

  return payload;
};

//      
const emit$2 = exports => {
  const payload = new OutputStream();
  payload.push(varuint32, exports.length, "count");

  exports.forEach(({ field, kind, index: index$$1 }) => {
    emitString(payload, field, "field");

    payload.push(index_9, kind, "Global");
    payload.push(varuint32, index$$1, "index");
  });

  return payload;
};

//      
const encode = (payload, { type, init, mutable }) => {
  payload.push(index_9, type, getTypeString(type));
  payload.push(index_9, mutable, "mutable");
  // Encode the constant
  switch (type) {
    case I32:
      payload.push(index_9, def.i32Const.code, def.i32Const.text);
      payload.push(varint32, init, `value (${init})`);
      break;
    case F32:
      payload.push(index_9, def.f32Const.code, def.f32Const.text);
      payload.push(index_3, init, `value (${init})`);
      break;
    case F64:
      payload.push(index_9, def.f64Const.code, def.f64Const.text);
      payload.push(index_4, init, `value (${init})`);
      break;
  }

  payload.push(index_9, def.End.code, "end");
};

const emit$3 = globals => {
  const payload = new OutputStream();
  payload.push(varuint32, globals.length, "count");

  globals.forEach(g => encode(payload, g));

  return payload;
};

//      
// Emits function section. For function code emitter look into code.js
const emit$4 = functions => {
  functions = functions.filter(func => func !== null);
  const stream = new OutputStream();
  stream.push(varuint32, functions.length, "count");

  functions.forEach(index => stream.push(varuint32, index, "type index"));

  return stream;
};

//      
function emitTables(start) {
  const stream = new OutputStream();

  if (start.length) {
    stream.push(varuint32, start[0], "start function");
  }

  return stream;
}

//      
const emitElement = stream => ({ functionIndex }, index$$1) => {
  stream.push(varuint32, 0, "table index");
  stream.push(index_9, def.i32Const.code, "offset");
  stream.push(varuint32, index$$1, index$$1.toString());
  stream.push(index_9, def.End.code, "end");
  stream.push(varuint32, 1, "number of elements");
  stream.push(varuint32, functionIndex, "function index");
};

const emit$5 = elements => {
  const stream = new OutputStream();
  stream.push(varuint32, elements.length, "count");

  elements.forEach(emitElement(stream));

  return stream;
};

//      
const emitType = (stream, { params, result }, index) => {
  // as of wasm 1.0 spec types are only of from === func
  stream.push(varint7, FUNC, `func type (${index})`);
  stream.push(varuint32, params.length, "parameter count");
  params.forEach(type => stream.push(varint7, type, "param"));
  if (result) {
    stream.push(varint1, 1, "result count");
    stream.push(varint7, result, `result type ${getTypeString(result)}`);
  } else {
    stream.push(varint1, 0, "result count");
  }
};

const emit$6 = types => {
  const stream = new OutputStream();
  stream.push(varuint32, types.length, "count");

  types.forEach((type, index) => emitType(stream, type, index));

  return stream;
};

//      
const emitLocal = (stream, local) => {
  if (local.isParam == null) {
    stream.push(varuint32, 1, "number of locals of following type");
    stream.push(varint7, local.type, `${getTypeString(local.type)}`);
  }
};

const emitFunctionBody = (stream, { locals, code, debug: functionName }) => {
  // write bytecode into a clean buffer
  const body = new OutputStream();

  code.forEach(({ kind, params, valueType, debug }) => {
    // There is a much nicer way of doing this
    body.push(index_9, kind.code, `${kind.text}  ${debug ? debug : ""}`);

    if (valueType) {
      body.push(index_9, valueType.type, "result type");
      body.push(index_9, valueType.mutable, "mutable");
    }

    // map over all params, if any and encode each on
    params.forEach(p => {
      let type = varuint32;
      let stringType = "i32.literal";

      // Memory opcode?
      if (kind.code >= 0x28 && kind.code <= 0x3e) {
        type = varuint32;
        stringType = "memory_immediate";
      } else {
        // either encode unsigned 32 bit values or floats
        switch (kind.result) {
          case index_4:
            type = index_4;
            stringType = "f64.literal";
            break;
          case index_3:
            type = index_3;
            stringType = "f32.literal";
            break;
          case index_1:
            type = varint32;
            stringType = "i32.literal";
            break;
          case index_2:
            type = varint64;
            stringType = "i64.literal";
            break;
          default:
            type = varuint32;
        }
      }
      body.push(type, p, `${stringType}`);
    });
  });

  // output locals to the stream
  const localsStream = new OutputStream();
  locals.forEach(local => emitLocal(localsStream, local));

  // body size is
  stream.push(varuint32, body.size + localsStream.size + 2, functionName);
  stream.push(varuint32, locals.length, "locals count");

  stream.write(localsStream);
  stream.write(body);
  stream.push(index_9, def.End.code, "end");
};

const emit$7 = functions => {
  // do stuff with ast
  const stream = new OutputStream();
  stream.push(varuint32, functions.length, "function count");
  functions.forEach(func => emitFunctionBody(stream, func));

  return stream;
};

//      
// Emits function section. For function code emitter look into code.js
const emitEntry = (payload, entry) => {
  payload.push(varint1, entry.max ? 1 : 0, "has no max");
  payload.push(varuint32, entry.initial, "initial memory size(PAGES)");
  if (entry.max) {
    payload.push(varuint32, entry.max, "max memory size(PAGES)");
  }
};

const emit$8 = memories => {
  const stream = new OutputStream();
  stream.push(varuint32, memories.length, "count");
  memories.forEach(entry => emitEntry(stream, entry));

  return stream;
};

//      
const typeBytecodes = {
  anyfunc: 0x70
};

const emitEntry$1 = (payload, entry) => {
  payload.push(varint7, typeBytecodes[entry.type], entry.type);
  payload.push(varint1, entry.max ? 1 : 0, "has max");
  payload.push(varuint32, entry.initial, "initial table size");
  if (entry.max) {
    payload.push(varuint32, entry.max, "max table size");
  }
};

function emitTables$1(tables) {
  const stream = new OutputStream();
  stream.push(varuint32, tables.length, "count");
  tables.forEach(entry => emitEntry$1(stream, entry));

  return stream;
}

//      
const emitDataSegment = (stream, segment) => {
  stream.push(varuint32, 0, "memory index");

  const { offset, data } = segment;

  stream.push(index_9, def.i32Const.code, def.i32Const.text);
  stream.push(varint32, offset, `segment offset (${offset})`);
  stream.push(index_9, def.End.code, "end");

  stream.push(varuint32, data.size, "segment size");
  // We invert the control here a bit so that any sort of data could be written
  // into the data section. This buys us a bit of flexibility for the cost of
  // doing encoding earlier in the funnel
  stream.write(data);
};

function emit$9(dataSection) {
  const stream = new OutputStream();
  stream.push(varuint32, dataSection.length, "entries");

  for (let i = 0, len = dataSection.length; i < len; i++) {
    const segment = dataSection[i];
    emitDataSegment(stream, segment);
  }

  return stream;
}

//      
// Emit Module name subsection
const emitModuleName = name => {
  const moduleSubsection = new OutputStream();
  emitString(moduleSubsection, name, `name_len: ${name}`);
  return moduleSubsection;
};

// Emit Functions subsection
const emitFunctionNames = names => {
  const stream = new OutputStream();

  stream.push(varuint32, names.length, `count: ${String(names.length)}`);
  names.forEach(({ index, name }) => {
    stream.push(varuint32, index, `index: ${String(index)}`);
    emitString(stream, name, `name_len: ${name}`);
  });

  return stream;
};

// Emit Locals subsection
const emitLocals = localsMap => {
  const stream = new OutputStream();

  // WebAssembly Binary Encoding docs are not the best on how this should be encoded.
  // This is pretty much lifted from wabt C++ source code. First comes the number
  // or functions, where each function is a header of a u32 function index followed
  // by locals + params count with each local/param encoded as a name_map
  stream.push(varuint32, localsMap.length, `count: ${String(localsMap.length)}`);
  localsMap.forEach(({ index: funIndex, locals }) => {
    stream.push(varuint32, funIndex, `function index: ${String(funIndex)}`);
    stream.push(varuint32, locals.length, `number of params and locals ${locals.length}`);
    locals.forEach(({ index, name }) => {
      stream.push(varuint32, index, `index: ${String(index)}`);
      emitString(stream, name, `name_len: ${name}`);
    });
  });

  return stream;
};

// Emit the Name custom section.
const emit$10 = nameSection => {
  const stream = new OutputStream();
  // Name identifier/header as this is a custom section which requires a string id
  emitString(stream, "name", "name_len: name");

  // NOTE: Every subsection header is encoded here, not in the individual subsection
  // logic.
  const moduleSubsection = emitModuleName(nameSection.module);
  stream.push(varuint7, 0, "name_type: Module");
  stream.push(varuint32, moduleSubsection.size, "name_payload_len");
  stream.write(moduleSubsection);

  const functionSubsection = emitFunctionNames(nameSection.functions);
  stream.push(varuint7, 1, "name_type: Function");
  stream.push(varuint32, functionSubsection.size, "name_payload_len");
  stream.write(functionSubsection);

  const localsSubsection = emitLocals(nameSection.locals);
  stream.push(varuint7, 2, "name_type: Locals");
  stream.push(varuint32, localsSubsection.size, "name_payload_len");
  stream.write(localsSubsection);

  return stream;
};

//      
const SECTION_TYPE = 1;
const SECTION_IMPORT = 2;
const SECTION_FUNCTION = 3;
const SECTION_TABLE = 4;
const SECTION_MEMORY = 5;
const SECTION_GLOBAL = 6;
const SECTION_EXPORT = 7;
const SECTION_START = 8;
const SECTION_ELEMENT = 9;
const SECTION_CODE = 10;
const SECTION_DATA = 11;
// Custom sections
const SECTION_NAME = 0;

//      
const writer = ({
  type,
  label,
  emitter
}) => ast => {
  const field = ast[label];
  if (!field || Array.isArray(field) && !field.length) {
    return null;
  }

  const stream = new OutputStream().push(index_9, type, label + " section");
  const entries = emitter(field);

  stream.push(varuint32, entries.size, "size");
  stream.write(entries);

  return stream;
};

//      
var section = {
  type: writer({ type: SECTION_TYPE, label: "Types", emitter: emit$6 }),
  imports: writer({ type: SECTION_IMPORT, label: "Imports", emitter: emit$1 }),
  function: writer({
    type: SECTION_FUNCTION,
    label: "Functions",
    emitter: emit$4
  }),
  table: writer({ type: SECTION_TABLE, label: "Table", emitter: emitTables$1 }),
  memory: writer({ type: SECTION_MEMORY, label: "Memory", emitter: emit$8 }),
  exports: writer({
    type: SECTION_EXPORT,
    label: "Exports",
    emitter: emit$2
  }),
  globals: writer({ type: SECTION_GLOBAL, label: "Globals", emitter: emit$3 }),
  start: writer({ type: SECTION_START, label: "Start", emitter: emitTables }),
  element: writer({
    type: SECTION_ELEMENT,
    label: "Element",
    emitter: emit$5
  }),
  code: writer({ type: SECTION_CODE, label: "Code", emitter: emit$7 }),
  data: writer({ type: SECTION_DATA, label: "Data", emitter: emit$9 }),
  name: writer({ type: SECTION_NAME, label: "Name", emitter: emit$10 })
};

//      
function emit(program, config) {
  const stream = new OutputStream();

  // Write MAGIC and VERSION. This is now a valid WASM Module
  const result = stream.write(write(program.Version)).write(section.type(program)).write(section.imports(program)).write(section.function(program)).write(section.table(program)).write(section.memory(program)).write(section.globals(program)).write(section.exports(program)).write(section.start(program)).write(section.element(program)).write(section.code(program)).write(section.data(program));

  if (config.encodeNames) {
    return result.write(section.name(program));
  }

  return result;
}

//      
const _debug = (stream, begin = 0, end) => {
  let pc = 0;
  return stream.data.slice(begin, end).map(({ type, value, debug }) => {
    const pcString = pc.toString(16).padStart(8, "0").padEnd(stream.data.length.toString().length + 1);
    let valueString;
    if (Array.isArray(value)) {
      valueString = value.map(v => v.toString(16)).join().padStart(16);
    } else {
      valueString = value.toString(16).padStart(16);
    }
    const out = `${pcString}: ${valueString} ; ${debug}`;
    pc += index_16[type] || value.length;
    return out;
  }).join("\n") + "\n ============ fin =============";
};

//      
// Make this a .walt file or pre-parse into an ast.
const source = `
  const memory: Memory = { initial: 1 };
  let heapPointer: i32 = 0;
  export function malloc(size: i32): i32 {
    const ptr: i32 = heapPointer;
    heapPointer += size;
    return ptr;
  }

  export function free(ptr: i32) {
  }

  // Getters
  export function geti32(ptr: i32): i32 {
    const view: i32[] = ptr;
    return view[0];
  }

  export function getf32(ptr: i32): f32 {
    const view: f32[] = ptr;
    return view[0];
  }

  export function geti64(ptr: i32): i64 {
    const view: i64[] = ptr;
    return view[0];
  }

  export function getf64(ptr: i32): f64 {
    const view: f64[] = ptr;
    return view[0];
  }

  // Setters
  export function seti32(ptr: i32, value: i32) {
    const view: i32[] = ptr;
    view[0] = value;
  }

  export function setf32(ptr: i32, value: f32) {
    const view: f32[] = ptr;
    view[0] = value;
  }

  export function seti64(ptr: i32, value: i64) {
    const view: i64[] = ptr;
    view[0] = value;
  }

  export function setf64(ptr: i32, value: f64) {
    const view: f64[] = ptr;
    view[0] = value;
  }
`;

const mapToImports = plugin => {
  const {
    malloc,
    free,
    geti32,
    getf32,
    geti64,
    getf64,
    seti32,
    setf32,
    seti64,
    setf64
  } = plugin.instance.exports;

  return {
    [CLOSURE_MALLOC]: malloc,
    [CLOSURE_FREE]: free,
    [`${CLOSURE_GET}-i32`]: geti32,
    [`${CLOSURE_GET}-f32`]: getf32,
    [`${CLOSURE_GET}-i64`]: geti64,
    [`${CLOSURE_GET}-f64`]: getf64,
    [`${CLOSURE_SET}-i32`]: seti32,
    [`${CLOSURE_SET}-f32`]: setf32,
    [`${CLOSURE_SET}-i64`]: seti64,
    [`${CLOSURE_SET}-f64`]: setf64
  };
};

function closurePlugin$$1() {
  return compileWalt(source, {
    version: 0x1,
    encodeNames: false,
    filename: "walt-closure-plugin",
    lines: source.split("\n")
  });
}

//      
const VERSION = "0.5.3";

// Used for deugging purposes
const getIR = (source, {
  version = VERSION_1,
  encodeNames = false,
  lines = source ? source.split("\n") : [],
  filename = "unknown"
} = {}) => {
  const ast = parse(source);
  const semanticAST = semantics(ast);

  validate(semanticAST, {
    lines,
    filename
  });
  const intermediateCode = generator(semanticAST, {
    version,
    encodeNames,
    lines,
    filename
  });
  const wasm = emit(intermediateCode, {
    version,
    encodeNames,
    filename,
    lines
  });
  return wasm;
};

const withPlugins = (plugins, importsObj) => {
  const pluginMappers = {
    closure: (closure, imports) => {
      imports["walt-plugin-closure"] = mapToImports(closure);
    }
  };
  const resultImports = Object.entries(plugins).reduce((acc, [key, value]) => {
    pluginMappers[key](value, acc);
    return acc;
  }, {});

  return _extends({}, resultImports, importsObj);
};

// Compiles a raw binary wasm buffer
function compileWalt(source, config) {
  const wasm = getIR(source, config);
  return wasm.buffer();
}

exports.parser = parse;
exports.semantics = semantics;
exports.validate = validate;
exports.generator = generator;
exports.emitter = emit;
exports.prettyPrintNode = printNode;
exports.debug = _debug;
exports.closurePlugin = closurePlugin$$1;
exports.stringEncoder = stringEncoder;
exports.stringDecoder = stringDecoder;
exports.walkNode = walker;
exports.mapNode = mapNode;
exports.VERSION = VERSION;
exports.getIR = getIR;
exports.withPlugins = withPlugins;
exports['default'] = compileWalt;

Object.defineProperty(exports, '__esModule', { value: true });

})));
