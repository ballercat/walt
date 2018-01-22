// @flow
import Syntax from "../Syntax";
import type Context from "./context";
import type { NodeType, TokenType } from "../flow/types";

export default function parseClosure(
  ctx: Context,
  op: TokenType,
  operands: NodeType[]
): NodeType {
  debugger;
  const block = operands.pop();
  const resultNode = operands.pop();
  const args = operands.pop();

  const func = {
    ...block,
    Type: Syntax.FunctionDeclaration,
    params: [
      {
        params: [],
        ...args,
        meta: [],
        value: "FUNCTION_ARGUMENTS",
        Type: Syntax.FunctionArguments,
      },
      {
        params: [],
        meta: [],
        ...resultNode,
        Type: Syntax.FunctionResult,
        value: "FUNCTION_RESULT",
      },
    ],
  };

  if (block.Type === Syntax.Block) {
    func.params.push(block);
  }

  return {
    ...op,
    type: "i32",
    range: [ctx.token.start, ctx.token.end],
    meta: [],
    params: [func],
    Type: Syntax.Closure,
  };
}
