(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (factory((global['walt-syntax'] = {})));
}(this, (function (exports) { 'use strict';

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
  const punctuator = [
    '+',
    '++',
    '-',
    '--',
    '>>',
    '>>>',
    '<<',
    '=',
    '==',
    '+=',
    '-=',
    '=>',
    '<=',
    '>=',
    '!=',
    '%',
    '*',
    '/',
    '^',
    '&',
    '~',
    '|',
    '!',
    '**',
    ':',
    '(',
    ')',
    '.',
    '{',
    '}',
    ',',
    '[',
    ']',
    ';',
    '>',
    '<',
    '?',
    '||',
    '&&',
    '{',
    '}',
    '...',
  ];

  const type = ['i32', 'i64', 'f32', 'f64', 'bool'];

  const tokens = {
    whitespace: /[ \t]+/,
    comment: [
      { match: /\/\/.*?$/ },
      { match: /\/\*[^]*?\*\//, lineBreaks: true },
    ],
    number: [
      { match: /0[xX][0-9a-fA-F]+/ },
      { match: /0[oO][0-9]+/ },
      { match: /0[bB][01]+/ },
      { match: /(?:[0-9]+(?:\.[0-9]+)?e-?[0-9]+)/ },
      { match: /[0-9]+\.[0-9]+|[0-9]+/ },
    ],
    char: [
      { match: /'(?:\\['\\bfnrtv0]|[^'\\\n])'/, value: x => x.slice(1, -1) },
    ],
    string: [
      { match: /"(?:\\["\\rn]|[^"\\\n])*?"/, value: x => x.slice(1, -1) },
      { match: /'(?:\\['\\bfnrtv0]|[^'\\\n])*?'/, value: x => x.slice(1, -1) },
      { match: /`(?:\\['\\bfnrtv0]|[^'\\])*?`/, value: x => x.slice(1, -1) },
    ],
    identifier: {
      match: /[A-Za-z_$][A-Za-z0-9_$]*/,
      keywords: { keyword, type },
    },
    punctuator,
    newline: { match: /(?:\r\n|\r|\n)/, lineBreaks: true },
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
    bool,
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
    Unreachable,
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
    Unreachable,
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

})));
