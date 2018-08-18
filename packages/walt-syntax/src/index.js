
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
};

module.exports = {
  builtinTypes,
  statements,

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
  NativeMethod,
};
