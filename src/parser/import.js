// @flow
import Syntax from "../Syntax";
import { handleUndefined } from "../utils/generate-error";
import mapNode from "../utils/map-node";
import generateType from "../generator/type";
import generateImport, { getKindConstant } from "../generator/import";
import expression from "./expression";
import { EXTERN_FUNCTION } from "../emitter/external_kind";
import { make, FUNCTION_INDEX, typeIndex as setTypeIndex } from "./metadata";

import type Context from "./context";
import type { NodeType } from "../flow/types";

export const hoistTypeMaybe = (
  ctx: Context,
  typeNode: NodeType,
  functionNode: NodeType
): number => {
  const typeIndex = ctx.Program.Types.findIndex(
    ({ id }) => id === typeNode.value
  );
  if (typeIndex < 0) {
    const hoistIndex = ctx.Program.Types.length;
    ctx.Program.Types.push({
      id: typeNode.value,
      params: [],
      // When we DO define a type for it later, patch the dummy type
      hoist: (node: NodeType) => {
        functionNode.type = node.type;
        ctx.Program.Types[hoistIndex] = generateType(node);
      },
    });

    return hoistIndex;
  }
  return typeIndex;
};

export const patchTypeIndexes = (ctx: Context, node: NodeType): NodeType => {
  return mapNode({
    [Syntax.Pair]: pairNode => {
      const [identifierNode, typeNode] = pairNode.params;
      if (getKindConstant(typeNode.value) === EXTERN_FUNCTION) {
        // crate a new type
        const functionIndex = ctx.Program.Functions.length;
        const functionIndexMeta = make(
          {
            functionIndex,
          },
          FUNCTION_INDEX
        );
        const functionNode = {
          ...identifierNode,
          id: identifierNode.value,
          meta: [functionIndexMeta],
        };
        const typeIndexMeta = setTypeIndex(
          hoistTypeMaybe(ctx, typeNode, functionNode)
        );
        ctx.Program.Functions.push(null);
        ctx.functions.push(functionNode);
        return {
          ...pairNode,
          params: [
            functionNode,
            {
              ...typeNode,
              meta: [typeIndexMeta],
            },
          ],
        };
      }

      return pairNode;
    },
  })(node);
};

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

  const node = patchTypeIndexes(ctx, { ...baseNode, params: [fields, module] });
  ctx.Program.Imports.push.apply(ctx.Program.Imports, generateImport(node));

  return ctx.endNode(node, Syntax.Import);
}
