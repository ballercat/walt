import test from 'ava';
import { harness } from '../utils/test-utils';
import { join } from 'path';
import { TextDecoder, TextEncoder } from 'util';

const keyword = [
  // EcmaScript
  'break',
  'if',
  'else',
  'import',
  'as',
  'from',
  'export',
  'return',
  'switch',
  'case',
  'default',
  'const',
  'let',
  'for',
  'continue',
  'do',
  'while',
  'throw',
  'function',

  // s-expression
  'global',
  'module',
  'type',
  'lambda',
];

let letters = {};
keyword.forEach((w, k) => {
  Array.from(w).forEach((l, i) => {
    letters[i] = letters[i] || new Array(26).fill(0).map(() => ' ');
    // letters[i][l.toUpperCase().charCodeAt(0) - 65] = l;
    // letters[i] = [...(letters[i] || new Array(26)), l];
    letters[i][k] = l;
  });
});
Object.entries(letters).forEach(([k, v]) => {
  console.log(k, v.join());
});

function tokenizer(wasmModule, dropWhitespace = true) {
  const DATA_SIZE = 4;
  const { exports } = wasmModule.instance;
  const decoder = new TextDecoder();
  const typeMap = [
    'whitespace',
    'comment',
    'number',
    'char',
    'string',
    'identifier',
    'punctuator',
    'keyword',
    'type',
  ];

  let state = {
    loc: 0,
    length: 0,
    col: 0,
    line: 0,
  };

  let offset = DATA_SIZE;

  const _next = () => {
    if (state.loc - offset >= state.length) {
      return null;
    }
    // result is a 32-bit number with the MSB(4) being type and LSB(28) length
    const result = exports.next(state.loc);
    // result >> 4 is length
    const end = state.loc + (result >> 4);
    // result & 0xF is type
    const type = typeMap[result & 0xf];
    const value = decoder.decode(exports.memory.buffer.slice(state.loc, end));

    state = {
      ...state,
      loc: end,
    };

    return {
      type,
      value,
    };
  };

  return {
    get line() {
      return exports.getLine();
    },
    get col() {
      return exports.getCol();
    },
    save() {
      return exports.save();
    },
    reset(chunk, info = { loc: DATA_SIZE }) {
      this.lines = chunk.split('\n');
      const mem = new DataView(exports.memory.buffer);
      const u8mem = new Uint8Array(exports.memory.buffer);
      const u8str = new TextEncoder().encode(chunk);

      offset = mem.getInt32(0, true) || DATA_SIZE;

      u8mem.set(u8str, offset);

      state = {
        ...state,
        ...info,
        loc: offset,
        length: chunk.length,
      };

      exports.reset(state.col, state.line);
    },
    next() {
      // It's a cruel and unusual punishment to implement comments with nearly
      let token = _next();
      while (dropWhitespace && token && token.type === 'whitespace') {
        token = _next();
      }
      // Drop all comment tokens found
      // while (token && token.type === 'comment') {
      //   token = _next();
      // }
      this.current = token;
      return this.current;
    },
    formatError(token) {
      return exports.formatError(token);
    },
    has(name) {
      return exports.has(name);
    },
  };
}

test('walt tokenizer', t => {
  return harness(join(__dirname, '../walt/tokenizer/index.walt'), null, {
    prettyPrint: false,
  })(t)
    .then(tokenizer)
    .then(lexer => {
      lexer.reset('const x : i32 = 2 * 2 + 2;');
      lexer.reset('const x : i32 = y;');
      let token = lexer.next();
      while (token) {
        console.log(token);
        token = lexer.next();
      }
      console.log('--- FIN ---');
    });
});
