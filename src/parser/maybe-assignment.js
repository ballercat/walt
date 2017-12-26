// @flow
import memoryStore from "./memory-store";
import expression from "./expression";
import type Context from "./context";
import type { NodeType } from "../flow/types";

// It is easier to parse assignment this way as we need to maintain a valid type
// through out the right-hand side of the expression
function maybeAssignment(ctx: Context): NodeType {
  const nextValue = ctx.stream.peek().value;
  if (nextValue === "[" || nextValue === ".") {
    return memoryStore(ctx);
  }

  return expression(ctx);
}

export default maybeAssignment;
