// @flow
import curry from "curry";
import Syntax from "../Syntax";
import mapNode from "../utils/map-node";
import {
  FUNCTION_INDEX,
  TYPE_INDEX,
  TYPE_CONST,
  GLOBAL_INDEX,
} from "./metadata";

export const mapImport = curry((options, node, _) =>
  mapNode({
    [Syntax.Pair]: (pairNode, __) => {
      const { types, functions, globals } = options;
      const [identifierNode, typeNode] = pairNode.params;

      if (types[typeNode.value] != null) {
        // crate a new type
        const functionIndex = Object.keys(functions).length;
        const typeIndex = Object.keys(types).indexOf(typeNode.value);
        const functionNode = {
          ...identifierNode,
          id: identifierNode.value,
          type: types[typeNode.value].type,
          meta: {
            [FUNCTION_INDEX]: functionIndex,
            [TYPE_INDEX]: typeIndex,
          },
        };
        functions[identifierNode.value] = functionNode;
        return {
          ...pairNode,
          params: [functionNode, types[typeNode.value]],
        };
      }

      if (typeNode.type !== "Table" && typeNode.type !== "Memory") {
        const index = Object.keys(globals).length;
        globals[identifierNode.value] = {
          ...identifierNode,
          meta: { [GLOBAL_INDEX]: index, [TYPE_CONST]: true },
          type: typeNode.type,
        };
      }

      return pairNode;
    },
  })(node)
);
