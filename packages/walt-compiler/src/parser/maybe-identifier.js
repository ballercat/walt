// @flow
import Syntax from "../Syntax";
import type Context from "./context";
import type { NodeType } from "../flow/types";

// Maybe identifier, maybe function call
const maybeIdentifier = (ctx: Context): NodeType => {
  // TODO: Instead of peeking, eat the "(" and return an operator!
  const nextToken = ctx.stream.peek();
  const Type =
    nextToken.value === "(" ? Syntax.FunctionIdentifier : Syntax.Identifier;
  const node = ctx.startNode();
  if (node.value === "Closure" && ctx.eat(["<"])) {
    const typedef = ctx.endNode(ctx.startNode(), Syntax.Identifier);
    ctx.expect([">"]);
    return ctx.endNode(
      {
        ...node,
        params: [typedef],
      },
      Syntax.ClosureType
    );
  }

  return ctx.endNode(node, Type);
};

export default maybeIdentifier;
