// Main Program
export { tokens } from './tokens';

export const Program = 'Program';
export const Keyword = 'Keyword';
export const Export = 'Export';
export const Import = 'Import';
export const Statement = 'Statement';
export const IfThenElse = 'IfThenElse';
export const Select = 'Select';
export const Else = 'Else';
export const UnaryExpression = 'UnaryExpression';
export const BinaryExpression = 'BinaryExpression';
export const TernaryExpression = 'TernaryExpression';
export const NumberLiteral = 'NumberLiteral';
export const StringLiteral = 'StringLiteral';
export const CharacterLiteral = 'CharacterLiteral';
export const Punctuator = 'Punctuator';
export const Identifier = 'Identifier';
export const ArraySubscript = 'ArraySubscript';
export const Constant = 'Constant';
export const Type = 'Type';
export const GenericType = 'GenericType';
export const UserType = 'UserType';
export const FunctionType = 'FunctionType';
export const Declaration = 'Declaration';
export const StaticDeclaration = 'StaticDeclaration';
export const StaticValueList = 'StaticValueList';
export const ImmutableDeclaration = 'ImmutableDeclaration';
export const FunctionDeclaration = 'FunctionDeclaration';
export const ArrayDeclaration = 'ArrayDeclaration';
export const IndirectFunctionCall = 'IndirectFunctionCall';
export const FunctionCall = 'FunctionCall';
export const Loop = 'Loop';
export const MemoryAssignment = 'MemoryAssignment';
export const Assignment = 'Assignment';
export const Param = 'Param';
export const Typedef = 'Typedef';
export const Struct = 'Struct';
export const ReturnStatement = 'ReturnStatement';
export const Sequence = 'Sequence';
export const ObjectLiteral = 'ObjectLiteral';
export const Pair = 'Pair';
export const TypeCast = 'TypeCast';
export const Break = 'Break';
export const Comment = 'Comment';
export const Sizeof = 'Sizeof';
export const Spread = 'Spread';
export const Closure = 'Closure';
export const Noop = 'Noop';
export const ClosureType = 'ClosureType';
export const Block = 'Block';
export const ObjectField = 'ObjectField';
export const FunctionIndex = 'FunctionIndex';
export const FunctionIdentifier = 'FunctionIdentifier';
export const FunctionPointer = 'FunctionPointer';
export const FunctionArguments = 'FunctionArguments';
export const FunctionResult = 'FunctionResult';
export const FunctionLocals = 'FunctionLocals';
export const NativeMethod = 'NativeMethod';
export const Unreachable = 'Unreachable';
export const Access = 'Access';

export const i32 = 'i32';
export const f32 = 'f32';
export const i64 = 'i64';
export const f64 = 'f64';
export const Memory = 'Memory';
export const Table = 'Table';
export const bool = 'bool';

export const builtinTypes = {
  i32,
  f32,
  i64,
  f64,
  Memory,
  Table,
  bool,
};

export const statements = {
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

export default {
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
