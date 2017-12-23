// @flow
import invariant from "invariant";
import Syntax from "../Syntax";
import { get, TYPE_USER, OBJECT_SIZE } from "./metadata";
import { findLocalVariable, findGlobalIndex } from "./introspection";
import { nodeMetaType } from "./array-subscript";

import type { NodeType } from "../flow/types";
import type Context from "./context";

export const variableSize = (targetNode: NodeType): string => {
  const metaType = nodeMetaType(targetNode);

  if (metaType != null) {
    invariant(
      metaType.type === TYPE_USER,
      `sizeof is not-supported on type supplied ${metaType.type}`,
    );
    const metaSize = get(OBJECT_SIZE, metaType.payload);

    invariant(metaSize, "Object size information is missing");

    return metaSize.payload;
  }

  switch (targetNode.type) {
    case "i32":
    case "f32":
      return "4";
    case "i64":
    case "f64":
      return "8";
    default:
      return "4";
  }
};

export default function sizeof(ctx: Context): NodeType {
  const node = ctx.startNode();

  ctx.eat(["sizeof"]);
  ctx.eat(["("]);

  const local = ctx.func ? findLocalVariable(ctx.func, ctx.token) : null;
  const globalIndex = findGlobalIndex(ctx, ctx.token);
  const targetNode = local ? local.node : ctx.globals[globalIndex];

  // Don't allow unknown variables
  if (targetNode == null) {
    throw ctx.syntaxError(`Undefined variable ${ctx.token.value}`);
  }

  node.value = variableSize(targetNode);
  // All sizes are 32-bit
  node.type = "i32";

  ctx.eat([")"]);

  return ctx.endNode(node, Syntax.Constant);
}
