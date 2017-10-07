// @flow
import Context from "./context";
import Syntax from "../Syntax";
import expression from "./expression";
import type { Node } from "../flow/types";

const arraySubscript = (ctx: Context): Node => {
  const node = ctx.startNode();
  node.id = ctx.expect(null, Syntax.Identifier).value;

  ctx.expect(["["]);
  node.params.push(expression(ctx));

  return ctx.endNode(node, Syntax.ArraySubscript);
};

export default arraySubscript;
