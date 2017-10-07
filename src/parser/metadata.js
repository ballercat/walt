// @flow
import type { Node, Metadata } from "../flow/types";

export const FUNCTION_INDEX = "function/index";
export const POSTFIX = "operator/postfix";
export const LOCAL_INDEX = "local/index";
export const GLOBAL_INDEX = "global/index";
export const TABLE_INDEX = "table/index";

export const make = (payload: any, type: string) => ({
  type,
  payload
});

export const get = (type: string, node: Node): ?Metadata => {
  return node.meta.find(({ type: _type }) => _type === type) || null;
};

export const funcIndex = (payload: any): Metadata => ({
  payload,
  type: FUNCTION_INDEX
});

export const localIndex = (payload: any): Metadata => ({
  payload,
  type: LOCAL_INDEX
});

export const globalIndex = (payload: any): Metadata => ({
  payload,
  type: GLOBAL_INDEX
});

export const tableIndex = (payload: any): Metadata => ({
  payload,
  type: TABLE_INDEX
});

export const postfix = (payload: any): Metadata => ({
  payload,
  type: POSTFIX
});

const metadata = {
  make,
  get,
  postfix,
  funcIndex,
  localIndex,
  globalIndex,
  tableIndex,
  POSTFIX,
  LOCAL_INDEX,
  FUNCTION_INDEX,
  TABLE_INDEX
};

export default metadata;
