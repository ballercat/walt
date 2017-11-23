// @flow
import invariant from "invariant";
import Context from "./context";
import Syntax from "../Syntax";
import expression from "./expression";
import type { TokenType, NodeType, MetadataType } from "../flow/types";
import metadata, { TYPE_OBJECT, TYPE_ARRAY, TYPE_USER } from "./metadata";
import { findLocalIndex, findGlobalIndex } from "./introspection";

export const getMetaType = (ctx: Context, token: TokenType): MetadataType => {
  const localIndex = findLocalIndex(ctx, token);
  const globalIndex = findGlobalIndex(ctx, token);

  // Set the target variable
  let targetNode = null;
  if (localIndex > -1) {
    targetNode = ctx.func.locals[localIndex];
  } else {
    targetNode = ctx.globals[globalIndex];
  }

  // Don't allow unknown variables
  if (targetNode == null) {
    throw ctx.syntaxError(`Undefined variable ${token.value}`);
  }

  // Get the meta-type of our target, it should be either an array or a user-defined
  // object type. These types are indexable.
  const metaType =
    metadata.get(TYPE_USER, targetNode) || metadata.get(TYPE_ARRAY, targetNode);

  // Don't allow non-indexable variables with subscripts
  if (metaType == null) {
    throw ctx.syntaxError(
      `Array subscript on a non-array variable ${token.value}`
    );
  }

  return metaType;
};

// This is shared logic across different memory-store/load operations
//
// Generator is expecting an integer offset for the offset node and we are going to
// enforce this contract here.
export const patchStringSubscript = (
  ctx: Context,
  metaType: MetadataType,
  params: NodeType[]
): NodeType[] => {
  if (metaType.type === TYPE_USER && params[1].Type === Syntax.StringLiteral) {
    const metaObject = metadata.get(TYPE_OBJECT, metaType.payload);
    invariant(metaObject, `Undefined object properties`);
    const { payload: byteOffsetsByKey } = metaObject;
    const { value: key } = params[1];
    const absoluteByteOffset = byteOffsetsByKey[key];
    return [
      params[0],
      ctx.makeNode({ value: absoluteByteOffset }, Syntax.Constant)
    ];
  }
  return params;
};

export default function arraySubscript(ctx: Context): NodeType {
  const node = ctx.startNode();
  const metaType = getMetaType(ctx, ctx.token);

  node.id = ctx.expect(null, Syntax.Identifier).value;
  ctx.expect(["["]);

  const expr = expression(ctx);
  expr.params = patchStringSubscript(ctx, metaType, expr.params);
  node.params.push(expr);

  return ctx.endNode(node, Syntax.ArraySubscript);
}
