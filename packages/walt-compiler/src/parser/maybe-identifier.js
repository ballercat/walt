// @flow
import Syntax from "../Syntax";
import expression from "./expression";
import type Context from "./context";
import type { NodeType } from "../flow/types";

// Maybe identifier, maybe function call
const maybeIdentifier = (ctx: Context): NodeType => {
  const node = ctx.startNode();
  ctx.eat(null, Syntax.Identifier);

  if (ctx.eat(["("])) {
    const params = [expression(ctx)];
    const functionCall = ctx.endNode(
      {
        ...node,
        params: params.filter(Boolean),
      },
      Syntax.FunctionCall
    );
    ctx.expect([")"]);
    return functionCall;
  }

  return ctx.endNode(node, Syntax.Identifier);
};

export default maybeIdentifier;
