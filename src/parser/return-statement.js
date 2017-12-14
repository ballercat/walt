import Syntax from "../Syntax";
import expression from "./expression";

const returnStatement = ctx => {
  const node = ctx.startNode();
  if (!ctx.func)
    throw ctx.syntaxError("Return statement is only valid inside a function");
  ctx.expect(["return"]);
  const expr = expression(ctx);

  // For generator to emit correct consant they must have a correct type
  // in the syntax it's not necessary to define the type since we can infer it here
  if (expr.type && ctx.func.result !== expr.type)
    throw ctx.syntaxError(
      `Return type mismatch expected ${ctx.func.result}, got ${expr.type}`
    );
  else if (!expr.type && ctx.func.result) expr.type = ctx.func.result;

  node.params.push(expr);

  return ctx.endNode(node, Syntax.ReturnStatement);
};

export default returnStatement;
