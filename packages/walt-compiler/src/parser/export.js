// @flow
import Syntax from "../Syntax";
import maybeFunctionDeclaration from "./maybe-function-declaration";
import type { NodeType } from "../flow/types";
import type Context from "./context";

export default function parseExport(ctx: Context): NodeType {
  const node = ctx.startNode();
  ctx.eat(["export"]);

  const params = [maybeFunctionDeclaration(ctx)];

  return ctx.endNode({ ...node, params }, Syntax.Export);
}
