// @flow
import Syntax from "../Syntax";
import Context from "./context";
import expression from "./expression";
import type { Node } from "../flow/types";

// Parse the expression and set the appropriate Type for the egenerator
const memoryStore = (ctx: Context): Node => {
  const node = expression(ctx, "i32");
  return ctx.endNode(node, Syntax.MemoryAssignment);
};

export default memoryStore;
