//@flow

// Tokens
export type Marker = {
  line: number,
  col: number
};

export type Token = {
  start: Marker,
  end: Marker,
  type: string,
  value: string
};

export type OperatorToken = Token & {
  precedence: number,
  assoc: string,
  type: string
};

export type Metadata = { type: string, payload: any };

// Nodes
export type Typed = { id?: string, type: string };
export type Node = {
  range: Marker[],
  Type: string,
  id?: string,
  type?: string,
  value: string,
  size?: number,
  result?: Typed | null,
  meta: Metadata[],
  params: Node[],
  body?: Node[]
};

export type Field = {
  id: string,
  global?: number,
  typeIndex?: number,
  functionIndex?: number
};

export type Import = {
  fields: Field[],
  module: string
} & Node;
