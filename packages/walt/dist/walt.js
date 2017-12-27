(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(factory((global.Walt = {})));
}(this, (function (exports) { 'use strict';

//      

// Base Character stream class
class Stream {

  constructor(input = "") {
    this.pos = this.line = this.col = 0;
    this.input = input;
    this.lines = input.split("\n");
    this.newLine();
  }

  // Stop parsing and throw a fatal error
  die(reason) {
    throw new Error(reason);
  }

  // Peek at a character at current position
  peek() {
    return this.input.charAt(this.pos);
  }

  // Advance to next character in stream
  next() {
    const char = this.input.charAt(this.pos++);

    if (Stream.eol(char)) {
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
  static eol(char) {
    return char === "\n";
  }

  // Is the character an end of file
  static eof(char) {
    return char === "";
  }

  // Is the charater a whitespace
  static whitespace(char) {
    return char === "\n" || char === " " || char === "\t" || char === "\v" || char === "\r" || char === "\f";
  }
}

function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var trie$1 = createCommonjsModule(function (module) {
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

module.exports = Trie;
});

var token = createCommonjsModule(function (module) {
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

module.exports = wrap;
});

//      
const Syntax = {
  // Syntax Nodes
  Keyword: "Keyword",
  Export: "Export",
  Import: "Import",
  Statement: "Statement",
  IfThenElse: "IfThenElse",
  Select: "Select",
  Else: "Else",
  UnaryExpression: "UnaryExpression",
  BinaryExpression: "BinaryExpression",
  TernaryExpression: "TernaryExpression",
  NumberLiteral: "NumberLiteral",
  StringLiteral: "StringLiteral",
  Punctuator: "Punctuator",
  Identifier: "Identifier",
  ArraySubscript: "ArraySubscript",
  Constant: "Constant",
  Type: "Type",
  UserType: "UserType",
  Declaration: "Declaration",
  FunctionDeclaration: "FunctionDeclaration",
  ArrayDeclaration: "ArrayDeclaration",
  IndirectFunctionCall: "IndirectFunctionCall",
  FunctionCall: "FunctionCall",
  Loop: "Loop",
  Program: "Program",
  MemoryAssignment: "MemoryAssignment",
  Assignment: "Assignment",
  Param: "Param",
  Typedef: "Typedef",
  ReturnStatement: "ReturnStatement",
  Sequence: "Sequence",
  ObjectLiteral: "ObjectLiteral",
  Pair: "Pair",
  TypeCast: "TypeCast",
  Break: "Break",
  Comment: "Comment",

  Noop: "Noop",

  // Semantic Nodes
  Block: "Block",
  ObjectField: "ObjectField",
  FunctionIndex: "FunctionIndex",
  FunctionIdentifier: "FunctionIdentifier",
  FunctionPointer: "FunctionPointer",
  FunctionResult: "FunctionResult",
  FunctionLocals: "FunctionLocals"
};

//      
const supported = ["+", "++", "-", "--", "=", "==", "+=", "-=", "=>", "<=", "!=", "%", "/", "^", "&", "|", "!", "**", ":", "(", ")", ".", "{", "}", ",", "[", "]", ";", ">", "<", "?", "||", "&&", "{", "}"];

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

const root = char => {
  if (isDot(char)) {
    return number;
  }

  if (isNumber(char)) {
    return numberOrDot;
  }

  return null;
};

// TODO: split constants into literals String vs Numbers with Types
// TODO: figure out what above means??
var constant = token(root, Syntax.Constant);

//      
const quoteOK = quoteCheck => () => quoteCheck;
const nextFails = () => null;

const endsInSingleQuote = char => {
  if (char === "\\") {
    return quoteOK(endsInSingleQuote);
  }
  if (char === "'") {
    return nextFails;
  }

  return endsInSingleQuote;
};

const endsInDoubleQuote = char => {
  if (char === "\\") {
    return quoteOK(endsInDoubleQuote);
  }
  if (char === "\"") {
    return nextFails;
  }

  return endsInDoubleQuote;
};

const maybeQuote = char => {
  if (char === "'") {
    return endsInSingleQuote;
  }
  if (char === "\"") {
    return endsInDoubleQuote;
  }

  return null;
};

const stringParser = token(maybeQuote, Syntax.StringLiteral);

//      
const supportAny = char => {
  if (!stringParser(char) && !punctuator(char) && char !== " ") {
    return supportAny;
  }
  return null;
};

const parse = char => {
  // Don't allow these
  if (!stringParser(char) && !punctuator(char) && !constant(char) && char !== " ") {
    return supportAny;
  }
  return null;
};
const tokenParser = token(parse, Syntax.Identifier);

//      
const supported$1 = [
// EcmaScript
"break", "if", "else", "import", "from", "export", "return", "switch", "case", "default", "const", "let", "for", "continue", "do", "while",

// walt replacement, matching s-expression syntax
"function",

// s-expression
"global", "module", "type",

// specials/asserts
"invoke", "assert", "assert_return",

// additional syntax
// statically replaced with consant value at compile time
"sizeof"];



const trie$2 = new trie$1(supported$1);
const root$1 = trie$2.fsearch;

var keyword = token(root$1, Syntax.Keyword, supported$1);

//      
const everything = () => everything;

const slash = char => {
  if (char === "/") {
    return everything;
  }
};

const maybeComment = char => {
  if (char === "/") {
    return slash;
  }

  return null;
};

const commentParser = token(maybeComment, Syntax.Comment);

//      
const supported$2 = ["i32", "i64", "f32", "f64", "Function", "Memory", "Table", "void"];
const trie$3 = new trie$1(supported$2);
var type = token(trie$3.fsearch, Syntax.Type, supported$2);

//      
class Tokenizer {

  constructor(stream, parsers = [punctuator, constant, tokenParser, keyword, stringParser, type, commentParser]) {
    if (!(stream instanceof Stream)) {
      this.die(`Tokenizer expected instance of Stream in constructor.
                Instead received ${JSON.stringify(stream)}`);
    }
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
    } while (!Stream.eol(next) && !Stream.eof(next) && nextMatchers.length > 0);

    // If we fell off the end then bail out
    if (Stream.eof(value)) {
      return null;
    }

    const token = this.token(value, matchers);
    token.start = start;
    token.end = {
      line: this.stream.line,
      col: this.stream.col
    };
    // Comments are ignored for now
    if (token.type !== commentParser.type) {
      this.tokens.push(token);
    }

    return this.tokens[this.pos++];
  }

  match(char, parsers) {
    if (char == null) {
      return parsers;
    }

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

    if (parsers.length === 1) {
      token.type = parsers[0].type;
    }

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
    while (!Stream.eof(this.stream.peek())) {
      this.next();
    }

    return this.tokens;
  }

  /**
   * Stop parsing and throw a fatal error
   */
  die(reason) {
    throw new Error(reason);
  }
}

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

var wasmTypes = createCommonjsModule(function (module) {
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

const i32 = 1;
const i64 = 1 << 1;
const f32 = 1 << 2;
const f64 = 1 << 3;
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
  [i32]: word,
  [i64]: word * 2,
  [f32]: word,
  [f64]: word * 2,
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

const get = (type, index, dataView) => {
  switch (type) {
    case i32:
      return dataView.getInt32(index, LITTLE_ENDIAN);
    case i64:
      return dataView.getInt64(index, LITTLE_ENDIAN);
    case f32:
      return dataView.getFloat32(index, LITTLE_ENDIAN);
    case f64:
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

const set = (type, index, dataView, value) => {
  switch (type) {
    case i32:
      return dataView.setInt32(index, value, LITTLE_ENDIAN);
    case i64:
      return dataView.setInt64(index, value, LITTLE_ENDIAN);
    case f32:
      return dataView.setFloat32(index, value, LITTLE_ENDIAN);
    case f64:
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

module.exports = {
  i32,
  i64,
  f32,
  f64,
  anyfunc,
  func,
  block_type,
  i8,
  u8,
  i16,
  u16,
  u32,
  u64,
  set,
  get,
  sizeof
};
});

var wasmTypes_1 = wasmTypes.i32;
var wasmTypes_2 = wasmTypes.i64;
var wasmTypes_3 = wasmTypes.f32;
var wasmTypes_4 = wasmTypes.f64;
var wasmTypes_5 = wasmTypes.anyfunc;
var wasmTypes_6 = wasmTypes.func;
var wasmTypes_7 = wasmTypes.block_type;
var wasmTypes_8 = wasmTypes.i8;
var wasmTypes_9 = wasmTypes.u8;
var wasmTypes_10 = wasmTypes.i16;
var wasmTypes_11 = wasmTypes.u16;
var wasmTypes_12 = wasmTypes.u32;
var wasmTypes_13 = wasmTypes.u64;
var wasmTypes_14 = wasmTypes.set;
var wasmTypes_15 = wasmTypes.get;
var wasmTypes_16 = wasmTypes.sizeof;

//      
/**
 * Ported from https://github.com/WebAssembly/wabt/blob/master/src/opcode.def
 */
const def = {};
const opcodeMap = [];

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
opcode(wasmTypes_1, wasmTypes_1, ___, 4, 0x28, "i32Load", "i32.load");
opcode(wasmTypes_2, wasmTypes_1, ___, 8, 0x29, "i64Load", "i64.load");
opcode(wasmTypes_3, wasmTypes_1, ___, 4, 0x2a, "f32Load", "f32.load");
opcode(wasmTypes_3, wasmTypes_1, ___, 8, 0x2b, "f64Load", "f64.load");
opcode(wasmTypes_1, wasmTypes_1, ___, 1, 0x2c, "i32Load8S", "i32.load8_s");
opcode(wasmTypes_1, wasmTypes_1, ___, 1, 0x2d, "i32Load8U", "i32.load8_u");
opcode(wasmTypes_1, wasmTypes_1, ___, 2, 0x2e, "i32Load16S", "i32.load16_s");
opcode(wasmTypes_1, wasmTypes_1, ___, 2, 0x2f, "i32Load16U", "i32.load16_u");
opcode(wasmTypes_2, wasmTypes_1, ___, 1, 0x30, "i64Load8S", "i64.load8_s");
opcode(wasmTypes_2, wasmTypes_1, ___, 1, 0x31, "i64Load8U", "i64.load8_u");
opcode(wasmTypes_2, wasmTypes_1, ___, 2, 0x32, "i64Load16S", "i64.load16_s");
opcode(wasmTypes_2, wasmTypes_1, ___, 2, 0x33, "i64Load16U", "i64.load16_u");
opcode(wasmTypes_2, wasmTypes_1, ___, 4, 0x34, "i64Load32S", "i64.load32_s");
opcode(wasmTypes_2, wasmTypes_1, ___, 4, 0x35, "i64Load32U", "i64.load32_u");
opcode(___, wasmTypes_1, wasmTypes_1, 4, 0x36, "i32Store", "i32.store");
opcode(___, wasmTypes_1, wasmTypes_2, 8, 0x37, "i64Store", "i64.store");
opcode(___, wasmTypes_1, wasmTypes_3, 4, 0x38, "f32Store", "f32.store");
opcode(___, wasmTypes_1, wasmTypes_3, 8, 0x39, "f64Store", "f64.store");
opcode(___, wasmTypes_1, wasmTypes_1, 1, 0x3a, "i32Store8", "i32.store8");
opcode(___, wasmTypes_1, wasmTypes_1, 2, 0x3b, "i32Store16", "i32.store16");
opcode(___, wasmTypes_1, wasmTypes_2, 1, 0x3c, "i64Store8", "i64.store8");
opcode(___, wasmTypes_1, wasmTypes_2, 2, 0x3d, "i64Store16", "i64.store16");
opcode(___, wasmTypes_1, wasmTypes_2, 4, 0x3e, "i64Store32", "i64.store32");
opcode(wasmTypes_1, ___, ___, 0, 0x3f, "CurrentMemory", "current_memory");
opcode(wasmTypes_1, wasmTypes_1, ___, 0, 0x40, "GrowMemory", "grow_memory");
opcode(wasmTypes_1, ___, ___, 0, 0x41, "i32Const", "i32.const");
opcode(wasmTypes_2, ___, ___, 0, 0x42, "i64Const", "i64.const");
opcode(wasmTypes_3, ___, ___, 0, 0x43, "f32Const", "f32.const");
opcode(wasmTypes_3, ___, ___, 0, 0x44, "f64Const", "f64.const");
opcode(wasmTypes_1, wasmTypes_1, ___, 0, 0x45, "i32Eqz", "i32.eqz");
opcode(wasmTypes_1, wasmTypes_1, wasmTypes_1, 0, 0x46, "i32Eq", "i32.eq");
opcode(wasmTypes_1, wasmTypes_1, wasmTypes_1, 0, 0x47, "i32Ne", "i32.ne");
opcode(wasmTypes_1, wasmTypes_1, wasmTypes_1, 0, 0x48, "i32LtS", "i32.lt_s");
opcode(wasmTypes_1, wasmTypes_1, wasmTypes_1, 0, 0x49, "i32LtU", "i32.lt_u");
opcode(wasmTypes_1, wasmTypes_1, wasmTypes_1, 0, 0x4a, "i32GtS", "i32.gt_s");
opcode(wasmTypes_1, wasmTypes_1, wasmTypes_1, 0, 0x4b, "i32GtU", "i32.gt_u");
opcode(wasmTypes_1, wasmTypes_1, wasmTypes_1, 0, 0x4c, "i32LeS", "i32.le_s");
opcode(wasmTypes_1, wasmTypes_1, wasmTypes_1, 0, 0x4d, "i32LeU", "i32.le_u");
opcode(wasmTypes_1, wasmTypes_1, wasmTypes_1, 0, 0x4e, "i32GeS", "i32.ge_s");
opcode(wasmTypes_1, wasmTypes_1, wasmTypes_1, 0, 0x4f, "i32GeU", "i32.ge_u");
opcode(wasmTypes_1, wasmTypes_2, ___, 0, 0x50, "i64Eqz", "i64.eqz");
opcode(wasmTypes_1, wasmTypes_2, wasmTypes_2, 0, 0x51, "i64Eq", "i64.eq");
opcode(wasmTypes_1, wasmTypes_2, wasmTypes_2, 0, 0x52, "i64Ne", "i64.ne");
opcode(wasmTypes_1, wasmTypes_2, wasmTypes_2, 0, 0x53, "i64LtS", "i64.lt_s");
opcode(wasmTypes_1, wasmTypes_2, wasmTypes_2, 0, 0x54, "i64LtU", "i64.lt_u");
opcode(wasmTypes_1, wasmTypes_2, wasmTypes_2, 0, 0x55, "i64GtS", "i64.gt_s");
opcode(wasmTypes_1, wasmTypes_2, wasmTypes_2, 0, 0x56, "i64GtU", "i64.gt_u");
opcode(wasmTypes_1, wasmTypes_2, wasmTypes_2, 0, 0x57, "i64LeS", "i64.le_s");
opcode(wasmTypes_1, wasmTypes_2, wasmTypes_2, 0, 0x58, "i64LeU", "i64.le_u");
opcode(wasmTypes_1, wasmTypes_2, wasmTypes_2, 0, 0x59, "i64GeS", "i64.ge_s");
opcode(wasmTypes_1, wasmTypes_2, wasmTypes_2, 0, 0x5a, "i64GeU", "i64.ge_u");
opcode(wasmTypes_1, wasmTypes_3, wasmTypes_3, 0, 0x5b, "f32Eq", "f32.eq");
opcode(wasmTypes_1, wasmTypes_3, wasmTypes_3, 0, 0x5c, "f32Ne", "f32.ne");
opcode(wasmTypes_1, wasmTypes_3, wasmTypes_3, 0, 0x5d, "f32Lt", "f32.lt");
opcode(wasmTypes_1, wasmTypes_3, wasmTypes_3, 0, 0x5e, "f32Gt", "f32.gt");
opcode(wasmTypes_1, wasmTypes_3, wasmTypes_3, 0, 0x5f, "f32Le", "f32.le");
opcode(wasmTypes_1, wasmTypes_3, wasmTypes_3, 0, 0x60, "f32Ge", "f32.ge");
opcode(wasmTypes_1, wasmTypes_3, wasmTypes_3, 0, 0x61, "f64Eq", "f64.eq");
opcode(wasmTypes_1, wasmTypes_3, wasmTypes_3, 0, 0x62, "f64Ne", "f64.ne");
opcode(wasmTypes_1, wasmTypes_3, wasmTypes_3, 0, 0x63, "f64Lt", "f64.lt");
opcode(wasmTypes_1, wasmTypes_3, wasmTypes_3, 0, 0x64, "f64Gt", "f64.gt");
opcode(wasmTypes_1, wasmTypes_3, wasmTypes_3, 0, 0x65, "f64Le", "f64.le");
opcode(wasmTypes_1, wasmTypes_3, wasmTypes_3, 0, 0x66, "f64Ge", "f64.ge");
opcode(wasmTypes_1, wasmTypes_1, ___, 0, 0x67, "i32Clz", "i32.clz");
opcode(wasmTypes_1, wasmTypes_1, ___, 0, 0x68, "i32Ctz", "i32.ctz");
opcode(wasmTypes_1, wasmTypes_1, ___, 0, 0x69, "i32Popcnt", "i32.popcnt");
opcode(wasmTypes_1, wasmTypes_1, wasmTypes_1, 0, 0x6a, "i32Add", "i32.add");
opcode(wasmTypes_1, wasmTypes_1, wasmTypes_1, 0, 0x6b, "i32Sub", "i32.sub");
opcode(wasmTypes_1, wasmTypes_1, wasmTypes_1, 0, 0x6c, "i32Mul", "i32.mul");
opcode(wasmTypes_1, wasmTypes_1, wasmTypes_1, 0, 0x6d, "i32DivS", "i32.div_s");
opcode(wasmTypes_1, wasmTypes_1, wasmTypes_1, 0, 0x6e, "i32DivU", "i32.div_u");
opcode(wasmTypes_1, wasmTypes_1, wasmTypes_1, 0, 0x6f, "i32RemS", "i32.rem_s");
opcode(wasmTypes_1, wasmTypes_1, wasmTypes_1, 0, 0x70, "i32RemU", "i32.rem_u");
opcode(wasmTypes_1, wasmTypes_1, wasmTypes_1, 0, 0x71, "i32And", "i32.and");
opcode(wasmTypes_1, wasmTypes_1, wasmTypes_1, 0, 0x72, "i32Or", "i32.or");
opcode(wasmTypes_1, wasmTypes_1, wasmTypes_1, 0, 0x73, "i32Xor", "i32.xor");
opcode(wasmTypes_1, wasmTypes_1, wasmTypes_1, 0, 0x74, "i32Shl", "i32.shl");
opcode(wasmTypes_1, wasmTypes_1, wasmTypes_1, 0, 0x75, "i32ShrS", "i32.shr_s");
opcode(wasmTypes_1, wasmTypes_1, wasmTypes_1, 0, 0x76, "i32ShrU", "i32.shr_u");
opcode(wasmTypes_1, wasmTypes_1, wasmTypes_1, 0, 0x77, "i32Rotl", "i32.rotl");
opcode(wasmTypes_1, wasmTypes_1, wasmTypes_1, 0, 0x78, "i32Rotr", "i32.rotr");
opcode(wasmTypes_2, wasmTypes_2, ___, 0, 0x79, "i64Clz", "i64.clz");
opcode(wasmTypes_2, wasmTypes_2, ___, 0, 0x7a, "i64Ctz", "i64.ctz");
opcode(wasmTypes_2, wasmTypes_2, ___, 0, 0x7b, "i64Popcnt", "i64.popcnt");
opcode(wasmTypes_2, wasmTypes_2, wasmTypes_2, 0, 0x7c, "i64Add", "i64.add");
opcode(wasmTypes_2, wasmTypes_2, wasmTypes_2, 0, 0x7d, "i64Sub", "i64.sub");
opcode(wasmTypes_2, wasmTypes_2, wasmTypes_2, 0, 0x7e, "i64Mul", "i64.mul");
opcode(wasmTypes_2, wasmTypes_2, wasmTypes_2, 0, 0x7f, "i64DivS", "i64.div_s");
opcode(wasmTypes_2, wasmTypes_2, wasmTypes_2, 0, 0x80, "i64DivU", "i64.div_u");
opcode(wasmTypes_2, wasmTypes_2, wasmTypes_2, 0, 0x81, "i64RemS", "i64.rem_s");
opcode(wasmTypes_2, wasmTypes_2, wasmTypes_2, 0, 0x82, "i64RemU", "i64.rem_u");
opcode(wasmTypes_2, wasmTypes_2, wasmTypes_2, 0, 0x83, "i64And", "i64.and");
opcode(wasmTypes_2, wasmTypes_2, wasmTypes_2, 0, 0x84, "i64Or", "i64.or");
opcode(wasmTypes_2, wasmTypes_2, wasmTypes_2, 0, 0x85, "i64Xor", "i64.xor");
opcode(wasmTypes_2, wasmTypes_2, wasmTypes_2, 0, 0x86, "i64Shl", "i64.shl");
opcode(wasmTypes_2, wasmTypes_2, wasmTypes_2, 0, 0x87, "i64ShrS", "i64.shr_s");
opcode(wasmTypes_2, wasmTypes_2, wasmTypes_2, 0, 0x88, "i64ShrU", "i64.shr_u");
opcode(wasmTypes_2, wasmTypes_2, wasmTypes_2, 0, 0x89, "i64Rotl", "i64.rotl");
opcode(wasmTypes_2, wasmTypes_2, wasmTypes_2, 0, 0x8a, "i64Rotr", "i64.rotr");
opcode(wasmTypes_3, wasmTypes_3, wasmTypes_3, 0, 0x8b, "f32Abs", "f32.abs");
opcode(wasmTypes_3, wasmTypes_3, wasmTypes_3, 0, 0x8c, "f32Neg", "f32.neg");
opcode(wasmTypes_3, wasmTypes_3, wasmTypes_3, 0, 0x8d, "f32Ceil", "f32.ceil");
opcode(wasmTypes_3, wasmTypes_3, wasmTypes_3, 0, 0x8e, "f32Floor", "f32.floor");
opcode(wasmTypes_3, wasmTypes_3, wasmTypes_3, 0, 0x8f, "f32Trunc", "f32.trunc");
opcode(wasmTypes_3, wasmTypes_3, wasmTypes_3, 0, 0x90, "f32Nearest", "f32.nearest");
opcode(wasmTypes_3, wasmTypes_3, wasmTypes_3, 0, 0x91, "f32Sqrt", "f32.sqrt");
opcode(wasmTypes_3, wasmTypes_3, wasmTypes_3, 0, 0x92, "f32Add", "f32.add");
opcode(wasmTypes_3, wasmTypes_3, wasmTypes_3, 0, 0x93, "f32Sub", "f32.sub");
opcode(wasmTypes_3, wasmTypes_3, wasmTypes_3, 0, 0x94, "f32Mul", "f32.mul");
opcode(wasmTypes_3, wasmTypes_3, wasmTypes_3, 0, 0x95, "f32Div", "f32.div");
opcode(wasmTypes_3, wasmTypes_3, wasmTypes_3, 0, 0x96, "f32Min", "f32.min");
opcode(wasmTypes_3, wasmTypes_3, wasmTypes_3, 0, 0x97, "f32Max", "f32.max");
opcode(wasmTypes_3, wasmTypes_3, wasmTypes_3, 0, 0x98, "f32Copysign", "f32.copysign");
opcode(wasmTypes_3, wasmTypes_3, wasmTypes_3, 0, 0x99, "f32Abs", "f64.abs");
opcode(wasmTypes_3, wasmTypes_3, wasmTypes_3, 0, 0x9a, "f32Neg", "f64.neg");
opcode(wasmTypes_3, wasmTypes_3, wasmTypes_3, 0, 0x9b, "f32Ceil", "f64.ceil");
opcode(wasmTypes_3, wasmTypes_3, wasmTypes_3, 0, 0x9c, "f32Floor", "f64.floor");
opcode(wasmTypes_3, wasmTypes_3, wasmTypes_3, 0, 0x9d, "f32Trunc", "f64.trunc");
opcode(wasmTypes_3, wasmTypes_3, wasmTypes_3, 0, 0x9e, "f32Nearest", "f64.nearest");
opcode(wasmTypes_3, wasmTypes_3, wasmTypes_3, 0, 0x9f, "f32Sqrt", "f64.sqrt");
opcode(wasmTypes_3, wasmTypes_3, wasmTypes_3, 0, 0xa0, "f64Add", "f64.add");
opcode(wasmTypes_3, wasmTypes_3, wasmTypes_3, 0, 0xa1, "f64Sub", "f64.sub");
opcode(wasmTypes_3, wasmTypes_3, wasmTypes_3, 0, 0xa2, "f64Mul", "f64.mul");
opcode(wasmTypes_3, wasmTypes_3, wasmTypes_3, 0, 0xa3, "f64Div", "f64.div");
opcode(wasmTypes_3, wasmTypes_3, wasmTypes_3, 0, 0xa4, "f64Min", "f64.min");
opcode(wasmTypes_3, wasmTypes_3, wasmTypes_3, 0, 0xa5, "f64Max", "f64.max");
opcode(wasmTypes_3, wasmTypes_3, wasmTypes_3, 0, 0xa6, "f64Copysign", "f64.copysign");
opcode(wasmTypes_1, wasmTypes_2, ___, 0, 0xa7, "i32Wrapi64", "i32.wrap/i64");
opcode(wasmTypes_1, wasmTypes_3, ___, 0, 0xa8, "i32TruncSf32", "i32.trunc_s/f32");
opcode(wasmTypes_1, wasmTypes_3, ___, 0, 0xa9, "i32TruncUf32", "i32.trunc_u/f32");
opcode(wasmTypes_1, wasmTypes_3, ___, 0, 0xaa, "i32TruncSf64", "i32.trunc_s/f64");
opcode(wasmTypes_1, wasmTypes_3, ___, 0, 0xab, "i32TruncUf64", "i32.trunc_u/f64");
opcode(wasmTypes_2, wasmTypes_1, ___, 0, 0xac, "i64ExtendSi32", "i64.extend_s/i32");
opcode(wasmTypes_2, wasmTypes_1, ___, 0, 0xad, "i64ExtendUi32", "i64.extend_u/i32");
opcode(wasmTypes_2, wasmTypes_3, ___, 0, 0xae, "i64TruncSf32", "i64.trunc_s/f32");
opcode(wasmTypes_2, wasmTypes_3, ___, 0, 0xaf, "i64TruncUf32", "i64.trunc_u/f32");
opcode(wasmTypes_2, wasmTypes_3, ___, 0, 0xb0, "i64TruncSf64", "i64.trunc_s/f64");
opcode(wasmTypes_2, wasmTypes_3, ___, 0, 0xb1, "i64TruncUf64", "i64.trunc_u/f64");
opcode(wasmTypes_3, wasmTypes_1, ___, 0, 0xb2, "f32ConvertSi32", "f32.convert_s/i32");
opcode(wasmTypes_3, wasmTypes_1, ___, 0, 0xb3, "f32ConvertUi32", "f32.convert_u/i32");
opcode(wasmTypes_3, wasmTypes_2, ___, 0, 0xb4, "f32ConvertSi64", "f32.convert_s/i64");
opcode(wasmTypes_3, wasmTypes_2, ___, 0, 0xb5, "f32ConvertUi64", "f32.convert_u/i64");
opcode(wasmTypes_3, wasmTypes_3, ___, 0, 0xb6, "f32Demotef64", "f32.demote/f64");
opcode(wasmTypes_3, wasmTypes_1, ___, 0, 0xb7, "f64ConvertSi32", "f64.convert_s/i32");
opcode(wasmTypes_3, wasmTypes_1, ___, 0, 0xb8, "f64ConvertUi32", "f64.convert_u/i32");
opcode(wasmTypes_3, wasmTypes_2, ___, 0, 0xb9, "f64ConvertSi64", "f64.convert_s/i64");
opcode(wasmTypes_3, wasmTypes_2, ___, 0, 0xba, "f64ConvertUi64", "f64.convert_u/i64");
opcode(wasmTypes_3, wasmTypes_3, ___, 0, 0xbb, "f64Promotef32", "f64.promote/f32");
opcode(wasmTypes_1, wasmTypes_3, ___, 0, 0xbc, "i32Reinterpretf32", "i32.reinterpret/f32");
opcode(wasmTypes_2, wasmTypes_3, ___, 0, 0xbd, "i64Reinterpretf64", "i64.reinterpret/f64");
opcode(wasmTypes_3, wasmTypes_1, ___, 0, 0xbe, "f32Reinterpreti32", "f32.reinterpret/i32");
opcode(wasmTypes_3, wasmTypes_2, ___, 0, 0xbf, "f32Reinterpreti64", "f64.reinterpret/i64");

const getTypecastOpcode = (to, from) => {
  const toType = to[0];
  const fromType = from[0];

  if (to === "i32" && from === "i64") {
    return def.i32Wrapi64;
  }
  if (to === "i64" && from === "i32") {
    return def.i64ExtendSi32;
  }

  if (to === "f32" && from === "f64") {
    return def.f32Demotef64;
  }
  if (to === "f64" && from === "f32") {
    return def.f64Promotef32;
  }

  if (toType === "f" && fromType === "i") {
    return def[to + "ConvertS" + from];
  }

  if (toType === "i" && fromType === "f") {
    return def[to + "TruncS" + from];
  }

  throw new Error(`Unknown type conversion ${from} to ${to}`);
};

/**
 * Return opcode mapping to the operator. Signed result is always prefered
 */
const opcodeFromOperator = ({
  type,
  value
}) => {
  if (type == null) {
    return def.Noop;
  }

  switch (value) {
    case "+":
      return def[type + "Add"];
    case "-":
      return def[type + "Sub"];
    case "*":
      return def[type + "Mul"];
    case "/":
      return def[type + "DivS"] || def[type + "Div"];
    case "%":
      return def[type + "RemS"] || def[type + "RemU"];
    case "==":
      return def[type + "Eq"];
    case "!=":
      return def[type + "Ne"];
    case ">":
      return def[type + "GtU"] || def[type + "Gt"];
    case "<":
      return def[type + "LtU"] || def[type + "Lt"];
    case "<=":
      return def[type + "LeU"] || def[type + "Le"];
    case ">=":
      return def[type + "GeU"] || def[type + "Ge"];
    case "?":
      return def.If;
    case ":":
      return def.Else;
    case "[":
      return def[type + "Load"];
    case "&":
      return def[type + "And"];
    case "|":
      return def[type + "Or"];
    case "^":
      return def[type + "Xor"];
    default:
      throw new Error(`No mapping from operator to opcode ${value}`);
  }
};

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
const I32 = 0x7f;
const I64 = 0x7e;
const F32 = 0x7d;
const F64 = 0x7c;
const ANYFUNC = 0x70;
const FUNC = 0x60;


const getTypeString = type => {
  switch (type) {
    case I32:
      return "i32";
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
    default:
      return "?";
  }
};

//      


const formatMetadata = meta => {
  if (meta == null) {
    return "";
  }
  return meta.map(({ type, payload }) => {
    let payloadString = "";
    if (typeof payload === "object") {
      payloadString = "...";
    } else {
      payloadString = JSON.stringify(payload);
    }

    return `${type}(${payloadString})`;
  }).join(",");
};

const printNode = (node, level = 0) => {
  if (node == null) {
    return "";
  }
  const typeString = `${node.type ? "<" + node.type + ">" : ""}`;
  const metaString = formatMetadata(node.meta);
  let out = `${node.Type}${typeString} ${node.value} ${metaString}\n`;
  out = out.padStart(out.length + level * 2);
  if (node.params) {
    node.params.forEach(p => {
      out += printNode(p, level + 1);
    });
  }
  return out;
};

//      
// All of the metadata options are used like redux actions
// this is intentional but only for the purposes of a common
// flexible api.
const FUNCTION_INDEX = "function/index";
const LOCAL_INDEX_MAP = "function/locals-index-map";
const POSTFIX = "operator/postfix";

const LOCAL_INDEX = "local/index";
const GLOBAL_INDEX = "global/index";
const TABLE_INDEX = "table/index";
const TYPE_CONST = "type/const";
const TYPE_ARRAY = "type/array";
const TYPE_USER = "type/user";
const TYPE_OBJECT = "type/object";
const TYPE_INDEX = "type/index";
const OBJECT_SIZE = "object/size";
const TYPE_CAST = "type/cast";
const OBJECT_KEY_TYPES = "object/key-types";

const make = (payload, type) => ({
  type,
  payload
});

const get$1 = (type, node) => {
  invariant_1(node.meta, `Attemptend to access Metadata but it was undefined in node ${printNode(node)}`);
  return node ? node.meta.find(({ type: _type }) => _type === type) || null : null;
};

const funcIndex = payload => ({
  payload,
  type: FUNCTION_INDEX
});

const localIndex = payload => ({
  payload,
  type: LOCAL_INDEX
});

const globalIndex = payload => ({
  payload: { index: payload },
  type: GLOBAL_INDEX
});

const tableIndex = payload => ({
  payload,
  type: TABLE_INDEX
});

const postfix = () => ({
  payload: true,
  type: POSTFIX
});



const userType = payload => ({
  payload,
  type: TYPE_USER
});

const objectType = payload => ({
  payload,
  type: TYPE_OBJECT
});

const objectSize = payload => ({
  payload,
  type: OBJECT_SIZE
});

const array = payload => ({
  payload,
  type: TYPE_ARRAY
});
const constant$1 = () => ({ payload: true, type: TYPE_CONST });

const typeCast = payload => ({
  payload,
  type: TYPE_CAST
});

const objectKeyTypes = payload => ({
  payload,
  type: OBJECT_KEY_TYPES
});

const typeIndex = payload => ({
  payload,
  type: TYPE_INDEX
});

const localIndexMap = payload => ({
  type: LOCAL_INDEX_MAP,
  payload
});

const metadata = {
  make,
  get: get$1,
  postfix,
  funcIndex,
  localIndex,
  globalIndex,
  userType,
  tableIndex,
  objectSize,
  array,
  constant: constant$1,
  POSTFIX,
  LOCAL_INDEX,
  FUNCTION_INDEX,
  TABLE_INDEX,
  TYPE_ARRAY,
  TYPE_CONST,
  TYPE_USER,
  TYPE_OBJECT,
  OBJECT_SIZE
};

//      
const scopeOperation = curry_1((op, node) => {
  const local = get$1(LOCAL_INDEX, node);
  const _global = get$1(GLOBAL_INDEX, node);
  const index = local || _global;

  invariant_1(index, `Unefined index for scope Operation. Possibly missing metadata. op: ${JSON.stringify(op)} node: ${JSON.stringify(node, null, 2)}`);

  const kind = local ? op + "Local" : op + "Global";
  const params = [Number(index.payload.index)];

  return { kind: def[kind], params };
});

const getConstOpcode = node => {
  const nodeType = node.type || "i32";

  const kind = def[nodeType + "Const"];
  const params = [Number(node.value)];

  return {
    kind,
    params
  };
};

// clean this up
const getType = str => {
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
const generateValueType = node => ({
  mutable: get$1(TYPE_CONST, node) ? 0 : 1,
  type: getType(node.type)
});
const setInScope = scopeOperation("Set");
const getInScope = scopeOperation("Get");

//      
const generateInit = node => {
  const _global = generateValueType(node);
  if (node.params.length > 0) {
    const { Type, value } = node.params[0];
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
  }

  return _global;
};

//      


// Dead simple AST walker, takes a visitor object and calls all methods for
// appropriate node Types.
function walker(visitor) {
  const impl = (node, patch = () => {}) => {
    if (node == null) {
      return;
    }
    const { params } = node;

    const paramCount = params.length;

    if ("*" in visitor && typeof visitor["*"] === "function") {
      visitor["*"](node, patch);
    }

    if (node.Type in visitor && typeof visitor[node.Type] === "function") {
      visitor[node.Type](node, patch);
    }

    for (let i = 0; i < paramCount; i++) {
      const currentIndex = i;
      impl(params[i], newNode => {
        node.params = [...params.slice(0, currentIndex), newNode, ...params.slice(currentIndex + 1)];
      });
    }
  };

  return impl;
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
      }
    }
  })(node);

  return table;
}

//      
// More or less JavaScript precedence
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Operator_Precedence

const PRECEDENCE_FUNCTION_CALL = 19;
const PRECEDENCE_ASSIGNMENT = 3;


const PRECEDENCE_DIVIDE = 1;
const PRECEDENCE_MULTIPLY = 1;
const PRECEDENCE_ADDITION = 0;
const PRECEDENCE_SUBTRACTION = 0;
const PRECEDENCE_COMMA = -2;
const PRECEDENCE_BITWISE_XOR = -2;
const PRECEDENCE_BITWISE_AND = -1;
const PRECEDENCE_BITWISE_OR = -3;
const PRECEDENCE_LOGICAL_AND = -4;

const PRECEDENCE_LOGICAL_OR = -5;
const PRECEDENCE_KEY_VALUE_PAIR = -1;

const PRECEDENCE_PARAMS = -99;

const precedence = {
  "(": PRECEDENCE_PARAMS,
  ",": PRECEDENCE_COMMA,
  "+": PRECEDENCE_ADDITION,
  "-": PRECEDENCE_SUBTRACTION,
  "*": PRECEDENCE_MULTIPLY,
  "/": PRECEDENCE_DIVIDE,
  "==": 2,
  "!=": 2,
  "=": PRECEDENCE_ASSIGNMENT,
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
  "||": PRECEDENCE_LOGICAL_OR
};

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
  const [argsNode, resultNode] = functionNode.params;
  const resultType = resultNode.type ? getType$1(resultNode.type) : null;

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

  const typeExpression = node.params[0];
  invariant_1(typeExpression && typeExpression.Type === Syntax.BinaryExpression, "Generator: A function type must be of form (<type>, ...) <type> node:" + `${printNode(node)}`);

  // Collect the function params and result by walking the tree of nodes
  const params = [];
  let result = null;
  const left = typeExpression.params[0];
  const right = typeExpression.params[1];

  // if we do not have a right node, then we do not have any params for this function
  // type, so we just skip this.
  if (right != null) {
    walker({
      [Syntax.Type]: ({ value: typeValue }) => params.push(getType$1(typeValue))
    })(left);
  }

  walker({
    [Syntax.Type]: ({ value: typeValue }) => {
      result = typeValue && typeValue !== "void" ? getType$1(typeValue) : null;
    }
  })(right || left);

  return {
    id,
    params,
    result
  };
}

//      

const findTypeIndex = (functionNode, ctx) => {
  const search = generateImplicitFunctionType(functionNode);

  return ctx.Program.Types.findIndex(t => {
    const paramsMatch = t.params.length === search.params.length && t.params.reduce((a, v, i) => a && v === search.params[i], true);

    const resultMatch = t.result === search.result;

    return paramsMatch && resultMatch;
  });
};

const findTableIndex = (ctx, functionIndex) => {
  return ctx.Program.Element.findIndex(n => n.functionIndex === functionIndex);
};

const findGlobalIndex = (ctx, { value }) => ctx.globals.findIndex(node => node.value === value);

const findFunctionIndex = (ctx, { value }) => {
  return ctx.functions.findIndex(fn => fn.value === value);
};

const findLocalVariable = (functionNode, identifier) => {
  const localIndexMap$$1 = get$1(LOCAL_INDEX_MAP, functionNode);
  if (localIndexMap$$1 != null) {
    return localIndexMap$$1.payload[identifier.value];
  }
  return null;
};

const addFunctionLocal = (functionNode, localNode) => {
  const localIndexMap$$1 = get$1(LOCAL_INDEX_MAP, functionNode);
  if (localIndexMap$$1 != null) {
    const { payload } = localIndexMap$$1;
    const localsCount = Object.keys(payload).length;
    localIndexMap$$1.payload = _extends({}, localIndexMap$$1.payload, {
      [localNode.value]: {
        index: localsCount,
        node: localNode
      }
    });

    localNode.meta.push(localIndex(localsCount));
  }
};

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
const functionCall = (ctx, op, operands) => {
  const node = ctx.startNode(op);
  // If last operand is a sequence that means we have function arguments
  const maybeArguments = operands[operands.length - 1];
  if (maybeArguments && maybeArguments.Type !== Syntax.FunctionIdentifier) {
    node.params = operands.splice(-1);
  }

  const identifier = operands.splice(-1)[0];
  const maybePointer = ctx.func ? findLocalVariable(ctx.func, identifier) : null;

  if (maybePointer) {
    return ctx.endNode(_extends({}, node, {
      params: [...node.params, identifier]
    }), Syntax.IndirectFunctionCall);
  }

  const Type = Syntax.FunctionCall;
  const func = ctx.functions.find(({ value }) => value === identifier.value);
  if (!func) {
    throw ctx.syntaxError(`Undefined function: ${identifier.value}`);
  }

  node.meta = [...func.meta];

  invariant_1(func, `Undefined function ${identifier.value}`);

  node.type = func.type;

  return ctx.endNode(node, Type);
};

//      


function mapNode(visitor) {
  const impl = node => {
    if (node == null) {
      return node;
    }

    const mappedNode = (() => {
      if ("*" in visitor && typeof visitor["*"] === "function") {
        return visitor["*"](node);
      }

      if (node.Type in visitor && typeof visitor[node.Type] === "function") {
        return visitor[node.Type](node);
      }
      return node;
    })();

    const params = mappedNode.params.map(impl);

    return _extends({}, mappedNode, {
      params
    });
  };

  return impl;
}

//      
const isBinaryMathExpression = node => {
  switch (node.value) {
    case "&&":
    case "||":
    case "+":
    case "-":
    case "/":
    case "*":
    case "%":
    case "==":
    case ">":
    case "<":
    case ">=":
    case "<=":
    case "!=":
    case "&":
    case "|":
    case "^":
      return true;
    default:
      return false;
  }
};

const typeWeight = typeString => {
  switch (typeString) {
    case "i32":
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

function patchTypeCasts(node) {
  return mapNode({
    [Syntax.Pair]: typeCastMaybe => {
      const { params: [targetNode, typeNode] } = typeCastMaybe;
      const { type: from } = targetNode;
      const { value: to } = typeNode;

      // If both sides of a pair don't have types then it's not a typecast,
      // more likely a string: value pair in an object for example
      if (typeNode.Type === Syntax.Type && !!from && !!to) {
        return _extends({}, typeCastMaybe, {
          type: to,
          value: targetNode.value,
          Type: Syntax.TypeCast,
          meta: [...typeCastMaybe.meta, typeCast({ to, from })],
          // We need to drop the typeNode here, because it's not something we can generate
          params: [targetNode]
        });
      }

      return typeCastMaybe;
    }
  })(node);
}

const balanceTypesInMathExpression = expression => {
  // For top-level pairs, just do a mapping to convert to a typecast
  if (expression.Type === Syntax.Pair) {
    return patchTypeCasts(expression);
  }

  if (isBinaryMathExpression(expression)) {
    // patch any existing type-casts
    const patchedNode = patchTypeCasts(expression);

    // find the result type in the expression
    let type = null;
    patchedNode.params.forEach(({ type: childType }) => {
      // The way we do that is by scanning the top-level nodes in our expression
      if (typeWeight(type) < typeWeight(childType)) {
        type = childType;
      }
    });

    invariant_1(type, "Expression missing type parameters %s", printNode(patchedNode));

    // iterate again, this time, patching any mis-typed nodes
    const params = patchedNode.params.map(paramNode => {
      invariant_1(paramNode.type, "Undefiend type in expression %s", printNode(paramNode));

      if (paramNode.type !== type && type != null) {
        // last check is for flow
        return _extends({}, paramNode, {
          type,
          value: paramNode.value,
          Type: Syntax.TypeCast,
          meta: [...paramNode.meta, typeCast({ to: type, from: paramNode.type })],
          params: [paramNode]
        });
      }

      return paramNode;
    });

    return _extends({}, patchedNode, {
      params,
      type
    });
  }

  return expression;
};

//      
const nodeMetaType = targetNode => metadata.get(TYPE_USER, targetNode) || metadata.get(TYPE_ARRAY, targetNode);

const getMetaType = (ctx, token) => {
  const local = ctx.func ? findLocalVariable(ctx.func, token) : null;
  const globalIndex$$1 = findGlobalIndex(ctx, token);
  // Set the target variable
  const targetNode = local ? local.node : ctx.globals[globalIndex$$1];

  // Don't allow unknown variables
  if (targetNode == null) {
    throw ctx.syntaxError(`Undefined variable ${token.value}`);
  }

  // Get the meta-type of our target, it should be either an array or a user-defined
  // object type. These types are indexable.
  return nodeMetaType(targetNode);
};

// This is shared logic across different memory-store/load operations
//
// Generator is expecting an integer offset for the offset node and we are going to
// enforce this contract here.
const patchStringSubscript = (ctx, metaType, params) => {
  if (metaType.type === TYPE_USER && params[1].Type === Syntax.StringLiteral) {
    const metaObject = metadata.get(TYPE_OBJECT, metaType.payload);
    invariant_1(metaObject, "Undefined object properties");
    const { payload: byteOffsetsByKey } = metaObject;
    const { value: key } = params[1];
    const absoluteByteOffset = byteOffsetsByKey[key];
    return [params[0], ctx.makeNode({ value: absoluteByteOffset, type: "i32" }, Syntax.Constant)];
  }
  return params;
};

const subscriptFromNode = (ctx, node, metaType) => {
  if (metaType.type === TYPE_USER) {
    const objectKeyTypeMap = metadata.get(OBJECT_KEY_TYPES, metaType.payload);
    if (objectKeyTypeMap) {
      node.type = objectKeyTypeMap.payload[node.params[1].value];
    }
  } else {
    node.type = metaType.payload;
  }

  node.params = patchStringSubscript(ctx, metaType, node.params);

  node.meta.push(metaType);

  return ctx.endNode(node, Syntax.ArraySubscript);
};

//      
function binary(ctx, op, params) {
  const node = ctx.startNode(params[0]);
  node.value = op.value;
  node.params = params;

  let Type = Syntax.BinaryExpression;
  if (node.value === "=") {
    Type = Syntax.Assignment;
  } else if (node.value === "-=" || node.value === "+=") {
    Type = Syntax.Assignment;
    const value = node.value[0];
    node.value = "=";
    node.params = [node.params[0], binary(ctx, _extends({}, op, { value }), [node.params[0], node.params[1]])];
  } else if (node.value === "[") {
    const metaType = getMetaType(ctx, params[0]);
    invariant_1(metaType, "Cannot parse array subscript");
    return subscriptFromNode(ctx, node, metaType);
  } else if (node.value === ":") {
    Type = Syntax.Pair;
  } else if (node.value === "||" || node.value === "&&") {
    Type = Syntax.Select;
  }

  return balanceTypesInMathExpression(ctx.endNode(node, Type));
}

const unary = (ctx, op, params) => {
  const [target] = params;
  return _extends({}, target, {
    Type: Syntax.BinaryExpression,
    value: "-",
    params: [_extends({}, target, {
      value: "0",
      Type: Syntax.Constant,
      params: [],
      meta: []
    }), target]
  });
};

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
    case "?":
      return ternary(ctx, op, operands.splice(-2));
    case ",":
      return sequence(ctx, op, operands.slice(-2));
    case "{":
      return objectLiteral(ctx, op, operands.splice(-1));
    case "--":
      return unary(ctx, op, operands.splice(-1));
    default:
      if (op.type === Syntax.FunctionCall) {
        return functionCall(ctx, op, operands);
      }
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
  return ctx.endNode(node, Syntax.StringLiteral);
}

//      

function builtInType(ctx) {
  return ctx.makeNode({ value: ctx.token.value, type: ctx.token.value }, Syntax.Type);
}

//      
const generateElement = functionIndex => {
  return { functionIndex };
};

//      
// Maybe identifier, maybe function call
const maybeIdentifier = ctx => {
  const node = ctx.startNode();
  const local = ctx.func ? findLocalVariable(ctx.func, ctx.token) : null;
  const globalIndex$$1 = findGlobalIndex(ctx, ctx.token);
  const functionIndex = findFunctionIndex(ctx, ctx.token);
  const userType$$1 = ctx.userTypes[ctx.token.value];

  let Type = Syntax.Identifier;
  // Not a function call or pointer, look-up variables
  if (local != null) {
    node.type = local.node.type;
    node.meta.push(localIndex(local));
  } else if (globalIndex$$1 !== -1) {
    node.type = ctx.globals[globalIndex$$1].type;
    node.meta.push(globalIndex(globalIndex$$1));
  } else if (functionIndex !== -1 && ctx.stream.peek().value !== "(") {
    node.type = "i32";
    Type = Syntax.FunctionPointer;
    let tableIndex$$1 = findTableIndex(ctx, functionIndex);
    if (tableIndex$$1 < 0) {
      tableIndex$$1 = ctx.Program.Element.length;
      ctx.Program.Element.push(generateElement(functionIndex));
    }
    // make meta an object, sheesh
    node.meta.push(tableIndex(tableIndex$$1));
  } else if (userType$$1 != null && ctx.stream.peek().value !== "(") {
    node.type = "i32";
    Type = Syntax.UserType;
  } else if (functionIndex === -1) {
    ctx.handleUndefinedIdentifier(ctx.token.value);
  }

  return ctx.endNode(node, Type);
};

//      
const last = list => list[list.length - 1];

const valueIs = v => o => o.value === v;

const isLBracket = valueIs("(");
const isLSqrBracket = valueIs("[");
const isTStart = valueIs("?");
const isBlockStart = valueIs("{");
const isPunctuatorAndNotBracket = t => t && t.type === Syntax.Punctuator && t.value !== "]" && t.value !== ")";

const predicate = (token, depth) => token.value !== ";" && depth > 0;

// Shunting yard
const expression = (ctx,
// Type param is no longer used but a bunch of code still passes it in
// eslint-disable-next-line
type = "i32", check = predicate) => {
  const operators = [];
  const operands = [];
  // Depth is the nesting level of brackets in this expression. If we find a
  // closing bracket which causes our depth to fall below 1, then we know we
  // should exit the expression.
  let depth = 1;
  let eatFunctionCall = false;
  let inTernary = false;
  let previousToken = null;

  const consume = () => operands.push(operator(ctx, operators, operands));

  const eatUntil = condition => {
    let prev = last(operators);
    while (prev && !condition(prev)) {
      consume();
      prev = last(operators);
    }
  };

  const flushOperators = (precedence, value) => {
    let previous = null;
    while ((previous = last(operators)) && previous.Type !== Syntax.Sequence && getPrecedence(previous) >= precedence && getAssociativty(previous) === "left") {
      if (value === "," && previous.type === Syntax.FunctionCall) {
        break;
      }
      // if (value === ":" && previous.type === Syntax.Pair) break;
      consume();
    }
  };

  const processPunctuator = () => {
    switch (ctx.token.value) {
      case "(":
        depth++;
        // Function call.
        // TODO: figure out a cleaner(?) way of doing this, maybe
        if (eatFunctionCall) {
          // definetly not immutable
          last(operands).Type = Syntax.FunctionIdentifier;
          flushOperators(PRECEDENCE_FUNCTION_CALL);
          // Tokenizer does not generate function call tokens it is our job here
          // to generate a function call on the fly
          operators.push(_extends({}, ctx.token, {
            type: Syntax.FunctionCall
          }));
          ctx.next();
          const expr = expression(ctx);
          if (expr) {
            operands.push(expr);
          }
          return false;
        }
        if (ctx.token.value === "?") {
          inTernary = true;
        }
        operators.push(ctx.token);

        break;
      case "[":
        depth++;
        operators.push(ctx.token);
        break;
      case "]":
        depth--;
        eatUntil(isLSqrBracket);
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
          eatUntil(isLBracket);
          const previous = last(operators);
          if (previous && previous.type === Syntax.FunctionCall) {
            consume();
          } else if (depth > 0) {
            // Pop left bracket
            operators.pop();
          }

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
        eatUntil(isBlockStart);
        consume();
        break;
      default:
        {
          if (ctx.token.value === ":" && inTernary) {
            eatUntil(isTStart);
            inTernary = false;
            break;
          }

          const token = (t => {
            if (t.value === "-" && previousToken == null || t.value === "-" && isPunctuatorAndNotBracket(previousToken)) {
              return _extends({}, t, {
                value: "--"
              });
            }

            return t;
          })(ctx.token);

          flushOperators(getPrecedence(token), token.value);
          operators.push(token);
        }
    }
  };

  const process = () => {
    switch (ctx.token.type) {
      case Syntax.Constant:
        eatFunctionCall = false;
        operands.push(parseConstant(ctx));
        break;
      case Syntax.Identifier:
        eatFunctionCall = true;
        operands.push(maybeIdentifier(ctx));
        break;
      case Syntax.StringLiteral:
        eatFunctionCall = false;
        operands.push(stringLiteral(ctx));
        break;
      case Syntax.Type:
        eatFunctionCall = false;
        operands.push(builtInType(ctx));
        break;
      case Syntax.UnaryExpression:
        eatFunctionCall = false;
        flushOperators(getPrecedence(ctx.token), ctx.token.value);
        operators.push(ctx.token);
        break;
      case Syntax.Punctuator:
        const punctuatorResult = processPunctuator();
        if (punctuatorResult != null) {
          return punctuatorResult;
        }
        eatFunctionCall = false;
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

  while (operators.length) {
    consume();
  }

  // Should be a node
  return operands.pop();
};

//      
const generate = (ctx, node) => {
  if (!ctx.func) {
    if (node.type === "Memory") {
      ctx.Program.Memory.push(generateMemory(node));
    } else if (node.type === "Table") {
      ctx.Program.Table.push(generateMemory$2(node));
    } else {
      node.meta.push(metadata.globalIndex(ctx.Program.Globals.length));
      ctx.Program.Globals.push(generateInit(node));
      ctx.globals.push(node);
    }
  } else {
    addFunctionLocal(ctx.func, node);
  }
};

const declaration = ctx => {
  const node = ctx.startNode();

  if (ctx.token.value === "const") {
    node.meta.push(metadata.constant());
  }

  if (!ctx.eat(["const", "let", "function"])) {
    throw ctx.unexpectedValue(["const", "let", "function"]);
  }

  node.value = ctx.expect(null, Syntax.Identifier).value;
  ctx.expect([":"]);

  const userType$$1 = ctx.userTypes[ctx.token.value];
  if (userType$$1 != null) {
    node.type = "i32";
    node.meta.push(metadata.userType(userType$$1));
    // Eat the identifier for the user defined type
    ctx.eat(null, Syntax.Identifier);
  } else {
    node.type = ctx.expect(null, Syntax.Type).value;
  }

  if (ctx.eat(["["]) && ctx.eat(["]"])) {
    node.meta.push(metadata.array(node.type));
    node.type = "i32";
  }

  if (ctx.eat(["="])) {
    node.params.push(expression(ctx));
  }

  if (node.const && !node.init) {
    throw ctx.syntaxError("Constant value must be initialized");
  }

  generate(ctx, node);

  return ctx.endNode(node, Syntax.Declaration);
};

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
  const metaFunctionIndex = get$1(FUNCTION_INDEX, node);
  invariant_1(metaFunctionIndex, "Undefined function index for node \n" + `${printNode(node)}`);

  block.push({
    kind: def.Call,
    params: [metaFunctionIndex.payload.functionIndex]
  });

  return block;
};

//      
const generateIndirectFunctionCall = (node, parent) => {
  const block = node.params.map(mapSyntax(parent)).reduce(mergeBlock, []);
  const [pointerIdentifierNode] = node.params;

  const localIndex$$1 = get$1(LOCAL_INDEX, pointerIdentifierNode);
  invariant_1(localIndex$$1, "Undefined local index, not a valid function pointer");
  const { typeNode } = localIndex$$1.payload;
  const typeIndexMeta = get$1(TYPE_INDEX, typeNode);
  invariant_1(typeIndexMeta, "Variable is not of a valid function pointer type");

  return [...block, {
    kind: def.CallIndirect,
    params: [typeIndexMeta.payload, 0]
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
      type: node.type || "i32"
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
  const metaTableIndex = get$1(TABLE_INDEX, node);
  invariant_1(metaTableIndex, `Cannot generate function pointer for node: ${JSON.stringify(node)}`);
  return [{
    kind: def.i32Const,
    params: [metaTableIndex.payload]
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

  if (parent && Array.isArray(parent.locals)) {
    parent.locals.push(generateValueType(node));
  }

  if (initNode) {
    const metaIndex = get$1(LOCAL_INDEX, node);
    invariant_1(metaIndex, "Local Index is undefined. Cannot generate declaration");
    return [...generateExpression(_extends({}, initNode, { type: node.type }), parent), { kind: def.SetLocal, params: [metaIndex.payload] }];
  }

  return [];
};

//      
const generateArraySubscript = (node, parent) => {
  const metaType = nodeMetaType(node);
  invariant_1(metaType, `Cannot generate subscript on an non-indexable node ${JSON.stringify(node)}`);
  const block = node.params.map(mapSyntax(parent)).reduce(mergeBlock, []);

  if (metaType.type === TYPE_ARRAY) {
    // For array types, the index is multiplied by the contained object size
    block.push.apply(block, [
    // TODO: fix this for user-defined types
    { kind: def.i32Const, params: [4] }, { kind: def.i32Mul, params: [] }]);
  }

  // The sequence of opcodes to perfrom a memory load is
  // get(Local|Global) base, i32Const offset[, i32Const size, i32Mul ], i32Add
  block.push({ kind: def.i32Add, params: [] });

  // The last piece is the WASM opcode. Either load or store
  const nodeType = node.type || "i32";

  block.push({
    kind: def[nodeType + "Load"],
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
const generateAssignment = node => {
  const block = node.params.slice(1).map(mapSyntax(null)).reduce(mergeBlock, []);

  block.push(setInScope(node.params[0]));

  return block;
};

//      
const generateMemoryAssignment = (node, parent) => {
  const targetNode = node.params[0];
  const metaType = nodeMetaType(targetNode);

  const block = node.params[0].params.map(mapSyntax(parent)).reduce(mergeBlock, []);

  if (metaType && metaType.type === TYPE_ARRAY) {
    // For array types, the index is multiplied by the contained object size
    block.push.apply(block, [
    // TODO: fix this for user-defined types
    { kind: def.i32Const, params: [4] }, { kind: def.i32Mul, params: [] }]);
  }

  // The sequence of opcodes to perfrom a memory load is
  // get(Local|Global) base, i32Const offset[, i32Const size, i32Mul ], i32Add
  block.push({ kind: def.i32Add, params: [] });

  block.push.apply(block, node.params.slice(1).map(mapSyntax(parent)).reduce(mergeBlock, []));

  // The last piece is the WASM opcode. Either load or store
  block.push({
    kind: def[(node.type || "") + "Store"],
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
const EXTERN_FUNCTION = 0;
const EXTERN_TABLE = 1;
const EXTERN_MEMORY = 2;
const EXTERN_GLOBAL = 3;

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

function generateImportFromNode(node) {
  const [importsNode, moduleStringLiteralNode] = node.params;
  const { value: module } = moduleStringLiteralNode;
  const imports = [];

  // Look for Pair Types, encode them into imports array
  walker({
    [Syntax.Pair]: pairNode => {
      const [fieldIdentifierNode, typeOrIdentifierNode] = pairNode.params;
      const { value: field } = fieldIdentifierNode;
      const { value: importTypeValue } = typeOrIdentifierNode;
      const kind = getKindConstant(importTypeValue);
      const typeIndex$$1 = (() => {
        const typeIndexMeta = get$1(TYPE_INDEX, typeOrIdentifierNode);
        if (typeIndexMeta) {
          return typeIndexMeta.payload;
        }
        return null;
      })();

      imports.push({
        module,
        field,
        global: kind === EXTERN_GLOBAL,
        kind,
        typeIndex: typeIndex$$1
      });
    }
  })(importsNode);

  return imports;
}

//      
const generateLoop = (node, parent) => {
  const block = [];
  const mapper = mapSyntax(parent);
  const reverse = {
    ">": "<=",
    "<": ">=",
    ">=": "<",
    "<=": ">",
    "==": "!=",
    "!=": "=="
  };

  // First param in a for loop is assignment expression or Noop if it's a while loop
  const condition = node.params.slice(1, 2);
  condition[0].value = reverse[condition[0].value];
  const expression = node.params.slice(2, 3);

  block.push.apply(block, node.params.slice(0, 1).map(mapper).reduce(mergeBlock, []));
  block.push({ kind: def.Block, params: [0x40] });
  block.push({ kind: def.Loop, params: [0x40] });

  block.push.apply(block, condition.map(mapper).reduce(mergeBlock, []));
  block.push({ kind: def.BrIf, params: [1] });

  block.push.apply(block, (node.body || []).map(mapper).reduce(mergeBlock, []));

  block.push.apply(block, expression.map(mapper).reduce(mergeBlock, []));
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
const generateTypecast = (node, parent) => {
  const metaTypecast = get$1(TYPE_CAST, node);
  invariant_1(metaTypecast, `Cannot generate typecast for node: ${JSON.stringify(node)}`);

  const { to, from } = metaTypecast.payload;

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
  // Imports
  [Syntax.Import]: generateImportFromNode,
  // Loops
  [Syntax.Loop]: generateLoop,
  [Syntax.Break]: generateTypecast$2,
  // Comma separated lists
  [Syntax.Sequence]: generateSequence,
  // Typecast
  [Syntax.TypeCast]: generateTypecast,
  [Syntax.Noop]: generateNoop
};

const mapSyntax = curry_1((parent, operand) => {
  const mapping = syntaxMap[operand.Type];
  if (!mapping) {
    const value = operand.id || operand.value || operand.operator && operand.operator.value;
    throw new Error(`Unexpected Syntax Token ${operand.Type} : ${value}`);
  }

  const validate = (block, i) => invariant_1(block.kind, "Unknown opcode generated in block index %s %s. \nOperand: \n%s", i, JSON.stringify(block), printNode(operand));
  const blocks = mapping(operand, parent);
  if (Array.isArray(blocks)) {
    blocks.forEach(validate);
  }

  return blocks;
});

//      
const generateCode = func => {
  // eslint-disable-next-line
  const [argsNode, resultNode, ...body] = func.params;

  invariant_1(body, "Cannot generate code for function without body");

  const block = {
    code: [],
    locals: []
  };

  // NOTE: Declarations have a side-effect of changing the local count
  //       This is why mapSyntax takes a parent argument
  const mappedSyntax = body.map(mapSyntax(block));
  if (mappedSyntax) {
    block.code = mappedSyntax.reduce(mergeBlock, []);
  }

  return block;
};

//      


const handleUndefined = ctx => identifier => {
  throw ctx.syntaxError(`Undefined variable name ${identifier}`);
};

function generateErrorString(msg, error, token, Line, filename, func) {
  const { line, col } = token.start;
  const { col: end } = token.end;

  const highlight = new Array(end - col + 1).join("^").padStart(end, " ");
  return `
${Line}
${highlight} ${error}
${msg}
  at ${func} (${filename}:${line}:${col})`;
}

//      
const last$1 = list => list[list.length - 1];

const parseArguments = ctx => {
  ctx.expect(["("]);
  ctx.handleUndefinedIdentifier = () => {};
  const argumentsNode = expression(ctx);
  ctx.handleUndefinedIdentifier = handleUndefined(ctx);
  ctx.expect([")"]);

  return mapNode({
    [Syntax.Pair]: pairNode => {
      const [identifierNode, typeNode] = pairNode.params;
      if (typeNode.Type !== Syntax.Type) {
        const functionType = ctx.functionTypes[typeNode.value];
        const userType$$1 = ctx.userTypes[typeNode.value];
        const typePointer = functionType || userType$$1;
        const meta = [];

        if (typePointer == null) {
          throw ctx.syntaxError("Undefined Type", typeNode.value);
        }
        if (userType$$1) {
          meta.push(userType(userType$$1));
        }

        return _extends({}, pairNode, {
          params: [_extends({}, identifierNode, {
            type: typePointer.type,
            meta
          }), _extends({}, typeNode, typePointer, {
            // clear params so we don't recurse into object definition
            params: [],
            type: "i32",
            Type: Syntax.Type
          })]
        });
      }

      return _extends({}, pairNode, {
        params: [_extends({}, identifierNode, { type: typeNode.type }), typeNode]
      });
    }
  })(argumentsNode);
};

const parseFunctionResult = ctx => {
  const baseNode = ctx.startNode();
  if (ctx.eat([":"])) {
    return ctx.endNode(_extends({}, baseNode, {
      type: (() => {
        const value = ctx.token.value;
        if (ctx.eat(null, Syntax.Type)) {
          return value === "void" ? null : value;
        }

        return "i32";
      })()
    }), Syntax.FunctionResult);
  }

  return ctx.endNode(_extends({}, baseNode), Syntax.FunctionResult);
};

const initializeLocals = argsNode => {
  const payload = {};
  walker({
    [Syntax.Pair]: pairNode => {
      const [identifierNode, typeNode] = pairNode.params;
      const localsCount = Object.keys(payload).length;
      payload[identifierNode.value] = {
        index: localsCount,
        node: identifierNode,
        typeNode
      };
    }
  })(argsNode);

  return localIndexMap(payload);
};

const maybeFunctionDeclaration = ctx => {
  if (!ctx.eat(["function"])) {
    return declaration(ctx);
  }

  const baseNode = ctx.startNode();
  const value = ctx.expect(null, Syntax.Identifier).value;
  const argumentsNode = parseArguments(ctx);
  const localsMetadata = initializeLocals(argumentsNode);
  const resultNode = parseFunctionResult(ctx);

  // NOTE: We need to write function into Program BEFORE
  // we parse the body as the body may refer to the function
  // itself recursively
  // Either re-use an existing type or write a new one

  const emptyNode = _extends({}, baseNode, {
    value,
    type: resultNode.type,
    params: [argumentsNode, resultNode],
    meta: [localsMetadata]
  });
  const typeIndex$$1 = (() => {
    const index = findTypeIndex(emptyNode, ctx);
    if (index === -1) {
      // attach to a type index
      ctx.Program.Types.push(generateImplicitFunctionType(emptyNode));
      return ctx.Program.Types.length - 1;
    }

    return index;
  })();
  const functionIndex = ctx.Program.Functions.length;
  const functionIndexMeta = make({
    get functionIndex() {
      return functionIndex + ctx.functionImports.length;
    }
  }, FUNCTION_INDEX);

  emptyNode.meta = [...emptyNode.meta, typeIndex(typeIndex$$1), functionIndexMeta];
  ctx.func = emptyNode;
  ctx.functions.push(emptyNode);

  ctx.expect(["{"]);
  const statements = [];
  while (ctx.token && ctx.token.value !== "}") {
    const stmt = statement(ctx);
    if (stmt) {
      statements.push(stmt);
    }
  }

  // Sanity check the return statement
  const ret = last$1(statements);
  if (ret && resultNode.type) {
    if (resultNode.type == null && ret.Type === Syntax.ReturnStatement) {
      throw ctx.syntaxError("Unexpected return value in a function with result : void");
    }
    if (resultNode.type != null && ret.Type !== Syntax.ReturnStatement) {
      throw ctx.syntaxError("Expected a return value in a function with result : " + JSON.stringify(resultNode.type));
    }
  }

  const node = _extends({}, emptyNode, {
    params: [...emptyNode.params, ...statements]
  });

  ctx.Program.Functions.push(typeIndex$$1);

  // generate the code block for the emitter
  ctx.Program.Code.push(generateCode(node));

  ctx.expect(["}"]);
  ctx.func = null;

  return ctx.endNode(node, Syntax.FunctionDeclaration);
};

//      
function generateExport(node) {
  const functionIndexMeta = get$1(FUNCTION_INDEX, node);
  const globalIndexMeta = get$1(GLOBAL_INDEX, node);

  if (globalIndexMeta) {
    return {
      index: globalIndexMeta.payload.index,
      kind: EXTERN_GLOBAL,
      field: node.value
    };
  }

  if (functionIndexMeta) {
    return {
      get index() {
        return functionIndexMeta.payload.functionIndex;
      },
      kind: EXTERN_FUNCTION,
      field: node.value
    };
  }

  invariant_1(false, "Unknown Export");
}

//      
function _export(ctx) {
  const node = ctx.startNode();
  ctx.eat(["export"]);

  const decl = maybeFunctionDeclaration(ctx);
  if (decl.Type === Syntax.Declaration && decl.params.length < 1) {
    throw ctx.syntaxError("Scalar exports must be initialized with a value");
  }
  ctx.Program.Exports.push(generateExport(decl));

  node.params.push(decl);

  return ctx.endNode(node, Syntax.Export);
}

//      
const hoistTypeMaybe = (ctx, typeNode, functionNode) => {
  const typeIndex$$1 = ctx.Program.Types.findIndex(({ id }) => id === typeNode.value);
  if (typeIndex$$1 < 0) {
    const hoistIndex = ctx.Program.Types.length;
    ctx.Program.Types.push({
      id: typeNode.value,
      params: [],
      // When we DO define a type for it later, patch the dummy type
      hoist: node => {
        functionNode.type = node.type;
        ctx.Program.Types[hoistIndex] = generateType(node);
      }
    });

    return hoistIndex;
  }
  return typeIndex$$1;
};

const patchTypeIndexes = (ctx, node) => {
  return mapNode({
    [Syntax.Pair]: pairNode => {
      const [identifierNode, typeNode] = pairNode.params;
      if (getKindConstant(typeNode.value) === EXTERN_FUNCTION) {
        // crate a new type
        const functionIndex = ctx.Program.Functions.length;
        const functionIndexMeta = make({
          functionIndex
        }, FUNCTION_INDEX);
        const functionNode = _extends({}, identifierNode, {
          id: identifierNode.value,
          meta: [functionIndexMeta]
        });
        const typeIndexMeta = typeIndex(hoistTypeMaybe(ctx, typeNode, functionNode));
        ctx.Program.Functions.push(null);
        ctx.functions.push(functionNode);
        return _extends({}, pairNode, {
          params: [functionNode, _extends({}, typeNode, {
            meta: [typeIndexMeta]
          })]
        });
      }

      return pairNode;
    }
  })(node);
};

function parseImport(ctx) {
  const baseNode = ctx.startNode();
  ctx.eat(["import"]);

  if (!ctx.eat(["{"])) {
    throw ctx.syntaxError("expected {");
  }

  ctx.handleUndefinedIdentifier = () => {};
  const fields = expression(ctx);
  ctx.handleUndefinedIdentifier = handleUndefined(ctx);

  ctx.expect(["}"]);
  ctx.expect(["from"]);

  const module = expression(ctx);

  const node = patchTypeIndexes(ctx, _extends({}, baseNode, { params: [fields, module] }));
  ctx.Program.Imports.push.apply(ctx.Program.Imports, generateImportFromNode(node));

  return ctx.endNode(node, Syntax.Import);
}

//      
function breakParser(ctx) {
  const node = ctx.startNode();
  ctx.expect(["break"]);
  return ctx.endNode(node, Syntax.Break);
}

//      
// A scenario where the type declared needs to be hoisted exists during imports.
// We may want to import a function with a specific type, but we cannot declare
// the type inline(at least not currently). Once we do find the appropriate type
// here we _hoist_ it in the binary output by placing it literally before the
// binary imports inside our Program.
const hoistTypeMaybe$1 = (ctx, node) => {
  // At this point we may have found a type which needs to hoist
  let typeIndex$$1 = ctx.Program.Types.findIndex(({ id }) => id === node.value);

  if (get$1(TYPE_OBJECT, node) == null) {
    const typeNode = ctx.Program.Types[typeIndex$$1];

    if (typeNode == null) {
      typeIndex$$1 = ctx.Program.Types.length;
      ctx.Program.Types.push(generateType(node));
    } else if (typeNode.hoist !== null) {
      typeNode.hoist(node);
    }

    node.meta.push(typeIndex(typeIndex$$1));
    ctx.functionTypes[node.value] = node;
  }
};

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
        case "i32":
        case "f32":
          size += 4;
          break;
        case "i64":
        case "f64":
          size += 8;
          break;
        default:
          size += 4;
      }
    }
  })(objectLiteralNode);

  return [offsetsByKey, size, keyTypeMap];
};

function typeParser(ctx) {
  const node = ctx.startNode();
  ctx.eat(["type"]);

  node.value = ctx.expect(null, Syntax.Identifier).value;
  ctx.expect(["="]);

  // Quick way to figure out if we are looking at an object to follow or a function definition.
  const isObjectType = ctx.token.value === "{";

  // All typedefs should be valid expressions
  node.params = [expression(ctx)];

  if (isObjectType) {
    const [offsetsByKey, totalSize, keyTypeMap] = getByteOffsetsAndSize(node.params[0]);
    node.meta.push(objectType(offsetsByKey));
    node.meta.push(objectSize(totalSize));
    node.meta.push(objectKeyTypes(keyTypeMap));
    node.type = "i32";
    ctx.userTypes[node.value] = node;
  } else {
    const resultNode = node.params[0].params[1] || node.params[0].params[0];
    node.type = resultNode.type;
  }

  hoistTypeMaybe$1(ctx, node);

  return ctx.endNode(node, Syntax.Typedef);
}

//      
const paramList = ctx => {
  ctx.expect(["("]);
  const params = [];
  let node = null;
  while (ctx.token.value && ctx.token.value !== ")") {
    node = expression(ctx, "i32");
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

  node.params = paramList(ctx);

  ctx.expect(["{"]);

  const body = [];
  let stmt = null;
  while (ctx.token && ctx.token.value !== "}") {
    stmt = statement(ctx);
    if (stmt) {
      body.push(stmt);
    }
  }
  ctx.expect(["}"]);

  return ctx.endNode(_extends({}, node, {
    body
  }), Syntax.Loop);
};

//      
const whileLoop = ctx => {
  const node = ctx.startNode();
  ctx.eat(["while"]);
  ctx.expect(["("]);

  node.params = [ctx.makeNode({}, Syntax.Noop), expression(ctx, "i32")];

  ctx.expect([")"]);
  ctx.expect(["{"]);

  const body = [];
  let stmt = null;
  while (ctx.token && ctx.token.value !== "}") {
    stmt = statement(ctx);
    if (stmt) {
      body.push(stmt);
    }
  }

  ctx.expect(["}"]);

  return ctx.endNode(_extends({}, node, {
    body
  }), Syntax.Loop);
};

//      

/**
 * Context is used to parse tokens into an AST and IR used by the generator.
 * Originally the parser was a giant class and the context was the 'this' pointer.
 * Maintaining a monolithic parser is rather difficult so it was broken up into a
 * collection of self-contained parsers for each syntactic construct. The context
 * is passed around between each one to generate the desired tree
 */

class Context {

  constructor(options) {
    Object.assign(this, _extends({
      body: [],
      diAssoc: "right",
      globals: [],
      functions: [],
      lines: [],
      functionImports: [],
      functionImportsLength: 0,
      userTypes: {},
      functionTypes: {},
      handleUndefinedIdentifier: handleUndefined(this)
    }, options));

    this.Program = {
      body: [],
      // Setup keys needed for the emitter
      Types: [],
      Code: [],
      Exports: [],
      Imports: [],
      Globals: [],
      Element: [],
      Functions: [],
      Memory: [],
      Table: []
    };
  }

  syntaxError(msg, error) {
    const functionId = (this.func ? this.func.id : "global") || "unknown";
    return new SyntaxError(generateErrorString(msg, error || "", this.token, this.lines[this.token.start.line - 1], this.filename || "unknown", functionId));
  }

  unexpectedValue(value) {
    return this.syntaxError(`Expected: ${Array.isArray(value) ? value.join("|") : value}`, "Unexpected value");
  }

  unexpected(token) {
    return this.syntaxError(`Expected: ${Array.isArray(token) ? token.join(" | ") : JSON.stringify(token)}`, `Unexpected token ${this.token.type}`);
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

  startNode(token = this.token) {
    return {
      Type: "",
      value: token.value,
      range: [token.start],
      meta: [],
      params: [],
      type: null
    };
  }

  endNode(node, Type) {
    const token = this.token || this.stream.last();
    return _extends({}, node, {
      Type,
      range: node.range.concat(token.end)
    });
  }

  makeNode(node, syntax) {
    return this.endNode(_extends({}, this.startNode(), node), syntax);
  }
}

//      
const returnStatement = ctx => {
  const node = ctx.startNode();
  if (!ctx.func) {
    throw ctx.syntaxError("Return statement is only valid inside a function");
  }
  ctx.expect(["return"]);
  const expr = expression(ctx);

  // For generator to emit correct consant they must have a correct type
  // in the syntax it's not necessary to define the type since we can infer it here
  if (expr.type && ctx.func && ctx.func.type != null && ctx.func.type !== expr.type) {
    throw ctx.syntaxError(`Return type mismatch expected ${ctx.func.type}, got ${expr.type}`);
  } else if (!expr.type && ctx.func && ctx.func.type) {
    expr.type = ctx.func.type;
  }

  node.params.push(expr);

  return ctx.endNode(node, Syntax.ReturnStatement);
};

//      
const condition = ctx => {
  ctx.expect(["("]);
  const expr = expression(ctx, "i32");
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
const variableSize = targetNode => {
  const metaType = nodeMetaType(targetNode);

  if (metaType != null) {
    invariant_1(metaType.type === TYPE_USER, `sizeof is not-supported on type supplied ${metaType.type}`);
    const metaSize = get$1(OBJECT_SIZE, metaType.payload);

    invariant_1(metaSize, "Object size information is missing");

    return metaSize.payload;
  }

  switch (targetNode.type) {
    case "i64":
    case "f64":
      return "8";
    case "i32":
    case "f32":
    default:
      return "4";
  }
};

function sizeof(ctx) {
  const node = ctx.startNode();

  ctx.eat(["sizeof"]);
  ctx.eat(["("]);

  const local = ctx.func ? findLocalVariable(ctx.func, ctx.token) : null;
  const globalIndex$$1 = findGlobalIndex(ctx, ctx.token);
  const targetNode = local ? local.node : ctx.globals[globalIndex$$1];

  node.value = variableSize(targetNode);
  // All sizes are 32-bit
  node.type = "i32";

  ctx.eat([")"]);

  return ctx.endNode(node, Syntax.Constant);
}

//      
const keyword$1 = ctx => {
  switch (ctx.token.value) {
    case "let":
    case "const":
      return declaration(ctx);
    case "function":
      return maybeFunctionDeclaration(ctx);
    case "export":
      return _export(ctx);
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
    case "sizeof":
      return sizeof(ctx);
    case "break":
      return breakParser(ctx);
    default:
      throw ctx.unsupported();
  }
};

//      
// Parse the expression and set the appropriate Type for the generator
const memoryStore = ctx => {
  // Parse the assignment
  const node = expression(ctx, "i32");

  invariant_1(node.params.length > 0, "Memory Store expression could not be parsed");

  const type = node.params[0].type;

  return ctx.endNode(_extends({}, node, { type }), Syntax.MemoryAssignment);
};

//      
// It is easier to parse assignment this way as we need to maintain a valid type
// through out the right-hand side of the expression
function maybeAssignment(ctx) {
  const nextValue = ctx.stream.peek().value;
  if (nextValue === "[") {
    return memoryStore(ctx);
  }

  return expression(ctx);
}

//      
const statement = ctx => {
  switch (ctx.token.type) {
    case Syntax.Keyword:
      return keyword$1(ctx);
    case Syntax.Punctuator:
      if (ctx.eat([";"])) {
        return null;
      }
      if (ctx.token.value === "{") {
        return blockParser(ctx);
      }
      throw ctx.syntaxError("Unexpected expression");
    case Syntax.Identifier:
      return maybeAssignment(ctx);
    default:
      throw ctx.unknown(ctx.token);
  }
};

//      
class Parser {

  constructor(tokens, lines = []) {
    this.context = new Context({
      body: [],
      diAssoc: "right",
      stream: tokens,
      token: tokens.next(),
      lines,
      globals: [],
      functions: [],
      filename: "unknown.walt"
    });
  }

  // Get the ast
  parse() {
    const ctx = this.context;
    // No code, no problem, empty ast equals
    // (module) ; the most basic wasm module
    if (!ctx.stream || !ctx.stream.length) {
      return {};
    }

    const node = ctx.Program;

    while (ctx.stream.peek()) {
      const child = statement(ctx);
      if (child) {
        node.body.push(child);
      }
    }

    return node;
  }
}

//      


class TokenStream {

  constructor(tokens = []) {
    this.length = tokens.length;
    this.tokens = tokens;
    this.pos = 0;
  }

  next() {
    return this.tokens[this.pos++];
  }

  peek() {
    return this.tokens[this.pos];
  }

  last() {
    return this.tokens[this.length - 1];
  }
}

//      
// Used to output raw binary, holds values and types in a large array 'stream'
class OutputStream {

  constructor() {
    // Our data, expand it
    this.data = [];

    // start at the beginning
    this.size = 0;
  }

  push(type, value, debug = "") {
    let size = 0;
    switch (type) {
      case "varuint7":
      case "varuint32":
      case "varint7":
      case "varint1":
        {
          // Encode all of the LEB128 aka 'var*' types
          value = this.encode(value);
          size = value.length;
          invariant_1(size, `Cannot write a value of size ${size}`);
          break;
        }
      case "varint32":
        {
          value = this.encodeSigned(value);
          size = value.length;
          invariant_1(size, `Cannot write a value of size ${size}`);
          break;
        }
      default:
        {
          size = wasmTypes_16[type];
          invariant_1(size, `Cannot write a value of size ${size}, type ${type}`);
        }
    }

    this.data.push({ type, value, debug });
    this.size += size;

    return this;
  }

  encode(value) {
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
  }

  encodeSigned(value) {
    const encoding = [];
    const size = 32;
    while (true) {
      const byte = value & 127;
      value = value >>> 7;
      const signbit = byte & 0x40;
      if (value < 0) {
        value = value | ~0 << size - 7;
      }

      if (value === 0 && !signbit || value === -1 && signbit) {
        encoding.push(byte);
        break;
      } else {
        encoding.push(byte | 0x80);
      }
    }
    return encoding;
  }

  // Get the BUFFER, not data array. **Always creates new buffer**
  buffer() {
    const buffer = new ArrayBuffer(this.size);
    const view = new DataView(buffer);
    let pc = 0;
    this.data.forEach(({ type, value }) => {
      if (Array.isArray(value)) {
        value.forEach(v => wasmTypes_14(wasmTypes_9, pc++, view, v));
      } else {
        wasmTypes_14(type, pc, view, value);
        pc += wasmTypes_16[type];
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

//      
// TODO these should be configure-able/not defined here
const VERSION = 0x1;
const MAGIC = 0x6d736100;



function write() {
  return new OutputStream().push(wasmTypes_12, MAGIC, "\\0asm").push(wasmTypes_12, VERSION, `version ${VERSION}`);
}

//      

const varuint32 = "varuint32";
const varint7 = "varint7";
const varint1 = "varint1";
const varint32 = "varint32";

//      
function emitString(stream, string, debug = "string length") {
  stream.push(varuint32, string.length, debug);
  for (let i = 0; i < string.length; i++) {
    stream.push(wasmTypes_9, string.charCodeAt(i), string[i]);
  }
  return stream;
}

//      
const emit$1 = entries => {
  const payload = new OutputStream().push(varuint32, entries.length, "entry count");

  entries.forEach(({ module, field, kind, global, typeIndex }) => {
    emitString(payload, module, "module");
    emitString(payload, field, "field");

    switch (kind) {
      case EXTERN_GLOBAL:
        {
          payload.push(wasmTypes_9, kind, "Global");
          payload.push(wasmTypes_9, global, getTypeString(global));
          payload.push(wasmTypes_9, 0, "immutable");
          break;
        }
      case EXTERN_FUNCTION:
        {
          payload.push(wasmTypes_9, kind, "Function");
          payload.push(varuint32, typeIndex, "type index");
          break;
        }
      case EXTERN_TABLE:
        {
          payload.push(wasmTypes_9, kind, "Table");
          payload.push(wasmTypes_9, ANYFUNC, "function table types");
          payload.push(varint1, 0, "has max value");
          payload.push(varuint32, 0, "iniital table size");
          break;
        }
      case EXTERN_MEMORY:
        {
          payload.push(wasmTypes_9, kind, "Memory");
          payload.push(varint1, 0, "has no max");
          payload.push(varuint32, 1, "iniital memory size(PAGES)");
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

  exports.forEach(({ field, kind, index }) => {
    emitString(payload, field, "field");

    payload.push(wasmTypes_9, kind, "Global");
    payload.push(varuint32, index, "index");
  });

  return payload;
};

//      
const encode = (payload, { type, init, mutable }) => {
  payload.push(wasmTypes_9, type, getTypeString(type));
  payload.push(wasmTypes_9, mutable, "mutable");
  // Encode the constant
  switch (type) {
    case I32:
      payload.push(wasmTypes_9, def.i32Const.code, def.i32Const.text);
      payload.push(varint32, init, `value (${init})`);
      break;
    case F32:
      payload.push(wasmTypes_9, def.f32Const.code, def.f32Const.text);
      payload.push(wasmTypes_3, init, `value (${init})`);
      break;
    case F64:
      payload.push(wasmTypes_9, def.f64Const.code, def.f64Const.text);
      payload.push(wasmTypes_4, 42.6, `value (${init})`);
      break;
  }

  payload.push(wasmTypes_9, def.End.code, "end");
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
const writer = ({ type, label, emitter }) => ast => {
  const field = ast[label];
  if (!field || !field.length) {
    return null;
  }

  const stream = new OutputStream().push(wasmTypes_9, type, label + " section");
  const entries = emitter(field);

  stream.push(varuint32, entries.size, "size");
  stream.write(entries);

  return stream;
};

//      
const emitElement = stream => ({ functionIndex }, index) => {
  stream.push(varuint32, 0, "table index");
  stream.push(wasmTypes_9, def.i32Const.code, "offset");
  stream.push(varuint32, index, "");
  stream.push(wasmTypes_9, def.End.code, "end");
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
const emitType = (stream, { params, result }) => {
  // as of wasm 1.0 spec types are only of from === func
  stream.push(varint7, FUNC, "func type");
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

  types.forEach(type => emitType(stream, type));

  return stream;
};

//      
const emitLocal = (stream, local) => {
  if (local.isParam == null) {
    stream.push(varuint32, 1, "number of locals of following type");
    stream.push(varint7, local.type, `${getTypeString(local.type)}`);
  }
};

const emitFunctionBody = (stream, { locals, code }) => {
  // write bytecode into a clean buffer
  const body = new OutputStream();

  code.forEach(({ kind, params, valueType }) => {
    // There is a much nicer way of doing this
    body.push(wasmTypes_9, kind.code, kind.text);

    if (valueType) {
      body.push(wasmTypes_9, valueType.type, "result type");
      body.push(wasmTypes_9, valueType.mutable, "mutable");
    }

    // map over all params, if any and encode each one
    (params || []).forEach(p => {
      let type = varuint32;
      let stringType = "i32.literal";

      // Memory opcode?
      if (kind.code >= 0x28 && kind.code <= 0x3e) {
        type = varuint32;
        stringType = "memory_immediate";
      } else {
        // either encode unsigned 32 bit values or floats
        switch (kind.result) {
          case wasmTypes_9:
            type = wasmTypes_9;
            break;
          case wasmTypes_4:
            type = wasmTypes_4;
            stringType = "f64.literal";
            break;
          case wasmTypes_3:
            type = wasmTypes_3;
            stringType = "f32.literal";
            break;
          case wasmTypes_1:
            type = varint32;
            stringType = "i32.literal";
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
  stream.push(varuint32, body.size + localsStream.size + 2, "body size in bytes");
  stream.push(varuint32, locals.length, "locals count");

  stream.write(localsStream);
  stream.write(body);
  stream.push(wasmTypes_9, def.End.code, "end");
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
  payload.push(varint1, entry.max ? 1 : 0, "has no max");
  payload.push(varuint32, entry.initial, "initial table size");
  if (entry.max) {
    payload.push(varuint32, entry.max, "max table size");
  }
};

function emitTables(tables) {
  const stream = new OutputStream();
  stream.push(varuint32, tables.length, "count");
  tables.forEach(entry => emitEntry$1(stream, entry));

  return stream;
}

//      
const SECTION_TYPE = 1;
const SECTION_IMPORT = 2;
const SECTION_FUNCTION = 3;
const SECTION_TABLE = 4;
const SECTION_MEMORY = 5;
const SECTION_GLOBAL = 6;
const SECTION_EXPORT = 7;

const SECTION_ELEMENT = 9;
const SECTION_CODE = 10;

//      
var section = {
  type: writer({ type: SECTION_TYPE, label: "Types", emitter: emit$6 }),
  imports: writer({ type: SECTION_IMPORT, label: "Imports", emitter: emit$1 }),
  function: writer({
    type: SECTION_FUNCTION,
    label: "Functions",
    emitter: emit$4
  }),
  table: writer({ type: SECTION_TABLE, label: "Table", emitter: emitTables }),
  memory: writer({ type: SECTION_MEMORY, label: "Memory", emitter: emit$8 }),
  exports: writer({
    type: SECTION_EXPORT,
    label: "Exports",
    emitter: emit$2
  }),
  globals: writer({ type: SECTION_GLOBAL, label: "Globals", emitter: emit$3 }),
  element: writer({
    type: SECTION_ELEMENT,
    label: "Element",
    emitter: emit$5
  }),
  code: writer({ type: SECTION_CODE, label: "Code", emitter: emit$7 })
};

//      
function emit(ast = {}) {
  const stream = new OutputStream();

  // Write MAGIC and VERSION. This is now a valid WASM Module
  return stream.write(write()).write(section.type(ast)).write(section.imports(ast)).write(section.function(ast)).write(section.table(ast)).write(section.memory(ast)).write(section.globals(ast)).write(section.exports(ast)).write(section.element(ast)).write(section.code(ast));
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
    pc += wasmTypes_16[type] || value.length;
    return out;
  }).join("\n") + "\n ============ fin =============";
};

//      
const debug = _debug;

// Used for deugging purposes
const getAst = source => {
  const stream = new Stream(source);
  const tokenizer = new Tokenizer(stream);
  const tokenStream = new TokenStream(tokenizer.parse());
  const parser = new Parser(tokenStream, stream.lines);
  const ast = parser.parse();
  return ast;
};

const getIR = source => {
  const ast = getAst(source);
  const wasm = emit(ast);
  return wasm;
};

// Compiles a raw binary wasm buffer
const compile = source => {
  const wasm = getIR(source);
  return wasm.buffer();
};

exports.debug = debug;
exports.getAst = getAst;
exports.getIR = getIR;
exports['default'] = compile;

Object.defineProperty(exports, '__esModule', { value: true });

})));
