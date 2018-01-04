// @flow
import Syntax from "../Syntax";
import type { NodeType } from "../flow/types";
import type Context from "./context";

export default function sizeof(ctx: Context): NodeType {
  const node = ctx.startNode();

  ctx.eat(["sizeof"]);
  ctx.eat(["("]);

  const value = ctx.token.value;
  if (!ctx.eat(null, Syntax.Identifier)) {
    ctx.eat(null, Syntax.Type);
  }
  // All sizes are 32-bit
  node.type = "i32";

  ctx.eat([")"]);

  return ctx.endNode({ ...node, value }, Syntax.Sizeof);
}
