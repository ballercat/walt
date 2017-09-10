// @flow
export type Node = {
  range: number[];
  Type: string;
};

export type Typed = { id?: string, type: string };
export type TypeNode =
  {
    id: string,
    params: Typed[],
    result: Typed | null
  }
  & Node
  & Typed;


