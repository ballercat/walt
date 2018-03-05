// @flow
import type Context from "./context";
import Syntax from "../Syntax";
import expression from "../parser/expression";
import type { NodeType } from "../flow/types";

export default function builtInType(ctx: Context): NodeType {
  if (ctx.token.value === "Memory" && ctx.stream.peek().value === "<") {
    ctx.eat(["Memory"]);
    ctx.eat(["<"]);
    ctx.eat(["{"]);
    const node = ctx.makeNode(
      {
        value: "Memory",
        type: "Memory",
        params: [expression(ctx)],
      },
      Syntax.Type
    );
    ctx.eat(["}"]);
    return node;
  }

  return ctx.makeNode(
    { value: ctx.token.value, type: ctx.token.value },
    Syntax.Type
  );
}
