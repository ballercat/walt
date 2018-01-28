// @flow
import Syntax from "../Syntax";
import type Context from "./context";
import expression from "./expression";
import generateError from "../utils/generate-error";
import { closureType } from "../semantics/metadata";
import type { NodeType } from "../flow/types";

export default function typeParser(ctx: Context): NodeType {
  const node: NodeType = ctx.startNode();
  ctx.eat(["type"]);
  const meta = [];
  const isClosure = ctx.eat(["lambda"]);
  if (isClosure) {
    meta.push(closureType(true));
  }

  const value = ctx.expect(null, Syntax.Identifier).value;
  ctx.expect(["="]);

  // Regular function type definition
  if (ctx.eat(["("])) {
    // Arguments are optional
    const argsExpression = expression(ctx);
    const args =
      argsExpression != null
        ? {
            ...argsExpression,
            value: "FUNCTION_ARGUMENTS",
            Type: Syntax.FunctionArguments,
            params: [argsExpression],
          }
        : {
            ...node,
            value: "FUNCTION_ARGUMENTS",
            Type: Syntax.FunctionArguments,
            params: [],
          };

    if (isClosure) {
      args.params = [
        { ...args, params: [], type: "i32", value: "i32", Type: Syntax.Type },
        ...args.params,
      ];
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
        meta,
        value,
        type: result.type,
        params: [args, result],
      },
      Syntax.Typedef
    );
  }

  // Sanity check definition
  if (ctx.token.value !== "{") {
    const start = node.range[0];
    const end = ctx.token.end;
    throw new SyntaxError(
      generateError(
        "Invalid type syntax",
        "A function type must be of form (<type>, ...) <type>",
        { start, end },
        "",
        ""
      )
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
