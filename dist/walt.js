(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(factory((global.Walt = global.Walt || {})));
}(this, (function (exports) { 'use strict';

/**
 * Base Character stream class
 *
 * @author  Arthur Buldauskas <arthurbuldauskas@gmail.com>
 */

class Stream$1 {
  /**
   * @constructor
   *
   * @param {String} input Input to read
   * @throws
   */
  constructor(input) {
    if (input == null || typeof input != 'string') this.die(`Invalid input stream in Stream constructor. Expected String,
                instead recieved ${JSON.stringify(input)}`);

    this.pos = this.line = this.col = 0;
    this.input = input;
    this.newLine();
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

  /**
   * Peek at a character at current position
   *
   * @return {String} Character
   */
  peek() {
    return this.input.charAt(this.pos);
  }

  /**
   * Advance to next character in stream
   *
   * @return {String} Character
   */
  next() {
    const char = this.input.charAt(this.pos++);

    if (Stream$1.eol(char)) this.newLine();else this.col++;

    return char;
  }

  /**
   * Begin a new line
   */
  newLine() {
    this.line++;
    this.col = 0;
  }

  /**
   * Is the character an end of line
   *
   * @param {String} char Character
   *
   * @return {Boolean}
   * @static
   */
  static eol(char) {
    return char === '\n';
  }

  /**
   * Is the character an end of file
   *
   * @param {String} char Character
   *
   * @return {Boolean}
   * @static
   */
  static eof(char) {
    return char === '';
  }

  /**
   * Is the charater a whitespace
   *
   * @param {String} char Character
   *
   * @return {Boolean}
   * @static
   */
  static whitespace(char) {
    return char === "\n" || char === ' ' || char === "\t" || char === "\v" || char === "\r" || char === "\f";
  }
}

var Stream_1 = Stream$1;

class Tokenizer$1 {
  constructor(stream, parsers = []) {
    if (!(stream instanceof Stream_1)) this.die(`Tokenizer expected instance of Stream in constructor.
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
    } while (!Stream_1.eol(this.stream.peek()) && !Stream_1.eof(this.stream.peek()) && !Stream_1.whitespace(this.stream.peek()) && nextMatchers.length > 0);

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
    while (Stream_1.whitespace(this.stream.peek())) this.stream.next();
  }

  parse() {
    while (!Stream_1.eof(this.stream.peek())) this.next();

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

class TokenStream$1 {
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
  Statement: 'Statement',
  BinaryExpression: 'BinaryExpression',
  NumberLiteral: 'NumberLiteral',
  StringLiteral: 'StringLiteral',
  Punctuator: 'Punctuator',
  Identifier: 'Identifier',
  Constant: 'Constant',
  Type: 'Type',
  Declaration: 'Declaration',
  FunctionDeclaration: 'FunctionDeclaration',
  Program: 'Program',
  Assignment: 'Assignment',
  Param: 'Param',
  ReturnStatement: 'ReturnStatement'
};

var Syntax_1 = Syntax;

const supported = [
// EcmaScript
'break', 'if', 'else', 'import', 'export', 'return', 'switch', 'case', 'default', 'const', 'let', 'for', 'continue', 'do', 'void', 'while',

// walt replacement, matching s-expression syntax
'func',

// s-expression
'global', 'module', 'memory', 'table', 'type',

// specials/asserts
'invoke', 'assert', 'assert_return',

// additional syntax
// statically replaced with consant value at compile time
'sizeof'];

const trie = new trie$1(supported);
const root = trie.fsearch;
var index = token(root, Syntax_1.Keyword, supported);

const supported$1 = ['+', '++', '-', '--', '=', '==', '%', '/', '^', '&', '|', '!', '**', ':', '(', ')', '.', '{', '}', ';'];

const trie$3 = new trie$1(supported$1);
var index$1 = token(trie$3.fsearch, Syntax_1.Punctuator, supported$1);

var index$3 = createCommonjsModule(function (module) {
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

var index$2 = createCommonjsModule(function (module) {
  const parse = char => {
    if (!index$1(char) && !index$3(char)) return parse;
    return null;
  };

  module.exports = token(parse, Syntax_1.Identifier);
});

const supported$2 = ['i32', 'i64', 'f32', 'f64', 'anyfunc'];
const trie$4 = new trie$1(supported$2);
var index$4 = token(trie$4.fsearch, Syntax_1.Type, supported$2);

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

var index$5 = createCommonjsModule(function (module) {
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

var index_1 = index$5.i32;
var index_2 = index$5.i64;
var index_3 = index$5.f32;
var index_4 = index$5.f64;
var index_9 = index$5.u8;
var index_12 = index$5.u32;
var index_14 = index$5.set;
var index_16 = index$5.sizeof;

const EXTERN_FUNCTION = 0;


const EXTERN_GLOBAL = 3;

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

const getType = str => {
  switch (str) {
    case 'f32':
      return F32;
    case 'f64':
      return F64;
    case 'i32':
    default:
      return I32;
  }
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

const generateValueType = node => {
  const value = {};
  value.mutable = node.const ? 0 : 1;
  value.type = getType(node.type);

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
  if (node.result !== 'void') {
    type.result = getType(node.result);
  }

  type.params = node.paramList.map(p => getType(p.type));

  return type;
};

const generateCode = func => {
  // TODO generate locals
  const block = { locals: [], code: [] };

  // the binary encoding is not a tree per se, so we need to concat everything
  func.body.forEach(node => {
    switch (node.Type) {
      case Syntax_1.ReturnStatement:
        block.code = [...block.code, ...generateReturn(node)];
        break;
      case Syntax_1.Declaration:
        {
          // add possible set_local call
          if (node.init) {
            node.init.type = node.type;
            block.code = [...block.code, ...generateExpression(node.init)];
            block.code.push({ kind: def.SetLocal.code, params: [block.locals.length] });
          }

          // add a local entry
          block.locals.push(generateValueType(node));
          break;
        }
    }
  });

  return block;
};

const generateReturn = node => {
  return generateExpression(node.expr);
};

const generateExpression = expr => {
  const block = [];
  switch (expr.Type) {
    case Syntax_1.Constant:
      {
        const op = def[expr.type + 'Const'];
        block.push({ kind: op.code, params: [expr.value] });
        break;
      }
    case Syntax_1.Identifier:
      {
        if ('globalIndex' in expr) block.push({ kind: def.GetGlobal.code, params: [expr.globalIndex] });
        if ('localIndex' in expr) block.push({ kind: def.GetLocal.code, params: [expr.localIndex] });
        break;
      }
  }
  return block;
};

const last = list => list[list.length - 1];

// Utilities
const precedence = {
  '+': 0,
  '-': 0,
  '*': 1,
  '/': 1
};

const assoc = op => {
  switch (op) {
    case '+':
    case '-':
    case '/':
    case '*':
      return 'left';
    case '=':
      return 'right';
    default:
      return 'left';
  }
};

const findTypeIndex = (node, Types) => {
  return Types.findIndex(t => {
    const paramsMatch = t.params.reduce((a, v, i) => a && v === getType(node.paramList[i].type), true);

    return paramsMatch && t.result === getType(node.result.type);
  });
};

class Parser$1 {
  constructor(tokenStream) {
    if (!(tokenStream instanceof TokenStream$1)) throw `Parser expects a TokenStream instead received ${tokenStream}`;

    this.stream = tokenStream;
    this.token = this.stream.next();
    this.globalSymbols = {};
    this.localSymbols = {};
  }

  syntaxError(msg, error) {
    const { line, col } = this.token.start;
    return new SyntaxError(`${error || 'Syntax error'} at ${line}:${col}
      ${msg}`);
  }

  unexpectedValue(value) {
    return this.syntaxError(`Value   : ${this.token.value}
       Expected: ${Array.isArray(value) ? value.join('|') : value}`, 'Unexpected value');
  }

  unexpected(token) {
    return this.syntaxError('Unexpected token', `Token   : ${this.token.type}
       Expected: ${Array.isArray(token) ? token.join(' | ') : token}`);
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
    return Object.assign(node, {
      Type,
      end: token.end,
      range: node.range.concat(token.end)
    });
  }

  statement(node = this.startNode()) {
    switch (this.token.type) {
      case Syntax_1.Keyword:
        return this.keyword(node);
      case Syntax_1.Punctuator:
        if (this.eat([';'])) return null;
      default:
        throw this.unknown();
    }
  }

  // Simplified version of the Shunting yard algorithm
  expression(node = this.startNode(), inGroup) {
    const operators = [];
    const operands = [];

    const consume = () => operands.push(this.binary({
      operator: operators.pop(),
      right: operands.pop(),
      left: operands.pop()
    }));

    while (this.token && this.token.value !== ';') {
      if (this.token.type === Syntax_1.Constant) operands.push(this.constant());
      if (this.token.type === Syntax_1.Identifier) operands.push(this.identifier());

      if (this.token.type === Syntax_1.Punctuator) {
        while (last(operators) && precedence[last(operators).value] >= precedence[this.token.type] && assoc(last(operators).value) === 'left') consume();

        operators.push(this.token);
      }
      // TODO "("
      // TODO ")"
      this.next();
    }

    while (operators.length) consume();

    // Should be a node
    return operands.pop();
  }

  binary(opts) {
    const node = Object.assign(this.startNode(opts.left), opts);
    return this.endNode(node, Syntax_1.BinaryExpression);
  }

  keyword(node) {
    switch (this.token.value) {
      case 'let':
      case 'const':
        return this.declaration(node);
      case 'function':
        return this.functionDeclaration(node);
      case 'export':
        return this.export(node);
      case 'return':
        return this.returnStatement(node);
      default:
        throw this.unsupported(this.current);
    }
  }

  export(node) {
    this.eat(['export']);
    const decl = this.maybeFunctionDeclaration(this.startNode());
    if (!decl.func) {
      if (!decl.init) throw this.syntaxError('Exports must have a value');
    }

    this.Program.Exports.push(generateExport(decl));
    node.decl = decl;

    this.endNode(node, Syntax_1.Export);

    return node;
  }

  declaration(node) {
    node.const = this.token.value === 'const';
    if (!this.eat(['const', 'let'])) throw this.unexpectedValue(['const', 'let']);

    node.id = this.expect(null, Syntax_1.Identifier).value;
    this.expect([':']);

    node.type = this.expect(null, Syntax_1.Type).value;

    if (this.eat(['='])) node.init = this.expression();

    if (node.const && !node.init) throw this.syntaxError('Constant value must be initialized');

    if (!this.func) {
      node.globalIndex = this.Program.Globals.length;
      this.Program.Globals.push(generateInit(node));
      this.globals.push(node);
    } else {
      node.localIndex = this.func.locals.length;
      this.func.locals.push(node);
    }

    return this.endNode(node, Syntax_1.Declaration);
  }

  maybeFunctionDeclaration(node) {
    if (!this.eat(['function'])) return this.declaration(node);

    this.func = node;
    node.func = true;
    node.locals = [];
    node.id = this.expect(null, Syntax_1.Identifier).value;
    node.paramList = this.paramList();
    this.expect([':']);
    node.result = this.expect(null, Syntax_1.Type).value;
    this.expect(['{']);
    node.body = [];
    let stmt = null;
    while (this.token.value !== '}') {
      stmt = this.statement();
      if (stmt) node.body.push(stmt);
    }

    // Sanity check the return statement
    const ret = last(node.body);
    if (node.type === 'void' && ret.Type === Syntax_1.ReturnStatement) throw this.syntaxError('Unexpected return value in a function with result : void');
    if (node.type !== 'void' && ret.Type !== Syntax_1.ReturnStatement) throw this.syntaxError('Expected a return value in a function with result : ' + node.result);

    // Either re-use an existing type or write a new one
    const typeIndex = findTypeIndex(node, this.Program.Types);
    if (typeIndex !== -1) {
      node.typeIndex = typeIndex;
    } else {
      node.typeIndex = this.Program.Types.length;
      this.Program.Types.push(generateType(node));
    }

    // attach to a type index
    node.functionIndex = this.Program.Functions.length;
    this.Program.Functions.push(node.typeIndex);

    // generate the code block for the emiter
    this.Program.Code.push(generateCode(node));

    this.expect(['}']);
    this.func = null;

    return this.endNode(node, Syntax_1.FunctionDeclaration);
  }

  paramList() {
    const paramList = [];
    this.expect(['(']);
    while (this.token.value !== ')') paramList.push(this.param());
    this.expect([')']);
    return paramList;
  }

  param(node = this.startNode()) {
    node.id = this.expect(null, Syntax_1.Identifier).value;
    this.expect([':']);
    node.type = this.expect(null, Syntax_1.Type).value;
    return this.endNode(node, Syntax_1.Param);
  }

  returnStatement(node = this.startNode()) {
    if (!this.func) throw this.syntaxError('Return statement is only valid inside a function');
    this.expect(['return']);
    node.expr = this.expression();

    // For generator to emit correct consant they must have a correct type
    // in the syntax it's not necessary to define the type since we can infer it here
    if (node.expr.type && this.func.result !== node.expr.type) throw this.syntaxError('Return type mismatch');else if (!node.expr.type && this.func.result) node.expr.type = this.func.result;

    return this.endNode(node, Syntax_1.ReturnStatement);
  }

  constant(token = this.token) {
    const node = this.startNode();
    node.value = token.value;
    return this.endNode(node, Syntax_1.Constant);
  }

  identifier(token = this.token) {
    const node = this.startNode();
    let target = this.func.locals.findIndex(l => l.id === this.token.value);
    if (target !== -1) {
      node.localIndex = target;
      node.target = this.func.locals[target];
    } else {
      node.globalIndex = this.globals.findIndex(g => g.id === this.token.value);
      node.target = this.globals[node.globalIndex];
    }

    return this.endNode(node, Syntax_1.Identifier);
  }

  // Get the ast
  program() {
    // No code, no problem, empty ast equals
    // (module) ; the most basic wasm module
    if (!this.stream || !this.stream.length) {
      return {};
    }

    this.globals = [];
    const node = this.Program = this.startNode();

    // Setup keys needed for the emiter
    this.Program.Types = [];
    this.Program.Code = [];
    this.Program.Exports = [];
    this.Program.Imports = [];
    this.Program.Globals = [];
    this.Program.Functions = [];

    node.body = [];
    while (this.stream.peek()) {
      const child = this.statement();
      if (child) node.body.push(child);
    }

    return node;
  }

  parse() {
    return this.program();
  }
}

const tokenParsers = [index, index$3, index$1, index$4, index$2];

const Tokenizer = Tokenizer$1;
const Stream = Stream_1;





const TokenStream = TokenStream$1;

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
  static bufferToHex(buffer) {
    const view = new DataView(buffer);
    const result = [];
    for (let i = 0; i < buffer.byteLength; i++) result.push('0x' + view.getUint8(i, true).toString(16));
    return result;
  }

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
      const pcString = pc.toString().padEnd(this.data.length.toString().length + 1);
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

const emitter = entries => {
  const payload = new OutputStream().push(varuint32, entries.length, 'entry count');

  entries.forEach(({ module, field, kind, global }) => {
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
    }
  });

  return payload;
};

const emitter$1 = exports => {
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

const emit$1 = globals => {
  const payload = new OutputStream();
  payload.push(varuint32, globals.length, 'count');

  globals.forEach(g => encode(payload, g));

  return payload;
};

const emitter$2 = functions => {
  const stream = new OutputStream();
  stream.push(varuint32, functions.length, 'count');

  functions.forEach(index => stream.push(varuint32, index, 'type index'));

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
  }
};

const emitter$3 = types => {
  const stream = new OutputStream();
  stream.push(varuint32, types.length, 'count');

  types.forEach(type => emitType(stream, type));

  return stream;
};

// TODO
const emitLocal = (stream, local) => {
  stream.push(varuint32, 1, 'number of locals of following type');
  stream.push(varint7, local.type, `${getTypeString(local.type)}`);
};

const emitFunctionBody = (stream, { locals, code }) => {
  // write bytecode into a clean buffer
  const body = new OutputStream();
  code.forEach(({ kind, params }) => {
    switch (kind) {
      case def.GetGlobal.code:
        body.push(index_9, kind, def.GetGlobal.text);
        body.push(varuint32, params[0], 'global index');
        break;
      case def.GetLocal.code:
        body.push(index_9, kind, def.GetLocal.text);
        body.push(varuint32, params[0], 'local index');
        break;
      case def.SetGlobal.code:
        body.push(index_9, kind, def.SetGlobal.text);
        body.push(varuint32, params[0], 'global index');
        body.push(varuint32, params[1], `value (${params[1]})`);
        break;
      case def.SetLocal.code:
        body.push(index_9, kind, def.SetLocal.text);
        body.push(varuint32, params[0], 'local index');
        break;
      case def.i32Const.code:
        body.push(index_9, kind, def.i32Const.text);
        body.push(varuint32, params[0], `value (${params[0]})`);
        break;
    }
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

const emit$2 = functions => {
  // do stuff with ast
  const stream = new OutputStream();
  stream.push(varuint32, functions.length, 'function count');
  functions.forEach(func => emitFunctionBody(stream, func));

  return stream;
};

const SECTION_TYPE = 1; // Function signature declarations
const SECTION_IMPORT = 2; // Import declarations
const SECTION_FUNCTION = 3; // Function declarations
 // Indirect function table and other tables
 // Memory attributes
const SECTION_GLOBAL = 6; // Global declarations
const SECTION_EXPORT = 7; // Exports
 // Start function declaration
 // Elements section
const SECTION_CODE = 10; // Function bodies (code)
 // Data segments

var section = {
  type: writer({ type: SECTION_TYPE, label: 'Types', emitter: emitter$3 }),
  function: writer({ type: SECTION_FUNCTION, label: 'Functions', emitter: emitter$2 }),
  imports: writer({ type: SECTION_IMPORT, label: 'Imports', emitter: emitter }),
  exports: writer({ type: SECTION_EXPORT, label: 'Exports', emitter: emitter$1 }),
  globals: writer({ type: SECTION_GLOBAL, label: 'Globals', emitter: emit$1 }),
  code: writer({ type: SECTION_CODE, label: 'Code', emitter: emit$2 })
};

function emit(ast = {}) {
  const stream = new OutputStream();

  // Write MAGIC and VERSION. This is now a valid WASM Module
  return stream.write(write()).write(section.type(ast)).write(section.function(ast)).write(section.imports(ast)).write(section.globals(ast)).write(section.exports(ast)).write(section.code(ast));
}

// Used for deugging purposes
const getAst = source => {
  const stream = new Stream(source);
  const tokenizer = new Tokenizer(stream, tokenParsers);
  const tokenStream = new TokenStream(tokenizer.parse());
  const parser = new Parser$1(tokenStream);
  const ast = parser.parse();
  const wasm = emit(ast);
  return wasm;
};

// Compiles a raw binary wasm buffer
const compile = source => {
  const wasm = getAst(source);
  return wasm.buffer();
};

exports.getAst = getAst;
exports['default'] = compile;

Object.defineProperty(exports, '__esModule', { value: true });

})));
