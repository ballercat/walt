// @flow
import type { NodeType } from "../flow/types";

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
export const CLOSURE_TYPE = "closure/type";
export const AST_METADATA = "@@global/ast";
export const FUNCTION_METADATA = "@@function/meta";
export const ALIAS = "alias";

export const get = (type: string, node: NodeType): ?any => {
  return node.meta[type] != null ? node.meta[type] : null;
};
