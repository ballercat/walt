// @flow
import Syntax from "../Syntax";
import Context from "./context";
import statement from "./statement";
import expression from "./expression";

const ifThenElse = (ctx: Context) => {
  const node = {
    ...ctx.startNode(ctx.token),
    then: [],
    else: []
  };
  ctx.eat(["if"]);
  // First operand is the expression
  ctx.expect(["("]);
  node.expr = expression(ctx, "i32");
  ctx.expect([")"]);

  // maybe a curly brace or not
  if (ctx.eat(["{"])) {
    let stmt = null;
    while (ctx.token && ctx.token.value !== "}") {
      stmt = statement(ctx);
      if (stmt) node.then.push(stmt);
    }

    ctx.expect(["}"]);

    if (ctx.eat(["else"])) {
      ctx.expect(["{"]);
      while (ctx.token && ctx.token.value !== "}") {
        stmt = statement(ctx);
        if (stmt) node.else.push(stmt);
      }
      ctx.expect(["}"]);
    }
  } else {
    // parse single statements only
    node.then.push(statement(ctx));
    ctx.expect([";"]);
    if (ctx.eat(["else"])) node.else.push(statement(ctx));
  }

  return ctx.endNode(node, Syntax.IfThenElse);
};

export default ifThenElse;
