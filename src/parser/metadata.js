// @flow
import type { Node, Metadata } from "../flow/types";
import invariant from "invariant";

// All of the metadata options are used like redux actions
// this is intentional but only for the purposes of a common
// flexible api.
export const FUNCTION_INDEX = "function/index";
export const POSTFIX = "operator/postfix";
export const LOCAL_INDEX = "local/index";
export const GLOBAL_INDEX = "global/index";
export const TABLE_INDEX = "table/index";
export const TYPE_CONST = "type/const";
export const TYPE_ARRAY = "type/array";
export const TYPE_USER = "type/user";
export const TYPE_OBJECT = "type/object";

export const make = (payload: any, type: string) => ({
  type,
  payload
});

export const get = (type: string, node: Node): ?Metadata => {
  invariant(
    node.meta,
    `Attemptend to access Metadata but it was undefined in node ${JSON.stringify(
      node
    )}`
  );
  return node
    ? node.meta.find(({ type: _type }) => _type === type) || null
    : null;
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

export const userType = (payload: any): Metadata => ({
  payload,
  type: TYPE_USER
});

export const objectType = (payload: any): Metadata => ({
  payload,
  type: TYPE_OBJECT
});

export const array = (): Metadata => ({ payload: true, type: TYPE_ARRAY });
export const constant = (): Metadata => ({ payload: true, type: TYPE_CONST });

const metadata = {
  make,
  get,
  postfix,
  funcIndex,
  localIndex,
  globalIndex,
  userType,
  tableIndex,
  array,
  constant,
  POSTFIX,
  LOCAL_INDEX,
  FUNCTION_INDEX,
  TABLE_INDEX,
  TYPE_ARRAY,
  TYPE_CONST,
  TYPE_USER,
  TYPE_OBJECT
};

export default metadata;
