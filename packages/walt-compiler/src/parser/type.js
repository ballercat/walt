// @flow
import Syntax from "../Syntax";
import type Context from "./context";
import expression from "./expression";
import type { NodeType } from "../flow/types";

export default function typeParser(ctx: Context): NodeType {
  const node: NodeType = ctx.startNode();
  ctx.eat(["type"]);

  const value = ctx.expect(null, Syntax.Identifier).value;
  ctx.expect(["="]);

  // Quick way to figure out if we are looking at an object to follow or a function definition.
  const isObjectType = ctx.token.value === "{";

  // All typedefs should be valid expressions
  const params = [expression(ctx)];

  if (isObjectType) {
    return ctx.endNode(
      {
        ...node,
        value,
        params,
        type: "i32",
      },
      Syntax.Struct
    );
  }
  const resultNode = params[0].params[1] || params[0].params[0];

  return ctx.endNode(
    { ...node, value, params, type: resultNode.type },
    Syntax.Typedef
  );
}
