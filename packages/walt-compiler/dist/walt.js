(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(factory((global.Walt = {})));
}(this, (function (exports) { 'use strict';

var immutable = extend;

var hasOwnProperty = Object.prototype.hasOwnProperty;

function extend() {
    var target = {};

    for (var i = 0; i < arguments.length; i++) {
        var source = arguments[i];

        for (var key in source) {
            if (hasOwnProperty.call(source, key)) {
                target[key] = source[key];
            }
        }
    }

    return target;
}

const identity = id => id;

function map(visitors) {
  function mapper(input) {
    if (!Array.isArray(input)) {
      throw new Error('Transform must be used on an Array. Received ' + JSON.stringify(input));
    }
    const visitor = (() => {
      const [node] = input;
      if (node.Type in visitors && typeof visitors[node.Type] === 'function') {
        return visitors[node.Type];
      }
      return identity;
    })();

    if (visitor.length === 2) {
      return visitor(input, mapper);
    }

    const [node, ...rest] = visitor(input);
    const params = node.params.filter(Boolean).map(child => mapper([child, ...rest]));

    return immutable(node, { params });
  }

  return mapper;
}

// This should maybe be it's own module.
function mapNode$2(visitor) {
  const nodeMapper = node => {
    if (node == null) {
      return node;
    }

    const mappingFunction = (() => {
      if ('*' in visitor && typeof visitor['*'] === 'function') {
        return visitor['*'];
      }

      if (node.Type in visitor && typeof visitor[node.Type] === 'function') {
        return visitor[node.Type];
      }
      return identity;
    })();

    if (mappingFunction.length === 2) {
      return mappingFunction(node, nodeMapper);
    }

    const mappedNode = mappingFunction(node);
    const params = mappedNode.params.map(nodeMapper);

    return immutable(mappedNode, { params });
  };

  return nodeMapper;
}

var mapNode_1$1 = {
  map,
  mapNode: mapNode$2
};

var mapNode = mapNode_1$1;

var mapNode_1 = mapNode.map;
var mapNode_2 = mapNode.mapNode;

// Dead simple AST walker, takes a visitor object and calls all methods for
// appropriate node Types.
var walkNode$2 = function walker(visitor) {
  const walkNode = node => {
    if (node == null) {
      return node;
    }
    const { params } = node;

    const mappingFunction = (() => {
      if ('*' in visitor && typeof visitor['*'] === 'function') {
        return visitor['*'];
      }

      if (node.Type in visitor && typeof visitor[node.Type] === 'function') {
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
};

var walkNode = walkNode$2;

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

var commonjsGlobal = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};



function unwrapExports (x) {
	return x && x.__esModule ? x['default'] : x;
}

function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var waltSyntax = createCommonjsModule(function (module, exports) {
(function (global, factory) {
  factory(exports);
})(commonjsGlobal, function (exports) {
  const keyword = [
  // EcmaScript
  'break', 'if', 'else', 'import', 'as', 'from', 'export', 'return', 'switch', 'case', 'default', 'const', 'let', 'for', 'continue', 'do', 'while', 'throw', 'function',

  // s-expression
  'global', 'module', 'type', 'lambda'];
  const punctuator = ['+', '++', '-', '--', '>>', '>>>', '<<', '=', '==', '+=', '-=', '=>', '<=', '>=', '!=', '%', '*', '/', '^', '&', '~', '|', '!', '**', ':', '(', ')', '.', '{', '}', ',', '[', ']', ';', '>', '<', '?', '||', '&&', '{', '}', '...'];

  const type = ['i32', 'i64', 'f32', 'f64', 'bool'];

  const tokens = {
    whitespace: /[ \t]+/,
    comment: [{ match: /\/\/.*?$/ }, { match: /\/\*[^]*?\*\//, lineBreaks: true }],
    number: [{ match: /0[xX][0-9a-fA-F]+/ }, { match: /0[oO][0-9]+/ }, { match: /0[bB][01]+/ }, { match: /(?:[0-9]+(?:\.[0-9]+)?e-?[0-9]+)/ }, { match: /[0-9]+\.[0-9]+|[0-9]+/ }],
    char: [{ match: /'(?:\\['\\bfnrtv0]|[^'\\\n])'/, value: x => x.slice(1, -1) }],
    string: [{ match: /"(?:\\["\\rn]|[^"\\\n])*?"/, value: x => x.slice(1, -1) }, { match: /'(?:\\['\\bfnrtv0]|[^'\\\n])*?'/, value: x => x.slice(1, -1) }, { match: /`(?:\\['\\bfnrtv0]|[^'\\])*?`/, value: x => x.slice(1, -1) }],
    identifier: {
      match: /[A-Za-z_$][A-Za-z0-9_$]*/,
      keywords: { keyword, type }
    },
    punctuator,
    newline: { match: /(?:\r\n|\r|\n)/, lineBreaks: true }
  };

  // Main Program

  const Program = 'Program';
  const Keyword = 'Keyword';
  const Export = 'Export';
  const Import = 'Import';
  const Statement = 'Statement';
  const IfThenElse = 'IfThenElse';
  const Select = 'Select';
  const Else = 'Else';
  const UnaryExpression = 'UnaryExpression';
  const BinaryExpression = 'BinaryExpression';
  const TernaryExpression = 'TernaryExpression';
  const NumberLiteral = 'NumberLiteral';
  const StringLiteral = 'StringLiteral';
  const CharacterLiteral = 'CharacterLiteral';
  const Punctuator = 'Punctuator';
  const Identifier = 'Identifier';
  const ArraySubscript = 'ArraySubscript';
  const Constant = 'Constant';
  const Type = 'Type';
  const GenericType = 'GenericType';
  const UserType = 'UserType';
  const FunctionType = 'FunctionType';
  const Declaration = 'Declaration';
  const StaticDeclaration = 'StaticDeclaration';
  const StaticValueList = 'StaticValueList';
  const ImmutableDeclaration = 'ImmutableDeclaration';
  const FunctionDeclaration = 'FunctionDeclaration';
  const ArrayDeclaration = 'ArrayDeclaration';
  const IndirectFunctionCall = 'IndirectFunctionCall';
  const FunctionCall = 'FunctionCall';
  const Loop = 'Loop';
  const MemoryAssignment = 'MemoryAssignment';
  const Assignment = 'Assignment';
  const Param = 'Param';
  const Typedef = 'Typedef';
  const Struct = 'Struct';
  const ReturnStatement = 'ReturnStatement';
  const Sequence = 'Sequence';
  const ObjectLiteral = 'ObjectLiteral';
  const Pair = 'Pair';
  const TypeCast = 'TypeCast';
  const Break = 'Break';
  const Comment = 'Comment';
  const Sizeof = 'Sizeof';
  const Spread = 'Spread';
  const Closure = 'Closure';
  const Noop = 'Noop';
  const ClosureType = 'ClosureType';
  const Block = 'Block';
  const ObjectField = 'ObjectField';
  const FunctionIndex = 'FunctionIndex';
  const FunctionIdentifier = 'FunctionIdentifier';
  const FunctionPointer = 'FunctionPointer';
  const FunctionArguments = 'FunctionArguments';
  const FunctionResult = 'FunctionResult';
  const FunctionLocals = 'FunctionLocals';
  const NativeMethod = 'NativeMethod';
  const Unreachable = 'Unreachable';
  const Access = 'Access';

  const i32 = 'i32';
  const f32 = 'f32';
  const i64 = 'i64';
  const f64 = 'f64';
  const Memory = 'Memory';
  const Table = 'Table';
  const bool = 'bool';

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
    Block,
    Unreachable
  };

  var index = {
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
    StaticDeclaration,
    StaticValueList,
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
    Access,
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
    NativeMethod,
    Unreachable
  };

  exports.Program = Program;
  exports.Keyword = Keyword;
  exports.Export = Export;
  exports.Import = Import;
  exports.Statement = Statement;
  exports.IfThenElse = IfThenElse;
  exports.Select = Select;
  exports.Else = Else;
  exports.UnaryExpression = UnaryExpression;
  exports.BinaryExpression = BinaryExpression;
  exports.TernaryExpression = TernaryExpression;
  exports.NumberLiteral = NumberLiteral;
  exports.StringLiteral = StringLiteral;
  exports.CharacterLiteral = CharacterLiteral;
  exports.Punctuator = Punctuator;
  exports.Identifier = Identifier;
  exports.ArraySubscript = ArraySubscript;
  exports.Constant = Constant;
  exports.Type = Type;
  exports.GenericType = GenericType;
  exports.UserType = UserType;
  exports.FunctionType = FunctionType;
  exports.Declaration = Declaration;
  exports.StaticDeclaration = StaticDeclaration;
  exports.StaticValueList = StaticValueList;
  exports.ImmutableDeclaration = ImmutableDeclaration;
  exports.FunctionDeclaration = FunctionDeclaration;
  exports.ArrayDeclaration = ArrayDeclaration;
  exports.IndirectFunctionCall = IndirectFunctionCall;
  exports.FunctionCall = FunctionCall;
  exports.Loop = Loop;
  exports.MemoryAssignment = MemoryAssignment;
  exports.Assignment = Assignment;
  exports.Param = Param;
  exports.Typedef = Typedef;
  exports.Struct = Struct;
  exports.ReturnStatement = ReturnStatement;
  exports.Sequence = Sequence;
  exports.ObjectLiteral = ObjectLiteral;
  exports.Pair = Pair;
  exports.TypeCast = TypeCast;
  exports.Break = Break;
  exports.Comment = Comment;
  exports.Sizeof = Sizeof;
  exports.Spread = Spread;
  exports.Closure = Closure;
  exports.Noop = Noop;
  exports.ClosureType = ClosureType;
  exports.Block = Block;
  exports.ObjectField = ObjectField;
  exports.FunctionIndex = FunctionIndex;
  exports.FunctionIdentifier = FunctionIdentifier;
  exports.FunctionPointer = FunctionPointer;
  exports.FunctionArguments = FunctionArguments;
  exports.FunctionResult = FunctionResult;
  exports.FunctionLocals = FunctionLocals;
  exports.NativeMethod = NativeMethod;
  exports.Unreachable = Unreachable;
  exports.Access = Access;
  exports.i32 = i32;
  exports.f32 = f32;
  exports.i64 = i64;
  exports.f64 = f64;
  exports.Memory = Memory;
  exports.Table = Table;
  exports.bool = bool;
  exports.builtinTypes = builtinTypes;
  exports.statements = statements;
  exports.default = index;
  exports.tokens = tokens;

  Object.defineProperty(exports, '__esModule', { value: true });
});
});

var Syntax = unwrapExports(waltSyntax);
var waltSyntax_1 = waltSyntax.tokens;
var waltSyntax_2 = waltSyntax.semantics;
var waltSyntax_3 = waltSyntax.builtinTypes;
var waltSyntax_4 = waltSyntax.statements;
var waltSyntax_5 = waltSyntax.i32;
var waltSyntax_6 = waltSyntax.f32;
var waltSyntax_7 = waltSyntax.i64;
var waltSyntax_8 = waltSyntax.f64;

var moo = createCommonjsModule(function (module) {
(function (root, factory) {
  if (typeof undefined === 'function' && undefined.amd) {
    undefined([], factory); /* global define */
  } else if ('object' === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.moo = factory();
  }
})(commonjsGlobal, function () {
  var hasOwnProperty = Object.prototype.hasOwnProperty;

  // polyfill assign(), so we support IE9+
  var assign = typeof Object.assign === 'function' ? Object.assign :
  // https://tc39.github.io/ecma262/#sec-object.assign
  function (target, sources) {
    if (target == null) {
      throw new TypeError('Target cannot be null or undefined');
    }
    target = Object(target);

    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];
      if (source == null) continue;

      for (var key in source) {
        if (hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }
    return target;
  };

  var hasSticky = typeof new RegExp().sticky === 'boolean';

  /***************************************************************************/

  function isRegExp(o) {
    return o && o.constructor === RegExp;
  }
  function isObject(o) {
    return o && typeof o === 'object' && o.constructor !== RegExp && !Array.isArray(o);
  }

  function reEscape(s) {
    return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
  }
  function reGroups(s) {
    var re = new RegExp('|' + s);
    return re.exec('').length - 1;
  }
  function reCapture(s) {
    return '(' + s + ')';
  }
  function reUnion(regexps) {
    var source = regexps.map(function (s) {
      return "(?:" + s + ")";
    }).join('|');
    return "(?:" + source + ")";
  }

  function regexpOrLiteral(obj) {
    if (typeof obj === 'string') {
      return '(?:' + reEscape(obj) + ')';
    } else if (isRegExp(obj)) {
      // TODO: consider /u support
      if (obj.ignoreCase) {
        throw new Error('RegExp /i flag not allowed');
      }
      if (obj.global) {
        throw new Error('RegExp /g flag is implied');
      }
      if (obj.sticky) {
        throw new Error('RegExp /y flag is implied');
      }
      if (obj.multiline) {
        throw new Error('RegExp /m flag is implied');
      }
      return obj.source;
    } else {
      throw new Error('not a pattern: ' + obj);
    }
  }

  function objectToRules(object) {
    var keys = Object.getOwnPropertyNames(object);
    var result = [];
    for (var i = 0; i < keys.length; i++) {
      var key = keys[i];
      var thing = object[key];
      var rules = Array.isArray(thing) ? thing : [thing];
      var match = [];
      rules.forEach(function (rule) {
        if (isObject(rule)) {
          if (match.length) result.push(ruleOptions(key, match));
          result.push(ruleOptions(key, rule));
          match = [];
        } else {
          match.push(rule);
        }
      });
      if (match.length) result.push(ruleOptions(key, match));
    }
    return result;
  }

  function arrayToRules(array) {
    var result = [];
    for (var i = 0; i < array.length; i++) {
      var obj = array[i];
      if (!obj.name) {
        throw new Error('Rule has no name: ' + JSON.stringify(obj));
      }
      result.push(ruleOptions(obj.name, obj));
    }
    return result;
  }

  function ruleOptions(name, obj) {
    if (typeof obj !== 'object' || Array.isArray(obj) || isRegExp(obj)) {
      obj = { match: obj };
    }

    // nb. error implies lineBreaks
    var options = assign({
      tokenType: name,
      lineBreaks: !!obj.error,
      pop: false,
      next: null,
      push: null,
      error: false,
      value: null,
      getType: null
    }, obj);

    // convert to array
    var match = options.match;
    options.match = Array.isArray(match) ? match : match ? [match] : [];
    options.match.sort(function (a, b) {
      return isRegExp(a) && isRegExp(b) ? 0 : isRegExp(b) ? -1 : isRegExp(a) ? +1 : b.length - a.length;
    });
    if (options.keywords) {
      options.getType = keywordTransform(options.keywords);
    }
    return options;
  }

  function compileRules(rules, hasStates) {
    rules = Array.isArray(rules) ? arrayToRules(rules) : objectToRules(rules);

    var errorRule = null;
    var groups = [];
    var parts = [];
    for (var i = 0; i < rules.length; i++) {
      var options = rules[i];

      if (options.error) {
        if (errorRule) {
          throw new Error("Multiple error rules not allowed: (for token '" + options.tokenType + "')");
        }
        errorRule = options;
      }

      // skip rules with no match
      if (options.match.length === 0) {
        continue;
      }
      groups.push(options);

      // convert to RegExp
      var pat = reUnion(options.match.map(regexpOrLiteral));

      // validate
      var regexp = new RegExp(pat);
      if (regexp.test("")) {
        throw new Error("RegExp matches empty string: " + regexp);
      }
      var groupCount = reGroups(pat);
      if (groupCount > 0) {
        throw new Error("RegExp has capture groups: " + regexp + "\nUse (?: … ) instead");
      }
      if (!hasStates && (options.pop || options.push || options.next)) {
        throw new Error("State-switching options are not allowed in stateless lexers (for token '" + options.tokenType + "')");
      }

      // try and detect rules matching newlines
      if (!options.lineBreaks && regexp.test('\n')) {
        throw new Error('Rule should declare lineBreaks: ' + regexp);
      }

      // store regex
      parts.push(reCapture(pat));
    }

    var suffix = hasSticky ? '' : '|(?:)';
    var flags = hasSticky ? 'ym' : 'gm';
    var combined = new RegExp(reUnion(parts) + suffix, flags);

    return { regexp: combined, groups: groups, error: errorRule };
  }

  function compile(rules) {
    var result = compileRules(rules);
    return new Lexer({ start: result }, 'start');
  }

  function compileStates(states, start) {
    var keys = Object.getOwnPropertyNames(states);
    if (!start) start = keys[0];

    var map = Object.create(null);
    for (var i = 0; i < keys.length; i++) {
      var key = keys[i];
      map[key] = compileRules(states[key], true);
    }

    for (var i = 0; i < keys.length; i++) {
      var groups = map[keys[i]].groups;
      for (var j = 0; j < groups.length; j++) {
        var g = groups[j];
        var state = g && (g.push || g.next);
        if (state && !map[state]) {
          throw new Error("Missing state '" + state + "' (in token '" + g.tokenType + "' of state '" + keys[i] + "')");
        }
        if (g && g.pop && +g.pop !== 1) {
          throw new Error("pop must be 1 (in token '" + g.tokenType + "' of state '" + keys[i] + "')");
        }
      }
    }

    return new Lexer(map, start);
  }

  function keywordTransform(map) {
    var reverseMap = Object.create(null);
    var byLength = Object.create(null);
    var types = Object.getOwnPropertyNames(map);
    for (var i = 0; i < types.length; i++) {
      var tokenType = types[i];
      var item = map[tokenType];
      var keywordList = Array.isArray(item) ? item : [item];
      keywordList.forEach(function (keyword) {
        (byLength[keyword.length] = byLength[keyword.length] || []).push(keyword);
        if (typeof keyword !== 'string') {
          throw new Error("keyword must be string (in keyword '" + tokenType + "')");
        }
        reverseMap[keyword] = tokenType;
      });
    }

    // fast string lookup
    // https://jsperf.com/string-lookups
    function str(x) {
      return JSON.stringify(x);
    }
    var source = '';
    source += '(function(value) {\n';
    source += 'switch (value.length) {\n';
    for (var length in byLength) {
      var keywords = byLength[length];
      source += 'case ' + length + ':\n';
      source += 'switch (value) {\n';
      keywords.forEach(function (keyword) {
        var tokenType = reverseMap[keyword];
        source += 'case ' + str(keyword) + ': return ' + str(tokenType) + '\n';
      });
      source += '}\n';
    }
    source += '}\n';
    source += '})';
    return eval(source); // getType
  }

  /***************************************************************************/

  var Lexer = function (states, state) {
    this.startState = state;
    this.states = states;
    this.buffer = '';
    this.stack = [];
    this.reset();
  };

  Lexer.prototype.reset = function (data, info) {
    this.buffer = data || '';
    this.index = 0;
    this.line = info ? info.line : 1;
    this.col = info ? info.col : 1;
    this.setState(info ? info.state : this.startState);
    return this;
  };

  Lexer.prototype.save = function () {
    return {
      line: this.line,
      col: this.col,
      state: this.state
    };
  };

  Lexer.prototype.setState = function (state) {
    if (!state || this.state === state) return;
    this.state = state;
    var info = this.states[state];
    this.groups = info.groups;
    this.error = info.error || { lineBreaks: true, shouldThrow: true };
    this.re = info.regexp;
  };

  Lexer.prototype.popState = function () {
    this.setState(this.stack.pop());
  };

  Lexer.prototype.pushState = function (state) {
    this.stack.push(this.state);
    this.setState(state);
  };

  Lexer.prototype._eat = hasSticky ? function (re) {
    // assume re is /y
    return re.exec(this.buffer);
  } : function (re) {
    // assume re is /g
    var match = re.exec(this.buffer);
    // will always match, since we used the |(?:) trick
    if (match[0].length === 0) {
      return null;
    }
    return match;
  };

  Lexer.prototype._getGroup = function (match) {
    if (match === null) {
      return -1;
    }

    var groupCount = this.groups.length;
    for (var i = 0; i < groupCount; i++) {
      if (match[i + 1] !== undefined) {
        return i;
      }
    }
    throw new Error('oops');
  };

  function tokenToString() {
    return this.value;
  }

  Lexer.prototype.next = function () {
    var re = this.re;
    var buffer = this.buffer;

    var index = re.lastIndex = this.index;
    if (index === buffer.length) {
      return; // EOF
    }

    var match = this._eat(re);
    var i = this._getGroup(match);

    var group, text;
    if (i === -1) {
      group = this.error;

      // consume rest of buffer
      text = buffer.slice(index);
    } else {
      text = match[0];
      group = this.groups[i];
    }

    // count line breaks
    var lineBreaks = 0;
    if (group.lineBreaks) {
      var matchNL = /\n/g;
      var nl = 1;
      if (text === '\n') {
        lineBreaks = 1;
      } else {
        while (matchNL.exec(text)) {
          lineBreaks++;nl = matchNL.lastIndex;
        }
      }
    }

    var token = {
      type: group.getType && group.getType(text) || group.tokenType,
      value: group.value ? group.value(text) : text,
      text: text,
      toString: tokenToString,
      offset: index,
      lineBreaks: lineBreaks,
      line: this.line,
      col: this.col
      // nb. adding more props to token object will make V8 sad!

    };var size = text.length;
    this.index += size;
    this.line += lineBreaks;
    if (lineBreaks !== 0) {
      this.col = size - nl + 1;
    } else {
      this.col += size;
    }
    // throw, if no rule with {error: true}
    if (group.shouldThrow) {
      throw new Error(this.formatError(token, "invalid syntax"));
    }

    if (group.pop) this.popState();else if (group.push) this.pushState(group.push);else if (group.next) this.setState(group.next);
    return token;
  };

  if (typeof Symbol !== 'undefined' && Symbol.iterator) {
    var LexerIterator = function (lexer) {
      this.lexer = lexer;
    };

    LexerIterator.prototype.next = function () {
      var token = this.lexer.next();
      return { value: token, done: !token };
    };

    LexerIterator.prototype[Symbol.iterator] = function () {
      return this;
    };

    Lexer.prototype[Symbol.iterator] = function () {
      return new LexerIterator(this);
    };
  }

  Lexer.prototype.formatError = function (token, message) {
    var value = token.value;
    var index = token.offset;
    var eol = token.lineBreaks ? value.indexOf('\n') : value.length;
    var start = Math.max(0, index - token.col + 1);
    var firstLine = this.buffer.substring(start, index + eol);
    message += " at line " + token.line + " col " + token.col + ":\n\n";
    message += "  " + firstLine + "\n";
    message += "  " + Array(token.col).join(" ") + "^";
    return message;
  };

  Lexer.prototype.clone = function () {
    return new Lexer(this.states, this.state);
  };

  Lexer.prototype.has = function (tokenType) {
    for (var s in this.states) {
      var groups = this.states[s].groups;
      for (var i = 0; i < groups.length; i++) {
        var group = groups[i];
        if (group.tokenType === tokenType) return true;
        if (group.keywords && hasOwnProperty.call(group.keywords, tokenType)) {
          return true;
        }
      }
    }
    return false;
  };

  return {
    compile: compile,
    states: compileStates,
    error: Object.freeze({ error: true })
  };
});
});

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

var curry_1 = curry;

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

// Custom Walt Grammar Generator
function id(x) {
  return x[0];
}

function grammar() {

  const lexer = this.lexer;
  const Syntax = this.Syntax;
  const { drop, nth, nuller, nonEmpty, add, flatten, compose } = this.helpers;
  const {
    node,
    binary,
    constant,
    identifier,
    statement,
    unary,
    ternary,
    subscript,
    access,
    fun,
    declaration,
    call,
    struct,
    result,
    string,
    char,
    typedef,
    voidFun,
    type,
    assignment,
    forLoop,
    whileLoop,
    typeGeneric,
    spread,
    builtinDecl
  } = this.nodes(lexer);

  return {
    Lexer: lexer,
    ParserRules: [{ "name": "_$ebnf$1", "symbols": [] }, { "name": "_$ebnf$1", "symbols": ["_$ebnf$1", "wschar"], "postprocess": function arrpush(d) {
        return d[0].concat([d[1]]);
      } }, { "name": "_", "symbols": ["_$ebnf$1"], "postprocess": function (d) {
        return null;
      } }, { "name": "__$ebnf$1", "symbols": ["wschar"] }, { "name": "__$ebnf$1", "symbols": ["__$ebnf$1", "wschar"], "postprocess": function arrpush(d) {
        return d[0].concat([d[1]]);
      } }, { "name": "__", "symbols": ["__$ebnf$1"], "postprocess": function (d) {
        return null;
      } }, { "name": "wschar", "symbols": [/[ \t\n\v\f]/], "postprocess": id }, { "name": "StaticObjectLiteral", "symbols": ["LCB", "_", "RCB"], "postprocess": compose(node(Syntax.ObjectLiteral)) }, { "name": "StaticObjectLiteral", "symbols": ["LCB", "_", "StaticPropertyList", "_", "RCB"], "postprocess": compose(node(Syntax.ObjectLiteral), flatten) }, { "name": "StaticPropertyValue", "symbols": ["Number"], "postprocess": id }, { "name": "StaticPropertyValue", "symbols": ["Boolean"], "postprocess": id }, { "name": "StaticPropertyValue", "symbols": ["StringLiteral"], "postprocess": id }, { "name": "StaticProperty", "symbols": ["Identifier", "_", "COLON", "_", "StaticPropertyValue"], "postprocess": node(Syntax.Pair) }, { "name": "StaticPropertyList", "symbols": ["StaticProperty"], "postprocess": id }, { "name": "StaticPropertyList", "symbols": ["StaticProperty", "_", "COMMA", "_", "StaticPropertyList"], "postprocess": flatten }, { "name": "ObjectLiteral", "symbols": ["LCB", "_", "RCB"], "postprocess": node(Syntax.ObjectLiteral) }, { "name": "ObjectLiteral", "symbols": ["LCB", "_", "PropertyList", "_", "RCB"], "postprocess": compose(node(Syntax.ObjectLiteral), flatten) }, { "name": "PropertyList", "symbols": ["Property"], "postprocess": id }, { "name": "PropertyList", "symbols": ["Property", "_", "COMMA", "_", "PropertyList"], "postprocess": flatten }, { "name": "Property", "symbols": ["Identifier", "_", "COLON", "_", "Ternary"], "postprocess": node(Syntax.Pair) }, { "name": "Property", "symbols": ["SPREAD", "Identifier"], "postprocess": spread }, { "name": "Property", "symbols": ["Identifier"], "postprocess": id }, { "name": "StructDefinition", "symbols": ["LCB", "_", "PropertyNameAndTypeList", "_", "RCB"], "postprocess": compose(node(Syntax.ObjectLiteral), flatten) }, { "name": "PropertyNameAndTypeList", "symbols": ["PropertyNameAndType"], "postprocess": id }, { "name": "PropertyNameAndTypeList", "symbols": ["PropertyNameAndType", "_", "COMMA", "_", "PropertyNameAndTypeList"], "postprocess": flatten }, { "name": "PropertyNameAndType", "symbols": ["PropertyName", "_", "COLON", "_", "Type"], "postprocess": node(Syntax.Pair) }, { "name": "TypeDefinition", "symbols": ["LB", "_", "TypeList", "_", "RB"], "postprocess": flatten }, { "name": "TypeDefinition", "symbols": ["LB", "_", "RB"], "postprocess": flatten }, { "name": "TypeList", "symbols": ["Type"], "postprocess": id }, { "name": "TypeList", "symbols": ["Type", "_", "COMMA", "_", "TypeList"], "postprocess": flatten }, { "name": "PropertyName", "symbols": ["Identifier"], "postprocess": id }, { "name": "Import", "symbols": ["IMPORT", "_", "ImportDefinition", "__", "FROM", "__", "StringLiteral", "_", "SEPARATOR"], "postprocess": node(Syntax.Import) }, { "name": "ImportDefinition", "symbols": ["LCB", "_", "ImportAndTypeList", "_", "RCB"], "postprocess": compose(node(Syntax.ObjectLiteral), flatten) }, { "name": "ImportAndTypeList", "symbols": ["ImportName"], "postprocess": id }, { "name": "ImportAndTypeList", "symbols": ["ImportAndType"], "postprocess": id }, { "name": "ImportAndTypeList", "symbols": ["ImportName", "_", "COMMA", "_", "ImportAndTypeList"], "postprocess": flatten }, { "name": "ImportAndTypeList", "symbols": ["ImportAndType", "_", "COMMA", "_", "ImportAndTypeList"], "postprocess": flatten }, { "name": "ImportAndType", "symbols": ["ImportName", "_", "COLON", "_", "Type"], "postprocess": node(Syntax.Pair) }, { "name": "ImportAndType", "symbols": ["ImportName", "_", "AS", "_", "Identifier"], "postprocess": node(Syntax.BinaryExpression, { value: 'as' }) }, { "name": "ImportAndType", "symbols": ["ImportAndType", "_", "AS", "_", "Identifier"], "postprocess": node(Syntax.BinaryExpression, { value: 'as' }) }, { "name": "ImportName", "symbols": ["Identifier"], "postprocess": id }, { "name": "If", "symbols": ["IF", "_", "LB", "_", "Expression", "_", "RB", "_", "BranchBody"], "postprocess": node(Syntax.IfThenElse) }, { "name": "If", "symbols": ["IF", "_", "LB", "_", "Expression", "_", "RB", "_", "BranchBody", "_", "Else"], "postprocess": node(Syntax.IfThenElse) }, { "name": "Else", "symbols": ["ELSE", "_", "BranchBody"], "postprocess": node(Syntax.Else) }, { "name": "BranchBody", "symbols": ["Statement"], "postprocess": id }, { "name": "BranchBody", "symbols": ["Block"], "postprocess": id }, { "name": "For", "symbols": ["FOR", "_", "LB", "_", "LoopArgument", "_", "SEPARATOR", "_", "Expression", "_", "SEPARATOR", "_", "LoopArgument", "_", "RB", "_", "BranchBody"], "postprocess": forLoop }, { "name": "LoopArgument", "symbols": ["Expression"], "postprocess": id }, { "name": "LoopArgument", "symbols": ["AssignmentExpression"], "postprocess": id }, { "name": "While", "symbols": ["WHILE", "_", "LB", "_", "Expression", "_", "RB", "_", "BranchBody"], "postprocess": whileLoop }, { "name": "Break", "symbols": ["BREAK", "_", "SEPARATOR"], "postprocess": node(Syntax.Break) }, { "name": "Program", "symbols": ["_"], "postprocess": compose(node('Program', { value: 'ROOT_NODE' }), flatten) }, { "name": "Program", "symbols": ["_", "SourceElementList", "_"], "postprocess": compose(node('Program', { value: 'ROOT_NODE' }), flatten) }, { "name": "SourceElementList", "symbols": ["SourceElement"], "postprocess": flatten }, { "name": "SourceElementList", "symbols": ["SourceElement", "_", "SourceElementList"], "postprocess": compose(drop, flatten, flatten) }, { "name": "SourceElement", "symbols": ["Function"], "postprocess": id }, { "name": "SourceElement", "symbols": ["GlobalDeclaration"], "postprocess": id }, { "name": "SourceElement", "symbols": ["GlobalImmutableDeclaration"], "postprocess": id }, { "name": "SourceElement", "symbols": ["StaticDeclaration"], "postprocess": id }, { "name": "SourceElement", "symbols": ["Struct"], "postprocess": id }, { "name": "SourceElement", "symbols": ["TypeDef"], "postprocess": id }, { "name": "SourceElement", "symbols": ["Export"], "postprocess": id }, { "name": "SourceElement", "symbols": ["Import"], "postprocess": id }, { "name": "Statement", "symbols": ["ExpressionStatement"], "postprocess": id }, { "name": "Statement", "symbols": ["Declaration"], "postprocess": id }, { "name": "Statement", "symbols": ["ImmutableDeclaration"], "postprocess": id }, { "name": "Statement", "symbols": ["Assignment"], "postprocess": id }, { "name": "Statement", "symbols": ["If"], "postprocess": id }, { "name": "Statement", "symbols": ["For"], "postprocess": id }, { "name": "Statement", "symbols": ["While"], "postprocess": id }, { "name": "Statement", "symbols": ["Break"], "postprocess": id }, { "name": "Statement", "symbols": ["Unreachable"], "postprocess": id }, { "name": "Statement", "symbols": ["ReturnStatement"], "postprocess": id }, { "name": "Block", "symbols": ["LCB", "_", "RCB"], "postprocess": node(Syntax.Block) }, { "name": "Block", "symbols": ["LCB", "_", "StatementList", "_", "RCB"], "postprocess": compose(node(Syntax.Block), flatten) }, { "name": "StatementList", "symbols": ["Statement"], "postprocess": drop }, { "name": "StatementList", "symbols": ["Statement", "_", "StatementList"], "postprocess": flatten }, { "name": "Function", "symbols": ["FUNCTION", "__", "Identifier", "_", "FunctionParameters", "_", "Block"], "postprocess": voidFun }, { "name": "Function", "symbols": ["FUNCTION", "__", "Identifier", "_", "FunctionParameters", "_", "FunctionResult", "_", "Block"], "postprocess": fun }, { "name": "FunctionParameters", "symbols": ["LB", "_", "RB"], "postprocess": node(Syntax.FunctionArguments) }, { "name": "FunctionParameters", "symbols": ["LB", "_", "ParameterList", "_", "RB"], "postprocess": compose(node(Syntax.FunctionArguments), flatten, flatten) }, { "name": "ParameterList", "symbols": ["PropertyNameAndType"], "postprocess": id }, { "name": "ParameterList", "symbols": ["PropertyNameAndType", "_", "COMMA", "_", "ParameterList"], "postprocess": flatten }, { "name": "FunctionResult", "symbols": ["COLON", "_", "Type"], "postprocess": compose(result, drop) }, { "name": "GlobalDeclaration", "symbols": ["LET", "_", "PropertyNameAndType", "_", "SEPARATOR"], "postprocess": declaration(Syntax.Declaration) }, { "name": "GlobalDeclaration", "symbols": ["LET", "_", "PropertyNameAndType", "_", "EQUALS", "_", "Atom", "_", "SEPARATOR"], "postprocess": declaration(Syntax.Declaration) }, { "name": "GlobalImmutableDeclaration", "symbols": ["CONST", "_", "Identifier", "_", "COLON", "_", "GenericType", "_", "SEPARATOR"], "postprocess": builtinDecl }, { "name": "GlobalImmutableDeclaration", "symbols": ["CONST", "_", "PropertyNameAndType", "_", "EQUALS", "_", "ObjectLiteral", "_", "SEPARATOR"], "postprocess": declaration(Syntax.ImmutableDeclaration) }, { "name": "GlobalImmutableDeclaration", "symbols": ["CONST", "_", "PropertyNameAndType", "_", "EQUALS", "_", "Atom", "_", "SEPARATOR"], "postprocess": declaration(Syntax.ImmutableDeclaration) }, { "name": "Declaration", "symbols": ["LET", "_", "PropertyNameAndType", "_", "EQUALS", "_", "ExpressionStatement"], "postprocess": declaration(Syntax.Declaration) }, { "name": "Declaration", "symbols": ["LET", "_", "PropertyNameAndType", "_", "SEPARATOR"], "postprocess": declaration(Syntax.Declaration) }, { "name": "ImmutableDeclaration", "symbols": ["CONST", "_", "PropertyNameAndType", "_", "EQUALS", "_", "ExpressionStatement"], "postprocess": declaration(Syntax.ImmutableDeclaration) }, { "name": "ImmutableDeclaration", "symbols": ["CONST", "_", "PropertyNameAndType", "_", "EQUALS", "_", "ObjectLiteral", "_", "SEPARATOR"], "postprocess": declaration(Syntax.ImmutableDeclaration) }, { "name": "ImmutableDeclaration", "symbols": ["CONST", "_", "Identifier", "_", "COLON", "_", "GenericType", "_", "SEPARATOR"], "postprocess": builtinDecl }, { "name": "StaticNameAndType", "symbols": ["Identifier", "_", "COLON", "_", "ArrayType"], "postprocess": node(Syntax.Pair) }, { "name": "StaticDeclaration", "symbols": ["CONST", "_", "StaticNameAndType", "_", "EQUALS", "_", "LSB", "_", "RSB", "_", "SEPARATOR"], "postprocess": declaration(Syntax.StaticDeclaration) }, { "name": "StaticDeclaration", "symbols": ["CONST", "_", "StaticNameAndType", "_", "EQUALS", "_", "LSB", "_", "StaticValueList", "_", "RSB", "_", "SEPARATOR"], "postprocess": compose(declaration(Syntax.StaticDeclaration), flatten) }, { "name": "StaticValueList", "symbols": ["Atom"], "postprocess": id }, { "name": "StaticValueList", "symbols": ["Atom", "_", "COMMA", "_", "StaticValueList"], "postprocess": flatten }, { "name": "Unreachable", "symbols": ["THROW", "_", "SEPARATOR"], "postprocess": node(Syntax.Unreachable) }, { "name": "Unreachable", "symbols": ["THROW", "_", "Expression", "_", "SEPARATOR"], "postprocess": node(Syntax.Unreachable) }, { "name": "Pair", "symbols": ["Identifier", "_", "COLON", "_", "Identifier"], "postprocess": node(Syntax.Pair) }, { "name": "Export", "symbols": ["EXPORT", "__", "ImmutableDeclaration"], "postprocess": node(Syntax.Export, { value: 'export' }) }, { "name": "Export", "symbols": ["EXPORT", "__", "Function"], "postprocess": node(Syntax.Export, { value: 'export' }) }, { "name": "Export", "symbols": ["EXPORT", "__", "TypeDef"], "postprocess": node(Syntax.Export, { value: 'export' }) }, { "name": "Export", "symbols": ["EXPORT", "__", "Struct"], "postprocess": node(Syntax.Export, { value: 'export' }) }, { "name": "ReturnStatement", "symbols": ["RETURN", "__", "Expression", "_", "SEPARATOR"], "postprocess": node(Syntax.ReturnStatement) }, { "name": "ReturnStatement$subexpression$1", "symbols": [{ "literal": ";" }], "postprocess": nuller }, { "name": "ReturnStatement", "symbols": ["RETURN", "ReturnStatement$subexpression$1"], "postprocess": node(Syntax.ReturnStatement) }, { "name": "Struct", "symbols": ["TYPE", "__", "Identifier", "_", "EQUALS", "_", "StructDefinition", "SEPARATOR"], "postprocess": struct }, { "name": "TypeDef", "symbols": ["TYPE", "__", "Identifier", "_", "EQUALS", "_", "TypeDefinition", "_", "FATARROW", "_", "Type", "_", "SEPARATOR"], "postprocess": compose(typedef) }, { "name": "Assignment", "symbols": ["AssignmentExpression", "_", "SEPARATOR"], "postprocess": id }, { "name": "AssignmentExpression", "symbols": ["Access", "_", "EQUALS", "_", "Expression"], "postprocess": d => assignment(d, '=') }, { "name": "AssignmentExpression", "symbols": ["Access", "_", "PLSEQUALS", "_", "Expression"], "postprocess": d => assignment(d, '+=') }, { "name": "AssignmentExpression", "symbols": ["Access", "_", "MINEQUALS", "_", "Expression"], "postprocess": d => assignment(d, '-=') }, { "name": "AssignmentExpression", "symbols": ["Access", "_", "EQUALS", "_", "ObjectLiteral"], "postprocess": d => assignment(d, '=') }, { "name": "ExpressionStatement", "symbols": ["Expression", "SEPARATOR"], "postprocess": id }, { "name": "Expression", "symbols": ["Ternary"], "postprocess": id }, { "name": "Ternary", "symbols": ["Ternary", "_", "QUESTION", "_", "TernaryPair"], "postprocess": ternary }, { "name": "Ternary", "symbols": ["Binary"], "postprocess": id }, { "name": "TernaryPair", "symbols": ["Expression", "_", "COLON", "_", "Expression"], "postprocess": node(Syntax.Pair) }, { "name": "Binary", "symbols": ["Logical"], "postprocess": id }, { "name": "Logical", "symbols": ["Logical", "_", { "literal": "||" }, "_", "Bitwise"], "postprocess": binary }, { "name": "Logical", "symbols": ["Logical", "_", { "literal": "&&" }, "_", "Bitwise"], "postprocess": binary }, { "name": "Logical", "symbols": ["Bitwise"], "postprocess": id }, { "name": "Bitwise", "symbols": ["Bitwise", "_", { "literal": "|" }, "_", "Sum"], "postprocess": binary }, { "name": "Bitwise", "symbols": ["Bitwise", "_", { "literal": "^" }, "_", "Sum"], "postprocess": binary }, { "name": "Bitwise", "symbols": ["Bitwise", "_", { "literal": "&" }, "_", "Sum"], "postprocess": binary }, { "name": "Bitwise", "symbols": ["Equality"], "postprocess": id }, { "name": "Equality", "symbols": ["Equality", "_", { "literal": "==" }, "_", "Comparison"], "postprocess": binary }, { "name": "Equality", "symbols": ["Equality", "_", { "literal": "!=" }, "_", "Comparison"], "postprocess": binary }, { "name": "Equality", "symbols": ["Comparison"], "postprocess": id }, { "name": "Comparison", "symbols": ["Comparison", "_", { "literal": "<" }, "_", "Shift"], "postprocess": binary }, { "name": "Comparison", "symbols": ["Comparison", "_", { "literal": ">" }, "_", "Shift"], "postprocess": binary }, { "name": "Comparison", "symbols": ["Comparison", "_", { "literal": "<=" }, "_", "Shift"], "postprocess": binary }, { "name": "Comparison", "symbols": ["Comparison", "_", { "literal": ">=" }, "_", "Shift"], "postprocess": binary }, { "name": "Comparison", "symbols": ["Shift"], "postprocess": id }, { "name": "Shift", "symbols": ["Shift", "_", { "literal": ">>" }, "_", "Sum"], "postprocess": binary }, { "name": "Shift", "symbols": ["Shift", "_", { "literal": "<<" }, "_", "Sum"], "postprocess": binary }, { "name": "Shift", "symbols": ["Shift", "_", { "literal": ">>>" }, "_", "Sum"], "postprocess": binary }, { "name": "Shift", "symbols": ["Sum"], "postprocess": id }, { "name": "Sum", "symbols": ["Sum", "_", { "literal": "+" }, "_", "Product"], "postprocess": binary }, { "name": "Sum", "symbols": ["Sum", "_", { "literal": "-" }, "_", "Product"], "postprocess": binary }, { "name": "Sum", "symbols": ["Product"], "postprocess": id }, { "name": "Product", "symbols": ["Product", "_", { "literal": "*" }, "_", "Typecast"], "postprocess": binary }, { "name": "Product", "symbols": ["Product", "_", { "literal": "/" }, "_", "Typecast"], "postprocess": binary }, { "name": "Product", "symbols": ["Product", "_", { "literal": "%" }, "_", "Typecast"], "postprocess": binary }, { "name": "Product", "symbols": ["Typecast"], "postprocess": id }, { "name": "Typecast", "symbols": ["Expression", "_", "COLON", "_", "Type"], "postprocess": node(Syntax.Pair) }, { "name": "Typecast", "symbols": ["Expression", "_", "AS", "_", "Type"], "postprocess": node(Syntax.Pair) }, { "name": "Typecast", "symbols": ["Unary"], "postprocess": id }, { "name": "Unary", "symbols": [{ "literal": "!" }, "Call"], "postprocess": unary }, { "name": "Unary", "symbols": [{ "literal": "~" }, "Call"], "postprocess": unary }, { "name": "Unary", "symbols": [{ "literal": "-" }, "Call"], "postprocess": unary }, { "name": "Unary", "symbols": [{ "literal": "+" }, "Call"], "postprocess": unary }, { "name": "Unary", "symbols": [{ "literal": "++" }, "Call"], "postprocess": unary }, { "name": "Unary", "symbols": [{ "literal": "--" }, "Call"], "postprocess": unary }, { "name": "Unary", "symbols": ["Call"], "postprocess": id }, { "name": "Call", "symbols": ["Access", "_", "LB", "_", "ArgumentList", "_", "RB"], "postprocess": compose(call, flatten) }, { "name": "Call", "symbols": ["Access", "_", "LB", "_", "RB"], "postprocess": call }, { "name": "Call", "symbols": ["Access"], "postprocess": id }, { "name": "ArgumentList", "symbols": ["Expression"], "postprocess": id }, { "name": "ArgumentList", "symbols": ["NativeType"], "postprocess": id }, { "name": "ArgumentList", "symbols": ["Expression", "_", "COMMA", "_", "ArgumentList"], "postprocess": flatten }, { "name": "Access", "symbols": ["Identifier", "DOT", "Identifier"], "postprocess": access }, { "name": "Access", "symbols": ["NativeType", "DOT", "Identifier"], "postprocess": access }, { "name": "Access", "symbols": ["Access", "LSB", "_", "Ternary", "_", "RSB"], "postprocess": subscript }, { "name": "Access", "symbols": ["Grouping"], "postprocess": id }, { "name": "Grouping", "symbols": ["LB", "_", "Expression", "_", "RB"], "postprocess": nth(2) }, { "name": "Grouping", "symbols": ["Atom"], "postprocess": id }, { "name": "Atom", "symbols": ["Identifier"], "postprocess": id }, { "name": "Atom", "symbols": ["StringLiteral"], "postprocess": id }, { "name": "Atom", "symbols": ["CharacterLiteral"], "postprocess": id }, { "name": "Atom", "symbols": ["Number"], "postprocess": id }, { "name": "_Type", "symbols": ["NativeType"], "postprocess": id }, { "name": "_Type", "symbols": ["GenericType"], "postprocess": id }, { "name": "_Type", "symbols": ["Identifier"], "postprocess": id }, { "name": "ArrayType", "symbols": ["_Type", "_", "LSB", "_", "RSB"], "postprocess": d => _extends({}, d[0], { value: d[0].value + "[]", type: d[0].type + "[]" }) }, { "name": "Type", "symbols": ["_Type"], "postprocess": id }, { "name": "Type", "symbols": ["ArrayType"], "postprocess": id }, { "name": "NativeType", "symbols": [lexer.has("type") ? { type: "type" } : type], "postprocess": type }, { "name": "GenericType", "symbols": ["Identifier", "LT", "_", "StaticObjectLiteral", "_", "GT"], "postprocess": typeGeneric }, { "name": "Identifier", "symbols": [lexer.has("identifier") ? { type: "identifier" } : identifier], "postprocess": identifier }, { "name": "Number", "symbols": [lexer.has("number") ? { type: "number" } : number], "postprocess": constant }, { "name": "StringLiteral", "symbols": [lexer.has("string") ? { type: "string" } : string], "postprocess": string }, { "name": "CharacterLiteral", "symbols": [lexer.has("char") ? { type: "char" } : char], "postprocess": char }, { "name": "word", "symbols": [/[a-zA-Z_]/], "postprocess": id }, { "name": "word", "symbols": ["word", /[a-zA-Z0-9_]/], "postprocess": add }, { "name": "digit", "symbols": [/[0-9]/], "postprocess": id }, { "name": "digit", "symbols": ["digit", /[0-9]/], "postprocess": add }, { "name": "SEPARATOR", "symbols": ["_", { "literal": ";" }], "postprocess": nuller }, { "name": "QUESTION", "symbols": [{ "literal": "?" }], "postprocess": nuller }, { "name": "COMMA", "symbols": [{ "literal": "," }], "postprocess": nuller }, { "name": "DOT", "symbols": [{ "literal": "." }], "postprocess": nuller }, { "name": "LB", "symbols": [{ "literal": "(" }], "postprocess": nuller }, { "name": "RB", "symbols": [{ "literal": ")" }], "postprocess": nuller }, { "name": "LSB", "symbols": [{ "literal": "[" }], "postprocess": nuller }, { "name": "RSB", "symbols": [{ "literal": "]" }], "postprocess": nuller }, { "name": "LCB", "symbols": [{ "literal": "{" }], "postprocess": nuller }, { "name": "RCB", "symbols": [{ "literal": "}" }], "postprocess": nuller }, { "name": "COLON", "symbols": [{ "literal": ":" }], "postprocess": nuller }, { "name": "EQUALS", "symbols": [{ "literal": "=" }], "postprocess": nuller }, { "name": "PLSEQUALS", "symbols": [{ "literal": "+=" }], "postprocess": nuller }, { "name": "MINEQUALS", "symbols": [{ "literal": "-=" }], "postprocess": nuller }, { "name": "GT", "symbols": [{ "literal": ">" }], "postprocess": nuller }, { "name": "LT", "symbols": [{ "literal": "<" }], "postprocess": nuller }, { "name": "FATARROW", "symbols": [{ "literal": "=>" }], "postprocess": nuller }, { "name": "SPREAD", "symbols": [{ "literal": "..." }], "postprocess": nuller }, { "name": "FUNCTION", "symbols": [{ "literal": "function" }], "postprocess": nuller }, { "name": "LET", "symbols": [{ "literal": "let" }], "postprocess": nuller }, { "name": "CONST", "symbols": [{ "literal": "const" }], "postprocess": nuller }, { "name": "EXPORT", "symbols": [{ "literal": "export" }], "postprocess": nuller }, { "name": "IMPORT", "symbols": [{ "literal": "import" }], "postprocess": nuller }, { "name": "AS", "symbols": [{ "literal": "as" }], "postprocess": nuller }, { "name": "FROM", "symbols": [{ "literal": "from" }], "postprocess": nuller }, { "name": "RETURN", "symbols": [{ "literal": "return" }], "postprocess": nuller }, { "name": "TYPE", "symbols": [{ "literal": "type" }], "postprocess": nuller }, { "name": "IF", "symbols": [{ "literal": "if" }], "postprocess": nuller }, { "name": "ELSE", "symbols": [{ "literal": "else" }], "postprocess": nuller }, { "name": "FOR", "symbols": [{ "literal": "for" }], "postprocess": nuller }, { "name": "WHILE", "symbols": [{ "literal": "while" }], "postprocess": nuller }, { "name": "SWITCH", "symbols": [{ "literal": "switch" }], "postprocess": nuller }, { "name": "DO", "symbols": [{ "literal": "do" }], "postprocess": nuller }, { "name": "THROW", "symbols": [{ "literal": "throw" }], "postprocess": nuller }, { "name": "BREAK", "symbols": [{ "literal": "break" }], "postprocess": nuller }],
    ParserStart: "Program"
  };
}

// Custom Walt Grammar Generator
function id$1(x) {
  return x[0];
}

function grammar$1() {

  const Syntax = this.Syntax;
  const { flatten } = this.helpers;
  const { node } = this.nodes(this.lexer);

  return {
    Lexer: undefined,
    ParserRules: [{ "name": "TypeList", "symbols": ["DefaultArgument"], "postprocess": id$1 }, { "name": "TypeList", "symbols": ["DefaultArgument", "_", "COMMA", "_", "TypeList"], "postprocess": flatten }, { "name": "DefaultArgument", "symbols": ["Type", "_", "EQUALS", "_", "Atom"], "postprocess": node(Syntax.Assignment) }, { "name": "ParameterList", "symbols": ["DefaultFunctionArgument"], "postprocess": id$1 }, { "name": "ParameterList", "symbols": ["DefaultFunctionArgument", "_", "COMMA", "_", "ParameterList"], "postprocess": flatten }, { "name": "DefaultFunctionArgument", "symbols": ["PropertyNameAndType", "_", "EQUALS", "_", "Atom"], "postprocess": node(Syntax.Assignment) }],
    ParserStart: "TypeList"
  };
}

var nearley = createCommonjsModule(function (module) {
(function (root, factory) {
    if ('object' === 'object' && module.exports) {
        module.exports = factory();
    } else {
        root.nearley = factory();
    }
})(commonjsGlobal, function () {

    function Rule(name, symbols, postprocess) {
        this.id = ++Rule.highestId;
        this.name = name;
        this.symbols = symbols; // a list of literal | regex class | nonterminal
        this.postprocess = postprocess;
        return this;
    }
    Rule.highestId = 0;

    Rule.prototype.toString = function (withCursorAt) {
        function stringifySymbolSequence(e) {
            return e.literal ? JSON.stringify(e.literal) : e.type ? '%' + e.type : e.toString();
        }
        var symbolSequence = typeof withCursorAt === "undefined" ? this.symbols.map(stringifySymbolSequence).join(' ') : this.symbols.slice(0, withCursorAt).map(stringifySymbolSequence).join(' ') + " ● " + this.symbols.slice(withCursorAt).map(stringifySymbolSequence).join(' ');
        return this.name + " → " + symbolSequence;
    };

    // a State is a rule at a position from a given starting point in the input stream (reference)
    function State(rule, dot, reference, wantedBy) {
        this.rule = rule;
        this.dot = dot;
        this.reference = reference;
        this.data = [];
        this.wantedBy = wantedBy;
        this.isComplete = this.dot === rule.symbols.length;
    }

    State.prototype.toString = function () {
        return "{" + this.rule.toString(this.dot) + "}, from: " + (this.reference || 0);
    };

    State.prototype.nextState = function (child) {
        var state = new State(this.rule, this.dot + 1, this.reference, this.wantedBy);
        state.left = this;
        state.right = child;
        if (state.isComplete) {
            state.data = state.build();
        }
        return state;
    };

    State.prototype.build = function () {
        var children = [];
        var node = this;
        do {
            children.push(node.right.data);
            node = node.left;
        } while (node.left);
        children.reverse();
        return children;
    };

    State.prototype.finish = function () {
        if (this.rule.postprocess) {
            this.data = this.rule.postprocess(this.data, this.reference, Parser.fail);
        }
    };

    function Column(grammar, index) {
        this.grammar = grammar;
        this.index = index;
        this.states = [];
        this.wants = {}; // states indexed by the non-terminal they expect
        this.scannable = []; // list of states that expect a token
        this.completed = {}; // states that are nullable
    }

    Column.prototype.process = function (nextColumn) {
        var states = this.states;
        var wants = this.wants;
        var completed = this.completed;

        for (var w = 0; w < states.length; w++) {
            // nb. we push() during iteration
            var state = states[w];

            if (state.isComplete) {
                state.finish();
                if (state.data !== Parser.fail) {
                    // complete
                    var wantedBy = state.wantedBy;
                    for (var i = wantedBy.length; i--;) {
                        // this line is hot
                        var left = wantedBy[i];
                        this.complete(left, state);
                    }

                    // special-case nullables
                    if (state.reference === this.index) {
                        // make sure future predictors of this rule get completed.
                        var exp = state.rule.name;
                        (this.completed[exp] = this.completed[exp] || []).push(state);
                    }
                }
            } else {
                // queue scannable states
                var exp = state.rule.symbols[state.dot];
                if (typeof exp !== 'string') {
                    this.scannable.push(state);
                    continue;
                }

                // predict
                if (wants[exp]) {
                    wants[exp].push(state);

                    if (completed.hasOwnProperty(exp)) {
                        var nulls = completed[exp];
                        for (var i = 0; i < nulls.length; i++) {
                            var right = nulls[i];
                            this.complete(state, right);
                        }
                    }
                } else {
                    wants[exp] = [state];
                    this.predict(exp);
                }
            }
        }
    };

    Column.prototype.predict = function (exp) {
        var rules = this.grammar.byName[exp] || [];

        for (var i = 0; i < rules.length; i++) {
            var r = rules[i];
            var wantedBy = this.wants[exp];
            var s = new State(r, 0, this.index, wantedBy);
            this.states.push(s);
        }
    };

    Column.prototype.complete = function (left, right) {
        var copy = left.nextState(right);
        this.states.push(copy);
    };

    function Grammar(rules, start) {
        this.rules = rules;
        this.start = start || this.rules[0].name;
        var byName = this.byName = {};
        this.rules.forEach(function (rule) {
            if (!byName.hasOwnProperty(rule.name)) {
                byName[rule.name] = [];
            }
            byName[rule.name].push(rule);
        });
    }

    // So we can allow passing (rules, start) directly to Parser for backwards compatibility
    Grammar.fromCompiled = function (rules, start) {
        var lexer = rules.Lexer;
        if (rules.ParserStart) {
            start = rules.ParserStart;
            rules = rules.ParserRules;
        }
        var rules = rules.map(function (r) {
            return new Rule(r.name, r.symbols, r.postprocess);
        });
        var g = new Grammar(rules, start);
        g.lexer = lexer; // nb. storing lexer on Grammar is iffy, but unavoidable
        return g;
    };

    function StreamLexer() {
        this.reset("");
    }

    StreamLexer.prototype.reset = function (data, state) {
        this.buffer = data;
        this.index = 0;
        this.line = state ? state.line : 1;
        this.lastLineBreak = state ? -state.col : 0;
    };

    StreamLexer.prototype.next = function () {
        if (this.index < this.buffer.length) {
            var ch = this.buffer[this.index++];
            if (ch === '\n') {
                this.line += 1;
                this.lastLineBreak = this.index;
            }
            return { value: ch };
        }
    };

    StreamLexer.prototype.save = function () {
        return {
            line: this.line,
            col: this.index - this.lastLineBreak
        };
    };

    StreamLexer.prototype.formatError = function (token, message) {
        // nb. this gets called after consuming the offending token,
        // so the culprit is index-1
        var buffer = this.buffer;
        if (typeof buffer === 'string') {
            var nextLineBreak = buffer.indexOf('\n', this.index);
            if (nextLineBreak === -1) nextLineBreak = buffer.length;
            var line = buffer.substring(this.lastLineBreak, nextLineBreak);
            var col = this.index - this.lastLineBreak;
            message += " at line " + this.line + " col " + col + ":\n\n";
            message += "  " + line + "\n";
            message += "  " + Array(col).join(" ") + "^";
            return message;
        } else {
            return message + " at index " + (this.index - 1);
        }
    };

    function Parser(rules, start, options) {
        if (rules instanceof Grammar) {
            var grammar = rules;
            var options = start;
        } else {
            var grammar = Grammar.fromCompiled(rules, start);
        }
        this.grammar = grammar;

        // Read options
        this.options = {
            keepHistory: false,
            lexer: grammar.lexer || new StreamLexer()
        };
        for (var key in options || {}) {
            this.options[key] = options[key];
        }

        // Setup lexer
        this.lexer = this.options.lexer;
        this.lexerState = undefined;

        // Setup a table
        var column = new Column(grammar, 0);
        var table = this.table = [column];

        // I could be expecting anything.
        column.wants[grammar.start] = [];
        column.predict(grammar.start);
        // TODO what if start rule is nullable?
        column.process();
        this.current = 0; // token index
    }

    // create a reserved token for indicating a parse fail
    Parser.fail = {};

    Parser.prototype.feed = function (chunk) {
        var lexer = this.lexer;
        lexer.reset(chunk, this.lexerState);

        var token;
        while (token = lexer.next()) {
            // We add new states to table[current+1]
            var column = this.table[this.current];

            // GC unused states
            if (!this.options.keepHistory) {
                delete this.table[this.current - 1];
            }

            var n = this.current + 1;
            var nextColumn = new Column(this.grammar, n);
            this.table.push(nextColumn);

            // Advance all tokens that expect the symbol
            var literal = token.text !== undefined ? token.text : token.value;
            var value = lexer.constructor === StreamLexer ? token.value : token;
            var scannable = column.scannable;
            for (var w = scannable.length; w--;) {
                var state = scannable[w];
                var expect = state.rule.symbols[state.dot];
                // Try to consume the token
                // either regex or literal
                if (expect.test ? expect.test(value) : expect.type ? expect.type === token.type : expect.literal === literal) {
                    // Add it
                    var next = state.nextState({ data: value, token: token, isToken: true, reference: n - 1 });
                    nextColumn.states.push(next);
                }
            }

            // Next, for each of the rules, we either
            // (a) complete it, and try to see if the reference row expected that
            //     rule
            // (b) predict the next nonterminal it expects by adding that
            //     nonterminal's start state
            // To prevent duplication, we also keep track of rules we have already
            // added

            nextColumn.process();

            // If needed, throw an error:
            if (nextColumn.states.length === 0) {
                // No states at all! This is not good.
                var message = this.lexer.formatError(token, "invalid syntax") + "\n";
                message += "Unexpected " + (token.type ? token.type + " token: " : "");
                message += JSON.stringify(token.value !== undefined ? token.value : token) + "\n";
                var err = new Error(message);
                err.offset = this.current;
                err.token = token;
                throw err;
            }

            // maybe save lexer state
            if (this.options.keepHistory) {
                column.lexerState = lexer.save();
            }

            this.current++;
        }
        if (column) {
            this.lexerState = lexer.save();
        }

        // Incrementally keep track of results
        this.results = this.finish();

        // Allow chaining, for whatever it's worth
        return this;
    };

    Parser.prototype.save = function () {
        var column = this.table[this.current];
        column.lexerState = this.lexerState;
        return column;
    };

    Parser.prototype.restore = function (column) {
        var index = column.index;
        this.current = index;
        this.table[index] = column;
        this.table.splice(index + 1);
        this.lexerState = column.lexerState;

        // Incrementally keep track of results
        this.results = this.finish();
    };

    // nb. deprecated: use save/restore instead!
    Parser.prototype.rewind = function (index) {
        if (!this.options.keepHistory) {
            throw new Error('set option `keepHistory` to enable rewinding');
        }
        // nb. recall column (table) indicies fall between token indicies.
        //        col 0   --   token 0   --   col 1
        this.restore(this.table[index]);
    };

    Parser.prototype.finish = function () {
        // Return the possible parsings
        var considerations = [];
        var start = this.grammar.start;
        var column = this.table[this.table.length - 1];
        column.states.forEach(function (t) {
            if (t.rule.name === start && t.dot === t.rule.symbols.length && t.reference === 0 && t.data !== Parser.fail) {
                considerations.push(t);
            }
        });
        return considerations.map(function (c) {
            return c.data;
        });
    };

    return {
        Parser: Parser,
        Grammar: Grammar,
        Rule: Rule
    };
});
});

var nearley_1 = nearley.Parser;
var nearley_2 = nearley.Grammar;

//      
var compose = ((...fns) => fns.reduce((f, g) => (...args) => f(g(...args))));

const extendNode = curry_1((_ref, node) => {
  let { meta } = _ref,
      options = objectWithoutProperties(_ref, ['meta']);

  return _extends({}, node, {
    meta: _extends({}, node.meta, meta)
  }, options);
});

const nth = n => d => d[n];
const nuller = () => null;
const nonEmpty = d => {
  return Array.isArray(d) ? !!d.length : d != null;
};
const add = d => `${d[0]}${d[1]}`;

const flatten = d => d.reduce((acc, v) => {
  if (Array.isArray(v)) {
    return acc.concat(v);
  }

  return acc.concat(v);
}, []);

const drop = d => {
  return d.filter(nonEmpty);
};

var helpers = {
  nth,
  nuller,
  nonEmpty,
  add,
  flatten,
  compose,
  drop,
  extendNode
};

// Node Types
const marker = lexer => {
  const { col, line } = lexer;

  if (!lexer.lines.length) {
    return { col, line, sourceLine: '' };
  }

  return {
    col,
    line,
    sourceLine: lexer.lines[lexer.line - 1]
  };
};

function factory(lexer) {
  const node = (Type, seed = {}) => d => {
    const params = d.filter(nonEmpty);
    const { value = '', meta = {} } = seed;
    const start = marker(lexer);
    const end = params[params.length - 1] && params[params.length - 1].range ? params[params.length - 1].range[1] : _extends({}, start, { col: start.col + value.length });

    return {
      value,
      type: null,
      Type,
      toString() {},
      meta,
      range: [start, end],
      params
    };
  };

  const binary = d => {
    const [lhs, operator, rhs] = d.filter(nonEmpty);
    let Type = Syntax.BinaryExpression;
    if (operator.value === '||' || operator.value === '&&') {
      Type = Syntax.Select;
    }
    return node(Type, { value: operator.value })([lhs, rhs]);
  };

  const constant = d => {
    const value = d[0].value;
    return extendNode({
      value: `${value}`,
      type: value.toString().indexOf('.') !== -1 ? 'f32' : 'i32'
    }, node(Syntax.Constant)([]));
  };

  const identifier = d => node('Identifier', { value: d.join('') })([]);

  const declaration = Type => d => {
    const [pair, ...init] = drop(d);
    const [id, type] = pair.params;
    return extendNode({
      value: id.value,
      type: type.value
    }, node(Type)(init));
  };

  const unary = ([operator, target]) => {
    let params = [target];

    if (operator.value === '-') {
      params = [_extends({}, target, {
        value: '0',
        Type: Syntax.Constant,
        params: [],
        meta: {}
      }), target];
    }

    return extendNode({
      value: operator.value,
      params
    }, node(Syntax.UnaryExpression)([operator, target]));
  };

  const ternary = d => {
    return extendNode({
      value: '?'
    }, node(Syntax.TernaryExpression)(d));
  };

  const subscript = d => {
    const [id, field] = d.filter(nonEmpty);
    return extendNode({
      value: id.value,
      params: [id, field]
    }, node(Syntax.ArraySubscript)([id, field]));
  };

  const fun = d => {
    const [name, args, result, block] = d.filter(nonEmpty);
    return _extends({}, name, {
      Type: Syntax.FunctionDeclaration,
      meta: [],
      params: [args, result, block]
    });
  };

  const voidFun = d => {
    const params = drop(d);
    const [name, args, block] = params;
    const result = extendNode({ type: null }, node(Syntax.FunctionResult)([]));
    return extendNode({
      value: name.value,
      params: [args, result, block]
    }, node(Syntax.FunctionDeclaration)(params));
  };

  const result = d => {
    const [type] = drop(d);

    return extendNode({
      type: type != null && type.value !== 'void' ? type.value : null
    }, node(Syntax.FunctionResult)(d));
  };

  const call = d => {
    let [id, ...params] = drop(d);

    return extendNode({
      value: id.value
    }, node(Syntax.FunctionCall)([id, ...params]));
  };

  const struct = d => {
    const [id, ...params] = drop(d);
    return extendNode({
      value: id.value
    }, node(Syntax.Struct)(params));
  };

  const typedef = d => {
    const [id, args, res] = drop(d);

    return extendNode({
      value: id.value,
      params: [node(Syntax.FunctionArguments)(args), extendNode({
        type: res.value
      }, node(Syntax.FunctionResult)([res]))],
      type: res.type
    }, node(Syntax.Typedef)([id, args, result]));
  };

  const string = d => {
    return extendNode({
      value: d[0].value,
      type: 'i32'
    }, node(Syntax.StringLiteral)([]));
  };

  return {
    node,
    binary,
    constant,
    identifier,
    unary,
    ternary,
    subscript,
    access(d) {
      const n = subscript(d);
      n.Type = 'Access';
      return n;
    },
    fun,
    declaration,
    call,
    struct,
    result,
    string,
    char(d) {
      return extendNode({
        value: d[0].value,
        type: 'i32'
      }, node(Syntax.CharacterLiteral)([]));
    },
    type(d) {
      return extendNode({
        value: d[0].value,
        type: d[0].value,
        params: []
      }, node(Syntax.Type)(d));
    },
    typeGeneric(d) {
      const [id, obj] = drop(d);
      return extendNode({
        value: id.value,
        type: id.value,
        params: [obj]
      }, node(Syntax.Type)(d));
    },
    typedef,
    voidFun,
    assignment(d, value) {
      let Type = Syntax.Assignment;
      if (d[0] && (d[0].Type === Syntax.ArraySubscript || d[0].Type === 'Access')) {
        Type = Syntax.MemoryAssignment;
      }

      if (['-=', '+='].includes(value)) {
        const operator = value[0];
        const [target, amount] = drop(d);
        const b = binary([target, { value: operator }, amount]);
        return node(Type, {
          value: '='
        })([target, b]);
      }

      return node(Type, { value })(d);
    },
    forLoop(d) {
      const [initializer, condition, afterthought, ...body] = drop(d);
      return node(Syntax.Loop)([initializer, condition, ...body, afterthought]);
    },
    whileLoop(d) {
      const noop = node(Syntax.Noop)([]);
      return node(Syntax.Loop)([noop, ...d]);
    },
    spread(d) {
      return node(Syntax.Spread)(d);
    },
    builtinDecl(d) {
      const [id, typeNode] = drop(d);

      return extendNode({
        value: id.value,
        type: typeNode.value,
        params: [typeNode]
      }, node(Syntax.ImmutableDeclaration)(d));
    }
  };
}

/**
 * Syntax Analysis
 *
 * The parser below creates the "bare" Abstract Syntax Tree.
 */

//      
// $FlowFixMe
// $FlowFixMe
/**
 * Returns a custom lexer. This wrapper API is necessary to ignore comments
 * in all of the subsequent compiler phases, unfortunately.
 *
 * TODO: Maybe consider adding comment nodes back to the AST. IIRC this causes
 *       lots of ambiguous grammar for whatever reason.
 */
function makeLexer() {
  const mooLexer = moo.compile(waltSyntax_1);

  return {
    current: null,
    lines: [],
    get line() {
      return mooLexer.line;
    },
    get col() {
      return mooLexer.col;
    },
    save() {
      return mooLexer.save();
    },
    reset(chunk, info) {
      this.lines = chunk.split('\n');
      return mooLexer.reset(chunk, info);
    },
    next() {
      // It's a cruel and unusual punishment to implement comments with nearly
      let token = mooLexer.next();
      // Drop all comment tokens found
      while (token && token.type === 'comment') {
        token = mooLexer.next();
      }
      this.current = token;
      return this.current;
    },
    formatError(token) {
      return mooLexer.formatError(token);
    },
    has(name) {
      return mooLexer.has(name);
    }
  };
}

var makeParser = curry_1(function parse(extraGrammar, source) {
  const grammarList = [grammar, grammar$1, ...extraGrammar];
  const context = {
    lexer: makeLexer(),
    nodes: factory,
    helpers,
    Syntax
  };

  // All Grammar plugins are factories resulting in an object which must contain
  // a "ParserRules" array which will be added to the base grammar.
  const grammar$$1 = grammarList.slice(1).reduce((acc, value) => {
    const extra = value.call(context);
    return _extends({}, acc, {
      ParserRules: acc.ParserRules.concat(extra.ParserRules)
    });
  }, grammarList[0].call(context));

  const parser = new nearley_1(nearley_2.fromCompiled(grammar$$1));

  parser.feed(source);

  // This is a safeguard against ambiguous syntax that may be generated by blending
  // multiple different grammars together. If there is more than one was to parse
  // something then we did something wrong and we hard exit the compiler pipeline.
  invariant_1(parser.results.length === 1, `Ambiguous syntax number of productions: ${parser.results.length}`);

  return parser.results[0];
});

// Return a single method which will chain all of the middleware provided
const combineMiddleware = transforms => {
  let transform;

  const chain = transforms.reduce((stack, go) => {
    return go(args => {
      // Each middleware get's a node and context object. The context allows for
      // nested node to have knowledge of the outer/parent context. All of this is
      // part of args array
      return stack(args, transform);
    });
    // unroll last result
  }, ([id]) => id);

  return (args, topLevelTranfrom) => {
    transform = topLevelTranfrom;
    // kick off the chain of middleware, starting from right to left
    return chain(args, transform);
  };
};

const combineParsers = (sortedParsers = []) => {
  const wildcards = [];

  // Normalize parsers by type
  const parsersByType = sortedParsers.reduce((acc, parser) => {
    Object.entries(parser).forEach(([type, cb]) => {
      // Wildcards may only handle types which have other callbacks attached to
      // them.
      if (type === '*') {
        wildcards.push(cb);
        return;
      }

      if (acc[type] == null) {
        // Prepend any previously defined wildcard to maintain precedence
        acc[type] = [...wildcards];
      }

      acc[type].push(cb);
    });

    return acc;
  }, {});

  return Object.entries(parsersByType).reduce((acc, [key, transforms]) => {
    acc[key] = combineMiddleware(transforms);

    return acc;
  }, {});
};

/**
 * Scope helpers.
 *
 * Normalizes how scope look ups are made
 */
const namespace$1 = Symbol('scope namespace');
const signature$1 = Symbol('signature');

function enter$1(scopes, scopeName) {
  return [...scopes, { [namespace$1]: scopeName, [signature$1]: { result: null, arguments: null } }];
}

function exit$1(scopes) {
  return scopes.slice(0, -1);
}

function current$1(scopes) {
  return scopes[scopes.length - 1];
}

function add$2(scopes, key, node) {
  const cur = current$1(scopes);
  if (cur) {
    cur[key] = node;
  }

  return cur;
}

function find$1(scopes, key) {
  const len = scopes.length;
  let i = len - 1;
  for (i; i >= 0; i--) {
    const ref = scopes[i][key];
    if (ref) {
      return ref;
    }
  }

  return null;
}

function index$1(scope, key) {
  const pos = Object.keys(scope).indexOf(key);
  return pos > -1 ? pos : Object.keys(scope).length;
}

var scope$2 = {
  enter: enter$1,
  exit: exit$1,
  add: add$2,
  find: find$1,
  current: current$1,
  index: index$1,
  namespace: namespace$1,
  signature: signature$1
};

const {
  enter,
  exit,
  add: add$1,
  find,
  current,
  namespace,
  signature,
  index
} = scope$2;

var scope = {
  enter,
  exit,
  add: add$1,
  find,
  current,
  namespace,
  index,
  signature
};

var scope_1 = scope.enter;
var scope_2 = scope.exit;
var scope_3 = scope.current;
var scope_4 = scope.find;
var scope_5 = scope.add;
var scope_6 = scope.index;
var scope_7 = scope.namespace;
var scope_8 = scope.signature;

//      
const FUNCTION_INDEX = 'function/index';



const LOCAL_INDEX = 'local/index';
const GLOBAL_INDEX = 'global/index';

const TYPE_CONST = 'type/const';
const TYPE_ARRAY = 'TYPE_ARRAY';

const TYPE_OBJECT = 'TYPE_OBJECT';
const TYPE_INDEX = 'TYPE_INDEX';
const OBJECT_SIZE = 'OBJECT_SIZE';
const TYPE_CAST = 'type/cast';
const OBJECT_KEY_TYPES = 'OBJECT_KEY_TYPES';

const AST_METADATA = 'AST_METADATA';
const FUNCTION_METADATA = 'FUNCTION_METADATA';
const ALIAS = 'alias';

// Statics

//      


const typeWeight = typeString => {
  switch (typeString) {
    case 'i32':
    case 'bool':
      return 0;
    case 'i64':
      return 1;
    case 'f32':
      return 2;
    case 'f64':
      return 3;
    default:
      return -1;
  }
};

/**
 * Core language plugin
 *
 * The parsers in here very closely mirror the underlying WebAssembly structure
 * and are used as the core language for every feature built on top.
 *
 *      
 */
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

// Core plugin
function Core() {
  return {
    semantics() {
      // Parse declaration node
      const declaration = next => ([node, context]) => {
        const scope$$1 = scope_3(context.scopes);
        const index$$1 = scope_6(scope$$1, node.value);

        scope$$1[node.value] = extendNode({
          params: node.params.map(extendNode({ type: node.type })),
          meta: _extends({}, node.meta, {
            [scope$$1[scope_7]]: index$$1,
            [TYPE_CONST]: node.Type === Syntax.ImmutableDeclaration
          }),
          Type: Syntax.Declaration
        }, node);

        return next([scope$$1[node.value], context]);
      };

      return {
        [Syntax.Declaration]: declaration,
        [Syntax.ImmutableDeclaration]: declaration,
        // CharacterLiteral: next => ([node]) => next([mapCharacterLiteral(node)]),
        [Syntax.Select]: _ => ([node, context], transform) => balanceTypesInMathExpression(_extends({}, node, {
          params: node.params.map(child => transform([child, context]))
        })),
        [Syntax.BinaryExpression]: _ => ([node, context], transform) => balanceTypesInMathExpression(_extends({}, node, {
          params: node.params.map(child => transform([child, context]))
        })),
        [Syntax.Pair]: _next => (args, transform) => {
          const [typeCastMaybe, context] = args;

          const params = typeCastMaybe.params.map(p => transform([p, context]));
          const [targetNode, typeNode] = params;
          const { type: from } = targetNode;
          const { value: to } = typeNode;

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

          // If both sides of a pair don't have types then it's not a typecast,
          // more likely a string: value pair in an object for example
          return _extends({}, typeCastMaybe, {
            params
          });
        },
        [Syntax.Identifier]: next => args => {
          const [node, context] = args;
          let ref = scope_4(context.scopes, node.value);
          if (ref) {
            return _extends({}, node, {
              meta: _extends({}, node.meta, ref.meta),
              type: ref.type
            });
          }

          return next(args);
        },
        [Syntax.MemoryAssignment]: _ignore => (args, transform) => {
          const [inputNode, context] = args;
          const params = inputNode.params.map(p => transform([p, context]));
          const { type } = params[0];
          return _extends({}, inputNode, { params, type });
        },
        [Syntax.TernaryExpression]: next => ([node, context]) => {
          return next([balanceTypesInMathExpression(node), context]);
        }
      };
    }
  };
}

// Base plugin
function base() {
  return {
    semantics() {
      return {
        '*': _ => function baseSemanticsParser([node, ...rest], t) {
          const result = _extends({}, node, {
            params: node.params.map(child => t([child, ...rest]))
          });

          return result;
        }
      };
    }
  };
}

/**
 * Types plugin. Parses all types before the rest of the program
 *
 * (Does not handle Generic Types)
 *
 *      
 */
function typePlugin() {
  return {
    semantics() {
      return {
        [Syntax.Typedef]: _ => ([node]) => node,
        [Syntax.Program]: next => args => {
          const [ast, context] = args;
          const { types } = context;
          // Types have to be pre-parsed before the rest of the program
          const astWithTypes = mapNode_2({
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
              const [fnArgs] = node.params;
              const defaultArgs = [];

              walkNode({
                Assignment(assignment) {
                  const defaultValue = assignment.params[1];
                  defaultArgs.push(defaultValue);
                },
                Type() {
                  argumentsCount += 1;
                }
              })(fnArgs);
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
            }
          })(ast);

          return next([astWithTypes, context]);
        }
      };
    }
  };
}

/**
 * Unary operator plugin.
 *
 *      
 */
const shifts = {
  i64: 63,
  f64: 63,
  i32: 31,
  f32: 32
};
// Unary expressions need to be patched so that the LHS type matches the RHS
function unary () {
  return {
    semantics({ fragment }) {
      return {
        [Syntax.UnaryExpression]: _ignore => (args, transform) => {
          const [unaryNode, context] = args;
          // While it's counter-intuitive that an unary operation would have two operands
          // it is simpler to always parse them as pseudo-binary and then simplify them here.
          const [lhs, rhs] = unaryNode.params.map(p => transform([p, context]));
          switch (unaryNode.value) {
            // Transform bang
            case '!':
              const shift = shifts[lhs.type];
              return transform([fragment(`(((${String(lhs.value)} >> ${shift}) | ((~${String(lhs.value)} + 1) >> ${shift})) + 1)`), context]);
            case '~':
              const mask = ['i64', 'f64'].includes(transform([lhs, context]).type) ? '0xffffffffffff' : '0xffffff';
              return transform([fragment(`(${String(lhs.value)} ^ ${mask})`), context]);
            default:
              return transform([_extends({}, unaryNode, {
                type: rhs.type,
                params: [_extends({}, lhs, {
                  type: rhs.type
                }), rhs],
                Type: Syntax.BinaryExpression
              }), context]);
          }
        }
      };
    }
  };
}

/* Core function plugin
 *
 *      
 *
 * This plugin only handles the basics of functions like vanilla function calls,
 * arguments and return statements
 */
function coreFunctionPlugin() {
  return {
    semantics() {
      return {
        [Syntax.FunctionDeclaration]: _ignore => ([fun, context], transform) => {
          // Enter a new scope, where all new declaration will go into
          context.scopes = scope_1(context.scopes, LOCAL_INDEX);
          const currentScope = scope_3(context.scopes);

          const [argsNode, resultNode, block] = fun.params;
          const [args, result] = [argsNode, resultNode].map(p => transform([p, context]));

          const ref = _extends({}, fun, {
            // This is set by the parsers below if necessary, defaults to null
            type: currentScope[scope_8].result,
            meta: _extends({}, fun.meta, {
              [FUNCTION_INDEX]: Object.keys(context.functions).length,
              [FUNCTION_METADATA]: {
                argumentsCount: currentScope[scope_8].arguments.length,
                locals: scope_3(context.scopes)
              }
            })
          });
          context.functions[fun.value] = ref;

          // Parse the block last, so that they can self-reference the function
          ref.params = [args, result, transform([block, context])];

          context.scopes = scope_2(context.scopes);

          return ref;
        },
        [Syntax.FunctionResult]: _next => ([result, context]) => {
          // Function statements are sybligs of FunctionResult so we need to mutate
          // the parent context (FunctionDeclaration)
          const currentScope = scope_3(context.scopes);
          currentScope[scope_8].result = result.type;

          return result;
        },
        [Syntax.FunctionArguments]: _next => ([args, context], transform) => {
          const currentScope = scope_3(context.scopes);

          currentScope[scope_8].arguments = [];

          walkNode({
            [Syntax.Pair]: node => {
              const [identifier, typeNode] = node.params;

              currentScope[scope_8].arguments.push(node);

              transform([_extends({}, node, {
                value: identifier.value,
                type: typeNode.value,
                params: [],
                Type: Syntax.Declaration
              }), context]);
            }
          })(_extends({}, args, { params: args.params.filter(Boolean) }));

          return args;
        },
        // Regular function calls
        [Syntax.FunctionCall]: next => ([call, context]) => {
          const { functions } = context;
          const index = Object.keys(functions).indexOf(call.value);

          return next([_extends({}, call, {
            type: functions[call.value] != null ? functions[call.value].type : null,
            meta: { [FUNCTION_INDEX]: index },
            params: call.params.slice(1)
          }), context]);
        },
        [Syntax.ReturnStatement]: _next => ([returnNode, context], transform) => {
          const currentScope = scope_3(context.scopes);

          const [expression] = returnNode.params.map(p => transform([p, context]));
          const { result } = currentScope[scope_8];
          // Constants as return values need to be assigned a correct type
          // (matching the result expected)
          if (expression != null && expression.Type === Syntax.Constant && typeWeight(expression.type) !== typeWeight(result)) {
            return _extends({}, returnNode, {
              type: result,
              params: [_extends({}, expression, { type: result })]
            });
          }

          const type = expression ? expression.type : null;
          return _extends({}, returnNode, {
            params: [expression],
            type
          });
        }
      };
    }
  };
}

/**
 * Imports Plugin
 *
 *      
 */
function Imports() {
  return {
    semantics: () => ({
      [Syntax.Import]: _next => args => {
        const [node, context] = args;
        return mapNode_2({
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
            const { types, functions } = context;
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

            if (!['Table', 'Memory'].includes(typeNode.value)) {
              const scope$$1 = scope_3(context.scopes);
              const index$$1 = scope_6(scope$$1, identifierNode.value);
              scope_5(context.scopes, identifierNode.value, _extends({}, identifierNode, {
                meta: { [scope$$1[scope_7]]: index$$1, [TYPE_CONST]: true },
                type: typeNode.type
              }));
            } else {
              const bucket = typeNode.value === 'Memory' ? 'memories' : 'tables';
              context[bucket].push(identifierNode);
            }

            return pairNode;
          }
        })(node);
      }
    })
  };
}

/**
 * Bool plugin.
 * Converts boolean identifiers to i32 constants, handles declarations with
 * type "bool".
 *
 *      
 */
function booleanPlugin() {
  return {
    semantics() {
      const declaration = next => ([decl, context]) => {
        if (decl.type === 'bool') {
          return next([_extends({}, decl, { type: 'i32' }), context]);
        }

        return next([decl, context]);
      };
      return {
        [Syntax.Identifier]: next => (args, transform) => {
          const [id, context] = args;
          if (!(id.value === 'true' || id.value === 'false')) {
            return next(args);
          }

          return transform([_extends({}, id, {
            Type: Syntax.Constant,
            value: id.value === 'true' ? '1' : '0',
            type: 'i32'
          }), context]);
        },
        [Syntax.FunctionResult]: next => ([result, context]) => {
          if (result.type === 'bool') {
            return next([_extends({}, result, { type: 'i32' }), context]);
          }

          return next([result, context]);
        },
        [Syntax.Declaration]: declaration,
        [Syntax.ImmutableDeclaration]: declaration
      };
    }
  };
}

/**
 * Array Plugin
 *
 *      
 */
function arrayPlugin() {
  return {
    semantics() {
      const declaration = next => args => {
        const [node, context] = args;

        // For every declaration of array types we will strip the declaration type
        // to a core type (i32) and attach the original type reference as metadata
        if (node.type && node.type.endsWith('[]')) {
          return next([_extends({}, node, {
            type: 'i32',
            meta: _extends({}, node.meta, { [TYPE_ARRAY]: node.type.slice(0, -2) })
          }), context]);
        }

        return next(args);
      };

      return {
        [Syntax.Declaration]: declaration,
        [Syntax.ImmutableDeclaration]: declaration,
        [Syntax.Identifier]: next => args => {
          const [node, context] = args;
          const ref = scope_4(context.scopes, node.value);
          // Before moving on to the core parser all identifiers need to have
          // concrete basic types
          if (ref && ref.meta[TYPE_ARRAY]) {
            return next([_extends({}, node, {
              type: ref.type,
              meta: _extends({}, node.meta, ref.meta)
            }), context]);
          }

          return next(args);
        },
        [Syntax.ArraySubscript]: _ignore => (args, transform) => {
          const [node, context] = args;

          // To find out the type of this subscript we first must process it's
          // parameters <identifier, field>
          const params = node.params.map(p => transform([p, context]));

          const [identifier] = params;

          const type = identifier.meta[TYPE_ARRAY];

          return _extends({}, node, {
            params,
            type
          });
        }
      };
    }
  };
}

/**
 * Handles access to memory and Memory type declaration
 *
 *      
 */
const isMemoryIdentifier = (context, id) => {
  const memory = context.memories[0];
  return memory && memory.value === id.value;
};

function memoryPlugin() {
  return {
    semantics() {
      return {
        [Syntax.ImmutableDeclaration]: next => args => {
          const [decl, context] = args;
          const { scopes, memories } = context;

          // Short circuit since memory is a special type of declaration
          if (!scopes.length < 2 && decl.type === 'Memory' && !memories.length) {
            memories.push(_extends({}, decl, {
              meta: _extends({}, decl.meta, {
                [GLOBAL_INDEX]: -1
              })
            }));
            return memories[0];
          }

          return next(args);
        },
        [Syntax.FunctionCall]: next => (args, transform) => {
          const [node, context] = args;
          const [subscript, ...rest] = node.params;
          const [id, field = {}] = subscript.params;

          const callMap = {
            dataSize: _extends({}, id, {
              type: 'i32',
              meta: { ALIAS: 'Memory' },
              Type: Syntax.Access,
              params: [_extends({}, id, {
                type: 'i32',
                value: '0',
                Type: Syntax.Constant
              }), _extends({}, id, {
                type: 'i32',
                value: '0',
                Type: Syntax.Constant
              })]
            }),
            grow: _extends({}, id, {
              value: 'grow_memory',
              params: rest.map(p => transform([p, context])),
              Type: Syntax.NativeMethod
            }),
            size: _extends({}, id, {
              value: 'current_memory',
              params: [],
              Type: Syntax.NativeMethod
            })
          };

          const mapped = callMap[field.value];
          if (!(subscript.Type === Syntax.Access && isMemoryIdentifier(context, id) && mapped)) {
            return next(args);
          }

          return mapped;
        }
      };
    }
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

const get$1 = (type, index, dataView) => {
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

const set$1 = (type, index, dataView, value) => {
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

var index$2 = {
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
  set: set$1,
  get: get$1,
  sizeof
};

var index_1 = index$2.i32;
var index_2 = index$2.i64;
var index_3 = index$2.f32;
var index_4 = index$2.f64;
var index_9 = index$2.u8;
var index_12 = index$2.u32;
var index_14 = index$2.set;
var index_16 = index$2.sizeof;

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
      case 'varuint7':
      case 'varuint32':
      case 'varint7':
      case 'varint1':
        {
          // Encode all of the LEB128 aka 'var*' types
          value = encodeUnsigned(value);
          size = value.length;
          invariant_1(size, `Cannot write a value of size ${size}`);
          break;
        }
      case 'varint32':
        {
          value = encodeSigned(value);
          size = value.length;
          invariant_1(size, `Cannot write a value of size ${size}`);
          break;
        }
      case 'varint64':
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

  characterStream.push('varuint32', value.length, value);
  let i = 0;
  for (i = 0; i < value.length; i++) {
    characterStream.push('varuint32', value.codePointAt(i), value[i]);
  }
  resultStream.write(characterStream);

  return resultStream;
}

/**
 * Static value plugin
 *
 *      
 */
const escapeMap = {
  ['\\0']: 0x00,
  ['\\a']: 0x07,
  ['\\b']: 0x08,
  ['\\t']: 0x09,
  ['\\n']: 0x0a,
  ['\\v']: 0x0b,
  ['\\f']: 0x0c,
  ['\\r']: 0x0d,
  ["\\'"]: 0x27
};

const sizeMap = {
  i64: 8,
  f64: 8,
  i32: 4,
  f32: 4
};

function encodeArray(array, type) {
  const stream = new OutputStream();
  const encodeType = index$2[type];
  array.forEach(v => {
    stream.push(encodeType, v, String(v));
  });

  return stream;
}

function Strings() {
  let count = 0;
  return {
    semantics: () => ({
      [Syntax.StaticDeclaration]: _next => ([node, context], transform) => {
        const { userTypes, statics } = context;

        const bareType = String(node.type).slice(0, -2);
        const typeSize = sizeMap[bareType];

        const meta = node.params.reduce((acc, v, i) => {
          const n = transform([v, context]);
          acc.OBJECT_SIZE += typeSize;
          acc.TYPE_OBJECT[i] = i * typeSize;
          acc.OBJECT_KEY_TYPES[i] = bareType;
          acc.VALUES.push(Number(n.value));
          return acc;
        }, {
          OBJECT_SIZE: 0,
          TYPE_OBJECT: {},
          OBJECT_KEY_TYPES: {},
          VALUES: []
        });

        const uid = `__auto_gen_${node.value}_${count}`;
        count += 1;

        userTypes[uid] = _extends({}, node, {
          value: uid,
          Type: Syntax.Type,
          meta,
          params: []
        });

        statics[uid] = encodeArray(meta.VALUES, bareType);

        // Short circuit the middleware and instead transform a declaration
        return transform([_extends({}, node, {
          type: uid,
          Type: Syntax.ImmutableDeclaration,
          params: [_extends({}, node.params[0], {
            value: uid,
            Type: Syntax.StaticValueList
          })]
        }), context]);
      },
      [Syntax.CharacterLiteral]: _ => ([node, context], transform) => {
        const codePoint = escapeMap[node.value] || node.value.codePointAt(0);

        return transform([_extends({}, node, {
          Type: 'Constant',
          type: 'i32',
          value: String(codePoint)
        }), context]);
      },
      [Syntax.StringLiteral]: _ignore => args => {
        const [stringLiteral, context] = args;
        const { statics } = context;
        const { value } = stringLiteral;

        // did we already encode the static?
        if (!(value in statics)) {
          statics[value] = stringEncoder(value);
        }

        // It's too early to transform a string at this point
        // we need additional information, only available in the generator.
        // This also avoids doing the work in two places, in semantics AND gen
        return stringLiteral;
      }
    })
  };
}

/**
 * Function pointer plugin.
 * Handles function pointer declaration and indirect calls.
 *
 *      
 */
function functionPointer() {
  return {
    semantics() {
      return {
        // Handle Table definitions
        [Syntax.ImmutableDeclaration]: next => function defineTable(args) {
          const [decl, context] = args;

          // Short circuit since memory is a special type of declaration
          if (!context.locals && decl.type === 'Table') {
            return _extends({}, decl, {
              meta: _extends({}, decl.meta, {
                [GLOBAL_INDEX]: -1
              })
            });
          }

          return next(args);
        },
        [Syntax.Identifier]: next => function pointer(args) {
          const [node, context] = args;
          const { functions, table, scopes } = context;

          if (scope_4(scopes, node.value) || !functions[node.value]) {
            return next(args);
          }

          if (table[node.value] == null) {
            table[node.value] = functions[node.value];
          }
          return _extends({}, node, {
            type: 'i32',
            meta: {
              [FUNCTION_INDEX]: functions[node.value].meta[FUNCTION_INDEX]
            },
            value: Object.keys(table).indexOf(node.value),
            Type: Syntax.FunctionPointer
          });
        },
        [Syntax.FunctionResult]: next => (args, transform) => {
          const [node, context] = args;
          const { types } = context;
          if (!types[node.type]) {
            return next(args);
          }

          return next([extendNode({
            type: 'i32',
            meta: { ALIAS: node.type },
            params: node.params.map(p => transform([p, context]))
          }, node), context]);
        },
        [Syntax.FunctionCall]: next => function indirectCall(args, transform) {
          const [call, context] = args;
          const { scopes, types } = context;
          const ref = scope_4(scopes, call.value);
          // Nothing we need transform
          if (!ref) {
            return next(args);
          }

          const typedef = types[ref.type];
          const typeIndex = Object.keys(types).indexOf(ref.type);

          // We will short all of the other middleware so transform the parameters
          // here and append an identifier which will be used to get the table
          // value
          const params = [...call.params.slice(1), _extends({}, ref, { Type: Syntax.Identifier })].map(p => transform([p, context]));

          return _extends({}, call, {
            meta: _extends({}, call.meta, ref.meta, {
              [TYPE_INDEX]: typeIndex
            }),
            type: typedef != null ? typedef.type : call.type,
            params,
            Type: Syntax.IndirectFunctionCall
          });
        }
      };
    }
  };
}

/**
 * Structs Plugin
 *
 *      
 */
const sizeMap$1 = {
  i64: 8,
  f64: 8,
  i32: 4,
  f32: 4
};

const getByteOffsetsAndSize = objectLiteralNode => {
  const offsetsByKey = {};
  const keyTypeMap = {};
  let size = 0;
  walkNode({
    [Syntax.Pair]: keyTypePair => {
      const { value: key } = keyTypePair.params[0];
      const { value: typeString } = keyTypePair.params[1];
      invariant_1(offsetsByKey[key] == null, `Duplicate key ${key} not allowed in object type`);

      keyTypeMap[key] = typeString;
      offsetsByKey[key] = size;
      size += sizeMap$1[typeString] || 4;
    }
  })(objectLiteralNode);

  return [offsetsByKey, size, keyTypeMap];
};

const patchStringSubscript = (byteOffsetsByKey, params) => {
  const field = params[1];
  const absoluteByteOffset = byteOffsetsByKey[field.value];
  return [params[0], _extends({}, field, {
    meta: { [ALIAS]: field.value },
    value: absoluteByteOffset,
    type: 'i32',
    Type: Syntax.Constant
  })];
};

function Struct() {
  return {
    semantics() {
      return {
        [Syntax.Struct]: _ => ([node, { userTypes }]) => {
          const [offsetsByKey, totalSize, keyTypeMap] = getByteOffsetsAndSize(node.params[0]);
          const struct = _extends({}, node, {
            meta: _extends({}, node.meta, {
              [TYPE_OBJECT]: offsetsByKey,
              OBJECT_SIZE: totalSize,
              [OBJECT_KEY_TYPES]: keyTypeMap
            })
          });

          userTypes[struct.value] = struct;
          return struct;
        },
        [Syntax.FunctionResult]: next => (args, transform) => {
          const [node, context] = args;
          const { userTypes } = context;
          if (!userTypes[String(node.type)]) {
            return next(args);
          }

          return next([extendNode({
            type: 'i32',
            meta: { ALIAS: node.type },
            params: node.params.map(p => transform([p, context]))
          }, node), context]);
        },
        [Syntax.Identifier]: next => args => {
          const [node, context] = args;
          const { userTypes, scopes } = context;
          const ref = scope_4(scopes, node.value);
          // Ignore anything not typed as a struct
          if (!(ref && userTypes[ref.type])) {
            return next(args);
          }

          // Convert all struct uses to i32 types
          return _extends({}, node, {
            meta: _extends({}, node.meta, ref.meta, { ALIAS: ref.type }),
            type: 'i32'
          });
        },
        [Syntax.ArraySubscript]: next => (args, transform) => {
          const [node, context] = args;
          const { userTypes, scopes } = context;
          const params = node.params.map(p => transform([p, context]));
          const [lookup, field] = params;

          const ref = scope_4(scopes, lookup.value);
          const userType = ref && userTypes[ref.type];

          if (userType != null) {
            const metaObject = userType.meta[TYPE_OBJECT];
            const objectKeyTypeMap = userType.meta[OBJECT_KEY_TYPES];
            const type = objectKeyTypeMap[field.value];

            return _extends({}, node, {
              value: `${lookup.value}.${field.value}`,
              type,
              meta: _extends({}, node.meta, { ALIAS: userType.value }),
              Type: Syntax.Access,
              params: patchStringSubscript(metaObject, params)
            });
          }

          return next(args);
        },
        [Syntax.Access]: next => (args, transform) => {
          const [node, context] = args;
          const { userTypes, scopes } = context;
          const params = node.params.map(p => transform([p, context]));
          const [lookup, field] = params;
          const ref = scope_4(scopes, lookup.value);
          const userType = userTypes[String((ref || lookup).type)];

          if (userType == null) {
            return next(args);
          }

          const metaObject = userType.meta[TYPE_OBJECT];
          const objectKeyTypeMap = userType.meta[OBJECT_KEY_TYPES];
          const type = objectKeyTypeMap[field.value];

          return _extends({}, node, {
            value: `${lookup.value}.${field.value}`,
            meta: _extends({}, node.meta, {
              ALIAS: userType.value,
              TYPE_ARRAY: String(type).includes('[]') ? type.slice(0, -2) : null
            }),
            type: String(type).replace('[]', ''),
            params: patchStringSubscript(metaObject, params)
          });
        },
        [Syntax.Assignment]: next => (args, transform) => {
          const [node, context] = args;
          const [lhs, rhs] = node.params;

          if (!(rhs && rhs.Type === Syntax.ObjectLiteral)) {
            return next(args);
          }
          const individualKeys = {};
          const spreadKeys = {};
          // We have to walk the nodes twice, once for regular prop keys and then again
          // for ...(spread)
          walkNode({
            // Top level Identifiers _inside_ an object literal === shorthand
            // Notice that we ignore chld mappers in both Pairs and Spread(s) so the
            // only way this is hit is if the identifier is TOP LEVEL
            [Syntax.Identifier]: (identifier, _) => {
              individualKeys[identifier.value] = _extends({}, lhs, {
                Type: Syntax.MemoryAssignment,
                params: [_extends({}, lhs, {
                  Type: Syntax.ArraySubscript,
                  params: [lhs, identifier]
                }), identifier]
              });
            },
            [Syntax.Pair]: (pair, _) => {
              const [property, value] = pair.params;
              individualKeys[property.value] = _extends({}, lhs, {
                Type: Syntax.MemoryAssignment,
                params: [_extends({}, lhs, {
                  Type: Syntax.ArraySubscript,
                  params: [lhs, property]
                }), value]
              });
            },
            [Syntax.Spread]: (spread, _) => {
              // find userType
              const { scopes, userTypes } = context;
              const [target] = spread.params;
              const userType = userTypes[scope_4(scopes, target.value).type];
              const keyOffsetMap = userType.meta[TYPE_OBJECT];
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
          })(rhs);

          // $FlowFixMe - Flow is dumb sometimes. clearly values here are all NodeType
          const params = Object.values(_extends({}, spreadKeys, individualKeys));

          return _extends({}, lhs, {
            Type: Syntax.Block,
            // We just created a bunch of MemoryAssignment nodes, map over them so that
            // the correct metadata is applied to everything
            params: params.map(p => transform([p, context]))
          });
        }
      };
    }
  };
}

/**
 * Native methods plugin
 *
 *      
 */
function nativePlugin() {
  return {
    semantics() {
      return {
        [Syntax.FunctionCall]: next => (args, transform) => {
          const [node, context] = args;
          const [id, ...fnArgs] = node.params;
          if (id.Type === Syntax.Access && id.params[0] && id.params[0].Type === Syntax.Type) {
            const [type, method] = id.params;

            return extendNode({
              value: `${type.value}.${method.value}`,
              type: type.value,
              params: fnArgs.map(p => transform([p, context])),
              Type: Syntax.NativeMethod
            }, node);
          }

          return next(args);
        },
        [Syntax.Unreachable]: _ => ([node]) => {
          return extendNode({
            value: 'unreachable',
            params: [],
            Type: Syntax.NativeMethod
          }, node);
        }
      };
    }
  };
}

/**
 * Default Arguments syntax sugar plugin.
 *
 * Converts FUNCTION CALLS with missing arguments to default values
 *
 *      
 */
// $FlowFixMe
function defaultArguments () {
  return {
    grammar: grammar$1,
    semantics() {
      return {
        [Syntax.FunctionDeclaration]: next => args => {
          const [node, context] = args;
          const [argumentsNode] = node.params;

          const defaultArguments = [];

          walkNode({
            Assignment: defaultArg => {
              const [, value] = defaultArg.params;
              defaultArguments.push(value);
            }
          })(argumentsNode);

          // Attach any default arguments found to the function node directly,
          // proceed with the rest of the parsers
          return next([_extends({}, node, {
            meta: _extends({}, node.meta, { DEFAULT_ARGUMENTS: defaultArguments })
          }), context]);
        },
        // There isn't a need to parse out the Assignment expressions as they are
        // not actually compiled/generated into the final binary
        // [Syntax.Assignment]: next => (args, transform) => {
        //   const [node, context] = args;
        //   // Not inside arguments
        //   const currentScope = current(context.scopes);

        //   // Arguments have not been set for scope yet and the current scope is
        //   // not global
        //   if (currentScope.arguments == null && context.scopes.length > 1) {
        //     return next(args);
        //   }

        //   // Assignment has higher precedence than ":" Pair expressions so the
        //   // children of this node will be [Pair(id:type), Constant(value)]
        //   // remove the constant return the pair.
        //   //
        //   // A helpful visual of a valid default argument syntax:
        //   //
        //   //      function fn(x : i32, y : i32, z : i32 = 0) { ... }
        //   const [pair] = node.params;

        //   // Short circuit the parsers since it does not make sense to process
        //   // assignment anymore. Instead parse the Pair, which is the argument.
        //   return transform([pair, context]);
        // },
        [Syntax.FunctionCall]: next => args => {
          const [call, context] = args;
          const { functions } = context;
          const [id, ...fnArgs] = call.params;

          const target = functions[id.value];

          // Most likely a built-in function
          if (!target) {
            return next(args);
          }

          const expectedArguments = target.meta.FUNCTION_METADATA.argumentsCount;
          const count = fnArgs.length;
          const difference = expectedArguments - count;
          if (difference > 0) {
            return next([_extends({}, call, {
              params: [...call.params, ...target.meta.DEFAULT_ARGUMENTS.slice(difference - 1)]
            }), context]);
          }

          return next(args);
        }
      };
    }
  };
}

/**
 * Sizeof helper plugin. Maps size(<THING>) to a static i32 constant
 *
 *      
 */
const sizes$1 = {
  i64: 8,
  f64: 8,
  i32: 4,
  f32: 4
};

function sizeofPlugin() {
  return {
    semantics() {
      return {
        [Syntax.FunctionCall]: next => args => {
          const [sizeof, context] = args;

          if (sizeof.value !== 'sizeof') {
            return next(args);
          }

          const { scopes, userTypes, functions } = context;
          const [, target] = sizeof.params;
          const ref = scope_4(scopes, target.value);
          const { type = '' } = ref || {};
          const userType = userTypes[target.value] || userTypes[type];
          const func = functions[target.value];

          if (userType != null) {
            const metaSize = userType.meta[OBJECT_SIZE];
            invariant_1(metaSize, 'Object size information is missing');
            return _extends({}, sizeof, {
              value: metaSize,
              params: [],
              type: 'i32',
              Type: Syntax.Constant
            });
          }

          const node = ref || func;

          return _extends({}, sizeof, {
            value: sizes$1[String(node ? node.type : target.value)] || '4',
            type: 'i32',
            params: [],
            Type: Syntax.Constant
          });
        }
      };
    }
  };
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


const getBuiltInParsers = () => {
  return [base().semantics, Core().semantics, Imports().semantics, typePlugin().semantics, unary().semantics, coreFunctionPlugin().semantics, booleanPlugin().semantics, arrayPlugin().semantics, memoryPlugin().semantics, Strings().semantics, functionPointer().semantics, Struct().semantics, nativePlugin().semantics, sizeofPlugin().semantics, defaultArguments().semantics];
};

// Return AST with full transformations applied
function semantics(ast, extraSemantics, options) {
  // Generate all the plugin instances with proper options
  const plugins = [...getBuiltInParsers(), ...extraSemantics];

  // Here each semantics parser will receive a reference to the parser & fragment
  // this allows a semantic parser to utilize the same grammar rules as the rest
  // of the program.
  const combined = combineParsers(plugins.map(p => p(options)));

  // The context is what we use to transfer state from one parser to another.
  // Global state like type information and scope chains for example.
  const context = {
    functions: {},
    types: {},
    userTypes: {},
    table: {},
    hoist: [],
    statics: {},
    path: [],
    scopes: scope_1([], GLOBAL_INDEX),
    memories: [],
    tables: []
  };
  // Parse the current ast
  const parsed = mapNode_1(combined)([ast, context]);

  const { functions, scopes, types, userTypes, statics, hoist } = context;
  return _extends({}, parsed, {
    meta: _extends({}, parsed.meta, {
      // Attach information collected to the AST
      [AST_METADATA]: {
        functions,
        globals: scopes[0],
        types,
        userTypes,
        statics
      }
    }),
    params: [...parsed.params, ...hoist]
  });
}

//      

function generateErrorString(msg, error, marker, filename, func) {
  const line = marker.start.line;
  const col = marker.start.col;
  const end = marker.end.col;
  const Line = marker.end.sourceLine;

  const highlight = new Array(end - col + 2).join('^').padStart(marker.start.col - 2, ' ');
  return '\n' + Line + '\n' + highlight + ` ${error}` + '\n' + msg + '\n' + `  at ${func} (${filename}:${line}:${col})`;
}

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

opcode(___, ___, ___, 0, 0x00, 'Unreachable', 'unreachable');
opcode(___, ___, ___, 0, 0x01, 'Nop', 'nop');
opcode(___, ___, ___, 0, 0x02, 'Block', 'block');
opcode(___, ___, ___, 0, 0x03, 'Loop', 'loop');
opcode(___, ___, ___, 0, 0x04, 'If', 'if');
opcode(___, ___, ___, 0, 0x05, 'Else', 'else');
opcode(___, ___, ___, 0, 0x06, 'Try', 'try');
opcode(___, ___, ___, 0, 0x07, 'Catch', 'catch');
opcode(___, ___, ___, 0, 0x08, 'Throw', 'throw');
opcode(___, ___, ___, 0, 0x09, 'Rethrow', 'rethrow');
opcode(___, ___, ___, 0, 0x0a, 'CatchAll', 'catch_all');
opcode(___, ___, ___, 0, 0x0b, 'End', 'end');
opcode(___, ___, ___, 0, 0x0c, 'Br', 'br');
opcode(___, ___, ___, 0, 0x0d, 'BrIf', 'br_if');
opcode(___, ___, ___, 0, 0x0e, 'BrTable', 'br_table');
opcode(___, ___, ___, 0, 0x0f, 'Return', 'return');
opcode(___, ___, ___, 0, 0x10, 'Call', 'call');
opcode(___, ___, ___, 0, 0x11, 'CallIndirect', 'call_indirect');
opcode(___, ___, ___, 0, 0x1a, 'Drop', 'drop');
opcode(___, ___, ___, 0, 0x1b, 'Select', 'select');
opcode(___, ___, ___, 0, 0x20, 'GetLocal', 'get_local');
opcode(___, ___, ___, 0, 0x21, 'SetLocal', 'set_local');
opcode(___, ___, ___, 0, 0x22, 'TeeLocal', 'tee_local');
opcode(___, ___, ___, 0, 0x23, 'GetGlobal', 'get_global');
opcode(___, ___, ___, 0, 0x24, 'SetGlobal', 'set_global');
opcode(index_1, index_1, ___, 4, 0x28, 'i32Load', 'i32.load');
opcode(index_2, index_1, ___, 8, 0x29, 'i64Load', 'i64.load');
opcode(index_3, index_1, ___, 4, 0x2a, 'f32Load', 'f32.load');
opcode(index_4, index_1, ___, 8, 0x2b, 'f64Load', 'f64.load');
opcode(index_1, index_1, ___, 1, 0x2c, 'i32Load8S', 'i32.load8_s');
opcode(index_1, index_1, ___, 1, 0x2d, 'i32Load8U', 'i32.load8_u');
opcode(index_1, index_1, ___, 2, 0x2e, 'i32Load16S', 'i32.load16_s');
opcode(index_1, index_1, ___, 2, 0x2f, 'i32Load16U', 'i32.load16_u');
opcode(index_2, index_1, ___, 1, 0x30, 'i64Load8S', 'i64.load8_s');
opcode(index_2, index_1, ___, 1, 0x31, 'i64Load8U', 'i64.load8_u');
opcode(index_2, index_1, ___, 2, 0x32, 'i64Load16S', 'i64.load16_s');
opcode(index_2, index_1, ___, 2, 0x33, 'i64Load16U', 'i64.load16_u');
opcode(index_2, index_1, ___, 4, 0x34, 'i64Load32S', 'i64.load32_s');
opcode(index_2, index_1, ___, 4, 0x35, 'i64Load32U', 'i64.load32_u');
opcode(___, index_1, index_1, 4, 0x36, 'i32Store', 'i32.store');
opcode(___, index_1, index_2, 8, 0x37, 'i64Store', 'i64.store');
opcode(___, index_1, index_3, 4, 0x38, 'f32Store', 'f32.store');
opcode(___, index_1, index_3, 8, 0x39, 'f64Store', 'f64.store');
opcode(___, index_1, index_1, 1, 0x3a, 'i32Store8', 'i32.store8');
opcode(___, index_1, index_1, 2, 0x3b, 'i32Store16', 'i32.store16');
opcode(___, index_1, index_2, 1, 0x3c, 'i64Store8', 'i64.store8');
opcode(___, index_1, index_2, 2, 0x3d, 'i64Store16', 'i64.store16');
opcode(___, index_1, index_2, 4, 0x3e, 'i64Store32', 'i64.store32');
opcode(index_1, ___, ___, 0, 0x3f, 'CurrentMemory', 'current_memory');
opcode(index_1, index_1, ___, 0, 0x40, 'GrowMemory', 'grow_memory');
opcode(index_1, ___, ___, 0, 0x41, 'i32Const', 'i32.const');
opcode(index_2, ___, ___, 0, 0x42, 'i64Const', 'i64.const');
opcode(index_3, ___, ___, 0, 0x43, 'f32Const', 'f32.const');
opcode(index_4, ___, ___, 0, 0x44, 'f64Const', 'f64.const');
opcode(index_1, index_1, ___, 0, 0x45, 'i32Eqz', 'i32.eqz');
opcode(index_1, index_1, index_1, 0, 0x46, 'i32Eq', 'i32.eq');
opcode(index_1, index_1, index_1, 0, 0x47, 'i32Ne', 'i32.ne');
opcode(index_1, index_1, index_1, 0, 0x48, 'i32LtS', 'i32.lt_s');
opcode(index_1, index_1, index_1, 0, 0x49, 'i32LtU', 'i32.lt_u');
opcode(index_1, index_1, index_1, 0, 0x4a, 'i32GtS', 'i32.gt_s');
opcode(index_1, index_1, index_1, 0, 0x4b, 'i32GtU', 'i32.gt_u');
opcode(index_1, index_1, index_1, 0, 0x4c, 'i32LeS', 'i32.le_s');
opcode(index_1, index_1, index_1, 0, 0x4d, 'i32LeU', 'i32.le_u');
opcode(index_1, index_1, index_1, 0, 0x4e, 'i32GeS', 'i32.ge_s');
opcode(index_1, index_1, index_1, 0, 0x4f, 'i32GeU', 'i32.ge_u');
opcode(index_1, index_2, ___, 0, 0x50, 'i64Eqz', 'i64.eqz');
opcode(index_1, index_2, index_2, 0, 0x51, 'i64Eq', 'i64.eq');
opcode(index_1, index_2, index_2, 0, 0x52, 'i64Ne', 'i64.ne');
opcode(index_1, index_2, index_2, 0, 0x53, 'i64LtS', 'i64.lt_s');
opcode(index_1, index_2, index_2, 0, 0x54, 'i64LtU', 'i64.lt_u');
opcode(index_1, index_2, index_2, 0, 0x55, 'i64GtS', 'i64.gt_s');
opcode(index_1, index_2, index_2, 0, 0x56, 'i64GtU', 'i64.gt_u');
opcode(index_1, index_2, index_2, 0, 0x57, 'i64LeS', 'i64.le_s');
opcode(index_1, index_2, index_2, 0, 0x58, 'i64LeU', 'i64.le_u');
opcode(index_1, index_2, index_2, 0, 0x59, 'i64GeS', 'i64.ge_s');
opcode(index_1, index_2, index_2, 0, 0x5a, 'i64GeU', 'i64.ge_u');
opcode(index_1, index_3, index_3, 0, 0x5b, 'f32Eq', 'f32.eq');
opcode(index_1, index_3, index_3, 0, 0x5c, 'f32Ne', 'f32.ne');
opcode(index_1, index_3, index_3, 0, 0x5d, 'f32Lt', 'f32.lt');
opcode(index_1, index_3, index_3, 0, 0x5e, 'f32Gt', 'f32.gt');
opcode(index_1, index_3, index_3, 0, 0x5f, 'f32Le', 'f32.le');
opcode(index_1, index_3, index_3, 0, 0x60, 'f32Ge', 'f32.ge');
opcode(index_1, index_3, index_3, 0, 0x61, 'f64Eq', 'f64.eq');
opcode(index_1, index_3, index_3, 0, 0x62, 'f64Ne', 'f64.ne');
opcode(index_1, index_3, index_3, 0, 0x63, 'f64Lt', 'f64.lt');
opcode(index_1, index_3, index_3, 0, 0x64, 'f64Gt', 'f64.gt');
opcode(index_1, index_3, index_3, 0, 0x65, 'f64Le', 'f64.le');
opcode(index_1, index_3, index_3, 0, 0x66, 'f64Ge', 'f64.ge');
opcode(index_1, index_1, ___, 0, 0x67, 'i32Clz', 'i32.clz');
opcode(index_1, index_1, ___, 0, 0x68, 'i32Ctz', 'i32.ctz');
opcode(index_1, index_1, ___, 0, 0x69, 'i32Popcnt', 'i32.popcnt');
opcode(index_1, index_1, index_1, 0, 0x6a, 'i32Add', 'i32.add');
opcode(index_1, index_1, index_1, 0, 0x6b, 'i32Sub', 'i32.sub');
opcode(index_1, index_1, index_1, 0, 0x6c, 'i32Mul', 'i32.mul');
opcode(index_1, index_1, index_1, 0, 0x6d, 'i32DivS', 'i32.div_s');
opcode(index_1, index_1, index_1, 0, 0x6e, 'i32DivU', 'i32.div_u');
opcode(index_1, index_1, index_1, 0, 0x6f, 'i32RemS', 'i32.rem_s');
opcode(index_1, index_1, index_1, 0, 0x70, 'i32RemU', 'i32.rem_u');
opcode(index_1, index_1, index_1, 0, 0x71, 'i32And', 'i32.and');
opcode(index_1, index_1, index_1, 0, 0x72, 'i32Or', 'i32.or');
opcode(index_1, index_1, index_1, 0, 0x73, 'i32Xor', 'i32.xor');
opcode(index_1, index_1, index_1, 0, 0x74, 'i32Shl', 'i32.shl');
opcode(index_1, index_1, index_1, 0, 0x75, 'i32ShrS', 'i32.shr_s');
opcode(index_1, index_1, index_1, 0, 0x76, 'i32ShrU', 'i32.shr_u');
opcode(index_1, index_1, index_1, 0, 0x77, 'i32Rotl', 'i32.rotl');
opcode(index_1, index_1, index_1, 0, 0x78, 'i32Rotr', 'i32.rotr');
opcode(index_2, index_2, ___, 0, 0x79, 'i64Clz', 'i64.clz');
opcode(index_2, index_2, ___, 0, 0x7a, 'i64Ctz', 'i64.ctz');
opcode(index_2, index_2, ___, 0, 0x7b, 'i64Popcnt', 'i64.popcnt');
opcode(index_2, index_2, index_2, 0, 0x7c, 'i64Add', 'i64.add');
opcode(index_2, index_2, index_2, 0, 0x7d, 'i64Sub', 'i64.sub');
opcode(index_2, index_2, index_2, 0, 0x7e, 'i64Mul', 'i64.mul');
opcode(index_2, index_2, index_2, 0, 0x7f, 'i64DivS', 'i64.div_s');
opcode(index_2, index_2, index_2, 0, 0x80, 'i64DivU', 'i64.div_u');
opcode(index_2, index_2, index_2, 0, 0x81, 'i64RemS', 'i64.rem_s');
opcode(index_2, index_2, index_2, 0, 0x82, 'i64RemU', 'i64.rem_u');
opcode(index_2, index_2, index_2, 0, 0x83, 'i64And', 'i64.and');
opcode(index_2, index_2, index_2, 0, 0x84, 'i64Or', 'i64.or');
opcode(index_2, index_2, index_2, 0, 0x85, 'i64Xor', 'i64.xor');
opcode(index_2, index_2, index_2, 0, 0x86, 'i64Shl', 'i64.shl');
opcode(index_2, index_2, index_2, 0, 0x87, 'i64ShrS', 'i64.shr_s');
opcode(index_2, index_2, index_2, 0, 0x88, 'i64ShrU', 'i64.shr_u');
opcode(index_2, index_2, index_2, 0, 0x89, 'i64Rotl', 'i64.rotl');
opcode(index_2, index_2, index_2, 0, 0x8a, 'i64Rotr', 'i64.rotr');
opcode(index_3, index_3, index_3, 0, 0x8b, 'f32Abs', 'f32.abs');
opcode(index_3, index_3, index_3, 0, 0x8c, 'f32Neg', 'f32.neg');
opcode(index_3, index_3, index_3, 0, 0x8d, 'f32Ceil', 'f32.ceil');
opcode(index_3, index_3, index_3, 0, 0x8e, 'f32Floor', 'f32.floor');
opcode(index_3, index_3, index_3, 0, 0x8f, 'f32Trunc', 'f32.trunc');
opcode(index_3, index_3, index_3, 0, 0x90, 'f32Nearest', 'f32.nearest');
opcode(index_3, index_3, index_3, 0, 0x91, 'f32Sqrt', 'f32.sqrt');
opcode(index_3, index_3, index_3, 0, 0x92, 'f32Add', 'f32.add');
opcode(index_3, index_3, index_3, 0, 0x93, 'f32Sub', 'f32.sub');
opcode(index_3, index_3, index_3, 0, 0x94, 'f32Mul', 'f32.mul');
opcode(index_3, index_3, index_3, 0, 0x95, 'f32Div', 'f32.div');
opcode(index_3, index_3, index_3, 0, 0x96, 'f32Min', 'f32.min');
opcode(index_3, index_3, index_3, 0, 0x97, 'f32Max', 'f32.max');
opcode(index_3, index_3, index_3, 0, 0x98, 'f32Copysign', 'f32.copysign');
opcode(index_3, index_3, index_3, 0, 0x99, 'f32Abs', 'f64.abs');
opcode(index_3, index_3, index_3, 0, 0x9a, 'f32Neg', 'f64.neg');
opcode(index_3, index_3, index_3, 0, 0x9b, 'f32Ceil', 'f64.ceil');
opcode(index_3, index_3, index_3, 0, 0x9c, 'f32Floor', 'f64.floor');
opcode(index_3, index_3, index_3, 0, 0x9d, 'f32Trunc', 'f64.trunc');
opcode(index_3, index_3, index_3, 0, 0x9e, 'f32Nearest', 'f64.nearest');
opcode(index_3, index_3, index_3, 0, 0x9f, 'f32Sqrt', 'f64.sqrt');
opcode(index_4, index_4, index_4, 0, 0xa0, 'f64Add', 'f64.add');
opcode(index_4, index_4, index_4, 0, 0xa1, 'f64Sub', 'f64.sub');
opcode(index_4, index_4, index_4, 0, 0xa2, 'f64Mul', 'f64.mul');
opcode(index_4, index_4, index_4, 0, 0xa3, 'f64Div', 'f64.div');
opcode(index_4, index_4, index_4, 0, 0xa4, 'f64Min', 'f64.min');
opcode(index_4, index_4, index_4, 0, 0xa5, 'f64Max', 'f64.max');
opcode(index_4, index_4, index_4, 0, 0xa6, 'f64Copysign', 'f64.copysign');
opcode(index_1, index_2, ___, 0, 0xa7, 'i32Wrapi64', 'i32.wrap/i64');
opcode(index_1, index_3, ___, 0, 0xa8, 'i32TruncSf32', 'i32.trunc_s/f32');
opcode(index_1, index_3, ___, 0, 0xa9, 'i32TruncUf32', 'i32.trunc_u/f32');
opcode(index_1, index_3, ___, 0, 0xaa, 'i32TruncSf64', 'i32.trunc_s/f64');
opcode(index_1, index_3, ___, 0, 0xab, 'i32TruncUf64', 'i32.trunc_u/f64');
opcode(index_2, index_1, ___, 0, 0xac, 'i64ExtendSi32', 'i64.extend_s/i32');
opcode(index_2, index_1, ___, 0, 0xad, 'i64ExtendUi32', 'i64.extend_u/i32');
opcode(index_2, index_3, ___, 0, 0xae, 'i64TruncSf32', 'i64.trunc_s/f32');
opcode(index_2, index_3, ___, 0, 0xaf, 'i64TruncUf32', 'i64.trunc_u/f32');
opcode(index_2, index_3, ___, 0, 0xb0, 'i64TruncSf64', 'i64.trunc_s/f64');
opcode(index_2, index_3, ___, 0, 0xb1, 'i64TruncUf64', 'i64.trunc_u/f64');
opcode(index_3, index_1, ___, 0, 0xb2, 'f32ConvertSi32', 'f32.convert_s/i32');
opcode(index_3, index_1, ___, 0, 0xb3, 'f32ConvertUi32', 'f32.convert_u/i32');
opcode(index_3, index_2, ___, 0, 0xb4, 'f32ConvertSi64', 'f32.convert_s/i64');
opcode(index_3, index_2, ___, 0, 0xb5, 'f32ConvertUi64', 'f32.convert_u/i64');
opcode(index_3, index_3, ___, 0, 0xb6, 'f32Demotef64', 'f32.demote/f64');
opcode(index_3, index_1, ___, 0, 0xb7, 'f64ConvertSi32', 'f64.convert_s/i32');
opcode(index_3, index_1, ___, 0, 0xb8, 'f64ConvertUi32', 'f64.convert_u/i32');
opcode(index_3, index_2, ___, 0, 0xb9, 'f64ConvertSi64', 'f64.convert_s/i64');
opcode(index_3, index_2, ___, 0, 0xba, 'f64ConvertUi64', 'f64.convert_u/i64');
opcode(index_3, index_3, ___, 0, 0xbb, 'f64Promotef32', 'f64.promote/f32');
opcode(index_1, index_3, ___, 0, 0xbc, 'i32Reinterpretf32', 'i32.reinterpret/f32');
opcode(index_2, index_3, ___, 0, 0xbd, 'i64Reinterpretf64', 'i64.reinterpret/f64');
opcode(index_3, index_1, ___, 0, 0xbe, 'f32Reinterpreti32', 'f32.reinterpret/i32');
opcode(index_3, index_2, ___, 0, 0xbf, 'f32Reinterpreti64', 'f64.reinterpret/i64');

const getTypecastOpcode = (to, from) => {
  const toType = to[0];

  if (['i32', 'bool'].includes(to) && from === 'i64') {
    return def.i32Wrapi64;
  }
  if (to === 'i64' && ['i32', 'bool'].includes(from)) {
    return def.i64ExtendSi32;
  }

  if (to === 'f32' && from === 'f64') {
    return def.f32Demotef64;
  }
  if (to === 'f64' && from === 'f32') {
    return def.f64Promotef32;
  }

  const conversion = toType === 'f' ? 'ConvertS' : 'TruncS';
  return def[to + conversion + from];
};

/**
 * Return opcode mapping to the operator. Signed result is always preferred
 */
const opcodeFromOperator = ({
  type,
  value
}) => {
  // 100% code coverage is a harsh mistress
  const mapping = {
    '+': def[String(type) + 'Add'],
    '-': def[String(type) + 'Sub'],
    '*': def[String(type) + 'Mul'],
    '/': def[String(type) + 'DivS'] || def[String(type) + 'Div'],
    '%': def[String(type) + 'RemS'] || def[String(type) + 'RemU'],
    '==': def[String(type) + 'Eq'],
    '!=': def[String(type) + 'Ne'],
    '>': def[String(type) + 'Gt'] || def[String(type) + 'GtS'],
    '<': def[String(type) + 'Lt'] || def[String(type) + 'LtS'],
    '<=': def[String(type) + 'Le'] || def[String(type) + 'LeS'],
    '>=': def[String(type) + 'Ge'] || def[String(type) + 'GeS'],
    '?': def.If,
    ':': def.Else,
    '&': def[String(type) + 'And'],
    '|': def[String(type) + 'Or'],
    '^': def[String(type) + 'Xor'],
    '>>': def[String(type) + 'ShrS'],
    '>>>': def[String(type) + 'ShrU'],
    '<<': def[String(type) + 'Shl']
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
      return 'i64';
    case F32:
      return 'f32';
    case F64:
      return 'f64';
    case FUNC:
      return 'func';
    case ANYFUNC:
      return 'anyfunc';
    case I32:
    default:
      return 'i32';
  }
};

//      
const scopeOperation = curry_1((op, node) => {
  const local = node.meta[LOCAL_INDEX];
  const _global = node.meta[GLOBAL_INDEX];
  const index = local != null ? local : _global;

  invariant_1(index != null, `Unefined index for scope Operation. Possibly missing metadata. op: ${JSON.stringify(op)} node: ${JSON.stringify(node, null, 2)}`);

  const kind = local != null ? op + 'Local' : op + 'Global';
  const params = [Number(index)];

  return {
    kind: def[kind],
    params,
    debug: `${node.value}<${node.meta.ALIAS || node.type}>`
  };
});

const getConstOpcode = node => {
  const nodeType = node.type || waltSyntax_3.i32;

  const kind = def[nodeType + 'Const'];
  const params = [Number(node.value)];

  return [{
    kind,
    params
  }];
};

// clean this up
const getType = str => {
  switch (str) {
    case waltSyntax_3.f32:
      return F32;
    case waltSyntax_3.f64:
      return F64;
    case waltSyntax_3.i64:
      return I64;
    case waltSyntax_3.i32:
    default:
      return I32;
  }
};

const isBuiltinType = type => {
  return typeof type === 'string' && waltSyntax_3[type] != null;
};

const generateValueType = node => ({
  mutable: node.meta[TYPE_CONST] ? 0 : 1,
  type: getType(node.type)
});
const setInScope = scopeOperation('Set');
const getInScope = scopeOperation('Get');

//      
// AST Validator
const GLOBAL_LABEL = 'global';

// We walk the the entire tree and perform syntax validation before we continue
// onto the generator. This may throw sometimes
function validate(ast, {
  filename
}) {
  const metadata = ast.meta[AST_METADATA];
  if (metadata == null) {
    throw new Error('Missing AST metadata!');
  }
  const { types, functions, userTypes } = metadata;
  const problems = [];

  walkNode({
    [Syntax.Import]: (importNode, _) => {
      walkNode({
        [Syntax.BinaryExpression]: (binary, __) => {
          const [start, end] = binary.range;
          problems.push(generateErrorString("Using an 'as' import without a type.", 'A type for original import ' + binary.params[0].value + ' is not defined nor could it be inferred.', { start, end }, filename, GLOBAL_LABEL));
        },
        [Syntax.Identifier]: (identifier, __) => {
          const [start, end] = identifier.range;
          problems.push(generateErrorString('Infered type not supplied.', "Looks like you'd like to infer a type, but it was never provided by a linker. Non-concrete types cannot be compiled.", { start, end }, filename, GLOBAL_LABEL));
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

      if (!isBuiltinType(decl.type) && !types[decl.type] && !userTypes[decl.type]) {
        problems.push(generateErrorString('Unknown type used in a declaration, ' + `"${String(decl.type)}"`, 'Variables must be assigned with a known type.', { start, end }, filename, GLOBAL_LABEL));
      }
    },
    [Syntax.FunctionDeclaration]: (func, __) => {
      const functionName = `${func.value}()`;
      walkNode({
        [Syntax.Declaration]: (node, _validator) => {
          const [start, end] = node.range;

          if (!isBuiltinType(node.type) && !types[node.type] && !userTypes[node.type]) {
            problems.push(generateErrorString('Unknown type used in a declartion, ' + `"${String(node.type)}"`, 'Variables must be assigned with a known type.', { start, end }, filename, functionName));
          }
        },
        [Syntax.Assignment]: node => {
          const [identifier] = node.params;
          const [start, end] = node.range;

          const isConst = identifier.meta[TYPE_CONST];
          if (isConst) {
            problems.push(generateErrorString(`Cannot reassign a const variable ${identifier.value}`, 'const variables cannot be reassigned, use let instead.', { start, end }, filename, functionName));
          }
        },
        [Syntax.Access]: (node, _validator) => {
          const [identifier, offset] = node.params;
          const [start, end] = node.range;
          if (!node.meta.ALIAS) {
            problems.push(generateErrorString('Cannot generate property access', `Target ${identifier.value} does not appear to be a struct.`, { start, end }, filename, functionName));
          }

          if (offset.value == null) {
            const alias = offset.meta[ALIAS];
            problems.push(generateErrorString('Cannot generate property access', `Undefined key ${alias != null ? alias : offset.value} for type ${String(identifier.meta.ALIAS)}`, { start, end }, filename, functionName));
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
          const type = node.type;

          if (typeWeight(type) !== typeWeight(func.type)) {
            problems.push(generateErrorString('Missing return value', 'Inconsistent return value. Expected ' + func.type + ' received ' + String(type), { start, end }, filename, functionName));
          }
        },
        [Syntax.FunctionCall]: (node, _validator) => {
          if (functions[node.value] == null) {
            const [start, end] = node.range;

            problems.push(generateErrorString('Undefined function reference', `${node.value} is not defined.`, { start, end }, filename, functionName));
          }
        },
        [Syntax.IndirectFunctionCall]: (node, _validator) => {
          const identifier = node.params[node.params.length - 1];
          const type = types[identifier.type];

          if (!isBuiltinType(identifier.type) && type == null) {
            const [start, end] = node.range;
            problems.push(generateErrorString('Cannot make an indirect call without a valid function type', `${identifier.value} has type ${String(identifier.type)} which is not defined. Indirect calls must have pre-defined types.`, { start, end }, filename, functionName));
          }
        }
      })(func);
    }
  })(ast);

  const problemCount = problems.length;
  if (problemCount > 0) {
    const errorString = problems.reduce((acc, value) => {
      return acc + '\n' + `${value}\n`;
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
    debug: `${node.value}<${node.type ? node.type : 'void'}>`
  });

  return block;
};

//      
const generateIndirectFunctionCall = (node, parent) => {
  const block = node.params.map(mapSyntax(parent)).reduce(mergeBlock, []);
  const localIndex = node.meta[LOCAL_INDEX];
  const typeIndexMeta = node.meta[TYPE_INDEX];
  invariant_1(localIndex != null, 'Undefined local index, not a valid function pointer');
  invariant_1(typeIndexMeta != null, 'Variable is not of a valid function pointer type');

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
  // The whole thing is encoded as an implicitly returned if/then/else block.
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
    kind: opcodeFromOperator({ value: ':', type: 'i32' }),
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

  // followed by the optional 'else'
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
  const block = node.params.filter(Boolean).map(mapSyntax(null)).reduce(mergeBlock, []);
  block.push({ kind: def.Return, params: [] });

  return block;
};

//      
const generateExpression = (node, parent) => [node].map(mapSyntax(parent)).reduce(mergeBlock, []);

//      
const generateDeclaration = (node, parent) => {
  const initNode = node.params[0];

  if (initNode) {
    const metaIndex = node.meta[LOCAL_INDEX];

    const type = isBuiltinType(node.type) ? node.type : waltSyntax_5;

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
  const type = identifier.meta[TYPE_ARRAY];
  const block = node.params.map(mapSyntax(parent)).reduce(mergeBlock, []);

  // For array types, the index is multiplied by the contained object size
  block.push.apply(block, [{ kind: def.i32Const, params: [2] }, { kind: def.i32Shl, params: [] }]);

  // The sequence of opcodes to perfrom a memory load is
  // get(Local|Global) base, i32Const offset[, i32Const size, i32Mul ], i32Add
  block.push({ kind: def.i32Add, params: [] });

  block.push({
    kind: def[String(type) + 'Load'],
    params: [
    // Alignment
    2,
    // Memory. Always 0 in the WASM MVP
    0],
    debug: `${identifier.value} : ${JSON.stringify(identifier.type)}`
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
    kind: def[String(type) + 'Store'],
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

  if (node.value === '&&') {
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

const immediates = {
  grow_memory: 0,
  current_memory: 0
};

const generateNative = (node, parent) => {
  const block = node.params.map(mapSyntax(parent)).reduce(mergeBlock, []);

  const operation = node.value.split('.').pop();

  if (alignCodes[operation] == null) {
    block.push({ kind: textMap[node.value], params: [immediates[node.value]] });
  } else {
    const alignment = alignCodes[operation];

    const params = [alignment, 0];

    block.push({ kind: textMap[node.value], params });
  }

  return block;
};

//      
const generateAccess = (node, parent) => {
  const block = node.params.map(mapSyntax(parent)).reduce(mergeBlock, []);
  // The sequence of opcodes to perfrom a memory load is
  // get(Local|Global) base, i32Const offset[, i32Const size, i32Mul ], i32Add
  block.push({ kind: def.i32Add, params: [] });

  block.push({
    kind: def[String(node.type) + 'Load'],
    params: [
    // Alignment
    2,
    // Memory. Always 0 in the WASM MVP
    0]
  });

  return block;
};

//      
const syntaxMap = {
  [Syntax.Access]: generateAccess,
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
  // Typecast
  [Syntax.TypeCast]: generateTypecast,
  [Syntax.Noop]: generateNoop,
  [Syntax.NativeMethod]: generateNative
};

const mapSyntax = curry_1((parent, operand) => {
  const mapping = syntaxMap[operand.Type];
  invariant_1(mapping, `Unexpected Syntax Token. ${operand.Type} "${operand.value}"`);

  return mapping(operand, parent);
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
  walkNode({
    [Syntax.Pair]: ({ params }) => {
      // This could produce garbage values but that is a fault of the source code
      const [{ value: key }, { value }] = params;
      memory[key] = parseInt(value);
    }
  })(node);

  return memory;
};

//      
function generateMemory$2(node) {
  const table = { max: 0, initial: 0, type: '' };

  walkNode({
    [Syntax.Pair]: ({ params }) => {
      // This could produce garbage values but that is a fault of the source code
      const [{ value: key }, { value }] = params;
      if (key === 'initial') {
        table.initial = parseInt(value);
      } else if (key === 'element') {
        table.type = value;
      } else if (key === 'max') {
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

const parseBounds = node => {
  const memory = {};
  walkNode({
    [Syntax.Pair]: ({ params }) => {
      const [{ value: key }, { value }] = params;
      memory[key] = parseInt(value);
    }
  })(node);
  return memory;
};

//      
const getKindConstant = value => {
  switch (value) {
    case 'Memory':
      return EXTERN_MEMORY;
    case 'Table':
      return EXTERN_TABLE;
    case 'i32':
    case 'f32':
    case 'i64':
    case 'f64':
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
  walkNode({
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
      const bounds = importTypeValue === 'Memory' ? parseBounds(typeOrIdentifierNode) : {};

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
    case 'f32':
      return F32;
    case 'f64':
      return F64;
    case 'i64':
      return I64;
    case 'i32':
    case 'Function':
    default:
      return I32;
  }
};

const generateImplicitFunctionType = functionNode => {
  const [argsNode] = functionNode.params;
  const resultType = functionNode.type ? getType$1(functionNode.type) : null;

  const params = [];
  walkNode({
    [Syntax.Pair]: pairNode => {
      const typeNode = pairNode.params[1];
      invariant_1(typeNode, 'Undefined type in a argument expression');
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
  invariant_1(typeof id === 'string', `Generator: A type must have a valid string identifier, node: ${JSON.stringify(node)}`);

  const [args, result] = node.params;

  // Collect the function params and result by walking the tree of nodes
  const params = [];

  walkNode({
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
    result: result.type && result.type !== 'void' ? getType$1(result.type) : null
  };
}

//      
// import { stringEncoder } from '../utils/string';
function generateData(statics, DATA_SECTION_HEADER_SIZE) {
  // Reserve N bytes for data size header
  let offsetAccumulator = DATA_SECTION_HEADER_SIZE;

  const map = {};

  const data = Object.entries(statics).reduce((acc, [key, encoded]) => {
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
  invariant_1(body, 'Cannot generate code for function without body');
  invariant_1(metadata, 'Cannot generate code for function without metadata');

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

  block.code = body.map(mapSyntax(block)).reduce(mergeBlock, []);

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
  const astWithTypes = mapNode_2({
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
  })(mapNode_2({
    [Syntax.Import]: (node, _) => node,
    [Syntax.StringLiteral]: (node, _ignore) => {
      const { value } = node;

      // Don't replace any statics which are not mapped. For example table
      // definitions have StringLiterals, but these literals do not get converted.
      if (staticsMap[value] == null) {
        return node;
      }

      return _extends({}, node, {
        value: String(staticsMap[value]),
        Type: Syntax.Constant
      });
    },
    [Syntax.StaticValueList]: node => {
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
          case 'Memory':
            program.Memory.push(generateMemory(node));
            break;
          case 'Table':
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

      const patched = mapNode_2({
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
      invariant_1(index != null, 'Function index must be set');

      program.Functions[index] = typeIndex;
      // We will need to filter out the empty slots later
      program.Code[index] = generateCode(patched);

      if (patched.value === 'start') {
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
                index: Number(local.meta['local/index'])
              };
            })
          };
        }
      }
    }
  };

  walkNode(nodeMap)(astWithTypes);

  // Unlike function indexes we need function bodies to be exact
  program.Code = program.Code.filter(Boolean);

  return program;
}

//      
const VERSION_1 = 0x1;
const MAGIC = 0x6d736100;



function write(version) {
  return new OutputStream().push(index_12, MAGIC, '\\0asm').push(index_12, version, `version ${version}`);
}

//      

const varuint7 = 'varuint7';
const varuint32 = 'varuint32';
const varint7 = 'varint7';
const varint1 = 'varint1';
const varint32 = 'varint32';
const varint64 = 'varint64';

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
  const payload = new OutputStream().push(varuint32, entries.length, 'entry count');

  entries.forEach(entry => {
    emitString(payload, entry.module, 'module');
    emitString(payload, entry.field, 'field');

    switch (entry.kind) {
      case EXTERN_GLOBAL:
        {
          payload.push(index_9, EXTERN_GLOBAL, 'Global');
          payload.push(index_9, entry.type, getTypeString(entry.type));
          payload.push(index_9, 0, 'immutable');
          break;
        }
      case EXTERN_FUNCTION:
        {
          payload.push(index_9, entry.kind, 'Function');
          payload.push(varuint32, entry.typeIndex, 'type index');
          break;
        }
      case EXTERN_TABLE:
        {
          payload.push(index_9, entry.kind, 'Table');
          payload.push(index_9, ANYFUNC, 'function table types');
          payload.push(varint1, 0, 'has max value');
          payload.push(varuint32, 0, 'iniital table size');
          break;
        }
      case EXTERN_MEMORY:
        {
          payload.push(index_9, entry.kind, 'Memory');
          payload.push(varint1, !!entry.max, 'has no max');
          payload.push(varuint32, entry.initial, 'initial memory size(PAGES)');
          if (entry.max) {
            payload.push(varuint32, entry.max, 'max memory size(PAGES)');
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
  payload.push(varuint32, exports.length, 'count');

  exports.forEach(({ field, kind, index }) => {
    emitString(payload, field, 'field');

    payload.push(index_9, kind, 'Global');
    payload.push(varuint32, index, 'index');
  });

  return payload;
};

//      
const encode = (payload, { type, init, mutable }) => {
  payload.push(index_9, type, getTypeString(type));
  payload.push(index_9, mutable, 'mutable');
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
    case I64:
      payload.push(index_9, def.i64Const.code, def.i64Const.text);
      payload.push(varint64, init, `value (${init})`);
  }

  payload.push(index_9, def.End.code, 'end');
};

const emit$3 = globals => {
  const payload = new OutputStream();
  payload.push(varuint32, globals.length, 'count');

  globals.forEach(g => encode(payload, g));

  return payload;
};

//      
// Emits function section. For function code emitter look into code.js
const emit$4 = functions => {
  functions = functions.filter(func => func !== null);
  const stream = new OutputStream();
  stream.push(varuint32, functions.length, 'count');

  functions.forEach(index => stream.push(varuint32, index, 'type index'));

  return stream;
};

//      
function emitTables(start) {
  const stream = new OutputStream();

  if (start.length) {
    stream.push(varuint32, start[0], 'start function');
  }

  return stream;
}

//      
const emitElement = stream => ({ functionIndex }, index) => {
  stream.push(varuint32, 0, 'table index');
  stream.push(index_9, def.i32Const.code, 'offset');
  stream.push(varuint32, index, index.toString());
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

//      
const emitType = (stream, { params, result }, index) => {
  // as of wasm 1.0 spec types are only of from === func
  stream.push(varint7, FUNC, `func type (${index})`);
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

  types.forEach((type, index) => emitType(stream, type, index));

  return stream;
};

//      
const emitLocal = (stream, local) => {
  if (local.isParam == null) {
    stream.push(varuint32, 1, 'number of locals of following type');
    stream.push(varint7, local.type, `${getTypeString(local.type)}`);
  }
};

const emitFunctionBody = (stream, { locals, code, debug: functionName }) => {
  // write bytecode into a clean buffer
  const body = new OutputStream();

  code.forEach(({ kind, params, valueType, debug }) => {
    invariant_1(typeof kind !== 'undefined', `Fatal error! Generated undefined opcode. debug code: ${JSON.stringify(debug)}`);
    // There is a much nicer way of doing this
    body.push(index_9, kind.code, `${kind.text}  ${debug ? debug : ''}`);

    if (valueType) {
      body.push(index_9, valueType.type, 'result type');
      body.push(index_9, valueType.mutable, 'mutable');
    }

    // map over all params, if any and encode each on
    params.filter(p => typeof p !== 'undefined').forEach(p => {
      let type = varuint32;
      let stringType = 'i32.literal';

      // Memory opcode?
      if (kind.code >= 0x28 && kind.code <= 0x40) {
        type = varuint32;
        stringType = 'memory_immediate';
      } else {
        // either encode unsigned 32 bit values or floats
        switch (kind.result) {
          case index_4:
            type = index_4;
            stringType = 'f64.literal';
            break;
          case index_3:
            type = index_3;
            stringType = 'f32.literal';
            break;
          case index_1:
            type = varint32;
            stringType = 'i32.literal';
            break;
          case index_2:
            type = varint64;
            stringType = 'i64.literal';
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

//      
// Emits function section. For function code emitter look into code.js
const emitEntry = (payload, entry) => {
  payload.push(varint1, entry.max ? 1 : 0, 'has no max');
  payload.push(varuint32, entry.initial, 'initial memory size(PAGES)');
  if (entry.max) {
    payload.push(varuint32, entry.max, 'max memory size(PAGES)');
  }
};

const emit$8 = memories => {
  const stream = new OutputStream();
  stream.push(varuint32, memories.length, 'count');
  memories.forEach(entry => emitEntry(stream, entry));

  return stream;
};

//      
const typeBytecodes = {
  anyfunc: 0x70
};

const emitEntry$1 = (payload, entry) => {
  payload.push(varint7, typeBytecodes[entry.type], entry.type);
  payload.push(varint1, entry.max ? 1 : 0, 'has max');
  payload.push(varuint32, entry.initial, 'initial table size');
  if (entry.max) {
    payload.push(varuint32, entry.max, 'max table size');
  }
};

function emitTables$1(tables) {
  const stream = new OutputStream();
  stream.push(varuint32, tables.length, 'count');
  tables.forEach(entry => emitEntry$1(stream, entry));

  return stream;
}

//      
const emitDataSegment = (stream, segment) => {
  stream.push(varuint32, 0, 'memory index');

  const { offset, data } = segment;

  stream.push(index_9, def.i32Const.code, def.i32Const.text);
  stream.push(varint32, offset, `segment offset (${offset})`);
  stream.push(index_9, def.End.code, 'end');

  stream.push(varuint32, data.size, 'segment size');
  // We invert the control here a bit so that any sort of data could be written
  // into the data section. This buys us a bit of flexibility for the cost of
  // doing encoding earlier in the funnel
  stream.write(data);
};

function emit$9(dataSection) {
  const stream = new OutputStream();
  stream.push(varuint32, dataSection.length, 'entries');

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
  emitString(stream, 'name', 'name_len: name');

  // NOTE: Every subsection header is encoded here, not in the individual subsection
  // logic.
  const moduleSubsection = emitModuleName(nameSection.module);
  stream.push(varuint7, 0, 'name_type: Module');
  stream.push(varuint32, moduleSubsection.size, 'name_payload_len');
  stream.write(moduleSubsection);

  const functionSubsection = emitFunctionNames(nameSection.functions);
  stream.push(varuint7, 1, 'name_type: Function');
  stream.push(varuint32, functionSubsection.size, 'name_payload_len');
  stream.write(functionSubsection);

  const localsSubsection = emitLocals(nameSection.locals);
  stream.push(varuint7, 2, 'name_type: Locals');
  stream.push(varuint32, localsSubsection.size, 'name_payload_len');
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

  const stream = new OutputStream().push(index_9, type, label + ' section');
  const entries = emitter(field);

  stream.push(varuint32, entries.size, 'size');
  stream.write(entries);

  return stream;
};

//      
var section = {
  type: writer({ type: SECTION_TYPE, label: 'Types', emitter: emit$6 }),
  imports: writer({ type: SECTION_IMPORT, label: 'Imports', emitter: emit$1 }),
  function: writer({
    type: SECTION_FUNCTION,
    label: 'Functions',
    emitter: emit$4
  }),
  table: writer({ type: SECTION_TABLE, label: 'Table', emitter: emitTables$1 }),
  memory: writer({ type: SECTION_MEMORY, label: 'Memory', emitter: emit$8 }),
  exports: writer({
    type: SECTION_EXPORT,
    label: 'Exports',
    emitter: emit$2
  }),
  globals: writer({ type: SECTION_GLOBAL, label: 'Globals', emitter: emit$3 }),
  start: writer({ type: SECTION_START, label: 'Start', emitter: emitTables }),
  element: writer({
    type: SECTION_ELEMENT,
    label: 'Element',
    emitter: emit$5
  }),
  code: writer({ type: SECTION_CODE, label: 'Code', emitter: emit$7 }),
  data: writer({ type: SECTION_DATA, label: 'Data', emitter: emit$9 }),
  name: writer({ type: SECTION_NAME, label: 'Name', emitter: emit$10 })
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
    const pcString = pc.toString(16).padStart(8, '0').padEnd(stream.data.length.toString().length + 1);
    let valueString;
    if (Array.isArray(value)) {
      valueString = value.map(v => v.toString(16)).join().padStart(16);
    } else {
      valueString = value.toString(16).padStart(16);
    }
    const out = `${pcString}: ${valueString} ; ${debug}`;
    pc += index_16[type] || value.length;
    return out;
  }).join('\n') + '\n ============ fin =============';
};

/* istanbul ignore file */
//      
const getText$1 = node => {
  const value = node.value || '??';
  const hasType = node.type;
  const type = hasType || 'i32';
  const op = opcodeFromOperator({ value, type });

  if (!hasType) {
    return op.text.replace('i32', '??');
  }

  return op.text;
};

const parseParams = node => {
  const params = [];
  walkNode({
    [Syntax.Pair]: (pair, _) => {
      params.push(`${pair.params[0].value} ${pair.params[1].value}`);
    },
    [Syntax.Type]: p => {
      params.push(p.value);
    }
  })(node);
  return params.length ? ' param(' + params.join(' ') + ')' : '';
};

const parseResult = node => {
  if (node == null) {
    return '';
  }
  return ' (result ' + (node.type || '??') + ')';
};

const typedefString = node => {
  const [paramsNode, resultNode] = node.params;
  return '(type ' + node.value + ` (func${parseParams(paramsNode)}${parseResult(resultNode)}))`;
};

const getPrinters = add => ({
  [Syntax.Import]: (node, _print) => {
    const [nodes, mod] = node.params;
    walkNode({
      [Syntax.Pair]: ({ params }, _) => {
        const { value: field } = params[0];
        const type = params[1];

        if (type.value === 'Memory') {
          const memory = parseBounds(type);
          add(`(import "${mod.value}" "${field}" (memory ${memory.initial}${memory.max ? memory.max : ''}))`);
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
    add('(export', 2);
    node.params.forEach(print);
    add(')', 0, -2);
  },
  [Syntax.GenericType]: (node, _print) => {
    add('(type-generic ' + node.value + ')', 0, 0, ' pseudo type');
  },
  [Syntax.FunctionCall]: (node, print) => {
    if (node.params.length > 0) {
      add(`(call ${node.value}`, 2);
      node.params.forEach(print);
      add(')', 0, -2);
    } else {
      add(`(call ${node.value})`);
    }
  },
  [Syntax.BinaryExpression]: (node, print) => {
    const text = getText$1(node);
    add('(' + text, 2);
    node.params.forEach(print);
    add(')', 0, -2);
  },
  [Syntax.ArraySubscript]: (node, print) => {
    add('(i32.add', 2);
    node.params.forEach(print);
    add(')', 0, -2);
  },
  [Syntax.Typedef]: (node, _) => {
    add(typedefString(node));
  },
  [Syntax.Identifier]: node => {
    const scope = node.meta[GLOBAL_INDEX] != null ? 'global' : 'local';
    add(`(get_${scope} ${node.value})`);
  },
  [Syntax.Constant]: node => {
    add(`(${String(node.type)}.const ${node.value})`);
  },
  [Syntax.FunctionPointer]: node => {
    add(`(${String(node.type)}.table_pointer ${node.value})`);
  },
  [Syntax.FunctionDeclaration]: (node, print) => {
    const [params, result, ...rest] = node.params;
    add(`(func ${node.value}${parseParams(params)}${parseResult(result)}`, 2);

    rest.forEach(print);
    add(')', 0, -2);
  },
  [Syntax.ReturnStatement]: (node, print) => {
    add('(return', 2);
    node.params.forEach(print);
    add(')', 0, -2);
  },
  [Syntax.Declaration]: (node, print) => {
    const mutability = node.meta[TYPE_CONST] != null ? 'immutable' : 'mutable';
    add('(local ' + node.value + ' ' + String(node.type), 2, 0, ` ${mutability}`);
    node.params.forEach(print);
    add(')', 0, -2);
  },
  [Syntax.ImmutableDeclaration]: (node, print) => {
    const scope = node.meta[GLOBAL_INDEX] != null ? 'global' : 'local';
    if (node.type === 'Memory') {
      const memory = parseBounds(node);
      add(`(memory ${memory.initial}${memory.max ? ` ${memory.max}` : ''})`);
    } else {
      add(`(${scope} ` + node.value + ' ' + String(node.type), 2, 0, ' immutable');
      node.params.forEach(print);
      add(')', 0, -2);
    }
  },
  [Syntax.StringLiteral]: node => {
    add('(i32.const ??)', 0, 0, ` string "${node.value}"`);
  },
  [Syntax.Type]: node => {
    add(node.value);
  },
  [Syntax.TypeCast]: (node, print) => {
    const from = node.params[0];
    const op = getTypecastOpcode(String(node.type), from.type);
    add('(' + op.text, 2);
    node.params.forEach(print);
    add(')', 0, -2);
  },
  [Syntax.ArraySubscript]: (node, print) => {
    add('(' + String(node.type) + '.load', 2, 0);
    node.params.forEach(print);
    add(')', 0, -2);
  },
  [Syntax.MemoryAssignment]: (node, print) => {
    add('(' + String(node.type) + '.store', 2, 0);
    node.params.forEach(print);
    add(')', 0, -2);
  },
  [Syntax.Assignment]: (node, print) => {
    const [target, ...params] = node.params;
    const scope = target.meta[GLOBAL_INDEX] != null ? 'global' : 'local';
    add(`(set_${scope} ${target.value}`, 2);
    params.forEach(print);
    add(')', 0, -2);
  },
  [Syntax.TernaryExpression]: (node, print) => {
    const [condition, options] = node.params;
    add('(select', 2);
    print(options);
    print(condition);
    add(')', 0, -2);
  },
  [Syntax.IfThenElse]: (node, print) => {
    const [condition, then, ...rest] = node.params;
    add('(if', 2);
    print(condition);
    add('(then', 2);
    print(then);
    add(')', 0, -2);
    if (rest.length > 0) {
      add('(else', 2);
      rest.forEach(print);
      add(')', 0, -2);
    }
    add(')', 0, -2);
  },
  [Syntax.ObjectLiteral]: (_, __) => {}
});

const printNode = node => {
  if (node == null) {
    return '';
  }

  let depth = 0;
  const offsets = [];
  const pieces = [];
  const comments = [];
  const add = (piece, post = 0, pre = 0, comment = '') => {
    depth += pre;
    comments.push(comment);
    pieces.push(piece);
    offsets.push(depth + piece.length);
    depth += post;
  };

  walkNode(getPrinters(add))(node);

  const max = Math.max(...offsets);
  const edge = max + 4;
  const result = pieces.reduce((acc, val, i) => {
    acc += val.padStart(offsets[i], ' ').padEnd(edge, ' ') + ';' + comments[i] + '\n';
    return acc;
  }, '');

  return result;
};

/**
 * Syntax Analysis
 *
 * The parser below creates the "bare" Abstract Syntax Tree.
 */

//      
const makeFragment = curry_1((parser, source) => {
  // For fragments we must wrap the source in a function
  // otherwise the parser will fail as it's not a valid
  // place for an expression
  const program = parser(`function fragment() {
    ${source};
  }`);
  // 1st node is a function.
  // 3rd node of a function is a block, containing a single expression
  return program.params[0].params[2].params[0];
});

//      
const VERSION = '0.17.0';

// Used for debugging purposes
const getIR = (source, config) => {
  const {
    version = VERSION_1,
    encodeNames = false,
    lines = source.split('\n'),
    filename = 'unknown',
    extensions = []
  } = config || {};

  const parser = makeParser([]);
  const fragment = makeFragment(parser);

  const options = {
    version,
    encodeNames,
    lines,
    filename,
    extensions
  };

  const ast = parser(source);
  const semanticAST = semantics(ast, [], _extends({}, options, { parser, fragment }));
  validate(semanticAST, { lines, filename });
  const intermediateCode = generator(semanticAST, options);
  const wasm = emit(intermediateCode, {
    version,
    encodeNames,
    filename,
    lines
  });
  return wasm;
};

// Compile with plugins, future default export
const compile = (source, config) => {
  const {
    filename = 'unknown.walt',
    extensions = [],
    linker,
    encodeNames = false
  } = config || {};

  const options = {
    filename,
    lines: source.split('\n'),
    version: VERSION_1,
    encodeNames
  };

  // Generate plugin instances and sort them by the extended compiler phase
  const plugins = extensions.reduce((acc, plugin) => {
    // Default plugins to a specific to ensure correctness
    const instance = _extends({
      semantics: _ => ({}),
      grammar: () => ({ ParserRules: [] })
    }, plugin(options));

    acc.grammar.push(instance.grammar);
    acc.semantics.push(instance.semantics);

    return acc;
  }, {
    grammar: [],
    semantics: []
  });

  const parser = makeParser(plugins.grammar);
  const fragment = makeFragment(parser);
  const ast = parser(source);

  const semanticAST = semantics(ast, plugins.semantics, {
    parser,
    fragment
  });

  validate(semanticAST, options);

  const intermediateCode = generator(semanticAST, _extends({}, options, { linker }));
  const wasm = emit(intermediateCode, options);

  return {
    buffer() {
      return wasm.buffer();
    },
    ast,
    semanticAST
  };
};

exports.makeParser = makeParser;
exports.makeFragment = makeFragment;
exports.semantics = semantics;
exports.validate = validate;
exports.generator = generator;
exports.emitter = emit;
exports.prettyPrintNode = printNode;
exports.debug = _debug;
exports.stringEncoder = stringEncoder;
exports.stringDecoder = stringDecoder;
exports.walkNode = walkNode;
exports.mapNode = mapNode_2;
exports.VERSION = VERSION;
exports.getIR = getIR;
exports.compile = compile;

Object.defineProperty(exports, '__esModule', { value: true });

})));
