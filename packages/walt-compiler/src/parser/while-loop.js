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

  const params = [ctx.makeNode({}, Syntax.Noop), expression(ctx, "i32")];

  ctx.expect([")"]);
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

export default whileLoop;
