// @flow
import Syntax from "../Syntax";

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

export type MetadataType = { type: string, payload: any };

export type NodeType = {
  range: Marker[],
  Type: string,
  type: string | null,
  value: string,
  meta: MetadataType[],
  params: NodeType[],
};

export type WebAssemblyModuleType = {
  instance: {
    exports: {
      [string]: any,
    },
  },
};

export type TypeCastType = {
  ...$Exact<NodeType>,
  type: string,
  params: [{ ...NodeType, type: string }],
};
