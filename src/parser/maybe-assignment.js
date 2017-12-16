// @flow
import Syntax from "../Syntax";
import maybeIdentifier from "./maybe-identifier";
import memoryStore from "./memory-store";
import expression from "./expression";
import type Context from "./context";
import type { NodeType } from "../flow/types";

// It is easier to parse assignment this way as we need to maintain a valid type
// through out the right-hand side of the expression
function maybeAssignment(ctx: Context): NodeType {
  const nextValue = ctx.stream.peek().value;
  if (nextValue === "[") return memoryStore(ctx);

  const target = maybeIdentifier(ctx);
  if (target.Type === Syntax.FunctionCall) {
    return target;
  }

  return expression(ctx);
}

export default maybeAssignment;
