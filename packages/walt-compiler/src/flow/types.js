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

export type ConfigType = {
  version: number,
  encodeNames: boolean,
  lines: string[],
  filename: string,
  linker?: {
    statics: { [string]: number },
  },
};

export type TypeCastType = {
  ...$Exact<NodeType>,
  type: string,
  params: [{ ...NodeType, type: string }],
};

export type SemanticOptionsType = {
  functions: { [string]: NodeType },
  globals: { [string]: NodeType },
  types: { [string]: NodeType },
  userTypes: { [string]: NodeType },
  table: { [string]: NodeType },
  hoist: NodeType[],
  hoistImports: NodeType[],
  statics: { [string]: null },
};
