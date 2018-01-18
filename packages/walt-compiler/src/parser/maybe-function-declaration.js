// @flow
import Syntax from "../Syntax";
import statement from "./statement";
import declaration from "./declaration";
import expression from "./expression";
import type { NodeType } from "../flow/types";
import type Context from "./context";

export const parseArguments = (ctx: Context): NodeType => {
  ctx.expect(["("]);
  const argumentsNode = ctx.makeNode(
    {
      params: [expression(ctx)],
      value: "FUNCTION_ARGUMENTS",
    },
    Syntax.FunctionArguments
  );
  ctx.expect([")"]);
  return argumentsNode;
};

export const parseFunctionResult = (ctx: Context): NodeType => {
  const baseNode: NodeType = ctx.startNode();
  if (ctx.eat([":"])) {
    if (ctx.stream.peek().value === "<") {
      const typedef = ctx.endNode(ctx.startNode(), Syntax.Identifier);
      ctx.eat(null, Syntax.Identifier);
      ctx.eat(["<"]);
      ctx.expect([">"]);
      ctx.eat(null, Syntax.Identifier);
      return ctx.endNode(
        {
          ...baseNode,
          type: typedef.value + "<>",
          value: typedef.value,
        },
        Syntax.FunctionResult
      );
    }
    return ctx.endNode(
      {
        ...baseNode,
        type: (() => {
          const value = ctx.token.value;
          if (ctx.eat(null, Syntax.Type)) {
            return value === "void" ? null : value;
          }

          if (ctx.eat(null, Syntax.Identifier)) {
            return "i32";
          }

          return "i32";
        })(),
      },
      Syntax.FunctionResult
    );
  }

  return ctx.endNode(
    {
      ...baseNode,
      value: "FUNCTION_RESULT",
    },
    Syntax.FunctionResult
  );
};

export default function maybeFunctionDeclaration(ctx: Context): NodeType {
  if (!ctx.eat(["function"])) {
    return declaration(ctx);
  }

  const node = ctx.startNode();
  const value = ctx.expect(null, Syntax.Identifier).value;
  const argumentsNode = parseArguments(ctx);
  const resultNode = parseFunctionResult(ctx);

  ctx.expect(["{"]);
  const statements = [];
  while (ctx.token && ctx.token.value !== "}") {
    const stmt = statement(ctx);
    if (stmt) {
      statements.push(stmt);
    }
  }
  ctx.expect(["}"]);

  return ctx.endNode(
    {
      ...node,
      value,
      params: [argumentsNode, resultNode, ...statements],
    },
    Syntax.FunctionDeclaration
  );
}
