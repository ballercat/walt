(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(factory((global.WaltClosures = {})));
}(this, (function (exports) { 'use strict';

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
    Block
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

function add$1(scopes, key, node) {
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
  add: add$1,
  find: find$1,
  current: current$1,
  index: index$1,
  namespace: namespace$1,
  signature: signature$1
};

const {
  enter,
  exit,
  add,
  find,
  current,
  namespace,
  signature,
  index
} = scope$2;

var scope = {
  enter,
  exit,
  add,
  find,
  current,
  namespace,
  index,
  signature
};

var scope_1 = scope.enter;
var scope_3 = scope.current;
var scope_4 = scope.find;

/**
 * Check if an AST has a specific Node Type, return boolean
 *
 */
var hasNode$2 = function hasNode(Type, ast) {
  const test = node => node && node.Type === Type;

  const walker = node => {
    if (node == null) {
      return false;
    }

    return test(node) || node.params.some(walker);
  };

  return walker(ast);
};

var hasNode = hasNode$2;

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

// Custom Walt Grammar Generator
function id(x) {
  return x[0];
}

function grammar() {

  const { Syntax } = this;
  const { drop, extendNode } = this.helpers;
  const { node, typeGeneric } = this.nodes(this.lexer);
  const voidClosure = d => {
    const [args, block] = drop(d);
    const resultNode = extendNode({ type: null }, node(Syntax.FunctionResult)([]));
    return extendNode({
      params: [extendNode({
        params: [args, resultNode, block]
      }, node(Syntax.FunctionDeclaration)([]))]
    }, node(Syntax.Closure)([]));
  };
  const closure = d => {
    const [args, resultNode, block] = drop(d);
    return extendNode({
      params: [extendNode({
        params: [args, resultNode, block]
      }, node(Syntax.FunctionDeclaration)([]))]
    }, node(Syntax.Closure)([]));
  };

  const genericType = d => {
    const [id, gen, typeNode] = drop(d);
    return extendNode({
      value: id.value,
      params: [gen, typeNode]
    }, node(Syntax.GenericType)([]));
  };

  return {
    Lexer: undefined,
    ParserRules: [{ "name": "TypeDef", "symbols": ["TYPE", "__", "Identifier", "_", "EQUALS", "_", "GenericType", "_", "SEPARATOR"], "postprocess": genericType }, { "name": "GenericType", "symbols": ["Identifier", "LT", "_", "Type", "_", "GT"], "postprocess": typeGeneric }, { "name": "Closure", "symbols": ["FunctionParameters", "_", "FATARROW", "_", "Block"], "postprocess": voidClosure }, { "name": "Closure", "symbols": ["FunctionParameters", "_", "FunctionResult", "_", "FATARROW", "_", "Block"], "postprocess": closure }, { "name": "Expression", "symbols": ["Closure"], "postprocess": id }],
    ParserStart: "TypeDef"
  };
}

var source = "const memory: Memory = { initial: 1 };\nlet heapPointer: i32 = 0;\nexport function __closure_malloc(size: i32): i32 {\n  const ptr: i32 = heapPointer;\n  heapPointer += size;\n  return ptr;\n}\n\nexport function __closure_free(ptr: i32) {\n}\n\n// Getters\nexport function __closure_get_i32(ptr: i32): i32 {\n  const view: i32[] = ptr;\n  return view[0];\n}\n\nexport function __closure_get_f32(ptr: i32): f32 {\n  const view: f32[] = ptr;\n  return view[0];\n}\n\nexport function __closure_get_i64(ptr: i32): i64 {\n  const view: i64[] = ptr;\n  return view[0];\n}\n\nexport function __closure_get_f64(ptr: i32): f64 {\n  const view: f64[] = ptr;\n  return view[0];\n}\n\n// Setters\nexport function __closure_set_i32(ptr: i32, value: i32) {\n  const view: i32[] = ptr;\n  view[0] = value;\n}\n\nexport function __closure_set_f32(ptr: i32, value: f32) {\n  const view: f32[] = ptr;\n  view[0] = value;\n}\n\nexport function __closure_set_i64(ptr: i32, value: i64) {\n  const view: i64[] = ptr;\n  view[0] = value;\n}\n\nexport function __closure_set_f64(ptr: i32, value: f64) {\n  const view: f64[] = ptr;\n  view[0] = value;\n}\n";

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

/**
 * Closure plugin.
 *
 */
const DEPENDENCY_NAME = 'walt-plugin-closure';

const sizes = {
  i64: 8,
  f64: 8,
  i32: 4,
  f32: 4
};

const sum = (a, b) => a + b;
const LOCAL_INDEX = 'local/index';

const importsSource = `
// Start Closure Imports Header
import {
  __closure_malloc: ClosureGeti32,
  __closure_free: ClosureFree,
  __closure_get_i32: ClosureGeti32,
  __closure_get_f32: ClosureGetf32,
  __closure_get_i64: ClosureGeti64,
  __closure_get_f64: ClosureGetf64,
  __closure_set_i32: ClosureSeti32,
  __closure_set_f32: ClosureSetf32,
  __closure_set_i64: ClosureSeti64,
  __closure_set_f64: ClosureSetf64
} from '${DEPENDENCY_NAME}';
type ClosureFree = (i32) => void;
type ClosureGeti32 = (i32) => i32;
type ClosureGetf32 = (i32) => f32;
type ClosureGeti64 = (i32) => i64;
type ClosureGetf64 = (i32) => f64; type ClosureSeti32 = (i32, i32) => void;
type ClosureSetf32 = (i32, f32) => void;
type ClosureSeti64 = (i32, i64) => void;
type ClosureSetf64 = (i32, f64) => void;
// End Closure Imports Header
`;

// Imports for the users of the plugin
function imports(options, compile) {
  return WebAssembly.instantiate(compile(source, options).buffer()).then(mod => ({
    [DEPENDENCY_NAME]: mod.instance.exports
  }));
}

function plugin() {
  const semantics = ({ parser, fragment }) => {
    // Declaration parser, re-used for mutable/immutable declarations
    const declarationParser = next => (args, transform) => {
      const [node, context] = args;
      const { environment, types } = context;

      // Not a closure scan and not an environment variable
      if (!context.isParsingClosure || !environment[node.value]) {
        // Check if the declaration is a lambda, as we will need to unroll this
        // into an i64
        if (types[node.type] && types[node.type].meta.CLOSURE_TYPE) {
          return next([_extends({}, node, {
            type: 'i64',
            meta: _extends({}, node.meta, {
              CLOSURE_INSTANCE: true,
              ALIAS: node.type
            })
          }), context]);
        }
        return next(args);
      }

      const parsed = next(args);
      environment[parsed.value] = _extends({}, parsed, {
        meta: _extends({}, parsed.meta, {
          ENV_OFFSET: Object.values(context.envSize).reduce(sum, 0)
        })
      });
      context.envSize[parsed.value] = sizes[parsed.type] || 4;

      // If the variable is declared but has no initializer we simply nullify the
      // node as there is nothing else to do here.
      if (!parsed.params.length) {
        return _extends({}, parsed, { Type: Syntax.Noop });
      }

      const [lhs] = parsed.params;
      const ref = environment[parsed.value];
      const call = fragment(`__closure_set_${ref.type}(__env_ptr + ${ref.meta.ENV_OFFSET})`);
      return transform([_extends({}, call, {
        params: [...call.params, lhs]
      }), context]);
    };

    return {
      // One drawback of having a plugin for closures isntead of built in support
      // is that it's rather difficult to pre-parse the Generic Closure types.
      // Since generics depend on the real type nodes being already processed we
      // loose the benifit of using a generic type before its defined.
      GenericType: _ => semanticArgs => {
        const [node, context] = semanticArgs;
        const { types } = context;
        const [generic] = node.params;
        const [T] = generic.params;
        const realType = types[T.value];
        const [args, result] = realType.params;
        // Patch the node to be a real type which we can reference later
        const patch = _extends({}, realType, {
          range: generic.range,
          value: node.value,
          meta: _extends({}, realType.meta, {
            CLOSURE_TYPE: generic.value === 'Lambda'
          }),
          params: [_extends({}, args, {
            params: [_extends({}, args, {
              params: [],
              type: 'i32',
              value: 'i32',
              Type: Syntax.Type
            }), ...args.params]
          }), result]
        });
        types[patch.value] = patch;

        return patch;
      },
      Program: next => semanticArgs => {
        const [program, context] = semanticArgs;

        if (!hasNode(Syntax.Closure, program)) {
          return next(semanticArgs);
        }

        const closureImportsHeader = parser(importsSource).params;
        const closures = [];
        const parsedProgram = next([_extends({}, program, {
          params: [...closureImportsHeader, ...program.params]
        }), _extends({}, context, { closures })]);

        const result = _extends({}, parsedProgram, {
          params: [...parsedProgram.params, ...closures]
        });
        return result;
      },
      Closure: _next => (args, transform) => {
        const [closure, context] = args;

        // NOTE: All variables should really be kept in a single "scope" object

        const [declaration] = closure.params;
        const [fnArgs, result, ...rest] = declaration.params;
        // Create the real function node to be compiled which was originally a
        // closure EXPRESSION inside it's parent function. Once this run we will
        // have a function table reference which we will reference in the output
        // of this method.
        const real = transform([_extends({}, declaration, {
          value: `__closure_${context.isParsingClosure}_0`,
          // Each closure now needs to have a pointer to it's environment. We inject
          // that that at the front of the arguments list as an i32 local.
          //
          // Let the rest of the function parser continue as normal
          params: [_extends({}, fnArgs, {
            // Parens are necessary around a fragment as it has to be a complete
            // expression, a ; would also likely work and be discarded but that would
            // be even odder in the context of function arguments
            params: [fragment('(__env_ptr : i32)'), ...fnArgs.params]
          }), result, ...rest]
        }), context]);

        // Before we complete our work here, we have to attach the 'real' function
        // created above to the output of the program so that it can become part
        // of the final WASM output.
        context.closures.push(real);

        return transform([fragment(`(${real.value} | ((__env_ptr : i64) << 32))`), context]);
      },
      FunctionDeclaration: next => (args, transform) => {
        const [node, context] = args;
        const globals = context.scopes[0];
        if (context.isParsingClosure || !hasNode(Syntax.Closure, node)) {
          return next(args);
        }

        const environment = {};
        const envSize = {};
        walkNode({
          Closure(closure, _) {
            // All closures have their own __env_ptr passed in at call site
            const declarations = { __env_ptr: true };
            walkNode({
              // We need to make sure we ignore the arguments to the closure.
              // Otherwise they will be treaded as "closed over" variables
              FunctionArguments(closureArgs, _ignore) {
                walkNode({
                  Pair(pair) {
                    const [identifier] = pair.params;
                    declarations[identifier.value] = identifier;
                  }
                })(closureArgs);
              },
              Declaration(decl, __) {
                declarations[decl.value] = decl;
              },
              Identifier(id) {
                if (!declarations[id.value] && !globals[id.value]) {
                  environment[id.value] = id;
                }
              }
            })(closure);
          }
        })(node);

        // We will initialize with an empty env for now and patch this once we
        // know the sizes of all environment variables
        const injectedEnv = fragment('const __env_ptr : i32 = 0');
        const [fnArgs, result, block] = node.params;

        const closureContext = _extends({}, context, {
          environment,
          envSize,
          isParsingClosure: node.value
        });
        const fun = next([_extends({}, node, {
          params: [fnArgs, result, _extends({}, block, { params: [injectedEnv, ...block.params] })]
        }), closureContext]);

        fun.params = fun.params.map(p => {
          if (p.Type === Syntax.Declaration && p.value === '__env_ptr') {
            const size = Object.values(envSize).reduce(sum, 0);
            return transform([fragment(`const __env_ptr : i32 = __closure_malloc(${size})`), _extends({}, context, { scopes: scope_1(context.scopes, LOCAL_INDEX) })]);
          }

          return p;
        });

        return fun;
      },
      Declaration: declarationParser,
      ImmutableDeclaration: declarationParser,
      FunctionResult: next => args => {
        const [node, context] = args;
        const { types } = context;

        if (types[node.type] && types[node.type].meta.CLOSURE_TYPE) {
          return next([_extends({}, node, {
            type: 'i64',
            value: 'i64',
            meta: _extends({}, node.meta, {
              ALIAS: node.type
            })
          }), context]);
        }
        return next(args);
      },
      Assignment: next => (args, transform) => {
        const [node, context] = args;
        const { scopes, environment } = context;
        const [rhs, lhs] = node.params;

        if (!context.isParsingClosure) {
          return next(args);
        }

        // Closures are functions and have their own locals
        if (scope_3(scopes)[rhs.value]) {
          return next(args);
        }

        const { type, meta: { ENV_OFFSET: offset } } = environment[rhs.value];

        const call = fragment(`__closure_set_${type}(__env_ptr + ${offset})`);
        return transform([_extends({}, call, {
          params: [...call.params, lhs]
        }), context]);
      },
      Identifier: next => (args, transform) => {
        const [node, context] = args;
        const { environment } = context;

        if (!context.isParsingClosure || !environment[node.value]) {
          return next(args);
        }

        const { type, meta: { ENV_OFFSET: offset } } = environment[node.value];

        return transform([fragment(`__closure_get_${type}(__env_ptr + ${offset})`), context]);
      },
      FunctionCall: next => (args, transform) => {
        const [call, context] = args;
        const { scopes, types } = context;
        const local = scope_4(scopes, call.value);
        if (local && local.meta.CLOSURE_INSTANCE) {
          // Unfortunately, we cannot create a statement for this within the
          // possible syntax so we need to manually structure an indirect call node

          const params = [fragment(`((${local.value} >> 32) : i32)`), ...call.params.slice(1), fragment(`(${local.value} : i32)`)].map(p => transform([p, context]));

          const typedef = types[local.meta.ALIAS];
          const typeIndex = Object.keys(types).indexOf(typedef.value);

          const icall = _extends({}, call, {
            meta: _extends({}, local.meta, call.meta, {
              TYPE_INDEX: typeIndex
            }),
            type: typedef != null ? typedef.type : call.type,
            params,
            Type: Syntax.IndirectFunctionCall
          });

          return icall;
        }

        return next(args);
      }
    };
  };

  return {
    grammar,
    semantics
  };
}

exports.DEPENDENCY_NAME = DEPENDENCY_NAME;
exports.imports = imports;
exports.plugin = plugin;

Object.defineProperty(exports, '__esModule', { value: true });

})));
