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

  node.params = paramList(ctx);

  ctx.expect(["{"]);

  const body = [];
  let stmt = null;
  while (ctx.token && ctx.token.value !== "}") {
    stmt = statement(ctx);
    if (stmt) {
      body.push(stmt);
    }
  }
  ctx.expect(["}"]);

  return ctx.endNode(
    {
      ...node,
      body,
    },
    Syntax.Loop
  );
};

export default forLoop;
