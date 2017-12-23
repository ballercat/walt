// @flow
import invariant from "invariant";
import Syntax from "../Syntax";
import metadata, {
  OBJECT_KEY_TYPES,
  TYPE_OBJECT,
  TYPE_ARRAY,
  TYPE_USER,
} from "./metadata";
import { findLocalVariable, findGlobalIndex } from "./introspection";
import type { NodeType, MetadataType } from "../flow/types";
import type Context from "./context";

export const nodeMetaType = (targetNode: NodeType): ?MetadataType =>
  metadata.get(TYPE_USER, targetNode) || metadata.get(TYPE_ARRAY, targetNode);

export const getMetaType = (
  ctx: Context,
  token: { value: string },
): ?MetadataType => {
  const local = ctx.func ? findLocalVariable(ctx.func, token) : null;
  const globalIndex = findGlobalIndex(ctx, token);
  // Set the target variable
  const targetNode = local ? local.node : ctx.globals[globalIndex];

  // Don't allow unknown variables
  if (targetNode == null) {
    throw ctx.syntaxError(`Undefined variable ${token.value}`);
  }

  // Get the meta-type of our target, it should be either an array or a user-defined
  // object type. These types are indexable.
  return nodeMetaType(targetNode);
};

// This is shared logic across different memory-store/load operations
//
// Generator is expecting an integer offset for the offset node and we are going to
// enforce this contract here.
export const patchStringSubscript = (
  ctx: Context,
  metaType: MetadataType,
  params: NodeType[],
): NodeType[] => {
  if (metaType.type === TYPE_USER && params[1].Type === Syntax.StringLiteral) {
    const metaObject = metadata.get(TYPE_OBJECT, metaType.payload);
    invariant(metaObject, "Undefined object properties");
    const { payload: byteOffsetsByKey } = metaObject;
    const { value: key } = params[1];
    const absoluteByteOffset = byteOffsetsByKey[key];
    return [
      params[0],
      ctx.makeNode({ value: absoluteByteOffset, type: "i32" }, Syntax.Constant),
    ];
  }
  return params;
};

export const subscriptFromNode = (
  ctx: Context,
  node: NodeType,
  metaType: MetadataType,
): NodeType => {
  if (metaType.type === TYPE_USER) {
    const objectKeyTypeMap = metadata.get(OBJECT_KEY_TYPES, metaType.payload);
    if (objectKeyTypeMap) {
      node.type = objectKeyTypeMap.payload[node.params[1].value];
    }
  } else {
    node.type = metaType.payload;
  }

  node.params = patchStringSubscript(ctx, metaType, node.params);

  node.meta.push(metaType);

  return ctx.endNode(node, Syntax.ArraySubscript);
};
