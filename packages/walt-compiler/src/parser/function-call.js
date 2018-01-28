// @flow
import Syntax from "../Syntax";
import type Context from "./context";
import type { TokenType, NodeType } from "../flow/types";

const functionCall = (ctx: Context, op: TokenType, operands: NodeType[]) => {
  const node = ctx.startNode(op);
  // If last operand is a sequence that means we have function arguments
  const maybeArguments = operands[operands.length - 1];
  if (maybeArguments && maybeArguments.Type !== Syntax.FunctionIdentifier) {
    node.params = operands.splice(-1);
  }
  const identifier = operands.splice(-1)[0];

  return ctx.endNode(
    {
      ...node,
      value: identifier.value,
    },
    Syntax.FunctionCall
  );
};

export default functionCall;
