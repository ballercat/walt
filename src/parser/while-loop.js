//@flow
import Syntax from "../Syntax";
import type Context from "./context";
import expression from "./expression";
import statement from "./statement";
import type { Node } from "../flow/types";

const whileLoop = (ctx: Context): Node => {
  const node = ctx.startNode();
  ctx.eat(["while"]);
  ctx.expect(["("]);

  node.params = [ctx.makeNode({}, Syntax.Noop), expression(ctx, "i32")];

  ctx.expect([")"]);
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
      body
    },
    Syntax.Loop
  );
};

export default whileLoop;
