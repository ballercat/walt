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

export type BaseOptions = {
  version: number,
  encodeNames: boolean,
  lines: string[],
  filename: string,
};

export type Plugin = BaseOptions => {
  grammar: () => any,
  semantics: { parser: string => NodeType, fragment: string => NodeType },
};

export type ConfigType = BaseOptions & {
  linker?: {
    statics: { [string]: number },
  },
  extensions: Array<Plugin>,
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

export type SemanticOptionsType = {
  functions: { [string]: NodeType },
  globals: { [string]: NodeType },
  types: { [string]: NodeType },
  userTypes: { [string]: NodeType },
  table: { [string]: NodeType },
  hoist: NodeType[],
  statics: { [string]: null },
};
