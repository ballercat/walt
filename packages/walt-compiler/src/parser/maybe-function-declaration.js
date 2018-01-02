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
    return ctx.endNode(
      {
        ...baseNode,
        type: (() => {
          const value = ctx.token.value;
          if (ctx.eat(null, Syntax.Type)) {
            return value === "void" ? null : value;
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

export default function maybeFunctionDeclaration(ctx: Context) {
  if (!ctx.eat(["function"])) {
    return declaration(ctx);
  }

  const baseNode = ctx.startNode();
  const value = ctx.expect(null, Syntax.Identifier).value;
  const argumentsNode = parseArguments(ctx);
  const resultNode = parseFunctionResult(ctx);

  const emptyNode: NodeType = {
    ...baseNode,
    value,
    type: resultNode.type,
    params: [argumentsNode, resultNode],
  };

  ctx.expect(["{"]);
  const statements = [];
  while (ctx.token && ctx.token.value !== "}") {
    const stmt = statement(ctx);
    if (stmt) {
      statements.push(stmt);
    }
  }

  // Sanity check the return statement
  // const ret = last(statements);
  // if (ret && resultNode.type) {
  //   if (resultNode.type == null && ret.Type === Syntax.ReturnStatement) {
  //     throw ctx.syntaxError(
  //       "Unexpected return value in a function with result : void"
  //     );
  //   }
  //   if (resultNode.type != null && ret.Type !== Syntax.ReturnStatement) {
  //     throw ctx.syntaxError(
  //       "Expected a return value in a function with result : " +
  //         JSON.stringify(resultNode.type)
  //     );
  //   }
  // }

  const node = {
    ...emptyNode,
    params: [...emptyNode.params, ...statements],
  };

  ctx.expect(["}"]);

  return ctx.endNode(node, Syntax.FunctionDeclaration);
}
