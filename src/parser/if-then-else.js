// @flow
import Syntax from "../Syntax";
import type Context from "./context";
import statement from "./statement";
import expression from "./expression";
import type { NodeType } from "../flow/types";

const doIfExpression = (node, ctx: Context) => {
  ctx.expect(["("]);
  node.expr = expression(ctx, "i32");
  ctx.expect([")"]);
};

// push statements while taking into consideration having brackets or not
const doStatement = (ctx: Context): NodeType[] => {
  const statements = [];
  // maybe a curly brace or not
  if (ctx.eat(["{"])) {
    while (ctx.token && ctx.token.value !== "}") {
      const stmt = statement(ctx);
      if (stmt != null) {
        statements.push(stmt);
      }
    }
    ctx.expect(["}"]);
  } else {
    const stmt = statement(ctx);
    if (stmt) {
      statements.push(stmt);
    }
    ctx.expect([";"]);
  }
  return statements.filter(stmt => stmt != null);
};

const ifThenElse = (ctx: Context) => {
  const node = {
    ...ctx.startNode(ctx.token),
    then: [],
    else: [],
  };

  ctx.eat(["if"]);
  // First operand is the expression
  doIfExpression(node, ctx);
  node.then = doStatement(ctx);

  while (ctx.eat(["else"])) {
    // maybe another if statement
    if (ctx.eat(["if"])) {
      doIfExpression(node, ctx);
      node.then = [...node.then, ...doStatement(ctx)];
    } else {
      node.else = [...node.else, ...doStatement(ctx)];
    }
  }

  return ctx.endNode(node, Syntax.IfThenElse);
};

export default ifThenElse;
