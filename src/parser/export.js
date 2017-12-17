import Syntax from "../Syntax";
import generateExport from "../generator/export";
import maybeFunctionDeclaration from "./maybe-function-declaration";

const _export = ctx => {
  const node = ctx.startNode();
  ctx.eat(["export"]);

  const decl = maybeFunctionDeclaration(ctx);
  if (!decl.func) {
    if (decl.params.length === 0)      {
throw ctx.syntaxError("Exports must have a value");
}
  }

  ctx.Program.Exports.push(generateExport(decl));
  node.decl = decl;

  ctx.endNode(node, Syntax.Export);

  return node;
};

export default _export;
