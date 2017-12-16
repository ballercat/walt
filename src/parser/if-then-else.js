// @flow
import Syntax from "../Syntax";
import type Context from "./context";
import statement from "./statement";
import expression from "./expression";

// push statement based on then/else branch
const pushStatement = (node, isThenBranch, stmt) => {
  if (!stmt) return;
  if (isThenBranch) return node.then.push(stmt);
  return node.else.push(stmt);
}

const doIfExpression = (node, ctx) => {
  ctx.expect(["("]);
  node.expr = expression(ctx, "i32");
  ctx.expect([")"]);
}

// push statements while taking into consideration having curly braces or not
const doStatement = (node, isThenBranch, ctx) => {
  if (ctx.eat(["{"])) {
    while (ctx.token && ctx.token.value !== "}") {
      pushStatement(node, isThenBranch, statement(ctx));
    }
    ctx.expect(["}"]);
  } else {
    pushStatement(node, isThenBranch, statement(ctx));
    ctx.expect([";"]);
  }
}

const ifThenElse = (ctx: Context) => {
  const node = {
    ...ctx.startNode(ctx.token),
    then: [],
    else: []
  };
  let isThenBranch = true;

  ctx.eat(["if"]);
  // First operand is the expression
  doIfExpression(node, ctx);
  doStatement(node, isThenBranch, ctx);

  while (ctx.eat(["else"])) {
    isThenBranch = false;
    // maybe another if statement
    if (ctx.eat(["if"])) {
      isThenBranch = true;
      doIfExpression(node, ctx);
    }
    doStatement(node, isThenBranch, ctx);
  }

  return ctx.endNode(node, Syntax.IfThenElse);
};

export default ifThenElse;
