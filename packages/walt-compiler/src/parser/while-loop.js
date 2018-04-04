// @flow
import Syntax from "../Syntax";
import type Context from "./context";
import expression from "./expression";
import statement from "./statement";
import type { NodeType } from "../flow/types";

const whileLoop = (ctx: Context): NodeType => {
  const node = ctx.startNode();
  ctx.eat(["while"]);
  ctx.expect(["("]);

  const initializer = ctx.makeNode({}, Syntax.Noop);
  const condition = expression(ctx);
  const body = [];

  ctx.expect([")"]);
  ctx.expect(["{"]);

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
      params: [initializer, condition, ...body],
    },
    Syntax.Loop
  );
};

export default whileLoop;
