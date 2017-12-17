// @flow
import type Context from "./context";
import Syntax from "../Syntax";
import type { NodeType } from "../flow/types";

export default function builtInType (ctx: Context): NodeType {
  return ctx.makeNode(
    { value: ctx.token.value, type: ctx.token.value },
    Syntax.Type
  );
}
