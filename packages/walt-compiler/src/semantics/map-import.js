// @flow
import curry from "curry";
import Syntax from "../Syntax";
import mapNode from "../utils/map-node";
import {
  funcIndex as setMetaFunctionIndex,
  typeIndex as setMetaTypeIndex,
} from "./metadata";

export const mapImport = curry((options, node, _) =>
  mapNode({
    [Syntax.Pair]: pairNode => {
      const { types, functions } = options;
      const [identifierNode, typeNode] = pairNode.params;

      if (types[typeNode.value] != null) {
        // crate a new type
        const functionIndex = Object.keys(functions).length;
        const typeIndex = Object.keys(types).indexOf(typeNode.value);
        const functionNode = {
          ...identifierNode,
          id: identifierNode.value,
          type: types[typeNode.value].type,
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
  })(node)
);
