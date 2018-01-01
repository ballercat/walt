// @flow
const Syntax = {
  // Main Program
  Program: "Program",

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
  ImmutableDeclaration: "ImmutableDeclaration",
  FunctionDeclaration: "FunctionDeclaration",
  ArrayDeclaration: "ArrayDeclaration",
  IndirectFunctionCall: "IndirectFunctionCall",
  FunctionCall: "FunctionCall",
  Loop: "Loop",
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
  FunctionArguments: "FunctionArguments",
  FunctionResult: "FunctionResult",
  FunctionLocals: "FunctionLocals",
};

export default Syntax;
