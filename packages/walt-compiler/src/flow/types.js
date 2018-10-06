// @flow
/* global $Exact */
export type Marker = {
  sourceLine: string,
  line: number,
  col: number,
};

export type TokenType = {
  start: Marker,
  end: Marker,
  type: string,
  value: string,
};

export type MetadataType = { [string]: any };

export type NodeType = {
  range: Marker[],
  Type: string,
  type: string | null,
  value: string,
  meta: MetadataType,
  params: NodeType[],
};

// Grammar Nodes
type BaseNode = {
  range: Marker[],
  type: string | null,
  value: string,
  meta: MetadataType,
};

export type Identifier = BaseNode & {
  Type: 'Identifier',
  params: [],
};
export type Type = BaseNode & {
  Type: 'Type',
  params: [],
};
export type Constant = BaseNode & {
  Type: 'Constant',
  params: [],
};
export type IdentifierTypePair = BaseNode & {
  Type: 'Pair',
  params: [Identifier, Type],
};
export type BlockStatement = NodeType;

export type DefaultArgument = BaseNode & {
  Type: 'Assignment',
  params: [IdentifierTypePair, Constant],
};
export type FunctionArgument = IdentifierTypePair | DefaultArgument;
export type FunctionArguments = BaseNode & {
  Type: 'FunctionArguments',
  params: FunctionArgument[],
};
export type FunctionResult = BaseNode & {
  Type: 'FunctionResult',
  params: Type[],
};
export type Block = BaseNode & {
  Type: 'Block',
  params: BlockStatement[],
};
export type FunctionDeclaration = BaseNode & {
  Type: 'FunctionDeclaration',
  params: [FunctionArguments, FunctionResult, Block],
};

export type WebAssemblyModuleType = {
  instance: {
    exports: {
      [string]: any,
    },
  },
};

export type NodeMap = { [string]: NodeType };

// Semantics
export type SemanticOptions = {
  parser: string => NodeType,
  fragment: string => NodeType,
};
export type Context = {
  functions: { [string]: FunctionDeclaration },
  types: NodeMap,
  userTypes: NodeMap,
  table: NodeMap,
  hoist: NodeType[],
  statics: { [string]: null },
  scopes: NodeMap[],
  memories: NodeType[],
  tables: NodeType[],
};
export type Transform = ([NodeType, Context]) => NodeType;
export type NodeParser = NodeParser => (
  [NodeType, Context],
  Transform
) => NodeType;
export type Semantics = {
  [string]: (Transform) => ([NodeType, Context], Transform) => NodeType,
};
export type SemanticsFactory = SemanticOptions => Semantics;
export type SemanticPlugin = { semantics: SemanticsFactory };

// Grammar
export type Grammar = {
  ParserRules: mixed[],
};
export type GrammarFactory = () => Grammar;
export type GrammarPlugin = { grammar: GrammarFactory };

export type BaseOptions = {
  version: number,
  encodeNames: boolean,
  lines: string[],
  filename: string,
};

export type Plugin = {
  grammar?: () => any,
  semantics: SemanticOptions => Semantics,
};

export type ConfigType = BaseOptions & {
  linker?: {
    statics: { [string]: number },
  },
  extensions: Array<(BaseOptions) => Plugin>,
};

export type GeneratorOptions = BaseOptions & {
  linker?: {
    statics: { [string]: number },
  },
};

export type TypeCastType = {
  ...$Exact<NodeType>,
  type: string,
  params: [{ ...NodeType, type: string }],
};
