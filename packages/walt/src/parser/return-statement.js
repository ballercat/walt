// @flow
import Syntax from "../Syntax";
import expression from "./expression";
import Context from "./context";

const returnStatement = (ctx: Context) => {
  const node = ctx.startNode();
  if (!ctx.func) {
    throw ctx.syntaxError("Return statement is only valid inside a function");
  }
  ctx.expect(["return"]);
  const expr = expression(ctx);

  // For generator to emit correct consant they must have a correct type
  // in the syntax it's not necessary to define the type since we can infer it here
  if (
    expr.type &&
    ctx.func &&
    ctx.func.type != null &&
    ctx.func.type !== expr.type
  ) {
    throw ctx.syntaxError(
      `Return type mismatch expected ${ctx.func.type}, got ${expr.type}`
    );
  } else if (!expr.type && ctx.func && ctx.func.type) {
    expr.type = ctx.func.type;
  }

  node.params.push(expr);

  return ctx.endNode(node, Syntax.ReturnStatement);
};

export default returnStatement;
