// @flow
import Syntax from "../Syntax";
import type Context from "./context";
import type { NodeType, TokenType } from "../flow/types";

export default function parseClosure(
  ctx: Context,
  op: TokenType,
  operands: NodeType[]
): NodeType {
  const [block] = operands.splice(-1);
  const [resultNode] = operands.splice(-2);
  const [argumentsNode] = operands.splice(-3);
  // const [valueNode] = operands.splice(-4);

  const func = {
    ...block,
    Type: Syntax.FunctionDeclaration,
    params: [
      {
        params: [],
        meta: [],
        ...argumentsNode,
        value: "FUNCTION_ARGUMENTS",
        Type: Syntax.FunctionArguments,
      },
      {
        value: "FUNCTION_RESULT",
        ...(resultNode || block),
        params: [],
        meta: [],
        Type: Syntax.FunctionResult,
      },
      block,
    ],
  };

  return {
    ...op,
    type: "i32",
    range: [ctx.token.start, ctx.token.end],
    meta: [],
    params: [func],
    Type: Syntax.Closure,
  };
}
