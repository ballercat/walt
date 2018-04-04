// @flow
import Syntax from "../Syntax";
import type Context from "./context";
import type { NodeType } from "../flow/types";

// Note: string literal does not increment the token.
function stringLiteral(ctx: Context): NodeType {
  const node = ctx.startNode();
  node.value = ctx.token.value.substring(1, ctx.token.value.length - 1);
  const Type =
    ctx.token.value[0] === "'" && Array.from(node.value).length === 1
      ? Syntax.CharacterLiteral
      : Syntax.StringLiteral;
  return ctx.endNode(node, Type);
}

export default stringLiteral;
