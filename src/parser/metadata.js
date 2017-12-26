// @flow
import printNode from "../utils/print-node";
import type { NodeType, Metadata } from "../flow/types";
import invariant from "invariant";

// All of the metadata options are used like redux actions
// this is intentional but only for the purposes of a common
// flexible api.
export const FUNCTION_INDEX = "function/index";
export const LOCAL_INDEX_MAP = "function/locals-index-map";
export const POSTFIX = "operator/postfix";
export const PREFIX = "operator/prefix";
export const LOCAL_INDEX = "local/index";
export const GLOBAL_INDEX = "global/index";
export const TABLE_INDEX = "table/index";
export const TYPE_CONST = "type/const";
export const TYPE_ARRAY = "type/array";
export const TYPE_USER = "type/user";
export const TYPE_OBJECT = "type/object";
export const TYPE_INDEX = "type/index";
export const OBJECT_SIZE = "object/size";
export const TYPE_CAST = "type/cast";
export const OBJECT_KEY_TYPES = "object/key-types";

export const make = (payload: any, type: string) => ({
  type,
  payload,
});

export const get = (type: string, node: NodeType): ?Metadata => {
  invariant(
    node.meta,
    `Attemptend to access Metadata but it was undefined in node ${printNode(
      node
    )}`
  );
  return node
    ? node.meta.find(({ type: _type }) => _type === type) || null
    : null;
};

export const funcIndex = (payload: any): Metadata => ({
  payload,
  type: FUNCTION_INDEX,
});

export const localIndex = (payload: any): Metadata => ({
  payload,
  type: LOCAL_INDEX,
});

export const globalIndex = (payload: any): Metadata => ({
  payload: { index: payload },
  type: GLOBAL_INDEX,
});

export const tableIndex = (payload: any): Metadata => ({
  payload,
  type: TABLE_INDEX,
});

export const postfix = (): Metadata => ({
  payload: true,
  type: POSTFIX,
});

export const prefix = (): Metadata => ({
  payload: true,
  type: PREFIX,
});

export const userType = (payload: any): Metadata => ({
  payload,
  type: TYPE_USER,
});

export const objectType = (payload: any): Metadata => ({
  payload,
  type: TYPE_OBJECT,
});

export const objectSize = (payload: any): Metadata => ({
  payload,
  type: OBJECT_SIZE,
});

export const array = (payload: any): Metadata => ({
  payload,
  type: TYPE_ARRAY,
});
export const constant = (): Metadata => ({ payload: true, type: TYPE_CONST });

export const typeCast = (payload: { to: string, from: string }) => ({
  payload,
  type: TYPE_CAST,
});

export const objectKeyTypes = (payload: { [string]: string }) => ({
  payload,
  type: OBJECT_KEY_TYPES,
});

export const typeIndex = (payload: number): Metadata => ({
  payload,
  type: TYPE_INDEX,
});

export const localIndexMap = (payload: { [string]: number }): Metadata => ({
  type: LOCAL_INDEX_MAP,
  payload,
});

const metadata = {
  make,
  get,
  postfix,
  funcIndex,
  localIndex,
  globalIndex,
  userType,
  tableIndex,
  objectSize,
  array,
  constant,
  POSTFIX,
  LOCAL_INDEX,
  FUNCTION_INDEX,
  TABLE_INDEX,
  TYPE_ARRAY,
  TYPE_CONST,
  TYPE_USER,
  TYPE_OBJECT,
  OBJECT_SIZE,
};

export default metadata;
