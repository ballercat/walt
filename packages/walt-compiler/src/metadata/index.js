// @flow
// import invariant from "invariant";
import Syntax from "../Syntax";
import walkNode from "../utils/walk-node";
import mapNode from "../utils/map-node";
import mapFunctionNode from "./map-function";
import mapStructNode from "./map-struct";
import {
  constant as setMetaConst,
  globalIndex as setMetaGlobalIndex,
  funcIndex as setMetaFunctionIndex,
  typeIndex as setMetaTypeIndex,
} from "./metadata";

import type { NodeType } from "../flow/types";

export default function metadata(ast: NodeType): NodeType {
  const functions: { [string]: NodeType } = {};
  const globals: { [string]: NodeType } = {};
  const types: { [string]: NodeType } = {};
  const userTypes: { [string]: NodeType } = {};
  const table: { [string]: NodeType } = {};

  // Types have to be pre-parsed before the rest of the program
  walkNode({
    [Syntax.Typedef]: node => {
      types[node.value] = node;
    },
  })(ast);

  return mapNode({
    // Read Import node, attach indexes if non-scalar
    [Syntax.Import]: (node, _ignore) => {
      return mapNode({
        [Syntax.Pair]: pairNode => {
          const [identifierNode, typeNode] = pairNode.params;
          if (types[typeNode.value] != null) {
            // crate a new type
            const functionIndex = Object.keys(functions).length;
            const typeIndex = Object.keys(types).indexOf(typeNode.value);
            const functionNode = {
              ...identifierNode,
              id: identifierNode.value,
              meta: [
                setMetaFunctionIndex(functionIndex),
                setMetaTypeIndex(typeIndex),
              ],
            };
            functions[identifierNode.value] = functionNode;
            return {
              ...pairNode,
              params: [functionNode, types[typeNode.value]],
            };
          }

          return pairNode;
        },
      })(node);
    },
    [Syntax.Declaration]: node => {
      if (node.type !== "Table" && node.type !== "Memory") {
        const globalIndex = Object.keys(globals).length;
        const meta = [setMetaGlobalIndex(globalIndex)];
        globals[node.value] = { ...node, meta };

        return globals[node.value];
      }
      return { ...node, meta: [setMetaGlobalIndex(-1)] };
    },
    [Syntax.ImmutableDeclaration]: node => {
      if (node.type !== "Table" && node.type !== "Memory") {
        const globalIndex = Object.keys(globals).length;
        const meta = [setMetaGlobalIndex(globalIndex), setMetaConst()];
        globals[node.value] = { ...node, meta, Type: Syntax.Declaration };

        return globals[node.value];
      }
      return { ...node, meta: [setMetaGlobalIndex(-1)] };
    },
    [Syntax.Struct]: mapStructNode({ userTypes }),
    [Syntax.FunctionDeclaration]: mapFunctionNode({
      types,
      globals,
      functions,
      userTypes,
      table,
    }),
  })(ast);
}
