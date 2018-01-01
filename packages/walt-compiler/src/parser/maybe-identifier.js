// @flow
import Syntax from "../Syntax";
import type Context from "./context";
import type { NodeType } from "../flow/types";

// Maybe identifier, maybe function call
const maybeIdentifier = (ctx: Context): NodeType => {
  // TODO: Instead of peeking, eat the "(" and return an operator!
  const Type =
    ctx.stream.peek().value === "("
      ? Syntax.FunctionIdentifier
      : Syntax.Identifier;
  return ctx.endNode(ctx.startNode(), Type);
};

export default maybeIdentifier;
