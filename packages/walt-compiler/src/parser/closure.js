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
  const [resultNode] = operands.splice(-1);
  const maybeResult = block || resultNode;

  const result = {
    ...maybeResult,
    type: maybeResult.type || "void",
    meta: [],
    value: "FUNCTION_RESULT",
    Type: Syntax.FunctionResult,
  };

  const func = {
    ...block,
    Type: Syntax.FunctionDeclaration,
    params: [
      {
        ...resultNode,
        params: (() => {
          if (resultNode && resultNode.Type === Syntax.Sequence) {
            return resultNode.params;
          }
          if (block.Type !== Syntax.Block) {
            return [{ ...result, Type: Syntax.Type }];
          }
          return [];
        })(),
        meta: [],
        range: result.range,
        value: "FUNCTION_ARGUMENTS",
        Type: Syntax.FunctionArguments,
      },
      { ...result, params: [] },
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
