// @flow
import Syntax from "../Syntax";
import expression from "./expression";
import statement from "./statement";
import type Context from "./context";
import type { NodeType } from "../flow/types";

const paramList = (ctx: Context): NodeType[] => {
  ctx.expect(["("]);
  const params: NodeType[] = [];
  let node = null;
  while (ctx.token.value && ctx.token.value !== ")") {
    node = expression(ctx, "i32");
    if (node) {
      params.push(node);
      ctx.eat([";"]);
    }
  }

  ctx.expect([")"]);
  return params;
};

const forLoop = (ctx: Context): NodeType => {
  const node = ctx.startNode();
  ctx.eat(["for"]);

  const params = paramList(ctx);

  ctx.expect(["{"]);

  let stmt = null;
  while (ctx.token && ctx.token.value !== "}") {
    stmt = statement(ctx);
    if (stmt) {
      params.push(stmt);
    }
  }
  ctx.expect(["}"]);

  return ctx.endNode(
    {
      ...node,
      params,
    },
    Syntax.Loop
  );
};

export default forLoop;
