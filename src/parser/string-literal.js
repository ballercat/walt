// @flow
import Syntax from "../Syntax";
import type Context from "./context";
import type { Node } from "../flow/types";

// Note: string literal does not increment the token.
function stringLiteral (ctx: Context): Node {
  const node = ctx.startNode();
  node.value = ctx.token.value.substring(1, ctx.token.value.length - 1);
  return ctx.endNode(node, Syntax.StringLiteral);
}

export default stringLiteral;
