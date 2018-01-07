// @flow
import Syntax from "../Syntax";
import type Context from "./context";
import type { NodeType, TokenType } from "../flow/types";

export default function parseClosure(
  ctx: Context,
  op: TokenType,
  operands: NodeType[]
): NodeType {
  return {
    ...op,
    type: "i32",
    range: [ctx.token.start, ctx.token.end],
    meta: [],
    params: operands.splice(-3),
    Type: Syntax.Closure,
  };
}
