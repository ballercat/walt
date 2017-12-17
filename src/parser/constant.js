// @flow
import type Context from "./context";
import Syntax from "../Syntax";

export default function parseConstant (ctx: Context) {
  const node = ctx.startNode();
  const value = ctx.token.value;
  const type = value.toString().indexOf(".") !== -1 ? "f32" : "i32";
  return ctx.endNode({ ...node, type, value }, Syntax.Constant);
}
