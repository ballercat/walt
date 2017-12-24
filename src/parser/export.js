// @flow
import Syntax from "../Syntax";
import generateExport from "../generator/export";
import maybeFunctionDeclaration from "./maybe-function-declaration";
import type { NodeType } from "../flow/types";
import type Context from "./context";

export default function _export(ctx: Context): NodeType {
  const node = ctx.startNode();
  ctx.eat(["export"]);

  const decl = maybeFunctionDeclaration(ctx);
  if (!decl.func) {
    if (decl.params.length === 0) {
      throw ctx.syntaxError("Exports must have a value");
    }
  }

  ctx.Program.Exports.push(generateExport(decl));
  node.params.push(decl);

  return ctx.endNode(node, Syntax.Export);
}
