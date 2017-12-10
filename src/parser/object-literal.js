// @flow
import Syntax from "../Syntax";
import type Context from "./context";
import expression from "./expression";
import type { Node } from "../flow/types";

const field = (ctx: Context): Node => {
  const node = ctx.startNode();
  node.id = ctx.expect(null, Syntax.StringLiteral).value;
  ctx.expect([":"]);
  node.params = [expression(ctx)];
  return ctx.endNode(node, Syntax.ObjectField);
};

const fieldList = (ctx: Context): Node[] => {
  const fields: Node[] = [];
  while (ctx.token && ctx.token.value !== "}") {
    const f: Node = field(ctx);
    if (f) {
      fields.push(f);
      ctx.eat([","]);
    }
  }
  ctx.expect(["}"]);

  return fields;
};

const objectLiteral = (ctx: Context): Node => {
  const node = ctx.startNode();
  ctx.expect(["{"]);

  node.params = fieldList(ctx);

  return ctx.endNode(node, Syntax.ObjectLiteral);
};

export default objectLiteral;
