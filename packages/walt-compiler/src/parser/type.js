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

  // Regular function type definition
  if (ctx.eat(["("])) {
    const params = [];
    // Arguments are optional
    const args = expression(ctx);
    if (args != null) {
      params.push({
        ...args,
        value: "FUNCTION_ARGUMENTS",
        Type: Syntax.FunctionArguments,
        params: [args],
      });
    } else {
      params.push({
        ...node,
        value: "FUNCTION_ARGUMENTS",
        Type: Syntax.FunctionArguments,
        params: [],
      });
    }

    ctx.expect([")"]);
    ctx.expect(["=>"]);
    // Result is not optional
    const result = {
      ...expression(ctx),
      value: "FUNCTION_RESULT",
      Type: Syntax.FunctionResult,
    };
    return ctx.endNode(
      {
        ...node,
        value,
        type: result.type,
        params: [...params, result],
      },
      Syntax.Typedef
    );
  }

  // Struct type definition
  return ctx.endNode(
    {
      ...node,
      value,
      params: [expression(ctx)],
      type: "i32",
    },
    Syntax.Struct
  );
}
