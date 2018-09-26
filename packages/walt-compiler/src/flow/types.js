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
  functions: NodeMap,
  types: NodeMap,
  userTypes: NodeMap,
  table: NodeMap,
  hoist: NodeType[],
  statics: { [string]: null },
  scopes: NodeMap[],
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
