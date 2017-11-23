// @flow
import Syntax from "../Syntax";
import Context from "./context";
import expression from "./expression";
import { getMetaType, patchStringSubscript } from "./array-subscript";
import type { Node } from "../flow/types";

// Parse the expression and set the appropriate Type for the generator
const memoryStore = (ctx: Context): Node => {
  const metaType = getMetaType(ctx, ctx.token);

  // Parse the assignment
  const node = expression(ctx, "i32");

  // Now, if we have a variable of a user-defined type as our target we need to
  // _fix_ the offset to be an appropriate node before the generator is involved.

  const subscript = node.params[0];
  subscript.params = patchStringSubscript(ctx, metaType, subscript.params);

  return ctx.endNode(node, Syntax.MemoryAssignment);
};

export default memoryStore;
