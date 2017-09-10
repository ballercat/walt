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
}

// Nodes
export type Typed = { id?: string, type: string };
export type Node = {
  start: Marker,
  range: Marker[],
  end?: Marker,
  Type?: string,
  id?: string,
  type?: string,
  result?: Typed | null,
  params?: Node[],
  body?: Node?[]
};

export type Field = {
  id: string,
  global?: number,
  typeIndex?: number,
  functionIndex?: number
};

export type Import =
  {
    fields: Field[],
    module: string
  }
  & Node;

