(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(factory((global.Walt = global.Walt || {})));
}(this, (function (exports) { 'use strict';

//      

// Base Character stream class
class Stream {

  constructor(input = '') {
    this.pos = this.line = this.col = 0;
    this.input = input;
    this.lines = input.split('\n');
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

    if (Stream.eol(char)) this.newLine();else this.col++;

    return char;
  }

  // Begin a new line
  newLine() {
    this.line++;
    this.col = 0;
  }

  // Is the character an end of line
  static eol(char) {
    return char === '\n';
  }

  // Is the character an end of file
  static eof(char) {
    return char === '';
  }

  // Is the charater a whitespace
  static whitespace(char) {
    return char === "\n" || char === ' ' || char === "\t" || char === "\v" || char === "\r" || char === "\f";
  }
}

function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var trie$1 = createCommonjsModule(function (module) {
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
      char: '',
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

    while (typeof current.children[char] !== 'undefined' && char.length > 0) {
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
const wrap = (predicate, type, supported) => {
  const wrapper = value => {
    const result = predicate(value);
    return typeof result === 'function' ? wrap(result, type, supported) : result;
  };
  wrapper.type = type;
  wrapper.supported = supported;
  wrapper.strict = !!supported;
  wrapper.leaf = predicate.leaf;
  return wrapper;
};

module.exports = wrap;
});

const Syntax = {
  Keyword: 'Keyword',
  Export: 'Export',
  Import: 'Import',
  Statement: 'Statement',
  IfThenElse: 'IfThenElse',
  UnaryExpression: 'UnaryExpression',
  BinaryExpression: 'BinaryExpression',
  TernaryExpression: 'TernaryExpression',
  NumberLiteral: 'NumberLiteral',
  StringLiteral: 'StringLiteral',
  Punctuator: 'Punctuator',
  Identifier: 'Identifier',
  Constant: 'Constant',
  Type: 'Type',
  Declaration: 'Declaration',
  FunctionDeclaration: 'FunctionDeclaration',
  FunctionCall: 'FunctionCall',
  Loop: 'Loop',
  Program: 'Program',
  Assignment: 'Assignment',
  Param: 'Param',
  Typedef: 'Typedef',
  ReturnStatement: 'ReturnStatement'
};

var Syntax_1 = Syntax;

const supported = ['+', '++', '-', '--', '=', '==', '=>', '<=', '!=', '%', '/', '^', '&', '|', '!', '**', ':', '(', ')', '.', '{', '}', ',', ';', '>', '<', '?'];

const trie = new trie$1(supported);
var index = token(trie.fsearch, Syntax_1.Punctuator, supported);

var index$1 = createCommonjsModule(function (module) {
const { isNaN, parseInt } = Number;



const isNumber = char => !isNaN(parseInt(char));
const isDot = char => char === '.';
const number = char => isNumber(char) ? number : null;
const numberOrDot = char => {
  if (isDot(char)) return number;

  if (isNumber(char)) {
    return numberOrDot;
  }
  return null;
};

const root = char => {
  if (char === '-' || char === '+') return numberOrDot;

  if (isDot(char)) return number;

  if (isNumber(char)) return numberOrDot;

  return null;
};

// TODO: split constants into literals String vs Numbers with Types
module.exports = token(root, Syntax_1.Constant);
});

const quoteOK = quoteCheck => char => quoteCheck;
const nextFails = () => null;

const endsInSingleQuote = char => {
  if (char === '\\') return quoteOK(endsInSingleQuote);
  if (char === '\'') return nextFails;

  return endsInSingleQuote;
};

const endsInDoubleQuote = char => {
  if (char === '\\') return quoteOK(endsInDoubleQuote);
  if (char === '"') return nextFails;

  return endsInDoubleQuote;
};

const maybeQuote = char => {
  if (char === '\'') return endsInSingleQuote;
  if (char === '"') return endsInDoubleQuote;

  return null;
};

const stringParser = token(maybeQuote, Syntax_1.StringLiteral);

const parse = char => {
  if (!stringParser(char) && !index(char) && !index$1(char)) return parse;
  return null;
};
const tokenParser = token(parse, Syntax_1.Identifier);

const supported$1 = [
// EcmaScript
'break', 'if', 'else', 'import', 'from', 'export', 'return', 'switch', 'case', 'default', 'const', 'let', 'for', 'continue', 'do', 'while',

// walt replacement, matching s-expression syntax
'function',

// s-expression
'global', 'module', 'memory', 'table', 'type',

// specials/asserts
'invoke', 'assert', 'assert_return',

// additional syntax
// statically replaced with consant value at compile time
'sizeof'];

const trie$3 = new trie$1(supported$1);
const root = trie$3.fsearch;
var index$2 = token(root, Syntax_1.Keyword, supported$1);

const supported$2 = ['i32', 'i64', 'f32', 'f64', 'Function', 'void'];
const trie$4 = new trie$1(supported$2);
var index$3 = token(trie$4.fsearch, Syntax_1.Type, supported$2);

class Tokenizer {
  constructor(stream, parsers = [index, index$1, tokenParser, index$2, stringParser, index$3]) {
    if (!(stream instanceof Stream)) this.die(`Tokenizer expected instance of Stream in constructor.
                Instead received ${JSON.stringify(stream)}`);
    this.stream = stream;
    this.tokens = [];
    this.pos = 0;
    this.parsers = parsers;
  }

  /**
   * Get next token
   *
   * @return {Object} token
   */
  next() {
    let value = '';
    this.seekNonWhitespace();
    let char;
    let matchers = this.parsers;
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
      nextMatchers = this.match(this.stream.peek(), matchers);
    } while (!Stream.eol(this.stream.peek()) && !Stream.eof(this.stream.peek()) && !Stream.whitespace(this.stream.peek()) && nextMatchers.length > 0);

    const token = this.token(value, matchers);
    token.start = start;
    token.end = {
      line: this.stream.line,
      col: this.stream.col
    };
    this.tokens.push(token);

    return this.tokens[this.pos++];
  }

  match(char, parsers) {
    if (char == null) return parsers;

    return parsers.map(parse => parse(char)).filter(p => p);
  }

  /**
   * Match a particular non-whitespace value to a token
   *
   * @param {String} value Value to match
   * @return {Object} token
   */
  token(value, parsers, token = { type: 'unknown', value }) {
    // Strict parsers must end on a leaf node
    if (parsers.length > 1) {
      parsers = parsers.filter(parser => parser.strict ? parser.leaf : true);
      if (parsers.length > 1) parsers = parsers.filter(parser => parser.strict);
    }

    if (parsers.length === 1) token.type = parsers[0].type;

    return token;
  }

  /**
   * Seek Stream until next non-whitespace character. Can end in eof/eol
   */
  seekNonWhitespace() {
    while (Stream.whitespace(this.stream.peek())) this.stream.next();
  }

  parse() {
    while (!Stream.eof(this.stream.peek())) this.next();

    return this.tokens;
  }

  /**
   * Stop parsing and throw a fatal error
   *
   * @param {String} reason
   * @throws
   */
  die(reason) {
    throw new Error(reason);
  }
}

var index$4 = createCommonjsModule(function (module) {
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

var index_1 = index$4.i32;
var index_2 = index$4.i64;
var index_3 = index$4.f32;
var index_4 = index$4.f64;
var index_9 = index$4.u8;
var index_12 = index$4.u32;
var index_14 = index$4.set;
var index_16 = index$4.sizeof;

const EXTERN_FUNCTION = 0;
const EXTERN_TABLE = 1;

const EXTERN_GLOBAL = 3;

const getTypeString = type => {
  switch (type) {
    case I32:
      return 'i32';
    case I64:
      return 'i64';
    case F32:
      return 'f32';
    case F64:
      return 'f64';
    case FUNC:
      return 'func';
    case ANYFUNC:
      return 'anyfunc';
    default:
      return '?';
  }
};

const I32 = 0x7F;
const I64 = 0x7E;
const F32 = 0x7D;
const F64 = 0x7C;
const ANYFUNC = 0x70;
const FUNC = 0x60;

/**
 * Ported from https://github.com/WebAssembly/wabt/blob/master/src/opcode.def
 */
const def = {};
const opcodeMap = [];
const textMap = [];
const ___ = null;

/**
 * Convert Opcode definiton to usable object(s)
 *
 * @param {Number} result result type
 * @param {Number} first  t1 type of the 1st parameter
 * @param {Number} second type of the 2nd parameter
 * @param {Number} m      memory size of the operation, if any
 * @param {Number} code   opcode
 * @param {String} name   used to generate the opcode enum
 * @param {String} text   a string of the opcode name in the text format
 *
 * @return {Object} Opcode
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

opcode(___, ___, ___, 0, 0x00, 'Unreachable', "unreachable");
opcode(___, ___, ___, 0, 0x01, 'Nop', "nop");
opcode(___, ___, ___, 0, 0x02, 'Block', "block");
opcode(___, ___, ___, 0, 0x03, 'Loop', "loop");
opcode(___, ___, ___, 0, 0x04, 'If', "if");
opcode(___, ___, ___, 0, 0x05, 'Else', "else");
opcode(___, ___, ___, 0, 0x06, 'Try', "try");
opcode(___, ___, ___, 0, 0x07, 'Catch', "catch");
opcode(___, ___, ___, 0, 0x08, 'Throw', "throw");
opcode(___, ___, ___, 0, 0x09, 'Rethrow', "rethrow");
opcode(___, ___, ___, 0, 0x0a, 'CatchAll', "catch_all");
opcode(___, ___, ___, 0, 0x0b, 'End', "end");
opcode(___, ___, ___, 0, 0x0c, 'Br', "br");
opcode(___, ___, ___, 0, 0x0d, 'BrIf', "br_if");
opcode(___, ___, ___, 0, 0x0e, 'BrTable', "br_table");
opcode(___, ___, ___, 0, 0x0f, 'Return', "return");
opcode(___, ___, ___, 0, 0x10, 'Call', "call");
opcode(___, ___, ___, 0, 0x11, 'CallIndirect', "call_indirect");
opcode(___, ___, ___, 0, 0x1a, 'Drop', "drop");
opcode(___, ___, ___, 0, 0x1b, 'Select', "select");
opcode(___, ___, ___, 0, 0x20, 'GetLocal', "get_local");
opcode(___, ___, ___, 0, 0x21, 'SetLocal', "set_local");
opcode(___, ___, ___, 0, 0x22, 'TeeLocal', "tee_local");
opcode(___, ___, ___, 0, 0x23, 'GetGlobal', "get_global");
opcode(___, ___, ___, 0, 0x24, 'SetGlobal', "set_global");
opcode(index_1, index_1, ___, 4, 0x28, 'i32Load', "i32.load");
opcode(index_2, index_1, ___, 8, 0x29, 'i64Load', "i64.load");
opcode(index_3, index_1, ___, 4, 0x2a, 'f32Load', "f32.load");
opcode(index_3, index_1, ___, 8, 0x2b, 'f32Load', "f64.load");
opcode(index_1, index_1, ___, 1, 0x2c, 'i32Load8S', "i32.load8_s");
opcode(index_1, index_1, ___, 1, 0x2d, 'i32Load8U', "i32.load8_u");
opcode(index_1, index_1, ___, 2, 0x2e, 'i32Load16S', "i32.load16_s");
opcode(index_1, index_1, ___, 2, 0x2f, 'i32Load16U', "i32.load16_u");
opcode(index_2, index_1, ___, 1, 0x30, 'i64Load8S', "i64.load8_s");
opcode(index_2, index_1, ___, 1, 0x31, 'i64Load8U', "i64.load8_u");
opcode(index_2, index_1, ___, 2, 0x32, 'i64Load16S', "i64.load16_s");
opcode(index_2, index_1, ___, 2, 0x33, 'i64Load16U', "i64.load16_u");
opcode(index_2, index_1, ___, 4, 0x34, 'i64Load32S', "i64.load32_s");
opcode(index_2, index_1, ___, 4, 0x35, 'i64Load32U', "i64.load32_u");
opcode(___, index_1, index_1, 4, 0x36, 'i32Store', "i32.store");
opcode(___, index_1, index_2, 8, 0x37, 'i64Store', "i64.store");
opcode(___, index_1, index_3, 4, 0x38, 'f32Store', "f32.store");
opcode(___, index_1, index_3, 8, 0x39, 'f32Store', "f64.store");
opcode(___, index_1, index_1, 1, 0x3a, 'i32Store8', "i32.store8");
opcode(___, index_1, index_1, 2, 0x3b, 'i32Store16', "i32.store16");
opcode(___, index_1, index_2, 1, 0x3c, 'i64Store8', "i64.store8");
opcode(___, index_1, index_2, 2, 0x3d, 'i64Store16', "i64.store16");
opcode(___, index_1, index_2, 4, 0x3e, 'i64Store32', "i64.store32");
opcode(index_1, ___, ___, 0, 0x3f, 'CurrentMemory', "current_memory");
opcode(index_1, index_1, ___, 0, 0x40, 'GrowMemory', "grow_memory");
opcode(index_1, ___, ___, 0, 0x41, 'i32Const', "i32.const");
opcode(index_2, ___, ___, 0, 0x42, 'i64Const', "i64.const");
opcode(index_3, ___, ___, 0, 0x43, 'f32Const', "f32.const");
opcode(index_3, ___, ___, 0, 0x44, 'f64Const', "f64.const");
opcode(index_1, index_1, ___, 0, 0x45, 'i32Eqz', "i32.eqz");
opcode(index_1, index_1, index_1, 0, 0x46, 'i32Eq', "i32.eq");
opcode(index_1, index_1, index_1, 0, 0x47, 'i32Ne', "i32.ne");
opcode(index_1, index_1, index_1, 0, 0x48, 'i32LtS', "i32.lt_s");
opcode(index_1, index_1, index_1, 0, 0x49, 'i32LtU', "i32.lt_u");
opcode(index_1, index_1, index_1, 0, 0x4a, 'i32GtS', "i32.gt_s");
opcode(index_1, index_1, index_1, 0, 0x4b, 'i32GtU', "i32.gt_u");
opcode(index_1, index_1, index_1, 0, 0x4c, 'i32LeS', "i32.le_s");
opcode(index_1, index_1, index_1, 0, 0x4d, 'i32LeU', "i32.le_u");
opcode(index_1, index_1, index_1, 0, 0x4e, 'i32GeS', "i32.ge_s");
opcode(index_1, index_1, index_1, 0, 0x4f, 'i32GeU', "i32.ge_u");
opcode(index_1, index_2, ___, 0, 0x50, 'i64Eqz', "i64.eqz");
opcode(index_1, index_2, index_2, 0, 0x51, 'i64Eq', "i64.eq");
opcode(index_1, index_2, index_2, 0, 0x52, 'i64Ne', "i64.ne");
opcode(index_1, index_2, index_2, 0, 0x53, 'i64LtS', "i64.lt_s");
opcode(index_1, index_2, index_2, 0, 0x54, 'i64LtU', "i64.lt_u");
opcode(index_1, index_2, index_2, 0, 0x55, 'i64GtS', "i64.gt_s");
opcode(index_1, index_2, index_2, 0, 0x56, 'i64GtU', "i64.gt_u");
opcode(index_1, index_2, index_2, 0, 0x57, 'i64LeS', "i64.le_s");
opcode(index_1, index_2, index_2, 0, 0x58, 'i64LeU', "i64.le_u");
opcode(index_1, index_2, index_2, 0, 0x59, 'i64GeS', "i64.ge_s");
opcode(index_1, index_2, index_2, 0, 0x5a, 'i64GeU', "i64.ge_u");
opcode(index_1, index_3, index_3, 0, 0x5b, 'f32Eq', "f32.eq");
opcode(index_1, index_3, index_3, 0, 0x5c, 'f32Ne', "f32.ne");
opcode(index_1, index_3, index_3, 0, 0x5d, 'f32Lt', "f32.lt");
opcode(index_1, index_3, index_3, 0, 0x5e, 'f32Gt', "f32.gt");
opcode(index_1, index_3, index_3, 0, 0x5f, 'f32Le', "f32.le");
opcode(index_1, index_3, index_3, 0, 0x60, 'f32Ge', "f32.ge");
opcode(index_1, index_3, index_3, 0, 0x61, 'f32Eq', "f64.eq");
opcode(index_1, index_3, index_3, 0, 0x62, 'f32Ne', "f64.ne");
opcode(index_1, index_3, index_3, 0, 0x63, 'f32Lt', "f64.lt");
opcode(index_1, index_3, index_3, 0, 0x64, 'f32Gt', "f64.gt");
opcode(index_1, index_3, index_3, 0, 0x65, 'f32Le', "f64.le");
opcode(index_1, index_3, index_3, 0, 0x66, 'f32Ge', "f64.ge");
opcode(index_1, index_1, ___, 0, 0x67, 'i32Clz', "i32.clz");
opcode(index_1, index_1, ___, 0, 0x68, 'i32Ctz', "i32.ctz");
opcode(index_1, index_1, ___, 0, 0x69, 'i32Popcnt', "i32.popcnt");
opcode(index_1, index_1, index_1, 0, 0x6a, 'i32Add', "i32.add");
opcode(index_1, index_1, index_1, 0, 0x6b, 'i32Sub', "i32.sub");
opcode(index_1, index_1, index_1, 0, 0x6c, 'i32Mul', "i32.mul");
opcode(index_1, index_1, index_1, 0, 0x6d, 'i32DivS', "i32.div_s");
opcode(index_1, index_1, index_1, 0, 0x6e, 'i32DivU', "i32.div_u");
opcode(index_1, index_1, index_1, 0, 0x6f, 'i32RemS', "i32.rem_s");
opcode(index_1, index_1, index_1, 0, 0x70, 'i32RemU', "i32.rem_u");
opcode(index_1, index_1, index_1, 0, 0x71, 'i32And', "i32.and");
opcode(index_1, index_1, index_1, 0, 0x72, 'i32Or', "i32.or");
opcode(index_1, index_1, index_1, 0, 0x73, 'i32Xor', "i32.xor");
opcode(index_1, index_1, index_1, 0, 0x74, 'i32Shl', "i32.shl");
opcode(index_1, index_1, index_1, 0, 0x75, 'i32ShrS', "i32.shr_s");
opcode(index_1, index_1, index_1, 0, 0x76, 'i32ShrU', "i32.shr_u");
opcode(index_1, index_1, index_1, 0, 0x77, 'i32Rotl', "i32.rotl");
opcode(index_1, index_1, index_1, 0, 0x78, 'i32Rotr', "i32.rotr");
opcode(index_2, index_2, ___, 0, 0x79, 'i64Clz', "i64.clz");
opcode(index_2, index_2, ___, 0, 0x7a, 'i64Ctz', "i64.ctz");
opcode(index_2, index_2, ___, 0, 0x7b, 'i64Popcnt', "i64.popcnt");
opcode(index_2, index_2, index_2, 0, 0x7c, 'i64Add', "i64.add");
opcode(index_2, index_2, index_2, 0, 0x7d, 'i64Sub', "i64.sub");
opcode(index_2, index_2, index_2, 0, 0x7e, 'i64Mul', "i64.mul");
opcode(index_2, index_2, index_2, 0, 0x7f, 'i64DivS', "i64.div_s");
opcode(index_2, index_2, index_2, 0, 0x80, 'i64DivU', "i64.div_u");
opcode(index_2, index_2, index_2, 0, 0x81, 'i64RemS', "i64.rem_s");
opcode(index_2, index_2, index_2, 0, 0x82, 'i64RemU', "i64.rem_u");
opcode(index_2, index_2, index_2, 0, 0x83, 'i64And', "i64.and");
opcode(index_2, index_2, index_2, 0, 0x84, 'i64Or', "i64.or");
opcode(index_2, index_2, index_2, 0, 0x85, 'i64Xor', "i64.xor");
opcode(index_2, index_2, index_2, 0, 0x86, 'i64Shl', "i64.shl");
opcode(index_2, index_2, index_2, 0, 0x87, 'i64ShrS', "i64.shr_s");
opcode(index_2, index_2, index_2, 0, 0x88, 'i64ShrU', "i64.shr_u");
opcode(index_2, index_2, index_2, 0, 0x89, 'i64Rotl', "i64.rotl");
opcode(index_2, index_2, index_2, 0, 0x8a, 'i64Rotr', "i64.rotr");
opcode(index_3, index_3, index_3, 0, 0x8b, 'f32Abs', "f32.abs");
opcode(index_3, index_3, index_3, 0, 0x8c, 'f32Neg', "f32.neg");
opcode(index_3, index_3, index_3, 0, 0x8d, 'f32Ceil', "f32.ceil");
opcode(index_3, index_3, index_3, 0, 0x8e, 'f32Floor', "f32.floor");
opcode(index_3, index_3, index_3, 0, 0x8f, 'f32Trunc', "f32.trunc");
opcode(index_3, index_3, index_3, 0, 0x90, 'f32Nearest', "f32.nearest");
opcode(index_3, index_3, index_3, 0, 0x91, 'f32Sqrt', "f32.sqrt");
opcode(index_3, index_3, index_3, 0, 0x92, 'f32Add', "f32.add");
opcode(index_3, index_3, index_3, 0, 0x93, 'f32Sub', "f32.sub");
opcode(index_3, index_3, index_3, 0, 0x94, 'f32Mul', "f32.mul");
opcode(index_3, index_3, index_3, 0, 0x95, 'f32Div', "f32.div");
opcode(index_3, index_3, index_3, 0, 0x96, 'f32Min', "f32.min");
opcode(index_3, index_3, index_3, 0, 0x97, 'f32Max', "f32.max");
opcode(index_3, index_3, index_3, 0, 0x98, 'f32Copysign', "f32.copysign");
opcode(index_3, index_3, index_3, 0, 0x99, 'f32Abs', "f64.abs");
opcode(index_3, index_3, index_3, 0, 0x9a, 'f32Neg', "f64.neg");
opcode(index_3, index_3, index_3, 0, 0x9b, 'f32Ceil', "f64.ceil");
opcode(index_3, index_3, index_3, 0, 0x9c, 'f32Floor', "f64.floor");
opcode(index_3, index_3, index_3, 0, 0x9d, 'f32Trunc', "f64.trunc");
opcode(index_3, index_3, index_3, 0, 0x9e, 'f32Nearest', "f64.nearest");
opcode(index_3, index_3, index_3, 0, 0x9f, 'f32Sqrt', "f64.sqrt");
opcode(index_3, index_3, index_3, 0, 0xa0, 'f32Add', "f64.add");
opcode(index_3, index_3, index_3, 0, 0xa1, 'f32Sub', "f64.sub");
opcode(index_3, index_3, index_3, 0, 0xa2, 'f32Mul', "f64.mul");
opcode(index_3, index_3, index_3, 0, 0xa3, 'f32Div', "f64.div");
opcode(index_3, index_3, index_3, 0, 0xa4, 'f32Min', "f64.min");
opcode(index_3, index_3, index_3, 0, 0xa5, 'f32Max', "f64.max");
opcode(index_3, index_3, index_3, 0, 0xa6, 'f32Copysign', "f64.copysign");
opcode(index_1, index_2, ___, 0, 0xa7, 'i32Wrapi64', "i32.wrap/i64");
opcode(index_1, index_3, ___, 0, 0xa8, 'i32TruncSf32', "i32.trunc_s/f32");
opcode(index_1, index_3, ___, 0, 0xa9, 'i32TruncUf32', "i32.trunc_u/f32");
opcode(index_1, index_3, ___, 0, 0xaa, 'i32TruncSf32', "i32.trunc_s/f64");
opcode(index_1, index_3, ___, 0, 0xab, 'i32TruncUf32', "i32.trunc_u/f64");
opcode(index_2, index_1, ___, 0, 0xac, 'i64ExtendSi32', "i64.extend_s/i32");
opcode(index_2, index_1, ___, 0, 0xad, 'i64ExtendUi32', "i64.extend_u/i32");
opcode(index_2, index_3, ___, 0, 0xae, 'i64TruncSf32', "i64.trunc_s/f32");
opcode(index_2, index_3, ___, 0, 0xaf, 'i64TruncUf32', "i64.trunc_u/f32");
opcode(index_2, index_3, ___, 0, 0xb0, 'i64TruncSf32', "i64.trunc_s/f64");
opcode(index_2, index_3, ___, 0, 0xb1, 'i64TruncUf32', "i64.trunc_u/f64");
opcode(index_3, index_1, ___, 0, 0xb2, 'f32ConvertSi32', "f32.convert_s/i32");
opcode(index_3, index_1, ___, 0, 0xb3, 'f32ConvertUi32', "f32.convert_u/i32");
opcode(index_3, index_2, ___, 0, 0xb4, 'f32ConvertSi64', "f32.convert_s/i64");
opcode(index_3, index_2, ___, 0, 0xb5, 'f32ConvertUi64', "f32.convert_u/i64");
opcode(index_3, index_3, ___, 0, 0xb6, 'f32Demotef32', "f32.demote/f64");
opcode(index_3, index_1, ___, 0, 0xb7, 'f32ConvertSi32', "f64.convert_s/i32");
opcode(index_3, index_1, ___, 0, 0xb8, 'f32ConvertUi32', "f64.convert_u/i32");
opcode(index_3, index_2, ___, 0, 0xb9, 'f32ConvertSi64', "f64.convert_s/i64");
opcode(index_3, index_2, ___, 0, 0xba, 'f32ConvertUi64', "f64.convert_u/i64");
opcode(index_3, index_3, ___, 0, 0xbb, 'f32Promotef32', "f64.promote/f32");
opcode(index_1, index_3, ___, 0, 0xbc, 'i32Reinterpretf32', "i32.reinterpret/f32");
opcode(index_2, index_3, ___, 0, 0xbd, 'i64Reinterpretf32', "i64.reinterpret/f64");
opcode(index_3, index_1, ___, 0, 0xbe, 'f32Reinterpreti32', "f32.reinterpret/i32");
opcode(index_3, index_2, ___, 0, 0xbf, 'f32Reinterpreti64', "f64.reinterpret/i64");

/**
 * Return opcode mapping to the operator. Signed result is always prefered
 */
const opcodeFromOperator = ({ type, operator: { value } }) => {
  switch (value) {
    case '+':
      return def[type + 'Add'];
    case '-':
      return def[type + 'Sub'];
    case '*':
      return def[type + 'Mul'];
    case '/':
      return def[type + 'DivS'] || def[type + 'Div'];
    case '%':
      return def[type + 'RemS'] || def[type + 'RemU'];
    case '==':
      return def[type + 'Eq'];
    case '!=':
      return def[type + 'Ne'];
    case '>':
      return def[type + 'GtS'] || def[type + 'Gt'];
    case '<':
      return def[type + 'LtS'] || def[type + 'Lt'];
    case '<=':
      return def[type + 'LeS'] || def[type + 'Le'];
    case '>=':
      return def[type + 'GeS'] || def[type + 'Ge'];
    case '?':
      return def.If;
    case ':':
      return def.Else;
    default:
      throw new Error(`No mapping from operator to opcode ${value}`);
  }
};

var slice = Array.prototype.slice;
var toArray = function (a) {
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
    return args1.concat(toArray(args2));
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

var curry_1$1 = curry;

// clean this up
const getType = str => {
  switch (str) {
    case 'f32':
      return F32;
    case 'f64':
      return F64;
    case 'i32':
    case 'Function':
    default:
      return I32;
  }
};

const isLocal = node => 'localIndex' in node;
const scopeOperation = curry_1$1((op, node) => {
  const index = isLocal(node) ? node.localIndex : node.globalIndex;
  const kind = isLocal(node) ? op + 'Local' : op + 'Global';
  return { kind: def[kind], params: [index] };
});

const getConstOpcode = node => ({
  kind: def[node.type + 'Const'] || def.i32Const,
  params: [node.value]
});

const setInScope = scopeOperation('Set');
const getInScope = scopeOperation('Get');
const mergeBlock = (block, v) => {
  // some node types are a sequence of opcodes:
  // nested expressions for example
  if (Array.isArray(v)) block = [...block, ...v];else block.push(v);
  return block;
};

const generateExport = decl => {
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

const generateImport = node => {
  const module = node.module;
  return node.fields.map(({ id, nativeType, typeIndex, global, kind }) => {
    kind = kind || nativeType && EXTERN_GLOBAL || EXTERN_FUNCTION;
    return {
      module,
      field: id,
      global,
      kind,
      typeIndex
    };
  });
};

const generateValueType = node => {
  const value = {
    mutable: node.const ? 0 : 1,
    type: getType(node.type)
  };
  return value;
};

const generateInit = node => {
  const _global = generateValueType(node);

  const { Type, value } = node.init;
  if (Type === Syntax_1.Constant) {
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

const generateType = node => {
  const type = { params: [], result: null };
  if (node.result && node.result !== 'void') {
    type.result = getType(node.result);
  }

  type.params = node.params.map(p => getType(p.type));
  type.id = node.id;

  return type;
};

const generateReturn = node => {
  const parent = { postfix: [] };
  // Postfix in return statement should be a no-op UNLESS it's editing globals
  const block = generateExpression(node.expr, parent);
  block.push({ kind: def.Return });
  if (parent.postfix.length) {
    // do we have postfix operations?
    // are they editing globals?
    // TODO: do things to globals
  }

  return block;
};

const generateDeclaration = (node, parent) => {
  let block = [];
  if (node.init) {
    node.init.type = node.type;
    block = [...block, ...generateExpression(node.init)];
    block.push({ kind: def.SetLocal, params: [node.localIndex] });
  }
  parent.locals.push(generateValueType(node));
  return block;
};

/**
 * Transform a binary expression node into a list of opcodes
 */
const generateBinaryExpression = (node, parent) => {
  // Map operands first
  const block = node.operands.map(mapSyntax(parent)).reduce(mergeBlock, []);

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

const generateTernary = (node, parent) => {
  const mapper = mapSyntax(parent);
  const block = node.operands.slice(0, 1).map(mapper).reduce(mergeBlock, []);

  block.push({
    kind: opcodeFromOperator(node),
    valueType: generateValueType(node)
  });
  block.push.apply(block, node.operands.slice(1, 2).map(mapper).reduce(mergeBlock, []));
  block.push({
    kind: opcodeFromOperator({ operator: { value: ':' } })
  });
  block.push.apply(block, node.operands.slice(-1).map(mapper).reduce(mergeBlock, []));
  block.push({ kind: def.End });

  return block;
};

const generateAssignment = (node, parent) => {
  const subParent = { postfix: [] };
  const block = node.operands.slice(1).map(mapSyntax(subParent)).reduce(mergeBlock, []);

  block.push(setInScope(node.operands[0]));

  return subParent.postfix.reduce(mergeBlock, block);
};

const generateFunctionCall = (node, parent) => {
  const block = node.arguments.map(mapSyntax(parent)).reduce(mergeBlock, []);

  block.push({
    kind: def.Call,
    params: [node.functionIndex]
  });

  return block;
};

// probably should be called "generateBranch" and be more generic
// like handling ternary for example. A lot of shared logic here & ternary
const generateIf = (node, parent) => {
  const mapper = mapSyntax(parent);
  const block = [node.expr].map(mapper).reduce(mergeBlock, []);

  block.push({
    kind: def.If,
    // if-then-else blocks have no return value and the Wasm spec requires us to
    // provide a literal byte '0x40' for "empty block" in these cases
    params: [0x40]
  });

  // after the expression is on the stack and opcode is following it we can write the
  // implicit 'then' block
  block.push.apply(block, node.then.map(mapper).reduce(mergeBlock, []));

  // fllowed by the optional 'else'
  if (node.else.length) {
    block.push({ kind: def.Else });
    block.push.apply(block, node.else.map(mapper).reduce(mergeBlock, []));
  }

  block.push({ kind: def.End });
  return block;
};

const generateLoop = (node, parent) => {
  const block = [];
  const mapper = mapSyntax(parent);
  const reverse = {
    '>': '<',
    '<': '>',
    '>=': '<=',
    '<=': '>=',
    '==': '!=',
    '!=': '=='
  };

  const condition = node.params.slice(1, 2);
  condition[0].operator.value = reverse[condition[0].operator.value];
  const expression = node.params.slice(2, 3);

  block.push({ kind: def.Block, params: [0x40] });
  block.push({ kind: def.Loop, params: [0x40] });

  block.push.apply(block, condition.map(mapper).reduce(mergeBlock, []));
  block.push({ kind: def.BrIf, params: [1] });

  block.push.apply(block, node.body.map(mapper).reduce(mergeBlock, []));

  block.push.apply(block, expression.map(mapper).reduce(mergeBlock, []));
  block.push({ kind: def.Br, params: [0] });

  block.push({ kind: def.End });
  block.push({ kind: def.End });

  return block;
};

const syntaxMap = {
  [Syntax_1.FunctionCall]: generateFunctionCall,
  // Unary
  [Syntax_1.Constant]: getConstOpcode,
  [Syntax_1.BinaryExpression]: generateBinaryExpression,
  [Syntax_1.TernaryExpression]: generateTernary,
  [Syntax_1.IfThenElse]: generateIf,
  [Syntax_1.Identifier]: getInScope,
  [Syntax_1.ReturnStatement]: generateReturn,
  // Binary
  [Syntax_1.Declaration]: generateDeclaration,
  [Syntax_1.Assignment]: generateAssignment,
  [Syntax_1.Import]: generateImport,
  // Loops
  [Syntax_1.Loop]: generateLoop
};

const mapSyntax = curry_1$1((parent, operand) => {
  const mapping = syntaxMap[operand.Type];
  if (!mapping) {
    const value = operand.id || operand.value || operand.operator && operand.operator.value;
    throw new Error(`Unexpected Syntax Token ${operand.Type} : ${value}`);
  }
  return mapping(operand, parent);
});

const generateExpression = (node, parent) => {
  const block = [node].map(mapSyntax(parent)).reduce(mergeBlock, []);
  return block;
};

const generateElement = functionIndex => {
  return { functionIndex };
};

const generateCode = func => {
  const block = {
    code: [],
    locals: []
  };

  // NOTE: Declarations have a side-effect of changing the local count
  //       This is why mapSyntax takes a parent argument
  block.code = func.body.map(mapSyntax(block)).reduce(mergeBlock, []);

  return block;
};

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

  seek(relative) {
    this.pos = relative;
    return this.tokens[this.pos];
  }

  last() {
    return this.tokens[this.length - 1];
  }
}

var matchOperatorsRe = /[|\\{}()[\]^$+*?.]/g;

var index$7 = function (str) {
	if (typeof str !== 'string') {
		throw new TypeError('Expected a string');
	}

	return str.replace(matchOperatorsRe, '\\$&');
};

var index$13 = {
	"aliceblue": [240, 248, 255],
	"antiquewhite": [250, 235, 215],
	"aqua": [0, 255, 255],
	"aquamarine": [127, 255, 212],
	"azure": [240, 255, 255],
	"beige": [245, 245, 220],
	"bisque": [255, 228, 196],
	"black": [0, 0, 0],
	"blanchedalmond": [255, 235, 205],
	"blue": [0, 0, 255],
	"blueviolet": [138, 43, 226],
	"brown": [165, 42, 42],
	"burlywood": [222, 184, 135],
	"cadetblue": [95, 158, 160],
	"chartreuse": [127, 255, 0],
	"chocolate": [210, 105, 30],
	"coral": [255, 127, 80],
	"cornflowerblue": [100, 149, 237],
	"cornsilk": [255, 248, 220],
	"crimson": [220, 20, 60],
	"cyan": [0, 255, 255],
	"darkblue": [0, 0, 139],
	"darkcyan": [0, 139, 139],
	"darkgoldenrod": [184, 134, 11],
	"darkgray": [169, 169, 169],
	"darkgreen": [0, 100, 0],
	"darkgrey": [169, 169, 169],
	"darkkhaki": [189, 183, 107],
	"darkmagenta": [139, 0, 139],
	"darkolivegreen": [85, 107, 47],
	"darkorange": [255, 140, 0],
	"darkorchid": [153, 50, 204],
	"darkred": [139, 0, 0],
	"darksalmon": [233, 150, 122],
	"darkseagreen": [143, 188, 143],
	"darkslateblue": [72, 61, 139],
	"darkslategray": [47, 79, 79],
	"darkslategrey": [47, 79, 79],
	"darkturquoise": [0, 206, 209],
	"darkviolet": [148, 0, 211],
	"deeppink": [255, 20, 147],
	"deepskyblue": [0, 191, 255],
	"dimgray": [105, 105, 105],
	"dimgrey": [105, 105, 105],
	"dodgerblue": [30, 144, 255],
	"firebrick": [178, 34, 34],
	"floralwhite": [255, 250, 240],
	"forestgreen": [34, 139, 34],
	"fuchsia": [255, 0, 255],
	"gainsboro": [220, 220, 220],
	"ghostwhite": [248, 248, 255],
	"gold": [255, 215, 0],
	"goldenrod": [218, 165, 32],
	"gray": [128, 128, 128],
	"green": [0, 128, 0],
	"greenyellow": [173, 255, 47],
	"grey": [128, 128, 128],
	"honeydew": [240, 255, 240],
	"hotpink": [255, 105, 180],
	"indianred": [205, 92, 92],
	"indigo": [75, 0, 130],
	"ivory": [255, 255, 240],
	"khaki": [240, 230, 140],
	"lavender": [230, 230, 250],
	"lavenderblush": [255, 240, 245],
	"lawngreen": [124, 252, 0],
	"lemonchiffon": [255, 250, 205],
	"lightblue": [173, 216, 230],
	"lightcoral": [240, 128, 128],
	"lightcyan": [224, 255, 255],
	"lightgoldenrodyellow": [250, 250, 210],
	"lightgray": [211, 211, 211],
	"lightgreen": [144, 238, 144],
	"lightgrey": [211, 211, 211],
	"lightpink": [255, 182, 193],
	"lightsalmon": [255, 160, 122],
	"lightseagreen": [32, 178, 170],
	"lightskyblue": [135, 206, 250],
	"lightslategray": [119, 136, 153],
	"lightslategrey": [119, 136, 153],
	"lightsteelblue": [176, 196, 222],
	"lightyellow": [255, 255, 224],
	"lime": [0, 255, 0],
	"limegreen": [50, 205, 50],
	"linen": [250, 240, 230],
	"magenta": [255, 0, 255],
	"maroon": [128, 0, 0],
	"mediumaquamarine": [102, 205, 170],
	"mediumblue": [0, 0, 205],
	"mediumorchid": [186, 85, 211],
	"mediumpurple": [147, 112, 219],
	"mediumseagreen": [60, 179, 113],
	"mediumslateblue": [123, 104, 238],
	"mediumspringgreen": [0, 250, 154],
	"mediumturquoise": [72, 209, 204],
	"mediumvioletred": [199, 21, 133],
	"midnightblue": [25, 25, 112],
	"mintcream": [245, 255, 250],
	"mistyrose": [255, 228, 225],
	"moccasin": [255, 228, 181],
	"navajowhite": [255, 222, 173],
	"navy": [0, 0, 128],
	"oldlace": [253, 245, 230],
	"olive": [128, 128, 0],
	"olivedrab": [107, 142, 35],
	"orange": [255, 165, 0],
	"orangered": [255, 69, 0],
	"orchid": [218, 112, 214],
	"palegoldenrod": [238, 232, 170],
	"palegreen": [152, 251, 152],
	"paleturquoise": [175, 238, 238],
	"palevioletred": [219, 112, 147],
	"papayawhip": [255, 239, 213],
	"peachpuff": [255, 218, 185],
	"peru": [205, 133, 63],
	"pink": [255, 192, 203],
	"plum": [221, 160, 221],
	"powderblue": [176, 224, 230],
	"purple": [128, 0, 128],
	"rebeccapurple": [102, 51, 153],
	"red": [255, 0, 0],
	"rosybrown": [188, 143, 143],
	"royalblue": [65, 105, 225],
	"saddlebrown": [139, 69, 19],
	"salmon": [250, 128, 114],
	"sandybrown": [244, 164, 96],
	"seagreen": [46, 139, 87],
	"seashell": [255, 245, 238],
	"sienna": [160, 82, 45],
	"silver": [192, 192, 192],
	"skyblue": [135, 206, 235],
	"slateblue": [106, 90, 205],
	"slategray": [112, 128, 144],
	"slategrey": [112, 128, 144],
	"snow": [255, 250, 250],
	"springgreen": [0, 255, 127],
	"steelblue": [70, 130, 180],
	"tan": [210, 180, 140],
	"teal": [0, 128, 128],
	"thistle": [216, 191, 216],
	"tomato": [255, 99, 71],
	"turquoise": [64, 224, 208],
	"violet": [238, 130, 238],
	"wheat": [245, 222, 179],
	"white": [255, 255, 255],
	"whitesmoke": [245, 245, 245],
	"yellow": [255, 255, 0],
	"yellowgreen": [154, 205, 50]
};

var conversions = createCommonjsModule(function (module) {
/* MIT license */


// NOTE: conversions should only return primitive values (i.e. arrays, or
//       values that give correct `typeof` results).
//       do not use box values types (i.e. Number(), String(), etc.)

var reverseKeywords = {};
for (var key in index$13) {
	if (index$13.hasOwnProperty(key)) {
		reverseKeywords[index$13[key]] = key;
	}
}

var convert = module.exports = {
	rgb: { channels: 3, labels: 'rgb' },
	hsl: { channels: 3, labels: 'hsl' },
	hsv: { channels: 3, labels: 'hsv' },
	hwb: { channels: 3, labels: 'hwb' },
	cmyk: { channels: 4, labels: 'cmyk' },
	xyz: { channels: 3, labels: 'xyz' },
	lab: { channels: 3, labels: 'lab' },
	lch: { channels: 3, labels: 'lch' },
	hex: { channels: 1, labels: ['hex'] },
	keyword: { channels: 1, labels: ['keyword'] },
	ansi16: { channels: 1, labels: ['ansi16'] },
	ansi256: { channels: 1, labels: ['ansi256'] },
	hcg: { channels: 3, labels: ['h', 'c', 'g'] },
	apple: { channels: 3, labels: ['r16', 'g16', 'b16'] },
	gray: { channels: 1, labels: ['gray'] }
};

// hide .channels and .labels properties
for (var model in convert) {
	if (convert.hasOwnProperty(model)) {
		if (!('channels' in convert[model])) {
			throw new Error('missing channels property: ' + model);
		}

		if (!('labels' in convert[model])) {
			throw new Error('missing channel labels property: ' + model);
		}

		if (convert[model].labels.length !== convert[model].channels) {
			throw new Error('channel and label counts mismatch: ' + model);
		}

		var channels = convert[model].channels;
		var labels = convert[model].labels;
		delete convert[model].channels;
		delete convert[model].labels;
		Object.defineProperty(convert[model], 'channels', { value: channels });
		Object.defineProperty(convert[model], 'labels', { value: labels });
	}
}

convert.rgb.hsl = function (rgb) {
	var r = rgb[0] / 255;
	var g = rgb[1] / 255;
	var b = rgb[2] / 255;
	var min = Math.min(r, g, b);
	var max = Math.max(r, g, b);
	var delta = max - min;
	var h;
	var s;
	var l;

	if (max === min) {
		h = 0;
	} else if (r === max) {
		h = (g - b) / delta;
	} else if (g === max) {
		h = 2 + (b - r) / delta;
	} else if (b === max) {
		h = 4 + (r - g) / delta;
	}

	h = Math.min(h * 60, 360);

	if (h < 0) {
		h += 360;
	}

	l = (min + max) / 2;

	if (max === min) {
		s = 0;
	} else if (l <= 0.5) {
		s = delta / (max + min);
	} else {
		s = delta / (2 - max - min);
	}

	return [h, s * 100, l * 100];
};

convert.rgb.hsv = function (rgb) {
	var r = rgb[0];
	var g = rgb[1];
	var b = rgb[2];
	var min = Math.min(r, g, b);
	var max = Math.max(r, g, b);
	var delta = max - min;
	var h;
	var s;
	var v;

	if (max === 0) {
		s = 0;
	} else {
		s = delta / max * 1000 / 10;
	}

	if (max === min) {
		h = 0;
	} else if (r === max) {
		h = (g - b) / delta;
	} else if (g === max) {
		h = 2 + (b - r) / delta;
	} else if (b === max) {
		h = 4 + (r - g) / delta;
	}

	h = Math.min(h * 60, 360);

	if (h < 0) {
		h += 360;
	}

	v = max / 255 * 1000 / 10;

	return [h, s, v];
};

convert.rgb.hwb = function (rgb) {
	var r = rgb[0];
	var g = rgb[1];
	var b = rgb[2];
	var h = convert.rgb.hsl(rgb)[0];
	var w = 1 / 255 * Math.min(r, Math.min(g, b));

	b = 1 - 1 / 255 * Math.max(r, Math.max(g, b));

	return [h, w * 100, b * 100];
};

convert.rgb.cmyk = function (rgb) {
	var r = rgb[0] / 255;
	var g = rgb[1] / 255;
	var b = rgb[2] / 255;
	var c;
	var m;
	var y;
	var k;

	k = Math.min(1 - r, 1 - g, 1 - b);
	c = (1 - r - k) / (1 - k) || 0;
	m = (1 - g - k) / (1 - k) || 0;
	y = (1 - b - k) / (1 - k) || 0;

	return [c * 100, m * 100, y * 100, k * 100];
};

/**
 * See https://en.m.wikipedia.org/wiki/Euclidean_distance#Squared_Euclidean_distance
 * */
function comparativeDistance(x, y) {
	return Math.pow(x[0] - y[0], 2) + Math.pow(x[1] - y[1], 2) + Math.pow(x[2] - y[2], 2);
}

convert.rgb.keyword = function (rgb) {
	var reversed = reverseKeywords[rgb];
	if (reversed) {
		return reversed;
	}

	var currentClosestDistance = Infinity;
	var currentClosestKeyword;

	for (var keyword in index$13) {
		if (index$13.hasOwnProperty(keyword)) {
			var value = index$13[keyword];

			// Compute comparative distance
			var distance = comparativeDistance(rgb, value);

			// Check if its less, if so set as closest
			if (distance < currentClosestDistance) {
				currentClosestDistance = distance;
				currentClosestKeyword = keyword;
			}
		}
	}

	return currentClosestKeyword;
};

convert.keyword.rgb = function (keyword) {
	return index$13[keyword];
};

convert.rgb.xyz = function (rgb) {
	var r = rgb[0] / 255;
	var g = rgb[1] / 255;
	var b = rgb[2] / 255;

	// assume sRGB
	r = r > 0.04045 ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
	g = g > 0.04045 ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
	b = b > 0.04045 ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;

	var x = r * 0.4124 + g * 0.3576 + b * 0.1805;
	var y = r * 0.2126 + g * 0.7152 + b * 0.0722;
	var z = r * 0.0193 + g * 0.1192 + b * 0.9505;

	return [x * 100, y * 100, z * 100];
};

convert.rgb.lab = function (rgb) {
	var xyz = convert.rgb.xyz(rgb);
	var x = xyz[0];
	var y = xyz[1];
	var z = xyz[2];
	var l;
	var a;
	var b;

	x /= 95.047;
	y /= 100;
	z /= 108.883;

	x = x > 0.008856 ? Math.pow(x, 1 / 3) : 7.787 * x + 16 / 116;
	y = y > 0.008856 ? Math.pow(y, 1 / 3) : 7.787 * y + 16 / 116;
	z = z > 0.008856 ? Math.pow(z, 1 / 3) : 7.787 * z + 16 / 116;

	l = 116 * y - 16;
	a = 500 * (x - y);
	b = 200 * (y - z);

	return [l, a, b];
};

convert.hsl.rgb = function (hsl) {
	var h = hsl[0] / 360;
	var s = hsl[1] / 100;
	var l = hsl[2] / 100;
	var t1;
	var t2;
	var t3;
	var rgb;
	var val;

	if (s === 0) {
		val = l * 255;
		return [val, val, val];
	}

	if (l < 0.5) {
		t2 = l * (1 + s);
	} else {
		t2 = l + s - l * s;
	}

	t1 = 2 * l - t2;

	rgb = [0, 0, 0];
	for (var i = 0; i < 3; i++) {
		t3 = h + 1 / 3 * -(i - 1);
		if (t3 < 0) {
			t3++;
		}
		if (t3 > 1) {
			t3--;
		}

		if (6 * t3 < 1) {
			val = t1 + (t2 - t1) * 6 * t3;
		} else if (2 * t3 < 1) {
			val = t2;
		} else if (3 * t3 < 2) {
			val = t1 + (t2 - t1) * (2 / 3 - t3) * 6;
		} else {
			val = t1;
		}

		rgb[i] = val * 255;
	}

	return rgb;
};

convert.hsl.hsv = function (hsl) {
	var h = hsl[0];
	var s = hsl[1] / 100;
	var l = hsl[2] / 100;
	var smin = s;
	var lmin = Math.max(l, 0.01);
	var sv;
	var v;

	l *= 2;
	s *= l <= 1 ? l : 2 - l;
	smin *= lmin <= 1 ? lmin : 2 - lmin;
	v = (l + s) / 2;
	sv = l === 0 ? 2 * smin / (lmin + smin) : 2 * s / (l + s);

	return [h, sv * 100, v * 100];
};

convert.hsv.rgb = function (hsv) {
	var h = hsv[0] / 60;
	var s = hsv[1] / 100;
	var v = hsv[2] / 100;
	var hi = Math.floor(h) % 6;

	var f = h - Math.floor(h);
	var p = 255 * v * (1 - s);
	var q = 255 * v * (1 - s * f);
	var t = 255 * v * (1 - s * (1 - f));
	v *= 255;

	switch (hi) {
		case 0:
			return [v, t, p];
		case 1:
			return [q, v, p];
		case 2:
			return [p, v, t];
		case 3:
			return [p, q, v];
		case 4:
			return [t, p, v];
		case 5:
			return [v, p, q];
	}
};

convert.hsv.hsl = function (hsv) {
	var h = hsv[0];
	var s = hsv[1] / 100;
	var v = hsv[2] / 100;
	var vmin = Math.max(v, 0.01);
	var lmin;
	var sl;
	var l;

	l = (2 - s) * v;
	lmin = (2 - s) * vmin;
	sl = s * vmin;
	sl /= lmin <= 1 ? lmin : 2 - lmin;
	sl = sl || 0;
	l /= 2;

	return [h, sl * 100, l * 100];
};

// http://dev.w3.org/csswg/css-color/#hwb-to-rgb
convert.hwb.rgb = function (hwb) {
	var h = hwb[0] / 360;
	var wh = hwb[1] / 100;
	var bl = hwb[2] / 100;
	var ratio = wh + bl;
	var i;
	var v;
	var f;
	var n;

	// wh + bl cant be > 1
	if (ratio > 1) {
		wh /= ratio;
		bl /= ratio;
	}

	i = Math.floor(6 * h);
	v = 1 - bl;
	f = 6 * h - i;

	if ((i & 0x01) !== 0) {
		f = 1 - f;
	}

	n = wh + f * (v - wh); // linear interpolation

	var r;
	var g;
	var b;
	switch (i) {
		default:
		case 6:
		case 0:
			r = v;g = n;b = wh;break;
		case 1:
			r = n;g = v;b = wh;break;
		case 2:
			r = wh;g = v;b = n;break;
		case 3:
			r = wh;g = n;b = v;break;
		case 4:
			r = n;g = wh;b = v;break;
		case 5:
			r = v;g = wh;b = n;break;
	}

	return [r * 255, g * 255, b * 255];
};

convert.cmyk.rgb = function (cmyk) {
	var c = cmyk[0] / 100;
	var m = cmyk[1] / 100;
	var y = cmyk[2] / 100;
	var k = cmyk[3] / 100;
	var r;
	var g;
	var b;

	r = 1 - Math.min(1, c * (1 - k) + k);
	g = 1 - Math.min(1, m * (1 - k) + k);
	b = 1 - Math.min(1, y * (1 - k) + k);

	return [r * 255, g * 255, b * 255];
};

convert.xyz.rgb = function (xyz) {
	var x = xyz[0] / 100;
	var y = xyz[1] / 100;
	var z = xyz[2] / 100;
	var r;
	var g;
	var b;

	r = x * 3.2406 + y * -1.5372 + z * -0.4986;
	g = x * -0.9689 + y * 1.8758 + z * 0.0415;
	b = x * 0.0557 + y * -0.2040 + z * 1.0570;

	// assume sRGB
	r = r > 0.0031308 ? 1.055 * Math.pow(r, 1.0 / 2.4) - 0.055 : r * 12.92;

	g = g > 0.0031308 ? 1.055 * Math.pow(g, 1.0 / 2.4) - 0.055 : g * 12.92;

	b = b > 0.0031308 ? 1.055 * Math.pow(b, 1.0 / 2.4) - 0.055 : b * 12.92;

	r = Math.min(Math.max(0, r), 1);
	g = Math.min(Math.max(0, g), 1);
	b = Math.min(Math.max(0, b), 1);

	return [r * 255, g * 255, b * 255];
};

convert.xyz.lab = function (xyz) {
	var x = xyz[0];
	var y = xyz[1];
	var z = xyz[2];
	var l;
	var a;
	var b;

	x /= 95.047;
	y /= 100;
	z /= 108.883;

	x = x > 0.008856 ? Math.pow(x, 1 / 3) : 7.787 * x + 16 / 116;
	y = y > 0.008856 ? Math.pow(y, 1 / 3) : 7.787 * y + 16 / 116;
	z = z > 0.008856 ? Math.pow(z, 1 / 3) : 7.787 * z + 16 / 116;

	l = 116 * y - 16;
	a = 500 * (x - y);
	b = 200 * (y - z);

	return [l, a, b];
};

convert.lab.xyz = function (lab) {
	var l = lab[0];
	var a = lab[1];
	var b = lab[2];
	var x;
	var y;
	var z;

	y = (l + 16) / 116;
	x = a / 500 + y;
	z = y - b / 200;

	var y2 = Math.pow(y, 3);
	var x2 = Math.pow(x, 3);
	var z2 = Math.pow(z, 3);
	y = y2 > 0.008856 ? y2 : (y - 16 / 116) / 7.787;
	x = x2 > 0.008856 ? x2 : (x - 16 / 116) / 7.787;
	z = z2 > 0.008856 ? z2 : (z - 16 / 116) / 7.787;

	x *= 95.047;
	y *= 100;
	z *= 108.883;

	return [x, y, z];
};

convert.lab.lch = function (lab) {
	var l = lab[0];
	var a = lab[1];
	var b = lab[2];
	var hr;
	var h;
	var c;

	hr = Math.atan2(b, a);
	h = hr * 360 / 2 / Math.PI;

	if (h < 0) {
		h += 360;
	}

	c = Math.sqrt(a * a + b * b);

	return [l, c, h];
};

convert.lch.lab = function (lch) {
	var l = lch[0];
	var c = lch[1];
	var h = lch[2];
	var a;
	var b;
	var hr;

	hr = h / 360 * 2 * Math.PI;
	a = c * Math.cos(hr);
	b = c * Math.sin(hr);

	return [l, a, b];
};

convert.rgb.ansi16 = function (args) {
	var r = args[0];
	var g = args[1];
	var b = args[2];
	var value = 1 in arguments ? arguments[1] : convert.rgb.hsv(args)[2]; // hsv -> ansi16 optimization

	value = Math.round(value / 50);

	if (value === 0) {
		return 30;
	}

	var ansi = 30 + (Math.round(b / 255) << 2 | Math.round(g / 255) << 1 | Math.round(r / 255));

	if (value === 2) {
		ansi += 60;
	}

	return ansi;
};

convert.hsv.ansi16 = function (args) {
	// optimization here; we already know the value and don't need to get
	// it converted for us.
	return convert.rgb.ansi16(convert.hsv.rgb(args), args[2]);
};

convert.rgb.ansi256 = function (args) {
	var r = args[0];
	var g = args[1];
	var b = args[2];

	// we use the extended greyscale palette here, with the exception of
	// black and white. normal palette only has 4 greyscale shades.
	if (r === g && g === b) {
		if (r < 8) {
			return 16;
		}

		if (r > 248) {
			return 231;
		}

		return Math.round((r - 8) / 247 * 24) + 232;
	}

	var ansi = 16 + 36 * Math.round(r / 255 * 5) + 6 * Math.round(g / 255 * 5) + Math.round(b / 255 * 5);

	return ansi;
};

convert.ansi16.rgb = function (args) {
	var color = args % 10;

	// handle greyscale
	if (color === 0 || color === 7) {
		if (args > 50) {
			color += 3.5;
		}

		color = color / 10.5 * 255;

		return [color, color, color];
	}

	var mult = (~~(args > 50) + 1) * 0.5;
	var r = (color & 1) * mult * 255;
	var g = (color >> 1 & 1) * mult * 255;
	var b = (color >> 2 & 1) * mult * 255;

	return [r, g, b];
};

convert.ansi256.rgb = function (args) {
	// handle greyscale
	if (args >= 232) {
		var c = (args - 232) * 10 + 8;
		return [c, c, c];
	}

	args -= 16;

	var rem;
	var r = Math.floor(args / 36) / 5 * 255;
	var g = Math.floor((rem = args % 36) / 6) / 5 * 255;
	var b = rem % 6 / 5 * 255;

	return [r, g, b];
};

convert.rgb.hex = function (args) {
	var integer = ((Math.round(args[0]) & 0xFF) << 16) + ((Math.round(args[1]) & 0xFF) << 8) + (Math.round(args[2]) & 0xFF);

	var string = integer.toString(16).toUpperCase();
	return '000000'.substring(string.length) + string;
};

convert.hex.rgb = function (args) {
	var match = args.toString(16).match(/[a-f0-9]{6}|[a-f0-9]{3}/i);
	if (!match) {
		return [0, 0, 0];
	}

	var colorString = match[0];

	if (match[0].length === 3) {
		colorString = colorString.split('').map(function (char) {
			return char + char;
		}).join('');
	}

	var integer = parseInt(colorString, 16);
	var r = integer >> 16 & 0xFF;
	var g = integer >> 8 & 0xFF;
	var b = integer & 0xFF;

	return [r, g, b];
};

convert.rgb.hcg = function (rgb) {
	var r = rgb[0] / 255;
	var g = rgb[1] / 255;
	var b = rgb[2] / 255;
	var max = Math.max(Math.max(r, g), b);
	var min = Math.min(Math.min(r, g), b);
	var chroma = max - min;
	var grayscale;
	var hue;

	if (chroma < 1) {
		grayscale = min / (1 - chroma);
	} else {
		grayscale = 0;
	}

	if (chroma <= 0) {
		hue = 0;
	} else if (max === r) {
		hue = (g - b) / chroma % 6;
	} else if (max === g) {
		hue = 2 + (b - r) / chroma;
	} else {
		hue = 4 + (r - g) / chroma + 4;
	}

	hue /= 6;
	hue %= 1;

	return [hue * 360, chroma * 100, grayscale * 100];
};

convert.hsl.hcg = function (hsl) {
	var s = hsl[1] / 100;
	var l = hsl[2] / 100;
	var c = 1;
	var f = 0;

	if (l < 0.5) {
		c = 2.0 * s * l;
	} else {
		c = 2.0 * s * (1.0 - l);
	}

	if (c < 1.0) {
		f = (l - 0.5 * c) / (1.0 - c);
	}

	return [hsl[0], c * 100, f * 100];
};

convert.hsv.hcg = function (hsv) {
	var s = hsv[1] / 100;
	var v = hsv[2] / 100;

	var c = s * v;
	var f = 0;

	if (c < 1.0) {
		f = (v - c) / (1 - c);
	}

	return [hsv[0], c * 100, f * 100];
};

convert.hcg.rgb = function (hcg) {
	var h = hcg[0] / 360;
	var c = hcg[1] / 100;
	var g = hcg[2] / 100;

	if (c === 0.0) {
		return [g * 255, g * 255, g * 255];
	}

	var pure = [0, 0, 0];
	var hi = h % 1 * 6;
	var v = hi % 1;
	var w = 1 - v;
	var mg = 0;

	switch (Math.floor(hi)) {
		case 0:
			pure[0] = 1;pure[1] = v;pure[2] = 0;break;
		case 1:
			pure[0] = w;pure[1] = 1;pure[2] = 0;break;
		case 2:
			pure[0] = 0;pure[1] = 1;pure[2] = v;break;
		case 3:
			pure[0] = 0;pure[1] = w;pure[2] = 1;break;
		case 4:
			pure[0] = v;pure[1] = 0;pure[2] = 1;break;
		default:
			pure[0] = 1;pure[1] = 0;pure[2] = w;
	}

	mg = (1.0 - c) * g;

	return [(c * pure[0] + mg) * 255, (c * pure[1] + mg) * 255, (c * pure[2] + mg) * 255];
};

convert.hcg.hsv = function (hcg) {
	var c = hcg[1] / 100;
	var g = hcg[2] / 100;

	var v = c + g * (1.0 - c);
	var f = 0;

	if (v > 0.0) {
		f = c / v;
	}

	return [hcg[0], f * 100, v * 100];
};

convert.hcg.hsl = function (hcg) {
	var c = hcg[1] / 100;
	var g = hcg[2] / 100;

	var l = g * (1.0 - c) + 0.5 * c;
	var s = 0;

	if (l > 0.0 && l < 0.5) {
		s = c / (2 * l);
	} else if (l >= 0.5 && l < 1.0) {
		s = c / (2 * (1 - l));
	}

	return [hcg[0], s * 100, l * 100];
};

convert.hcg.hwb = function (hcg) {
	var c = hcg[1] / 100;
	var g = hcg[2] / 100;
	var v = c + g * (1.0 - c);
	return [hcg[0], (v - c) * 100, (1 - v) * 100];
};

convert.hwb.hcg = function (hwb) {
	var w = hwb[1] / 100;
	var b = hwb[2] / 100;
	var v = 1 - b;
	var c = v - w;
	var g = 0;

	if (c < 1) {
		g = (v - c) / (1 - c);
	}

	return [hwb[0], c * 100, g * 100];
};

convert.apple.rgb = function (apple) {
	return [apple[0] / 65535 * 255, apple[1] / 65535 * 255, apple[2] / 65535 * 255];
};

convert.rgb.apple = function (rgb) {
	return [rgb[0] / 255 * 65535, rgb[1] / 255 * 65535, rgb[2] / 255 * 65535];
};

convert.gray.rgb = function (args) {
	return [args[0] / 100 * 255, args[0] / 100 * 255, args[0] / 100 * 255];
};

convert.gray.hsl = convert.gray.hsv = function (args) {
	return [0, 0, args[0]];
};

convert.gray.hwb = function (gray) {
	return [0, 100, gray[0]];
};

convert.gray.cmyk = function (gray) {
	return [0, 0, 0, gray[0]];
};

convert.gray.lab = function (gray) {
	return [gray[0], 0, 0];
};

convert.gray.hex = function (gray) {
	var val = Math.round(gray[0] / 100 * 255) & 0xFF;
	var integer = (val << 16) + (val << 8) + val;

	var string = integer.toString(16).toUpperCase();
	return '000000'.substring(string.length) + string;
};

convert.rgb.gray = function (rgb) {
	var val = (rgb[0] + rgb[1] + rgb[2]) / 3;
	return [val / 255 * 100];
};
});

/*
	this function routes a model to all other models.

	all functions that are routed have a property `.conversion` attached
	to the returned synthetic function. This property is an array
	of strings, each with the steps in between the 'from' and 'to'
	color models (inclusive).

	conversions that are not possible simply are not included.
*/

// https://jsperf.com/object-keys-vs-for-in-with-closure/3
var models$1 = Object.keys(conversions);

function buildGraph() {
	var graph = {};

	for (var len = models$1.length, i = 0; i < len; i++) {
		graph[models$1[i]] = {
			// http://jsperf.com/1-vs-infinity
			// micro-opt, but this is simple.
			distance: -1,
			parent: null
		};
	}

	return graph;
}

// https://en.wikipedia.org/wiki/Breadth-first_search
function deriveBFS(fromModel) {
	var graph = buildGraph();
	var queue = [fromModel]; // unshift -> queue -> pop

	graph[fromModel].distance = 0;

	while (queue.length) {
		var current = queue.pop();
		var adjacents = Object.keys(conversions[current]);

		for (var len = adjacents.length, i = 0; i < len; i++) {
			var adjacent = adjacents[i];
			var node = graph[adjacent];

			if (node.distance === -1) {
				node.distance = graph[current].distance + 1;
				node.parent = current;
				queue.unshift(adjacent);
			}
		}
	}

	return graph;
}

function link(from, to) {
	return function (args) {
		return to(from(args));
	};
}

function wrapConversion(toModel, graph) {
	var path = [graph[toModel].parent, toModel];
	var fn = conversions[graph[toModel].parent][toModel];

	var cur = graph[toModel].parent;
	while (graph[cur].parent) {
		path.unshift(graph[cur].parent);
		fn = link(conversions[graph[cur].parent][cur], fn);
		cur = graph[cur].parent;
	}

	fn.conversion = path;
	return fn;
}

var route = function (fromModel) {
	var graph = deriveBFS(fromModel);
	var conversion = {};

	var models = Object.keys(graph);
	for (var len = models.length, i = 0; i < len; i++) {
		var toModel = models[i];
		var node = graph[toModel];

		if (node.parent === null) {
			// no possible conversion, or this node is the source model.
			continue;
		}

		conversion[toModel] = wrapConversion(toModel, graph);
	}

	return conversion;
};

var convert = {};

var models = Object.keys(conversions);

function wrapRaw(fn) {
	var wrappedFn = function (args) {
		if (args === undefined || args === null) {
			return args;
		}

		if (arguments.length > 1) {
			args = Array.prototype.slice.call(arguments);
		}

		return fn(args);
	};

	// preserve .conversion property if there is one
	if ('conversion' in fn) {
		wrappedFn.conversion = fn.conversion;
	}

	return wrappedFn;
}

function wrapRounded(fn) {
	var wrappedFn = function (args) {
		if (args === undefined || args === null) {
			return args;
		}

		if (arguments.length > 1) {
			args = Array.prototype.slice.call(arguments);
		}

		var result = fn(args);

		// we're assuming the result is an array here.
		// see notice in conversions.js; don't use box types
		// in conversion functions.
		if (typeof result === 'object') {
			for (var len = result.length, i = 0; i < len; i++) {
				result[i] = Math.round(result[i]);
			}
		}

		return result;
	};

	// preserve .conversion property if there is one
	if ('conversion' in fn) {
		wrappedFn.conversion = fn.conversion;
	}

	return wrappedFn;
}

models.forEach(function (fromModel) {
	convert[fromModel] = {};

	Object.defineProperty(convert[fromModel], 'channels', { value: conversions[fromModel].channels });
	Object.defineProperty(convert[fromModel], 'labels', { value: conversions[fromModel].labels });

	var routes = route(fromModel);
	var routeModels = Object.keys(routes);

	routeModels.forEach(function (toModel) {
		var fn = routes[toModel];

		convert[fromModel][toModel] = wrapRounded(fn);
		convert[fromModel][toModel].raw = wrapRaw(fn);
	});
});

var index$11 = convert;

var index$9 = createCommonjsModule(function (module) {
'use strict';



const wrapAnsi16 = (fn, offset) => function () {
	const code = fn.apply(index$11, arguments);
	return `\u001B[${code + offset}m`;
};

const wrapAnsi256 = (fn, offset) => function () {
	const code = fn.apply(index$11, arguments);
	return `\u001B[${38 + offset};5;${code}m`;
};

const wrapAnsi16m = (fn, offset) => function () {
	const rgb = fn.apply(index$11, arguments);
	return `\u001B[${38 + offset};2;${rgb[0]};${rgb[1]};${rgb[2]}m`;
};

function assembleStyles() {
	const codes = new Map();
	const styles = {
		modifier: {
			reset: [0, 0],
			// 21 isn't widely supported and 22 does the same thing
			bold: [1, 22],
			dim: [2, 22],
			italic: [3, 23],
			underline: [4, 24],
			inverse: [7, 27],
			hidden: [8, 28],
			strikethrough: [9, 29]
		},
		color: {
			black: [30, 39],
			red: [31, 39],
			green: [32, 39],
			yellow: [33, 39],
			blue: [34, 39],
			magenta: [35, 39],
			cyan: [36, 39],
			white: [37, 39],
			gray: [90, 39],

			// Bright color
			redBright: [91, 39],
			greenBright: [92, 39],
			yellowBright: [93, 39],
			blueBright: [94, 39],
			magentaBright: [95, 39],
			cyanBright: [96, 39],
			whiteBright: [97, 39]
		},
		bgColor: {
			bgBlack: [40, 49],
			bgRed: [41, 49],
			bgGreen: [42, 49],
			bgYellow: [43, 49],
			bgBlue: [44, 49],
			bgMagenta: [45, 49],
			bgCyan: [46, 49],
			bgWhite: [47, 49],

			// Bright color
			bgBlackBright: [100, 49],
			bgRedBright: [101, 49],
			bgGreenBright: [102, 49],
			bgYellowBright: [103, 49],
			bgBlueBright: [104, 49],
			bgMagentaBright: [105, 49],
			bgCyanBright: [106, 49],
			bgWhiteBright: [107, 49]
		}
	};

	// Fix humans
	styles.color.grey = styles.color.gray;

	for (const groupName of Object.keys(styles)) {
		const group = styles[groupName];

		for (const styleName of Object.keys(group)) {
			const style = group[styleName];

			styles[styleName] = {
				open: `\u001B[${style[0]}m`,
				close: `\u001B[${style[1]}m`
			};

			group[styleName] = styles[styleName];

			codes.set(style[0], style[1]);
		}

		Object.defineProperty(styles, groupName, {
			value: group,
			enumerable: false
		});

		Object.defineProperty(styles, 'codes', {
			value: codes,
			enumerable: false
		});
	}

	const rgb2rgb = (r, g, b) => [r, g, b];

	styles.color.close = '\u001B[39m';
	styles.bgColor.close = '\u001B[49m';

	styles.color.ansi = {};
	styles.color.ansi256 = {};
	styles.color.ansi16m = {
		rgb: wrapAnsi16m(rgb2rgb, 0)
	};

	styles.bgColor.ansi = {};
	styles.bgColor.ansi256 = {};
	styles.bgColor.ansi16m = {
		rgb: wrapAnsi16m(rgb2rgb, 10)
	};

	for (const key of Object.keys(index$11)) {
		if (typeof index$11[key] !== 'object') {
			continue;
		}

		const suite = index$11[key];

		if ('ansi16' in suite) {
			styles.color.ansi[key] = wrapAnsi16(suite.ansi16, 0);
			styles.bgColor.ansi[key] = wrapAnsi16(suite.ansi16, 10);
		}

		if ('ansi256' in suite) {
			styles.color.ansi256[key] = wrapAnsi256(suite.ansi256, 0);
			styles.bgColor.ansi256[key] = wrapAnsi256(suite.ansi256, 10);
		}

		if ('rgb' in suite) {
			styles.color.ansi16m[key] = wrapAnsi16m(suite.rgb, 0);
			styles.bgColor.ansi16m[key] = wrapAnsi16m(suite.rgb, 10);
		}
	}

	return styles;
}

// Make the export immutable
Object.defineProperty(module, 'exports', {
	enumerable: true,
	get: assembleStyles
});
});

/*
The MIT License (MIT)

Copyright (c) 2016 CoderPuppy

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

*/
var _endianness;
function endianness() {
  if (typeof _endianness === 'undefined') {
    var a = new ArrayBuffer(2);
    var b = new Uint8Array(a);
    var c = new Uint16Array(a);
    b[0] = 1;
    b[1] = 2;
    if (c[0] === 258) {
      _endianness = 'BE';
    } else if (c[0] === 513) {
      _endianness = 'LE';
    } else {
      throw new Error('unable to figure out endianess');
    }
  }
  return _endianness;
}

function hostname() {
  if (typeof global.location !== 'undefined') {
    return global.location.hostname;
  } else return '';
}

function loadavg() {
  return [];
}

function uptime() {
  return 0;
}

function freemem() {
  return Number.MAX_VALUE;
}

function totalmem() {
  return Number.MAX_VALUE;
}

function cpus() {
  return [];
}

function type$1() {
  return 'Browser';
}

function release() {
  if (typeof global.navigator !== 'undefined') {
    return global.navigator.appVersion;
  }
  return '';
}

function networkInterfaces() {}
function getNetworkInterfaces() {}

function arch() {
  return 'javascript';
}

function platform() {
  return 'browser';
}

function tmpDir() {
  return '/tmp';
}
var tmpdir = tmpDir;

var EOL = '\n';
var os = {
  EOL: EOL,
  tmpdir: tmpdir,
  tmpDir: tmpDir,
  networkInterfaces: networkInterfaces,
  getNetworkInterfaces: getNetworkInterfaces,
  release: release,
  type: type$1,
  cpus: cpus,
  totalmem: totalmem,
  freemem: freemem,
  uptime: uptime,
  loadavg: loadavg,
  hostname: hostname,
  endianness: endianness
};

var os$1 = Object.freeze({
	endianness: endianness,
	hostname: hostname,
	loadavg: loadavg,
	uptime: uptime,
	freemem: freemem,
	totalmem: totalmem,
	cpus: cpus,
	type: type$1,
	release: release,
	networkInterfaces: networkInterfaces,
	getNetworkInterfaces: getNetworkInterfaces,
	arch: arch,
	platform: platform,
	tmpDir: tmpDir,
	tmpdir: tmpdir,
	EOL: EOL,
	default: os
});

var index$17 = function (flag, argv) {
	argv = argv || process.argv;

	var terminatorPos = argv.indexOf('--');
	var prefix = /^-{1,2}/.test(flag) ? '' : '--';
	var pos = argv.indexOf(prefix + flag);

	return pos !== -1 && (terminatorPos === -1 ? true : pos < terminatorPos);
};

var os$2 = ( os$1 && os ) || os$1;

var index$15 = createCommonjsModule(function (module) {
'use strict';




const env = process.env;

const support = level => {
	if (level === 0) {
		return false;
	}

	return {
		level,
		hasBasic: true,
		has256: level >= 2,
		has16m: level >= 3
	};
};

let supportLevel = (() => {
	if (index$17('no-color') || index$17('no-colors') || index$17('color=false')) {
		return 0;
	}

	if (index$17('color=16m') || index$17('color=full') || index$17('color=truecolor')) {
		return 3;
	}

	if (index$17('color=256')) {
		return 2;
	}

	if (index$17('color') || index$17('colors') || index$17('color=true') || index$17('color=always')) {
		return 1;
	}

	if (process.stdout && !process.stdout.isTTY) {
		return 0;
	}

	if (process.platform === 'win32') {
		// Node.js 7.5.0 is the first version of Node.js to include a patch to
		// libuv that enables 256 color output on Windows. Anything earlier and it
		// won't work. However, here we target Node.js 8 at minimum as it is an LTS
		// release, and Node.js 7 is not. Windows 10 build 10586 is the first Windows
		// release that supports 256 colors.
		const osRelease = os$2.release().split('.');
		if (Number(process.versions.node.split('.')[0]) >= 8 && Number(osRelease[0]) >= 10 && Number(osRelease[2]) >= 10586) {
			return 2;
		}

		return 1;
	}

	if ('CI' in env) {
		if (['TRAVIS', 'CIRCLECI', 'APPVEYOR', 'GITLAB_CI'].some(sign => sign in env) || env.CI_NAME === 'codeship') {
			return 1;
		}

		return 0;
	}

	if ('TEAMCITY_VERSION' in env) {
		return (/^(9\.(0*[1-9]\d*)\.|\d{2,}\.)/.test(env.TEAMCITY_VERSION) ? 1 : 0
		);
	}

	if ('TERM_PROGRAM' in env) {
		const version = parseInt((env.TERM_PROGRAM_VERSION || '').split('.')[0], 10);

		switch (env.TERM_PROGRAM) {
			case 'iTerm.app':
				return version >= 3 ? 3 : 2;
			case 'Hyper':
				return 3;
			case 'Apple_Terminal':
				return 2;
			// No default
		}
	}

	if (/-256(color)?$/i.test(env.TERM)) {
		return 2;
	}

	if (/^screen|^xterm|^vt100|color|ansi|cygwin|linux/i.test(env.TERM)) {
		return 1;
	}

	if ('COLORTERM' in env) {
		return 1;
	}

	if (env.TERM === 'dumb') {
		return 0;
	}

	return 0;
})();

if ('FORCE_COLOR' in env) {
	supportLevel = parseInt(env.FORCE_COLOR, 10) === 0 ? 0 : supportLevel || 1;
}

module.exports = process && support(supportLevel);
});

var templates = createCommonjsModule(function (module) {
'use strict';

const TEMPLATE_REGEX = /(?:\\(u[a-f0-9]{4}|x[a-f0-9]{2}|.))|(?:\{(~)?(\w+(?:\([^)]*\))?(?:\.\w+(?:\([^)]*\))?)*)(?:[ \t]|(?=\r?\n)))|(\})|((?:.|[\r\n\f])+?)/gi;
const STYLE_REGEX = /(?:^|\.)(\w+)(?:\(([^)]*)\))?/g;
const STRING_REGEX = /^(['"])((?:\\.|(?!\1)[^\\])*)\1$/;
const ESCAPE_REGEX = /\\(u[0-9a-f]{4}|x[0-9a-f]{2}|.)|([^\\])/gi;

const ESCAPES = {
	n: '\n',
	r: '\r',
	t: '\t',
	b: '\b',
	f: '\f',
	v: '\v',
	0: '\0',
	'\\': '\\',
	e: '\u001b',
	a: '\u0007'
};

function unescape(c) {
	if (c[0] === 'u' && c.length === 5 || c[0] === 'x' && c.length === 3) {
		return String.fromCharCode(parseInt(c.slice(1), 16));
	}

	return ESCAPES[c] || c;
}

function parseArguments(name, args) {
	const results = [];
	const chunks = args.trim().split(/\s*,\s*/g);
	let matches;

	for (const chunk of chunks) {
		if (!isNaN(chunk)) {
			results.push(Number(chunk));
		} else if (matches = chunk.match(STRING_REGEX)) {
			results.push(matches[2].replace(ESCAPE_REGEX, (m, escape, chr) => escape ? unescape(escape) : chr));
		} else {
			throw new Error(`Invalid Chalk template style argument: ${chunk} (in style '${name}')`);
		}
	}

	return results;
}

function parseStyle(style) {
	STYLE_REGEX.lastIndex = 0;

	const results = [];
	let matches;

	while ((matches = STYLE_REGEX.exec(style)) !== null) {
		const name = matches[1];

		if (matches[2]) {
			const args = parseArguments(name, matches[2]);
			results.push([name].concat(args));
		} else {
			results.push([name]);
		}
	}

	return results;
}

function buildStyle(chalk, styles) {
	const enabled = {};

	for (const layer of styles) {
		for (const style of layer.styles) {
			enabled[style[0]] = layer.inverse ? null : style.slice(1);
		}
	}

	let current = chalk;
	for (const styleName of Object.keys(enabled)) {
		if (Array.isArray(enabled[styleName])) {
			if (!(styleName in current)) {
				throw new Error(`Unknown Chalk style: ${styleName}`);
			}

			if (enabled[styleName].length > 0) {
				current = current[styleName].apply(current, enabled[styleName]);
			} else {
				current = current[styleName];
			}
		}
	}

	return current;
}

module.exports = (chalk, tmp) => {
	const styles = [];
	const chunks = [];
	let chunk = [];

	// eslint-disable-next-line max-params
	tmp.replace(TEMPLATE_REGEX, (m, escapeChar, inverse, style, close, chr) => {
		if (escapeChar) {
			chunk.push(unescape(escapeChar));
		} else if (style) {
			const str = chunk.join('');
			chunk = [];
			chunks.push(styles.length === 0 ? str : buildStyle(chalk, styles)(str));
			styles.push({ inverse, styles: parseStyle(style) });
		} else if (close) {
			if (styles.length === 0) {
				throw new Error('Found extraneous } in Chalk template literal');
			}

			chunks.push(buildStyle(chalk, styles)(chunk.join('')));
			chunk = [];
			styles.pop();
		} else {
			chunk.push(chr);
		}
	});

	chunks.push(chunk.join(''));

	if (styles.length > 0) {
		const errMsg = `Chalk template literal is missing ${styles.length} closing bracket${styles.length === 1 ? '' : 's'} (\`}\`)`;
		throw new Error(errMsg);
	}

	return chunks.join('');
};
});

const isSimpleWindowsTerm = process.platform === 'win32' && !(process.env.TERM || '').toLowerCase().startsWith('xterm');

// `supportsColor.level` → `ansiStyles.color[name]` mapping
const levelMapping = ['ansi', 'ansi', 'ansi256', 'ansi16m'];

// `color-convert` models to exclude from the Chalk API due to conflicts and such
const skipModels = new Set(['gray']);

const styles = Object.create(null);

function applyOptions(obj, options) {
	options = options || {};

	// Detect level if not set manually
	const scLevel = index$15 ? index$15.level : 0;
	obj.level = options.level === undefined ? scLevel : options.level;
	obj.enabled = 'enabled' in options ? options.enabled : obj.level > 0;
}

function Chalk(options) {
	// We check for this.template here since calling `chalk.constructor()`
	// by itself will have a `this` of a previously constructed chalk object
	if (!this || !(this instanceof Chalk) || this.template) {
		const chalk = {};
		applyOptions(chalk, options);

		chalk.template = function () {
			const args = [].slice.call(arguments);
			return chalkTag.apply(null, [chalk.template].concat(args));
		};

		Object.setPrototypeOf(chalk, Chalk.prototype);
		Object.setPrototypeOf(chalk.template, chalk);

		chalk.template.constructor = Chalk;

		return chalk.template;
	}

	applyOptions(this, options);
}

// Use bright blue on Windows as the normal blue color is illegible
if (isSimpleWindowsTerm) {
	index$9.blue.open = '\u001B[94m';
}

for (const key of Object.keys(index$9)) {
	index$9[key].closeRe = new RegExp(index$7(index$9[key].close), 'g');

	styles[key] = {
		get() {
			const codes = index$9[key];
			return build.call(this, this._styles ? this._styles.concat(codes) : [codes], key);
		}
	};
}

index$9.color.closeRe = new RegExp(index$7(index$9.color.close), 'g');
for (const model of Object.keys(index$9.color.ansi)) {
	if (skipModels.has(model)) {
		continue;
	}

	styles[model] = {
		get() {
			const level = this.level;
			return function () {
				const open = index$9.color[levelMapping[level]][model].apply(null, arguments);
				const codes = {
					open,
					close: index$9.color.close,
					closeRe: index$9.color.closeRe
				};
				return build.call(this, this._styles ? this._styles.concat(codes) : [codes], model);
			};
		}
	};
}

index$9.bgColor.closeRe = new RegExp(index$7(index$9.bgColor.close), 'g');
for (const model of Object.keys(index$9.bgColor.ansi)) {
	if (skipModels.has(model)) {
		continue;
	}

	const bgModel = 'bg' + model[0].toUpperCase() + model.slice(1);
	styles[bgModel] = {
		get() {
			const level = this.level;
			return function () {
				const open = index$9.bgColor[levelMapping[level]][model].apply(null, arguments);
				const codes = {
					open,
					close: index$9.bgColor.close,
					closeRe: index$9.bgColor.closeRe
				};
				return build.call(this, this._styles ? this._styles.concat(codes) : [codes], model);
			};
		}
	};
}

const proto = Object.defineProperties(() => {}, styles);

function build(_styles, key) {
	const builder = function () {
		return applyStyle.apply(builder, arguments);
	};

	builder._styles = _styles;

	const self = this;

	Object.defineProperty(builder, 'level', {
		enumerable: true,
		get() {
			return self.level;
		},
		set(level) {
			self.level = level;
		}
	});

	Object.defineProperty(builder, 'enabled', {
		enumerable: true,
		get() {
			return self.enabled;
		},
		set(enabled) {
			self.enabled = enabled;
		}
	});

	// See below for fix regarding invisible grey/dim combination on Windows
	builder.hasGrey = this.hasGrey || key === 'gray' || key === 'grey';

	// `__proto__` is used because we must return a function, but there is
	// no way to create a function with a different prototype
	builder.__proto__ = proto; // eslint-disable-line no-proto

	return builder;
}

function applyStyle() {
	// Support varags, but simply cast to string in case there's only one arg
	const args = arguments;
	const argsLen = args.length;
	let str = String(arguments[0]);

	if (argsLen === 0) {
		return '';
	}

	if (argsLen > 1) {
		// Don't slice `arguments`, it prevents V8 optimizations
		for (let a = 1; a < argsLen; a++) {
			str += ' ' + args[a];
		}
	}

	if (!this.enabled || this.level <= 0 || !str) {
		return str;
	}

	// Turns out that on Windows dimmed gray text becomes invisible in cmd.exe,
	// see https://github.com/chalk/chalk/issues/58
	// If we're on Windows and we're dealing with a gray color, temporarily make 'dim' a noop.
	const originalDim = index$9.dim.open;
	if (isSimpleWindowsTerm && this.hasGrey) {
		index$9.dim.open = '';
	}

	for (const code of this._styles.slice().reverse()) {
		// Replace any instances already present with a re-opening code
		// otherwise only the part of the string until said closing code
		// will be colored, and the rest will simply be 'plain'.
		str = code.open + str.replace(code.closeRe, code.open) + code.close;

		// Close the styling before a linebreak and reopen
		// after next line to fix a bleed issue on macOS
		// https://github.com/chalk/chalk/pull/92
		str = str.replace(/\r?\n/g, `${code.close}$&${code.open}`);
	}

	// Reset the original `dim` if we changed it to work around the Windows dimmed gray issue
	index$9.dim.open = originalDim;

	return str;
}

function chalkTag(chalk, strings) {
	if (!Array.isArray(strings)) {
		// If chalk() was called by itself or with a string,
		// return the string itself as a string.
		return [].slice.call(arguments, 1).join(' ');
	}

	const args = [].slice.call(arguments, 2);
	const parts = [strings.raw[0]];

	for (let i = 1; i < strings.length; i++) {
		parts.push(String(args[i - 1]).replace(/[{}\\]/g, '\\$&'));
		parts.push(String(strings.raw[i]));
	}

	return templates(chalk, parts.join(''));
}

Object.defineProperties(Chalk.prototype, styles);

var index$6 = Chalk(); // eslint-disable-line new-cap
var supportsColor_1 = index$15;

index$6.supportsColor = supportsColor_1;

const generateErrorString = (msg, error, token, Line, filename, func) => {
  const { line, col } = token.start;
  const { col: end } = token.end;

  const highlight = index$6.red(new Array(end - col + 1).join('^').padStart(end, ' '));
  return `
${Line}
${highlight} ${error}
${msg}
  at ${func} (${filename}:${line}:${col})`;
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

//      
const findTypeIndex = (node, Types) => {
  return Types.findIndex(t => {
    const paramsMatch = t.params.reduce((a, v, i) => node.params[i] && a && v === getType(node.params[i].type), true);

    const resultMatch = t.result == node.result || t.result === getType(node.result.type);

    return paramsMatch && resultMatch;
  });
};

/**
 * Context is used to parse tokens into an AST and IR used by the generator.
 * Originally the parser was a giant class and the context was the 'this' pointer.
 * Maintaining a monolithic parser is rather difficult so it was broken up into a
 * collection of self-contained parsers for each syntactic construct. The context
 * is passed around between each one to generate the desired tree
 */

class Context {

  constructor(options = {
    body: [],
    diAssoc: 'right',
    globals: [],
    functions: [],
    lines: []
  }) {
    Object.assign(this, options);

    this.Program = {
      body: [],
      // Setup keys needed for the emiter
      Types: [],
      Code: [],
      Exports: [],
      Imports: [],
      Globals: [],
      Element: [],
      Functions: []
    };
  }

  syntaxError(msg, error) {
    return new SyntaxError(generateErrorString(msg, error || '', this.token, this.lines[this.token.start.line - 1], this.filename || 'unknown', this.func && this.func.id || 'global'));
  }

  unexpectedValue(value) {
    return this.syntaxError(`Value   : ${this.token.value}
      Expected: ${Array.isArray(value) ? value.join('|') : value}`, 'Unexpected value');
  }

  unexpected(token) {
    return this.syntaxError(`Expected: ${Array.isArray(token) ? token.join(' | ') : JSON.stringify(token)}`, `Unexpected token ${this.token.type}`);
  }

  unknown({ value }) {
    return this.syntaxError('Unknown token', value);
  }

  unsupported() {
    return this.syntaxError('Language feature not supported', this.token.value);
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
    return { start: token.start, range: [token.start] };
  }

  endNode(node, Type) {
    const token = this.token || this.stream.last();
    return _extends({}, node, {
      Type,
      end: token.end,
      range: node.range.concat(token.end)
    });
  }

  writeFunctionPointer(functionIndex) {
    if (!this.Program.Element.length) {
      this.Program.Imports.push.apply(this.Program.Imports, generateImport({
        module: 'env',
        fields: [{
          id: 'table',
          kind: EXTERN_TABLE
        }]
      }));
    }

    const exists = this.Program.Element.find(n => n.functionIndex === functionIndex);
    if (exists == null) {
      this.Program.Element.push(generateElement(functionIndex));
    }
  }
}

//      
function binary(ctx, opts) {
  const node = Object.assign(ctx.startNode(opts.operands[0]), opts);

  ctx.diAssoc = 'left';
  let Type = Syntax_1.BinaryExpression;
  if (node.operator.value === '=') {
    Type = Syntax_1.Assignment;
    ctx.diAssoc = 'right';
  }

  return ctx.endNode(node, Type);
}

function unary(ctx, opts) {
  // Since WebAssembly has no 'native' support for incr/decr _opcode_ it's much simpler to
  // convert this unary to a binary expression by throwing in an extra operand of 1
  if (opts.operator.value === '--' || opts.operator.value === '++') {
    // set isPostfix to help the IR generator
    const bopts = _extends({}, opts, {
      isPostfix: opts.operator.assoc === 'left'
    });
    bopts.operator.value = opts.operator.value[0];
    bopts.operands.push({ Type: Syntax_1.Constant, value: '1' });
    return binary(ctx, bopts);
  }
  const node = Object.assign(ctx.startNode(opts.operands[0]), opts);
  return ctx.endNode(node, Syntax_1.UnaryExpression);
}

const ternary = (ctx, options) => {
  const node = _extends({}, ctx.startNode(options.operands[0]), options);
  return ctx.endNode(node, Syntax_1.TernaryExpression);
};

// Abstraction for handling operations
const operator = (ctx, options) => {
  switch (options.operator.value) {
    case '++':
    case '--':
      return unary(ctx, _extends({}, options, { operands: options.operands.splice(-1) }));
    case '?':
      return ternary(ctx, _extends({}, options, { operands: options.operands.splice(-3) }));
    default:
      return binary(ctx, _extends({}, options, { operands: options.operands.splice(-2) }));
  }
};

const constant$1 = ctx => {
  const node = ctx.startNode();
  node.value = ctx.token.value;
  return ctx.endNode(node, Syntax_1.Constant);
};

// Utilities
const precedence = {
  '+': 0,
  '-': 0,
  '*': 1,
  '/': 1,
  '++': 2,
  '--': 2,
  '==': 2,
  '!=': 2,
  '=': 3,
  ':': 4,
  '?': 4,
  '>': 5,
  '<': 5
};

const argumentList = (ctx, proto) => {
  const list = [];
  // return [];
  ctx.expect(['(']);
  while (ctx.token.value !== ')') list.push(argument(ctx, proto));
  // ctx.expect([')']);
  return list;
};

const argument = (ctx, proto) => {
  const node = expression(ctx, proto.type, true);
  ctx.eat([',']);
  return node;
};
const functionCall = ctx => {
  const node = ctx.startNode();
  node.id = ctx.expect(null, Syntax_1.Identifier).value;
  node.functionIndex = ctx.functions.findIndex(({ id }) => id == node.id);

  if (node.functionIndex === -1) throw ctx.syntaxError(`Undefined function ${node.id}`);

  const proto = ctx.functions[node.functionIndex];

  node.arguments = argumentList(ctx, proto);

  return ctx.endNode(node, Syntax_1.FunctionCall);
};

// Maybe identifier, maybe function call
const maybeIdentifier = ctx => {
  const node = ctx.startNode();
  const localIndex = ctx.func.locals.findIndex(l => l.id === ctx.token.value);
  const globalIndex = ctx.globals.findIndex(g => g.id === ctx.token.value);
  const functionIndex = ctx.functions.findIndex(f => f.id === ctx.token.value);
  const isFuncitonCall = ctx.stream.peek().value === '(';

  // Function pointer
  if (!isFuncitonCall && localIndex < 0 && globalIndex < 0 && functionIndex > -1) {
    // Save the element
    ctx.writeFunctionPointer(functionIndex);
    // Encode a function pointer as a i32.const representing the function index
    const tableIndex = ctx.Program.Element.findIndex(e => e.functionIndex === functionIndex);
    node.value = tableIndex;
    return ctx.endNode(node, Syntax_1.Constant);
  } else if (isFuncitonCall) {
    // if function call then encode it as such
    return functionCall(ctx);
  }

  // Not a function call or pointer, look-up variables
  if (localIndex !== -1) {
    node.localIndex = localIndex;
    node.target = ctx.func.locals[localIndex];
    node.type = node.target.type;
  } else if (globalIndex !== -1) {
    node.globalIndex = globalIndex;
    node.target = ctx.globals[node.globalIndex];
    node.type = node.target.type;
  }

  ctx.diAssoc = 'left';
  return ctx.endNode(node, Syntax_1.Identifier);
};

const last = list => list[list.length - 1];

const assoc = op => {
  switch (op) {
    case '+':
    case '-':
    case '/':
    case '*':
    case ':':
      return 'left';
    case '=':
    case '--':
    case '++':
    case '?':
      return 'right';
    default:
      return 'left';
  }
};

const isLBracket = op => op && op.value === '(';
const isRBracket = op => op && op.value === ')';
const isTStart = op => op && op.value === '?';
const isTEnd = op => op && op.value === ':';
// Simplified version of the Shunting yard algorithm
const expression = (ctx, type = 'i32', inGroup = false, associativity = 'right') => {
  const operators = [];
  const operands = [];

  const consume = () => operands.push(operator(ctx, { type, operator: operators.pop(), operands }));

  const eatUntil = predicate => {
    let prev = last(operators);
    while (prev && !predicate(prev)) {
      consume();
      prev = last(operators);
    }
  };

  ctx.diAssoc = associativity;

  while (ctx.token && ctx.token.value !== ';' && ctx.token.value !== ',') {
    if (ctx.token.type === Syntax_1.Constant) operands.push(constant$1(ctx));else if (ctx.token.type === Syntax_1.Identifier) operands.push(maybeIdentifier(ctx));else if (ctx.token.type === Syntax_1.Punctuator) {
      const op = Object.assign({
        precedence: precedence[ctx.token.value]
      }, ctx.token);

      // Increment, decrement are a bit annoying...
      // we don't know if it's left associative or right without a lot of gymnastics
      if (ctx.token.value === '--' || ctx.token.value === '++') {
        // As we create different nodes the diAssoc is changed
        op.assoc = ctx.diAssoc;
      } else {
        // vanilla binary operator
        op.assoc = assoc(op.value);
      }

      if (isLBracket(op)) {
        operators.push(op);
      } else if (isTEnd(op)) {
        eatUntil(isTStart);
      } else if (isRBracket(op)) {
        if (!inGroup) {
          // If we are not in a group already find the last LBracket,
          // consume everything until that point
          eatUntil(isLBracket);

          // Pop left bracket
          operators.pop();
        } else {
          break;
        }
      } else {
        while (last(operators) && last(operators).precedence >= op.precedence && last(operators).assoc === 'left') consume();

        operators.push(op);
      }
    }

    ctx.next();
  }

  while (operators.length) consume();

  // Should be a node
  return operands.pop();
};

const generate = (ctx, node) => {
  if (!ctx.func) {
    node.globalIndex = ctx.Program.Globals.length;
    ctx.Program.Globals.push(generateInit(node));
    ctx.globals.push(node);
  } else {
    node.localIndex = ctx.func.locals.length;
    ctx.func.locals.push(node);
  }
};

const declaration = ctx => {
  const node = ctx.startNode();
  node.const = ctx.token.value === 'const';
  if (!ctx.eat(['const', 'let'])) throw ctx.unexpectedValue(['const', 'let']);

  node.id = ctx.expect(null, Syntax_1.Identifier).value;
  ctx.expect([':']);

  node.type = ctx.expect(null, Syntax_1.Type).value;

  if (ctx.eat(['='])) node.init = expression(ctx, node.type);

  if (node.const && !node.init) throw ctx.syntaxError('Constant value must be initialized');

  generate(ctx, node);

  return ctx.endNode(node, Syntax_1.Declaration);
};

const last$1 = list => list[list.length - 1];

const paramList = ctx => {
  const paramList = [];
  ctx.expect(['(']);
  while (ctx.token.value !== ')') paramList.push(param(ctx));
  ctx.expect([')']);
  return paramList;
};

const param = ctx => {
  const node = ctx.startNode();
  node.id = ctx.expect(null, Syntax_1.Identifier).value;
  ctx.expect([':']);
  node.type = ctx.expect(null, Syntax_1.Type).value;
  node.isParam = true;
  ctx.eat([',']);
  return ctx.endNode(node, Syntax_1.Param);
};

const maybeFunctionDeclaration = ctx => {
  const node = ctx.startNode();
  if (!ctx.eat(['function'])) return declaration(ctx);

  ctx.func = node;
  node.func = true;
  node.id = ctx.expect(null, Syntax_1.Identifier).value;
  node.params = paramList(ctx);
  node.locals = [...node.params];
  ctx.expect([':']);
  node.result = ctx.expect(null, Syntax_1.Type).value;
  node.result = node.result === 'void' ? null : node.result;

  // NOTE: We need to write function into Program BEFORE
  // we parse the body as the body may refer to the function
  // itself recursively
  // Either re-use an existing type or write a new one
  const typeIndex = findTypeIndex(node, ctx.Program.Types);
  if (typeIndex !== -1) {
    node.typeIndex = typeIndex;
  } else {
    node.typeIndex = ctx.Program.Types.length;
    ctx.Program.Types.push(generateType(node));
  }
  // attach to a type index
  node.functionIndex = ctx.Program.Functions.length;
  ctx.Program.Functions.push(node.typeIndex);
  ctx.functions.push(node);

  ctx.expect(['{']);
  node.body = [];
  let stmt = null;
  while (ctx.token && ctx.token.value !== '}') {
    stmt = statement(ctx);
    if (stmt) node.body.push(stmt);
  }

  // Sanity check the return statement
  const ret = last$1(node.body);
  if (ret && node.type) {
    if (node.type === 'void' && ret.Type === Syntax_1.ReturnStatement) throw ctx.syntaxError('Unexpected return value in a function with result : void');
    if (node.type !== 'void' && ret.Type !== Syntax_1.ReturnStatement) throw ctx.syntaxError('Expected a return value in a function with result : ' + node.result);
  } else if (node.result) {}
  // throw ctx.syntaxError(`Return type expected ${node.result}, received ${JSON.stringify(ret)}`);


  // generate the code block for the emiter
  ctx.Program.Code.push(generateCode(node));

  ctx.expect(['}']);
  ctx.func = null;

  return ctx.endNode(node, Syntax_1.FunctionDeclaration);
};

const _export = ctx => {
  const node = ctx.startNode();
  ctx.eat(['export']);

  const decl = maybeFunctionDeclaration(ctx);
  if (!decl.func) {
    if (!decl.init) throw ctx.syntaxError('Exports must have a value');
  }

  ctx.Program.Exports.push(generateExport(decl));
  node.decl = decl;

  ctx.endNode(node, Syntax_1.Export);

  return node;
};

//      
const field = ctx => {
  const f = {
    id: ctx.expect(null, Syntax_1.Identifier).value
  };

  ctx.expect([':']);
  const typeString = ctx.token.value;
  if (ctx.eat(null, Syntax_1.Type)) {
    // native type, aka GLOBAL export
    f.global = getType(typeString);
  } else if (ctx.eat(null, Syntax_1.Identifier)) {
    // now we need to find a typeIndex, if we don't find one we create one
    // with the idea that a type will be filled in later. if one is not we
    // will throw a SyntaxError when we attempt to emit the binary

    f.typeIndex = ctx.Program.Types.findIndex(({ id }) => id === typeString);
    if (f.typeIndex === -1) {
      f.typeIndex = ctx.Program.Types.length;
      ctx.Program.Types.push({
        id: typeString,
        params: [],
        // When we DO define a type for it later, patch the dummy type
        hoist: node => {
          ctx.Program.Types[f.typeIndex] = generateType(node);
        }
      });
    }

    // attach to a type index
    f.functionIndex = ctx.Program.Functions.length;
    ctx.Program.Functions.push(null);
    ctx.functions.push(f);
  }

  return f;
};

const fieldList = ctx => {
  const fields = [];
  while (ctx.token.value !== '}') {
    const f = field(ctx);
    if (f) {
      fields.push(f);
      ctx.eat([',']);
    }
  }
  ctx.expect(['}']);

  return fields;
};

const _import = ctx => {
  const node = ctx.startNode();
  ctx.eat(['import']);

  if (!ctx.eat(['{'])) throw ctx.syntaxError('expected {');

  node.fields = fieldList(ctx);
  ctx.expect(['from']);

  node.module = ctx.expect(null, Syntax_1.StringLiteral).value;
  // NOTE: string literals contain the starting and ending quote char
  node.module = node.module.substring(1, node.module.length - 1);

  ctx.Program.Imports.push.apply(ctx.Program.Imports, generateImport(node));

  ctx.endNode(node, Syntax_1.Import);
  return node;
};

//      
const param$1 = ctx => {
  const type = ctx.expect(null, Syntax_1.Type).value;
  if (type === 'void') return null;
  return { type };
};

const params = ctx => {
  const list = [];
  let type;
  ctx.expect(['(']);
  while (ctx.token && ctx.token.value !== ')') {
    type = param$1(ctx);
    if (type) list.push(type);
    ctx.eat([',']);
  }
  ctx.expect([')']);

  return list;
};

const type$2 = ctx => {
  const node = ctx.startNode();

  ctx.eat(['type']);

  node.id = ctx.expect(null, Syntax_1.Identifier).value;
  ctx.expect(['=']);
  node.params = params(ctx);
  ctx.expect(['=>']);
  node.result = param$1(ctx);

  // At this point we may have found a type which needs to hoist
  const needsHoisting = ctx.Program.Types.find(({ id, hoist }) => id === node.id && hoist);
  if (needsHoisting) {
    needsHoisting.hoist(node);
  } else {
    ctx.Program.Types.push(generateType(node));
  }

  ctx.endNode(node, Syntax_1.Typedef);
  return node;
};

//     
const paramList$1 = ctx => {
  ctx.expect(['(']);
  const params = [];
  let node = null;
  while (ctx.token.value && ctx.token.value !== ')') {
    node = expression(ctx, 'i32', true);
    if (node) {
      params.push(node);
      ctx.eat([';']);
    }
  }

  ctx.expect([')']);
  return params;
};

const forLoop = ctx => {
  const node = ctx.startNode();
  ctx.eat(['for']);

  node.params = paramList$1(ctx);

  ctx.expect(['{']);

  node.body = [];
  let stmt = null;
  while (ctx.token && ctx.token.value !== '}') {
    stmt = statement(ctx);
    if (stmt) node.body.push(stmt);
  }
  ctx.expect(['}']);

  return ctx.endNode(node, Syntax_1.Loop);
};

//     
const whileLoop = ctx => {
  const node = ctx.startNode();
  ctx.eat(['while']);
  ctx.expect(['(']);

  node.params = [null, expression(ctx, 'i32', true)];

  ctx.expect([')']);
  ctx.expect(['{']);

  node.body = [];
  let stmt = null;
  while (ctx.token && ctx.token.value !== '}') {
    stmt = statement(ctx);
    if (stmt) node.body.push(stmt);
  }

  ctx.expect(['}']);

  return ctx.endNode(node, Syntax_1.Loop);
};

const returnStatement = ctx => {
  const node = ctx.startNode();
  if (!ctx.func) throw ctx.syntaxError('Return statement is only valid inside a function');
  ctx.expect(['return']);
  node.expr = expression(ctx);

  // For generator to emit correct consant they must have a correct type
  // in the syntax it's not necessary to define the type since we can infer it here
  if (node.expr.type && ctx.func.result !== node.expr.type) throw ctx.syntaxError('Return type mismatch');else if (!node.expr.type && ctx.func.result) node.expr.type = ctx.func.result;

  return ctx.endNode(node, Syntax_1.ReturnStatement);
};

//      
const ifThenElse = ctx => {
  const node = _extends({}, ctx.startNode(ctx.token), {
    then: [],
    else: []
  });
  ctx.eat(['if']);

  // First operand is the expression
  ctx.expect(['(']);
  node.expr = expression(ctx, 'i32', true);
  ctx.expect([')']);

  // maybe a curly brace or not
  if (ctx.eat(['{'])) {
    let stmt = null;
    while (ctx.token && ctx.token.value !== '}') {
      stmt = statement(ctx);
      if (stmt) node.then.push(stmt);
    }

    ctx.expect(['}']);

    if (ctx.eat(['else'])) {
      ctx.expect(['{']);
      while (ctx.token && ctx.token.value !== '}') {
        stmt = statement(ctx);
        if (stmt) node.else.push(stmt);
      }
      ctx.expect(['}']);
    }
  } else {
    // parse single statements only
    node.then.push(statement(ctx));
    ctx.expect([';']);
    if (ctx.eat(['else'])) node.else.push(statement(ctx));
  }

  return ctx.endNode(node, Syntax_1.IfThenElse);
};

const keyword$1 = ctx => {
  switch (ctx.token.value) {
    case 'let':
    case 'const':
      return declaration(ctx);
    case 'function':
      return maybeFunctionDeclaration(ctx);
    case 'export':
      return _export(ctx);
    case 'import':
      return _import(ctx);
    case 'type':
      return type$2(ctx);
    case 'if':
      return ifThenElse(ctx);
    case 'for':
      return forLoop(ctx);
    case 'while':
      return whileLoop(ctx);
    case 'return':
      return returnStatement(ctx);
    default:
      throw ctx.unsupported();
  }
};

// It is easier to parse assignment this way as we need to maintain a valid type
// through out the right-hand side of the expression
function maybeAssignment(ctx) {
  const target = maybeIdentifier(ctx);
  if (target.Type === Syntax_1.FunctionCall) return target;

  const nextValue = ctx.stream.peek().value;
  const operator = nextValue === '=' || nextValue === '--' || nextValue === '++';
  if (operator) {
    if (nextValue === '=') {
      ctx.eat(null, Syntax_1.Identifier);
      ctx.eat(['=']);
    }
    const assignment = ctx.startNode();
    assignment.operator = { value: '=' };
    // Push the reference to the local/global
    assignment.operands = [target];
    const expr = expression(ctx);
    // not a postfix
    expr.isPostfix = false;
    assignment.operands.push(expr);
    return ctx.endNode(assignment, Syntax_1.Assignment);
  }

  return expression(ctx);
}

const statement = ctx => {
  switch (ctx.token.type) {
    case Syntax_1.Keyword:
      return keyword$1(ctx);
    case Syntax_1.Punctuator:
      if (ctx.eat([';'])) return null;
    case Syntax_1.Identifier:
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
      diAssoc: 'right',
      stream: tokens,
      token: tokens.next(),
      lines,
      globals: [],
      functions: [],
      filename: 'unknown.walt'
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
      if (child) node.body.push(child);
    }

    return node;
  }
}

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

// Used to output raw binary, holds values and types in a large array 'stream'
class OutputStream {
  constructor() {
    // Our data, expand it
    this.data = [];

    // start at the beginning
    this.size = 0;
  }

  push(type, value, debug = '') {
    let size = 0;
    switch (type) {
      case 'varuint7':
      case 'varuint32':
      case 'varint7':
      case 'varint1':
        {
          // Encode all of the LEB128 aka 'var*' types
          value = this.encode(value);
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

  // Get the BUFFER, not data array. **Always creates new buffer**
  buffer() {
    const buffer = new ArrayBuffer(this.size);
    const view = new DataView(buffer);
    let pc = 0;
    this.data.forEach(({ type, value }) => {
      if (Array.isArray(value)) {
        value.forEach((v, i) => index_14(index_9, pc++, view, v));
      } else {
        index_14(type, pc, view, value);
        pc += index_16[type];
      }
    });
    return buffer;
  }

  debug(begin = 0, end) {
    let pc = 0;
    return this.data.slice(begin, end).map(({ type, value, debug }) => {
      const pcString = pc.toString(16).padStart(8, '0').padEnd(this.data.length.toString().length + 1);
      let valueString;
      if (Array.isArray(value)) valueString = value.map(v => v.toString(16)).join().padStart(12);else valueString = value.toString(16).padStart(12);
      const out = `${pcString}: ${valueString} ; ${debug}`;
      pc += index_16[type] || value.length;
      return out;
    }).join('\n') + "\n ============ fin =============";
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

// TODO these should be configure-able/not defined here
const VERSION = 0x1;
const MAGIC = 0x6d736100;



function write() {
  return new OutputStream().push(index_12, MAGIC, `\\0asm`).push(index_12, VERSION, `version ${VERSION}`);
}

const varuint32 = 'varuint32';
const varint7 = 'varint7';
const varint1 = 'varint1';

function emitString(stream, string, debug = 'string length') {
  stream.push(varuint32, string.length, debug);
  for (let i = 0; i < string.length; i++) stream.push(index_9, string.charCodeAt(i), string[i]);
  return stream;
}

const writer = ({
  type,
  label,
  emitter
}) => ast => {
  const field = ast[label];
  if (!field || !field.length) return null;

  const stream = new OutputStream().push(index_9, type, label + ' section');
  const entries = emitter(field);

  stream.push(varuint32, entries.size, 'size');
  stream.write(entries);

  return stream;
};

const emit$1 = entries => {
  const payload = new OutputStream().push(varuint32, entries.length, 'entry count');

  entries.forEach(({ module, field, kind, global, typeIndex }) => {
    emitString(payload, module, 'module');
    emitString(payload, field, 'field');

    switch (kind) {
      case EXTERN_GLOBAL:
        {
          payload.push(index_9, kind, 'Global');
          payload.push(index_9, global, getTypeString(global));
          payload.push(index_9, 0, 'immutable');
          break;
        }
      case EXTERN_FUNCTION:
        {
          payload.push(index_9, kind, 'Function');
          payload.push(varuint32, typeIndex, 'type index');
          break;
        }
      case EXTERN_TABLE:
        {
          payload.push(index_9, kind, 'Table');
          payload.push(index_9, ANYFUNC, 'function table types');
          payload.push(varint1, 0, 'has max value');
          payload.push(varuint32, 0, 'iniital table size');
          break;
        }
    }
  });

  return payload;
};

const emit$2 = exports => {
  const payload = new OutputStream();
  payload.push(varuint32, exports.length, 'count');

  exports.forEach(({ field, kind, index }) => {
    emitString(payload, field, 'field');

    payload.push(index_9, kind, 'Global');
    payload.push(varuint32, index, 'index');
  });

  return payload;
};

const encode = (payload, { type, init, mutable }) => {
  payload.push(index_9, type, getTypeString(type));
  payload.push(index_9, mutable, 'mutable');
  if (!Array.isArray(init)) {
    // Encode the constant
    switch (type) {
      case I32:
        payload.push(index_9, def.i32Const.code, def.i32Const.text);
        payload.push(varuint32, init, `value (${init})`);
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
  } else {
    // Encode a list of opcodes
    init.forEach(({ kind, params }) => {
      payload.push(index_9, kind.code, kind.text);
      params.forEach(p => payload.push(varuint32, p, `value (${p})`));
    });
  }
  payload.push(index_9, def.End.code, 'end');
};

const emit$3 = globals => {
  const payload = new OutputStream();
  payload.push(varuint32, globals.length, 'count');

  globals.forEach(g => encode(payload, g));

  return payload;
};

// Emits function section. For function code emiter look into code.js
const emit$4 = functions => {
  functions = functions.filter(func => func !== null);
  const stream = new OutputStream();
  stream.push(varuint32, functions.length, 'count');

  functions.forEach(index => stream.push(varuint32, index, 'type index'));

  return stream;
};

//      
const emitElement = stream => ({ functionIndex }, index) => {
  stream.push(varuint32, 0, 'table index');
  stream.push(index_9, def.i32Const.code, 'offset');
  stream.push(varuint32, index, '');
  stream.push(index_9, def.End.code, 'end');
  stream.push(varuint32, 1, 'number of elements');
  stream.push(varuint32, functionIndex, 'function index');
};

const emit$5 = elements => {
  const stream = new OutputStream();
  stream.push(varuint32, elements.length, 'count');

  elements.forEach(emitElement(stream));

  return stream;
};

const emitType = (stream, { params, result }) => {
  // as of wasm 1.0 spec types are only of from === func
  stream.push(varint7, FUNC, 'func type');
  stream.push(varuint32, params.length, 'parameter count');
  params.forEach(type => stream.push(varint7, type, 'param'));
  if (result) {
    stream.push(varint1, 1, 'result count');
    stream.push(varint7, result, `result type ${getTypeString(result)}`);
  } else {
    stream.push(varint1, 0, 'result count');
  }
};

const emit$6 = types => {
  const stream = new OutputStream();
  stream.push(varuint32, types.length, 'count');

  types.forEach(type => emitType(stream, type));

  return stream;
};

// TODO
const emitLocal = (stream, local) => {
  if (local.isParam == null) {
    stream.push(varuint32, 1, 'number of locals of following type');
    stream.push(varint7, local.type, `${getTypeString(local.type)}`);
  }
};

const emitFunctionBody = (stream, { locals, code }) => {
  // write bytecode into a clean buffer
  const body = new OutputStream();
  code.forEach(({ kind, params, valueType }) => {
    // There is a much nicer way of doing this
    body.push(index_9, kind.code, kind.text);

    if (valueType) {
      body.push(index_9, valueType.type, 'result type');
      body.push(index_9, valueType.mutable, 'mutable');
    }

    // map over all params, if any and encode each one
    (params || []).forEach(p => {
      let type = varuint32;
      // either encode unsigned 32 bit values or floats
      switch (kind.result) {
        case index_9:
          type = index_9;
          break;
        case index_4:
          type = index_4;
          break;
        case index_3:
          type = index_3;
          break;
        case index_1:
        default:
          type = varuint32;
      }
      body.push(type, p, ' ');
    });
  });

  // output locals to the stream
  const localsStream = new OutputStream();
  locals.forEach(local => emitLocal(localsStream, local));

  // body size is
  stream.push(varuint32, body.size + localsStream.size + 2, 'body size in bytes');
  stream.push(varuint32, locals.length, 'locals count');

  stream.write(localsStream);
  stream.write(body);
  stream.push(index_9, def.End.code, 'end');
};

const emit$7 = functions => {
  // do stuff with ast
  const stream = new OutputStream();
  stream.push(varuint32, functions.length, 'function count');
  functions.forEach(func => emitFunctionBody(stream, func));

  return stream;
};

const SECTION_TYPE = 1;
const SECTION_IMPORT = 2;
const SECTION_FUNCTION = 3;


const SECTION_GLOBAL = 6;
const SECTION_EXPORT = 7;

const SECTION_ELEMENT = 9;
const SECTION_CODE = 10;

var section = {
  type: writer({ type: SECTION_TYPE, label: 'Types', emitter: emit$6 }),
  function: writer({ type: SECTION_FUNCTION, label: 'Functions', emitter: emit$4 }),
  imports: writer({ type: SECTION_IMPORT, label: 'Imports', emitter: emit$1 }),
  exports: writer({ type: SECTION_EXPORT, label: 'Exports', emitter: emit$2 }),
  globals: writer({ type: SECTION_GLOBAL, label: 'Globals', emitter: emit$3 }),
  element: writer({ type: SECTION_ELEMENT, label: 'Element', emitter: emit$5 }),
  code: writer({ type: SECTION_CODE, label: 'Code', emitter: emit$7 })
};

function emit(ast = {}) {
  const stream = new OutputStream();

  // Write MAGIC and VERSION. This is now a valid WASM Module
  return stream.write(write()).write(section.type(ast)).write(section.imports(ast)).write(section.function(ast)).write(section.globals(ast)).write(section.exports(ast)).write(section.element(ast)).write(section.code(ast));
}

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

exports.getAst = getAst;
exports.getIR = getIR;
exports['default'] = compile;

Object.defineProperty(exports, '__esModule', { value: true });

})));
