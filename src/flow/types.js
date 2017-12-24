// @flow

// Tokens
export type Marker = {
  line: number,
  col: number,
};

export type Token = {
  start: Marker,
  end: Marker,
  type: string,
  value: string,
};
export type TokenType = Token;

export type OperatorToken = Token & {
  precedence: number,
  assoc: string,
  type: string,
};

export type Metadata = { type: string, payload: any };
export type MetadataType = Metadata;

// Nodes
export type Typed = { id?: string, type: string };
export type NodeType = {
  range: Marker[],
  Type: string,
  id?: string,
  type: string | null,
  value: string,
  size?: number,
  result?: Typed | null,
  meta: Metadata[],
  params: NodeType[],
  body?: NodeType[],
  expr?: NodeType,
  then?: NodeType[],
  else?: NodeType[],
};
export type FunctionNodeType = {
  id: string,
  result: Typed | null,
  locals: NodeType[],
  functionIndex: number,
  typeIndex: number,
} & NodeType;

export type Node = NodeType;

export type Field = {
  id: string,
  global?: number,
  typeIndex?: number,
  functionIndex?: number,
  kind?: number,
} & NodeType;

export type Import = {
  fields: Field[],
  module: string,
} & Node;
