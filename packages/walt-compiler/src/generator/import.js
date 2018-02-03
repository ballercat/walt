// @flow
import Syntax from "../Syntax";
import walkNode from "../utils/walk-node";
import {
  EXTERN_FUNCTION,
  EXTERN_MEMORY,
  EXTERN_GLOBAL,
  EXTERN_TABLE,
} from "../emitter/external_kind";
import { get, TYPE_INDEX } from "../semantics/metadata";
import type { IntermediateImportType, NodeType } from "./flow/types";

export const getKindConstant = (value: string) => {
  switch (value) {
    case "Memory":
      return EXTERN_MEMORY;
    case "Table":
      return EXTERN_TABLE;
    case "i32":
    case "f32":
    case "i64":
    case "f64":
      return EXTERN_GLOBAL;
    default:
      return EXTERN_FUNCTION;
  }
};

export default function generateImportFromNode(
  node: NodeType
): IntermediateImportType[] {
  const [importsNode, moduleStringLiteralNode] = node.params;
  const { value: module } = moduleStringLiteralNode;
  const imports: IntermediateImportType[] = [];

  // Look for Pair Types, encode them into imports array
  walkNode({
    [Syntax.Pair]: pairNode => {
      const [fieldIdentifierNode, typeOrIdentifierNode] = pairNode.params;
      const { value: field } = fieldIdentifierNode;
      const { value: importTypeValue } = typeOrIdentifierNode;
      const kind = getKindConstant(importTypeValue);
      const typeIndex = (() => {
        const typeIndexMeta = get(TYPE_INDEX, typeOrIdentifierNode);
        if (typeIndexMeta) {
          return typeIndexMeta.payload;
        }
        return null;
      })();

      imports.push({
        module,
        field,
        global: kind === EXTERN_GLOBAL,
        kind,
        typeIndex,
      });
    },
  })(importsNode);

  return imports;
}
