// @flow
import Syntax from "../Syntax";
import maybeFunctionDeclaration from "./maybe-function-declaration";
import type { NodeType } from "../flow/types";
import type Context from "./context";

export default function _export(ctx: Context): NodeType {
  const node = ctx.startNode();
  ctx.eat(["export"]);

  const decl = maybeFunctionDeclaration(ctx);
  if (decl.Type === Syntax.Declaration && decl.params.length < 1) {
    throw ctx.syntaxError("Scalar exports must be initialized with a value");
  }
  node.params.push(decl);

  return ctx.endNode(node, Syntax.Export);
}
