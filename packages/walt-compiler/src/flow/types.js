// @flow

export type Marker = {
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
