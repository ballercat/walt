//@flow
import Syntax from "../Syntax";
import type Context from "./context";
import type { Node } from "../flow/types";

export function accessIdentifier(ctx: Context): Node {
  const node = ctx.startNode();
  // We're removing first character which is access dot operator
  node.value = ctx.token.value.substring(1, ctx.token.value.length);
  return ctx.endNode(node, Syntax.StringLiteral);
}

export default accessIdentifier;
