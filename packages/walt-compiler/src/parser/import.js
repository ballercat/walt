// @flow
import Syntax from "../Syntax";
import { handleUndefined } from "../utils/generate-error";
import expression from "./expression";

import type Context from "./context";
import type { NodeType } from "../flow/types";

export default function parseImport(ctx: Context): NodeType {
  const baseNode = ctx.startNode();
  ctx.eat(["import"]);

  if (!ctx.eat(["{"])) {
    throw ctx.syntaxError("expected {");
  }

  ctx.handleUndefinedIdentifier = () => {};
  const fields = expression(ctx);
  ctx.handleUndefinedIdentifier = handleUndefined(ctx);

  ctx.expect(["}"]);
  ctx.expect(["from"]);

  const module = expression(ctx);

  return ctx.endNode({ ...baseNode, params: [fields, module] }, Syntax.Import);
}
