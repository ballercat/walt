// @flow
import Syntax from "../Syntax";
import expression from "./expression";
import Context from "./context";

const returnStatement = (ctx: Context) => {
  const node = ctx.startNode();
  ctx.expect(["return"]);
  const expr = expression(ctx);

  node.params.push(expr);

  return ctx.endNode(node, Syntax.ReturnStatement);
};

export default returnStatement;
